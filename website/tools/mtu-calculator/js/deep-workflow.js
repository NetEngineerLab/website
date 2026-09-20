(() => {
  'use strict';
  if (document.getElementById('nelDeepWorkflow')) return;
  const engine = window.MTUEngine;
  if (!engine || typeof engine.calculate !== 'function') return;
  const zh = (document.documentElement.lang || '').toLowerCase().startsWith('zh');
  const text = zh ? {
    title:'深度工程校核与交付输出', intro:'按基线、增长和保守场景重算链路；同时检查分片边界、帧长、冗余与故障边界。', compare:'刷新场景比较', report:'导出工程报告', bom:'导出BOM/校核表', print:'打印工程报告', feedback:'已更新工程校核', scenario:'场景', mtu:'有效内层MTU', mss:'TCP MSS', risk:'风险', gate:'门禁', beforeAfter:'Before / After', action:'建议动作', baseline:'基线', growth:'增长 +10%', conservative:'保守 +20%', before:'Before', after:'After', pass:'通过', review:'复核', block:'阻断'
  } : {
    title:'Deep engineering validation & deliverables', intro:'Recalculate baseline, growth and conservative paths while checking fragmentation, frame limits, redundancy and failure boundaries.', compare:'Refresh scenario comparison', report:'Export engineering report', bom:'Export BOM / check sheet', print:'Print engineering report', feedback:'Engineering validation updated', scenario:'Scenario', mtu:'Effective inner MTU', mss:'TCP MSS', risk:'Risk', gate:'Gate', beforeAfter:'Before / After', action:'Recommended action', baseline:'Baseline', growth:'Growth +10%', conservative:'Conservative +20%', before:'Before', after:'After', pass:'PASS', review:'REVIEW', block:'BLOCK'
  };
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const val = id => document.getElementById(id)?.value;
  const read = () => {
    const layers = [...document.querySelectorAll('#layerBody select[id^="layer-type-ids"], #layerBody select[id^="layer-type-"]')].map(select => {
      const id = select.id.replace('layer-type-','');
      return { type: select.value, bytes: Number(document.getElementById(`layer-bytes-${id}`)?.value || 0), count: Number(document.getElementById(`layer-count-${id}`)?.value || 0) };
    });
    return { underlayMtu:Number(val('underlayMtu')), desiredInnerMtu:Number(val('desiredInnerMtu')), outerVlanTags:Number(val('outerVlanTags')), strictVlan:val('vlanMode') === 'strict', innerIp:val('innerIp'), ipExtraBytes:Number(val('ipExtraBytes')), tcpOptionsBytes:Number(val('tcpOptionsBytes')), layers, pathCount:2 };
  };
  const fmt = v => Number.isFinite(Number(v)) ? Number(v).toLocaleString() : '—';
  const download = (name, body, type) => { const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([body],{type})); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); };
  const csv = rows => '\uFEFF' + rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g,'""')}"`).join(',')).join('\n');
  const section = document.createElement('section'); section.id='nelDeepWorkflow'; section.className='content-section nel-tool-supporting-section mtu-deep-workflow';
  section.innerHTML = `<div class="deep-head"><div><p class="eyebrow">ENGINEERING GATE</p><h2>${text.title}</h2><p>${text.intro}</p></div><span class="deep-version">MTU model v2.0</span></div><div class="deep-actions"><button type="button" data-action="compare">${text.compare}</button><button type="button" data-action="report">${text.report}</button><button type="button" data-action="bom">${text.bom}</button><button type="button" data-action="print">${text.print}</button></div><p class="deep-feedback" role="status" aria-live="polite"></p><div class="deep-grid"><div class="table-wrap"><table class="deep-table"><thead><tr><th>${text.scenario}</th><th>${text.mtu}</th><th>${text.mss}</th><th>${text.risk}</th><th>${text.gate}</th></tr></thead><tbody data-scenarios></tbody></table></div><div class="before-after"><h3>${text.beforeAfter}</h3><div data-ba></div><h3>${text.action}</h3><ul data-actions></ul></div></div>`;
  const main = document.querySelector('main'); if (main?.parentNode) main.parentNode.insertBefore(section, main.nextSibling); else document.body.appendChild(section);
  const scenarioBody=section.querySelector('[data-scenarios]'), ba=section.querySelector('[data-ba]'), actions=section.querySelector('[data-actions]'), feedback=section.querySelector('.deep-feedback');
  const localizeAction = action => !zh ? action : ({
    'Set inner MTU to the effective path MTU':'将内层 MTU 调整为路径有效 MTU',
    'Keep target MTU within path limit':'保持目标 MTU 不超过路径上限',
    'Provide a second path or document single-path acceptance':'提供第二条路径，或记录单路径验收依据',
    'Validate both paths with PMTUD':'使用 PMTUD 验证两条路径'
  }[action] || action);
  const render = () => { const input=read(), scenarios=engine.compareScenarios(input), pair=engine.beforeAfter(input); scenarioBody.innerHTML=scenarios.map(s=>`<tr><td>${esc(s.name)}</td><td>${fmt(s.result.effectiveInnerMtu)} B</td><td>${fmt(s.result.advertisedMss)} B</td><td><span class="risk-chip ${s.result.riskLevel.toLowerCase()}">${s.result.riskLevel}</span></td><td>${esc(s.result.engineering.acceptance)}</td></tr>`).join(''); ba.innerHTML=`<div class="ba-row"><span>${text.before}</span><strong>${fmt(pair.before.effectiveInnerMtu)} B / ${pair.before.riskLevel}</strong></div><div class="ba-arrow">→</div><div class="ba-row"><span>${text.after}</span><strong>${fmt(pair.after.effectiveInnerMtu)} B / ${pair.after.riskLevel}</strong></div>`; actions.innerHTML=pair.actions.map(a=>`<li>${esc(localizeAction(a))}</li>`).join(''); return {input,scenarios,pair}; };
  section.querySelector('[data-action="compare"]').onclick=()=>{render();feedback.textContent=text.feedback;};
  section.querySelector('[data-action="report"]').onclick=()=>{const d=render(), report=engine.professionalReport(d.input,{project:val('projectName')||'MTU design'});download('netengineerlab-mtu-engineering-report.json',JSON.stringify(report,null,2),'application/json;charset=utf-8');feedback.textContent=text.report;};
  section.querySelector('[data-action="bom"]').onclick=()=>{const d=render();download('netengineerlab-mtu-bom-check.csv',csv(engine.bom(d.input)), 'text/csv;charset=utf-8');feedback.textContent=text.bom;};
  section.querySelector('[data-action="print"]').onclick=()=>{render();window.print();feedback.textContent=text.print;};
  render();
})();
