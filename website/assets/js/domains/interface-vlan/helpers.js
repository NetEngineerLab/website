/** NetEngineerLab | V2.1-Phase2-InterfaceVlan | VLAN rendering helpers */
"use strict";
function compressVlans(values){const v=[...values].sort((a,b)=>a-b),out=[];for(let i=0;i<v.length;){let j=i;while(j+1<v.length&&v[j+1]===v[j]+1)j++;out.push(j-i>=2?`${v[i]}-${v[j]}`:j===i?String(v[i]):`${v[i]},${v[j]}`);i=j+1}return out.join(",")}
function parseVlanList(text){const out=[];for(const token of String(text).trim().split(/[ ,]+/).filter(Boolean)){const m=token.match(/^(\d+)(?:-(\d+)|\s+to\s+(\d+))?$/i);if(!m)throw new Error("invalid_vlan_list");const a=Number(m[1]),b=Number(m[2]||m[3]||m[1]);if(a<1||b>4094||b<a)throw new Error("invalid_vlan_list");for(let n=a;n<=b;n++)out.push(n)}return [...new Set(out)].sort((a,b)=>a-b)}
function h3cList(values){const v=[...values].sort((a,b)=>a-b),out=[];for(let i=0;i<v.length;){let j=i;while(j+1<v.length&&v[j+1]===v[j]+1)j++;out.push(j>i?`${v[i]} to ${v[j]}`:String(v[i]));i=j+1}return out.join(" ")}
module.exports={compressVlans,parseVlanList,h3cList};
