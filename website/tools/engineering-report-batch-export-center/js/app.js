(function(){"use strict";var E=window.NELReportCenter;if(!E)return;var zh=window.NEL_LANG==="zh",tx=function(en,cn){return zh?cn:en;},$=function(id){return document.getElementById(id);},records=[];
window.NELToolInputController={managesValidation:true,isValid:function(){return records.length>0;},resultActions:"#deliverables button",inputControls:"#project,#owner,#reportTitle"};
function feedback(message,error){var el=$("feedback");el.textContent=message;el.classList.toggle("error",!!error);}
function update(){window.lastResult=records.length?bundle():null;var body=$("records");body.replaceChildren();records.forEach(function(r,i){var tr=document.createElement("tr");[r.tool,r.status,r.generatedAt||"—",r.sourceUrl||"—"].forEach(function(v,index){var td=document.createElement("td");if(index!==1)td.setAttribute("data-nel-locale-value","");td.textContent=v;tr.appendChild(td);});var action=document.createElement("td"),button=document.createElement("button");button.type="button";button.className="btn btn-ghost btn-sm";button.textContent=tx("Remove","移除");button.addEventListener("click",function(){records.splice(i,1);update();});action.appendChild(button);tr.appendChild(action);body.appendChild(tr);});$("count").textContent=String(records.length);$("deliverables").hidden=false;document.querySelectorAll("#deliverables button").forEach(b=>b.disabled=records.length===0);window.NELToolInputController.sync?.();if(!records.length){const tr=document.createElement("tr"),td=document.createElement("td");td.colSpan=5;td.textContent=tx("No results. Import a file, paste results, or load the sample package.","暂无结果。请导入文件、粘贴结果或加载示例包。");tr.append(td);body.append(tr);}}
function addData(source,name){var added=E.parseImport(source,name);records=records.concat(added);update();feedback(tx("Added "+added.length+" result(s).","已添加 "+added.length+" 条结果。"));}
$("importText").addEventListener("click",function(){try{addData($("sourceText").value,"pasted.json");$("sourceText").value="";}catch(e){feedback(e.message,true);}});
$("files").addEventListener("change",async function(event){var files=Array.from(event.target.files||[]);for(var file of files){try{addData(await file.text(),file.name);}catch(e){feedback(file.name+": "+e.message,true);}}event.target.value="";});
function bundle(){return E.createBundle(records,{project:$("project").value,owner:$("owner").value,locale:zh?"zh":document.documentElement.lang.startsWith("es")?"es":"en",title:$("reportTitle").value});}
function humanMarkdown(kind){
 var original=bundle();if(window.NEL_LANG!=="es")return E.toMarkdown(original,kind);
 // Mask user-origin data before translating only the generated document frame.
 var values=[],mask=function(value){var key="\uE000NELREPORT"+values.length+"\uE001";values.push(E.md(value));return key;};
 var display=Object.assign({},original,{title:mask(original.title),project:mask(original.project||"—"),owner:mask(original.owner||"—"),generatedAt:mask(original.generatedAt),records:original.records.map(function(r){return Object.assign({},r,{tool:mask(r.tool),status:mask(r.status),sourceUrl:r.sourceUrl?mask(r.sourceUrl):"",generatedAt:r.generatedAt?mask(r.generatedAt):"",inputs:mask(E.summarize(r.inputs)),result:mask(E.summarize(r.result))});})});
 var text=E.toMarkdown(display,kind);
 var frame={
 "Purpose and scope":"Propósito y alcance",
 "Consolidate the imported analysis outputs below. Confirm dependencies, maintenance window and approvals before execution.":"Consolide los resultados de análisis importados que aparecen a continuación. Confirme las dependencias, la ventana de mantenimiento y las aprobaciones antes de ejecutar.",
 "Pre-change review":"Revisión previa al cambio",
 "Confirm source data, target scope and current-state evidence":"Confirme los datos de origen, el alcance objetivo y las evidencias del estado actual",
 "Review all BLOCK / FAIL / CRITICAL findings and resolve or accept them":"Revise todos los hallazgos BLOCK / FAIL / CRITICAL y resuélvalos o acéptelos",
 "Confirm maintenance window, stakeholders and rollback owner":"Confirme la ventana de mantenimiento, las partes interesadas y el responsable del rollback",
 "Execution sequence":"Secuencia de ejecución",
 "Post-change verification":"Verificación posterior al cambio",
 "Run the source tool's recommended validation and capture evidence":"Ejecute la validación recomendada por la herramienta de origen y registre las evidencias",
 "Confirm service health and update the register":"Confirme el estado del servicio y actualice el registro",
 "Use the source tool's approved rollback procedure if a trigger is met":"Utilice el procedimiento de rollback aprobado de la herramienta de origen si se cumple una condición de activación",
 "Rollback":"Rollback",
 "| Check item | Source / evidence | Status | Reviewer note |":"| Elemento de revisión | Fuente / evidencia | Estado | Nota del revisor |",
 "Inputs and calculation assumptions verified":"Entradas e hipótesis de cálculo verificadas",
 "Applicable engineering standards checked":"Normas de ingeniería aplicables comprobadas",
 "Approval and evidence recorded":"Aprobación y evidencias registradas",
 "| Tool / result | Status | Generated | Source |":"| Herramienta / resultado | Estado | Generado | Fuente |",
 "Owner:":"Responsable:","Input summary:":"Resumen de entradas:","Result summary:":"Resumen de resultados:"
 };
 Object.keys(frame).forEach(function(key){text=text.split(key).join(frame[key]);});
 text=window.NELToolLocale?.report(text)||text;
 return text.replace(/\uE000NELREPORT(\d+)\uE001/g,function(_,index){return values[Number(index)];});
}
function download(name,content,type){var a=document.createElement("a"),url=URL.createObjectURL(new Blob([content],{type:type}));a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1000);}
$("exportReport").addEventListener("click",function(){try{download("engineering-report.md",humanMarkdown("report"),"text/markdown;charset=utf-8");feedback(tx("Engineering report exported.","工程报告已导出。"));}catch(e){feedback(e.message,true);}});
[["exportMop","mop","engineering-mop.md"],["exportChecklist","checklist","engineering-checklist.md"],["exportLedger","ledger","engineering-results-register.md"]].forEach(function(item){$(item[0]).addEventListener("click",function(){try{download(item[2],humanMarkdown(item[1]),"text/markdown;charset=utf-8");feedback(tx("Deliverable exported.","交付文档已导出。"));}catch(e){feedback(e.message,true);}});});
$("exportJson").addEventListener("click",function(){try{download("engineering-results-bundle.json",JSON.stringify(bundle(),null,2),"application/json;charset=utf-8");feedback(tx("JSON bundle exported.","JSON 汇总包已导出。"));}catch(e){feedback(e.message,true);}});
$("exportCsv").addEventListener("click",function(){try{download("engineering-results-register.csv","\ufeff"+E.toCsv(bundle()),"text/csv;charset=utf-8");feedback(tx("CSV register exported.","CSV 台账已导出。"));}catch(e){feedback(e.message,true);}});
$("print").addEventListener("click",function(){try{var preview=$("printDocument");preview.textContent=humanMarkdown("report");document.body.classList.add("print-report");window.print();setTimeout(function(){document.body.classList.remove("print-report");},500);}catch(e){feedback(e.message,true);}});
$("sample").addEventListener("click",function(){addData(JSON.stringify({results:[{tool:"Network Capacity Forecast Planner",website:"/tools/network-capacity-forecast-planner/",status:"WARNING",inputs:{capacityGbps:100,utilizationPct:68,annualGrowthPct:20},result:{monthsToThreshold:4,requiredCapacityGbps:126,additionalCapacityGbps:26}},{tool:"Network Risk Assessment",status:"REVIEW",result:{riskLevel:"MEDIUM",recommendation:"Confirm redundant path and maintenance window"}}]}),"sample.json");});
$("clear").addEventListener("click",function(){records=[];update();feedback(tx("Workspace cleared.","工作区已清空。"));});for(const id of ["project","owner","reportTitle"])$(id).addEventListener("input",()=>{window.lastResult=records.length?bundle():null;});const note=document.createElement("p");note.id="bwExampleNote";note.className="note-box";note.textContent=document.documentElement.lang.startsWith("zh")?"默认加载原有工程示例包，非真实项目结果；请导入实际资料。":document.documentElement.lang.startsWith("es")?"Se carga el paquete de ejemplo de ingeniería existente; no son resultados de un proyecto real. Importe los datos reales.":"The existing engineering sample package is loaded by default, not real project results. Import actual data.";$("sample").parentElement.after(note);update();$("sample").click();})();
