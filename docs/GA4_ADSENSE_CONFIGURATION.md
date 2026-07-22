# GA4 and AdSense configuration

Edit only:

```text
website/data/site-config.json
```

`npm run prepare:launch` automatically generates `website/data/site-config.js`.

## Enable GA4

Replace `G-XXXXXXXXXX` with the real GA4 Measurement ID and set:

```json
"enabled": true
```

Run:

```text
npm run prepare:launch
```

## AdSense

Keep AdSense disabled during the initial content and indexing stage. After approval, replace the client and slot placeholders, then set AdSense `enabled` to `true` in `site-config.json`.

Only the central configuration should be edited. V1.7.1 removes local tool-level analytics loaders during the multilingual build to prevent duplicate tracking.
