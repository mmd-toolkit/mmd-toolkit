# Class

Japanese version: [class.ja.md](./class.ja.md)

Source of truth in mermaid.js:

- [`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison)
- [`classDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/classDb.ts)
- [`classTypes.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/classTypes.ts)
- the tests (`*.spec.ts`) in
  [`class/`](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class)

This document covers the diagram type `classDiagram`. The nodes and tokens of
the tree are defined in [ast/class.md](../ast/class.md).

## Detection

Entry 9 of [detection.md](../detection.md) selects this grammar: the text starts
with `classDiagram`, after whitespace, in exactly this case. [fixture:
common/detect-minimal-class-diagram] [fixture:
common/detect-case-sensitive-class]

Detection only looks at the start of the text. The grammar then reads the header
keyword again, `classDiagram-v2` or `classDiagram`, not followed by a word
character (see [The statement context](#the-statement-context)), and then a
`newline` unit. So `classDiagram-v2` is a header of the same diagram, while
`classDiagramX`, `classDiagram-v3`, and `classDiagram class A` are detected as
class diagrams and rejected. The header alone is rejected too, because the
grammar needs at least one statement. [fixture: class/header-v2] [fixture:
class/header-word-after-keyword] [fixture: class/header-other-suffix] [fixture:
class/header-statement-same-line] [fixture: class/header-only]

Detection leaves out more than the lexer does (see
[Diagram detection](../common.md#diagram-detection)): a line that holds only
`%%`, or `%%{ }%%`, which is no directive, may come before the header, and the
text is still detected as a class diagram. Such a line is a comment-only line,
which is not counted as a line (rule 2 of
[The statement context](#the-statement-context)). The comment is in
`Root.comments`, and the ClassDiagram starts at the header. Between statements,
such a line is accepted in the same way, while a line of only whitespace after
it is a `newline` unit of its own, and the input is rejected, as in mermaid.js.
[fixture: class/lex-bare-percent-line-between-statements] [fixture:
class/lex-bare-percent-line-then-blank-line] [fixture:
class/lex-bare-percent-line-then-spaces-line] Detection fails for a text before
the header that it does not leave out, such as a line `#`. [fixture:
class/header-after-bare-percent-line] [fixture:
class/header-after-empty-braces-line] [fixture: class/header-after-hash-line]

## Lexical structure

The lexer reads the [diagram text](../common.md#reading-a-source) in
[converted form](../common.md#reading-a-source): each line terminator as `\n`,
each attribute quote as `'`, each entity as its placeholder, and through comment
regions and the `;` that the line rule ignores as if they were not there. The
`\n` that the lexer reads after the last character
([End of text](../common.md#end-of-text)) is part of the diagram text. This
section describes the diagram's own token rules, item 4 of
[Reading a source](../common.md#reading-a-source).

The lexer of mermaid.js for this diagram compares letters as they are written:
`Class A` is no class statement but the name `ClassA` alone, which declares
nothing, and `Note "x"` is rejected. [fixture: class/lex-keyword-upper-case]
[fixture: class/lex-note-upper-case] A **keyword** below is a word that is not
followed by a word character (see [Notation](../common.md#notation)):
`class classA` declares the class `classA`, while in `class-A` the lexer reads
the keyword `class` and then the name `-A`, because `-` is no word character.
[fixture: class/lex-keyword-prefix-of-name] [fixture:
class/lex-keyword-before-dash]

### Units and contexts

The lexer divides the diagram text into **units**. The grammar is written over
units, and the tokens of the tree are made from them (see
[ast/class.md](../ast/class.md#tokens)). Each unit has a name, which the grammar
uses, and a **text**: the characters it read, in converted form.

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
[fixture: class/lex-acc-descr-block-unclosed] The title context is entered after
the whitespace that follows `accTitle:`, line feeds included, so `accTitle:`
with only whitespace after it is rejected at the end of the text.

### Directives inside units

The lexer reads the diagram text, which has no directives, as mermaid.js reads
its text once it has removed them. The rule of
[A directive is a token boundary](../common.md#a-directive-is-a-token-boundary)
then applies to the units and to the tokens made from them
([ast/class.md](../ast/class.md#tokens)): a directive inside a unit of kind
`RawText` or `Identifier` cuts its token, and the input keeps the reading of
mermaid.js, while a directive inside a unit of another kind makes the input
rejected.

- `class Fo%%{init: {}}%%o` declares `Foo`, `A : +fo%%{init: {}}%%o()` adds the
  method `foo`, and `A --> B : x%%{init: {}}%%y` has the label `xy`, as in
  mermaid.js. [fixture: class/lex-directive-in-name] [fixture:
  class/lex-directive-in-member] [fixture: class/lex-directive-in-label]
- A directive between two units is allowed whatever their kind:
  `A <|%%{init: {}}%%-- B` is an extension. [fixture:
  class/lex-directive-between-relation-end-and-line]
- In `cla%%{init: {}}%%ss A`, `A -%%{init: {}}%%-> B`,
  `note "a%%{init: {}}%%b"`, and `class A:%%{init: {}}%%::c`, the directive lies
  inside a keyword, a line, a string, or `:::`, and the input is rejected, while
  mermaid.js accepts it (see [Known divergences](#known-divergences)). [fixture:
  class/div-directive-in-keyword] [fixture: class/div-directive-in-line]
  [fixture: class/div-directive-in-string] [fixture:
  class/div-directive-in-triple-colon]

### The statement context

In the statement context, the lexer tries these rules in order:

1. A **direction line** (see below).
2. `%%` and the rest of its line, up to the line feed: a diagram comment. Its
   mark is `%%`, and its value is the text after the mark (see
   [Comment](../ast.md#comment)). Most lines with only whitespace before `%%`
   are comment lines of [common.md](../common.md#comment-lines), removed before
   the lexer reads the text, so this rule applies to a `%%` after a unit, and to
   a line that is no comment line because nothing or `{` follows its `%%`. A
   line that holds only whitespace and such a comment is a **comment-only
   line**. A comment-only line is not counted as a line, and neither are the
   empty lines right after it: no `newline` unit is read for their line feeds,
   which belong to no unit. A line of only whitespace after it counts as a line.
   A comment after a unit ends at the end of its line, and the line feed after
   it is a `newline` unit (see [Known divergences](#known-divergences)).
3. `accTitle`, zero or more whitespace, `:`, and zero or more whitespace: an
   `accTitle` unit and a `:` unit; enters the title context.
4. `accDescr`, zero or more whitespace, `:`, and zero or more whitespace: an
   `accDescr` unit and a `:` unit; enters the description context.
5. `accDescr`, zero or more whitespace, `{`, and zero or more whitespace: an
   `accDescr` unit and a `{` unit; enters the description block context.
6. Zero or more whitespace followed by one or more line feeds, as many as
   possible, so that the last character read is a line feed: a `newline` unit.
   Blank lines and lines of only whitespace are part of it.
7. One or more other whitespace characters: nothing.
8. The keywords `classDiagram-v2` and `classDiagram`: a `header` unit.
9. `[*]`: a `[*]` unit.
10. `call` and one or more whitespace: a `call` unit; enters the callback name
    context.
11. `"`: a string (see
    [Strings, backquoted names, and generic types](#strings-backquoted-names-and-generic-types)).
12. The keywords `style` and `classDef`: a unit named by the keyword.
13. The keyword `namespace`: a `namespace` unit; enters the namespace context.
14. The keyword `class`: a `class` unit; enters the class context.
15. The shared rules. In the statement context, `:`, `,`, and `#` that no shared
    rule before the punctuation rule reads are a unit named by their text.

The units `[*]`, `=`, `+`, and `punctuation` are taken by no rule of the
grammar, so an input that has one is rejected. Some consequences of the order:

- A keyword is a keyword wherever a unit starts. `class note`, `class link`,
  `class o`, and `class _self` are rejected, and so is a relation to `note`,
  while `class noteX` and `class order` declare `noteX` and `order`. [fixture:
  class/lex-keyword-note-as-name] [fixture: class/lex-keyword-link-as-name]
  [fixture: class/lex-keyword-o-as-name] [fixture:
  class/lex-keyword-link-target-as-name] [fixture:
  class/lex-keyword-prefix-of-note] [fixture: class/lex-keyword-o-prefix]
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
line feeds, U+2028, or U+2029; then `direction`; then one or more whitespace
characters, line feeds included; then one of `TB`, `BT`, `RL`, and `LR`; and
then every character up to the next line feed, which is not included. The rule
reads the characters before `direction` as a `direction-text` unit, `direction`
as a `direction` unit, the value as a `direction-value` unit, and the characters
after the value as another `direction-text` unit; a `direction-text` unit that
would be empty or all whitespace is left out. mermaid.js does not read the
`direction-text` units. The values are tried in the order given: if the line has
`direction` followed by `TB` anywhere, the value is `TB`; otherwise `BT` is
tried, and so on. For a value, the lexer takes the last `direction` of the run
that it follows, and the unit ends at the end of the line on which the value
stands. This is the direction line of flowchart (see
[The statement context](./flowchart.md#the-statement-context) there) without the
value `TD`. Here it is the first rule, so it is tried at the start of every line
in the statement context and takes the whole line:

- `class A direction LR` is a direction line and declares no class, and
  `A --> B : set direction LR now` is one too and has no relation. [fixture:
  class/lex-direction-line-class-statement] [fixture:
  class/lex-direction-line-in-label]
- Quotes do not keep the rule out: `note "x direction TB"` and a link whose URL
  contains `direction TB` are direction lines. [fixture:
  class/lex-direction-line-in-note] [fixture: class/lex-direction-line-in-url]
- It also takes the header line: `classDiagram direction LR` has no header and
  is rejected. [fixture: class/header-direction-line]
- `direction LR direction TB` has the value `TB`, `direction TBX` the value `TB`
  and the text `X` after it, and `direction`, a line break, and `LR` the value
  `LR`. `direction lr` is no direction line but the name `directionlr`, which
  declares nothing. [fixture: class/lex-direction-line-two-values] [fixture:
  class/lex-direction-line-value-then-text] [fixture:
  class/lex-direction-line-value-next-line] [fixture:
  class/lex-direction-lower-case]
- The rule is not tried in the other contexts: in a namespace body,
  `direction LR` is rejected, and in a member body it is a member. [fixture:
  class/lex-direction-in-namespace] [fixture:
  class/lex-direction-in-member-body]

### The shared rules

1. The keywords `cssClass`, `callback`, `link`, `click`, `note for`, with one
   space between the two words, and `note`: a unit named by the keyword.
2. `<<` and `>>`: a unit named by its text.
3. The keyword `href`: an `href` unit.
4. `~`: a `~` unit; enters the generic context.
5. `` ` ``: a backquoted name (see
   [Strings, backquoted names, and generic types](#strings-backquoted-names-and-generic-types)).
6. The keywords `_self`, `_blank`, `_parent`, and `_top`: a `link-target` unit.
7. A **relation end**: `<|`, `|>`, `>`, `<`, `*`, `o` not followed by a word
   character, or `()`. A unit named by its text.
8. A **line**: `--` or `..`. A unit named by its text.
9. `:` and one or more characters other than `:`, `;`, and line feed, as many as
   possible: a `label` unit.
10. `:::`: a `:::` unit.
11. `-`, `.`, `+`, `%`, and `=`: a unit named by its text.
12. One or more ASCII letters, ASCII digits, and `_`: a `word` unit.
13. `[` and `]`: a unit named by its text.
14. One of `!`, `$`, `&`, `'`, `?`, `\`, and `/`, and, outside the statement
    context, `,` and `#`: a `punctuation` unit.
15. A Unicode letter, as in flowchart (see
    [Unicode letters](./flowchart.md#unicode-letters)): a `letter` unit of one
    character.

`note for` needs exactly one space: `note  for A "x"`, with two, and the same
with a tab, are rejected. [fixture: class/lex-note-for-two-spaces] [fixture:
class/lex-note-for-tab]

### The class context

The class context is entered by `class`. It reads the rest of the line:

1. `"`: a string.
2. Zero or more whitespace followed by one or more line feeds, as in rule 6 of
   the statement context: a `newline` unit; leaves the class context.
3. One or more other whitespace characters: nothing.
4. `}`: a `}` unit; leaves the class context and the context below it.
5. `{`: a `{` unit; enters the member context.
6. The shared rules.

The statement context's own rules do not apply here: `class A %% c` and
`class A : x` are rejected. [fixture: class/lex-class-comment] [fixture:
class/lex-class-label] `}` leaves two contexts, so in a namespace body,
`class C }` ends the namespace. [fixture: class/lex-class-closes-namespace]

### The member context

The member context is entered by `{` in the class context. It reads the body of
a class line by line:

1. `"` right after the `{` or after a line feed: a string.
2. `}`: a `}` unit; leaves the member context.
3. `[*]`: a `[*]` unit.
4. `{`: a `{` unit.
5. A line feed: nothing.
6. One or more characters other than `{`, `}`, and line feed: a **member line**,
   divided into units as described under [Member lines](#member-lines).

So a member line ends at a line feed, `{`, or `}`: `class A { +x }` has the
member `+x`, and `class A {+x`, a line break, and `+y}` the members `+x` and
`+y`. [fixture: class/lex-member-body-one-line] [fixture:
class/lex-member-body-close-on-member-line] A `"` starts a string only where a
member starts, and the grammar does not take a string there: a member line `"x"`
is rejected, and `+foo "bar"` is a member with the quotes in it. [fixture:
class/lex-member-quote-at-start] [fixture: class/lex-member-quote-inside] `%%`,
`;`, `[*]`, and `~` inside a member line are characters of it: `+x %% c` is the
member `x %% c`. [fixture: class/lex-member-percent] [fixture:
class/lex-member-semicolon] A member line of only `[*]` and a `{` in a body are
rejected. [fixture: class/lex-member-edge-state] [fixture:
class/lex-member-open-brace]

### Member lines

mermaid.js reads a member line as one text and divides it into its parts when it
adds the member to the Db
([`addMember`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/classDb.ts#L277-L297),
[`ClassMember`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/classTypes.ts#L80-L134)).
The division depends on the text alone, so the lexer makes it, and each part is
a unit. The whitespace at the ends of the line belongs to no unit; a line of
only whitespace makes a `blank-member` unit, which no token holds. The rest, the
**member text**, is divided by the first of these that applies:

1. The member text starts with `<<` and ends with `>>`: an **annotation line**.
   `<<` and `>>` are units named by their text, and the text between them, when
   it is not empty, is an `annotation-name` unit, whitespace included.
2. The member text has a `)`, and its first `)` is not its first character: a
   **method line**. `)x()` and `)+login()` are attribute lines, whose name is
   the whole text, and `x)y()` is a method line. [fixture:
   class/lex-member-parenthesis-first-attribute] [fixture:
   class/lex-member-parenthesis-first-visibility] [fixture:
   class/lex-member-parenthesis-later-method]
3. Otherwise, an **attribute line**.

A **visibility mark** is one of `+`, `-`, `#`, and `~` at the start of a method
or attribute line; a **classifier mark** is `$` or `*`.

An attribute line is divided into a `visibility` unit for a visibility mark at
its start, a `classifier` unit for a classifier mark at its end, and a
`member-name` unit for the text between them, without the whitespace at its
ends, when that is not empty.

A method line is divided as follows. First the visibility mark, if the line
starts with one, is set apart, and the rest is divided; when the rest cannot be
divided, the visibility mark is not set apart, and the whole member text is
divided. A text is divided at its **opening parenthesis**, the last `(` that is
not the first character and that has a `)` somewhere after it, and at its
**closing parenthesis**, the last `)`. When the text has no opening parenthesis,
it cannot be divided. The units are, in order:

1. a `visibility` unit for the visibility mark that was set apart;
2. a `member-name` unit for the text before the opening parenthesis, without the
   whitespace at its ends, when that is not empty;
3. a `(` unit, a `parameters` unit for the text between the two parentheses,
   without the whitespace at its ends, when that is not empty, and a `)` unit;
4. a `classifier` unit for the character right after the closing parenthesis
   when it is a classifier mark;
5. a `return-type` unit for the rest, without the whitespace at its ends, when
   that is not empty; when it ends with a classifier mark and item 4 found none,
   that mark is a `classifier` unit and the `return-type` unit ends before it,
   without the whitespace before the mark.

mermaid.js divides a method line with a pattern whose characters do not match
U+2028 and U+2029, and reads one part of the line. When a method line has either
character, the parts of its member text between them are its **segments**, and
the division above is applied to the first segment that can be divided, instead
of to the whole member text. A segment is divided as it is written, with the
whitespace at its start: a visibility mark is set apart only when it is the
first character of the segment, and a `(` after that whitespace is not the first
character. `x`, U+2028, and `+b(c)` is the method `b` with the visibility `+`,
while `x`, U+2028, and ` +b(c)` is the method `+b` without visibility, and `x`,
U+2028, and ` (c)` is a method without a name. [fixture:
class/lex-member-method-segment-visibility-first] [fixture:
class/lex-member-method-segment-space-before-visibility] [fixture:
class/lex-member-method-segment-space-only-name] The return type then runs to
the end of that segment, or, when the closing parenthesis is the last character
of the segment, to the end of the next segment. The text before the segment and
the text after the return type, each without the whitespace at its ends, are
`ignored-text` units, which mermaid.js does not read: `+a`, U+2028, and
`b(c) int` is the method `b` without visibility, with the ignored text `+a`
before it, and `+b(c) in`, U+2028, and `t` has the return type `in` and the
ignored text `t` after it. [fixture:
class/lex-member-method-line-separator-before] [fixture:
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
the input is rejected: `x)` and `(a)` are rejected, as in mermaid.js, whose Db
throws an error for them (see
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

1. `"`: a string.
2. The keyword `namespace`: a `namespace` unit; enters the namespace context.
3. Zero or more whitespace followed by one or more line feeds: a `newline` unit;
   leaves the namespace context.
4. One or more other whitespace characters: nothing.
5. `{`: a `{` unit; enters the namespace body context.
6. `}`: leaves the namespace context without reading the `}`, which the context
   below reads.
7. The shared rules.

The `{` must be on the line of the name: `namespace A`, a line break, and `{` is
rejected. [fixture: class/lex-namespace-brace-next-line]

### The namespace body context

1. `"`: a string.
2. The keyword `namespace`: a `namespace` unit; enters the namespace context.
3. `}`: a `}` unit; leaves the namespace body context.
4. Zero or more whitespace followed by one or more line feeds: a `newline` unit.
5. One or more other whitespace characters: nothing.
6. `[*]`: a `[*]` unit.
7. The keyword `class`: a `class` unit; enters the class context.
8. The shared rules.

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
class/lex-string-semicolon] [fixture: class/lex-string-unclosed]

A `` ` `` (shared rule 5) starts a backquoted name in the same way: the `` ` ``,
the characters up to the next `` ` ``, line feeds included, and that `` ` `` are
a `backquoted` unit, which is **empty** when nothing is between the backquotes.
When the text has no `` ` `` after the first, the unit takes the rest of the
text, and the lexer stops at its end: the name is not closed. [fixture:
class/lex-backquote-unclosed] [fixture:
class/lex-backquote-unclosed-takes-lines]

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
class/div-generic-starts-with-keyword] Elsewhere in the text, and with a word
character after the keyword, both read the same: `` class `notex` ``,
`` class `x note` ``, `class A~linkx~`, and `class A~ note~` are accepted by
both, and `` class A`~T~` `` gives A the type `T` in both, because the Db splits
the name text `A~T~` at its `~`. [fixture: class/lex-backquote-keyword-prefix]
[fixture: class/lex-backquote-keyword-later] [fixture:
class/lex-generic-keyword-prefix] [fixture:
class/lex-generic-space-before-keyword] [fixture:
class/lex-backquote-around-generic]

### The callback contexts

The callback name context is entered by `call`:

1. `(`, zero or more whitespace, and `)`: a `(` unit and a `)` unit; leaves the
   context.
2. `(`: a `(` unit; leaves the context and enters the callback arguments
   context.
3. One or more characters other than `(`, line feeds included: a `callback-name`
   unit.

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
[fixture: class/lex-acc-title-next-line]

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
| a name, listed below                                 | Identifier                                                                     |
| a text without quotes, listed below                  | ClassLiteral                                                                   |
| `ignored-text`                                       | ClassIgnoredText                                                               |

The names are the name parts of a class name or a namespace name, before a
backquoted name or without one, the name part after `:::` or between `<<` and
`>>` of a statement, the `word` after `style`, the `word` units of a `classDef`
statement before its styles, the `word` of a `cssClass` statement, and a
`callback-name`. The texts without quotes are a `generic-text`, the text of a
`label` after its `:`, the `member-name`, `parameters`, `return-type`, and
`annotation-name` of a member line, `callback-arguments`, a `style`, and a
`title-text`, `description-text`, or `description-block-text`.

### Diagram and statements

```text
diagram    = "header" newline statement ( newline statement )* newline? end-of-text
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
class/gram-class-css-class-blank-body]

### Members and annotations

```text
member-statement     = class-name label?
annotation-statement = "<<" name-part ">>" class-name
annotation-line      = "<<" annotation-name? ">>"
method-line          = ignored-text? visibility? member-name? "(" parameters? ")" classifier? return-type? classifier? ignored-text?
attribute-line       = visibility? member-name? classifier?
```

A member statement with a label adds a member: the text of the label after its
`:` is a member line, divided as described under [Member lines](#member-lines);
when it is all whitespace, as in `A : `, the statement adds the class and no
member. Without a label, it changes nothing: a line `Foo` declares no class.
Class diagrams have no title statement, and `title Animals` is such a line, the
class name `titleAnimals`. [fixture: class/gram-member-statement] [fixture:
class/db-member-statement-blank] [fixture: class/gram-name-alone] [fixture:
class/gram-title-not-statement] A method line has at most one `classifier` unit.

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
class/gram-relation-spaces] [fixture: class/gram-cardinality-empty]

### Namespaces

```text
namespace-statement = "namespace" namespace-name class-label? "{" newline? namespace-item ( newline namespace-item )* newline? "}"
namespace-item      = class-statement | note-statement | namespace-statement
```

A namespace holds class statements, notes, and namespaces, and at least one of
them: `namespace A {` with `}` on the next line, and a relation in a namespace,
are rejected. [fixture: class/gram-namespace-empty] [fixture:
class/gram-namespace-relation]

### Other statements

```text
note-statement          = "note for" class-name string | "note" string
click-statement         = "callback" class-name string string-or-empty?
                        | "link" class-name string string-or-empty? "link-target"?
                        | "click" class-name "call" callback-name "(" callback-arguments? ")" string-or-empty?
                        | "click" class-name "href" string string-or-empty? "link-target"?
style-statement         = "style" word styles
class-def-statement     = "classDef" word ( "," word )* styles
css-class-statement     = "cssClass" string word
styles                  = style ( "," style )*
style                   = ( word | ":" | "#" | "%" | "style" | label )+
direction-statement     = "direction-text"? "direction" "direction-value" "direction-text"?
accessibility-statement = "accTitle" ":" title-text
                        | "accDescr" ":" description-text
                        | "accDescr" "{" description-block-text "}"
empty-description-block = "accDescr" "{" "}"
```

The text of a note, the URL of a link, the function name of `callback`, and the
ids of `cssClass` are strings that are not empty; the second string of a click
statement, its tooltip, may be empty. [fixture: class/gram-note-empty] [fixture:
class/gram-link-url-empty] [fixture: class/gram-callback-name-empty] [fixture:
class/gram-css-class-ids-empty] [fixture: class/gram-link-tooltip-empty] `call`
needs parentheses after the function name: `click A call fn` is rejected.
[fixture: class/lex-callback-name-unclosed]

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

mermaid.js rejects these inputs in its Db, after its grammar has accepted them,
and so does this specification:

- An annotation statement for a class that does not exist: `<<interface>> A`
  before any statement that adds A is rejected
  ([`addAnnotation`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/classDb.ts#L263-L266)),
  while the same after `class A` is accepted. [fixture:
  class/db-annotation-statement-undefined-class] [fixture:
  class/spec-class-diagram-280c04be]
- A method line that cannot be divided, such as `x)` (see
  [Member lines](#member-lines)).

## Db normalization

The diagram title from the frontmatter does not come from the tree: whoever
checks Db values derives it with mermaid.js's own functions (see
[Configuration (reference)](../common.md#configuration-reference)). [fixture:
class/docs-syntax-class-diagram-2f728b32]

### The summary

The fixtures record the Db of mermaid.js as a summary with these fields, made by
[`normalizeClass()`](../../../tests/src/normalizers/class.ts) of
`@mmd-toolkit/tests`:

| Field        | Content                                                      |
| ------------ | ------------------------------------------------------------ |
| `direction`  | The direction, `TB` unless a direction statement sets it.    |
| `title`      | The title of the frontmatter, or the empty text.             |
| `accTitle`   | The accessibility title, or the empty text.                  |
| `accDescr`   | The accessibility description, or the empty text.            |
| `classes`    | The classes, in the order in which they were first added.    |
| `relations`  | The relations, in source order.                              |
| `notes`      | The notes, in source order.                                  |
| `namespaces` | The namespaces, in the order in which they were first added. |
| `interfaces` | The interfaces that lollipop relations add, in source order. |

A class has `id`, `type`, `label`, `text`, `shape`, which is always `classBox`,
`cssClasses`, `methods`, `members`, `annotations`, `styles`, and, when they are
set, `parent`, `link`, `linkTarget`, `haveCallback`, and `tooltip`. A method has
`memberType` (`method`), `visibility`, `classifier`, `id`, `parameters`, and
`returnType`; an attribute, in `members`, has `memberType` (`attribute`),
`visibility`, `classifier`, and `id`. A relation has `id1`, `id2`, `relation`
with `type1`, `type2`, and `lineType`, `relationTitle1`, `relationTitle2`, and,
when it has a label, `title`. A note has `id`, `text`, and, when they are set,
`class` and `parent`. A namespace has `id`, `label`, the ids of its `classes`,
`notes`, and `children`, `explicit`, and, when it has one, `parent`. An
interface has `id`, `label`, and `classId`. The summary leaves out what only
rendering uses: the DOM ids, the display text of members, the number in a note's
id, the class definitions themselves (what they change shows in the classes'
`styles`), the click callbacks, and the whitespace at the end of each style.
Texts are recorded as mermaid.js holds them before HTML sanitization (see
[Sanitizers are disabled](../../../tests/docs/expected-results.md#sanitizers-are-disabled)).

### Building the summary from the tree

The statements are applied in source order, the items of a namespace in their
own order, and each statement as follows.

**Names.** The **name text** of a class name is the text of its units before the
generic type, joined, with the backquotes of a backquoted name left out; the
whitespace between the units is not part of it. When a backquoted name is not
closed, its text runs to the end of the text, and the name text ends with a line
feed, the one that the lexer reads after the last character. The **written
name** is the name text, followed by `~`, the text of the `generic-text` unit of
the class name, whitespace included, and `~`, when the class name has one: a
generic type of only whitespace, which has no node in the tree (see
[ClassName](../ast/class.md#classname)), counts too, so `class A~ ~` declares A
with the type of a space, and `class A~ T ~` with the type `T` between two
spaces, while `class A~~` declares A without a type. [fixture:
class/db-generic-blank] [fixture: class/db-generic-spaces] The **id** and the
**type** of a written name are the text before its first `~` and the text
between its first and its second `~`, or up to its end, when it has a `~` and
its first `~` is not its first character; otherwise the id is the written name
and the type is empty. So `class Map~K, V~` declares `Map` with the type `K, V`,
and ``class `a~b` `` declares `a` with the type `b`, while ``class `~a~b` ``,
whose first `~` is its first character, declares `~a~b` without a type.
[fixture: class/db-generic-type] [fixture: class/db-backquoted-name-tilde]
[fixture: class/db-backquoted-name-unclosed] [fixture:
class/div-backquote-starts-with-tilde-and-type]

**Adding a class.** Adding a class by a written name does nothing when a class
with its id exists. Otherwise it adds the class with that id and type, the id as
`label`, as `text` the id followed, when the type is not empty, by `&lt;`, the
type, and `&gt;`, `cssClasses` `default`, and empty lists. So the type of a
class is the one written where it was first added: `class A` followed by
`class A~T~` leaves A without a type. [fixture: class/db-class-type-first-added]

**Class statements.** A class statement adds its class, then:

- A label sets `label` to the text of the string, and `text` to that text
  followed, when the class has a type, by `<`, the type, and `>`. A later label
  replaces an earlier one, and a class statement without a label keeps the label
  that the class has. [fixture: class/db-class-label-type] [fixture:
  class/db-class-label-redefined] [fixture:
  class/db-class-label-kept-without-label]
- `:::` gives the class the CSS class of its name part (see **CSS classes**
  below).
- An annotation adds its name part to `annotations`.
- The member lines are added in order, as for a member statement, after the CSS
  class or the annotation. They are added to the members that the class has, so
  two class statements with bodies for the same class give it the members of
  both, in order: `class A {` with `+int x` and `class A {` with `+int y` give A
  the members `int x` and `int y`. [fixture: class/db-class-members-added]

**Member statements and member lines.** A member statement with a label adds its
class, then adds the member line of the label. A member line adds to the class:

- an annotation line, the text between `<<` and `>>`, whitespace included, to
  `annotations`, also when it is empty or all whitespace, which the tree has as
  null; [fixture: class/db-member-annotation-spaces] [fixture:
  class/tokens-annotation-blank] [fixture: class/tokens-annotation-blank-label]
- a method line, to `methods`: `visibility` the visibility mark or the empty
  text, `classifier` the classifier mark or the empty text, `id` the member
  name, `parameters` the text of its unit or the empty text, and `returnType`
  the text of its unit or the empty text, followed, when a classifier mark ends
  the return type (item 5 of [Member lines](#member-lines)), by the whitespace
  between the unit and that mark: `+getInstance() Foo $` has the return type
  `Foo` and a space, and `+foo(a) a b`, a tab, and `*` the return type `a b` and
  a tab; [fixture: class/db-method-return-type-space-before-classifier]
  [fixture: class/db-method-return-type-tab-before-classifier]
- an attribute line, to `members`, in the same way, without `parameters` and
  `returnType`;
- a blank member line, nothing.

The member name is the text of the `member-name` unit, or the empty text, and it
is preceded by a space when its **member name text** starts with a space
(U+0020). The member name text of a method line is the text of the divided
segment or member text from after the visibility mark that was set apart, or
from its start, to the opening parenthesis; that of an attribute line is the
text of the member text between its visibility mark, or its start, and its
classifier mark, or its end. `+  spaced name  ` has the id `spaced name` after
one space, `+ foo()` the id `foo` after one space, `x`, U+2028, and ` b(c)` the
id `b` after one space, and `x`, U+2028, and ` (c)` the id of one space; with a
tab in place of the space of the last, the id is empty. [fixture:
class/db-member-name-space] [fixture: class/db-method-name-space] [fixture:
class/lex-member-method-segment-space-before-name] [fixture:
class/lex-member-method-segment-space-only-name] [fixture:
class/lex-member-method-segment-tab-only-name]

**Annotation statements.** An annotation statement adds its name part to the
`annotations` of the class with the id of its class name, which must exist (see
[Rejections outside the grammar](#rejections-outside-the-grammar)).

**Relations.** A relation statement has the two written names of its class
names, and `type1`, `type2`, and `lineType` from its relation: a relation end
`o` is 0, `<|` and `|>` are 1, `*` is 2, `<` and `>` are 3, `()` is 4, and a
missing end is the text `none`; the line `--` is 0 and `..` is 1. When `type1`
is 4 and `type2` is `none`, the statement adds the class of the second written
name and an interface with the id `interface` followed by the number of
interfaces before it, the first written name as `label`, and the second written
name as `classId`, and the interface's id takes the place of the first class
name; when `type2` is 4 and `type1` is `none`, the same with the two names
swapped. Otherwise it adds the classes of both written names, the first first.
Then it adds the relation: `id1` and `id2` the ids of the two names, or the
interface's id, `relationTitle1` and `relationTitle2` the texts of the strings
without the whitespace at their ends, or `none` for a missing or empty string,
and, when it has a `label` unit, `title` the text of the label after its `:`,
without the whitespace at its ends. A label of only whitespace, which is null in
the tree (see [ClassRelationStatement](../ast/class.md#classrelationstatement)),
gives the empty title: `A --> B : ` has the title of the empty text, while
`A --> B` has none, and `A --> B :`, with nothing after the `:`, is rejected,
because a label needs a character after its `:`. [fixture:
class/tokens-relation-label-blank] [fixture: class/gram-relation-colon-only]
[fixture: class/db-relation-types] [fixture:
class/docs-syntax-class-diagram-bc06236e] [fixture:
class/docs-syntax-class-diagram-b06c5b3c] [fixture: class/db-lollipop-both]
[fixture: class/db-cardinality-spaces] [fixture: class/db-relation-label-quotes]

**Namespaces.** The **name text** of a namespace name is formed as for a class
name. A namespace statement has the **qualified id** of its name text: the
qualified id of the namespace statement it is in, a `.`, and the name text, or
the name text alone at the top. When a namespace with the qualified id exists,
it becomes explicit, and a label replaces its `label`. Otherwise, for the
qualified id and each part of it before a `.`, from the first, a namespace with
that id is added when none exists: `label` the part after the last `.`, or the
text of the label for the qualified id itself, `parent` the id one part shorter,
and `explicit` true for the qualified id itself and false for the parts before
it; an existing namespace with the qualified id becomes explicit. Each such
namespace is added to the `children` of its parent. Then the items of the body
are applied, and after them, each class statement of the body sets the `parent`
of its class to the qualified id and adds the class's id to the namespace's
`classes`, and each note statement does the same for its note. [fixture:
class/spec-class-diagram-95acf03b] [fixture: class/db-namespace-nested]
[fixture: class/db-namespace-redeclared-label] [fixture:
class/db-namespace-moves-class]

**Notes.** A note statement adds a note: `id` `note` followed by the number of
notes before it, `text` the text of the string as written, and, after
`note for`, `class` the written name; it adds no class. [fixture:
class/db-note-text-spaces] [fixture: class/db-note-for-undefined-class]

**Click statements.** In these statements, the written name of the class name is
a list of names separated by `,`, and each step applies to each name in turn.

- `callback` and `click` with `call` set `haveCallback` of the class with the id
  of each name, when it exists, and then give the CSS class `clickable` (see
  **CSS classes**).
- `link` and `click` with `href` set `link` of the class of each name, when it
  exists, to the URL without the whitespace at its ends, or leave it unset when
  that is empty, and `linkTarget` to the link target, or `_blank`; then they
  give the CSS class `clickable`. A name that starts with an ASCII digit is
  looked up as `classId-` followed by the name, as for CSS classes.
- A tooltip that is not empty then sets `tooltip` of the class with the id of
  each name, when it exists.

So a click statement for a class that does not exist changes nothing. The
function name and the arguments of a callback are not part of the summary.
[fixture: class/db-click-href] [fixture: class/db-click-link-as-written]
[fixture: class/spec-class-diagram-6fe56b41] [fixture:
class/db-callback-names-comma] [fixture: class/db-link-url-spaces] [fixture:
class/db-link-undefined-class] [fixture: class/db-click-undefined-class]
[fixture: class/db-callback-undefined-class]

**CSS classes.** Giving a CSS class to a written name, from `:::`, `cssClass`,
and the click statements, splits the written name at each `,`. For each name, a
name that starts with an ASCII digit is looked up as `classId-` followed by the
name, and when a class with its id exists, a space and the CSS class are added
to its `cssClasses`. So `class 1A:::c` declares `1A` without the CSS class `c`.
A space after the `,` is part of the next name: `cssClass "A, B" c` gives `c` to
A only. [fixture: class/db-css-class-digit] [fixture:
class/db-css-class-statement-digit] [fixture: class/db-css-class-list-space] A
CSS class for a name with no class changes nothing. [fixture:
class/db-css-class-undefined-class]

**Styles.** The text of a style is the texts of its units joined, without the
whitespace between them; the whitespace inside a label stays. The **style
values** of a style statement are the texts of its styles split at each `,`.
`style` appends them to the `styles` of the class whose id is the word, when it
exists, so a `style` statement before the statement that adds the class changes
nothing. [fixture: class/db-style-before-class] `classDef` appends them, for
each of its names in order, to the `styles` of each class whose `cssClasses`
contain that name anywhere, also inside a longer CSS class:
`classDef fo fill:red` applies to a class with the CSS class `foo`, and
`classDef default fill:red` to every class. It applies only to the classes that
have the CSS class at that point: a class that gets it later gets no styles.
[fixture: class/db-style-spaces] [fixture: class/db-style-undefined-class]
[fixture: class/db-class-def-substring] [fixture: class/db-class-def-default]
[fixture: class/db-class-def-order]

**Other statements.** A direction statement sets `direction` to its value.
`accTitle:` sets the accessibility title, and `accDescr:` and `accDescr {` the
description, as in
[flowchart.md](./flowchart.md#building-the-summary-from-the-tree): without
whitespace at the ends, each line feed and the whitespace after it read as one
line feed, and a later statement replacing an earlier one, also an `accDescr:`
line replacing a block. [fixture: class/db-acc-title-spaces] [fixture:
class/spec-class-diagram-0926d7aa] [fixture: class/db-acc-title-replaces]
[fixture: class/db-acc-descr-replaces] [fixture:
class/db-acc-descr-line-replaces-block]

## Known divergences

These divergences of [known-divergences.md](../known-divergences.md) apply to
class diagrams, and show in them as follows.

- **[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.md).**
  A directive inside a keyword, a line, a string, or `:::` makes the input
  rejected here, while mermaid.js accepts it: `cla%%{init: {}}%%ss A`,
  `A -%%{init: {}}%%-> B`, `note "a%%{init: {}}%%b"`, and
  `class A:%%{init: {}}%%::c` (see
  [Directives inside units](#directives-inside-units)). [fixture:
  class/div-directive-in-keyword] [fixture: class/div-directive-in-line]
  [fixture: class/div-directive-in-string] [fixture:
  class/div-directive-in-triple-colon]
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
  class name, an empty call, and an empty description block that does not start
  a statement make the input rejected here, while mermaid.js reads no token for
  them and accepts the input: `"" A --> B`, `class A""B`, `class A``B`,
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
  class/lex-comment-then-spaces-line-then-bare-comment] [fixture:
  class/lex-comment-line-then-spaces-line] A comment-only line is not counted as
  a line in either (see [The statement context](#the-statement-context)).
  [fixture: class/div-comment-on-header-line] [fixture:
  class/div-comment-joins-lines] [fixture:
  class/div-comment-before-statement-line] [fixture:
  class/div-comment-in-relation] [fixture: class/lex-comment-blank-line-after]
- **[`headerless-empty-ending`](../known-divergences/headerless-empty-ending.md).**
  A text whose first word is `classDiagram` followed by an ASCII word character,
  such as `classDiagramX`, has no header and is rejected here. mermaid.js
  accepts it when the text ends with an empty title, description, or description
  block, `click A call`, or a string opened at the end of a `callback`, `link`,
  or `click` statement, as in `classDiagramX` followed by a line `accTitle:`.
  [fixture: class/div-headerless-empty-title] [fixture:
  class/div-headerless-empty-call] [fixture: class/div-headerless-empty-string]
  [fixture: class/div-headerless-repeated-header]
- **[`name-start-reads-unit`](../known-divergences/name-start-reads-unit.md).**
  A backquoted name or the text of a generic type that starts with `"`, with `~`
  (in a backquote), with `<<` or `>>`, or with one of the keywords `cssClass`,
  `callback`, `link`, `click`, `note`, and `href` is a name or a type here,
  while mermaid.js reads that unit instead (see
  [Strings, backquoted names, and generic types](#strings-backquoted-names-and-generic-types)).
  ``class `note` `` declares the class `note` here and is rejected by
  mermaid.js; ``A `"1"` --> B`` has a relation from `A"1"` here and the
  cardinality `1` in mermaid.js. [fixture: class/div-backquote-keyword-escaped]
  [fixture: class/div-backquote-around-string]
