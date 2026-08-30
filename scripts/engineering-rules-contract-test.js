#!/usr/bin/env node
"use strict";

const assert=require("assert");
const fs=require("fs");
const os=require("os");
const path=require("path");

const root=path.resolve(__dirname,"..");
const dataRoot=path.join(root,"website","data","engineering-rules");
const read=name=>JSON.parse(fs.readFileSync(path.join(dataRoot,name),"utf8"));
const schema=read("rule-schema.json");
const policy=read("severity-policy.json");
const registry=read("operator-registry.json");
const severitySet=["CRITICAL","HIGH","MEDIUM","INFO"];
const dimensionSet=new Set(policy.dimensions);
const operatorById=new Map(registry.operators.map(operator=>[operator.id,operator]));
const executableKey=/^(?:code|expression|script|function|javascript)$/i;
const semver=/^\d+\.\d+\.\d+$/;
const policyVersion=/^\d+\.\d+\.\d+(?:-[a-z0-9-]+)?$/;

function fail(message){throw new Error(message)}
function requireText(value,label){if(typeof value!=="string"||!value.trim())fail(`${label} is required`)}
function unique(values,label){if(new Set(values).size!==values.length)fail(`${label} must be unique`)}
function exactKeys(value,allowed,label){
  for(const key of Object.keys(value||{}))if(!allowed.includes(key))fail(`${label}.${key} is not allowed`);
}
function rejectExecutable(value,trail="rule"){
  if(!value||typeof value!=="object")return;
  for(const [key,child] of Object.entries(value)){
    if(executableKey.test(key))fail(`${trail}.${key} executable content is forbidden`);
    rejectExecutable(child,`${trail}.${key}`);
  }
}

function resolveRef(ref){
  if(!ref.startsWith("#/$defs/"))fail(`unsupported schema reference: ${ref}`);
  const resolved=schema.$defs[ref.slice("#/$defs/".length)];
  if(!resolved)fail(`missing schema reference: ${ref}`);
  return resolved;
}

function validateAgainstSchema(value,definition,trail="rule"){
  if(definition.$ref)return validateAgainstSchema(value,resolveRef(definition.$ref),trail);
  if("const" in definition&&value!==definition.const)fail(`${trail} must equal ${definition.const}`);
  if(definition.enum&&!definition.enum.includes(value))fail(`${trail} is outside the allowed enum`);
  if(definition.type==="object"){
    if(!value||typeof value!=="object"||Array.isArray(value))fail(`${trail} must be an object`);
    for(const key of definition.required||[])if(!(key in value))fail(`${trail}.${key} is required`);
    if(definition.additionalProperties===false){
      for(const key of Object.keys(value))if(!definition.properties?.[key])fail(`${trail}.${key} is not allowed`);
    }
    for(const [key,child] of Object.entries(value))if(definition.properties?.[key])validateAgainstSchema(child,definition.properties[key],`${trail}.${key}`);
  }else if(definition.type==="array"){
    if(!Array.isArray(value))fail(`${trail} must be an array`);
    if(definition.minItems&&value.length<definition.minItems)fail(`${trail} needs at least ${definition.minItems} item(s)`);
    if(definition.uniqueItems)unique(value.map(item=>JSON.stringify(item)),trail);
    if(definition.items)value.forEach((item,index)=>validateAgainstSchema(item,definition.items,`${trail}[${index}]`));
  }else if(definition.type==="string"){
    if(typeof value!=="string")fail(`${trail} must be a string`);
    if(definition.minLength&&value.length<definition.minLength)fail(`${trail} is too short`);
    if(definition.pattern&&!new RegExp(definition.pattern).test(value))fail(`${trail} does not match its pattern`);
    if(definition.format==="uri"){
      let url;try{url=new URL(value)}catch{fail(`${trail} must be a valid URI`)}
      if(!url.hostname)fail(`${trail} must include a hostname`);
    }
  }
  return true;
}

function validateParamType(value,type,label){
  if(type==="any")return;
  if(type==="array"&&!Array.isArray(value))fail(`${label} must be an array`);
  if(type==="number"&&(typeof value!=="number"||!Number.isFinite(value)))fail(`${label} must be a finite number`);
  if(type==="string"&&(typeof value!=="string"||!value))fail(`${label} must be a non-empty string`);
}

function validateOperatorRegistry(value){
  exactKeys(value,["schemaVersion","runtimeApiVersion","operators"],"operatorRegistry");
  if(value.schemaVersion!=="1.0.0")fail("operatorRegistry.schemaVersion must be 1.0.0");
  if(value.runtimeApiVersion!=="1.0.0")fail("operatorRegistry.runtimeApiVersion must be 1.0.0");
  if(!Array.isArray(value.operators)||!value.operators.length)fail("operatorRegistry.operators are required");
  unique(value.operators.map(operator=>operator.id),"operator ids");
  for(const operator of value.operators){
    exactKeys(operator,["id","version","domains","params"],"operator");
    if(!/^[a-z][a-z0-9-]*$/.test(operator.id||""))fail("operator id is invalid");
    if(!semver.test(operator.version||""))fail("operator version is invalid");
    if(!Array.isArray(operator.domains)||!operator.domains.length)fail("operator domains are required");
    unique(operator.domains,"operator domains");
    for(const domain of operator.domains)if(domain!=="shared"&&!/^[a-z][a-z0-9-]*$/.test(domain))fail(`invalid operator domain: ${domain}`);
    if(!operator.params||typeof operator.params!=="object"||Array.isArray(operator.params)||!Object.keys(operator.params).length)fail("operator params are required");
    for(const [name,type] of Object.entries(operator.params)){
      if(!/^[a-z][a-zA-Z0-9]*$/.test(name))fail(`invalid operator param: ${name}`);
      if(!["any","array","number","string"].includes(type))fail(`invalid operator param type: ${type}`);
    }
    rejectExecutable(operator,"operator");
  }
  return true;
}

function validateSeverityPolicy(value){
  exactKeys(value,["schemaVersion","runtimeApiVersion","scorePolicyVersion","passThreshold","displayPassFail","baseScore","dimensions","severities","rootCauseDeduplication","disclaimer"],"severityPolicy");
  if(value.schemaVersion!=="1.0.0")fail("severityPolicy.schemaVersion must be 1.0.0");
  if(value.runtimeApiVersion!=="1.0.0")fail("severityPolicy.runtimeApiVersion must be 1.0.0");
  if(!policyVersion.test(value.scorePolicyVersion||""))fail("scorePolicyVersion is invalid");
  if(value.passThreshold!==null||value.displayPassFail!==false)fail("precalibration policy must disable PASS/FAIL");
  if(!Number.isFinite(value.baseScore)||value.baseScore<=0||value.baseScore>100)fail("baseScore is invalid");
  if(!Array.isArray(value.dimensions)||!value.dimensions.length)fail("score dimensions are required");
  unique(value.dimensions,"score dimensions");
  for(const dimension of value.dimensions)if(!["connectivity","security","reliability","manageability","best-practice"].includes(dimension))fail(`invalid score dimension: ${dimension}`);
  if(value.dimensions.length!==5)fail("all five score dimensions are required");
  exactKeys(value.severities,severitySet,"severities");
  for(const severity of severitySet){
    const config=value.severities[severity];exactKeys(config,["deduction","overallScoreCap"],`severities.${severity}`);
    if(!Number.isFinite(config.deduction)||config.deduction<0||config.deduction>value.baseScore)fail(`${severity} deduction is invalid`);
    if(config.overallScoreCap!==null&&(!Number.isFinite(config.overallScoreCap)||config.overallScoreCap<0||config.overallScoreCap>value.baseScore))fail(`${severity} cap is invalid`);
  }
  if(value.severities.INFO.deduction!==0)fail("INFO deduction must be zero");
  if(!Number.isFinite(value.severities.CRITICAL.overallScoreCap))fail("CRITICAL cap is required");
  if(!(value.severities.CRITICAL.deduction>=value.severities.HIGH.deduction&&value.severities.HIGH.deduction>=value.severities.MEDIUM.deduction&&value.severities.MEDIUM.deduction>=value.severities.INFO.deduction))fail("severity deductions must be ordered CRITICAL >= HIGH >= MEDIUM >= INFO");
  exactKeys(value.rootCauseDeduplication,["enabled","maximumSameRootCauseDeduction"],"rootCauseDeduplication");
  if(value.rootCauseDeduplication.enabled!==true||!Number.isFinite(value.rootCauseDeduplication.maximumSameRootCauseDeduction)||value.rootCauseDeduplication.maximumSameRootCauseDeduction<0||value.rootCauseDeduplication.maximumSameRootCauseDeduction>value.baseScore)fail("root-cause deduplication policy is invalid");
  exactKeys(value.disclaimer,["en","zh"],"disclaimer");requireText(value.disclaimer.en,"disclaimer.en");requireText(value.disclaimer.zh,"disclaimer.zh");
  return true;
}

function validateRule(rule){
  validateAgainstSchema(rule,schema);
  rejectExecutable(rule);
  exactKeys(rule,["schemaVersion","id","version","status","domain","category","severity","dimensions","condition","content","vendors","sourceTypes","evidence","references","fixtures"],"rule");
  if(rule.schemaVersion!=="1.0.0")fail("schemaVersion must be 1.0.0");
  if(!/^[A-Z][A-Z0-9]*-\d{3}$/.test(rule.id||""))fail("rule id is invalid");
  if(!semver.test(rule.version||""))fail("rule version is invalid");
  if(!["draft","active","deprecated"].includes(rule.status))fail("rule status is invalid");
  if(!/^[a-z][a-z0-9-]*$/.test(rule.domain||""))fail("rule domain is invalid");
  if(!/^[a-z][a-z0-9-]*$/.test(rule.category||""))fail("rule category is invalid");
  if(!severitySet.includes(rule.severity))fail("rule severity is invalid");
  if(!Array.isArray(rule.dimensions)||!rule.dimensions.length)fail("rule dimensions are required");
  unique(rule.dimensions,"rule dimensions");
  for(const dimension of rule.dimensions)if(!dimensionSet.has(dimension))fail(`unknown score dimension: ${dimension}`);
  exactKeys(rule.condition,["operator","params"],"condition");
  const operator=operatorById.get(rule.condition?.operator);
  if(!operator)fail(`unregistered operator: ${rule.condition?.operator}`);
  if(!operator.domains.includes("shared")&&!operator.domains.includes(rule.domain))fail(`${operator.id} is not allowed for domain ${rule.domain}`);
  if(!rule.condition?.params||typeof rule.condition.params!=="object"||Array.isArray(rule.condition.params))fail("condition params object is required");
  exactKeys(rule.condition.params,Object.keys(operator.params),"condition.params");
  for(const [param,type] of Object.entries(operator.params)){
    if(!(param in rule.condition.params))fail(`condition.params.${param} is required by ${operator.id}`);
    validateParamType(rule.condition.params[param],type,`condition.params.${param}`);
  }
  for(const locale of ["en","zh"]){
    exactKeys(rule.content?.[locale],["title","finding","reason","recommendation","fieldExperienceNote"],`content.${locale}`);
    for(const field of ["title","finding","reason","recommendation","fieldExperienceNote"]){
      requireText(rule.content?.[locale]?.[field],`content.${locale}.${field}`);
    }
  }
  for(const field of ["vendors","sourceTypes"]){
    if(!Array.isArray(rule[field])||!rule[field].length)fail(`${field} are required`);
    unique(rule[field],field);
  }
  for(const vendor of rule.vendors)if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(vendor))fail(`invalid vendor: ${vendor}`);
  for(const sourceType of rule.sourceTypes)if(!["parameters","configuration","command-output"].includes(sourceType))fail(`invalid source type: ${sourceType}`);
  exactKeys(rule.evidence,["selector","fields","redactions"],"evidence");
  requireText(rule.evidence?.selector,"evidence.selector");
  if(!Array.isArray(rule.evidence?.fields)||!rule.evidence.fields.length)fail("evidence.fields are required");
  if(!Array.isArray(rule.evidence?.redactions))fail("evidence.redactions array is required");
  unique(rule.evidence.fields,"evidence.fields");unique(rule.evidence.redactions,"evidence.redactions");
  exactKeys(rule.fixtures,["positive","negative","boundary"],"fixtures");
  for(const kind of ["positive","negative","boundary"]){
    if(!Array.isArray(rule.fixtures?.[kind])||!rule.fixtures[kind].length)fail(`fixtures.${kind} are required`);
    unique(rule.fixtures[kind],`fixtures.${kind}`);
    for(const fixture of rule.fixtures[kind])if(!/^[a-zA-Z0-9][a-zA-Z0-9._/-]*\.json$/.test(fixture))fail(`invalid fixture path: ${fixture}`);
  }
  for(const reference of rule.references||[]){
    exactKeys(reference,["title","url"],"reference");
    requireText(reference.title,"reference.title");
    let url;try{url=new URL(reference.url)}catch{fail("reference.url must be a valid URI")}
    if(url.protocol!=="https:"||!url.hostname)fail("reference.url must use https with a hostname");
  }
  return true;
}

assert.deepStrictEqual(schema.properties.severity.enum,severitySet);
assert.strictEqual(schema.additionalProperties,false);
assert(validateOperatorRegistry(registry));
assert(validateSeverityPolicy(policy));
assert.deepStrictEqual(Object.keys(policy.severities),severitySet);
assert.strictEqual(policy.passThreshold,null);
assert.strictEqual(policy.displayPassFail,false);
assert.strictEqual(policy.severities.INFO.deduction,0);
assert(policy.severities.CRITICAL.overallScoreCap<policy.baseScore);
unique(registry.operators.map(operator=>operator.id),"operator ids");
for(const mutate of [
  value=>{value.schemaVersion="2.0.0"},value=>{value.operators[0].domains=[]},value=>{value.operators[0].params.path="script"}
]){const invalid=structuredClone(registry);mutate(invalid);assert.throws(()=>validateOperatorRegistry(invalid))}
for(const mutate of [
  value=>{value.schemaVersion="2.0.0"},value=>{value.baseScore=NaN},value=>{value.severities.INFO.deduction=1},
  value=>{value.rootCauseDeduplication.maximumSameRootCauseDeduction=-1},value=>{value.disclaimer.zh=""},
  value=>{value.dimensions=["security"]},value=>{value.rootCauseDeduplication.maximumSameRootCauseDeduction=value.baseScore+1},
  value=>{value.severities.MEDIUM.deduction=value.severities.HIGH.deduction+1}
]){const invalid=structuredClone(policy);mutate(invalid);assert.throws(()=>validateSeverityPolicy(invalid))}

const validRule={
  schemaVersion:"1.0.0",id:"ACL-001",version:"1.0.0",status:"draft",domain:"acl",category:"security",severity:"HIGH",
  dimensions:["security"],condition:{operator:"equals",params:{path:"rules.0.action",value:"permit"}},
  content:{
    en:{title:"Unrestricted permit",finding:"An unrestricted permit was found.",reason:"It expands access.",recommendation:"Restrict the source and destination.",fieldExperienceNote:"Confirm required management sources before narrowing access."},
    zh:{title:"无限制放行",finding:"发现无限制放行规则。",reason:"该规则扩大了访问范围。",recommendation:"限制源地址和目的地址。",fieldExperienceNote:"收紧访问前先确认必要的管理源地址。"}
  },
  vendors:["cisco-ios"],sourceTypes:["configuration"],
  evidence:{selector:"acl-rule",fields:["sourceLine","action","source","destination"],redactions:[]},
  references:[{title:"Vendor ACL guide",url:"https://example.com/acl"}],
  fixtures:{positive:["acl-001-positive.json"],negative:["acl-001-negative.json"],boundary:["acl-001-boundary.json"]}
};
assert(validateRule(validRule));
for(const mutate of [
  rule=>{rule.severity="LOW"},
  rule=>{rule.condition.operator="eval-expression"},
  rule=>{rule.condition.expression="input === true"},
  rule=>{rule.content.zh.fieldExperienceNote=""},
  rule=>{rule.fixtures.boundary=[]},
  rule=>{rule.condition.params={path:"rules.0.action"}},
  rule=>{rule.unreviewed=true},
  rule=>{delete rule.references},
  rule=>{rule.references=[]},
  rule=>{rule.content.fr=structuredClone(rule.content.en)},
  rule=>{rule.evidence.selector="bad selector"},
  rule=>{rule.evidence.fields=[""]},
  rule=>{rule.references[0].url="https://"},
  rule=>{rule.fixtures.positive=["a/../../secret.json"]},
  rule=>{rule.condition.params.scriptBody="alert(1)"},
  rule=>{rule.vendors=["Bad Vendor"]},
  rule=>{rule.sourceTypes=["raw"]},
  rule=>{rule.content.en.fieldExperienceNote=""}
]){
  const invalid=structuredClone(validRule);mutate(invalid);assert.throws(()=>validateRule(invalid));
}
const wrongDomainOperator=structuredClone(validRule);wrongDomainOperator.domain="ospf";wrongDomainOperator.condition={operator:"acl-shadowed-by-prior-rule",params:{rulesPath:"rules"}};
assert.throws(()=>validateRule(wrongDomainOperator),/not allowed for domain/);
const validAclOperator=structuredClone(validRule);validAclOperator.condition={operator:"acl-shadowed-by-prior-rule",params:{rulesPath:"rules"}};
assert(validateRule(validAclOperator));
function discoverRules(directory){
  const requireFixtures=path.resolve(directory)===path.resolve(dataRoot);
  const discovered=[];
  for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
  if(!entry.isDirectory())continue;
  const rulesFile=path.join(directory,entry.name,"rules.json");
  if(!fs.existsSync(rulesFile))continue;
  const rules=JSON.parse(fs.readFileSync(rulesFile,"utf8"));
  if(!Array.isArray(rules))fail(`${entry.name}/rules.json must be an array`);
  for(const rule of rules){
    validateRule(rule);
    if(rule.domain!==entry.name)fail(`${entry.name}/rules.json contains domain ${rule.domain}`);
    if(requireFixtures)for(const kind of ["positive","negative","boundary"])for(const fixture of rule.fixtures[kind])if(!fs.existsSync(path.join(directory,entry.name,fixture)))fail(`${rule.id} fixture is missing: ${fixture}`);
    discovered.push({domain:entry.name,id:rule.id});
  }
  }
  unique(discovered.map(rule=>rule.id),"production rule ids");
  return discovered;
}
const productionRules=discoverRules(dataRoot).length;

const duplicateRoot=fs.mkdtempSync(path.join(os.tmpdir(),"nel-rule-contract-"));
try{
  for(const domain of ["acl","ospf"]){
    const directory=path.join(duplicateRoot,domain);fs.mkdirSync(directory);
    const rule=structuredClone(validRule);rule.domain=domain;
    fs.writeFileSync(path.join(directory,"rules.json"),JSON.stringify([rule]));
  }
  assert.throws(()=>discoverRules(duplicateRoot),/production rule ids must be unique/);
}finally{fs.rmSync(duplicateRoot,{recursive:true,force:true})}

const mismatchRoot=fs.mkdtempSync(path.join(os.tmpdir(),"nel-rule-domain-"));
try{
  const directory=path.join(mismatchRoot,"ospf");fs.mkdirSync(directory);
  fs.writeFileSync(path.join(directory,"rules.json"),JSON.stringify([validRule]));
  assert.throws(()=>discoverRules(mismatchRoot),/contains domain acl/);
}finally{fs.rmSync(mismatchRoot,{recursive:true,force:true})}

console.log(`Engineering rules contract tests: PASS (${registry.operators.length} operators; ${productionRules} production rules).`);

module.exports={discoverRules,validateAgainstSchema,validateOperatorRegistry,validateRule,validateSeverityPolicy,rejectExecutable};
