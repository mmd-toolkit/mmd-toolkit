# Flowchart formatting rules

Japanese version: [flowchart.ja.md](./flowchart.ja.md)

How prettier-plugin-mmd formats a flowchart: the diagram types `flowchart`,
`graph`, `flowchart-elk`, and `swimlane-beta`. Each rule below keeps what
mermaid.js reads from the diagram; where a change would alter it, the text is
kept as written, and the rule says where.

Each rule has a folder of examples under
[`tests/fixtures/flowchart/`](../tests/fixtures/flowchart), named as the rule's
heading: the rule "Arrow spacing" is the folder `arrow-spacing`. Each example is
a pair of files, the input and the formatted output, and the tests check both
that the plugin prints the output and that mermaid.js reads the same diagram
from the input and the output. The examples in this document are copies of those
files, and a test checks that they are the same.

## Rules

### Indentation

The statements after the header stand one level deeper than the header, and the
statements of a subgraph one level deeper than its `subgraph` line, with `end`
at the level of `subgraph`. A level is what Prettier's `useTabs` and `tabWidth`
options say: two spaces by default. The indentation written in the input is not
kept.

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
indentation. mermaid.js reads an indented line that holds such a text as a
direction statement: `accTitle: t;direction TB` is an accessibility title, and
the same line indented is the direction `TB`.

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

Each statement stands on a line of its own. Statements written on one line and
separated by `;` are split into lines.

A line that holds a `;` other than one that separates statements, such as the
`;` in `A[x;]`, in `accTitle: a;b`, or in a comment, keeps its statements and
its `;` instead: they are not split into lines of their own, and its `;` stay
where they are, with the whitespace on each side of them as written. The
statements are formatted as anywhere else. The whitespace beside a kept `;` is
not made the same everywhere, because on such a line the `;` may be one that
mermaid.js ignores, and then a space after it changes how the text around it is
read. mermaid.js ignores the last `;` of some lines, those that contain `style`,
a `:`, and a `#` in this order before a `;`. Removing a separating `;`, or
splitting the line, would make it ignore another `;`: `A[style:#x;];` has the
label `style:` followed by the entity `#x;`, while `A[style:#x;]` has the label
`style:#x`. Which `;` it ignores is not in the tree, so every such line keeps
its statements together, whether it contains `style` or not. The rule reads only
`style`, `:`, `#`, and `;`, so the whitespace between other tokens may change.

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
I[style:#x;]-->J;K   -->L
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
  I[style:#x;] --> J;K --> L
```

A line also keeps its statements together and its `;` in place when a statement
on it ends with one of the ids `accTitle`, `accDescr`, `direction`, `click`,
`call`, or `href`, or with an id that ends with `direction`, and a `;` separates
it from the next statement. mermaid.js reads the whitespace after these words,
line breaks included, with the word: `accTitle ; :` is the vertices `accTitle`
and `:`, while `accTitle` and `:` on two lines is an accessibility title.

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

### Semicolons

A `;` at the end of a statement is dropped, and so is a `;` that stands alone at
the top level. Inside a subgraph, a `;` that is a statement of its own is kept
on a line of its own: mermaid.js lists it among the members of the subgraph. A
`;` inside a statement, which mermaid.js reads past on some lines, is kept where
it is, and so is its line (see
[Statements one per line](#statements-one-per-line)). A `;` at the end of a
statement is kept too when a directive follows it on the same line: without the
`;`, the whitespace before the directive would be read as part of the statement.

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

A run of empty lines becomes one empty line. Empty lines at the start and the
end of the text, and at the start and the end of a subgraph, are dropped. The
text ends with exactly one line break.

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

Within a line, a run of spaces and tabs between two tokens becomes one space.
Whitespace that is part of a value is kept: the whitespace around the `,` of a
list of styles, which mermaid.js keeps in the style, and the whitespace inside
the name of a subgraph, which becomes its title. In a `style`, `classDef`, or
`linkStyle` statement, only the whitespace right after the id, the class names,
or the link numbers becomes one space. What follows it up to the last style,
directives and whitespace included, is kept as written: mermaid.js reads it as
part of the first style.

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
([whitespace-between-tokens/style-after-two-items-kept-input.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/style-after-two-items-kept-input.mmd)):

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
([whitespace-between-tokens/style-after-two-items-kept-output.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/style-after-two-items-kept-output.mmd)):

```mmd
flowchart LR
  A
  style A %%{init: {}}%%  %%{init: {}}%%fill:red
  classDef a,b %%{init: {}}%% %%{init: {}}%%  fill:red
  A --> A
  linkStyle 0 %%{init: {}}%%  fill:red
  linkStyle default interpolate basis %%{init: {}}%%  %%{init: {}}%%stroke:red
```

### Arrow spacing

A link has one space before it and one after it. Text written between two arrows
has one space on each side. A label between `|` touches the arrow and its `|`,
and an edge id touches its `@` and the arrow.

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
it. Whitespace inside the label is kept, and so is a label that is only
whitespace (`A[]` would be rejected). A label in quotes is kept as written.

The whitespace at the start of a label is kept, as one space, when the label
would be read differently without it: when the label starts with `/`, `\`, `-`,
or `"`, and when its first word, up to whitespace or a `"`, contains `@`.
Without the space, `A[ /x/]` would become a lean-right shape with the label `x`,
`A( -x-)` an ellipse, and `A[ x@ ]` would be rejected. Such a label then has one
space at its end too: `A[ /x/]` becomes `A[ /x/ ]`, except before the closing
`?]` or `=]` of a slanted shape, where mermaid.js would read the space and the
`?` or `=` as text: `A[/ -x/?]` stays as it is. The rule is the same for every
shape and for the text between `|`.

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
between `|` after the arrow. Turning one form into the other would need rules
for labels that hold a `|`: `A -- a|b --> B` is accepted, and `A -->|a|b| B` is
not.

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

A chain of links stays on one line, as written. It is not split into one link
per line: where the author splits statements and links is kept, as with long
lines and statements written over several lines.

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

Lines are not wrapped, whatever Prettier's `printWidth` option says. Where a
line is broken is the author's choice, as with chains.

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
later lines stands one level deeper than its first. Comment lines inside it stay
inside it, at the level of its later lines. A `click` statement written over
several lines is kept as written, because mermaid.js rejects some of them when a
later line is indented.

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
after the `{`. Inside a subgraph, mermaid.js also lists the text of such a block
among the members of the subgraph, indentation included, so the indentation
cannot be changed. The `}` of the block stands at the level of the `accDescr` it
closes. Comment lines inside such a block are kept as written too. When the text
starts on the line of the `{`, the whitespace around it becomes one space, as
between tokens. A block without text, whose lines are only comment lines, holds
no value: its comment lines stand one level deeper than the `accDescr`, as
comment lines inside a statement do (see [Comments](#comments)), and its `}` at
the level of the `accDescr`.

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
before the header too, where it starts the line. The text of a comment is kept
as written, including whitespace at its end: mermaid.js does not read it, and it
is the author's text.

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
statements around it. A directive on the same line as a statement stays on that
line. Where whitespace was written on a side of the directive, one space stands
there; where the directive touched a token, it keeps touching it. mermaid.js
reads the text without the directive, so whether two tokens are apart must not
change. The content of a directive is kept as written.

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
it. Its range ends at its last character that is not whitespace (the
specification's
[Comments, directives, and frontmatter](../../spec/docs/ast.md#comments-directives-and-frontmatter)),
so the whitespace after it is whitespace at the end of the text and is formatted
as such: the text ends with one line break after the directive. When the text
ends right after the directive, no line break is added, since mermaid.js would
read it as part of the directive. These examples are not shown here, because the
whitespace they are about is at the end of the text; see the files
`unclosed-trailing-whitespace` and `unclosed-at-end-of-text-kept` in the
[folder](../tests/fixtures/flowchart/directives).

### Direction

The direction is kept as written: `TD` is not changed to `TB`, in the header or
in a `direction` statement. mermaid.js keeps the `TD` of a `direction` statement
in a subgraph as written, so changing it there would change the diagram, and
changing only the header would make the two disagree.

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

Whether there is whitespace between the id of a subgraph and its title in
brackets is kept as written; a run of it becomes one space. mermaid.js reads
both forms the same, and both are in use, so the choice is left to the author. A
name written without a title keeps the whitespace after it, which mermaid.js
reads as part of the name.

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
dropped. mermaid.js keeps it at the end of the last style, so this is the one
rule that changes what mermaid.js stores; the tests compare styles without the
whitespace at their ends. The whitespace is kept when mermaid.js reads it as a
style of its own, after a `,` at the end of the list, because the statement
would be rejected without it: in `style A fill:#f00, ` and in
`classDef c fill:x\, `. The same holds for a style that is all whitespace after
a directive or after a `;` that mermaid.js ignores, as in
`style A fill:red,%%{init: {}}%% ` and `style A fill:#f00,; `.

The examples of this rule are not shown here, because the whitespace they are
about is at the ends of lines; see the
[folder](../tests/fixtures/flowchart/style-trailing-whitespace).

### Frontmatter YAML

The YAML between the `---` lines is formatted with Prettier's YAML formatter.
The `---` lines are kept as written. The YAML is kept as written when Prettier
cannot read it, and when the `---` lines are indented: the `---` lines are kept
as written, and a body at the first column between indented `---` lines would
look broken. It is also kept as written when a line of the formatted YAML is a
`---` line, which would end the frontmatter early: Prettier prints `--- !!map`
after a `%YAML` directive as `---` and `!!map` on two lines. It is also kept as
written when it contains a `<` followed by a letter, a digit, or `_`: mermaid.js
rewrites `="..."` inside HTML tags over the whole text, frontmatter included,
before it reads the YAML, and changing the quotes of such a value can change
what mermaid.js reads.

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
  types;
- whether there is whitespace around `&`: `A&B` is one vertex, `A & B` two, and
  `A &B` is rejected (a run of whitespace becomes one space, as between tokens);
- the length of an arrow (`-->` and `--->`), and the header keyword (`graph` or
  `flowchart`);
- the content of `@{ ... }` data blocks and of directives, which the parser does
  not read;
- the lines of strings written over several lines, and of Markdown strings,
  whose whitespace at the start of a line is part of the value.
