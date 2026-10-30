# Cynefin

Japanese version: [cynefin.ja.md](./cynefin.ja.md)

This defines the cynefin diagram and its [authored tree](../ast/cynefin.md). The
public header is cynefin-beta, with an optional attached colon. [fixture:
cynefin/header-only] [fixture: cynefin/header-colon]

## Detection

The [detector][detector], entry 38 of [detection.md](../detection.md), is
case-sensitive. After leading common whitespace, cynefin-beta must be followed
by common whitespace, a colon or end of text. Letters, digits, underscore, dash,
other Unicode letters and a semicolon do not satisfy that boundary. [fixture:
cynefin/header-only] [fixture: cynefin/header-colon] [fixture:
cynefin/header-uppercase] [fixture: cynefin/header-letter] [fixture:
cynefin/header-digit] [fixture: cynefin/header-word] [fixture:
cynefin/header-dash] [fixture: cynefin/header-unicode] [fixture:
cynefin/header-punctuation]

The [grammar][grammar] accepts exactly cynefin-beta and cynefin-beta: as
headers. Neither requires a following EOL. The bare form has a custom boundary
of common whitespace, end of text or %%; the colon form has no
following-boundary test. Spaces or native hidden forms between the word and
colon do not make a colon header. [fixture: cynefin/header-inline] [fixture:
cynefin/header-colon-inline] [fixture: cynefin/header-colon-title] [fixture:
cynefin/header-spaced-colon] [fixture: cynefin/native-header-word-colon]
[fixture: cynefin/header-native-spaced-no-eol]

Apply the [common source reading](../common.md#reading-a-source), including CR
conversion, global directives, selected semicolons, HTML attributes, entities
and the logical end of text. Judge the grammar header boundary after common
removals. A global directive before the colon or before a remaining space is
allowed; removal joining the header to complex rejects. Detection precedes
selected-semicolon removal, so a semicolon inside the header or between its word
and colon cannot repair detection. Earlier C4 detectors are subject to
c4-keyword-anywhere. [fixture: cynefin/line-cr] [fixture: cynefin/line-crlf]
[fixture: cynefin/directive-every-field] [fixture: cynefin/entity-texts]
[fixture: cynefin/header-global-before-colon] [fixture:
cynefin/header-global-boundary-space] [fixture: cynefin/directive-header-glued]
[fixture: cynefin/selected-header-detection] [fixture:
cynefin/selected-header-components] [fixture: cynefin/c4-component-item]

For %% touching a bare header, detection-only comment removal can expose end of
text only when a later LF exists in the source being detected. A glued native
directive followed by a same-line domain therefore accepts with a final LF but
fails detection without that LF; a glued ordinary comment has the same LF
requirement. A space before %% independently supplies the detector boundary.
Detection-only removal does not remove the native directive or following domain
from the grammar input. [fixture: cynefin/header-native-no-eol] [fixture:
cynefin/header-native-spaced-no-eol] [fixture:
cynefin/header-native-glued-line-feed] [fixture:
cynefin/header-native-comment-glued-line-feed] [fixture:
cynefin/header-native-comment-glued-eof] [fixture:
cynefin/header-native-colon-glued]

Real leading frontmatter is a shared Frontmatter record. At the later detection
point the common detector skips at most one retained frontmatter-shaped block,
before passed bare %% lines and its second directive scan. The retained skip
requires a body line, an unindented three-dash closer followed by a line break,
and no closer suffix. Adjacent empty fences, missing closers, indented closers,
four dashes, suffix text, an EOF closer, a second block or a preceding bare %%
line stop this skip. Indentation before the opener can be passed without
allowing indentation on the closer. [fixture: cynefin/frontmatter-title]
[fixture: cynefin/detect-block-after-directive] [fixture:
cynefin/detect-retained-empty] [fixture: cynefin/detect-retained-three-fences]
[fixture: cynefin/detect-retained-missing] [fixture:
cynefin/detect-retained-indent-mismatch] [fixture:
cynefin/detect-retained-four-dashes] [fixture:
cynefin/detect-retained-close-suffix] [fixture:
cynefin/detect-retained-close-no-lf] [fixture:
cynefin/detect-retained-close-eof] [fixture: cynefin/detect-retained-two]
[fixture: cynefin/detect-retained-opening-indent] [fixture:
cynefin/detect-retained-before-bare]

The grammar still reads retained YAML and genuine second-scan directives with
their native boundaries; they are CynefinIgnoredText, not embedded
configuration. A real frontmatter block may precede them. A retained YAML block
before the second-scan directive can accept; the reverse order does not cause a
second YAML skip. Two second-scan directives can remain readable, but a
directive closer glued to the header fails its native boundary. [fixture:
cynefin/detect-real-before-retained-secondscan] [fixture:
cynefin/detect-retained-yaml-properties] [fixture:
cynefin/prefix-yaml-before-secondscan] [fixture:
cynefin/prefix-yaml-after-secondscan] [fixture: cynefin/prefix-two-secondscans]
[fixture: cynefin/detect-secondscan-glued]

Bare %% lines passed by detection become shared Comments; accompanying passed
whitespace and line breaks are trivia, including between retained forms. The
header position differs from the detection point. ASCII controls preserve native
boundaries; passed U+2028 or U+2029 is not re-read as native padding, under
bare-percent-line-before-header. Without a passed bare line, Unicode text at a
native prefix boundary must satisfy that native rule. [fixture:
cynefin/detect-retained-secondscan-bare-ascii] [fixture:
cynefin/detect-retained-secondscan-bare-ls] [fixture:
cynefin/detect-retained-secondscan-bare-ps] [fixture: cynefin/bare-before-ls]
[fixture: cynefin/bare-line-ps] [fixture:
cynefin/retained-directive-between-bares] [fixture:
cynefin/prefix-yaml-unicode-no-bare]

## Lexical structure

### Ordered units

The [Cynefin token builder][cynefin-token] extends the [common token
builder][common-token] with a custom matcher only for bare cynefin-beta. The
effective single-context order below is first-match, with no longer alternatives
or general longest-match rule. It includes reachable [common terminals][common];
imported BOOLEAN, FLOAT, INT, NUMBER and ID are unreachable. [fixture:
cynefin/header-colon-inline] [fixture: cynefin/lex-domain-title-priority]
[fixture: cynefin/gram-glued-domains] [fixture: cynefin/common-title-prefix]
[fixture: cynefin/domain-digit]

| Order | Unit             | Form                                                           |
| ----- | ---------------- | -------------------------------------------------------------- |
| 1     | header-colon     | cynefin-beta:                                                  |
| 2     | header-bare      | cynefin-beta with its custom boundary                          |
| 3     | transition-arrow | -->                                                            |
| 4     | label-colon      | :                                                              |
| 5     | domain-name      | complex, complicated, clear, chaotic, confusion, in that order |
| 6     | acc-descr-form   | Line alternative before block alternative                      |
| 7     | acc-title-line   | accTitle, padding, colon and value                             |
| 8     | title-line       | title and its optional separator and value                     |
| 9     | string           | Matching double or single quotes                               |
| 10    | newline          | LF after common CR conversion                                  |
| 11    | native-padding   | ASCII space and tab, skipped                                   |
| 12    | native-yaml      | Hidden YAML-shaped block                                       |
| 13    | native-directive | Hidden directive-shaped form                                   |
| 14    | native-comment   | %% through before CR or LF                                     |

Domain words and common keywords are case-sensitive. A domain word has no
word-end boundary: complexclear is two domains, and complextitle T is a domain
followed by title. An unknown suffix still causes a lexer error. --> is one
indivisible arrow; colon is a separate unit only outside enclosing forms. Other
arrows, arbitrary domain names and unquoted items are not units. [fixture:
cynefin/gram-glued-domains] [fixture: cynefin/lex-domain-title-priority]
[fixture: cynefin/domain-letter] [fixture: cynefin/domain-digit] [fixture:
cynefin/domain-dash] [fixture: cynefin/domain-word] [fixture:
cynefin/domain-unicode] [fixture: cynefin/domain-uppercase] [fixture:
cynefin/common-uppercase] [fixture: cynefin/lex-arrow-forms] [fixture:
cynefin/gram-unquoted-item]

### Strings and common values

A string uses matching single or double quotes and can be empty. Inside it, read
any character other than its own quote or backslash, including LF, U+2028 and
U+2029; a backslash instead requires one following character other than CR, LF,
U+2028 or U+2029. A bare backslash, escaped line terminator or missing matching
closer rejects. An opposite quote does not close it. Global common removals
still apply inside it. [fixture: cynefin/db-empty-texts] [fixture:
cynefin/lex-string-escaped-quotes] [fixture: cynefin/lex-string-conversion]
[fixture: cynefin/line-string-values] [fixture: cynefin/lex-string-open-double]
[fixture: cynefin/lex-string-open-single] [fixture:
cynefin/lex-string-dangling-backslash] [fixture: cynefin/lex-string-escaped-lf]
[fixture: cynefin/lex-string-escaped-ls] [fixture:
cynefin/lex-string-escaped-ps] [fixture: cynefin/directive-every-field]
[fixture: cynefin/comment-line-in-string]

Item and transition-label strings use shared StringLiteral. Its raw preserves
the entire authored spelling including quotes and common trivia; value preserves
the unconverted interior outside common removals, and closed is true. Do not
decode string escapes, HTML quotes or entities into tree values. The
[common/default conversion][converter] of these strings is recorded by the tests
summary, separately from the authored tree. [fixture:
cynefin/lex-string-conversion] [fixture:
cynefin/lex-transition-string-conversion] [fixture:
cynefin/lex-string-unknown-single] [fixture:
cynefin/lex-transition-unknown-double] [fixture: cynefin/html-texts] [fixture:
cynefin/entity-texts] [fixture: cynefin/directive-every-field]

title-line reads title followed by either nothing or exactly one ASCII space/tab
separator and the rest of that line. It needs no word boundary, so titleX leaves
an unread suffix rather than a title value. acc-title-line and the line
alternative of acc-descr-form permit ASCII space/tab before their colon and read
from immediately after it. Line values stop before CR, LF or the first %%, but
include U+2028, U+2029, quotes and braces as ordinary text. In particular
accDescr: {x} is a line value. [fixture: cynefin/common-title-eof] [fixture:
cynefin/common-title-prefix] [fixture: cynefin/common-line-whitespace] [fixture:
cynefin/common-quoted-values] [fixture: cynefin/common-open-quote] [fixture:
cynefin/common-title-comment-only] [fixture:
cynefin/common-acctitle-comment-only] [fixture:
cynefin/common-description-comment-only] [fixture:
cynefin/common-colon-block-priority] [fixture: cynefin/line-common-values]
[fixture: cynefin/lex-title-one-space] [fixture: cynefin/lex-title-one-tab]
[fixture: cynefin/lex-title-two-spaces] [fixture:
cynefin/lex-common-whitespace-literals]

The block alternative reads accDescr, zero or more common whitespace characters,
an opening brace, any characters through the first closing brace, and that
closer. It includes CR/LF and U+2028/U+2029 inside the body; quotes and
backslashes do not protect a closing brace. A missing closer rejects. Empty and
whitespace-only blocks are complete statements. Common directives and comment
regions can leave a block empty; native-looking forms inside the enclosing block
remain value text. [fixture: cynefin/common-block-unicode-gap] [fixture:
cynefin/common-block-empty-gap] [fixture: cynefin/common-block-comment-gap]
[fixture: cynefin/common-block-directive-gap] [fixture:
cynefin/common-block-ls-gap] [fixture: cynefin/line-block-values] [fixture:
cynefin/common-block-first-close] [fixture: cynefin/common-block-escaped-close]
[fixture: cynefin/common-block-quoted-close] [fixture:
cynefin/common-block-open] [fixture: cynefin/common-repeat-empty] [fixture:
cynefin/common-block-whitespace] [fixture: cynefin/common-block-comment-only]
[fixture: cynefin/common-block-directive-only] [fixture:
cynefin/hidden-yaml-block] [fixture: cynefin/hidden-directive-block]

Each of the four common forms has its own statement node. A line value preserves
all authored padding after its separator or colon: one title separator alone
gives null, two spaces give a non-null one-space literal, and whitespace after
an accessibility colon gives a non-null literal. A block value trims common
whitespace only at its outer ends, keeping internal indentation and line
endings; an empty remainder gives null. The tree never applies the
[converter][converter]’s collapsing or escaping to CynefinLiteral. [fixture:
cynefin/lex-title-one-space] [fixture: cynefin/lex-title-one-tab] [fixture:
cynefin/lex-title-two-spaces] [fixture: cynefin/lex-common-whitespace-literals]
[fixture: cynefin/common-line-whitespace] [fixture:
cynefin/common-block-whitespace] [fixture: cynefin/common-empty-interleaved]
[fixture: cynefin/directive-every-field]

### Native hidden forms and EOL

Between complete visible units, native-padding skips only ASCII space and tab;
newline is LF after common CR/CRLF conversion. U+2028, U+2029, NBSP, BOM and
ideographic space are not native padding or EOL. Leading common whitespace is
treated separately. native-comment reads an optional ASCII padding prefix and %%
through before CR or LF, leaving that newline visible; a single percent sign is
not its mark. Shared comment records preserve the authored mark and text outside
common removals. [fixture: cynefin/space-tabs] [fixture: cynefin/space-lines]
[fixture: cynefin/line-cr] [fixture: cynefin/line-crlf] [fixture:
cynefin/line-ls-gap] [fixture: cynefin/line-ps-gap] [fixture:
cynefin/space-nbsp-body] [fixture: cynefin/space-bom-body] [fixture:
cynefin/space-3000-body] [fixture: cynefin/space-bom-leading] [fixture:
cynefin/comment-native-between-items] [fixture: cynefin/comment-single-percent]

native-yaml reads exactly three dashes, optional ASCII space/tab, a newline, an
optional body ending with a newline, then three unindented closing dashes. The
closer either consumes a following newline or requires common whitespace/end of
text without consuming that boundary. The body-present alternative is tried
before the empty-body alternative, each lazily: three adjacent fences can form
one match, and a nonqualifying closer can make the match continue to a later
one. Two nonempty blocks can remain two matches. Four dashes, an indented
closer, a missing closer or a nonwhitespace closer suffix fails this form.
[fixture: cynefin/hidden-yaml-adjacent-later] [fixture:
cynefin/hidden-yaml-adjacent-eof] [fixture:
cynefin/hidden-yaml-adjacent-no-later] [fixture:
cynefin/hidden-yaml-two-nonempty] [fixture: cynefin/hidden-yaml-closer-indented]
[fixture: cynefin/hidden-yaml-four-close] [fixture:
cynefin/hidden-yaml-closer-inline-gap] [fixture:
cynefin/hidden-yaml-opener-padding] [fixture: cynefin/hidden-yaml-open-eof]
[fixture: cynefin/hidden-yaml-four-dashes] [fixture:
cynefin/hidden-yaml-closing-ls] [fixture: cynefin/selected-native-yaml-closer]

native-directive reads optional ASCII padding, %%{, any characters lazily
through a }%% whose following boundary qualifies, then either consumes a
following newline or checks common whitespace/end of text. A closer joined to a
nonwhitespace character can defer the match to a later closer. If the whole form
fails, native-comment can read the line instead. These forms are not global
directives. Earlier strings and common values enclose native-looking text, so no
ignored node is made inside them. [fixture: cynefin/hidden-directive-adjacent]
[fixture: cynefin/hidden-native-comment-fallback] [fixture:
cynefin/hidden-directive-comment-fallback-kept] [fixture:
cynefin/hidden-directive-string] [fixture: cynefin/hidden-yaml-string] [fixture:
cynefin/hidden-yaml-block] [fixture: cynefin/hidden-directive-block]

Both hidden bodies can contain LF, U+2028 and U+2029, and their source CR/CRLF
spelling is retained in the tree. Common directives and comment regions removed
inside a body are excluded from its value but remain in source ranges. A Unicode
closer boundary can qualify a hidden match while leaving a character that is not
native padding, so the complete input can still reject. [fixture:
cynefin/hidden-yaml-ps-body] [fixture: cynefin/hidden-directive-ls-body]
[fixture: cynefin/hidden-directive-cr] [fixture: cynefin/hidden-directive-crlf]
[fixture: cynefin/hidden-yaml-bare-cr] [fixture:
cynefin/hidden-yaml-common-directive] [fixture:
cynefin/hidden-yaml-comment-region] [fixture:
cynefin/hidden-directive-closing-ps] [fixture: cynefin/hidden-yaml-closing-ls]

A visible EOL is one or more visible newlines or logical end of text. A hidden
form can consume the sole following LF, including the appended LF, without
supplying EOL. Transitions and common statements then need another visible LF or
end of text; a closer followed by a space leaves LF available. Domain blocks and
items need no EOL, so the same consumption is permitted there. Keep whole native
forms as CynefinIgnoredText with the
[named owners](../ast/cynefin.md#ownership-of-hidden-forms), excluding consumed
following line breaks from their own ranges. [fixture:
cynefin/hidden-directive-sole-lf] [fixture: cynefin/hidden-directive-spare-lf]
[fixture: cynefin/hidden-directive-eof] [fixture:
cynefin/hidden-directive-closing-space] [fixture: cynefin/hidden-yaml-sole-lf]
[fixture: cynefin/hidden-yaml-spare-lf] [fixture: cynefin/hidden-yaml-eof]
[fixture: cynefin/hidden-yaml-closing-space] [fixture:
cynefin/hidden-after-domain] [fixture: cynefin/hidden-after-item] [fixture:
cynefin/hidden-after-block] [fixture: cynefin/hidden-after-block-spare]
[fixture: cynefin/hidden-after-label] [fixture:
cynefin/hidden-after-label-space]

### Authored component boundaries

Global directives and actually selected semicolons can separate complete
authored components: header word and colon; domain word and item; transition
endpoints, whole arrow, colon and string; a common keyword and its separator,
colon or brace; and individual punctuation characters of native fences. They can
occur inside string/common/hidden value text. They cannot split a fixed word or
the indivisible -->. Composite line units do not turn their authored punctuation
boundaries into word interiors. Native hidden forms, by contrast, cannot split a
composite header or common line unit. [fixture:
cynefin/header-global-before-colon] [fixture:
cynefin/directive-transition-parts] [fixture: cynefin/directive-title-parts]
[fixture: cynefin/directive-description-parts] [fixture:
cynefin/directive-description-brace] [fixture:
cynefin/directive-native-yaml-components] [fixture:
cynefin/directive-native-directive-components] [fixture:
cynefin/selected-colon-label-components] [fixture:
cynefin/semicolon-arrow-parts] [fixture: cynefin/semicolon-acctitle-parts]
[fixture: cynefin/semicolon-block-parts] [fixture:
cynefin/selected-native-yaml-opener] [fixture:
cynefin/selected-native-directive-opener] [fixture:
cynefin/selected-string-interior] [fixture: cynefin/selected-title-components]
[fixture: cynefin/selected-native-directive-closer] [fixture:
cynefin/hidden-native-directive-opener-raw] [fixture:
cynefin/native-common-keyword-colon] [fixture: cynefin/native-header-word-colon]
[fixture: cynefin/directive-domain-inside] [fixture:
cynefin/directive-arrow-inside] [fixture: cynefin/semicolon-complex-inside]
[fixture: cynefin/semicolon-arrow-inside]

Selection of a semicolon depends on the common line rule, not on its appearance
alone. A style:# trigger in an earlier completed string can select a later
semicolon, whereas a later trigger does not select a semicolon before it. The
same rule controls native fence punctuation and string interiors; a semicolon
that remains is not a general statement separator. [fixture:
cynefin/selected-arrow-inside] [fixture: cynefin/semicolon-arrow-inside]
[fixture: cynefin/selected-colon-label-components] [fixture:
cynefin/selected-native-yaml-opener] [fixture:
cynefin/selected-native-directive-opener] [fixture:
cynefin/selected-string-interior] [fixture: cynefin/selected-native-yaml-closer]
[fixture: cynefin/selected-native-directive-closer] [fixture:
cynefin/tail-domain-semicolon]

## Grammar

The notation is that of [common.md](../common.md#notation). Native padding,
native hidden forms and shared trivia can lie between complete units where the
lexical rules allow them; only visible newlines participate in the grammar.
acc-descr-line and acc-descr-block are the two alternatives of acc-descr-form.
[fixture: cynefin/db-all-fields] [fixture: cynefin/hidden-all-unit-gaps]
[fixture: cynefin/gram-adjacent-items] [fixture:
cynefin/common-colon-block-priority]

```text
diagram = newline* header newline*
          (domain-block | transition | common-statement | newline)* end-of-text
header = header-colon | header-bare
domain-block = domain-name newline* (domain-item newline*)*
domain-item = string
transition = domain-name transition-arrow domain-name (label-colon string)? eol
common-statement = (title-line | acc-title-line | acc-descr-line | acc-descr-block) eol
eol = newline+ | end-of-text
```

| Rule or form                    | Node                                 |
| ------------------------------- | ------------------------------------ |
| diagram                         | CynefinDiagram                       |
| domain-block                    | CynefinDomainStatement               |
| domain-item                     | CynefinDomainItem with StringLiteral |
| transition                      | CynefinTransitionStatement           |
| transition-arrow                | CynefinArrow                         |
| title-line                      | CynefinTitleStatement                |
| acc-title-line                  | CynefinAccTitleStatement             |
| acc-descr-line                  | CynefinAccDescrStatement             |
| acc-descr-block                 | CynefinAccDescrBlockStatement        |
| Nonempty common value           | CynefinLiteral                       |
| native-yaml or native-directive | CynefinIgnoredText                   |

The body and each domain’s item list can be empty. A domain needs neither braces
nor a colon, and its items are only quoted strings. No EOL is required between
its name and items, between items, or before the next domain. Repeated items and
repeated domain declarations are accepted. A string without a current domain
block rejects. [fixture: cynefin/header-only] [fixture:
cynefin/gram-domain-empty-eof] [fixture: cynefin/gram-adjacent-items] [fixture:
cynefin/gram-inline-items] [fixture: cynefin/gram-glued-domains] [fixture:
cynefin/gram-item-duplicates] [fixture: cynefin/db-domain-duplicates] [fixture:
cynefin/gram-orphan-item] [fixture: cynefin/gram-domain-colon] [fixture:
cynefin/gram-domain-braces]

Within a domain’s item sequence, a directive-only line, a selected semicolon, a
comment line and a blank line leave the sequence open. U+2028 and U+2029 between
items reject. An empty description block is a separate common statement: a
following orphan string rejects, but redeclaring a domain allows its next item.
A transition likewise ends the preceding domain’s sequence. [fixture:
cynefin/gram-items-directive-line] [fixture:
cynefin/gram-items-selected-semicolon] [fixture:
cynefin/gram-items-comment-line] [fixture: cynefin/gram-items-blank-line]
[fixture: cynefin/gram-items-ls] [fixture: cynefin/gram-items-ps] [fixture:
cynefin/gram-items-empty-description] [fixture:
cynefin/gram-items-empty-description-redeclare] [fixture:
cynefin/gram-domain-after-transition-orphan]

A transition requires two fixed domain words and -->, optionally followed by
colon and a string together, then EOL. Neither an absent target, a bare label, a
colon without a string nor a string without its colon is allowed. Visible
newline cannot split its components; native hidden forms may lie at the named
gaps without adding a visible newline. Multiple transitions require their EOLs.
[fixture: cynefin/gram-transition-first] [fixture: cynefin/gram-missing-target]
[fixture: cynefin/gram-label-unquoted] [fixture:
cynefin/gram-label-missing-string] [fixture: cynefin/gram-label-without-colon]
[fixture: cynefin/gram-domain-before-arrow-newline] [fixture:
cynefin/gram-target-before-colon-newline] [fixture:
cynefin/hidden-all-unit-gaps] [fixture: cynefin/db-transition-duplicates]
[fixture: cynefin/gram-transition-eol]

Each common statement requires its EOL, including empty title/accessibility
lines and an empty description block. Another statement on the same line can be
absorbed as line-value text; after a completed block, a following domain without
EOL rejects. Repeated common statements stay separate, including empty ones.
[fixture: cynefin/common-repeat-empty] [fixture:
cynefin/common-empty-interleaved] [fixture: cynefin/common-title-eof] [fixture:
cynefin/gram-title-inline-domain] [fixture:
cynefin/common-empty-block-same-line] [fixture: cynefin/hidden-after-block]
[fixture: cynefin/hidden-title-suffix] [fixture: cynefin/hidden-acctitle-suffix]
[fixture: cynefin/hidden-description-suffix] [fixture:
cynefin/hidden-block-suffix]

### Semantic acceptance conditions

The public [parse wrapper][parse] rejects every lexer error and every parser
error, even if recovery produced a model, and requires complete consumption. The
[service module][module], [adapter][adapter] and [Db][db] impose no additional
semantic rejection. All five domain names are available as references without
declarations; repeated domains, repeated transitions, self transitions and empty
domains or strings are accepted. [fixture: cynefin/error-start] [fixture:
cynefin/error-after-prefix] [fixture: cynefin/error-recovered] [fixture:
cynefin/gram-transition-first] [fixture: cynefin/db-domain-duplicates] [fixture:
cynefin/db-transition-duplicates] [fixture: cynefin/db-self-loops] [fixture:
cynefin/gram-domain-empty-eof] [fixture: cynefin/db-empty-texts]

An empty transition label is not tokenless-empty-forms: Mermaid reads a STRING
and assigns the label in the grammar, and only the Db later drops its falsy
value, just as an empty class multiplicity remains authored syntax. [fixture:
cynefin/db-empty-texts] [fixture: cynefin/db-self-loop-empty-label] [fixture:
class/gram-cardinality-empty]

### Retaining occurrences and configuration

Keep every authored domain block, item, transition and common statement in
source order. Self transitions, earlier replaced blocks, empty domains,
duplicate items and transitions, empty labels and empty common forms all have
nodes. Native ignored forms also have nodes. No effective declarations,
filtering or replacement is performed on the authored tree. [fixture:
cynefin/db-self-loops] [fixture: cynefin/db-domain-duplicates] [fixture:
cynefin/db-domain-empty-first] [fixture: cynefin/db-domain-empty-last] [fixture:
cynefin/gram-domain-empty-eof] [fixture: cynefin/gram-item-duplicates] [fixture:
cynefin/db-transition-duplicates] [fixture: cynefin/db-empty-texts] [fixture:
cynefin/common-repeat-empty] [fixture: cynefin/hidden-domain-item-members]

There is no cynefin-specific acceptance configuration key. The adapter and Db
have no configurable semantic gate; [Db configuration][db-config] and the
[renderer][renderer] concern drawing. Drawing settings from the site,
frontmatter or init directives do not rescue invalid grammar; small site
rendering limits do not add a parse rejection. Common configuration can change
converted common text or fail during embedded-data handling, covered by the
shared rules, while authored values remain unchanged. [fixture:
cynefin/config-drawing-site] [fixture: cynefin/config-frontmatter-drawing]
[fixture: cynefin/config-init-drawing] [fixture:
cynefin/config-frontmatter-cannot-rescue] [fixture:
cynefin/config-init-cannot-rescue] [fixture: cynefin/config-site-small-limits]
[fixture: cynefin/config-security-level-other] [fixture:
cynefin/config-frontmatter-fontfamily-number] [fixture:
cynefin/config-init-fontfamily-number]

### Db normalization

Converted values, omissions, selection, replacement and order are defined by
[the tests summary](../../../tests/docs/db-summaries.md#cynefin) and its
[Db-from-tree contract](../../../tests/docs/db-from-tree.md). They do not remove
authored syntax from the tree. [fixture: cynefin/db-all-fields] [fixture:
cynefin/db-domain-duplicates] [fixture: cynefin/db-self-loops] [fixture:
cynefin/db-empty-texts] [fixture: cynefin/common-empty-interleaved]

## Known divergences

**[directive-as-token-boundary](../known-divergences/directive-as-token-boundary.md).**
Shared directive records can hold a directive’s source, but a fixed
header/domain/common word or indivisible arrow has no internal authored gap.
Reject a global directive inside such an atom. Complete component boundaries and
text interiors remain allowed; native hidden forms already have nodes and need
no divergence. [fixture: cynefin/directive-header-inside] [fixture:
cynefin/directive-domain-inside] [fixture: cynefin/directive-arrow-inside]
[fixture: cynefin/directive-common-keyword] [fixture:
cynefin/directive-title-inside] [fixture: cynefin/directive-block-inside]
[fixture: cynefin/directive-clear-inside] [fixture:
cynefin/directive-transition-parts] [fixture:
cynefin/directive-description-brace] [fixture:
cynefin/directive-native-yaml-components] [fixture:
cynefin/directive-native-directive-components] [fixture:
cynefin/directive-every-field]

**[ignored-semicolon-as-token-boundary](../known-divergences/ignored-semicolon-as-token-boundary.md).**
Only actually selected semicolons obey the same atomic boundary rule. Shared
trivia can hold the punctuation, but cannot create an internal gap in a fixed
word or -->. Component boundaries, string text and native fence punctuation
remain allowed; arbitrary semicolons are not separators. [fixture:
cynefin/semicolon-complex-inside] [fixture: cynefin/semicolon-clear-inside]
[fixture: cynefin/semicolon-arrow-inside] [fixture:
cynefin/semicolon-title-inside] [fixture: cynefin/semicolon-acctitle-inside]
[fixture: cynefin/semicolon-block-inside] [fixture:
cynefin/semicolon-colon-header-selected-parts] [fixture:
cynefin/semicolon-arrow-parts] [fixture:
cynefin/selected-colon-label-components] [fixture:
cynefin/selected-native-yaml-opener] [fixture:
cynefin/selected-native-directive-opener] [fixture:
cynefin/selected-string-interior] [fixture: cynefin/selected-title-components]
[fixture: cynefin/selected-native-directive-closer]

**[html-tag-in-frontmatter](../known-divergences/html-tag-in-frontmatter.md).**
Keep frontmatter and body nodes, but start body HTML attribute scanning after
real frontmatter. An unfinished tag in opaque YAML cannot govern a later
string’s quotes. Mermaid can accept when this rule rejects, reject when it
accepts, or accept with only a different value; body-only quote controls still
use the common HTML rule. [fixture: cynefin/div-html-frontmatter-accept]
[fixture: cynefin/div-html-frontmatter-reject] [fixture:
cynefin/div-html-frontmatter-value] [fixture: cynefin/html-body-double-control]
[fixture: cynefin/html-body-single-control]

**[embedded-data-opaque](../known-divergences/embedded-data-opaque.md).** Shared
records hold whole recognized frontmatter/global directives, so do not reject
syntax because their YAML or configuration cannot be read. Apply the shared
comparison-configuration rule rather than letting invalid data erase a valid
title or configuration. Retained native YAML is instead CynefinIgnoredText.
[fixture: cynefin/div-frontmatter-invalid] [fixture:
cynefin/div-init-invalid-colour] [fixture: cynefin/div-init-primitive-wrap]
[fixture: cynefin/config-frontmatter-fontfamily-number] [fixture:
cynefin/config-init-fontfamily-number] [fixture:
cynefin/config-fontfamily-keeps-title] [fixture:
cynefin/div-invalid-keeps-config] [fixture:
cynefin/detect-retained-yaml-properties]

**[bare-percent-line-before-header](../known-divergences/bare-percent-line-before-header.md).**
Shared Comments and trivia hold detection-passed bare lines and whitespace.
State the direct passed-prefix rule rather than re-reading passed Unicode trivia
with the native lexer. Native retained forms still need their own boundaries.
[fixture: cynefin/bare-before-ls] [fixture: cynefin/bare-line-ps] [fixture:
cynefin/detect-retained-secondscan-bare-ascii] [fixture:
cynefin/detect-retained-secondscan-bare-ls] [fixture:
cynefin/detect-retained-secondscan-bare-ps] [fixture:
cynefin/retained-directive-between-bares] [fixture:
cynefin/prefix-yaml-unicode-no-bare]

**[c4-keyword-anywhere](../known-divergences/c4-keyword-anywhere.md).** Select
cynefin from its header even when a later value contains a C4 detector word. The
value has a Cynefin node, but the same tree cannot also have the displaced C4
diagram kind. An ordinary LF-terminated comment removed for detection is a
nondiffering control. [fixture: cynefin/c4-component-item] [fixture:
cynefin/c4-container-title] [fixture: cynefin/c4-component-header-eof] [fixture:
cynefin/c4-component-header-lf]

[grammar]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/cynefin/cynefin.langium#L1-L30
[common]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/common/common.langium#L6-L34
[cynefin-token]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/cynefin/tokenBuilder.ts#L1-L7
[common-token]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/common/tokenBuilder.ts#L14-L27
[converter]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/common/valueConverter.ts#L27-L79
[parse]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/parse.ts#L133-L149
[module]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/cynefin/module.ts#L30-L54
[adapter]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/cynefin/cynefinParser.ts#L8-L19
[db]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/cynefin/cynefinDb.ts#L34-L69
[db-config]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/cynefin/cynefinDb.ts#L71-L76
[renderer]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/cynefin/cynefinRenderer.ts#L71-L115
[detector]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/cynefin/cynefinDetector.ts#L7-L11
