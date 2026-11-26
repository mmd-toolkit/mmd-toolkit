# Cynefin formatting

Japanese version: [cynefin.ja.md](./cynefin.ja.md)

Formatting rules for cynefin-beta and cynefin-beta:, following the
[syntax](../../spec/docs/diagrams/cynefin.md), its
[authored tree](../../spec/docs/ast/cynefin.md) and the shared
[compatibility limits](./compatibility.md).

## Rules

### Header

Put cynefin-beta at column one. A colon right after the header word is removed:
mermaid.js reads `cynefin-beta:` and `cynefin-beta` as the same header, and the
examples in its documentation write the header without the colon 3 times against
none (see
[The colon after a header](./compatibility.md#the-colon-after-a-header)). The
colon stays where a hidden form or a global directive lies between it and the
word, and where a `;`, the `---` of a hidden YAML block, or a directive that is
not closed touches it. After `%%{%%{wrap}%%init: {"label":"style:#keep"}}%%`,
`cynefin-beta:;complex 'Kept colon'` keeps its colon, since some of the versions
of mermaid.js that count reject `cynefin-beta;complex 'Kept colon'` (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
The colon stays before an unclosed directive too: `cynefin-beta:%%{x y`, a line
break, and `complex "A"` stay as written, since mermaid.js takes the directive
out with the line break after it and would read the header and `complex` as one
word, and every version of mermaid.js that counts rejects that text (see the
same table).

[fixture: cynefin/header/colon-removed] [fixture:
cynefin/header/colon-semicolon-kept] [fixture:
cynefin/header/colon-unclosed-directive-kept] [fixture:
cynefin/header/colon-directive-before-hidden-yaml-kept]

Move an ordinary first statement to the next line, as
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have) gives:
a [flowchart](./flowchart.md#statements-one-per-line) and an
[ER diagram](./er.md#statements-one-per-line) print a statement written on the
line of the header on a line of its own. Global directive contact, hidden
neighbors and protected lines use their shared rules: a kept header line also
keeps its domain and item openings on that line. A spaced colon is rejected
rather than repaired: `cynefin-beta %%{x}%%:`, `cynefin-beta%%{x}%% :`, and
`cynefin-beta :` are rejected by every version that counts, and
`cynefin-beta %%{x}%%` with no colon is not changed.

[fixture: cynefin/header/directive-no-colon-space-kept] [test: a space before a
directive between the header and the colon of a cynefin diagram] [test: a space
before the colon after a directive of a cynefin diagram] [test: a space before
the colon of a cynefin diagram]

[fixture: cynefin/hidden-boundaries/meeting-inline-directive-directive]

[fixture: cynefin/hidden-boundaries/meeting-inline-directive-yaml]

[fixture: cynefin/hidden-boundaries/meeting-directive-only-line-directive]

[fixture: cynefin/hidden-boundaries/meeting-directive-only-line-yaml]

[fixture: cynefin/hidden-boundaries/semicolon-hidden-header-directive]

[fixture: cynefin/hidden-boundaries/meeting-unselected-semicolon-yaml]

[fixture: cynefin/hidden-boundaries/meeting-ignored-value-semicolon-directive]

[fixture: cynefin/hidden-boundaries/meeting-ignored-value-semicolon-yaml]

[corpus fixture: cynefin/semicolon-header-selected-parts]

[fixture: cynefin/hidden-boundaries/meeting-selected-gap-semicolon-yaml]

[fixture: cynefin/hidden-boundaries/meeting-comment-line-directive]

[fixture: cynefin/hidden-boundaries/meeting-comment-line-yaml]

[fixture: cynefin/hidden-boundaries/meeting-blank-line-directive]

[fixture: cynefin/hidden-boundaries/header-inline-domain-item-yaml]

[test: cynefin/hidden-boundaries/meeting-ls-in-form-directive]

[test: cynefin/hidden-boundaries/meeting-ls-in-form-yaml]

[test: cynefin/hidden-boundaries/meeting-ps-in-form-directive]

[test: cynefin/hidden-boundaries/meeting-ps-in-form-yaml]

[fixture: cynefin/hidden-boundaries/meeting-empty-description-directive]

[fixture: cynefin/hidden-boundaries/meeting-empty-description-yaml]

[fixture: cynefin/header/header-bare-inline]

[fixture: cynefin/header/header-colon-inline]

[fixture: cynefin/header/header-bare-empty]

[fixture: cynefin/header/header-colon-empty]

[fixture: cynefin/header/header-title]

[fixture: cynefin/header/header-global-colon]

Input (escaped): `"  cynefin-beta complex \"Header\""`.

Output
([header/header-bare-inline-output.mmd](../tests/fixtures/cynefin/header/header-bare-inline-output.mmd)):

```mmd
cynefin-beta
  complex
    "Header"
```

### Indentation

Use one configured step for body statements and two for domain items. Columns do
not define parents: the authored item lists do. In [ER](./er.md#indentation) and
[state](./state.md#indentation) diagrams, statements stand one level below the
header, and entity attributes or composite-state statements stand one further
level inside their owner.
[Rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have) gives
body statements one level of indentation and domain items one additional level.
tabWidth zero adds no spaces; useTabs adds one tab per step even at width zero.
Other value continuations and protected interiors retain their written columns.

[fixture: cynefin/indentation/indent-two]

[fixture: cynefin/indentation/indent-four]

[fixture: cynefin/indentation/indent-zero]

[fixture: cynefin/indentation/indent-tabs]

[fixture: cynefin/indentation/indent-zero-tabs]

Input (escaped): `"cynefin-beta\ncomplex\n \"Indent\"\nclear-->chaotic"`.

Output
([indentation/indent-two-output.mmd](../tests/fixtures/cynefin/indentation/indent-two-output.mmd)):

```mmd
cynefin-beta
  complex
    "Indent"
  clear --> chaotic
```

### Domains and items

Put the domain word on its own line and each item one step deeper, as the other
diagram types nest a block. The grammar requires no EOL between a domain and its
items, adjacent strings or adjacent domains, so splitting these units keeps the
Db. Keep empty strings, repeated items and multiline strings. For an empty
string, mermaid.js records an empty-labeled item, and for repeated items it
records a separate list entry for each occurrence. Removing an empty item or a
duplicate changes the domain's item list in the Db. Comments, directives, blanks
and hidden forms between items leave the sequence open. Protected or hidden
inline neighbors take precedence; add no closing delimiter. The Cynefin grammar
has no braces around a domain, and mermaid.js rejects braces used as domain
delimiters, so no closing delimiter is added.

[corpus fixture: cynefin/gram-domain-braces]

[corpus fixture: cynefin/db-empty-texts] [corpus fixture:
cynefin/gram-item-duplicates]

On a kept semicolon line, keep the domain word with its first item too. Moving
only the items could make the next formatting split them again.

[fixture: cynefin/semicolons/review-semicolon-following-pair]

[fixture: cynefin/domains-and-items/open-body]

[fixture: cynefin/domains-and-items/open-empty-body]

[fixture: cynefin/domains-and-items/items-adjacent]

[fixture: cynefin/domains-and-items/items-same-line]

[fixture: cynefin/domains-and-items/items-glued-domains]

[fixture: cynefin/domains-and-items/items-empty-strings]

[fixture: cynefin/domains-and-items/items-physical-string-line]

[fixture: cynefin/domains-and-items/items-comment-sequence]

[fixture: cynefin/domains-and-items/items-directive-sequence]

[fixture: cynefin/domains-and-items/items-blank-sequence]

[corpus fixture: cynefin/gram-adjacent-items]

[corpus fixture: cynefin/gram-inline-items]

[corpus fixture: cynefin/gram-items-empty-description-redeclare]

Input (escaped): `"cynefin-beta\ncomplex\"Alpha\"'Beta'clear\"Gamma'\""`.

Output
([domains-and-items/open-body-output.mmd](../tests/fixtures/cynefin/domains-and-items/open-body-output.mmd)):

```mmd
cynefin-beta
  complex
    "Alpha"
    "Beta"
  clear
    "Gamma'"
```

### Component spacing

Separate ordinary domain/item components that remain on one line by one space. A
global directive within a printed line is placed as under
[Global directives](#global-directives), and so are split gaps. Hidden closing
padding retains its protected text. A kept `;` protects no other text than the
stretch of the line rule (see [Semicolons](#semicolons)).

[fixture: cynefin/component-spacing/domain-hidden-contact]

[fixture: cynefin/component-spacing/domain-global-contact]

[fixture: cynefin/semicolons/semi-selected-outside-string]

[fixture: cynefin/semicolons/cross-domain-suffix]

Input (escaped): `"cynefin-beta\ncomplex%%{!domain-gap}%% \"ContactHidden\""`.

Output
([component-spacing/domain-hidden-contact-output.mmd](../tests/fixtures/cynefin/component-spacing/domain-hidden-contact-output.mmd)):

```mmd
cynefin-beta
  complex%%{!domain-gap}%% "ContactHidden"
```

### Statements one per line

Print ordinary domains, transitions and common statements in source order on
separate lines; add no semicolon, as the other diagram types do. Ordinary
statements stand on separate lines in
[flowchart](./flowchart.md#statements-one-per-line) and
[Venn](./venn.md#statements-one-per-line) diagrams;
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have) gives
ordinary domains, transitions and common statements the same line separation.
Cynefin has no grammatical semicolon, and mermaid.js rejects a semicolon after
an ordinary domain, so no semicolon is added. Transitions and common statements
need visible EOL. A title containing apparent domain syntax remains one value,
and an empty description block remains a statement that ends an item sequence.

[corpus fixture: cynefin/tail-domain-semicolon]

[fixture: cynefin/statements-one-per-line/statement-boundaries]

[fixture: cynefin/statements-one-per-line/domain-before-title]

[fixture: cynefin/statements-one-per-line/common-apparent-domain]

[fixture: cynefin/statements-one-per-line/empty-description-redeclare]

Input (escaped):
`"cynefin-beta\ncomplex\"Left\"clear\"Right\"chaotic-->clear\nconfusion\"End\""`.

Output
([statements-one-per-line/statement-boundaries-output.mmd](../tests/fixtures/cynefin/statements-one-per-line/statement-boundaries-output.mmd)):

```mmd
cynefin-beta
  complex
    "Left"
  clear
    "Right"
  chaotic --> clear
  confusion
    "End"
```

### Arrow spacing

Use from --> to with one ordinary space on each side of the whole arrow. The
arrow stands between two domain names, so
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) treats it as a mark
between two things and prints one space on each side. Never split the arrow or
wrap its components. Hidden named gaps and global directive contact keep their
source boundaries.

[fixture: cynefin/arrow-spacing/arrow-bare]

[fixture: cynefin/arrow-spacing/arrow-label]

[fixture: cynefin/hidden-forms/hidden-transition-all-gaps]

[fixture: cynefin/global-directives/global-component-gaps]

Input (escaped): `"cynefin-beta\ncomplex-->clear"`.

Output
([arrow-spacing/arrow-bare-output.mmd](../tests/fixtures/cynefin/arrow-spacing/arrow-bare-output.mmd)):

```mmd
cynefin-beta
  complex --> clear
```

### Label colon

Use to : "label" with one ordinary space before and after the colon. The label
belongs to the transition and not to its endpoint, so the examples in the
documentation of mermaid.js decide the whitespace before the colon (step 3 of
[Which kind a colon is](./printed-form.md#which-kind-a-colon-is)): all 4 that
write a space after the colon write a space before it (counted as under
[the examples that decide the whitespace before a colon](./compatibility.md#the-examples-that-decide-the-whitespace-before-a-colon)).
Retain an absent label, an empty quoted label and a whitespace-only label as
distinct authored forms. For a whitespace-only transition label, mermaid.js
records the space, while an empty or absent label has no label field in the Db.
Removing that space would change the label, so a whitespace-only label stays.
Hidden and global trivia gaps override ordinary spacing.

[corpus fixture: cynefin/db-empty-texts]

[fixture: cynefin/label-colon/colon-tabs]

[fixture: cynefin/label-colon/colon-empty-double]

[fixture: cynefin/label-colon/colon-empty-single]

[fixture: cynefin/label-colon/colon-space-label]

[fixture: cynefin/arrow-spacing/arrow-bare]

[fixture: cynefin/hidden-forms/hidden-transition-all-gaps]

[fixture: cynefin/global-directives/global-component-gaps]

Input (escaped): `"cynefin-beta\nchaotic --> confusion\t:\t\t'ColonTabs'"`.

Output
([label-colon/colon-tabs-output.mmd](../tests/fixtures/cynefin/label-colon/colon-tabs-output.mmd)):

```mmd
cynefin-beta
  chaotic --> confusion : "ColonTabs"
```

### Strings

Print item and transition-label StringLiteral source spans unchanged, including
escapes, empty values, HTML/entities and native-looking text, except that a run
of spaces and tabs inside an item is printed as one space (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same))
and a string between `'` is printed between `"`, unless its text holds a `'`, a
`"`, a backslash, a line break, U+2028, U+2029, a backquote, `&`, `#`, or `<`
(see
[Spellings that are drawn the same](./compatibility.md#spellings-that-are-drawn-the-same)),
and `singleQuote` is not read. Trimming or decoding escapes can change the
value.

[fixture: cynefin/strings/strings-quotes]

[fixture: cynefin/strings/single-quote-sensitive-kept]

[fixture: cynefin/strings/strings-padding]

[fixture: cynefin/strings/strings-known-escapes]

[corpus fixture: cynefin/lex-string-unknown-single]

[fixture: cynefin/strings/strings-quote-backslash]

[fixture: cynefin/strings/strings-number-looking]

[fixture: cynefin/strings/strings-hidden-looking]

[fixture: cynefin/strings/strings-global-in-value]

[fixture: cynefin/strings/strings-html-entity-accepted]

[fixture: cynefin/strings/strings-transition-escapes]

Input (escaped):
`"cynefin-beta\ncomplex 'Single' \"Double\" 'opposite \" quote' \"opposite ' quote\""`.

Options: `{"singleQuote": true}`.

Output
([strings/strings-quotes-output.mmd](../tests/fixtures/cynefin/strings/strings-quotes-output.mmd)):

```mmd
cynefin-beta
  complex
    "Single"
    "Double"
    'opposite " quote'
    "opposite ' quote"
```

### Empty domains

Keep a word-only empty domain as its own line. It can replace an earlier
declaration with an empty list, so deleting it can change the Db even when a
standalone empty domain draws nothing. Ordinary declarations and statements
stand on separate lines in [Venn](./venn.md#statements-one-per-line) and
[flowchart](./flowchart.md#statements-one-per-line) diagrams;
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have) gives
a word-only empty domain its own line too. Add neither braces nor an item.

[fixture: cynefin/empty-domains/empty-domain-alone]

[fixture: cynefin/empty-domains/empty-domain-chain]

[fixture: cynefin/empty-domains/empty-domain-last-reset]

Input (escaped): `"cynefin-beta\ncomplicated"`.

Output
([empty-domains/empty-domain-alone-output.mmd](../tests/fixtures/cynefin/empty-domains/empty-domain-alone-output.mmd)):

```mmd
cynefin-beta
  complicated
```

### Redeclarations

Keep every domain block and item in source order, including duplicate items and
all confusion items. A later declaration replaces its predecessor; merging
blocks changes that reading. For each authored item, mermaid.js records an entry
in an ordered list, including confusion items beyond the displayed subset.
Reordering items, removing duplicates or truncating confusion items changes the
Db, so item order and all these occurrences stay. Neither the effective Db order
nor a rendering limit justifies sorting, deletion or truncation.

[corpus fixture: cynefin/db-all-fields] [corpus fixture:
cynefin/gram-item-duplicates]

[fixture: cynefin/redeclarations/domain-repeat-order]

[fixture: cynefin/redeclarations/items-duplicates]

[fixture: cynefin/redeclarations/confusion-overflow]

Input (escaped):
`"cynefin-beta\nclear \"Earlier\"\ncomplex \"Partner\"\nclear \"Final\""`.

Output
([redeclarations/domain-repeat-order-output.mmd](../tests/fixtures/cynefin/redeclarations/domain-repeat-order-output.mmd)):

```mmd
cynefin-beta
  clear
    "Earlier"
  complex
    "Partner"
  clear
    "Final"
```

### Transition occurrences

Keep all authored transitions, including self transitions, duplicates,
undeclared endpoints and empty labels. Self transitions may be absent from the
Db, but they are kept. Removing duplicates or trimming whitespace-only labels
can change the reading.

[fixture: cynefin/transition-occurrences/transition-occurrences]

Input (escaped):
`"cynefin-beta\ncomplex-->clear:'First'\ncomplex-->clear:'Second'\ncomplex-->complex:'Self'\nclear-->clear\nconfusion-->chaotic:\"\""`.

Output
([transition-occurrences/transition-occurrences-output.mmd](../tests/fixtures/cynefin/transition-occurrences/transition-occurrences-output.mmd)):

```mmd
cynefin-beta
  complex --> clear : "First"
  complex --> clear : "Second"
  complex --> complex : "Self"
  clear --> clear
  confusion --> chaotic : ""
```

### Title

Use the shared common-line layout: trim ordinary outer common whitespace, insert
one space before a nonempty value and retain its internal text, except that a
run of spaces and tabs inside it is printed as one space.
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives one space
between `title` and a nonempty value, as Prettier prints `return  x` as
`return x;`. [Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) removes
the spaces and tabs at the end of the title line. Empty or whitespace-only
values print as bare title and never take text from the next line. A title
without a value ends at the keyword because
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) removes the spaces
and tabs at the line end. mermaid.js reads statement-looking text on the title
line as title text, so the following statement stays on its own line rather than
becoming part of an empty title. This chooses a Db-equal edge without
interpreting quotes as string delimiters. Preserve empty resets and trivia
contact. Where only directives follow the text of a title, they are printed with
one space before each that has spaces or tabs before it, and the spaces and tabs
after the last one are left out, unless a directive of the line holds a line
break, a `;`, a U+2028, or a U+2029 (see
[Directives that hold a line break or a semicolon](./compatibility.md#directives-that-hold-a-line-break-or-a-semicolon)
and
[Texts after a keyword that are drawn the same](./compatibility.md#texts-after-a-keyword-that-are-drawn-the-same)).

[corpus fixture: cynefin/gram-title-inline-domain]

[fixture: title/title-directives-end-blanks-dropped]

A single separator space/tab is outside the range of a null title. A `;` that
the line rule ignores before the first character of the value is a gap item
whether one whitespace character or more comes before it: `title  ;T` and
`title ;T` are printed alike.

[fixture: cynefin/semicolons/ignored-semicolon-title-value-second-space]
[fixture: cynefin/title/title-edges]

[fixture: cynefin/title/title-no-value]

[fixture: cynefin/title/title-whitespace-only]

[fixture: cynefin/title/title-quotes]

[fixture: cynefin/title/title-unmatched-quote]

[fixture: cynefin/title/title-empty-comment-global]

[fixture: cynefin/title/null-comment]

[fixture: cynefin/title/null-directive]

[corpus fixture: cynefin/common-title-comment-only]

[corpus fixture: cynefin/common-title-directive-only]

[corpus fixture: cynefin/lex-title-one-space]

[corpus fixture: cynefin/lex-title-one-tab]

Input (escaped): `"cynefin-beta\ntitle\t  Title  inside\t\ttext  "`.

Output
([title/title-edges-output.mmd](../tests/fixtures/cynefin/title/title-edges-output.mmd)):

```mmd
cynefin-beta
  title Title inside text
```

### Accessibility lines

Use shared accTitle: value and accDescr: value layouts, attaching the colon and
adding one space before a nonempty value. Empty assignments end at the colon and
never join the next line. An empty accessibility assignment ends at its colon
because [rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) removes the
spaces and tabs at the line end. mermaid.js reads text after that colon on the
same line as the accessibility value, so the following statement stays on a
separate line to preserve the empty reset and the statement. Trim ordinary outer
whitespace, retain internal text and trivia contact, and keep braces after a
colon as line-value text. These compact common forms do not reinterpret authored
values. The accessibility colon assigns the diagram its single title or
description value, so [rule 1](./printed-form.md#1-the-whitespace-beside-a-mark)
prints it as a key colon, with one space before a nonempty value and no spaces
or tabs at the line end. Braces after the colon remain value text: mermaid.js
reads `accDescr: {A}` as `{A}`, whereas `accDescr {A}` has the description `A`.
Where only directives follow the text of the value, they are printed with one
space before each that has spaces or tabs before it, and the spaces and tabs
after the last one are left out, unless a directive of the line holds a line
break, a `;`, a U+2028, or a U+2029 (see
[Directives that hold a line break or a semicolon](./compatibility.md#directives-that-hold-a-line-break-or-a-semicolon)
and
[Texts after a keyword that are drawn the same](./compatibility.md#texts-after-a-keyword-that-are-drawn-the-same)).

[corpus fixture: cynefin/common-colon-block-priority]

[fixture: accessibility-lines/acc-directives-end-blanks-dropped] [fixture:
cynefin/accessibility-lines/accessibility-padding]

[fixture: cynefin/accessibility-lines/accessibility-empty]

[fixture: cynefin/accessibility-lines/accessibility-whitespace-only]

[fixture: cynefin/accessibility-lines/accessibility-line-braces]

[fixture: cynefin/accessibility-lines/accessibility-quotes]

[fixture: cynefin/accessibility-lines/accessibility-trivia]

Input (escaped):
`"cynefin-beta\naccTitle \t:  Access  Title \t\naccDescr\t:  Access\t\tDescription  "`.

Output
([accessibility-lines/accessibility-padding-output.mmd](../tests/fixtures/cynefin/accessibility-lines/accessibility-padding-output.mmd)):

```mmd
cynefin-beta
  accTitle: Access  Title
  accDescr: Access Description
```

### Description blocks

Description blocks on one line follow
[A description block on one line](./compatibility.md#a-description-block-on-one-line).
Whitespace-only interiors become `{}`. Prettier leaves no whitespace inside
empty braces, so [rule 1](./printed-form.md#1-the-whitespace-beside-a-mark)
prints whitespace-only description interiors as `{}`. For blocks that keep their
braces, [rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives one
space between the keyword and the opening brace, as Prettier prints `class A{}`
as `class A {}`. Join plain opener whitespace, as Prettier prints `class A`, a
line break, and `{}` as `class A {}` too, and align a separate closer with the
statement. Ordinary description body and standalone comment lines align one
level inside it. Keep line breaks and interior blank lines, and the whitespace
at the end of each line of text except the last one; a line of whitespace only
becomes an empty line. A block description's line breaks form part of its value
in mermaid.js, so joining description lines with spaces changes the Db. The
whitespace at the end of the last line of text is dropped where the closer
stands on a line of its own, and is printed as one space where the closer
follows it on that line. Directives and shared removed comment regions keep
their complete source. Comments/directives inside empty blocks retain their
shared layout. Native-looking text inside a value remains value text.

[corpus fixture: cynefin/line-block-values]

[fixture: cynefin/description-blocks/description-empty] [fixture:
description-blocks/block-trailing-whitespace] [fixture:
description-blocks/block-trailing-whitespace-closer-on-the-text-line]

[fixture: cynefin/description-blocks/description-touching]

[fixture: cynefin/description-blocks/description-spaced-edges]

[fixture: cynefin/description-blocks/description-plain-opener-newline] [fixture:
cynefin/description-blocks/description-plain-opener-newline-block-kept]

[fixture: cynefin/description-blocks/description-multiline-columns]

[fixture: cynefin/description-blocks/description-comment-only]

[fixture: cynefin/description-blocks/description-directive-only]

[fixture: cynefin/description-blocks/description-opener-comment]

[test: cynefin/description-blocks/description-unicode-empty]

[fixture: cynefin/description-blocks/description-native-looking-text]

[fixture: cynefin/description-blocks/opener-directive]

Input (escaped): `"cynefin-beta\naccDescr { \t\n \n}\nclear \"AfterEmpty\""`.

Output
([description-blocks/description-empty-output.mmd](../tests/fixtures/cynefin/description-blocks/description-empty-output.mmd)):

```mmd
cynefin-beta
  accDescr {}
  clear
    "AfterEmpty"
```

### Hidden forms

Print every CynefinIgnoredText once from its source span at its AST owner:
retained prefix, body, domain-name suffix, item prefix/suffix, transition named
gap or common suffix. Its value omits common removals. Opening lines align with
their containing body; interiors and closers keep their columns. Item-leading
forms and the following label align at item depth after retained LF. Keep whole
matches, later qualifying closers, separate matches and fallback comments.

[fixture: cynefin/hidden-forms/hidden-domain-name]

[fixture: cynefin/hidden-forms/hidden-domain-empty]

[fixture: cynefin/hidden-forms/hidden-item-leading]

[fixture: cynefin/hidden-forms/hidden-item-trailing]

[fixture: cynefin/hidden-forms/hidden-body-after-domain]

[fixture: cynefin/hidden-forms/hidden-body-after-last-item]

[fixture: cynefin/hidden-forms/hidden-between-items]

[fixture: cynefin/hidden-forms/hidden-transition-all-gaps]

[fixture: cynefin/hidden-forms/hidden-unlabelled-gaps]

[fixture: cynefin/hidden-forms/hidden-title-owner]

[fixture: cynefin/hidden-forms/hidden-acctitle-owner]

[fixture: cynefin/hidden-forms/hidden-descr-owner]

[fixture: cynefin/hidden-forms/hidden-block-owner]

[fixture: cynefin/hidden-forms/hidden-post-common-body]

[fixture: cynefin/hidden-forms/hidden-yaml-three-fences]

[fixture: cynefin/hidden-forms/hidden-yaml-two-matches]

[fixture: cynefin/hidden-forms/hidden-directive-later-closer]

[fixture: cynefin/hidden-forms/hidden-common-cut-source]

[fixture: cynefin/hidden-forms/hidden-native-fallback-comment]

[fixture: cynefin/hidden-forms/hidden-adjacent-one-match]

[fixture: cynefin/hidden-forms/leading-two-forms]

[fixture: cynefin/hidden-forms/hidden-item-after-closer-tab]

[corpus fixture: cynefin/hidden-domain-item-members]

[corpus fixture: cynefin/hidden-all-unit-gaps]

Input (escaped): `"cynefin-beta\ncomplex%%{!name-owner}%%\n\"NameChild\""`.

Output
([hidden-forms/hidden-domain-name-output.mmd](../tests/fixtures/cynefin/hidden-forms/hidden-domain-name-output.mmd)):

```mmd
cynefin-beta
  complex%%{!name-owner}%%
    "NameChild"
```

[fixture: cynefin/hidden-forms/review-hidden-following-pair]

[fixture: cynefin/hidden-forms/cynefin-domain-name-hidden-edge]

[fixture: cynefin/hidden-forms/cynefin-item-leading-hidden-edge]

[fixture: cynefin/hidden-forms/cynefin-item-suffix-hidden-edge]

[fixture: cynefin/hidden-forms/cynefin-hidden-yaml-opening-edge]

### Hidden boundaries

Use shared hidden-gap and block rules for consumed LF outside node ranges,
inline contact and closer space/tab, including EOF. Transitions and common
statements require a spare visible LF after a suffix that consumes LF; closer
padding can leave LF visible instead. Domains and items need no visible EOL.
Only the header’s own hidden forms use its ordinary edge-break exception; a
first statement’s suffix remains its suffix on the header line. Preserve
multiple suffixes and body forms after visible EOL.

Use the same kept-line decision for the header, domain openings and item gaps,
including native DIRECTIVE and YAML at an item's suffix. Keep every opening on
that line with its children; moving only the children could remove the header's
protection and change the next formatting. This preserves line placement without
changing which node owns the form.

Print each semicolon-protected stretch once, even when a native suffix keeps the
same line. Retain that suffix at its owner; protection must not duplicate an
item and change the Db.

[fixture: cynefin/hidden-boundaries/semicolon-hidden-header-directive]

[fixture: cynefin/hidden-boundaries/semicolon-hidden-body-directive]

[fixture: cynefin/hidden-boundaries/semicolon-hidden-header-yaml]

[fixture: cynefin/hidden-boundaries/semicolon-hidden-body-yaml]

[fixture: cynefin/hidden-boundaries/semicolon-hidden-without-hidden]

[fixture: cynefin/hidden-boundaries/meeting-inline-directive-directive]

[fixture: cynefin/hidden-boundaries/meeting-inline-directive-yaml]

[fixture: cynefin/hidden-boundaries/meeting-directive-only-line-directive]

[fixture: cynefin/hidden-boundaries/meeting-directive-only-line-yaml]

[fixture: cynefin/hidden-boundaries/meeting-unselected-semicolon-yaml]

[fixture: cynefin/hidden-boundaries/meeting-ignored-value-semicolon-directive]

[fixture: cynefin/hidden-boundaries/meeting-ignored-value-semicolon-yaml]

[corpus fixture: cynefin/semicolon-header-selected-parts]

[fixture: cynefin/hidden-boundaries/meeting-selected-gap-semicolon-yaml]

[fixture: cynefin/hidden-boundaries/meeting-comment-line-directive]

[fixture: cynefin/hidden-boundaries/meeting-comment-line-yaml]

[fixture: cynefin/hidden-boundaries/meeting-blank-line-directive]

[test: cynefin/hidden-boundaries/meeting-ls-in-form-directive]

[test: cynefin/hidden-boundaries/meeting-ls-in-form-yaml]

[test: cynefin/hidden-boundaries/meeting-ps-in-form-directive]

[test: cynefin/hidden-boundaries/meeting-ps-in-form-yaml]

[fixture: cynefin/hidden-boundaries/meeting-empty-description-directive]

[fixture: cynefin/hidden-boundaries/meeting-empty-description-yaml]

[fixture: cynefin/hidden-boundaries/header-inline-domain-item-directive]

[fixture: cynefin/hidden-boundaries/header-inline-domain-item-yaml]

Input (escaped): `"cynefin-beta complex \"A\" %%{{x}}%%\n"`.

Output
([hidden-boundaries/header-inline-domain-item-directive-output.mmd](../tests/fixtures/cynefin/hidden-boundaries/header-inline-domain-item-directive-output.mmd)):

```mmd
cynefin-beta complex "A" %%{{x}}%%
```

[fixture: cynefin/hidden-boundaries/boundary-suffix-directive-spare]

[fixture: cynefin/hidden-boundaries/boundary-suffix-yaml-spare]

[fixture: cynefin/hidden-boundaries/boundary-suffix-directive-space]

[fixture: cynefin/hidden-boundaries/boundary-suffix-yaml-tab]

[fixture: cynefin/hidden-boundaries/boundary-before-arrow-consumed]

[fixture: cynefin/hidden-boundaries/boundary-header-inline]

[fixture: cynefin/hidden-boundaries/boundary-header-consumed]

[fixture: cynefin/hidden-boundaries/boundary-header-body-suffix]

[fixture: cynefin/hidden-boundaries/boundary-after-visible-eol]

[fixture: cynefin/hidden-boundaries/boundary-multiple-suffix]

[fixture: cynefin/hidden-boundaries/boundary-eof-padding]

[fixture: cynefin/hidden-boundaries/boundary-eof-yaml]

[fixture: cynefin/hidden-boundaries/boundary-header-yaml]

[fixture: cynefin/hidden-forms/hidden-domain-name]

[fixture: cynefin/hidden-forms/hidden-item-trailing]

Input (escaped):
`"cynefin-beta\ncomplex-->clear%%{!spare}%%\n\nchaotic \"Spare\""`.

Output
([hidden-boundaries/boundary-suffix-directive-spare-output.mmd](../tests/fixtures/cynefin/hidden-boundaries/boundary-suffix-directive-spare-output.mmd)):

```mmd
cynefin-beta
  complex --> clear%%{!spare}%%

  chaotic
    "Spare"
```

### Retained prefix

When textBeforeHeader is nonempty, use the shared keepsPrefix rule to retain the
complete prefix through the header keyword. Preserve leading LF, passed trivia,
second-scan directives and real/retained YAML order. Cleaning that prefix can
promote ignored YAML to effective frontmatter, changing the title, configuration
or acceptance in every version of mermaid.js that counts (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).

[fixture: cynefin/retained-prefix/prefix-retained-yaml]

[fixture: cynefin/retained-prefix/prefix-leading-lf]

[fixture: cynefin/retained-prefix/prefix-real-and-retained]

[fixture: cynefin/retained-prefix/prefix-secondscan]

[fixture: cynefin/retained-prefix/prefix-passed-bare-ascii]

Input (escaped):
`"%% ordinary prefix\n---\ntitle: RetainedOnly\nconfig: [\n---\ncynefin-beta\ncomplex \"PrefixItem\""`.

Output
([retained-prefix/prefix-retained-yaml-output.mmd](../tests/fixtures/cynefin/retained-prefix/prefix-retained-yaml-output.mmd)):

```mmd
%% ordinary prefix
---
title: RetainedOnly
config: [
---
cynefin-beta
  complex
    "PrefixItem"
```

### Global directives

Keep Root directive source and order. Within a printed line, place a directive
as under [Directives](./flowchart.md#directives). When formatting splits units
that were on the same line, a directive in their gap moves with the following
unit: its right boundary stays touching or separated, while its left contact is
broken. Ordinary standalone lines align with their body, including item depth
between items. Ordinary standalone directives stand at the depth of their
surrounding body, including the additional body level between domain items.
Multiline interiors and unfinished EOF endings remain written. Reordering
directives or editing their JSON can change the text that common removal joins;
native hidden directives remain separate forms.

[fixture: cynefin/global-directives/header-to-body]

[fixture: cynefin/global-directives/global-component-gaps]

[fixture: cynefin/global-directives/global-separated-components]

[fixture: cynefin/global-directives/global-title-separator]

[fixture: cynefin/global-directives/global-native-fences]

[fixture: cynefin/global-directives/global-standalone]

[fixture: cynefin/global-directives/global-multiline]

[fixture: cynefin/global-directives/global-eof-free-text]

[fixture: cynefin/global-directives/between-items-contact]

Input (escaped):
`"cynefin-beta\ncomplex%%{wrap}%%-->%%{wrap}%%clear%%{wrap}%%:%%{wrap}%%'GlobalLabel'"`.

Output
([global-directives/global-component-gaps-output.mmd](../tests/fixtures/cynefin/global-directives/global-component-gaps-output.mmd)):

```mmd
cynefin-beta
  complex %%{wrap}%%--> %%{wrap}%%clear %%{wrap}%%: %%{wrap}%%"GlobalLabel"
```

### Comments

Align ordinary standalone comments with their body, item comments at item depth
and prefix comments at column one. Inline comments keep their line, and a run of
spaces and tabs before one becomes one space.
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives one space
before a comment that stands after something on its line, as Prettier prints
`x = 1;   // c` as `x = 1; // c`.

A comment that touches what precedes it stays touching. Keep marks, contents and
trailing padding. Native comments end at CR/LF, with LS/PS as content. Shared
comment-region joins retain interior columns, aligning only the first printed
line; moving them can change ownership.

[fixture: cynefin/comments/comment-prefix]

[fixture: cynefin/comments/comment-domain-header]

[fixture: cynefin/comments/comment-touching-item]

[fixture: cynefin/comments/comment-separated-item] [fixture:
cynefin/comments/inline-gap-run-before-comment]

[fixture: cynefin/comments/comment-standalone-body]

[fixture: cynefin/comments/comment-bare-triple]

[fixture: cynefin/comments/comment-inside-string]

[test: cynefin/comments/comment-unicode-join]

[test: cynefin/comments/comment-ls-native-content]

Input (escaped): `"%% PrefixComment\ncynefin-beta\nclear \"Commented\""`.

Output
([comments/comment-prefix-output.mmd](../tests/fixtures/cynefin/comments/comment-prefix-output.mmd)):

```mmd
%% PrefixComment
cynefin-beta
  clear
    "Commented"
```

### Blank lines

Keep at most one ordinary ASCII blank line between statements, items or trivia,
and remove document/body edge blanks. Whitespace-only lines become empty. This
avoids excess space. Prettier collapses ordinary blank-line runs to one empty
line and removes blank lines at block and text edges.
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives the same form
to ordinary blank lines between statements, items or trivia and at document/body
edges. Values, descriptions, hidden/directive interiors, retained prefixes,
joining regions, semicolon protection and required hidden LF keep their own
rules.

[fixture: cynefin/blank-lines/blanks-between-items]

[fixture: cynefin/blank-lines/blanks-between-statements]

[fixture: cynefin/blank-lines/blanks-around-trivia]

[fixture: cynefin/blank-lines/blanks-hidden-excess]

Input (escaped):
`"cynefin-beta\n\ncomplex \"BlankStart\"\n\n \t\n\n\"BlankEnd\"\n\n\n"`.

Output
([blank-lines/blanks-between-items-output.mmd](../tests/fixtures/cynefin/blank-lines/blanks-between-items-output.mmd)):

```mmd
cynefin-beta
  complex
    "BlankStart"

    "BlankEnd"
```

### Trailing whitespace

Remove harmless exterior ASCII padding after the header, domain words, completed
items/transitions and description closers. Prettier leaves no spaces or tabs at
ordinary line ends, so
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) removes harmless
exterior spaces and tabs after completed structural units. Preserve value
continuations, comments, directive/hidden interiors, required closer padding and
protected text. Decide by owner: trimming every physical line can change values
or cause rejection. The spaces and tabs at the end of a line inside a multiline
quoted item are part of the label that mermaid.js keeps in the Db, and a change
of them is no kind of change of the Db that formatting may make (see
[The check, and formatting that changes the Db](./printed-form.md#the-check-and-formatting-that-changes-the-db)).

[fixture: cynefin/trailing-whitespace/trailing-structure]

[fixture: cynefin/trailing-whitespace/trailing-string-value]

[fixture: cynefin/trailing-whitespace/trailing-comment]

[fixture: cynefin/trailing-whitespace/trailing-hidden-opener]

Input (escaped):
`"cynefin-beta \t\ncomplex \t\n\"StructuralTail\" \t\nclear-->chaotic \t\naccDescr {Done} \t"`.

Output
([trailing-whitespace/trailing-structure-output.mmd](../tests/fixtures/cynefin/trailing-whitespace/trailing-structure-output.mmd)):

```mmd
cynefin-beta
  complex
    "StructuralTail"
  clear --> chaotic
  accDescr: Done
```

### Semicolons

Keep every authored semicolon. A segment that holds a kept `;` is formatted as
anywhere else, except where formatting could change which `;` the line rule
ignores. The rule reads a segment from the first `:` after `style` or `classDef`
to the last `#` before its last kept `;`, with no whitespace between the `:` and
the `#` (see [Semicolons](./flowchart.md#semicolons)), so the gaps and the
padding inside that stretch keep whether they hold whitespace, a run becoming
one space, and the rest of the segment follows the ordinary rules of this
diagram. Text that no part of the layout holds stays as written. A statement
over several lines whose lines, joined with one space or with nothing, could
change which `;` the line rule ignores keeps the text of each segment, up to its
last kept `;`, as written; any other statement over several lines is formatted
like one on a single line.

[fixture: semicolons/stretch-kept-rest-formatted] [fixture:
semicolons/no-stretch-formatted] [fixture: semicolons/semi-line-other-value]

The first protected line uses its body depth, including item depth; content and
later columns remain written. Count segments as Mermaid reads them, including
directives and comment-region joins. Cynefin has no grammatical semicolon, so
verbatimStyleLines is false: ordinary style/classDef word lines still format.
Deleting semicolons or relocating their triggers can change the Db or
acceptance.

[fixture: cynefin/hidden-boundaries/semicolon-hidden-header-directive]

[fixture: cynefin/hidden-boundaries/semicolon-hidden-body-directive]

[fixture: cynefin/hidden-boundaries/semicolon-hidden-header-yaml]

[fixture: cynefin/hidden-boundaries/semicolon-hidden-body-yaml]

[fixture: cynefin/hidden-boundaries/semicolon-hidden-without-hidden]

[fixture: cynefin/hidden-boundaries/header-inline-domain-item-directive]

[fixture: cynefin/semicolons/semi-selected-outside-string]

[fixture: cynefin/semicolons/semi-selected-before-arrow]

[fixture: cynefin/semicolons/semi-selected-string]

[fixture: cynefin/semicolons/semi-classdef]

[fixture: cynefin/semicolons/semi-nontrigger]

[fixture: cynefin/semicolons/semi-two-passes]

[fixture: cynefin/semicolons/semi-entity]

[fixture: cynefin/semicolons/semi-directive-rejoined]

[fixture: cynefin/semicolons/semi-plain-style-line-formats]

[fixture: cynefin/semicolons/semi-style-label-line-formats]

[fixture: cynefin/semicolons/semi-hidden-fence-cut]

[fixture: cynefin/semicolons/semi-line-other-value]

[fixture: cynefin/semicolons/semi-multiline-global-word]

[test: cynefin/semicolons/semi-ls-segment-owned]

[test: cynefin/semicolons/semi-ps-segment-owned]

[fixture: cynefin/semicolons/semi-item-body-indentation]

[fixture: cynefin/semicolons/last-item-protected]

[fixture: cynefin/semicolons/cross-domain-suffix]

Input (escaped): `"cynefin-beta\ncomplex \"style:#fixed\";\"SuffixItem\""`.

Output
([semicolons/semi-selected-outside-string-output.mmd](../tests/fixtures/cynefin/semicolons/semi-selected-outside-string-output.mmd)):

```mmd
cynefin-beta
  complex "style:#fixed"; "SuffixItem"
```

[fixture: cynefin/semicolons/review-semicolon-following-pair]

[fixture: cynefin/semicolons/review-semicolon-following-pair-next-line]

[fixture: cynefin/semicolons/review-style-selected-inside-string]

[fixture: cynefin/semicolons/review-semicolon-intervening-item]

[fixture: cynefin/semicolons/review-selected-after-string]

[fixture: cynefin/semicolons/review-semicolon-two-domains]

[fixture: cynefin/semicolons/cynefin-item-line-protected-next-domain]

[fixture: cynefin/semicolons/cynefin-domain-end-before-transition]

Input (escaped): `"cynefin-beta\ncomplex \"a;\" clear \"b\" \"c\""`.

Output
([semicolons/review-semicolon-following-pair-output.mmd](../tests/fixtures/cynefin/semicolons/review-semicolon-following-pair-output.mmd)):

```mmd
cynefin-beta
  complex "a;" clear "b" "c"
```

A `;` that the line rule ignores between two statements stands against the token
before it with one space after it, whatever whitespace was written around it, as
the gap has one space; the gap right after the keyword keeps its whitespace as
written. After `%%{%%{wrap}%%init: {"label":"style:#x"}}%%`,
`cynefin-beta ;complex "A"` keeps its space, since some of the versions of
mermaid.js that count reject `cynefin-beta;complex "A"` (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).

[fixture: semicolons/ignored-semicolon-space-before-attached] [fixture:
semicolons/ignored-semicolon-space-both-attached] [fixture:
semicolons/ignored-semicolon-space-after-kept] [fixture:
semicolons/ignored-semicolon-after-header-keyword-kept] [fixture:
semicolons/semi-selected-outside-string] [corpus fixture:
cynefin/semicolon-chaotic-parts]

### Multiline values

Do not wrap at printWidth, as a flowchart does not:
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have) gives
the form that [Line wrapping](./flowchart.md#line-wrapping) decides under
[rule 4](./printed-form.md#4-where-none-of-these-rules-gives-a-form). Apart from
domain/item splitting, retain physical string and transition-label contents,
continuation columns and interior blanks. Description bodies use the shared
indentation above. Reflow or reindentation can change the Db, and wrapping
transition components can reject. A separate description closer uses the shared
alignment rule.

[fixture: cynefin/multiline-values/long-line-unwrapped]

[fixture: cynefin/multiline-values/multiline-string-columns]

[fixture: cynefin/multiline-values/multiline-label-columns]

Input (escaped):
`"cynefin-beta\ncomplex-->clear:\"A deliberately long transition label that stays on its authored physical line\""`.

Options: `{"printWidth": 20}`.

Output
([multiline-values/long-line-unwrapped-output.mmd](../tests/fixtures/cynefin/multiline-values/long-line-unwrapped-output.mmd)):

```mmd
cynefin-beta
  complex --> clear : "A deliberately long transition label that stays on its authored physical line"
```

### Frontmatter yaml

Use shared guarded YAML formatting only for safe real frontmatter, choosing the
Db-equal YAML that Prettier prints. Keep malformed YAML, indented fences,
delimiter padding, HTML hazards and bodies whose formatting could create a fence
under the shared guards. YAML nesting/block scalars use a positive minimum at
tabWidth zero. Retained/native YAML remains source text; preserve the empty
title reset to the frontmatter fallback.

[fixture: cynefin/frontmatter-yaml/frontmatter-safe-yaml]

[fixture: cynefin/frontmatter-yaml/frontmatter-indented-fence]

[fixture: cynefin/frontmatter-yaml/frontmatter-delimiter-padding]

[fixture: cynefin/frontmatter-yaml/frontmatter-html-guard]

[fixture: cynefin/frontmatter-yaml/frontmatter-zero-positive-indent]

[fixture: cynefin/frontmatter-yaml/frontmatter-title-reset]

[fixture: cynefin/frontmatter-yaml/frontmatter-opaque-invalid-config]

[corpus fixture: cynefin/config-fontfamily-keeps-title]

[corpus fixture: cynefin/div-invalid-keeps-config]

[fixture: cynefin/frontmatter-yaml/frontmatter-fence-guard]

[test: cynefin/specified-readings/divergence-opaque-yaml]

Input (escaped):
`"---\ntitle: 'SafeYaml'\nconfig: {cynefin: {width: 1000}}\n---\ncynefin-beta\nclear \"YamlBody\""`.

Output
([frontmatter-yaml/frontmatter-safe-yaml-output.mmd](../tests/fixtures/cynefin/frontmatter-yaml/frontmatter-safe-yaml-output.mmd)):

```mmd
---
title: "SafeYaml"
config: { cynefin: { width: 1000 } }
---
cynefin-beta
  clear
    "YamlBody"
```

### Line terminators and unicode

Use the shared host policy: read CR/CRLF as LF and print the configured LF, CRLF
or CR, including within values and hidden forms. LS/PS/NBSP/BOM retain their
lexical roles except shared common-value edge trimming and plain
description-opener whitespace. Generalizing them to padding can change values or
repair rejected input. Prettier removes/restores a leading BOM; original
frontmatter status and byte identity are not guaranteed.

[test: cynefin/line-terminators-and-unicode/eol-bare-cr]

[test: cynefin/line-terminators-and-unicode/eol-crlf-string]

[test: cynefin/line-terminators-and-unicode/eol-output-crlf-hidden]

[test: cynefin/line-terminators-and-unicode/eol-output-cr]

[test: cynefin/line-terminators-and-unicode/unicode-string-owned]

[test: cynefin/line-terminators-and-unicode/unicode-common-edge]

[test: cynefin/line-terminators-and-unicode/unicode-block-opener]

[test: cynefin/line-terminators-and-unicode/bom-leading-host]

[corpus fixture: cynefin/line-ls-gap]

[corpus fixture: cynefin/space-nbsp-body]

### Source order

Keep every domain, item, transition, common assignment and body hidden
occurrence in source order. Empty common assignments remain resets. Sorting or
rebuilding from effective values can change the reading, including transition
order and empty resets.

[fixture: cynefin/source-order/source-interleaving]

[fixture: cynefin/source-order/source-common-empty-resets]

Input (escaped):
`"cynefin-beta\nclear \"EarlyClear\"\ntitle EarlyTitle\ncomplex-->clear:'EarlyMove'\ncomplex \"LaterComplex\"\naccTitle: Accessible\nclear \"FinalClear\"\ntitle FinalTitle"`.

Output
([source-order/source-interleaving-output.mmd](../tests/fixtures/cynefin/source-order/source-interleaving-output.mmd)):

```mmd
cynefin-beta
  clear
    "EarlyClear"
  title EarlyTitle
  complex --> clear : "EarlyMove"
  complex
    "LaterComplex"
  accTitle: Accessible
  clear
    "FinalClear"
  title FinalTitle
```

### Final newline

End ordinary accepted files with one configured newline, including empty
domains, final comments and closed hidden forms. Remove ordinary terminal blanks
for a consistent file ending. Prettier ends ordinary text with one line break
and no terminal blank line, so
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives ordinary
accepted files the same ending. Unfinished global directives, retained-prefix
boundaries, required hidden padding and protected endings take precedence.

[fixture: cynefin/final-newline/final-newline-domain]

[fixture: cynefin/final-newline/final-newline-empty-domain]

[fixture: cynefin/final-newline/final-newline-comment]

[fixture: cynefin/final-newline/final-newline-closed-hidden]

[fixture: cynefin/final-newline/final-newline-trailing-blanks]

[corpus fixture: cynefin/header-only]

[corpus fixture: cynefin/header-colon]

Input (escaped): `"cynefin-beta\ncomplex \"FinalItem\""`.

Output
([final-newline/final-newline-domain-output.mmd](../tests/fixtures/cynefin/final-newline/final-newline-domain-output.mmd)):

```mmd
cynefin-beta
  complex
    "FinalItem"
```

### Specified readings

Follow the six existing divergences: directive-as-token-boundary,
ignored-semicolon-as-token-boundary, html-tag-in-frontmatter,
embedded-data-opaque, bare-percent-line-before-header and c4-keyword-anywhere.
Cynefin adds no acceptance-setting key or divergence. Raw rejection supplies no
raw Db; use available specified readings and embedded effects. Standalone parse
failures report syntax errors without output; Markdown declines embedding,
leaving rejected payloads to the host.

[test: cynefin/specified-readings/divergence-opaque-yaml]

[test: cynefin/specified-readings/divergence-c4-string]

[test: cynefin/specified-readings/divergence-html-cross]

[test: cynefin/specified-readings/divergence-bare-unicode]

[corpus fixture: cynefin/directive-arrow-inside]

[corpus fixture: cynefin/semicolon-arrow-inside]

[corpus fixture: cynefin/gram-domain-braces]

### Markdown fences

Apply these rules to dedented payloads through the shared Markdown connection.
The host supplies fence/list/quote indentation and trims final code-line
padding. Required internal hidden padding remains protected; standalone
formatting keeps final hidden padding even when the host trims it. Test actual
host output and three-pass idempotence separately from standalone payload Db
equality.

[test: cynefin Markdown: top-level]

[test: cynefin Markdown: list]

[test: cynefin Markdown: quote]

[test: cynefin Markdown: zero]

[test: cynefin Markdown: tabs]

[test: cynefin Markdown: hidden-boundary]

[test: cynefin Markdown: header-hidden]

[test: cynefin Markdown: prefix]

[test: cynefin Markdown: frontmatter]

[test: cynefin Markdown: final-hidden-padding]

[test: cynefin Markdown: rejected]

Input:

````markdown
```mermaid
cynefin-beta:complex"FencedAlpha"'FencedBeta'
```
````

Output:

````markdown
```mermaid
cynefin-beta
  complex
    "FencedAlpha"
    "FencedBeta"
```
````
