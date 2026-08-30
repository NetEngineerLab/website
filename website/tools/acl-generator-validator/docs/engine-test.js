#!/usr/bin/env node
"use strict";
const assert=require("assert");
const fs=require("fs");
const path=require("path");
const engine=require("../js/engine");
const irApi=require("../js/ir-adapter");
const parser=require("../js/parsers/cisco-ios");
const generator=require("../js/generators/cisco-ios");
const fixture=JSON.parse(fs.readFileSync(path.join(__dirname,"fixtures","cisco-ios-golden.json"),"utf8"));

assert.deepStrictEqual(engine.supportedVendors,["cisco-ios"]);
const ir=irApi.createIr({name:fixture.name,rules:fixture.rules});
assert.strictEqual(generator.generate(ir),fixture.configuration);
const parsed=parser.parse(fixture.configuration);
assert.strictEqual(parsed.coverage.complete,true);
assert.strictEqual(parsed.coverage.parsedRules,2);
assert.deepStrictEqual(irApi.semanticView(parsed.ir),irApi.semanticView(ir));
const roundTrip=engine.semanticRoundTrip({vendor:"cisco-ios",ir});
assert.strictEqual(roundTrip.equivalent,true);
assert.strictEqual(roundTrip.configuration,fixture.configuration);

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
