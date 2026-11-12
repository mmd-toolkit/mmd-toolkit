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
kept. Whitespace at the start of a line is nothing to mermaid.js, so the printer
chooses the indentation from the structure alone, and one rule per level prints
the same text whatever the input was indented with. [fixture:
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

When a header continues across trivia, align the physical line containing its
opening brace with the initial keyword, so the body remains one level deeper. Do
not change a value spanning that line or protected source boundaries. [fixture:
composite-states/header-completion-after-comment]

The `{` of a composite state, and of an alias definition with a body, stands on
the line of its name, after one space, as in a class diagram; a `{` written on
the next line is moved there. Comments or directives between the name and the
brace keep the line breaks; the brace aligns with the state keyword, and the
intervening trivia stands one level deeper. [fixture: composite-states/split]
[fixture: composite-states/brace-after-one-space] [fixture:
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
composite-states/empty-block-before-body-kept] A `state` before a `{`, which
mermaid.js ignores, is kept as written too: `state "d" as A` followed by a line
`state {` has the id `A`, while written on one line the id is `A state`.
[fixture: composite-states/ignored-state-before-body-kept] [corpus fixture:
state/gram-ignored-state-before-alias-body-next-line] A `state` with no name,
which mermaid.js accepts and reads as nothing, is a statement of its own,
printed at the level of the statements around it. [fixture:
composite-states/state-keyword-alone] [corpus fixture:
state/lex-state-keyword-alone] A body with nothing but a directive stays on the
line of its `{` when it is written there, as in `state X { %%{init: {}}%% }`; a
comment stands on a line of its own, so a body with only a comment is printed as
a body. [fixture: composite-states/empty-body-directive-and-comment]

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

### Header

The spelling of the header, `stateDiagram` or `stateDiagram-v2`, stays as
written, like the name of any other header (see
[The names of a header](./compatibility.md#the-names-of-a-header)): the examples
in the documentation of mermaid.js use `stateDiagram-v2` 17 times and
`stateDiagram` 5 times, and mermaid.js 12.3.0 draws both with the same diagram.
[fixture: header/spellings-kept] [fixture: indentation/header-without-v2-kept]

Input (escaped): `"stateDiagram\nSTATE \"legacy\" AS old"`.

Output
([header/spellings-kept-output.mmd](../tests/fixtures/state/header/spellings-kept-output.mmd)):

```mmd
stateDiagram
  state "legacy" as old
```

### Keyword case

The keywords of the table under
[Spellings that are drawn the same](./compatibility.md#spellings-that-are-drawn-the-same)
are printed in the case shown there, among them `<<CHOICE>>`, `<<FORK>>`, and
`<<JOIN>>`, which are printed `<<choice>>`, `<<fork>>`, and `<<join>>`,
`ACCTITLE:` and `ACCDESCR:`, which are printed `accTitle:` and `accDescr:`,
`AS`, `END`, and `DIRECTION TB`. The position of a note, `LEFT OF` and
`RIGHT OF`, stays as written. [fixture: keyword-case/pseudo-states-one-form]
[fixture: keyword-case/accessibility-alias-direction-one-form]

Input (escaped):
`"stateDiagram-v2\nACCTITLE: title\nACCDESCR: description\nstate \"x\" AS y\nDIRECTION TB\nnote LEFT OF y: left\nnote RIGHT OF y: right\nnote left of y\nbody\nEND NOTE"`.

Output
([keyword-case/accessibility-alias-direction-one-form-output.mmd](../tests/fixtures/state/keyword-case/accessibility-alias-direction-one-form-output.mmd)):

```mmd
stateDiagram-v2
  accTitle: title
  accDescr: description
  state "x" as y
  direction TB
  note LEFT OF y : left
  note RIGHT OF y : right
  note left of y
    body
  end note
```

### Statements one per line

Each statement stands on a line of its own, as in the other diagram types.
Nothing separates statements in a state diagram, and statements written on one
line, as in `A --> B C --> D`, are moved to lines of their own; so is an empty
description block after a click statement. [corpus fixture:
state/gram-click-after-empty-description-block] [corpus fixture:
state/gram-click-empty-description-block-after] [fixture:
statements-one-per-line/split] [fixture: statements-one-per-line/states]
[fixture: statements-one-per-line/split-then-comment] [fixture:
statements-one-per-line/split-with-directive-between] The names after `state`
stay on the line of `state`: `state a b` is two statements, and on a line of its
own `b` would add the state b, which `state a b` does not. [corpus fixture:
state/lex-state-without-body] The same holds for the `""` that mermaid.js does
not read in `state x "" y` and `state z ""`. [fixture:
statements-one-per-line/state-names-kept] A line that holds a kept `;` keeps its
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
and tokens that touch keep touching, as in a flowchart (see
[Whitespace between tokens](./flowchart.md#whitespace-between-tokens)), except
the words of an alias definition and a pseudostate mark, which get one space
(see [Aliases](#aliases) and [Pseudostates](#pseudostates)). [fixture:
whitespace-between-tokens/collapsed] [fixture:
whitespace-between-tokens/tabs-collapsed] [fixture:
whitespace-between-tokens/touching-class-kept] The `:::` of a state reference,
in a transition or on a line of its own, touches the state before it and the
class after it: `A :::c` and `A ::: c` are printed `A:::c`, as in an ER diagram.
mermaid.js reads every spelling as the same state, so nothing forces the form;
the printer already prints the `:::` of an ER diagram this way, and the five
examples of the documentation of mermaid.js write it so
([`Still:::notMoving` and the others](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/stateDiagram.md#L448-L470)).
[fixture: whitespace-between-tokens/css-class-touches-separator] The `:::` of a
`state` definition is not moved: `state A :::c`, `state "x" as B ::: c`, and
`state C ::: c {` keep the gap they have, one space where whitespace was
written, and `state "y" as D:::c` is printed `state "y" as D :::c` by the rule
of the alias. [fixture: whitespace-between-tokens/css-class-in-definition-kept]
A directive in the gap is placed as under [Directives](#directives), and a
U+2028 or U+2029 stays where it is. [test: U+2028 before the `:::` of a state]
[test: U+2029 after the `:::` of a state] This holds for the `""` that
mermaid.js does not read; the quotes of a floating note (`note "..." as ...`)
are kept as written. [fixture:
whitespace-between-tokens/floating-note-quotes-kept] In a `classDef` or a
`style` statement, each style has no whitespace before its first `:` and one
space after it where the value is not empty. The `,` between styles has no
whitespace before it and one space after it, as in ER and requirement (see
[Styles and classes](./er.md#styles-and-classes)):
`classDef c fill:#f00 , color:white` is printed
`classDef c fill: #f00, color: white`. A run of spaces and tabs between the
words of a style is printed as one space, and whether whitespace stands between
two words stays as written; a run inside a string, a comment, or the parentheses
of `url(`, and the escape after a backslash, stay as written, since CSS reads
them as part of the value: the hexadecimal digits and the one space or tab that
follows them, or else the next character. [fixture:
whitespace-between-tokens/style-words-run-spaced] [fixture:
whitespace-between-tokens/style-string-runs-kept] [fixture:
whitespace-between-tokens/style-url-runs-kept] [fixture:
whitespace-between-tokens/style-comment-runs-kept] [fixture:
whitespace-between-tokens/style-backslash-run-spaced] [fixture:
whitespace-between-tokens/style-hex-escape-run-spaced] mermaid.js reads the
whitespace around the `,` as nothing in a state diagram, but keeps the
whitespace around the `:` in the Db; the figure is the same (see
[Styles that are drawn the same](./compatibility.md#styles-that-are-drawn-the-same)).
[fixture: whitespace-between-tokens/style-colon-spaced] A backslash does not
escape a `,` here: `fill:a\,b ,stroke:c` is printed `fill: a\, b, stroke: c`. A
space after a backslash before the `:` stays, since taking it away would escape
the `:`, and the whitespace after that space goes. [fixture:
whitespace-between-tokens/style-backslash-before-comma] A space after a
backslash that ends a style is read as nothing here:
`style S1 stroke-width:3px\ ,stroke:#0f0` is printed
`style S1 stroke-width: 3px\, stroke: #0f0`, and the pixels were the same.
[fixture: whitespace-between-tokens/style-backslash-space-dropped] [fixture:
whitespace-between-tokens/style-colon-escaped-space-kept] [fixture:
whitespace-between-tokens/style-colon-escaped-space-run-dropped] A statement
stays as written where it holds a comment or a directive, where a style is all
whitespace, or where a style holds a line break or its line holds a kept `;`.
[fixture: whitespace-between-tokens/comma-kept] [fixture:
whitespace-between-tokens/style-comma-spaced] [fixture:
whitespace-between-tokens/style-comma-beside-directive] [fixture:
whitespace-between-tokens/style-comma-with-kept-semicolon-kept] A U+2028 or
U+2029 among the styles stays where it is. [test: U+2028 before the comma of a
state classDef statement] [test: U+2029 after the comma of a state classDef
statement] Whether whitespace is written before a `""` is kept: `state x"" {` is
the composite state `x""`, and `state x "" {` the composite state `x`. [fixture:
whitespace-between-tokens/quotes-before-brace-kept] The keywords of the table
under
[Spellings that are drawn the same](./compatibility.md#spellings-that-are-drawn-the-same)
are printed in the case shown there (`STATE A {` is `state A {`, `DIRECTION lr`
is `direction LR`, `<<CHOICE>>` is `<<choice>>`). mermaid.js reads them in any
case and the Db is the same. A keyword that the table does not list keeps the
case in which it is written (`STYLE`, `CLASSDEF`, and `HIDE EMPTY DESCRIPTION`).
`STYLE` and `CLASSDEF` are read by mermaid.js with a rule of its own (see
[Keywords in one case](./compatibility.md#keywords-in-one-case)). The position
of a note, such as `Left Of`, is part of the diagram as written: the Db keeps it
as written. [fixture: whitespace-between-tokens/keyword-case-one-form] [fixture:
whitespace-between-tokens/keyword-case-more-one-form] [fixture:
keyword-case/pseudo-states-one-form] [fixture:
keyword-case/accessibility-alias-direction-one-form]

A style that starts with the `:`, and one whose `:` follows a backslash and a
space, are printed as any other style: one space after the `:`, and the runs
between their words as one space. `style A :  red   x` is printed
`style A : red x`. [fixture:
whitespace-between-tokens/style-colon-first-run-spaced] [fixture:
whitespace-between-tokens/style-escaped-space-run-spaced] A string or `url(`
that is not closed runs to the end of the style, and the runs in it stay.
[fixture: whitespace-between-tokens/style-unclosed-string-runs-kept] [fixture:
whitespace-between-tokens/style-unclosed-url-runs-kept]

The ids of a `class` statement are separated by a `,` that touches the id before
it and has one space after it: `class A,B c` is printed `class A, B c`, as the
lists of ER, requirement, and usecase are (see
[Styles and classes](./er.md#styles-and-classes)). mermaid.js reads `A,B`,
`A, B`, and `A,  B` as the same statement, so nothing forces the form. Its
documentation writes the two examples of the statement with a space after the
comma
([`class Moving, Crash movement`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/stateDiagram.md#L397)),
which is the form printed. [fixture:
whitespace-between-tokens/class-ids-touching] Whitespace written before a `,`
ends the ids, and what follows is the name of the class: `class A ,B c` is the
state `A` with the class `,B c`. Those forms stay as written, with the
whitespace after the `,`. [fixture:
whitespace-between-tokens/class-ids-space-before-comma-kept] [fixture:
whitespace-between-tokens/comma-kept] A line break after the `,` is joined, so
`class A,` and `B c` on the next line are printed `class A, B c`, and a
directive before the `,` does not change that: the id after the `,` stands after
one space. [fixture:
whitespace-between-tokens/class-ids-line-break-and-directive] A directive in the
gap after the `,` is placed as under [Directives](#directives), and a `;` that
the line rule ignores keeps its line as written. [fixture:
whitespace-between-tokens/class-ids-beside-directive] [fixture:
whitespace-between-tokens/class-ids-beside-directive-runs] [fixture:
whitespace-between-tokens/class-ids-with-ignored-semicolon] A U+2028 or U+2029
after the `,` stays where it is. [test: U+2028 after the comma of a state class
statement] [test: U+2029 after the comma of a state class statement]

The classes after the ids, `class A x,y`, and the ids of a `style` statement,
`style A,B fill:red`, are printed as written: `x, y` would be one class named
`x, y`, and `style A, B fill:red` would give `A` the style `B fill:red`, so the
Db would change (see
[Lists separated by commas](./compatibility.md#lists-separated-by-commas)).
[fixture: whitespace-between-tokens/comma-lists-without-space-kept]

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
  A:::highlight
  state f1 <<fork>>
  state "" x
  classDef c fill: red, stroke: blue
  class A, B c
  scale 350 width
  hide empty description
```

Input
([whitespace-between-tokens/keyword-case-one-form-input.mmd](../tests/fixtures/state/whitespace-between-tokens/keyword-case-one-form-input.mmd)):

```mmd
stateDiagram-v2
STATE A {
B
}
Note Left Of A : x
HIDE EMPTY DESCRIPTION
```

Output
([whitespace-between-tokens/keyword-case-one-form-output.mmd](../tests/fixtures/state/whitespace-between-tokens/keyword-case-one-form-output.mmd)):

```mmd
stateDiagram-v2
  state A {
    B
  }
  note Left Of A : x
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
after it: `accTitle  :  t` becomes `accTitle: t`, and a run of spaces and tabs
in the text of an `accDescr` is printed as one space (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)),
while that of an `accTitle` stays as written, since the browser shows it as a
tooltip. [fixture: descriptions-and-labels/acc-text-runs-collapsed] [fixture:
descriptions-and-labels/acc-block-runs-collapsed] The `:` of a description
touches the id of its state and has one space after it: `A : waiting` becomes
`A: waiting`. The whitespace before it is the one that the examples in the
documentation of mermaid.js write at least twice as often as any other: the
examples write 4 descriptions without a space before the `:` and 1 with one
(counted as under
[the examples that decide the whitespace before a colon](./compatibility.md#the-examples-that-decide-the-whitespace-before-a-colon)).
The `:` of a transition label has one space on each side, as the label stands
between the transition and its text: `A-->B:submit` becomes `A --> B : submit`.
The examples write 13 labels with a space before the `:` and 2 without, counted
in the same way, which is more than twice as often, so the label keeps the
space. A directive between the id and the `:` of a description is placed as
under [Directives](#directives), where the gap is printed as without the
directive: `A %%{init: {}}%%: x` becomes `A%%{init: {}}%%: x`. [fixture:
descriptions-and-labels/spaced] [fixture:
descriptions-and-labels/directive-between-id-and-colon] The `:` of a description
after a class spelled as a keyword stays touching it: `A:::style:x` becomes
`A:::style: x`, because a space before the `:` would let the keyword start a
statement. [fixture:
descriptions-and-labels/class-named-style-then-description-kept] The text of a
description and of a transition label is kept as written, with its runs: a label
that wraps draws them (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)).
[fixture: descriptions-and-labels/text-kept] A description of only whitespace
keeps the whitespace after its `:`: `A : ` gives no description, while `A :` is
rejected. [corpus fixture: state/gram-description-blank] [corpus fixture:
state/gram-description-colon-only] [fixture: descriptions-and-labels/blank-kept]
A description or a label that ends with `:` keeps the whitespace after it too:
`A : x: ` is accepted, while `A : x:` is rejected, since a description cannot
end with `:`. [fixture: descriptions-and-labels/ending-colon-kept] The
whitespace is at the end of a line, so the examples are written as strings, in
which `\n` is a line break: `"stateDiagram-v2\nA : \n"` is printed as
`"stateDiagram-v2\n  A : \n"`, and `"stateDiagram-v2\nA : x: \nA-->B:y:  \n"` as
`"stateDiagram-v2\n  A: x: \n  A --> B : y:  \n"` (the fixtures are in the
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
  A: waiting
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
  styleA:#f00;
```

### Notes

What follows the id of a note on one line, its `:` and its text, is read by
mermaid.js from right after the id, without its first two characters, and
trimmed: `note left of A:hi` has the text `i`, and
`note right of A  : two spaces` the text `: two spaces`. [fixture: notes/kept]
Where the first two characters are a `:` and a space or a tab, in either order,
the note is printed with the `:` after one space and the text after one space,
whatever whitespace was written there: `note right of A: x` and
`note left of A\t:\tz` are printed `note right of A : x` and
`note left of A : z`. The text of a note belongs to the note, and a second line
adds a second note, so the colon is not the colon of a key; the one example that
writes a space after the colon writes a space before it (step 3 of
[Which kind a colon is](./printed-form.md#which-kind-a-colon-is); counted as
under
[the examples that decide the whitespace before a colon](./compatibility.md#the-examples-that-decide-the-whitespace-before-a-colon)).
The whitespace inside the text stays, since a note that wraps draws its runs.
The Db and the figure are the same. [fixture: notes/colon-and-text-spaced] Any
other start stays as written, and so does a note with an empty text, with a
comment or a directive, or with a character other than an ASCII one. [fixture:
notes/colon-and-text-kept] In `note left of A:h` the `:` and the `h` are the two
characters that mermaid.js drops, so the note has no text, and the whitespace
after the `h` is dropped. [fixture: notes/one-character-text-kept] [corpus
fixture: state/lex-note-colon-then-one-character] The whitespace before the id
becomes one space. A text that mermaid.js does not read right after the
position, as in `note left of%%x A`, keeps touching the position.

The pinned Mermaid renders `stateDiagram-v2` notes as Markdown labels, setting
`labelType` to `markdown` in
[`dataFetcher.ts`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/state/dataFetcher.ts#L380-L386).
This is limited Markdown support: lists fall back to their source text instead
of a list layout in
[`handle-markdown-text.ts`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/handle-markdown-text.ts#L120-L145).
The formatter recognizes Markdown with the same Marked 16.4.2 as pinned Mermaid.
It does not run the Markdown formatter on note contents; the rules below only
align supported paragraph margins while preserving the remaining body text.
[fixture: notes/markdown-code-kept] [fixture:
notes/markdown-unordered-list-kept]

For a note whose body starts after a single-line header, with `end note`
starting its own line, align every content line of a single paragraph one level
inside the note. Replace leading ASCII spaces with the body indentation; the
first content line may also have leading tabs, which Mermaid trims. Later lines
with a tab in their margin fall outside this paragraph rule. Preserve the
remaining text, line breaks and trailing spaces. Empty and whitespace-only rows
before or after the paragraph stay exactly as written. Use ASCII spaces even
with `useTabs`, and no leading spaces at `tabWidth: 0`. Nesting and `tabWidth`
determine the body level. [fixture: notes/payment-prose] [fixture:
notes/prose-nested-four] [fixture: notes/prose-use-tabs] [fixture:
notes/prose-zero-width] [fixture: notes/prose-one-trailing-space] [fixture:
notes/prose-tab-margin-kept] [fixture: notes/over-lines-text-ends-kept]
[fixture: notes/later-tab-margin-kept]

Only ordinary text, inline emphasis, backtick code closed on the same physical
line, bare autolinks on one physical line, and exact `<br/>` forms after other
text on that line qualify within the paragraph. Their contents stay written;
only line margins align. [fixture: notes/inline-emphasis-margins] [fixture:
notes/inline-code-margins] [fixture: notes/inline-br-margins] [fixture:
notes/autolink-margins]

Text such as `+Cash` and `#Heading` aligns when Marked reads it as ordinary
paragraph text. [fixture: notes/plain-block-like-text]

For this paragraph check, use the input body with its written margins when the
configured body indentation has at least four spaces. Markers that Marked reads
as literal paragraph continuations may then align. With fewer than four spaces,
check the input content after removing each content line's leading ASCII-space
and tab padding. Preserve later margins if this exposes a list, a setext
heading, or another form outside the supported paragraph. [fixture:
notes/markdown-unordered-list-kept] [fixture: notes/markdown-ordered-list-kept]
[fixture: notes/markdown-ordered-parenthesis-kept] [fixture:
notes/literal-markers-zero-width] [fixture:
notes/marker-at-paragraph-boundary-kept] [fixture:
notes/literal-setext-zero-width]

For bodies outside this paragraph rule, align only the first physical body line
when it is nonempty and starts with only ASCII-space/tab padding. Use the
configured body indentation, as for eligible paragraphs. Do not infer a
different indentation from protected later lines: their authored margins are
part of the body text and may affect rendering. This rule applies with or
without later content lines, and with any later margins. [fixture:
notes/backslash-margins-kept] [fixture: notes/protected-tab-margins-kept]
[fixture: notes/heading-at-paragraph-boundary-kept] [fixture:
notes/markdown-code-kept] [fixture: notes/single-markup-row] [test: U+00A0 at
the start of a later note row]

Mermaid trims the first-line margin before storing the note, so this step keeps
the raw Db identical even for HTML or Markdown. Keep every later margin as
written; for example, indenting the inside of `<pre>` can change the drawing. A
blank first row or leading whitespace other than ASCII spaces and tabs keeps its
source. [fixture: notes/html-note-kept] [fixture: notes/html-pre-first-line]
[fixture: notes/whitespace-only-body] [fixture: notes/html-break-first-line]
[fixture: notes/html-first-line-tabs] [fixture:
notes/html-first-line-zero-width] [fixture: notes/first-tab-markup-margin]

Mermaid keeps the margins in the Db, so the Db of the printed note differs from
the Db of the written note, but it draws the same figure. Both texts of each
fixture of this section whose printed note differs from the written one were
drawn with mermaid.js 12.3.0 in Chromium, after the state that the note refers
to was declared where the fixture does not declare it, and with `handDrawnSeed`
set, since the lines of the box of a note are random otherwise. The SVG, without
the generated ids, and the pixels were the same, except for
`notes/over-lines-empty-id-kept`, whose note refers to an empty id and which
mermaid.js 12.3.0 cannot draw in either form. The tests compare the Db of the
printed text with the margins of the notes restored from the Db of the written
text (`stateDbForFormattingComparison` in `tests/state-note-margins.ts`). When
the pinned mermaid.js is updated, draw both texts of each fixture again before
the exception stays.

For example, the first line of the following note uses the configured four
spaces. Its blank-separated later paragraphs retain their two spaces: moving
them to four spaces changes Mermaid's reading and drawing. Keeping all three
lines at two spaces would also preserve rendering, but this formatter uses the
configured body indentation for the trimmed first line rather than adopting an
authored margin.

Output
([notes/over-lines-empty-lines-kept-output.mmd](../tests/fixtures/state/notes/over-lines-empty-lines-kept-output.mmd)):

```mmd
stateDiagram-v2
  A
  note right of A
    one

  two


  three
  end note
  B
```

Likewise, a line after a backslash can retain twelve spaces while the trimmed
first line uses the configured four. Moving the later line to four spaces
changes the drawing; copying its twelve spaces to the first line would only
introduce excessive indentation. [fixture: notes/backslash-margins-kept]

Output
([notes/html-note-kept-output.mmd](../tests/fixtures/state/notes/html-note-kept-output.mmd)):

```mmd
stateDiagram-v2
  Paid
  note right of Paid
    Payment<br/>confirmed
    Receipt sent
  end note
```

Statements or trivia before `note` or after `end note` do not prevent ordinary
paragraph alignment. [fixture: notes/prose-adjacent-header] [fixture:
notes/prose-adjacent-closer] [fixture: notes/prose-closer-comment] [fixture:
notes/prose-header-directive]

Notes containing comments, directives, semicolons or protected joining regions
keep their complete bodies as written. This includes semicolon-terminated
entities. [fixture: comments/text-in-note-lines-kept] [fixture:
notes/over-lines-directive-on-header-line] [corpus fixture:
state/tokens-note-block-ignored-semicolon]

Except for that trimmed first-row margin, keep blank-separated paragraphs, block
syntax, fenced or multiline code, strikethrough, general HTML, bracketed links,
links enclosed in angle brackets, backslashes and whitespace other than ASCII
spaces within content lines. Marked recognizes block syntax, including lists and
headings. These margins can appear in rendered text when Mermaid displays a
block's source literally. For example, increasing two spaces after a blank line
to four can change three displayed paragraphs into a different layout. This does
not reformat general Markdown. [fixture: notes/over-lines-empty-lines-kept]
[fixture: notes/list-body-margin-kept] [fixture:
notes/heading-at-paragraph-boundary-kept] [fixture: notes/markdown-heading-kept]
[fixture: notes/markdown-code-kept] [fixture: notes/code-spanning-lines-kept]
[fixture: notes/strikethrough-spanning-lines-kept] [fixture:
notes/link-spanning-lines-kept] [fixture: notes/backslash-margins-kept]
[fixture: notes/angle-link-margins-kept] [fixture:
notes/markdown-empty-ordered-dot-kept] [fixture:
notes/markdown-empty-ordered-parenthesis-kept] [test: U+00A0 at the start of a
later note row] [test: U+2028 on a later note row] [test: U+2029 on a later note
row]

A line ending in two or more ASCII spaces before another content line is a
Markdown hard break: keep its trailing spaces and subsequent body lines as
written, aligning only the trimmed first-row margin when eligible. One trailing
space on an earlier line, and trailing spaces on the last body line, stay
written when the body margin is aligned. [fixture: notes/prose-trailing-spaces]
[fixture: notes/prose-one-trailing-space]

Mermaid preserves leading whitespace after internal newlines in raw
`notes[].text`. The permitted ASCII-space prefix changes are therefore a limited
Db exception, with rendering preserved; parser, specification and recorded
Mermaid readings stay unchanged. Other multiline note bodies retain their
written columns apart from the eligible first-row margin, including empty or
whitespace-only edge lines. `end note` stands at the level of the note. The
whitespace after the id on the header line is dropped; after a comment or
directive on that line it stays as written. [fixture: notes/over-lines]
[fixture: notes/over-lines-first-line-column-kept] [fixture:
notes/over-lines-text-ends-kept] [fixture:
notes/over-lines-directive-on-header-line] [fixture:
notes/over-lines-end-note-indentation-set] [fixture:
notes/over-lines-in-composite] [fixture: notes/over-lines-empty-lines-kept] A
note over lines with no text, as in `note right of A` followed by a line
`end note`, is accepted with the empty text, and prints its two lines. [fixture:
notes/over-lines-empty] [corpus fixture: state/lex-note-block-empty] When the
text of a note over lines starts on the line of its id, as in
`note right of A text`, the first row of the text is on that line, and Mermaid
trims only the margin of that row: the margins of the later rows are part of the
text and stay as written, and `end note` stands at the level of the note.
[fixture: notes/over-lines-text-on-id-line-kept] The same holds when the id is
empty: in `note left of %%x`, mermaid.js reads the `%%x` as the start of the
text. [fixture: notes/over-lines-empty-id-kept] [corpus fixture:
state/lex-note-id-percent-block] A note on one line with no text keeps the
whitespace after its `:`, as a description does: `note left of A : ` is
accepted, while `note left of A :` is rejected; so does a note with two
whitespace characters before the `:` and nothing after it, whose text is the `:`
alone. [fixture: notes/blank-text-kept] The quotes of a floating note are kept
as written, and so is the text between them with its whitespace, as the inside
of a quoted label is in flowchart: `note ""floating" as N` has the text
`floating`, and `note "  floating   text  " as N` stays. mermaid.js reads the
same text and draws the same note whatever the whitespace there; the Db and the
pixels were the same. [fixture: notes/floating-note-text-whitespace-kept]
[fixture: notes/over-lines] The `as` of a floating note stands after one space,
and so does the id after it, also where they touched: `note "t"as N` and
`note "t" asN` are printed `note "t" as N`. mermaid.js reads the three spellings
the same, and the `as` and the id of an alias definition are printed in the same
way (see [Aliases](#aliases)). A directive in the gap is placed as under
[Directives](#directives), and a U+2028 or U+2029 stays where it is. [fixture:
notes/floating-note-as-gaps-spaced] [fixture:
notes/floating-note-as-beside-directive] [test: U+2028 before the `as` of a
floating note] [test: U+2029 between the `as` and the id of a floating note]

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
([notes/payment-prose-input.mmd](../tests/fixtures/state/notes/payment-prose-input.mmd)):

```mmd
stateDiagram-v2
    note right of Paid
        Payment can be card,
            wallet, or bank transfer
    end note
```

Output
([notes/payment-prose-output.mmd](../tests/fixtures/state/notes/payment-prose-output.mmd)):

```mmd
stateDiagram-v2
  note right of Paid
    Payment can be card,
    wallet, or bank transfer
  end note
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
reads `"d" as A`, so the Db is the same, and the words of the statement stand
apart in one form (`asA` is no `as`). [fixture: aliases/second-description-kept]
[fixture: aliases/tabs-between-parts] [fixture: aliases/id-kept] The `""` that
it does not read before and after the string stand apart from it in the same
way. `asA` is no `as`, and is rejected. The `:` before the second description
stands after one space and the description after it as written: no example in
the documentation of mermaid.js writes a second description, so the colon is
printed as a mark that stands between two things (step 3 of
[Which kind a colon is](./printed-form.md#which-kind-a-colon-is)). The second
description, the text after the `:`, is kept as written, except for the
whitespace at its end: mermaid.js reads it with the whitespace at its ends, so
`:short` and `: short` give different descriptions, and draws it without the
whitespace at its end (see
[Texts after a keyword that are drawn the same](./compatibility.md#texts-after-a-keyword-that-are-drawn-the-same)).
The directives that end it are printed with one space before each that has
whitespace before it, and the whitespace after the last one is left out:
`state "d" as A : x   %%{x}%%  ` is printed `state "d" as A : x %%{x}%%`. A
description of spaces and tabs only, and one that holds a `;`, stay as written.
[corpus fixture: state/db-alias-colon-spaces-second] [fixture:
aliases/second-description-kept] [fixture:
aliases/second-description-trailing-directive-blanks-dropped] [fixture:
aliases/second-description-two-directives-trailing-blanks-dropped] [fixture:
aliases/second-description-trailing-whitespace-dropped] [fixture:
aliases/second-description-blank-kept] [fixture:
aliases/second-description-semicolon-kept] The whitespace before the `:` becomes
one space.

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
`state f1<<fork>>` is read as `state f1 <<fork>>` and the Db is the same; the
mark stands apart from the name in one form, as the words of an alias definition
do. [corpus fixture: state/lex-fork-spaced-id] [corpus fixture:
state/lex-choice-square-brackets] [fixture: pseudostates/mark-spaced] [fixture:
pseudostates/all-marks-spaced]

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
statements around it, and a directive within a printed line is placed as in a
flowchart: the gap is printed as without the directive, and the directive stands
after its space and touches the unit that follows it. [fixture: directives/kept]
[fixture: directives/before-header] [fixture: directives/after-statement]
[fixture: directives/whitespace-on-each-side]

When formatting splits units that were on the same line, a directive in their
gap moves with the following unit. Keep its right-side contact or separation;
break its left contact.

[fixture: state/directives/split-directive-gap]

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
  Foo %%{init: {}}%%--> B
```

### Colors

A color in a style is printed in lower case, as the examples in the
documentation of mermaid.js write it and as the CSS formatter of Prettier prints
it: `style A fill:#F9F,stroke:#ABCDEF` is printed
`style A fill: #f9f, stroke: #abcdef`. The colors in the styles of the `style`
and `classDef` statements of a state diagram are printed so. A color is a `#`
and 3, 4, 6, or 8 hexadecimal digits that stand alone in the value of a style;
it is never shortened, and a text that is no color stays as written (see
[Colors that are drawn the same](./compatibility.md#colors-that-are-drawn-the-same)).
[fixture: colors/colors-in-lower-case] [fixture:
colors/words-that-are-not-colors-as-written]

Input
([colors/colors-in-lower-case-input.mmd](../tests/fixtures/state/colors/colors-in-lower-case-input.mmd)):

```mmd
stateDiagram-v2
A --> B
classDef c fill:#DEADBE,color:#C0FFEE
class B c
style A fill:#F9F,stroke:#ABCDEF
```

Output
([colors/colors-in-lower-case-output.mmd](../tests/fixtures/state/colors/colors-in-lower-case-output.mmd)):

```mmd
stateDiagram-v2
  A --> B
  classDef c fill: #deadbe, color: #c0ffee
  class B c
  style A fill: #f9f, stroke: #abcdef
```

Input
([colors/words-that-are-not-colors-as-written-input.mmd](../tests/fixtures/state/colors/words-that-are-not-colors-as-written-input.mmd)):

```mmd
stateDiagram-v2
A --> B
style A fill:#ABCDE,stroke:#ABCDEF1
classDef c fill:url(#ABC),stroke:#ABC-x
```

Output
([colors/words-that-are-not-colors-as-written-output.mmd](../tests/fixtures/state/colors/words-that-are-not-colors-as-written-output.mmd)):

```mmd
stateDiagram-v2
  A --> B
  style A fill: #ABCDE, stroke: #ABCDEF1
  classDef c fill: url(#ABC), stroke: #ABC-x
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

As in [flowchart's top-level descriptions](./flowchart.md#multi-line-values),
align the lines of an `accDescr { ... }` body one step inside its statement,
with a separate `}` at the statement's level. Mermaid discards this indentation
from the description. [fixture: multi-line-values/kept] [fixture:
multi-line-values/accdescr-block-single-line] [fixture:
multi-line-values/accdescr-block-empty-and-comment-lines-kept] A closed block
with no text prints `{}` internally: `accDescr { }` becomes `accDescr {}`,
including whitespace runs, line breaks and Unicode whitespace (also U+2028 and
U+2029) inside the braces; an already empty interior stays empty, and the
keyword and opening brace have one space between them. There is no text for
interior whitespace to surround, so the Db-equal choice follows
[flowchart's accessibility lines](./flowchart.md#accessibility-lines), agentflow
and usecase. A prior description stays in the Db. [fixture:
multi-line-values/empty-description-interiors] [test: accessibility revisions:
state empty-description-nbsp] Blocks with comments or directives keep their
contents and line breaks, and unclosed blocks stay open. [fixture:
multi-line-values/empty-description-trivia-kept] [corpus fixture:
state/lex-acc-descr-block-unclosed] The lines of an unclosed block are aligned
as those of a closed one, up to the end of the text, and no `}` is added.
[fixture: multi-line-values/unclosed-block-aligned] Block note paragraphs follow
the restricted [Notes](#notes) rule. [fixture: notes/payment-prose] The text of
a floating note written over several lines stays as written. [fixture:
multi-line-values/kept] [fixture:
multi-line-values/floating-note-empty-line-kept]

Blocks on one line follow
[A description block on one line](./compatibility.md#a-description-block-on-one-line).
[fixture: multi-line-values/block-text-on-one-line-padded]

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

### Semicolons at the end of a style statement

A line-ending `;` of a `classDef` or `style` statement is dropped when the
[line rule of mermaid.js](../../spec/docs/common.md#style-and-classdef-lines)
ignores it: no whitespace lies between the `:` and the later `#`. Removing this
terminator leaves the Db unchanged, also with several styles. [fixture:
semicolons-at-the-end-of-a-style-statement/hash-terminators] Whitespace
immediately before a dropped `;` is dropped with it. [fixture:
semicolons-at-the-end-of-a-style-statement/space-before-terminator] The line
then formats as a line without that `;`, including its usual style spacing.
[fixture: semicolons-at-the-end-of-a-style-statement/hash-terminators] Blank
lines and comment lines keep their usual layout around the statement. [fixture:
semicolons-at-the-end-of-a-style-statement/blank-and-comment-lines] An empty
description block follows its usual layout while the style terminator is
dropped. [fixture:
semicolons-at-the-end-of-a-style-statement/empty-description-block]

Without a `#` in the statement, a final `;` in the last style is dropped when
that style contains no other `;` and has non-whitespace text before it:
mermaid.js removes the first `;` of each style. [fixture:
semicolons-at-the-end-of-a-style-statement/style-text-terminators] Keep
`classDef c fill:red;;`, `classDef c ;` and `style A fill : #f00;`; they do not
meet these conditions. [fixture:
semicolons-at-the-end-of-a-style-statement/style-text-kept] A statement with no
style, such as `style A`, has no `;` to drop, and its whitespace follows the
usual layout. [fixture:
semicolons-at-the-end-of-a-style-statement/no-style-spacing] [corpus fixture:
state/lex-style-without-styles] A transition such as `A --> B;` keeps its
semicolon, which is part of its id. [fixture:
semicolons-at-the-end-of-a-style-statement/transition-semicolon-kept]

A directive after the semicolon on the same line keeps the `;`. [fixture:
semicolons-at-the-end-of-a-style-statement/trailing-items-kept] Following `%%`
text on the same line also keeps it; here it is part of the style. [fixture:
semicolons-at-the-end-of-a-style-statement/trailing-items-kept] An ignored `;`
beside another `;` is kept to preserve the line rule's selection. [fixture:
semicolons-at-the-end-of-a-style-statement/adjacent-semicolons-kept] A `;` after
an unclosed directive stays, preserving its stopping boundary. [fixture:
semicolons-at-the-end-of-a-style-statement/unclosed-directive-kept] The same
protection applies before U+2028 and U+2029; see
[A line that a `;` ends](./compatibility.md#a-line-that-a--ends). [test: style
semicolons: state before U+2028] [test: style semicolons: state before U+2029] A
closed directive between the statement and an ignored terminator is kept while
the `;` is dropped. [fixture:
semicolons-at-the-end-of-a-style-statement/directive-before-terminator]

A statement whose styles are all empty, such as `style A ,%%{init: {}}%%`, has
no style text that a `;` could end, so it formats as usual and keeps its
directive: a `;` after the comma would be a style of its own (see
[StateClassDefStatement](../../spec/docs/ast/state.md#stateclassdefstatement)).
[fixture: semicolons-at-the-end-of-a-style-statement/empty-styles]

Output
([semicolons-at-the-end-of-a-style-statement/hash-terminators-output.mmd](../tests/fixtures/state/semicolons-at-the-end-of-a-style-statement/hash-terminators-output.mmd)):

```mmd
stateDiagram-v2
  A --> B
  classDef c fill: #f00
  style A fill: #f00
  classDef d fill: #0f0, stroke: #00f
  style A fill: #0f0, stroke: #00f
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
multi-line-statements/empty-line-inside-joined] A next-line `accTitle:` or
`accDescr:` value keeps its line break and the usual continuation indentation
when joining would make a direction statement: `direction` and a whitespace run
followed by `TB`, `BT`, `RL` or `LR`, compared case-insensitively, even after
other value text. This preserves the title or description instead of changing
the diagram's direction. Thus `"accTitle:\n direction LR"` prints
`"  accTitle:\n    direction LR"`; `direction TD` still joins because `TD` is
not a state direction. [fixture:
multi-line-statements/next-line-direction-title] [fixture:
multi-line-statements/next-line-direction-description] [fixture:
multi-line-statements/next-line-direction-lower-value] [fixture:
multi-line-statements/next-line-direction-mixed-keyword] [fixture:
multi-line-statements/next-line-direction-spaced-bt] [fixture:
multi-line-statements/next-line-direction-after-text] [fixture:
multi-line-statements/next-line-direction-tb] [fixture:
multi-line-statements/next-line-direction-rl] [fixture:
multi-line-statements/next-line-direction-td-joined] CRLF before the value and
NBSP indentation follow the same rule, printed with the configured line ending
and continuation indentation. [test: accessibility revisions: state
next-line-direction-crlf] [test: accessibility revisions: state
next-line-direction-nbsp] So `classDef c` followed by a line `fill:red` is
printed as `classDef c fill: red`; a line `B --> C` after `classDef a` is a
style of `a`, not a transition, and the printed text shows it. [fixture:
multi-line-statements/joined] [fixture:
multi-line-statements/classdef-takes-next-line] A statement with a comment or
directive keeps its line breaks, while structural continuations and intervening
trivia stand one level deeper, as in a sequence diagram (see
[Multi-line statements](./sequence.md#multi-line-statements)). Whitespace inside
other values remains unchanged. Multiline note paragraph margins follow the
limited [Notes](#notes) rule. [fixture: notes/payment-prose] The first gap-line
tails are retained; joining regions and the composite-state exceptions above
keep the whole statement as written. [fixture:
multi-line-statements/declaration-trivia-continuations] [fixture:
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
  classDef c fill: red
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

A line break stays where joining it, with one space or with nothing, could
change which `;` the line rule ignores, and where a `;` ends the last line; any
other line break is joined as usual, also in a statement that holds a `;`. A
statement that keeps a line break keeps its styles as written. [corpus fixture:
state/db-style-semicolons] [corpus fixture: state/db-classdef-semicolons]
[fixture: multi-line-statements/breaks-decided-one-by-one] [fixture:
multi-line-statements/line-rule-first-hash-after-colon-kept] [fixture:
multi-line-statements/semicolon-kept] A `;` alone does not prevent joining.
[fixture: multi-line-statements/semicolon-in-id-joined] The line rule of
mermaid.js (the specification's
[`style` and `classDef` lines](../../spec/docs/common.md#style-and-classdef-lines))
reads the text of one line: in `classDef`, a line break, and `c fill:#f00;` it
does not match the second line, so `#f00;` is an entity, while on one line, as
`classDef c fill:#f00;`, it matches and ignores the `;`. Joining the lines would
change the style. On a single line the ignored terminator is dropped under
[Semicolons at the end of a style statement](#semicolons-at-the-end-of-a-style-statement).

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

A line that holds U+2028 or U+2029 is kept as written, the second description of
an alias included, whitespace after the character too: `state "d" as A : x`, two
spaces, U+2028, and two spaces stays as written. [test: a second description of
an alias with spaces after a U+2028] Whitespace inside a compact empty
description block is the exception: no text there needs protecting. A separator
outside that interior still keeps the line as written. [test: state Unicode and
tab interiors] [test: state multiline Unicode interior] [test: state exterior
separator keeps the line] [test: state separator with comment stays written] A
composite statement whose opening line holds one keeps it, and its body is
printed as any other body: `state a b`, U+2028, and `{` keeps the character and
indents the statements of the body. So does one on the closing line, as in
`state A {`, a body line `B`, and `}` followed by U+2028: the whitespace after
the `}` stays as written, with the character, and the body is indented. [test:
U+2028 before the brace of a composite statement] [test: U+2028 on the closing
line of a composite statement] [test: U+2029 and whitespace before it on the
closing line of a composite statement] [test: U+2028 on the closing line of a
composite statement in a body] [test: U+2028 after the closing brace at the end
of the text] [test: U+2028 on the opening and on the closing line of a composite
statement] A composite statement in the body of another is printed so too,
whatever the closing lines of the two hold. [test: U+2028 on the closing lines
of a composite statement and of one in its body] [test: U+2028 on the closing
lines of three nested composite statements] A composite statement whose body has
a line that holds one, whose body is empty and whose closing line holds one
(`state A {`, a line of whitespace, and `}`: the statement has no block to
indent, and the line stays as written), whose closing `}` does not start its
line (`B }`, or a directive before it), or whose closing line holds, after the
character, a comment line or a `;` that another rule keeps (see
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

Apart from description-body indentation under
[Multi-line values](#multi-line-values) and the restricted paragraph margins in
[Notes](#notes), and the terminators dropped under
[Semicolons at the end of a style statement](#semicolons-at-the-end-of-a-style-statement),
the following text is kept as written because changing it would change the
diagram or the input would be rejected:

- the text of a value: a description, a label, a note, an id after `as`, a
  pseudostate name, a style, apart from the whitespace around its first `:` and
  its `,` and the runs between its words outside strings, comments, `url(`, and
  the escape after a backslash, the CSS class of a `class` statement, and the
  text of `accTitle`; [fixture:
  whitespace-between-tokens/style-string-runs-kept] [fixture:
  descriptions-and-labels/acc-text-runs-collapsed] [fixture: aliases/id-kept]
- what follows the id of a note on one line, the second description of an alias
  definition, and the whitespace after the `:` of a description of only
  whitespace;
- the names and the `""` after `state`, on the line of `state`;
- whether whitespace is written before a `""`;
- a `%%` or an empty description block right before a `{`, up to the `{`;
- the lines of a statement that holds a `{` and follows a `state` name;
- an arrow and a `:` touching an id that a space would make a keyword;
- a line that holds U+2028 or U+2029;
- a statement protected by a semicolon line or a joining comment region;
- the whitespace before the first line break of a gap containing trivia;
- the text of a direction line before `direction` and after its value; [corpus
  fixture: state/lex-direction-line-same-line-transition] [fixture:
  whitespace-between-tokens/direction-line-text-kept]
- the spelling of the header, `stateDiagram` or `stateDiagram-v2`. [corpus
  fixture: state/header-v1] [fixture: indentation/header-without-v2-kept]
  [fixture: header/spellings-kept]

Some text is kept as written by choice, because the Db is the same either way:
the case of the keywords that the table under
[Spellings that are drawn the same](./compatibility.md#spellings-that-are-drawn-the-same)
does not list, and whether whitespace is written before the mark of a comment
after a statement, a run of it being printed as one space (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)).
[fixture: comments/mark-run-one-space] The second is kept because mermaid.js
reads a comment by what touches it in the places of the known divergences
(`comment-takes-character`, `percent-brace-after-unit`), and one rule is simpler
than a list of those places.
