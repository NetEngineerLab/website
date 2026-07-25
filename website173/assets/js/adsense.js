(function(){
 "use strict";
 if(window.__NEL_ADSENSE_INITIALIZED__)return;
 window.__NEL_ADSENSE_INITIALIZED__=true;
 const config=window.NEL_SITE_CONFIG?.adsense;
 if(!config?.enabled||!/^ca-pub-\d{10,20}$/.test(config.client||""))return;
 const load=()=>{
  const script=document.createElement("script");
  script.async=true;
  script.crossOrigin="anonymous";
  script.src="https://pagead2.googlesyndication.com/pagead/js?client="+encodeURIComponent(config.client);
  document.head.appendChild(script);
  document.querySelectorAll("[data-ad-key]").forEach(holder=>{
   const slot=config.slots?.[holder.dataset.adKey];
   if(!/^\d{6,20}$/.test(slot||""))return;
   holder.hidden=false;
   const body=holder.querySelector(".ad-body")||holder;
   if(body.querySelector("ins.adsbygoogle"))return;
   const ad=document.createElement("ins");
   ad.className="adsbygoogle";
   ad.style.display="block";
   ad.dataset.adClient=config.client;
   ad.dataset.adSlot=slot;
   ad.dataset.adFormat="auto";
   ad.dataset.fullWidthResponsive="true";
   body.appendChild(ad);
   try{(window.adsbygoogle=window.adsbygoogle||[]).push({})}catch{}
  });
 };
 if("requestIdleCallback" in window)requestIdleCallback(load,{timeout:3000});
 else addEventListener("load",()=>setTimeout(load,900),{once:true});
})();
