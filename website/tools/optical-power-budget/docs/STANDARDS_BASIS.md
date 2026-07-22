# Standards basis for V1.0.2

Default profile: GPON C+ downstream engineering reference.

ITU-T G.984.2 (08/2019):
- GPON B+ downstream: minimum OLT launch power +1.5 dBm, ONU sensitivity -27 dBm,
  ONU overload -8 dBm, optical path penalty 0.5 dB, maximum ODN loss 28 dB.
- GPON C+ downstream: minimum OLT launch power +3 dBm, ONU sensitivity -30 dBm,
  ONU overload -8 dBm, optical path penalty 1 dB, ODN loss class 17–32 dB.

Why the default changed:
- Primary splitter 1:8 + secondary splitter 1:8 = total 1:64.
- Typical configured splitter insertion loss: 10.5 + 10.5 = 21.0 dB.
- 10 km fiber at 0.30 dB/km = 3.0 dB.
- 6 splices at 0.10 dB = 0.6 dB.
- 4 connectors at 0.30 dB = 1.2 dB.
- Physical ODN loss = 25.8 dB.
- With 3 dB engineering margin, design ODN loss = 28.8 dB.
- This exceeds GPON B+ maximum ODN loss of 28 dB.
- It fits GPON C+ maximum ODN loss of 32 dB, leaving 3.2 dB.

Important:
Fiber attenuation, connector loss, splice loss and engineering margin remain editable
engineering assumptions. Final projects must follow device specifications, enterprise standards
and field measurements.
