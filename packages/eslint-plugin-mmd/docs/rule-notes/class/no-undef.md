# mmd/class/no-undef

Japanese version: [no-undef.ja.md](./no-undef.ja.md)

Notes for implementing the rule
[mmd/class/no-undef](../../rules/class/no-undef.md).

The rule is not implemented yet. These notes are for implementing it.

## How the tree shows it

A name that is the id of no class of the diagram, among these: the `id` of a
`ClassStyleStatement`; each name of the `value` of the `idList` of a
`ClassCssClassStatement`, split at every `,`; and the `class` of a
`ClassLinkStatement`, a `ClassCallbackStatement`, or a `ClassNoteStatement`. The
ids of the classes are taken from the `name` of every `ClassDeclaration`, the
`class` of every `ClassMemberStatement`, and the `from` and `to` of every
`ClassRelationStatement`, also in the `body` of a `ClassNamespaceStatement`.

Two steps go beyond the tree, and repeat derivations of the Db (see Building the
summary from the tree in the tests package's docs/db-from-tree/class.md). The id
of a class is none of the fields of the class name (`prefix`, `name`, and
`generic`): it is the text of the class name, its prefix included, before its
first `~`. And a relation with a lollipop at one end only, as in `A ()-- B`,
makes the class at that end an interface, so it adds only the class at the other
end. Splitting the list of `cssClass` at `,` is a reading of the value.

## Fixtures

The behavior of mermaid.js that the rule relies on is recorded in these fixtures
of `@mmd-toolkit/tests`:

- `class/db-style-undefined-class`
- `class/db-css-class-undefined-class`
- `class/db-click-undefined-class`
- `class/db-link-undefined-class`
- `class/db-callback-undefined-class`
- `class/db-note-for-undefined-class`
- `class/db-css-class-list-space`
- `class/db-style-spaces`
- `class/spec-class-diagram-bd134b38`
- `class/gram-member-statement`
- `class/db-namespace-nested`
- `class/docs-syntax-class-diagram-bc06236e`
- `flowchart/db-style-unknown-vertex`
