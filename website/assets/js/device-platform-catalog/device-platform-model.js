/** NetEngineerLab | V2.1-Phase2-DeviceCatalogV1 | Device platform catalog model */
"use strict";
const MEDIA=new Set(["copper","sfp","sfp+","sfp28","qsfp+","qsfp28"]);
const ROLES=new Set(["access","uplink","server","management"]);
function text(v,n){if(typeof v!=="string"||!v.trim())throw new Error(`invalid_${n}`);return v.trim()}
function positive(v,n){const x=Number(v);if(!Number.isSafeInteger(x)||x<1)throw new Error(`invalid_${n}`);return x}
function nonnegative(v,n){const x=Number(v);if(!Number.isSafeInteger(x)||x<0)throw new Error(`invalid_${n}`);return x}
function normalizeGroup(g){
 const id=text(g.id,"port_group_id"),role=text(g.role,"port_role"),media=text(g.media,"port_media");
 if(!ROLES.has(role))throw new Error("invalid_port_role"); if(!MEDIA.has(media))throw new Error("invalid_port_media");
 const count=positive(g.count,"port_count"),start=g.start==null?1:nonnegative(g.start,"port_start");
 const speeds=Object.freeze([...(g.speedsMbps||[])].map(v=>positive(v,"speed_mbps")));
 if(!speeds.length)throw new Error("port_speeds_required");
 const naming=g.naming&&typeof g.naming==="object"?Object.freeze({...g.naming}):null;
 const member=g.member==null?null:nonnegative(g.member,"member"),slot=g.slot==null?null:nonnegative(g.slot,"slot");
 const breakout=g.breakout?Object.freeze({lanes:positive(g.breakout.lanes,"breakout_lanes"),laneSpeedsMbps:Object.freeze([...(g.breakout.laneSpeedsMbps||[])].map(v=>positive(v,"lane_speed_mbps"))),namingTemplate:text(g.breakout.namingTemplate,"breakout_naming_template"),confidence:g.breakout.confidence||"verified"}):null;
 return Object.freeze({id,role,media,count,start,speedsMbps:speeds,interfaceType:text(g.interfaceType,"interface_type"),naming,resolverConfidence:g.resolverConfidence||"verified",member,slot,lineCardId:g.lineCardId||null,breakout,notes:Object.freeze([...(g.notes||[])])});
}
function normalize(d){
 if(!d||typeof d!=="object"||Array.isArray(d))throw new Error("invalid_device_platform");
 const groups=(d.portGroups||[]).map(normalizeGroup); if(!groups.length)throw new Error("port_groups_required");
 const seen=new Set(); for(const g of groups){if(seen.has(g.id))throw new Error("duplicate_port_group");seen.add(g.id)}
 return Object.freeze({version:"1.0.0",id:text(d.id,"device_id"),vendor:text(d.vendor,"vendor"),model:text(d.model,"model"),family:text(d.family,"family"),platformProfileId:text(d.platformProfileId,"platform_profile_id"),portGroups:Object.freeze(groups),sources:Object.freeze([...(d.sources||[])]),notes:Object.freeze([...(d.notes||[])])});
}
module.exports=Object.freeze({normalize,MEDIA:Object.freeze([...MEDIA]),ROLES:Object.freeze([...ROLES])});
