(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.NELWiFiPlannerEngine=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
  const num=(value,fallback=0)=>{
    const n=Number(value);
    return Number.isFinite(n)?n:fallback;
  };
  const round=(value,digits=2)=>Number(Number(value).toFixed(digits));
  const ceilSafe=value=>Math.max(0,Math.ceil(Number(value)||0));

  const PHY_PER_STREAM_MBPS={
    wifi5:{20:86.7,40:200.0,80:433.3,160:866.7},
    wifi6:{20:143.4,40:286.8,80:600.5,160:1201.0},
    wifi6e:{20:143.4,40:286.8,80:600.5,160:1201.0},
    wifi7:{20:180.1,40:360.3,80:720.6,160:1441.2,320:2882.4}
  };

  const STANDARD_BANDS={
    wifi5:["5"],
    wifi6:["2.4","5"],
    wifi6e:["6"],
    wifi7:["2.4","5","6"]
  };

  function fsplAtOneMeter(freqMHz){
    const f=num(freqMHz);
    if(!(f>0))return NaN;
    return 32.44+20*Math.log10(f)+20*Math.log10(0.001);
  }

  function pathLossDistance(maxPathLossDb,freqMHz,pathLossExponent){
    const pl1=fsplAtOneMeter(freqMHz);
    const n=num(pathLossExponent);
    if(!Number.isFinite(pl1)||!(n>0))return NaN;
    return Math.pow(10,(num(maxPathLossDb)-pl1)/(10*n));
  }

  function obstacleLoss(input){
    const lightCount=Math.max(0,num(input.lightWalls));
    const mediumCount=Math.max(0,num(input.mediumWalls));
    const heavyCount=Math.max(0,num(input.heavyWalls));
    const floorCount=Math.max(0,num(input.floorPenetrations));
    return(
      lightCount*Math.max(0,num(input.lightWallLossDb))+
      mediumCount*Math.max(0,num(input.mediumWallLossDb))+
      heavyCount*Math.max(0,num(input.heavyWallLossDb))+
      floorCount*Math.max(0,num(input.floorLossDb))
    );
  }

  function coveragePlan(input){
    const freqMHz=num(input.freqMHz);
    const pathLossExponent=num(input.pathLossExponent);
    const targetRssiClient=num(input.targetRssiClient);
    const targetRssiAp=num(input.targetRssiAp);
    const fadeMarginDb=Math.max(0,num(input.fadeMarginDb));
    const maxDesignRadiusM=Math.max(0,num(input.maxDesignRadiusM));
    const totalAreaM2=Math.max(0,num(input.totalAreaM2));
    const floors=Math.max(1,Math.round(num(input.floors,1)));
    const layoutEfficiency=clamp(num(input.layoutEfficiencyPct,65)/100,0.05,1);
    const overlap=clamp(num(input.overlapPct,15)/100,0,0.9);

    const requiredPositive=[
      freqMHz,pathLossExponent,num(input.apTxPowerDbm),num(input.clientTxPowerDbm),
      num(input.apAntennaGainDbi),num(input.clientAntennaGainDbi)
    ];
    if(!(freqMHz>0)||!(pathLossExponent>0)||!(totalAreaM2>0)||!(maxDesignRadiusM>0)){
      return{ok:false,error:"invalidCoverage"};
    }

    const obstacles=obstacleLoss(input);
    const apEirp=num(input.apTxPowerDbm)+num(input.apAntennaGainDbi)-Math.max(0,num(input.apCableLossDb));
    const clientEirp=num(input.clientTxPowerDbm)+num(input.clientAntennaGainDbi)-Math.max(0,num(input.clientCableLossDb));

    const downlinkBudgetDb=
      apEirp+
      num(input.clientAntennaGainDbi)-
      Math.max(0,num(input.clientCableLossDb))-
      targetRssiClient-
      fadeMarginDb-
      obstacles;

    const uplinkBudgetDb=
      clientEirp+
      num(input.apAntennaGainDbi)-
      Math.max(0,num(input.apCableLossDb))-
      targetRssiAp-
      fadeMarginDb-
      obstacles;

    const downlinkRadiusM=pathLossDistance(downlinkBudgetDb,freqMHz,pathLossExponent);
    const uplinkRadiusM=pathLossDistance(uplinkBudgetDb,freqMHz,pathLossExponent);
    const rfRadiusM=Math.min(downlinkRadiusM,uplinkRadiusM);
    const designRadiusM=Math.min(rfRadiusM,maxDesignRadiusM);

    if(!Number.isFinite(designRadiusM)||!(designRadiusM>0)){
      return{ok:false,error:"invalidCoverage"};
    }

    const geometricAreaM2=Math.PI*designRadiusM*designRadiusM;
    const effectiveAreaPerApM2=geometricAreaM2*layoutEfficiency*(1-overlap);
    const areaPerFloorM2=totalAreaM2/floors;
    const apsPerFloor=Math.max(1,ceilSafe(areaPerFloorM2/effectiveAreaPerApM2));
    const coverageApCount=apsPerFloor*floors;
    const uplinkLimited=uplinkRadiusM<downlinkRadiusM;
    const radiusCapApplied=rfRadiusM>maxDesignRadiusM;

    const warnings=[];
    if(uplinkLimited)warnings.push({code:"uplinkLimited",severity:"medium"});
    if(radiusCapApplied)warnings.push({code:"radiusCapped",severity:"info"});
    if(obstacles>=20)warnings.push({code:"highObstacleLoss",severity:"medium"});
    if(pathLossExponent<2||pathLossExponent>4.5)warnings.push({code:"pathLossExponent",severity:"medium"});
    if(designRadiusM<5)warnings.push({code:"smallCell",severity:"high"});

    return{
      ok:true,
      freqMHz:round(freqMHz),
      fspl1mDb:round(fsplAtOneMeter(freqMHz)),
      obstacleLossDb:round(obstacles),
      apEirpDbm:round(apEirp),
      clientEirpDbm:round(clientEirp),
      downlinkBudgetDb:round(downlinkBudgetDb),
      uplinkBudgetDb:round(uplinkBudgetDb),
      downlinkRadiusM:round(downlinkRadiusM),
      uplinkRadiusM:round(uplinkRadiusM),
      rfRadiusM:round(rfRadiusM),
      designRadiusM:round(designRadiusM),
      geometricAreaM2:round(geometricAreaM2),
      effectiveAreaPerApM2:round(effectiveAreaPerApM2),
      totalAreaM2:round(totalAreaM2),
      areaPerFloorM2:round(areaPerFloorM2),
      floors,
      apsPerFloor,
      coverageApCount,
      uplinkLimited,
      radiusCapApplied,
      warnings
    };
  }

  function validateStandardBand(standard,band,channelWidth){
    const validBands=STANDARD_BANDS[standard]||[];
    if(!validBands.includes(String(band)))return{ok:false,error:"invalidStandardBand"};
    const width=Number(channelWidth);
    if(!(PHY_PER_STREAM_MBPS[standard]||{})[width])return{ok:false,error:"invalidChannelWidth"};
    if(width===320&&!(standard==="wifi7"&&String(band)==="6"))return{ok:false,error:"invalid320MHz"};
    return{ok:true};
  }

  function referencePhyRate(standard,channelWidth,spatialStreams,radiosPerAp=1){
    const table=PHY_PER_STREAM_MBPS[standard]||{};
    const perStream=table[Number(channelWidth)];
    if(!perStream)return NaN;
    return perStream*Math.max(1,Math.round(num(spatialStreams,1)))*Math.max(1,Math.round(num(radiosPerAp,1)));
  }

  function capacityPlan(input){
    const standard=String(input.standard||"wifi6");
    const band=String(input.band||"5");
    const channelWidth=Math.round(num(input.channelWidth,80));
    const check=validateStandardBand(standard,band,channelWidth);
    if(!check.ok)return check;

    const spatialStreams=Math.max(1,Math.round(num(input.spatialStreams,2)));
    const radiosPerAp=Math.max(1,Math.round(num(input.radiosPerAp,1)));
    const totalUsers=Math.max(1,Math.round(num(input.totalUsers,100)));
    const activePct=clamp(num(input.activePct,35),0.1,100);
    const perActiveUserMbps=Math.max(0.01,num(input.perActiveUserMbps,5));
    const protocolEfficiency=clamp(num(input.protocolEfficiencyPct,55)/100,0.05,1);
    const usableAirtime=clamp(num(input.usableAirtimePct,65)/100,0.05,1);
    const clientMix=clamp(num(input.clientMixPct,75)/100,0.05,1);
    const maxAssociatedUsersPerAp=Math.max(1,Math.round(num(input.maxAssociatedUsersPerAp,50)));
    const minimumApCount=Math.max(1,Math.round(num(input.minimumApCount,1)));

    const autoPhyRateMbps=referencePhyRate(standard,channelWidth,spatialStreams,radiosPerAp);
    const useCustom=Boolean(input.useCustomPhyRate);
    const phyRateMbps=useCustom?Math.max(1,num(input.customPhyRateMbps)):autoPhyRateMbps;
    if(!Number.isFinite(phyRateMbps)||!(phyRateMbps>0))return{ok:false,error:"invalidCapacity"};

    const activeUsers=totalUsers*activePct/100;
    const totalDemandMbps=activeUsers*perActiveUserMbps;
    const effectiveThroughputMbps=phyRateMbps*protocolEfficiency*usableAirtime*clientMix;
    const throughputApCount=Math.max(1,ceilSafe(totalDemandMbps/effectiveThroughputMbps));
    const associatedUserApCount=Math.max(1,ceilSafe(totalUsers/maxAssociatedUsersPerAp));
    const capacityApCount=Math.max(throughputApCount,associatedUserApCount,minimumApCount);
    const activeUsersPerAp=activeUsers/capacityApCount;
    const associatedUsersPerAp=totalUsers/capacityApCount;
    const demandPerApMbps=totalDemandMbps/capacityApCount;
    const throughputHeadroomPct=effectiveThroughputMbps>0?
      (effectiveThroughputMbps-demandPerApMbps)/effectiveThroughputMbps*100:0;

    const warnings=[];
    if(activePct>60)warnings.push({code:"highActiveRatio",severity:"medium"});
    if(throughputHeadroomPct<15)warnings.push({code:"lowThroughputHeadroom",severity:"high"});
    if(associatedUsersPerAp>maxAssociatedUsersPerAp*0.85)warnings.push({code:"clientCountNearLimit",severity:"medium"});
    if(channelWidth>=160&&totalUsers>=100)warnings.push({code:"wideChannelDense",severity:"medium"});
    if(useCustom)warnings.push({code:"customPhy",severity:"info"});

    return{
      ok:true,standard,band,channelWidth,spatialStreams,radiosPerAp,totalUsers,
      activePct:round(activePct),activeUsers:round(activeUsers),
      perActiveUserMbps:round(perActiveUserMbps),
      autoPhyRateMbps:round(autoPhyRateMbps),
      phyRateMbps:round(phyRateMbps),
      protocolEfficiencyPct:round(protocolEfficiency*100),
      usableAirtimePct:round(usableAirtime*100),
      clientMixPct:round(clientMix*100),
      effectiveThroughputMbps:round(effectiveThroughputMbps),
      totalDemandMbps:round(totalDemandMbps),
      throughputApCount,associatedUserApCount,minimumApCount,capacityApCount,
      maxAssociatedUsersPerAp,
      activeUsersPerAp:round(activeUsersPerAp),
      associatedUsersPerAp:round(associatedUsersPerAp),
      demandPerApMbps:round(demandPerApMbps),
      throughputHeadroomPct:round(throughputHeadroomPct),
      warnings
    };
  }

  function combinedPlan(input){
    const coverage=input.coverage;
    const capacity=input.capacity;
    if(!coverage?.ok||!capacity?.ok)return{ok:false,error:"incompletePlan"};

    const finalApCount=Math.max(coverage.coverageApCount,capacity.capacityApCount);
    const coverageLimited=coverage.coverageApCount>capacity.capacityApCount;
    const capacityLimited=capacity.capacityApCount>coverage.coverageApCount;
    const bottleneck=coverageLimited?"coverage":capacityLimited?"capacity":"balanced";

    const floors=coverage.floors;
    const base=Math.floor(finalApCount/floors);
    const extra=finalApCount%floors;
    const apsByFloor=Array.from({length:floors},(_,index)=>base+(index<extra?1:0));

    const associatedUsersPerFinalAp=capacity.totalUsers/finalApCount;
    const activeUsersPerFinalAp=capacity.activeUsers/finalApCount;
    const demandPerFinalApMbps=capacity.totalDemandMbps/finalApCount;
    const throughputUtilizationPct=demandPerFinalApMbps/capacity.effectiveThroughputMbps*100;
    const spareApCount=Math.max(0,finalApCount-Math.max(coverage.coverageApCount,capacity.capacityApCount));

    const warnings=[];
    if(throughputUtilizationPct>80)warnings.push({code:"highFinalUtilization",severity:"high"});
    if(bottleneck==="coverage")warnings.push({code:"coverageBottleneck",severity:"info"});
    if(bottleneck==="capacity")warnings.push({code:"capacityBottleneck",severity:"info"});

    return{
      ok:true,finalApCount,bottleneck,coverageApCount:coverage.coverageApCount,
      capacityApCount:capacity.capacityApCount,throughputApCount:capacity.throughputApCount,
      associatedUserApCount:capacity.associatedUserApCount,
      apsByFloor,associatedUsersPerFinalAp:round(associatedUsersPerFinalAp),
      activeUsersPerFinalAp:round(activeUsersPerFinalAp),
      demandPerFinalApMbps:round(demandPerFinalApMbps),
      throughputUtilizationPct:round(throughputUtilizationPct),
      spareApCount,warnings
    };
  }

  function channelPlan(input){
    const finalApCount=Math.max(1,Math.round(num(input.finalApCount,1)));
    const floors=Math.max(1,Math.round(num(input.floors,1)));
    const available20MHzChannels=Math.max(1,Math.round(num(input.available20MHzChannels,12)));
    const channelWidth=Math.max(20,Math.round(num(input.channelWidth,80)));
    const widthUnits=Math.max(1,channelWidth/20);
    const reusableChannels=Math.max(1,Math.floor(available20MHzChannels/widthUnits));
    const apsPerChannel=finalApCount/reusableChannels;
    const reuseLoadPct=apsPerChannel*100;
    const risk=apsPerChannel<=1?"low":apsPerChannel<=2?"medium":apsPerChannel<=3?"high":"critical";

    const base=Math.floor(finalApCount/floors);
    const extra=finalApCount%floors;
    const rows=[];
    let apNumber=1;
    for(let floor=1;floor<=floors;floor++){
      const count=base+(floor<=extra?1:0);
      for(let i=0;i<count;i++){
        rows.push({
          ap:apNumber,
          floor,
          channelGroup:(i+floor-1)%reusableChannels+1
        });
        apNumber++;
      }
    }

    const warnings=[];
    if(risk==="high"||risk==="critical")warnings.push({code:"highReusePressure",severity:"high"});
    if(channelWidth>=160&&reusableChannels<3)warnings.push({code:"fewWideChannels",severity:"medium"});
    warnings.push({code:"regulatoryChannels",severity:"info"});

    return{
      ok:true,finalApCount,floors,available20MHzChannels,channelWidth,widthUnits,
      reusableChannels,apsPerChannel:round(apsPerChannel),
      reuseLoadPct:round(reuseLoadPct),risk,rows,warnings
    };
  }

  return{
    PHY_PER_STREAM_MBPS,STANDARD_BANDS,
    fsplAtOneMeter,pathLossDistance,obstacleLoss,
    coveragePlan,validateStandardBand,referencePhyRate,
    capacityPlan,combinedPlan,channelPlan
  };
});