'use strict';

const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { validateAcquisitionResponse } = require('./lib/mib-acquisition-preflight');

const expected = Object.freeze({ sourceId: `source-${'a'.repeat(64)}`, preauthorizationId: `pa-${'b'.repeat(64)}`, requestUrl: 'https://www.rfc-editor.org/rfc/rfc2578.txt' });
const limits = Object.freeze({ maxContentBytes: 1024, maxRawHeadersBytes: 16384, maxElapsedMs: 30000 });
const hash = (body) => crypto.createHash('sha256').update(body).digest('hex');

function valid(transfer = 'none') {
  const body = Buffer.from('synthetic RFC bytes', 'utf8');
  return { sourceId: expected.sourceId, preauthorizationId: expected.preauthorizationId, requestUrl: expected.requestUrl, finalSourceUrl: expected.requestUrl, proxy: null, answerAddresses: ['8.8.8.8'], peerAddress: '8.8.8.8', httpStatus: 200, responseContentEncoding: 'identity', responseTransferEncoding: transfer, declaredContentLength: transfer === 'chunked' ? null : body.length, contentBytes: body.length, rawHeadersBytes: 1024, elapsedMs: 100, body, contentSha256: hash(body), bom: false };
}

function rejects(code, mutate, transfer = 'none', expectedOverride = expected, limitsOverride = limits) {
  const response = valid(transfer);
  mutate(response);
  assert.throws(() => validateAcquisitionResponse(response, expectedOverride, limitsOverride), (error) => error && error.code === code, `${code} mutation did not fail with its own error code`);
}

assert.equal(validateAcquisitionResponse(valid('none'), expected, limits), true);
assert.equal(validateAcquisitionResponse(valid('chunked'), expected, limits), true);
const multiAddress = valid();
multiAddress.answerAddresses = ['1.1.1.1', '8.8.8.8'];
assert.equal(validateAcquisitionResponse(multiAddress, expected, limits), true);

const cases = [
  ['IDENTITY_MISMATCH', (x) => { x.sourceId = `source-${'c'.repeat(64)}`; }],
  ['URL_MISMATCH', (x) => { x.requestUrl = 'https://www.rfc-editor.org/rfc/rfc2579.txt'; }],
  ['URL_MISMATCH', (x) => { x.finalSourceUrl = 'https://www.rfc-editor.org/rfc/rfc2579.txt'; }],
  ['PROXY_FORBIDDEN', (x) => { x.proxy = 'http://proxy.invalid'; }],
  ['DNS_ANSWER_COUNT', (x) => { x.answerAddresses = []; }],
  ['DNS_ANSWER_ORDER', (x) => { x.answerAddresses = ['8.8.8.8', '1.1.1.1']; }],
  ['DNS_ANSWER_ORDER', (x) => { x.answerAddresses = ['8.8.8.8', '8.8.8.8']; }],
  ['ADDRESS_FORBIDDEN', (x) => { x.answerAddresses.length = 2; }],
  ['ADDRESS_FORBIDDEN', (x) => { x.answerAddresses = ['192.0.2.1']; x.peerAddress = '192.0.2.1'; }],
  ['ADDRESS_FORBIDDEN', (x) => { x.answerAddresses = ['198.51.100.1']; x.peerAddress = '198.51.100.1'; }],
  ['ADDRESS_FORBIDDEN', (x) => { x.answerAddresses = ['203.0.113.1']; x.peerAddress = '203.0.113.1'; }],
  ['ADDRESS_FORBIDDEN', (x) => { x.answerAddresses = ['192.88.99.1']; x.peerAddress = '192.88.99.1'; }],
  ['ADDRESS_FORBIDDEN', (x) => { x.answerAddresses = ['192.168.1.1']; x.peerAddress = '192.168.1.1'; }],
  ['ADDRESS_FORBIDDEN', (x) => { x.answerAddresses = ['08.8.8.8']; x.peerAddress = '08.8.8.8'; }],
  ['ADDRESS_FORBIDDEN', (x) => { x.answerAddresses = ['2001:4860:4860::8888']; x.peerAddress = '2001:4860:4860::8888'; }],
  ['PEER_MISMATCH', (x) => { x.peerAddress = '1.1.1.1'; }],
  ['HTTP_STATUS', (x) => { x.httpStatus = 302; }],
  ['CONTENT_ENCODING', (x) => { x.responseContentEncoding = 'gzip'; }],
  ['TRANSFER_ENCODING', (x) => { x.responseTransferEncoding = 'compress'; }],
  ['BODY_TYPE', (x) => { x.body = 'synthetic RFC bytes'; }],
  ['CONTENT_BYTES', (x) => { x.contentBytes = NaN; }],
  ['CONTENT_BYTES', (x) => { delete x.contentBytes; }],
  ['RAW_HEADERS_BYTES', (x) => { x.rawHeadersBytes = Infinity; }],
  ['RAW_HEADERS_BYTES', (x) => { x.rawHeadersBytes = -1; }],
  ['ELAPSED_MS', (x) => { x.elapsedMs = 1.5; }],
  ['ELAPSED_MS', (x) => { delete x.elapsedMs; }],
  ['CONTENT_LENGTH', (x) => { x.contentBytes -= 1; }],
  ['BODY_EMPTY', (x) => { x.body = Buffer.alloc(0); x.contentBytes = 0; x.declaredContentLength = 0; x.contentSha256 = hash(x.body); }],
  ['DECLARED_LENGTH', (x) => { x.declaredContentLength = NaN; }],
  ['DECLARED_LENGTH', (x) => { delete x.declaredContentLength; }],
  ['CHUNKED_LENGTH', (x) => { x.declaredContentLength = x.contentBytes; }, 'chunked'],
  ['CONTENT_LENGTH', (x) => { x.contentBytes -= 1; }, 'chunked'],
  ['CONTENT_LIMIT', (x) => { x.body = Buffer.alloc(1025, 0x61); x.contentBytes = x.body.length; x.declaredContentLength = x.body.length; x.contentSha256 = hash(x.body); }],
  ['HEADERS_LIMIT', (x) => { x.rawHeadersBytes = 16385; }],
  ['TIME_LIMIT', (x) => { x.elapsedMs = 30001; }],
  ['BOM_FORBIDDEN', (x) => { x.body = Buffer.from([0xef, 0xbb, 0xbf, 0x61]); x.contentBytes = 4; x.declaredContentLength = 4; x.contentSha256 = hash(x.body); }],
  ['UTF8_INVALID', (x) => { x.body = Buffer.from([0xc3, 0x28]); x.contentBytes = 2; x.declaredContentLength = 2; x.contentSha256 = hash(x.body); }],
  ['HASH_FORMAT', (x) => { x.contentSha256 = 'ABC'; }],
  ['HASH_MISMATCH', (x) => { x.contentSha256 = '0'.repeat(64); }]
];
for (const [code, mutate, transfer] of cases) rejects(code, mutate, transfer);

for (const badLimits of [
  { maxRawHeadersBytes: 16384, maxElapsedMs: 30000 },
  { maxContentBytes: NaN, maxRawHeadersBytes: 16384, maxElapsedMs: 30000 },
  { maxContentBytes: 1024, maxRawHeadersBytes: 16384, maxElapsedMs: 1.5 }
]) rejects('LIMIT_CONFIG', () => {}, 'none', expected, badLimits);
rejects('EXPECTED_URL', () => {}, 'none', { ...expected, requestUrl: 'http://www.rfc-editor.org/rfc/rfc2578.txt' }, limits);
rejects('EXPECTED_URL', () => {}, 'none', { ...expected, requestUrl: 'https://www.rfc-editor.org:443/rfc/rfc2578.txt' }, limits);
rejects('EXPECTED_URL', () => {}, 'none', { ...expected, requestUrl: 'https://www.rfc-editor.org:8443/rfc/rfc2578.txt' }, limits);
rejects('EXPECTED_URL', () => {}, 'none', { ...expected, requestUrl: 'https://www.rfc-editor.org/rfc/rfc2578.txt#section' }, limits);

const boundary = valid();
boundary.body = Buffer.alloc(limits.maxContentBytes, 0x61);
boundary.contentBytes = boundary.body.length;
boundary.declaredContentLength = boundary.body.length;
boundary.rawHeadersBytes = limits.maxRawHeadersBytes;
boundary.elapsedMs = limits.maxElapsedMs;
boundary.contentSha256 = hash(boundary.body);
assert.equal(validateAcquisitionResponse(boundary, expected, limits), true);

console.log(`MIB acquisition offline response validator: ${cases.length + 7} rejection cases, multi-address DNS, boundaries, and both transfer modes verified; no network or filesystem staging behavior exercised.`);
