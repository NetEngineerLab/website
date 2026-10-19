# Standards basis for V1.1.0

Single source of truth: `website/data/optical-standards.js` (version 1.1.0). `js/app.js`
reads the attenuation table, power classes, system reach and status thresholds from it;
it no longer keeps a private preset table.

Default profile: GPON C+ downstream engineering reference.

## Power classes (presets)

ITU-T G.984.2 (08/2019):
- GPON B+ downstream: OLT launch power +1.5…+5 dBm, ONU sensitivity -27 dBm,
  ONU overload -8 dBm, optical path penalty 0.5 dB, maximum ODN loss 28 dB.
- GPON C+ downstream: OLT launch power +3…+7 dBm, ONU sensitivity -30 dBm,
  ONU overload -8 dBm, optical path penalty 1 dB, ODN loss class 17–32 dB.

IEEE 802.3 Clause 60, 1000BASE-PX20 downstream (EPON preset):
- PX20-D launch power +2…+7 dBm; PX20-U sensitivity -24 dBm, overload -3 dBm.
- Power budget 26 dB; channel insertion loss 10–24 dB; 20 km.
- The 2 dB between the power budget and the 24 dB channel insertion loss is applied as the
  optical path penalty, so the tool's standard budget equals the 24 dB class.
- Example topology: 10 km, single 1:16 splitter (the PX20 design point), 6 splices, 4 connectors.
- Class summary: FOA "Specifications for fiber optic networks" (https://thefoa.org/tech/Linkspec.htm).
- Previous preset (Tx +2 dBm, Rx -27 dBm, overload -3 dBm, penalty 0.5 dB = 28.5 dB) mixed a PX20 OLT
  launch power with a PX20+ ONU sensitivity and did not match any single published class; replaced.

IEEE 802.3 Clause 52, 10GBASE-LR (Data center preset):
- Average launch power -8.2…+0.5 dBm; minimum average receive power -14.4 dBm; maximum receive
  power +0.5 dBm; channel insertion loss 6.2 dB; 10 km.
- Penalties are already allocated inside the IEEE budget, so optical path penalty = 0.
- Example topology: 2 km, 2 connectors at 0.75 dB (ANSI/TIA-568.3-D maximum mated pair), no splitters,
  0.5 dB engineering margin. All defaults are exact at 0.01 dB (no display rounding mismatch).
- Overload status threshold 0 dB: IEEE limits receive power to the maximum launch power, so an in-spec
  link cannot overload; only a negative overload margin is flagged.

## Fiber attenuation (planning, cabled)

| Wavelength | Planning value | Fibre datasheet maximum (example: Corning SMF-28 Ultra PI-1424, G.652.D) |
|---|---|---|
| 1310 nm | 0.35 dB/km | 0.32 dB/km |
| 1490 nm | 0.25 dB/km | 0.21 dB/km |
| 1550 nm | 0.20 dB/km | 0.18 dB/km |
| 1625 nm | 0.25 dB/km | 0.20 dB/km |

ITU-T G.652.D gives cable maxima of 0.40 dB/km (1310–1625 nm) and 0.30 dB/km (1550 nm) but no
1490 nm-specific value; 0.25 dB/km keeps 1490 nm between the 1310 and 1550 nm planning values with a
cabling allowance. Previously `app.js` used 0.30 dB/km while the standards file used 0.25 dB/km
(finding NEL-OPB-001); the standards-file value is retained and is now the only value.

## Status policy OPB-STATUS-1.0

- Margins: remaining budget, sensitivity margin (min Tx), overload margin (max Tx).
- Healthy: every margin ≥ its threshold. Caution (≙ "Warning" in the SiteOps quality policy):
  any margin in [0, threshold). Failed (≙ "Critical"): any margin < 0.
- Default thresholds 3 / 3 / 3 dB; 10GBASE-LR uses 3 / 3 / 0 dB.
- The 3 dB boundary is this tool's planning threshold, not a universal standards mandate.

## Maximum distance

maxD = min(system reach of the selected preset, (standard − margin − fixed losses) / attenuation).
GPON/EPON reach 20 km, 10GBASE-LR 10 km. The optical-only value is shown next to a capped result.
Custom inputs are not capped.

## Default worked example (GPON C+, 1:8 × 1:8)

- 10 km fiber at 0.25 dB/km = 2.5 dB.
- Splitters 10.5 + 10.5 = 21.0 dB; 6 splices × 0.10 = 0.6 dB; 4 connectors × 0.30 = 1.2 dB.
- Physical ODN loss = 25.3 dB; with 3 dB engineering margin, design ODN loss = 28.3 dB.
- Exceeds GPON B+ (28 dB); fits GPON C+ (32 dB), leaving 3.7 dB (88.4% used).
- Receive power −22.3 dBm (7.7 dB above sensitivity); at +7 dBm max Tx, 10.3 dB below overload.
- Optical-only maximum distance 24.80 km → shown as 20.00 km (system reach).

Important:
Fiber attenuation, connector loss, splice loss and engineering margin remain editable
engineering assumptions. Final projects must follow device specifications, enterprise standards
and field measurements.
