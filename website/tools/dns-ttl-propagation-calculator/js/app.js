(()=>{'use strict';
var nelCurrentValid=false;window.NELToolInputController={calculate:render,managesValidation:true,isValid:function(){return nelCurrentValid;},invalidate:function(){nelCurrentValid=false;window.lastResult=null;},resultActions:"#copy,#print,#downloadJson,#downloadCsv",resultValues:"#remaining,#typical,#worst,#lowerAt,#stableAfter,#oldQueries,#newQueries,#queryIncrease,#headline",resultDetails:"#engineeringDetails",resultStatus:"#status",resultMeters:"",validation:"#error",inputControls:".input-panel input,.input-panel select"};
const $=id=>document.getElementById(id),zh=window.NEL_LANG==='zh',tx=(e,c)=>zh?c:e,fmt=v=>Number(v).toLocaleString(undefined,{maximumFractionDigits:2});
const fields=[['peakOldTtl','Peak/previous TTL','3600','\u5cf0\u503c/\u65e7 TTL'],['authPropagationSec','Authoritative propagation margin','60','\u6743\u5a01\u4f20\u64ad\u4f59\u91cf'],['resolverCount','Resolver population','3','\u89e3\u6790\u5668\u6570\u91cf'],['resolverGrowthPct','Resolver growth','20','\u89e3\u6790\u5668\u589e\u957f'],['staleServePct','Stale-serve exposure','0','\u8fc7\u671f\u670d\u52a1\u66b4\u9732']];
function ensureFields(){const g=document.querySelector('.form-grid');if(!g)return;fields.forEach(([id,en,v,cn])=>{if($(id))return;const d=document.createElement('div');d.className='field f';d.innerHTML='<label for="'+id+'">'+tx(en,cn)+'</label><div class="inp input-wrap"><input id="'+id+'" type="number" step="any" value="'+v+'"><span>'+((id==='resolverGrowthPct'||id==='staleServePct')?'%':'s')+'</span></div>';g.appendChild(d)})}
function read(){const o={};document.querySelectorAll('input').forEach(e=>o[e.id]=e.value);return o}function download(n,c,t){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([c],{type:t}));a.download=n;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function render(){window.NELDnsRender=render;try{const r=NELToolEngine.calculate(read());nelCurrentValid=r.ok===true;$('error').hidden=!!r.ok;if(!r.ok)return;window.lastResult=r;['remaining','typical','worst','lowerAt','stableAfter','oldQueries','newQueries','queryIncrease'].forEach(id=>{if($(id))$(id).textContent=fmt(r[id])});if($('status')){$('status').textContent=tx(r.status.toUpperCase(),r.status==='pass'?'\u901a\u8fc7':'\u6ce8\u610f');$('status').className='badge status '+r.status+' '+(r.status==='pass'?'st-pass':'st-marginal')}if($('headline'))$('headline').textContent=tx('Engineering '+r.status,r.status==='pass'?'\u5de5\u7a0b\u901a\u8fc7':'\u9700\u8981\u590d\u6838');let p=$('engineeringDetails');if(!p){p=document.createElement('div');p.id='engineeringDetails';p.className='engineering-details';const rp=document.querySelector('.result-panel');const ra=rp&&rp.querySelector('.result-actions');if(ra)rp.insertBefore(p,ra);else rp&&rp.appendChild(p)}const f=r.scenarios?'<p><strong>'+tx('Before / After','\u53d8\u66f4\u524d / \u53d8\u66f4\u540e')+'</strong>: '+fmt(r.beforeAfter.before.worst)+' min -> '+fmt(r.beforeAfter.after.worst)+' min; delta '+fmt(r.beforeAfter.delta.worstMin)+' min</p><p><strong>'+tx('Risk','\u98ce\u9669')+'</strong>: '+(r.risks.length?r.risks.map(x=>x.code).join(', '):tx('None detected','\u672a\u53d1\u73b0'))+'</p>':'';p.innerHTML=f+'<div class="actions"><button id="downloadJson">'+tx('Download JSON','\u4e0b\u8f7d JSON')+'</button><button id="downloadCsv">'+tx('Download CSV','\u4e0b\u8f7d CSV')+'</button></div>';$('downloadJson').onclick=()=>download('dns-ttl-report.json',NELToolEngine.toJSON(NELToolEngine.buildReport(read())),'application/json');$('downloadCsv').onclick=()=>download('dns-ttl-report.csv',NELToolEngine.toCSV(r),'text/csv');if($('notes'))$('notes').textContent=tx('Verify resolver policy, authoritative capacity and stale-data behavior before change.','\u53d8\u66f4\u524d\u8bf7\u6838\u5bf9\u89e3\u6790\u5668\u7b56\u7565\u3001\u6743\u5a01\u5bb9\u91cf\u548c\u8fc7\u671f\u6570\u636e\u884c\u4e3a\u3002')}finally{window.NELToolInputController.sync?.();}}
ensureFields();document.querySelectorAll('input').forEach(e=>e.addEventListener('input',render));$('copy')?.addEventListener('click',()=>window.lastResult&&navigator.clipboard?.writeText(NELToolEngine.toJSON(NELToolEngine.buildReport(read()))));$('print')?.addEventListener('click',()=>print());render()})();
/* bw1e-chrome */
(()=>{try{
  const $=id=>document.getElementById(id);
  const defaults={oldTtl:'3600',newTtl:'300',elapsed:'0',authDelay:'60',lowerBefore:'24',negativeTtl:'300',peakOldTtl:'3600',authPropagationSec:'60',resolverCount:'3',resolverGrowthPct:'20',staleServePct:'0'};
  const syncFill=()=>{
    [['fillRemaining','remaining'],['fillTypical','typical'],['fillWorst','worst']].forEach(([fid,sid])=>{
      const f=$(fid),s=$(sid); if(f&&s){ let t=s.textContent||''; if(t&&t!=='\u2014'&&!/min|h|×|x/i.test(t)) {/* keep */} f.textContent=t; }
    });
  };
  const doRender=()=>{
    try{
      if(typeof window.NELDnsRender==='function'){ window.NELDnsRender(); return; }
      if(window.NELToolInputController&&typeof window.NELToolInputController.calculate==='function'){ window.NELToolInputController.calculate(); return; }
      document.querySelectorAll('.input-panel input').forEach(x=>x.dispatchEvent(new Event('input',{bubbles:true})));
    }catch(e){console.warn('dns render',e)}
  };
  const obs=new MutationObserver(syncFill);
  ['headline','remaining','typical','worst'].forEach(id=>{const el=$(id); if(el) obs.observe(el,{childList:true,characterData:true,subtree:true});});
  syncFill();
  const bind=()=>{
    const calc=$('calculateBtn'); const reset=$('resetBtn');
    if(calc && !calc.dataset.bw1eBound){
      calc.dataset.bw1eBound='1'; calc.style.pointerEvents='auto'; calc.style.cursor='pointer'; calc.disabled=false;
      calc.addEventListener('click',e=>{ e.preventDefault(); e.stopPropagation(); doRender(); syncFill(); }, true);
    }
    if(reset && !reset.dataset.bw1eBound){
      reset.dataset.bw1eBound='1'; reset.style.pointerEvents='auto'; reset.style.cursor='pointer'; reset.disabled=false;
      reset.addEventListener('click',e=>{
        e.preventDefault(); e.stopPropagation();
        Object.keys(defaults).forEach(id=>{const el=$(id); if(el) el.value=defaults[id];});
        doRender(); syncFill();
      }, true);
    }
  };
  bind(); document.addEventListener('DOMContentLoaded', bind); window.addEventListener('load', bind);
}catch(e){console.warn('dns bw1e',e)}})();
