---
"@mmd-toolkit/parser": minor
---

Read a name written without quotes after `style` or `classDef` in
`requirementDiagram` as an `Identifier` node instead of a
`RequirementIdentifier`, in `RequirementStyleStatement.names` and
`RequirementClassDefStatement.cssClasses`. Code that reads those fields as
`RequirementIdentifier` nodes reads `Identifier` nodes instead.
