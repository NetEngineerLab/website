window.NEL_OPTICAL_STANDARDS={
 version:"1.1.0",
 notice:{
  zh:"工程参考库。正式项目必须以设备规格书、企业标准和现场测试数据为准。",
  en:"Engineering reference library. Final projects must follow equipment specifications, enterprise standards and field measurements."
 },
 // Status policy shared by the Optical Power Budget tool (OPB-STATUS-1.0).
 // Healthy: every margin >= its threshold; Caution: any margin in [0, threshold);
 // Failed (= Critical in the SiteOps quality policy): any margin < 0.
 statusPolicy:{
  id:"OPB-STATUS-1.0",
  defaultThresholdsDb:{remaining:3,sensitivity:3,overload:3}
 },
 systems:{
  "gpon-b":{
   name:{zh:"GPON B+",en:"GPON B+"},
   source:"ITU-T G.984.2 (08/2019) Class B+ downstream",
   minimumTxDbm:1.5,maximumTxDbm:5,receiverSensitivityDbm:-27,receiverOverloadDbm:-8,
   opticalPathPenaltyDb:0.5,maximumOdnLossDb:28,systemReachKm:20
  },
  "gpon-c":{
   name:{zh:"GPON C+",en:"GPON C+"},
   source:"ITU-T G.984.2 (08/2019) Class C+ downstream",
   minimumTxDbm:3,maximumTxDbm:7,receiverSensitivityDbm:-30,receiverOverloadDbm:-8,
   opticalPathPenaltyDb:1,maximumOdnLossDb:32,systemReachKm:20
  },
  "epon-reference":{
   name:{zh:"EPON 1000BASE-PX20",en:"EPON 1000BASE-PX20"},
   source:"IEEE 802.3 Clause 60, 1000BASE-PX20 downstream (PX20-D Tx +2…+7 dBm, PX20-U Rx -24 dBm / overload -3 dBm; power budget 26 dB; channel insertion loss 10–24 dB; 20 km)",
   // The 2 dB between the 26 dB power budget and the 24 dB channel insertion
   // loss (penalty allocation plus unallocated budget) is applied as the
   // optical path penalty so that the standard budget equals the 24 dB class.
   minimumTxDbm:2,maximumTxDbm:7,receiverSensitivityDbm:-24,receiverOverloadDbm:-3,
   opticalPathPenaltyDb:2,maximumOdnLossDb:24,systemReachKm:20
  },
  "ethernet-10gbase-lr":{
   name:{zh:"数据中心 10GBASE-LR",en:"Data center 10GBASE-LR"},
   source:"IEEE 802.3 Clause 52, 10GBASE-LR (average launch power -8.2…+0.5 dBm; average receive power -14.4…+0.5 dBm; channel insertion loss 6.2 dB; 10 km)",
   minimumTxDbm:-8.2,maximumTxDbm:0.5,receiverSensitivityDbm:-14.4,receiverOverloadDbm:0.5,
   opticalPathPenaltyDb:0,maximumOdnLossDb:6.2,systemReachKm:10,
   // IEEE 802.3 caps the maximum receive power at the maximum launch power, so
   // an in-spec link cannot overload; only a negative overload margin is flagged.
   statusThresholdsDb:{remaining:3,sensitivity:3,overload:0}
  }
 },
 // Planning (cabled) attenuation. 1490 nm sits between 1310 and 1550 nm on the
 // G.652.D curve (e.g. fibre datasheet maxima 0.32 / 0.21 / 0.18 dB/km at
 // 1310 / 1490 / 1550 nm); 0.25 dB/km keeps a cabling allowance.
 fiberAttenuationDbPerKm:{
  "1310":0.35,
  "1490":0.25,
  "1550":0.20,
  "1625":0.25
 },
 splitters:[
  {ratio:"1:2",branches:2,lossDb:3.7},
  {ratio:"1:4",branches:4,lossDb:7.2},
  {ratio:"1:8",branches:8,lossDb:10.5},
  {ratio:"1:16",branches:16,lossDb:13.8},
  {ratio:"1:32",branches:32,lossDb:17.0},
  {ratio:"1:64",branches:64,lossDb:20.5},
  {ratio:"1:128",branches:128,lossDb:24.0}
 ],
 // Maximum mated-connector and splice loss per ANSI/TIA-568.3-D.
 componentLimitsDb:{connectorMax:0.75,spliceMax:0.3},
 defaults:{
  spliceLossDb:0.10,
  connectorLossDb:0.30,
  engineeringMarginDb:3,
  primarySplitter:"1:8",
  secondarySplitter:"1:8"
 }
};
