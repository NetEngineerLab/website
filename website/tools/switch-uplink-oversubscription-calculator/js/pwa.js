(function(){
  "use strict";
  if(!("serviceWorker" in navigator)||location.protocol==="file:")return;
  const source=document.currentScript?.src;
  const workerUrl=source?new URL("../sw.js",source):new URL("sw.js",location.href);
  addEventListener("load",()=>{
    navigator.serviceWorker.register(workerUrl.pathname).catch(()=>{});
  },{once:true});
})();
