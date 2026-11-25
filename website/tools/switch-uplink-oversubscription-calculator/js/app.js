(function(){'use strict';
var nelCurrentValid=false;
window.NELToolInputController={calculate:function(){calc();},managesValidation:true,isValid:function(){return nelCurrentValid;},invalidate:function(){nelCurrentValid=false;window.lastResult=null;},resultStatus:'#status',resultActions:"#copy,#print",resultValues:"#offeredGbps,#demandGbps,#uplinkGbps,#safeGbps,#oversubscription,#demandUtil,#requiredUplinks,#spareGbps,#headline",resultDetails:"#notes,#scenario",validation:"",inputControls:".input-panel input,.input-panel select,.input-panel textarea"};


const $=id=>document.getElementById(id);
const lang=(window.NEL_LANG||document.documentElement.lang||'en').toLowerCase().slice(0,2);
const zh=lang==='zh';
const es=lang==='es';
const idLang=lang==='id';
const ptLang=lang==='pt';
const tx=(en,cn,esLabel,idLabel,ptLabel)=>idLang&&idLabel!=null?idLabel:ptLang&&ptLabel!=null?ptLabel:(es&&esLabel!=null?esLabel:(zh?cn:en));
const fmt=v=>v===null?'N/A':typeof v==='string'?v:Number(v).toLocaleString(idLang?'id-ID':ptLang?'pt-BR':undefined,{maximumFractionDigits:2});
const WARN_LABELS={
  burstExposure:{en:'Burst exposure',zh:'突发余量占用',es:'Exposición a ráfagas',id:'Paparan lonjakan',pt:'Exposição a rajadas'},
  capacityOverTarget:{en:'Demand above target utilization',zh:'需求超过目标利用率',es:'Demanda sobre la utilización objetivo',id:'Permintaan di atas utilisasi target',pt:'Demanda acima da utilização alvo'},
  singlePath:{en:'Single forwarding path',zh:'单路径转发',es:'Camino de reenvío único',id:'Jalur penerusan tunggal',pt:'Caminho de encaminhamento único'},
  noAvailableUplinks:{en:'No available uplinks',zh:'无可用上联',es:'Sin uplinks disponibles',id:'Tidak ada uplink yang tersedia',pt:'Nenhum uplink disponível'},
  congestion:{en:'Demand exceeds uplink capacity',zh:'需求超过上联容量',es:'La demanda supera la capacidad de uplink',id:'Permintaan melebihi kapasitas uplink',pt:'A demanda excede a capacidade do uplink'}
};
function warnLabel(code){
  const row=WARN_LABELS[code];
  if(!row) return code;
  return tx(row.en,row.zh,row.es,row.id,row.pt);
}
function formatWarnings(list){
  const mapped=(list||[]).map(warnLabel).filter(Boolean);
  return mapped.length?mapped.join(zh?'、':', '):tx('No major warning','未发现主要告警','Sin avisos importantes','Tidak ada peringatan utama','Nenhum aviso importante');
}
function read(){const o={};document.querySelectorAll('input').forEach(e=>o[e.id]=e.value);return{...o,engineering:true}}
function ensure(){const g=document.querySelector('.form-grid');[['peakPorts','Peak active ports','48','峰值活跃端口','Puertos activos pico','Port aktif puncak','Portas ativas de pico'],['growthPct','Growth (%)','20','增长 (%)','Crecimiento (%)','Pertumbuhan (%)','Crescimento (%)'],['burstPct','Burst allowance (%)','15','突发余量 (%)','Margen de ráfaga (%)','Cadangan lonjakan (%)','Margem de rajada (%)'],['failedUplinks','Failed uplinks (N-1)','1','故障上联数（N-1）','Uplinks fallidos (N-1)','Uplink gagal (N-1)','Uplinks com falha (N-1)']].forEach(([id,en,v,cn,esLabel,idLabel,ptLabel])=>{if(!$(id)){const d=document.createElement('div');d.className='field f';d.innerHTML='<label>'+tx(en,cn,esLabel,idLabel,ptLabel)+'</label><div class="inp input-wrap"><input id="'+id+'" type="number" value="'+v+'"></div>';g.appendChild(d)}})}
function statusLabel(code){return ({pass:tx('PASS','通过','CUMPLE','LULUS','APROVADO'),warning:tx('REVIEW','注意','REVISAR','TINJAU','REVISAR'),fail:tx('FAIL','不通过','NO CUMPLE','GAGAL','REPROVADO')})[code]||code;}
function calc(){try{const r=NELToolEngine.calculate(read());nelCurrentValid=r.ok!==false;if(!r.ok){$('error').hidden=false;window.lastResult=null;['offeredGbps','demandGbps','uplinkGbps','safeGbps','oversubscription','demandUtil','requiredUplinks','spareGbps','headline','status'].forEach(id=>{if($(id))$(id).textContent='—'});['copy','print'].forEach(id=>$(id).disabled=true);return}$('error').hidden=true;['copy','print'].forEach(id=>$(id).disabled=false);window.lastResult=r;[['offeredGbps',r.offeredGbps],['demandGbps',r.demandGbps],['uplinkGbps',r.uplinkGbps],['safeGbps',r.safeGbps],['oversubscription',r.oversubscription],['demandUtil',r.demandUtil],['requiredUplinks',r.requiredUplinks],['spareGbps',r.spareGbps]].forEach(([id,v])=>{if($(id))$(id).textContent=fmt(v)});$('status').className='status '+r.status+' '+(r.status==='pass'?'st-pass':r.status==='warning'?'st-marginal':'st-fail');$('status').textContent=statusLabel(r.status);$('headline').textContent=statusLabel(r.status);$('notes').textContent=formatWarnings(r.warnings);if(!$('scenario')){const p=document.createElement('p');p.id='scenario';document.querySelector('.result-panel').appendChild(p)}$('scenario').textContent=tx('Baseline \u2192 Peak \u2192 Conservative; N-1: ','基线 \u2192 峰值 \u2192 保守；N-1：','Línea base \u2192 Pico \u2192 Conservador; N-1: ','Dasar \u2192 Puncak \u2192 Konservatif; N-1: ','Linha de base \u2192 Pico \u2192 Conservador; N-1: ')+(r.scenarios.nMinus1.capacityState==='unavailable'?tx('No available uplinks','无可用上联','Sin uplinks disponibles','Tidak ada uplink yang tersedia','Nenhum uplink disponível'):statusLabel(r.scenarios.nMinus1.status))}finally{window.NELToolInputController.sync?.();}}
ensure();const bwInitialInputs=Object.fromEntries(Array.from(document.querySelectorAll(".input-panel input,.input-panel select")).map(e=>[e.id,{value:e.value,checked:e.checked,type:e.type}]));document.getElementById('calculate')?.addEventListener('click',calc);document.getElementById('reset')?.addEventListener('click',()=>{Object.entries(bwInitialInputs).forEach(([id,d])=>{const e=$(id);if(e){e.value=d.value;if(d.type==="checkbox")e.checked=d.checked;}});calc();});document.querySelectorAll('input').forEach(e=>e.addEventListener('input',calc));$('copy')?.addEventListener('click',()=>{if(!(idLang||ptLang)){navigator.clipboard?.writeText(JSON.stringify(window.lastResult));return;}const lines=[];const status=$('status');if(status&&status.textContent.trim())lines.push(status.textContent.trim());document.querySelectorAll('.metric').forEach(node=>{const name=node.querySelector('span,small');const value=node.querySelector('b,strong');if(name&&value)lines.push(name.textContent.trim()+': '+value.textContent.trim());});if($('scenario')&&$('scenario').textContent.trim())lines.push($('scenario').textContent.trim());navigator.clipboard?.writeText(lines.join('\n'));});$('print')?.addEventListener('click',()=>print());calc();})();

(function(){const b=document.getElementById("calculate");if(!b)return;const label=b.innerHTML;let timer;b.addEventListener("click",()=>{clearTimeout(timer);b.setAttribute("aria-live","polite");b.textContent=document.documentElement.lang.startsWith("zh")?"已重新计算":document.documentElement.lang.startsWith("es")?"Recalculado":document.documentElement.lang.startsWith("id")?"Dihitung ulang":document.documentElement.lang.toLowerCase().startsWith("pt")?"Recalculado":"Recalculated";timer=setTimeout(()=>b.innerHTML=label,1100);});})();
