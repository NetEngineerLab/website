/* Typical engineering scenarios: ?scenario=<id> pre-fills the calculator. Expected values live in docs/scenarios-fixtures.json and are checked by scripts/pon-scenarios-test.js. */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.NELToolScenarios=api;})(typeof self!=="undefined"?self:this,function(){
 "use strict";
 const DATA={"calcButton":"calculateBtn","scenarios":{"gpon-cplus-1x64":{"distance":20,"wavelength":"1490","attenuation":0.25,"spliceCount":6,"spliceLoss":0.1,"connectorCount":4,"connectorLoss":0.3,"splitter1":"20.5","splitter2":"0","splitter3":"0","otherLoss":0,"opticalPenalty":1,"margin":3,"aging":0,"temperature":0,"maintenance":0,"protection":0,"systemReach":20,"txPower":3,"txMaxPower":7,"rxSensitivity":-30,"rxOverload":-8},"gpon-bplus-1x32-cascade":{"distance":15,"wavelength":"1490","attenuation":0.25,"spliceCount":6,"spliceLoss":0.1,"connectorCount":4,"connectorLoss":0.3,"splitter1":"7.2","splitter2":"10.5","splitter3":"0","otherLoss":0,"opticalPenalty":1,"margin":3,"aging":0,"temperature":0,"maintenance":0,"protection":0,"systemReach":20,"txPower":1.5,"txMaxPower":5,"rxSensitivity":-27,"rxOverload":-8},"gpon-bplus-1x128-overbudget":{"distance":10,"wavelength":"1490","attenuation":0.25,"spliceCount":6,"spliceLoss":0.1,"connectorCount":4,"connectorLoss":0.3,"splitter1":"20.5","splitter2":"3.7","splitter3":"0","otherLoss":0,"opticalPenalty":1,"margin":3,"aging":0,"temperature":0,"maintenance":0,"protection":0,"systemReach":20,"txPower":1.5,"txMaxPower":5,"rxSensitivity":-27,"rxOverload":-8}}};
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
