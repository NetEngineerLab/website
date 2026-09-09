const fs = require('node:fs');
const path = require('node:path');

const schemaPath = path.join(__dirname, '..', 'schemas', 'mib', 'source-ledger.schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const required = {
  source: ['schemaVersion', 'sourceId', 'sourceKey', 'authorityNamespace', 'authorityBaseUrls', 'policyClass', 'evidenceUrls', 'handlingRule', 'recordHash'],
  preauthorization: ['schemaVersion', 'preauthorizationId', 'recordHash', 'sourceId', 'requestedSourceUrl', 'expectedDocumentId', 'allowedAction', 'policySnapshot', 'policyEvidenceUrl', 'approvedBy', 'approvedAt'],
  acquisition: ['schemaVersion', 'acquisitionId', 'recordHash', 'preauthorizationId', 'sourceId', 'finalSourceUrl', 'networkHops', 'retrievedAt', 'contentSha256', 'contentBytes', 'httpStatus', 'responseContentType', 'responseContentEncoding', 'responseTransferEncoding', 'declaredContentLength'],
  review: ['schemaVersion', 'reviewId', 'recordHash', 'acquisitionId', 'sourceId', 'reviewScope', 'supersedesReviewId', 'documentId', 'documentStream', 'publicationDate', 'licenseStatus', 'applicableTlpVersion', 'licenseEvidenceUrl', 'licenseEvidenceSha256', 'copyrightNotice', 'restrictionLegend', 'pre5378Status', 'attribution', 'redistributionDecision', 'reviewedBy', 'reviewedAt']
};

assert(schema.$schema.includes('2020-12'), 'F-01 schema dialect missing');
assert(schema.oneOf.length === 4, 'four record variants required');
for (const [kind, fields] of Object.entries(required)) {
  const def = schema.$defs[kind];
  assert(def.additionalProperties === false, `${kind}: unknown fields must fail closed`);
  for (const field of fields) assert(def.required.includes(field), `${kind}: missing required field ${field}`);
}
assert(schema.$defs.acquisition.properties.httpStatus.const === 200, 'F-14 acquisition must be final 200');
assert(schema.$defs.source.properties.schemaVersion.const === 'source-ledger-source/1.0.0', 'source must use its type-specific schema version');
assert(schema.$defs.preauthorization.properties.schemaVersion.$ref === '#/$defs/schemaVersion', 'preauthorization must retain source-ledger/1.0.0');
assert(schema.$defs.acquisition.properties.responseContentEncoding.const === 'identity', 'identity encoding gate missing');
assert(schema.$defs.review.properties.redistributionDecision.enum.includes('pending'), 'pending decision missing');
assert(schema.$defs.review.properties.redistributionDecision.enum.includes('withdrawn'), 'withdrawn decision missing');
assert(schema.$defs.acquisition.properties.networkHops.maxItems === 4, 'hop limit missing');
console.log('MIB/OID source-ledger schema contract PASS: 4 variants, required identities, fail-closed framing/license gates verified.');
