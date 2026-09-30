# Network risk and hidden-hazard assessment method

## Purpose and assessment states

This tool creates a traceable engineering screening record for five categories: environment, power and electrical safety, fiber/ODF, equipment and ports, and resilience/monitoring. Each finding is explicitly `normal`, `abnormal`, `N/A`, or `unverified`. An unverified item is unknown and can never support a safe conclusion. N/A should be selected only with a documented scope reason outside this model.

## Numeric planning score

Only abnormal findings receive a numeric score. The base is `likelihood (1–5) × impact (1–5) × 4`. It is adjusted and clamped to 0–100:

`score = clamp(base × (0.75 + exposure% / 200) × (1 - control effectiveness% / 200) × (0.5 + certainty% / 200), 0, 100)`

Bands are low below 20, medium from 20, high from 40, and critical from 64. The score is a prioritization aid rather than an actuarial probability, safety integrity level, or compliance result. Exposure and control reduce or raise prioritization but cannot turn an unverified observation into a verified safe state.

## Critical-rule override

A critical override applies only when both a stable `ruleId` and an explicit `criticalTrigger` are present. It forces the level to critical regardless of numeric score. The exported result shows both values so a reviewer can identify the policy or site rule and the observed trigger. Teams must maintain their own approved rule library; the example electrical rule is illustrative, not a universal legal threshold.

## Before, after and accountability

The current observation forms the Before state. The proposed or verified remediation forms the After state. Risk reduction compares aggregate abnormal Before and After scores. Every top risk can carry an owner, due date, remediation status and review date. A planned After state does not prove closure: the review date and supporting evidence must confirm it.

## Reference framework and limits

- [ISO 31000:2018](https://www.iso.org/standard/65694.html) provides general risk-management principles.
- [NIST SP 800-30 Rev. 1](https://csrc.nist.gov/pubs/sp/800/30/r1/final) provides guidance for conducting information-system risk assessments.
- [OSHA hazard identification](https://www.osha.gov/safety-management/hazard-identification) describes proactive workplace hazard identification and assessment practices. [OSHA electrical safety](https://www.osha.gov/electrical/) and [29 CFR 1910.335](https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.335) provide electrical-safety context.

These sources inform the workflow only. The tool does not claim certification or compliance with ISO, NIST, OSHA, electrical codes, occupational-safety law, or local requirements. Qualified personnel must confirm scope, evidence, thresholds, controls and applicable obligations. Reports include the originating website URL and this boundary so exports retain their context.
