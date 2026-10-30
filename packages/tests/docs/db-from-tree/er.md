# Building the ER Db from the tree

Japanese version: [er.ja.md](./er.ja.md)

The steps that build the Db summary of an ER diagram from its tree, which
`src/db-from-tree/er.ts` implements (see [db-from-tree.md](../db-from-tree.md)).
The syntax and the tree are defined by the specification in
[diagrams/er.md](../../../spec/docs/diagrams/er.md) and
[ast/er.md](../../../spec/docs/ast/er.md); the fields of the summary are in
[db-summaries.md](../db-summaries.md#er).

mermaid.js builds the Db while it parses: the grammar calls a method of the Db
for each statement as the statement ends
([`addEntity`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/er/erDb.ts#L61-L81),
[`addAttributes`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/er/erDb.ts#L95-L110),
[`addRelationship`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/er/erDb.ts#L120-L154),
[`addCssStyles`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/er/erDb.ts#L182-L207),
[`addClass`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/er/erDb.ts#L209-L227),
[`addSubGraph`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/er/erDb.ts#L229-L297),
[`setClass`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/er/erDb.ts#L303-L319)),
and the action of the rule of the statement returns a value, which the subgraph
around it may list
([`statement`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/er/parser/erDiagram.jison#L121-L198)).
The summary is built the same way: the statements are executed in source order,
and the lists the Db holds are the summary. Values are kept as the Db holds
them, whitespace included. No id is made at random, and nothing is taken from
the layout data.

## Building the summary from the tree

**Converted form.** Each value is read in
[converted form](../../../spec/docs/common.md#reading-a-source), so an entity is
its placeholder, in a name as in a text: `A#amp; ||--o{ B : x` is a relationship
from the entity `Aﬂ°amp¶ß`, and the same holds in a quoted name, an alias, a
role, bare or quoted, the comment and the backquoted word of an attribute, a
class name, a style, the id and the title of a subgraph, and the accessibility
texts. The same form has each line terminator, `\r\n` and a lone `\r` too, as
`\n`, in a backquoted word, a comment, and a role string, and each attribute
quote as `'`, in a quoted name, a role string, and a comment; U+2028 is no line
terminator and stays in a value. [fixture: er/entity-placeholder-in-name]
[fixture: er/entity-placeholder-in-quoted-name] [fixture: er/db-alias-entity]
[fixture: er/db-role-entity] [fixture: er/db-role-quoted-entity] [fixture:
er/db-attribute-comment-entity] [fixture: er/db-attribute-backquoted-entity]
[fixture: er/db-class-name-entity] [fixture: er/db-style-entity] [fixture:
er/db-class-def-entity] [fixture: er/db-subgraph-id-entity] [fixture:
er/db-subgraph-title-entity] [fixture: er/db-acc-title-entity] [fixture:
er/db-acc-descr-entity] [fixture: er/db-acc-descr-block-entity] [fixture:
er/db-attribute-backquoted-crlf] [fixture: er/db-attribute-comment-crlf]
[fixture: er/db-attribute-comment-lone-cr] [fixture: er/db-role-string-crlf]
[fixture: er/db-entity-name-attribute-quote] [fixture:
er/db-role-attribute-quote] [fixture: er/db-attribute-comment-attribute-quote]
[fixture: er/db-attribute-comment-line-separator]

**Texts.** The text of a leaf node of the tree is read as follows.

- An ErIdentifier has the converted form of its range. Its `name` is the written
  text, which the tree keeps, and the Db has the text as mermaid.js reads it. So
  `A`, U+00A0, and `B` is one name with the no-break space in it, and a number
  such as `12` or `2.5` is the name with those digits. [fixture:
  er/db-entity-name-no-break-space] [fixture: er/db-entity-name-line-separator]
  [fixture: er/db-entity-name-numbers] [fixture: er/db-alias-line-separator]
- A StringLiteral has the converted form of its range without the delimiters,
  the quotes of a quoted name, a role, and a comment, and the backquotes of a
  word of an attribute, so `"A B"` is the name `A B`, and the id of its entity
  is `entity-A B-0`. A quoted name and the bare name with the same text are one
  entity. [fixture: er/db-entity-name-quoted-spaces] [fixture:
  er/db-entity-name-quoted-same-as-bare] [fixture:
  er/db-entity-name-quoted-line-separator] [fixture: er/db-role-quoted]
  [fixture: er/db-attribute-backquoted] [fixture:
  er/db-attribute-comment-spaces]
- A directive inside a string or a text unit is not in the converted form, and
  so not in the text: the role `x%%{init: {}}%%y` is `xy`. A comment line inside
  a string is not either. [fixture: er/lex-directive-in-role-string] [fixture:
  er/lex-directive-in-quoted-name] [fixture: er/lex-directive-in-comment-string]
  [fixture: er/lex-directive-in-backquoted-word] [fixture:
  er/lex-directive-in-tilde-word] [fixture: er/lex-directive-in-acc-title]
  [fixture: er/lex-directive-in-acc-descr-block] [fixture:
  er/tokens-comment-line-in-role-string] [fixture:
  er/tokens-comment-line-in-comment-string] [fixture:
  er/tokens-comment-line-in-backquoted-word]
- A `;` that the line rule ignores is not in the converted form either, inside a
  string or a text, so a quoted name, an alias, a comment, a role, and a title
  of a subgraph hold the text without it. At a name, a number, a key, or a word
  of an attribute block the `;` cuts the unit, and the input is rejected (see
  [Known divergences](../../../spec/docs/diagrams/er.md#known-divergences)).
  [fixture: er/db-entity-name-quoted-ignored-semicolon] [fixture:
  er/db-alias-ignored-semicolon] [fixture:
  er/db-subgraph-title-ignored-semicolon] [fixture:
  er/db-attribute-comment-ignored-semicolon] [fixture:
  er/tokens-ignored-semicolon-after-role] [fixture:
  er/tokens-ignored-semicolon-in-role-string] [fixture:
  er/div-ignored-semicolon-in-name] [fixture: er/div-ignored-semicolon-in-key]
  [fixture: er/div-ignored-semicolon-in-attribute-word]
- The value of a style is the converted forms of the tokens inside its
  ErLiteral, joined. The whitespace between the units of a style is no token, so
  it is no part of the value: `classDef a fill : #f9f` defines `fill:#f9f`, and
  `classDef a fill:red stroke:blue` the one style `fill:redstroke:blue`, while a
  whitespace character that belongs to a unit, such as U+2028, stays. An entity
  inside a style is its placeholder, and the `;` that the line rule ignores is
  not in the value. [fixture: er/lex-classdef-style-spaces] [fixture:
  er/lex-classdef-styles-joined] [fixture: er/lex-style-styles-joined] [fixture:
  er/db-class-def-line-separator] [fixture: er/db-style-line-separator]
  [fixture: er/db-style-ignored-semicolon-last-only] [fixture:
  er/db-class-def-ignored-semicolon] [fixture: er/lex-directive-in-style-text]
- The text of an accessibility statement is the converted form of the range of
  its ErLiteral without the whitespace at its ends, as mermaid.js trims it.
  [fixture: er/db-acc-title-trailing-space] [fixture: er/db-acc-title-spaces]
  [fixture: er/lex-acc-descr-block-trailing-spaces]

**The walk.** The statements of a body are executed in source order, and a
statement changes the Db and returns values. The returned values matter to a
subgraph alone (see **Subgraphs**), which lists the values of the statements of
its body: an entity statement returns its name; a relationship statement the
name of its left entity and then of its right one; a subgraph statement its id;
a `classDef`, `class`, or `style` statement its keyword, as written, which is
the text of the first token of the statement; an `accTitle` or `accDescr`
statement and a description block with text its text without the whitespace at
its ends; and a direction statement and a description block without text none. A
comment line, a directive line, an empty line, and a line of whitespace between
statements are no statements. An empty description block between two entities
leaves both executed. [fixture: er/db-comment-line] [fixture:
er/db-directive-line] [fixture: er/db-empty-line] [fixture:
er/db-whitespace-line] [fixture: er/gram-empty-description-block-between-names]
[fixture: er/header-empty-description-block]

**Entities.** The entities are kept by name, in the order in which a statement
first names them.

- An entity statement adds the entity of its name when there is none, then gives
  it the alias, then adds its attributes, then its classes. A relationship
  statement adds the entity of its left name and then that of its right name,
  then the relationship, then the classes of the left entity and then those of
  the right one. A `class` statement, a `style` statement, and a `classDef`
  statement add none. [fixture: er/db-name-twice] [fixture:
  er/db-class-undefined-entity] [fixture: er/db-style-undefined-entity]
  [fixture: er/db-class-def-unused]
- The `id` of a new entity is `entity-<name>-<number>`, where the number is how
  many entities existed when it was made: they are numbered from 0 in the order
  of their first appearance, wherever it is, in a relationship, an entity
  statement with an alias, classes, or a block, and the body of a subgraph.
  Names are case-sensitive. [fixture: er/basic-entity] [fixture:
  er/db-entity-ids-first-appearance] [fixture: er/db-entity-ids-statement-kinds]
  [fixture: er/db-entity-names-case]
- A relationship from an entity to itself has the same `id` at both ends.
  [fixture: er/db-entity-relationship-self] [fixture: er/db-relationship-self]
- An entity may have the name of a subgraph, before it or after it: both exist.
  [fixture: er/db-subgraph-id-as-name-after] [fixture:
  er/db-subgraph-id-as-name-before]
- `alias` is the text of the alias of the statement, or the empty text. A
  statement adds its alias to an entity that has none, also to one that a
  relationship made, and never changes one that has an alias; a statement
  without an alias changes nothing. [fixture: er/db-alias-first-kept] [fixture:
  er/db-alias-set-after-entity] [fixture: er/db-alias-after-relationship]
  [fixture: er/db-alias-after-plain] [fixture: er/db-alias-second-ignored]
  [fixture: er/db-alias-forms] [fixture: er/db-alias-with-attributes] [fixture:
  er/db-alias-with-class] [fixture: er/db-alias-empty-block] [fixture:
  er/db-alias-first-kept-directive-line]

**Attributes.** An entity statement with a block appends the attributes of the
block, in the written order, to those the entity has, so the attributes of two
blocks of one entity add up, also an attribute of the same name, and a block
without attributes adds none. An item of the block that is an ErIgnoredText, an
`empty-backquotes` unit, is no attribute. A comment line, a directive line, an
empty line, and a line of whitespace in a block are no text, and `direction RL`
in a block is an attribute. [fixture: er/db-attribute-order] [fixture:
er/db-attribute-blocks-add-up] [fixture: er/db-block-twice] [fixture:
er/db-attribute-block-empty] [fixture:
er/db-attribute-block-empty-after-attributes] [fixture:
er/db-attribute-block-entity-from-relationship] [fixture:
er/db-attribute-block-one-line] [fixture:
er/db-attribute-blocks-add-up-comment-line] [fixture:
er/gram-empty-backquotes-between-attributes] [fixture:
er/gram-empty-backquotes-before-first] [fixture:
er/gram-empty-backquotes-after-last] [fixture: er/gram-empty-backquotes-alone]
[fixture: er/gram-empty-backquotes-twice] [fixture:
er/db-attribute-block-comment-line] [fixture:
er/db-attribute-block-directive-line] [fixture:
er/db-attribute-block-empty-line] [fixture:
er/db-attribute-block-whitespace-line] [fixture: er/db-attribute-block-crlf]
[fixture: er/db-attribute-block-cr] [fixture:
er/db-attribute-block-direction-text]

An attribute has these four values.

- `type` is the text of its `dataType`, with `?` appended when `optional` is
  true. The word may carry a length, generic marks, brackets, and `_`, `-`, `.`;
  a tilde word keeps its inner whitespace; a backquoted word has no backquotes,
  and may hold spaces; U+2028 inside a word stays. [fixture:
  er/db-attribute-type-question-mark] [fixture: er/db-attribute-type-length]
  [fixture: er/db-attribute-type-generic] [fixture:
  er/db-attribute-type-brackets] [fixture: er/db-attribute-name-characters]
  [fixture: er/db-attribute-backquoted] [fixture:
  er/db-attribute-name-line-separator] [fixture: er/lex-backquote-optional]
  [fixture: er/lex-tilde-then-optional-mark] [fixture:
  er/lex-tilde-space-inside]
- `name` is the text of its `name`. [fixture: er/db-attribute-order] [fixture:
  er/db-attribute-backquoted]
- `keys` are the texts of its keys, in order, as written, a repeated key twice,
  and the empty list when there is none. [fixture: er/db-attribute-keys]
  [fixture: er/db-attribute-keys-case] [fixture: er/db-attribute-defaults]
- `comment` is the text of its comment between the quotes, with its spaces, the
  empty text when the comment is empty, and the empty text when there is none.
  [fixture: er/db-attribute-comment-with-keys] [fixture:
  er/db-attribute-comment-spaces] [fixture: er/db-attribute-comment-empty]
  [fixture: er/db-attribute-defaults]

**Classes and styles.** A statement adds classes or styles to **the targets of a
name**: the entity of the name, when the Db has one at that point, and the
subgraph of the name, when the Db has one at that point. A name that is neither
gets nothing, and is not made: a statement before the entity or the subgraph
changes nothing for it. When two subgraphs have the id, the subgraph is the last
one that ended before the statement. A name that is both gets the classes in its
entity and in its subgraph. The name is read as the text of its node, and the id
of a subgraph is its trimmed text (see **Subgraphs**).

- The classes of an entity statement (`A:::c1,c2`), of the left entity of a
  relationship statement, and of the right one, are added to the targets of the
  entity name, in that order, in the order of the classes. A `class` statement
  adds its classes, in order, to the targets of each of its names, in the order
  of the names. A class given twice is kept twice. No `classDef` is needed.
  [fixture: er/db-class-separator] [fixture:
  er/db-class-separator-relationship-first] [fixture:
  er/db-class-separator-relationship-second] [fixture:
  er/db-class-separator-relationship-both] [fixture:
  er/db-class-separator-relationship-same-entity] [fixture:
  er/db-class-separator-block] [fixture: er/db-class-statement-ids] [fixture:
  er/db-class-statement-repeat] [fixture: er/db-class-twice] [fixture:
  er/db-class-without-class-def] [fixture: er/db-class-list-spaces] [fixture:
  er/db-class-named-default] [fixture: er/db-class-name-line-separator]
  [fixture: er/db-class-undefined-entity] [fixture: er/db-class-before-entity]
  [fixture: er/db-subgraph-class-statement] [fixture:
  er/db-subgraph-class-before-definition] [fixture:
  er/db-subgraph-same-id-class-last] [fixture:
  er/db-subgraph-entity-and-subgraph-style] [fixture: er/db-class-subgraph]
- A `style` statement adds its styles, in order, to the `cssStyles` of the
  targets of each of its names. The styles of several statements add up.
  [fixture: er/db-style-statement] [fixture: er/db-style-twice] [fixture:
  er/db-style-id-list-spaces] [fixture: er/db-style-undefined-entity] [fixture:
  er/db-style-before-entity] [fixture: er/db-style-non-ascii] [fixture:
  er/db-style-semicolon-separator] [fixture: er/db-style-ignored-semicolon]
  [fixture: er/db-style-ignored-semicolon-two-statements] [fixture:
  er/db-style-subgraph] [fixture: er/db-subgraph-style-statement] [fixture:
  er/db-subgraph-class-before-definition]

**Relationships.** A relationship statement adds one relationship.

- `entityA` and `entityB` are, for the left and the right name, the name itself
  when the Db has a subgraph with that id at that point, and the `id` of the
  entity of the name otherwise. The subgraph was added when its `end` was read,
  so a relationship in its own body, or before it, refers to the entity, and one
  after it to the subgraph; the entity is made all the same. The name is not
  trimmed: `" S "` is no subgraph `S`. A subgraph without nodes counts.
  [fixture: er/db-relationship-to-subgraph-after] [fixture:
  er/db-relationship-to-subgraph-before] [fixture:
  er/db-subgraph-relationship-after] [fixture:
  er/db-subgraph-relationship-before] [fixture:
  er/db-subgraph-relationship-inside] [fixture:
  er/db-subgraph-relationship-two-subgraphs] [fixture:
  er/db-subgraph-relationship-empty-subgraph] [fixture:
  er/db-subgraph-id-trimmed] [fixture: er/db-relationship-quoted-entities]
  [fixture: er/db-relationship-source-order]
- `roleA` is the text of the role: a name, a quoted name, or a string, which may
  be empty. [fixture: er/db-role-word] [fixture: er/db-role-quoted] [fixture:
  er/db-role-quoted-empty] [fixture: er/db-role-quoted-percent] [fixture:
  er/db-role-non-ascii] [fixture: er/db-role-line-separator] [fixture:
  er/db-role-quoted-line-separator]
- `cardA` is the name of the `rightCardinality` of the relationship and `cardB`
  that of its `leftCardinality`. The line gives `relType`. The names are in
  capitals with `_` for `-`, written out in this table:

  | Word in the tree  | Name in the Db    |
  | ----------------- | ----------------- |
  | `zero-or-one`     | `ZERO_OR_ONE`     |
  | `zero-or-more`    | `ZERO_OR_MORE`    |
  | `one-or-more`     | `ONE_OR_MORE`     |
  | `only-one`        | `ONLY_ONE`        |
  | `md-parent`       | `MD_PARENT`       |
  | `identifying`     | `IDENTIFYING`     |
  | `non-identifying` | `NON_IDENTIFYING` |

  [fixture: er/db-cardinality-sides] [fixture:
  er/db-cardinality-symbol-either-side] [fixture:
  er/db-cardinality-symbols-zero-or-one] [fixture:
  er/db-cardinality-symbols-zero-or-more] [fixture:
  er/db-cardinality-symbols-one-or-more] [fixture:
  er/db-cardinality-symbols-only-one] [fixture: er/db-cardinality-parent]
  [fixture: er/db-cardinality-words-case] [fixture: er/db-relationship-type-to]
  [fixture: er/db-relationship-type-dots] [fixture:
  er/db-relationship-type-dot-dash] [fixture: er/db-relationship-type-dash-dot]
  [fixture: er/db-relationship-type-optionally-to]

**Class definitions.** A `classDef` statement adds its styles, in order, to the
definition of each of its names, which it makes at the end of the list when
there is none. A second `classDef` of a name adds its styles to the first and
does not move it. A definition that no entity uses is kept, and a name `default`
is a name like any other. The styles are the texts of the styles of the
statement, with `color` ones included. [fixture: er/db-class-def-styles]
[fixture: er/db-class-def-several-styles] [fixture: er/db-class-def-twice]
[fixture: er/db-class-def-twice-empty-line] [fixture: er/db-class-def-ids]
[fixture: er/db-class-def-unused] [fixture: er/db-class-def-default] [fixture:
er/db-classdef-twice] [fixture: er/db-classdef-color-style] [fixture:
er/db-class-def-semicolon-separator]

**Subgraphs.** A subgraph statement executes its body, and then adds the
subgraph, which is returned as its id: an inner subgraph is added before the one
around it. A subgraph has these values.

- `id` is the text of the id without the whitespace at its ends, which includes
  U+2028. A quoted id keeps its inner spaces. Two subgraphs may have one id.
  [fixture: er/db-subgraph-id-quoted] [fixture: er/db-subgraph-id-trimmed]
  [fixture: er/db-subgraph-string-id-trimmed] [fixture:
  er/db-subgraph-id-line-separator] [fixture: er/db-subgraph-same-id-twice]
  [fixture: er/db-subgraph-nested-same-id]
- `title` is the texts of the names of the bracket, joined by one space, or the
  text of the id without a bracket; then the replacement of characters (see
  below), and then the text without the whitespace at its ends. An HTML tag in
  the text stays as written: only the replacement of characters changes the
  title, and the renderer sanitizes a tag later. [fixture:
  er/db-subgraph-title-html] [fixture: er/db-subgraph-title-words] [fixture:
  er/db-subgraph-title-quoted] [fixture: er/db-subgraph-title-spaces-collapse]
  [fixture: er/db-subgraph-title-quoted-and-bare] [fixture:
  er/db-subgraph-title-trimmed] [fixture: er/db-subgraph-title-line-separator]
  [fixture: er/db-subgraph-no-title] [fixture: er/db-subgraph-id-quoted]
- `nodes` are the values that the statements of the body returned, in order,
  without those that are blank and those whose trimmed text equals the trimmed
  text of an earlier value, and then without those that an earlier subgraph
  lists, compared as they are. A value is kept as it is, with its spaces. An
  empty subgraph has none. A nested subgraph ends first, so a name it lists is
  not a node of the one around it. [fixture: er/db-subgraph-empty] [fixture:
  er/db-subgraph-nested] [fixture: er/db-subgraph-nodes-relationship] [fixture:
  er/db-subgraph-nodes-block] [fixture: er/db-subgraph-nodes-alias] [fixture:
  er/db-subgraph-nodes-class-separator] [fixture:
  er/db-subgraph-nodes-untrimmed] [fixture:
  er/db-subgraph-nodes-trimmed-then-untrimmed] [fixture:
  er/db-subgraph-nodes-two-untrimmed] [fixture: er/db-subgraph-nodes-blank-name]
  [fixture: er/db-subgraph-nodes-quoted-name] [fixture:
  er/db-subgraph-nodes-line-separator] [fixture: er/db-subgraph-entity-twice]
  [fixture: er/db-subgraph-member-repeated] [fixture:
  er/db-subgraph-member-in-earlier] [fixture:
  er/db-subgraph-same-entity-two-subgraphs] [fixture:
  er/db-subgraph-member-nested-and-outer] [fixture:
  er/db-subgraph-nested-entity-in-both]
- The values of the other statements are the keyword of a `class`, `classDef`,
  or `style` statement, as written in any case, and the trimmed text of an
  accessibility statement, which is neither replaced nor joined by line feeds.
  [fixture: er/db-subgraph-nodes-class-statement] [fixture:
  er/db-subgraph-nodes-class-def-statement] [fixture:
  er/db-subgraph-nodes-style-statement] [fixture: er/db-subgraph-class-inside]
  [fixture: er/db-subgraph-classdef-inside] [fixture:
  er/db-subgraph-style-inside] [fixture:
  er/db-subgraph-nodes-keywords-upper-case] [fixture:
  er/db-subgraph-nodes-acc-title] [fixture: er/db-subgraph-nodes-acc-descr-line]
  [fixture: er/db-subgraph-nodes-acc-descr-block] [fixture:
  er/db-subgraph-acc-title-inside] [fixture: er/db-subgraph-acc-descr-inside]
  [fixture: er/db-subgraph-acc-descr-block-inside] [fixture:
  er/db-subgraph-nodes-acc-descr-block-lines] [fixture:
  er/config-security-level-other-subgraph-node-acc-title] [fixture:
  er/db-subgraph-nodes-all-statements]
- A direction statement gives no node, and an empty description block gives none
  and changes nothing, in the body as at the start of the body, after the
  header. [fixture: er/db-subgraph-direction-only] [fixture:
  er/db-subgraph-nodes-empty-description-block] [fixture:
  er/gram-empty-description-block-first-in-subgraph] [fixture:
  er/gram-subgraph-header-blocks]
- A comment line, a directive line, an empty line, and a line of whitespace in
  the body are no statements. [fixture: er/db-subgraph-nodes-comment-line]
  [fixture: er/db-subgraph-nodes-directive-line] [fixture:
  er/db-subgraph-nodes-empty-line] [fixture:
  er/db-subgraph-nodes-whitespace-line]
- `classes` and `cssStyles` start empty, and are filled by the statements after
  the end of the subgraph (see **Classes and styles**).
- `dir` is the direction of the last direction statement among the statements of
  the body, not those of a nested subgraph, and is absent when there is none.
  [fixture: er/db-subgraph-direction] [fixture: er/db-subgraph-direction-nested]
  [fixture: er/db-direction-in-subgraph-twice]

**Direction, title, and accessibility.** `direction` is the direction of the
last direction statement among the statements of the body of the diagram, not of
those in a subgraph, or `TB`. The title is that of the frontmatter, with the
replacement of characters; a line `title T` is two entities. [fixture:
er/db-direction-values] [fixture: er/db-direction-case] [fixture:
er/db-direction-twice] [fixture: er/db-subgraph-direction-top-level] [fixture:
er/db-direction-line-text-before] [fixture: er/db-direction-line-text-after]
[fixture: er/db-title-frontmatter] [fixture: er/db-title-frontmatter-quoted]
[fixture: er/db-title-line-is-entities]

`accTitle` is the text of the last accTitle statement, also one in a subgraph,
with the replacement of characters, or the empty text. `accDescr` is the text of
the last `accDescr` statement or description block with text, with each line
feed, together with the whitespace that follows it, line feeds included,
replaced by one line feed, and then with the replacement of characters. A
description block without text changes nothing. The text may start on a later
line: `accTitle:` followed by a line `A` gives the title `A`. In
`accTitle: style:#x;y;` the last `;` is ignored, and `#x;` is an entity.
[fixture: er/db-acc-title-line] [fixture: er/db-acc-title-spaces] [fixture:
er/db-acc-title-replaces] [fixture: er/db-acc-title-twice] [fixture:
er/db-acc-title-empty-takes-next-line] [fixture:
er/db-acc-title-directive-in-text] [fixture: er/db-acc-title-ignored-semicolon]
[fixture: er/db-acc-descr-line] [fixture: er/db-acc-descr-line-separator]
[fixture: er/db-acc-descr-block] [fixture: er/db-acc-descr-replaces] [fixture:
er/db-acc-descr-twice] [fixture: er/db-acc-descr-then-block] [fixture:
er/db-acc-descr-block-then-empty] [fixture:
er/db-acc-descr-block-whitespace-only] [fixture:
er/db-acc-descr-block-empty-line] [fixture:
er/db-acc-descr-block-whitespace-line] [fixture:
er/db-acc-descr-block-comment-line] [fixture:
er/db-acc-descr-block-directive-line] [fixture:
er/db-acc-descr-block-line-separator] [fixture:
er/db-acc-descr-block-ignored-semicolon] [fixture:
er/db-subgraph-nodes-acc-title]

## The replacement of characters

The Db passes four texts through `sanitizeText`: the title, `accTitle`,
`accDescr`, and the title of a subgraph. `erDbOf()` applies the replacement
`textReplacementOf(embedded.config)` of
[db-from-tree.md](../db-from-tree.md#the-replacement-of-characters) to these and
to no other text: names, aliases, attributes, roles, ids, nodes, classes, and
styles are as written. The title of a subgraph is replaced after its words are
joined and before it is trimmed; without a bracket it is the text of the id. The
nodes of a subgraph are not replaced: an `accTitle` in the body gives the
diagram the replaced title, and the subgraph the text as written as a node. The
`accDescr` is replaced after its lines are joined. [fixture:
er/config-security-level-other-diagram-title] [fixture:
er/config-security-level-other-acc-title] [fixture:
er/config-security-level-other-acc-descr] [fixture:
er/config-security-level-other-acc-descr-block] [fixture:
er/config-security-level-other-subgraph-title] [fixture:
er/config-security-level-other-subgraph-title-words] [fixture:
er/config-security-level-other-subgraph-title-trimmed] [fixture:
er/config-security-level-other-subgraph-title-html-labels-false] [fixture:
er/config-security-level-other-names-as-written] [fixture:
er/config-security-level-other-subgraph-node-acc-title] [fixture:
er/config-security-level-strict-subgraph-title] [fixture:
er/config-security-level-loose-subgraph-title] [fixture:
er/config-security-level-antiscript-subgraph-title] [fixture:
er/config-security-level-sandbox-subgraph-title] [fixture:
er/config-look-classic] [fixture: er/config-look-hand-drawn] [fixture:
er/config-look-neo]
