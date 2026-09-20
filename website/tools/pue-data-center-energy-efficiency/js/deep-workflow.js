(() => {
  'use strict';
  if (document.getElementById('nelDeepWorkflow')) return;
  const zh = (document.documentElement.lang || '').toLowerCase().startsWith('zh');
  const engine = window.NELPUEEngine;
  if (!engine || typeof engine.calculate !== 'function') return;
  const fields = [...document.querySelectorAll('main input, main select, main textarea')].filter(el => el.id);
  const read = () => Object.fromEntries(fields.map(el => [el.id, el.value]));
  const toInput = values => Object.fromEntries(Object.entries(values).map(([key, value]) => {
    if (key === 'mode' || key === 'monthlyPUE') return [key, value];
    const number = Number(value);
    return [key, value === '' || !Number.isFinite(number) ? value : number];
  }));
  const scaled = (values, factor) => { const out = {...values}; ['total','it','cooling','ups','lighting','distribution','other','annualWaterL','annualCO2kg'].forEach(key => { const n = Number(out[key]); if (Number.isFinite(n) && n >= 0) out[key] = String(n * factor); }); return out; };
  const fmt = value => Number.isFinite(value) ? Number(value.toFixed(3)).toLocaleString() : '—';
  const summary = result => result.ok ? (zh ? `PUE ${fmt(result.pue)}；年总能耗 ${fmt(result.annualTotal)} kWh；目标节能 ${fmt(result.savingsKWh)} kWh` : `PUE ${fmt(result.pue)}; annual facility energy ${fmt(result.annualTotal)} kWh; target saving ${fmt(result.savingsKWh)} kWh`) : (zh ? '输入无效，无法计算' : 'Invalid inputs; scenario not calculated');
  const escape = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const website = `https://netengineerlab.com${location.pathname.endsWith('/') ? location.pathname : `${location.pathname}/`}`;
  const section = document.createElement('section'); section.id = 'nelDeepWorkflow'; section.className = 'content-section nel-tool-supporting-section';
  section.innerHTML = `<h2>${zh ? '深度场景与工程输出' : 'Deep scenarios & engineering outputs'}</h2><p>${zh ? '基于当前输入重新计算基线、增长和保守场景，并导出可追溯结果。' : 'Recalculate baseline, growth and conservative scenarios from the current inputs, then export traceable results.'}</p><p class="deep-source">${zh ? '网站地址' : 'Website'}：<a href="${website}">${website}</a></p><div class="deep-actions"><button type="button" data-action="compare">${zh ? '比较场景' : 'Compare scenarios'}</button><button type="button" data-action="print">${zh ? '打印工程报告' : 'Print engineering report'}</button><button type="button" data-action="report">${zh ? '导出工程报告' : 'Export engineering report'}</button></div><p class="deep-feedback" role="status" aria-live="polite"></p><div class="table-wrap"><table><thead><tr><th>${zh ? '场景' : 'Scenario'}</th><th>${zh ? '输入摘要' : 'Input summary'}</th><th>${zh ? '计算结论' : 'Calculated conclusion'}</th></tr></thead><tbody></tbody></table></div>`;
  const main = document.querySelector('main'); (main?.parentNode || document.body).insertBefore(section, main?.nextSibling || null);
  const body = section.querySelector('tbody'), feedback = section.querySelector('.deep-feedback');
  const render = () => { const base = read(); const scenarios = [[zh ? '当前基线' : 'Baseline', base, 1], [zh ? '增长 +10%' : 'Growth +10%', scaled(base, 1.1), 1.1], [zh ? '保守 +20%' : 'Conservative +20%', scaled(base, 1.2), 1.2]]; body.innerHTML = scenarios.map(([name, values, factor]) => { const result = engine.calculate(toInput(values)); const shown = ['total','it'].map(key => `${key}=${escape(values[key])}`).join(', '); return `<tr><td>${name}</td><td>${shown}${factor === 1 ? '' : ` (${Math.round((factor - 1) * 100)}%)`}</td><td>${escape(summary(result))}</td></tr>`; }).join(''); };
  section.querySelector('[data-action="compare"]').onclick = () => { render(); feedback.textContent = zh ? '场景比较已更新。' : 'Scenario comparison updated.'; };
  section.querySelector('[data-action="print"]').onclick = () => { window.print(); feedback.textContent = zh ? '已打开打印预览。' : 'Print preview opened.'; };
  section.querySelector('[data-action="report"]').onclick = () => { const current = read(); const report = {tool: document.title, website, locale: document.documentElement.lang || 'en', generatedAt: new Date().toISOString(), scenarios: [1,1.1,1.2].map(factor => { const values = factor === 1 ? current : scaled(current, factor); return {factor, inputs: toInput(values), result: engine.calculate(toInput(values))}; })}; const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], {type: 'application/json'})); link.download = 'netengineerlab-pue-scenarios.json'; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 1000); feedback.textContent = zh ? '工程报告下载已开始。' : 'Engineering report download started.'; };
  render();
})();
