(function(root,factory){
  "use strict";
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.NELEthernetSerializationEngine=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  // IEEE 802.3: preamble 7 B + SFD 1 B + minimum inter-packet gap 96 bit times (12 B) per frame on the wire.
  const PREAMBLE_SFD=8,IFG=12;
  function r(v,d){const f=10**d;return Math.round((v+Number.EPSILON)*f)/f;}
  function fmtTime(ns){
    if(ns<1000)return `${r(ns,2).toFixed(2)} ns`;
    if(ns<1e6)return `${r(ns/1000,3).toFixed(3)} µs`;
    return `${r(ns/1e6,3).toFixed(3)} ms`;
  }
  function fmtRate(bps){
    if(bps>=1e9)return `${r(bps/1e9,3).toFixed(3)} Gbps`;
    return `${r(bps/1e6,3).toFixed(3)} Mbps`;
  }
  function validate(v){
    if(!v||typeof v!=="object")return false;
    if(!Number.isSafeInteger(v.frameBytes)||v.frameBytes<64||v.frameBytes>16000)return false;
    if(!Number.isFinite(v.rateGbps)||v.rateGbps<=0||v.rateGbps>1600)return false;
    if(!Number.isSafeInteger(v.hops)||v.hops<1||v.hops>64)return false;
    return true;
  }
  function calculate(v){
    if(!validate(v))return{ok:false,error:"invalid-input"};
    const bps=v.rateGbps*1e9;
    const frameNs=v.frameBytes*8/bps*1e9;
    const wireBytes=v.frameBytes+PREAMBLE_SFD+IFG;
    const wireNs=wireBytes*8/bps*1e9;
    const totalNs=frameNs*v.hops;
    const fps=bps/(wireBytes*8);
    const efficiency=v.frameBytes/wireBytes;
    const l2Bps=fps*v.frameBytes*8;
    return{ok:true,frameNs,wireNs,totalNs,fps,efficiency,l2Bps,wireBytes,status:"healthy",
      display:{
        perHop:fmtTime(frameNs),
        totalDelay:fmtTime(totalNs),
        wireTime:fmtTime(wireNs),
        wireBytes:`${wireBytes} B`,
        frameRate:`${Math.floor(fps).toLocaleString("en-US")} fps`,
        l2Throughput:fmtRate(l2Bps),
        efficiency:`${r(efficiency*100,2).toFixed(2)}%`
      }};
  }
  return{PREAMBLE_SFD,IFG,validate,calculate};
});
