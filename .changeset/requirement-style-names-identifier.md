---
"@mmd-toolkit/spec": minor
---

Make a name written without quotes after `style` or `classDef` in
`requirementDiagram` an `Identifier` node instead of a `RequirementIdentifier`,
in `names` of `RequirementStyleStatement` and `cssClasses` of
`RequirementClassDefStatement`, as every other name whose position allows no
whitespace is (`ast/requirement.md`). An implementation that builds a
`RequirementIdentifier` there builds an `Identifier` instead.
