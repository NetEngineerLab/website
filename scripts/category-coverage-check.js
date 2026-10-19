"use strict";
// Every displayed category count must come from website/data/tools-catalog.json
// and every catalog category must be reachable from each home page and tool
// directory, so the per-category counts always add up to the total tool count.
const fs=require("fs"),path=require("path");
const site=path.join(__dirname,"..","website");
const catalog=JSON.parse(fs.readFileSync(path.join(site,"data","tools-catalog.json"),"utf8"));
const errors=[];
for(const locale of ["en","zh","es"]){
 const tools=catalog.filter(tool=>locale==="en"||tool.translations?.[locale]||(locale==="zh"&&tool.translations?.["zh-CN"]));
 const categories=[...new Set(tools.map(tool=>tool.category))];
 const counts=tools.reduce((map,tool)=>{map[tool.category]=(map[tool.category]||0)+1;return map},{});
 for(const [rel,attr] of [[locale==="en"?"index.html":`${locale}/index.html`,"data-category-link"],[locale==="en"?"tools/index.html":`tools/${locale}/index.html`,"data-filter"]]){
  const html=fs.readFileSync(path.join(site,rel),"utf8");
  const present=new Set([...html.matchAll(new RegExp(`\\b${attr}="([a-z-]+)"`,"g"))].map(match=>match[1]).filter(value=>value!=="all"));
  for(const category of categories)if(!present.has(category))errors.push(`${rel}: no ${attr} for catalog category "${category}"`);
  for(const category of present)if(!counts[category])errors.push(`${rel}: ${attr}="${category}" is not a catalog category`);
  const shown=[...html.matchAll(/data-category-count="([a-z-]+)"[^>]*>(\d+)</g)].filter(match=>match[1]!=="all");
  for(const [,category,value] of shown)if(Number(value)!==(counts[category]||0))errors.push(`${rel}: ${category} shows ${value}, catalog has ${counts[category]||0}`);
  const seen=new Set();let sum=0;for(const [,category,value] of shown)if(!seen.has(category)){seen.add(category);sum+=Number(value)}
  if(shown.length&&sum!==tools.length)errors.push(`${rel}: category counts sum to ${sum}, catalog has ${tools.length} tools`);
 }
}
if(errors.length){console.error("Category coverage FAIL\n"+errors.join("\n"));process.exit(1)}
console.log("Category coverage PASS (home + tool directory, en/zh/es)");
