# How the printed form is decided

Formatting does not change what mermaid.js draws (AGENTS.md, item 4). A way of
writing that draws the same is printed in one form; a way of writing that draws
something else is kept as written. This document says which form is printed, and
why.

The rules of a diagram type are in its own document (`flowchart.md`, `gantt.md`,
and so on). The reason of each of those rules is one of the rules below.

## What decides a form

What matters most in a printed form is that it reads well. Among the ways of
writing that draw the same, in every version of mermaid.js that counts, the
formatter prints the one that reads best.

The rules below say which form that is. They are written down, and applied in
their order, because a judgment that is made case by case differs from one
person to the next: the same kind of mark would be printed in one way in one
diagram type and in another way in the next. A rule is there to make a text read
well. So where a rule gives a form that reads worse than another form that draws
the same, the rule is what is wrong: the form is decided again, and the rule is
corrected. Whoever is working on the formatter does not decide that alone;
AGENTS.md (item 4) says how it is decided.

1. The whitespace beside a mark is the whitespace that Prettier prints beside
   the same kind of mark. The formatter is a plugin of Prettier, and a diagram
   stands in a file beside code that Prettier formats, so a kind of mark reads
   the same in both.
2. A gap of a kind that Prettier does not have takes the form that the other
   diagram types print for it, so that a kind of gap has one form in every
   diagram type: a reader who knows it from one diagram type reads it at once in
   the next.
3. A spelling takes the form that the examples in the documentation of
   mermaid.js use, which is the form that the author of a diagram knows, and so
   reads without stopping.

Reading well comes before writing as the documentation of mermaid.js writes.
Whitespace that makes a text easier to read is not left out because the
documentation writes the text without it: the documentation writes an argument
of a C4 diagram as `$link="x"`, and the formatter prints `$link = "x"`. A
spelling takes the form of the documentation for the same reason, that a known
spelling reads best, and not because it is the documentation that writes it:
where a spelling of the documentation reads worse than another, the rule of
spellings is the rule to correct.

## 1. The whitespace beside a mark

The whitespace beside a mark is the whitespace that Prettier prints beside the
same kind of mark in the languages it formats. The table gives what Prettier
prints for each kind, and a text that the formatter prints in the same way. The
texts of Prettier are JavaScript where no language is named.

| Mark                                     | Prettier                                               | Whitespace                   | Written                                     | Printed                       |
| ---------------------------------------- | ------------------------------------------------------ | ---------------------------- | ------------------------------------------- | ----------------------------- |
| A comma                                  | `f(a,b)` is printed `f(a, b);`                         | none before, one space after | `class A,B c` in an ER diagram              | `class A, B c`                |
| A `=` that gives a name its value        | `function f(a=1) {}` is printed `function f(a = 1) {}` | one space on each side       | `Person(a, "A", $link="x")` in a C4 diagram | `Person(a, "A", $link = "x")` |
| The colon of a key                       | `x = {a : 1}` is printed `x = { a: 1 };`               | none before, one space after | `"Dogs" : 386` in a pie chart               | `"Dogs": 386`                 |
| A colon between two things               | `y = c ? d:e` is printed `y = c ? d : e;`              | one space on each side       | `s1 --> s2: go` in a state diagram          | `s1 --> s2 : go`              |
| A colon inside a name                    | the selector `a:hover` of CSS stays `a:hover`          | none on either side          | `a : R -- L : b` in an architecture diagram | `a:R -- L:b`                  |
| Another mark between two things          | `x = a+b` is printed `x = a + b;`                      | one space on each side       | `A-->B` in a flowchart                      | `A --> B`                     |
| Parentheses and square brackets          | `f( a )` is printed `f(a);`                            | none inside                  | `A( text )` in a flowchart                  | `A(text)`                     |
| Braces that hold names with their values | `x = {a:1}` is printed `x = { a: 1 };`                 | one space inside             | `curve c{m: 60, s: 70}` in a radar chart    | `curve c{ m: 60, s: 70 }`     |
| Braces that hold values alone            | `x = [ 1, 2 ]` is printed `x = [1, 2];`                | none inside                  | `curve d{ 85, 90 }` in a radar chart        | `curve d{85, 90}`             |

The two kinds of braces are the object and the array of Prettier.

Prettier prints the `=` of an attribute of HTML without spaces (`<a href="x">`).
An argument of a C4 diagram stands in the list of the arguments of a call, where
Prettier prints the `=` of a default value with a space on each side.

### Which kind a colon is

Prettier prints a colon in three ways, so the kind of a colon is decided before
its whitespace.

- The colon of a key touches the key and has one space after it: `{ a: 1 }` in
  JavaScript, `key: value` in YAML, `color: red` in CSS.
- The colon of a conditional expression stands between its two results and has
  one space on each side: `c ? d : e`.
- A colon inside a name has no whitespace on either side: the selector `a:hover`
  in CSS.

The whitespace shows what the text after the colon belongs to. A colon that
touches the name before it shows that text as the value of that name.
`s1 --> s2: go` would show `go` as a value of `s2`, while mermaid.js reads it as
the label of the transition from `s1` to `s2`. With a space on each side, the
colon stands between the transition and its label.

The kind is decided by these steps, in their order.

1. A colon inside a name. The text after the colon is a part of how the
   statement names one thing: in `a:R -- L:b`, an end of the edge is the side
   `R` of the service `a`. No whitespace stands on either side of it.
2. The colon of a key. The line gives a name its one value, as `id: 1` does in a
   requirement, `m: 60` in a curve of a radar chart, and `fill: #f00` in a
   style. Where it is not plain that a line does, the test is a second line with
   the same name: it adds no item, as mermaid.js reads one slice of a pie chart
   from two lines with the same label. No whitespace stands before the colon of
   a key, and one space follows it.
3. Any other colon. Either each line with the same name adds something (a member
   to a class, a task to a chart), or the text after the colon belongs to more
   than the name before it (the label of a transition). Such a colon can be read
   as a mark that stands between two things, and some of them are written as the
   colon of a key is. The kinds of Prettier do not settle which, so the examples
   in the documentation of the pinned mermaid.js do. Only the examples that
   write the line with a space after its colon are counted. Among them, those
   that write a space before the colon are compared with those that write none:
   where one form is written at least twice as often as the other, that form is
   printed. Where neither is, or no example is counted, the colon is printed as
   a mark that stands between two things, with one space on each side. One space
   follows the colon in either form.

One mark has one kind. Where the same colon stands in several kinds of lines of
a diagram type, the steps are applied to the line on which it can be read in the
fewest ways, and the result holds for all of them. The size of a Venn diagram
follows one set in `set A : 20` and two in `union A, B : 3`. In the second it is
not the value of `B`, so the colon of a size is not the colon of a key in either
line.

An example that writes a colon with no whitespace on either side, in the form
`set A:3`, as the documentation of mermaid.js writes the sizes of a Venn
diagram, is not counted in step 3. A form with no space after the colon is not
printed, so such an example shows neither of the two forms that are compared.

Where the kind of a colon is not plain from these steps, no kind is assumed for
it: its form is decided as under [4](#4-where-none-of-these-rules-gives-a-form),
and its line is added to the table below.

In the table below, the examples are those of the documentation of the pinned
mermaid.js.

| Line                                           | Step | Printed                          | Why                                                                                                                            |
| ---------------------------------------------- | ---- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| An end of an edge of an architecture diagram   | 1    | `a:R -- L:b`                     | The side is a part of the end of the edge.                                                                                     |
| The value of a slice of a pie chart            | 2    | `"Dogs": 386`                    | A second line with the same label adds no slice.                                                                               |
| The title and the description of a diagram     | 2    | `accTitle: text`                 | The line gives the diagram its one title or description.                                                                       |
| The description of a state                     | 3    | `s2: a description`              | A second line adds a line of description; the examples write no space before the colon at least twice as often as one.         |
| The label of a transition between states       | 3    | `s1 --> s2 : go`                 | The label belongs to the transition, not to `s2`; the examples write a space before the colon at least twice as often as none. |
| The label of a relationship of an ER diagram   | 3    | `A \|\|--o{ B : has`             | As for a transition.                                                                                                           |
| The label of a relation between classes        | 3    | `A --> B : label`                | As for a transition.                                                                                                           |
| A member that a line adds to a class           | 3    | `Animal : +int age`              | Each line adds a member; the examples write a space before the colon at least twice as often as none.                          |
| The text of a message of a sequence diagram    | 3    | `A ->> B: text`                  | The text belongs to the message; the examples write no space before the colon.                                                 |
| The data of a task of a Gantt chart            | 3    | `Task one : a1, 2024-01-01, 30d` | Each line is a task, also where two tasks have one name; the examples write a space before.                                    |
| The events of a period of a timeline           | 3    | `2004 : Facebook : Google`       | The colons separate a period and its events; the examples write a space before them.                                           |
| The size of a set or a union of a Venn diagram | 3    | `set A["Alpha"] : 20`            | Each line adds a set or a union, and no example writes a space after the colon.                                                |

How the examples are counted, and their counts for every line that step 3
decides, are in
[The examples that decide the whitespace before a colon](./compatibility.md#the-examples-that-decide-the-whitespace-before-a-colon).

### Padding that lines a column up

Padding that puts the same mark of several lines in one column is no whitespace
beside a mark, and this rule does not decide it.

Prettier prints `const a   = 1` as `const a = 1;`, also where the next line is
`const bbb = 2`. This is not read as a rule against lining up. The lines of
JavaScript, CSS, and YAML are not the rows of a table, so Prettier has no column
to keep in them. Where a text is a table, Prettier lines its columns up: it pads
the cells of a table of Markdown to the width of their column.

So whether lines are lined up is decided for each kind of line, in the document
of its diagram type.

- The tasks of a section of a Gantt chart are rows of a name and its data. The
  printer puts the colons of a section in one column where its names were
  written with padding before their colons. [Task data](./gantt.md#task-data)
  defines when it does, and the sections that it leaves as written.
- The padding that lines the colons of a timeline or of a user journey up stays
  as written. [Periods and events](./timeline.md#periods-and-events) and
  [Task data](./journey.md#task-data) define it.

Another way of lining lines up is decided as under
[4](#4-where-none-of-these-rules-gives-a-form).

### Where mermaid.js decides against the whitespace

The whitespace is printed wherever every version of mermaid.js that counts (see
[The versions of mermaid.js that count](#the-versions-of-mermaidjs-that-count))
reads the text the same with it. It is left out only where mermaid.js rejects it
or reads something else: in the list of ids of a flowchart `class` statement
(`class A,B c`), after the colon of the width of a block (`a:2`), and beside the
colon of a property of a shape of a flowchart (`A[|borders:lt|text]`).
[Lists separated by commas](./compatibility.md#lists-separated-by-commas) names
the lists that stay without the space.

Where mermaid.js rejects the space after a colon, none is printed before it
either, since Prettier prints no colon with a space before it alone: the width
of a block is printed `a:2`, also where `a :2` was written.

### A text that the tree holds whole

This rule decides the whitespace beside the marks that the syntax tree of the
parser holds as tokens. A text that the tree holds whole is printed as written
inside: the text of a label and of a string, and the body of a data block
(`@{ … }`) that mermaid.js reads as YAML, so that `A@{ shape : circle }` in a
flowchart keeps the space before its colon. What the formatter changes in such a
text is defined in the document of its diagram type.

## 2. A gap of a kind that Prettier does not have

A gap of a kind that Prettier does not have takes the form that the other
diagram types print for the same kind of gap. The gap between a keyword and its
text is one: `title    Pets` in a pie chart is printed `title Pets`, as
`title    Plan` in a Gantt chart is printed `title Plan`.

## 3. A spelling

A spelling (the case of a keyword, the quotes of a string, the digits of a
number, the direction of a header) takes the form that the examples in the
documentation of the pinned mermaid.js use at least twice as often as any other:
`"CUSTOMER" ||--o{ "ORDER" : places` in an ER diagram is printed
`CUSTOMER ||--o{ ORDER : places`. Where no form is used that often, or the
examples use none, the spelling is kept as written.

## 4. Where none of these rules gives a form

Where none of these rules gives a form, it is not decided yet which form reads
best. The output of the released version is then not changed on the judgment of
whoever is working on it: the form is decided as AGENTS.md (item 4) says, added
to these rules, and printed after that.

## The versions of mermaid.js that count

The check uses the pinned mermaid.js only, while the formatted text is also
drawn by other versions of mermaid.js. The versions that count are those
published in the 18 months before the pinned version was published: of each
major version, the smallest and the largest minor version among them, and of a
diagram type that was added in that time, the first minor version that has it,
each at its latest patch.
[Versions of mermaid.js that count](./compatibility.md#versions-of-mermaidjs-that-count)
lists them.

So a form is also kept as written where the form that would be printed is not
accepted by every one of these versions that accepts the form that was written,
or is drawn differently by one of them. The document of each diagram type names
its cases with the versions; three of them are:

- the name of a header (`block-beta` and `block`), which the versions accept
  differently;
- the space after the `[` of a flowchart label that holds a `@`
  (`A[ user@example.com ]`), without which the versions from 11.7.0 to 12.0.0
  reject the label;
- the direction of the header of a flowchart (`TB` and `TD`), which the versions
  before 11.10.0 draw differently.

A rule of this kind names the versions that it is kept for. When the pinned
version is raised and none of the versions that a rule names counts any longer,
the rule is taken out, and the form is the one that the rules above give. The
forms that are kept in this way are listed, each with its versions, in
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count).

The CHANGELOG.md of mermaid.js, or the history of its grammar, shows which
version added or changed a form.

## The check, and formatting that changes the Db

The check is that formatting does not change the Db, which is what mermaid.js
has read from a text. A formatting that changes the Db but not the drawing is an
exception. Each kind of exception has a section that defines it, with links to
the code of the pinned mermaid.js that shows why the drawing stays the same and
the result of drawing both texts, and the tests compare the Db with the
differences of that kind restored, one function for each kind, which
`packages/prettier-plugin-mmd/tests/db-comparison.ts` calls. When the pinned
mermaid.js is updated, each exception is checked again by drawing. The kinds
are:

- the limited ASCII space margin changes to eventmodeling block bodies, defined
  in [Data blocks](./eventmodeling.md#data-blocks);
- the margin changes to eligible state note paragraphs, defined in
  [Notes](./state.md#notes);
- the whitespace around the first `:` and the `,` of styles, the runs of spaces
  and tabs between the words of a style, which become one space, and the
  whitespace at the end of a style, defined in
  [Styles that are drawn the same](./compatibility.md#styles-that-are-drawn-the-same);
- the whitespace at the start and at the end of a title, of the date format and
  the axis format of a Gantt chart, and of a description of a C4 diagram, and at
  the end of a period and of an event of a timeline, of the second description
  of an alias of a state diagram, of the name of a task of a Gantt chart, and of
  the description of a task of a user journey, which is the whitespace before
  its first colon, defined in
  [Texts after a keyword that are drawn the same](./compatibility.md#texts-after-a-keyword-that-are-drawn-the-same);
- the runs of spaces and tabs inside the texts that mermaid.js draws without
  them: titles, accessibility descriptions, and the labels of the diagram types
  that draw them as SVG text, defined in
  [Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same);
- the whitespace around the arguments of a `click` call in flowchart, agentflow,
  class, and Gantt diagrams, defined in
  [Call arguments that are drawn the same](./compatibility.md#call-arguments-that-are-drawn-the-same);
- the spaces and tabs at the ends of the texts of a mindmap node and of a kanban
  card, defined in
  [Mindmap texts that are drawn the same](./compatibility.md#mindmap-texts-that-are-drawn-the-same);
- the `labelType` of the labels of flowchart, swimlane, and agentflow diagrams,
  which differs between a label in quotes and a label without them, defined in
  [Labels that are drawn the same](./compatibility.md#labels-that-are-drawn-the-same);
- the case of the hexadecimal digits of a color in a style, which the formatter
  prints in lower case, and the space after each comma of a color function in
  the `rect` and `box` of a sequence diagram and in the `style` of a Venn
  diagram, defined in
  [Colors that are drawn the same](./compatibility.md#colors-that-are-drawn-the-same).
