"use strict";

const isolationVersion="scoped-v2";
const start="/* NEL_SCOPED_CACHE_START */",end="/* NEL_SCOPED_CACHE_END */";

function isolateServiceWorkerCache(source){
 const constant=/\bconst CACHE\s*=/.test(source)?"CACHE":/\bconst C\s*=/.test(source)?"C":null;
 if(!constant)throw new Error("Service Worker cache constant is missing");
 const cacheName=source.match(/\bconst (?:CACHE|C)\s*=\s*["']([^"']+)/)?.[1];
 const prefix=cacheName?.split('-locale-v')[0]+'-';
 if(!prefix?.startsWith('nel-'))throw new Error("Service Worker tool cache prefix is missing");
 source=source.replace(/\n?\/\* NEL_SCOPED_CACHE_START \*\/[\s\S]*?\/\* NEL_SCOPED_CACHE_END \*\/\n?/g,"").replace(/\bcaches\.match\s*\(/g,"nelScopedCacheMatch(");
 // One legacy worker deleted every cache on this origin. Its cleanup must be
 // narrowed before cross-tool cache isolation can preserve the other tools.
 source=source.replace(/\.filter\((\w+)\s*=>\s*\1\s*!==\s*(?:CACHE|C)\)/g,(_,key)=>`.filter(${key}=>${key}.startsWith(${JSON.stringify(prefix)})&&${key}!==${constant})`);
 return source.trimEnd()+`\n${start}
// A different tool may retain another version of a shared asset. Never search
// its cache, and never discard a resource's content-hash query when matching.
function nelScopedCacheMatch(request, options) {
  const navigation = typeof request !== "string" && request.mode === "navigate";
  return caches.open(${constant}).then(cache => cache.match(request, navigation ? { ...options, ignoreSearch: true } : undefined));
}
${end}\n`;
}

module.exports={isolateServiceWorkerCache,isolationVersion};
