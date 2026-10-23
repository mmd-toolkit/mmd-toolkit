# @mmd-toolkit/sankey-no-invalid-value

Japanese version:
[sankey-no-invalid-value.ja.md](./sankey-no-invalid-value.ja.md)

Disallow a link value that mermaid.js does not read as written.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

The third field of a record is the value of the link, the size of the flow.
mermaid.js reads it as a number from the start of the field and drops the rest
without an error: `"1,234"`, with a thousands separator, is the value 1, and a
field with no number at its start, as `abc`, is no number at all, so the link
has no size.

## Rule Details

This rule reports the value of a link when mermaid.js does not read its whole
text as a number. It applies to `sankey`.

mermaid.js reads the value with the `parseFloat` of JavaScript
([`sankey.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/parser/sankey.jison#L55)),
after the whitespace at its ends is removed: an optional sign, then digits with
an optional decimal point and exponent, or `Infinity`. Text after that number is
dropped, and the rule reports it: `"1,234"` is 1, `1_000` is 1, `1.2.3` is 1.2,
`0x10` is 0, `1 2` is 1, `1e` is 1, and in `5 TWh` the unit is dropped and the
value is 5. A value that does not start with such a number is `NaN`, and the
rule reports it too: `abc`, `infinity` in lower case, and a field of spaces only
before another record. A value in quotes is read in the same way: `" 5 "` is 5,
and `"1,234"` is 1.

A value that mermaid.js reads whole is not reported: `+5`, `.5`, `5.`, `1e3`,
`-2`, `-0`, and `Infinity`. Text after the number that starts with `%%`, as in
`1 %% note`, is not reported: the author marks it as a comment, and mermaid.js
drops it, as the author intended. The value is read as mermaid.js reads it,
without its directives, the comment lines inside a string, and a `;` that the
rule of
[`style` and `classDef` lines](../../../spec/docs/common.md#style-and-classdef-lines)
in the specification ignores: `1%%{init: {}}%%0` is the value 10, and on the
line `a,style:#x,1;2` the value is 12, neither reported, while the string `"1`,
a comment line, and `2"` is 1, a line feed, and `2`, and it is reported; a
directive and spaces only, before another record, are a value of spaces only,
which is `NaN`.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/sankey-no-invalid-value: error
sankey
Electricity grid,Homes,"1,234"
```

```mmd
%% eslint @mmd-toolkit/sankey-no-invalid-value: error
sankey
Electricity grid,Homes,unknown
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/sankey-no-invalid-value: error
sankey
Electricity grid,Homes,1234
```

```mmd
%% eslint @mmd-toolkit/sankey-no-invalid-value: error
sankey
Electricity grid,Homes,113.726 %% estimate
```

## Options

This rule has no options.

## Related Rules

- [journey-no-invalid-score](./journey-no-invalid-score.md)
- [sankey-no-empty-node](./sankey-no-empty-node.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/sankey-no-invalid-value.ts)
- [Tests source](../../tests/rules/sankey-no-invalid-value.test.ts)

<!-- end auto-generated rule resources -->
