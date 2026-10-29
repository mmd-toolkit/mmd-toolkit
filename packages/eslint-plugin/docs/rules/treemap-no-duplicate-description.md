# @mmd-toolkit/treemap-no-duplicate-description

Japanese version:
[treemap-no-duplicate-description.ja.md](./treemap-no-duplicate-description.ja.md)

Disallow an `accDescr` that replaces the description set before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A treemap has one accessible description, which `accDescr` sets, on a line or in
a block. A later `accDescr` replaces the description set before it without an
error, and the earlier description is lost.

## Rule Details

This rule applies to treemaps (`treemap` and `treemap-beta`). It reports an
`accDescr` that changes a nonempty description set by the preceding `accDescr`.
The line and block forms are compared with each other. An empty or
whitespace-only `accDescr:` clears the description without taking the next line,
and is reported after a nonempty description.

A block containing only comment lines also clears the description, because
mermaid.js removes the comments, and is reported after a nonempty description.
An empty block, such as `accDescr {}`, or one containing only directives is
reported instead by
[treemap-no-empty-description-block](./treemap-no-empty-description-block.md).

A statement after an empty description, or one that repeats the current
description in either form, is not reported. Going back to an earlier
description is reported: after `accDescr: a` and `accDescr: b`, a third
`accDescr: a` is reported. Descriptions are compared without whitespace at the
start and end of each line, without empty lines, and with a run of two or more
spaces or tabs as one space. LF, CRLF, and CR are read as LF.

Descriptions are otherwise compared as written. mermaid.js converts character
references such as `#35;` and HTML attribute quotes before reading a
description. Descriptions differing only in these ways may be the same for
mermaid.js and different for this rule.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/treemap-no-duplicate-description: error
treemap
  accDescr: First
  accDescr: Second
  "Revenue": 10
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/treemap-no-duplicate-description: error
treemap
  accDescr: Second
  "Revenue": 10
```

## Options

This rule has no options.

## Related Rules

- [treemap-no-duplicate-title](./treemap-no-duplicate-title.md)
- [treemap-no-empty-description-block](./treemap-no-empty-description-block.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/treemap-no-duplicate-description.ts)
- [Tests source](../../tests/rules/treemap-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
