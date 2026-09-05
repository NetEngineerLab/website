"use strict";const M=require("../model"),H=require("../helpers");
function render(model){const m=M.fromCanonical(model),l=[`interface ${m.name}`];if(m.description)l.push(` description ${m.description}`);if(m.mode==="access")l.push(" port link-type access",` port default vlan ${m.accessVlan}`);else{l.push(" port link-type trunk",` port trunk allow-pass vlan ${H.h3cList(m.allowedVlans)}`);if(m.nativeVlan!==null)l.push(` port trunk pvid vlan ${m.nativeVlan}`)}l.push("#");return l.join("\n")}
module.exports={render};
