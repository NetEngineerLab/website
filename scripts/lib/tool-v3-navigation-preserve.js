"use strict";
const D=require('./tool-v3-dom');
// Registry workflow cards are regenerated; domain resources authored on the
// page remain source content and must survive replacement of the graph marker.
function preserveAuthoredGraph(before,after){
 const source=D.parse(before),authored=D.all(source,n=>D.attr(n,'data-nel-v3-related')==='authored');if(!authored.length)return after;
 const dom=D.parse(after),graph=D.all(dom,n=>D.attr(n,'id')==='nel-tool-graph')[0];if(!graph)throw Error('Authored workflow resources have no workflow section after navigation rebuild');
 const roots=authored.filter(n=>!authored.some(p=>p!==n&&D.all(p,c=>c===n).length));
 if(D.all(graph,n=>D.attr(n,'data-nel-v3-related')==='authored').length)return after;
 graph.children.push(...roots);return D.render(dom);
}
module.exports={preserveAuthoredGraph};
