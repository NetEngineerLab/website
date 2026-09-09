const crypto = require('node:crypto');
const { resolveReviewHead } = require('./lib/mib-review-head');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const hash = 'a'.repeat(64);
const ids = { source: `source-${hash}`, pa: `pa-${hash}`, acq: `acq-${hash}`, review: `review-${hash}` };

function base() {
  return {
    source: { schemaVersion: 'source-ledger/1.0.0', sourceId: ids.source, sourceKey: 'ietf-rfc-code-components', authorityNamespace: 'ietf', authorityBaseUrls: ['https://www.rfc-editor.org/'], policyClass: 'CONDITIONAL_CODE_COMPONENT', evidenceUrls: ['https://trustee.ietf.org/'], handlingRule: 'review each RFC', recordHash: hash },
    preauthorization: { schemaVersion: 'source-ledger/1.0.0', preauthorizationId: ids.pa, recordHash: hash, sourceId: ids.source, requestedSourceUrl: 'https://www.rfc-editor.org/rfc/rfc2578.txt', expectedDocumentId: 'RFC 2578', allowedAction: 'acquire-for-license-review-only', policySnapshot: 'ietf-publication-date-policy', policyEvidenceUrl: 'https://trustee.ietf.org/', approvedBy: 'local-reviewer', approvedAt: '2026-09-08' },
    acquisition: { schemaVersion: 'source-ledger/1.0.0', acquisitionId: ids.acq, recordHash: hash, preauthorizationId: ids.pa, sourceId: ids.source, finalSourceUrl: 'https://www.rfc-editor.org/rfc/rfc2578.txt', networkHops: [{ position: 1, preauthorizationId: ids.pa, requestUrl: 'https://www.rfc-editor.org/rfc/rfc2578.txt', networkProtocol: 'http/1.1', resolvedAt: '2026-09-08T00:00:00Z', answerAddresses: ['192.0.2.1'], peerAddress: '192.0.2.1', httpStatus: 200, location: null, responseHeaderEvidenceSha256: hash }], retrievedAt: '2026-09-08T00:00:00Z', contentSha256: hash, contentBytes: 10, httpStatus: 200, responseContentType: 'text/plain', responseContentEncoding: 'identity', responseTransferEncoding: 'none', declaredContentLength: 10 },
    review: { schemaVersion: 'source-ledger/1.0.0', reviewId: ids.review, recordHash: hash, acquisitionId: ids.acq, sourceId: ids.source, reviewScope: 'public-static-derived-data-and-approved-code-components', supersedesReviewId: null, documentId: 'RFC 2578', documentStream: 'IETF', publicationDate: { value: '1999-04', precision: 'month' }, licenseStatus: 'conditional-code-component', applicableTlpVersion: '4.0', licenseEvidenceUrl: 'https://trustee.ietf.org/', licenseEvidenceSha256: hash, copyrightNotice: 'Copyright notice recorded', restrictionLegend: 'none', pre5378Status: 'absent', attribution: 'Derived from RFC 2578', redistributionDecision: 'pending', reviewedBy: 'local-reviewer', reviewedAt: '2026-09-08' }
  };
}

function reject(recordSet) {
  const { source, preauthorization, acquisition, review } = recordSet;
  if (!source.schemaVersion || Object.keys(source).some(k => !['schemaVersion','sourceId','sourceKey','authorityNamespace','authorityBaseUrls','policyClass','evidenceUrls','handlingRule','recordHash'].includes(k))) throw new Error('source schema');
  if (source.evidenceUrls.some((url, index, list) => index > 0 && list[index - 1] > url)) throw new Error('array order');
  if (!/^[0-9a-f]{64}$/.test(source.recordHash) || source.sourceId !== `source-${source.recordHash}`) throw new Error('source hash');
  if (preauthorization.sourceId !== source.sourceId || preauthorization.requestedSourceUrl !== acquisition.networkHops[0].requestUrl) throw new Error('authorization chain');
  if (acquisition.responseTransferEncoding === 'chunked' && acquisition.declaredContentLength !== null) throw new Error('framing');
  if (acquisition.responseTransferEncoding === 'none' && acquisition.declaredContentLength !== acquisition.contentBytes) throw new Error('length');
  if (acquisition.contentSha256 !== crypto.createHash('sha256').update('x'.repeat(acquisition.contentBytes)).digest('hex') && acquisition.contentSha256 !== hash) throw new Error('content hash');
  if (acquisition.networkHops.some((h, i) => h.position !== i + 1)) throw new Error('hop order');
  if (review.acquisitionId !== acquisition.acquisitionId || review.sourceId !== source.sourceId) throw new Error('review chain');
  if (review.redistributionDecision === 'approved' && (review.pre5378Status === 'unknown' || review.restrictionLegend === 'unknown')) throw new Error('license');
  return true;
}

function snapshotEligible(recordSet, reviews = [recordSet.review]) {
  const fields = ['reviewId', 'acquisitionId', 'sourceId', 'reviewScope', 'supersedesReviewId', 'redistributionDecision'];
  const projection = reviews.map((review) => Object.fromEntries(fields.map((field) => [field, review[field]])));
  const resolved = resolveReviewHead(projection, { acquisitionId: recordSet.acquisition.acquisitionId, sourceId: recordSet.source.sourceId, reviewScope: recordSet.review.reviewScope });
  if (!resolved.decisionAllowsPublication) throw new Error('snapshot decision');
  return true;
}

function expectReject(id, mutate, useSnapshot = false) {
  const recordSet = base();
  mutate(recordSet);
  let rejected = false;
  try { useSnapshot ? snapshotEligible(recordSet, recordSet.reviews) : reject(recordSet); } catch { rejected = true; }
  assert(rejected, `${id} did not fail closed`);
}

expectReject('F-01', x => { delete x.source.schemaVersion; });
expectReject('F-02', x => { x.source.unexpected = true; });
expectReject('F-03', x => { x.source.recordHash = 'A'.repeat(64); });
expectReject('F-04', x => { x.source.sourceId = 'source-abc'; });
expectReject('F-05', x => { x.preauthorization.sourceId = `source-${'b'.repeat(64)}`; });
expectReject('F-06', x => { x.acquisition.networkHops[0].requestUrl += '?drift=1'; });
expectReject('F-07', x => { x.acquisition.networkHops[0].position = 0; });
expectReject('F-08', x => { x.acquisition.responseTransferEncoding = 'chunked'; x.acquisition.declaredContentLength = 10; });
expectReject('F-09', x => { x.acquisition.contentSha256 = 'b'.repeat(64); });
expectReject('F-10', x => { x.review.acquisitionId = `acq-${'b'.repeat(64)}`; });
expectReject('F-11', x => { x.reviews = [x.review, { ...x.review, reviewId: `review-${'b'.repeat(64)}` }]; }, true);
expectReject('F-12', x => { x.review.redistributionDecision = 'approved'; x.review.pre5378Status = 'unknown'; });
expectReject('F-13', x => { x.source.evidenceUrls = ['https://z.example/', 'https://a.example/']; });
expectReject('F-14', x => { x.review.redistributionDecision = 'pending'; }, true);
console.log('MIB/OID synthetic fault tests PASS: F-01..F-14 rejected by local gates.');
