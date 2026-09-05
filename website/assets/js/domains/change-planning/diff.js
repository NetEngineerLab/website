/** NetEngineerLab | V2.1-Phase2-ChangePlanningV1 | Deterministic semantic and line diff */
"use strict";
function lines(text){return String(text||"").split(/\r?\n/).map(x=>x.trimEnd()).filter(x=>x.trim())}
function lineDiff(before,after){const a=lines(before),b=lines(after),aset=new Set(a),bset=new Set(b);return Object.freeze({removed:Object.freeze(a.filter(x=>!bset.has(x))),added:Object.freeze(b.filter(x=>!aset.has(x))),unchanged:Object.freeze(b.filter(x=>aset.has(x)))})}
function arrayDelta(before,after){const a=new Set(before||[]),b=new Set(after||[]);return Object.freeze({added:Object.freeze([...(after||[])].filter(x=>!a.has(x))),removed:Object.freeze([...(before||[])].filter(x=>!b.has(x))),unchanged:Object.freeze([...(after||[])].filter(x=>a.has(x)))})}
function semantic(before,after){
 const b=before||null,a=after;
 return Object.freeze({
  aggregateId:Object.freeze({before:b?b.aggregateId:null,after:a.aggregateId,changed:!b||b.aggregateId!==a.aggregateId}),
  lagMode:Object.freeze({before:b?b.lagMode:null,after:a.lagMode,changed:!b||b.lagMode!==a.lagMode}),
  allowedVlans:arrayDelta(b?b.allowedVlans:[],a.allowedVlans),
  nativeVlan:Object.freeze({before:b?b.nativeVlan:null,after:a.nativeVlan,changed:!b||b.nativeVlan!==a.nativeVlan}),
  description:Object.freeze({before:b?b.description:null,after:a.description,changed:!b||b.description!==a.description})
 });
}
module.exports=Object.freeze({lineDiff,arrayDelta,semantic});
