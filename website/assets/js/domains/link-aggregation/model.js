/** NetEngineerLab | V2.1-Phase2-TopologyV1 | Canonical LAG model */
"use strict";
const topology=require("../../device-topology/topology-model");
function create(input){return topology.aggregate(input)}
function semanticView(m){const x=create(m);return {id:x.id,mode:x.mode,members:[...x.members],description:x.description}}
module.exports=Object.freeze({DOMAIN:"link-aggregation",FAMILY:"l2-lag",MODEL_VERSION:"1.0.0",create,semanticView});
