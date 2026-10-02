(function(){
  const form=document.querySelector("[data-home-search]");
  if(!form)return;
  form.addEventListener("submit",function(event){
    event.preventDefault();
    const query=String(new FormData(form).get("q")||"").trim().toLowerCase();
    const tools=Array.isArray(window.NEL_TOOLS)?window.NEL_TOOLS:[];
    const locale=document.querySelector('meta[name="nel-locale"]')?.content||"en";
    const match=query&&tools.find(function(tool){
      const copy=tool.translations?.[locale]||tool.translations?.en||{};
      return tool.status==="active"&&[tool.id,tool.category,copy.name,copy.description].concat(copy.tags||[]).join(" ").toLowerCase().includes(query);
    });
    if(match){const translated=locale!=="en"&&match.translations?.[locale];location.href="/tools/"+match.id+"/"+(translated?locale+"/":"");return;}
    location.href="/tools/"+(locale!=="en"?locale+"/":"")+(query?"?q="+encodeURIComponent(query):"");
  });
})();
