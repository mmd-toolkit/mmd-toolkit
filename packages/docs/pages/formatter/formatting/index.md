# Formatting rules

The formatter adjusts indentation, spaces, and line breaks according to each
diagram's syntax. Formatting an already formatted diagram again produces the
same text.

It preserves what mermaid.js reads from a diagram, keeping text as written where
formatting would change how it is read. Exceptions to this guarantee are
described in [compatibility][compatibility].

## Whitespace and layout

Where these changes preserve the diagram, the formatter:

- indents block contents according to their nesting;
- puts statements on separate lines and removes statement-separating `;` where
  they can be replaced with line breaks;
- adjusts spaces between syntax elements, such as around arrows;
- collapses consecutive blank lines to one and removes blank lines at the start
  and end of blocks.

The indentation unit and output line endings follow the
[formatting options](../options.md). Text and whitespace that are part of
values, such as labels, messages, and class members, are preserved where
changing them would change the diagram.

## Example

In this sequence diagram, statements are split onto separate lines, the loop
body is indented, and arrows gain spaces around them.

Input:

```mmd
sequenceDiagram A->>B: x; B->>A: y
loop x
A->>B: y
end A->>B: z
```

Formatted:

```mmd
sequenceDiagram
  A ->> B: x
  B ->> A: y
  loop x
    A ->> B: y
  end
  A ->> B: z
```

Open [this input in the Playground][example] and select **Formatted** to try it
online.

## Comments and embedded data

Comment text is preserved. Comments on their own lines are indented with the
surrounding statements; comments after a statement stay on its line.

The contents of directives (`%%{ ... }%%`) and data blocks (`@{ ... }`) are kept
as written. YAML frontmatter between `---` lines is formatted with Prettier's
YAML formatter. The YAML is kept as written when Prettier cannot parse it, or in
the cases described in [frontmatter compatibility][frontmatter]. The formatter
does not check whether embedded data has a structure or values that Mermaid
accepts.

## Diagram guides

Spacing, block layout, and text kept as written depend on the diagram's syntax.

<!-- formatter-diagram-guides:start -->

- [Flowchart](../../../../prettier-plugin-mmd/docs/flowchart.md)
- [Sequence](../../../../prettier-plugin-mmd/docs/sequence.md)
- [Class](../../../../prettier-plugin-mmd/docs/class.md)
- [State](../../../../prettier-plugin-mmd/docs/state.md)

<!-- formatter-diagram-guides:end -->

[compatibility]: ../../../../prettier-plugin-mmd/docs/compatibility.md
[frontmatter]: ../../../../prettier-plugin-mmd/docs/compatibility.md#frontmatter
[example]:
  https://mmd-toolkit.github.io/mmd-toolkit/playground/#v1=H4sIAAAAAAAAEzXKOwqEQAwA0KuE1NpYZmFA8QjCNtNEjR_QzGoc8IN3t3Hr9y60ENdGkNBkiaKNlCP3K8-Qp84VBPsHitS5nODwOoXwg93ra4dX0fY_T6-Y4Mb1d2y3ASlLMJpUXBtSx5PJ_QC3OqLHbgAAAA
