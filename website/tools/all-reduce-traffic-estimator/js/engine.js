(function(root,factory){
  "use strict";
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.NELAllReduceEngine=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  // Ring all-reduce (reduce-scatter + all-gather): each rank sends and receives 2(N−1)/N × S bytes
  // in 2(N−1) steps. Time ≈ 2(N−1)·α + 2(N−1)/N · S / B. NCCL busBW = algBW × 2(N−1)/N.
  function r(v,d){const f=10**d;return Math.round((v+Number.EPSILON)*f)/f;}
  function fmtBytes(b){
    if(b>=1e12)return `${r(b/1e12,3).toFixed(3)} TB`;
    if(b>=1e9)return `${r(b/1e9,3).toFixed(3)} GB`;
    if(b>=1e6)return `${r(b/1e6,3).toFixed(3)} MB`;
    if(b>=1e3)return `${r(b/1e3,3).toFixed(3)} kB`;
    return `${r(b,0).toFixed(0)} B`;
  }
  function fmtTime(s){
    if(s>=1)return `${r(s,3).toFixed(3)} s`;
    if(s>=1e-3)return `${r(s*1e3,3).toFixed(3)} ms`;
    return `${r(s*1e6,2).toFixed(2)} µs`;
  }
  function validate(v){
    if(!v||typeof v!=="object")return false;
    if(!Number.isSafeInteger(v.ranks)||v.ranks<2||v.ranks>1000000)return false;
    if(!Number.isFinite(v.paramsBillion)||v.paramsBillion<=0||v.paramsBillion>100000)return false;
    if(![1,2,4].includes(v.bytesPerParam))return false;
    if(!Number.isFinite(v.linkGbps)||v.linkGbps<=0||v.linkGbps>100000)return false;
    if(!Number.isFinite(v.efficiencyPct)||v.efficiencyPct<=0||v.efficiencyPct>100)return false;
    if(!Number.isFinite(v.latencyUs)||v.latencyUs<0||v.latencyUs>100000)return false;
    return true;
  }
  function calculate(v){
    if(!validate(v))return{ok:false,error:"invalid-input"};
    const N=v.ranks;
    const S=v.paramsBillion*1e9*v.bytesPerParam;
    const factor=2*(N-1)/N;
    const perRank=factor*S;
    const fabric=perRank*N;
    const B=v.linkGbps*1e9/8*v.efficiencyPct/100;
    const bwTime=perRank/B;
    const latTime=2*(N-1)*v.latencyUs*1e-6;
    const total=bwTime+latTime;
    const algBw=S/total;
    const busBw=algBw*factor;
    return{ok:true,S,factor,perRank,fabric,bwTime,latTime,total,algBw,busBw,status:"healthy",
      display:{
        bufferSize:fmtBytes(S),
        perRank:fmtBytes(perRank),
        fabricTraffic:fmtBytes(fabric),
        busFactor:`${r(factor,4).toFixed(4)}`,
        bwTime:fmtTime(bwTime),
        latTime:fmtTime(latTime),
        totalTime:fmtTime(total),
        algBw:`${r(algBw/1e9,2).toFixed(2)} GB/s`,
        busBw:`${r(busBw/1e9,2).toFixed(2)} GB/s`
      }};
  }
  return{validate,calculate};
});
