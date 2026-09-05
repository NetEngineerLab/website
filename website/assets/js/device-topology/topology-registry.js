/** NetEngineerLab | V2.1-Phase2-TopologyV1 | Verified topology capabilities by device */
"use strict";
const defs={
 "cisco-c9200l-24t-4g":Object.freeze({assembly:"stack",memberMin:1,memberMax:8,slotModel:"fixed",lineCards:false,breakout:false,sourceConfidence:"verified"}),
 "juniper-ex3400-24t":Object.freeze({assembly:"virtual-chassis",memberMin:0,memberMax:9,slotModel:"fixed",lineCards:false,breakout:false,sourceConfidence:"verified"}),
 "huawei-s5735-l24t4s-a1":Object.freeze({assembly:"standalone",memberMin:1,memberMax:1,slotModel:"fixed",lineCards:false,breakout:false,sourceConfidence:"conservative"}),
 "h3c-s5130s-28p-ei":Object.freeze({assembly:"standalone",memberMin:1,memberMax:1,slotModel:"fixed",lineCards:false,breakout:false,sourceConfidence:"conservative"}),
 "arista-7050sx3-48yc8":Object.freeze({assembly:"standalone",memberMin:1,memberMax:1,slotModel:"fixed",lineCards:false,breakout:true,sourceConfidence:"verified"})
};
function get(id){const t=defs[id];if(!t)throw new Error(`unknown_device_topology:${id}`);return t}
module.exports=Object.freeze({ids:Object.freeze(Object.keys(defs)),get,all:Object.freeze({...defs})});
