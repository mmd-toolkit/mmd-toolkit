# @mmd-toolkit/sequence-no-duplicate-title

Japanese version:
[sequence-no-duplicate-title.ja.md](./sequence-no-duplicate-title.ja.md)

Disallow a `title` or `accTitle` statement that sets its title again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A sequence diagram has two titles: the title that `title` sets, and the
accessible title that `accTitle` sets. mermaid.js accepts every statement that
sets one of them, and each one silently replaces the value set before it. A
second title is usually left over from rewriting the text or from pasting a part
twice.

## Rule Details

This rule reports every `title` statement after the first one, written as
`title` or `title:`, and every `accTitle` statement after the first one, when
the statement sets a value other than the one before it. It applies to
`sequence`.

After `title first` and `title second`, the title is `second`, and so for
`accTitle`. `accTitle:` with no text sets the accessible title too: it takes the
next line that holds text as the accessible title, past empty lines, comment
lines, and directives, and when no such line follows, it makes it empty. The two
titles are separate values: `title first` and `accTitle: second` set both, and
neither is reported. A statement inside a block, such as `loop`, sets the title
of the whole diagram and is counted too.

A `title` statement also replaces the title of the frontmatter without an error:
with `title: From frontmatter` in the frontmatter, `title From statement` gives
the title `From statement`. The rule does not report this.

A statement that sets the title that the diagram already has is not reported:
after `accTitle: a`, a second `accTitle: a` loses nothing. Titles are compared
as mermaid.js keeps them, without the whitespace at their ends, so
`accTitle:  a` sets the same title. After `accTitle: a` and `accTitle: b`, a
third `accTitle: a` is reported, because it replaces `b`. The same holds for
`title`, whose text keeps its whitespace: after `title T`, the statement
`title  T`, with two spaces, sets another title, and it is reported, also where
the two titles look the same when drawn.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/sequence-no-duplicate-title: error
sequenceDiagram
  title first
  title second
  A ->> B: x
```

```mmd
%% eslint @mmd-toolkit/sequence-no-duplicate-title: error
sequenceDiagram
  A ->> B: x
  accTitle: first
  accTitle: second
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/sequence-no-duplicate-title: error
sequenceDiagram
  title first
  accTitle: second
  A ->> B: x
```

```mmd
%% eslint @mmd-toolkit/sequence-no-duplicate-title: error
sequenceDiagram
  title first
  title first
  A ->> B: x
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-duplicate-title](./flowchart-no-duplicate-title.md)
- [sequence-no-duplicate-description](./sequence-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/sequence-no-duplicate-title.ts)
- [Tests source](../../tests/rules/sequence-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
