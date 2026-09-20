(() => {
  const defaults = {edgeCount:4,portsPerEdge:24,portGbps:10,utilizationPct:25,concurrencyPct:50,allowancePct:10,edgeUplinks:4,edgeUplinkGbps:100,middleCount:4,upperLinksPerMiddle:2,upperLinkGbps:100,egressLinks:4,egressLinkGbps:100,eastWestPct:50,crossEdgePct:50,eastWestUpperPct:0,targetUtilizationPct:70,annualGrowthPct:15,failedMiddleNodes:1};
  for (const [id,value] of Object.entries(defaults)) { const input=document.getElementById(id); if(input) input.value=value; }
})();
