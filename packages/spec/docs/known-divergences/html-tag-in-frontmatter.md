# html-tag-in-frontmatter

Japanese version:
[html-tag-in-frontmatter.ja.md](./html-tag-in-frontmatter.ja.md)

Diagram types: all. This is one of the
[known divergences](../known-divergences.md) of this specification from
mermaid.js.

## The syntax

In the text of a diagram, the `"` inside an HTML tag, from `<` and a word to the
next `>`, is read as `'`, so that a label can hold a tag with attributes (see
[HTML attribute quotes](../common.md#html-attribute-quotes)). A diagram can also
start with a frontmatter, whose title may hold such a tag:

```mmd
---
title: <b class="x">T</b>
---
flowchart LR
  A
```

Both read the title `<b class='x'>T</b>`. [fixture:
flowchart/frontmatter-title-html-attribute] This document is about a tag that
starts in the frontmatter and does not end there, so that it reaches into the
text of the diagram.

## The difference

Each example is a whole diagram.

1. A tag opened in the title, and a label with `"` and `>`:

   ```mmd
   ---
   title: <a
   ---
   flowchart LR
     A[b="c">d]
   ```

2. A tag and a quoted value opened in the title, and a label with a tag:

   ```mmd
   ---
   title: <a z="
   ---
   flowchart LR
     A[<b x="y">t]
   ```

3. A tag opened in the title, and an accessible title with `"` and `>`:

   ```mmd
   ---
   title: <a
   ---
   flowchart LR
     accTitle: b="c">d
     A
   ```

4. A tag opened in the title, and a message with `"` and `>`:

   ```mmd
   ---
   title: <a
   ---
   sequenceDiagram
     A -x B: b="c">d
   ```

5. The same, with an arrow that has `>`:

   ```mmd
   ---
   title: <a
   ---
   sequenceDiagram
     A ->> B: b="c">d
   ```

| Example | mermaid.js                            | This specification                       |
| ------- | ------------------------------------- | ---------------------------------------- |
| 1       | the vertex A with the label `b='c'>d` | rejected                                 |
| 2       | rejected                              | the vertex A with the label `<b x='y'>t` |
| 3       | the accessible title `b='c'>d`        | the accessible title `b="c">d`           |
| 4       | the message `b='c'>d`                 | the message `b="c">d`                    |
| 5       | the message `b="c">d`                 | the same                                 |

[fixture: flowchart/html-tag-starts-in-frontmatter] [fixture:
flowchart/html-tag-starts-in-frontmatter-value] [fixture:
flowchart/html-tag-starts-in-frontmatter-acc-title] [fixture:
sequence/div-html-tag-starts-in-frontmatter-message] [fixture:
sequence/lex-html-tag-frontmatter-arrow-ends-tag]

So in mermaid.js, a tag that starts in the frontmatter runs to the first `>`
after it, which can lie in the text, and the `"` before that `>` are read as
`'`. In example 1 the label then has no `"` left, and the flowchart grammar of
mermaid.js accepts it; without the frontmatter, both reject `A[b="c">d]`. In
example 2 the quoted value `z="` takes the `"` after `x=`, so the `"` after `y`
stays, and mermaid.js rejects the label. In example 5 the `>` of the arrow ends
the tag before the message. This specification looks for tags only in the text
after the frontmatter, and reads each of these texts as it would without the
frontmatter. A tag that starts and ends inside the frontmatter makes no
difference. The difference goes both ways, and it can change acceptance or the
Db.

In kanban, with `title: <a` in frontmatter, mermaid.js converts the inner
attribute quotes of `S["b="c">d"]` and accepts the input. This specification
ends the label string at its second quote and rejects the input. [fixture:
kanban/div-frontmatter-open-tag] Without `<a` in frontmatter, both reject it.
[fixture: kanban/gram-frontmatter-no-tag-reference]

In C4, with `title: <a` in frontmatter, `Person(a,"b="c">d")` is rejected here;
mermaid.js converts the inner attribute quotes and accepts it. [fixture:
c4/div-frontmatter-open-tag]

## What it means for an author

A frontmatter whose title has a `<` followed by a word and no `>` after it, such
as `title: <a`, is unusual. With one, mermaid.js reads every `"` between it and
the first `>` of the diagram as `'`, and so can accept a label that it would
reject, reject one that it would accept, or change the text of a label, a title,
or a message. This toolkit reads the diagram as it would without the
frontmatter. Closing the tag in the title, or leaving out the `<`, makes both
read the same.

## Why mermaid.js reads it so

mermaid.js replaces the `"` inside every tag with `'` in
[`cleanupText`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L6-L17),
over the whole source, before it removes the frontmatter in
[`preprocessDiagram`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L58-L65).
The replacement does not know where the frontmatter ends, so a tag that starts
in it is matched with a `>` in the text.

## The rule of this specification, and why

In this specification, the lexer starts reading after the frontmatter, and looks
for tags only in the text it reads; what the frontmatter contains does not
change how the text is read (see
[HTML attribute quotes](../common.md#html-attribute-quotes)). A value derived
from the frontmatter, such as the title, is the one that mermaid.js derives (see
[Frontmatter configuration](../../../tests/docs/configuration.md#frontmatter-configuration)).

That a tag can reach from the frontmatter into the text comes from the order of
the steps of mermaid.js: the replacement runs before the frontmatter is removed.
It is nothing that a specification would state as a rule of the syntax; this is
the second of the reasons for a known divergence (see
[known-divergences.md](../known-divergences.md)).

## The documentation of mermaid.js and its issues

- The pinned
  [C4 documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/c4.md#L7-L17)
  uses `<br/>` inside a quoted description and
  [shows YAML frontmatter for wrapping configuration](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/c4.md#L159-L171).
  It does not describe a tag starting in frontmatter and continuing into a C4
  argument. Searches of issues and pull requests in `mermaid-js/mermaid` on
  2026-10-21 with `C4 frontmatter in:title,body`,
  `frontmatter HTML quotes in:title,body`, and
  `C4 frontmatter tag in:title,body` found no report about that form.
