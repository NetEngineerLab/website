const assert=require('assert');const E=require('../js/engine.js');
let r=E.calculate({prefixes:['10.0.0.0/24','10.0.1.0/24']});assert.deepStrictEqual(r.summaries,['10.0.0.0/23']);assert.strictEqual(r.reduction,1);
r=E.calculate({prefixes:['10.0.0.0/25','10.0.0.128/25','10.0.1.0/24']});assert.deepStrictEqual(r.summaries,['10.0.0.0/23']);
r=E.calculate({prefixes:['2001:db8:1::/64','2001:db8:0::/64']});assert.deepStrictEqual(r.summaries,['2001:db8::/63']);
r=E.calculate({prefixes:['10.1.0.0/16','10.1.1.0/24','10.1.0.0/16']});assert.deepStrictEqual(r.summaries,['10.1.0.0/16']);assert.ok(r.redundant.length>=1);
r=E.calculate({prefixes:['10.0.0.0/24','10.0.1.0/24']},{minPrefixLength:24});assert.deepStrictEqual(r.summaries,['10.0.0.0/24','10.0.1.0/24']);
r=E.calculate({prefixes:['bad/24','10.0.0.0/33']});assert.strictEqual(r.status,'invalid');assert.strictEqual(r.summaries.length,0);
r=E.calculate(null);assert.ok(r.errors.includes('input_type_invalid'));r=E.calculate({prefixes:'10.0.0.0/24'});assert.ok(r.errors.includes('prefixes_type_invalid'));
console.log('Route summarization engine: PASS');
