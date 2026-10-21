# @mmd-toolkit/xychart-no-invalid-orientation

Japanese version:
[xychart-no-invalid-orientation.ja.md](./xychart-no-invalid-orientation.ja.md)

Disallow an orientation that mermaid.js does not read as `horizontal`.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

The word after `xychart` turns the chart: `xychart horizontal` draws it
horizontal. mermaid.js reads the word in any case, but turns the chart only for
`horizontal` in lower case: `xychart Horizontal` is drawn vertical, without an
error.

## Rule Details

This rule reports the orientation of a header that is `horizontal` in another
case, as `Horizontal` or `HORIZONTAL`. It applies to `xychart`.

mermaid.js takes any word other than `horizontal` as vertical, so the chart is
vertical. The word of the header also wins over the setting
`xyChart.chartOrientation`: with that setting `horizontal` in the frontmatter,
`xychart Horizontal` is still vertical. The orientation of a second header is
read in the same way and is reported too. `vertical` in any case, as `VERTICAL`,
gives the vertical chart that it names, and it is not reported.

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
