# Gitgraph formatting rules

Japanese version: [gitgraph.ja.md](./gitgraph.ja.md)

These rules implement the 26 adopted items from the written AST, without runtime
Mermaid calls or output reparsing. Invisible characters use escaped fixed test
cases.

## Rules

### Header

Keep the exact `gitGraph` word, authored direction and optional colon. Print
ordinary gaps as `gitGraph LR:` or `gitGraph:`; an ordinary inline first
statement moves below the header. Direction changes the Db, while its omission
and colon presence remain author choices. Hidden gaps and protected header/body
groups retain their source boundaries.

Fixed cases: [fixture: gitgraph/header/header-absent] [fixture:
gitgraph/header/header-colon] [fixture: gitgraph/header/header-lr] [fixture:
gitgraph/header/header-tb] [fixture: gitgraph/header/header-bt] [corpus fixture:
gitgraph/spec-git-graph-851bf4f9] [fixture: gitgraph/header/hidden-touching]

Input (escaped): `"  gitGraph\t\ncommit\n"`.

Output
([header/header-absent-output.mmd](../tests/fixtures/gitgraph/header/header-absent-output.mmd)):

```mmd
gitGraph
  commit
```

### Indentation

Put the header at column one and ordinary body statements, standalone comments
and global directives one configured step below it. The flat history has no
extra level after branch. `tabWidth: 0` gives zero spaces; `useTabs` gives one
tab even at width zero, because gitgraph columns have no grammatical meaning.
This exposes the AST structure without altering value continuation columns,
hidden closers or protected segments.

Fixed cases: [fixture: gitgraph/indentation/indent-two] [fixture:
gitgraph/indentation/indent-four] [fixture: gitgraph/indentation/indent-zero]
[fixture: gitgraph/indentation/tabs-normal] [fixture:
gitgraph/indentation/zero-tabs]

Input (escaped): `"gitGraph\ncommit\n      branch b\ncommit\nswitch main\n"`.

Output
([indentation/indent-two-output.mmd](../tests/fixtures/gitgraph/indentation/indent-two-output.mmd)):

```mmd
gitGraph
  commit
  branch b
  commit
  switch main
```

### Statements one per line

Print each ordinary body statement on its own line for readability. A line
common value still owns apparent later operations and semicolons; quoted
semicolons remain text. Gitgraph has no separator semicolon. Invalid adjacent
statements and block-following semicolons are parser failures, covered by the
corpus, and are never repaired.

Fixed cases: [fixture: gitgraph/statements-one-per-line/eol-header-inline]
[fixture: gitgraph/statements-one-per-line/eol-title-owns-text] [fixture:
gitgraph/statements-one-per-line/eol-values-semicolon]

Input (escaped): `"gitGraph:commit id:\"a\"\n"`.

Output
([statements-one-per-line/eol-header-inline-output.mmd](../tests/fixtures/gitgraph/statements-one-per-line/eol-header-inline-output.mmd)):

```mmd
gitGraph:
  commit id: "a"
```

### Blank lines

Collapse ordinary blank runs to one blank line and remove ordinary document/body
edge blanks, retaining visible grouping around comments too. Quoted values,
description blocks, directive/hidden interiors, consumed and spare hidden LFs
and retained prefixes keep their authored blanks because those belong to source
values or lexical boundaries.

Fixed cases: [fixture: gitgraph/blank-lines/blank-collapse] [fixture:
gitgraph/blank-lines/blank-comment] [fixture:
gitgraph/blank-lines/blank-string-kept] [fixture:
gitgraph/blank-lines/block-and-directive]

Input (escaped): `"\ngitGraph\n\n\ncommit\n \t\n\ncommit\n\n"`.

Output
([blank-lines/blank-collapse-output.mmd](../tests/fixtures/gitgraph/blank-lines/blank-collapse-output.mmd)):

```mmd
gitGraph
  commit

  commit
```

### Operation spacing

Use one space between ordinary operation, reference and option components, even
when authored components touch. Do not align columns. The visible components get
a consistent form; bare names retain their required boundaries. Gaps containing
comments, global directives or hidden forms retain their attachment and physical
boundaries.

Fixed cases: [corpus fixture: gitgraph/gram-commit-glued-options] [fixture:
gitgraph/operation-spacing/gap-branch-quoted] [fixture:
gitgraph/operation-spacing/gap-branch-bare] [fixture:
gitgraph/operation-spacing/gap-merge] [fixture:
gitgraph/operation-spacing/touching-message-tag]

Input (escaped): `"gitGraph commit\"note\"tag:\"v\"\n"`.

Output
([operation-spacing/touching-message-tag-output.mmd](../tests/fixtures/gitgraph/operation-spacing/touching-message-tag-output.mmd)):

```mmd
gitGraph
  commit "note" tag: "v"
```

### Option colons

Print `id: "A"`, `msg: "M"`, `tag: "T"`, `type: NORMAL`, `parent: "A"` and
`order: 2`: the colon touches its word, with one ordinary space before its
value. This follows the shared accessibility colon form. Preserve trivia at an
authored word/colon boundary, including global directives and selected
semicolons; ordinary whitespace before that colon is invalid.

Fixed cases: [fixture: gitgraph/option-colons/colon-commit] [fixture:
gitgraph/option-colons/colon-order] [corpus fixture:
gitgraph/lex-option-global-before-colon] [corpus fixture:
gitgraph/lex-selected-semicolon-option-word-colon]

Input (escaped):
`"gitGraph\ncommit id:\"A\" msg:\t\"M\" tag:  \"T\" type:HIGHLIGHT\n"`.

Output
([option-colons/colon-commit-output.mmd](../tests/fixtures/gitgraph/option-colons/colon-commit-output.mmd)):

```mmd
gitGraph
  commit id: "A" msg: "M" tag: "T" type: HIGHLIGHT
```

### Order and repetitions

Print every option and statement occurrence in source order, including
overwritten ids/types/messages and repeated or empty tags. Do not sort or reduce
scalar options to their final values: the resolved history loses authored
occurrences, and scalar/tag/statement order can change the Db.

Fixed cases: [fixture: gitgraph/order-and-repetitions/order-reverse-id]
[fixture: gitgraph/order-and-repetitions/order-reverse-type] [fixture:
gitgraph/order-and-repetitions/order-reverse-tags] [fixture:
gitgraph/order-and-repetitions/order-dedup-tags] [corpus fixture:
gitgraph/gram-merge-repeated-options] [corpus fixture:
gitgraph/db-overwritten-invalid-merge-id] [fixture:
gitgraph/order-and-repetitions/order-statements]

Input (escaped): `"gitGraph\ncommit tag:\"x\" tag:\"x\"\n"`.

Output
([order-and-repetitions/order-dedup-tags-output.mmd](../tests/fixtures/gitgraph/order-and-repetitions/order-dedup-tags-output.mmd)):

```mmd
gitGraph
  commit tag: "x" tag: "x"
```

### Messages

Keep the bare quoted message and explicit `msg:` forms, including empty and
repeated messages. Their introducer is authored syntax. The Db summary omits
message text, so summary equality does not authorize changing or deleting it.

Fixed cases: [fixture: gitgraph/messages/message-forms] [fixture:
gitgraph/messages/message-empty]

Input (escaped): `"gitGraph\ncommit \"bare\" msg:\"explicit\" \"last\"\n"`.

Output
([messages/message-forms-output.mmd](../tests/fixtures/gitgraph/messages/message-forms-output.mmd)):

```mmd
gitGraph
  commit "bare" msg: "explicit" "last"
```

### Quotes

Print each StringLiteral as its complete source span, with
single/double/opposite quotes and escapes unchanged. `singleQuote` does not
rewrite it. Re-encoding would require new escape and preprocessing decisions and
would discard the authored form.

Fixed cases: [fixture: gitgraph/quotes/quotes-kept] [corpus fixture:
gitgraph/lex-string-escapes] [fixture: gitgraph/quotes/single-quote-option]

Input (escaped): `"gitGraph\ncommit id:'A' msg:\"a'b\" tag:'a\"b'\n"`.

Output
([quotes/quotes-kept-output.mmd](../tests/fixtures/gitgraph/quotes/quotes-kept-output.mmd)):

```mmd
gitGraph
  commit id: 'A' msg: "a'b" tag: 'a"b'
```

### References

Keep Identifier and StringLiteral reference forms in branch, checkout, switch
and merge. Preserve empty, whitespace-only, Unicode, reserved-word and
numeric-looking quoted names. The AST already distinguishes these forms; the
printer need not decide whether unquoting would parse.

Fixed cases: [fixture: gitgraph/references/reference-forms] [corpus fixture:
gitgraph/lex-reference-reserved-quoted] [corpus fixture:
gitgraph/lex-reference-integer-quoted] [fixture:
gitgraph/references/reference-empty]

Input (escaped):
`"gitGraph\nbranch a_b-c/d.e\nbranch \"titleA\"\ncheckout a_b-c/d.e\n"`.

Output
([references/reference-forms-output.mmd](../tests/fixtures/gitgraph/references/reference-forms-output.mmd)):

```mmd
gitGraph
  branch a_b-c/d.e
  branch "titleA"
  checkout a_b-c/d.e
```

### Authored values

Keep string/reference padding, internal spaces, tabs, physical lines, Unicode,
case, escapes, HTML and entities. Empty values remain leaves. These spellings
can change identity, lookup and tag values; do not reconstruct them from
converted Db values or decode escapes as JavaScript. Physical CR conversion is
handled separately by the host.

Fixed cases: [fixture: gitgraph/authored-values/inner-padding-change] [fixture:
gitgraph/authored-values/inner-runs-change] [fixture:
gitgraph/authored-values/inner-case-change] [fixture:
gitgraph/authored-values/inner-escape-spelling] [corpus fixture:
gitgraph/html-all-texts] [corpus fixture: gitgraph/entity-all-fields] [corpus
fixture: gitgraph/db-compare-whitespace-id-lookups]

Input (escaped): `"gitGraph\ncommit id:\" A \" tag:\" T \"\n"`.

Output
([authored-values/inner-padding-change-output.mmd](../tests/fixtures/gitgraph/authored-values/inner-padding-change-output.mmd)):

```mmd
gitGraph
  commit id: " A " tag: " T "
```

### Order numbers

Print every unsigned order digit as written, including zero, precision-losing
integers and overflow. The NumericLiteral source, rather than its converted
double, is the authored value. Do not reorder branches by their numeric orders.
Invalid signs, leading zeros, fractions and exponents remain corpus failures.

Fixed cases: [corpus fixture: gitgraph/number-zero] [corpus fixture:
gitgraph/number-precision] [corpus fixture: gitgraph/number-overflow] [fixture:
gitgraph/order-numbers/precision-digits]

Input (escaped): `"gitGraph:branch release order:9007199254740993\n"`.

Output
([order-numbers/precision-digits-output.mmd](../tests/fixtures/gitgraph/order-numbers/precision-digits-output.mmd)):

```mmd
gitGraph:
  branch release order: 9007199254740993
```

### Keyword case

Keep the exact operation/header words and `NORMAL`, `REVERSE`, `HIGHLIGHT`.
Other case spellings reject; the printer does not introduce case-insensitive
aliases.

Fixed cases: [fixture: gitgraph/keyword-case/type-uppercase]

Input (escaped):
`"gitGraph\ncommit type:NORMAL\ncommit type:REVERSE\ncommit type:HIGHLIGHT\n"`.

Output
([keyword-case/type-uppercase-output.mmd](../tests/fixtures/gitgraph/keyword-case/type-uppercase-output.mmd)):

```mmd
gitGraph
  commit type: NORMAL
  commit type: REVERSE
  commit type: HIGHLIGHT
```

### Checkout aliases

Preserve each written `checkout` or `switch`, including their positions among
later commits. They have the same history effect, but replacing an authored
synonym adds no formatting benefit. Unknown branches remain failures for either
word.

Fixed cases: [fixture: gitgraph/checkout-aliases/alias-kept]

Input (escaped): `"gitGraph\nbranch b\nswitch main\ncheckout b\n"`.

Output
([checkout-aliases/alias-kept-output.mmd](../tests/fixtures/gitgraph/checkout-aliases/alias-kept-output.mmd)):

```mmd
gitGraph
  branch b
  switch main
  checkout b
```

### Cherry pick options

Keep all cherry-pick id/parent/tag options in source order and apply the
ordinary operation/colon spacing. Keep overwritten invalid references, empty
parents, repeated tags and empty tags. The id names the source, and deleting an
empty tag can restore a default tag and change the Db. Merge-source parent
requirements belong to acceptance, not to printer reconstruction.

Fixed cases: [fixture: gitgraph/cherry-pick-options/cherry-spacing] [corpus
fixture: gitgraph/gram-cherry-pick-repeated-options] [corpus fixture:
gitgraph/gram-cherry-pick-merge-parent] [corpus fixture:
gitgraph/gram-cherry-pick-empty-parent] [corpus fixture:
gitgraph/gram-cherry-pick-tags] [corpus fixture:
gitgraph/db-overwritten-invalid-source] [corpus fixture:
gitgraph/db-cherry-pick-only-empty-tags]

Input (escaped):
`"gitGraph\ncommit id:\"A\"\nbranch b\ncommit id:\"B\"\ncheckout main\ncherry-pick tag:\"x\"id:\"B\"parent:\"A\"tag:\"\"\n"`.

Output
([cherry-pick-options/cherry-spacing-output.mmd](../tests/fixtures/gitgraph/cherry-pick-options/cherry-spacing-output.mmd)):

```mmd
gitGraph
  commit id: "A"
  branch b
  commit id: "B"
  checkout main
  cherry-pick tag: "x" id: "B" parent: "A" tag: ""
```

### Title and common values

Print `title` plus one space and a nonempty value trimmed only at its outer
ends; empty/whitespace-only titles print bare `title`. Shared accessibility
layout prints `accTitle: value` / `accDescr: value`, empty blocks as `{}`,
touching braces as written and present edge whitespace as one space. A separate
closer aligns with its statement; continuation columns and internal blanks stay.
Whitespace-only interiors print `{}` because there is no text for interior
whitespace to surround; tabs, line breaks and Unicode whitespace follow the same
rule. [fixture: title-and-common-values/empty-whitespace-interiors] [test:
gitgraph Unicode and tab interiors] Comment/directive-only blocks keep their
trivia. Keep every repeated, empty and interleaved assignment, including
frontmatter fallback. Line forms never read the next physical line, even across
blanks/comments/directives; colon-form braces stay line text. These choices
compact equivalent outer whitespace without changing the authored interior or
lexical ownership.

Fixed cases: [fixture: gitgraph/title-and-common-values/title-trim] [corpus
fixture: gitgraph/title-next-line] [fixture:
gitgraph/title-and-common-values/common-repeats-empty] [fixture:
gitgraph/title-and-common-values/a11y-fixed] [fixture:
gitgraph/title-and-common-values/a11y-no-next-line] [fixture:
gitgraph/title-and-common-values/common-literal-not-string] [fixture:
gitgraph/title-and-common-values/common-move-front] [corpus fixture:
gitgraph/accdescr-block] [fixture:
gitgraph/title-and-common-values/block-asymmetric-fixed] [corpus fixture:
gitgraph/lex-description-block-only-comment] [corpus fixture:
gitgraph/lex-description-block-only-directive] [fixture:
gitgraph/title-and-common-values/title-next-trivia] [fixture:
gitgraph/title-and-common-values/block-opener-trivia] [corpus fixture:
gitgraph/common-title-only-whitespace] [test:
gitgraph/title-and-common-values/block-opener-join-fixed]

Input (escaped): `"gitGraph\ntitle\t  A  B\t C  \n"`.

Output
([title-and-common-values/title-trim-output.mmd](../tests/fixtures/gitgraph/title-and-common-values/title-trim-output.mmd)):

```mmd
gitGraph
  title A  B	 C
```

### Multiline values

Do not wrap operations/options/values at printWidth: a visible LF can end a
statement. Keep physical quoted/block lines, continuation columns and internal
blank lines. The shared block layout alone aligns a separate closing brace;
hidden consumed-LF gaps follow their own preservation rules.

Fixed cases: [fixture: gitgraph/multiline-values/long-kept] [fixture:
gitgraph/multiline-values/multiline-string] [fixture:
gitgraph/multiline-values/block-columns-fixed]

Input (escaped):
`"gitGraph\ncommit id:\"a-very-long-identifier-that-stays-written\" msg:\"long authored message with several words\" tag:\"release-with-a-long-tag\" type:HIGHLIGHT\n"`
({"printWidth": 20}).

Output
([multiline-values/long-kept-output.mmd](../tests/fixtures/gitgraph/multiline-values/long-kept-output.mmd)):

```mmd
gitGraph
  commit id: "a-very-long-identifier-that-stays-written" msg: "long authored message with several words" tag: "release-with-a-long-tag" type: HIGHLIGHT
```

### Comments

Align ordinary standalone comments one body step down, or at column one before
the header. Inline comments stay on the same line, touching when authored
touching, otherwise separated by one space. Keep marks, content and trailing
whitespace for author attachment. Native comments keep LS/PS as content;
strings/blocks own percent text while line values stop before it. Common removed
regions retain complete source spans. Retained prefixes override ordinary
alignment.

Fixed cases: [fixture: gitgraph/comments/comment-placement] [fixture:
gitgraph/comments/comment-bare-triple] [fixture:
gitgraph/comments/comment-in-values] [corpus fixture: gitgraph/comment-string]
[corpus fixture: gitgraph/comment-between-mark-characters] [corpus fixture:
gitgraph/comment-native-ls-content]

Input (escaped):
`"  %% before\ngitGraph %% header\ncommit%% glued\ncommit  %% apart\n    %% last\n"`.

Output
([comments/comment-placement-output.mmd](../tests/fixtures/gitgraph/comments/comment-placement-output.mmd)):

```mmd
%% before
gitGraph %% header
  commit%% glued
  commit %% apart
  %% last
```

### Global directives

Keep global directive content, order, source position and touching/separated
sides; only ordinary standalone starting indentation becomes one body step.
Preserve directives inside strings, word/colon boundaries and EOF-reaching
unclosed forms. Their opaque text and independent configuration effect must not
be reconstructed. Atomic cuts remain specified failures.

Fixed cases: [fixture: gitgraph/global-directives/directive-sides] [fixture:
gitgraph/global-directives/directive-lines] [corpus fixture:
gitgraph/directive-commit-id] [corpus fixture: gitgraph/directive-in-string]
[corpus fixture: gitgraph/directive-open-after-header] [fixture:
gitgraph/global-directives/directive-order-change]

Input (escaped):
`"gitGraph\ncommit id%%{wrap}%%:\"A\"\ncommit id:%%{wrap}%% \"B\"\n"`.

Output
([global-directives/directive-sides-output.mmd](../tests/fixtures/gitgraph/global-directives/directive-sides-output.mmd)):

```mmd
gitGraph
  commit id%%{wrap}%%: "A"
  commit id:%%{wrap}%% "B"
```

### Hidden yaml

Keep every yaml-block GitgraphIgnoredText in its named
header/option/name/textAfter/body owner as the complete source span, including
internal common trivia. Preserve consumed LF outside its range, spare LF and
closing padding, also at EOF or before trivia/another form. Do not add LF before
it. A body opener may indent one step; internal and closing columns stay. Empty
bodies, three fences, later qualifying closers and multiple forms remain opaque.
Earlier strings/blocks/line values retain ownership. Moving or trimming these
boundaries can reject an accepted history.

Fixed cases: [corpus fixture: gitgraph/lex-yaml-invalid-body] [corpus fixture:
gitgraph/lex-hidden-yaml-before-option-value] [fixture:
gitgraph/hidden-yaml/yaml-close-indent-invalid] [corpus fixture:
gitgraph/lex-hidden-yaml-commit-closing-space] [corpus fixture:
gitgraph/lex-yaml-empty-body] [corpus fixture:
gitgraph/lex-yaml-three-adjacent-fences] [corpus fixture:
gitgraph/lex-yaml-two-nonempty-in-gap] [corpus fixture: gitgraph/lex-yaml-block]
[corpus fixture: gitgraph/lex-yaml-common-init-effect] [corpus fixture:
gitgraph/lex-hidden-yaml-closer-skips-nonboundary] [corpus fixture:
gitgraph/lex-hidden-yaml-commit-spare-lf] [corpus fixture:
gitgraph/lex-hidden-yaml-commit-eof] [corpus fixture:
gitgraph/lex-hidden-yaml-branch-closing-space] [corpus fixture:
gitgraph/lex-hidden-yaml-branch-spare-lf] [corpus fixture:
gitgraph/lex-hidden-yaml-branch-eof] [corpus fixture:
gitgraph/lex-hidden-yaml-checkout-closing-space] [corpus fixture:
gitgraph/lex-hidden-yaml-checkout-spare-lf] [corpus fixture:
gitgraph/lex-hidden-yaml-checkout-eof] [corpus fixture:
gitgraph/lex-hidden-yaml-switch-closing-space] [corpus fixture:
gitgraph/lex-hidden-yaml-switch-spare-lf] [corpus fixture:
gitgraph/lex-hidden-yaml-switch-eof] [corpus fixture:
gitgraph/lex-hidden-yaml-merge-closing-space] [corpus fixture:
gitgraph/lex-hidden-yaml-merge-spare-lf] [corpus fixture:
gitgraph/lex-hidden-yaml-merge-eof] [corpus fixture:
gitgraph/lex-hidden-yaml-cherry-pick-closing-space] [corpus fixture:
gitgraph/lex-hidden-yaml-cherry-pick-spare-lf] [corpus fixture:
gitgraph/lex-hidden-yaml-cherry-pick-eof] [corpus fixture:
gitgraph/lex-hidden-yaml-block-closing-space] [corpus fixture:
gitgraph/lex-hidden-yaml-block-spare-lf] [corpus fixture:
gitgraph/lex-hidden-yaml-block-eof] [corpus fixture:
gitgraph/header-hidden-before-colon] [corpus fixture:
gitgraph/header-hidden-before-direction] [corpus fixture:
gitgraph/header-two-hidden-forms] [corpus fixture:
gitgraph/lex-hidden-yaml-before-branch-name] [corpus fixture:
gitgraph/lex-hidden-yaml-before-type] [corpus fixture:
gitgraph/lex-hidden-yaml-before-order] [corpus fixture:
gitgraph/lex-yaml-string] [corpus fixture:
gitgraph/lex-hidden-yaml-global-comment-body] [corpus fixture:
gitgraph/lex-hidden-yaml-opener-tab] [corpus fixture:
gitgraph/lex-yaml-empty-then-nonempty] [fixture:
gitgraph/hidden-yaml/standalone-closing-padding] [fixture:
gitgraph/hidden-yaml/option-consumed-lf]

Input (escaped): `"gitGraph commit id:---\nopaque\n---\n\"root\"\n"`.

Output
([hidden-yaml/option-consumed-lf-output.mmd](../tests/fixtures/gitgraph/hidden-yaml/option-consumed-lf-output.mmd)):

```mmd
gitGraph
  commit id:---
opaque
---
"root"
```

### Hidden directives

Use the same source/boundary preservation as Hidden yaml for directive-kind
GitgraphIgnoredText, including all nine statement suffix kinds. This native form
is distinct from a global directive. Keep empty/punctuation/multiline contents
and earlier string/block ownership. A nonqualifying closer can remain inside the
form until a later closer, or fall back to a native comment; do not insert a
boundary that changes that classification. Required missing components still
reject.

Fixed cases: [fixture: gitgraph/hidden-directives/hidden-directive-body] [corpus
fixture: gitgraph/lex-option-before-type-value-hidden] [corpus fixture:
gitgraph/lex-hidden-directive-commit-closing-space] [corpus fixture:
gitgraph/lex-hidden-directive-commit-spare-lf] [corpus fixture:
gitgraph/lex-hidden-directive-closer-skips-nonboundary] [corpus fixture:
gitgraph/lex-hidden-directive-common-init-effect] [corpus fixture:
gitgraph/lex-hidden-directive-unknown-content] [corpus fixture:
gitgraph/lex-hidden-directive-string] [corpus fixture:
gitgraph/lex-hidden-directive-commit-eof] [corpus fixture:
gitgraph/lex-hidden-directive-branch-closing-space] [corpus fixture:
gitgraph/lex-hidden-directive-branch-spare-lf] [corpus fixture:
gitgraph/lex-hidden-directive-branch-eof] [corpus fixture:
gitgraph/lex-hidden-directive-checkout-closing-space] [corpus fixture:
gitgraph/lex-hidden-directive-checkout-spare-lf] [corpus fixture:
gitgraph/lex-hidden-directive-checkout-eof] [corpus fixture:
gitgraph/lex-hidden-directive-switch-closing-space] [corpus fixture:
gitgraph/lex-hidden-directive-switch-spare-lf] [corpus fixture:
gitgraph/lex-hidden-directive-switch-eof] [corpus fixture:
gitgraph/lex-hidden-directive-merge-closing-space] [corpus fixture:
gitgraph/lex-hidden-directive-merge-spare-lf] [corpus fixture:
gitgraph/lex-hidden-directive-merge-eof] [corpus fixture:
gitgraph/lex-hidden-directive-cherry-pick-closing-space] [corpus fixture:
gitgraph/lex-hidden-directive-cherry-pick-spare-lf] [corpus fixture:
gitgraph/lex-hidden-directive-cherry-pick-eof] [corpus fixture:
gitgraph/lex-hidden-directive-title-closing-space] [corpus fixture:
gitgraph/lex-hidden-directive-title-spare-lf] [corpus fixture:
gitgraph/lex-hidden-directive-title-eof] [corpus fixture:
gitgraph/lex-hidden-directive-acctitle-closing-space] [corpus fixture:
gitgraph/lex-hidden-directive-acctitle-spare-lf] [corpus fixture:
gitgraph/lex-hidden-directive-acctitle-eof] [corpus fixture:
gitgraph/lex-hidden-directive-accdescr-closing-space] [corpus fixture:
gitgraph/lex-hidden-directive-accdescr-spare-lf] [corpus fixture:
gitgraph/lex-hidden-directive-accdescr-eof] [corpus fixture:
gitgraph/lex-hidden-directive-block-closing-space] [corpus fixture:
gitgraph/lex-hidden-directive-block-spare-lf] [corpus fixture:
gitgraph/lex-hidden-directive-block-eof] [corpus fixture:
gitgraph/lex-hidden-directive-before-branch-name] [corpus fixture:
gitgraph/lex-hidden-directive-before-checkout-name] [corpus fixture:
gitgraph/lex-hidden-directive-before-merge-name] [corpus fixture:
gitgraph/lex-option-between-options-hidden] [corpus fixture:
gitgraph/lex-option-before-message-hidden] [corpus fixture:
gitgraph/lex-branch-between-name-order-hidden] [corpus fixture:
gitgraph/lex-hidden-directive-block] [corpus fixture:
gitgraph/lex-hidden-directive-fallback-complete-statement] [corpus fixture:
gitgraph/lex-hidden-directive-between-option-value] [fixture:
gitgraph/hidden-directives/hidden-add-boundary-invalid] [fixture:
gitgraph/hidden-directives/standalone-closing-padding] [test:
gitgraph/hidden-directives/hidden-physical-multiline] [fixture:
gitgraph/hidden-directives/option-consumed-lf]

Input (escaped): `"gitGraph commit id:%%{!}%%\n'root'\n"`.

Output
([hidden-directives/option-consumed-lf-output.mmd](../tests/fixtures/gitgraph/hidden-directives/option-consumed-lf-output.mmd)):

```mmd
gitGraph
  commit id:%%{!}%%
'root'
```

### Semicolons

Keep every authored semicolon and reuse shared source-segment protection from
the first non-whitespace character through the last semicolon, extending through
whole crossing values/comments/directives. Do not split protected
header/first-statement groups. Preserve style/classDef passes, colon/hash
whitespace, case, repeated semicolons and directive-rejoined triggers; LS/PS
segment bounds stay distinct. Removing a selected semicolon can select another
and change the Db. Format safe suffix gaps only; atomic cuts remain failures.

Fixed cases: [fixture: gitgraph/semicolons/semicolon-header-protect] [corpus
fixture: gitgraph/style-both-words] [corpus fixture: gitgraph/style-colon-space]
[corpus fixture: gitgraph/style-tag-three-semicolons] [corpus fixture:
gitgraph/style-directive-rejoins] [fixture:
gitgraph/semicolons/semicolon-cross-trigger] [fixture:
gitgraph/semicolons/semicolon-remove-selected] [corpus fixture:
gitgraph/style-ls-segment]

Input (escaped): `"gitGraph title style:#a;b\n"`.

Output
([semicolons/semicolon-header-protect-output.mmd](../tests/fixtures/gitgraph/semicolons/semicolon-header-protect-output.mmd)):

```mmd
gitGraph title style:#a;b
```

### Trailing whitespace

Remove harmless exterior ASCII padding after ordinary headers and completed
options, names, numbers and blocks. Common line values use their outer-edge
rules. Keep trailing source inside strings, comments, directive/hidden
interiors, protected segments and continuation lines. Hidden closing-boundary
padding remains even at EOF because it can keep a required EOL visible.

Fixed cases: [fixture: gitgraph/trailing-whitespace/trailing-safe] [fixture:
gitgraph/trailing-whitespace/trailing-string-kept] [corpus fixture:
gitgraph/lex-hidden-directive-commit-eof] [fixture:
gitgraph/trailing-whitespace/hidden-eof-padding]

Input (escaped):
`"gitGraph \t\ncommit id:\"A\"  \nbranch b order:2\t\naccDescr {D}\t"`.

Output
([trailing-whitespace/trailing-safe-output.mmd](../tests/fixtures/gitgraph/trailing-whitespace/trailing-safe-output.mmd)):

```mmd
gitGraph
  commit id: "A"
  branch b order: 2
  accDescr {D}
```

### Line terminators and unicode

Reuse the shared host line-ending policy: normalize physical CR/CRLF to LF and
emit configured endOfLine, including within values, blocks and hidden forms.
Preserve LS/PS/NBSP/BOM in content; only common line-value edges trim common
whitespace. Plain block-opener whitespace can join. Structural non-ASCII
separators stay rejected. A leading BOM follows Prettier host handling, not a
byte-identity guarantee.

Fixed cases: [test: gitgraph/line-terminators-and-unicode/eol-cr] [test:
gitgraph/line-terminators-and-unicode/eol-crlf] [test:
gitgraph/line-terminators-and-unicode/eol-string-crlf] [test:
gitgraph/line-terminators-and-unicode/eol-block-cr] [test:
gitgraph/line-terminators-and-unicode/eol-hidden-crlf] [test:
gitgraph/line-terminators-and-unicode/eol-output-crlf] [test:
gitgraph/line-terminators-and-unicode/eol-output-cr] [test:
gitgraph/line-terminators-and-unicode/unicode-values] [test:
gitgraph/line-terminators-and-unicode/unicode-line-trim] [test:
gitgraph/line-terminators-and-unicode/unicode-leading-bom] [corpus fixture:
gitgraph/div-detect-bare-before-header-ls] [test:
gitgraph/line-terminators-and-unicode/unicode-to-lf-change]

Input (escaped): `"gitGraph\rcommit id:\"A\"\r"`.

Output (escaped): `"gitGraph\n  commit id: \"A\"\n"`.

### Frontmatter yaml

Send only safe real frontmatter to the existing YAML formatter. Keep delimiter
padding and malformed, indented, HTML-hazard or delimiter-producing YAML as
written. YAML uses the shared positive indentation minimum even at tabWidth
zero. If retained preheader hidden text exists, keep the entire prefix,
including leading LF, comments, bare-line trivia, second-scan forms and
real/hidden order. Removing the leading LF can promote ignored YAML into
effective title/configuration and change the Db. Hidden forms never enter the
YAML formatter.

Fixed cases: [fixture: gitgraph/frontmatter-yaml/frontmatter-safe] [fixture:
gitgraph/frontmatter-yaml/prefix-promote-change] [fixture:
gitgraph/frontmatter-yaml/prefix-retained] [corpus fixture:
gitgraph/detect-block-after-real-frontmatter] [corpus fixture:
gitgraph/lex-hidden-directive-second-scan] [corpus fixture:
gitgraph/frontmatter-html] [corpus fixture:
gitgraph/div-frontmatter-invalid-yaml] [corpus fixture:
gitgraph/div-frontmatter-cross-title-value] [fixture:
gitgraph/frontmatter-yaml/frontmatter-zero-minimum] [fixture:
gitgraph/frontmatter-yaml/frontmatter-zero-invalid] [fixture:
gitgraph/frontmatter-yaml/frontmatter-delimiter-padding] [fixture:
gitgraph/frontmatter-yaml/frontmatter-indented-kept]

Input (escaped):
`"---\ntitle:   T\nconfig: {gitGraph: {mainBranchName: trunk, mainBranchOrder: 3}}\n---\ngitGraph\ncommit\n"`.

Output
([frontmatter-yaml/frontmatter-safe-output.mmd](../tests/fixtures/gitgraph/frontmatter-yaml/frontmatter-safe-output.mmd)):

```mmd
---
title: T
config: { gitGraph: { mainBranchName: trunk, mainBranchOrder: 3 } }
---
gitGraph
  commit
```

### Final newline

Ordinary accepted files end with one configured newline, including header-only
input, final operations, bare comments and empty blocks. Remove ordinary
terminal blank runs. Preserve EOF-reaching global directives, hidden closing
padding and retained-prefix boundaries; a closed hidden form can gain the final
LF. This reuses the shared predictable file ending while respecting consumed-LF
boundaries.

Fixed cases: [corpus fixture: gitgraph/header-eof] [fixture:
gitgraph/final-newline/final-commit] [fixture:
gitgraph/final-newline/final-comment] [fixture:
gitgraph/final-newline/final-block] [fixture:
gitgraph/trailing-whitespace/hidden-eof-padding] [fixture:
gitgraph/final-newline/final-open-global] [corpus fixture:
gitgraph/div-detect-c4container-comment-eof]

Input (escaped): `"gitGraph\naccDescr{}"`.

Output
([final-newline/final-block-output.mmd](../tests/fixtures/gitgraph/final-newline/final-block-output.mmd)):

```mmd
gitGraph
  accDescr{}
```

### Specified readings

Known divergences use the specification acceptance and Db reading. Standalone
parse failures report a syntax error; Markdown declines embedding and leaves the
payload to its host. Do not repair atomic directive or selected-semicolon cuts.
Frontmatter HTML uses the body-only specified reading; opaque malformed YAML has
no invented accepted configuration or raw Db. C4 detection and bare percent
lines use existing divergence identifiers. Raw rejection has no raw Db. Empty
quoted options and empty description blocks remain accepted.

[corpus fixture: gitgraph/div-directive-in-commit] [corpus fixture:
gitgraph/div-style-semicolon-in-order-number] [corpus fixture:
gitgraph/div-frontmatter-cross-title-value] [corpus fixture:
gitgraph/div-frontmatter-invalid-yaml] [corpus fixture:
gitgraph/div-detect-c4container-comment-eof] [corpus fixture:
gitgraph/div-detect-bare-before-header-ls] [corpus fixture:
gitgraph/gram-commit-empty-values] [corpus fixture:
gitgraph/common-block-only-whitespace]

For example, `gitGraph\ncom%%{wrap}%%mit id:"A"` reports a syntax error. No
repaired output is supplied; Markdown leaves the payload to its host.

### Markdown fences

Use the shared Markdown route for the dedented payload. The host supplies
fence/list/quote indentation and EOL. It trims final payload-line padding,
including a final hidden-boundary space, but interior hidden boundaries remain.
Check host output and idempotence separately from payload Db, tree and source.

[test: gitgraph Markdown: top-level] [test: gitgraph Markdown: list] [test:
gitgraph Markdown: quote] [test: gitgraph Markdown: zero] [test: gitgraph
Markdown: tabs] [test: gitgraph Markdown: hidden-gap] [test: gitgraph Markdown:
hidden-boundary] [test: gitgraph Markdown: preheader] [test: gitgraph Markdown:
frontmatter] [test: gitgraph Markdown: global-and-semicolons] [test: gitgraph
Markdown: final-comment] [test: gitgraph Markdown: final-hidden-padding] [test:
gitgraph Markdown: rejected]

Input (escaped):

````json
"```mermaid\ngitGraph:commit id:\"Fence\"\n```\n"
````

Output (escaped):

````json
"```mermaid\ngitGraph:\n  commit id: \"Fence\"\n```\n"
````
