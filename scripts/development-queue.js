'use strict';
const fs = require('node:fs');
const path = require('node:path');
const mandatory = ['problem_is_defined', 'inputs_outputs_are_explicit', 'core_logic_is_defined', 'source_is_verifiable', 'method_is_verifiable', 'validation_is_verifiable'];
function parseCSV(text) {
  const rows = []; let row = [], field = '', quoted = false;
  text = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) { if (c === '"' && text[i + 1] === '"') { field += '"'; i++; } else if (c === '"') quoted = false; else field += c; }
    else if (c === '"' && field === '') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\r' || c === '\n') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(field); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (quoted) throw new Error('Unterminated quoted CSV field');
  if (field || row.length) { row.push(field); rows.push(row); }
  const headers = rows.shift(); if (!headers) throw new Error('Empty matrix');
  return { headers, rows: rows.filter(r => r.some(Boolean)).map(r => { if (r.length !== headers.length) throw new Error('CSV column count mismatch'); return Object.fromEntries(headers.map((h, i) => [h, r[i]])); }) };
}
const serializeCSV = (headers, rows) => [headers, ...rows.map(r => headers.map(h => r[h]))].map(r => r.map(v => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(',')).join('\r\n') + '\r\n';
const md = value => String(value).replace(/\|/g, '\\|').replace(/[\r\n]+/g, ' ');
const substantive = value => typeof value === 'string' && value.trim() !== '' && !/\bPENDING\b/i.test(value);
const evidenced = value => substantive(value) && /^EVIDENCED:\s*\S/i.test(value.trim());
function repoFile(root, relative) {
  if (typeof relative !== 'string' || !relative.trim() || path.isAbsolute(relative) || /^[A-Za-z]:/.test(relative)) throw new Error('Evidence paths must be repository-relative');
  const full = path.resolve(root, relative), rel = path.relative(root, full);
  if (rel === '..' || rel.startsWith('..' + path.sep)) throw new Error('Evidence path escapes repository');
  const realRoot = fs.realpathSync(root), real = fs.realpathSync(full), realRel = path.relative(realRoot, real);
  if (realRel === '..' || realRel.startsWith('..' + path.sep) || !fs.statSync(real).isFile()) throw new Error('Evidence must be a repository file');
  if (!fs.readFileSync(real, 'utf8').trim()) throw new Error('Evidence file must contain non-whitespace content');
  return full;
}
function readQueue(root) {
  const dir = path.join(root, 'docs/roadmap');
  const matrix = parseCSV(fs.readFileSync(path.join(dir, 'PHASE0_AUDIT_MATRIX.csv'), 'utf8'));
  if (new Set(matrix.rows.map(r => r.roadmap_id)).size !== matrix.rows.length) throw new Error('Duplicate matrix IDs');
  const state = JSON.parse(fs.readFileSync(path.join(dir, 'DEVELOPMENT_QUEUE_STATE.json'), 'utf8'));
  if (state.schemaVersion !== 1 || !Array.isArray(state.completed) || (state.deferred !== undefined && !Array.isArray(state.deferred)) || (state.blocked !== undefined && !Array.isArray(state.blocked))) throw new Error('Invalid queue state');
  if (!Array.isArray(state.deferred)) state.deferred = [];
  if (!Array.isArray(state.blocked)) state.blocked = [];
  if (new Set(state.completed.map(r => r.id)).size !== state.completed.length) throw new Error('Duplicate completed IDs');
  for (const record of state.completed) {
    if (!record || !matrix.rows.some(r => r.roadmap_id === record.id) || !substantive(record.name) || !substantive(record.completedAt) || !Number.isFinite(Date.parse(record.completedAt))) throw new Error('Invalid completion record');
    const evidence = JSON.parse(fs.readFileSync(repoFile(root, record.evidencePath), 'utf8'));
    validateEvidence(root, { roadmap_id: record.id }, evidence, false);
  }
  const deferredIds = new Set();
  for (const record of state.deferred) {
    if (!record || !matrix.rows.some(r => r.roadmap_id === record.id) || deferredIds.has(record.id) || state.blocked?.some(r => r.id === record.id) || state.completed.some(r => r.id === record.id) || typeof record.reason !== 'string' || !record.reason.trim() || !substantive(record.deferredAt) || !Number.isFinite(Date.parse(record.deferredAt))) throw new Error('Invalid deferral record');
    deferredIds.add(record.id);
  }
  const blockedIds = new Set();
  for (const record of state.blocked) {
    if (!record || !matrix.rows.some(r => r.roadmap_id === record.id) || blockedIds.has(record.id) || deferredIds.has(record.id) || state.completed.some(r => r.id === record.id) || typeof record.reason !== 'string' || !record.reason.trim() || !substantive(record.blockedAt) || !Number.isFinite(Date.parse(record.blockedAt))) throw new Error('Invalid blocked record');
    blockedIds.add(record.id);
  }
  return { dir, matrix, state };
}
function sync(root) {
  const { dir, matrix, state } = readQueue(root), done = new Set(state.completed.map(r => r.id)), deferred = new Set(state.deferred.map(r => r.id)), blocked = new Set(state.blocked.map(r => r.id));
  const rows = matrix.rows.filter(r => r.overlap_decision !== 'REJECT_DUPLICATE' && !done.has(r.roadmap_id) && !deferred.has(r.roadmap_id) && !blocked.has(r.roadmap_id));
  fs.writeFileSync(path.join(dir, 'DEVELOPMENT_CANDIDATES.csv'), serializeCSV(matrix.headers, rows));
  let markdown = `# 新工具开发候选清单\n\n共 **${rows.length} 个待处理候选**。按准入审核后逐项开发；只有准入通过、测试通过及独立验收通过，才可移入完成记录。清单本身不授权开发或上线。\n\n原始字段见 [CSV 清单](DEVELOPMENT_CANDIDATES.csv)；重复项见 [审计归档](REJECTED_DUPLICATES_ARCHIVE.md)；已验收项见 [完成记录](DEVELOPMENT_COMPLETED.md)。\n`;
  const groups = [...new Set(rows.map(r => r.primary_domain))].sort();
  for (const group of groups) {
    const subset = rows.filter(r => r.primary_domain === group);
    markdown += `\n## ${md(group)}（${subset.length} 项）\n\n| 编号 | 工具名称 | 优先级 | 准入审核状态 |\n| --- | --- | --- | --- |\n`;
    for (const r of subset) markdown += `| ${md(r.roadmap_id)} | ${md(r.tool_name)} | ${md(r.priority)} | ${md(r.gate_status)} |\n`;
  }
  fs.writeFileSync(path.join(dir, 'DEVELOPMENT_CANDIDATES.md'), markdown);
  fs.writeFileSync(path.join(dir, 'DEVELOPMENT_COMPLETED.md'), '# 已验收开发记录\n\n仅记录独立验收和测试均通过的工具；不表示生产上线。\n\n| 编号 | 工具名称 | 完成时间 | 验收证据 |\n| --- | --- | --- | --- |\n' + state.completed.map(r => `| ${md(r.id)} | ${md(r.name)} | ${md(r.completedAt)} | ${md(r.evidencePath)} |`).join('\n') + '\n');
  return rows;
}
function validateEvidence(root, row, e, validateAdmissionMatrix = true) {
  if (e.toolId !== row.roadmap_id) throw new Error('Evidence toolId mismatch');
  if (!substantive(e.implementationAgent) || !substantive(e.reviewerAgent) || e.implementationAgent.trim() === e.reviewerAgent.trim()) throw new Error('Independent reviewer required');
  if (e.productionDeployment !== false) throw new Error('productionDeployment must be false');
  for (const section of ['admission', 'acceptance']) {
    const s = e[section];
    if (!s || s.status !== 'PASS' || !substantive(s.reviewerAgent) || s.reviewerAgent.trim() === e.implementationAgent.trim()) throw new Error(`${section} independent PASS required`);
    if (section === 'acceptance' && s.reviewerAgent !== e.reviewerAgent) throw new Error('Acceptance reviewer identity mismatch');
    if (!Array.isArray(s.evidencePaths) || !s.evidencePaths.length) throw new Error(`${section} evidence required`);
    s.evidencePaths.forEach(p => repoFile(root, p));
  }
  if (!Array.isArray(e.tests) || !e.tests.length) throw new Error('Tests required');
  for (const t of e.tests) { if (t.status !== 'PASS' || !substantive(t.command)) throw new Error('Every test must PASS with a command'); repoFile(root, t.evidencePath); }
  if (!validateAdmissionMatrix) return;
  if (row.gate_status !== 'PASS' || !['KEEP', 'NO_OVERLAP'].includes(row.overlap_decision)) throw new Error('Matrix admission has not passed');
  if (!['canonical_problem_id', 'problem_statement', 'inputs', 'outputs', 'core_logic', 'target_user', 'primary_domain'].every(k => substantive(row[k]))) throw new Error('Canonical problem and fingerprint fields required');
  if (!substantive(row.audit_owner) || row.audit_owner.trim() === 'UNASSIGNED' || !substantive(row.audit_version) || !substantive(row.audit_notes) || !row.audit_notes.includes(e.admission.reviewerAgent)) throw new Error('Matrix admission reviewer signature required');
  if (!mandatory.every(k => evidenced(row[k]))) throw new Error('Mandatory matrix evidence incomplete');
  if (Object.keys(row).filter(k => k.startsWith('value_') && evidenced(row[k])).length < 2) throw new Error('At least two value evidence fields required');
  if (row.cross_site_decision !== 'NETWORK_SPECIFIC_CONFIRMED' && !/^EVIDENCED:\s*\S/i.test(row.cross_site_decision)) throw new Error('Cross-site decision evidence required');
}
function complete(root, id, evidencePath) {
  const { dir, matrix, state } = readQueue(root);
  if (state.completed.some(r => r.id === id)) { sync(root); return { alreadyCompleted: true, id }; }
  if (state.deferred.some(r => r.id === id) || state.blocked.some(r => r.id === id)) throw new Error('Deferred or blocked candidates cannot be completed');
  const row = matrix.rows.find(r => r.roadmap_id === id); if (!row) throw new Error('Unknown tool ID');
  const evidence = JSON.parse(fs.readFileSync(repoFile(root, evidencePath), 'utf8'));
  validateEvidence(root, row, evidence);
  const record = { id, name: row.tool_name, evidencePath, completedAt: new Date().toISOString() };
  state.completed.push(record);
  fs.writeFileSync(path.join(dir, 'DEVELOPMENT_QUEUE_STATE.json'), JSON.stringify(state, null, 2) + '\n');
  sync(root); return record;
}
function defer(root, id, reason) {
  const { dir, matrix, state } = readQueue(root);
  if (!matrix.rows.some(r => r.roadmap_id === id)) throw new Error('Unknown tool ID');
  if (state.completed.some(r => r.id === id)) throw new Error('Completed candidates cannot be deferred');
  if (state.blocked.some(r => r.id === id)) throw new Error('Blocked candidates must be unblocked before deferral');
  if (typeof reason !== 'string' || !reason.trim()) throw new Error('Deferral reason required');
  if (state.deferred.some(r => r.id === id)) return { alreadyDeferred: true, id };
  state.deferred.push({ id, reason: reason.trim(), deferredAt: new Date().toISOString() });
  fs.writeFileSync(path.join(dir, 'DEVELOPMENT_QUEUE_STATE.json'), JSON.stringify(state, null, 2) + '\n');
  sync(root);
  return { id, reason: reason.trim(), deferred: true };
}
function resume(root, id) {
  const { dir, state } = readQueue(root);
  const index = state.deferred.findIndex(r => r.id === id);
  if (index < 0) throw new Error('Candidate is not deferred');
  state.deferred.splice(index, 1);
  fs.writeFileSync(path.join(dir, 'DEVELOPMENT_QUEUE_STATE.json'), JSON.stringify(state, null, 2) + '\n');
  sync(root);
  return { id, resumed: true };
}
function block(root, id, reason) {
  const { dir, matrix, state } = readQueue(root);
  if (!matrix.rows.some(r => r.roadmap_id === id)) throw new Error('Unknown tool ID');
  if (state.completed.some(r => r.id === id) || state.deferred.some(r => r.id === id)) throw new Error('Completed or deferred candidates cannot be blocked');
  if (typeof reason !== 'string' || !reason.trim()) throw new Error('Block reason required');
  if (state.blocked.some(r => r.id === id)) return { alreadyBlocked: true, id };
  state.blocked.push({ id, reason: reason.trim(), blockedAt: new Date().toISOString() });
  fs.writeFileSync(path.join(dir, 'DEVELOPMENT_QUEUE_STATE.json'), JSON.stringify(state, null, 2) + '\n');
  sync(root);
  return { id, reason: reason.trim(), blocked: true };
}
function unblock(root, id) {
  const { dir, state } = readQueue(root);
  const index = state.blocked.findIndex(r => r.id === id);
  if (index < 0) throw new Error('Candidate is not blocked');
  state.blocked.splice(index, 1);
  fs.writeFileSync(path.join(dir, 'DEVELOPMENT_QUEUE_STATE.json'), JSON.stringify(state, null, 2) + '\n');
  sync(root);
  return { id, unblocked: true };
}
function status(root) {
  const { matrix, state } = readQueue(root), done = new Set(state.completed.map(r => r.id)), deferred = new Set(state.deferred.map(r => r.id)), blocked = new Set(state.blocked.map(r => r.id));
  const pending = matrix.rows.filter(r => r.overlap_decision !== 'REJECT_DUPLICATE' && !done.has(r.roadmap_id) && !deferred.has(r.roadmap_id) && !blocked.has(r.roadmap_id)).sort((a, b) => a.priority.localeCompare(b.priority, undefined, { numeric: true }) || a.roadmap_id.localeCompare(b.roadmap_id));
  return { pending: pending.length, completed: state.completed.length, deferred: state.deferred.length, blocked: state.blocked.length, blockedCandidates: state.blocked, nextCandidate: pending[0] ? { id: pending[0].roadmap_id, name: pending[0].tool_name, priority: pending[0].priority, gateStatus: pending[0].gate_status } : null, authorization: 'Candidate selection only; admission and independent acceptance remain required.', productionDeployment: false };
}
if (require.main === module) {
  try {
    const [command, id, flag, evidencePath, ...rest] = process.argv.slice(2), root = path.resolve(__dirname, '..');
    let result;
    if (command === 'status' && !id) result = status(root);
    else if (command === 'sync' && !id) result = { pending: sync(root).length };
    else if (command === 'complete' && id && flag === '--evidence' && evidencePath && !rest.length) result = complete(root, id, evidencePath);
    else if (command === 'defer' && id && flag === '--reason' && evidencePath && !rest.length) result = defer(root, id, evidencePath);
    else if (command === 'resume' && id && !flag && !evidencePath && !rest.length) result = resume(root, id);
    else if (command === 'block' && id && flag === '--reason' && evidencePath && !rest.length) result = block(root, id, evidencePath);
    else if (command === 'unblock' && id && !flag && !evidencePath && !rest.length) result = unblock(root, id);
    else throw new Error('Usage: node scripts/development-queue.js status | sync | defer TOOL-ID --reason "text" | resume TOOL-ID | block TOOL-ID --reason "text" | unblock TOOL-ID | complete TOOL-ID --evidence repo-relative.json');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { parseCSV, serializeCSV, sync, status, complete, defer, resume, block, unblock, validateEvidence };
