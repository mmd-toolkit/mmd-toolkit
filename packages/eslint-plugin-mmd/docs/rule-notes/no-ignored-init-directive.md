# mmd/no-ignored-init-directive

Japanese version:
[no-ignored-init-directive.ja.md](./no-ignored-init-directive.ja.md)

Notes for implementing the rule
[mmd/no-ignored-init-directive](../rules/no-ignored-init-directive.md).

The rule is not implemented yet. These notes are for implementing it.

## How the tree shows it

A directive of `Root.directives` that is either of these:

- An init directive whose argument is not valid JSON once every `'` is read as
  `"`. The tree does not parse arguments: the `value` of a directive is the text
  between `%%{` and `}%%`, its name included. The rule takes the argument from
  it by the rule of the specification's common.md (Where a directive is) and
  parses it as JSON.
- A directive that is not an init directive, whose `name` ends with `init` or
  `initialize` when case is ignored.

This rule reads embedded data that the parser keeps as written and does not read
([`embedded-data-opaque`](../../../spec/docs/known-divergences/embedded-data-opaque.md)
in the specification's known divergences). That is not a second lexing of the
diagram, but it repeats, on the side of the rule, two steps that the parser
leaves out: taking the argument out of the directive, and parsing it as JSON.
Also, mermaid.js finds the directives that configure the diagram with a scan of
its own, which differs from `Root.directives` in rare cases (The configuration
scan in common.md): a directive on a line that starts with `%%}%%` configures
nothing, but it is in `Root.directives`. The rule follows `Root.directives`.

## Fixtures

The behavior of mermaid.js that the rule relies on is recorded in these fixtures
of `@mmd-toolkit/tests`:

- `common/config-init-trailing-comma`
- `common/config-init-name-uppercase`
- `common/config-init-name-capitalized`
- `flowchart/config-inherit-dir-directive`
- `common/directive-bad-json`
- `common/config-bad-json-drops-other-inits`
- `common/directive-single-quotes`
- `common/config-closing-marker-line`
- `sequence/config-init-trailing-comma`
- `sequence/docs-config-directives-a481990f`
- `class/config-init-trailing-comma`
- `state/config-init-trailing-comma`
- `common/directive-init-theme`

The items of In each diagram type rest on these: flowchart on
`flowchart/config-inherit-dir-directive`; sequence on
`sequence/config-init-trailing-comma`, where the participants and the message
are not wrapped, while `sequence/docs-config-directives-a481990f`, without the
comma, wraps them; class and state on `class/config-init-trailing-comma` and
`state/config-init-trailing-comma`, which record no settings that take effect
(`embedded` is null), while `common/directive-init-theme` records the theme of a
directive that takes effect.
