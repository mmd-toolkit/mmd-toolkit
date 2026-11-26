# Agentflow formatting rules

Japanese version: [agentflow.ja.md](./agentflow.ja.md)

These rules format `agentflow-beta` from its written AST. They keep the
specified reading, occurrence order and embedded source. Shared flowchart rules
are linked with their reasons; the differences below belong to Agentflow. Inputs
are shown as escaped JSON strings so missing final newlines and padding stay
visible. Output blocks copy the fixed fixtures. Unicode/control cases use
escaped test strings.

Formatting is not syntax repair: parser failures report `SyntaxError`, and
Markdown declines their payload to its host. Accepted divergences follow their
specified reading under
[Inputs read differently](./compatibility.md#inputs-read-differently-from-mermaidjs).
All corpus inputs, including rejections and divergences, run through the corpus
test. For example, `"Agentflow-beta TB\nA\n"` is rejected rather than having its
header repaired.

[corpus fixture: agentflow/header-upper]

Of the specified divergences, Agentflow has six: directive-as-token-boundary,
ignored-semicolon-as-token-boundary, embedded-data-opaque,
html-tag-in-frontmatter, bare-percent-line-before-header and
tokenless-empty-forms. A comment that takes the character before it or the line
breaks after it, the blank-line pairing and the C4 detection do not apply, a C4
word in Agentflow text stays Agentflow text, and the reserved word `click` does
not apply either. The formatter never asks mermaid.js while printing and never
reverts a result because mermaid.js reads it differently: formatting is not
syntax repair, and the specification already defines the exceptional readings.

## Rules

### Header

The header stands at column one, so it is easy to find. Unlike the header of a
flowchart, a header direction `TD` is printed `TB`, the direction that the
examples in the documentation of mermaid.js use (10 times, and `TD` never; see
[The direction of a header](./compatibility.md#the-direction-of-a-header)): the
diagram type is later than the version of mermaid.js that made `TD` behave as
`TB`, so every version that counts and reads it draws the two the same (see
[Versions of mermaid.js that count](./compatibility.md#versions-of-mermaidjs-that-count)).
Agentflow accepts only exact lower-case `agentflow-beta`. An absent direction
stays absent, symbol directions stay written, a direction that stands after a
directive which follows the header is printed like any other (`TD` as `TB`, and
`agentflow-beta%%{init: {}}%% TD` as `agentflow-beta %%{init: {}}%%TB`), and
next-line LR remains a vertex. Ordinary header followers move into the body;
directive attachment follows Directives. [Flowchart](./flowchart.md#directives)
and [class](./class.md#directives) diagrams keep a directive that touches the
end of the header, with no direction after it, touching it, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have) keeps
such a directive touching an agentflow header too.

[fixture: header/header-column] [fixture: header/header-direction-spelling]
[fixture: header/header-inline-separated] [fixture:
header/header-next-line-direction] [fixture: header/header-symbol] [fixture:
header/header-direction-spelling-after-directive]

[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives one space
between the header keyword and a symbol direction, as Prettier prints
`return  x` as `return x;`: `agentflow-beta<` is printed `agentflow-beta <`.

[fixture: header/header-symbol-touching-spaced] [test: agentflow: U+2028 between
the header keyword and its direction]

Input (escaped): `"agentflow-beta"`.

[fixture: header/header-only]

Output
([header/header-only-output.mmd](../tests/fixtures/agentflow/header/header-only-output.mmd)):

```mmd
agentflow-beta
```

### Indentation

Indentation is set from the AST, while authored columns do not determine
membership. Use one configured step below the header and each flow/global, align
end with its opener, and give connectors no body.
[Sequence](./sequence.md#indentation) and [state](./state.md#indentation)
diagrams put the statements after the header one level deeper than the header;
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have) gives
agentflow statements the same level. A composite [state](./state.md#indentation)
puts `}` at the level of its opening line;
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have) gives
the same alignment to the closing `end` of a flow or global. `useTabs` uses one
tab per level. Agentflow uses the shared significant indentation width: even
with `tabWidth: 0`, each body step is at least one space. Indented lines such as
`accTitle: direction LR` are direction statements; moving them to column one
would change the Db or reject a style-prefixed direction line. Non-direction
lines whose reading depends on their columns keep their written indentation
under Direction.

[fixture: indentation/indent-direction-unsafe] [fixture:
indentation/indent-nested] [fixture: indentation/indent-tabs] [fixture:
indentation/indent-zero]

Input (escaped): `"agentflow-beta TB\nflow F\nA\nend"`.

[fixture: indentation/indent-four]

Output
([indentation/indent-four-output.mmd](../tests/fixtures/agentflow/indentation/indent-four-output.mmd)):

```mmd
agentflow-beta TB
    flow F
        A
    end
```

### Containers

Reuse flowchart [Indentation](./flowchart.md#indentation) and
[Statements one per line](./flowchart.md#statements-one-per-line): an opening,
body and closing line, as in the other diagram types. Keep named and unnamed
flows, globals, empty and mixed nested bodies, and statement order. Globals
affect membership despite emitting no container, so they remain blocks. Never
manufacture a name or data. Agentflow end/global consume only ASCII spaces/tabs;
they do not absorb LF into a name. A semicolon after end is a separate
EmptyStatement at the containing depth.

[fixture: containers/containers-empty] [fixture: containers/containers-one-line]
[fixture: containers/end-name-not-greedy] [fixture:
containers/global-flatten-unsafe]

A run of spaces and tabs in the title of a flow is printed as one space, except
in a markdown string, in a flow with a data block (`F@{ view: "collapsed" }`;
the id of a flow named by a string is the text between the quotes, without the
whitespace at its ends, and for a markdown string the text between its
backquotes: `flow "F"` and `flow " F "` have the id `F`), and in a diagram that
names `swimlane`, where mermaid.js wraps the title (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)).

[fixture: containers/flow-title-runs-collapsed] [fixture:
containers/flow-title-collapsed-runs-kept] [fixture:
containers/flow-quoted-name-title-collapsed-runs-kept] [fixture:
containers/flow-spaced-quoted-name-title-collapsed-runs-kept] [fixture:
containers/flow-markdown-name-title-collapsed-runs-kept] [fixture:
containers/flow-two-part-name-title-collapsed-runs-kept]

Input (escaped): `"agentflow-beta TB\nglobal\t \nA\nend B"`.

[fixture: containers/global-tabs]

Output
([containers/global-tabs-output.mmd](../tests/fixtures/agentflow/containers/global-tabs-output.mmd)):

```mmd
agentflow-beta TB
  global
    A
  end
  B
```

### Names and headings

Reuse [Subgraph header](./flowchart.md#subgraph-header) for an ordinary
single-part name with an explicit title: the `[` of the title touches the name,
so `flow F [T]` is printed `flow F[T]`, and so is `connector F [T]`. All 19
headings with a title in
[the documentation of agentflow](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/agentflow.md#L26-L363)
are written so, and the Db is the same for both forms. The whitespace inside the
brackets of the title is dropped, so `[ T ]` is printed `[T]` and `["x" ]` is
printed `["x"]`, as in flowchart; Agentflow has no reason to choose a different
form. One space stays inside each end where the title would be read otherwise
(`[ /x/ ]` and `[ x@ ]`; see
[Where mermaid.js decides against the whitespace](./printed-form.md#where-mermaidjs-decides-against-the-whitespace)).
A directive at an edge of the title touches the bracket and the title, as the
gap has no space: `flow F[ %%{x}%% T ]` is printed `flow F[%%{x}%%T]`, and
`flow G[ T %%{x}%% ]` is printed `flow G[T%%{x}%%]`.

[fixture: names-and-headings/heading-title-directive-at-edge]

A U+2028 or U+2029 on the line of the `]` stays, and one at the start of a
continuation line is read as its indentation.

[test: agentflow: U+2028 inside the brackets of a flow title] [test: agentflow:
U+2029 inside the brackets of a flow title] [fixture:
names-and-headings/heading-title-padding-dropped] [fixture:
names-and-headings/name-heading-touches-title] [fixture:
names-and-headings/name-heading-touches-title-kinds]

A name of several parts, with an erased `click` or an empty string in it, is
kept as written from its first part to its last, the whitespace before the title
included, as under the rules below. After `click`, that whitespace ends the
click id, so `flow F click [T]` and `flow F click[T]` are different headings;
after an empty string the Db would be the same, and the name is kept the same
way.

[fixture: names-and-headings/name-heading-title-multi-part-name-kept]

A directive or a comment that ends the name keeps the whitespace written after
it, as under [Directives](#directives), and a directive inside the gap keeps
whether whitespace was written after it: that whitespace becomes one space. The
whitespace before the directive stays as written while the `[` is apart from the
directive, since the name then runs through the directive
(`flow F   %%{init: {}}%% [T]` is not changed). When the `[` touches the
directive, the name ends before the directive and the title touches the name, so
the whitespace before the directive is dropped (`flow H   %%{init: {}}%%[T]` is
printed `flow H%%{init: {}}%%[T]`).

[fixture: names-and-headings/name-heading-title-beside-directive] [fixture:
names-and-headings/name-heading-title-gap-run-beside-directive] [test:
agentflow: a comment and U+2028 between a flow name and its title]

Between a `:` and a `#` of a line that the line rule may read, the gap keeps
whether it holds whitespace, as in flowchart.

[fixture: names-and-headings/name-heading-title-after-colon-before-hash]

A U+2028 or U+2029 in the gap stays where it is.

[test: agentflow: U+2028 between a flow name and its title] [test: agentflow:
U+2029 between a connector name and its title]

The `@{` of a data block touches an ordinary single-part name that has no title,
as the `[` of a title does: `connector github @{ protocol: "mcp" }` is printed
`connector github@{ protocol: "mcp" }`, and `flow F  @{ a: 1 }` is printed
`flow F@{ a: 1 }`. mermaid.js trims the whitespace after the name, so the Db is
the same, and the documentation of mermaid.js writes the `@{` of a data block
touching the id or title before it
([`create["create_issue"]@{ ... }`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/agentflow.md#L290)).
A name that holds a directive or a comment is kept as written, as above.

[fixture: names-and-headings/heading-data-touches-name] [test: agentflow: U+2029
between a connector name and its data block]

Whitespace before the title is trimmed through a `;` that the line rule ignores:
`connector style:#x ; [T]` is printed `connector style:#x;[T]`. Prettier prints
no whitespace before the `[` of an index (`x [ 0 ];` is printed `x[0];`), so
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives the `[` of a
title no space before it. The semicolon keeps its written place against the
name.

[fixture: names-and-headings/title-after-ignored-semicolon]

The whitespace at the end of an ordinary single-part name that has neither a
title nor a data block is dropped in the same way: `flow F` followed by two
spaces is printed `flow F`, and so is `flow F ;` followed by a line, where the
`;` becomes a line break. mermaid.js trims the name, so the Db is the same, and
`flow F` followed by spaces and `flow F` are one flow. A name that holds a
directive or a comment, a name of several parts, and a name of whitespace only
are kept as written, as above. At the end of the name, U+2028 and U+2029 are
characters of the name and no spaces or tabs: the spaces after one go, and the
spaces before it stay. Spaces and tabs after a final U+2028 or U+2029 end the
printed line, so [rule 1](./printed-form.md#1-the-whitespace-beside-a-mark)
removes them; spaces before either name character remain inside the name. A name
that holds a directive stays as written up to its end, but a `;` that the line
rule ignores at its end, with the whitespace around it, goes with it, as it does
from a name without a directive: `accDescr {style:#x} flow F #%%{init: {}}%%;`
followed by two spaces is printed `accDescr: style:#x` and
`flow F #%%{init: {}}%%`, as it is without the whitespace after the `;`. The
directives at its end then stand as they do without that whitespace: the
whitespace before them is dropped, as at the end of any name, so
`flow F%% style:#x %%{init: {}}%%;` followed by two spaces is printed
`flow F%% style:#x%%{init: {}}%%`, and so is the same text with a tab, or a
space before the `;`, after the `;`.

[test: agentflow: U+2028 and spaces at the end of a flow name] [test: agentflow:
U+2029 and spaces at the end of a connector name] [fixture:
trailing-whitespace/trailing-name-dropped] [fixture:
containers/end-name-not-greedy] [fixture:
names-and-headings/heading-word-gap-before-semicolon] [fixture:
names-and-headings/name-directive-trailing-kept] [fixture:
names-and-headings/heading-with-directive-ignored-semicolon-after-whitespace-dropped]
[fixture:
names-and-headings/heading-with-directive-after-hash-ignored-semicolon-after-whitespace-dropped]
[fixture:
names-and-headings/heading-with-comment-and-directive-ignored-semicolon-after-whitespace-dropped]
[fixture:
names-and-headings/heading-with-comment-and-directive-ignored-semicolon-after-tab-dropped]
[fixture:
names-and-headings/heading-with-comment-and-directive-ignored-semicolon-after-space-dropped]
[fixture:
names-and-headings/heading-with-comment-and-directive-short-ignored-semicolon-after-whitespace-dropped]
[fixture:
names-and-headings/heading-with-comment-and-directive-two-directives-ignored-semicolon-after-whitespace-dropped]
[fixture:
names-and-headings/heading-with-comment-and-directive-touching-directives-ignored-semicolon-after-whitespace-dropped]
[fixture:
names-and-headings/heading-with-comment-and-directive-directive-before-ignored-semicolon-after-whitespace-dropped]
[fixture:
names-and-headings/heading-with-comment-and-directive-connector-ignored-semicolon-after-whitespace-dropped]

A name that ends with the keyword `end` or `global` takes the whitespace after
it, also before a comment: `flow Front end %% c` is printed
`flow Front end%% c`. A `;` that the printer drops after such a name, and the
whitespace around it, whatever its characters, go the same way, so
`flow Front end ;  %% c` is printed `flow Front end%% c` at once, as the text
without the `;` is, and a second formatting changes nothing. So does a run of
`;` that the printer drops, as in `connector Front end ; ;  %% c`. A `;` that
the printer keeps, because the `;` that the line rule ignores at the end of the
comment follows it, or because a directive does, stays against the name:
`connector Front end ; %% style:#x;` is printed
`connector Front end; %% style:#x;`, and `connector Front end ; %%{x}%%` is
printed `connector Front end; %%{x}%%`, also where the directive is not closed.
A `;` at the end of the text is dropped with the whitespace before it. A keyword
is a keyword where a unit of the name starts, by the lexical rules that
agentflow reuses from flowchart
([Flows, globals, connectors, and names](../../spec/docs/diagrams/agentflow.md#flows-globals-connectors-and-names);
flowchart rules 10 to 12, 16, 17, 20, and 21): at the start of the name, after
whitespace, a `:`, a `^`, a `#`, an `&`, a `*`, a number, or a character that is
no ASCII character of an id run, as in `flow Front:end` and `flow Front 9end`.
Inside an id run it is none (`Front-end`, `Front9end`, `Front#end`), and a name
that ends with another word keeps one space before the comment:
`flow Front fin ;  %% c` is printed `flow Front fin %% c`, and so is
`flow Front-end ;  %% c` as `flow Front-end %% c`. The same holds for `global`,
for a connector, and for a flow in a flow. A name that holds a directive or a
comment is not changed by this: `flow Front end %%{init: {}}%% ;  %% c` is
printed `flow Front end %%{init: {}}%%  %% c`. A name that ends with a U+2028 or
U+2029 after the keyword keeps its `;`. The Db is the same for both forms.

[fixture: names-and-headings/heading-end-keyword-semicolon-comment] [fixture:
names-and-headings/heading-end-keyword-semicolon-touching-comment] [fixture:
names-and-headings/heading-end-keyword-semicolon-touching-name] [fixture:
names-and-headings/heading-global-keyword-semicolon-comment] [fixture:
names-and-headings/heading-colon-end-keyword-semicolon-comment] [fixture:
names-and-headings/heading-only-end-keyword-semicolon-comment] [fixture:
names-and-headings/connector-end-keyword-semicolon-comment] [fixture:
names-and-headings/heading-nested-end-keyword-semicolon-comment] [fixture:
names-and-headings/heading-end-keyword-comment-touches] [fixture:
names-and-headings/heading-word-semicolon-comment-one-space] [fixture:
names-and-headings/heading-id-run-end-semicolon-comment-one-space] [fixture:
names-and-headings/heading-end-keyword-directive-semicolon-comment-kept]
[fixture: names-and-headings/heading-end-keyword-after-number-semicolon-comment]
[fixture:
names-and-headings/heading-global-keyword-after-number-semicolon-comment]
[fixture: names-and-headings/heading-end-keyword-after-hash-semicolon-comment]
[fixture:
names-and-headings/heading-id-run-digit-end-semicolon-comment-one-space]
[fixture:
names-and-headings/heading-id-run-hash-end-semicolon-comment-one-space]
[fixture: names-and-headings/heading-end-keyword-after-caret-semicolon-comment]
[fixture:
names-and-headings/heading-end-keyword-after-non-ascii-letter-semicolon-comment]
[fixture: names-and-headings/connector-global-keyword-semicolon-comment]
[fixture: names-and-headings/heading-upper-end-semicolon-comment-one-space]
[fixture: names-and-headings/heading-ending-word-semicolon-comment-one-space]
[fixture: names-and-headings/connector-end-keyword-semicolon-closed-directive]
[fixture: names-and-headings/connector-end-keyword-semicolon-open-directive]
[fixture: names-and-headings/connector-end-keyword-two-semicolons-comment]
[fixture: names-and-headings/connector-end-keyword-spaced-semicolons-comment]
[fixture:
names-and-headings/connector-end-keyword-semicolon-comment-ignored-semicolon-kept]
[fixture: names-and-headings/connector-end-keyword-semicolon-two-comment-lines]
[fixture: names-and-headings/connector-end-keyword-semicolon-comment-empty-line]
[fixture:
names-and-headings/connector-end-keyword-semicolon-comment-whitespace-line]
[fixture:
names-and-headings/connector-end-keyword-semicolon-comment-end-of-text]
[fixture: names-and-headings/connector-end-keyword-semicolon-end-of-text] [test:
agentflow: U+2028 after the keyword at the end of a flow name before a semicolon
and a comment] [test: agentflow: vertical tab after the semicolon after the
keyword at the end of a flow name before a comment] [test: agentflow: form feed
after the semicolon after the keyword at the end of a flow name before a
comment] [test: agentflow: U+3000 after the semicolon after the keyword at the
end of a flow name before a comment] [test: agentflow: no-break space after the
semicolon after the keyword at the end of a flow name before a comment] [test:
agentflow: U+2028 after the semicolon after the keyword at the end of a flow
name before a comment] [test: agentflow: U+2029 after the semicolon after the
keyword at the end of a flow name before a comment] [test: agentflow: U+3000
after the semicolon after the keyword at the end of a connector name before a
comment] [test: agentflow: a tab before the keyword at the end of a flow name
before a semicolon and a comment] [test: agentflow: a no-break space before the
keyword at the end of a flow name before a semicolon and a comment] [test:
agentflow: U+2029 after the keyword at the end of a flow name before a semicolon
and a comment]

Before a `;` that stays on a line printed as written, the end of a name keeps
its whitespace where removing it would form an entity: `flow F%% style:#x ;;`
keeps the space before `;;`, also where spaces follow the semicolons. A
directive after the name changes nothing, since mermaid.js removes it before it
reads the text: `flow F%% style:#x %%{init: {}}%%;;` keeps the space before the
directive, and without it the text is rejected by mermaid.js, whether one
directive, directives that touch each other, or three semicolons stand there,
and in a connector heading as well. Where whitespace follows the directive, no
entity forms with or without the space before it, and that space stays as
written: `flow F%% style:#x %%{init: {}}%% %%{a}%%;;` and
`flow F%% style:#x %%{init: {}}%% ;;` are unchanged, as is
`accDescr {style:#x} flow F %%{init: {}}%% %%{a}%%;;`.

[fixture: names-and-headings/heading-entity-gap-before-kept-semicolons]
[fixture: names-and-headings/heading-entity-gap-before-kept-semicolons-trailing]
[fixture:
names-and-headings/heading-entity-gap-before-directive-and-kept-semicolons]
[fixture:
names-and-headings/heading-entity-gap-before-directive-and-kept-semicolons-trailing]
[fixture:
names-and-headings/heading-entity-gap-before-directive-and-three-semicolons]
[fixture:
names-and-headings/heading-entity-gap-before-touching-directives-and-kept-semicolons]
[fixture:
names-and-headings/heading-entity-gap-digits-before-directive-and-kept-semicolons]
[fixture:
names-and-headings/heading-entity-gap-short-before-directive-and-kept-semicolons]
[fixture:
names-and-headings/heading-entity-gap-connector-before-directive-and-kept-semicolons]

[fixture:
names-and-headings/heading-entity-gap-before-two-directives-and-kept-semicolons]
[fixture:
names-and-headings/heading-entity-gap-before-directive-and-space-and-kept-semicolons]
[fixture:
names-and-headings/heading-nonentity-gap-before-two-directives-and-kept-semicolons]

Where removing the whitespace forms no entity, the usual trimming still applies:
`accDescr {style:#x} flow F ;;` is printed with `flow F;;`, and
`accDescr {style:#x} flow F %%{init: {}}%%;;` with `flow F%%{init: {}}%%;;`.

[fixture: names-and-headings/heading-nonentity-gap-before-kept-semicolons]
[fixture:
names-and-headings/heading-nonentity-gap-before-directive-and-kept-semicolons]

The same holds before a `;` that the printer keeps because an item follows it on
its line that is not a comment: a directive, or the `;` that the line rule
ignores at the end of a comment. `flow Front#fin ;  %%{x}%%` is printed
`flow Front#fin ; %%{x}%%`, and `flow Front#fin ;  %% style:#x;` is printed
`flow Front#fin ; %% style:#x;`, since `flow Front#fin; %%{x}%%` has the entity
`#fin;` in its name, which mermaid.js rejects. The end of a name that is a `#`
and one or more word characters forms the entity wherever the `#` stands
(`Fr#ont`, `F#r#ont`, `Front #fin`, `Front#38`), in a connector heading, and in
a flow in a flow. The whitespace before the `;` is printed as written, a tab
included. Where a comment follows the `;`, or nothing does, the printer drops
the `;` and the whitespace before it, as it does after any name:
`flow Front#fin ;  %% c` is printed `flow Front#fin %% c`. A `#` that no word
character follows forms no entity: `flow Front# ;  %%{x}%%` is printed
`flow Front#; %%{x}%%`.

[fixture:
names-and-headings/heading-entity-name-end-semicolon-directive-space-kept]
[fixture:
names-and-headings/heading-entity-name-middle-hash-semicolon-directive-space-kept]
[fixture:
names-and-headings/heading-entity-name-two-hashes-semicolon-directive-space-kept]
[fixture:
names-and-headings/heading-entity-name-number-semicolon-directive-space-kept]
[fixture:
names-and-headings/heading-entity-name-after-space-semicolon-directive-space-kept]
[fixture:
names-and-headings/connector-entity-name-end-semicolon-directive-space-kept]
[fixture:
names-and-headings/heading-nested-entity-name-end-semicolon-directive-space-kept]
[fixture:
names-and-headings/heading-entity-name-end-two-directives-semicolon-space-kept]
[fixture: names-and-headings/heading-entity-name-end-semicolon-comment-dropped]
[fixture: names-and-headings/heading-entity-name-end-directive-only] [fixture:
names-and-headings/heading-entity-name-end-semicolon-alone-dropped] [fixture:
names-and-headings/heading-hash-name-end-semicolon-directive-space-dropped]
[fixture:
names-and-headings/heading-plain-name-end-semicolon-directive-space-dropped]
[fixture:
names-and-headings/connector-entity-name-semicolon-open-directive-kept]
[fixture:
names-and-headings/connector-entity-name-semicolon-directive-ignored-semicolon-kept]
[fixture:
names-and-headings/connector-entity-name-semicolon-comment-ignored-semicolon-kept]
[fixture:
names-and-headings/connector-entity-name-two-semicolons-directive-kept]
[fixture:
names-and-headings/connector-entity-name-semicolon-comment-line-dropped]
[fixture:
names-and-headings/connector-entity-name-semicolon-two-comment-lines-dropped]
[fixture:
names-and-headings/connector-entity-name-semicolon-empty-line-directive-dropped]
[fixture:
names-and-headings/connector-entity-name-semicolon-whitespace-line-directive-dropped]
[fixture:
names-and-headings/connector-entity-name-semicolon-directive-end-of-text-kept]
[fixture:
names-and-headings/connector-entity-name-semicolon-comment-end-of-text-dropped]
[fixture:
names-and-headings/connector-entity-name-semicolon-end-of-text-dropped] [test:
agentflow: U+2028 between a semicolon that a directive follows and an
entity-shaped name end] [test: agentflow: U+2029 between a semicolon that a
directive follows and an entity-shaped name end] [test: agentflow: a tab between
an entity-shaped name end and a semicolon that a directive follows] [test:
agentflow: no-break space between an entity-shaped name end and a semicolon that
a directive follows]

The whitespace after the word `flow`, `connector`, or `global` is one space,
however many spaces or tabs were written: the word takes one whitespace
character, and mermaid.js trims the rest from the name. `flow   F["T"]` is
printed `flow F["T"]`, and `global` followed by spaces is printed `global`.

[fixture: names-and-headings/heading-word-gap-collapsed]

A directive in the gap is placed as under [Directives](#directives).

[fixture: names-and-headings/heading-word-gap-beside-directive]

This holds where the name is a single part; a name of several parts is kept as
written, as above.

[fixture: names-and-headings/name-heading-title-multi-part-name-kept]

A U+2028 or U+2029 in the gap stays where it is.

[test: agentflow: U+2028 after the flow word] [test: agentflow: U+2029 after the
connector word]

A whitespace-only name before an explicit title keeps its written characters:
removing them would remove the required name.

[fixture: names-and-headings/whitespace-name-before-title]

Otherwise keep all source text from the first name part through the last:
quoted/markdown padding, erased `click`, empty description/string/markdown/call
forms, their gaps and continuation columns. These parts belong to the name even
when Mermaid drops them from its id. Unlike flowchart, Agentflow does not reject
this use of `click` or read LF after `end` as name text. A connector has a name
but no closing `end`.

[fixture: names-and-headings/name-collapse-unsafe] [fixture:
names-and-headings/name-click-reindent-unsafe] [fixture:
names-and-headings/name-quoted-tail] [fixture:
names-and-headings/name-whitespace-only] [fixture:
names-and-headings/directive-after-erased-string]

After name text read as a click id, exactly one whitespace character ends that
reading. Keep that character, including a tab or LF, before a title, data, or a
statement that follows, also one after a `;` that becomes a line break: without
it the line break ends the id and the next statement is read as a part of the
name, so the Db differs. Drop a space or tab where nothing follows it but
whitespace, line breaks, and separators: the text then ends the id, as at EOF
without the character, and the Db and the figure are the same. When only
whitespace, line breaks, and separators follow a click id, its exit space or tab
ends the printed line, so
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) removes it. A `;`
that the line rule ignores leaves no following text for this decision.

[fixture: names-and-headings/click-exit-before-ignored-semicolon] [fixture:
names-and-headings/name-exit-space-before-statement-kept] [fixture:
names-and-headings/name-exit-space-before-separator-statement-kept] [fixture:
names-and-headings/name-exit-space-before-blank-end-dropped]

Additional whitespace belongs to the next name part. Empty strings and empty
markdown strings erase no such ending character. If whitespace already separates
an erased form from later name text, it has ended the click reading: do not take
another LF after the name or add a blank line. In connector names, text directly
after an erased empty string may begin with `;`. When LF ends that click-id
text, keep it before the statement-separating LF; removing it would merge the
next statement into the name and can reject it.

[fixture: names-and-headings/connector-empty-string-adjacent-semicolon-exit]
[fixture: names-and-headings/connector-empty-string-adjacent-text-exit]
[fixture: names-and-headings/click-empty-string-lf-body] [fixture:
names-and-headings/click-empty-markdown-eof-tab] [fixture:
names-and-headings/directive-before-click-exit] [fixture:
names-and-headings/empty-string-before-name-space] [fixture:
names-and-headings/empty-string-before-name-lf] [test: agentflow:
empty-string-before-name-ls-flow] [test: agentflow:
empty-string-before-name-ls-connector] [fixture:
names-and-headings/click-empty-markdown-connector-tab] [fixture:
names-and-headings/click-empty-markdown-lf-body] [fixture:
names-and-headings/click-empty-markdown-space-semicolon] [fixture:
names-and-headings/click-empty-string-connector-tab] [fixture:
names-and-headings/click-empty-string-eof-tab] [fixture:
names-and-headings/click-empty-string-space-semicolon] [fixture:
names-and-headings/name-exit-lf-empty-line] [fixture:
names-and-headings/name-exit-lf-semicolon] [fixture:
names-and-headings/name-exit-tab-eof] [fixture:
names-and-headings/name-ordinary-fragment-blank] [fixture:
names-and-headings/name-click-exit-before-data-tab] [fixture:
names-and-headings/name-click-exit-before-title-tab]

A name read as a click id that reaches EOF with no exit character keeps its text
as written; the only addition is the final LF of
[Final newline](#final-newline). Prettier adds the final line break, so a click
id that reaches EOF gains one LF without an extra blank line.

[fixture: names-and-headings/name-click-exit-eof]

Whitespace taken by an unclosed directive is removed before the click id is
read, so it supplies no exit character and can be dropped at EOF.

[test: agentflow: click id before taken EOF whitespace]

Ordinary blank gaps after the character ending click-id text follow Blank lines.

[fixture: names-and-headings/name-exit-lf-empty-line] [fixture:
names-and-headings/name-ordinary-fragment-blank]

When a separator `;` becomes a line break, drop a final name part made only of
whitespace after an empty description block: whitespace before `;` is name text,
but whitespace before the printed LF is not. After an empty description block,
the final whitespace-only name part becomes line-end whitespace when `;` becomes
a line break, so [rule 1](./printed-form.md#1-the-whitespace-beside-a-mark)
removes it. Keep it when the semicolon stays on its line under Kept lines.

[fixture: names-and-headings/empty-description-kept-separator]

This applies to flow and connector names, spaces, tabs, runs of spaces, a
separator followed by LF, and repeated separators.

[fixture: names-and-headings/empty-description-space-flow] [fixture:
names-and-headings/empty-description-tab-flow] [fixture:
names-and-headings/empty-description-two-spaces-flow] [fixture:
names-and-headings/empty-description-separator-lf] [fixture:
names-and-headings/empty-description-separated-semicolons] [fixture:
names-and-headings/empty-description-space-connector] [fixture:
names-and-headings/empty-description-tab-connector] [fixture:
names-and-headings/empty-description-two-spaces-connector]

Input (escaped): `"agentflow-beta TB\nflow F accDescr {} ;A\nend"`.

[fixture: names-and-headings/empty-description-space-flow]

Output
([names-and-headings/empty-description-space-flow-output.mmd](../tests/fixtures/agentflow/names-and-headings/empty-description-space-flow-output.mmd)):

```mmd
agentflow-beta TB
  flow F accDescr {}
    A
  end
```

### Single space gaps

Unlike flowchart
[Whitespace between tokens](./flowchart.md#whitespace-between-tokens), never
normalize the required single-whitespace-character gaps after
style/classDef/class/linkStyle, before class values and interpolation names, or
before tooltips. The grammar consumes exactly one whitespace character;
following whitespace is value text, and a second character where a token is
expected can reject. Tabs used as that character remain tabs. Preserve
first-style leading whitespace even across directives, empty style-list items,
escaped classDef commas, order and repetition. The first-style whitespace does
not collapse as in flowchart. Each style has no whitespace before its first `:`
and one space after it where the value is not empty. The `,` between styles has
no whitespace before it and one space after it:
`style A fill :#f00,stroke:  #333` is printed
`style A fill: #f00, stroke: #333`.

[fixture: single-space-gaps/style-colon-spaced]

A run of spaces and tabs between the words of a style is printed as one space,
and whether whitespace stands between two words stays as written: a run inside a
single-quoted string, inside a comment that is not closed, and the escape after
a backslash stay: the hexadecimal digits and the one space or tab that follows
them, or else the next character.

[fixture: single-space-gaps/style-words-run-spaced] [fixture:
single-space-gaps/style-string-runs-kept] [fixture:
single-space-gaps/style-hex-escape-run-spaced]

A `linkStyle` with link numbers keeps whether whitespace follows the `,` before
a style that starts with `fill`, a run of whitespace becoming one space;
`fill-opacity` counts, as mermaid.js reads only the start. As
[Styles that are drawn the same](./compatibility.md#styles-that-are-drawn-the-same)
describes, mermaid.js adds `fill:none` when no link style starts with `fill`, so
adding a space after the comma before `fill` can change the drawing. Where
whitespace already follows that comma,
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives one space.

[fixture: single-space-gaps/link-style-fill-after-comma-kept] [fixture:
single-space-gaps/link-style-fill-opacity-after-comma-kept]

A `linkStyle`, with link numbers or `default`, keeps it for a style that starts
with `stroke:` too, which mermaid.js reads at the start where the look is
`handDrawn`.

[fixture: single-space-gaps/link-style-stroke-after-comma-kept]

The other styles of such a statement, and `linkStyle default`, use the one form
(see
[Styles that are drawn the same](./compatibility.md#styles-that-are-drawn-the-same)).
Prettier prints a comma with no whitespace before it and one space after it;
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives that form to
the commas between the ordinary link styles. In a `linkStyle` or a `classDef`,
which can reach a link, a name that ends with `stroke` keeps whether whitespace
stands between it and the `:`, a run of whitespace becoming one space (see
[Styles that are drawn the same](./compatibility.md#styles-that-are-drawn-the-same)).

[fixture: single-space-gaps/link-style-stroke-before-colon-kept] [fixture:
single-space-gaps/class-def-stroke-before-colon-kept]

A `style` styles a node, and uses the one form. Prettier prints a comma with no
whitespace before it and one space after it;
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives that form to
the commas between the styles of a node.

[fixture: single-space-gaps/style-stroke-before-colon-spaced]

A space after a backslash that ends a style of a `style` is read as nothing, as
in [flowchart](./flowchart.md#whitespace-between-tokens).

[fixture: single-space-gaps/style-backslash-space-dropped]

A style of a `linkStyle` with a name that ends with `stroke` and a value of
spaces and tabs only stays as written, as in
[flowchart](./flowchart.md#whitespace-between-tokens).

[fixture: single-space-gaps/link-style-blank-stroke-value-kept]

A style of a `linkStyle` that ends with a backslash keeps whether whitespace
stands after it, a run of whitespace becoming its first character, as in
[flowchart](./flowchart.md#whitespace-between-tokens).

[fixture: single-space-gaps/link-style-backslash-space-kept]

In a `classDef` a `,` after a backslash is part of its style, and a space
between the backslash and the `,` stays, since taking it away would make the `,`
part of the style; in a `style` and a `linkStyle` the `,` ends a style whatever
stands before it. A space after a backslash before the `:` stays as well, since
taking it away would escape the `:`, and the whitespace after that space goes,
as in [flowchart](./flowchart.md#whitespace-between-tokens).

[fixture: single-space-gaps/style-escaped-space-before-comma] [fixture:
single-space-gaps/style-backslash-before-comma] [fixture:
single-space-gaps/style-colon-escaped-space-kept] [fixture:
single-space-gaps/style-colon-escaped-space-run-dropped]

A statement stays as written where a directive or a comment stands inside it,
before the end of its last style, where a style is all whitespace, or where a
style holds a line break, U+2028, or U+2029, or its line holds a kept `;`. A
directive or a comment after the last style is no part of the statement, which
is formatted as usual (see
[Styles that are drawn the same](./compatibility.md#styles-that-are-drawn-the-same)).

[fixture: single-space-gaps/classdef-first-tab] [fixture:
single-space-gaps/style-comment-and-directive-after-last-style-formatted]
[fixture: single-space-gaps/linkstyle-first-spaces] [fixture:
single-space-gaps/style-directive-gap] [fixture:
single-space-gaps/style-first-spaces] [fixture:
single-space-gaps/styles-inner-gaps] [fixture:
single-space-gaps/style-comma-before-dropped] [fixture:
single-space-gaps/style-comma-beside-directive-kept] [test: agentflow: U+2028
before the comma of a style statement]

A style that starts with the `:` is printed as any other: one space after the
`:`, and the runs between its words as one space. Prettier prints one space
after a CSS colon, so [rule 1](./printed-form.md#1-the-whitespace-beside-a-mark)
gives one space after the leading colon of a style. `style A :  red   x` is
printed `style A : red x`.

[fixture: single-space-gaps/style-colon-first-run-spaced]

The tab after linkStyle and the tab before an interpolation name each supply the
grammar's required single whitespace character; both remain written.

[fixture: single-space-gaps/linkstyle-required-tab] [fixture:
single-space-gaps/interpolate-required-tab]

The `,` of a `class`, `click`, and `linkStyle` statement stays as written,
without a space after it, since mermaid.js rejects `class A, B c` and the like.
In a `classDef`, a space after the `,` between the names would move the name
after it into the style (`classDef a, b fill:red` gives `a` the style
`b fill:red`), so those names stay as written too (see
[Lists separated by commas](./compatibility.md#lists-separated-by-commas)).

[fixture: single-space-gaps/comma-lists-without-space-kept]

Input (escaped): `"agentflow-beta TB\nA\nclass\tA\tc\n"`.

[fixture: single-space-gaps/class-required-tab]

Output
([single-space-gaps/class-required-tab-output.mmd](../tests/fixtures/agentflow/single-space-gaps/class-required-tab-output.mmd)):

```mmd
agentflow-beta TB
  A
  class	A	c
```

### Arrows

Reuse [Arrow spacing](./flowchart.md#arrow-spacing): one exterior space on each
side of an arrow; an edge id touches its @ and arrow. Keep directive touching
and exact dash/dot counts, including counts beyond the Db cap. Below the cap a
shorter or longer arrow is another arrow (`A---->B` printed as `A --> B` is read
differently); beyond the cap the Db is the same, and a Db-equal capped arrow is
not shortened. Agentflow has only sequence `-->`, failure `--x`, and reference
`-.-`, with their extensions. Reference length counts dots. A following x may be
vertex text; no unsupported arrow family is introduced.

[fixture: arrows/arrow-cap-spelling] [fixture:
arrows/arrow-length-change-unsafe] [fixture: arrows/arrow-lengths] [fixture:
arrows/edge-id] [fixture: arrows/marker-letter-vertex] [fixture:
arrows/three-kinds]

An edge id after a data block touches it: a vertex statement takes no whitespace
after a data block except the one that an arrow reads, so
`A@{ shape: rect }e1@-->B` is accepted and `A@{ shape: rect } e1@-->B` is
rejected. A directive or an ignored `;` between the block and the edge id is
removed before the text is read, so the block, the directive or the `;`, and the
edge id touch one another: `A@{ shape: rect }%%{x}%%e1@-->B` is printed
`A@{ shape: rect }%%{x}%%e1@--> B`, and `A@{ shape: rect };e1@-->B` keeps its
`;` against the block and the edge id.

[fixture: arrows/edge-id-after-data-block-touches] [fixture:
arrows/edge-id-after-data-block-directive] [fixture:
arrows/edge-id-after-data-block-semicolon]

An edge id that starts as an arrow does touches the shape or the data block
before it, as in `A["x"]--a@-->B`. In agentflow that is an edge id that starts
with `--`, `-.-`, or `-..-`; one such as `x--a`, `==a`, `-.a`, or `.-a` is read
the same after whitespace, and has one space before it. `A["x"]--a@-->B` stays
attached, since every version of mermaid.js that counts draws `A["x"] --a@-->B`
differently (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).

[fixture: arrows/edge-id-arrow-like-kept-attached] [fixture:
arrows/edge-id-not-arrow-like-gets-one-space]

Input (escaped): `"agentflow-beta TB\nA--xB"`.

[fixture: arrows/arrow-kind-change-unsafe]

Output
([arrows/arrow-kind-change-unsafe-output.mmd](../tests/fixtures/agentflow/arrows/arrow-kind-change-unsafe-output.mmd)):

```mmd
agentflow-beta TB
  A --x B
```

### Edge labels

Reuse [Link label form](./flowchart.md#link-label-form) and
[Arrow spacing](./flowchart.md#arrow-spacing) with their reasons. A label of
plain text (letters, digits, spaces, `_`, `,`, `?`, and `!`) on the arrow `-->`
or `--x` is printed between two arrows, the form that the examples in the
documentation of mermaid.js use twice against none for the form between pipes
(see [The label of a link](./compatibility.md#the-label-of-a-link)):
`A -->|x| B` is printed `A -- x --> B`.

[fixture: edge-labels/pipes-to-arrows]

Any other label keeps the pipe/split form it is written in, since split text can
contain a pipe, a label with a `|` or a `%%`, a string, and a Markdown label
cannot be printed between the arrows, a label of blanks only is rejected between
the arrows, and only the arrows `-->` and `--x` can have a label between two
arrows.

[fixture: edge-labels/blank-pipe-label-kept]

Pipes touch the arrow and their label; split text has one exterior space. Print
one post-pipe gap. Only sequence/failure support split labels. Keep
string/markdown kind, bare continuation, and split semicolons, percent text and
line breaks; do not invent another string or split reference form. A semicolon
or line break inside split-label text is part of the label value that mermaid.js
reads before the closing arrow. Removing a semicolon or replacing a line break
with a space changes the edge text in the Db, so both stay as written.

[corpus fixture: agentflow/lex-split-edge-semicolon-newline]

[fixture: edge-labels/edge-label-forms] [fixture:
edge-labels/split-pipe-content]

A string between pipes keeps its text, and the pipes touch the arrow and the
quotes: `A  -->  |"x  y"|B` is printed as `A -->|"x  y"| B`.

[fixture: edge-labels/pipe-label-string-kept]

So does a closing pipe that was written apart from the closing quote:
`A-->|"x" |B` is printed `A -->|"x"| B`.

[fixture: edge-labels/pipe-string-closing-touches] [test: agentflow: U+2028
between the closing quote and the `|` of an edge label]

Where the label of an edge between pipes ends at a comment, and only the closing
pipe follows the line break of the comment (`A -->|x  %% c`, a line break, and
`| B`), the label ends before the comment: a run of whitespace before the
comment, spaces, tabs, and the other whitespace of the specification (a no-break
space, U+3000, U+2003, U+2028, and U+2029 among it), alone or mixed, is printed
as one space. [Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives
one space before a comment that stands after something on its line, as Prettier
prints `x = 1;   // c` as `x = 1; // c`. A comment that touches stays touching.
The closing pipe stands on a line of its own, one level deeper than the arrow
(`A -->|x %% c` and `    | B`). Where the comment holds a `;`, the characters
before it are printed as one space in the same way, and the spaces and tabs
after the `;` stay as well: `A -->|x  %% c;` and two spaces, a line break, and
`| B` print `A -->|x %% c;`, the two spaces, and `| B` one level deeper. Where
the label goes on after the line break of the comment, the spaces and tabs
before the comment stay.

[fixture: edge-labels/label-comment-ends-label] [fixture:
edge-labels/label-comment-semicolon-ends-label] [fixture:
edge-labels/label-comment-label-goes-on] [test: agentflow: a no-break space
before a comment that ends the label of an edge] [test: agentflow: U+3000 before
a comment that ends the label of an edge] [test: agentflow: U+2003 before a
comment that ends the label of an edge] [test: agentflow: U+2028 before a
comment that ends the label of an edge] [test: agentflow: U+2029 before a
comment that ends the label of an edge] [test: agentflow: a tab before a comment
that ends the label of an edge] [test: agentflow: a no-break space before a
comment with a semicolon that ends the label of an edge] [test: agentflow:
U+3000 before a comment with a semicolon that ends the label of an edge] [test:
agentflow: U+2003 before a comment with a semicolon that ends the label of an
edge] [test: agentflow: U+2028 before a comment with a semicolon that ends the
label of an edge] [test: agentflow: U+2029 before a comment with a semicolon
that ends the label of an edge] [test: agentflow: a tab before a comment with a
semicolon that ends the label of an edge] [test: agentflow: every whitespace
character of the specification before a comment that ends the label of an edge]
[test: agentflow: every whitespace character of the specification before a
comment with a semicolon that ends the label of an edge] [test: agentflow: a run
of different whitespace characters before a comment that ends the label of a
vertex or of an edge]

Input (escaped): `"agentflow-beta TB\nA --> |x| B"`.

[fixture: edge-labels/pipe-label-gap]

Output
([edge-labels/pipe-label-gap-output.mmd](../tests/fixtures/agentflow/edge-labels/pipe-label-gap-output.mmd)):

```mmd
agentflow-beta TB
  A -- x --> B
```

### Labels

Reuse [Label inner whitespace](./flowchart.md#label-inner-whitespace): Mermaid
discards ordinary bare exterior padding, whereas internal and quoted/markdown
label text stays, and a label of spaces and tabs only is printed as one space. A
run of spaces inside a quoted label stays: mermaid.js holds it in the text of
the vertex, and a label long enough to wrap is drawn with the run wider than one
space (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
Keep one leading/trailing space for slash, backslash, dash, quote characters,
and when `@` in the first word would make it read as an edge id (see
[Where mermaid.js decides against the whitespace](./printed-form.md#where-mermaidjs-decides-against-the-whitespace));
put no space before slanted ?]/=] closers. For a slash label, `A[ /x/ ]` keeps
its spaces, since every version of mermaid.js that counts reads `A[/x/]` as a
slanted vertex labelled `x` instead of a square vertex labelled `/x/` (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
Agentflow label comments are different where the label goes on after the line
break of the comment: the spaces and tabs before the comment are label content
(the text of `A[before  %% c`, a line break, and `after]` is `before  \nafter`),
so preserve that padding, the comment and its LF/continuation columns, including
a closing bracket that belongs to the comment rather than closing the shape.
Where only the closing bracket follows the line break of the comment, the label
ends before the comment (the text of `A[x  %% c`, a line break, and `]` is `x`
in the Db, and it is also with another whitespace character of the specification
in place of the spaces, a no-break space, U+3000, U+2003, U+2028, and U+2029
among them), so a run of whitespace before the comment, of one kind of character
or of several, is printed as one space.
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives one space
before a comment that stands after something on its line, as Prettier prints
`x = 1;   // c` as `x = 1; // c`. A comment that touches stays touching. A bare
label is printed in quotes (see
[Labels that are drawn the same](./compatibility.md#labels-that-are-drawn-the-same)),
and the closing bracket stands on a line of its own, one level deeper than the
vertex. Where the comment holds a `;`, the label is not quoted, the characters
before the comment are printed as one space in the same way, and the spaces and
tabs after the `;` stay: `A[x  %% c;` and two spaces, a line break, and `]`
print `A[x %% c;`, the two spaces, and `]` one level deeper. Where the label
goes on after the line break of such a comment, both spaces before it stay.
Tildes remain content. Shape spellings, entities and HTML remain authored. The
Db keeps the text of a label, so an entity stays as written: `&amp;` is not
printed `&`, a change of the text that no rule of this document defines (see
[A text that the tree holds whole](./printed-form.md#a-text-that-the-tree-holds-whole)).

[fixture: labels/labels-closers] [fixture: labels/labels-leading-sensitive]
[fixture: labels/labels-leading-at-sign] [fixture: labels/labels-padding]
[fixture: labels/quoted-label-space-run-kept] [fixture: labels/labels-tilde]
[fixture: labels/labels-trim-sensitive-unsafe] [fixture:
labels/slash-label-padding-kept] [fixture: labels/label-comment-ends-label]
[fixture: labels/label-comment-ends-label-spaces-and-comment-lines] [fixture:
labels/label-comment-semicolon-ends-label] [fixture:
labels/label-comment-semicolon-label-goes-on] [test: agentflow: a no-break space
before a comment that ends the label of a vertex] [test: agentflow: U+3000
before a comment that ends the label of a vertex] [test: agentflow: U+2003
before a comment that ends the label of a vertex] [test: agentflow: U+2028
before a comment that ends the label of a vertex] [test: agentflow: U+2029
before a comment that ends the label of a vertex] [test: agentflow: a tab before
a comment that ends the label of a vertex] [test: agentflow: a no-break space
before a comment with a semicolon that ends the label of a vertex] [test:
agentflow: U+3000 before a comment with a semicolon that ends the label of a
vertex] [test: agentflow: U+2003 before a comment with a semicolon that ends the
label of a vertex] [test: agentflow: U+2028 before a comment with a semicolon
that ends the label of a vertex] [test: agentflow: U+2029 before a comment with
a semicolon that ends the label of a vertex] [test: agentflow: a tab before a
comment with a semicolon that ends the label of a vertex] [test: agentflow:
every whitespace character of the specification before a comment that ends the
label of a vertex] [test: agentflow: every whitespace character of the
specification before a comment with a semicolon that ends the label of a vertex]
[test: agentflow: a run of different whitespace characters before a comment that
ends the label of a vertex or of an edge] [fixture: labels/entity-kept]

Flow/connector heading titles follow
[Subgraph header](./flowchart.md#subgraph-header) instead: drop the whitespace
inside their brackets, including `[ T ]`, for the same reason as flowchart.

[fixture: names-and-headings/name-heading-touches-title]

Input (escaped): `"agentflow-beta TB\nA[text]"`.

[fixture: labels/labels-quote-unsafe]

Output
([labels/labels-quote-unsafe-output.mmd](../tests/fixtures/agentflow/labels/labels-quote-unsafe-output.mmd)):

```mmd
agentflow-beta TB
  A["text"]
```

### Vertices and lists

Reuse [Whitespace between tokens](./flowchart.md#whitespace-between-tokens) and
[Kept as written](./flowchart.md#kept-as-written): touching is lexical, and
whitespace on both sides of & distinguishes a group from one id. `A&B` stays
without spaces, since every version of mermaid.js that counts reads `A & B` as
two vertices `A` and `B` instead of one vertex `A&B` (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
Keep tight id/shape/:::/data suffixes, property Identifiers, actual comma-list
holes (including empty ends), comma-bearing single ids, occurrences and order.
The Agentflow grammar rejects whitespace separating an id, its shape, `:::`
class and data suffixes, so those parts stay joined. Do not split ids, sort
lists or manufacture a trailing comma: a style target, a class suffix, a second
class id or a vertex id that contains commas is one Identifier, and only the
grammar's own id lists split at commas; property operands are Identifiers, not
numbers to rewrite.

[fixture: vertices-and-lists/class-list-holes] [fixture:
vertices-and-lists/groups-suffixes]

Input (escaped): `"agentflow-beta TB\nA&B"`.

[fixture: vertices-and-lists/ampersand-id]

Output
([vertices-and-lists/ampersand-id-output.mmd](../tests/fixtures/agentflow/vertices-and-lists/ampersand-id-output.mmd)):

```mmd
agentflow-beta TB
  A&B
```

### Metadata blocks

Reuse [Data blocks](./flowchart.md#data-blocks): embedded contents are outside
the syntax tree. Keep each complete `@{...}` separately on its written vertex or
flow/connector heading, with adjacency, directives, aliases, unknown/prototype
keys, scalar/array/empty/multiline content. Agentflow's later routing and domain
aliases do not authorize rewriting or merging the YAML. Content-only rejection
uses the specified opaque reading; a raw rejection has no Db, and delimiter
failures remain failures.

[fixture: metadata-blocks/metadata-adjacent] [fixture:
metadata-blocks/metadata-alias-rewrite-unsafe] [fixture:
metadata-blocks/metadata-multiline]

A block on one line is printed with one space inside each end, and stays as
written in the cases listed under [Data blocks](./flowchart.md#data-blocks). In
a block with a directive, `A@{%%{init: {}}%%x:1}` stays, since some of the
versions of mermaid.js that count read `A@{%%{init: {}}%%x: 1}` with metadata
key `x` and value `1` instead of key `x:1` and value `null` (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
Where its line is too long it prints on lines, one entry on each, under the
conditions listed there, a form decided under
[rule 4](./printed-form.md#4-where-none-of-these-rules-gives-a-form) (see
[Forms decided under rule 4](./printed-form.md#forms-decided-under-rule-4)).

[fixture: metadata-blocks/long-split] [fixture: metadata-blocks/one-line-padded]
[fixture: metadata-blocks/one-line-space-only-padded] [fixture:
metadata-blocks/one-line-directive-kept] [fixture:
metadata-blocks/block-directive-colon-kept] [fixture:
metadata-blocks/one-line-kept-line-kept] [fixture:
metadata-blocks/one-line-touching-blocks-kept] [fixture:
metadata-blocks/one-line-separate-blocks-padded] [fixture:
metadata-blocks/compat-document-marker-data-block-kept] [fixture:
metadata-blocks/one-line-document-marker-after-space-padded] [fixture:
metadata-blocks/one-line-padded-zero-width] [fixture:
metadata-blocks/one-line-surrounding-trivia] [test: data blocks: agentflow one
line with U+2028 inside] [test: data blocks: agentflow one line with U+2029
inside] [test: data blocks: agentflow one line with no-break spaces at the ends]

For a block whose opener is immediately followed by a newline, move all body
lines by the same number of ASCII spaces so the shallowest text is one level
inside the statement, including in a `flow` body. Nested YAML keeps its relative
indentation; a separate `}` aligns with the statement, and a closer after text
moves with that line.

[fixture: metadata-blocks/zero-and-shallow] [fixture:
metadata-blocks/deep-nested-yaml] [fixture: metadata-blocks/closing-after-text]
[fixture: metadata-blocks/connector-multiline]

The other shared movement conditions and their reasons are in
[Data blocks](./flowchart.md#data-blocks): keep inline-opening blocks, embedded
directives, kept lines, zero-width indentation, blocks starting after the
statement's first line as written, and, with `useTabs`, the statement that holds
a block of several lines as a whole. Surrounding comments, directives, empty
descriptions, blank lines and separators follow their own rules.

[fixture: metadata-blocks/inline-and-directive-kept] [fixture:
metadata-blocks/kept-body-line] [fixture: metadata-blocks/zero-width-kept]
[fixture: metadata-blocks/tab-statement-space-body] [fixture:
metadata-blocks/use-tabs-empty-lines-kept] [fixture:
metadata-blocks/use-tabs-folded-empty-lines-kept] [fixture:
metadata-blocks/surrounding-trivia] [test: data blocks: agentflow U+2029] [test:
data blocks: agentflow CRLF]

The header of a `flow` or `global` container moves its block in the same way.

[fixture: metadata-blocks/container-header]

With `useTabs` the header is not printed as written, unlike a statement: the
`end` of the container stands at the indentation that the printer gives the
header, so the header takes it, and the lines of its block move with it, as
without `useTabs`.

[fixture: metadata-blocks/use-tabs-container-header-indented]

A statement that stands after the header on its line, as `A@{ … }` does in
`flow G; A@{ … }`, is a statement inside the container, and the indentation
written at the start of the line is that of the header, so the statement is not
printed as written either (see [Data blocks](./flowchart.md#data-blocks)). So is
a statement after an `end` when a statement of the container comes first, as
`A@{ … }` in `B; end; A@{ … }`, and a statement on a line that starts with
anything else than the things listed there, as `C; A@{ … }` does after `B -->`,
or after the rest of a directive that runs over lines.

[fixture: metadata-blocks/use-tabs-container-header-statement-moved] [fixture:
metadata-blocks/use-tabs-statement-before-end-moved] [fixture:
metadata-blocks/use-tabs-edge-continuation-moved] [fixture:
metadata-blocks/use-tabs-directive-continuation-moved]

A block after an arrow's newline retains its columns because it starts after the
statement's first line, and a statement with two blocks, of one line or of
several, retains both. The same holds for a `flow` header and a `connector`.

[fixture: metadata-blocks/later-statement-blocks-kept] [fixture:
metadata-blocks/adjacent-single-line-after-kept] [fixture:
metadata-blocks/adjacent-single-line-before-kept] [fixture:
metadata-blocks/separate-single-line-block-kept] [fixture:
metadata-blocks/container-header-adjacent-kept] [fixture:
metadata-blocks/connector-adjacent-single-line-kept]

Input (escaped): `"agentflow-beta TB\nA@{}@{\n}"`.

[fixture: metadata-blocks/metadata-empty]

Output
([metadata-blocks/metadata-empty-output.mmd](../tests/fixtures/agentflow/metadata-blocks/metadata-empty-output.mmd)):

```mmd
agentflow-beta TB
  A@{}@{
}
```

### Semicolons

Reuse [Semicolons](./flowchart.md#semicolons): ordinary separators and top-level
EmptyStatements add no meaning and are dropped; body EmptyStatements can be
members and stay on their own lines. Keep them in both flow and global bodies,
including after nested end. Do not flatten global membership. Kept lines and
style statements with a final empty style and following empty description blocks
override separator deletion.

[fixture: semicolons/semicolon-before-directive] [fixture:
semicolons/semicolons-drop-member-unsafe] [fixture: semicolons/semicolons-flow]
[fixture: semicolons/semicolons-global]

The line rule reads the text of a `%%` comment in the middle of a line, which an
agentflow accepts, but not a directive: `A[style:]-->B %% #x;` keeps its arrow
tight, while `C[style:]-->D %%{init:{"x":"#;"}}%%` is spaced as any other line.

[fixture: semicolons/line-rule-comment-read]

Input (escaped): `"agentflow-beta TB\nA;B;; ;"`.

[fixture: semicolons/semicolons-top]

Output
([semicolons/semicolons-top-output.mmd](../tests/fixtures/agentflow/semicolons/semicolons-top-output.mmd)):

```mmd
agentflow-beta TB
  A
  B
```

### Kept lines

Reuse [Statements one per line](./flowchart.md#statements-one-per-line) and
[Semicolons](./flowchart.md#semicolons) for the same reasons: removing or moving
a semicolon can change which one Mermaid ignores. A line with a semicolon inside
a value or comment therefore keeps all its statements and semicolons together.
The presence of whitespace between a colon and a later `#` is kept, since those
characters select the ignored semicolon. Ordinary token gaps still format. A
sole terminal ignored semicolon can drop when no other candidate remains.

[fixture: kept-lines/line-rule-kept] [fixture: kept-lines/line-rule-colon-space]
[fixture: kept-lines/line-rule-safe-terminal] [fixture:
kept-lines/line-rule-shift-unsafe] [fixture: kept-lines/line-rule-two-passes]

Where the `end` of a `flow`, or of `global`, stands on such a line and only `;`,
whitespace, comments, and directives follow it, the `end` goes to a line of its
own, and a `;` that stands alone at the top level after it is dropped there, as
in [Semicolons](./flowchart.md#semicolons): `flow F[x;]; A --> B; end ;  %% c`
is printed `flow F[x;]; A --> B;` and `end %% c`. A `;` before a directive
stays, and so does one before a comment that holds a `;` of its own, since the
line of the `end` then holds a `;` that the line keeps. A statement after the
`;` keeps the `end` on the line, and the `;` with it. A `;` that the line rule
ignores next to another `;`, as in `flow F[style:#x;]; A --> B; end ;;`, keeps
the line as written (see [Semicolons](./flowchart.md#semicolons)).

[fixture: semicolons/closing-semicolon-after-kept-line-dropped] [fixture:
semicolons/closing-semicolon-after-style-space-kept-line-dropped] [fixture:
semicolons/closing-semicolon-after-body-label-kept-line-dropped] [fixture:
semicolons/closing-semicolon-alone-after-kept-line-dropped] [fixture:
semicolons/closing-semicolon-tight-after-kept-line-dropped] [fixture:
semicolons/closing-semicolon-tab-after-kept-line-dropped] [fixture:
semicolons/closing-semicolons-after-kept-line-dropped] [fixture:
semicolons/global-closing-semicolon-after-kept-line-dropped] [fixture:
semicolons/closing-semicolon-before-statement-line-after-kept-line-dropped]
[fixture:
semicolons/closing-semicolon-before-empty-line-after-kept-line-dropped]
[fixture:
semicolons/closing-semicolon-before-comment-line-after-kept-line-dropped]
[fixture:
semicolons/closing-semicolon-before-directive-line-after-kept-line-dropped]
[fixture:
semicolons/closing-semicolon-before-semicolon-line-after-kept-line-dropped]
[fixture: semicolons/closing-semicolon-before-directive-after-kept-line-kept]
[fixture: semicolons/closing-semicolon-before-statement-after-kept-line-kept]
[fixture: semicolons/closing-semicolon-before-comment-with-semicolon-kept]
[fixture: semicolons/closing-semicolon-without-kept-line-dropped] [fixture:
semicolons/closing-semicolon-without-space-after-kept-line-dropped] [fixture:
semicolons/closing-two-semicolons-adjacent-after-kept-line-dropped] [fixture:
semicolons/closing-semicolon-at-end-of-text-after-kept-line-dropped] [fixture:
semicolons/closing-semicolon-next-to-ignored-semicolon-kept-as-written]
[fixture: semicolons/closing-semicolons-after-ignored-semicolon-kept-as-written]
[fixture:
semicolons/closing-semicolon-before-unclosed-directive-after-kept-line] [test:
agentflow: U+2028 after `end ;` of a flow on a kept line, then a statement]
[test: agentflow: U+2028 after `end ;` of a flow on a kept line, then a line
break] [test: agentflow: U+2028 after `end ;` of a flow on a kept line, then a
comment] [test: agentflow: U+2028 after `end ;` of a flow on a kept line, then a
directive] [test: agentflow: U+2028 after `end ;` of a flow on a kept line, then
a second `;`] [test: agentflow: U+2028 after `end ;` of a flow on a kept line,
then the end of the text] [test: agentflow: U+2028 between `end` and `;` of a
flow on a kept line, then a comment] [test: agentflow: U+2029 after `end ;` of a
flow on a kept line, then a statement] [test: agentflow: U+2029 after `end ;` of
a flow on a kept line, then a line break] [test: agentflow: U+2029 after `end ;`
of a flow on a kept line, then a comment] [test: agentflow: U+2029 after `end ;`
of a flow on a kept line, then a directive] [test: agentflow: U+2029 after
`end ;` of a flow on a kept line, then a second `;`] [test: agentflow: U+2029
after `end ;` of a flow on a kept line, then the end of the text] [test:
agentflow: U+2029 between `end` and `;` of a flow on a kept line, then a
comment] [fixture:
semicolons/closing-semicolons-after-ignored-semicolon-before-closed-directive-kept-as-written]
[fixture:
semicolons/closing-semicolons-after-ignored-semicolon-before-unclosed-directive-kept-as-written]
[fixture:
semicolons/closing-semicolons-after-ignored-semicolon-before-comment-line-kept-as-written]
[fixture:
semicolons/closing-semicolons-after-ignored-semicolon-before-empty-line-kept-as-written]
[fixture:
semicolons/closing-semicolons-after-ignored-semicolon-at-end-of-text-kept-as-written]
[test: agentflow: U+2028 after `end ;;` of a flow with an ignored `;`] [test:
agentflow: U+2029 after `end ;;` of a flow with an ignored `;`]

Where only the `end` of the `flow` around it follows the `end` of a `flow` on
its line, the inner `end` goes to a line of its own, as the outer `end` does
where nothing follows it: `flow F; flow G; A[x;] --> B; end end` is printed with
each `end` on a line of its own, one level apart, and so are three flows. A `;`
that stands alone between them is a statement of the `flow` around it, so it is
printed on a line of its own after the inner `end`, as on any line: `end ; end`
is printed as `end`, `;`, and `end` on three lines. An `end` that a statement
follows on its line stays with that statement, and with a closing that stands
between them: `end end ; C` stays as it is. A closing that stands after the
statement goes to a line of its own where nothing follows it: in
`flow F; flow G; A[x;] --> B; end; C; end` only the last `end` does. U+2028 and
U+2029 between or after the `end` are whitespace, as Agentflow's `end` takes
only spaces and tabs and no line feed, and they are dropped on a kept line as on
any line.

[fixture: semicolons/nested-closings-after-kept-line] [fixture:
semicolons/nested-closings-style-space-after-kept-line] [fixture:
semicolons/nested-closings-three-after-kept-line] [fixture:
semicolons/nested-closings-comment-after-kept-line] [fixture:
semicolons/nested-closings-semicolon-between-after-kept-line] [fixture:
semicolons/nested-closings-semicolons-after-kept-line] [fixture:
semicolons/nested-closings-semicolon-after-outer-after-kept-line] [fixture:
semicolons/nested-closings-statement-after-kept-line-kept] [fixture:
semicolons/nested-closings-line-break-between-after-kept-line] [fixture:
semicolons/nested-closings-without-kept-line] [fixture:
semicolons/nested-closings-statement-between-closings] [test: agentflow: U+2028
between two `end` of nested flows on a kept line] [test: agentflow: U+2028 after
the `;` between two `end` of nested flows on a kept line] [test: agentflow:
U+2028 after a space after the `;` between two `end` of nested flows on a kept
line] [test: agentflow: U+2028 after two `end` of nested flows on a kept line]
[test: agentflow: U+2029 between two `end` of nested flows on a kept line]
[test: agentflow: U+2029 after the `;` between two `end` of nested flows on a
kept line] [test: agentflow: U+2029 after a space after the `;` between two
`end` of nested flows on a kept line] [test: agentflow: U+2029 after two `end`
of nested flows on a kept line] [test: agentflow: U+2028 after the `end` of a
flow on a kept line, then a line break] [test: agentflow: U+2028 after the `end`
of a flow on a kept line, then the end of the text] [test: agentflow: U+2028
after the `end` of a flow on a kept line, then a statement] [test: agentflow:
U+2028 after the `end` of a flow on a kept line, then a line break and a
statement] [test: agentflow: U+2029 after the `end` of a flow on a kept line,
then a line break] [test: agentflow: U+2029 after the `end` of a flow on a kept
line, then the end of the text] [test: agentflow: U+2029 after the `end` of a
flow on a kept line, then a statement] [test: agentflow: U+2029 after the `end`
of a flow on a kept line, then a line break and a statement] [fixture:
semicolons/nested-closings-statement-between-closings-closed-directive-before-statement]
[fixture:
semicolons/nested-closings-statement-between-closings-unclosed-directive-after-last-end]
[fixture:
semicolons/nested-closings-statement-between-closings-ignored-semicolon-after-last-end]
[fixture:
semicolons/nested-closings-statement-between-closings-comment-line-after-last-end]
[fixture:
semicolons/nested-closings-statement-between-closings-empty-line-after-last-end]
[fixture: semicolons/nested-closings-statement-between-closings-at-end-of-text]
[test: agentflow: U+2028 after the `;` after the inner `end` of nested flows,
before a statement and the last `end`] [test: agentflow: U+2029 after the `;`
after the inner `end` of nested flows, before a statement and the last `end`]

Keep a separating semicolon after a statement or name ending in `accTitle`,
`accDescr`, `direction`, `click`, `call` or `href`, and after any id ending in
`direction`: these words can consume a new LF and the following text. Keep a
style statement whose final style is empty together with following empty
description blocks that start on its line; splitting them would change how the
required whitespace is read.

[fixture: kept-lines/word-separator-kept] [corpus fixture:
agentflow/gram-empty-description-splits-interpolate-spaces]

A semicolon that terminates an unclosed directive stays where written. Keep
complete values and comments when they cross a kept line, and keep U+2028/U+2029
where they delimit the text on which the semicolon rule operates. Agentflow's
`end` and `global` do not consume LF, and its real comments need none of
flowchart's handling of percent text read as a vertex.

[fixture: kept-lines/open-directive-semicolon] [corpus fixture:
agentflow/lex-style-trigger-ls-segment]

Input (escaped): `"agentflow-beta TB\nA[Style:#x;y]"`.

[fixture: kept-lines/line-rule-nonmatch]

Output
([kept-lines/line-rule-nonmatch-output.mmd](../tests/fixtures/agentflow/kept-lines/line-rule-nonmatch-output.mmd)):

```mmd
agentflow-beta TB
  A[Style:#x;y]
```

### Blank lines

Reuse [Blank lines](./flowchart.md#blank-lines). Collapse ordinary and
whitespace-only runs to one and drop document/body-edge blanks, including inside
flows/globals. Preserve blanks inside values, metadata and directives. An empty
line inside a quoted label is part of that label in mermaid.js's Db, so removing
the line changes the label text. Agentflow comments leave LF and do not consume
following blanks; no blank-line-pairing divergence applies. Default size
branches override ordinary blank layout.

[corpus fixture: agentflow/lex-brace-string-keeps-blank-line]

[fixture: blank-lines/blank-comment-content] [fixture: blank-lines/blank-runs]
[fixture: blank-lines/blank-value]

Input (escaped): `"agentflow-beta TB\nA\n%% c\n\n\nB"`.

[fixture: blank-lines/blank-comments]

Output
([blank-lines/blank-comments-output.mmd](../tests/fixtures/agentflow/blank-lines/blank-comments-output.mmd)):

```mmd
agentflow-beta TB
  A
  %% c

  B
```

### Comments

Consecutive ordinary separators and top-level EmptyStatements before a real
comment are removed as well.

[fixture: comments/repeated-separators-before-comment] [fixture:
comments/comment-looking-values] [fixture: comments/comments-align]

Align standalone comments with neighbouring statements and retain the author's
complete text, including trailing spaces, except that the spaces and tabs at the
end of a comment after a statement are dropped where the comment holds a `;`
(`A %% c;  ` is printed `A %% c;`) and stay where it holds none. The final
spaces and tabs of a trailing comment that contains `;` stand at the line end,
where Prettier removes them, so
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives their removal
while the comment and its semicolon remain.

[fixture: comments/comments-align] [fixture: comments/comment-trailing]
[fixture:
comments/comment-line-ending-ignored-semicolon-trailing-whitespace-kept]
[fixture: comments/trailing-comment-semicolon-trailing-whitespace] [fixture:
comments/trailing-comment-semicolon-trailing-whitespace-statements] [fixture:
comments/trailing-comment-semicolon-trailing-whitespace-header-and-lines]

[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives one space
before a comment that stands after something on its line, as Prettier prints
`x = 1;   // c` as `x = 1; // c`. Agentflow recognizes real comments after
semicolons and description closers; ordinary separator semicolons before them
can drop. At normal size comments continue through LS/PS until LF/EOF, and a
percent pair inside an already-started id is id text. Label-side padding stays
under Labels.

[fixture: comments/comment-label] [fixture:
comments/comment-label-spaces-unsafe]

Strings, markdown, split labels, accessibility, callbacks and data retain
apparent comments as values.

[fixture: comments/comment-looking-values]

Bare %% and specified pre-header percent-brace comments remain authored.
Above-limit common regions are covered by Default size branches.

Input (escaped): `"agentflow-beta TB\nA;%% c\nB"`.

[fixture: comments/comment-after-semicolon]

Output
([comments/comment-after-semicolon-output.mmd](../tests/fixtures/agentflow/comments/comment-after-semicolon-output.mmd)):

```mmd
agentflow-beta TB
  A %% c
  B
```

### Directives

Removal supplies no separator. Keep contents, order and continuation columns,
align standalone directives, and place a directive within a printed line as
under [Directives](./flowchart.md#directives). Standalone directives stand at
the depth of the neighbouring statements. Where an ordinary gap supplies a
space, an inline directive follows that space and touches the next unit. A
directive after a header separator moves into the body with its following
statement, keeping whether they touch. A line already kept under Kept lines
stays together.

[fixture: directives/header-directive-before-body] [fixture:
directives/header-directive-touching-body] [fixture:
directives/header-touching-kept-line] [fixture: directives/directive-gap]
[fixture: directives/directive-header] [fixture: directives/directive-multiline]
[fixture: directives/directive-touch] [fixture: directives/directive-value]
[fixture: directives/directives-align]

Keep unclosed EOF endings and semicolons that stop a directive. Name text,
first-style whitespace and the padding before a label comment that the label
goes on after override generic gap collapse. Token-internal directives remain
specified failures; formatting never repairs accepted text or data placements.

[fixture: directives/directive-eof]

Input (escaped): `"agentflow-beta TB;%%{init: {}}%%A"`.

[fixture: directives/header-init-directive-touching-body]

Output
([directives/header-init-directive-touching-body-output.mmd](../tests/fixtures/agentflow/directives/header-init-directive-touching-body-output.mmd)):

```mmd
agentflow-beta TB
  %%{init: {}}%%A
```

### Default size branches

Agentflow differs from flowchart because its default comment preservation
changes above 50000 UTF-16 code units. Measure after frontmatter/directive
removal, counting CRLF as one; a surrogate pair counts as two units.

[fixture: default-size-branches/size-utf16-surrogate]

At or above 50000 retain the complete diagram text and ending.

[fixture: default-size-branches/size-preserving-to-fallback-unsafe]

Below it apply ordinary layout only when the planned printed measurement also
remains strictly below 50000; otherwise retain the complete diagram and ending.

[fixture: default-size-branches/size-below-planned-crossing]

This prevents comment removal from changing the Db, including a restored host
BOM, growth from indentation/final LF, and shrinkage from trimming. Never remove
authored comments to meet the limit. Frontmatter remains eligible for guarded
YAML formatting; configured CR/LF conversion remains shared. An escaped test
string covers the restored BOM; the corpus covers CRLF at the size boundary.

[test: agentflow: size-bom-grow-unsafe] [corpus fixture:
agentflow/comment-default-size-above-crlf]

The layout plan measures recorded spans without output parsing or site-config
inference.

For example, with `tabWidth: 0`, the fixed input `size-utf16-exact-zero` has
50000 UTF-16 units and 49999 code points. Its output is identical, including its
two-space body prefix and ending; normalizing it to one space would incorrectly
use the count of Unicode characters.

[fixture: default-size-branches/size-utf16-exact-zero]

### Direction

Reuse [Direction](./flowchart.md#direction) and the
[Indentation](./flowchart.md#indentation) exception for the same reasons: TD is
observable within a container, and indentation can make a line become a
direction statement before its accessibility text is read. Keep the written
keyword, direction value, ignored text before and after it, and authored line
breaks. Mermaid chooses a direction by its ordered direction alternatives and
the last matching occurrence within that alternative; formatting does not
replace that choice with the last direction-looking word. Normalize only
ordinary gaps. `direction` is a keyword before the value it takes.
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) puts one space
between them.

[fixture: direction/direction-text] [corpus fixture:
agentflow/lex-direction-value-priority] [fixture:
direction/direction-block-directive] [fixture: direction/direction-gaps]
[fixture: direction/direction-keyword-directive] [fixture:
direction/direction-lowercase-text] [fixture:
direction/direction-lowercase-value] [fixture: direction/direction-title-column]
[fixture: direction/direction-value-directive]

Keep the source columns of non-direction lines when indentation would make
`direction` followed by whitespace and `TB`, `BT`, `RL`, `LR` or `TD` a
direction statement. Check this text after directive removal and after joining
an accessibility keyword to its next-line value; lowercase lookalikes do not
qualify. Conversely, actual direction statements retain a positive body step at
`tabWidth: 0`, so an accessibility or style prefix cannot regain column-one
priority.

[fixture: direction/planned-title-direction] [fixture:
direction/planned-description-direction] [fixture:
direction/zero-title-indented] [fixture: direction/zero-description-indented]
[fixture: direction/zero-style-direction]

A line that the printer keeps together, that starts at the first column with a
description block that has a text, and that holds a direction statement after
the block in the same segment of the line keeps its written indentation as well,
with its statements printed by the ordinary rules: indented, the direction line
would take the block with it and the description would be empty (see
[Indentation](./flowchart.md#indentation)).

[fixture: direction/joined-direction-column-zero] [fixture:
direction/joined-direction-end-of-text] [fixture:
direction/split-direction-after-description] [fixture:
direction/unclosed-directive-before-direction] [test: agentflow direction after
a U+2029 and a comment line]

This includes a line that stays as written because an ignored `;` stands next to
another `;`: `accDescr {style:#x} direction LR;;` stays at the first column,
also in a `flow`, since mermaid.js reads an empty description where it is
indented. Without the `;`, or with only one, the description and the direction
move to lines of their own, as before.

[fixture: direction/verbatim-direction-description] [fixture:
direction/verbatim-direction-description-in-flow] [fixture:
direction/style-description-direction-split]

Input (escaped): `"agentflow-beta TB\nflow F\ndirection TD\nA\nend"`.

[fixture: direction/direction-td-change-unsafe]

Output
([direction/direction-td-change-unsafe-output.mmd](../tests/fixtures/agentflow/direction/direction-td-change-unsafe-output.mmd)):

```mmd
agentflow-beta TB
  flow F
    direction TD
    A
  end
```

### Accessibility

Reuse [Accessibility lines](./flowchart.md#accessibility-lines) with the same
reason: among Db-equal forms, follow the sibling diagram types unless there is a
reason of this diagram's own. Agentflow has none for an ordinary accessibility
line, so C4, class, usecase and both graph types share `accTitle: value` and
`accDescr: value`. The colon touches the keyword, one ASCII space precedes the
trimmed value, and inline `%%` and `#` remain value text. A run of spaces and
tabs inside the value of an `accDescr` is printed as one space (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)),
and that of an `accTitle` stays as written, since the browser shows it as a
tooltip.

[fixture: accessibility/tight-colon] [fixture: accessibility/spaced-colon]
[fixture: accessibility/value-runs-collapsed] [fixture:
accessibility/inline-percent-hash]

Empty and whitespace-only values keep `accTitle:` or `accDescr:` without a
following space. A space after an empty `accTitle:` or `accDescr:` would stand
at the line end, where Prettier removes whitespace, so
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives the form
without a following space.

[fixture: accessibility/empty-title] [fixture: accessibility/empty-description]
[fixture: accessibility/accessibility-empty-null] [corpus fixture:
agentflow/db-acctitle-eof] [corpus fixture: agentflow/db-accdescr-eof]

Ordinary next-line values join, as Mermaid reads them.

[fixture: accessibility/next-line-values]

Unlike flowchart, a comment-looking line after the colon is itself value text;
join it as such and leave the next statement separate.

[fixture: accessibility/next-line-percent-value]

A directive inside the statement declines ordinary joining and keeps the
previous multiline statement layout: continuation and directive lines stand one
level deeper than the keyword, with their text and authored line breaks
retained. Rule 1 names no mark for a line break, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides, as [sequence](./sequence.md#multi-line-statements),
[gantt](./gantt.md#multi-line-statements), and
[journey](./journey.md#multi-line-statements) keep a line break next to a
comment or a directive and the whitespace before it, where no other rule keeps
the layout as written (where the Db holds the text with its whitespace, where
moving a line makes mermaid.js reject the text, and the like).

[fixture: accessibility/inline-directive-kept] [fixture:
accessibility/next-line-directive-kept] [fixture:
accessibility/title-directive-continuation] [corpus fixture:
agentflow/db-accdescr-directive-next-line] [corpus fixture:
agentflow/lex-directive-acctitle-next-line]

The same exceptions apply: non-separator `;` lines under
[Kept lines](#kept-lines) retain the accessibility text and whitespace beside
`;`, including when the semicolon is in another statement. A statement written
over several lines is joined also when it holds a `;` that separates statements:
on a line that holds no other `;`, the printer puts the statements on lines of
their own, so only the statement itself is joined.

[fixture: accessibility/semicolon-value-kept] [fixture:
accessibility/neighbour-semicolon-kept]

A `;` alone does not prevent joining.

[fixture: accessibility/next-line-semicolon-joined]

Direction-text lines keep their text, line breaks and columns under
[Direction](#direction), and other documented kept-line reasons still take
priority.

[fixture: accessibility/direction-text-kept] [fixture:
accessibility/next-line-direction-kept]

Ordinary indentation uses the same positive minimum at `tabWidth: 0` and the
same `useTabs` step; both options keep the exceptions.

[fixture: accessibility/zero-width] [fixture: accessibility/tabs]

CR normalization, accepted NBSP/U+2028/U+2029 in exterior gaps, internal Unicode
value characters and Unicode whitespace beside a kept `;` follow the same
flowchart rule, for the same reasons. Prettier prints a key colon touching its
key with one ASCII space after it, so
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives that form to
accepted exterior gaps beside an accessibility colon. Internal NBSP, U+2028 and
U+2029 stay because replacing them with spaces changes accessibility text in
mermaid.js's Db, including beside a retained semicolon. U+2028 and U+2029 also
delimit the text read by the semicolon rule, as
[Kept lines](./agentflow.md#kept-lines) describes. These cases use escaped
tests.

[corpus fixture: agentflow/lex-acctitle-u2028] [corpus fixture:
agentflow/lex-accdescr-u2029] [corpus fixture:
agentflow/lex-accessibility-semicolon-value]

[test: graph accessibility: agentflow cr-lines] [test: graph accessibility:
agentflow unicode-gaps] [test: graph accessibility: agentflow unicode-values]
[test: graph accessibility: agentflow unicode-semicolon-kept]

Description blocks also reuse
[Accessibility lines](./flowchart.md#accessibility-lines) and
[Multi-line values](./flowchart.md#multi-line-values) with the same sibling
reason: ordinary closed blocks with no text or trivia print their interior as
`{}`, even with interior spaces or blank lines. The exterior keyword-to-brace
gap prints one space, even when originally touching, to distinguish the keyword
from its body: `accDescr {}`.

[fixture: accessibility/empty-block-touching-keyword]

No text needs surrounding whitespace, so this follows usecase's Db-equal form.

[fixture: accessibility/empty-block-tight] [fixture:
accessibility/empty-block-spaced] [fixture: accessibility/empty-block-lines]

Accepted NBSP/U+2028/U+2029 interior whitespace also disappears.

[test: accessibility blocks: agentflow empty-block-unicode]

Kept lines and directive interiors retain their authored layout.

[fixture: accessibility/empty-block-semicolon-kept] [fixture:
accessibility/empty-block-directive-kept]

Blocks on one line follow
[A description block on one line](./compatibility.md#a-description-block-on-one-line).

[fixture: accessibility/block-tight-text] [fixture:
accessibility/block-spaced-text] [fixture: accessibility/block-padded-text]
[fixture: accessibility/block-left-padding-only] [fixture:
accessibility/block-right-padding-only]

At the top level, align the body lines of a closed description block one step
inside its statement. The body lines of a closed description block stand one
level inside its top-level statement. Inside a flow or global body, keep their
columns, because the raw text also participates in membership. Changing a global
body's text can change the members of a later flow.

[fixture: accessibility/global-description-membership-kept]

A closed description brace on its own line aligns with `accDescr`, whether
written at column zero or indented.

[fixture: accessibility/block-close-column-zero] [fixture:
accessibility/block-close-indented] [fixture:
accessibility/block-comment-close-column-zero] [fixture:
accessibility/block-comment-close-indented]

The same empty-block and closer rules apply with the minimum body step at
`tabWidth: 0`.

[fixture: accessibility/block-zero-width]

Keep unclosed block contents and EOF ending as written, without adding a brace
or newline. The text of an unclosed description block does not become the
accessibility description in mermaid.js's Db. Adding `}` would apply that text,
so the block stays open. Unlike flowchart, comment-looking description lines are
real values; their indentation follows the same block-context rule. Closed empty
descriptions stay separate statements where the grammar places them; Name/click
placements stay IgnoredText, and style statements with a final empty style stay
with following empty description blocks under Kept lines. An erased empty
string, empty markdown string or empty call where a statement starts is not a
statement: it is rejected as `tokenless-empty-forms`.

[corpus fixture: agentflow/db-accessibility-unclosed-block] [corpus fixture:
agentflow/db-accessibility-block]

[fixture: accessibility/accessibility-block] [fixture:
accessibility/accessibility-comment-indent-alternative] [fixture:
accessibility/accessibility-comment-is-value] [fixture:
accessibility/accessibility-empty-block] [fixture:
accessibility/accessibility-lines] [fixture:
accessibility/accessibility-open-eof]

Input (escaped):
`"agentflow-beta TB\naccTitle:Compact title\naccDescr:Compact description"`.

Output
([accessibility/tight-colon-output.mmd](../tests/fixtures/agentflow/accessibility/tight-colon-output.mmd)):

```mmd
agentflow-beta TB
  accTitle: Compact title
  accDescr: Compact description
```

Input (escaped): `"agentflow-beta TB\naccDescr {a}\nA[Block spacing]"`.

Output
([accessibility/block-tight-text-output.mmd](../tests/fixtures/agentflow/accessibility/block-tight-text-output.mmd)):

```mmd
agentflow-beta TB
  accDescr: a
  A["Block spacing"]
```

Input (escaped):
`"agentflow-beta TB\naccDescr: previous description\naccDescr { }\nA[Empty spacing]"`.

Output
([accessibility/empty-block-spaced-output.mmd](../tests/fixtures/agentflow/accessibility/empty-block-spaced-output.mmd)):

```mmd
agentflow-beta TB
  accDescr: previous description
  accDescr {}
  A["Empty spacing"]
```

Input (escaped):
`"agentflow-beta TB\naccTitle:\n%%{init: {}}%%\nTitle after directive\nA[Continuation]"`.

Output
([accessibility/title-directive-continuation-output.mmd](../tests/fixtures/agentflow/accessibility/title-directive-continuation-output.mmd)):

```mmd
agentflow-beta TB
  accTitle:
    %%{init: {}}%%
    Title after directive
  A["Continuation"]
```

### Multiline statements and values

Ordinary accessibility colon lines and closed empty description blocks without
trivia instead follow [Accessibility](#accessibility), joining their lines.

[fixture: accessibility/next-line-values] [fixture:
accessibility/empty-block-lines]

Reuse [Multi-line statements](./flowchart.md#multi-line-statements) and
[Multi-line values](./flowchart.md#multi-line-values) for the same reason: later
value columns are characters except for the description-body indentation
described in [Accessibility](#accessibility). Indent ordinary continuation
tokens one additional step; keep string/markdown/split text, Name, metadata,
directive and multiline click continuation columns. An extra whitespace
character in a click gap after the ids and the callback can reject (see
[Click statements](#click-statements)). Agentflow folds only line whitespace
immediately before the next LF after a closing brace; later blank LFs remain.
Keep those raw value lines, including LS/PS/VT/FF/NBSP, and never align an
opaque data closer as an accessibility closer. mermaid.js keeps those later
blank lines, and the spaces that start the line after them, in the text of the
vertex: the label `"a}  \n\n  b"`, written with escapes, has the text
`a}\n\n  b`. Removing them changes that value, beyond the allowed Db exceptions.
A U+2028 inside a quoted label stays as written because mermaid.js stores it as
part of the vertex text in the Db. Replacing it with a space or a line feed
changes that value, beyond the allowed Db exceptions.

[corpus fixture: agentflow/lex-brace-string-keeps-blank-line] [corpus fixture:
agentflow/lex-quoted-u2028]

[fixture: multiline-statements-and-values/brace-blank-kept] [fixture:
multiline-statements-and-values/multiline-chain] [fixture:
multiline-statements-and-values/multiline-string]

Input (escaped): `"agentflow-beta TB\nA\nclick A\ncb"`.

[fixture: multiline-statements-and-values/multiline-click]

Output
([multiline-statements-and-values/multiline-click-output.mmd](../tests/fixtures/agentflow/multiline-statements-and-values/multiline-click-output.mmd)):

```mmd
agentflow-beta TB
  A
  click A
cb
```

### Chains and line wrapping

Reuse [Chains](./flowchart.md#chains) and
[Line wrapping](./flowchart.md#line-wrapping): author-chosen statement
boundaries stay, and `printWidth` never redistributes links. Keep long lines,
except that a data block on one line whose line is wider than `printWidth`
prints on lines under the conditions of [Metadata blocks](#metadata-blocks), a
form decided under
[rule 4](./printed-form.md#4-where-none-of-these-rules-gives-a-form); keep
explicit split statements, repetitions and source order. Agentflow routing,
generated ids and completion-order containers make that order observable. Domain
shapes, numeric/prototype operands, entities, HTML and diagnostic-related
spelling remain authored even when a Db-normalized alternative exists.

[fixture: chains-and-line-wrapping/long-chain] [fixture:
chains-and-line-wrapping/order-repeated]

Input (escaped): `"agentflow-beta TB\nA[first]\nA[second]"`.

[fixture: chains-and-line-wrapping/order-sort-unsafe]

Output
([chains-and-line-wrapping/order-sort-unsafe-output.mmd](../tests/fixtures/agentflow/chains-and-line-wrapping/order-sort-unsafe-output.mmd)):

```mmd
agentflow-beta TB
  A["first"]
  A["second"]
```

### Trailing whitespace

Reuse [Style trailing whitespace](./flowchart.md#style-trailing-whitespace): the
tests compare styles without their trailing whitespace, while an all-whitespace
style still needs a written whitespace character. Remove harmless exterior and
trailing style padding; keep all-whitespace styles, including the last style
after commas (including escaped classDef commas), directives, ignored semicolons
and split empty-description groups. Extra first-style whitespace is leading
value text and stays. Name endings follow Names and headings. The padding before
a label comment that the label goes on after, strings, data, comments,
directives and later value columns stay. Forbidden class/callback/title padding
remains rejected; the size guard overrides trimming. For the quoted vertex label
with `before`, a comment-looking line, and `after` at the 50000-unit boundary,
`A` stays at column zero: every version of mermaid.js that counts drops the
comment-looking line from the label when two spaces precede `A` (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).

[fixture: trailing-whitespace/trailing-comment] [fixture:
trailing-whitespace/trailing-name-dropped] [fixture:
trailing-whitespace/trailing-null-style] [fixture:
default-size-branches/size-preserving-to-fallback-unsafe]

A `linkStyle` that ends with a backslash keeps the whitespace after it too, as
one character, as in [flowchart](./flowchart.md#style-trailing-whitespace).

[fixture: trailing-whitespace/link-style-backslash-at-end-kept]

Input (escaped): `"agentflow-beta TB\nA   \nA-->B \t\nstyle A fill:red \t"`.

[fixture: trailing-whitespace/trailing-exterior]

Output
([trailing-whitespace/trailing-exterior-output.mmd](../tests/fixtures/agentflow/trailing-whitespace/trailing-exterior-output.mmd)):

```mmd
agentflow-beta TB
  A
  A --> B
  style A fill: red
```

### Line terminators

Reuse shared [Line endings](./compatibility.md#line-endings) with the same
reason: Mermaid converts CRLF and CR to LF before reading, and Prettier prints
the configured endOfLine. LS/PS are not generic newlines: keep them in
values/comments, textual style segments and open-directive boundaries. Ordinary
accepted header/operator whitespace can normalize; gaps that require one
whitespace character and the whitespace ending click-id name text retain their
own roles. NEL is not whitespace. Shared BOM/frontmatter limitations still
apply. Escaped cases below retain Unicode and control characters without putting
them literally in package fixtures.

Input `"agentflow-beta TB\r\nA[\"a\r\n b\"]\r\n"` becomes output
`"agentflow-beta TB\n  A[\"a\n b\"]\n"`.

[test: agentflow: eol-crlf]

### Colors

A color in a style is printed in lower case, as the examples in the
documentation of mermaid.js write it and as the CSS formatter of Prettier prints
it: `style A fill:#F9F,stroke:#ABCDEF` is printed
`style A fill: #f9f, stroke: #abcdef`. The colors in the styles of the `style`,
`classDef`, and `linkStyle` statements of an agentflow diagram are printed so. A
color is a `#` and 3, 4, 6, or 8 hexadecimal digits that stand alone in the
value of a style; it is never shortened, and a text that is no color stays as
written (see
[Colors that are drawn the same](./compatibility.md#colors-that-are-drawn-the-same)).

[fixture: colors/colors-in-lower-case]

Input
([colors/colors-in-lower-case-input.mmd](../tests/fixtures/agentflow/colors/colors-in-lower-case-input.mmd)):

```mmd
agentflow-beta TB
A --> B
C:::c
style A fill:#F9F,stroke:#ABCDEF
classDef c fill:#DEADBE
linkStyle 0 stroke:#FF0000
linkStyle default stroke:#ABCDEF
```

Output
([colors/colors-in-lower-case-output.mmd](../tests/fixtures/agentflow/colors/colors-in-lower-case-output.mmd)):

```mmd
agentflow-beta TB
  A --> B
  C:::c
  style A fill: #f9f, stroke: #abcdef
  classDef c fill: #deadbe
  linkStyle 0 stroke: #ff0000
  linkStyle default stroke: #abcdef
```

### Quotes

The name of a flow and of a connector in quotes is printed without them, under
the conditions of the name of a subgraph of a flowchart (see
[Quotes](./flowchart.md#quotes)), as the examples in the documentation of
mermaid.js write them, 17 and 2 times without quotes and never in quotes (see
[The quotes of a text](./compatibility.md#the-quotes-of-a-text)):
`flow "My Flow"` is printed `flow My Flow`, `flow "my-team"` is printed
`flow my-team`, and `connector "Join"` is printed `connector Join`. A name that
is more than one label (`connector I "" J`) stays as written, and so does a name
that ends with `direction`, since the lexer reads `direction`, white space (a
line break too), and `TB`, `BT`, `RL`, `LR`, or `TD` as one line
(`flow "xdirection"` followed by a line `TB --> B`).

[fixture: quotes/names-next-to-a-direction-line]

The title of a connector in brackets is printed in quotes, as the examples write
the 2 titles: `connector C [Merge results]` is printed
`connector C["Merge results"]`. mermaid.js reads the title in both forms as the
same text. A title is put in quotes where it starts with a letter or a digit and
holds ASCII letters, digits, spaces, `_`, `-`, `.`, `,`, `:`, `!`, and `?`, so
that the padding inside its brackets, which the printer drops, never stands
before a quote; a title with another character, such as `[a/b]`, `[ /x/ ]`,
``[`md`]``, and `[日本語]`, stays as written. A title is put in quotes before a
comment, a `;`, or a directive, which a string does not join:
`connector C3 [T]%%{init: {}}%%` is printed `connector C3["T"]%%{init: {}}%%`. A
name that a comment follows keeps its quotes.

[fixture: quotes/names-without-quotes] [fixture: quotes/names-that-need-quotes]
[fixture: quotes/connector-titles-in-quotes] [fixture:
quotes/connector-titles-as-written] [fixture:
quotes/names-and-titles-before-a-comment]

The title of a flow and the label of a shape are printed in quotes in the same
way, as the examples write the 17 titles and the 47 labels, none without quotes:
`flow F [T]` is printed `flow F["T"]`, and `A[Start]` is printed `A["Start"]`.
The label of a link is printed without quotes, as the examples write the 2
labels: `A -->|"text"| B` is printed `A -- text --> B` (see
[Link label form](./flowchart.md#link-label-form)), except that a label with a
`--` between two arrows keeps its quotes (`A -- "a--b" --> B`), since the lexer
ends the text there. The text is put in quotes under the conditions of the title
of a connector, and a label that is the first unit of its line, as after a
comment line, a directive on a line of its own, or a U+2028 or U+2029, stays as
written, since mermaid.js rejects a string there. mermaid.js reads `A["x"]` as a
string and `A[x]` as a text, and its Db holds the `labelType` `string` for the
first and `text` for the second, but it draws the same figure (see
[Labels that are drawn the same](./compatibility.md#labels-that-are-drawn-the-same)).

[fixture: quotes/flow-titles-in-quotes] [fixture: quotes/labels-in-quotes]
[fixture: quotes/labels-after-a-comment-line] [fixture:
quotes/labels-after-a-directive-line] [fixture:
quotes/edge-labels-with-two-dashes]

Input
([quotes/names-without-quotes-input.mmd](../tests/fixtures/agentflow/quotes/names-without-quotes-input.mmd)):

```mmd
agentflow-beta TB
flow "Main"
A --> B
end
flow "My Flow" [T]
C --> D
end
flow "F3"["T"]
E --> F
end
flow "F4"@{ x: 1 }
G --> H
end
connector "Join"
connector "Join2" ["Merge results"]
connector "J3"@{ x: 1 }
flow "my-team"
M --> N
end
connector "my-join"
flow Already
I --> J
end
```

Output
([quotes/names-without-quotes-output.mmd](../tests/fixtures/agentflow/quotes/names-without-quotes-output.mmd)):

```mmd
agentflow-beta TB
  flow Main
    A --> B
  end
  flow My Flow["T"]
    C --> D
  end
  flow F3["T"]
    E --> F
  end
  flow F4@{ x: 1 }
    G --> H
  end
  connector Join
  connector Join2["Merge results"]
  connector J3@{ x: 1 }
  flow my-team
    M --> N
  end
  connector my-join
  flow Already
    I --> J
  end
```

Input
([quotes/connector-titles-in-quotes-input.mmd](../tests/fixtures/agentflow/quotes/connector-titles-in-quotes-input.mmd)):

```mmd
agentflow-beta TB
connector C1 [Merge results]
connector C2 [ Padded ]
connector C3 [x-y]
connector C4 [A,b: c!]
connector C5 [1.5]
connector C6[Touching]
connector C7 ["Already"]
connector C8 [Done?]@{ x: 1 }
```

Output
([quotes/connector-titles-in-quotes-output.mmd](../tests/fixtures/agentflow/quotes/connector-titles-in-quotes-output.mmd)):

```mmd
agentflow-beta TB
  connector C1["Merge results"]
  connector C2["Padded"]
  connector C3["x-y"]
  connector C4["A,b: c!"]
  connector C5["1.5"]
  connector C6["Touching"]
  connector C7["Already"]
  connector C8["Done?"]@{ x: 1 }
```

Input
([quotes/labels-in-quotes-input.mmd](../tests/fixtures/agentflow/quotes/labels-in-quotes-input.mmd)):

```mmd
agentflow-beta TB
A[text]
B["text"]
C(Is it ready?)
D{Decision}
E[(Database v2)]
F[a/b]
G[`md`]
H -- text --> I
H -->|"text"| I
J -->|"a/b"| K
flow F1[title]
E1
end
flow F2["title"]
G1
end
```

Output
([quotes/labels-in-quotes-output.mmd](../tests/fixtures/agentflow/quotes/labels-in-quotes-output.mmd)):

```mmd
agentflow-beta TB
  A["text"]
  B["text"]
  C("Is it ready?")
  D{"Decision"}
  E[("Database v2")]
  F[a/b]
  G[`md`]
  H -- text --> I
  H -- text --> I
  J -->|"a/b"| K
  flow F1["title"]
    E1
  end
  flow F2["title"]
    G1
  end
```

### Frontmatter YAML

Reuse [Frontmatter YAML](./flowchart.md#frontmatter-yaml) and shared
[Frontmatter](./compatibility.md#frontmatter): safe YAML benefits from normal
formatting while hazardous text must retain its reading. Preserve delimiter
lines/padding; retain malformed YAML, indented delimiters, HTML-tag starts and
formatted delimiter hazards. YAML uses the shared significantIndentationWidth
minimum of one even at tabWidth zero, as do Agentflow bodies. Frontmatter
title/config is separate from accessibility and opaque metadata. Use the
specified body-only HTML reading across frontmatter; do not requote body text to
imitate raw preprocessing.

[fixture: frontmatter-yaml/frontmatter-delimiter-guard] [fixture:
frontmatter-yaml/frontmatter-html-guard] [fixture:
frontmatter-yaml/frontmatter-indented] [fixture:
frontmatter-yaml/frontmatter-yaml] [fixture:
frontmatter-yaml/frontmatter-zero-block-scalar] [fixture:
frontmatter-yaml/frontmatter-zero-width]

Input (escaped): `"---\ntitle: [\n---\nagentflow-beta TB\nA"`.

[fixture: frontmatter-yaml/frontmatter-invalid]

Output
([frontmatter-yaml/frontmatter-invalid-output.mmd](../tests/fixtures/agentflow/frontmatter-yaml/frontmatter-invalid-output.mmd)):

```mmd
---
title: [
---
agentflow-beta TB
  A
```

### Final newline

Reuse [Blank lines](./flowchart.md#blank-lines) and
[Directives](./flowchart.md#directives): ordinary accepted files, including
header-only input, end with one configured newline. Preserve EOF-reaching
directive/value endings and size-retained endings, since adding a value
character or crossing the size branch changes the reading. Whitespace required
for an empty style and comment text stay before the newline. At EOF, `style A`
with two trailing spaces stays, since every version of mermaid.js that counts
rejects `style A` without them (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
An open directive with trailing exterior whitespace uses the shared
final-whitespace handling; an open directive ending at EOF gains no value
character.

[fixture: final-newline/final-comment] [fixture:
final-newline/final-open-description] [fixture:
final-newline/final-empty-style-spaces]

Input (escaped): `"agentflow-beta TB\nA\n\n\n"`.

[fixture: final-newline/final-ordinary]

Output
([final-newline/final-ordinary-output.mmd](../tests/fixtures/agentflow/final-newline/final-ordinary-output.mmd)):

```mmd
agentflow-beta TB
  A
```

### Markdown fences

Reuse shared [Markdown code blocks](./compatibility.md#markdown-code-blocks): a
dedented diagram payload uses the standalone rules, while Markdown supplies
fence/list/quote indentation. Test top-level, nested-list and block-quote hosts,
options, values, directives, names and large retained payloads separately from
their dedented Db. Prettier trims final code-block line whitespace, which can
reject a final all-whitespace style; this host limitation also applies to
declined failures and does not authorize trimming standalone value text. Judge
the size branch on the dedented payload.

[fixture: markdown-fences/markdown-list-payload]

Input (escaped): `"agentflow-beta TB\nA-->B"`.

[fixture: markdown-fences/markdown-top-payload]

Output
([markdown-fences/markdown-top-payload-output.mmd](../tests/fixtures/agentflow/markdown-fences/markdown-top-payload-output.mmd)):

```mmd
agentflow-beta TB
  A --> B
```

### Click statements

Reuse callback value retention from
[Whitespace between tokens](./flowchart.md#whitespace-between-tokens) and
[Multi-line statements](./flowchart.md#multi-line-statements): whitespace before
call parentheses belongs to its name. Normalize the harmless first click-keyword
gap; keep the id/list/value suffix and multiline columns, including href/call
presence, targets, punctuation/numeric/prototype ids, holes, URL/tooltip
whitespace and a second call supplying arguments. A tooltip keeps its internal
runs of whitespace because mermaid.js stores them as part of the tooltip value
in the Db. Collapsing a run changes that value, beyond the allowed Db
exceptions. Agentflow retains each erased click/empty
description/string/markdown/call in textBeforeUrl/textBeforeTooltip with its
exact source gaps, including either side of href. It has no prefix field before
a callback name or target. The single whitespace characters required before
tooltips and targets stay written; terminal empty descriptions are following
statements. The erased prefixes are kept; the specification accepts them, and
flowchart's rule for the reserved word `click`, which rejects such input, does
not apply to Agentflow.

[corpus fixture: agentflow/gram-url-tooltip-whitespace-only]

[fixture: click-statements/callback-padding-unsafe] [fixture:
click-statements/tooltip-required-tab] [fixture: click-statements/url-form-kept]

A tab before a fixed link target also stays written, and directives inside a
retained click prefix keep their touching gaps.

[fixture: click-statements/target-required-tab] [fixture:
click-statements/prefix-with-directive]

The `href` of a click statement stays touching the `)` of a blank call, as in
`click A call ()href click "/u"`: some of the versions that count reject the
form with a space between them (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).

[fixture: click-statements/blank-call-then-href-kept]

The arguments of a call have no whitespace at their ends or before a `,`, and
one space after it, as in [flowchart](./flowchart.md#whitespace-between-tokens):
`click A call f(  "x" ,y )` is printed `click A call f("x", y)` (see
[Call arguments that are drawn the same](./compatibility.md#call-arguments-that-are-drawn-the-same)).

[fixture: click-statements/callback-arguments-spaced]

A gap between the arguments that the line rule of mermaid.js may read keeps
whether it holds whitespace: `click A call f(style:x,#b;c)` stays as written,
since a space after the `,` would change the last `;` that the rule ignores (see
[Call arguments that are drawn the same](./compatibility.md#call-arguments-that-are-drawn-the-same)).

[fixture: click-statements/callback-arguments-line-rule-kept]

The parentheses of a call with blank arguments touch each other, as in
[flowchart](./flowchart.md#whitespace-between-tokens): `click A call f( )` is
printed `click A call f()`, also before a tooltip or an erased prefix, since
mermaid.js reads both spellings as the same call. `f ()`, with whitespace before
the `(`, stays, because the name takes that whitespace. The whitespace after the
`)` stays written, since one more whitespace character there can reject.

[fixture: click-statements/callback-blank-parentheses-touch] [test: agentflow:
U+2028 between the parentheses of a blank callback] [test: agentflow: U+2029
between the parentheses of a blank callback]

A statement whose line breaks are all inside a string or between the parentheses
of a call with arguments has its first click-keyword gap normalized like one on
a single line, and the rest stays written: `click   A "/u" "x` and `  y"` on the
next line is printed `click A "/u" "x` and `  y"`. Rule 1 gives one space
between a keyword and what it takes, as Prettier prints `return  x;` as
`return x;` (see [rule 1](./printed-form.md#1-the-whitespace-beside-a-mark)),
also where a quoted tooltip spans lines. The tooltip's line breaks and later
columns are characters of its string value, so they stay as written. A line
break in a gap, or between the blank parentheses of `f(` and `)`, keeps the
statement as written.

[fixture: click-statements/string-over-lines-keyword-gap] [fixture:
click-statements/callback-parentheses-over-lines]

Input (escaped): `"agentflow-beta TB\nA\nclick   A cb\n"`.

[fixture: click-statements/click-keyword-gap]

Output
([click-statements/click-keyword-gap-output.mmd](../tests/fixtures/agentflow/click-statements/click-keyword-gap-output.mmd)):

```mmd
agentflow-beta TB
  A
  click A cb
```
