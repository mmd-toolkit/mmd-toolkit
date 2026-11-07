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
that line. [fixture: indentation/blocks] [fixture: indentation/sections]
[fixture: indentation/other-blocks-kept] A level is what Prettier's `useTabs`
and `tabWidth` options say: two spaces by default. [fixture:
indentation/tab-width-4] [fixture: indentation/use-tabs] The indentation written
in the input is not kept. Whitespace at the start of a line is nothing to
mermaid.js, so the printer chooses the indentation from the structure alone, and
one rule per level prints the same text whatever the input was indented with.
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
dropped: mermaid.js reads a `;` as it reads a line break. [fixture:
statements-one-per-line/semicolons-dropped] A statement written on the line of
the header, or after `end` on its line, moves to a line of its own. [fixture:
statements-one-per-line/split] A line that holds a `;` that the line rule of
mermaid.js ignores keeps its statements and its `;`, as in a flowchart (see
[Statements one per line](./flowchart.md#statements-one-per-line)). [corpus
fixture: sequence/tokens-ignored-semicolon-in-participant-id] [corpus fixture:
sequence/tokens-ignored-semicolon-in-message-id] [fixture:
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
reads the same box. [fixture:
statements-one-per-line/empty-description-block-in-box] [fixture:
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
`actor` that ends with a data block and has no `as`, is kept. [fixture:
statements-one-per-line/autonumber-directive-kept] [fixture:
statements-one-per-line/data-block-directive-kept] [fixture:
statements-one-per-line/actor-data-block-directive-kept] [fixture:
statements-one-per-line/autonumber-two-directives-kept] The statements that
follow such a `;` on its line, and the `end` of a block, stand on lines of their
own: `autonumber %%{wrap}%%; A->>B: x; B->>A: y` is printed as
`autonumber %%{wrap}%%;`, `A ->> B: x`, and `B ->> A: y`. [fixture:
statements-one-per-line/autonumber-directive-semicolon-then-statements-split] A
statement written over several lines, such as `autonumber`, a line break, and
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
there). [fixture: statements-one-per-line/closed-directive-semicolon-dropped]

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
start and the end of a block are dropped. [fixture: blank-lines/collapsed]
[fixture: blank-lines/around-comments-and-directives] [fixture:
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
after a prefix or a keyword of a block, which stands after one space. [fixture:
whitespace-between-tokens/collapsed] [fixture:
whitespace-between-tokens/tabs-collapsed] A wrap prefix, `wrap:` or `nowrap:`,
is separated from its text by one space, also where they touched: `A->>B:wrap:x`
is printed `A ->> B: wrap: x`, and so is the text of a note or of the alias of a
participant. The text after the keyword of a block or a section (`loop`, `alt`,
`else`, `opt`, `par`, `and`, `critical`, `option`, `break`, `rect`, `box`)
stands after one space too: `loop$$x$$` is printed `loop $$x$$`, and
`par-:<>,;# comment` is printed `par -:<>,;# comment`. The whitespace is not in
the Db, so the form is a choice, and the documentation of mermaid.js writes a
space after every block keyword
([`loop Loop text`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/sequenceDiagram.md#L472),
[`alt Describing text`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/sequenceDiagram.md#L492)).
[fixture: whitespace-between-tokens/wrap-text-spaced] [fixture:
whitespace-between-tokens/block-text-touching-spaced] A directive in the gap is
placed as under [Directives](#directives), and a U+2028 or U+2029 stays where it
is. [fixture: whitespace-between-tokens/block-text-beside-directive] [test:
U+2028 between a block keyword and its text] [test: U+2029 between a wrap prefix
and its text] The `,` between the ids of a note over two participants touches
both ids, as in `note over A,B`: `note over A , B` is printed `note over A,B`.
Every spelling that mermaid.js accepts gives the same Db, so nothing forces the
form; the five notes over two participants in the documentation of mermaid.js
are all written `A,B`
([two](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/sequenceDiagram.md#L49-L77)
and
[three](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/sequenceDiagram.md#L445-L464)).
[fixture: whitespace-between-tokens/collapsed] [fixture:
whitespace-between-tokens/comma-touching] What stands in the gap beside the `,`
is treated as in [Arrow spacing](#arrow-spacing). Keywords keep the case in
which they are written (`PARTICIPANT A`, `Note LEFT OF A`). mermaid.js reads
them in any case and the Db is the same, so nothing forces the case; it is the
author's, and the printer does not rewrite it. [fixture:
whitespace-between-tokens/keyword-case-kept]

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
  note over A,C: n
  A ->> B: wrap: x
  A ->> B: wrap: y
```

Input
([whitespace-between-tokens/keyword-case-kept-input.mmd](../tests/fixtures/sequence/whitespace-between-tokens/keyword-case-kept-input.mmd)):

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
([whitespace-between-tokens/keyword-case-kept-output.mmd](../tests/fixtures/sequence/whitespace-between-tokens/keyword-case-kept-output.mmd)):

```mmd
sequenceDiagram
  PARTICIPANT A
  Note LEFT OF A: x
  participant B AS Bob
  LOOP x
    A ->> B: y
  END
```

The whitespace inside a value is part of the value, and is kept: in the text of
a message, a note, a block, a `box`, and a description after `as`, and in the
JSON of `links` and `properties`. [fixture:
whitespace-between-tokens/values-kept] [fixture:
whitespace-between-tokens/values-of-other-statements-kept] The text of a `box`
is kept as a whole: when its first word is no colour, mermaid.js takes the whole
text as the name of the box. [fixture: whitespace-between-tokens/values-kept]
[fixture: whitespace-between-tokens/box-text-kept] The data block of a
participant, `@{ ... }`, touches its id: mermaid.js reads the same diagram with
whitespace between them as without, so the whitespace is dropped, also a
no-break space, an ideographic space or a byte order mark. [test: no-break space
between the id of a participant and its data block] [test: byte order mark
between the id of a participant and its data block] [test: ideographic space
between the id of a participant and its data block] The data block may stand on
one line or on several, and `as` may follow it. [fixture:
whitespace-between-tokens/data-block-space-before-removed] [fixture:
whitespace-between-tokens/data-block-space-before-removed-alias] [fixture:
whitespace-between-tokens/data-block-multi-line-space-before-removed] [fixture:
whitespace-between-tokens/data-block-space-before-removed-between-statements] A
directive between the id and `@{` is placed as under [Directives](#directives),
touching both, as the gap has no space:
`participant A %%{init: {}}%% @{ "type": "queue" }` is printed
`participant A%%{init: {}}%%@{ "type": "queue" }`. [fixture:
whitespace-between-tokens/data-block-space-before-after-directive] Its contents
stay written except for the eligible margins in
[Multi-line values](#multi-line-values) and the spaces and tabs at the ends of a
block on one line, which become one space each, as in
[Data blocks](./flowchart.md#data-blocks): `participant A@{"type":"queue"}`
becomes `participant A@{ "type":"queue" }`. [fixture:
whitespace-between-tokens/data-block-padded] The block stays as written where
that rule says so. [fixture:
whitespace-between-tokens/data-block-space-only-padded] [fixture:
whitespace-between-tokens/data-block-directive-kept] [fixture:
whitespace-between-tokens/data-block-kept-line-kept] [test: data blocks:
sequence one line with U+2028 inside] [test: data blocks: sequence one line with
U+2029 inside] [test: data blocks: sequence one line with no-break spaces at the
ends] [fixture: whitespace-between-tokens/data-block-padded-zero-width]
[fixture: whitespace-between-tokens/data-block-surrounding-trivia] [fixture:
whitespace-between-tokens/data-block-and-ignored-line-kept] [fixture:
whitespace-between-tokens/actor-data-block-kept] A line that mermaid.js reads as
nothing, such as `)` alone, is kept and stands at the level of the statements
around it. [fixture: whitespace-between-tokens/data-block-and-ignored-line-kept]
[corpus fixture: sequence/lex-invalid-line-parenthesis] [fixture:
whitespace-between-tokens/ignored-line-in-block-kept]

Input
([whitespace-between-tokens/values-kept-input.mmd](../tests/fixtures/sequence/whitespace-between-tokens/values-kept-input.mmd)):

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
([whitespace-between-tokens/values-kept-output.mmd](../tests/fixtures/sequence/whitespace-between-tokens/values-kept-output.mmd)):

```mmd
sequenceDiagram
  A ->> B: x   y
  box Group   1
    participant C
  end
  links A: {"a":  "b"}
  loop every  minute
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
written in the gap and none where it was not. [fixture:
whitespace-between-tokens/ignored-semicolon-before-of-attached] [fixture:
whitespace-between-tokens/ignored-semicolon-before-of-spaced-after-kept]

### Arrow spacing

A message has one space before and after its arrow, as a flowchart link does:
`Alice->>Bob: hi` becomes `Alice ->> Bob: hi`. [fixture: arrow-spacing/spaced]
The `+`, `-`, or `()` after the arrow touches the target, and the `()` before
the arrow touches the source: `A ->> + B` is printed `A ->> +B`, and
`A () ->> () B` is printed `A() ->> ()B`. [fixture:
arrow-spacing/plus-and-minus-touching] [fixture:
arrow-spacing/parentheses-touching] mermaid.js reads the spellings with and
without the whitespace as the same message, except for a `-` before a target
that would read as an arrow with it (below), so nothing else forces the form.
The printer already gives `A->>+B` the form `A ->> +B`, and ten of the twelve
messages with a `+` or `-` in the documentation of mermaid.js write the sign
touching the target (`->>+John`, `-->>-Alice`;
[the activation examples](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/sequenceDiagram.md#L413-L424)
and
[the nested ones](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/sequenceDiagram.md#L664-L669)).
The other two write the sign touching the arrow, `->>+ John`
([here](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/sequenceDiagram.md#L671-L672)),
and are printed with the sign on the target as well. Its three messages with
`()` write it touching its id
([central connections](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/sequenceDiagram.md#L392-L394)).
The whitespace is dropped only where a gap holds nothing but whitespace. A
directive in the gap is placed as under [Directives](#directives):
`A%%{init: {}}%%->>B: v` is printed `A %%{init: {}}%%->> B: v`, and
`A ->> +%%{init: {}}%% B: v` is printed `A ->> +%%{init: {}}%%B: v`, since the
`+` touches the target. [fixture: arrow-spacing/directive-beside-arrow]
[fixture: arrow-spacing/directive-beside-arrow-runs] [fixture:
arrow-spacing/touching-beside-directive] A line break in the gap is joined as in
[Multi-line statements](#multi-line-statements), and the whitespace goes with
it; a comment line keeps the lines. [fixture:
arrow-spacing/touching-over-line-breaks-joined] [fixture:
arrow-spacing/touching-with-comment-line-kept] A U+2028 or U+2029 in a gap on
one line stays where it is, with the whitespace beside it. [test: U+2028 between
a `+` and an id] [test: U+2029 between a `-` and an id] [test: U+2028 between an
id and `()`] [test: U+2029 between `()` and an id] [test: U+2029 between an id
of a note and the `,`] [test: U+2028 between the `,` of a note and an id]
Statements separated by a `;` or by an empty line are printed the same way.
[fixture: arrow-spacing/touching-between-semicolons] [fixture:
arrow-spacing/touching-after-blank-lines] A line with a `;` that the line rule
of mermaid.js ignores follows
[Statements one per line](#statements-one-per-line): `A ->> + B: style:#x;` is
printed `A ->> +B: style:#x;`, while `A () ->> () B: style:#x;;` stays as
written. [fixture: arrow-spacing/touching-with-ignored-semicolon] The arrow is
printed as written. [fixture: arrow-spacing/arrows-kept]

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
[fixture: arrow-spacing/central-connection-after-number-or-title] Two rules of
the lexer need whitespace after what they read (the specification's
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
documentation of mermaid.js writes a sequence diagram, also next to a directive,
which is placed as under [Directives](#directives). [fixture: colons/spaced]
[fixture: colons/other-statements-spaced] [fixture:
colons/directive-around-colon] mermaid.js reads the text without the whitespace
at its ends. When the text is empty, nothing follows the `:`. [fixture:
colons/spaced] [fixture: colons/empty-text] A line break after the `:` of
`accTitle` is whitespace for mermaid.js, so the next line is its text: an
`accTitle:` with no text cannot stand before another statement. [fixture:
colons/acc-title-colon-line-break]

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
  note over A: n
  links A: {"a": "b"}
  accTitle: t
  A ->> B: :nowrap: z
```

### Title

`title` and `title:` are followed by one space, and the rest of the line is kept
as written, except for the whitespace at its start: `title   My diagram` is
printed `title My diagram`. [fixture: title/text-padding-dropped] [fixture:
title/text-padding-dropped-colon] A title of spaces and tabs only stays as
written. [fixture: title/title-blank-kept] A directive between the keyword and
the one whitespace character after it stays against the keyword:
`title%%{init: {}}%% U` and `title:%%{init: {}}%% V` are not changed. A
directive after that character is part of the text, and the whitespace at the
start of the text, around the directive too, is left out:
`title %%{init: {}}%% T` is printed `title %%{init: {}}%%T`. [fixture:
title/directive-after-keyword-kept] mermaid.js reads one whitespace character
after the keyword, which may be a line break, and keeps everything after it in
the title, the whitespace at its start and at its end included, and draws the
title without the whitespace at its start (see
[Texts after a keyword that are drawn the same](./compatibility.md#texts-after-a-keyword-that-are-drawn-the-same)).
So `title`, a line break, and `A->>B: x` is printed as `title A->>B: x`, which
shows that the next line is the title: mermaid.js reads it so. [fixture:
title/separator] [corpus fixture: sequence/lex-title-line-break] [corpus
fixture: sequence/db-title-next-line-indented] [fixture:
title/tab-and-colon-line-break] [fixture: title/line-break-indented] The
whitespace at the end of a title is kept. [fixture:
title/trailing-whitespace-kept] [fixture:
title/semicolon-after-whitespace-dropped] It is at the end of a line, so the
example is written as strings, in which `\n` is a line break:
`"sequenceDiagram\ntitle Kept   \nA->>B: x\n"` is printed as
`"sequenceDiagram\n  title Kept   \n  A ->> B: x\n"`, with the three spaces
after `Kept` kept (the fixture `trailing-whitespace-kept` is in the
[folder](../tests/fixtures/sequence/title)).

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
and the next line would be read as a statement. [fixture:
title/comment-line-kept] [fixture: title/colon-comment-line-kept]

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
statements around it, and its text is kept as written. [fixture: comments/kept]
[corpus fixture: sequence/lex-single-percent-comment-line] [fixture:
comments/percent-line-kept] [fixture: comments/block-edges-kept] [fixture:
comments/text-whitespace-kept] A comment after a statement stays on its line,
and whether whitespace is written before its mark is kept: mermaid.js reads
`autonumber 5%% c` without the number 5, and a space before `%%` would give it
the number. [fixture: comments/kept] [corpus fixture:
sequence/lex-percent-comment-takes-number] [fixture:
comments/mark-whitespace-kept] [fixture:
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
it. [fixture: comments/semicolon-after-comment-kept] [corpus fixture:
sequence/tokens-comment-then-ignored-semicolon] [corpus fixture:
sequence/tokens-loop-comment-then-ignored-semicolon] [fixture:
comments/semicolon-after-percent-comment-kept] Where whitespace follows that `;`
in the source, the `;` lies inside the comment, and the comment is printed with
it. [fixture: comments/semicolon-inside-comment-kept] Dropping it in one case
and keeping it in the other would make a second formatting differ from the
first.

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
  them. mermaid.js gives a box whose text holds such a character the fill
  `transparent` and no name, and without it `box aqua` has the fill `aqua`. The
  whitespace after the last of them is dropped. A block header other than a box,
  `loop x`, U+2028, and ` ;` for one, is trimmed by mermaid.js, and the
  character is dropped with the whitespace at the end of its text. [test: U+2028
  at the end of the text of a box] [test: whitespace around U+2028 at the end of
  the text of a box] [test: U+2029 at the end of the text of a box] [test:
  whitespace around U+2029 at the end of the text of a box]
- Between a comment and the comment line that follows it on the same line, and
  between the end of a statement or of a block header and such a comment line. A
  diagram comment goes on past such a comment line to the next line, so a line
  break in place of the character would turn the text after it into a statement.
  [corpus fixture: sequence/lex-hash-comment-across-comment-line] mermaid.js
  removes the comment line, so the line after it continues the line before it:
  `A->>B:   x`, U+2028, `%% c`, and `C->>D: y` is one line, whose message text
  goes on into the next line. The statement or the header, the comment line, and
  the text after it are printed as written, without indentation and without
  formatting the whitespace between them: the tree lists the comments, and the
  printer reads them as one line (see
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
  This holds in every diagram type. [test: U+2028 after a directive that is not
  closed] [test: U+2029 after a directive that is not closed] [test: a `;` after
  U+2029 after a directive that is not closed] [test: a standalone open
  directive before U+2028 and a semicolon] [test: a standalone open directive
  before U+2029 and a semicolon]
- As the whitespace character that follows `title`: `title`, U+2028, and ` ;`
  stays as written, with the `;`. [test: U+2028 as the whitespace character
  after `title`, with a `;` after it] [test: U+2029 as the whitespace character
  after `title`]
- After the `end` of a block, which is not kept: `end`, U+2028, and a line break
  is printed as `end`, as mermaid.js reads the character there as whitespace.
  [test: U+2028 after the `end` of a block of a sequence diagram] [test: U+2029
  and whitespace around it after the last `end` of a sequence diagram]
- Between two parts of a statement, in every diagram type: the whitespace
  between them stays as written when it holds a U+2028 or U+2029, since the
  character is not whitespace to every rule of mermaid.js (`class A`, U+2028,
  and ` direction LR` is one name, while `class A`, a line break, and
  ` direction LR` is a statement and a direction). [test: U+2028 between an id
  and an arrow] [test: U+2029 between an arrow and an id] [test: U+2028 between
  an id and `as`]
- On a line that holds a `;` that the line rule ignores and, after it, a U+2028
  or U+2029: the line rule reads the text up to the character as the line, so
  the line is printed as written. A `;` inside a diagram comment is part of the
  comment, which is kept as written, and the rest of the line is formatted. A
  `;` on the next line, after the line break that follows the character, stays
  as written too: `participant Z@{ "style": "x:#y" };`, U+2028, a line break,
  and `;`, followed by a statement, is accepted by mermaid.js, while the same
  text without the second `;` is rejected. [test: a `;` after an ignored `;` and
  U+2029, which the line rule reads as the end of its line] [test: a `;` on the
  next line after an ignored `;` and U+2028, which the line rule reads as the
  end of its line] [test: statements after an ignored `;`, with a U+2029 later
  on the line]
- A `;` after a U+2028 or U+2029 that the printer keeps, such as the one at the
  end of the text of a `box`, a title, or a subgraph name. mermaid.js removes a
  comment line that starts right after U+2028 or U+2029 with the line breaks
  before it, so the `;` between them keeps the line break and a comment line
  after it from joining the next line: `box red`, U+2028, `;`, and a line `%% c`
  end the text of the box at the `;`. [corpus fixture:
  sequence/line-end-semicolons-2636cb4a] [corpus fixture:
  sequence/kept-semicolon-after-separator-05ce7bd7] [test: a `;` after U+2028 at
  the end of the text of a box] [test: a `;` after U+2028 at the end of a title]

A line that dropping a `;` would change the end of, or the `;` that the line
rule ignores in, is printed as written: a `;` after a directive that is not
closed, an ignored `;` next to another `;`, and one before a U+2028 or U+2029
(see [A line that a `;` ends](./compatibility.md#a-line-that-a--ends)). [corpus
fixture: sequence/ignored-semicolon-after-directive-06349fee] [corpus fixture:
sequence/ignored-semicolon-then-separator-line-15c6520f] [fixture:
statements-one-per-line/unclosed-directive-semicolon-kept] [fixture:
statements-one-per-line/ignored-semicolon-next-to-semicolon-kept]

### Directives

As in a flowchart: a directive on a line of its own stands at the level of the
statements around it, and a directive within a printed line is placed as in a
flowchart: the gap is printed as without the directive, and the directive stands
after its space and touches the unit that follows it. [fixture: directives/kept]
[fixture: directives/section-edges-kept] [fixture:
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

### Frontmatter YAML

As in a flowchart: the YAML between the `---` lines is formatted with Prettier's
YAML formatter where that is safe (see
[Frontmatter YAML](./flowchart.md#frontmatter-yaml)). [fixture:
frontmatter-yaml/formatted] [fixture: frontmatter-yaml/malformed-kept] [fixture:
frontmatter-yaml/indented-delimiters-kept] [fixture:
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
`Alice ->> Bob: hi`. [fixture: multi-line-statements/joined] [fixture:
multi-line-statements/more-lines-joined]

Each line break of a statement is decided on its own. A line break next to a
comment or a directive stays, while structural continuations and intervening
trivia stand one level deeper, and the other line breaks of the statement are
joined: `autonumber`, a line break, `5 %%{init: {}}%%`, a line break, and `2` is
printed as `autonumber 5 %%{init: {}}%%`, a line break, and `2`. The whitespace
before the first line break of each gap is retained: it can make mermaid.js read
later lines as part of the same statement. Whitespace inside values stays
unchanged. [fixture: multi-line-statements/breaks-decided-one-by-one] [fixture:
multi-line-statements/line-rule-first-hash-after-colon-kept] [fixture:
multi-line-statements/comment-inside-kept] [fixture:
multi-line-statements/autonumber-comment-continuation] [fixture:
multi-line-statements/autonumber-directive-continuation] A title with trivia
between its keyword and text keeps its complete source, since its text includes
indentation. Joining regions also stay as written. A line break stays where
joining it, with one space or with nothing, could change which `;` the line rule
ignores, and where a `;` decides the end of the last line; any other line break
is joined as usual, also in a statement that holds a `;`. [fixture:
multi-line-statements/semicolon-joining-changes-kept] A `;` alone does not
prevent joining. [fixture: multi-line-statements/semicolon-inside-joined]
[fixture: multi-line-statements/start-moves-to-own-line] Description blocks
instead follow [Multi-line values](#multi-line-values), which align their body
indentation.

The inputs have whitespace at the ends of lines, so the example is written as
strings, in which `\n` is a line break:
`"sequenceDiagram\nAlice ->> \nBob: hi\nautonumber \n  10 5\n"` is printed as
`"sequenceDiagram\n  Alice ->> Bob: hi\n  autonumber 10 5\n"` (the fixtures are
in the [folder](../tests/fixtures/sequence/multi-line-statements)).

### Multi-line values

The whitespace-only interior of a description block, including tabs, line breaks
and Unicode whitespace, prints `{}`: there is no text for interior whitespace to
surround. An already empty interior stays empty. The keyword and opening brace
have one space between them: `accDescr{  }` becomes `accDescr {}`. [fixture:
multi-line-values/empty-whitespace-interiors] [test: sequence Unicode and tab
interiors] Blocks with comments or directives keep their contents and line
breaks.

The text of a block on one line stands between one space on each side, as in
[flowchart's accessibility lines](./flowchart.md#accessibility-lines):
`accDescr {a b}`, `accDescr {  a b  }`, `accDescr {  a b}`, and
`accDescr {a b  }` are printed `accDescr { a b }`. mermaid.js trims the text, so
the whitespace at its ends carries no meaning. A block with a directive in its
text stays as written. A block on a line that keeps its `;` gets no added space,
and a run of spaces at its ends still becomes one space (see
[Semicolons](./flowchart.md#semicolons)). [fixture:
multi-line-values/block-text-on-one-line-padded]

Align the lines of an `accDescr { ... }` body one step inside its statement,
with a separate `}` at the statement's level, as in
[flowchart's top-level descriptions](./flowchart.md#multi-line-values). Mermaid
discards this indentation from the description. [fixture:
multi-line-values/description-and-data-indented] [fixture:
multi-line-values/accdescr-block-closing-brace-after-text-kept] [fixture:
multi-line-values/accdescr-block-blank-and-comment-lines-kept] [fixture:
multi-line-values/data-block-in-block-indented] A block without text, whose
lines are only comment lines, holds no value: its comment lines stand one level
deeper than the `accDescr`, as comment lines inside a statement do, and its `}`
at the level of the `accDescr`. [fixture:
multi-line-values/accdescr-block-comment-only] [fixture:
multi-line-values/accdescr-block-without-text-kept] A description block that the
text ends, as in `accDescr {` with no `}` after it, is accepted by mermaid.js
(see
[The statement context](../../spec/docs/diagrams/sequence.md#the-statement-context)),
and its body lines stand one level inside the statement as in a closed block; no
`}` is added. [fixture: multi-line-values/accdescr-block-unclosed-indented]

For participant and actor data blocks, apply
[Data blocks](./flowchart.md#data-blocks) only when exactly one body line holds
text. Move that line one level inside the statement and align a separate `}`
with the statement; a closer after text stays with that line. This applies at
the top level and inside `loop`, with body spaces even under `useTabs` and the
statement's indentation for a separate closer. [fixture:
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
lines. [fixture: multi-line-values/data-multiple-lines-kept] [fixture:
multi-line-values/data-inline-and-directive-kept] [fixture:
multi-line-values/data-kept-body-line] [fixture:
multi-line-values/data-zero-width-kept]

Comments, directives, blank lines and empty description blocks around the data
keep their own rules. CRLF and CR follow `endOfLine`; Unicode separators inside
values remain characters. [fixture: multi-line-values/data-surrounding-trivia]
[test: data blocks: sequence U+2028] [test: data blocks: sequence CR]

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
the case of keywords, which is the author's. The whitespace before the mark of a
comment, listed above, decides what mermaid.js reads after some statements, such
as `autonumber 5`; after the others the Db is the same either way, and it is
kept as written so that one rule holds.
