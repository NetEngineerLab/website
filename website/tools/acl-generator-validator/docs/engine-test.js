#!/usr/bin/env node
"use strict";
const assert=require("assert");
const fs=require("fs");
const path=require("path");
const vm=require("vm");
const engine=require("../js/engine");
const irApi=require("../js/ir-adapter");
const parser=require("../js/parsers/cisco-ios");
const generator=require("../js/generators/cisco-ios");
const aclOperators=require("../js/acl-rule-operators");
const fixture=JSON.parse(fs.readFileSync(path.join(__dirname,"fixtures","cisco-ios-golden.json"),"utf8"));
const vendorGolden=JSON.parse(fs.readFileSync(path.join(__dirname,"fixtures","multi-vendor-golden.json"),"utf8"));

assert.deepStrictEqual(engine.supportedVendors,["cisco-ios","huawei-vrp","h3c-comware","juniper-junos"]);
const ir=irApi.createIr({name:fixture.name,rules:fixture.rules});
assert.strictEqual(generator.generate(ir),fixture.configuration);
const parsed=parser.parse(fixture.configuration);
assert.strictEqual(parsed.coverage.complete,true);
assert.strictEqual(parsed.coverage.parsedRules,2);
assert.deepStrictEqual(irApi.semanticView(parsed.ir),irApi.semanticView(ir));
const roundTrip=engine.semanticRoundTrip({vendor:"cisco-ios",ir});
assert.strictEqual(roundTrip.equivalent,true);
assert.strictEqual(roundTrip.configuration,fixture.configuration);
const broad=irApi.createIr({name:"BROAD",rules:[{sequence:10,action:"permit",protocol:"ip",source:{kind:"any"},destination:{kind:"any"},log:false}]});
assert.strictEqual(aclOperators.aclPolicyCheck({rules:broad.rules},{rulesPath:"rules",check:"unrestricted-ip-permit"}).matched,true);
const shadow=irApi.createIr({name:"SHADOW",rules:[{sequence:10,action:"permit",protocol:"ip",source:{kind:"network",address:"10.0.0.0",prefix:8},destination:{kind:"any"},log:false},{sequence:20,action:"deny",protocol:"tcp",source:{kind:"host",address:"10.1.1.1"},destination:{kind:"any"},destinationPort:443,log:false}]});
assert.strictEqual(aclOperators.aclPolicyCheck({rules:shadow.rules},{rulesPath:"rules",check:"shadowed-rule"}).matched,true);
const shadowFinding=aclOperators.aclPolicyCheck({rules:shadow.rules},{rulesPath:"rules",check:"shadowed-rule"});
assert.deepStrictEqual(shadowFinding.evidence.priorSource,{kind:"network",address:"10.0.0.0",prefix:8});
assert.strictEqual(shadowFinding.evidence.priorAction,"permit");
const boundaryShadow=irApi.createIr({name:"BOUNDARY",rules:[{sequence:10,action:"permit",protocol:"ip",source:{kind:"network",address:"10.0.0.0",prefix:9},destination:{kind:"any"},log:false},{sequence:20,action:"deny",protocol:"ip",source:{kind:"host",address:"10.128.0.1"},destination:{kind:"any"},log:false}]});
assert.strictEqual(aclOperators.aclPolicyCheck({rules:boundaryShadow.rules},{rulesPath:"rules",check:"shadowed-rule"}).matched,false);
assert.throws(()=>aclOperators.aclPolicyCheck({rules:[]},{rulesPath:"rules",check:"unknown"}),/Unsupported/);
assert.throws(()=>aclOperators.aclPolicyCheck({rules:[{}]},{rulesPath:"rules",check:"deny-only-acl"}),/invalid_rule/);
const blockedTelnet=irApi.createIr({name:"BLOCKED",rules:[{sequence:10,action:"deny",protocol:"ip",source:{kind:"any"},destination:{kind:"any"},log:false},{sequence:20,action:"permit",protocol:"tcp",source:{kind:"any"},destination:{kind:"any"},destinationPort:23,log:false}]});
assert.strictEqual(aclOperators.aclPolicyCheck({rules:blockedTelnet.rules},{rulesPath:"rules",check:"telnet-permit"}).matched,false);
for(const vendor of ["huawei-vrp","h3c-comware","juniper-junos"]){
  const result=engine.semanticRoundTrip({vendor,ir});
  assert.strictEqual(result.configuration,vendorGolden[vendor],`${vendor} golden fixture`);
  assert.strictEqual(result.equivalent,true,`${vendor} semantic round-trip`);
  assert.strictEqual(result.parsed.coverage.complete,true);
  assert.strictEqual(result.parsed.ir.rules[0].sourceLine>0,true);
}
assert.match(engine.generateConfiguration({vendor:"huawei-vrp",ir}),/^acl name EDGE-IN advance\n/);
assert.match(engine.generateConfiguration({vendor:"h3c-comware",ir}),/^acl advanced name EDGE-IN\n/);
assert.match(engine.generateConfiguration({vendor:"juniper-junos",ir}),/^set firewall family inet filter EDGE-IN term rule-10/);
assert(!engine.generateConfiguration({vendor:"juniper-junos",ir}).includes("protocol ip"));
const junosParser=require("../js/parsers/juniper-junos");
assert.throws(()=>junosParser.parse("set firewall family inet filter X term rule-10 from protocol tcp\nset firewall family inet filter X term rule-10 from protocol udp\nset firewall family inet filter X term rule-10 then accept\n"),/no_supported_rules/);
assert.throws(()=>junosParser.parse("set firewall family inet filter X term rule-10 then accept\nset firewall family inet filter X term rule-10 then discard\n"),/no_supported_rules/);
assert.throws(()=>junosParser.parse("set firewall family inet filter X term rule-20 then accept\nset firewall family inet filter X term rule-10 then discard\n"),/unsupported_term_order/);
assert.throws(()=>junosParser.parse("set firewall family inet filter X term rule-10 from protocol tcp\nset firewall family inet filter X term rule-10 from protocol tcp\nset firewall family inet filter X term rule-10 then accept\n"),/no_supported_rules/);
assert.throws(()=>junosParser.parse("set firewall family inet filter X term rule-10 then accept\nset firewall family inet filter X term rule-10 then accept\n"),/no_supported_rules/);
const zeroIr=irApi.createIr({name:"ZERO",rules:[{...fixture.rules[1],sequence:0}]});
assert.strictEqual(engine.parseConfiguration({vendor:"h3c-comware",input:engine.generateConfiguration({vendor:"h3c-comware",ir:zeroIr})}).ir.rules[0].sequence,0);
const h3cMaxIr=irApi.createIr({name:"MAX",rules:[{...fixture.rules[1],sequence:65534}]});
assert.strictEqual(engine.semanticRoundTrip({vendor:"h3c-comware",ir:h3cMaxIr}).equivalent,true);
const h3cOverIr=irApi.createIr({name:"OVER",rules:[{...fixture.rules[1],sequence:65535}]});
assert.throws(()=>engine.generateConfiguration({vendor:"h3c-comware",ir:h3cOverIr}),/sequence_out_of_range/);
assert.throws(()=>engine.parseConfiguration({vendor:"h3c-comware",input:"acl advanced name OVER\n rule 65535 deny ip source any destination any\nquit\n"}),/no_supported_rules/);
assert.throws(()=>engine.generateConfiguration({vendor:"cisco-ios",ir:zeroIr}),/sequence_must_be_positive/);
assert.throws(()=>engine.parseConfiguration({vendor:"cisco-ios",input:"ip access-list extended ZERO\n 0 deny ip any any\nexit\n"}),/no_supported_rules/);

const browserContext={};
for(const relative of ["js/ir-adapter.js","js/acl-rule-operators.js","js/parsers/vrp-comware-factory.js","js/generators/vrp-comware-factory.js","js/parsers/cisco-ios.js","js/generators/cisco-ios.js","js/parsers/huawei-vrp.js","js/generators/huawei-vrp.js","js/parsers/h3c-comware.js","js/generators/h3c-comware.js","js/parsers/juniper-junos.js","js/generators/juniper-junos.js","js/engine.js"]){
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,"..",relative),"utf8"),browserContext,{filename:relative});
}
assert.deepStrictEqual(Array.from(browserContext.NetEngineerLabAclEngine.supportedVendors),["cisco-ios","huawei-vrp","h3c-comware","juniper-junos"]);

assert.strictEqual(irApi.wildcardToPrefix("0.0.255.255"),16);
assert.strictEqual(irApi.prefixToWildcard(32),"0.0.0.0");
assert.strictEqual(irApi.wildcardToPrefix("0.255.0.255"),null);
assert.throws(()=>parser.parse("ip access-list extended BAD\n permit ip 10.0.0.0 0.255.0.255 any\nexit\n"),/no_supported_rules/);
assert.throws(()=>irApi.createIr({name:"BAD\nend",rules:fixture.rules}),/invalid_acl_name/);
assert.throws(()=>irApi.createIr({name:"DUP",rules:[fixture.rules[0],{...fixture.rules[1],sequence:10}]}),/duplicate_sequence/);
assert.throws(()=>irApi.createIr({name:"PORT",rules:[{...fixture.rules[1],protocol:"icmp",destinationPort:80}]}),/port_requires_tcp_or_udp/);
assert.throws(()=>irApi.createIr({name:"LOG",rules:[{...fixture.rules[0],log:"false"}]}),/invalid_log/);
assert.throws(()=>irApi.createIr({name:"PORTNAME",rules:[{...fixture.rules[0],destinationPort:"definitely-not-ios-service"}]}),/named_ports_not_supported/);
for(const invalid of [
  {name:"SEQ",rule:{...fixture.rules[0],sequence:true},error:/invalid_sequence/},
  {name:"LINE",rule:{...fixture.rules[0],sourceLine:true},error:/invalid_source_line/},
  {name:"ACTION",rule:{...fixture.rules[0],action:["permit"]},error:/invalid_rule/},
  {name:["X"],rule:fixture.rules[0],error:/invalid_ir_parameters/},
  {name:"PREFIX",rule:{...fixture.rules[0],source:{kind:"network",address:"10.0.0.1",prefix:true}},error:/invalid_network/}
])assert.throws(()=>irApi.createIr({name:invalid.name,rules:[invalid.rule]}),invalid.error);
assert.throws(()=>irApi.createIr({name:"LINE",rules:[{...fixture.rules[1],sourceLine:0}]}),/invalid_source_line/);
assert.throws(()=>irApi.createIr({name:"LINE",rules:[{...fixture.rules[1],sourceLine:"9007199254740993"}]}),/invalid_source_line/);
assert.throws(()=>irApi.createIr({name:"LINE",rules:[{...fixture.rules[1],sourceLine:"9".repeat(400)}]}),/invalid_source_line/);
const sorted=irApi.createIr({name:"ORDER",rules:[{...fixture.rules[1],sequence:20},{...fixture.rules[0],sequence:10}]});
assert.deepStrictEqual(sorted.rules.map(rule=>rule.sequence),[10,20]);
assert.throws(()=>engine.parseConfiguration({vendor:"unknown",input:""}),/unsupported_vendor/);
for(const [field,value,error] of [["irVersion","9.9.9",/version/],["domain","bgp",/domain/],["family","ipv6",/family/]]){
  const incompatible={...ir,[field]:value};
  assert.throws(()=>generator.generate(incompatible),error);
  assert.throws(()=>irApi.semanticView(incompatible),error);
  assert.throws(()=>engine.semanticRoundTrip({vendor:"cisco-ios",ir:incompatible}),error);
}

const partial=parser.parse("ip access-list extended EDGE-IN\n remark ticket 123\n 10 permit tcp any host 192.0.2.10 eq 443\n unsupported command $(whoami)\nexit\n");
assert.strictEqual(partial.ir.rules.length,1);
assert.strictEqual(partial.ir.rules[0].sourceLine,3);
assert.strictEqual(partial.coverage.complete,false);
assert.deepStrictEqual(partial.unparsed,[{line:4,text:" unsupported command $(whoami)",code:"unsupported_syntax"}]);
assert(partial.warnings.some(item=>item.code==="remark_ignored"));
assert(partial.warnings.some(item=>item.code==="unsupported_lines_present"));

assert.throws(()=>parser.parse("x".repeat(parser.MAX_INPUT_BYTES+1)),/input_too_large/);
assert.strictEqual(parser.utf8Bytes("网"),3);
assert.throws(()=>parser.parse("!\n".repeat(parser.MAX_LINES)+"!"),/too_many_lines/);
assert.throws(()=>parser.parse("ip access-list extended EMPTY\nexit\n"),/no_supported_rules/);
assert.throws(()=>parser.parse("permit ip any any"),/named_extended_acl_required/);
assert.throws(()=>parser.parse("ip access-list extended X\n 10 permit ip any any\0\n"),/contains_nul/);
assert.throws(()=>parser.parse("ip access-list extended A\n 10 permit ip any any\nexit\nip access-list extended B\n 10 deny ip any any\nexit\n"),/multiple_acls/);
const uppercase=parser.parse("IP ACCESS-LIST EXTENDED CAPS\n 10 PERMIT TCP ANY HOST 192.0.2.1 EQ 443 LOG\nEXIT\n");
assert.strictEqual(uppercase.ir.rules[0].destinationPort,443);
assert.throws(()=>parser.parse("ip access-list extended X\n 20 permit ip any any\n deny ip any any\nexit\n"),/mixed_sequence_style_not_supported/);
assert.throws(()=>parser.parse("ip access-list extended X\n 10 permit tcp any any eq definitely-not-ios-service\nexit\n"),/no_supported_rules/);

const escaped=parser.parse("ip access-list extended SAFE\n 10 deny ip any any\n <script>alert(1)</script>\nexit\n");
assert.strictEqual(escaped.coverage.complete,false);
assert.strictEqual(escaped.unparsed[0].text," <script>alert(1)</script>");
console.log("ACL core tests: PASS (Cisco IOS IR, parser, generator, golden and semantic round-trip).");
