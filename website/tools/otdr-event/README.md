# OTDR Event Analyzer V1.0 Professional

## Main functions
- Multi-event dynamic input and deletion
- Primary and secondary wavelength loss comparison
- Splice, connector, mechanical joint, bend, end/break and ghost-event diagnosis
- Event-dead-zone and attenuation-dead-zone checks
- Editable engineering thresholds
- Event position topology
- Severity levels: normal, attention, abnormal and critical
- CSV import, CSV template and CSV export
- Local history, copy result and print/PDF
- Chinese and English pages
- SEO, PWA, GA4 and AdSense placeholders
- Integration files for NetEngineerLab

## V1.0 scope
This release analyzes OTDR event-table data and CSV imports. It does not directly parse SOR files.

## Install directory
`website/tools/otdr-event/`

## CSV headers
```text
distance_km
loss_primary_db
loss_secondary_db
reflectance_db
cumulative_loss_db
manual_type
note
```

`manual_type` supports:

```text
auto
splice
connector
mechanical
bend
end
ghost
unknown
```

## Engineering note
Default thresholds are editable engineering references. Final decisions must use the original trace, test settings, bidirectional results, route information and field inspection.

## V1.0.1 mobile correction
- Fixed CSS Grid min-content overflow that forced mobile pages to render at desktop width.
- Added `min-width: 0` to grid children and table containers.
- Added independent horizontal scrolling for event and result tables.
- Added sticky first columns and table scroll hints.
- Changed mobile summary cards to a compact two-column layout.
- Changed mobile action buttons to a compact two-column layout.
- Reduced mobile header, hero and spacing.
- Updated the Service Worker cache version.
