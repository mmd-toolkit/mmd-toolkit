# @mmd-toolkit/eventmodeling-no-duplicate-description

Japanese version:
[eventmodeling-no-duplicate-description.ja.md](./eventmodeling-no-duplicate-description.ja.md)

Disallow an `accDescr` that replaces the description set before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

An Event Modeling diagram has one accessible description, which `accDescr` sets,
on a line or in a block. A later `accDescr` replaces the description set before
it without an error, and the earlier description is lost.

## Rule Details

This rule applies to Event Modeling diagrams (`eventmodeling`). It reports an
`accDescr` whose text differs from the preceding `accDescr`, when the preceding
text is not empty. Line and block forms are compared with each other.

After a nonempty text, an empty or whitespace-only `accDescr:` is reported,
because mermaid.js keeps the whole statement, `accDescr:` included, as the
description. A block containing only comment lines is reported too, because
mermaid.js removes the comments. Going back to an earlier description is
reported: after `accDescr: a` and `accDescr: b`, a third `accDescr: a` is
reported. An empty block, such as `accDescr {}`, or one containing only
directives is reported instead by
[eventmodeling-no-empty-description-block](./eventmodeling-no-empty-description-block.md).
A statement after one with no text is not reported, because no text is lost.

Texts are compared without whitespace at the start and end of each line, without
empty lines, and with a run of two or more spaces or tabs as one space. LF,
CRLF, and CR are read as LF. `accDescr: d` and `accDescr { d }` are not reported
as different, though mermaid.js keeps different punctuation in them.

Texts are otherwise compared as written. mermaid.js converts character
references such as `#35;` and HTML attribute quotes before reading a
description, so texts differing only in these ways may be the same for
mermaid.js and different for this rule.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-duplicate-description: error
eventmodeling accDescr: First
  tf 01 evt Bought accDescr: Second
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-duplicate-description: error
eventmodeling accDescr: Second
  tf 01 evt Bought
```

## Options

This rule has no options.

## Related Rules

- [eventmodeling-no-duplicate-title](./eventmodeling-no-duplicate-title.md)
- [eventmodeling-no-empty-description-block](./eventmodeling-no-empty-description-block.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/eventmodeling-no-duplicate-description.ts)
- [Tests source](../../tests/rules/eventmodeling-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
