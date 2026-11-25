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

The statements after the header stand one level deeper than the header, as
Prettier prints the body of a block one level deeper than the line that opens it
(the body of a function in JavaScript, the declarations of a rule in CSS). Rule
1 gives no form here, since the start of a line is no place that its table names
([rule 1](./printed-form.md#1-the-whitespace-beside-a-mark));
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have) gives
it, as [flowchart](./flowchart.md#indentation), [class](./class.md#indentation),
[state](./state.md#indentation), and [sequence](./sequence.md#indentation) put
the statements after the header one level deeper than the header.

[fixture: indentation/written-indentation-dropped]

The statements of a subgraph stand one level deeper than the line of the
subgraph, and its `end` stands on a line of its own at the level of that line,
also when it was written after a statement. Prettier puts the `}` that closes a
block at the level of the line that opens it, and
[flowchart](./flowchart.md#indentation) and [state](./state.md#indentation) put
the statements of a subgraph or of a composite state one level deeper than the
line that opens it, with `end` or `}` at the level of that line (rule 2, as
above); an `end` written after a statement goes to a line of its own, as under
[Statements one per line](#statements-one-per-line).

[fixture: indentation/nested-subgraphs] [fixture:
subgraphs/end-on-the-line-of-a-statement]

The attributes of an entity stand one level deeper than the line of the entity,
and its `}` stands at the level of that line, also in a subgraph. Rule 2 gives
it, as [class](./class.md#member-bodies) and
[requirement](./requirement.md#indentation) put the members of a body one level
deeper than the line of the class or of the requirement, with the `}` at the
level of that line.

[fixture: indentation/attribute-blocks-in-subgraphs]

A level is what Prettier's `useTabs` and `tabWidth` options say: two spaces by
default.

[fixture: indentation/tab-width-4] [fixture: indentation/use-tabs]

The indentation written in the input is not kept. Whitespace at the start of a
line is nothing to mermaid.js, so the printer chooses the indentation from the
structure alone, and one rule per level prints the same text whatever the input
was indented with.

[fixture: indentation/written-indentation-dropped]

The one exception is an `accTitle` or `accDescr` statement that holds a
direction, which keeps the first column, since the lexer reads it as a title or
a description at the first column and as a direction line after an indentation
(see [Accessibility statements](#accessibility-statements)).

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
    subgraph Inner[Title]
      B ||--o{ C : x
    end
    D
  end
  E
```

### Attribute blocks

The `{` of an attribute block stays on the line of the entity, after one space;
each attribute stands on a line of its own, one level deeper; and the `}` stands
on a line of its own at the level of the entity. Rule 1 gives the one space
before the `{` of a block (Prettier prints `function f(){}` as
`function f() {}`). The start of a line is no place of rule 1, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have) gives
the lines, as [class](./class.md#member-bodies),
[requirement](./requirement.md#bodies), and [state](./state.md#composite-states)
print the `{` of a body after one space on the line of its opener, also where it
was written touching it, and [class](./class.md#member-bodies),
[requirement](./requirement.md#indentation), and [state](./state.md#indentation)
put the members one level deeper on lines of their own and the `}` on a line of
its own at the level of the opener.

[fixture: attribute-blocks/opening-brace-after-one-space] [fixture:
attribute-blocks/split]

A block written on one line, or with its first attribute on the line of the `{`
or its last on the line of the `}`, is split so: mermaid.js reads the attribute
block without regard to line breaks, so it reads the same attributes.
[class](./class.md#member-bodies) and [state](./state.md#composite-states) split
a body written on one line in the same way (rule 2).

[fixture: attribute-blocks/split] [corpus fixture: er/gram-attributes-one-line]
[corpus fixture: er/gram-attribute-split-lines]

A statement that follows the `}` on its line stands on a line of its own, as
under [Statements one per line](#statements-one-per-line).

[fixture: attribute-blocks/entity-after-closing-brace] [corpus fixture:
er/gram-block-then-name-one-line]

The name, the alias, and the classes before the `{` are formatted as in
[Entities](#entities).

[fixture: attribute-blocks/alias-and-classes]

An empty block, with nothing but whitespace between its braces, is printed as
`{ }` on the line of the entity, however it is written: `{}`, `{   }`, and
braces on different lines all declare the entity without attributes. The
versions that were run accept `{}` for an entity, also in a subgraph, and give
`{ }` the same result: the one that rejects `{}` after an entity with a class,
`C:::c {}`, rejects `{ }` there as well. No version needs the space, so it has
no reason.

[fixture: attribute-blocks/empty-unified] [corpus fixture: er/gram-block-empty]
[corpus fixture: er/gram-block-empty-space] [corpus fixture:
er/gram-block-empty-line-feed] [corpus fixture: er/gram-block-blank-lines]

On a line that stays as written (see
[Statements one per line](#statements-one-per-line) and
[Multi-line statements](#multi-line-statements)), a block on one line stays as
written with the line. A block over several lines whose `}` stands on a line
that does not stay as written is printed as a block: the statements of the line
stay together on it, with the whitespace between their units formatted as usual
(except where it decides how mermaid.js reads the line, as the touching of `1`
and the next name, a whitespace character that is no space or tab, and the gaps
after `class`; and except on a line that a comment line joins, where the text up
to the `{` stays as written, see
[Multi-line statements](#multi-line-statements)), what follows the `{` on its
line stays as written in a nonempty block, and the attributes after it and the
`}` stand as those of any entity. An empty block over several lines ends the
line with ` { }`, whatever stands after the `{` (spaces, a tab, a U+2028) or
between the braces, but not where the `}` and the rest of the closing line would
join the line of the `{` and be read otherwise, so that its lines stay apart.
The line rule of mermaid.js (see
[Semicolons](#semicolons-at-the-end-of-a-style-statement)) ignores the last `;`
of a line that matches it, so in the joined line it can ignore another `;` than
in the two lines: in `"style:#x"; B {`, a line break, and `} A["x;y"]`, it
ignores the `;` after the string in the first line, and the `;` inside
`A["x;y"]` in the joined line, which leaves the first one a separator that
mermaid.js rejects. The lines join where the rule ignores the same `;` in both
ways, as in `"style:#x"; B {`, a line break, and `}`. And a `~` inside an
attribute block that stands before the `{` on its line, on a line that stays as
written, keeps the lines apart too: the oldest versions that count read the rest
of the line after such a `~` with a rule that takes the longer, the longer the
line is, so a line that they draw could become one that they do not draw. A `~`
in a name in quotes or in a directive is read by no such rule, and the lines
join: `A["x;~y"] B {`, a line break, and `}` are `A["x;~y"] B { }`. Where the
lines stay apart and only spaces, tabs, and line feeds stand between the braces,
the statement is printed as written up to and including the `{`, then one line
break and the `}` at the indentation of the entity: whitespace after a `{` that
ends its line and empty lines between the braces draw nothing, and Prettier
prints neither beside the braces of an empty block that was written over lines
(a CSS rule written as `a {`, two spaces, two empty lines, and `}` is printed as
`a {` and `}` on the next line;
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark)), and the `}` stands
at the level of the line that opens the block, as under
[Indentation](#indentation). Where a whitespace character that is no space or
tab (a U+00A0 or a U+2028, say) stands between the braces, the statement stays
as written, except that the `}` stands at the indentation of the entity where
only spaces and tabs precede it on its line. The block is printed so also where
the line of the `{` is printed as written with its statements on it (see
[A line that a `;` ends](./compatibility.md#a-line-that-a--ends)): the `}`
stands at the indentation of the entity, and where only spaces, tabs, and line
feeds stand between the braces, the spaces after the `{` and the empty lines
between the braces are dropped as everywhere else, since what keeps such a line
as written is the place of the `;` that the line rule ignores and of the U+2028
or U+2029 after it, or the place where the line is read, and the whitespace
after a `{` that ends its line, between the braces, and before a `}` on a later
line is no part of any of them. `"style:#x"; B {`, U+2029, a line break, four
spaces, and `} A["x;y"]` are printed with the `}` after the two spaces of the
entity, and `1a B {`, two spaces, two line breaks, and `} A["x;y"]` are printed
`1a B {`, a line break, and `} A["x;y"]` with the `}` there. A subgraph whose
`end` line stays as written is printed as written as a whole, and its lines keep
their written indentation, only the header standing at the indentation of the
block: the same holds for the empty blocks in its body, at any depth, with the
`}` at the written indentation of the line where the entity starts.

[test: an empty ER attribute block in a subgraph whose end line stays as
written, with spaces after its opening brace, an empty line, and four spaces
before its closing brace] [test: an empty ER attribute block in a subgraph whose
end line stays as written, after two spaces of indentation] [test: an empty ER
attribute block in a subgraph whose end line stays as written, in a subgraph
after a tab] [test: an empty ER attribute block in a subgraph whose end line
stays as written, with two empty blocks after a statement] [test: an empty ER
attribute block in a subgraph whose end line stays as written, and a block with
an attribute] [test: an empty ER attribute block in a subgraph whose end line
stays as written, and U+00A0 before the closing brace] [test: an empty ER
attribute block in a subgraph whose end line stays as written, after a directive
over two lines] [test: an empty ER attribute block in a subgraph whose end line
stays as written, after a comment line that joins its line to the line before]
[fixture:
attribute-blocks/written-line-empty-block-ignored-semicolon-both-lines]
[fixture:
attribute-blocks/written-line-empty-block-ignored-semicolon-closing-line-ends]
[fixture:
attribute-blocks/written-line-empty-block-ignored-semicolon-in-subgraph]
[fixture: attribute-blocks/empty-block-joined-where-the-lines-read-the-same]
[fixture: attribute-blocks/written-line-tilde-line] [fixture:
attribute-blocks/written-line-tilde-line-closing-remainder] [fixture:
attribute-blocks/empty-block-joined-where-the-tilde-is-not-in-an-attribute-block]
[fixture:
attribute-blocks/written-line-empty-block-tilde-attribute-on-a-semicolon-line]
[fixture:
attribute-blocks/written-line-empty-block-tilde-in-a-string-of-an-attribute]
[fixture:
attribute-blocks/written-line-empty-block-closing-brace-at-the-indentation-of-the-entity]
[fixture:
attribute-blocks/written-line-empty-block-spaces-after-the-brace-dropped]
[fixture: attribute-blocks/written-line-empty-block-tab-after-the-brace-dropped]
[fixture: attribute-blocks/written-line-empty-block-empty-line-dropped]
[fixture:
attribute-blocks/written-line-empty-block-whitespace-only-line-dropped]
[fixture:
attribute-blocks/written-line-empty-block-tilde-whitespace-and-empty-line-dropped]
[fixture:
attribute-blocks/written-line-empty-block-in-subgraph-whitespace-dropped] [test:
an empty ER attribute block that stays over several lines with U+00A0 after its
opening brace] [test: an empty ER attribute block that stays over several lines
with U+2028 after its opening brace] [test: an empty ER attribute block that
stays over several lines with a U+00A0 line between its braces] [test: an empty
ER attribute block that stays over several lines with U+2029 after its opening
brace, after a semicolon that the line rule ignores] [test: an empty ER
attribute block that stays over several lines with U+2028 on a line between its
braces, after a semicolon that the line rule ignores] [test: an empty ER
attribute block that stays over several lines with U+2029 after its opening
brace, after a semicolon that the line rule ignores, and four spaces before its
closing brace] [test: an empty ER attribute block that stays over several lines
with U+2029 after its opening brace, after a semicolon that the line rule
ignores, and a tab before its closing brace] [test: an empty ER attribute block
that stays over several lines with U+2028 after its opening brace, after a
semicolon that the line rule ignores, and U+00A0 before its closing brace]
[test: an empty ER attribute block that stays over several lines with spaces
after its opening brace and an empty line before its closing brace, after a
semicolon that the line rule ignores and U+2028] [test: an empty ER attribute
block that stays over several lines with U+2029 after its opening brace, after a
semicolon that the line rule ignores, in a subgraph] [test: an empty ER
attribute block that stays over several lines with U+2029 after its opening
brace, after a semicolon that the line rule ignores, before a closing line that
a semicolon ends] [test: an empty ER attribute block that stays over several
lines with U+2028 after its opening brace, after a tilde in an attribute block]
[test: an empty ER attribute block that stays over several lines with U+2029
after its opening brace, after a tilde in an attribute block] [test: an empty ER
attribute block that stays over several lines with U+2028 after its opening
brace, after a tilde in an attribute block, in a subgraph]

A block whose `}` stands on a line that stays as written, as in `A {`, a line
break, and `}1b`, stays as written with that line when it holds attributes; an
empty block is printed as above.

[fixture:
attribute-blocks/written-line-empty-block-closing-brace-on-a-line-read-by-its-place]
[fixture:
attribute-blocks/written-line-empty-block-spaces-and-empty-line-dropped-on-a-line-read-by-its-place]

No rule of [How the printed form is decided](./printed-form.md) gives the form
of what stays as written on such a line: the attributes of a block whose `}` it
holds, and a subgraph whose `end` it holds. The released forms stay until they
are decided (see
[Where none of these rules gives a form](./printed-form.md#4-where-none-of-these-rules-gives-a-form)).

A line that holds a `;` and stays as written for no other reason is formatted,
and so is the line of a subgraph header that holds an empty description block
and the line of an `accTitle` or `accDescr` whose text goes to the `:` and then
holds `direction`; the statements of such a line stay together on it. A block on
it is printed as a block. An attribute on the line of its `{` stays there where
that line is one of these lines: after one space where the source has whitespace
between the `{` and the attribute (a run of spaces and tabs becomes one space),
and touching the `{` where it touches it. The spaces and tabs after a `{` that
ends its line are dropped. A block written on one line stays on one line, with
one space before its `}` (`T {int a}` is `T {int a }`), except on a line that
holds a `;`, where its `}` goes to a line of its own.

[fixture: attribute-blocks/semicolon-line-spaces-after-brace] [fixture:
attribute-blocks/block-on-one-line-space-before-the-closing-brace] [fixture:
attribute-blocks/subgraph-header-line-spaces-after-brace] [fixture:
attribute-blocks/accessibility-line-spaces-after-brace] [fixture:
attribute-blocks/written-line-number-name] [fixture:
attribute-blocks/written-line-tilde-line] [fixture:
attribute-blocks/written-line-unclosed-directive] [fixture:
attribute-blocks/written-line-closing-brace] [fixture:
attribute-blocks/semicolon-line] [test: an empty attribute block over several
lines after a comment line after U+2028 inside the name of an ER entity] [test:
an empty attribute block on one line after a comment line after U+2028 inside
the name of an ER entity] [test: an empty attribute block on one line after a
comment line after U+2029 inside the name of an ER entity] [test: an empty
attribute block over several lines after a name in quotes and U+2028] [test: an
empty attribute block over several lines after a name in quotes and U+2029]
[test: an empty attribute block over several lines after a name in quotes and
U+2028 in a subgraph] [test: an empty attribute block with an empty line before
its closing brace after a name in quotes and U+2028] [test: an empty attribute
block with U+2028 after its opening brace after a name in quotes and U+2028]
[test: an empty attribute block on one line after a name in quotes and U+2028]
[test: an empty attribute block over several lines after U+2028 and class]
[test: an empty attribute block over several lines after a semicolon that the
line rule ignores and U+2028] [test: an empty attribute block with U+2028 after
its opening brace after a semicolon that the line rule ignores] [test: an empty
attribute block with U+2028 after its opening brace after the ER entity 1 that
touches a letter] [test: an attribute block over several lines after a name in
quotes and U+2028] [test: U+2028 and an attribute block after a name in quotes]
[test: an attribute block over several lines after U+2028 and class] [test: an
attribute block over several lines after a semicolon that the line rule ignores
and U+2028] [test: an attribute block over several lines after the ER entity 1
that touches a letter and U+2028 after its opening brace] [test: an attribute
block of an entity after the end of an ER subgraph and U+2028, and a comment
line after U+2028 after its closing brace] [test: an empty attribute block of an
entity after the end of an ER subgraph and U+2028, and a comment line after
U+2028 after its closing brace] [test: an attribute block of an entity after the
end of an ER subgraph and U+2028, and a comment line after U+2028 at the end of
the text] [test: an attribute block of an entity after the end of an ER subgraph
and U+2029, and a comment line after U+2029 after its closing brace] [fixture:
attribute-blocks/written-line-closing-line-kinds] [fixture:
attribute-blocks/written-line-unclosed-directive-semicolon] [test: an empty
attribute block over several lines before a name that is a no-break space and a
comment line] [test: an attribute block over several lines before a name that is
a no-break space and a comment line] [test: an attribute block over several
lines of an entity after a statement, before a name that is a no-break space and
a comment line]

A block without attributes that holds a directive on the line of its braces
keeps the directive there, as written, and a block that holds a comment line or
a directive on a line of its own is printed as a block.

[fixture: attribute-blocks/empty-with-directive-kept] [fixture:
attribute-blocks/empty-with-comment-line-over-lines] [fixture:
attribute-blocks/empty-with-directive-line-over-lines]

The text that mermaid.js does not read, two backquotes with nothing between
them, is an item of the block where it lies between two attributes, before the
first, after the last, or alone: it stands on a line of its own, as written. A
run of such text with only whitespace between the units is one item.

[fixture: attribute-blocks/ignored-text-own-line] [fixture:
attribute-blocks/ignored-text-run-kept] [corpus fixture:
er/gram-empty-backquotes-between-attributes] [corpus fixture:
er/gram-empty-backquotes-twice]

A directive on the line of the `}`, before it, stays there as written, and one
after it keeps the whitespace written before it.

[fixture: attribute-blocks/directive-on-closing-line-kept] [fixture:
attribute-blocks/directive-after-closing-brace-kept]

Comment lines and empty lines in a block are handled as in any block (see
[Comments](#comments) and [Blank lines](#blank-lines)).

[fixture: attribute-blocks/comment-lines-and-blank-lines]

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
parts becomes one space.

[fixture: attribute-spacing/parts-collapsed]

The parts are not aligned in columns: aligning would change every line of a
block when one attribute changes, the width of a name cannot be counted in
characters, and the examples in the documentation of mermaid.js are not aligned
either. The one space, and the `?` touching its type, are the form of those
examples. The `?` of an optional type touches the type, however it was written.

[fixture: attribute-spacing/optional-touching]

The keys are separated by a `,` followed by one space, with no space before it,
as Prettier prints a comma where mermaid.js reads the list the same
([rule 1](./printed-form.md#1-the-whitespace-beside-a-mark)), and keep the case
in which they are written, since the Db keeps it.

[fixture: attribute-spacing/keys-comma-space] [fixture:
attribute-spacing/keys-case-kept]

A comment stands after one space, also where it was written touching its name or
its keys.

[fixture: attribute-spacing/comment-one-space]

The text of a type or a name is kept as written, except that a run of spaces and
tabs inside a tilde word or a backquoted word is printed as one space (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)),
and the text of a comment is kept, since the Db holds the type, the name, and
the comment of an attribute as written. Rule 1 does not decide the inside of a
tilde word or a backquoted word, since the tree holds each as one token with its
whitespace inside
([A text that the tree holds whole](./printed-form.md#a-text-that-the-tree-holds-whole));
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have) gives
one space, as [class](./class.md#member-lines) prints a run of spaces and tabs
inside a field and [architecture](./architecture.md#label-content) inside the
text of a label as one space, where mermaid.js draws the text without the run.

[fixture: attribute-spacing/tilde-word-runs-collapsed] [fixture:
attribute-spacing/backquoted-word-runs-collapsed]

An attribute written over several lines is printed on one, since the attribute
block is read without regard to line breaks.

[fixture: attribute-spacing/over-lines-joined] [corpus fixture:
er/gram-attribute-split-lines] [corpus fixture: er/gram-name-then-key-next-line]

An attribute with a comment line or a directive between its parts keeps its line
breaks. Later structural parts and standalone trivia stand one level inside the
attribute, also in a subgraph; type, name and quoted-comment interiors stay as
written, since the Db holds them as written. Rule 1 names no mark for a line
break next to a comment line, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides, as [block](./block.md#multi-line-statements),
[sequence](./sequence.md#multi-line-statements), and
[flowchart](./flowchart.md#accessibility-lines) put the later parts of a
statement and the standalone trivia one continuation level inside the statement,
where no other rule keeps the layout as written (a comment region that joins
physical lines, a line that holds a `;`). The line breaks next to the comment
line or the directive stay for the reason given under
[Multi-line statements](#multi-line-statements).

[fixture: attribute-spacing/comment-line-inside-kept] [fixture:
attribute-spacing/directive-inside-kept] [fixture:
attribute-spacing/comment-continuation-with-multiline-value] [fixture:
attribute-spacing/directive-continuation-tabs]

A `;` keeps the statements of its line together and stays where it is (see
[Lines that hold a `;`](./compatibility.md#lines-that-hold-a-)), but it does not
keep the indentation of a continuation: the continuation of an attribute that
holds a `;` in a string is aligned as any other.

[fixture: attribute-spacing/semicolon-continuation-aligned]

Comment regions that join physical lines retain their original layout. A comment
region after U+2028 or U+2029 makes mermaid.js read the lines around it as one,
and the formatter keeps the whitespace and the line breaks of such a line as
written, from the start of its first statement to its end, apart from the block
of an entity (see
[A comment line after U+2028 or U+2029](./compatibility.md#a-comment-line-after-u2028-or-u2029)).
A directive on such a line stays where it is written, with its whitespace. The
quotes of a name and of a label stay as written, where a plain line prints them
without when the text is one plain word, and the quotes of an alias stay, as
they do on a plain line. The cardinalities and the line of a relationship are
printed as symbols, as on a plain line, with the whitespace between them as
written: `A only one to zero or more B` is printed `A || -- o{ B`. The colors of
a style or a class definition on such a line are printed as under
[Colors](#colors) where a comma follows the color on its line, also after
whitespace, and for the last color of the last line of the statement, where no
`;` that the line rule ignores follows it: there a color is in lower case. A
color stays as written where characters follow it after whitespace, also after a
comment line, and where a comment region follows it on its line, also where a
comma starts the line after the comment line and where the text ends after it:
the U+2028 or U+2029 that the text of the style keeps after the color makes it a
word that the character touches (see
[Colors that are drawn the same](./compatibility.md#colors-that-are-drawn-the-same)).
A color that a `;` that the line rule ignores touches, or that a wide space
other than the vertical tab and the form feed, a U+2028, or a U+2029 separates
from it, stays as written; a color that a space, a tab, a vertical tab, or a
form feed separates from the `;` is printed as under Colors where no comment
region follows it on its line. The whitespace inside the styles stays as written
(`style A fill:#F00,   stroke:#ABC`, U+2028, and `%% c` keep the run after the
comma).

[test: er/attribute-spacing/comment-region-continuation-kept] [test: ER the
quotes of the names of a relationship on a line that a comment line after U+2028
joins] [test: ER the quotes of the label of a relationship on a line that a
comment line after U+2028 joins] [test: ER the quotes of the alias of an entity
on a line that a comment line after U+2028 joins] [test: ER the quotes of an
entity name on a line that a comment line after U+2029 joins] [test: ER the
words of a relationship on a line that a comment line after U+2028 joins are
printed as symbols] [test: ER a directive on a line that a comment line after
U+2028 joins stays where it is written] [test: a color before a comma in a style
on a line that a comment line after U+2028 joins with the next line] [test: a
color before a comma in a class definition on a line that a comment line after
U+2029 joins with the next line] [test: the last color of a style that the line
after a comment line after U+2028 goes on with] [test: a color before a comma
that follows it after whitespace in a style on a line that a comment line after
U+2028 joins with the next line] [test: a color before a comment line after
U+2028 and a comma at the start of the next line in a style] [test: a color
before a comment line after U+2028 and a comma on the next line, and the last
color of that line at the end of the text, in a style] [test: the last color of
a style before a comment line after U+2028 at the end of the text] [test: a
color before the semicolon that the line rule ignores in a class definition that
whitespace and a line break join] [test: a color before the semicolon that the
line rule ignores on the line after a comment line after U+2028 in a class
definition] [test: whitespace between the statements of a line that a comment
line after U+2028 joins with the next line] [test: a color before a semicolon
that the line rule ignores on the line after a comment line after U+2028 in a
style, where a comma starts the line] [test: a color that characters follow
after whitespace after a comment line after U+2028 in a style] [test: a color
that characters follow after whitespace in a style on a line that a comment line
after U+2028 joins with the next line] [test: the last color of the last line of
a style that a comment line after U+2028 cuts, where a statement follows it]
[test: a run of spaces after a comma in a style on a line that a comment line
after U+2028 joins stays as written] [test: a color before a semicolon after
whitespace in a style statement that a comment line after U+2028 cuts] [test: a
color before a semicolon followed by a second semicolon in a style statement
that a comment line after U+2028 cuts] [test: a color before a semicolon
followed by a space and a second semicolon in a style statement that a comment
line after U+2028 cuts] [test: a color before a semicolon that touches it in a
style statement that a comment line after U+2028 cuts] [test: no whitespace
between the last color and the semicolon that the line rule ignores, before a
comment line after U+2028, in a style: the color stays as written] [test: no
whitespace between the last color and the semicolon that the line rule ignores,
before a comment line after U+2028, in a class definition: the color stays as
written] [test: a space between the last color and the semicolon that the line
rule ignores, before a comment line after U+2028, in a style: the color stays as
written] [test: a space between the last color and the semicolon that the line
rule ignores, before a comment line after U+2028, in a class definition: the
color stays as written] [test: two spaces between the last color and the
semicolon that the line rule ignores, before a comment line after U+2028, in a
style: the color stays as written] [test: two spaces between the last color and
the semicolon that the line rule ignores, before a comment line after U+2028, in
a class definition: the color stays as written] [test: a tab between the last
color and the semicolon that the line rule ignores, before a comment line after
U+2028, in a style: the color stays as written] [test: a tab between the last
color and the semicolon that the line rule ignores, before a comment line after
U+2028, in a class definition: the color stays as written] [test: a vertical tab
between the last color and the semicolon that the line rule ignores, before a
comment line after U+2028, in a style: the color stays as written] [test: a
vertical tab between the last color and the semicolon that the line rule
ignores, before a comment line after U+2028, in a class definition: the color
stays as written] [test: a form feed between the last color and the semicolon
that the line rule ignores, before a comment line after U+2028, in a style: the
color stays as written] [test: a form feed between the last color and the
semicolon that the line rule ignores, before a comment line after U+2028, in a
class definition: the color stays as written] [test: a no-break space between
the last color and the semicolon that the line rule ignores, before a comment
line after U+2028, in a style: the color stays as written] [test: a no-break
space between the last color and the semicolon that the line rule ignores,
before a comment line after U+2028, in a class definition: the color stays as
written] [test: U+2003 between the last color and the semicolon that the line
rule ignores, before a comment line after U+2028, in a style: the color stays as
written] [test: U+2003 between the last color and the semicolon that the line
rule ignores, before a comment line after U+2028, in a class definition: the
color stays as written] [test: U+3000 between the last color and the semicolon
that the line rule ignores, before a comment line after U+2028, in a style: the
color stays as written] [test: U+3000 between the last color and the semicolon
that the line rule ignores, before a comment line after U+2028, in a class
definition: the color stays as written] [test: a color before a comma in a class
definition that a comment line after U+2028 joins is printed in lower case]
[test: a color before a comma after a space in a class definition that a comment
line after U+2028 joins is printed in lower case] [test: a color before a comma
after a tab in a class definition that a comment line after U+2028 joins is
printed in lower case] [test: the last color of a class definition before a
comment line after U+2028 stays as written] [test: a semicolon that touches the
last color of a class definition before a comment line after U+2028: the color
stays as written] [test: two semicolons that touch the last color of a class
definition before a comment line after U+2028: the color stays as written]
[test: a color before a comma and a semicolon that touches the last color in a
class definition before a comment line after U+2028] [test: the last color of
the last line of a class definition that a comment line after U+2028 cuts, where
a statement follows it, is printed in lower case] [test: a color before a comma
on the first line of a class definition that a comment line after U+2028 cuts is
printed in lower case]

A directive between the parts of an attribute is placed as under
[Directives](./flowchart.md#directives): mermaid.js removes a directive before
it reads the text, so the gap is printed as without the directive and the
directive stands after the space of that rule, touching the unit that follows it
(`int a %%{init: {}}%% PK` is printed `int a %%{init: {}}%%PK`, and
`int%%{init: {}}%% b` is printed `int %%{init: {}}%%b`). A directive on a line
of its own between two attributes stays between them. A directive between two
attributes written on the same line moves with the attribute after it to the
line after, since each attribute stands on a line of its own.

[fixture: attribute-spacing/directive-between-attributes-on-a-line] [fixture:
attribute-spacing/directive-inside-kept] [fixture:
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
after it.

[fixture: statements-one-per-line/entities] [fixture:
statements-one-per-line/relationships] [fixture:
statements-one-per-line/role-then-entity] [fixture:
statements-one-per-line/subgraph-end-then-entity] [fixture:
statements-one-per-line/class-and-accessibility] [fixture:
statements-one-per-line/header-line] [fixture:
statements-one-per-line/header-line-spaces] [corpus fixture:
er/gram-two-relationships-one-line] [corpus fixture: er/lex-role-then-name]

An empty description block, which changes nothing, is a statement of its own
wherever a statement starts, and is printed on a line of its own.

[fixture: statements-one-per-line/empty-description-blocks] [corpus fixture:
er/gram-empty-description-block-between-names]

A directive between two statements stands with the statement after it, as a
directive moves with the unit that follows it where formatting splits units that
were on the same line (see [Directives](#directives)).

[fixture: statements-one-per-line/directive-after-statement]

An ignored `;` keeps the line that makes the line rule ignore it: in
`"style:#x" end;`, the `end` stays with the entity before it, also in upper
case. On a line of its own, `end;` is rejected by every version that counts, and
`end` alone is accepted by all of them. An ignored `;` between `class` or
`subgraph` and its first name keeps the complete gap as written: `class;-A a`,
`subgraph;-x`, and `subgraph;é` keep their contacts after the `;` is removed by
the line rule. This also applies when U+2028 or U+2029 precedes the subgraph
name. mermaid.js removes the `;` before it reads the text, so the keyword and
the name touch there, and the text with a space between them is rejected or
drawn differently by some versions that count (see
[Whitespace between tokens](#whitespace-between-tokens) and
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).

[test: an end; on a line of its own in a subgraph of an ER diagram] [fixture:
statements-one-per-line/closing-end-ignored-semicolon-kept] [fixture:
statements-one-per-line/closing-uppercase-end-ignored-semicolon-kept] [fixture:
statements-one-per-line/class-ignored-semicolon-before-dash-kept] [fixture:
statements-one-per-line/subgraph-ignored-semicolon-before-dash-kept] [fixture:
statements-one-per-line/subgraph-ignored-semicolon-before-non-ascii-kept] [test:
er/statements-one-per-line/R44-er-subgraph-LS-c-before] [test:
er/statements-one-per-line/R44-er-subgraph-PS-c-before]

Some cases keep their statements on one line. The entity `1` followed right
after by another statement or by the `end` of its subgraph, with no whitespace
between them or with only directives, stays as it is: `1a` is the entities `1`
and `a`, while `1` and a letter on two lines, or with whitespace between them,
are the cardinality `only-one` and a name (diagrams/er.md, The cardinalities,
numbers, and relationship lines, rule 11). An entity named by a number of two
digits or more stays on its line with a character that continues a name right
after it (a letter, `_`, `-`, `*`, or a character outside ASCII): `12a` is the
entities `12` and `a` to the pinned version, and one name to some versions that
count, which draw the two lines differently (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
Directives between the number and that character change nothing, since
mermaid.js removes the directives before it reads the text. Any other number,
such as `2.5x`, is split from the statement after it. The line of such an entity
is printed as written, and so is a subgraph that ends on it, from its header to
its `end`, without the indentation of a level for its lines. No rule gives the
form of that line and of that subgraph: the released forms stay until they are
decided (see
[Where none of these rules gives a form](./printed-form.md#4-where-none-of-these-rules-gives-a-form)).

[fixture: statements-one-per-line/number-name-then-name-kept] [fixture:
statements-one-per-line/number-name-before-uppercase] [fixture:
statements-one-per-line/number-name-before-non-ascii] [fixture:
statements-one-per-line/number-name-in-subgraph-kept] [fixture:
statements-one-per-line/number-name-before-end-kept] [fixture:
statements-one-per-line/number-name-before-directive-kept] [fixture:
statements-one-per-line/number-name-then-name-split] [corpus fixture:
er/lex-name-number-then-letter] [corpus fixture:
er/lex-name-number2-then-letter]

A `subgraph` keyword with a character outside ASCII, or a whitespace character
that is no space or tab (a U+2028, a U+2029, a U+00A0, a U+3000, and the others;
diagrams/er.md, Whitespace), between it and its name stays as written, and so
does the statement after an `end` that such a character follows, which stays on
the line of the `end` with the gap as written: `endé` is the keyword `end` and
the entity `é` to the pinned version, and one name to some versions that count.
A whitespace character of that kind that ends the line of an `end` stays exactly
once, also before a comment or directive and before a blank line and another
statement, for the same reason (see
[ER lines that the place or the whitespace decides](./compatibility.md#er-lines-that-the-place-or-the-whitespace-decides)).

[test: er/statements-one-per-line/R63-er-ascii-after-LS-e] [test:
er/statements-one-per-line/R44-er-after-separator-LS-e] [test:
er/statements-one-per-line/R44-er-after-separator-PS-e] [test:
er/statements-one-per-line/R74-er-LS-g-comment] [test:
er/statements-one-per-line/R74-er-LS-g-directive] [test:
er/statements-one-per-line/R74-er-PS-g-comment] [test:
er/statements-one-per-line/R74-er-PS-g-directive] [test: U+00A0 in place of the
separator: er/statements-one-per-line/R63-er-ascii-after-LS-e] [test: U+3000 in
place of the separator: er/statements-one-per-line/R63-er-ascii-after-LS-e]
[test: U+00A0 in place of the separator:
er/statements-one-per-line/R44-er-after-separator-LS-e] [test: U+3000 in place
of the separator: er/statements-one-per-line/R44-er-after-separator-LS-e] [test:
U+00A0 in place of the separator:
er/statements-one-per-line/R74-er-LS-g-directive] [test: U+3000 in place of the
separator: er/statements-one-per-line/R74-er-LS-g-directive]

A statement that starts with such a character also stays with its following
statements when some versions that count read the text from the end of the
whitespace as a `class` statement or as a direction line: the character belongs
to the first name to the pinned version, and those versions read it as
whitespace before the keyword. `class A a` goes on over the line there, with two
names after the keyword. The whitespace before either name can continue across
line feeds when it starts with another whitespace character. In that case, both
gaps stay as written, including comment lines, directives and blank lines,
through the second name. A line feed directly after the keyword or first name
does not continue the class statement.

[test: er/statements-one-per-line/R45-er-class-LS-d] [test:
er/statements-one-per-line/R45-er-class-LS-e] [test:
er/statements-one-per-line/R45-er-class-PS-d] [test:
er/statements-one-per-line/R45-er-class-PS-e] [test:
er/statements-one-per-line/R45-er-second-name-LS-d] [test:
er/statements-one-per-line/R45-er-second-name-LS-e] [test:
er/statements-one-per-line/R45-er-nonascii-name-LS-d] [test:
er/statements-one-per-line/R45-er-nonascii-name-LS-e] [test:
er/statements-one-per-line/R45-er-second-name-PS-d] [test:
er/statements-one-per-line/R45-er-second-name-PS-e] [test:
er/statements-one-per-line/R45-er-nonascii-name-PS-d] [test:
er/statements-one-per-line/R45-er-nonascii-name-PS-e] [test:
er/statements-one-per-line/class-names-after-directive-ls] [test:
er/statements-one-per-line/class-second-name-after-directive-ps]

`A direction LR` and `A B direction LR` are a direction line there, which takes
the statements before `direction` too, and so are `direction LR B` and
`direction` with its value on the next line when a statement follows the value,
which stays on the line of the value. A statement that starts so with another
word (`classes`, `directionX`, a name), `class` with one name, and `direction`
with its value alone are split from the statement after them. A name in quotes
that follows such an `end` keeps its quotes, since a version that counts draws
the name without its quotes differently. Directives between the keyword and what
follows it change none of this, since mermaid.js removes the directives before
it reads the text, whether they stand before the U+2028 or U+2029 or touch the
character outside ASCII.

[fixture: statements-one-per-line/end-then-name-outside-ascii-kept] [fixture:
statements-one-per-line/subgraph-then-name-outside-ascii-kept] [fixture:
statements-one-per-line/end-directive-then-name-outside-ascii-kept] [fixture:
statements-one-per-line/subgraph-directive-then-name-outside-ascii-kept] [corpus
fixture: er/lex-keyword-end-then-e-acute] [corpus fixture:
er/lex-keyword-subgraph-then-e-acute] [corpus fixture:
er/db-subgraph-direction-after-nested-end-line-separator] [test: U+2028 between
the end of an ER subgraph and the next entity] [test: a directive between the
end of an ER subgraph and a U+2028] [test: a directive between the end of an ER
subgraph and a U+2029 and a name in quotes] [test: a directive between the
keyword of an ER subgraph and a U+2028] [test: a directive between an ER number
name and a U+2028] [test: a line of two ER statements that starts with U+2028]
[test: a line that starts with U+2029 and class, and two more statements] [test:
a line that starts with U+2028 and direction, and two more statements] [test: a
statement with U+2028 and class after a space, and two more statements] [test: a
line that starts with U+2028 and a name, and one more statement] [test: a line
that starts with U+2028 and a word that starts like class] [test: a line that
starts with U+2028 and a word that starts like direction] [test: a line that
starts with U+2028, a name, and a direction line] [test: a line that starts with
U+2029, two names, and a direction line] [test: a line that starts with U+2028,
a relationship, and a direction line] [test: a direction line after a name and a
name that starts with U+2028] [test: a line that starts with U+2028 and
direction, and a value on the next line that a statement follows] [test: a line
that starts with U+2028, a name, and a direction line with a directive before
its value] [test: a line that starts with U+2028, a name, and a direction line
in upper case] [test: a line that starts with U+2028, class and a character
outside ASCII, and one more statement] [test: a line that starts with U+2028 and
CLASS in upper case, and two more statements] [test: a line in an ER subgraph
that starts with U+2028, a name, and a direction line] [test: a line that starts
with U+2028 and direction, and its value alone] [test: a line that starts with
U+2028 and a name that ends with direction, and its value alone] [test: a line
that starts with U+2028 and direction, and a value glued to a letter] [test: a
line that starts with U+2028 and direction, and a relationship that starts with
its value] [test: a line that starts with U+2028, a name, and direction without
a direction] [test: a line that starts with U+2028, a name, a second U+2028, and
a direction line] [test: a line that starts with U+2028 and direction, its
value, and a statement on the next line] [test: a line that starts with U+2028
and a name, and a directive that holds a direction] [test: a line that starts
with U+2028 and class, and one more statement] [test: a line that starts with
U+2028 and class, and a name on the next line] [test: a line that starts with
U+2028 and class, and two names in quotes] [test: a line that starts with U+2028
and class, and a name with a class] [test: a line that starts with U+2028, a
space, and class] [test: a line that starts with U+2028, a space, a name, and a
direction line] [test: U+00A0 in place of the separator:
er/statements-one-per-line/class-names-after-directive-ls] [test: U+3000 in
place of the separator:
er/statements-one-per-line/class-names-after-directive-ls] [test: U+00A0 in
place of the separator:
er/statements-one-per-line/class-second-name-after-directive-ps] [test: U+00A0
in place of the separator: er/statements-one-per-line/R45-er-class-LS-d] [test:
U+3000 in place of the separator: er/statements-one-per-line/R45-er-class-LS-d]
[test: U+00A0 in place of the separator:
er/statements-one-per-line/R45-er-class-LS-e] [test: U+00A0 in place of the
separator: er/statements-one-per-line/R45-er-second-name-LS-d] [test: U+3000 in
place of the separator: er/statements-one-per-line/R45-er-second-name-LS-d]
[test: U+00A0 in place of the separator:
er/statements-one-per-line/R45-er-second-name-LS-e] [test: U+00A0 in place of
the separator: er/statements-one-per-line/R45-er-nonascii-name-LS-d] [test:
U+00A0 in place of the separator:
er/statements-one-per-line/R45-er-nonascii-name-LS-e] [test: U+00A0 in place of
the separator: a line of two ER statements that starts with U+2028] [test:
U+3000 in place of the separator: a line of two ER statements that starts with
U+2028] [test: U+00A0 in place of the separator: a line that starts with U+2029
and class, and two more statements] [test: U+3000 in place of the separator: a
line that starts with U+2029 and class, and two more statements] [test: U+00A0
in place of the separator: a statement with U+2028 and class after a space, and
two more statements] [test: U+00A0 in place of the separator: a line that starts
with U+2028, class and a character outside ASCII, and one more statement] [test:
U+00A0 in place of the separator: a line that starts with U+2028 and CLASS in
upper case, and two more statements] [test: U+00A0 in place of the separator:
U+2028 between the end of an ER subgraph and the next entity] [test: U+3000 in
place of the separator: U+2028 between the end of an ER subgraph and the next
entity] [test: U+00A0 in place of the separator: U+2029 between the end of an ER
subgraph and a relationship] [test: U+00A0 in place of the separator: U+2028
after the end of an ER subgraph that nothing follows] [test: U+3000 in place of
the separator: U+2028 after the end of an ER subgraph that nothing follows]
[test: U+00A0 in place of the separator: a name in quotes after the end of an ER
subgraph and a U+2028] [test: U+3000 in place of the separator: a name in quotes
after the end of an ER subgraph and a U+2028] [test: U+00A0 in place of the
separator: a directive between the end of an ER subgraph and a U+2028] [test:
U+00A0 in place of the separator: a directive between the end of an ER subgraph
and a U+2029 and a name in quotes]

A statement that starts with a whitespace character other than a space or a tab
(U+2028, U+2029, or a no-break space that comes before one of them), after
another statement on its line, stays on its line when a comment follows that
whitespace, with only whitespace, line breaks, and directives between:
mermaid.js reads the whitespace as the name of an entity and draws that entity,
while on a line of its own the whitespace belongs to a comment line, which takes
it with the whitespace and line breaks before its `%%`, and no entity is drawn.
At the end of its line before a directive, it is split from the statement before
it like any other statement, and at the start of its line it is whitespace
before the comment.

[test: U+2028 alone after a name in quotes, before a comment] [test: U+2029
alone after a name in quotes and a space, before a comment] [test: U+2028 alone
after the block of an accessibility description, before a comment] [test: two
U+2028 alone after a name in quotes, before a comment] [test: U+00A0 and U+2028
after a name in quotes, before a comment] [test: U+00A0 after a name in quotes
at the end of its line, and U+2028 and a comment on the next line] [test: U+2028
alone after a name in quotes, at the end of its line] [test: U+2028 alone after
a name in quotes, before a directive] [test: U+2028 alone at the start of its
line, before a comment]

A statement whose first entity is named by whitespace characters alone that are
no space or tab (a U+2028, a U+2029, a U+00A0, a U+3000, a U+FEFF, and the
others; one or several of them), after another statement on its line, and that
goes on after the name with an attribute block, an alias, a CSS class, or a
relationship, stays on its line too (`"Alpha"`, the character, and `{ int x }`):
the oldest versions that count read the character as whitespace and the rest as
part of the statement before it, so the rest cannot start a line of its own
there. A second name after the character is split from it, as is a name of the
character and other characters (`LR`), which starts a line.

[test: U+2028 and an attribute block after a name in quotes] [test: U+2028 and
an attribute block touching it after a name in quotes] [test: U+2028, a
directive, and an attribute block after a name in quotes] [test: U+2029 and a
relationship after a name in quotes] [test: U+2028 and an alias after a name in
quotes] [test: U+2028 and a CSS class after a name in quotes] [test: U+2028 and
a second name after a name in quotes] [test: U+00A0 in place of the separator:
U+2028 and an attribute block after a name in quotes] [test: U+3000 in place of
the separator: U+2028 and an attribute block after a name in quotes] [test:
U+00A0 in place of the separator: U+2028 and an attribute block touching it
after a name in quotes] [test: U+3000 in place of the separator: U+2028 and an
attribute block touching it after a name in quotes] [test: U+00A0 in place of
the separator: U+2028, a directive, and an attribute block after a name in
quotes] [test: U+3000 in place of the separator: U+2028, a directive, and an
attribute block after a name in quotes] [test: U+00A0 in place of the separator:
U+2029 and a relationship after a name in quotes] [test: U+3000 in place of the
separator: U+2029 and a relationship after a name in quotes] [test: U+00A0 in
place of the separator: U+2028 and an alias after a name in quotes] [test:
U+3000 in place of the separator: U+2028 and an alias after a name in quotes]
[test: U+00A0 in place of the separator: U+2028 and a CSS class after a name in
quotes] [test: U+3000 in place of the separator: U+2028 and a CSS class after a
name in quotes] [test: U+00A0, U+2028, and an attribute block after a name in
quotes] [test: U+3000, U+2028, and an attribute block after a name in quotes]
[test: U+FEFF and an attribute block after a name in quotes] [test: U+2003 and
an attribute block after a name in quotes] [test: U+3000 and an attribute block
after a name in quotes] [test: U+00A0 and a second name after a name in quotes]

A line of several attributes is printed as written when an attribute on it that
comes after another holds a pair of `~`, as in `int a List~int~ b`: the oldest
version that counts reads a generic type with a rule that runs from the start of
an attribute over the rest of the line to the second `~`. A line whose only `~`
is in a string or in a directive, which mermaid.js removes before it reads the
text, and an attribute whose own type holds the pair, are split.

[fixture: attribute-spacing/attributes-with-tilde-on-one-line-kept] [fixture:
attribute-spacing/attributes-with-generic-type-later-on-one-line-kept] [fixture:
attribute-spacing/attributes-with-generic-type-first-on-one-line-split]
[fixture: attribute-spacing/attributes-with-tilde-in-quotes-on-one-line-split]
[fixture:
attribute-spacing/attributes-with-tilde-in-directive-on-one-line-split] [corpus
fixture: er/lex-tilde-after-quoted]

An entity with an attribute block over several lines on any of these lines that
stay as written is printed as a block, as in
[Attribute blocks](#attribute-blocks): the statements of the line stay together,
with the whitespace between their units formatted as usual where it does not
decide how mermaid.js reads the line, what follows the `{` on its line stays as
written in a nonempty block, and the attributes and the `}` stand as those of
any entity, so that `1A {`, a line break, and `}` become `1A { }`.

[fixture: attribute-blocks/written-line-number-name] [fixture:
attribute-blocks/written-line-tilde-line] [fixture:
attribute-blocks/written-line-unclosed-directive] [fixture:
attribute-blocks/written-line-closing-brace] [fixture:
attribute-blocks/semicolon-line] [test: an empty attribute block over several
lines after U+2028 and class] [test: an attribute block over several lines after
U+2028 and class] [test: an empty attribute block over several lines after a
name in quotes and U+2028] [test: an attribute block over several lines after a
name in quotes and U+2028] [test: an empty attribute block over several lines
after a name in quotes and U+2029] [test: an empty attribute block over several
lines after a semicolon that the line rule ignores and U+2028] [test: an
attribute block over several lines after a semicolon that the line rule ignores
and U+2028] [test: an attribute block over several lines of an entity after a
statement that starts with U+2028 and a comment line] [test: an empty attribute
block over several lines of an entity after a statement that starts with U+2028
and a comment line]

The entity after an `end` that stays on the line of the `end` keeps the gap
before it as written, and its block is printed as in any other line.

[test: an attribute block over several lines of an entity after the end of an ER
subgraph and U+2028] [test: an empty attribute block over several lines of an
entity after the end of an ER subgraph and U+2028]

A statement that keeps the gap before it as written in this way stays on its
line with the text that follows it, and does not go to a line of its own, where
that line stays as written, whatever makes it stay: a comment line after U+2028
that joins the next line to it, a `;` in a name in quotes, an entity `1` that
touches a letter, a pair of `~` in an attribute block on one line, or a
directive that is not closed. A block on the line is printed as above. Each of
these has its reason where it is stated: the comment line in
[A comment line after U+2028 or U+2029](./compatibility.md#a-comment-line-after-u2028-or-u2029),
the `;` in [Lines that hold a `;`](./compatibility.md#lines-that-hold-a-), the
entity `1` and the pair of `~` above, and the directive that is not closed in
[A line that a directive that is not closed joins](./compatibility.md#a-line-that-a-directive-that-is-not-closed-joins).

[test: an ER statement attached to a class name after U+00A0, and a comment line
after U+2028 and a statement] [test: an ER statement attached to a class name
after U+00A0, and a comment line after U+2028 and an attribute block on one
line] [test: an ER statement attached to a class name after U+00A0, and a
comment line after U+2028 and an empty attribute block over several lines]
[test: an ER statement attached to a class name after U+2028, and a comment line
after U+2028 and a statement] [test: an ER statement attached to a class name
after U+00A0, and a name in quotes that holds a semicolon] [test: an ER
statement attached to a class name after U+00A0, and the entity 1 that touches a
letter] [test: an ER statement attached to a class name after U+00A0, and an
attribute block with a pair of tildes on one line] [test: an ER statement
attached to a class name after U+00A0, and a directive that is not closed]
[test: an ER statement after the end of a subgraph and U+2028, and a comment
line after U+2028 and a statement] [test: an ER statement that touches the end
of a subgraph with a dash, and a comment line after U+2028 and a statement]

And a line that holds a kept `;` keeps its statements together: the line rule of
mermaid.js reads the text of a line, and moving text to another line changes
which line matches the rule and which `;` it ignores (see
[Styles and classes](#styles-and-classes)).

[fixture: statements-one-per-line/semicolon-line-kept] [fixture:
statements-one-per-line/ignored-semicolon-line-kept]

The `}` of an attribute block or the `end` of a subgraph on such a line, with a
statement after it on the line, would go to a line of its own and leave the
statement on a line without the `;`, so it stays on the line, which is printed
with the whitespace between its tokens as usual. Where no statement follows it,
it stands on a line of its own, as in any block, unless a `;` that the line rule
ignores follows it on the line (`"Alpha" { int x "style:#x" };`): that `;` is
ignored because of the text before it on its line, so the `}` stays with it, and
a line break before the `}` would leave the `;` on a line without that text,
where it is a syntax error.

[fixture: statements-one-per-line/semicolon-line-block-kept] [fixture:
statements-one-per-line/semicolon-line-subgraph-end-kept] [fixture:
statements-one-per-line/semicolon-after-block-closing-kept]

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
  E }|..|{ F : z
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
  12a
```

### Blank lines

As in a class diagram: a run of empty lines becomes one, and empty lines at the
start and the end of the diagram, of an attribute block, and of a subgraph are
dropped.

[fixture: blank-lines/collapsed] [fixture: blank-lines/block-edges-dropped]
[fixture: blank-lines/header-and-end-of-text-dropped] [fixture:
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
whitespace-between-tokens/touching-kept]

A keyword keeps the case in which it is written (`SUBGRAPH`, `END`, `DIRECTION`,
`CLASS`, `CLASSDEF`, and `STYLE`: see
[Keywords in one case](./compatibility.md#keywords-in-one-case)), and so do the
keys of an attribute, which the Db keeps. The words of a relationship are
printed as symbols (see [Relationship spacing](#relationship-spacing)).

[fixture: whitespace-between-tokens/keyword-case-kept] [fixture:
relationship-spacing/cardinality-words-case-one-form]

A `class` or `subgraph` keyword that touches a unit starting with a `-`, and an
`end` that touches a statement starting with a `-`, keep touching: `class-A a`
is not printed `class -A a`, which a version that counts rejects, and
`subgraph-x` and `end-x` are not split, since some read them as entities (see
[ER lines that the place or the whitespace decides](./compatibility.md#er-lines-that-the-place-or-the-whitespace-decides)
and
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
A directive between the keyword and the `-` does not part them, since mermaid.js
removes it before it reads the text: `class%%{init: {}}%%-A a` stays. `classDef`
and `style` are not among them: `classDef-x` is printed `classDef -x`, since
each version that accepts `classDef-x` or `style-y` draws it the same with a
space (see
[ER lines that the place or the whitespace decides](./compatibility.md#er-lines-that-the-place-or-the-whitespace-decides)),
and the gap between a keyword and its text is one space
([rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)). A
`;` that the line rule ignores does not part the keyword and the `-` either.

[fixture: whitespace-between-tokens/class-then-dash-ignored-semicolon-kept]
[fixture: whitespace-between-tokens/class-then-dash-directive-kept] [fixture:
whitespace-between-tokens/subgraph-then-dash-directive-kept] [fixture:
whitespace-between-tokens/end-then-dash-directive-kept] [fixture:
whitespace-between-tokens/keyword-then-dash-touching-kept] [fixture:
whitespace-between-tokens/keyword-upper-then-dash-touching-kept] [fixture:
whitespace-between-tokens/subgraph-then-dash-touching-kept] [fixture:
whitespace-between-tokens/end-then-dash-touching-kept] [fixture:
whitespace-between-tokens/classdef-style-then-dash-spaced] [fixture:
whitespace-between-tokens/keyword-then-dash-apart]

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
  accDescr: D
  A ||--u-B : x
  1 ||--|| B : x
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
  CLASSDEF a fill: red
  CLASS A a
  STYLE A fill: red
  DIRECTION lr
  ACCTITLE: T
  ACCDESCR: D
  ACCDESCR: D
  A }|--o{ B : x
  A {
    int a PK
  }
```

### Relationship spacing

A relationship has one space between the left entity and the relationship,
between the relationship and the right entity, and on each side of the `:` of
its role, however it was written. The colon can be read as a mark that stands
between the relationship and its role, so the whitespace before it is the one
that the examples in the documentation of mermaid.js write at least twice as
often as any other: 40 relationship lines with a space after the colon have a
space before it, and none touches the entity (counted as under
[the examples that decide the whitespace before a colon](./compatibility.md#the-examples-that-decide-the-whitespace-before-a-colon)).
The role may be a name, a string, or a quoted name alike.

[fixture: relationship-spacing/around-units-and-role] [fixture:
relationship-spacing/names-and-classes] [fixture:
relationship-spacing/role-forms] [corpus fixture: er/lex-relationship-no-spaces]
[corpus fixture: er/lex-colon-no-space]

The first class of an entity touches its `:::`, and each `,` between the classes
touches the class before it and has one space after it (see
[Entities](#entities)).

[fixture: relationship-spacing/names-and-classes]

The cardinalities and the line of a relationship are printed as symbols,
whatever words or symbols were written: mermaid.js reads `only one`,
`zero or more`, `many(0)`, `to`, and the other words as the symbols `||`, `}o`,
`o{`, and `--`, and the examples in its documentation write the symbols 84 times
and the words and the other forms 6 times (see
[The relationships of an ER diagram](./compatibility.md#the-relationships-of-an-er-diagram)).

[fixture: relationship-spacing/words-to-symbols] [fixture:
relationship-spacing/cardinality-words-case-one-form] [fixture:
relationship-spacing/words-spaced]

The three units of the relationship, the cardinality on each side and the line
between them, touch each other, since the examples write symbols touching:
`A || -- o{ B` is printed `A ||--o{ B`, and `A ||--only one B` is printed
`A ||--|| B`.

[fixture: relationship-spacing/symbols-touch] [fixture:
relationship-spacing/symbols-and-words] [corpus fixture:
er/lex-relationship-spaces-in-spec]

`u` counts as a symbol and stays as written, and a space inside `many(0)` is
rejected. A symbol written on the other side is printed as the symbol of its
side: `o|` on the left is `|o`.

[fixture: relationship-spacing/symbols-on-the-other-side] [corpus fixture:
er/lex-many-space-before-parenthesis]

A relationship with a directive between its units keeps the words that were
written.

[fixture: relationship-spacing/directive-between-word-units-kept]

Three cases need care, since another whitespace or spelling would make
mermaid.js read other units. A right cardinality `u`, which is `md-parent` only
right before the name, touches the right entity.

[fixture: relationship-spacing/md-parent] [corpus fixture:
er/lex-md-parent-right-glued-name]

The entity `1` touches a cardinality that is printed starting with a letter, a
digit, or `_`, since `1` followed by one or more whitespace characters, line
feeds included, and an ASCII letter, `_`, `"`, `'`, or an ASCII digit is the
cardinality `only-one` (diagrams/er.md, The cardinalities, numbers, and
relationship lines, rule 11); a word that is printed as a symbol has a space
before it: `1one to one B` is printed `1 ||--|| B`.

[fixture: relationship-spacing/number-name-before-unit-kept] [corpus fixture:
er/lex-one-space-letter]

And the entity `only` stays an entity before a cardinality that starts with
`one`: `only one` with exactly one space is the cardinality `only one` (rule 9),
while a keyword of several words has exactly one space between its words, so two
spaces or a tab make `only` an entity (diagrams/er.md, The statement context,
keywords and what follows them), and the cardinality is printed as its symbol:
`only  one to one B` is printed `only ||--|| B`.

[fixture: relationship-spacing/entity-only-before-one-kept] [fixture:
relationship-spacing/entity-only-before-cardinality] [corpus fixture:
er/lex-only-one-two-spaces]

A directive between the units of a relationship stays where it is and is placed
as under [Directives](#directives).

[fixture: relationship-spacing/directive-between-units] [fixture:
relationship-spacing/directive-between-units-runs]

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
  A }|--|{ B : x
  A }|--|{ B : x
  A ||--|| B : x
  A ||--|| B : x
  A ||--|| B : x
  A ||--|| B : x
  A ||--|| B : x
  A }o--|| B : x
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
  A }|--o{ B : x
  A ||--|| B : x
  A |o..o| B : x
  A }|--o{ B : x
  A }o--|| B : x
```

### Entities

The alias of an entity touches its name and has nothing inside its brackets, as
Prettier prints `x [ 0 ]` as `x[0]`, with nothing before the `[` and nothing
inside ([rule 1](./printed-form.md#1-the-whitespace-beside-a-mark), whose table
gives `A( text )` in a flowchart as `A(text)`): `p [ Person ]` is printed
`p[Person]`.

[fixture: entities/alias-tight]

The first class after `:::` touches it, and the classes are separated by a `,`
that touches the class before it and has one space after it, as Prettier prints
a comma where mermaid.js reads the list the same: `A ::: c1 , c2` is printed
`A:::c1, c2`. Rule 1 names no mark for the `:::`, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides: [class](./class.md#whitespace-between-tokens) and
[state](./state.md#whitespace-between-tokens) print the `:::` touching the name
before it and the class after it (`class A ::: c` is printed `class A:::c`, and
`A ::: c` in a state diagram is printed `A:::c`).

[fixture: entities/classes-tight] [fixture: entities/alias-and-classes]

The `{` of an attribute block stands after one space (see
[Attribute blocks](#attribute-blocks)). A name, a role, or the id of a subgraph
in quotes that is one plain word is printed without them, as the examples in the
documentation of mermaid.js write it (see
[The quotes of a text](./compatibility.md#the-quotes-of-a-text)): `"A"[B]` is
printed `A[B]`, and `C ||--o{ D : "has"` is `C ||--o{ D : has`. A word that
starts with a letter, with a single `-` between its parts (`LINE-ITEM`, `a-1`),
is plain too, as the examples write 20 such names, `LINE-ITEM` and
`NAMED-DRIVER` among them, and none in quotes: `"LINE-ITEM"` is printed
`LINE-ITEM`. A `_` may start a name (`"_x"` is printed `_x`): the examples write
no such name, with quotes or without, so the count of the field decides (see
[The quotes of a text](./compatibility.md#the-quotes-of-a-text)), and every
version that counts reads it the same in both forms. The part before the first
`-` is compared with the words that the lexer reads as a unit of its own, since
a `-` ends a keyword (`"end-x"` is `end` and `-x`). A name with a letter outside
ASCII (`"Zoë"`) keeps its quotes, since a version that counts rejects it without
them, and so does a name with a `.` (`"a.b"`), which some versions that count
reject without them (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
The other names are kept as written, quoted or not, numbers included, and so are
a name with a `-` at its start or its end or two together, and a name that ends
with `direction` or starts with `TB`, `BT`, `RL`, or `LR`, in any case: the
lexer reads `direction`, white space (a line break too), and the name of a
direction as one line, which a name without quotes would join with the line
before or after it. The quotes of a name that starts with `-` and of a number
have a reason: some of the versions that count reject them without the quotes.
The versions that were run read `"a-"` and `a-`, and `"a--b"` and `a--b`, alike,
so the quotes of those names are kept without a reason and their row is in the
list (D04).

[fixture: entities/plain-names-without-quotes] [fixture:
entities/hyphenated-names-without-quotes] [fixture:
entities/names-that-need-quotes] [fixture: entities/name-with-dot-kept]
[fixture: entities/names-next-to-a-direction-line] [fixture:
entities/names-kept]

A directive between the parts of an entity is placed as under
[Directives](#directives).

[fixture: entities/directive-between-parts] [fixture:
entities/directive-between-parts-runs]

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
  A[B]
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
  A:::c1, c2
  "A B":::c
  A:::é, b-c
  B:::d
```

Input
([entities/hyphenated-names-without-quotes-input.mmd](../tests/fixtures/er/entities/hyphenated-names-without-quotes-input.mmd)):

```mmd
erDiagram
"LINE-ITEM" ||--o{ "ORDER-LINE" : "has-items"
"A-B-C" {
int id
}
"p-q"[Alias]
subgraph "my-group"
"x-y"
end
"_a-b" ||--o{ "_c-d" : "_e-f"
```

Output
([entities/hyphenated-names-without-quotes-output.mmd](../tests/fixtures/er/entities/hyphenated-names-without-quotes-output.mmd)):

```mmd
erDiagram
  LINE-ITEM ||--o{ ORDER-LINE : has-items
  A-B-C {
    int id
  }
  p-q[Alias]
  subgraph my-group
    x-y
  end
  _a-b ||--o{ _c-d : _e-f
```

### Subgraphs

The name of a subgraph stands after one space, and the `[` of its title touches
the name: `subgraph S [t]` is printed `subgraph S[t]`. Rule 1 gives it: the `[`
of the title attaches to the name as the `[` of an index does (Prettier prints
`x [ 0 ];` as `x[0];`, and the table of
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) prints
`service a (server) [A]` of an architecture diagram as `service a(server)[A]`),
and [a flowchart](./flowchart.md#subgraph-header) prints it so too. mermaid.js
reads both spellings as the same subgraph. Nothing stands inside the brackets,
and the names of the title are separated by one space, also where they were
written touching: mermaid.js joins them with one space.

[fixture: subgraphs/header-spacing] [fixture: subgraphs/title-touches-name]
[fixture: subgraphs/title-names-spaced] [fixture:
subgraphs/quoted-and-number-ids]

The statements of the body stand one level deeper, and `end` stands on a line of
its own at the level of the subgraph (see [Indentation](#indentation)), printed
in the case in which it is written; in the body, the keyword of a `class`,
`classDef`, or `style` statement stays as written, as it does outside a
subgraph, and mermaid.js lists it as a node of the subgraph as written.

[fixture: subgraphs/statement-keywords-case-kept]

A statement that follows the `end` on its line stands on the line after it, as
under [Statements one per line](#statements-one-per-line).

[fixture: subgraphs/end-on-the-line-of-a-statement] [fixture:
subgraphs/end-case-kept] [fixture: subgraphs/entity-after-end]

A subgraph without statements is printed with its `end` on the next line, the
empty lines between the header and the `end` being dropped.
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives it: Prettier
drops the empty lines at the start and the end of a block in JavaScript and CSS,
and [flowchart](./flowchart.md#blank-lines) drops the empty lines at the start
and the end of a subgraph, and [requirement](./requirement.md#bodies) drops the
empty lines between the `{` and the `}` of a body without fields.

[fixture: subgraphs/empty]

A directive between the name and the `[` is placed as under
[Directives](#directives).

[fixture: subgraphs/title-beside-directive] [fixture:
subgraphs/title-beside-directive-runs]

A U+2028 or U+2029 there stays as written.

[test: U+2028 between an ER subgraph name and its title] [test: U+2029 between
an ER subgraph name and its title]

Empty description blocks that follow the name or the title on the line of the
header are the first statements of the body, and stay on the line of the header,
as written.

[fixture: subgraphs/header-description-blocks-kept] [corpus fixture:
er/gram-subgraph-header-blocks]

Comments and directives on lines of their own in a subgraph stand at the level
of its statements, as under [Comments](#comments) and [Directives](#directives),
and a directive before `end` on its line stays there.

[fixture: subgraphs/directive-and-comment-lines]

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
  subgraph S["T 1" x]
    A
  end
  subgraph U[a "b"]
    B
  end
  subgraph V[12 3.5]
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
  subgraph T[Title] accDescr {}
    B
  end
  subgraph U
    accDescr {}
    C
  end
```

### Direction

A direction line is `direction` and its value, with the text that mermaid.js
does not read before and after them. The text is kept as written, which no rule
of [How the printed form is decided](./printed-form.md) gives, so the released
form stays until it is decided (see
[Where none of these rules gives a form](./printed-form.md#4-where-none-of-these-rules-gives-a-form)).
One space stands between it and `direction`, where they were written apart, and
between `direction` and the value, which is the gap between a keyword and its
text: one space, as
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have) gives
it; the value keeps the case in which it is written (`lr` stays `lr`), since a
version that counts reads the line as entities and draws `direction tb` and
`direction TB` differently (see
[Keywords in one case](./compatibility.md#keywords-in-one-case) and
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).

[fixture: direction/spacing] [fixture: direction/text-kept] [fixture:
direction/text-inner-whitespace-kept] [fixture:
direction/text-both-sides-inner-whitespace-kept] [fixture: direction/case-kept]
[fixture: direction/case-bt-rl-kept]

A value written on a later line is printed after `direction` on one line, as
[requirement](./requirement.md#direction),
[class](./class.md#multi-line-statements), and
[state](./state.md#multi-line-statements) print `direction` and a value written
on the next line (rule 2).

[fixture: direction/value-on-next-line-joined] [corpus fixture:
er/lex-direction-value-next-line]

A direction line with a directive or comment keeps its line breaks and indents
structural continuations one level deeper, for the reason given under
[Multi-line statements](#multi-line-statements).

[fixture: direction/directive-and-comment-line-kept]

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

Name and class lists use a comma that touches the name before it and has one
space after it, as Prettier prints a comma where mermaid.js reads the list the
same. The first style stands after one space: rule 1 names no mark between the
name of a statement and its first style, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides, as [state](./state.md#whitespace-between-tokens) and
[requirement](./requirement.md#styles-and-classes) print the first style of a
`style` and of a `classDef` statement after one space. For ordinary single-line
property/value styles in `style` or `classDef`, put no space before the first
colon of each style and one before its nonempty value; separate styles with a
comma and one following space: the colon of a style is the colon of a key
(`fill: #f00` in a style, see
[Which kind a colon is](./printed-form.md#which-kind-a-colon-is)), and a comma
has no whitespace before it and one space after it
([rule 1](./printed-form.md#1-the-whitespace-beside-a-mark)). Print a run of
spaces or tabs between two words of a style as one space, in a style with a `:`
and in one without: `stroke-dasharray:  5    5` becomes `stroke-dasharray: 5 5`,
and `4px    wide` becomes `4px wide`. Whether whitespace stands between two
words stays as written: `fill #f00` and `fill#f00` are kept apart, since a word
that touches the next stays touching, as a gap does elsewhere (see
[Directives](#directives)), and joining the words would hide where one word
ends. Mermaid concatenates the native style units whatever whitespace separates
them: `stroke-dasharray: 5 5` still means `stroke-dasharray:55`, so the Db does
not change. For example, `fill   : navy, stroke  : black` becomes
`fill: navy, stroke: black`. A header or exterior line break that ordinarily
joins does not delay this spacing until another formatting. Style interiors
containing line separators, owned trivia, and statements with a kept semicolon
on their physical line retain the existing style layout. The keywords `style`
and `classDef` keep the case in which they are written (see
[Keywords in one case](./compatibility.md#keywords-in-one-case)).

[fixture: styles-and-classes/style-unit-padding] [fixture:
styles-and-classes/class-def-names] [fixture: styles-and-classes/style-names]
[fixture: styles-and-classes/class-lists] [fixture:
styles-and-classes/styles-as-written] [fixture:
styles-and-classes/style-inner-whitespace-collapsed] [fixture:
styles-and-classes/style-words-run-spaced] [fixture:
styles-and-classes/style-words-touching-kept] [fixture:
styles-and-classes/style-words-directive-kept]

A style that starts with the `:` is printed as any other: one space after the
`:`, and the runs between its words as one space. `style A :  red   x` is
printed `style A : red x`.

[fixture: styles-and-classes/style-colon-first-run-spaced] [fixture:
styles-and-classes/keyword-case-kept] [fixture:
styles-and-classes/keyword-case-semicolon-line-kept]

A `classDef` or `style` statement written over lines, with whitespace after a
keyword or a name that takes the line break, is printed on one line, as
[state](./state.md#multi-line-statements) prints a `classDef` or `style`
statement written over lines (rule 2).

[fixture: styles-and-classes/over-lines-joined]

Whitespace at the end of the last style takes the line feed after it, and the
next line goes on in the style: `classDef a fill:red `, a line break, and `A`
define the style `fill:redA` and no entity A. So such a statement is kept as
written, with the whitespace and the line that it takes, and the line stays at
the column written. Joining the two lines (`classDef a fill:red A`) would give
the same Db and would show how mermaid.js reads them, but it removes the
whitespace that the author wrote, and the printer does not interpret the
statement. A directive after the last style takes the whitespace beside it in
the same way: the statement is kept as written where whitespace stands before
the directive or after it, and formatted as usual where the directive touches
the last style and no whitespace follows it on its line
(`classDef a fill:red%%{init: {}}%%`).

[fixture: styles-and-classes/trailing-whitespace-takes-next-line] [fixture:
styles-and-classes/directive-before-next-line] [fixture:
styles-and-classes/directive-touching-last-style] [fixture:
styles-and-classes/comment-line-inside-kept] [corpus fixture:
er/lex-classdef-space-before-line-feed] [corpus fixture:
er/lex-style-tab-before-line-feed]

A vertical tab and a form feed at the end of the last style take the line feed
in the same way, since the style context reads every whitespace character
between units, and the statement is kept in the same way.

[test: keeps a vertical tab and a form feed at the end of the classDef of an ER
diagram]

Line-ending semicolons follow
[Semicolons at the end of a style statement](#semicolons-at-the-end-of-a-style-statement).
An ending unit with a directive between it and the last style is kept with that
gap as written, and the statement keeps its styles as written.

[fixture: styles-and-classes/ending-semicolon-rules]

The line rule ignores the `;` only when no whitespace lies between the `:` and
the `#`. Where the rule does not apply, `#f00;` is an entity, so removing the
`;` would change the Db: `style A fill: #f00;` keeps its space and semicolon.

[fixture: styles-and-classes/space-after-colon-before-hash-kept]

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
  classDef a, b, c fill: red
  classDef default fill: #f9f, stroke-width: 4px
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
  classDef a fill: #f9f, stroke: #333
  style id1 fill: #bbf, stroke: #f66, stroke-dasharray: 5 5
  style id2 fill: red, stroke: blue
```

Input
([styles-and-classes/ending-semicolon-rules-input.mmd](../tests/fixtures/er/styles-and-classes/ending-semicolon-rules-input.mmd)):

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
([styles-and-classes/ending-semicolon-rules-output.mmd](../tests/fixtures/er/styles-and-classes/ending-semicolon-rules-output.mmd)):

```mmd
erDiagram
  classDef a fill: red
  A
  classDef b fill: red
  B
  style C fill: blue
  style D fill:blue%%{init: {}}%%;
```

### Accessibility statements

A `;` that the line rule ignores after a description block does not prevent the
one-line colon form; its written source remains after the description: a line
that holds a `;` other than one that separates statements keeps it where it is
(see [Lines that hold a `;`](./compatibility.md#lines-that-hold-a-)), and the
block is printed in the one-line form with the colon that the examples write
(see
[A description block on one line](./compatibility.md#a-description-block-on-one-line)).

[fixture: accessibility-statements/block-trailing-ignored-semicolon]

The `:` of `accTitle` and `accDescr` touches the keyword and has one space after
it, as the colon of a key does (see
[Which kind a colon is](./printed-form.md#which-kind-a-colon-is)); the text is
without the whitespace at its ends, which the Db does not hold (for the
description, see
[A description block on one line](./compatibility.md#a-description-block-on-one-line)).

[fixture: accessibility-statements/title-and-description] [corpus fixture:
er/db-acc-title-trailing-space] [corpus fixture: er/db-acc-title-spaces]

A text written on a later line is printed after the `:` on one line, as
[requirement](./requirement.md#accessibility-statements) and
[state](./state.md#multi-line-statements) print it (rule 2), and a comment line
before it keeps the line breaks of the statement, and the comment and the text
stand one level deeper. The colon of `accTitle` and `accDescr` is the colon of a
key (the title and the description of a diagram in
[Which kind a colon is](./printed-form.md#which-kind-a-colon-is)), so
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives the form
`accTitle: text`: no whitespace before the colon and one space after it, also
where the colon or the text was written on a later line; where a comment line
stands before the text, the line breaks stay and the comment and the text stand
one level deeper, as said above.

[fixture: accessibility-statements/text-on-next-line-joined] [fixture:
accessibility-statements/text-with-comment-line-kept] [corpus fixture:
er/lex-acc-title-line-feed-after-colon] [fixture:
multi-line-statements/acc-colon-and-brace-joined]

Later text lines of an ordinary `accDescr { ... }` block stand one level inside
its statement, replacing only ASCII spaces and tabs immediately after LF. The
description setter drops that indentation; line breaks and directive interiors
stay written (see
[Description block indentation](./compatibility.md#description-block-indentation),
which states the level and why replacing the indentation keeps the Db). Keep
line breaks and interior blank lines, and the whitespace at the end of each line
of text except the last one (the Db of the pinned version holds it: `x`, two
spaces, a line break, and `y` give another accDescr than `x`, a line break, and
`y`); a line of whitespace only becomes an empty line. The whitespace at the end
of the last line of text is dropped where the closer stands on a line of its
own, and is printed as one space where the closer follows it on that line.
Inside a subgraph, keep the original body columns because the raw description
also participates in its membership reading; there a line of whitespace only
stays as written, and the whitespace at the end of the last line of text is
dropped, or printed as one space before a closer on that line, as above.

[corpus fixture: er/db-subgraph-nodes-acc-descr-block-lines] [fixture:
accessibility-statements/block-trailing-whitespace] [fixture:
accessibility-statements/block-trailing-whitespace-closer-on-the-text-line]
[fixture: accessibility-statements/block-trailing-whitespace-in-a-subgraph]
[fixture:
accessibility-statements/block-trailing-whitespace-closer-on-the-text-line-in-a-subgraph]

Its `}` stands at the level of its statement, as the `}` of a block does in
Prettier and in
[Description block indentation](./compatibility.md#description-block-indentation).

[fixture: accessibility-statements/block-lines-kept] [fixture:
accessibility-statements/block-comment-and-empty-lines-kept]

Blocks on one line follow
[A description block on one line](./compatibility.md#a-description-block-on-one-line).

[fixture: accessibility-statements/block-text-on-opening-line]

An empty block is a statement of its own that keeps any prior description in the
Db. It prints `{}` internally: `accDescr { }` becomes `accDescr {}`, including
whitespace runs, line breaks and an NBSP-only interior, as Prettier prints
`x = { }` as `x = {}`
([rule 1](./printed-form.md#1-the-whitespace-beside-a-mark)). An already empty
interior stays empty, and the keyword and opening brace have one space between
them: rule 1 gives one space before the `{` that opens a block (`class A{}` is
printed `class A {}`), as [gantt](./gantt.md#empty-description-blocks) and
[journey](./journey.md#empty-description-blocks) print one space there. No text
needs surrounding whitespace, so the Db-equal choice follows
[flowchart's accessibility lines](./flowchart.md#accessibility-lines), agentflow
and usecase.

[test: accessibility revisions: er empty-description-nbsp]

Blocks with comments or directives keep their line breaks and complete contents,
while ordinary standalone trivia aligns inside the block. Rule 1 names no mark
for a line inside a block, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides, as [flowchart](./flowchart.md#multi-line-values) keeps the comment
lines of a block without text and puts them one level inside the block, with its
`}` at the level of the `accDescr`. A block that holds a directive is another
case: [flowchart](./flowchart.md#multi-line-values),
[xychart](./xychart.md#empty-description-blocks), and
[quadrant](./quadrant.md#empty-description-blocks) keep its contents and line
breaks, but in them this is a question of the list of undecided forms (D34) and
of the list of forms to fix by the rule, so their printing gives no form, and
the released form stays until it is decided (see
[Where none of these rules gives a form](./printed-form.md#4-where-none-of-these-rules-gives-a-form)).

[fixture: accessibility-statements/empty-blocks] [fixture:
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
and `direction LR` are printed `accTitle: direction LR` at the first column,
also where `accTitle:` was written after an indentation: the written statement
is a title, and an indented `accTitle: direction LR` would be a direction line.
The comment lines and the directives between `direction` and the value are
skipped, as the lexer reads the text without them (diagrams/er.md, Trivia
between units), and so are empty lines. Where no direction follows, the
statement is indented as any other. The line counts as a whole: where other
statements follow on it (`accDescr {x}; accDescr {direction RL}`), the
`direction` in them counts too, as the lexer reads the whole line from its
start.

[fixture:
accessibility-statements/semicolon-line-with-direction-text-first-column]
[fixture: accessibility-statements/first-column-for-direction-text] [fixture:
accessibility-statements/first-column-direction-case-insensitive] [fixture:
accessibility-statements/first-column-value-touching-text] [fixture:
accessibility-statements/first-column-tab-before-value] [fixture:
accessibility-statements/first-column-value-on-next-line] [fixture:
accessibility-statements/first-column-value-after-comment-line] [fixture:
accessibility-statements/first-column-value-after-directive-line] [fixture:
accessibility-statements/first-column-value-after-blank-line] [fixture:
accessibility-statements/first-column-text-brought-to-the-colon] [fixture:
accessibility-statements/first-column-text-brought-to-the-colon-in-subgraph]
[fixture:
accessibility-statements/first-column-text-brought-to-the-colon-from-indentation]
[fixture:
accessibility-statements/first-column-text-brought-to-the-colon-from-indentation-directive]
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

An `accTitle:` or `accDescr:` statement that stands after another statement on
its line keeps its text on the next line, where that line holds `direction` and
a value, and the line keeps its indentation as written; the whitespace inside
the line is formatted as usual, so `A    accTitle:` is `A accTitle:`. A
directive that stands before the statement on its line is printed once, whether
it is a directive that is not closed, which takes the next line, or a closed
directive on the same line.

[fixture: accessibility-statements/direction-text-after-unclosed-directive]
[fixture:
accessibility-statements/direction-text-after-closed-directive-on-the-line]
[fixture: accessibility-statements/direction-text-of-accdescr-after-directive]
[fixture:
accessibility-statements/direction-text-whitespace-in-the-line-formatted]
[fixture: accessibility-statements/direction-text-line-keeps-its-indentation]

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
    accDescr: three
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
accDescr: direction RL
  subgraph S
accTitle: direction BT
    A
  end
```

### Comments

A comment line, `%%` at the start of a line, stands at the level of the
statements around it, and its text is kept as written; this diagram has no other
comment (diagrams/er.md, Comments). Rule 1 gives no form here, since the start
of a line is no place that its table names
([rule 1](./printed-form.md#1-the-whitespace-beside-a-mark));
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have) gives
it, as [state](./state.md#comments) and [flowchart](./flowchart.md#comments) put
a comment line at the level of the statements around it.

[fixture: comments/kept] [fixture: comments/in-blocks] [fixture:
comments/last-in-body] [fixture: comments/text-kept]

A comment line before the header stands at the first column, as in
[gantt](./gantt.md#comments), [requirement](./requirement.md#comments),
[block](./block.md#comments), and [journey](./journey.md#comments) (rule 2).

[fixture: comments/before-header]

A comment line at the end of the text stays on a line of its own, with the line
break added, as in [gantt](./gantt.md#comments) and
[journey](./journey.md#comments).

[fixture: comments/after-last-statement-without-line-break] [fixture:
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
it, as in a flowchart, a class diagram, a state diagram, and a sequence diagram
(rule 2, as for a comment line under [Comments](#comments)), and a directive
within a printed line is placed as in a flowchart: the gap is printed as without
the directive, and the directive stands after its space and touches the unit
that follows it. Rule 1 names no mark for a directive in a gap, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides, as [class](./class.md#directives),
[sequence](./sequence.md#directives), and [state](./state.md#directives) print
the gap in the same way, where no other rule keeps the layout as written: a
directive that is not closed, below, and a line that a comment region joins, see
[Multi-line statements](#multi-line-statements). A gap that holds U+2028 or
U+2029 is not a gap that they print so: class, sequence, state, and flowchart
keep it as written, and no precedent gives a form that ER prints for it except
where ER keeps the gap as written too, so the forms that the released version
prints stay until they are decided (see
[Where none of these rules gives a form](./printed-form.md#4-where-none-of-these-rules-gives-a-form)).
In a relationship, where no space or tab comes before the character, it stays
and the directive stands after one space and touches the unit that follows it,
whichever other whitespace character comes before it (a no-break space, U+1680,
U+2000 to U+200A, U+202F, U+205F, U+3000, or U+FEFF; mermaid.js rejects a
vertical tab and a form feed there, which are `invalid` units of the
[statement context](../../spec/docs/diagrams/er.md#units-and-contexts)); where a
space or tab comes before it, the gap stays as written. In an attribute (`int`,
U+2029, `%%{x}%%`, a space, and `a` are printed `int`, U+2029, a space, and
`%%{x}%%a`), the gap stays as written where a space, a tab, a vertical tab, a
form feed, or a no-break space comes before the character, and is printed as in
a relationship where another whitespace character does. In the label of a
relationship, a directive that follows a U+2028 or U+2029 that follows the text
at once, and is followed by text, moves to the next line with that text, and the
U+2028 or U+2029 ends the line before it (`A ||--o{ B : y`, U+2028, and
`%%{x}%% z` are printed with `%%{x}%% z` on a line of its own). Where a space or
a tab comes before the U+2028 or U+2029, it starts a line of its own: `B : y`, a
space, U+2028, and `z` are printed with the U+2028 and `z` on the second line,
and `B : y`, a space, U+2028, `%%{x}%%`, and `z` with the U+2028 alone on the
second line and `%%{x}%% z` on the third. Where nothing but directives and a
comment follow the U+2028 or U+2029, the line stays as written. At the other
places of a statement, where no whitespace comes before the U+2028 or U+2029 and
spaces follow the directive, four forms are printed: no precedent gives the
first three, and rule 2 gives the fourth. Between an entity and the `{` of its
attributes, between the name of a `style`, a `classDef`, or a `class` statement
and what follows it, between the name of a relationship and its colon, and
between the name of an attribute and its key or its comment, the character stays
and the directive stands after one space and touches the unit that follows it,
as in a relationship. Between an entity and its alias, between an entity and its
CSS class, and between the name of a subgraph and its title, the character
stays, the spaces after the directive are left out, and the directive touches
the unit that follows it. Between two entities on a line, after the colons of a
CSS class, between `title` and its text, and between the colon of a relationship
and its label, the character ends the line, and the directive and the text after
it stand on the next line. The fourth form is after `direction`, after the colon
of `accTitle`, and after the keyword of a `style` or a `classDef` statement,
where the gap stays as written: rule 2 gives that form, since
[flowchart](./flowchart.md#directives),
[class](./class.md#whitespace-between-tokens), and
[state](./state.md#whitespace-between-tokens) keep a gap that holds U+2028 or
U+2029 at these places as written, and
[sequence](./sequence.md#whitespace-between-tokens),
[journey](./journey.md#line-separators), and
[timeline](./timeline.md#line-separators) after the colon of `accTitle`. The
other places are not stated here.

[fixture: directives/kept] [fixture: directives/before-header] [fixture:
directives/after-header-on-same-line] [fixture:
directives/after-header-touching-kept] [fixture:
directives/whitespace-on-both-sides] [fixture: directives/touching-one-side]
[fixture: directives/after-statement-at-end-of-line] [fixture:
directives/in-blocks] [test: U+2029 and a directive in the gap between the type
and the name of an ER attribute] [test: U+2029 and a directive in the gap
between the type and the name of an ER attribute, spaces before the U+2029 and
after the directive: the gap stays as written] [test: U+2029 and a directive in
the gap between the type and the name of an ER attribute, one space before the
U+2029: the gap stays as written] [test: U+2029 and a directive in the gap
between the type and the name of an ER attribute, a tab before the U+2029: the
gap stays as written] [test: U+2028 and a directive in the gap between the type
and the name of an ER attribute, spaces after the directive] [test: U+2028 and a
directive in the gap between the type and the name of an ER attribute, spaces
before the U+2028 and after the directive: the gap stays as written] [test:
U+2028 and a directive in the gap between an entity and the cardinality of an ER
relationship, spaces after the directive] [test: U+2028 and a directive in the
gap between an entity and the cardinality of an ER relationship, spaces before
the U+2028 and after the directive: the gap stays as written] [test: U+2028 and
a directive in the gap between an entity and the cardinality of an ER
relationship, one space before the U+2028: the gap stays as written] [test: a
space before a U+2028 and a directive in the gap between an entity and the
cardinality of an ER relationship] [test: U+1680 before a U+2028 and a directive
in the gap between an entity and the cardinality of an ER relationship] [test:
U+2000 before a U+2028 and a directive in the gap between an entity and the
cardinality of an ER relationship] [test: U+2001 before a U+2028 and a directive
in the gap between an entity and the cardinality of an ER relationship] [test:
U+2002 before a U+2028 and a directive in the gap between an entity and the
cardinality of an ER relationship] [test: U+2003 before a U+2028 and a directive
in the gap between an entity and the cardinality of an ER relationship] [test:
U+2004 before a U+2028 and a directive in the gap between an entity and the
cardinality of an ER relationship] [test: U+2005 before a U+2028 and a directive
in the gap between an entity and the cardinality of an ER relationship] [test:
U+2006 before a U+2028 and a directive in the gap between an entity and the
cardinality of an ER relationship] [test: U+2007 before a U+2028 and a directive
in the gap between an entity and the cardinality of an ER relationship] [test:
U+2008 before a U+2028 and a directive in the gap between an entity and the
cardinality of an ER relationship] [test: U+2009 before a U+2028 and a directive
in the gap between an entity and the cardinality of an ER relationship] [test:
U+200A before a U+2028 and a directive in the gap between an entity and the
cardinality of an ER relationship] [test: U+202F before a U+2028 and a directive
in the gap between an entity and the cardinality of an ER relationship] [test:
U+205F before a U+2028 and a directive in the gap between an entity and the
cardinality of an ER relationship] [test: U+FEFF before a U+2028 and a directive
in the gap between an entity and the cardinality of an ER relationship] [test: a
space before a U+2029 and a directive in the gap between the type and the name
of an ER attribute] [test: a tab before a U+2029 and a directive in the gap
between the type and the name of an ER attribute] [test: a vertical tab before a
U+2029 and a directive in the gap between the type and the name of an ER
attribute] [test: a form feed before a U+2029 and a directive in the gap between
the type and the name of an ER attribute] [test: U+1680 before a U+2029 and a
directive in the gap between the type and the name of an ER attribute] [test:
U+2000 before a U+2029 and a directive in the gap between the type and the name
of an ER attribute] [test: U+2001 before a U+2029 and a directive in the gap
between the type and the name of an ER attribute] [test: U+2002 before a U+2029
and a directive in the gap between the type and the name of an ER attribute]
[test: U+2003 before a U+2029 and a directive in the gap between the type and
the name of an ER attribute] [test: U+2004 before a U+2029 and a directive in
the gap between the type and the name of an ER attribute] [test: U+2005 before a
U+2029 and a directive in the gap between the type and the name of an ER
attribute] [test: U+2006 before a U+2029 and a directive in the gap between the
type and the name of an ER attribute] [test: U+2007 before a U+2029 and a
directive in the gap between the type and the name of an ER attribute] [test:
U+2008 before a U+2029 and a directive in the gap between the type and the name
of an ER attribute] [test: U+2009 before a U+2029 and a directive in the gap
between the type and the name of an ER attribute] [test: U+200A before a U+2029
and a directive in the gap between the type and the name of an ER attribute]
[test: U+202F before a U+2029 and a directive in the gap between the type and
the name of an ER attribute] [test: U+205F before a U+2029 and a directive in
the gap between the type and the name of an ER attribute] [test: U+FEFF before a
U+2029 and a directive in the gap between the type and the name of an ER
attribute] [test: a space before a U+2028 and a directive in the label of an ER
relationship, text after the directive] [test: a tab before a U+2028 and a
directive in the label of an ER relationship, text after the directive] [test: a
space before a U+2028 and text in the label of an ER relationship] [test: U+2028
and a directive and a comment in the label of an ER relationship: the line stays
as written] [test: a vertical tab before a U+2028 and a directive in the gap
between an entity and the cardinality of an ER relationship] [test: a form feed
before a U+2028 and a directive in the gap between an entity and the cardinality
of an ER relationship] [test: U+2028 and a directive in the gap between an
entity and the cardinality of an ER relationship, a no-break space before the
U+2028] [test: U+2028 and a directive in the gap between an entity and the
cardinality of an ER relationship, U+3000 before the U+2028] [test: U+2028 and a
directive in the gap between an entity and the cardinality of an ER
relationship, a tab before the U+2028: the gap stays as written] [test: U+2029
and a directive in the gap between the type and the name of an ER attribute, a
no-break space before the U+2029: the gap stays as written] [test: U+2029 and a
directive in the gap between the type and the name of an ER attribute, U+3000
before the U+2029] [test: a flowchart keeps U+2028 and a directive in the gap
between a node and an arrow as written] [test: a class diagram keeps U+2028 and
a directive in the gap between a class and an arrow as written] [test: a state
diagram keeps U+2028 and a directive in the gap between a state and an arrow as
written] [test: a sequence diagram keeps U+2028 and a directive in the gap
between a participant and an arrow as written] [test: U+2028 and a directive in
the label of an ER relationship, after the text] [test: U+2029 and a directive
in the label of an ER relationship, after the text] [test: U+2028 and a
directive in the label of an ER relationship, before the text] [test: U+2028 and
a directive in the label of an ER relationship, with nothing after the
directive: the line stays as written] [corpus fixture: er/lex-vertical-tab]
[corpus fixture: er/lex-form-feed] [test: U+2028 and a directive in the gap
between an entity and the opening brace of its attributes of an ER diagram: the
directive stands after one space and touches the unit that follows it] [test:
U+2029 and a directive in the gap between an entity and the opening brace of its
attributes of an ER diagram: the directive stands after one space and touches
the unit that follows it] [test: U+2028 and a directive in the gap between the
name of a style statement and its styles of an ER diagram: the directive stands
after one space and touches the unit that follows it] [test: U+2029 and a
directive in the gap between the name of a style statement and its styles of an
ER diagram: the directive stands after one space and touches the unit that
follows it] [test: U+2028 and a directive in the gap between the name of a class
definition and its styles of an ER diagram: the directive stands after one space
and touches the unit that follows it] [test: U+2029 and a directive in the gap
between the name of a class definition and its styles of an ER diagram: the
directive stands after one space and touches the unit that follows it] [test:
U+2028 and a directive in the gap between the name of a class statement and its
class of an ER diagram: the directive stands after one space and touches the
unit that follows it] [test: U+2029 and a directive in the gap between the name
of a class statement and its class of an ER diagram: the directive stands after
one space and touches the unit that follows it] [test: U+2028 and a directive in
the gap between the name of a relationship and its colon of an ER diagram: the
directive stands after one space and touches the unit that follows it] [test:
U+2029 and a directive in the gap between the name of a relationship and its
colon of an ER diagram: the directive stands after one space and touches the
unit that follows it] [test: U+2028 and a directive in the gap between the name
and the key of an attribute of an ER diagram: the directive stands after one
space and touches the unit that follows it] [test: U+2029 and a directive in the
gap between the name and the key of an attribute of an ER diagram: the directive
stands after one space and touches the unit that follows it] [test: U+2028 and a
directive in the gap between the name and the comment of an attribute of an ER
diagram: the directive stands after one space and touches the unit that follows
it] [test: U+2029 and a directive in the gap between the name and the comment of
an attribute of an ER diagram: the directive stands after one space and touches
the unit that follows it] [test: U+2028 and a directive in the gap between an
entity and its alias of an ER diagram: the spaces after the directive are left
out, and the directive touches the unit that follows it] [test: U+2029 and a
directive in the gap between an entity and its alias of an ER diagram: the
spaces after the directive are left out, and the directive touches the unit that
follows it] [test: U+2028 and a directive in the gap between an entity and its
CSS class of an ER diagram: the spaces after the directive are left out, and the
directive touches the unit that follows it] [test: U+2029 and a directive in the
gap between an entity and its CSS class of an ER diagram: the spaces after the
directive are left out, and the directive touches the unit that follows it]
[test: U+2028 and a directive in the gap between the name of a subgraph and its
title of an ER diagram: the spaces after the directive are left out, and the
directive touches the unit that follows it] [test: U+2029 and a directive in the
gap between the name of a subgraph and its title of an ER diagram: the spaces
after the directive are left out, and the directive touches the unit that
follows it] [test: U+2028 and a directive in the gap between an entity and
another entity on its line of an ER diagram: the character ends the line, and
the directive and the text that follows stand on the next line] [test: U+2029
and a directive in the gap between an entity and another entity on its line of
an ER diagram: the character ends the line, and the directive and the text that
follows stand on the next line] [test: U+2028 and a directive in the gap between
the colons of a CSS class and its name of an ER diagram: the character ends the
line, and the directive and the text that follows stand on the next line] [test:
U+2029 and a directive in the gap between the colons of a CSS class and its name
of an ER diagram: the character ends the line, and the directive and the text
that follows stand on the next line] [test: U+2028 and a directive in the gap
between the keyword of a title and its text of an ER diagram: the character ends
the line, and the directive and the text that follows stand on the next line]
[test: U+2029 and a directive in the gap between the keyword of a title and its
text of an ER diagram: the character ends the line, and the directive and the
text that follows stand on the next line] [test: U+2028 and a directive in the
gap between the colon of a relationship and its label of an ER diagram: the
character ends the line, and the directive and the text that follows stand on
the next line] [test: U+2029 and a directive in the gap between the colon of a
relationship and its label of an ER diagram: the character ends the line, and
the directive and the text that follows stand on the next line] [test: U+2028
and a directive in the gap between the keyword of a direction and its value of
an ER diagram: the gap stays as written] [test: U+2029 and a directive in the
gap between the keyword of a direction and its value of an ER diagram: the gap
stays as written] [test: U+2028 and a directive in the gap between the colon of
an accTitle and its text of an ER diagram: the gap stays as written] [test:
U+2029 and a directive in the gap between the colon of an accTitle and its text
of an ER diagram: the gap stays as written] [test: U+2028 and a directive in the
gap between the keyword of a style statement and its name of an ER diagram: the
gap stays as written] [test: U+2029 and a directive in the gap between the
keyword of a style statement and its name of an ER diagram: the gap stays as
written] [test: U+2028 and a directive in the gap between the keyword of a class
definition and its name of an ER diagram: the gap stays as written] [test:
U+2029 and a directive in the gap between the keyword of a class definition and
its name of an ER diagram: the gap stays as written] [test: U+2029 and a
directive with a space after it in the gap between the type and the name of an
ER attribute]

A directive that is not closed takes the rest of the text, and is kept as
written.

[fixture: directives/unclosed-at-end-of-text-kept] [fixture:
directives/unclosed-after-statement-kept]

When formatting splits units that were on the same line, a directive in their
gap moves with the following unit. Keep its right-side contact or separation;
break its left contact.
[Rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have) gives
this placement, as [radar](./radar.md#global-directives),
[packet](./packet.md#global-directives), and
[wardley](./wardley.md#global-directives) place a directive in the gap of units
that formatting splits, where no other rule keeps the layout as written (a
directive that is not closed after a statement).

[fixture: er/directives/whitespace-on-both-sides]

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
([directives/touching-one-side-input.mmd](../tests/fixtures/er/directives/touching-one-side-input.mmd)):

```mmd
erDiagram
A %%{init: {}}%%||--o{ B : x
A||--o{ %%{init: {}}%%B : y
```

Output
([directives/touching-one-side-output.mmd](../tests/fixtures/er/directives/touching-one-side-output.mmd)):

```mmd
erDiagram
  A %%{init: {}}%%||--o{ B : x
  A ||--o{ %%{init: {}}%%B : y
```

Input
([directives/whitespace-on-both-sides-input.mmd](../tests/fixtures/er/directives/whitespace-on-both-sides-input.mmd)):

```mmd
erDiagram
A   %%{init: {}}%%    ||--o{ B : x
C  %%{init: {}}%%  D
```

Output
([directives/whitespace-on-both-sides-output.mmd](../tests/fixtures/er/directives/whitespace-on-both-sides-output.mmd)):

```mmd
erDiagram
  A %%{init: {}}%%||--o{ B : x
  C
  %%{init: {}}%% D
```

### Colors

A color in a style is printed in lower case, as the examples in the
documentation of mermaid.js write it and as the CSS formatter of Prettier prints
it: `style CUSTOMER fill:#F9F,stroke:#ABCDEF` is printed
`style CUSTOMER fill: #f9f, stroke: #abcdef`. The colors in the styles of the
`style` and `classDef` statements of an ER diagram are printed so. A color is a
`#` and 3, 4, 6, or 8 hexadecimal digits that stand alone in the value of a
style; it is never shortened, and a text that is no color stays as written,
since a text is a color only where it cannot be anything else (see
[Colors that are drawn the same](./compatibility.md#colors-that-are-drawn-the-same),
which counts the examples for the lower case and gives the texts that Prettier
prints the same).

[fixture: colors/colors-in-lower-case] [fixture:
colors/words-that-are-not-colors-as-written]

The text of a style is read without its whitespace, so a color that characters
follow after whitespace is part of a longer word and stays as written:
`style A fill:#F9F ab` is printed `style A fill: #F9F ab`, and
`style A fill:#F9F ;`, a line break, and `ab` (the unit goes on over the `;`
that the line rule ignores) stays as written.

[fixture: colors/color-words-as-read] [fixture:
colors/color-word-over-ignored-semicolon]

Input
([colors/colors-in-lower-case-input.mmd](../tests/fixtures/er/colors/colors-in-lower-case-input.mmd)):

```mmd
erDiagram
CUSTOMER ||--o{ ORDER : places
style CUSTOMER fill:#F9F,stroke:#ABCDEF,color:#C0FFEE
classDef c fill:#DEADBE,stroke:#ABCDEF
class ORDER c
```

Output
([colors/colors-in-lower-case-output.mmd](../tests/fixtures/er/colors/colors-in-lower-case-output.mmd)):

```mmd
erDiagram
  CUSTOMER ||--o{ ORDER : places
  style CUSTOMER fill: #f9f, stroke: #abcdef, color: #c0ffee
  classDef c fill: #deadbe, stroke: #abcdef
  class ORDER c
```

Input
([colors/words-that-are-not-colors-as-written-input.mmd](../tests/fixtures/er/colors/words-that-are-not-colors-as-written-input.mmd)):

```mmd
erDiagram
CUSTOMER
style CUSTOMER fill:#ABCDE,stroke:#ABCDEF1
classDef c fill:#ABC-x,stroke:x#ABC
```

Output
([colors/words-that-are-not-colors-as-written-output.mmd](../tests/fixtures/er/colors/words-that-are-not-colors-as-written-output.mmd)):

```mmd
erDiagram
  CUSTOMER
  style CUSTOMER fill: #ABCDE, stroke: #ABCDEF1
  classDef c fill: #ABC-x, stroke: x#ABC
```

### Frontmatter YAML

As in a flowchart: the YAML between the `---` lines is formatted with Prettier's
YAML formatter, so that every mark in it has the whitespace that Prettier prints
beside it ([rule 1](./printed-form.md#1-the-whitespace-beside-a-mark)), and the
`---` lines are kept as written, with the spaces and tabs at the end of each.

[fixture: frontmatter-yaml/formatted] [fixture:
frontmatter-yaml/config-formatted] [fixture:
frontmatter-yaml/closing-delimiter-whitespace-kept]

The YAML is kept as written when Prettier cannot read it, when the `---` lines
are indented, and when a line of the formatted YAML would be a `---` line, and
also when it holds a `<` followed by a letter, a digit, or `_`, where changing
the quotes could change what mermaid.js reads.

[fixture: frontmatter-yaml/malformed-kept] [fixture:
frontmatter-yaml/indented-delimiters-kept] [fixture:
frontmatter-yaml/delimiter-line-kept] [fixture: frontmatter-yaml/html-tag-kept]
[fixture: frontmatter-yaml/less-than-before-other-formatted]

A comment line between the frontmatter and the header is kept, at the first
column, as a comment line before the header is (see [Comments](#comments)).

[fixture: frontmatter-yaml/comment-after-frontmatter-before-header]

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
inside, since they are part of the value.

[fixture: multi-line-values/role-string-kept] [fixture:
multi-line-values/attribute-strings-kept] [corpus fixture:
er/lex-role-string-line-feed] [corpus fixture: er/lex-comment-line-feed]

A comment line inside such a string is part of the string, which is kept as
written.

[fixture: multi-line-values/comment-line-inside-string-kept] [corpus fixture:
er/tokens-comment-line-in-role-string]

The lines of an `accDescr` block follow the indentation and context guards in
[Accessibility statements](#accessibility-statements).

[fixture: multi-line-values/description-block-lines-kept]

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

### Semicolons at the end of a style statement

A line-ending `;` of a `classDef` or `style` statement is dropped when the
[line rule of mermaid.js](../../spec/docs/common.md#style-and-classdef-lines)
ignores it: no whitespace lies between the `:` and the later `#`. Removing this
terminator leaves the Db unchanged, also with several styles.

[fixture: semicolons-at-the-end-of-a-style-statement/hash-terminators]

The line then formats as a line without that `;`, including its usual style
spacing.

[fixture: semicolons-at-the-end-of-a-style-statement/hash-terminators]

Blank lines and comment lines keep their usual layout around the statement (see
[Blank lines](#blank-lines) and [Comments](#comments)).

[fixture: semicolons-at-the-end-of-a-style-statement/blank-and-comment-lines]

An empty description block follows its usual layout while the style terminator
is dropped.

[fixture: semicolons-at-the-end-of-a-style-statement/empty-description-block]

Without a `#` in the statement, its terminating `;` unit is dropped, with any
whitespace before it.

[fixture: semicolons-at-the-end-of-a-style-statement/unit-terminators]

A directive between the last style and that unit keeps the gap and `;` as
written, and the statement keeps its styles as written.

[fixture: semicolons-at-the-end-of-a-style-statement/directive-before-unit-kept]

Where a `#` is present but the line rule does not apply, the `;` stays: `#f00;`
is an entity, so removing its terminator changes the Db.

[fixture:
semicolons-at-the-end-of-a-style-statement/hash-outside-line-rule-kept]

A directive after the semicolon on the same line keeps the `;`. The line break
after the directive goes on in the style, as it does after whitespace at the end
of the last style (see [Styles and classes](#styles-and-classes)): the next line
stays at its written column, and what it holds belongs to the last style. So the
`B` that follows `classDef c fill:#f00; %%{init: {}}%%` is the last digit of the
color `#f00B`, not an entity, and it is printed `b` like the other digits of a
color (see
[Colors that are drawn the same](./compatibility.md#colors-that-are-drawn-the-same)).

[fixture: semicolons-at-the-end-of-a-style-statement/trailing-items-kept]
[corpus fixture: er/lex-classdef-ignored-semicolon-then-text] [corpus fixture:
er/tokens-closed-directive-end-of-classdef-line]

An ignored `;` beside another `;` is kept to preserve the line rule's selection.

[fixture: semicolons-at-the-end-of-a-style-statement/adjacent-semicolons-kept]

A `;` after an unclosed directive stays, preserving its stopping boundary.

[fixture: semicolons-at-the-end-of-a-style-statement/unclosed-directive-kept]

The same protection applies before U+2028 and U+2029; see
[A line that a `;` ends](./compatibility.md#a-line-that-a--ends).

[test: style semicolons: er before U+2028] [test: style semicolons: er before
U+2029]

A closed directive between the statement and an ignored terminator is kept while
the `;` is dropped.

[fixture:
semicolons-at-the-end-of-a-style-statement/directive-before-terminator]

Output
([semicolons-at-the-end-of-a-style-statement/hash-terminators-output.mmd](../tests/fixtures/er/semicolons-at-the-end-of-a-style-statement/hash-terminators-output.mmd)):

```mmd
erDiagram
  A
  classDef c fill: #f00
  style A fill: #f00
  classDef d fill: #0f0, stroke: #00f
  style A fill: #0f0, stroke: #00f
```

mermaid.js removes a comment line with a pattern whose `^` also matches after a
U+2028 or U+2029, and whose `\s*` takes the whitespace up to the line feed with
the line (the specification's
[The style context](../../spec/docs/diagrams/er.md#the-style-context)). So where
a comment line follows the line of a `;` that ends a `classDef` or `style`
statement and stands after a U+2028 or U+2029, the `;` is more than a
terminator: without it the comment line, the line feed, and the whitespace
between the character and the `;` go, and the style continues with the text
after them. The `;` is handled as follows.

- Where a statement follows the comment line, directive lines between them
  included, and nothing but U+2028, U+2029, spaces, tabs, vertical tabs, and
  form feeds stands after the first of those characters, the `;` is dropped
  together with them: `style A fill:red`, U+2028, `;`, a line break, `%% c`, a
  line break, and `x` is printed `style A fill: red`, a line break, `%% c`, a
  line break, and `x`, as it is where whitespace stands before the U+2028 or
  U+2029.
- Where other whitespace stands after the first character, a no-break space for
  instance, the `;` stays, with the character and that whitespace.
- Where the end of the text follows the comment line, nothing continues, and the
  `;` stays only where whitespace that is no space, tab, vertical tab, or form
  feed stands between the character and the `;` on the line of the style.
  Otherwise it is dropped with the character, as it is where a statement or the
  end of the text follows without a comment line. A vertical tab and a form feed
  that stand after the U+2028 or U+2029 are no text of the style in the Db of an
  ER diagram, which is why they are no reason to keep the `;`.

So wherever the `;` is dropped, the U+2028 or U+2029 before it is dropped with
it, also where other whitespace stands between them, and the statement is
printed as one that has neither: `style A fill:red`, U+2028, `;` is printed
`style A fill: red` whatever follows, a statement, a comment line, or the end of
the text.

[fixture:
semicolons-at-the-end-of-a-style-statement/comment-and-directive-controls]
[test: ER direct comments] [test: ER two comment lines] [test: ER empty lines
before comments] [test: ER directives on comment lines] [test: ER directives
before comments on the same line] [test: ER indented comments] [test: ER
indented following statements] [test: ER tab and whitespace-only line before a
comment] [test: ER style comment at EOF control] [test: ER classDef comment at
EOF control] [test: ER directive lines, direct statements, NBSP controls] [test:
ER directive lines before a comment line] [test: ER directive line then a
statement after a style terminator] [test: ER an unclosed directive line before
a comment line] [test: flowchart directive line before a comment line] [test: ER
whitespace before the character goes with the terminator] [test: ER whitespace
other than spaces and tabs after the character keeps the terminator] [test: ER a
comment line at the end of the text keeps the terminator after whitespace that
is no space or tab] [test: ER a terminator after spaces and tabs is dropped
before a comment line at the end of the text] [test: ER a vertical tab after
U+2028 is no text of the style before a comment line at the end of the text]
[test: ER a form feed after U+2028 is no text of the classDef before a comment
line at the end of the text] [test: ER a vertical tab and a form feed after
U+2028 go with the terminator before a comment line and a statement] [test: ER a
style terminator after U+2028 or U+2029 is dropped with the character before a
statement and at the end of the text]

The same holds where no `;` ends the style: the U+2028 or U+2029 that ends it is
dropped, with the spaces, tabs, vertical tabs, and form feeds after it up to the
line break, and `style A fill:red`, U+2028, and a line break are printed
`style A fill: red`. Where the line holds more after the character, or the text
goes on with something other than comment lines, the output depends on what
stands after the character on its line, and on what follows the line. The table
gives it for a text that ends there or that comment lines end (E: no statement
follows, and the last line that is not blank is a comment line, with directive
lines and blank lines possibly before the comment lines), and for a text that a
statement follows or that a directive line ends (S: comment lines, directive
lines, and blank lines may stand before the statement or the directive line that
ends the text). "Dropped" means that the character, a second one, and the
whitespace after them are left out; where a character stays and whitespace
stands between it and what follows on its line, that whitespace is printed as
one space. Where a comment or a directive follows the characters on their line,
the characters and what follows them stay as written, whatever follows the line,
and so does the whitespace inside each style. A run of spaces and tabs between
the keyword, the name, and the styles is printed as one space, except in S where
a comment follows the characters on their line, or a comment line stands before
the statement or the directive line: then the line stays as written, runs
included, as [Multi-line statements](#multi-line-statements) says.

| After the character on its line              | E: the text ends, or comment lines end it                    | S: a statement follows, or a directive line ends the text                                                                                                          |
| -------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| nothing                                      | dropped                                                      | dropped; as written where whitespace stands after the character and a statement follows, and where a comment line comes before the statement or the directive line |
| a no-break space                             | as written where the text ends; dropped before comment lines | as written                                                                                                                                                         |
| a comment, one character                     | the character stays                                          | as written                                                                                                                                                         |
| a comment, two characters                    | as written                                                   | as written                                                                                                                                                         |
| a directive that touches the characters      | as written                                                   | as written                                                                                                                                                         |
| a directive after whitespace, one character  | the character stays                                          | as written                                                                                                                                                         |
| a directive after whitespace, two characters | as written                                                   | as written                                                                                                                                                         |
| a directive and a comment, one character     | the character stays                                          | as written                                                                                                                                                         |
| a directive and a comment, two characters    | as written                                                   | as written                                                                                                                                                         |

A line that stays as written keeps the characters and the whitespace where they
are, and a line whose style holds a `;` stays as written. That is the line that
a U+2028 or U+2029 ends: the colors and the runs of a statement that a line
break or a comment region joins are printed as
[Attribute spacing](#attribute-spacing) and
[Multi-line statements](#multi-line-statements) say. The line stays where
dropping the character could change what mermaid.js reads, and where a comment
or a directive follows the character on its line. mermaid.js keeps the character
in the text of the style, and the SVG that it draws holds it in the style
attribute of the groups around the entity box: the pictures are the same, and
the SVG is not (the written form has `style="fill:red "` where the form without
the character has `style="fill:red"`), and formatting must not change the SVG
(AGENTS.md, item 4; see [How the printed form is decided](./printed-form.md)).
So a character that a comment or a directive follows stays with the style, and
so does a second one, with the whitespace between them, and the comment or the
directive stays on the line. A comment line is removed by mermaid.js after a
U+2028 or U+2029 too, together with the whitespace in front of it, so a comment
after one character is a comment line only because the character stands before
it: mermaid.js rejects a comment on the line of the style itself, and
`style A fill:red %% c` is rejected. A directive is removed before the text is
read and leaves its whitespace behind: where whitespace stands between the
character and the directive, the text without the character is rejected where
comment lines end the text, and where a statement follows, the style takes the
statement into its text, as it does after whitespace between the character and
the line break and after a comment line. A text that ends right after such a
directive is rejected, by mermaid.js too, since the directive leaves its
whitespace behind and the text ends in the style context. A directive that
touches the character leaves nothing behind: `style A fill:red`, U+2028, and a
directive are printed as written. A color before a dropped character is printed
in lower case at once, by the rule of [Colors](#colors): the color then stands
alone at the end of the printed text. `fill:#F9F` and U+2028 is printed
`fill: #f9f`.

[test: ER a style that no semicolon ends is printed without the U+2028 or U+2029
that ends it, before a statement and at the end of the text] [test: ER a style
that no semicolon ends is printed without the U+2028 that ends it before a
directive line] [test: ER a style that no semicolon ends keeps the U+2028 that
ends it before a comment line and a statement] [test: ER a style that no
semicolon ends keeps the U+2028 that whitespace and a statement follow] [test:
ER a style that no semicolon ends is printed without the U+2028 or U+2029 that
ends it before a comment line at the end of the text] [test: ER a style that no
semicolon ends is printed without the U+2028 that ends it before several comment
lines at the end of the text] [test: ER a classDef that no semicolon ends is
printed without the U+2029 and the space after it before a comment line at the
end of the text] [test: ER a style that no semicolon ends keeps the U+2028 that
a no-break space follows] [test: ER a style that no semicolon ends keeps two
U+2028 or U+2029 and a space before a directive that a statement follows] [test:
ER a classDef that no semicolon ends keeps two U+2028 or U+2029 and a space
before a directive that a statement follows] [test: ER a style that no semicolon
ends keeps two U+2028 or U+2029 and a space before a directive that a comment
line and a statement follow] [test: ER a style, two U+2028 or U+2029, a space,
and a directive at the end of the text] [test: ER a classDef, two U+2028 or
U+2029, a space, and a directive at the end of the text] [test: ER a style that
no semicolon ends keeps the U+2028 and the no-break space after it where the
text ends] [test: ER a style that no semicolon ends is printed without the
U+2028 and the no-break space after it before a comment line at the end of the
text] [test: ER a terminator after U+2028 and whitespace of another kind is
dropped with all of them] [test: ER a style that no semicolon ends keeps the
U+2028 that a comment follows on its line] [test: ER a style that no semicolon
ends prints two spaces between the U+2028 and a comment on its line as one
space] [test: ER a style that no semicolon ends prints a tab between the U+2028
and a comment on its line as one space] [test: ER a style that no semicolon ends
keeps two U+2028 or U+2029 that a comment follows on its line] [test: ER a style
that no semicolon ends keeps the two characters before a comment on their line
that a statement follows] [test: ER a style that no semicolon ends keeps the
U+2028 that whitespace and a directive follow on its line] [test: ER a style
that no semicolon ends prints two spaces between the U+2028 and a directive that
comment lines follow as one space] [test: ER a style that no semicolon ends
keeps the two characters before a directive that a comment line and a statement
follow] [test: ER a style that no semicolon ends prints two spaces between the
U+2028 and a directive and a comment on their line as one space] [test: ER a
classDef that no semicolon ends keeps U+2029 and U+2028 before a directive and a
comment at the end of the text] [test: ER a style that no semicolon ends keeps
the U+2028 that a comment line and then a directive line follow] [test: ER a
style that no semicolon ends is printed without the U+2028 that a directive line
and then a comment line follow] [test: ER a style that no semicolon ends is
printed without the U+2028 that a blank line and then a comment line follow]
[test: ER a style that no semicolon ends keeps the U+2028 that a comment line, a
blank line, and a statement follow] [test: ER a style that no semicolon ends
keeps the two characters before a directive that a comment line and then a
directive line follow] [test: ER a style that no semicolon ends keeps the U+2028
before a directive and a comment on its line that a statement follows] [test: ER
a style that no semicolon ends is printed without the U+2028 that a directive
line and then a statement follow] [test: ER a style that no semicolon ends keeps
the two characters before a directive and a comment that a statement follows]
[test: ER a style that no semicolon ends keeps the U+2028 that a directive
touches] [test: ER a style that no semicolon ends keeps the U+2028 that a
directive touches before a comment line] [test: ER a style that no semicolon
ends keeps the U+2028 that a directive touches where a comment line and a
statement follow] [test: ER a style that no semicolon ends keeps the two
characters that a directive touches before a comment line] [test: ER a style
that no semicolon ends keeps the two characters that a directive touches where a
directive line follows] [test: ER a style that no semicolon ends keeps the two
characters that a directive touches where the text ends] [test: ER a style that
no semicolon ends keeps a no-break space and the U+2028 that a directive
touches] [test: ER a classDef that no semicolon ends keeps a no-break space and
the U+2028 that a directive touches] [test: ER a style that no semicolon ends
keeps the whitespace inside its styles and prints a run between its parts as one
space before two U+2028 or U+2029 and a comment] [test: ER a style that no
semicolon ends keeps two U+2028 or U+2029 that a comment touches] [test: ER a
style that no semicolon ends keeps the whitespace between two U+2028 or U+2029
and a comment] [test: ER a style that no semicolon ends keeps two U+2028 or
U+2029 before a directive that a comment line follows] [test: ER a classDef that
no semicolon ends keeps two U+2028 or U+2029 and a no-break space before a
comment] [test: ER a style that no semicolon ends keeps U+2029 before a comment
and a comment line] [test: ER a style that no semicolon ends keeps the two
characters that a directive touches where a statement follows] [test: ER a style
that no semicolon ends keeps the two characters that a directive touches where a
directive line and then a comment line follow] [test: ER a style that no
semicolon ends keeps the two characters that a directive touches where a
directive line and then a statement follow] [test: ER a classDef that no
semicolon ends keeps the U+2029 that a directive touches] [test: ER a style that
no semicolon ends keeps two U+2028 or U+2029 that a comment with a semicolon
follows on its line] [test: ER a style that no semicolon ends keeps two U+2028
or U+2029 that a comment with a semicolon follows on its line before a comment
line] [test: ER a style that no semicolon ends keeps the U+2028 that a comment
with a semicolon follows on its line] [test: ER a style that no semicolon ends
keeps the two characters before a comment with a semicolon on their line that a
statement follows] [test: ER a style that no semicolon ends keeps two U+2028 or
U+2029 that a directive and a comment with a semicolon follow on their line]
[test: ER a style that no semicolon ends keeps two U+2028 or U+2029 that a
comment with a semicolon follows on its line, with a color] [test: ER a style
that no semicolon ends keeps the two characters of a style that holds a
semicolon before a comment with a semicolon] [test: ER a classDef that no
semicolon ends keeps two U+2028 or U+2029 that a comment with a semicolon
follows on its line] [test: ER a style that no semicolon ends is printed with
its color in lower case once the U+2028 is dropped] [test: ER a style that no
semicolon ends keeps the runs between its parts as written where a comment
follows the U+2028 on its line and a statement follows] [test: ER a style that
no semicolon ends keeps the runs between its parts as written where a comment
line stands between the directive after the U+2028 and a statement] [test: ER a
style that no semicolon ends prints the runs between its parts as one space
where a directive follows the U+2028 on its line and a statement follows]

mermaid.js keeps a U+2028 or U+2029 that directly follows the last style in the
text of that style. The printer drops it only where nothing but whitespace
stands after it on its line, or where the `;` that ends the statement goes with
it, and the Db of the printed text then differs from the Db of the written text
by that character at the end of the style. This is a difference of the kind of
[Whitespace at the end of a style](./compatibility.md#whitespace-at-the-end-of-a-style):
the tests compare the styles of an ER diagram without those characters at their
end. Where a comment or a directive follows the character on its line, the
printer keeps it.

### Multi-line statements

A statement that mermaid.js reads over several lines is printed on one line
where the line break is whitespace to the lexer of its statement (the
specification's
[The statement context](../../spec/docs/diagrams/er.md#the-statement-context),
[The attribute block context](../../spec/docs/diagrams/er.md#the-attribute-block-context),
and [The style context](../../spec/docs/diagrams/er.md#the-style-context)):
around the `:` of `accTitle` and `accDescr` and the `{` of `accDescr`, between
`direction` and its value, between the units of an attribute, and in a
`classDef` or `style` statement after whitespace.

[fixture: multi-line-statements/acc-colon-and-brace-joined] [fixture:
multi-line-statements/acc-descr-brace-joined] [fixture:
multi-line-statements/attribute-over-lines-joined] [fixture:
multi-line-statements/breaks-decided-one-by-one] [fixture:
multi-line-statements/line-rule-first-hash-after-colon-kept] [fixture:
multi-line-statements/accessibility-text-joined] [fixture:
multi-line-statements/direction-value-joined] [fixture:
multi-line-statements/style-over-lines-joined]

A statement with a comment or directive keeps its line breaks; structural
continuations and intervening trivia stand one level deeper. Whitespace inside
values and before the first line break of each gap stays unchanged. Rule 1 names
no mark for a line break, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides, as [sequence](./sequence.md#multi-line-statements),
[gantt](./gantt.md#multi-line-statements), and
[journey](./journey.md#multi-line-statements) keep a line break next to a
comment or a directive and the whitespace before it, and put the later parts of
a statement and the comment and directive lines between them one level deeper,
where no other rule keeps the layout as written (where the Db holds the text
with its whitespace, where moving a line makes mermaid.js reject the text). A
joining region keeps the line that it joins as written (see below). A line break
stays where joining it, with one space or with nothing, could change which `;`
the line rule ignores, and where a `;` ends the last line; any other line break
is joined as usual, also in a statement that holds a `;`. A statement that keeps
a line break prints a run of spaces, tabs, no-break spaces, and U+3000 after a
comma between two styles, and a run of spaces and tabs before it, as one space,
on the first line and on the lines after it. A vertical tab, a form feed, and
every other wide space (U+1680, U+2000 to U+200A, U+202F, U+205F, and U+FEFF)
after a comma are printed as one space too, and so are a vertical tab and a form
feed before it. The statement keeps a run at the end of a line, a run around the
colon of a style, a run inside the text of a style, and a wide space (a no-break
space, U+1680, U+2000 to U+200A, U+202F, U+205F, U+3000, or U+FEFF) or a U+2028
before a comma as written, with its color. Its colors are printed as under
[Colors](#colors) where a comma follows the color, also after whitespace and a
line break, and for the last color of the statement where no `;` follows it on
its line. A color that characters follow after whitespace stays as written, as
under Colors, and so does a color that a `;` touches (`#ABC;`, `#ABC;;`, and
`#ABC; ;`) and a color that a wide space other than the vertical tab and the
form feed, a U+2028, or a U+2029 separates from the `;`. A color that a space, a
tab, a vertical tab, or a form feed separates from the `;` is printed as under
Colors where no comment region follows it on its line: where one does, the color
stays as written, since the U+2028 or U+2029 that the text of the style keeps
after the color makes it a word that the character touches (see
[Attribute spacing](#attribute-spacing)).

[fixture: multi-line-statements/semicolon-joining-changes-kept] [fixture:
multi-line-statements/style-comment-continuation] [fixture:
multi-line-statements/comment-line-inside-kept] [fixture:
multi-line-statements/directive-inside-kept] [test: a color before the semicolon
that the line rule ignores in a class definition that whitespace and a line
break join] [test: a run of spaces after a comma in a class definition that
whitespace and a line break join is printed as one space] [test: a tab after a
comma in a class definition that whitespace and a line break join is printed as
one space] [test: a run of spaces after a comma on the first line of a class
definition that whitespace and a line break join is printed as one space] [test:
a run of spaces before a comma in a class definition that whitespace and a line
break join is printed as one space] [test: a run of spaces around the colon of a
style in a class definition that whitespace and a line break join stays as
written] [test: a run of spaces inside the text of a style in a class definition
that whitespace and a line break join stays as written] [test: the last color of
a style that a comment line cuts from its keyword, where the text ends after it]
[test: a color that characters follow after whitespace in a class definition
that whitespace and a line break join] [test: a run of spaces after a comma at
the end of a line of a class definition that whitespace and a line break join
stays as written] [test: a run of spaces at the end of a line before a comma on
the next line of a class definition that whitespace and a line break join stays
as written] [test: a tab between a color and the semicolon that the line rule
ignores in a class definition that whitespace and a line break join] [test: a
vertical tab between a color and the semicolon that the line rule ignores in a
class definition that whitespace and a line break join] [test: a form feed
between a color and the semicolon that the line rule ignores in a class
definition that whitespace and a line break join] [test: a no-break space
between a color and the semicolon that the line rule ignores in a class
definition that whitespace and a line break join] [test: U+1680 between a color
and the semicolon that the line rule ignores in a class definition that
whitespace and a line break join] [test: U+2000 between a color and the
semicolon that the line rule ignores in a class definition that whitespace and a
line break join] [test: U+2001 between a color and the semicolon that the line
rule ignores in a class definition that whitespace and a line break join] [test:
U+2002 between a color and the semicolon that the line rule ignores in a class
definition that whitespace and a line break join] [test: U+2003 between a color
and the semicolon that the line rule ignores in a class definition that
whitespace and a line break join] [test: U+2004 between a color and the
semicolon that the line rule ignores in a class definition that whitespace and a
line break join] [test: U+2005 between a color and the semicolon that the line
rule ignores in a class definition that whitespace and a line break join] [test:
U+2006 between a color and the semicolon that the line rule ignores in a class
definition that whitespace and a line break join] [test: U+2007 between a color
and the semicolon that the line rule ignores in a class definition that
whitespace and a line break join] [test: U+2008 between a color and the
semicolon that the line rule ignores in a class definition that whitespace and a
line break join] [test: U+2009 between a color and the semicolon that the line
rule ignores in a class definition that whitespace and a line break join] [test:
U+200A between a color and the semicolon that the line rule ignores in a class
definition that whitespace and a line break join] [test: U+202F between a color
and the semicolon that the line rule ignores in a class definition that
whitespace and a line break join] [test: U+205F between a color and the
semicolon that the line rule ignores in a class definition that whitespace and a
line break join] [test: U+3000 between a color and the semicolon that the line
rule ignores in a class definition that whitespace and a line break join] [test:
U+FEFF between a color and the semicolon that the line rule ignores in a class
definition that whitespace and a line break join] [test: U+2028 between a color
and the semicolon that the line rule ignores in a class definition that
whitespace and a line break join] [test: U+2029 between a color and the
semicolon that the line rule ignores in a class definition that whitespace and a
line break join] [test: a no-break space between a color and the semicolon that
the line rule ignores in a style statement that a comment line after U+2028
cuts] [test: a tab between a color and the semicolon that the line rule ignores
in a style statement that a comment line after U+2028 cuts] [test: a tab before
a comma in a class definition that whitespace and a line break join is printed
as one space] [test: U+2028 before a comma in a class definition that whitespace
and a line break join stays as written, with the color] [test: a color before a
semicolon after whitespace in a style statement that a comment line after U+2028
cuts] [test: a color before a semicolon followed by a second semicolon in a
style statement that a comment line after U+2028 cuts] [test: a color before a
semicolon followed by a space and a second semicolon in a style statement that a
comment line after U+2028 cuts] [test: a color before a semicolon that touches
it in a style statement that a comment line after U+2028 cuts] [test: a color
before a semicolon after whitespace in a class definition that whitespace and a
line break join] [test: a color before a semicolon followed by a second
semicolon in a class definition that whitespace and a line break join] [test: a
color before a semicolon followed by a space and a second semicolon in a class
definition that whitespace and a line break join] [test: a color before a
semicolon that touches it in a class definition that whitespace and a line break
join] [test: two no-break spaces after a comma in a class definition that
whitespace and a line break join is printed as one space] [test: U+3000 after a
comma in a class definition that whitespace and a line break join is printed as
one space] [test: two tabs after a comma in a class definition that whitespace
and a line break join is printed as one space] [test: a no-break space before a
comma in a class definition that whitespace and a line break join stays as
written, with the color] [test: U+3000 before a comma in a class definition that
whitespace and a line break join stays as written, with the color] [test: a
color that a line break separates from a semicolon on a line of its own is
printed in lower case in a style] [test: a vertical tab before a comma in a
class definition that whitespace and a line break join is printed as one space]
[test: a form feed before a comma in a class definition that whitespace and a
line break join is printed as one space] [test: U+1680 before a comma in a class
definition that whitespace and a line break join stays as written, with the
color] [test: U+2000 before a comma in a class definition that whitespace and a
line break join stays as written, with the color] [test: U+2001 before a comma
in a class definition that whitespace and a line break join stays as written,
with the color] [test: U+2002 before a comma in a class definition that
whitespace and a line break join stays as written, with the color] [test: U+2003
before a comma in a class definition that whitespace and a line break join stays
as written, with the color] [test: U+2004 before a comma in a class definition
that whitespace and a line break join stays as written, with the color] [test:
U+2005 before a comma in a class definition that whitespace and a line break
join stays as written, with the color] [test: U+2006 before a comma in a class
definition that whitespace and a line break join stays as written, with the
color] [test: U+2007 before a comma in a class definition that whitespace and a
line break join stays as written, with the color] [test: U+2008 before a comma
in a class definition that whitespace and a line break join stays as written,
with the color] [test: U+2009 before a comma in a class definition that
whitespace and a line break join stays as written, with the color] [test: U+200A
before a comma in a class definition that whitespace and a line break join stays
as written, with the color] [test: U+202F before a comma in a class definition
that whitespace and a line break join stays as written, with the color] [test:
U+205F before a comma in a class definition that whitespace and a line break
join stays as written, with the color] [test: U+FEFF before a comma in a class
definition that whitespace and a line break join stays as written, with the
color] [test: a vertical tab after a comma in a class definition that whitespace
and a line break join is printed as one space] [test: a form feed after a comma
in a class definition that whitespace and a line break join is printed as one
space] [test: a no-break space after a comma in a class definition that
whitespace and a line break join is printed as one space] [test: U+1680 after a
comma in a class definition that whitespace and a line break join is printed as
one space] [test: U+2000 after a comma in a class definition that whitespace and
a line break join is printed as one space] [test: U+2001 after a comma in a
class definition that whitespace and a line break join is printed as one space]
[test: U+2002 after a comma in a class definition that whitespace and a line
break join is printed as one space] [test: U+2003 after a comma in a class
definition that whitespace and a line break join is printed as one space] [test:
U+2004 after a comma in a class definition that whitespace and a line break join
is printed as one space] [test: U+2005 after a comma in a class definition that
whitespace and a line break join is printed as one space] [test: U+2006 after a
comma in a class definition that whitespace and a line break join is printed as
one space] [test: U+2007 after a comma in a class definition that whitespace and
a line break join is printed as one space] [test: U+2008 after a comma in a
class definition that whitespace and a line break join is printed as one space]
[test: U+2009 after a comma in a class definition that whitespace and a line
break join is printed as one space] [test: U+200A after a comma in a class
definition that whitespace and a line break join is printed as one space] [test:
U+202F after a comma in a class definition that whitespace and a line break join
is printed as one space] [test: U+205F after a comma in a class definition that
whitespace and a line break join is printed as one space] [test: U+FEFF after a
comma in a class definition that whitespace and a line break join is printed as
one space]

A name that goes on across a joining region is part of such a statement: `A`,
U+2028, `%% c`, and a line `Bar` are the one name `A`, U+2028, `Bar`. It makes
no difference where the name stands: in an entity, at an end of a relationship,
as the name or the type of an attribute, as the name or the title of a subgraph,
or in a `class`, `classDef`, or `style` statement.

[test: a comment line after U+2028 inside the name of an ER entity] [test: a
comment line after U+2029 inside the name of an ER entity] [test: two comment
lines after U+2028 inside the name of an ER entity] [test: a directive and a
comment line after U+2028 inside the name of an ER entity] [test: a comment line
after U+2028 inside the name of an ER entity that follows a name in quotes]
[test: an indented line after a comment line after U+2028 inside the name of an
ER entity] [test: a comment line after U+2028 inside the name of an ER entity
with an alias] [test: a comment line after U+2028 inside the name of an ER
entity with an attribute block on one line] [test: a comment line after U+2028
inside the name of an ER entity with an empty block on one line] [test: a
comment line after U+2028 inside the name of an ER entity with a CSS class]
[test: a comment line after U+2028 inside the first entity of an ER
relationship] [test: a comment line after U+2028 inside the second entity of an
ER relationship] [test: a comment line after U+2028 inside both entities of an
ER relationship] [test: a comment line after U+2028 inside the name of an ER
attribute] [test: a comment line after U+2028 inside the type of an ER
attribute] [test: a comment line after U+2028 inside the name of an ER subgraph]
[test: a comment line after U+2028 inside the title of an ER subgraph] [test: a
comment line after U+2028 inside the name of an ER class statement] [test: a
comment line after U+2028 inside the name of an ER class definition] [test: a
comment line after U+2028 inside the name of an ER style statement]

What the line holds and where it ends follow
[A comment line after U+2028 or U+2029](./compatibility.md#a-comment-line-after-u2028-or-u2029).
Where it ends, the next line is a statement of its own (an attribute of its own,
in an attribute block), which is indented. Where the statement goes on after a
line break, that is, where the lexer reads the line break as whitespace in it,
as in the places named at the start of this section, the next line is the rest
of the statement, and it is printed as written.

[test: an empty line after a comment line after U+2028 inside the name of an ER
entity] [test: a line of only whitespace after a comment line after U+2028
inside the name of an ER entity] [test: a directive line after a comment line
after U+2028 inside the name of an ER entity] [test: a comment line after U+2028
at the end of the text of an ER diagram] [test: an empty line after a comment
line after U+2028 after the colon of accTitle, and the rest of the statement on
the next line] [test: a directive line after a comment line after U+2028 after
the colon of accTitle, and the rest of the statement on the next line] [test: an
empty line after a comment line after U+2028 after the colon of accDescr, and
the rest of the statement on the next line] [test: a directive line after a
comment line after U+2028 after the colon of accDescr, and the rest of the
statement on the next line] [test: an empty line after a comment line after
U+2028 after direction, and the rest of the statement on the next line] [test: a
directive line after a comment line after U+2028 after direction, and the rest
of the statement on the next line] [test: an empty line after a comment line
after U+2028 after a style that a comma ends, and the rest of the statement on
the next line] [test: a directive line after a comment line after U+2028 after a
style that a comma ends, and the rest of the statement on the next line] [test:
an empty line after a comment line after U+2028 after the keyword of classDef,
and the rest of the statement on the next line] [test: a directive line after a
comment line after U+2028 after the keyword of classDef, and the rest of the
statement on the next line] [test: an empty line after a comment line after
U+2029 after the colon of accTitle, and the rest of the statement on the next
line] [test: an empty line after a comment line after U+2028 after the colon of
accDescr, with CRLF line breaks] [test: an empty line after a comment line after
U+2028 before the colon of accTitle, and the rest of the statement on the next
line] [test: a directive line after a comment line after U+2028 before the colon
of accTitle, and the rest of the statement on the next line] [test: an empty
line after a comment line after U+2028 before the colon of accDescr, and the
rest of the statement on the next line] [test: a directive line after a comment
line after U+2028 before the colon of accDescr, and the rest of the statement on
the next line] [test: an empty line after a comment line after U+2028 before the
opening brace of accDescr, and the rest of the statement on the next line]
[test: a directive line after a comment line after U+2028 before the opening
brace of accDescr, and the rest of the statement on the next line] [test: an
empty line after a comment line after U+2028 after the opening brace of
accDescr, and the rest of the statement on the next line] [test: a directive
line after a comment line after U+2028 after the opening brace of accDescr, and
the rest of the statement on the next line] [test: an empty line after a comment
line after U+2028 after the keyword of style, and the rest of the statement on
the next line] [test: a directive line after a comment line after U+2028 after
the keyword of style, and the rest of the statement on the next line] [test: an
empty line after a comment line after U+2028 after a name that a comma ends in a
style statement, and the rest of the statement on the next line] [test: a
directive line after a comment line after U+2028 after a name that a comma ends
in a style statement, and the rest of the statement on the next line] [test: an
empty line after a comment line after U+2028 after the name of a style
statement, and the rest of the statement on the next line] [test: a directive
line after a comment line after U+2028 after the name of a style statement, and
the rest of the statement on the next line] [test: an empty line after a comment
line after U+2028 before the colon of a style, and the rest of the statement on
the next line] [test: a directive line after a comment line after U+2028 before
the colon of a style, and the rest of the statement on the next line] [test: an
empty line after a comment line after U+2028 after the colon of a style, and the
rest of the statement on the next line] [test: a directive line after a comment
line after U+2028 after the colon of a style, and the rest of the statement on
the next line] [test: an empty line after a comment line after U+2028 between
the type and the name of an attribute, and the rest of the statement on the next
line] [test: a directive line after a comment line after U+2028 between the type
and the name of an attribute, and the rest of the statement on the next line]
[test: an empty line after a comment line after U+2028 between the name and the
key of an attribute, and the rest of the statement on the next line] [test: a
directive line after a comment line after U+2028 between the name and the key of
an attribute, and the rest of the statement on the next line]

A `;` on that line stays where it is, whatever it is: the `;` that ends a
`style` or `classDef` statement (`Bar fill:red;`), the `;` that the line rule
ignores because the line after the comment line has `style` and `:#`
(`style fill:#f00;`), and the `;` of a character entity (`Bar fill:#f00;`).

[test: a character entity at the end of an ER style statement, after a comment
line after U+2028 inside its name] [test: a semicolon that ends an ER style
statement, after a comment line after U+2028 inside its name] [test: a semicolon
that ends an ER class definition, after a comment line after U+2028 inside its
name] [test: a semicolon that the line rule ignores, after a comment line after
U+2028 inside the name of an ER style statement] [test: a semicolon that the
line rule ignores, after a comment line after U+2028 inside the name of an ER
class definition]

Of an entity with a nonempty attribute block over several lines, what is printed
as written is the line that opens the block, with what follows the `{` on it,
and the lines that an attribute that starts there goes on over. The attributes
after it and the `}` are printed as usual, one level deeper and at the level of
the statement, unless the `}` stands on a line that holds the start of a comment
line after U+2028 or U+2029: the block then stays as written with that line, as
it does where the `}` stands on any line that stays as written (see
[Attribute blocks](#attribute-blocks)). Where its lines can join, an empty block
over several lines is printed `{ }` at the end of that line, whatever stands
after the `{` (spaces, a tab, a U+2028), as any other empty block is; an empty
block on one line stays as written with its line. An empty block written on one
line, on a line that a comment region after U+2028 or U+2029 joins with the
lines around it, stays as written with that line (see
[A comment line after U+2028 or U+2029](./compatibility.md#a-comment-line-after-u2028-or-u2029)).

[test: a comment line after U+2028 inside the name of an ER entity with an
attribute block over several lines] [test: an attribute on the line of the
opening brace after a comment line after U+2028 inside the name of an ER entity]
[test: two attributes, the first on the line of the opening brace, after a
comment line after U+2028 inside the name of an ER entity] [test: an empty
attribute block over several lines after a comment line after U+2028 inside the
name of an ER entity] [test: an empty attribute block with an indented closing
brace after a comment line after U+2028 inside the name of an ER entity] [test:
an empty attribute block with an empty line before its closing brace after a
comment line after U+2028 inside the name of an ER entity] [test: an empty
attribute block on one line after a comment line after U+2028 inside the name of
an ER entity] [test: an empty attribute block on one line after a comment line
after U+2029 inside the name of an ER entity] [test: an empty attribute block
over several lines after a comment line after U+2028 and a space] [test: an
empty attribute block with spaces after its opening brace after a comment line
after U+2028 inside the name of an ER entity] [test: an empty attribute block
with a tab after its opening brace after a comment line after U+2028 inside the
name of an ER entity] [test: an empty attribute block with U+2028 after its
opening brace after a comment line after U+2028 inside the name of an ER entity]
[test: an attribute block of an entity that starts the line, and a comment line
after U+2028 after its closing brace] [test: an empty attribute block of an
entity that starts the line, and a comment line after U+2028 after its closing
brace] [test: an attribute that starts on the line of the opening brace and goes
on over the next line, after a comment line after U+2028 inside the name of an
ER entity] [test: an attribute that starts on the line of the opening brace and
goes on over an empty line, after a comment line after U+2028 inside the name of
an ER entity] [test: an attribute that starts on the line of the opening brace
and goes on over a directive line, after a comment line after U+2028 inside the
name of an ER entity] [test: an attribute that starts on the line of the opening
brace and goes on over a comment line after U+2028, after a comment line after
U+2028 inside the name of an ER entity] [test: an attribute that starts on the
line of the opening brace and goes on over two lines, after a comment line after
U+2028 inside the name of an ER entity] [test: an attribute that goes on over a
line, and an attribute after it, after a comment line after U+2028 inside the
name of an ER entity]

An entity that stands after another statement on that line, or after a name that
the line goes on with, is printed so too: the line up to its `{` is printed as
written, with the gap before it, and its attributes and its `}` stand as those
of any entity, unless its `}` stands on a line that stays as written, which
stays with the block, as it does for an entity that starts the line.

[test: an attribute block of an entity that follows another entity on the line,
after a comment line after U+2028] [test: an attribute block of an entity after
a statement on its line, with a comment line after U+2028 inside its name]
[test: an attribute block of an entity after a name in quotes, with a comment
line after U+2028 inside its name] [test: an empty attribute block of an entity
that follows another entity on the line, after a comment line after U+2028]
[test: an empty attribute block of an entity after a statement on its line,
after a comment line after U+2028 and a space] [test: an attribute and a closing
brace with other indentation of an entity that follows another entity on the
line, after a comment line after U+2028] [test: a statement after the closing
brace of an entity that follows another entity on the line, after a comment line
after U+2028] [test: an attribute block on one line of an entity that follows
another entity on the line, after a comment line after U+2028] [test: an
attribute block inside a subgraph, of an entity that follows another entity on
the line, after a comment line after U+2028] [test: an attribute block of an
entity that follows a name that a comment line cuts, and a comment line after
U+2028 after its closing brace] [test: an empty attribute block of an entity
that follows a name that a comment line cuts, and a comment line after U+2028
after its closing brace] [test: an empty attribute block with an empty line
before its closing brace, of an entity that follows a name that a comment line
cuts, and a comment line after U+2028 after its closing brace] [test: an
attribute block of an entity that follows a name that a comment line cuts, and a
comment line after U+2028 at the end of the text] [test: an attribute block of
an entity that follows a name that a comment line cuts, and two comment lines
after U+2028 after its closing brace] [test: an attribute block of an entity
that follows a name that a comment line cuts, and a comment line after U+2029
after its closing brace] [test: an attribute block of an entity that follows a
name that a comment line cuts, and a statement touching its closing brace]
[test: an attribute block of an entity that follows a name that a comment line
cuts, with an indented closing brace and a comment line after U+2028] [test: two
attribute blocks of entities that follow a name that a comment line cuts, with a
comment line after U+2028 between them] [test: two spaces before the opening
brace of an entity that follows a name that a comment line cuts] [test: two
spaces before the opening brace of an empty attribute block of an entity that
follows a name that a comment line cuts] [test: a tab before the opening brace
of an entity that follows a name that a comment line cuts] [test: an alias with
spaces before the opening brace of an entity that follows a name that a comment
line cuts] [test: CSS classes with spaces before the opening brace of an entity
that follows a name that a comment line cuts] [test: a directive before the
opening brace of an entity that follows a name that a comment line cuts] [test:
two spaces before the opening brace of an entity that starts the line, after a
comment line after U+2028] [test: an attribute that starts on the line of the
opening brace and goes on over the next line, of an entity that follows a name
that a comment line cuts]

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
break.

[test: U+2028 inside an entity name] [test: U+2029 inside a role name] [test:
U+2028 before the colon of a role] [test: U+2028 between direction and its
value] [test: U+2028 in the text after a direction] [test: U+2028 inside an
attribute name]

An entity header, a subgraph header, or a class definition with a comment line
after U+2028 or U+2029 keeps the whitespace and the line breaks of that span as
written: mermaid.js removes the comment line and its preceding whitespace,
joining the continuation to the text before the separator. The colors of a class
definition on it are printed as under [Colors](#colors).

[test: a comment line after U+2028 in an ER entity header] [test: a comment line
after U+2029 in an ER entity header] [test: a comment line after U+2028 in an ER
subgraph header] [test: a comment line after U+2029 in an ER subgraph header]
[test: a comment line after U+2028 in an ER class definition] [test: a comment
line after U+2029 in an ER class definition]
