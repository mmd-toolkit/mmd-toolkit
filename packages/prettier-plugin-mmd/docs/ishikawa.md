# Ishikawa formatting rules

Japanese version: [ishikawa.ja.md](./ishikawa.ja.md)

How prettier-plugin-mmd formats the
[Ishikawa syntax](../../spec/docs/diagrams/ishikawa.md) and
[tree](../../spec/docs/ast/ishikawa.md). Each rule states its reason where
Db-equal forms exist.

Escaped examples are complete JSON strings: `\n`, `\r`, `\t`, `\u2028` and
`\u2029` denote characters. Examples were checked against Mermaid 12.0.0 when
defined; regular tests use trees and recorded results without running Mermaid.

## Rules

### Header

The selected written `ishikawa` or `ishikawa-beta` header stands at column one,
retaining its accepted case and stable/beta spelling. This makes the header easy
to find without replacing an authored choice with a Db-equal spelling. [fixture:
ishikawa/header/header-column] [fixture: ishikawa/header/header-stable]
[fixture: ishikawa/header/header-case-alternative] [fixture:
ishikawa/header/header-lowercase] [fixture: ishikawa/header/header-valid]
Exterior padding disappears; a failed beta boundary leaves its suffix with the
root, and attached trivia follows the rules below. [fixture:
ishikawa/header/header-beta-fallback]

Input (escaped):

```json
"ishikawa-betaX\n A"
```

Output
([header/header-beta-fallback-output.mmd](../tests/fixtures/ishikawa/header/header-beta-fallback-output.mmd)):

```mmd
ishikawa
  -betaX
    A
```

### Indentation

Indentation is AST depth times one configured step: the header has depth zero,
the root depth one, and each child one greater than its parent. Uniform
increasing indentation reproduces the same ordered tree without importing
written widths or discarded clamp/base numbers. [fixture:
ishikawa/indentation/indent-depth] [fixture:
ishikawa/indentation/indent-flatten-unsafe] [fixture:
ishikawa/indentation/indent-sibling-causes] [fixture:
ishikawa/indentation/indent-unindented-causes] [fixture:
ishikawa/indentation/indent-zero-unclamped-unsafe] Clamped, relative-zero and
shallower causes become ordinary root children. [fixture:
ishikawa/indentation/indent-clamped] [fixture:
ishikawa/indentation/indent-relative-zero] Spaces use `Math.max(1, tabWidth)`
characters per step, including `tabWidth: 0`; `useTabs` uses one tab per step. A
positive minimum is necessary to preserve nesting. [fixture:
ishikawa/indentation/indent-four] [fixture: ishikawa/indentation/indent-tabs]
[fixture: ishikawa/indentation/indent-zero] [fixture:
ishikawa/indentation/indent-zero-tabs] [fixture:
ishikawa/indentation/tabs-leading-directives] [fixture:
ishikawa/indentation/zero-kept-leading-directive] [fixture:
ishikawa/indentation/zero-leading-directive] [fixture:
ishikawa/indentation/zero-tabs-leading-directives]

Input (escaped):

```json
"ishikawa\nR\n    A\n B\n  C\n      D\n E"
```

Output
([indentation/indent-clamped-output.mmd](../tests/fixtures/ishikawa/indentation/indent-clamped-output.mmd)):

```mmd
ishikawa
  R
    A
    B
    C
      D
    E
```

### Root on header line

An ordinary header-line root moves whole to its own depth-one line, including
glued punctuation, fallback suffixes, percent text and semicolons. This agrees
with the other printers' header/body convention while keeping the Db. Header
comments and directive attachment follow their narrower rules; apparent
statements inside the root are never split. [fixture:
ishikawa/root-on-header-line/header-root] [fixture:
ishikawa/root-on-header-line/header-root-kept] [fixture:
ishikawa/root-on-header-line/header-root-percent] [fixture:
ishikawa/root-on-header-line/header-root-tab] [fixture:
ishikawa/root-on-header-line/header-root-touch]

Input (escaped):

```json
"ishikawa R\n    A\n      B"
```

Output
([root-on-header-line/header-root-output.mmd](../tests/fixtures/ishikawa/root-on-header-line/header-root-output.mmd)):

```mmd
ishikawa
  R
    A
      B
```

### Root indentation

An ordinary root stands one configured positive step below the header, even when
its source indentation was deeper or shallower than all causes. Root indentation
chooses no parent, so column one would be Db-equal; the chosen step follows the
body convention of the other printers. [fixture:
ishikawa/root-indentation/root-alone] [fixture:
ishikawa/root-indentation/root-deeper] [fixture:
ishikawa/root-indentation/root-column-one] [fixture:
ishikawa/root-indentation/root-zero-alternative] Descendants use their AST depth
independently, and a retained header/directive group stays attached. Comments
and directives in a rootless body use the same body level. [fixture:
ishikawa/root-indentation/rootless-comment] [fixture:
ishikawa/root-indentation/rootless-directives]

Input (escaped):

```json
"ishikawa\n     R"
```

Output
([root-indentation/root-alone-output.mmd](../tests/fixtures/ishikawa/root-indentation/root-alone-output.mmd)):

```mmd
ishikawa
  R
```

### Blank lines

Ordinary blank runs collapse to one, keeping visual grouping without arbitrary
runs; plain body-edge blanks disappear, including after leading common comments
or directive-only lines. [fixture: ishikawa/blank-lines/blank-runs] [fixture:
ishikawa/blank-lines/blank-around-trivia] A separating blank after a diagram
comment remains one, including after an attached header comment; the complete
terminal gap after a final diagram comment stays written. [fixture:
ishikawa/blank-lines/blank-comment-accepted] [fixture:
ishikawa/blank-lines/blank-header-comment-accepted] [corpus fixture:
ishikawa/gram-last-comment-blank-line] [fixture:
ishikawa/blank-lines/header-comment-many-blanks] [fixture:
ishikawa/blank-lines/interior-comment-many-blanks] [fixture:
ishikawa/blank-lines/terminal-comment-complete-gap] Whitespace-only lines are
blanks, while embedded joins and directive contents remain whole. Specified
blank/comment divergences are formatted without repairing Mermaid's pairing.
[fixture: ishikawa/blank-lines/blank-comment-div] [fixture:
ishikawa/blank-lines/blank-header-div] [corpus fixture:
ishikawa/div-beta-header-trailing-space-node] [corpus fixture:
ishikawa/div-between-comment-blank-node] [corpus fixture:
ishikawa/div-between-comment-common-gap-blank-node] [corpus fixture:
ishikawa/div-between-comment-directive-blank-node] [corpus fixture:
ishikawa/div-header-blank-indented-node] [corpus fixture:
ishikawa/div-header-blank-node] [corpus fixture:
ishikawa/div-header-common-comment-blank-node] [corpus fixture:
ishikawa/div-header-directive-blank-node] [corpus fixture:
ishikawa/div-header-several-blank-node] [corpus fixture:
ishikawa/div-header-space-directive-node] [corpus fixture:
ishikawa/div-header-spaces-line-node] [corpus fixture:
ishikawa/div-header-trailing-space-node] [corpus fixture:
ishikawa/div-header-trailing-tab-node] [corpus fixture:
ishikawa/div-header-two-comments-blank-node] [corpus fixture:
ishikawa/div-header-two-comments-common-gap] [corpus fixture:
ishikawa/div-header-whitespace-indented-node] [corpus fixture:
ishikawa/div-between-comment-blank-cr] [corpus fixture:
ishikawa/div-between-comment-blank-crlf] [corpus fixture:
ishikawa/div-header-trailing-nbsp-node] [corpus fixture:
ishikawa/div-header-two-comments-blank-cr] [corpus fixture:
ishikawa/div-header-two-comments-blank-crlf]

Input (escaped):

```json
"ishikawa\nR\n\n %% c\n\n %%{init: {}}%%\n\n A"
```

Output
([blank-lines/blank-around-trivia-output.mmd](../tests/fixtures/ishikawa/blank-lines/blank-around-trivia-output.mmd)):

```mmd
ishikawa
  R

    %% c

    %%{init: {}}%%

    A
```

### Comments

Standalone comments align with the next node, or the last node at EOF, to show
their association; comments before the header stand at column one. [fixture:
ishikawa/comments/comments-align] [fixture:
ishikawa/comments/comment-on-separate-line] A real trailing header comment
retains touching versus spaced attachment, reducing an exterior spaced gap to
one space. [fixture: ishikawa/comments/comment-header-gap] [fixture:
ishikawa/comments/comment-header-touch] Marks, contents and trailing comment
spaces remain whole. [fixture: ishikawa/comments/comment-spaces] [fixture:
ishikawa/comments/comments-bare-braces] [fixture:
ishikawa/comments/header-comment-spaces] [fixture:
ishikawa/comments/kept-comment-spaces] After node text begins, `%%` is literal
text, including inside apparent quotes; `#` and a single `%` are also ordinary
node text. [fixture: ishikawa/comments/comment-detach-unsafe] [fixture:
ishikawa/comments/comment-inline-value] [corpus fixture:
ishikawa/div-c4-inline-percent-eof] [corpus fixture:
ishikawa/div-c4-inline-percent-ls-eof] [corpus fixture:
ishikawa/div-c4-inline-percent-ps-eof]

Unicode endings and common-region joins follow
[Line separators](#line-separators).

Input (escaped):

```json
"ishikawa\nR %% literal"
```

Output
([comments/comment-detach-unsafe-output.mmd](../tests/fixtures/ishikawa/comments/comment-detach-unsafe-output.mmd)):

```mmd
ishikawa
  R %% literal
```

### Standalone directives

Standalone directives keep their text and order and align like comments, showing
their association without interpreting embedded data. [fixture:
ishikawa/standalone-directives/directives-align] A directive glued before the
header stays glued. [fixture:
ishikawa/standalone-directives/directive-before-header-glued] On the header
line, a directive touching the header remains there while a separated root moves
below. [fixture: ishikawa/standalone-directives/header-touching-directive]
[fixture: ishikawa/standalone-directives/header-two-touching-directives] A
directive separated from the header by whitespace moves with a following
same-line root, also when the directive spans physical lines: leaving it behind
would leave header trailing whitespace after directive removal, which Mermaid
rejects. This is the same reason kanban moves a header-line directive with its
node. [fixture: ishikawa/standalone-directives/header-spaced-directive]
[fixture: ishikawa/standalone-directives/header-spaced-multiline-directive]
[fixture: ishikawa/standalone-directives/header-spaced-two-directives] [fixture:
ishikawa/standalone-directives/header-spaced-directive-comment] [fixture:
ishikawa/standalone-directives/header-beta-spaced-directive] [fixture:
ishikawa/standalone-directives/header-spaced-directive-kept] [fixture:
ishikawa/standalone-directives/header-spaced-directive-literal-percent] [test:
ishikawa: header-spaced-directive-comment-ls] The moved directive's following
gaps count toward the root's indentation under
[Inline directives](#inline-directives), so one following space leaves one space
before the directive at the default root depth. [fixture:
ishikawa/standalone-directives/header-spaced-directive-tabs] [fixture:
ishikawa/standalone-directives/header-spaced-directive-zero] With multiple
directives, the touching header prefix stays and the suffix after the first
separating gap moves with the root. [fixture:
ishikawa/standalone-directives/header-touching-prefix-spaced-directive] A
directive touching root text retains the whole written header group. [fixture:
ishikawa/standalone-directives/directive-header-touch-root] [fixture:
ishikawa/standalone-directives/header-directive-touching-root] [fixture:
ishikawa/standalone-directives/header-two-directives-touching-root] [fixture:
ishikawa/standalone-directives/header-root-touching-directive-kept] Without a
same-line root, directives and comments keep their header attachment, including
specified `div-` inputs. [fixture:
ishikawa/standalone-directives/directive-header-separated] [corpus fixture:
ishikawa/div-header-space-directive-node] Closed, multiline, word-argument and
EOF-reaching open directives keep their boundaries. [fixture:
ishikawa/standalone-directives/directive-open-eof]

Input (escaped):

```json
"%%{init: {}}%%ishikawa\nR"
```

Output
([standalone-directives/directive-before-header-glued-output.mmd](../tests/fixtures/ishikawa/standalone-directives/directive-before-header-glued-output.mmd)):

```mmd
%%{init: {}}%%ishikawa
  R
```

Input (escaped):

```json
"ishikawa %%{init: {}}%% R\n A"
```

Output
([standalone-directives/header-spaced-directive-output.mmd](../tests/fixtures/ishikawa/standalone-directives/header-spaced-directive-output.mmd)):

```mmd
ishikawa
 %%{init: {}}%% R
    A
```

Input (escaped):

```json
"ishikawa %%{init: {\n     }}%% R\n A\n  B"
```

Output
([standalone-directives/header-spaced-multiline-directive-output.mmd](../tests/fixtures/ishikawa/standalone-directives/header-spaced-multiline-directive-output.mmd)):

```mmd
ishikawa
 %%{init: {
     }}%% R
    A
      B
```

### Inline directives

Literal-side directive gaps remain exactly written because removing directives
joins both sides without supplying whitespace. [fixture:
ishikawa/inline-directives/directive-gap-trim-unsafe] [fixture:
ishikawa/inline-directives/directive-single-space-gaps] [fixture:
ishikawa/inline-directives/directive-in-value] [fixture:
ishikawa/inline-directives/literal-side-whitespace] [fixture:
ishikawa/inline-directives/joined-line-spaces] Leading directive gaps instead
count toward the node's chosen depth indentation, excluding directive
characters: retain the gaps while they fit, shorten from the last gap backwards
when necessary, and supply the remainder before the first directive using
configured characters. This reuses kanban's allocation policy, keeps multiline
contents and continuation columns, and avoids preserving arbitrary source
indentation. [fixture: ishikawa/inline-directives/directive-leading] [fixture:
ishikawa/inline-directives/directive-leading-wide] [fixture:
ishikawa/inline-directives/directive-two-leading] [fixture:
ishikawa/inline-directives/directive-multiline-join] [test: ishikawa:
ls-comment-leading-directives] [test: ishikawa:
ps-comment-leading-directive-kept-zero]

Input (escaped):

```json
"ishikawa\nR  %%{init: {}}%%   X"
```

Output
([inline-directives/directive-gap-trim-unsafe-output.mmd](../tests/fixtures/ishikawa/inline-directives/directive-gap-trim-unsafe-output.mmd)):

```mmd
ishikawa
  R  %%{init: {}}%%   X
```

### Trailing whitespace

Every trailing character of `IshikawaLiteral` stays as written on ordinary and
kept lines alike: spaces, tabs, Unicode whitespace, whitespace after a colon and
EOF padding are all part of the literal's value. The value is what the author
wrote; Db equality does not require erasing a value, even though Mermaid trims
it. This is the same written-value choice as mindmap. [fixture:
ishikawa/trailing-whitespace/trailing-colon-kept] [fixture:
ishikawa/trailing-whitespace/trailing-kept-semicolon] [fixture:
ishikawa/trailing-whitespace/trailing-value-kept] [fixture:
ishikawa/trailing-whitespace/trailing-value-drop-alternative] [fixture:
ishikawa/trailing-whitespace/unpadded-values] [test: ishikawa: trailing-nbsp]
[test: ishikawa: trailing-unicode-separators] [test: ishikawa:
trailing-unicode-kept-line] Internal whitespace, directive-side gaps and joined
continuation columns stay too, as do comment spaces and directive contents.
[fixture: ishikawa/trailing-whitespace/trailing-directive-continuation] Only
exterior header-line padding is dropped under [Header](#header) and
[Blank lines](#blank-lines); it is not a literal value. [fixture:
ishikawa/trailing-whitespace/trailing-header-div]

Input and output (escaped):

```json
[
  {
    "input": "ishikawa\nR: \n A:  ",
    "output": "ishikawa\n  R: \n    A:  \n"
  },
  {
    "input": "ishikawa\nR style:#abc;;   \n A",
    "output": "ishikawa\n  R style:#abc;;   \n    A\n"
  },
  {
    "input": "ishikawa\nR   \n A\t  ",
    "output": "ishikawa\n  R   \n    A\t  \n"
  }
]
```

### Node text

Node text keeps its written spelling, including trailing characters: quotes,
backticks, empty-looking strings/brackets/calls, missing closers, numbers,
punctuation, entities, HTML, prototype names and apparent
title/accessibility/style/decoration/data syntax are literals. [fixture:
ishikawa/node-text/values-opaque] [fixture:
ishikawa/node-text/values-quote-unsafe] [fixture:
ishikawa/node-text/unquoted-root] [fixture:
ishikawa/node-text/values-html-entities] No foreign token-spacing or value
conversion applies. This preserves authored forms and configuration-sensitive
reading rather than reconstructing labels from the Db. [fixture:
ishikawa/node-text/values-spacing-unsafe] [fixture:
ishikawa/node-text/value-single-space-and-colon]

C4-looking text remains literal under the specification's reading, even when
Mermaid's whole-source detection selects C4 and rejects it. [corpus fixture:
ishikawa/detect-c4-component-root] [corpus fixture:
ishikawa/detect-c4-container-text] [corpus fixture:
ishikawa/detect-c4-deployment-suffix] [corpus fixture:
ishikawa/detect-c4-dynamic-quoted] [fixture: ishikawa/node-text/div-c4]

Input (escaped):

```json
"ishikawa\nR <a x=\"y\">#amp;</a>\n A#35;#x41;"
```

Output
([node-text/values-html-entities-output.mmd](../tests/fixtures/ishikawa/node-text/values-html-entities-output.mmd)):

```mmd
ishikawa
  R <a x="y">#amp;</a>
    A#35;#x41;
```

Input (escaped):

```json
"ishikawa\nR\n C4Container"
```

Output
([node-text/div-c4-output.mmd](../tests/fixtures/ishikawa/node-text/div-c4-output.mmd)):

```mmd
ishikawa
  R
    C4Container
```

### Line rule and kept lines

Every semicolon stays: none separates Ishikawa nodes, including the semicolons
ignored by the shared exact-case `style` pass followed by `classDef`. [fixture:
ishikawa/line-rule-and-kept-lines/semicolon-plain] [fixture:
ishikawa/line-rule-and-kept-lines/semicolon-split-unsafe] [fixture:
ishikawa/line-rule-and-kept-lines/separate-cause] [fixture:
ishikawa/line-rule-and-kept-lines/line-rule-delete-unsafe] [fixture:
ishikawa/line-rule-and-kept-lines/line-rule-single-semicolon] The shared
kept-stretch mechanism protects the prefix through the last semicolon, extending
through whole crossing literals, comments and directives without duplicate
tails; exterior indentation is printer whitespace, while literal trailing
characters stay written. [fixture:
ishikawa/line-rule-and-kept-lines/line-rule-kept] [fixture:
ishikawa/line-rule-and-kept-lines/line-rule-double-pass] [fixture:
ishikawa/line-rule-and-kept-lines/line-rule-directive-trigger] [test: ishikawa:
crossing-region-semicolon] [test: ishikawa: unicode-comment-kept] Colon/hash
gaps, nonmatches, entities, Unicode segment boundaries and open-directive
semicolon stops keep their distinctions, since changing them can select a
different semicolon. [fixture:
ishikawa/line-rule-and-kept-lines/line-rule-colon-unsafe] [fixture:
ishikawa/line-rule-and-kept-lines/line-rule-spaced-hash] [fixture:
ishikawa/line-rule-and-kept-lines/line-rule-nonmatches] [fixture:
ishikawa/line-rule-and-kept-lines/open-directive-semicolon-stop]

Input (escaped):

```json
"ishikawa\nR style:#abc;"
```

Output
([line-rule-and-kept-lines/line-rule-colon-unsafe-output.mmd](../tests/fixtures/ishikawa/line-rule-and-kept-lines/line-rule-colon-unsafe-output.mmd)):

```mmd
ishikawa
  R style:#abc;
```

### Physical lines

Node text never wraps or joins for `printWidth`: ordinary physical line breaks
separate nodes even inside quote-looking text. [fixture:
ishikawa/physical-lines/long-no-wrap] [fixture:
ishikawa/physical-lines/long-wrap-unsafe] [fixture:
ishikawa/physical-lines/separate-cause-lines] [fixture:
ishikawa/physical-lines/quoted-lines-nodes] [fixture:
ishikawa/physical-lines/quoted-lines-join-unsafe] [fixture:
ishikawa/physical-lines/quoted-single-line] [fixture:
ishikawa/physical-lines/ordinary-quote-blanks] [fixture:
ishikawa/physical-lines/data-looking-lines] In contrast, removed multiline
directives and common comment regions can join physical lines into one literal,
so their complete regions, internal blanks and later continuation columns remain
written. This keeps the tree and value text rather than treating every physical
line as a node. [test: ishikawa: joined-common-region] [test: ishikawa:
joined-deeper-continuation]

Input (escaped):

```json
"ishikawa\nR\n A deliberately long cause remains one literal line even when printWidth is twenty"
```

Output
([physical-lines/long-no-wrap-output.mmd](../tests/fixtures/ishikawa/physical-lines/long-no-wrap-output.mmd)):

```mmd
ishikawa
  R
    A deliberately long cause remains one literal line even when printWidth is twenty
```

### Case and order

Written header case, literal case, source/sibling order and repeated nodes
remain, including equal labels with different children. Header case is a
Db-equal authored choice worth retaining; sibling order and repetitions are part
of the ordered Db tree, so sorting, deduplication or grouping would change it.
[fixture: ishikawa/case-and-order/case-order-kept] [fixture:
ishikawa/case-and-order/deduplicate-unsafe] [fixture:
ishikawa/case-and-order/single-cause]

Input (escaped):

```json
"iShIkAwA\nR\n A\n  First\n A\n  Second\n title T"
```

Output
([case-and-order/case-order-kept-output.mmd](../tests/fixtures/ishikawa/case-and-order/case-order-kept-output.mmd)):

```mmd
iShIkAwA
  R
    A
      First
    A
      Second
    title T
```

### Line terminators

CRLF and lone CR use shared `endOfLine` normalization and configured LF/CRLF/CR
output, also inside apparent quotes, directives, frontmatter and comment gaps.
Mermaid reads these as LF and Ishikawa has no quoted-string context, so
preserving original terminator bytes offers no additional reading guarantee.
[test: ishikawa: cr-lines] [corpus fixture: ishikawa/lex-crlf-lines] [test:
ishikawa: crlf-quoted-nodes] [test: ishikawa: crlf-directive] [test: ishikawa:
eol-cr] [test: ishikawa: eol-crlf] [test: ishikawa: cr-frontmatter-comment]

Rejected bare headers remain failures; LS/PS use their separate contextual rule.

Input and output (escaped):

```json
{
  "input": "ishikawa\rR\r A\r  B\r",
  "output": "ishikawa\n  R\n    A\n      B\n"
}
```

### Line separators

LS (`\u2028`) and PS (`\u2029`) inside literals and directives remain
characters, including trailing literal whitespace. LF uses the
[Physical lines](#physical-lines) rule and separates ordinary node lines.
[fixture: ishikawa/line-separators/lf-root-and-cause] [fixture:
ishikawa/line-separators/lf-sibling-causes] [test: ishikawa: ls-ps-values]
[test: ishikawa: ls-value-split-unsafe] [test: ishikawa: ps-value-split-unsafe]
[test: ishikawa: ls-ps-line-rule] Blank-only lines collapse, and leading
separators normalize as indentation. [test: ishikawa: unicode-blank-lines]
[corpus fixture: ishikawa/div-header-ls-line-node] [corpus fixture:
ishikawa/div-header-ps-line-node] An actual diagram-comment ending keeps its
separator, counting it once toward the next node's chosen depth and supplying
only the remaining characters. An LF comment ending instead starts a new line
without contributing an indentation character. [fixture:
ishikawa/line-separators/lf-comment-boundary] [test: ishikawa:
ls-comment-boundary] [test: ishikawa: kept-comment-ls-before] [test: ishikawa:
kept-comment-ps-after] [test: ishikawa: selected-comment-ls-both] [test:
ishikawa: kept-comment-ps-wide] [test: ishikawa: selected-comment-ps-shallow]
[test: ishikawa: ps-comment-boundary] [test: ishikawa: ls-comment-depth-unsafe]
[test: ishikawa: ls-comment-shallower-depth] [test: ishikawa:
ls-comment-to-lf-alternative] [test: ishikawa: ls-comment-leading-directives]
[test: ishikawa: ps-comment-leading-directive-kept-zero] [test: ishikawa:
unicode-comment-clamped] [test: ishikawa: unicode-comment-zero] [test: ishikawa:
unicode-comment-tabs] [test: ishikawa: unicode-comment-crlf] [test: ishikawa:
unicode-comment-blank-cr] [corpus fixture:
ishikawa/div-between-comment-ls-blank-node] [corpus fixture:
ishikawa/div-between-comment-ps-blank-node] [corpus fixture:
ishikawa/div-between-two-comments-ls-node] [corpus fixture:
ishikawa/div-between-two-comments-ps-node] [corpus fixture:
ishikawa/div-header-comment-directive-marker-ls] [corpus fixture:
ishikawa/div-header-comment-directive-value-ps] [corpus fixture:
ishikawa/div-header-comment-ls-node] [corpus fixture:
ishikawa/div-header-comment-ps-node] Common comment regions instead keep
swallowed suffixes and joins whole. This preserves authored boundaries and
nesting without a separate comment-pair repair policy; kept stretches stop only
at actual comment endings, never at a separator inside a complete literal or
directive. [test: ishikawa: ls-common-swallows] [corpus fixture:
ishikawa/div-header-inline-comment-ls-node] [corpus fixture:
ishikawa/div-header-inline-comment-ps-node] [test: ishikawa:
common-joined-terminal-spaces]

Input and output (escaped):

```json
{
  "input": "ishikawa\nR\n A\n%%{}%%\u2028  B",
  "output": "ishikawa\n  R\n    A\n      %%{}%%\u2028     B\n"
}
```

### Whitespace characters

Accepted indentation whitespace uses configured depth characters, counting each
input character once, including tabs, VT/FF, NBSP, BOM and ideographic space;
visual tab expansion is never a parenting rule. [corpus fixture:
ishikawa/lex-space-positions] [corpus fixture: ishikawa/lex-tab-positions]
[fixture: ishikawa/whitespace-characters/space-indentation] [fixture:
ishikawa/whitespace-characters/tab-visual-expansion-unsafe] [corpus fixture:
ishikawa/lex-bom-positions] [corpus fixture: ishikawa/lex-em-quad-positions]
[corpus fixture: ishikawa/lex-em-space-positions] [corpus fixture:
ishikawa/lex-en-quad-positions] [corpus fixture:
ishikawa/lex-en-space-positions] [corpus fixture: ishikawa/lex-ff-positions]
[corpus fixture: ishikawa/lex-figure-space-positions] [corpus fixture:
ishikawa/lex-four-per-em-positions] [corpus fixture:
ishikawa/lex-hair-space-positions] [corpus fixture:
ishikawa/lex-ideographic-positions] [corpus fixture:
ishikawa/lex-medium-math-space-positions] [corpus fixture:
ishikawa/lex-narrow-nbsp-positions] [corpus fixture:
ishikawa/lex-nbsp-positions] [corpus fixture: ishikawa/lex-ogham-positions]
[corpus fixture: ishikawa/lex-punctuation-space-positions] [corpus fixture:
ishikawa/lex-six-per-em-positions] [corpus fixture:
ishikawa/lex-thin-space-positions] [corpus fixture:
ishikawa/lex-three-per-em-positions] [corpus fixture: ishikawa/lex-vt-positions]
[test: ishikawa: unicode-indentation] Internal and trailing literal characters
stay as written values. NEL, zero-width space, NUL and supplementary text remain
literal text. [test: ishikawa: unicode-value-kept] [test: ishikawa:
nel-zero-width-text] File-leading BOM handling and BOM/frontmatter limitations
are shared with Prettier, as described in compatibility. [test: ishikawa:
leading-bom]

Input (escaped):

```json
"ishikawa\nR\n A\n\tB\n  C"
```

Output
([whitespace-characters/tab-visual-expansion-unsafe-output.mmd](../tests/fixtures/ishikawa/whitespace-characters/tab-visual-expansion-unsafe-output.mmd)):

```mmd
ishikawa
  R
    A
    B
      C
```

### Frontmatter YAML

Shared guarded Prettier YAML formatting makes safe configuration readable while
retaining delimiters and closing padding. [fixture:
ishikawa/frontmatter-yaml/frontmatter-yaml] [fixture:
ishikawa/frontmatter-yaml/frontmatter-width-config] [fixture:
ishikawa/frontmatter-yaml/closing-delimiter-padding] [test: ishikawa:
crlf-and-bom] YAML indentation has a one-space minimum even at `tabWidth: 0`, as
explained in [Frontmatter](./compatibility.md#frontmatter). [fixture:
ishikawa/frontmatter-yaml/zero-width-block-scalar-title] [fixture:
ishikawa/frontmatter-yaml/zero-width-nested-title] [fixture:
ishikawa/frontmatter-yaml/zero-width-nested-config] Malformed, indented,
HTML-sensitive and delimiter-hazard YAML stays written, including tags starting
across the frontmatter boundary. [fixture:
ishikawa/frontmatter-yaml/frontmatter-indented] [fixture:
ishikawa/frontmatter-yaml/frontmatter-malformed] [corpus fixture:
ishikawa/frontmatter-malformed] [corpus fixture:
ishikawa/frontmatter-html-title] [fixture:
ishikawa/frontmatter-yaml/frontmatter-html-guard] [fixture:
ishikawa/frontmatter-yaml/frontmatter-html-requote-unsafe] [fixture:
ishikawa/frontmatter-yaml/frontmatter-html-single-quoted] [fixture:
ishikawa/frontmatter-yaml/frontmatter-delimiter-guard] [fixture:
ishikawa/frontmatter-yaml/frontmatter-delimiter-rewrite-unsafe] [corpus fixture:
ishikawa/div-frontmatter-open-tag-bare-node] [corpus fixture:
ishikawa/div-frontmatter-open-tag-quoted-node] A root overrides the frontmatter
title; rootless empty, null, numeric and whitespace titles retain their recorded
readings, and accessibility metadata creates no Ishikawa statements. [fixture:
ishikawa/frontmatter-yaml/frontmatter-rootless] [corpus fixture:
ishikawa/frontmatter-empty-title-rootless] [corpus fixture:
ishikawa/frontmatter-null-title-rootless] [corpus fixture:
ishikawa/frontmatter-numeric-title-rootless] [corpus fixture:
ishikawa/frontmatter-whitespace-title-rootless]

Data-looking node text is never YAML-formatted; empty or unclosed frontmatter
delimiters remain parser failures.

Input (escaped):

```json
"---\n%YAML 1.2\n--- !!map\ntitle: T\n---\nishikawa\nR"
```

Output
([frontmatter-yaml/frontmatter-delimiter-guard-output.mmd](../tests/fixtures/ishikawa/frontmatter-yaml/frontmatter-delimiter-guard-output.mmd)):

```mmd
---
%YAML 1.2
--- !!map
title: T
---
ishikawa
  R
```

### Final newline

Ordinary accepted input ends with one configured newline, including accepted
rootless bodies, following the shared file convention without arbitrary final
blank runs. [corpus fixture: ishikawa/gram-root-eof] [corpus fixture:
ishikawa/header-only-blank] [corpus fixture: ishikawa/header-only-lf] [fixture:
ishikawa/final-newline/accepted-spaces-header] [fixture:
ishikawa/final-newline/multiple-final-lf] Rejected bare headers gain no rescuing
newline. Complete terminal diagram-comment gaps and open directives reaching EOF
keep their endings; terminal literal padding stays written under Trailing
whitespace. [fixture: ishikawa/final-newline/final-comment] [corpus fixture:
ishikawa/directive-open-root-eof] [fixture:
ishikawa/final-newline/final-value-spaces]

Input (escaped):

```json
"ishikawa\nR\n%% c"
```

Output
([final-newline/final-comment-output.mmd](../tests/fixtures/ishikawa/final-newline/final-comment-output.mmd)):

```mmd
ishikawa
  R
  %% c
```

### Markdown fences

The same rules format Mermaid fences after Markdown removes container
indentation; the host supplies fence/list/block-quote indentation. This keeps
diagram depth independent of its Markdown container, including tabs and
zero-width options, while failed parsing declines the payload. [fixture:
ishikawa/markdown-fences/markdown-top-payload] [fixture:
ishikawa/markdown-fences/markdown-list-payload] For fences the plugin formats,
the host strips final-line whitespace, so authored literal padding on that line
can be lost despite [Trailing whitespace](#trailing-whitespace); Mermaid trims
ordinary Ishikawa node text, making that host change Db-equal, but byte
preservation is not promised. Other literal-line endings remain written in
formatted fences. [fixture: ishikawa/markdown-fences/markdown-last-spaces]
[fixture: ishikawa/markdown-fences/markdown-unpadded-payload]

Declined fences are ordinary code to the host, which removes trailing spaces and
tabs from every line. [test: ishikawa Markdown:
declined-nonfinal-trailing-whitespace] Host output and dedented payload reading
are checked separately.

Input (escaped):

```json
"ishikawa R\n A\n   B"
```

Output
([markdown-fences/markdown-top-payload-output.mmd](../tests/fixtures/ishikawa/markdown-fences/markdown-top-payload-output.mmd)):

```mmd
ishikawa
  R
    A
      B
```

[test: ishikawa Markdown: top-level] [test: ishikawa Markdown: list] [test:
ishikawa Markdown: quote-list-clamped] [test: ishikawa Markdown: zero-width]
[test: ishikawa Markdown: tabs] [test: ishikawa Markdown: directives] [test:
ishikawa Markdown: joined-region] [test: ishikawa Markdown: trailing-whitespace]
[test: ishikawa Markdown: rootless] [test: ishikawa Markdown:
rejected-bare-header] [test: ishikawa Markdown: rejected-second-header] [test:
ishikawa Markdown: spaced-header-directive]

## Rejected inputs

The shared failure path reports a syntax error and leaves rejected standalone
source unformatted, and declines rejected Markdown fences. It repairs neither
headers, delimiters, empty or unclosed frontmatter, nor directives inside
keywords. For example, bare `ishikawa` without a line break still reports a
syntax error. Specified token-boundary divergences remain failures. [corpus
fixture: ishikawa/header-only] [corpus fixture: ishikawa/header-beta-only]
[corpus fixture: ishikawa/detect-semicolon-in-header] [corpus fixture:
ishikawa/header-letter-suffix] [corpus fixture: ishikawa/header-indented-second]
[corpus fixture: ishikawa/directive-in-header] [corpus fixture:
ishikawa/directive-in-beta-header] [corpus fixture:
ishikawa/div-directive-beta-prefix] [corpus fixture: ishikawa/frontmatter-empty]
[corpus fixture: ishikawa/frontmatter-unclosed]
