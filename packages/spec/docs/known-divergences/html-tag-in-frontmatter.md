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
[Frontmatter configuration](../common.md#frontmatter-configuration)).

That a tag can reach from the frontmatter into the text comes from the order of
the steps of mermaid.js: the replacement runs before the frontmatter is removed.
It is nothing that a specification would state as a rule of the syntax; this is
the second of the reasons for a known divergence (see
[known-divergences.md](../known-divergences.md)).

## What it means for an author

A frontmatter whose title has a `<` followed by a word and no `>` after it, such
as `title: <a`, is unusual. With one, mermaid.js reads every `"` between it and
the first `>` of the diagram as `'`, and so can accept a label that it would
reject, reject one that it would accept, or change the text of a label, a title,
or a message. This toolkit reads the diagram as it would without the
frontmatter. Closing the tag in the title, or leaving out the `<`, makes both
read the same.

## Counts and how they are checked

Inputs were made from the fixtures of flowchart, sequence, and class that have a
`"`, have no frontmatter, and are not marked with a divergence, by putting
before each of them a frontmatter with `title: <a` and one with `title: <a z="`,
1,196 in all. Each was run through mermaid.js and through the parser of this
specification, and their acceptance and Db were compared:

| Inputs                        | Rejected by mermaid.js, accepted by this specification | Accepted by both, a different Db | Accepted by mermaid.js, rejected by this specification |
| ----------------------------- | -----------------------------------------------------: | -------------------------------: | -----------------------------------------------------: |
| from accepted fixtures, 1,068 |                                                     98 |                                7 |                                                      0 |
| from rejected fixtures, 128   |                                                      0 |                                0 |                                                      0 |

The other 1,091 are read the same by both. Inputs that mermaid.js accepts and
this specification rejects, as in example 1, are not among them.

For each input in which a tag that starts in the frontmatter changes which `"`
mermaid.js reads as `'`, 120 of these, the differential test of the parser
compares the parser with mermaid.js on a **reference input**: the input with
every `<` of its frontmatter replaced by `(`, so that no tag starts there. The
values that come from the frontmatter, such as the title, are taken from the run
of mermaid.js on the reference input. The parser gave every one of the 120 the
reading of mermaid.js on its reference input.
