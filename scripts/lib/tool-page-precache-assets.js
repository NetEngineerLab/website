"use strict";
const fs=require('node:fs'),path=require('node:path');
const D=require('./tool-v3-dom');

// Match browser requests from final HTML, including semantic versions and
// fingerprints. Existing CORE entries remain responsible for dynamic assets.
function toolPagePrecacheAssets(html,pageFile,toolRoot,siteRoot){
 const base=new URL(path.relative(siteRoot,pageFile).split(path.sep).join('/'),'https://nel.invalid/');
 const assets=[];
 for(const node of D.all(D.parse(html),()=>true)){
  let reference='';
  if(['script','img','source'].includes(node.tag))reference=D.attr(node,'src');
  else if(node.tag==='link'&&D.attr(node,'rel').split(/\s+/).some(rel=>['stylesheet','icon','apple-touch-icon','manifest','preload','modulepreload'].includes(rel)))reference=D.attr(node,'href');
  if(!reference||/^(?:data|blob):/.test(reference))continue;
  const url=new URL(reference.replace(/&amp;/g,'&'),base);if(url.origin!==base.origin)continue;
  const target=path.resolve(siteRoot,'.'+decodeURIComponent(url.pathname));
  const relative=path.relative(siteRoot,target);
  if(relative.startsWith('..'+path.sep)||path.isAbsolute(relative)||!fs.existsSync(target)||!fs.statSync(target).isFile())throw new Error('Missing local HTML precache resource: '+reference+' in '+pageFile);
  let key=path.relative(toolRoot,target).split(path.sep).join('/');if(!key.startsWith('.'))key='./'+key;
  assets.push(key+url.search);
 }
 return [...new Set(assets)];
}
module.exports={toolPagePrecacheAssets};
