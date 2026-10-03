# Sequence diagram formatting rules

Japanese version: [sequence.ja.md](./sequence.ja.md)

How prettier-plugin-mmd formats a sequence diagram. Each rule below keeps what
mermaid.js reads from the diagram; where a change would alter it, the text is
kept as written, and the rule says where. Where a rule is the same as in a
flowchart, it says so, and the reason is in [flowchart.md](./flowchart.md).

Each rule has a folder of examples under
[`tests/fixtures/sequence/`](../tests/fixtures/sequence), named as the rule's
heading, as for flowcharts: each example is a pair of files, the input and the
formatted output, and the tests check both that the plugin prints the output and
that mermaid.js reads the same diagram from the input and the output. The
examples in this document are copies of those files, and a test checks that they
are the same.

## Rules

### Indentation

The statements after the header stand one level deeper than the header. The
statements of a block (`loop`, `alt`, `opt`, `par`, `par_over`, `critical`,
`break`, `rect`) and the participants of a `box` stand one level deeper than the
line that opens it; `else`, `and`, `option`, and `end` stand at the level of
that line. A level is what Prettier's `useTabs` and `tabWidth` options say: two
spaces by default. The indentation written in the input is not kept: whitespace
at the start of a line is nothing to mermaid.js.

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
dropped: mermaid.js reads a `;` as it reads a line break. A statement written on
the line of the header, or after `end` on its line, moves to a line of its own.
A line that holds a `;` that the line rule of mermaid.js ignores keeps its
statements and its `;`, as in a flowchart (see
[Statements one per line](./flowchart.md#statements-one-per-line)).

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
`actor` that ends with a data block and has no `as`, is kept. mermaid.js removes
the directive, and whitespace at the end of the line then hides the line break
from the statement, which needs one, and whose last unit reads no whitespace:
`autonumber`, a space, `%%{wrap}%%`, and `;` are accepted, while the same
without the `;` is rejected. The last unit of the other statements, a text, an
id, or a description after `as`, reads the whitespace with it (see the statement
context of the sequence specification, and Empty description blocks before a
separator there).

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
and tokens that touch keep touching, as in a flowchart. So `+`, `-`, and `()`
next to an arrow or an id, the `,` of `note over A,B`, and a wrap prefix such as
`wrap:` before its text keep whether whitespace is written next to them.
Keywords keep the case in which they are written (`PARTICIPANT A`,
`Note LEFT OF A`): mermaid.js reads them in any case.

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
JSON of `links` and `properties`. The text of a `box` is kept as a whole: when
its first word is no colour, mermaid.js takes the whole text as the name of the
box. The data block of a participant, `@{ ... }`, is kept as written and touches
its id, since whitespace before `@{` makes the input rejected. A line that
mermaid.js reads as nothing, such as `)` alone, is kept and stands at the level
of the statements around it.

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
`Alice->>Bob: hi` becomes `Alice ->> Bob: hi`. The `+`, `-`, or `()` after the
arrow, and the `()` before it, stay next to the id as written. The arrow is
printed as written.

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
`accDescr`, touch what comes before them and have one space after them.
mermaid.js reads the text without the whitespace at its ends. When the text is
empty, nothing follows the `:`.

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
as written. mermaid.js reads one whitespace character after the keyword, which
may be a line break, and keeps everything after it in the title, the whitespace
at its start and at its end included. So `title`, a line break, and `A->>B: x`
is printed as `title A->>B: x`, which shows that the next line is the title:
mermaid.js reads it so. The whitespace at the end of a title is kept; that
example is not shown here, because the whitespace is at the end of a line (see
`title/trailing-whitespace-kept` in the
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
next line would be read as a statement.

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
statements around it, and its text is kept as written. A comment after a
statement stays on its line, and whether whitespace is written before its mark
is kept: mermaid.js reads `autonumber 5%% c` without the number 5, and a space
before `%%` would give it the number.

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
it. Where whitespace follows that `;` in the source, the `;` lies inside the
comment, and the comment is printed with it. Dropping it in one case and keeping
it in the other would make a second formatting differ from the first.

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
invisible, so there is no example here; the tests write them as escapes (see
`tests/line-separators.test.ts`).

- At the end of the text of a `box`, after the whitespace that may stand before
  them. mermaid.js gives a box whose text holds such a character the fill
  `transparent` and no name, and without it `box aqua` has the fill `aqua`. The
  whitespace after the last of them is dropped.
- Between a comment and the comment line that follows it on the same line. A
  diagram comment goes on past such a comment line to the next line, so a line
  break in place of the character would turn the text after it into a statement.
  The comment, the comment line, and the text after it are printed as written,
  without indentation: the tree lists them as comments, and the printer reads
  them as one.
- Right after a directive that is not closed. The text of such a directive stops
  before the character, which is no whitespace to it: with the character printed
  as a space or a line break, the directive would reach the rest of the text.
  This holds in every diagram type.
- As the whitespace character that follows `title`: `title`, U+2028, and ` ;`
  stays as written, with the `;`.
- Between two parts of a statement, in every diagram type: the whitespace
  between them stays as written when it holds a U+2028 or U+2029, since the
  character is not whitespace to every rule of mermaid.js (`class A`, U+2028,
  and ` direction LR` is one name, while `class A`, a line break, and
  ` direction LR` is a statement and a direction).
- On a line that holds a `;` that the line rule ignores and, after it, a U+2028
  or U+2029: the line rule reads the text up to the character as the line, so
  the line is printed as written.
- A `;` after a U+2028 or U+2029 that the printer keeps, such as the one at the
  end of the text of a `box`, a title, or a subgraph name. mermaid.js removes a
  comment line that starts right after U+2028 or U+2029 with the line breaks
  before it, so the `;` between them keeps the line break and a comment line
  after it from joining the next line: `box red`, U+2028, `;`, and a line `%% c`
  end the text of the box at the `;`.

### Directives

As in a flowchart: a directive on a line of its own stands at the level of the
statements around it, and a directive on the line of a statement keeps the
whitespace written on each side of it.

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
[Frontmatter YAML](./flowchart.md#frontmatter-yaml)).

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

A statement written over several lines with a comment, a directive, or a `;` in
it is kept as written, from its start to its end. It cannot stand on one line,
and only the whitespace at the ends of its lines, which the formatter does not
write, makes mermaid.js read its lines as one statement. A title with a comment
line between its keyword and its text is such a statement. The lines of an
`accDescr { ... }` block are lines of its text (see
[Multi-line values](#multi-line-values)).

The examples are not shown here, because their inputs have whitespace at the
ends of lines (see the
[folder](../tests/fixtures/sequence/multi-line-statements)).

### Multi-line values

As in a flowchart: the lines of an `accDescr { ... }` block and of a data block
written over several lines are kept as written, and the `}` of an `accDescr`
block stands at the level of its statement. A block without text, whose lines
are only comment lines, holds no value: its comment lines stand one level deeper
than the `accDescr`, as comment lines inside a statement do, and its `}` at the
level of the `accDescr`.

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
- the arrows, and the case of keywords.
