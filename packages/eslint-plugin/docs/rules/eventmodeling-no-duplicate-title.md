# @mmd-toolkit/eventmodeling-no-duplicate-title

Japanese version:
[eventmodeling-no-duplicate-title.ja.md](./eventmodeling-no-duplicate-title.ja.md)

Disallow an `accTitle` that replaces the accessible title set before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

An Event Modeling diagram has one accessible title, which `accTitle` sets. A
later `accTitle` replaces the title set before it without an error, and the
earlier title is lost.

## Rule Details

This rule reports an `accTitle` statement whose text differs from the text of
the `accTitle` before it, when that text is not empty. It applies to
`eventmodeling`.

mermaid.js keeps the whole statement, with `accTitle:`, as the accessible title,
so `accTitle:` with no text, or with only whitespace, sets a title too: after
`accTitle: First`, it is reported, because `First` is lost. A statement after an
`accTitle:` with no text loses no text and is not reported. `title` is not
compared, since mermaid.js does not draw the title of an Event Modeling diagram.

Texts are compared without the whitespace at their ends and with a run of two or
more spaces or tabs as one space, so `accTitle: First  report` and
`accTitle: First report` give the same words and are not reported. After
`accTitle: a` and `accTitle: b`, a third `accTitle: a` is reported, because it
replaces `b`. Texts are otherwise compared as written: mermaid.js turns
character references, as `#35;`, and the quotes of HTML attributes into other
characters before it reads a title, so two texts that differ only in those may
be one title for mermaid.js and two for this rule.

Keep one `accTitle` statement.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-duplicate-title: error
eventmodeling accTitle: First
  tf 01 evt Bought accTitle: Second
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-duplicate-title: error
eventmodeling accTitle: Second
  tf 01 evt Bought
```

## Options

This rule has no options.

## Related Rules

- [eventmodeling-no-duplicate-description](./eventmodeling-no-duplicate-description.md)

## Background

The
[terminal](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/eventmodeling/event-modeling.langium#L61-L61)
of `accTitle` takes the whole statement, and the
[value converter](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/valueConverter.ts#L6-L41)
does not convert it, since its name is no name that the converter knows. The
parser keeps the last title, and
[`populateCommonDb`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/populateCommonDb.ts#L4-L14)
sets it, since it is never empty.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/eventmodeling-no-duplicate-title.ts)
- [Tests source](../../tests/rules/eventmodeling-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
