'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { computeRecordHash, validateSource, validateEligibility } = require('./lib/mib-preauthorization-eligibility');

const trusted = Object.freeze({ reviewerIdentities: Object.freeze(['reviewer:alice@example.test']), currentDate: '2026-09-09' });

function fixture() {
  const source = {
    schemaVersion: 'source-ledger-source/1.0.0', sourceId: '', sourceKey: 'ietf-rfc-code-components', authorityNamespace: 'ietf',
    authorityBaseUrls: ['https://www.rfc-editor.org/'], policyClass: 'CONDITIONAL_CODE_COMPONENT',
    evidenceUrls: ['https://trustee.ietf.org/', 'https://trustee.ietf.org/documents/trust-legal-provisions/', 'https://www.rfc-editor.org/'], handlingRule: 'Review each RFC.', recordHash: ''
  };
  source.recordHash = computeRecordHash(source, ['sourceId', 'recordHash']);
  source.sourceId = `source-${source.recordHash}`;
  assert.equal(source.recordHash, 'bc035b2e1f69c336883447cc077a1f9ba8747726a6f26d3fb2e62b32d71e398a', 'source canonical hash fixed vector drifted');
  const preauthorization = {
    schemaVersion: 'source-ledger/1.0.0', preauthorizationId: '', recordHash: '', sourceId: source.sourceId,
    requestedSourceUrl: 'https://www.rfc-editor.org/rfc/rfc2578.txt', expectedDocumentId: 'RFC 2578',
    allowedAction: 'acquire-for-license-review-only', policySnapshot: 'ietf-publication-date-policy',
    policyEvidenceUrl: 'https://trustee.ietf.org/documents/trust-legal-provisions/', approvedBy: trusted.reviewerIdentities[0], approvedAt: '2026-09-09'
  };
  preauthorization.recordHash = computeRecordHash(preauthorization, ['preauthorizationId', 'recordHash']);
  preauthorization.preauthorizationId = `pa-${preauthorization.recordHash}`;
  assert.equal(preauthorization.recordHash, '4dc54026c58c474b5176564dc2a766672a66538233d8860d77eb03727b41418a', 'preauthorization canonical hash fixed vector drifted');
  return { source, preauthorization };
}

function rejects(code, mutate, context = trusted, mode = 'eligibility') {
  const { source, preauthorization } = fixture();
  mutate(source, preauthorization);
  const run = mode === 'source' ? () => validateSource(source) : () => validateEligibility(source, preauthorization, context);
  assert.throws(run, (error) => error && error.code === code, `${code} mutation did not produce its own error code`);
}

const baseline = fixture();
assert.equal(validateEligibility(baseline.source, baseline.preauthorization, trusted), true);

const cases = [
  ['SOURCE_FIELDS', (s) => { s.extra = 'x'; }],
  ['SOURCE_SCHEMA_VERSION', (s) => { s.schemaVersion = 'source-ledger/1.0.0'; }],
  ['SOURCE_FIELD_TYPE', (s) => { s.handlingRule = 'Cafe\u0301'; }],
  ['SOURCE_FIELD_TYPE', (s) => { s.handlingRule = '\ud800'; }],
  ['SOURCE_POLICY_CLASS', (s) => { s.policyClass = 'TRUSTED'; }],
  ['SOURCE_POLICY_INELIGIBLE', (s) => { s.policyClass = 'BLOCKED_UNVERIFIED'; }],
  ['SOURCE_POLICY_INELIGIBLE', (s) => { s.policyClass = 'METADATA_LINK_ONLY'; }],
  ['SOURCE_POLICY_INELIGIBLE', (s) => { s.policyClass = 'ALLOW_REGISTRY_DATA'; }],
  ['SOURCE_URL_ORDER', (s) => { s.evidenceUrls.reverse(); }],
  ['SOURCE_URL_ORDER', (s) => { s.authorityBaseUrls.length = 2; }],
  ['SOURCE_URL', (s) => { s.authorityBaseUrls = ['http://www.rfc-editor.org/']; }],
  ['SOURCE_ID_HASH', (s) => { s.sourceId = `source-${'0'.repeat(64)}`; }],
  ['SOURCE_HASH_MISMATCH', (s) => { s.handlingRule = 'Changed'; }],
  ['PREAUTH_FIELDS', (_s, p) => { delete p.expectedDocumentId; }],
  ['PREAUTH_SCHEMA_VERSION', (_s, p) => { p.schemaVersion = 'source-ledger/2.0.0'; }],
  ['PREAUTH_FIELD_TYPE', (_s, p) => { p.expectedDocumentId = '\udfff'; }],
  ['ALLOWED_ACTION', (_s, p) => { p.allowedAction = 'download'; }],
  ['REVIEWER_IDENTITY', (_s, p) => { p.approvedBy = 'reviewer:alice@example.test '; }],
  ['APPROVAL_DATE', (_s, p) => { p.approvedAt = '2026-02-30'; }],
  ['APPROVAL_FUTURE', (_s, p) => { p.approvedAt = '2026-09-10'; }],
  ['SOURCE_LINK', (_s, p) => { p.sourceId = `source-${'0'.repeat(64)}`; }],
  ['REQUEST_URL', (_s, p) => { p.requestedSourceUrl = 'https://www.rfc-editor.org:8443/rfc/rfc2578.txt'; }],
  ['REQUEST_URL', (_s, p) => { p.requestedSourceUrl += '?raw=1'; }],
  ['REQUEST_URL', (_s, p) => { p.requestedSourceUrl = 'https://www.rfc-editor.org/rfc/%2e%2e/secret'; }],
  ['SOURCE_URL_BOUNDARY', (_s, p) => { p.requestedSourceUrl = 'https://www.rfc-editor.org.example/rfc/rfc2578.txt'; }],
  ['SOURCE_URL_BOUNDARY', (s, p) => { s.authorityBaseUrls = ['https://www.rfc-editor.org/rfc/']; s.recordHash = computeRecordHash(s, ['sourceId', 'recordHash']); s.sourceId = `source-${s.recordHash}`; p.sourceId = s.sourceId; p.requestedSourceUrl = 'https://www.rfc-editor.org/rfc2/file.txt'; }],
  ['POLICY_URL', (_s, p) => { p.policyEvidenceUrl += '#claim'; }],
  ['POLICY_EVIDENCE_LINK', (_s, p) => { p.policyEvidenceUrl = 'https://example.test/policy'; }],
  ['PREAUTH_ID_HASH', (_s, p) => { p.preauthorizationId = `pa-${'0'.repeat(64)}`; }],
  ['PREAUTH_HASH_MISMATCH', (_s, p) => { p.expectedDocumentId = 'RFC 9999'; }]
];
for (const [code, mutate] of cases) rejects(code, mutate);
rejects('TRUSTED_REVIEWERS', () => {}, { currentDate: '2026-09-09' });
rejects('TRUSTED_REVIEWERS', () => {}, { reviewerIdentities: new Array(1), currentDate: '2026-09-09' });
rejects('TRUSTED_DATE', () => {}, { reviewerIdentities: [...trusted.reviewerIdentities], currentDate: '2026-02-30' });
rejects('APPROVAL_DATE', (_s, p) => { p.approvedAt = '0000-01-01'; });
assert.throws(() => computeRecordHash({ value: 1 }, []), (error) => error && error.code === 'CANONICAL_TYPE');

const currentSource = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'records', 'mib', 'source-ledger-source-ietf-rfc-code-components.json'), 'utf8'));
assert.throws(() => validateSource(currentSource), (error) => error && error.code === 'SOURCE_SCHEMA_VERSION', 'current immutable source must be rejected for its legacy schemaVersion');
const currentPa = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'records', 'mib', 'pa-rfc2578-snmpv2-smi.json'), 'utf8'));
assert.throws(() => validateEligibility(currentSource, currentPa, trusted), (error) => error && error.code === 'REVIEWER_IDENTITY', 'current immutable preauthorization must be rejected for its generic role identity');

console.log(`MIB preauthorization eligibility validator: valid synthetic chain and ${cases.length + 5} isolated rejection cases verified; current immutable records rejected without modification.`);
