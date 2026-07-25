(function(){
 const config=window.NEL_I18N||{locales:[{id:"en",folder:"",catalogKey:"en",htmlLang:"en",status:"active",ui:{openTool:"Open tool",planned:"In development"}}],defaultLocale:"en",fallbackLocale:"en"};
 const locales=config.locales||[];
 const metaLocale=document.querySelector('meta[name="nel-locale"]')?.content;
 const htmlLang=(document.documentElement.lang||"").toLowerCase();
 const locale=locales.find(item=>item.id===metaLocale)
  ||locales.find(item=>htmlLang===String(item.htmlLang||"").toLowerCase())
  ||locales.find(item=>htmlLang.startsWith(String(item.htmlLang||"").toLowerCase().split("-")[0]))
  ||locales.find(item=>item.id===config.defaultLocale)
  ||locales[0];
 const fallback=locales.find(item=>item.id===config.fallbackLocale)||locales[0]||locale;
 const ui=Object.assign({openTool:"Open tool",planned:"In development"},fallback?.ui||{},locale?.ui||{});
 const catalogKey=locale?.catalogKey||locale?.id||"en";
 const fallbackKey=fallback?.catalogKey||fallback?.id||"en";
 const tools=(window.NEL_TOOLS||[]).slice().sort((a,b)=>a.order-b.order);
 const normalizedPath=location.pathname.replace(/\/+$/,"/");
 const folderPattern=locales.filter(item=>item.folder).map(item=>item.folder.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|");
 const isToolsDirectory=new RegExp(`/tools/(?:${folderPattern?`(?:${folderPattern})/`:""})?$`).test(normalizedPath);
 function copyFor(tool){
  const translations=tool.translations||{};
  return translations[catalogKey]||translations[locale?.id]||translations[fallbackKey]||translations.en||tool[catalogKey]||tool.en||{};
 }
 function toolUrl(toolId){
  if(!locale?.folder)return isToolsDirectory?`${toolId}/`:`tools/${toolId}/`;
  return isToolsDirectory?`../${toolId}/${locale.folder}/`:`../tools/${toolId}/${locale.folder}/`;
 }
 document.querySelectorAll("[data-tool-grid]").forEach(grid=>{
  const mode=grid.dataset.mode||"all";
  const items=tools.filter(tool=>mode==="active"?tool.status==="active":mode==="planned"?tool.status==="planned":true);
  grid.innerHTML=items.map(tool=>{
   const copy=copyFor(tool);
   const active=tool.status==="active";
   const tags=(copy.tags||[]).map(tag=>`<span>${String(tag)}</span>`).join("");
   return `<article class="tool-card ${active?"":"planned"}" data-category="${tool.category}">
    <div class="tool-icon">${tool.icon}</div><h3>${copy.name||tool.id}</h3><p>${copy.description||""}</p>
    <div class="tool-tags">${tags}</div>
    ${active?`<a class="open" href="${toolUrl(tool.id)}">${ui.openTool}</a>`:`<div class="status">${ui.planned}</div>`}
   </article>`;
  }).join("");
 });
 const filterButtons=[...document.querySelectorAll("[data-filter]")];
 const validFilters=new Set(["all",...tools.map(tool=>tool.category)]);
 function updateCategoryCounts(){
  const counts=tools.reduce((map,tool)=>{map[tool.category]=(map[tool.category]||0)+1;return map},{});
  document.querySelectorAll("[data-category-count]").forEach(node=>{
   const category=node.dataset.categoryCount;
   node.textContent=String(category==="all"?tools.length:(counts[category]||0));
  });
 }
 function applyFilter(category,{updateUrl=true}={}){
  const selected=validFilters.has(category)?category:"all";
  filterButtons.forEach(button=>{
   const active=button.dataset.filter===selected;
   button.classList.toggle("active",active);
   button.setAttribute("aria-pressed",String(active));
  });
  let visible=0;
  document.querySelectorAll(".tool-card[data-category]").forEach(card=>{
   const show=selected==="all"||card.dataset.category===selected;
   card.hidden=!show;
   if(show)visible++;
  });
  const status=document.querySelector("[data-filter-status]");
  if(status){
   const label=filterButtons.find(button=>button.dataset.filter===selected)?.dataset.filterLabel||selected;
   status.textContent=status.dataset.template?.replace("{count}",String(visible)).replace("{category}",label)||`${visible} tools`;
  }
  if(updateUrl&&isToolsDirectory){
   const url=new URL(location.href);
   if(selected==="all")url.searchParams.delete("category");else url.searchParams.set("category",selected);
   history.replaceState(null,"",url.pathname+url.search+url.hash);
  }
 }
 filterButtons.forEach(button=>button.addEventListener("click",()=>applyFilter(button.dataset.filter)));
 document.querySelectorAll("[data-category-link]").forEach(link=>{
  const category=link.dataset.categoryLink;
  if(!validFilters.has(category))link.setAttribute("aria-disabled","true");
 });
 updateCategoryCounts();
 if(isToolsDirectory){
  const requested=new URLSearchParams(location.search).get("category")||location.hash.replace(/^#category-/,"");
  applyFilter(requested||"all",{updateUrl:false});
 }
 document.querySelectorAll("[data-language-menu]").forEach(menu=>{
  const trigger=menu.querySelector(".language-trigger");
  const options=menu.querySelector(".language-options");
  if(!trigger||!options)return;
  const close=()=>{menu.dataset.open="false";trigger.setAttribute("aria-expanded","false");options.hidden=true};
  const open=()=>{menu.dataset.open="true";trigger.setAttribute("aria-expanded","true");options.hidden=false};
  trigger.addEventListener("click",event=>{event.stopPropagation();menu.dataset.open==="true"?close():open()});
  options.addEventListener("click",event=>event.stopPropagation());
  document.addEventListener("click",close);
  document.addEventListener("keydown",event=>{if(event.key==="Escape"){close();trigger.focus()}});
 });
 document.documentElement.dataset.nelLocale=locale?.id||"en";
 document.documentElement.dataset.nelI18nVersion=config.version||"";
})();