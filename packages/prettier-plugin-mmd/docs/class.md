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
indentation written in the input is not kept. Whitespace at the start of a line
is nothing to mermaid.js, so the printer chooses the indentation from the
structure alone, and one rule per level prints the same text whatever the input
was indented with. [fixture: indentation/namespaces] [fixture:
indentation/written-indentation-dropped]

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
  class F { %%{init: {}}%% }
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
and tokens that touch keep touching, as in a flowchart. [fixture:
whitespace-between-tokens/collapsed] [fixture:
whitespace-between-tokens/tabs-collapsed] [fixture:
empty-description-blocks/touching-kept] [fixture:
empty-description-blocks/inner-whitespace-collapsed] [fixture:
generic-types/whitespace-before-collapsed-inside-kept] This holds between the
name parts of a class name: `class Foo Bar` declares the class `FooBar`, and it
is printed as `class Foo Bar`, as written; joining the parts could make a
keyword, as in `class no te`, which declares `note`, while `class note` is
rejected. [fixture: whitespace-between-tokens/collapsed] [fixture:
whitespace-between-tokens/name-parts-keyword-kept] It holds as well for an
annotation or a CSS class after a name, a label in brackets, and the words of
`note for`, `click`, `style`, and `cssClass` statements. [fixture:
whitespace-between-tokens/collapsed] [fixture:
whitespace-between-tokens/after-name-collapsed] [fixture:
whitespace-between-tokens/words-collapsed] [fixture:
whitespace-between-tokens/tabs-collapsed] A line that holds only a class name,
which declares nothing, is kept at the level of the statements around it.
[fixture: whitespace-between-tokens/collapsed] [fixture:
whitespace-between-tokens/tabs-collapsed]

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
  style C fill:#f9f
  cssClass "A,B" highlight
  Foo Bar
  A - B --> C
```

The whitespace between the name of the function after `call` and the `(` that
follows it is kept as written, with the parentheses and their arguments:
mermaid.js reads the name up to the `(`, whitespace included, so
`click A call fn  ()` calls the function named `fn` and two spaces. A line break
there is kept too, and the statement stays on two lines. [fixture:
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
  click A call fn  ( x )
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
arrow-spacing/directive-between-arrow-tokens-kept]

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
labels/directive-around-colon-kept] A sequence diagram writes the `:` touching
what comes before it (see [Colons in the sequence rules](./sequence.md#colons));
each follows the documentation of its diagram type. The `:` after `accTitle` and
`accDescr` touches the keyword and has one space after it, as in the other
diagram types and in the documentation of mermaid.js. [fixture:
labels/accessibility-text-kept] [fixture: multi-line-statements/joined]
[fixture: multi-line-statements/acc-descr-joined] The text of a label is kept as
written. [fixture: labels/spaced] [fixture: labels/accessibility-text-kept]

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

A member line, in a body or after the `:` of a class name, is kept as written,
from its first character to its last. [fixture: member-lines/kept] [fixture:
member-lines/percent-text-kept] [fixture:
member-lines/trailing-whitespace-dropped] [fixture:
member-lines/directive-inside-kept] [corpus fixture: class/lex-member-percent]
mermaid.js divides it into its parts by its text, and the whitespace after a
visibility mark is part of the name: `+ foo()` has the name ` foo`, with a
space, and `+foo()` the name `foo`. [fixture: member-lines/kept] [corpus
fixture: class/gram-member-visibility-whitespace-body-0184dca2] An annotation
line, `<< y z >>`, keeps the whitespace around its text in the Db. [fixture:
member-lines/kept]

Input
([member-lines/kept-input.mmd](../tests/fixtures/class/member-lines/kept-input.mmd)):

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
([member-lines/kept-output.mmd](../tests/fixtures/class/member-lines/kept-output.mmd)):

```mmd
classDiagram
  class A {
    + spaced  name
    +foo( a ,  b )   int$
    << y  z >>
  }
  A : -  bar()
```

### Generic types

A generic type is kept as written, from its first `~` to its second: the
whitespace between them is part of the type in the Db, so `List~ T ~` has the
type `" T "`, written as a string, with a space on each side of the `T`.
[fixture: generic-types/kept] [fixture: generic-types/class-with-body-kept]
[fixture: generic-types/in-member-and-note-kept] [fixture:
generic-types/directive-inside-kept] [fixture:
generic-types/whitespace-before-collapsed-inside-kept] [fixture:
generic-types/empty-kept]

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
statements around it, and a directive on the line of a statement keeps whether
whitespace is written on each side of it: where it is, one space stands there,
and where the directive touches a token, it keeps touching. [fixture:
directives/kept] [fixture: directives/before-header] [fixture:
directives/in-namespace] [fixture: directives/after-header-on-same-line]
[fixture: directives/whitespace-on-both-sides-collapsed] [fixture:
directives/whitespace-before-collapsed-at-end] [fixture:
directives/touching-one-side-kept] [fixture:
directives/after-braces-on-same-line] [fixture:
member-bodies/directive-only-over-lines-kept] [fixture:
arrow-spacing/directive-between-arrow-tokens-kept]

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

As in a flowchart: the lines of an `accDescr { ... }` block are kept as written,
and its `}` stands at the level of its statement. Outside a subgraph the columns
of those lines are not in the Db, so keeping them is a choice, whose reason is
in a flowchart (see [Multi-line values](./flowchart.md#multi-line-values)). A
string, a backquoted name, and a generic type written over several lines are
kept as written too. [fixture: multi-line-values/kept] [fixture:
multi-line-values/block-text-on-opening-line-spaced] [fixture:
multi-line-values/block-comment-line-kept] [fixture:
multi-line-values/block-empty-line-kept] [fixture:
multi-line-values/backquoted-name-kept] [fixture:
multi-line-values/label-string-kept] [fixture:
multi-line-values/generic-in-relation-kept]

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

### Multi-line statements

A statement written over several lines is printed on one line. In a class
diagram, a line break ends a statement except after `direction`, where the value
may be on the next line, and after the `:` of `accTitle` and `accDescr`, where
the text may be: so `direction`, a line break, and `LR` is printed as
`direction LR`. [fixture: multi-line-statements/joined] [fixture:
multi-line-statements/acc-descr-joined] [fixture:
multi-line-statements/empty-line-inside-joined] [corpus fixture:
class/lex-direction-line-value-next-line] A statement written over several lines
with a comment or a directive in it is kept as written, from its start to its
end, as in a sequence diagram (see
[Multi-line statements](./sequence.md#multi-line-statements)). [fixture:
multi-line-statements/comment-inside-kept] [fixture:
multi-line-statements/directive-inside-kept] [fixture:
multi-line-statements/comment-inside-title-kept]

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
direction-lines/directive-around-value-kept] [fixture:
direction-lines/comment-after-value-kept] [corpus fixture:
class/lex-direction-in-namespace] [corpus fixture:
class/lex-direction-in-member-body]

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

A block written over several lines keeps the statement that follows it on the
line where the block ends: `accDescr`, a line break, and `{} class A` declares
A, while with the `class A` on a line of its own the block would stand alone and
the input would be rejected. [fixture: empty-description-blocks/over-lines-kept]
[fixture: empty-description-blocks/over-lines-empty-line-kept] [fixture:
empty-description-blocks/over-lines-comment-line-kept]

Input
([empty-description-blocks/over-lines-kept-input.mmd](../tests/fixtures/class/empty-description-blocks/over-lines-kept-input.mmd)):

```mmd
classDiagram
accDescr
{} class A
accDescr {
} class B
```

Output
([empty-description-blocks/over-lines-kept-output.mmd](../tests/fixtures/class/empty-description-blocks/over-lines-kept-output.mmd)):

```mmd
classDiagram
  accDescr
    {} class A
  accDescr {
  } class B
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

Some text is always kept as written, because changing it would change the
diagram or the input would be rejected:

- the text of a value: a string, a backquoted name, the text of a label, a
  style, and the text of `accTitle` and `accDescr`; [fixture:
  whitespace-between-tokens/style-values-kept] [fixture:
  labels/accessibility-text-kept]
- a member line, and a generic type from `~` to `~`;
- the whitespace after the `:` of a label of only whitespace, and whether
  whitespace follows the `:` of a label on a line that holds a `;`;
- a line of only whitespace after the comment of a statement, as one space;
- the text of a direction line before `direction` and after its value;
- a statement written over several lines with a comment, a directive, or a `;`
  in it;
- a backquoted name that is not closed, to the end of the text;
- the spelling of the header, `classDiagram` or `classDiagram-v2`. [fixture:
  indentation/header-v2-kept]

Some text is kept as written by choice, because the Db is the same either way:
whether whitespace is written before the mark of a comment after a statement. It
is kept because mermaid.js reads a comment by what touches it in the places of
the known divergences (`comment-takes-character`, `percent-brace-after-unit`),
and one rule is simpler than a list of those places.
