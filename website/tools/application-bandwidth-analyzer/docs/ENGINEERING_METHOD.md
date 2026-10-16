# Application Bandwidth Analyzer method

This manual snapshot analyzer attributes supplied rates to one link/direction. It does not collect traffic or infer omitted applications. Keep accounting layer, direction and observation windows consistent and avoid double counting. Link capacity is a user supplied comparison boundary, not guaranteed payload throughput. Measured overload is distinct from configured port oversubscription.

The authoritative tool-local ledger is `../data/method-registry.json`. F-UNIT uses only the existing frozen decimal rate factors. F-PERCENT, F-SUM and F-HEADROOM are arithmetic definitions. R-THRESHOLD records explicit operator policy; omission performs no policy assessment. Equality reaches the threshold. Above 100% is retained and current headroom becomes negative. No congestion guarantee follows from a positive headroom.

R-COVERAGE keeps optional metrics null. Partial sums are labeled observed sums with coverage, never complete aggregate measurements. R-PEAK treats summed individual peaks as an envelope because their times may differ. Inconsistent average/current/peak values request review, not silent adjustment. Top current applications retain ties, including all-zero ties.

Safety limits, not engineering thresholds: 1–100 rows, trimmed names 1–120 characters, normalized rates <=1,000,000,000 Mbps, capacity >=0.001 Mbps, snapshot <=131072 UTF-8 bytes. Inputs use finite decimal numeric syntax; negatives and malformed/nonfinite values are rejected. IEEE-754 arithmetic is used without intermediate rounding; display rounds only. Snapshots reject unknown/prototype-shaped keys and unsupported schema. Imports are atomic and invalidate prior outputs; storage failures are visible. Local save is explicit, stores only on this browser, and can be cleared. JSON export is input-only reopen data; CSV includes calculated results, coverage, assumptions and provenance. Spreadsheet formulas in text cells are prefixed with an apostrophe.

CSV import is deferred; no reusable validated dynamic-row importer exists in the inspected shell. The Monitoring Topic remains planned and has no live link. No backend, external API, analytics payload containing application data or automatic persistence is introduced. Generic shell accessibility and shared layout are reused; local adapter owns dynamic actions and stale state because the frozen shell allowlist excludes this tool.

Text numeric inputs are limited to 15 significant decimal digits as a browser arithmetic safety policy.

Nonzero normalized rates must be >=0.000000001 Mbps to prevent loss of meaningful precision in ratios; zero remains valid. Nonzero mantissas that underflow to zero are rejected explicitly.
