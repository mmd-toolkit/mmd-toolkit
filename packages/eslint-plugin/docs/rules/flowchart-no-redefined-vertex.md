---
since: v0.1.0
---

# @mmd-toolkit/flowchart-no-redefined-vertex

Japanese version:
[flowchart-no-redefined-vertex.ja.md](./flowchart-no-redefined-vertex.ja.md)

Disallow writing a vertex again, differently or in a subgraph that does not get
it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A vertex may be written many times, and the last shape and label are used.
Reusing an id for what was meant as another vertex loses the earlier shape or
label without an error. A vertex belongs to the first subgraph that ended with
it: writing it in a later subgraph does not add it there.

## Rule Details

This rule applies to flowcharts (`flowchart`, `graph`, `flowchart-elk`, and
`swimlane-beta`). It reports a vertex written with a shape whose shape or label
differs from the last one written for that id. Referring to the vertex without a
shape, or repeating its current shape and label, is not reported, except in a
subgraph that does not get the vertex (below). A shape or label set by a data
block, such as `A@{ shape: rect }`, is not compared, also when it stands between
two shaped occurrences of the vertex.

Label comparisons ignore whitespace at the ends, treat LF, CRLF, and CR as LF,
and do not distinguish text, quoted text, and markdown text. Otherwise labels
are compared as written, so differences in character references or HTML
attribute quotes can be reported even when mermaid.js reads them as the same
label.

A shaped vertex whose id is already a link id changes nothing; it is not
reported and does not count as an earlier declaration.

A subgraph does not get a vertex that a subgraph before it has, in the order in
which the subgraphs end (a subgraph inside another one ends first): mermaid.js
leaves the vertex in the first and the later one does not get it. A statement in
the later subgraph that writes the vertex again is reported when it has no link,
no class, and no data block, and writes only the id, or the shape that the
vertex has with the same label and property of the shape, and with both labels
markdown or neither: it says nothing new about the vertex. A label in quotes and
a label without them are the same here: mermaid.js draws them alike, and the
formatter prints one of the two forms, so formatting does not change what is
reported. A property of the shape is not such a difference, and the formatter
leaves it, so another property says something new. In a group such as `A & B`,
each vertex is reported for itself. It is not reported when the earlier subgraph
is inside the later one, or has the same id, since nothing is lost; nor when the
vertex was not written before (an id that only names an earlier subgraph writes
a new vertex), or when the statement says something new: a link, a class, a data
block, the first shape of the vertex, a markdown label where the vertex's label
is not markdown or the reverse, or another property. A different shape or label
is reported as above.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/flowchart-no-redefined-vertex: error
flowchart LR
  A[Start] --> B
  C --> A[End]
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-redefined-vertex: error
flowchart TD
  subgraph a
    A
  end
  subgraph b
    A
  end
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/flowchart-no-redefined-vertex: error
flowchart LR
  A[Start] --> B
  A --> C
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-redefined-vertex: error
flowchart LR
  A[Start] --> B
  C --> A[Start]
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-redefined-vertex: error
flowchart TD
  subgraph b
    subgraph a
      A
    end
    A
  end
```

## Options

This rule has no options.

<!-- begin auto-generated rule version -->

## Version

This rule was introduced in `@mmd-toolkit/eslint-plugin` v0.1.0.

<!-- end auto-generated rule version -->

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/flowchart-no-redefined-vertex.ts)
- [Tests source](../../tests/rules/flowchart-no-redefined-vertex.test.ts)

<!-- end auto-generated rule resources -->
