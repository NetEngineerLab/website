
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
function show(){
 if(document.querySelector(".nel-cookie-banner"))return;
 const isZh=(document.documentElement.lang||"").toLowerCase().startsWith("zh");
 const copy=isZh
  ?{title:"Cookie 偏好设置",body:"必要功能无需 Cookie。只有在你明确同意后，我们才启用可选分析，用于了解页面使用情况。你可以随时在隐私页面撤回选择。",reject:"拒绝分析",accept:"接受分析",privacy:"隐私政策"}
  :{title:"Cookie Preferences",body:"Necessary features work without cookies. Optional analytics is enabled only after you agree, and you can withdraw your choice at any time from the privacy page.",reject:"Decline analytics",accept:"Accept analytics",privacy:"Privacy policy"};
 const e=document.createElement("div");
 e.className="nel-cookie-banner";
 e.setAttribute("role","dialog");
 e.setAttribute("aria-modal","true");
 e.setAttribute("aria-labelledby","nel-cookie-title");
 e.setAttribute("aria-describedby","nel-cookie-description");
 const privacyHref=isZh?"/zh/privacy/":"/privacy/";
 e.innerHTML=`<h3 id="nel-cookie-title">${copy.title}</h3><p id="nel-cookie-description">${copy.body}</p><p class="nel-cookie-legal"><a href="${privacyHref}">${copy.privacy}</a> · ePrivacy 第 5(3) 条 / GDPR 第 7 条</p><div class="nel-cookie-actions"><button class="nel-cookie-reject" type="button">${copy.reject}</button><button class="nel-cookie-accept" type="button">${copy.accept}</button></div>`;
 document.body.appendChild(e);
 lastFocus=document.activeElement;
 const close=(value)=>{
  localStorage.setItem(KEY,String(value));update(value);e.remove();
  if(lastFocus&&typeof lastFocus.focus==="function")lastFocus.focus();
 };
 e.querySelector(".nel-cookie-accept").onclick=()=>close(true);
 e.querySelector(".nel-cookie-reject").onclick=()=>close(false);
 e.addEventListener("keydown",event=>{
  if(event.key!=="Tab")return;
  const buttons=[...e.querySelectorAll("button")];
  const first=buttons[0],last=buttons[buttons.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
 });
 e.querySelector(".nel-cookie-reject").focus();
}
document.addEventListener("DOMContentLoaded",()=>{
 const v=localStorage.getItem(KEY);
 if(v===null) show(); else update(v==="true");
 document.querySelectorAll("[data-nel-cookie-settings]").forEach(button=>button.addEventListener("click",()=>{
  localStorage.removeItem(KEY);update(false);show();
 }));
});
})();
