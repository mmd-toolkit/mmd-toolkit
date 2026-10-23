# @mmd-toolkit/pie-no-duplicate-label

Japanese version: [pie-no-duplicate-label.ja.md](./pie-no-duplicate-label.ja.md)

Disallow a section whose label an earlier section has, with another value.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A pie chart has one slice for each label. When a later section gives a label
another value, mermaid.js keeps the value of the first section of the label
without an error, and the later value is lost.

## Rule Details

This rule reports a section whose label the first section with that label has
with another value. It applies to `pie`.

After `"A" : 1`, `"A" : 2`, and `"A" : 2`, the slice `A` has the value `1`, and
both later sections are reported. After `"A" : 1`, `"A" : 2`, and `"A" : 1`,
only the second is reported: the third gives the value that the slice has.

A section that gives the value of the first section of its label loses nothing
and is not reported. Values are compared as numbers: `1.2` and `001.20` are one
value, and so are `0` and `-0`. Labels are compared with their whitespace and
their case, and the quotes around them do not count: `'A'` and `"A"` are one
label. Every line break (LF, CRLF, or CR) in a label is read as a line feed.
Labels are otherwise compared as written: mermaid.js decodes escapes, as `\n`,
and turns the quotes of HTML attributes into other characters before it reads a
label, so two labels that differ only in those may be one label for mermaid.js
and two for this rule. A character reference stays as written in a label, so
`"#35;"` and `"#"` are two labels for mermaid.js too.

Give each label one section.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/pie-no-duplicate-label: error
pie
  "Revenue" : 8
  "Revenue" : 3
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/pie-no-duplicate-label: error
pie
  "Revenue" : 8
  "Costs" : 3
```

## Options

This rule has no options.

## Background

[`addSection`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/pie/pieDb.ts#L36-L46)
adds a section only when no section of its label is there.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/pie-no-duplicate-label.ts)
- [Tests source](../../tests/rules/pie-no-duplicate-label.test.ts)

<!-- end auto-generated rule resources -->
