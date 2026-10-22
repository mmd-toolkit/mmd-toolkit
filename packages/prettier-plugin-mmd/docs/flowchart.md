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
Statements written on one line and separated by `;` are split into lines: a `;`
only separates them, and a line of several statements is hard to read. [fixture:
statements-one-per-line/separated-by-semicolons-meets-others]

A line that holds a `;` other than one that separates statements, such as the
`;` in `A[x;]`, in `accTitle: a;b`, or in a comment, keeps its statements and
its `;` instead: they are not split into lines of their own, and its `;` stay
where they are, with the whitespace on each side of them as written. [fixture:
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
[Semicolons](#semicolons)).

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
statements-one-per-line/semicolon-after-style-text-not-word-split] In a name,
`end` takes the whitespace after it, line feeds included, so
`subgraph Front end` followed by a line break and `A` has the name `Front end`,
a line feed, and `A`, and no members, while `subgraph Front end ;` has the
member A. The `;` stays where it is when it stands on a later line, with the
whitespace before it as written, as part of the `subgraph` line. [corpus
fixture: flowchart/semicolon-after-end-name-2a3a795c] In a name, only `end` and
`click` read the line break after them; the other words of the list are there
because the list is shared with the text of a statement, and keeping a `;` there
changes nothing that mermaid.js reads. [fixture:
statements-one-per-line/semicolon-after-name-word-kept] [corpus fixture:
flowchart/name-semicolon-whitespace-0c9483e4] [corpus fixture:
flowchart/name-semicolon-whitespace-0fd5a434] [corpus fixture:
flowchart/name-semicolon-whitespace-05fd0f99] `Front pend` and `Front endx` do
not end with the word. [fixture:
statements-one-per-line/semicolon-after-name-not-end-dropped] A directive that
cuts the word does not change that: mermaid.js removes directives before it
reads the text. [fixture:
statements-one-per-line/semicolon-after-word-cut-by-directive-kept]

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
  style B fill:click;
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
flowchart/style-line-separator-semicolon-2a0f3253] [fixture:
statements-one-per-line/compat-unclosed-directive-semicolon-kept] [fixture:
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
  style A fill:#f00
  classDef c fill:#fff,stroke:#333
  style B fill:#0f0
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
a value is kept: the whitespace around the `,` of a list of styles, which
mermaid.js keeps in the style, and the whitespace inside the name of a subgraph,
which becomes its title. The text of a `direction` statement before `direction`
and after the value is the exception, kept as written (see
[Direction](#direction)). [fixture:
whitespace-between-tokens/style-values-in-class-def-and-link-style-kept]
[fixture: whitespace-between-tokens/subgraph-quoted-name-kept] In a `style`,
`classDef`, or `linkStyle` statement, the whitespace before the first style,
which the statement rule of mermaid.js reads, becomes one space, also around a
directive there: `style A %%{init: {}}%%  fill:red` and
`style A %%{init: {}}%% fill:red` give the same Db. What follows the start of
the first style, up to the last style, is kept as written: mermaid.js reads it
as part of the styles. [fixture:
whitespace-between-tokens/style-inner-whitespace-kept]

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
  style A fill:#f00
  class A c
  F --> G
```

Input
([whitespace-between-tokens/style-values-kept-input.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/style-values-kept-input.mmd)):

```mmd
flowchart LR
  A
  style A fill:#f00 , stroke:#333
```

Output
([whitespace-between-tokens/style-values-kept-output.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/style-values-kept-output.mmd)):

```mmd
flowchart LR
  A
  style A fill:#f00 , stroke:#333
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
whitespace-between-tokens/callback-name-arguments-forms-kept]

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
arrow-spacing/edge-id-whitespace-before-arrow-dropped]

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

### Label inner whitespace

Whitespace at the ends of a label without quotes is dropped, as mermaid.js drops
it. [fixture: label-inner-whitespace/trimmed-every-shape] Whitespace inside the
label is kept, and so is a label that is only whitespace (`A[]` would be
rejected). [fixture: label-inner-whitespace/all-whitespace-every-shape-kept] A
label in quotes is kept as written. [fixture:
label-inner-whitespace/quotes-kept]

The whitespace at the start of a label is kept, as one space, when the label
would be read differently without it: when the label starts with `/`, `\`, `-`,
or `"`, and when its first word, up to whitespace or a `"`, contains `@`.
[fixture: label-inner-whitespace/compat-leading-backslash-kept] [fixture:
label-inner-whitespace/leading-whitespace-trimmed-without-trigger] [fixture:
label-inner-whitespace/leading-whitespace-run-becomes-one] Without the space,
`A[ /x/]` would become a lean-right shape with the label `x`, `A( -x-)` an
ellipse, and `A[ x@ ]` would be rejected. Such a label then has one space at its
end too: `A[ /x/]` becomes `A[ /x/ ]`, except before the closing `?]` or `=]` of
a slanted shape, where mermaid.js would read the space and the `?` or `=` as
text: `A[/ -x/?]` stays as it is. The rule is the same for every shape and for
the text between `|`. [fixture:
label-inner-whitespace/leading-whitespace-every-shape-kept] [fixture:
label-inner-whitespace/leading-whitespace-pipe-label-kept]

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
E[ user@example.com ]
F-->| x@ |G
H[ %%{init: {}}%%/x/]
I{ -x }
```

Output
([label-inner-whitespace/leading-whitespace-kept-output.mmd](../tests/fixtures/flowchart/label-inner-whitespace/leading-whitespace-kept-output.mmd)):

```mmd
flowchart LR
  A[ /x/ ]
  B( -x- )
  C(( -x ))
  D[/ "x /]
  E[ user@example.com ]
  F -->| x@ | G
  H[ %%{init: {}}%%/x/ ]
  I{ -x }
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

### Multi-line statements

A statement written over several lines keeps its line breaks, and each of its
later lines stands one level deeper than its first. Where the author breaks a
statement is the author's choice, as with chains and long lines, and a line
break between tokens needs no whitespace at the end of the line, which the
printer never writes; a sequence diagram, a class diagram, and a state diagram
join such lines instead, because there a line break counts only after
whitespace. [fixture: multi-line-statements/continuation-in-subgraph] [fixture:
multi-line-statements/label-over-lines] [fixture:
multi-line-statements/directive-inside] Comment lines inside it stay inside it,
at the level of its later lines. [fixture:
multi-line-statements/several-comments-inside] A `click` statement written over
several lines is kept as written, because mermaid.js rejects some of them when a
later line is indented. [fixture: multi-line-statements/click-in-subgraph-kept]
[fixture: multi-line-statements/click-forms-kept] [fixture:
multi-line-statements/click-comment-inside-kept]

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

### Multi-line values

The lines of a value written over several lines keep their columns: a string in
quotes, and the text of an `accDescr { ... }` block when it starts on the line
after the `{`. [fixture: multi-line-values/markdown-string-kept] Inside a
subgraph, mermaid.js also lists the text of such a block among the members of
the subgraph, indentation included, so the indentation cannot be changed.
Outside a subgraph the columns of the lines are not in the Db, and the lines are
kept all the same, so that one rule holds for the text of every block. [fixture:
multi-line-values/accdescr-block-comment-only-in-subgraph] The `}` of the block
stands at the level of the `accDescr` it closes. [fixture:
multi-line-values/accdescr-block-kept] Comment lines inside such a block are
kept as written too. [fixture:
multi-line-values/accdescr-block-comment-line-in-subgraph-kept] When the text
starts on the line of the `{`, the whitespace around it becomes one space, as
between tokens. [fixture:
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
  accDescr {
  }
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
directives/own-line-between-comment-and-empty-line] A directive on the same line
as a statement stays on that line. [fixture:
directives/after-header-on-same-line] [fixture:
directives/after-end-on-same-line] [fixture:
directives/after-last-statement-without-line-break] Where whitespace was written
on a side of the directive, one space stands there; where the directive touched
a token, it keeps touching it. [fixture:
directives/whitespace-on-both-sides-collapsed] [fixture:
directives/meets-empty-description-block] mermaid.js reads the text without the
directive, so whether two tokens are apart must not change. The content of a
directive is kept as written. [fixture:
directives/compat-malformed-directive-kept] [fixture: directives/content-kept]

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
direction/statement-holds-text-kept]

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

The title's interior whitespace stays as written, so `[ T ]` remains `[ T ]`:
both forms have the same Db, and the heading keeps the author's title spelling.
[fixture: subgraph-header/title-interior-whitespace-kept]

Whether there is whitespace between the id of a subgraph and its title in
brackets is kept as written; a run of it becomes one space. [fixture:
subgraph-header/title-run-of-whitespace-becomes-one] mermaid.js reads both forms
the same, and both are in use, so the choice is left to the author. A name
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
([subgraph-header/title-spacing-kept-input.mmd](../tests/fixtures/flowchart/subgraph-header/title-spacing-kept-input.mmd)):

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
([subgraph-header/title-spacing-kept-output.mmd](../tests/fixtures/flowchart/subgraph-header/title-spacing-kept-output.mmd)):

```mmd
flowchart LR
  subgraph S[Title]
    A
  end
  subgraph T [Title]
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
end of the last style, so this is the one rule that changes what mermaid.js
stores; the tests compare styles without their trailing whitespace. The
whitespace is kept when mermaid.js reads it as a style of its own, after a `,`
at the end of the list, because the statement would be rejected without it: in
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
`"flowchart LR\n  A --> B\n  style A fill:#f00\n"`, while
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
- the content of `@{ ... }` data blocks and of directives, which the parser does
  not read; [fixture:
  whitespace-between-tokens/compat-unknown-shape-data-block-kept] [fixture:
  whitespace-between-tokens/data-block-kept] [fixture: directives/content-kept]
- the lines of strings written over several lines, and of Markdown strings,
  whose whitespace at the start of a line is part of the value. [fixture:
  multi-line-values/markdown-string-kept] [fixture:
  multi-line-values/string-kept]
