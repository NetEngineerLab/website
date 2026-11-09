(function(){'use strict';
var nelCurrentValid=false;
window.NELToolInputController={calculate:function(){render();},managesValidation:true,isValid:function(){return nelCurrentValid;},invalidate:function(){nelCurrentValid=false;window.lastResult=null;},resultStatus:'#status',resultActions:"#copy,#download,#print",resultValues:"#headline,#currentDemand,#currentPeak,#currentUtil,#threshold,#months,#projectedPeak,#projectedUtil,#requiredCapacity,#additional",resultDetails:"#forecastRows,#notes",validation:"#error",inputControls:".input-panel input,.input-panel select,.input-panel textarea"};
var $=function(id){return document.getElementById(id)};
var lang=window.NEL_LANG||document.documentElement.lang||'en';
var zh=lang==='zh'||String(lang).startsWith('zh');
var es=lang==='es'||String(lang).startsWith('es');
var tx=function(en,cn,sp){return zh?cn:es?sp:en};
var fmt=function(v){return Number(v).toLocaleString(undefined,{maximumFractionDigits:2})};
var riskText={
  THRESHOLD_REACHED:tx('Current peak utilization is at or above the expansion threshold.','当前峰值利用率已达到或超过扩容阈值。','La utilización pico actual ya alcanza o supera el umbral de ampliación.'),
  EXPANSION_WITHIN_12_MONTHS:tx('The forecast reaches the expansion threshold within 12 months.','预测在 12 个月内达到扩容阈值。','La previsión alcanza el umbral de ampliación en un plazo de 12 meses.'),
  HORIZON_OVERLOAD:tx('Projected peak demand exceeds installed capacity at the planning horizon.','在规划期末，预测峰值需求超过已装容量。','La demanda pico prevista supera la capacidad instalada al final del horizonte.'),
  NO_GROWTH_SIGNAL:tx('No annual growth trend was supplied.','未提供年增长趋势。','No se indicó una tendencia de crecimiento anual.'),
  HISTORY_OUTLIERS:tx('Historical observations include statistical outliers.','历史观测包含统计异常值。','Las observaciones históricas incluyen valores atípicos.')
};
function read(){var o={};document.querySelectorAll('#calculator input').forEach(function(e){o[e.id]=e.value});o.historyObservations=$('historyObservations')?$('historyObservations').value:'';return o}
function render(){try{
  if($('notes')&&$('notes').dataset.base==null)$('notes').dataset.base=$('notes').textContent||'';
  var r=NELToolEngine.calculate(read());
  nelCurrentValid=r.ok!==false;
  $('error').hidden=!!r.ok;
  if(!r.ok){
    if($('historyFeedback'))$('historyFeedback').textContent=(r.history&&r.history.errors||[]).join(' ');
    $('error').textContent=$('error').textContent||tx('Check the input values and allowed ranges.','请检查输入值和允许范围。','Revise los valores y los intervalos permitidos.');
    return;
  }
  window.lastResult=r;
  var h=r.history||{};
  if($('historyFeedback'))$('historyFeedback').textContent=h.used?tx(
    'Fitted annual growth '+h.annualGrowthPct+'%; R² '+h.confidence.r2+'; '+h.count+' observations, '+h.gaps.length+' gap(s), '+h.outliers.length+' outlier(s); growth interval '+h.confidence.lowAnnualGrowthPct+'%–'+h.confidence.highAnnualGrowthPct+'%.',
    '拟合年增长率 '+h.annualGrowthPct+'%；R² '+h.confidence.r2+'；'+h.count+' 条观测，缺失周期 '+h.gaps.length+' 个，异常值 '+h.outliers.length+' 个；增长区间 '+h.confidence.lowAnnualGrowthPct+'%–'+h.confidence.highAnnualGrowthPct+'%。',
    'Crecimiento anual ajustado '+h.annualGrowthPct+'%; R² '+h.confidence.r2+'; '+h.count+' observaciones, '+h.gaps.length+' hueco(s), '+h.outliers.length+' valor(es) atípico(s); intervalo '+h.confidence.lowAnnualGrowthPct+'%–'+h.confidence.highAnnualGrowthPct+'%.'
  ):tx('No history supplied; using manual growth.','未提供历史观测，使用手工增长率。','No hay observaciones históricas; se usa el crecimiento manual.');
  $('status').className='status '+r.status+' '+(r.status==='healthy'?'st-pass':r.status==='warning'?'st-marginal':'st-fail');
  $('status').textContent=tx(({healthy:'HEALTHY',warning:'WARNING',critical:'CRITICAL'})[r.status],({healthy:'正常',warning:'预警',critical:'严重'})[r.status],({healthy:'NORMAL',warning:'AVISO',critical:'CRÍTICO'})[r.status]);
  $('headline').textContent=r.status==='healthy'?tx('Plan has headroom','容量有余量','El plan conserva margen'):r.status==='warning'?tx('Expansion planning required','需要规划扩容','Hay que planificar la ampliación'):tx('Capacity risk','容量风险','Riesgo de capacidad');
  var vals={currentDemand:r.current.demandGbps,currentPeak:r.current.peakDemandGbps,currentUtil:r.current.utilizationPct,threshold:Number($('targetUtilizationPct').value),months:r.forecast.monthsToThreshold===null?tx('Beyond model horizon','超出模型范围','Fuera del horizonte del modelo'):r.forecast.monthsToThreshold,projectedPeak:r.forecast.projectedPeakGbps,projectedUtil:r.forecast.projectedUtilizationPct,requiredCapacity:r.forecast.requiredCapacityGbps,additional:r.forecast.additionalCapacityGbps};
  Object.keys(vals).forEach(function(k){if(!$(k))return;var value=vals[k];$(k).textContent=typeof value==='number'?fmt(value):String(value);});
  var u=r.forecast.uncertainty;
  if($('notes')){
    var note=$('notes').dataset.base||'';
    if(u)note=tx('Forecast interval: '+u.projectedPeakLowGbps+'–'+u.projectedPeakHighGbps+' Gbps peak; required capacity '+u.requiredCapacityLowGbps+'–'+u.requiredCapacityHighGbps+' Gbps. ','预测区间：峰值 '+u.projectedPeakLowGbps+'–'+u.projectedPeakHighGbps+' Gbps；所需容量 '+u.requiredCapacityLowGbps+'–'+u.requiredCapacityHighGbps+' Gbps。 ','Intervalo de previsión: pico '+u.projectedPeakLowGbps+'–'+u.projectedPeakHighGbps+' Gbps; capacidad necesaria '+u.requiredCapacityLowGbps+'–'+u.requiredCapacityHighGbps+' Gbps. ')+note;
    note+=' '+(r.risks||[]).map(function(x){return riskText[x.code]||x.message;}).join(' ');
    $('notes').textContent=note.trim();
  }
  var statusLabel=function(s){return tx(({healthy:'healthy',warning:'warning',critical:'critical'})[s]||s,({healthy:'正常',warning:'预警',critical:'严重'})[s]||s,({healthy:'normal',warning:'aviso',critical:'crítico'})[s]||s);};
  $('forecastRows').innerHTML=r.projections.map(function(x){return '<tr><td>'+x.year+'</td><td>'+fmt(x.demandGbps)+'</td><td>'+fmt(x.peakDemandGbps)+'</td><td>'+fmt(x.utilizationPct)+'%</td><td>'+fmt(x.headroomGbps)+'</td><td>'+statusLabel(x.status)+'</td></tr>';}).join('');
}finally{window.NELToolInputController.sync?.();}}
var defaults=[];
document.querySelectorAll('#calculator input, #calculator textarea').forEach(function(e){defaults.push({id:e.id,value:e.value});});
document.querySelectorAll('#calculator input').forEach(function(e){e.addEventListener('input',render)});
if($('historyObservations'))$('historyObservations').addEventListener('input',render);
if($('resetBtn'))$('resetBtn').addEventListener('click',function(){defaults.forEach(function(item){if($(item.id))$(item.id).value=item.value;});render();});
$('copy')&&$('copy').addEventListener('click',function(){if(window.lastResult)navigator.clipboard&&navigator.clipboard.writeText(NELToolEngine.toJSON(window.lastResult))});
$('download')&&$('download').addEventListener('click',function(){if(!window.lastResult)return;var b=new Blob([NELToolEngine.toCSV(window.lastResult)],{type:'text/csv'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='capacity-forecast.csv';a.click();URL.revokeObjectURL(a.href)});
$('print')&&$('print').addEventListener('click',function(){if(window.lastResult)print()});
render();
})();
