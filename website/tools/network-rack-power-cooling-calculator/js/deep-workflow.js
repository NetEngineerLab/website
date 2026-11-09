(() => {
  'use strict';
  if (document.getElementById('nelDeepWorkflow')) return;
  const lang = (document.documentElement.lang || 'en').toLowerCase();
  const zh = lang.startsWith('zh');
  const slug = document.documentElement.dataset.nelRoute || location.pathname.replace(/^\//, '');
  const basePath = slug.endsWith('/') ? slug : `${slug}/`;
  const website = `https://netengineerlab.com/${basePath}${zh ? '' : ''}`;
  const title = zh ? '深度方案与工程输出' : (lang.startsWith('es')?'Escenarios y resultados de ingeniería':'Deep scenarios & engineering outputs');
  const sourceLabel = zh ? '网站地址' : (lang.startsWith('es')?'Sitio web':'Website');
  const fields = [...document.querySelectorAll('main input, main select, main textarea')];
  const read = () => Object.fromEntries(fields.filter(e => e.id).map(e => [e.id, e.value]));
  const formatValue = (value) => { const n = Number(value); return Number.isFinite(n) && value !== '' ? String(Number(n.toFixed(4))) : value; };
  const setNumeric = (values, factor) => Object.fromEntries(Object.entries(values).map(([k, v]) => {
    const n = Number(v); return [k, Number.isFinite(n) && n > 0 ? formatValue(n * factor) : v];
  }));
  const resultText = () => document.querySelector('main .nel-tool-result, main [id="result"]')?.innerText || '';
  const escapeHtml = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const conclusions = (text) => text.split(/\n+/).map(s => s.replace(/[▥☷]/g, '').trim()).filter(Boolean).filter(s => !/^(工程计算结果|Engineering results|查看计算容量|Review calculated capacity)/i.test(s)).join('；');
  const download = (name, body, type) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([body], {type})); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); };
  const csv = (obj) => [['Field', 'Value'], ...Object.entries(obj)].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const section = document.createElement('section'); section.id = 'nelDeepWorkflow'; section.className = 'content-section nel-tool-supporting-section';
  section.innerHTML = `<h2>${title}</h2><p>${zh ? '基于当前输入快速比较基线、增长和保守场景，并导出可追溯工程成果。' : 'Compare baseline, growth and conservative scenarios from the current inputs, then export traceable engineering outputs.'}</p><p class="deep-source">${sourceLabel}：<a href="${website}">${website}</a></p><div class="deep-actions"><button type="button" data-action="compare">${zh ? '比较方案' : (lang.startsWith('es')?'Comparar escenarios':'Compare scenarios')}</button><button type="button" data-action="print">${zh ? '打印工程报告' : (lang.startsWith('es')?'Imprimir informe técnico':'Print engineering report')}</button><button type="button" data-action="report">${zh ? '导出工程报告' : (lang.startsWith('es')?'Exportar informe técnico':'Export engineering report')}</button><button type="button" data-action="bom">${zh ? '导出 BOM' : (lang.startsWith('es')?'Exportar BOM':'Export BOM')}</button></div><p class="deep-feedback" role="status" aria-live="polite"></p><div class="table-wrap"><table><thead><tr><th>${zh ? '场景' : (lang.startsWith('es')?'Escenario':'Scenario')}</th><th>${zh ? '输入摘要' : (lang.startsWith('es')?'Resumen de entradas':'Input summary')}</th><th>${zh ? '重要结论' : (lang.startsWith('es')?'Conclusiones principales':'Key conclusions')}</th></tr></thead><tbody></tbody></table></div>`;
  const main = document.querySelector('main');
  if (document.querySelector('.below>.prose')) document.querySelector('.below>.prose').appendChild(section); else if (main?.parentNode) main.parentNode.insertBefore(section, main.nextSibling);
  else document.body.appendChild(section);
  const body = section.querySelector('tbody'), feedback = section.querySelector('.deep-feedback');
  // Existing comparison must recompute each scenario, not repeat baseline result text.
  const scenarios = () => {const base=read();return [1,1.1,1.2].map(f=>{const input={...base,loadW:String(Number(base.loadW)*f)};return {factor:f,input,result:window.NELRackEngine.calculate(input)}})};
  const scenarioSummary = r => r.ok ? `${zh?'设计功率':lang.startsWith('es')?'Potencia de diseño':'Design'} ${r.designKW} kW · ${r.current} A · ${r.btu} BTU/h · ${r.monthly} kWh` : (zh?'输入无效':'Invalid input');
  const render = () => {body.innerHTML=scenarios().map(({factor,input,result},index)=>`<tr><td>${zh?['当前基线','增长场景 +10%','保守场景 +20%'][index]:(lang.startsWith('es')?['Base','Crecimiento +10%','Conservador +20%']:['Baseline','Growth +10%','Conservative +20%'])[index]}</td><td>loadW=${formatValue(input.loadW)} · qty=${escapeHtml(input.qty)} · util=${escapeHtml(input.util)}%</td><td>${escapeHtml(scenarioSummary(result))}</td></tr>`).join('')};
  section.querySelector('[data-action="compare"]').onclick = () => { render(); feedback.textContent = zh ? '方案比较已更新。' : (lang.startsWith('es')?'Comparación actualizada.':'Scenario comparison updated.'); };
  section.querySelector('[data-action="print"]').onclick = () => { window.print(); feedback.textContent = zh ? '已打开打印预览。' : (lang.startsWith('es')?'Vista de impresión abierta.':'Print preview opened.'); };
  section.querySelector('[data-action="report"]').onclick = () => { download('netengineerlab-engineering-report.json', JSON.stringify({tool: document.title, website, locale: lang, generatedAt: new Date().toISOString(), inputs: read(), result: resultText(), scenarios: scenarios()}, null, 2), 'application/json;charset=utf-8'); feedback.textContent = zh ? '工程报告已开始下载。' : (lang.startsWith('es')?'Descarga del informe iniciada.':'Engineering report download started.'); };
  section.querySelector('[data-action="bom"]').onclick = () => { const values = read(); download('netengineerlab-bom.csv', csv({'Tool': document.title, 'Generated at': new Date().toISOString(), Locale: lang, 'Website URL': website, ...values}), 'text/csv;charset=utf-8'); feedback.textContent = zh ? 'BOM 已开始下载。' : (lang.startsWith('es')?'Descarga de BOM iniciada.':'BOM download started.'); };
  render();
})();
