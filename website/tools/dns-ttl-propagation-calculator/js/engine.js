(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.NELToolEngine = api;
  root.NELDnsTtlEngine = api;
})(globalThis, function () {
  'use strict';
  const round = (value, digits = 1) => { const factor = 10 ** digits; return Math.round((value + Number.EPSILON) * factor) / factor; };
  const numberOr = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  function scenario(input, name, oldTtl, newTtl, elapsed, negativeTtl, authDelay) {
    const remainingSeconds = Math.max(oldTtl - elapsed, 0), typicalSeconds = remainingSeconds * 0.5 + authDelay, worstSeconds = Math.max(remainingSeconds, negativeTtl) + authDelay;
    const lowerBeforeHours = numberOr(input.lowerBefore, 24), oldQueries = oldTtl > 0 ? 86400 / oldTtl : 86400, newQueries = 86400 / newTtl, warnings = [];
    if (lowerBeforeHours * 3600 < oldTtl) warnings.push('lowerTtlTooLate');
    if (newTtl < 60) warnings.push('highAuthoritativeQps');
    return { name, oldTtl, newTtl, remaining: round(remainingSeconds / 60), typical: round(typicalSeconds / 60), worst: round(worstSeconds / 60), lowerAt: round(lowerBeforeHours), stableAfter: round(Math.max(newTtl, negativeTtl) / 60), oldQueries: round(oldQueries), newQueries: round(newQueries), queryIncrease: round(newQueries / oldQueries), warnings, status: warnings.includes('lowerTtlTooLate') ? 'warning' : 'pass' };
  }
  function validInput(input) {
    const raw = ['oldTtl', 'newTtl', 'elapsed', 'authDelay', 'lowerBefore', 'negativeTtl'].map((key) => input[key]);
    if (!raw.every((value) => Number.isFinite(Number(value)))) return false;
    const [oldTtl, newTtl, elapsed, authDelay, lowerBefore, negativeTtl] = raw.map(Number);
    if (['peakOldTtl', 'authPropagationSec', 'resolverCount', 'resolverGrowthPct', 'staleServePct'].some((key) => Object.prototype.hasOwnProperty.call(input, key) && !Number.isFinite(Number(input[key])))) return false;
    if (Object.prototype.hasOwnProperty.call(input, 'peakOldTtl') && Number(input.peakOldTtl) < 0) return false;
    if (Object.prototype.hasOwnProperty.call(input, 'authPropagationSec') && Number(input.authPropagationSec) < 0) return false;
    if (Object.prototype.hasOwnProperty.call(input, 'resolverCount') && Number(input.resolverCount) < 1) return false;
    if (Object.prototype.hasOwnProperty.call(input, 'resolverGrowthPct') && Number(input.resolverGrowthPct) < 0) return false;
    if (Object.prototype.hasOwnProperty.call(input, 'staleServePct') && (Number(input.staleServePct) < 0 || Number(input.staleServePct) > 100)) return false;
    return oldTtl >= 0 && newTtl > 0 && elapsed >= 0 && authDelay >= 0 && lowerBefore >= 0 && negativeTtl >= 0;
  }
  function calculate(input = {}) {
    if (!input || !validInput(input)) return { ok: false };
    const oldTtl = Number(input.oldTtl), newTtl = Number(input.newTtl), elapsed = Number(input.elapsed), authDelay = Number(input.authDelay), negativeTtl = Number(input.negativeTtl);
    const baseline = scenario(input, 'baseline', oldTtl, newTtl, elapsed, negativeTtl, authDelay);
    const legacy = { ok: true, remaining: baseline.remaining, typical: baseline.typical, worst: baseline.worst, lowerAt: baseline.lowerAt, stableAfter: baseline.stableAfter, oldQueries: baseline.oldQueries, newQueries: baseline.newQueries, queryIncrease: baseline.queryIncrease, status: baseline.status };
    if (!Object.prototype.hasOwnProperty.call(input, 'peakOldTtl')) return legacy;
    const peakOldTtl = numberOr(input.peakOldTtl, oldTtl), resolverCount = Math.max(1, Math.floor(numberOr(input.resolverCount, 3))), resolverGrowthPct = clamp(numberOr(input.resolverGrowthPct, 0), 0, 500), staleServePct = clamp(numberOr(input.staleServePct, 0), 0, 100);
    const after = scenario(input, 'afterChange', Math.max(oldTtl, peakOldTtl), newTtl, elapsed, negativeTtl, authDelay + numberOr(input.authPropagationSec, 0));
    const risks = [];
    if (baseline.warnings.includes('lowerTtlTooLate')) risks.push({ code: 'LOWER_TTL_WINDOW', severity: 'high', message: 'TTL was not lowered early enough', action: 'Lower TTL earlier or move the change window' });
    if (staleServePct > 0) risks.push({ code: 'STALE_SERVE', severity: 'high', message: 'Resolvers may serve stale data', action: 'Check serve-stale policy and authoritative reachability' });
    const projectedQueryIncrease = baseline.queryIncrease * (1 + resolverGrowthPct / 100);
    if (projectedQueryIncrease > 5) risks.push({ code: 'AUTH_QPS', severity: 'medium', message: 'Authoritative query load may multiply', action: 'Validate authoritative capacity and rate limits' });
    return { ...legacy, modelVersion: 'dns-ttl-engine/2.0.0', risk: risks.some((risk) => risk.severity === 'high') ? 'high' : risks.length ? 'caution' : 'healthy', risks, resolverCount, staleServePct, scenarios: { baseline, afterChange: after }, beforeAfter: { before: baseline, after, delta: { worstMin: round(after.worst - baseline.worst), newQueries: round(after.newQueries - baseline.newQueries) } }, checks: { ttlLoweredInTime: !baseline.warnings.includes('lowerTtlTooLate'), staleServeReviewed: staleServePct === 0, authoritativeLoadReviewed: projectedQueryIncrease <= 5 } };
  }
  function buildReport(input) { return { schemaVersion: 'dns-ttl-engineering-report/2.0.0', tool: 'dns-ttl-propagation-calculator', generatedAt: new Date().toISOString(), inputs: input, result: calculate(input) }; }
  function toJSON(value) { return JSON.stringify(value && value.result ? value : buildReport(value || {}), null, 2); }
  function toCSV(value) { const result = value && value.result ? value.result : value, scenarios = result && result.scenarios ? Object.values(result.scenarios) : [], rows = [['scenario', 'remainingMin', 'typicalMin', 'worstMin', 'newQueriesPerDay', 'queryIncrease', 'status']]; scenarios.forEach((item) => rows.push([item.name, item.remaining, item.typical, item.worst, item.newQueries, item.queryIncrease, item.status])); return rows.map((row) => row.join(',')).join('\n'); }
  return { calculate, buildReport, toJSON, toCSV };
});
