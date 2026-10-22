# Building the Db from a tree

Japanese version: [db-from-tree.ja.md](./db-from-tree.ja.md)

This document explains `dbFromTree()` of `@mmd-toolkit/tests`: it builds the Db
summary that a recorded tree denotes, and so checks a tree against what
mermaid.js records for the same input, without running a parser.

## Why

A fixture records two things about an input: what mermaid.js makes of it (the Db
in `expected.json`, or in `specified.json` where the specification reads the
input differently), and the tree that a parser makes of it (`ast.json`). The two
have to agree: the tree is right when the Db it denotes is the Db of mermaid.js.
`dbFromTree()` makes that check a function of the recorded files alone, so that

- a parser is tested against its tree (`parse(input)` equals `ast.json`), and
  the tree is tested against mermaid.js here, each in the package that owns it,
- a parser in another language has no Db to build: it has to give the tree that
  `ast.json` records, and nothing else.

## What it reads

```ts
dbFromTree(text, tree, embedded, isColor)
```

- `text` is the input as written.
- `tree` is the content of `ast.json`, a `DbTreeRoot`. The types in
  `src/db-from-tree/*-tree.ts` list the fields that the Db reads, and no others;
  they are the fields that an implementation has to give. The tree is plain
  JSON: the function does not use a parser, a lexer, or the units of either. It
  reads the fields without checking them: a tree that lacks one is found by
  [checkTree()](./check-tree.md), and the reading of such a tree fails with the
  error of the missing field.
- `embedded` holds the values that mermaid.js derives from the embedded data of
  the input, which a tree does not hold (see
  [embedded-data.md](./embedded-data.md)). A fixture gives them through
  `embeddedValuesOf()`. Its configuration also decides the
  [replacement of characters](#the-replacement-of-characters).
- `isColor` answers whether the colour candidate of a sequence `box` is a
  colour. That is the answer of a browser and is not in the text; the tests give
  `cssSupportsColor()` of `@mmd-toolkit/tests`, the stand-in that the normalizer
  uses too.

## The converted form

The Db is built from the values of the tree as mermaid.js reads them, and not as
the author wrote them. A tree keeps the written text (ast.md, Nodes), so the
function reads the text again for the **converted form** of
[common.md, Reading a source](../../spec/docs/common.md#reading-a-source): each
line terminator as `\n`, each attribute quote as `'`, and each entity as its
placeholder, for the characters outside directives, comment regions, and the `;`
that the line rule ignores. The directives and the comment lines are found in
the text itself, with the rules of common.md, Where a directive is, and Comment
lines (`scanSource()` in `src/source-scan.ts`, which the check of a recorded
tree uses too, so that the rules are written once): a directive and what its
scan takes after it, and a comment line, which is a `%%` with only whitespace
and directives between it and a comment start, and with a character after it
that is not `{` or a line terminator, from the earliest such comment start to
the end of its line. [fixture: common/comment-bare-then-u2028] [fixture:
common/comment-bare-then-u2029] Any other `%%` is diagram text. The tree gives
what the text cannot give alone:

- the `IgnoredSemicolon` tokens, since which `;` the line rule ignores depends
  on the line segment and on the diagram,
- the end of the frontmatter, where the text starts.

Leading whitespace is not read, and the end of the text is one more `\n`. In
flowchart, the whitespace after a `}` up to its last line feed is one line feed.
Agentflow retains leading whitespace and lexical comments at or below the
default size limit, and folds only line whitespace through the immediately
following LF after a brace; its precise conversion and Name.parts reading are in
[db-from-tree/agentflow.md](./db-from-tree/agentflow.md). [fixture:
agentflow/comment-default-size-equal] [fixture:
agentflow/comment-default-size-fallback] [fixture:
agentflow/lex-brace-string-keeps-blank-line] [fixture:
agentflow/lex-flow-name-click-state]

HTML attribute-quote positions are found once over the whole source after the
frontmatter, before comments and directives are removed. A tag can start in a
comment or an earlier statement, outside the value being read. The shared
conversion helper applies those positions to each value range; the tree keeps
its written quotes. [fixture: venn/db-html-tag-from-title-name] [fixture:
venn/db-html-tag-from-title-label] [fixture: venn/db-html-tag-from-title-style]
[fixture: venn/db-html-tag-from-comment-name] [fixture:
venn/db-html-tag-across-names] [fixture: c4/db-html-tag-from-earlier-text]
[fixture: kanban/db-html-tag-from-earlier-text] [fixture:
kanban/db-html-tag-from-earlier-text-data] [fixture:
block/db-html-tag-from-earlier-text] [fixture:
quadrant/db-html-tag-from-earlier-text] [fixture:
sankey/db-html-tag-from-earlier-text] [fixture:
sankey/db-html-tag-from-earlier-text-quoted] [fixture:
xychart/db-html-tag-from-earlier-text]

Characters inside a diagram comment are not read the way a lexer reads them: the
Db has no value that contains a comment. For the same reason, an entity or the
`;` that the line rule ignores inside a diagram comment does not count. The
tests do not compare the characters inside comments.

## Where the tree gives the text

Some Db values need the text of a range that a node does not give directly. They
are read from the tree like this:

- **Sequence participant ids**: the converted form of the whole range of the
  identifier, since the whitespace that a directive in the id has on its sides
  is part of it (the rule is in
  [db-from-tree/sequence.md](./db-from-tree/sequence.md)).
- **Class names**: the converted form of the tokens of a `ClassIdentifier`
  (`RawText` tokens), joined, without the whitespace between them (the name
  text, the written name, and the id are defined in
  [Rejections outside the grammar](../../spec/docs/diagrams/class.md#rejections-outside-the-grammar),
  and the type of a written name in **Names** in
  [db-from-tree/class.md](./db-from-tree/class.md)).
- **Class styles**: the converted form of the texts of the tokens of the
  `ClassLiteral`, joined, split at each `,` (the rules are **Styles** in
  [db-from-tree/class.md](./db-from-tree/class.md)). The tokens of a style carry
  the whitespace that mermaid.js reads as part of the value next to a directive
  (tokens.md, A token that a directive cuts), and not the whitespace between its
  units, so the texts of the tokens joined are the value.
- **ER styles**: the converted forms of the tokens inside the `ErLiteral` of a
  style, joined, since the whitespace between the units of a style is no part of
  its value (the rule is in [db-from-tree/er.md](./db-from-tree/er.md)).
- **Requirement styles**: the converted forms of the tokens inside the
  `RequirementLiteral` of a style, joined, since the whitespace between the
  units of a style is no part of its value (the rule is in
  [db-from-tree/requirement.md](./db-from-tree/requirement.md)). [fixture:
  requirement/lex-style-spaces] [fixture: requirement/lex-style-no-comma]
- **Xychart texts**: the converted forms of the tokens inside an
  `XychartLiteral` of a title, an axis, a category, or a plot, joined, since the
  whitespace between the units of a text without quotes is no part of its value
  (the rule is in [db-from-tree/xychart.md](./db-from-tree/xychart.md)).
  [fixture: xychart/db-title-bare-words]
- **Quadrant texts**: the converted form of the range of a `QuadrantLabel` or of
  a `QuadrantLiteral`, with the whitespace between the units of a text without
  quotes, since mermaid.js reads the space units into the text (the rule is in
  [db-from-tree/quadrant.md](./db-from-tree/quadrant.md)). [fixture:
  quadrant/db-quadrant-spaces-trimmed]
- **Venn declarations**: names, labels, numbers, style values and titles use
  their written values and converted leaf ranges; null text targets use the
  latest subset after `checkTree` validates implicit mode (the steps are in
  [db-from-tree/venn.md](./db-from-tree/venn.md)). [fixture: venn/db-all-fields]
- **Usecase occurrences**: declarations, native metadata and references rebuild
  the stored model; JSON values and property order come only from source-ordered
  embedded effects (the steps are in
  [db-from-tree/usecase.md](./db-from-tree/usecase.md)). The common sanitizer
  reaches accessibility strings; stored element text bypasses it. [fixture:
  usecase/db-all-fields] [fixture: usecase/db-json-source-map-order] [fixture:
  usecase/config-security-other]
- **C4 calls**: arguments, titles and accessibility texts use only their value
  nodes and converted node ranges; nested bodies determine the boundary stack,
  and named attributes update the complete own attribute bags (the steps are in
  [db-from-tree/c4.md](./db-from-tree/c4.md)). [fixture: c4/db-all-fields]
- **Kanban rows**: ids, labels, and icons use only their node ranges and written
  values; the flat body determines membership, and each adjacent data suffix
  consumes one embedded effect (the steps are in
  [db-from-tree/kanban.md](./db-from-tree/kanban.md)). [fixture:
  kanban/db-sections-items] [fixture: kanban/db-metadata-two-items]
- **Block directions, classes, and styles**: directions, class ids, and styles
  are the converted texts of their literals, which hold the whitespace around
  the commas (the rules are in
  [db-from-tree/block.md](./db-from-tree/block.md)). [fixture:
  block/db-arrow-spaces] [fixture: block/db-class-apply-list-spaces] [fixture:
  block/db-style-spaces]
- **Mindmap labels**: the converted form of the range of a `MindmapLabel`,
  without the delimiters of a string or a markdown string, which are cut from
  the converted form, one character at each end for a string and two for a
  markdown string (the rule is in
  [db-from-tree/mindmap.md](./db-from-tree/mindmap.md)). [fixture:
  mindmap/db-shape-string] [fixture: mindmap/db-shape-markdown-string]
- **ER keyword statements in a subgraph**: the text of the first token of a
  `class`, `classDef`, or `style` statement, as written, which a subgraph lists
  as a node (the rule is **Subgraphs** in
  [db-from-tree/er.md](./db-from-tree/er.md)).
- **Gantt list tokens**: the converted form of the text from the start of the
  first item to the end of the last item of an `includes` or `excludes`
  statement, in lower case as a whole and split at whitespace and commas, since
  the lower case of a Greek capital sigma depends on the characters around it
  (the rule is in [db-from-tree/gantt.md](./db-from-tree/gantt.md)).
- **State alias without a second description**: whether the statement holds a
  `:` token.
- **State note position**: the two `Keyword` tokens of the statement after
  `note`, `left` or `right` and `of`, as written, with the one space between
  them that mermaid.js reads.
- **Flowchart strings**: the delimiters of a string, or of a markdown string,
  that a node starts with are left out of its value. The tree has the tokens of
  the string and not the contexts the lexer is in, so the contexts are read
  again from the converted form, by the rules of
  [diagrams/flowchart.md, Strings](../../spec/docs/diagrams/flowchart.md): the
  opening `"` enters the markdown context when a backtick follows it, the string
  ends when the contexts are left, and the content is the one run between the
  delimiters. A `"` that is an attribute quote is a `'` there. [fixture:
  flowchart/db-markdown-string-attribute-quote] A comment region that cuts the
  tokens of a string is not there. [fixture:
  flowchart/lex-comment-line-in-markdown-string]
- **Flowchart subgraph names**: the name text is the converted form from the
  start of the name to the end that the rule gives (the rule is **Subgraph
  members** in
  [Rejections outside the grammar](../../spec/docs/diagrams/flowchart.md#rejections-outside-the-grammar)),
  without the string delimiters and the leading empty description blocks.
  Comment regions, directives, and the `;` that the line rule ignores are not in
  the converted form, and the whitespace after a `}` is one line feed in it, so
  none of them ends the name. [fixture:
  flowchart/lex-comment-line-in-markdown-subgraph-name]
- **Flowchart and Agentflow edges**: a limit of `maxEdges` is checked on the
  tree by `exceedsMaxEdges()`, since a parser does not know the configuration.
  The function reads a `maxEdges` that is a non-negative integer, as the maximum
  number of edges that the configuration documents; its result for any other
  value is not defined (under a `maxEdges` of 1.5, mermaid.js accepts two edges
  and the function rejects them, and a `maxEdges` of `Infinity` makes
  `runMermaid()` throw, so there is no result to compare with). The limit 0
  rejects the first edge, and an input with no edge is accepted under it.
  [fixture: flowchart/config-max-edges-zero-exceeded] [fixture:
  flowchart/config-max-edges-zero-no-edge]

## The replacement of characters

mermaid.js passes each text that its Db keeps through
[`sanitizeText`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/common.ts#L85-L97).
The runner of the corpus disables DOMPurify, so what remains is
[`sanitizeMore`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/common.ts#L70-L83)
(see [expected-results.md](./expected-results.md), What remains). It depends on
the configuration alone, which `embedded.config` holds in full (the site
configuration, the frontmatter, and the directives), so `dbFromTree()` makes it
in one place, `textReplacementOf()` (`src/db-from-tree/text-replacement.ts`),
and each diagram applies it to the texts below.

**When.** The replacement is made when HTML labels are enabled and
`securityLevel` is none of `strict`, `loose`, `antiscript`, and `sandbox`.

- Each of the four values keeps the text as written. [fixture:
  flowchart/config-security-level-strict-label-characters] [fixture:
  flowchart/config-security-level-loose-label-characters] [fixture:
  flowchart/config-security-level-antiscript-label-characters] [fixture:
  flowchart/config-security-level-sandbox-label-characters]
- Any other value changes the text. The value is compared as written, so
  `Loose`, the empty text, and a number are none of the four. [fixture:
  flowchart/config-security-level-other-label-characters] [fixture:
  flowchart/config-security-level-capitalized-label-characters] [fixture:
  flowchart/config-security-level-empty-label-characters] [fixture:
  flowchart/config-security-level-number-label-characters]
- Only the site configuration sets `securityLevel`: a directive or the
  frontmatter that sets it does not change the value. [fixture:
  flowchart/config-security-level-other-security-level-directive-strict]
  [fixture:
  flowchart/config-security-level-loose-security-level-directive-other]
  [fixture:
  flowchart/config-security-level-loose-security-level-frontmatter-other]
- HTML labels are enabled by the root `htmlLabels` when it is set (neither
  missing nor `null`), by `flowchart.htmlLabels` when the root one is not set,
  and otherwise they are enabled. [fixture:
  flowchart/config-security-level-other-html-labels-false] [fixture:
  flowchart/config-security-level-other-flowchart-html-labels-false] [fixture:
  flowchart/config-security-level-other-html-labels-true-flowchart-false]
  [fixture:
  flowchart/config-security-level-other-html-labels-false-flowchart-true]
  [fixture:
  flowchart/config-security-level-other-html-labels-null-flowchart-false]
- A value disables them when it is `false` or when its text, without the
  whitespace at its ends and in lower case, is `false`, `null`, or `0`; the
  number 0 has the text `0`. [fixture:
  flowchart/config-security-level-other-html-labels-false-text] [fixture:
  flowchart/config-security-level-other-html-labels-zero] [fixture:
  flowchart/config-security-level-other-html-labels-zero-text] [fixture:
  flowchart/config-security-level-other-html-labels-null-text] [fixture:
  flowchart/config-security-level-other-html-labels-false-spaced-upper]
  [fixture:
  flowchart/config-security-level-other-flowchart-html-labels-false-text]
  [fixture: flowchart/config-security-level-other-flowchart-html-labels-zero]
  Any other value, such as `true`, `no`, and the empty text, leaves them
  enabled. [fixture:
  flowchart/config-security-level-other-html-labels-true-text] [fixture:
  flowchart/config-security-level-other-html-labels-no-text] [fixture:
  flowchart/config-security-level-other-html-labels-empty-text]
- The configuration is the one of the text, so a directive or the frontmatter
  can set `htmlLabels`, and a directive overrides the site configuration.
  [fixture: flowchart/config-security-level-other-html-labels-false-directive]
  [fixture: flowchart/config-security-level-other-html-labels-false-frontmatter]
  [fixture:
  flowchart/config-security-level-other-flowchart-html-labels-false-directive]
  [fixture:
  flowchart/config-security-level-other-html-labels-true-directive-over-site]
- The same configuration decides in the other diagram types, and `flowchart`
  there is the key of the configuration, not the diagram. [fixture:
  class/config-security-level-other-html-labels-false] [fixture:
  class/config-security-level-other-flowchart-html-labels-false] [fixture:
  state/config-security-level-other-html-labels-false] [fixture:
  sequence/config-security-level-other-html-labels-false] [fixture:
  class/config-security-level-loose-label-and-name] [fixture:
  state/config-security-level-loose-description-and-id] [fixture:
  sequence/config-security-level-loose-title-and-box] [fixture:
  er/config-security-level-other-subgraph-title-html-labels-false] [fixture:
  gantt/config-security-level-other-html-labels-false] [fixture:
  journey/config-security-level-other-html-labels-false] [fixture:
  requirement/config-security-level-other-html-labels-false] [fixture:
  mindmap/config-security-level-other-html-labels-false] [fixture:
  timeline/config-security-level-other-html-labels-false]

**What.** The replacement writes each line break tag as `#br#`, then each `<`,
`>`, and `=` as `&lt;`, `&gt;`, and `&equals;`, and then each `#br#` as `<br/>`,
so a `#br#` that the author wrote is `<br/>` too. A line break tag is `<`, an
optional `/`, `br` in any case, whitespace, an optional `/`, and `>`. [fixture:
flowchart/config-security-level-other-line-breaks] [fixture:
flowchart/config-security-level-other-line-breaks-spaced] The tags are found
before the `#br#` are replaced, from left to right without overlap. [fixture:
flowchart/config-security-level-other-placeholder-repeated] The directives are
taken out of the text before the replacement, so a directive inside a line break
tag, or inside a `#br#` that the author wrote, does not keep it from being
replaced. [fixture:
flowchart/config-security-level-other-line-break-directive-inside] [fixture:
flowchart/config-security-level-other-placeholder-directive-inside]

**Which texts.** The replacement is made on the text that mermaid.js passes to
`sanitizeText`, and on no other. The texts that it reaches, and those that it
does not, are:

- Flowchart: the label of a vertex and the text of a link, with the text of a
  markdown string and of a string whose quotes are removed after it; the title
  of a subgraph, which is its name when it has no title; the tooltip; the title
  of the frontmatter; `accTitle`; `accDescr`, of a line and of a block.
  [fixture: flowchart/config-security-level-other-label-characters] [fixture:
  flowchart/config-security-level-other-edge-label] [fixture:
  flowchart/config-security-level-other-markdown-label] [fixture:
  flowchart/config-security-level-other-quoted-label] [fixture:
  flowchart/config-security-level-other-subgraph-title] [fixture:
  flowchart/config-security-level-other-subgraph-name-line-break] [fixture:
  flowchart/config-security-level-other-tooltip] [fixture:
  flowchart/config-security-level-other-diagram-title] [fixture:
  flowchart/config-security-level-other-acc-title] [fixture:
  flowchart/config-security-level-other-acc-descr] [fixture:
  flowchart/config-security-level-other-acc-descr-block] The id of a vertex that
  is its text, the id of a subgraph, and the label that a data block sets are
  not reached. [fixture: flowchart/config-security-level-other-id-as-text]
  [fixture: flowchart/config-security-level-other-subgraph-name-line-break]
  [fixture: flowchart/config-security-level-other-data-block-label]
- Class: the title, `accTitle`, and `accDescr`; the label of a class; the
  generic type, and the text of the class that holds it; the id of a class; an
  attribute, a method with its parameters and its return type, and an annotation
  in the body of a class; the cardinalities and the label of a relation; the
  tooltip of a click, a link, and a callback. [fixture:
  class/config-security-level-other-diagram-title] [fixture:
  class/config-security-level-other-acc-title] [fixture:
  class/config-security-level-other-acc-descr] [fixture:
  class/config-security-level-other-acc-descr-block] [fixture:
  class/config-security-level-other-class-label] [fixture:
  class/config-security-level-other-generic-type] [fixture:
  class/config-security-level-other-member-attribute] [fixture:
  class/config-security-level-other-member-method] [fixture:
  class/config-security-level-other-member-annotation] [fixture:
  class/config-security-level-other-relation-titles] [fixture:
  class/config-security-level-other-tooltip] The text of a note is not reached.
  [fixture: class/config-security-level-other-note-as-written] The annotation of
  a statement, and the target of a link, have none of the characters that the
  replacement changes. [fixture:
  class/config-security-level-other-annotation-statement]
- State: the title, `accTitle`, and `accDescr`; the label and the descriptions
  of a state, the text of a note, and the label of a transition. The URL and the
  tooltip of a click are not reached. [fixture:
  state/config-security-level-other-diagram-title] [fixture:
  state/config-security-level-other-acc-title] [fixture:
  state/config-security-level-other-acc-descr] [fixture:
  state/config-security-level-other-acc-descr-block] [fixture:
  state/config-security-level-other-description] [fixture:
  state/config-security-level-other-alias] [fixture:
  state/config-security-level-other-note] [fixture:
  state/config-security-level-other-transition-label] [fixture:
  state/config-security-level-other-click-as-written]
- Sequence: the title, of the frontmatter and of a `title` statement;
  `accTitle`; `accDescr`; the name of a box; the links and the properties of a
  participant. The description of a participant, the text of a message, of a
  note, and of a block are not reached. [fixture:
  sequence/config-security-level-other-diagram-title] [fixture:
  sequence/config-security-level-other-title-statement] [fixture:
  sequence/config-security-level-other-acc-title] [fixture:
  sequence/config-security-level-other-acc-descr] [fixture:
  sequence/config-security-level-other-acc-descr-block] [fixture:
  sequence/config-security-level-other-box-name] [fixture:
  sequence/config-security-level-other-links] [fixture:
  sequence/config-security-level-other-properties] [fixture:
  sequence/config-security-level-other-texts-as-written]
- ER: the title, `accTitle`, and `accDescr`; the title of a subgraph. Names,
  aliases, the types, names, and comments of attributes, roles, the ids of
  subgraphs, the nodes of subgraphs, classes, and styles are not reached.
  [fixture: er/config-security-level-other-diagram-title] [fixture:
  er/config-security-level-other-acc-title] [fixture:
  er/config-security-level-other-acc-descr] [fixture:
  er/config-security-level-other-acc-descr-block] [fixture:
  er/config-security-level-other-subgraph-title] [fixture:
  er/config-security-level-other-names-as-written] [fixture:
  er/config-security-level-other-subgraph-node-acc-title]
- Gantt: the title, of the frontmatter and of a `title` statement; `accTitle`;
  `accDescr`, of a line and of a block. The descriptions, items, and ids of
  tasks, the section names, the values of the settings, the tokens of `includes`
  and `excludes`, and the ids, URLs, and callbacks of click statements are not
  reached. [fixture: gantt/config-security-level-other-title] [fixture:
  gantt/config-security-level-other-diagram-title] [fixture:
  gantt/config-security-level-other-acc-title] [fixture:
  gantt/config-security-level-other-acc-descr] [fixture:
  gantt/config-security-level-other-acc-descr-block] [fixture:
  gantt/config-security-level-other-names-as-written] [fixture:
  gantt/config-security-level-other-settings-as-written] [fixture:
  gantt/config-security-level-other-task-data-as-written] [fixture:
  gantt/config-security-level-other-click-as-written]
- Journey: the title, of the frontmatter and of a `title` statement; `accTitle`;
  `accDescr`, of a line and of a block. The descriptions and the scores and
  people of tasks and the section names are not reached. [fixture:
  journey/config-security-level-other-title] [fixture:
  journey/config-security-level-other-diagram-title] [fixture:
  journey/config-security-level-other-acc-title] [fixture:
  journey/config-security-level-other-acc-descr] [fixture:
  journey/config-security-level-other-acc-descr-block] [fixture:
  journey/config-security-level-other-names-as-written]
- Requirement: the title of the frontmatter; `accTitle`; `accDescr`, of a line
  and of a block. The diagram has no `title` statement. Names, ids, texts,
  types, references, the names of relationships, classes, and styles are not
  reached. [fixture: requirement/lex-title-statement] [fixture:
  requirement/config-security-level-other-title] [fixture:
  requirement/config-security-level-other-acc-title] [fixture:
  requirement/config-security-level-other-acc-descr] [fixture:
  requirement/config-security-level-other-acc-descr-block] [fixture:
  requirement/config-security-level-other-names-as-written]
- Mindmap: the id, the description, the icon, and the class of a node, which are
  all the texts of the summary. [fixture:
  mindmap/config-security-level-other-texts]
- Timeline: the title of a `title` statement; `accTitle`; `accDescr`, of a line
  and of a block. The title of the frontmatter is not read. The periods, the
  events, and the section names are not reached. [fixture:
  timeline/config-security-level-other-title-and-accessibility] [fixture:
  timeline/config-security-level-other-accessibility-block] [fixture:
  timeline/config-security-level-other-sections-periods-events]
- Sankey: the title of the frontmatter and the id of every node, which is
  replaced after it is read from its field. Nodes whose ids become equal are one
  node. [fixture: sankey/config-security-level-other-title-and-ids]
- Xychart: the title, of the frontmatter and of a `title` statement; `accTitle`;
  `accDescr`, of a line and of a block; the titles of the axes; the categories;
  the titles of the plots; and the labels that a line keeps. The orientation and
  the numbers are not reached. [fixture:
  xychart/config-security-level-other-all] [fixture:
  xychart/config-security-level-other-orientation-horizontal]
- Quadrant: the title, of the frontmatter and of a `title` statement;
  `accTitle`; `accDescr`, of a line and of a block; the texts of the axes and of
  the quadrants; and the names of the points. The class names, the coordinates,
  and the styles are not reached. [fixture:
  quadrant/config-security-level-other-all]
- Venn: only the title, including the initial frontmatter title. [fixture:
  venn/config-security-other]
- C4: title and accessibility text; shape, boundary and relationship arguments
  are not reached. [fixture: c4/config-security-level-other]
- Block: the labels of nodes, block arrows, composites, and edges; ids, classes,
  styles, and directions are not reached. [fixture:
  block/config-security-level-other-all]

**Where the order of mermaid.js matters.** Some texts are replaced before
mermaid.js reads them further, and the builders do the same.

- Class names: the id and the type of the written name of a class are replaced
  (a backquoted name can hold the characters). Names that become equal are one
  class, and every statement that names a class looks it up by the replaced id,
  in a namespace too. The written name stays in a note's `class`, and in the
  `label` and the `classId` of an interface. [fixture:
  class/config-security-level-other-name-backquoted] [fixture:
  class/config-security-level-other-name-merged] [fixture:
  class/config-security-level-other-name-lookup] [fixture:
  class/config-security-level-other-name-namespace] [fixture:
  class/config-security-level-other-name-note-and-interface-as-written]
- Class members: the replacement is made on the whole member line, before the
  visibility mark is read, so the mark and the name are replaced together: a
  line that starts with `#br#` has no visibility, and `#` followed by anything
  else is the visibility protected. [fixture:
  class/config-security-level-other-member-hash-line-break]
- State ids: the label of a state is the replaced id until a description
  replaces it, and a description replaces it only when the replacement did not
  change the id. Otherwise the replaced id stays the first description, the
  label is the replaced id, and the descriptions follow it. [fixture:
  state/config-security-level-other-id-without-description] [fixture:
  state/config-security-level-other-id-changed-with-description] [fixture:
  state/config-security-level-other-id-unchanged-with-description] [fixture:
  state/config-security-level-other-composite-id]
- Sequence links: the text of `links` is replaced, written with `&equals;` as
  `=` again, and read as JSON; the text of `properties` is replaced and read as
  JSON. The text of `link` is replaced, the position of its `@` is taken in that
  text, and the label and the URL are cut at that position from the text with
  `&equals;` as `=` again, so a `=` before the `@` moves the cut. [fixture:
  sequence/config-security-level-other-links] [fixture:
  sequence/config-security-level-other-properties] [fixture:
  sequence/config-security-level-other-link]

## The check

Venn, Agentflow and Usecase are checked with both hand-made and recorded trees.

The recorded-tree comparisons include C4, block, kanban, Venn, Agentflow,
Usecase, and their common detection fixtures, including all five C4 diagram
kinds.

`tests/db-from-tree.test.ts` builds the Db of every fixture that records a tree
and an accepted result with a Db, and requires it to be the recorded Db
(`specified.json` where there is one, else `expected.json`), key order aside. A
fixture that records neither a tree nor an error of the parser is reported: no
comparison is skipped without a word. The test fails with the name of the
fixture, and with the error of the reading when the tree lacks a field. When it
fails, the tree is wrong, the builder here is wrong, or the record (`embedded`,
`specified`) is wrong; the fixture tells which.

## Adding a diagram type

1. Write the types of the fields the Db reads in `<diagram>-tree.ts`, from the
   tree document `docs/ast/<diagram>.md` of the specification.
2. Write `<diagram>.ts` after `db-from-tree/<diagram>.md`, the steps of the
   diagram, one method for each paragraph of "Building the summary from the
   tree", and register it in `index.ts`.
3. Run the test. A failure that the tree explains is a gap of the tree document
   or of the parser; report it with the input.
