'use strict';

const crypto = require('node:crypto');
const { TextDecoder } = require('node:util');

class PreflightValidationError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'PreflightValidationError';
    this.code = code;
  }
}

function fail(code, message) { throw new PreflightValidationError(code, message); }

function requireSafeInteger(value, name, code) {
  if (!Number.isSafeInteger(value) || value < 0) fail(code, `${name} must be a non-negative safe integer`);
}

function parseCanonicalIpv4(address) {
  if (typeof address !== 'string' || !/^\d{1,3}(?:\.\d{1,3}){3}$/.test(address)) return null;
  const octets = address.split('.').map(Number);
  if (octets.some((part) => part > 255) || octets.join('.') !== address) return null;
  return octets;
}

function isPublicIpv4(address) {
  const octets = parseCanonicalIpv4(address);
  if (!octets) return false;
  const [a, b, c] = octets;
  return !(
    a === 0 || a === 10 || a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 88 && c === 99) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113) ||
    a >= 224
  );
}

function validateExpected(expected) {
  if (!expected || typeof expected !== 'object' || Array.isArray(expected)) fail('EXPECTED_CONTEXT', 'expected context is required');
  for (const field of ['sourceId', 'preauthorizationId', 'requestUrl']) {
    if (typeof expected[field] !== 'string' || expected[field].length === 0) fail('EXPECTED_CONTEXT', `expected.${field} is required`);
  }
  let url;
  try { url = new URL(expected.requestUrl); } catch { fail('EXPECTED_URL', 'expected request URL is invalid'); }
  if (url.protocol !== 'https:' || url.href !== expected.requestUrl || url.username || url.password || url.port || url.hash) {
    fail('EXPECTED_URL', 'expected request URL must be an exact canonical HTTPS URL without credentials');
  }
}

function validateLimits(limits) {
  if (!limits || typeof limits !== 'object' || Array.isArray(limits)) fail('LIMIT_CONFIG', 'limits are required');
  for (const field of ['maxContentBytes', 'maxRawHeadersBytes', 'maxElapsedMs']) {
    requireSafeInteger(limits[field], `limits.${field}`, 'LIMIT_CONFIG');
  }
}

function validateAcquisitionResponse(response, expected, limits) {
  validateExpected(expected);
  validateLimits(limits);
  if (!response || typeof response !== 'object' || Array.isArray(response)) fail('RESPONSE_TYPE', 'response must be an object');
  if (response.sourceId !== expected.sourceId || response.preauthorizationId !== expected.preauthorizationId) fail('IDENTITY_MISMATCH', 'response identity does not match trusted expected context');
  if (response.requestUrl !== expected.requestUrl || response.finalSourceUrl !== expected.requestUrl) fail('URL_MISMATCH', 'request and final URLs must exactly match the trusted expected URL');
  if (response.proxy !== null) fail('PROXY_FORBIDDEN', 'proxy must be null');
  if (!Array.isArray(response.answerAddresses) || response.answerAddresses.length === 0) fail('DNS_ANSWER_COUNT', 'at least one DNS answer is required');
  const answers = Array.from(response.answerAddresses);
  if (!answers.every(isPublicIpv4) || !isPublicIpv4(response.peerAddress)) fail('ADDRESS_FORBIDDEN', 'DNS answers and peer must be canonical public IPv4 addresses; IPv6 is unsupported');
  const normalizedAnswers = [...new Set(answers)].sort();
  if (normalizedAnswers.length !== response.answerAddresses.length || normalizedAnswers.some((address, index) => address !== response.answerAddresses[index])) fail('DNS_ANSWER_ORDER', 'DNS answers must be sorted and unique');
  if (!answers.includes(response.peerAddress)) fail('PEER_MISMATCH', 'peer address must be present in the DNS answers');
  if (response.httpStatus !== 200) fail('HTTP_STATUS', 'HTTP status must be 200');
  if (response.responseContentEncoding !== 'identity') fail('CONTENT_ENCODING', 'content encoding must be identity');
  if (response.responseTransferEncoding !== 'none' && response.responseTransferEncoding !== 'chunked') fail('TRANSFER_ENCODING', 'transfer encoding must be none or chunked');
  if (!Buffer.isBuffer(response.body)) fail('BODY_TYPE', 'body must be a Buffer of received bytes');
  requireSafeInteger(response.contentBytes, 'contentBytes', 'CONTENT_BYTES');
  requireSafeInteger(response.rawHeadersBytes, 'rawHeadersBytes', 'RAW_HEADERS_BYTES');
  requireSafeInteger(response.elapsedMs, 'elapsedMs', 'ELAPSED_MS');
  if (response.contentBytes === 0) fail('BODY_EMPTY', 'body must not be empty');
  if (response.contentBytes !== response.body.length) fail('CONTENT_LENGTH', 'contentBytes must equal received body bytes');
  if (response.responseTransferEncoding === 'none') {
    requireSafeInteger(response.declaredContentLength, 'declaredContentLength', 'DECLARED_LENGTH');
    if (response.declaredContentLength !== response.contentBytes) fail('DECLARED_LENGTH', 'declared length must equal received body bytes');
  } else if (response.declaredContentLength !== null) fail('CHUNKED_LENGTH', 'chunked responses must not declare Content-Length');
  if (response.contentBytes > limits.maxContentBytes) fail('CONTENT_LIMIT', 'content byte limit exceeded');
  if (response.rawHeadersBytes > limits.maxRawHeadersBytes) fail('HEADERS_LIMIT', 'raw header byte limit exceeded');
  if (response.elapsedMs > limits.maxElapsedMs) fail('TIME_LIMIT', 'elapsed time limit exceeded');

  const hasBom = response.body.length >= 3 && response.body[0] === 0xef && response.body[1] === 0xbb && response.body[2] === 0xbf;
  if (hasBom) fail('BOM_FORBIDDEN', 'UTF-8 BOM is forbidden');
  try { new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(response.body); } catch { fail('UTF8_INVALID', 'body is not valid UTF-8'); }

  if (typeof response.contentSha256 !== 'string' || !/^[0-9a-f]{64}$/.test(response.contentSha256)) fail('HASH_FORMAT', 'content hash must be lowercase SHA-256');
  const actualHash = crypto.createHash('sha256').update(response.body).digest('hex');
  if (actualHash !== response.contentSha256) fail('HASH_MISMATCH', 'content hash does not match body bytes');
  return true;
}

module.exports = { PreflightValidationError, isPublicIpv4, validateAcquisitionResponse };
