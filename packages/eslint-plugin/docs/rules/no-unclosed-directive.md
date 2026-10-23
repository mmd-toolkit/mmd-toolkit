# @mmd-toolkit/no-unclosed-directive

Japanese version: [no-unclosed-directive.ja.md](./no-unclosed-directive.ja.md)

Disallow a directive without its closing `}%%`.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

<!-- end auto-generated rule notice -->

A directive whose argument starts with a character that is not a word character,
as the `{` of `%%{init: {"theme": "dark"}}%%`, runs to its `}%%`. Without the
`}%%`, it runs to the end of the text, or to the first U+2028 or U+2029 before
it, and the statements up to there become part of the directive. mermaid.js
still accepts the text when what is left is a valid diagram, so those statements
disappear without an error.

## Rule Details

This rule reports a directive that is not closed by `}%%`. It applies to every
diagram type.

A directive whose argument starts with a word character takes that word alone as
its argument and ends after it and the whitespace after it, and the whitespace
before the argument crosses line breaks: `%%{wrap` at the end of a line takes
the first word of the next line as its argument, and that word disappears. A
`}%%` after other text does not close such a directive either: in
`%%{init: dark foo}%%`, the directive ends after `dark`, and `foo}%%` is read as
text. The rule reports these directives too.

### In each diagram type

What disappears depends on the diagram type.

- flowchart: `flowchart LR`, `%%{init: {"theme": "dark"}}` without the final
  `%%`, and `A-->B` is a flowchart without vertices or links. `A-->B`, `%%{wrap`
  without `}%%`, and `C-->D` lose the vertex `C`, and `-->D` continues the link
  before it: the links are from `A` to `B` and from `B` to `D`.
- sequence: `sequenceDiagram`, `A->>B: one`, `%%{init: {"theme": "dark"}}`
  without the final `%%`, and `B->>A: two` has only the message `one`.
- class: `classDiagram`, `class A`, `%%{init: {"theme": "dark"}}` without the
  final `%%`, and `class B` has only the class `A`.
- state: `stateDiagram-v2`, `A --> B`, `%%{init: {"theme": "dark"}}` without the
  final `%%`, and `B --> C` has only the states `A` and `B` and the transition
  from `A` to `B`.

The examples are flowcharts.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/no-unclosed-directive: error
flowchart LR
  A --> B
  %%{init: {"x": 1}
C-->D
```

```mmd
%% eslint @mmd-toolkit/no-unclosed-directive: error
flowchart LR
  %%{init: {"theme": "dark"}}
A-->B
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/no-unclosed-directive: error
%%{init: {"theme": "dark"}}%%
flowchart LR
  A --> B
```

## Options

This rule has no options.

## Related Rules

- [no-invalid-init-directive](./no-invalid-init-directive.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/no-unclosed-directive.ts)
- [Tests source](../../tests/rules/no-unclosed-directive.test.ts)

<!-- end auto-generated rule resources -->
