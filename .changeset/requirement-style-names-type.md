---
"@mmd-toolkit/ast": minor
---

Type `RequirementStyleStatement.names` and
`RequirementClassDefStatement.cssClasses` as `RequirementStyleName`, an
`Identifier` or a `StringLiteral`, instead of a `RequirementIdentifier` or a
`StringLiteral`. Code that narrows those fields to `RequirementIdentifier`
narrows them to `Identifier` instead.
