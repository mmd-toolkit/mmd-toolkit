# Info formatting rules

Japanese version: [info.ja.md](./info.ja.md)

The 20 adopted items use the written AST and the existing shared printer.
Invisible characters and physical CR examples are escaped test cases.

## Rules

### Header

Print exact `info` at column one and a written `showInfo` after one space. A
header at column one is easier to find than an indented one. Join ordinary
whitespace and line breaks before the flag;
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives one space
between `info` and its flag, as Prettier prints `return  x` as `return x;`;
never add or remove the flag. Comments, global directives, hidden forms and
protected segments keep their boundaries instead of being crossed.

[fixture: info/header/header-only]

[fixture: info/header/header-flag-inline]

[fixture: info/header/header-flag-next-line]

[fixture: info/header/header-comment-before-flag]

[corpus fixture: info/header-lf]

[corpus fixture: info/header-inline-flag]

[corpus fixture: info/header-flag-next-line]

Input (escaped): `" \tinfo  \n"`.

Output
([header/header-only-output.mmd](../tests/fixtures/info/header/header-only-output.mmd)):

```mmd
info
```

### Indentation

[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) puts ordinary body
statements and standalone comments/directives one configured step below the
header, as Prettier prints the lines inside a block. `tabWidth: 0` gives zero
spaces; `useTabs` gives one tab even at width zero, because info columns have no
grammatical meaning. Value continuation columns, hidden interiors/closers and
retained prefixes follow their preservation rules. YAML uses the shared positive
minimum.

[fixture: info/indentation/indent-default]

[fixture: info/indentation/indent-four]

[fixture: info/indentation/indent-zero]

[fixture: info/indentation/indent-tabs]

[fixture: info/indentation/indent-zero-tabs]

Input (escaped): `"info\ntitle Topic\n%% note\n%%{wrap}%%\naccTitle: Access\n"`.

Output
([indentation/indent-default-output.mmd](../tests/fixtures/info/indentation/indent-default-output.mmd)):

```mmd
info
  title Topic
  %% note
  %%{wrap}%%
  accTitle: Access
```

### Statements one per line

Move an ordinary first common statement below the header and print common
statements one per line, in written order with every occurrence:
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have) gives
this form, as a [flowchart](./flowchart.md#statements-one-per-line) and an
[ER diagram](./er.md#statements-one-per-line) print each statement on a line of
its own, also one written on the line of the header. Empty titles, accessibility
lines and description blocks remain statements even though the public Db is
empty. A keyword already consumed by a line value remains value text. Hidden
boundaries and protected groups take precedence.

[fixture: info/statements-one-per-line/first-title-inline]

[fixture: info/statements-one-per-line/first-after-flag-inline]

[fixture: info/statements-one-per-line/order-and-empty]

[fixture: info/statements-one-per-line/same-line-keyword-content]

Input (escaped): `"info title Topic\n"`.

Output
([statements-one-per-line/first-title-inline-output.mmd](../tests/fixtures/info/statements-one-per-line/first-title-inline-output.mmd)):

```mmd
info
  title Topic
```

### Title

Print `title`, one space and a value trimmed at its common-whitespace edges; a
null or whitespace-only value prints bare `title`. For equivalent exterior
whitespace, [rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives one
space between `title` and its value, as Prettier prints `return  x` as
`return x;`, and a run of spaces and tabs inside the value is printed as one
space (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)).
Never take a value from the next physical line, including across empty, comment
or directive lines. Trivia-bearing values, hidden suffixes and semicolon
protection retain their source boundaries. Where only directives follow the text
of a title, they are printed with one space before each that has spaces or tabs
before it, and the spaces and tabs after the last one are left out, unless a
directive of the line holds a line break, a `;`, a U+2028, or a U+2029 (see
[Directives that hold a line break or a semicolon](./compatibility.md#directives-that-hold-a-line-break-or-a-semicolon)
and
[Texts after a keyword that are drawn the same](./compatibility.md#texts-after-a-keyword-that-are-drawn-the-same)).
Prettier removes spaces and tabs at the end of a line, so
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) removes spaces and
tabs after the last closed directive of a title.

[fixture: title/title-directives-end-blanks-dropped] [fixture:
info/title/title-trim]

[fixture: info/title/title-whitespace]

[test: info/title/title-unicode-edges]

[fixture: info/title/title-next-empty-line]

[fixture: info/title/title-next-comment-directive]

[fixture: info/title/title-comment-edge]

[corpus fixture: info/title-empty]

[corpus fixture: info/lex-title-one-space]

[corpus fixture: info/lex-title-directive-only]

Input (escaped): `"info\ntitle\t   Topic  words \t\n"`.

Output
([title/title-trim-output.mmd](../tests/fixtures/info/title/title-trim-output.mmd)):

```mmd
info
  title Topic words
```

### Accessibility lines

Reuse the [shared accessibility layout](./pie.md#accessibility-lines): the colon
touches `accTitle` or `accDescr`, followed by one space and the trimmed nonempty
value. An accessibility line gives the diagram its one accessible title or
description, so [rule 1](./printed-form.md#1-the-whitespace-beside-a-mark)
prints the colon as the colon of a key: no space before it and one before a
nonempty value. Empty values end at the colon. This consistent compact form
preserves interior text and touching comments. A brace after the colon remains
line content. Empty values never take the next physical line across
blank/comment/directive gaps; hidden suffixes and protected gaps remain. Where
only directives follow the text of the value, they are printed with one space
before each that has spaces or tabs before it, and the spaces and tabs after the
last one are left out, unless a directive of the line holds a line break, a `;`,
a U+2028, or a U+2029 (see
[Directives that hold a line break or a semicolon](./compatibility.md#directives-that-hold-a-line-break-or-a-semicolon)
and
[Texts after a keyword that are drawn the same](./compatibility.md#texts-after-a-keyword-that-are-drawn-the-same)).
Prettier removes spaces and tabs at the end of a line, so
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) removes spaces and
tabs after the last closed directive of an accessibility value.

[fixture: accessibility-lines/acc-directives-end-blanks-dropped] [fixture:
info/accessibility-lines/a11y-lines]

[fixture: info/accessibility-lines/a11y-empty]

[fixture: info/accessibility-lines/a11y-next-forms]

[fixture: info/accessibility-lines/a11y-line-braces]

[fixture: info/accessibility-lines/a11y-touching-comment]

[test: info/accessibility-lines/a11y-unicode-edges]

[fixture: info/accessibility-lines/a11y-only-directive]

Input (escaped):
`"info\naccTitle \t:  Access  words \t\naccDescr\t:   Details  words  \n"`.

Output
([accessibility-lines/a11y-lines-output.mmd](../tests/fixtures/info/accessibility-lines/a11y-lines-output.mmd)):

```mmd
info
  accTitle: Access  words
  accDescr: Details words
```

### Description blocks

Description blocks on one line follow
[A description block on one line](./compatibility.md#a-description-block-on-one-line).
For blocks that keep their braces, separate the keyword and opening brace with
one space so the block boundary is clear. Collapse exterior runs to one space,
including plain opener whitespace across physical or Unicode line boundaries.
The `accDescr` keyword takes a description block, so
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives plain
whitespace before its opening brace the one-space gap that Prettier prints
between a keyword and what it takes. Real opener trivia keeps its break and uses
the shared continuation indentation. For example, `accDescr`, `%% c` and `{D}`
on successive lines stay separate, since mermaid.js rejects `accDescr %% c`
followed by `{D}` on the next line (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
Empty whitespace-only blocks print `{}` because no text needs surrounding
spaces. Prettier prints empty braces without interior whitespace, so
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives a
whitespace-only description block the form `{}`. Comment-only blocks keep their
comments one level inside. A separate `}` aligns with its statement.
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives this depth: it
puts the closing line at the level of the line that holds the `{`, as Prettier
prints the closing line of a block, and that line is the `accDescr` line or,
where a comment or a directive stands before the `{`, a later line at the level
of the statement. Ordinary description body and standalone comment lines align
one level inside the statement; LF indentation is absent from the Db. Keep line
breaks and interior blank lines, and the whitespace at the end of each line of
text except the last one; a line of whitespace only becomes an empty line. The
whitespace at the end of the last line of text is dropped where the closer
stands on a line of its own, and is printed as one space where the closer
follows it on that line. Directives and shared removed comment regions keep
their complete source. Quotes and backslashes do not protect the first closing
brace.

[fixture: info/description-blocks/brace-on-a-later-line]

[fixture: info/description-blocks/block-gap-presence] [fixture:
description-blocks/block-trailing-whitespace-closer-on-the-text-line]

[test: info/description-blocks/block-opener-multiline]

[test: info/description-blocks/block-empty]

[fixture: info/description-blocks/block-columns] [fixture:
info/description-blocks/block-trailing-whitespace]

[fixture: info/description-blocks/block-comment-only]

[fixture: info/description-blocks/block-opener-trivia]

[fixture: info/description-blocks/block-opener-comment]

[fixture: info/description-blocks/block-first-close]

[corpus fixture: info/lex-block-directive-only]

Input (escaped):
`"info\naccDescr{D}\naccDescr   {  D  }\naccDescr {D }\naccDescr{ D}\n"`.

Output
([description-blocks/block-gap-presence-output.mmd](../tests/fixtures/info/description-blocks/block-gap-presence-output.mmd)):

```mmd
info
  accDescr: D
  accDescr: D
  accDescr: D
  accDescr: D
```

### Authored values

Print InfoLiteral source rather than decoding or reconstructing it. Keep
interior whitespace, case, quotes, escapes, HTML and entities, even though info
publishes no common values. `singleQuote` does not rewrite quotes and
`printWidth` does not wrap values. Physical multiline block content retains line
breaks and blank lines, with body margins following
[Description blocks](#description-blocks).
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives the level of
these lines, since mermaid.js reads them without their indentation, and keeps
the line breaks between the lines of text, since mermaid.js keeps them in the
value. A range cut by common trivia keeps its complete source without
duplicating that trivia.

[fixture: info/authored-values/literal-quotes-escapes]

[test: info/authored-values/literal-html-entity]

[fixture: info/authored-values/literal-no-wrap]

[fixture: info/authored-values/literal-single-quote-option]

[corpus fixture: info/title-open-quote]

[corpus fixture: info/line-ls-block]

Input (escaped):
`"info\ntitle \"open\\q\naccTitle: 'one\\n' \"two\"\naccDescr: \\u0041 \\t\n"`.

Output
([authored-values/literal-quotes-escapes-output.mmd](../tests/fixtures/info/authored-values/literal-quotes-escapes-output.mmd)):

```mmd
info
  title "open\q
  accTitle: 'one\n' "two"
  accDescr: \u0041 \t
```

### Hidden yaml

Keep yaml-block InfoIgnoredText as its complete source span at its owner:
textBeforeHeader, textBeforeShowInfo, body or textAfter. Preserve consumed LF
outside the range and closing padding, including at EOF: deleting required
boundaries can remove EOL and reject the next statement. Exterior spare LF and
edge blanks follow [Blank lines](#blank-lines). Never insert a break before a
form or format its opaque body as YAML. Ordinary opener indentation can change;
interiors and unindented closers retain columns. Empty bodies, multiple forms,
nonqualifying earlier closers and global cuts retain their written extent.
Earlier line/block values keep priority over hidden-looking text.

[fixture: info/hidden-yaml/yaml-before-flag]

[fixture: info/hidden-yaml/yaml-body-no-flag]

[fixture: info/hidden-yaml/yaml-after-flag]

[fixture: info/hidden-yaml/yaml-block-space]

[fixture: info/hidden-yaml/yaml-block-spare]

[fixture: info/hidden-yaml/yaml-block-eof]

[fixture: info/hidden-yaml/yaml-opener-padding]

[fixture: info/hidden-yaml/yaml-two-forms]

[fixture: info/hidden-yaml/yaml-later-qualifying-closer]

[fixture: info/hidden-yaml/yaml-global-cuts]

[fixture: info/hidden-yaml/yaml-looking-block-content]

[fixture: info/hidden-yaml/yaml-looking-line-content]

[fixture: info/hidden-yaml/yaml-header-eof-padding]

[fixture: info/hidden-yaml/yaml-flag-eof-padding]

[fixture: info/hidden-yaml/yaml-body-eof-padding]

[fixture: info/hidden-yaml/yaml-body-closing-space]

[fixture: info/hidden-yaml/yaml-closer-inline-statement]

[corpus fixture: info/lex-yaml-three-fences]

Input (escaped): `"info\n---\nx: ignored\n---\nshowInfo\n"`.

Output
([hidden-yaml/yaml-before-flag-output.mmd](../tests/fixtures/info/hidden-yaml/yaml-before-flag-output.mmd)):

```mmd
info
  ---
x: ignored
---
showInfo
```

### Hidden directives

Apply the same source and boundary preservation to directive-kind
InfoIgnoredText, separately from Root directives. Preserve its owner,
arbitrary/multiline body, global cuts, consumed/spare LF and closing padding.
All four common statements retain hidden textAfter forms, including space/tab,
spare-LF and EOF boundaries. For example, mermaid.js rejects removing the
trailing space after `title Topic%%{}%%` when `accTitle: Access` follows on the
next line (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
Forms after visible EOL belong to the body. Keep fallback comments classified as
comments: adding a boundary to a glued closer could revive a swallowed flag.

[fixture: info/hidden-directives/hidden-body]

[fixture: info/hidden-directives/hidden-title-space]

[fixture: info/hidden-directives/hidden-acctitle-spare]

[fixture: info/hidden-directives/hidden-accdescr-space]

[fixture: info/hidden-directives/hidden-block-spare]

[fixture: info/hidden-directives/hidden-title-eof]

[fixture: info/hidden-directives/hidden-acctitle-eof]

[fixture: info/hidden-directives/hidden-accdescr-eof]

[fixture: info/hidden-directives/hidden-block-eof]

[test: info/hidden-directives/hidden-multiline-later-closer]

[fixture: info/hidden-directives/hidden-two-tail]

[fixture: info/hidden-directives/hidden-global-cuts]

[fixture: info/hidden-directives/hidden-title-spare]

[fixture: info/hidden-directives/hidden-acctitle-space]

[fixture: info/hidden-directives/hidden-accdescr-spare]

[fixture: info/hidden-directives/hidden-block-space]

[fixture: info/hidden-directives/hidden-header-eof-padding]

[fixture: info/hidden-directives/hidden-flag-eof-padding]

[fixture: info/hidden-directives/hidden-body-closing-space]

[fixture: info/hidden-directives/hidden-after-visible-eol]

[corpus fixture: info/hidden-directive-body]

[corpus fixture: info/hidden-directive-close-glued]

[corpus fixture: info/hidden-directive-unclosed]

Input (escaped): `"info showInfo\n%%{! ignored }%%\ntitle Topic\n"`.

Output
([hidden-directives/hidden-body-output.mmd](../tests/fixtures/info/hidden-directives/hidden-body-output.mmd)):

```mmd
info showInfo
  %%{! ignored }%%
  title Topic
```

### Comments

Ordinary standalone body comments start one step in, and inline comments stay on
their line. [Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives the
depth of a standalone comment line inside the diagram body, as Prettier prints
the lines inside a block. Preheader comments start at column one. A run of
spaces and tabs before an inline comment becomes one space.
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives one space
before a comment that stands after something on its line, as Prettier prints
`x = 1;   // c` as `x = 1; // c`.

A comment that touches what precedes it stays touching. Preserve marks, contents
and trailing spaces. Native comments end at physical LF, keeping LS/PS. A bare
percent line inside an earlier block may be value text. Common removed regions
retain swallowed source and continuation columns. Retained prefixes and
protected segments override alignment.

[fixture: info/comments/comments-align]

[fixture: info/comments/comments-inline] [fixture:
info/comments/inline-gap-run-before-comment]

[test: info/comments/comments-bare-triple]

[fixture: info/comments/comments-value-priority]

[test: info/comments/comments-common-region-join]

Input (escaped): `"    %% before\ninfo\n       %% body\naccTitle: Access\n"`.

Output
([comments/comments-align-output.mmd](../tests/fixtures/info/comments/comments-align-output.mmd)):

```mmd
%% before
info
  %% body
  accTitle: Access
```

[fixture: info/comments/hidden-comment-indentation]

### Global directives

Keep opaque Root directive source and order because common removal joins the
surrounding text, and because the later of two `init` directives that set the
same key decides the figure: reversing `theme: dark` and `theme: default` draws
another figure in every version that counts. Within a printed line, place a
directive as under [Directives](./flowchart.md#directives). When formatting
splits units that were on the same line, a directive in their gap moves with the
following unit: its right boundary stays touching or separated, while its left
contact is broken. Align only an ordinary standalone start one body step in.
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives the depth of a
standalone directive line inside the diagram body, as Prettier prints the lines
inside a block. Keep complete component boundaries and value-internal
directives, multiline contents, malformed init arguments and EOF-reaching
endings. Do not gather, reformat or delete them: an init directive can change
configuration even though info’s Db remains empty.

[fixture: info/global-directives/header-to-body]

[fixture: info/global-directives/global-colon-brace]

[fixture: info/global-directives/global-inside-values]

[fixture: info/global-directives/global-config-align]

[fixture: info/global-directives/global-multiline]

[fixture: info/global-directives/global-unclosed-word]

[corpus fixture: info/directive-header-space-control]

[corpus fixture: info/directive-invalid-init]

[corpus fixture: info/directive-unclosed-after-header]

Input (escaped):
`"info\naccTitle%%{wrap}%%: Access\naccDescr%%{wrap}%%{ D }\n"`.

Output
([global-directives/global-colon-brace-output.mmd](../tests/fixtures/info/global-directives/global-colon-brace-output.mmd)):

```mmd
info
  accTitle%%{wrap}%%: Access
  accDescr%%{wrap}%%: D
```

### Semicolons

Keep every semicolon. A segment that holds a kept `;` is formatted as anywhere
else, except where formatting could change which `;` the line rule ignores. The
rule reads a segment from the first `:` after `style` or `classDef` to the last
`#` before its last kept `;`, with no whitespace between the `:` and the `#`
(see [Semicolons](./flowchart.md#semicolons)), so the gaps and the padding
inside that stretch keep whether they hold whitespace, a run becoming one space,
and the rest of the segment follows the ordinary rules of this diagram. Text
that no part of the layout holds stays as written. A statement over several
lines whose lines, joined with one space or with nothing, could change which `;`
the line rule ignores keeps the text of each segment, up to its last kept `;`,
as written; any other statement over several lines is formatted like one on a
single line.

[fixture: semicolons/stretch-kept-rest-formatted] [fixture:
semicolons/no-stretch-formatted]

Keep protected header/body groups together, because moving a trigger can change
semicolon selection and acceptance. Both style/classDef passes, case and
colon/hash whitespace, Unicode segment bounds and directive-rejoined triggers
keep their reading. A semicolon is not a general info statement separator.

[fixture: info/semicolons/native-description-value]

[fixture: info/semicolons/semicolon-line-values]

[fixture: info/semicolons/semicolon-style-classdef]

[fixture: info/semicolons/semicolon-opener-selected]

[fixture: info/semicolons/semicolon-component-boundaries]

[fixture: info/semicolons/semicolon-brace-boundary]

[fixture: info/semicolons/semicolon-nontriggers]

[test: info/semicolons/semicolon-unicode-segments]

[fixture: info/semicolons/semicolon-comment-crossing]

[fixture: info/semicolons/semicolon-directive-crossing]

[corpus fixture: info/style-block-end-semicolon]

[corpus fixture: info/style-block-end-directive]

Input (escaped): `"info\ntitle A;; ;\naccTitle: B;\naccDescr: C;;\n"`.

Output
([semicolons/semicolon-line-values-output.mmd](../tests/fixtures/info/semicolons/semicolon-line-values-output.mmd)):

```mmd
info
  title A;; ;
  accTitle: B;
  accDescr: C;;
```

### Blank lines

Collapse ordinary internal ASCII blank runs to one and remove ordinary
document/body edge blanks. Prettier prints at most one blank line between
statements and none at the start or end of a text or block, so
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives ordinary ASCII
blank lines the same limits. Apply this around comments too. Values, directives,
hidden interiors, common-region joins and retained prefixes keep their breaks,
since these can affect source roles. After a hidden form consumes LF, keep one
spare LF only when a following statement needs it. At the document end use one
configured final newline; directly after the header remove blank lines, since
the header needs no EOL before its first statement. Elsewhere apply the ordinary
blank-line rules after the spare LF: collapse a run to one blank line and clear
whitespace-only lines. The spare LF meets the grammar.

A hidden boundary or semicolon protection can keep a statement on the header's
line; the gap after that statement's hidden suffix still lies between
statements.

[fixture: info/blank-lines/hidden-following-blanks]

[fixture: info/blank-lines/header-statement-hidden]

[fixture: info/blank-lines/header-statement-semicolon]

[fixture: info/blank-lines/hidden-document-end]

[fixture: info/blank-lines/hidden-body-end]

[fixture: info/blank-lines/hidden-header-blanks]

[fixture: info/blank-lines/blank-runs]

[fixture: info/blank-lines/blank-comments]

[fixture: info/blank-lines/blank-values-kept]

[fixture: info/blank-lines/blank-hidden-kept]

Input (escaped): `"\n\ninfo\n\n\ntitle Topic\n \t\n\naccTitle: Access\n\n"`.

Output
([blank-lines/blank-runs-output.mmd](../tests/fixtures/info/blank-lines/blank-runs-output.mmd)):

```mmd
info
  title Topic

  accTitle: Access
```

### Trailing whitespace

Remove harmless exterior ASCII padding after the header/flag and completed
blocks, giving ordinary line ends one form. Common line edges follow Title and
Accessibility lines. Keep comment/directive/hidden contents, value continuation
lines and protected segments. Hidden closing padding remains even at EOF: being
outside a node range does not make it safe to delete.

[fixture: info/trailing-whitespace/trailing-exterior]

[fixture: info/trailing-whitespace/trailing-comment-kept]

[fixture: info/trailing-whitespace/trailing-block-value-kept]

[fixture: info/trailing-whitespace/trailing-hidden-eof-kept]

Input (escaped): `"info showInfo \t\naccDescr {D} \t\n"`.

Output
([trailing-whitespace/trailing-exterior-output.mmd](../tests/fixtures/info/trailing-whitespace/trailing-exterior-output.mmd)):

```mmd
info showInfo
  accDescr: D
```

### Frontmatter yaml

Reuse [guarded YAML formatting](./compatibility.md#frontmatter) for real
frontmatter only: format safe bodies, keep delimiter padding, and preserve
malformed, indented-delimiter, HTML-hazard and delimiter-producing bodies.
Equivalent YAML quoting can otherwise become invalid after Mermaid's HTML
conversion. YAML retains the shared positive minimum at width zero. Check
embedded configuration/title separately from the empty info Db; hidden YAML is
never sent to this formatter.

[fixture: info/frontmatter-yaml/frontmatter-safe]

[fixture: info/frontmatter-yaml/frontmatter-delimiter-padding]

[fixture: info/frontmatter-yaml/frontmatter-indent-kept]

[fixture: info/frontmatter-yaml/frontmatter-html-kept]

[fixture: info/frontmatter-yaml/frontmatter-delimiter-producing-kept]

[fixture: info/frontmatter-yaml/frontmatter-zero-minimum]

[fixture: info/frontmatter-yaml/frontmatter-less-than-safe]

[corpus fixture: info/div-frontmatter-invalid-yaml]

Input (escaped):
`"---\ntitle:   Topic\nconfig: {theme: dark, look: classic}\n---\ninfo\n"`.

Output
([frontmatter-yaml/frontmatter-safe-output.mmd](../tests/fixtures/info/frontmatter-yaml/frontmatter-safe-output.mmd)):

```mmd
---
title: Topic
config: { theme: dark, look: classic }
---
info
```

### Retained prefix

Keep the complete prefix whenever textBeforeHeader holds a hidden form,
including leading LF, comment columns, passed bare-line trivia, second-scan
forms and real/hidden order. Removing leading LF could promote ignored YAML into
real frontmatter and enable configuration or reject malformed YAML. Real
frontmatter supplies YAML properties to mermaid.js and a following hidden YAML
block does not, so the blocks keep their order. If the hidden block contains
configuration, swapping the blocks would enable previously ignored settings.
Passed percent-brace/unclosed lines remain shared Comments without duplicate
printing. A prefix containing only ordinary passed comments uses the shared root
path.

[fixture: info/retained-prefix/prefix-leading-lf-kept]

[fixture: info/retained-prefix/prefix-comment-columns-kept]

[fixture: info/retained-prefix/prefix-second-scan-kept]

[fixture: info/retained-prefix/prefix-real-and-hidden]

[fixture: info/retained-prefix/prefix-bare-lines-kept]

[fixture: info/retained-prefix/prefix-between-retained-kept]

Input (escaped): `"\n---\ntitle: Hidden\nconfig: {theme: dark}\n---\ninfo\n"`.

Output
([retained-prefix/prefix-leading-lf-kept-output.mmd](../tests/fixtures/info/retained-prefix/prefix-leading-lf-kept-output.mmd)):

```mmd

---
title: Hidden
config: {theme: dark}
---
info
```

### Line terminators and unicode

Follow [shared line endings](./compatibility.md#line-endings): Prettier
normalizes CR/CRLF and emits configured LF/CRLF/CR, including in values, hidden
text and frontmatter. Preserve internal LS/PS/NBSP/BOM according to their
lexical role; common line edges trim and plain block-opener whitespace joins.
Prettier prints one space between a keyword and what it takes, so
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) makes plain
whitespace between `accDescr` and its block opener one space. Invalid native
Unicode gaps remain rejected. Prettier removes and restores a leading BOM; an
opening-fence BOM can therefore let the host read hidden YAML as real
frontmatter. Byte identity is not guaranteed.

[test: info/line-terminators-and-unicode/eol-cr-body]

[test: info/line-terminators-and-unicode/eol-crlf-block]

[test: info/line-terminators-and-unicode/eol-cr-hidden]

[test: info/line-terminators-and-unicode/eol-crlf-yaml]

[test: info/line-terminators-and-unicode/eol-output-crlf]

[test: info/line-terminators-and-unicode/eol-output-cr]

[test: info/line-terminators-and-unicode/eol-frontmatter]

[test: info/line-terminators-and-unicode/unicode-values-comments-hidden]

[test: info/line-terminators-and-unicode/bom-header]

[test: info/line-terminators-and-unicode/bom-frontmatter-opening]

[test: info/line-terminators-and-unicode/unicode-all-common-edges]

[corpus fixture: info/line-ls-between]

[corpus fixture: info/space-header-nbsp]

[corpus fixture: info/space-trailing-unicode] [corpus fixture:
info/frontmatter-bom-both]

Input (escaped): `"info\rshowInfo\rtitle Topic\r"`.

Output (escaped): `"info showInfo\n  title Topic\n"`.

### Final newline

End ordinary accepted files with one configured newline for a predictable
terminator. Header/flag-only files, common lines, empty blocks, bare/triple
comments and closed hidden forms use this path; ordinary terminal blank runs
disappear. Prettier ends a text with one line break and no blank line, so
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) removes ordinary
terminal blank lines and leaves one final line break. Keep hidden closing
padding and required boundaries, and the original ending of EOF-reaching global
directives. Adding LF to a C4-bearing EOF comment can change raw detection while
keeping the specified info reading.

[fixture: info/final-newline/final-common]

[fixture: info/final-newline/final-block]

[fixture: info/final-newline/final-comment]

[fixture: info/final-newline/final-triple-comment]

[fixture: info/final-newline/final-hidden]

[fixture: info/final-newline/final-open-global]

[corpus fixture: info/spec-info-06271baf]

[corpus fixture: info/spec-info-df27ef00]

[corpus fixture: info/div-c4container-header-comment-eof]

Input (escaped): `"info\ntitle\naccTitle: Access"`.

Output
([final-newline/final-common-output.mmd](../tests/fixtures/info/final-newline/final-common-output.mmd)):

```mmd
info
  title
  accTitle: Access
```

### Specified readings

Use the
[specification's accepted structures](../../spec/docs/diagrams/info.md#known-divergences).
Atomic directive/selected-semicolon keyword cuts remain parser failures; never
repair them. Opaque embedded data, C4 keyword detection and bare-percent
preheader Unicode use their marked readings. Raw rejection supplies no raw Db or
invented embedded effects. Standalone parse failures report a syntax error
without output; Markdown declines embedding through the shared path.

[corpus fixture: info/div-directive-header-middle]

[corpus fixture: info/div-directive-flag-middle]

[corpus fixture: info/div-directive-title-middle]

[corpus fixture: info/div-directive-acctitle-middle]

[corpus fixture: info/div-directive-accdescr-middle]

[corpus fixture: info/div-selected-showinfo]

[corpus fixture: info/div-selected-title]

[corpus fixture: info/div-selected-acctitle]

[corpus fixture: info/div-selected-accdescr-line]

[corpus fixture: info/div-selected-accdescr-block]

[corpus fixture: info/div-frontmatter-invalid-yaml]

[corpus fixture: info/div-frontmatter-html-invalid-yaml]

[corpus fixture: info/div-c4container-title]

[corpus fixture: info/div-c4component-acctitle]

[corpus fixture: info/div-c4dynamic-line]

[corpus fixture: info/div-c4deployment-block]

[corpus fixture: info/div-c4-hidden-yaml]

[corpus fixture: info/div-c4-hidden-directive]

[corpus fixture: info/div-bare-before-header-ls]

[corpus fixture: info/error-after-common]

[corpus fixture: info/lex-flag-after-empty-block]

[corpus fixture: info/lex-empty-quotes-standalone]

For example, `"info show%%{wrap}%%Info\n"` reports a standalone syntax error; no
repaired output is supplied.

### Markdown fences

Use the [shared Markdown path](./compatibility.md#markdown-code-blocks): apply
info rules to the dedented payload, leaving fence/list/quote indentation and EOL
to the host. Check actual hosts separately from payload Db and source. Markdown
trims final code-block-line padding, including a final hidden boundary; interior
hidden padding must remain before later statements. Invalid payloads decline
embedding and follow the host's unchanged-code formatting policy.

[test: info Markdown: top-level]

[test: info Markdown: list]

[test: info Markdown: quote]

[test: info Markdown: zero]

[test: info Markdown: tabs]

[test: info Markdown: hidden-boundary]

[test: info Markdown: preheader]

[test: info Markdown: frontmatter]

[test: info Markdown: global-and-semicolons]

[test: info Markdown: final-comment]

[test: info Markdown: final-hidden-padding]

[test: info Markdown: rejected]

Input (escaped): `"```mermaid\ninfo showInfo title Topic\n```\n"`.

Output (escaped): `"```mermaid\ninfo showInfo\n  title Topic\n```\n"`.
