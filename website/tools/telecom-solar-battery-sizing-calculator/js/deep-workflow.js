(() => {
  'use strict';
  if (document.getElementById('nelDeepWorkflow')) return;
  const zh = (document.documentElement.lang || '').toLowerCase().startsWith('zh');
  const engine = window.NELSolarEngine;
  if (!engine || typeof engine.calculate !== 'function') return;
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = new URL(zh ? '../css/deep-workflow.css' : 'css/deep-workflow.css', location.href).href;
  document.head.appendChild(style);

  const fields = [...document.querySelectorAll('main input, main select, main textarea')].filter((field) => field.id);
  const read = () => Object.fromEntries(fields.map((field) => [field.id, field.value]));
  const toInput = (values) => Object.fromEntries(Object.entries(values).map(([key, value]) => {
    if (key === 'scenario') return [key, value];
    const parsed = Number(value);
    return [key, value === '' || !Number.isFinite(parsed) ? value : parsed];
  }));
  const scaleLoads = (values, factor) => {
    const scaled = { ...values };
    ['telecomKW', 'transportKW', 'coolingKW', 'auxKW'].forEach((key) => {
      const parsed = Number(scaled[key]);
      if (Number.isFinite(parsed) && parsed >= 0) scaled[key] = String(parsed * factor);
    });
    return scaled;
  };
  const format = (value, digits = 2) => Number.isFinite(value) ? Number(value.toFixed(digits)).toLocaleString() : '—';
  const escape = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const website = `https://netengineerlab.com${location.pathname}`;
  const scenarioSet = () => {
    const base = read();
    return [
      { name: zh ? '当前基线' : 'Baseline', factor: 1, inputs: base },
      { name: zh ? '增长场景 +10%' : 'Growth +10%', factor: 1.1, inputs: scaleLoads(base, 1.1) },
      { name: zh ? '保守场景 +20%' : 'Conservative +20%', factor: 1.2, inputs: scaleLoads(base, 1.2) }
    ].map((scenario) => ({ ...scenario, result: engine.calculate(toInput(scenario.inputs)) }));
  };
  const summary = (result) => {
    if (!result.ok) return zh ? `输入无效：${(result.errors || []).join('、')}` : `Invalid input: ${(result.errors || []).join(', ')}`;
    const supplement = result.gridSupplement || result.generatorSupplement || 0;
    return zh
      ? `日耗电 ${format(result.dailyLoad)} kWh；所需光伏 ${format(result.requiredPV)} kWp；储能 ${format(result.batteryNominal)} kWh；覆盖率 ${format(result.coverage, 1)}%；补能 ${format(supplement)} kWh/日`
      : `Load ${format(result.dailyLoad)} kWh/day; PV ${format(result.requiredPV)} kWp; battery ${format(result.batteryNominal)} kWh; coverage ${format(result.coverage, 1)}%; supplement ${format(supplement)} kWh/day`;
  };
  const download = (name, body, type) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([body], { type }));
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };
  const csv = (rows) => rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');

  const section = document.createElement('section');
  section.id = 'nelDeepWorkflow';
  section.className = 'content-section nel-tool-supporting-section';
  section.innerHTML = `<h2>${zh ? '深度场景与工程输出' : 'Deep scenarios & engineering outputs'}</h2><p>${zh ? '基于当前输入重新计算基线、增长和保守场景，并导出可追溯结果。' : 'Recalculate baseline, growth and conservative scenarios from the current inputs, then export traceable results.'}</p><p class="deep-source">${zh ? '网站地址' : 'Website'}：<a href="${website}">${website}</a></p><div class="deep-actions"><button type="button" data-action="compare">${zh ? '比较场景' : 'Compare scenarios'}</button><button type="button" data-action="print">${zh ? '打印工程报告' : 'Print engineering report'}</button><button type="button" data-action="report">${zh ? '导出工程报告' : 'Export engineering report'}</button><button type="button" data-action="bom">${zh ? '导出 BOM' : 'Export BOM'}</button></div><p class="deep-feedback" role="status" aria-live="polite"></p><div class="table-wrap"><table><thead><tr><th>${zh ? '场景' : 'Scenario'}</th><th>${zh ? '输入摘要' : 'Input summary'}</th><th>${zh ? '计算结论' : 'Calculated conclusion'}</th></tr></thead><tbody></tbody></table></div>`;
  const main = document.querySelector('main');
  if (main?.parentNode) main.parentNode.insertBefore(section, main.nextSibling);
  else document.body.appendChild(section);

  const body = section.querySelector('tbody');
  const feedback = section.querySelector('.deep-feedback');
  const render = () => {
    body.innerHTML = scenarioSet().map(({ name, inputs, result, factor }) => {
      const inputSummary = ['telecomKW', 'transportKW', 'coolingKW', 'auxKW'].map((key) => `${key}=${escape(inputs[key])}`).join(', ');
      return `<tr><td>${escape(name)}</td><td>${inputSummary}${factor === 1 ? '' : ` (${Math.round((factor - 1) * 100)}%)`}</td><td>${escape(summary(result))}</td></tr>`;
    }).join('');
  };
  section.querySelector('[data-action="compare"]').onclick = () => { render(); feedback.textContent = zh ? '场景比较已更新。' : 'Scenario comparison updated.'; };
  section.querySelector('[data-action="print"]').onclick = () => { window.print(); feedback.textContent = zh ? '已打开打印预览。' : 'Print preview opened.'; };
  section.querySelector('[data-action="report"]').onclick = () => {
    const scenarios = scenarioSet();
    download('netengineerlab-telecom-solar-scenarios.json', JSON.stringify({ tool: document.title, website, locale: document.documentElement.lang || 'en', generatedAt: new Date().toISOString(), scenarios }, null, 2), 'application/json;charset=utf-8');
    feedback.textContent = zh ? '工程报告已开始下载。' : 'Engineering report download started.';
  };
  section.querySelector('[data-action="bom"]').onclick = () => {
    const rows = [['Scenario', 'Factor', 'Required PV (kWp)', 'Installed PV (kWp)', 'Modules', 'Strings', 'Battery (kWh)', 'Battery (Ah)', 'PV gap (kWp)', 'Battery gap (kWh)']];
    scenarioSet().forEach(({ name, factor, result }) => {
      rows.push([name, factor, result.ok ? result.requiredPV : '', result.ok ? result.installedPV : '', result.ok ? result.installedModules : '', result.ok ? result.strings : '', result.ok ? result.batteryNominal : '', result.ok ? result.batteryAh : '', result.ok ? result.pvGap : '', result.ok ? result.battGap : '']);
    });
    download('netengineerlab-telecom-solar-bom.csv', csv(rows), 'text/csv;charset=utf-8');
    feedback.textContent = zh ? 'BOM 已开始下载。' : 'BOM download started.';
  };
  render();
})();
