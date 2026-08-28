const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const releaseVersion=fs.readFileSync(path.join(root,"VERSION"),"utf8").trim();

function read(file){
 return fs.readFileSync(path.join(root,file),"utf8");
}

function check(name,fn){
 try{
   fn();
   console.log(`✓ ${name}`);
 }catch(e){
   console.error(`✗ ${name}`);
   throw e;
 }
}


// ===============================
// JS Architecture
// ===============================

const siteJs=read(
"website/assets/js/site.js"
);

check("JS initialization",()=>{

 assert.match(
 siteJs,
 /startNetEngineerLabSite/
 );

 assert.match(
 siteJs,
 /initNetEngineerLabSite/
 );

 assert.match(
 siteJs,
 /NEL_TOOLS/
 );

});


// ===============================
// Tool rendering
// ===============================

check("Tool rendering system",()=>{

 assert.match(
 siteJs,
 /data-tool-grid/
 );

 assert.match(
 siteJs,
 /copyFor/
 );

 assert.match(
 siteJs,
 /tool-card/
 );

});


// ===============================
// Category counter
// ===============================

check("Tool category counter",()=>{

 assert.match(
 siteJs,
 /updateCategoryCounts/
 );

 assert.match(
 siteJs,
 /data-category-count/
 );

});


// ===============================
// HTML
// ===============================

const htmlFiles=[
"website/index.html",
"website/zh/index.html",
"website/tools/index.html",
"website/tools/zh/index.html"
];


for(const file of htmlFiles){

 check(`HTML ${file}`,()=>{

 const html=read(
 file
 );

 assert.match(
 html,
 /<title>/i
 );

assert.match(
 html,
 /name=["']description["']/i
);

 });

}


// ===============================
// CSS
// ===============================

const css=read(
"website/assets/css/site.css"
);


check("CSS core system",()=>{

 assert.match(css,/--primary:/);

 assert.match(css,/--text:/);

 assert.match(css,/--line:/);

 assert.match(css,/@media\(max-width:680px\)/);

});


check("Responsive layout",()=>{

 assert.match(
 css,
 /tool-grid/
 );

 assert.match(
 css,
 /footer-inner/
 );

});


// ===============================
// Mobile
// ===============================

check("Mobile viewport",()=>{

 for(const file of htmlFiles){

 const html=read(file);

 assert.match(
 html,
 /viewport/i
 );

 }

});


// ===============================
// i18n
// ===============================


check("Multi language system",()=>{

 assert.match(
 siteJs,
 /NEL_I18N/
 );

});


// ===============================
// SEO
// ===============================

check("SEO basic",()=>{

 const index=read(
 "website/index.html"
 );

 assert.match(
 index,
 /canonical/i
 );


});


// ===============================
// Tool pages
// ===============================

check("Tool pages",()=>{

 const tool=read(
 "website/tools/fiber-loss/index.html"
 );

 assert.match(
 tool,
 /application\/ld\+json/i
 );

});
// ===============================
// SEO files
// ===============================

check("SEO infrastructure",()=>{

 assert.ok(
 fs.existsSync(
 path.join(root,"website","robots.txt")
 )
 );


 assert.ok(
 fs.existsSync(
 path.join(root,"website","sitemap.xml")
 )
 );


 const sitemap=read(
 "website/sitemap.xml"
 );


 assert.match(
 sitemap,
 /https:\/\/netengineerlab\.com/
 );


});

// ===============================
// Lighthouse policy
// ===============================

check("Lighthouse config",()=>{

 assert.ok(
 fs.existsSync(
 path.join(
 root,
 "tests/lighthouse/production.lighthouserc.json"
 )
 )
 );

});


console.log("");

console.log(
"================================="
);

console.log(
` NetEngineerLab ${releaseVersion} Production Acceptance PASS `
);

console.log(
"================================="
);
