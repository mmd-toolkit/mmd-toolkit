# @mmd-toolkit/textmate-grammar

Japanese version: [README.ja.md](./README.ja.md)

The TextMate grammar that colors Mermaid text in the
[playground](../playground/README.md) and on the
[documentation site](../docs/README.md). The package is private and is not
published.

## What it is

One grammar for the 32 diagram types of the
[specification](../spec/docs/index.md), one for each document of
`packages/spec/docs/diagrams/`, written from the specification alone: agentflow,
architecture, block, c4, class, cynefin, er, eventmodeling, flowchart, gantt,
gitgraph, info, ishikawa, journey, kanban, mindmap, packet, pie, quadrant,
radar, railroad, requirement, sankey, sequence, state, timeline, treemap,
treeview, usecase, venn, wardley, and xychart. It colors every header that the
Detection section of a document accepts, such as the four headers of flowchart
(`graph`, `flowchart`, `flowchart-elk`, `swimlane-beta`), the five of c4, and
the four of railroad.

`grammar/common.grammar.json` holds the rules that every diagram type shares:
the frontmatter (its body colored as YAML), the directives (`%%{ … }%%`), the
`%%` comment lines, the strings with the HTML tags and entities inside them, and
the common `title`, `accTitle` and `accDescr` forms.
`grammar/diagrams/<type>.grammar.json` holds the block of one diagram type,
which begins at its header and gives every unit of the type the scope of its
kind (see [Scopes](#scopes)). `index.js` puts the files together into one
grammar for Shiki, named `mermaid` with the alias `mmd`. The file names end in
`.grammar.json` because the JSON schema check of the repository's lint takes a
schema from SchemaStore by file name, and SchemaStore has schemas for other
files named `block.json` and `info.json`.

Each rule carries a `comment`: first what the rule reads and any position hint,
then the sentences of the specification it follows, each as
`<document>.md#<section>: ` followed by one or more whole sentences exactly as
the specification writes them. Runs of whitespace may be folded to one space;
inline code, links and emphasis stay as written. A quote runs to the next
citation or the end of the comment, so all explanation comes before the first
quote. Fixture marks such as `[fixture: …]` are not part of a quote. The limits
that hold for every rule are stated once, in the `comment` of
`grammar/common.grammar.json`: the grammar reads line by line, does not check
acceptance, does not track where a unit starts after another one on the same
line, and colors a `;` that the line rule of `style` and `classDef` ignores as
the rules around it read it. The quotes of HTML attributes, which the
specification reads as `'`, are read so only inside a double-quoted string or a
label that holds the whole tag, and not where the quote of an attribute lies
inside a directive. A line separator that belongs to a directive is still read
as a place where a comment can start, and a comment inside a string or a block
is colored inside that scope. The comment of a rule states only what it leaves
out beyond these.

A part of a regular expression that several rules need is written once, as a
variable `{{name}}`, after the variables of Sublime Text's sublime-syntax files.
`grammar/common.grammar.json` declares the forms that common.md or detection.md
of the specification defines, such as the whitespace sets (`{{ws}}`, `{{lws}}`,
`{{separators}}`), the directive (`{{directive}}`), and whitespace in which
directives may stand (`{{gap}}`), and the parts of a shared rule that a diagram
rule or a variant of the shared rule also needs; its top-level comment names the
sentence of each. A form that the document of a diagram type defines stays in
that type, written in place or as a variable of its file with a name that starts
with the type and a dash, even where another type spells it the same. A variable
may use other variables. `index.js` substitutes them, and fails to load on an
unknown name, a cycle, a name declared twice, and a name of a diagram file that
does not start with its type.

Where keywords are compared case-insensitively, by the
[notation](../spec/docs/common.md#notation) of the specification an ASCII letter
of a keyword matches only its two ASCII cases: a long s does not match `s`, and
a Kelvin sign does not match `k`. Oniguruma's ignore-case matches them, so the
rules write the keywords in `(?i:…)` groups and `index.js` puts `(?I)`, the
option of Oniguruma that limits ignore-case to ASCII, at the head of every
pattern.

A TextMate grammar was chosen over the tokens of the parser because text under
edit in the playground is often rejected by the parser and would lose its
colors. Shiki's own Mermaid grammar is not used: it knows 15 of the 32 diagram
types, some of them only in part (its C4 rules know four of the five headers,
each with part of the calls that all five accept, and it has no `accTitle` and
no `accDescr`), and colors them as it reads them, not as the specification does.
Writing every diagram type from the specification keeps one source for all the
colors.

## Scopes

Every unit that the specification defines in an accepted input gets the scope of
its kind from this table, in every diagram type. The colors below are those of
github-light; github-dark also gives names, labels, types and keywords four
different colors. The playground and the documentation site use these themes.

| Kind of unit                    | Scope                                                                        | Color      |
| ------------------------------- | ---------------------------------------------------------------------------- | ---------- |
| Header, keyword                 | `keyword.control.mermaid`                                                    | red        |
| Name of an element              | `variable.mermaid`                                                           | orange     |
| Name of a function (a callback) | `entity.name.function.mermaid`                                               | purple     |
| Label or text (unquoted)        | `string.unquoted.mermaid`                                                    | dark blue  |
| Quoted string                   | `string.quoted.double.mermaid`, `string.quoted.single.mermaid`               | dark blue  |
| Markdown string                 | `string.quoted.other.markdown.mermaid`                                       | dark blue  |
| Type                            | `entity.name.type.mermaid`                                                   | purple     |
| Key or modifier                 | `storage.modifier.mermaid`                                                   | red        |
| Style property name             | `support.type.property-name.mermaid`                                         | blue       |
| Style property value            | `support.constant.property-value.mermaid`                                    | blue       |
| Number                          | `constant.numeric.mermaid`                                                   | blue       |
| Fixed value                     | `constant.language.mermaid`                                                  | blue       |
| Escape                          | `constant.character.escape.mermaid`                                          | blue       |
| Arrow or relation               | `keyword.operator.arrow.mermaid`                                             | red        |
| Other operator                  | `keyword.operator.mermaid`                                                   | red        |
| Shape delimiter                 | `keyword.operator.shape.begin.mermaid`, `keyword.operator.shape.end.mermaid` | red        |
| Block delimiter                 | `keyword.operator.block.begin.mermaid`, `keyword.operator.block.end.mermaid` | red        |
| Other delimiter                 | `punctuation.definition.<what>.begin.mermaid`, `….end.mermaid`               | text color |
| List or argument bracket        | `punctuation.section.<what>.begin.mermaid`, `….end.mermaid`                  | text color |
| Separator                       | `punctuation.separator.<name>.mermaid`                                       | text color |
| Comment                         | `comment.line.<mark>.mermaid`, `comment.block.mermaid`                       | gray       |
| Text no rule reads              | `comment.block.ignored.mermaid`                                              | gray       |
| Directive                       | `meta.directive.mermaid`                                                     | see below  |
| Frontmatter                     | `meta.embedded.block.yaml`                                                   | YAML       |
| Data block                      | `meta.data.mermaid`                                                          | see below  |

What each kind holds:

- A name of an element is an identifier that the diagram defines or refers to: a
  node id, an edge id, an entity, an attribute name, a state, a participant or
  actor id, a class where it stands as an element of the diagram, a member name,
  a task id, a commit id, a branch, a rule name, or the name of a class of
  styles (`classDef` name, `:::name`, `class A name`). Where the specification
  reads one text as both the id and the shown text of an element, such as a bare
  mindmap node, the text is a label.
- A name of a function is a callback that a statement calls.
- A label or text is any text that the diagram shows or keeps: the label of a
  node or an edge, a relation's label, a message, a note, a title, a
  description, an accessibility value, the text of a task. In quotes, it has the
  scope of the string.
- A type is the type of an attribute or a member, a return type, a generic
  argument, or a class name where it stands as a type.
- A key or modifier is a word or mark that qualifies a member or an attribute:
  `PK`, `FK`, `UK`, a visibility, a classifier, a stereotype.
- A style property is one `name:value` of a style: `fill:#43a047` has the name
  `fill` and the one value `#43a047`, nothing inside which is a number.
- A fixed value is a word that the specification lists as a value: a direction
  (`TD`, `LR`, …), an orientation, `true` and `false`.
- A shape delimiter is a bracket that chooses the shape of a node, such as the
  `((` and `))` of a circle in flowchart and mindmap, the `[` and `]` of a
  kanban item, or the `{{` and `}}` of a hexagon. A block delimiter is a brace
  or bracket that opens and closes a block of statements, members or attributes,
  such as the `{` of a composite state, an ER entity or a class body. Keywords
  that open and close a block, such as `subgraph` and `end`, stay keywords.
  Shape and block delimiters carry meaning when the diagram is read, so they
  have a color.
- Other delimiters (quotes, label delimiters such as `|`, comment and directive
  marks), the brackets of a list or of arguments, and separators (`:`, `,`, `;`,
  `:::`) keep the text color.
- Text that no rule reads is text that the specification reads as nothing:
  hidden YAML, a hidden directive, ignored text.
- In a directive, the name is `entity.name.function.directive.mermaid` (purple),
  the argument `string.unquoted.directive.mermaid` (dark blue), and the marks
  `punctuation.definition.directive.begin.mermaid` and `….end`.
- In a data block (`@{ … }`), the braces are
  `punctuation.section.data.begin.mermaid` and `….end`, a key is a style
  property name, and a value has the scope of its kind.
- An HTML tag and an entity inside a text keep the scope of the text.

## Using it

A highlighter loads the grammar together with the grammar it embeds, `yaml` for
the frontmatter:

```js
import mermaid from "@mmd-toolkit/textmate-grammar"

const highlighter = await createHighlighterCore({
  langs: [mermaid, yaml],
  // themes, engine
})
```

In VitePress, the setting is `markdown.languages: [mermaid, "yaml"]`. Do not
also list `mermaid` by name: Shiki's bundled language of that name, listed after
it, replaces it.

The grammar needs Shiki's Oniguruma engine (`createOnigurumaEngine`), which is
also the engine that `createHighlighter` and VitePress use by default. Shiki's
JavaScript engine rejects the option `(?I)`.

## Tests

`pnpm --filter @mmd-toolkit/textmate-grammar test` tokenizes fixed inputs with
Shiki:

- For each diagram type, one input under `tests/fixtures/` (railroad has one for
  each of its four grammars), written from the sentences of the specification
  that name the keywords of the type and accepted by the parser. Its
  `.expected.json` names the scopes of the header, of every keyword rule of the
  block, of `accTitle` and `accDescr`, and the boundary cases where a token must
  not get a scope; the test checks them and compares all the tokens with the
  `.tokens` record. Inputs that need a character that the repository keeps out
  of fixture files, such as a line separator, are written with escapes in the
  `escapedInputs` of the `.expected.json` and checked the same way, without a
  record.
- For every header spelling, the minimal input of each entry of
  [detection.md](../spec/docs/detection.md) and the corpus fixtures of the
  further spellings that the documents of the diagram types accept: the header
  is colored as a keyword.
- Fixed inputs for the leading trivia (the frontmatter, a directive and a
  comment line before the header) and for the boundary cases of the shared
  rules.

`pnpm run test:update` in the package rewrites the `.tokens` records after a
change of the grammar; read the rewritten records before keeping them.

## Changing it

A rule changes with the sentence it cites: change the rule, its `comment`, the
fixture of the diagram type if the sentence names a case that the fixture does
not hold, and its `.expected.json`. A diagram type added to the specification
gets a file `grammar/diagrams/<type>.grammar.json`, its import and its place in
the list of `index.js` (in the order of detection.md), and its fixture,
`.expected.json` and `.tokens` record.
