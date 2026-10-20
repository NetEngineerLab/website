/* Typical engineering scenarios: ?scenario=<id> pre-fills the calculator. Expected values live in docs/scenarios-fixtures.json and are checked by docs/scenarios-test.js. */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.NELToolScenarios=api;})(typeof self!=="undefined"?self:this,function(){
 "use strict";
 const DATA={"calcButton":"calculateBtn","scenarios":{"office-vlan-26":{"ipv4PrefixMode":"cidr","ipv4Address":"192.168.10.130","ipv4Prefix":26},"p2p-link-31":{"ipv4PrefixMode":"cidr","ipv4Address":"10.0.0.0","ipv4Prefix":31},"summary-22":{"ipv4PrefixMode":"cidr","ipv4Address":"172.16.2.10","ipv4Prefix":22}}};
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
