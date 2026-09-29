# mmd/sequence/no-duplicate-title

Japanese version: [no-duplicate-title.ja.md](./no-duplicate-title.ja.md)

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
the title `From statement`. The rule does not report this, because it would have
to read the YAML of the frontmatter, which the parser keeps as written; whether
it should is an open question.

Examples of **incorrect** code for this rule:

```mmd
sequenceDiagram
  title first
  title second
  A ->> B: x
```

```mmd
sequenceDiagram
  A ->> B: x
  accTitle: first
  accTitle: second
```

Examples of **correct** code for this rule:

```mmd
sequenceDiagram
  title first
  accTitle: second
  A ->> B: x
```

## Options

This rule has no options.

## Related Rules

- [flowchart/no-duplicate-title](../flowchart/no-duplicate-title.md)
- [no-duplicate-description](./no-duplicate-description.md)

## Implementation Notes

The rule is not implemented yet. These notes are for implementing it.

### How the tree shows it

A `SequenceTitleStatement` when another `SequenceTitleStatement` comes before it
in the source, and a `SequenceAccTitleStatement`, also one whose `value` is
null, when another `SequenceAccTitleStatement` comes before it. The statements
are taken from the `body` of the `SequenceDiagram` and of every block and
section in it, in the order of their ranges; the rule reports each one after the
first of its type.

### Fixtures

The behavior of mermaid.js that the rule relies on is recorded in these fixtures
of `@mmd-toolkit/tests`:

- `sequence/db-title-replaces`
- `sequence/db-acc-title-replaces`
- `sequence/db-title-and-acc-title`
- `sequence/db-title-replaces-frontmatter`
- `sequence/db-title-legacy`
