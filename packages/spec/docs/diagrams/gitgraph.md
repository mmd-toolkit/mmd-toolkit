# gitgraph

Japanese version: [gitgraph.ja.md](./gitgraph.ja.md)

This document defines `gitgraph`. Its source tree is in
[ast/gitgraph.md](../ast/gitgraph.md). Derived display values not used for
acceptance are summarized by the
[tests package](../../../tests/docs/db-summaries.md#gitgraph).

The syntax follows
[gitGraph.langium](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/gitGraph/gitGraph.langium),
its imported
[common.langium](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/common/common.langium)
and
[reference.langium](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/gitGraph/reference.langium).
Acceptance also follows
[gitGraphAst.ts](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/git/gitGraphAst.ts).

## Detection

Entry 19 of [detection.md](../detection.md) selects the exact case-sensitive
prefix `gitGraph`, without a suffix boundary. A suffixed header is detected but
can reject below. Neither `gitgraph` nor `GitGraph` is an alias. [fixture:
gitgraph/header-only] [fixture: gitgraph/detect-letter-suffix] [fixture:
gitgraph/detect-lowercase] [fixture: gitgraph/detect-uppercase]

The written header is `gitGraph`, `gitGraph:`, `gitGraph :`, or `gitGraph`
followed by `LR`, `TB` or `BT` and a required colon. The colon closes the
header; it is not part of a direction or a statement. No visible newline may
intervene before a separated colon or direction. `gitGraph:commit` is allowed; a
direction after the joined `gitGraph:` is not. [fixture: gitgraph/header-only]
[fixture: gitgraph/header-colon] [fixture: gitgraph/header-spaced-colon]
[fixture: gitgraph/header-lr] [fixture: gitgraph/header-tb] [fixture:
gitgraph/header-bt] [fixture: gitgraph/header-direction-no-colon] [fixture:
gitgraph/header-visible-lf-before-colon] [fixture:
gitgraph/header-visible-lf-before-direction] [fixture:
gitgraph/header-colon-commit-inline] [fixture:
gitgraph/header-glued-direction-keyword]

Common leading trivia, real frontmatter, directives, comment regions, HTML
attribute quotes, entities and selected semicolons apply. Frontmatter title is
the value Mermaid derives from the frontmatter, even under the body-only HTML
rule. [fixture: gitgraph/frontmatter-title] [fixture:
gitgraph/frontmatter-config] [fixture: gitgraph/directive-in-string] [fixture:
gitgraph/entity-all-fields] [fixture: gitgraph/html-all-texts] [fixture:
gitgraph/div-frontmatter-cross-title-value]

Detection passes at most one nonleading block satisfying the common
[Frontmatter](../common.md#frontmatter) shape, before bare percent-pair lines
and the second directive scan. It remains diagram text: the hidden YAML rule
must still match it, and GitgraphIgnoredText holds it without applying its YAML
properties. Real frontmatter may precede it. A second block is not passed, nor a
block following the second scan; a second-scan form may follow the retained
block. [fixture: gitgraph/lex-yaml-after-comment] [fixture:
gitgraph/detect-block-after-real-frontmatter] [fixture:
gitgraph/detect-two-nonleading-blocks] [fixture:
gitgraph/detect-second-scan-directive-before-block] [fixture:
gitgraph/detect-block-before-second-scan-directive]

Adjacent fences without a body line, an unclosed block, mismatched indentation,
four opening dashes, suffix text on the closing fence, a closer without its
following line break, and a preceding bare percent-pair line prevent that skip.
Leading indentation can leave only the closer indented. Three adjacent fence
lines can instead supply the common body line. A detection match does not relax
the native opener or closing boundary: non-ASCII opener padding or unreadable
Unicode after a closer still rejects. [fixture:
gitgraph/lex-nonleading-adjacent-detection] [fixture:
gitgraph/detect-retained-unclosed] [fixture:
gitgraph/detect-retained-mismatched-indent] [fixture:
gitgraph/detect-retained-opening-four-dashes] [fixture:
gitgraph/detect-retained-closing-suffix] [fixture:
gitgraph/detect-retained-no-closing-lf] [fixture:
gitgraph/detect-bare-before-retained-block] [fixture:
gitgraph/detect-block-equally-indented-fences] [fixture:
gitgraph/lex-nonleading-three-detection] [fixture:
gitgraph/detect-retained-opener-bom] [fixture:
gitgraph/detect-retained-closer-u3000]

A retained second-scan directive follows the hidden DIRECTIVE rule, including
its closing boundary. Multiple such forms can remain before the header. Bare
lines that detection passes, including `%%{}%%` and an unclosed `%%{!`, are
shared Comments marked `%%`; they are not ignored-text nodes. Neither those
lines nor the whitespace and line breaks passed with them are read again.
[fixture: gitgraph/lex-hidden-directive-second-scan] [fixture:
gitgraph/lex-hidden-directive-second-scan-glued] [fixture:
gitgraph/detect-two-second-scan-forms] [fixture:
gitgraph/detect-bare-brace-eof-header] [fixture:
gitgraph/detect-bare-unclosed-before-header]

All common whitespace passed after a bare line is trivia, whether on a line of
its own or immediately before the header, also between retained forms. Mermaid
rejects non-ASCII-space/tab/LF characters there after CR conversion; this
specification accepts them under
[bare-percent-line-before-header](../known-divergences/bare-percent-line-before-header.md).
Without a passed bare line, later Unicode whitespace remains subject to the
ordinary lexical rules. [fixture: gitgraph/div-detect-bare-before-header-ls]
[fixture: gitgraph/div-detect-bare-bom-line] [fixture:
gitgraph/detect-bare-before-header-space] [fixture:
gitgraph/detect-bare-tab-line] [fixture:
gitgraph/div-detect-retained-directive-bare-bom] [fixture:
gitgraph/div-detect-retained-yaml-bare-ls-line] [fixture:
gitgraph/div-lex-preheader-bare-between-retained-unicode] [fixture:
gitgraph/lex-preheader-hidden-no-bare-unicode] [fixture:
gitgraph/lex-leading-ls-ps]

## Lexical structure

### Ordered rules

Read the diagram text defined by [common.md](../common.md#reading-a-source) from
the detection point, omitting the detection-passed intervals just described. At
each unit start take the first matching rule in this order and restart after it;
there is no general longest-match choice. Any unreadable character or unconsumed
visible unit rejects the whole diagram, including after a valid prefix.
[fixture: gitgraph/lex-error-before-statement] [fixture:
gitgraph/lex-error-after-valid-prefix] [fixture:
gitgraph/gram-error-recovered-statement] [fixture:
gitgraph/lex-reference-common-prefix]

1. Keywords, in order: `cherry-pick`, `gitGraph:`, `HIGHLIGHT`, `gitGraph`,
   `checkout`, `REVERSE`, `parent:`, `commit`, `NORMAL`, `branch`, `order:`,
   `switch`, `type:`, `merge`, `msg:`, `tag:`, `id:`, `LR`, `TB`, `BT`, `:`.
2. `acc-descr-line` or `acc-descr-block`.
3. `acc-title-line`.
4. `title-line`.
5. `unsigned-integer`.
6. `string`.
7. `newline` (LF).
8. Hidden ASCII whitespace.
9. Hidden YAML.
10. Hidden DIRECTIVE.
11. Diagram comment.
12. `bare-reference`.

The description, title, string, hidden-form and reference conflicts are resolved
in that order. No boolean, general signed number or general identifier rule
supplies an additional alternative. [fixture: gitgraph/gram-all-fields]
[fixture: gitgraph/lex-reference-common-prefix] [fixture:
gitgraph/lex-reference-boolean-spellings] [fixture:
gitgraph/lex-hidden-directive-string] [fixture:
gitgraph/lex-hidden-directive-block] [fixture:
gitgraph/lex-reference-trailing-dash]

### Keywords and components

Keywords are case-sensitive. Only the separate `gitGraph` word requires
immediately following common whitespace, end of text or `%%`. Judge this on the
text with common directives and selected semicolons left out: a removed
directive alone supplies no boundary. The joined `gitGraph:` has no such
condition. [fixture: gitgraph/header-glued-direction] [fixture:
gitgraph/header-colon-commit-inline] [fixture:
gitgraph/directive-after-header-glued] [fixture:
gitgraph/directive-header-space] [fixture: gitgraph/header-global-before-colon]
[fixture: gitgraph/header-colon-global-glued-statement]

Other word keywords yield to a longer complete bare-reference match, but not to
an equally long one. Thus `commitA` and `LRname` can be names; `commit`, `LR`
and `NORMAL` cannot. A quote can immediately follow a keyword. A title prefix is
read earlier than a bare reference, so `titleA` cannot be a bare branch name;
`accTitleA` and `accDescrA` without their delimiters can. Quoting a name
bypasses these conflicts. [fixture: gitgraph/lex-reference-keyword-prefixes]
[fixture: gitgraph/lex-reference-reserved] [fixture:
gitgraph/lex-reference-lr-prefix] [fixture:
gitgraph/lex-reference-reserved-direction] [fixture:
gitgraph/lex-reference-reserved-type] [fixture:
gitgraph/gram-commit-glued-options] [fixture:
gitgraph/lex-reference-common-prefix] [fixture:
gitgraph/lex-reference-acctitle-prefix] [fixture:
gitgraph/lex-reference-accdescr-prefix] [fixture:
gitgraph/lex-reference-title-prefix-quoted] [fixture:
gitgraph/lex-reference-title-case-control]

The option words `id`, `msg`, `tag`, `type`, `parent` and `order` and their
colons are separate authored components. Common directives and selected
semicolons may lie at that boundary. An ordinary ASCII space/tab or a hidden
form before that colon is not allowed; the option introducer must otherwise be
contiguous. Hidden forms may follow its colon before the value. Directives
inside a word remain the existing divergence. [fixture:
gitgraph/lex-option-global-before-colon] [fixture:
gitgraph/lex-order-global-before-colon] [fixture:
gitgraph/lex-parent-global-before-colon] [fixture:
gitgraph/lex-selected-semicolon-option-word-colon] [fixture:
gitgraph/lex-option-global-before-colon-spaced-control] [fixture:
gitgraph/lex-option-hidden-before-colon] [fixture:
gitgraph/gram-commit-colon-space] [fixture:
gitgraph/lex-hidden-directive-between-option-value] [fixture:
gitgraph/div-directive-in-option-keyword]

The separated header word, direction and colon admit complete hidden forms in
their gaps, but no visible LF. A glued bare reference can already own apparent
dashes after a direction: `TB---` is not `TB` plus hidden YAML. Common trivia at
the complete direction/colon boundary is allowed. [fixture:
gitgraph/header-hidden-before-colon] [fixture:
gitgraph/header-hidden-before-direction] [fixture:
gitgraph/header-hidden-before-direction-colon] [fixture:
gitgraph/header-hidden-before-direction-colon-spaced] [fixture:
gitgraph/header-two-hidden-forms] [fixture:
gitgraph/header-global-between-direction-colon] [fixture:
gitgraph/lex-selected-semicolon-header-word-colon]

### Numbers and references

An unsigned integer is zero alone, or a nonzero ASCII digit followed by zero or
more ASCII digits whose chosen end is not immediately before a dot. The zero
alternative has no dot test. The nonzero alternative can shorten its match while
satisfying that final test. Orders reject signs, leading zeroes, fractions,
exponents and nonfinite word spellings; precision loss and overflow alone do not
reject a valid spelling. [fixture: gitgraph/number-zero] [fixture:
gitgraph/number-negative-zero] [fixture: gitgraph/number-plus] [fixture:
gitgraph/number-leading-zero] [fixture: gitgraph/number-decimal] [fixture:
gitgraph/number-exponent] [fixture: gitgraph/number-nan] [fixture:
gitgraph/number-infinity] [fixture: gitgraph/number-precision] [fixture:
gitgraph/number-overflow] [fixture:
gitgraph/lex-selected-semicolon-number-control]

A bare reference starts with an ASCII word character. Later characters are ASCII
word characters, dash, slash or dot; a multi-character match must end with a
word character or dash. Take the longest such match after earlier rules fail.
Trailing dots/slashes and bare Unicode letters reject. The integer priority
makes `1`, `1abc`, `0.1`, `0..1` and `12.3` invalid names, while `1.5`, `1.2.3`
and `9.x` can be names. Multiple trailing dashes and a dot before a final dash
are allowed. [fixture: gitgraph/lex-reference-shape] [fixture:
gitgraph/lex-reference-trailing-dot] [fixture:
gitgraph/lex-reference-trailing-slash] [fixture: gitgraph/lex-reference-digit]
[fixture: gitgraph/lex-reference-digit-prefix] [fixture:
gitgraph/lex-reference-zero-before-dot] [fixture:
gitgraph/lex-reference-multiple-digits-before-dot] [fixture:
gitgraph/lex-reference-digit-dot] [fixture: gitgraph/lex-reference-unicode]
[fixture: gitgraph/lex-reference-zero-double-dot] [fixture:
gitgraph/lex-reference-leading-single-nonzero-dot] [fixture:
gitgraph/lex-reference-word-ending-double-dash] [fixture:
gitgraph/lex-reference-dot-before-final-dash]

### Strings

A string opens and closes with matching single or double quotes and may be
empty. Content is any character other than that matching quote and backslash, or
a backslash paired with its next character. The paired character cannot be LF,
CR, LS or PS. An escaped matching quote does not close the string. Unescaped
physical line breaks, LS and PS are content. The closing quote is required; the
tree keeps escape spelling without decoding. [fixture:
gitgraph/gram-commit-single-quotes] [fixture: gitgraph/gram-commit-empty-values]
[fixture: gitgraph/lex-string-escapes] [fixture: gitgraph/lex-string-multiline]
[fixture: gitgraph/lex-string-cr] [fixture: gitgraph/lex-string-crlf] [fixture:
gitgraph/lex-string-ls-ps] [fixture: gitgraph/lex-string-backslash-lf] [fixture:
gitgraph/lex-string-escaped-ls] [fixture: gitgraph/lex-string-escaped-ps]
[fixture: gitgraph/lex-string-unclosed] [fixture:
gitgraph/lex-string-unknown-unicode-escape]

An earlier string or description block encloses hidden-looking YAML/DIRECTIVE
and bare percent-pair text. Common global directives and source comment regions
still have their shared effect inside values; these are distinct from native
diagram comments. [fixture: gitgraph/lex-hidden-directive-string] [fixture:
gitgraph/lex-hidden-directive-block] [fixture: gitgraph/lex-yaml-string]
[fixture: gitgraph/lex-yaml-block] [fixture: gitgraph/comment-bare-string]
[fixture: gitgraph/comment-block] [fixture: gitgraph/directive-in-string]

### Composite common forms

At any unit start, optional ASCII indentation may precede a common form.
`title-line` reads `title` alone, or `title`, one ASCII space/tab, and possibly
empty line text. `acc-title-line` reads `accTitle`, zero or more ASCII
spaces/tabs, colon and possibly empty line text; `acc-descr-line` does so with
`accDescr`. Line text ends at the first `%%` or physical line end. None takes a
value from the next line. Unicode colon-gap whitespace rejects. [fixture:
gitgraph/title-tab] [fixture: gitgraph/title-next-line] [fixture:
gitgraph/acctitle-next-line] [fixture: gitgraph/accdescr-next-line] [fixture:
gitgraph/title-nbsp] [fixture: gitgraph/acctitle-nbsp-colon] [fixture:
gitgraph/accdescr-nbsp-colon] [fixture: gitgraph/comment-title] [fixture:
gitgraph/lex-description-line-null]

LS/PS, single percent signs, semicolons, colons, quotes and backslashes inside
line values are ordinary text. Quote-looking text need not close. The block
alternative instead reads `accDescr`, common whitespace including newlines and
Unicode separators, `{`, and content through the first `}`. Braces do not nest
and quotes/backslashes do not protect the closer; an unclosed block rejects. A
colon chooses the line form even before a brace. [fixture:
gitgraph/eol-title-ls] [fixture: gitgraph/eol-acctitle-semicolons] [fixture:
gitgraph/common-title-open-quote] [fixture: gitgraph/common-block-quoted-escape]
[fixture: gitgraph/accdescr-block-gap] [fixture:
gitgraph/accdescr-block-nbsp-gap] [fixture:
gitgraph/lex-description-block-opener-ps] [fixture:
gitgraph/accdescr-block-first-brace] [fixture:
gitgraph/accdescr-block-quoted-brace] [fixture:
gitgraph/accdescr-block-escaped-brace] [fixture:
gitgraph/accdescr-block-unclosed] [fixture: gitgraph/gram-accdescr-colon-brace]

### Whitespace and comments

After the earlier rules, skip maximal nonempty runs of ASCII space/tab. LF is a
visible newline; common CR/CRLF conversion makes each physical terminator one
LF. Other common whitespace is not an ordinary separator, including at EOF
before the appended LF, although enclosing values or common leading trivia can
own it. [fixture: gitgraph/lex-tab] [fixture: gitgraph/lex-cr] [fixture:
gitgraph/lex-crlf] [fixture: gitgraph/lex-ls] [fixture: gitgraph/lex-ps]
[fixture: gitgraph/lex-body-nbsp] [fixture: gitgraph/lex-body-vt] [fixture:
gitgraph/lex-body-ff] [fixture: gitgraph/lex-body-u202f] [fixture:
gitgraph/lex-body-bom] [fixture: gitgraph/lex-leading-bom] [fixture:
gitgraph/lex-leading-ls-ps]

A native diagram comment reads optional ASCII indentation, `%%`, and the maximal
text before physical EOL. Its mark is `%%`, its value is the text after the
mark, and the terminating LF and preceding character remain outside it. LS/PS
stay in the value. One percent is not a comment. A common directive may separate
the two authored percent characters. A failed hidden DIRECTIVE may fall back to
this rule. [fixture: gitgraph/comment-commit-glued] [fixture:
gitgraph/comment-native-ls-content] [fixture:
gitgraph/comment-native-ps-content] [fixture: gitgraph/comment-single-percent]
[fixture: gitgraph/comment-between-mark-characters] [fixture:
gitgraph/lex-hidden-directive-fallback-complete-statement]

### Hidden YAML

At a unit start, `---`, zero or more ASCII spaces/tabs and LF open hidden YAML,
even off a physical line start. Try the body-present form first: read as few
arbitrary characters as possible through a subsequent LF followed by an
unindented `---` whose next character is LF, common whitespace or EOF. Only when
no body-present match works, try an empty body whose closer immediately follows
the opening LF. No YAML validation occurs. [fixture:
gitgraph/lex-yaml-invalid-body] [fixture: gitgraph/lex-yaml-empty-body]
[fixture: gitgraph/lex-yaml-three-adjacent-fences] [fixture:
gitgraph/lex-yaml-empty-first-spare-line] [fixture:
gitgraph/lex-yaml-body-ls-ps]

This priority can make the first following fence part of the body: three
adjacent fence lines are one form, while what looks like two empty blocks can
leave an unmatched fence. Two nonempty blocks remain distinct when the first
body has an eligible closer. Nonqualifying `---x` lines stay in the body until a
later closer; indented closers do not qualify. Earlier line values and bare
references can already own apparent opening dashes. [fixture:
gitgraph/lex-yaml-empty-then-nonempty] [fixture:
gitgraph/lex-yaml-empty-followed-later-block] [fixture:
gitgraph/lex-hidden-yaml-two-empty-in-gap] [fixture:
gitgraph/lex-yaml-three-fences-before-value] [fixture:
gitgraph/lex-yaml-two-nonempty-in-gap] [fixture:
gitgraph/lex-hidden-yaml-closer-skips-nonboundary] [fixture:
gitgraph/lex-yaml-indented-closer] [fixture:
gitgraph/lex-hidden-yaml-after-title] [fixture:
gitgraph/lex-hidden-yaml-reference-absorbs-dashes]

### Hidden DIRECTIVE and line endings

After optional ASCII padding, `%%{` opens hidden DIRECTIVE. Read arbitrary
characters through the earliest `}%%` followed by LF, common whitespace or EOF.
Its body may be empty or include physical line breaks, LS and PS. A closer
without that boundary stays in the body until a qualifying closer; without a
qualifying closer, try the later comment rule. [fixture:
gitgraph/lex-hidden-directive-between-option-value] [fixture:
gitgraph/lex-hidden-directive-boundary-word] [fixture:
gitgraph/lex-hidden-directive-boundary-ls] [fixture:
gitgraph/lex-hidden-directive-closer-skips-nonboundary] [fixture:
gitgraph/lex-hidden-directive-fallback-complete-statement]

Both hidden forms consume an immediately following LF; another whitespace
boundary is only tested and remains to be read. They provide no visible EOL. If
they consume the only LF separating a completed statement from the next
statement, the input rejects. A spare LF or an ASCII space/tab after the closer
can preserve the required EOL. At original EOF a hidden form may consume the
appended LF and EOF still satisfies EOL. [fixture:
gitgraph/lex-hidden-directive-after-commit] [fixture:
gitgraph/lex-hidden-directive-commit-spare-lf] [fixture:
gitgraph/lex-hidden-directive-commit-closing-space] [fixture:
gitgraph/lex-hidden-directive-commit-eof] [fixture:
gitgraph/lex-hidden-yaml-after-commit] [fixture:
gitgraph/lex-hidden-yaml-commit-closing-space] [fixture:
gitgraph/lex-hidden-yaml-block-eof]

The same EOL condition applies to branch, checkout, switch, merge, cherry-pick
and all four common forms. Hidden YAML after a line value is already line
content, rather than a hidden suffix. Hidden forms can occur between complete
statement components; a consumed LF inside such a gap does not itself end the
statement. [fixture: gitgraph/lex-hidden-directive-after-branch] [fixture:
gitgraph/lex-hidden-directive-after-checkout] [fixture:
gitgraph/lex-hidden-directive-after-switch] [fixture:
gitgraph/lex-hidden-directive-after-merge] [fixture:
gitgraph/lex-hidden-directive-after-cherry-pick] [fixture:
gitgraph/lex-hidden-directive-after-title] [fixture:
gitgraph/lex-hidden-directive-after-acctitle] [fixture:
gitgraph/lex-hidden-directive-after-accdescr] [fixture:
gitgraph/lex-hidden-directive-after-block] [fixture:
gitgraph/lex-hidden-yaml-after-title] [fixture:
gitgraph/lex-option-before-type-value-hidden] [fixture:
gitgraph/lex-branch-between-name-order-hidden]

Each whole skipped form has a GitgraphIgnoredText node with a named owner. Its
following consumed LF stays outside its range and value; the appended LF never
belongs to source text. Global directives/comment regions inside the form are
common trivia, and a recognized init directive retains its independent
configuration effect. The hidden form itself supplies no frontmatter or
configuration. [fixture: gitgraph/lex-hidden-yaml-global-directive-body]
[fixture: gitgraph/lex-hidden-yaml-global-comment-body] [fixture:
gitgraph/lex-hidden-directive-global-comment-body] [fixture:
gitgraph/lex-yaml-common-init-effect] [fixture:
gitgraph/lex-hidden-directive-common-init-effect] [fixture:
gitgraph/lex-yaml-after-comment]

## Grammar

The notation is that of [common.md](../common.md#notation). Hidden forms occupy
the named gaps and body places in [ast/gitgraph.md](../ast/gitgraph.md); they do
not add visible grammar units. [fixture: gitgraph/header-only] [fixture:
gitgraph/gram-all-fields] [fixture:
gitgraph/lex-hidden-directive-between-option-value]

```text
diagram = newline* header body-item* end-of-text
header = "gitGraph" (":" | direction ":")? | "gitGraph:"
direction = "LR" | "TB" | "BT"
body-item = statement | common-statement | newline
statement = commit-statement | branch-statement | checkout-statement
          | merge-statement | cherry-pick-statement
commit-statement = "commit" commit-option* eol
commit-option = id-option | message-option | tag-option | type-option
branch-statement = "branch" branch-reference order-option? eol
checkout-statement = ("checkout" | "switch") branch-reference eol
merge-statement = "merge" branch-reference merge-option* eol
merge-option = id-option | tag-option | type-option
cherry-pick-statement = "cherry-pick" cherry-pick-option* eol
cherry-pick-option = id-option | parent-option | tag-option
id-option = "id:" string
message-option = "msg:"? string
tag-option = "tag:" string
type-option = "type:" ("NORMAL" | "REVERSE" | "HIGHLIGHT")
parent-option = "parent:" string
order-option = "order:" unsigned-integer
branch-reference = bare-reference | string
common-statement = title-line eol | acc-title-line eol
                 | acc-descr-line eol | acc-descr-block eol
eol = newline+ | end-of-text
```

| Rule                                     | Node                                                           |
| ---------------------------------------- | -------------------------------------------------------------- |
| diagram, header, direction               | GitgraphDiagram fields.                                        |
| commit-statement                         | GitgraphCommitStatement.                                       |
| branch-statement                         | GitgraphBranchStatement.                                       |
| checkout-statement                       | GitgraphCheckoutStatement.                                     |
| merge-statement                          | GitgraphMergeStatement.                                        |
| cherry-pick-statement                    | GitgraphCherryPickStatement.                                   |
| id-option, message-option, tag-option    | GitgraphIdOption, GitgraphMessageOption, GitgraphTagOption.    |
| type-option, parent-option, order-option | GitgraphTypeOption, GitgraphParentOption, GitgraphOrderOption. |
| title-line, acc-title-line               | GitgraphTitleStatement, GitgraphAccTitleStatement.             |
| acc-descr-line, acc-descr-block          | GitgraphAccDescrStatement, GitgraphAccDescrBlockStatement.     |
| bare-reference, string, unsigned-integer | Identifier, StringLiteral, NumericLiteral.                     |
| Common value; hidden form                | GitgraphLiteral; GitgraphIgnoredText.                          |

The body may be empty. Commit id/message/tag/type options and merge id/tag/type
options repeat in any order; a bare quoted message and `msg:` both make message
options. Cherry-pick id/parent/tag options also repeat in any order. All
occurrences remain in source order. Branch permits at most one order after its
required name. Checkout and switch require exactly one name. [fixture:
gitgraph/header-only] [fixture: gitgraph/gram-commit-repeated-options] [fixture:
gitgraph/gram-merge-repeated-options] [fixture:
gitgraph/gram-cherry-pick-repeated-options] [fixture:
gitgraph/gram-branch-repeated-order] [fixture: gitgraph/gram-checkout] [fixture:
gitgraph/gram-switch] [fixture: gitgraph/gram-all-fields]

Missing required values, unknown options, a message on merge, a type or bare
message on cherry-pick, a second header, unsupported reset, a visible newline
between required components, and two ordinary statements on one line reject.
Line common values can instead own apparent later statements as text. A
completed description block still requires EOL. The appended LF allows a final
statement without a written terminator and contributes no source character.
[fixture: gitgraph/gram-commit-msg-missing] [fixture:
gitgraph/gram-commit-unknown-option] [fixture: gitgraph/gram-merge-message]
[fixture: gitgraph/gram-cherry-pick-unknown-option] [fixture:
gitgraph/gram-reset-unsupported] [fixture: gitgraph/gram-one-line-two-commits]
[fixture: gitgraph/directive-before-option-value-line] [fixture:
gitgraph/eol-title-semicolons] [fixture: gitgraph/eol-block-semicolon] [fixture:
gitgraph/eol-block-eof] [fixture: gitgraph/eol-commit-eof] [fixture:
gitgraph/gram-second-header]

### Semantic acceptance conditions

The following are acceptance conditions, even when the written tree can hold the
statement. Under the default configuration, these conditions are decided from
the tree alone. The default initial branch name is `main`. Converted comparison
values use the gitgraph escaping settings: `gitGraph.htmlLabels` is unset
(effectively true) and `gitGraph.securityLevel` is unset. The root default
`securityLevel: strict` does not supply that missing gitgraph setting. The
[comparison rules below](#comparison-values) define these values. [fixture:
gitgraph/db-duplicate-main] [fixture: gitgraph/db-duplicate-converted-branch]
[fixture: gitgraph/html-all-texts] [fixture: gitgraph/config-security-strict]
[fixture: gitgraph/config-security-loose]

Frontmatter `config` and init-directive arguments remain opaque under
[embedded-data-opaque](../known-divergences/embedded-data-opaque.md). They do
not change `gitGraph.mainBranchName` or `gitGraph.htmlLabels` for these
acceptance conditions: use the defaults above. The comparison reference removes
only those keys, retaining Mermaid's derived title and settings that affect only
the Db. [fixture: gitgraph/div-frontmatter-main-branch-preserves-title]
[fixture: gitgraph/div-frontmatter-html-labels-default-comparison] [fixture:
gitgraph/div-init-html-labels-default-comparison] An input whose embedded
configuration changes mermaid.js's acceptance is that divergence in either
direction: mermaid.js may accept while this specification rejects, or reject
while this specification accepts. [fixture:
gitgraph/docs-community-contributing-05cdc44b] [fixture:
gitgraph/docs-syntax-gitgraph-2ea99686] [fixture:
gitgraph/div-frontmatter-main-branch-duplicate-default-accepted] [fixture:
gitgraph/div-frontmatter-main-branch-checkout-default-accepted] [fixture:
gitgraph/div-init-main-branch-duplicate-default-accepted]

Under the default secure-key policy, `securityLevel` is secure at every nesting
level. Frontmatter and init directives cannot change root `securityLevel` or
`gitGraph.securityLevel`; Mermaid already removes those attempted values. The
gitgraph setting can still be supplied by site configuration outside the text.
[fixture: gitgraph/frontmatter-security-level-secure] [fixture:
gitgraph/directive-security-level-secure] [fixture:
gitgraph/config-gitgraph-loose]

Site configuration is outside the text. A site change to the initial branch name
or escaping can change mermaid.js's acceptance. As with
[Configuration (reference)](../../../tests/docs/configuration.md#configuration-reference),
whoever holds the site configuration applies the conditions that depend on it
using that configuration; the remaining conditions are decided from the tree
alone. Disabling `gitGraph.htmlLabels` or setting `gitGraph.securityLevel` to
loose changes the escaping, while root `htmlLabels` or `securityLevel` changes
alone do not change these comparison values. [fixture:
gitgraph/config-main-branch] [fixture: gitgraph/config-gitgraph-html-false]
[fixture: gitgraph/config-gitgraph-loose] [fixture: gitgraph/config-html-false]
[fixture: gitgraph/config-security-loose]

The configuration examples distinguish site settings from opaque embedded
settings:

- The initial branch name becomes `trunk` and its order becomes 5. [fixture:
  gitgraph/config-main-branch]
- The initial branch name becomes the empty string, without falling back to
  `main`. [fixture: gitgraph/config-main-empty-name]
- The initial branch name becomes the literal `<b>main</b>`, without the
  escaping applied to written branch names and lookup names. [fixture:
  gitgraph/config-main-html]
- The initial branch name becomes `__proto__`, which is an ordinary name.
  [fixture: gitgraph/config-main-prototype]
- Mermaid derives the initial name `trunk` and order 3 from an init directive.
  Its arguments remain opaque here, so acceptance still uses `main` and the
  default escaping. [fixture: gitgraph/directive-config]

#### Comparison values

Comparison values are taken after the [Entities rule](../common.md#entities)
replaces entity references with their placeholder strings. [fixture:
gitgraph/db-compare-entity-placeholder-duplicate] [fixture:
gitgraph/db-compare-entity-literal-hash-distinct]

The following comparison rules apply to branch names in branch, checkout, switch
and merge, to commit ids in commit and merge, and to the source id and parent id
in cherry-pick. They define equality for the acceptance conditions; the tree
still keeps the written spelling. A bare reference uses its characters. A quoted
string, with either quote style, uses its interior with the escapes below
decoded once. A bare reference and a quoted string with the same resulting
characters compare equal. [fixture: gitgraph/db-compare-bare-and-quoted]
[fixture: gitgraph/db-compare-branch-lookups] [fixture:
gitgraph/db-duplicate-converted-branch] [fixture:
gitgraph/db-converted-duplicate-id] [fixture:
gitgraph/db-compare-source-parent-from-escaped-ids] [fixture:
gitgraph/db-compare-escaped-source-parent] [fixture:
gitgraph/db-compare-escape-once]

In a quoted string, the following backslash pairs have the stated comparison
characters. Each pair consumes exactly its two written characters; a following
digit does not extend the zero escape. [fixture:
gitgraph/db-compare-escape-backspace] [fixture:
gitgraph/db-compare-escape-form-feed] [fixture:
gitgraph/db-compare-escape-line-feed] [fixture:
gitgraph/db-compare-escape-carriage-return] [fixture:
gitgraph/db-compare-escape-tab] [fixture:
gitgraph/db-compare-escape-vertical-tab] [fixture:
gitgraph/db-compare-escape-null] [fixture:
gitgraph/db-compare-escape-null-following-digit]

| Written pair | Comparison character   |
| ------------ | ---------------------- |
| `\b`         | U+0008, backspace      |
| `\f`         | U+000C, form feed      |
| `\n`         | U+000A, LF             |
| `\r`         | U+000D, CR             |
| `\t`         | U+0009, tab            |
| `\v`         | U+000B, vertical tab   |
| `\0`         | U+0000, null character |

Every other allowed backslash pair contributes its second character alone. Thus
`\q` becomes q, `\"` becomes a double quote, `\'` becomes a single quote, `\\`
becomes one backslash, and `\/` becomes a slash. There is no hexadecimal,
Unicode or octal escape: `\x41` becomes x41 and `\u0041` becomes u0041, neither
A. Do not decode a backslash produced by an earlier pair again. [fixture:
gitgraph/db-duplicate-converted-branch] [fixture:
gitgraph/db-converted-duplicate-id] [fixture:
gitgraph/db-compare-escape-double-quote] [fixture:
gitgraph/db-compare-escape-single-quote] [fixture:
gitgraph/db-compare-escape-backslash] [fixture:
gitgraph/db-compare-escape-slash] [fixture: gitgraph/db-compare-escape-hex-text]
[fixture: gitgraph/db-compare-escape-unicode-text] [fixture:
gitgraph/db-compare-escape-no-hex-unicode-decoding] [fixture:
gitgraph/db-compare-escape-once]

Use the common diagram text when reading these values, so a written CR or CRLF
inside a string becomes LF before comparison. In contrast, the decoded `\r` is a
CR, and remains distinct from that LF. The string rule still rejects a backslash
followed by a physical line break, LS or PS. [fixture:
gitgraph/db-compare-physical-line-endings] [fixture:
gitgraph/db-compare-escape-carriage-return] [fixture:
gitgraph/lex-string-backslash-lf] [fixture: gitgraph/lex-string-escaped-ls]
[fixture: gitgraph/lex-string-escaped-ps]

Retain all other whitespace and letter case: do not trim either end, collapse
runs of spaces, replace tabs or Unicode whitespace with spaces, or fold case.
Empty and whitespace-only names remain distinct. The same preservation applies
to commit ids, cherry-pick sources and parents; an unpadded value does not name
a padded id. [fixture: gitgraph/db-compare-padding-and-case] [fixture:
gitgraph/db-compare-inner-whitespace] [fixture:
gitgraph/db-compare-empty-and-whitespace] [fixture:
gitgraph/db-compare-whitespace-id-lookups] [fixture:
gitgraph/db-compare-parent-padding-mismatch] [fixture:
gitgraph/db-compare-source-padding-mismatch]

Under the default escaping settings above, apply the following comparison
spelling after escape decoding. A break form consists of `<`, an optional slash,
ASCII br in either letter case, zero or more common whitespace characters, an
optional slash, and `>`. Attribute-bearing tags and a second trailing slash do
not match a break form. Apply these steps in order:

1. Replace every break form with the exact lowercase `#br#`.
2. In the resulting text, replace `<` with `&lt;`, `>` with `&gt;`, and `=` with
   `&equals;`; leave other characters unchanged.
3. In that result, replace exact lowercase `#br#` occurrences from left to right
   with `<br/>`, using nonoverlapping matches. Do not read the replacement
   again.

Written characters and placeholders made by the first step participate together
in the third step. Both `#br<br>` and `<br>br#` become `#br#br#` after the first
step and `<br/>br#` after the third: checkout can use either spelling for the
same branch, and creating both rejects as a duplicate. These are comparison
values only, not replacements of source text in the tree. [fixture:
gitgraph/db-compare-br-overlap-checkout-accepted] [fixture:
gitgraph/db-compare-br-overlap-branch-rejected] [fixture:
gitgraph/db-compare-default-html] [fixture: gitgraph/db-compare-default-equals]
[fixture: gitgraph/db-compare-break-spellings] [fixture:
gitgraph/db-compare-break-whitespace] [fixture:
gitgraph/db-compare-break-placeholder] [fixture:
gitgraph/db-compare-break-boundaries] [fixture: gitgraph/html-all-texts]
[fixture: gitgraph/lex-branch-html-checkout]

For a repeated scalar option, use only its final occurrence when finding a
comparison value; earlier overwritten ids and parents are not independently
checked. For an ordinary commit or merge, a missing or empty comparison id means
no authored identity. An absent or empty cherry-pick source rejects, while an
absent or empty parent supplies no parent assertion; a whitespace-only id is
nonempty. [fixture: gitgraph/gram-commit-repeated-options] [fixture:
gitgraph/db-overwritten-invalid-source] [fixture:
gitgraph/db-overwritten-invalid-merge-id] [fixture:
gitgraph/gram-cherry-pick-repeated-options] [fixture:
gitgraph/db-state-empty-ids-are-fresh] [fixture: gitgraph/gram-merge-empty-id]
[fixture: gitgraph/db-cherry-pick-missing] [fixture:
gitgraph/db-cherry-pick-empty-id] [fixture:
gitgraph/gram-cherry-pick-empty-parent] [fixture:
gitgraph/db-compare-whitespace-id-lookups]

#### State of the written history

Read the statements in source order. For the checks below, keep the existing
branches and each tip, the current branch, HEAD, and the current definition of
every commit identity. A tip is a commit identity or empty; HEAD is the selected
commit or empty. Each definition gives its identity, creating branch, kind and
ordered list of parent identities. Resolving an identity always means its
current definition, including a replacement. A merge commit is one whose current
definition was created by merge; ordinary commit display types and a merge type
option do not change that distinction. [fixture: gitgraph/db-generated-ids]
[fixture: gitgraph/gram-all-fields] [fixture: gitgraph/db-three-definitions]
[fixture: gitgraph/db-state-visual-type-still-merge] [fixture:
gitgraph/db-state-replacement-removes-merge-kind]

Initially the only branch is `main`, with an empty tip; it is current and HEAD
is empty, and no commit is defined. Only site configuration outside the text
changes this initial name, as described above. An empty tip has no commit
definition. [fixture: gitgraph/header-only] [fixture:
gitgraph/db-state-empty-branch-heads] [fixture: gitgraph/db-merge-self-empty]
[fixture: gitgraph/db-merge-empty-current] [fixture:
gitgraph/db-merge-empty-other] [fixture: gitgraph/db-cherry-pick-empty-current]

When a statement creates a commit without a nonempty authored comparison id,
give it a new anonymous identity, distinct from every other identity. No written
id, even a generated-looking name, can name that identity. An ordinary commit or
merge can instead supply a nonempty comparison id; cherry-pick always creates an
anonymous identity. The recorded names generated-commit-N are summary spellings,
not authored names for those identities. [fixture: gitgraph/db-generated-ids]
[fixture: gitgraph/db-generated-name-collision] [fixture:
gitgraph/db-random-shaped-custom-id] [fixture:
gitgraph/db-state-empty-ids-are-fresh] [fixture:
gitgraph/db-state-generated-looking-source-unknown] [fixture:
gitgraph/gram-cherry-pick]

An ordinary commit creates an ordinary definition on the current branch. Its
parents are empty if HEAD is empty, otherwise the one identity of the preceding
HEAD. Its id follows the identity rule above. Make this definition HEAD and set
only the current branch tip to its identity. [fixture:
gitgraph/db-three-definitions] [fixture: gitgraph/db-state-empty-branch-heads]
[fixture: gitgraph/db-state-checkout-head] [fixture: gitgraph/db-duplicate-id]

A successful branch creates the compared name with the current HEAD identity as
its tip, or an empty tip when HEAD is empty, and makes the new branch current.
Set HEAD by resolving that tip, or leave it empty for an empty tip. With or
without order, this history effect is the same: order controls presentation
ordering, not the selected HEAD or parent identities. A successful checkout or
switch makes the named branch current and restores HEAD from its tip by the same
resolution; it creates no commit and changes no tip. [fixture:
gitgraph/db-generated-ids] [fixture: gitgraph/db-state-empty-branch-heads]
[fixture: gitgraph/db-state-checkout-head] [fixture: gitgraph/gram-branch-order]
[fixture: gitgraph/gram-branch-order-tie] [fixture: gitgraph/gram-checkout]
[fixture: gitgraph/gram-switch] [fixture:
gitgraph/db-state-replacement-source-origin]

A successful merge creates a merge definition on the current branch. Its ordered
parents are the preceding HEAD identity first and the source branch tip identity
second. Use the nonempty comparison id when supplied, otherwise a new anonymous
identity. Make the new commit HEAD and advance only the current branch tip; the
source branch tip is unchanged. [fixture: gitgraph/db-generated-ids] [fixture:
gitgraph/gram-all-fields] [fixture: gitgraph/gram-merge-empty-id] [fixture:
gitgraph/db-state-merge-head-and-source]

A successful cherry-pick resolves the source id to its current definition, then
creates a cherry-pick definition with a new anonymous identity on the current
branch. Its ordered parents are the preceding HEAD identity first and the source
identity second, even when they are equal. The parent option is only the
acceptance assertion about the source: it neither selects a new parent list nor
substitutes the asserted parent for the source identity. Make the new commit
HEAD and advance only the current branch tip; the source branch tip is
unchanged. [fixture: gitgraph/gram-cherry-pick] [fixture:
gitgraph/gram-cherry-pick-merge-parent] [fixture:
gitgraph/db-ordinary-parent-accepted] [fixture:
gitgraph/db-cherry-source-ancestor-on-current-tip] [fixture:
gitgraph/db-state-cherry-head-and-source]

When an ordinary commit reuses an identity, replace its entire current
definition, including its creating branch, kind and parents, with the new
definition. Other branch tips and all existing parent lists keep their identity
references; do not rewrite them or retain a separate old definition for their
lookups. They therefore resolve the replaced identity to the new definition.
HEAD becomes the replacement and the current branch tip is set as for any
ordinary commit. Self-parent identities and cycles are allowed; an ordinary
replacement of a merge is no longer a merge for later checks. [fixture:
gitgraph/db-duplicate-id] [fixture: gitgraph/db-three-definitions] [fixture:
gitgraph/db-converted-duplicate-id] [fixture:
gitgraph/db-duplicate-earlier-id-current-head] [fixture:
gitgraph/db-state-replacement-source-origin] [fixture:
gitgraph/db-duplicate-replaces-merge-type] [fixture:
gitgraph/db-state-replacement-removes-merge-kind]

Directions, common title/accessibility statements, messages, tags, hidden forms,
comments and whitespace do not change this history state. A type option changes
presentation, not the branch tips, HEAD or parent identities described here.
[fixture: gitgraph/gram-all-fields] [fixture:
gitgraph/db-state-common-forms-preserve-head] [fixture:
gitgraph/db-state-visual-type-still-merge]

Consequently, the sequence `commit`, `branch b`, `commit`, `checkout main`,
`merge b` is accepted. Branch `b` initially shares the first commit identity,
the second commit advances only `b`, checkout restores the first commit as HEAD,
and merge creates a new identity whose parents are that HEAD and `b`’s new tip,
in that order. [fixture: gitgraph/db-generated-ids]

#### Rejections

Test each statement against the pre-statement history and the comparison values
above. If any condition in the table holds, reject the input. Otherwise apply
that statement’s state change. An immediate parent means a member of the ordered
parent list in the source identity’s current definition; no ancestry search is
made. These rules follow
[gitGraphAst.ts](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/git/gitGraphAst.ts#L49-L394).
[fixture: gitgraph/db-merge-self] [fixture:
gitgraph/db-cherry-pick-invalid-parent] [fixture:
gitgraph/db-ordinary-parent-accepted] [fixture:
gitgraph/db-cherry-source-ancestor-on-current-tip] [fixture:
gitgraph/db-state-replacement-source-origin]

| Operation         | Rejection condition                                                                                                                                                                                                                                                                                                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| branch            | Reject an effective name already used by a branch, including the initial branch (`main` by default); whoever holds the site configuration applies a changed initial name as described above. [fixture: gitgraph/db-duplicate-branch] [fixture: gitgraph/db-duplicate-main] [fixture: gitgraph/db-duplicate-converted-branch]                                                                  |
| checkout / switch | Reject an effective branch name that does not exist. [fixture: gitgraph/db-checkout-unknown] [fixture: gitgraph/db-switch-unknown]                                                                                                                                                                                                                                                            |
| merge             | Reject when both tips exist and the commit at the current tip was created on the named source branch. [fixture: gitgraph/db-merge-current-created-on-source] [fixture: gitgraph/db-merge-same-current-origin-different-head]                                                                                                                                                                  |
| merge             | Reject merging the current branch into itself, even without commits. [fixture: gitgraph/db-merge-self] [fixture: gitgraph/db-merge-self-empty]                                                                                                                                                                                                                                                |
| merge             | Reject a current tip without a commit definition, an unknown source branch, a source tip without a commit definition, or tips resolving to the same current definition. [fixture: gitgraph/db-merge-empty-current] [fixture: gitgraph/db-merge-unknown] [fixture: gitgraph/db-merge-unknown-generated-prefix] [fixture: gitgraph/db-merge-empty-other] [fixture: gitgraph/db-merge-same-head] |
| merge             | Reject a nonempty effective custom id that already names a defined commit. [fixture: gitgraph/db-merge-duplicate-id] [fixture: gitgraph/db-overwritten-invalid-merge-id]                                                                                                                                                                                                                      |
| cherry-pick       | Reject an absent, empty or unknown effective source id. [fixture: gitgraph/db-cherry-pick-missing] [fixture: gitgraph/db-cherry-pick-empty-id] [fixture: gitgraph/db-cherry-pick-unknown]                                                                                                                                                                                                     |
| cherry-pick       | Reject a nonempty effective parent that is not an immediate parent of the source, even for a nonmerge source. [fixture: gitgraph/db-cherry-pick-invalid-parent] [fixture: gitgraph/db-ordinary-parent-accepted]                                                                                                                                                                               |
| cherry-pick       | Reject a merge source with an absent or empty effective parent; a visual custom type does not remove this requirement. [fixture: gitgraph/db-cherry-pick-merge-no-parent] [fixture: gitgraph/db-merge-empty-parent] [fixture: gitgraph/gram-cherry-pick-merge-parent]                                                                                                                         |
| cherry-pick       | Reject a source created on the current branch, or a current branch without a commit definition at its tip. [fixture: gitgraph/db-cherry-pick-same-branch] [fixture: gitgraph/db-cherry-pick-empty-current]                                                                                                                                                                                    |

Branch of creation is tested rather than ancestry: a source already reachable
through a merge can still be picked. There is no authored cherry-pick target-id
option. [fixture: gitgraph/db-overwritten-invalid-source] [fixture:
gitgraph/db-overwritten-invalid-merge-id] [fixture:
gitgraph/gram-cherry-pick-repeated-options] [fixture:
gitgraph/db-cherry-source-ancestor-on-current-tip] [fixture:
gitgraph/gram-cherry-pick-unknown-option]

Unknown branches and failed cherry-pick/merge conditions remain rejections;
representability alone is not a reverse-direction divergence. [fixture:
gitgraph/db-duplicate-id] [fixture: gitgraph/db-three-definitions] [fixture:
gitgraph/db-generated-name-collision] [fixture:
gitgraph/db-duplicate-replaces-merge-type] [fixture:
gitgraph/db-checkout-unknown] [fixture: gitgraph/db-cherry-pick-invalid-parent]

### Db normalization

The [tests summary](../../../tests/docs/db-summaries.md#gitgraph) describes
values not needed by these acceptance checks: summary spellings for anonymous
identities, displayed strings and tags, common-value conversion and publication,
number precision, and summary/display ordering of commits and branches. The
comparison values and history used for acceptance are defined above, not by that
summary. Authored leaves and all option/statement occurrences stay in the tree;
messages remain there even though the rendering summary omits them. [fixture:
gitgraph/gram-all-fields] [fixture: gitgraph/lex-string-escapes] [fixture:
gitgraph/number-precision] [fixture: gitgraph/db-generated-ids] [fixture:
gitgraph/gram-commit-repeated-options] [fixture: gitgraph/common-third-values]
[fixture: gitgraph/title-repeat-empty] [fixture: gitgraph/db-three-definitions]
[fixture: gitgraph/gram-cherry-pick-tags] [fixture:
gitgraph/gram-branch-order-tie] [fixture: gitgraph/config-main-branch]

## Known divergences

**[directive-as-token-boundary](../known-divergences/directive-as-token-boundary.md).**
Whole hidden forms have GitgraphIgnoredText owners and common trivia can cut
strings/common literals. A directive strictly inside a keyword word,
direction/type word, integer or bare reference cannot be held as a separate
complete component without joining its spelling. The direct atomic rule
therefore rejects these Mermaid-accepted inputs under reason 2. It introduces no
input accepted only here. A directive between an option word and colon, or
inside quoted text, is allowed; both-rejected glued boundary cases carry no
mark. [fixture: gitgraph/div-directive-in-header] [fixture:
gitgraph/div-directive-in-commit] [fixture:
gitgraph/div-directive-in-option-keyword] [fixture:
gitgraph/div-directive-in-type] [fixture: gitgraph/div-directive-in-number]
[fixture: gitgraph/div-directive-in-reference] [fixture:
gitgraph/lex-option-global-before-colon] [fixture: gitgraph/directive-in-string]
[fixture: gitgraph/directive-after-header-glued]

**[ignored-semicolon-as-token-boundary](../known-divergences/ignored-semicolon-as-token-boundary.md).**
A whole skipped form has a node; an arbitrary semicolon inside an atomic word,
reference or integer does not. Selected semicolons strictly inside those atoms
reject here although Mermaid joins them. This uses reason 2 and has no
acceptance in the reverse direction. A selected semicolon at the option
word/colon boundary or after a complete number is trivia; an unselected
semicolon rejects in both readings. [fixture:
gitgraph/div-style-semicolon-in-order-keyword] [fixture:
gitgraph/div-style-semicolon-in-order-number] [fixture:
gitgraph/div-lex-selected-semicolon-type-word] [fixture:
gitgraph/div-lex-selected-semicolon-bare-reference-valid] [fixture:
gitgraph/lex-selected-semicolon-option-word-colon] [fixture:
gitgraph/lex-selected-semicolon-number-control] [fixture:
gitgraph/lex-selected-semicolon-reference]

**[html-tag-in-frontmatter](../known-divergences/html-tag-in-frontmatter.md).**
The tree can hold frontmatter and body strings independently. A cross-fence HTML
match cannot belong to one of those nodes without crossing their boundary. The
direct body-only HTML rule uses reason 2: both-accepted values can differ,
Mermaid-only acceptance can reject here, and Mermaid rejection can accept here.
Keep the frontmatter title as Mermaid derives it; ordinary body tags and
frontmatter tags with no differing result are unmarked. [fixture:
gitgraph/div-frontmatter-cross-title-value] [fixture:
gitgraph/div-frontmatter-cross-string-enable] [fixture:
gitgraph/div-frontmatter-cross-string-block] [fixture:
gitgraph/frontmatter-body-tag-control] [fixture: gitgraph/frontmatter-html]

**[embedded-data-opaque](../known-divergences/embedded-data-opaque.md).**
Frontmatter has a source node whose body remains opaque. Invalid leading YAML
rejected by Mermaid is accepted here. The rejection of the written input
supplies no Db, but the accepted reference defined by the comparison rule
supplies the comparison Db and embedded values recorded in `specified.json`,
under
[The comparison Db](../known-divergences/embedded-data-opaque.md#the-comparison-db).
For these two frontmatters, that Db is an empty gitgraph history with the
initial `main` branch. [fixture: gitgraph/div-frontmatter-invalid-yaml]
[fixture: gitgraph/div-frontmatter-html-invalid-yaml] Embedded configuration
does not change the default initial branch or escaping used for acceptance here.
Configuration can therefore make Mermaid accept a diagram rejected here, or
reject a diagram accepted here. [fixture:
gitgraph/docs-community-contributing-05cdc44b] [fixture:
gitgraph/docs-syntax-gitgraph-2ea99686] [fixture:
gitgraph/div-frontmatter-main-branch-duplicate-default-accepted] [fixture:
gitgraph/div-frontmatter-main-branch-checkout-default-accepted] [fixture:
gitgraph/div-init-main-branch-duplicate-default-accepted] Invalid nonleading
hidden YAML already agrees because GitgraphIgnoredText owns it; malformed init
arguments that Mermaid accepts are not differing inputs. [fixture:
gitgraph/div-frontmatter-invalid-yaml] [fixture:
gitgraph/div-frontmatter-html-invalid-yaml] [fixture:
gitgraph/lex-yaml-invalid-body] [fixture: gitgraph/directive-invalid-init]

**[c4-keyword-anywhere](../known-divergences/c4-keyword-anywhere.md).**
References, strings, common literals, ignored text and Comments can hold the C4
words as written. Apply detection only at the header under reverse reason 2:
`C4Container`, `C4Component`, `C4Dynamic` or `C4Deployment` in later text can
reject in Mermaid but accept here. This rule rejects no Mermaid-accepted input.
`C4Context` later in text and LF-terminated comment controls do not differ.
[fixture: gitgraph/div-detect-c4container-id] [fixture:
gitgraph/div-detect-c4component-branch] [fixture:
gitgraph/div-detect-c4dynamic-message] [fixture:
gitgraph/div-detect-c4deployment-tag] [fixture:
gitgraph/div-detect-c4container-title] [fixture:
gitgraph/div-detect-c4component-acctitle] [fixture:
gitgraph/div-detect-c4dynamic-accdescr] [fixture:
gitgraph/div-detect-c4deployment-block] [fixture:
gitgraph/div-detect-c4container-comment-eof] [fixture:
gitgraph/div-detect-c4component-header-comment-eof] [fixture:
gitgraph/detect-c4context-id] [fixture: gitgraph/detect-c4container-comment-lf]

**[bare-percent-line-before-header](../known-divergences/bare-percent-line-before-header.md).**
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

Hidden forms and duplicate commits need no new divergence: their nodes hold what
was written. Empty quoted options and description blocks have their own syntax,
so tokenless-empty-forms does not apply. The lowercase introductory prose in the
upstream documentation does not create a header alias. [fixture:
gitgraph/gram-commit-empty-values] [fixture:
gitgraph/lex-description-block-only-directive] [fixture:
gitgraph/db-duplicate-id] [fixture: gitgraph/detect-lowercase]

Upstream
[gitgraph.md](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/gitgraph.md)
documents quoted ids, branch order, merge, cherry-pick and directions. Checked
on 2026-10-23: [#4838](https://github.com/mermaid-js/mermaid/issues/4838) is
closed with Status: Approved; merged
[#6707](https://github.com/mermaid-js/mermaid/pull/6707) adds a duplicate-id
warning, not rejection.
[#3715](https://github.com/mermaid-js/mermaid/issues/3715) reports
numeric-prefix names. Merged
[#3726](https://github.com/mermaid-js/mermaid/pull/3726) supports quoted branch
names. [#7125](https://github.com/mermaid-js/mermaid/issues/7125) is open with
Status: Approved and [#7155](https://github.com/mermaid-js/mermaid/pull/7155) is
an unmerged origin-guard proposal. These facts do not change the pinned
acceptance conditions.
