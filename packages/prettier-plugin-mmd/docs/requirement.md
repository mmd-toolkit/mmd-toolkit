# Requirement diagram formatting rules

Japanese version: [requirement.ja.md](./requirement.ja.md)

How prettier-plugin-mmd formats a requirement diagram. Each rule below keeps
what mermaid.js reads from the diagram; where a change would alter it, the text
is kept as written, and the rule says where. Where a rule is the same as in an
ER diagram, it says so, and the reason is in the
[rules for ER diagrams](./er.md).

Each rule below shows its formatting with examples: the text before formatting,
and the text that the plugin prints. The examples are the fixtures that the
tests check, and the link above each one is to its file. How the fixtures are
organized and checked is described in
[Documents and fixtures](./development.md#documents-and-fixtures).

## Rules

### Indentation

The statements after the header stand one level deeper than the header. The
fields of a requirement or an element stand one level deeper than the line of
the statement, one on each line, and the `}` that closes the body stands on a
line of its own, at the level of that line. [fixture:
indentation/statements-and-bodies] A level is what Prettier's `useTabs` and
`tabWidth` options say: two spaces by default. [fixture:
indentation/tab-width-4] [fixture: indentation/use-tabs] The indentation written
in the input is not kept. Whitespace at the start of a line is nothing to
mermaid.js, so the printer chooses the indentation from the structure alone, and
one rule per level prints the same text whatever the input was indented with.
[fixture: indentation/written-indentation-dropped] The header stands at the
first column, also where whitespace was written before it. [fixture:
indentation/header-leading-whitespace] The lines of a text that is kept as
written, such as the lines of an `accDescr` block, keep their columns, and the
`}` that closes a block stands at the level of its statement. [fixture:
indentation/description-block-lines-kept] The one exception is an `accTitle` or
`accDescr` statement that holds a direction, which keeps the first column (see
[Accessibility statements](#accessibility-statements)).

Input
([indentation/statements-and-bodies-input.mmd](../tests/fixtures/requirement/indentation/statements-and-bodies-input.mmd)):

```mmd
requirementDiagram
requirement r {
id: 1
text: t
}
element e {
type: t
}
r - satisfies -> e
style r fill:red
```

Output
([indentation/statements-and-bodies-output.mmd](../tests/fixtures/requirement/indentation/statements-and-bodies-output.mmd)):

```mmd
requirementDiagram
  requirement r {
    id: 1
    text: t
  }
  element e {
    type: t
  }
  r - satisfies -> e
  style r fill:red
```

Input
([indentation/tab-width-4-input.mmd](../tests/fixtures/requirement/indentation/tab-width-4-input.mmd)):

```mmd
requirementDiagram
requirement r {
id: 1
}
r - satisfies -> r
```

Output
([indentation/tab-width-4-output.mmd](../tests/fixtures/requirement/indentation/tab-width-4-output.mmd)):

```mmd
requirementDiagram
    requirement r {
        id: 1
    }
    r - satisfies -> r
```

### Bodies

The `{` of a requirement or an element stands on the line of its keyword, name,
and classes, after one space, however it was written; the fields follow on lines
of their own, and the `}` closes the body on a line of its own. The `{` stands
after one space as in an ER attribute block, which is how the documentation of
mermaid.js writes it; where the name is unquoted a space is needed anyway, so
the statement has one form. [fixture: bodies/opening-brace-after-one-space] The
keyword of a requirement is one of six kinds, kept in the case in which it is
written. [fixture: bodies/kinds] A statement that follows the `}` on its line
stands on a line of its own. [fixture: bodies/statement-after-closing-brace]
[fixture: statements-one-per-line/closing-brace-then-statement]

mermaid.js needs a line break after the `{`, so a body without fields is the `{`
and the `}` on two lines, and the empty lines between them are dropped.
[fixture: bodies/empty-body-on-two-lines] Empty lines at the start and the end
of a body are dropped too (see [Blank lines](#blank-lines)). [fixture:
bodies/blank-lines-at-edges-dropped]

Input
([bodies/empty-body-on-two-lines-input.mmd](../tests/fixtures/requirement/bodies/empty-body-on-two-lines-input.mmd)):

```mmd
requirementDiagram
requirement r {
}
element e {


}
requirement s {

}
```

Output
([bodies/empty-body-on-two-lines-output.mmd](../tests/fixtures/requirement/bodies/empty-body-on-two-lines-output.mmd)):

```mmd
requirementDiagram
  requirement r {
  }
  element e {
  }
  requirement s {
  }
```

Input
([bodies/statement-after-closing-brace-input.mmd](../tests/fixtures/requirement/bodies/statement-after-closing-brace-input.mmd)):

```mmd
requirementDiagram
requirement r {
id: 1
} element e {
type: t
} r - satisfies -> e
```

Output
([bodies/statement-after-closing-brace-output.mmd](../tests/fixtures/requirement/bodies/statement-after-closing-brace-output.mmd)):

```mmd
requirementDiagram
  requirement r {
    id: 1
  }
  element e {
    type: t
  }
  r - satisfies -> e
```

### Fields

A field is printed on one line: its keyword, the `:` touching it, and its value
after one space, however it was written, as the documentation of mermaid.js
writes the fields and as a user journey puts a value after one space. [fixture:
fields/colon-touches-keyword] [fixture: fields/spaces-around-colon-and-value]
[fixture: fields/value-after-one-space] The whitespace at the ends of an
unquoted value is not in the Db and is dropped; the whitespace inside it is, and
so is everything between the quotes of a string. [fixture:
fields/value-outer-whitespace-dropped] [fixture:
fields/value-inner-whitespace-kept] [fixture: fields/string-values-kept] A `#`,
a `%`, and a `;` inside an unquoted value are characters of the value, not the
start of a comment. [fixture: fields/special-characters-in-values]

The fields keep the order in which they are written, also a field that is
written twice, of which mermaid.js reads the first. [fixture: fields/order-kept]
[fixture: fields/same-field-twice] The keywords of the fields, the risks, and
the verification methods keep the case in which they are written. mermaid.js
reads them in any case and the Db is the same, so nothing forces the case; it is
the author's, and the printer does not rewrite it. [fixture:
fields/field-keywords-case-kept] [fixture: fields/keyword-values-case-kept] A
field written over several lines is printed on one line where the lexer reads
the line break as whitespace, which it does after whitespace (see
[Multi-line statements](#multi-line-statements)). [fixture:
fields/over-lines-joined]

Input
([fields/spaces-around-colon-and-value-input.mmd](../tests/fixtures/requirement/fields/spaces-around-colon-and-value-input.mmd)):

```mmd
requirementDiagram
requirement r {
id:1
text :   the test text.
risk :high
verifyMethod:    inspection
}
element e {
type  :t
docref:   d
}
```

Output
([fields/spaces-around-colon-and-value-output.mmd](../tests/fixtures/requirement/fields/spaces-around-colon-and-value-output.mmd)):

```mmd
requirementDiagram
  requirement r {
    id: 1
    text: the test text.
    risk: high
    verifyMethod: inspection
  }
  element e {
    type: t
    docref: d
  }
```

Input
([fields/string-values-kept-input.mmd](../tests/fixtures/requirement/fields/string-values-kept-input.mmd)):

```mmd
requirementDiagram
requirement r {
id: "1"
text: " a:  b, c "
}
element e {
type: "a  b"
docref: "http://x.test/a-b"
}
```

Output
([fields/string-values-kept-output.mmd](../tests/fixtures/requirement/fields/string-values-kept-output.mmd)):

```mmd
requirementDiagram
  requirement r {
    id: "1"
    text: " a:  b, c "
  }
  element e {
    type: "a  b"
    docref: "http://x.test/a-b"
  }
```

### Names

A name is printed as written, quoted or not: mermaid.js reads `"r"` and `r` as
the same name, and the quotes are kept. [fixture:
names/quoted-and-unquoted-kept] An unquoted name may hold whitespace between its
words, which is part of the name and stays as written; the whitespace at its
ends is not, and is dropped. [fixture: names/inner-whitespace-kept] [fixture:
names/outer-whitespace-dropped] A string holds any character, such as `-`, `:`,
`,`, and `{`, and an unquoted name holds `#`, `.`, and `}` after its first
character. [fixture: names/string-names-with-special-characters] [fixture:
names/special-characters-in-unquoted-names]

Input
([names/quoted-and-unquoted-kept-input.mmd](../tests/fixtures/requirement/names/quoted-and-unquoted-kept-input.mmd)):

```mmd
requirementDiagram
requirement "r" {
}
requirement s {
}
"r" - satisfies -> s
s - satisfies -> "r"
style "r" fill:red
```

Output
([names/quoted-and-unquoted-kept-output.mmd](../tests/fixtures/requirement/names/quoted-and-unquoted-kept-output.mmd)):

```mmd
requirementDiagram
  requirement "r" {
  }
  requirement s {
  }
  "r" - satisfies -> s
  s - satisfies -> "r"
  style "r" fill:red
```

Input
([names/string-names-with-special-characters-input.mmd](../tests/fixtures/requirement/names/string-names-with-special-characters-input.mmd)):

```mmd
requirementDiagram
requirement "a - b: c, d {" {
}
"x  y" - satisfies -> "z"
```

Output
([names/string-names-with-special-characters-output.mmd](../tests/fixtures/requirement/names/string-names-with-special-characters-output.mmd)):

```mmd
requirementDiagram
  requirement "a - b: c, d {" {
  }
  "x  y" - satisfies -> "z"
```

### Relationship spacing

A relationship has one space between its units: the left name, the `-` or `<-`,
the relation, the `->` or `-`, and the right name, however it was written. The
documentation of mermaid.js writes the units apart, as the relationships of an
ER diagram have one space between their units, and an unquoted name ends before
the `-`, so the space does not change the name. [fixture:
relationship-spacing/spaces-and-touching] [fixture:
relationship-spacing/one-space-between-units] [fixture:
relationship-spacing/string-names] The direction of the arrow is kept, since
`a - copies -> b` and `b <- copies - a` are written differently, and so is the
case of the relation. [fixture: relationship-spacing/relation-case-kept]
[fixture: relationship-spacing/every-relation] The whitespace inside an unquoted
name is part of it. [fixture: relationship-spacing/multi-word-names] A directive
between the units stays where it is, with the whitespace written on each side of
it. [fixture: relationship-spacing/directive-between-units-kept] A relationship
written over several lines, where the line break follows whitespace, is printed
on one line. [fixture: relationship-spacing/over-lines-joined]

Input
([relationship-spacing/spaces-and-touching-input.mmd](../tests/fixtures/requirement/relationship-spacing/spaces-and-touching-input.mmd)):

```mmd
requirementDiagram
a-satisfies->b
a  -  satisfies  ->  b
b<-satisfies-a
b  <-  copies  -  a
```

Output
([relationship-spacing/spaces-and-touching-output.mmd](../tests/fixtures/requirement/relationship-spacing/spaces-and-touching-output.mmd)):

```mmd
requirementDiagram
  a - satisfies -> b
  a - satisfies -> b
  b <- satisfies - a
  b <- copies - a
```

Input
([relationship-spacing/directive-between-units-kept-input.mmd](../tests/fixtures/requirement/relationship-spacing/directive-between-units-kept-input.mmd)):

```mmd
requirementDiagram
a -%%{init: {}}%%satisfies  ->  b
a  %%{init: {}}%% - contains -> b
```

Output
([relationship-spacing/directive-between-units-kept-output.mmd](../tests/fixtures/requirement/relationship-spacing/directive-between-units-kept-output.mmd)):

```mmd
requirementDiagram
  a -%%{init: {}}%%satisfies -> b
  a %%{init: {}}%% - contains -> b
```

### Class lists

The classes after `:::`, in a requirement, in an element, and in a statement of
a name and its classes, touch the `:::`, and the `,` between them touches the
classes on both sides: `requirement r ::: a , b {` is printed
`requirement r:::a,b {`, as the classes of an ER diagram and the documentation
of mermaid.js are written. [fixture: class-lists/in-requirement-and-element]
[fixture: class-lists/shorthand] A class is a string, or an unquoted text that
may hold whitespace between its words, which is part of the class. [fixture:
class-lists/string-classes] [fixture: class-lists/classes-with-spaces] A
directive between the parts stays where it is. [fixture:
class-lists/directive-between-parts-kept]

Input
([class-lists/in-requirement-and-element-input.mmd](../tests/fixtures/requirement/class-lists/in-requirement-and-element-input.mmd)):

```mmd
requirementDiagram
requirement r ::: a , b {
id: 1
}
element e:::c{
}
requirement s:::a,b,c {
}
```

Output
([class-lists/in-requirement-and-element-output.mmd](../tests/fixtures/requirement/class-lists/in-requirement-and-element-output.mmd)):

```mmd
requirementDiagram
  requirement r:::a,b {
    id: 1
  }
  element e:::c {
  }
  requirement s:::a,b,c {
  }
```

Input
([class-lists/string-classes-input.mmd](../tests/fixtures/requirement/class-lists/string-classes-input.mmd)):

```mmd
requirementDiagram
requirement r:::"a b" , "c" {
}
r ::: "d"
```

Output
([class-lists/string-classes-output.mmd](../tests/fixtures/requirement/class-lists/string-classes-output.mmd)):

```mmd
requirementDiagram
  requirement r:::"a b","c" {
  }
  r:::"d"
```

### Styles and classes

The names of a `classDef` statement, and the names and the classes of a `style`
and a `class` statement, are separated by a `,` that touches the names on both
sides: `classDef a ,b ,  c fill:red` is printed `classDef a,b,c fill:red`.
[fixture: styles-and-classes/class-def-names] [fixture:
styles-and-classes/style-names] [fixture: styles-and-classes/class-lists] The
first style stands after one space, and the two lists of a `class` statement are
separated by one space. The whitespace inside a style is printed as written:
mermaid.js joins the texts of a style and drops the whitespace between them, so
`stroke-dasharray: 5 5` is the style `stroke-dasharray:55`, and the whitespace
stays where the author put it. The whitespace around a `,` between two styles is
a run of whitespace between tokens, and becomes one space. [fixture:
styles-and-classes/styles-as-written] The whitespace at the end of the statement
is dropped, since the style context reads the line feed as the end of the
statement. [fixture: styles-and-classes/trailing-whitespace-dropped] The
keywords keep their case. [fixture: styles-and-classes/keyword-case-kept]

A `;` at the end of a style is a character of the style, or a `;` that the line
rule of mermaid.js ignores (diagrams/requirement.md, The style context and
Comments). It is kept as written, with whatever lies between it and the last
style. [fixture: styles-and-classes/ending-semicolon-kept] [fixture:
styles-and-classes/ignored-semicolon-kept]

A `class` statement may go on after a line break. The names before the break are
read in the style context, where an unquoted name is a `style-word`
(diagrams/requirement.md, The style context, rule 1), and the names after it in
the statement context, where an unquoted name may hold whitespace and other
characters. The statement is printed on one line when every name after the first
line break is a string or an unquoted name that is a `style-word`: the lexer
reads such a name the same way on one line. [fixture:
styles-and-classes/class-over-lines-joined] Otherwise the line break stays, and
the later lines stand one level deeper. [fixture:
styles-and-classes/class-over-lines-kept] A statement with a comment line in it
is kept as written. [fixture:
styles-and-classes/class-over-lines-with-comment-line-kept]

Input
([styles-and-classes/class-def-names-input.mmd](../tests/fixtures/requirement/styles-and-classes/class-def-names-input.mmd)):

```mmd
requirementDiagram
classDef a ,b ,  c fill:red
classDef default fill:#f9f,stroke-width:4px
classDef "d" fill:red
```

Output
([styles-and-classes/class-def-names-output.mmd](../tests/fixtures/requirement/styles-and-classes/class-def-names-output.mmd)):

```mmd
requirementDiagram
  classDef a,b,c fill:red
  classDef default fill:#f9f,stroke-width:4px
  classDef "d" fill:red
```

Input
([styles-and-classes/styles-as-written-input.mmd](../tests/fixtures/requirement/styles-and-classes/styles-as-written-input.mmd)):

```mmd
requirementDiagram
style r fill : #f9f , stroke:#333
style r stroke-dasharray: 5 5
style r fill:red   ,   stroke:blue
style r   fill: red;
```

Output
([styles-and-classes/styles-as-written-output.mmd](../tests/fixtures/requirement/styles-and-classes/styles-as-written-output.mmd)):

```mmd
requirementDiagram
  style r fill : #f9f , stroke:#333
  style r stroke-dasharray: 5 5
  style r fill:red , stroke:blue
  style r fill: red;
```

Input
([styles-and-classes/class-over-lines-joined-input.mmd](../tests/fixtures/requirement/styles-and-classes/class-over-lines-joined-input.mmd)):

```mmd
requirementDiagram
requirement r {
id: 1
}
class r
c
class r c
,d
class r
c,d
class r c ,
d
```

Output
([styles-and-classes/class-over-lines-joined-output.mmd](../tests/fixtures/requirement/styles-and-classes/class-over-lines-joined-output.mmd)):

```mmd
requirementDiagram
  requirement r {
    id: 1
  }
  class r c
  class r c,d
  class r c,d
  class r c,d
```

Input
([styles-and-classes/class-over-lines-kept-input.mmd](../tests/fixtures/requirement/styles-and-classes/class-over-lines-kept-input.mmd)):

```mmd
requirementDiagram
requirement r {
id: 1
}
class r
c d
class r
c.d
class r
c#d
```

Output
([styles-and-classes/class-over-lines-kept-output.mmd](../tests/fixtures/requirement/styles-and-classes/class-over-lines-kept-output.mmd)):

```mmd
requirementDiagram
  requirement r {
    id: 1
  }
  class r
    c d
  class r
    c.d
  class r
    c#d
```

### Direction

A direction line is `direction` and its value, with the text that mermaid.js
does not read before and after them. The text is kept as written. One space
stands between it and `direction`, where they were written apart, and between
`direction` and the value; the value is kept in the case in which it is written.
[fixture: direction/spacing] [fixture: direction/spaces-around] [fixture:
direction/text-kept] [fixture: direction/case-kept] A value written on a later
line is printed after `direction` on one line. [fixture:
direction/value-on-next-line-joined] A direction line with a directive or a
comment line inside is kept as written. [fixture:
direction/directive-and-comment-line-kept] The rule of the lexer for a direction
line takes the whole line, so a relationship that ends with `direction LR` is a
direction line with the text before it. [fixture: direction/after-relationship]

Input
([direction/text-kept-input.mmd](../tests/fixtures/requirement/direction/text-kept-input.mmd)):

```mmd
requirementDiagram
x   direction  RL   y  z
foo direction LR %% c
direction LR;
direction LRX
```

Output
([direction/text-kept-output.mmd](../tests/fixtures/requirement/direction/text-kept-output.mmd)):

```mmd
requirementDiagram
  x direction RL y  z
  foo direction LR %% c
  direction LR;
  direction LRX
```

Input
([direction/case-kept-input.mmd](../tests/fixtures/requirement/direction/case-kept-input.mmd)):

```mmd
requirementDiagram
DIRECTION lr
Direction Tb
```

Output
([direction/case-kept-output.mmd](../tests/fixtures/requirement/direction/case-kept-output.mmd)):

```mmd
requirementDiagram
  DIRECTION lr
  Direction Tb
```

### Statements one per line

Nothing separates two statements of a requirement diagram, and mermaid.js reads
statements that follow one another on a line. A line of two statements is hard
to read, and the other diagram types print one statement on a line too. Each
statement is printed on a line of its own: a statement after the `}` of a body,
an empty description block after the header or after a statement that ends with
a `}` or with a string, and the statement that a string at the end of a `style`,
`classDef`, or `class` statement starts. [fixture:
statements-one-per-line/header-then-empty-description-block] [fixture:
statements-one-per-line/after-closing-brace] [fixture:
statements-one-per-line/after-string-name] [fixture:
statements-one-per-line/empty-description-blocks] A directive between two
statements stands with the statement after it. [fixture:
statements-one-per-line/directive-after-statement]

After a `style`, `classDef`, or `class` statement, the lexer is still in the
style context, so a string on its line starts the next statement and the line
feed after it, not a `newline` unit, lets that statement go on:
`style r fill:red "r"` and a line `:::c` give r the class c. The statement is
printed on a line of its own, with its parts on one line. [fixture:
statements-one-per-line/string-continued-after-styles] A statement of that kind
with a comment line or a directive in it cannot be joined, and has to stay on
the line of the statement before it; so does one that stands on a line that
holds a `;`, since such a line keeps its statements together (see below). The
line is printed as written, from the first statement to the end of the second.
[fixture: statements-one-per-line/continued-with-comment-line-kept] [fixture:
statements-one-per-line/continued-with-directive-kept] [fixture:
statements-one-per-line/continued-on-semicolon-line-kept] [fixture:
statements-one-per-line/continued-on-ignored-semicolon-line-kept]

A line that holds a `;` keeps its statements together: the line rule of
mermaid.js removes the last `;` of a line that holds `style`, a `:` after it,
and a `#` after that, and moving a statement to a line of its own makes the rule
stop ignoring a `;`, or ignore another. In
`a - satisfies -> "style:#x" accDescr {} e - satisfies -> f;g`, the target of
the second relationship is `fg`, while on a line of its own `f;g` is the target
`f;g`. So the statements of such a line stay on it, with the whitespace between
them formatted as anywhere else, and the `;` stays as written. [fixture:
statements-one-per-line/semicolon-line-kept] [fixture:
statements-one-per-line/ignored-semicolon-line-kept]

Input
([statements-one-per-line/header-then-empty-description-block-input.mmd](../tests/fixtures/requirement/statements-one-per-line/header-then-empty-description-block-input.mmd)):

```mmd
requirementDiagram accDescr {}
requirement r {
id: 1
}
```

Output
([statements-one-per-line/header-then-empty-description-block-output.mmd](../tests/fixtures/requirement/statements-one-per-line/header-then-empty-description-block-output.mmd)):

```mmd
requirementDiagram
  accDescr {}
  requirement r {
    id: 1
  }
```

Input
([statements-one-per-line/string-continued-after-styles-input.mmd](../tests/fixtures/requirement/statements-one-per-line/string-continued-after-styles-input.mmd)):

```mmd
requirementDiagram
requirement r {
id: 1
}
style r fill:red "r"
:::c
classDef c fill:red "r"
:::c
class r c "r"
- satisfies -> b
class r c "r"
:::d
```

Output
([statements-one-per-line/string-continued-after-styles-output.mmd](../tests/fixtures/requirement/statements-one-per-line/string-continued-after-styles-output.mmd)):

```mmd
requirementDiagram
  requirement r {
    id: 1
  }
  style r fill:red
  "r":::c
  classDef c fill:red
  "r":::c
  class r c
  "r" - satisfies -> b
  class r c
  "r":::d
```

Input
([statements-one-per-line/semicolon-line-kept-input.mmd](../tests/fixtures/requirement/statements-one-per-line/semicolon-line-kept-input.mmd)):

```mmd
requirementDiagram
a - satisfies -> "style:#x" accDescr {}   e - satisfies -> f;g
```

Output
([statements-one-per-line/semicolon-line-kept-output.mmd](../tests/fixtures/requirement/statements-one-per-line/semicolon-line-kept-output.mmd)):

```mmd
requirementDiagram
  a - satisfies -> "style:#x" accDescr {} e - satisfies -> f;g
```

### Blank lines

Runs of empty lines become one empty line, and empty lines at the start and the
end of the diagram and of a body are dropped, as in the other diagram types.
[fixture: blank-lines/collapsed] [fixture: blank-lines/between-fields-collapsed]
[fixture: blank-lines/header-and-end-of-text-dropped] [fixture:
blank-lines/body-edges-dropped] The empty lines around comment lines and
directive lines are handled in the same way. [fixture:
blank-lines/around-comment-and-directive-lines]

Input
([blank-lines/collapsed-input.mmd](../tests/fixtures/requirement/blank-lines/collapsed-input.mmd)):

```mmd
requirementDiagram
requirement r {
id: 1
}



element e {
}


a - satisfies -> b
```

Output
([blank-lines/collapsed-output.mmd](../tests/fixtures/requirement/blank-lines/collapsed-output.mmd)):

```mmd
requirementDiagram
  requirement r {
    id: 1
  }

  element e {
  }

  a - satisfies -> b
```

Input
([blank-lines/between-fields-collapsed-input.mmd](../tests/fixtures/requirement/blank-lines/between-fields-collapsed-input.mmd)):

```mmd
requirementDiagram
requirement r {
id: 1



text: t
}
```

Output
([blank-lines/between-fields-collapsed-output.mmd](../tests/fixtures/requirement/blank-lines/between-fields-collapsed-output.mmd)):

```mmd
requirementDiagram
  requirement r {
    id: 1

    text: t
  }
```

### Empty description blocks

An empty block, `accDescr {}`, changes nothing. Where a statement starts it is a
statement of its own, and on a line of the body of a requirement or an element
it is an item of the body: right after the `{`, before a field, after a field
whose value is a string or a keyword, before the `}`, and alone. Each stands on
a line of its own, as an ER diagram puts a text that mermaid.js does not read in
a block, and the fields of a body stand one on each line. [fixture:
empty-description-blocks/as-statement] [fixture:
empty-description-blocks/after-header] [fixture:
empty-description-blocks/in-body-own-lines] [fixture:
empty-description-blocks/in-body-before-closing-brace] [fixture:
empty-description-blocks/in-body-alone]

The block follows the rule of whitespace between tokens: a run of whitespace in
it, line breaks included, becomes one space, and braces that touch keep
touching. [fixture: empty-description-blocks/inner-whitespace-collapsed]
[fixture: empty-description-blocks/inner-whitespace-joined] [fixture:
empty-description-blocks/touching-kept] [fixture:
empty-description-blocks/in-body-over-lines-joined] A block with a directive or
a comment line is printed as written. [fixture:
empty-description-blocks/with-directive-or-comment-line-kept] [fixture:
empty-description-blocks/in-body-with-comment-line-kept] [fixture:
empty-description-blocks/in-body-with-directive-kept]

Input
([empty-description-blocks/in-body-own-lines-input.mmd](../tests/fixtures/requirement/empty-description-blocks/in-body-own-lines-input.mmd)):

```mmd
requirementDiagram
requirement r { accDescr {}
id: "1" accDescr {}
accDescr {} text: t
risk: low accDescr {   }
}
```

Output
([empty-description-blocks/in-body-own-lines-output.mmd](../tests/fixtures/requirement/empty-description-blocks/in-body-own-lines-output.mmd)):

```mmd
requirementDiagram
  requirement r {
    accDescr {}
    id: "1"
    accDescr {}
    accDescr {}
    text: t
    risk: low
    accDescr { }
  }
```

Input
([empty-description-blocks/inner-whitespace-joined-input.mmd](../tests/fixtures/requirement/empty-description-blocks/inner-whitespace-joined-input.mmd)):

```mmd
requirementDiagram
accDescr {     }
accDescr {


}
accDescr   {}
```

Output
([empty-description-blocks/inner-whitespace-joined-output.mmd](../tests/fixtures/requirement/empty-description-blocks/inner-whitespace-joined-output.mmd)):

```mmd
requirementDiagram
  accDescr { }
  accDescr { }
  accDescr {}
```

### Accessibility statements

The `:` of `accTitle` and `accDescr` touches the keyword and has one space after
it; the text has no whitespace at its ends, and the whitespace inside it is part
of it. [fixture: accessibility-statements/colon-touches-keyword] [fixture:
accessibility-statements/title-and-description] [fixture:
accessibility-statements/inner-whitespace-kept] The text holds `;`, `#`, and
`%%` as characters. [fixture:
accessibility-statements/special-characters-in-text] A text written on a later
line is printed after the `:` on one line, and a comment line before it makes
the statement kept as written. [fixture:
accessibility-statements/text-on-next-line-joined] [fixture:
accessibility-statements/text-with-comment-line-kept]

The lines of an `accDescr { ... }` block are kept as written by choice, not by
need: the whitespace at the start of a line is not in the Db (`a`, a line break,
and `b` give the same description as with `  b`), and the lines are the text of
the author, which the printer does not format. Its `}` stands at the level of
its statement; a text on the line of the `{` has one space inside the braces
where it was written apart. [fixture: accessibility-statements/block-lines-kept]
[fixture: accessibility-statements/block-text-on-opening-line] [fixture:
accessibility-statements/block-comment-and-empty-lines-kept]

The lexer reads a line as a direction line before it reads the statements that
follow it, but after `accTitle` and `accDescr`: `accTitle: direction LR` at the
first column is a title, and after an indentation it is a direction line with
the text `accTitle:` before `direction`. So an `accTitle`, `accDescr:`, or
`accDescr {` statement whose first printed line holds `direction`, one or more
whitespace characters, and one of `TB`, `BT`, `RL`, and `LR`, in any case, keeps
the first column. The line is judged as the lexer reads it, without the
directives and the comment lines. [fixture:
accessibility-statements/first-column-kept] A line that holds no such direction
is indented as any statement is. [fixture:
accessibility-statements/first-column-not-needed]

Input
([accessibility-statements/colon-touches-keyword-input.mmd](../tests/fixtures/requirement/accessibility-statements/colon-touches-keyword-input.mmd)):

```mmd
requirementDiagram
accTitle : My title
accDescr:My description
ACCTITLE :T
```

Output
([accessibility-statements/colon-touches-keyword-output.mmd](../tests/fixtures/requirement/accessibility-statements/colon-touches-keyword-output.mmd)):

```mmd
requirementDiagram
  accTitle: My title
  accDescr: My description
  ACCTITLE: T
```

Input
([accessibility-statements/block-lines-kept-input.mmd](../tests/fixtures/requirement/accessibility-statements/block-lines-kept-input.mmd)):

```mmd
requirementDiagram
accDescr {
  first
    second
}
accDescr {
}
```

Output
([accessibility-statements/block-lines-kept-output.mmd](../tests/fixtures/requirement/accessibility-statements/block-lines-kept-output.mmd)):

```mmd
requirementDiagram
  accDescr {
  first
    second
  }
  accDescr { }
```

Input
([accessibility-statements/first-column-kept-input.mmd](../tests/fixtures/requirement/accessibility-statements/first-column-kept-input.mmd)):

```mmd
requirementDiagram
accTitle: direction LR
accDescr: direction  TB
accDescr { direction RL }
accDescr {
 direction BT
}
```

Output
([accessibility-statements/first-column-kept-output.mmd](../tests/fixtures/requirement/accessibility-statements/first-column-kept-output.mmd)):

```mmd
requirementDiagram
accTitle: direction LR
accDescr: direction  TB
accDescr { direction RL }
  accDescr {
 direction BT
  }
```

### Multi-line statements

A statement that mermaid.js reads over several lines is printed on one line
where the line break is whitespace to the lexer. A line break after whitespace
is whitespace to the lexer: between the keyword of a requirement and its name,
between the units of a relationship, around the `:` of a field and of `accTitle`
and `accDescr`, and between `direction` and its value. The statement that a
string at the end of a `style`, `classDef`, or `class` statement starts goes on
after the line break of the style context. [fixture:
multi-line-statements/kind-and-name-joined] [fixture:
multi-line-statements/relationship-joined] [fixture:
multi-line-statements/direction-value-joined] [fixture:
multi-line-statements/accessibility-joined] [fixture:
multi-line-statements/string-continued-joined] A statement with a comment line
or a directive in it is kept as written, since the comment line would take the
rest of the line it stands on and the whitespace of a line that holds a
directive is read with it, and so is one with a `;`, which the line rule
decides. [fixture: multi-line-statements/comment-line-inside-kept] [fixture:
multi-line-statements/directive-inside-kept] [fixture:
multi-line-statements/semicolon-kept]

A statement whose last line holds a `;` of the statement after it is kept as
written too, since the joined line is read by the line rule as a whole:
`"style:#q" - satisfies`, a line break, and `-> "b" e - satisfies -> f;g` give
the second relationship the target `f;g`, while the joined line
`"style:#q" - satisfies -> "b" e - satisfies -> f;g` gives it `fg`. The
statements of the line stay on it. [fixture:
multi-line-statements/relationship-last-line-semicolon-kept] [fixture:
multi-line-statements/class-last-line-semicolon-kept] [fixture:
multi-line-statements/string-continued-last-line-semicolon-kept] A `;` on the
first line of the statement, in a statement before it, changes nothing for the
rule, and the statement is joined. [fixture:
multi-line-statements/relationship-first-line-semicolon-joined] [fixture:
multi-line-statements/class-first-line-semicolon-joined] [fixture:
multi-line-statements/accessibility-first-line-semicolon-joined]

Input
([multi-line-statements/string-continued-joined-input.mmd](../tests/fixtures/requirement/multi-line-statements/string-continued-joined-input.mmd)):

```mmd
requirementDiagram
style r fill:red "r"
:::c
class r c "r"
- satisfies -> b
```

Output
([multi-line-statements/string-continued-joined-output.mmd](../tests/fixtures/requirement/multi-line-statements/string-continued-joined-output.mmd)):

```mmd
requirementDiagram
  style r fill:red
  "r":::c
  class r c
  "r" - satisfies -> b
```

Input
([multi-line-statements/accessibility-joined-input.mmd](../tests/fixtures/requirement/multi-line-statements/accessibility-joined-input.mmd)):

```mmd
requirementDiagram
accTitle:
T
accDescr
: D
```

Output
([multi-line-statements/accessibility-joined-output.mmd](../tests/fixtures/requirement/multi-line-statements/accessibility-joined-output.mmd)):

```mmd
requirementDiagram
  accTitle: T
  accDescr: D
```

### Whitespace between tokens

Where no rule above applies, a run of whitespace between two tokens of a
statement becomes one space, and tokens that touch keep touching: the braces of
an empty description block. [fixture: whitespace-between-tokens/collapsed]
[fixture: whitespace-between-tokens/touching-kept] The whitespace at the end of
a line is dropped. [fixture:
whitespace-between-tokens/trailing-whitespace-dropped]

Input
([whitespace-between-tokens/collapsed-input.mmd](../tests/fixtures/requirement/whitespace-between-tokens/collapsed-input.mmd)):

```mmd
requirementDiagram
accDescr   {   }
requirement r {
id: 1
}
style   r   fill:red
class   r   c
```

Output
([whitespace-between-tokens/collapsed-output.mmd](../tests/fixtures/requirement/whitespace-between-tokens/collapsed-output.mmd)):

```mmd
requirementDiagram
  accDescr { }
  requirement r {
    id: 1
  }
  style r fill:red
  class r c
```

Input
([whitespace-between-tokens/touching-kept-input.mmd](../tests/fixtures/requirement/whitespace-between-tokens/touching-kept-input.mmd)):

```mmd
requirementDiagram
accDescr{}
accDescr{ }
accDescr {}
```

Output
([whitespace-between-tokens/touching-kept-output.mmd](../tests/fixtures/requirement/whitespace-between-tokens/touching-kept-output.mmd)):

```mmd
requirementDiagram
  accDescr{}
  accDescr{ }
  accDescr {}
```

### Keyword case

Keywords keep the case in which they are written. mermaid.js reads them in any
case and the Db is the same, so nothing forces the case; it is the author's, and
the printer does not rewrite it. [fixture: keyword-case/keywords-kept] The
header is detected only when it starts with `requirement` in lower case
(diagrams/requirement.md, Detection).

Input
([keyword-case/keywords-kept-input.mmd](../tests/fixtures/requirement/keyword-case/keywords-kept-input.mmd)):

```mmd
requirementdiagram
REQUIREMENT r {
ID: 1
RISK: HIGH
}
ELEMENT e {
}
r - SATISFIES -> e
DIRECTION lr
STYLE r fill:red
```

Output
([keyword-case/keywords-kept-output.mmd](../tests/fixtures/requirement/keyword-case/keywords-kept-output.mmd)):

```mmd
requirementdiagram
  REQUIREMENT r {
    ID: 1
    RISK: HIGH
  }
  ELEMENT e {
  }
  r - SATISFIES -> e
  DIRECTION lr
  STYLE r fill:red
```

### Comments

A comment starts with `%%`, `#`, or `%`, where a unit starts, and runs to the
end of the line. A comment on a line of its own stands at the level of the
statement after it, in a body at the level of the fields, and its text and its
mark are kept as written. [fixture: comments/lines-at-statement-level] [fixture:
comments/single-mark-lines-kept] A comment line before the header stands at the
first column, and one at the end of a body or of the text stays on a line of its
own. [fixture: comments/before-header] [fixture: comments/last-in-body]

A comment after the header, after the `{` or the `}` of a body, after a field
whose value is a keyword or a string, and after a name or a class that is a
string stays on the line, as written: one space stands before it where
whitespace was written, and none where it touches. [fixture:
comments/after-header] [fixture: comments/after-header-glued] [fixture:
comments/after-opening-brace] [fixture: comments/after-closing-brace] [fixture:
comments/after-keyword-and-string-values] [fixture: comments/after-string-name]
Where an unquoted name or value stands, a `#` or a `%` is a character of the
text, and after the value of a direction line it is text that mermaid.js does
not read; they are kept with it. [fixture: comments/in-unquoted-text-is-text]
[fixture: comments/after-direction-is-text] Inside an accessibility text and a
string, `%%` is a character of the text. [fixture:
comments/percent-in-values-kept]

mermaid.js reads a comment line that starts with `%%{` without being a directive
at any indentation in a requirement diagram, so no particular indentation is
kept for it. [fixture: comments/percent-brace-lines]

Input
([comments/lines-at-statement-level-input.mmd](../tests/fixtures/requirement/comments/lines-at-statement-level-input.mmd)):

```mmd
requirementDiagram
%% c1
requirement r {
      %% c2
id: 1
%% c3
}
   %% c4
element e {
}
```

Output
([comments/lines-at-statement-level-output.mmd](../tests/fixtures/requirement/comments/lines-at-statement-level-output.mmd)):

```mmd
requirementDiagram
  %% c1
  requirement r {
    %% c2
    id: 1
    %% c3
  }
  %% c4
  element e {
  }
```

Input
([comments/after-keyword-and-string-values-input.mmd](../tests/fixtures/requirement/comments/after-keyword-and-string-values-input.mmd)):

```mmd
requirementDiagram
requirement r {
risk: low %c
verifyMethod: test#c
id: "1" #c
text: "t"%c
}
```

Output
([comments/after-keyword-and-string-values-output.mmd](../tests/fixtures/requirement/comments/after-keyword-and-string-values-output.mmd)):

```mmd
requirementDiagram
  requirement r {
    risk: low %c
    verifyMethod: test#c
    id: "1" #c
    text: "t"%c
  }
```

Input
([comments/in-unquoted-text-is-text-input.mmd](../tests/fixtures/requirement/comments/in-unquoted-text-is-text-input.mmd)):

```mmd
requirementDiagram
requirement r {
id: 1 #c
text: a %c
}
a - satisfies -> b #c
```

Output
([comments/in-unquoted-text-is-text-output.mmd](../tests/fixtures/requirement/comments/in-unquoted-text-is-text-output.mmd)):

```mmd
requirementDiagram
  requirement r {
    id: 1 #c
    text: a %c
  }
  a - satisfies -> b #c
```

### Directives

A directive on a line of its own stands at the level of the statements around
it, in a body at the level of the fields, and a directive on the line of a
statement keeps whether whitespace is written on each side of it: where it is,
one space stands there, and where it touches a token, it keeps touching.
[fixture: directives/kept] [fixture: directives/in-body] [fixture:
directives/before-header] [fixture: directives/after-header-on-same-line]
[fixture: directives/whitespace-on-both-sides-collapsed] [fixture:
directives/after-statement-at-end-of-line]

A directive between two units of a statement stays where it is, with the
whitespace written on each side of it, and a directive inside a text is part of
the text. [fixture: directives/between-units-kept] [fixture:
directives/inside-values-kept] A directive that is not closed takes the rest of
the text, and is kept as written. [fixture:
directives/unclosed-at-end-of-text-kept] [fixture:
directives/unclosed-after-statement-kept]

Input
([directives/kept-input.mmd](../tests/fixtures/requirement/directives/kept-input.mmd)):

```mmd
requirementDiagram
%%{init: {'theme': 'dark'}}%%
requirement r {
id: 1
}
    %%{wrap}%%
element e {
}
```

Output
([directives/kept-output.mmd](../tests/fixtures/requirement/directives/kept-output.mmd)):

```mmd
requirementDiagram
  %%{init: {'theme': 'dark'}}%%
  requirement r {
    id: 1
  }
  %%{wrap}%%
  element e {
  }
```

Input
([directives/between-units-kept-input.mmd](../tests/fixtures/requirement/directives/between-units-kept-input.mmd)):

```mmd
requirementDiagram
a -%%{init: {}}%% satisfies -> b
requirement r%%{init: {}}%%{
id:%%{init: {}}%% 1
}
```

Output
([directives/between-units-kept-output.mmd](../tests/fixtures/requirement/directives/between-units-kept-output.mmd)):

```mmd
requirementDiagram
  a -%%{init: {}}%% satisfies -> b
  requirement r%%{init: {}}%%{
    id:%%{init: {}}%% 1
  }
```

### Frontmatter YAML

As in a flowchart: the YAML between the `---` lines is formatted with Prettier's
YAML formatter, and the `---` lines are kept as written, with the spaces and
tabs at the end of each. [fixture: frontmatter-yaml/formatted] [fixture:
frontmatter-yaml/closing-delimiter-whitespace-kept] The YAML is kept as written
when Prettier cannot read it. [fixture: frontmatter-yaml/malformed-kept] A
comment line between the frontmatter and the header is kept. [fixture:
frontmatter-yaml/comment-after-frontmatter-before-header]

Input
([frontmatter-yaml/formatted-input.mmd](../tests/fixtures/requirement/frontmatter-yaml/formatted-input.mmd)):

```mmd
---
title:   T
config:
    theme:   dark
---
requirementDiagram
requirement r {
id: 1
}
```

Output
([frontmatter-yaml/formatted-output.mmd](../tests/fixtures/requirement/frontmatter-yaml/formatted-output.mmd)):

```mmd
---
title: T
config:
  theme: dark
---
requirementDiagram
  requirement r {
    id: 1
  }
```

### Line separators

U+2028 and U+2029 are whitespace between the units of a requirement diagram and
characters of a name, a value, and a string. Between statements they are a line
break like any whitespace: the statements go to lines of their own. A gap inside
a statement that holds one is printed as written, and so is a text: a name, a
class, a value, and an accessibility text keep them. The examples are written as
strings, in which `\u2028` is U+2028 and `\n` is a line break. [test: U+2028
after the closing brace of a body] [test: U+2028 inside a name] [test: U+2028
inside a class] [test: U+2028 after the keyword of a requirement] [test: U+2028
inside a value] [test: U+2029 inside a string] [test: U+2028 before the colon of
a field] [test: U+2028 before the arrow of a relationship] [test: U+2028 after
the name of a relationship] [test: U+2028 between direction and its value]
[test: U+2028 after the colon of accTitle] [test: U+2028 inside an accessibility
text]

### Whitespace characters

U+00A0 and U+FEFF are whitespace to the lexer between units, and characters of a
name or a value. Where the lexer reads whitespace between units, a space stands
for them; inside a name or a value they are characters of the text, and stay.
The examples are written as strings, in which `\u00a0` is U+00A0 and `\ufeff` is
U+FEFF. [test: U+00A0 around the name of a requirement] [test: U+00A0 around the
value of a field] [test: U+00A0 around the colon of a field] [test: U+00A0
around the units of a relationship] [test: U+00A0 around the comma of a list of
classes] [test: U+00A0 inside a name] [test: U+00A0 inside a value] [test:
U+00A0 between direction and its value] [test: U+00A0 after the closing brace of
a body] [test: U+FEFF before the opening brace] [test: U+FEFF before a
statement]
