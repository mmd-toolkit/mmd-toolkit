# How the expected results are obtained

Japanese version: [expected-results.ja.md](./expected-results.ja.md)

This document explains how `runMermaid()` in `src/mermaid.ts` gets what the
pinned mermaid.js does with a text, in Node and without a DOM, and why some
values are recorded before mermaid.js would sanitize them.

## The steps of one run

`runMermaid(text, { config })` runs these steps:

1. mermaid.js's configuration goes back to its defaults
   (`mermaidAPI.globalReset()`), which also empties the list of directives the
   previous text applied. Then `mermaid.initialize(config)`
   ([`initialize`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.ts#L702-L740))
   sets the site configuration afresh, so nothing carries over from the previous
   input. Without the reset, a directive that made the previous run fail (for
   example `"theme": "base"` with a color mermaid.js cannot read) would stay in
   that list, and every later call would fail the same way: `mermaid.parse()`
   empties the list only once it starts, and `initialize()` runs before it.
2. `mermaid.parse(text)`
   ([`parse`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.ts#L96-L117))
   decides acceptance. It also applies the configuration from frontmatter and
   `%%{init}%%` directives
   ([`processAndSetConfigs`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.ts#L73-L87)).
3. `mermaidAPI.getDiagramFromText(text, { title })`
   ([`getDiagramFromText`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.ts#L742-L746))
   parses again and returns the Db. The frontmatter `title` is passed the way
   `render()` passes it
   ([`renderDiagram`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.ts#L578-L579),
   [`Diagram.fromText`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/Diagram.ts#L52-L54)),
   so the Db title matches what a rendered diagram gets. (`parse()` alone never
   sets it.) The title is extracted with a copy of mermaid.js's frontmatter
   handling
   ([`cleanupText`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L6-L17),
   [`extractFrontMatter`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/frontmatter.ts#L24-L69),
   [`frontMatterRegex`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/regexes.ts#L7-L7)),
   since mermaid.js does not export it.
4. The Db is summarized by the normalizer registered for the diagram id (see
   [db-summaries.md](./db-summaries.md)).

Calls are serialized because mermaid.js keeps global state.

Before anything else, `runMermaid()` parses a labelled flowchart and refuses to
run if that fails.

## Sanitizers are disabled

The rule is that the sanitizers are disabled: DOMPurify (see the next section)
and `@braintree/sanitize-url`. Everything else that depends on configuration is
recorded as mermaid.js does it, for example a subgraph direction inherited under
`flowchart.inheritDir`.

With DOMPurify disabled,
[`sanitizeText`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/common.ts#L85-L97)
(through
[`sanitizeMore`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/common.ts#L69-L83))
leaves text unchanged as long as `securityLevel` is one of mermaid.js's values
(`strict`, `loose`, `antiscript`, `sandbox`); for any other value it turns `<`,
`>` and `=` into character references. Summaries rely on that: within those
values, they do not depend on `securityLevel`.

`@braintree/sanitize-url` is reached through
[`utils.formatUrl()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L247-L259),
which Db classes call when they store a link. It cannot be replaced from
outside, so a Db patch registered for the diagram type (`getDbPatches()` in
`src/normalizers/index.ts`) changes the Db class, before any input is parsed, to
store the URL as written (trimmed), which is what `formatUrl()` returns under
`securityLevel: loose`. For flowchart
([`FlowDB.setLink`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L553-L562)),
`javascript:alert(1)` therefore stays as is and `https://example.com` gets no
trailing slash. The class Db does the same
([`ClassDB.setLink`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/classDb.ts#L404-L425)),
and also sets the link target to `_top` under `securityLevel: sandbox`; its
patch stores the target as written (or `_blank`), as the other levels give. In
mermaid@12.0.0, `formatUrl()` is also called by the Db of agentflow
([`agentflowDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L1014-L1014)),
which needs the same patch when its normalizer is added.

## Label text is recorded before HTML sanitization

mermaid.js sanitizes text while it parses. For example,
[`FlowDB.addVertex`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L201-L207)
passes each label through
[`sanitizeText`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/common.ts#L85-L97)
in `common.ts`, stores the result in the Db, and then strips surrounding quotes
from the sanitized text. `sanitizeText()` calls DOMPurify, directly and through
[`removeScript`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/common.ts#L62-L68),
which needs a DOM. In Node, DOMPurify has no `sanitize` or `addHook`, and
parsing any label fails.

`runMermaid()` therefore replaces `sanitize` with the identity function on the
DOMPurify instance mermaid.js imports (and makes the hook functions no-ops). The
recorded Db is the Db mermaid.js builds when DOMPurify changes nothing:

- **Affected fields**: every value that goes through `sanitizeText()`. For
  flowchart that is the vertex and edge labels, subgraph titles, tooltips, and
  the title, `accTitle` and `accDescr`.
- **Affected inputs**: only text that DOMPurify would alter, i.e. text
  containing HTML markup or `&`, `<`, `>`. For example,
  `A["a & <b onclick=x>b</b>"]` is recorded as `a & <b onclick=x>b</b>`. From
  the source of mermaid.js and DOMPurify, a browser would store
  `a &amp; <b>b</b>`; this has not been checked in a browser.
- **What remains**: the rest of `sanitizeText()`
  ([`sanitizeMore`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/common.ts#L70-L83))
  still runs. With `htmlLabels` enabled and a `securityLevel` other than
  `strict`, `loose`, `antiscript` or `sandbox`, it still replaces `<`, `>` and
  `=` with entities. Fixtures using such a `securityLevel` record the replaced
  text.
- **What implementations compare against**: the parser's Db-equivalent JSON is
  compared with these values, i.e. with text before HTML sanitization. It does
  not need to reproduce DOMPurify.

A test (`tests/mermaid.test.ts`) fails if the replacement stops reaching
mermaid.js's instance, and `runMermaid()` refuses to run if a labelled flowchart
does not parse.

## Rejection versus a missing browser feature

Every error
[`mermaid.parse()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.ts#L96-L117)
throws is recorded as a rejection, with its name and message, except an error
that shows mermaid.js reached for a browser feature Node lacks. Two kinds of
error count as such:

- any `ReferenceError`, since only a reference to an undefined global throws it;
- an error whose message matches `ENVIRONMENT_SIGNATURES` in `src/rejections.ts`
  (DOMPurify, `document`, `window`, `Option`, and other DOM names). The
  signatures are checked only for errors outside the four names mermaid.js
  throws on purpose (`Error`, `MermaidParseError`, `UnknownDiagramError`,
  `YAMLException`), because their messages quote the input.

For those, `runMermaid()` throws `MermaidEnvironmentError`: nothing is recorded
for the input, and the generator lists it and fails.

mermaid.js does reject some inputs with plain JavaScript errors. For example, an
init directive that is not an object (`%%{init: 5}%%` with `%%{wrap}%%`) throws
`TypeError: Cannot create property 'wrap' on string '5'`, and a `linkStyle`
index past the last edge throws a `TypeError` too. These are recorded as
rejections and listed by the generator for a manual check. Add a signature when
a new environment failure is found.

An error in a fixture's own site configuration (`config`), such as a color
mermaid.js cannot read, makes `mermaid.initialize()` throw. `runMermaid()` lets
that error through instead of recording a rejection: it is a broken page
setting, not a rejected input.

## Browser functions given by a stand-in

A few Db methods call a browser function while mermaid.js parses. For each, the
Db patch of the diagram type gives a stand-in for that function, only for the
duration of the call (`src/normalizers/browser-stand-ins.ts`); mermaid.js's own
processing runs as it is. The patches are applied before any input is parsed, so
no input meets an unpatched Db. In mermaid@12.0.0:

- [`SequenceDB.parseBoxData`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/sequenceDb.ts#L394-L419)
  asks `window.CSS.supports("color", word)` whether the first word of a `box`
  line (or an `rgb`, `rgba`, `hsl` or `hsla` function there) is a color. If it
  is, it becomes the box's fill and the rest of the line its name; if not, the
  fill is `transparent` and the whole line is the name. The stand-in answers
  whether the value is a valid value of the `color` property: the CSS-wide
  keywords, `currentcolor` and the system colors, current and deprecated, from
  lists in the module; any value that holds a substitution function (`var()`,
  `env()`, `attr()`); and otherwise a value that `@csstools/css-color-parser`
  reads as one color. Its answers were compared with
  `CSS.supports("color", value)` of Chromium 152 for 309 values: the first words
  of the `box` lines in the collected inputs, the named colors in several cases,
  the keywords, the current and deprecated system colors, words that are not
  colors, and right and wrong forms of `rgb()`, `rgba()`, `hsl()` and `hsla()`
  (commas and spaces, percentages, angles, `none`, alpha, missing or extra
  arguments, `calc()`, substitution functions, relative colors). All of them
  agree. Where browsers may differ (newer system colors, relative colors,
  `none`, substitution functions), the stand-in follows Chromium; Firefox and
  Safari were not checked. The same function is exported as `cssSupportsColor`
  from `@mmd-toolkit/tests/mermaid`, for an implementation that takes the answer
  from outside.
- [`SequenceDB.addDetails`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/sequenceDb.ts#L526-L546)
  reads an element of the page with `document.getElementById`. A Db method that
  reads the page is treated as on a page without the element, since the page is
  not part of the diagram's text: the stand-in finds no element, and a `details`
  statement only adds its actor.

## Running without a known divergence

`runMermaid()` and the functions beside it take the option `withoutDivergences`,
a list of identifiers of known divergences. With it, mermaid.js runs with the
lexer rules from which those divergences arise replaced, or tried in another
order, so that the lexer reads as the specification does, for the duration of
the call only. The default run, the generator and `expected.json` never use it:
they record mermaid.js as it is. An implementation uses it to check that a
difference from mermaid.js on a marked input comes from the divergences alone,
by comparing itself with mermaid.js read this way. Where the specification
differs from mermaid.js in more than one way for a diagram type, an input may
need several of them removed at once to be read as the specification does. Each
identifier counts once, and an empty list runs mermaid.js as it is. The input
may be of any diagram type; only the lexer of the diagram type a divergence
belongs to changes, so a divergence of another diagram type changes nothing. Two
divergences whose changes touch the same rule, the same rule order of a start
state, or the function that gives one lexer its text cannot be removed together:
the call throws an error that names both, since the change made last would undo
the other. Options with a key that is no option make the call throw a
`TypeError`, so that a misspelled option never runs mermaid.js as it is.

The rules are listed in `src/divergence-removals.ts` and found in the lexer of
the pinned mermaid.js by their compiled pattern, not by their position. When one
is missing or found twice, `runMermaid()` stops with `MermaidEnvironmentError`
before any input, since running without the divergence would otherwise silently
run mermaid.js as it is. A rule that is taken out is replaced by a pattern that
matches nothing, because the lexer picks the action of a rule by its position in
the list. The calls run one at a time, so a replaced rule never reaches another
call.

A rule may also be replaced by two patterns, of which the lexer uses one when it
has read only whitespace of the current line, and the other otherwise. A line
here is a line of the text after mermaid's preprocessing, which the lexer reads:
line breaks made line feeds, and the frontmatter, directives and comment lines
taken out. What the lexer has read is the text it was given without what is left
of it; when what is left is not an end of that text, because the lexer put back
text that it had not read, the call stops with `MermaidEnvironmentError` instead
of returning a result that may be wrong.

In a start state of the lexer, the rules may also be tried in another order,
with the rules that read as the specification does first; the rules themselves
do not change. Such a rule is found among the rules that only that start state
tries, since a rule that every start state tries can have the same pattern.

- `comment-takes-character`, in the sequence lexer
  ([`sequenceDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/parser/sequenceDiagram.jison#L29-L30)):
  the rule that reads a character other than `}` before `%%` together with the
  comment is taken out, so a comment starts at its `%%`; the rule for numbers
  also ends a number before `%%`, not only before a space or a line feed.
- `comment-takes-line-break`, in the class lexer
  ([`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L28-L28)):
  the rule that reads `%%`, the rest of the line and the line feeds after it
  keeps that reading only for a comment with only whitespace before it on its
  line; a comment after a unit ends at the end of its line, and the line feed
  after it is read as a line feed.
- `name-start-reads-unit`, in the class lexer
  ([`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L106-L112)):
  inside a backquoted name and a generic type, the rule that closes it and the
  rule that reads its text are tried first, so the text is read up to the
  closing mark whatever it starts with.

## The store of earlier results

`runMermaid()` and `runMermaidWithEmbeddedData()` keep each result in a store on
disk, and give a stored result back for the same text, options and code without
running mermaid.js again. The pinned mermaid.js gives the same text with the
same options the same result, so a stored result is the result of a new run; the
tests that read the same inputs again and again (the differential tests, the
generated-input tests) then spend their time on the implementation under test.

- Where: `node_modules/.cache/mmd-toolkit/mermaid-runs/` at the root of the
  repository, which git ignores: a directory for each identity of the code
  (below), in it a directory for each day (in UTC), and in that one compressed
  file per result. mermaid.js's whole configuration, which most results share,
  is kept once per day in a file named by its hash, and a result names it. A
  result is written in the directory of the day, and a result read from an
  earlier day is moved to it with its configuration, so the day of a result is
  the day it was last used. Removing `mermaid-runs/` empties the store; it fills
  again as tests run.
- What is no longer needed is removed without anyone asking, and nothing else.
  When a process first uses the store, it records in the store that this tree
  (the directory of this package, by its real path) uses the code of this tree
  (run from `src/` and from `lib/`), and removes the results of every code that
  no tree recorded in the store uses, which nothing will ever use again; it
  reads only the names at the top of the store and the records of the trees.
  Several trees use one store when they share `node_modules` (a copy of the
  repository that links to it, say): the results of a code are kept while a tree
  that is still there records it, and removed once every tree that recorded it
  has recorded another code, when it next uses the store, or is gone. The rest
  is done by a prune, which reads every name of the store and takes seconds for
  a large one, so it runs in a Node.js process of its own, started by a process
  that first uses the store when no prune runs and the last one ended more than
  ten minutes ago. A prune removes the directories of past days left with no
  result; while the store holds more than its most results, the results last
  used longest ago, a day at a time from the oldest day, but never those of the
  day; and the temporary files, older than an hour, that writes which stopped
  half-way (their process ended) left. A result is never removed only because it
  was last used long ago. When the store still holds more than its most results,
  the prune leaves a file `.full` in it, and no process writes a result while
  that file is there; until the next prune, the store may hold some more results
  than its most.
- How a directory is removed: a Node.js process of its own renames it to
  `.removed-` followed by its process id, and deletes it; it goes on after the
  process that started it ends, so that no process waits for the deleting. A
  directory whose deleting process no longer runs is given to a new one; one
  whose deleting process runs is left to it. A process that cannot be started
  leaves the directory to a later prune. Whatever fails in the store (a file
  that cannot be read, written or removed, a directory in the place of a file or
  a file in the place of a directory, options that cannot be serialized) only
  makes mermaid.js run again; it never makes a test fail. A process that cannot
  read the files of its code (the build is being made, say) runs without the
  store.
- The most results: 2,000,000, about 8 GB on disk (a result takes about 4 KB,
  the least a file takes). It was set larger than the results of the largest
  runs that could be counted, each made once: the differential tests of the
  parser at full size made 192,209 results for flowchart, sequence, class and
  state, and the generated-input tests of the formatter at full size more than
  540,000, which could not be counted to the end, since the count stopped at the
  limit then set. How much room it leaves for later runs is not measured. When
  the store reaches it, the results last used longest ago are removed first:
  results stay the same, and only runs get slower, since mermaid.js runs again
  for what was removed.
- The key: the text and the options (`config`, `withoutDivergences`), serialized
  as V8 does, which tells apart a field set to `undefined` from one left out and
  `NaN` from `null`; the files of the code that decide a result (from source,
  the files of `src/` that `mermaid.ts` imports at run time, listed in
  `RESULT_FILES` and checked by a test; from the build, every file of `lib/`);
  `pnpm-lock.yaml`; the installed version of mermaid.js; and the versions of
  Node.js and V8. A change to any of them gives new keys, so a stored result
  never outlives the code or the mermaid.js that made it. A change to the other
  files of `src/` (the loader of the fixtures, the mutation core) keeps the
  stored results.
- What is stored: the results of runs. An error thrown instead of a result
  (`MermaidEnvironmentError`, an error of the options) is not stored.
- Reading and writing: each file is written under another name and then renamed,
  so a process reading it at the same time sees the whole file or none, and is
  compressed with a checksum. A file that cannot be read, does not match its
  checksum, or holds the result of another key is no result: the run is made
  again and the file written anew.
- Turning it off: the environment variable `MMD_TOOLKIT_MERMAID_CACHE=disabled`,
  a word that every reading of YAML takes as written. Unset or empty, the store
  is used; any other value is an error, so that a value meant to turn it off
  (`off`, `0`) never leaves it on. The generator (`fixtures:generate`,
  `fixtures:check`, `add`, `add-many`) turns it off for itself, since the
  fixtures record mermaid.js itself; so does the CI workflow, and so do the
  tests of this package, which check how a run is made, but for one test of the
  store, which runs a text through the store of the repository to check that the
  run functions use it. `detectDiagramType()` does not use the store.
- Which tests to run is decided by the rules for running tests (the skill
  `conventions`), with the store or without it: the store makes a run shorter,
  not a reason to run more.

## Text size

`mermaid.parse()` does not apply `maxTextSize`; only rendering does
([`renderDiagram`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.ts#L502-L505)).
The fixtures do not apply it either.
