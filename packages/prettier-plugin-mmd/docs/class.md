# Class diagram formatting rules

Japanese version: [class.ja.md](./class.ja.md)

How prettier-plugin-mmd formats a class diagram. Each rule below keeps what
mermaid.js reads from the diagram; where a change would alter it, the text is
kept as written, and the rule says where. Where a rule is the same as in a
flowchart, it says so, and the reason is in the
[rules for flowcharts](./flowchart.md).

Each rule below shows its formatting with examples: the text before formatting,
and the text that the plugin prints. The examples are the fixtures that the
tests check, and the link above each one is to its file. How the fixtures are
organized and checked is described in
[Documents and fixtures](./development.md#documents-and-fixtures).

## Rules

### Indentation

The statements after the header stand one level deeper than the header.
[fixture: indentation/written-indentation-dropped] [fixture:
indentation/header-v2-kept] The `{` of a namespace stands on the line of its
name, after one space, as the `{` of a member body does and as the documentation
of mermaid.js writes it; the statements of the namespace stand one level deeper
than that line, and its `}` stands on a line of its own at the level of that
line, also when the namespace was written on one line. [fixture:
indentation/namespaces] [fixture: indentation/namespace-brace-after-one-space]
[fixture: indentation/namespace-closing-brace-own-line] [fixture:
member-bodies/in-namespace-indented] A level is what Prettier's `useTabs` and
`tabWidth` options say: two spaces by default. [fixture: indentation/namespaces]
[fixture: indentation/tab-width-4] [fixture: indentation/use-tabs] The
indentation written in the input is replaced by the indentation of the
structure. Body indentation has a minimum width of one character even with
`tabWidth: 0`: an indented member line such as `[*]` is an attribute, but at
column zero mermaid.js and the parser reject it. Thus `"class Zero {\n  [*]\n}"`
prints as `" class Zero {\n  [*]\n }"` at width zero; `useTabs` uses a tab per
level. [fixture: indentation/member-edge-state-zero-width] [fixture:
indentation/member-edge-state-zero-width-tabs] [corpus fixture:
class/lex-member-edge-state-indented] The shared minimum is the same as for
[flowchart](./flowchart.md#indentation), where the column also affects the
reading. [fixture: indentation/namespaces] [fixture:
indentation/written-indentation-dropped]

A namespace or member-body opening split by a comment region after U+2028 or
U+2029 keeps its written lines and spacing: mermaid.js joins the text on either
side of the removed comment. [test: class: ls-comment-in-namespace-opening]
[test: class: ps-comment-in-member-opening]

Input
([indentation/namespaces-input.mmd](../tests/fixtures/class/indentation/namespaces-input.mmd)):

```mmd
classDiagram
namespace Shapes {
class Triangle
    namespace Inner {
class Square
}
}
namespace One { class A }
```

Output
([indentation/namespaces-output.mmd](../tests/fixtures/class/indentation/namespaces-output.mmd)):

```mmd
classDiagram
  namespace Shapes {
    class Triangle
    namespace Inner {
      class Square
    }
  }
  namespace One {
    class A
  }
```

### Member bodies

The `{` of a class's member body stays on the line of the class, after one
space, as the documentation of mermaid.js writes it; each member line stands on
a line of its own, one level deeper; and the `}` stands on a line of its own at
the level of the class, unless a directive stands before it on its line:
`%%{init: {}}%% }` stays as it is written. [fixture:
member-bodies/directive-on-closing-brace-line-kept] [fixture:
member-bodies/split] [fixture: member-bodies/opening-brace-after-one-space]
[fixture: member-bodies/in-namespace-indented] A body written on one line, as in
`class Duck { +swim() }`, is split so: mermaid.js ends a member line at a line
break, a `{`, or a `}`, so it reads the same members. [fixture:
member-bodies/split] [corpus fixture: class/lex-member-body-one-line] [corpus
fixture: class/lex-member-body-close-on-member-line] An empty body, with nothing
but whitespace between its braces, is printed as `{ }` on the line of the class,
however it is written: `{}`, `{   }`, and braces on two lines all declare the
class without members. [fixture: member-bodies/empty-unified] [fixture:
member-bodies/empty-other-forms-unified] [fixture:
member-bodies/in-namespace-indented] After a CSS class, the body needs a member
line, and a line of only whitespace is one, so `class C:::c {}` is rejected and
`class C:::c { }` is accepted: `{ }` is the form that holds everywhere.
[fixture: member-bodies/empty-unified] [corpus fixture:
class/gram-class-css-class-empty-body] [corpus fixture:
class/gram-class-css-class-blank-body] A body after a CSS class with a line of
only whitespace inside becomes `{ }` too; the whitespace is at the end of a
line, so the example is written as strings, in which `\n` is a line break:
`"classDiagram\nclass E:::c {\n  \n\n}\n"` is printed as
`"classDiagram\n  class E:::c { }\n"` (the fixture
`empty-whitespace-line-unified` is in the
[folder](../tests/fixtures/class/member-bodies)). [fixture:
member-bodies/empty-whitespace-line-unified] A body without members that holds a
directive keeps it: on one line, the body stays on the line of the class. A
comment stands on a line of its own (a `%%` on the line of the `{` is a member),
so a body with only a comment is written over several lines, and printed as a
body; so is a body with only a directive written over several lines. [fixture:
member-bodies/empty-unified] [fixture:
member-bodies/comment-only-over-lines-kept] [fixture:
member-bodies/directive-only-over-lines-kept] [fixture:
member-bodies/percent-member-kept] [corpus fixture: class/lex-member-percent]

Input
([member-bodies/split-input.mmd](../tests/fixtures/class/member-bodies/split-input.mmd)):

```mmd
classDiagram
class Animal{
+int age
        +isMammal()
}
class Duck { +swim() }
class Fish {+name
+swim()}
```

Output
([member-bodies/split-output.mmd](../tests/fixtures/class/member-bodies/split-output.mmd)):

```mmd
classDiagram
  class Animal {
    +int age
    +isMammal()
  }
  class Duck {
    +swim()
  }
  class Fish {
    +name
    +swim()
  }
```

Input
([member-bodies/empty-unified-input.mmd](../tests/fixtures/class/member-bodies/empty-unified-input.mmd)):

```mmd
classDiagram
class A {}
class B {   }
class C:::c { }
class D {
}
class E {

}
class F { %%{init: {}}%% }
```

Output
([member-bodies/empty-unified-output.mmd](../tests/fixtures/class/member-bodies/empty-unified-output.mmd)):

```mmd
classDiagram
  class A { }
  class B { }
  class C:::c { }
  class D { }
  class E { }
  class F { %%{init: {}}%%}
```

### Blank lines

As in a flowchart: a run of empty lines becomes one, and empty lines at the
start and the end of a namespace or a member body are dropped. [fixture:
blank-lines/collapsed] [fixture: blank-lines/namespace-edges-dropped] [fixture:
blank-lines/edges-around-comment-and-directive-lines-dropped] [fixture:
blank-lines/around-comment-and-directive-lines-collapsed] [fixture:
blank-lines/end-of-text-dropped] [fixture:
multi-line-statements/empty-line-inside-joined] [fixture:
empty-description-blocks/followed-by-empty-lines-collapsed]

Input
([blank-lines/collapsed-input.mmd](../tests/fixtures/class/blank-lines/collapsed-input.mmd)):

```mmd
classDiagram


class A



class B {

+x


+y

}
```

Output
([blank-lines/collapsed-output.mmd](../tests/fixtures/class/blank-lines/collapsed-output.mmd)):

```mmd
classDiagram
  class A

  class B {
    +x

    +y
  }
```

### Whitespace between tokens

Within a line, a run of spaces and tabs between two tokens becomes one space,
and tokens that touch keep touching, as in a flowchart, except for the cases
named below: a string, a backquoted name, or the `call` keyword after what comes
before it, the `[` of a label, and the `~` of a generic type. [fixture:
whitespace-between-tokens/collapsed] [fixture:
whitespace-between-tokens/tabs-collapsed] [fixture:
empty-description-blocks/touching-kept] [fixture:
empty-description-blocks/inner-whitespace-collapsed] [fixture:
generic-types/whitespace-before-collapsed-inside-kept] This holds between the
name parts of a class name: `class Foo Bar` declares the class `FooBar`, and it
is printed as `class Foo Bar`, as written; joining the parts could make a
keyword, as in `class no te`, which declares `note`, while `class note` is
rejected. [fixture: whitespace-between-tokens/collapsed] [fixture:
whitespace-between-tokens/name-parts-keyword-kept] The `:::` of a CSS class
touches the name before it and the class after it: `class A :::c` and
`class A ::: c` are printed `class A:::c`, as in an ER diagram. mermaid.js reads
every spelling as the same class, so nothing forces the form; the four examples
of its documentation write `class Animal:::someclass`, `class Animal:::pink`,
and `class Animal:::styleClass`, with and without a body
([here](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/classDiagram.md#L780-L833)).
[fixture: whitespace-between-tokens/css-class-touches-separator] A directive in
the gap is placed as under [Directives](#directives), and a U+2028 or U+2029
stays where it is. [test: U+2028 before the `:::` of a class] [test: U+2029
after the `:::` of a class] The annotation of a class, `<<interface>>`, has one
space before the `<<` (or after the `>>`, where it stands before the class) and
nothing inside the delimiters: `class S<<i>>` and `class S <<  i  >>` are
printed `class S <<i>>`, and `<<interface>>Class01` and `<< interface>>Class01`
are printed `<<interface>> Class01`. mermaid.js trims the text of an annotation
outside a body, so every spelling gives the same Db. The documentation of
mermaid.js writes both placements with this spacing:
[`class Shape <<interface>>`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/classDiagram.md#L544)
and
[`<<interface>> Shape`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/classDiagram.md#L552).
[fixture: whitespace-between-tokens/annotation-spaced-once] A directive in the
gap is placed as under [Directives](#directives). [fixture:
whitespace-between-tokens/annotation-beside-directive-runs] The annotation line
in a body is not an annotation of this kind: its text is part of the Db, and it
stays as written (see [Member lines](#member-lines)). A U+2028 or U+2029 stays
where it is. [test: U+2028 before the `<<` of a class annotation] The rest of
this holds for a label in brackets, and the words of `note for`, `click`,
`style`, and `cssClass` statements. [fixture:
whitespace-between-tokens/collapsed] [fixture:
whitespace-between-tokens/after-name-collapsed] [fixture:
whitespace-between-tokens/words-collapsed] [fixture:
whitespace-between-tokens/tabs-collapsed] A line that holds only a class name,
which declares nothing, is kept at the level of the statements around it.
[fixture: whitespace-between-tokens/collapsed] [fixture:
whitespace-between-tokens/tabs-collapsed]

A string, a backquoted name, or the `call` keyword that touches what comes
before it is separated from it by one space in a `class`, `namespace`, `note`,
`link`, `click`, or `cssClass` statement: `note"n"` is printed `note "n"`,
`note for A"n"` is printed `note for A "n"`, `` class`C D` `` and
``namespace`N M` {`` are printed with a space after the keyword, `link A"u""t"`
is printed `link A "u" "t"`, `click B href"u""t"_self` is printed
`click B href "u" "t" _self`, `cssClass"A,B"c` is printed `cssClass "A,B" c`,
`click C call f()"t"` is printed `click C call f() "t"`, and
`click C~T~call f()` is printed `click C~T~ call f()`. mermaid.js reads every
spelling as the same statement, so nothing forces the form; its documentation
writes a space before each string
([`note "…"` and `note for MyClass "…"`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/classDiagram.md#L639-L640),
[`link Shape "…" "…"` and `click Shape2 href "…" "…"`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/classDiagram.md#L650-L652),
[`cssClass "nodeId1,nodeId2" className`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/classDiagram.md#L773)).
[fixture: whitespace-between-tokens/note-and-name-strings-touching-spaced]
[fixture: whitespace-between-tokens/link-strings-touching-spaced] [fixture:
whitespace-between-tokens/call-after-generic-touching-spaced] A directive in the
gap is placed as under [Directives](#directives), and a U+2028 or U+2029 stays
where it is. [fixture: whitespace-between-tokens/strings-beside-directive]
[test: U+2028 between the note keyword and its string] [test: U+2029 between the
class of a note and its string] [test: U+2028 between the class keyword and a
backquoted name] [test: U+2029 between a link and its URL] [test: U+2028 between
the URL and the tooltip of a link] [test: U+2029 between the tooltip and the
target of a link] [test: U+2028 between the cssClass keyword and its string]
[test: U+2029 between a callback and its tooltip] [test: U+2028 between a
generic type and the call of a callback]

The names of a `classDef` statement are separated by a `,` that touches both
names: `classDef c1 , c2 fill:#f00` is printed `classDef c1,c2 fill: #f00`, as
the lists of ER, requirement, and usecase are (see
[Styles and classes](./er.md#styles-and-classes)). mermaid.js reads every
spelling as the same statement, so nothing forces the form, and its
documentation writes the one example touching
([`classDef firstClassName,secondClassName`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/classDiagram.md#L761)).
[fixture: whitespace-between-tokens/classdef-names-touching] A directive in the
gap is placed as under [Directives](#directives): the gaps beside a `,` have no
space, so the directive touches the names and the `,`. [fixture:
whitespace-between-tokens/classdef-names-beside-directive] [fixture:
whitespace-between-tokens/classdef-names-beside-directive-runs] A `;` or a `#`
that ends the statement follows
[Semicolons at the end of a style statement](#semicolons-at-the-end-of-a-style-statement).
[fixture: whitespace-between-tokens/classdef-names-touching-before-terminator] A
U+2028 or U+2029 after the `,` stays where it is. [test: U+2028 after the comma
of a classDef statement] [test: U+2029 after the comma of a classDef statement]

In a `classDef` or a `style` statement, each style has no whitespace before its
first `:` and one space after it where the value is not empty. The `,` between
styles has no whitespace before it and one space after it:
`style C fill:#f9f  ,  stroke:#333` is printed
`style C fill: #f9f, stroke: #333`. A run of spaces and tabs between the words
of a style is printed as one space: `style C border:1px   solid` is printed
`style C border: 1px solid`. A run inside the parentheses of `url(` stays as
written, since CSS reads it as part of the value. mermaid.js keeps the margins
and the runs in the Db but draws the same figure (see
[Styles that are drawn the same](./compatibility.md#styles-that-are-drawn-the-same)).
[fixture: whitespace-between-tokens/style-colon-spaced] [fixture:
whitespace-between-tokens/style-value-words-spaced] [fixture:
whitespace-between-tokens/style-url-runs-kept] The same holds for styles that
are words without a `:`, which mermaid.js reads as tokens of their own:
`style A bold ,italic` is printed `style A bold, italic`, and
`style A fill   #f00` is printed `style A fill #f00`. Whether whitespace stands
between two words stays as written: mermaid.js joins the words, so `fill #f00`
and `fill#f00` are the same style, and a word that touches the next stays
touching, as a gap does elsewhere (see [Directives](#directives)); joining the
words would hide where one word ends. [fixture:
whitespace-between-tokens/style-words-comma-spaced] [fixture:
whitespace-between-tokens/style-words-as-written] [fixture:
whitespace-between-tokens/style-words-run-spaced] A statement with a comment or
a directive between its words keeps them as written. [fixture:
whitespace-between-tokens/style-words-directive-kept] A backslash does not
escape a `,` here: `fill:a\,b ,stroke:c` is printed `fill: a\, b, stroke: c`.
[fixture: whitespace-between-tokens/style-backslash-before-comma] A `style`
whose last style ends with a backslash keeps whether whitespace stands after it,
a run of whitespace becoming its first character, also at the end of the
statement, since mermaid.js joins the styles of a class with `;` as they are,
and the backslash would escape the `;` (see
[Styles that are drawn the same](./compatibility.md#styles-that-are-drawn-the-same)):
`style A fill:abc\  ,stroke:green` is printed
`style A fill: abc\ , stroke: green`. [fixture:
whitespace-between-tokens/style-backslash-space-kept] [fixture:
whitespace-between-tokens/style-backslash-at-end-kept] A `classDef` keeps it
too: where it stands after the class it is put on, mermaid.js adds its styles to
those of the class as they are, and where it stands before, it takes the
whitespace away, with the same pixels, so the order of the statements decides
and the printer keeps it as written either way:
`classDef c fill:abc\  ,stroke:green` is printed
`classDef c fill: abc\ , stroke: green`. [fixture:
whitespace-between-tokens/class-def-backslash-space-kept] [fixture:
whitespace-between-tokens/class-def-backslash-at-end-kept] A statement stays as
written where it holds a comment or a directive, where a style is all
whitespace, or where a style holds a line break or its line holds a kept `;`.
[fixture: whitespace-between-tokens/style-comma-before-dropped] [fixture:
whitespace-between-tokens/style-comma-beside-directive-kept] [fixture:
whitespace-between-tokens/style-colon-and-comma-spaced] A U+2028 or U+2029 among
the styles keeps the statement as written. [test: U+2028 before the comma of a
class style statement]

U+2028 and U+2029 after the `}` that closes a class body or a namespace are
whitespace to mermaid.js, and are dropped with the whitespace at the end of the
line. [test: U+2029 after the `}` of a class body] [test: U+2028 after the `}`
of a namespace]

Input
([whitespace-between-tokens/collapsed-input.mmd](../tests/fixtures/class/whitespace-between-tokens/collapsed-input.mmd)):

```mmd
classDiagram
class   Foo   Bar
class A  <<interface>>
class B["Label"]
class C:::highlight
note for   C   "a note"
click   C   href "https://example.com"  "tip"
style   C   fill:#f9f
cssClass  "A,B"  highlight
Foo   Bar
A - B --> C
```

Output
([whitespace-between-tokens/collapsed-output.mmd](../tests/fixtures/class/whitespace-between-tokens/collapsed-output.mmd)):

```mmd
classDiagram
  class Foo Bar
  class A <<interface>>
  class B["Label"]
  class C:::highlight
  note for C "a note"
  click C href "https://example.com" "tip"
  style C fill: #f9f
  cssClass "A,B" highlight
  Foo Bar
  A - B --> C
```

The whitespace between the name of the function after `call` and the `(` that
follows it is kept as written: mermaid.js reads the name up to the `(`,
whitespace included, so `click A call fn  ()` calls the function named `fn` and
two spaces. A line break there is kept too, and the statement stays on two
lines. The arguments have no whitespace at their ends or before a `,`, and one
space after it: `click A call f(  "x" ,y )` is printed `click A call f("x", y)`,
since mermaid.js splits the arguments at the `,` outside quotes and trims each
part, and calls the function with the same arguments (see
[Call arguments that are drawn the same](./compatibility.md#call-arguments-that-are-drawn-the-same)).
The whitespace inside quotes stays, and so do arguments with an empty part.
[fixture: whitespace-between-tokens/callback-arguments-spaced] A gap between the
arguments that the line rule of mermaid.js may read keeps whether it holds
whitespace: `click A call f(style:x,#b;c)` stays as written, since a space after
the `,` would change the last `;` that the rule ignores (see
[Call arguments that are drawn the same](./compatibility.md#call-arguments-that-are-drawn-the-same)).
[fixture: whitespace-between-tokens/callback-arguments-line-rule-kept] The
parentheses of a call with blank arguments touch each other: `click A call f( )`
is printed `click A call f()`, since mermaid.js reads both as the same call with
no arguments. A directive between them touches both parentheses, as under
[Directives](#directives). [fixture:
whitespace-between-tokens/callback-blank-parentheses-touch] So do the
parentheses with a line break between them, while a comment line there stays on
its own line. [fixture:
whitespace-between-tokens/callback-blank-parentheses-lines] A U+2028 or U+2029
between them stays where it is. [test: U+2028 between the parentheses of a blank
class callback] [test: U+2029 between the parentheses of a blank class callback]
Arguments with a comment line or a directive among them are printed as written
through the `)`: the whitespace before the `)` is part of the arguments in the
Db, so a comment line before the `)` must not indent it. [fixture:
whitespace-between-tokens/callback-args-comment-line-kept] [fixture:
whitespace-between-tokens/callback-name-kept] [fixture:
whitespace-between-tokens/callback-name-tab-kept] [fixture:
whitespace-between-tokens/callback-name-directive-kept] [fixture:
whitespace-between-tokens/callback-name-comment-line-kept] [corpus fixture:
class/lex-callback-name-multi-line]

Input
([whitespace-between-tokens/callback-name-kept-input.mmd](../tests/fixtures/class/whitespace-between-tokens/callback-name-kept-input.mmd)):

```mmd
classDiagram
class A
class B
click A call fn  ( x )
click B call gn
(y)
click B call hn   ()
```

Output
([whitespace-between-tokens/callback-name-kept-output.mmd](../tests/fixtures/class/whitespace-between-tokens/callback-name-kept-output.mmd)):

```mmd
classDiagram
  class A
  class B
  click A call fn  (x)
  click B call gn
(y)
  click B call hn   ()
```

### Arrow spacing

A relation has one space before and after its arrow, and one on each side of
each cardinality, as mermaid.js's documentation writes it:
`Customer"1"-->"*"Ticket` becomes `Customer "1" --> "*" Ticket`. [fixture:
arrow-spacing/spaced] [fixture: arrow-spacing/cardinality-on-one-side] [fixture:
arrow-spacing/whitespace-runs-collapsed] The relation ends and the line of an
arrow are tokens of their own, which may be written with whitespace between
them; they are printed touching, as one arrow: `A <|  --  * B` becomes
`A <|--* B`. [fixture: arrow-spacing/spaced] [fixture:
arrow-spacing/end-or-line-apart-joined] [fixture:
arrow-spacing/directive-between-arrow-tokens]

Input
([arrow-spacing/spaced-input.mmd](../tests/fixtures/class/arrow-spacing/spaced-input.mmd)):

```mmd
classDiagram
Animal<|--Duck
Customer "1"-->"*" Ticket
A <|  --  * B
C..>D
```

Output
([arrow-spacing/spaced-output.mmd](../tests/fixtures/class/arrow-spacing/spaced-output.mmd)):

```mmd
classDiagram
  Animal <|-- Duck
  Customer "1" --> "*" Ticket
  A <|--* B
  C ..> D
```

An arrow is printed as the tree reads it, so the printed text shows how
mermaid.js reads a relation whose arrow touches a name. `o` is a relation end
only when no word character follows it: `A --oB` is a relation without ends to
the class `oB`, printed as `A -- oB`. In `A --- B`, the third `-` is a name part
of the class `-B`, and it is printed as `A -- - B`. [fixture:
arrow-spacing/read-as-written]

Input
([arrow-spacing/read-as-written-input.mmd](../tests/fixtures/class/arrow-spacing/read-as-written-input.mmd)):

```mmd
classDiagram
A --o B
A --oB
A --- B
```

Output
([arrow-spacing/read-as-written-output.mmd](../tests/fixtures/class/arrow-spacing/read-as-written-output.mmd)):

```mmd
classDiagram
  A --o B
  A -- oB
  A -- - B
```

`call` followed by whitespace is a keyword, and the lexer reads it where a unit
starts (the specification's
[The statement context](../../spec/docs/diagrams/class.md#the-statement-context),
rule 10). So an arrow or the `:` of a label that touches a name that ends with
the word `call` stays touching: with a space before it, `A call()--> B` would be
a callback of the class A, and `call-->C` would start one. [fixture:
arrow-spacing/touching-call-kept] [fixture:
arrow-spacing/touching-call-colon-kept] [corpus fixture: class/lex-call-prefix]

Inside an ASCII word, after a letter, digit, or `_`, `call` starts no keyword,
so the ordinary arrow spacing applies. [fixture:
arrow-spacing/call-inside-ascii-word]

Input
([arrow-spacing/touching-call-kept-input.mmd](../tests/fixtures/class/arrow-spacing/touching-call-kept-input.mmd)):

```mmd
classDiagram
A call()--> B
call-->C
D call--|>E
```

Output
([arrow-spacing/touching-call-kept-output.mmd](../tests/fixtures/class/arrow-spacing/touching-call-kept-output.mmd)):

```mmd
classDiagram
  A call()--> B
  call--> C
  D call--|> E
```

### Labels

The `:` of a label after a relation or a class name has one space on each side,
as mermaid.js's documentation writes it: `A-->B:x` becomes `A --> B : x`, and
`A:+int x` becomes `A : +int x`. [fixture: labels/spaced] [fixture:
labels/directive-around-colon] A sequence diagram writes the `:` touching what
comes before it (see [Colons in the sequence rules](./sequence.md#colons)); each
follows the documentation of its diagram type. The `:` after `accTitle` and
`accDescr` touches the keyword and has one space after it, as in the other
diagram types and in the documentation of mermaid.js. [fixture:
labels/accessibility-text-runs-collapsed] [fixture:
multi-line-statements/joined] [fixture: multi-line-statements/acc-descr-joined]
The text of a label after a relation is kept as written: a label that wraps
draws its runs, so a run is not one space (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)).
[fixture: labels/spaced] A run of spaces and tabs in the text of `accDescr` is
printed as one space (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)),
and that of `accTitle` stays as written, since the browser shows it as a
tooltip. [fixture: labels/accessibility-text-runs-collapsed] [fixture:
labels/acc-block-runs-collapsed] The label in brackets of a class or a namespace
has nothing between the name and the `[`, and nothing between the brackets and
the string: `namespace Auth ["x"]` is printed `namespace Auth["x"]`,
`namespace Auth[ "x" ]` is printed `namespace Auth["x"]`, and `class A["x" ]` is
printed `class A["x"]`. mermaid.js reads every spelling as the same label, and
its documentation writes the `[` touching the name
([`namespace Auth["Authentication Service"]`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/classDiagram.md#L404)),
as a flowchart subgraph and an agentflow heading print it. [fixture:
labels/bracket-touches-name] A directive beside the string touches the bracket
and the string, as the gap has no space: `class D[ %%{x}%% "x" ]` is printed
`class D[%%{x}%%"x"]`. A U+2028 or U+2029 before the `]` stays. [fixture:
labels/bracket-directive-at-edge] [test: U+2028 inside the brackets of a class
label] [test: U+2029 inside the brackets of a class label] [test: U+2028 between
a class name and its label] [fixture: labels/bracket-padding-dropped]

Input
([labels/spaced-input.mmd](../tests/fixtures/class/labels/spaced-input.mmd)):

```mmd
classDiagram
A-->B:x
A --> B :x  y
A:+int x
A  :  -bar() int
```

Output
([labels/spaced-output.mmd](../tests/fixtures/class/labels/spaced-output.mmd)):

```mmd
classDiagram
  A --> B : x
  A --> B : x  y
  A : +int x
  A : -bar() int
```

A label of only whitespace is kept with the whitespace after its `:`:
`A --> B : ` gives the relation an empty title, which `A --> B` does not have,
and `A : ` adds the class A, while `A :` is rejected. The whitespace is at the
end of a line, so the example is written as strings, in which `\n` is a line
break: `"classDiagram\nA --> B : \nA :  \n"` is printed as
`"classDiagram\n  A --> B : \n  A :  \n"` (the fixture `blank-kept` is in the
[folder](../tests/fixtures/class/labels)). [fixture: labels/blank-kept]
[fixture: labels/blank-tab-kept]

On a line that holds a `;`, whether whitespace follows the `:` of a label is
kept as written. The line rule of mermaid.js ignores the last `;` of a line
where the text `style` comes before a `:` that is followed by text without
whitespace up to a `#` (see
[Statements one per line](./flowchart.md#statements-one-per-line)).
`styleA fill:#f00;` adds the member `#f00` to the class `styleAfill`, and a
space after the `:` would make the `;` part of the member. [fixture:
labels/semicolon-line-kept] [fixture: labels/semicolon-line-with-directive-kept]
[fixture: directives/ignored-semicolon-next-to-another-kept]

Input
([labels/semicolon-line-kept-input.mmd](../tests/fixtures/class/labels/semicolon-line-kept-input.mmd)):

```mmd
classDiagram
styleA fill:#f00;
styleA fill: #f00;
```

Output
([labels/semicolon-line-kept-output.mmd](../tests/fixtures/class/labels/semicolon-line-kept-output.mmd)):

```mmd
classDiagram
  styleA fill :#f00;
  styleA fill : #f00;
```

### Member lines

For an ordinary method, remove padding before and just inside its parentheses,
and put one space before a nonempty return type. A run of spaces and tabs inside
a field is printed as one space, and the one space after a visibility mark
stays, since it is part of the name. Methods with trivia, ignored text, physical
or Unicode line separators, or a protected semicolon line retain their complete
source. [fixture: member-lines/method-padding] [fixture:
member-lines/method-values-and-classifiers-runs-collapsed] [fixture:
member-lines/method-trivia-and-semicolon-kept]

The classifier of an attribute touches its text, as in the documentation of
mermaid.js: `+attr string *` is printed `+attr string*`. [fixture:
member-lines/attribute-classifier-touches] Attribute and annotation lines, in a
body or after the `:` of a class name, keep their contents as written, apart
from the runs of spaces and tabs inside. Methods preserve their name, parameter
and return-type contents, including generic spelling and classifier-related
tails, apart from the runs. [fixture: member-lines/runs-collapsed] [fixture:
member-lines/percent-text-runs-collapsed] [fixture:
member-lines/trailing-whitespace-dropped] [fixture:
member-lines/directive-inside-kept] [corpus fixture: class/lex-member-percent]
mermaid.js divides each member into its parts by its text, and the whitespace
after a visibility mark is part of the name: `+ foo()` has the name ` foo`, with
a space, and `+foo()` the name `foo`. [fixture: member-lines/runs-collapsed]
[corpus fixture: class/gram-member-visibility-whitespace-body-0184dca2] An
annotation line, `<< y z >>`, keeps the whitespace around its text in the Db.
[fixture: member-lines/runs-collapsed]

Input
([member-lines/runs-collapsed-input.mmd](../tests/fixtures/class/member-lines/runs-collapsed-input.mmd)):

```mmd
classDiagram
class A {
+ spaced  name
  +foo( a ,  b )   int$
<< y  z >>
}
A :  -  bar()
```

Output
([member-lines/runs-collapsed-output.mmd](../tests/fixtures/class/member-lines/runs-collapsed-output.mmd)):

```mmd
classDiagram
  class A {
    + spaced name
    +foo(a , b) int$
    << y  z >>
  }
  A : - bar()
```

### Generic types

A generic type is kept as written, from its first `~` to its second: the
whitespace between them is part of the type in the Db, so `List~ T ~` has the
type `" T "`, written as a string, with a space on each side of the `T`.
[fixture: generic-types/kept] [fixture: generic-types/class-with-body-kept]
[fixture: generic-types/in-member-and-note-kept] [fixture:
generic-types/directive-inside-kept] [fixture:
generic-types/whitespace-before-collapsed-inside-kept] [fixture:
generic-types/empty-kept] The first `~` of a generic type touches the name
before it, whatever whitespace was written there: `class A ~T~` is printed
`class A~T~`, and `A ~T~ --> B ~U~` is printed `A~T~ --> B~U~`. The whitespace
between the name and the `~` is not in the Db, and the documentation of
mermaid.js writes every generic type touching its name
([`class Square~Shape~{` and `List~int~ position`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/classDiagram.md#L227-L231)).
[fixture: generic-types/touches-name] [fixture:
generic-types/whitespace-before-collapsed-inside-kept] [test: U+2029 between a
class name and its generic type]

Input
([generic-types/kept-input.mmd](../tests/fixtures/class/generic-types/kept-input.mmd)):

```mmd
classDiagram
class Map~K, V~
class List~ T ~
Map~K, V~ --> List~ T ~
```

Output
([generic-types/kept-output.mmd](../tests/fixtures/class/generic-types/kept-output.mmd)):

```mmd
classDiagram
  class Map~K, V~
  class List~ T ~
  Map~K, V~ --> List~ T ~
```

### Comments

A comment on a line of its own stands at the level of the statements around it,
or of the member lines in a body, and its text is kept as written. [fixture:
comments/kept] [fixture: comments/before-header] [fixture:
comments/in-namespace] [fixture: comments/last-in-body] [fixture:
comments/text-kept] [fixture: member-bodies/comment-only-over-lines-kept] A
comment after a statement stays on its line, and whether whitespace is written
before its `%%` is kept, as in a sequence diagram. [fixture: comments/kept]
[fixture: comments/whitespace-run-before-collapsed] [fixture:
comments/after-header-touching-kept] [fixture:
comments/after-last-statement-without-line-break]

Input
([comments/kept-input.mmd](../tests/fixtures/class/comments/kept-input.mmd)):

```mmd
classDiagram
%% a comment line
class A
A --> B %% after a relation
A --> C%%touching
class B {
        %% in a body
+x
}
```

Output
([comments/kept-output.mmd](../tests/fixtures/class/comments/kept-output.mmd)):

```mmd
classDiagram
  %% a comment line
  class A
  A --> B %% after a relation
  A --> C%%touching
  class B {
    %% in a body
    +x
  }
```

mermaid.js reads the line breaks after a comment that follows a statement as
part of the comment, and the next line as part of the statement, unless a line
of only whitespace comes between them (the known divergence
`comment-takes-line-break`, see
[A line of only whitespace after a comment](./compatibility.md#a-line-of-only-whitespace-after-a-comment)).
Such a line is printed as a line of one space, where an empty line would let
mermaid.js read the next statement as part of the commented one. The space is at
the end of a line, so the example is written as strings, in which `\n` is a line
break: `"classDiagram\nA --> B %% c\n  \nA : +int age\n"` is printed as
`"classDiagram\n  A --> B %% c\n \n  A : +int age\n"` (the fixture
`whitespace-line-kept` is in the [folder](../tests/fixtures/class/comments)). It
is so also after the comment of the line that holds the header and a statement,
as in `classDiagram accDescr {} %% c`
(`comments/whitespace-line-after-header-comment-kept`). [fixture:
comments/whitespace-line-kept] [fixture:
comments/whitespace-line-after-header-comment-kept] [fixture:
comments/whitespace-line-after-empty-line-kept] [fixture:
comments/whitespace-line-after-comment-line-kept] [fixture:
comments/whitespace-line-after-directive-line-kept] [fixture:
comments/whitespace-line-before-comment-line-kept] [fixture:
comments/whitespace-lines-run-kept-as-one] [fixture:
comments/whitespace-line-at-end-of-text-dropped] [fixture:
comments/empty-line-after-comment-kept]

### Directives

As in a flowchart: a directive on a line of its own stands at the level of the
statements around it, and a directive on the line of a statement is placed as in
a flowchart: the gap is printed as without the directive, and the directive
stands after its space and touches the unit that follows it. [fixture:
directives/kept] [fixture: directives/before-header] [fixture:
directives/in-namespace] [fixture: directives/after-header-on-same-line]
[fixture: directives/whitespace-on-both-sides] [fixture:
directives/whitespace-before-collapsed-at-end] [fixture:
directives/touching-one-side] [fixture: directives/count-sensitive-unit]
[fixture: directives/after-braces-on-same-line] [fixture:
member-bodies/directive-only-over-lines-kept] [fixture:
arrow-spacing/directive-between-arrow-tokens]

Input
([directives/kept-input.mmd](../tests/fixtures/class/directives/kept-input.mmd)):

```mmd
classDiagram
%%{init: {}}%%
class A {
%%{init: {}}%%
+x
}
class Fo%%{init: {}}%%o
```

Output
([directives/kept-output.mmd](../tests/fixtures/class/directives/kept-output.mmd)):

```mmd
classDiagram
  %%{init: {}}%%
  class A {
    %%{init: {}}%%
    +x
  }
  class Fo%%{init: {}}%%o
```

A line of only `%%`, or one that starts with `%%{` without being a directive, is
accepted between statements, but a line of only whitespace after it is a unit of
its own, and the text is rejected (see [Comments](#comments)). A line of
directives after such a line, or after such a line and comment lines, which
mermaid.js removes, is not indented, so that it does not become one, and stays
as written. [fixture: directives/bare-marker] [fixture:
directives/bare-marker-then-comment-line] [fixture:
directives/bare-marker-then-comment-lines-and-directives] [fixture:
directives/bare-marker-several-directive-lines-unindented] [fixture:
directives/bare-marker-then-empty-line] [fixture:
directives/bare-marker-with-braces] [fixture:
directives/bare-marker-at-end-of-text] [corpus fixture:
class/lex-bare-percent-line-between-statements] A directive is not whitespace,
so the line is no line of only whitespace for mermaid.js as it stands; with the
indentation, it would be. After a comment that takes the line breaks after it,
where a line of only whitespace ends what the comment takes (see
[Comments](#comments)), a line of directives keeps the indentation it was
written with, also at the end of the text: with another, what the directives
leave would be a line of only whitespace, or would no longer be one. [fixture:
directives/after-comment] [fixture: directives/after-comment-indentation-kept]
[fixture: directives/after-comment-at-end-of-text-kept]

Input
([directives/bare-marker-input.mmd](../tests/fixtures/class/directives/bare-marker-input.mmd)):

```mmd
classDiagram
A
%%
%%{init: {}}%%
class C
```

Output
([directives/bare-marker-output.mmd](../tests/fixtures/class/directives/bare-marker-output.mmd)):

```mmd
classDiagram
  A
  %%
%%{init: {}}%%
  class C
```

Input
([directives/after-comment-input.mmd](../tests/fixtures/class/directives/after-comment-input.mmd)):

```mmd
classDiagram
A --> B %% c
%%{init: {}}%%
A : +int age
```

Output
([directives/after-comment-output.mmd](../tests/fixtures/class/directives/after-comment-output.mmd)):

```mmd
classDiagram
  A --> B %% c
%%{init: {}}%%
  A : +int age
```

A line that dropping a `;` would change the `;` that the line rule ignores in is
printed as written: a `;` after a directive that a word argument ends
(`%%{wrap foo;`) and an ignored `;` next to another `;` (see
[A line that a `;` ends](./compatibility.md#a-line-that-a--ends)). [fixture:
directives/semicolon-after-word-argument-directive-kept] [fixture:
directives/ignored-semicolon-next-to-another-kept] A directive with a free-text
argument that is not closed runs to the end of the text, and the `;` after it is
part of it: the lines it joins are printed as written. [fixture:
directives/semicolon-after-unclosed-directive-kept] [fixture:
directives/semicolon-on-next-line-after-unclosed-directive-kept]

### Frontmatter YAML

As in a flowchart: the YAML between the `---` lines is formatted with Prettier's
YAML formatter where that is safe (see
[Frontmatter YAML](./flowchart.md#frontmatter-yaml)). [fixture:
frontmatter-yaml/formatted] [fixture: frontmatter-yaml/malformed-kept] [fixture:
frontmatter-yaml/indented-delimiters-kept] [fixture:
frontmatter-yaml/delimiter-line-kept] [fixture:
frontmatter-yaml/closing-delimiter-whitespace-kept] [fixture:
frontmatter-yaml/html-tag-kept] [fixture:
frontmatter-yaml/less-than-before-other-formatted] [fixture:
frontmatter-yaml/comment-after-frontmatter-before-header]

Input
([frontmatter-yaml/formatted-input.mmd](../tests/fixtures/class/frontmatter-yaml/formatted-input.mmd)):

```mmd
---
title:   T
---
classDiagram
class A
```

Output
([frontmatter-yaml/formatted-output.mmd](../tests/fixtures/class/frontmatter-yaml/formatted-output.mmd)):

```mmd
---
title: T
---
classDiagram
  class A
```

### Multi-line values

As in [flowchart's top-level descriptions](./flowchart.md#multi-line-values),
align the lines of an `accDescr { ... }` body one step inside its statement,
with a separate `}` at the statement's level. Mermaid discards this indentation
from the description. A string, a backquoted name, and a generic type written
over several lines are kept as written too. [fixture: multi-line-values/kept]
[fixture: multi-line-values/block-text-on-opening-line-spaced] [fixture:
multi-line-values/block-comment-line-kept] [fixture:
multi-line-values/block-empty-line-kept] [fixture:
multi-line-values/backquoted-name-kept] [fixture:
multi-line-values/label-string-kept] [fixture:
multi-line-values/generic-in-relation-kept]

The text of a block on one line stands between one space on each side, as in
[flowchart's accessibility lines](./flowchart.md#accessibility-lines):
`accDescr {a b}`, `accDescr {  a b  }`, `accDescr {  a b}`, and
`accDescr {a b  }` are printed `accDescr { a b }`. mermaid.js trims the text, so
the whitespace at its ends carries no meaning. A block with a directive in its
text stays as written. A block on a line that keeps its `;` gets no added space,
and a run of spaces at its ends still becomes one space (see
[Semicolons](./flowchart.md#semicolons)). [fixture:
multi-line-values/block-text-on-one-line-padded]

Input
([multi-line-values/kept-input.mmd](../tests/fixtures/class/multi-line-values/kept-input.mmd)):

```mmd
classDiagram
accDescr {
  one
    two
      }
note "line one
  line two"
class A~T,
  U~
```

Output
([multi-line-values/kept-output.mmd](../tests/fixtures/class/multi-line-values/kept-output.mmd)):

```mmd
classDiagram
  accDescr {
    one
    two
  }
  note "line one
  line two"
  class A~T,
  U~
```

### Semicolons at the end of a style statement

A line-ending `;` of a `classDef` or `style` statement is dropped when the
[line rule of mermaid.js](../../spec/docs/common.md#style-and-classdef-lines)
ignores it: no whitespace lies between the `:` and the later `#`. Removing this
terminator leaves the Db unchanged, also with several styles. [fixture:
semicolons-at-the-end-of-a-style-statement/hash-terminators] Whitespace
immediately before a dropped `;` is dropped with it. [fixture:
semicolons-at-the-end-of-a-style-statement/space-before-terminator] The line
then formats as a line without that `;`, including its usual style spacing.
[fixture: semicolons-at-the-end-of-a-style-statement/hash-terminators] Blank
lines and comment lines keep their usual layout around the statement. [fixture:
semicolons-at-the-end-of-a-style-statement/blank-and-comment-lines] Member
semicolons stay: they are outside style statements. [fixture:
semicolons-at-the-end-of-a-style-statement/member-semicolons-kept]

A directive after the semicolon on the same line keeps the `;`. [fixture:
semicolons-at-the-end-of-a-style-statement/trailing-items-kept] Following `%%`
text on the same line also keeps it; here it is part of the style. [fixture:
semicolons-at-the-end-of-a-style-statement/trailing-items-kept] An ignored `;`
beside another `;` is kept to preserve the line rule's selection. [fixture:
semicolons-at-the-end-of-a-style-statement/adjacent-semicolons-kept] A `;` after
an unclosed directive stays, preserving its stopping boundary. [fixture:
semicolons-at-the-end-of-a-style-statement/unclosed-directive-kept] The same
protection applies before U+2028 and U+2029; see
[A line that a `;` ends](./compatibility.md#a-line-that-a--ends). [test: style
semicolons: class before U+2028] [test: style semicolons: class before U+2029] A
closed directive between the statement and an ignored terminator is kept while
the `;` is dropped. [fixture:
semicolons-at-the-end-of-a-style-statement/directive-before-terminator]

Output
([semicolons-at-the-end-of-a-style-statement/hash-terminators-output.mmd](../tests/fixtures/class/semicolons-at-the-end-of-a-style-statement/hash-terminators-output.mmd)):

```mmd
classDiagram
  class A
  classDef c fill: #f00
  style A fill: #f00
  classDef d fill: #0f0, stroke: #00f
  style A fill: #0f0, stroke: #00f
```

### Multi-line statements

An ordinary statement written over several lines is printed on one line. In a
class diagram, a line break ends a statement except after `direction`, where the
value may be on the next line, and after the `:` of `accTitle` and `accDescr`,
where the text may be: so `direction`, a line break, and `LR` is printed as
`direction LR`. [fixture: multi-line-statements/joined] [fixture:
multi-line-statements/acc-descr-joined] [fixture:
multi-line-statements/empty-line-inside-joined] [corpus fixture:
class/lex-direction-line-value-next-line] A line break next to a comment or a
directive stays, while structural continuations and intervening trivia stand one
level deeper, as in a sequence diagram (see
[Multi-line statements](./sequence.md#multi-line-statements)). [fixture:
multi-line-statements/breaks-decided-one-by-one] Whitespace inside values
remains unchanged. The whitespace before the first line break of each gap is
retained; joining regions keep the whole statement as written. A `;` does not
keep a statement over several lines from being joined: no `;` separates
statements in a class diagram, and the first line of such a statement holds only
its keyword, so joining its lines cannot change which `;` the line rule ignores.
[fixture: multi-line-statements/semicolon-value-joined] [fixture:
multi-line-statements/comment-inside-kept] [fixture:
multi-line-statements/directive-inside-kept] [fixture:
multi-line-statements/comment-inside-title-kept] A statement with a comment line
after U+2028 or U+2029 inside it is a joining region: mermaid.js removes the
comment line and reads the text on both sides as one line (see
[A comment line after U+2028 or U+2029](./compatibility.md#a-comment-line-after-u2028-or-u2029)),
so the statement is kept as written, with the spacing of its parts and the
indentation of its later lines. [test: class: ls-comment-in-class-statement]
[test: class: ps-comment-in-relation-statement]

Input
([multi-line-statements/joined-input.mmd](../tests/fixtures/class/multi-line-statements/joined-input.mmd)):

```mmd
classDiagram
accTitle:
A title
direction
LR
```

Output
([multi-line-statements/joined-output.mmd](../tests/fixtures/class/multi-line-statements/joined-output.mmd)):

```mmd
classDiagram
  accTitle: A title
  direction LR
```

Input
([multi-line-statements/comment-inside-kept-input.mmd](../tests/fixtures/class/multi-line-statements/comment-inside-kept-input.mmd)):

```mmd
classDiagram
direction
%% c
LR
```

Output
([multi-line-statements/comment-inside-kept-output.mmd](../tests/fixtures/class/multi-line-statements/comment-inside-kept-output.mmd)):

```mmd
classDiagram
  direction
    %% c
    LR
```

Next-line `accTitle:` and `accDescr:` values keep their line break when joining
would expose the greedy direction-line rule: lowercase `direction` followed by
whitespace and uppercase TB, BT, LR or RL, even within longer text. Continuation
values use the previous multiline layout, one level deeper than the keyword, so
the accessibility value is not consumed as a direction statement. [fixture:
multi-line-statements/title-next-direction-tb] [fixture:
multi-line-statements/title-next-direction-bt] [fixture:
multi-line-statements/title-next-direction-lr] [fixture:
multi-line-statements/title-next-direction-rl] [fixture:
multi-line-statements/description-next-direction-tb] [fixture:
multi-line-statements/description-next-direction-bt] [fixture:
multi-line-statements/description-next-direction-lr] [fixture:
multi-line-statements/description-next-direction-rl] [fixture:
multi-line-statements/direction-value-with-prefix] TD and other letter cases are
not that direction rule, so their ordinary next-line values still join.
[fixture: multi-line-statements/title-next-direction-td] [fixture:
multi-line-statements/description-next-direction-td] [fixture:
multi-line-statements/lower-case-direction-value] The protected continuation
uses the configured step at `tabWidth: 0` and `useTabs`; CR normalizes before
this same decision. [fixture: multi-line-statements/direction-value-zero-width]
[fixture: multi-line-statements/direction-value-tabs] [test: accessibility
revisions: class direction-value-cr]

Input (escaped): `"classDiagram\nclass A11y\naccTitle:\n direction LR"`.

Output
([multi-line-statements/title-next-direction-lr-output.mmd](../tests/fixtures/class/multi-line-statements/title-next-direction-lr-output.mmd)):

```mmd
classDiagram
  class A11y
  accTitle:
    direction LR
```

### Direction lines

A line with `direction` and a value is a direction line wherever the statement
context reads it (the first rule of that context, tried at the start of every
line): in a body, `direction LR` is a member line, and in a namespace body it is
rejected. mermaid.js does not read the text before `direction` and after the
value. That text is kept as written; the whitespace between it and `direction`,
and between `direction` and the value, becomes one space, and text that touches
the value keeps touching it. [fixture: direction-lines/text-kept] [fixture:
direction-lines/text-after-value-separated] [fixture:
direction-lines/text-before-touching-kept] [fixture:
direction-lines/text-before-collapsed] [fixture: direction-lines/in-namespace]
[fixture: direction-lines/values-and-tabs] [fixture:
direction-lines/directive-around-value] [fixture:
direction-lines/comment-after-value-kept] [corpus fixture:
class/lex-direction-in-namespace] [corpus fixture:
class/lex-direction-in-member-body] A word that starts with `direction` and
touches its value, such as `directionLR`, is the name of a class and not a
direction line, since mermaid.js reads `direction` as a keyword only when
whitespace follows it, so it stays as written. [fixture:
direction-lines/no-whitespace-is-a-class-kept]

Input
([direction-lines/text-kept-input.mmd](../tests/fixtures/class/direction-lines/text-kept-input.mmd)):

```mmd
classDiagram
direction    LR
class A   direction RL
direction TBX
```

Output
([direction-lines/text-kept-output.mmd](../tests/fixtures/class/direction-lines/text-kept-output.mmd)):

```mmd
classDiagram
  direction LR
  class A direction RL
  direction TBX
```

### Empty description blocks

The whitespace-only interior of a description block, including tabs, line breaks
and Unicode whitespace, prints `{}`: there is no text for interior whitespace to
surround. An already empty interior stays empty. The keyword and opening brace
have one space between them: `accDescr{  }` becomes `accDescr {}`. [fixture:
empty-description-blocks/empty-whitespace-interiors] [test: class Unicode and
tab interiors] Blocks with comments or directives keep their contents and line
breaks, with body indentation under [Multi-line values](#multi-line-values).

An empty description block, `accDescr {}`, is a statement when it shares its
line with another statement or with the header, before it or after it:
`accDescr {} class A` declares A, and `classDiagram accDescr {}` and
`note for A "x" accDescr {}` are accepted too, while `accDescr {}` on a line of
its own is rejected, as mermaid.js rejects it. Such a line keeps its statements
together; a class with a body on that line is printed as any class, with its
members one level deeper and its `}` at the level of the line. [fixture:
empty-description-blocks/before-class-with-body-indented] [fixture:
empty-description-blocks/kept-with-statement] [fixture:
empty-description-blocks/after-statement] [fixture:
empty-description-blocks/touching-kept] [fixture:
empty-description-blocks/two-blocks-kept] [fixture:
empty-description-blocks/directive-between-kept] [fixture:
empty-description-blocks/inner-whitespace-collapsed] [fixture:
empty-description-blocks/followed-by-empty-lines-collapsed] [corpus fixture:
class/gram-empty-description-block-alone] [corpus fixture:
class/header-empty-description-block-then-statement]

Input
([empty-description-blocks/kept-with-statement-input.mmd](../tests/fixtures/class/empty-description-blocks/kept-with-statement-input.mmd)):

```mmd
classDiagram
accDescr {}   class A
```

Output
([empty-description-blocks/kept-with-statement-output.mmd](../tests/fixtures/class/empty-description-blocks/kept-with-statement-output.mmd)):

```mmd
classDiagram
  accDescr {} class A
```

Input
([empty-description-blocks/after-statement-input.mmd](../tests/fixtures/class/empty-description-blocks/after-statement-input.mmd)):

```mmd
classDiagram accDescr {}
class A
note for A "x"   accDescr {}
```

Output
([empty-description-blocks/after-statement-output.mmd](../tests/fixtures/class/empty-description-blocks/after-statement-output.mmd)):

```mmd
classDiagram accDescr {}
  class A
  note for A "x" accDescr {}
```

A block written over several lines keeps the statement that follows it beside
its closing brace. Whitespace-only blocks join onto one line; blocks with a
comment retain their line breaks: `accDescr`, a line break, and `{} class A`
declares A, while with the `class A` on a line of its own the block would stand
alone and the input would be rejected. [fixture:
empty-description-blocks/over-lines-joined] [fixture:
empty-description-blocks/over-lines-empty-line-joined] [fixture:
empty-description-blocks/over-lines-comment-line-kept]

Input
([empty-description-blocks/over-lines-joined-input.mmd](../tests/fixtures/class/empty-description-blocks/over-lines-joined-input.mmd)):

```mmd
classDiagram
accDescr
{} class A
accDescr {
} class B
```

Output
([empty-description-blocks/over-lines-joined-output.mmd](../tests/fixtures/class/empty-description-blocks/over-lines-joined-output.mmd)):

```mmd
classDiagram
  accDescr {} class A
  accDescr {} class B
```

### Unclosed backquoted names

A backquoted name that is not closed runs to the end of the text, and mermaid.js
reads the whitespace and the line breaks at the end of the text as part of it.
The name is printed as written to the end of the text, and no line break is
added after it. What it is about is at the ends of lines, so the example is
written as strings, in which `\n` is a line break:
``"classDiagram\nclass A\nclass `x y  \n\n"`` is printed as
``"classDiagram\n  class A\n  class `x y  \n\n"``, the two spaces and the line
breaks after `y` kept (the fixture `kept` is in the
[folder](../tests/fixtures/class/unclosed-backquoted-names)). [fixture:
unclosed-backquoted-names/kept] [fixture:
unclosed-backquoted-names/at-end-of-text-kept] [fixture:
unclosed-backquoted-names/over-lines-kept] [fixture:
unclosed-backquoted-names/in-relation-kept]

## Kept as written

Apart from description-body indentation under
[Multi-line values](#multi-line-values), the following text is kept as written
because changing it would change the diagram or the input would be rejected:

- the text of a value: a string, a backquoted name, the text of a label, a
  style, apart from the whitespace around its first `:` and its `,`, and the
  text of `accTitle`; [fixture:
  whitespace-between-tokens/style-colon-and-comma-spaced] [fixture:
  labels/accessibility-text-runs-collapsed]
- attribute and annotation contents, method-field contents, and a generic type
  from `~` to `~`;
- the whitespace after the `:` of a label of only whitespace, and whether
  whitespace follows the `:` of a label on a line that holds a `;`;
- a line of only whitespace after the comment of a statement, as one space;
- the text of a direction line before `direction` and after its value;
- a statement protected by a semicolon line or a joining comment region;
- the whitespace before the first line break of a gap containing trivia;
- a backquoted name that is not closed, to the end of the text;
- the spelling of the header, `classDiagram` or `classDiagram-v2`. [fixture:
  indentation/header-v2-kept]

Some text is kept as written by choice, because the Db is the same either way:
whether whitespace is written before the mark of a comment after a statement, a
run of it being printed as one space (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)).
[fixture: comments/mark-run-one-space] It is kept because mermaid.js reads a
comment by what touches it in the places of the known divergences
(`comment-takes-character`, `percent-brace-after-unit`), and one rule is simpler
than a list of those places.
