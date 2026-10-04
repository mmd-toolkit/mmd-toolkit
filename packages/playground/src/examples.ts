/** Small editable examples, independent of the Node-only fixture loader. */
export const examples: { name: string; source: string }[] = [
  {
    name: "Flowchart",
    source:
      "flowchart LR\n  A[Write Mermaid] --> B{Explore}\n  B --> C[Inspect the AST]\n  B --> D[Format the source]\n",
  },
  {
    name: "Sequence",
    source:
      "sequenceDiagram\n  participant A as Author\n  participant P as Playground\n  A->>P: Edit the source\n  P-->>A: Inspect and format\n",
  },
  {
    name: "Class",
    source:
      "classDiagram\n  class Diagram {\n    +String source\n    +parse() Root\n  }\n  Diagram --> Root\n",
  },
  {
    name: "State",
    source:
      "stateDiagram-v2\n  [*] --> Editing\n  Editing --> Inspecting: parse\n  Inspecting --> Editing: change\n  Inspecting --> [*]\n",
  },
  {
    name: "Frontmatter & comments",
    source:
      "---\ntitle: A small journey\n---\n%% Every character has a place\nflowchart TD\n  A[Source] --> B[Tree]\n",
  },
]
