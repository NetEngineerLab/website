# UI Component Specification

## Shared page frame

All Golden pages load `design-tokens.css` before `site-shell.css`. Header and footer use the shared templates; their inner containers both use `min(100% - 2 × gutter, --nel-content-max)`. Page-specific CSS may style the content but must not redefine shell width, nav breakpoint, or global tokens.

## Navigation and return paths

Desktop navigation keeps four primary destinations: Home, Tools, Guides, and Topics, plus language selection. Guides and Topics may land on the matching homepage section while no dedicated directory route exists. Mobile navigation uses one menu button with `aria-controls` and synchronized `aria-expanded`; links remain normal anchors in a two-column panel. Breadcrumbs link every ancestor and label the current page with `aria-current="page"`.

## Homepage

Keep a concise value statement, supporting line, primary search, and no more than two hero actions. Tool, workflow, topic, and resource grids use the same surface, border, spacing, and focus/hover contract. Existing search and category behavior stays intact.

## Topic/category hub

Use a compact hero and one primary tool CTA, then Featured Tools, All Tools, Learning Path, planning resources, cases/diagrams, and related topics where source content exists. Do not fabricate empty content. Directory filters retain current query/data behavior and expose an empty-result message with a reset action.

## Calculator/tool page

Use breadcrumb, title/purpose/status, input panel, primary calculate action, and result summary. Desktop may use input/result columns when both remain legible; at 800px and below stack inputs before results. Keep labels, units, and help text attached to their controls. Result UI prioritizes the headline outcome, then secondary metrics, interpretation, warnings, and method.

## Article/tutorial page

Use the same shell and width tokens as other pages. Breadcrumb hierarchy is Home → Guides → Article, with Guides linking to the homepage Guides section until a guide directory route exists. The article template contains a readable title/lead, one primary related-tool CTA, article body with contextual internal links, an optional contents rail, and related resources. Editorial workflow for existing articles is: preserve original meaning → add contextual internal links → select one primary CTA → adapt language/platform formats → write publishing recommendation → prepare promotion plan. Keep publishing and promotion instructions out of the reader-facing technical article unless they help engineers use the content.

## Footer and states

Footer outer background spans the viewport; its inner width and horizontal alignment match the header. Empty, loading, error, warning, and success feedback use shared tokens and accessible live-region semantics. Preserve existing runtime messages and focus behavior.
