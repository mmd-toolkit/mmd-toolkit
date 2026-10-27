# Usecase

Japanese version: [usecase.ja.md](./usecase.ja.md)

Source of truth in mermaid.js:

- [`usecase.tokens.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecase.tokens.ts#L1-L410)
- [`usecase.parser.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecase.parser.ts#L1-L705)
- [`usecase.visitor.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecase.visitor.ts#L1-L976)
- [`usecaseModelBuilder.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecaseModelBuilder.ts#L1-L1050)
- [`usecaseJson.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecaseJson.ts#L1-L378)
- [`usecaseDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/usecaseDb.ts#L1-L574)

This document covers `usecase`. Its source tree is defined in
[ast/usecase.md](../ast/usecase.md); value conversion and the Db are defined in
the [tests package summary](../../../tests/docs/db-summaries.md#usecase).

## Detection

Select `usecase` for exact lower-case `usecase-beta` at the position reached in
[detection.md](../detection.md) (entry 39), followed by common whitespace or end
of text. Any following character outside that whitespace set prevents detection.
The header unit can begin a longer spelling, but detection requires this
boundary. A Unicode space may pass detection yet fail the usecase grammar.
Header/body statements must be on separate physical lines. [fixture:
usecase/header-without-beta], [fixture: usecase/header-uppercase], [fixture:
usecase/header-letter-suffix], [fixture: usecase/header-unicode-suffix],
[fixture: usecase/header-semicolon], [fixture: usecase/header-spaced-semicolon],
[fixture: usecase/header-same-line], [fixture: usecase/header-u2028-eof],
[fixture: usecase/lex-header-emspace-eof].

Common frontmatter, directive, comment-region, leading-trivia, attribute-quote,
entity, ignored-semicolon, CR/CRLF normalization, and appended-LF rules apply.
Usecase is registered after C4, so the existing C4 detection divergence applies.
A bare percent line before the header follows the common leading-comment rule
under
[bare-percent-line-before-header](../known-divergences/bare-percent-line-before-header.md).
[fixture: usecase/frontmatter-crlf], [fixture: usecase/directive-before-header],
[fixture: usecase/lex-whitespace-leading], [fixture: usecase/entity-all-texts],
[fixture: usecase/div-detect-c4-label]; [fixture:
usecase/div-comment-preheader-bare], [fixture:
usecase/div-comment-preheader-braces].

## Lexical structure

### Ordered default-context rules

At each position, try the current context's rules in order. Take the first
match, except for its explicit `longer_alt`. Restart at the next position. There
is no general longest-match rule. LabelText and Word are category names, not
matching rules. [fixture: usecase/lex-keyword-longer-ids] [fixture:
usecase/lex-number-decimal-id-unit]

1. **horizontal-whitespace**: Maximal ASCII spaces/tabs; trivia. [fixture:
   usecase/lex-tab-blank-line]

2. **markdown-string**: Double quote plus backtick through the first backtick
   plus double quote; any characters, including physical line breaks and Unicode
   separators, may lie between them. [fixture: usecase/lex-markdown-cr]

3. **unclosed-markdown**: Same opener through source end if no close; grammar
   rejects it. [fixture: usecase/lex-markdown-unclosed]

4. **diagram-comment**: `%%` at an ASCII-space/tab-only physical-line start; up
   to but excluding LF. [fixture: usecase/comment-bare-pair]

5. **newline**: One physical line break. [fixture: usecase/lex-statements-crlf]

6. **acc-descr-block**: At ASCII-HWS-only line start, `accDescr`, zero or more
   HWS, `{`, through the first `}`. [fixture: usecase/db-accdescr-block-comment]

7. **acc-title-line**: At that line start, `accTitle`, zero or more HWS, colon,
   remainder of line. [fixture: usecase/lex-accessibility-line-separators]

8. **acc-descr-line**: Same for accDescr. [fixture:
   usecase/db-accdescr-directive-gap]

9. **json-prefix**: json, positive HWS, raw word id, HWS, @, HWS, with { next;
   enter JSON. [fixture: usecase/gram-json-spaced-at]

10. **keywords**: Ordered list below, each with the Identifier longer
    alternative. [fixture: usecase/lex-keyword-longer-ids]

11. **generalization**: `--|>` [fixture: usecase/db-semantic-case]

12. **dependency-arrow**: `..>` [fixture: usecase/db-semantic-case]

13. **stereotype-open**: <<; enter stereotype context. [fixture:
    usecase/gram-stereotype-u2028]

14. **class-separator**: `:::` [fixture: usecase/gram-class-suffix-missing]

15. **forward-solid**: Two or more dashes followed by >. [fixture:
    usecase/db-labeled-arrows]

16. **backward-solid**: < followed by two or more dashes. [fixture:
    usecase/gram-backward-long-labeled-left]

17. **forward-circle**: `--o` [fixture: usecase/lex-forward-circle-id-prefix]

18. **backward-circle**: `o--` [fixture: usecase/db-arrows]

19. **forward-cross**: `--x` [fixture: usecase/lex-forward-cross-id-prefix]

20. **backward-cross**: `x--` [fixture: usecase/db-labeled-arrows]

21. **markerless-solid**: Two or more dashes. [fixture:
    usecase/gram-style-custom-markerless]

22. **metadata-open**: Contiguous @{. [fixture: usecase/gram-metadata-empty]

23. **at**: `@` [fixture: usecase/gram-json-spaced-at]

24. **braces**: {, then }. [fixture: usecase/gram-metadata-newline]

25. **brackets**: [, then ]. [fixture: usecase/gram-empty-brackets]

26. **parentheses**: (, then ). [fixture: usecase/gram-empty-label]

27. **comma, colon**: One comma, then one colon. [fixture:
    usecase/gram-actor-list]

28. **hash-color**: # and a positive run of ASCII hexadecimal digits. [fixture:
    usecase/lex-style-hash-semicolon]

29. **plain-string**: One same-quote-delimited single/double-quoted string, no
    physical LF. [fixture: usecase/lex-native-single-quoted-keys]

30. **css-identifier**: CSS word/hyphen forms described below. [fixture:
    usecase/lex-style-css-token-contains-keyword]

31. **identifier**: Maximal positive ASCII word run; longer alternative number.
    [fixture: usecase/lex-number-identifiers]

32. **number**: Decimal/integer/unit forms described below. [fixture:
    usecase/lex-number-decimal-id-unit]

33. **escaped-comma**: Backslash followed by comma. [fixture:
    usecase/gram-styles-components]

34. **dash, dot, percent**: One -, then one ., then one %. [fixture:
    usecase/gram-styles-components]

35. **css-punctuation**: One of ! # $ & * + / = ? ^ _ \| ~. [fixture:
    usecase/lex-label-fallback-punctuation]

36. **label-punctuation**: One of ; < > backslash backtick. [fixture:
    usecase/lex-label-fallback-punctuation]

37. **label-symbol**: Maximal remaining run outside printable ASCII, excluding
    TAB/LF/CR. [fixture: usecase/lex-label-fallback-symbols]

Keyword order is `usecase-beta`, `actor`, `systemBoundary`, `end`, `direction`,
`TD`, `TB`, `BT`, `LR`, `RL`, `note`, `for`, `json`, `classDef`, `class`,
`style`, `include`, `extend`, `true`, `false`. Only include/extend are
case-insensitive. A longer Identifier wins over a keyword; a hyphen or non-ASCII
suffix does not extend an ASCII word. Consequently `actorName` is an id,
`actor-name` starts with actor and a dash, and `actor"A"` needs no space. The
keyword's longer alternative is not a recursive longest-match search. [fixture:
usecase/lex-keyword-longer-ids], [fixture: usecase/lex-keywords-letter-suffix],
[fixture: usecase/lex-keywords-word-suffix], [fixture:
usecase/lex-actor-dash-suffix], [fixture: usecase/lex-actor-unicode-suffix],
[fixture: usecase/db-semantic-case]; [fixture:
usecase/gram-actor-keyword-adjacent-string], [fixture:
usecase/lex-keyword-longer-number].

The number rule reads digits with an optional decimal fraction having digits on
both sides, or a leading dot and digits; it can then take ASCII letters as a
unit suffix. It has no sign or exponent. The Identifier rule is earlier, so
`1mg` is an id while `1.5px` is a number unit. Neither fact makes a native
metadata value NumericLiteral: a decimal is rejected there. [fixture:
usecase/lex-number-identifiers], [fixture: usecase/lex-decimal-id], [fixture:
usecase/lex-number-decimal-id-unit], [fixture:
usecase/gram-metadata-number-icon], [fixture:
usecase/gram-metadata-decimal-icon].

A css-identifier is either two dashes followed by an ASCII letter/underscore and
then ASCII word characters/dashes, or an ASCII letter/underscore followed by
word characters and one or more hyphen-plus-positive-word groups. Earlier
keyword and markerless rules still win: `--custom` is read as markerless and a
word, and `actor-name` starts with actor, so it is not one CSS property unit. A
property starting `my-actor` is one CSS unit. [fixture:
usecase/lex-css-hyphen-keyword-style], [fixture:
usecase/lex-css-keyword-prefix-label-control], [fixture:
usecase/gram-style-custom-markerless]; [fixture:
usecase/lex-style-css-token-contains-keyword], [fixture:
usecase/lex-class-property-custom-gap], [fixture:
usecase/lex-class-property-long-custom]. [fixture:
usecase/lex-css-name-custom-tab] [fixture: usecase/lex-css-name-custom-nbsp]

Whitespace between a markerless dash prefix and its following CSS property-name
word is ASCII HWS. [fixture: usecase/lex-class-property-custom-gap] [fixture:
usecase/lex-css-name-custom-tab] [fixture: usecase/lex-css-name-custom-nbsp] A
`%%` comment after a physical LF or U+2028 in that gap does not make the name
valid. [fixture: usecase/gram-css-name-comment-region-lf] [fixture:
usecase/gram-css-name-comment-region-ls]

The shared atomic-boundary rule applies inside a CSS property-name word, as in
`co%%{init: {}}%%lor`. [fixture: usecase/div-directive-css-property] A directive
in the HWS between `--` and the following word is accepted as trivia. These are
separate units with or without the directive, so no word is joined. [fixture:
usecase/lex-directive-css-name-gap] [fixture:
usecase/lex-class-property-custom-gap]

Inside a CSS property-name word, a selected ignored semicolon is rejected.
[fixture: usecase/div-semicolon-css-property-selected] A selected `;` in the HWS
between `--` and the following word is accepted as trivia in both `style` and
`classDef`. [fixture: usecase/lex-semicolon-css-name-gap] [fixture:
usecase/lex-semicolon-classdef-css-name-gap]

Plain strings may be empty. They stop at the next matching quote, accept
U+2028/U+2029, and do not escape a quote after backslash. They reject physical
CR/LF. Markdown strings may contain all line breaks, either quote, and Unicode
separators, and close at the first backtick/double-quote pair even after a
backslash. A markdown opener without that close is not retried as a plain
string. [fixture: usecase/gram-empty-plain], [fixture:
usecase/lex-plain-backslash], [fixture: usecase/lex-plain-escaped-quote],
[fixture: usecase/lex-plain-single-apostrophe], [fixture:
usecase/lex-plain-crlf], [fixture: usecase/lex-plain-u2028], [fixture:
usecase/lex-markdown-crlf], [fixture: usecase/lex-markdown-embedded-double],
[fixture: usecase/lex-markdown-earliest-close], [fixture:
usecase/lex-markdown-close-backslash], [fixture: usecase/lex-markdown-unclosed].

A physical line terminator inside common trivia is not string content. This also
applies to single-quoted native metadata: the comment-region case leaves U+2028
in the value, whereas a physical LF left in the string is rejected. [fixture:
usecase/lex-native-single-quote-comment-region-ls] [fixture:
usecase/lex-native-single-quote-comment-region-control] [fixture:
usecase/lex-native-single-quote-comment-region-lf]

### Categories and unquoted text

Word includes Identifier and the listed keywords. LabelText includes Word,
number, at, comma, colon, hash-color, css-identifier, escaped-comma, dash, dot,
percent, css-punctuation, label-punctuation, and label-symbol. Strings are
separate alternatives, not LabelText members. Native ids/classes/metadata words
usually demand the exact Identifier unit, not Word. A keyword can be a label or
CSS word but cannot thereby become an id. The raw id inside json-prefix is the
explicit exception. [fixture: usecase/lex-keyword-labels], [fixture:
usecase/lex-keyword-ids], [fixture: usecase/gram-class-keyword-name], [fixture:
usecase/gram-classdef-keyword-id], [fixture:
usecase/lex-keyword-style-word-category]; [fixture:
usecase/gram-json-keyword-id], [fixture: usecase/gram-json-keyword-id-style].

LabelText excludes shape delimiters, operators, stereotype-open, metadata-open,
and class-separator. An unquoted label needs at least one such unit and cannot
mix in a subsequent quoted string. The source between its first and last units
keeps interior spaces. Semicolons, lone angle brackets, backslash, backtick,
NUL, other controls, Unicode spaces, and supplementary text can be label text;
quotes cannot be standalone fallback text. [fixture:
usecase/lex-label-fallback-punctuation], [fixture:
usecase/lex-label-fallback-symbols], [fixture: usecase/lex-nul], [fixture:
usecase/lex-supplementary-label], [fixture: usecase/lex-label-u2028], [fixture:
usecase/lex-label-u2029], [fixture: usecase/gram-empty-label], [fixture:
usecase/gram-empty-brackets], [fixture: usecase/gram-edge-label-operator].

### JSON context

Only the balanced-object rule and its unclosed-object fallback are active. Start
at {. Outside a double-quoted region, { increases depth and } decreases it; the
first } returning depth to zero closes the unit and returns to default context.
Inside double quotes, backslash protects exactly the next character; otherwise
the next double quote ends that region. Braces inside that region do not affect
depth. Single quotes, brackets, comments, and native keywords do not have
special meaning for balancing. All whitespace, LF, CR, U+2028/U+2029, and
punctuation are raw content here. Common preprocessing still applies first.
[fixture: usecase/db-json-values], [fixture:
usecase/gram-json-double-backslash-before-quote], [fixture:
usecase/lex-json-mode-unclosed-string], [fixture: usecase/gram-json-comment],
[fixture: usecase/lex-json-ls-string], [fixture:
usecase/div-lex-json-ps-whitespace]; [fixture:
usecase/gram-json-brace-in-single-quote], [fixture:
usecase/div-json-balanced-single-quote], [fixture:
usecase/div-json-whole-line-bare-percent].

Only balancing decides whether this unit exists. JSON content validation is
outside this syntax under
[embedded-data-opaque](../known-divergences/embedded-data-opaque.md); unclosed
balancing remains rejected. [fixture: usecase/div-json-balanced-invalid-array]
[fixture: usecase/div-json-balanced-single-quote] [fixture:
usecase/gram-json-empty-delimiter-only]

### Stereotype context

Try `>>` first and return to default context. Otherwise take all characters
through immediately before the first `>>`, provided that text contains no
physical line break and is not all common whitespace. Then the closer is tried
at its next position. On failure the unclosed-text fallback consumes a maximal
non-LF run and leaves the context; the grammar rejects that fallback. Thus
empty, whitespace-only, multiline, and unclosed stereotypes are rejected.
U+2028/U+2029 can be text; nested `<<`, quotes, braces, punctuation, and
backslashes are ordinary content. [fixture: usecase/gram-stereotype-empty],
[fixture: usecase/gram-stereotype-space], [fixture:
usecase/gram-stereotype-open], [fixture: usecase/gram-stereotype-newline],
[fixture: usecase/gram-stereotype-u2028], [fixture:
usecase/gram-stereotype-u2029], [fixture: usecase/lex-stereotype-nested-open],
[fixture: usecase/lex-stereotype-first-close]; [fixture:
usecase/lex-stereotype-only-whitespace].

### Whitespace, comments, and directives in every context

Before the header, common leading whitespace uses the full common whitespace
set. After it, default-context trivia is only ASCII space/tab plus physical line
breaks. Unicode spaces, VT/FF, NUL, and U+0085 are label-symbol content, not
indentation or statement separators. In stereotype and JSON contexts there is no
skipped HWS rule; their rules read it as content. [fixture:
usecase/lex-whitespace-leading], [fixture: usecase/lex-tab-blank-line],
[fixture: usecase/lex-unicode-blank-line], [fixture:
usecase/lex-unicode-indent], [fixture: usecase/lex-bom-blank-line], [fixture:
usecase/lex-vt], [fixture: usecase/lex-ff], [fixture: usecase/lex-nel],
[fixture: usecase/lex-style-unicode-trailing], [fixture:
usecase/lex-native-label-separators].

Common comment regions are recognized in all contexts, including strings,
metadata, JSON, and accessibility blocks. They can remove entire comment lines
and preceding blank lines. Native comments are different: only default context
recognizes a physical line whose prefix before %% contains ASCII spaces/tabs
only. Its mark is %% and its value runs through the physical line, excluding LF;
neither U+2028 nor U+2029 ends it. A bare %% or a non-directive %%{...} line
after the header is a native comment. Native comments supply a comment line, not
an inline statement suffix. [fixture: usecase/comment-bare-pair], [fixture:
usecase/comment-bare-eof], [fixture: usecase/comment-u2028], [fixture:
usecase/comment-u2029], [fixture: usecase/comment-after-actor], [fixture:
usecase/comment-after-edge], [fixture: usecase/gram-json-comment], [fixture:
usecase/db-accdescr-block-comment]; [fixture: usecase/lex-comment-bare-ls],
[fixture: usecase/lex-comment-region-hides-markdown-close], [fixture:
usecase/lex-comment-inline-native], [fixture:
usecase/lex-comment-region-inside-stereotype].

An inline %% is ordinary data where the grammar permits it, such as bare labels,
notes, accessibility line values, and CSS values. In other positions it usually
causes rejection. A single %, #, or // is not a comment mark. A %% formed by
leaving out a directive follows the same rules; one inside a string is not a
native comment. [fixture: usecase/comment-unquoted], [fixture:
usecase/comment-quoted], [fixture: usecase/comment-after-note-unquoted],
[fixture: usecase/comment-after-style], [fixture:
usecase/comment-after-acctitle], [fixture: usecase/comment-hash], [fixture:
usecase/comment-slash], [fixture: usecase/comment-single-percent], [fixture:
usecase/lex-directive-between-percent-signs].

Usecase keeps inline `%%` in labels. When LF terminates the line containing
`A(C4Context %% C4Container)`, detection removes the percent suffix and selects
usecase; its label still contains the whole written text. At EOF, detection
leaves that suffix in place, selects C4 and rejects the input. This
specification accepts that same label as usecase under the existing reverse
criterion. [fixture: usecase/lex-c4-inline-percent-with-lf] [fixture:
usecase/div-c4-inline-percent-eof]

CR and CRLF read as LF before these rules; original line terminators remain in
AST values. U+2028/U+2029 do not separate statements, but remain content in
plain/markdown labels, a stereotype, or an accessibility value. In JSON they are
opaque content; strict JSON rejects them as structural whitespace and accepts
them inside strings, which
[embedded-data-opaque](../known-divergences/embedded-data-opaque.md)
distinguishes. [fixture: usecase/lex-statements-cr], [fixture:
usecase/lex-statements-crlf], [fixture: usecase/lex-plain-cr], [fixture:
usecase/lex-markdown-cr], [fixture: usecase/lex-u2028-line], [fixture:
usecase/lex-u2029-line], [fixture: usecase/lex-accessibility-line-separators],
[fixture: usecase/gram-stereotype-u2028], [fixture:
usecase/div-gram-json-u2028], [fixture: usecase/gram-json-u2029-string].

Directives are common trivia in every context; multiline directives can remove
physical line breaks. Apply the shared atomic-boundary rule to header/statement
keywords, direction words, ordinary ids, edge ids, class names, native bare
metadata keys/scalars, words within CSS property names, arrows, and compound
native `@{`, `:::`, `<<`, and `>>` delimiters. Strings, label text, stereotype
text, CSS value text, accessibility values, and JSON interiors can contain
directives. A directive between complete structural components is allowed.
[fixture: usecase/div-directive-in-header], [fixture:
usecase/div-directive-in-id], [fixture: usecase/div-directive-in-keyword],
[fixture: usecase/div-directive-splits-operator], [fixture:
usecase/div-directive-in-metadata], [fixture:
usecase/div-lex-directive-in-metadata-key], [fixture:
usecase/div-lex-directive-in-class-delimiter], [fixture:
usecase/div-lex-directive-in-stereotype-opener], [fixture:
usecase/directive-in-label], [fixture: usecase/directive-in-stereotype],
[fixture: usecase/directive-in-json]; [fixture:
usecase/div-directive-in-native-boolean], [fixture:
usecase/lex-directive-native-quoted-key], [fixture:
usecase/div-directive-css-property], [fixture:
usecase/lex-directive-css-number], [fixture:
usecase/lex-directive-before-label]. [fixture:
usecase/div-directive-stereotype-closer] [fixture:
usecase/div-directive-explicit-edge-id] [fixture:
usecase/lex-stereotype-closer-control] [fixture:
usecase/gram-explicit-edge-id-control]

The JSON prefix contains separate structural components: the json word, its id,
and @. Each has its own boundary; the whole prefix is not one atomic keyword. A
directive between the complete id and @, between @ and {, or in their HWS is
permitted; one splitting json or its id is rejected. [fixture:
usecase/lex-directive-between-json-id], [fixture:
usecase/div-lex-directive-in-json-keyword], [fixture:
usecase/lex-directive-in-json-declaration-at]; [fixture:
usecase/lex-directive-whole-json-prefix-boundary]. The native metadata `@{`
remains one compound delimiter and follows the other rule. [fixture:
usecase/div-directive-raw-json-id] [fixture:
usecase/gram-json-prefix-id-control]

The common ignored-semicolon rule applies in every context, before entity
encoding. Its selected semicolon may disappear from strings, values, or between
complete units. Inside the same atomic components as above, including a word
within a CSS property name, it is an existing reason-2 divergence. Other
semicolons are label text where LabelText permits them, but never general
statement separators. [fixture: usecase/lex-style-hash-semicolon], [fixture:
usecase/lex-style-label-trigger], [fixture: usecase/lex-style-label-three],
[fixture: usecase/lex-style-label-both], [fixture:
usecase/lex-style-trigger-json], [fixture:
usecase/lex-style-trigger-metadata-icon], [fixture:
usecase/lex-style-trigger-ls], [fixture: usecase/gram-actor-semicolon],
[fixture: usecase/gram-note-semicolon]; [fixture:
usecase/lex-semicolon-complete-unit-boundary], [fixture:
usecase/div-semicolon-identifier-selected], [fixture:
usecase/div-semicolon-keyword-selected], [fixture:
usecase/div-semicolon-joins-arrow-selected], [fixture:
usecase/div-semicolon-native-key-valid], [fixture:
usecase/div-semicolon-native-value-selected]. [fixture:
usecase/div-semicolon-stereotype-closer-selected] [fixture:
usecase/lex-semicolon-stereotype-closer-control]

The forward-circle and forward-cross rules precede markerless-solid and have no
word-boundary test: `A --order` has target `rder` and `A --xray` has target
`ray`. The first `o` or `x` belongs to the arrow. HWS after the marker keeps the
next id whole. [fixture: usecase/lex-forward-circle-id-prefix] [fixture:
usecase/lex-forward-cross-id-prefix] [fixture:
usecase/lex-forward-circle-id-spaced] [fixture:
usecase/lex-forward-cross-id-spaced]

## Grammar

These productions use [common notation](../common.md#notation) and the ordered
units above. HWS is trivia except where a prefix rule or line-start condition
expressly requires it. `id` means an exact identifier unit; `raw-json-id` is the
positive ASCII word run inside the JSON prefix. Every unit must belong to the
grammar; text left after a complete diagram rejects the input. [fixture:
usecase/gram-two-statements-line], [fixture: usecase/header-twice], [fixture:
usecase/gram-arrow-chain], [fixture: usecase/header-same-line].

```text
diagram = "usecase-beta" line-end top-line* end-of-text
top-line = newline | comment-line | statement
comment-line = diagram-comment line-end
line-end = newline | end-of-text

statement = acc-title-statement | acc-descr-statement
          | acc-descr-block-statement | direction-statement
          | actor-statement | boundary-statement | note-statement
          | json-statement | class-def-statement | class-statement
          | style-statement | metadata-assignment | entity-statement

actor-statement = "actor" actor-item ( ( "," actor-item )+ | relation-tail )? line-end
actor-item = actor-name metadata? stereotype? class-suffix?
actor-name = id ( "(" node-label ")" )? | plain-string | markdown-string

entity-statement = entity-name relation-tail? line-end
entity-name = ( id ( "(" node-label ")" | "[" node-label "]" )?
              | plain-string | markdown-string )
              metadata? stereotype? class-suffix?
node-label = plain-string | markdown-string | label-text-unit+

relation-tail = ( id "@" )? relationship-operator entity-name
relationship-operator = semantic-operator | sole-association
                      | split-association
semantic-operator = "--|>" | "..>" ":" ( include-word | extend-word )
sole-association = forward-solid | backward-solid | markerless-solid
                 | forward-circle | backward-circle | forward-cross | backward-cross
split-association = "--" edge-label ( forward-solid | markerless-solid | "--o" | "--x" )
                  | "<--" edge-label markerless-solid
                  | "o--" edge-label markerless-solid
                  | "x--" edge-label markerless-solid
edge-label = plain-string | markdown-string | label-text-unit+

metadata = "@{" newline* ( metadata-property
           ( metadata-separator metadata-property )*
           ( "," | newline )? newline? )? "}"
metadata-property = ( id | plain-string ) ":" ( id | plain-string | "true" | "false" )
metadata-separator = "," newline* | newline+ ","? newline*
metadata-assignment = metadata-target metadata line-end
metadata-target = id | plain-string | markdown-string
stereotype = "<<" stereotype-text ">>"
class-suffix = ":::" id ( "," id )*

boundary-statement = "systemBoundary" boundary-name metadata? class-suffix?
                     line-end boundary-line* "end" line-end
boundary-name = id ( "(" node-label ")" | "[" node-label "]" )?
              | plain-string | markdown-string
boundary-line = newline | comment-line | actor-declaration | entity-name line-end
actor-declaration = "actor" actor-item ( "," actor-item )* line-end

note-statement = "note" "for" id node-label line-end
json-statement = json-prefix balanced-json-object class-suffix? line-end
json-prefix = "json" positive-hws raw-json-id hws* "@" hws*
direction-statement = "direction" ( "TD" | "TB" | "BT" | "LR" | "RL" ) line-end
class-def-statement = "classDef" id ( "," id )* styles line-end
class-statement = "class" id ( "," id )* id ( "," id )* line-end
style-statement = "style" id styles line-end
styles = style-declaration ( "," style-declaration )*
style-declaration = ( word | css-identifier | markerless-solid word ) ":" style-component+

acc-title-statement = acc-title-line line-end
acc-descr-statement = acc-descr-line line-end
acc-descr-block-statement = acc-descr-block line-end
```

`style-component` is Word, plain-string, number, hash-color, css-identifier,
escaped-comma, dash, dot, percent, css-punctuation, colon, parentheses,
brackets, braces, at, or markerless-solid. It is not markdown-string,
label-punctuation, label-symbol, comma, a marker arrow, or a delimiter opener
such as metadata-open. Thus this is not arbitrary CSS acceptance. [fixture:
usecase/gram-styles-components], [fixture: usecase/gram-style-empty], [fixture:
usecase/gram-style-markdown], [fixture: usecase/gram-style-semicolon], [fixture:
usecase/gram-style-trailing-comma], [fixture:
usecase/lex-style-unicode-trailing].

An empty plain-string is a value component: `color:""` is valid and keeps the
quotes in the CSS text. HWS alone after the colon supplies no component.
[fixture: usecase/gram-css-empty-string-component] [fixture:
usecase/gram-css-whitespace-without-component]

The grammar's alternatives have these measured disambiguations:

1. Top-level target immediately followed by metadata-open selects
   metadata-assignment before entity-statement. It must end after that block. An
   explicit shape label before metadata avoids that guard. Inside a boundary,
   the same bare-id metadata spelling is an entity declaration. [fixture:
   usecase/db-metadata-forward], [fixture:
   usecase/gram-boundary-standalone-metadata-inside]; [fixture:
   usecase/gram-bare-source-metadata-forces-update], [fixture:
   usecase/gram-labeled-source-metadata-declaration], [fixture:
   usecase/gram-target-metadata-declaration], [fixture:
   usecase/gram-boundary-target-update-is-member].
2. At top-level entity-statement start only, an unquoted id equal, ignoring
   ASCII case, to allowmixing, newpage, package, rectangle, or skinparam is
   rejected. The restriction does not apply to an actor name, a boundary member,
   a target, or the earlier metadata-assignment alternative. [fixture:
   usecase/gram-forbidden-uppercase], [fixture:
   usecase/spec-usecase-parser-5642283f], [fixture:
   usecase/spec-usecase-parser-f082d9b7]; [fixture:
   usecase/gram-forbidden-in-boundary], [fixture:
   usecase/gram-forbidden-actor-name], [fixture: usecase/gram-forbidden-target],
   [fixture: usecase/gram-forbidden-as-metadata-target].
3. A split association is chosen when its opening has exactly the listed
   spelling and a following nonempty sequence of label-compatible units reaches
   an allowed closing operator before any incompatible unit. The scan's
   label-compatible set includes plain/markdown strings, but the label grammar
   still accepts just one string or a positive bare run. It does not allow a
   mixture of either. A longer left opening such as `---` or `<---` cannot open
   a label. [fixture: usecase/gram-arrow-long-left-label], [fixture:
   usecase/gram-backward-long-labeled-left], [fixture:
   usecase/db-labeled-arrows], [fixture: usecase/gram-edge-label-operator].
4. An actor statement chooses either a comma list or one relationship, never a
   list followed by a relationship. A relationship contains exactly two written
   endpoint occurrences; chains are rejected. [fixture:
   usecase/gram-actor-list], [fixture: usecase/gram-actor-list-relation],
   [fixture: usecase/gram-actor-relation], [fixture: usecase/gram-arrow-chain].
5. A boundary's content takes declarations only; it is not top-line*. There is
   no stereotype suffix on a boundary and no class/style, direction, note, JSON,
   relationship, nested boundary, or accessibility statement in its body.
   Metadata-looking member declarations are permitted. [fixture:
   usecase/gram-boundary-acc], [fixture: usecase/gram-boundary-actor-relation],
   [fixture: usecase/gram-boundary-class], [fixture:
   usecase/gram-boundary-direction], [fixture: usecase/gram-boundary-style],
   [fixture: usecase/gram-boundary-nested], [fixture:
   usecase/spec-usecase-parser-1c613ef7], [fixture:
   usecase/spec-usecase-parser-20ebe1d4], [fixture:
   usecase/spec-usecase-parser-c53dbb01].
6. Metadata permits leading blank lines. Properties are separated by newlines or
   commas. [fixture: usecase/gram-metadata-comma] [fixture:
   usecase/gram-metadata-newline]

   Count the line breaks after the common comment-region and line-terminator
   rules. Between the last property and `}`, the optional trailing comma and
   physical line breaks total at most two, with the comma allowed only before
   the line breaks. [fixture: usecase/gram-metadata-tail-newline-before-comma]
   [fixture: usecase/gram-metadata-tail-newline-before-comma-newline] [fixture:
   usecase/gram-native-trailing-newline] [fixture:
   usecase/gram-metadata-no-trailing-comma-two-newlines] [fixture:
   usecase/gram-metadata-no-trailing-comma-three-newlines] [fixture:
   usecase/gram-metadata-no-trailing-comma-four-newlines] [fixture:
   usecase/gram-metadata-no-trailing-comma-two-properties-two-newlines]
   [fixture:
   usecase/gram-metadata-no-trailing-comma-two-properties-three-newlines]
   [fixture: usecase/gram-edge-metadata-two-newlines] [fixture:
   usecase/gram-edge-metadata-three-newlines] [fixture:
   usecase/gram-metadata-trailing-comma-no-newline] [fixture:
   usecase/gram-native-trailing-comma-newline] [fixture:
   usecase/gram-metadata-trailing-comma-two-newlines] [fixture:
   usecase/gram-metadata-trailing-comma-three-newlines]

   A comma between properties permits zero or more line breaks before the next
   property. [fixture: usecase/gram-metadata-property-comma-no-newline]
   [fixture: usecase/gram-metadata-property-comma-one-newline] [fixture:
   usecase/gram-metadata-property-comma-two-newlines] [fixture:
   usecase/gram-metadata-property-comma-three-newlines]

   ASCII spaces/tabs do not change the count, and a CRLF pair is one line break.
   [fixture: usecase/gram-metadata-trailing-comma-one-newline-hws] [fixture:
   usecase/gram-metadata-trailing-comma-two-newlines-hws] [fixture:
   usecase/gram-metadata-property-comma-one-newline-hws] [fixture:
   usecase/gram-metadata-property-comma-two-newlines-hws] [fixture:
   usecase/gram-metadata-trailing-comma-one-newline-crlf] [fixture:
   usecase/gram-metadata-trailing-comma-two-newlines-crlf] [fixture:
   usecase/gram-metadata-trailing-comma-three-newlines-crlf] [fixture:
   usecase/gram-metadata-property-comma-one-newline-crlf] [fixture:
   usecase/gram-metadata-property-comma-two-newlines-crlf] [fixture:
   usecase/gram-metadata-property-comma-three-newlines-crlf] [fixture:
   usecase/gram-metadata-no-trailing-comma-two-crlf] [fixture:
   usecase/gram-metadata-no-trailing-comma-three-crlf] [fixture:
   usecase/gram-metadata-no-trailing-comma-two-whitespace-lines] [fixture:
   usecase/gram-metadata-no-trailing-comma-whitespace-lines] [fixture:
   usecase/gram-metadata-no-trailing-comma-two-tab-lines] [fixture:
   usecase/gram-metadata-no-trailing-comma-tab-lines]

   Common comment-region removal can reduce the number of line breaks; only the
   breaks that remain are counted. [fixture:
   usecase/gram-metadata-trailing-comma-comment-line] [fixture:
   usecase/gram-metadata-trailing-comma-comment-line-blank-after] [fixture:
   usecase/gram-metadata-property-comma-comment-line] [fixture:
   usecase/gram-metadata-property-comma-comment-line-blank-after] [fixture:
   usecase/gram-metadata-no-trailing-comma-comment-two-newlines] [fixture:
   usecase/gram-metadata-no-trailing-comma-comment-three-newlines]

   An initial/doubled comma, a trailing comma placed after a newline without
   another property, or two properties separated only by HWS is rejected. No
   scalar/array/mapping value grammar is imported from YAML or JSON. [fixture:
   usecase/gram-metadata-no-separator] [fixture:
   usecase/gram-metadata-double-comma] [fixture:
   usecase/gram-metadata-empty-comma-only] [fixture:
   usecase/gram-native-leading-comma] [fixture:
   usecase/gram-native-trailing-newline-comma] [fixture:
   usecase/gram-native-trailing-comma-newline-property] [fixture:
   usecase/gram-native-key-newline-colon] [fixture:
   usecase/gram-native-value-newline]

7. Class suffix and class-name/target lists have no holes or final empty item;
   styles likewise require a property/value after every comma. Suffix order is
   metadata, stereotype, classes for actor/entity, metadata then classes for a
   boundary, and classes only after a JSON object. [fixture:
   usecase/gram-class-suffix-missing], [fixture:
   usecase/gram-class-suffix-order], [fixture:
   usecase/gram-actor-suffix-metadata-after-stereotype], [fixture:
   usecase/gram-entity-class-before-metadata], [fixture:
   usecase/gram-style-trailing-comma], [fixture:
   usecase/spec-usecase-parser-c35d5e27].
8. A completed statement requires line-end. Native HWS may precede it. A
   semicolon does not replace it. Common comments/directives can leave it
   present or remove their own line breaks, but do not introduce a generic
   empty-block exception. Empty accessibility blocks require their own line.
   [fixture: usecase/gram-two-statements-line], [fixture:
   usecase/gram-final-statement-eof], [fixture: usecase/gram-boundary-end-eof],
   [fixture: usecase/gram-acc-block-semicolon], [fixture:
   usecase/lex-actor-final-tab], [fixture:
   usecase/directive-closed-statement-ends]; [fixture:
   usecase/gram-a11y-empty-inline-after-node], [fixture:
   usecase/gram-a11y-empty-between-actor-and-id], [fixture:
   usecase/gram-a11y-empty-block-same-line-following].

Within one native property, HWS may separate key, colon and value, but a
physical newline cannot separate the key from its colon or the colon from its
value. [fixture: usecase/gram-native-key-newline-colon] [fixture:
usecase/gram-native-key-comment-region-keeps-line-break] [fixture:
usecase/gram-native-value-newline] [fixture:
usecase/gram-native-value-comment-region-keeps-line-break] Newlines separate
complete properties instead. [fixture: usecase/gram-metadata-newline]

Every keyword and delimiter above is a lexical unit or a component of a
composite match. Comment and blank lines have no statement nodes. The
rule-to-node mapping below defines the source occurrences; name/label,
metadata-property, style-declaration, operator, and block productions make their
respective occurrence nodes rather than resolved Db entries.

### Rejections outside the grammar

The following conditions decide acceptance after the grammar. Value conversion
and resulting defaults are defined in the tests package summary.

- Actor, usecase, boundary, JSON, and explicit-edge ids share one namespace. The
  generated id of a quoted-only label is its converted content with each
  non-ASCII-word UTF-16 code unit replaced by underscore. Generated ids can be
  empty. Distinct declarations involving a generated id collide even if the
  written labels are equal. JSON and explicit-edge declarations always require a
  unique id. Explicit actor/usecase/boundary declarations may repeat only under
  the compatibility conditions below. Classes have their own definition
  namespace. [fixture: usecase/gram-generated-label-repeat], [fixture:
  usecase/gram-json-duplicate-id], [fixture:
  usecase/spec-usecase-parser-31b56285], [fixture:
  usecase/spec-usecase-parser-86075211], [fixture: usecase/db-prototype-ids],
  [fixture: usecase/gram-empty-quoted-name].
- Repeated explicit element declarations require the same kind, converted label
  text and label type; explicit shapes and nonempty trimmed stereotypes must
  agree. Repeated boundaries require the same converted title text/type. An
  element may belong to only one nonempty boundary id. Outside declarations do
  not remove an existing membership; an empty quoted boundary id does not
  establish a conflicting parent. [fixture:
  usecase/spec-usecase-parser-dcb7554d], [fixture:
  usecase/spec-usecase-parser-52bb0d24], [fixture:
  usecase/spec-usecase-parser-4f100e01], [fixture:
  usecase/spec-usecase-parser-ad15d068], [fixture:
  usecase/spec-usecase-parser-0996ad58], [fixture:
  usecase/gram-actor-repeat-labeltype-conflict], [fixture:
  usecase/gram-boundary-repeat-labeltype-conflict]; [fixture:
  usecase/gram-empty-boundary-conflicting-parent], [fixture:
  usecase/gram-stereotype-trimmed-conflict].
- A bare or quoted-only relationship endpoint is a reference unless metadata, a
  stereotype, or an explicit shape makes it a declaration. The actor-keyword
  source is a declaration. A class suffix alone does not make an endpoint a
  declaration and is rejected there. Declared symbols resolve throughout the
  complete diagram; an otherwise unresolved endpoint denotes an implicit
  usecase. A reference to a generated id does not itself repeat the generated
  declaration. [fixture: usecase/gram-classes-on-reference-only], [fixture:
  usecase/gram-classes-on-quoted-reference-only], [fixture:
  usecase/db-generated-reference]; [fixture:
  usecase/gram-generated-reference-not-declaration], [fixture:
  usecase/gram-metadata-on-anonymous-resolved-node].
- Relationships may connect actor/usecase/JSON symbols, never a boundary or an
  explicit edge. Include/extend require two usecases. Generalization requires
  two actors or two usecases of the same kind. JSON may participate only in
  forward-point, backward-point, or markerless associations. [fixture:
  usecase/spec-usecase-parser-81a7a3d7], [fixture:
  usecase/spec-usecase-parser-70ebd0e2], [fixture:
  usecase/spec-usecase-parser-5c692f7f], [fixture:
  usecase/spec-usecase-parser-800c93e6].
- A note target must resolve to an actor or usecase; a later declaration or
  implicit endpoint can supply it. JSON, boundaries, explicit edges, other
  notes, and unresolved names are invalid note targets. Notes themselves have no
  authored id. [fixture: usecase/gram-note-forward], [fixture:
  usecase/gram-note-unresolved], [fixture:
  usecase/spec-usecase-parser-67cf728b], [fixture:
  usecase/spec-usecase-parser-839235e2], [fixture:
  usecase/spec-usecase-parser-e68079bc].
- Native metadata assignment targets resolve in the complete diagram, including
  inferred relationship endpoints; metadata alone does not create a top-level
  target. Class/style targets resolve in that same namespace and require a
  stored node/boundary/JSON or explicit edge, not an anonymous edge. An unused
  class definition is valid and class names need not have a definition.
  [fixture: usecase/db-metadata-forward], [fixture:
  usecase/gram-metadata-empty], [fixture: usecase/gram-class-unknown], [fixture:
  usecase/gram-style-unknown], [fixture: usecase/db-style-forward], [fixture:
  usecase/db-class-forward], [fixture: usecase/db-anonymous-edge-id], [fixture:
  usecase/db-edge-id-style]; [fixture:
  usecase/gram-metadata-on-anonymous-resolved-node].

Native metadata keys and values have these acceptance conditions:

| Target        | Permitted native properties                                                    |
| ------------- | ------------------------------------------------------------------------------ |
| actor         | type: normal/hollow/awesome as text; icon: text; business: unquoted true/false |
| usecase       | business: unquoted true/false                                                  |
| boundary      | type: rect/package as text                                                     |
| explicit edge | animate: unquoted true/false; animation: fast/slow as text                     |
| JSON          | Empty metadata only                                                            |

A text value may be a non-keyword bare Identifier or a plain quoted string. Bare
keyword booleans are boolean values; quoted booleans are strings. Keys are
case-sensitive; unknown keys and wrong value types always reject, including an
empty unknown key/value. Metadata permits no markdown strings. [fixture:
usecase/gram-metadata-keyword-value], [fixture:
usecase/gram-metadata-boolean-key], [fixture:
usecase/gram-metadata-markdown-key], [fixture:
usecase/gram-metadata-uppercase-boolean], [fixture:
usecase/gram-metadata-uppercase-false], [fixture:
usecase/gram-metadata-numeric-value], [fixture:
usecase/gram-metadata-empty-key], [fixture: usecase/gram-metadata-json-empty],
[fixture: usecase/gram-metadata-json-nonempty], [fixture:
usecase/gram-metadata-unknown-key]; [fixture:
usecase/gram-native-quoted-business], [fixture:
usecase/gram-native-unknown-empty-value].

Among declaration properties, repeated actor type/icon/business values and
usecase business values must agree, including within one block. Standalone
updates replace earlier values and are applied after declaration metadata, even
when written before the declaration. Boundary inline type is update-like, not a
conflicting repeated declaration property. These are native validation
conditions, not embedded-data divergences. [fixture:
usecase/gram-metadata-duplicate-inline-conflict], [fixture:
usecase/gram-metadata-duplicate-inline-business], [fixture:
usecase/db-metadata-overrides], [fixture:
usecase/gram-metadata-standalone-before-inline], [fixture:
usecase/gram-boundary-three-classes-types]; [fixture:
usecase/gram-native-duplicate-business-same], [fixture:
usecase/gram-native-inline-conflict-later-fix].

Final actor geometry requires that a nonempty icon not coexist with a non-normal
explicit type; business true permits only normal/hollow actors. A rectangle
cannot be a business usecase. These checks use final metadata, after standalone
updates: an otherwise invalid initial combination may be repaired. A conflict
between declarations or an unknown/wrongly typed property cannot be repaired. An
empty icon string is permitted and can clear the icon. [fixture:
usecase/spec-usecase-parser-ca3ba61c], [fixture:
usecase/spec-usecase-parser-19f94cab], [fixture:
usecase/spec-usecase-parser-3f58fb81], [fixture:
usecase/spec-usecase-parser-49661584], [fixture: usecase/gram-actor-icon-clear];
[fixture: usecase/gram-native-final-invalid-then-valid], [fixture:
usecase/gram-native-inline-conflict-later-fix]. [fixture:
usecase/gram-native-invalid-property-later-fix]

The `maxEdges` and public-parse `maxTextSize` settings do not reject these
usecase inputs. [fixture: usecase/config-max-edges], [fixture:
usecase/config-max-text]. Prototype-shaped ids are accepted. [fixture:
usecase/db-prototype-ids].

For declaration compatibility, a bare standalone id supplies its own text as its
comparison label. It can therefore conflict with an earlier explicit display
label; a bare relationship endpoint only refers to that declaration and does not
replace its label. [fixture: usecase/gram-bare-declaration-label-conflict]
[fixture: usecase/gram-bare-declaration-label-matches-id] [fixture:
usecase/gram-bare-endpoint-keeps-declared-label]

### Invalid input

Every nontrivia position must be read by the lexical rules. An unreadable
character, a violation of the grammar, or a failure of the native metadata or
model constraints rejects the input. A valid prefix does not make an invalid
whole diagram accepted. [fixture: usecase/lex-lex-first-error-not-recovered]
[fixture: usecase/lex-lex-later-error-priority] [fixture:
usecase/gram-native-invalid-property-later-fix]

### Rules and nodes

| Rule                                                                  | Node                                                                                |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| diagram                                                               | UsecaseDiagram                                                                      |
| actor-statement without a relation / actor-item                       | UsecaseActorStatement / UsecaseActor                                                |
| entity-statement without a relation / entity-name                     | UsecaseEntityStatement / UsecaseEntity                                              |
| either statement with relation-tail                                   | UsecaseRelationshipStatement                                                        |
| boundary-statement                                                    | UsecaseSystemBoundaryStatement                                                      |
| metadata / metadata-property / metadata-assignment                    | UsecaseMetadata / UsecaseMetadataProperty / UsecaseMetadataAssignmentStatement      |
| node-label / edge-label / stereotype-text                             | UsecaseLabel / UsecaseLabel / UsecaseLiteral                                        |
| split opening / sole or closing arrow                                 | UsecaseOpeningArrow / UsecaseArrow                                                  |
| note-statement                                                        | UsecaseNoteStatement                                                                |
| json-statement / balanced-json-object                                 | UsecaseJsonStatement / UsecaseJsonDataBlock                                         |
| direction-statement                                                   | UsecaseDirectionStatement                                                           |
| class-def-statement / class-statement / style-statement               | UsecaseClassDefStatement / UsecaseClassStatement / UsecaseStyleStatement            |
| style-declaration / property name / value                             | UsecaseStyleDeclaration / UsecaseIdentifier / UsecaseLiteral                        |
| acc-title-statement / acc-descr-statement / acc-descr-block-statement | UsecaseAccTitleStatement / UsecaseAccDescrStatement / UsecaseAccDescrBlockStatement |

The fixtures illustrate the statement and value forms in the table. [fixture:
usecase/gram-actor-list] [fixture: usecase/gram-actor-relation] [fixture:
usecase/db-labeled-arrows] [fixture: usecase/gram-json-empty] [fixture:
usecase/db-metadata-forward] [fixture: usecase/db-accdescr-block-comment]
[fixture: usecase/gram-styles-components]

An explicit id is the name before its parenthesis/bracket label; a quoted-only
name supplies a label without an authored id. There is no `as` alias or title
statement. `title` alone is an ordinary entity id. [fixture:
usecase/gram-entity-as-alias] [fixture: usecase/gram-quoted-as-alias] [fixture:
usecase/gram-title-bare-id] Direction and accessibility statements may repeat;
`TD` remains written `TD`. [fixture: usecase/db-direction-all] [fixture:
usecase/db-direction-td] [fixture: usecase/db-acctitle-empty] [fixture:
usecase/db-accdescr-empty] Empty quoted labels are real nodes, and an empty
accessibility value is distinct from whitespace-only text. [fixture:
usecase/gram-empty-actor-label] [fixture: usecase/gram-empty-single-string-node]
[fixture: usecase/gram-a11y-line-raw-padding] [fixture:
usecase/gram-a11y-whitespace-block] [fixture: usecase/gram-boundary-empty-label]

## Known divergences

The following existing identifiers apply; no other rejection is relaxed.

- [directive-as-token-boundary](../known-divergences/directive-as-token-boundary.md):
  A directive cannot split a native atomic spelling, including a word within a
  CSS property name. [fixture: usecase/div-directive-css-property] A directive
  in the HWS between `--` and the following word is accepted trivia. [fixture:
  usecase/lex-directive-css-name-gap] CSS values and quoted metadata remain
  fragmentable text. [fixture: usecase/lex-directive-css-number] [fixture:
  usecase/lex-directive-native-quoted-key]
- [ignored-semicolon-as-token-boundary](../known-divergences/ignored-semicolon-as-token-boundary.md):
  A selected ignored semicolon cannot split an atomic spelling, including a word
  within a CSS property name. [fixture: usecase/div-semicolon-keyword-selected]
  [fixture: usecase/div-semicolon-native-opener-selected] [fixture:
  usecase/div-semicolon-css-property-selected] A selected `;` in the HWS between
  `--` and the following word is accepted trivia. [fixture:
  usecase/lex-semicolon-css-name-gap] [fixture:
  usecase/lex-semicolon-classdef-css-name-gap] CSS values remain fragmentable
  text. [fixture: usecase/lex-semicolon-css-number-text]
- [html-tag-in-frontmatter](../known-divergences/html-tag-in-frontmatter.md):
  Tag scanning is limited to the body. Cross-frontmatter conversion can change
  acceptance in either direction, or change a value while both readings accept.
  [fixture: usecase/div-html-frontmatter-enables-label] [fixture:
  usecase/div-html-frontmatter-blocks-label] [fixture:
  usecase/lex-html-body-label-reference] [fixture:
  usecase/lex-html-body-tag-reference] [fixture:
  usecase/div-html-frontmatter-acc-title-db] [fixture:
  usecase/lex-html-acc-title-body-control] [fixture:
  usecase/lex-html-frontmatter-arrow-closes-tag]
- [embedded-data-opaque](../known-divergences/embedded-data-opaque.md):
  Frontmatter/directives and JSON table interiors are opaque. Native metadata
  properties are syntax, with all validation above retained. [fixture:
  usecase/div-gram-json-unquoted-key] [fixture:
  usecase/div-gram-json-trailing-comma] [fixture:
  usecase/div-gram-json-malformed-escape] [fixture:
  usecase/div-frontmatter-malformed] [fixture:
  usecase/gram-native-quoted-business]
- [c4-keyword-anywhere](../known-divergences/c4-keyword-anywhere.md): The header
  selects usecase despite a later C4 word that remains visible to detection. A
  line-ending LF hides an inline percent suffix from detection; EOF does not.
  [fixture: usecase/div-detect-c4-label] [fixture:
  usecase/div-c4-component-label] [fixture: usecase/div-c4-dynamic-json]
  [fixture: usecase/div-c4-deployment-stereotype] [fixture:
  usecase/lex-c4-inline-percent-with-lf] [fixture:
  usecase/div-c4-inline-percent-eof]
- [bare-percent-line-before-header](../known-divergences/bare-percent-line-before-header.md):
  Common leading comments stay trivia before this header too. [fixture:
  usecase/div-comment-preheader-bare] [fixture:
  usecase/div-comment-preheader-braces] [fixture:
  usecase/div-comment-preheader-bare-unicode-blank]
