# Class diagram formatting rules

Japanese version: [class.ja.md](./class.ja.md)

How prettier-plugin-mmd formats a class diagram. Each rule below keeps what
mermaid.js reads from the diagram; where a change would alter it, the text is
kept as written, and the rule says where. Where a rule is the same as in a
flowchart, it says so, and the reason is in [flowchart.md](./flowchart.md).

Each rule has a folder of examples under
[`tests/fixtures/class/`](../tests/fixtures/class), named as the rule's heading,
as for flowcharts: each example is a pair of files, the input and the formatted
output, and the tests check both that the plugin prints the output and that
mermaid.js reads the same diagram from the input and the output. The examples in
this document are copies of those files, and a test checks that they are the
same.

## Rules

### Indentation

The statements after the header stand one level deeper than the header. The `{`
of a namespace stands on the line of its name, after one space; the statements
of the namespace stand one level deeper than that line, and its `}` stands on a
line of its own at the level of that line, also when the namespace was written
on one line. A level is what Prettier's `useTabs` and `tabWidth` options say:
two spaces by default. The indentation written in the input is not kept:
whitespace at the start of a line is nothing to mermaid.js.

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
space; each member line stands on a line of its own, one level deeper; and the
`}` stands on a line of its own at the level of the class. A body written on one
line, as in `class Duck { +swim() }`, is split so: mermaid.js ends a member line
at a line break, a `{`, or a `}`, so it reads the same members. An empty body,
with nothing but whitespace between its braces, is printed as `{ }` on the line
of the class, however it is written: `{}`, `{   }`, and braces on two lines all
declare the class without members. After a CSS class, the body needs a member
line, and a line of only whitespace is one, so `class C:::c {}` is rejected and
`class C:::c { }` is accepted: `{ }` is the form that holds everywhere. A body
after a CSS class with a line of only whitespace inside becomes `{ }` too; that
example is not shown here, because the whitespace is at the end of a line (see
`member-bodies/empty-whitespace-line-unified` in the
[folder](../tests/fixtures/class/member-bodies)). A body without members that
holds a comment or a directive keeps it: on one line, the body stays on the line
of the class, and over several lines, it is printed as a body.

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
start and the end of a namespace or a member body are dropped.

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
and tokens that touch keep touching, as in a flowchart. This holds between the
name parts of a class name: `class Foo Bar` declares the class `FooBar`, and it
is printed as `class Foo Bar`, as written; joining the parts could make a
keyword, as in `class no te`, which declares `note`, while `class note` is
rejected. It holds as well for an annotation or a CSS class after a name, a
label in brackets, and the words of `note for`, `click`, `style`, and `cssClass`
statements. A line that holds only a class name, which declares nothing, is kept
at the level of the statements around it.

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

### Arrow spacing

A relation has one space before and after its arrow, and one on each side of
each cardinality, as mermaid.js's documentation writes it:
`Customer"1"-->"*"Ticket` becomes `Customer "1" --> "*" Ticket`. The relation
ends and the line of an arrow are tokens of their own, which may be written with
whitespace between them; they are printed touching, as one arrow:
`A <|  --  * B` becomes `A <|--* B`.

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
of the class `-B`, and it is printed as `A -- - B`.

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
starts (diagrams/class.md, the statement context, rule 10). So an arrow, the `:`
of a label, or a `{` that touches a name that ends with the word `call` stays
touching: with a space before it, `A call()--> B` would be a callback of the
class A, and `call-->C` would start one.

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
`A:+int x` becomes `A : +int x`. A sequence diagram writes the `:` touching what
comes before it (see [sequence.md](./sequence.md#colons)); each follows the
documentation of its diagram type. The `:` after `accTitle` and `accDescr`
touches the keyword and has one space after it, as in a flowchart. The text of a
label is kept as written.

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
and `A : ` adds the class A, while `A :` is rejected. That example is not shown
here, because the whitespace is at the end of a line (see `labels/blank-kept` in
the [folder](../tests/fixtures/class/labels)).

On a line that holds a `;`, whether whitespace follows the `:` of a label is
kept as written. The line rule of mermaid.js ignores the last `;` of a line
where the text `style` comes before a `:` that is followed by text without
whitespace up to a `#` (see
[Statements one per line](./flowchart.md#statements-one-per-line)).
`styleA fill:#f00;` adds the member `#f00` to the class `styleAfill`, and a
space after the `:` would make the `;` part of the member.

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
from its first character to its last. mermaid.js divides it into its parts by
its text, and the whitespace after a visibility mark is part of the name:
`+ foo()` has the name ` foo`, with a space, and `+foo()` the name `foo`. An
annotation line, `<< y z >>`, keeps the whitespace around its text in the Db.

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
type `T`.

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
or of the member lines in a body, and its text is kept as written. A comment
after a statement stays on its line, and whether whitespace is written before
its `%%` is kept, as in a sequence diagram.

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
[compatibility.md](./compatibility.md#a-line-of-only-whitespace-after-a-comment)).
Such a line is printed as a line of one space, where an empty line would let
mermaid.js read the next statement as part of the commented one. That example is
not shown here, because the space is at the end of a line (see
`comments/whitespace-line-kept` in the
[folder](../tests/fixtures/class/comments)). It is so also after the comment of
the line that holds the header and a statement, as in
`classDiagram accDescr {} %% c`
(`comments/whitespace-line-after-header-comment-kept`).

### Directives

As in a flowchart: a directive on a line of its own stands at the level of the
statements around it, and a directive on the line of a statement keeps the
whitespace written on each side of it.

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

### Frontmatter YAML

As in a flowchart: the YAML between the `---` lines is formatted with Prettier's
YAML formatter where that is safe (see
[Frontmatter YAML](./flowchart.md#frontmatter-yaml)).

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
and its `}` stands at the level of its statement. A string, a backquoted name,
and a generic type written over several lines are kept as written too.

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
`direction LR`. A statement written over several lines with a comment, a
directive, or a `;` in it is kept as written, from its start to its end, as in a
sequence diagram (see
[Multi-line statements](./sequence.md#multi-line-statements)).

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

A line with `direction` and a value is a direction line wherever it stands, and
mermaid.js does not read the text before `direction` and after the value. That
text is kept as written; the whitespace between it and `direction`, and between
`direction` and the value, becomes one space, and text that touches the value
keeps touching it.

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

An empty description block, `accDescr {}`, is a statement only when another
statement follows it on its line: `accDescr {} class A` declares A, while
`accDescr {}` on a line of its own is rejected. Such a line keeps its two
statements together.

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

A block written over several lines keeps the statement that follows it on the
line where the block ends: `accDescr`, a line break, and `{} class A` declares
A, while with the `class A` on a line of its own the block would stand alone and
the input would be rejected.

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
added after it. That example is not shown here, because what it is about is at
the ends of lines (see the
[folder](../tests/fixtures/class/unclosed-backquoted-names)).

## Kept as written

Some text is always kept as written, because changing it would change the
diagram or the input would be rejected:

- the text of a value: a string, a backquoted name, the text of a label, a
  style, and the text of `accTitle` and `accDescr`;
- a member line, and a generic type from `~` to `~`;
- the whitespace after the `:` of a label of only whitespace, and whether
  whitespace follows the `:` of a label on a line that holds a `;`;
- whether whitespace is written before the `%%` of a comment after a statement,
  and a line of only whitespace after such a comment, as one space;
- the text of a direction line before `direction` and after its value;
- a statement written over several lines with a comment, a directive, or a `;`
  in it;
- a backquoted name that is not closed, to the end of the text;
- the spelling of the header, `classDiagram` or `classDiagram-v2`.
