window.NEL_OPTICAL_STANDARDS={
 version:"1.0.0",
 notice:{
  zh:"工程参考库。正式项目必须以设备规格书、企业标准和现场测试数据为准。",
  en:"Engineering reference library. Final projects must follow equipment specifications, enterprise standards and field measurements."
 },
 systems:{
  "gpon-b":{
   name:{zh:"GPON B+",en:"GPON B+"},
   minimumTxDbm:1.5,receiverSensitivityDbm:-27,receiverOverloadDbm:-8,
   opticalPathPenaltyDb:0.5,maximumOdnLossDb:28,systemReachKm:20
  },
  "gpon-c":{
   name:{zh:"GPON C+",en:"GPON C+"},
   minimumTxDbm:3,receiverSensitivityDbm:-30,receiverOverloadDbm:-8,
   opticalPathPenaltyDb:1,maximumOdnLossDb:32,systemReachKm:20
  },
  "epon-reference":{
   name:{zh:"EPON工程参考",en:"EPON engineering reference"},
   minimumTxDbm:2,receiverSensitivityDbm:-27,receiverOverloadDbm:-3,
   opticalPathPenaltyDb:0.5,maximumOdnLossDb:28.5,systemReachKm:20
  }
 },
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
 defaults:{
  spliceLossDb:0.10,
  connectorLossDb:0.30,
  engineeringMarginDb:3,
  primarySplitter:"1:8",
  secondarySplitter:"1:8"
 }
};