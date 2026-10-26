# @mmd-toolkit/radar-no-duplicate-description

Japanese version:
[radar-no-duplicate-description.ja.md](./radar-no-duplicate-description.ja.md)

Disallow an `accDescr` that replaces the description set before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A radar diagram has one accessible description, which `accDescr` sets, on a line
or in a block. A later `accDescr` replaces the description set before it without
an error, and the earlier description is lost.

## Rule Details

This rule reports an `accDescr` statement that changes the description that an
earlier `accDescr` set, when that description is not empty. It applies to
`radar`.

The line form and the block form may be mixed: whichever comes last, the
description written last is used. `accDescr:` with no text, or with only
whitespace, leaves the description empty and does not take the next line: after
a description, it is reported. A block that holds only comment lines leaves the
description empty too, since mermaid.js removes the comments, so after
`accDescr: d`, the block `accDescr {`, `%% TODO`, and `}` removes `d` and is
reported. A block that holds nothing else is reported by
[radar-no-empty-description-block](./radar-no-empty-description-block.md). A
statement after an empty description loses nothing and is not reported.

A statement that sets the description that the diagram already has is not
reported, in either form: after `accDescr: d`, the block `accDescr { d }` loses
nothing. Descriptions are compared as mermaid.js keeps them: without the
whitespace at the start and the end of each line, without empty lines, and with
a run of two or more spaces or tabs as one space, so the indentation of the
lines of a block and the empty lines between them do not count. Every line break
(LF, CRLF, or CR) is read as a line feed. In a block, U+2028 and U+2029 end a
line too, and the whitespace beside them goes with them; on a line of
`accDescr:`, they are text. After `accDescr: a` and `accDescr: b`, a third
`accDescr: a` is reported, because it replaces `b`. Descriptions are otherwise
compared as written: mermaid.js turns character references, as `#35;`, and the
quotes of HTML attributes into other characters before it reads a description,
so two descriptions that differ only in those may be one description for
mermaid.js and two for this rule.

Keep one `accDescr` statement.

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

## Background

The
[value converter](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/valueConverter.ts#L57-L68)
removes the whitespace at the ends of a description and of each line of a block,
and the empty lines of a block, and makes a run of two or more spaces or tabs
one space. The parser keeps the last description, and
[`populateCommonDb`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/populateCommonDb.ts#L4-L14)
sets it only when it is not empty.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/radar-no-duplicate-description.ts)
- [Tests source](../../tests/rules/radar-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
