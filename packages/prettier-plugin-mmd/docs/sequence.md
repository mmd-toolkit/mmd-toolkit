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
`5`, keeps its directive and its `;` as written, with the statement. [fixture:
statements-one-per-line/directive-semicolon-after-multi-line-statement-kept]
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
and tokens that touch keep touching, as in a flowchart. [fixture:
whitespace-between-tokens/collapsed] [fixture:
whitespace-between-tokens/tabs-collapsed] So `+`, `-`, and `()` next to an arrow
or an id, the `,` of `note over A,B`, and a wrap prefix such as `wrap:` before
its text keep whether whitespace is written next to them. [fixture:
whitespace-between-tokens/collapsed] [fixture:
arrow-spacing/plus-and-minus-kept] [fixture:
arrow-spacing/parentheses-whitespace-kept] [fixture:
whitespace-between-tokens/comma-whitespace-kept] [fixture:
whitespace-between-tokens/wrap-prefix-kept] Keywords keep the case in which they
are written (`PARTICIPANT A`, `Note LEFT OF A`). mermaid.js reads them in any
case and the Db is the same, so nothing forces the case; it is the author's, and
the printer does not rewrite it. [fixture:
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
  note over A ,C: n
  A ->> B: wrap:x
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
participant, `@{ ... }`, is kept as written and touches its id, since whitespace
before `@{` makes the input rejected. [fixture:
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

### Arrow spacing

A message has one space before and after its arrow, as a flowchart link does:
`Alice->>Bob: hi` becomes `Alice ->> Bob: hi`. [fixture: arrow-spacing/spaced]
The `+`, `-`, or `()` after the arrow, and the `()` before it, stay next to the
id as written. [fixture: arrow-spacing/plus-and-minus-kept] [fixture:
arrow-spacing/parentheses-whitespace-kept] The arrow is printed as written.
[fixture: arrow-spacing/arrows-kept] Next to a directive, the whitespace written
is kept, as under [Directives](#directives): `A%%{init: {}}%%->>B: v` has no
space before its arrow. [fixture: arrow-spacing/directive-beside-arrow-kept]

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
keeps its arrow touching on both sides. Two rules of the lexer need whitespace
after what they read (the specification's
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
documentation of mermaid.js writes a sequence diagram, except next to a
directive, where the whitespace written is kept (see [Directives](#directives)).
[fixture: colons/spaced] [fixture: colons/other-statements-spaced] [fixture:
colons/directive-around-colon-kept] mermaid.js reads the text without the
whitespace at its ends. When the text is empty, nothing follows the `:`.
[fixture: colons/spaced] [fixture: colons/empty-text] A line break after the `:`
of `accTitle` is whitespace for mermaid.js, so the next line is its text: an
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
  A ->> B: :nowrap:z
```

### Title

`title` and `title:` are followed by one space, and the rest of the line is kept
as written. A directive after the keyword keeps whether whitespace is written
between them: `title %%{init: {}}%% T` has one space before the directive, and
`title%%{init: {}}%% U` and `title:%%{init: {}}%% V` keep it touching. [fixture:
title/directive-after-keyword-kept] mermaid.js reads one whitespace character
after the keyword, which may be a line break, and keeps everything after it in
the title, the whitespace at its start and at its end included. So `title`, a
line break, and `A->>B: x` is printed as `title A->>B: x`, which shows that the
next line is the title: mermaid.js reads it so. [fixture: title/separator]
[corpus fixture: sequence/lex-title-line-break] [corpus fixture:
sequence/db-title-next-line-indented] [fixture: title/tab-and-colon-line-break]
[fixture: title/line-break-indented] The whitespace at the end of a title is
kept. [fixture: title/trailing-whitespace-kept] [fixture:
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
  title  Two spaces
  title: Tab
```

A title with a comment line between its keyword and its text is kept as written,
as a statement written over several lines with a comment in it is (see
[Multi-line statements](#multi-line-statements)). The comment line is removed
before mermaid.js reads the text, so the line after it is the title; printed
after the one space, the comment would stand on the line of the keyword, and the
next line would be read as a statement. [fixture: title/comment-line-kept]
[fixture: title/colon-comment-line-kept]

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
  [test: U+2029 after a `%` comment that a comment line follows]
- Right after a directive that is not closed. The text of such a directive stops
  before the character, which is no whitespace to it: with the character printed
  as a space or a line break, the directive would reach the rest of the text.
  This holds in every diagram type. [test: U+2028 after a directive that is not
  closed] [test: U+2029 after a directive that is not closed] [test: a `;` after
  U+2029 after a directive that is not closed]
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
  comment, which is kept as written, and the rest of the line is formatted.
  [test: a `;` after an ignored `;` and U+2029, which the line rule reads as the
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
statements around it, and a directive on the line of a statement keeps whether
whitespace is written on each side of it: where it is, one space stands there,
and where the directive touches a token, it keeps touching. [fixture:
directives/kept] [fixture: directives/section-edges-kept] [fixture:
directives/whitespace-on-each-side-kept] [fixture: directives/touching-kept]
[fixture: directives/block-lines-kept]

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

A statement written over several lines with a comment, a directive, or a `;` in
it is kept as written, from its start to its end. [fixture:
multi-line-statements/comment-inside-kept] [fixture:
multi-line-statements/semicolon-inside-kept] [fixture:
multi-line-statements/start-moves-to-own-line] It cannot stand on one line, and
only the whitespace at the ends of its lines, which the formatter does not
write, makes mermaid.js read its lines as one statement. A title with a comment
line between its keyword and its text is such a statement. The lines of an
`accDescr { ... }` block are lines of its text (see
[Multi-line values](#multi-line-values)).

The inputs have whitespace at the ends of lines, so the example is written as
strings, in which `\n` is a line break:
`"sequenceDiagram\nAlice ->> \nBob: hi\nautonumber \n  10 5\n"` is printed as
`"sequenceDiagram\n  Alice ->> Bob: hi\n  autonumber 10 5\n"` (the fixtures are
in the [folder](../tests/fixtures/sequence/multi-line-statements)).

### Multi-line values

As in a flowchart: the lines of an `accDescr { ... }` block and of a data block
written over several lines are kept as written, and the `}` of an `accDescr`
block stands at the level of its statement. Outside a subgraph the columns of
those lines are not in the Db, so keeping them is a choice, whose reason is in a
flowchart (see [Multi-line values](./flowchart.md#multi-line-values)). [fixture:
multi-line-values/kept] [fixture:
multi-line-values/accdescr-block-closing-brace-after-text-kept] [fixture:
multi-line-values/accdescr-block-blank-and-comment-lines-kept] [fixture:
multi-line-values/data-block-in-block-kept] A block without text, whose lines
are only comment lines, holds no value: its comment lines stand one level deeper
than the `accDescr`, as comment lines inside a statement do, and its `}` at the
level of the `accDescr`. [fixture:
multi-line-values/accdescr-block-comment-only] [fixture:
multi-line-values/accdescr-block-without-text-kept]

Input
([multi-line-values/kept-input.mmd](../tests/fixtures/sequence/multi-line-values/kept-input.mmd)):

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
([multi-line-values/kept-output.mmd](../tests/fixtures/sequence/multi-line-values/kept-output.mmd)):

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

Some text is always kept as written, because changing it would change the
diagram or the input would be rejected:

- the text of a value, with the whitespace inside it, and the text of a `box` as
  a whole, up to the last U+2028 or U+2029 that ends it;
- the whitespace after the one character that follows `title` or `title:`;
- the data block of a participant, and that it touches its id;
- that an arrow touches a source spelled as a number or `title`;
- a statement written over several lines with a comment, a directive, or a `;`
  in it, such as a title with a comment line between its keyword and its text;
- whether whitespace is written before the mark of a comment after a statement,
  and a U+2028 or U+2029 between a comment and a comment line after it;
- the arrows.

Some text is kept as written by choice, because the Db is the same either way:
the case of keywords, which is the author's. The whitespace before the mark of a
comment, listed above, decides what mermaid.js reads after some statements, such
as `autonumber 5`; after the others the Db is the same either way, and it is
kept as written so that one rule holds.
