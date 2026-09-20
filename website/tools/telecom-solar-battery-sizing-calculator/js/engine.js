(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.NELSolarEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const number = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  const nonNegative = (value, fallback = 0) => Math.max(0, number(value, fallback));
  const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

  function calculate(input = {}) {
    const loads = [
      ['telecom', nonNegative(input.telecomKW), clamp(number(input.telecomHours, 24), 0, 24)],
      ['transport', nonNegative(input.transportKW), clamp(number(input.transportHours, 24), 0, 24)],
      ['cooling', nonNegative(input.coolingKW), clamp(number(input.coolingHours, 12), 0, 24)],
      ['aux', nonNegative(input.auxKW), clamp(number(input.auxHours, 24), 0, 24)]
    ];
    const dailyLoad = loads.reduce((sum, [, kw, hours]) => sum + kw * hours, 0);
    const averageLoad = dailyLoad / 24;

    const psh = nonNegative(input.psh);
    const moduleW = nonNegative(input.moduleW);
    const baseEfficiency = clamp(number(input.systemEfficiencyPct, 80), 1, 100) / 100;
    const lossMultiplier = ['dustLossPct', 'tempLossPct', 'wiringLossPct', 'controllerLossPct']
      .reduce((multiplier, key) => multiplier * (1 - clamp(number(input[key], 0), 0, 50) / 100), 1);
    const netEfficiency = baseEfficiency * lossMultiplier;
    const designMargin = 1 + clamp(number(input.designMarginPct, 15), 0, 100) / 100;
    const errors = [];
    if (!(dailyLoad > 0)) errors.push('load');
    if (!(psh > 0)) errors.push('psh');
    if (!(moduleW > 0)) errors.push('moduleW');
    if (!(netEfficiency > 0)) errors.push('efficiency');
    if (errors.length) return { ok: false, errors };

    const requiredPV = dailyLoad * designMargin / (psh * netEfficiency);
    const moduleCount = Math.ceil(requiredPV * 1000 / moduleW);
    const modulesPerString = Math.max(1, Math.floor(number(input.modulesPerString, 1)));
    const strings = Math.ceil(moduleCount / modulesPerString);
    const installedModules = strings * modulesPerString;
    const installedPV = installedModules * moduleW / 1000;

    const backupHours = nonNegative(input.backupHours) + nonNegative(input.rainyDays) * 24;
    const dod = clamp(number(input.dodPct, 80), 1, 100) / 100;
    const batteryEfficiency = clamp(number(input.batteryEfficiencyPct, 92), 1, 100) / 100;
    const batteryMargin = 1 + clamp(number(input.batteryMarginPct, 10), 0, 100) / 100;
    const batteryUsable = averageLoad * backupHours;
    const batteryNominal = batteryUsable / (dod * batteryEfficiency) * batteryMargin;
    const systemVoltage = Math.max(1, number(input.systemVoltage, 48));
    const batteryAh = batteryNominal * 1000 / systemVoltage;

    const dailyGeneration = installedPV * psh * netEfficiency;
    const annualGeneration = dailyGeneration * 365;
    const annualLoad = dailyLoad * 365;
    const balance = dailyGeneration - dailyLoad;
    const coverage = dailyLoad ? Math.min(100, dailyGeneration / dailyLoad * 100) : 0;

    const displaced = Math.min(annualGeneration, annualLoad);
    const tariff = nonNegative(input.tariff);
    const savings = displaced * tariff;
    const pvCost = nonNegative(input.pvCostPerKWp) * installedPV;
    const batteryCost = nonNegative(input.batteryCostPerKWh) * batteryNominal;
    const capex = pvCost + batteryCost;
    const payback = savings > 0 ? capex / savings : null;
    const gridFactor = nonNegative(input.gridCO2KgPerKWh);
    const generatorYield = number(input.generatorKWhPerLiter, 3);
    const generatorKWhPerLiter = generatorYield > 0 ? generatorYield : 3;
    const dieselSaved = displaced / generatorKWhPerLiter;

    const existingPV = nonNegative(input.existingPVKWp);
    const existingBattery = nonNegative(input.existingBatteryKWh);
    const pvGap = requiredPV - existingPV;
    const batteryGap = batteryNominal - existingBattery;
    const surplusContinuousW = Math.max(0, balance / 24 * 1000);
    const scenario = input.scenario === 'offgrid' ? 'offgrid' : 'grid-hybrid';
    const supplement = Math.max(0, dailyLoad - dailyGeneration);
    const co2 = displaced * gridFactor;
    const numericOutputs = [dailyLoad, averageLoad, requiredPV, moduleCount, strings, installedModules, installedPV, batteryUsable, batteryNominal, batteryAh, dailyGeneration, annualGeneration, annualLoad, balance, coverage, displaced, savings, capex, payback ?? 0, co2, dieselSaved, pvGap, batteryGap, surplusContinuousW, supplement];
    if (!numericOutputs.every(Number.isFinite)) return { ok: false, errors: ['range'] };

    return {
      ok: true,
      loads,
      dailyLoad,
      avgLoad: averageLoad,
      netEff: netEfficiency,
      requiredPV,
      moduleCount,
      installedPV,
      modulesPerString,
      strings,
      installedModules,
      backupHours,
      batteryUsable,
      batteryNominal,
      batteryAh,
      dailyGeneration,
      monthlyGeneration: annualGeneration / 12,
      annualGeneration,
      annualLoad,
      balance,
      coverage,
      scenario,
      gridSupplement: scenario === 'grid-hybrid' ? supplement : 0,
      generatorSupplement: scenario === 'offgrid' ? supplement : 0,
      displaced,
      savings,
      capex,
      payback,
      co2,
      dieselSaved,
      existingPV,
      existingBatt: existingBattery,
      pvGap,
      battGap: batteryGap,
      surplusContinuousW
    };
  }

  return { calculate };
});
