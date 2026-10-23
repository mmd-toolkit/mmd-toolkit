# bare-percent-line-before-header

Japanese version:
[bare-percent-line-before-header.ja.md](./bare-percent-line-before-header.ja.md)

Diagram types: flowchart, class, state, er, gantt, journey, requirement,
timeline, sankey, block, c4, agentflow, usecase, pie, gitgraph, and info. This
is one of the [known divergences](../known-divergences.md) of this specification
from mermaid.js.

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
  A ->> B: x
```

[fixture: sequence/header-after-bare-percent-line]

mermaid.js reads the same input differently: its detection strips every `%%`
that has a line break after it together with the rest of its line, finds the
header, and then hands the text with the bare `%%` lines still in it to the
lexer of the detected diagram. Where that lexer reads such a line as a comment,
as the lexers of sequence, class, state, and agentflow read `%%` alone, both
accept the input. Where it does not, as the lexers of er, sankey, and block
never do, and as the lexers of gantt, journey, requirement, and timeline do not
before the header, mermaid.js rejects the input, and this specification accepts
it: that is this divergence.

## The difference

Each example is a whole diagram.

1. A line of `%%` alone before a flowchart header:

   ```mmd
   %%
   flowchart LR
     A --> B
   ```

2. A line `%%{ }%%` before a flowchart header:

   ```mmd
   %%{ }%%
   flowchart LR
     A --> B
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

9. A line of `%%` alone, a line `%%{ }%%`, or a line of `%%` alone and a line of
   two spaces, before a journey header:

   ```mmd
   %%
   journey
     A: 1
   ```

10. A line of `%%` alone, a line `%%{ }%%`, or a line of `%%` alone and a line
    of two spaces, before a requirement header:

    ```mmd
    %%
    requirementDiagram
      requirement r {
      }
    ```

11. A line of `%%` alone, a line `%%{ }%%`, or a line of `%%` alone and a line
    of two spaces, before a timeline header:

    ```mmd
    %%
    timeline
      a
    ```

12. A line of `%%` alone, a line `%%{ }%%`, or a line of `%%` alone and a line
    of two spaces, before a sankey header:

    ```mmd
    %%
    sankey
    a,b,1
    ```

13. A line of `%%` alone, a line `%%{ }%%`, or a line of `%%` alone and a line
    of two spaces, before a block header:

    ```mmd
    %%
    block-beta
      A
    ```

| Example | mermaid.js                                          | This specification                           |
| ------- | --------------------------------------------------- | -------------------------------------------- |
| 1       | rejected: the `%%` is an id before the header       | a flowchart with the edge A to B             |
| 2       | rejected: the `%%` is an id before the header       | a flowchart with the edge A to B             |
| 3       | rejected: `%%` is ignored text and `{` fits nothing | a state diagram with the transition to A     |
| 4       | rejected: the line of spaces is a `newline` unit    | a class diagram with the class A             |
| 5       | rejected: the line of spaces is a `newline` unit    | a class diagram with the class A             |
| 6       | rejected: the lexer has no rule for `%`             | an ER diagram with the relationship          |
| 7       | rejected: the lexer has no rule for `%`             | an ER diagram with the entity A              |
| 8       | rejected: the line feed is a `newline` unit         | a Gantt chart with the title T               |
| 9       | rejected: the line feed is a `newline` unit         | a user journey with the task A               |
| 10      | rejected: the line feed is a `newline` unit         | a requirement diagram with the requirement r |
| 11      | rejected: the line feed is a `newline` unit         | a timeline with the period a                 |
| 12      | rejected: the `%%` is a field before the header     | a sankey diagram with the link a to b        |
| 13      | rejected: the `%%` is an id before the header       | a block diagram with the block A             |

[fixture: flowchart/header-after-bare-percent-line] [fixture:
flowchart/header-after-empty-braces-line] [fixture:
state/header-after-empty-braces-line] [fixture:
class/header-after-bare-percent-then-whitespace-line] [fixture:
class/header-after-empty-braces-then-whitespace-line] [fixture:
er/header-after-bare-percent-line] [fixture: er/header-after-empty-braces-line]
[fixture: er/header-after-bare-percent-line-and-whitespace-line] [fixture:
gantt/header-after-bare-percent-line] [fixture:
gantt/header-after-empty-braces-line] [fixture:
gantt/header-after-bare-percent-line-and-whitespace-line] [fixture:
journey/header-after-bare-percent-line] [fixture:
journey/header-after-empty-braces-line] [fixture:
journey/header-after-bare-percent-line-and-whitespace-line] [fixture:
requirement/header-after-bare-percent-line] [fixture:
requirement/header-after-empty-braces-line] [fixture:
requirement/header-after-bare-percent-line-and-whitespace-line] [fixture:
timeline/header-after-bare-percent-line] [fixture:
timeline/header-after-empty-braces-line] [fixture:
timeline/header-after-bare-percent-line-and-whitespace-line] [fixture:
sankey/header-after-bare-percent-line] [fixture:
sankey/header-after-empty-braces-line] [fixture:
sankey/header-after-bare-percent-line-and-whitespace-line] [fixture:
block/div-after-bare-percent-line] [fixture: block/div-after-empty-braces-line]
[fixture: block/div-after-bare-percent-line-and-whitespace-line]

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
before a sequence, class, state, or agentflow header, a line `%%{ }%%` before a
sequence or class header, a line of whitespace only between such a line and a
sequence or state header, and, in class, a line of whitespace only right before
a comment line, which lies in the comment region. [fixture:
agentflow/comment-bare-percent-line] [fixture:
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

In C4, a bare `%%` line followed by a spaces-only line before the header is
leading trivia here; mermaid.js leaves a newline before the header and rejects
it. [fixture: c4/div-leading-percent-space-blank]

A bare percent line directly before the C4 header or followed only by an empty
line is accepted by both. [fixture: c4/header-after-bare-percent-line] [fixture:
c4/header-leading-percent-blank] [fixture:
c4/header-leading-percent-before-different-header]

## What it means for an author

This toolkit reads a line of `%%` alone or `%%{ }%%` before the header as a
comment in every diagram type. In mermaid.js, acceptance depends on the form and
diagram type, as listed above. Agentflow accepts `%%` alone, including before a
whitespace-only line, but rejects a non-directive percent-brace line. [fixture:
agentflow/comment-bare-percent-line] [fixture:
agentflow/comment-bare-before-spaces] [fixture:
agentflow/div-percent-braces-before-header] To write a diagram that both read
the same, write comments before the header as comment lines, with at least one
character after the `%%`, and leave no line of spaces between them and the
header.

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
all, the sankey lexer reads `%%` as a field, which its grammar does not take
before the header, the block lexer reads `%%` as an id, which its grammar does
not take before the header, and the gantt, journey, requirement, and timeline
lexers read the `%%` as a comment but the line feed after it as a `newline`
unit, which their grammars do not take before the header. The open issue
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

### Agentflow

Agentflow already accepts a bare %% line and a following whitespace-only line.
Its preserving lexer rejects a non-directive %%{}%% or %%{ }%% line before the
header, although detection passes it. The shared Comment record holds the entire
line, so the common pre-header-comment rule accepts it. This is the existing
reverse pipeline-order criterion; no authored text is discarded from the tree.
[fixture: agentflow/comment-bare-percent-line] [fixture:
agentflow/comment-bare-before-spaces] [fixture:
agentflow/div-percent-braces-before-header] [fixture:
agentflow/div-percent-braces-after-directive-before-header] [fixture:
agentflow/div-comment-header-percent-brace]

### Usecase

In usecase, the affected range is a bare %% or non-directive %%{...} line before
the header, excluding its line terminator. A common Comment already holds its
mark and value, and following leading whitespace is trivia. Mermaid detects the
header after skipping it, then rejects because its parser requires the header
first; deleting that line gives the accepted reference. The existing reverse
pipeline-order criterion accepts these common leading comments, with no
additional usecase node and no rejection of a Mermaid-accepted input. Native
bare comments after the header already work. [fixture:
usecase/div-comment-preheader-bare] [fixture:
usecase/div-comment-preheader-braces] [fixture:
usecase/div-comment-preheader-bare-unicode-blank] [fixture:
usecase/lex-comment-bare-percent-before-header-reference] [fixture:
usecase/lex-comment-before-header-unicode-reference] [fixture:
usecase/comment-bare-pair]

### Pie

The common Comment record holds a bare `%%` line; the whitespace between it and
the header already has its ordinary trivia place, so no pie node is needed.
After common CR/CRLF conversion, Mermaid's pie lexical rules accept ASCII space,
tab and LF after the bare line but reject any other common whitespace there, on
a whitespace-only line or immediately before the header. These include VT, FF,
U+1680, U+2003, U+202F, U+205F, U+3000, LS, PS, NBSP and a byte order mark; LS
and a byte order mark also reject immediately before the header. Without the
bare line, an LS line is leading trivia and is accepted by both. The shared rule
accepts all these leading comments and whitespace. This is the existing reverse
pipeline-order criterion: it accepts these rejected inputs and rejects no input
Mermaid accepts. [fixture: pie/div-preheader-bare-ls-blank] [fixture:
pie/div-preheader-bare-ps-blank] [fixture: pie/div-preheader-bare-nbsp-blank]
[fixture: pie/div-preheader-bare-bom-blank] [fixture:
pie/lex-preheader-bare-ascii-blank-control] [fixture:
pie/lex-preheader-ls-without-bare-control] [fixture:
pie/div-preheader-bare-vt-blank] [fixture: pie/div-preheader-bare-ff-blank]
[fixture: pie/div-preheader-bare-u1680-blank] [fixture:
pie/div-preheader-bare-u2003-blank] [fixture:
pie/div-preheader-bare-u202f-blank] [fixture:
pie/div-preheader-bare-u205f-blank] [fixture:
pie/div-preheader-bare-u3000-blank] [fixture:
pie/div-preheader-bare-ls-before-header] [fixture:
pie/div-preheader-bare-bom-before-header]

The same difference applies when a bare line follows a retained nonleading block
or second-scan directive, and when that line and its passed trivia lie between a
retained block and a second-scan directive. LS or a byte order mark before the
header, an LS-only line, and LS before the later directive are accepted here and
rejected by Mermaid; the corresponding ASCII space/tab forms are accepted by
both. The retained hidden forms stay in textBeforeHeader; the bare line is a
shared Comment and its passed whitespace and line breaks are trivia. [fixture:
pie/div-preheader-retained-directive-bare-bom] [fixture:
pie/div-preheader-retained-directive-bare-ls] [fixture:
pie/div-preheader-retained-directive-bare-ls-line] [fixture:
pie/div-preheader-retained-yaml-bare-bom] [fixture:
pie/div-preheader-retained-yaml-bare-ls] [fixture:
pie/div-preheader-retained-yaml-bare-ls-line] [fixture:
pie/div-preheader-retained-yaml-bare-then-directive] [fixture:
pie/lex-preheader-retained-directive-bare-ascii] [fixture:
pie/lex-preheader-retained-directive-bare-ascii-line] [fixture:
pie/lex-preheader-retained-yaml-bare-ascii] [fixture:
pie/lex-preheader-retained-yaml-bare-ascii-line] [fixture:
pie/lex-preheader-retained-yaml-bare-then-directive-ascii]

### Gitgraph

A shared Comment holds each passed bare line and its accompanying whitespace is
trivia, also after or between retained forms. Under reverse reason 2 this
specification accepts common whitespace that the native reading rejects there.
It rejects no Mermaid-accepted input. The same Unicode whitespace without a
passed bare line remains subject to ordinary lexical rejection. [fixture:
gitgraph/div-detect-bare-before-header-ls] [fixture:
gitgraph/div-detect-bare-nbsp-line] [fixture:
gitgraph/div-detect-retained-directive-bare-bom] [fixture:
gitgraph/div-detect-retained-yaml-bare-ls-line] [fixture:
gitgraph/div-lex-preheader-bare-between-retained-unicode] [fixture:
gitgraph/detect-bare-before-header-space] [fixture:
gitgraph/lex-preheader-hidden-no-bare-unicode]

### Info

Shared Comments hold the passed bare lines, and the accompanying common
whitespace is trivia. The existing reverse pipeline-order rule accepts
whitespace that Mermaid rejects on native re-reading, including after or between
retained forms. It rejects no Mermaid-accepted input. ASCII controls agree,
while Unicode gaps without a passed bare line remain native rejections.
[fixture: info/div-bare-before-header-bom] [fixture: info/div-bare-line-ls]
[fixture: info/div-detect-retained-yaml-bare-ls] [fixture:
info/div-detect-retained-directive-bare-bom] [fixture:
info/div-detect-yaml-bare-directive] [fixture: info/bare-before-header-space]
[fixture: info/bare-line-tab] [fixture:
info/lex-detect-yaml-bare-directive-ascii] [fixture:
info/lex-retained-no-bare-ls]

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

- The pinned
  [C4 documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/c4.md#L7-L17)
  starts its examples with a C4 header and does not describe a bare `%%` line
  before it. Searches of issues and pull requests in `mermaid-js/mermaid` on
  2026-10-21 with `C4 comment header in:title,body`,
  `C4 comment "header" in:title,body`, `C4 "bare" comment in:title,body`, and
  `stripAnyComments in:title,body` found
  [issue #8196](https://github.com/mermaid-js/mermaid/issues/8196), which
  describes the disagreement between detection and preprocessing comment removal
  without singling out C4. No report about a bare percent line followed by a
  spaces-only line before a C4 header was found.

- The pinned
  [Agentflow declaration documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/agentflow.md#L98-L108)
  starts diagrams with agentflow-beta and does not describe a non-directive
  percent-brace line before the header. Searches of issues and pull requests in
  `mermaid-js/mermaid` on 2026-10-22 with `agentflow comment in:title,body`
  found the merged [PR #8073](https://github.com/mermaid-js/mermaid/pull/8073),
  which describes comment-preserving input. No report about a non-directive
  percent-brace line before an Agentflow header was found.

- The pinned
  [usecase documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/usecase.md#L1-L589)
  describes one statement per line. Searches of issues and pull requests in
  `mermaid-js/mermaid` on 2026-10-22 with `usecase comment` found no inspected
  report establishing a maintainer defect judgment for this acceptance behavior.
  [PR #8048](https://github.com/mermaid-js/mermaid/pull/8048), closed and merged
  on 2026-08-14 with Type: Enhancement, introduces the Chevrotain parser, model
  validation and JSON tables. This divergence follows the shared direct rule,
  not a claim that a bug label approves a grammar change.

- The pinned
  [pie documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/pie.md)
  starts its examples with pie and does not describe Unicode whitespace between
  a bare percent line and the header.
  [Issue #8196](https://github.com/mermaid-js/mermaid/issues/8196) reports
  different comment removal in detection and preprocessing; it does not
  establish a pie-specific maintainer defect judgment for this case.

For gitgraph,
[gitgraph.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/gitgraph.md)
documents the header and commands. Issue/PR searches on 2026-10-23 used
`gitGraph`, `gitGraph directive`, `gitGraph YAML`, `gitGraph semicolon`,
`gitGraph keyword`, `gitGraph duplicate` and `gitGraph cherry-pick`. No
inspected result settles this common boundary behavior.
[#4838](https://github.com/mermaid-js/mermaid/issues/4838) is closed with
Status: Approved; merged
[#6707](https://github.com/mermaid-js/mermaid/pull/6707) adds a duplicate-id
warning. These facts do not justify any additional divergence.

- Info has no dedicated syntax page. The pinned
  [syntax reference](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/intro/syntax-reference.md)
  describes diagram declarations and percent comments. Searches of issues and
  pull requests on 2026-10-23 used `info showInfo`, `info directive`,
  `info semicolon` and `info accTitle`.
  [#7601](https://github.com/mermaid-js/mermaid/issues/7601) reports
  info/showInfo rendering and was open with Type: Bug / Error and Status:
  Triage. No inspected result establishes an info-specific maintainer decision
  to reject this syntax; this section follows the existing direct rule.
