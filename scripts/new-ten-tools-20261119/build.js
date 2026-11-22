#!/usr/bin/env node
"use strict";
/**
 * Generates the ten 2026-11-19 engineering tools.
 * Calculation source is written into each tool's own js/engine.js.
 * This script does not modify existing engines.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { stableFileHash, stableHash } = require("../stable-text-hash");
const { rulesRuntimeAssets } = require("../rules-runtime-assets");

const root = path.resolve(__dirname, "../..");
const site = path.join(root, "website");
const C = 299792458;
const H = 6.62607015e-34;

function write(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
}
function esc(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}
function hash12(file) {
  return stableFileHash(file, 12);
}

const tools = [
  {
    id: "itu-dwdm-grid-calculator",
    order: 48,
    category: "optical",
    domain: "optical",
    icon: "DG",
    workflow: "itu-grid-and-ase",
    probe: "channel",
    probeEdit: "1",
    probeInvalid: "-1000000",
    primary: "frequencyTHz",
    engineGlobal: "NEL_DwdmGrid",
    related: ["fiber-loss", "chromatic-dispersion-calculator", "optical-power-budget"],
    tags: { en: ["DWDM", "G.694.1", "Wavelength"], zh: ["DWDM", "G.694.1", "波长"], es: ["DWDM", "G.694.1", "Longitud de onda"] },
    heroEyebrow: { en: "OPTICAL CHANNEL GRID", zh: "光信道栅格", es: "REJILLA DE CANALES ÓPTICOS" },
    heroTags: { en: ["G.694.1", "193.1 THz", "Frequency", "Wavelength"], zh: ["G.694.1", "193.1 THz", "光频率", "真空波长"], es: ["G.694.1", "193,1 THz", "Frecuencia", "Longitud de onda"] },
    name: { en: "ITU DWDM Grid Calculator", zh: "ITU DWDM 频率栅格计算器", es: "Calculadora de rejilla DWDM UIT" },
    description: {
      en: "Convert an ITU-T G.694.1 channel index into optical frequency and vacuum wavelength from the 193.1 THz anchor.",
      zh: "按 ITU-T G.694.1，把以 193.1 THz 为锚点的信道序号换成光频率和真空波长。",
      es: "Convierte un índice de canal ITU-T G.694.1 en frecuencia óptica y longitud de onda en el vacío desde el ancla de 193,1 THz."
    },
    intent: "calculation"
  },
  {
    id: "edfa-ase-osnr-estimator",
    order: 49,
    category: "optical",
    domain: "optical",
    icon: "OS",
    workflow: "itu-grid-and-ase",
    probe: "spans",
    probeEdit: "2",
    probeInvalid: "0",
    primary: "osnrDb",
    engineGlobal: "NEL_EdfaOsnr",
    related: ["optical-power-budget", "itu-dwdm-grid-calculator", "fiber-loss"],
    tags: { en: ["OSNR", "ASE", "EDFA"], zh: ["OSNR", "ASE", "EDFA"], es: ["OSNR", "ASE", "EDFA"] },
    heroEyebrow: { en: "OPTICAL AMPLIFIER NOISE", zh: "光放大器噪声", es: "RUIDO DEL AMPLIFICADOR ÓPTICO" },
    heroTags: { en: ["ASE", "OSNR", "Noise factor", "Span count"], zh: ["ASE", "OSNR", "噪声系数", "跨段数量"], es: ["ASE", "OSNR", "Factor de ruido", "Vanos"] },
    name: { en: "EDFA ASE OSNR Estimator", zh: "EDFA ASE 与 OSNR 估算器", es: "Estimador de OSNR y ASE de EDFA" },
    description: {
      en: "Estimate amplifier ASE and OSNR from gain, noise factor, optical frequency, reference bandwidth and identical span count.",
      zh: "用增益、噪声系数、光频率、参考带宽和相同跨段数量估算 ASE 与 OSNR。",
      es: "Estima el ASE y la OSNR a partir de la ganancia, el factor de ruido, la frecuencia, el ancho de referencia y el número de vanos iguales."
    },
    intent: "calculation"
  },
  {
    id: "ethernet-line-coding-calculator",
    order: 50,
    category: "network",
    domain: "ip-networking",
    icon: "LC",
    workflow: "line-rate-and-capacity",
    probe: "payload",
    probeEdit: "40",
    probeInvalid: "0",
    primary: "lineGbps",
    engineGlobal: "NEL_LineCoding",
    related: ["ethernet-serialization-delay-calculator", "bandwidth-calculator", "mtu-calculator"],
    tags: { en: ["64b/66b", "8b/10b", "FEC"], zh: ["64b/66b", "8b/10b", "FEC"], es: ["64b/66b", "8b/10b", "FEC"] },
    heroEyebrow: { en: "LINE CODING OVERHEAD", zh: "线路编码开销", es: "SOBRECARGA DE CODIFICACIÓN" },
    heroTags: { en: ["8b/10b", "64b/66b", "RS-FEC", "Line rate"], zh: ["8b/10b", "64b/66b", "RS-FEC", "线路速率"], es: ["8b/10b", "64b/66b", "RS-FEC", "Tasa de línea"] },
    name: { en: "Ethernet Line-Coding Overhead Calculator", zh: "以太网线路编码开销计算器", es: "Calculadora de sobrecarga de codificación Ethernet" },
    description: {
      en: "Expand a payload bit rate by the published 8b/10b, 64b/66b and RS-FEC codeword ratios.",
      zh: "按已发布的 8b/10b、64b/66b 和 RS-FEC 码字比例，把净荷速率换成线路速率。",
      es: "Amplía una tasa de carga útil con las relaciones publicadas 8b/10b, 64b/66b y de palabra RS-FEC."
    },
    intent: "calculation"
  },
  {
    id: "tcp-mathis-throughput-estimator",
    order: 51,
    category: "network",
    domain: "ip-networking",
    icon: "TM",
    workflow: "loss-and-queue-models",
    probe: "rtt",
    probeEdit: "80",
    probeInvalid: "0",
    primary: "throughputMbps",
    engineGlobal: "NEL_Mathis",
    related: ["bandwidth-calculator", "ethernet-serialization-delay-calculator", "fiber-latency-calculator"],
    tags: { en: ["TCP", "BDP", "Loss"], zh: ["TCP", "BDP", "丢包"], es: ["TCP", "BDP", "Pérdida"] },
    heroEyebrow: { en: "TCP LOSS MODEL", zh: "TCP 丢包模型", es: "MODELO TCP CON PÉRDIDA" },
    heroTags: { en: ["MSS", "RTT", "Loss", "Delay product"], zh: ["MSS", "RTT", "丢包概率", "带宽时延积"], es: ["MSS", "RTT", "Pérdida", "Producto B-R"] },
    name: { en: "TCP Mathis Throughput Estimator", zh: "TCP Mathis 吞吐估算器", es: "Estimador de caudal TCP de Mathis" },
    description: {
      en: "Estimate the Mathis loss-based TCP ceiling and the bandwidth-delay product from MSS, RTT and loss probability.",
      zh: "用 MSS、RTT 和丢包概率估算 Mathis 丢包模型下的 TCP 吞吐上限和带宽时延积。",
      es: "Estima el techo TCP de Mathis y el producto ancho de banda-retardo a partir de MSS, RTT y probabilidad de pérdida."
    },
    intent: "calculation"
  },
  {
    id: "mm1-queue-delay-calculator",
    order: 52,
    category: "network",
    domain: "ip-networking",
    icon: "Q1",
    workflow: "loss-and-queue-models",
    probe: "arrival",
    probeEdit: "500",
    probeInvalid: "0",
    primary: "sojournMs",
    engineGlobal: "NEL_Mm1",
    related: ["ethernet-serialization-delay-calculator", "bandwidth-calculator", "tcp-mathis-throughput-estimator"],
    tags: { en: ["M/M/1", "Queue", "Latency"], zh: ["M/M/1", "排队", "时延"], es: ["M/M/1", "Cola", "Latencia"] },
    heroEyebrow: { en: "QUEUEING DELAY", zh: "排队时延", es: "RETARDO DE COLA" },
    heroTags: { en: ["Arrival rate", "Service rate", "Utilization", "Sojourn"], zh: ["到达率", "服务率", "利用率", "逗留时间"], es: ["Llegadas", "Servicio", "Utilización", "Permanencia"] },
    name: { en: "M/M/1 Queue Delay Calculator", zh: "M/M/1 排队时延计算器", es: "Calculadora de retardo de cola M/M/1" },
    description: {
      en: "Calculate utilization, waiting time and sojourn time for a single M/M/1 queue from arrival and service rates.",
      zh: "用到达率和服务率计算单服务员 M/M/1 队列的利用率、等待时间和逗留时间。",
      es: "Calcula utilización, espera y permanencia de una cola M/M/1 a partir de las tasas de llegada y servicio."
    },
    intent: "calculation"
  },
  {
    id: "path-availability-calculator",
    order: 53,
    category: "operations",
    domain: "operations",
    icon: "AV",
    workflow: "facility-power-pathway",
    probe: "mttrHours",
    probeEdit: "8",
    probeInvalid: "0",
    primary: "availability",
    engineGlobal: "NEL_Availability",
    related: ["pue-data-center-energy-efficiency", "ups-capacity-battery-runtime-calculator", "network-capacity-forecast-planner"],
    tags: { en: ["Availability", "MTBF", "Redundancy"], zh: ["可用度", "MTBF", "冗余"], es: ["Disponibilidad", "MTBF", "Redundancia"] },
    heroEyebrow: { en: "PATH RELIABILITY", zh: "路径可用度", es: "DISPONIBILIDAD DE TRAYECTO" },
    heroTags: { en: ["Series", "Parallel", "MTBF", "MTTR"], zh: ["串联", "并联", "MTBF", "MTTR"], es: ["Serie", "Paralelo", "MTBF", "MTTR"] },
    name: { en: "Path Availability Calculator", zh: "端到端路径可用度计算器", es: "Calculadora de disponibilidad de trayecto" },
    description: {
      en: "Combine independent series or parallel availabilities, or convert MTBF and MTTR into availability and annual downtime.",
      zh: "把相互独立的串联或并联可用度合成，或把 MTBF 与 MTTR 换成可用度和年停机时间。",
      es: "Combina disponibilidades independientes en serie o paralelo, o convierte MTBF y MTTR en disponibilidad y tiempo anual fuera de servicio."
    },
    intent: "calculation"
  },
  {
    id: "dc-feeder-voltage-drop-calculator",
    order: 54,
    category: "power",
    domain: "power-datacenter",
    icon: "FD",
    workflow: "facility-power-pathway",
    probe: "current",
    probeEdit: "200",
    probeInvalid: "-1",
    primary: "dropV",
    engineGlobal: "NEL_FeederDrop",
    related: ["telecom-rectifier-dc-power-sizing", "poe-voltage-drop-calculator", "48v-battery-runtime"],
    tags: { en: ["DC plant", "Voltage drop", "Copper"], zh: ["直流系统", "压降", "铜导体"], es: ["Planta DC", "Caída", "Cobre"] },
    heroEyebrow: { en: "DC POWER FEEDER", zh: "直流馈电线", es: "ALIMENTADOR DE CORRIENTE CONTINUA" },
    heroTags: { en: ["Current", "Length", "Copper area", "Temperature"], zh: ["电流", "长度", "铜截面积", "温度"], es: ["Corriente", "Longitud", "Sección", "Temperatura"] },
    name: { en: "DC Feeder Voltage Drop Calculator", zh: "直流馈电线电压降计算器", es: "Calculadora de caída en alimentador de CC" },
    description: {
      en: "Estimate two-wire or one-way DC feeder drop from current, length, copper area and temperature.",
      zh: "按电流、长度、铜截面积和温度估算单程或往返直流馈电线压降。",
      es: "Estima la caída de un alimentador de CC de ida o de ida y vuelta según corriente, longitud, sección de cobre y temperatura."
    },
    intent: "calculation"
  },
  {
    id: "pathway-fill-calculator",
    order: 55,
    category: "power",
    domain: "power-datacenter",
    icon: "PF",
    workflow: "facility-power-pathway",
    probe: "conduit",
    probeEdit: "50",
    probeInvalid: "0",
    primary: "fillPercent",
    engineGlobal: "NEL_PathwayFill",
    related: ["network-rack-power-cooling-calculator", "dc-feeder-voltage-drop-calculator", "data-center-cooling-load-calculator"],
    tags: { en: ["Conduit", "Fill", "Pathway"], zh: ["导管", "填充率", "通道"], es: ["Conducto", "Llenado", "Canalización"] },
    heroEyebrow: { en: "CABLE PATHWAY FILL", zh: "通道填充率", es: "LLENADO DE CANALIZACIÓN" },
    heroTags: { en: ["Cable diameter", "Pathway", "Fill ratio", "Circle area"], zh: ["电缆外径", "通道内径", "填充率", "圆面积"], es: ["Diámetro", "Canalización", "Llenado", "Área circular"] },
    name: { en: "Pathway Geometric Fill Calculator", zh: "电缆通道几何填充率计算器", es: "Calculadora geométrica de llenado de canalización" },
    description: {
      en: "Compare the circle area of cable groups with the inner area of a round pathway.",
      zh: "用电缆组的圆面积和圆形通道内截面积比较几何填充率。",
      es: "Compara el área circular de los grupos de cables con el área interior de una canalización redonda."
    },
    intent: "calculation"
  },
  {
    id: "copper-propagation-delay-calculator",
    order: 56,
    category: "network",
    domain: "ip-networking",
    icon: "CD",
    workflow: "line-rate-and-capacity",
    probe: "length",
    probeEdit: "250",
    probeInvalid: "0",
    primary: "delayNs",
    engineGlobal: "NEL_CopperDelay",
    related: ["fiber-latency-calculator", "ethernet-serialization-delay-calculator", "poe-voltage-drop-calculator"],
    tags: { en: ["Delay", "Velocity factor", "Copper"], zh: ["时延", "速度系数", "铜缆"], es: ["Retardo", "Factor de velocidad", "Cobre"] },
    heroEyebrow: { en: "PROPAGATION DELAY", zh: "传播时延", es: "RETARDO DE PROPAGACIÓN" },
    heroTags: { en: ["Length", "Velocity factor", "One-way delay", "Speed of light"], zh: ["长度", "速度系数", "单向时延", "光速"], es: ["Longitud", "Factor de velocidad", "Retardo", "Velocidad de la luz"] },
    name: { en: "Copper Propagation Delay Calculator", zh: "铜缆单向传播时延计算器", es: "Calculadora de retardo de propagación en cobre" },
    description: {
      en: "Calculate one-way propagation delay from cable length and a velocity factor you supply.",
      zh: "用你输入的长度和速度系数计算铜缆单向传播时延。",
      es: "Calcula el retardo de propagación en un sentido a partir de la longitud y del factor de velocidad que indiques."
    },
    intent: "calculation"
  },
  {
    id: "shannon-capacity-calculator",
    order: 57,
    category: "wireless",
    domain: "wireless",
    icon: "SH",
    workflow: "line-rate-and-capacity",
    probe: "bandwidth",
    probeEdit: "40",
    probeInvalid: "0",
    primary: "capacityMbps",
    engineGlobal: "NEL_Shannon",
    related: ["wireless-link-budget-calculator", "bandwidth-calculator", "ethernet-line-coding-calculator"],
    tags: { en: ["Shannon", "SNR", "Capacity"], zh: ["香农", "信噪比", "容量"], es: ["Shannon", "SNR", "Capacidad"] },
    heroEyebrow: { en: "CHANNEL CAPACITY", zh: "信道容量", es: "CAPACIDAD DE CANAL" },
    heroTags: { en: ["Bandwidth", "SNR", "log2", "AWGN"], zh: ["带宽", "信噪比", "log2", "AWGN"], es: ["Ancho de banda", "SNR", "log2", "AWGN"] },
    name: { en: "Shannon AWGN Capacity Calculator", zh: "香农 AWGN 信道容量计算器", es: "Calculadora de capacidad AWGN de Shannon" },
    description: {
      en: "Calculate the AWGN channel capacity bound C = B log2(1+S/N) from bandwidth and SNR.",
      zh: "用带宽和信噪比计算 AWGN 信道容量上界 C = B log2(1+S/N)。",
      es: "Calcula la cota de capacidad del canal AWGN C = B log2(1+S/N) a partir del ancho de banda y la SNR."
    },
    intent: "calculation"
  }
];

const workflows = [
  {
    id: "itu-grid-and-ase",
    domain: "optical",
    en: { name: "Optical grid and ASE estimate", description: "Place a channel on the ITU grid, then estimate ASE and OSNR for identical amplifier spans." },
    zh: { name: "光频率栅格与 ASE 估算", description: "先把信道放到 ITU 栅格上，再按相同放大器跨段估算 ASE 和 OSNR。" },
    es: { name: "Rejilla óptica y estimación de ASE", description: "Sitúa un canal en la rejilla UIT y después estima ASE y OSNR para vanos de amplificador iguales." },
    steps: [
      ["itu-dwdm-grid-calculator", "Place the channel on the frequency grid", "把信道放到频率栅格上"],
      ["edfa-ase-osnr-estimator", "Estimate ASE and OSNR", "估算 ASE 与 OSNR"]
    ]
  },
  {
    id: "line-rate-and-capacity",
    domain: "ip-networking",
    en: { name: "Line rate, copper delay and capacity bound", description: "Expand a payload rate by a published line code, estimate copper delay, then compare an AWGN capacity bound." },
    zh: { name: "线路速率、铜缆时延与容量上界", description: "先按已发布线路编码放大净荷速率，再估算铜缆时延，并对照 AWGN 容量上界。" },
    es: { name: "Tasa de línea, retardo en cobre y cota de capacidad", description: "Amplía la tasa útil con un código de línea publicado, estima el retardo en cobre y compáralo con una cota AWGN." },
    steps: [
      ["ethernet-line-coding-calculator", "Expand the payload rate by the line code", "按线路编码放大净荷速率"],
      ["copper-propagation-delay-calculator", "Estimate copper propagation delay", "估算铜缆传播时延"],
      ["shannon-capacity-calculator", "Compare the AWGN capacity bound", "对照 AWGN 容量上界"]
    ]
  },
  {
    id: "loss-and-queue-models",
    domain: "ip-networking",
    en: { name: "Loss-based TCP and queue delay", description: "Estimate a loss-based TCP ceiling, then the sojourn time of one M/M/1 queue." },
    zh: { name: "丢包 TCP 模型与排队时延", description: "先估算丢包模型下的 TCP 吞吐上限，再计算一个 M/M/1 队列的逗留时间。" },
    es: { name: "TCP por pérdidas y retardo de cola", description: "Estima el techo TCP según pérdidas y después la permanencia de una cola M/M/1." },
    steps: [
      ["tcp-mathis-throughput-estimator", "Estimate the Mathis TCP ceiling", "估算 Mathis TCP 上限"],
      ["mm1-queue-delay-calculator", "Calculate M/M/1 sojourn time", "计算 M/M/1 逗留时间"]
    ]
  },
  {
    id: "facility-power-pathway",
    domain: "power-datacenter",
    en: { name: "Feeder drop, pathway fill and availability", description: "Estimate DC feeder drop and geometric pathway fill, then combine independent path availabilities." },
    zh: { name: "馈线压降、通道填充与可用度", description: "先估算直流馈线压降和通道几何填充率，再合成相互独立路径的可用度。" },
    es: { name: "Caída de alimentador, llenado y disponibilidad", description: "Estima la caída del alimentador de CC y el llenado geométrico, y después combina disponibilidades independientes." },
    steps: [
      ["dc-feeder-voltage-drop-calculator", "Estimate feeder voltage drop", "估算馈线压降"],
      ["pathway-fill-calculator", "Compare geometric pathway fill", "比较通道几何填充率"],
      ["path-availability-calculator", "Combine independent path availability", "合成独立路径可用度"]
    ]
  }
];

function guardSource() {
  return `function fail(code){return {ok:false,error:code};}
function readNumber(value){
  if(value==null)return fail("empty");
  if(typeof value==="string"){
    const text=value.trim();
    if(!text)return fail("empty");
    if(!/^[-+]?(?:\\d+\\.?\\d*|\\.\\d+)(?:e[-+]?\\d+)?$/i.test(text))return fail("invalid-number");
    value=Number(text);
  }
  if(typeof value!=="number"||!Number.isFinite(value))return fail("non-finite");
  return {ok:true,value};
}
function readInt(value){
  const n=readNumber(value);
  if(!n.ok)return n;
  if(!Number.isInteger(n.value))return fail("not-integer");
  return n;
}
function unitValue(node,table){
  if(!node||typeof node!=="object")return fail("empty");
  const n=readNumber(node.value);
  if(!n.ok)return n;
  const factor=table[node.unit];
  if(factor==null)return fail("bad-unit");
  const out=n.value*factor;
  if(!Number.isFinite(out))return fail("overflow");
  return {ok:true,value:out};
}
function fmt(value,digits){
  if(!Number.isFinite(value))return "—";
  const text=value.toFixed(digits);
  return text.replace(/(\\.\\d*?)0+$/,"$1").replace(/\\.$/,"");
}`;
}

function wrapEngine(globalName, body) {
  return `"use strict";
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.${globalName}=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
${guardSource()}
${body}
});
`;
}

function engineBody(id) {
  if (id === "itu-dwdm-grid-calculator") return `
const C_NM_THZ=${C}/1000;
function calculate(input){
  const anchor=unitValue(input&&input.anchor,{THz:1,GHz:1e-3});
  if(!anchor.ok)return anchor;
  const spacing=unitValue(input&&input.spacing,{GHz:1,THz:1000,MHz:1e-3});
  if(!spacing.ok)return spacing;
  const channel=readInt(input&&input.channel);
  if(!channel.ok)return channel;
  if(anchor.value<100||anchor.value>400)return fail("anchor-range");
  if(spacing.value<=0||spacing.value>10000)return fail("spacing-range");
  if(channel.value<-100000||channel.value>100000)return fail("channel-range");
  const frequency=anchor.value+channel.value*spacing.value/1000;
  if(!(frequency>0)||frequency>1000)return fail("frequency-range");
  const wavelength=C_NM_THZ/frequency;
  if(!Number.isFinite(wavelength))return fail("overflow");
  const rows=[];
  for(let n=channel.value-2;n<=channel.value+2;n++){
    const f=anchor.value+n*spacing.value/1000;
    if(f>0)rows.push([String(n),fmt(f,6),fmt(C_NM_THZ/f,6)]);
  }
  return {ok:true,values:{frequencyTHz:frequency,wavelengthNm:wavelength,frequencyGHz:frequency*1000},display:{frequencyTHz:fmt(frequency,6),wavelengthNm:fmt(wavelength,6),frequencyGHz:fmt(frequency*1000,3)},table:rows};
}
return {calculate,constants:{c:${C},anchorTHz:193.1}};`;
  if (id === "edfa-ase-osnr-estimator") return `
const H=${H};
function calculate(input){
  const power=readNumber(input&&input.powerDbm);
  if(!power.ok)return power;
  const gain=readNumber(input&&input.gainDb);
  if(!gain.ok)return gain;
  const nf=readNumber(input&&input.noiseFigureDb);
  if(!nf.ok)return nf;
  const frequency=unitValue(input&&input.frequency,{THz:1e12,GHz:1e9});
  if(!frequency.ok)return frequency;
  const bandwidth=unitValue(input&&input.bandwidth,{GHz:1e9,MHz:1e6,Hz:1});
  if(!bandwidth.ok)return bandwidth;
  const spans=readInt(input&&input.spans);
  if(!spans.ok)return spans;
  if(power.value<-80||power.value>40)return fail("power-range");
  if(gain.value<=0||gain.value>50)return fail("gain-range");
  if(nf.value<0||nf.value>40)return fail("nf-range");
  if(frequency.value<100e12||frequency.value>400e12)return fail("frequency-range");
  if(bandwidth.value<=0||bandwidth.value>1e13)return fail("bandwidth-range");
  if(spans.value<1||spans.value>10000)return fail("span-range");
  const gLin=10**(gain.value/10);
  const fLin=10**(nf.value/10);
  const signalW=10**((power.value-30)/10);
  const aseOne=fLin*H*frequency.value*(gLin-1)*bandwidth.value;
  const aseW=spans.value*aseOne;
  if(!(aseW>0)||!Number.isFinite(aseW)||!Number.isFinite(signalW))return fail("overflow");
  const osnr=signalW/aseW;
  if(!(osnr>0)||!Number.isFinite(osnr))return fail("overflow");
  const osnrDb=10*Math.log10(osnr);
  return {ok:true,values:{osnrDb,aseDbm:10*Math.log10(aseW)+30,signalMw:signalW*1000,aseMw:aseW*1000},display:{osnrDb:fmt(osnrDb,4),aseDbm:fmt(10*Math.log10(aseW)+30,4),signalMw:fmt(signalW*1000,6),aseMw:fmt(aseW*1000,6)}};
}
return {calculate,constants:{h:H}};`;
  if (id === "ethernet-line-coding-calculator") return `
const CODES={
  "8b10b":{num:10,den:8},
  "64b66b":{num:66,den:64},
  "64b66b-rs528":{num:66*528,den:64*514},
  "64b66b-rs544":{num:66*544,den:64*514}
};
function calculate(input){
  const payload=unitValue(input&&input.payload,{Gbps:1,Mbps:1e-3,Tbps:1000});
  if(!payload.ok)return payload;
  const code=CODES[input&&input.code];
  if(!code)return fail("bad-code");
  if(!(payload.value>0)||payload.value>100000)return fail("payload-range");
  const line=payload.value*code.num/code.den;
  if(!Number.isFinite(line))return fail("overflow");
  const ratio=code.num/code.den;
  return {ok:true,values:{lineGbps:line,overheadPercent:(ratio-1)*100,efficiencyPercent:100/ratio,expansion:ratio},display:{lineGbps:fmt(line,6),overheadPercent:fmt((ratio-1)*100,4),efficiencyPercent:fmt(100/ratio,4),expansion:fmt(ratio,6)}};
}
return {calculate,codes:CODES};`;
  if (id === "tcp-mathis-throughput-estimator") return `
function calculate(input){
  const mss=readInt(input&&input.mss);
  if(!mss.ok)return mss;
  const rtt=unitValue(input&&input.rtt,{ms:0.001,us:1e-6,s:1});
  if(!rtt.ok)return rtt;
  const loss=unitValue(input&&input.loss,{probability:1,percent:0.01});
  if(!loss.ok)return loss;
  if(mss.value<1||mss.value>65535)return fail("mss-range");
  if(!(rtt.value>0)||rtt.value>100)return fail("rtt-range");
  if(!(loss.value>0)||loss.value>=1)return fail("loss-range");
  const throughput=(mss.value*8)/(rtt.value*Math.sqrt(loss.value));
  if(!Number.isFinite(throughput))return fail("overflow");
  const out={ok:true,values:{throughputMbps:throughput/1e6,throughputBps:throughput},display:{throughputMbps:fmt(throughput/1e6,6),throughputBps:fmt(throughput,3)}};
  if(input.link&&String(input.link.value).trim()!==""){
    const link=unitValue(input.link,{Mbps:1e6,Gbps:1e9,Kbps:1e3});
    if(!link.ok)return link;
    if(!(link.value>0)||link.value>1e15)return fail("link-range");
    const bdpBytes=link.value*rtt.value/8;
    out.values.bdpBytes=bdpBytes;
    out.values.bdpPackets=bdpBytes/mss.value;
    out.display.bdpBytes=fmt(bdpBytes,3);
    out.display.bdpPackets=fmt(bdpBytes/mss.value,4);
  }else{
    out.values.bdpBytes=null;out.values.bdpPackets=null;out.display.bdpBytes="—";out.display.bdpPackets="—";
  }
  return out;
}
return {calculate};`;
  if (id === "mm1-queue-delay-calculator") return `
function calculate(input){
  const arrival=unitValue(input&&input.arrival,{per_s:1,per_min:1/60});
  if(!arrival.ok)return arrival;
  const service=unitValue(input&&input.service,{per_s:1,per_min:1/60});
  if(!service.ok)return service;
  if(!(arrival.value>0)||arrival.value>1e12)return fail("arrival-range");
  if(!(service.value>0)||service.value>1e12)return fail("service-range");
  if(!(service.value>arrival.value))return fail("unstable");
  const rho=arrival.value/service.value;
  const sojourn=1/(service.value-arrival.value);
  const wait=rho/(service.value*(1-rho));
  const system=rho/(1-rho);
  const queue=rho*rho/(1-rho);
  if(![rho,sojourn,wait,system,queue].every(Number.isFinite))return fail("overflow");
  return {ok:true,values:{utilization:rho,sojournMs:sojourn*1000,waitMs:wait*1000,systemCount:system,queueCount:queue},display:{utilization:fmt(rho,6),sojournMs:fmt(sojourn*1000,6),waitMs:fmt(wait*1000,6),systemCount:fmt(system,6),queueCount:fmt(queue,6)}};
}
return {calculate};`;
  if (id === "path-availability-calculator") return `
function downtime(a){return (1-a)*365*24*60;}
function pack(a){
  if(!(a>0)||a>1||!Number.isFinite(a))return fail("availability-range");
  return {ok:true,values:{availability:a,unavailability:1-a,downMinutesPerYear:downtime(a)},display:{availability:fmt(a,8),unavailability:fmt(1-a,8),downMinutesPerYear:fmt(downtime(a),6)}};
}
function calculate(input){
  if(!input||(input.kind!=="blocks"&&input.kind!=="mtbf"))return fail("bad-kind");
  if(input.kind==="mtbf"){
    const mtbf=readNumber(input.mtbfHours);
    if(!mtbf.ok)return mtbf;
    const mttr=readNumber(input.mttrHours);
    if(!mttr.ok)return mttr;
    if(!(mtbf.value>0)||mtbf.value>1e12)return fail("mtbf-range");
    if(!(mttr.value>0)||mttr.value>1e9)return fail("mttr-range");
    return pack(mtbf.value/(mtbf.value+mttr.value));
  }
  if(input.mode!=="series"&&input.mode!=="parallel")return fail("bad-mode");
  if(!Array.isArray(input.blocks)||input.blocks.length<1||input.blocks.length>20)return fail("block-count");
  const values=[];
  for(const block of input.blocks){
    const n=readNumber(block);
    if(!n.ok)return n;
    if(!(n.value>0)||n.value>1)return fail("availability-range");
    values.push(n.value);
  }
  let a=input.mode==="series"?1:1;
  if(input.mode==="series"){for(const v of values)a*=v;}
  else{let miss=1;for(const v of values)miss*=(1-v);a=1-miss;}
  if(!Number.isFinite(a))return fail("overflow");
  return pack(a);
}
return {calculate};`;
  if (id === "dc-feeder-voltage-drop-calculator") return `
function calculate(input){
  const voltage=readNumber(input&&input.voltage);
  if(!voltage.ok)return voltage;
  const current=readNumber(input&&input.current);
  if(!current.ok)return current;
  const length=unitValue(input&&input.length,{m:1,ft:0.3048});
  if(!length.ok)return length;
  const area=unitValue(input&&input.area,{mm2:1,cm2:100});
  if(!area.ok)return area;
  const temperature=readNumber(input&&input.temperature);
  if(!temperature.ok)return temperature;
  const alpha=readNumber(input&&input.alpha);
  if(!alpha.ok)return alpha;
  const conductors=readInt(input&&input.conductors);
  if(!conductors.ok)return conductors;
  const rho=readNumber(input&&input.rho20);
  if(!rho.ok)return rho;
  if(!(voltage.value>0)||voltage.value>2000)return fail("voltage-range");
  if(current.value<0||current.value>100000)return fail("current-range");
  if(!(length.value>0)||length.value>100000)return fail("length-range");
  if(!(area.value>0)||area.value>100000)return fail("area-range");
  if(temperature.value<-50||temperature.value>200)return fail("temperature-range");
  if(alpha.value<0||alpha.value>0.02)return fail("alpha-range");
  if(conductors.value!==1&&conductors.value!==2)return fail("conductor-count");
  if(!(rho.value>0)||rho.value>10)return fail("rho-range");
  const factor=1+alpha.value*(temperature.value-20);
  if(!(factor>0))return fail("temperature-range");
  const resistance=rho.value*factor*conductors.value*length.value/area.value;
  const drop=current.value*resistance;
  const percent=drop/voltage.value*100;
  const end=voltage.value-drop;
  if(![resistance,drop,percent,end].every(Number.isFinite))return fail("overflow");
  return {ok:true,values:{resistanceOhm:resistance,dropV:drop,dropPercent:percent,endVoltage:end},display:{resistanceOhm:fmt(resistance,6),dropV:fmt(drop,6),dropPercent:fmt(percent,4),endVoltage:fmt(end,4)}};
}
return {calculate,constants:{rho20:1/58}};`;
  if (id === "pathway-fill-calculator") return `
function calculate(input){
  const conduit=unitValue(input&&input.conduit,{mm:1,inch:25.4});
  if(!conduit.ok)return conduit;
  if(!(conduit.value>0)||conduit.value>10000)return fail("conduit-range");
  if(!Array.isArray(input.groups)||input.groups.length<1||input.groups.length>4)return fail("group-count");
  let sumD2=0;
  for(const group of input.groups){
    const diameter=unitValue(group&&group.diameter,{mm:1,inch:25.4});
    if(!diameter.ok)return diameter;
    const count=readInt(group&&group.count);
    if(!count.ok)return count;
    if(!(diameter.value>0)||diameter.value>5000)return fail("diameter-range");
    if(count.value<1||count.value>100000)return fail("count-range");
    sumD2+=count.value*diameter.value*diameter.value;
  }
  if(!Number.isFinite(sumD2))return fail("overflow");
  const fill=sumD2/(conduit.value*conduit.value)*100;
  const out={ok:true,values:{fillPercent:fill,cableAreaFactor:sumD2,conduitDiameterMm:conduit.value},display:{fillPercent:fmt(fill,4),cableAreaFactor:fmt(sumD2,4),conduitDiameterMm:fmt(conduit.value,4)}};
  if(input.limitPercent!=null&&String(input.limitPercent).trim()!==""){
    const limit=readNumber(input.limitPercent);
    if(!limit.ok)return limit;
    if(!(limit.value>0)||limit.value>100)return fail("limit-range");
    out.values.marginPercent=limit.value-fill;
    out.display.marginPercent=fmt(limit.value-fill,4);
    out.status=fill>limit.value?"over-limit":"within-limit";
  }else{
    out.values.marginPercent=null;out.display.marginPercent="—";out.status="no-limit";
  }
  return out;
}
return {calculate};`;
  if (id === "copper-propagation-delay-calculator") return `
const C=${C};
function calculate(input){
  const length=unitValue(input&&input.length,{m:1,ft:0.3048});
  if(!length.ok)return length;
  const vf=readNumber(input&&input.velocityFactor);
  if(!vf.ok)return vf;
  if(!(length.value>0)||length.value>1e9)return fail("length-range");
  if(!(vf.value>0)||vf.value>1)return fail("vf-range");
  const velocity=vf.value*C;
  const delay=length.value/velocity;
  if(!Number.isFinite(delay)||!Number.isFinite(velocity))return fail("overflow");
  return {ok:true,values:{delayNs:delay*1e9,delayUs:delay*1e6,nsPerMeter:1e9/velocity,velocityMps:velocity},display:{delayNs:fmt(delay*1e9,4),delayUs:fmt(delay*1e6,6),nsPerMeter:fmt(1e9/velocity,4),velocityMps:fmt(velocity,3)}};
}
return {calculate,constants:{c:C}};`;
  if (id === "shannon-capacity-calculator") return `
function calculate(input){
  const bandwidth=unitValue(input&&input.bandwidth,{Hz:1,kHz:1e3,MHz:1e6,GHz:1e9});
  if(!bandwidth.ok)return bandwidth;
  const snr=readNumber(input&&input.snr);
  if(!snr.ok)return snr;
  if(!(bandwidth.value>0)||bandwidth.value>1e15)return fail("bandwidth-range");
  let linear;
  if(input.snrUnit==="dB"){
    if(snr.value<-40||snr.value>200)return fail("snr-range");
    linear=10**(snr.value/10);
  }else if(input.snrUnit==="linear"){
    if(snr.value<0||snr.value>1e20)return fail("snr-range");
    linear=snr.value;
  }else return fail("bad-unit");
  const capacity=bandwidth.value*Math.log2(1+linear);
  if(!Number.isFinite(capacity)||!Number.isFinite(linear))return fail("overflow");
  return {ok:true,values:{capacityMbps:capacity/1e6,capacityBps:capacity,snrLinear:linear,spectral:Math.log2(1+linear)},display:{capacityMbps:fmt(capacity/1e6,6),capacityBps:fmt(capacity,3),snrLinear:fmt(linear,6),spectral:fmt(Math.log2(1+linear),6)}};
}
return {calculate};`;
  throw new Error(id);
}

const copy = {
  en: {
    calculate: "Calculate", example: "Load example", reset: "Reset", copy: "Copy result", csv: "Export CSV",
    invalid: "Check the highlighted limit. The previous result has been cleared.",
    ready: "Result updated from the current inputs.",
    inputs: "Inputs", results: "Result", formula: "Formula",
    toc: "On this page", about: "About and applicability", method: "How it is calculated", faq: "FAQ", refs: "References", flow: "Engineering workflow",
    reviewed: "Content reviewed: 2026-11-19",
    approx: "This is an engineering approximation for planning. It is not a laboratory measurement and it does not guarantee equipment performance.",
    start: "Start calculating", home: "Home", tools: "Tools",
    errors: {
      empty: "Enter a value.", "invalid-number": "Enter a finite decimal number.", "non-finite": "The value must be finite.",
      "not-integer": "Enter a whole number.", "bad-unit": "Choose a supported unit.", overflow: "The calculation overflowed. Use a smaller input.",
      "anchor-range": "Keep the anchor between 100 and 400 THz.", "spacing-range": "Spacing must be greater than 0 and at most 10000 GHz.",
      "channel-range": "Keep the channel index between -100000 and 100000.", "frequency-range": "The resulting optical frequency is outside 0 to 1000 THz.",
      "power-range": "Channel power must be from -80 to 40 dBm.", "gain-range": "Gain must be greater than 0 dB and at most 50 dB.",
      "nf-range": "Noise figure must be from 0 to 40 dB for this model.", "bandwidth-range": "Bandwidth is outside the accepted range.",
      "span-range": "Span count must be a whole number from 1 to 10000.", "bad-code": "Choose a line code.",
      "payload-range": "Payload rate must be greater than 0 and at most 100000 Gbps.", "mss-range": "MSS must be a whole number from 1 to 65535 bytes.",
      "rtt-range": "RTT must be greater than 0 and at most 100 s.", "loss-range": "Loss probability must be greater than 0 and less than 1.",
      "link-range": "Link rate must be greater than 0.", "arrival-range": "Arrival rate must be greater than 0.",
      "service-range": "Service rate must be greater than 0.", unstable: "Service rate must be greater than arrival rate.",
      "bad-kind": "Choose blocks or MTBF.", "availability-range": "Availability must be greater than 0 and at most 1.",
      "mtbf-range": "MTBF must be greater than 0.", "mttr-range": "MTTR must be greater than 0.",
      "bad-mode": "Choose series or parallel.", "block-count": "Enter 1 to 20 availability values.",
      "voltage-range": "Voltage must be greater than 0 and at most 2000 V.", "current-range": "Current must be from 0 to 100000 A.",
      "length-range": "Length is outside the accepted range.", "area-range": "Conductor area must be greater than 0.",
      "temperature-range": "Temperature must keep resistivity positive and stay from -50 to 200 °C.", "alpha-range": "Alpha must be from 0 to 0.02 per °C.",
      "conductor-count": "Conductor count must be 1 or 2.", "rho-range": "Resistivity must be greater than 0.",
      "conduit-range": "Pathway diameter must be greater than 0.", "group-count": "Enter 1 to 4 cable groups.",
      "diameter-range": "Cable diameter must be greater than 0.", "count-range": "Cable count must be a whole number from 1 to 100000.",
      "limit-range": "The fill limit must be greater than 0 and at most 100 percent.", "vf-range": "Velocity factor must be greater than 0 and at most 1.",
      "snr-range": "SNR is outside the accepted range."
    }
  },
  zh: {
    calculate: "计算", example: "载入示例", reset: "重置", copy: "复制结果", csv: "导出 CSV",
    invalid: "输入超出限制。上一组有效结果已清除。",
    ready: "结果已按当前输入更新。",
    inputs: "输入", results: "结果", formula: "公式",
    toc: "本页导航", about: "关于与适用范围", method: "计算方法", faq: "问答", refs: "参考资料", flow: "工程工作流",
    reviewed: "内容复核：2026年11月19日",
    approx: "这是规划用的工程近似，不是实验室实测，也不保证设备实际性能。",
    start: "开始计算", home: "首页", tools: "工具",
    errors: {
      empty: "请填写数值。", "invalid-number": "请输入有限的十进制数。", "non-finite": "数值必须是有限数。",
      "not-integer": "请输入整数。", "bad-unit": "请选择支持的单位。", overflow: "计算溢出，请减小输入。",
      "anchor-range": "锚点频率应在 100 到 400 THz。", "spacing-range": "间隔必须大于 0，且不超过 10000 GHz。",
      "channel-range": "信道序号应在 -100000 到 100000。", "frequency-range": "得到的光频率超出 0 到 1000 THz。",
      "power-range": "信道功率应在 -80 到 40 dBm。", "gain-range": "增益必须大于 0 dB，且不超过 50 dB。",
      "nf-range": "本模型的噪声系数应在 0 到 40 dB。", "bandwidth-range": "带宽超出允许范围。",
      "span-range": "跨段数量必须是 1 到 10000 的整数。", "bad-code": "请选择线路编码。",
      "payload-range": "净荷速率必须大于 0，且不超过 100000 Gbps。", "mss-range": "MSS 必须是 1 到 65535 字节的整数。",
      "rtt-range": "RTT 必须大于 0，且不超过 100 s。", "loss-range": "丢包概率必须大于 0 且小于 1。",
      "link-range": "链路速率必须大于 0。", "arrival-range": "到达率必须大于 0。",
      "service-range": "服务率必须大于 0。", unstable: "服务率必须大于到达率。",
      "bad-kind": "请选择可用度列表或 MTBF。", "availability-range": "可用度必须大于 0 且不超过 1。",
      "mtbf-range": "MTBF 必须大于 0。", "mttr-range": "MTTR 必须大于 0。",
      "bad-mode": "请选择串联或并联。", "block-count": "请输入 1 到 20 个可用度。",
      "voltage-range": "电压必须大于 0，且不超过 2000 V。", "current-range": "电流应在 0 到 100000 A。",
      "length-range": "长度超出允许范围。", "area-range": "导体截面积必须大于 0。",
      "temperature-range": "温度应使电阻率保持为正，并处在 -50 到 200 °C。", "alpha-range": "温度系数应在每 °C 0 到 0.02。",
      "conductor-count": "导体回数必须是 1 或 2。", "rho-range": "电阻率必须大于 0。",
      "conduit-range": "通道直径必须大于 0。", "group-count": "请输入 1 到 4 组电缆。",
      "diameter-range": "电缆外径必须大于 0。", "count-range": "电缆根数必须是 1 到 100000 的整数。",
      "limit-range": "填充率限值必须大于 0 且不超过 100%。", "vf-range": "速度系数必须大于 0 且不超过 1。",
      "snr-range": "信噪比超出允许范围。"
    }
  },
  es: {
    calculate: "Calcular", example: "Cargar ejemplo", reset: "Restablecer", copy: "Copiar resultado", csv: "Exportar CSV",
    invalid: "El valor queda fuera del límite. El resultado anterior válido se ha borrado.",
    ready: "Resultado actualizado con los datos actuales.",
    inputs: "Datos", results: "Resultado", formula: "Fórmula",
    toc: "En esta página", about: "Acerca de y aplicabilidad", method: "Cómo se calcula", faq: "Preguntas", refs: "Referencias", flow: "Flujo de ingeniería",
    reviewed: "Content reviewed: 2026-11-19",
    approx: "Es una aproximación de ingeniería para planificación. No es una medición de laboratorio ni garantiza el rendimiento del equipo.",
    start: "Empezar a calcular", home: "Inicio", tools: "Herramientas",
    errors: {
      empty: "Introduce un valor.", "invalid-number": "Introduce un decimal finito.", "non-finite": "El valor debe ser finito.",
      "not-integer": "Introduce un número entero.", "bad-unit": "Elige una unidad admitida.", overflow: "El cálculo se desborda. Usa un dato menor.",
      "anchor-range": "Mantén el ancla entre 100 y 400 THz.", "spacing-range": "La separación debe ser mayor que 0 y como máximo 10000 GHz.",
      "channel-range": "El índice de canal debe estar entre -100000 y 100000.", "frequency-range": "La frecuencia óptica queda fuera de 0 a 1000 THz.",
      "power-range": "La potencia de canal debe estar entre -80 y 40 dBm.", "gain-range": "La ganancia debe ser mayor que 0 dB y como máximo 50 dB.",
      "nf-range": "La figura de ruido de este modelo debe estar entre 0 y 40 dB.", "bandwidth-range": "El ancho de banda queda fuera del rango aceptado.",
      "span-range": "El número de vanos debe ser un entero de 1 a 10000.", "bad-code": "Elige un código de línea.",
      "payload-range": "La tasa útil debe ser mayor que 0 y como máximo 100000 Gbps.", "mss-range": "El MSS debe ser un entero de 1 a 65535 bytes.",
      "rtt-range": "El RTT debe ser mayor que 0 y como máximo 100 s.", "loss-range": "La probabilidad de pérdida debe ser mayor que 0 y menor que 1.",
      "link-range": "La tasa del enlace debe ser mayor que 0.", "arrival-range": "La tasa de llegada debe ser mayor que 0.",
      "service-range": "La tasa de servicio debe ser mayor que 0.", unstable: "La tasa de servicio debe ser mayor que la de llegada.",
      "bad-kind": "Elige bloques o MTBF.", "availability-range": "La disponibilidad debe ser mayor que 0 y como máximo 1.",
      "mtbf-range": "El MTBF debe ser mayor que 0.", "mttr-range": "El MTTR debe ser mayor que 0.",
      "bad-mode": "Elige serie o paralelo.", "block-count": "Introduce de 1 a 20 disponibilidades.",
      "voltage-range": "La tensión debe ser mayor que 0 y como máximo 2000 V.", "current-range": "La corriente debe estar entre 0 y 100000 A.",
      "length-range": "La longitud queda fuera del rango aceptado.", "area-range": "La sección del conductor debe ser mayor que 0.",
      "temperature-range": "La temperatura debe mantener la resistividad positiva y estar entre -50 y 200 °C.", "alpha-range": "Alfa debe estar entre 0 y 0,02 por °C.",
      "conductor-count": "El número de conductores debe ser 1 o 2.", "rho-range": "La resistividad debe ser mayor que 0.",
      "conduit-range": "El diámetro de la canalización debe ser mayor que 0.", "group-count": "Introduce de 1 a 4 grupos de cables.",
      "diameter-range": "El diámetro del cable debe ser mayor que 0.", "count-range": "La cantidad de cables debe ser un entero de 1 a 100000.",
      "limit-range": "El límite de llenado debe ser mayor que 0 y como máximo 100 por ciento.", "vf-range": "El factor de velocidad debe ser mayor que 0 y como máximo 1.",
      "snr-range": "La SNR queda fuera del rango aceptado."
    }
  }
};

function fieldsFor(id, locale) {
  const L = {
    en: {
      anchor: "Anchor frequency", spacing: "Channel spacing", channel: "Channel index n",
      power: "Channel power at amplifier output", gain: "Amplifier gain", nf: "Noise figure", frequency: "Optical frequency", bandwidth: "Reference bandwidth", spans: "Identical spans",
      payload: "Payload bit rate", code: "Line code",
      mss: "TCP MSS", rtt: "Round-trip time", loss: "Packet loss", link: "Optional link rate for BDP",
      arrival: "Arrival rate", service: "Service rate",
      kind: "Calculation", mode: "Block diagram", blocks: "Availability of each independent block", mtbf: "MTBF", mttr: "MTTR",
      voltage: "Source voltage", current: "Load current", length: "One-way length", area: "Conductor area", temperature: "Conductor temperature", alpha: "Temperature coefficient", conductors: "Conductor paths", rho: "Resistivity at 20 °C",
      conduit: "Pathway inner diameter", d1: "Cable group 1 diameter", n1: "Cable group 1 count", d2: "Cable group 2 diameter", n2: "Cable group 2 count", limit: "Optional fill limit",
      vf: "Velocity factor",
      snr: "Signal to noise", snrUnit: "SNR unit"
    },
    zh: {
      anchor: "锚点频率", spacing: "信道间隔", channel: "信道序号 n",
      power: "放大器输出端信道功率", gain: "放大器增益", nf: "噪声系数", frequency: "光频率", bandwidth: "参考带宽", spans: "相同跨段数",
      payload: "净荷比特率", code: "线路编码",
      mss: "TCP MSS", rtt: "往返时间", loss: "丢包", link: "用于带宽时延积的可选链路速率",
      arrival: "到达率", service: "服务率",
      kind: "计算方式", mode: "可靠性框图", blocks: "每个独立分块的可用度", mtbf: "MTBF", mttr: "MTTR",
      voltage: "源电压", current: "负载电流", length: "单程长度", area: "导体截面积", temperature: "导体温度", alpha: "温度系数", conductors: "导体路径数", rho: "20 °C 电阻率",
      conduit: "通道内径", d1: "电缆组 1 外径", n1: "电缆组 1 根数", d2: "电缆组 2 外径", n2: "电缆组 2 根数", limit: "可选填充率限值",
      vf: "速度系数",
      snr: "信噪比", snrUnit: "信噪比单位"
    },
    es: {
      anchor: "Frecuencia de ancla", spacing: "Separación de canal", channel: "Índice de canal n",
      power: "Potencia de canal a la salida del amplificador", gain: "Ganancia del amplificador", nf: "Figura de ruido", frequency: "Frecuencia óptica", bandwidth: "Ancho de referencia", spans: "Vanos iguales",
      payload: "Tasa útil", code: "Código de línea",
      mss: "MSS de TCP", rtt: "Tiempo de ida y vuelta", loss: "Pérdida de paquetes", link: "Tasa de enlace opcional para el BDP",
      arrival: "Tasa de llegada", service: "Tasa de servicio",
      kind: "Cálculo", mode: "Diagrama de bloques", blocks: "Disponibilidad de cada bloque independiente", mtbf: "MTBF", mttr: "MTTR",
      voltage: "Tensión de origen", current: "Corriente de carga", length: "Longitud de ida", area: "Sección del conductor", temperature: "Temperatura del conductor", alpha: "Coeficiente de temperatura", conductors: "Caminos de conductor", rho: "Resistividad a 20 °C",
      conduit: "Diámetro interior de la canalización", d1: "Diámetro del grupo 1", n1: "Cantidad del grupo 1", d2: "Diámetro del grupo 2", n2: "Cantidad del grupo 2", limit: "Límite de llenado opcional",
      vf: "Factor de velocidad",
      snr: "Relación señal a ruido", snrUnit: "Unidad de SNR"
    }
  }[locale];
  const num = (id, label, value, example, unitId, units, selected) => ({ id, label, value, example, unitId, units, selected, kind: "number" });
  const sel = (id, label, options, value, example) => ({ id, label, kind: "select", options, value, example });
  if (id === "itu-dwdm-grid-calculator") return [
    num("anchor", L.anchor, "193.1", "193.1", "anchorUnit", ["THz", "GHz"], "THz"),
    num("spacing", L.spacing, "100", "50", "spacingUnit", ["GHz", "THz", "MHz"], "GHz"),
    num("channel", L.channel, "0", "4", null, null, null)
  ];
  if (id === "edfa-ase-osnr-estimator") return [
    num("powerDbm", L.power, "0", "3", null, null, null),
    num("gainDb", L.gain, "20", "22", null, null, null),
    num("noiseFigureDb", L.nf, "5", "6", null, null, null),
    num("frequency", L.frequency, "193.1", "193.1", "frequencyUnit", ["THz", "GHz"], "THz"),
    num("bandwidth", L.bandwidth, "12.5", "12.5", "bandwidthUnit", ["GHz", "MHz", "Hz"], "GHz"),
    num("spans", L.spans, "1", "4", null, null, null)
  ];
  if (id === "ethernet-line-coding-calculator") return [
    num("payload", L.payload, "10", "100", "payloadUnit", ["Gbps", "Mbps", "Tbps"], "Gbps"),
    sel("code", L.code, [["8b10b", "8b/10b"], ["64b66b", "64b/66b"], ["64b66b-rs528", "64b/66b + RS(528,514)"], ["64b66b-rs544", "64b/66b + RS(544,514)"]], "64b66b", "64b66b-rs544")
  ];
  if (id === "tcp-mathis-throughput-estimator") return [
    num("mss", L.mss, "1460", "1460", null, null, null),
    num("rtt", L.rtt, "40", "20", "rttUnit", ["ms", "us", "s"], "ms"),
    num("loss", L.loss, "0.01", "0.0001", "lossUnit", ["percent", "probability"], "percent"),
    num("link", L.link, "1000", "10000", "linkUnit", ["Mbps", "Gbps", "Kbps"], "Mbps")
  ];
  if (id === "mm1-queue-delay-calculator") return [
    num("arrival", L.arrival, "800", "4000", "arrivalUnit", ["per_s", "per_min"], "per_s"),
    num("service", L.service, "1000", "5000", "serviceUnit", ["per_s", "per_min"], "per_s")
  ];
  if (id === "path-availability-calculator") return [
    sel("kind", L.kind, [["mtbf", "MTBF / MTTR"], ["blocks", "Series or parallel blocks"]], "mtbf", "blocks"),
    sel("mode", L.mode, [["parallel", locale === "zh" ? "并联" : locale === "es" ? "Paralelo" : "Parallel"], ["series", locale === "zh" ? "串联" : locale === "es" ? "Serie" : "Series"]], "parallel", "parallel"),
    num("blocks", L.blocks, "0.999, 0.999", "0.999, 0.999", null, null, null),
    num("mtbfHours", L.mtbf, "8760", "43800", null, null, null),
    num("mttrHours", L.mttr, "4", "2", null, null, null)
  ];
  if (id === "dc-feeder-voltage-drop-calculator") return [
    num("voltage", L.voltage, "48", "48", null, null, null),
    num("current", L.current, "100", "1", null, null, null),
    num("length", L.length, "50", "58", "lengthUnit", ["m", "ft"], "m"),
    num("area", L.area, "95", "1", "areaUnit", ["mm2", "cm2"], "mm2"),
    num("temperature", L.temperature, "20", "20", null, null, null),
    num("alpha", L.alpha, "0.00393", "0", null, null, null),
    num("conductors", L.conductors, "2", "1", null, null, null),
    num("rho20", L.rho, String(1 / 58), String(1 / 58), null, null, null)
  ];
  if (id === "pathway-fill-calculator") return [
    num("conduit", L.conduit, "100", "103.2", "conduitUnit", ["mm", "inch"], "mm"),
    num("d1", L.d1, "20", "28.6", "d1Unit", ["mm", "inch"], "mm"),
    num("n1", L.n1, "3", "3", null, null, null),
    num("d2", L.d2, "0", "0", "d2Unit", ["mm", "inch"], "mm"),
    num("n2", L.n2, "0", "0", null, null, null),
    num("limitPercent", L.limit, "40", "30", null, null, null)
  ];
  if (id === "copper-propagation-delay-calculator") return [
    num("length", L.length, "100", "50", "lengthUnit", ["m", "ft"], "m"),
    num("velocityFactor", L.vf, "0.65", "0.65", null, null, null)
  ];
  if (id === "shannon-capacity-calculator") return [
    num("bandwidth", L.bandwidth, "20", "20", "bandwidthUnit", ["MHz", "Hz", "kHz", "GHz"], "MHz"),
    num("snr", L.snr, "20", "100", null, null, null),
    sel("snrUnit", L.snrUnit, [["dB", "dB"], ["linear", locale === "zh" ? "线性" : locale === "es" ? "Lineal" : "Linear"]], "dB", "linear")
  ];
  throw new Error(id);
}

function outputsFor(id, locale) {
  const T = {
    en: {
      frequencyTHz: ["Optical frequency", "THz"], wavelengthNm: ["Vacuum wavelength", "nm"], frequencyGHz: ["Same frequency in gigahertz", "GHz"],
      osnrDb: ["OSNR", "dB"], aseDbm: ["Total ASE in the reference band", "dBm"], signalMw: ["Channel power", "mW"], aseMw: ["Total ASE", "mW"],
      lineGbps: ["Line bit rate", "Gbps"], overheadPercent: ["Line-code overhead", "%"], efficiencyPercent: ["Payload share of the line rate", "%"], expansion: ["Expansion ratio", ""],
      throughputMbps: ["Mathis throughput ceiling", "Mbps"], throughputBps: ["Mathis throughput ceiling", "bit/s"], bdpBytes: ["Bandwidth-delay product", "B"], bdpPackets: ["BDP in MSS packets", "packets"],
      utilization: ["Utilization ρ", ""], sojournMs: ["Mean sojourn time", "ms"], waitMs: ["Mean waiting time", "ms"], systemCount: ["Mean number in system", ""], queueCount: ["Mean number in queue", ""],
      availability: ["Availability", ""], unavailability: ["Unavailability", ""], downMinutesPerYear: ["Expected downtime in 365 days", "min"],
      resistanceOhm: ["Feeder resistance", "Ω"], dropV: ["Voltage drop", "V"], dropPercent: ["Drop relative to source", "%"], endVoltage: ["Voltage at the load", "V"],
      fillPercent: ["Geometric fill", "%"], cableAreaFactor: ["Sum of diameter squared", "mm²"], conduitDiameterMm: ["Pathway inner diameter", "mm"], marginPercent: ["Limit minus fill", "percentage points"],
      delayNs: ["One-way delay", "ns"], delayUs: ["One-way delay", "µs"], nsPerMeter: ["Delay per metre", "ns/m"], velocityMps: ["Propagation velocity", "m/s"],
      capacityMbps: ["AWGN capacity bound", "Mbps"], capacityBps: ["AWGN capacity bound", "bit/s"], snrLinear: ["Linear SNR", ""], spectral: ["Spectral efficiency", "bit/s/Hz"]
    },
    zh: {
      frequencyTHz: ["光频率", "THz"], wavelengthNm: ["真空波长", "nm"], frequencyGHz: ["同一频率的吉赫值", "GHz"],
      osnrDb: ["OSNR", "dB"], aseDbm: ["参考带宽内的总 ASE", "dBm"], signalMw: ["信道功率", "mW"], aseMw: ["总 ASE", "mW"],
      lineGbps: ["线路比特率", "Gbps"], overheadPercent: ["线路编码开销", "%"], efficiencyPercent: ["净荷占线路速率的比例", "%"], expansion: ["放大倍数", ""],
      throughputMbps: ["Mathis 吞吐上限", "Mbps"], throughputBps: ["Mathis 吞吐上限", "bit/s"], bdpBytes: ["带宽时延积", "B"], bdpPackets: ["以 MSS 计的带宽时延积", "个报文"],
      utilization: ["利用率 ρ", ""], sojournMs: ["平均逗留时间", "ms"], waitMs: ["平均等待时间", "ms"], systemCount: ["系统内平均个数", ""], queueCount: ["队列内平均个数", ""],
      availability: ["可用度", ""], unavailability: ["不可用度", ""], downMinutesPerYear: ["365 天的期望停机时间", "min"],
      resistanceOhm: ["馈线电阻", "Ω"], dropV: ["压降", "V"], dropPercent: ["相对源电压的压降", "%"], endVoltage: ["负载端电压", "V"],
      fillPercent: ["几何填充率", "%"], cableAreaFactor: ["外径平方和", "mm²"], conduitDiameterMm: ["通道内径", "mm"], marginPercent: ["限值减填充率", "个百分点"],
      delayNs: ["单向时延", "ns"], delayUs: ["单向时延", "µs"], nsPerMeter: ["每米时延", "ns/m"], velocityMps: ["传播速度", "m/s"],
      capacityMbps: ["AWGN 容量上界", "Mbps"], capacityBps: ["AWGN 容量上界", "bit/s"], snrLinear: ["线性信噪比", ""], spectral: ["频谱效率", "bit/s/Hz"]
    },
    es: {
      frequencyTHz: ["Frecuencia óptica", "THz"], wavelengthNm: ["Longitud de onda en el vacío", "nm"], frequencyGHz: ["La misma frecuencia en gigahercios", "GHz"],
      osnrDb: ["OSNR", "dB"], aseDbm: ["ASE total en la banda de referencia", "dBm"], signalMw: ["Potencia de canal", "mW"], aseMw: ["ASE total", "mW"],
      lineGbps: ["Tasa de línea", "Gbps"], overheadPercent: ["Sobrecarga del código", "%"], efficiencyPercent: ["Parte útil de la tasa de línea", "%"], expansion: ["Relación de expansión", ""],
      throughputMbps: ["Techo de caudal de Mathis", "Mbps"], throughputBps: ["Techo de caudal de Mathis", "bit/s"], bdpBytes: ["Producto ancho de banda-retardo", "B"], bdpPackets: ["BDP en paquetes MSS", "paquetes"],
      utilization: ["Utilización ρ", ""], sojournMs: ["Permanencia media", "ms"], waitMs: ["Espera media", "ms"], systemCount: ["Número medio en el sistema", ""], queueCount: ["Número medio en cola", ""],
      availability: ["Disponibilidad", ""], unavailability: ["Indisponibilidad", ""], downMinutesPerYear: ["Tiempo fuera de servicio esperado en 365 días", "min"],
      resistanceOhm: ["Resistencia del alimentador", "Ω"], dropV: ["Caída de tensión", "V"], dropPercent: ["Caída respecto al origen", "%"], endVoltage: ["Tensión en la carga", "V"],
      fillPercent: ["Llenado geométrico", "%"], cableAreaFactor: ["Suma de diámetros al cuadrado", "mm²"], conduitDiameterMm: ["Diámetro interior", "mm"], marginPercent: ["Límite menos llenado", "puntos porcentuales"],
      delayNs: ["Retardo de ida", "ns"], delayUs: ["Retardo de ida", "µs"], nsPerMeter: ["Retardo por metro", "ns/m"], velocityMps: ["Velocidad de propagación", "m/s"],
      capacityMbps: ["Cota de capacidad AWGN", "Mbps"], capacityBps: ["Cota de capacidad AWGN", "bit/s"], snrLinear: ["SNR lineal", ""], spectral: ["Eficiencia espectral", "bit/s/Hz"]
    }
  }[locale];
  const keys = {
    "itu-dwdm-grid-calculator": ["frequencyTHz", "wavelengthNm", "frequencyGHz"],
    "edfa-ase-osnr-estimator": ["osnrDb", "aseDbm", "signalMw", "aseMw"],
    "ethernet-line-coding-calculator": ["lineGbps", "overheadPercent", "efficiencyPercent", "expansion"],
    "tcp-mathis-throughput-estimator": ["throughputMbps", "throughputBps", "bdpBytes", "bdpPackets"],
    "mm1-queue-delay-calculator": ["utilization", "sojournMs", "waitMs", "systemCount", "queueCount"],
    "path-availability-calculator": ["availability", "unavailability", "downMinutesPerYear"],
    "dc-feeder-voltage-drop-calculator": ["resistanceOhm", "dropV", "dropPercent", "endVoltage"],
    "pathway-fill-calculator": ["fillPercent", "cableAreaFactor", "conduitDiameterMm", "marginPercent"],
    "copper-propagation-delay-calculator": ["delayNs", "delayUs", "nsPerMeter", "velocityMps"],
    "shannon-capacity-calculator": ["capacityMbps", "capacityBps", "snrLinear", "spectral"]
  }[id];
  return keys.map((key) => ({ key, label: T[key][0], unit: T[key][1] }));
}

function prose(id, locale) {
  const blocks = {
    "itu-dwdm-grid-calculator": {
      formula: "f = f_anchor + n × spacing; λ = c / f, with c = 299792458 m/s.",
      about: {
        en: "Use this when a DWDM plan names channels as an integer offset from 193.1 THz. The wavelength is the vacuum wavelength of that frequency. It does not include the effective group index of fiber, a transceiver's wavelength tolerance, or a vendor channel map.",
        zh: "波分方案用相对 193.1 THz 的整数序号称呼信道时，用本页换算。波长是该频率的真空波长，不含光纤群折射率、光模块波长容差或厂商信道表。",
        es: "Úsalo cuando un plan DWDM nombre los canales como un entero respecto a 193,1 THz. La longitud de onda es la del vacío para esa frecuencia. No incluye el índice de grupo de la fibra, la tolerancia del transceptor ni un mapa de canal de un fabricante."
      },
      method: {
        en: "ITU-T G.694.1 anchors the DWDM frequency grid at 193.1 THz. A channel index n and a spacing in hertz give f = 193.1 THz + n × spacing. The vacuum wavelength follows λ = c / f. The speed of light used here is the exact SI value 299792458 m/s, so λ in nanometres is 299792.458 / f in terahertz. Neighboring rows use the same spacing. Changing the anchor is allowed for a what-if study; the published grid anchor remains 193.1 THz.",
        zh: "ITU-T G.694.1 把 DWDM 频率栅格锚在 193.1 THz。信道序号 n 和以赫兹计的间隔给出 f = 193.1 THz + n × 间隔。真空波长为 λ = c / f。这里的光速是国际单位制的精确值 299792458 m/s，因此以纳米计的波长等于 299792.458 除以以太赫兹计的频率。相邻行使用同一间隔。锚点可以改做假设分析，已发布栅格的锚点仍是 193.1 THz。",
        es: "La UIT-T G.694.1 ancla la rejilla DWDM en 193,1 THz. Un índice n y una separación en hercios dan f = 193,1 THz + n × separación. La longitud de onda en el vacío es λ = c / f. La velocidad de la luz es el valor exacto del SI, 299792458 m/s, así que λ en nanómetros es 299792,458 dividido por f en terahercios. Las filas vecinas usan la misma separación. Puedes cambiar el ancla para un supuesto; el ancla publicada sigue siendo 193,1 THz."
      },
      faq: {
        en: [["Is 1550 nm exactly channel 0?", "No. Channel 0 at 193.1 THz has a vacuum wavelength of 299792.458 / 193.1 nanometres, about 1552.52 nm."], ["Does a negative index go to a longer wavelength?", "Yes. A lower frequency is a longer vacuum wavelength."], ["Can this replace a transceiver datasheet?", "No. It only converts the grid definition you enter."], ["Why is the spacing not fixed at 100 GHz?", "G.694.1 also defines other spacings. The spacing is an input."]],
        zh: [["1550 nm 是不是正好 0 号信道？", "不是。193.1 THz 的 0 号信道真空波长是 299792.458 / 193.1 纳米，大约 1552.52 nm。"], ["负序号是不是更长的波长？", "是。更低的频率对应更长的真空波长。"], ["它能代替光模块手册吗？", "不能。它只换算你输入的栅格定义。"], ["间隔为什么不固定成 100 GHz？", "G.694.1 还定义了其他间隔。间隔是输入。"]],
        es: [["¿1550 nm es exactamente el canal 0?", "No. El canal 0 a 193,1 THz tiene una longitud de onda en el vacío de 299792,458 / 193,1 nanómetros, unos 1552,52 nm."], ["¿Un índice negativo alarga la longitud de onda?", "Sí. Una frecuencia menor corresponde a una longitud de onda de vacío mayor."], ["¿Sustituye la hoja del transceptor?", "No. Solo convierte la definición de rejilla que introduces."], ["¿Por qué la separación no está fija en 100 GHz?", "G.694.1 también define otras separaciones. La separación es un dato."]]
      }
    },
    "edfa-ase-osnr-estimator": {
      formula: "P_ASE = N × F × h × f × (G − 1) × B; OSNR = P_channel / P_ASE.",
      about: {
        en: "Use this to budget ASE for identical optical amplifiers that restore the channel to the same output power. The noise factor F is 10^(NF_dB/10) and multiplies h·f·(G−1)·B. It is not a measured OSNR and it leaves out nonlinear interference, filter narrowing and polarization details.",
        zh: "用于相同光放大器把信道恢复到同一输出功率时的 ASE 预算。噪声系数的线性值 F = 10^(NF_dB/10)，并乘以 h·f·(G−1)·B。它不是实测 OSNR，也不包含非线性干扰、滤波收窄和偏振细节。",
        es: "Sirve para presupuestar el ASE de amplificadores ópticos iguales que devuelven el canal a la misma potencia de salida. El factor de ruido F es 10^(NF_dB/10) y multiplica h·f·(G−1)·B. No es una OSNR medida y omite la interferencia no lineal, el estrechamiento del filtro y el detalle de polarización."
      },
      method: {
        en: "Planck's constant is the exact SI value 6.62607015×10^−34 J·s. Linear gain G and linear noise factor F come from the decibel inputs. ASE of one amplifier in bandwidth B is F·h·f·(G−1)·B. N identical spans add those ASE powers. OSNR is channel power divided by that total, reported in decibels. Gain must be above 0 dB because this form uses (G−1). If your noise-figure definition already folds in a high-gain approximation, keep the same definition when you read the result.",
        zh: "普朗克常数采用国际单位制精确值 6.62607015×10^−34 J·s。线性增益 G 和线性噪声系数 F 由分贝输入换算。一个放大器在带宽 B 内的 ASE 为 F·h·f·(G−1)·B。N 个相同跨段把这些 ASE 功率相加。OSNR 是信道功率除以该总和，再以分贝表示。增益必须大于 0 dB，因为这个式子使用 (G−1)。如果你的噪声系数定义已经包含高增益近似，读结果时要沿用同一定义。",
        es: "La constante de Planck es el valor exacto del SI, 6,62607015×10^−34 J·s. La ganancia lineal G y el factor de ruido lineal F salen de los decibelios. El ASE de un amplificador en el ancho B es F·h·f·(G−1)·B. N vanos iguales suman esas potencias de ASE. La OSNR es la potencia de canal dividida por ese total, en decibelios. La ganancia debe ser mayor que 0 dB porque la expresión usa (G−1). Si tu definición de figura de ruido ya incluye la aproximación de alta ganancia, lee el resultado con esa misma definición."
      },
      faq: {
        en: [["Is this the OSNR a meter would show?", "No. A meter includes the real spectrum, filters and noise outside this model."], ["Why reject 0 dB gain?", "G−1 is zero at unity gain, so this ASE expression does not apply."], ["Do spans have to be identical?", "Yes. Different gains or noise figures need a span-by-span sum this page does not do."], ["Which bandwidth should I enter?", "Use the reference bandwidth you want the OSNR quoted in, often 12.5 GHz for a 0.1 nm class reference."]],
        zh: [["这是仪表上的 OSNR 吗？", "不是。仪表包含真实光谱、滤波器和本模型之外的噪声。"], ["为什么不接受 0 dB 增益？", "单位增益时 G−1 为 0，这个 ASE 表达式不适用。"], ["跨段必须相同吗？", "是。增益或噪声系数不同时要逐段相加，本页不做。"], ["带宽填多少？", "填你希望 OSNR 所对应的参考带宽，0.1 nm 这一类参考常用 12.5 GHz。"]],
        es: [["¿Es la OSNR que mostraría un medidor?", "No. Un medidor incluye el espectro real, los filtros y ruido fuera de este modelo."], ["¿Por qué se rechaza una ganancia de 0 dB?", "G−1 es cero con ganancia unidad, así que esta expresión de ASE no aplica."], ["¿Los vanos tienen que ser iguales?", "Sí. Ganancias o figuras de ruido distintas piden una suma vano a vano que esta página no hace."], ["¿Qué ancho introduzco?", "El ancho de referencia en el que quieres expresar la OSNR; 12,5 GHz es habitual para una referencia de clase 0,1 nm."]]
      }
    },
    "ethernet-line-coding-calculator": {
      formula: "Line rate = payload × (code bits / payload bits). RS-FEC multiplies an extra codeword ratio.",
      about: {
        en: "Use this to turn a MAC payload rate into the higher line rate implied by a published Ethernet line code. It does not choose a PMD, a lane count, or a reach.",
        zh: "把 MAC 净荷速率换成已发布以太网线路编码所对应的更高线路速率。它不选择 PMD、lane 数或距离。",
        es: "Convierte una tasa útil MAC en la tasa de línea mayor que implica un código Ethernet publicado. No elige un PMD, un número de carriles ni un alcance."
      },
      method: {
        en: "8b/10b expands 8 payload bits into 10 line bits, so the ratio is 10/8. 64b/66b uses 66/64. RS(528,514) adds 528/514 on top of 64b/66b. RS(544,514) adds 544/514 on top of 64b/66b. A 10 Gbps payload with 64b/66b is exactly 10.3125 Gbps. The calculator applies only that ratio. Auto-negotiation, alignment markers and a particular clause's lane mapping are outside the result.",
        zh: "8b/10b 把 8 个净荷比特扩成 10 个线路比特，比例是 10/8。64b/66b 使用 66/64。RS(528,514) 在 64b/66b 之外再乘 528/514。RS(544,514) 再乘 544/514。10 Gbps 净荷配合 64b/66b 正好是 10.3125 Gbps。计算器只应用这个比例。自协商、对齐标记和某一条款的 lane 映射不在结果里。",
        es: "8b/10b convierte 8 bits útiles en 10 bits de línea, así que la relación es 10/8. 64b/66b usa 66/64. RS(528,514) añade 528/514 sobre 64b/66b. RS(544,514) añade 544/514 sobre 64b/66b. Una carga de 10 Gbps con 64b/66b es exactamente 10,3125 Gbps. La calculadora aplica solo esa relación. La autonegociación, los marcadores de alineación y el reparto de carriles de una cláusula quedan fuera del resultado."
      },
      faq: {
        en: [["Is 10.3125 Gbps a measured rate?", "It is the exact 66/64 expansion of 10 Gbps."], ["Does RS-FEC replace 64b/66b?", "No. The presets multiply both ratios."], ["Can I paste this into a switch as a speed?", "No. It is the line-rate arithmetic of the selected code."], ["Where do the ratios come from?", "They are the published 8b/10b, 64b/66b, RS(528,514) and RS(544,514) sizes used by IEEE 802.3."]],
        zh: [["10.3125 Gbps 是实测速率吗？", "它是 10 Gbps 按 66/64 放大后的精确值。"], ["RS-FEC 会取代 64b/66b 吗？", "不会。预设把两个比例相乘。"], ["可以把结果当作交换机速率填进去吗？", "不能。它是所选编码的线路速率运算。"], ["比例从哪里来？", "来自 IEEE 802.3 使用的 8b/10b、64b/66b、RS(528,514) 和 RS(544,514) 已发布尺寸。"]],
        es: [["¿10,3125 Gbps es una tasa medida?", "Es la expansión exacta 66/64 de 10 Gbps."], ["¿El RS-FEC sustituye a 64b/66b?", "No. Los preajustes multiplican ambas relaciones."], ["¿Puedo pegar esto como velocidad del conmutador?", "No. Es la aritmética de tasa de línea del código elegido."], ["¿De dónde salen las relaciones?", "De los tamaños publicados 8b/10b, 64b/66b, RS(528,514) y RS(544,514) usados por IEEE 802.3."]]
      }
    },
    "tcp-mathis-throughput-estimator": {
      formula: "Rate < (MSS × 8) / (RTT × √p). BDP bytes = link bit rate × RTT / 8.",
      about: {
        en: "The Mathis ceiling is an upper-bound model for loss-based TCP congestion avoidance, not a throughput test. The optional bandwidth-delay product shows how many bytes fill the pipe at the link rate you enter.",
        zh: "Mathis 上限是丢包型 TCP 拥塞避免的上界模型，不是吞吐实测。可选的带宽时延积表示按你输入的链路速率，管道里能容纳多少字节。",
        es: "El techo de Mathis es un modelo de cota para la evitación de congestión TCP basada en pérdidas, no una prueba de caudal. El producto ancho de banda-retardo opcional muestra cuántos bytes llenan el camino a la tasa que introduces."
      },
      method: {
        en: "Mathis, Semke, Mahdavi and Ott described the macroscopic rate of TCP congestion avoidance as about one MSS per RTT times 1/√p, where p is the loss probability. This page uses Rate = (MSS bytes × 8) / (RTT seconds × √p) and labels it a ceiling. A worked case is MSS 1460 bytes, RTT 40 ms and p = 0.0001: √p = 0.01 and the rate is 29.2 Mbps. BDP follows RFC 6349's bandwidth-delay product once you supply a link rate. Delayed ACK, cubic, pacing and application limits are not in the formula.",
        zh: "Mathis、Semke、Mahdavi 和 Ott 把 TCP 拥塞避免的宏观速率写成大约每个 RTT 一个 MSS，再乘 1/√p，p 是丢包概率。本页使用速率 = (MSS 字节 × 8) / (RTT 秒 × √p)，并把它标成上限。一组可手算的例子是 MSS 1460 字节、RTT 40 ms、p = 0.0001：√p = 0.01，速率为 29.2 Mbps。填了链路速率后，带宽时延积按 RFC 6349 的定义计算。延迟 ACK、CUBIC、pacing 和应用层限制不在公式里。",
        es: "Mathis, Semke, Mahdavi y Ott describieron la tasa macroscópica de la evitación de congestión TCP como aproximadamente un MSS por RTT multiplicado por 1/√p, donde p es la probabilidad de pérdida. Esta página usa Tasa = (bytes MSS × 8) / (RTT en segundos × √p) y la marca como techo. Un caso manual es MSS 1460 bytes, RTT 40 ms y p = 0,0001: √p = 0,01 y la tasa es 29,2 Mbps. El BDP sigue el producto ancho de banda-retardo del RFC 6349 cuando indicas una tasa de enlace. El ACK retardado, CUBIC, el pacing y los límites de aplicación no están en la fórmula."
      },
      faq: {
        en: [["Does a lower loss always raise the result?", "In this model, yes, because the ceiling divides by √p."], ["Is the BDP required?", "No. Leave the link rate blank and the BDP stays blank."], ["Why is 1 percent loss entered as 0.01 with the percent unit?", "The percent unit divides by 100 before the square root. Probability 0.0001 is the same as 0.01 percent."], ["Can this size a WAN circuit alone?", "No. It is one loss-based bound."]],
        zh: [["丢包更低，结果就一定更高吗？", "在这个模型里是的，因为上限要除以 √p。"], ["必须算带宽时延积吗？", "不必。链路速率留空时，带宽时延积保持空白。"], ["为什么百分数 0.01 和概率 0.0001 不同？", "百分数单位会先除以 100 再开方。概率 0.0001 等于 0.01%。"], ["能单靠它确定广域电路吗？", "不能。它只是一个基于丢包的上界。"]],
        es: [["¿Menos pérdida siempre sube el resultado?", "En este modelo, sí, porque el techo divide por √p."], ["¿El BDP es obligatorio?", "No. Si dejas la tasa de enlace vacía, el BDP queda en blanco."], ["¿Por qué 0,01 por ciento no es la probabilidad 0,01?", "La unidad de porcentaje divide entre 100 antes de la raíz. La probabilidad 0,0001 equivale a 0,01 por ciento."], ["¿Basta para dimensionar un circuito WAN?", "No. Es una sola cota basada en pérdidas."]]
      }
    },
    "mm1-queue-delay-calculator": {
      formula: "ρ = λ / μ; E[T] = 1 / (μ − λ); E[W] = ρ / (μ (1 − ρ)).",
      about: {
        en: "Use this for a single server with Poisson arrivals and exponential service. It is not a switch buffer model and it does not include serialization of a particular frame.",
        zh: "用于泊松到达、指数服务的单服务员队列。它不是交换机缓存模型，也不包含某个具体帧的串行化时间。",
        es: "Sirve para un servidor con llegadas de Poisson y servicio exponencial. No es un modelo de búfer de conmutador ni incluye la serialización de una trama concreta."
      },
      method: {
        en: "For an M/M/1 queue the utilization is ρ = λ/μ and the queue is stable only when μ > λ. Mean sojourn time is 1/(μ−λ). Mean waiting time in the queue is ρ/(μ(1−ρ)). Mean system count is ρ/(1−ρ) and mean queue count is ρ²/(1−ρ). A worked case is λ = 800 per second and μ = 1000 per second: ρ = 0.8, sojourn = 5 ms, wait = 4 ms. Per-minute inputs are divided by 60 before those formulas.",
        zh: "M/M/1 队列的利用率是 ρ = λ/μ，只有 μ > λ 时队列稳定。平均逗留时间是 1/(μ−λ)。队列中的平均等待时间是 ρ/(μ(1−ρ))。系统内平均个数是 ρ/(1−ρ)，队列内平均个数是 ρ²/(1−ρ)。一组可手算的例子是每秒到达 800、每秒服务 1000：ρ = 0.8，逗留 5 ms，等待 4 ms。以每分钟输入的速率会先除以 60。",
        es: "En una cola M/M/1 la utilización es ρ = λ/μ y la cola solo es estable si μ > λ. La permanencia media es 1/(μ−λ). La espera media en cola es ρ/(μ(1−ρ)). El número medio en el sistema es ρ/(1−ρ) y el número medio en cola es ρ²/(1−ρ). Un caso manual es λ = 800 por segundo y μ = 1000 por segundo: ρ = 0,8, permanencia = 5 ms, espera = 4 ms. Las entradas por minuto se dividen entre 60 antes de esas fórmulas."
      },
      faq: {
        en: [["What if arrival equals service?", "The model is unstable. The page rejects it."], ["Is the 5 ms result a measurement?", "No. It is 1/200 second for the worked rates."], ["Do per-minute rates change the formula?", "Only the unit conversion. The queue formulas use per-second rates."], ["Can I model many servers?", "No. This is one server."]],
        zh: [["到达率等于服务率会怎样？", "模型不稳定。页面会拒绝。"], ["5 ms 是实测吗？", "不是。它是这组速率下的 1/200 秒。"], ["每分钟速率会改变公式吗？", "只改变单位换算。排队公式使用每秒速率。"], ["能算多个服务员吗？", "不能。这里只有一个服务员。"]],
        es: [["¿Qué pasa si la llegada iguala al servicio?", "El modelo es inestable. La página lo rechaza."], ["¿Los 5 ms son una medición?", "No. Son 1/200 segundo para esas tasas."], ["¿Las tasas por minuto cambian la fórmula?", "Solo la conversión de unidades. Las fórmulas usan tasas por segundo."], ["¿Puedo modelar varios servidores?", "No. Este es un solo servidor."]]
      }
    },
    "path-availability-calculator": {
      formula: "Series A = ∏ A_i. Parallel A = 1 − ∏(1 − A_i). A = MTBF / (MTBF + MTTR).",
      about: {
        en: "Use this for independent blocks. It does not model shared power, common software, or a maintenance calendar. Annual downtime uses a 365-day year.",
        zh: "用于相互独立的分块。它不表示共享电源、共同软件或检修日历。年停机时间按 365 天计算。",
        es: "Sirve para bloques independientes. No modela alimentación compartida, software común ni un calendario de mantenimiento. El tiempo anual fuera de servicio usa un año de 365 días."
      },
      method: {
        en: "If each block fails independently, series availability is the product of the availabilities. Parallel availability is one minus the product of the unavailabilities. Two paths at 0.999 in parallel give 1 − 0.001×0.001 = 0.999999. MTBF and MTTR in the same time unit give A = MTBF / (MTBF + MTTR). Expected down minutes in 365 days are (1−A)×525600. Enter availabilities as fractions from just above 0 through 1, one block per comma.",
        zh: "如果各分块独立失效，串联可用度是各可用度的乘积。并联可用度是 1 减去各不可用度的乘积。两条 0.999 的并联路径得到 1 − 0.001×0.001 = 0.999999。同一时间单位下的 MTBF 和 MTTR 给出 A = MTBF / (MTBF + MTTR)。365 天的期望停机分钟数是 (1−A)×525600。可用度用大于 0 到 1 的小数，逗号分隔。",
        es: "Si cada bloque falla de forma independiente, la disponibilidad en serie es el producto de las disponibilidades. La disponibilidad en paralelo es uno menos el producto de las indisponibilidades. Dos trayectos de 0,999 en paralelo dan 1 − 0,001×0,001 = 0,999999. MTBF y MTTR en la misma unidad dan A = MTBF / (MTBF + MTTR). Los minutos fuera de servicio esperados en 365 días son (1−A)×525600. Escribe disponibilidades como fracciones desde justo por encima de 0 hasta 1, separadas por comas."
      },
      faq: {
        en: [["Does parallel always beat series?", "For the same independent blocks, the parallel combination is higher."], ["Can availability be exactly 1?", "Yes. Downtime is then zero in this model."], ["Why reject zero?", "A zero block needs a different failure model than a positive availability."], ["Is 0.999999 a measured SLA?", "No. It is the arithmetic of two 0.999 blocks."]],
        zh: [["并联是否总是高于串联？", "对同一组独立分块，并联合成更高。"], ["可用度可以正好是 1 吗？", "可以。此时本模型的停机时间为 0。"], ["为什么拒绝 0？", "零可用度需要另一套失效模型。"], ["0.999999 是实测 SLA 吗？", "不是。它是两个 0.999 分块的运算结果。"]],
        es: [["¿El paralelo siempre supera a la serie?", "Con los mismos bloques independientes, la combinación en paralelo es mayor."], ["¿La disponibilidad puede ser exactamente 1?", "Sí. El tiempo fuera de servicio es entonces cero en este modelo."], ["¿Por qué se rechaza el cero?", "Un bloque en cero pide otro modelo de fallo."], ["¿0,999999 es un SLA medido?", "No. Es la aritmética de dos bloques de 0,999."]]
      }
    },
    "dc-feeder-voltage-drop-calculator": {
      formula: "R = ρ_20 × [1 + α(T − 20)] × N × L / A; V_drop = I × R.",
      about: {
        en: "Use this for a DC feeder's ohmic drop. The default resistivity is 1/58 Ω·mm²/m, the IEC 60028 annealed-copper standard at 20 °C. It ignores contacts, bus joints and fault current.",
        zh: "用于直流馈线的欧姆压降。默认电阻率是 1/58 Ω·mm²/m，即 IEC 60028 在 20 °C 的退火铜标准。它忽略接点、汇流排接头和故障电流。",
        es: "Sirve para la caída óhmica de un alimentador de CC. La resistividad predeterminada es 1/58 Ω·mm²/m, el patrón de cobre recocido de IEC 60028 a 20 °C. Ignora contactos, uniones de barra y corriente de defecto."
      },
      method: {
        en: "Resistance is resistivity times conductor paths times one-way length, divided by area. Two conductor paths cover the go and return. Resistivity at temperature T is ρ_20 × [1 + α(T−20)]. The default α, 0.00393 per °C, is an editable assumption. A check case is 1 A, 58 m, 1 mm², one path, 20 °C and ρ = 1/58: resistance is 1 Ω and drop is 1 V. PoE pair resistance is a different tool.",
        zh: "电阻等于电阻率乘以导体路径数和单程长度，再除以截面积。两条路径表示去程和回程。温度 T 下的电阻率是 ρ_20 × [1 + α(T−20)]。默认 α 为每 °C 0.00393，可以改。一组核对例子是 1 A、58 m、1 mm²、单路径、20 °C、ρ = 1/58：电阻为 1 Ω，压降为 1 V。PoE 线对电阻是另一个工具。",
        es: "La resistencia es la resistividad por los caminos de conductor y por la longitud de ida, dividida por la sección. Dos caminos cubren ida y vuelta. La resistividad a la temperatura T es ρ_20 × [1 + α(T−20)]. El alfa predeterminado, 0,00393 por °C, es un supuesto editable. Un caso de comprobación es 1 A, 58 m, 1 mm², un camino, 20 °C y ρ = 1/58: la resistencia es 1 Ω y la caída es 1 V. La resistencia de pares PoE es otra herramienta."
      },
      faq: {
        en: [["Is 1/58 exact?", "IEC 60028 states the standard resistance of copper as 1/58 Ω·mm²/m at 20 °C. The page uses that fraction."], ["Does zero current fail?", "No. The drop is zero."], ["Why can the end voltage be negative?", "The arithmetic continues when the drop exceeds the source. Treat that as an unsuitable feeder, not as a measured polarity."], ["Is the alpha a cable rating?", "No. Replace it with the coefficient you intend to use."]],
        zh: [["1/58 是精确值吗？", "IEC 60028 把铜的标准电阻定为 20 °C 时 1/58 Ω·mm²/m。本页使用这个分数。"], ["电流为 0 会失败吗？", "不会。压降为 0。"], ["末端电压为什么可能是负的？", "压降超过源电压时运算仍会继续。把它看成馈线不适用，而不是测到的极性。"], ["温度系数是电缆额定值吗？", "不是。请换成你打算使用的系数。"]],
        es: [["¿1/58 es exacto?", "IEC 60028 fija la resistencia patrón del cobre en 1/58 Ω·mm²/m a 20 °C. La página usa esa fracción."], ["¿La corriente cero falla?", "No. La caída es cero."], ["¿Por qué la tensión final puede ser negativa?", "La aritmética sigue cuando la caída supera el origen. Léelo como un alimentador inadecuado, no como una polaridad medida."], ["¿El alfa es una característica del cable?", "No. Sustitúyelo por el coeficiente que quieras usar."]]
      }
    },
    "pathway-fill-calculator": {
      formula: "Fill = Σ(count × diameter²) / pathway_diameter².",
      about: {
        en: "This is the ratio of circle areas for the diameters you enter. It does not apply an electrical-code fill table, and a blank limit only reports the percentage.",
        zh: "这是你输入的直径对应的圆面积之比。它不套用电气规范填充率表；限值留空时只报告百分比。",
        es: "Es la relación de áreas circulares para los diámetros que introduces. No aplica una tabla de llenado de un código eléctrico, y un límite vacío solo informa el porcentaje."
      },
      method: {
        en: "The area of a circle is proportional to diameter squared, so the π/4 terms cancel. Fill percent is 100 × Σ(n_i d_i²) / D². Three 20 mm cables in a 100 mm pathway are 3 × 400 / 10000 = 12%. A second group left at zero count is ignored only when its count is zero; a positive count with a diameter is included. Set a limit, such as 40, only as your own planning assumption. The page does not copy code tables.",
        zh: "圆面积与直径平方成正比，所以 π/4 会消去。填充率百分数是 100 × Σ(n_i d_i²) / D²。三根 20 mm 电缆放在 100 mm 通道里是 3 × 400 / 10000 = 12%。第二组根数为 0 时不计入；根数大于 0 且有直径时计入。把限值设成例如 40，只表示你自己的规划假设。本页不抄录规范表格。",
        es: "El área de un círculo es proporcional al diámetro al cuadrado, así que los términos π/4 se cancelan. El porcentaje de llenado es 100 × Σ(n_i d_i²) / D². Tres cables de 20 mm en una canalización de 100 mm son 3 × 400 / 10000 = 12%. Un segundo grupo con cantidad cero no entra; una cantidad positiva con diámetro sí entra. Pon un límite, por ejemplo 40, solo como tu propio supuesto de planificación. La página no copia tablas de códigos."
      },
      faq: {
        en: [["Does 12% mean the code allows it?", "No. It means the circles occupy 12% of the pathway circle."], ["What if a cable is larger than the pathway?", "The fill can exceed 100%. That is a geometric comparison, not an installation method."], ["Why offer inches?", "The inch input is converted by 25.4 mm before the same ratio."], ["Can I leave the limit empty?", "Yes. The margin then stays blank."]],
        zh: [["12% 是不是表示规范允许？", "不是。它只表示这些圆占通道圆面积的 12%。"], ["电缆比通道还粗会怎样？", "填充率可以超过 100%。这是几何比较，不是敷设方法。"], ["为什么有英寸？", "英寸会先按 25.4 mm 换算，再用同一个比例。"], ["限值可以空着吗？", "可以。此时余量保持空白。"]],
        es: [["¿12 % significa que el código lo permite?", "No. Significa que los círculos ocupan el 12 % del círculo de la canalización."], ["¿Qué pasa si el cable es mayor que la canalización?", "El llenado puede superar el 100 %. Es una comparación geométrica, no un método de instalación."], ["¿Por qué hay pulgadas?", "La pulgada se convierte con 25,4 mm antes de la misma relación."], ["¿Puedo dejar el límite vacío?", "Sí. El margen queda en blanco."]]
      }
    },
    "copper-propagation-delay-calculator": {
      formula: "Delay = length / (velocity factor × c), with c = 299792458 m/s.",
      about: {
        en: "Enter the velocity factor from the cable description you trust. This page does not keep a catalog of cable brands. Fiber delay uses a group index and is a different tool.",
        zh: "速度系数请填写你所依据的电缆说明。本页不收录电缆品牌目录。光纤时延使用群折射率，是另一个工具。",
        es: "Introduce el factor de velocidad de la descripción de cable en la que confíes. Esta página no guarda un catálogo de marcas. El retardo de fibra usa un índice de grupo y es otra herramienta."
      },
      method: {
        en: "Propagation velocity is the velocity factor times the exact SI speed of light, 299792458 m/s. One-way delay is length divided by that velocity. Feet are converted with the international foot, 0.3048 m. A check case is 100 m at velocity factor 1: delay = 100 / 299792458 seconds. At 0.65 the velocity is 0.65 times the speed of light and the delay is longer by 1/0.65. The factor is an input, not a category rating.",
        zh: "传播速度等于速度系数乘以国际单位制精确光速 299792458 m/s。单向时延是长度除以该速度。英尺按国际英尺 0.3048 m 换算。一组核对例子是速度系数为 1 的 100 m：时延 = 100 / 299792458 秒。系数为 0.65 时，速度是光速的 0.65 倍，时延按 1/0.65 变长。系数是输入，不是类别额定值。",
        es: "La velocidad de propagación es el factor de velocidad por la velocidad exacta de la luz en el SI, 299792458 m/s. El retardo de ida es la longitud dividida por esa velocidad. Los pies se convierten con el pie internacional, 0,3048 m. Un caso de comprobación es 100 m con factor 1: retardo = 100 / 299792458 segundos. Con 0,65 la velocidad es 0,65 veces la de la luz y el retardo es mayor en 1/0,65. El factor es un dato, no una categoría."
      },
      faq: {
        en: [["Does velocity factor 1 mean a real cable?", "It is only the vacuum speed. Real copper is slower, so the factor is below 1."], ["Is the foot exact?", "The page uses 0.3048 metre per international foot."], ["Why not use 5 ns per metre?", "That would hide the velocity factor. The page keeps c and the factor separate."], ["Can this time a fiber route?", "No. Use the fiber latency tool for optical group delay."]],
        zh: [["速度系数 1 表示真实电缆吗？", "它只是真空光速。真实铜缆更慢，所以系数小于 1。"], ["英尺是精确换算吗？", "本页使用国际英尺 0.3048 米。"], ["为什么不用每米 5 ns？", "那会把速度系数藏起来。本页把光速和系数分开。"], ["能用它计算光纤路由吗？", "不能。光纤群时延请用光纤时延工具。"]],
        es: [["¿El factor 1 representa un cable real?", "Es solo la velocidad en el vacío. El cobre real es más lento, así que el factor es menor que 1."], ["¿El pie es exacto?", "La página usa 0,3048 metros por pie internacional."], ["¿Por qué no usar 5 ns por metro?", "Eso ocultaría el factor de velocidad. La página separa c y el factor."], ["¿Sirve para temporizar una ruta de fibra?", "No. Usa la herramienta de latencia de fibra para el retardo de grupo óptico."]]
      }
    },
    "shannon-capacity-calculator": {
      formula: "C = B × log2(1 + S/N).",
      about: {
        en: "This is the AWGN capacity bound. A modem, a Wi-Fi MCS table, or an optical transponder can sit well below it. SNR may be entered in decibels or as a linear power ratio.",
        zh: "这是 AWGN 容量上界。调制解调器、Wi-Fi MCS 表或光转发器都可能远低于它。信噪比可以按分贝或线性功率比输入。",
        es: "Es la cota de capacidad AWGN. Un módem, una tabla MCS de Wi-Fi o un transpondedor óptico pueden quedar muy por debajo. La SNR puede entrar en decibelios o como relación lineal de potencias."
      },
      method: {
        en: "Shannon's AWGN formula is C = B log2(1 + S/N), where B is bandwidth in hertz and S/N is a linear power ratio. A decibel SNR of x becomes 10^(x/10). A worked case is B = 20 MHz and SNR = 20 dB, so S/N = 100 and C = 20000000 × log2(101). The result is an upper bound for additive white Gaussian noise with the bandwidth and SNR you enter. It is not a link budget and it does not include fading, interference structure, or protocol overhead.",
        zh: "香农 AWGN 公式是 C = B log2(1 + S/N)，B 是以赫兹计的带宽，S/N 是线性功率比。分贝信噪比 x 换成 10^(x/10)。一组可核算的例子是 B = 20 MHz、SNR = 20 dB，因此 S/N = 100，C = 20000000 × log2(101)。结果是你所输入带宽和信噪比下加性白高斯噪声的上界。它不是链路预算，也不包含衰落、干扰结构或协议开销。",
        es: "La fórmula AWGN de Shannon es C = B log2(1 + S/N), donde B es el ancho en hercios y S/N es una relación lineal de potencias. Una SNR de x decibelios pasa a 10^(x/10). Un caso revisable es B = 20 MHz y SNR = 20 dB, así que S/N = 100 y C = 20000000 × log2(101). El resultado es una cota superior para ruido gaussiano blanco aditivo con el ancho y la SNR que introduces. No es un balance de enlace y no incluye desvanecimiento, la estructura de la interferencia ni la sobrecarga de protocolo."
      },
      faq: {
        en: [["Is log2(101) part of the 20 dB example?", "Yes. 20 dB is a linear ratio of 100, and the argument of the logarithm is 1+100."], ["Can SNR be 0 dB?", "Yes. The linear ratio is 1 and the capacity is B × 1 bit/s/Hz."], ["Does a wider band always help?", "Only in this formula, and only if the SNR you entered still applies to that wider band."], ["Is this a Wi-Fi throughput?", "No. It is the AWGN bound."]],
        zh: [["20 dB 的例子里有 log2(101) 吗？", "有。20 dB 的线性比是 100，对数的自变量是 1+100。"], ["信噪比可以是 0 dB 吗？", "可以。线性比是 1，容量是每赫兹每秒 B 比特。"], ["带宽更大是否一定更好？", "只在这个公式里、并且你输入的信噪比仍然适用于那个更宽的带宽时才如此。"], ["这是 Wi-Fi 吞吐吗？", "不是。它是 AWGN 上界。"]],
        es: [["¿log2(101) forma parte del ejemplo de 20 dB?", "Sí. 20 dB es una relación lineal de 100, y el argumento del logaritmo es 1+100."], ["¿La SNR puede ser 0 dB?", "Sí. La relación lineal es 1 y la capacidad es B × 1 bit/s/Hz."], ["¿Una banda más ancha siempre ayuda?", "Solo en esta fórmula, y solo si la SNR introducida sigue valiendo para esa banda más ancha."], ["¿Es el caudal de Wi-Fi?", "No. Es la cota AWGN."]]
      }
    }
  };
  return blocks[id];
}

const references = {
  "itu-dwdm-grid-calculator": [
    ["ITU-T G.694.1 spectral grids", "https://www.itu.int/rec/T-REC-G.694.1"],
    ["SI speed of light", "https://www.bipm.org/en/si-base-units/metre"],
    ["NIST speed of light", "https://physics.nist.gov/cgi-bin/cuu/Value?c"]
  ],
  "edfa-ase-osnr-estimator": [
    ["NIST Planck constant", "https://physics.nist.gov/cgi-bin/cuu/Value?h"],
    ["RP Photonics amplifier noise", "https://www.rp-photonics.com/amplifier_noise.html"],
    ["SI metre and the second", "https://www.bipm.org/en/measurement-units"]
  ],
  "ethernet-line-coding-calculator": [
    ["IEEE 802.3 Ethernet standard", "https://standards.ieee.org/ieee/802.3/10422/"],
    ["IEEE 802.3 working group", "https://www.ieee802.org/3/"],
    ["IEEE GET program", "https://standards.ieee.org/products-programs/ieee-get-program/"]
  ],
  "tcp-mathis-throughput-estimator": [
    ["Mathis et al., ACM CCR 1997", "https://dl.acm.org/doi/10.1145/263932.264023"],
    ["RFC 6349 framework for TCP throughput", "https://www.rfc-editor.org/rfc/rfc6349"],
    ["RFC 879 TCP maximum segment size", "https://www.rfc-editor.org/rfc/rfc879"]
  ],
  "mm1-queue-delay-calculator": [
    ["M/M/1 queue", "https://en.wikipedia.org/wiki/M/M/1_queue"],
    ["NIST engineering statistics handbook", "https://www.itl.nist.gov/div898/handbook/"],
    ["Kendall notation overview", "https://en.wikipedia.org/wiki/Kendall%27s_notation"]
  ],
  "path-availability-calculator": [
    ["NIST/SEMATECH e-Handbook of statistical methods", "https://www.itl.nist.gov/div898/handbook/apr/apr.htm"],
    ["IEC Electropedia availability", "https://www.electropedia.org/iev/iev.nsf/display?openform&ievref=192-01-23"],
    ["Independent events", "https://www.itl.nist.gov/div898/handbook/eda/section3/eda361.htm"]
  ],
  "dc-feeder-voltage-drop-calculator": [
    ["IEC 60028 copper resistance standard", "https://webstore.iec.ch/en/publication/700"],
    ["IEC Webstore", "https://webstore.iec.ch/"],
    ["Ohm's law overview", "https://en.wikipedia.org/wiki/Ohm%27s_law"]
  ],
  "pathway-fill-calculator": [
    ["Circle area", "https://en.wikipedia.org/wiki/Area_of_a_circle"],
    ["International inch and the metre", "https://www.bipm.org/en/si-base-units/metre"],
    ["NIST guide to the SI", "https://www.nist.gov/pml/owm/metric-si/si-units"]
  ],
  "copper-propagation-delay-calculator": [
    ["SI speed of light", "https://www.bipm.org/en/si-base-units/metre"],
    ["NIST speed of light", "https://physics.nist.gov/cgi-bin/cuu/Value?c"],
    ["International foot", "https://www.nist.gov/pml/owm/metric-si/si-units-length"]
  ],
  "shannon-capacity-calculator": [
    ["Shannon, A Mathematical Theory of Communication", "https://ieeexplore.ieee.org/document/6773024"],
    ["Shannon 1948 reprint", "https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf"],
    ["NIST decibel and ratio guidance", "https://www.nist.gov/pml/owm/metric-si"]
  ]
};

function questions(id, locale) {
  return prose(id, locale).faq[locale];
}

function fieldHtml(field, tool) {
  const probe = field.id === tool.probe ? ` data-probe="1" data-probe-edit="${esc(tool.probeEdit)}" data-probe-invalid="${esc(tool.probeInvalid)}"` : "";
  if (field.kind === "select") {
    const options = field.options.map(([value, label]) => `<option value="${esc(value)}"${value === field.value ? " selected" : ""}>${esc(label)}</option>`).join("");
    const exampleOptions = field.options.map(([value, label]) => `<option value="${esc(value)}"${value === field.example ? " selected" : ""}>${esc(label)}</option>`).join("");
    return `<div class="field"><label for="${esc(field.id)}">${esc(field.label)}</label><select id="${esc(field.id)}" data-field="${esc(field.id)}" data-example="${esc(field.example)}">${options}</select></div>`;
  }
  const unit = field.unitId ? `<select id="${esc(field.unitId)}" data-field="${esc(field.unitId)}" aria-label="${esc(field.label)} unit">${field.units.map((unit) => `<option value="${esc(unit)}"${unit === field.selected ? " selected" : ""}>${esc(unit)}</option>`).join("")}</select>` : "";
  const inputType = field.id === "blocks" ? "text" : "number";
  const step = inputType === "number" ? ` step="any"` : "";
  return `<div class="field"><label for="${esc(field.id)}">${esc(field.label)}</label><div class="inp input-wrap"><input id="${esc(field.id)}" data-field="${esc(field.id)}" data-example="${esc(field.example)}" type="${inputType}" inputmode="${inputType === "number" ? "decimal" : "text"}" value="${esc(field.value)}"${step}${probe}>${unit}</div></div>`;
}

function pageHtml(tool, locale) {
  const text = copy[locale];
  const info = prose(tool.id, locale);
  const lang = locale === "zh" ? "zh-CN" : locale === "es" ? "es" : "en";
  const prefix = locale === "en" ? "" : "../";
  const shellFile = path.join(site, "tools/route-summarization-calculator", locale === "en" ? "index.html" : `${locale}/index.html`);
  const shell = fs.readFileSync(shellFile, "utf8");
  const header = shell.slice(shell.indexOf("<!-- NEL_HEADER_START -->"), shell.indexOf("<!-- NEL_HEADER_END -->") + "<!-- NEL_HEADER_END -->".length)
    .replaceAll("/tools/route-summarization-calculator/", `/tools/${tool.id}/`)
    .replaceAll(">Start calculating<", `>${text.start}<`)
    .replaceAll(">开始计算<", `>${text.start}<`)
    .replaceAll(">Empezar a calcular<", `>${text.start}<`);
  const footer = shell.slice(shell.indexOf("<!-- NEL_FOOTER_START -->"), shell.indexOf("<!-- NEL_FOOTER_END -->") + "<!-- NEL_FOOTER_END -->".length);
  const ret = shell.slice(shell.indexOf("<!-- NEL_TOOL_RETURN_START -->"), shell.indexOf("<!-- NEL_TOOL_RETURN_END -->") + "<!-- NEL_TOOL_RETURN_END -->".length)
    .replace(/<span aria-current="page">[^<]*<\/span>/, `<span aria-current="page">${esc(tool.name[locale])}</span>`);
  const url = `https://netengineerlab.com/tools/${tool.id}/${locale === "en" ? "" : locale + "/"}`;
  const fields = fieldsFor(tool.id, locale).map((field) => fieldHtml(field, tool)).join("");
  const outputs = outputsFor(tool.id, locale).map((item) => `<article class="metric"><span class="lbl" id="lbl-${item.key}">${esc(item.label)}</span><span class="val" id="out-${item.key}" data-out="${item.key}"><span class="num">—</span>${item.unit ? `<span class="unit">${esc(item.unit)}</span>` : ""}</span></article>`).join("");
  const faq = questions(tool.id, locale).map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join("");
  const faqLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions(tool.id, locale).map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } }))
  });
  const refs = references[tool.id].map(([label, href]) => `<li><a href="${esc(href)}">${esc(label)}</a></li>`).join("");
  const registry = JSON.parse(fs.readFileSync(path.join(root, "src/registry/tool-registry.json"), "utf8"));
  const related = tool.related.map((id) => {
    const target = tools.find((item) => item.id === id) || null;
    const published = registry.find((item) => item.id === id);
    const name = target ? target.name[locale] : published?.translations?.[locale]?.name || id;
    const href = locale === "en" ? `../${id}/` : `../../${id}/${locale}/`;
    return `<li><a href="${href}">${esc(name)}</a></li>`;
  }).join("");
  const graph = graphHtml(tool, locale);
  const table = tool.id === "itu-dwdm-grid-calculator" ? `<div class="table-scroll"><table><caption>${locale === "zh" ? "相邻信道" : locale === "es" ? "Canales vecinos" : "Neighboring channels"}</caption><thead><tr><th>n</th><th>THz</th><th>nm</th></tr></thead><tbody id="gridBody"></tbody></table></div>` : "";
  const depthNote = locale === "zh" ? "本页结果随输入变化。非法输入会显示原因，并清除上一组数值。" : locale === "es" ? "El resultado sigue a los datos. Un dato no válido explica el motivo y borra el valor anterior." : "The result follows the inputs. An invalid input explains why and clears the previous numbers.";
  return `<!DOCTYPE html>
<html lang="${lang}" dir="ltr" data-nel-locale="${locale === "zh" ? "zh" : locale}" data-nel-route="tools/${tool.id}/">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="app-base" content="${locale === "en" ? "./" : "../"}">
<title>${esc(tool.name[locale])}</title>
<meta name="description" content="${esc(tool.description[locale])}">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
<link rel="icon" href="/assets/icons/favicon.svg?v=1.9.5-06" type="image/svg+xml">
<link rel="stylesheet" href="/assets/css/cookie-consent.css?v=${hash12(path.join(site, "assets/css/cookie-consent.css"))}">
<link rel="stylesheet" href="/assets/css/mobile-branding.css?v=${hash12(path.join(site, "assets/css/mobile-branding.css"))}">
<link rel="stylesheet" href="/assets/css/tool-workflow.css?v=${hash12(path.join(site, "assets/css/tool-workflow.css"))}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&amp;family=Geist+Mono:wght@400;500&amp;family=Instrument+Serif:ital@1&amp;display=swap">
<link rel="stylesheet" href="/assets/css/fb-v3.css?v=${hash12(path.join(site, "assets/css/fb-v3.css"))}">
<link rel="stylesheet" href="/assets/css/fb-v3-prod.css?v=${hash12(path.join(site, "assets/css/fb-v3-prod.css"))}">
<link rel="stylesheet" href="${prefix}css/style.css?v=STYLEHASH">
<script defer src="/assets/js/tool-v3-navigation.js?v=${hash12(path.join(site, "assets/js/tool-v3-navigation.js"))}"></script>
<meta name="theme-color" content="#176ff2">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(tool.name[locale])}">
<meta property="og:description" content="${esc(tool.description[locale])}">
<meta property="og:image" content="https://netengineerlab.com/assets/images/og-netengineerlab.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(tool.name[locale])}">
<meta name="twitter:description" content="${esc(tool.description[locale])}">
<meta name="twitter:image" content="https://netengineerlab.com/assets/images/og-netengineerlab.png">
<script type="application/ld+json" data-nel-schema="webpage">${JSON.stringify({ "@context": "https://schema.org", "@type": "WebPage", name: tool.name[locale], url, description: tool.description[locale], inLanguage: lang, isPartOf: { "@type": "WebSite", name: "NetEngineerLab", url: "https://netengineerlab.com/" } })}</script>
<meta name="nel-framework" content="NetEngineerLab Config-Driven Multilingual V1.9.9-04-p0-p1-correctness-consent-offline">
<meta name="nel-locale" content="${locale === "zh" ? "zh" : locale}">
<meta name="nel-route" content="tools/${tool.id}/">
<meta name="nel-available-locales" content="en,zh,es">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="en" href="https://netengineerlab.com/tools/${tool.id}/">
<link rel="alternate" hreflang="zh-CN" href="https://netengineerlab.com/tools/${tool.id}/zh/">
<link rel="alternate" hreflang="es" href="https://netengineerlab.com/tools/${tool.id}/es/">
<link rel="alternate" hreflang="x-default" href="https://netengineerlab.com/tools/${tool.id}/">
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: text.home, item: "https://netengineerlab.com/" }, { "@type": "ListItem", position: 2, name: text.tools, item: "https://netengineerlab.com/tools/" }, { "@type": "ListItem", position: 3, name: tool.name[locale], item: url }] })}</script>
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "WebApplication", name: tool.name[locale], url, description: tool.description[locale], applicationCategory: "UtilitiesApplication", operatingSystem: "Any", inLanguage: lang, isAccessibleForFree: true, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } })}</script>
<script type="application/ld+json" data-nel-schema="faq">${faqLd}</script>
<link rel="stylesheet" href="${locale === "en" ? "../../" : "../../../"}assets/css/locale-menu.css?v=${hash12(path.join(site, "assets/css/locale-menu.css"))}">
<link rel="stylesheet" href="${locale === "en" ? "../../" : "../../../"}assets/css/design-tokens.css?v=${hash12(path.join(site, "assets/css/design-tokens.css"))}">
<link rel="stylesheet" href="${locale === "en" ? "../../" : "../../../"}assets/css/tool-design-system.css?v=${hash12(path.join(site, "assets/css/tool-design-system.css"))}">
<link rel="stylesheet" href="${locale === "en" ? "../../" : "../../../"}assets/css/site-shell.css?v=${hash12(path.join(site, "assets/css/site-shell.css"))}">
<script defer src="${locale === "en" ? "../../" : "../../../"}data/locales.js?v=${hash12(path.join(site, "data/locales.js"))}"></script>
<script defer src="${locale === "en" ? "../../" : "../../../"}data/site-config.js?v=${hash12(path.join(site, "data/site-config.js"))}"></script>
<script defer src="${locale === "en" ? "../../" : "../../../"}assets/js/analytics.js?v=${hash12(path.join(site, "assets/js/analytics.js"))}"></script>
<script defer src="${locale === "en" ? "../../" : "../../../"}assets/js/adsense.js?v=${hash12(path.join(site, "assets/js/adsense.js"))}"></script>
<script defer src="${locale === "en" ? "../../" : "../../../"}assets/js/site.js?v=${hash12(path.join(site, "assets/js/site.js"))}"></script>
<link rel="stylesheet" href="${locale === "en" ? "../../" : "../../../"}assets/css/tool-layout.css?v=${hash12(path.join(site, "assets/css/tool-layout.css"))}">
<link rel="stylesheet" href="/assets/css/tool-workflow.css?v=${hash12(path.join(site, "assets/css/tool-workflow.css"))}" data-nel-workflow-style>
</head>
<body class="nel-tool-detail-page nel-tool-v3 has-mbar v3" data-nel-template="tool-detail-v1.3.1" data-nel-visual="network-change-planner-reference" data-nel-v3-migrated="1">
<a class="skip" href="#calculator">${locale === "zh" ? "跳到计算器" : locale === "es" ? "Saltar a la calculadora" : "Skip to calculator"}</a>
${header}
${ret}
<section class="hero nel-tool-hero" aria-hidden="true"><div class="hero-inner"><p class="eyebrow">${esc(tool.heroEyebrow[locale])}</p><p class="hero-title">${esc(tool.name[locale])}</p><p>${esc(tool.description[locale])}</p><div class="hero-tags">${tool.heroTags[locale].map(tag => `<span>${esc(tag)}</span>`).join("")}</div></div></section>
<main id="calculator" class="tool-shell nel-tool-main nel-tool-grid nel-tool-primary-grid" data-engine="${tool.engineGlobal}" data-primary="${tool.primary}" data-nel-readout-rows=".metric">
<div class="tool-head">
<nav class="crumbs" aria-label="Breadcrumb"><a href="${locale === "en" ? "../../" : "../../../" + (locale === "zh" ? "zh/" : "es/")}">${esc(text.home)}</a> <span aria-hidden="true">/</span> <a href="${locale === "en" ? "../" : "../../" + locale + "/"}">${esc(text.tools)}</a> <span aria-hidden="true">/</span> <span aria-current="page">${esc(tool.name[locale])}</span></nav>
<h1 class="tool-page-label">${esc(tool.name[locale])}</h1>
<p class="tool-lede">${esc(tool.description[locale])}</p>
</div>
<div class="workspace">
<section class="input-panel card nel-tool-input fb-panel">
<h2 class="panel-h">${esc(text.inputs)}</h2>
<p class="hint">${esc(depthNote)}</p>
<div class="fields">${fields}</div>
<p id="validation" class="validation" role="alert"></p>
<div class="input-actions"><button id="calculateBtn" class="btn btn-primary" type="button">${esc(text.calculate)}</button><button id="exampleBtn" class="btn btn-ghost" type="button">${esc(text.example)}</button><button id="resetBtn" class="btn btn-ghost" type="button">${esc(text.reset)}</button></div>
<div class="formula-card"><h3>${esc(text.formula)}</h3><code>${esc(info.formula)}</code><p>${esc(text.approx)}</p></div>
</section>
<section class="result-panel card nel-tool-result readout" id="result" aria-live="polite">
<h2 class="ro-h">${esc(text.results)}</h2>
<p id="statusLine" class="hint"></p>
<div class="metric-grid">${outputs}</div>
${table}
<div class="result-actions"><button id="copyBtn" type="button">${esc(text.copy)}</button><button id="csvBtn" type="button">${esc(text.csv)}</button></div>
</section>
</div>
<div class="below">
<nav class="toc" aria-label="${esc(text.toc)}"><h4>${esc(text.toc)}</h4><a href="#about-scope">${esc(text.about)}</a><a href="#methodology">${esc(text.method)}</a><a href="#faq">${esc(text.faq)}</a><a href="#references">${esc(text.refs)}</a><a href="#nel-tool-graph">${esc(text.flow)}</a></nav>
<div class="prose">
<details class="fb-fold blk" id="about-scope" data-nel-v3-title-normalized="1"><summary class="fb-fold-sum"><span class="fb-fold-title">${esc(text.about)}</span></summary><div class="fb-fold-body"><p>${esc(info.about[locale])}</p><p>${esc(text.approx)}</p><p class="about-meta">${esc(text.reviewed)}</p></div></details>
<details class="fb-fold blk" id="methodology" data-nel-v3-title-normalized="1"><summary class="fb-fold-sum"><span class="fb-fold-title">${esc(text.method)}</span></summary><div class="fb-fold-body"><p class="eq">${esc(info.formula)}</p><p>${esc(info.method[locale])}</p></div></details>
<div class="blk faq" id="faq"><h2>${esc(text.faq)}</h2>${faq}</div>
<section class="blk" id="references"><h2>${esc(text.refs)}</h2><ul class="rel">${refs}</ul></section>
${graph}
</div>
</div>
</main>
${footer}
<script type="application/json" id="nel-copy">${JSON.stringify(text)}</script>
<link rel="stylesheet" href="${prefix}css/style.css?v=STYLEHASH">
<script src="${prefix}js/engine.js?v=ENGINEHASH"></script>
<script src="${prefix}js/app.js?v=APPHASH"></script>
<script src="${prefix}js/pwa.js"></script>
<script src="/assets/js/cookie-consent.js?v=${hash12(path.join(site, "assets/js/cookie-consent.js"))}"></script>
<script defer src="/assets/js/tool-shell-v1.9.9-04.js?v=${hash12(path.join(site, "assets/js/tool-shell-v1.9.9-04.js"))}"></script>
</body>
</html>
`;
}

function graphHtml(tool, locale) {
  const flow = workflows.find((item) => item.id === tool.workflow);
  const index = flow.steps.findIndex((step) => step[0] === tool.id);
  const labels = locale === "zh"
    ? { eyebrow: "工程工作流", title: "继续下一步工程任务", position: "当前流程", step: "步骤", of: "/", previous: "上一步", next: "下一步", related: "相关工具", start: "流程起点", complete: "流程终点" }
    : locale === "es"
      ? { eyebrow: "FLUJO DE INGENIERÍA", title: "Seguir el flujo de ingeniería", position: "Flujo actual", step: "Paso", of: "de", previous: "Anterior", next: "Siguiente", related: "Herramientas relacionadas", start: "Inicio del flujo", complete: "Fin del flujo" }
      : { eyebrow: "ENGINEERING WORKFLOW", title: "Continue the engineering workflow", position: "Current workflow", step: "Step", of: "of", previous: "Previous", next: "Next", related: "Related tools", start: "Workflow start", complete: "Workflow complete" };
  const nameOf = (id) => {
    const found = tools.find((item) => item.id === id);
    return found ? found.name[locale] : id;
  };
  const descOf = (id) => {
    const found = tools.find((item) => item.id === id);
    return found ? found.description[locale] : "";
  };
  const hrefOf = (id) => locale === "en" ? `/tools/${id}/` : `/tools/${id}/${locale}/`;
  const card = (id, label) => `<a class="nel-tool-graph-card" href="${hrefOf(id)}"><span class="nel-tool-graph-label">${esc(label)}</span><strong>${esc(nameOf(id))}</strong><span class="nel-tool-graph-description">${esc(descOf(id))}</span></a>`;
  const prev = index > 0 ? card(flow.steps[index - 1][0], labels.previous) : `<div class="nel-tool-graph-card is-muted"><span class="nel-tool-graph-label">${esc(labels.previous)}</span><strong>${esc(labels.start)}</strong></div>`;
  const next = index < flow.steps.length - 1 ? card(flow.steps[index + 1][0], labels.next) : `<div class="nel-tool-graph-card is-muted"><span class="nel-tool-graph-label">${esc(labels.next)}</span><strong>${esc(labels.complete)}</strong></div>`;
  const related = tool.related.slice(0, 4).map((id) => `<a class="nel-tool-graph-card" href="${hrefOf(id)}"><strong>${esc(nameOf(id) === id ? (require(path.join(root, "src/registry/tool-registry.json")).find((item) => item.id === id)?.translations?.[locale]?.name || id) : nameOf(id))}</strong><span class="nel-tool-graph-description">${esc(descOf(id) || require(path.join(root, "src/registry/tool-registry.json")).find((item) => item.id === id)?.translations?.[locale]?.description || "")}</span></a>`).join("");
  const flowName = flow[locale === "zh" ? "zh" : locale === "es" ? "es" : "en"].name;
  const flowDesc = flow[locale === "zh" ? "zh" : locale === "es" ? "es" : "en"].description;
  const progress = Math.round(((index + 1) / flow.steps.length) * 100);
  return `<!-- NEL_TOOL_GRAPH_START -->
<section class="content-section nel-tool-graph" id="nel-tool-graph" aria-labelledby="nel-tool-graph-title" data-tool-id="${tool.id}" data-primary-workflow="${flow.id}">
<div class="section-heading"><div><p class="eyebrow">${esc(labels.eyebrow)}</p><h2 id="nel-tool-graph-title">${esc(labels.title)}</h2></div></div>
<div class="nel-workflow-context"><div><span class="nel-workflow-kicker">${esc(labels.position)}</span><strong>${esc(flowName)}</strong><p>${esc(flowDesc)}</p></div><div class="nel-workflow-step"><strong>${esc(labels.step)} ${index + 1} ${esc(labels.of)} ${flow.steps.length}</strong><div class="nel-workflow-progress" role="progressbar" aria-valuemin="1" aria-valuemax="${flow.steps.length}" aria-valuenow="${index + 1}" aria-valuetext="${esc(labels.step)} ${index + 1} ${esc(labels.of)} ${flow.steps.length}" aria-label="${esc(labels.step)} ${index + 1} ${esc(labels.of)} ${flow.steps.length}"><span style="width:${progress}%"></span></div></div></div>
<div class="nel-tool-graph-nav">${prev}${next}</div>
<h3 class="nel-tool-graph-subtitle">${esc(labels.related)}</h3><div class="nel-tool-graph-related">${related}</div>
</section>
<!-- NEL_TOOL_GRAPH_END -->`;
}

const appJs = `(() => {
  "use strict";
  const main = document.getElementById("calculator");
  const engine = window[main.dataset.engine];
  const text = JSON.parse(document.getElementById("nel-copy").textContent);
  const validation = document.getElementById("validation");
  const statusLine = document.getElementById("statusLine");
  const defaults = new Map([...document.querySelectorAll("[data-field]")].map((el) => [el, el.value]));
  function setPath(target, key, value) {
    if (key === "blocks") { target.blocks = String(value).split(",").map((item) => item.trim()).filter(Boolean); return; }
    if (key === "powerDbm" || key === "gainDb" || key === "noiseFigureDb" || key === "spans" || key === "mss" || key === "mtbfHours" || key === "mttrHours" || key === "voltage" || key === "current" || key === "temperature" || key === "alpha" || key === "conductors" || key === "rho20" || key === "limitPercent" || key === "velocityFactor" || key === "snr" || key === "channel") { target[key] = value; return; }
    if (key.endsWith("Unit") || key === "code" || key === "kind" || key === "mode" || key === "snrUnit") { target[key] = value; return; }
    target[key] = { value: value, unit: (document.querySelector('[data-field="' + key + 'Unit"]') || {}).value };
  }
  function collect() {
    const input = {};
    for (const el of document.querySelectorAll("[data-field]")) {
      if (el.dataset.field.endsWith("Unit") && el.dataset.field !== "snrUnit") continue;
      setPath(input, el.dataset.field, el.value);
    }
    if (input.anchor) input.anchor.unit = document.getElementById("anchorUnit").value;
    if (input.spacing) input.spacing.unit = document.getElementById("spacingUnit").value;
    if (input.frequency) input.frequency.unit = document.getElementById("frequencyUnit").value;
    if (input.bandwidth && document.getElementById("bandwidthUnit")) input.bandwidth.unit = document.getElementById("bandwidthUnit").value;
    if (input.payload) input.payload.unit = document.getElementById("payloadUnit").value;
    if (input.rtt) input.rtt.unit = document.getElementById("rttUnit").value;
    if (input.loss) input.loss.unit = document.getElementById("lossUnit").value;
    if (input.link) input.link.unit = document.getElementById("linkUnit").value;
    if (input.arrival) input.arrival.unit = document.getElementById("arrivalUnit").value;
    if (input.service) input.service.unit = document.getElementById("serviceUnit").value;
    if (input.length) input.length.unit = document.getElementById("lengthUnit").value;
    if (input.area) input.area.unit = document.getElementById("areaUnit").value;
    if (input.conduit) input.conduit.unit = document.getElementById("conduitUnit").value;
    if (document.getElementById("d1")) input.groups = [{ diameter: { value: document.getElementById("d1").value, unit: document.getElementById("d1Unit").value }, count: document.getElementById("n1").value }];
    if (document.getElementById("n2") && String(document.getElementById("n2").value).trim() !== "" && Number(document.getElementById("n2").value) > 0) input.groups.push({ diameter: { value: document.getElementById("d2").value, unit: document.getElementById("d2Unit").value }, count: document.getElementById("n2").value });
    return input;
  }
  function clearOutputs() {
    for (const node of document.querySelectorAll("[data-out] .num")) node.textContent = "—";
    const body = document.getElementById("gridBody");
    if (body) body.replaceChildren();
  }
  function showInvalid(code) {
    validation.textContent = text.errors[code] || text.invalid;
    statusLine.textContent = text.invalid;
    document.getElementById("result").dataset.state = "invalid";
    clearOutputs();
  }
  function render(result) {
    if (!result || !result.ok) { showInvalid(result && result.error); return; }
    validation.textContent = "";
    statusLine.textContent = text.ready;
    document.getElementById("result").dataset.state = "valid";
    for (const [key, value] of Object.entries(result.display)) {
      const node = document.querySelector('[data-out="' + key + '"] .num');
      if (node) node.textContent = value;
    }
    const body = document.getElementById("gridBody");
    if (body) {
      body.replaceChildren();
      for (const row of result.table || []) {
        const tr = document.createElement("tr");
        for (const cell of row) { const td = document.createElement("td"); td.textContent = cell; tr.appendChild(td); }
        body.appendChild(tr);
      }
    }
  }
  function run() { render(engine.calculate(collect())); }
  document.getElementById("calculateBtn").addEventListener("click", run);
  main.addEventListener("input", run);
  document.getElementById("exampleBtn").addEventListener("click", () => {
    for (const el of document.querySelectorAll("[data-example]")) el.value = el.dataset.example;
    run();
  });
  document.getElementById("resetBtn").addEventListener("click", () => {
    for (const [el, value] of defaults) el.value = value;
    run();
  });
  document.getElementById("copyBtn").addEventListener("click", async () => {
    const lines = [...document.querySelectorAll("[data-out]")].map((node) => node.id.replace(/^out-/, "") + ": " + node.innerText.replace(/\\s+/g, " ").trim());
    const payload = lines.join("\\n");
    try { await navigator.clipboard.writeText(payload); } catch (error) {
      const area = document.createElement("textarea"); area.value = payload; document.body.appendChild(area); area.select(); document.execCommand("copy"); area.remove();
    }
  });
  document.getElementById("csvBtn").addEventListener("click", () => {
    const rows = [["name", "value"], ...[...document.querySelectorAll(".metric")].map((node) => [node.querySelector(".lbl").textContent, node.querySelector(".val").innerText.replace(/\\s+/g, " ").trim()])];
    const csv = rows.map((row) => row.map((cell) => '"' + String(cell).replaceAll('"', '""') + '"').join(",")).join("\\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = main.dataset.engine + ".csv";
    document.body.appendChild(link); link.click(); link.remove();
  });
  run();
})();
`;

const css = `/* Tool-local layout. Shared header and footer stay in the site stylesheets. */
body.nel-tool-v3 #calculator{width:min(100% - 48px,1400px);margin:0 auto;padding:28px 0 72px;box-sizing:border-box;color:#16140f}
body.nel-tool-v3 #calculator > .tool-head{margin-bottom:22px}
body.nel-tool-v3 #calculator .tool-page-label{margin:0;font-size:40px;font-weight:600;letter-spacing:-.03em;line-height:1.12}
body.nel-tool-v3 #calculator .tool-lede{max-width:760px;margin:12px 0 0;line-height:1.7}
body.nel-tool-v3 #calculator > .workspace{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:20px!important;align-items:stretch!important;width:100%!important;min-width:0!important}
body.nel-tool-v3 #calculator .nel-tool-input,body.nel-tool-v3 #calculator .nel-tool-result{min-width:0;height:100%;box-sizing:border-box;border:1px solid #d8dee8;border-radius:16px;background:#fff;padding:22px}
body.nel-tool-v3 #calculator .fields{display:grid;grid-template-columns:1fr;gap:12px}
body.nel-tool-v3 #calculator label{display:block;margin:0 0 6px;font-size:14px;font-weight:600;white-space:normal;overflow:visible;text-overflow:clip}
body.nel-tool-v3 #calculator .inp{display:flex;align-items:center;gap:8px;min-width:0}
body.nel-tool-v3 #calculator .inp input,body.nel-tool-v3 #calculator .inp select,body.nel-tool-v3 #calculator select{min-width:0}
body.nel-tool-v3 #calculator .inp input{flex:1}
body.nel-tool-v3 #calculator .input-actions,.result-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
body.nel-tool-v3 #calculator .input-actions button,.result-actions button{min-height:44px}
body.nel-tool-v3 #calculator .formula-card{margin-top:16px;padding:14px 16px;border:1px solid #d9e4f2;border-radius:12px;background:#f8faff}
body.nel-tool-v3 #calculator .formula-card h3{margin:0 0 8px;font-size:14px;font-weight:600}
body.nel-tool-v3 #calculator .formula-card code{display:block;white-space:normal;font:500 13px/1.7 "Geist Mono",ui-monospace,monospace}
body.nel-tool-v3 #calculator .metric-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
body.nel-tool-v3 #calculator .metric{min-width:0;padding:12px;border:1px solid #d8dee8;border-radius:12px;background:#fff}
body.nel-tool-v3 #calculator .metric .lbl{display:block;margin-bottom:6px;color:#3d3a33;font-size:13px;font-weight:500;white-space:normal;overflow:visible;text-overflow:clip;line-height:1.45}
body.nel-tool-v3 #calculator .metric .val{display:flex;align-items:baseline;gap:6px;max-width:100%;overflow-x:auto;color:#E8590C;font-weight:400;font-size:22px;line-height:1.3}
body.nel-tool-v3 #calculator .metric .num,body.nel-tool-v3 #calculator .metric .unit{white-space:nowrap;font-weight:400;color:#E8590C}
body.nel-tool-v3 #calculator .table-scroll{max-width:100%;overflow-x:auto;margin-top:14px}
body.nel-tool-v3 #calculator table{width:max-content;min-width:100%;border-collapse:collapse}
body.nel-tool-v3 #calculator th,body.nel-tool-v3 #calculator td{padding:8px 10px;border:1px solid #d8dee8;text-align:left;white-space:nowrap}
body.nel-tool-v3 #calculator > .below{display:grid!important;grid-template-columns:minmax(200px,240px) minmax(0,1fr)!important;gap:20px!important;align-items:start!important;margin-top:28px!important}
body.nel-tool-v3 #calculator > .below > .toc{display:flex;flex-direction:column;position:sticky;top:90px;padding:10px;border:1px solid #e2e8f0;border-radius:14px;background:#fff}
body.nel-tool-v3 #calculator > .below > .toc a{display:block;padding:7px 10px;color:#0f172a;text-decoration:none}
body.nel-tool-v3 #calculator .blk{margin:0 0 16px;padding:22px;background:#fff;border:1px solid #d8dee8;border-radius:16px}
body.nel-tool-v3 #calculator .validation{min-height:1.4em;color:#9a3412}
body.nel-tool-v3 #calculator .validation:empty{display:none}
a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible{outline:3px solid #ffbf47;outline-offset:3px}
@media (max-width:960px){body.nel-tool-v3 #calculator .tool-page-label{font-size:32px}body.nel-tool-v3 #calculator > .workspace,body.nel-tool-v3 #calculator > .below{grid-template-columns:minmax(0,1fr)!important}body.nel-tool-v3 #calculator > .below > .toc{position:static}}
@media (max-width:800px){body.nel-tool-v3 #calculator{width:min(100% - 24px,1400px)}body.nel-tool-v3 #calculator .metric-grid{grid-template-columns:1fr}body.nel-tool-v3 #calculator .input-actions,body.nel-tool-v3 #calculator .result-actions{display:grid;grid-template-columns:1fr}}
html body.nel-tool-v3 > main.tool-shell{width:min(100% - 48px,1400px) !important;max-width:1400px !important}
html body.nel-tool-v3 > main.nel-tool-grid{grid-template-columns:minmax(0,1fr) !important}
html body.nel-tool-v3 #calculator > .workspace{grid-column:1 / -1 !important}
html body.nel-tool-v3 #calculator .nel-tool-result.readout{color:#16140f !important;background:#fff !important;overflow:visible !important;position:static !important}
html body.nel-tool-v3 #calculator .inp{display:flex !important;align-items:center;gap:8px;width:100%;min-height:44px !important;height:auto !important;padding:0 12px;border:1px solid #d8dee8;border-radius:8px;background:#fff;box-sizing:border-box}
html body.nel-tool-v3 #calculator .inp :is(input,select){all:revert;flex:1 1 auto;min-width:0 !important;width:auto !important;height:32px !important;min-height:32px !important;max-height:none !important;overflow:visible !important;border:0 !important;background:transparent !important;padding:0 !important;font:500 15px/1.4 ui-monospace,monospace;color:#16140f}
html body.nel-tool-v3 #calculator .inp select{flex:0 0 auto !important;max-width:46% !important;width:auto !important}
html body.nel-tool-v3 #calculator .metric .val,html body.nel-tool-v3 #calculator .metric .num,html body.nel-tool-v3 #calculator .metric .unit{color:#E8590C !important;font-weight:400 !important;white-space:nowrap !important}
html body.nel-tool-v3 #calculator > .below > .toc{display:flex !important}
`;

function testSource(tool) {
  const id = tool.id;
  return `"use strict";
const assert = require("assert");
const engine = require("../js/engine.js");
function close(actual, expected, label) {
  const scale = Math.max(1, Math.abs(expected));
  assert.ok(Math.abs(actual - expected) <= scale * 1e-9, label + " " + actual + " != " + expected);
}
${referenceFunction(id)}
const normal = ${normalCall(id)};
const expected = reference(normal.input);
assert.equal(normal.result.ok, true);
for (const [key, value] of Object.entries(expected)) close(normal.result.values[key], value, key);
const changed = engine.calculate(normal.changed);
assert.equal(changed.ok, true);
assert.notStrictEqual(changed.values[normal.primary], normal.result.values[normal.primary]);
for (const bad of normal.invalid) assert.equal(engine.calculate(bad).ok, false, JSON.stringify(bad));
const converted = engine.calculate(normal.converted);
assert.equal(converted.ok, true);
close(converted.values[normal.primary], reference(normal.converted)[normal.primary], "unit");
const boundary = engine.calculate(normal.boundary);
assert.equal(boundary.ok, true);
assert.ok(Object.values(boundary.values).every((value) => value == null || Number.isFinite(value)));
console.log(${JSON.stringify(id)} + " engine tests PASS");
`;
}

function normalCall(id) {
  const map = {
    "itu-dwdm-grid-calculator": `{input:{anchor:{value:193.1,unit:"THz"},spacing:{value:100,unit:"GHz"},channel:0},changed:{anchor:{value:193.1,unit:"THz"},spacing:{value:100,unit:"GHz"},channel:1},converted:{anchor:{value:193100,unit:"GHz"},spacing:{value:0.1,unit:"THz"},channel:0},boundary:{anchor:{value:400,unit:"THz"},spacing:{value:0.001,unit:"GHz"},channel:-100000},invalid:[{anchor:{value:"",unit:"THz"},spacing:{value:100,unit:"GHz"},channel:0},{anchor:{value:-1,unit:"THz"},spacing:{value:100,unit:"GHz"},channel:0},{anchor:{value:193.1,unit:"THz"},spacing:{value:0,unit:"GHz"},channel:0},{anchor:{value:193.1,unit:"THz"},spacing:{value:100,unit:"GHz"},channel:1.5},{anchor:{value:"1e999",unit:"THz"},spacing:{value:100,unit:"GHz"},channel:0}],primary:"frequencyTHz",result:engine.calculate({anchor:{value:193.1,unit:"THz"},spacing:{value:100,unit:"GHz"},channel:0})}`,
    "edfa-ase-osnr-estimator": `{input:{powerDbm:0,gainDb:20,noiseFigureDb:5,frequency:{value:193.1,unit:"THz"},bandwidth:{value:12.5,unit:"GHz"},spans:1},changed:{powerDbm:0,gainDb:20,noiseFigureDb:5,frequency:{value:193.1,unit:"THz"},bandwidth:{value:12.5,unit:"GHz"},spans:2},converted:{powerDbm:0,gainDb:20,noiseFigureDb:5,frequency:{value:193100,unit:"GHz"},bandwidth:{value:12500,unit:"MHz"},spans:1},boundary:{powerDbm:-80,gainDb:0.001,noiseFigureDb:0,frequency:{value:100,unit:"THz"},bandwidth:{value:0.001,unit:"GHz"},spans:1},invalid:[{powerDbm:"",gainDb:20,noiseFigureDb:5,frequency:{value:193.1,unit:"THz"},bandwidth:{value:12.5,unit:"GHz"},spans:1},{powerDbm:0,gainDb:0,noiseFigureDb:5,frequency:{value:193.1,unit:"THz"},bandwidth:{value:12.5,unit:"GHz"},spans:1},{powerDbm:0,gainDb:20,noiseFigureDb:-1,frequency:{value:193.1,unit:"THz"},bandwidth:{value:12.5,unit:"GHz"},spans:1},{powerDbm:0,gainDb:20,noiseFigureDb:5,frequency:{value:193.1,unit:"THz"},bandwidth:{value:12.5,unit:"GHz"},spans:0},{powerDbm:"Infinity",gainDb:20,noiseFigureDb:5,frequency:{value:193.1,unit:"THz"},bandwidth:{value:12.5,unit:"GHz"},spans:1}],primary:"osnrDb",result:engine.calculate({powerDbm:0,gainDb:20,noiseFigureDb:5,frequency:{value:193.1,unit:"THz"},bandwidth:{value:12.5,unit:"GHz"},spans:1})}`,
    "ethernet-line-coding-calculator": `{input:{payload:{value:10,unit:"Gbps"},code:"64b66b"},changed:{payload:{value:40,unit:"Gbps"},code:"64b66b"},converted:{payload:{value:10000,unit:"Mbps"},code:"64b66b"},boundary:{payload:{value:100000,unit:"Gbps"},code:"8b10b"},invalid:[{payload:{value:0,unit:"Gbps"},code:"64b66b"},{payload:{value:-1,unit:"Gbps"},code:"64b66b"},{payload:{value:"",unit:"Gbps"},code:"64b66b"},{payload:{value:10,unit:"Gbps"},code:"nope"},{payload:{value:"1e999",unit:"Gbps"},code:"64b66b"}],primary:"lineGbps",result:engine.calculate({payload:{value:10,unit:"Gbps"},code:"64b66b"})}`,
    "tcp-mathis-throughput-estimator": `{input:{mss:1460,rtt:{value:40,unit:"ms"},loss:{value:0.01,unit:"percent"},link:{value:"",unit:"Mbps"}},changed:{mss:1460,rtt:{value:80,unit:"ms"},loss:{value:0.01,unit:"percent"},link:{value:"",unit:"Mbps"}},converted:{mss:1460,rtt:{value:40000,unit:"us"},loss:{value:0.0001,unit:"probability"},link:{value:"",unit:"Mbps"}},boundary:{mss:1,rtt:{value:100,unit:"s"},loss:{value:0.999999,unit:"probability"},link:{value:"",unit:"Mbps"}},invalid:[{mss:0,rtt:{value:40,unit:"ms"},loss:{value:0.01,unit:"percent"}},{mss:1460,rtt:{value:0,unit:"ms"},loss:{value:0.01,unit:"percent"}},{mss:1460,rtt:{value:40,unit:"ms"},loss:{value:0,unit:"percent"}},{mss:1460.5,rtt:{value:40,unit:"ms"},loss:{value:0.01,unit:"percent"}},{mss:"",rtt:{value:40,unit:"ms"},loss:{value:0.01,unit:"percent"}}],primary:"throughputMbps",result:engine.calculate({mss:1460,rtt:{value:40,unit:"ms"},loss:{value:0.01,unit:"percent"},link:{value:"",unit:"Mbps"}})}`,
    "mm1-queue-delay-calculator": `{input:{arrival:{value:800,unit:"per_s"},service:{value:1000,unit:"per_s"}},changed:{arrival:{value:500,unit:"per_s"},service:{value:1000,unit:"per_s"}},converted:{arrival:{value:48000,unit:"per_min"},service:{value:60000,unit:"per_min"}},boundary:{arrival:{value:1,unit:"per_s"},service:{value:1.000001,unit:"per_s"}},invalid:[{arrival:{value:0,unit:"per_s"},service:{value:1000,unit:"per_s"}},{arrival:{value:1000,unit:"per_s"},service:{value:1000,unit:"per_s"}},{arrival:{value:-1,unit:"per_s"},service:{value:1000,unit:"per_s"}},{arrival:{value:"",unit:"per_s"},service:{value:1000,unit:"per_s"}},{arrival:{value:"bad",unit:"per_s"},service:{value:1000,unit:"per_s"}}],primary:"sojournMs",result:engine.calculate({arrival:{value:800,unit:"per_s"},service:{value:1000,unit:"per_s"}})}`,
    "path-availability-calculator": `{input:{kind:"blocks",mode:"parallel",blocks:["0.999","0.999"]},changed:{kind:"blocks",mode:"series",blocks:["0.999","0.999"]},converted:{kind:"mtbf",mtbfHours:8760,mttrHours:4},boundary:{kind:"blocks",mode:"series",blocks:["1"]},invalid:[{kind:"blocks",mode:"parallel",blocks:[]},{kind:"blocks",mode:"parallel",blocks:["0"]},{kind:"blocks",mode:"parallel",blocks:["-1"]},{kind:"mtbf",mtbfHours:0,mttrHours:4},{kind:"mtbf",mtbfHours:"",mttrHours:4}],primary:"availability",result:engine.calculate({kind:"blocks",mode:"parallel",blocks:["0.999","0.999"]})}`,
    "dc-feeder-voltage-drop-calculator": `{input:{voltage:48,current:100,length:{value:50,unit:"m"},area:{value:95,unit:"mm2"},temperature:20,alpha:0.00393,conductors:2,rho20:1/58},changed:{voltage:48,current:200,length:{value:50,unit:"m"},area:{value:95,unit:"mm2"},temperature:20,alpha:0,conductors:2,rho20:1/58},converted:{voltage:48,current:100,length:{value:50/0.3048,unit:"ft"},area:{value:0.95,unit:"cm2"},temperature:20,alpha:0.00393,conductors:2,rho20:1/58},boundary:{voltage:0.001,current:0,length:{value:0.001,unit:"m"},area:{value:0.001,unit:"mm2"},temperature:-50,alpha:0,conductors:1,rho20:0.000001},invalid:[{voltage:0,current:1,length:{value:1,unit:"m"},area:{value:1,unit:"mm2"},temperature:20,alpha:0,conductors:1,rho20:1/58},{voltage:48,current:-1,length:{value:1,unit:"m"},area:{value:1,unit:"mm2"},temperature:20,alpha:0,conductors:1,rho20:1/58},{voltage:48,current:1,length:{value:0,unit:"m"},area:{value:1,unit:"mm2"},temperature:20,alpha:0,conductors:1,rho20:1/58},{voltage:"",current:1,length:{value:1,unit:"m"},area:{value:1,unit:"mm2"},temperature:20,alpha:0,conductors:1,rho20:1/58},{voltage:48,current:1,length:{value:1,unit:"m"},area:{value:1,unit:"mm2"},temperature:20,alpha:0,conductors:3,rho20:1/58}],primary:"dropV",result:engine.calculate({voltage:48,current:100,length:{value:50,unit:"m"},area:{value:95,unit:"mm2"},temperature:20,alpha:0.00393,conductors:2,rho20:1/58})}`,
    "pathway-fill-calculator": `{input:{conduit:{value:100,unit:"mm"},groups:[{diameter:{value:20,unit:"mm"},count:3}],limitPercent:""},changed:{conduit:{value:50,unit:"mm"},groups:[{diameter:{value:20,unit:"mm"},count:3}],limitPercent:""},converted:{conduit:{value:100/25.4,unit:"inch"},groups:[{diameter:{value:20/25.4,unit:"inch"},count:3}],limitPercent:""},boundary:{conduit:{value:0.001,unit:"mm"},groups:[{diameter:{value:0.001,unit:"mm"},count:1}],limitPercent:"100"},invalid:[{conduit:{value:0,unit:"mm"},groups:[{diameter:{value:20,unit:"mm"},count:3}]},{conduit:{value:100,unit:"mm"},groups:[{diameter:{value:-1,unit:"mm"},count:3}]},{conduit:{value:100,unit:"mm"},groups:[]},{conduit:{value:"",unit:"mm"},groups:[{diameter:{value:20,unit:"mm"},count:3}]},{conduit:{value:100,unit:"mm"},groups:[{diameter:{value:20,unit:"mm"},count:0}]}],primary:"fillPercent",result:engine.calculate({conduit:{value:100,unit:"mm"},groups:[{diameter:{value:20,unit:"mm"},count:3}],limitPercent:""})}`,
    "copper-propagation-delay-calculator": `{input:{length:{value:100,unit:"m"},velocityFactor:0.65},changed:{length:{value:250,unit:"m"},velocityFactor:0.65},converted:{length:{value:100/0.3048,unit:"ft"},velocityFactor:0.65},boundary:{length:{value:1e9,unit:"m"},velocityFactor:1},invalid:[{length:{value:0,unit:"m"},velocityFactor:0.65},{length:{value:-1,unit:"m"},velocityFactor:0.65},{length:{value:100,unit:"m"},velocityFactor:0},{length:{value:100,unit:"m"},velocityFactor:1.1},{length:{value:"",unit:"m"},velocityFactor:0.65}],primary:"delayNs",result:engine.calculate({length:{value:100,unit:"m"},velocityFactor:0.65})}`,
    "shannon-capacity-calculator": `{input:{bandwidth:{value:20,unit:"MHz"},snr:20,snrUnit:"dB"},changed:{bandwidth:{value:40,unit:"MHz"},snr:20,snrUnit:"dB"},converted:{bandwidth:{value:20000,unit:"kHz"},snr:100,snrUnit:"linear"},boundary:{bandwidth:{value:1e-9,unit:"Hz"},snr:-40,snrUnit:"dB"},invalid:[{bandwidth:{value:0,unit:"MHz"},snr:20,snrUnit:"dB"},{bandwidth:{value:-1,unit:"MHz"},snr:20,snrUnit:"dB"},{bandwidth:{value:20,unit:"MHz"},snr:-41,snrUnit:"dB"},{bandwidth:{value:"",unit:"MHz"},snr:20,snrUnit:"dB"},{bandwidth:{value:20,unit:"MHz"},snr:-1,snrUnit:"linear"}],primary:"capacityMbps",result:engine.calculate({bandwidth:{value:20,unit:"MHz"},snr:20,snrUnit:"dB"})}`
  };
  return map[id];
}

function referenceFunction(id) {
  const body = {
    "itu-dwdm-grid-calculator": `function reference(input){const f=input.anchor.value*(input.anchor.unit==="GHz"?1e-3:1)+input.channel*(input.spacing.value*(input.spacing.unit==="THz"?1000:input.spacing.unit==="MHz"?1e-3:1))/1000;return {frequencyTHz:f,wavelengthNm:299792.458/f,frequencyGHz:f*1000};}`,
    "edfa-ase-osnr-estimator": `function reference(input){const H=6.62607015e-34;const f=input.frequency.value*(input.frequency.unit==="GHz"?1e9:1e12);const B=input.bandwidth.value*(input.bandwidth.unit==="MHz"?1e6:input.bandwidth.unit==="Hz"?1:1e9);const G=10**(input.gainDb/10);const F=10**(input.noiseFigureDb/10);const signal=10**((input.powerDbm-30)/10);const ase=input.spans*F*H*f*(G-1)*B;return {osnrDb:10*Math.log10(signal/ase),aseDbm:10*Math.log10(ase)+30,signalMw:signal*1000,aseMw:ase*1000};}`,
    "ethernet-line-coding-calculator": `function reference(input){const ratios={"8b10b":[10,8],"64b66b":[66,64],"64b66b-rs528":[66*528,64*514],"64b66b-rs544":[66*544,64*514]};const factor=input.payload.unit==="Mbps"?1e-3:input.payload.unit==="Tbps"?1000:1;const ratio=ratios[input.code][0]/ratios[input.code][1];const line=input.payload.value*factor*ratio;return {lineGbps:line,overheadPercent:(ratio-1)*100,efficiencyPercent:100/ratio,expansion:ratio};}`,
    "tcp-mathis-throughput-estimator": `function reference(input){const rtt=input.rtt.value*(input.rtt.unit==="us"?1e-6:input.rtt.unit==="s"?1:0.001);const p=input.loss.value*(input.loss.unit==="probability"?1:0.01);const bps=(input.mss*8)/(rtt*Math.sqrt(p));return {throughputMbps:bps/1e6,throughputBps:bps};}`,
    "mm1-queue-delay-calculator": `function reference(input){const l=input.arrival.value*(input.arrival.unit==="per_min"?1/60:1);const m=input.service.value*(input.service.unit==="per_min"?1/60:1);const rho=l/m;return {utilization:rho,sojournMs:1000/(m-l),waitMs:1000*rho/(m*(1-rho)),systemCount:rho/(1-rho),queueCount:rho*rho/(1-rho)};}`,
    "path-availability-calculator": `function reference(input){if(input.kind==="mtbf"){const a=input.mtbfHours/(input.mtbfHours+input.mttrHours);return {availability:a,unavailability:1-a,downMinutesPerYear:(1-a)*525600};}const values=input.blocks.map(Number);let a=1;if(input.mode==="series"){for(const v of values)a*=v;}else{let miss=1;for(const v of values)miss*=1-v;a=1-miss;}return {availability:a,unavailability:1-a,downMinutesPerYear:(1-a)*525600};}`,
    "dc-feeder-voltage-drop-calculator": `function reference(input){const L=input.length.value*(input.length.unit==="ft"?0.3048:1);const A=input.area.value*(input.area.unit==="cm2"?100:1);const R=input.rho20*(1+input.alpha*(input.temperature-20))*input.conductors*L/A;const drop=input.current*R;return {resistanceOhm:R,dropV:drop,dropPercent:drop/input.voltage*100,endVoltage:input.voltage-drop};}`,
    "pathway-fill-calculator": `function reference(input){const D=input.conduit.value*(input.conduit.unit==="inch"?25.4:1);let sum=0;for(const group of input.groups){const d=group.diameter.value*(group.diameter.unit==="inch"?25.4:1);sum+=group.count*d*d;}return {fillPercent:sum/(D*D)*100,cableAreaFactor:sum,conduitDiameterMm:D};}`,
    "copper-propagation-delay-calculator": `function reference(input){const L=input.length.value*(input.length.unit==="ft"?0.3048:1);const v=input.velocityFactor*299792458;const delay=L/v;return {delayNs:delay*1e9,delayUs:delay*1e6,nsPerMeter:1e9/v,velocityMps:v};}`,
    "shannon-capacity-calculator": `function reference(input){const unit={Hz:1,kHz:1e3,MHz:1e6,GHz:1e9}[input.bandwidth.unit];const B=input.bandwidth.value*unit;const linear=input.snrUnit==="dB"?10**(input.snr/10):input.snr;const C=B*Math.log2(1+linear);return {capacityMbps:C/1e6,capacityBps:C,snrLinear:linear,spectral:Math.log2(1+linear)};}`
  };
  return body[id];
}

function registryEntry(tool) {
  return {
    id: tool.id,
    publishedAt: "2026-11-19",
    order: tool.order,
    status: "active",
    category: tool.category,
    icon: tool.icon,
    translations: {
      en: { name: tool.name.en, description: tool.description.en, tags: tool.tags.en },
      zh: { name: tool.name.zh, description: tool.description.zh, tags: tool.tags.zh },
      es: { name: tool.name.es, description: tool.description.es, tags: tool.tags.es }
    },
    schemaVersion: "2.1.0",
    domain: tool.domain,
    capabilities: ["calculate"],
    maturity: "production",
    routes: { en: `/tools/${tool.id}/`, "zh-CN": `/tools/${tool.id}/zh/`, es: `/tools/${tool.id}/es/` },
    relationships: { related: tool.related },
    pageContent: {
      searchIntent: { en: tool.description.en, zh: tool.description.zh, es: tool.description.es },
      reviewedAt: { en: "2026-11-19", zh: "2026-11-19", es: "2026-11-19" },
      longTailQuestions: {
        en: questions(tool.id, "en").map(([q]) => q),
        zh: questions(tool.id, "zh").map(([q]) => q),
        es: questions(tool.id, "es").map(([q]) => q)
      },
      sources: references[tool.id].map((item) => item[1])
    }
  };
}

function workflowEntry(flow) {
  return {
    id: flow.id,
    schemaVersion: "2.1.0",
    status: "active",
    domain: flow.domain,
    primary: true,
    translations: { en: flow.en, zh: flow.zh },
    steps: flow.steps.map((step, index) => ({
      order: index + 1,
      toolId: step[0],
      translations: { en: { action: step[1] }, zh: { action: step[2] } }
    }))
  };
}

function serviceWorker(id) {
  const toolRoot = path.join(site, "tools", id);
  const shared = ["assets/css/fb-v3.css", "assets/css/fb-v3-prod.css", "assets/js/tool-v3-navigation.js", "assets/js/tool-detail-v3.js", "assets/js/tool-shell-v1.9.9-04.js", "assets/css/design-tokens.css", "assets/css/site-shell.css", "assets/css/tool-layout.css", "assets/css/tool-workflow.css", "assets/css/locale-menu.css", "assets/css/tool-design-system.css", "assets/js/analytics.js", "assets/js/adsense.js", "assets/js/site.js", "assets/js/tool-integration.js", "assets/css/cookie-consent.css", "assets/js/cookie-consent.js", "data/locales.js", "data/site-config.js"];
  const assets = [
    "./", "./index.html", "./offline.html", "./manifest.webmanifest",
    `./css/style.css?v=${hash12(path.join(toolRoot, "css/style.css"))}`,
    `./js/app.js?v=${hash12(path.join(toolRoot, "js/app.js"))}`,
    "./js/engine.js",
    `./js/engine.js?v=${hash12(path.join(toolRoot, "js/engine.js"))}`,
    "./js/pwa.js",
    "./zh/", "./zh/index.html", "./es/", "./es/index.html",
    ...shared.map((rel) => `../../${rel}?v=${hash12(path.join(site, rel))}`),
    ...rulesRuntimeAssets(site).map((asset) => `${asset.cachePath}?v=${hash12(path.join(site, ...asset.sitePath.split("/")))}`),
    "../../assets/icons/favicon.svg?v=1.9.5-06",
    "../../assets/css/mobile-branding.css?v=345784b6b020",
    "../../assets/images/logo.svg"
  ];
  const versioned = [
    "data/locales.js", "data/site-config.js", "assets/css/locale-menu.css", "assets/css/design-tokens.css",
    "assets/css/site-shell.css", "assets/css/tool-design-system.css", "assets/css/tool-workflow.css",
    "assets/css/fb-v3.css", "assets/css/fb-v3-prod.css", "assets/js/tool-v3-navigation.js", "assets/js/tool-detail-v3.js",
    "assets/js/analytics.js", "assets/js/adsense.js", "assets/js/site.js", "assets/js/tool-integration.js",
    "assets/js/tool-shell-v1.9.9-04.js", "assets/css/cookie-consent.css", "assets/js/cookie-consent.js",
    ...rulesRuntimeAssets(site).map((asset) => asset.sitePath)
  ];
  const sharedVersion = stableHash(versioned.map((rel) => hash12(path.join(site, ...rel.split("/")))).join(":"), 12);
  const cache = `nel-${id}-v1-${sharedVersion}`;
  return `"use strict";
const CACHE=${JSON.stringify(cache)};
const CORE=${JSON.stringify(assets, null, 2)};
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)));
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith(${JSON.stringify("nel-" + id + "-")}) && key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request).then((response) => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy));
    }
    return response;
  }).catch(() => nelScopedCacheMatch(event.request)));
});
/* NEL_SCOPED_CACHE_START */
// A different tool may retain another version of a shared asset. Never search
// its cache, and never discard a resource's content-hash query when matching.
function nelScopedCacheMatch(request, options) {
  const navigation = typeof request !== "string" && request.mode === "navigate";
  return caches.open(CACHE).then(cache => cache.match(request, navigation ? { ...options, ignoreSearch: true } : undefined));
}
/* NEL_SCOPED_CACHE_END */
`;
}

function manifest(tool, locale) {
  const folder = locale === "en" ? "" : `${locale}/`;
  return JSON.stringify({
    id: `/tools/${tool.id}/${folder}`,
    scope: `/tools/${tool.id}/`,
    display: "standalone",
    start_url: `/tools/${tool.id}/${folder}`,
    name: `NetEngineerLab ${tool.name[locale]}`,
    short_name: tool.name[locale],
    description: tool.description[locale],
    lang: locale === "zh" ? "zh-CN" : locale,
    background_color: "#f4f8fd",
    theme_color: "#176ff2",
    icons: [
      { src: "/assets/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/assets/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" }
    ]
  }, null, 2) + "\n";
}

function stamp(html, engineHash, appHash, cssHash) {
  return html.replaceAll("ENGINEHASH", engineHash).replaceAll("APPHASH", appHash).replaceAll("STYLEHASH", cssHash);
}

function buildPages() {
  for (const tool of tools) {
    const dir = path.join(site, "tools", tool.id);
    write(path.join(dir, "js/engine.js"), wrapEngine(tool.engineGlobal, engineBody(tool.id)));
    write(path.join(dir, "js/app.js"), appJs);
    write(path.join(dir, "js/pwa.js"), 'if("serviceWorker"in navigator&&location.protocol!=="file:"){addEventListener("load",()=>navigator.serviceWorker.register((document.querySelector(\'meta[name="app-base"]\')?.content||"./")+"sw.js").catch(()=>{}),{once:true})}\n');
    write(path.join(dir, "css/style.css"), css);
    write(path.join(dir, "docs/engine-test.js"), testSource(tool));
    write(path.join(dir, "offline.html"), `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>${esc(tool.name.en)}</title></head><body><p>${esc(tool.name.en)} is offline.</p></body></html>\n`);
    write(path.join(dir, "manifest.webmanifest"), manifest(tool, "en"));
    write(path.join(dir, "manifest-zh.webmanifest"), manifest(tool, "zh"));
    write(path.join(dir, "manifest-es.webmanifest"), manifest(tool, "es"));
    const engineHash = hash12(path.join(dir, "js/engine.js"));
    const appHash = hash12(path.join(dir, "js/app.js"));
    const cssHash = hash12(path.join(dir, "css/style.css"));
    for (const locale of ["en", "zh", "es"]) {
      const html = stamp(pageHtml(tool, locale), engineHash, appHash, cssHash);
      write(path.join(dir, locale === "en" ? "index.html" : `${locale}/index.html`), html);
    }
    write(path.join(dir, "sw.js"), serviceWorker(tool.id));
  }
}

function patchRegistries() {
  const registryPath = path.join(root, "src/registry/tool-registry.json");
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  for (const tool of tools) if (!registry.some((item) => item.id === tool.id)) registry.push(registryEntry(tool));
  write(registryPath, JSON.stringify(registry, null, 2) + "\n");
  const workflowPath = path.join(root, "src/registry/workflow-registry.json");
  const flows = JSON.parse(fs.readFileSync(workflowPath, "utf8"));
  for (const flow of workflows) if (!flows.some((item) => item.id === flow.id)) flows.push(workflowEntry(flow));
  write(workflowPath, JSON.stringify(flows, null, 2) + "\n");
  const seoPath = path.join(root, "scripts/seo-geo-coverage-audit.js");
  let seo = fs.readFileSync(seoPath, "utf8");
  if (!seo.includes('"itu-dwdm-grid-calculator"')) {
    const insert = tools.map((tool) => `  "${tool.id}":"${tool.intent}",`).join("\n");
    seo = seo.replace('  "route-summarization-calculator":"calculation"\n});', `  "route-summarization-calculator":"calculation",\n${insert}\n});`);
    write(seoPath, seo);
  }
}

function patchGenerated() {
  const { spawnSync } = require("child_process");
  for (const script of ["generate-tool-catalog.js", "generate-tool-graph.js"]) {
    const result = spawnSync(process.execPath, [path.join(root, "scripts", script)], { cwd: root, encoding: "utf8" });
    if (result.status) throw new Error(result.stdout + result.stderr);
  }
  const catalogHash = hash12(path.join(site, "data/tools-catalog.js"));
  for (const rel of ["index.html", "zh/index.html", "es/index.html", "tools/index.html", "tools/zh/index.html", "tools/es/index.html"]) {
    const file = path.join(site, rel);
    let html = fs.readFileSync(file, "utf8");
    html = html.replace(/tools-catalog\.js\?v=[a-f0-9]{12}/g, `tools-catalog.js?v=${catalogHash}`);
    write(file, html);
  }
  const catalog = JSON.parse(fs.readFileSync(path.join(site, "data/tools-catalog.json"), "utf8"));
  const counts = catalog.reduce((map, tool) => { map[tool.category] = (map[tool.category] || 0) + 1; return map; }, {});
  for (const rel of ["index.html", "zh/index.html", "es/index.html", "tools/index.html", "tools/zh/index.html", "tools/es/index.html", "about/index.html", "zh/about/index.html", "es/about/index.html"]) {
    const file = path.join(site, rel);
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, "utf8");
    html = html.replace(/(data-tool-count(?:="[^"]*")?[^>]*>)\s*\d+\s*/g, `$1${catalog.length}`);
    html = html.replace(/data-category-count="([a-z-]+)"([^>]*)>\s*\d+/g, (whole, category, rest) => `data-category-count="${category}"${rest}>${category === "all" ? catalog.length : (counts[category] || 0)}`);
    write(file, html);
  }
  for (const [rel, locale] of [["tools/index.html", "en"], ["tools/zh/index.html", "zh"], ["tools/es/index.html", "es"]]) {
    const file = path.join(site, rel);
    let html = fs.readFileSync(file, "utf8");
    const items = catalog.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: tool.translations[locale].name,
      url: `https://netengineerlab.com/tools/${tool.id}/${locale === "en" ? "" : locale + "/"}`
    }));
    const list = { "@context": "https://schema.org", "@type": "ItemList", name: locale === "zh" ? "NetEngineerLab 工具目录" : locale === "es" ? "Directorio de herramientas de NetEngineerLab" : "NetEngineerLab tool directory", numberOfItems: catalog.length, itemListElement: items };
    html = html.replace(/<script data-nel-launch-schema="itemlist" type="application\/ld\+json">[\s\S]*?<\/script>/, `<script data-nel-launch-schema="itemlist" type="application/ld+json">${JSON.stringify(list)}</script>`);
    const openLabel = locale === "zh" ? "打开工具" : locale === "es" ? "Abrir herramienta" : "Open tool";
    const cards = tools.map((tool) => {
      const href = locale === "en" ? `${tool.id}/` : `../${tool.id}/${locale}/`;
      if (html.includes(`href="${href}"`)) return "";
      const tags = tool.tags[locale].map((tag) => `<span>${esc(tag)}</span>`).join("");
      return `<article class="tool-card" data-category="${esc(tool.category)}">\n    <div class="tool-icon">${esc(tool.icon)}</div><h2>${esc(tool.name[locale])}</h2><p>${esc(tool.description[locale])}</p>\n    <div class="tool-tags">${tags}</div>\n    <a class="open" href="${href}">${openLabel}</a>\n   </article>`;
    }).join("");
    if (cards) html = html.replace("<!-- NEL_TOOL_GRID_END -->", `${cards}<!-- NEL_TOOL_GRID_END -->`);
    write(file, html);
  }
  const sitemapPath = path.join(site, "sitemap.xml");
  let sitemap = fs.readFileSync(sitemapPath, "utf8");
  const blocks = [];
  for (const tool of tools) {
    for (const folder of ["", "zh/", "es/"]) {
      const loc = `https://netengineerlab.com/tools/${tool.id}/${folder}`;
      if (sitemap.includes(`<loc>${loc}</loc>`)) continue;
      blocks.push(`  <url>\n    <loc>${loc}</loc>\n    <lastmod>2026-11-19</lastmod>\n    <xhtml:link rel="alternate" hreflang="en" href="https://netengineerlab.com/tools/${tool.id}/"/>\n    <xhtml:link rel="alternate" hreflang="zh-CN" href="https://netengineerlab.com/tools/${tool.id}/zh/"/>\n    <xhtml:link rel="alternate" hreflang="es" href="https://netengineerlab.com/tools/${tool.id}/es/"/>\n    <xhtml:link rel="alternate" hreflang="x-default" href="https://netengineerlab.com/tools/${tool.id}/"/>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>`);
    }
  }
  if (blocks.length) sitemap = sitemap.replace("</urlset>", `${blocks.join("\n")}\n</urlset>`);
  write(sitemapPath, sitemap);
}

function main() {
  buildPages();
  patchRegistries();
  patchGenerated();
  console.log(`Generated ${tools.length} tools`);
}
if (require.main === module) main();
module.exports = { tools, workflows };
