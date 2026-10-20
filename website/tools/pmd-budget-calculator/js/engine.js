(function(root,factory){
  "use strict";
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.NELPmdBudgetEngine=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  // Fiber mean DGD = PMD coefficient × √L; independent sections add in quadrature (ITU-T G.650.2 / IEC TR 61282-3).
  function r(v,d){const f=10**d;return Math.round((v+Number.EPSILON)*f)/f;}
  function validate(v){
    if(!v||typeof v!=="object")return false;
    const fin=(x)=>Number.isFinite(x);
    if(!fin(v.pmdCoef)||v.pmdCoef<0||v.pmdCoef>5)return false;
    if(!fin(v.lengthKm)||v.lengthKm<=0||v.lengthKm>20000)return false;
    if(!Number.isSafeInteger(v.componentCount)||v.componentCount<0||v.componentCount>1000)return false;
    if(!fin(v.componentPmd)||v.componentPmd<0)return false;
    if(!fin(v.symbolRate)||v.symbolRate<=0||v.symbolRate>2000)return false;
    if(!fin(v.tolerancePct)||v.tolerancePct<=0||v.tolerancePct>100)return false;
    if(!fin(v.maxRatio)||v.maxRatio<1||v.maxRatio>10)return false;
    return true;
  }
  function calculate(v){
    if(!validate(v))return{ok:false,error:"invalid-input"};
    const fiberDgd=v.pmdCoef*Math.sqrt(v.lengthKm);
    const componentSq=v.componentCount*v.componentPmd*v.componentPmd;
    const meanDgd=Math.sqrt(fiberDgd*fiberDgd+componentSq);
    const symbolPeriodPs=1000/v.symbolRate;
    const allowedMean=symbolPeriodPs*v.tolerancePct/100;
    const margin=allowedMean-meanDgd;
    const maxDgd=meanDgd*v.maxRatio;
    const remainingSq=allowedMean*allowedMean-componentSq;
    const maxKm=v.pmdCoef>0?(remainingSq>0?remainingSq/(v.pmdCoef*v.pmdCoef):0):Infinity;
    const usedPct=meanDgd/allowedMean*100;
    const status=margin<0?"failed":usedPct>80?"warning":"healthy";
    return{ok:true,componentsExceed:remainingSq<=0,fiberDgd,meanDgd,symbolPeriodPs,allowedMean,margin,maxDgd,maxKm,usedPct,status,
      display:{
        fiberDgd:`${r(fiberDgd,3).toFixed(3)} ps`,
        meanDgd:`${r(meanDgd,3).toFixed(3)} ps`,
        symbolPeriod:`${r(symbolPeriodPs,2).toFixed(2)} ps`,
        allowedDgd:`${r(allowedMean,2).toFixed(2)} ps`,
        dgdMargin:`${r(margin,3).toFixed(3)} ps`,
        maxDgd:`${r(maxDgd,2).toFixed(2)} ps`,
        // When fixed components alone use up the budget no fiber length fits.
        maxLength:remainingSq<=0?"@pmd-components-exceed":Number.isFinite(maxKm)?`${r(maxKm,0).toFixed(0)} km`:"∞",
        usedPct:`${r(usedPct,1).toFixed(1)}%`
      }};
  }
  return{validate,calculate};
});
