#!/usr/bin/env node
"use strict";

const assert=require("assert");
const engine=require("../js/engine.js");

const base={
  distance:100,
  distanceUnit:"km",
  routeFactor:1,
  groupIndex:1.468,
  equipmentCount:0,
  equipmentDelay:0,
  packetSize:0,
  linkRate:10,
  serializationHops:0
};

const plain=engine.calculate(base);
assert.equal(plain.ok,true);
assert.equal(plain.oneWayText,"489.67 µs");
assert.equal(plain.rttText,"979.34 µs");
assert.equal(engine.formatDelay(plain.usPerKm).value,4.9);
assert.ok(Math.abs(plain.usPerKm-4.8967)<0.0001);

const dci=engine.calculate({
  ...base,
  distance:80,
  equipmentCount:2,
  equipmentDelay:5,
  packetSize:1500,
  linkRate:10,
  serializationHops:1
});
assert.equal(dci.ok,true);
assert.equal(dci.oneWayText,"402.94 µs");
assert.equal(dci.rttText,"805.88 µs");
assert.ok(Math.abs(dci.equipmentUs-10)<1e-9);
assert.ok(Math.abs(dci.serializationUs-1.2)<1e-9);

const longHaul=engine.calculate({
  ...base,
  distance:1000,
  routeFactor:1.3
});
assert.equal(longHaul.ok,true);
assert.equal(longHaul.oneWayText,"6.366 ms");
assert.equal(longHaul.rttText,"12.731 ms");
assert.ok(Math.abs(longHaul.fiberKm-1300)<1e-9);

assert.equal(engine.calculate({...base,distance:0}).ok,false);
assert.equal(engine.calculate({...base,distance:-5}).ok,false);
assert.equal(engine.calculate({...base,routeFactor:0.9}).ok,false);
assert.equal(engine.calculate({...base,groupIndex:0.99}).ok,false);
assert.equal(engine.calculate({...base,groupIndex:1.61}).ok,false);
assert.equal(engine.calculate({...base,linkRate:0}).ok,false);
assert.equal(engine.calculate({...base,equipmentCount:1.5}).ok,false);
assert.equal(engine.calculate({...base,distanceUnit:"ft"}).ok,false);
assert.equal(engine.calculate(null).ok,false);

const miles=engine.calculate({...base,distance:1,distanceUnit:"mi"});
assert.equal(miles.ok,true);
assert.ok(Math.abs(miles.distanceKm-1.609344)<1e-9);

const meters=engine.calculate({...base,distance:1000,distanceUnit:"m"});
assert.ok(Math.abs(meters.fiberKm-1)<1e-9);

assert.ok(Math.abs(engine.VACUUM_US_PER_KM-3.33564)<0.00001);
assert.ok(Math.abs(engine.calculate(base).speedKmS-204218)<1);

console.log("Fiber latency engine tests: PASS");
