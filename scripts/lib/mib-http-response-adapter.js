'use strict';

const crypto = require('node:crypto');
const http = require('node:http');
const { Duplex } = require('node:stream');
const { TextDecoder } = require('node:util');

class HttpResponseAdapterError extends Error {
  constructor(code, message, cause) {
    super(message, cause ? { cause } : undefined);
    this.name = 'HttpResponseAdapterError';
    this.code = code;
  }
}

function fail(code, message, cause) { throw new HttpResponseAdapterError(code, message, cause); }

function validateLimits(limits) {
  if (!limits || Object.getPrototypeOf(limits) !== Object.prototype) fail('LIMIT_CONFIG', 'limits must be a plain object');
  for (const field of ['maxContentBytes', 'maxHeaderBytes', 'maxElapsedMs']) {
    if (!Number.isSafeInteger(limits[field]) || limits[field] < 0) fail('LIMIT_CONFIG', `${field} must be a non-negative safe integer`);
  }
  if (limits.maxHeaderBytes !== 16384) fail('LIMIT_CONFIG', 'maxHeaderBytes must be exactly 16384 for this fixed adapter profile');
  if (limits.maxElapsedMs > 2147483647) fail('LIMIT_CONFIG', 'maxElapsedMs exceeds the Node timer range');
}

function validateFixedLengthEntity(body, maxContentBytes) {
  if (!Buffer.isBuffer(body)) fail('BODY_TYPE', 'entity must be a Buffer');
  if (body.length === 0) fail('BODY_EMPTY', 'entity must not be empty');
  if (body.length > maxContentBytes) fail('BODY_LIMIT', 'entity exceeds byte limit');
  if (body.length >= 3 && body[0] === 0xef && body[1] === 0xbb && body[2] === 0xbf) fail('BOM_FORBIDDEN', 'UTF-8 BOM is forbidden');
  try { new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(body); } catch (error) { fail('UTF8_INVALID', 'entity is not valid UTF-8', error); }
  return { body, contentBytes: body.length, contentSha256: crypto.createHash('sha256').update(body).digest('hex') };
}

function parseContentLength(rawHeaders) {
  const values = rawHeaderValues(rawHeaders, 'content-length');
  if (values.length !== 1) fail('CONTENT_LENGTH_COUNT', 'exactly one Content-Length field is required');
  if (!/^(?:0|[1-9]\d*)$/.test(values[0])) fail('CONTENT_LENGTH_FORMAT', 'Content-Length must be strict canonical decimal');
  const length = Number(values[0]);
  if (!Number.isSafeInteger(length)) fail('CONTENT_LENGTH_FORMAT', 'Content-Length exceeds safe integer range');
  return length;
}

function rawHeaderValues(rawHeaders, name) {
  const values = [];
  for (let index = 0; index < rawHeaders.length; index += 2) if (rawHeaders[index].toLowerCase() === name) values.push(rawHeaders[index + 1]);
  return values;
}

function adaptHttp11FixedLengthResponse(options = {}) {
  if (!options || Object.getPrototypeOf(options) !== Object.prototype) return Promise.reject(new HttpResponseAdapterError('OPTIONS', 'options must be a plain object'));
  const { createConnection, limits } = options;
  if (typeof createConnection !== 'function') return Promise.reject(new HttpResponseAdapterError('CONNECTION_FACTORY_REQUIRED', 'createConnection must be explicitly injected'));
  try { validateLimits(limits); } catch (error) { return Promise.reject(error); }

  return new Promise((resolve, reject) => {
    let settled = false;
    let socket;
    let agent;
    let timer;
    const settle = (error, result) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      if (socket instanceof Duplex && !socket.destroyed) {
        try { socket.destroy(); } catch { /* cleanup cannot replace the validation result */ }
      }
      if (agent) {
        try { agent.destroy(); } catch { /* cleanup cannot replace the validation result */ }
      }
      if (error) reject(error); else resolve(result);
    };
    try { socket = createConnection(); } catch (error) { settle(new HttpResponseAdapterError('CONNECTION_FACTORY', 'createConnection threw', error)); return; }
    if (!(socket instanceof Duplex)) { settle(new HttpResponseAdapterError('CONNECTION_FACTORY', 'createConnection must return a Duplex')); return; }
    agent = new http.Agent({ keepAlive: false, maxSockets: 1 });
    agent.createConnection = () => socket;
    timer = setTimeout(() => settle(new HttpResponseAdapterError('TIMEOUT', 'response deadline exceeded')), limits.maxElapsedMs);

    let request;
    try {
      request = http.request({ protocol: 'http:', host: 'adapter.invalid', port: 80, path: '/', method: 'GET', agent, insecureHTTPParser: false, maxHeaderSize: 16384 }, (response) => {
        response.on('aborted', () => settle(new HttpResponseAdapterError('BODY_INCOMPLETE', 'response aborted before completion')));
        response.on('error', (error) => settle(new HttpResponseAdapterError('RESPONSE_ERROR', 'response stream failed', error)));
        try {
          if (response.httpVersion !== '1.1') fail('HTTP_VERSION', 'HTTP version must be 1.1');
          if (response.statusCode !== 200) fail('HTTP_STATUS', 'status must be 200');
          if (response.headers['transfer-encoding'] !== undefined) fail('TRANSFER_ENCODING', 'Transfer-Encoding is forbidden');
          if (response.headers.trailer !== undefined) fail('TRAILER_FORBIDDEN', 'Trailer declaration is forbidden');
          const contentEncodingValues = rawHeaderValues(response.rawHeaders, 'content-encoding');
          if (contentEncodingValues.length > 1) fail('CONTENT_ENCODING_COUNT', 'Content-Encoding may appear at most once');
          if (contentEncodingValues.length === 1 && contentEncodingValues[0] !== 'identity') fail('CONTENT_ENCODING', 'Content-Encoding must be absent or identity');
          const contentTypeValues = rawHeaderValues(response.rawHeaders, 'content-type');
          if (contentTypeValues.length !== 1) fail('CONTENT_TYPE_COUNT', 'Content-Type must appear exactly once');
          const contentType = contentTypeValues[0];
          if (typeof contentType !== 'string' || !/^text\/plain(?:\s*;\s*charset\s*=\s*(?:utf-8|"utf-8"))?$/i.test(contentType)) fail('CONTENT_TYPE', 'Content-Type must be text/plain with optional UTF-8 charset');
          const declaredLength = parseContentLength(response.rawHeaders);
          if (declaredLength === 0) fail('BODY_EMPTY', 'declared entity must not be empty');
          if (declaredLength > limits.maxContentBytes) fail('BODY_LIMIT', 'declared entity exceeds byte limit');
          const chunks = [];
          let received = 0;
          response.on('data', (chunk) => {
            if (settled) return;
            received += chunk.length;
            if (received > limits.maxContentBytes || received > declaredLength) return settle(new HttpResponseAdapterError('BODY_LIMIT', 'received entity exceeds declared or configured byte limit'));
            chunks.push(Buffer.from(chunk));
          });
          response.on('end', () => {
            if (settled) return;
            try {
              if (!response.complete || received !== declaredLength) fail('BODY_INCOMPLETE', 'response did not complete at the declared byte length');
              if (Object.keys(response.trailers).length || response.rawTrailers.length) fail('TRAILER_FORBIDDEN', 'trailers are forbidden');
              settle(null, { ...validateFixedLengthEntity(Buffer.concat(chunks, received), limits.maxContentBytes), declaredContentLength: declaredLength, httpStatus: 200, responseContentType: contentType, responseContentEncoding: contentEncodingValues[0] || 'identity', responseTransferEncoding: 'none' });
            } catch (error) { settle(error); }
          });
        } catch (error) { settle(error); }
      });
    } catch (error) {
      settle(new HttpResponseAdapterError('REQUEST_SETUP', 'HTTP request setup failed', error));
      return;
    }
    request.on('error', (error) => settle(new HttpResponseAdapterError(error.code === 'HPE_HEADER_OVERFLOW' ? 'HEADERS_LIMIT' : 'HTTP_PARSE', 'Node HTTP parser rejected the response', error)));
    try { request.end(); } catch (error) { settle(new HttpResponseAdapterError('REQUEST_END', 'request.end failed', error)); }
  });
}

module.exports = { HttpResponseAdapterError, adaptHttp11FixedLengthResponse, validateFixedLengthEntity };
