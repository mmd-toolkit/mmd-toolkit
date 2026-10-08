# bare-percent-line-before-header

Japanese version:
[bare-percent-line-before-header.ja.md](./bare-percent-line-before-header.ja.md)

Diagram types: flowchart, class, state, er, and gantt. This is one of the
[known divergences](../known-divergences.md) of this specification from
mermaid.js.

## The syntax

A comment line is `%%` followed by at least one character other than `{`, up to
the end of its line, and it is trivia everywhere (see
[Comment lines](../common.md#comment-lines)). A **bare `%%` line** is a line
whose diagram text, after line whitespace, is `%%` followed by a line terminator
or the end of the text, or `%%{` where no directive starts: `%%` alone, or
`%%{ }%%`, which is no directive. Before the header, detection reads and passes
such lines, and each of them is a comment of the diagram, with the mark `%%`, in
every diagram type (see [Diagram detection](../common.md#diagram-detection)):

```mmd
%%
sequenceDiagram
  A->>B: x
```

[fixture: sequence/header-after-bare-percent-line]

mermaid.js reads the same input differently: its detection strips every `%%`
that has a line break after it together with the rest of its line, finds the
header, and then hands the text with the bare `%%` lines still in it to the
lexer of the detected diagram. Where that lexer reads such a line as a comment,
as the lexers of sequence, class, and state read `%%` alone, both accept the
input. Where it does not, as the lexer of er never does, and as the lexer of
gantt does not before the header, mermaid.js rejects the input, and this
specification accepts it: that is this divergence.

## The difference

Each example is a whole diagram.

1. A line of `%%` alone before a flowchart header:

   ```mmd
   %%
   flowchart LR
     A-->B
   ```

2. A line `%%{ }%%` before a flowchart header:

   ```mmd
   %%{ }%%
   flowchart LR
     A-->B
   ```

3. A line `%%{ }%%` before a state header:

   ```mmd
   %%{ }%%
   stateDiagram-v2
     [*] --> A
   ```

4. A line of whitespace only, not empty, between a bare `%%` line and a class
   header: `%%`, a line of two spaces, `classDiagram`, and `class A`, each on
   its own line (the line of spaces cannot be shown in a code block here, since
   the formatter removes trailing whitespace).

5. The same with a line `%%{ }%%` in place of the `%%` line: `%%{ }%%`, a line
   of two spaces, `classDiagram`, and `class A`.

6. A line of `%%` alone before an ER header:

   ```mmd
   %%
   erDiagram
     A ||--o{ B : has
   ```

7. A line `%%{ }%%` before an ER header, and a line of whitespace only, not
   empty, between a bare `%%` line and an ER header: `%%`, a line of two spaces,
   `erDiagram`, and `A`.

8. A line of `%%` alone, a line `%%{ }%%`, or a line of `%%` alone and a line of
   two spaces, before a gantt header:

   ```mmd
   %%
   gantt
     title T
   ```

| Example | mermaid.js                                          | This specification                       |
| ------- | --------------------------------------------------- | ---------------------------------------- |
| 1       | rejected: the `%%` is an id before the header       | a flowchart with the edge A to B         |
| 2       | rejected: the `%%` is an id before the header       | a flowchart with the edge A to B         |
| 3       | rejected: `%%` is ignored text and `{` fits nothing | a state diagram with the transition to A |
| 4       | rejected: the line of spaces is a `newline` unit    | a class diagram with the class A         |
| 5       | rejected: the line of spaces is a `newline` unit    | a class diagram with the class A         |
| 6       | rejected: the lexer has no rule for `%`             | an ER diagram with the relationship      |
| 7       | rejected: the lexer has no rule for `%`             | an ER diagram with the entity A          |
| 8       | rejected: the line feed is a `newline` unit         | a Gantt chart with the title T           |

[fixture: flowchart/header-after-bare-percent-line] [fixture:
flowchart/header-after-empty-braces-line] [fixture:
state/header-after-empty-braces-line] [fixture:
class/header-after-bare-percent-then-whitespace-line] [fixture:
class/header-after-empty-braces-then-whitespace-line] [fixture:
er/header-after-bare-percent-line] [fixture: er/header-after-empty-braces-line]
[fixture: er/header-after-bare-percent-line-and-whitespace-line] [fixture:
gantt/header-after-bare-percent-line] [fixture:
gantt/header-after-empty-braces-line] [fixture:
gantt/header-after-bare-percent-line-and-whitespace-line]

The neighbouring forms are read in the same way: in flowchart and state, a line
`%%{-x}%%` or `%%{}`, which starts no directive, is a bare `%%` line, a comment
here and rejected there; in class, a line of a tab only, or a line that is
whitespace only once its directives are left out, such as `  %%{init: {}}%%`, is
a line of whitespace only, trivia here and a `newline` unit there. [fixture:
flowchart/header-after-non-word-brace-line] [fixture:
flowchart/header-after-empty-braces-no-space] [fixture:
state/header-after-non-word-brace-line] [fixture:
state/header-after-empty-braces-no-space] [fixture:
class/header-after-bare-percent-then-tab-line] [fixture:
class/header-after-bare-percent-then-indented-directive-line] A directive or the
frontmatter before the bare `%%` line changes nothing: it is trivia, and the
bare `%%` line is still read as above. [fixture:
flowchart/header-after-directive-then-bare-percent-line] [fixture:
flowchart/header-after-frontmatter-then-bare-percent-line]

Where mermaid.js accepts the input, both read it the same: a line of `%%` alone
before a sequence, class, or state header, a line `%%{ }%%` before a sequence or
class header, a line of whitespace only between such a line and a sequence or
state header, and, in class, a line of whitespace only right before a comment
line, which lies in the comment region. [fixture:
sequence/header-after-bare-percent-line] [fixture:
class/header-after-bare-percent-line] [fixture:
state/header-after-bare-percent-line] [fixture:
sequence/header-after-empty-braces-line] [fixture:
class/header-after-empty-braces-line] [fixture:
sequence/header-after-bare-percent-then-whitespace-line] [fixture:
class/header-after-bare-percent-then-whitespace-line-then-comment-line]
[fixture: class/header-after-bare-percent-then-empty-line] The difference goes
one way: this specification accepts inputs that mermaid.js rejects, and it never
rejects one that mermaid.js accepts here.

## What it means for an author

A line of `%%` alone, or `%%{ }%%`, before the header is read as a comment by
this toolkit in every diagram type, and by mermaid.js only in sequence, class,
and state (and not before a line of spaces in class), never in er or gantt. To
write a diagram that both read the same, write comments before the header as
comment lines, with at least one character after the `%%`, and leave no line of
spaces between them and the header.

## Why mermaid.js reads it so

[`detectType()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/detectType.ts#L36-L48)
removes every `%%` that has a line break somewhere after it, with the rest of
its line
([`stripAnyComments()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/regexes.ts#L46-L73)),
and finds the header in what is left. The lexer of the detected diagram receives
the text from
[`preprocessDiagram()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L58-L91),
whose
[`cleanupComments()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/comments.ts#L6-L8)
removes only comment lines with at least one character after the `%%`, so the
bare `%%` lines reach the lexer. The flowchart lexer reads `%%` as an id, the
state lexer reads `%%` as ignored text and has no rule for a `{` there, the
class lexer reads a line of whitespace only as a `newline` unit, which its
grammar does not take before the header, the er lexer has no rule for `%` at
all, and the gantt lexer reads the `%%` as a comment but the line feed after it
as a `newline` unit, which its grammar does not take before the header. The open
issue
[mermaid-js/mermaid#8196](https://github.com/mermaid-js/mermaid/issues/8196)
records that the two comment-stripping methods of detection and preprocessing
disagree.

## The rule of this specification, and why

The tree holds a bare `%%` line as a comment (a `Comment` with the mark `%%`),
as it holds the same line in a sequence diagram, so the input is read as what
was written, and it is accepted. Whether such a line is accepted in mermaid.js
depends on the lexer of the diagram that its detection found after removing the
line, that is, on the order of the steps of its pipeline, which is nothing a
specification would state: the second of the reasons for a known divergence (see
[known-divergences.md](../known-divergences.md)). One rule for every diagram
type is stated instead, and the inputs that mermaid.js rejects for this reason
are the divergence.

## The documentation of mermaid.js and its issues

- The
  [syntax reference](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/intro/syntax-reference.md)
  says that line comments can ignore anything on the line after `%% `, and that
  all diagram definitions begin with a declaration of the diagram type. It says
  nothing of a line of `%%` alone.
- [mermaid-js/mermaid#8196](https://github.com/mermaid-js/mermaid/issues/8196)
  (open, 2026-09-01) records that `detectType()` and `preprocessDiagram()` strip
  comments differently. No issue or pull request about a `%%` line before the
  header was found (searched on 2026-10-07 for `comment before diagram type`,
  `detectType comment`, `stripAnyComments`, and `UnknownDiagramError comment`).
