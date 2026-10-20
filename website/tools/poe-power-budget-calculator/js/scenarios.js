/* Typical engineering scenarios: ?scenario=<id> pre-fills the calculator. Expected values live in docs/scenarios-fixtures.json and are checked by docs/scenarios-test.js. */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.NELToolScenarios=api;})(typeof self!=="undefined"?self:this,function(){
 "use strict";
 const DATA={"calcButton":"calculate","scenarios":{"bt-24-ptz-cameras":{"switchBudget":1440,"switchPorts":24,"deviceCount":24,"deviceWatts":40,"standard":"bt3","cableLoss":10,"headroom":20},"af-24-fixed-cameras":{"switchBudget":370,"switchPorts":24,"deviceCount":24,"deviceWatts":6.5,"standard":"af","cableLoss":10,"headroom":20},"at-16-wifi6-aps":{"switchBudget":740,"switchPorts":24,"deviceCount":16,"deviceWatts":25.5,"standard":"at","cableLoss":10,"headroom":25}}};
 function apply(id,doc){
  const inputs=DATA.scenarios[id];
  if(!inputs||!doc)return false;
  for(const [field,value] of Object.entries(inputs)){
   const node=doc.getElementById(field);
   if(!node)continue;
   node.value=String(value);
   node.dispatchEvent(new Event("input",{bubbles:true}));
   node.dispatchEvent(new Event("change",{bubbles:true}));
  }
  for(const [field,value] of Object.entries(inputs)){const node=doc.getElementById(field);if(node)node.value=String(value);}
  const button=doc.getElementById(DATA.calcButton);
  if(button)button.click();
  return true;
 }
 function init(){
  let id=null;
  try{id=new URLSearchParams(location.search).get("scenario");}catch{id=null;}
  if(id&&apply(id,document)){
   const card=document.querySelector('[data-scenario-id="'+CSS.escape(id)+'"]');
   if(card)card.setAttribute("aria-current","true");
  }
 }
 if(typeof document!=="undefined"){
  if(document.readyState==="complete")setTimeout(init,0);else window.addEventListener("load",()=>setTimeout(init,0),{once:true});
 }
 return{DATA,apply};
});
