# Independent audit

Status: **UNREVIEWED**.

The agent that wrote WF-01 cannot sign this file as an independent PASS. No second agent has reviewed the diff, the optical fixtures, or the browser run.

Local tests and the browser check are evidence for a reviewer. They are not an audit signature.

Blocked from a PASS until a reviewer who did not implement this change checks:

- the six engine calls use the same units as the project fields
- a locked user input cannot be replaced by a derived value without confirmation
- `UNKNOWN` is preserved when no measurement is entered
- the page stays outside the 47-tool registry and outside `sitemap.xml`
- no live device command was added

Do not treat this document as PASS.
