const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const schema = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'schemas', 'mib', 'parser-build-input.schema.json'), 'utf8'));
const allowlist = ['SNMPv2-SMI','SNMPv2-TC','SNMPv2-CONF','SNMPv2-MIB','INET-ADDRESS-MIB','TCP-MIB','UDP-MIB','SNMP-FRAMEWORK-MIB'];
const id = (prefix, letter = 'a') => `${prefix}-${letter.repeat(64)}`;
assert(schema.properties.modules.minItems === 8 && schema.properties.modules.maxItems === 8, 'module count must be exactly eight');
assert(schema.properties.modules.prefixItems.length === 8, 'module prefix order missing');
assert(schema.properties.modules.items === false, 'module tail must be rejected');
assert(schema.properties.modules.prefixItems.every(item => /^#\/\$defs\//.test(item.$ref) && schema.$defs[item.$ref.split('/').pop()]), 'module prefix $ref unresolved');
for (const key of ['runtimeApprovalId','runtimeImageDigest','provenanceSha256','inputLockSha256','sbomSha256']) assert(schema.properties.runtime.required.includes(key), `${key} missing`);
assert(schema.properties.runtime.properties.networkEnabled.const === false, 'network must be disabled');
assert(schema.properties.runtime.required.includes('tempDirectoryPolicy'), 'temp directory policy missing');
assert(schema.properties.runtime.properties.resourceLimits.required.length === 8, 'resource limits incomplete');
assert(schema.properties.goldenFixturePolicy.properties.requiresSourceBinding.const === true, 'fixture source binding missing');
assert(schema.properties.goldenFixturePolicy.properties.fixtures.items.required.includes('parserVersion'), 'fixture parser version binding missing');
assert(schema.properties.goldenFixturePolicy.properties.fixtures.items.required.includes('artifactId'), 'fixture artifact binding missing');
function nfc(value) { if (typeof value === 'string') return value.normalize('NFC'); if (Array.isArray(value)) return value.map(nfc); if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k.normalize('NFC'), nfc(v)])); return value; }
function jcs(value) { value = nfc(value); if (typeof value === 'number') { if (!Number.isFinite(value)) throw new Error('non-finite number'); return JSON.stringify(value); } if (Array.isArray(value)) return `[${value.map(jcs).join(',')}]`; if (value && typeof value === 'object') { const keys = Object.keys(value); const normalized = keys.map(k => k.normalize('NFC')); assert(new Set(normalized).size === normalized.length, 'NFC key collision'); return `{${keys.sort().map(k => `${JSON.stringify(k)}:${jcs(value[k])}`).join(',')}}`; } return JSON.stringify(value); }
function lockHash(lock) { const preimage = structuredClone(lock); delete preimage.lockId; delete preimage.createdAt; delete preimage.lockHash; return crypto.createHash('sha256').update(jcs(preimage), 'utf8').digest('hex'); }
const modules = allowlist.map((moduleName, index) => ({ moduleName, documentId: `RFC ${2578 + index}`, sourceId: id('source', 'a'), acquisitionId: id('acq', 'a'), reviewId: id('review', 'a'), artifactId: id('artifact', '2'), contentSha256: 'b'.repeat(64), contentBytes: 10, importNames: [] }));
const lock = { schemaVersion: 'parser-build-input/1.0.0', lockId: id('lock', 'c'), createdAt: '2026-09-08T00:00:00Z', createdBy: 'local-test', sourceSnapshotId: 'snapshot-test', modules, runtime: { runtimeApprovalId: id('runtimeapproval', 'd'), runtimeImageDigest: `sha256:${'e'.repeat(64)}`, provenanceSha256: 'f'.repeat(64), inputLockSha256: '1'.repeat(64), sbomSha256: '0'.repeat(64), packageName: 'isolated-parser', packageVersion: '0.0.0-test', dependencyTreeSha256: '1'.repeat(64), nodeVersion: '20.x', os: 'linux', architecture: 'amd64', networkEnabled: false, tempDirectoryPolicy: 'exclusive-create-private-cleanup', resourceLimits: { inputBytes: 1, moduleCount: 8, importDepth: 1, astNodes: 1, cpuMs: 1, memoryBytes: 1, outputBytes: 1, tempBytes: 1 } }, goldenFixturePolicy: { allowedKinds: ['synthetic-fault'], requiresSourceBinding: true, fixtures: [{ fixtureId: 'fixture-test', kind: 'synthetic-fault', parserVersion: '0.0.0-test', sourceId: modules[0].sourceId, artifactId: modules[0].artifactId, expectedOutcome: 'reject' }] }, lockHash: '2'.repeat(64) };
assert(modules.map(m => m.moduleName).every((name, index) => name === allowlist[index]), 'module order drift');
assert(lock.goldenFixturePolicy.fixtures.every(f => modules.some(m => m.sourceId === f.sourceId)), 'fixture source binding drift');
assert(lock.goldenFixturePolicy.fixtures.every(f => /^artifact-[0-9a-f]{64}$/.test(f.artifactId)), 'fixture artifact binding drift');
assert(lock.runtime.os === 'linux' && lock.runtime.architecture === 'amd64', 'runtime platform drift');
assert(lock.goldenFixturePolicy.fixtures.every(f => modules.some(m => m.sourceId === f.sourceId && m.artifactId === f.artifactId)), 'fixture artifact/source association drift');
assert(jcs({ 'e\u0301': 1 }) === jcs({ 'é': 1 }), 'NFC normalization drift');
assert(jcs({ number: 1.5 }) === '{"number":1.5}', 'JCS number serialization drift');
lock.lockHash = lockHash(lock);
assert(lock.lockHash === lockHash(lock), 'full lock hash must equal NFC/JCS/SHA-256 recomputation');
const reordered = structuredClone(lock); reordered.modules.reverse(); assert(lockHash(reordered) !== lock.lockHash, 'module order must affect lock hash');
console.log('MIB/OID parser build-input schema contract PASS: exact ordered 8-module set, runtime approval, provenance, SBOM, temp policy, fixture bindings and full lock hash verified.');
