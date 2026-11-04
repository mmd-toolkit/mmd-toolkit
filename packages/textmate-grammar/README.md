# @mmd-toolkit/textmate-grammar

Japanese version: [README.ja.md](./README.ja.md)

A TextMate grammar for the Mermaid diagram syntax (`.mmd`). It colors the 32
diagram types of the [specification](../spec/README.md) of mmd-toolkit: their
headers and keywords, the names of elements, labels, types, shapes, styles,
comments and directives, and the frontmatter as YAML. Every rule is written from
the specification, so the forms people write are colored as the kinds of unit
that the specification reads there; [Limits](#limits) states where the grammar
colors otherwise.

It is a third-party project, not affiliated with mermaid-js.

## Playground

The [Playground](https://mmd-toolkit.github.io/mmd-toolkit/playground/) colors
its editor with this grammar, and the
[documentation site](https://mmd-toolkit.github.io/mmd-toolkit/) its Mermaid
code blocks.

## Installation

```sh
npm install @mmd-toolkit/textmate-grammar
```

It is an ES module and needs Node.js `^20.19.0 || ^22.13.0 || >=24`.

## What the package contains

- The default export of `@mmd-toolkit/textmate-grammar`: a Shiki language
  registration (`LanguageRegistration`), named `mermaid`, with the alias `mmd`.
- `@mmd-toolkit/textmate-grammar/mermaid.tmLanguage.json`: the same grammar as a
  TextMate grammar file, with the scope name `source.mermaid`, for VS Code and
  other TextMate hosts.

## What a host needs

The grammar is written for the Oniguruma regular expression engine.

- Shiki's Oniguruma engine (`createOnigurumaEngine`) reads it. It is the engine
  that `createHighlighter` and VitePress use by default.
- VS Code reads it: it tokenizes TextMate grammars with Oniguruma.
- Shiki's JavaScript engine (`createJavaScriptRegexEngine`) reads it too; its
  first coloring takes longer.

The grammar also needs a YAML grammar with the scope name `source.yaml`, which
colors the body of the frontmatter. In Shiki, load the language `yaml` with it;
without it, Shiki throws an error that `yaml` is missing. VS Code has a YAML
grammar built in.

## Usage

### Shiki

```js
import { createHighlighter } from "shiki"
import mermaid from "@mmd-toolkit/textmate-grammar"

const highlighter = await createHighlighter({
  themes: ["github-light"],
  langs: [mermaid, "yaml"],
})

const html = highlighter.codeToHtml("flowchart LR\n  A[Start] --> B", {
  lang: "mermaid",
  theme: "github-light",
})
```

`lang: "mmd"` names the same language. Do not also list `"mermaid"` by name:
Shiki bundles a Mermaid grammar of its own under that name, and of two languages
named `mermaid`, the one listed later is used.

With the fine-grained bundle (`createHighlighterCore`), pass the YAML language
of `shiki/langs/yaml.mjs` and the engine
`createOnigurumaEngine(import("shiki/wasm"))`.

### VitePress

```js
// .vitepress/config.js
import mermaid from "@mmd-toolkit/textmate-grammar"

export default {
  markdown: {
    languages: [mermaid, "yaml"],
  },
}
```

Code blocks marked `mermaid` or `mmd` are then colored with this grammar. As
with Shiki, do not also list `"mermaid"` by name.

### Monaco Editor

With [`@shikijs/monaco`](https://shiki.style/packages/monaco), create a Shiki
highlighter that holds the grammar, as above, register the language with Monaco
(`monaco.languages.register({ id: "mermaid" })`), and then call
`shikiToMonaco(highlighter, monaco)`; Monaco then colors the models of the
language `mermaid` with the grammar.

### VS Code extension

Add this package to the extension's `dependencies`, then register the grammar in
its `package.json`.
[`vsce`](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#using-.vscodeignore)
includes production dependencies in the VSIX by default, so `path` can point
directly into `node_modules`:

```json
{
  "contributes": {
    "languages": [
      {
        "id": "mermaid",
        "aliases": ["Mermaid"],
        "extensions": [".mmd", ".mermaid"]
      }
    ],
    "grammars": [
      {
        "language": "mermaid",
        "scopeName": "source.mermaid",
        "path": "./node_modules/@mmd-toolkit/textmate-grammar/lib/mermaid.tmLanguage.json"
      }
    ]
  }
}
```

`path` is relative to the extension root. If you use `.vscodeignore`, keep this
grammar file included.

To include only the grammar file, you can instead add the package to
`devDependencies` and copy its `lib/mermaid.tmLanguage.json` to
`syntaxes/mermaid.tmLanguage.json` in the extension. Set `path` to
`"./syntaxes/mermaid.tmLanguage.json"`.

### Other TextMate hosts

Hosts such as vscode-textmate with vscode-oniguruma load
`mermaid.tmLanguage.json` as the grammar of `source.mermaid`, together with a
YAML grammar for `source.yaml`.

## Scopes

A theme colors the grammar by the scopes of its tokens. In the forms people
write, a unit that the specification defines gets the scope of its kind from
this table, in every diagram type; [Limits](#limits) states the rest. The colors
are for reading: where the specification reads one text as a single unit and a
reader sees a structure in it, such as the properties of a style, the keys and
values of a data block, or the type and the name of a class member, each part
gets the scope of its kind. The colors below are those of Shiki's theme
github-light; github-dark also gives names, labels, types and keywords four
different colors. The playground and the documentation site use these themes.

| Kind of unit                    | Scope                                                                        | Color     |
| ------------------------------- | ---------------------------------------------------------------------------- | --------- |
| Header, keyword                 | `keyword.control.mermaid`                                                    | red       |
| Name of an element              | `variable.mermaid`                                                           | orange    |
| Name of a function (a callback) | `entity.name.function.mermaid`                                               | purple    |
| Label or text (unquoted)        | `string.unquoted.mermaid`                                                    | dark blue |
| Quoted string                   | `string.quoted.double.mermaid`, `string.quoted.single.mermaid`               | dark blue |
| Markdown string                 | `string.quoted.other.markdown.mermaid`                                       | dark blue |
| Type                            | `entity.name.type.mermaid`                                                   | purple    |
| Key or modifier                 | `storage.modifier.mermaid`                                                   | red       |
| Property name                   | `support.type.property-name.mermaid`                                         | blue      |
| Style property value            | `support.constant.property-value.mermaid`                                    | blue      |
| Number                          | `constant.numeric.mermaid`                                                   | blue      |
| Fixed value                     | `constant.language.mermaid`                                                  | blue      |
| Escape                          | `constant.character.escape.mermaid`                                          | blue      |
| Arrow or relation               | `keyword.operator.arrow.mermaid`                                             | red       |
| Other operator                  | `keyword.operator.mermaid`                                                   | red       |
| Shape delimiter                 | `keyword.operator.shape.begin.mermaid`, `keyword.operator.shape.end.mermaid` | red       |
| Block delimiter                 | `keyword.operator.block.begin.mermaid`, `keyword.operator.block.end.mermaid` | red       |
| Other delimiter                 | `keyword.operator.delimiter.<what>.begin.mermaid`, `….end.mermaid`           | red       |
| List or argument bracket        | `keyword.operator.bracket.<what>.begin.mermaid`, `….end.mermaid`             | red       |
| Separator                       | `keyword.operator.separator.<name>.mermaid`                                  | red       |
| Comment                         | `comment.line.<mark>.mermaid`, `comment.block.mermaid`                       | gray      |
| Text no rule reads              | `comment.block.ignored.mermaid`                                              | gray      |
| Directive                       | `meta.directive.mermaid`                                                     | see below |
| Frontmatter                     | `meta.embedded.block.yaml`                                                   | YAML      |
| Data block                      | `meta.data.mermaid`                                                          | see below |

A `meta.*` scope wrapping a structure carries no color of its own; the units
inside it have the scopes of their kinds.

What each kind holds:

- A name of an element is an identifier that the diagram defines or refers to: a
  node id, an edge id, an entity, an attribute name, a state, a participant or
  actor id, a class where it stands as an element of the diagram, a member name,
  a task id (`a1` in `:a1, 2014-01-01, 30d` and in `after a1`), a commit id, a
  branch, a rule name, or the name of a class of styles (`classDef` name,
  `:::name`, `class A name`). Where the specification reads one text as both the
  id and the shown text of an element, such as a bare mindmap node or the name
  of a flowchart subgraph, the text is a label. er reads the name of a subgraph
  as an id, apart from its title, so there it is a name. State's `[*]`, the
  start or the end, is a keyword, not a name.
- A name of a function is a callback that a statement calls.
- A label or text is any text that the diagram shows or keeps: the label of a
  node or an edge, a relation's label, a message, a note, a title, a
  description, an accessibility value, the text of a task, the name of an icon.
  In quotes, it has the scope of the string.
- A type is the type of an attribute or a member, such as `String` in
  `+String name` and `float` in `+pay(float amount)`, a return type, a generic
  argument, a class name where it stands as a type, or the free name inside `<<`
  and `>>`, such as a class annotation or a usecase stereotype.
- A key or modifier is a word or mark that qualifies a member or an attribute:
  `PK`, `FK`, `UK`, a visibility, a classifier.
- A property name is the name of a style property, or the key of a key-value
  pair: a key of a data block, the key of a named attribute of C4 (`$key=`), the
  property of a flowchart rectangle written with `[|` (`[|borders:lt|text]`,
  whose value `lt` is a text).
- A style property is one `name:value` of a style: `fill:#43a047` has the name
  `fill` and the one value `#43a047`, nothing inside which is a number. A style
  without `:`, such as `bold` or `#fff`, is one value, the whole style; a style
  with an empty name, such as `:red`, is a separator and a value.
- A fixed value is a word that the specification lists as a value: a direction
  (`TD`, `LR`, …), an orientation, a gantt tag (`done`, `crit`, …), `true` and
  `false`, and `null` in a data block.
- A sankey value is a number when the whole field is an unsigned whole number or
  decimal, such as `3000` or `0.597`; any other value, such as `-1`, is a text.
- A shape delimiter is a bracket that chooses the shape of a node, such as the
  `((` and `))` of a circle in flowchart and mindmap, the `[` and `]` of a
  kanban item, or the `{{` and `}}` of a hexagon. A block delimiter is a brace
  or bracket that opens and closes a block of statements, members or attributes,
  such as the `{` of a composite state, an ER entity or a class body. Keywords
  that open and close a block, such as `subgraph` and `end`, stay keywords.
- Other delimiters (label delimiters such as `|`, directive marks, the `~` of a
  generic type), the brackets of a list or of arguments, and separators (`:`,
  `,`, `;`, `:::`) have the operator color, as shape and block delimiters do, so
  that the structure of a line stands out. The `:` between a property name and
  its value is `keyword.operator.separator.key-value.mermaid`. The quotes of a
  string are `punctuation.definition.string.begin.mermaid` and `….end` inside
  the string's scope, and the themes color them as the string; the mark of a
  comment is part of the comment.
- Text that no rule reads is text that the specification reads as nothing:
  hidden YAML, a hidden directive, ignored text.
- In a directive, the name is `entity.name.function.directive.mermaid` (purple),
  the argument `string.unquoted.directive.mermaid` (dark blue), the `:` after
  the name `keyword.operator.separator.colon.mermaid`, and the marks
  `keyword.operator.delimiter.directive.begin.mermaid` and `….end`, also where
  the directive stands inside a string, a label or ignored text.
- In a data block (`@{ … }`), the braces are
  `keyword.operator.bracket.data.begin.mermaid` and `….end`. A key, bare or
  quoted, is a property name, and a `,` is a separator. A value has the scope of
  its kind: a quoted value is a string, a whole number or a decimal such as
  `60`, `-1` or `20.4` is a number, `true`, `false` and `null` are fixed values,
  and any other value, such as `rect` in `shape: rect`, `1e3`, or a number
  inside an array, is a text. The documents of kanban, flowchart, agentflow,
  sequence and eventmodeling, and usecase's for its JSON value, read the
  interior as one text; the grammar colors the keys and values that a reader
  sees in it, and the block ends at the `}` that the type's document says.
- An HTML tag and an entity inside a text keep the scope of the text.

## Diagram types

agentflow, architecture, block, c4, class, cynefin, er, eventmodeling,
flowchart, gantt, gitgraph, info, ishikawa, journey, kanban, mindmap, packet,
pie, quadrant, radar, railroad, requirement, sankey, sequence, state, timeline,
treemap, treeview, usecase, venn, wardley, and xychart: one for each document of
the specification under [`docs/diagrams/`](../spec/docs/diagrams/). A diagram
begins at any header that the Detection section of its document accepts, such as
the four headers of flowchart (`graph`, `flowchart`, `flowchart-elk`,
`swimlane-beta`), the five of c4, and the four of railroad, and the rules of
that diagram type color the text from there to its end.

The grammar follows version 0.1.0 of the specification (the git tag
`@mmd-toolkit/spec@0.1.0`), which follows mermaid 12.2.0.

## Limits

The grammar colors text without parsing it, so it does not always color a unit
as the specification reads it:

- It reads line by line. A form that the grammar reads with one pattern is read
  only on the line where it starts: when its parts cross a line break, such as a
  keyword and a value that starts on the next line, the parts on the next line
  are colored by the rules around them. A keyword alone on its line is colored
  as a keyword where the line decides that it is one; where the next line
  decides, the word is colored by the rules around it: in er, `direction` is a
  keyword before `LR` and a name before `A`. Forms that it reads from an opening
  delimiter to a closing one go on over lines, such as a quoted label of
  flowchart and the free-text argument of a directive. A reading that depends on
  other lines is not known on one line: in treeview, a line of vertical bars
  alone is box decoration only when another line of the tree holds a box-drawing
  character (`─`, `━`, `│`, `┃`, `└`, `┗`, `├` or `┣`; comment lines, title and
  accessibility lines and other lines of bars alone do not count), and the
  grammar always colors such a line as decoration.
- It does not check that the text is accepted. Rejected text, such as an
  unclosed form, a required value left empty, a character that a unit does not
  admit, or a wrong count, may be colored as if it were accepted, and a bracket
  or a block without its closer colors the rest of the text as its inside. The
  [parser](../parser/README.md) and the [linter](../eslint-plugin/README.md)
  tell whether a diagram is valid.
- After a unit, a further statement or unit on the same line is recognized only
  at the positions a rule names: the start of the line, right after the header,
  right after the `}%%` that closes a directive, right after a closing
  delimiter, or, in some diagram types, after a complete unit, as `title` after
  `showData` in pie. A statement after a directive that has no `}%%` (one that
  ends after a word argument, as `%%{init: dark title t` in treeview) may not be
  recognized.
- The specification reads a lone carriage return (CR) as a line end, but Shiki
  splits a text into lines only at LF and CRLF. A lone CR that stays inside a
  line is no line end for the grammar: a value may go on over it, and a
  statement after it may not be recognized.
- A keyword compared case-insensitively also matches the few characters outside
  ASCII that fold to its letters, as `deſtroy` matches `destroy`. The
  specification reads them as no keyword
  ([Notation](../spec/docs/common.md#notation)).
- The specification reads the `"` of a quoted HTML attribute value as `'`. The
  grammar does so only inside a double-quoted string or a label that holds the
  whole tag; it reads the quotes as written where the tag begins in an earlier
  unit of the line, where a changed quote would end or start a single-quoted
  string, and where the quote lies inside a directive.
- A `;` that the line rule of `style` and `classDef` ignores is colored as the
  rules around it read it. A `;` between the properties of a style, as in
  `fill:#f96;stroke:#333`, is colored differently from one diagram type to
  another.
- A class member, the name of a method and a parameter are divided into a type
  and a name only in the forms `Type name` and `name : Type`. A lone word is a
  name, unless it holds `~` or `[]`, which makes it a type. A text of more
  words, such as `+a b c`, or with a `=` keeps one color.
- In gantt, an item is colored as the id of its task when it is the first item
  after the tags and exactly two more items follow it on its line. A task with
  four items or more, with an empty item, or with a directive or an entity in
  any of its items has no item colored as the id of its task, and an item that
  holds a directive or an entity stays text, also after `after` or `until`.
- In a data block, text that looks like `key: value` at the start of a line or
  after a `,` is colored as a key and a value, and a `,` is colored as a
  separator, also inside a plain value of a block over lines
  (`label: Hello, world`), inside a longer YAML value, and in the data of an
  eventmodeling tag such as `md` or `text`. A `{`, `}`, `[` or `]` nested inside
  the data is colored as text.
- A line separator or paragraph separator that belongs to a directive is still
  read as a place where a comment line can start. A comment line inside a
  string, a label or a block is colored as a comment; where the value has one
  open scope, the comment sits inside it, although it is not part of the value.
- A `%%{` at the end of a line is colored as the opener of a directive, as it is
  when the next line starts with the directive's name; where the next line does
  not start with a word, the specification reads the `%%{` line as a comment
  line. A free-text argument of a directive that stops at a line separator or a
  paragraph separator, with the closing `}%%` on the next line, leaves that
  `}%%` uncolored as the directive's end.
- Before the header, a `---` line starts the frontmatter even where it is not
  the first line of the text.
- Hidden YAML and hidden directives inside the bodies of some diagram types are
  colored as comments.
- In a double-quoted string, a backslash before the `<` of an HTML tag is
  colored as text, not as an escape: the tag is read in the text as written, and
  its quotes decide where the string ends.

## Documentation

- [The specification](../spec/README.md): the syntax that the grammar follows.
- [docs/development.md](./docs/development.md): how the grammar is written,
  built and tested.
