/* Typical engineering scenarios: ?scenario=<id> pre-fills the calculator. Expected values live in docs/scenarios-fixtures.json and are checked by docs/scenarios-test.js. */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.NELToolScenarios=api;})(typeof self!=="undefined"?self:this,function(){
 "use strict";
 const DATA={"calcButton":"calculateBtn","scenarios":{"gpon-bplus-20km-1x32":{"wavelength":"1310","distance":20,"attenuation":0.35,"spliceCount":8,"spliceLoss":0.1,"connectorCount":4,"connectorLoss":0.3,"splitter1":"17","splitter2":"0","otherLoss":0,"engineeringMargin":3,"availableBudget":28,"txPower":0.5,"rxThreshold":-28},"gpon-cplus-20km-1x32":{"wavelength":"1310","distance":20,"attenuation":0.35,"spliceCount":8,"spliceLoss":0.1,"connectorCount":4,"connectorLoss":0.3,"splitter1":"17","splitter2":"0","otherLoss":0,"engineeringMargin":3,"availableBudget":32,"txPower":0.5,"rxThreshold":-32},"p2p-10km-1310":{"wavelength":"1310","distance":10,"attenuation":0.35,"spliceCount":4,"spliceLoss":0.1,"connectorCount":2,"connectorLoss":0.5,"splitter1":"0","splitter2":"0","otherLoss":0,"engineeringMargin":1,"availableBudget":6.2,"txPower":-8.2,"rxThreshold":-14.4}}};
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
