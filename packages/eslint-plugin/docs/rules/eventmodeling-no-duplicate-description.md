# @mmd-toolkit/eventmodeling-no-duplicate-description

Japanese version:
[eventmodeling-no-duplicate-description.ja.md](./eventmodeling-no-duplicate-description.ja.md)

Disallow an `accDescr` that replaces the description set before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

An Event Modeling diagram has one accessible description, which `accDescr` sets,
on a line or in a block. A later `accDescr` replaces the description set before
it without an error, and the earlier description is lost.

## Rule Details

This rule reports an `accDescr` statement whose text differs from the text of
the `accDescr` before it, when that text is not empty. It applies to
`eventmodeling`.

The line form and the block form may be mixed: whichever comes last, the
description written last is used. mermaid.js keeps the whole statement, with
`accDescr` and its `:` or its braces, as the description, so a statement with no
text sets a description too: after a description, `accDescr:` with no text, or
with only whitespace, is reported, and so is a block that holds only comment
lines, since mermaid.js removes the comments. A block that holds nothing else is
reported by
[eventmodeling-no-empty-description-block](./eventmodeling-no-empty-description-block.md).
A statement after one with no text loses no text and is not reported.

Texts are compared by their words: without the whitespace at the start and the
end of each line, without empty lines, and with a run of two or more spaces or
tabs as one space. Every line break (LF, CRLF, or CR) is read as a line feed,
and U+2028 and U+2029 end a line too, in both forms. So `accDescr: d` and the
block `accDescr { d }` give the same words and are not reported, though
mermaid.js keeps the `:` in the one and the braces in the other. After
`accDescr: a` and `accDescr: b`, a third `accDescr: a` is reported, because it
replaces `b`. Texts are otherwise compared as written: mermaid.js turns
character references, as `#35;`, and the quotes of HTML attributes into other
characters before it reads a description, so two texts that differ only in those
may be one description for mermaid.js and two for this rule.

Keep one `accDescr` statement.

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

## Background

The
[terminal](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/eventmodeling/event-modeling.langium#L60-L60)
of `accDescr` takes the whole statement, and the
[value converter](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/valueConverter.ts#L6-L41)
does not convert it, since its name is no name that the converter knows. The
parser keeps the last description, and
[`populateCommonDb`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/populateCommonDb.ts#L4-L14)
sets it, since it is never empty.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/eventmodeling-no-duplicate-description.ts)
- [Tests source](../../tests/rules/eventmodeling-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
