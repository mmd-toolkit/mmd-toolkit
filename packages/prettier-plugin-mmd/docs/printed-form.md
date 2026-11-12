# How the printed form is decided

Formatting does not change what mermaid.js draws (AGENTS.md, item 4). A way of
writing that draws the same is printed in one form; a way of writing that draws
something else is kept as written. This document says which form is printed. Its
rules are applied in their order, so that no case is left to a judgment of which
form reads better.

The rules of a diagram type are in its own document (`flowchart.md`, `gantt.md`,
and so on), with the reason of each rule, which is one of the rules below.

## 1. The whitespace beside a mark

The whitespace beside a mark is the whitespace that Prettier prints beside the
same kind of mark in the languages it formats.

| Mark                                     | Whitespace                   | Written                                     | Printed                       |
| ---------------------------------------- | ---------------------------- | ------------------------------------------- | ----------------------------- |
| A comma                                  | none before, one space after | `class A,B c` in an ER diagram              | `class A, B c`                |
| A `=`                                    | one space on each side       | `Person(a, "A", $link="x")` in a C4 diagram | `Person(a, "A", $link = "x")` |
| The colon of a key                       | none before, one space after | `"Dogs" : 386` in a pie chart               | `"Dogs": 386`                 |
| A mark that stands between two things    | one space on each side       | `A-->B` in a flowchart                      | `A --> B`                     |
| Parentheses and square brackets          | none inside                  | `A( text )` in a flowchart                  | `A(text)`                     |
| Braces that hold names with their values | one space inside             | `curve c{m: 60, s: 70}` in a radar chart    | `curve c{ m: 60, s: 70 }`     |
| Braces that hold values alone            | none inside                  | `curve d{ 85, 90 }` in a radar chart        | `curve d{85, 90}`             |

The two kinds of braces are the object and the array of Prettier.

### Which kind a colon is

One space follows a colon of either kind. The whitespace before it is decided by
these steps, in their order.

1. The colon of a key: the line gives a name its one value. A second line with
   the same name does not add an item: mermaid.js still reads one, as it reads
   one slice of a pie chart from two lines with the same label. No whitespace
   stands before it.
2. Any other colon can also be read as a mark that stands between two things.
   The examples in the documentation of the pinned mermaid.js that write the
   line with a space after its colon decide the whitespace before it: it is the
   form that they write at least twice as often as the other.
3. Where those examples give no form, because none of them writes a space after
   the colon or because neither form is written twice as often as the other, the
   colon is printed as a mark that stands between two things, with one space on
   each side.

An example that writes a colon with no whitespace on either side, as the
documentation writes the size `set A:3` of a Venn diagram, is a way of writing
that differs from every printed form, so it does not count in step 2.

| Line                                           | Step | Printed                          | Why                                                                                     |
| ---------------------------------------------- | ---- | -------------------------------- | --------------------------------------------------------------------------------------- |
| The value of a slice of a pie chart            | 1    | `"Dogs": 386`                    | A second line with the same label adds no slice.                                        |
| The description of a state                     | 2    | `s2: a description`              | A second line adds a line of description; the examples write no space before the colon. |
| The label of a transition between states       | 2    | `A --> B : go`                   | The label belongs to the transition, not to `B`; the examples space the colon.          |
| The label of a relationship of an ER diagram   | 2    | `A \|\|--o{ B : has`             | As for a transition.                                                                    |
| The label of a relation between classes        | 2    | `A --> B : label`                | As for a transition.                                                                    |
| A member that a line adds to a class           | 2    | `Animal : +int age`              | Each line adds a member; the examples space the colon.                                  |
| The text of a message of a sequence diagram    | 2    | `A ->> B: text`                  | Each line is a message; the examples write no space before the colon.                   |
| The data of a task of a Gantt chart            | 2    | `Task one : a1, 2024-01-01, 30d` | Each line is a task, also where two tasks have one name; the examples space the colon.  |
| The events of a period of a timeline           | 2    | `2004 : Facebook : Google`       | The colons separate a period and its events; the examples space them.                   |
| The size of a set or a union of a Venn diagram | 3    | `set A["Alpha"] : 20`            | Each line adds a set or a union, and no example writes a space after the colon.         |

The counts of the examples are in the document of each diagram type.

### Padding that lines a column up

Padding that lines a column up over several lines, as the colons of the tasks of
a Gantt chart are lined up, is no whitespace beside a mark: Prettier has no kind
for it in those languages, so this rule does not decide it.

### Where mermaid.js decides against the whitespace

The whitespace is printed wherever every version of mermaid.js that counts (see
[The versions of mermaid.js that count](#the-versions-of-mermaidjs-that-count))
reads the text the same with it, and is left out only where mermaid.js rejects
it or reads something else, as in the list of ids of a flowchart `class`
statement (`class A,B c`).

## 2. A gap of a kind that Prettier does not have

A gap of a kind that Prettier does not have takes the form that the other
diagram types print for the same kind of gap.

## 3. A spelling

A spelling (the case of a keyword, the quotes of a string, the digits of a
number, the direction of a header) takes the form that the examples in the
documentation of the pinned mermaid.js use at least twice as often as any other:
`"CUSTOMER" ||--o{ "ORDER" : places` in an ER diagram is printed
`CUSTOMER ||--o{ ORDER : places`. Where no form is used that often, or the
examples use none, the spelling is kept as written.

## 4. Where none of these rules gives a form

Where none of these rules gives a form, the output of the released version is
not changed on a judgment of which form reads better: a form that seems better
is proposed to the user, with a text as written and both outputs, and what is
decided is added to these rules.

## The versions of mermaid.js that count

The check uses the pinned mermaid.js only, while the formatted text is also
drawn by other versions of mermaid.js. The versions that count are those
published in the 18 months before the pinned version was published: of each
major version, the smallest and the largest minor version among them, and of a
diagram type that was added in that time, the first minor version that has it,
each at its latest patch.
[Versions of mermaid.js that count](./compatibility.md#versions-of-mermaidjs-that-count)
lists them.

So a spelling is also kept as written where the form that would be printed is
not accepted by every one of these versions that accepts the form that was
written, or is drawn differently by one of them:

- the name of a header (`block-beta` and `block`), which the versions accept
  differently;
- the space after the `[` of a flowchart label that holds a `@`
  (`A[ user@example.com ]`), without which the versions from 11.7.0 to 12.0.0
  reject the label;
- the direction of the header of a flowchart (`TB` and `TD`), which the versions
  before 11.10.0 draw differently.

The CHANGELOG.md of mermaid.js, or the history of its grammar, shows which
version added or changed a form.

## The check, and formatting that changes the Db

The check is that formatting does not change the Db. A formatting that changes
the Db but not the drawing is an exception. Each kind of exception has a section
that defines it, with links to the code of the pinned mermaid.js that shows why
the drawing stays the same and the result of drawing both texts, and the tests
compare the Db with the differences of that kind restored, one function for each
kind, which `packages/prettier-plugin-mmd/tests/db-comparison.ts` calls. When
the pinned mermaid.js is updated, each exception is checked again by drawing.
The kinds are:

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
  of an alias of a state diagram, and of the name of a task of a Gantt chart,
  defined in
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
