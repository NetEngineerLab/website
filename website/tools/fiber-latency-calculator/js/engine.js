(function(root,factory){
  "use strict";
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.NELFiberLatencyEngine=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  const C_KM_S=299792.458;
  const MI_TO_KM=1.609344;
  const VACUUM_US_PER_KM=1e6/C_KM_S;
  const DEFAULT_GROUP_INDEX=1.468;

  function roundTo(value,digits){
    const factor=10**digits;
    return Math.round((value+Number.EPSILON)*factor)/factor;
  }

  function formatDelay(us){
    if(!Number.isFinite(us))return{value:null,unit:"",text:"—"};
    const abs=Math.abs(us);
    if(abs<1000){
      const value=roundTo(us,2);
      return{value,unit:"µs",text:`${value.toFixed(2)} µs`};
    }
    const value=roundTo(us/1000,3);
    return{value,unit:"ms",text:`${value.toFixed(3)} ms`};
  }

  function toKilometers(distance,unit){
    if(unit==="mi")return distance*MI_TO_KM;
    if(unit==="m")return distance/1000;
    return distance;
  }

  function isSafeCount(value){
    return Number.isSafeInteger(value)&&value>=0;
  }

  function validate(values){
    if(!values||typeof values!=="object"||Array.isArray(values))return false;
    const unit=values.distanceUnit||"km";
    if(unit!=="km"&&unit!=="mi"&&unit!=="m")return false;
    if(!Number.isFinite(values.distance)||values.distance<=0)return false;
    if(!Number.isFinite(values.routeFactor)||values.routeFactor<1)return false;
    if(!Number.isFinite(values.groupIndex)||values.groupIndex<1||values.groupIndex>1.6)return false;
    if(!isSafeCount(values.equipmentCount))return false;
    if(!Number.isFinite(values.equipmentDelay)||values.equipmentDelay<0)return false;
    if(!Number.isFinite(values.packetSize)||values.packetSize<0)return false;
    if(!Number.isFinite(values.linkRate)||values.linkRate<=0)return false;
    if(!isSafeCount(values.serializationHops))return false;
    return true;
  }

  function calculate(values){
    if(!validate(values))return{ok:false,error:"invalid-input"};
    const distanceKm=toKilometers(values.distance,values.distanceUnit||"km");
    const fiberKm=distanceKm*values.routeFactor;
    const propagationUs=fiberKm*values.groupIndex/C_KM_S*1e6;
    const equipmentUs=values.equipmentCount*values.equipmentDelay;
    const serializationUs=values.serializationHops*(values.packetSize*8)/(values.linkRate*1e9)*1e6;
    const oneWayUs=propagationUs+equipmentUs+serializationUs;
    const rttUs=oneWayUs*2;
    if(![distanceKm,fiberKm,propagationUs,equipmentUs,serializationUs,oneWayUs,rttUs].every(Number.isFinite)){
      return{ok:false,error:"invalid-input"};
    }
    const usPerKm=values.groupIndex/C_KM_S*1e6;
    const speedKmS=C_KM_S/values.groupIndex;
    const percentVsVacuum=(values.groupIndex-1)*100;
    const oneWay=formatDelay(oneWayUs);
    const rtt=formatDelay(rttUs);
    const propagation=formatDelay(propagationUs);
    const equipment=formatDelay(equipmentUs);
    const serialization=formatDelay(serializationUs);
    return{
      ok:true,
      cKmS:C_KM_S,
      distanceKm,
      fiberKm,
      propagationUs,
      equipmentUs,
      serializationUs,
      oneWayUs,
      rttUs,
      usPerKm,
      vacuumUsPerKm:VACUUM_US_PER_KM,
      microwaveUsPerKm:1.0003*VACUUM_US_PER_KM,
      hollowCoreUsPerKm:1.003*VACUUM_US_PER_KM,
      copperNvp65UsPerKm:VACUUM_US_PER_KM/0.65,
      copperNvp70UsPerKm:VACUUM_US_PER_KM/0.70,
      speedKmS,
      fractionOfC:1/values.groupIndex,
      percentVsVacuum,
      oneWayText:oneWay.text,
      rttText:rtt.text,
      propagationText:propagation.text,
      equipmentText:equipment.text,
      serializationText:serialization.text,
      oneWay,
      rtt
    };
  }

  return{
    C_KM_S,
    MI_TO_KM,
    VACUUM_US_PER_KM,
    DEFAULT_GROUP_INDEX,
    formatDelay,
    validate,
    calculate
  };
});
