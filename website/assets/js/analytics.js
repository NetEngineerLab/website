(function(){
 "use strict";

 if(window.__NEL_ANALYTICS_INITIALIZED__)return;

 const siteConfig=window.NEL_SITE_CONFIG;
 const config=siteConfig&&siteConfig.analytics;
 const measurementId=config&&config.measurementId;

 window.dataLayer=window.dataLayer||[];
 window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};
 window.gtag("consent","default",{
  analytics_storage:"denied",
  ad_storage:"denied",
  ad_user_data:"denied",
  ad_personalization:"denied",
  wait_for_update:500
 });

 window.nelTrack=function(name,parameters){
  if(typeof window.gtag==="function"){
   window.gtag("event",name,parameters||{});
  }
 };

 if(!config||config.enabled!==true||!/^G-[A-Z0-9]+$/i.test(measurementId||"")){
  return;
 }

 let productionHost="";
 try{
  productionHost=new URL(siteConfig.siteUrl).hostname.toLowerCase();
 }catch(error){
  return;
 }

 const currentHost=location.hostname.toLowerCase();
 const allowedHosts=new Set([productionHost,`www.${productionHost}`]);
 if(!allowedHosts.has(currentHost))return;

 window.__NEL_ANALYTICS_INITIALIZED__=true;

 window.NEL_LOAD_ANALYTICS=function(){
  if(document.querySelector("script[data-nel-analytics]"))return;

  const script=document.createElement("script");
  script.async=true;
  script.src="https://www.googletagmanager.com/gtag/js?id="+encodeURIComponent(measurementId);
  script.dataset.nelAnalytics=measurementId;
  script.onerror=function(){
   window.__NEL_ANALYTICS_LOAD_FAILED__=true;
  };
  document.head.appendChild(script);

  window.gtag("js",new Date());
  window.gtag("config",measurementId,{
   anonymize_ip:config.anonymizeIp!==false,
   send_page_view:true
  });
 };
})();
