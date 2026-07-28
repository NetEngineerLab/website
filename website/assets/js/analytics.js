(function(){
 "use strict";

 if(window.__NEL_ANALYTICS_INITIALIZED__)return;
 window.__NEL_ANALYTICS_INITIALIZED__=true;

 const productionHost="netengineerlab.com";
 const hostname=location.hostname.toLowerCase();

 const isProductionHost =
   hostname===productionHost ||
   hostname===`www.${productionHost}`;

 const config=window.NEL_SITE_CONFIG?.analytics;


 const script=document.querySelector(
   "script[data-nel-analytics]"
 );

 const analyticsScript=script;


 const datasetMeasurementId =
   script.dataset.nelAnalytics;


 if(datasetMeasurementId && config){
   config.measurementId=datasetMeasurementId;
 }


 window.dataLayer=window.dataLayer||[];

 window.gtag=window.gtag||function(){
   window.dataLayer.push(arguments);
 };


 window.gtag(
   "consent",
   "default",
   {
    analytics_storage:"denied",
    ad_storage:"denied",
    ad_user_data:"denied",
    ad_personalization:"denied",
    wait_for_update:500
   }
 );


 window.nelTrack=function(name,parameters={}){
   if(typeof window.gtag==="function"){
     window.gtag("event",name,parameters);
   }
 };


 if(
   !isProductionHost ||
   !config?.enabled ||
   !/^G-[A-Z0-9]+$/i.test(config.measurementId||"")
 ){
   return;
 }


 window.NEL_LOAD_ANALYTICS=function(){

   const load=function(){

    const gaScript=document.createElement("script");

    gaScript.async=true;

    gaScript.src=
      "https://www.googletagmanager.com/gtag/js?id="
      +encodeURIComponent(config.measurementId);


    document.head.appendChild(gaScript);


    window.dataLayer=window.dataLayer||[];

    window.gtag=function(){
      window.dataLayer.push(arguments);
    };


    window.gtag("js",new Date());


    window.gtag(
      "config",
      config.measurementId,
      {
       anonymize_ip:
       config.anonymizeIp!==false
      }
    );

   };


   if("requestIdleCallback" in window){

     requestIdleCallback(
       load,
       {
        timeout:2500
       }
     );

   }else{

     addEventListener(
       "load",
       function(){
        setTimeout(load,600);
       },
       {
        once:true
       }
     );

   }

 };

})();