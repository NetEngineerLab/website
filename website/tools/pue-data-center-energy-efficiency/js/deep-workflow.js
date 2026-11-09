(() => {
  'use strict';
  if (document.getElementById('nelDeepWorkflow')) return;
  const engine = window.NELPUEEngine;
  if (!engine || typeof engine.calculate !== 'function') return;
  const lang0 = (document.documentElement.lang || 'en').toLowerCase();
  const zh = lang0.startsWith('zh');
  const es = lang0.startsWith('es');
  const loc = zh ? 'zh-CN' : es ? 'es-ES' : 'en-US';
  const T = zh ? {
    title: '深度场景与工程输出',
    intro: '基于当前输入重算基线、增长与保守场景。等比例抬升总能耗与 IT 时 PUE 可保持不变，比较表如实呈现，不会伪造差异。',
    compare: '比较场景', print: '打印工程报告', report: '导出工程报告',
    scenario: '场景', inputs: '输入摘要', conclusion: '计算结论',
    baseline: '当前基线', growth: '增长 +10%', conserv: '保守 +20%',
    updated: '场景比较已更新。', printed: '已打开打印预览。', exported: '工程报告下载已开始。',
    invalid: '输入无效，无法计算',
    pue: 'PUE', annual: '年总能耗', save: '目标节能',
    noteSame: '三场景 PUE 相同：总能耗与 IT 等比例缩放时比值不变。'
  } : es ? {
    title: 'Escenarios profundos y salidas de ingeniería',
    intro: 'Recalcula línea base, crecimiento y escenario conservador desde las entradas actuales. Si la energía total y la IT escalan en la misma proporción, el PUE puede no cambiar; la tabla lo muestra sin inventar diferencias.',
    compare: 'Comparar escenarios', print: 'Imprimir informe', report: 'Exportar informe',
    scenario: 'Escenario', inputs: 'Resumen de entradas', conclusion: 'Conclusión calculada',
    baseline: 'Línea base', growth: 'Crecimiento +10%', conserv: 'Conservador +20%',
    updated: 'Comparación de escenarios actualizada.', printed: 'Vista de impresión abierta.', exported: 'Descarga del informe iniciada.',
    invalid: 'Entradas no válidas; no se calculó el escenario',
    pue: 'PUE', annual: 'Energía anual total', save: 'Ahorro objetivo',
    noteSame: 'PUE idéntico en los tres escenarios: al escalar total e IT en la misma proporción, la razón no cambia.'
  } : {
    title: 'Deep scenarios & engineering outputs',
    intro: 'Recalculate baseline, growth and conservative scenarios from the current inputs. When total and IT energy scale proportionally, PUE can stay the same — the table shows that honestly.',
    compare: 'Compare scenarios', print: 'Print engineering report', report: 'Export engineering report',
    scenario: 'Scenario', inputs: 'Input summary', conclusion: 'Calculated conclusion',
    baseline: 'Baseline', growth: 'Growth +10%', conserv: 'Conservative +20%',
    updated: 'Scenario comparison updated.', printed: 'Print preview opened.', exported: 'Engineering report download started.',
    invalid: 'Invalid inputs; scenario not calculated',
    pue: 'PUE', annual: 'Annual facility energy', save: 'Target saving',
    noteSame: 'Identical PUE across scenarios: proportional total/IT scaling leaves the ratio unchanged.'
  };

  const fields = [...document.querySelectorAll('main input, main select, main textarea')].filter(el => el.id);
  const read = () => Object.fromEntries(fields.map(el => [el.id, el.value]));
  const toInput = values => Object.fromEntries(Object.entries(values).map(([key, value]) => {
    if (key === 'mode' || key === 'monthlyPUE') return [key, value];
    const number = Number(value);
    return [key, value === '' || !Number.isFinite(number) ? value : number];
  }));
  const scaled = (values, factor) => {
    const out = { ...values };
    ['total','it','cooling','ups','lighting','distribution','other','annualWaterL','annualCO2kg'].forEach(key => {
      const n = Number(out[key]);
      if (Number.isFinite(n) && n >= 0) out[key] = String(n * factor);
    });
    return out;
  };
  // Display rounding only — engine still receives raw scaled numbers via toInput(Number(...))
  const dispNum = (v, maxFrac = 3) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return String(v ?? '—');
    const rounded = Number(n.toFixed(maxFrac));
    return rounded.toLocaleString(loc, { maximumFractionDigits: maxFrac });
  };
  const fmtResult = (v, maxFrac = 3) => Number.isFinite(v)
    ? Number(v.toFixed(maxFrac)).toLocaleString(loc, { maximumFractionDigits: maxFrac })
    : '—';
  const escape = value => String(value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const section = document.createElement('section');
  section.id = 'nelDeepWorkflow';
  section.className = 'content-section nel-tool-supporting-section';
  section.innerHTML = `
    <h2>${T.title}</h2>
    <p>${T.intro}</p>
    <div class="deep-actions">
      <button type="button" class="btn btn-primary" data-action="compare">${T.compare}</button>
      <button type="button" class="btn btn-ghost" data-action="print">${T.print}</button>
      <button type="button" class="btn btn-ghost" data-action="report">${T.report}</button>
    </div>
    <p class="deep-feedback" role="status" aria-live="polite"></p>
    <div class="table-wrap"><table>
      <thead><tr><th>${T.scenario}</th><th>${T.inputs}</th><th>${T.conclusion}</th></tr></thead>
      <tbody></tbody>
    </table></div>
    <p class="deep-note" hidden data-same-pue></p>`;

  // Mount inside right prose (Bandwidth/OPB below = toc | prose). Fallback only if prose missing.
  const prose = document.querySelector('.below > .prose') || document.querySelector('.prose');
  if (prose) {
    const meth = prose.querySelector('#methodology, details#methodology');
    const faq = prose.querySelector('#faq, .faq, .blk.faq');
    if (meth && meth.nextSibling) prose.insertBefore(section, meth.nextSibling);
    else if (faq) prose.insertBefore(section, faq);
    else prose.appendChild(section);
  } else {
    const main = document.querySelector('main');
    (main?.parentNode || document.body).insertBefore(section, main?.nextSibling || null);
  }

  // TOC anchor for deep module
  const toc = document.querySelector('.below > .toc');
  if (toc && !toc.querySelector('a[href="#nelDeepWorkflow"]')) {
    const a = document.createElement('a');
    a.href = '#nelDeepWorkflow';
    a.textContent = T.title;
    const refs = toc.querySelector('a[href="#references"], a[href="#nel-tool-graph"]');
    if (refs) toc.insertBefore(a, refs);
    else toc.appendChild(a);
  }

  const body = section.querySelector('tbody');
  const feedback = section.querySelector('.deep-feedback');
  const sameNote = section.querySelector('[data-same-pue]');

  const conclusionHTML = (result) => {
    if (!result.ok) return escape(T.invalid);
    return `<div class="deep-conclusion">
      <div class="deep-kpi"><span class="label">${T.pue}</span><strong><span>${escape(fmtResult(result.pue, 3))}</span></strong></div>
      <div class="deep-kpi"><span class="label">${T.annual}</span><strong><span>${escape(fmtResult(result.annualTotal, 0))}</span><small>kWh</small></strong></div>
      <div class="deep-kpi"><span class="label">${T.save}</span><strong><span>${escape(fmtResult(result.savingsKWh, 0))}</span><small>kWh</small></strong></div>
    </div>`;
  };

  const inputSummary = (values, factor) => {
    const total = dispNum(values.total, 3);
    const it = dispNum(values.it, 3);
    const pct = factor === 1 ? '' : ` (${Math.round((factor - 1) * 100)}%)`;
    return `total=${escape(total)}, it=${escape(it)}${pct}`;
  };

  const buildScenarios = () => {
    const base = read();
    return [
      [T.baseline, base, 1],
      [T.growth, scaled(base, 1.1), 1.1],
      [T.conserv, scaled(base, 1.2), 1.2],
    ].map(([name, values, factor]) => {
      const raw = toInput(values);
      const result = engine.calculate(raw);
      return { name, values, factor, raw, result };
    });
  };

  const render = () => {
    const scenarios = buildScenarios();
    body.innerHTML = scenarios.map(s =>
      `<tr><td>${escape(s.name)}</td><td>${inputSummary(s.values, s.factor)}</td><td>${conclusionHTML(s.result)}</td></tr>`
    ).join('');
    const pues = scenarios.map(s => s.result.ok ? Number(s.result.pue.toFixed(6)) : null);
    const allSame = pues.every(p => p != null && p === pues[0]);
    if (allSame) {
      sameNote.hidden = false;
      sameNote.textContent = T.noteSame;
    } else {
      sameNote.hidden = true;
      sameNote.textContent = '';
    }
    return scenarios;
  };

  section.querySelector('[data-action="compare"]').onclick = () => {
    render();
    feedback.textContent = T.updated;
  };
  section.querySelector('[data-action="print"]').onclick = () => {
    render();
    // Single print of current document; CSS hides chrome/actions to avoid meaningless chrome noise.
    window.print();
    feedback.textContent = T.printed;
  };
  section.querySelector('[data-action="report"]').onclick = () => {
    const scenarios = render();
    const report = {
      tool: document.title,
      locale: document.documentElement.lang || 'en',
      generatedAt: new Date().toISOString(),
      note: 'display.* fields are rounded for humans; inputs/result keep calculation precision.',
      scenarios: scenarios.map(s => ({
        name: s.name,
        factor: s.factor,
        inputs: s.raw,
        display: {
          total: dispNum(s.values.total, 3),
          it: dispNum(s.values.it, 3),
          pue: s.result.ok ? fmtResult(s.result.pue, 3) : null,
          annualTotal: s.result.ok ? fmtResult(s.result.annualTotal, 0) : null,
          savingsKWh: s.result.ok ? fmtResult(s.result.savingsKWh, 0) : null,
        },
        result: s.result,
      })),
    };
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
    link.download = 'netengineerlab-pue-scenarios.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    feedback.textContent = T.exported;
  };
  render();
})();
