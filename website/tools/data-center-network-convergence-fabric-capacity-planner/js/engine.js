(function(r,f){const a=f();if(typeof module==='object'&&module.exports)module.exports=a;r.NELDataCenterFabricEngine=a;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const round=(v,d=2)=>Number.isFinite(v)?+v.toFixed(d):0;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
function num(v){const n=Number(v);return Number.isFinite(n)?n:NaN;}
function statusFromUtil(v,target){if(v>100)return'critical';if(v>target)return'high';if(v>target*.85)return'warning';return'healthy';}
function maxStatus(values,target){const rank={healthy:0,warning:1,high:2,critical:3};return values.map(v=>statusFromUtil(v,target)).sort((a,b)=>rank[b]-rank[a])[0]||'healthy';}
function calculate(input){
 if(!input)return{ok:false,error:'missing-input'};
 const topology=input.topology==='three-tier'?'three-tier':'leaf-spine';
 const edgeCount=num(input.edgeCount),portsPerEdge=num(input.portsPerEdge),portGbps=num(input.portGbps),util=num(input.utilizationPct)/100,concurrency=num(input.concurrencyPct)/100,allowance=num(input.allowancePct)/100;
 const edgeUplinks=num(input.edgeUplinks),edgeUplinkGbps=num(input.edgeUplinkGbps),middleCount=num(input.middleCount),upperLinksPerMiddle=num(input.upperLinksPerMiddle),upperLinkGbps=num(input.upperLinkGbps),egressLinks=num(input.egressLinks),egressLinkGbps=num(input.egressLinkGbps);
 const eastWest=clamp(num(input.eastWestPct),0,100)/100,crossEdge=clamp(num(input.crossEdgePct),0,100)/100,ewUpper=clamp(num(input.eastWestUpperPct),0,100)/100,target=num(input.targetUtilizationPct),growth=clamp(num(input.annualGrowthPct),0,500)/100,failedMiddle=Math.max(0,Math.floor(num(input.failedMiddleNodes)));
 const vals=[edgeCount,portsPerEdge,portGbps,util,concurrency,allowance,edgeUplinks,edgeUplinkGbps,middleCount,upperLinksPerMiddle,upperLinkGbps,egressLinks,egressLinkGbps,target,growth,failedMiddle];
 if(vals.some(v=>!Number.isFinite(v))||edgeCount<=0||portsPerEdge<=0||portGbps<=0||util<=0||util>1||concurrency<=0||concurrency>1||allowance<0||edgeUplinks<=0||edgeUplinkGbps<=0||middleCount<=0||upperLinksPerMiddle<=0||upperLinkGbps<=0||egressLinks<=0||egressLinkGbps<=0||target<=0||target>100||failedMiddle>=middleCount)return{ok:false,error:'invalid-input'};
 const lineRate=edgeCount*portsPerEdge*portGbps;
 const demand=lineRate*util*concurrency*(1+allowance);
 const ewDemand=demand*eastWest, nsDemand=demand-ewDemand;
 const crossEw=ewDemand*crossEdge, localEw=ewDemand-crossEw, upperEw=crossEw*ewUpper;
 // Fabric-facing ports carry the north-south stream once and cross-edge east-west traffic on ingress + egress fabric legs.
 const fabricDemand=nsDemand+2*crossEw;
 // Upper-layer links carry north-south plus the entered share of east-west traffic that must traverse the upper/core layer.
 const upperDemand=nsDemand+2*upperEw;
 const fabricCapacity=edgeCount*edgeUplinks*edgeUplinkGbps;
 const upperCapacity=middleCount*upperLinksPerMiddle*upperLinkGbps;
 const egressCapacity=egressLinks*egressLinkGbps;
 const fabricUtil=fabricDemand/fabricCapacity*100,upperUtil=upperDemand/upperCapacity*100,egressUtil=nsDemand/egressCapacity*100;
 const layer1=lineRate/fabricCapacity,layer2=fabricCapacity/upperCapacity,totalConv=lineRate/egressCapacity;
 const survivingMiddle=middleCount-failedMiddle;
 const survival=survivingMiddle/middleCount;
 const n1FabricCapacity=fabricCapacity*survival,n1UpperCapacity=upperCapacity*survival;
 const n1FabricUtil=fabricDemand/n1FabricCapacity*100,n1UpperUtil=upperDemand/n1UpperCapacity*100;
 const normalMax=Math.max(fabricUtil,upperUtil,egressUtil),failureMax=Math.max(n1FabricUtil,n1UpperUtil,egressUtil);
 const requiredFabric=fabricDemand/(target/100),requiredUpper=upperDemand/(target/100),requiredEgress=nsDemand/(target/100);
 const minEdgeUplinks=Math.max(1,Math.ceil(requiredFabric/(edgeCount*edgeUplinkGbps)));
 const minUpperLinksPerMiddle=Math.max(1,Math.ceil(requiredUpper/(middleCount*upperLinkGbps)));
 const minEgressLinks=Math.max(1,Math.ceil(requiredEgress/egressLinkGbps));
 const projections=[1,3,5].map(year=>{const factor=Math.pow(1+growth,year);const f=fabricUtil*factor,u=upperUtil*factor,e=egressUtil*factor,n=Math.max(f,u,e);return{year,demandGbps:round(demand*factor),fabricUtilPct:round(f,1),upperUtilPct:round(u,1),egressUtilPct:round(e,1),maxUtilPct:round(n,1),status:statusFromUtil(n,target)};});
 const bottlenecks=[['fabric',fabricUtil],['upper',upperUtil],['egress',egressUtil]].sort((a,b)=>b[1]-a[1]);
 const failureBottlenecks=[['fabric',n1FabricUtil],['upper',n1UpperUtil],['egress',egressUtil]].sort((a,b)=>b[1]-a[1]);
 const riskScore=clamp(Math.round(normalMax*.25+failureMax*.45+projections[1].maxUtilPct*.2+(totalConv>8?10:totalConv>4?6:0)),0,100);
 const riskLevel=riskScore>=81?'critical':riskScore>=61?'high':riskScore>=41?'elevated':riskScore>=21?'moderate':'low';
 const designStatus=maxStatus([normalMax,failureMax],target);
 const rec=[];
 if(fabricUtil>target)rec.push('fabric-capacity');
 if(upperUtil>target)rec.push('upper-capacity');
 if(egressUtil>target)rec.push('egress-capacity');
 if(failureMax>100)rec.push('n1-fail'); else if(failureMax>target)rec.push('n1-headroom');
 if(projections[1].maxUtilPct>target)rec.push('growth');
 if(crossEw>nsDemand&&edgeUplinks<2)rec.push('east-west');
 return{ok:true,topology,lineRateGbps:round(lineRate),busyDemandGbps:round(demand),eastWestGbps:round(ewDemand),northSouthGbps:round(nsDemand),localEastWestGbps:round(localEw),crossEdgeEastWestGbps:round(crossEw),fabricTransitGbps:round(fabricDemand),upperTransitGbps:round(upperDemand),fabricCapacityGbps:round(fabricCapacity),upperCapacityGbps:round(upperCapacity),egressCapacityGbps:round(egressCapacity),layer1Convergence:round(layer1,2),layer2Convergence:round(layer2,2),totalConvergence:round(totalConv,2),fabricUtilPct:round(fabricUtil,1),upperUtilPct:round(upperUtil,1),egressUtilPct:round(egressUtil,1),survivingMiddle,n1FabricCapacityGbps:round(n1FabricCapacity),n1UpperCapacityGbps:round(n1UpperCapacity),n1FabricUtilPct:round(n1FabricUtil,1),n1UpperUtilPct:round(n1UpperUtil,1),normalMaxUtilPct:round(normalMax,1),failureMaxUtilPct:round(failureMax,1),normalBottleneck:bottlenecks[0][0],failureBottleneck:failureBottlenecks[0][0],requiredFabricGbps:round(requiredFabric),requiredUpperGbps:round(requiredUpper),requiredEgressGbps:round(requiredEgress),minEdgeUplinks,minUpperLinksPerMiddle,minEgressLinks,projections,riskScore,riskLevel,designStatus,recommendations:rec,targetUtilizationPct:target,failedMiddleNodes:failedMiddle};
}
return{calculate};});
