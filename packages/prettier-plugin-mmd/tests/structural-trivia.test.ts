/**
 * Joining comment regions keep their raw columns inside structural statements,
 * also in a mindmap where the separator ends no diagram comment; an
 * eventmodeling diagram prints the separator before the comment line as a space
 * outside a title or accessibility value, and the line after it one level deeper
 * where it goes on a statement and at the statement level where it starts one
 * (docs/compatibility.md, A comment line after U+2028 or U+2029).
 */
import { describe, expect, it } from "vitest"
import { parse } from "@mmd-toolkit/parser"
import { createSource } from "../src/printers/source.ts"
import { dbOfText, defaultEmbedded } from "./db-reading.ts"
import { formatMermaid } from "./helpers.ts"

describe("structural trivia boundaries", () => {
  it.each([
    {
      name: "er/attribute-spacing/comment-region-continuation-kept",
      input: "erDiagram\nA {\nint\u2028%% c\n a\n}\n",
      output: "erDiagram\n  A {\n    int\u2028%% c\n a\n  }\n",
    },
    {
      name: "er/attribute-spacing/comment-region-keeps-the-whole-attribute",
      input: "erDiagram\nA {\nint\n%% ordinary\n a\u2028%% joined\n PK\n}\n",
      output:
        "erDiagram\n  A {\n    int\n%% ordinary\n a\u2028%% joined\n PK\n  }\n",
    },
    {
      name: "block/shapes/comment-region-keeps-the-directions-of-a-block-arrow",
      input: 'block-beta\na<["x"]>(right,\u2028%% c\n   down)\n',
      output: 'block-beta\n  a<["x"]>(right,\u2028%% c\n   down)\n',
    },
    {
      name: "er/accessibility-statements/comment-region-keeps-the-text-line",
      input: "erDiagram\naccTitle:\u2028%% c\n   T\n",
      output: "erDiagram\n  accTitle:\u2028%% c\n   T\n",
    },
    {
      name: "block/indentation/comment-region-keeps-a-joined-statement-line",
      input: "block-beta\nA\u2028%% c\n   B\n",
      output: "block-beta\n  A\u2028%% c\n   B\n",
    },
    {
      name: "block/indentation/comment-region-keeps-a-joined-line-in-a-composite",
      input: "block-beta\nblock:G\nA\u2028%% c\n   B\nend\n",
      output: "block-beta\n  block: G\n    A\u2028%% c\n   B\n  end\n",
    },
    {
      name: "er/indentation/comment-region-keeps-a-joined-statement-line",
      input: "erDiagram\nA ||--o{ B : x\u2028%% c\n   C ||--o{ D : y\n",
      output: "erDiagram\n  A ||--o{ B : x\u2028%% c\n   C ||--o{ D : y\n",
    },
    {
      name: "er/indentation/comment-region-keeps-a-joined-line-in-a-subgraph",
      input: "erDiagram\nsubgraph S\nA\u2028%% c\n   B\nend\n",
      output: "erDiagram\n  subgraph S\n    A\u2028%% c\n   B\n  end\n",
    },
    {
      name: "er/attribute-blocks/comment-region-keeps-the-joined-attributes",
      input: "erDiagram\nA {\nint a\u2028%% c\n   string b\n}\n",
      output: "erDiagram\n  A {\n    int a\u2028%% c\n   string b\n  }\n",
    },
    {
      name: "requirement/relationship-spacing/comment-region-continuation-kept",
      input: "requirementDiagram\na - satisfies \u2029%% c\n -> b\n",
      output: "requirementDiagram\n  a - satisfies \u2029%% c\n -> b\n",
    },
    {
      name: "xychart/multi-line-statements/bare-title-comment-region-kept",
      input: "xychart\ntitle A \u2028%% c\n B\n",
      output: "xychart\n  title A \u2028%% c\n B\n",
    },
    {
      name: "mindmap/line-separators/comment-region-continuation-kept",
      input: "mindmap\nroot\n  a\u2028%% c\n     b\n",
      output: "mindmap\n  root\n    a\u2028%% c\n     b\n",
    },
    {
      name: "eventmodeling/long-lines/comment-region-continuation-one-level-deeper",
      input: "eventmodeling\ntf 01 evt\u2028%% c\n   Alpha\n",
      output: "eventmodeling\ntf 01 evt %% c\n  Alpha\n",
    },
    {
      name: "eventmodeling/statements-one-per-line/comment-region-joined-statement-at-the-statement-level",
      input: "eventmodeling\ntf 01 evt Alpha\u2028%% c\n   tf 02 evt Beta\n",
      output: "eventmodeling\ntf 01 evt Alpha %% c\ntf 02 evt Beta\n",
    },
    {
      name: "c4/indentation/comment-region-keeps-a-joined-statement-line",
      input: 'C4Context\naccDescr {}\u2028%% c\n   Person(a,"A")\n',
      output: 'C4Context\n  accDescr {}\u2028%% c\n   Person(a,"A")\n',
    },
    {
      name: "class/indentation/comment-region-keeps-a-joined-statement-line",
      input: "classDiagram\naccDescr {}\u2028%% c\n   class A\n",
      output: "classDiagram\n  accDescr {}\u2028%% c\n   class A\n",
    },
    {
      name: "class/member-bodies/comment-region-keeps-a-joined-member-line",
      input: "classDiagram\nclass A {\u2028%% c\n   +x\n}\n",
      output: "classDiagram\n  class A {\u2028%% c\n   +x\n  }\n",
    },
    {
      name: "class/whitespace-between-tokens/comment-region-keeps-a-joined-name-line",
      input: "classDiagram\naccDescr {}\u2028%% c\n   A\n",
      output: "classDiagram\n  accDescr {}\u2028%% c\n   A\n",
    },
    {
      name: "class/empty-description-blocks/comment-region-keeps-a-joined-member-line",
      input: "classDiagram\naccDescr {} class A {\u2028%% c\n   +x\n}\n",
      output: "classDiagram\n  accDescr {} class A {\u2028%% c\n   +x\n}\n",
    },
    {
      name: "flowchart/indentation/comment-region-keeps-a-joined-statement-line",
      input: "flowchart TD\naccDescr {}\u2028%% c\n   A\n",
      output: "flowchart TD\n  accDescr {}\u2028%% c\n   A\n",
    },
    {
      name: "flowchart/direction/comment-region-keeps-a-joined-direction-statement",
      input: "flowchart TD\nsubgraph S\ndirection\u2028%% c\n   LR\nA\nend\n",
      output:
        "flowchart TD\n  subgraph S\n    direction\u2028%% c\n   LR\n    A\n  end\n",
    },
    {
      name: "flowchart/subgraph-header/comment-region-keeps-a-joined-header-line",
      input: "flowchart TD\nsubgraph S[T\u2028%% c\n   ]\nA\nend\n",
      output: "flowchart TD\n  subgraph S[T\u2028%% c\n   ]\n    A\n  end\n",
    },
    {
      name: "swimlane/indentation/comment-region-keeps-a-joined-statement-line",
      input: "swimlane-beta TD\naccDescr {}\u2028%% c\n   A --> B\n",
      output: "swimlane-beta TB\n  accDescr {}\u2028%% c\n   A --> B\n",
    },
    {
      name: "gantt/indentation/comment-region-keeps-a-joined-statement-line",
      input: "gantt\u2028%% c\n   dateFormat YYYY-MM-DD\n",
      output: "gantt\u2028%% c\n   dateFormat YYYY-MM-DD\n",
    },
    {
      name: "gantt/accessibility-statements/comment-region-keeps-a-joined-line",
      input: "gantt\naccDescr {\nA\u2028%% c\n   B\n}\n",
      output: "gantt\n  accDescr {\n    A\u2028%% c\n   B\n  }\n",
    },
    {
      name: "ishikawa/indentation/comment-region-keeps-a-joined-line",
      input: "ishikawa\nRoot\n  Cause\u2028%% c\n   Detail\n",
      output: "ishikawa\n  Root\n    Cause\u2028%% c\n   Detail\n",
    },
    {
      name: "ishikawa/root-on-header-line/comment-region-keeps-a-joined-line",
      input: "ishikawa\u2028%% c\n   Root\n",
      output: "ishikawa\u2028%% c\n   Root\n",
    },
    {
      name: "ishikawa/root-indentation/comment-region-keeps-a-joined-line",
      input: "ishikawa\u2028%% c\n   Root\n",
      output: "ishikawa\u2028%% c\n   Root\n",
    },
    {
      name: "journey/indentation/comment-region-keeps-a-joined-statement-line",
      input: "journey\u2028%% c\n   title T\n",
      output: "journey\u2028%% c\n   title T\n",
    },
    {
      name: "journey/accessibility-statements/comment-region-keeps-a-joined-line",
      input: "journey\naccDescr {\nA\u2028%% c\n   B\n}\n",
      output: "journey\n  accDescr {\n    A\u2028%% c\n   B\n  }\n",
    },
    {
      name: "kanban/indentation/comment-region-keeps-a-joined-line",
      input: "kanban\n S\n  A\u2028%% c\n   B\n",
      output: "kanban\n  S\n    A\u2028%% c\n   B\n",
    },
    {
      name: "kanban/header/comment-region-keeps-a-joined-line",
      input: "kanban S\u2028%% c\n   A\n",
      output: "kanban\n  S\u2028%% c\n   A\n",
    },
    {
      name: "kanban/nodes-one-per-line/comment-region-keeps-a-joined-line",
      input: "kanban\n S\n  A\u2028%% c\n   B\n",
      output: "kanban\n  S\n    A\u2028%% c\n   B\n",
    },
    {
      name: "mindmap/indentation/comment-region-keeps-a-joined-line",
      input: "mindmap\u2028%% c\n   root\n",
      output: "mindmap\u2028%% c\n   root\n",
    },
    {
      name: "mindmap/root-on-header-line/comment-region-keeps-a-joined-line",
      input: "mindmap\u2028%% c\n   root\n",
      output: "mindmap\u2028%% c\n   root\n",
    },
    {
      name: "quadrant/titles-and-accessibility-statements/comment-region-keeps-a-joined-description-line",
      input: "quadrantChart\naccDescr {\n A\u2028%% c\n   B\n}\n",
      output: "quadrantChart\n  accDescr {\n    A\u2028%% c\n   B\n  }\n",
    },
    {
      name: "quadrant/empty-description-blocks/comment-region-keeps-a-joined-closing-line",
      input: "quadrantChart\naccDescr {\u2028%% c\n   }\n",
      output: "quadrantChart\n  accDescr {\u2028%% c\n   }\n",
    },
    {
      name: "requirement/indentation/comment-region-keeps-a-joined-statement-line",
      input:
        "requirementDiagram\nrequirement r {\n}\u2028%% c\n   direction LR\n",
      output:
        "requirementDiagram\n  requirement r {\n}\u2028%% c\n   direction LR\n",
    },
    {
      name: "requirement/bodies/comment-region-keeps-a-joined-opening-line",
      input: "requirementDiagram\nrequirement r\u2028%% c\n   {\n}\n",
      output: "requirementDiagram\n  requirement r\u2028%% c\n   {\n  }\n",
    },
    {
      name: "requirement/empty-description-blocks/comment-region-keeps-a-joined-closing-line",
      input: "requirementDiagram\naccDescr {\u2028%% c\n   }\n",
      output: "requirementDiagram\n  accDescr {\u2028%% c\n   }\n",
    },
    {
      name: "requirement/accessibility-statements/comment-region-keeps-a-joined-text-line",
      input: "requirementDiagram\naccTitle:\u2028%% c\n   A\n",
      output: "requirementDiagram\n  accTitle:\u2028%% c\n   A\n",
    },
    {
      name: "sequence/indentation/comment-region-keeps-a-joined-line-in-a-block",
      input:
        "sequenceDiagram\nloop x\naccDescr {}\u2028%% c\n   A->>B: y\nend\n",
      output:
        "sequenceDiagram\n  loop x\n    accDescr {}\u2028%% c\n   A->>B: y\n  end\n",
    },
    {
      name: "state/indentation/comment-region-keeps-a-joined-line-in-a-composite",
      input: "stateDiagram-v2\nstate A {\u2028%% c\n   B\n}\n",
      output: "stateDiagram-v2\n  state A {\u2028%% c\n   B\n  }\n",
    },
    {
      name: "state/composite-states/comment-region-keeps-a-joined-opening-line",
      input: "stateDiagram-v2\nstate A\u2028%% c\n   {\nB\n}\n",
      output: "stateDiagram-v2\n  state A\u2028%% c\n   {\n    B\n  }\n",
    },
    {
      name: "timeline/indentation/comment-region-keeps-a-joined-statement-line",
      input: "timeline\u2028%% c\n   A : x\n",
      output: "timeline\u2028%% c\n   A : x\n",
    },
    {
      name: "timeline/periods-and-events/comment-region-keeps-a-joined-event-line",
      input: "timeline\nA : x\u2028%% c\n   : y\n",
      output: "timeline\n  A : x\u2028%% c\n   : y\n",
    },
    {
      name: "timeline/event-statements/comment-region-keeps-a-joined-peer-event-line",
      input: "timeline\nA : x\naccDescr {}\n: y\u2028%% c\n   : z\n",
      output: "timeline\n  A : x\n  accDescr {}\n  : y\u2028%% c\n   : z\n",
    },
    {
      name: "timeline/header-and-direction/comment-region-keeps-a-joined-event-line-after-the-header",
      input: "timeline TD A : x\u2028%% c\n   : y\n",
      output: "timeline TD A : x\u2028%% c\n   : y\n",
    },
    {
      name: "timeline/accessibility-statements/comment-region-keeps-a-joined-description-line",
      input: "timeline\naccDescr {x\u2028%% c\n   y\n}\n",
      output: "timeline\n  accDescr {x\u2028%% c\n   y\n}\n",
    },
    {
      name: "treeview/indentation/comment-region-keeps-a-joined-node-line",
      input: 'treeView-beta\n"A"\u2028%% c\n   B\n',
      output: 'treeView-beta\n"A"\u2028%% c\n   B\n',
    },
    {
      name: "treeview/carried-indentation/comment-region-keeps-a-joined-node-line",
      input: 'treeView-beta\n"A" \u2028%% c\n   B\n',
      output: 'treeView-beta\n"A" \u2028%% c\n   B\n',
    },
    {
      name: "xychart/indentation/comment-region-keeps-a-joined-statement-line",
      input: "xychart\u2028%% c\n   bar [1]\n",
      output: "xychart\u2028%% c\n   bar [1]\n",
    },
    {
      name: "xychart/accessibility-statements/comment-region-keeps-a-joined-description-line",
      input: "xychart\naccDescr {x\u2028%% c\n   y\n}\n",
      output: "xychart\n  accDescr {x\u2028%% c\n   y\n}\n",
    },
    {
      name: "xychart/empty-description-blocks/comment-region-keeps-a-joined-closing-line",
      input: "xychart\naccDescr {\u2028%% c\n   }\n",
      output: "xychart\n  accDescr {\u2028%% c\n   }\n",
    },
  ])("$name", async ({ input, output }) => {
    const source = createSource(input, parse(input))
    expect(source.joiningRegions).toHaveLength(1)
    expect(source.joiningRegions[0].hasTextAfter).toBe(true)
    expect(await formatMermaid(input)).toBe(output)
    expect(await formatMermaid(output)).toBe(output)
    const embedded = defaultEmbedded()
    expect(dbOfText(output, embedded)).toEqual(dbOfText(input, embedded))
  })
})
