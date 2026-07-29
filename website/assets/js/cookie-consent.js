
(function(){
"use strict";
const KEY="nel_cookie_consent_v1";
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
 const isZh=(document.documentElement.lang||"").toLowerCase().startsWith("zh");
 const copy=isZh
  ?{title:"Cookie 偏好设置",body:"我们使用 Cookie 改善使用体验并分析网站流量。",reject:"拒绝",accept:"全部接受"}
  :{title:"Cookie Preferences",body:"We use cookies to improve experience and analyze traffic.",reject:"Reject",accept:"Accept All"};
 const e=document.createElement("div");
 e.className="nel-cookie-banner";
 e.setAttribute("role","dialog");
 e.setAttribute("aria-labelledby","nel-cookie-title");
 e.setAttribute("aria-describedby","nel-cookie-description");
 e.innerHTML=`<h3 id="nel-cookie-title">🍪 ${copy.title}</h3><p id="nel-cookie-description">${copy.body}</p><div class="nel-cookie-actions"><button class="nel-cookie-reject" type="button">${copy.reject}</button><button class="nel-cookie-accept" type="button">${copy.accept}</button></div>`;
 document.body.appendChild(e);
 e.querySelector(".nel-cookie-accept").onclick=()=>{localStorage.setItem(KEY,"true");update(true);e.remove()};
 e.querySelector(".nel-cookie-reject").onclick=()=>{localStorage.setItem(KEY,"false");update(false);e.remove()};
}
document.addEventListener("DOMContentLoaded",()=>{
 const v=localStorage.getItem(KEY);
 if(v===null) show(); else update(v==="true");
});
})();
