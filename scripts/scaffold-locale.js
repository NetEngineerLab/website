#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path"),cp=require("child_process");
const root=path.resolve(__dirname,".."),site=path.join(root,"website");
const configPath=path.join(site,"data/locales.json");
const config=JSON.parse(fs.readFileSync(configPath,"utf8"));
const args=process.argv.slice(2);
const localeId=args[args.indexOf("--locale")+1];
const overwrite=args.includes("--overwrite");
if(!localeId||!args.includes("--locale")){
 console.error("Usage: node scripts/scaffold-locale.js --locale es [--overwrite]");
 process.exit(2);
}
const locale=config.locales.find(x=>x.id===localeId);
if(!locale){console.error(`Locale not found in locales.json: ${localeId}`);process.exit(2)}
if(!locale.folder){console.error("The default locale cannot be scaffolded.");process.exit(2)}
const copied=[];
function copyDraft(sourceRel,targetRel){
 const source=path.join(site,sourceRel),target=path.join(site,targetRel);
 if(!fs.existsSync(source))return;
 if(fs.existsSync(target)&&!overwrite)return;
 fs.mkdirSync(path.dirname(target),{recursive:true});
 let html=fs.readFileSync(source,"utf8");
 html=html.replace(/<html\b([^>]*)>/i,(m,a)=>`<html${a.replace(/\s+lang=["'][^"']*["']/i,"")} lang="${locale.htmlLang}" dir="${locale.direction||"ltr"}">`);
 if(/<meta\b[^>]*name=["']robots["'][^>]*>/i.test(html))html=html.replace(/<meta\b[^>]*name=["']robots["'][^>]*>/i,'<meta name="robots" content="noindex,follow">');
 else html=html.replace(/<\/head>/i,'<meta name="robots" content="noindex,follow">\n</head>');
 html=html.replace(/<\/head>/i,`<meta name="nel-translation-status" content="draft">\n</head>`);
 fs.writeFileSync(target,html,"utf8");copied.push(targetRel);
}
copyDraft("index.html",`${locale.folder}/index.html`);
for(const page of ["about","contact","privacy","terms"])copyDraft(`${page}/index.html`,`${locale.folder}/${page}/index.html`);
copyDraft("404.html",`${locale.folder}/404.html`);
copyDraft("tools/index.html",`tools/${locale.folder}/index.html`);
const tools=JSON.parse(fs.readFileSync(path.join(site,"data/tools-catalog.json"),"utf8"));
for(const tool of tools.filter(x=>x.status==="active"))copyDraft(`tools/${tool.id}/index.html`,`tools/${tool.id}/${locale.folder}/index.html`);
console.log(`Created ${copied.length} noindex draft pages for ${locale.id}.`);
console.log("Translate every visible string, add tool-catalog translations, then change locale status to active and run the build and validation scripts.");
cp.execFileSync(process.execPath,[path.join(__dirname,"build-multilingual.js")],{stdio:"inherit"});
