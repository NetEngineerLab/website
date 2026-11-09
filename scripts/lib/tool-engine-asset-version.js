"use strict";
const fs=require('node:fs'),path=require('node:path');
const D=require('./tool-v3-dom'),{stableFileHash}=require('../stable-text-hash');

function withVersion(source,version){
 const match=source.match(/^([^?#]*)(?:\?([^#]*))?(#.*)?$/),separator=match[2]?.includes('&amp;')?'&amp;':'&';
 const parameters=(match[2]||'').split(/&(?:amp;)?/).filter(Boolean),at=parameters.findIndex(p=>p.split('=')[0]==='v');
 if(at<0)parameters.push('v='+version);else parameters[at]='v='+version;
 return match[1]+'?'+parameters.join(separator)+(match[3]||'');
}
function withoutVersion(source){
 const match=source.match(/^([^?#]*)(?:\?([^#]*))?(#.*)?$/),separator=match[2]?.includes('&amp;')?'&amp;':'&';
 const parameters=(match[2]||'').split(/&(?:amp;)?/).filter(p=>p&&p.split('=')[0]!=='v');
 return match[1]+(parameters.length?'?'+parameters.join(separator):'')+(match[3]||'');
}
function versionToolEngineScripts(html,pageFile,siteRoot){
 const dom=D.parse(html),base=new URL(path.relative(siteRoot,pageFile).split(path.sep).join('/'),'https://nel.invalid/');
 for(const script of D.all(dom,n=>n.tag==='script'&&D.attr(n,'src'))){
  const source=D.attr(script,'src'),url=new URL(source.replace(/&amp;/g,'&'),base);
  if(url.origin!==base.origin||!/^\/tools\/[^/]+\/js\/engine\.js$/.test(url.pathname))continue;
  const file=path.resolve(siteRoot,'.'+decodeURIComponent(url.pathname));if(!fs.existsSync(file))throw new Error('Missing tool engine '+url.pathname);
  D.set(script,'src',withVersion(source,stableFileHash(file,12)));
 }
 return D.render(dom);
}
module.exports={withVersion,withoutVersion,versionToolEngineScripts};
