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
whitespace-between-tokens/header-and-tabs-collapsed] Whitespace that is part of
a value is kept, such as the whitespace inside the name of a subgraph, which
becomes its title. In a `style`, `classDef`, or `linkStyle` statement, each
style has no whitespace before its first `:` and one space after it where the
value is not empty. The `,` between styles has no whitespace before it and one
space after it: `style A fill :#f00,stroke:  #333` is printed
`style A fill: #f00, stroke: #333`. [fixture:
whitespace-between-tokens/style-colon-spaced] [fixture:
whitespace-between-tokens/style-colon-empty-value-kept] [fixture:
whitespace-between-tokens/style-comma-before-dropped] A `linkStyle` with link
numbers keeps whether whitespace follows the `,` before a style that starts with
`fill`, a run of whitespace becoming one space. [fixture:
whitespace-between-tokens/link-style-fill-after-comma-kept] The other styles of
such a statement, and `linkStyle default`, use the one form. [fixture:
whitespace-between-tokens/link-style-other-after-comma-spaced] [fixture:
whitespace-between-tokens/link-style-default-after-comma-spaced] A statement
stays as written where whitespace or a `,` follows a backslash, where it holds a
comment or a directive, where a style is all whitespace, or where a style holds
a line break or its line holds a kept `;`. [fixture:
whitespace-between-tokens/style-colon-escaped-space-kept] [fixture:
whitespace-between-tokens/style-comma-escaped-space-kept] [fixture:
whitespace-between-tokens/style-comma-beside-directive-kept] [fixture:
whitespace-between-tokens/style-comma-with-kept-semicolon-kept] A U+2028 or
U+2029 stays where it is. [test: U+2028 before the comma of a flowchart style
statement] [test: U+2029 after the comma of a flowchart style statement] The
text of a `direction` statement before `direction` and after the value is the
exception, kept as written (see [Direction](#direction)). [fixture:
whitespace-between-tokens/class-def-and-link-style-spaced] [fixture:
whitespace-between-tokens/subgraph-quoted-name-kept] In a `style`, `classDef`,
or `linkStyle` statement, the whitespace before the first style, which the
statement rule of mermaid.js reads, becomes one space, also around a directive
there: `style A %%{init: {}}%%  fill:red` and `style A %%{init: {}}%% fill:red`
give the same Db. The whitespace between the words of a style value stays as
written. [fixture: whitespace-between-tokens/style-inner-whitespace-kept]
`linkStyle default`, `classDef`, and `style` use the same form as ER and
requirement (see
[Styles that are drawn the same](./compatibility.md#styles-that-are-drawn-the-same)).

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
([whitespace-between-tokens/subgraph-name-kept-input.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/subgraph-name-kept-input.mmd)):

```mmd
flowchart LR
  subgraph a   b
    A
  end
```

Output
([whitespace-between-tokens/subgraph-name-kept-output.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/subgraph-name-kept-output.mmd)):

```mmd
flowchart LR
  subgraph a   b
    A
  end
```

Input
([whitespace-between-tokens/style-after-directives-collapsed-input.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/style-after-directives-collapsed-input.mmd)):

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
([whitespace-between-tokens/style-after-directives-collapsed-output.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/style-after-directives-collapsed-output.mmd)):

```mmd
flowchart LR
  A
  style A %%{init: {}}%% %%{init: {}}%%fill:red
  classDef a,b %%{init: {}}%% %%{init: {}}%% fill:red
  A --> A
  linkStyle 0 %%{init: {}}%% fill:red
  linkStyle default interpolate basis %%{init: {}}%% %%{init: {}}%%stroke:red
```

The whitespace between the name of the function after `call` and the `(` that
follows it is kept as written, with the parentheses and their arguments:
mermaid.js reads the name up to the `(`, whitespace included, so
`click A call fn  ()` calls the function named `fn` and two spaces. [fixture:
whitespace-between-tokens/callback-name-arguments-forms-kept] The parentheses of
a call with blank arguments touch each other: `click A call f( )` is printed
`click A call f()`, since mermaid.js reads both as the same call with no
arguments. A directive between them keeps whether whitespace was written on each
side of it, as under [Directives](#directives). [fixture:
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
  click A call fn  ( x )
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
[fixture: arrow-spacing/edge-id-not-arrow-like-gets-one-space] A directive or an
ignored `;` between the shape and the edge id keeps whether whitespace was
written on each side of it, a run of whitespace becoming one space. [fixture:
arrow-spacing/edge-id-arrow-like-after-directive] [fixture:
arrow-spacing/edge-id-arrow-like-after-directive-runs-collapsed] [fixture:
arrow-spacing/edge-id-arrow-like-after-ignored-semicolon] [fixture:
arrow-spacing/edge-id-arrow-like-after-ignored-semicolon-runs-collapsed]

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

### Label inner whitespace

Whitespace at the ends of a label without quotes is dropped, as mermaid.js drops
it. [fixture: label-inner-whitespace/trimmed-every-shape] Whitespace inside the
label is kept, and so is a label that is only whitespace (`A[]` would be
rejected). [fixture: label-inner-whitespace/all-whitespace-every-shape-kept] A
label in quotes is kept as written, except for the whitespace between its
closing quote and the closing bracket, which is dropped: `A["x" ]` is printed
`A["x"]`, and so is `B{"x" }`, `C(("x" ))`, and `D[/"t" /]`. [fixture:
label-inner-whitespace/quotes-kept] [fixture:
label-inner-whitespace/string-closing-touches] Only whitespace on the line of
the closing quote is dropped: a line break, a comment line, a directive, or a
U+2028 or U+2029 on that line between the quote and the bracket stays, and a
bracket after a line break stands as a continuation line. A U+2028 or U+2029 at
the start of a continuation line is read as its indentation, so it is replaced
by the indentation that the printer gives the line. [fixture:
label-inner-whitespace/string-closing-break-and-directive-kept] [test: U+2028
between the closing quote and the bracket of a flowchart label] [test: U+2029
between the closing quote and the bracket of a flowchart label] The closing `|`
of the label of a link touches the closing quote in the same way: `A-->|"x" |B`
is printed `A -->|"x"| B`, and a directive, or a U+2028 or U+2029, between the
quote and the `|` stays. [fixture:
label-inner-whitespace/pipe-string-closing-touches] [test: U+2028 between the
closing quote and the `|` of a flowchart edge label]

The whitespace at the start of a label is kept, as one space, when the label
would be read differently without it: when the label starts with `/`, `\`, `-`,
or `"`, and when the label of a `>` shape has a `@` in its first word, up to
whitespace or a `"`. [fixture:
label-inner-whitespace/compat-leading-backslash-kept] [fixture:
label-inner-whitespace/leading-whitespace-trimmed-without-trigger] [fixture:
label-inner-whitespace/leading-whitespace-run-becomes-one] Without the space,
`A[ /x/]` would become a lean-right shape with the label `x`, `A( -x-)` an
ellipse, and `A>x@ ]` would be rejected, because the run of an edge id does not
stop at `>` and reads `A>x` as an edge id. Such a label then has one space at
its end too: `A[ /x/]` becomes `A[ /x/ ]`, except before the closing `?]` or
`=]` of a slanted shape, where mermaid.js would read the space and the `?` or
`=` as text: `A[/ -x/?]` stays as it is. The rule is the same for every shape
and for the text between `|`, except for the `@`. [fixture:
label-inner-whitespace/leading-whitespace-every-shape-kept] [fixture:
label-inner-whitespace/leading-whitespace-pipe-label-kept]

After any other opening than `>`, a `@` in a label needs no space. The run of an
edge id stops at the brackets and at `|`, so `A[x@]` and `A-->|x@|B` have the
label `x@` with or without the whitespace, and `A[ user@example.com ]` becomes
`A[user@example.com]`. [fixture:
label-inner-whitespace/leading-whitespace-at-sign-trimmed] Agentflow differs:
its edge id run does not stop there, `A[x@]` is rejected, and so the space stays
before a label whose first word has a `@` (see [Labels](./agentflow.md#labels)).

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

### Link label form

A link label keeps the form it is written in: text between two arrows, or text
between `|` after the arrow. [fixture: link-label-form/other-link-kinds-kept]
Turning one form into the other would need rules for labels that hold a `|`:
`A -- a|b --> B` is accepted, and `A -->|a|b| B` is not. [fixture:
link-label-form/pipe-in-text-between-arrows-kept]

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

Lines are not wrapped, whatever Prettier's `printWidth` option says. [fixture:
line-wrapping/print-width-ignored] Where a line is broken is the author's
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
[fixture: accessibility-lines/value-padding] Among Db-equal forms, follow the
sibling diagram types unless the diagram has a reason of its own. Flowchart has
none for an ordinary accessibility line, so it uses the same compact form as
[C4](./c4.md#accessibility-lines), [class](./class.md#labels) and
[usecase](./usecase.md#direction-and-accessibility).

Internal whitespace and inline `%%` and `#` remain value text. [fixture:
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

Nonempty blocks follow [Multi-line values](#multi-line-values): the text of a
block on one line stands between one space on each side, so `{a}`, `{ a }`,
`{  a  }`, `{  a}`, and `{a  }` all become `{ a }`. mermaid.js trims the text,
so the whitespace at its ends carries no meaning, and the `@{ ... }` blocks of
[Data blocks](#data-blocks) are printed the same way. The documentation of
mermaid.js has no example of a block on one line. [fixture:
accessibility-lines/block-tight-text] [fixture:
accessibility-lines/block-spaced-text] [fixture:
accessibility-lines/block-padded-text] [fixture:
accessibility-lines/block-left-padding-only] [fixture:
accessibility-lines/block-right-padding-only] A block stays as written when it
holds a comment or a directive, or a line break, and so does a block whose text
holds a `%%{`, as in `accDescr {A%%{}%% B`, where the first `}` closes the block
and padding it would change the directive. [fixture:
accessibility-lines/block-text-beside-directive-kept] [fixture:
pie/description-blocks/block-first-brace] A block on a line that keeps its `;`
gets no added space, whatever its text is, since the line rule of mermaid.js
reads the whole line (see [Semicolons](#semicolons)): `{a;b}` and `{a; b}` stay
as written, and so does a block in `A[style];accDescr {b:c;}D#z;`, where the
added space would break the `:` and `#` that the rule pairs. A run of spaces at
an end of such a block still becomes one space: `{  a;b  }` is printed
`{ a;b }`. [fixture: accessibility-lines/block-text-with-semicolon-kept]
[fixture: accessibility-lines/block-on-style-line-kept] A `;` that only
separates statements is dropped, and the block is padded. [fixture:
accessibility-lines/block-text-with-semicolons-padded] A U+2028 or U+2029 in the
text makes it several lines, and stays. [test: U+2028 in the text of a flowchart
description block] [test: U+2029 in the text of a flowchart description block]
Whitespace at the ends that is not an ASCII space or tab, such as a no-break
space, is trimmed by mermaid.js too and prints as one space. [test: no-break
spaces at the ends of the text of a flowchart description block] Multiline body
columns follow the top-level or subgraph rules in
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
  accDescr { a }
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
changing its keys, values, delimiters, or line count. Two things change: the
ends of a block on one line, and the margin of an eligible multiline block.

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
ends] The block stays as written

- when it holds nothing but spaces and tabs: `A@{}` is rejected, while `A@{   }`
  is accepted; [fixture: data-blocks/one-line-space-only-kept]
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

Body margins and a separate `}` use ASCII spaces, even with `useTabs`: the `}`
stands at the column of the statement. A tab before the `}` makes the last line
of the block a line with text in a scalar that keeps its empty lines (`|+`,
`>+`), and changes the value. [fixture: data-blocks/tab-statement-space-body]
[fixture: data-blocks/closing-with-tabs-keeps-empty-lines] [fixture:
data-blocks/closing-with-tabs-keeps-folded-empty-lines]

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
[fixture: multi-line-values/accdescr-block-comment-line-in-subgraph-kept] When
the text starts on the line of the `{`, it stands between one space on each side
(see [Accessibility lines](#accessibility-lines)). Empty blocks without trivia
instead follow [Accessibility lines](#accessibility-lines). [fixture:
multi-line-values/accdescr-block-text-starts-on-brace-line] A block without
text, whose lines are only comment lines, holds no value: its comment lines
stand one level deeper than the `accDescr`, as comment lines inside a statement
do (see [Comments](#comments)), and its `}` at the level of the `accDescr`.
[fixture: multi-line-values/accdescr-block-comment-only-several-comments]
[fixture: multi-line-values/accdescr-block-comment-only-in-subgraph]

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
  accDescr { one line }
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
directives/after-last-statement-without-line-break] Where whitespace was written
on a side of the directive, one space stands there; where the directive touched
a token, it keeps touching it. [fixture:
directives/whitespace-on-both-sides-collapsed] [fixture:
directives/meets-empty-description-block] mermaid.js reads the text without the
directive, so the whitespace that remains must not change: a unit such as
`note for`, or the text after `title`, reads exactly one whitespace character,
and one space on each side of a directive that had it on one side only would
leave two. The content of a directive is kept as written. [fixture:
directives/compat-malformed-directive-kept] [fixture: directives/content-kept]

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
([directives/touching-token-kept-input.mmd](../tests/fixtures/flowchart/directives/touching-token-kept-input.mmd)):

```mmd
flowchart LR
  A%%{init: {}}%%-->B
```

Output
([directives/touching-token-kept-output.mmd](../tests/fixtures/flowchart/directives/touching-token-kept-output.mmd)):

```mmd
flowchart LR
  A%%{init: {}}%%--> B
```

Input
([directives/whitespace-on-each-side-kept-input.mmd](../tests/fixtures/flowchart/directives/whitespace-on-each-side-kept-input.mmd)):

```mmd
flowchart %%{init: {}}%%LR
A
style A %%{init: {}}%%fill:red
click A %%{init: {}}%%href "u"
B%%{init: {}}%% --> C
```

Output
([directives/whitespace-on-each-side-kept-output.mmd](../tests/fixtures/flowchart/directives/whitespace-on-each-side-kept-output.mmd)):

```mmd
flowchart %%{init: {}}%%LR
  A
  style A %%{init: {}}%%fill:red
  click A %%{init: {}}%%href "u"
  B%%{init: {}}%% --> C
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

The direction is kept as written: `TD` is not changed to `TB`, in the header or
in a `direction` statement. [fixture: direction/header-td-kept] [fixture:
direction/statement-td-kept-with-other-header] [fixture:
direction/statement-values-kept] mermaid.js keeps the `TD` of a `direction`
statement in a subgraph as written, so changing it there would change the
diagram, and changing only the header would make the two disagree. In a
`direction` statement mermaid.js reads the text before `direction` and after the
value as text, which may hold labels and strings, and a `;` after the value
belongs to that text and is no separator. The text is kept as written; the
whitespace between it and `direction`, and between `direction` and the value,
becomes one space, as between any tokens. A line such as `A[direction TB]` is a
`direction` statement too, its vertices and links are not read, and it is
printed so, at the indentation of its level. [fixture:
direction/statement-holds-text-kept] The direction of the header stands after
one space, also where a symbol touched the keyword: `graph>` is printed
`graph >`, and `flowchart^` is printed `flowchart ^`. The whitespace is not in
the Db, and a letter direction such as `TD` already needs the space. A directive
between them keeps whether whitespace was written on each side of it, and a
U+2028 or U+2029 stays where it is. [fixture:
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
A directive in the gap keeps whether whitespace was written on each side of it,
a run of whitespace becoming one space, as under [Directives](#directives).
[fixture: subgraph-header/title-beside-directive-kept] [fixture:
subgraph-header/title-beside-directive-runs-collapsed] A U+2028 or U+2029 in the
gap stays where it is. [test: U+2028 between a subgraph name and its title]
[test: U+2029 and spaces between a subgraph name and its title] An empty
description block that follows the title is the first statement of the body, as
before. [fixture: subgraph-header/title-before-empty-description-block] A name
written without a title keeps the whitespace after it, which mermaid.js reads as
part of the name. [fixture: subgraph-header/name-trailing-run-kept] [fixture:
subgraph-header/name-trailing-whitespace-kept] [fixture:
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

### Style trailing whitespace

Whitespace at the end of a `style`, `classDef`, or `linkStyle` statement is
dropped. [fixture: style-trailing-whitespace/removed] [fixture:
style-trailing-whitespace/removed-tab] [fixture:
style-trailing-whitespace/removed-after-directive] mermaid.js keeps it at the
end of the last style, so this is one of the rules that change what mermaid.js
stores (see
[Styles that are drawn the same](./compatibility.md#styles-that-are-drawn-the-same));
the tests compare styles without their trailing whitespace. The whitespace is
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
