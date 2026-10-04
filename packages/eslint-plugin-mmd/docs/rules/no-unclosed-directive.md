# mmd/no-unclosed-directive

Japanese version: [no-unclosed-directive.ja.md](./no-unclosed-directive.ja.md)

Disallow a directive without its closing `}%%`.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

<!-- end auto-generated rule notice -->

A directive whose argument is not a single word runs to its `}%%`. Without the
`}%%`, it runs to the end of the text, and everything after it becomes part of
the directive. mermaid.js still accepts the text when what is left before the
directive is a valid diagram, so the statements after it disappear without an
error.

## Rule Details

This rule reports a directive that is not closed by `}%%`. It applies to every
diagram type.

A directive whose argument is a single word ends after that word and the
whitespace after it, and the whitespace before the argument crosses line breaks:
`%%{wrap` at the end of a line takes the first word of the next line as its
argument, and that word disappears. The rule reports such a directive too.

### In each diagram type

What the rule finds in a diagram type is added here when that diagram type is
supported.

- flowchart: `flowchart LR`, `%%{init: {"theme": "dark"}}` without the final
  `%%`, and `A-->B` is a flowchart without vertices or links. `A-->B`, `%%{wrap`
  without `}%%`, and `C-->D` lose the vertex `C`, and `-->D` continues the link
  before it: the links are from `A` to `B` and from `B` to `D`.

The examples are flowcharts.

Examples of **incorrect** code for this rule:

```mmd
%% eslint mmd/no-unclosed-directive: error
flowchart LR
  A --> B
  %%{init: {"x": 1}
C-->D
```

```mmd
%% eslint mmd/no-unclosed-directive: error
flowchart LR
  %%{init: {"theme": "dark"}}
A-->B
```

Examples of **correct** code for this rule:

```mmd
%% eslint mmd/no-unclosed-directive: error
%%{init: {"theme": "dark"}}%%
flowchart LR
  A --> B
```

## Options

This rule has no options.

## Related Rules

- [no-ignored-init-directive](./no-ignored-init-directive.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/no-unclosed-directive.ts)
- [Tests source](../../tests/rules/no-unclosed-directive.test.ts)

<!-- end auto-generated rule resources -->
