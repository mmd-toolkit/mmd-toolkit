import type { Node } from "@mmd-toolkit/ast"
import { visitorKeys } from "@mmd-toolkit/parser"
import type { Source } from "./source.ts"
import { isSpaceOrTab } from "./source.ts"
import { styleColorEdits } from "./style-text.ts"

/**
 * The fields that hold the text of a style, by the type of the node: a
 * `style`, a `classDef`, a `linkStyle`, and the styles of a point of a
 * quadrant chart and of a Venn diagram (docs/compatibility.md, Colors that are
 * drawn the same). The treemap holds none: its lexer rejects a `#`.
 */
const styleFields: Readonly<Record<string, readonly string[]>> = {
  AgentflowClassDefStatement: ["styles"],
  AgentflowDefaultLinkStyleStatement: ["styles"],
  AgentflowLinkStyleStatement: ["styles"],
  AgentflowStyleStatement: ["styles"],
  BlockClassDefStatement: ["styles"],
  BlockStyleStatement: ["styles"],
  ClassClassDefStatement: ["styles"],
  ClassStyleStatement: ["styles"],
  ErClassDefStatement: ["styles"],
  ErStyleStatement: ["styles"],
  FlowchartClassDefStatement: ["styles"],
  FlowchartDefaultLinkStyleStatement: ["styles"],
  FlowchartLinkStyleStatement: ["styles"],
  FlowchartStyleStatement: ["styles"],
  QuadrantClassDefStatement: ["styles"],
  QuadrantPointStatement: ["styles"],
  RequirementClassDefStatement: ["styles"],
  RequirementStyleStatement: ["styles"],
  StateClassDefStatement: ["styles"],
  StateStyleStatement: ["styles"],
  UsecaseClassDefStatement: ["styles"],
  UsecaseStyleStatement: ["styles"],
  VennStyleProperty: ["value"],
}

/**
 * The node whose text may be a color function that stands alone, in a node of
 * the types that hold one: the color of a `rect` and the part of a `box` text
 * that mermaid.js asks the browser about, in a sequence diagram, and the value
 * of a property of a Venn style (docs/compatibility.md, Colors that are drawn
 * the same).
 */
function colorFunctionOf(node: Node): Node | null {
  switch (node.type) {
    case "SequenceBoxText":
      return node.colorCandidate
    case "SequenceRectStatement":
      return node.color?.value ?? null
    case "VennStyleProperty":
      return node.value
    default:
      return null
  }
}

/**
 * The number of arguments of each color function that is printed with a space
 * after each comma: the functions in the form that every browser reads, with
 * the commas of the older syntax (`rgb(1, 2, 3)`, `hsl(10, 40%, 90%)`).
 */
const colorFunctionArguments: Readonly<Record<string, number>> = {
  rgb: 3,
  rgba: 4,
  hsl: 3,
  hsla: 4,
}

/**
 * Whether a text is a number of digits and at most one dot, with a `%` after
 * it for a percentage, and returns whether it is a percentage, or null.
 */
function readChannel(text: string): { readonly percentage: boolean } | null {
  const percentage = text.endsWith("%")
  const number = percentage ? text.slice(0, -1) : text
  let dots = 0
  let digits = 0
  for (const character of number) {
    if (character === ".") dots++
    else if (character >= "0" && character <= "9") digits++
    else return null
  }
  return digits > 0 && dots <= 1 ? { percentage } : null
}

/**
 * The offsets, in a text that is one color function in the form of
 * `colorFunctionArguments`, of the commas between its arguments; null when the
 * text is anything else. The name is in lower case; the arguments are numbers
 * or percentages with spaces and tabs around them; the first three arguments of
 * an `rgb` are all numbers or all percentages, and the second and the third of
 * an `hsl` are percentages. Only such a function is a color in every browser:
 * when it is not, mermaid.js takes the whole text of a `box` for its title.
 */
function findColorFunctionCommas(text: string): number[] | null {
  const open = text.indexOf("(")
  if (open === -1 || !text.endsWith(")")) return null
  const name = text.slice(0, open)
  const count = colorFunctionArguments[name]
  if (count === undefined) return null
  const inner = text.slice(open + 1, -1)
  if (inner.includes("(") || inner.includes(")")) return null
  const parts = inner.split(",")
  if (parts.length !== count) return null
  const channels = parts.map((part) => {
    let from = 0
    let to = part.length
    while (from < to && isSpaceOrTab(part[from])) from++
    while (to > from && isSpaceOrTab(part[to - 1])) to--
    return readChannel(part.slice(from, to))
  })
  if (channels.some((channel) => channel === null)) return null
  const percentages = channels.map((channel) => channel!.percentage)
  const valid = name.startsWith("rgb")
    ? percentages[0] === percentages[1] && percentages[1] === percentages[2]
    : !percentages[0] && percentages[1] && percentages[2]
  if (!valid) return null
  const commas: number[] = []
  for (let index = open + 1; index < text.length - 1; index++)
    if (text[index] === ",") commas.push(index)
  return commas
}

/**
 * Records the respelling of the commas of a color function that stands alone
 * in its text: one space after each comma, where mermaid.js draws the same
 * figure (docs/compatibility.md, Colors that are drawn the same).
 */
function findColorFunctionRespellings(
  source: Source,
  found: Map<number, { readonly end: number; readonly text: string }>,
  node: Node,
): void {
  const target = colorFunctionOf(node)
  if (target === null) return
  const [start, end] = target.range
  const text = source.text.slice(start, end)
  for (const comma of findColorFunctionCommas(text) ?? []) {
    let after = comma + 1
    while (after < text.length && isSpaceOrTab(text[after])) after++
    if (text.slice(comma, after) !== ", ")
      found.set(start + comma, { end: start + after, text: ", " })
  }
}

/**
 * Records the respelling in lower case of each color in the text of a style
 * below `node` (see `styleColorEdits`): the form of Prettier's CSS formatter,
 * which draws the same figure, and the space after each comma of a color
 * function that stands alone in its text (docs/compatibility.md, Colors that
 * are drawn the same).
 */
export function findColorRespellings(
  source: Source,
  found: Map<number, { readonly end: number; readonly text: string }>,
  node: Node = source.root,
): void {
  findColorFunctionRespellings(source, found, node)
  const fields = styleFields[node.type] ?? []
  for (const key of visitorKeys[node.type]) {
    const value = (node as unknown as Record<string, unknown>)[key]
    for (const child of Array.isArray(value) ? value : [value]) {
      if (child === null || child === undefined) continue
      const item = child as Node
      if (!fields.includes(key)) {
        findColorRespellings(source, found, item)
        continue
      }
      for (const { range, replacement } of styleColorEdits(
        source,
        item.range[0],
        item.range[1],
      )) {
        found.set(range[0], { end: range[1], text: replacement })
      }
    }
  }
}
