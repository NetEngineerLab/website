(function(){
var nelCurrentValid=false;window.NELToolInputController={calculate:run,managesValidation:true,isValid:function(){return nelCurrentValid;},invalidate:function(){nelCurrentValid=false;},resultActions:"#copy",resultValues:"#totalCost,#activeCount,#bestPath,#ecmp",resultDetails:"#table,#json",resultStatus:"#status",resultMeters:"",validation:"#warnings",inputControls:"#reference,#mode,#interfaces,#paths"};

  const E=window.OspfCostEngine;
  const $=id=>document.getElementById(id);
  function lines(id){return $(id).value.split(String.fromCharCode(10));}
  function interfaceNameCell(value){const cell=document.createElement('td');cell.setAttribute('data-nel-locale-value','');cell.textContent=value;return cell.outerHTML;}
  function parseInterfaces(){return lines('interfaces').map(function(line,i){const p=line.split(',').map(x=>x.trim());return {name:p[0]||('Interface '+(i+1)),bandwidthMbps:Number(p[1]),metricOverride:p[2]||undefined,enabled:p[3]!=='disabled'};}).filter(x=>x.name||x.bandwidthMbps);}
  function parsePaths(){return lines('paths').map(function(line){return line.trim();}).filter(Boolean).map(function(line,i){return {name:'Path '+(i+1),interfaces:line.split(';').map(function(chunk,j){const p=chunk.split(',').map(x=>x.trim());return {name:p[0]||('link-'+(j+1)),bandwidthMbps:Number(p[1]),metricOverride:p[2]||undefined};})};});}
  function run(){window.NELOspfRun=run;try{const input={referenceBandwidthMbps:Number($('reference').value),calculationMode:$('mode').value,interfaces:parseInterfaces(),paths:parsePaths()};const r=E.calculate(input);nelCurrentValid=r.status!=='invalid';$('status').textContent=r.status.toUpperCase();$('status').className='status '+r.status+' '+(r.status==='ready'?'st-pass':r.status==='review'?'st-marginal':'st-fail');if(r.status==='invalid'){['totalCost','activeCount','bestPath','ecmp'].forEach(function(id){$(id).textContent='—';});$('warnings').innerHTML=(r.errors||[]).map(function(x){return '<li>'+String(x).replaceAll('_',' ')+'</li>';}).join('');$('table').innerHTML=r.interfaces.map(function(x){return '<tr>'+interfaceNameCell(x.name)+'<td>'+x.bandwidthMbps+'</td><td>—</td><td><strong>—</strong></td><td>'+x.status+'</td></tr>';}).join('');$('json').textContent=JSON.stringify(r,null,2);return;}$('totalCost').textContent=r.totalCost;$('activeCount').textContent=r.activeInterfaceCount;$('bestPath').textContent=r.bestPathCost;$('ecmp').textContent=r.ecmpPaths;$('warnings').innerHTML=r.warnings.length?r.warnings.map(function(x){return '<li>'+x.replaceAll('_',' ')+'</li>';}).join(''):'<li>No warnings</li>';$('table').innerHTML=r.interfaces.map(function(x){return '<tr>'+interfaceNameCell(x.name)+'<td>'+x.bandwidthMbps+'</td><td>'+(x.calculatedCost??'N/A')+'</td><td><strong>'+(x.cost??'N/A')+'</strong></td><td>'+x.status+'</td></tr>';}).join('');$('json').textContent=JSON.stringify(r,null,2);}finally{window.NELToolInputController.sync?.();}}
  $('calculateBtn').addEventListener('click',run);$('resetBtn').addEventListener('click',function(){window.NELOspfReset&&window.NELOspfReset();});$('copy').addEventListener('click',function(){if(navigator.clipboard)navigator.clipboard.writeText($('json').textContent);});run();

window.NELOspfRun=run;
window.NELOspfReset=function(){
  $('reference').value='100000'; $('mode').value='ceil';
  $('interfaces').value='Gi0/0, 1000\nGi0/1, 10000\nLo0, 1';
  $('paths').value='A,10000;B,1000\nC,10000;D,1000';
  run();
};
const syncHead=()=>{
  const h=$('headline'), t=$('totalCost'), b=$('statusBadge'), s=$('status');
  if(h&&t) h.textContent=t.textContent||'—';
  if(b&&s&&s.textContent) b.textContent=s.textContent;
  [['fillTotal','totalCost'],['fillBest','bestPath'],['fillEcmp','ecmp']].forEach(([a,c])=>{const x=$(a),y=$(c); if(x&&y) x.textContent=y.textContent||'—';});
};
const _run=run; run=function(){ _run(); syncHead(); }; window.NELOspfRun=run;
const obs=new MutationObserver(syncHead);
['totalCost','bestPath','ecmp','status'].forEach(id=>{const el=$(id); if(el) obs.observe(el,{childList:true,characterData:true,subtree:true,attributes:true});});
syncHead();
/* 20261106-bw1-chrome */
(function(){
  const calc=$('calculateBtn'); const reset=$('resetBtn');
  if(calc && !calc.dataset.bw1eBound){
    calc.dataset.bw1eBound='1'; calc.style.pointerEvents='auto'; calc.style.cursor='pointer';
    calc.addEventListener('click',function(e){ e.preventDefault(); e.stopPropagation(); window.NELOspfRun&&window.NELOspfRun(); }, true);
  }
  if(reset && !reset.dataset.bw1eBound){
    reset.dataset.bw1eBound='1'; reset.style.pointerEvents='auto'; reset.style.cursor='pointer';
    reset.addEventListener('click',function(e){ e.preventDefault(); e.stopPropagation(); window.NELOspfReset&&window.NELOspfReset(); }, true);
  }
})();

})();
