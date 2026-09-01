(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;root.NELWirelessLinkEngine=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){"use strict";
const round=(v,d=2)=>Number(v.toFixed(d));
const keys=["distanceKm","frequencyGHz","txPower","txCableLoss","txGain","rxGain","rxCableLoss","extraLoss","sensitivity","obstaclePercent","clearanceM"];
function validate(i){return Boolean(i)&&typeof i==="object"&&!Array.isArray(i)
 &&keys.every(key=>Number.isFinite(i[key]))
 &&i.distanceKm>0&&i.frequencyGHz>0
 &&i.txCableLoss>=0&&i.rxCableLoss>=0&&i.extraLoss>=0&&i.clearanceM>=0
 &&i.obstaclePercent>0&&i.obstaclePercent<100;}
function fspl(distanceKm,frequencyGHz){return 92.45+20*Math.log10(distanceKm)+20*Math.log10(frequencyGHz)}
function fresnel(distanceKm,frequencyGHz,obstaclePercent=50){const d1=distanceKm*obstaclePercent/100,d2=distanceKm-d1;return 17.32*Math.sqrt(d1*d2/(frequencyGHz*distanceKm))}
function calculate(i){if(!validate(i))return{ok:false,error:"input"};
 const eirp=i.txPower-i.txCableLoss+i.txGain,pathLoss=fspl(i.distanceKm,i.frequencyGHz),rxPower=eirp-pathLoss-i.extraLoss+i.rxGain-i.rxCableLoss,fadeMargin=rxPower-i.sensitivity,fresnelRadius=fresnel(i.distanceKm,i.frequencyGHz,i.obstaclePercent),requiredClearance=fresnelRadius*.6,clearanceMargin=i.clearanceM-requiredClearance;
 if(![eirp,pathLoss,rxPower,fadeMargin,fresnelRadius,requiredClearance,clearanceMargin].every(Number.isFinite))return{ok:false,error:"input"};
 const shown={eirp:round(eirp),pathLoss:round(pathLoss),rxPower:round(rxPower),fadeMargin:round(fadeMargin),fresnelRadius:round(fresnelRadius),requiredClearance:round(requiredClearance),clearanceMargin:round(clearanceMargin)};
 let status=shown.fadeMargin>=20?'excellent':shown.fadeMargin>=10?'good':shown.fadeMargin>=0?'marginal':'fail';if(shown.clearanceMargin<0&&status!=='fail')status='marginal';
 const warnings=[];if(shown.fadeMargin<10)warnings.push('fade');if(shown.clearanceMargin<0)warnings.push('fresnel');if(shown.eirp>36)warnings.push('eirp');if(i.frequencyGHz>=60)warnings.push('oxygen');
 return{ok:true,distanceKm:round(i.distanceKm,3),frequencyGHz:round(i.frequencyGHz,3),...shown,status,warnings};}
return{calculate,validate,fspl,fresnel};});
