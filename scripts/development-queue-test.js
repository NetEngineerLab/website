'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const queue = require('./development-queue');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'development-queue-test-'));
try {
  const dir = path.join(root, 'docs/roadmap'); fs.mkdirSync(dir, { recursive: true });
  const fields = ['roadmap_id', 'tool_name', 'domain_group', 'primary_domain', 'priority', 'overlap_decision', 'gate_status', 'canonical_problem_id', 'problem_statement', 'inputs', 'outputs', 'core_logic', 'target_user', 'audit_owner', 'audit_version', 'audit_notes', 'problem_is_defined', 'inputs_outputs_are_explicit', 'core_logic_is_defined', 'source_is_verifiable', 'method_is_verifiable', 'validation_is_verifiable', 'cross_site_decision', 'value_user_need_evidence', 'value_engineering_value_evidence'];
  const row = Object.fromEntries(fields.map(k => [k, 'EVIDENCED: fixture']));
  Object.assign(row, { roadmap_id: 'TOOL-002', tool_name: 'Name, "quoted"\nsecond line', domain_group: 'Group', primary_domain: 'Primary Domain', priority: 'P1', overlap_decision: 'KEEP', gate_status: 'PASS', cross_site_decision: 'NETWORK_SPECIFIC_CONFIRMED' });
  Object.assign(row, { canonical_problem_id: 'CP-FIXTURE-002', audit_owner: 'admission-agent', audit_version: '2026-10-11', audit_notes: 'Signed by admission-reviewer; evidence proof.txt' });
  const other = { ...row, roadmap_id: 'TOOL-003', priority: 'P2', gate_status: 'NOT_STARTED' };
  const duplicate = { ...row, roadmap_id: 'TOOL-001', overlap_decision: 'REJECT_DUPLICATE' };
  const matrixPath = path.join(dir, 'PHASE0_AUDIT_MATRIX.csv');
  const originalMatrix = queue.serializeCSV(fields, [duplicate, other, row]); fs.writeFileSync(matrixPath, originalMatrix);
  fs.writeFileSync(path.join(dir, 'DEVELOPMENT_QUEUE_STATE.json'), JSON.stringify({ schemaVersion: 1, completed: [] }));
  fs.writeFileSync(path.join(root, 'proof.txt'), 'actual fixture evidence');
  const evidence = { toolId: 'TOOL-002', implementationAgent: 'implementer', reviewerAgent: 'reviewer', productionDeployment: false, admission: { status: 'PASS', reviewerAgent: 'admission-reviewer', evidencePaths: ['proof.txt'] }, acceptance: { status: 'PASS', reviewerAgent: 'reviewer', evidencePaths: ['proof.txt'] }, tests: [{ command: 'node meaningful-test.js', status: 'PASS', evidencePath: 'proof.txt' }] };
  const writeEvidence = e => fs.writeFileSync(path.join(root, 'evidence.json'), JSON.stringify(e));
  assert.equal(queue.parseCSV(originalMatrix).rows[2].tool_name, row.tool_name);
  queue.sync(root); assert.equal(queue.status(root).pending, 2); assert.equal(queue.status(root).nextCandidate.id, 'TOOL-002');
  const candidatesPath = path.join(dir, 'DEVELOPMENT_CANDIDATES.csv');
  const before = fs.readFileSync(candidatesPath, 'utf8');
  assert.ok(fs.readFileSync(path.join(dir, 'DEVELOPMENT_CANDIDATES.md'), 'utf8').includes('## Primary Domain'));
  function rejected(e, id = 'TOOL-002') { writeEvidence(e); assert.throws(() => queue.complete(root, id, 'evidence.json')); assert.equal(fs.readFileSync(candidatesPath, 'utf8'), before); assert.equal(queue.status(root).completed, 0); }
  rejected({ ...evidence, reviewerAgent: 'implementer' });
  rejected({ ...evidence, admission: { ...evidence.admission, reviewerAgent: 'implementer' } });
  rejected({ ...evidence, acceptance: { ...evidence.acceptance, evidencePaths: [] } });
  rejected({ ...evidence, tests: [{ command: 'node test.js', status: 'FAIL', evidencePath: 'proof.txt' }] });
  rejected({ ...evidence, tests: [...evidence.tests, { command: 'node test.js', status: 'SKIP', evidencePath: 'proof.txt' }] });
  rejected({ ...evidence, admission: { ...evidence.admission, evidencePaths: ['missing.txt'] } });
  fs.writeFileSync(path.join(root, 'empty.txt'), '');
  rejected({ ...evidence, admission: { ...evidence.admission, evidencePaths: ['empty.txt'] } });
  fs.writeFileSync(path.join(root, 'empty.txt'), ' \r\n\t ');
  rejected({ ...evidence, tests: [{ ...evidence.tests[0], evidencePath: 'empty.txt' }] });
  rejected({ ...evidence, productionDeployment: true });
  rejected({ ...evidence, toolId: 'TOOL-003' }, 'TOOL-003');
  rejected({ ...evidence, tests: [{ ...evidence.tests[0], evidencePath: '../outside.txt' }] });
  for (const mutation of [{ problem_is_defined: 'PENDING' }, { problem_is_defined: 'FAIL' }, { method_is_verifiable: 'NOT_STARTED' }, { source_is_verifiable: 'EVIDENCED:   ' }, { value_user_need_evidence: 'FAIL' }, { value_user_need_evidence: 'NOT_STARTED' }, { value_user_need_evidence: 'EVIDENCED:' }, { value_user_need_evidence: 'PENDING' }, { cross_site_decision: 'PENDING' }, { overlap_decision: 'UNREVIEWED' }]) {
    fs.writeFileSync(matrixPath, queue.serializeCSV(fields, [duplicate, other, { ...row, ...mutation }])); rejected(evidence);
  }
  for (const field of ['canonical_problem_id', 'problem_statement', 'inputs', 'outputs', 'core_logic', 'target_user', 'primary_domain']) {
    for (const invalid of ['PENDING', '   ']) { fs.writeFileSync(matrixPath, queue.serializeCSV(fields, [duplicate, other, { ...row, [field]: invalid }])); rejected(evidence); }
  }
  for (const mutation of [{ audit_owner: 'UNASSIGNED' }, { audit_owner: '' }, { audit_version: '' }, { audit_notes: 'No reviewer signature' }]) {
    fs.writeFileSync(matrixPath, queue.serializeCSV(fields, [duplicate, other, { ...row, ...mutation }])); rejected(evidence);
  }
  fs.writeFileSync(matrixPath, originalMatrix); writeEvidence(evidence);
  const statePath = path.join(dir, 'DEVELOPMENT_QUEUE_STATE.json');
  const completed = queue.complete(root, 'TOOL-002', 'evidence.json'); assert.equal(completed.id, 'TOOL-002');
  assert.equal(queue.complete(root, 'TOOL-002', 'evidence.json').alreadyCompleted, true);
  queue.sync(root); assert.equal(queue.status(root).pending, 1); assert.equal(queue.status(root).completed, 1);
  assert.deepEqual(queue.parseCSV(fs.readFileSync(candidatesPath, 'utf8')).rows.map(r => r.roadmap_id), ['TOOL-003']);
  assert.deepEqual(queue.defer(root, 'TOOL-003', 'user requested hold while mapping is pending'), { id: 'TOOL-003', reason: 'user requested hold while mapping is pending', deferred: true });
  assert.equal(queue.status(root).pending, 0); assert.equal(queue.status(root).deferred, 1); assert.equal(queue.status(root).nextCandidate, null);
  assert.deepEqual(queue.parseCSV(fs.readFileSync(candidatesPath, 'utf8')).rows.map(r => r.roadmap_id), []);
  const deferredState = fs.readFileSync(statePath, 'utf8');
  assert.throws(() => queue.block(root, 'TOOL-003', 'conflicting block'), /cannot be blocked/);
  assert.throws(() => queue.complete(root, 'TOOL-003', 'evidence.json'), /cannot be completed/);
  assert.equal(fs.readFileSync(statePath, 'utf8'), deferredState);
  assert.equal(queue.status(root).deferred, 1); assert.equal(queue.status(root).blocked, 0); assert.equal(queue.status(root).completed, 1);
  assert.equal(queue.defer(root, 'TOOL-003', 'duplicate request').alreadyDeferred, true);
  assert.deepEqual(queue.resume(root, 'TOOL-003'), { id: 'TOOL-003', resumed: true });
  assert.equal(queue.status(root).pending, 1); assert.equal(queue.status(root).deferred, 0);
  assert.deepEqual(queue.parseCSV(fs.readFileSync(candidatesPath, 'utf8')).rows.map(r => r.roadmap_id), ['TOOL-003']);
  assert.deepEqual(queue.block(root, 'TOOL-003', 'missing authoritative scope'), { id: 'TOOL-003', reason: 'missing authoritative scope', blocked: true });
  assert.equal(queue.status(root).pending, 0); assert.equal(queue.status(root).blocked, 1); assert.equal(queue.status(root).nextCandidate, null);
  assert.deepEqual(queue.parseCSV(fs.readFileSync(candidatesPath, 'utf8')).rows.map(r => r.roadmap_id), []);
  const blockedState = fs.readFileSync(statePath, 'utf8');
  assert.throws(() => queue.defer(root, 'TOOL-003', 'conflicting defer'), /must be unblocked/);
  assert.throws(() => queue.complete(root, 'TOOL-003', 'evidence.json'), /cannot be completed/);
  assert.equal(fs.readFileSync(statePath, 'utf8'), blockedState);
  assert.equal(queue.status(root).blocked, 1); assert.equal(queue.status(root).deferred, 0); assert.equal(queue.status(root).completed, 1);
  assert.equal(queue.block(root, 'TOOL-003', 'duplicate block').alreadyBlocked, true);
  assert.deepEqual(queue.unblock(root, 'TOOL-003'), { id: 'TOOL-003', unblocked: true });
  assert.equal(queue.status(root).pending, 1); assert.equal(queue.status(root).blocked, 0);
  assert.deepEqual(queue.parseCSV(fs.readFileSync(candidatesPath, 'utf8')).rows.map(r => r.roadmap_id), ['TOOL-003']);
  assert.equal(fs.readFileSync(matrixPath, 'utf8'), originalMatrix);
  assert.equal((fs.readFileSync(path.join(dir, 'DEVELOPMENT_COMPLETED.md'), 'utf8').match(/TOOL-002/g) || []).length, 1);
  assert.ok(!fs.readFileSync(path.join(dir, 'DEVELOPMENT_CANDIDATES.md'), 'utf8').includes('TOOL-002'));
  fs.writeFileSync(matrixPath, queue.serializeCSV(fields, [duplicate, other, { ...row, gate_status: 'NOT_STARTED' }]));
  queue.sync(root); assert.equal(queue.status(root).completed, 1);
  const validState = fs.readFileSync(statePath, 'utf8');
  const corrupt = JSON.parse(validState); corrupt.completed[0].completedAt = 'invalid-date'; fs.writeFileSync(statePath, JSON.stringify(corrupt));
  assert.throws(() => queue.sync(root), /Invalid completion record/);
  fs.writeFileSync(statePath, validState);
  writeEvidence({ ...evidence, reviewerAgent: 'implementer' }); assert.throws(() => queue.sync(root), /Independent reviewer required/);
  writeEvidence(evidence);
  console.log('PASS: CSV round trip; rejection leaves queue intact; independent evidence gates; completion is idempotent; sync preserves completed history and source matrix.');
} finally { fs.rmSync(root, { recursive: true, force: true }); }
