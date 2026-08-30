"use strict";

const fs=require("fs");
const path=require("path");

const runtimeFiles=["normalize.js","evidence.js","evaluate.js","score.js","report.js"];

function rulesRuntimeAssets(siteRoot){
  const bundleDir=path.join(siteRoot,"assets","generated","rules-engine");
  const bundles=fs.existsSync(bundleDir)?fs.readdirSync(bundleDir).filter(name=>/^rules-bundle\.[a-f0-9]{12}\.js$/.test(name)).sort():[];
  if(bundles.length!==1)throw new Error(`Expected exactly one generated rules bundle, found ${bundles.length}`);
  return [
    ...runtimeFiles.map(name=>({sitePath:`assets/js/rules-engine/${name}`,cachePath:`../../assets/js/rules-engine/${name}`})),
    {sitePath:`assets/generated/rules-engine/${bundles[0]}`,cachePath:`../../assets/generated/rules-engine/${bundles[0]}`}
  ];
}

module.exports={rulesRuntimeAssets,runtimeFiles};
