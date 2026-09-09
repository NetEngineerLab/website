'use strict';

const MAX_REVIEW_RECORDS = 1000;
const FIELDS = ['reviewId', 'acquisitionId', 'sourceId', 'reviewScope', 'supersedesReviewId', 'redistributionDecision'];
const DECISIONS = new Set(['pending', 'approved', 'rejected', 'withdrawn']);

class ReviewHeadError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'ReviewHeadError';
    this.code = code;
  }
}

function fail(code, message) { throw new ReviewHeadError(code, message); }
function nonEmptyString(value) { return typeof value === 'string' && value.length > 0; }
function matches(value, pattern) { return typeof value === 'string' && pattern.test(value); }

function strictKeys(value, fields, code) {
  if (!value || Object.getPrototypeOf(value) !== Object.prototype) fail(code, 'value must be a plain object');
  const keys = Object.keys(value).sort();
  const expected = [...fields].sort();
  if (keys.length !== expected.length || keys.some((key, index) => key !== expected[index])) fail(code, 'fields must exactly match the bounded projection');
}

function resolveReviewHead(records, expected) {
  strictKeys(expected, ['acquisitionId', 'sourceId', 'reviewScope'], 'EXPECTED_FIELDS');
  if (!matches(expected.acquisitionId, /^acq-[0-9a-f]{64}$/) || !matches(expected.sourceId, /^source-[0-9a-f]{64}$/) || !nonEmptyString(expected.reviewScope)) fail('EXPECTED_TYPE', 'expected identity fields are invalid');
  if (!Array.isArray(records) || records.length === 0) fail('RECORDS_EMPTY', 'review projection array must not be empty');
  if (records.length > MAX_REVIEW_RECORDS) fail('RECORD_LIMIT', `review projection exceeds ${MAX_REVIEW_RECORDS} records`);

  const byId = new Map();
  for (let index = 0; index < records.length; index += 1) {
    if (!Object.prototype.hasOwnProperty.call(records, index)) fail('RECORD_SPARSE', 'review projection array must not contain sparse slots');
    const record = records[index];
    strictKeys(record, FIELDS, 'RECORD_FIELDS');
    if (!matches(record.reviewId, /^review-[0-9a-f]{64}$/) || !matches(record.acquisitionId, /^acq-[0-9a-f]{64}$/) || !matches(record.sourceId, /^source-[0-9a-f]{64}$/) || !nonEmptyString(record.reviewScope) || (record.supersedesReviewId !== null && !matches(record.supersedesReviewId, /^review-[0-9a-f]{64}$/))) fail('RECORD_TYPE', 'review projection field type is invalid');
    if (!DECISIONS.has(record.redistributionDecision)) fail('DECISION', 'redistributionDecision is invalid');
    if (record.acquisitionId !== expected.acquisitionId) fail('ACQUISITION_MISMATCH', 'review acquisition differs from expected');
    if (record.sourceId !== expected.sourceId) fail('SOURCE_MISMATCH', 'review source differs from expected');
    if (record.reviewScope !== expected.reviewScope) fail('SCOPE_MISMATCH', 'review scope differs from expected');
    if (byId.has(record.reviewId)) fail('DUPLICATE_ID', 'reviewId must be unique');
    byId.set(record.reviewId, record);
  }

  for (const record of byId.values()) if (record.supersedesReviewId !== null && !byId.has(record.supersedesReviewId)) fail('PARENT_MISSING', 'superseded review is absent');

  const completed = new Set();
  for (const startId of byId.keys()) {
    if (completed.has(startId)) continue;
    const path = new Set();
    let currentId = startId;
    while (currentId !== null && !completed.has(currentId)) {
      if (path.has(currentId)) fail('CYCLE', 'review supersedes chain contains a cycle');
      path.add(currentId);
      currentId = byId.get(currentId).supersedesReviewId;
    }
    for (const id of path) completed.add(id);
  }

  const roots = [...byId.values()].filter((record) => record.supersedesReviewId === null);
  if (roots.length !== 1) fail('ROOT_COUNT', 'review set must contain exactly one root');
  const childByParent = new Map();
  for (const record of byId.values()) {
    if (record.supersedesReviewId === null) continue;
    if (childByParent.has(record.supersedesReviewId)) fail('BRANCH', 'a review may be superseded by only one next review');
    childByParent.set(record.supersedesReviewId, record.reviewId);
  }

  const visited = new Set();
  let head = roots[0];
  while (head) {
    if (visited.has(head.reviewId)) fail('CYCLE', 'review supersedes chain contains a cycle');
    visited.add(head.reviewId);
    const childId = childByParent.get(head.reviewId);
    if (!childId) break;
    head = byId.get(childId);
  }
  if (visited.size !== byId.size) fail('DISCONNECTED', 'all reviews must belong to the single root-to-head chain');

  // This flag describes only the resolved head decision; it is not proof of identity, license, signature, record hash, or publication authorization.
  return Object.freeze({ head: Object.freeze({ ...head }), decisionAllowsPublication: head.redistributionDecision === 'approved' });
}

module.exports = { MAX_REVIEW_RECORDS, ReviewHeadError, resolveReviewHead };
