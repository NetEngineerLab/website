'use strict';

const assert = require('node:assert/strict');
const { MAX_ARCS, MAX_INPUT_LENGTH, validateOid, compareOids, isOidAncestor } = require('./lib/mib-oid');

function rejects(code, value) {
  assert.throws(() => validateOid(value), (error) => error && error.code === code, `${code} input did not produce its own error code`);
}

const golden = validateOid('2.4294967295');
assert.equal(golden.value, '2.4294967295');
assert.deepEqual(golden.arcs, ['2', '4294967295']);
assert(Object.isFrozen(golden) && Object.isFrozen(golden.arcs), 'validated result and arcs must be frozen');
assert.equal(validateOid('0.39').value, '0.39');
assert.equal(validateOid('1.39').value, '1.39');
assert.equal(validateOid('2.40').value, '2.40');

const maxArcs = ['2', ...Array(MAX_ARCS - 1).fill('4294967295')].join('.');
assert.equal(validateOid(maxArcs).arcs.length, MAX_ARCS, '128 maximum-value arcs must be accepted under first arc 2');

const invalid = [
  ['OID_TYPE', null], ['OID_TYPE', 1.3], ['OID_TYPE', NaN],
  ['OID_EMPTY', ''], ['OID_CHARACTERS', ' 1.3'], ['OID_CHARACTERS', '1.3 '],
  ['OID_CHARACTERS', '1.3\n'], ['OID_CHARACTERS', '1.3\r'], ['OID_CHARACTERS', '1.3\r\n'],
  ['OID_CHARACTERS', '1.3\u2028'], ['OID_CHARACTERS', '1.3\u2029'],
  ['OID_CHARACTERS', '+1.3'], ['OID_CHARACTERS', '-1.3'], ['OID_CHARACTERS', '1e3.0'],
  ['OID_CHARACTERS', '１.３'], ['OID_EMPTY_ARC', '.1.3'], ['OID_EMPTY_ARC', '1..3'],
  ['OID_EMPTY_ARC', '1.3.'], ['OID_ARC_COUNT', '1'], ['OID_ARC_COUNT', ['2', ...Array(MAX_ARCS).fill('0')].join('.')],
  ['OID_LEADING_ZERO', '1.03'], ['OID_LEADING_ZERO', '2.00'],
  ['OID_ARC_RANGE', '2.4294967296'], ['OID_FIRST_ARC', '3.0'],
  ['OID_SECOND_ARC', '0.40'], ['OID_SECOND_ARC', '1.40'],
  ['OID_LENGTH', `2.${'0'.repeat(MAX_INPUT_LENGTH - 1)}`]
];
for (const [code, value] of invalid) rejects(code, value);

assert.equal(compareOids('2.2', '2.10'), -1, 'arc comparison must be numeric rather than lexical');
assert.equal(compareOids('2.10', '2.2'), 1);
assert.equal(compareOids('1.3', '1.3.0'), -1, 'parent must sort before child');
assert.equal(compareOids('2.4294967295', '2.4294967295'), 0);
assert.equal(isOidAncestor('1.3', '1.3.6'), true);
assert.equal(isOidAncestor('1.3', '1.3'), false, 'ancestor relation must be strict');
assert.equal(isOidAncestor('1.3', '1.30.1'), false, 'ancestor relation must compare whole arcs');
assert.equal(isOidAncestor('1.30', '1.3.1'), false);

const sourceOrder = ['2.10.1', '1.3.6', '2.2', '1.3', '2.10', '0.39'];
const expectedOrder = ['0.39', '1.3', '1.3.6', '2.2', '2.10', '2.10.1'];
assert.deepEqual([...sourceOrder].sort(compareOids), expectedOrder, 'sorting must be deterministic and numeric by arc');
assert.deepEqual(sourceOrder, ['2.10.1', '1.3.6', '2.2', '1.3', '2.10', '0.39'], 'sorting a copy must not mutate source input');

console.log(`MIB numeric OID field core: golden boundaries, ${invalid.length} isolated rejections, comparison, strict ancestry, and deterministic sorting verified.`);
