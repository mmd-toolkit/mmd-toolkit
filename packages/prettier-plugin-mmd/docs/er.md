# ER diagram formatting rules

Japanese version: [er.ja.md](./er.ja.md)

How prettier-plugin-mmd formats an ER diagram. Each rule below keeps what
mermaid.js reads from the diagram; where a change would alter it, the text is
kept as written, and the rule says where. Where a rule is the same as in a class
diagram, it says so, and the reason is in the
[rules for class diagrams](./class.md).

Each rule below shows its formatting with examples: the text before formatting,
and the text that the plugin prints. The examples are the fixtures that the
tests check, and the link above each one is to its file. How the fixtures are
organized and checked is described in
[Documents and fixtures](./development.md#documents-and-fixtures).

## Rules

### Indentation

The statements after the header stand one level deeper than the header.
[fixture: indentation/written-indentation-dropped] The statements of a subgraph
stand one level deeper than the line of the subgraph, and its `end` stands on a
line of its own at the level of that line, also when it was written after a
statement. [fixture: indentation/nested-subgraphs] [fixture:
subgraphs/end-on-the-line-of-a-statement] The attributes of an entity stand one
level deeper than the line of the entity, and its `}` stands at the level of
that line, also in a subgraph. [fixture:
indentation/attribute-blocks-in-subgraphs] A level is what Prettier's `useTabs`
and `tabWidth` options say: two spaces by default. [fixture:
indentation/tab-width-4] [fixture: indentation/use-tabs] The indentation written
in the input is not kept. Whitespace at the start of a line is nothing to
mermaid.js, so the printer chooses the indentation from the structure alone, and
one rule per level prints the same text whatever the input was indented with.
[fixture: indentation/written-indentation-dropped] The one exception is an
`accTitle` or `accDescr` statement that holds a direction, which keeps the first
column (see [Accessibility statements](#accessibility-statements)).

Input
([indentation/nested-subgraphs-input.mmd](../tests/fixtures/er/indentation/nested-subgraphs-input.mmd)):

```mmd
erDiagram
subgraph Outer
A
subgraph Inner [Title]
B ||--o{ C : x
end
D
end
E
```

Output
([indentation/nested-subgraphs-output.mmd](../tests/fixtures/er/indentation/nested-subgraphs-output.mmd)):

```mmd
erDiagram
  subgraph Outer
    A
    subgraph Inner [Title]
      B ||--o{ C : x
    end
    D
  end
  E
```

### Attribute blocks

The `{` of an attribute block stays on the line of the entity, after one space;
each attribute stands on a line of its own, one level deeper; and the `}` stands
on a line of its own at the level of the entity. [fixture:
attribute-blocks/opening-brace-after-one-space] [fixture:
attribute-blocks/split] A block written on one line, or with its first attribute
on the line of the `{` or its last on the line of the `}`, is split so:
mermaid.js reads the attribute block without regard to line breaks, so it reads
the same attributes. [fixture: attribute-blocks/split] [corpus fixture:
er/gram-attributes-one-line] [corpus fixture: er/gram-attribute-split-lines] A
statement that follows the `}` on its line stands on a line of its own.
[fixture: attribute-blocks/entity-after-closing-brace] [corpus fixture:
er/gram-block-then-name-one-line] The name, the alias, and the classes before
the `{` are formatted as in [Entities](#entities). [fixture:
attribute-blocks/alias-and-classes]

An empty block, with nothing but whitespace between its braces, is printed as
`{ }` on the line of the entity, however it is written: `{}`, `{   }`, and
braces on different lines all declare the entity without attributes. The form
`{ }` is the one of the other diagram types. [fixture:
attribute-blocks/empty-unified] [corpus fixture: er/gram-block-empty] [corpus
fixture: er/gram-block-empty-space] [corpus fixture:
er/gram-block-empty-line-feed] [corpus fixture: er/gram-block-blank-lines] A
block without attributes that holds a directive on the line of its braces keeps
the directive there, as written, and a block that holds a comment line or a
directive on a line of its own is printed as a block. [fixture:
attribute-blocks/empty-with-directive-kept] [fixture:
attribute-blocks/empty-with-comment-line-over-lines] [fixture:
attribute-blocks/empty-with-directive-line-over-lines]

The text that mermaid.js does not read, two backquotes with nothing between
them, is an item of the block where it lies between two attributes, before the
first, after the last, or alone: it stands on a line of its own, as written. A
run of such text with only whitespace between the units is one item. [fixture:
attribute-blocks/ignored-text-own-line] [fixture:
attribute-blocks/ignored-text-run-kept] [corpus fixture:
er/gram-empty-backquotes-between-attributes] [corpus fixture:
er/gram-empty-backquotes-twice] A directive on the line of the `}`, before it,
stays there as written, and one after it keeps the whitespace written before it.
[fixture: attribute-blocks/directive-on-closing-line-kept] [fixture:
attribute-blocks/directive-after-closing-brace-kept] Comment lines and empty
lines in a block are handled as in any block (see [Comments](#comments) and
[Blank lines](#blank-lines)). [fixture:
attribute-blocks/comment-lines-and-blank-lines]

Input
([attribute-blocks/split-input.mmd](../tests/fixtures/er/attribute-blocks/split-input.mmd)):

```mmd
erDiagram
CAR{
string registrationNumber PK
        string make
}
PERSON { string firstName string lastName }
HOUSE {string address
int number}
```

Output
([attribute-blocks/split-output.mmd](../tests/fixtures/er/attribute-blocks/split-output.mmd)):

```mmd
erDiagram
  CAR {
    string registrationNumber PK
    string make
  }
  PERSON {
    string firstName
    string lastName
  }
  HOUSE {
    string address
    int number
  }
```

Input
([attribute-blocks/ignored-text-own-line-input.mmd](../tests/fixtures/er/attribute-blocks/ignored-text-own-line-input.mmd)):

```mmd
erDiagram
A { int a `` string b }
B {
``
}
C {
`` int c
}
D {
int d ``
}
```

Output
([attribute-blocks/ignored-text-own-line-output.mmd](../tests/fixtures/er/attribute-blocks/ignored-text-own-line-output.mmd)):

```mmd
erDiagram
  A {
    int a
    ``
    string b
  }
  B {
    ``
  }
  C {
    ``
    int c
  }
  D {
    int d
    ``
  }
```

Input
([attribute-blocks/directive-on-closing-line-kept-input.mmd](../tests/fixtures/er/attribute-blocks/directive-on-closing-line-kept-input.mmd)):

```mmd
erDiagram
A {
int a
%%{init: {}}%% }
```

Output
([attribute-blocks/directive-on-closing-line-kept-output.mmd](../tests/fixtures/er/attribute-blocks/directive-on-closing-line-kept-output.mmd)):

```mmd
erDiagram
  A {
    int a
  %%{init: {}}%% }
```

### Attribute spacing

An attribute is printed on one line: its type, its name, its keys, and its
comment, with one space between them, and a run of spaces or tabs between two
parts becomes one space. [fixture: attribute-spacing/parts-collapsed] The parts
are not aligned in columns: aligning would change every line of a block when one
attribute changes, the width of a name cannot be counted in characters, and the
examples in the documentation of mermaid.js are not aligned either. The one
space, and the `?` touching its type, are the form of those examples. The `?` of
an optional type touches the type, however it was written. [fixture:
attribute-spacing/optional-touching] The keys are separated by a `,` followed by
one space, with no space before it, and keep the case in which they are written,
since the Db keeps it. [fixture: attribute-spacing/keys-comma-space] [fixture:
attribute-spacing/keys-case-kept] A comment stands after one space, also where
it was written touching its name or its keys. [fixture:
attribute-spacing/comment-one-space] The text of a type or a name is kept as
written: the whitespace inside a tilde word or a backquoted word is part of the
type, and so is the text of a comment. [fixture:
attribute-spacing/tilde-word-kept] [fixture:
attribute-spacing/backquoted-word-kept]

An attribute written over several lines is printed on one, since the attribute
block is read without regard to line breaks. [fixture:
attribute-spacing/over-lines-joined] [corpus fixture:
er/gram-attribute-split-lines] [corpus fixture: er/gram-name-then-key-next-line]
An attribute with a comment line between its parts is kept as written, since the
comment line must stand on a line of its own. [fixture:
attribute-spacing/comment-line-inside-kept] A directive between the parts of an
attribute stays where it is, with the whitespace written on each side of it, and
a directive on a line of its own between two attributes stays between them. A
directive between two attributes written on the same line moves with the
attribute after it to the line after, since each attribute stands on a line of
its own. [fixture: attribute-spacing/directive-between-attributes-on-a-line]
[fixture: attribute-spacing/directive-inside-kept] [fixture:
attribute-spacing/directive-and-line-break-kept]

Input
([attribute-spacing/keys-comma-space-input.mmd](../tests/fixtures/er/attribute-spacing/keys-comma-space-input.mmd)):

```mmd
erDiagram
A {
int a PK,FK
int b PK , FK
int c UK  ,  PK  ,  FK
}
```

Output
([attribute-spacing/keys-comma-space-output.mmd](../tests/fixtures/er/attribute-spacing/keys-comma-space-output.mmd)):

```mmd
erDiagram
  A {
    int a PK, FK
    int b PK, FK
    int c UK, PK, FK
  }
```

Input
([attribute-spacing/optional-touching-input.mmd](../tests/fixtures/er/attribute-spacing/optional-touching-input.mmd)):

```mmd
erDiagram
A {
string? a
string  ?  b
`x` ? c
List~int~ ? d
}
```

Output
([attribute-spacing/optional-touching-output.mmd](../tests/fixtures/er/attribute-spacing/optional-touching-output.mmd)):

```mmd
erDiagram
  A {
    string? a
    string? b
    `x`? c
    List~int~? d
  }
```

Input
([attribute-spacing/over-lines-joined-input.mmd](../tests/fixtures/er/attribute-spacing/over-lines-joined-input.mmd)):

```mmd
erDiagram
A {
int
  a
int b
  PK
int c PK ,
 FK
int d
"comment"
}
```

Output
([attribute-spacing/over-lines-joined-output.mmd](../tests/fixtures/er/attribute-spacing/over-lines-joined-output.mmd)):

```mmd
erDiagram
  A {
    int a
    int b PK
    int c PK, FK
    int d "comment"
  }
```

### Statements one per line

Nothing separates two statements of an ER diagram, and mermaid.js reads
statements that follow one another on a line. A line of two statements is hard
to read, and a flowchart, a sequence diagram, a class diagram, and a state
diagram print one statement on a line too. Each statement is printed on a line
of its own: `A B` is the entities A and B, a relationship stands on one line and
the entity after its role on the next, and a statement that follows the `}` of
an attribute block, the `end` of a subgraph, or the header stands on the line
after it. [fixture: statements-one-per-line/entities] [fixture:
statements-one-per-line/relationships] [fixture:
statements-one-per-line/role-then-entity] [fixture:
statements-one-per-line/subgraph-end-then-entity] [fixture:
statements-one-per-line/class-and-accessibility] [fixture:
statements-one-per-line/header-line] [fixture:
statements-one-per-line/header-line-spaces] [corpus fixture:
er/gram-two-relationships-one-line] [corpus fixture: er/lex-role-then-name] An
empty description block, which changes nothing, is a statement of its own
wherever a statement starts, and is printed on a line of its own. [fixture:
statements-one-per-line/empty-description-blocks] [corpus fixture:
er/gram-empty-description-block-between-names] A directive between two
statements stands with the statement after it. [fixture:
statements-one-per-line/directive-after-statement]

Two cases keep their statements on one line. The entity `1` followed right after
by another statement or by the `end` of its subgraph, with no whitespace between
them or with only directives, stays as it is: `1a` is the entities `1` and `a`,
while `1` and a letter on two lines, or with whitespace between them, are the
cardinality `only-one` and a name (diagrams/er.md, The cardinalities, numbers,
and relationship lines, rule 11). Any other number is split from the statement
after it. The line of such an entity is printed as written, and so is a subgraph
that ends on it, from its header to its `end`, without the indentation of a
level for its lines. [fixture:
statements-one-per-line/number-name-then-name-kept] [fixture:
statements-one-per-line/number-name-in-subgraph-kept] [fixture:
statements-one-per-line/number-name-before-end-kept] [fixture:
statements-one-per-line/number-name-before-directive-kept] [fixture:
statements-one-per-line/number-name-then-name-split] [corpus fixture:
er/lex-name-number-then-letter] And a line that holds a `;` keeps its statements
together: the line rule of mermaid.js reads the text of a line, and moving text
to another line changes which line matches the rule and which `;` it ignores
(see [Styles and classes](#styles-and-classes)). [fixture:
statements-one-per-line/semicolon-line-kept] [fixture:
statements-one-per-line/ignored-semicolon-line-kept] The `}` of an attribute
block or the `end` of a subgraph on such a line, with a statement after it on
the line, would go to a line of its own and leave the statement on a line
without the `;`, so it stays on the line, which is printed with the whitespace
between its tokens as usual. Where no statement follows it, it stands on a line
of its own, as in any block. [fixture:
statements-one-per-line/semicolon-line-block-kept] [fixture:
statements-one-per-line/semicolon-line-subgraph-end-kept]

Input
([statements-one-per-line/entities-input.mmd](../tests/fixtures/er/statements-one-per-line/entities-input.mmd)):

```mmd
erDiagram
A B C
D:::c E[Entity] F { int f } G
```

Output
([statements-one-per-line/entities-output.mmd](../tests/fixtures/er/statements-one-per-line/entities-output.mmd)):

```mmd
erDiagram
  A
  B
  C
  D:::c
  E[Entity]
  F {
    int f
  }
  G
```

Input
([statements-one-per-line/relationships-input.mmd](../tests/fixtures/er/statements-one-per-line/relationships-input.mmd)):

```mmd
erDiagram
A ||--o{ B : x C ||--o{ D : y
E }|..|{ F : "z" G
```

Output
([statements-one-per-line/relationships-output.mmd](../tests/fixtures/er/statements-one-per-line/relationships-output.mmd)):

```mmd
erDiagram
  A ||--o{ B : x
  C ||--o{ D : y
  E }|..|{ F : "z"
  G
```

Input
([statements-one-per-line/number-name-then-name-kept-input.mmd](../tests/fixtures/er/statements-one-per-line/number-name-then-name-kept-input.mmd)):

```mmd
erDiagram
1a
1"x"
B
12a
```

Output
([statements-one-per-line/number-name-then-name-kept-output.mmd](../tests/fixtures/er/statements-one-per-line/number-name-then-name-kept-output.mmd)):

```mmd
erDiagram
  1a
  1"x"
  B
  12
  a
```

### Blank lines

As in a class diagram: a run of empty lines becomes one, and empty lines at the
start and the end of the diagram, of an attribute block, and of a subgraph are
dropped. [fixture: blank-lines/collapsed] [fixture:
blank-lines/block-edges-dropped] [fixture:
blank-lines/header-and-end-of-text-dropped] [fixture:
blank-lines/between-attributes-collapsed] [fixture:
blank-lines/around-comment-and-directive-lines]

Input
([blank-lines/block-edges-dropped-input.mmd](../tests/fixtures/er/blank-lines/block-edges-dropped-input.mmd)):

```mmd
erDiagram
A {


int a

int b


}
subgraph S


B

C


end
```

Output
([blank-lines/block-edges-dropped-output.mmd](../tests/fixtures/er/blank-lines/block-edges-dropped-output.mmd)):

```mmd
erDiagram
  A {
    int a

    int b
  }
  subgraph S
    B

    C
  end
```

Input
([blank-lines/between-attributes-collapsed-input.mmd](../tests/fixtures/er/blank-lines/between-attributes-collapsed-input.mmd)):

```mmd
erDiagram
A {
int a


int b
}
```

Output
([blank-lines/between-attributes-collapsed-output.mmd](../tests/fixtures/er/blank-lines/between-attributes-collapsed-output.mmd)):

```mmd
erDiagram
  A {
    int a

    int b
  }
```

### Whitespace between tokens

Within a line, a run of spaces and tabs between two tokens becomes one space,
and tokens that touch keep touching, unless a rule below says otherwise.
[fixture: whitespace-between-tokens/collapsed] [fixture:
whitespace-between-tokens/touching-kept] Keywords keep the case in which they
are written. mermaid.js reads them in any case, so the case is the author's and
the printer does not rewrite it; the keys of an attribute keep it in the Db.
[fixture: whitespace-between-tokens/keyword-case-kept]

Input
([whitespace-between-tokens/touching-kept-input.mmd](../tests/fixtures/er/whitespace-between-tokens/touching-kept-input.mmd)):

```mmd
erDiagram
A:::c
p[P]
accDescr{ D }
A ||--u-B : x
1one to one B : x
```

Output
([whitespace-between-tokens/touching-kept-output.mmd](../tests/fixtures/er/whitespace-between-tokens/touching-kept-output.mmd)):

```mmd
erDiagram
  A:::c
  p[P]
  accDescr{ D }
  A ||--u-B : x
  1one to one B : x
```

Input
([whitespace-between-tokens/keyword-case-kept-input.mmd](../tests/fixtures/er/whitespace-between-tokens/keyword-case-kept-input.mmd)):

```mmd
erDiagram
SUBGRAPH S
A
END
CLASSDEF a fill:red
CLASS A a
STYLE A fill:red
DIRECTION lr
ACCTITLE: T
ACCDESCR: D
ACCDESCR { D }
A ONE OR MORE TO MANY B : x
A {
int a PK
}
```

Output
([whitespace-between-tokens/keyword-case-kept-output.mmd](../tests/fixtures/er/whitespace-between-tokens/keyword-case-kept-output.mmd)):

```mmd
erDiagram
  SUBGRAPH S
    A
  END
  CLASSDEF a fill:red
  CLASS A a
  STYLE A fill:red
  DIRECTION lr
  ACCTITLE: T
  ACCDESCR: D
  ACCDESCR { D }
  A ONE OR MORE TO MANY B : x
  A {
    int a PK
  }
```

### Relationship spacing

A relationship has one space between the left entity and the relationship,
between the relationship and the right entity, and on each side of the `:` of
its role, however it was written: this is the form of the documentation of
mermaid.js, and the role may be a name, a string, or a quoted name alike.
[fixture: relationship-spacing/around-units-and-role] [fixture:
relationship-spacing/names-and-classes] [fixture:
relationship-spacing/role-forms] [corpus fixture: er/lex-relationship-no-spaces]
[corpus fixture: er/lex-colon-no-space] The classes of an entity touch their
`:::` and the `,` between them. [fixture:
relationship-spacing/names-and-classes]

The three units of the relationship, the cardinality on each side and the line
between them, touch each other where both are written with symbols, and are
separated by one space where either is written with a word, since the examples
in the documentation of mermaid.js write symbols touching and words apart, and
one rule keeps both: `A || -- o{ B` is printed `A ||--o{ B`, and
`A ||--only one B` is printed `A ||-- only one B`. [fixture:
relationship-spacing/symbols-touch] [fixture: relationship-spacing/words-spaced]
[fixture: relationship-spacing/symbols-and-words] [corpus fixture:
er/lex-relationship-spaces-in-spec] `many(0)`, `many(1)`, `1+`, `0+`, and `u`
count as symbols: a space inside `many(0)` is rejected. [corpus fixture:
er/lex-many-space-before-parenthesis] The spelling of a cardinality is kept,
symbols or words, in the case in which it is written: it is the author's choice,
and a symbol has several words that read the same, so no spelling stands for
another. [fixture: relationship-spacing/words-spaced]

Three cases keep the whitespace as it is written, since another one would make
mermaid.js read other units. A right cardinality `u`, which is `md-parent` only
right before the name, touches the right entity. [fixture:
relationship-spacing/md-parent] [corpus fixture:
er/lex-md-parent-right-glued-name] The entity `1` touches a cardinality that
starts with a letter, a digit, or `_` where it was written so, since `1`
followed by one or more whitespace characters, line feeds included, and an ASCII
letter, `_`, `"`, `'`, or an ASCII digit is the cardinality `only-one`
(diagrams/er.md, The cardinalities, numbers, and relationship lines, rule 11).
[fixture: relationship-spacing/number-name-before-unit-kept] [corpus fixture:
er/lex-one-space-letter] And the entity `only` keeps the whitespace before a
cardinality that starts with `one`: `only one` with exactly one space is the
cardinality `only one` (rule 9), while a keyword of several words has exactly
one space between its words, so two spaces or a tab make `only` an entity
(diagrams/er.md, The statement context, keywords and what follows them).
[fixture: relationship-spacing/entity-only-before-one-kept] [corpus fixture:
er/lex-only-one-two-spaces] A directive between the units of a relationship
stays where it is, with the whitespace written on each side of it. [fixture:
relationship-spacing/directive-between-units-kept]

Input
([relationship-spacing/symbols-and-words-input.mmd](../tests/fixtures/er/relationship-spacing/symbols-and-words-input.mmd)):

```mmd
erDiagram
A one or more--|{ B : x
A one or more -- |{ B : x
A ||--only one B : x
A ||-- only one B : x
A ||to|| B : x
A || to || B : x
A 1 to 1 B : x
A many(0) to one B : x
```

Output
([relationship-spacing/symbols-and-words-output.mmd](../tests/fixtures/er/relationship-spacing/symbols-and-words-output.mmd)):

```mmd
erDiagram
  A one or more --|{ B : x
  A one or more --|{ B : x
  A ||-- only one B : x
  A ||-- only one B : x
  A || to || B : x
  A || to || B : x
  A 1 to 1 B : x
  A many(0) to one B : x
```

Input
([relationship-spacing/md-parent-input.mmd](../tests/fixtures/er/relationship-spacing/md-parent-input.mmd)):

```mmd
erDiagram
A u--o{ B : x
A ||--u-B : x
A ||--u.B : x
A u--u-B : x
A U..U-B : x
```

Output
([relationship-spacing/md-parent-output.mmd](../tests/fixtures/er/relationship-spacing/md-parent-output.mmd)):

```mmd
erDiagram
  A u--o{ B : x
  A ||--u-B : x
  A ||--u.B : x
  A u--u-B : x
  A U..U-B : x
```

Input
([relationship-spacing/words-spaced-input.mmd](../tests/fixtures/er/relationship-spacing/words-spaced-input.mmd)):

```mmd
erDiagram
A one or more   to   zero or more B : x
A only one to one B : x
A zero or one optionally to one or zero B : x
A ONE OR MORE TO MANY B : x
A many to one B : x
```

Output
([relationship-spacing/words-spaced-output.mmd](../tests/fixtures/er/relationship-spacing/words-spaced-output.mmd)):

```mmd
erDiagram
  A one or more to zero or more B : x
  A only one to one B : x
  A zero or one optionally to one or zero B : x
  A ONE OR MORE TO MANY B : x
  A many to one B : x
```

### Entities

The alias of an entity touches its name and has nothing inside its brackets, as
in most examples of the documentation of mermaid.js: `p [ Person ]` is printed
`p[Person]`. [fixture: entities/alias-tight] The classes after `:::` touch it,
and are separated by a `,` that touches the classes on both sides:
`A ::: c1 , c2` is printed `A:::c1,c2`. [fixture: entities/classes-tight]
[fixture: entities/alias-and-classes] The `{` of an attribute block stands after
one space (see [Attribute blocks](#attribute-blocks)). The names are kept as
written, quoted or not, numbers included. [fixture: entities/names-kept] A
directive between the parts of an entity keeps the whitespace written on each
side of it. [fixture: entities/directive-between-parts-kept]

Input
([entities/alias-tight-input.mmd](../tests/fixtures/er/entities/alias-tight-input.mmd)):

```mmd
erDiagram
p [ Person ]
p ["Per son"] {
int a
}
12 [ P ]
"A" [ B ]
p[Person]
```

Output
([entities/alias-tight-output.mmd](../tests/fixtures/er/entities/alias-tight-output.mmd)):

```mmd
erDiagram
  p[Person]
  p["Per son"] {
    int a
  }
  12[P]
  "A"[B]
  p[Person]
```

Input
([entities/classes-tight-input.mmd](../tests/fixtures/er/entities/classes-tight-input.mmd)):

```mmd
erDiagram
A ::: c1 , c2
"A B" ::: c
A:::é,b-c
B ::: d
```

Output
([entities/classes-tight-output.mmd](../tests/fixtures/er/entities/classes-tight-output.mmd)):

```mmd
erDiagram
  A:::c1,c2
  "A B":::c
  A:::é,b-c
  B:::d
```

### Subgraphs

The name of a subgraph stands after one space, and so does its title, in
brackets with nothing inside them; the names of the title are separated by one
space, also where they were written touching: mermaid.js joins them with one
space. [fixture: subgraphs/header-spacing] [fixture:
subgraphs/title-names-spaced] [fixture: subgraphs/quoted-and-number-ids] The
statements of the body stand one level deeper, and `end` stands on a line of its
own at the level of the subgraph, in the case in which it is written; a
statement that follows the `end` on its line stands on the line after it.
[fixture: subgraphs/end-on-the-line-of-a-statement] [fixture:
subgraphs/end-case-kept] [fixture: subgraphs/entity-after-end] A subgraph
without statements is printed with its `end` on the next line. [fixture:
subgraphs/empty]

Empty description blocks that follow the name or the title on the line of the
header are the first statements of the body, and stay on the line of the header,
as written. [fixture: subgraphs/header-description-blocks-kept] [corpus fixture:
er/gram-subgraph-header-blocks] Comments and directives on lines of their own in
a subgraph stand at the level of its statements, and a directive before `end` on
its line stays there. [fixture: subgraphs/directive-and-comment-lines]

Input
([subgraphs/title-names-spaced-input.mmd](../tests/fixtures/er/subgraphs/title-names-spaced-input.mmd)):

```mmd
erDiagram
subgraph S ["T 1"x]
A
end
subgraph U [a"b"]
B
end
subgraph V [12 3.5]
C
end
```

Output
([subgraphs/title-names-spaced-output.mmd](../tests/fixtures/er/subgraphs/title-names-spaced-output.mmd)):

```mmd
erDiagram
  subgraph S ["T 1" x]
    A
  end
  subgraph U [a "b"]
    B
  end
  subgraph V [12 3.5]
    C
  end
```

Input
([subgraphs/header-description-blocks-kept-input.mmd](../tests/fixtures/er/subgraphs/header-description-blocks-kept-input.mmd)):

```mmd
erDiagram
subgraph S accDescr {} accDescr {}
A
end
subgraph T [Title]   accDescr { }
B
end
subgraph U
accDescr {}
C
end
```

Output
([subgraphs/header-description-blocks-kept-output.mmd](../tests/fixtures/er/subgraphs/header-description-blocks-kept-output.mmd)):

```mmd
erDiagram
  subgraph S accDescr {} accDescr {}
    A
  end
  subgraph T [Title] accDescr {}
    B
  end
  subgraph U
    accDescr {}
    C
  end
```

### Direction

A direction line is `direction` and its value, with the text that mermaid.js
does not read before and after them. The text is kept as written. One space
stands between it and `direction`, where they were written apart, and between
`direction` and the value; the value is kept in the case in which it is written,
since the case is the author's. [fixture: direction/spacing] [fixture:
direction/text-kept] [fixture: direction/case-kept] A value written on a later
line is printed after `direction` on one line. [fixture:
direction/value-on-next-line-joined] [corpus fixture:
er/lex-direction-value-next-line] A direction line with a directive or a comment
line inside is kept as written. [fixture:
direction/directive-and-comment-line-kept]

Input
([direction/text-kept-input.mmd](../tests/fixtures/er/direction/text-kept-input.mmd)):

```mmd
erDiagram
x   direction  RL   y  z
A ||--o{ B : x direction LR
direction LR %% c
direction LR;
direction LRX
```

Output
([direction/text-kept-output.mmd](../tests/fixtures/er/direction/text-kept-output.mmd)):

```mmd
erDiagram
  x direction RL y  z
  A ||--o{ B : x direction LR
  direction LR %% c
  direction LR;
  direction LRX
```

Input
([direction/case-kept-input.mmd](../tests/fixtures/er/direction/case-kept-input.mmd)):

```mmd
erDiagram
DIRECTION lr
Direction Tb
```

Output
([direction/case-kept-output.mmd](../tests/fixtures/er/direction/case-kept-output.mmd)):

```mmd
erDiagram
  DIRECTION lr
  Direction Tb
```

### Styles and classes

The names of a `classDef` statement, and the entities and classes of a `class`
and a `style` statement, are separated by a `,` that touches the names on both
sides: `classDef a ,b ,  c fill:red` is printed `classDef a,b,c fill:red`.
[fixture: styles-and-classes/class-def-names] [fixture:
styles-and-classes/style-names] [fixture: styles-and-classes/class-lists] The
first style stands after one space. The whitespace inside a style is printed as
written: mermaid.js joins the texts of a style and drops the whitespace between
them, so `stroke-dasharray: 5 5` is the style `stroke-dasharray:55`, and the
whitespace stays where the author put it, as in `stroke-dasharray:  5    5`.
[fixture: styles-and-classes/styles-as-written] [fixture:
styles-and-classes/style-inner-whitespace-kept] The whitespace around a `,`
between two styles is a run of whitespace between tokens, and becomes one space:
`style id2   fill:red   ,   stroke:blue` is printed
`style id2 fill:red , stroke:blue`. [fixture:
styles-and-classes/styles-as-written] The keywords keep their case. [fixture:
styles-and-classes/keyword-case-kept]

A `classDef` or `style` statement written over lines, with whitespace after a
keyword or a name that takes the line break, is printed on one line. [fixture:
styles-and-classes/over-lines-joined] Whitespace at the end of the last style
takes the line feed after it, and the next line goes on in the style:
`classDef a fill:red `, a line break, and `A` define the style `fill:redA` and
no entity A. So such a statement is kept as written, with the whitespace and the
line that it takes, and the line stays at the column written. Joining the two
lines (`classDef a fill:red A`) would give the same Db and would show how
mermaid.js reads them, but it removes the whitespace that the author wrote, and
the printer does not interpret the statement. [fixture:
styles-and-classes/trailing-whitespace-takes-next-line] [fixture:
styles-and-classes/directive-before-next-line] [fixture:
styles-and-classes/comment-line-inside-kept] [corpus fixture:
er/lex-classdef-space-before-line-feed] [corpus fixture:
er/lex-style-tab-before-line-feed]

The `;` that ends a `classDef` or `style` statement is kept as written, with
whatever lies between it and the last style, and so is a `;` that the line rule
of mermaid.js ignores: the rule removes the last `;` of a line that holds
`style`, a `:` and a `#` after it, from the text before mermaid.js reads it, so
the lines that hold it keep their statements, and the `;` stays. [fixture:
styles-and-classes/ending-semicolon-kept] [fixture:
styles-and-classes/ignored-semicolon-kept] [corpus fixture:
er/lex-classdef-semicolon-line-feed] [corpus fixture:
er/lex-classdef-ignored-semicolon] The rule ignores the `;` only when no
whitespace lies between the `:` and the `#`, so that whitespace stays as
written: `style A fill: #f00;` keeps its space. [fixture:
styles-and-classes/space-after-colon-before-hash-kept]

Input
([styles-and-classes/class-def-names-input.mmd](../tests/fixtures/er/styles-and-classes/class-def-names-input.mmd)):

```mmd
erDiagram
classDef a ,b ,  c fill:red
classDef default fill:#f9f,stroke-width:4px
```

Output
([styles-and-classes/class-def-names-output.mmd](../tests/fixtures/er/styles-and-classes/class-def-names-output.mmd)):

```mmd
erDiagram
  classDef a,b,c fill:red
  classDef default fill:#f9f,stroke-width:4px
```

Input
([styles-and-classes/styles-as-written-input.mmd](../tests/fixtures/er/styles-and-classes/styles-as-written-input.mmd)):

```mmd
erDiagram
classDef a fill : #f9f , stroke:#333
style id1 fill:#bbf,stroke:#f66,stroke-dasharray: 5 5
style  id2   fill:red   ,   stroke:blue
```

Output
([styles-and-classes/styles-as-written-output.mmd](../tests/fixtures/er/styles-and-classes/styles-as-written-output.mmd)):

```mmd
erDiagram
  classDef a fill : #f9f , stroke:#333
  style id1 fill:#bbf,stroke:#f66,stroke-dasharray: 5 5
  style id2 fill:red , stroke:blue
```

Input
([styles-and-classes/ending-semicolon-kept-input.mmd](../tests/fixtures/er/styles-and-classes/ending-semicolon-kept-input.mmd)):

```mmd
erDiagram
classDef a fill:red;
A
classDef b fill:red ;
B
style C fill:blue;
style D fill:blue%%{init: {}}%%;
```

Output
([styles-and-classes/ending-semicolon-kept-output.mmd](../tests/fixtures/er/styles-and-classes/ending-semicolon-kept-output.mmd)):

```mmd
erDiagram
  classDef a fill:red;
  A
  classDef b fill:red ;
  B
  style C fill:blue;
  style D fill:blue%%{init: {}}%%;
```

### Accessibility statements

The `:` of `accTitle` and `accDescr` touches the keyword and has one space after
it; the text is without the whitespace at its ends. [fixture:
accessibility-statements/title-and-description] A text written on a later line
is printed after the `:` on one line, and a comment line before it makes the
statement kept as written. [fixture:
accessibility-statements/text-on-next-line-joined] [fixture:
accessibility-statements/text-with-comment-line-kept] [corpus fixture:
er/lex-acc-title-line-feed-after-colon]

The lines of an `accDescr { ... }` block are kept as written by choice, not by
need: the whitespace at the start of a line is not in the Db (`a`, a line break,
and `b` give the same description as with `  b`), and the lines are the text of
the author, which the printer does not format. Its `}` stands at the level of
its statement; a text on the line of the `{` has one space inside the braces
where it was written apart. [fixture: accessibility-statements/block-lines-kept]
[fixture: accessibility-statements/block-comment-and-empty-lines-kept] [fixture:
accessibility-statements/block-text-on-opening-line] An empty block is a
statement of its own that keeps any prior description in the Db. It prints `{}`
internally: `accDescr { }` becomes `accDescr {}`, including whitespace runs,
line breaks and an NBSP-only interior. An already empty interior stays empty,
and `accDescr{}` stays touching. No text needs surrounding whitespace, so the
Db-equal choice follows
[flowchart's accessibility lines](./flowchart.md#accessibility-lines), agentflow
and usecase. [test: accessibility revisions: er empty-description-nbsp] Blocks
with comments or directives retain their previous layout. [fixture:
accessibility-statements/empty-blocks] [fixture:
accessibility-statements/empty-block-with-directive-or-comment-line] [corpus
fixture: er/gram-acc-descr-block-empty]

The lexer reads a line as a direction line before it reads the statements that
follow it, but after `accTitle` and `accDescr`: `accTitle: direction LR` at the
first column is a title, and after an indentation it is a direction line with
the text `accTitle:` before `direction`. So an `accTitle`, `accDescr:` or
`accDescr {` statement whose first printed line holds `direction`, one or more
whitespace characters, line feeds included, and one of `TB`, `BT`, `RL`, and
`LR`, in any case, keeps the first column, also in a subgraph, as the lexer
reads a direction line (diagrams/er.md, The direction line). The line is judged
as the lexer reads it, without the directives, which mermaid.js removes before
the lexer reads the text: `dir%%{init: {}}%%ection LR` is `direction LR`, and a
directive between `direction` and the value is no whitespace, so
`direction%%{init: {}}%%LR` is `directionLR` and not a direction line. The value
needs no word boundary after it, and may stand on a later line, which the
statement does not hold. The first printed line is the one that counts: a text
written on a later line is brought to the `:` (see
[Multi-line statements](#multi-line-statements)), so `accTitle:`, a line break,
and `direction LR` are printed `accTitle: direction LR` at the first column. The
comment lines and the directives between `direction` and the value are skipped,
as the lexer reads the text without them (diagrams/er.md, Trivia between units),
and so are empty lines. Where no direction follows, the statement is indented as
any other. [fixture: accessibility-statements/first-column-for-direction-text]
[fixture: accessibility-statements/first-column-direction-case-insensitive]
[fixture: accessibility-statements/first-column-value-touching-text] [fixture:
accessibility-statements/first-column-tab-before-value] [fixture:
accessibility-statements/first-column-value-on-next-line] [fixture:
accessibility-statements/first-column-value-after-comment-line] [fixture:
accessibility-statements/first-column-value-after-directive-line] [fixture:
accessibility-statements/first-column-value-after-blank-line] [fixture:
accessibility-statements/first-column-text-brought-to-the-colon] [fixture:
accessibility-statements/first-column-text-brought-to-the-colon-in-subgraph]
[fixture: accessibility-statements/first-column-directive-inside-direction]
[fixture:
accessibility-statements/first-column-directive-over-lines-before-direction]
[fixture:
accessibility-statements/indented-when-directive-takes-the-space-before-value]
[fixture:
accessibility-statements/first-column-block-directive-inside-direction]
[fixture:
accessibility-statements/first-column-block-directive-over-lines-before-direction]
[fixture:
accessibility-statements/indented-block-when-directive-takes-the-space-before-value]
[fixture:
accessibility-statements/first-column-description-directive-over-lines-before-direction]
[fixture: accessibility-statements/indented-when-no-direction-follows] [fixture:
accessibility-statements/direction-text-on-later-line-indented] [corpus fixture:
er/lex-acc-title-direction] [corpus fixture: er/lex-acc-descr-block-direction]
[corpus fixture: er/lex-direction-lower-case] [corpus fixture:
er/lex-direction-value-glued] [corpus fixture: er/lex-direction-value-tab]
[corpus fixture: er/lex-direction-value-next-line]

Input
([accessibility-statements/text-on-next-line-joined-input.mmd](../tests/fixtures/er/accessibility-statements/text-on-next-line-joined-input.mmd)):

```mmd
erDiagram
accTitle:
T
accDescr:

  D
```

Output
([accessibility-statements/text-on-next-line-joined-output.mmd](../tests/fixtures/er/accessibility-statements/text-on-next-line-joined-output.mmd)):

```mmd
erDiagram
  accTitle: T
  accDescr: D
```

Input
([accessibility-statements/block-lines-kept-input.mmd](../tests/fixtures/er/accessibility-statements/block-lines-kept-input.mmd)):

```mmd
erDiagram
accDescr {
  one
    two
      }
subgraph S
accDescr {
  three
}
end
```

Output
([accessibility-statements/block-lines-kept-output.mmd](../tests/fixtures/er/accessibility-statements/block-lines-kept-output.mmd)):

```mmd
erDiagram
  accDescr {
  one
    two
  }
  subgraph S
    accDescr {
  three
    }
  end
```

Input
([accessibility-statements/first-column-for-direction-text-input.mmd](../tests/fixtures/er/accessibility-statements/first-column-for-direction-text-input.mmd)):

```mmd
erDiagram
accTitle: direction LR
accDescr: a direction TB
accDescr { direction RL }
subgraph S
accTitle: direction BT
A
end
```

Output
([accessibility-statements/first-column-for-direction-text-output.mmd](../tests/fixtures/er/accessibility-statements/first-column-for-direction-text-output.mmd)):

```mmd
erDiagram
accTitle: direction LR
accDescr: a direction TB
accDescr { direction RL }
  subgraph S
accTitle: direction BT
    A
  end
```

### Comments

A comment line, `%%` at the start of a line, stands at the level of the
statements around it, and its text is kept as written; this diagram has no other
comment (diagrams/er.md, Comments). [fixture: comments/kept] [fixture:
comments/in-blocks] [fixture: comments/last-in-body] [fixture:
comments/text-kept] A comment line before the header stands at the first column.
[fixture: comments/before-header] A comment line at the end of the text stays on
a line of its own, with the line break added. [fixture:
comments/after-last-statement-without-line-break] [fixture:
comments/after-header-without-line-break]

Input
([comments/in-blocks-input.mmd](../tests/fixtures/er/comments/in-blocks-input.mmd)):

```mmd
erDiagram
A {
%% c1
int a
      %% c2
}
subgraph S
%% c3
B
%% c4
end
```

Output
([comments/in-blocks-output.mmd](../tests/fixtures/er/comments/in-blocks-output.mmd)):

```mmd
erDiagram
  A {
    %% c1
    int a
    %% c2
  }
  subgraph S
    %% c3
    B
    %% c4
  end
```

Input
([comments/last-in-body-input.mmd](../tests/fixtures/er/comments/last-in-body-input.mmd)):

```mmd
erDiagram
A
%% c1

%% c2
```

Output
([comments/last-in-body-output.mmd](../tests/fixtures/er/comments/last-in-body-output.mmd)):

```mmd
erDiagram
  A
  %% c1

  %% c2
```

### Directives

A directive on a line of its own stands at the level of the statements around
it, and a directive within a printed line keeps whether whitespace is written on
each side of it: where it is, one space stands there, and where it touches a
token, it keeps touching. [fixture: directives/kept] [fixture:
directives/before-header] [fixture: directives/after-header-on-same-line]
[fixture: directives/after-header-touching-kept] [fixture:
directives/whitespace-on-both-sides-collapsed] [fixture:
directives/touching-one-side-kept] [fixture:
directives/after-statement-at-end-of-line] [fixture: directives/in-blocks] A
directive that is not closed takes the rest of the text, and is kept as written.
[fixture: directives/unclosed-at-end-of-text-kept] [fixture:
directives/unclosed-after-statement-kept]

When formatting splits units that were on the same line, a directive in their
gap moves with the following unit. Keep its right-side contact or separation;
break its left contact.

[fixture: er/directives/whitespace-on-both-sides-collapsed]

Input
([directives/kept-input.mmd](../tests/fixtures/er/directives/kept-input.mmd)):

```mmd
erDiagram
%%{init: {'theme': 'dark'}}%%
A
    %%{wrap}%%
B
```

Output
([directives/kept-output.mmd](../tests/fixtures/er/directives/kept-output.mmd)):

```mmd
erDiagram
  %%{init: {'theme': 'dark'}}%%
  A
  %%{wrap}%%
  B
```

Input
([directives/touching-one-side-kept-input.mmd](../tests/fixtures/er/directives/touching-one-side-kept-input.mmd)):

```mmd
erDiagram
A %%{init: {}}%%||--o{ B : x
A||--o{ %%{init: {}}%%B : y
```

Output
([directives/touching-one-side-kept-output.mmd](../tests/fixtures/er/directives/touching-one-side-kept-output.mmd)):

```mmd
erDiagram
  A %%{init: {}}%%||--o{ B : x
  A ||--o{ %%{init: {}}%%B : y
```

Input
([directives/whitespace-on-both-sides-collapsed-input.mmd](../tests/fixtures/er/directives/whitespace-on-both-sides-collapsed-input.mmd)):

```mmd
erDiagram
A   %%{init: {}}%%    ||--o{ B : x
C  %%{init: {}}%%  D
```

Output
([directives/whitespace-on-both-sides-collapsed-output.mmd](../tests/fixtures/er/directives/whitespace-on-both-sides-collapsed-output.mmd)):

```mmd
erDiagram
  A %%{init: {}}%% ||--o{ B : x
  C
  %%{init: {}}%% D
```

### Frontmatter YAML

As in a flowchart: the YAML between the `---` lines is formatted with Prettier's
YAML formatter, and the `---` lines are kept as written, with the spaces and
tabs at the end of each. [fixture: frontmatter-yaml/formatted] [fixture:
frontmatter-yaml/config-formatted] [fixture:
frontmatter-yaml/closing-delimiter-whitespace-kept] The YAML is kept as written
when Prettier cannot read it, when the `---` lines are indented, and when a line
of the formatted YAML would be a `---` line, and also when it holds a `<`
followed by a letter, a digit, or `_`, where changing the quotes could change
what mermaid.js reads. [fixture: frontmatter-yaml/malformed-kept] [fixture:
frontmatter-yaml/indented-delimiters-kept] [fixture:
frontmatter-yaml/delimiter-line-kept] [fixture: frontmatter-yaml/html-tag-kept]
[fixture: frontmatter-yaml/less-than-before-other-formatted] A comment line
between the frontmatter and the header is kept. [fixture:
frontmatter-yaml/comment-after-frontmatter-before-header]

Input
([frontmatter-yaml/formatted-input.mmd](../tests/fixtures/er/frontmatter-yaml/formatted-input.mmd)):

```mmd
---
title:   T
---
erDiagram
A
```

Output
([frontmatter-yaml/formatted-output.mmd](../tests/fixtures/er/frontmatter-yaml/formatted-output.mmd)):

```mmd
---
title: T
---
erDiagram
  A
```

Input
([frontmatter-yaml/delimiter-line-kept-input.mmd](../tests/fixtures/er/frontmatter-yaml/delimiter-line-kept-input.mmd)):

```mmd
---
%YAML 1.2
--- !!map
title: x
---
erDiagram
A
```

Output
([frontmatter-yaml/delimiter-line-kept-output.mmd](../tests/fixtures/er/frontmatter-yaml/delimiter-line-kept-output.mmd)):

```mmd
---
%YAML 1.2
--- !!map
title: x
---
erDiagram
  A
```

### Multi-line values

A role in quotes, the comment of an attribute, and a backquoted word written
over several lines are kept as written, with the line breaks and the whitespace
inside, since they are part of the value. [fixture:
multi-line-values/role-string-kept] [fixture:
multi-line-values/attribute-strings-kept] [corpus fixture:
er/lex-role-string-line-feed] [corpus fixture: er/lex-comment-line-feed] A
comment line inside such a string is part of the string, which is kept as
written. [fixture: multi-line-values/comment-line-inside-string-kept] [corpus
fixture: er/tokens-comment-line-in-role-string] The lines of an `accDescr` block
are kept as written too (see
[Accessibility statements](#accessibility-statements)). [fixture:
multi-line-values/description-block-lines-kept]

Input
([multi-line-values/role-string-kept-input.mmd](../tests/fixtures/er/multi-line-values/role-string-kept-input.mmd)):

```mmd
erDiagram
A ||--o{ B : "line one
   line two"
C
```

Output
([multi-line-values/role-string-kept-output.mmd](../tests/fixtures/er/multi-line-values/role-string-kept-output.mmd)):

```mmd
erDiagram
  A ||--o{ B : "line one
   line two"
  C
```

Input
([multi-line-values/attribute-strings-kept-input.mmd](../tests/fixtures/er/multi-line-values/attribute-strings-kept-input.mmd)):

```mmd
erDiagram
A {
int a "line one
   line two"
`x
  y` b
}
```

Output
([multi-line-values/attribute-strings-kept-output.mmd](../tests/fixtures/er/multi-line-values/attribute-strings-kept-output.mmd)):

```mmd
erDiagram
  A {
    int a "line one
   line two"
    `x
  y` b
  }
```

### Multi-line statements

A statement that mermaid.js reads over several lines is printed on one line
where the line break is whitespace to the lexer: after the `:` of `accTitle` and
`accDescr`, between `direction` and its value, and in a `classDef` or `style`
statement after whitespace. [fixture:
multi-line-statements/accessibility-text-joined] [fixture:
multi-line-statements/direction-value-joined] [fixture:
multi-line-statements/style-over-lines-joined] A statement with a comment line
or a directive in it is kept as written, since the comment line would take the
rest of the line it stands on, and the whitespace of a line that holds a
directive is read with it. [fixture:
multi-line-statements/comment-line-inside-kept] [fixture:
multi-line-statements/directive-inside-kept]

Input
([multi-line-statements/accessibility-text-joined-input.mmd](../tests/fixtures/er/multi-line-statements/accessibility-text-joined-input.mmd)):

```mmd
erDiagram
accTitle:
T
accDescr:

 D
```

Output
([multi-line-statements/accessibility-text-joined-output.mmd](../tests/fixtures/er/multi-line-statements/accessibility-text-joined-output.mmd)):

```mmd
erDiagram
  accTitle: T
  accDescr: D
```

Input
([multi-line-statements/directive-inside-kept-input.mmd](../tests/fixtures/er/multi-line-statements/directive-inside-kept-input.mmd)):

```mmd
erDiagram
direction
%%{init: {}}%%
LR
accTitle:
%%{init: {}}%%
T
```

Output
([multi-line-statements/directive-inside-kept-output.mmd](../tests/fixtures/er/multi-line-statements/directive-inside-kept-output.mmd)):

```mmd
erDiagram
  direction
%%{init: {}}%%
LR
  accTitle:
%%{init: {}}%%
T
```

### Line separators

Whitespace that holds U+2028 or U+2029 is kept as written between tokens, and so
is a name that holds one: in an ER diagram they are characters of a name, except
where a rule reads whitespace itself. The characters are invisible, so the
examples are written as strings, in which `\u2028` is U+2028 and `\n` is a line
break. [test: U+2028 inside an entity name] [test: U+2029 inside a role name]
[test: U+2028 before the colon of a role] [test: U+2028 between direction and
its value] [test: U+2028 in the text after a direction] [test: U+2028 inside an
attribute name]
