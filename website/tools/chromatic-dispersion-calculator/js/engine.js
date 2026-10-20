(function(root,factory){
  "use strict";
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.NELChromaticDispersionEngine=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  // ITU-T G.652 dispersion model: D(λ) = (S0/4)·(λ − λ0⁴/λ³) ps/(nm·km)
  function r(v,d){const f=10**d;return Math.round((v+Number.EPSILON)*f)/f;}
  function coefficient(lambdaNm,lambda0Nm,s0){
    return (s0/4)*(lambdaNm-Math.pow(lambda0Nm,4)/Math.pow(lambdaNm,3));
  }
  function validate(v){
    if(!v||typeof v!=="object")return false;
    const fin=(x)=>Number.isFinite(x);
    if(v.mode!=="model"&&v.mode!=="manual")return false;
    if(!fin(v.lengthKm)||v.lengthKm<=0||v.lengthKm>20000)return false;
    if(!fin(v.compensation))return false;
    if(!fin(v.tolerance)||v.tolerance<=0)return false;
    if(!fin(v.spectralWidth)||v.spectralWidth<0)return false;
    if(v.mode==="model"){
      if(!fin(v.wavelength)||v.wavelength<1200||v.wavelength>1700)return false;
      if(!fin(v.lambda0)||v.lambda0<1200||v.lambda0>1700)return false;
      if(!fin(v.s0)||v.s0<=0||v.s0>0.2)return false;
    }else if(!fin(v.manualD)||Math.abs(v.manualD)>50)return false;
    return true;
  }
  function calculate(v){
    if(!validate(v))return{ok:false,error:"invalid-input"};
    const D=v.mode==="model"?coefficient(v.wavelength,v.lambda0,v.s0):v.manualD;
    const fiberCd=D*v.lengthKm;
    const residualCd=fiberCd-v.compensation;
    const margin=v.tolerance-Math.abs(residualCd);
    // Lengths that keep |D·L − C| ≤ T: (C·sign(D) − T)/|D| ≤ L ≤ (C·sign(D) + T)/|D|
    const maxKm=Math.abs(D)>0?(v.tolerance+v.compensation*Math.sign(D))/Math.abs(D):Infinity;
    const minKm=Math.abs(D)>0?Math.max((v.compensation*Math.sign(D)-v.tolerance)/Math.abs(D),0):0;
    const broadening=Math.abs(residualCd)*v.spectralWidth;
    const usedPct=Math.abs(residualCd)/v.tolerance*100;
    const status=margin<0?"failed":usedPct>80?"warning":"healthy";
    return{
      ok:true,D,fiberCd,residualCd,margin,maxKm,minKm,broadening,usedPct,status,
      display:{
        dCoef:`${r(D,3).toFixed(3)} ps/(nm·km)`,
        fiberCd:`${r(fiberCd,1).toFixed(1)} ps/nm`,
        residualCd:`${r(residualCd,1).toFixed(1)} ps/nm`,
        cdMargin:`${r(margin,1).toFixed(1)} ps/nm`,
        // Over-compensated links have a minimum length too, so show the whole window.
        maxLength:!Number.isFinite(maxKm)?(Math.abs(v.compensation)<=v.tolerance?"∞":"@cd-no-length"):maxKm<=0?"@cd-no-length":minKm>0?`${r(minKm,2).toFixed(2)}–${r(maxKm,2).toFixed(2)} km`:`${r(maxKm,2).toFixed(2)} km`,
        broadening:`${r(broadening,2).toFixed(2)} ps`,
        usedPct:`${r(usedPct,1).toFixed(1)}%`
      }
    };
  }
  return{coefficient,validate,calculate};
});
