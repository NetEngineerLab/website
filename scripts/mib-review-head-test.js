'use strict';

const assert = require('node:assert/strict');
const { MAX_REVIEW_RECORDS, resolveReviewHead } = require('./lib/mib-review-head');

const hex = (number) => number.toString(16).padStart(64, '0');
const expected = Object.freeze({ acquisitionId: `acq-${'a'.repeat(64)}`, sourceId: `source-${'b'.repeat(64)}`, reviewScope: 'public-static-derived-data-and-approved-code-components' });
function review(number, parent, decision = 'pending') {
  return { reviewId: `review-${hex(number)}`, acquisitionId: expected.acquisitionId, sourceId: expected.sourceId, reviewScope: expected.reviewScope, supersedesReviewId: parent, redistributionDecision: decision };
}
function rejects(code, records, expectedOverride = expected) {
  assert.throws(() => resolveReviewHead(records, expectedOverride), (error) => error && error.code === code, `${code} case did not produce its own error code`);
}

const root = review(1, null, 'pending');
assert.deepEqual(resolveReviewHead([root], expected), { head: root, decisionAllowsPublication: false });
const approved = review(2, root.reviewId, 'approved');
assert.equal(resolveReviewHead([root, approved], expected).decisionAllowsPublication, true, 'pending to approved head must describe an allowing decision');
const withdrawn = review(3, approved.reviewId, 'withdrawn');
assert.equal(resolveReviewHead([root, approved, withdrawn], expected).decisionAllowsPublication, false, 'approved to withdrawn head must stop allowing publication');
const rejected = review(4, withdrawn.reviewId, 'rejected');
assert.equal(resolveReviewHead([rejected, root, withdrawn, approved], expected).head.reviewId, rejected.reviewId, 'input order must not affect head resolution');

const frozen = [Object.freeze({ ...root }), Object.freeze({ ...approved })];
Object.freeze(frozen);
const before = JSON.stringify(frozen);
const frozenResult = resolveReviewHead(frozen, expected);
assert.equal(JSON.stringify(frozen), before, 'resolver must not mutate input');
assert(Object.isFrozen(frozenResult) && Object.isFrozen(frozenResult.head), 'returned result and copied head must be frozen');

rejects('RECORDS_EMPTY', []);
const sparse = new Array(1);
rejects('RECORD_SPARSE', sparse);
rejects('RECORD_FIELDS', [null]);
rejects('RECORD_FIELDS', [{ ...root, extra: 'x' }]);
rejects('RECORD_FIELDS', [{ reviewId: root.reviewId }]);
rejects('RECORD_TYPE', [{ ...root, reviewId: 'review-short' }]);
rejects('RECORD_TYPE', [{ ...root, reviewId: [root.reviewId] }]);
rejects('RECORD_TYPE', [{ ...root, acquisitionId: { toString: () => expected.acquisitionId } }]);
rejects('DECISION', [{ ...root, redistributionDecision: 'allow' }]);
rejects('DUPLICATE_ID', [root, { ...root }]);
rejects('PARENT_MISSING', [{ ...approved, supersedesReviewId: `review-${hex(999)}` }]);
rejects('ROOT_COUNT', [root, review(2, null)]);
rejects('BRANCH', [root, review(2, root.reviewId), review(3, root.reviewId)]);
rejects('CYCLE', [review(1, `review-${hex(2)}`), review(2, `review-${hex(1)}`)]);
rejects('ACQUISITION_MISMATCH', [{ ...root, acquisitionId: `acq-${'c'.repeat(64)}` }]);
rejects('SOURCE_MISMATCH', [{ ...root, sourceId: `source-${'c'.repeat(64)}` }]);
rejects('SCOPE_MISMATCH', [{ ...root, reviewScope: 'different-scope' }]);
rejects('EXPECTED_FIELDS', [root], { ...expected, extra: 'x' });
rejects('EXPECTED_TYPE', [root], { ...expected, acquisitionId: 'acq-short' });
rejects('EXPECTED_TYPE', [root], { ...expected, sourceId: [expected.sourceId] });

const boundary = [];
for (let number = 1; number <= MAX_REVIEW_RECORDS; number += 1) boundary.push(review(number, number === 1 ? null : `review-${hex(number - 1)}`, number === MAX_REVIEW_RECORDS ? 'approved' : 'pending'));
assert.equal(resolveReviewHead(boundary.slice().reverse(), expected).head.reviewId, boundary.at(-1).reviewId, 'maximum-size unordered chain must resolve iteratively');
rejects('RECORD_LIMIT', [...boundary, review(MAX_REVIEW_RECORDS + 1, boundary.at(-1).reviewId)]);

console.log('MIB review head resolver: legal decision transitions, immutable unordered input, 1000-record boundary, and 21 isolated rejection cases verified.');
