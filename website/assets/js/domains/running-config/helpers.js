"use strict";
const vlanHelpers=require("../interface-vlan/helpers");
function lines(s){return String(s||"").replace(/\r/g,"").split("\n")}
function trimmed(s){return lines(s).map(x=>x.trim()).filter(Boolean)}
function addVlans(target,text){for(const v of vlanHelpers.parseVlanList(String(text||"").replace(/\s+to\s+/gi,"-")))target.add(v)}
function splitInterfaceBlocks(input){
 const raw=lines(input),blocks=[],global=[];let cur=null;
 for(const line of raw){const t=line.trim();const m=t.match(/^interface\s+(.+)$/i);if(m){if(cur)blocks.push(cur);cur={name:m[1].trim(),lines:[t]};continue}if(cur){if(t==="!"||t==="#"){cur.lines.push(t);blocks.push(cur);cur=null}else cur.lines.push(t)}else global.push(t)}
 if(cur)blocks.push(cur);return {blocks,global};
}
function compress(values){return vlanHelpers.compressVlans(values||[])}
function h3cList(values){return vlanHelpers.h3cList(values||[])}
module.exports=Object.freeze({lines,trimmed,addVlans,splitInterfaceBlocks,compress,h3cList});
