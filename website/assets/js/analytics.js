(function(){
 "use strict";

 if(window.__NEL_ANALYTICS_INITIALIZED__)return;
 window.__NEL_ANALYTICS_INITIALIZED__=true;

 const siteConfig=window.NEL_SITE_CONFIG;
 const config=siteConfig?.analytics;

 window.dataLayer=window.dataLayer||[];
 window.gtag=function(){window.dataLayer.push(arguments)};

 window.gtag("consent","default",{
  analytics_storage:"denied",
  ad_storage:"denied",
  ad_user_data:"denied",
  ad_personalization:"denied",
  wait_for_update:500
 });

 window.nelTrack=function(name,parameters={}){
  if(typeof window.gtag==="function"){
   window.gtag("event",name,parameters);
  }
 };

 if(!config?.enabled||!/^G-[A-Z0-9]+$/i.test(config.measurementId||""))return;

 let productionHost="";
 try{
  productionHost=new URL(siteConfig.siteUrl).hostname.toLowerCase();
 }catch{}

 const allowedHosts=new Set([
  productionHost,
  `www.${productionHost}`
 ]);

 if(!allowedHosts.has(location.hostname.toLowerCase()))return;

 window.NEL_LOAD_ANALYTICS=function(){

  if(document.querySelector("script[data-nel-analytics]"))return;

  const script=document.createElement("script");
  script.async=true;
  script.src="https://www.googletagmanager.com/gtag/js?id="+encodeURIComponent(config.measurementId);
  script.dataset.nelAnalytics=config.measurementId;

  document.head.appendChild(script);

  window.gtag("js",new Date());

  window.gtag("config",config.measurementId,{
   anonymize_ip:config.anonymizeIp!==false
  });
 };

})();