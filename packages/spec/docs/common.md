# Common elements

Japanese version: [common.ja.md](./common.ja.md)

How the text of every diagram type is read before the diagram's own grammar
applies.

mermaid.js prepares the text with a fixed sequence of regular expression
rewrites: it normalizes line breaks, removes frontmatter, directives, and
comment lines, replaces entities, and then hands the rewritten text to the
diagram parser. Offsets in the rewritten text no longer match the source. This
specification restates each rewrite as a rule that the lexer applies to the
source text directly, at the position where it matters. No rewritten text is
built, so no implementation needs a table from rewritten offsets back to source
offsets. Each rule is one of four kinds:

- **Trivia rules** say which parts of the source are not diagram text:
  frontmatter, directives, comment lines, and whitespace.
- **Lexical rules** say how the lexer reads a character or a short run of
  characters: line breaks, HTML attribute quotes, and entities. None of them
  moves any other character.
- **Conversions** say how the source text reads as the text that ends up in the
  Db. They are how the lexer reads the text, not values of the tree, which keeps
  what the author wrote (see [ast.md](./ast.md#nodes)).
- **Line rules** decide, from a whole line segment, which of its characters the
  lexer skips. The only common one is the `;` rule of `style` and `classDef`
  lines.

The result is the same as in mermaid.js in every accept or reject decision and
every Db value, except for the deliberate differences defined in
[known-divergences.md](./known-divergences.md).

References to the source of mermaid.js are links to the commit recorded in
[index.md](./index.md#the-pinned-mermaidjs). Fixtures that demonstrate a claim
are named `[fixture: <category>/<name>]` and live in
`packages/tests/fixtures/<category>/<name>/` of
[`@mmd-toolkit/tests`](../../tests/fixtures). The category is a diagram type, or
`common` for the behavior described here. The `common` fixtures use flowchart as
the diagram under test, except where a claim is about the `error`
pseudo-diagram, about a text with no diagram body at all, or about the detector
of another diagram type (see [detection.md](./detection.md)).

## Notation

- A **character** is a Unicode code point. A character outside the BMP is one
  character, and so is a lone surrogate, a surrogate code unit that is not part
  of a surrogate pair; a lone surrogate is not a valid code point in well-formed
  text, but it still counts as one character.
- **Whitespace** is any of U+0009–U+000D, U+0020, U+00A0, U+1680, U+2000–U+200A,
  U+2028, U+2029, U+202F, U+205F, U+3000, and U+FEFF. It includes the byte order
  mark. This is the set that the patterns in mermaid.js treat as whitespace.
  [fixture: common/whitespace-characters] [fixture:
  sequence/lex-whitespace-characters-around-text]
- A **line terminator** is `\r\n`, a lone `\r`, or a lone `\n`. U+2028 and
  U+2029 are not line terminators.
- **Line whitespace** is whitespace that is not part of a line terminator.
- A **line** is a maximal run of characters without a line terminator. A
  **whitespace-only line** is a line that is empty or consists of line
  whitespace.
- A **word character** is an ASCII letter (`A`–`Z`, `a`–`z`), an ASCII digit
  (`0`–`9`), or `_`. A **word** is a maximal run of word characters. No other
  letter or digit is a word character.
- A **line segment** is a maximal run of characters that contains no line
  terminator, U+2028, or U+2029.
- Two characters match **case-insensitively** when they are the same character,
  or when both are in the Basic Multilingual Plane (U+0000–U+FFFF) and have the
  same canonical form. The canonical form of a BMP character is its uppercase,
  taken from the full Unicode uppercase mapping without language-specific rules,
  when that uppercase is a single BMP character; otherwise it is the character
  itself. As an exception, a character outside ASCII whose uppercase would be an
  ASCII character keeps itself as its canonical form. So `a` matches `A` and `é`
  matches `É`, while `ß` does not match `S` or `SS`, U+017F LATIN SMALL LETTER
  LONG S does not match `s` or `S` (its uppercase is the ASCII `S`), U+212A
  KELVIN SIGN does not match `k` (`k` becomes `K`, U+212A stays itself), and no
  character outside the BMP matches another character. This is how the
  case-insensitive detectors of mermaid.js compare. [fixture:
  common/detect-case-kelvin-sign] [fixture: common/detect-case-long-s]
- A **token** is the general name for what a lexer cuts out of a text and hands
  to its grammar, as in "mermaid.js reads no token for an empty string". The
  rules of this specification read units instead (see
  [Terminology](./index.md#terminology)); the word names no record of an
  implementation.
- Grammar rules use this notation. A rule is written as its name, `=`, and its
  definition. Text in double quotes is literal text; a double quote itself is
  written in single quotes. Items written one after another follow one another
  in that order. `|` separates alternatives, which are not tried in order: an
  input is read by the alternative with which the rest of the grammar reads it
  too. In a state diagram, `definition-statement`, the first alternative of
  `statement`, reads the `A` of `A --> B` but leaves the `-->`, which no rule
  reads next, so `A --> B` is a `transition-statement`. [fixture:
  state/lex-two-transitions-one-line] Where two alternatives could read the same
  units, the diagram document says which reading is taken. An item followed by
  `?` is optional, by `*` repeats zero or more times, and by `+` repeats one or
  more times. Parentheses group items. Unless a rule says otherwise, `*` and `+`
  take as many repetitions as possible.
- The rules of a diagram's lexer are written in words. Where such a rule reads a
  repetition, such as "one or more characters other than …" or "zero or more
  whitespace", without saying how many, it reads as many characters as it can
  while the rest of the rule still matches; a rule that reads as few as possible
  says so. When a rule reads two or more repetitions, they are read from left to
  right, each as many as it can while the rest of the rule still matches: what
  an earlier repetition can read is not left to a later one. In flowchart,
  `click A call cb(1, "x")` has the one `callback-arguments` unit `1, "x"`,
  which the grammar takes once. In state, the text of a note over several lines
  ends at the first line `end note` after it, because that rule reads as few
  characters as possible: `note right of A`, `x`, `end note`, `B`,
  `note left of B`, `y`, and `end note` on seven lines are two notes, `x` on A
  and `y` on B. [fixture: flowchart/gram-click-call] [fixture:
  state/lex-note-block-two-notes]
- Every rule reads the source with the rule of
  [Line terminators](#line-terminators) applied, so each line terminator counts
  as a single line break.

The rules count characters. mermaid.js applies its patterns to UTF-16 code units
instead, and the two readings give the same results for every rule here:

- Every set of characters that a rule names (whitespace, word characters, line
  terminators, and the punctuation of each rule) consists of BMP characters that
  are not surrogates. A character outside the BMP is therefore never in such a
  set, and neither is a lone surrogate, in either reading.
- "Any character except …" includes characters outside the BMP and lone
  surrogates. mermaid.js takes the two code units of a pair one after the other,
  so a match never ends between them.
- Case-insensitive matching is the one place where the reading shows. mermaid.js
  compares code unit by code unit, so a character outside the BMP matches only
  itself, as the definition above says.

Where a length is measured instead, the unit is the UTF-16 code unit, and the
text says so: the `maxTextSize` limit below.

## mermaid.js and this specification

[`preprocessDiagram()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L58-L91),
[`Diagram.fromText()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/Diagram.ts#L19-L85),
and
[`detectType()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/detectType.ts#L36-L48)
apply these steps in order. The last column says how this specification restates
each of them.

| Step | mermaid.js                                                                   | This specification                                                                                                       |
| ---- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 1    | `\r\n` and lone `\r` become `\n`.                                            | Lexical rule and conversion: [Line terminators](#line-terminators)                                                       |
| 2    | Inside `<tag ...>`, `="..."` becomes `='...'`.                               | Lexical rule and conversion: [HTML attribute quotes](#html-attribute-quotes), in the text after the frontmatter          |
| 3    | A leading YAML block is parsed and removed.                                  | Trivia rule: [Frontmatter](#frontmatter). The body is not parsed.                                                        |
| 4    | Every `%%{ ... }%%` is parsed for configuration and removed, wherever it is. | Trivia rule: [Directives](#directives). The arguments are not parsed.                                                    |
| 5    | Comment lines are removed; then leading whitespace is trimmed.               | Trivia rule: [Comment lines](#comment-lines) and [Leading whitespace](#leading-whitespace)                               |
| 6    | The first registered detector that matches selects the diagram type.         | [Diagram detection](#diagram-detection), at the first unit of the diagram text                                           |
| 7    | A `;` is dropped from some `style` lines; `#name;` becomes a placeholder.    | Line rule: [`style` and `classDef` lines](#style-and-classdef-lines); lexical rule and conversion: [Entities](#entities) |
| 8    | `\n` is appended.                                                            | Lexical rule: [End of text](#end-of-text)                                                                                |
| 9    | Some diagrams rewrite the text again before lexing.                          | Described in each diagram document                                                                                       |

In mermaid.js each step rewrites the output of the previous one. This
specification defines all of these steps as rules that the lexer applies while
it reads the source once, from left to right, as described in
[Reading a source](#reading-a-source); they give the same units and values as
the steps, except for the known divergences. No rule produces a rewritten text
for a later rule to read, and no rule reads a text other than the source: where
mermaid.js decides something on a text that it has rewritten, such as the
diagram type, this specification states the rule on the source, and the inputs
that then come out differently are known divergences. How mermaid.js derives its
configuration in Steps 3 and 4 is described for reference in
[Configuration (reference)](../../tests/docs/configuration.md#configuration-reference).

Steps 1–4, 6, and 8 are the same for every diagram type. Step 5 is skipped for
the parser's input, though not for detection, when the diagram's Db sets
`preserveCommentsWhenParsing`
([`Diagram.fromText()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/Diagram.ts#L66-L77)).
Step 7 then works on the text that the parser receives, so it also sees the
comment lines and the leading whitespace. In the pinned mermaid.js only the
agentflow Db does so: its parser receives comment lines and leading whitespace,
unless the source after the complete frontmatter trivia, including
whitespace-only lines after the closing --- line, without its directives and
with each `\r\n` counted as one, is longer than `maxTextSize` UTF-16 code units,
in which case Step 5 applies as usual. [fixture:
agentflow/comment-default-size-equal-crlf] [fixture:
agentflow/comment-default-size-above-crlf] [fixture:
agentflow/comment-default-size-equal-inline-directive] [fixture:
agentflow/comment-default-size-above-inline-directive] [fixture:
agentflow/comment-default-size-equal-frontmatter] [fixture:
agentflow/comment-default-size-above-frontmatter] [fixture:
agentflow/frontmatter-extra-trivia-below] [fixture:
agentflow/frontmatter-extra-trivia-boundary] [fixture:
agentflow/frontmatter-extra-whitespace-line-boundary] [fixture:
agentflow/frontmatter-extra-trivia-above] `maxTextSize` can only be set by the
site configuration (see
[The effective configuration](../../tests/docs/configuration.md#the-effective-configuration));
it is 50000 by default. The agentflow document says how its lexer treats them.

### Reading a source

The lexer reads the source once, from left to right. It does not build a
rewritten text: each rule below is applied at the position where it matters.

At offset 0, the lexer decides whether the source starts with frontmatter
([Frontmatter](#frontmatter)). If it does, the frontmatter is the `Frontmatter`
of the tree, and reading continues after it. The **text** is the source after
the frontmatter trivia, or the whole source when there is no frontmatter; the
rules of this document apply to the text. From there, at each position, the
lexer tries these in order:

1. **A comment region**, at a comment start ([Comment lines](#comment-lines)).
   The lexer looks ahead over whitespace, line terminators, and directives; when
   it reaches a comment, everything from the comment start through the line
   terminator that ends the comment's line, if there is one, is a comment
   region, which is trivia.
2. **The line rule**, at the start of a line segment
   ([`style` and `classDef` lines](#style-and-classdef-lines)). The lexer looks
   ahead to the end of the segment and decides which of its `;` the rule
   ignores.
3. **A directive** that starts at this position
   ([Where a directive is](#where-a-directive-is)). It is one `Directive` of the
   tree, and a line terminator inside it does not end a line. A directive can
   start anywhere, also inside a comment line and in the middle of a unit, which
   then keeps the reading of mermaid.js or makes the input rejected
   ([A directive is a token boundary](#a-directive-is-a-token-boundary)). A
   directive inside a comment region is part of that region (item 1) and does
   neither.
4. **The diagram's own unit rules.** While it matches them, the lexer reads each
   line terminator as `\n` ([Line terminators](#line-terminators)), each
   attribute quote as `'` ([HTML attribute quotes](#html-attribute-quotes)), and
   each entity as its placeholder ([Entities](#entities)). It reads through
   comment regions, the `;` that the line rule ignores, and directives as if
   they were not there; a unit with a directive inside it keeps the reading of
   mermaid.js or makes the input rejected
   ([A directive is a token boundary](#a-directive-is-a-token-boundary)).

The characters that the diagram's lexer reads are the **diagram text**: the
characters of the text outside directives and comment regions, other than the
`;` that the line rule ignores. The diagram text includes the whitespace and
line terminators that the diagram treats as trivia between units. For agentflow,
whose lexer reads comment lines itself, the characters of comment regions are
diagram text too (see
[mermaid.js and this specification](#mermaidjs-and-this-specification)).

The **converted form** of diagram text is the text as the lexer reads it: each
line terminator as `\n`, each attribute quote as `'`, and each entity as its
placeholder. It is how the lexer reads the text, and the form in which
mermaid.js holds a text in its Db. The values of the tree are not in converted
form: they keep the text as the author wrote it (see [ast.md](./ast.md#nodes)).

Leading whitespace, line terminators, directives and comment regions are trivia
([Leading whitespace](#leading-whitespace)). Detection selects the diagram type
and its lexer ([Diagram detection](#diagram-detection)); this can reject the
input. Detection can pass one nonleading frontmatter-shaped block before the
header. The block remains diagram text: pie, gitgraph, info and packet apply
their hidden YAML rules. The cited flowchart, sequence, class, state, agentflow,
block, ishikawa, usecase and venn cases reject it. It is not common frontmatter
or trivia. [fixture: pie/frontmatter-nonleading-comment] [fixture:
gitgraph/lex-yaml-after-comment] [fixture: info/frontmatter-nonleading-comment]
[fixture: packet/detect-one-block] [fixture:
pie/lex-yaml-leading-config-not-applied] [fixture:
common/directive-before-frontmatter] [fixture:
common/frontmatter-nonleading-sequence] [fixture:
common/frontmatter-nonleading-class] [fixture:
common/frontmatter-nonleading-state] [fixture:
agentflow/db-frontmatter-after-comment] [fixture:
block/gram-frontmatter-comment-before] [fixture:
ishikawa/frontmatter-after-comment] [fixture: usecase/frontmatter-after-comment]
[fixture: venn/frontmatter-comment-before]

After the last character of the source, the lexer reads one more `\n`
([End of text](#end-of-text)). Whatever else the diagram does, including the
extra rewrites of Step 9 above, is in its document.

One rule needs more than the characters around a position, and is stated as a
rule of its own: **HTML attribute quotes.** Whether a `"` is read as `'` depends
on a tag that can start much earlier, even on a comment line, and continue over
several lines. The tags are found by reading the whole text from left to right
([HTML attribute quotes](#html-attribute-quotes)).

Every other rule is decided by the characters around the position: a directive
by the characters from its `%%{`, a comment region by what follows a comment
start up to the end of the comment's line, the diagram type by the diagram text
after the passes defined under Diagram detection, the line rule by its line
segment, and an entity by `#`, a word, and `;`.

For agentflow, item 1 does not apply to the lexer: it reads comment lines and
leading whitespace itself, and the line rule and entities apply to them too, as
described above.

The frontmatter body, the directive arguments, and the `@{ ... }` data blocks of
a diagram are never parsed. Where a Db value depends on the configuration, the
configuration is the one mermaid.js derives
([Configuration (reference)](../../tests/docs/configuration.md#configuration-reference)).

An input is accepted when detection selects a diagram type and the diagram's
grammar and Db accept what its lexer reads.

## Line terminators

Lexical rule: the lexer reads `\r\n` and a lone `\r` as `\n`. A lone `\r` is
therefore a line break everywhere, including inside frontmatter and directives.
[fixture: common/cr-only] [fixture: common/crlf] [fixture:
common/frontmatter-lone-cr] [fixture: common/directive-spans-lone-cr]

Whether a `\r` is followed by `\n` is decided in the source, before anything is
left out: a `\r` and a `\n` with a directive or a comment region between them
are two line terminators, in every rule, as in mermaid.js, which reads line
terminators before it removes directives and comment lines. So `A[a`, a lone
`\r`, a directive, `\n`, and `b]` has the Db label `a`, two line feeds, and `b`.
[fixture: flowchart/lex-lone-cr-directive-lf-label]

Conversion: every line terminator is `\n` in the converted form of a text. The
values of the tree keep line terminators as written.

U+2028 and U+2029 are not line terminators. They are line whitespace. `A-->B`
U+2028 `C-->D` is one line and is rejected. [fixture:
common/u2028-is-not-newline]

## HTML attribute quotes

Lexical rule. HTML tags are found in the text, from left to right:

```text
html-tag        = "<" tag-name attribute-part ">"
tag-name        = word-character+
attribute-part  = (any character except ">")*
```

The attribute part may span lines, and it ends at the first `>`. A `<` that is
not followed by a word character, or after which no `>` follows anywhere in the
text, does not start a tag; the search continues with the next `<`. Tags do not
overlap: the search continues after the end of the previous tag. [fixture:
common/html-attribute-quotes-no-word-after-lt] [fixture:
common/html-attribute-quotes-digit-tag-name] [fixture:
common/html-attribute-quotes-no-closing-gt] [fixture:
common/html-attribute-quotes-tag-over-lines] [fixture:
common/html-attribute-quotes-two-tags]

Inside each attribute part, quoted attribute values are found from left to
right:

```text
quoted-value    = "=" '"' (any character except '"')* '"'
```

The lexer reads the two `"` of each quoted value as `'`. The replacement has the
same length, so no other character moves. Tags and quoted values are found in
the characters of the text as written, directives, comment lines, and the `;`
that the line rule ignores included. The frontmatter is not searched. [fixture:
flowchart/html-tag-starts-in-frontmatter] [fixture:
common/html-attribute-quotes-space-around-equals]

Conversion: the same characters are `'` in the converted form of a text. The
label of `A[<a href="u">t</a>]` is `<a href='u'>t</a>` in the Db, while its
value in the tree keeps the `"`. [fixture: common/html-attribute-quotes]

Reading the `"` as `'` matters for acceptance: in flowchart, a `"` inside label
text starts a quoted string, so the same label without this rule would be
rejected.

mermaid.js makes this replacement in
[`cleanupText()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L6-L17)
so that the attribute values of HTML in a label can use `"` without a change to
the grammar, and it applies it to the whole source before it removes the
frontmatter, directives, and comment lines. Except in the frontmatter (see
[`html-tag-in-frontmatter`](./known-divergences/html-tag-in-frontmatter.md)),
this specification follows it on purpose, with its consequences:

- A tag can start on a comment line. `%% <a` on a comment line starts a tag that
  reaches the `>` in `A[b="c">d]`, so the label is `b='c'>d`. Before
  `accTitle: b="c">d`, the same comment line makes the accessible title
  `b='c'>d`. [fixture: flowchart/html-tag-starts-in-comment-line] [fixture:
  flowchart/html-tag-starts-in-comment-line-acc-title]
- A tag can reach across a directive. `A[<a %%{init: {}}%% href="u">t]` has the
  label `<a  href='u'>t`. [fixture:
  flowchart/html-tag-attributes-cross-directive]
- A `>` on a comment line ends a tag. In `A[<b]`, a comment line `%% >`, and
  `B[c="d">e]`, the tag `<b` ends on the comment line, so the `"` of `B` stays,
  and the flowchart grammar rejects it. [fixture:
  flowchart/html-tag-closed-in-comment-line]
- A `"` on a comment line can end or start a quoted value. In `A[<a b="c`, a
  comment line `%% "`, and `d">e]`, the value `="c` ends on the comment line, so
  the `"` after `d` stays, and the flowchart grammar rejects it. In `A[<a`, a
  comment line `%% x="`, and `y" z>e]`, a value starts at the `="` on the
  comment line and ends at the `"` after `y`, so the label is `<a`, a line
  break, and `y' z>e`. [fixture:
  flowchart/html-tag-value-closed-in-comment-line] [fixture:
  flowchart/html-tag-value-opened-in-comment-line]
- A `;` that the line rule ignores still counts. In `A[<a style:#x=;"u">t]`,
  `=;"u"` is not a quoted value, so the `"` stay, and the flowchart grammar
  rejects them. [fixture: flowchart/html-tag-ignored-semicolon-in-value]

## Frontmatter

Trivia rule, from
[`extractFrontMatter()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/frontmatter.ts#L24-L69).
The source has frontmatter when all of the following hold:

1. The **opening line** is the first line of the source. It consists of an
   _indent_ (zero or more line whitespace characters), `---`, and optional line
   whitespace, and a line terminator ends it. A line break before it prevents
   frontmatter. A byte order mark is line whitespace, so it becomes part of the
   indent. [fixture: common/frontmatter-leading-newline] [fixture:
   common/frontmatter-bom] [fixture: common/frontmatter-bom-both-delimiters]
2. `----` is not `---` followed by line whitespace, so it does not open
   frontmatter. [fixture: common/frontmatter-four-dashes]
3. A **delimiter line** consists of exactly the opening indent, `---`, and
   optional line whitespace, and a line terminator ends it. The indent must
   equal the opening indent character for character, so an indented `---` inside
   a YAML block scalar does not close the frontmatter, and a byte order mark
   before the opening delimiter must be repeated before the closing one. Text
   after `---`, or a line at the very end of the text without a line terminator,
   is not a delimiter line. [fixture: common/frontmatter-indented] [fixture:
   common/frontmatter-indent-mismatch] [fixture:
   common/frontmatter-nested-dashes] [fixture:
   common/frontmatter-closing-trailing-text] [fixture:
   common/frontmatter-no-newline-after] With the delimiters indented by two
   spaces, `---` indented by six spaces in a block scalar of the body is not a
   delimiter line, and the title is `---` and a line feed; with the body at
   column zero and the `---` of the block scalar indented by two spaces, that
   line closes the frontmatter, and the input is rejected. [fixture:
   common/frontmatter-indented-block-scalar-dashes] [fixture:
   common/frontmatter-indented-closing-in-body] `--- !!map` is not a delimiter
   line, so `---`, `%YAML 1.2`, `--- !!map`, `title: x`, and `---` is
   frontmatter with the title `x`, while with `--- !!map` split into `---` and
   `!!map`, the `---` line closes the frontmatter after `%YAML 1.2`, and the
   input is rejected. [fixture:
   common/frontmatter-yaml-document-marker-with-tag] [fixture:
   common/frontmatter-yaml-document-marker-split]
4. The **first content line** is the first line after the opening line that is
   not whitespace-only. The **closing line** is the first delimiter line after
   the first content line, and the **body** is the lines from the first content
   line up to the closing line. The whitespace-only lines between the opening
   line and the first content line are part of the frontmatter but not of the
   body. For example, `---`, a whitespace-only line, `---`, and `---` is
   frontmatter whose body is the third line and whose closing line is the
   fourth. [fixture: common/frontmatter-blank-line-then-two-delimiters]
5. When there is no delimiter line after the first content line, but the first
   content line itself is a delimiter line and at least one whitespace-only line
   lies between the opening line and it, then the first content line is the
   closing line and the body is the last of those whitespace-only lines. This is
   how `---`, an empty line, and `---` is frontmatter with an empty body, and
   how `---`, a line of spaces, and `---` is frontmatter whose body is that
   line. [fixture: common/frontmatter-blank-line-then-delimiter-only] In every
   other case there is no frontmatter; in particular `---` directly followed by
   `---` is not frontmatter. [fixture: common/frontmatter-empty-body] [fixture:
   common/frontmatter-adjacent-delimiters]

The frontmatter trivia extends from the start of the source through the line
terminator of the closing line and any whitespace-only lines after it, with
their line terminators. A whitespace-only line at the end of the source that has
no line terminator is not part of it. The indentation of the next line that is
not whitespace-only is not part of it. [fixture:
common/frontmatter-blank-lines-after-closing] [fixture:
common/frontmatter-whitespace-line-at-end] [fixture:
common/frontmatter-indented-line-after]

This specification does not parse the body. The tree keeps it as written (see
[ast.md](./ast.md#frontmatter)), and an input is accepted whatever the body
contains; mermaid.js parses it as YAML and can reject the input (see
[`embedded-data-opaque`](./known-divergences/embedded-data-opaque.md)). How
mermaid.js reads the body is described in
[Reading the frontmatter body](../../tests/docs/configuration.md#reading-the-frontmatter-body).

When these conditions do not hold, there is no frontmatter: the block is diagram
text. At the detection point, before passing bare `%%` lines, detection passes
one block having the frontmatter shape above and looks for a header after it.
This does not remove the block from the text the diagram lexer reads. With
trivia before a block, pie, gitgraph, info and packet apply their hidden YAML
rules to the retained text. If it matches, PieIgnoredText, GitgraphIgnoredText,
InfoIgnoredText or PacketIgnoredText holds the block and its YAML title and
configuration do not apply. The rejecting controls below establish the scope of
rejection, not a claim about all other diagram types. Leading whitespace, a byte
order mark on the opening fence only, a comment line or a directive can expose
this case. Matching byte order marks on both fences can instead satisfy the real
frontmatter rule. [fixture: pie/frontmatter-nonleading-comment] [fixture:
gitgraph/lex-yaml-after-comment] [fixture: info/frontmatter-nonleading-comment]
[fixture: packet/detect-one-block] [fixture:
pie/lex-yaml-leading-config-not-applied] [fixture:
pie/lex-yaml-after-leading-lf] [fixture: pie/lex-yaml-bom-opening-only]
[fixture: pie/lex-yaml-bom-both-fences] [fixture:
pie/lex-yaml-after-directive-line] [fixture: pie/lex-yaml-after-directive-glued]
[fixture: common/frontmatter-leading-newline] [fixture:
common/directive-before-frontmatter] [fixture: common/frontmatter-bom] [fixture:
common/frontmatter-indent-mismatch] [fixture:
common/frontmatter-nonleading-sequence] [fixture:
common/frontmatter-nonleading-class] [fixture:
common/frontmatter-nonleading-state] [fixture:
agentflow/db-frontmatter-after-comment] [fixture:
block/gram-frontmatter-comment-before] [fixture:
ishikawa/frontmatter-after-comment] [fixture: usecase/frontmatter-after-comment]
[fixture: venn/frontmatter-comment-before]

This skip is tried only once, before passing bare lines or performing the second
directive scan. A second block is not skipped, nor is a block after a
second-scan directive; a second-scan directive may instead follow the skipped
block. Real leading frontmatter may precede this separate retained block.
Leading indentation at the detection point is trivia, so equal indentation on
the two nonleading fences leaves only the closer indented and prevents the skip.
[fixture: pie/detect-two-nonleading-blocks] [fixture:
pie/detect-block-after-real-frontmatter] [fixture:
pie/detect-second-scan-directive-before-block] [fixture:
pie/detect-block-before-second-scan-directive] [fixture:
pie/detect-block-equally-indented-fences]

A block that does not satisfy that shape is not passed. Adjacent `---` fences
with no body line, a missing closing fence, a closing fence indented when the
opener is not, unequal nonempty indents, four dashes, closing-fence suffix text
and a closing fence with no following line break leave `---` at the detection
point and select the rejecting `---` pseudo-diagram. A bare `%%` line, including
a percent-brace line on which no directive starts, before an otherwise matching
block also prevents this one skip: the block is not at the detection point.
[fixture: common/frontmatter-indent-closing-only] [fixture:
common/frontmatter-indent-different-depths] [fixture:
common/frontmatter-four-dashes] [fixture:
common/frontmatter-closing-trailing-text] [fixture:
common/frontmatter-no-newline-after] [fixture:
common/frontmatter-adjacent-delimiters] [fixture: common/frontmatter-unclosed]
[fixture: pie/lex-yaml-after-comment-adjacent-fences] [fixture:
pie/frontmatter-unclosed] [fixture: pie/lex-yaml-after-bare-comment] [fixture:
common/frontmatter-after-bare-percent-flowchart] [fixture:
pie/detect-block-after-bare-brace-line]

The `error` pseudo-diagram also accepts a line break, byte order mark or comment
line before a matching block and then `error`; its condition leaves out the
block. The block's title and configuration are not applied there either.
[fixture: common/frontmatter-bom-error] [fixture:
common/detect-lone-cr-directive-lf] [fixture: common/detect-lone-cr-comment-lf]
[fixture: common/detect-frontmatter-after-line-break-error] [fixture:
common/detect-frontmatter-after-comment-line-error] [fixture:
common/detect-crlf-no-directive]

## Directives

Trivia rule. This specification does not parse the argument of a directive.
mermaid.js reads some directives for configuration; see
[The configuration scan](../../tests/docs/configuration.md#the-configuration-scan).

### Where a directive is

Directives are found at every position of the source after the frontmatter, from
left to right, as
[`removeDirectives()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L200-L202)
finds them. A directive starts at `%%{` when zero or more whitespace characters
and then a word character follow it; it then extends as far as this rule
reaches:

```text
directive  = "%%{" whitespace* name (whitespace* ":")? whitespace* argument? whitespace* "}%%"?
name       = word
argument   = word
           | free-text
free-text  = (any character except U+2028 and U+2029)*
```

- Whitespace includes line terminators, so every `whitespace*` may cross line
  breaks. [fixture: common/directive-whitespace-before-name] [fixture:
  common/directive-line-feed-before-name]
- After the name, `whitespace* ":"` is taken when a `:` follows the name and its
  whitespace; otherwise the directive has no colon. [fixture:
  sequence/config-wrap-directive] [fixture:
  common/directive-whitespace-before-colon] [fixture:
  common/directive-whitespace-before-colon-applies] [fixture:
  common/directive-line-feed-before-colon-applies]
- The argument is a `word` when the first character after the whitespace is a
  word character. Otherwise it is `free-text`, which stops before the first
  `}%%`, before U+2028 or U+2029, or at the end of the text, whichever comes
  first. It may be empty. [fixture: common/directive-u2028] [fixture:
  common/directive-empty-argument]
- The `whitespace*` after the argument takes all whitespace that follows,
  including line breaks. The closing `}%%` is then taken if it follows. So when
  a free-text argument stops before U+2028 or U+2029, that character is taken as
  whitespace, and a `}%%` right after it still closes the directive:
  `%%{init: {'theme':'dark'}` U+2028 `}%%` is one closed directive that sets the
  theme. [fixture: common/directive-u2028-before-closing]

After a directive the search continues where it ends; directives do not overlap.
A `%%{` that is not followed by zero or more whitespace characters and then a
word character does not start a directive, and the search continues with the
next character. [fixture: common/directive-non-word-start] The rule of
[Line terminators](#line-terminators) applies, so a directive may span a lone
`\r` or `\r\n` exactly as in mermaid.js, which normalizes line breaks before it
removes directives. [fixture: common/directive-spans-lone-cr]

Whether a directive starts at a position does not depend on the diagram's
syntax, on the context the lexer is in, or on comments: a directive can start
inside a comment line and in the middle of what would otherwise be a unit.
Consequences, each confirmed against mermaid.js:

- The closing `}%%` is optional. A directive with a free-text argument and no
  `}%%` extends to the end of the text. [fixture: common/directive-unclosed]
  Right after the header, it takes the rest of the diagram: `flowchart LR`,
  `%%{init: {"theme": "dark"}}`, and `A-->B` has no vertices and no edges.
  [fixture: common/directive-unclosed-after-header]
- `%%{` followed by a word starts a directive even when no directive was
  intended: `%%{wrap` at the end of a line followed by `A-->B` on the next line
  takes `A` as its word argument, because the whitespace before the argument
  crosses the line break. [fixture: common/directive-name-only-unclosed] After
  `A-->B`, the lines `%%{wrap` and `C-->D` give the directive the argument `C`,
  and the rest of the line, `-->D`, continues the link before it: the edges are
  A to B and B to D. [fixture:
  common/directive-word-argument-unclosed-next-line]
- When the argument starts with a word character, the argument is only that
  word. `%%{init: dark foo}%%` ends after `dark `, and `foo}%%` is ordinary
  text. [fixture: common/directive-word-argument-then-more]
- `%%{` not followed by a word, such as `%%{ }%%` or `%%{-x}%%`, is not a
  directive. It is also not a comment line (see below), so it is
  [diagram text](#reading-a-source), which each diagram's lexer reads: on the
  line after a vertex, flowchart rejects `%%{}`, and sequence and class read it
  as a diagram comment. state rejects it after a state, and after `state X`
  reads its `%%` as text that mermaid.js does not read before a body, and `{}`
  as the empty body of X. [fixture: common/directive-empty-braces] [fixture:
  flowchart/lex-percent-brace-line-after-vertex] [fixture:
  sequence/lex-percent-brace-line-after-message] [fixture:
  class/lex-percent-brace-line-after-class] [fixture:
  state/lex-percent-brace-line-after-reference] [fixture:
  state/lex-percent-brace-line-after-state] [fixture:
  common/directive-non-word-start]
- Neither the name nor its case matters: `%%{INIT: ...}%%` is a directive like
  `%%{init: ...}%%`. [fixture: common/directive-uppercase]

### A directive is a token boundary

A directive is trivia and not diagram text. Every rule that comes after the
directive scan reads the text without its directives, in which the characters
before and after a directive follow one another, as they do in mermaid.js once
it has removed the directive: [Comment lines](#comment-lines),
[Leading whitespace](#leading-whitespace),
[Diagram detection](#diagram-detection), the rule of
[`style` and `classDef` lines](#style-and-classdef-lines),
[Entities](#entities), and the diagram's lexer and grammar. A line terminator
inside a directive is left out with it, so a directive that spans several lines
does not end a line. The one exception is
[HTML attribute quotes](#html-attribute-quotes): mermaid.js finds them before it
removes directives, so they are found in the text as written, directives
included. [fixture: flowchart/html-tag-attributes-cross-directive]

So the units and the values that a diagram's lexer reads are those of the text
without its directives, and a match of the line rule, an entity, or the `%%` of
a comment can have a directive between two of its characters.

- A **unit** is what one rule of the diagram's lexer reads at once. Each diagram
  document defines its units, and lists its **name units**, the units of the
  names without whitespace that its lexer reads, its **text units**, the units
  of the texts without quotes and of the names that may contain whitespace, and
  its **string units**, the units of its strings in quotes and of its backquoted
  names (for flowchart, see
  [Units and contexts](./diagrams/flowchart.md#units-and-contexts) and
  [Directives inside units](./diagrams/flowchart.md#directives-inside-units)). A
  text unit and a string unit may have a directive between any two of its
  characters. Any other unit, such as a name unit, a keyword, a delimiter such
  as `:::`, an arrow, or a number, may not, and the input is rejected. A
  directive between two units is allowed, except between two units that a
  diagram document makes one name or one delimiter together, such as the two `(`
  that open a circle in flowchart: the directive then lies inside that name or
  delimiter, and the input is rejected. In the `error` pseudo-diagram, every run
  of characters is a text, so a directive is allowed anywhere. A directive in
  whitespace that a unit reads at its start or its end, and a directive in a
  unit of whitespace only, such as a `space` or a `newline` unit, is not inside
  the unit: whitespace reads the same with or without it, as in
  `A --> %%{init: {}}%% B`, whose arrow unit reads the whitespace around it, and
  in `accTitle %%{init: {}}%% : x` in sequence. [fixture:
  flowchart/lex-directive-after-arrow] [fixture:
  flowchart/db-subgraph-id-directive-in-statement-space] [fixture:
  sequence/lex-acc-title-directive-before-colon]

- A directive inside a comment region is read through with the region, as the
  lexer reads through the whole region (see [Comment lines](#comment-lines)),
  also inside what one unit reads. A directive after the comment's `%%` is part
  of the comment; one before it is not. [fixture:
  common/comment-region-directive-in-string] [fixture:
  common/comment-directive-in-string]

A directive between two units, or in whitespace that a unit reads at its start
or its end, behaves exactly as in mermaid.js. [fixture:
common/directive-mid-line] [fixture: common/directive-after-link] [fixture:
common/comment-after-directive] [fixture: common/directive-joins-lines]

Because the lexer reads the text without the directive, a directive inside a
text unit or a string unit also gives the result of mermaid.js. In flowchart,
the label of `A[x%%{init: {}}%%y]` is `xy`. `flowchart%%{init: {}}%%LR` is
rejected, as in mermaid.js, because the text is `flowchartLR`. [fixture:
common/directive-in-label-text] [fixture:
common/directive-between-header-and-direction] In a string, the whitespace
around the directive stays: the label of `A["a %%{init: {}}%% b"]` is `a`, two
spaces, and `b`, and the quotes of a directive inside a string do not end the
string. [fixture: common/directive-in-string] [fixture:
flowchart/lex-directive-in-string-with-quotes] A directive in whitespace between
two units changes nothing: `flowchart %%{init: {}}%%LR` has the direction `LR`,
and `style A %%{init: {}}%%fill:red` the style `fill:red`, while
`style A%%{init: {}}%%fill:red` is rejected, because the text is
`style Afill:red`. [fixture: common/directive-in-header-whitespace] [fixture:
common/directive-after-style-space] [fixture:
common/directive-between-id-and-style] `A[mysty%%{init: {}}%%le:#x;]` has the
label `mystyle:#x`, because the line matches the `style` rule, and the label of
`A[a#qu%%{init: {}}%%ot;b]` has the placeholder of the entity `#quot;`, both as
in mermaid.js. [fixture: common/directive-in-style-rule] [fixture:
common/directive-in-entity] A directive inside a name, a keyword, a delimiter,
an arrow, or a number makes the input rejected, while mermaid.js accepts it:
mermaid.js reads `end%%{init: {}}%%x` as the vertex `endx`, not the keyword
`end`, and here the directive lies inside a name. [fixture:
common/directive-keyword-followed-by-text] See
[`directive-as-token-boundary`](./known-divergences/directive-as-token-boundary.md).

A directive on a comment line after its `%%` is part of the comment, and one
before the `%%` is not (see [Comment lines](#comment-lines)). Each diagram
document applies this rule to what its lexer reads; for flowchart, see
[Directives inside units](./diagrams/flowchart.md#directives-inside-units).

## Comment lines

Trivia rule, from
[`cleanupComments()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/comments.ts#L6-L8).

A **comment start** is the start of the text, or the position right after a line
terminator, U+2028, or U+2029 that is not part of a directive. A **comment** is
a `%%` of the text without its directives, that is, two `%` that are not part of
a directive with nothing but directives between them, that satisfies both
conditions:

1. Between the nearest comment start before it and the `%%`, there are only
   whitespace and directives. A `%%` after other text on its line is no comment
   and stays in the text: `subgraph S %% group` has the title `S %% group`,
   `accTitle: Title %% note` the title `Title %% note`, and
   `style A fill:red %% red` the style `fill:red %% red`. [fixture:
   common/comment-mid-line-subgraph-name] [fixture:
   common/comment-mid-line-acc-title] [fixture: common/comment-mid-line-style]
2. The first character after the `%%` that is not part of a directive exists, is
   not `{`, and is not part of a line terminator. So a line with only `%%` is no
   comment line, and inside a text of several lines it is part of the text: the
   edge text of `A -->|a`, a line `%%`, and `b| B` in flowchart is `a`, the line
   `%%`, and `b`, and so is a subgraph title written the same way. [fixture:
   flowchart/lex-percent-line-in-edge-label] [fixture:
   flowchart/lex-percent-line-in-subgraph-title]

A comment extends from the first `%` of its `%%` to the end of its line, that
is, to the next line terminator that is not part of a directive; U+2028 and
U+2029 do not end it. [fixture:
common/comment-line-separator-inside-comment-line] A line terminator is part of
a directive when it lies in what the directive scan takes, the whitespace after
the argument included (see [Where a directive is](#where-a-directive-is)), so a
directive in a comment can carry the comment over line breaks: after `X`, the
lines `%% %%{wrap`, `A`, and `B --> C` are one comment, because the directive
takes `A` and the line break after it, and mermaid.js reads neither `A` nor
`B --> C`. [fixture: common/comment-directive-word-argument-takes-next-lines]
When no line terminator follows that is not part of a directive, the comment
extends to the end of the text; it then does not include the whitespace at its
end that a directive took, as the directive does not (see
[Directive](./ast.md#directive)). A line that contains a comment is a **comment
line**.

The **comment region** of a comment starts at the earliest comment start from
which only whitespace and directives lead to the `%%`, and ends after the line
terminator that ends the comment, if there is one. It therefore includes the
whitespace-only lines directly before the comment line. The lexer finds it at
that comment start: from there it looks ahead over whitespace, line terminators,
and directives, and when it reaches a comment, the region starts where the
look-ahead started. Comment regions do not overlap. The whole region is trivia.
[fixture: common/comment-blank-line-before-in-string] In the tree, only its
directives appear, in `Root.directives`; its whitespace and line terminators
belong to no node. The region still matters beyond them: its line terminators
are not diagram text, and inside a unit the lexer reads through the whole
region, as described below.

- Comment lines may be indented with any line whitespace. [fixture:
  common/comment-indented]
- A `%%` after other text on its line is not a comment. `A-->B %% note` passes
  `%% note` to the diagram's grammar, which rejects it in flowchart. [fixture:
  common/comment-trailing]
- U+2028 and U+2029 are comment starts although they are not line terminators.
  In `A-->B` U+2028 `%% note`, the `%% note` is a comment and the statement
  before it is accepted; the same holds for U+2029. [fixture:
  common/comment-after-u2028] [fixture: common/comment-after-u2029] A comment
  region starts right after U+2028 when only whitespace follows up to the `%%`:
  in `error` U+2028, two spaces, and `%% c`, the region is the two spaces and
  the comment. When whitespace and a second U+2028 come before the `%%`, the
  region starts at the earliest comment start, right after the first U+2028.
  [fixture: common/whitespace-cut-at-comment-region] [fixture:
  common/whitespace-cut-at-earliest-comment-start]
- A line containing only `%%` is not a comment line, because a comment needs a
  character after `%%`. In flowchart it declares a node named `%%`. `%%`
  followed by a space is a comment line. [fixture: common/comment-bare]
  [fixture: common/comment-bare-with-space] So a `%%` line among lines that are
  commented out is a statement: after `A-->B`, the lines `%% C-->D`, `%%`, and
  `%% D-->E` give the vertex `%%` besides two comments, while with an empty line
  or `%%` and a space in place of the `%%` line, all of them are comments.
  [fixture: common/comment-bare-between-comment-lines] [fixture:
  common/comment-bare-between-comment-lines-empty] [fixture:
  common/comment-bare-between-comment-lines-space] Inside a label, such a line
  stays in the text: `A[a`, a line break, `%%`, a line break, and `b]` has the
  label `a`, a line feed, `%%`, a line feed, and `b`. [fixture:
  common/comment-bare-line-in-label] So it is in a string: `A["first`, a line
  break, `%%`, a line break, and `third"]` has the label `first`, a line feed,
  `%%`, a line feed, and `third`, while `%%` and a space on a line of its own is
  a comment line, also inside a label: `A[a`, a line break, `%%` and a space, a
  line break, and `b]` has the label `a`, a line feed, and `b`. [fixture:
  common/comment-bare-line-in-string-label] [fixture:
  common/comment-percent-space-line-in-label] It stays as well in a description
  block, also after a comment line, in the string of a tooltip, and in a title
  on the line after `accTitle:`. [fixture:
  flowchart/lex-acc-descr-block-bare-marker-line-after-comment-line] [fixture:
  flowchart/lex-tooltip-bare-marker-line] [fixture:
  flowchart/lex-acc-title-bare-marker-next-line]
- A text that consists only of comment lines has no diagram text and is rejected
  by detection. [fixture: common/comment-only]
- Directives are left out, so the line `%%{init: {}}%% %% c` is a directive
  followed by a comment, and `%%%{init: {}}%%% c` is a comment line whose `%%`
  is its first and its last `%`, with the directive between them, as in
  mermaid.js. The line `%%%%{init: {}}%%` is not a comment line: once the
  directive is left out, nothing follows its `%%`. In flowchart it declares the
  node `%%`, as in mermaid.js. A directive after the `%%` of a comment line is
  part of the comment line. [fixture: common/comment-after-directive] [fixture:
  common/comment-percent-joined-by-directive] [fixture:
  flowchart/comment-percent-before-directive] [fixture:
  common/directive-in-comment]
- A line that starts with `%%{` and is not a directive is not a comment line
  either, because the character after `%%` is `{`. [fixture:
  common/directive-empty-braces]

Comment lines are recognized independently of the diagram's syntax and of the
context the lexer is in. The lexer reads through a comment region as if it were
not there: a unit whose text continues across a comment region, such as a
multi-line quoted label, is one unit, and its value is the text before and after
the region joined. [fixture: common/comment-in-string] [fixture:
common/comment-blank-line-before-in-string]

This keeps acceptance as in mermaid.js even when the comment line contains
characters that are special inside the unit, such as a `"` inside a quoted
label. [fixture: common/comment-with-quote-in-string]

A comment region cuts a diagram comment in the same way, a comment that a
diagram's own lexer reads to the end of its line. Its line goes on past a
comment line that follows a U+2028 or U+2029 on it, because mermaid.js reads the
text without the comment line: in state, after `A %% x`, U+2029, a line
`%% end`, and a line `B`, the diagram comment goes on with `B`, which mermaid.js
does not read. [fixture: state/lex-diagram-comment-across-comment-line]

## Leading whitespace

Trivia rule. mermaid.js removes leading whitespace right after it removes
comment lines, in
[`cleanupComments()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/comments.ts#L6-L8).
Whitespace, line terminators, directives, and comment regions before the first
unit of the diagram's lexer are trivia and are not seen by the diagram's
grammar. [fixture: common/leading-whitespace-before-header] [fixture:
common/leading-trivia-before-header]

## Diagram detection

Detection chooses the diagram type from the diagram text. The **detection
point** is the first position of the text that is not leading trivia: not
whitespace, not a line terminator, not inside a directive, and not inside a
comment region ([Leading whitespace](#leading-whitespace)). If one block at that
point satisfies the [Frontmatter](#frontmatter) shape, detection passes it once
before looking for bare `%%` lines. The block remains diagram text for the
selected diagram to read; see Frontmatter for pie, gitgraph, info, packet and
rejecting controls. [fixture: pie/frontmatter-nonleading-comment] [fixture:
gitgraph/lex-yaml-after-comment] [fixture: info/frontmatter-nonleading-comment]
[fixture: packet/detect-one-block] [fixture:
pie/lex-yaml-leading-config-not-applied] [fixture:
common/directive-before-frontmatter] [fixture:
common/frontmatter-nonleading-sequence] [fixture:
common/frontmatter-nonleading-class] [fixture:
common/frontmatter-nonleading-state] From there, detection reads and passes the
**bare `%%` lines**, if there are any: a line whose diagram text, after line
whitespace, begins with `%%` followed by a line terminator, the end of the text,
or `{` where no directive starts, neither in the source nor in the reading once
more below; the whole line is skipped, whatever follows on it, a header among
it: `%%{ }%%` and `sequenceDiagram` on one line leave no header, and the text is
rejected. Such a line is neither a comment line nor a directive (see
[Comment lines](#comment-lines)); the whitespace, line terminators, directives,
and comment regions between bare `%%` lines are trivia, passed with them. A bare
`%%` line may be indented and may end with any line terminator. With the
directives left out, `%%%%{init: {}}%%` on a line of its own is a bare `%%`
line, while `%%%` is a comment line. A text of bare `%%` lines alone has no
header, and no detector matches. At each position it reaches, detection first
applies the rule of [Where a directive is](#where-a-directive-is) once more, to
the diagram text from there, read through the directives and comment regions of
the source as a unit is read through them: where leaving them out has brought
`%%{`, whitespace, and a word together, a directive starts, and detection skips
it, as far as the rule reaches, before it asks whether the line is a bare `%%`
line: in `%%{`, a comment line, `wrap}%%sequenceDiagram`, and `A->>B: x`, the
closed directive is skipped and detection reaches the header, where the other
order would skip the first line as a bare `%%` line and find no header at
`wrap}%%`. `%%{`, a comment line, and `sequenceDiagram` hold such a directive:
it takes the keyword as its name, and `A` on the next line as its argument, so
no header follows, and the text is rejected, as in mermaid.js, whose second scan
for directives finds the same directive.

For the cited flowchart, sequence, class, state, agentflow, block, ishikawa,
usecase and venn inputs, such a directive makes the input rejected: where it is
closed and a header follows, as in `%%{`, a line `%%{wrap}%%`, and
`x}%%flowchart LR`, detection reaches the header, and the cited rejecting
controls agree with mermaid.js, whose lexer reads `%%{` and `x}%%` as text
before the header. [fixture: flowchart/detect-directive-across-directive]
[fixture: sequence/detect-directive-across-directive] [fixture:
class/detect-directive-across-directive] [fixture:
state/detect-directive-across-directive] [fixture:
agentflow/detect-directive-second-scan-preheader] [fixture:
block/detect-directive-second-scan-preheader] [fixture:
ishikawa/detect-directive-second-scan-preheader] [fixture:
usecase/detect-directive-second-scan-preheader] [fixture:
venn/detect-directive-second-scan-preheader]

Pie, gitgraph, info and packet instead read a directive found only by
detection's second scan as hidden DIRECTIVE and hold it as PieIgnoredText,
GitgraphIgnoredText, InfoIgnoredText or PacketIgnoredText in textBeforeHeader.
The lines `%%{`, `%% gap`, `wrap}%%`, and `pie` are accepted; gluing `pie`
immediately to the closer rejects, because the hidden form's closing boundary is
not satisfied. [fixture: pie/lex-hidden-directive-second-detection-scan]
[fixture: pie/lex-hidden-directive-second-detection-scan-glued] [fixture:
gitgraph/lex-hidden-directive-second-scan] [fixture:
gitgraph/lex-hidden-directive-second-scan-glued] [fixture:
info/detect-second-scan-directive] [fixture: info/detect-second-scan-glued]
[fixture: packet/detect-second-scan-directive] [fixture:
packet/detect-second-scan-glued]

At the position reached, the detectors of [detection.md](./detection.md) are
tried in registration order against the diagram text
([Reading a source](#reading-a-source)), that is, the characters from there on,
directives and comment regions left out. The first detector whose condition
holds selects the diagram type. The diagram's lexer reads the retained
frontmatter-shaped block, if any, and pie, gitgraph, info and packet also read
the hidden DIRECTIVE forms above, as well as the text from the position reached.
Bare `%%` lines and their accompanying whitespace and line breaks passed by
detection are not read again here; that whitespace and those line breaks are
trivia. Each bare line is a comment of the diagram, with the mark `%%`, from its
`%%` to the end of its line, in every diagram type. mermaid.js reads such a line
with the lexer of the detected diagram, and some of its lexers reject it:
flowchart reads `%%` as an id before the header, state does not take the `{` of
a line that begins with `%%{`, and class reads a line of whitespace only after
such a line as a `newline` unit that its grammar does not take before the
header. These inputs are the known divergence
[`bare-percent-line-before-header`](./known-divergences/bare-percent-line-before-header.md).
No detector matching means the text is rejected with `UnknownDiagramError`; so
is a text with no diagram text at all, such as an empty text or a text of
comment lines only, and a text whose first unit is anything but a header, such
as a line `#` or `;`, or `%%` on the header's own line, which is no bare `%%`
line; and so is a text in which a directive or a comment line takes the header,
as `%%{`, a line break, and `sequenceDiagram` do, where the directive takes the
keyword as its name, and `%%`, U+2028, and `sequenceDiagram`, where the comment
line holds the keyword; and so is a text whose first unit is an empty
description block, `accDescr {}`, before the header. [fixture: common/empty]
[fixture: common/comment-only] [fixture: common/bare-percent-line-only]
[fixture: gitgraph/div-detect-retained-directive-bare-bom] [fixture:
gitgraph/div-lex-preheader-bare-between-retained-unicode] [fixture:
packet/div-detect-yaml-bare-directive-ls] [fixture:
common/bare-percent-line-only-with-line-feed] [fixture:
sequence/header-after-indented-bare-percent-line] [fixture:
sequence/header-after-bare-percent-crlf] [fixture:
sequence/header-after-bare-percent-cr] [fixture:
sequence/header-after-bare-percent-lines-with-blank-and-comment] [fixture:
sequence/header-after-bare-percent-lines-with-directive] [fixture:
sequence/header-after-bare-percent-then-directive] [fixture:
sequence/header-after-bare-percent-then-whitespace-line] [fixture:
class/header-after-bare-percent-then-empty-line] [fixture:
class/header-after-bare-percent-then-whitespace-line] [fixture:
sequence/header-after-empty-braces-no-space] [fixture:
sequence/header-after-empty-braces-then-keyword-same-line] [fixture:
sequence/header-after-non-word-brace-then-keyword-same-line] [fixture:
flowchart/header-after-acc-descr-block] [fixture:
sequence/header-after-triple-percent-line] [fixture:
sequence/header-after-percent-joined-by-directive-line] [fixture:
sequence/header-after-empty-braces-line-text] [fixture:
sequence/header-after-non-word-brace-line] [fixture:
class/header-after-non-word-brace-line] [fixture:
state/header-after-empty-braces-line] [fixture:
flowchart/header-after-empty-braces-line] [fixture:
sequence/header-after-unclosed-brace-line] [fixture:
sequence/header-after-unclosed-brace-and-comment-line] [fixture:
common/detect-directive-across-comment-line] [fixture:
common/detect-directive-second-scan-once] [fixture:
sequence/detect-directive-across-comment-line-closed] [fixture:
flowchart/detect-directive-across-directive] [fixture:
sequence/detect-directive-across-directive] [fixture:
class/detect-directive-across-directive] [fixture:
state/detect-directive-across-directive] [fixture:
sequence/header-after-percent-line-separator] [fixture:
sequence/header-after-bare-percent-line] [fixture:
sequence/header-after-empty-braces-line] [fixture:
sequence/header-after-empty-braces-semicolon] [fixture:
sequence/header-after-two-bare-percent-lines] [fixture:
class/header-after-bare-percent-line] [fixture:
class/header-after-empty-braces-line] [fixture:
state/header-after-bare-percent-line] [fixture:
flowchart/header-after-bare-percent-line] [fixture:
sequence/header-after-hash-line] [fixture: sequence/header-after-semicolon-line]
[fixture: sequence/header-after-bare-percent-on-same-line] [fixture:
class/header-after-hash-line] [detection.md](./detection.md) lists all 39
detectors in order, with their conditions, and each diagram document refers to
its entry in its Detection section.

A detector reads no further than its keyword and the character after it, except
the detector of the `error` pseudo-diagram below, whose condition is the whole
grammar of that pseudo-diagram; whatever follows a keyword is for the diagram's
grammar. Because the diagram text leaves out directives and comment regions, as
every rule after the directive scan does
([A directive is a token boundary](#a-directive-is-a-token-boundary)), a
directive before the detection point, on the header's line, right before the
header, or inside the keyword, and a line separator, a paragraph separator, or a
byte order mark before the header, which are line whitespace, and a lone `\r` or
`\r\n` before the header, which are line terminators, do not change which
detector matches: `  %% c`, an empty line, `%%{init: {}}%%`, and
`  flowchart LR` on four lines is a flowchart, and so are
`flowchart %%{init: {}}%%LR` and `%%{init: {}}%%sequenceDiagram` a flowchart and
a sequence diagram, while `flow%%{init: {}}%%chart LR` is detected as a
flowchart and then rejected, because the directive lies inside the header
keyword (see
[`directive-as-token-boundary`](./known-divergences/directive-as-token-boundary.md)).
[fixture: common/leading-trivia-before-header] [fixture:
common/leading-whitespace-before-header] [fixture:
common/detect-line-separator-before-header] [fixture:
common/detect-paragraph-separator-before-header] [fixture:
common/detect-bom-before-header] [fixture: common/detect-cr-before-header]
[fixture: common/detect-crlf-before-header] [fixture:
common/directive-in-header-whitespace] [fixture:
common/detect-directive-adjacent-before-header] [fixture:
common/directive-in-header-keyword]

Two pseudo-diagrams are registered before all real diagrams:

- `error`: this pseudo-diagram has no grammar; its parser ignores the text, and
  the input is accepted and produces no Db content. Which texts are the
  pseudo-diagram is decided by its condition alone: the diagram text from the
  detection point, with three things left out, is the word `error`, compared
  case-insensitively in the sense of [Notation](#notation), and nothing but
  whitespace and line terminators follows it up to the end of the text. The
  three things, which the detection of mermaid.js removes before it compares
  (see below), are: a block at the detection point that satisfies the conditions
  of [Frontmatter](#frontmatter) there, which is no frontmatter, since it is not
  at the start of the source; a directive that the rule of
  [Where a directive is](#where-a-directive-is) finds once more in the diagram
  text, where leaving out the directives of the source has brought `%%{`, a
  word, and `}%%` together; and a **comment of the pseudo-diagram**, a `%%` that
  has a line terminator somewhere after it, with the line whitespace before it,
  up to the end of its line, which a bare `%%` line is, and so is `%% x` after
  other text on its line when a line terminator follows. The tree holds all of
  it as text (see [ErrorDiagram](./ast.md#errordiagram)); in this pseudo-diagram
  every run of characters is a text, so a directive is allowed anywhere, and
  `err%%{init: {}}%%or` is `error`. `error x` on one line is rejected, and so is
  `error %% x` at the very end of the text, whose `%%` has no line terminator
  after it and so starts no comment; the same text with a line break after it is
  accepted. A line break, a byte order mark, or a comment line before a `---`
  block, then `error`, is accepted, while `---` directly followed by `---` is no
  such block, and the text is rejected; so is a bare `%%` line before the block,
  since the detection point is then at that line, which is diagram text, and the
  block is not at the detection point. `%%{`, a line `%%{wrap}%%`, and
  `x}%%error` is accepted, because the diagram text `%%{`, two line breaks,
  `x}%%error` holds a directive, while with `error` in place of `x}%%error` the
  directive takes `error` as its word argument and the text is rejected.
  [fixture: common/error-pseudo-diagram] [fixture: common/error-uppercase]
  [fixture: common/error-trailing-comment-line] [fixture:
  common/error-trailing-blank-lines] [fixture: common/error-directive-adjacent]
  [fixture: common/error-split-by-directive] [fixture:
  common/whitespace-cut-at-comment-region] [fixture:
  common/whitespace-cut-at-earliest-comment-start] [fixture:
  common/error-word-after] [fixture: common/error-trailing-percent-at-end]
  [fixture: common/error-trailing-percent] [fixture:
  common/error-comment-inside] [fixture: common/error-directive-inside]
  [fixture: common/error-style-semicolon-inside] [fixture:
  common/error-style-semicolon-trailing] [fixture:
  common/error-bare-percent-line] [fixture:
  common/detect-percent-joined-by-directive] [fixture:
  common/error-percent-before-directive] [fixture:
  common/detect-frontmatter-after-line-break-error] [fixture:
  common/frontmatter-bom-error] [fixture: common/detect-lone-cr-directive-lf]
  [fixture: common/detect-lone-cr-comment-lf] [fixture:
  common/detect-frontmatter-after-comment-line-error] [fixture:
  common/detect-crlf-no-directive] [fixture:
  common/error-bare-percent-line-then-frontmatter-block] [fixture:
  common/detect-directive-across-directive-closed] [fixture:
  common/detect-directive-joined-by-directive] [fixture:
  common/detect-directive-across-directive]
- `---`: the diagram text at the position reached starts with `---`, as for
  every detector but `error`. Its parser always throws, so the input is
  rejected. This is what becomes of a `---` block that is not frontmatter
  ([Frontmatter](#frontmatter)), also after a bare `%%` line: in `%%`, `---`,
  `a: b`, `---`, and `error`, the position reached is at the first `---`, while
  the condition of `error` looks from the detection point, where the block is
  not, and so does not leave it out; and so after a directive that detection
  finds once more, as in `%%{`, a comment line, and `wrap}%%---`. [fixture:
  common/frontmatter-four-dashes] [fixture: common/frontmatter-leading-newline]
  [fixture: common/error-bare-percent-line-then-frontmatter-block] [fixture:
  common/detect-dashes-after-directive-found-once-more]

mermaid.js decides the diagram type on a text that it rewrites first. In
[`detectType()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/detectType.ts#L36-L48),
after the frontmatter, the directives, the comment lines, and the leading
whitespace are removed, it removes a frontmatter block at the start again, scans
the text for directives again, and removes every `%%` that has a line break
somewhere after it together with the whitespace before it and the rest of its
line
([`stripAnyComments()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/regexes.ts#L46-L73));
then its detectors look at what is left, and the C4 detector looks for four of
its five keywords anywhere in it. The lexer of the detected diagram then reads
the text without these last removals. For a diagram with a grammar, the rules
above give the same result: a bare `%%` line is a comment in both where the
lexer of mermaid.js reads it as one, and only where it does not do the two
differ (the known divergence above); a directive that only the second scan finds
is passed by detection in both and rejected by both in the diagram types shown
by the rejecting controls below. [fixture:
flowchart/detect-directive-across-directive] [fixture:
sequence/detect-directive-across-directive] [fixture:
class/detect-directive-across-directive] [fixture:
state/detect-directive-across-directive] [fixture:
agentflow/detect-directive-second-scan-preheader] [fixture:
block/detect-directive-second-scan-preheader] [fixture:
ishikawa/detect-directive-second-scan-preheader] [fixture:
usecase/detect-directive-second-scan-preheader] [fixture:
venn/detect-directive-second-scan-preheader]

A matching nonleading `---` block is passed by detection in both and read by the
selected diagram: pie, gitgraph, info and packet apply their hidden YAML rules
and retain a matching block as ignored text. The cited rejecting controls have
the scope stated under [Frontmatter](#frontmatter). [fixture:
common/directive-before-frontmatter] [fixture:
common/frontmatter-indent-mismatch] [fixture: common/frontmatter-bom] [fixture:
agentflow/db-frontmatter-after-comment] [fixture:
block/gram-frontmatter-comment-before] [fixture:
ishikawa/frontmatter-after-comment] [fixture: usecase/frontmatter-after-comment]
[fixture: venn/frontmatter-comment-before] [fixture: packet/detect-one-block]

For the `error` pseudo-diagram, the three things left out by its condition are
these removals.

The one input that mermaid.js detects through these steps and this specification
reads otherwise is the known divergence
[`c4-keyword-anywhere`](./known-divergences/c4-keyword-anywhere.md): a text
whose header is another diagram's and whose diagram text holds `C4Container`,
`C4Component`, `C4Dynamic`, or `C4Deployment` after it is handed to the C4
parser by mermaid.js and read as the diagram of its header here. `C4Context`
counts at the start only, in both. [fixture: common/detect-c4-anywhere]
[fixture: common/detect-c4context-only-at-start]

When the text has an init directive, mermaid.js also runs the detectors once
more on a text derived differently, and that run can reject the input; this
specification does not run it (see
[Init directives](../../tests/docs/configuration.md#init-directives) and
[`embedded-data-opaque`](./known-divergences/embedded-data-opaque.md)).

## `style` and `classDef` lines

Line rule, applied to every diagram type, from
[`encodeEntities()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L895-L917).
It applies to one line segment at a time, and the lexer applies it at the start
of each segment, looking ahead to the segment's end. For this rule, a line
segment runs between line terminators, U+2028, and U+2029 that are not part of a
directive, the segment is read without its directives, the characters before and
after a directive following one another, and comment regions belong to no
segment. A U+2028 or U+2029 that a directive takes as its whitespace (see
[Where a directive is](#where-a-directive-is)) is part of the directive and ends
no segment: in sequence, the line
`participant A@{ "style": "x:#y" };participant C%%{init: {}`, U+2029, and
`;participant D` is one segment, whose last `;`, after the U+2029, is ignored,
so the line declares the participants A and `Cparticipant D`, as in mermaid.js.
[fixture: sequence/tokens-directive-paragraph-separator-keeps-segment] [fixture:
sequence/tokens-directive-paragraph-separator-then-semicolon]

On the line `participant A@{ "style": "x:#y" };participant C;participant E`, a
separator, `;participant D`, and the line `A->>B: y`, the participants show
which `;` is ignored:

- A line terminator, U+2028, or U+2029, also right after a closed directive, and
  a line feed before a comment line end the segment. The last `;` of the first
  line, between `C` and `participant E`, is ignored, and the participants are A,
  `Cparticipant E`, D, and B. [fixture:
  sequence/tokens-ignored-semicolon-separator-line-feed] [fixture:
  sequence/tokens-ignored-semicolon-separator-carriage-return] [fixture:
  sequence/tokens-ignored-semicolon-separator-crlf] [fixture:
  sequence/tokens-ignored-semicolon-separator-line-separator] [fixture:
  sequence/tokens-ignored-semicolon-separator-paragraph-separator] [fixture:
  sequence/tokens-ignored-semicolon-separator-closed-directive-line-separator]
  [fixture:
  sequence/tokens-ignored-semicolon-separator-closed-directive-paragraph-separator]
  [fixture: sequence/tokens-ignored-semicolon-separator-comment-line]
- With no separator, with a closed directive, and with an unclosed directive
  whose argument ends before a U+2028 or U+2029 that it then takes as
  whitespace, the segment goes on, and the `;` after the separator is ignored:
  the participants are A, C, `Eparticipant D`, and B. [fixture:
  sequence/tokens-ignored-semicolon-separator-none] [fixture:
  sequence/tokens-ignored-semicolon-separator-closed-directive] [fixture:
  sequence/tokens-ignored-semicolon-separator-unclosed-directive-line-separator]
  [fixture:
  sequence/tokens-ignored-semicolon-separator-unclosed-directive-paragraph-separator]
- An unclosed directive whose free-text argument meets a line terminator takes
  the rest of the text, and so does one whose free-text argument starts after
  the separator, as when a U+2028 or U+2029 right after its name or its `:` is
  taken as whitespace: in `%%{wrap`, U+2028, and `;participant D`, the argument
  is `;participant D` and all that follows. The last `;` of the segment is then
  the one between `C` and `participant E`, and the participants are A and
  `Cparticipant E`. [fixture:
  sequence/tokens-ignored-semicolon-separator-unclosed-directive-line-feed]
  [fixture:
  sequence/tokens-ignored-semicolon-separator-unclosed-directive-carriage-return]
  [fixture:
  sequence/tokens-ignored-semicolon-separator-unclosed-directive-name-line-separator]

For agentflow, comment regions are not left out (see
[mermaid.js and this specification](#mermaidjs-and-this-specification)), so the
rule also applies to comment lines.

A line segment **matches the `style` rule** when it contains, in this order:

1. the text `style`;
2. later, a `:` that is followed by zero or more characters that are not
   whitespace and then a `#`;
3. later than that `#`, a `;`.

When a segment matches, the lexer ignores its last `;`: it reads through that
`;` as if it were not there, and the grammar does not see it. Then the same is
done with `classDef` in place of `style` in item 1, on the segment without the
`;` that the `style` rule ignored. [fixture:
common/entity-style-then-classdef-rule] mermaid.js removes such a `;` from the
text in
[`encodeEntities()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L895-L917);
this specification keeps it in the source and only ignores it. Like a directive,
the ignored `;` may lie inside a text or a string, and between two units (see
[A directive is a token boundary](#a-directive-is-a-token-boundary)). Inside a
name, a number, a keyword, an arrow, or a delimiter, it makes the input
rejected, while mermaid.js accepts it: `A[style:#x] --> B;b` has the vertex `Bb`
in mermaid.js, and `A[style:#x] -;-> B` the edge `-->`; see
[`ignored-semicolon-as-token-boundary`](./known-divergences/ignored-semicolon-as-token-boundary.md).
[fixture: flowchart/div-ignored-semicolon-in-id] [fixture:
flowchart/div-ignored-semicolon-in-arrow]

The rule is meant to keep a CSS colour such as `#f00;` in a `style` or
`classDef` line from becoming an entity. It is purely textual, so:

- It matches `style` anywhere in a line, including inside a label.
  `A[mystyle:#x;]` matches, so its `;` is ignored, and it has the label
  `mystyle:#x`, while `A[mystyle: #x;]` does not match (whitespace separates the
  `:` from the `#`) and has the label `mystyle: ﬂ°x¶ß`. [fixture:
  common/entity-style-in-label] [fixture: common/entity-style-in-label-space]
  Other characters may come between the `:` and the `#`, as long as none is
  whitespace: `A[style:a#b;]` matches and has the label `style:a#b`, while
  `A[style:a #b;]` does not match and has the label `style:a`, a space, and the
  placeholder of `#b;`. [fixture: common/entity-style-colon-text-before-hash]
  [fixture: common/entity-style-colon-space-before-hash] This includes the HTML
  `style` attribute of a label:
  `A[<span style='color:#f00;font-weight:bold;'>x</span>]` matches, so its last
  `;` is ignored and `#f00;` is an entity;
  `A[<span style='color:red;background:#fff;'>x</span>];` ignores its separator,
  so `#fff;` is an entity, while without the separator the last `;` is the one
  after `#fff`, and the label keeps `#fff`. [fixture:
  common/entity-css-in-label] [fixture:
  common/entity-css-in-label-separator-ignored] [fixture:
  common/entity-css-in-label-last-semicolon-ignored] It is so also when the
  label is a string, `A["<span style='color:#f00;font-weight:bold;'>x</span>"]`,
  and in the text of a link,
  `A-- <span style='color:#f00;font-weight:bold;'>t</span> -->B`. [fixture:
  common/entity-css-in-string-label] [fixture: common/entity-css-in-link-text]
  Without a `#` after a `:`, the line does not match, and
  `A[<span style='color:red;font-size:12px'>x</span>]` keeps both its `;`. In
  `A[<span style='color:#35;f00;font-weight:bold'>x</span>]` the line matches,
  so the `;` after `f00` is ignored, and `#35;` is an entity: the label has its
  placeholder followed by `f00font-weight:bold`. [fixture:
  common/entity-css-in-label-no-hash] [fixture:
  common/entity-css-numeric-entity-then-semicolon]
- It ignores only the last `;` of the line. In `style A fill:#f00;B-->C` the
  ignored `;` is the one that separates the two statements, and
  `style A fill:#fff;color:#000;` keeps `#fff;`, which is then an entity. The
  flowchart grammar rejects both. [fixture:
  common/entity-style-semicolon-separator] [fixture:
  common/entity-style-two-colours] `style A fill:#f00; style B fill:#0f0` is one
  statement, because its only `;` is ignored: A has the one style
  `fill:#f00 style B fill:#0f0`, and B none. [fixture:
  common/entity-style-semicolon-between-statements] Two labels on one line share
  the one ignored `;`: in
  `A[<span style='color:#f00;'>a</span>] --> B[<span style='color:#00f;'>b</span>]`,
  it is the one in the label of B, so `#f00;` in the label of A is an entity,
  while on two lines neither label has one. A `;` between two declarations can
  be the ignored one, as in
  `A[<span style='color:#333;font-size:12px'>x</span>]`, whose label has
  `color:#333font-size:12px`, and between two styles, as in
  `classDef c fill:#f00;stroke:#0f0`, which has the one style
  `fill:#f00stroke:#0f0`; `style A fill:#f00;stroke:#0f0;` ignores only its last
  `;`, so `#f00;` is an entity, and the style rejects it. [fixture:
  common/entity-css-two-labels-one-line] [fixture:
  common/entity-css-two-labels-two-lines] [fixture:
  common/entity-css-semicolon-between-declarations] [fixture:
  common/entity-style-last-semicolon-only-ignored] [fixture:
  common/entity-classdef-semicolon-between-styles] The ignored `;` can also lie
  between two styles: `style A fill:#f00;stroke:#0f0` has the one style
  `fill:#f00stroke:#0f0`. [fixture:
  common/entity-style-semicolon-between-styles]
- It is case-sensitive. `linkStyle 0 stroke:#f00;` does not match `style`, so
  `#f00;` is an entity, and the flowchart grammar rejects the line. Without the
  final `;`, or with a colour that is not `#`-prefixed before it, the same line
  is accepted. [fixture: common/entity-linkstyle-colour] [fixture:
  common/entity-linkstyle-colour-no-semicolon] [fixture:
  common/entity-linkstyle-named-colour-semicolon]
- The last `;` may be the separator after a label: `A[style:#x;];` ignores the
  separator, so the `;` in the label stays, `#x;` is an entity, and the label is
  `style:` and the placeholder, also when the label is the string `"style:#x;"`,
  while `A[style:#x;]` ignores the `;` in the label and has the label
  `style:#x`. The line of an accessibility statement is a line like any other:
  `accTitle: style:#x;y;` has the title `style:`, the placeholder, and `y`.
  [fixture: common/entity-style-separator-ignored] [fixture:
  common/entity-style-label-semicolon-ignored] [fixture:
  common/entity-style-separator-ignored-string] [fixture:
  common/entity-style-acc-title]

## Entities

Entities are found from left to right, outside comment regions (for agentflow,
comment regions are not left out, as for the line rule), in the text without its
directives: the characters before and after a directive follow one another, so
an entity can have a directive between two of its characters. Such a directive
lies inside the unit that holds the entity, and the rule of
[A directive is a token boundary](#a-directive-is-a-token-boundary) applies to
it: in a text unit and in a string, the entity is read as in mermaid.js.
[fixture: common/directive-in-entity] [fixture:
flowchart/lex-directive-in-string-entity] An entity consists of these
consecutive characters, where the `;` is not one that the line rule above
ignores:

```text
entity = "#" word ";"
```

Entities do not overlap. `#` is no word character, so `#a#b;` holds one entity,
`#b;`, from the second `#`, and `##a;` holds `#a;`, with the first `#` as text.
A line terminator is no word character either, so `#a` at the end of a line and
`b;` or `;` on a later line, with or without a comment line between them, make
no entity, and neither do `#a`, U+2028, and `b;`, or `#a-b;`, whose `-` is no
word character, while `_` is one, so `#_;` is an entity. A directive right after
the `#` or right before the `;` lies inside the entity, which is read in the
text without its directives, and so do two directives right before the `;`. The
`;` of such an entity is no separator where a `;` ends a statement: in sequence,
`A->>B: x #a`, a directive, and `;B->>A: y` is one message, `x`, the placeholder
of `#a;`, and `B->>A: y`, and so it is with a directive right after the `#` or
between two characters of the word, while `#a`, a comment line, and `;B->>A: y`
make no entity, and the messages are `x` and `y`: in sequence, the text of a
message ends at `#`, which starts a diagram comment that takes the rest of its
line (see
[The statement context](./diagrams/sequence.md#the-statement-context)).
[fixture: common/entity-hash-inside-word-second-hash-starts] [fixture:
common/entity-double-hash] [fixture: common/entity-cut-by-line-terminator]
[fixture: common/entity-not-across-comment-line] [fixture:
common/entity-semicolon-after-comment-line] [fixture:
common/entity-cut-by-line-separator] [fixture: common/entity-hyphen-not-word]
[fixture: common/entity-underscore-word] [fixture:
common/entity-directive-after-hash] [fixture:
common/entity-directive-before-semicolon] [fixture:
common/entity-directive-in-word-in-message] [fixture:
common/entity-directive-after-hash-in-message] [fixture:
common/entity-directive-before-semicolon-in-message] [fixture:
common/entity-two-directives-before-semicolon-in-message] [fixture:
common/entity-not-across-comment-line-in-message]

Lexical rule: the lexer reads an entity as its placeholder. When the word
consists of ASCII digits only, `#` _word_ `;` reads as `ﬂ°°` _word_ `¶ß`;
otherwise it reads as `ﬂ°` _word_ `¶ß`. The characters are U+FB02, U+00B0,
U+00B6, and U+00DF. The lexer matches its unit rules against the placeholder
characters in place of the entity's source characters. The placeholder stands
for the entity's source characters as a whole: none of its characters is read
from one source character of its own. So where a rule of the diagram's lexer
reads one character at a time, and would read each character of a placeholder in
turn as a unit of the same name, it reads the whole placeholder as one unit of
that name, which holds all the source characters of the entity. No rule can
match inside a placeholder there, so this changes no acceptance; in flowchart,
such rules are those of the link text contexts and of the ellipse context. A
rule that would read only the first characters of a placeholder is not changed:
in flowchart, the letter rule reads U+FB02, but no rule reads the U+00B0 after
it, so `A#x;-->B` is rejected. [fixture: flowchart/lex-link-text-entity-dash]
[fixture: flowchart/lex-ellipse-entity-start] [fixture:
flowchart/lex-entity-in-vertex-id] Where the placeholder characters are allowed
depends on the diagram's lexer; in flowchart they are allowed in label text and
rejected in node ids and style values. See each diagram document.

Conversion: an entity is its placeholder in the converted form of a text.
mermaid.js decodes placeholders back into HTML entities only when it renders the
diagram, so the Db holds the placeholder form. The label of `A[a #amp; b]` is
`a ﬂ°amp¶ß b` in the Db, while its value in the tree is `a #amp; b`. [fixture:
common/entity-named] [fixture: common/entity-numeric]

`#+123;` is not an entity, because `+` is not a word character. [fixture:
common/entity-plus]

Entities are found in label text whether or not the line rule matches:
`A[Issue #123; fixed]` has the placeholder of the numeric entity `#123;`, and
`A[<span style='color: #f00; font-weight: bold'>x</span>]`, which the line rule
does not match, has the placeholder of `#f00;`, while `#f00` without a `;`, as
in `A[<span style='color:#f00'>x</span>]`, stays as written. [fixture:
common/entity-css-in-label-spaces] [fixture:
common/entity-css-in-label-no-semicolon] [fixture:
common/entity-numeric-in-label-text] Outside a tag too, `A[color: #f00; is red]`
has the placeholder of `#f00;`. [fixture: common/entity-in-label-outside-tag]

## End of text

Lexical rule: mermaid.js appends `\n` to the text before parsing. The end of the
text therefore behaves as a line terminator for the diagram's grammar: a diagram
whose last statement has no line break is read as if it had one. [fixture:
flowchart/header-only-no-line-break] [fixture: common/cr-only] The appended `\n`
is not part of the source, so it adds no node to the tree.

## Whitespace

Every diagram lexer decides for itself which characters are whitespace. Lexers
built from mermaid.js's patterns usually treat all whitespace as defined in
[Notation](#notation), including U+00A0 and U+FEFF, as whitespace. [fixture:
common/nbsp-as-space] [fixture: common/bom-mid-text]

## Known divergences

These divergences, defined in [known-divergences.md](./known-divergences.md),
concern what this document defines:

- [`directive-as-token-boundary`](./known-divergences/directive-as-token-boundary.md):
  a directive inside a name, a keyword, a delimiter, an arrow, or a number;
- [`html-tag-in-frontmatter`](./known-divergences/html-tag-in-frontmatter.md):
  an HTML tag that starts in the frontmatter;
- [`ignored-semicolon-as-token-boundary`](./known-divergences/ignored-semicolon-as-token-boundary.md):
  an ignored `;` inside a name, a number, a keyword, an arrow, or a delimiter;
- [`embedded-data-opaque`](./known-divergences/embedded-data-opaque.md):
  embedded data, which this specification neither parses nor checks;
- [`c4-keyword-anywhere`](./known-divergences/c4-keyword-anywhere.md): a keyword
  of C4 after the header of another diagram type;
- [`bare-percent-line-before-header`](./known-divergences/bare-percent-line-before-header.md):
  a bare `%%` line before the header where the lexer of mermaid.js rejects it.
