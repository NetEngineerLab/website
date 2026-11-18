# Browser QA

Page: `http://127.0.0.1:8765/workflows/ftth-pon/` served from this branch. Not production.

Playwright Chromium, 2026-11-19:

- Example loaded.
- Calculate chain produced fiber physical loss 25.3 dB, splitter remaining 3.7 dB, one PON port, and measured RX `UNKNOWN`.
- Console errors: 0.
- Distance changed from 10 km to 20 km and the chain recalculated. Physical loss became 27.8 dB, receive power -24.8 dBm, budget remaining 1.2 dB. Measured RX stayed `UNKNOWN`.
- Save wrote `nel.ftth.project.v1` in local storage. After the name was changed to Temporary, Restore put back `FTTH example` and distance 20.

Headless Chrome viewport check, no element outside the viewport and no document overflow:

| Width | Overflow px | Element outside |
| ---: | ---: | --- |
| 320 | 0 | no |
| 375 | 0 | no |
| 390 | 0 | no |
| 768 | 0 | no |
| 1440 | 0 | no |

Not run: Edge, a physical phone browser, Chinese and Spanish workflow pages. The workflow page itself is English only.
