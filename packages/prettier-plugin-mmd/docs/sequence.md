# Sequence diagram formatting rules

Japanese version: [sequence.ja.md](./sequence.ja.md)

How prettier-plugin-mmd formats a sequence diagram. Each rule below keeps what
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
statements of a block (`loop`, `alt`, `opt`, `par`, `par_over`, `critical`,
`break`, `rect`) and the participants of a `box` stand one level deeper than the
line that opens it; `else`, `and`, `option`, and `end` stand at the level of
that line.

[fixture: indentation/blocks] [fixture: indentation/sections] [fixture:
indentation/other-blocks-kept]

A level is what Prettier's `useTabs` and `tabWidth` options say: two spaces by
default.

[fixture: indentation/tab-width-4] [fixture: indentation/use-tabs]

The indentation written in the input is not kept. Whitespace at the start of a
line is nothing to mermaid.js, so the printer chooses the indentation from the
structure alone, and one rule per level prints the same text whatever the input
was indented with.

[fixture: indentation/sections]

Input
([indentation/blocks-input.mmd](../tests/fixtures/sequence/indentation/blocks-input.mmd)):

```mmd
sequenceDiagram
participant A
loop every minute
A->>B: ping
alt ok
B-->>A: pong
else failed
B-->>A: error
end
end
box aqua Team
participant C
end
rect rgb(0, 0, 255)
A->>C: x
end
```

Output
([indentation/blocks-output.mmd](../tests/fixtures/sequence/indentation/blocks-output.mmd)):

```mmd
sequenceDiagram
  participant A
  loop every minute
    A ->> B: ping
    alt ok
      B -->> A: pong
    else failed
      B -->> A: error
    end
  end
  box aqua Team
    participant C
  end
  rect rgb(0, 0, 255)
    A ->> C: x
  end
```

Input
([indentation/sections-input.mmd](../tests/fixtures/sequence/indentation/sections-input.mmd)):

```mmd
sequenceDiagram
      par a
  A->>B: x
    and b
A->>C: y
end
critical c
A->>B: x
option o
A->>C: y
      end
```

Output
([indentation/sections-output.mmd](../tests/fixtures/sequence/indentation/sections-output.mmd)):

```mmd
sequenceDiagram
  par a
    A ->> B: x
  and b
    A ->> C: y
  end
  critical c
    A ->> B: x
  option o
    A ->> C: y
  end
```

### Statements one per line

Each statement stands on a line of its own. The `;` that separate statements are
dropped: mermaid.js reads a `;` as it reads a line break.

[fixture: statements-one-per-line/semicolons-dropped]

A statement written on the line of the header, or after `end` on its line, moves
to a line of its own.

[fixture: statements-one-per-line/split]

A line that holds a `;` that the line rule of mermaid.js ignores keeps its
statements and its `;`, as in a flowchart (see
[Statements one per line](./flowchart.md#statements-one-per-line)).

[corpus fixture: sequence/tokens-ignored-semicolon-in-participant-id] [corpus
fixture: sequence/tokens-ignored-semicolon-in-message-id] [fixture:
statements-one-per-line/line-with-ignored-semicolon-kept]

Input
([statements-one-per-line/split-input.mmd](../tests/fixtures/sequence/statements-one-per-line/split-input.mmd)):

```mmd
sequenceDiagram A->>B: x; B->>A: y
loop x
A->>B: y
end A->>B: z
```

Output
([statements-one-per-line/split-output.mmd](../tests/fixtures/sequence/statements-one-per-line/split-output.mmd)):

```mmd
sequenceDiagram
  A ->> B: x
  B ->> A: y
  loop x
    A ->> B: y
  end
  A ->> B: z
```

An empty description block, `accDescr {}`, is a statement of its own, also in a
`box`, where it may stand among the participants: a statement written after it
on its line, or the `end` of the box, moves to a line of its own, and mermaid.js
reads the same box.

[fixture: statements-one-per-line/empty-description-block-in-box] [fixture:
statements-one-per-line/empty-description-block-moves-next-statement] [fixture:
statements-one-per-line/empty-description-block-before-semicolon-and-directive]

Input
([statements-one-per-line/empty-description-block-in-box-input.mmd](../tests/fixtures/sequence/statements-one-per-line/empty-description-block-in-box-input.mmd)):

```mmd
sequenceDiagram
box G
accDescr {} participant B
participant C
accDescr {} end
```

Output
([statements-one-per-line/empty-description-block-in-box-output.mmd](../tests/fixtures/sequence/statements-one-per-line/empty-description-block-in-box-output.mmd)):

```mmd
sequenceDiagram
  box G
    accDescr {}
    participant B
    participant C
    accDescr {}
  end
```

A `;` after the directives that follow an `autonumber`, or a `participant` or an
`actor` that ends with a data block and has no `as`, is kept.

[fixture: statements-one-per-line/autonumber-directive-kept] [fixture:
statements-one-per-line/data-block-directive-kept] [fixture:
statements-one-per-line/actor-data-block-directive-kept] [fixture:
statements-one-per-line/autonumber-two-directives-kept]

The statements that follow such a `;` on its line, and the `end` of a block,
stand on lines of their own: `autonumber %%{wrap}%%; A->>B: x; B->>A: y` is
printed as `autonumber %%{wrap}%%;`, `A ->> B: x`, and `B ->> A: y`.

[fixture:
statements-one-per-line/autonumber-directive-semicolon-then-statements-split]

A statement written over several lines, such as `autonumber`, a line break, and
`5`, joins as usual, keeping its directive and its `;` with the statement.

[fixture:
statements-one-per-line/directive-semicolon-after-multi-line-statement-aligned]

mermaid.js removes the directive, and whitespace at the end of the line then
hides the line break from the statement, which needs one, and whose last unit
reads no whitespace: `autonumber`, a space, `%%{wrap}%%`, and `;` are accepted,
while the same without the `;` is rejected. The last unit of the other
statements, a text, an id, or a description after `as`, reads the whitespace
with it (see the specification's
[The statement context](../../spec/docs/diagrams/sequence.md#the-statement-context),
and
[Empty description blocks before a separator](../../spec/docs/diagrams/sequence.md#empty-description-blocks-before-a-separator)
there).

[fixture: statements-one-per-line/closed-directive-semicolon-dropped]

Input
([statements-one-per-line/autonumber-directive-kept-input.mmd](../tests/fixtures/sequence/statements-one-per-line/autonumber-directive-kept-input.mmd)):

```mmd
sequenceDiagram
autonumber %%{wrap}%%;
A->>B: x
```

Output
([statements-one-per-line/autonumber-directive-kept-output.mmd](../tests/fixtures/sequence/statements-one-per-line/autonumber-directive-kept-output.mmd)):

```mmd
sequenceDiagram
  autonumber %%{wrap}%%;
  A ->> B: x
```

Input
([statements-one-per-line/data-block-directive-kept-input.mmd](../tests/fixtures/sequence/statements-one-per-line/data-block-directive-kept-input.mmd)):

```mmd
sequenceDiagram
participant A@{ "type": "actor" } %%{wrap}%%;
A->>B: x
```

Output
([statements-one-per-line/data-block-directive-kept-output.mmd](../tests/fixtures/sequence/statements-one-per-line/data-block-directive-kept-output.mmd)):

```mmd
sequenceDiagram
  participant A@{ "type": "actor" } %%{wrap}%%;
  A ->> B: x
```

### Blank lines

As in a flowchart: a run of empty lines becomes one, and empty lines at the
start and the end of a block are dropped.

[fixture: blank-lines/collapsed] [fixture:
blank-lines/around-comments-and-directives] [fixture:
blank-lines/block-edges-dropped]

Input
([blank-lines/collapsed-input.mmd](../tests/fixtures/sequence/blank-lines/collapsed-input.mmd)):

```mmd
sequenceDiagram


A->>B: x



B->>A: y
loop x

A->>B: z

end
```

Output
([blank-lines/collapsed-output.mmd](../tests/fixtures/sequence/blank-lines/collapsed-output.mmd)):

```mmd
sequenceDiagram
  A ->> B: x

  B ->> A: y
  loop x
    A ->> B: z
  end
```

### Whitespace between tokens

Within a line, a run of spaces and tabs between two tokens becomes one space,
and tokens that touch keep touching, as in a flowchart, except for the text
after a prefix or a keyword of a block, which stands after one space.

[fixture: whitespace-between-tokens/collapsed] [fixture:
whitespace-between-tokens/tabs-collapsed]

A wrap prefix, `wrap:` or `nowrap:`, is separated from its text by one space,
also where they touched: `A->>B:wrap:x` is printed `A ->> B: wrap: x`, and so is
the text of a note or of the alias of a participant. The text after the keyword
of a block or a section (`loop`, `alt`, `else`, `opt`, `par`, `and`, `critical`,
`option`, `break`, `rect`, `box`) stands after one space too: `loop$$x$$` is
printed `loop $$x$$`, and `par-:<>,;# comment` is printed `par -:<>,;# comment`.
The whitespace is not in the Db, so the form is a choice, and the documentation
of mermaid.js writes a space after every block keyword
([`loop Loop text`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/sequenceDiagram.md#L472),
[`alt Describing text`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/sequenceDiagram.md#L492)).

[fixture: whitespace-between-tokens/wrap-text-spaced] [fixture:
whitespace-between-tokens/block-text-touching-spaced]

A directive in the gap is placed as under [Directives](#directives), and a
U+2028 or U+2029 stays where it is. Rule 1 names no mark for a gap that holds
one, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides, as [journey](./journey.md#line-separators) and
[timeline](./timeline.md#line-separators) print such a gap as written.

[fixture: whitespace-between-tokens/block-text-beside-directive] [test: U+2028
between a block keyword and its text] [test: U+2029 between a wrap prefix and
its text]

The `,` between the ids of a note over two participants touches the id before it
and has one space after it, as in `Note over A, B`: `note over A , B` is printed
`Note over A, B`. Every spelling that mermaid.js accepts gives the same Db, so
nothing forces the form. The five notes over two participants in the
documentation of mermaid.js are all written `A,B`, which does not decide the
form: the whitespace that Prettier prints beside a comma, none before it and one
space after it, comes before the form of the documentation
([two](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/sequenceDiagram.md#L49-L77)
and
[three](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/sequenceDiagram.md#L445-L464)).

[fixture: whitespace-between-tokens/collapsed] [fixture:
whitespace-between-tokens/comma-touching]

What stands in the gap beside the `,` is treated as in
[Arrow spacing](#arrow-spacing). The keywords of the table under
[Spellings that are drawn the same](./compatibility.md#spellings-that-are-drawn-the-same)
are printed in the case shown there (`PARTICIPANT A` is `participant A`, `NOTE`
is `Note`, `LOOP` is `loop`). mermaid.js reads them in any case and the Db is
the same. A keyword that the table does not list keeps the case in which it is
written (`Note LEFT of A`).

[fixture: whitespace-between-tokens/keyword-case-one-form] [fixture:
keyword-case/statements-one-form] [fixture: keyword-case/blocks-one-form]

Input
([whitespace-between-tokens/collapsed-input.mmd](../tests/fixtures/sequence/whitespace-between-tokens/collapsed-input.mmd)):

```mmd
sequenceDiagram
participant   A   as   Alice
autonumber  10   5
create   participant C
A->>C: x
note  over A ,C: n
A->>B: wrap:x
A->>B: wrap:   y
```

Output
([whitespace-between-tokens/collapsed-output.mmd](../tests/fixtures/sequence/whitespace-between-tokens/collapsed-output.mmd)):

```mmd
sequenceDiagram
  participant A as Alice
  autonumber 10 5
  create participant C
  A ->> C: x
  Note over A, C: n
  A ->> B: wrap: x
  A ->> B: wrap: y
```

Input
([whitespace-between-tokens/keyword-case-one-form-input.mmd](../tests/fixtures/sequence/whitespace-between-tokens/keyword-case-one-form-input.mmd)):

```mmd
sequenceDiagram
PARTICIPANT A
Note LEFT OF A: x
participant B AS Bob
LOOP x
A->>B: y
END
```

Output
([whitespace-between-tokens/keyword-case-one-form-output.mmd](../tests/fixtures/sequence/whitespace-between-tokens/keyword-case-one-form-output.mmd)):

```mmd
sequenceDiagram
  participant A
  Note LEFT of A: x
  participant B as Bob
  loop x
    A ->> B: y
  end
```

A run of spaces and tabs in the text of a message, a note, a block, a `box`, and
a description after `as` is printed as one space (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)),
while the whitespace in the JSON of `links` and `properties` is part of the
value, and is kept. A text with a `<` or a diagram that holds `white-space`
stays as written there too.

[fixture: whitespace-between-tokens/values-runs-collapsed] [fixture:
whitespace-between-tokens/values-of-other-statements-runs-collapsed] [fixture:
whitespace-between-tokens/html-tag-runs-kept]

The text of a `box` is kept as a whole: when its first word is no colour,
mermaid.js takes the whole text as the name of the box.

[fixture: whitespace-between-tokens/values-runs-collapsed] [fixture:
whitespace-between-tokens/box-text-runs-collapsed]

The data block of a participant, `@{ ... }`, touches its id: mermaid.js reads
the same diagram with whitespace between them as without, so the whitespace is
dropped, also a no-break space, an ideographic space or a byte order mark.

[test: no-break space between the id of a participant and its data block] [test:
byte order mark between the id of a participant and its data block] [test:
ideographic space between the id of a participant and its data block]

The data block may stand on one line or on several, and `as` may follow it.

[fixture: whitespace-between-tokens/data-block-space-before-removed] [fixture:
whitespace-between-tokens/data-block-space-before-removed-alias] [fixture:
whitespace-between-tokens/data-block-multi-line-space-before-removed] [fixture:
whitespace-between-tokens/data-block-space-before-removed-between-statements]

A directive between the id and `@{` is placed as under
[Directives](#directives), touching both, as the gap has no space:
`participant A %%{init: {}}%% @{ "type": "queue" }` is printed
`participant A%%{init: {}}%%@{ "type": "queue" }`.

[fixture: whitespace-between-tokens/data-block-space-before-after-directive]

Its contents stay written except for the eligible margins in
[Multi-line values](#multi-line-values) and the spaces and tabs at the ends of a
block on one line, which become one space each, as in
[Data blocks](./flowchart.md#data-blocks): `participant A@{"type":"queue"}`
becomes `participant A@{ "type":"queue" }`.

[fixture: whitespace-between-tokens/data-block-padded]

A long block is not split over lines, since mermaid.js rejects the lines of a
block mapping there.

[fixture: whitespace-between-tokens/data-block-long-kept]

The block stays as written where that rule says so.

[fixture: whitespace-between-tokens/data-block-directive-kept] [fixture:
whitespace-between-tokens/data-block-kept-line-kept] [test: data blocks:
sequence one line with U+2028 inside] [test: data blocks: sequence one line with
U+2029 inside] [test: data blocks: sequence one line with no-break spaces at the
ends] [fixture: whitespace-between-tokens/data-block-padded-zero-width]
[fixture: whitespace-between-tokens/data-block-surrounding-trivia] [fixture:
whitespace-between-tokens/data-block-and-ignored-line-kept] [fixture:
whitespace-between-tokens/actor-data-block-kept]

A data block of a `participant` or an `actor`, with or without `create`, that
holds none of `:`, `,`, `;`, and `>`, and no line break, is read by a version
that counts as a part of the name of the participant, with the whitespace before
it, the whitespace inside it, and the whitespace before a `%%` comment after it,
whatever whitespace characters it holds but a line break. So the gap before the
block, the block, and that gap before the comment stay as written, and the block
is not padded: `participant A   @{ x }` and `actor B@{x}` stay, and so does the
whitespace before the `%%` in `participant C@{ y }   %% c`. mermaid.js removes
the directives before it reads the name, so the name runs over a directive in
that whitespace, one that is not closed included, and the whitespace on both
sides of it stays: `participant B@{x}   %%{init: {}}%%   %% c`. A directive that
ends the line, with no comment after it, is an ordinary gap, printed
`participant E@{z} %%{init: {}}%%`. A block with one of these characters or with
a line break is printed as above (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).

[fixture: whitespace-between-tokens/data-block-name-gap-before-kept] [fixture:
whitespace-between-tokens/data-block-name-comment-gap-kept] [fixture:
whitespace-between-tokens/data-block-name-directive-then-comment-gap-kept]
[fixture:
whitespace-between-tokens/data-block-name-unclosed-directive-then-comment-gap-kept]
[fixture:
whitespace-between-tokens/data-block-name-directive-at-line-end-spaced]
[fixture: whitespace-between-tokens/data-block-space-only-kept] [fixture:
whitespace-between-tokens/compat-malformed-data-block-kept] [fixture:
whitespace-between-tokens/data-block-name-end-characters-padded] [fixture:
whitespace-between-tokens/data-block-name-created-kept] [fixture:
whitespace-between-tokens/data-block-name-created-comment-gap-kept] [test: data
blocks: sequence name block with a no-break space before a comment] [test: data
blocks: sequence name block with an ideographic space before a comment] [test:
data blocks: sequence name block with a form feed before a comment]

A line that mermaid.js reads as nothing, such as `)` alone, is kept and stands
at the level of the statements around it.

[fixture: whitespace-between-tokens/data-block-and-ignored-line-kept] [corpus
fixture: sequence/lex-invalid-line-parenthesis] [fixture:
whitespace-between-tokens/ignored-line-in-block-kept]

Input
([whitespace-between-tokens/values-runs-collapsed-input.mmd](../tests/fixtures/sequence/whitespace-between-tokens/values-runs-collapsed-input.mmd)):

```mmd
sequenceDiagram
A->>B: x   y
box Group   1
participant C
end
links A: {"a":  "b"}
loop   every  minute
A->>B: z
end
```

Output
([whitespace-between-tokens/values-runs-collapsed-output.mmd](../tests/fixtures/sequence/whitespace-between-tokens/values-runs-collapsed-output.mmd)):

```mmd
sequenceDiagram
  A ->> B: x y
  box Group 1
    participant C
  end
  links A: {"a": "b"}
  loop every minute
    A ->> B: z
  end
```

Input
([whitespace-between-tokens/data-block-and-ignored-line-kept-input.mmd](../tests/fixtures/sequence/whitespace-between-tokens/data-block-and-ignored-line-kept-input.mmd)):

```mmd
sequenceDiagram
participant A@{ "type":   "queue" }
A->>B: x
)
```

Output
([whitespace-between-tokens/data-block-and-ignored-line-kept-output.mmd](../tests/fixtures/sequence/whitespace-between-tokens/data-block-and-ignored-line-kept-output.mmd)):

```mmd
sequenceDiagram
  participant A@{ "type":   "queue" }
  A ->> B: x
  )
```

A `;` that the line rule ignores between two tokens of a statement stands
against the token before it, with one space after it where whitespace was
written in the gap and none where it was not.

[fixture: whitespace-between-tokens/ignored-semicolon-before-of-attached]
[fixture:
whitespace-between-tokens/ignored-semicolon-before-of-spaced-after-kept]

### Keyword case

The keywords of the table under
[Spellings that are drawn the same](./compatibility.md#spellings-that-are-drawn-the-same)
are printed in the case shown there: `ACTOR`, `AUTONUMBER`, `ACTIVATE`,
`DEACTIVATE`, `BOX`, `CREATE`, `DESTROY`, `LINK`, `LINKS`, `OVER`, `RIGHT`,
`AS`, and `OF` in the statements, and `ALT`, `ELSE`, `OPT`, `PAR`, `AND`,
`CRITICAL`, `OPTION`, `BREAK`, `RECT`, `LOOP`, and `END` in the blocks are
printed in lower case, and `NOTE` is printed `Note`.

[fixture: keyword-case/statements-one-form] [fixture:
keyword-case/statements-one-form-2] [fixture: keyword-case/blocks-one-form]
[fixture: keyword-case/blocks-one-form-2]

Input (escaped):
`"sequenceDiagram\nACTOR A AS Alice\nparticipant B\nAUTONUMBER\nACTIVATE A\nDEACTIVATE A\nBOX Group\nparticipant C\nEND\nNote OVER A,B: together\nNote RIGHT OF A: side\nLINK A: Docs @ https://example.com\nLINKS B: {\"Docs\":\"https://example.com\"}"`.

Output
([keyword-case/statements-one-form-output.mmd](../tests/fixtures/sequence/keyword-case/statements-one-form-output.mmd)):

```mmd
sequenceDiagram
  actor A as Alice
  participant B
  autonumber
  activate A
  deactivate A
  box Group
    participant C
  end
  Note over A, B: together
  Note right of A: side
  link A: Docs @ https://example.com
  links B: {"Docs":"https://example.com"}
```

### Colors

A color function that stands alone as the text of a `rect`, or as the color of a
`box`, is printed with one space after each comma: `rect rgb(191,223,255)` is
printed `rect rgb(191, 223, 255)`, and `box hsl(10,40%,90%) Team` is printed
`box hsl(10, 40%, 90%) Team`. The documentation of mermaid.js writes the colors
of a `rect` so (all 4 examples), and those of a `box` as often with the space as
without it, so 6 of the 8 examples have it. The color of a `box` is the part of
its text that mermaid.js asks the browser about (`color-candidate`); when the
browser does not take it for a color, mermaid.js takes the whole text of the box
for its title, and the spaces would change the title. So the printer touches
only a function of the form that every browser reads: `rgb(` with three
arguments and `rgba(` with four (`rgb(10%,20,30)` is no color), `hsl(` with
three and `hsla(` with four, the second and the third of an `hsl` a percentage,
all in lower case. `box rgb(33,66,99) Team (x)` stays as written, since the
pattern of mermaid.js reads up to the last `)`, and so do
`box RGB(33,66,99) Team`, `box rgb (33,66,99) Team`, and a `rect` with more text
than the function. The whitespace before a comma, immediately after the opening
`(`, and immediately before the closing `)` stays as written. In a `rect`,
`rgb(191 ,223 ,255)` keeps the spaces before the commas, since some of the
versions of mermaid.js that count read `rgb(191, 223, 255)` as a different
message value in the Db (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).

[fixture: colors/functions-spaced] [fixture: colors/function-padding-kept]
[fixture: colors/functions-as-written] [fixture:
colors/functions-beside-comments-and-directives]

A directive within a channel is removed before the function is recognized, and
stays as written while the commas take their ordinary spacing. See
[Colors that are drawn the same](./compatibility.md#colors-that-are-drawn-the-same)
for the versions that were run and the Db.

[fixture: colors/directive-in-channel]

Input
([colors/functions-spaced-input.mmd](../tests/fixtures/sequence/colors/functions-spaced-input.mmd)):

```mmd
sequenceDiagram
participant A
participant B
rect rgb(191,223,255)
A->>B: one
end
rect rgba(0,0,255,.1)
A->>B: two
end
rect hsl(120,100%,50%)
A->>B: three
end
rect hsla(120,100%,50%,0.5)
A->>B: four
end
rect rgb(10%,20%,30%)
A->>B: five
end
rect rgb(191,223, 255)
A->>B: six
end
rect rgb(191,  223,   255)
A->>B: seven
end
box rgb(33,66,99)
participant C
end
box rgba(33,66,99,0.5) Team
participant D
end
box hsl(10,40%,90%) Team
participant E
end
box hsla(10,40%,90%,0.5)Team
participant F
end
```

Output
([colors/functions-spaced-output.mmd](../tests/fixtures/sequence/colors/functions-spaced-output.mmd)):

```mmd
sequenceDiagram
  participant A
  participant B
  rect rgb(191, 223, 255)
    A ->> B: one
  end
  rect rgba(0, 0, 255, .1)
    A ->> B: two
  end
  rect hsl(120, 100%, 50%)
    A ->> B: three
  end
  rect hsla(120, 100%, 50%, 0.5)
    A ->> B: four
  end
  rect rgb(10%, 20%, 30%)
    A ->> B: five
  end
  rect rgb(191, 223, 255)
    A ->> B: six
  end
  rect rgb(191, 223, 255)
    A ->> B: seven
  end
  box rgb(33, 66, 99)
    participant C
  end
  box rgba(33, 66, 99, 0.5) Team
    participant D
  end
  box hsl(10, 40%, 90%) Team
    participant E
  end
  box hsla(10, 40%, 90%, 0.5)Team
    participant F
  end
```

### Arrow spacing

A message has one space before and after its arrow, as a flowchart link does:
`Alice->>Bob: hi` becomes `Alice ->> Bob: hi`.

[fixture: arrow-spacing/spaced]

The `+` or `-` after the arrow touches the target: `A ->> + B` is printed
`A ->> +B`.

[fixture: arrow-spacing/plus-and-minus-touching]

The whitespace beside a `()` stays as written, touching, one space, or a run,
and a directive there stays between its whitespace: `A () ->> () B` is printed
as it is, `A   () ->> () B` keeps its three spaces, and `A()->>()B` is printed
`A() ->> ()B`, since some versions that count read the `()` as part of the name
next to it, with the whitespace (see
[Sequence messages with a central connection](./compatibility.md#sequence-messages-with-a-central-connection)
and
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).

[fixture: arrow-spacing/parentheses-touching] [fixture:
arrow-spacing/parentheses-gap-run-kept] [fixture:
arrow-spacing/parentheses-gap-directive-kept]

mermaid.js reads the spellings of a `+` or `-` with and without the whitespace
as the same message, except for a `-` before a target that would read as an
arrow with it (below), so nothing else forces the form. The printer already
gives `A->>+B` the form `A ->> +B`, and ten of the twelve messages with a `+` or
`-` in the documentation of mermaid.js write the sign touching the target
(`->>+John`, `-->>-Alice`;
[the activation examples](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/sequenceDiagram.md#L413-L424)
and
[the nested ones](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/sequenceDiagram.md#L664-L669)).
The other two write the sign touching the arrow, `->>+ John`
([here](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/sequenceDiagram.md#L671-L672)),
and are printed with the sign on the target as well. The whitespace is dropped
only where a gap holds nothing but whitespace. A directive in the gap is placed
as under [Directives](#directives): `A%%{init: {}}%%->>B: v` is printed
`A %%{init: {}}%%->> B: v`, and `A ->> +%%{init: {}}%% B: v` is printed
`A ->> +%%{init: {}}%%B: v`, since the `+` touches the target.

[fixture: arrow-spacing/directive-beside-arrow] [fixture:
arrow-spacing/directive-beside-arrow-runs] [fixture:
arrow-spacing/touching-beside-directive]

A line break in the gap is joined as in
[Multi-line statements](#multi-line-statements), and the whitespace goes with
it; a comment line keeps the lines.

[fixture: arrow-spacing/touching-over-line-breaks-joined] [fixture:
arrow-spacing/touching-with-comment-line-kept]

A U+2028 or U+2029 in a gap on one line stays where it is, with the whitespace
beside it.

[test: U+2028 between a `+` and an id] [test: U+2029 between a `-` and an id]
[test: U+2028 between an id and `()`] [test: U+2029 between `()` and an id]
[test: U+2029 between an id of a note and the `,`] [test: U+2028 between the `,`
of a note and an id]

Statements separated by a `;` or by an empty line are printed the same way.

[fixture: arrow-spacing/touching-between-semicolons] [fixture:
arrow-spacing/touching-after-blank-lines]

A line with a `;` that the line rule of mermaid.js ignores follows
[Statements one per line](#statements-one-per-line): `A ->> + B: style:#x;` is
printed `A ->> +B: style:#x;`, while `A () ->> () B: style:#x;;` stays as
written.

[fixture: arrow-spacing/touching-with-ignored-semicolon]

The arrow is printed as written.

[fixture: arrow-spacing/arrows-kept]

The whitespace before `<<->>` and `<<-->>` stays as written, since a version
that counts has no such arrow and reads the `<<` as part of the name before it:
`A<<->>B` is printed `A<<->> B`, and `A <<->> B` and `A   <<->> B` are printed
as they are, and so is a message with a `()` before the arrow, `A ()   <<->> B`,
since the name runs from the id to the `<<` (see
[Sequence messages with a central connection](./compatibility.md#sequence-messages-with-a-central-connection)
and
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).

[fixture: arrow-spacing/bidirectional-arrow-gap-before-kept] [fixture:
arrow-spacing/bidirectional-arrow-gap-run-kept] [fixture:
arrow-spacing/parentheses-then-bidirectional-arrow-gap-kept]

The `-` keeps its space before a target that would read as an arrow with it:
`-x` and `-X`, since the lexer ignores case, `-|\`, and `-|/` are arrows, so
`A ->> - x: b` stays and `A ->> -x: b` is rejected. Ids such as `x`, `X`,
`Xavier`, and `|\y` are the targets in question. A `+` and a `()` are never the
start of an arrow, and a target that does not start so touches the `-`.

[fixture: arrow-spacing/minus-before-arrow-like-target-spaced] [corpus fixture:
sequence/lex-minus-space-destination-x]

Input
([arrow-spacing/spaced-input.mmd](../tests/fixtures/sequence/arrow-spacing/spaced-input.mmd)):

```mmd
sequenceDiagram
Alice->>Bob: hi
Bob-->>+Alice: x
Alice-xBob: y
Alice()->>Bob: z
Alice->>()Bob: w
Alice Smith->>Bob: v
Bob  -)   Alice: u
```

Output
([arrow-spacing/spaced-output.mmd](../tests/fixtures/sequence/arrow-spacing/spaced-output.mmd)):

```mmd
sequenceDiagram
  Alice ->> Bob: hi
  Bob -->> +Alice: x
  Alice -x Bob: y
  Alice() ->> Bob: z
  Alice ->> ()Bob: w
  Alice Smith ->> Bob: v
  Bob -) Alice: u
```

A message whose source is an id that whitespace after it would make another unit
keeps its arrow touching on both sides, unless a `()` follows the id:
`1() ->> B` and `title() ->> B` are spaced, since the `()` ends the id.

[fixture: arrow-spacing/central-connection-after-number-or-title]

Two rules of the lexer need whitespace after what they read (the specification's
[The statement context](../../spec/docs/diagrams/sequence.md#the-statement-context)):
a number, one or more digits, optionally with `.` and one or two digits, or `.`
and one or two digits, which must be followed by whitespace or `%%`; and
`title`, in any case, followed by one whitespace character. So `1 ->> 2: x` is
rejected, and `title ->> B: x` is a title, while `1->>2: x` and `title->>B: x`
are messages. Ids such as `1a`, `1.234`, or `titles` are spaced as any other.

[fixture: arrow-spacing/touching-before-read-otherwise-kept] [corpus fixture:
sequence/lex-number-as-id] [corpus fixture: sequence/lex-number-before-space]
[fixture: arrow-spacing/number-and-title-forms-kept] [fixture:
arrow-spacing/near-misses-spaced]

Input
([arrow-spacing/touching-before-read-otherwise-kept-input.mmd](../tests/fixtures/sequence/arrow-spacing/touching-before-read-otherwise-kept-input.mmd)):

```mmd
sequenceDiagram
1->>2: x
2.5-->>1: y
title->>B: z
TITLE->>+B: w
1a->>B: v
```

Output
([arrow-spacing/touching-before-read-otherwise-kept-output.mmd](../tests/fixtures/sequence/arrow-spacing/touching-before-read-otherwise-kept-output.mmd)):

```mmd
sequenceDiagram
  1->>2: x
  2.5-->>1: y
  title->>B: z
  TITLE->>+B: w
  1a ->> B: v
```

### Colons

The `:` before the text of a message, a note, and a `links`, `link`,
`properties`, or `details` statement, and the `:` after `accTitle` and
`accDescr`, touch what comes before them and have one space after them, as the
documentation of mermaid.js writes a sequence diagram (of its messages with a
space after the colon, 107 have no space before it and none has one, and so do
the 8 notes and the 2 `links`; counted as under
[the examples that decide the whitespace before a colon](./compatibility.md#the-examples-that-decide-the-whitespace-before-a-colon)),
also next to a directive, which is placed as under [Directives](#directives).

[fixture: colons/spaced] [fixture: colons/other-statements-spaced] [fixture:
colons/directive-around-colon]

mermaid.js reads the text without the whitespace at its ends. When the text is
empty, nothing follows the `:`, except that one whitespace character stays, the
first one as written, where spaces and tabs only followed the `:` up to the end
of the line or to a `;` that the printer drops: `A->>B: ` is a message with an
empty text, while some versions that count reject `A->>B:` (their text rule
needs a character at least, and that of the later versions does not), and so
they reject a note and a `links`, `link`, `properties`, or `details` statement
the same way (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
Parsed in Chromium, the text without that character was rejected by some of the
versions that count and read by the others.

[fixture: colons/spaced] [fixture: colons/empty-text] [fixture:
colons/whitespace-only-text] [fixture: colons/semicolon-after-whitespace-kept]

A `;` that the line rule ignores before that whitespace is removed before the
whitespace is recognized. Where it stands directly after the `:`, the line stays
as written so that the ignored `;` and the whitespace after it stay together.

[fixture: colons/ignored-semicolon-before-empty-text-whitespace]

The whitespace character that stays is lost at the end of the last line of a
code block in Markdown, where Prettier removes it whatever the plugin prints
(see [Markdown code blocks](./compatibility.md#markdown-code-blocks)); `mmdfmt`
keeps it.

Where a directive or a whitespace character other than a space and a tab (a
no-break space, an ideographic space, a byte order mark, U+2028, U+2029) follows
the `:` directly, with whitespace in the place of the text, the line is printed
as written, as the line of a task of a [Gantt chart](./gantt.md#task-data) or a
[user journey](./journey.md#task-data) is. A version that counts takes a
whitespace character of any kind for the character that it needs after the `:`,
and removes a directive before it reads the line, so the whitespace after a
directive is that character. The printer drops whitespace at the end of a line
and prints another whitespace character as a space, so it would leave `A->>B:`,
which such a version rejects: `A->>B:%%{init: {}}%%` followed by two spaces is
accepted by every version that counts, and the text without the spaces is
rejected by some of them. A space or a tab right after the `:` is the character
that such a version needs, so the line is printed as usual and the rest is left
out: `A->>B: %%{init: {}}%%` followed by two spaces is printed
`A ->> B: %%{init: {}}%%`.

[fixture: colons/directive-then-whitespace-kept] [test: U+00A0 as the entire
text of a message] [test: U+3000 as the entire text of a note] [test: U+FEFF as
the entire text of a `links` statement] [test: U+2029 as the entire text of a
`link` statement] [test: a space and U+2028 as the entire text of a message]
[test: U+00A0 as the entire text of a message, with a `;` after it] [test:
U+00A0 as the entire text of a message in a block]

A line break after the `:` of `accTitle` is whitespace for mermaid.js, so the
next line is its text: an `accTitle:` with no text cannot stand before another
statement.

[fixture: colons/acc-title-colon-line-break]

Input
([colons/spaced-input.mmd](../tests/fixtures/sequence/colons/spaced-input.mmd)):

```mmd
sequenceDiagram
A->>B:x
A->>B : y
A->>B:
note over A:n
links A:{"a": "b"}
accTitle:t
A->>B::nowrap:z
```

Output
([colons/spaced-output.mmd](../tests/fixtures/sequence/colons/spaced-output.mmd)):

```mmd
sequenceDiagram
  A ->> B: x
  A ->> B: y
  A ->> B:
  Note over A: n
  links A: {"a": "b"}
  accTitle: t
  A ->> B: :nowrap: z
```

### Title

`title` and `title:` are followed by one space, and the rest of the line is kept
as written, except for the whitespace at its start and at its end:
`title   My diagram  ` is printed `title My diagram`, and a run of spaces and
tabs inside the text is printed as one space too. The `accDescr` follows, and
the `accTitle` stays as written, since the browser shows it as a tooltip (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)).

[fixture: title/accessibility-runs-collapsed] [fixture:
title/text-padding-dropped] [fixture: title/text-padding-dropped-colon]

A title of spaces and tabs only stays as written. At the end of the text,
`title` followed by two spaces, a tab, and a space stays, since every version of
mermaid.js that counts rejects a line of `title` alone (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).

[fixture: title/title-blank-kept]

A directive between the keyword and the one whitespace character after it stays
against the keyword: `title%%{init: {}}%% U` and `title:%%{init: {}}%% V` are
not changed. A directive after that character is part of the text, and the
whitespace at the start of the text, around the directive too, is left out:
`title %%{init: {}}%% T` is printed `title %%{init: {}}%%T`.

[fixture: title/directive-after-keyword-kept]

mermaid.js reads one whitespace character after the keyword, which may be a line
break, and keeps everything after it in the title, the whitespace at its start
and at its end included, and draws the title without the whitespace at its start
and at its end (see
[Texts after a keyword that are drawn the same](./compatibility.md#texts-after-a-keyword-that-are-drawn-the-same)).
So `title`, a line break, and `A->>B: x` is printed as `title A->>B: x`, which
shows that the next line is the title: mermaid.js reads it so.

[fixture: title/separator] [corpus fixture: sequence/lex-title-line-break]
[corpus fixture: sequence/db-title-next-line-indented] [fixture:
title/tab-and-colon-line-break] [fixture: title/line-break-indented]

The whitespace at the end of a title is left out, also where a `;` follows it. A
`;` that the line rule ignores, because a trigger stands in another statement of
the line, is no text of the title either, with the whitespace after it:
`accDescr {style:#x} title x;` followed by two spaces is printed
`accDescr: style:#x` and `title x`, as it is without the whitespace. It stays
where the line holds another `;` of its own, such as the one of an entity
(`#35;`) or one before it: the statements stay on their line, and without this
`;` the line rule would ignore the other one. `A->>B: style:#x;; title x;`
followed by two spaces is printed `A ->> B: style:#x;; title x;`.

[fixture: title/trailing-whitespace-dropped] [fixture:
title/semicolon-after-whitespace-dropped] [fixture:
title/ignored-semicolon-after-whitespace-dropped-trigger-in-other-statement]
[fixture:
title/colon-ignored-semicolon-after-whitespace-dropped-trigger-in-other-statement]
[fixture:
title/ignored-semicolon-after-whitespace-kept-with-an-entity-in-the-line]
[fixture:
title/ignored-semicolon-after-whitespace-kept-after-another-semicolon-of-the-line]

A `;` that the line rule ignores between the keyword and a text on the next line
stays, on the line of the trigger of the rule, which is part of the line that
stays together: `participant A@{"style":"x:#y"};title;` and `T` are printed
`participant A@{"style":"x:#y"};title; T`, the text joined to the keyword (see
[A `;` that the line rule ignores before the value of its statement](./compatibility.md#a--that-the-line-rule-ignores-before-the-value-of-its-statement)).

[fixture: title/ignored-semicolon-before-text-on-next-line-kept] [fixture:
title/ignored-semicolon-before-text-on-kept-line-kept]

It is at the end of a line, so the example is written as strings, in which `\n`
is a line break: `"sequenceDiagram\ntitle Kept   \nA->>B: x\n"` is printed as
`"sequenceDiagram\n  title Kept\n  A ->> B: x\n"`.

Input
([title/separator-input.mmd](../tests/fixtures/sequence/title/separator-input.mmd)):

```mmd
sequenceDiagram
title
A->>B: x
title  Two spaces
title:	Tab
```

Output
([title/separator-output.mmd](../tests/fixtures/sequence/title/separator-output.mmd)):

```mmd
sequenceDiagram
  title A->>B: x
  title Two spaces
  title: Tab
```

A title with a comment line between its keyword and text keeps its complete
source, including the text's indentation: that whitespace is part of the Db
title (see [Multi-line statements](#multi-line-statements)). The comment line is
removed before mermaid.js reads the text, so the line after it is the title;
printed after the one space, the comment would stand on the line of the keyword,
and the next line would be read as a statement.

[fixture: title/comment-line-kept] [fixture: title/colon-comment-line-kept]

Input
([title/comment-line-kept-input.mmd](../tests/fixtures/sequence/title/comment-line-kept-input.mmd)):

```mmd
sequenceDiagram
title
%% a comment line
  The title
A->>B: x
```

Output
([title/comment-line-kept-output.mmd](../tests/fixtures/sequence/title/comment-line-kept-output.mmd)):

```mmd
sequenceDiagram
  title
%% a comment line
  The title
  A ->> B: x
```

### Comments

A comment on a line of its own, `%%`, `#`, or `%`, stands at the level of the
statements around it, and its text is kept as written.

[fixture: comments/kept] [corpus fixture:
sequence/lex-single-percent-comment-line] [fixture: comments/percent-line-kept]
[fixture: comments/block-edges-kept] [fixture: comments/text-whitespace-kept]
[fixture: comments/line-ending-ignored-semicolon-trailing-whitespace-kept]

A comment after a statement stays on its line, and whether whitespace is written
before its mark is kept: rule 1 names no mark before a comment, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides, as [requirement](./requirement.md#comments), [c4](./c4.md#comments),
and [journey](./journey.md#comments) keep a comment that touches, where no other
rule keeps the whitespace as written; each of them names those cases in its own
sections. The whitespace matters in this diagram in every version of mermaid.js
that counts, as `autonumber 5%% c` shows (see
[A comment right after a character](./compatibility.md#a-comment-right-after-a-character)).
A run of whitespace before the mark is printed as one space (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)),
except where another rule keeps the whitespace as written, as after an id, after
the data block of a participant that a version reads as a part of its name (see
[Whitespace between tokens](#whitespace-between-tokens)), and after the value of
an `accTitle`, where the whitespace belongs to the id, to the block, or to the
value.

[fixture: comments/mark-run-one-space] [fixture:
comments/mark-touching-kept-after-each-statement] [fixture:
comments/mark-run-one-space-after-each-statement] [fixture:
comments/mark-run-kept-after-an-id-and-acctitle] [fixture:
whitespace-between-tokens/data-block-name-comment-gap-kept] [fixture:
whitespace-between-tokens/data-block-name-created-comment-gap-kept] [fixture:
comments/kept] [corpus fixture: sequence/lex-percent-comment-takes-number]
[fixture: comments/mark-whitespace-kept] [fixture:
comments/after-last-statement-without-line-break] [fixture:
comments/block-end-comment-without-line-break]

Input
([comments/kept-input.mmd](../tests/fixtures/sequence/comments/kept-input.mmd)):

```mmd
sequenceDiagram
%% a comment line
# a hash comment
A->>B: x # after a text
autonumber 5%% touching
loop x
    %% inside
A->>B: y
end
```

Output
([comments/kept-output.mmd](../tests/fixtures/sequence/comments/kept-output.mmd)):

```mmd
sequenceDiagram
  %% a comment line
  # a hash comment
  A ->> B: x # after a text
  autonumber 5%% touching
  loop x
    %% inside
    A ->> B: y
  end
```

A `;` that stands right after a comment on its line is kept: it is the last `;`
of a line that the line rule of mermaid.js ignores, and the comment ends before
it.

[fixture: comments/semicolon-after-comment-kept] [corpus fixture:
sequence/tokens-comment-then-ignored-semicolon] [corpus fixture:
sequence/tokens-loop-comment-then-ignored-semicolon] [fixture:
comments/semicolon-after-percent-comment-kept]

Where whitespace and then more text follow that `;` in the source, the `;` lies
inside the comment, and the comment is printed with it.

[fixture: comments/semicolon-inside-comment-kept]

Dropping it in one case and keeping it in the other would make a second
formatting differ from the first. Where only whitespace follows the `;` up to
the end of the line, the whitespace is not printed, and the line is decided as
it is without the whitespace: the `;` is then the last `;` of the line, which
does not keep the statements of the line together, so `accDescr {}` and a
message `A->>B: x #style:#x;` followed by a space are printed on two lines, as
they are without the space, and not on one line at the first formatting and on
two at the second. A comment on a line of its own keeps the whitespace after its
`;` with the rest of its text.

[fixture:
statements-one-per-line/message-comment-ignored-semicolon-trailing-whitespace]
[fixture:
statements-one-per-line/loop-comment-ignored-semicolon-trailing-whitespace]
[fixture:
statements-one-per-line/autonumber-comment-ignored-semicolon-trailing-whitespace]
[test: an ignored `;` at a message comment end before U+2029 and a directive]
[test: an ignored `;` at an autonumber comment end before U+2029 and a
directive]

A `;` that the line rule does not ignore stays in the comment, and the line
stays together.

[fixture:
statements-one-per-line/comment-nonignored-semicolon-trailing-whitespace]

Where the trigger of the line rule stands in another statement of the line, as
`style:#x` does in `accDescr {style:#x} A->>B: x #a;`, the `;` is ignored only
while the statements stand on one line: on a line of its own, the message has no
trigger, and mermaid.js reads `#a;` as an entity of its text. So the line stays
together, with the `;`, whether or not whitespace follows it, and the same holds
for a `loop` header.

[fixture:
statements-one-per-line/message-comment-ignored-semicolon-trigger-in-other-statement]
[fixture:
statements-one-per-line/loop-comment-ignored-semicolon-trigger-in-other-statement]

Where the reading does not change on a line of its own, the line is split, with
or without whitespace after the `;`, and the message is printed as it is printed
on a line of its own, so that a second formatting prints it again. That is so
where the comment ends in `#;`, `# a;`, or another form that is no entity, where
the `;` follows a `style:#x` of the comment itself, and where the comment starts
with `%%`, whose `#a;` is a character of the comment.

[fixture:
statements-one-per-line/message-comment-empty-entity-trigger-in-other-statement]
[fixture:
statements-one-per-line/message-comment-space-trigger-in-other-statement]
[fixture:
statements-one-per-line/message-comment-own-trigger-trailing-whitespace]
[fixture:
statements-one-per-line/autonumber-percent-comment-entity-trigger-in-other-statement]

The name of the entity is read as mermaid.js reads it, without a directive in
it: `x #a%%{init: {}}%%;` ends in the entity `#a;`, and `x #a%%{init: {}}%%b;`
in `#ab;`, so those lines stay together, while `x #%%{init: {}}%%;` ends in
`#;`, which is no entity, and the line is split. The line of a divider of a
block (`else`, `and`, `option`) and the line of the `end` that closes a block
are decided in the same way, since each of them stands on a line of its own once
the statements are printed.

[fixture:
statements-one-per-line/message-comment-entity-split-by-directive-trigger-in-other-statement]
[fixture:
statements-one-per-line/message-comment-entity-name-split-in-two-by-directive-trigger-in-other-statement]
[fixture:
statements-one-per-line/message-comment-directive-after-hash-trigger-in-other-statement]
[fixture:
statements-one-per-line/par-and-comment-ignored-semicolon-trigger-in-other-statement]
[fixture:
statements-one-per-line/alt-else-comment-ignored-semicolon-trigger-in-other-statement]
[fixture:
statements-one-per-line/critical-option-comment-ignored-semicolon-trigger-in-other-statement]
[fixture:
statements-one-per-line/end-comment-ignored-semicolon-trigger-in-other-statement]
[fixture:
statements-one-per-line/end-comment-empty-entity-trigger-in-other-statement]

The `end` that closes a block is decided as the line of any other statement is.
Where the comment after it is read the same on a line of its own, because it
ends in `#;`, `# a;`, or another form that is no entity, or starts with `%%`,
the `end` and its comment are printed on a line of their own, with or without
whitespace after the `;`: `A->>B: style:#x;; end #;` is printed on two lines, as
it is with two spaces or a tab after the `;`. Where the comment ends in an
entity, as `end #a;` does, the `end` stays on the line of the text before it,
also where whitespace follows the `;`, and also where a directive splits the
name (`end #a%%{init: {}}%%;`). An `accDescr {…}` block before the `end` is
printed as `accDescr: …` where the `end` goes to a line of its own, also in a
block that stands before the `else` or `and` of the block around it, and it
stays as written where the `end` stays on its line.
`accDescr {style:#x} end #a;` with two trailing spaces at the end of the text
stays on one line, since every version of mermaid.js that counts rejects
`accDescr: style:#x` followed by `end #a;` on its own line (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).

[fixture:
statements-one-per-line/end-comment-ignored-semicolon-no-gaps-in-style-rule-stretch-without-whitespace]
[fixture:
statements-one-per-line/end-comment-ignored-semicolon-no-gaps-in-style-rule-stretch]
[fixture:
statements-one-per-line/end-comment-ignored-semicolon-no-gaps-in-style-rule-stretch-tab]
[fixture:
statements-one-per-line/end-percent-comment-ignored-semicolon-after-gaps-before-the-stretch-ends-without-whitespace]
[fixture:
statements-one-per-line/end-percent-comment-ignored-semicolon-after-gaps-before-the-stretch-ends]
[fixture:
statements-one-per-line/end-percent-comment-ignored-semicolon-after-gaps-before-the-stretch-ends-tab]
[fixture:
statements-one-per-line/end-comment-ignored-semicolon-trigger-in-other-statement-trailing-whitespace]
[fixture:
statements-one-per-line/end-comment-ignored-semicolon-trigger-in-other-statement-trailing-tab]
[fixture:
statements-one-per-line/end-comment-entity-split-by-directive-trigger-in-other-statement-trailing-whitespace]
[fixture:
statements-one-per-line/end-comment-empty-entity-trigger-in-other-statement-before-a-divider]
[fixture:
statements-one-per-line/end-comment-ignored-semicolon-trigger-in-other-statement-before-a-divider]
[fixture:
statements-one-per-line/end-comment-own-trigger-trailing-whitespace-before-a-divider]

This also holds when `%%{init: {}}%%` follows an entity-shaped end of a `#`
comment, such as `end #12;`, or U+2028 follows it before an `and` divider;
without an entity, `end #; %%{init: {}}%%` moves to its own line as usual. At
the end of the text, `accDescr {style:#x} end #12; %%{init: {}}%%` stays on one
line, since every version of mermaid.js that counts rejects `accDescr: style:#x`
followed by `end #12; %%{init: {}}%%` on its own line (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).

[fixture: statements-one-per-line/end-comment-entity-before-directive] [fixture:
statements-one-per-line/end-comment-no-entity-before-directive] [test: an
ignored entity semicolon before U+2028 keeps end with its description block
before and]

When a directive follows the `;`, an entity later in the comment, as in
`end # note #12; %%{init: {}}%%`, leaves `end` on a line of its own: the initial
`#` still starts the comment there.

[fixture: statements-one-per-line/end-comment-internal-entity-before-directive]

The `end` also stays on the line of the text before it, with its comment, for
another reason: that text holds whitespace in the stretch that the line rule of
mermaid.js may read, where the whitespace between a `:` and a later `#` keeps
whether it is there, but only while the `#` of the comment after the `end`
stands on the line. With the `end` and the comment on a line of their own, a
second formatting would print that whitespace as anywhere else. The line
`loop style:#x;; loop x; A->>B: body; end #;` stays on one line, with `A->>B` as
written, with or without whitespace after the `;`. This reason adds to the one
above, and neither makes the other unnecessary: an `end` whose comment ends in
an entity stays on the line also where the text before it holds no whitespace in
the stretch. Where neither reason holds, as where the comment holds no `#` that
ends the stretch (`%% a;`), the `end` and its comment are printed on a line of
their own.

[fixture:
statements-one-per-line/end-comment-ignored-semicolon-after-gaps-in-style-rule-stretch-without-whitespace]
[fixture:
statements-one-per-line/end-comment-ignored-semicolon-after-gaps-in-style-rule-stretch]
[fixture:
statements-one-per-line/end-comment-ignored-semicolon-after-gaps-in-style-rule-stretch-tab]
[fixture:
statements-one-per-line/end-comment-ignored-semicolon-after-gaps-in-style-rule-stretch-body-line]
[fixture:
statements-one-per-line/box-end-comment-in-style-rule-stretch-trigger-in-other-statement]

The `;` that the line rule ignores after an `end` that goes to a line of its own
is dropped, as it is on a line of its own, whatever the lines before it hold:
`A->>B: style:#x;; end;` is printed `A ->> B: style:#x;;` and `end`. A line that
stays together because of a `;` in the comment after the `end`, where the text
before the `end` holds only a `;` that separates statements, keeps the `end`:
`A->>B: x;end #;` is printed `A ->> B: x; end #;`, since without the comment the
`;` after `x` would be dropped by a second formatting, and the statements of the
line printed on lines of their own.

[fixture:
statements-one-per-line/end-semicolon-dropped-where-the-end-goes-to-its-own-line]
[fixture:
statements-one-per-line/end-space-semicolon-dropped-where-the-end-goes-to-its-own-line]
[fixture:
statements-one-per-line/end-kept-with-the-semicolon-of-its-comment-after-a-separator-semicolon]
[fixture:
statements-one-per-line/end-kept-with-the-semicolon-of-its-comment-after-two-statements]

A divider on the next line (`else`, `and`, `option`) is a statement of its own,
as any statement is: it holds no value of the line before it, so the `;` that
ends that line is the last of it. `end #a;` followed by whitespace and `else` on
the next line stays on the line of its trigger, as it does at the end of the
text. After `accDescr {style:#x}`, `end #a;` followed by a space, a tab, and an
`else` line stays on the same line as the block, since every version of
mermaid.js that counts rejects `accDescr: style:#x` followed by `end #a;` on its
own line before `else` (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).

[fixture:
statements-one-per-line/end-comment-ignored-semicolon-trailing-whitespace-before-a-divider]

An `end` or a divider (`else`, `and`, `option`) that touches the `}` of a
description block or the `;` before it is decided in the same way as one that
whitespace parts from them: `accDescr {style:#x}end #a;` stays on one line, with
the block as written, since the form with the colon would take the `end` into
the text, and `accDescr {style: x}end #;`, whose comment is read the same on a
line of its own, is printed `accDescr: style: x` and `end #;`. So is a divider:
`accDescr {style:#x}else x#a;` stays on one line. In
`accDescr {style:#x}else x#a;`, the divider stays on that line, since every
version of mermaid.js that counts draws the divider text differently when
`accDescr: style:#x` is followed by `else x#a;` on its own line (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).

[fixture:
statements-one-per-line/end-touching-description-block-without-trigger]
[fixture:
statements-one-per-line/end-touching-description-block-with-trigger-entity]
[fixture:
statements-one-per-line/else-touching-description-block-with-trigger-entity]
[fixture: statements-one-per-line/end-touching-semicolon-comment-not-entity]
[fixture: statements-one-per-line/end-touching-semicolon-comment-entity]

The line of every statement is decided by how mermaid.js reads the comment, not
by what the statement draws. `details A: https://example.com #a;`,
`links A: {…} #a;`, and `properties A: {…} #a;` stay on one line with the
trigger in the same way as a message does, although the entity shows in no
figure, and so does a `participant` with a data block and `as`, whose name the
entity changes (`participant C@{ "type": "boundary" } as x #a%%{init: {}}%%;`).

[fixture:
statements-one-per-line/details-comment-entity-split-by-directive-trigger-in-other-statement]
[fixture:
statements-one-per-line/links-comment-entity-trigger-in-other-statement]
[fixture:
statements-one-per-line/properties-comment-entity-trigger-in-other-statement]
[fixture:
statements-one-per-line/participant-data-as-comment-entity-split-by-directive-trigger-in-other-statement]

Input
([comments/semicolon-after-comment-kept-input.mmd](../tests/fixtures/sequence/comments/semicolon-after-comment-kept-input.mmd)):

```mmd
sequenceDiagram
A->>B: x #style:#x;
loop style:#x;
A->>B: y
end
```

Output
([comments/semicolon-after-comment-kept-output.mmd](../tests/fixtures/sequence/comments/semicolon-after-comment-kept-output.mmd)):

```mmd
sequenceDiagram
  A ->> B: x #style:#x;
  loop style:#x;
    A ->> B: y
  end
```

### Line separators

U+2028 and U+2029 are whitespace, but some readings of mermaid.js depend on
them, so the formatter keeps them where they matter. The characters are
invisible, so the example is written as strings, in which `\u2028` is U+2028 and
`\n` is a line break: `"sequenceDiagram\nbox red\u2028\nparticipant A\nend\n"`
is printed as `"sequenceDiagram\n  box red\u2028\n    participant A\n  end\n"`,
with the character kept at the end of the text of the `box`. The tests write the
characters as escapes too (see
[tests/line-separators.test.ts](../tests/line-separators.test.ts)).

- At the end of the text of a `box`, after the whitespace that may stand before
  them. A box whose text holds such a character has the fill `transparent` in
  the Db of 12.3.0, and without it `box red` has the fill `red`; the fill of the
  drawing differs in 10.9.8, 11.7.0, 11.17.2, 12.0.0, and 12.3.0. Rule 1 names
  no mark for the end of a text of a `box`, so
  [rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
  decides, as [journey](./journey.md#line-separators) at the end of a title, and
  [timeline](./timeline.md#line-separators) at the end of a title and of the
  last event of a line, keep U+2028 and U+2029 as characters of the text and
  leave out the spaces after one. The whitespace after the last of them is
  dropped. A block header other than a box, `loop x`, U+2028, and ` ;` for one,
  is trimmed by mermaid.js, and the character is dropped with the whitespace at
  the end of its text.

  [test: U+2028 at the end of the text of a box] [test: whitespace around U+2028
  at the end of the text of a box] [test: U+2029 at the end of the text of a
  box] [test: whitespace around U+2029 at the end of the text of a box]

- Between a comment and the comment line that follows it on the same line, and
  between the end of a statement or of a block header and such a comment line. A
  diagram comment goes on past such a comment line to the next line, so a line
  break in place of the character would turn the text after it into a statement.

  [corpus fixture: sequence/lex-hash-comment-across-comment-line]

  mermaid.js removes the comment line, so the line after it continues the line
  before it: `A->>B:   x`, U+2028, `%% c`, and `C->>D: y` is one line, whose
  message text goes on into the next line. The statement or the header, the
  comment line, and the text after it are printed as written, without
  indentation and without formatting the whitespace between them: the tree lists
  the comments, and the printer reads them as one line (see
  [A comment line after U+2028 or U+2029](./compatibility.md#a-comment-line-after-u2028-or-u2029)).

  [test: a `#` comment after U+2028, which joins no lines] [test: a `%%` comment
  line after U+2028, which joins the next line] [test: a `%%` comment line after
  U+2028 at the end of a block header] [test: a `%%` comment line after U+2028
  at the end of a participant] [test: U+2029 after a comment that a comment line
  follows] [test: U+2028 after a `%%` comment that a comment line follows]
  [test: U+2029 after a `%` comment that a comment line follows] [test: a `#`
  comment and a comment line after U+2028 inside a message text]

- Right after a directive that is not closed. The text of such a directive stops
  before the character, which is no whitespace to it: with the character printed
  as a space or a line break, the directive would reach the rest of the text.
  This holds in every diagram type.

  [test: U+2028 after a directive that is not closed] [test: U+2029 after a
  directive that is not closed] [test: a `;` after U+2029 after a directive that
  is not closed] [test: a standalone open directive before U+2028 and a
  semicolon] [test: a standalone open directive before U+2029 and a semicolon]

- As the whitespace character that follows `title`: `title`, U+2028, and ` ;`
  stays as written, with the `;`.

  [test: U+2028 as the whitespace character after `title`, with a `;` after it]
  [test: U+2029 as the whitespace character after `title`]

- At the end of a title, where they are characters of the text and no spaces or
  tabs: the spaces after one are left out with the other whitespace at the end
  of the title, and the spaces before it stay.

  [test: U+2028 and spaces at the end of a title]

- After the `end` of a block, which is not kept: `end`, U+2028, and a line break
  is printed as `end`, as mermaid.js reads the character there as whitespace.

  [test: U+2028 after the `end` of a block of a sequence diagram] [test: U+2029
  and whitespace around it after the last `end` of a sequence diagram]

- Between two parts of a statement, in every diagram type: the whitespace
  between them stays as written when it holds a U+2028 or U+2029, since the
  character is not whitespace to every rule of mermaid.js (`class A`, U+2028,
  and ` direction LR` is one name, while `class A`, a line break, and
  ` direction LR` is a statement and a direction).

  [test: U+2028 between an id and an arrow] [test: U+2029 between an arrow and
  an id] [test: U+2028 between an id and `as`]

- On a line that holds a `;` that the line rule ignores and, after it, a U+2028
  or U+2029: the line rule reads the text up to the character as the line, so
  the line is printed as written. A `;` inside a diagram comment is part of the
  comment, which is kept as written, and the rest of the line is formatted. A
  `;` on the next line, after the line break that follows the character, stays
  as written too: `participant Z@{ "style": "x:#y" };`, U+2028, a line break,
  and `;`, followed by a statement, is accepted by mermaid.js, while the same
  text without the second `;` is rejected.

  [test: a `;` after an ignored `;` and U+2029, which the line rule reads as the
  end of its line] [test: a `;` on the next line after an ignored `;` and
  U+2028, which the line rule reads as the end of its line] [test: statements
  after an ignored `;`, with a U+2029 later on the line]

- A `;` after a U+2028 or U+2029 that the printer keeps, such as the one at the
  end of the text of a `box`, a title, or a subgraph name. mermaid.js removes a
  comment line that starts right after U+2028 or U+2029 with the line breaks
  before it, so the `;` between them keeps the line break and a comment line
  after it from joining the next line: `box red`, U+2028, `;`, and a line `%% c`
  end the text of the box at the `;`.

  [corpus fixture: sequence/line-end-semicolons-2636cb4a] [corpus fixture:
  sequence/kept-semicolon-after-separator-05ce7bd7] [test: a `;` after U+2028 at
  the end of the text of a box] [test: a `;` after U+2028 at the end of a title]

A line that dropping a `;` would change the end of, or the `;` that the line
rule ignores in, is printed as written: a `;` after a directive that is not
closed, an ignored `;` next to another `;`, and one before a U+2028 or U+2029
(see [A line that a `;` ends](./compatibility.md#a-line-that-a--ends)).

[corpus fixture: sequence/ignored-semicolon-after-directive-06349fee] [corpus
fixture: sequence/ignored-semicolon-then-separator-line-15c6520f] [fixture:
statements-one-per-line/unclosed-directive-semicolon-kept] [fixture:
statements-one-per-line/ignored-semicolon-next-to-semicolon-kept]

### Directives

As in a flowchart: a directive on a line of its own stands at the level of the
statements around it, and a directive within a printed line is placed as in a
flowchart: the gap is printed as without the directive, and the directive stands
after its space and touches the unit that follows it.

[fixture: directives/kept] [fixture: directives/section-edges-kept] [fixture:
directives/whitespace-on-each-side] [fixture: directives/touching-kept]
[fixture: directives/block-lines-kept]

When formatting splits units that were on the same line, a directive in their
gap moves with the following unit. Keep its right-side contact or separation;
break its left contact.

[fixture: sequence/directives/split-directive-gap]

Input
([directives/kept-input.mmd](../tests/fixtures/sequence/directives/kept-input.mmd)):

```mmd
sequenceDiagram
%%{init: {}}%%
loop x
%%{init: {}}%%
A->>B: y %%{init: {}}%%
end
```

Output
([directives/kept-output.mmd](../tests/fixtures/sequence/directives/kept-output.mmd)):

```mmd
sequenceDiagram
  %%{init: {}}%%
  loop x
    %%{init: {}}%%
    A ->> B: y %%{init: {}}%%
  end
```

### Quotes

The printer neither adds nor removes quotes: sequence diagrams have no string,
and a quote is a character of the text. `participant A as "Alice"` has the
description `"Alice"`, with its quotes, and `participant B as Bob` has `Bob`;
`A->>B: "Hello"` is a message with the text `"Hello"`, and `B-->>A: Hello` one
with `Hello`; a note takes its quotes in the same way. Taking the quotes off
would change the text that mermaid.js draws.

[fixture: quotes/texts-as-written]

Input
([quotes/texts-as-written-input.mmd](../tests/fixtures/sequence/quotes/texts-as-written-input.mmd)):

```mmd
sequenceDiagram
participant A as "Alice"
participant B as Bob
A->>B: "Hello"
B-->>A: Hello
Note over A: "Quoted"
Note over A: Plain
```

Output
([quotes/texts-as-written-output.mmd](../tests/fixtures/sequence/quotes/texts-as-written-output.mmd)):

```mmd
sequenceDiagram
  participant A as "Alice"
  participant B as Bob
  A ->> B: "Hello"
  B -->> A: Hello
  Note over A: "Quoted"
  Note over A: Plain
```

### Frontmatter YAML

As in a flowchart: the YAML between the `---` lines is formatted with Prettier's
YAML formatter where that is safe (see
[Frontmatter YAML](./flowchart.md#frontmatter-yaml)).

[fixture: frontmatter-yaml/formatted] [fixture: frontmatter-yaml/malformed-kept]
[fixture: frontmatter-yaml/indented-delimiters-kept] [fixture:
frontmatter-yaml/delimiter-line-kept] [fixture:
frontmatter-yaml/closing-delimiter-whitespace-kept] [fixture:
frontmatter-yaml/html-tag-kept]

Input
([frontmatter-yaml/formatted-input.mmd](../tests/fixtures/sequence/frontmatter-yaml/formatted-input.mmd)):

```mmd
---
title:   T
---
sequenceDiagram
A->>B: x
```

Output
([frontmatter-yaml/formatted-output.mmd](../tests/fixtures/sequence/frontmatter-yaml/formatted-output.mmd)):

```mmd
---
title: T
---
sequenceDiagram
  A ->> B: x
```

### Multi-line statements

A statement written over several lines is printed on one line. A line break
inside a statement comes after whitespace, since a line break alone ends the
statement, and the lexer reads the whitespace and the line breaks after it as
whitespace (the specification's
[The statement context](../../spec/docs/diagrams/sequence.md#the-statement-context),
rule 2). So `Alice ->>`, a space, a line break, and `Bob: hi` is printed as
`Alice ->> Bob: hi`.

[fixture: multi-line-statements/joined] [fixture:
multi-line-statements/more-lines-joined]

Each line break of a statement is decided on its own. A line break next to a
comment or a directive stays, while structural continuations and intervening
trivia stand one level deeper, and the other line breaks of the statement are
joined: `autonumber`, a line break, `5 %%{init: {}}%%`, a line break, and `2` is
printed as `autonumber 5 %%{init: {}}%%`, a line break, and `2`. The whitespace
before the first line break of each gap is retained: it can make mermaid.js read
later lines as part of the same statement. Whitespace inside values stays
unchanged.

[fixture: multi-line-statements/breaks-decided-one-by-one] [fixture:
multi-line-statements/line-rule-first-hash-after-colon-kept] [fixture:
multi-line-statements/comment-inside-kept] [fixture:
multi-line-statements/autonumber-comment-continuation] [fixture:
multi-line-statements/autonumber-directive-continuation]

A title with trivia between its keyword and text keeps its complete source,
since its text includes indentation. Joining regions also stay as written. A
line break stays where joining it, with one space or with nothing, could change
which `;` the line rule ignores, and where a `;` decides the end of the last
line; any other line break is joined as usual, also in a statement that holds a
`;`.

[fixture: multi-line-statements/semicolon-joining-changes-kept]

A `;` alone does not prevent joining.

[fixture: multi-line-statements/semicolon-inside-joined] [fixture:
multi-line-statements/start-moves-to-own-line]

Description blocks instead follow [Multi-line values](#multi-line-values), which
align their body indentation.

The inputs have whitespace at the ends of lines, so the example is written as
strings, in which `\n` is a line break:
`"sequenceDiagram\nAlice ->> \nBob: hi\nautonumber \n  10 5\n"` is printed as
`"sequenceDiagram\n  Alice ->> Bob: hi\n  autonumber 10 5\n"` (the fixtures are
in the [folder](../tests/fixtures/sequence/multi-line-statements)).

### Multi-line values

The whitespace-only interior of a description block, including tabs, line breaks
and Unicode whitespace, prints `{}`: there is no text for interior whitespace to
surround. An already empty interior stays empty. The keyword and opening brace
have one space between them: `accDescr{  }` becomes `accDescr {}`.

[fixture: multi-line-values/empty-whitespace-interiors] [test: sequence Unicode
and tab interiors]

Blocks with comments or directives keep their contents and line breaks.

Blocks on one line follow
[A description block on one line](./compatibility.md#a-description-block-on-one-line).

[fixture: multi-line-values/block-text-on-one-line-padded]

Align the lines of an `accDescr { ... }` body one step inside its statement,
with a separate `}` at the statement's level, as in
[flowchart's top-level descriptions](./flowchart.md#multi-line-values). Mermaid
discards this indentation from the description.

[fixture: multi-line-values/description-and-data-indented] [fixture:
multi-line-values/accdescr-block-closing-brace-after-text] [fixture:
multi-line-values/accdescr-block-blank-and-comment-lines-kept] [fixture:
multi-line-values/data-block-in-block-indented]

A block without text, whose lines are only comment lines, holds no value: its
comment lines stand one level deeper than the `accDescr`, as comment lines
inside a statement do, and its `}` at the level of the `accDescr`.

[fixture: multi-line-values/accdescr-block-comment-only] [fixture:
multi-line-values/accdescr-block-without-text-kept]

A description block that the text ends, as in `accDescr {` with no `}` after it,
is accepted by mermaid.js (see
[The statement context](../../spec/docs/diagrams/sequence.md#the-statement-context)),
and its body lines stand one level inside the statement as in a closed block; no
`}` is added.

[fixture: multi-line-values/accdescr-block-unclosed-indented]

For participant and actor data blocks, apply
[Data blocks](./flowchart.md#data-blocks) only when exactly one body line holds
text. Move that line one level inside the statement and align a separate `}`
with the statement; a closer after text stays with that line. This applies at
the top level and inside `loop`, except with `useTabs`, where the statement is
printed as written (see [Data blocks](./flowchart.md#data-blocks)), unless the
statement is not at the depth of the first thing on its line: the header of a
`box` or a block, as in `box Aqua G; participant A@{ … }`, a section keyword, as
in `else z; participant P@{ … }`, or a statement inside the box or block before
an `end`, as in `participant B; end; participant A@{ … }`. The written
indentation is then that of that thing, and the statement is printed with the
usual indentation, the lines of its block moving with it. So is a statement on a
line that starts with anything else than the things listed under
[Data blocks](./flowchart.md#data-blocks), such as the rest of a directive that
runs over lines. A statement after an `end` that comes first is at the depth of
the line and is printed as written.

[fixture: multi-line-values/data-use-tabs-box-header-moved] [fixture:
multi-line-values/data-use-tabs-section-keyword-moved] [fixture:
multi-line-values/data-use-tabs-statement-before-end-moved] [fixture:
multi-line-values/data-use-tabs-directive-continuation-moved] [fixture:
multi-line-values/data-use-tabs-after-end-on-line] [fixture:
multi-line-values/data-zero-and-shallow] [fixture:
multi-line-values/data-deep-inline-closer] [fixture:
multi-line-values/data-block-in-block-indented] [fixture:
multi-line-values/data-tab-statement-space-body] [fixture:
multi-line-values/data-closing-deeper-kept] [fixture:
multi-line-values/data-closing-equal-depth]

Mermaid trims the whole data block: the first line loses its margin, while later
lines count from column zero. Thus two keys at column zero are accepted, but
indenting them can make the YAML fail; blocks with multiple text lines keep
their columns. The shared conditions also keep inline-opening blocks, directives
inside a block, kept lines and `tabWidth: 0` unchanged. They avoid changing the
first line's relative margin or a directive's text and preserve whole kept
lines.

[fixture: multi-line-values/data-multiple-lines-kept] [fixture:
multi-line-values/data-inline-and-directive-kept] [fixture:
multi-line-values/data-kept-body-line] [fixture:
multi-line-values/data-zero-width-kept]

Comments, directives, blank lines and empty description blocks around the data
keep their own rules. CRLF and CR follow `endOfLine`; Unicode separators inside
values remain characters.

[fixture: multi-line-values/data-surrounding-trivia] [test: data blocks:
sequence U+2028] [test: data blocks: sequence CR]

Input
([multi-line-values/description-and-data-indented-input.mmd](../tests/fixtures/sequence/multi-line-values/description-and-data-indented-input.mmd)):

```mmd
sequenceDiagram
loop x
accDescr {
  one
    two
      }
participant A@{
  "type": "queue"
}
end
```

Output
([multi-line-values/description-and-data-indented-output.mmd](../tests/fixtures/sequence/multi-line-values/description-and-data-indented-output.mmd)):

```mmd
sequenceDiagram
  loop x
    accDescr {
      one
      two
    }
    participant A@{
      "type": "queue"
    }
  end
```

Input
([multi-line-values/accdescr-block-comment-only-input.mmd](../tests/fixtures/sequence/multi-line-values/accdescr-block-comment-only-input.mmd)):

```mmd
sequenceDiagram
accDescr {
%% only a comment
      }
A->>B: x
```

Output
([multi-line-values/accdescr-block-comment-only-output.mmd](../tests/fixtures/sequence/multi-line-values/accdescr-block-comment-only-output.mmd)):

```mmd
sequenceDiagram
  accDescr {
    %% only a comment
  }
  A ->> B: x
```

## Kept as written

Apart from description-body and eligible data-block indentation under
[Multi-line values](#multi-line-values), the following text is kept as written
because changing it would change the diagram or the input would be rejected:

- the text of a value, with the whitespace inside it, and the text of a `box` as
  a whole, up to the last U+2028 or U+2029 that ends it;
- the whitespace after the one character that follows `title` or `title:`;
- the contents of the data block of a participant;
- that an arrow touches a source spelled as a number or `title`;
- a title with trivia between its keyword and text;
- a statement protected by a semicolon line or a joining comment region;
- the whitespace before the first line break of a gap containing trivia;
- whether whitespace is written before the mark of a comment after a statement,
  and a U+2028 or U+2029 between a comment and a comment line after it;
- the arrows.

Some text is kept as written by choice, because the Db is the same either way:
the case of the keywords that the table under
[Spellings that are drawn the same](./compatibility.md#spellings-that-are-drawn-the-same)
does not list. Whether there is whitespace before the mark of a comment, listed
above, is not a choice: rule 2 gives it (see [Comments](#comments)), and after
some statements, such as `autonumber 5`, it also decides what mermaid.js reads.
