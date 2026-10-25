# Architecture

Japanese version: [architecture.ja.md](./architecture.ja.md)

This document defines `architecture-beta`. Its
[source tree](../ast/architecture.md) keeps authored syntax; the
[tests summary](../../../tests/docs/db-summaries.md#architecture) defines
derived Db values. The syntax follows [architecture.langium][grammar],
[arch.langium][arch] and [common.langium][common]. [fixture:
architecture/header-beta] [fixture: architecture/db-mixed]

## Detection

Entry 5 of [detection.md](../detection.md), the [architecture
detector][detector], selects the exact lowercase prefix `architecture`, with no
suffix boundary. Only `architecture-beta` is an accepted header. Bare
`architecture`, uppercase spelling, repeated headers and letter, digit,
underscore, dash or Unicode suffixes reject. Architecture is registered before
C4 in [diagram-orchestration.ts][order]; C4 words inside architecture text do
not select C4. [fixture: architecture/header-beta] [fixture:
architecture/header-bare-rejected] [fixture: architecture/header-uppercase]
[fixture: architecture/header-repeated] [fixture:
architecture/header-letter-suffix] [fixture: architecture/header-digit-suffix]
[fixture: architecture/header-underscore-suffix] [fixture:
architecture/header-dash-suffix] [fixture: architecture/header-unicode-suffix]
[fixture: architecture/c4-component-service] [fixture:
architecture/c4-header-lf-comment]

Apply [common preprocessing](../common.md#reading-a-source), including real
leading frontmatter, directives, comment regions, leading whitespace, line
conversion, HTML attribute quotes, entities and selected semicolons. Real
frontmatter is a shared Frontmatter, not an architecture statement. It is
distinct from retained YAML-shaped diagram text. [fixture:
architecture/frontmatter-title] [fixture: architecture/frontmatter-config]
[fixture: architecture/space-bom-leading] [fixture: architecture/line-crlf]
[fixture: architecture/html-all-fields] [fixture:
architecture/common-quotes-entities] [fixture: architecture/style-fields]

At the detection point, pass at most one retained block satisfying the common
[Frontmatter shape](../common.md#frontmatter), before bare percent-pair lines
and the second directive scan. The block remains diagram text and must match the
native YAML rule; ArchitectureIgnoredText in textBeforeHeader owns it without
applying its properties. Real frontmatter may precede it, and a second-scan
directive may follow it. A second retained block, a block after a passed bare
line, or one after a second-scan directive is not passed. [fixture:
architecture/detection-after-frontmatter] [fixture:
architecture/detect-retained-before-second-scan] [fixture:
architecture/detect-retained-after-second-scan] [fixture:
architecture/detect-retained-two-blocks] [fixture:
architecture/retained-prefix-between-bare]

Adjacent fences without a body line, a missing closer, mismatched indentation,
four opening dashes, closing suffix text and a closer without a following line
break stop the detection skip. Three adjacent fences can provide a body line.
Leading trimming can remove only opening indentation; leading BOM trivia can
instead disappear before the detection point. Passing detection does not relax
native opening or closing whitespace rules. [fixture:
architecture/detect-retained-adjacent-fences] [fixture:
architecture/detect-retained-unclosed] [fixture:
architecture/detect-retained-indent-both] [fixture:
architecture/detect-retained-indent-opening] [fixture:
architecture/detect-retained-four-dashes] [fixture:
architecture/detect-retained-closing-suffix] [fixture:
architecture/detect-retained-closer-no-lf] [fixture:
architecture/detect-retained-closer-at-eof] [fixture:
architecture/detect-retained-three-fences] [fixture:
architecture/detect-retained-leading-bom] [fixture:
architecture/detect-retained-opener-nbsp] [fixture:
architecture/detect-retained-closer-u3000]

The diagram reads retained forms from the detection point, not only from the
reached header. A directive found only by the second scan is a native hidden
DIRECTIVE in textBeforeHeader and must satisfy its own closing boundary; a glued
header rejects. Keep multiple retained forms separately. Passed bare lines,
including empty-brace and unclosed non-directive percent-brace forms, are shared
Comments with mark `%%`. Their accompanying whitespace and line breaks are
trivia and are not read again, also between retained forms. [fixture:
architecture/detect-retained-before-second-scan] [fixture:
architecture/detect-second-scan-glued] [fixture:
architecture/detect-two-second-scan-forms] [fixture:
architecture/detect-empty-braces-bare] [fixture:
architecture/detect-unclosed-brace-bare] [fixture:
architecture/detect-retained-bare-second-scan] [fixture:
architecture/retained-directive-between-bare]

Common whitespace passed with a bare line is trivia immediately before the
header, on its own line or between retained forms. Native Mermaid rejects some
of that Unicode whitespace; these inputs are
[bare-percent-line-before-header](../known-divergences/bare-percent-line-before-header.md).
Without a passed line, the same gap remains native diagram text and can reject.
[fixture: architecture/detection-bare-space] [fixture:
architecture/detection-bare-tab] [fixture:
architecture/detection-bare-before-header-ls] [fixture:
architecture/detection-bare-ls] [fixture: architecture/div-retained-bare-ls]
[fixture: architecture/div-retained-bare-second-scan-ls] [fixture:
architecture/retained-yaml-no-bare] [fixture:
architecture/retained-directive-no-bare] [fixture:
architecture/detect-retained-bare-ascii]

## Lexical structure

### Ordered rules

Read converted diagram text from the detection point, excluding passed intervals
above. At each position take the first applicable rule below and restart after
it. There is no general longest-match choice. Word keywords have an explicit
longer ID alternative; both dash rules have a longer hidden YAML alternative.
Unreadable characters reject the whole input. The effective order follows
[module.ts][module], [tokenBuilder.ts][builder] and the imported grammars.
[fixture: architecture/db-mixed] [fixture:
architecture/hidden-yaml-after-header] [fixture:
architecture/error-after-prefix] [fixture:
architecture/error-recovered-statement] [fixture:
architecture/lex-keyword-prefix-ids]

| Priority | Unit                             | Reading                                                                       |
| -------- | -------------------------------- | ----------------------------------------------------------------------------- |
| 1–11     | Keywords                         | architecture-beta, junction, service, column, group, align, row, --, in, :, - |
| 12       | port-direction                   | L, R, T or B                                                                  |
| 13       | group-modifier                   | {group}                                                                       |
| 14       | arrow-marker                     | < or >                                                                        |
| 15       | acc-descr-line / acc-descr-block | Composite common form                                                         |
| 16       | acc-title-line                   | Composite common form                                                         |
| 17       | title-line                       | Composite common form                                                         |
| 18       | string                           | Quoted text icon                                                              |
| 19       | id                               | Bare name                                                                     |
| 20       | newline                          | LF                                                                            |
| 21       | ASCII padding                    | Hidden space/tab                                                              |
| 22       | hidden-yaml                      | Whole fenced form                                                             |
| 23       | hidden-directive                 | Whole percent-brace form                                                      |
| 24       | native-comment                   | Percent pair through line end                                                 |
| 25       | icon                             | Parenthesized icon name                                                       |
| 26       | label                            | Bracketed title                                                               |

Only ASCII space and tab are skipped between units; newline is visible. Common
CR/CRLF conversion applies first. NBSP, BOM, U+2028, U+2029 and other common
whitespace are not general unit separators here, though common leading trivia,
passed detection trivia and enclosing values can admit them. Imported boolean
and numeric terminals supply no units: numeric-looking IDs and labels remain
text. [fixture: architecture/space-tabs] [fixture: architecture/space-body-nbsp]
[fixture: architecture/space-bom-body] [fixture:
architecture/space-final-unicode] [fixture: architecture/space-unicode-values]
[fixture: architecture/line-cr] [fixture: architecture/line-crlf] [fixture:
architecture/line-ls-between] [fixture: architecture/line-ps-eof] [fixture:
architecture/lex-numeric-ids-text] [fixture: architecture/lex-id-common-names]

### Names, keyword boundaries and directions

An ID starts with an ASCII letter, digit or underscore, continues with those
characters or dash, and cannot end with dash. Take as many characters as this
form permits. Earlier keywords and common forms still take priority. Longer
names such as serviceX and columnar are IDs; exact keywords are not.
Port-direction takes the initial L/R/T/B of a name without a word boundary, so
such an ID rejects. The empty suffix of title-line takes the title prefix even
in titleX. Without their required colon or brace, accTitle and accDescr can be
IDs. [fixture: architecture/lex-id-numeric] [fixture:
architecture/lex-id-final-dash] [fixture: architecture/lex-id-unicode] [fixture:
architecture/lex-keyword-prefix-ids] [fixture:
architecture/lex-direction-id-exact] [fixture:
architecture/lex-direction-id-prefix] [fixture:
architecture/lex-keyword-terminal-priority] [fixture:
architecture/lex-id-common-prefix] [fixture: architecture/lex-id-common-names]
[fixture: architecture/spec-architecture-c5579915]

Keywords have no additional whitespace or percent-pair boundary beyond the
longer-ID alternative. The header can touch a complete hidden YAML form, but a
suffix that creates a longer ID prevents the header match. Judge this after
global directives and selected semicolons are left out. A removed directive does
not supply a boundary. A boundary also does not make non-ASCII whitespace a
legal gap. [fixture: architecture/hidden-yaml-after-header] [fixture:
architecture/header-glued-service] [fixture:
architecture/directive-keyword-rejoin] [fixture: architecture/header-comment]
[fixture: architecture/space-body-3000]

A port direction is exactly L, R, T or B. The group modifier is exactly {group},
with no interior padding; empty braces are not a modifier. Either < or > is
accepted at either end of an arrow, independently. The tree preserves the actual
spelling, including `>--<`. [fixture: architecture/error-direction-lowercase]
[fixture: architecture/lex-edge-empty-braces] [fixture:
architecture/db-directions] [fixture:
architecture/gram-edge-reversed-labeled-markers]

### Icons, strings and bracketed labels

An icon is an opening parenthesis, a nonempty name of ASCII letters, digits,
underscores, dashes and colons, then a closing parenthesis. Its name has no ID
start/end restriction: `(-:A_)` and `(:-)` are valid. Empty parentheses, spaces
and quoted text inside the parentheses reject. Unknown icon names are accepted.
[fixture: architecture/lex-icon-leading-symbols] [fixture:
architecture/lex-icon-empty] [fixture: architecture/lex-icon-spaces] [fixture:
architecture/lex-icon-text-parenthesized] [fixture:
architecture/db-unknown-icon]

A string is single-quoted or double-quoted, closes with the same quote, and may
be empty. Inside it, read any character other than that quote or backslash,
including LF, U+2028 and U+2029; a backslash instead takes the next character,
which must not be LF, CR, U+2028 or U+2029. There is no unclosed-string form. A
service accepts this string as a text icon without parentheses; a group does
not. Authored values keep escape spelling rather than the STRING converter
result. [fixture: architecture/db-empty-values] [fixture:
architecture/lex-string-conversion] [fixture:
architecture/lex-string-number-escape] [fixture:
architecture/line-lf-string-title] [fixture: architecture/line-ls-ps-values]
[fixture: architecture/lex-string-escaped-ls] [fixture:
architecture/lex-string-unclosed] [fixture: architecture/lex-group-string-icon]

A bracketed label tries these alternatives in order immediately after its
opening bracket: a complete double-quoted string followed immediately by the
closing bracket; then the same with single quotes; then one or more characters
other than either bracket, CR or LF, followed by the closing bracket. Read as
much bare text as possible. Quoted text may contain brackets and ordinary line
breaks. The string escape recognition above applies to the quoted alternatives.
The first alternative that completes the whole label decides kind; later
conversion does not decide it. [fixture: architecture/lex-title-quoted-brackets]
[fixture: architecture/line-lf-string-title] [fixture:
architecture/lex-title-conversion] [fixture:
architecture/lex-title-cross-quote-escape] [fixture:
architecture/lex-title-padded-quotes] [fixture:
architecture/lex-title-padded-quoted-brackets] [fixture:
architecture/lex-title-single-quoted-brackets]

Bare text may contain quotes, backslashes, U+2028 and U+2029, and need not be a
well-formed quoted string. Thus `["open]`, `[A"B]`, `["A"B"]` and a trailing
backslash can be bare labels. `[ "x" ]` is bare, while `["[x]"]` is quoted and
`[ "[x]" ]` rejects. A backslash followed by U+2028 can fail the quoted
alternative but succeed as bare text. Empty [] rejects; whitespace-only and
quoted-empty labels are accepted. [fixture:
architecture/lex-title-unclosed-quote-with-close] [fixture:
architecture/lex-title-bare-inner-quote] [fixture:
architecture/lex-title-unquoted-fallback] [fixture:
architecture/lex-title-unescaped-quote-fallback] [fixture:
architecture/lex-title-bare-trailing-backslash] [fixture:
architecture/lex-title-quoted-backslash-fallback] [fixture:
architecture/lex-title-padded-quotes] [fixture:
architecture/lex-title-quoted-brackets] [fixture:
architecture/lex-title-padded-quoted-brackets] [fixture:
architecture/lex-label-escaped-ls-fallback] [fixture:
architecture/line-ls-ps-values] [fixture: architecture/lex-title-empty-unquoted]
[fixture: architecture/db-empty-values] [fixture:
architecture/db-title-quote-only-double] [fixture:
architecture/db-title-quote-only-single] [fixture:
architecture/db-title-quote-only-padded] [fixture:
architecture/db-edge-title-quote-only] [fixture:
architecture/db-title-bare-escaped-double-quote] [fixture:
architecture/db-title-bare-escaped-single-quote]

Icon, label and modifier matches are whole composite forms under the ordered
rules above. Their authored components are ( / icon-name / ), [ / label-content
/ ], and { / group / }; double dash is one indivisible line unit. Global
directives may separate complete components, including a delimiter and its name,
but may not split icon-name, id, a fixed keyword or double dash. Text/string
contents may contain global directives. Native hidden forms and padding cannot
split an icon or modifier, and native hidden-looking text enclosed by a label
stays label content. [fixture: architecture/directive-edge-components] [fixture:
architecture/directive-parent-align-components] [fixture:
architecture/directive-icon-delimiters] [fixture:
architecture/div-directive-icon-name] [fixture: architecture/div-directive-name]
[fixture: architecture/directive-group-delimiters] [fixture:
architecture/div-directive-group-word] [fixture:
architecture/div-directive-line] [fixture: architecture/directive-fields]
[fixture: architecture/gram-hidden-inside-icon] [fixture:
architecture/gram-hidden-inside-modifier] [fixture:
architecture/lex-icon-spaces] [fixture:
architecture/hidden-directive-inside-values]

Choose the label alternative on the common converted diagram text. Its kind
therefore respects HTML attribute-quote conversion and selected semicolons,
while its value keeps the authored text under the written-value rules. [fixture:
architecture/html-label-authored-quotes] [fixture:
architecture/lex-label-selected-semicolon-after-quote]

### Composite common forms

The common forms take their keyword, punctuation and value together, before IDs
or comments. A title-line starts with title, then optionally exactly one ASCII
space/tab separator and the rest of its line. An acc-title-line starts with
accTitle, optional ASCII space/tab, colon and its line value; acc-descr-line
uses accDescr in the same way. Line values stop before the first percent pair or
LF. A title without its separator is empty; title: is not a colon form. No line
form takes the next statement as its value. [fixture:
architecture/common-title-next-statement] [fixture:
architecture/common-acctitle-next-statement] [fixture:
architecture/common-accdescr-next-statement] [fixture:
architecture/common-colon-title] [fixture:
architecture/common-title-nbsp-separator] [fixture:
architecture/common-acctitle-nbsp-colon] [fixture:
architecture/common-title-comment-gap] [fixture:
architecture/common-acctitle-comment-gap] [fixture:
architecture/common-accdescr-comment-gap] [fixture:
architecture/common-title-literal-quotes]

The block form is accDescr, zero or more common whitespace characters, opening
brace, any characters through the first closing brace. Its content can be empty
and include LF, U+2028 and U+2029. Quote and backslash do not protect a closing
brace. The brace is required. The colon alternative is tried before the block
alternative, so brace-looking text after the colon stays a line value. [fixture:
architecture/common-empty-block-after-value] [fixture:
architecture/common-block-whitespace] [fixture:
architecture/common-block-ls-gap] [fixture: architecture/common-block-bom-gap]
[fixture: architecture/common-block-newline-gap] [fixture:
architecture/common-block-first-close] [fixture:
architecture/common-block-quoted-close] [fixture:
architecture/common-block-escaped-close] [fixture:
architecture/common-block-open] [fixture:
architecture/hidden-yaml-accdescr-absorbs-opener] [fixture:
architecture/lex-description-colon-first] [fixture:
architecture/lex-description-glued-block]

### Hidden forms and comments

Hidden YAML opens with three dashes, optional ASCII space/tab and LF. Try a
body-present match first: read any characters, including LF, U+2028 and U+2029,
as few as allow a following LF and an unindented three-dash closer. The closer
consumes a following LF; otherwise it requires immediate common whitespace or
EOF by lookahead. Only if this alternative fails, try an adjacent empty closer.
A nonqualifying closer is content and the search continues. [fixture:
architecture/hidden-yaml-open-padding] [fixture:
architecture/hidden-yaml-open-nbsp] [fixture:
architecture/hidden-yaml-close-indent] [fixture:
architecture/hidden-yaml-close-suffix] [fixture:
architecture/hidden-yaml-adjacent-eof] [fixture:
architecture/hidden-yaml-adjacent-later-closer] [fixture:
architecture/hidden-yaml-three-fences] [fixture:
architecture/lex-yaml-ls-ps-body] [fixture: architecture/hidden-yaml-close-nbsp]
[fixture: architecture/hidden-yaml-close-ps]

Consequently three adjacent fences can be one hidden form, and an adjacent
empty-looking pair can consume later statements through a later qualifying
closer. Two nonempty blocks can instead remain separate. YAML properties have no
effect here. Common directives or comment regions inside the form keep their
common ownership; other interior text stays in the ignored value. [fixture:
architecture/hidden-yaml-three-fences] [fixture:
architecture/hidden-yaml-adjacent-later-closer] [fixture:
architecture/lex-yaml-two-nonempty] [fixture:
architecture/lex-yaml-global-directive] [fixture:
architecture/lex-yaml-common-comment] [fixture:
architecture/lex-yaml-global-opener] [fixture:
architecture/lex-yaml-selected-semicolon] [fixture:
architecture/lex-native-directive-selected-semicolon]

A native hidden DIRECTIVE starts with optional ASCII space/tab and %%{, then
reads any characters, including LF, U+2028 and U+2029, through the first }%%
that satisfies the same closing boundary as hidden YAML. A later qualifying
closer can follow a nonqualifying one. This is distinct from a common Directive;
its body is not configuration. A failed native form can fall back to a native
comment. [fixture: architecture/hidden-directive-body] [fixture:
architecture/hidden-directive-nonqualifying-close] [fixture:
architecture/hidden-directive-close-glued] [fixture:
architecture/hidden-directive-unclosed] [fixture:
architecture/hidden-directive-close-ls] [fixture:
architecture/hidden-directive-close-ps] [fixture:
architecture/lex-directive-ls-ps-body] [fixture:
architecture/lex-native-directive-common-comment]

A hidden form supplies no visible EOL even when it consumes LF. Before another
statement, the preceding statement still needs a surviving LF: a spare LF or
ASCII padding after the closer can leave one. At EOF, hidden consumption of the
appended LF still leaves end-of-text available. Keep that consumed following LF
outside the ignored node. Each whole form has exactly one owner: a named gap, a
suffix before the first visible EOL, body after that EOL, or textBeforeHeader.
[fixture: architecture/hidden-directive-after-service] [fixture:
architecture/hidden-directive-spare-lf] [fixture:
architecture/hidden-directive-closing-space] [fixture:
architecture/hidden-directive-eof] [fixture:
architecture/hidden-yaml-service-after] [fixture:
architecture/hidden-yaml-service-spare] [fixture:
architecture/hidden-yaml-service-space] [fixture:
architecture/hidden-yaml-service-eof] [fixture:
architecture/lex-hidden-after-visible-eol] [fixture:
architecture/lex-hidden-two-suffixes]

A native comment has mark %%, then reads through the end of its line, excluding
LF/CR but including U+2028 and U+2029. It does not consume LF. Native comments
are shared Comments, not ArchitectureIgnoredText. Earlier strings, labels and
common values own text they enclose: percent pairs and fence-looking forms there
do not start hidden forms. Global comment regions and directives still apply,
also inside values or between the two percent characters of a native mark.
[fixture: architecture/end-statements-comments] [fixture:
architecture/space-comment-ls] [fixture: architecture/space-comment-ps]
[fixture: architecture/hidden-directive-inside-values] [fixture:
architecture/hidden-yaml-inside-values] [fixture:
architecture/lex-percent-in-label] [fixture:
architecture/lex-bare-percent-in-quoted-label] [fixture:
architecture/comment-in-quoted-label] [fixture:
architecture/common-description-block-comment] [fixture:
architecture/comment-directive-in-mark] [fixture:
architecture/comment-directive-in-value]

## Grammar

```text
diagram = newline* "architecture-beta" (statement | newline)* end-of-text
statement = (group | service | junction | edge | alignment
            | common-statement) eol
group = "group" id icon? label? parent?
service = "service" id (string | icon)? label? parent?
junction = "junction" id parent?
parent = "in" id
icon = "(" icon-name ")"
label = "[" (label-string | label-text) "]"
edge = id group-modifier? arrow id group-modifier?
group-modifier = "{" "group" "}"
arrow = ":" port-direction arrow-marker? line arrow-marker? port-direction ":"
line = "--" | "-" label "-"
alignment = "align" ("row" | "column") id id+
common-statement = title-line | acc-title-line | acc-descr-line | acc-descr-block
eol = newline+ | end-of-text
```

The [common notation](../common.md#notation) applies. Composite forms must match
their lexical conditions, so whitespace and native hidden forms are not freely
insertable inside icon, label or group-modifier. Hidden forms are allowed
between complete units and own the gaps defined by the tree. A visible newline
cannot replace a component gap; enclosing values and consumed hidden newlines
are different. [fixture: architecture/hidden-directive-unit-gaps] [fixture:
architecture/hidden-yaml-group-gap] [fixture:
architecture/hidden-yaml-parent-gap] [fixture:
architecture/hidden-yaml-edge-gaps] [fixture:
architecture/hidden-yaml-align-gap] [fixture:
architecture/gram-hidden-between-ids] [fixture:
architecture/gram-hidden-inside-icon] [fixture:
architecture/gram-hidden-inside-modifier] [fixture:
architecture/lex-icon-spaces] [fixture:
architecture/lex-title-padded-quoted-brackets]

Body may be empty. No EOL is required between the header and the first
statement; group, service, junction, edge, alignment and common statements can
start on the header line. Each completed statement requires visible EOL or EOF.
Adjacent statements on the same line reject, as do an empty description used
inside a declaration or in place of its EOL. Empty/comment-only lines create no
statement. An ordinary semicolon is neither EOL nor an empty statement.
[fixture: architecture/header-beta] [fixture: architecture/header-inline-group]
[fixture: architecture/header-inline-service] [fixture:
architecture/header-inline-junction] [fixture: architecture/header-inline-edge]
[fixture: architecture/header-inline-align] [fixture: architecture/common-all]
[fixture: architecture/gram-same-line-statements] [fixture:
architecture/gram-empty-description-gap] [fixture:
architecture/gram-empty-description-after-service] [fixture:
architecture/space-lines] [fixture: architecture/end-statements-comments]
[fixture: architecture/end-group-semicolon] [fixture:
architecture/end-service-eof] [fixture: architecture/end-junction-eof] [fixture:
architecture/end-edge-eof] [fixture: architecture/end-align-eof]

Icon, title and parent components occur at most once and in the stated order. A
junction has neither icon nor title. An alignment needs at least two members;
members cannot cross a visible line boundary. An unlabelled edge uses contiguous
double dash, while a labelled edge has a label between two single dashes.
[fixture: architecture/gram-service-two-icons] [fixture:
architecture/gram-service-reversed-fields] [fixture:
architecture/gram-group-two-parents] [fixture: architecture/gram-junction-title]
[fixture: architecture/error-align-one] [fixture:
architecture/gram-edge-separated-dashes] [fixture: architecture/db-mixed]

| Rule              | Node                               |
| ----------------- | ---------------------------------- |
| diagram           | ArchitectureDiagram                |
| group             | ArchitectureGroupStatement         |
| service           | ArchitectureServiceStatement       |
| junction          | ArchitectureJunctionStatement      |
| edge              | ArchitectureEdgeStatement          |
| arrow             | ArchitectureArrow                  |
| alignment         | ArchitectureAlignmentStatement     |
| Alignment member  | ArchitectureAlignmentMember        |
| title-line        | ArchitectureTitleStatement         |
| acc-title-line    | ArchitectureAccTitleStatement      |
| acc-descr-line    | ArchitectureAccDescrStatement      |
| acc-descr-block   | ArchitectureAccDescrBlockStatement |
| id / icon-name    | Identifier                         |
| string            | StringLiteral                      |
| label             | ArchitectureLabel                  |
| Common value      | ArchitectureLiteral                |
| Whole hidden form | ArchitectureIgnoredText            |

Declaration IDs, a written parent reference, both edge endpoints, port colons
and directions, the second labelled-line dash and the alignment direction are
required. Missing components reject; an empty member list is not an alignment.
[fixture: architecture/gram-group-id-missing] [fixture:
architecture/gram-service-id-missing] [fixture:
architecture/gram-junction-id-missing] [fixture:
architecture/gram-parent-id-missing] [fixture:
architecture/gram-edge-colon-missing] [fixture:
architecture/gram-edge-direction-missing] [fixture:
architecture/gram-edge-rhs-missing] [fixture:
architecture/gram-edge-label-final-dash-missing] [fixture:
architecture/gram-align-direction-missing] [fixture:
architecture/gram-align-no-members]

### Semantic acceptance conditions

After complete lexical and grammatical consumption, apply the following checks
in order. A recovered model with lexer or parser errors is rejected by
[parse.ts][parse]. [architectureParser.ts][adapter] registers categories in
groups, services, junctions, edges, alignments order, keeping source order
within each category. These checks define acceptance, not the order of the
source tree. [fixture: architecture/error-after-prefix] [fixture:
architecture/error-recovered-statement] [fixture: architecture/db-mixed]
[fixture: architecture/db-junction-order] [fixture:
architecture/db-align-forward-repeat]

Compare IDs exactly after common text conversion, distinguishing case. ID
conversion adds no quoting, escape decoding, HTML escaping or trimming. Maintain
the registered IDs with their kind, group or node, and each node's optional
parent group. Names such as `__proto__` and `constructor` are ordinary IDs, not
object properties. [fixture: architecture/db-id-case] [fixture:
architecture/db-prototype-ids] [fixture: architecture/db-prototype-services]
[fixture: architecture/lex-id-numeric] [fixture:
architecture/common-quotes-entities]

First check groups in source order. A group ID must not already be registered. A
written parent must differ from the group itself and be an already registered
group. On success register this ID as a group. Thus a group cannot name a later
group as its parent. A service written before a group cannot become that group's
parent; at this stage no nodes have been registered. These rules follow
[architectureDb.ts][db-nodes]. [fixture: architecture/error-group-duplicate]
[fixture: architecture/error-group-self-parent] [fixture:
architecture/error-group-parent-missing] [fixture:
architecture/error-group-forward-parent] [fixture:
architecture/error-group-parent-node] [fixture: architecture/db-mixed]

Next check services in source order, then junctions in source order. Each ID
must be unregistered. A written parent must differ from the node itself and be
registered as a group; missing parents and node parents reject. On success
register the ID as a node and retain its parent. A later-written group can
therefore be a service/junction parent, while a later junction is still
unregistered when a service names it. IDs are unique across all three
declaration kinds. [fixture: architecture/error-service-duplicate] [fixture:
architecture/error-service-self-parent] [fixture:
architecture/error-service-parent-missing] [fixture:
architecture/error-service-parent-node] [fixture:
architecture/error-junction-self-parent] [fixture:
architecture/error-junction-parent-missing] [fixture:
architecture/error-junction-parent-node] [fixture:
architecture/error-service-junction-collision] [fixture:
architecture/error-group-junction-collision] [fixture:
architecture/db-service-forward-parent] [fixture:
architecture/db-junction-forward-parent] [fixture:
architecture/error-service-parent-forward-junction]

Then check edges in source order. Both endpoints must be registered services or
junctions. A missing ID or an actual group ID rejects; do not reproduce
Mermaid's TypeError for a group endpoint. If either endpoint has a group
modifier, reject exactly when both endpoints have the same nonempty parent
group. An ungrouped endpoint, just one grouped endpoint or different parent
groups does not trigger this condition. Endpoints may be declared after the
edge. The checks are in [architectureDb.ts][db-edges]. [fixture:
architecture/error-edge-lhs-missing] [fixture:
architecture/error-edge-rhs-missing] [fixture:
architecture/error-edge-group-lhs] [fixture: architecture/error-edge-group-rhs]
[fixture: architecture/error-edge-group-both] [fixture:
architecture/error-edge-same-group-lhs] [fixture:
architecture/error-edge-same-group-rhs] [fixture:
architecture/db-group-modifier-ungrouped] [fixture:
architecture/db-group-modifier-one-group] [fixture:
architecture/db-group-modifier-other-parent] [fixture:
architecture/db-group-modifier-junction] [fixture: architecture/db-mixed]
[fixture: architecture/db-edge-forward-nodes]

Finally check alignments in source order. Every member must be registered as a
service or junction and appear only once in that alignment. Groups and missing
members reject. All node declarations are already available, so forward
references are allowed. Member order and repeated alignment statements are
retained. The grammar already rejects fewer than two members. [fixture:
architecture/error-align-group] [fixture: architecture/error-align-missing]
[fixture: architecture/error-align-duplicate] [fixture:
architecture/error-align-one] [fixture: architecture/db-align-forward-repeat]
[fixture: architecture/db-mixed]

No parse-time condition forbids duplicate edges, self-edges, equal port
directions, conflicting alignments or unknown icons. Rendering/layout failure
does not change these acceptance rules. [fixture:
architecture/db-duplicate-edges] [fixture: architecture/db-directions] [fixture:
architecture/db-align-layout-conflict] [fixture: architecture/db-unknown-icon]

### Db normalization

The [architecture summary](../../../tests/docs/db-summaries.md#architecture)
defines publication, optional and false values, text conversions and array
order. These derived values are not extra syntax fields. Keep all common
statements and authored arrow/label/icon spellings even where publication omits
them. In particular, the diagram title is absent from the comparison summary
because [architectureRenderer.ts][renderer] does not draw it; it remains in the
tree. [fixture: architecture/db-mixed] [fixture: architecture/db-empty-values]
[fixture: architecture/common-repeat-empty] [fixture:
architecture/lex-title-unquoted-fallback] [fixture:
architecture/lex-string-conversion] [fixture: architecture/db-directions]
[fixture: architecture/frontmatter-title]

### Configuration

Architecture configuration is read for drawing, not for syntax or semantic
acceptance; see [architectureDb.ts][db-config]. The public parse path does not
enforce maxEdges or maxTextSize for this diagram. Smaller limits do not reject
otherwise accepted text, and configuration does not rescue malformed syntax or
duplicate IDs. No architecture acceptance key is added to the
embedded-data-opaque comparison. Invalid embedded data still follows that shared
divergence. [fixture: architecture/config-site-maxedges] [fixture:
architecture/config-limit-small] [fixture: architecture/config-limit-accepted]
[fixture: architecture/config-embedded-limit] [fixture:
architecture/config-embedded-maxedges] [fixture:
architecture/config-drawing-only] [fixture:
architecture/config-invalid-cannot-rescue] [fixture:
architecture/config-frontmatter-invalid-unaffected] [fixture:
architecture/div-frontmatter-invalid-yaml]

## Known divergences

The following five existing identifiers apply. Native hidden forms are held as
ArchitectureIgnoredText rather than rejected. Empty quoted labels/text icons and
empty description statements are also held, so they are not
tokenless-empty-forms. Bare label fallback and unusual arrow-marker spelling
remain accepted syntax. [fixture: architecture/hidden-directive-body] [fixture:
architecture/hidden-yaml-three-fences] [fixture: architecture/db-empty-values]
[fixture: architecture/common-empty-block-after-value] [fixture:
architecture/lex-title-unclosed-quote-with-close] [fixture:
architecture/db-directions]

For
[directive-as-token-boundary](../known-divergences/directive-as-token-boundary.md),
reject a global directive inside an id, icon-name, fixed word or double dash.
Delimiters around a complete icon-name or group word are separate components, so
a directive between them is allowed. Label/string/common-value contents may
contain directives. This is the direct boundary rule; an ignored-text node
cannot occupy the interior of these indivisible names or words. [fixture:
architecture/directive-keyword-split] [fixture: architecture/div-directive-name]
[fixture: architecture/div-directive-icon-name] [fixture:
architecture/div-directive-group-word] [fixture:
architecture/div-directive-line] [fixture:
architecture/directive-icon-delimiters] [fixture:
architecture/directive-group-delimiters] [fixture:
architecture/directive-fields] [fixture:
architecture/end-group-unclosed-directive] [fixture:
architecture/end-junction-unclosed-directive]

For
[ignored-semicolon-as-token-boundary](../known-divergences/ignored-semicolon-as-token-boundary.md),
a selected semicolon inside in or a parent id rejects instead of joining the
pieces. Selected semicolons inside text values retain the common reading. For
[html-tag-in-frontmatter](../known-divergences/html-tag-in-frontmatter.md), a
tag beginning in frontmatter does not extend HTML quote conversion into the
body; this changes acceptance in either direction or the accepted label value.
[fixture: architecture/div-semicolon-parent-id] [fixture:
architecture/div-semicolon-in-keyword] [fixture: architecture/style-fields]
[fixture: architecture/div-frontmatter-open-tag-icon] [fixture:
architecture/div-frontmatter-open-attribute-icon] [fixture:
architecture/div-frontmatter-open-tag-label]

For [embedded-data-opaque](../known-divergences/embedded-data-opaque.md),
well-delimited frontmatter/directive contents are not parsed for acceptance. Use
the shared comparison that removes only the data causing rejection and retains
unrelated embedded values. For
[bare-percent-line-before-header](../known-divergences/bare-percent-line-before-header.md),
passed lines and accompanying whitespace are trivia even where the native
reading rejects that whitespace. Retained forms still satisfy their own lexical
rules. [fixture: architecture/div-frontmatter-invalid-yaml] [fixture:
architecture/div-invalid-keeps-config] [fixture:
architecture/div-init-fontfamily-number] [fixture:
architecture/detection-bare-before-header-ls] [fixture:
architecture/div-retained-bare-second-scan-ls] [fixture:
architecture/retained-yaml-no-bare]

[grammar]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/architecture/architecture.langium#L1-L57
[arch]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/architecture/arch.langium#L1-L2
[common]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/common.langium#L6-L34
[builder]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/architecture/tokenBuilder.ts#L1-L7
[module]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/architecture/module.ts#L41-L81
[parse]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/parse.ts#L133-L149
[adapter]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/architecture/architectureParser.ts#L8-L35
[db-nodes]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/architecture/architectureDb.ts#L75-L188
[db-edges]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/architecture/architectureDb.ts#L192-L282
[db-config]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/architecture/architectureDb.ts#L395-L413
[detector]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/architecture/architectureDetector.ts#L7-L11
[order]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/diagram-orchestration.ts#L78-L100
[renderer]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/architecture/architectureRenderer.ts#L610-L642
