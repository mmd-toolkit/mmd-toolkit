# @mmd-toolkit/radar-no-duplicate-description

Japanese version:
[radar-no-duplicate-description.ja.md](./radar-no-duplicate-description.ja.md)

Disallow an `accDescr` that replaces the description set before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A radar chart has one accessible description, which `accDescr` sets, on a line
or in a block. A later `accDescr` replaces the description set before it without
an error, and the earlier description is lost.

## Rule Details

This rule applies to radar charts (`radar-beta`). It reports an `accDescr` that
changes a nonempty description set by the preceding `accDescr`. The line and
block forms are compared with each other. An empty or whitespace-only
`accDescr:` clears the description without taking the next line, and is reported
after a nonempty description.

A block containing only comment lines also clears the description, because
mermaid.js removes the comments, and is reported after a nonempty description.
An empty block, such as `accDescr {}`, or one containing only directives is
reported instead by
[radar-no-empty-description-block](./radar-no-empty-description-block.md).

A statement after an empty description, or one that repeats the current
description in either form, is not reported. Descriptions are compared without
whitespace at the start and end of each line, without empty lines, and with a
run of two or more spaces or tabs as one space. LF, CRLF, and CR are read as LF.

Descriptions are otherwise compared as written. mermaid.js converts character
references such as `#35;` and HTML attribute quotes before reading a
description. Descriptions differing only in these ways may be the same for
mermaid.js and different for this rule.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/radar-no-duplicate-description: error
radar-beta
  accDescr: First
  accDescr: Second
  axis A, B, C
  curve sales{1, 2, 3}
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/radar-no-duplicate-description: error
radar-beta
  accDescr: Second
  axis A, B, C
  curve sales{1, 2, 3}
```

## Options

This rule has no options.

## Related Rules

- [radar-no-duplicate-title](./radar-no-duplicate-title.md)
- [radar-no-empty-description-block](./radar-no-empty-description-block.md)
- [radar-no-unclosed-description-block](./radar-no-unclosed-description-block.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/radar-no-duplicate-description.ts)
- [Tests source](../../tests/rules/radar-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
