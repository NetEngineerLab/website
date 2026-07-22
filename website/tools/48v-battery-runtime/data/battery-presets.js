window.NEL_BATTERY_PRESETS={
  version:"1.1.1",
  note:"Editable engineering presets. Final design must use the selected battery manufacturer's discharge tables, end voltage, temperature data and BMS limits.",
  batteries:{
    vrla2v:{
      label:{en:"2 V VRLA telecom cells",zh:"2V通信型VRLA电池"},
      chemistry:"lead-acid",
      nominalCellV:2.00,floatCellV:2.23,startCellV:2.10,cutoffCellV:1.80,
      seriesCells:24,capacityAh:300,ratedHours:10,peukertExponent:1.12,
      dodPct:80,agePct:80,tempPct:90,curvePct:100,pathEfficiencyPct:98
    },
    flooded2v:{
      label:{en:"2 V vented lead-acid cells",zh:"2V固定型开口铅酸电池"},
      chemistry:"lead-acid",
      nominalCellV:2.00,floatCellV:2.23,startCellV:2.10,cutoffCellV:1.80,
      seriesCells:24,capacityAh:500,ratedHours:10,peukertExponent:1.10,
      dodPct:80,agePct:80,tempPct:95,curvePct:100,pathEfficiencyPct:98
    },
    lifepo4_15s:{
      label:{en:"48 V-class LiFePO₄ module (15S reference)",zh:"48V级磷酸铁锂模块（15串参考）"},
      chemistry:"lifepo4",
      nominalCellV:3.20,floatCellV:3.50,startCellV:3.35,cutoffCellV:2.80,
      seriesCells:15,capacityAh:100,ratedHours:1,peukertExponent:1.03,
      dodPct:90,agePct:80,tempPct:95,curvePct:100,pathEfficiencyPct:97
    },
    custom:{
      label:{en:"Custom battery bank",zh:"自定义电池组"},
      chemistry:"custom",
      nominalCellV:2.00,floatCellV:2.23,startCellV:2.10,cutoffCellV:1.80,
      seriesCells:24,capacityAh:300,ratedHours:10,peukertExponent:1.10,
      dodPct:80,agePct:80,tempPct:90,curvePct:100,pathEfficiencyPct:98
    }
  },
  equipment:[
    {id:"olt-small",label:{en:"Compact OLT / access shelf",zh:"小型OLT/接入机框"},amps:5.2},
    {id:"olt-chassis",label:{en:"OLT chassis",zh:"OLT主机框"},amps:16.7},
    {id:"bbu",label:{en:"BBU / baseband unit",zh:"BBU/基带单元"},amps:25.0},
    {id:"transport",label:{en:"Optical transport shelf",zh:"光传输设备机框"},amps:6.3},
    {id:"core-switch",label:{en:"Core switch / router",zh:"核心交换机/路由器"},amps:37.5},
    {id:"mse-bng",label:{en:"MSE / BNG / BRAS",zh:"MSE/BNG/BRAS"},amps:6.30},
    {id:"monitor",label:{en:"Environment monitoring and auxiliaries",zh:"动环监控及辅助负载"},amps:2.1},
    {id:"custom",label:{en:"Custom equipment",zh:"自定义设备"},amps:0}
  ]
};