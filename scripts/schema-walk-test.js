#!/usr/bin/env node
"use strict";

const assert=require("assert/strict");
const {walkSchema}=require("./schema-walk");

const fixture={
  "@context":"https://schema.org",
  "@type":"FAQPage",
  mainEntity:[],
  "@graph":[{
    "@type":"FAQPage",
    mainEntity:[{"@type":"Question","name":"Nested","acceptedAnswer":{"@type":"Answer","text":"Detected"}}]
  }]
};
const faqPages=[];
walkSchema(fixture,node=>{
  if(node["@type"]==="FAQPage")faqPages.push(node);
});

assert.equal(faqPages.length,2,"top-level and @graph FAQPage nodes must both be collected");
assert.equal(faqPages[1].mainEntity[0].acceptedAnswer.text,"Detected");
console.log("Schema traversal tests: PASS (top-level + nested @graph FAQPage detected).");
