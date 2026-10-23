# Sankey formatting rules

Japanese version: [sankey.ja.md](./sankey.ja.md)

How prettier-plugin-mmd formats a sankey diagram. Each rule below keeps what
mermaid.js reads from the diagram; where a change would alter it, the text is
kept as written, and the rule says where. A sankey diagram is a list of records
in the form of CSV, so it has few rules, and the rules that it has are narrow:
mermaid.js rejects a tab, a character outside ASCII, and a space next to a
quote.

Each rule below shows its formatting with examples: the text before formatting,
and the text that the plugin prints. The examples are the fixtures that the
tests check, and the link above each one is to its file. How the fixtures are
organized and checked is described in
[Documents and fixtures](./development.md#documents-and-fixtures).

## Rules

### Indentation

The header, the records, the comment lines, and the directive lines all stand at
the first column, whatever the `useTabs` and `tabWidth` options say. A sankey
diagram is a list of records in the form of CSV, and two kinds of its lines
cannot be indented: mermaid.js rejects a space before a quote, so a record that
starts with a string has no indentation, and a line of only a directive is a
line of whitespace once the directive is removed, which is a field without a
comma (diagrams/sankey.md, Characters and Diagram and records). It rejects a tab
anywhere, so a tab could not indent the others. One column for every line avoids
a mix of columns. [fixture: indentation/header-and-records-at-the-first-column]
[fixture: indentation/quoted-first-record-at-the-first-column] [fixture:
indentation/written-indentation-dropped] [fixture: indentation/tab-width-4]
[fixture: indentation/use-tabs]

The indentation of a comment line is no part of the Db and could be kept, but it
is dropped too, so that every line stands in one column, and a directive line
stands there in any case. [fixture:
indentation/comment-lines-at-the-first-column] [fixture:
indentation/directive-lines-at-the-first-column]

Input
([indentation/header-and-records-at-the-first-column-input.mmd](../tests/fixtures/sankey/indentation/header-and-records-at-the-first-column-input.mmd)):

```mmd
  sankey-beta
   a,b,1
  c,d,2
```

Output
([indentation/header-and-records-at-the-first-column-output.mmd](../tests/fixtures/sankey/indentation/header-and-records-at-the-first-column-output.mmd)):

```mmd
sankey-beta
a,b,1
c,d,2
```

Input
([indentation/quoted-first-record-at-the-first-column-input.mmd](../tests/fixtures/sankey/indentation/quoted-first-record-at-the-first-column-input.mmd)):

```mmd
sankey
"a",b,1
   c,d,2
```

Output
([indentation/quoted-first-record-at-the-first-column-output.mmd](../tests/fixtures/sankey/indentation/quoted-first-record-at-the-first-column-output.mmd)):

```mmd
sankey
"a",b,1
c,d,2
```

### Commas

A field without quotes is read without the whitespace at its ends, so the Db is
the same wherever the spaces around a comma stand, except between a `:` and a
later `#` of a line that the line rule reads (see below). The comma touches the
fields on both sides, and the whitespace around them is dropped, for a reason
that is not in the Db: mermaid.js rejects a space next to a quote, so a string
can have no space before it (`a, "b",1` is rejected), and a rule that put a
space after each comma would give one record two shapes, a space before a field
without quotes and none before a string. With the commas touching there is one
rule, and it is the form that the documentation of mermaid.js writes. The
whitespace inside a field stays. [fixture: commas/spaces-around-commas-dropped]
[fixture: commas/space-after-comma-dropped] [fixture:
commas/spaces-inside-fields-kept] A directive next to a comma keeps one space
where whitespace was written beside it (see [Directives](#directives)), and a
field of spaces only is printed as one space, so the two together can stand side
by side: `a,   %%{init: {}}%%,1` is printed `a,  %%{init: {}}%%,1`, with two
spaces. [fixture: directives/next-to-commas] A space next to a quote is rejected
by mermaid.js, so a string touches its commas, and the space before a field
after a string, which is read as the whitespace of that field, is dropped.
[fixture: commas/quoted-fields-touch-commas]

A field of spaces only is a field with an empty text, and an empty field is
rejected, so it is printed as one space: the number of the spaces is not in the
Db, and one is the least that keeps the field. A value of spaces only before
another record ends its line with that space. [fixture:
commas/spaces-only-field-is-one-space] [fixture:
commas/spaces-only-value-before-another-record] [fixture:
commas/spaces-only-value-then-comment-line] [fixture:
blank-lines/after-a-value-of-spaces-only] The whitespace at the end of a record
is dropped. [fixture: commas/trailing-whitespace-dropped]

A `;` is a character of a field. The line rule of mermaid.js ignores the last
`;` of a line that holds `style`, a `:`, a `#` after it, and a `;` after that,
but only when no whitespace lies between the `:` and the `#`. So the whitespace
between a `:` and a later `#` of such a line keeps whether it is there, even
where it lies around a comma, and is one space where it is there, since the rule
asks only whether some is there and not how much. The whitespace elsewhere on
the line does not change which `;` is ignored. [fixture:
commas/style-line-colon-and-hash-in-two-fields-kept] [fixture:
commas/style-line-colon-and-hash-touching-kept] [fixture:
commas/style-line-spaces-between-colon-and-hash-become-one] [fixture:
commas/semicolon-fields] [fixture: commas/style-line] [fixture:
commas/style-line-in-another-field] A `;` that the rule ignores at the end of a
line is kept: without it, the last `;` of the line is another one, and
`style:#x,b;c,1;` has the target `b;c`, where `style:#x,b;c,1` has the target
`bc`. [fixture: commas/ignored-semicolon-at-the-end-kept] A line that dropping a
`;` would change the end of is printed as written, the whitespace around its
commas included: an ignored `;` next to another `;`. [fixture:
commas/semicolon-ends-the-line-kept]

Input
([commas/spaces-around-commas-dropped-input.mmd](../tests/fixtures/sankey/commas/spaces-around-commas-dropped-input.mmd)):

```mmd
sankey
a , b , 1
c  ,  d  ,  2
```

Output
([commas/spaces-around-commas-dropped-output.mmd](../tests/fixtures/sankey/commas/spaces-around-commas-dropped-output.mmd)):

```mmd
sankey
a,b,1
c,d,2
```

Input
([commas/quoted-fields-touch-commas-input.mmd](../tests/fixtures/sankey/commas/quoted-fields-touch-commas-input.mmd)):

```mmd
sankey
"a", b,"1"
a,"b",  1
```

Output
([commas/quoted-fields-touch-commas-output.mmd](../tests/fixtures/sankey/commas/quoted-fields-touch-commas-output.mmd)):

```mmd
sankey
"a",b,"1"
a,"b",1
```

Input
([commas/style-line-input.mmd](../tests/fixtures/sankey/commas/style-line-input.mmd)):

```mmd
sankey
style:#x;y , b , 1
```

Output
([commas/style-line-output.mmd](../tests/fixtures/sankey/commas/style-line-output.mmd)):

```mmd
sankey
style:#x;y,b,1
```

### Quotes

The quotes of a field are printed as written. `"a"` and `a` are the same id in
the Db, and so are `" a"` and `a`, but they are the text that the author wrote,
and a string may hold a comma or a doubled quote that a field without quotes
cannot. The text between the quotes is a value: its whitespace stays. [fixture:
quotes/quotes-kept] [fixture: quotes/unneeded-quotes-kept] [fixture:
quotes/comma-and-doubled-quotes-kept] [fixture:
quotes/spaces-inside-quotes-kept]

Input
([quotes/comma-and-doubled-quotes-kept-input.mmd](../tests/fixtures/sankey/quotes/comma-and-doubled-quotes-kept-input.mmd)):

```mmd
sankey
Pumped heat  ,"Heating and cooling, ""homes""",   193.026
```

Output
([quotes/comma-and-doubled-quotes-kept-output.mmd](../tests/fixtures/sankey/quotes/comma-and-doubled-quotes-kept-output.mmd)):

```mmd
sankey
Pumped heat,"Heating and cooling, ""homes""",193.026
```

### Values

The value of a link is printed as written: mermaid.js reads it as a number, so
`1.0`, `1e0`, `+1`, and `.5` are the same value as `1`, and `abc` is accepted,
but none is rewritten: the spelling is the author's, and every spelling gives
the same Db. A `%%` or a `#` after the value is a character of the field, not a
comment, and stays with it. [fixture: values/value-forms-kept] [fixture:
values/text-after-the-value-kept]

Input
([values/text-after-the-value-kept-input.mmd](../tests/fixtures/sankey/values/text-after-the-value-kept-input.mmd)):

```mmd
sankey
a,b,1 %% c
d,e,2 # f
```

Output
([values/text-after-the-value-kept-output.mmd](../tests/fixtures/sankey/values/text-after-the-value-kept-output.mmd)):

```mmd
sankey
a,b,1 %% c
d,e,2 # f
```

### Multi-line strings

A string may go over lines. The lines are part of the string, the whitespace at
the start of a later line is part of its value, and empty lines and comment
lines inside it are printed as written, so a string is one piece that the
printer does not reformat. The fields around it are formatted as elsewhere.
[fixture: multi-line-strings/string-over-lines] [fixture:
multi-line-strings/empty-line-in-string] [fixture:
multi-line-strings/comment-line-in-string] [fixture:
multi-line-strings/comma-and-fields-after-the-string] [fixture:
multi-line-strings/second-field-string-over-lines] [fixture:
multi-line-strings/directive-line-in-string] [fixture:
multi-line-strings/style-line-after-a-string]

Input
([multi-line-strings/string-over-lines-input.mmd](../tests/fixtures/sankey/multi-line-strings/string-over-lines-input.mmd)):

```mmd
sankey
"a
  b",c,1
d , e , 2
```

Output
([multi-line-strings/string-over-lines-output.mmd](../tests/fixtures/sankey/multi-line-strings/string-over-lines-output.mmd)):

```mmd
sankey
"a
  b",c,1
d,e,2
```

### Blank lines

Runs of empty lines become one empty line, and empty lines at the start and the
end of the body are dropped, also right after the header. [fixture:
blank-lines/collapsed] [fixture: blank-lines/after-the-header-dropped] [fixture:
blank-lines/end-of-text-dropped] The empty lines around comment lines and
directive lines are handled in the same way. [fixture:
blank-lines/around-comment-lines] [fixture: blank-lines/around-directive-lines]
These are the rules of the other diagram types, so that this diagram type has no
rule of its own: the empty line that the documentation of mermaid.js writes
after the header is dropped like any other at the start of the body.

Input
([blank-lines/collapsed-input.mmd](../tests/fixtures/sankey/blank-lines/collapsed-input.mmd)):

```mmd
sankey
a,b,1



c,d,2
```

Output
([blank-lines/collapsed-output.mmd](../tests/fixtures/sankey/blank-lines/collapsed-output.mmd)):

```mmd
sankey
a,b,1

c,d,2
```

### Header

The header `sankey` or `sankey-beta` keeps the case in which it is written: Both
are the same diagram type and give the same Db, so nothing forces either
spelling, and the printer keeps the one that the author wrote. It stands at the
first column, and nothing follows it on its line, since mermaid.js rejects
anything but a directive or a comment line there. [fixture: header/sankey]
[fixture: header/sankey-beta] [fixture: header/upper-case-beta] [fixture:
header/leading-whitespace-dropped] A directive glued to the header stays glued.
[fixture: header/directive-glued-to-the-header] A comment line or a directive
line before the header, and comment lines after it, stay where they are.
[fixture: header/comment-line-before-the-header] [fixture:
header/directive-line-before-the-header] [fixture:
header/comment-lines-after-the-header]

Input
([header/leading-whitespace-dropped-input.mmd](../tests/fixtures/sankey/header/leading-whitespace-dropped-input.mmd)):

```mmd
   sankey
a,b,1
```

Output
([header/leading-whitespace-dropped-output.mmd](../tests/fixtures/sankey/header/leading-whitespace-dropped-output.mmd)):

```mmd
sankey
a,b,1
```

Input
([header/comment-line-before-the-header-input.mmd](../tests/fixtures/sankey/header/comment-line-before-the-header-input.mmd)):

```mmd
%% c
  sankey
a,b,1
```

Output
([header/comment-line-before-the-header-output.mmd](../tests/fixtures/sankey/header/comment-line-before-the-header-output.mmd)):

```mmd
%% c
sankey
a,b,1
```

### Comments

A comment is a line that starts with `%%`, and it is removed before mermaid.js
reads the text. Its text and mark are kept as written, and it stands at the
first column, like every other line (see Indentation). [fixture:
comments/lines-at-the-first-column] [fixture: comments/text-kept] [fixture:
comments/comment-line-only-in-the-body] A `%%` or a `#` inside a record is a
character of a field, not a comment, and stays with the field. [fixture:
comments/percent-in-fields-kept] [fixture: comments/hash-in-fields-kept]

Input
([comments/lines-at-the-first-column-input.mmd](../tests/fixtures/sankey/comments/lines-at-the-first-column-input.mmd)):

```mmd
sankey
  %% one
a,b,1
     %% two
c,d,2
    %% three
```

Output
([comments/lines-at-the-first-column-output.mmd](../tests/fixtures/sankey/comments/lines-at-the-first-column-output.mmd)):

```mmd
sankey
%% one
a,b,1
%% two
c,d,2
%% three
```

### Directives

A directive on a line of its own stands at the first column: whitespace before
it would leave a line of whitespace, which mermaid.js rejects. [fixture:
directives/kept] A directive after a value keeps whether whitespace is written
before it: where it is, one space stands there, and where it touches, it keeps
touching, as in the other diagram types. A directive at the start of a record
keeps whether whitespace is written between it and the record: touching stays
touching, and whitespace becomes one space. [fixture:
directives/after-the-value] [fixture: directives/at-the-start-of-a-record] A
directive next to a comma keeps one space where whitespace was written beside
it, as anywhere (see [Commas](#commas) for a field of spaces only). [fixture:
directives/next-to-commas]

A directive inside a field or a string is part of the text and stays. A
directive that is not closed takes the rest of the text, and is kept as written.
[fixture: directives/inside-fields-kept] [fixture:
directives/unclosed-at-the-end-kept]

Input
([directives/after-the-value-input.mmd](../tests/fixtures/sankey/directives/after-the-value-input.mmd)):

```mmd
sankey
a,b,1 %%{init: {}}%%
c,d,2%%{init: {}}%%
e,f,3    %%{init: {}}%%
```

Output
([directives/after-the-value-output.mmd](../tests/fixtures/sankey/directives/after-the-value-output.mmd)):

```mmd
sankey
a,b,1 %%{init: {}}%%
c,d,2%%{init: {}}%%
e,f,3 %%{init: {}}%%
```

### Frontmatter YAML

As in a flowchart: the YAML between the `---` lines is formatted with Prettier's
YAML formatter, and the `---` lines are kept as written, with the spaces and
tabs at the end of each. [fixture: frontmatter-yaml/formatted] [fixture:
frontmatter-yaml/closing-delimiter-whitespace-kept] [fixture:
frontmatter-yaml/sankey-settings] The YAML is kept as written when Prettier
cannot read it. [fixture: frontmatter-yaml/malformed-kept] A comment line
between the frontmatter and the header is kept. [fixture:
frontmatter-yaml/comment-after-frontmatter-before-header]

Input
([frontmatter-yaml/sankey-settings-input.mmd](../tests/fixtures/sankey/frontmatter-yaml/sankey-settings-input.mmd)):

```mmd
---
config:
  sankey:
    showValues:   false
---
sankey
a,b,1
```

Output
([frontmatter-yaml/sankey-settings-output.mmd](../tests/fixtures/sankey/frontmatter-yaml/sankey-settings-output.mmd)):

```mmd
---
config:
  sankey:
    showValues: false
---
sankey
a,b,1
```

### Whitespace characters

mermaid.js accepts a tab, U+00A0, U+3000, U+2028, U+2029, and U+FEFF only at the
end of the text, where whitespace is dropped before the text is read. They are
dropped from the output, and the text ends with the line break after the last
record. The examples are written as strings, in which `\u00a0` is U+00A0,
`\u3000` is U+3000, and `\n` is a line break. [test: U+00A0 at the end of the
text] [test: U+3000 at the end of the text without a line feed] [test: U+2028 at
the end of the text without a line feed] [test: U+2029 at the end of the text]
[test: U+FEFF at the end of the text without a line feed] [test: a tab at the
end of the text without a line feed] [test: U+00A0 on a line of its own at the
end of the text] A comment line at the end of the text keeps its characters, a
U+00A0 included, as a comment does elsewhere. [test: U+00A0 at the end of the
last comment line of the text]
