#!/usr/bin/env node
"use strict";

const assert=require("node:assert/strict");
const{hasServiceWorkerRevalidation}=require("./production-online-check");
const{stableHash}=require("./stable-text-hash");

const accepted=[
  ["public, max-age=0, must-revalidate",""],
  ["no-cache",""],
  ["no-store",""],
  ["","\"strong-etag\""],
  ["no-transform","W/\"weak-etag\""]
];
const rejected=[
  ["",""],
  ["no-transform",""],
  ["public, max-age=300",""],
  ["","unquoted-etag"],
  ["","W/unquoted-etag"]
];

for(const[cacheControl,etag]of accepted){
  assert.equal(hasServiceWorkerRevalidation(cacheControl,etag),true,`expected accepted: Cache-Control=${cacheControl}, ETag=${etag}`);
}
for(const[cacheControl,etag]of rejected){
  assert.equal(hasServiceWorkerRevalidation(cacheControl,etag),false,`expected rejected: Cache-Control=${cacheControl}, ETag=${etag}`);
}

assert.equal(stableHash("asset\r\ncontent\r\n"),stableHash("asset\ncontent\n"),"text hashes must be stable across CRLF and LF checkouts");

console.log(`Service Worker revalidation policy PASS (${accepted.length} accepted, ${rejected.length} rejected; cross-platform text hashing verified).`);
