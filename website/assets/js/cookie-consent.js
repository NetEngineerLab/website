
(function(){
"use strict";

const KEY="nel_cookie_consent_v1";

function updateConsent(granted){
 if(typeof window.gtag!=="function") return;

 window.gtag("consent","update",{
  analytics_storage:granted?"granted":"denied",
  ad_storage:granted?"granted":"denied",
  ad_user_data:granted?"granted":"denied",
  ad_personalization:granted?"granted":"denied"
 });

 if(granted && typeof window.NEL_LOAD_ANALYTICS==="function"){
  window.NEL_LOAD_ANALYTICS();
 }
}

function save(value){
 localStorage.setItem(KEY, JSON.stringify({
  value:value,
  time:Date.now()
 }));
}

function showBanner(){
 const box=document.createElement("div");
 box.className="nel-cookie-banner";
 box.innerHTML=`
 <h3>🍪 Cookie Preferences</h3>
 <p>We use cookies to analyze traffic and improve engineering tools.</p>
 <div class="nel-cookie-actions">
 <button class="nel-cookie-reject">Reject</button>
 <button class="nel-cookie-accept">Accept All</button>
 </div>`;

 document.body.appendChild(box);

 box.querySelector(".nel-cookie-accept").onclick=()=>{
  save(true);
  updateConsent(true);
  box.remove();
 };

 box.querySelector(".nel-cookie-reject").onclick=()=>{
  save(false);
  updateConsent(false);
  box.remove();
 };
}

document.addEventListener("DOMContentLoaded",()=>{
 const saved=localStorage.getItem(KEY);
 if(saved===null){
  showBanner();
 }else{
  updateConsent(JSON.parse(saved).value===true);
 }
});

})();
