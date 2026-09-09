'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const dns = require('node:dns');
const net = require('node:net');
const { Duplex } = require('node:stream');
const { adaptHttp11FixedLengthResponse } = require('./lib/mib-http-response-adapter');

const limits = Object.freeze({ maxContentBytes: 32, maxHeaderBytes: 16384, maxElapsedMs: 250 });

class MemoryDuplex extends Duplex {
  constructor(parts, { intervalMs = 0, end = true } = {}) {
    super();
    this.parts = parts.map((part) => Buffer.isBuffer(part) ? part : Buffer.from(part, 'latin1'));
    this.intervalMs = intervalMs;
    this.shouldEnd = end;
    this.started = false;
    this.destroyCalls = 0;
    this.latePushAccepted = null;
  }
  _read() {
    if (this.started) return;
    this.started = true;
    const send = (index) => {
      if (index === this.parts.length) { if (this.shouldEnd) this.push(null); return; }
      this.push(this.parts[index]);
      if (this.intervalMs) setTimeout(() => send(index + 1), this.intervalMs); else setImmediate(() => send(index + 1));
    };
    setImmediate(() => send(0));
  }
  _write(_chunk, _encoding, callback) { callback(); }
  _destroy(error, callback) { this.destroyCalls += 1; callback(error); }
}

function factory(rawOrParts, options) {
  let socket;
  return { createConnection: () => (socket = new MemoryDuplex(Array.isArray(rawOrParts) ? rawOrParts : [rawOrParts], options)), socket: () => socket };
}

async function rejects(code, raw, customLimits = limits, options) {
  const injected = factory(raw, options);
  await assert.rejects(adaptHttp11FixedLengthResponse({ createConnection: injected.createConnection, limits: customLimits }), (error) => error && error.code === code, `${code} response did not fail with its own code`);
  assert.equal(injected.socket().destroyCalls, 1, `${code} must destroy the injected Duplex exactly once`);
}

(async () => {
  const originalConnect = net.connect;
  const originalCreateConnection = net.createConnection;
  const originalLookup = dns.lookup;
  let realNetworkCalls = 0;
  net.connect = () => { realNetworkCalls += 1; throw new Error('unexpected net.connect'); };
  net.createConnection = () => { realNetworkCalls += 1; throw new Error('unexpected net.createConnection'); };
  dns.lookup = () => { realNetworkCalls += 1; throw new Error('unexpected dns.lookup'); };
  try {
    const body = Buffer.from('hello');
    const validRaw = Buffer.concat([Buffer.from('HTTP/1.1 200 OK\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Encoding: identity\r\nContent-Length: 5\r\n\r\n', 'latin1'), body]);
    const valid = factory(validRaw);
    const result = await adaptHttp11FixedLengthResponse({ createConnection: valid.createConnection, limits });
    assert.equal(result.body.toString(), 'hello');
    assert.equal(result.contentBytes, 5);
    assert.equal(result.contentSha256, crypto.createHash('sha256').update(body).digest('hex'));
    assert.equal(valid.socket().destroyCalls, 1);

    const fragmented = factory(['HTTP/1.1 200 OK\r\nContent-T', 'ype: text/plain\r\nContent-Length: 5\r\n\r\nhe', 'llo']);
    assert.equal((await adaptHttp11FixedLengthResponse({ createConnection: fragmented.createConnection, limits })).contentBytes, 5);

    await rejects('HTTP_PARSE', 'HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 5\r\nContent-Length: 5\r\n\r\nhello');
    await rejects('HTTP_PARSE', 'HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 5\r\nContent-Length: 6\r\n\r\nhello!');
    await rejects('HTTP_PARSE', 'HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nTransfer-Encoding: chunked\r\nContent-Length: 5\r\n\r\n0\r\n\r\n');
    await rejects('TRANSFER_ENCODING', 'HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nTransfer-Encoding: chunked\r\n\r\n5\r\nhello\r\n0\r\n\r\n');
    await rejects('CONTENT_LENGTH_COUNT', 'HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\nhello');
    await rejects('HTTP_PARSE', 'HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: +5\r\n\r\nhello');
    await rejects('BODY_INCOMPLETE', 'HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 5\r\n\r\nhel');
    await rejects('HEADERS_LIMIT', `HTTP/1.1 200 OK\r\nX-Fill: ${'a'.repeat(16400)}\r\nContent-Type: text/plain\r\nContent-Length: 1\r\n\r\nx`);
    await rejects('BODY_LIMIT', 'HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 33\r\n\r\n');
    await rejects('HTTP_STATUS', 'HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\nContent-Length: 1\r\n\r\nx');
    await rejects('CONTENT_ENCODING', 'HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Encoding: gzip\r\nContent-Length: 1\r\n\r\nx');
    await rejects('CONTENT_ENCODING_COUNT', 'HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Encoding: identity\r\nContent-Encoding: identity\r\nContent-Length: 1\r\n\r\nx');
    await rejects('CONTENT_ENCODING_COUNT', 'HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Encoding: identity\r\nContent-Encoding: gzip\r\nContent-Length: 1\r\n\r\nx');
    await rejects('CONTENT_TYPE_COUNT', 'HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Type: text/plain\r\nContent-Length: 1\r\n\r\nx');
    await rejects('CONTENT_TYPE_COUNT', 'HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Type: application/json\r\nContent-Length: 1\r\n\r\nx');
    await rejects('TRAILER_FORBIDDEN', 'HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nTrailer: Digest\r\nContent-Length: 1\r\n\r\nx');
    await rejects('BOM_FORBIDDEN', Buffer.concat([Buffer.from('HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 4\r\n\r\n', 'latin1'), Buffer.from([0xef, 0xbb, 0xbf, 0x61])]));
    await rejects('UTF8_INVALID', Buffer.concat([Buffer.from('HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 2\r\n\r\n', 'latin1'), Buffer.from([0xc3, 0x28])]));
    await rejects('HTTP_VERSION', 'HTTP/1.0 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 1\r\n\r\nx');

    await assert.rejects(adaptHttp11FixedLengthResponse({ limits }), (error) => error.code === 'CONNECTION_FACTORY_REQUIRED');
    await assert.rejects(adaptHttp11FixedLengthResponse(), (error) => error.code === 'CONNECTION_FACTORY_REQUIRED');
    await assert.rejects(adaptHttp11FixedLengthResponse({ createConnection: () => null, limits }), (error) => error.code === 'CONNECTION_FACTORY');
    await assert.rejects(adaptHttp11FixedLengthResponse({ createConnection: () => ({}), limits }), (error) => error.code === 'CONNECTION_FACTORY');
    await assert.rejects(adaptHttp11FixedLengthResponse({ createConnection: () => ({ destroy: true }), limits }), (error) => error.code === 'CONNECTION_FACTORY');
    await assert.rejects(adaptHttp11FixedLengthResponse({ createConnection: () => { throw new Error('factory'); }, limits }), (error) => error.code === 'CONNECTION_FACTORY');
    await assert.rejects(adaptHttp11FixedLengthResponse({ createConnection: () => new MemoryDuplex([], { end: false }), limits: { ...limits, maxElapsedMs: NaN } }), (error) => error.code === 'LIMIT_CONFIG');

    const timeout = factory([], { end: false });
    await assert.rejects(adaptHttp11FixedLengthResponse({ createConnection: timeout.createConnection, limits: { ...limits, maxElapsedMs: 10 } }), (error) => error.code === 'TIMEOUT');
    assert.equal(timeout.socket().destroyCalls, 1);

    const late = new MemoryDuplex([validRaw], { end: false });
    const lateResult = await adaptHttp11FixedLengthResponse({ createConnection: () => late, limits });
    assert.equal(lateResult.contentBytes, 5);
    late.latePushAccepted = late.push(Buffer.from('late'));
    assert.equal(late.latePushAccepted, false, 'adapter destroys after first complete message; later bytes are not evidence of connection-wide cleanliness');
    assert.equal(late.destroyCalls, 1);
    assert.equal(realNetworkCalls, 0, 'Node net.connect/createConnection must never be used');
    console.log(`MIB HTTP response adapter: Node ${process.version}; valid contiguous/fragmented entities and 27 rejection/limitation cases verified with injected in-memory Duplex only.`);
  } finally {
    net.connect = originalConnect;
    net.createConnection = originalCreateConnection;
    dns.lookup = originalLookup;
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
