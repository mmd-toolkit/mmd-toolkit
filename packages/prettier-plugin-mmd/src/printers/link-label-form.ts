import type {
  AgentflowArrow,
  AgentflowLabel,
  AgentflowOpeningArrow,
  FlowchartArrow,
  FlowchartLabel,
  FlowchartOpeningArrow,
  Node,
  Token,
} from "@mmd-toolkit/ast"
import { childrenOf, walk } from "./layout.ts"
import type { Source } from "./source.ts"
import { findFirstIndex, isSpaceOrTab } from "./source.ts"

/**
 * The opening and the closing arrow of a link whose label is written between
 * two arrows (`-- text -->`), by the arrow that a label between `|` follows
 * (`-->|text|`).
 */
const labelledArrows: Readonly<
  Record<string, { readonly opening: string; readonly closing: string }>
> = {
  "-->": { opening: "--", closing: "-->" },
  "---": { opening: "--", closing: "---" },
  "--o": { opening: "--", closing: "--o" },
  "--x": { opening: "--", closing: "--x" },
  "-.->": { opening: "-.", closing: ".->" },
  "-.-": { opening: "-.", closing: ".-" },
  "==>": { opening: "==", closing: "==>" },
  "===": { opening: "==", closing: "===" },
}

/** The characters of a label that either form of a link writes the same. */
const plainLabelCharacters =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 _,?!"

/**
 * The form of the label of a link that the examples in the documentation of
 * the pinned mermaid.js use at least twice as often as the other, by the
 * diagram type (docs/compatibility.md, Spellings that are drawn the same):
 * between two arrows in an agentflow diagram, between `|` in a swimlane
 * diagram. The label of a flowchart stays as written.
 */
const labelForms: Readonly<Record<string, "arrows" | "pipes">> = {
  agentflow: "arrows",
  swimlane: "pipes",
}

/**
 * The arrows that a link with a label written between two arrows can have, by
 * the diagram type: an agentflow diagram reads the other arrows between `|`
 * only. A swimlane diagram reads all of them.
 */
const arrowsBetween: Readonly<Record<string, readonly string[]>> = {
  agentflow: ["-->", "--x"],
  swimlane: Object.keys(labelledArrows),
}

type Arrow = AgentflowArrow | FlowchartArrow
type OpeningArrow = AgentflowOpeningArrow | FlowchartOpeningArrow
type Label = AgentflowLabel | FlowchartLabel

/**
 * Records, for each link whose label is plain text (letters, digits, spaces,
 * `_`, `,`, `?`, and `!`), the label in the form of the diagram type: the
 * stretch from the arrow to the second `|` becomes the stretch from the
 * opening arrow to the closing arrow, or the other way round, with the arrows
 * that mermaid.js reads the same. Only whitespace lies between the tokens of
 * the stretch.
 */
export function findLinkLabelRespellings(
  source: Source,
  found: Map<number, { readonly end: number; readonly text: string }>,
): void {
  const form = labelForms[source.root.diagramType]
  if (form === undefined) return
  const links: Node[] = []
  walk(source.root, (node) => {
    if (node.type === "FlowchartLink" || node.type === "AgentflowLink") {
      links.push(node)
    }
  })
  const tokens = source.root.tokens
  for (const link of links) {
    let arrow: Arrow | null = null
    let opening: OpeningArrow | null = null
    let label: Label | null = null
    for (const child of childrenOf(link)) {
      if (
        child.type === "AgentflowOpeningArrow" ||
        child.type === "FlowchartOpeningArrow"
      ) {
        opening = child
      } else if (
        child.type === "AgentflowArrow" ||
        child.type === "FlowchartArrow"
      ) {
        arrow = child
      } else if (
        child.type === "AgentflowLabel" ||
        child.type === "FlowchartLabel"
      ) {
        label = child
      }
    }
    if (arrow === null || label === null || label.kind !== "text") continue
    const text = source.text.slice(...label.range)
    if (
      text.trim() === "" ||
      [...text].some((character) => !plainLabelCharacters.includes(character))
    ) {
      continue
    }
    const index = findFirstIndex(
      tokens,
      (token) => token.range[0] >= label.range[0],
    )
    if (form === "arrows" && opening === null) {
      const parts = tokens.slice(index - 2, index + 2)
      const arrows = labelledArrows[textOf(source, parts[0])]
      if (
        arrows === undefined ||
        !arrowsBetween[source.root.diagramType].includes(
          textOf(source, parts[0]),
        ) ||
        parts.length !== 4 ||
        parts[0].range[0] !== arrow.range[0] ||
        textOf(source, parts[1]) !== "|" ||
        textOf(source, parts[3]) !== "|" ||
        !isOnlyBlanksBetween(source, parts)
      ) {
        continue
      }
      found.set(parts[0].range[0], {
        end: parts[3].range[1],
        text: `${arrows.opening} ${text} ${arrows.closing}`,
      })
    } else if (form === "pipes" && opening !== null) {
      const parts = tokens.slice(index - 1, index + 2)
      const openingText = textOf(source, parts[0])
      const closingText = textOf(source, parts[2])
      const pipeArrow = Object.keys(labelledArrows).find(
        (candidate) =>
          labelledArrows[candidate].opening === openingText &&
          labelledArrows[candidate].closing === closingText,
      )
      if (
        pipeArrow === undefined ||
        !arrowsBetween[source.root.diagramType].includes(pipeArrow) ||
        parts.length !== 3 ||
        parts[0].range[0] !== opening.range[0] ||
        parts[2].range[0] !== arrow.range[0] ||
        !isOnlyBlanksBetween(source, parts)
      ) {
        continue
      }
      found.set(parts[0].range[0], {
        end: parts[2].range[1],
        text: `${pipeArrow}|${text}|`,
      })
    }
  }
}

/** The text of a token, or an empty text where there is no token. */
function textOf(source: Source, token: Token | undefined): string {
  return token === undefined ? "" : source.text.slice(...token.range)
}

/** Whether nothing but spaces and tabs lies between consecutive tokens. */
function isOnlyBlanksBetween(
  source: Source,
  tokens: readonly Token[],
): boolean {
  return tokens.every(
    (token, index) =>
      index === 0 ||
      [...source.text.slice(tokens[index - 1].range[1], token.range[0])].every(
        isSpaceOrTab,
      ),
  )
}
