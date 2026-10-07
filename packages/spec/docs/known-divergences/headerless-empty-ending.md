# headerless-empty-ending

Japanese version:
[headerless-empty-ending.ja.md](./headerless-empty-ending.ja.md)

Diagram type: class. This is one of the
[known divergences](../known-divergences.md) of this specification from
mermaid.js.

## The syntax

A class diagram starts with its header, `classDiagram` or `classDiagram-v2`, on
a line of its own, and its statements follow on the next lines:

```mmd
classDiagram
  Animal <|-- Duck
  accTitle: farm
```

The header is the word `classDiagram` with no word character after it (see
[Detection](../diagrams/class.md#detection)). A text that starts with
`classDiagramX`, `classDiagram2`, or `classDiagramclassDiagram` is detected as a
class diagram, but has no header. [fixture: class/header-word-after-keyword]
[fixture: class/header-digit-after-keyword] [fixture:
class/header-keyword-twice] This document is about such a text, when it ends
with an empty value.

## The difference

Each example is a whole text.

1. A header with a letter added, and an empty title at the end:

   ```mmd
   classDiagramX
     Animal <|-- Duck
     accTitle:
   ```

2. The same, with a title that is not empty:

   ```mmd
   classDiagramX
     Animal <|-- Duck
     accTitle: farm
   ```

3. The header written correctly, and an empty title at the end:

   ```mmd
   classDiagram
     Animal <|-- Duck
     accTitle:
   ```

4. A header with a letter added, and `click A call` at the end:

   ```mmd
   classDiagramX
     click A call
   ```

5. A header with a letter added, and a string opened at the end:

   ```mmd
   classDiagramX
     callback A "
   ```

6. The header written twice, and an empty description at the end:

   ```mmd
   classDiagramclassDiagram
     accDescr:
   ```

| Example | mermaid.js                       | This specification |
| ------- | -------------------------------- | ------------------ |
| 1       | the relation from Animal to Duck | rejected           |
| 2       | rejected                         | rejected           |
| 3       | rejected                         | rejected           |
| 4       | an empty diagram                 | rejected           |
| 5       | an empty diagram                 | rejected           |
| 6       | an empty diagram                 | rejected           |

[fixture: class/div-headerless-relation-empty-title] [fixture:
class/header-word-relation-title] [fixture:
class/lex-acc-title-at-end-after-relation] [fixture:
class/div-headerless-empty-call] [fixture: class/div-headerless-empty-string]
[fixture: class/div-headerless-repeated-header]

So mermaid.js rejects a text without a header, except when the text ends with
one of seven empty forms: `accTitle:`, `accDescr:`, or `accDescr {` with only
whitespace after it, `click A call`, and a string opened at the end of
`callback A "`, `link A "`, or `click A href "`. Then it accepts the text and
reads its statements, and reads the word in place of the header as a statement
that adds nothing. The same endings after a correct header are rejected by both.
This specification rejects every text without a header. [fixture:
class/div-headerless-empty-title] [fixture:
class/header-word-after-keyword-title] [fixture:
class/div-headerless-empty-description-block] [fixture:
class/div-headerless-link-string-opened] [fixture:
class/div-headerless-click-string-opened] [fixture: class/lex-acc-title-at-end]

## What it means for an author

A class diagram whose header has a typing mistake, such as `classDiagramX`, is
rejected by this toolkit, which reports the missing header. mermaid.js rejects
it too, except when the text ends with one of the empty forms above, which are
themselves unfinished statements; then mermaid.js draws the diagram without a
word. Writing the header correctly makes the text read the same by both: with an
empty form at the end, both then reject it.

## Why mermaid.js reads it so

The lexer of mermaid.js reads `classDiagram` and `classDiagram-v2` as the header
only where no word character follows
([`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L41-L42)),
so it reads `classDiagramX` as a class name, and a class name alone is a
statement that changes nothing
([`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L332-L333)).

The grammar of mermaid.js has two starts
([`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L221-L232)):
the header, its statements, and a token `EOF`; or statements alone, with no
header and no `EOF` token. The lexer ends every text with the `EOF` token
([`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L209-L209)),
so the second start never takes a whole text, with one exception. Some rules of
the lexer can match the empty text: the values of `accTitle:` and `accDescr:`,
the value of `accDescr {`, the name after `call`, and the content of a string
([`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L30-L61)).
When one of them matches the empty text at the end of the text, the lexer has
already marked the end as reached, and it reports the end of the input instead
of the `EOF` token. The start with a header then waits for a token that never
comes, and rejects the text; the start without a header accepts it. The error of
example 3, which expects `EOF` and gets the end of the input, shows this.

## The rule of this specification, and why

In this specification, a class diagram starts with its header (see
[Detection](../diagrams/class.md#detection)), and a text without one is
rejected, however it ends.

That mermaid.js accepts a text without a header only when its last rule matched
the empty text comes from the order of the steps of its lexer: whether it
reports the `EOF` token depends on when it marks the end as reached. It is
nothing that a specification would state as a rule of the syntax; this is the
second of the reasons for a known divergence (see
[known-divergences.md](../known-divergences.md)).
