(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.OspfCostEngine=api;
})(typeof self!=='undefined'?self:this,function(){
  'use strict';
  const finite=v=>Number.isFinite(Number(v));
  const num=(v,fallback=0)=>finite(v)?Number(v):fallback;
  const positive=(v,fallback=0)=>Math.max(0,num(v,fallback));
  const integer=(v,fallback=0)=>Math.floor(num(v,fallback));
  const round=(v,d=3)=>Number(num(v).toFixed(d));
  const clamp=(v,min,max)=>Math.min(max,Math.max(min,num(v)));

  function modeName(value){return ['ceil','floor','round'].includes(value)?value:'ceil';}
  function metricFor(referenceBandwidthMbps,bandwidthMbps,mode){
    const ratio=referenceBandwidthMbps/bandwidthMbps;
    const fn=mode==='floor'?Math.floor:mode==='round'?Math.round:Math.ceil;
    return Math.min(65535,Math.max(1,fn(ratio)));
  }
  function normalizeInterface(item,index){
    const source=item||{};
    const name=String(source.name||source.label||`Interface ${index+1}`).trim()||`Interface ${index+1}`;
    const bandwidthMbps=positive(source.bandwidthMbps??source.bandwidth??source.speedMbps);
    const overrideRaw=source.metricOverride;
    const hasOverride=overrideRaw!==undefined&&overrideRaw!==null&&String(overrideRaw).trim()!=='';
    const metricOverride=hasOverride?integer(overrideRaw):null;
    return {name,bandwidthMbps,metricOverride,enabled:source.enabled!==false,description:String(source.description||'')};
  }
  function normalizePath(path,index){
    const source=path||{};
    const name=String(source.name||source.label||`Path ${index+1}`).trim()||`Path ${index+1}`;
    const interfaces=Array.isArray(source.interfaces)?source.interfaces:[];
    return {name,interfaces};
  }
  function calculate(input={}){
    const errors=[];
    const invalidType=input===null||typeof input!=='object'||Array.isArray(input);
    if(invalidType){errors.push('input_type_invalid');input={};}
    const hasReference=Object.prototype.hasOwnProperty.call(input,'referenceBandwidthMbps')||Object.prototype.hasOwnProperty.call(input,'referenceBandwidth');
    const referenceRaw=input.referenceBandwidthMbps??input.referenceBandwidth;
    const referenceBandwidthMbps=hasReference?positive(referenceRaw):100000;
    if(hasReference&&(typeof referenceRaw!=='number'||!Number.isFinite(referenceRaw)||referenceBandwidthMbps<=0)) errors.push('reference_bandwidth_invalid');
    const calculationMode=modeName(input.calculationMode);
    const rawInterfaces=Array.isArray(input.interfaces)?input.interfaces:[];
    if(rawInterfaces.length===0) errors.push('interfaces_required');
    const interfaces=rawInterfaces.map(normalizeInterface);
    const rows=interfaces.map((item,index)=>{
      const rowErrors=[];
      const rawBandwidth=rawInterfaces[index]?.bandwidthMbps??rawInterfaces[index]?.bandwidth??rawInterfaces[index]?.speedMbps;
      if(typeof rawBandwidth!=='number'||!Number.isFinite(rawBandwidth)||item.bandwidthMbps<=0) rowErrors.push('bandwidth_invalid');
      if(item.metricOverride!==null&&(item.metricOverride<1||item.metricOverride>65535)) rowErrors.push('metric_override_out_of_range');
      const calculatedCost=item.bandwidthMbps>0?metricFor(referenceBandwidthMbps,item.bandwidthMbps,calculationMode):null;
      const cost=item.metricOverride!==null&&item.metricOverride>=1&&item.metricOverride<=65535?item.metricOverride:calculatedCost;
      if(rowErrors.length) errors.push(`interface_${index+1}_${rowErrors[0]}`);
      return {...item,index:index+1,calculatedCost,cost,errors:rowErrors,status:rowErrors.length?'invalid':item.enabled?'active':'disabled'};
    });
    const activeRows=rows.filter(row=>row.enabled&&row.errors.length===0);
    const totalCost=activeRows.reduce((sum,row)=>sum+row.cost,0);
    const disabledCount=rows.filter(row=>!row.enabled).length;
    const costRange=activeRows.length?{min:Math.min(...activeRows.map(row=>row.cost)),max:Math.max(...activeRows.map(row=>row.cost))}:{min:0,max:0};
    const pathInputs=Array.isArray(input.paths)?input.paths.map(normalizePath):[];
    const paths=pathInputs.map((path,pathIndex)=>{
      const pathResult=calculate({referenceBandwidthMbps,calculationMode,interfaces:path.interfaces});
      return {name:path.name,index:pathIndex+1,totalCost:pathResult.totalCost,interfaces:pathResult.interfaces,status:pathResult.status};
    });
    const bestPathCost=paths.length?Math.min(...paths.map(path=>path.totalCost)):totalCost;
    const ecmpPaths=paths.filter(path=>path.totalCost===bestPathCost&&path.status!=='invalid').length;
    const warnings=[];
    if(!errors.length&&activeRows.length===0) warnings.push('no_active_interfaces');
    if(disabledCount>0) warnings.push('disabled_interfaces_excluded');
    if(activeRows.some(row=>row.cost>=1000)) warnings.push('high_interface_cost');
    if(activeRows.some(row=>row.metricOverride!==null)) warnings.push('manual_metric_override');
    if(paths.length>0&&ecmpPaths<2) warnings.push('no_ecmp_equal_cost_path');
    if(costRange.max-costRange.min>=10) warnings.push('uneven_interface_costs');
    const status=errors.length?'invalid':warnings.some(code=>['no_active_interfaces','high_interface_cost'].includes(code))?'review':'ready';
    const recommendations=[];
    if(warnings.includes('manual_metric_override')) recommendations.push('Document every manual metric and verify it matches the intended traffic policy.');
    if(warnings.includes('uneven_interface_costs')) recommendations.push('Check interface bandwidth units and reference bandwidth before comparing neighbors.');
    if(warnings.includes('no_ecmp_equal_cost_path')) recommendations.push('For ECMP, confirm parallel paths have equal total cost and consistent area policy.');
    if(!recommendations.length) recommendations.push('Validate the computed cost against the vendor interface bandwidth and OSPF adjacency state.');
    return {schemaVersion:'ospf-cost-engine/1.0',referenceBandwidthMbps,calculationMode,interfaces:rows,totalCost,activeInterfaceCount:activeRows.length,disabledInterfaceCount:disabledCount,costRange,paths,bestPathCost,ecmpPaths,status,errors,warnings,recommendations,engineering:{formula:'cost = reference bandwidth / interface bandwidth',minimumCost:1,maximumCost:65535,defaultReferenceBandwidthMbps:100000}};
  }
  function compareReferenceBandwidth(input={},references=[100,1000,10000,100000]){
    return references.filter(value=>finite(value)&&Number(value)>0).map(value=>{
      const result=calculate({...input,referenceBandwidthMbps:Number(value)});
      return {referenceBandwidthMbps:Number(value),totalCost:result.totalCost,interfaces:result.interfaces.map(row=>({name:row.name,cost:row.cost,calculatedCost:row.calculatedCost})),status:result.status};
    });
  }
  function summarizePaths(input={}){
    const result=calculate(input);
    return {bestPathCost:result.bestPathCost,ecmpPaths:result.ecmpPaths,paths:result.paths.map(path=>({name:path.name,totalCost:path.totalCost,status:path.status}))};
  }
  function professionalReport(input={},meta={}){
    const result=calculate(input);
    return {schemaVersion:'ospf-cost-engineering-report/1.0',tool:'NetEngineerLab OSPF Cost Calculator',project:meta.project||'Untitled',generatedAt:new Date().toISOString(),input,result,referenceComparison:compareReferenceBandwidth(input),assumptions:['Reference bandwidth and interface bandwidth use Mbps','Costs are integer metrics bounded to 1..65535','Manual metric overrides require vendor and topology review']};
  }
  return {calculate,compareReferenceBandwidth,summarizePaths,professionalReport,metricFor,round};
});
