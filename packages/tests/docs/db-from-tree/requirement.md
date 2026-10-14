# Building the requirement Db from the tree

Japanese version: [requirement.ja.md](./requirement.ja.md)

The steps that build the Db summary of a requirement diagram from its tree,
which `src/db-from-tree/requirement.ts` implements (see
[db-from-tree.md](../db-from-tree.md)). The syntax and the tree are defined by
the specification in
[diagrams/requirement.md](../../../spec/docs/diagrams/requirement.md) and
[ast/requirement.md](../../../spec/docs/ast/requirement.md); the fields of the
summary are in [db-summaries.md](../db-summaries.md#requirement).

mermaid.js builds the Db while it parses: the grammar calls a method of the Db
for each statement as the statement ends
([`requirementDef`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/parser/requirementDiagram.jison#L146-L149),
[`elementDef`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/parser/requirementDiagram.jison#L192-L195),
[`relationshipDef`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/parser/requirementDiagram.jison#L205-L209),
[`classDefStatement` and `classStatement`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/parser/requirementDiagram.jison#L227-L234),
[`styleStatement`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/parser/requirementDiagram.jison#L243-L245)),
and the Db keeps what the methods are given
([`addRequirement`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/requirementDb.ts#L126-L142),
[`addElement`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/requirementDb.ts#L172-L186),
[`addRelationship`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/requirementDb.ts#L204-L210),
[`setCssStyle`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/requirementDb.ts#L226-L240),
[`setClass`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/requirementDb.ts#L242-L255),
[`defineClass`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/requirementDb.ts#L257-L286),
[`setDirection`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/requirementDb.ts#L91-L93),
[`setDiagramTitle`, `setAccTitle`, and `setAccDescription`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/commonDb.ts#L16-L30)).
The summary is built the same way: the statements are executed in source order,
and the lists the Db holds are the summary, from the Db's own lists and not from
the layout data (see [db-summaries.md](../db-summaries.md#requirement)). The one
thing the Db does not do in source order is the body of a requirement or an
element (see **Requirements**). Values are kept as the Db holds them, whitespace
included.

## Building the summary from the tree

**Converted form.** Each value is read in
[converted form](../../../spec/docs/common.md#reading-a-source), so an entity is
its placeholder, in a name as in a text: `requirement a#amp; b {` is the
requirement `aﬂ°amp¶ß b`, and the same holds in a quoted name, the id, text,
type, and reference of a field, the names of a relationship, a class name, and
the accessibility texts. The same form has each line terminator, `\r\n` and a
lone `\r` too, as `\n`, in a string and in a description block, and each
attribute quote as `'`, in an accessibility text. [fixture:
requirement/entity-placeholder-in-unquoted-name] [fixture:
requirement/entity-placeholder-in-unquoted-value] [fixture:
requirement/entity-placeholder-in-requirement-fields] [fixture:
requirement/entity-placeholder-in-element-fields] [fixture:
requirement/entity-placeholder-in-relationship] [fixture:
requirement/entity-placeholder-in-acc-title] [fixture:
requirement/entity-placeholder-in-acc-descr] [fixture:
requirement/entity-placeholder-in-acc-descr-block] [fixture:
requirement/lex-html-tag-in-string-value] [fixture: requirement/header-crlf]
[fixture: requirement/header-cr-only] [fixture:
requirement/db-acc-descr-block-crlf] [fixture:
requirement/db-acc-descr-block-lone-cr] [fixture: requirement/lex-string-crlf]
[fixture: requirement/lex-string-lone-cr] [fixture:
requirement/lex-html-attribute-quote-in-acc-title] [fixture:
requirement/lex-html-attribute-quote-in-acc-descr] [fixture:
requirement/lex-html-attribute-quote-in-acc-descr-block] [fixture:
requirement/entity-placeholder-in-class-name] [fixture:
requirement/entity-placeholder-in-quoted-class-name]

**Texts.** The text of a leaf node of the tree is read as follows.

- A RequirementIdentifier and a RequirementLiteral have the converted form of
  their range. Their `value`, where they have one, is the written text, which
  the tree keeps, and the Db has the text as mermaid.js reads it. So `a`,
  U+00A0, and `b` is one name with the no-break space in it, and the whitespace
  after a name or a value on its line is no part of it. [fixture:
  requirement/db-requirement-name-spaces] [fixture:
  requirement/lex-whitespace-nbsp-in-name] [fixture:
  requirement/lex-whitespace-nbsp-after-name] [fixture:
  requirement/lex-whitespace-line-separator-in-name] [fixture:
  requirement/db-requirement-value-spaces]
- A StringLiteral has the converted form of its range without the quotes. It
  keeps every character between them, the whitespace and the line feeds too, and
  `#`, `%`, `:`, `,`, `-`, `{`, and `}`, which an unquoted text cannot hold. A
  quoted name and the unquoted name with the same text are one name. [fixture:
  requirement/db-requirement-quoted-values] [fixture:
  requirement/db-relationship-quoted-names] [fixture:
  requirement/lex-string-hash-percent] [fixture:
  requirement/lex-string-line-feed] [fixture:
  requirement/db-name-quoted-and-unquoted-same]
- A directive inside a text unit or a string is not in the converted form, and
  so not in the text: `text: a%%{init: {}}%%b` and `text: "a%%{init: {}}%%b"`
  have the text `ab`, `docref: a%%{init: {}}%%b` the reference `ab`,
  `accTitle: a%%{init: {}}%%b` the title `ab`, `style r fi%%{init: {}}%%ll:red`
  the style `fill:red`, `requirement a%%{init: {}}%%b {` the requirement `ab`,
  `a - satisfies -> b%%{init: {}}%%c` the end `bc`, and `r:::c%%{init: {}}%%d`
  the class `cd`. The whitespace before the directive stays in the text:
  `text: a %%{init: {}}%%b` has the text `a b`. A comment line inside a
  description block is not either. [fixture: requirement/lex-directive-in-name]
  [fixture: requirement/lex-directive-in-target] [fixture:
  requirement/lex-directive-in-shorthand-class] [fixture:
  requirement/lex-directive-in-value] [fixture:
  requirement/lex-directive-after-space-in-value] [fixture:
  requirement/lex-directive-after-space-in-name] [fixture:
  requirement/lex-directive-after-space-in-direction-text] [fixture:
  requirement/lex-directive-in-string] [fixture:
  requirement/lex-directive-in-docref] [fixture:
  requirement/lex-directive-in-acc-title] [fixture:
  requirement/lex-directive-in-style] [fixture:
  requirement/tokens-comment-line-in-acc-block] [fixture:
  requirement/lex-directive-in-acc-descr] [fixture:
  requirement/lex-directive-in-acc-descr-block]
- A `;` that the line rule ignores is not in the converted form either, so
  `style r fill:#f00;` has the style `fill:#f00`, `accTitle: style:#x a;b` the
  title `style:#x ab`, and `"style:#x" - satisfies -> b;c` the end `bc`, while a
  `;` on a line that is no `style` line is a character of its text: `id: 1;` has
  the id `1;`, and `style r fill:red;` the style `fill:red;`. [fixture:
  requirement/tokens-ignored-semicolon-in-style] [fixture:
  requirement/tokens-ignored-semicolon-in-acc-title] [fixture:
  requirement/tokens-ignored-semicolon-in-acc-descr] [fixture:
  requirement/tokens-ignored-semicolon-in-acc-descr-block] [fixture:
  requirement/tokens-ignored-semicolon-in-name] [fixture:
  requirement/lex-value-semicolon] [fixture: requirement/lex-style-semicolon]
- The value of a style is the converted forms of the tokens inside its
  RequirementLiteral, joined. The whitespace between the units of a style is no
  token, so it is no part of the value: `style r fill: red , stroke : blue`
  gives the styles `fill:red` and `stroke:blue`, and
  `style r fill:red stroke:blue` the one style `fill:redstroke:blue`. [fixture:
  requirement/lex-style-spaces] [fixture: requirement/lex-style-no-comma]
  [fixture: requirement/db-style-statement] [fixture:
  requirement/lex-style-hash-after-style] [fixture:
  requirement/lex-directive-in-style]
- The text of an accessibility statement is the converted form of the range of
  its RequirementLiteral without the whitespace at its ends, as mermaid.js trims
  it. [fixture: requirement/db-acc-title-descr] [fixture:
  requirement/lex-acc-title-no-space] [fixture:
  requirement/lex-acc-title-directive-adjacent-whitespace] [fixture:
  requirement/lex-acc-title-trailing-nbsp] [fixture:
  requirement/gram-acc-title-line-feed-then-text]

**The walk.** The statements of the body are executed in source order, and a
statement changes the Db at the point where it stands: a `class` statement
before the `classDef` of its class gives the class no styles at that point, and
the `classDef` gives them later (see **Classes and styles**). A comment line, a
directive line, an empty line, and a line of whitespace between statements are
no statements, and neither is a line of `%%` alone, which is a comment of the
diagram. An empty description block, a RequirementAccDescrBlockStatement without
text, changes nothing: the statements around it are executed as if it were not
there, wherever a statement may start, after the header and after a `}` too.
[fixture: requirement/db-class-statement-before-def] [fixture:
requirement/lex-bare-percent-line-after-statement] [fixture:
requirement/lex-percent-brace-line] [fixture:
requirement/lex-whitespace-line-separator-between-statements] [fixture:
requirement/gram-acc-descr-block-empty] [fixture:
requirement/gram-acc-descr-block-directive-only] [fixture:
requirement/header-empty-description-block] [fixture:
requirement/gram-empty-description-block-after-close-brace] [fixture:
requirement/db-comment-lines-between-statements] [fixture:
requirement/db-directive-line-between-statements] [fixture:
requirement/db-empty-description-block-keeps-acc-descr-line] [fixture:
requirement/db-empty-description-block-keeps-acc-descr-block] [fixture:
requirement/db-style-before-definition]

**Defaults.** Without a statement, the Db has the direction `TB`, the empty text
for `accTitle` and `accDescr`, the title of the frontmatter (the empty text
without one) for the title, and no requirement, element, relationship, and class
definition. [fixture: requirement/header-only] [fixture:
requirement/db-frontmatter-title]

**Direction, title, and accessibility.** `direction` is the direction of the
last direction statement of the body, which the tree gives in upper case, or
`TB`. A direction line is read as a whole: the text before `direction` and after
its value is no part of the Db, and a line like `a - satisfies -> direction LR`
sets the direction and adds no relationship. The title is that of the
frontmatter, with the replacement of characters; the diagram has no statement
for it. [fixture: requirement/lex-title-statement] `accTitle` is the text of the
last accTitle statement, with the replacement of characters, or the empty text.
`accDescr` is the text of the last `accDescr` statement or description block
with text, with each line feed, together with the whitespace that follows it,
line feeds included, replaced by one line feed, and then with the replacement of
characters. A description block without text changes nothing. The text may start
on a later line: `accTitle:` followed by a line `T` gives the title `T`.
[fixture: requirement/db-direction-last-wins] [fixture:
requirement/db-direction-lower-case] [fixture:
requirement/lex-direction-tb-first] [fixture:
requirement/lex-direction-line-text-before-and-after] [fixture:
requirement/lex-direction-value-suffix] [fixture:
requirement/lex-direction-in-relationship-line] [fixture:
requirement/lex-direction-line-before-classdef] [fixture:
requirement/spec-requirement-diagram-7522200d] [fixture:
requirement/spec-requirement-diagram-08cfba06] [fixture:
requirement/spec-requirement-diagram-34fcfcee] [fixture:
requirement/spec-requirement-diagram-6d165a76] [fixture:
requirement/db-frontmatter-title] [fixture: requirement/db-acc-title-descr]
[fixture: requirement/db-acc-descr-block] [fixture:
requirement/gram-acc-title-line-feed-then-text] [fixture:
requirement/spec-requirement-diagram-e5ae8f38] [fixture:
requirement/spec-requirement-diagram-27be7222] [fixture:
requirement/db-acc-descr-line-then-block] [fixture:
requirement/db-acc-descr-block-then-line] [fixture:
requirement/db-acc-descr-block-blank-line] [fixture:
requirement/db-acc-descr-block-spaces-before-line-feed]

**Requirements.** A requirement statement adds the requirement of its name to
the requirements when there is none, then the classes after `:::` go to the
target of its name (see **Classes and styles**). The requirements are kept by
name, in the order in which a statement first names them.

- The requirement has the name, the `type` that its kind names, the
  `requirementId`, `text`, `risk`, and `verifyMethod` of its fields, and no
  styles. A field that the body does not set is the empty text. The names that
  the Db gives the words of the tree are in this table.

  | Word in the tree         | Name in the Db            |
  | ------------------------ | ------------------------- |
  | `requirement`            | `Requirement`             |
  | `functionalRequirement`  | `Functional Requirement`  |
  | `interfaceRequirement`   | `Interface Requirement`   |
  | `performanceRequirement` | `Performance Requirement` |
  | `physicalRequirement`    | `Physical Requirement`    |
  | `designConstraint`       | `Design Constraint`       |
  | `low`                    | `Low`                     |
  | `medium`                 | `Medium`                  |
  | `high`                   | `High`                    |
  | `analysis`               | `Analysis`                |
  | `demonstration`          | `Demonstration`           |
  | `inspection`             | `Inspection`              |
  | `test`                   | `Test`                    |

  [fixture: requirement/db-requirement-all-fields] [fixture:
  requirement/db-requirement-defaults] [fixture:
  requirement/db-requirement-order] [fixture:
  requirement/db-keywords-upper-case] [fixture:
  requirement/lex-risk-method-mixed-case] [fixture:
  requirement/spec-requirement-diagram-54ea0a9d] [fixture:
  requirement/spec-requirement-diagram-d1dc0373] [fixture:
  requirement/spec-requirement-diagram-17e0a905] [fixture:
  requirement/spec-requirement-diagram-f221edee] [fixture:
  requirement/spec-requirement-diagram-0e21244e] [fixture:
  requirement/spec-requirement-diagram-06f108a7] [fixture:
  requirement/spec-requirement-diagram-4a3ca536] [fixture:
  requirement/spec-requirement-diagram-f64fbd88] [fixture:
  requirement/spec-requirement-diagram-1a2f68fa] [fixture:
  requirement/spec-requirement-diagram-1e009b06]

- The Db applies the fields of a body from the last to the first, so the first
  field of a kind is the one that stays: of two `id` fields the first is the id.
  An item of the body that is a RequirementIgnoredText, an empty description
  block, is no field, wherever it stands. A comment line, a directive line, an
  empty line, and a line of whitespace in a body are no items. [fixture:
  requirement/db-requirement-fields-repeated] [fixture:
  requirement/gram-empty-description-block-in-body] [fixture:
  requirement/gram-empty-description-block-after-brace] [fixture:
  requirement/gram-empty-description-block-before-field] [fixture:
  requirement/gram-empty-description-block-after-string-value] [fixture:
  requirement/gram-empty-description-block-before-close-brace] [fixture:
  requirement/gram-empty-description-block-space-in-body] [fixture:
  requirement/gram-empty-description-blocks-adjacent-in-body] [fixture:
  requirement/tokens-comment-line-in-body] [fixture:
  requirement/tokens-comment-line-after-brace] [fixture:
  requirement/lex-blank-lines-in-body] [fixture:
  requirement/lex-directive-at-end-of-field-line] [fixture:
  requirement/lex-directive-line-in-body] [fixture:
  requirement/lex-whitespace-only-line-in-body]
- A statement with the name of a requirement that exists, of any kind, changes
  no field of it, its body included; a requirement and an element may have the
  same name. A name is any name, `__proto__` and `constructor` too. [fixture:
  requirement/db-requirement-name-repeated] [fixture:
  requirement/db-requirement-and-element-same-name] [fixture:
  requirement/spec-requirement-diagram-7e4de658] [fixture:
  requirement/spec-requirement-diagram-dec8a0d9] [fixture:
  requirement/db-requirement-definition-again-with-class]
- `requirementId` and `text` are the texts of the values of the first `id` and
  the first `text` field, a quoted value with its spaces, an unquoted one
  without the whitespace at its ends. [fixture:
  requirement/db-requirement-quoted-values] [fixture:
  requirement/db-requirement-value-spaces]

**Elements.** An element statement adds the element of its name to the elements
when there is none, then the classes after `:::` go to the target of its name
(see **Classes and styles**). The element has the `type` and `docRef` of its
first `type` and first `docref` field, which are any text, and the empty text
where the body does not set them. A name that exists changes no field of the
element, its body included; the body is read as the body of a requirement.
[fixture: requirement/db-element-fields] [fixture:
requirement/db-element-defaults] [fixture:
requirement/db-element-fields-repeated] [fixture:
requirement/db-element-name-repeated] [fixture:
requirement/gram-empty-description-block-in-element-body] [fixture:
requirement/gram-element-docref-quoted-url] [fixture:
requirement/spec-requirement-diagram-aa701d4f] [fixture:
requirement/spec-requirement-diagram-20d637a1] [fixture:
requirement/spec-requirement-diagram-29c59902] [fixture:
requirement/db-element-definition-with-class-of-requirement] [fixture:
requirement/db-element-definition-again-with-class]

**Relationships.** A relationship statement adds one relationship, also when an
earlier one is the same. `type` is the relationship of the tree, in lower case.
`src` and `dst` are the left and the right name for an arrow `forward`, and the
right and the left name for an arrow `backward`: `b <- copies - a` is a
relationship from a to b. The names need not be those of a requirement or an
element, and the statement adds neither. [fixture:
requirement/db-relationship-arrows] [fixture:
requirement/gram-relationship-glued] [fixture:
requirement/gram-relationship-backward-glued] [fixture:
requirement/lex-relationship-upper-case] [fixture:
requirement/db-relationship-quoted-names] [fixture:
requirement/db-relationship-undefined-names] [fixture:
requirement/db-relationships-repeated] [fixture:
requirement/spec-requirement-diagram-ef787489] [fixture:
requirement/spec-requirement-diagram-50b3d65a] [fixture:
requirement/spec-requirement-diagram-7dfbfd0b] [fixture:
requirement/spec-requirement-diagram-bbf167e5] [fixture:
requirement/spec-requirement-diagram-d742a321] [fixture:
requirement/spec-requirement-diagram-3adb8f93] [fixture:
requirement/spec-requirement-diagram-3b9d9ff5]

**Classes and styles.** The **target of a name** is the requirement of that
name, or the element of that name when there is no requirement of it. A name
that is neither has no target. Every requirement and element starts with the
class `default`, which the summary leaves out, so a statement that names
`default` gives it a second one.

- A `style` statement adds each of its styles, in order, to the `cssStyles` of
  the target of each of its names, in the order of the names, and stops at the
  first name that has no target: the names after it get nothing. The styles of
  several statements add up. When a requirement and an element have the name,
  the requirement gets the styles. [fixture: requirement/db-style-statement]
  [fixture: requirement/db-style-unknown-name] [fixture:
  requirement/db-class-statement-unknown-name-first] [fixture:
  requirement/db-requirement-and-element-same-name] [fixture:
  requirement/lex-style-string-name] [fixture:
  requirement/spec-requirement-diagram-5305b791] [fixture:
  requirement/spec-requirement-diagram-e39bdc99] [fixture:
  requirement/spec-requirement-diagram-5ee6d26d]
- A `class` statement, a class shorthand statement (`r:::a,b`), and the classes
  after `:::` in the head of a requirement or an element add the classes, in
  order, to the `classes` of the target of each name, in the order of the names.
  A name that has no target is skipped, and the names after it still get the
  classes. With each class the target gets the styles that the class has at that
  point, appended to its `cssStyles`. A class needs no `classDef`; a class given
  twice is kept twice. [fixture: requirement/db-class-statement] [fixture:
  requirement/db-class-statement-unknown-name-first] [fixture:
  requirement/db-class-colon-form] [fixture: requirement/db-class-in-definition]
  [fixture: requirement/db-class-default-name] [fixture:
  requirement/gram-class-comma-spaces] [fixture:
  requirement/gram-class-shorthand-spaced] [fixture:
  requirement/gram-class-string-class] [fixture:
  requirement/lex-class-list-next-line] [fixture:
  requirement/lex-class-list-comma-next-line] [fixture:
  requirement/lex-class-strings-next-line] [fixture:
  requirement/spec-requirement-diagram-6bb10181] [fixture:
  requirement/spec-requirement-diagram-5128588b] [fixture:
  requirement/spec-requirement-diagram-a55d1b35] [fixture:
  requirement/spec-requirement-diagram-a8854583] [fixture:
  requirement/db-class-given-twice] [fixture:
  requirement/db-class-statements-same-class-twice]
- A `classDef` statement adds its styles, in order, to the definition of each of
  its names, which it makes at the end of the list when there is none, and then
  adds them to the `cssStyles` of every requirement and element that has the
  class at that point, the class `default` included. So a class gives its styles
  to a member in two ways: when the member joins the class, if the class is
  defined by then, and when the class is defined, to the members it has at that
  time. A second `classDef` of a name adds its styles to the first and does not
  move it. A definition that no requirement or element uses is kept. [fixture:
  requirement/db-class-def] [fixture: requirement/db-class-def-default-all]
  [fixture: requirement/db-class-statement-before-def] [fixture:
  requirement/db-class-styles-order] [fixture:
  requirement/db-class-styles-order-defined-first] [fixture:
  requirement/lex-classdef-string-name] [fixture:
  requirement/spec-requirement-diagram-7ee9ffc8] [fixture:
  requirement/spec-requirement-diagram-f9464f3d] [fixture:
  requirement/spec-requirement-diagram-0799fd14] [fixture:
  requirement/db-class-def-id-twice]

**The summary.** The summary has the fields of
[db-summaries.md](../db-summaries.md#requirement): the values above, and the
requirements, elements, relationships, and class definitions in the order of the
lists.

## The replacement of characters

The Db passes three texts through `sanitizeText`: the title, `accTitle`, and
`accDescr`. `requirementDbOf()` applies the replacement
`textReplacementOf(embedded.config)` of
[db-from-tree.md](../db-from-tree.md#the-replacement-of-characters) to these and
to no other text: names, ids, texts, types, references, the names of
relationships, classes, and styles are as written. The title of the frontmatter
is replaced; the `accDescr` is replaced after its lines are joined, and a block
is replaced like a line. [fixture:
requirement/config-security-level-other-title] [fixture:
requirement/config-security-level-other-acc-title] [fixture:
requirement/config-security-level-other-acc-descr] [fixture:
requirement/config-security-level-other-acc-descr-block] [fixture:
requirement/config-security-level-other-html-labels-false] [fixture:
requirement/config-security-level-other-names-as-written]
