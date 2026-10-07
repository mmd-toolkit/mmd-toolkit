# @mmd-toolkit/sequence-no-duplicate-title

Japanese version:
[sequence-no-duplicate-title.ja.md](./sequence-no-duplicate-title.ja.md)

Disallow a `title` or `accTitle` statement that sets its title again.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

<!-- end auto-generated rule notice -->

A sequence diagram has two titles: the title that `title` sets, and the
accessible title that `accTitle` sets. mermaid.js accepts every statement that
sets one of them, and each one silently replaces the value set before it. A
second title is usually left over from rewriting the text or from pasting a part
twice.

## Rule Details

This rule reports every `title` statement after the first one, written as
`title` or `title:`, and every `accTitle` statement after the first one. It
applies to `sequence`.

After `title first` and `title second`, the title is `second`, and so for
`accTitle`. The two titles are separate values: `title first` and
`accTitle: second` set both, and neither is reported. A statement inside a
block, such as `loop`, sets the title of the whole diagram and is counted too.

A `title` statement also replaces the title of the frontmatter without an error:
with `title: From frontmatter` in the frontmatter, `title From statement` gives
the title `From statement`. The rule does not report this.

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

## Options

This rule has no options.

## Related Rules

- [flowchart-no-duplicate-title](./flowchart-no-duplicate-title.md)
- [sequence-no-duplicate-description](./sequence-no-duplicate-description.md)
