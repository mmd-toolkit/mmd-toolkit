# Class

Japanese version: [class.ja.md](./class.ja.md)

Source of truth in mermaid.js:

- [`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison)
- [`classDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/classDb.ts)
- [`classTypes.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/classTypes.ts)
- the tests (`*.spec.ts`) in
  [`class/`](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class)

This document covers the diagram type `classDiagram`. The nodes of the tree are
defined in [ast/class.md](../ast/class.md).

## Detection

Entry 9 of [detection.md](../detection.md) selects this grammar: the text starts
with `classDiagram`, after whitespace, in exactly this case. [fixture:
common/detect-minimal-class-diagram] [fixture:
common/detect-case-sensitive-class]

Detection only looks at the detection point (see
[Diagram detection](../common.md#diagram-detection)). The grammar then reads the
header keyword again, `classDiagram-v2` or `classDiagram`, not followed by a
word character (see [The statement context](#the-statement-context)), and then a
`newline` unit. So `classDiagram-v2` is a header of the same diagram, while
`classDiagramX`, `classDiagram-v3`, and `classDiagram class A` are detected as
class diagrams and rejected. The header alone is rejected too, because the
grammar needs at least one statement. [fixture: class/header-v2] [fixture:
class/header-word-after-keyword] [fixture: class/header-other-suffix] [fixture:
class/header-statement-same-line] [fixture: class/header-only]

A line that holds only `%%`, or `%%{ }%%`, which is no directive, may come
before the header: it is a bare `%%` line, which detection reads and passes to
find the header, and which is a comment of the diagram, with the mark `%%`, from
the `%%` to the end of its line, as in every diagram type (see
[Diagram detection](../common.md#diagram-detection)); the lexer of mermaid.js
reads it so as well, as a comment-only line that is not counted as a line (rule
2 of [The statement context](#the-statement-context)). The comment belongs to no
node, and the ClassDiagram starts at the header. The whitespace, line
terminators, comment regions, and directives between such a line and the header
are trivia here, as in every diagram type; mermaid.js rejects the input when a
line of whitespace only, not empty, that lies in no comment region stands there,
because its class lexer reads the line as a `newline` unit, which its grammar
does not take before the header (as it does not between statements, below): the
known divergence [`bare-percent-line-before-header`](#known-divergences). A line
that is whitespace only once its directives are left out counts as one, while a
directive on a line of its own, without whitespace before it, is trivia in both.
[fixture: class/header-after-bare-percent-then-whitespace-line] [fixture:
class/header-after-empty-braces-then-whitespace-line] [fixture:
class/header-after-bare-percent-then-indented-directive-line] [fixture:
class/header-after-bare-percent-then-directive-line] [fixture:
class/header-after-bare-percent-then-whitespace-line-then-comment-line]
[fixture: class/header-after-bare-percent-then-empty-line] [fixture:
class/header-after-bare-percent-line] [fixture:
class/header-after-empty-braces-line] [fixture:
class/header-after-non-word-brace-line] Between statements, such a line is
accepted in the same way, while a line of only whitespace after it is a
`newline` unit of its own, and the input is rejected, as in mermaid.js.
[fixture: class/lex-bare-percent-line-between-statements] [fixture:
class/lex-bare-percent-line-then-blank-line] [fixture:
class/lex-bare-percent-line-then-spaces-line] Any other text before the header,
such as a line `#`, is diagram text at the detection point, which no detector
matches, and the input is rejected, as in mermaid.js. [fixture:
class/header-after-hash-line]

## Lexical structure

The lexer reads the [diagram text](../common.md#reading-a-source) in
[converted form](../common.md#reading-a-source): each line terminator as `\n`,
each attribute quote as `'`, each entity as its placeholder, and through comment
regions and the `;` that the line rule ignores as if they were not there. The
`\n` that the lexer reads after the last character
([End of text](../common.md#end-of-text)) is part of the diagram text. This
section describes the diagram's own unit rules, item 4 of
[Reading a source](../common.md#reading-a-source).

The lexer of mermaid.js for this diagram compares letters as they are written:
`Class A` is no class statement but the name `ClassA` alone, and `Note "x"` is
rejected. [fixture: class/lex-keyword-upper-case] [fixture:
class/lex-note-upper-case] A **keyword** below is a word that is not followed by
a word character (see [Notation](../common.md#notation)): `class classA`
declares the class `classA`, while in `class-A` the lexer reads the keyword
`class` and then the name `-A`, because `-` is no word character. [fixture:
class/lex-keyword-prefix-of-name] [fixture: class/lex-keyword-before-dash]

### Units and contexts

The lexer divides the diagram text into **units**. The grammar is written over
units. Each unit has a name, which the grammar uses, and a **text**: the
characters it read, in converted form.

The lexer keeps a stack of **contexts**. It starts in the statement context. A
rule may enter a context, which puts it on top of the stack, or leave the
current context, which returns to the one below it; leaving the statement
context keeps the statement context. At each position, the lexer applies the
first rule of the current context that matches there. Whitespace that a rule
reads belongs to no unit unless the rule says otherwise.

The rules of each context are listed below. When no rule of the current context
matches, the input is rejected; the lists do not repeat this. The statement
context, the class context, the namespace context, and the namespace body
context end with the **shared rules**. The other contexts read every character
with their own rules.

At the end of the text, the lexer stops in the statement context, and after a
backquoted name that is not closed (see
[Strings, backquoted names, and generic types](#strings-backquoted-names-and-generic-types)).
In the other contexts, the input is rejected: a member body, a namespace body, a
generic type, a callback name or its arguments, a title, a description, or a
description block that is not closed when the text ends. [fixture:
class/lex-member-body-unclosed] [fixture: class/lex-namespace-body-unclosed]
[fixture: class/lex-generic-unclosed] [fixture:
class/lex-callback-name-unclosed] [fixture:
class/lex-callback-arguments-unclosed] [fixture: class/lex-acc-title-at-end]
[fixture: class/lex-acc-descr-at-end] [fixture:
class/lex-acc-descr-block-unclosed] The title context is entered after the
whitespace that follows `accTitle:`, line feeds included, so `accTitle:` with
only whitespace after it is rejected at the end of the text. So it is with the
description context: `accDescr:` followed by empty lines only, a comment line
only, or a directive line only, at the end of the text, is rejected. [fixture:
class/lex-acc-descr-then-empty-lines-only] [fixture:
class/lex-acc-descr-then-comment-only] [fixture:
class/lex-acc-descr-then-directive-only]

### Directives inside units

The lexer reads the diagram text, which has no directives, as mermaid.js reads
its text once it has removed them. The rule of
[A directive is a token boundary](../common.md#a-directive-is-a-token-boundary)
then applies to the units: a directive inside a text unit or a string unit keeps
the reading of mermaid.js, while a directive inside any other unit, a name unit
included, makes the input rejected. The **name units** are the `word` after
`style`, each `word` of a `classDef` statement, the `word` of a `cssClass`
statement, and the name part after `:::` or between `<<` and `>>` of a
statement. The **text units** are the name parts and `.` units of a class name
or a namespace name before a backquoted name or without one, which may have
whitespace between them, a `generic-text` unit, the text of a `label` unit after
its `:`, a `member-name`, `parameters`, `return-type`, or `annotation-name`
unit, a `callback-name` or `callback-arguments` unit, the units of a style, a
`title-text`, `description-text`, or `description-block-text` unit, a
`direction-text` unit, and an ignored part of a method line. The **string
units** are the `string` and `backquoted` units. [fixture:
class/div-directive-in-style-id] [fixture:
class/div-directive-in-class-def-name] [fixture:
class/div-directive-in-css-class-name] [fixture:
class/div-directive-in-css-class-shorthand] [fixture:
class/div-directive-in-annotation-statement-name] [fixture:
class/lex-directive-in-generic] [fixture: class/lex-directive-in-parameters]
[fixture: class/lex-directive-in-return-type] [fixture:
class/lex-directive-in-member-annotation] [fixture:
class/lex-directive-in-callback-name] [fixture:
class/lex-directive-in-callback-arguments] [fixture:
class/lex-directive-in-acc-title-text] [fixture:
class/lex-directive-in-acc-descr-text] [fixture:
class/lex-directive-in-acc-descr-block-text] [fixture:
class/lex-directive-in-ignored-method-part]

- `class Fo%%{init: {}}%%o` declares `Foo`, `class A%%{init: {}}%%.B` the class
  `A.B`, and `namespace Fo%%{init: {}}%%o {` the namespace `Foo`,
  `A : +fo%%{init: {}}%%o()` has the method `foo`, and
  `A --> B : x%%{init: {}}%%y` has the label `xy`, as in mermaid.js. So it is
  with an ignored `;`: after a cardinality `"style:#x"`, `A "style:#x" --> B;C`
  has a relation to `BC`. [fixture: class/lex-directive-in-name] [fixture:
  class/lex-directive-in-dotted-name] [fixture:
  class/lex-directive-in-namespace-name] [fixture:
  class/lex-directive-in-member] [fixture: class/lex-directive-in-label]
  [fixture: class/tokens-style-directive-inside-label] [fixture:
  class/tokens-ignored-text-directive-after-direction] [fixture:
  class/tokens-ignored-semicolon-in-relation-name]
- A directive between two units is allowed whatever their kind:
  `A <|%%{init: {}}%%-- B` is an extension. [fixture:
  class/lex-directive-between-relation-end-and-line]
- A directive inside a string or a backquoted name keeps the reading of
  mermaid.js, wherever it lies inside the unit: `note "a%%{init: {}}%%b"` has
  the note `ab`, `note "a %%{init: {}}%% b"` the note `a`, two spaces, and `b`,
  ``class `a %%{init: {}}%% b` `` declares the class `a`, two spaces, and `b`,
  and ``class `%%{init: {}}%%a` `` and ``class `a%%{init: {}}%%` `` the class
  `a`. [fixture: class/lex-directive-in-note-string] [fixture:
  class/lex-directive-in-string-spaces] [fixture:
  class/lex-directive-in-backquoted-name] [fixture:
  class/lex-directive-in-backquoted-name-spaces] [fixture:
  class/lex-directive-in-backquoted-name-after-open] [fixture:
  class/lex-directive-in-backquoted-name-before-close] [fixture:
  class/lex-directive-in-backquoted-name-with-quotes] So it is with the string
  of a note for a class, a cardinality, the URL of a link, the tooltip of a
  callback, and a backquoted name in a relation or of a namespace. [fixture:
  class/lex-directive-in-note-for-string] [fixture:
  class/lex-directive-in-cardinality] [fixture:
  class/lex-directive-in-link-string] [fixture:
  class/lex-directive-in-callback-tooltip-string] [fixture:
  class/lex-directive-in-backquoted-relation-end] [fixture:
  class/lex-directive-in-backquoted-namespace] A string or a backquoted name
  with only a directive is read as an empty one: `note "%%{init: {}}%%"` and
  ``class `%%{init: {}}%%` `` are rejected, as they are with nothing between the
  delimiters, while `A "%%{init: {}}%%" --> B` has an empty cardinality, as
  `A "" --> B` does. [fixture: class/lex-directive-in-string-only] [fixture:
  class/lex-directive-in-backquoted-name-only] [fixture:
  class/lex-directive-in-empty-cardinality]
- In `cla%%{init: {}}%%ss A`, `A -%%{init: {}}%%-> B`, and
  `class A:%%{init: {}}%%::c`, the directive lies inside a keyword, a line, or
  `:::`, and the input is rejected, while mermaid.js accepts it (see
  [Known divergences](#known-divergences)). [fixture:
  class/div-directive-in-keyword] [fixture: class/div-directive-in-line]
  [fixture: class/div-directive-in-triple-colon]

### The statement context

In the statement context, the lexer tries these rules in order:

1. A **direction line** (see below). [fixture: class/db-direction-bt]
2. `%%` and the rest of its line, up to the line feed: a diagram comment. Its
   mark is `%%`, and its value is the text after the mark. Most lines with only
   whitespace before `%%` are comment lines of
   [common.md](../common.md#comment-lines), removed before the lexer reads the
   text, so this rule applies to a `%%` after a unit, and to a line that is no
   comment line because nothing or `{` follows its `%%`. A line that holds only
   whitespace and such a comment is a **comment-only line**. A comment-only line
   is not counted as a line, and neither are the empty lines right after it: no
   `newline` unit is read for their line feeds, which belong to no unit. A line
   of only whitespace after it counts as a line. A comment after a unit ends at
   the end of its line, and the line feed after it is a `newline` unit (see
   [Known divergences](#known-divergences)). [fixture:
   class/db-member-statement-percent]
3. `accTitle`, zero or more whitespace, `:`, and zero or more whitespace: an
   `accTitle` unit and a `:` unit; enters the title context. [fixture:
   class/lex-acc-title-hash-semicolon] [fixture:
   class/lex-acc-title-space-before-colon] [fixture:
   class/lex-acc-title-no-whitespace] [fixture:
   class/lex-acc-title-line-feed-before-colon]
4. `accDescr`, zero or more whitespace, `:`, and zero or more whitespace: an
   `accDescr` unit and a `:` unit; enters the description context. [fixture:
   class/lex-acc-descr-hash-semicolon] [fixture:
   class/lex-acc-descr-space-before-colon] [fixture:
   class/lex-acc-descr-no-whitespace] [fixture:
   class/lex-acc-descr-line-feed-before-colon]
5. `accDescr`, zero or more whitespace, `{`, and zero or more whitespace: an
   `accDescr` unit and a `{` unit; enters the description block context.
   [fixture: class/gram-empty-description-block-then-statement] [fixture:
   class/gram-acc-descr-block-with-text] [fixture:
   class/lex-acc-descr-block-no-whitespace] [fixture:
   class/lex-acc-descr-block-line-feed-before-brace]
6. Zero or more whitespace followed by one or more line feeds, as many as
   possible, so that the last character read is a line feed: a `newline` unit.
   Blank lines and lines of only whitespace are part of it. [fixture:
   class/gram-blank-lines] [fixture:
   class/lex-spaces-only-line-between-statements]
7. One or more other whitespace characters: nothing. [fixture:
   class/gram-name-spaces]
8. The keywords `classDiagram-v2` and `classDiagram`: a `header` unit. [fixture:
   common/detect-minimal-class-diagram] [fixture: class/header-v2]
9. `[*]`: a `[*]` unit. [fixture: class/lex-edge-state-in-statement]
10. `call` and all the whitespace that follows it, one or more characters, line
    terminators included: a `call` unit; enters the callback name context.
    [fixture: class/lex-call-prefix] [fixture:
    class/lex-callback-name-multi-line] [fixture: class/lex-call-two-spaces]
11. `"`: a string (see
    [Strings, backquoted names, and generic types](#strings-backquoted-names-and-generic-types)).
    [fixture: class/lex-string-multi-line]
12. The keywords `style` and `classDef`: a unit named by the keyword. [fixture:
    class/db-style-undefined-class] [fixture: class/db-class-def-default]
13. The keyword `namespace`: a `namespace` unit; enters the namespace context.
    [fixture: class/gram-namespace-empty]
14. The keyword `class`: a `class` unit; enters the class context. [fixture:
    class/lex-keyword-prefix-of-name]
15. The shared rules. In the statement context, `:`, `,`, and `#` that no shared
    rule before the punctuation rule reads are a unit named by their text.
    [fixture: class/gram-member-statement] [fixture:
    class/lex-hash-in-statement]

The units `[*]`, `=`, `+`, and `punctuation` are taken by no rule of the
grammar, so an input that has one is rejected. [fixture:
class/lex-edge-state-in-statement] [fixture: class/lex-equals-in-name] [fixture:
class/lex-plus-in-name] [fixture: class/lex-punctuation-in-name] Some
consequences of the order:

- A keyword is a keyword wherever a unit starts. `class note`, `class link`,
  `class o`, and `class _self` are rejected, and so is a relation to `note`,
  while `class noteX` and `class order` declare `noteX` and `order`. [fixture:
  class/lex-keyword-note-as-name] [fixture: class/lex-keyword-link-as-name]
  [fixture: class/lex-keyword-o-as-name] [fixture:
  class/lex-keyword-link-target-as-name] [fixture:
  class/lex-keyword-prefix-of-note] [fixture: class/lex-keyword-o-prefix]
  [fixture: class/lex-keyword-note-relation-end]
- `o` is a relation end only where no word character follows it: `A --o B` is an
  aggregation, and `A --oB` is a relation with no ends from A to the class `oB`.
  [fixture: class/lex-aggregation-end] [fixture: class/lex-o-before-word]
- `call` is a keyword only with whitespace after it: `class callX` declares
  `callX`, and `A --> call` is rejected. [fixture: class/lex-call-prefix]
  [fixture: class/lex-call-at-end]
- A label (shared rule 9) ends at `:`, `;`, or a line feed. The `%%` in a label
  is part of it: `A --> B : x %% c` has the label `x %% c`. A second `:` starts
  a second label, which the grammar does not take: `A --> B : x : y` and
  `A : foo(a: int)` are rejected. A `;` matches no rule, so `A : x;y` is
  rejected. [fixture: class/lex-label-percent] [fixture:
  class/lex-label-two-colons] [fixture: class/lex-label-colon-in-member]
  [fixture: class/lex-label-semicolon]
- `;`, `{`, `}`, `|`, `(` without `)`, `)`, `@`, and `^` match no rule in the
  statement context: `class A; class B`, `A | B`, and `A@B --> C` are rejected.
  [fixture: class/lex-semicolon] [fixture: class/lex-pipe] [fixture:
  class/lex-at]
- An entity is read as its placeholder (see [Entities](../common.md#entities)).
  Its first character is a letter of the letter rule, while no rule reads the
  second, so an entity in a name is rejected; in a label, a string, and a member
  it is part of the text. [fixture: class/lex-entity-in-name] [fixture:
  class/lex-entity-in-label] [fixture: class/lex-entity-in-note] [fixture:
  class/lex-entity-in-member]

**The direction line.** From the current position: a run of characters without
line feeds, U+2028, or U+2029, the longest one that the rest can follow; then
`direction`; then one or more whitespace characters, line feeds included; then
one of `TB`, `BT`, `RL`, and `LR`; and then every character up to the next line
feed, which is not included. The rule reads the characters before `direction` as
a `direction-text` unit, `direction` as a `direction` unit, the value as a
`direction-value` unit, and the characters after the value as another
`direction-text` unit; a `direction-text` unit that would be empty or all
whitespace is left out. mermaid.js does not read the `direction-text` units. The
values are tried in the order given: if the line has `direction` followed by
`TB` anywhere, the value is `TB`; otherwise `BT` is tried, and so on. For a
value, the lexer takes the last `direction` of the run that it follows, and the
unit ends at the end of the line on which the value stands. So
`direction TB x direction TB` is read at its last `direction`, and
`direction TB x` is a `direction-text` unit. [fixture:
class/lex-direction-line-same-value-twice] This is the direction line of
flowchart (see [The statement context](./flowchart.md#the-statement-context)
there) without the value `TD`. Here it is the first rule, so it is tried at the
start of every line in the statement context and takes the whole line:

- `class A direction LR` is a direction line, not a class statement, and so is
  `A --> B : set direction LR now`, not a relation statement. [fixture:
  class/lex-direction-line-class-statement] [fixture:
  class/lex-direction-line-in-label]
- Quotes do not keep the rule out: `note "x direction TB"` and a link whose URL
  contains `direction TB` are direction lines. [fixture:
  class/lex-direction-line-in-note] [fixture: class/lex-direction-line-in-url]
- It also takes the header line: `classDiagram direction LR` has no header and
  is rejected. [fixture: class/header-direction-line]
- `direction LR direction TB` has the value `TB`, `direction TBX` the value `TB`
  and the text `X` after it, and `direction`, a line break, and `LR` the value
  `LR`. `direction lr` is no direction line but the name `directionlr`.
  [fixture: class/lex-direction-line-two-values] [fixture:
  class/lex-direction-line-value-then-text] [fixture:
  class/lex-direction-line-value-next-line] [fixture:
  class/lex-direction-lower-case]
- An empty description block before `direction` or after the value, and a `;`
  after the value, are `direction-text` units, which mermaid.js does not read; a
  closed directive after the value is a directive, and the line then has no text
  after the value. [fixture:
  class/lex-direction-line-after-empty-description-block] [fixture:
  class/lex-direction-line-then-empty-description-block] [fixture:
  class/lex-direction-line-value-then-semicolon] [fixture:
  class/lex-direction-line-then-directive]
- The rule is not tried in the other contexts: in a namespace body,
  `direction LR` is rejected, and in a member body it is a member. [fixture:
  class/lex-direction-in-namespace] [fixture:
  class/lex-direction-in-member-body]

### The shared rules

1. The keyword `note for`, with one space between the two words: a `note` unit
   and a `for` unit. The keywords `cssClass`, `callback`, `link`, `click`, and
   `note`: a unit named by the keyword. [fixture:
   class/db-note-for-undefined-class] [fixture:
   class/db-css-class-undefined-class] [fixture:
   class/docs-syntax-class-diagram-500154a2] [fixture:
   class/db-link-undefined-class] [fixture: class/db-click-href] [fixture:
   class/lex-string-multi-line]
2. `<<` and `>>`: a unit named by its text. [fixture:
   class/spec-class-diagram-280c04be]
3. The keyword `href`: an `href` unit. [fixture: class/db-click-href]
4. `~`: a `~` unit; enters the generic context. [fixture:
   class/lex-generic-multi-line]
5. `` ` ``: a backquoted name (see
   [Strings, backquoted names, and generic types](#strings-backquoted-names-and-generic-types)).
   [fixture: class/gram-name-word-then-backquoted]
6. The keywords `_self`, `_blank`, `_parent`, and `_top`: a `link-target` unit.
   [fixture: class/lex-keyword-link-target-as-name] [fixture:
   class/spec-class-diagram-ab0cb6e2] [fixture:
   class/spec-class-diagram-3b723e23] [fixture:
   class/spec-class-diagram-81c8965e]
7. A **relation end**: `<|`, `|>`, `>`, `<`, `*`, `o` not followed by a word
   character, or `()`. A unit named by its text. [fixture:
   class/db-relation-types] [fixture: class/spec-class-diagram-e8e66ff2]
   [fixture: class/spec-class-diagram-231ff139] [fixture:
   class/lex-aggregation-end] [fixture: class/db-lollipop-both]
8. A **line**: `--` or `..`. A unit named by its text. [fixture:
   class/db-relation-types]
9. `:` and one or more characters other than `:`, `;`, and line feed, as many as
   possible: a `label` unit. [fixture: class/gram-member-statement] [fixture:
   class/lex-label-percent]
10. `:::`: a `:::` unit. [fixture: class/db-css-class-digit]
11. `-`, `.`, `+`, `%`, and `=`: a unit named by its text. [fixture:
    class/gram-name-dash-spaces] [fixture: class/gram-name-dots] [fixture:
    class/gram-member-statement] [fixture: class/lex-plus-in-name] [fixture:
    class/lex-equals-in-name] [fixture: class/lex-percent-in-name]
12. One or more ASCII letters, ASCII digits, and `_`: a `word` unit. [fixture:
    class/gram-name-digits]
13. `[` and `]`: a unit named by its text. [fixture: class/db-class-label-type]
14. One of `!`, `$`, `&`, `'`, `?`, `\`, and `/`, and, outside the statement
    context, `,` and `#`: a `punctuation` unit. [fixture:
    class/lex-punctuation-in-name]
15. A Unicode letter, as in flowchart (see
    [Unicode letters](./flowchart.md#unicode-letters)): a `letter` unit of one
    character. [fixture: class/lex-unicode-letter-name]

`note for` needs exactly one space: `note  for A "x"`, with two, and the same
with a tab, are rejected. [fixture: class/lex-note-for-two-spaces] [fixture:
class/lex-note-for-tab] The space is counted in the diagram text, and a
directive next to it lies between two units: `note%%{init: {}}%% for A "t"` and
`note %%{init: {}}%%for A "t"` are notes for A, while
`note %%{init: {}}%% for A "t"` has two spaces and is rejected, all as in
mermaid.js. [fixture: class/lex-directive-between-note-and-for] [fixture:
class/lex-directive-between-space-and-for] [fixture:
class/lex-note-for-directive-between-spaces]

### The class context

The class context is entered by `class`. It reads the rest of the line:

1. `"`: a string. [fixture: class/db-class-label-type]
2. Zero or more whitespace followed by one or more line feeds, as in rule 6 of
   the statement context: a `newline` unit; leaves the class context. [fixture:
   class/gram-blank-lines]
3. One or more other whitespace characters: nothing. [fixture:
   class/lex-member-body-one-line]
4. `}`: a `}` unit; leaves the class context and the context below it. [fixture:
   class/lex-class-closes-namespace]
5. `{`: a `{` unit; enters the member context. [fixture:
   class/lex-member-body-one-line]
6. The shared rules. [fixture: class/lex-keyword-prefix-of-name]

The statement context's own rules do not apply here: `class A %% c` and
`class A : x` are rejected. [fixture: class/lex-class-comment] [fixture:
class/lex-class-label] `}` leaves two contexts, so in a namespace body,
`class C }` ends the namespace. [fixture: class/lex-class-closes-namespace]

### The member context

The member context is entered by `{` in the class context. It reads the body of
a class line by line:

1. `"` right after the `{` or after a line feed: a string. [fixture:
   class/lex-member-quote-at-start]
2. `}`: a `}` unit; leaves the member context. [fixture:
   class/lex-member-body-close-on-member-line]
3. `[*]`: a `[*]` unit. [fixture: class/lex-member-edge-state]
4. `{`: a `{` unit. [fixture: class/lex-member-open-brace]
5. A line feed: nothing. [fixture: class/lex-member-body-close-on-member-line]
6. One or more characters other than `{`, `}`, and line feed: a **member line**,
   divided into units as described under [Member lines](#member-lines).
   [fixture: class/lex-member-body-one-line]

So a member line ends at a line feed, `{`, or `}`: `class A { +x }` has the
member `+x`, and `class A {+x`, a line break, and `+y}` the members `+x` and
`+y`. [fixture: class/lex-member-body-one-line] [fixture:
class/lex-member-body-close-on-member-line] A `"` starts a string only where a
member starts, and the grammar does not take a string there: a member line `"x"`
is rejected, and `+foo "bar"` is a member with the quotes in it. [fixture:
class/lex-member-quote-at-start] [fixture: class/lex-member-quote-inside] `%%`,
`;`, `[*]`, and `~` inside a member line are characters of it: `+x %% c` is the
member `x %% c`. [fixture: class/lex-member-percent] [fixture:
class/lex-member-semicolon] A `[*]` right after the `{` or a line feed is a
`[*]` unit, which the grammar does not take, so `[*]` and `[*] x` on a line of
their own in a body are rejected, and so is a `{` in a body. The context has no
rule for whitespace, so `  [*]`, with spaces before it, is a member line, the
attribute `[*]`. [fixture: class/lex-member-edge-state] [fixture:
class/lex-member-edge-state-then-text] [fixture: class/lex-member-open-brace]
[fixture: class/lex-member-edge-state-indented]

### Member lines

mermaid.js reads a member line as one text and divides it into its parts when it
adds the member
([`addMember`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/classDb.ts#L277-L297),
[`ClassMember`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/classTypes.ts#L80-L134)).
The division depends on the text alone, so the lexer makes it, and each part is
a unit. The whitespace at the ends of the line belongs to no unit; a line of
only whitespace makes a `blank-member` unit, which no node holds. The rest, the
**member text**, is divided by the first of these that applies:

1. The member text starts with `<<` and ends with `>>`: an **annotation line**.
   `<<` and `>>` are units named by their text, and the text between them, when
   it is not empty, is an `annotation-name` unit, whitespace included. [fixture:
   class/spec-class-diagram-4eb71456] [fixture:
   class/lex-member-annotation-empty]
2. The member text has a `)`, and its first `)` is not its first character: a
   **method line**. `)x()` and `)+login()` are attribute lines, whose name is
   the whole text, and `x)y()` is a method line. [fixture:
   class/lex-member-parenthesis-first-attribute] [fixture:
   class/lex-member-parenthesis-first-visibility] [fixture:
   class/lex-member-parenthesis-later-method]
3. Otherwise, an **attribute line**. [fixture: class/lex-member-classifiers]

A **visibility mark** is one of `+`, `-`, `#`, and `~` at the start of a method
or attribute line; a **classifier mark** is `$` or `*`. [fixture:
class/spec-class-diagram-3f4d248a] [fixture: class/lex-member-classifiers]
[fixture: class/lex-member-attribute-star-classifier] [fixture:
class/lex-member-attribute-dollar-classifier]

The **member name text** of an attribute line is the text of its member text
between its visibility mark, or its start, and its classifier mark, or its end;
that of a method line is the text of the divided segment or member text from
after the visibility mark that was set apart, or from its start, to the opening
parenthesis (see below). Its `member-name` unit is the member name text without
the whitespace at its end, and without the whitespace at its start unless its
first character is a space (U+0020); a member name text of only whitespace is
the unit when it starts with a space, and makes no unit otherwise, and an empty
member name text makes no unit. The whitespace at the end of a line belongs to
no unit, so a member line `+` followed by a space has the empty member name text
and no name, and the member the empty id, while `+`, a space, and `$` has the
member name text of one space, which is the unit, and the member the id of one
space. [fixture: class/db-member-visibility-then-space] [fixture:
class/db-member-visibility-space-then-classifier] The reason is that mermaid.js
keeps the member name text with its whitespace and then makes the whitespace at
its start one space when its first character is a space, and drops it otherwise:
the member name of mermaid.js is not a range of the written text, so the value
of the name is the written range. `+  spaced name` has the name of two spaces
and `spaced name`, and the member name of one space and `spaced name`. [fixture:
class/db-member-name-space] [fixture: class/db-member-name-space-then-tab]
[fixture: class/db-member-name-tab]

An attribute line is divided into a `visibility` unit for a visibility mark at
its start, a `classifier` unit for a classifier mark at its end, and the
`member-name` unit of its member name text.

A method line is divided as follows. First the visibility mark, if the line
starts with one, is set apart, and the rest is divided; when the rest cannot be
divided, the visibility mark is not set apart, and the whole member text is
divided. A text is divided at its **opening parenthesis**, the last `(` that is
not the first character and that has a `)` somewhere after it, and at its
**closing parenthesis**, the last `)`. When the text has no opening parenthesis,
it cannot be divided. The units are, in order:

1. a `visibility` unit for the visibility mark that was set apart; [fixture:
   class/spec-class-diagram-3f4d248a]
2. the `member-name` unit of the member name text, the text before the opening
   parenthesis; [fixture: class/db-member-name-space]
3. a `(` unit, a `parameters` unit for the text between the two parentheses,
   without the whitespace at its ends, when that is not empty, and a `)` unit;
   [fixture: class/lex-member-method-blank-parameters] [fixture:
   class/lex-directive-in-parameters]
4. a `classifier` unit for the character right after the closing parenthesis
   when it is a classifier mark; [fixture: class/lex-member-classifiers]
5. a `return-type` unit for the rest, without the whitespace at its ends, when
   that is not empty; when it ends with a classifier mark and item 4 found none,
   that mark is a `classifier` unit, and the `return-type` unit runs from the
   first character of the rest that is not whitespace to the mark, the
   whitespace before the mark included, when that is not empty: mermaid.js trims
   the return type before it removes the mark. [fixture:
   class/db-method-return-type-space-before-classifier] [fixture:
   class/db-method-return-type-blank-before-classifier]

mermaid.js divides a method line with a pattern whose characters do not match
U+2028 and U+2029, and reads one part of the line. When a method line has either
character, the parts of its member text between them are its **segments**, and
the division above is applied to the first segment that can be divided, instead
of to the whole member text. A segment is divided as it is written, with the
whitespace at its start: a visibility mark is set apart only when it is the
first character of the segment, and a `(` after that whitespace is not the first
character. `x`, U+2028, and `+b(c)` is the method `b` with the visibility `+`,
while `x`, U+2028, and ` +b(c)` is the method `+b` without visibility, and `x`,
U+2028, and ` (c)` is a method whose name is the space before the `(`. [fixture:
class/lex-member-method-segment-visibility-first] [fixture:
class/lex-member-method-segment-space-before-visibility] [fixture:
class/lex-member-method-segment-space-only-name] The return type then runs to
the end of that segment, or, when the closing parenthesis is the last character
of the segment, to the end of the next segment. The text before the segment and
the text after the return type, each without the whitespace at its ends, are
`ignored-text` units, which mermaid.js does not read, when anything is left; a
text of only whitespace is no unit, so `+b(c) in`, U+2028, and a space has the
return type `in` and no text after it. [fixture:
class/tokens-member-method-ignored-text-blank] `+a`, U+2028, and `b(c) int` is
the method `b` without visibility, with the ignored text `+a` before it, and
`+b(c) in`, U+2028, and `t` has the return type `in` and the ignored text `t`
after it. [fixture: class/lex-member-method-line-separator-before] [fixture:
class/lex-member-method-line-separator-after] [fixture:
class/lex-member-method-line-separator-after-parenthesis] An attribute line and
an annotation line are divided without such a pattern, so U+2028 and U+2029 are
characters of them like any other: `+a`, U+2028, and `b$` is the attribute with
the name `a`, U+2028, and `b`. [fixture:
class/lex-member-attribute-line-separator] [fixture:
class/lex-member-annotation-line-separator]

When no segment can be divided, the input is rejected, also when the parentheses
lie in two segments. [fixture:
class/lex-member-method-line-separator-in-parameters] Without U+2028 and U+2029,
this means that when neither the rest nor the whole member text can be divided,
the input is rejected: `x)` and `(a)` are rejected, as in mermaid.js, which
throws an error for them after its grammar has accepted them (see
[Rejections outside the grammar](#rejections-outside-the-grammar)). [fixture:
class/lex-member-method-without-opening] [fixture:
class/lex-member-method-parenthesis-first]

- `+foo(a(b)) int` is the method `foo(a` with the parameters `b)` and the return
  type `int`. [fixture: class/lex-member-method-nested-parentheses]
- `+(a)` is the method `+`: with the visibility mark set apart, `(` would be the
  first character. [fixture: class/lex-member-method-visibility-as-name]
- `+foo()$ int` has the classifier `$` and the return type `int`, and
  `-bar() int$` has the return type `int` and the classifier `$`. [fixture:
  class/lex-member-classifiers]
- `<<x)>>` is an annotation, and `<<x>` an attribute. [fixture:
  class/lex-member-annotation-with-parenthesis] [fixture:
  class/lex-member-annotation-unclosed]

### The namespace context

The namespace context is entered by `namespace`. It reads the name of the
namespace up to its `{`:

1. `"`: a string. [fixture: class/lex-namespace-string-name]
2. The keyword `namespace`: a `namespace` unit; enters the namespace context.
   [fixture: class/lex-namespace-keyword-in-name]
3. Zero or more whitespace followed by one or more line feeds: a `newline` unit;
   leaves the namespace context. [fixture: class/lex-namespace-brace-next-line]
4. One or more other whitespace characters: nothing. [fixture:
   class/gram-namespace-empty]
5. `{`: a `{` unit; enters the namespace body context. [fixture:
   class/gram-namespace-empty]
6. `}`: leaves the namespace context without reading the `}`, which the context
   below reads. [fixture: class/lex-namespace-close-in-name]
7. The shared rules. [fixture: class/lex-directive-in-namespace-name]

The `{` must be on the line of the name: `namespace A`, a line break, and `{` is
rejected. [fixture: class/lex-namespace-brace-next-line]

### The namespace body context

1. `"`: a string. [fixture: class/lex-namespace-body-string]
2. The keyword `namespace`: a `namespace` unit; enters the namespace context.
   [fixture: class/lex-namespace-two-closing-braces]
3. `}`: a `}` unit; leaves the namespace body context. [fixture:
   class/gram-namespace-empty]
4. Zero or more whitespace followed by one or more line feeds: a `newline` unit.
   [fixture: class/lex-namespace-two-closing-braces]
5. One or more other whitespace characters: nothing. [fixture:
   class/lex-namespace-two-closing-braces]
6. `[*]`: a `[*]` unit. [fixture: class/lex-namespace-body-edge-state]
7. The keyword `class`: a `class` unit; enters the class context. [fixture:
   class/lex-class-closes-namespace]
8. The shared rules. [fixture: class/gram-namespace-note]

After the `}` of a body, the lexer is back in the namespace context, which the
line feed after the `}` leaves. The statement context's own rules do not apply
in a body: a comment after a note there is rejected, and so are `style` and the
direction line. [fixture: class/lex-namespace-body-comment] [fixture:
class/lex-namespace-body-style] [fixture: class/lex-direction-in-namespace] Two
namespaces may close on one line: `}}` closes the inner and the outer namespace.
[fixture: class/lex-namespace-two-closing-braces]

### Strings, backquoted names, and generic types

A `"` (rule 11 of the statement context, and rule 1 of the class, member,
namespace, and namespace body contexts) starts a string: the `"`, the characters
up to the next `"`, line feeds included, and that `"` are a `string` unit. The
string is **empty** when nothing is between the quotes. A string may span lines,
and `;` and `#` are characters of it. When the text has no `"` after the first,
the input is rejected. [fixture: class/lex-string-multi-line] [fixture:
class/lex-string-semicolon] [fixture: class/lex-string-unclosed] [fixture:
class/db-class-label-type]

A `` ` `` (shared rule 5) starts a backquoted name in the same way: the `` ` ``,
the characters up to the next `` ` ``, line feeds included, and that `` ` `` are
a `backquoted` unit, which is **empty** when nothing is between the backquotes.
When the text has no `` ` `` after the first, the unit takes the rest of the
text, and the lexer stops at its end: the name is not closed. [fixture:
class/lex-backquote-unclosed] [fixture:
class/lex-backquote-unclosed-takes-lines] [fixture:
class/div-empty-backquoted-in-name] So it is after a prefix, as in `class A.`
followed by an unclosed backquoted name, and at the end of a relation, as in
`A -->` followed by one, where the name takes the rest of the text; a namespace
still needs its `{`, so `namespace` followed by an unclosed backquoted name is
rejected. [fixture: class/lex-backquote-unclosed-after-prefix] [fixture:
class/lex-backquote-unclosed-relation-end] [fixture:
class/lex-backquote-unclosed-namespace] A directive in that rest after the last
character of the name that is not whitespace, which mermaid.js removes as
everywhere, lies inside the name when whitespace or line terminators of the name
follow it, and otherwise after the name. `class`, `` `x``, a line break,
`%%{init: {}}%%`, and a line break declares the class `x` followed by three line
feeds, and so do the same with the directive right after `x` and after an empty
line, each followed by a line break, with their own whitespace; with the
directive at the end of the text after `` `b`` and a space, the class is `b`, a
space, and a line feed. A directive between two characters of the name that are
not whitespace lies inside the name too: `class`, `` `x``, the directive, `y`,
and a line break declares the class `xy` followed by two line feeds. [fixture:
class/lex-backquote-unclosed-directive-inside] [fixture:
class/lex-backquote-unclosed-directive-after-line-break] [fixture:
class/lex-backquote-unclosed-directive-right-after-name] [fixture:
class/lex-backquote-unclosed-directive-after-empty-line] [fixture:
class/lex-backquote-unclosed-directive-at-end]

A `~` (shared rule 4) is a `~` unit and enters the generic context. There, `~`
is a `~` unit and leaves the context, and one or more other characters, line
feeds included, are a `generic-text` unit. [fixture:
class/lex-generic-multi-line]

A backquoted name and the text of a generic type may start with any character.
In its backquote and generic states, the lexer of mermaid.js tries the rules for
`"`, for `~` (in a backquote), for `<<` and `>>`, and for the keywords
`cssClass`, `callback`, `link`, `click`, `note`, and `href` before its rule for
the text
([`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L89-L112)).
Where the text starts with one of these, which for a keyword means that no word
character follows it, mermaid.js reads that unit instead of a name, and reads
the text only after it. These inputs are the known divergence
`name-start-reads-unit` (see [Known divergences](#known-divergences)). So
``class `note` ``, which writes the keyword `note` as a class name with
backquotes, declares the class `note` here, while mermaid.js rejects it;
`` class `"x` `` and `class A~note x~` are accepted here with the name `"x` and
the type `note x`. [fixture: class/div-backquote-keyword-escaped] [fixture:
class/div-backquote-starts-with-quote] [fixture:
class/div-backquote-starts-with-tilde] [fixture:
class/div-backquote-starts-with-keyword] [fixture:
class/div-generic-starts-with-quote] [fixture:
class/div-generic-starts-with-keyword] [fixture:
class/div-backquote-starts-with-double-less-than] [fixture:
class/div-backquote-starts-with-double-greater-than] [fixture:
class/div-generic-starts-with-double-less-than] [fixture:
class/div-generic-starts-with-double-greater-than] [fixture:
class/div-backquote-keyword-css-class] [fixture:
class/div-backquote-keyword-callback] [fixture:
class/div-backquote-keyword-link] [fixture: class/div-backquote-keyword-click]
[fixture: class/div-backquote-keyword-href] Elsewhere in the text, and with a
word character after the keyword, both read the same: `` class `notex` ``,
`` class `x note` ``, `class A~linkx~`, and `class A~ note~` are accepted by
both, and `` class A`~T~` `` gives A the type `T` in both. [fixture:
class/lex-backquote-keyword-prefix] [fixture: class/lex-backquote-keyword-later]
[fixture: class/lex-generic-keyword-prefix] [fixture:
class/lex-generic-space-before-keyword] [fixture:
class/lex-backquote-around-generic]

### The callback contexts

The callback name context is entered by `call`:

1. `(`, zero or more whitespace, and `)`: a `(` unit and a `)` unit; leaves the
   context. [fixture: class/lex-callback-blank-parentheses] [fixture:
   class/gram-click-call-empty-parentheses]
2. `(`: a `(` unit; leaves the context and enters the callback arguments
   context. [fixture: class/lex-callback-arguments-multi-line]
3. One or more characters other than `(`, line feeds included: a `callback-name`
   unit. [fixture: class/lex-callback-name-multi-line]

In the callback arguments context, `)` is a `)` unit and leaves the context, and
one or more other characters, line feeds included, are a `callback-arguments`
unit. A callback name and its arguments may therefore span lines. [fixture:
class/lex-callback-name-multi-line] [fixture:
class/lex-callback-arguments-multi-line]

### Accessibility values

In the title context and in the description context, the rest of the line, which
may be empty, is a `title-text` or `description-text` unit, and the context is
left; `#` and `;` are characters of it. In the description block context, `}` is
a `}` unit and leaves the context, and one or more other characters are a
`description-block-text` unit. [fixture: class/lex-acc-title-hash-semicolon]
[fixture: class/lex-acc-descr-hash-semicolon] [fixture:
class/gram-acc-descr-block-with-text] [fixture: class/lex-acc-title-next-line]

## Grammar

The grammar uses the notation of [common.md](../common.md#notation), over units
instead of characters. A unit name, such as `word`, stands for one unit with
that name, and text in double quotes stands for the unit named by that text,
such as `"class"` or `"{"`. `string` stands for a `string` unit that is not
empty, and `string-or-empty` for a `string` unit that may be empty.
`end-of-text` stands for the end of the text. The grammar is a restatement of
the grammar in
[`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L221-L438)
and accepts the same sequences of units.

Each rule below makes a node of the tree, defined in
[ast/class.md](../ast/class.md):

| Rule                                                 | Node                                                                           |
| ---------------------------------------------------- | ------------------------------------------------------------------------------ |
| `diagram`                                            | ClassDiagram                                                                   |
| `class-statement`                                    | ClassDeclaration                                                               |
| `member-statement` with a label                      | ClassMemberStatement                                                           |
| `member-statement` without a label                   | ClassNameStatement                                                             |
| `annotation-statement`                               | ClassAnnotationStatement                                                       |
| `relation-statement` with its label                  | ClassRelationStatement                                                         |
| `relation`                                           | ClassArrow                                                                     |
| `namespace-statement`                                | ClassNamespaceStatement                                                        |
| `note-statement`                                     | ClassNoteStatement                                                             |
| `click-statement` with `callback` or `call`          | ClassCallbackStatement                                                         |
| `click-statement` with `link` or `href`              | ClassLinkStatement                                                             |
| `style-statement`                                    | ClassStyleStatement                                                            |
| `css-class-statement`                                | ClassCssClassStatement                                                         |
| `class-def-statement`                                | ClassClassDefStatement                                                         |
| `direction-statement`                                | ClassDirectionStatement, with a ClassIgnoredText for each `direction-text`     |
| `accessibility-statement`, `empty-description-block` | ClassAccTitleStatement, ClassAccDescrStatement, or ClassAccDescrBlockStatement |
| `class-name`                                         | ClassName                                                                      |
| `annotation-line`, and `"<<" name-part ">>"`         | ClassAnnotation                                                                |
| `method-line`, `attribute-line`                      | ClassMethod, ClassAttribute; a `blank-member` makes no node                    |
| `string`, `string-or-empty`, `"backquoted"`          | StringLiteral                                                                  |
| a class name or a namespace name, listed below       | ClassIdentifier                                                                |
| a name, listed below                                 | Identifier                                                                     |
| a text without quotes, listed below                  | ClassLiteral                                                                   |
| `ignored-text`                                       | ClassIgnoredText                                                               |

The class names and namespace names are the name parts and `.` units of a class
name or a namespace name, before a backquoted name or without one. The names are
the name part after `:::` or between `<<` and `>>` of a statement, the `word`
after `style`, the `word` units of a `classDef` statement before its styles, and
the `word` of a `cssClass` statement. The texts without quotes are a
`generic-text`, the text of a `label` after its `:`, the `member-name`,
`parameters`, `return-type`, and `annotation-name` of a member line,
`callback-name` and `callback-arguments`, a `style-text`, and a `title-text`,
`description-text`, or `description-block-text`.

### Diagram and statements

```text
diagram    = "header" empty-description-block* newline statement ( statement-end statement )* empty-description-block* newline? end-of-text
statement  = relation-statement label?
           | member-statement
           | class-statement
           | annotation-statement
           | namespace-statement
           | note-statement
           | click-statement
           | style-statement
           | css-class-statement
           | class-def-statement
           | direction-statement
           | accessibility-statement
           | empty-description-block statement
```

Statements are separated by a `newline` unit, which may hold blank lines.
Nothing else separates them: `class A; class B` is rejected (see
[The statement context](#the-statement-context)). [fixture: class/lex-semicolon]
[fixture: class/gram-blank-lines]

### Empty description blocks before a separator

```text
statement-end           = empty-description-block* newline
empty-description-block = "accDescr" "{" "}"
```

An `empty-description-block` is an `accDescr` unit and a `{` unit followed
directly by a `}` unit, with no `description-block-text` unit. A statement that
needs a separator ends with a `statement-end`: after its last unit and before
its separator, any number of empty description blocks may come. Each is a
description block statement without text, a statement of its own after that
statement. mermaid.js reads no token for an empty description block (see
[tokenless-empty-forms](../known-divergences/tokenless-empty-forms.md)), so it
reads the statement as followed directly by its separator. A description block
with text and any other statement may not come before the separator.

In class, statements are separated by a line break, and the last statement may
end at the end of the text, where the blocks come before it too:
`empty-description-block* newline? end-of-text` in `diagram`. So the blocks may
come after a statement, except where the statement reads them otherwise:
`note for A "x" accDescr {}`, `note for A "x" accDescr {} accDescr {}`,
`A <|-- B accDescr {}`, `click A href "u" accDescr {}`, and
`cssClass "A" c accDescr {}` are accepted, also at the end of the text.
Whitespace before the block is no unit here. [fixture:
class/gram-empty-description-block-after-note] [fixture:
class/gram-empty-description-blocks-after-note] [fixture:
class/gram-empty-description-block-after-relation] [fixture:
class/gram-empty-description-block-after-click] [fixture:
class/gram-empty-description-block-after-css-class] [fixture:
class/gram-empty-description-block-after-statement-at-end] A class statement and
a member statement read them otherwise, as mermaid.js does: in
`class A accDescr {}`, `accDescr` is a name part of the class name and `{}` its
empty body, so the class is `AaccDescr`, and in `A : x accDescr {}`, the label
takes them into the member text. [fixture:
class/gram-description-block-words-after-class-name] [fixture:
class/gram-description-block-words-after-member] Another statement after the
block on the same line is rejected, as in mermaid.js:
`A <|-- B accDescr {} class C`. [fixture:
class/gram-empty-description-block-after-relation-then-statement] Where a
statement starts, a block is a statement that another statement follows on the
same line (see [Empty description blocks](#empty-description-blocks)).

The header needs a line break after it too, and empty description blocks may
come before that line break, as before a separator
(`"header" empty-description-block* newline` in `diagram`): each is the first
statement of the diagram. `classDiagram accDescr {}`, a line break, and
`class A` is accepted and read as the same without the block, and so is the same
with two blocks. `classDiagram accDescr {} class A` is rejected, as the same
without the block is, and so are `classDiagram accDescr {x}`, whose block has
text, and `classDiagram accDescr {}` alone, as `classDiagram` alone is, because
the grammar needs a statement after the line break of the header. mermaid.js
reads these the same way. [fixture: class/header-empty-description-block]
[fixture: class/header-empty-description-blocks] [fixture:
class/header-empty-description-block-then-statement] [fixture:
class/header-description-block-with-text] [fixture:
class/header-empty-description-block-only]

### Class names

```text
class-name     = ( name-part "."? )* ( name-part | "backquoted" ) generic?
name-part      = word | "-" | letter
generic        = "~" generic-text? "~"
namespace-name = ( name-part "."? )* ( name-part | "backquoted" )
```

A class name is made of name parts, with whitespace or a `.` between them, and
may end with a backquoted name and a generic type. The whitespace between the
parts is not part of the name: `class Foo Bar` declares the class `FooBar`, and
`A - B --> C` has a relation from `A-B`. [fixture: class/gram-name-spaces]
[fixture: class/gram-name-dash-spaces] A `.` is part of the name, also with
whitespace around it, and cannot start or end it: `class A . B` declares `A.B`,
and `class A.` and `class .A` are rejected. [fixture:
class/gram-name-dot-spaces] [fixture: class/gram-name-dot-end] [fixture:
class/gram-name-dot-start] A generic type ends the name: `class A~T~ B` is
rejected. [fixture: class/gram-name-after-generic] A word may start with a
digit: `class 12ab` declares `12ab`. [fixture: class/gram-name-digits] So a
class name, and a namespace name too, has one of three forms, each of which a
class name may end with a generic type: name parts; a backquoted name; and name
parts followed by a backquoted name, as in ``class A.`b c` ``, which declares
`A.b c`, and ``class A`b c` ``, which declares `Ab c`
([`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L244-L258)).
A backquoted name ends the name: ``class `b c`A `` and a name of two backquoted
names are rejected. [fixture: class/gram-name-prefix-backquoted] [fixture:
class/gram-name-word-then-backquoted] [fixture:
class/gram-name-backquoted-then-word] [fixture: class/gram-name-two-backquoted]

### Class statements

```text
class-statement = "class" class-name class-label? class-tail?
class-label     = "[" string "]"
class-tail      = member-body
                | ":::" name-part ( "{" member-line+ "}" )?
                | "<<" name-part ">>" member-body?
member-body     = "{" member-line* "}"
member-line     = annotation-line | method-line | attribute-line | "blank-member"
```

The label is a string that is not empty. A class statement has at most one of a
CSS class (`:::`) and an annotation, each one name part: `class A <<x>> <<y>>`,
`class A <<x>>:::c`, `class A:::my-class`, and `class A <<abstract class>>` are
rejected. [fixture: class/gram-class-label-empty] [fixture:
class/gram-class-two-annotations] [fixture:
class/gram-class-annotation-then-css-class] [fixture:
class/gram-class-css-class-dash] [fixture:
class/gram-class-annotation-two-words] After `:::`, a member body needs at least
one member line, and a line of only whitespace counts: `class A:::c {}` is
rejected, and `class A:::c { }` is accepted. [fixture:
class/gram-class-css-class-empty-body] [fixture:
class/gram-class-css-class-blank-body] [fixture:
class/spec-class-diagram-b5349b23] [fixture: class/db-member-name-space]

### Members and annotations

```text
member-statement     = class-name label?
annotation-statement = "<<" name-part ">>" class-name
annotation-line      = "<<" annotation-name? ">>"
method-line          = ignored-text? visibility? member-name? "(" parameters? ")" classifier? return-type? classifier? ignored-text?
attribute-line       = visibility? member-name? classifier?
```

In a member statement with a label, the text of the label after its `:` is a
member line, divided as described under [Member lines](#member-lines); when it
is all whitespace, as in `A : `, it is a blank member line, which makes no node.
Without a label, a member statement is a class name alone: a line `Foo`. Class
diagrams have no title statement, and `title Animals` is such a line, the class
name `titleAnimals`. [fixture: class/gram-member-statement] [fixture:
class/db-member-statement-blank] [fixture: class/gram-name-alone] [fixture:
class/gram-title-not-statement] A class name alone may share its line with a
directive or an empty description block before or after it:
`%%{init: {}}%% Foo`, `accDescr {} Foo`, and `Foo accDescr {}` are class names
alone. [fixture: class/gram-directive-then-name-alone] [fixture:
class/gram-empty-description-block-then-name-alone] [fixture:
class/gram-name-alone-then-empty-description-block] A method line has at most
one `classifier` unit.

### Relations

```text
relation-statement = class-name string-or-empty? relation string-or-empty? class-name
relation           = relation-end? line relation-end?
relation-end       = "<|" | "|>" | "<" | ">" | "*" | "o" | "()"
line               = "--" | ".."
```

The strings before and after the relation are the cardinalities of its two ends,
and may be empty. The units of a relation may have whitespace between them:
`A <|  --  * B` has the line `--` with `<|` and `*` at its ends. [fixture:
class/gram-relation-spaces] [fixture: class/gram-cardinality-empty] `A --> B :`,
with nothing after the `:`, is rejected, because a label needs a character after
its `:`. [fixture: class/gram-relation-colon-only]

### Namespaces

```text
namespace-statement = "namespace" namespace-name class-label? "{" newline? namespace-item ( newline namespace-item )* newline? "}"
namespace-item      = class-statement | note-statement | namespace-statement
```

A namespace holds class statements, notes, and namespaces, and at least one of
them: `namespace A {` with `}` on the next line, and a relation in a namespace,
are rejected. [fixture: class/gram-namespace-empty] [fixture:
class/gram-namespace-relation] [fixture: class/gram-namespace-note] [fixture:
class/db-namespace-redeclared-label] [fixture:
class/lex-namespace-two-closing-braces]

### Other statements

```text
note-statement          = "note" "for" class-name string | "note" string
click-statement         = "callback" class-name string string-or-empty?
                        | "link" class-name string string-or-empty? "link-target"?
                        | "click" class-name "call" callback-name "(" callback-arguments? ")" string-or-empty?
                        | "click" class-name "href" string string-or-empty? "link-target"?
style-statement         = "style" word styles
class-def-statement     = "classDef" word ( "," word )* styles
css-class-statement     = "cssClass" string word
styles                  = style-text ( "," style-text )*
style-text              = ( word | ":" | "#" | "%" | "style" | label )+
direction-statement     = "direction-text"? "direction" "direction-value" "direction-text"?
accessibility-statement = "accTitle" ":" title-text
                        | "accDescr" ":" description-text
                        | "accDescr" "{" description-block-text "}"
```

The text of a note, the URL of a link, the function name of `callback`, and the
ids of `cssClass` are strings that are not empty; the second string of a click
statement, its tooltip, may be empty. [fixture: class/gram-note-empty] [fixture:
class/gram-link-url-empty] [fixture: class/gram-callback-name-empty] [fixture:
class/gram-css-class-ids-empty] [fixture: class/gram-link-target] [fixture:
class/gram-click-call-tooltip] [fixture: class/gram-class-def-names] [fixture:
class/gram-link-tooltip-empty] [fixture: class/db-click-href] [fixture:
class/docs-syntax-class-diagram-500154a2] [fixture:
class/tokens-style-comma-unit] `call` needs parentheses after the function name:
`click A call fn` is rejected. [fixture: class/lex-callback-name-unclosed]

The id after `style` and the names after `classDef` are each one word:
`style A-B fill:red` is rejected. A style is made of words, `:`, `#`, `%`, the
keyword `style`, and labels; a `-` outside a label is not part of it, so
`style A stroke-width:2px` is rejected, while
`style A fill:#f00,stroke-width:2px` is accepted, because the `-` lies in the
label `:#f00,stroke-width`. [fixture: class/gram-style-id-dash] [fixture:
class/gram-style-dash-outside-label] [fixture: class/gram-style-dash-in-label]

### Empty description blocks

An `accDescr` unit and a `{` unit followed directly by a `}` unit, with no
`description-block-text` unit, are an **empty description block**. Where a
statement starts, it is a description block statement without text, and another
statement must follow it on the same line: `accDescr {} class A` declares A,
while `accDescr {}` on a line of its own is rejected, as in mermaid.js, which
reads no token for the block and then two `newline` units. In flowchart and
sequence, an empty description block on a line of its own is accepted. [fixture:
class/gram-empty-description-block-then-statement] [fixture:
class/gram-empty-description-block-alone]

### Rejections outside the grammar

mermaid.js rejects these inputs after its grammar has accepted them, and so does
this specification:

- An annotation statement for a class that does not exist: `<<interface>> A`
  before any statement that adds A is rejected
  ([`addAnnotation`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/classDb.ts#L263-L266)),
  while the same after `class A` is accepted. A class is **added** by a class
  statement, a member statement with a label, and a relation statement, for each
  of its class names, also in the body of a namespace; the name on the `()` side
  of a relation whose only end is `()` names an interface and adds no class. A
  statement of a class name alone, a note, a click, a `cssClass`, and a style
  statement add none. An annotation statement names, and a statement adds, the
  class with the **id** of its class name. The **name text** of a class name is
  the text of its units before the generic type, joined, with the backquotes of
  a backquoted name left out; the whitespace between the units is not part of
  it. When a backquoted name is not closed, its text runs to the end of the
  text, and the name text ends with a line feed, the one that the lexer reads
  after the last character. The **written name** is the name text, followed by
  `~`, the value of the generic of the class name, whitespace included, and `~`,
  when the class name has one (see [ClassName](../ast/class.md#classname)). Its
  id is the text before its first `~`, when it has a `~` and its first `~` is
  not its first character, and otherwise the written name. So `class A~T~` and
  ``class `A~T` `` add the class `A`, which `<<interface>> A` and
  `<<interface>> A~T~` name, while ``class `~A` `` adds the class `~A`, which
  `` <<interface>> `~A` `` names and `<<interface>> A` does not (mermaid.js
  rejects a backquoted name that starts with `~`, see
  [`name-start-reads-unit`](../known-divergences/name-start-reads-unit.md)), and
  `class A~T~` adds no class `T`. [fixture:
  class/db-annotation-after-generic-class] [fixture:
  class/db-annotation-generic-after-generic-class] [fixture:
  class/db-annotation-generic-after-class] [fixture:
  class/db-annotation-after-backquoted-tilde-class] [fixture:
  class/div-annotation-after-backquoted-leading-tilde-class] [fixture:
  class/div-annotation-backquoted-leading-tilde-class] [fixture:
  class/gram-annotation-for-generic-type] [fixture:
  class/db-backquoted-name-unclosed] [fixture:
  class/db-annotation-statement-undefined-class] [fixture:
  class/spec-class-diagram-280c04be] [fixture:
  class/db-annotation-after-member-statement] [fixture:
  class/db-annotation-after-relation] [fixture:
  class/db-annotation-after-lollipop-class] [fixture:
  class/db-annotation-after-namespace-class] [fixture:
  class/gram-annotation-after-lollipop-interface] [fixture:
  class/gram-annotation-after-note-for] [fixture:
  class/gram-annotation-after-style] [fixture:
  class/gram-annotation-after-name-statement] [fixture:
  class/gram-annotation-after-css-class] [fixture:
  class/gram-annotation-after-click]
- A method line that cannot be divided, such as `x)` (see
  [Member lines](#member-lines)). [fixture:
  class/lex-member-method-without-opening]

## Known divergences

These divergences of [known-divergences.md](../known-divergences.md) apply to
class diagrams, and show in them as follows.

- **[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.md).**
  A directive inside a unit other than a text unit and a string unit, such as a
  keyword, a name without whitespace, a delimiter, or an arrow, makes the input
  rejected here, while mermaid.js accepts it: `cla%%{init: {}}%%ss A`,
  `A -%%{init: {}}%%-> B`, and `class A:%%{init: {}}%%::c` (see
  [Directives inside units](#directives-inside-units)). [fixture:
  class/div-directive-in-keyword] [fixture: class/div-directive-in-line]
  [fixture: class/div-directive-in-triple-colon]
- **[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.md).**
  After a cardinality `"style:#x"`, the line matches the `style` rule, and the
  ignored `;` inside the line or the end of a relation makes the input rejected
  here, while mermaid.js accepts it: `A "style:#x" -;-> B` and
  `A "style:#x" <;|-- B`. [fixture:
  class/div-ignored-semicolon-in-relation-line] [fixture:
  class/div-ignored-semicolon-in-relation-end]
- **[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.md).**
  With `title: <a` in the frontmatter, `A : b="c">d` adds the member `b='c'>d`
  in mermaid.js, whose tag reaches the `>` after `"c"`, and `b="c">d` here.
  Where a `>` lies between, as in the arrow of `A --> B : b="c">d`, that `>`
  ends the tag in mermaid.js, and both give the label `b="c">d`. [fixture:
  class/div-html-tag-starts-in-frontmatter-member] [fixture:
  class/lex-html-tag-frontmatter-arrow-ends-tag]
- **[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.md).**
  An empty string where the grammar takes no string or only one that is not
  empty, an empty backquoted name, an empty generic type that does not end a
  class name, an empty call, and an empty description block inside a statement,
  neither where a statement starts nor before the line break of a statement or
  of the header, make the input rejected here, while mermaid.js reads no token
  for them and accepts the input: `"" A --> B`, `class A""B`, `class A``B`,
  `class A~~B`, `A call () --> B`, and `A accDescr {} --> B`. An empty string as
  a cardinality or a tooltip is accepted by both, and so is an empty generic
  type at the end of a class name: `class A~~` declares A without a type.
  [fixture: class/div-empty-string-statement-start] [fixture:
  class/div-empty-string-in-name] [fixture: class/div-empty-backquoted-in-name]
  [fixture: class/div-empty-generic-in-name] [fixture: class/div-empty-call]
  [fixture: class/div-empty-description-block-in-statement] [fixture:
  class/gram-cardinality-empty] [fixture: class/gram-link-tooltip-empty]
  [fixture: class/gram-generic-empty-at-end]
- **[`comment-takes-line-break`](../known-divergences/comment-takes-line-break.md).**
  A diagram comment after a unit on its line ends at the end of its line in this
  specification, and the line feed after it is a `newline` unit, while
  mermaid.js takes the line feeds after the comment into it and reads the next
  line as part of the same statement. So `classDiagram %% c` followed by a
  statement, and `A --> B %% c` followed by a line `class C`, are rejected by
  mermaid.js and accepted by this specification. `A --> B %% c` followed by a
  line `A : +int age` is one statement with a relation from A to `BA` in
  mermaid.js, and a relation and a member in this specification, and
  `A --> %% c` followed by a line `B`, which mermaid.js reads as a relation from
  A to B, is rejected by this specification. A line of only whitespace stops
  mermaid.js from taking the line feeds, so with one after the comment, both
  read the two statements, unless a comment line with text after its `%%` comes
  right after that line: mermaid.js removes such a comment line together with
  the lines of only whitespace right before it before it reads the text
  ([`cleanupComments`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/comments.ts#L6-L8)),
  and then joins the next line again. `A --> B %% c`, a line of spaces, `%% x`,
  and `A : +int age` is a relation from A to `BA` in mermaid.js, while with a
  line `%%` in place of `%% x`, or with another line of spaces after `%% x`,
  both read the two statements. [fixture:
  class/div-comment-then-spaces-line-then-comment-line] [fixture:
  class/div-comment-then-two-spaces-lines-then-comment-line] [fixture:
  class/lex-comment-then-spaces-line-then-bare-comment] [fixture:
  class/lex-comment-line-then-spaces-line] So it is with a line of a tab or of a
  U+2028, also with CRLF line breaks, and with a directive line in place of
  `%% x`, which is no comment line. [fixture: class/lex-comment-then-tab-line]
  [fixture: class/lex-comment-then-line-separator-line] [fixture:
  class/lex-comment-then-spaces-line-crlf] [fixture:
  class/lex-comment-then-spaces-line-then-directive-line] A comment-only line is
  not counted as a line in either (see
  [The statement context](#the-statement-context)). [fixture:
  class/div-comment-on-header-line] [fixture: class/div-comment-joins-lines]
  [fixture: class/div-comment-before-statement-line] [fixture:
  class/div-comment-in-relation] [fixture: class/lex-comment-blank-line-after]
- **[`headerless-empty-ending`](../known-divergences/headerless-empty-ending.md).**
  A text whose first word is `classDiagram` followed by an ASCII word character,
  such as `classDiagramX`, has no header and is rejected here. mermaid.js
  accepts it when the text ends with an empty title, description, or description
  block, `click A call`, or a string opened at the end of a `callback`, `link`,
  or `click` statement, as in `classDiagramX` followed by a line `accTitle:`.
  [fixture: class/div-headerless-empty-title] [fixture:
  class/div-headerless-empty-call] [fixture: class/div-headerless-empty-string]
  [fixture: class/div-headerless-repeated-header] [fixture:
  class/div-headerless-empty-description-block] [fixture:
  class/div-headerless-link-string-opened] [fixture:
  class/div-headerless-click-string-opened]
- **[`name-start-reads-unit`](../known-divergences/name-start-reads-unit.md).**
  A backquoted name or the text of a generic type that starts with `"`, with `~`
  (in a backquote), with `<<` or `>>`, or with one of the keywords `cssClass`,
  `callback`, `link`, `click`, `note`, and `href` is a name or a type here,
  while mermaid.js reads that unit instead (see
  [Strings, backquoted names, and generic types](#strings-backquoted-names-and-generic-types)).
  ``class `note` `` declares the class `note` here and is rejected by
  mermaid.js; ``A `"1"` --> B`` has a relation from `A"1"` here and the
  cardinality `1` in mermaid.js. [fixture: class/div-backquote-keyword-escaped]
  [fixture: class/div-backquote-around-string] [fixture:
  class/div-backquote-starts-with-double-less-than] [fixture:
  class/div-backquote-starts-with-double-greater-than] [fixture:
  class/div-generic-starts-with-double-less-than] [fixture:
  class/div-generic-starts-with-double-greater-than] [fixture:
  class/div-backquote-keyword-css-class] [fixture:
  class/div-backquote-keyword-callback] [fixture:
  class/div-backquote-keyword-link] [fixture: class/div-backquote-keyword-click]
  [fixture: class/div-backquote-keyword-href]
- **[`c4-keyword-anywhere`](../known-divergences/c4-keyword-anywhere.md).**
  `C4Container`, `C4Component`, `C4Dynamic`, or `C4Deployment` anywhere after
  the header, as a class name, a member, or a label, makes mermaid.js hand the
  text to the C4 parser, which rejects it; here the text is a class diagram.
  [fixture: class/div-c4-keyword-as-class-name]
- **[`bare-percent-line-before-header`](../known-divergences/bare-percent-line-before-header.md).**
  A line of whitespace only, not empty, between a bare `%%` line and the header
  is trivia here, while mermaid.js rejects the input: its class lexer reads the
  line as a `newline` unit that its grammar does not take before the header (see
  [Detection](#detection)). A line of whitespace only right before a comment
  line lies in the comment region and is trivia in both, and so is a directive
  on a line of its own; a line that is whitespace only once its directives are
  left out counts as a line of whitespace only. [fixture:
  class/header-after-bare-percent-then-whitespace-line] [fixture:
  class/header-after-empty-braces-then-whitespace-line] [fixture:
  class/header-after-bare-percent-then-indented-directive-line] [fixture:
  class/header-after-bare-percent-then-directive-line] [fixture:
  class/header-after-bare-percent-then-whitespace-line-then-comment-line]
