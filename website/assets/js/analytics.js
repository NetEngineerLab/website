(function(){
 "use strict";
 if(window.__NEL_ANALYTICS_INITIALIZED__)return;
 window.__NEL_ANALYTICS_INITIALIZED__=true;
 const config=window.NEL_SITE_CONFIG?.analytics;
 window.nelTrack=function(name,parameters={}){
  if(typeof window.gtag==="function")window.gtag("event",name,parameters);
 };
 if(!config?.enabled||!/^G-[A-Z0-9]+$/i.test(config.measurementId||""))return;
 const load=()=>{
  const script=document.createElement("script");
  script.async=true;
  script.src="https://www.googletagmanager.com/gtag/js?id="+encodeURIComponent(config.measurementId);
  document.head.appendChild(script);
  window.dataLayer=window.dataLayer||[];
  window.gtag=function(){window.dataLayer.push(arguments)};
  window.gtag("js",new Date());
  window.gtag("config",config.measurementId,{anonymize_ip:config.anonymizeIp!==false});
 };
 if("requestIdleCallback" in window)requestIdleCallback(load,{timeout:2500});
 else addEventListener("load",()=>setTimeout(load,600),{once:true});
})();
