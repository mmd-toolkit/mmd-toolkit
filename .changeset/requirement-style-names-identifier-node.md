---
"@mmd-toolkit/ast": minor
"@mmd-toolkit/parser": minor
---

Read a name written without quotes after `style` or `classDef` in
`requirementDiagram` as an `Identifier` node, not a `RequirementIdentifier`:
`RequirementStyleStatement.names` and `RequirementClassDefStatement.cssClasses`
now hold `Identifier` or `StringLiteral` nodes, typed `RequirementStyleName`.
Code that reads those fields as `RequirementIdentifier` reads `Identifier`
instead.
