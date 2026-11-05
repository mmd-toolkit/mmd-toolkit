---
"@mmd-toolkit/eslint-plugin": minor
---

Follow mermaid.js 12.3.0, which draws the agentflow shape `[/…/]` as its own
shape instead of a rounded rectangle. `agentflow-no-redefined-vertex` now
reports `C[/API/]` written after `connector C[API]` as replacing the shape of
`C`, and its messages and those of `agentflow-no-redefined-connector` name the
drawn shape where they named the kind.
