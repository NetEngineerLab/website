(()=>{'use strict';
var nelCurrentValid=false;window.NELToolInputController={calculate:render,managesValidation:true,isValid:function(){return nelCurrentValid;},invalidate:function(){nelCurrentValid=false;window.lastResult=null;},resultActions:"#copy,#print,#json,#csv",resultValues:"#plannedHosts,#vlanCount,#prefix,#usablePerVlan,#totalUsable,#utilization,#headroom,#vlanRange,#headline",resultDetails:"#engineeringDetails",resultStatus:"#status",resultMeters:"",validation:"#error",inputControls:".input-panel input,.input-panel select"};
const $=id=>document.getElementById(id),zh=window.NEL_LANG==='zh',tx=(e,c)=>zh?c:e,fmt=v=>typeof v==='number'&&Number.isFinite(v)?v.toLocaleString(undefined,{maximumFractionDigits:2}):String(v??'');const fields=[['reservedPct','Reserved IP %','5','\u4fdd\u7559\u5730\u5740\u767e\u5206\u6bd4'],['gatewayPct','Gateway reserve %','1','\u7f51\u5173\u4fdd\u7559\u767e\u5206\u6bd4'],['dhcpReserve','DHCP reservations','2','DHCP\u4fdd\u7559\u6570'],['faultDomains','Fault domains','1','\u6545\u969c\u57df'],['vrfCount','VRF count','1','VRF\u6570\u91cf'],['growthAfterPct','After-growth scenario %','20','\u589e\u957f\u573a\u666f\u767e\u5206\u6bd4']];function ensure(){const g=document.querySelector('.form-grid');fields.forEach(([id,e,v,c])=>{if($(id))return;const d=document.createElement('div');d.className='field f';d.innerHTML='<label for="'+id+'">'+tx(e,c)+'</label><div class="inp input-wrap"><input id="'+id+'" type="number" step="any" value="'+v+'"><span>'+((id.endsWith('Pct'))?'%':'')+'</span></div>';g.appendChild(d)})}function read(){const o={};document.querySelectorAll('input').forEach(x=>o[x.id]=x.value);return o}function dl(n,c,t){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([c],{type:t}));a.download=n;a.click()}function render(){window.NELVlanRender=render;try{const blank=['users','perUser','infra','growth','maxHosts','vlanStart'].some(id=>$(id)&&String($(id).value).trim()==='');const r=blank?{ok:false}:NELToolEngine.calculate(read());nelCurrentValid=r.ok===true;$('error').hidden=!!r.ok;if(!r.ok){window.lastResult=null;['plannedHosts','vlanCount','prefix','usablePerVlan','totalUsable','utilization','headroom','vlanRange'].forEach(id=>$(id)&&($(id).textContent='\u2014'));$('status').textContent=tx('Invalid input','\u8f93\u5165\u65e0\u6548');$('status').className='badge fail';const p=$('engineeringDetails');if(p)p.innerHTML='';return;}window.lastResult=r;['plannedHosts','vlanCount','prefix','usablePerVlan','totalUsable','utilization','headroom','vlanRange'].forEach(id=>$(id)&&($(id).textContent=fmt(r[id])));$('status').textContent=tx(r.status.toUpperCase(),r.status==='pass'?'\u901a\u8fc7':r.status==='warning'?'\u6ce8\u610f':'\u4e0d\u8db3');$('status').className='badge status '+r.status+' '+(r.status==='pass'?'st-pass':r.status==='warning'?'st-marginal':'st-fail');$('headline').textContent=tx('Engineering '+r.status,r.status==='pass'?'\u5de5\u7a0b\u901a\u8fc7':'\u9700\u8981\u590d\u6838');let p=$('engineeringDetails');if(!p){p=document.createElement('div');p.id='engineeringDetails';const rp=document.querySelector('.result-panel');const ra=rp&&rp.querySelector('.result-actions');if(ra)rp.insertBefore(p,ra);else rp.appendChild(p)}p.innerHTML=r.scenarios?'<p><strong>'+tx('Before / After','\u53d8\u66f4\u524d / \u53d8\u66f4\u540e')+'</strong>: '+fmt(r.beforeAfter.before.vlanCount)+' -> '+fmt(r.beforeAfter.after.vlanCount)+' VLANs</p><p><strong>'+tx('Risks','\u98ce\u9669')+'</strong>: '+(r.risks.length?r.risks.map(x=>x.code).join(', '):tx('None','\u65e0'))+'</p><div class="actions"><button id="json">JSON</button><button id="csv">CSV</button></div>':'';if($('json'))$('json').onclick=()=>dl('vlan-capacity-report.json',NELToolEngine.toJSON(NELToolEngine.buildReport(read())),'application/json');if($('csv'))$('csv').onclick=()=>dl('vlan-capacity-report.csv',NELToolEngine.toCSV(r).split(String.fromCharCode(92,110)).join(String.fromCharCode(10)),'text/csv');$('notes').textContent=tx('Validate DHCP, gateway HA, VRF and fault-domain assumptions before deployment.','\u90e8\u7f72\u524d\u8bf7\u6838\u5bf9 DHCP\u3001\u7f51\u5173\u9ad8\u53ef\u7528\u3001VRF \u548c\u6545\u969c\u57df\u5047\u8bbe\u3002')}finally{window.NELToolInputController.sync?.();}}ensure();document.querySelectorAll('input').forEach(x=>x.addEventListener('input',render));$('copy')?.addEventListener('click',()=>window.lastResult&&navigator.clipboard?.writeText(NELToolEngine.toJSON(NELToolEngine.buildReport(read()))));$('print')?.addEventListener('click',()=>print());render()})();


/* bw1e-chrome */
(()=>{try{
  const $=id=>document.getElementById(id);
  const defaults={users:'180',perUser:'0.35',infra:'25',growth:'25',maxHosts:'200',vlanStart:'100',reservedPct:'5',gatewayPct:'1',dhcpReserve:'2',faultDomains:'1',vrfCount:'1',growthAfterPct:'20'};
  const syncFill=()=>{
    const map=[['fillPlanned','plannedHosts'],['fillUtil','utilization'],['fillHeadroom','headroom']];
    map.forEach(([fid,sid])=>{const f=$(fid),s=$(sid); if(f&&s){let t=s.textContent||''; if(fid==='fillUtil'&&t&&t!=='\u2014'&&!String(t).includes('%')) t+=' %'; f.textContent=t;}});
  };
  const doRender=()=>{
    try{
      if(typeof window.NELVlanRender==='function'){ window.NELVlanRender(); return; }
      if(window.NELToolInputController&&typeof window.NELToolInputController.calculate==='function'){ window.NELToolInputController.calculate(); return; }
      document.querySelectorAll('.input-panel input').forEach(x=>x.dispatchEvent(new Event('input',{bubbles:true})));
    }catch(e){console.warn('vlan render',e)}
  };
  const obs=new MutationObserver(syncFill);
  ['headline','plannedHosts','utilization','headroom'].forEach(id=>{const el=$(id); if(el) obs.observe(el,{childList:true,characterData:true,subtree:true});});
  syncFill();
  const bind=()=>{
    const calc=$('calculateBtn'); const reset=$('resetBtn');
    if(calc && !calc.dataset.bw1eBound){
      calc.dataset.bw1eBound='1';
      calc.style.pointerEvents='auto'; calc.style.cursor='pointer'; calc.disabled=false;
      calc.addEventListener('click',e=>{ e.preventDefault(); e.stopPropagation(); doRender(); syncFill(); }, true);
    }
    if(reset && !reset.dataset.bw1eBound){
      reset.dataset.bw1eBound='1';
      reset.style.pointerEvents='auto'; reset.style.cursor='pointer'; reset.disabled=false;
      reset.addEventListener('click',e=>{
        e.preventDefault(); e.stopPropagation();
        Object.keys(defaults).forEach(id=>{const el=$(id); if(el) el.value=defaults[id];});
        doRender(); syncFill();
      }, true);
    }
  };
  bind();
  document.addEventListener('DOMContentLoaded', bind);
  window.addEventListener('load', bind);
}catch(e){console.warn('bw1e-chrome',e)}})();
