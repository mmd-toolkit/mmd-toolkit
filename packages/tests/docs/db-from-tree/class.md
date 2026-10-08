# Building the class Db from the tree

Japanese version: [class.ja.md](./class.ja.md)

The steps that build the Db summary of a class diagram from its tree, which
`src/db-from-tree/class.ts` implements (see
[db-from-tree.md](../db-from-tree.md)). The syntax and the tree are defined by
the specification in [diagrams/class.md](../../../spec/docs/diagrams/class.md)
and [ast/class.md](../../../spec/docs/ast/class.md).

The diagram title from the frontmatter does not come from the tree: whoever
checks Db values derives it with mermaid.js's own functions (see
[Configuration (reference)](../configuration.md#configuration-reference)).
[fixture: class/docs-syntax-class-diagram-2f728b32]

## Building the summary from the tree

The statements are applied in source order, the items of a namespace in their
own order, and each statement as follows. [fixture:
class/db-style-class-def-source-order] Each value is read in
[converted form](../../../spec/docs/common.md#reading-a-source), so an entity is
its placeholder, an attribute quote is `'`, a line terminator is a line feed,
and a `;` that the line rule ignores is left out: ``class `a#amp;b` `` declares
the class `aﬂ°amp¶ßb`, and `style A fill:#f00,x:<a b="c">y</a>` gives A the
styles `fill:#f00` and `x:<a b='c'>y</a>`. [fixture:
class/db-backquoted-name-entity] [fixture: class/db-member-entity] [fixture:
class/db-member-attribute-quote] [fixture: class/db-note-entity] [fixture:
class/db-cardinality-entity] [fixture: class/db-acc-title-entity] [fixture:
class/db-style-attribute-quote] [fixture: class/db-class-def-attribute-quote]
[fixture: class/db-note-attribute-quote] [fixture:
class/db-backquoted-name-attribute-quote] [fixture:
class/db-note-line-terminators] [fixture: class/db-callback-arguments-crlf]
[fixture: class/db-note-ignored-semicolon]

**Names.** The name text, the written name, and the id of a class name are those
that
[Rejections outside the grammar](../../../spec/docs/diagrams/class.md#rejections-outside-the-grammar)
defines. A generic type of only whitespace counts in the written name, so
`class A~ ~` declares A with the type of a space, and `class A~ T ~` with the
type `T` between two spaces, while `class A~~` declares A without a type. A
directive in a generic type is not part of it: `class A~T%%{init: {}}%%U~`
declares A with the type `TU`, `class A~ %%{init: {}}%% ~` with the type of two
spaces, and `class A~%%{init: {}}%%~` without a type. [fixture:
class/db-generic-blank] [fixture: class/db-generic-spaces] [fixture:
class/db-generic-blank-line-feed] [fixture:
class/db-generic-blank-directive-between-spaces] [fixture:
class/db-generic-directive-only] [fixture: class/db-generic-directive-in-text]
The **type** of a written name is the text between its first and its second `~`,
or up to its end, when it has a `~` and its first `~` is not its first
character; otherwise it is empty. So `class Map~K, V~` declares `Map` with the
type `K, V`, and ``class `a~b` `` declares `a` with the type `b`, while
``class `~a~b` ``, whose first `~` is its first character, declares `~a~b`
without a type. Likewise ``class `a~b~c` `` declares `a` with the type `b`,
``class `a~` `` declares `a` without a type, and ``class `a~b`~T~ `` declares
`a` with the type `b`, as its written name is `a~b~T~`. [fixture:
class/db-generic-type] [fixture: class/db-backquoted-name-tilde] [fixture:
class/db-backquoted-name-unclosed] [fixture:
class/div-backquote-starts-with-tilde-and-type] [fixture:
class/db-backquoted-name-two-tildes] [fixture:
class/db-backquoted-name-tilde-at-end] [fixture:
class/db-backquoted-name-tilde-and-generic]

**Adding a class.** The statements that add a class are those that the
annotation item of
[Rejections outside the grammar](../../../spec/docs/diagrams/class.md#rejections-outside-the-grammar)
lists. Adding a class by a written name does nothing when a class with its id
exists. Otherwise it adds the class with that id and type, the id as `label`, as
`text` the id followed, when the type is not empty, by `&lt;`, the type, and
`&gt;`, `cssClasses` `default`, and empty lists. A `<` inside the type is not
changed: `class A~a<b~` has the `text` `A&lt;a<b&gt;`. So the type of a class is
the one written where it was first added: `class A` followed by `class A~T~`
leaves A without a type. A member statement adds its class in the same way:
`A~T~ : x` declares A with the type `T`. U+2028 is not a line terminator, so
`class A`, U+2028, and `class B` are one class statement, which adds the class
`AclassB`. [fixture: class/db-class-type-first-added] [fixture:
class/db-generic-type-angle-brackets] [fixture:
class/db-class-type-member-statement] [fixture:
class/db-class-statement-line-separator]

**Class statements.** A class statement adds its class, then:

- A label sets `label` to the text of the string, and `text` to that text
  followed, when the class has a type, by `<`, the type, and `>`. A later label
  replaces an earlier one, and a class statement without a label keeps the label
  that the class has. The type is the one of the class, not the one written in
  the statement: `class A` followed by `class A~T~["L"]` gives A the `text` `L`.
  [fixture: class/db-class-label-type] [fixture: class/db-class-label-redefined]
  [fixture: class/db-class-label-kept-without-label] [fixture:
  class/db-class-label-type-of-class] A label replaces the label of the class
  with the same id, also when one statement has a type and the other has none:
  `class A~T~["First"]` followed by `class A["Second"]` gives A the `label`
  `Second` and the `text` `Second<T>`; also when one of them lies in a
  namespace, where the class keeps its `parent`. The same label written twice
  changes nothing. [fixture: class/db-class-label-same-twice] [fixture:
  class/db-class-label-redefined-generic] [fixture:
  class/db-class-label-redefined-in-namespace]
- `:::` gives the class the CSS class of its name part (see **CSS classes**
  below).
- An annotation adds its name part to `annotations`, also when the class has it
  already. [fixture: class/db-annotation-twice]
- The member lines are added in order, as for a member statement, after the CSS
  class or the annotation. They are added to the members that the class has, so
  two class statements with bodies for the same class give it the members of
  both, in order: `class A {` with `+int x` and `class A {` with `+int y` give A
  the members `int x` and `int y`. So the annotation of `class A <<first>> {`
  comes before an annotation line `<<second>>` of its body. A directive on a
  line of its own in the body makes no member line. [fixture:
  class/db-class-members-added] [fixture:
  class/db-class-annotation-then-member-annotation] [fixture:
  class/db-class-members-directive-line]

**Member statements and member lines.** A member statement with a label adds its
class, then adds the member line of the label, which is the rest of its line:
`A : x %% c` adds the member `x %% c`. [fixture:
class/db-member-statement-percent] A member line adds to the class:

- an annotation line, the value of its name, whitespace included, or the empty
  text when it has none, to `annotations`; [fixture:
  class/db-member-annotation-spaces] [fixture: class/tokens-annotation-blank]
  [fixture: class/tokens-annotation-blank-label] [fixture:
  class/db-member-annotation-empty]
- a method line, to `methods`: `visibility` the visibility mark or the empty
  text, `classifier` the classifier mark or the empty text, `id` the member
  name, `parameters` the text of its unit or the empty text, and `returnType`
  the value of the return type or the empty text, which holds the whitespace
  before a classifier mark that ends it (item 5 of
  [Member lines](../../../spec/docs/diagrams/class.md#member-lines)):
  `+getInstance() Foo $` has the return type `Foo` and a space, and
  `+foo(a) a b`, a tab, and `*` the return type `a b` and a tab; [fixture:
  class/db-method-return-type-space-before-classifier] [fixture:
  class/db-method-return-type-tab-before-classifier] [fixture:
  class/db-method-visibility-classifier]
- an attribute line, to `members`, in the same way, without `parameters` and
  `returnType`; [fixture: class/db-attribute-visibility-classifier]
- a blank member line, nothing.

The member name is the value of the name, with the whitespace at its start
replaced by one space, or the empty text when there is no name. The value starts
with whitespace only when the member name text starts with a space (see
[Member lines](../../../spec/docs/diagrams/class.md#member-lines)).
`+  spaced name  ` has the id `spaced name` after one space, `+ foo()` the id
`foo` after one space, `x`, U+2028, and ` b(c)` the id `b` after one space, and
`x`, U+2028, and ` (c)` the id of one space; with a tab in place of the space of
the last, the id is empty. U+2028 at the start of the name text is whitespace
too: `+`, U+2028, and `int x` has the id `int x`, while `+`, a space, U+2028,
and `int y` has the id of one space and `int y`. [fixture:
class/db-member-name-line-separator] [fixture: class/db-member-name-space]
[fixture: class/db-method-name-space] [fixture:
class/lex-member-method-segment-space-before-name] [fixture:
class/lex-member-method-segment-space-only-name] [fixture:
class/lex-member-method-segment-tab-only-name]

**Annotation statements.** An annotation statement adds its name part to the
`annotations` of the class with the id of its class name, which must exist (see
[Rejections outside the grammar](../../../spec/docs/diagrams/class.md#rejections-outside-the-grammar)).

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
the tree (see
[ClassRelationStatement](../../../spec/docs/ast/class.md#classrelationstatement)),
gives the empty title: `A --> B : ` has the title of the empty text, while
`A --> B` has none. [fixture: class/tokens-relation-label-blank] [fixture:
class/db-relation-types] [fixture: class/docs-syntax-class-diagram-bc06236e]
[fixture: class/docs-syntax-class-diagram-b06c5b3c] [fixture:
class/db-lollipop-both] [fixture: class/db-cardinality-spaces] [fixture:
class/db-relation-label-quotes] [fixture: class/db-lollipop-other-end-second]
[fixture: class/db-lollipop-written-names] [fixture:
class/db-lollipop-strings-and-label] [fixture: class/db-relation-label-spaces]
[fixture: class/db-relation-whitespace-kinds] [fixture:
class/db-cardinality-empty-second] [fixture:
class/db-relation-written-name-tilde]

**Namespaces.** The **name text** of a namespace name is formed as for a class
name. A namespace statement has the **qualified id** of its name text: the
qualified id of the namespace statement it is in, a `.`, and the name text, or
the name text alone at the top. When a namespace with the qualified id exists,
it becomes explicit, and a label replaces its `label`; a namespace statement
without a label keeps the label that it finds. Otherwise, for the qualified id
and each part of it before a `.`, from the first, a namespace with that id is
added when none exists: `label` the part after the last `.`, or the text of the
label for the qualified id itself, `parent` the id one part shorter, and
`explicit` true for the qualified id itself and false for the parts before it;
an existing namespace with the qualified id becomes explicit. Each such
namespace is added to the `children` of its parent. Then the items of the body
are applied, and after them, each class statement of the body sets the `parent`
of its class to the qualified id and adds the class's id to the namespace's
`classes`, unless it is there already, and each note statement does the same for
its note. So `namespace A` with two class statements `class C` gives A the
`classes` `C` once. [fixture: class/spec-class-diagram-95acf03b] [fixture:
class/db-namespace-nested] [fixture: class/db-namespace-redeclared-label]
[fixture: class/db-namespace-moves-class] [fixture:
class/db-namespace-redeclared-label-kept] [fixture:
class/db-namespace-new-dotted-label] [fixture:
class/db-namespace-dotted-in-nested] [fixture: class/db-namespace-name-parts]
[fixture: class/db-namespace-backquoted-dot] [fixture:
class/db-namespace-class-repeated] [fixture:
class/db-namespace-class-redeclared-outside] [fixture:
class/db-namespace-outer-class-after-nested]

**Notes.** A note statement adds a note: `id` `note` followed by the number of
notes before it, `text` the text of the string, not trimmed, and, after
`note for`, `class` the written name; it adds no class. A directive on a line of
its own inside the string is left out and leaves the line feeds around it:
`note "a`, a line `%%{init: {}}%%`, and `b"` has the `text` `a`, two line feeds,
and `b`. A comment line is left out with its line feed. [fixture:
class/db-note-text-spaces] [fixture: class/db-note-for-undefined-class]
[fixture: class/db-note-directive-line-inside] [fixture:
common/comment-in-string] [fixture: class/tokens-comment-region-in-click-string]
[fixture: class/db-note-comment-line-inside-string] A note for a class that a
later statement declares keeps the written name: `note for A "x"` before
`class A` has the `class` `A`. [fixture: class/db-note-for-before-class]

**Click statements.** In these statements, the written name of the class name is
a list of names separated by `,`, and each step applies to each name in turn.
[fixture: class/db-link-names-comma] [fixture: class/db-click-call-names-comma]

- `callback` and `click` with `call` set `haveCallback` of the class with the id
  of each name, when it exists, and then give the CSS class `clickable` (see
  **CSS classes**), which looks up a name that starts with an ASCII digit as
  `classId-` followed by the name, while `haveCallback` is set by the id:
  `callback 1A "fn" "t"` sets `haveCallback` and the tooltip of the class `1A`,
  and `clickable` of the class `classId-1A`. [fixture:
  class/db-callback-digit-split-lookup]
- `link` and `click` with `href` set `link` of the class of each name, when it
  exists, to the URL without the whitespace at its ends, or remove it when that
  is empty, also when the class has a link already: `link A "u"` followed by
  `link A "  " _self` leaves A without a `link`, and with the `linkTarget`
  `_self`. They set `linkTarget` to the link target, which is `_blank`, `_self`,
  `_parent`, or `_top`, or `_blank` when there is none; then they give the CSS
  class `clickable`. A name that starts with an ASCII digit is looked up as
  `classId-` followed by the name, as for CSS classes, so `link 1A "u"` sets the
  link of the class `classId-1A`, and of no other. [fixture:
  class/db-link-url-blank] [fixture: class/db-link-url-blank-after-link]
  [fixture: class/db-link-targets] [fixture: class/db-link-digit-prefixed-class]
- A tooltip that is not empty then sets `tooltip` of the class with the id of
  each name, when it exists, as written, whitespace included: the tooltip is set
  by the id, so `link 1A "u" "t"` sets only the tooltip of the class `1A`.
  [fixture: class/db-link-tooltip-spaces] [fixture: class/db-link-digit-tooltip]

So a click statement for a class that does not exist changes nothing, except
that `callback` and `click` with `call` record a click call for each name,
whether or not it is a class: `id` the name, `name` the `value` of the
StringLiteral or the ClassLiteral of the `callback`, and `args` the `value` of
the `arguments`, or null when there is none; the summary has `clickCalls` only
when it has a call. [fixture: class/tokens-callback-name-trailing-space]
[fixture: class/db-click-href] [fixture: class/db-click-link-as-written]
[fixture: class/spec-class-diagram-6fe56b41] [fixture:
class/db-callback-names-comma] [fixture: class/db-link-url-spaces] [fixture:
class/db-link-undefined-class] [fixture: class/db-click-undefined-class]
[fixture: class/db-callback-undefined-class] [fixture:
class/db-callback-names-comma-one-undefined] [fixture:
class/db-click-call-undefined-class] That holds for a class that is added later:
a click statement before the statement that adds the class changes nothing, and
one after a relation that declares the class applies to it. [fixture:
class/db-click-before-class] [fixture: class/db-link-before-class] [fixture:
class/db-callback-before-class] [fixture: class/db-click-after-relation]

**CSS classes.** Giving a CSS class to a written name, from `:::`, `cssClass`,
and the click statements, splits the written name at each `,`. For each name, a
name that starts with an ASCII digit is looked up as `classId-` followed by the
name, and when a class with its id exists, a space and the CSS class are added
to its `cssClasses`, also when it has the CSS class already. So `class 1A:::c`
declares `1A` without the CSS class `c`, and gives `c` to the class `classId-1A`
when it exists, and ``class `A,B`:::c`` declares the class `A,B` without the CSS
class `c`, and gives `c` to A and B. A space next to the `,`, before or after
it, is part of the name: `cssClass "A, B" c` gives `c` to A only, and
`cssClass "A ,B" c` to B only. [fixture: class/db-css-class-digit] [fixture:
class/db-css-class-statement-digit] [fixture: class/db-css-class-list-space]
[fixture: class/db-css-class-digit-prefixed-class] [fixture:
class/db-css-class-colon-digit-prefixed-class] [fixture:
class/db-css-class-colon-names-comma] [fixture: class/db-css-class-added-twice]
[fixture: class/db-css-class-ids-space-before-comma] A CSS class for a name with
no class changes nothing. [fixture: class/db-css-class-undefined-class] That
holds for a class that is added later: `cssClass "A" c` before `class A` changes
nothing. [fixture: class/db-css-class-before-class]

**Styles.** The text of a style is its value (see
[ClassLiteral](../../../spec/docs/ast/class.md#classliteral)). The **style
values** of a style statement are the texts of its styles split at each `,`, so
a style that ends with a `,` has the empty text as its last value:
`style A fill:red,` has the values `fill:red` and the empty text. [fixture:
class/db-style-empty-value] `style` appends them to the `styles` of the class
whose id is the word, when it exists, after the styles that the class has, so a
`style` statement before the statement that adds the class changes nothing. A
word that starts with an ASCII digit is not looked up with `classId-`. [fixture:
class/db-style-before-class] [fixture: class/db-style-twice] [fixture:
class/db-style-digit-id] That holds when the statement that adds the class lies
in a namespace; a class that a relation or a member statement declares is a
class from then on, and a `style` after it, or after a `class` statement in a
namespace, applies. [fixture: class/db-style-before-class-in-namespace]
[fixture: class/db-style-after-relation] [fixture:
class/db-style-after-member-statement] [fixture:
class/db-style-after-class-in-namespace] `classDef` appends them, for each of
its names in order, to the `styles` of each class whose `cssClasses` contain
that name anywhere, also inside a longer CSS class: `classDef fo fill:red`
applies to a class with the CSS class `foo`, and `classDef default fill:red` to
every class. A class that has two of the names gets the values twice. It applies
only to the classes that have the CSS class at that point: a class that gets it
later gets no styles. [fixture: class/db-style-spaces] [fixture:
class/db-style-undefined-class] [fixture: class/db-class-def-substring]
[fixture: class/db-class-def-default] [fixture: class/db-class-def-order]
[fixture: class/db-class-def-names]

**Other statements.** A direction statement sets `direction` to its value, a
later one replacing an earlier one. [fixture: class/db-direction-bt] [fixture:
class/db-direction-tb-after-lr] `accTitle:` sets the accessibility title, and
`accDescr:` and `accDescr {` the description, as in
[flowchart.md](./flowchart.md#building-the-summary-from-the-tree): without
whitespace at the ends, each line feed and the whitespace after it read as one
line feed, and a later statement replacing an earlier one, also an `accDescr:`
line replacing a block. [fixture: class/db-acc-title-spaces] [fixture:
class/spec-class-diagram-0926d7aa] [fixture: class/db-acc-title-replaces]
[fixture: class/db-acc-descr-replaces] [fixture:
class/db-acc-descr-line-replaces-block] [fixture:
class/db-acc-descr-block-collapse] [fixture: class/db-acc-whitespace-kinds]
[fixture: class/db-acc-descr-block-replaces-line] [fixture:
class/db-acc-descr-block-replaces-block] An `accTitle:` or an `accDescr:` with
no text on its line takes the next line that holds text as its text, past empty
lines, comment lines, and directive lines, whether the line break is a line feed
or CR LF, and also when U+2028 follows the colon; that line is no statement, so
`accDescr:` followed by `class A` gives the description `class A` and declares
no class. [fixture: class/db-acc-title-line-empty-takes-next-after-comment]
[fixture: class/db-acc-title-line-empty-takes-next-after-directive] [fixture:
class/db-acc-descr-line-empty-takes-next-lines] [fixture:
class/db-acc-descr-line-empty-takes-next-after-comment] [fixture:
class/db-acc-descr-line-empty-takes-next-after-directive] [fixture:
class/db-acc-descr-line-empty-takes-next-line-crlf] [fixture:
class/db-acc-descr-line-separator-then-text] A description block statement
without text changes nothing, also where it lies before the separator of another
statement. [fixture: class/gram-empty-description-block-after-note] [fixture:
class/db-acc-descr-empty-block-keeps-line] [fixture:
class/db-acc-descr-empty-block-before-separator-keeps-block] A class name alone,
without a label, changes nothing: a line `Foo` declares no class, and neither
does `Class A`, the name `ClassA` (see
[Lexical structure](../../../spec/docs/diagrams/class.md#lexical-structure)).
[fixture: class/gram-name-alone] [fixture: class/lex-keyword-upper-case]
