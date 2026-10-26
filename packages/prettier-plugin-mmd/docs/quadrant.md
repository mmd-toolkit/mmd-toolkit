# Quadrant chart formatting rules

Japanese version: [quadrant.ja.md](./quadrant.ja.md)

How prettier-plugin-mmd formats a quadrant chart. Each rule below keeps what
mermaid.js reads from the diagram; where a change would alter it, the text is
kept as written, and the rule says where. A quadrant chart is a header followed
by statements. Unlike in an XY chart, the whitespace between the words of a text
without quotes is in the Db, so the texts are printed as written, and the rules
choose the form of what lies around them: the indentation, the keywords, the
arrow, the brackets, and the commas.

Each rule below shows its formatting with examples: the text before formatting,
and the text that the plugin prints. The examples are the fixtures that the
tests check, and the link above each one is to its file. How the fixtures are
organized and checked is described in
[Documents and fixtures](./development.md#documents-and-fixtures).

## Rules

### Indentation

The statements after the header, and the comment lines among them, stand one
level deeper than the header. A level is what Prettier's `useTabs` and
`tabWidth` options say: two spaces by default. The indentation written in the
input is not kept: whitespace at the start of a line is nothing to mermaid.js,
so the printer chooses it from the structure alone, and every text has one form.
Nothing in the grammar forbids indenting a statement, and the documentation of
mermaid.js writes the statements one level deeper than the header, as the other
diagrams do (see [Indentation](./flowchart.md#indentation) in the flowchart
rules). The header, and a comment line before it, stand at the first column.
[fixture: indentation/statements-one-level-deeper] [fixture:
indentation/written-indentation-dropped] [fixture:
indentation/header-leading-whitespace] [fixture: indentation/tab-width-4]
[fixture: indentation/use-tabs] [fixture:
indentation/comment-lines-at-the-level-of-the-next-statement] [fixture:
indentation/comment-before-the-header-at-the-first-column] [fixture:
indentation/description-block-lines-kept]

Input
([indentation/statements-one-level-deeper-input.mmd](../tests/fixtures/quadrant/indentation/statements-one-level-deeper-input.mmd)):

```mmd
quadrantChart
title T
   x-axis L --> R
  quadrant-1 A
A: [0.3, 0.6]
classDef c1 color: #f00
```

Output
([indentation/statements-one-level-deeper-output.mmd](../tests/fixtures/quadrant/indentation/statements-one-level-deeper-output.mmd)):

```mmd
quadrantChart
  title T
  x-axis L --> R
  quadrant-1 A
  A: [0.3, 0.6]
  classDef c1 color: #f00
```

### Statements one per line

Each statement stands on a line of its own. mermaid.js rejects two statements on
one line unless a `;` separates them, but the header may be followed on its line
by a statement, and a statement may be followed by an empty description block,
so these go to lines of their own, because a line of two statements is harder to
read, as in the other diagrams (see
[Statements one per line](./flowchart.md#statements-one-per-line)). A `;` ends a
statement as a line feed does and separates nothing once the statements are on
lines of their own, so it is dropped, also where it stands first, twice in a
row, or last. [fixture: statements-one-per-line/header-then-axis] [fixture:
statements-one-per-line/header-then-title] [fixture:
statements-one-per-line/header-then-point] [fixture:
statements-one-per-line/header-glued-point] [fixture:
statements-one-per-line/semicolon-between-statements-dropped] [fixture:
statements-one-per-line/semicolons-at-the-start-twice-and-at-the-end-dropped]
[fixture: statements-one-per-line/semicolon-after-the-header-dropped] [fixture:
statements-one-per-line/semicolon-line-alone-dropped] [fixture:
statements-one-per-line/description-block-then-statement] [fixture:
statements-one-per-line/empty-description-block-then-axis] [fixture:
statements-one-per-line/point-then-empty-description-block] [fixture:
statements-one-per-line/text-then-empty-description-block] [fixture:
statements-one-per-line/empty-description-block-after-the-header] [fixture:
directives/directive-after-the-header-then-statement] [fixture:
directives/directive-between-two-statements-moves-with-the-next]

A `;` inside a title, an accessibility text, or a description block is a
character of the text, and stays: `title T; quadrant-1 A` is one title. An empty
description block that stands in a title, as in `title T accDescr {}`, is part
of the title, and stays with it. [fixture:
statements-one-per-line/semicolon-in-a-title-is-text] [fixture:
statements-one-per-line/semicolon-in-an-accessibility-text-is-text] [fixture:
statements-one-per-line/empty-description-block-in-a-title-stays]

A statement is not moved when a `;` of its line is read by the line rule of
mermaid.js: it removes the last `;` of a line that holds `style` or `classDef`,
a later `:`, a `#` after that with no whitespace between them, and a later `;`.
Moving a statement away from such a line, or dropping a `;` from it, changes
which `;` is the last, and with it the text (`x-axis style; title a:#b;c` has
another title once its statements are on lines of their own). The statements of
such a line stay on it, with the whitespace between them formatted as anywhere
else, except the whitespace between a `:` and a later `#`, which keeps whether
it is there (see [Semicolons](./flowchart.md#semicolons)), and the `;` stays as
written (see [A line that a `;` ends](./compatibility.md#a-line-that-a--ends)).
When such a line is the line of the header, the statements stay on the header's
line. A `;` that the rule ignores at the end of the line is dropped, and the
line that is printed has no `;` for the rule to read, so its whitespace is
formatted as anywhere else. [fixture:
statements-one-per-line/line-rule-line-with-a-dropped-semicolon-formats-the-gap]
[fixture: statements-one-per-line/line-rule-line-kept-together] [fixture:
statements-one-per-line/line-rule-line-after-the-header-kept-together] [fixture:
statements-one-per-line/classdef-semicolon-ignored-by-the-line-rule-dropped]

Input
([statements-one-per-line/header-then-axis-input.mmd](../tests/fixtures/quadrant/statements-one-per-line/header-then-axis-input.mmd)):

```mmd
quadrantChart x-axis L --> R
quadrant-1 A
```

Output
([statements-one-per-line/header-then-axis-output.mmd](../tests/fixtures/quadrant/statements-one-per-line/header-then-axis-output.mmd)):

```mmd
quadrantChart
  x-axis L --> R
  quadrant-1 A
```

Input
([statements-one-per-line/semicolon-between-statements-dropped-input.mmd](../tests/fixtures/quadrant/statements-one-per-line/semicolon-between-statements-dropped-input.mmd)):

```mmd
quadrantChart
x-axis L; quadrant-1 A
A: [0.3, 0.6]; B: [0.1, 0.2]
```

Output
([statements-one-per-line/semicolon-between-statements-dropped-output.mmd](../tests/fixtures/quadrant/statements-one-per-line/semicolon-between-statements-dropped-output.mmd)):

```mmd
quadrantChart
  x-axis L
  quadrant-1 A
  A: [0.3, 0.6]
  B: [0.1, 0.2]
```

Input
([statements-one-per-line/line-rule-line-kept-together-input.mmd](../tests/fixtures/quadrant/statements-one-per-line/line-rule-line-kept-together-input.mmd)):

```mmd
quadrantChart
x-axis style; title a:#b;c
```

Output
([statements-one-per-line/line-rule-line-kept-together-output.mmd](../tests/fixtures/quadrant/statements-one-per-line/line-rule-line-kept-together-output.mmd)):

```mmd
quadrantChart
  x-axis style; title a:#b;c
```

### Blank lines

A run of empty lines becomes one empty line, and there is none between the
header and the first statement, and none at the end of the text. A blank line is
a choice of the author that the Db does not hold, and one empty line shows it at
the least cost, as Prettier does in code (see
[Blank lines](./flowchart.md#blank-lines)). [fixture:
blank-lines/runs-become-one] [fixture: blank-lines/none-after-the-header]
[fixture: blank-lines/none-at-the-end] [fixture:
blank-lines/around-comment-lines] [fixture: blank-lines/whitespace-only-lines]

Input
([blank-lines/runs-become-one-input.mmd](../tests/fixtures/quadrant/blank-lines/runs-become-one-input.mmd)):

```mmd
quadrantChart
title T



quadrant-1 A
```

Output
([blank-lines/runs-become-one-output.mmd](../tests/fixtures/quadrant/blank-lines/runs-become-one-output.mmd)):

```mmd
quadrantChart
  title T

  quadrant-1 A
```

### Header

The header `quadrantChart` is printed as written; mermaid.js detects it in
exactly this case, so the printer has nothing to choose. The whitespace before
it and after it is dropped, and a statement after it on its line goes to a line
of its own (see [Statements one per line](#statements-one-per-line)). [fixture:
header/header-only] [fixture: header/trailing-whitespace-dropped] [fixture:
header/comment-after-the-header] [fixture: header/comment-glued-to-the-header]
[fixture: header/directive-after-the-header] [fixture:
header/directive-glued-to-the-header]

Input
([header/comment-after-the-header-input.mmd](../tests/fixtures/quadrant/header/comment-after-the-header-input.mmd)):

```mmd
quadrantChart %% c
title T
```

Output
([header/comment-after-the-header-output.mmd](../tests/fixtures/quadrant/header/comment-after-the-header-output.mmd)):

```mmd
quadrantChart %% c
  title T
```

### Keywords and texts

The keyword of a statement and its text are separated by one space; a run of
whitespace becomes one space. Whitespace between them is not in the Db:
`x-axisL --> R` and `x-axis L --> R` are the same axis, and `quadrant-10 A` is
the quadrant 1 with the text `0 A`, the same as `quadrant-1 0 A`. A keyword and
a text that touch keep touching, as tokens that touch do in the other diagrams.
Writing a space between them would be a change that the author cannot see in the
Db, and a form like `quadrant-10 A`, which mermaid.js reads as another quadrant
than the author may have meant, is for a lint rule to report, not for the
formatter to rewrite. [fixture: keywords-and-texts/title-spaces] [fixture:
keywords-and-texts/title-tab] [fixture: keywords-and-texts/axis-keyword-spaces]
[fixture: keywords-and-texts/quadrant-keyword-spaces] [fixture:
keywords-and-texts/keyword-touching-kept] [fixture:
keywords-and-texts/quadrant-ten-kept] [fixture:
keywords-and-texts/word-after-title-keyword-is-a-point-name] [fixture:
keywords-and-texts/inner-whitespace-of-a-title-kept]

The whitespace inside a text is in the Db and stays as written:
`quadrant-1 a    b` has the text `a    b`, a tab between two words is a tab in
the text, and so is a form feed. The whitespace at the ends of a text is
dropped, since the Db drops it. A string and the words after it keep the
whitespace between them, as `"a" b` is the text `a b` and `"a"b` the text `ab`.
[fixture: keywords-and-texts/inner-whitespace-kept] [fixture:
keywords-and-texts/whitespace-at-the-ends-dropped] [fixture:
keywords-and-texts/string-then-text-whitespace-kept] [fixture:
keywords-and-texts/inner-whitespace-of-a-title-kept]

Input
([keywords-and-texts/title-spaces-input.mmd](../tests/fixtures/quadrant/keywords-and-texts/title-spaces-input.mmd)):

```mmd
quadrantChart
title    T
```

Output
([keywords-and-texts/title-spaces-output.mmd](../tests/fixtures/quadrant/keywords-and-texts/title-spaces-output.mmd)):

```mmd
quadrantChart
  title T
```

Input
([keywords-and-texts/keyword-touching-kept-input.mmd](../tests/fixtures/quadrant/keywords-and-texts/keyword-touching-kept-input.mmd)):

```mmd
quadrantChart
x-axisL --> R
quadrant-3C
title-x
```

Output
([keywords-and-texts/keyword-touching-kept-output.mmd](../tests/fixtures/quadrant/keywords-and-texts/keyword-touching-kept-output.mmd)):

```mmd
quadrantChart
  x-axisL --> R
  quadrant-3C
  title-x
```

### Axes

The arrow of an axis has one space before it and one after it:
`x-axis Low Reach --> High Reach`, also where it was written touching
(`Low Reach-->High Reach`) or with more whitespace. mermaid.js reads the arrow
the same with or without the whitespace around it, so the form is a choice: one
space is the form that its documentation uses, and it shows where the first text
ends, which the whitespace inside the texts (see
[Keywords and texts](#keywords-and-texts)) would otherwise hide. The length of
the arrow is not in the Db, but it is what the author wrote, so `--->` stays.
[fixture: axes/arrow-touching] [fixture: axes/arrow-with-more-whitespace]
[fixture: axes/arrow-touching-on-one-side] [fixture: axes/arrow-length-kept]
[fixture: axes/text-inner-whitespace-kept] [fixture: axes/strings] [fixture:
axes/markdown-string] [fixture: axes/axis-only-one-text]

An axis with the arrow and no second text, as in `x-axis L -->`, is printed with
the arrow, after one space: mermaid.js reads it as another axis than `x-axis L`
(the text of the left end is `L` and the arrow character), so the arrow is not
dropped. [fixture: axes/arrow-only]

Input
([axes/arrow-touching-input.mmd](../tests/fixtures/quadrant/axes/arrow-touching-input.mmd)):

```mmd
quadrantChart
x-axis Low Reach-->High Reach
y-axis B-->T
```

Output
([axes/arrow-touching-output.mmd](../tests/fixtures/quadrant/axes/arrow-touching-output.mmd)):

```mmd
quadrantChart
  x-axis Low Reach --> High Reach
  y-axis B --> T
```

Input
([axes/arrow-only-input.mmd](../tests/fixtures/quadrant/axes/arrow-only-input.mmd)):

```mmd
quadrantChart
x-axis L-->
y-axis B   -->
```

Output
([axes/arrow-only-output.mmd](../tests/fixtures/quadrant/axes/arrow-only-output.mmd)):

```mmd
quadrantChart
  x-axis L -->
  y-axis B -->
```

### Points

A point is printed as `Name: [x, y]`: the `:` touches the name, the `[` has one
space before it, there is no space after the `[` or before the `]`, and the
comma has no space before it and one after it. A class name after `:::` touches
the name and the `:` touches the class name (`A:::c1: [0.3, 0.6]`), whatever
whitespace was written around them. None of this whitespace is in the Db; the
name before the `:` and the coordinates are texts, which are kept as written
(`0.30` is not `0.3`), but the whitespace at their ends is dropped, as the Db
drops it. The form is the one of the documentation of mermaid.js
(`Campaign A: [0.3, 0.6]`, `Campaign B:::class1: [0.8, 0.1]`). [fixture:
points/colon-touches-the-name] [fixture: points/spaces-inside-the-brackets]
[fixture: points/name-whitespace-at-the-ends-dropped] [fixture:
points/name-inner-whitespace-kept] [fixture: points/string-names] [fixture:
points/class-name] [fixture: points/coordinates-as-written] [fixture:
points/trailing-whitespace-dropped]

mermaid.js reads the line breaks inside a point as whitespace, around the `:`,
after the `[`, around the comma, and before the `]`, and before the `:` when a
whitespace character comes first. A point written over several lines is printed
on one line, where the line break is whitespace to the lexer, so that each
statement is on one line; a point with a comment line or a directive in it is
kept as written, as in the other diagrams (see
[Multi-line statements](#multi-line-statements)). [fixture:
points/line-breaks-joined] [fixture: points/line-break-with-a-comment-line-kept]
[fixture: points/line-break-with-a-directive-kept] [fixture:
multi-line-statements/point-over-lines-joined] [fixture:
multi-line-statements/name-then-colon-on-the-next-line-joined]

Input
([points/colon-touches-the-name-input.mmd](../tests/fixtures/quadrant/points/colon-touches-the-name-input.mmd)):

```mmd
quadrantChart
Campaign A:[0.3,0.6]
B : [ 0.1 , 0.2 ]
```

Output
([points/colon-touches-the-name-output.mmd](../tests/fixtures/quadrant/points/colon-touches-the-name-output.mmd)):

```mmd
quadrantChart
  Campaign A: [0.3, 0.6]
  B: [0.1, 0.2]
```

Input
([points/class-name-input.mmd](../tests/fixtures/quadrant/points/class-name-input.mmd)):

```mmd
quadrantChart
A :::c1 : [0.3, 0.6]
B:::c2:[0.1,0.2]
C:::C3: [0.1, 0.1]
```

Output
([points/class-name-output.mmd](../tests/fixtures/quadrant/points/class-name-output.mmd)):

```mmd
quadrantChart
  A:::c1: [0.3, 0.6]
  B:::c2: [0.1, 0.2]
  C:::C3: [0.1, 0.1]
```

### Styles

The styles of a point stand after its `]`, after one space, also where they were
written touching (`]radius:9`) or after more whitespace. The styles are
separated by a comma with no space before it and one after it
(`radius: 9, color: #f00`), and the whitespace at the ends of the last one is
dropped. The text of a style is printed as written, with the whitespace inside
it, such as `radius :  10`: the Db reads the name and the value of a style
without that whitespace, so the form is a choice, and the printer keeps what the
author wrote there, as the documentation of mermaid.js itself has `radius : 10`
and `radius: 10`. The tree keeps a style as one text, which the printer does not
take apart. [fixture: styles/styles-after-one-space] [fixture:
styles/comma-after-one-space] [fixture: styles/style-text-as-written]

`classDef` is followed by one space, the name of the class, one space, and the
styles, which are laid out as those of a point. The grammar counts one
whitespace character after the keyword and one after the name, so one space is
the only form; the whitespace after the name belongs to the first style in the
tree, and the Db drops it, so more than one space becomes one. [fixture:
styles/class-definition] [fixture: styles/class-definition-spaces] [fixture:
styles/class-definition-tabs] [fixture:
styles/class-definition-name-with-a-dash] [fixture:
styles/class-definition-three-styles] [fixture:
styles/class-definition-keyword-case-kept] [fixture:
styles/class-definition-with-an-ignored-semicolon] [fixture:
styles/class-definition-space-before-the-comma-dropped]

Input
([styles/styles-after-one-space-input.mmd](../tests/fixtures/quadrant/styles/styles-after-one-space-input.mmd)):

```mmd
quadrantChart
A: [0.3, 0.6]radius: 9, color: #f00
B: [0.1, 0.2]     radius: 5
```

Output
([styles/styles-after-one-space-output.mmd](../tests/fixtures/quadrant/styles/styles-after-one-space-output.mmd)):

```mmd
quadrantChart
  A: [0.3, 0.6] radius: 9, color: #f00
  B: [0.1, 0.2] radius: 5
```

Input
([styles/class-definition-spaces-input.mmd](../tests/fixtures/quadrant/styles/class-definition-spaces-input.mmd)):

```mmd
quadrantChart
classDef c1    radius: 5,color: #f00
```

Output
([styles/class-definition-spaces-output.mmd](../tests/fixtures/quadrant/styles/class-definition-spaces-output.mmd)):

```mmd
quadrantChart
  classDef c1 radius: 5, color: #f00
```

### Quotes

A string and a markdown string are printed as written: their quotes, their text,
and the whitespace inside them. A quote is never added or removed. mermaid.js
reads `"L"` and `L`, and `"a b"` and `a b`, as the same text, but a string can
hold what a text without quotes cannot (`"a: b"` has a colon, which a text
without quotes is rejected for), so removing the quotes is not always possible,
and whether a text is in quotes is the author's choice. [fixture:
quotes/strings-as-written] [fixture: quotes/quotes-not-removed] [fixture:
quotes/quotes-not-added] [fixture: quotes/keywords-and-arrows-in-strings]
[fixture: quotes/markdown-strings] [fixture: quotes/string-with-a-comment-mark]

Input
([quotes/quotes-not-removed-input.mmd](../tests/fixtures/quadrant/quotes/quotes-not-removed-input.mmd)):

```mmd
quadrantChart
quadrant-1 "A"
"B": [0.3, 0.6]
```

Output
([quotes/quotes-not-removed-output.mmd](../tests/fixtures/quadrant/quotes/quotes-not-removed-output.mmd)):

```mmd
quadrantChart
  quadrant-1 "A"
  "B": [0.3, 0.6]
```

### Titles and accessibility statements

A `title` is printed as the keyword and its text, after one space, whatever
whitespace separates them (a tab too). The text is the rest of the line without
the whitespace at its ends. A `title` with no text is printed as the keyword
alone. `;`, `#`, `%%`, quotes, and keywords in a title are characters of it.
[fixture: titles-and-accessibility-statements/title-text] [fixture:
titles-and-accessibility-statements/title-without-text] [fixture:
titles-and-accessibility-statements/title-with-special-characters] [fixture:
titles-and-accessibility-statements/title-keyword-case]

The `:` of `accTitle` and `accDescr` touches the keyword and has one space after
it, as in the other diagrams (see
[Accessibility statements](./xychart.md#accessibility-statements)). The text has
no whitespace at its ends and keeps the whitespace inside it, which is in the
Db. A text written on a later line, a colon written on a later line than the
keyword, and whitespace before the colon are printed on one line: the line
breaks are whitespace to the lexer, and the text of the statement is the same.
[fixture: titles-and-accessibility-statements/colon-touches-keyword] [fixture:
titles-and-accessibility-statements/colon-without-space-after] [fixture:
titles-and-accessibility-statements/text-whitespace-dropped] [fixture:
titles-and-accessibility-statements/text-inner-whitespace-kept] [fixture:
titles-and-accessibility-statements/text-on-the-next-line-joined] [fixture:
titles-and-accessibility-statements/colon-on-the-next-line-joined] [fixture:
titles-and-accessibility-statements/text-that-looks-like-a-statement]

The lines of an `accDescr { ... }` block are kept as written by choice, not by
need: the whitespace at the start of a line is not in the Db, and the lines are
the text of the author, which the printer does not format. Its `}` stands at the
level of its statement; a text on the line of the `{` has one space inside the
braces where it was written apart, and the braces that touch their text keep
touching. A block that is not closed makes the input rejected, so it is not
printed. [fixture: titles-and-accessibility-statements/block-lines-kept]
[fixture: titles-and-accessibility-statements/block-text-on-the-opening-line]
[fixture:
titles-and-accessibility-statements/block-closing-brace-at-the-level-of-the-statement]
[fixture:
titles-and-accessibility-statements/block-comment-and-empty-lines-kept]
[fixture: titles-and-accessibility-statements/directive-around-colon-and-braces]

Input
([titles-and-accessibility-statements/colon-touches-keyword-input.mmd](../tests/fixtures/quadrant/titles-and-accessibility-statements/colon-touches-keyword-input.mmd)):

```mmd
quadrantChart
accTitle : T
accDescr  :  d
```

Output
([titles-and-accessibility-statements/colon-touches-keyword-output.mmd](../tests/fixtures/quadrant/titles-and-accessibility-statements/colon-touches-keyword-output.mmd)):

```mmd
quadrantChart
  accTitle: T
  accDescr: d
```

Input
([titles-and-accessibility-statements/text-on-the-next-line-joined-input.mmd](../tests/fixtures/quadrant/titles-and-accessibility-statements/text-on-the-next-line-joined-input.mmd)):

```mmd
quadrantChart
accTitle:
T
accDescr:

  d
```

Output
([titles-and-accessibility-statements/text-on-the-next-line-joined-output.mmd](../tests/fixtures/quadrant/titles-and-accessibility-statements/text-on-the-next-line-joined-output.mmd)):

```mmd
quadrantChart
  accTitle: T
  accDescr: d
```

Input
([titles-and-accessibility-statements/block-lines-kept-input.mmd](../tests/fixtures/quadrant/titles-and-accessibility-statements/block-lines-kept-input.mmd)):

```mmd
quadrantChart
accDescr {
   a
  b
}
```

Output
([titles-and-accessibility-statements/block-lines-kept-output.mmd](../tests/fixtures/quadrant/titles-and-accessibility-statements/block-lines-kept-output.mmd)):

```mmd
quadrantChart
  accDescr {
   a
  b
  }
```

### Empty description blocks

An empty block, which changes nothing, is a statement of its own. The
whitespace-only interior of a description block, including tabs, line breaks and
Unicode whitespace, prints `{}`: there is no text for interior whitespace to
surround. An already empty interior stays empty. A touching keyword stays
touching: `accDescr{  }` becomes `accDescr{}`. [fixture:
empty-description-blocks/empty-whitespace-interiors] [test: quadrant Unicode and
tab interiors] A block with a directive or a comment line is printed as written.
It stands on a line of its own, also after the header and after another
statement, where the grammar takes it: mermaid.js reads it as nothing wherever
it stands, and the grammar takes it where a statement starts and after the last
unit of a statement. [fixture:
empty-description-blocks/inner-whitespace-collapsed] [fixture:
empty-description-blocks/touching-kept] [fixture:
empty-description-blocks/blank-lines-inside] [fixture:
empty-description-blocks/with-directive-or-comment-line-kept] [fixture:
empty-description-blocks/between-two-statements]

Input
([empty-description-blocks/touching-kept-input.mmd](../tests/fixtures/quadrant/empty-description-blocks/touching-kept-input.mmd)):

```mmd
quadrantChart
accDescr{}
accDescr {}
accDescr{ }
```

Output
([empty-description-blocks/touching-kept-output.mmd](../tests/fixtures/quadrant/empty-description-blocks/touching-kept-output.mmd)):

```mmd
quadrantChart
  accDescr{}
  accDescr {}
  accDescr{}
```

### Multi-line statements

A statement that mermaid.js reads over several lines is printed on one line
where the line break is whitespace to the lexer: inside a point, around its `:`,
after its `[`, around its comma, and before its `]`, and after `accTitle:` and
`accDescr:`. The line break is replaced by one space, and the whitespace at the
end of the line goes with it. A line that ends in whitespace is invisible, and a
statement that goes on to the next line because of it is easy to miss, so the
printer does not keep it; the same rule joins the lines of a statement in the
other diagrams (see
[Multi-line statements](./xychart.md#multi-line-statements)). [fixture:
multi-line-statements/point-over-lines-joined] [fixture:
multi-line-statements/name-then-colon-on-the-next-line-joined] [fixture:
multi-line-statements/point-with-styles-over-lines-joined]

A statement with a comment line or a directive in it is kept as written. A
comment line takes the rest of the line it stands on, so a comment line cannot
be joined into a line; a directive would not change the Db if the lines were
joined, but the same decision is made for comment lines and directives in every
diagram, so that the printer decides it once. A `;` in the statement keeps it as
written too, because of the line rule (see
[Statements one per line](#statements-one-per-line)). [fixture:
multi-line-statements/comment-line-inside-kept] [fixture:
multi-line-statements/directive-inside-kept] [fixture:
multi-line-statements/semicolon-on-the-last-line-kept]

### Multi-line values

The lines of an `accDescr` block and the lines of a string are kept as written,
with the line breaks and the whitespace inside. The line breaks are in the Db,
and so is the whitespace of a string; the whitespace at the start of a line of a
block is not, so keeping it is a choice: the text of a value is not formatted.
[fixture: multi-line-values/string-with-line-breaks-kept] [fixture:
multi-line-values/description-block-lines-kept] [fixture:
multi-line-values/comment-line-inside-a-block-kept]

Input
([multi-line-values/string-with-line-breaks-kept-input.mmd](../tests/fixtures/quadrant/multi-line-values/string-with-line-breaks-kept-input.mmd)):

```mmd
quadrantChart
x-axis "a
   b"
quadrant-1 A
```

Output
([multi-line-values/string-with-line-breaks-kept-output.mmd](../tests/fixtures/quadrant/multi-line-values/string-with-line-breaks-kept-output.mmd)):

```mmd
quadrantChart
  x-axis "a
   b"
  quadrant-1 A
```

Input
([multi-line-values/description-block-lines-kept-input.mmd](../tests/fixtures/quadrant/multi-line-values/description-block-lines-kept-input.mmd)):

```mmd
quadrantChart
accDescr {
  a
    b
}
```

Output
([multi-line-values/description-block-lines-kept-output.mmd](../tests/fixtures/quadrant/multi-line-values/description-block-lines-kept-output.mmd)):

```mmd
quadrantChart
  accDescr {
  a
    b
  }
```

### Keyword case

The keywords `title`, `x-axis`, `y-axis`, `quadrant-1` to `quadrant-4`,
`classDef`, `accTitle`, and `accDescr` are printed in the case written.
mermaid.js reads them in any case (`Title`, `X-Axis`, `CLASSDEF`, and
`ACCTITLE:` start statements), and the Db is the same, so the case is the
author's and nothing forces one. The name of a class keeps its case. [fixture:
keyword-case/statement-keywords-kept] [fixture:
keyword-case/accessibility-keywords-kept]

Input
([keyword-case/statement-keywords-kept-input.mmd](../tests/fixtures/quadrant/keyword-case/statement-keywords-kept-input.mmd)):

```mmd
quadrantChart
Title T
X-AXIS L
Y-Axis B
Quadrant-1 A
QUADRANT-2 B
```

Output
([keyword-case/statement-keywords-kept-output.mmd](../tests/fixtures/quadrant/keyword-case/statement-keywords-kept-output.mmd)):

```mmd
quadrantChart
  Title T
  X-AXIS L
  Y-Axis B
  Quadrant-1 A
  QUADRANT-2 B
```

### Comments

A comment starts with `%%` where a unit starts and runs to the end of the line.
A comment on a line of its own stands at the level of the statement after it,
and its text and its mark are kept as written: a comment line after the last
statement stays after it, and one before the header stands at the first column.
A `%%` inside a title, an accessibility text, a description block, or a string
is a character of it, and inside the brackets of a point it makes the input
rejected. [fixture: comments/comment-line-at-the-level-of-the-next-statement]
[fixture: comments/comment-line-at-the-end] [fixture:
comments/comment-line-before-the-header] [fixture: comments/comment-line-only]
[fixture: comments/comment-mark-in-an-accessibility-text] [fixture:
comments/comment-marks-and-empty-lines] [fixture: comments/bare-percent-comment]

A comment after a statement stays on the line of the statement, with one space
before it where whitespace was written, and touching where it was not. The Db is
the same wherever the spaces stand, but mermaid.js reads a `%%` that touches a
unit of one character together with that character (the known divergence
`comment-takes-character`): `x-axis L%% c` is rejected, and `quadrant-1 a b%% c`
has the text `a`. A rule that wrote a space before every comment would change
how mermaid.js reads such an input, and leave a mistake of the author to read as
another chart without a word; the printer keeps whether the comment touches, and
a lint rule is the place to report it, as in the other diagrams (see
[Comments](./journey.md#comments)). [fixture:
comments/comment-after-a-statement-spaced] [fixture:
comments/comment-after-a-statement-touching] [fixture:
comments/comment-glued-to-a-one-character-word-kept] [fixture:
comments/comment-glued-to-a-style-kept] [fixture:
comments/comment-takes-a-character-kept] [fixture:
comments/comment-after-a-description-block]

Input
([comments/comment-line-at-the-level-of-the-next-statement-input.mmd](../tests/fixtures/quadrant/comments/comment-line-at-the-level-of-the-next-statement-input.mmd)):

```mmd
quadrantChart
      %% a
title T
%% b
quadrant-1 A
```

Output
([comments/comment-line-at-the-level-of-the-next-statement-output.mmd](../tests/fixtures/quadrant/comments/comment-line-at-the-level-of-the-next-statement-output.mmd)):

```mmd
quadrantChart
  %% a
  title T
  %% b
  quadrant-1 A
```

Input
([comments/comment-after-a-statement-spaced-input.mmd](../tests/fixtures/quadrant/comments/comment-after-a-statement-spaced-input.mmd)):

```mmd
quadrantChart
quadrant-1 ab   %% c
A: [0.3, 0.6]  %% d
```

Output
([comments/comment-after-a-statement-spaced-output.mmd](../tests/fixtures/quadrant/comments/comment-after-a-statement-spaced-output.mmd)):

```mmd
quadrantChart
  quadrant-1 ab %% c
  A: [0.3, 0.6] %% d
```

### Directives

Keep directives in their authored gaps. Within a printed line, each side keeps
whether it touches: one space where whitespace was written beside it, touching
where it was not. mermaid.js joins the text around a directive in a text, a
name, and a string, so retain touching versus separated gaps within a statement
(see [Directives](./journey.md#directives)). A directive on a line of its own
stands at the level of the statement after it, and a directive between two
statements on a line moves with the statement after it. [fixture:
directives/directive-line-at-the-level-of-the-next-statement] [fixture:
directives/directive-line-before-the-header] [fixture:
directives/directive-after-a-statement-spaced] [fixture:
directives/directive-after-a-statement-touching] [fixture:
directives/directive-between-keyword-and-text] [fixture:
directives/directive-inside-a-text] [fixture:
directives/directive-between-colon-and-bracket] [fixture:
directives/directive-inside-a-coordinate] [fixture:
directives/directive-over-several-lines] [fixture:
directives/directive-and-comment-on-a-line]

When formatting splits units that were on the same line, a directive in their
gap moves with the following unit. Keep its right-side contact or separation;
break its left contact.

[fixture:
quadrant/directives/directive-between-two-statements-moves-with-the-next]

Input
([directives/directive-line-at-the-level-of-the-next-statement-input.mmd](../tests/fixtures/quadrant/directives/directive-line-at-the-level-of-the-next-statement-input.mmd)):

```mmd
quadrantChart
    %%{init: {}}%%
title T
```

Output
([directives/directive-line-at-the-level-of-the-next-statement-output.mmd](../tests/fixtures/quadrant/directives/directive-line-at-the-level-of-the-next-statement-output.mmd)):

```mmd
quadrantChart
  %%{init: {}}%%
  title T
```

Input
([directives/directive-between-keyword-and-text-input.mmd](../tests/fixtures/quadrant/directives/directive-between-keyword-and-text-input.mmd)):

```mmd
quadrantChart
quadrant-1 %%{init: {}}%% A
x-axis%%{init: {}}%%L
```

Output
([directives/directive-between-keyword-and-text-output.mmd](../tests/fixtures/quadrant/directives/directive-between-keyword-and-text-output.mmd)):

```mmd
quadrantChart
  quadrant-1 %%{init: {}}%% A
  x-axis%%{init: {}}%%L
```

### Frontmatter YAML

The frontmatter is formatted as YAML by Prettier, as in the other diagrams (see
[Frontmatter YAML](./flowchart.md#frontmatter-yaml)); a frontmatter that is no
valid YAML stays as written. The title of the frontmatter is in the Db, and the
printer does not touch its value. [fixture: frontmatter-yaml/formatted]
[fixture: frontmatter-yaml/malformed-kept] [fixture:
frontmatter-yaml/title-and-statement] [fixture:
frontmatter-yaml/comment-after-frontmatter-before-header]

Input
([frontmatter-yaml/formatted-input.mmd](../tests/fixtures/quadrant/frontmatter-yaml/formatted-input.mmd)):

```mmd
---
title:   T
config:
    quadrantChart:
        chartWidth:  400
---
quadrantChart
title X
```

Output
([frontmatter-yaml/formatted-output.mmd](../tests/fixtures/quadrant/frontmatter-yaml/formatted-output.mmd)):

```mmd
---
title: T
config:
  quadrantChart:
    chartWidth: 400
---
quadrantChart
  title X
```

### Line separators

U+2028 and U+2029 are characters of a word in this diagram type, and so is
U+00A0: they stand inside a text, a name, a title, an accessibility text, and
the name of a class. A text and a name keep them at their ends too, where the Db
trims them, since they are part of the written text; a title, an accessibility
text, and the text of a description block leave them out at their ends, as their
values do, and the printer drops them there. A gap that holds one is printed as
written, and so is the text that holds one. [test: U+2028 between the words of a
text] [test: U+2029 between the words of a text] [test: U+2028 at the end of a
text] [test: U+2028 between a statement and the next] [test: U+2028 between the
words of a title] [test: U+2028 after a title keyword] [test: U+2028 at the end
of a title] [test: U+2028 in the name of a point] [test: U+2028 in an
accessibility text] [test: U+2028 in a string] [test: U+2028 around the arrow of
an axis] [test: U+2028 in the name of a class]

### Whitespace characters

A space, a tab, a vertical tab, and a form feed are whitespace between units.
Where the printer chooses the whitespace, a run of them becomes one space, as a
run of spaces does, and at the start or the end of a line they are dropped.
Inside a text, a string, and an accessibility text they are characters and stay.
U+00A0, U+3000, and U+FEFF are characters of a word and stay in a text, a name,
and the name of a class; but around the `:`, the brackets, and the comma of a
point, and around the colon and the brace of an accessibility statement,
mermaid.js reads them as whitespace, and a space is printed in their place.
After the `]` of a point they are not accepted (see
[Line separators](#line-separators)). [test: U+00A0 between the words of a text]
[test: U+3000 between the words of a text] [test: U+FEFF between the words of a
text] [test: a form feed between the words of a text] [test: U+00A0 at the end
of a text] [test: U+00A0 around the text of a title] [test: U+00A0 before the
name of a point] [test: U+00A0 around the colon and the brackets of a point]
[test: U+00A0 inside the brackets of a point] [test: a form feed after the
bracket of a point] [test: U+00A0 around the colon of accTitle] [test: U+00A0
inside a description block] [test: U+00A0 inside an empty description block]
[test: U+00A0 around the arrow of an axis] [test: U+00A0 in the name of a class]
