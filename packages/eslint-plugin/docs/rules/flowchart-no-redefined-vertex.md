# @mmd-toolkit/flowchart-no-redefined-vertex

Japanese version:
[flowchart-no-redefined-vertex.ja.md](./flowchart-no-redefined-vertex.ja.md)

Disallow writing the shape or the label of a vertex again, differently.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A vertex may be written many times, and the last shape and label are used.
Reusing an id for what was meant as another vertex loses the earlier shape or
label without an error.

## Rule Details

This rule applies to flowcharts (`flowchart`, `graph`, `flowchart-elk`, and
`swimlane-beta`). It reports a vertex written with a shape whose shape or label
differs from the last one written for that id. Referring to the vertex without a
shape, or repeating its current shape and label, is not reported. A shape or
label set by a data block, such as `A@{ shape: rect }`, is not compared, also
when it stands between two shaped occurrences of the vertex.

Label comparisons ignore whitespace at the ends, treat LF, CRLF, and CR as LF,
and do not distinguish text, quoted text, and markdown text. Otherwise labels
are compared as written, so differences in character references or HTML
attribute quotes can be reported even when mermaid.js reads them as the same
label.

A shaped vertex whose id is already a link id changes nothing; it is not
reported and does not count as an earlier declaration.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/flowchart-no-redefined-vertex: error
flowchart LR
  A[Start] --> B
  C --> A[End]
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

## Options

This rule has no options.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/flowchart-no-redefined-vertex.ts)
- [Tests source](../../tests/rules/flowchart-no-redefined-vertex.test.ts)

<!-- end auto-generated rule resources -->
