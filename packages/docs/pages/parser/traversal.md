# Traversing the AST

Use `traverseNodes` to inspect the nodes of a parsed diagram. It calls your
visitor before and after visiting each node's children.

## Callbacks

The signature is `traverseNodes(node: Node, visitor: Visitor): void`. The
starting `node` can be the `Root` returned by `parse()` or any node within it.
For example, passing `root.body` starts at the diagram body.

Both callbacks in `Visitor` are required:

| Callback                  | When it runs                               |
| ------------------------- | ------------------------------------------ |
| `enterNode(node, parent)` | Before visiting the node's children.       |
| `leaveNode(node, parent)` | After visiting all of the node's children. |

In both callbacks, `node` is the visited `Node` and `parent` is its parent in
this walk. The starting node's `parent` is always `null`, including when the
walk starts at `root.body`.

This header-only flowchart has just a `Root` and a `FlowchartDiagram` node:

```ts
import { parse, traverseNodes } from "@mmd-toolkit/parser"

traverseNodes(parse("flowchart LR\n"), {
  enterNode(node, parent) {
    console.log("enter", node.type, parent?.type ?? null)
  },
  leaveNode(node, parent) {
    console.log("leave", node.type, parent?.type ?? null)
  },
})
```

The callbacks produce this output:

```text
enter Root null
enter FlowchartDiagram Root
leave FlowchartDiagram Root
leave Root null
```

## Inspect specific nodes

Check `node.type` to select a node type and narrow its TypeScript type. This
example collects ids from flowchart vertex nodes. The same id can occur in
multiple nodes, so a `Set` removes duplicates:

```ts
import { parse, traverseNodes } from "@mmd-toolkit/parser"

const root = parse("flowchart LR\n  A[Start] --> B\n  B --> C\n")
const ids = new Set<string>()

traverseNodes(root, {
  enterNode(node) {
    if (node.type === "FlowchartVertex") {
      ids.add(node.id.name)
    }
  },
  leaveNode() {
    // Collection happens when a node is entered; no work is needed on leaving.
  },
})

console.log([...ids]) // ["A", "B", "C"]
```

The [AST definition on GitHub][ast] describes the node types and their fields.

## Child fields and visitation order

The walk is depth-first: each child's entire subtree is visited before the next
child. For each node, `visitorKeys[node.type]` lists the child fields in
visitation order. An array of child nodes is visited in array order. A `null`
child field or array element is skipped.

```ts
import { visitorKeys } from "@mmd-toolkit/parser"

console.log(visitorKeys.Root) // ["body"]
console.log(visitorKeys.Identifier) // []
```

The field order can differ from source order. For example, a `FlowchartLink`
visits its `arrow` before its `label`, even when the label appears before the
arrow in the source.

## Records outside the walk

Tokens, comments, directives, and frontmatter are not AST nodes and are not
visited. Read them from the `Root` returned by `parse()`:

| Expression         | Records                             |
| ------------------ | ----------------------------------- |
| `root.tokens`      | Tokens.                             |
| `root.comments`    | Comments.                           |
| `root.directives`  | Directives.                         |
| `root.frontmatter` | Frontmatter, or `null` when absent. |

[Parser API](./api.md) describes the return value and links to the detailed
record definitions.

[ast]:
  https://github.com/mmd-toolkit/mmd-toolkit/blob/main/packages/spec/docs/ast.md
