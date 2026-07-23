"use strict";

const crypto=require("crypto");
const fs=require("fs");

function normalizeText(value){
  const text=Buffer.isBuffer(value)?value.toString("utf8"):String(value);
  return text.replace(/\r\n?/g,"\n");
}

function stableHash(value,length=64){
  return crypto.createHash("sha256").update(normalizeText(value),"utf8").digest("hex").slice(0,length);
}

function stableFileHash(file,length=64){
  return stableHash(fs.readFileSync(file),length);
}

module.exports={normalizeText,stableHash,stableFileHash};
