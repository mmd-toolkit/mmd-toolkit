# mmd/no-ignored-init-directive

Japanese version:
[no-ignored-init-directive.ja.md](./no-ignored-init-directive.ja.md)

Disallow a directive meant to configure the diagram that mermaid.js ignores.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

<!-- end auto-generated rule notice -->

mermaid.js takes configuration from init directives: the directives whose name
ends with `init` or `initialize`, compared exactly. Some directives that are
meant to configure the diagram are ignored without an error, and the diagram is
drawn without the configuration.

## Rule Details

This rule reports either of these directives. It applies to every diagram type.

- An init directive whose argument is not valid JSON once every `'` is read as
  `"`. A comma after the last entry, as in `%%{init: {"theme": "dark",}}%%`, is
  enough. mermaid.js then ignores every init directive of the text, also the
  valid ones before it.
- A directive whose name differs from an init name only in case, such as `Init`
  or `INIT`.

### In each diagram type

What the rule finds in a diagram type is added here when that diagram type is
supported.

- flowchart: The setting `"flowchart": {"inheritDir": true}` gives a subgraph
  the direction of the diagram. In such a directive with a comma after the last
  entry, or named `INIT`, the subgraph gets no direction.

The examples are flowcharts.

Examples of **incorrect** code for this rule:

```mmd
%%{init: {"flowchart": {"inheritDir": true},}}%%
flowchart LR
  subgraph S
    A
  end
```

```mmd
%%{INIT: {"flowchart": {"inheritDir": true}}}%%
flowchart LR
  subgraph S
    A
  end
```

Examples of **correct** code for this rule:

```mmd
%%{init: {"flowchart": {"inheritDir": true}}}%%
flowchart LR
  subgraph S
    A
  end
```

## Options

This rule has no options.

## Related Rules

- [no-unclosed-directive](./no-unclosed-directive.md)

## Implementation Notes

The rule is not implemented yet. These notes are for implementing it.

### How the tree shows it

A directive of `Root.directives` that is either of these:

- An init directive whose argument is not valid JSON once every `'` is read as
  `"`. The tree does not parse arguments: the `value` of a directive is the text
  between `%%{` and `}%%`, its name included. The rule takes the argument from
  it by the rule of the specification's common.md (Where a directive is) and
  parses it as JSON.
- A directive that is not an init directive, whose `name` ends with `init` or
  `initialize` when case is ignored.

This rule reads embedded data that the parser keeps as written and does not read
([`embedded-data-opaque`](../../../spec/docs/known-divergences.md#embedded-data-opaque)
in the specification's known divergences). That is not a second lexing of the
diagram, but it repeats, on the side of the rule, two steps that the parser
leaves out: taking the argument out of the directive, and parsing it as JSON.
Also, mermaid.js finds the directives that configure the diagram with a scan of
its own, which differs from `Root.directives` in rare cases (The configuration
scan in common.md): a directive on a line that starts with `%%}%%` configures
nothing, but it is in `Root.directives`. The rule follows `Root.directives`.

### Fixtures

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
