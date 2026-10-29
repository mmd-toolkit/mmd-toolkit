# @mmd-toolkit/pie-no-duplicate-label

Japanese version: [pie-no-duplicate-label.ja.md](./pie-no-duplicate-label.ja.md)

Disallow a section whose label an earlier section has, with another value.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A pie chart has one slice per label. When a later section gives the same label a
different value, mermaid.js keeps the first value without an error and ignores
the later value.

## Rule Details

This rule applies to pie charts (`pie`). It reports a section whose value
differs from the first section with that label. Repeating the first value is not
reported, even after a different value.

Values are compared as numbers, so `1.2` and `001.20` are equal, as are `0` and
`-0`. Labels are case-sensitive, preserve whitespace, ignore surrounding quotes,
and compare LF, CRLF, and CR as LF.

Other label text is compared as written, so escapes such as `\n` and HTML
attribute quotes can differ for this rule although mermaid.js reads them alike.
Character references remain as written for mermaid.js too, so `"#35;"` and `"#"`
are different labels.

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

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/pie-no-duplicate-label.ts)
- [Tests source](../../tests/rules/pie-no-duplicate-label.test.ts)

<!-- end auto-generated rule resources -->
