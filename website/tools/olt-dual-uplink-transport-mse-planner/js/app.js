/** NetEngineerLab OLT Dual-Uplink Planner V1.2 UI | Modified 2026-09-12 00:20:00 */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const n=id=>Number($(id).value||0);
const b=id=>$(id).checked;
const fmt=(v,d=1)=>Number(v).toLocaleString(undefined,{maximumFractionDigits:d});
const zh=document.documentElement.lang.toLowerCase().startsWith('zh');
const wm={
  perOltUplinkOversubscription:zh?'单台 OLT 业务带宽超过单上联口速率，需重新核验上联模型。':'Per-OLT traffic exceeds one uplink rate; review the uplink model.',
  falseDualUplinkRisk:zh?'双上联未同时满足物理路由、传输环和传输系统分离，存在“假双上联”共同失效风险。':'The two uplinks are not fully separated by physical route, ring and transport system; common-mode failure risk remains.',
  channelTight:zh?'单边故障态波道利用率较高，建议增加波道余量。':'Failure-state channel utilization is tight; add channel headroom.',
  mseTight:zh?'单边故障态 MSE 端口利用率较高，建议增加端口余量。':'Failure-state MSE port utilization is tight; add port headroom.'
};
const riskLabel=zh?
  {low:'低风险',medium:'需关注',high:'高风险',critical:'严重风险'}:
  {low:'LOW RISK',medium:'CAUTION',high:'HIGH RISK',critical:'CRITICAL'};

function setUtilization(barId,markerId,textId,value,limit){
  const bar=$(barId),marker=$(markerId),text=$(textId);
  const safeValue=Math.max(0,Math.min(100,Number(value)||0));
  const safeLimit=Math.max(0,Math.min(100,Number(limit)||0));
  bar.style.width=safeValue+'%';
  bar.classList.remove('warn','fail');
  if(value>limit)bar.classList.add('fail');
  else if(value>limit*.9)bar.classList.add('warn');
  marker.style.left=safeLimit+'%';
  text.textContent=zh?`规划上限 ${fmt(limit,0)}%`:`Planning limit ${fmt(limit,0)}%`;
}

function run(){
  const channelLimit=n('channelLimit');
  const mseLimit=n('mseLimit');
  const r=window.NELUplinkTransportMseEngine.calculate({
    oltCount:n('oltCount'),
    trafficPerOltGbps:n('traffic'),
    uplinkRateGbps:n('uplinkRate'),
    mode:$('mode').value,
    channelRateGbps:n('channelRate'),
    channelUtilLimitPct:channelLimit,
    msePortRateGbps:n('mseRate'),
    msePortUtilLimitPct:mseLimit,
    reservePct:n('reserve'),
    boardPorts:n('boardPorts'),
    mseCount:n('mseCount'),
    physicalDiversity:b('physical'),
    separateRing:b('ring'),
    separateSystem:b('system')
  });
  if(!r.ok){
    $('result').hidden=true;
    $('inputState').textContent=zh?'请检查 OLT 数量与容量输入。':'Check OLT count and capacity inputs.';
    return;
  }
  $('result').hidden=false;
  $('inputState').textContent=zh?'双上联、波道与 MSE 故障态容量已更新。':'Dual-uplink, channel and MSE failure-state capacity updated.';
  [
    ['oltPorts',r.oltPhysicalUplinkPorts,''],
    ['channelsSide',r.channelsRequiredPerSide,''],
    ['channelsTotal',r.totalProvisionedChannels,''],
    ['msePortsSide',r.msePortsRequiredPerSide,''],
    ['boards',r.boardsTotal,''],
    ['failureChannel',r.failureChannelUtilPct,'%'],
    ['failureMse',r.failureMseUtilPct,'%'],
    ['headroom',r.headroomOlts,zh?' 台':' OLTs']
  ].forEach(([id,v,u])=>$(id).textContent=fmt(v,1)+u);

  $('risk').textContent=riskLabel[r.risk]||String(r.risk).toUpperCase();
  $('risk').className='status '+(r.risk==='low'?'healthy':r.risk==='medium'?'caution':r.risk==='critical'?'critical':'high');

  setUtilization('channelUtilBar','channelLimitMarker','channelLimitText',r.failureChannelUtilPct,channelLimit);
  setUtilization('mseUtilBar','mseLimitMarker','mseLimitText',r.failureMseUtilPct,mseLimit);

  const checks=zh?
    [['传输波道',r.channelPass],['MSE 端口',r.msePass],['双路由独立性',r.diversityPass]]:
    [['Transport channels',r.channelPass],['MSE ports',r.msePass],['Path diversity',r.diversityPass]];
  $('checks').innerHTML=checks.map(([label,pass])=>
    `<li class="${pass?'pass':'fail'}"><span>${label}</span><strong>${pass?(zh?'通过':'PASS'):(zh?'不通过':'FAIL')}</strong></li>`
  ).join('');

  if(r.warnings.length){
    $('warnings').innerHTML=r.warnings.map(x=>`<li>${wm[x]}</li>`).join('');
  }else{
    $('warnings').innerHTML=`<li class="no-warning">${zh?'当前输入下未发现主要容量或共同失效风险。':'No major capacity or common-mode failure warning under the entered assumptions.'}</li>`;
  }
}

document.querySelectorAll('input,select').forEach(el=>el.addEventListener('input',run));
$('calculate').addEventListener('click',run);
run();
})();
