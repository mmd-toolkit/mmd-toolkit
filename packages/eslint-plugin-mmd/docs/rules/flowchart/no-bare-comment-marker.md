# mmd/flowchart/no-bare-comment-marker

Japanese version: [no-bare-comment-marker.ja.md](./no-bare-comment-marker.ja.md)

Disallow a line that holds only `%%`.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A comment is a `%%` with only whitespace and directives before it on its line,
whose first character after it that is not part of a directive is neither `{`
nor part of a line terminator. A line with `%%` alone is not a comment. Such a
line comes about when several lines are commented out together and one of them
is empty, and when the whitespace at the end of `%% `, which is a comment, is
removed.

## Rule Details

This rule reports a line that holds only `%%`. It applies to `flowchart-v2`,
`flowchart-elk`, and `swimlane`.

Flowchart reads the `%%` of such a line as a vertex with the id `%%`, so the
diagram gets a box that the author did not write. A directive after the `%%` on
the line, as in `%%%%{init: {}}%%`, changes nothing.

The same happens inside a text that spans lines: the label of a vertex, a link,
or a subgraph, also when the label is a string; a description block; a title or
a description written on the line after `accTitle:` or `accDescr:`; and a string
such as the tooltip of `click`. mermaid.js removes the other comment lines from
the text, but a line with `%%` alone stays in it: the label of `A[a`, a line
break, `%%`, a line break, and `b]` is `a`, a line break, `%%`, a line break,
and `b`, and the diagram shows a line `%%` in the box. Inside the data block of
a vertex, the line is part of the data: where the data reads it as text, as in a
quoted string such as `label: "…"` or in an indented block of text, the text
keeps it, and elsewhere, as in `A@{`, `%%`, `shape: circle`, and `}`, it makes
the data invalid, and mermaid.js rejects the diagram, while the parser of
mmd-toolkit accepts it without reading the data
([`embedded-data-opaque`](../../../../spec/docs/known-divergences/embedded-data-opaque.md)).
In a `click` statement that calls a function, the line goes into the name of the
function or into its arguments: after `click A`, a line with `%%` alone before
the name is read as the name, and the name after it becomes a new vertex; after
`click A call f(1,`, the arguments that mermaid.js passes to the function keep
the line. The rule reports these lines too.

In a description block that is not closed, the line is not reported: mermaid.js
leaves the description empty, and
[no-unclosed-description-block](./no-unclosed-description-block.md) reports the
block.

A line with a space after the `%%` is a comment and is not reported. It is not
shown as a code block below, because whitespace at the end of a line does not
survive there. A line that starts with `%%{` and is no directive, as `%%{"x"}`,
is not a comment either: mermaid.js reads it as a vertex `%%` of the shape `{}`.
The rule does not report it: it is no line that an author writes when commenting
out lines.

Where the vertex `%%` is the whole statement, the rule suggests removing the
`%%`, with its line when only whitespace is left on it; a directive on the line
stays. Where the `%%` is the end of a link, it suggests nothing: removing it
leaves `A -->` or `--> B` without its end, which mermaid.js rejects, or, with a
vertex on the line after it, makes the link go to that vertex. Inside a text
that spans lines, it suggests removing the line of only `%%`, unless a
directive, or the start or the end of one, is on that line: the line would take
it with it. Each suggestion removes only the line that its report marks:
mermaid.js then makes no vertex from that line, and the text or the data block
no longer holds it. A value with several lines of only `%%` gets a report and a
suggestion for each of them, and a data block that such lines made invalid is
read once all of them are removed. A line of only `%%` gets this suggestion only
when its value, the text, the name, or the data block, holds something besides
lines of only `%%` and whitespace. Where the line is all of the value, what
removing it gives depends on the place. After `accTitle:`, `accDescr:`, or
`click A`, whose value is the next line that holds text, mermaid.js takes a
later line as the value, so that `accTitle:`, `%%`, and `A` would have the title
`A` and no vertex `A`; after `click A`, it may also reject the text, as where
nothing follows. A data block, or a link text between `--` and `-->`, would be
left empty, which mermaid.js rejects, and a description block would be left
empty, which [no-empty-description-block](./no-empty-description-block.md)
reports. In a label, a string, the title of a subgraph, a tooltip, or the
arguments of a function, the result is the value that the line as a comment
gives; the rule keeps one condition for every place rather than a list of
places. Adding a space after the `%%` is not suggested: an editor that removes
whitespace at the end of lines would undo it.

Examples of **incorrect** code for this rule:

```mmd
%% eslint mmd/flowchart/no-bare-comment-marker: error
flowchart LR
  A --> B
  %% C-->D
  %%
  %% D-->E
```

```mmd
%% eslint mmd/flowchart/no-bare-comment-marker: error
flowchart LR
  A[a
%%
b]
```

```mmd
%% eslint mmd/flowchart/no-bare-comment-marker: error
flowchart LR
  A@{
    %%
    shape: circle
  }
```

Examples of **correct** code for this rule:

```mmd
%% eslint mmd/flowchart/no-bare-comment-marker: error
flowchart LR
  A --> B
  %% C-->D

  %% D-->E
```

```mmd
%% eslint mmd/flowchart/no-bare-comment-marker: error
flowchart LR
  A@{
    shape: circle
  }
```

## Options

This rule has no options.

## Background

mermaid.js leaves a line of only `%%` in the text because the expression with
which
[`cleanupComments()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/comments.ts#L6-L8)
removes comment lines needs at least one character after `%%`. As of 2026-10-02,
a pull request that changes this,
[#7008](https://github.com/mermaid-js/mermaid/pull/7008) ("fix: empty
comments"), is open and not merged, and the issue it refers to,
[#6505](https://github.com/mermaid-js/mermaid/issues/6505), is open with the
labels "Type: Bug / Error" and "Status: Triage".

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../../src/rules/flowchart/no-bare-comment-marker.ts)
- [Tests source](../../../tests/rules/flowchart/no-bare-comment-marker.test.ts)

<!-- end auto-generated rule resources -->
