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
(`strict`, `loose`, `antiscript`, `sandbox`), and whatever the value when
`htmlLabels` is disabled. [fixture: flowchart/db-vertex-label-markup-as-written]
[fixture: flowchart/config-security-level-loose-line-breaks] For any other
value, with `htmlLabels` enabled, it turns `<`, `>` and `=` into character
references (`&lt;`, `&gt;`, `&equals;`) [fixture:
flowchart/config-security-level-other-label-characters] and writes every form of
the line break tag as `<br/>`: `<br>`, `<br/>`, `<br />`, `</br>`, `<BR>`, and
the `#br#` that an author writes. [fixture:
flowchart/config-security-level-other-line-breaks] Summaries rely on that:
within those values, they do not depend on `securityLevel`.

Whether `htmlLabels` is enabled is decided by the root `htmlLabels` of the
configuration when that is set, and by `flowchart.htmlLabels` only when it is
not; with neither set, it is enabled. So `flowchart.htmlLabels: false` disables
it only while the root `htmlLabels` is unset, and the root `htmlLabels: true`
enables it whatever `flowchart.htmlLabels` is. [fixture:
flowchart/config-security-level-other-html-labels-false] [fixture:
flowchart/config-security-level-other-flowchart-html-labels-false] [fixture:
flowchart/config-security-level-other-html-labels-true-flowchart-false]
[fixture:
flowchart/config-security-level-other-html-labels-false-flowchart-true]

`@braintree/sanitize-url` is reached through
[`utils.formatUrl()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L247-L259),
which Db classes call when they store a link. It cannot be replaced from
outside, so a Db patch registered for the diagram type (`getDbPatches()` in
`src/normalizers/index.ts`) changes the Db class, before any input is parsed, to
store the URL as written (trimmed), which is what `formatUrl()` returns under
`securityLevel: loose`. [fixture: flowchart/db-click-link-trimmed] [fixture:
class/db-click-link-trimmed] For flowchart
([`FlowDB.setLink`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L553-L562)),
`javascript:alert(1)` therefore stays as is and `https://example.com` gets no
trailing slash. The class Db does the same
([`ClassDB.setLink`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/classDb.ts#L404-L425)).
[fixture: class/db-click-link-javascript-url-as-written] It also sets the link
target to `_top` under `securityLevel: sandbox`; its patch stores the target as
written (or `_blank`), as the other levels give. [fixture:
class/config-security-level-sandbox-link-target] [fixture:
class/config-security-level-sandbox-link-default-target] In mermaid@12.0.0,
`formatUrl()` is also called by the Db of agentflow
([`agentflowDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L1014-L1014)),
which needs the same patch when its normalizer is added.

The gantt Db does not reach `@braintree/sanitize-url` through `formatUrl()`:
[`setLink`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L673-L688)
calls it itself unless `securityLevel` is `loose`. The Db is one object that all
gantt diagrams share, so its patch is applied to the object, and it stores the
URL as written, which is what `setLink` stores under `loose`. [fixture:
gantt/config-security-level-strict-click-href] [fixture:
gantt/config-security-level-sandbox-click-href]

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
  the title, `accTitle` and `accDescr` (one line or a block). [fixture:
  flowchart/db-edge-label-markup-as-written] [fixture:
  flowchart/db-subgraph-title-markup-as-written] [fixture:
  flowchart/db-tooltip-markup-as-written] [fixture:
  flowchart/db-title-markup-as-written] [fixture:
  flowchart/db-acc-title-markup-as-written] [fixture:
  flowchart/db-acc-descr-markup-as-written] [fixture:
  flowchart/db-acc-descr-block-markup-as-written] The same holds in the other
  diagram types, for example for the message of a sequence diagram, the label of
  a class and the description of a state. [fixture:
  sequence/db-message-markup-as-written] [fixture:
  class/db-label-markup-as-written] [fixture:
  state/db-description-markup-as-written]
- **Affected inputs**: only text that DOMPurify would alter, i.e. text
  containing HTML markup or `&`, `<`, `>`. For example,
  `A["a & <b onclick=x>b</b>"]` is recorded as `a & <b onclick=x>b</b>`.
  [fixture: flowchart/db-vertex-label-markup-as-written] From the source of
  mermaid.js and DOMPurify, a browser would store `a &amp; <b>b</b>`; this has
  not been checked in a browser.
- **What remains**: the rest of `sanitizeText()`
  ([`sanitizeMore`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/common.ts#L70-L83))
  still runs. With `htmlLabels` enabled (see above for how that is decided) and
  a `securityLevel` other than `strict`, `loose`, `antiscript` or `sandbox`, it
  still replaces `<`, `>` and `=` with entities, and every form of the line
  break tag with `<br/>`. The fixtures that use such a `securityLevel` record
  the replaced text. [fixture:
  flowchart/config-security-level-other-label-characters] [fixture:
  flowchart/config-security-level-other-line-breaks]
  [db-from-tree.md](./db-from-tree.md), The replacement of characters, states
  which texts of each diagram it reaches.
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
  `YAMLException`), because their messages quote the input. [fixture:
  flowchart/rejection-parse-error-quotes-browser-word] [fixture:
  common/rejection-unknown-diagram-quotes-browser-word] [fixture:
  common/rejection-yaml-error-quotes-browser-word]

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
  whether the value is a valid value of the `color` property. It is for the
  CSS-wide keywords, `currentcolor` and the system colors, current and
  deprecated, from lists in the module. [fixture:
  sequence/db-box-colour-css-wide-keyword] [fixture:
  sequence/db-box-colour-currentcolor] [fixture:
  sequence/db-box-colour-system-colour] [fixture:
  sequence/db-box-colour-deprecated-system-colour] It is for any value that
  holds a substitution function (`var()`, `env()`, `attr()`). [fixture:
  sequence/db-box-colour-function-substitution] It is for any other value that
  `@csstools/css-color-parser` reads as one color, such as the space-separated
  form with a slash before the alpha. [fixture:
  sequence/db-box-colour-function-space-separated-alpha] It is not for a color
  function with too few arguments, nor for the comma-separated form that mixes
  numbers and percentages. [fixture:
  sequence/db-box-colour-function-too-few-arguments] [fixture:
  sequence/db-box-colour-function-mixed-percentages] Its answers were compared
  with `CSS.supports("color", value)` of Chromium 152 for 309 values: the first
  words of the `box` lines in the collected inputs, the named colors in several
  cases, the keywords, the current and deprecated system colors, words that are
  not colors, and right and wrong forms of `rgb()`, `rgba()`, `hsl()` and
  `hsla()` (commas and spaces, percentages, angles, `none`, alpha, missing or
  extra arguments, `calc()`, substitution functions, relative colors). All of
  them agree. Where browsers may differ (newer system colors, relative colors,
  `none`, substitution functions), the stand-in follows Chromium; Firefox and
  Safari were not checked. The same function is exported as `cssSupportsColor`
  from `@mmd-toolkit/tests`, which runs no mermaid.js, for an implementation
  that takes the answer from outside.
- [`SequenceDB.addDetails`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/sequenceDb.ts#L526-L546)
  reads an element of the page with `document.getElementById`. A Db method that
  reads the page is treated as on a page without the element, since the page is
  not part of the diagram's text: the stand-in finds no element, and a `details`
  statement only adds its actor.

## Running without a known divergence

`runMermaid()` and the functions beside it take the option `withoutDivergences`,
a list of identifiers of known divergences. With it, mermaid.js runs with the
lexer rules from which those divergences arise replaced, or tried in another
order, or with its detector of C4 replaced, so that it reads as the
specification does, for the duration of the call only. The default run, the
generator and `expected.json` never use it: they record mermaid.js as it is. An
implementation uses it to check that a difference from mermaid.js on a marked
input comes from the divergences alone, by comparing itself with mermaid.js read
this way: it is to accept and reject every input as mermaid.js read this way
does, and to give it the same Db. This is available for `c4-keyword-anywhere`,
`comment-takes-character`, `comment-takes-line-break`, `name-start-reads-unit`
and `percent-brace-after-unit`. Where the specification differs from mermaid.js
in more than one way for a diagram type, an input may need several of them
removed at once to be read as the specification does. Each identifier counts
once, and an empty list runs mermaid.js as it is. The input may be of any
diagram type; a divergence of a lexer changes only the lexer of the diagram type
it belongs to, so a divergence of another diagram type changes nothing, and
`c4-keyword-anywhere` changes only how the detectors treat a text that holds a
C4 keyword after its start. Two divergences whose changes touch the same rule,
the same rule order of a start state, the function that gives one lexer its
text, or the detector of one diagram type cannot be removed together: the call
throws an error that names both, since the change made last would undo the
other. Options with a key that is no option make the call throw a `TypeError`,
so that a misspelled option never runs mermaid.js as it is.

An implementation does not have to run mermaid.js this way to know what the
specification gives: the fixtures with the mark of a divergence that changes how
mermaid.js reads an input (`c4-keyword-anywhere`, `comment-takes-character`,
`comment-takes-line-break`, `name-start-reads-unit`, `percent-brace-after-unit`,
`html-tag-in-frontmatter` and `bare-percent-line-before-header`) record it in
`specified.json`, where it differs from `expected.json`. The generator takes it
from mermaid.js read without the divergence (for `comment-takes-line-break` and
`name-start-reads-unit`, without both, since both change the class lexer; for
the three that change the gantt lexer, `comment-takes-character`,
`comment-takes-line-break` and `percent-brace-after-unit`, without all three,
since a text whose comment takes a character or a line break reaches the rule
for `%%{` through them, and running every gantt fixture without the three
changes only the fixtures that carry one of the marks; for
`c4-keyword-anywhere`, with the detector of C4 replaced, so that the text is
read as the diagram of its header). [fixture:
class/div-comment-then-statement-with-backquote-keyword] [fixture:
class/div-backquote-starts-with-keyword-then-comment] [fixture:
common/detect-c4-anywhere] [fixture: flowchart/div-c4-keyword-in-label]
[fixture: class/div-c4-keyword-as-class-name] [fixture:
state/div-c4-keyword-as-state-id] For `html-tag-in-frontmatter` it is mermaid.js
reading the input whose frontmatter has `(` where it has `<`, so that no HTML
tag starts in it. The tag may start in any key of the frontmatter, not only in
`title`; the frontmatter is found as mermaid.js finds it, which includes a
closing `---` line with blanks after it and CRLF line breaks. [fixture:
flowchart/html-tag-starts-in-frontmatter-other-key] [fixture:
flowchart/html-tag-starts-in-frontmatter-crlf] [fixture:
flowchart/html-tag-starts-in-frontmatter-closing-line-blank] The title of the Db
is the title of the frontmatter of the input as written, as
`extractFrontmatterTitle` gives it, which writes `'` for a `"` after an `=` in a
tag. [fixture: flowchart/html-tag-starts-in-frontmatter-value] The values in
`embedded` are those that mermaid.js gives for the input as written, and, where
it rejects that input, those it gives for the input with `(`: a `<` in a value
of the configuration is then recorded as `(`. The title in `embedded` is the one
of the Db. [fixture: flowchart/html-tag-starts-in-frontmatter-config-value]
Where mermaid.js accepts the input as written, they are the values of the
written input, and the input with `(` is not read: mermaid.js leaves a value
that holds `<` out of the configuration, so `embedded` has none, and not the
value with `(`. [fixture:
flowchart/html-tag-starts-in-frontmatter-config-value-accepted] When mermaid.js
rejects the input with `(`, the specified reading is the rejection
(`accepted: false` and the error). If the replacement itself made the YAML of
the frontmatter invalid, the generator stops: how that reading is made has to be
decided for the fixture. For `bare-percent-line-before-header` it is mermaid.js
reading the input without the bare `%%` lines before its header and the lines of
whitespace only among them: the specification reads them as trivia in every
diagram type, and mermaid.js hands them to the lexer of the diagram type, which
does not read them so in flowchart (a line `%%` alone, `%%{ }%%`, `%%{}`, or
`%%{-x}%%`), in state (the same lines but `%%`), and in class (a line of
whitespace only, a tab included, or a directive with whitespace around it, after
such a line). A comment line and a directive among them stay, a directive with
the lines it spans and without the whitespace around it on its line, which
mermaid.js would leave as a line of whitespace only; the frontmatter is passed
over. The title and the values in `embedded` do not depend on those lines.
[fixture: flowchart/header-after-bare-percent-line] [fixture:
flowchart/header-after-empty-braces-line] [fixture:
flowchart/header-after-non-word-brace-line] [fixture:
flowchart/header-after-empty-braces-no-space] [fixture:
state/header-after-empty-braces-line] [fixture:
state/header-after-non-word-brace-line] [fixture:
state/header-after-empty-braces-no-space] [fixture:
class/header-after-bare-percent-then-whitespace-line] [fixture:
class/header-after-empty-braces-then-whitespace-line] [fixture:
class/header-after-bare-percent-then-tab-line] [fixture:
class/header-after-bare-percent-then-indented-directive-line] The other marks
need no such file: the specification rejects what mermaid.js accepts
(`directive-as-token-boundary`, `ignored-semicolon-as-token-boundary`,
`click-reserved-word`, `tokenless-empty-forms`, `headerless-empty-ending`), or
accepts what it rejects (`embedded-data-opaque`). None of them has a removal
here, so mermaid.js is not run to read the input as the specification does, and
what the specification gives is stated by the document of the divergence in
[known-divergences](../../spec/docs/known-divergences.md).

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
taken out. [fixture: class/div-comment-then-statement-crlf] [fixture:
class/div-comment-then-statement-cr] What the lexer has read is the text it was
given without what is left of it; when what is left is not an end of that text,
because the lexer put back text that it had not read, the call stops with
`MermaidEnvironmentError` instead of returning a result that may be wrong.

In a start state of the lexer, the rules may also be tried in another order,
with the rules that read as the specification does first; the rules themselves
do not change. Such a rule is found among the rules that only that start state
tries, since a rule that every start state tries can have the same pattern.

The detector of a diagram type may be replaced instead, by another that looks
for its words at the start of the text only. mermaid.js keeps its detectors in
the order they were first registered, and registering a detector under the id of
one it has, with `mermaid.registerExternalDiagrams()`, replaces that one in its
place, so the order in which the detectors are tried is kept. The diagram of the
replaced detector is loaded first, by parsing a sample text of it, so that the
replacement needs no loader (the one it is given fails if it is ever called),
and the original detector is registered again when the call ends. Before any
input, `runMermaid()` makes this replacement once, and stops with
`MermaidEnvironmentError` unless the detectors give the diagram ids that the
removal lists for its probe texts: before the replacement, during it, and after
it. [fixture: common/detect-c4-anywhere] [fixture: common/detect-minimal-c4]

- `comment-takes-character`, in the sequence lexer
  ([`sequenceDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/parser/sequenceDiagram.jison#L29-L30)):
  the rule that reads a character other than `}` before `%%` together with the
  comment is taken out, so a comment starts at its `%%`; the rule for numbers
  also ends a number before `%%`, not only before a space or a line feed. No
  input given to mermaid.js with its own lexer can serve instead of the changed
  one: its statement state reads a character followed by `%%` as a comment
  before any rule for ids, so no input gives it an id run, as in a message,
  whose second and third characters are `%%`.
- `comment-takes-character`, in the gantt lexer
  ([`gantt.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L29-L29)):
  the rule that reads a character other than `}` before `%` together with the
  comment is taken out, so a comment starts at a `%` where a unit starts, and
  any other `%` is a character of the unit that holds it. [fixture:
  gantt/div-comment-after-task-text-start] [fixture:
  gantt/div-comment-after-keyword-start] [fixture:
  gantt/div-comment-after-semicolon-after-data] [fixture:
  gantt/lex-comment-after-two-characters] [fixture:
  gantt/lex-brace-before-percent] [fixture: gantt/lex-colon-then-percent]
- `comment-takes-character`, in the journey lexer
  ([`journey.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/user-journey/parser/journey.jison#L15-L15)):
  the rule that reads a character other than `}` before `%%` together with the
  comment is taken out, so a comment starts at a `%` where a unit starts, and
  any other `%%` is part of the unit that holds it. [fixture:
  journey/div-comment-after-task-text-start] [fixture:
  journey/div-comment-after-colon-after-section] [fixture:
  journey/div-comment-after-task-colon]
- `comment-takes-line-break`, in the class lexer
  ([`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L28-L28)):
  the rule that reads `%%`, the rest of the line and the line feeds after it
  keeps that reading only for a comment with only whitespace before it on its
  line; a comment after a unit ends at the end of its line, and the line feed
  after it is read as a line feed. [fixture:
  class/div-comment-after-name-then-statement] [fixture:
  class/div-comment-after-note-string-then-statement] [fixture:
  class/div-comment-after-click-string-then-statement]
- `comment-takes-line-break`, in the gantt lexer
  ([`gantt.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L30-L30)):
  the rule that reads `%`, the rest of the line and the line feeds after it ends
  at the end of the line, so the line feed after a comment is read as a line
  feed. [fixture: gantt/div-percent-comment-takes-line-feed-after-href]
  [fixture: gantt/div-percent-comment-takes-line-feeds-after-call] [fixture:
  gantt/lex-space-percent-comment-after-call-then-href-line]
- `percent-brace-after-unit`, in the gantt lexer
  ([`gantt.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L18-L18)):
  the rule that enters the start state `open_directive` at every `%%{` is taken
  out, so a `%%{` that starts no directive is read by the rule for comments; the
  directives themselves are taken out of the text before the lexer reads it.
  [fixture: gantt/div-percent-brace-glued-after-header] [fixture:
  gantt/div-percent-brace-after-two-spaces] [fixture:
  gantt/div-percent-brace-after-glued-percent-comment] [fixture:
  gantt/lex-percent-brace-after-tab]
- `c4-keyword-anywhere`, in the detector of C4
  ([`c4Detector.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/c4/c4Detector.ts#L10-L10)):
  the detector looks for each of the five keywords, `C4Context`, `C4Container`,
  `C4Component`, `C4Dynamic` and `C4Deployment`, at the start of the text, after
  whitespace; mermaid.js looks for `C4Context` there and for the other four
  anywhere. A text of another diagram type that holds one of the four, as a
  label, a name, or a message, is then read as the diagram of its header, as the
  specification reads it, and a text that starts with a keyword is read as
  before. [fixture: common/detect-c4-anywhere] [fixture:
  common/detect-minimal-c4] [fixture: flowchart/div-c4-keyword-in-label]
  [fixture: class/div-c4-keyword-as-class-name] [fixture:
  state/div-c4-keyword-as-state-id]
- `name-start-reads-unit`, in the class lexer
  ([`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L106-L112)):
  inside a backquoted name and a generic type, the rule that closes it and the
  rule that reads its text are tried first, so the text is read up to the
  closing mark whatever it starts with. [fixture:
  class/div-backquote-starts-with-cssclass] [fixture:
  class/div-generic-starts-with-cssclass] [fixture:
  class/div-backquote-starts-with-callback] [fixture:
  class/div-generic-starts-with-callback] [fixture:
  class/div-backquote-starts-with-link] [fixture:
  class/div-generic-starts-with-link] [fixture:
  class/div-backquote-starts-with-click] [fixture:
  class/div-generic-starts-with-click] [fixture:
  class/div-backquote-starts-with-href] [fixture:
  class/div-generic-starts-with-href] [fixture:
  class/div-backquote-starts-with-open-annotation] [fixture:
  class/div-generic-starts-with-open-annotation] [fixture:
  class/div-backquote-starts-with-close-annotation] [fixture:
  class/div-generic-starts-with-close-annotation]

## The store of earlier results

`runMermaid()` and `runMermaidWithEmbeddedData()` keep each result in a store on
disk, and give a stored result back for the same text, options and code without
running mermaid.js again. The pinned mermaid.js gives the same text with the
same options the same result, so a stored result is the result of a new run; the
tests that read the same inputs again and again (the differential tests, the
generated-input tests) then spend their time on the implementation under test. A
summary that depended on the day or on the time zone would break this; the gantt
Db computes its dates from both, so its summary leaves the dates out (see
[db-summaries.md](./db-summaries.md), gantt).

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
  runs of the time, when the tests still had runs over every input: more than
  540,000 for the generated-input tests of the formatter (the count stopped at
  the limit then set) and 192,209 for the differential tests of the parser
  (flowchart, sequence, class and state). Those runs are gone, and how much room
  the limit leaves for the tests of one size is not measured. When the store
  reaches it, the results last used longest ago are removed first: results stay
  the same, and only runs get slower, since mermaid.js runs again for what was
  removed.
- The key: the text and the options (`config`, `withoutDivergences`), serialized
  as V8 does, which tells apart a field set to `undefined` from one left out and
  `NaN` from `null`; the files of the code that decide a result (from source,
  the files of `src/` that `mermaid.ts` imports at run time, listed in
  `RESULT_FILES` and checked by a test; from the build, every file of `lib/`);
  `pnpm-lock.yaml`; the installed version of mermaid.js; and the versions of
  Node.js and V8. A change to any of them gives new keys, so a stored result
  never outlives the code or the mermaid.js that made it. A change to the other
  files of `src/` (the loader of the fixtures, the checks of trees) keeps the
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
  fixtures record mermaid.js itself; so does the workflow `NodeCI.yml`, which is
  kept in `.github/workflows_bk/` (no workflow is active at present), and so do
  the tests of this package, which check how a run is made, but for the tests of
  the store in `tests/mermaid-run-store.test.ts` that turn it on: they run a
  text through the store of the repository to check that the run functions use
  it, that an error thrown instead of a result is not stored, and that
  `detectDiagramType()` does not use the store.
- Which tests to run is decided by the rules for running tests (the skill
  `conventions`), with the store or without it: the store makes a run shorter,
  not a reason to run more.

## Text size

`mermaid.parse()` does not apply `maxTextSize`; only rendering does
([`renderDiagram`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.ts#L502-L505)).
The fixtures do not apply it either. [fixture:
flowchart/config-max-text-size-not-applied]
