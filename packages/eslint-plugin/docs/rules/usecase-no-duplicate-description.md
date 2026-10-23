# @mmd-toolkit/usecase-no-duplicate-description

Japanese version:
[usecase-no-duplicate-description.ja.md](./usecase-no-duplicate-description.ja.md)

Disallow an `accDescr` that replaces the description set before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A use case diagram has one accessible description, which `accDescr` sets, as a
line or as a block. A later `accDescr` replaces the description set before it
without an error, and the earlier description is lost.

## Rule Details

This rule reports an `accDescr` statement that changes the description that an
earlier `accDescr` set, when that description is not empty. It applies to
`usecase`.

The line form and the block form may be mixed: whichever comes first, the
description written last is used. `accDescr:` with no text sets the empty
description and does not take the next line; after a description, it is
reported. A block that holds only a comment line sets the empty description too:
mermaid.js removes the comment, so after `accDescr: d`, the block `accDescr {`,
`%% TODO`, and `}` removes `d` and is reported. A block that holds nothing is
reported by
[usecase-no-empty-description-block](./usecase-no-empty-description-block.md). A
statement after an empty description loses nothing and is not reported.

A statement that sets the description that the diagram already has is not
reported, in either form: after `accDescr: d`, the block `accDescr { d }` loses
nothing. Descriptions are compared as mermaid.js keeps them, without the
whitespace at their ends and without the whitespace after each line break, so
the indentation of the lines of a block and the empty lines in it do not count.
Every line break (LF, CRLF, or CR) is read as a line feed. After `accDescr: a`
and `accDescr: b`, a third `accDescr: a` is reported, because it replaces `b`.
Descriptions are otherwise compared as written: mermaid.js turns character
references, as `#35;`, and the quotes of HTML attributes into other characters
before it reads a description, so two descriptions that differ only in those may
be one description for mermaid.js and two for this rule.

Write one description; write a description of several lines in one block.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/usecase-no-duplicate-description: error
usecase-beta
  accDescr: first
  accDescr: second
  A
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/usecase-no-duplicate-description: error
usecase-beta
  accDescr: first
  A
```

## Options

This rule has no options.

## Related Rules

- [usecase-no-duplicate-title](./usecase-no-duplicate-title.md)
- [usecase-no-empty-description-block](./usecase-no-empty-description-block.md)
- [usecase-no-unclosed-description-block](./usecase-no-unclosed-description-block.md)

## Background

The
[`accDescr` statements](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecase.visitor.ts#L132-L140)
give the description without the whitespace at its ends, the
[model](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecaseModelBuilder.ts#L243-L245)
keeps only the last one, and the common
[`setAccDescription`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/commonDb.ts#L22-L24)
removes the whitespace after each line break.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/usecase-no-duplicate-description.ts)
- [Tests source](../../tests/rules/usecase-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
