'use strict';

const crypto = require('node:crypto');

class EligibilityError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'EligibilityError';
    this.code = code;
  }
}

function fail(code, message) { throw new EligibilityError(code, message); }
const SOURCE_FIELDS = ['schemaVersion', 'sourceId', 'sourceKey', 'authorityNamespace', 'authorityBaseUrls', 'policyClass', 'evidenceUrls', 'handlingRule', 'recordHash'];
const PA_FIELDS = ['schemaVersion', 'preauthorizationId', 'recordHash', 'sourceId', 'requestedSourceUrl', 'expectedDocumentId', 'allowedAction', 'policySnapshot', 'policyEvidenceUrl', 'approvedBy', 'approvedAt'];

function strictRecord(record, fields, code) {
  if (!record || Object.getPrototypeOf(record) !== Object.prototype) fail(code, 'record must be a plain object');
  const keys = Object.keys(record).sort();
  const expected = [...fields].sort();
  if (keys.length !== expected.length || keys.some((key, index) => key !== expected[index])) fail(code, 'record fields must exactly match the closed contract');
}

function validUnicodeString(value) {
  if (typeof value !== 'string' || value.length === 0 || value.normalize('NFC') !== value) return false;
  for (let index = 0; index < value.length; index += 1) {
    const unit = value.charCodeAt(index);
    if (unit >= 0xd800 && unit <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) return false;
      index += 1;
    } else if (unit >= 0xdc00 && unit <= 0xdfff) return false;
  }
  return true;
}

function assertCanonicalValue(value) {
  if (typeof value === 'string') {
    if (!validUnicodeString(value)) fail('CANONICAL_STRING', 'all strings must be non-empty NFC with valid Unicode scalar values');
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) assertCanonicalValue(item);
    return;
  }
  if (value && Object.getPrototypeOf(value) === Object.prototype) {
    for (const [key, item] of Object.entries(value)) {
      if (!validUnicodeString(key)) fail('CANONICAL_STRING', 'all keys must be non-empty NFC with valid Unicode scalar values');
      assertCanonicalValue(item);
    }
    return;
  }
  fail('CANONICAL_TYPE', 'this bounded canonicalizer only supports strings, string arrays, and plain objects');
}

function canonicalJson(value) {
  assertCanonicalValue(value);
  if (typeof value === 'string') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
}

function computeRecordHash(record, omittedFields) {
  // Deliberately bounded to the ledger record shape: strings, string arrays, and plain objects; this is not a general-purpose JSON/JCS implementation.
  const preimage = {};
  for (const [key, value] of Object.entries(record)) if (!omittedFields.includes(key)) preimage[key] = value;
  return crypto.createHash('sha256').update(canonicalJson(preimage), 'utf8').digest('hex');
}

function canonicalHttpsUrl(raw, code) {
  if (!validUnicodeString(raw)) fail(code, 'URL must be a non-empty NFC string');
  let url;
  try { url = new URL(raw); } catch { fail(code, 'URL is invalid'); }
  if (url.protocol !== 'https:' || url.href !== raw || url.username || url.password || url.port || url.search || url.hash || /%(?:2e|2f|5c)/i.test(url.pathname)) fail(code, 'URL must be canonical HTTPS without credentials, port, query, fragment, or encoded path delimiters');
  return url;
}

function sortedUniqueStrings(values, code) {
  if (!Array.isArray(values) || values.length === 0) fail(code, 'array must contain NFC strings');
  const concrete = Array.from(values);
  if (!concrete.every(validUnicodeString)) fail(code, 'array must contain NFC strings without sparse slots');
  for (let index = 1; index < concrete.length; index += 1) {
    if (Buffer.compare(Buffer.from(concrete[index - 1]), Buffer.from(concrete[index])) >= 0) fail(code, 'array must be UTF-8 sorted and unique');
  }
}

function validateSource(source) {
  strictRecord(source, SOURCE_FIELDS, 'SOURCE_FIELDS');
  if (source.schemaVersion !== 'source-ledger-source/1.0.0') fail('SOURCE_SCHEMA_VERSION', 'source requires source-ledger-source/1.0.0');
  for (const field of ['sourceKey', 'authorityNamespace', 'policyClass', 'handlingRule']) if (!validUnicodeString(source[field])) fail('SOURCE_FIELD_TYPE', `${field} must be an NFC string`);
  if (!['ALLOW_REGISTRY_DATA', 'CONDITIONAL_CODE_COMPONENT', 'METADATA_LINK_ONLY', 'BLOCKED_UNVERIFIED'].includes(source.policyClass)) fail('SOURCE_POLICY_CLASS', 'source policyClass is unsupported');
  if (source.policyClass !== 'CONDITIONAL_CODE_COMPONENT') fail('SOURCE_POLICY_INELIGIBLE', 'this license-review flow only accepts conditional code components');
  sortedUniqueStrings(source.authorityBaseUrls, 'SOURCE_URL_ORDER');
  sortedUniqueStrings(source.evidenceUrls, 'SOURCE_URL_ORDER');
  for (const raw of [...source.authorityBaseUrls, ...source.evidenceUrls]) canonicalHttpsUrl(raw, 'SOURCE_URL');
  if (typeof source.recordHash !== 'string' || !/^[0-9a-f]{64}$/.test(source.recordHash) || source.sourceId !== `source-${source.recordHash}`) fail('SOURCE_ID_HASH', 'source ID and hash format do not match');
  if (computeRecordHash(source, ['sourceId', 'recordHash']) !== source.recordHash) fail('SOURCE_HASH_MISMATCH', 'source hash does not match canonical preimage');
  return true;
}

function validDate(value) {
  if (typeof value !== 'string' || !/^(?:19|20)\d{2}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validateTrustedContext(trusted) {
  if (!trusted || Object.getPrototypeOf(trusted) !== Object.prototype) fail('TRUSTED_CONTEXT', 'trusted context is required');
  const reviewers = trusted.reviewerIdentities;
  if (!Array.isArray(reviewers) || reviewers.length === 0) fail('TRUSTED_REVIEWERS', 'trusted reviewer identity list must be non-empty, unique, and canonical');
  const concreteReviewers = Array.from(reviewers);
  if (!concreteReviewers.every(validUnicodeString) || new Set(concreteReviewers).size !== concreteReviewers.length) fail('TRUSTED_REVIEWERS', 'trusted reviewer identity list must be non-empty, unique, and canonical');
  if (!validDate(trusted.currentDate)) fail('TRUSTED_DATE', 'trusted currentDate must be a real YYYY-MM-DD date');
}

function urlBelongsToSource(requestUrl, baseUrls) {
  return baseUrls.some((rawBase) => {
    const base = canonicalHttpsUrl(rawBase, 'SOURCE_URL');
    if (requestUrl.origin !== base.origin) return false;
    const boundary = base.pathname.endsWith('/') ? base.pathname : `${base.pathname}/`;
    return requestUrl.pathname === base.pathname || requestUrl.pathname.startsWith(boundary);
  });
}

function validatePreauthorizationRecord(preauthorization, source, trusted = {}) {
  strictRecord(preauthorization, PA_FIELDS, 'PREAUTH_FIELDS');
  validateTrustedContext(trusted);
  if (preauthorization.schemaVersion !== 'source-ledger/1.0.0') fail('PREAUTH_SCHEMA_VERSION', 'preauthorization requires source-ledger/1.0.0');
  for (const field of ['sourceId', 'expectedDocumentId', 'policySnapshot', 'approvedBy']) if (!validUnicodeString(preauthorization[field])) fail('PREAUTH_FIELD_TYPE', `${field} must be an NFC string`);
  if (preauthorization.allowedAction !== 'acquire-for-license-review-only') fail('ALLOWED_ACTION', 'allowedAction is not eligible');
  if (!trusted.reviewerIdentities.includes(preauthorization.approvedBy)) fail('REVIEWER_IDENTITY', 'approvedBy is not in the caller-provided trusted identity list');
  if (!validDate(preauthorization.approvedAt)) fail('APPROVAL_DATE', 'approvedAt must be a real YYYY-MM-DD date');
  if (preauthorization.approvedAt > trusted.currentDate) fail('APPROVAL_FUTURE', 'approvedAt must not be in the future');
  if (!source || preauthorization.sourceId !== source.sourceId) fail('SOURCE_LINK', 'preauthorization sourceId does not match source');
  const requestUrl = canonicalHttpsUrl(preauthorization.requestedSourceUrl, 'REQUEST_URL');
  canonicalHttpsUrl(preauthorization.policyEvidenceUrl, 'POLICY_URL');
  if (!source.evidenceUrls.includes(preauthorization.policyEvidenceUrl)) fail('POLICY_EVIDENCE_LINK', 'policy evidence URL must be listed by the source');
  if (!urlBelongsToSource(requestUrl, source.authorityBaseUrls)) fail('SOURCE_URL_BOUNDARY', 'requested URL is outside source authority origin and path boundary');
  if (typeof preauthorization.recordHash !== 'string' || !/^[0-9a-f]{64}$/.test(preauthorization.recordHash) || preauthorization.preauthorizationId !== `pa-${preauthorization.recordHash}`) fail('PREAUTH_ID_HASH', 'preauthorization ID and hash format do not match');
  if (computeRecordHash(preauthorization, ['preauthorizationId', 'recordHash']) !== preauthorization.recordHash) fail('PREAUTH_HASH_MISMATCH', 'preauthorization hash does not match canonical preimage');
  return true;
}

function validateEligibility(source, preauthorization, trusted = {}) {
  strictRecord(preauthorization, PA_FIELDS, 'PREAUTH_FIELDS');
  validateTrustedContext(trusted);
  if (!trusted.reviewerIdentities.includes(preauthorization.approvedBy)) fail('REVIEWER_IDENTITY', 'approvedBy is not in the caller-provided trusted identity list');
  validateSource(source);
  validatePreauthorizationRecord(preauthorization, source, trusted);
  return true;
}

module.exports = { EligibilityError, computeRecordHash, validateSource, validateEligibility };
