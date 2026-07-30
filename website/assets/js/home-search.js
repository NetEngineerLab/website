(function(){
  const form=document.querySelector("[data-home-search]");
  if(!form)return;
  form.addEventListener("submit",function(event){
    event.preventDefault();
    const query=String(new FormData(form).get("q")||"").trim().toLowerCase();
    const tools=Array.isArray(window.NEL_TOOLS)?window.NEL_TOOLS:[];
    const locale=document.documentElement.dataset.nelLocale==="zh"?"zh":"en";
    const match=tools.find(function(tool){
      const copy=(tool.translations&&tool.translations[locale])||{};
      return [tool.id,tool.category,copy.name,copy.description].concat(copy.tags||[]).join(" ").toLowerCase().includes(query);
    });
    if(match){location.href=locale==="zh"?"../tools/"+match.id+"/zh/":"tools/"+match.id+"/";return;}
    location.href=locale==="zh"?"../tools/zh/":"tools/";
  });
})();
