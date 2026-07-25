(function(root,factory){
 const lib=factory();
 if(typeof module==="object"&&module.exports)module.exports=lib;
 else root.NEL_BANDWIDTH_UNITS=lib;
})(typeof self!=="undefined"?self:this,function(){
 return {
  version:"1.0.0",
  notice:{
   zh:"网络速率默认采用十进制SI单位（1 Mbps = 1,000,000 bit/s）；文件大小可选择十进制或IEC二进制单位。",
   en:"Network rates default to decimal SI units (1 Mbps = 1,000,000 bit/s). File size can use decimal or IEC binary units."
  },
  rateUnits:{
   bps:{factor:1,zh:"bit/s",en:"bit/s"},
   Kbps:{factor:1000,zh:"Kbps",en:"Kbps"},
   Mbps:{factor:1000000,zh:"Mbps",en:"Mbps"},
   Gbps:{factor:1000000000,zh:"Gbps",en:"Gbps"},
   Tbps:{factor:1000000000000,zh:"Tbps",en:"Tbps"},
   Kibps:{factor:1024,zh:"Kibps",en:"Kibps"},
   Mibps:{factor:1048576,zh:"Mibps",en:"Mibps"},
   Gibps:{factor:1073741824,zh:"Gibps",en:"Gibps"}
  },
  sizeUnits:{
   B:{factor:1,zh:"B",en:"B"},
   KB:{factor:1000,zh:"KB",en:"KB"},
   MB:{factor:1000000,zh:"MB",en:"MB"},
   GB:{factor:1000000000,zh:"GB",en:"GB"},
   TB:{factor:1000000000000,zh:"TB",en:"TB"},
   PB:{factor:1000000000000000,zh:"PB",en:"PB"},
   KiB:{factor:1024,zh:"KiB",en:"KiB"},
   MiB:{factor:1048576,zh:"MiB",en:"MiB"},
   GiB:{factor:1073741824,zh:"GiB",en:"GiB"},
   TiB:{factor:1099511627776,zh:"TiB",en:"TiB"},
   PiB:{factor:1125899906842624,zh:"PiB",en:"PiB"}
  },
  timeUnits:{
   second:{factor:1,zh:"秒",en:"seconds"},
   minute:{factor:60,zh:"分钟",en:"minutes"},
   hour:{factor:3600,zh:"小时",en:"hours"},
   day:{factor:86400,zh:"天",en:"days"}
  },
  presets:{
   ideal:{zh:"理想链路",en:"Ideal link",efficiency:100,utilization:100,rttMs:0,setupRtts:0},
   ethernet:{zh:"一般以太网业务",en:"General Ethernet traffic",efficiency:95,utilization:90,rttMs:1,setupRtts:1},
   internet:{zh:"互联网文件传输",en:"Internet file transfer",efficiency:85,utilization:80,rttMs:30,setupRtts:2},
   vpn:{zh:"VPN/加密隧道",en:"VPN / encrypted tunnel",efficiency:80,utilization:75,rttMs:50,setupRtts:2},
   wan:{zh:"高时延广域网",en:"High-latency WAN",efficiency:75,utilization:70,rttMs:120,setupRtts:3},
   backup:{zh:"备份窗口",en:"Backup window",efficiency:90,utilization:85,rttMs:5,setupRtts:1}
  }
 };
});