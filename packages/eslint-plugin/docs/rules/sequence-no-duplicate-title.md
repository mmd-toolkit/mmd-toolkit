# @mmd-toolkit/sequence-no-duplicate-title

Japanese version:
[sequence-no-duplicate-title.ja.md](./sequence-no-duplicate-title.ja.md)

Disallow a `title` or `accTitle` statement that sets its title again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A sequence diagram has a displayed title set by `title` and an accessible title
set by `accTitle`. mermaid.js accepts a later statement for either without an
error, replacing its earlier value and losing that title.

## Rule Details

This rule applies to sequence diagrams (`sequenceDiagram`). It reports a `title`
or `accTitle` statement that changes an earlier value of the same title. `title`
and `title:` are compared together, while `title` and `accTitle` set separate
values. Statements inside blocks such as `loop` count too.

An `accTitle:` with no text also sets the accessible title and is counted: the
next line with text supplies the accessible title, past empty lines, comment
lines, and directives; with no such line, it becomes empty. A `title` statement
replacing the frontmatter title is not reported.

Repeating the current value is not reported. `accTitle` values are compared
without whitespace at their ends, while `title` values keep their whitespace:
`title  T` after `title T` is reported even if the drawing looks the same.

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
