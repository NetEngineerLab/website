'use strict';

const MAX_INPUT_LENGTH = 1407;
const MAX_ARCS = 128;
const MAX_ARC = '4294967295';

class OidValidationError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'OidValidationError';
    this.code = code;
  }
}

function fail(code, message) { throw new OidValidationError(code, message); }

function compareUnsignedDecimal(left, right) {
  if (left.length !== right.length) return left.length < right.length ? -1 : 1;
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

function validateOid(value) {
  if (typeof value !== 'string') fail('OID_TYPE', 'OID must be a string');
  if (value.length === 0) fail('OID_EMPTY', 'OID must not be empty');
  if (value.length > MAX_INPUT_LENGTH) fail('OID_LENGTH', `OID input exceeds the ${MAX_INPUT_LENGTH}-character pre-split limit`);
  if (/[^0-9.]/.test(value)) fail('OID_CHARACTERS', 'OID may contain only ASCII digits and dots');
  const arcs = value.split('.');
  if (arcs.some((arc) => arc.length === 0)) fail('OID_EMPTY_ARC', 'OID must not contain empty arcs or a leading/trailing dot');
  if (arcs.length < 2) fail('OID_ARC_COUNT', 'OID must contain at least two arcs');
  if (arcs.length > MAX_ARCS) fail('OID_ARC_COUNT', `OID exceeds ${MAX_ARCS} arcs`);
  for (const arc of arcs) {
    if (arc.length > 1 && arc[0] === '0') fail('OID_LEADING_ZERO', 'OID arcs must use canonical unsigned decimal');
    if (compareUnsignedDecimal(arc, MAX_ARC) > 0) fail('OID_ARC_RANGE', `OID arc exceeds ${MAX_ARC}`);
  }
  if (!['0', '1', '2'].includes(arcs[0])) fail('OID_FIRST_ARC', 'first arc must be 0, 1, or 2');
  if (arcs[0] !== '2' && compareUnsignedDecimal(arcs[1], '39') > 0) fail('OID_SECOND_ARC', 'second arc must be 0..39 when first arc is 0 or 1');
  return Object.freeze({ value, arcs: Object.freeze([...arcs]) });
}

function compareOids(left, right) {
  const leftArcs = validateOid(left).arcs;
  const rightArcs = validateOid(right).arcs;
  const commonLength = Math.min(leftArcs.length, rightArcs.length);
  for (let index = 0; index < commonLength; index += 1) {
    const comparison = compareUnsignedDecimal(leftArcs[index], rightArcs[index]);
    if (comparison !== 0) return comparison;
  }
  if (leftArcs.length === rightArcs.length) return 0;
  return leftArcs.length < rightArcs.length ? -1 : 1;
}

function isOidAncestor(ancestor, descendant) {
  const ancestorArcs = validateOid(ancestor).arcs;
  const descendantArcs = validateOid(descendant).arcs;
  if (ancestorArcs.length >= descendantArcs.length) return false;
  return ancestorArcs.every((arc, index) => arc === descendantArcs[index]);
}

module.exports = { MAX_ARCS, MAX_INPUT_LENGTH, OidValidationError, validateOid, compareOids, isOidAncestor };
