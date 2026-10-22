# @mmd-toolkit/agentflow-no-undef

Japanese version: [agentflow-no-undef.ja.md](./agentflow-no-undef.ja.md)

Disallow a `style`, `class`, or `click` statement for an id that nothing
declares.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`style`, `class`, and `click` name the element that they apply to by its id.
When no vertex, flow, connector, or link has that id, as when the id is
misspelled, mermaid.js accepts the statement without an error, and it does not
reach the element that was meant.

## Rule Details

This rule reports an id in a `style`, `class`, or `click` statement that is the
id of no vertex, no flow, no connector, and no link of the diagram. It applies
to `agentflow`.

After `A --> B`, `style C fill:red` adds a vertex `C` with the style `fill:red`,
`class C foo` gives no element the class `foo`, and `click C href "…"` makes no
element a link. Each id of a list is checked: `class A,C foo` gives `A` the
class, and `C` is reported.

The ids of the diagram are those of its vertices, flows, and connectors, and
those given to links, as `e1` in `A e1@--> B`, wherever they are written. The id
of a flow or a connector is its name, without the whitespace at its ends and
without the parts that mermaid.js erases from it. A `style` before an ordinary
vertex keeps its styles when the vertex is declared. A `style` before a
connector creates a provisional vertex whose styles the first connector
declaration discards; after the connector declaration, it styles the connector.
With `style F fill:red` and `flow F[Worker]`, the drawing fills the flow's frame
red and draws no separate vertex `F`, whether the `style` comes before or after
the flow declaration. A `style` before a link declaration also styles a separate
vertex of its id, not the link; after the link declaration, it changes nothing
when no vertex of that id exists. A `class` statement before the element that it
names does nothing in mermaid.js, and a `click` statement there does not make it
clickable. Such a statement names an id of the diagram, which is written
correctly, and the rule does not report it.

A vertex that a `style` statement adds is a vertex of the diagram too, so the
rule reports only the first `style` of an id that nothing else declares. After
`style C fill:red`, a second `style C stroke:blue` adds its style to the vertex
`C`, and `class C foo` and `click C href "…"` apply to it; none of them is
reported.

The reserved id `connectors` creates no ordinary vertex, even when written with
a shape or in a `style`. Without a separately declared flow, connector, or
written link id of that name, each `style`, `class`, or `click` operand is
reported; a `style` does not create a vertex for it. A connector with an empty
trimmed name declares nothing either.

An id that mermaid.js gives an element itself is an id of the diagram too: the
id `subGraph0` of a flow without a name, and an id as `L_A_B_0` of a link
written without one. mermaid.js finds the flow or the link by it, so
`class subGraph0 hot` gives the flow the class, and such an id is not reported.
Ids are compared as written: mermaid.js turns character references, as `#35;`,
and the quotes of HTML attributes into other characters before it reads a name,
so two ids that differ only in those may be one id for mermaid.js and two for
this rule.

For ids, `#35;` and `#` are different ids in mermaid.js too. The
character-reference limit above concerns a reference and mermaid.js's
replacement text, not a reference and its decoded character.

Correct the id, or declare the element.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-undef: error
agentflow-beta TB
  A --> B
  style C fill:red
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-undef: error
agentflow-beta TB
  flow review["Review Agent"]
    A
  end
  class reveiw highlighted
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-undef: error
agentflow-beta TB
  A --> B
  style A fill:red
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-undef: error
agentflow-beta TB
  connector github["GitHub API"]
  click github href "https://github.com"
```

## Options

This rule has no options.

## Background

[`setClass`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L928-L943)
and
[`setLink` and `setClickEvent`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L1010-L1038)
look up the element of the id when they are called;
[`addVertex`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L347-L565),
which a `style` statement calls, adds a vertex for an id that has none.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/agentflow-no-undef.ts)
- [Tests source](../../tests/rules/agentflow-no-undef.test.ts)

<!-- end auto-generated rule resources -->
