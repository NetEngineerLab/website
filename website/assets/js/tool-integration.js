(function(){
 const standards=window.NEL_OPTICAL_STANDARDS;
 document.documentElement.dataset.nelIntegrated="true";
 if(standards)document.documentElement.dataset.nelStandardsVersion=standards.version;
 const path=location.pathname.replace(/\/+$/,"");
 const parts=path.split("/").filter(Boolean);
 const toolIndex=parts.indexOf("tools");
 const slug=toolIndex>=0?parts[toolIndex+1]:"";
 if(slug)document.documentElement.dataset.nelTool=slug;
})();