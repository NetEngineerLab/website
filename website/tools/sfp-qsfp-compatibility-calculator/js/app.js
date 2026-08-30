(function(){
  "use strict";
  const zh=document.documentElement.lang.toLowerCase().startsWith("zh");
  const $=id=>document.getElementById(id);
  const E=window.NELSfpQsfpEngine;
  let last;
  const labels=zh?{PASS:"通过",WARNING:"需要确认",FAIL:"不兼容",rate:"速率",lanes:"通道",media:"介质",fiber:"光纤",wavelength:"波长",connector:"接口",input:"输入有效性",powerRange:"光功率范围",sensitivity:"接收灵敏度",overload:"接收过载",ok:"当前参数满足被动链路兼容性和光功率预算。仍需核对设备厂商兼容清单、FEC和固件。",copied:"已复制",csv:"已导出"}:{PASS:"Compatible",WARNING:"Verify host support",FAIL:"Not compatible",rate:"Rate",lanes:"Lanes",media:"Media",fiber:"Fiber",wavelength:"Wavelength",connector:"Connector",input:"Input validity",powerRange:"Optical power range",sensitivity:"Receiver sensitivity",overload:"Receiver overload",ok:"The passive link and optical budget pass. Confirm vendor coding, host firmware and FEC before deployment.",copied:"Copied",csv:"Exported"};
  const formFactors=Object.keys(E.FORM_FACTORS);
  ["aForm","bForm"].forEach(id=>formFactors.forEach(v=>$(id).add(new Option(v,v))));
  const presets={
    "10glr":{form:"SFP+",rate:10,lanes:1,media:"SMF",wave:1310,connector:"LC",tx:-8.2,txMax:.5,rx:-14.4,overload:.5,fiber:"SMF",distance:10,attenuation:.35,connectors:2,connectorLoss:.3,splices:2,spliceLoss:.1,margin:1.5},
    "25glr":{form:"SFP28",rate:25,lanes:1,media:"SMF",wave:1310,connector:"LC",tx:-7,txMax:2,rx:-13.3,overload:.5,fiber:"SMF",distance:10,attenuation:.35,connectors:2,connectorLoss:.3,splices:2,spliceLoss:.1,margin:2},
    "100glr4":{form:"QSFP28",rate:100,lanes:4,media:"SMF",wave:1310,connector:"LC",tx:-4.3,txMax:4.5,rx:-10.6,overload:4.5,fiber:"SMF",distance:10,attenuation:.35,connectors:2,connectorLoss:.3,splices:2,spliceLoss:.1,margin:2},
    "40gsr4":{form:"QSFP+",rate:40,lanes:4,media:"MMF",wave:850,connector:"MPO",tx:-7.6,txMax:2.4,rx:-9.5,overload:2.4,fiber:"MMF",distance:.15,attenuation:3,connectors:2,connectorLoss:.35,splices:0,spliceLoss:.1,margin:.5}
  };
  function setPreset(){
    const p=presets[$("preset").value];
    ["a","b"].forEach(x=>{$(x+"Form").value=p.form;$(x+"Rate").value=p.rate;$(x+"Lanes").value=p.lanes;$(x+"Media").value=p.media;$(x+"Wave").value=p.wave;$(x+"Connector").value=p.connector;$(x+"Tx").value=p.tx;$(x+"TxMax").value=p.txMax;$(x+"Rx").value=p.rx;$(x+"Overload").value=p.overload;});
    ["fiber","distance","attenuation","connectors","connectorLoss","splices","spliceLoss","margin"].forEach(id=>$(id).value=p[id]);
    calculate(false);
  }
  function module(prefix){return{formFactor:$(prefix+"Form").value,aggregateRateGbps:$(prefix+"Rate").value,lanes:$(prefix+"Lanes").value,media:$(prefix+"Media").value,wavelengthNm:$(prefix+"Wave").value,connector:$(prefix+"Connector").value,txMinDbm:$(prefix+"Tx").value,txMaxDbm:$(prefix+"TxMax").value,rxSensitivityDbm:$(prefix+"Rx").value,rxOverloadDbm:$(prefix+"Overload").value};}
  function values(){return{moduleA:module("a"),moduleB:module("b"),link:{fiberType:$("fiber").value,connector:$("aConnector").value,distanceKm:$("distance").value,attenuationDbPerKm:$("attenuation").value,connectorCount:$("connectors").value,connectorLossDb:$("connectorLoss").value,spliceCount:$("splices").value,spliceLossDb:$("spliceLoss").value,engineeringMarginDb:$("margin").value}};}
  const db=v=>Number.isFinite(v)?`${v.toFixed(2)} dB`:"—";
  function calculate(track=true){
    last=E.calculate(values());
    $("rxPower").textContent=Number.isFinite(last.budget.estimatedRxDbm)?`${last.budget.estimatedRxDbm.toFixed(2)} dBm`:"—";
    $("loss").textContent=db(last.budget.physicalLossDb);$("sensitivity").textContent=db(last.budget.sensitivityMarginDb);$("design").textContent=db(last.budget.designMarginDb);$("overload").textContent=db(last.budget.overloadHeadroomDb);
    $("status").className="status "+last.status.toLowerCase();$("status").textContent=labels[last.status];
    $("checks").innerHTML=last.checks.map(c=>`<article class="${c.pass?"pass":"fail"}"><span aria-hidden="true">${c.pass?"✓":"×"}</span><div><strong>${labels[c.id]||c.id}</strong><small>${c.detail}</small></div></article>`).join("");
    const failed=last.checks.filter(c=>!c.pass).map(c=>labels[c.id]||c.id);
    const notes=[...failed,...last.warnings];
    $("advice").textContent=notes.length?notes.join(" · "):labels.ok;
    if(track&&typeof window.nelTrack==="function")window.nelTrack("sfp_qsfp_compatibility_check",{status:last.status,form_a:$("aForm").value,form_b:$("bForm").value});
  }
  function report(){if(!last)calculate(false);return[`NetEngineerLab ${zh?"光模块兼容性检查":"SFP/QSFP compatibility report"}`,`${zh?"状态":"Status"}: ${labels[last.status]}`,`${zh?"预计接收光功率":"Estimated Rx"}: ${$("rxPower").textContent}`,`${zh?"链路物理损耗":"Physical loss"}: ${$("loss").textContent}`,`${zh?"设计余量":"Design margin"}: ${$("design").textContent}`,...last.checks.map(c=>`${c.pass?"PASS":"FAIL"} ${labels[c.id]||c.id}: ${c.detail}`)].join("\n");}
  async function copy(){try{await navigator.clipboard.writeText(report())}catch{const a=document.createElement("textarea");a.value=report();document.body.append(a);a.select();document.execCommand("copy");a.remove();}$("copy").textContent=labels.copied;}
  function csv(){const rows=report().split("\n").map(x=>`"${x.replaceAll('"','""')}"`).join("\n");const b=new Blob(["\uFEFFResult\n"+rows],{type:"text/csv"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="sfp-qsfp-compatibility-report.csv";a.click();URL.revokeObjectURL(a.href);$("csv").textContent=labels.csv;}
  document.querySelectorAll("input,select").forEach(x=>x.addEventListener("input",()=>calculate(false)));$("preset").addEventListener("change",setPreset);$("calculate").addEventListener("click",()=>calculate());$("copy").addEventListener("click",copy);$("csv").addEventListener("click",csv);setPreset();
})();
