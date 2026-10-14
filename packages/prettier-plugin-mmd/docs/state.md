# State diagram formatting rules

Japanese version: [state.ja.md](./state.ja.md)

How prettier-plugin-mmd formats a state diagram. Each rule below keeps what
mermaid.js reads from the diagram; where a change would alter it, the text is
kept as written, and the rule says where. Where a rule is the same as in a
flowchart, it says so, and the reason is in the
[rules for flowcharts](./flowchart.md).

Each rule below shows its formatting with examples: the text before formatting,
and the text that the plugin prints. The examples are the fixtures that the
tests check, and the link above each one is to its file. How the fixtures are
organized and checked is described in
[Documents and fixtures](./development.md#documents-and-fixtures).

## Rules

### Indentation

The statements after the header stand one level deeper than the header. The
statements of a composite state stand one level deeper than the line that opens
it, and its `}` stands on a line of its own at the level of that line. [fixture:
indentation/composite-states] A level is what Prettier's `useTabs` and
`tabWidth` options say: two spaces by default. [fixture: indentation/use-tabs]
[fixture: indentation/tab-width-4] The indentation written in the input is not
kept: whitespace at the start of a line is nothing to mermaid.js. [fixture:
indentation/written-tabs-dropped]

Input
([indentation/composite-states-input.mmd](../tests/fixtures/state/indentation/composite-states-input.mmd)):

```mmd
stateDiagram-v2
[*] --> Active
state Active {
[*] --> Working
        state Working {
Step1 --> Step2
}
}
```

Output
([indentation/composite-states-output.mmd](../tests/fixtures/state/indentation/composite-states-output.mmd)):

```mmd
stateDiagram-v2
  [*] --> Active
  state Active {
    [*] --> Working
    state Working {
      Step1 --> Step2
    }
  }
```

### Composite states

The `{` of a composite state, and of an alias definition with a body, stands on
the line of its name, after one space; a `{` written on the next line is moved
there. [fixture: composite-states/split] [fixture:
composite-states/brace-after-one-space] [fixture:
composite-states/alias-brace-on-next-line] [fixture:
composite-states/directive-before-body] [fixture:
multi-line-statements/brace-after-comment-line-kept] [fixture:
multi-line-statements/brace-after-directive-kept] A body written on one line, as
in `state A { B --> C }`, is split into lines, and a divider `--` stands on a
line of its own, at the level of the statements around it. [fixture:
composite-states/split] [fixture: composite-states/split-several-statements]
[fixture: composite-states/split-nested] [fixture:
composite-states/split-alias-body] [fixture:
composite-states/divider-on-own-line] [fixture:
composite-states/split-directive-in-body]

Input
([composite-states/split-input.mmd](../tests/fixtures/state/composite-states/split-input.mmd)):

```mmd
stateDiagram-v2
state A { B --> C }
state D
{
E
}
state F { G -- H }
```

Output
([composite-states/split-output.mmd](../tests/fixtures/state/composite-states/split-output.mmd)):

```mmd
stateDiagram-v2
  state A {
    B --> C
  }
  state D {
    E
  }
  state F {
    G
    --
    H
  }
```

An empty body, with nothing but whitespace between its braces, is printed as
`{ }`, however it is written, as in a class diagram. [fixture:
composite-states/empty-unified] [fixture: composite-states/empty-unified-lines]

Input
([composite-states/empty-unified-input.mmd](../tests/fixtures/state/composite-states/empty-unified-input.mmd)):

```mmd
stateDiagram-v2
state A {}
state B {   }
state C {
}
state "d" as E {}
```

Output
([composite-states/empty-unified-output.mmd](../tests/fixtures/state/composite-states/empty-unified-output.mmd)):

```mmd
stateDiagram-v2
  state A { }
  state B { }
  state C { }
  state "d" as E { }
```

A `%%` right before a `{` is kept as written up to the `{`. `state X` followed
by a line `%%{}` opens a body of X, with a `%%` that mermaid.js does not read,
while `state X %%{}` on one line is X and the composite state `%%` with an empty
body; and `%%` followed by a space is a comment. [fixture:
composite-states/percent-before-body-kept] [fixture:
composite-states/percent-space-brace-comment] An empty description block before
a `{` is kept as written too: `state "d" as A` followed by a line
`accDescr {} {` has the id `A`, while written on one line the id is
`A accDescr {}`, and mermaid.js rejects the body. [fixture:
composite-states/empty-block-before-body-kept] A body with nothing but a
directive stays on the line of its `{` when it is written there, as in
`state X { %%{init: {}}%% }`; a comment stands on a line of its own, so a body
with only a comment is printed as a body. [fixture:
composite-states/empty-body-directive-and-comment]

Input
([composite-states/percent-before-body-kept-input.mmd](../tests/fixtures/state/composite-states/percent-before-body-kept-input.mmd)):

```mmd
stateDiagram-v2
state X
%%{}
state Y %%{}
```

Output
([composite-states/percent-before-body-kept-output.mmd](../tests/fixtures/state/composite-states/percent-before-body-kept-output.mmd)):

```mmd
stateDiagram-v2
  state X
%%{}
  state Y %%{}
```

Input
([composite-states/empty-block-before-body-kept-input.mmd](../tests/fixtures/state/composite-states/empty-block-before-body-kept-input.mmd)):

```mmd
stateDiagram-v2
state "d" as A
  accDescr {} {
B
}
state X ""
accDescr {}{
C
}
```

Output
([composite-states/empty-block-before-body-kept-output.mmd](../tests/fixtures/state/composite-states/empty-block-before-body-kept-output.mmd)):

```mmd
stateDiagram-v2
  state "d" as A
  accDescr {} {
    B
  }
  state X ""
accDescr {}{
    C
  }
```

A statement that follows a `state` name keeps its lines where it holds a `{`.
The state context reads the name, the line feeds after it, and the next line up
to its `{` as two names before a `{`, and mermaid.js rejects them: `state foo`
followed by a line `state B {` is rejected, while `state B` followed by a line
`{` is accepted. So the `{` is not moved to the line of its name there, and the
lines of a note whose id is written on the next line stay as written. [fixture:
composite-states/brace-after-state-name-kept] A `{` inside a directive or a
comment is no body, so a statement that holds only such a `{` is formatted as
anywhere else. [fixture:
statements-one-per-line/directive-after-state-name-formatted] [fixture:
statements-one-per-line/comment-brace-after-state-name-formatted]

Input
([composite-states/brace-after-state-name-kept-input.mmd](../tests/fixtures/state/composite-states/brace-after-state-name-kept-input.mmd)):

```mmd
stateDiagram-v2
state foo
state B
{
X
}
state bar
note "x" as
accDescr {}
 N1
```

Output
([composite-states/brace-after-state-name-kept-output.mmd](../tests/fixtures/state/composite-states/brace-after-state-name-kept-output.mmd)):

```mmd
stateDiagram-v2
  state foo
  state B
{
    X
  }
  state bar
  note "x" as
accDescr {}
  N1
```

### Statements one per line

Each statement stands on a line of its own. Nothing separates statements in a
state diagram, and statements written on one line, as in `A --> B C --> D`, are
moved to lines of their own; so is an empty description block after a click
statement. [corpus fixture: state/gram-click-after-empty-description-block]
[corpus fixture: state/gram-click-empty-description-block-after] [fixture:
statements-one-per-line/split] [fixture: statements-one-per-line/states]
[fixture: statements-one-per-line/split-then-comment] [fixture:
statements-one-per-line/split-with-directive-between] The names after `state`
stay on the line of `state`: `state a b` is two statements, and on a line of its
own `b` would add the state b, which `state a b` does not. [corpus fixture:
state/lex-state-without-body] The same holds for the `""` that mermaid.js does
not read in `state x "" y` and `state z ""`. [fixture:
statements-one-per-line/state-names-kept] A line that holds a `;` keeps its
statements, as in a flowchart (see
[Statements one per line](./flowchart.md#statements-one-per-line)); in a state
diagram, a `;` is a character of an id. [fixture:
statements-one-per-line/line-with-semicolon-kept] [fixture:
statements-one-per-line/line-with-ignored-semicolon-kept] The `}` of a composite
state on such a line, with a statement after it on the line, stays on the line:
it would otherwise go to a line of its own and leave the statement on a line
without the `;`. [fixture:
statements-one-per-line/line-with-semicolon-closing-brace-kept]

Input
([statements-one-per-line/split-input.mmd](../tests/fixtures/state/statements-one-per-line/split-input.mmd)):

```mmd
stateDiagram-v2
A --> B C --> D
[*]x
A
click A href "https://example.com" accDescr {}
```

Output
([statements-one-per-line/split-output.mmd](../tests/fixtures/state/statements-one-per-line/split-output.mmd)):

```mmd
stateDiagram-v2
  A --> B
  C --> D
  [*]
  x
  A
  click A href "https://example.com"
  accDescr {}
```

Input
([statements-one-per-line/state-names-kept-input.mmd](../tests/fixtures/state/statements-one-per-line/state-names-kept-input.mmd)):

```mmd
stateDiagram-v2
state a b
state x "" y
state z ""
```

Output
([statements-one-per-line/state-names-kept-output.mmd](../tests/fixtures/state/statements-one-per-line/state-names-kept-output.mmd)):

```mmd
stateDiagram-v2
  state a b
  state x "" y
  state z ""
```

### Blank lines

As in a flowchart: a run of empty lines becomes one, and empty lines at the
start and the end of a body are dropped. [fixture: blank-lines/collapsed]
[fixture: blank-lines/end-of-text-dropped] [fixture:
blank-lines/around-comments-and-directives] [fixture:
blank-lines/whitespace-only-lines]

Input
([blank-lines/collapsed-input.mmd](../tests/fixtures/state/blank-lines/collapsed-input.mmd)):

```mmd
stateDiagram-v2


A --> B



state C {

D


E

}
```

Output
([blank-lines/collapsed-output.mmd](../tests/fixtures/state/blank-lines/collapsed-output.mmd)):

```mmd
stateDiagram-v2
  A --> B

  state C {
    D

    E
  }
```

### Whitespace between tokens

Within a line, a run of spaces and tabs between two tokens becomes one space,
and tokens that touch keep touching, as in a flowchart. [fixture:
whitespace-between-tokens/collapsed] [fixture:
whitespace-between-tokens/tabs-collapsed] [fixture:
whitespace-between-tokens/touching-class-kept] This holds for `:::`, the `""`
that mermaid.js does not read, and the `,` of a style or a class statement; the
quotes of a floating note are kept as written. [fixture:
whitespace-between-tokens/comma-kept] [fixture:
whitespace-between-tokens/floating-note-quotes-kept] Whether whitespace is
written before a `""` is kept: `state x"" {` is the composite state `x""`, and
`state x "" {` the composite state `x`. [fixture:
whitespace-between-tokens/quotes-before-brace-kept] Keywords keep the case in
which they are written: mermaid.js reads them in any case, and the position of a
note, such as `Left Of`, is part of the diagram as written. [fixture:
whitespace-between-tokens/keyword-case-kept] [fixture:
whitespace-between-tokens/keyword-case-more-kept]

Input
([whitespace-between-tokens/collapsed-input.mmd](../tests/fixtures/state/whitespace-between-tokens/collapsed-input.mmd)):

```mmd
stateDiagram-v2
A   :::   highlight
state   f1   <<fork>>
state  ""   x
classDef  c   fill:red ,  stroke:blue
class   A,B   c
scale   350   width
hide empty description
```

Output
([whitespace-between-tokens/collapsed-output.mmd](../tests/fixtures/state/whitespace-between-tokens/collapsed-output.mmd)):

```mmd
stateDiagram-v2
  A ::: highlight
  state f1 <<fork>>
  state "" x
  classDef c fill:red , stroke:blue
  class A,B c
  scale 350 width
  hide empty description
```

Input
([whitespace-between-tokens/keyword-case-kept-input.mmd](../tests/fixtures/state/whitespace-between-tokens/keyword-case-kept-input.mmd)):

```mmd
stateDiagram-v2
STATE A {
B
}
Note Left Of A : x
HIDE EMPTY DESCRIPTION
```

Output
([whitespace-between-tokens/keyword-case-kept-output.mmd](../tests/fixtures/state/whitespace-between-tokens/keyword-case-kept-output.mmd)):

```mmd
stateDiagram-v2
  STATE A {
    B
  }
  Note Left Of A : x
  HIDE EMPTY DESCRIPTION
```

### Arrow spacing

A transition has one space before and after its arrow: `A-->B` becomes
`A --> B`. [fixture: arrow-spacing/spaced] [fixture:
arrow-spacing/tabs-around-arrow]

Input
([arrow-spacing/spaced-input.mmd](../tests/fixtures/state/arrow-spacing/spaced-input.mmd)):

```mmd
stateDiagram-v2
[*]-->A
A-->B
B  -->   [*]
```

Output
([arrow-spacing/spaced-output.mmd](../tests/fixtures/state/arrow-spacing/spaced-output.mmd)):

```mmd
stateDiagram-v2
  [*] --> A
  A --> B
  B --> [*]
```

The words `scale`, `classDef`, `class`, `style`, `state`, `note`, and
`stateDiagram`, in any case, are keywords only when whitespace follows them, and
ids otherwise. A transition from an id spelled so, or from a state whose class
after `:::` is spelled so, keeps its arrow touching on both sides, as
`scale-->B`: `scale -->B` would start a scale statement. [fixture:
arrow-spacing/touching-before-keyword-kept] [fixture:
arrow-spacing/other-keyword-ids-touching-kept] [fixture:
arrow-spacing/label-after-keyword-id-spaced] A description after such an id
keeps its `:` touching the id.

Input
([arrow-spacing/touching-before-keyword-kept-input.mmd](../tests/fixtures/state/arrow-spacing/touching-before-keyword-kept-input.mmd)):

```mmd
stateDiagram-v2
scale-->B
A-->style:waiting
style:waiting
A:::state-->B
```

Output
([arrow-spacing/touching-before-keyword-kept-output.mmd](../tests/fixtures/state/arrow-spacing/touching-before-keyword-kept-output.mmd)):

```mmd
stateDiagram-v2
  scale-->B
  A --> style: waiting
  style: waiting
  A:::state-->B
```

### Descriptions and labels

The `:` after `accTitle` and `accDescr` touches the keyword and has one space
after it: `accTitle  :  t` becomes `accTitle: t`. [fixture:
descriptions-and-labels/acc-text-kept] The `:` of a description and of a
transition label has one space on each side, as mermaid.js's documentation
writes most of its labels: `A-->B:submit` becomes `A --> B : submit`. [fixture:
descriptions-and-labels/spaced] The `:` of a description after a class spelled
as a keyword stays touching it: `A:::style:x` becomes `A:::style: x`, because a
space before the `:` would let the keyword start a statement. [fixture:
descriptions-and-labels/class-named-style-then-description-kept] The text is
kept as written. [fixture: descriptions-and-labels/text-kept] A description of
only whitespace keeps the whitespace after its `:`: `A : ` gives no description,
while `A :` is rejected. [corpus fixture: state/gram-description-blank] [corpus
fixture: state/gram-description-colon-only] [fixture:
descriptions-and-labels/blank-kept] A description or a label that ends with `:`
keeps the whitespace after it too: `A : x: ` is accepted, while `A : x:` is
rejected, since a description cannot end with `:`. [fixture:
descriptions-and-labels/ending-colon-kept] The whitespace is at the end of a
line, so the examples are written as strings, in which `\n` is a line break:
`"stateDiagram-v2\nA : \n"` is printed as `"stateDiagram-v2\n  A : \n"`, and
`"stateDiagram-v2\nA : x: \nA-->B:y:  \n"` as
`"stateDiagram-v2\n  A : x: \n  A --> B : y:  \n"` (the fixtures are in the
[folder](../tests/fixtures/state/descriptions-and-labels): `blank-kept` and
`ending-colon-kept`).

Input
([descriptions-and-labels/spaced-input.mmd](../tests/fixtures/state/descriptions-and-labels/spaced-input.mmd)):

```mmd
stateDiagram-v2
A:waiting
A-->B:submit
B --> C :  approved
```

Output
([descriptions-and-labels/spaced-output.mmd](../tests/fixtures/state/descriptions-and-labels/spaced-output.mmd)):

```mmd
stateDiagram-v2
  A : waiting
  A --> B : submit
  B --> C : approved
```

On a line that holds a `;`, whether whitespace follows the `:` is kept as
written, as in a class diagram (see [Labels](./class.md#labels)): the line rule
of mermaid.js reads a `:` followed directly by text up to a `#`. [fixture:
descriptions-and-labels/semicolon-line-kept] [fixture:
descriptions-and-labels/semicolon-line-space-after-colon-kept]

Input
([descriptions-and-labels/semicolon-line-kept-input.mmd](../tests/fixtures/state/descriptions-and-labels/semicolon-line-kept-input.mmd)):

```mmd
stateDiagram-v2
styleA :#f00;
```

Output
([descriptions-and-labels/semicolon-line-kept-output.mmd](../tests/fixtures/state/descriptions-and-labels/semicolon-line-kept-output.mmd)):

```mmd
stateDiagram-v2
  styleA :#f00;
```

### Notes

What follows the id of a note on one line, its `:` and its text, is kept as
written: mermaid.js reads the text from right after the id, without its first
two characters, so `note left of A:hi` has the text `i`, and
`note right of A  : two spaces` the text `: two spaces`. [fixture: notes/kept]
The whitespace before the id becomes one space. A text that mermaid.js does not
read right after the position, as in `note left of%%x A`, keeps touching the
position. The text of a note over lines is kept as written, from the line break
after its id to the line of `end note`: the columns of its lines, the first one
included, and the empty and whitespace-only lines at its ends. `end note` stands
at the level of the note. The whitespace after the id on the line of the note is
dropped; after a comment or a directive on that line it stays as written.
[fixture: notes/over-lines] [fixture: notes/over-lines-first-line-column-kept]
[fixture: notes/over-lines-text-ends-kept] [fixture:
notes/over-lines-directive-on-header-line] [fixture:
notes/over-lines-end-note-indentation-set] [fixture:
notes/over-lines-in-composite] [fixture: notes/over-lines-empty-lines-kept] A
note on one line with no text keeps the whitespace after its `:`, as a
description does: `note left of A : ` is accepted, while `note left of A :` is
rejected; so does a note with two whitespace characters before the `:` and
nothing after it, whose text is the `:` alone. [fixture: notes/blank-text-kept]
The quotes of a floating note are kept as written: `note ""floating" as N` has
the text `floating`. [fixture: notes/over-lines]

Input ([notes/kept-input.mmd](../tests/fixtures/state/notes/kept-input.mmd)):

```mmd
stateDiagram-v2
A
note left of A:hi
note right of A  : two spaces
note left of%%x   A : t
note left of    A : x
```

Output ([notes/kept-output.mmd](../tests/fixtures/state/notes/kept-output.mmd)):

```mmd
stateDiagram-v2
  A
  note left of A:hi
  note right of A  : two spaces
  note left of%%x A : t
  note left of A : x
```

Input
([notes/over-lines-input.mmd](../tests/fixtures/state/notes/over-lines-input.mmd)):

```mmd
stateDiagram-v2
A
note right of A
  first line
    second line
      end note
note ""floating" as N
```

Output
([notes/over-lines-output.mmd](../tests/fixtures/state/notes/over-lines-output.mmd)):

```mmd
stateDiagram-v2
  A
  note right of A
  first line
    second line
  end note
  note ""floating" as N
```

### Aliases

The string, the `as`, and the id of an alias definition have one space between
them, also where they were written touching: mermaid.js reads `"d"as A` as it
reads `"d" as A`. [fixture: aliases/second-description-kept] [fixture:
aliases/tabs-between-parts] [fixture: aliases/id-kept] The `""` that it does not
read before and after the string stand apart from it in the same way. `asA` is
no `as`, and is rejected. The second description, the text after the `:`, is
kept as written: mermaid.js reads it with the whitespace at its ends, so
`:short` and `: short` give different descriptions. [corpus fixture:
state/db-alias-colon-spaces-second] [fixture: aliases/second-description-kept]
[fixture: aliases/second-description-trailing-whitespace-kept] The whitespace
before the `:` becomes one space.

Input
([aliases/second-description-kept-input.mmd](../tests/fixtures/state/aliases/second-description-kept-input.mmd)):

```mmd
stateDiagram-v2
state "Long name"as A:short
state "d"  as   B :  two spaces
state ""  "y"""as C
state "d"as D{
E
}
state "d" as F
```

Output
([aliases/second-description-kept-output.mmd](../tests/fixtures/state/aliases/second-description-kept-output.mmd)):

```mmd
stateDiagram-v2
  state "Long name" as A :short
  state "d" as B :  two spaces
  state "" "y" "" as C
  state "d" as D {
    E
  }
  state "d" as F
```

### Pseudostates

A pseudostate mark, `<<fork>>`, `<<join>>`, `<<choice>>`, or the same words in
`[[ ]]`, has one space before it, also where it was written touching its name:
mermaid.js reads the name without the whitespace at its end, so
`state f1<<fork>>` is read as `state f1 <<fork>>`. [corpus fixture:
state/lex-fork-spaced-id] [corpus fixture: state/lex-choice-square-brackets]
[fixture: pseudostates/mark-spaced] [fixture: pseudostates/all-marks-spaced]

Input
([pseudostates/mark-spaced-input.mmd](../tests/fixtures/state/pseudostates/mark-spaced-input.mmd)):

```mmd
stateDiagram-v2
state f1<<fork>>
state   c   [[choice]]
state f 1<<join>>
```

Output
([pseudostates/mark-spaced-output.mmd](../tests/fixtures/state/pseudostates/mark-spaced-output.mmd)):

```mmd
stateDiagram-v2
  state f1 <<fork>>
  state c [[choice]]
  state f 1 <<join>>
```

### Comments

A comment on a line of its own, `%%` or `#`, stands at the level of the
statements around it, and its text is kept as written. [fixture: comments/kept]
[fixture: comments/text-kept] [fixture: comments/before-closing-brace] A comment
after a statement stays on its line, and whether whitespace is written before
its mark is kept. [fixture: comments/kept] [fixture:
comments/hash-after-statement-kept] [fixture: comments/after-brace-kept]
[fixture: statements-one-per-line/split-then-comment] [fixture:
comments/after-last-statement-without-line-break] [fixture:
comments/header-comment-without-line-break] In a description, a label, a note,
and a style, `%%` and `#` are part of the text. [fixture:
comments/text-in-values-kept] [fixture: comments/text-in-note-lines-kept]

Input
([comments/kept-input.mmd](../tests/fixtures/state/comments/kept-input.mmd)):

```mmd
stateDiagram-v2
%% a comment line
A --> B %% after a transition
A --> C%%touching
# a hash comment
state D {
        %% in a body
E
}
```

Output
([comments/kept-output.mmd](../tests/fixtures/state/comments/kept-output.mmd)):

```mmd
stateDiagram-v2
  %% a comment line
  A --> B %% after a transition
  A --> C%%touching
  # a hash comment
  state D {
    %% in a body
    E
  }
```

### Directives

As in a flowchart: a directive on a line of its own stands at the level of the
statements around it, and a directive on the line of a statement keeps whether
whitespace is written on each side of it: where it is, one space stands there,
and where the directive touches a token, it keeps touching. [fixture:
directives/kept] [fixture: directives/before-header] [fixture:
directives/after-statement] [fixture: directives/whitespace-on-each-side-kept]

Input
([directives/kept-input.mmd](../tests/fixtures/state/directives/kept-input.mmd)):

```mmd
stateDiagram-v2
%%{init: {}}%%
state A {
%%{init: {}}%%
B
}
Foo%%{init: {}}%% --> B
```

Output
([directives/kept-output.mmd](../tests/fixtures/state/directives/kept-output.mmd)):

```mmd
stateDiagram-v2
  %%{init: {}}%%
  state A {
    %%{init: {}}%%
    B
  }
  Foo%%{init: {}}%% --> B
```

### Frontmatter YAML

As in a flowchart: the YAML between the `---` lines is formatted with Prettier's
YAML formatter where that is safe (see
[Frontmatter YAML](./flowchart.md#frontmatter-yaml)). [corpus fixture:
state/div-frontmatter-invalid-yaml] [corpus fixture:
state/div-html-tag-starts-in-frontmatter-description] [fixture:
frontmatter-yaml/formatted] [fixture: frontmatter-yaml/html-tag-kept] [fixture:
frontmatter-yaml/delimiter-line-kept] [fixture:
frontmatter-yaml/closing-delimiter-whitespace-kept] [fixture:
frontmatter-yaml/indented-delimiters-kept]

Input
([frontmatter-yaml/formatted-input.mmd](../tests/fixtures/state/frontmatter-yaml/formatted-input.mmd)):

```mmd
---
title:   T
---
stateDiagram-v2
A --> B
```

Output
([frontmatter-yaml/formatted-output.mmd](../tests/fixtures/state/frontmatter-yaml/formatted-output.mmd)):

```mmd
---
title: T
---
stateDiagram-v2
  A --> B
```

### Multi-line values

As in a flowchart: the lines of an `accDescr { ... }` block are kept as written,
and its `}` stands at the level of its statement. [fixture:
multi-line-values/kept] [fixture:
multi-line-values/accdescr-block-single-line-kept] [fixture:
multi-line-values/accdescr-block-empty-and-comment-lines-kept] The text of a
floating note written over several lines is kept as written too. [fixture:
multi-line-values/kept] [fixture:
multi-line-values/floating-note-empty-line-kept]

Input
([multi-line-values/kept-input.mmd](../tests/fixtures/state/multi-line-values/kept-input.mmd)):

```mmd
stateDiagram-v2
accDescr {
  one
    two
      }
note "line one
  line two" as N
```

Output
([multi-line-values/kept-output.mmd](../tests/fixtures/state/multi-line-values/kept-output.mmd)):

```mmd
stateDiagram-v2
  accDescr {
  one
    two
  }
  note "line one
  line two" as N
```

### Multi-line statements

A statement written over several lines is printed on one line. In a state
diagram, a statement may go on to the next line after `state`, after `as`, after
the position of a note, after `classDef` or `style` and their names, after
`scale`, after `direction`, and after the `:` of `accTitle` and `accDescr`.
[corpus fixture: state/lex-direction-value-next-line] [fixture:
multi-line-statements/joined] [fixture: multi-line-statements/joined-after-as]
[fixture: multi-line-statements/joined-style-and-classdef] [fixture:
multi-line-statements/joined-accdescr] [fixture:
multi-line-statements/empty-line-inside-joined] So `classDef c` followed by a
line `fill:red` is printed as `classDef c fill:red`; a line `B --> C` after
`classDef a` is a style of `a`, not a transition, and the printed text shows it.
[fixture: multi-line-statements/joined] [fixture:
multi-line-statements/classdef-takes-next-line] A statement written over several
lines with a comment or a directive in it is kept as written, from its start to
its end, as in a sequence diagram (see
[Multi-line statements](./sequence.md#multi-line-statements)). [fixture:
multi-line-statements/comment-inside-kept] [fixture:
multi-line-statements/directive-inside-kept] [fixture:
multi-line-statements/brace-after-comment-line-kept] [fixture:
multi-line-statements/brace-after-directive-kept]

Input
([multi-line-statements/joined-input.mmd](../tests/fixtures/state/multi-line-statements/joined-input.mmd)):

```mmd
stateDiagram-v2
state
A
direction
LR
classDef c
fill:red
note right of
A : x
scale
350 width
accTitle:
A title
```

Output
([multi-line-statements/joined-output.mmd](../tests/fixtures/state/multi-line-statements/joined-output.mmd)):

```mmd
stateDiagram-v2
  state A
  direction LR
  classDef c fill:red
  note right of A : x
  scale 350 width
  accTitle: A title
```

Input
([multi-line-statements/comment-inside-kept-input.mmd](../tests/fixtures/state/multi-line-statements/comment-inside-kept-input.mmd)):

```mmd
stateDiagram-v2
direction
%% c
LR
```

Output
([multi-line-statements/comment-inside-kept-output.mmd](../tests/fixtures/state/multi-line-statements/comment-inside-kept-output.mmd)):

```mmd
stateDiagram-v2
  direction
%% c
LR
```

A statement written over several lines that holds a `;` is kept as written too.
[corpus fixture: state/db-style-semicolons] [corpus fixture:
state/db-classdef-semicolons] [fixture: multi-line-statements/semicolon-kept]
[fixture: multi-line-statements/semicolon-in-id-kept] The line rule of
mermaid.js (the specification's
[`style` and `classDef` lines](../../spec/docs/common.md#style-and-classdef-lines))
reads the text of one line: in `classDef`, a line break, and `c fill:#f00;` it
does not match the second line, so `#f00;` is an entity, while on one line, as
`classDef c fill:#f00;`, it matches and ignores the `;`. Joining the lines would
change the style.

Input
([multi-line-statements/semicolon-kept-input.mmd](../tests/fixtures/state/multi-line-statements/semicolon-kept-input.mmd)):

```mmd
stateDiagram-v2
  classDef
  c fill:#f00;
```

Output
([multi-line-statements/semicolon-kept-output.mmd](../tests/fixtures/state/multi-line-statements/semicolon-kept-output.mmd)):

```mmd
stateDiagram-v2
  classDef
  c fill:#f00;
```

### Line separators

A line that holds U+2028 or U+2029 is kept as written. A composite statement
whose opening line holds one keeps it, and its body is printed as any other
body: `state a b`, U+2028, and `{` keeps the character and indents the
statements of the body. So does one on the closing line, as in `state A {`, a
body line `B`, and `}` followed by U+2028: the whitespace after the `}` stays as
written, with the character, and the body is indented. [test: U+2028 before the
brace of a composite statement] [test: U+2028 on the closing line of a composite
statement] [test: U+2029 and whitespace before it on the closing line of a
composite statement] [test: U+2028 on the closing line of a composite statement
in a body] [test: U+2028 after the closing brace at the end of the text] [test:
U+2028 on the opening and on the closing line of a composite statement] A
composite statement in the body of another is printed so too, whatever the
closing lines of the two hold. [test: U+2028 on the closing lines of a composite
statement and of one in its body] [test: U+2028 on the closing lines of three
nested composite statements] A composite statement whose body has a line that
holds one, whose body is empty and whose closing line holds one (`state A {`, a
line of whitespace, and `}`: the statement has no block to indent, and the line
stays as written), whose closing `}` does not start its line (`B }`, or a
directive before it), or whose closing line holds, after the character, a
comment line or a `;` that another rule keeps (see
[A line that a `;` ends](./compatibility.md#a-line-that-a--ends) and
[A comment line after U+2028 or U+2029](./compatibility.md#a-comment-line-after-u2028-or-u2029)),
is printed as written as a whole, and its body is not indented again. [test:
U+2028 on a line of the body of a composite statement] [test: U+2028 on the
closing line of a composite statement with an empty body] [test: U+2028 after a
closing brace that follows a statement on its line] [test: U+2028 after a
closing brace that follows a directive on its line] [test: a `;` after U+2029 on
the closing line of a composite statement] [test: a comment line after U+2028 on
the closing line of a composite statement] In a state diagram, these characters
bound the text in which mermaid.js looks for a pseudostate mark, a direction
line, and a second name before a `{`: `state a`, U+2028, and `b <<fork>>` is the
name `a` and the fork `b`, while with a space in place of the U+2028, it is the
fork `a b`. [corpus fixture: state/lex-pseudostate-mark-after-line-separator]
The character is invisible, so the example is written as strings, in which
`\u2028` is U+2028 and `\n` is a line break:
`"stateDiagram-v2\nstate a\u2028b <<fork>>\n"` is printed as
`"stateDiagram-v2\n  state a\u2028b <<fork>>\n"`, with the character kept.
[test: a pseudostate mark after U+2028] [test: a pseudostate mark after U+2029]
[test: a direction line after U+2028] [test: a direction line after U+2029]
[test: a second name before a brace that U+2028 separates from it] [test: a
second name before a brace that U+2029 separates from it] [test: a pseudostate
mark after U+2028 in a body] [test: a transition line with U+2028] The test
writes the characters as escapes too (see
[tests/line-separators.test.ts](../tests/line-separators.test.ts)). A line that
starts with U+2028 or U+2029 keeps it, with the whitespace before the first
statement, as written: it is part of what the lexer reads, and a second
formatting that read the line without it would read it as any other line. [test:
a line that starts with U+2028] [test: a line that starts with U+2029] [test: a
line that starts with whitespace and U+2028]

A line that dropping a `;` would change the end of, or the `;` that the line
rule ignores in, is printed as written: a `;` after a directive that is not
closed, an ignored `;` next to another `;`, and one before a U+2028 or U+2029
(see [A line that a `;` ends](./compatibility.md#a-line-that-a--ends)). [test: a
semicolon after a directive that is not closed] [test: an ignored semicolon next
to another semicolon] [test: an ignored semicolon and a semicolon after
whitespace] [test: an ignored semicolon before U+2028] [test: an ignored
semicolon before U+2029]

## Kept as written

Some text is always kept as written, because changing it would change the
diagram or the input would be rejected:

- the text of a value: a description, a label, a note, an id after `as`, a
  pseudostate name, a style, the CSS class of a `class` statement, and the text
  of `accTitle` and `accDescr`; [fixture:
  whitespace-between-tokens/style-text-kept] [fixture:
  descriptions-and-labels/acc-text-kept] [fixture: aliases/id-kept]
- what follows the id of a note on one line, the second description of an alias
  definition, and the whitespace after the `:` of a description of only
  whitespace;
- the names and the `""` after `state`, on the line of `state`;
- whether whitespace is written before a `""`, and before the mark of a comment
  after a statement;
- a `%%` or an empty description block right before a `{`, up to the `{`;
- the lines of a statement that holds a `{` and follows a `state` name;
- an arrow and a `:` touching an id that a space would make a keyword;
- a line that holds U+2028 or U+2029;
- a statement written over several lines with a comment, a directive, or a `;`
  in it;
- the text of a direction line before `direction` and after its value; [corpus
  fixture: state/lex-direction-line-same-line-transition] [fixture:
  whitespace-between-tokens/direction-line-text-kept]
- the case of keywords, and the spelling of the header, `stateDiagram` or
  `stateDiagram-v2`. [corpus fixture: state/header-v1] [fixture:
  indentation/header-without-v2-kept]
