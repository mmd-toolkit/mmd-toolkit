# Flowchart formatting rules

Japanese version: [flowchart.ja.md](./flowchart.ja.md)

How prettier-plugin-mmd formats a flowchart: the diagram types `flowchart`,
`graph`, `flowchart-elk`, and `swimlane-beta`. Each rule below keeps what
mermaid.js reads from the diagram; where a change would alter it, the text is
kept as written, and the rule says where.

Each rule below shows its formatting with examples: the text before formatting,
and the text that the plugin prints. The examples are the fixtures that the
tests check, and the link above each one is to its file. How the fixtures are
organized and checked is described in
[Documents and fixtures](./development.md#documents-and-fixtures).

## Rules

### Indentation

The statements after the header stand one level deeper than the header, and the
statements of a subgraph one level deeper than its `subgraph` line, with `end`
at the level of `subgraph`. A level follows Prettier's `useTabs` and `tabWidth`
options, subject to the minimum below: two spaces by default, as in the other
languages that Prettier formats. The statements after the header stand one level
deeper, as the documentation of mermaid.js writes them. [fixture:
indentation/use-tabs] The ordinary indentation follows the tree's structure:
authored columns do not decide subgraph membership. [fixture:
indentation/statements] [fixture: indentation/empty-description-block]

Each body step uses the shared significant indentation width: at least one space
even with `tabWidth: 0`; `useTabs` still supplies one tab per level. Removing
all indentation can turn a direction statement into accessibility text or
rejected syntax, changing what Mermaid reads. This minimum protects actual
direction statements, while non-direction lines whose columns affect their
reading keep their written indentation as described below. [fixture:
indentation/zero-direction-description-subgraph] [fixture:
indentation/zero-direction-title] [fixture:
indentation/zero-direction-title-tab] [fixture:
indentation/zero-direction-description-block] [fixture:
indentation/zero-direction-title-prefix] [fixture:
indentation/zero-direction-directive] [fixture:
indentation/zero-direction-style-prefix]

Input (escaped, `tabWidth: 0`): `"flowchart LR\n  accTitle: t;direction TB\n"`.

Output
([indentation/zero-direction-title-output.mmd](../tests/fixtures/flowchart/indentation/zero-direction-title-output.mmd)):

```mmd
flowchart LR
 accTitle: t;direction TB
```

Input
([indentation/nested-subgraphs-input.mmd](../tests/fixtures/flowchart/indentation/nested-subgraphs-input.mmd)):

```mmd
flowchart TB
subgraph outer
subgraph inner
A --> B
end
C
end
```

Output
([indentation/nested-subgraphs-output.mmd](../tests/fixtures/flowchart/indentation/nested-subgraphs-output.mmd)):

```mmd
flowchart TB
  subgraph outer
    subgraph inner
      A --> B
    end
    C
  end
```

With `tabWidth: 4`
([options](../tests/fixtures/flowchart/indentation/tab-width-4-options.json)):

Input
([indentation/tab-width-4-input.mmd](../tests/fixtures/flowchart/indentation/tab-width-4-input.mmd)):

```mmd
flowchart LR
subgraph S
A --> B
end
```

Output
([indentation/tab-width-4-output.mmd](../tests/fixtures/flowchart/indentation/tab-width-4-output.mmd)):

```mmd
flowchart LR
    subgraph S
        A --> B
    end
```

A line that holds `direction` followed by whitespace and `TB`, `BT`, `RL`, `LR`,
or `TD`, but is not a direction statement, is kept as written, with its
indentation. [fixture: indentation/direction-text-values-kept] [fixture:
indentation/direction-text-with-directive-kept] [fixture:
indentation/acc-descr-block-direction-text-kept] mermaid.js reads an indented
line that holds such a text as a direction statement: `accTitle: t;direction TB`
is an accessibility title, and the same line indented is the direction `TB`.

Input
([indentation/direction-text-kept-input.mmd](../tests/fixtures/flowchart/indentation/direction-text-kept-input.mmd)):

```mmd
flowchart LR
A-->B
accTitle: t;direction TB
subgraph S
accDescr: d ; direction LR
C
end
```

Output
([indentation/direction-text-kept-output.mmd](../tests/fixtures/flowchart/indentation/direction-text-kept-output.mmd)):

```mmd
flowchart LR
  A --> B
accTitle: t;direction TB
  subgraph S
accDescr: d ; direction LR
    C
  end
```

### Statements one per line

Each statement stands on a line of its own. [fixture:
statements-one-per-line/compat-empty-description-block-after-statement]
[fixture:
statements-one-per-line/compat-empty-description-block-before-separator]
[fixture:
statements-one-per-line/compat-empty-description-block-before-statement]
[fixture:
statements-one-per-line/compat-empty-description-block-after-data-block]
Statements written on one line and separated by `;` are split into lines: a `;`
only separates them, and a line of several statements is hard to read. [fixture:
statements-one-per-line/separated-by-semicolons-meets-others] [fixture:
statements-one-per-line/separated-by-semicolons-after-data-block]

A line that holds a `;` other than one that separates statements, such as the
`;` in `A[x;]`, in `accTitle: a;b`, or in a comment, keeps its statements and
its `;` instead: they are not split into lines of their own, and its `;` stay
where they are, keeping whether whitespace was written on each side of them, a
run of whitespace becoming one space. [fixture:
statements-one-per-line/kept-semicolon-runs-collapsed] [fixture:
statements-one-per-line/compat-semicolon-in-label-without-style-kept] [fixture:
statements-one-per-line/inner-semicolon-kept] [fixture:
statements-one-per-line/comment-semicolon-not-separator] The statements are
formatted as anywhere else. The whitespace beside a kept `;` is not made the
same everywhere, because on such a line the `;` may be one that mermaid.js
ignores, and then a space after it changes how the text around it is read.
mermaid.js ignores the last `;` of some lines, those that contain `style`, a
`:`, and a `#` in this order before a `;`. Removing a separating `;`, or
splitting the line, would make it ignore another `;`: `A[style:#x;];` has the
label `style:` followed by the entity `#x;`, while `A[style:#x;]` has the label
`style:#x`. Which `;` it ignores is not in the tree, so every such line keeps
its statements together, whether it contains `style` or not. The rule reads only
`style`, `:`, `#`, and `;`, so the whitespace between other tokens may change,
but not the whitespace between a `:` and a later `#` (see
[Semicolons](#semicolons)). The rule reads a line without its directives and
without the comment lines that mermaid.js removes, so a `style`, a `:`, a `#`,
or a `;` inside a directive does not count:
`A[style:]-->B %%{init:{"x":"#;"}}%%` is printed
`A[style:] --> B %%{init:{"x":"#;"}}%%`, as a line with no `#` or `;` is. A `%%`
in the middle of a line is no comment line, and the rule reads its text (see
[Label content](./architecture.md#label-content)). [fixture:
semicolons/line-rule-chars-only-in-directive]

Input
([statements-one-per-line/separated-by-semicolons-input.mmd](../tests/fixtures/flowchart/statements-one-per-line/separated-by-semicolons-input.mmd)):

```mmd
flowchart LR
  A --> B; B --> C; C --> D
  subgraph S; E; F; end
```

Output
([statements-one-per-line/separated-by-semicolons-output.mmd](../tests/fixtures/flowchart/statements-one-per-line/separated-by-semicolons-output.mmd)):

```mmd
flowchart LR
  A --> B
  B --> C
  C --> D
  subgraph S
    E
    F
  end
```

Input
([statements-one-per-line/line-with-semicolon-kept-input.mmd](../tests/fixtures/flowchart/statements-one-per-line/line-with-semicolon-kept-input.mmd)):

```mmd
flowchart LR
A[style:#x;];
B["style:#x;"];
accTitle: style:#x;y;
C[style:#x;] --> D;
E[style:#x;];F[y;]
G[x;]; style H fill:#f00;
I[style:#x;]-->J;   -->L
```

Output
([statements-one-per-line/line-with-semicolon-kept-output.mmd](../tests/fixtures/flowchart/statements-one-per-line/line-with-semicolon-kept-output.mmd)):

```mmd
flowchart LR
  A[style:#x;];
  B["style:#x;"];
  accTitle: style:#x;y;
  C[style:#x;] --> D;
  E[style:#x;];F[y;]
  G[x;]; style H fill:#f00;
  I[style:#x;] --> J; --> L
```

A line also keeps its statements together and its `;` in place when a statement
on it ends with one of the ids `accTitle`, `accDescr`, `direction`, `click`,
`call`, or `href`, or with an id that ends with `direction`, and a `;` separates
it from the next statement, also where the id is the end of a link, as in
`A-->call;`. [fixture:
statements-one-per-line/semicolon-after-word-between-others-kept] [fixture:
statements-one-per-line/semicolon-after-link-to-word-kept] [fixture:
statements-one-per-line/semicolon-after-word-not-at-end-split] mermaid.js reads
the whitespace after these words, line breaks included, with the word:
`accTitle ; :` is the vertices `accTitle` and `:`, while `accTitle` and `:` on
two lines is an accessibility title.

Input
([statements-one-per-line/semicolon-after-word-kept-input.mmd](../tests/fixtures/flowchart/statements-one-per-line/semicolon-after-word-kept-input.mmd)):

```mmd
flowchart LR
accTitle ; :
direction ; TB
A-->direction; TB
call;B
href;C
accDescr ; :
D;click;E
F-->G;G-->H
directiondirection ; TB
A-->Bdirection; LR
```

Output
([statements-one-per-line/semicolon-after-word-kept-output.mmd](../tests/fixtures/flowchart/statements-one-per-line/semicolon-after-word-kept-output.mmd)):

```mmd
flowchart LR
  accTitle ; :
  direction ; TB
  A --> direction; TB
  call;B
  href;C
  accDescr ; :
  D;click;E
  F --> G
  G --> H
  directiondirection ; TB
  A --> Bdirection; LR
```

A style, class definition, or link style statement that is followed on its line
by empty description blocks and a `;` stays on its line with the blocks and the
`;`, on every line they lie on. The blocks read no token, so the whitespace
before them ends the last unit of the statement, and the whitespace after them
is a last style that is all whitespace. Without the blocks that style is gone,
and mermaid.js rejects what is left, as it rejects `style A`, `classDef c`, and
`linkStyle 0 interpolate basis`, each followed by a space and a line break.

Input
([statements-one-per-line/empty-style-before-block-kept-input.mmd](../tests/fixtures/flowchart/statements-one-per-line/empty-style-before-block-kept-input.mmd)):

```mmd
flowchart LR
A-->B
linkStyle 0 interpolate basis accDescr {} ;
classDef c accDescr {}accDescr {} ;
style A accDescr {
} ;B
```

Output
([statements-one-per-line/empty-style-before-block-kept-output.mmd](../tests/fixtures/flowchart/statements-one-per-line/empty-style-before-block-kept-output.mmd)):

```mmd
flowchart LR
  A --> B
  linkStyle 0 interpolate basis accDescr {} ;
  classDef c accDescr {}accDescr {} ;
  style A accDescr {
  } ;B
```

The same holds where the word ends a subgraph name or the text of a style, a
class definition, or a link style: `end`, `click`, `call`, and `href` there, and
the text of a style may end with one after any character that is no letter or
digit, as `fill:click` does. [fixture:
statements-one-per-line/semicolon-after-style-text-word-kept] [fixture:
statements-one-per-line/semicolon-after-style-text-not-word-split] After a
letter or digit, in upper or lower case, the word is no word of its own, so the
`;` of `style A fillXclick;` is dropped, as it is after `fillclick`. [fixture:
statements-one-per-line/semicolon-after-style-text-after-capital-not-word-split]
In a name, `end` takes the whitespace after it, line feeds included, so
`subgraph Front end` followed by a line break and `A` has the name `Front end`,
a line feed, and `A`, and no members, while `subgraph Front end ;` has the
member A. The `;` stays where it is when it stands on a later line, with the
whitespace before it as written, as part of the `subgraph` line. [corpus
fixture: flowchart/semicolon-after-end-name-2a3a795c] [fixture:
statements-one-per-line/name-semicolon-after-directive-line] In a name, only
`end` and `click` read the line break after them; the other words of the list
are there because the list is shared with the text of a statement, and keeping a
`;` there changes nothing that mermaid.js reads. [fixture:
statements-one-per-line/semicolon-after-name-word-kept] [corpus fixture:
flowchart/name-semicolon-whitespace-0c9483e4] [corpus fixture:
flowchart/name-semicolon-whitespace-0fd5a434] [corpus fixture:
flowchart/name-semicolon-whitespace-05fd0f99] `Front pend` and `Front endx` do
not end with the word. [fixture:
statements-one-per-line/semicolon-after-name-not-end-dropped] A directive that
cuts the word does not change that: mermaid.js removes directives before it
reads the text. [fixture:
statements-one-per-line/semicolon-after-word-cut-by-directive-kept]

A `;` after a name ending in `accTitle` is a statement of its own and stands on
its own line inside the subgraph, since it is one of the subgraph's members.
[fixture: statements-one-per-line/name-followed-by-empty-statement]

Input
([statements-one-per-line/semicolon-after-end-name-kept-input.mmd](../tests/fixtures/flowchart/statements-one-per-line/semicolon-after-end-name-kept-input.mmd)):

```mmd
flowchart LR
subgraph Front end ;
A
end
subgraph "S" end;
B
end
style B fill:click;
C
classDef c href;D
subgraph T end

  ;
D
end
```

Output
([statements-one-per-line/semicolon-after-end-name-kept-output.mmd](../tests/fixtures/flowchart/statements-one-per-line/semicolon-after-end-name-kept-output.mmd)):

```mmd
flowchart LR
  subgraph Front end ;
    A
  end
  subgraph "S" end;
    B
  end
  style B fill: click;
  C
  classDef c href;D
  subgraph T end

  ;
    D
  end
```

A `%%` that follows a `;` or the `}` of a description block on the same line, as
in `A;%%x`, `A; %%x`, and `accDescr {y}%%z`, starts no comment in mermaid.js,
with or without whitespace before it: it is the start of a text, a vertex `%%x`.
On a line of its own it would be a comment, so the line keeps its tokens as
written, and the statement does not move to a line of its own. [fixture:
statements-one-per-line/glued-percent-after-label-kept] [fixture:
statements-one-per-line/percent-token-after-whitespace-kept] [fixture:
statements-one-per-line/percent-token-after-block-and-directive-kept] [fixture:
statements-one-per-line/percent-token-in-subgraph-kept] A `%%` in a label or in
the text of a link starts no statement, and the line is formatted as any other.
[fixture: statements-one-per-line/percent-in-label-formatted]

Input
([statements-one-per-line/glued-percent-token-kept-input.mmd](../tests/fixtures/flowchart/statements-one-per-line/glued-percent-token-kept-input.mmd)):

```mmd
flowchart LR
A;%%x
B
accDescr {y}%%z
C --> D
```

Output
([statements-one-per-line/glued-percent-token-kept-output.mmd](../tests/fixtures/flowchart/statements-one-per-line/glued-percent-token-kept-output.mmd)):

```mmd
flowchart LR
  A;%%x
  B
  accDescr {y}%%z
  C --> D
```

### Semicolons

A `;` at the end of a statement is dropped, and so is a `;` that stands alone at
the top level. [fixture: semicolons/alone-between-empty-lines-removed] [fixture:
semicolons/alone-between-comments-removed] [fixture:
semicolons/before-empty-description-block-removed] Inside a subgraph, a `;` that
is a statement of its own is kept on a line of its own: mermaid.js lists it
among the members of the subgraph. [fixture:
semicolons/kept-in-subgraph-own-line] [fixture:
semicolons/kept-in-subgraph-with-directive] [fixture:
semicolons/kept-in-subgraph-repeated] A `;` inside a statement, which mermaid.js
reads past on some lines, is kept where it is, and so is its line (see
[Statements one per line](#statements-one-per-line)). [fixture:
semicolons/compat-ignored-semicolon-in-label] [fixture:
semicolons/compat-ignored-semicolon-in-string] A `;` at the end of a statement
is kept too when a directive follows it on the same line: without the `;`, the
whitespace before the directive would be read as part of the statement.
[fixture: semicolons/kept-before-trailing-directive] A line that dropping a `;`
would change the end of, or the `;` that the line rule ignores in, is printed as
written: a `;` after a directive that is not closed, an ignored `;` next to
another `;`, and one before a U+2028 or U+2029 (see
[A line that a `;` ends](./compatibility.md#a-line-that-a--ends)). [corpus
fixture: flowchart/ignored-semicolon-after-directive-1abc682b] [corpus fixture:
flowchart/style-line-separator-semicolon-2a0f3253] A `style` or `classDef` line
of this kind is printed as written from the start of its statement, so only the
indentation before the statement changes. [test: a `classDef` line with a `;`,
U+2028, and a `;`] [test: a `style` line with a `;`, U+2029, and a `;`]
[fixture: statements-one-per-line/compat-unclosed-directive-semicolon-kept]
[fixture:
statements-one-per-line/compat-ignored-semicolon-next-to-semicolon-kept]
[fixture: semicolons/kept-after-unclosed-directive] [fixture:
semicolons/ignored-next-to-another-kept] The whitespace between a `:` and a
later `#` of a line that holds `style` or `classDef` before the `:` and a `;`
after the `#` keeps whether it is there: the line rule ignores the last `;` of a
line only when no whitespace lies between them, so dropping or writing
whitespace there, as around an arrow in `A[style:]-->B[# z;y]`, would change the
label. [fixture: semicolons/style-line-gap-between-colon-and-hash-kept] Where
whitespace is there, it is printed as one space, as anywhere else, since the
rule asks only whether some is there and not how much: `A[style: ]-->B[#z;y]`
stays, and `C[style:]   -->   D[#z;y]` becomes `C[style:] --> D[#z;y]`.
[fixture: semicolons/style-line-space-between-colon-and-hash-kept] [fixture:
semicolons/style-line-spaces-between-colon-and-hash-become-one] A `;` that the
rule ignores at the end of the line is dropped, and the line that is printed has
no `;` for the rule to read, so its whitespace is formatted as anywhere else.
[fixture: semicolons/style-line-dropped-semicolon-formats-the-gap]

Input
([semicolons/removed-input.mmd](../tests/fixtures/flowchart/semicolons/removed-input.mmd)):

```mmd
flowchart LR;
  A --> B;
  B --> C;;
  ;
```

Output
([semicolons/removed-output.mmd](../tests/fixtures/flowchart/semicolons/removed-output.mmd)):

```mmd
flowchart LR
  A --> B
  B --> C
```

A `;` that ends a statement is dropped also where the line rule of mermaid.js
ignores it, as the `;` after a CSS color does in a `style` statement: mermaid.js
removes that `;` from the text, so dropping it changes nothing. [fixture:
semicolons/ignored-removed-other-statements]

Input
([semicolons/ignored-removed-input.mmd](../tests/fixtures/flowchart/semicolons/ignored-removed-input.mmd)):

```mmd
flowchart LR
A-->B
style A fill:#f00;
classDef c fill:#fff,stroke:#333;
style B   fill:#0f0 ;
```

Output
([semicolons/ignored-removed-output.mmd](../tests/fixtures/flowchart/semicolons/ignored-removed-output.mmd)):

```mmd
flowchart LR
  A --> B
  style A fill: #f00
  classDef c fill: #fff, stroke: #333
  style B fill: #0f0
```

Input
([semicolons/kept-in-subgraph-input.mmd](../tests/fixtures/flowchart/semicolons/kept-in-subgraph-input.mmd)):

```mmd
flowchart LR
  subgraph outer
    subgraph inner
      A;;
    end;
  end
```

Output
([semicolons/kept-in-subgraph-output.mmd](../tests/fixtures/flowchart/semicolons/kept-in-subgraph-output.mmd)):

```mmd
flowchart LR
  subgraph outer
    subgraph inner
      A
      ;
    end
    ;
  end
```

Input
([semicolons/ignored-in-statement-kept-input.mmd](../tests/fixtures/flowchart/semicolons/ignored-in-statement-kept-input.mmd)):

```mmd
flowchart LR
A[style:#x] e;@-->B
```

Output
([semicolons/ignored-in-statement-kept-output.mmd](../tests/fixtures/flowchart/semicolons/ignored-in-statement-kept-output.mmd)):

```mmd
flowchart LR
  A[style:#x] e;@--> B
```

Input
([semicolons/kept-before-items-input.mmd](../tests/fixtures/flowchart/semicolons/kept-before-items-input.mmd)):

```mmd
flowchart LR
A
B
class A c; %%{init: {}}%%
C; D
```

Output
([semicolons/kept-before-items-output.mmd](../tests/fixtures/flowchart/semicolons/kept-before-items-output.mmd)):

```mmd
flowchart LR
  A
  B
  class A c; %%{init: {}}%%
  C
  D
```

A `;` that the line rule ignores, between two tokens of a statement or between
two statements on a line, is read as not there, so the whitespace around it
follows the ordinary rule of the gap as if it were absent. Where the gap has one
space, the `;` stands against the token before it and one space follows it,
whatever whitespace was written around it; where the gap has none, the `;`
touches both tokens; where the gap has no rule, one space follows where
whitespace was written anywhere in the gap, and none where it was not. The
whitespace of a gap that lies inside the stretch that the rule reads, of a gap
that holds a U+2028 or U+2029, and of the gap right after the keyword of the
diagram stays as written, because diagram detection reads the text before the
`;` is removed (`cynefin-beta ;complex` is detected, `cynefin-beta; complex` is
not). A `;` at the end of a line stands against the token before it. [fixture:
semicolons/ignored-semicolon-before-edge-id-touching] [fixture:
semicolons/ignored-semicolon-before-edge-id-spaced] [test: U+2028 after a `;`
before an edge id] [test: U+2028 after a `;` and a space before an edge id]
[test: U+2029 after a `;` before an edge id] [test: U+2029 after a `;` and a
space before an edge id]

### Blank lines

A run of empty lines becomes one empty line, as Prettier does for code: an empty
line groups statements, and more than one adds nothing. [fixture:
blank-lines/single-kept] [fixture: blank-lines/whitespace-only-lines] [fixture:
blank-lines/inside-multi-line-statement] [fixture:
blank-lines/around-comment-lines] [fixture: blank-lines/around-directive-lines]
Empty lines at the start and the end of the text, and at the start and the end
of a subgraph, are dropped. [fixture: blank-lines/after-comment-before-header]
[fixture: blank-lines/after-frontmatter] Empty lines inside the text of a value
written over lines, such as a label, are part of it and are kept. [fixture:
blank-lines/inside-values-kept] The text ends with exactly one line break.
[fixture: blank-lines/header-only-without-line-break]

Input
([blank-lines/collapsed-input.mmd](../tests/fixtures/flowchart/blank-lines/collapsed-input.mmd)):

```mmd


flowchart LR


  A --> B



  B --> C
  subgraph S

    C

  end


```

Output
([blank-lines/collapsed-output.mmd](../tests/fixtures/flowchart/blank-lines/collapsed-output.mmd)):

```mmd
flowchart LR
  A --> B

  B --> C
  subgraph S
    C
  end
```

### Whitespace between tokens

Within a line, a run of spaces and tabs between two tokens becomes one space, so
that a line has one form whoever wrote it, and tokens that touch keep touching,
except where a rule below says otherwise (Arrow spacing): mermaid.js reads some
tokens only when they touch, as `A%%{init: {}}%%B-->C`, which is the id `AB`,
and a rule that wrote a space between touching tokens would need an exception
for every such place. [fixture:
whitespace-between-tokens/compat-empty-description-block-own-line] [fixture:
whitespace-between-tokens/header-and-tabs-collapsed] A run of spaces and tabs
inside the name of a subgraph, which becomes its title, is printed as one space
where mermaid.js draws the title without a width, and kept where it wraps the
title: in a markdown string, a subgraph with a data block (the id of a subgraph
named by a string is the text between the quotes, without the whitespace at its
ends, and for a markdown string the text between its backquotes: `subgraph "S"`
and `subgraph " S "` have the id `S`), and a diagram that names `swimlane` (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)).
[fixture: whitespace-between-tokens/subgraph-name-runs-collapsed] [fixture:
subgraph-header/markdown-title-runs-kept] [fixture:
subgraph-header/collapsed-title-runs-kept] [fixture:
subgraph-header/collapsed-quoted-name-title-runs-kept] [fixture:
subgraph-header/collapsed-markdown-name-title-runs-kept] [fixture:
subgraph-header/collapsed-spaced-name-title-runs-kept] [fixture:
subgraph-header/collapsed-generated-id-title-runs-kept] [fixture:
subgraph-header/swimlane-title-runs-kept] [fixture:
subgraph-header/layout-swimlane-title-runs-kept] In a `style`, `classDef`, or
`linkStyle` statement, each style has no whitespace before its first `:` and one
space after it where the value is not empty. The `,` between styles has no
whitespace before it and one space after it: `style A fill :#f00,stroke:  #333`
is printed `style A fill: #f00, stroke: #333`. [fixture:
whitespace-between-tokens/style-colon-spaced] [fixture:
whitespace-between-tokens/style-colon-empty-value-kept] [fixture:
whitespace-between-tokens/style-comma-before-dropped] A `linkStyle` with link
numbers keeps whether whitespace follows the `,` before a style that starts with
`fill`, a run of whitespace becoming one space; a style that starts with
`fill-opacity` counts, as mermaid.js reads only the start. [fixture:
whitespace-between-tokens/link-style-fill-after-comma-kept] [fixture:
whitespace-between-tokens/link-style-fill-opacity-after-comma-kept] A
`linkStyle`, with link numbers or `default`, keeps it for a style that starts
with `stroke:` too, which mermaid.js reads at the start where the look is
`handDrawn`. [fixture:
whitespace-between-tokens/link-style-stroke-after-comma-kept] The other styles
of such a statement, and `linkStyle default`, use the one form. [fixture:
whitespace-between-tokens/link-style-other-after-comma-spaced] [fixture:
whitespace-between-tokens/link-style-default-after-comma-spaced] In a
`linkStyle` or a `classDef`, which can reach a link, a name that ends with
`stroke` keeps whether whitespace stands between it and the `:`, a run of
whitespace becoming one space, since mermaid.js looks for `stroke:` in the
styles of a link to colour its arrowheads. [fixture:
whitespace-between-tokens/link-style-stroke-before-colon-kept] [fixture:
whitespace-between-tokens/class-def-stroke-before-colon-kept] A `style` styles a
node, and uses the one form. [fixture:
whitespace-between-tokens/style-stroke-before-colon-spaced] A space after a
backslash that ends a style of a `style` is read as nothing:
`style A stroke-width:3px\ ,stroke:#0f0` is printed
`style A stroke-width: 3px\, stroke: #0f0`. [fixture:
whitespace-between-tokens/style-backslash-space-dropped] A style of a
`linkStyle` with a name that ends with `stroke` and a value of spaces and tabs
only stays as written, since mermaid.js draws no colour of the arrowheads from
it and does not try a later `stroke:`: `linkStyle 0 stroke: ,   stroke:#f00` is
printed `linkStyle 0 stroke: , stroke: #f00`. [fixture:
whitespace-between-tokens/link-style-blank-stroke-value-kept] A style of a
`linkStyle` that ends with a backslash keeps whether whitespace stands after it,
a run of whitespace becoming its first character, since mermaid.js joins the
styles of a link with `;` as they are, and the backslash would escape the `;`:
`linkStyle 0 stroke-width:4px\ ,stroke:#0f0` is printed
`linkStyle 0 stroke-width: 4px\ ,stroke: #0f0` (see
[Styles that are drawn the same](./compatibility.md#styles-that-are-drawn-the-same)).
[fixture: whitespace-between-tokens/link-style-backslash-space-kept] In a
`classDef` a `,` after a backslash is part of its style, and a space between the
backslash and the `,` stays, since taking it away would make the `,` part of the
style: `classDef c fill:a\ ,stroke:b` is printed
`classDef c fill: a\ , stroke: b`. In a `style` and a `linkStyle` the `,` ends a
style whatever stands before it. [fixture:
whitespace-between-tokens/style-backslash-before-comma] A space after a
backslash before the `:` stays as well, since taking it away would escape the
`:`, and the whitespace after that space goes, as before any `:`:
`style A fill\   :#f00` is printed `style A fill\ : #f00`. A statement stays as
written where it holds a comment or a directive, where a style is all
whitespace, or where a style holds a line break or its line holds a kept `;`.
[fixture: whitespace-between-tokens/style-blank-style-kept] [fixture:
whitespace-between-tokens/style-colon-escaped-space-kept] [fixture:
whitespace-between-tokens/style-colon-escaped-space-run-dropped] [fixture:
whitespace-between-tokens/style-escaped-space-before-comma] [fixture:
whitespace-between-tokens/style-comma-beside-directive-kept] [fixture:
whitespace-between-tokens/style-comma-with-kept-semicolon-kept] A U+2028 or
U+2029 stays where it is. [test: U+2028 before the comma of a flowchart style
statement] [test: U+2029 after the comma of a flowchart style statement] The
text of a `direction` statement before `direction` and after the value is the
exception, kept as written (see [Direction](#direction)). [fixture:
whitespace-between-tokens/class-def-and-link-style-spaced] [fixture:
whitespace-between-tokens/subgraph-quoted-name-runs-collapsed] In a `style`,
`classDef`, or `linkStyle` statement, the whitespace before the first style,
which the statement rule of mermaid.js reads, becomes one space, which stands
before a directive there, as under [Directives](#directives):
`style A %%{init: {}}%%  fill:red` is printed `style A %%{init: {}}%%fill:red`,
and the two give the same Db. A run of spaces and tabs between the words of a
style is printed as one space, and whether whitespace stands between two words
stays as written: `classDef c fill:#f00    stroke:#333` is printed
`classDef c fill: #f00 stroke:#333`. A run inside a single-quoted string and
inside a comment that is not closed stays as written, and so does the escape
after a backslash, since CSS reads it as part of the value: the hexadecimal
digits (at most six) and the one space or tab that follows them, or else the
next character. The run after the escape is a run like any other:
`font-family:a\   b` is printed `font-family: a\  b`,
`font-family:Arial\20   Black` is printed `font-family: Arial\20  Black`, and
`font-family:Arial\0000201   Black`, where the escape ends after six digits, is
printed `font-family: Arial\0000201 Black`. [fixture:
whitespace-between-tokens/style-inner-whitespace-collapsed] [fixture:
whitespace-between-tokens/style-words-run-spaced] [fixture:
whitespace-between-tokens/style-string-runs-kept] [fixture:
whitespace-between-tokens/style-backslash-run-spaced] [fixture:
whitespace-between-tokens/style-hex-escape-run-spaced] [fixture:
whitespace-between-tokens/style-hex-escape-tab-run-spaced] [fixture:
whitespace-between-tokens/style-hex-escape-seven-digits-run-spaced] [fixture:
whitespace-between-tokens/style-words-directive-kept] `linkStyle default`,
`classDef`, and `style` use the same form as ER and requirement (see
[Styles that are drawn the same](./compatibility.md#styles-that-are-drawn-the-same)).

A style that starts with the `:`, and one whose `:` follows a backslash and a
space, are printed as any other style: no whitespace before the `:` besides the
space that the backslash escapes, one space after it, and the runs between their
words as one space, as CSS drops the whitespace around the `:` and reads a run
as one. `style A :  red   x` is printed `style A : red x`, and
`style A fill\ :red   x` is printed `style A fill\ : red x`. [fixture:
whitespace-between-tokens/style-colon-first-run-spaced] [fixture:
whitespace-between-tokens/style-escaped-space-run-spaced] A comment that is not
closed runs to the end of the style, and the runs in it stay. [fixture:
whitespace-between-tokens/style-unclosed-comment-runs-kept]

The `,` of a `class`, `click`, and `linkStyle` statement stays as written,
without a space after it, since mermaid.js rejects `class A, B c` and the like.
In a `classDef`, a space after the `,` between the names would move the name
after it into the style (`classDef a, b fill:red` gives `a` the style
`b fill:red`), so those names stay as written too (see
[Lists separated by commas](./compatibility.md#lists-separated-by-commas)).
[fixture: whitespace-between-tokens/comma-lists-without-space-kept]

U+2028 and U+2029 after the `end` of a subgraph are whitespace to mermaid.js,
and are dropped with the whitespace at the end of the line: `end`, U+2028, and a
line break is printed as `end`. [test: U+2028 after the `end` of a subgraph]
[test: U+2029 and whitespace around it after the `end` of a subgraph]

Input
([whitespace-between-tokens/collapsed-input.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/collapsed-input.mmd)):

```mmd
flowchart   LR
  A   -->   B
  C   &   D --> E
  style   A   fill:#f00
  class   A   c
  F	-->	G
```

Output
([whitespace-between-tokens/collapsed-output.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/collapsed-output.mmd)):

```mmd
flowchart LR
  A --> B
  C & D --> E
  style A fill: #f00
  class A c
  F --> G
```

Input
([whitespace-between-tokens/style-colon-and-comma-spaced-input.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/style-colon-and-comma-spaced-input.mmd)):

```mmd
flowchart LR
  A
  style A fill:#f00 , stroke:#333
```

Output
([whitespace-between-tokens/style-colon-and-comma-spaced-output.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/style-colon-and-comma-spaced-output.mmd)):

```mmd
flowchart LR
  A
  style A fill: #f00, stroke: #333
```

Input
([whitespace-between-tokens/subgraph-name-runs-collapsed-input.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/subgraph-name-runs-collapsed-input.mmd)):

```mmd
flowchart LR
  subgraph a   b
    A
  end
```

Output
([whitespace-between-tokens/subgraph-name-runs-collapsed-output.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/subgraph-name-runs-collapsed-output.mmd)):

```mmd
flowchart LR
  subgraph a b
    A
  end
```

Input
([whitespace-between-tokens/style-after-directives-input.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/style-after-directives-input.mmd)):

```mmd
flowchart LR
A
style   A %%{init: {}}%%  %%{init: {}}%%fill:red
classDef   a,b   %%{init: {}}%% %%{init: {}}%%  fill:red
A-->A
linkStyle   0   %%{init: {}}%%  fill:red
linkStyle default interpolate   basis   %%{init: {}}%%  %%{init: {}}%%stroke:red
```

Output
([whitespace-between-tokens/style-after-directives-output.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/style-after-directives-output.mmd)):

```mmd
flowchart LR
  A
  style A %%{init: {}}%%%%{init: {}}%%fill:red
  classDef a,b %%{init: {}}%%%%{init: {}}%%fill:red
  A --> A
  linkStyle 0 %%{init: {}}%%fill:red
  linkStyle default interpolate basis %%{init: {}}%%%%{init: {}}%%stroke:red
```

The whitespace between the name of the function after `call` and the `(` that
follows it is kept as written: mermaid.js reads the name up to the `(`,
whitespace included, so `click A call fn  ()` calls the function named `fn` and
two spaces. [fixture:
whitespace-between-tokens/callback-name-arguments-forms-kept] The arguments have
no whitespace at their ends or before a `,`, and one space after it:
`click A call f(  "x" ,y )` is printed `click A call f("x", y)`, since
mermaid.js splits the arguments at the `,` outside quotes and trims each part,
and calls the function with the same arguments (see
[Call arguments that are drawn the same](./compatibility.md#call-arguments-that-are-drawn-the-same)).
The whitespace inside quotes stays, and so do arguments with an empty part.
[fixture: whitespace-between-tokens/callback-arguments-spaced] A gap between the
arguments that the line rule of mermaid.js may read keeps whether it holds
whitespace: `click A call f(style:x,#b;c)` stays as written, since a space after
the `,` would change the last `;` that the rule ignores (see
[Call arguments that are drawn the same](./compatibility.md#call-arguments-that-are-drawn-the-same)).
[fixture: whitespace-between-tokens/callback-arguments-line-rule-kept] The
parentheses of a call with blank arguments touch each other: `click A call f( )`
is printed `click A call f()`, since mermaid.js reads both as the same call with
no arguments. A directive between them touches both parentheses, as under
[Directives](#directives). [fixture:
whitespace-between-tokens/callback-blank-parentheses-touch] A statement written
over several lines is kept as written, so it keeps the line break between the
parentheses and a comment line there. [fixture:
whitespace-between-tokens/callback-blank-parentheses-lines] A U+2028 or U+2029
between them stays where it is. [test: U+2028 between the parentheses of a blank
flowchart callback] [test: U+2029 between the parentheses of a blank flowchart
callback]

A callback written without `call` is a click id, with no `(` after it (see
[FlowchartClickCallbackStatement](../../spec/docs/ast/flowchart.md#flowchartclickcallbackstatement)),
so the rule for the name after `call` does not apply to it, and the whitespace
between the parts of the statement becomes one space: `click   A cb   "tip"` is
printed as `click A cb "tip"`. [fixture:
whitespace-between-tokens/click-without-call-collapsed]

Input
([whitespace-between-tokens/callback-name-kept-input.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/callback-name-kept-input.mmd)):

```mmd
flowchart LR
A
B
click A call fn  ( x )
click B call gn   (y, z)
```

Output
([whitespace-between-tokens/callback-name-kept-output.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/callback-name-kept-output.mmd)):

```mmd
flowchart LR
  A
  B
  click A call fn  (x)
  click B call gn   (y, z)
```

### Arrow spacing

A link has one space before it and one after it, as the documentation of
mermaid.js writes links. [fixture: arrow-spacing/other-link-kinds] [fixture:
arrow-spacing/ampersand-spacing-kept] [fixture: arrow-spacing/arrow-length-kept]
Text written between two arrows has one space on each side. [fixture:
arrow-spacing/text-between-other-link-kinds] [fixture:
arrow-spacing/directive-in-text-between-arrows] A label between `|` touches the
arrow and its `|`, and an edge id touches its `@` and the arrow. [fixture:
arrow-spacing/pipe-label-other-link-kinds] [fixture:
arrow-spacing/edge-id-with-labels] [fixture:
arrow-spacing/edge-id-whitespace-before-arrow-dropped] A label in quotes between
`|` is kept as written, as any label in quotes (see
[Label inner whitespace](#label-inner-whitespace)), and its `|` touch the arrow
and the quotes. [fixture: arrow-spacing/pipe-label-string-kept]

An edge id that starts as an arrow does (`--`, `==`, `-.`, or dots and then `-`,
with or without the head `x`, `o`, or `<`, or `~~~` without a head) touches the
shape before it. It is an edge id only without whitespace before it: after
whitespace the lexer reads the arrow, and the rest is its text or the input is
rejected, so `A[x]--a@-->B` has the edge id `--a`, and `A[x] --a@-->B` has the
link text `a@`. [fixture: arrow-spacing/edge-id-arrow-like-kept-attached]
[fixture: arrow-spacing/edge-id-arrow-like-with-head] [fixture:
arrow-spacing/edge-id-arrow-like-dotted-forms] [fixture:
arrow-spacing/edge-id-arrow-like-after-every-shape] [fixture:
arrow-spacing/edge-id-arrow-like-with-link-text] [fixture:
arrow-spacing/edge-id-arrow-like-chain] [fixture:
arrow-spacing/edge-id-arrow-like-after-whitespace-is-link-text] Any other edge
id has one space before it, such as `=a`, `~~a`, `.a`, `x-a`, and `x~~~a`.
[fixture: arrow-spacing/edge-id-not-arrow-like-gets-one-space] The whitespace of
the gap between the shape and the edge id decides whether the edge id is one, so
the gap has no ordinary rule: where whitespace was written anywhere in the gap,
around a directive or an ignored `;` or between them, one space stands in it,
before the directive, and none where it was not. The directive and the `;` are
placed as under [Directives](#directives). [fixture:
arrow-spacing/edge-id-arrow-like-after-directive] [fixture:
arrow-spacing/edge-id-arrow-like-after-directive-runs] [fixture:
arrow-spacing/edge-id-arrow-like-after-ignored-semicolon] [fixture:
arrow-spacing/edge-id-arrow-like-after-ignored-semicolon-runs-collapsed]

An edge id after a data block touches the block: `A@{ shape: circle } e1@--> B`
is printed `A@{ shape: circle }e1@--> B`. mermaid.js 12.3.0 reads the two forms
the same, and draws the same figure from them. The grammars of 11.5.0, the first
with edge ids, to 12.2.0 have no rule for a space after a data block before an
edge id, so they reject the form with the space; drawn in Chromium, 11.12.3,
11.13.0, 11.14.0, 11.15.0, 11.16.1, and 12.0.0 did. The touching form is the one
that every version reads. A directive or an ignored `;` between the block and
the edge id is removed before the text is read, so the block, the directive or
the `;`, and the edge id touch one another:
`A@{ shape: circle }%%{init: {}}%%e1@--> B`. After the closing bracket of a
shape the edge id has one space (`A[x] e1@--> B`), since the same six versions
reject `A[x]e1@--> B`. A swimlane diagram follows the same rule. [fixture:
arrow-spacing/edge-id-after-data-block-touches] [fixture:
arrow-spacing/edge-id-after-data-block-directive] [fixture:
arrow-spacing/edge-id-after-data-block-semicolon] [fixture:
arrow-spacing/edge-id-after-data-block-touches-swimlane]

Input
([arrow-spacing/plain-input.mmd](../tests/fixtures/flowchart/arrow-spacing/plain-input.mmd)):

```mmd
flowchart LR
  A-->B
  C==>D
  E-.->F
  Gx--xH
```

Output
([arrow-spacing/plain-output.mmd](../tests/fixtures/flowchart/arrow-spacing/plain-output.mmd)):

```mmd
flowchart LR
  A --> B
  C ==> D
  E -.-> F
  Gx --x H
```

Input
([arrow-spacing/text-between-arrows-input.mmd](../tests/fixtures/flowchart/arrow-spacing/text-between-arrows-input.mmd)):

```mmd
flowchart LR
  A--text-->B
  C==  thick  ==>D
```

Output
([arrow-spacing/text-between-arrows-output.mmd](../tests/fixtures/flowchart/arrow-spacing/text-between-arrows-output.mmd)):

```mmd
flowchart LR
  A -- text --> B
  C == thick ==> D
```

Input
([arrow-spacing/pipe-label-input.mmd](../tests/fixtures/flowchart/arrow-spacing/pipe-label-input.mmd)):

```mmd
flowchart LR
  A-->|text|B
  C --> |text| D
```

Output
([arrow-spacing/pipe-label-output.mmd](../tests/fixtures/flowchart/arrow-spacing/pipe-label-output.mmd)):

```mmd
flowchart LR
  A -->|text| B
  C -->|text| D
```

Input
([arrow-spacing/edge-id-input.mmd](../tests/fixtures/flowchart/arrow-spacing/edge-id-input.mmd)):

```mmd
flowchart LR
  A e1@-->B
```

Output
([arrow-spacing/edge-id-output.mmd](../tests/fixtures/flowchart/arrow-spacing/edge-id-output.mmd)):

```mmd
flowchart LR
  A e1@--> B
```

Input
([arrow-spacing/edge-id-arrow-like-kept-attached-input.mmd](../tests/fixtures/flowchart/arrow-spacing/edge-id-arrow-like-kept-attached-input.mmd)):

```mmd
flowchart LR
A[x]--a@-->B
C[x]==c@==>D
E[x]-.e@.->F
G[x].-g@-.->H
I[x]~~~i@~~~J
```

Output
([arrow-spacing/edge-id-arrow-like-kept-attached-output.mmd](../tests/fixtures/flowchart/arrow-spacing/edge-id-arrow-like-kept-attached-output.mmd)):

```mmd
flowchart LR
  A[x]--a@--> B
  C[x]==c@==> D
  E[x]-.e@.-> F
  G[x].-g@-.-> H
  I[x]~~~i@~~~ J
```

Input
([arrow-spacing/edge-id-after-data-block-touches-input.mmd](../tests/fixtures/flowchart/arrow-spacing/edge-id-after-data-block-touches-input.mmd)):

```mmd
flowchart LR
A@{ shape: circle } e1@--> B
C@{ shape: rect }e2@-.->D
E@{ shape: rect }   e3@-->|x| F@{ shape: circle } e4@==> G
H[x] e5@--> I
J[x]e6@--> K
```

Output
([arrow-spacing/edge-id-after-data-block-touches-output.mmd](../tests/fixtures/flowchart/arrow-spacing/edge-id-after-data-block-touches-output.mmd)):

```mmd
flowchart LR
  A@{ shape: circle }e1@--> B
  C@{ shape: rect }e2@-.-> D
  E@{ shape: rect }e3@-->|x| F@{ shape: circle }e4@==> G
  H[x] e5@--> I
  J[x] e6@--> K
```

### Label inner whitespace

Whitespace at the ends of a label without quotes is dropped, as mermaid.js drops
it. [fixture: label-inner-whitespace/trimmed-every-shape] Whitespace inside the
label is kept. A label that is only spaces and tabs is printed as one space:
mermaid.js reads the same empty text for any number of them and draws the same
figure, and it rejects a label of no character (`A[]`), so one space is the
least that keeps the label. `A[   ]` is printed `A[ ]`, and so is every other
shape, and the label of a link between `|`. [fixture:
label-inner-whitespace/all-whitespace-every-shape] A label in quotes is kept as
written, except for the whitespace between its closing quote and the closing
bracket, which is dropped: `A["x" ]` is printed `A["x"]`, and so is `B{"x" }`,
`C(("x" ))`, and `D[/"t" /]`. [fixture: label-inner-whitespace/quotes-kept]
[fixture: label-inner-whitespace/string-closing-touches] Only whitespace on the
line of the closing quote is dropped: a line break, a comment line, a directive,
or a U+2028 or U+2029 on that line between the quote and the bracket stays, and
a bracket after a line break stands as a continuation line. A U+2028 or U+2029
at the start of a continuation line is read as its indentation, so it is
replaced by the indentation that the printer gives the line. [fixture:
label-inner-whitespace/string-closing-break-and-directive-kept] [test: U+2028
between the closing quote and the bracket of a flowchart label] [test: U+2029
between the closing quote and the bracket of a flowchart label] The closing `|`
of the label of a link touches the closing quote in the same way: `A-->|"x" |B`
is printed `A -->|"x"| B`, and a directive, or a U+2028 or U+2029, between the
quote and the `|` stays. [fixture:
label-inner-whitespace/pipe-string-closing-touches] [test: U+2028 between the
closing quote and the `|` of a flowchart edge label]

The whitespace at the start of a label is kept, as one space, when the label
would be read differently without it, or not read at all: when the label starts
with `/`, `\`, `-`, or `"`, and when its first word, up to whitespace or a `"`,
has a `@`. [fixture: label-inner-whitespace/compat-leading-backslash-kept]
[fixture: label-inner-whitespace/leading-whitespace-trimmed-without-trigger]
[fixture: label-inner-whitespace/leading-whitespace-run-becomes-one] Without the
space, `A[ /x/]` would become a lean-right shape with the label `x`, `A( -x-)`
an ellipse, and `A>x@ ]` would be rejected, because the run of an edge id does
not stop at `>` and reads `A>x` as an edge id. Such a label then has one space
at its end too: `A[ /x/]` becomes `A[ /x/ ]`, except before the closing `?]` or
`=]` of a slanted shape, where mermaid.js would read the space and the `?` or
`=` as text: `A[/ -x/?]` stays as it is. The rule is the same for every shape
and for the text between `|`. [fixture:
label-inner-whitespace/leading-whitespace-every-shape-kept] [fixture:
label-inner-whitespace/leading-whitespace-pipe-label-kept]

The `@` in the first word depends on the version of mermaid.js. 12.3.0 stops the
run of an edge id at a bracket and at `|`, so it reads `A[user@example.com]` and
`A-->|x@|B` with the same labels as it reads them with the whitespace. The
grammars of 11.5.0, the first with edge ids, to 12.2.0 do not stop it there (the
grammars of the tags show it), so they reject the two without the whitespace and
accept them with it; drawn in Chromium, 11.12.3, 11.13.0, 11.14.0, 11.15.0,
11.16.1, and 12.0.0 did. A text printed without the space would be rejected by
versions that read the text as it is written, so the space stays after every
opening, in the title of a subgraph, and in a flowchart, a swimlane diagram, and
an agentflow diagram alike, with one space at the end of the label too, except
before the closing `?]` or `=]` of a slanted shape, as above (`A[/ x@/?]` stays
as it is). [fixture: label-inner-whitespace/leading-whitespace-at-sign-kept]
[fixture: label-inner-whitespace/leading-whitespace-at-sign-every-shape-kept]
[fixture:
label-inner-whitespace/leading-whitespace-at-sign-before-question-end-kept]
[fixture: label-inner-whitespace/leading-whitespace-at-sign-swimlane-kept]

Input
([label-inner-whitespace/trimmed-input.mmd](../tests/fixtures/flowchart/label-inner-whitespace/trimmed-input.mmd)):

```mmd
flowchart LR
  A[ text ]
  B( round )
  C{ decision }
  A -->| label |B
```

Output
([label-inner-whitespace/trimmed-output.mmd](../tests/fixtures/flowchart/label-inner-whitespace/trimmed-output.mmd)):

```mmd
flowchart LR
  A[text]
  B(round)
  C{decision}
  A -->|label| B
```

Input
([label-inner-whitespace/inner-whitespace-kept-input.mmd](../tests/fixtures/flowchart/label-inner-whitespace/inner-whitespace-kept-input.mmd)):

```mmd
flowchart LR
  A[ hello   world ]
```

Output
([label-inner-whitespace/inner-whitespace-kept-output.mmd](../tests/fixtures/flowchart/label-inner-whitespace/inner-whitespace-kept-output.mmd)):

```mmd
flowchart LR
  A[hello   world]
```

Input
([label-inner-whitespace/quoted-kept-input.mmd](../tests/fixtures/flowchart/label-inner-whitespace/quoted-kept-input.mmd)):

```mmd
flowchart LR
  A[" text "]
```

Output
([label-inner-whitespace/quoted-kept-output.mmd](../tests/fixtures/flowchart/label-inner-whitespace/quoted-kept-output.mmd)):

```mmd
flowchart LR
  A[" text "]
```

Input
([label-inner-whitespace/leading-whitespace-kept-input.mmd](../tests/fixtures/flowchart/label-inner-whitespace/leading-whitespace-kept-input.mmd)):

```mmd
flowchart LR
A[ /x/]
B( -x-)
C(( -x))
D[/ "x /]
H[ %%{init: {}}%%/x/]
I{ -x }
J> x@ ]
```

Output
([label-inner-whitespace/leading-whitespace-kept-output.mmd](../tests/fixtures/flowchart/label-inner-whitespace/leading-whitespace-kept-output.mmd)):

```mmd
flowchart LR
  A[ /x/ ]
  B( -x- )
  C(( -x ))
  D[/ "x /]
  H[ %%{init: {}}%%/x/ ]
  I{ -x }
  J> x@ ]
```

Input
([label-inner-whitespace/leading-whitespace-before-question-end-kept-input.mmd](../tests/fixtures/flowchart/label-inner-whitespace/leading-whitespace-before-question-end-kept-input.mmd)):

```mmd
flowchart LR
B[/ -x/?]
C[/ -x/=]
```

Output
([label-inner-whitespace/leading-whitespace-before-question-end-kept-output.mmd](../tests/fixtures/flowchart/label-inner-whitespace/leading-whitespace-before-question-end-kept-output.mmd)):

```mmd
flowchart LR
  B[/ -x/?]
  C[/ -x/=]
```

Input
([label-inner-whitespace/leading-whitespace-at-sign-kept-input.mmd](../tests/fixtures/flowchart/label-inner-whitespace/leading-whitespace-at-sign-kept-input.mmd)):

```mmd
flowchart LR
A[ user@example.com ]
B-->| x@ |C
D-->| y@z |E
F[ @x ]
G[ x@ y ]
H[ a@b@ ]
I(( x@ ))
```

Output
([label-inner-whitespace/leading-whitespace-at-sign-kept-output.mmd](../tests/fixtures/flowchart/label-inner-whitespace/leading-whitespace-at-sign-kept-output.mmd)):

```mmd
flowchart LR
  A[ user@example.com ]
  B -->| x@ | C
  D -->| y@z | E
  F[ @x ]
  G[ x@ y ]
  H[ a@b@ ]
  I(( x@ ))
```

### Link label form

A link label keeps the form it is written in: text between two arrows, or text
between `|` after the arrow. The examples in the documentation of mermaid.js use
the first form 14 times and the second 8 times, which is not twice as often (see
[The label of a link](./compatibility.md#the-label-of-a-link)). [fixture:
link-label-form/other-link-kinds-kept] [fixture:
link-label-form/flowchart-header-both-forms-kept] Turning one form into the
other would need rules for labels that hold a `|`: `A -- a|b --> B` is accepted,
and `A -->|a|b| B` is not. [fixture:
link-label-form/pipe-in-text-between-arrows-kept]

The label of a link of a swimlane diagram is printed between `|`, since the
examples in the documentation of mermaid.js use that form 12 times and the other
none. This holds for a label of plain text (letters, digits, spaces, `_`, `,`,
`?`, and `!`) and for the eight arrows `-->`, `---`, `--o`, `--x`, `-.->`,
`-.-`, `==>`, and `===`: `A -- text --> B` is printed `A -->|text| B`. A label
that holds a `|` or a `%%`, a string, and a Markdown label stay as written.
[fixture: link-label-form/swimlane-arrows-to-pipes]

Input
([link-label-form/kept-input.mmd](../tests/fixtures/flowchart/link-label-form/kept-input.mmd)):

```mmd
flowchart LR
  A -- text --> B
  C -->|text| D
```

Output
([link-label-form/kept-output.mmd](../tests/fixtures/flowchart/link-label-form/kept-output.mmd)):

```mmd
flowchart LR
  A -- text --> B
  C -->|text| D
```

### Chains

A chain of links stays on one line, as written. [fixture:
chains/labelled-links-kept] It is not split into one link per line: where the
author splits statements and links is kept, as with long lines and statements
written over several lines. [fixture: chains/split-after-semicolon]

Input
([chains/kept-input.mmd](../tests/fixtures/flowchart/chains/kept-input.mmd)):

```mmd
flowchart LR
  A --> B --> C
  D & E --> F
```

Output
([chains/kept-output.mmd](../tests/fixtures/flowchart/chains/kept-output.mmd)):

```mmd
flowchart LR
  A --> B --> C
  D & E --> F
```

### Line wrapping

Lines are not wrapped, whatever Prettier's `printWidth` option says, except that
a data block `@{ … }` on one line whose line is wider than `printWidth` prints
on several lines under the conditions of [Data blocks](#data-blocks). [fixture:
line-wrapping/print-width-ignored] Where else a line is broken is the author's
choice, as with chains.

Input
([line-wrapping/long-line-kept-input.mmd](../tests/fixtures/flowchart/line-wrapping/long-line-kept-input.mmd)):

```mmd
flowchart LR
  AAAAAAAAAAAAAAAAAAAA --> BBBBBBBBBBBBBBBBBBBB --> CCCCCCCCCCCCCCCCCCCC --> DDDDDDDDDDDDDDDDDDDD
```

Output
([line-wrapping/long-line-kept-output.mmd](../tests/fixtures/flowchart/line-wrapping/long-line-kept-output.mmd)):

```mmd
flowchart LR
  AAAAAAAAAAAAAAAAAAAA --> BBBBBBBBBBBBBBBBBBBB --> CCCCCCCCCCCCCCCCCCCC --> DDDDDDDDDDDDDDDDDDDD
```

### Accessibility lines

An ordinary accessibility line prints `accTitle: value` or `accDescr: value`:
the colon touches the keyword, one ASCII space precedes the value, and
whitespace at both ends of the value is dropped. [fixture:
accessibility-lines/tight-colon] [fixture: accessibility-lines/spaced-colon]
[fixture: accessibility-lines/value-runs-collapsed] Among Db-equal forms, follow
the sibling diagram types unless the diagram has a reason of its own. Flowchart
has none for an ordinary accessibility line, so it uses the same compact form as
[C4](./c4.md#accessibility-lines), [class](./class.md#labels) and
[usecase](./usecase.md#direction-and-accessibility).

A run of spaces and tabs inside the value of an `accDescr` is printed as one
space (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)),
and that of an `accTitle` stays as written, since the browser shows it as a
tooltip; inline `%%` and `#` remain value text. [fixture:
accessibility-lines/value-runs-collapsed] [fixture:
accessibility-lines/block-runs-collapsed] [fixture:
accessibility-lines/inline-percent-hash] An empty or whitespace-only value keeps
the statement form, `accTitle:` or `accDescr:`, without a following space.
[fixture: accessibility-lines/empty-title] [fixture:
accessibility-lines/empty-description] [corpus fixture:
flowchart/gram-acc-title-empty-at-end] [corpus fixture:
flowchart/db-acc-descr-empty-replaces] Mermaid reads ordinary text on the next
line after the colon as the value; join that text onto the keyword's line.
[fixture: accessibility-lines/next-line-values]

A real comment or directive prevents compact joining. Keep the previous
[Multi-line statements](#multi-line-statements) layout: continuation lines,
including comment and directive lines, stand one level deeper than the keyword;
the comment/directive text and the authored statement breaks remain. Flowchart
skips a comment after the colon to read the later value. This preserves the
existing continuation rule when ordinary joining does not apply. [fixture:
accessibility-lines/next-line-comment-kept] [fixture:
accessibility-lines/description-comment-continuation] [fixture:
accessibility-lines/inline-directive-kept] [fixture:
accessibility-lines/next-line-directive-kept] [fixture:
accessibility-lines/title-directive-continuation]

The compact form does not override
[Statements one per line](#statements-one-per-line): a line holding a
non-separator `;`, including one in the value or another statement, keeps the
accessibility text and the whitespace beside its `;` as written. A statement
written over several lines is kept as written when joining its lines, with one
space or with nothing, could change which `;` the line rule ignores; any other
statement over several lines is joined as usual, also when it holds a `;`.
[fixture: accessibility-lines/semicolon-value-kept] [fixture:
accessibility-lines/neighbour-semicolon-kept] A `;` alone does not prevent
joining. [fixture: accessibility-lines/next-line-semicolon-joined]
Direction-text lines keep their written text, line breaks and indentation under
[Indentation](#indentation), and other documented kept-line reasons still take
priority. [fixture: accessibility-lines/direction-text-kept] [fixture:
accessibility-lines/next-line-direction-kept] Configured indentation, including
its minimum at `tabWidth: 0` and `useTabs`, applies to ordinary lines; those
options also retain these exceptions. [fixture: accessibility-lines/zero-width]
[fixture: accessibility-lines/tabs]

CR follows the shared line-ending normalization. Accepted NBSP, U+2028 and
U+2029 in the exterior gaps normalize under the same colon/value rules, while
internal value characters and whitespace beside a kept `;` stay written. These
characters use escaped inline tests. [test: graph accessibility: flowchart
cr-lines] [test: graph accessibility: flowchart unicode-gaps] [test: graph
accessibility: flowchart unicode-values] [test: graph accessibility: flowchart
unicode-semicolon-kept]

A closed description block with no text or trivia prints its interior as `{}`,
including when its braces contained spaces or blank lines. The exterior
keyword-to-brace gap prints one space, even when the tokens originally touched,
so the keyword and body opener remain distinct: `accDescr {}`. [fixture:
accessibility-lines/empty-block-touching-keyword] There is no text for an
interior space to surround, so follow usecase's Db-equal form, with the same
sibling-diagram reason as the colon lines. [fixture:
accessibility-lines/empty-block-tight] [fixture:
accessibility-lines/empty-block-spaced] [fixture:
accessibility-lines/empty-block-lines] Accepted NBSP, U+2028 and U+2029 inside
an otherwise empty block also disappear. [test: accessibility blocks: flowchart
empty-block-unicode] Kept-line exceptions still take priority, and blocks with
comments or directives retain their existing layout. [fixture:
accessibility-lines/empty-block-semicolon-kept] [fixture:
accessibility-lines/empty-block-directive-kept] [fixture:
multi-line-values/accdescr-block-comment-only]

Blocks on one line follow
[A description block on one line](./compatibility.md#a-description-block-on-one-line).
[fixture: accessibility-lines/block-tight-text] [fixture:
accessibility-lines/block-spaced-text] [fixture:
accessibility-lines/block-padded-text] [fixture:
accessibility-lines/block-left-padding-only] [fixture:
accessibility-lines/block-right-padding-only] The documentation of mermaid.js
has no example of a block on one line.

Multiline body columns follow the top-level or subgraph rules in
[Multi-line values](#multi-line-values), and a closing brace on its own line
aligns with `accDescr`, whether written at column zero or indented. This is the
same form as the sibling diagrams, with no flowchart-specific reason to differ.
[fixture: accessibility-lines/block-close-column-zero] [fixture:
accessibility-lines/block-close-indented] [fixture:
accessibility-lines/block-comment-close-column-zero] [fixture:
accessibility-lines/block-comment-close-indented] The same empty-block and
closer rules apply with the minimum body step at `tabWidth: 0`. [fixture:
accessibility-lines/block-zero-width]

Input (escaped):
`"flowchart LR\naccTitle:Compact title\naccDescr:Compact description"`.

Output
([accessibility-lines/tight-colon-output.mmd](../tests/fixtures/flowchart/accessibility-lines/tight-colon-output.mmd)):

```mmd
flowchart LR
  accTitle: Compact title
  accDescr: Compact description
```

Input (escaped): `"flowchart LR\naccDescr {a}\nA[Block spacing]"`.

Output
([accessibility-lines/block-tight-text-output.mmd](../tests/fixtures/flowchart/accessibility-lines/block-tight-text-output.mmd)):

```mmd
flowchart LR
  accDescr: a
  A[Block spacing]
```

Input (escaped):
`"flowchart LR\naccDescr: previous description\naccDescr { }\nA[Empty spacing]"`.

Output
([accessibility-lines/empty-block-spaced-output.mmd](../tests/fixtures/flowchart/accessibility-lines/empty-block-spaced-output.mmd)):

```mmd
flowchart LR
  accDescr: previous description
  accDescr {}
  A[Empty spacing]
```

Input (escaped):
`"flowchart LR\naccTitle:\n%%{init: {}}%%\nTitle after directive\nA[Continuation]"`.

Output
([accessibility-lines/title-directive-continuation-output.mmd](../tests/fixtures/flowchart/accessibility-lines/title-directive-continuation-output.mmd)):

```mmd
flowchart LR
  accTitle:
    %%{init: {}}%%
    Title after directive
  A[Continuation]
```

### Multi-line statements

A statement written over several lines keeps its line breaks, except ordinary
accessibility colon lines and closed empty description blocks without trivia,
which join under [Accessibility lines](#accessibility-lines). Each later line of
other statements stands one level deeper than the first. Where the author breaks
a statement is the author's choice, as with chains and long lines, and a line
break between tokens needs no whitespace at the end of the line, which the
printer never writes; a sequence diagram, a class diagram, and a state diagram
join such lines instead, because there a line break counts only after
whitespace. [fixture: multi-line-statements/continuation-in-subgraph] [fixture:
multi-line-statements/label-over-lines] [fixture:
multi-line-statements/directive-inside] Comment lines inside it stay inside it,
at the level of its later lines. [fixture:
multi-line-statements/several-comments-inside] A `click` statement with a line
break in a gap between its parts, or in a comment or a directive that stands in
such a gap, is kept as written, because mermaid.js rejects some of them when a
later line is indented. [fixture: multi-line-statements/click-in-subgraph-kept]
[fixture: multi-line-statements/click-forms-kept] [fixture:
multi-line-statements/click-comment-inside-kept] A line break inside a string,
or between the `(` and the `)` of a call with arguments, is part of that value
(a comment or a directive there included), which is printed as written, and no
later line of the statement is indented. The other gaps of such a statement
follow the ordinary rules: `click   A "/u" "x` and `y"` on the next line is
printed `click A "/u" "x` and `y"`, as the statement on one line would be.
[fixture: multi-line-statements/click-string-over-lines-collapsed] [fixture:
multi-line-statements/click-callback-args-over-lines-collapsed] [fixture:
multi-line-statements/click-callback-args-comment-line-collapsed] [fixture:
multi-line-statements/click-string-over-lines-directive-inside] A directive, a
`;`, a comment line, or an empty line beside it is treated as for a statement on
one line. [fixture:
multi-line-statements/click-string-over-lines-beside-directive] [fixture:
multi-line-statements/click-string-over-lines-with-semicolon] [fixture:
multi-line-statements/click-string-over-lines-semicolon-kept] [fixture:
multi-line-statements/click-string-over-lines-comment-and-empty-line] A U+2028
or U+2029 between its parts stays where it is, also after a string that runs
over lines. [test: U+2028 between the parts of a flowchart click statement with
a string over lines] [test: U+2029 between the parts of a flowchart click
statement with a string over lines] [test: U+2028 after the string of a
flowchart click statement with a string over lines] [test: U+2029 after the
string of a flowchart click statement with a string over lines]

A diagram header or subgraph header with a comment line after U+2028 or U+2029
keeps that span as written: mermaid.js removes the comment line and its
preceding whitespace and joins the continuation to the preceding text. [test: a
comment line after U+2028 in a flowchart header] [test: a comment line after
U+2029 in a flowchart header] [test: a comment line after U+2028 in a flowchart
subgraph header] [test: a comment line after U+2029 in a flowchart subgraph
header] A statement with such a comment line keeps its span as written, from its
start to its end, for the same reason (see
[A comment line after U+2028 or U+2029](./compatibility.md#a-comment-line-after-u2028-or-u2029)).
[test: a comment line after U+2028 in a flowchart statement] [test: a comment
line after U+2029 in a flowchart statement]

Input
([multi-line-statements/continuation-indented-input.mmd](../tests/fixtures/flowchart/multi-line-statements/continuation-indented-input.mmd)):

```mmd
flowchart LR
  A -->
B -->
      C
```

Output
([multi-line-statements/continuation-indented-output.mmd](../tests/fixtures/flowchart/multi-line-statements/continuation-indented-output.mmd)):

```mmd
flowchart LR
  A -->
    B -->
    C
```

Input
([multi-line-statements/comment-inside-input.mmd](../tests/fixtures/flowchart/multi-line-statements/comment-inside-input.mmd)):

```mmd
flowchart LR
  A -->
%% between
B
```

Output
([multi-line-statements/comment-inside-output.mmd](../tests/fixtures/flowchart/multi-line-statements/comment-inside-output.mmd)):

```mmd
flowchart LR
  A -->
    %% between
    B
```

Input
([multi-line-statements/click-kept-input.mmd](../tests/fixtures/flowchart/multi-line-statements/click-kept-input.mmd)):

```mmd
flowchart LR
  A
  click A
cb
```

Output
([multi-line-statements/click-kept-output.mmd](../tests/fixtures/flowchart/multi-line-statements/click-kept-output.mmd)):

```mmd
flowchart LR
  A
  click A
cb
```

### Data blocks

Keep each `@{ ... }` attached to its vertex, without formatting its YAML or
changing its keys and values. Three things change: the ends of a block on one
line, the margin of an eligible multiline block, and a block on one line whose
line is too long, which prints on several lines. Only whitespace, line breaks
and the `,` between entries change.

A block on one line is printed with one space inside each end:
`A@{shape: circle}` and `A@{   shape: circle   }` become `A@{ shape: circle }`.
mermaid.js reads the text of a block on one line as a YAML flow mapping, with
`{` and a line feed before it and a line feed and `}` after it
([flowchart](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L160-L168),
[agentflow](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L364-L371),
[kanban](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/kanban/kanbanDb.ts#L118-L129),
[sequence](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/sequence/sequenceDb.ts#L164-L172)),
so the spaces and tabs at its ends carry no meaning. [fixture:
data-blocks/one-line-padded] [fixture: data-blocks/one-line-padded-zero-width]
Only spaces and tabs are removed: other whitespace, such as U+00A0, is part of
the text. [test: data blocks: flowchart one line with no-break spaces at the
ends] A block that holds nothing but spaces and tabs, or nothing, is printed
`@{ }`: mermaid.js reads an empty flow mapping, so the Db and the figure are the
same for `A@{}`, `A@{   }`, and `A@{ }`. In a sequence diagram `@{}` is
rejected, and `@{   }` is accepted. [fixture:
data-blocks/one-line-space-only-padded] The block stays as written

- when a `%%{` lies in it: a directive keeps its text and its columns, as it
  does in a block of several lines; [fixture:
  data-blocks/one-line-directive-kept]
- when its line is kept in full, as under the conditions below; [fixture:
  data-blocks/one-line-kept-line-kept]
- when it touches another block, with nothing or only directives between them,
  as in `}@{`: mermaid.js joins the text of two blocks that touch, so a space
  inside one end changes the text of both; [fixture:
  data-blocks/one-line-touching-blocks-kept]
- when its text starts at the first column with `---`, `...` or `%`. mermaid.js
  reads `---` or `...` followed by whitespace or the end as a YAML document
  marker, and a space before it makes it an ordinary string, so `A@{---}` is
  rejected while `A@{ --- }` is accepted. A start such as `---x` is no marker
  and `%a: 1` is rejected with or without a space, but the rule for several
  lines keeps all three starts, and so does this one. A space or tab that is
  already there lets the block be padded; [fixture:
  data-blocks/compat-document-marker-data-block-kept] [fixture:
  data-blocks/one-line-document-marker-after-space-padded]
- when a U+2028 or U+2029 lies in it: mermaid.js wraps such a text as one line
  and reads it the same with or without the spaces, but the rule for a block on
  one line is limited to a text without any line break, these two included.
  [test: data blocks: flowchart one line with U+2028 inside] [test: data blocks:
  flowchart one line with U+2029 inside]

Blocks that do not touch are padded each, also several in one statement, and a
block of one line next to a block of several lines in the same statement.
[fixture: data-blocks/one-line-separate-blocks-padded] Comments, directives,
blank lines, empty description blocks and a discarded statement `;` beside the
block keep their own rules, and CRLF and CR follow `endOfLine`. [fixture:
data-blocks/one-line-surrounding-trivia] [test: data blocks: flowchart one line
CRLF] [test: data blocks: flowchart one line CR]

A block on one line whose line is longer than `printWidth` prints on several
lines where that reads better: one entry on each line, one level inside the
statement, with the `}` alone on a line at the column of the statement, as in a
block of several lines that moves (see below). Prettier chooses between the two
forms: the block stays on its line where the line fits, and where the line would
still be too long up to the `{` (a long text of the node stands before it), the
lines would not shorten what is too long, so the block stays. [fixture:
data-blocks/long-split] [fixture: data-blocks/long-prefix-too-long-kept] The
width of the line is the width that Prettier measures, in which a tab counts for
nothing, so a line with tabs can be wider on the screen than it measures and
stay on its line. [fixture: data-blocks/long-tabs-not-counted] mermaid.js reads
the text of a block on one line as a YAML flow mapping, whose entries a `,`
separates, and the text of a block of several lines as a block mapping, whose
entries stand on lines of their own (the sources above). Both read the same
where every entry is a key and a value that the two readings read alike, which
the conditions below ensure. The entries print as written, without the spaces
and tabs at their ends: only the whitespace, the line breaks and the `,` between
entries change, and the Db is the same. The block splits only if

- it belongs to a flowchart, an agentflow or a kanban diagram. A sequence
  diagram rejects the lines of a block mapping, and the `@{` of a use case
  diagram holds its own syntax (see
  [Multi-line values](./sequence.md#multi-line-values) and
  [Native metadata](./usecase.md#native-metadata)); [fixture:
  sequence/whitespace-between-tokens/data-block-long-kept] [fixture:
  usecase/native-metadata/long-block-kept]
- `tabWidth` is not zero, as for a block of several lines; [fixture:
  data-blocks/long-zero-width-kept]
- the printer does not indent with tabs (`useTabs`): the lines of a split block
  are indented with spaces, which stand right for one width of a tab only, while
  a block on its line reads the same at every width. A block on one line stays
  on its line; [fixture: data-blocks/long-use-tabs-kept]
- it is the only block of its statement and the last thing in it, on the first
  line of the statement: text after its `}` would stand after the `}` on a line
  of its own, which reads worse than the block on its line, and the first line
  supplies the level of the statement; [fixture:
  data-blocks/long-text-after-kept] [fixture: data-blocks/long-two-blocks-kept]
- it has at least two entries: the lines of a single entry would not shorten the
  line, and only add lines; [fixture: data-blocks/long-one-entry-kept]
- every entry is a key and a value separated by a colon and whitespace, the
  value being a quoted scalar that ends the entry or a plain scalar. A plain
  scalar starts with none of the characters YAML gives a meaning (`&`, `*`, `!`,
  `|`, `>`, `%`, `@`, a backquote, and `-`, `?` or `:` before whitespace), and
  holds no `:` before whitespace or at its end, since a block mapping reads
  those differently from a flow mapping. An entry without a value (`pos` in
  `{ pos, h: 60 }`), an empty entry (after a trailing `,`), a value that is an
  anchor or an alias, and an entry such as `pos:t` are none of these; [fixture:
  data-blocks/long-entry-without-value-kept] [fixture:
  data-blocks/long-trailing-comma-kept] [fixture:
  data-blocks/long-indicator-value-kept] [fixture:
  data-blocks/long-colon-without-space-kept]
- no `[`, `]`, `{` or `}` stands outside the quotes, and no comment (a `#` at
  the start or after whitespace): a flow collection in a value reads as one
  entry that is not one line, and a comment ends the line in a block mapping;
  [fixture: data-blocks/long-nested-kept] [fixture:
  data-blocks/long-comment-kept]
- the conditions of the padding hold: no directive in the block, no kept line,
  no block that touches it. [fixture: data-blocks/long-kept-line-kept]

A value with a `:` that no whitespace follows, as in a URL, splits. [fixture:
data-blocks/long-url-value-split] A block that was split is a block of several
lines, which keeps its form when formatted again.

Input
([data-blocks/long-split-input.mmd](../tests/fixtures/flowchart/data-blocks/long-split-input.mmd)):

```mmd
flowchart LR
A@{ shape: rect, label: "A process step with a long label", pos: "t", h: 60, constraint: "on" }
```

Output
([data-blocks/long-split-output.mmd](../tests/fixtures/flowchart/data-blocks/long-split-output.mmd)):

```mmd
flowchart LR
  A@{
    shape: rect
    label: "A process step with a long label"
    pos: "t"
    h: 60
    constraint: "on"
  }
```

For an eligible multiline block, move every body line by the same number of
ASCII spaces until the shallowest line with text stands one level inside its
statement. This preserves relative indentation, including nested YAML, and can
move lines inward or outward. A `}` alone on its line aligns with the statement;
a `}` after body text stays there and moves with that line. [fixture:
data-blocks/zero-and-shallow] [fixture: data-blocks/deep-nested-yaml] [fixture:
data-blocks/closing-after-text]

Move a block only when all these conditions hold; otherwise keep its columns as
written:

- A line break immediately follows `@{`. Mermaid counts the first line's columns
  from the opener and later lines from the source margin: indenting `label: x`
  after an opening line `A@{ shape: rect` makes accepted YAML fail. [fixture:
  data-blocks/inline-opening-kept] Whitespace between the opener and the newline
  also keeps the block written. [fixture: data-blocks/opening-padding-kept]
- Each body line's leading whitespace consists only of ASCII spaces. Mermaid
  rejects tab-indented YAML in flowchart and kanban, and the movement counts
  spaces. [test: data blocks: JSON leading tab kept]
- The block contains no `%%{`: directives retain their authored text and
  columns. [fixture: data-blocks/directive-inside-kept]
- If the shallowest text starts at column zero, no such line starts with `---`,
  `...`, or `%`. Moving a document marker or YAML directive away from column
  zero can make accepted YAML fail. [fixture: data-blocks/document-start-kept]
  [fixture: data-blocks/document-end-kept] [fixture:
  data-blocks/yaml-directive-kept]
- A `}` is alone on its line only when spaces and nothing else stand before it,
  and those spaces are no more than the shallowest line with text. Mermaid reads
  the whitespace before the `}` as the last line of the block text, which a
  literal or folded scalar keeps: a deeper run of spaces is a line with spaces
  of its own, and moving the `}` to the statement would remove it. A tab, a
  no-break space or U+2028 before the `}` is a character of that line too, so
  the row is a body row and its leading whitespace is not spaces. A run of
  spaces as wide as the shallowest line moves. [fixture:
  data-blocks/closing-deeper-kept] [fixture: data-blocks/closing-tab-kept]
  [fixture: data-blocks/closing-equal-depth] [test: data blocks: flowchart NBSP
  before the closer] [test: data blocks: flowchart U+2028 before the closer]
  [test: data blocks: flowchart U+2029 before the closer]
- `tabWidth` is not zero: zero supplies no inner indentation step. [fixture:
  data-blocks/zero-width-kept]
- Neither a block line nor its opening line belongs to a line kept in full,
  including one protected by the semicolon line rule. Moving part of that line
  would violate its preservation. [fixture: data-blocks/kept-body-line]
  [fixture: data-blocks/kept-opening-line]
- The block starts on its statement's first line, so that line's indentation
  supplies the statement level. A block after a newline following `A -->` keeps
  its columns. [fixture: data-blocks/later-statement-line-kept]
- The statement holds no other block, of one line or of several. Once a block
  has moved, the next one would start on a line that is not the statement's
  first, and blocks that touch, as in `}@{`, are read as one text, whose columns
  the move would split. A statement with two blocks keeps its blocks of several
  lines as written; a block of one line in it is padded unless it touches the
  other. [fixture: data-blocks/second-block-kept] [fixture:
  data-blocks/adjacent-single-line-after-kept] [fixture:
  data-blocks/adjacent-single-line-before-kept] [fixture:
  data-blocks/separate-single-line-block-kept] [fixture:
  data-blocks/edge-adjacent-single-line-kept]

With `useTabs`, a statement that holds a block of several lines is printed as
written, the indentation of its first line included. mermaid.js rejects a tab
before the lines of a block, so they are indented with spaces, which stand right
for one width of a tab only. A node line alone, indented to the depth of the
statement while the lines stay where they are, would stand right of the content
and the `}` of the block wherever the author wrote them no deeper than the node
line, and the block would read inside out. The statement stays where the author
put it, which may be shallower than the statements around it, as it was in the
input, and a block that the author has aligned with the node stays aligned.
mermaid.js accepts a tab before a `}` alone on its line, but that line is the
last line of the block text, which a scalar that keeps its empty lines (`|+`,
`>+`) reads, and a tab there changes the value, so the printer sets no tab
there. [fixture: data-blocks/tab-statement-space-body] [fixture:
data-blocks/tab-statement-aligned-body-kept] [fixture:
data-blocks/use-tabs-statement-kept] [fixture:
data-blocks/use-tabs-comment-line-before-kept] [fixture:
data-blocks/use-tabs-empty-lines-kept] [fixture:
data-blocks/use-tabs-folded-empty-lines-kept]

The indentation of that line is the whitespace written at the start of the line
where the statement starts. A directive that stands before the statement on its
line goes with it, and the line is printed as it was written from its start,
except that the run of whitespace between the directive and the statement
becomes one space, as under [Directives](#directives). A statement that follows
others on its line, as `A@{ … }` does in `C; A@{ … }`, goes on a line of its
own, since the printer puts a statement on a line of its own, and that line
starts with the indentation written at the start of the source line; the
statements before it, which hold no block, are indented as usual, and only the
statement that has the block needs its line to stay with its lines. [fixture:
data-blocks/use-tabs-directive-before-on-line] [fixture:
data-blocks/use-tabs-not-first-on-line] [fixture:
data-blocks/use-tabs-two-statements-before]

The whitespace written at the start of a line is the indentation of the first
thing on the line, after the directives that start on it, and only these things
count: a statement that starts on the line, the header of a container, a section
keyword, an `end`, and the `}` that closes a data block `@{ … }` of a statement
from an earlier line. The printer prints a header, a section keyword, and an
`end` at the depth of their container, and the `}` of a block that it moves at
the column of its statement. An author writes the `}` of a block in the column
of its statement too, and where the author did not, the statement that follows
the `}` stays in the column of the `}`, as written. A statement is printed as
written when it is at the depth of the first thing, as `C; A@{ … }` is, and so
are the statement in `end; A@{ … }`, where the `end` comes first: the printer
prints it at the depth of its container, and a statement after the container is
at that depth too, and the statement in `}; A@{ … }`, where the `}` of the block
of a statement at the same depth comes first. [fixture:
data-blocks/use-tabs-after-end-on-line] [fixture:
data-blocks/use-tabs-after-block-closer-on-line]

Any other statement is moved: the printer sets the indentation of the node line,
and the lines of the block move with it, as in the next paragraph. That is a
statement deeper than the first thing, when the header of a container comes
first, as in `subgraph s; A@{ … }`, where the statement is inside the container;
and a statement shallower than it, when a statement inside a container comes
first, or an `end` of an inner container, as in `B; end; A@{ … }` and
`end; end; A@{ … }`, where the statement is after the container. Nothing was
written for the depth of the statement then. [fixture:
data-blocks/use-tabs-subgraph-header-moved] [fixture:
data-blocks/use-tabs-nested-subgraph-header-moved] [fixture:
data-blocks/use-tabs-statement-before-end-moved] [fixture:
data-blocks/use-tabs-end-before-end-moved] [fixture:
data-blocks/use-tabs-block-closer-before-end-moved] A line that starts with
anything else is moved too, since its whitespace is the indentation of none of
the things above: the rest of a statement from an earlier line, as the line of
`C; A@{ … }` after `B -->`, the rest of a label that a line break splits, or the
`}` of a description block `accDescr { … }`; the rest of a directive that runs
over lines, as in `C; %%{init:` and `{}}%% A@{` on the next line; and a kind
that this list does not name. A kind left out is moved, which leaves the lines
of the block in the order that mermaid.js reads, and the lines stand right where
a tab is as wide as `tabWidth`. [fixture:
data-blocks/use-tabs-edge-continuation-moved] [fixture:
data-blocks/use-tabs-label-continuation-moved] [fixture:
data-blocks/use-tabs-description-block-closer-moved] [fixture:
data-blocks/use-tabs-directive-continuation-moved]

Where the printer must set the indentation of the node line itself, the lines of
the block move with it, as without `useTabs`, indented with spaces: the header
of an agentflow container, whose `end` stands at the indentation of the header,
a statement that is not at the depth of a first thing that counts, or whose line
starts with anything else (see above), and a kanban node, whose indentation
mermaid.js reads as its level (see
[Metadata blocks](./agentflow.md#metadata-blocks) and
[Data blocks](./kanban.md#data-blocks)). The lines then stand right where a tab
is as wide as `tabWidth`, whatever the author wrote, and off by the difference
at any other width. Lines left as written would stand right only where the
indentation of the author happens to fit the width of a tab, and left of the
node line wherever the author wrote them shallower than it.

A block without body text has no shallowest text line and stays as written.
[fixture: usecase/json-tables/empty-body-kept]

The same movement applies to agentflow metadata, kanban data, usecase JSON
tables and sequence participant data. Sequence additionally requires exactly one
body line with text: Mermaid trims the whole block, removing only the first
line's margin, and indenting later keys can make accepted YAML fail. See
[Metadata blocks](./agentflow.md#metadata-blocks),
[Data blocks](./kanban.md#data-blocks), [JSON tables](./usecase.md#json-tables)
and [Multi-line values](./sequence.md#multi-line-values).

Space-only lines move by the same amount, becoming empty if the movement removes
all their spaces; empty lines stay empty. Preserve trailing whitespace on every
body line: literal block scalars read both blank-line widths and trailing
spaces, and changing them can change the Db. [fixture:
data-blocks/scalar-blank-lines] [fixture:
data-blocks/scalar-blank-lines-outdent]

Directives, comments, blank lines, empty description blocks and a discarded
statement `;` beside the block keep their own rules. CRLF and CR follow
`endOfLine`; U+2028 and U+2029 inside values remain characters. [fixture:
data-blocks/surrounding-trivia] [test: data blocks: flowchart CRLF] [test: data
blocks: flowchart CR] [test: data blocks: flowchart U+2028] [test: data blocks:
flowchart U+2029]

An indented comment line inside an eligible block moves with the other body
lines, keeping its authored line and text. [fixture:
data-blocks/indented-comment-line]

Input
([data-blocks/deep-nested-yaml-input.mmd](../tests/fixtures/flowchart/data-blocks/deep-nested-yaml-input.mmd)):

```mmd
flowchart LR
subgraph Group
A@{
        label: Alpha
        custom:
          nested: yes
 }
end
```

Output
([data-blocks/deep-nested-yaml-output.mmd](../tests/fixtures/flowchart/data-blocks/deep-nested-yaml-output.mmd)):

```mmd
flowchart LR
  subgraph Group
    A@{
      label: Alpha
      custom:
        nested: yes
    }
  end
```

### Multi-line values

A quoted string written over several lines keeps its columns. [fixture:
multi-line-values/markdown-string-kept] At the top level, align the lines of an
`accDescr { ... }` body one step inside its statement: Mermaid discards leading
indentation after LF from the accessibility description. Inside a subgraph, keep
the columns of a block with text, because its raw text is also stored among the
subgraph's members. [fixture:
multi-line-values/accdescr-block-subgraph-raw-membership-kept] The `}` of the
block stands at the level of the `accDescr` it closes. [fixture:
multi-line-values/accdescr-block-kept] Comment contents inside such a block are
kept, with their columns following the same top-level or subgraph rule.
[fixture: multi-line-values/accdescr-block-comment-line-in-subgraph-kept] In a
multiline block whose text starts on the line of the `{`, one space stands
inside each brace. [fixture:
multi-line-values/accdescr-block-text-starts-on-brace-line] Blocks on one line
follow
[A description block on one line](./compatibility.md#a-description-block-on-one-line),
and empty blocks without trivia follow
[Accessibility lines](#accessibility-lines). A block without text, whose lines
are only comment lines, holds no value: its comment lines stand one level deeper
than the `accDescr`, as comment lines inside a statement do (see
[Comments](#comments)), and its `}` at the level of the `accDescr`. [fixture:
multi-line-values/accdescr-block-comment-only-several-comments] [fixture:
multi-line-values/accdescr-block-comment-only-in-subgraph]

Input
([multi-line-values/string-kept-input.mmd](../tests/fixtures/flowchart/multi-line-values/string-kept-input.mmd)):

```mmd
flowchart LR
  A["first line
      second line"]
```

Output
([multi-line-values/string-kept-output.mmd](../tests/fixtures/flowchart/multi-line-values/string-kept-output.mmd)):

```mmd
flowchart LR
  A["first line
      second line"]
```

Input
([multi-line-values/accdescr-block-closing-brace-aligned-input.mmd](../tests/fixtures/flowchart/multi-line-values/accdescr-block-closing-brace-aligned-input.mmd)):

```mmd
flowchart LR
subgraph S
accDescr {
  first line
      second line
      }
A
end
accDescr {   one line   }
accDescr {
  text
%% note
    }
accDescr {
}
```

Output
([multi-line-values/accdescr-block-closing-brace-aligned-output.mmd](../tests/fixtures/flowchart/multi-line-values/accdescr-block-closing-brace-aligned-output.mmd)):

```mmd
flowchart LR
  subgraph S
    accDescr {
  first line
      second line
    }
    A
  end
  accDescr: one line
  accDescr {
    text
    %% note
  }
  accDescr {}
```

Input
([multi-line-values/accdescr-block-comment-only-input.mmd](../tests/fixtures/flowchart/multi-line-values/accdescr-block-comment-only-input.mmd)):

```mmd
flowchart LR
A
accDescr {
%% only a comment
      }
```

Output
([multi-line-values/accdescr-block-comment-only-output.mmd](../tests/fixtures/flowchart/multi-line-values/accdescr-block-comment-only-output.mmd)):

```mmd
flowchart LR
  A
  accDescr {
    %% only a comment
  }
```

### Comments

A comment on a line of its own stands at the level of the statements around it,
before the header too, where it starts the line. A comment belongs to no
statement, so it takes the level of its neighbours, which is where a reader
looks for it. [fixture: comments/only-comment-in-subgraph] [fixture:
comments/after-end] [fixture: comments/tab-indented-and-consecutive] [fixture:
comments/after-frontmatter-before-header] [fixture: comments/before-header]
[fixture: comments/before-end] [fixture: comments/at-end-of-text] The text of a
comment is kept as written, including whitespace at its end: mermaid.js does not
read it, and it is the author's text. [fixture:
comments/trailing-whitespace-kept] [fixture: comments/leading-whitespace-kept]
[fixture: comments/statement-text-kept] [fixture: comments/directive-text-kept]

Input
([comments/indented-input.mmd](../tests/fixtures/flowchart/comments/indented-input.mmd)):

```mmd
flowchart LR
%% top comment
A --> B
      %%comment written without a space
  subgraph S
%% inside
    C
  end
```

Output
([comments/indented-output.mmd](../tests/fixtures/flowchart/comments/indented-output.mmd)):

```mmd
flowchart LR
  %% top comment
  A --> B
  %%comment written without a space
  subgraph S
    %% inside
    C
  end
```

Input
([comments/before-end-input.mmd](../tests/fixtures/flowchart/comments/before-end-input.mmd)):

```mmd
flowchart LR
subgraph S
A
%% before end
end
```

Output
([comments/before-end-output.mmd](../tests/fixtures/flowchart/comments/before-end-output.mmd)):

```mmd
flowchart LR
  subgraph S
    A
    %% before end
  end
```

### Directives

A directive (`%%{ ... }%%`) on a line of its own stands at the level of the
statements around it, for the same reason as a comment. [fixture:
directives/own-line-in-subgraph] [fixture: directives/several-on-own-line]
[fixture: directives/multi-line-on-own-line] [fixture:
directives/own-line-between-comment-and-empty-line] Within a printed line, a
directive stays in its authored gap. [fixture:
directives/after-header-on-same-line] [fixture:
directives/after-end-on-same-line] [fixture:
directives/after-last-statement-without-line-break]

mermaid.js removes a directive from the text before it reads it, so the
whitespace that remains is that of the two sides of the directive together: a
unit such as `note for`, or the text after `title`, reads exactly one whitespace
character, and a space on each side of a directive would leave two. The gap
therefore prints as its ordinary rule prints it without the directive, and the
directive stands after the space of that rule, touching the unit that follows
it: `A  %%{init: {}}%%  --> B`, `A %%{init: {}}%%--> B`, and
`A%%{init: {}}%%-->B` are all printed `A %%{init: {}}%%--> B`. [fixture:
directives/whitespace-on-both-sides] [fixture:
directives/whitespace-on-each-side] [fixture: directives/touching-token]
[fixture: directives/header-keyword-touching] [fixture:
directives/meets-empty-description-block] [fixture:
class/directives/count-sensitive-unit] Where the rule has no space, the
directive touches the units on both sides: `click C call m( %%{x}%%  )` is
printed `click C call m(%%{x}%%)`. [fixture:
whitespace-between-tokens/callback-blank-parentheses-touch] Directives in one
gap touch each other. [fixture: directives/several-in-gap]

A gap whose whitespace the line rule of mermaid.js may read (see
[Semicolons](#semicolons)) keeps the whitespace written on each side of the
directive, a run becoming one space. [fixture: directives/in-line-rule-stretch]
A directive at the start or at the end of a printed line keeps whether its gap
with the unit beside it holds whitespace, a run becoming one space: no unit
stands on its other side, and the gap needs no rule of its own. [fixture:
directives/line-edge-whitespace] A gap that holds a U+2028 or U+2029 stays as
written, since replacing the character would join the two segments that the line
rule reads. [test: U+2028 before a directive in the gap of a flowchart] [test:
U+2029 after a directive in the gap of a flowchart] [test: U+2028 beside a
directive between a `:` and a `#` of a flowchart] A `;` that the line rule
ignores (see [Semicolons](#semicolons)) in the gap of a directive stays in the
order written, and the space of the rule stands before the first directive:
`A[style:#x] --> B ;%%{init: {}}%% --> C` is printed
`A[style:#x] --> B; %%{init: {}}%%--> C`, and
`A[style:#x] --> B %%{init: {}}%% ; --> C` is printed
`A[style:#x] --> B %%{init: {}}%%;--> C`. [fixture:
directives/ignored-semicolon-and-directive-in-gap] The content of a directive is
kept as written. [fixture: directives/compat-malformed-directive-kept] [fixture:
directives/content-kept]

When formatting splits units that were on the same line, a directive in their
gap moves with the following unit. Keep its right-side contact or separation;
break its left contact.

[fixture: flowchart/directives/same-line-as-statements]

Input
([directives/indented-input.mmd](../tests/fixtures/flowchart/directives/indented-input.mmd)):

```mmd
%%{init: {"theme": "dark"}}%%
flowchart LR
%%{init: {"flowchart": {"curve": "basis"}}}%%
A --> B
```

Output
([directives/indented-output.mmd](../tests/fixtures/flowchart/directives/indented-output.mmd)):

```mmd
%%{init: {"theme": "dark"}}%%
flowchart LR
  %%{init: {"flowchart": {"curve": "basis"}}}%%
  A --> B
```

Input
([directives/same-line-as-statements-input.mmd](../tests/fixtures/flowchart/directives/same-line-as-statements-input.mmd)):

```mmd
flowchart LR
  A --> B %%{init: {}}%%
  C; %%{init: {}}%% D
```

Output
([directives/same-line-as-statements-output.mmd](../tests/fixtures/flowchart/directives/same-line-as-statements-output.mmd)):

```mmd
flowchart LR
  A --> B %%{init: {}}%%
  C
  %%{init: {}}%% D
```

Input
([directives/touching-token-input.mmd](../tests/fixtures/flowchart/directives/touching-token-input.mmd)):

```mmd
flowchart LR
  A%%{init: {}}%%-->B
```

Output
([directives/touching-token-output.mmd](../tests/fixtures/flowchart/directives/touching-token-output.mmd)):

```mmd
flowchart LR
  A %%{init: {}}%%--> B
```

Input
([directives/whitespace-on-each-side-input.mmd](../tests/fixtures/flowchart/directives/whitespace-on-each-side-input.mmd)):

```mmd
flowchart %%{init: {}}%%LR
A
style A %%{init: {}}%%fill:red
click A %%{init: {}}%%href "u"
B%%{init: {}}%% --> C
```

Output
([directives/whitespace-on-each-side-output.mmd](../tests/fixtures/flowchart/directives/whitespace-on-each-side-output.mmd)):

```mmd
flowchart %%{init: {}}%%LR
  A
  style A %%{init: {}}%%fill:red
  click A %%{init: {}}%%href "u"
  B %%{init: {}}%%--> C
```

A directive that is not closed runs to the end of the text, as mermaid.js reads
it. [fixture: directives/compat-unclosed-directive-joins-next-line] [fixture:
directives/unclosed-after-statement-on-same-line] Its range ends at its last
character that is not whitespace (the specification's
[Comments, directives, and frontmatter](../../spec/docs/ast.md#directives-and-frontmatter)),
so the whitespace after it is whitespace at the end of the text and is formatted
as such: the text ends with one line break after the directive. When the text
ends right after the directive, no line break is added, since mermaid.js would
read it as part of the directive. The whitespace is at the end of the text, so
the examples are written as strings, in which `\n` is a line break:
`"flowchart LR\nA\n%%{init: {}  \n\n"` is printed as
`"flowchart LR\n  A\n  %%{init: {}\n"`, and `"flowchart LR\nA\n%%{init: {}"` as
`"flowchart LR\n  A\n  %%{init: {}"` (the fixtures
`unclosed-trailing-whitespace` and `unclosed-at-end-of-text-kept` are in the
[folder](../tests/fixtures/flowchart/directives)).

### Direction

The direction is kept as written: `TD` is not changed to `TB`, and `TB` is not
changed to `TD`, in the header or in a `direction` statement. mermaid.js 12.3.0
draws the two the same, but mermaid.js 11.9.0 draws a flowchart with `TB` in its
header differently from the same text with `TD`, and the header keyword is kept
as written too (see
[Versions of mermaid.js](./compatibility.md#versions-of-mermaidjs) and
[The names of a header](./compatibility.md#the-names-of-a-header)). [fixture:
direction/header-td-kept] [fixture: direction/header-tb-kept] [fixture:
direction/header-keyword-kept] [fixture:
direction/statement-td-kept-with-other-header] [fixture:
direction/statement-values-kept] mermaid.js keeps the `TD` of a `direction`
statement in a subgraph as written, so changing it there would change the
diagram, and changing only the header would make the two disagree. The header of
a swimlane diagram is printed with `TB` for `TD`, as the header of an agentflow
diagram is (see [Header](./agentflow.md#header)); both diagram types are later
than the version that made `TD` behave as `TB`. A `TD` that stands after a
directive which follows the header (`swimlane-beta%%{init: {}}%% TD`) stays as
written. [fixture: direction/swimlane-header-td-one-form] [fixture:
direction/swimlane-header-td-after-directive-kept] In a `direction` statement
mermaid.js reads the text before `direction` and after the value as text, which
may hold labels and strings, and a `;` after the value belongs to that text and
is no separator. The text is kept as written; the whitespace between it and
`direction`, and between `direction` and the value, becomes one space, as
between any tokens. A line such as `A[direction TB]` is a `direction` statement
too, its vertices and links are not read, and it is printed so, at the
indentation of its level. [fixture: direction/statement-holds-text-kept] The
direction of the header stands after one space, also where a symbol touched the
keyword: `graph>` is printed `graph >`, and `flowchart^` is printed
`flowchart ^`. The whitespace is not in the Db, and a letter direction such as
`TD` already needs the space. A directive between them is placed as under
[Directives](#directives), and a U+2028 or U+2029 stays where it is. [fixture:
direction/header-symbol-touching-spaced] [fixture:
direction/header-symbol-beside-directive-kept] [test: U+2029 between the graph
keyword and its direction]

Input
([direction/kept-input.mmd](../tests/fixtures/flowchart/direction/kept-input.mmd)):

```mmd
flowchart TD
  subgraph S
    direction TD
    A
  end
```

Output
([direction/kept-output.mmd](../tests/fixtures/flowchart/direction/kept-output.mmd)):

```mmd
flowchart TD
  subgraph S
    direction TD
    A
  end
```

### Subgraph header

The whitespace inside the brackets of the title is dropped, as for the label of
a shape (see [Label inner whitespace](#label-inner-whitespace)):
`subgraph S[ T ]` is printed `subgraph S[T]`, and `subgraph S["x" ]` is printed
`subgraph S["x"]`. mermaid.js reads both spellings as the same subgraph. One
space stays where the title would be read otherwise, with the same rule as for a
label: `[ /x/ ]` and `[ \x\ ]` stay, since `[/x/]` would be rejected. [fixture:
subgraph-header/title-padding-dropped] [fixture:
subgraph-header/title-interior-whitespace-dropped] A line break or a comment
line in the brackets stays, as a line of the header: the whitespace before the
line break is dropped, as at the end of any line, and the bracket after it
stands as a continuation line. [fixture:
subgraph-header/title-padding-beside-line-break] A U+2028 or U+2029 on a line of
the brackets stays where it is, and one at the start of a continuation line is
read as its indentation. [test: U+2028 in the title of a flowchart subgraph
header] [test: U+2029 in the title of a flowchart subgraph header] On a line
that the line rule may read, the whitespace after the `[` of a title that
follows `style:` stays: `subgraph style:[ #x; ]` is printed
`subgraph style:[ #x;]`, while `subgraph a: [ #x; ]` is printed
`subgraph a:[#x;]`, since no `style` stands before its `:`. [fixture:
subgraph-header/title-padding-on-line-rule-line]

The `[` of the title touches the name of the subgraph: `subgraph S [t]` is
printed `subgraph S[t]`, whatever the name is: a word, several words, a string,
or a markdown string. [fixture: subgraph-header/title-whitespace-before-dropped]
[fixture: subgraph-header/title-touches-name] [fixture:
subgraph-header/title-touches-name-kinds] mermaid.js reads both forms the same,
so nothing forces the form. The `[` of the label of a node touches its id, as in
`A[t]`, and the headings of an agentflow touch their titles, as in `flow F[T]`:
all 19 headings with a title in
[the documentation of agentflow](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/agentflow.md#L26-L363)
are written so. The documentation of flowchart has two subgraphs with a title,
and both have a space
([`subgraph ide1 [one]`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/flowchart.md#L1030),
[`subgraph one [My Group]`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/flowchart.md#L1109)),
which does not decide the form. Where the gap lies between a `:` and a `#` of a
line that holds `style` or `classDef` before the `:` and a `;` after the `#`, as
in `subgraph style: [#x;]`, it keeps whether it holds whitespace, as under
[Semicolons](#semicolons); `subgraph a: [#x;]` and `subgraph style: [#x]` have
no such `;` and touch. [fixture: subgraph-header/title-after-colon-before-hash]
A directive in the gap is placed as under [Directives](#directives). [fixture:
subgraph-header/title-beside-directive] [fixture:
subgraph-header/title-beside-directive-runs] A U+2028 or U+2029 in the gap stays
where it is. [test: U+2028 between a subgraph name and its title] [test: U+2029
and spaces between a subgraph name and its title] An empty description block
that follows the title is the first statement of the body, as before. [fixture:
subgraph-header/title-before-empty-description-block] A name of one word,
written without a title, keeps the whitespace after it, which mermaid.js reads
as part of the name: `subgraph S` has the id `S`, and `subgraph S ` has a
generated id, since mermaid.js makes the name the id only where the text of the
name holds no whitespace. A name of several words, as `subgraph S1 S2` or
`subgraph "o p"`, has a generated id with or without whitespace after it, so the
whitespace at the end of its line is left out, but not the whitespace that
separates it from a block, a `;` that stays or a directive on its line. That
whitespace keeps whether it is there, a run becoming one space (see
[Directives between tokens](./compatibility.md#directives-between-tokens)), also
where whitespace after the directive makes mermaid.js read the directive as part
of the name. It is so for a markdown string and in a swimlane diagram too, where
the runs inside the name stay, since mermaid.js draws them there, while the
whitespace at the end of the name is drawn the same whatever its width:
``subgraph "`o p`"   %%{init: {}}%%`` is printed
``subgraph "`o p`" %%{init: {}}%%``. The indentation of the next line that a
name ending with `end` takes is no such whitespace (see below). [fixture:
subgraph-header/name-several-words-directive-run-collapsed] [fixture:
subgraph-header/name-markdown-directive-run-collapsed] [fixture:
subgraph-header/name-swimlane-directive-run-collapsed] [fixture:
subgraph-header/name-swimlane-quoted-directive-run-collapsed] [fixture:
subgraph-header/name-swimlane-before-block-run-collapsed] [fixture:
subgraph-header/name-several-words-directive-trailing-dropped] [fixture:
subgraph-header/name-several-words-two-directives-run-collapsed] [fixture:
subgraph-header/name-trailing-run-collapsed] [fixture:
subgraph-header/name-trailing-whitespace-kept] [fixture:
subgraph-header/name-quoted-trailing-whitespace-kept] [fixture:
subgraph-header/name-several-words-trailing-dropped] [fixture:
subgraph-header/name-several-words-before-block-kept] [fixture:
subgraph-header/name-whitespace-before-directive-kept] [fixture:
subgraph-header/name-whitespace-after-directive-kept] So does the whitespace
around the empty description blocks written on the line of the header: before a
block, between two blocks, and between the last block and a `;`, as in
`subgraph "S"accDescr {} accDescr {}` and `subgraph "U"accDescr {} ;`. [fixture:
subgraph-header/whitespace-before-first-block-kept] The blocks read no token, so
that whitespace follows the name: the subgraph has the id `subGraph0`, and the
id `S` without it. That the whitespace is there is kept; how wide it is, only
before the first block, where it follows the name as written, and a run between
two blocks or before a `;` becomes one space. [fixture:
subgraph-header/runs-between-blocks-become-one] Whitespace after the last block
that a line break follows is read as the line break, and does not count.
[fixture: subgraph-header/whitespace-after-last-block-dropped] The blocks stay
on the line of the header, as written, with the `;` and the directives after
them: on a line of their own, the whitespace would be read otherwise, and a `;`
after a block and a directive would be read as a vertex.

A name that ends with an `end` unit, as in `subgraph Front end`, takes the line
break after it and the whitespace of the next line (see
[Subgraphs](../../spec/docs/diagrams/flowchart.md#subgraphs)), so a block on
that next line follows the name too: its line stays as written, with the
whitespace before the block, and the lines after it are indented as usual. A
name in which the letters are no unit of their own, as `Frontend`, does not, and
the line of the block is indented as usual. [fixture:
subgraph-header/block-on-line-after-name-ending-in-end-letters] [fixture:
subgraph-header/block-on-line-after-end-name-kept] [corpus fixture:
flowchart/db-subgraph-name-end-line-feed-then-empty-description-block]

Input
([subgraph-header/whitespace-before-block-kept-input.mmd](../tests/fixtures/flowchart/subgraph-header/whitespace-before-block-kept-input.mmd)):

```mmd
flowchart LR
subgraph "S"accDescr {} accDescr {}
A
end
subgraph "T"accDescr {}
B
end
subgraph "U"accDescr {} ;
C
end
subgraph "V"accDescr {} %%{init: {}}%%;
D
end
```

Output
([subgraph-header/whitespace-before-block-kept-output.mmd](../tests/fixtures/flowchart/subgraph-header/whitespace-before-block-kept-output.mmd)):

```mmd
flowchart LR
  subgraph "S"accDescr {} accDescr {}
    A
  end
  subgraph "T"accDescr {}
    B
  end
  subgraph "U"accDescr {} ;
    C
  end
  subgraph "V"accDescr {} %%{init: {}}%%;
    D
  end
```

Input
([subgraph-header/title-touches-name-input.mmd](../tests/fixtures/flowchart/subgraph-header/title-touches-name-input.mmd)):

```mmd
flowchart LR
  subgraph S[Title]
    A
  end
  subgraph T [Title]
    B
  end
```

Output
([subgraph-header/title-touches-name-output.mmd](../tests/fixtures/flowchart/subgraph-header/title-touches-name-output.mmd)):

```mmd
flowchart LR
  subgraph S[Title]
    A
  end
  subgraph T[Title]
    B
  end
```

Input
([subgraph-header/name-whitespace-before-directive-kept-input.mmd](../tests/fixtures/flowchart/subgraph-header/name-whitespace-before-directive-kept-input.mmd)):

```mmd
flowchart LR
  subgraph S %%{init: {}}%%
    A
  end
```

Output
([subgraph-header/name-whitespace-before-directive-kept-output.mmd](../tests/fixtures/flowchart/subgraph-header/name-whitespace-before-directive-kept-output.mmd)):

```mmd
flowchart LR
  subgraph S %%{init: {}}%%
    A
  end
```

### Colors

A color in a style is printed in lower case, as the examples in the
documentation of mermaid.js write it and as the CSS formatter of Prettier prints
it: `style A fill:#F9F,stroke:#ABCDEF` is printed
`style A fill: #f9f, stroke: #abcdef`. The colors in the styles of the `style`,
`classDef`, and `linkStyle` statements of a flowchart and of a swimlane diagram
are printed so. A color is a `#` and 3, 4, 6, or 8 hexadecimal digits that stand
alone in the value of a style; it is never shortened, and a text that is no
color stays as written (see
[Colors that are drawn the same](./compatibility.md#colors-that-are-drawn-the-same)).
[fixture: colors/colors-in-lower-case] [fixture:
colors/words-that-are-not-colors-as-written]

Input
([colors/colors-in-lower-case-input.mmd](../tests/fixtures/flowchart/colors/colors-in-lower-case-input.mmd)):

```mmd
flowchart LR
A --> B
C:::c
style A fill:#F9F,stroke:#ABCDEF,color:#C0FFEE
style B fill:#ABCD,stroke:#ABCDEF12
classDef c fill:#DEADBE,stroke:#ABCDEF
linkStyle 0 stroke:#FF0000,color:#00FF00
linkStyle default stroke:#ABCDEF
```

Output
([colors/colors-in-lower-case-output.mmd](../tests/fixtures/flowchart/colors/colors-in-lower-case-output.mmd)):

```mmd
flowchart LR
  A --> B
  C:::c
  style A fill: #f9f, stroke: #abcdef, color: #c0ffee
  style B fill: #abcd, stroke: #abcdef12
  classDef c fill: #deadbe, stroke: #abcdef
  linkStyle 0 stroke: #ff0000, color: #00ff00
  linkStyle default stroke: #abcdef
```

Input
([colors/words-that-are-not-colors-as-written-input.mmd](../tests/fixtures/flowchart/colors/words-that-are-not-colors-as-written-input.mmd)):

```mmd
flowchart LR
A --> B
style A fill:#ABCDE,stroke:#ABCDEF1
style B fill:#AB,stroke:#GGG
classDef c fill:x#ABC,stroke:#ABC-x
classDef d fill:#ABC.5,stroke:#ABC#DEF
classDef e stroke:#ABC/#DEF
```

Output
([colors/words-that-are-not-colors-as-written-output.mmd](../tests/fixtures/flowchart/colors/words-that-are-not-colors-as-written-output.mmd)):

```mmd
flowchart LR
  A --> B
  style A fill: #ABCDE, stroke: #ABCDEF1
  style B fill: #AB, stroke: #GGG
  classDef c fill: x#ABC, stroke: #ABC-x
  classDef d fill: #ABC.5, stroke: #ABC#DEF
  classDef e stroke: #ABC/#DEF
```

### Quotes

The name of a subgraph in quotes is printed without them, as the examples in the
documentation of mermaid.js write it, 53 times without quotes and once in quotes
(see [The quotes of a text](./compatibility.md#the-quotes-of-a-text)):
`subgraph "Group A"` is printed `subgraph Group A`. mermaid.js reads the name in
both forms as the same text, and the id of a name of several words is generated
in both. A name is printed without quotes where it is words of ASCII letters,
digits, and `_` with one space between them, whose parts may be joined by a
single `-` (`my-group`), none of them one of `_blank`, `_parent`, `_self`,
`_top`, `call`, `click`, `default`, `direction`, `end`, `href`, and
`interpolate`, which the lexer reads as a unit of its own and which are compared
by the part before the first `-`, since a `-` ends a keyword (`end-x` is `end`
and `-x`). So `"end"`, `"x end"`, `"click"`, `"end-x"`, `"x _self"`,
`"direction"`, a name with a `-` at its start or its end or two together
(`"-a"`, `"a-"`, `"a--b"`), a name with a `.` or a letter outside ASCII, and a
markdown string stay as written. A name that ends with `direction`, such as
`"xdirection"` or `"my xdirection"`, stays in quotes whatever follows it: the
lexer reads `direction`, white space (a line break too), and `TB`, `BT`, `RL`,
`LR`, or `TD` as one line, which `subgraph xdirection` and a next line
`TB --> C` would form. In a `flowchart`, the lexer of 9.0.0 to 10.3.0 starts a
token after a `-`, a `_`, and a digit, so a name also stays in quotes where
`end` or `interpolate` ends it (`"x-end"`, `"x_end"`), where `click` or `call`
stands before whitespace (`"x-click"`, `"x1call"`), and where `_self`, `_blank`,
`_parent`, or `_top` stands (`"x_self"`, `"a b_top"`); a swimlane diagram prints
these names without quotes. A name that a word touches on its line
(`subgraph "S"accDescr {}`) and a name that a comment follows
(`subgraph "C" %% note`) keep their quotes, since a text without quotes would
take the word or the comment into itself, as does a name of two spaces in a
subgraph that has a title, since there the name is an id, and two ids that
differ by a run are two ids (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)).
A `;` or a directive after a name takes nothing into it, and the name loses its
quotes: `subgraph "D"%%{init: {}}%%` is printed `subgraph D%%{init: {}}%%`.
[fixture: quotes/subgraph-names-without-quotes] [fixture:
quotes/subgraph-names-with-hyphens] [fixture:
quotes/swimlane-lane-names-without-quotes] [fixture:
quotes/subgraph-names-that-need-quotes] [fixture:
quotes/subgraph-names-the-old-lexer-reads] [fixture:
quotes/swimlane-lane-names-the-old-lexer-reads] [fixture:
quotes/subgraph-names-next-to-a-direction-line] [fixture:
quotes/subgraph-names-with-runs-without-quotes] [fixture:
quotes/subgraph-names-before-a-comment] [fixture:
subgraph-header/whitespace-before-block-kept]

The label of a shape, the label of a link, and the title of a subgraph in
brackets are printed without quotes in the same way, as the examples write them:
109 labels of shapes without quotes against 8 in quotes, 32 labels of links
against 1, and 6 titles against none (see
[The quotes of a text](./compatibility.md#the-quotes-of-a-text)).
`A["Start here"]` is printed `A[Start here]`, `A -->|"Is it ready?"| B` is
printed `A -->|Is it ready?| B`, and `subgraph S ["Title"]` is printed
`subgraph S[Title]`. A text is printed without quotes where it starts with a
letter or a digit, has no space at its end, and holds ASCII letters, digits,
spaces, and `_`, `-`, `.`, `,`, `:`, `!`, and `?`. mermaid.js reads `A["x"]` as
a string and `A[x]` as a text, and its Db holds the `labelType` `string` for the
first and `text` for the second, but it draws the same figure (see
[Labels that are drawn the same](./compatibility.md#labels-that-are-drawn-the-same)).
A `.` stays in quotes in a label between two dotted arrows (`-. "a.b" .->`),
which a `.` ends, and a `--` in a label between two solid arrows
(`-- "a--b" -->`), which it ends too. In a `flowchart`, which the lexer of 9.0.0
to 10.3.0 reads with the tokens of a statement, a label also stays in quotes
where it holds a `-` at its end (`("go-")`), an arrow (`---`, `--x`, `--o`,
`.-`), `:::`, `_self`, `_blank`, `_parent`, `_top`, `interpolate`, `click` or
`call` before a space or the end of the label, or `accTitle` or `accDescr`; a
swimlane diagram prints them without quotes. Any other text stays in quotes
(`"x (y)"`, `"a/b"`, `"a & b"`, `"_x"`, `"x "`, `" x"`), and so does a markdown
string, and a label on a line that the printer writes as it is, such as a line
that the line rule of mermaid.js reads whole (see
[Lines that hold a `;`](./compatibility.md#lines-that-hold-a-)). A label written
without quotes stays without them. [fixture: quotes/shape-labels-without-quotes]
[fixture: quotes/link-labels-without-quotes] [fixture:
quotes/subgraph-titles-without-quotes] [fixture: quotes/labels-that-need-quotes]
[fixture: quotes/labels-next-to-trivia] [fixture:
quotes/labels-the-old-lexer-reads] [fixture:
quotes/swimlane-labels-the-old-lexer-reads] [fixture:
quotes/labels-with-two-dashes-between-arrows] [fixture:
quotes/swimlane-labels-with-two-dashes-between-arrows] [fixture:
quotes/swimlane-labels-without-quotes]

Input
([quotes/subgraph-names-without-quotes-input.mmd](../tests/fixtures/flowchart/quotes/subgraph-names-without-quotes-input.mmd)):

```mmd
flowchart TD
subgraph "One"
A --> B
end
subgraph "Group A"
C --> D
end
subgraph "g_2" [Title]
E --> F
end
subgraph "G3"[Title]
G --> H
end
subgraph 'Single'
I --> J
end
subgraph Already
K --> L
end
```

Output
([quotes/subgraph-names-without-quotes-output.mmd](../tests/fixtures/flowchart/quotes/subgraph-names-without-quotes-output.mmd)):

```mmd
flowchart TD
  subgraph One
    A --> B
  end
  subgraph Group A
    C --> D
  end
  subgraph g_2[Title]
    E --> F
  end
  subgraph G3[Title]
    G --> H
  end
  subgraph 'Single'
    I --> J
  end
  subgraph Already
    K --> L
  end
```

Input
([quotes/shape-labels-without-quotes-input.mmd](../tests/fixtures/flowchart/quotes/shape-labels-without-quotes-input.mmd)):

```mmd
flowchart LR
A["text"]
B("Is it ready?")
C(["Step 1: load"])
D[["go-on, then stop!"]]
E[("Database v2")]
F(("x.y"))
G{{"Hexagon"}}
H{"Decision"}
I[/"Input"/]
J[\"Output"\]
K[/"Trapezoid"\]
L[\"Alt trapezoid"/]
M>"Asymmetric"]
N((("Double circle")))
O["a - b"]
P[text]
```

Output
([quotes/shape-labels-without-quotes-output.mmd](../tests/fixtures/flowchart/quotes/shape-labels-without-quotes-output.mmd)):

```mmd
flowchart LR
  A[text]
  B(Is it ready?)
  C([Step 1: load])
  D[[go-on, then stop!]]
  E[(Database v2)]
  F((x.y))
  G{{Hexagon}}
  H{Decision}
  I[/Input/]
  J[\Output\]
  K[/Trapezoid\]
  L[\Alt trapezoid/]
  M>Asymmetric]
  N(((Double circle)))
  O[a - b]
  P[text]
```

Input
([quotes/link-labels-without-quotes-input.mmd](../tests/fixtures/flowchart/quotes/link-labels-without-quotes-input.mmd)):

```mmd
flowchart LR
A -->|"Is it ready?"| B
B -- "Step 1: load" --> C
C == "go-on, then stop!" ==> D
D -- "x" --- E
E -.-> F
F -. "ready?" .-> G
G -. "a.b" .-> H
H -->|"a.b"| I
I -->|plain| J
```

Output
([quotes/link-labels-without-quotes-output.mmd](../tests/fixtures/flowchart/quotes/link-labels-without-quotes-output.mmd)):

```mmd
flowchart LR
  A -->|Is it ready?| B
  B -- Step 1: load --> C
  C == go-on, then stop! ==> D
  D -- x --- E
  E -.-> F
  F -. ready? .-> G
  G -. "a.b" .-> H
  H -->|a.b| I
  I -->|plain| J
```

### Style trailing whitespace

Whitespace at the end of a `style`, `classDef`, or `linkStyle` statement is
dropped. [fixture: style-trailing-whitespace/removed] [fixture:
style-trailing-whitespace/removed-tab] [fixture:
style-trailing-whitespace/removed-after-directive] mermaid.js keeps it at the
end of the last style, so this is one of the rules that change what mermaid.js
stores (see
[Styles that are drawn the same](./compatibility.md#styles-that-are-drawn-the-same));
the tests compare styles without their trailing whitespace. The whitespace of a
`linkStyle` after a `stroke:` is kept as well (see
[Styles that are drawn the same](./compatibility.md#styles-that-are-drawn-the-same)):
`linkStyle default stroke: ` followed by `linkStyle 0 stroke:#f00` keeps the
space. [fixture:
style-trailing-whitespace/link-style-blank-stroke-value-at-end-kept] A
`linkStyle` that ends with a backslash keeps the whitespace after it too, as one
character: `linkStyle default stroke-width:4px\ ` followed by
`linkStyle 0 stroke:#0f0` keeps the space. [fixture:
style-trailing-whitespace/link-style-backslash-at-end-kept] The whitespace is
kept when mermaid.js reads it as a style of its own, after a `,` at the end of
the list, because the statement would be rejected without it: in
`style A fill:#f00, ` and in `classDef c fill:x\, `. [fixture:
style-trailing-whitespace/whitespace-only-value-kept] [fixture:
style-trailing-whitespace/whitespace-only-value-in-link-style-kept] [fixture:
style-trailing-whitespace/whitespace-only-value-before-directive-kept] [fixture:
style-trailing-whitespace/escaped-comma-kept] The same holds for a style that is
all whitespace after a directive or after a `;` that mermaid.js ignores, as in
`style A fill:red,%%{init: {}}%% ` and `style A fill:#f00,; `. [fixture:
style-trailing-whitespace/whitespace-only-value-after-directive-kept] [fixture:
style-trailing-whitespace/whitespace-only-value-after-ignored-semicolon-kept]

The whitespace is at the ends of lines, so the examples are written as strings,
in which `\n` is a line break:
`"flowchart LR\n  A --> B\n  style A fill:#f00   \n"` is printed as
`"flowchart LR\n  A --> B\n  style A fill: #f00\n"`, while
`"flowchart LR\n  A\n  style A fill:#f00, \n"` is printed as it is (the fixtures
`removed` and `whitespace-only-value-kept` are in the
[folder](../tests/fixtures/flowchart/style-trailing-whitespace)).

### Frontmatter YAML

The YAML between the `---` lines is formatted with Prettier's YAML formatter, as
Prettier does for YAML anywhere: the parser does not read it, and formatting it
as YAML is the formatter's job. [fixture:
frontmatter-yaml/compat-unknown-config-formatted] The `---` lines are kept as
written, with the spaces and tabs at the end of each. [fixture:
frontmatter-yaml/closing-delimiter-whitespace-kept] The YAML is kept as written
when Prettier cannot read it, and when the `---` lines are indented: the `---`
lines are kept as written, and a body at the first column between indented `---`
lines would look broken. It is also kept as written when a line of the formatted
YAML is a `---` line, which would end the frontmatter early: Prettier prints
`--- !!map` after a `%YAML` directive as `---` and `!!map` on two lines. It is
also kept as written when it contains a `<` followed by a letter, a digit, or
`_`: mermaid.js rewrites `="..."` inside HTML tags over the whole text,
frontmatter included, before it reads the YAML, and changing the quotes of such
a value can change what mermaid.js reads. [fixture:
frontmatter-yaml/compat-tag-start-digit-kept] [fixture:
frontmatter-yaml/compat-tag-start-underscore-kept] [fixture:
frontmatter-yaml/compat-less-than-without-tag-formatted]

Input
([frontmatter-yaml/formatted-input.mmd](../tests/fixtures/flowchart/frontmatter-yaml/formatted-input.mmd)):

```mmd
---
title:   'Hello'
config: {flowchart: {curve: basis}}
---
flowchart LR
A-->B
```

Output
([frontmatter-yaml/formatted-output.mmd](../tests/fixtures/flowchart/frontmatter-yaml/formatted-output.mmd)):

```mmd
---
title: "Hello"
config: { flowchart: { curve: basis } }
---
flowchart LR
  A --> B
```

Input
([frontmatter-yaml/malformed-kept-input.mmd](../tests/fixtures/flowchart/frontmatter-yaml/malformed-kept-input.mmd)):

```mmd
---
title: [unclosed
---
flowchart LR
A-->B
```

Output
([frontmatter-yaml/malformed-kept-output.mmd](../tests/fixtures/flowchart/frontmatter-yaml/malformed-kept-output.mmd)):

```mmd
---
title: [unclosed
---
flowchart LR
  A --> B
```

Input
([frontmatter-yaml/html-tag-kept-input.mmd](../tests/fixtures/flowchart/frontmatter-yaml/html-tag-kept-input.mmd)):

```mmd
---
title: "<a b=\"c\">"
---
flowchart LR
A-->B
```

Output
([frontmatter-yaml/html-tag-kept-output.mmd](../tests/fixtures/flowchart/frontmatter-yaml/html-tag-kept-output.mmd)):

```mmd
---
title: "<a b=\"c\">"
---
flowchart LR
  A --> B
```

Input
([frontmatter-yaml/delimiter-line-kept-input.mmd](../tests/fixtures/flowchart/frontmatter-yaml/delimiter-line-kept-input.mmd)):

```mmd
---
%YAML 1.2
--- !!map
title: x
---
flowchart LR
A
```

Output
([frontmatter-yaml/delimiter-line-kept-output.mmd](../tests/fixtures/flowchart/frontmatter-yaml/delimiter-line-kept-output.mmd)):

```mmd
---
%YAML 1.2
--- !!map
title: x
---
flowchart LR
  A
```

Input
([frontmatter-yaml/indented-delimiters-kept-input.mmd](../tests/fixtures/flowchart/frontmatter-yaml/indented-delimiters-kept-input.mmd)):

```mmd
  ---
  title: |
      ---
  ---
flowchart LR
A
```

Output
([frontmatter-yaml/indented-delimiters-kept-output.mmd](../tests/fixtures/flowchart/frontmatter-yaml/indented-delimiters-kept-output.mmd)):

```mmd
  ---
  title: |
      ---
  ---
flowchart LR
  A
```

## Kept as written

Some text is always kept as written, because changing it would change the
diagram or the input would be rejected:

- whether a label is in quotes: `A[text]` and `A["text"]` have different label
  types; [fixture: label-inner-whitespace/quotes-kept]
- whether there is whitespace around `&`: `A&B` is one vertex, `A & B` two, and
  `A &B` is rejected (a run of whitespace becomes one space, as between tokens);
  [fixture: arrow-spacing/ampersand-spacing-kept]
- the length of an arrow (`-->` and `--->`), and the header keyword (`graph` or
  `flowchart`); [fixture: arrow-spacing/arrow-length-kept] [fixture:
  direction/header-keyword-kept]
- the content of directives and, apart from the uniform indentation and the ends
  of a block on one line in [Data blocks](#data-blocks), of `@{ ... }` blocks,
  which the parser does not read; [fixture:
  whitespace-between-tokens/compat-unknown-shape-data-block-kept] [fixture:
  whitespace-between-tokens/data-block-kept] [fixture: directives/content-kept]
- the lines of strings written over several lines, and of Markdown strings,
  whose whitespace at the start of a line is part of the value. [fixture:
  multi-line-values/markdown-string-kept] [fixture:
  multi-line-values/string-kept]
