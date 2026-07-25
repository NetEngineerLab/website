
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
}
function show(){
 const e=document.createElement("div");
 e.className="nel-cookie-banner";
 e.innerHTML='<h3>🍪 Cookie Preferences</h3><p>We use cookies to improve experience and analyze traffic.</p><div class="nel-cookie-actions"><button class="nel-cookie-reject">Reject</button><button class="nel-cookie-accept">Accept All</button></div>';
 document.body.appendChild(e);
 e.querySelector(".nel-cookie-accept").onclick=()=>{localStorage.setItem(KEY,"true");update(true);e.remove()};
 e.querySelector(".nel-cookie-reject").onclick=()=>{localStorage.setItem(KEY,"false");update(false);e.remove()};
}
document.addEventListener("DOMContentLoaded",()=>{
 const v=localStorage.getItem(KEY);
 if(v===null) show(); else update(v==="true");
});
})();
