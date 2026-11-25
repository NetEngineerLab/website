(function(){
var nelCurrentValid=false;window.NELToolInputController={calculate:run,managesValidation:true,isValid:function(){return nelCurrentValid;},invalidate:function(){nelCurrentValid=false;},resultActions:"#copy",resultValues:"#totalCost,#activeCount,#bestPath,#ecmp",resultDetails:"#table,#json",resultStatus:"#status",resultMeters:"",validation:"#warnings",inputControls:"#reference,#mode,#interfaces,#paths"};

  const E=window.OspfCostEngine;
  const $=id=>document.getElementById(id);
  const PAGE=(document.documentElement.lang||"en").toLowerCase();
  const LOC=PAGE==="id"||PAGE.startsWith("id-")?"id":PAGE==="pt-br"||PAGE.startsWith("pt")?"pt":"en";
  const statusWords={id:{ready:"Siap",review:"Tinjau",invalid:"Tidak valid",active:"aktif",disabled:"nonaktif"},pt:{ready:"Pronto",review:"Revisar",invalid:"Inválido",active:"ativa",disabled:"desativada"}};
  const warnWords={id:{no_active_interfaces:"Tidak ada antarmuka aktif",disabled_interfaces_excluded:"Antarmuka nonaktif tidak dihitung",high_interface_cost:"Ada biaya antarmuka yang tinggi",manual_metric_override:"Ada metrik yang diisi manual",no_ecmp_equal_cost_path:"Belum ada dua jalur ECMP dengan biaya sama",uneven_interface_costs:"Biaya antarmuka tidak seimbang",reference_bandwidth_invalid:"Bandwidth referensi tidak valid",interfaces_required:"Antarmuka wajib diisi",input_type_invalid:"Jenis masukan tidak valid",bandwidth_invalid:"Bandwidth tidak valid",metric_override_out_of_range:"Penggantian metrik di luar 1–65535"},pt:{no_active_interfaces:"Não há interface ativa",disabled_interfaces_excluded:"Interfaces desativadas ficam de fora",high_interface_cost:"Há custo de interface alto",manual_metric_override:"Há métrica preenchida manualmente",no_ecmp_equal_cost_path:"Ainda não há dois caminhos ECMP com o mesmo custo",uneven_interface_costs:"Os custos das interfaces estão desequilibrados",reference_bandwidth_invalid:"Largura de banda de referência inválida",interfaces_required:"Informe as interfaces",input_type_invalid:"Tipo de entrada inválido",bandwidth_invalid:"Largura de banda inválida",metric_override_out_of_range:"A métrica manual está fora de 1–65535"}};
  function badgeLabel(code){return LOC==="en"?String(code||"").toUpperCase():(statusWords[LOC][code]||code);}
  function rowStatus(code){return LOC==="en"?code:(statusWords[LOC][code]||code);}
  function warnLabel(code){if(LOC==="en")return String(code).replaceAll("_"," ");const row=warnWords[LOC];const m=/^interface_(\d+)_(.+)$/.exec(code);if(m)return (LOC==="id"?"Antarmuka ":"Interface ")+m[1]+": "+(row[m[2]]||m[2].replaceAll("_"," "));return row[code]||String(code).replaceAll("_"," ");}
  function lines(id){return $(id).value.split(String.fromCharCode(10));}
  function interfaceNameCell(value){const cell=document.createElement('td');cell.setAttribute('data-nel-locale-value','');cell.textContent=value;return cell.outerHTML;}
  function parseInterfaces(){return lines('interfaces').map(function(line,i){const p=line.split(',').map(x=>x.trim());return {name:p[0]||('Interface '+(i+1)),bandwidthMbps:Number(p[1]),metricOverride:p[2]||undefined,enabled:p[3]!=='disabled'};}).filter(x=>x.name||x.bandwidthMbps);}
  function parsePaths(){return lines('paths').map(function(line){return line.trim();}).filter(Boolean).map(function(line,i){return {name:'Path '+(i+1),interfaces:line.split(';').map(function(chunk,j){const p=chunk.split(',').map(x=>x.trim());return {name:p[0]||('link-'+(j+1)),bandwidthMbps:Number(p[1]),metricOverride:p[2]||undefined};})};});}
  function run(){window.NELOspfRun=run;try{const input={referenceBandwidthMbps:Number($('reference').value),calculationMode:$('mode').value,interfaces:parseInterfaces(),paths:parsePaths()};const r=E.calculate(input);nelCurrentValid=r.status!=='invalid';$('status').textContent=badgeLabel(r.status);$('status').className='status '+r.status+' '+(r.status==='ready'?'st-pass':r.status==='review'?'st-marginal':'st-fail');if(r.status==='invalid'){['totalCost','activeCount','bestPath','ecmp'].forEach(function(id){$(id).textContent='—';});$('warnings').innerHTML=(r.errors||[]).map(function(x){return '<li>'+warnLabel(x)+'</li>';}).join('');$('table').innerHTML=r.interfaces.map(function(x){return '<tr>'+interfaceNameCell(x.name)+'<td>'+x.bandwidthMbps+'</td><td>—</td><td><strong>—</strong></td><td>'+rowStatus(x.status)+'</td></tr>';}).join('');$('json').textContent=JSON.stringify(r,null,2);return;}$('totalCost').textContent=r.totalCost;$('activeCount').textContent=r.activeInterfaceCount;$('bestPath').textContent=r.bestPathCost;$('ecmp').textContent=r.ecmpPaths;$('warnings').innerHTML=r.warnings.length?r.warnings.map(function(x){return '<li>'+warnLabel(x)+'</li>';}).join(''):'<li>'+(LOC==='id'?'Tidak ada peringatan':LOC==='pt'?'Nenhum aviso':'No warnings')+'</li>';$('table').innerHTML=r.interfaces.map(function(x){return '<tr>'+interfaceNameCell(x.name)+'<td>'+x.bandwidthMbps+'</td><td>'+(x.calculatedCost??'N/A')+'</td><td><strong>'+(x.cost??'N/A')+'</strong></td><td>'+rowStatus(x.status)+'</td></tr>';}).join('');$('json').textContent=JSON.stringify(r,null,2);}finally{window.NELToolInputController.sync?.();}}
  $('calculateBtn').addEventListener('click',run);$('resetBtn').addEventListener('click',function(){window.NELOspfReset&&window.NELOspfReset();});$('copy').addEventListener('click',function(){if(LOC==='en'){if(navigator.clipboard)navigator.clipboard.writeText($('json').textContent);return;}const lines=[];document.querySelectorAll('.metric').forEach(function(node){const name=node.querySelector('small');const value=node.querySelector('strong');if(name&&value)lines.push(name.textContent.trim()+': '+value.textContent.trim());});const badge=$('statusBadge');if(badge&&badge.textContent.trim())lines.push('Status: '+badge.textContent.trim());if(navigator.clipboard)navigator.clipboard.writeText(lines.join('\n'));});run();

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
