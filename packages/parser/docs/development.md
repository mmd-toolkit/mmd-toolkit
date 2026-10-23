# Developing the parser

Japanese version: [development.ja.md](./development.ja.md)

For how the parser is tested, see [`testing.md`](./testing.md).

## The parser is the reference implementation of the specification

- Every behavior comes from the specification in
  [`@mmd-toolkit/spec`](../../spec): [`common.md`](../../spec/docs/common.md),
  [`ast.md`](../../spec/docs/ast.md),
  [`detection.md`](../../spec/docs/detection.md), and the diagram documents
  under [`diagrams/`](../../spec/docs/diagrams).
- The tokens and the positions of the tree are specified in this package:
  [`tokens.md`](./tokens.md) and [`positions.md`](./positions.md).
- The fixtures of [`@mmd-toolkit/tests`](../../tests) belong to the
  specification too.
- The source of mermaid.js is not a source of behavior for this package.
- Where the specification is silent, the gap is reported to the specification,
  not filled here.

## What is implemented

The parts shared by every diagram are implemented from the specification, and
read from the source text directly:

- line terminators;
- HTML attribute quotes;
- frontmatter;
- directives;
- comment lines;
- leading whitespace;
- the `style` and `classDef` line rule;
- entities;
- the end of the text;
- diagram type detection, for every diagram type of mermaid.js 12.0.0.

The diagram bodies implemented so far are the `error` pseudo-diagram, the
flowchart (`flowchart-v2`, `flowchart-elk`, and `swimlane`), the sequence
diagram (`sequence`), the class diagram (`classDiagram`), the state diagram
(`stateDiagram`), the entity relationship diagram (`er`), the Gantt chart
(`gantt`), the user journey diagram (`journey`), the requirement diagram
(`requirement`), the mindmap (`mindmap`), the timeline (`timeline`), the sankey
diagram (`sankey`), the XY chart (`xychart`), the quadrant chart
(`quadrantChart`), the block diagram (`block`), the kanban diagram (`kanban`),
C4 (`c4`), venn (`venn`), Ishikawa (`ishikawa`), agentflow (`agentflow`), and
usecase (`usecase`), and pie (`pie`). Every other detected type throws
`UnsupportedDiagramError`.

## How a diagram's parser is built

The parser of each diagram follows its document,
[`diagrams/flowchart.md`](../../spec/docs/diagrams/flowchart.md),
[`diagrams/sequence.md`](../../spec/docs/diagrams/sequence.md),
[`diagrams/class.md`](../../spec/docs/diagrams/class.md),
[`diagrams/state.md`](../../spec/docs/diagrams/state.md),
[`diagrams/er.md`](../../spec/docs/diagrams/er.md),
[`diagrams/gantt.md`](../../spec/docs/diagrams/gantt.md),
[`diagrams/journey.md`](../../spec/docs/diagrams/journey.md),
[`diagrams/requirement.md`](../../spec/docs/diagrams/requirement.md),
[`diagrams/mindmap.md`](../../spec/docs/diagrams/mindmap.md),
[`diagrams/timeline.md`](../../spec/docs/diagrams/timeline.md),
[`diagrams/sankey.md`](../../spec/docs/diagrams/sankey.md),
[`diagrams/xychart.md`](../../spec/docs/diagrams/xychart.md),
[`diagrams/quadrant.md`](../../spec/docs/diagrams/quadrant.md),
[`diagrams/block.md`](../../spec/docs/diagrams/block.md),
[`diagrams/kanban.md`](../../spec/docs/diagrams/kanban.md),
[`diagrams/c4.md`](../../spec/docs/diagrams/c4.md),
[`diagrams/venn.md`](../../spec/docs/diagrams/venn.md), or
[`diagrams/ishikawa.md`](../../spec/docs/diagrams/ishikawa.md), or
[`diagrams/agentflow.md`](../../spec/docs/diagrams/agentflow.md), or
[`diagrams/usecase.md`](../../spec/docs/diagrams/usecase.md), or
[`diagrams/pie.md`](../../spec/docs/diagrams/pie.md). It has three parts:

- a lexer that divides the diagram text into units, under
  `src/diagrams/<diagram>/units.ts`;
- a recursive-descent parser over the units, under
  `src/diagrams/<diagram>/grammar.ts`;
- the tokens that the diagram's token document, such as
  [`tokens/flowchart.md`](./tokens/flowchart.md), defines, recorded from the
  units.

What every diagram's lexer and parser do in the same way is in one place each: a
unit and how it is read (`src/diagram-units.ts`), the stack of contexts of the
lexer, with the first rule of the current context at each place and the error
when the text ends in a context that may not end there (`UnitLexer` in
`src/unit-lexer.ts`), reading the units, the place of a node, the written text
of a value, the shared leaf nodes, and the tokens of an item of the grammar
(`UnitGrammar` in `src/unit-grammar.ts`), and the empty forms of
`tokenless-empty-forms` (`src/empty-forms.ts`). A rule that two diagram
documents share is in one place too: the direction line of flowchart, class,
state, ER, and requirement (`src/direction-line.ts`), whose words state, ER, and
requirement compare case-insensitively, and the Unicode letters of the letter
rules of flowchart and class (`src/unicode-letters.ts`). A diagram whose lexer
reads diagram comments, as the sequence lexer reads `#` and `%`, the class lexer
`%%`, the state lexer `#` and `%%`, the Gantt lexer `%`, the journey,
requirement, and timeline lexers `#` and `%`, and the mindmap, kanban, C4, venn,
and Ishikawa lexers `%%`, hands them to the common part, which records them in
`Root.comments`, cut at the comment regions that lie inside them, as tokens are.
The rejections that mermaid.js makes while it builds the Db are made by the
parser after the grammar: `subgraph-members.ts` for the flowchart, and
`db-rejections.ts` for the sequence diagram, the class diagram, and the state
diagram; the Gantt grammar makes its two where it reads the statement, since a
`topAxis` statement makes no node, the mindmap grammar its two where it reads
the line, as it places each node in the tree by its indentation when it reads
it, the kanban grammar its two while keeping a flat list of node lines, and the
timeline grammar its one where it reads the event statement. The class lexer
divides each member line into its parts with the steps of
[Member lines](../../spec/docs/diagrams/class.md#member-lines)
(`src/diagrams/class/member-lines.ts`), both in a class body and in the label of
a member statement, and rejects a method line that cannot be divided.

The Db id of a flowchart subgraph is made in one place,
`src/diagrams/flowchart/subgraph-ids.ts`, from the units: the range of its name
text and the rule of the id of a subgraph in
[Rejections outside the grammar](../../spec/docs/diagrams/flowchart.md#rejections-outside-the-grammar).
The grammar reads it for the members of a subgraph, for the rejections that
mermaid.js makes while it builds the Db.

It reads the diagram text without its directives. The tokens are cut at the
directives and at the `;` that the line rule ignores when they are recorded
([A directive is a token boundary](../../spec/docs/common.md#a-directive-is-a-token-boundary)
and
[`style` and `classDef` lines](../../spec/docs/common.md#style-and-classdef-lines)),
and at the comment regions that the units read through
([`tokens.md`, Comment](./tokens.md#comment)), whose directives before the
comment's `%%` are then outside every token; the pieces of a `String` token are
`StringFragment` tokens. Only a `RawText` token and a `String` token may be cut:
a directive or an ignored `;` inside a token of another kind makes the input
rejected, at the directive or the `;`, which `SourceLexer.recordTokens` decides
for every diagram in one place. Each directive outside the tokens and the
comments is recorded as a `Directive` token of its own. The frontmatter is
recorded first, as its opening `---`, its body, and its closing `---`
([`ast.md`, Frontmatter](../../spec/docs/ast.md#frontmatter)).

The C4 grammar checks `__proto__` keys in consumed argument positions and
retains only aliases and relationship endpoints to decide whether update targets
exist.

The venn lexer tracks implicit text mode across line starts. Its grammar keeps
converted set names to check union members against earlier declarations, while
the tree keeps written values.

The Ishikawa grammar retains written indentation and selects parents using the
first cause's indentation, independently of the root's indentation. [fixture:
ishikawa/db-indent-clamped] [fixture: ishikawa/db-indent-root-deeper]

## Tools

`tools/` holds scripts for working on the parser. They are not built and not
published. The scripts of `package.json` run them with
`node --conditions=source`, so that `@mmd-toolkit/tests` is read from its
source, as the tests read it. Run them in `packages/parser`:

- `pnpm run show-trees <diagram> <fixture>...`: prints the input and the tree of
  each fixture's `ast.json`, one node per line, indented under its parent. A
  line has the node's plain fields, such as a direction or the markers of an
  arrow. For a node with a written value, it also has the value and the range,
  and the source text of the range when that differs from the value. The tokens
  follow. For a fixture that the parser rejects, it prints the error of its
  `parse-error.json`: the message, the range, and the source text of the range.
- `pnpm run diff-trees <copy> <diagram>`: `<copy>` is a copy of
  `packages/tests/fixtures/<diagram>` taken before a change. It compares the
  parse results, `ast.json` and `parse-error.json`. It prints the files that are
  new or removed, such as `new: <fixture>/parse-error.json` for an input that is
  rejected now. It then prints how many fixtures have each kind of difference:
  the same field of the same node type, or of the error, with the list indexes
  left out. Each difference follows, with the value before and after.

The agentflow lexer and grammar have their own files under
`src/diagrams/agentflow/`. Both it and flowchart use `GraphUnitLexer` in
`src/graph-unit-lexer.ts` for identical lexical rules and `GraphGrammar` in
`src/graph-grammar.ts` for identical productions, including data, shapes, and
callbacks. Each diagram constructs its own AST nodes and keeps its own arrow
vocabulary, comment rules, name grammar, and brace conversion. The existing
shared reader, direction-line rule, and Unicode-letter helper are also reused.
Its text wrapper folds only line whitespace immediately followed by the first LF
after a closing brace. [fixture: agentflow/lex-brace-string-keeps-blank-line]
[fixture: agentflow/lex-brace-line-whitespace-ls] [fixture:
agentflow/lex-brace-ls-without-lf]

At or below the default 50000 normalized UTF-16 code units after frontmatter and
directive removal, SourceLexer reads line segments without removing common
comment regions; agentflow reads leading trivia and its own comments. Above the
limit it uses the common comment-removal path. [fixture:
agentflow/comment-default-size-equal-crlf] [fixture:
agentflow/comment-default-size-above-crlf] [fixture:
agentflow/comment-default-size-equal-inline-directive] [fixture:
agentflow/comment-default-size-above-frontmatter]

The usecase lexer tries its default rules in specification order and uses
exclusive JSON and stereotype contexts. Its grammar retains authored
occurrences, parses native metadata properties and CSS declarations, and checks
namespace, declaration compatibility, endpoint kinds and final metadata in
`src/diagrams/usecase/rejections.ts`. JSON table bodies remain opaque; only the
specified brace/string balancing finds their end. [fixture:
usecase/db-all-fields] [fixture: usecase/lex-keyword-longer-number] [fixture:
usecase/gram-native-final-invalid-then-valid] [fixture:
usecase/div-json-balanced-invalid-array]

The pie lexer implements the first-match rules in the specification's priority
order, including composite common forms and hidden YAML/DIRECTIVE forms that
consume one following LF. Its grammar owns retained forms in their specified
source gaps and rejects section values below zero after double conversion.
Detection passes one frontmatter-shaped block once, retaining it for pie, and
pie also reads second-scan directives; detection's bare lines remain comments.
[fixture: pie/db-all-fields] [fixture: pie/frontmatter-nonleading-comment]
[fixture: pie/lex-hidden-directive-second-detection-scan] [fixture:
pie/lex-hidden-before-colon-lf] [fixture:
pie/review-hidden-directive-after-title] [fixture: pie/number-negative]
[fixture: pie/number-negative-zero]
