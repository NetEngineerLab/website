# NetEngineerLab V1.9.5 - Brand Favicon and PWA Icons

This release replaces inconsistent or missing browser icons with one NetEngineerLab brand system.

## Browser assets

- `/favicon.ico` for broad browser compatibility
- `/assets/icons/favicon.svg` as the scalable primary icon
- `/assets/icons/favicon-16x16.png` and `/assets/icons/favicon-32x32.png` as PNG fallbacks
- `/assets/icons/apple-touch-icon.png` for Apple home-screen shortcuts

## PWA assets

- `/assets/icons/icon-192.png`
- `/assets/icons/icon-512.png`
- standardized copies inside each tool's existing `images/icons` directory

All HTML pages now declare the same favicon stack. Pages without a tool-specific manifest use `/site.webmanifest`; existing bilingual tool manifests remain unchanged apart from receiving the standardized icon image files.
