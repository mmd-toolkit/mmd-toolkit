# @mmd-toolkit/flowchart-no-redefined-vertex

Japanese version:
[flowchart-no-redefined-vertex.ja.md](./flowchart-no-redefined-vertex.ja.md)

Disallow writing the shape or the label of a vertex again, differently.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A vertex may be written many times, and the shape and the label written last
win. When an id that is already in use is written again for what is meant as a
new vertex, the earlier shape or label is lost without an error.

## Rule Details

This rule reports a vertex written with a shape whose shape or label differs
from the last shape written for the same vertex before it. It applies to
`flowchart-v2`, `flowchart-elk`, and `swimlane`.

After `A[Start] --> B`, the line `C --> A[End]` gives the vertex `A` the label
`End`, and the label `Start` is lost. Writing the vertex again without a shape,
as in `A --> C`, keeps its shape and label and is not reported, and neither is
writing the shape and label that the vertex already has: after `A[x]` and
`A[y]`, a third `A[y]` changes nothing and is not reported. A shape or a label
set by a data block, as in `A@{ shape: rect }`, is not compared, also where it
stands between two shapes of the vertex. Labels are compared without the
whitespace at their ends, which mermaid.js removes: `A["x"]` and then `A["x "]`
is not reported. Every line break (LF, CRLF, or CR) is read as a line feed.
Labels are otherwise compared as written: mermaid.js turns character references,
as `#35;`, and the quotes of HTML attributes into other characters before it
reads a label, so two labels that differ only in those, as
`A[<b class="x">t</b>]` and `A[<b class='x'>t</b>]`, may be one label for
mermaid.js and two for this rule. The kind of the label (text, string, or
markdown string) is not compared: after `A["x"]`, ``A["`x`"]`` writes the same
text for the same vertex, which is no id reused for another vertex, and
mermaid.js uses the label written last.

A shaped occurrence whose id is already the id of a link changes nothing and is
not compared, nor counted as an earlier declaration. A link reads its target
vertices before creating its links, so a shaped target can still replace a
vertex before a link takes that id. This applies to both written and generated
link ids.

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
