
(function(){
"use strict";
const KEY="nel_cookie_consent_v1";
let lastFocus=null;
function update(ok){
 if(typeof window.gtag==="function"){
  window.gtag("consent","update",{
   analytics_storage:ok?"granted":"denied",
   ad_storage:ok?"granted":"denied",
   ad_user_data:ok?"granted":"denied",
   ad_personalization:ok?"granted":"denied"
  });
 }
 if(ok && typeof window.NEL_LOAD_ANALYTICS==="function") window.NEL_LOAD_ANALYTICS();
 window.dispatchEvent(new CustomEvent("nel:consent-updated",{detail:{analytics:ok}}));
}
function focusWithoutScroll(node){
 if(!node||typeof node.focus!=="function")return;
 try{node.focus({preventScroll:true});}
 catch(error){node.focus();}
}
function show(){
 if(document.querySelector(".nel-cookie-banner"))return;
 const locale=(document.documentElement.dataset.nelLocale||document.documentElement.lang||"").toLowerCase();
 const isZh=locale.startsWith("zh");
 const isEs=locale.startsWith("es");
 const copy=isZh
  ?{title:"Cookie",body:"可选分析只在你同意后启用，可随时撤回。",reject:"拒绝",accept:"接受",privacy:"隐私政策",legal:"ePrivacy 5(3) / GDPR 7"}
  :isEs
  ?{title:"Cookies",body:"Las analíticas opcionales solo se activan si usted las acepta.",reject:"Rechazar",accept:"Aceptar",privacy:"Privacidad",legal:"ePrivacy 5(3) / RGPD 7"}
  :{title:"Cookies",body:"Optional analytics starts only after you agree.",reject:"Decline",accept:"Accept",privacy:"Privacy",legal:"ePrivacy 5(3) / GDPR 7"};
 const e=document.createElement("div");
 e.className="nel-cookie-banner";
 e.setAttribute("role","dialog");
 e.setAttribute("aria-modal","true");
 e.setAttribute("aria-labelledby","nel-cookie-title");
 e.setAttribute("aria-describedby","nel-cookie-description");
 const privacyHref=isZh?"/zh/privacy/":isEs?"/es/privacy/":"/privacy/";
 e.innerHTML=`<h3 id="nel-cookie-title">${copy.title}</h3><p id="nel-cookie-description">${copy.body}</p> <p class="nel-cookie-legal"><a href="${privacyHref}">${copy.privacy}</a> · ${copy.legal}</p><div class="nel-cookie-actions"><button class="nel-cookie-reject" type="button">${copy.reject}</button><button class="nel-cookie-accept" type="button">${copy.accept}</button></div>`;
 document.body.appendChild(e);
 lastFocus=document.activeElement;
 const close=(value)=>{
  localStorage.setItem(KEY,String(value));update(value);e.remove();
  focusWithoutScroll(lastFocus);
 };
 e.querySelector(".nel-cookie-accept").onclick=()=>close(true);
 e.querySelector(".nel-cookie-reject").onclick=()=>close(false);
 e.addEventListener("keydown",event=>{
  if(event.key!=="Tab")return;
  const buttons=[...e.querySelectorAll("button")];
  const first=buttons[0],last=buttons[buttons.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();focusWithoutScroll(last)}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();focusWithoutScroll(first)}
 });
 focusWithoutScroll(e.querySelector(".nel-cookie-reject"));
}
document.addEventListener("DOMContentLoaded",()=>{
 const v=localStorage.getItem(KEY);
 if(v===null) show(); else update(v==="true");
 document.querySelectorAll("[data-nel-cookie-settings]").forEach(button=>button.addEventListener("click",()=>{
  localStorage.removeItem(KEY);update(false);show();
 }));
});
})();
