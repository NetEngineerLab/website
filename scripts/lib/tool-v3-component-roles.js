'use strict';
// Semantic ownership only. Visual declarations come from the shared OPB components.
module.exports={
 readoutRoles:require('./tool-v3-readout-roles.json'),
 resultPanelOwners:{'network-risk-hidden-hazard-assessment-generator':[{tag:'aside',className:'card',ariaLive:'polite'}]},
 stepNavigation:['oob-network-design-planner','data-center-architecture-decision-workshop'],
 primaryActions:['calculateBtn','calculate','analyzeBtn','analyze','generate'],
 professionalOutputs:{"data-center-architecture-decision-workshop":{"regions":["#comparison"],"groups":["#comparison .candidate"],"roles":{"secondary":["#comparison .candidate > .score"],"groupHeading":["#comparison > h3","#comparison .candidate > h3"]}},"network-asset-lifecycle-tracker":{"regions":["#metrics","#cumulative"],"groups":["#metrics .metric","#cumulative .metric"],"roles":{"secondary":["#metrics .metric > strong","#cumulative .metric > strong"],"label":["#metrics .metric > span","#cumulative .metric > span"]}},"oob-network-design-planner":{"regions":["#result"],"groups":["#metrics .metric"],"roles":{"secondary":["#metrics .metric:nth-child(-n+2) > strong"],"explanation":["#metrics .metric:nth-child(3) > strong"],"label":["#metrics .metric > span"]}},"network-change-planner-mop-generator":{"regions":["#riskCard"],"groups":["#riskCard .metric"],"roles":{"secondary":["#riskCard .metric b"],"label":["#riskCard .metric span"]}}},
 ghostActions:['addEquipmentBtn','addLayerBtn','addCustom'],
 ghostGroups:['project-actions','acl-actions','actions','erc-actions','editor-buttons'],
 compactHistory:['clearHistoryBtn','clearHistory','btn-clear-history'],
 numericHeadlines:['perRank','totalTime','residualCd','cdMargin','perHop','totalDelay','effectiveMtu','measuredResult','meanDgd','dgdMargin','effectiveMax','totalA','totalB'],
 durationHeadlines:['runtimeValue','transferHeadline'],
 ratioHeadlines:['ratioResult'],
 modeHeadlines:['transferHeadline','requiredHeadline','capacityHeadline','volumeHeadline'],
 additionalHeadlines:{'fiber-loss':['designLoss'],'network-rack-power-cooling-calculator':['designKW'],'poe-power-budget-calculator':['required'],'sfp-qsfp-compatibility-calculator':['rxPower']},
 opticalLossHeadlines:['maxEventLoss','estimatedPrimaryLoss','estimatedSecondaryLoss'],
 readoutRows:'.result-box,.metric-card > div,.metric,.kv',
 identifierTools:['subnet-calculator','ipv6-nat-planner'],
 secondaryCounts:['eventCount','abnormalCount','criticalCount','reflectiveCount','deadZoneCount'],
 identifierOutputs:{'subnet-calculator':['#ipv4Results .result-hero strong','#ipv4Results .metric strong','#ipv6Results strong','#vlsmResults strong']},
 dynamicGhostSmall:{'48v-battery-runtime':['.remove-row'],'acl-generator-validator':['.rule-row > button'],'application-bandwidth-analyzer':['.abw-row > button'],'network-asset-lifecycle-tracker':['.asset-editor > button'],'network-risk-hidden-hazard-assessment-generator':['.item-head > .remove'],'otdr-event':['.row-actions > .delete-row']},
 presetSelectors:{'data-center-network-convergence-fabric-capacity-planner':['.presets > button'],'network-risk-hidden-hazard-assessment-generator':['.preset-bar > button:not(#addCustom)'],'fiber-latency-calculator':['.scenario-grid .scenario-card','.presets-mobile > button']},
 domainSpecial:{'48v-battery-runtime':{'.advanced-toggle':'disclosure'},'otdr-event':{'.topology .event-marker':'diagram-event-selector'}}
};
