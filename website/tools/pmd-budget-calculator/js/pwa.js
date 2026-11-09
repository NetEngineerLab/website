(function(){
 "use strict";
 if(!("serviceWorker" in navigator)||location.protocol==="file:")return;
 const source=document.currentScript?.src;
 if(!source)return;
 const worker=new URL("../sw.js",source);
 addEventListener("load",()=>{
  navigator.serviceWorker.register(worker.href,{scope:new URL("./",worker).pathname,updateViaCache:"none"})
   .then(registration=>registration.update()).catch(()=>{});
 },{once:true});
})();
