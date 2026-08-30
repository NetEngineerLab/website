"use strict";
{

const evidenceApi=typeof module!=="undefined"&&module.exports?require("./evidence"):window.NetEngineerLabRulesEvidence;

function createReport(findings,score,{locale="en"}={}){
  if(!["en","zh"].includes(locale))throw new Error(`Unsupported report locale: ${locale}`);
  return Object.freeze({
    schemaVersion:"1.0.0",locale,generatedAt:null,
    summary:Object.freeze({overallScore:score.overall,passFail:score.passFail,counts:score.counts,disclaimer:score.disclaimer[locale]}),
    findings:Object.freeze(findings.map(finding=>Object.freeze({
      ...finding,titleHtml:evidenceApi.escapeHtml(finding.title),findingHtml:evidenceApi.escapeHtml(finding.finding),
      recommendationHtml:evidenceApi.escapeHtml(finding.recommendation)
    })))
  });
}

const api=Object.freeze({createReport});
if(typeof module!=="undefined"&&module.exports)module.exports=api;
if(typeof window!=="undefined")window.NetEngineerLabRulesReport=api;
}
