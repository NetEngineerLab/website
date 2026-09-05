"use strict";const M=require("../model"),H=require("../helpers");
function render(model){const m=M.fromCanonical(model),l=[`interface ${m.name}`];if(m.description)l.push(` description ${m.description}`);l.push(" switchport");if(m.mode==="access"){l.push(" switchport mode access",` switchport access vlan ${m.accessVlan}`)}else{l.push(" switchport mode trunk",` switchport trunk allowed vlan ${H.compressVlans(m.allowedVlans)}`);if(m.nativeVlan!==null)l.push(` switchport trunk native vlan ${m.nativeVlan}`)}l.push("!");return l.join("\n")}
module.exports={render};
