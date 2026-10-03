import { describe, expect, it } from "vitest"
import type { Node, Range, Root } from "../src/index.ts"
import {
  classDbTexts,
  flowchartDbTexts,
  ignoredSemicolons,
  parse,
  sequenceDbTexts,
  stateDbTexts,
  traverseNodes,
} from "../src/index.ts"
import { openSource } from "../src/parse.ts"

// The texts that the Db of mermaid.js reads past the range of a value node,
// on the examples of each diagram's Db normalization. The fixture tests and
// the differential tests compare the Db that the test helpers build from
// these texts with mermaid.js; here each range is stated.

/** The first node of `root` of the type `type`, in the order of a walk. */
function firstNode<Type extends Node["type"]>(
  root: Root,
  type: Type,
): Extract<Node, { type: Type }> {
  const nodes: Node[] = []
  traverseNodes(root, {
    enterNode(node) {
      nodes.push(node)
    },
    leaveNode() {
      // Nothing to do on the way back.
    },
  })
  const node = nodes.find(
    (candidate): candidate is Extract<Node, { type: Type }> =>
      candidate.type === type,
  )
  if (node === undefined) throw new Error(`no ${type} in the tree`)
  return node
}

/** The text of the range `range` of `text` without `leftOut` (ast.md, Nodes). */
function textOf(text: string, range: Range, leftOut: readonly Range[]): string {
  return openSource(text).lexer.textOfRange(range[0], range[1], leftOut)
}

describe("flowchartDbTexts", () => {
  it("gives the Db text of each style, with the whitespace before it and a style that is all whitespace", () => {
    const text = "flowchart LR\nstyle A fill:#f00,  stroke:#333\n"
    const root = parse(text)
    const statement = firstNode(root, "FlowchartStyleStatement")
    const styles = flowchartDbTexts(root, text).styles.get(statement)
    expect(styles?.map(({ range }) => range)).toEqual([
      [21, 30],
      [31, 44],
    ])
    expect(
      styles?.map(({ range, leftOut }) => textOf(text, range, leftOut)),
    ).toEqual(["fill:#f00", "  stroke:#333"])
    const classDef = "flowchart LR\nclassDef c fill:#f00,  , stroke:red\n"
    const classDefRoot = parse(classDef)
    expect(
      flowchartDbTexts(classDefRoot, classDef)
        .styles.get(firstNode(classDefRoot, "FlowchartClassDefStatement"))
        ?.map(({ range, leftOut }) => textOf(classDef, range, leftOut)),
    ).toEqual(["fill:#f00", "  ", " stroke:red"])
  })

  it("gives the Db texts in the order of `styles`, null styles included", () => {
    const text = "flowchart LR\nclassDef c fill:#f00,  , stroke:red\n"
    const root = parse(text)
    const statement = firstNode(root, "FlowchartClassDefStatement")
    const styles = flowchartDbTexts(root, text).styles.get(statement) ?? []
    expect(styles).toHaveLength(statement.styles.length)
    expect(statement.styles[1]).toBeNull()
    statement.styles.forEach((style, index) => {
      if (style !== null) {
        expect(styles[index].range[0] <= style.range[0]).toBe(true)
        expect(style.range[1] <= styles[index].range[1]).toBe(true)
      }
    })
  })

  it("runs the last style to the separator, past a `;` that the line rule ignores and the empty description blocks before it", () => {
    const text = "flowchart LR\nstyle A fill:#f00;  \n"
    const root = parse(text)
    const [style] =
      flowchartDbTexts(root, text).styles.get(
        firstNode(root, "FlowchartStyleStatement"),
      ) ?? []
    expect(style.range).toEqual([21, 33])
    expect(textOf(text, style.range, style.leftOut)).toBe("fill:#f00  ")
    const withBlock = "flowchart LR\nA\nstyle A fill:red accDescr {}\n"
    const blockRoot = parse(withBlock)
    const [blockStyle] =
      flowchartDbTexts(blockRoot, withBlock).styles.get(
        firstNode(blockRoot, "FlowchartStyleStatement"),
      ) ?? []
    expect(textOf(withBlock, blockStyle.range, blockStyle.leftOut)).toBe(
      "fill:red ",
    )
  })

  it("gives the name text of each subgraph, up to its separator", () => {
    const text = "flowchart LR\nsubgraph S \nA\nend\n"
    const root = parse(text)
    const nameText = flowchartDbTexts(root, text).subgraphNameTexts.get(
      firstNode(root, "FlowchartSubgraphStatement"),
    )
    expect(nameText?.range).toEqual([22, 24])
  })

  it("leaves the quotes of a string name and the empty description blocks before the separator out of the name text", () => {
    const text = 'flowchart LR\nsubgraph "S"accDescr {}\nA\nend\n'
    const root = parse(text)
    const nameText = flowchartDbTexts(root, text).subgraphNameTexts.get(
      firstNode(root, "FlowchartSubgraphStatement"),
    )
    expect(nameText?.leftOut).toEqual([
      [22, 23],
      [24, 25],
      [25, 36],
    ])
    expect(
      nameText === undefined
        ? null
        : textOf(text, nameText.range, nameText.leftOut),
    ).toBe("S")
  })

  it("is empty for another diagram", () => {
    const text = "sequenceDiagram\nA->>B: x\n"
    expect(flowchartDbTexts(parse(text), text).styles.size).toBe(0)
  })
})

describe("sequenceDbTexts", () => {
  it.each([
    ["title  x  ", [22, 26], " x  "],
    ["title:  x", [23, 25], " x"],
    ["title\n  A->>B: x", [22, 32], "  A->>B: x"],
    ["title\tx", [22, 23], "x"],
    ["title %%{init: {}}%% x", [36, 38], " x"],
    ["title: %%{init: {}}%%x", [37, 38], "x"],
    ["title\n%% c\nx", [27, 28], "x"],
    ["title style:#x;;  ", [22, 34], "style:#x;  "],
  ] as const)(
    "gives the text of the title of %j, whitespace included",
    (statement, range, value) => {
      const text = `sequenceDiagram\n${statement}\n`
      const root = parse(text)
      const title = sequenceDbTexts(root, text).titles.get(
        firstNode(root, "SequenceTitleStatement"),
      )
      expect(title?.range).toEqual(range)
      // The statement context, rules 13 and 14: between the keyword and the
      // title text lies one whitespace character, a line feed when the text
      // is on the next line, and the directives and comment regions there.
      const keyword = root.tokens.find(
        (token) => token.type === "Keyword" && token.range[0] >= 16,
      )
      expect(
        keyword === undefined || title === undefined
          ? null
          : [...textOf(text, [keyword.range[1], title.range[0]], [])].length,
      ).toBe(1)
      expect(title === undefined ? null : textOf(text, title.range, [])).toBe(
        value,
      )
    },
  )
})

describe("classDbTexts", () => {
  it("gives the text between the `~` of a generic type, also when it is all whitespace", () => {
    for (const [statement, value] of [
      ["class A~ T ~", " T "],
      ["class A~  ~", "  "],
    ] as const) {
      const text = `classDiagram\n${statement}\n`
      const root = parse(text)
      const generic = classDbTexts(root, text).genericTypes.get(
        firstNode(root, "ClassName"),
      )
      expect(
        generic === undefined ? null : textOf(text, generic.range, []),
      ).toBe(value)
    }
  })
})

describe("stateDbTexts", () => {
  it("gives the second description of an alias, also when it is empty or all whitespace", () => {
    for (const [statement, value] of [
      ['state "d" as A : x  : y', " x  "],
      ['state "d" as A :  ', "  "],
      ['state "d" as A :', ""],
      ['state "d" as A style:#x;  ', "#x  "],
    ] as const) {
      const text = `stateDiagram-v2\n${statement}\n`
      const root = parse(text)
      const second = stateDbTexts(root, text).secondDescriptions.get(
        firstNode(root, "StateAliasDefinitionStatement"),
      )
      expect(second === undefined ? null : textOf(text, second.range, [])).toBe(
        value,
      )
    }
  })

  it("runs the second description past a `;` that the line rule ignores, to the end of the line", () => {
    const text = 'stateDiagram-v2\nstate "d" as A style:#x;  \n'
    const root = parse(text)
    const second = stateDbTexts(root, text).secondDescriptions.get(
      firstNode(root, "StateAliasDefinitionStatement"),
    )
    expect(second?.range).toEqual([37, 42])
  })

  it("gives the text of a note on one line from the end of its id", () => {
    const text = "stateDiagram-v2\nnote left of A  : hi\n"
    const root = parse(text)
    const note = stateDbTexts(root, text).noteTexts.get(
      firstNode(root, "StateNoteStatement"),
    )
    expect(note?.range).toEqual([30, 36])
    expect(note === undefined ? null : textOf(text, note.range, [])).toBe(
      "  : hi",
    )
  })
})

describe("ignoredSemicolons", () => {
  it("gives the `;` that the line rule ignores, and not a separator", () => {
    expect(ignoredSemicolons("flowchart LR\nstyle A fill:#f00;\nB\n")).toEqual([
      [30, 31],
    ])
    expect(ignoredSemicolons("flowchart LR\nstyle A fill:red;\nB\n")).toEqual(
      [],
    )
  })
})
