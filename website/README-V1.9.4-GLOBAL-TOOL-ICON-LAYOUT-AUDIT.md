# NetEngineerLab V1.9.4

## Scope

Global tool-page icon and two-column layout compatibility audit based on the deployed V1.9.3-01 baseline.

## Updated tools

- 48V Battery Runtime Calculator
- Bandwidth Calculator
- MTU Calculator
- ONU Receive Power Calculator
- Optical Power Budget Calculator
- OTDR Event Analyzer
- PON Distance Calculator
- PON Splitter Loss Calculator
- Subnet Calculator

Both English and Chinese pages were updated for every listed tool.

## Compatibility changes

- Font-dependent button symbols were replaced with accessible inline SVG icons.
- Every action icon has explicit `18 x 18` dimensions and current-color strokes.
- A local `.action-icon` rule prevents global SVG selectors from enlarging icons.
- Tool CSS references use the V1.9.4 cache key.
- Desktop two-column tool grids align cards at the top and no longer force equal-height panels.

## Safety boundaries

- Calculator JavaScript and formulas were not modified.
- Data files and tool catalogs were not modified.
- Sitemap, robots.txt and llms.txt were not modified.
- Existing SEO, FAQ and WebApplication structured data were not modified.
