# @mmd-toolkit/xychart-no-invalid-orientation

Japanese version:
[xychart-no-invalid-orientation.ja.md](./xychart-no-invalid-orientation.ja.md)

Disallow an orientation that mermaid.js does not read as `horizontal`.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

🔧 This rule is automatically fixable by the
[`--fix` CLI option](https://eslint.org/docs/latest/use/command-line-interface#--fix).

<!-- end auto-generated rule notice -->

The word after `xychart` or `xychart-beta` turns the chart: `xychart horizontal`
draws it horizontal. mermaid.js reads the word in any case, but turns the chart
only for `horizontal` in lower case: `xychart Horizontal` is drawn vertical,
without an error.

## Rule Details

This rule applies to XY charts (`xychart` and `xychart-beta`). It reports
`horizontal` in another case in a header, such as `Horizontal` or `HORIZONTAL`,
including in a second header. The header overrides `xyChart.chartOrientation`,
so `xychart Horizontal` is reported even when that setting is `horizontal` in
the frontmatter. `vertical` in any case is not reported because it gives the
vertical chart that it names.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/xychart-no-invalid-orientation: error
xychart Horizontal
  line [1, 2]
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/xychart-no-invalid-orientation: error
xychart horizontal
  line [1, 2]
```

## Options

This rule has no options.

## Related Rules

- [gantt-no-invalid-tag](./gantt-no-invalid-tag.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/xychart-no-invalid-orientation.ts)
- [Tests source](../../tests/rules/xychart-no-invalid-orientation.test.ts)

<!-- end auto-generated rule resources -->
