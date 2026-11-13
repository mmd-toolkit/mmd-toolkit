import type {
  FlowchartDefaultLinkStyleStatement,
  FlowchartLinkStyleStatement,
  Node,
} from "@mmd-toolkit/ast"
import { walk } from "./layout.ts"
import type { Source } from "./source.ts"
import { textWithoutDirectives } from "./source.ts"

/**
 * Which part of the styles of a link some versions that count put in the style
 * of the label of the link, with `fill:` written `color:`: the first `fill:` in
 * all the styles of the link (`first-fill`, in a flowchart), or the first style
 * of the link, which they read whole (`first-style`, in a swimlane diagram).
 * The styles of a link are those of the last `linkStyle default` statement,
 * then those of the last `linkStyle` statement that numbers it
 * (docs/flowchart.md, Whitespace between tokens).
 */
export type FillOfLabel = "first-fill" | "first-style"

type LinkStyleStatement =
  FlowchartLinkStyleStatement | FlowchartDefaultLinkStyleStatement

/** The `linkStyle` statements that set styles, by what they replace. */
interface LinkStyles {
  /** The last `linkStyle default` statement that sets styles. */
  readonly lastDefault: FlowchartDefaultLinkStyleStatement | null
  /** Whether a style of `lastDefault` has `fill:` in its text. */
  readonly defaultHasFill: boolean
  /** The last statement that sets styles, by the number of the link. */
  readonly lastByLink: ReadonlyMap<number, FlowchartLinkStyleStatement>
}

/** The `linkStyle` statements of each diagram, found once per source. */
const linkStylesBySource = new WeakMap<Source, LinkStyles>()

function linkStylesOf(source: Source): LinkStyles {
  const cached = linkStylesBySource.get(source)
  if (cached !== undefined) return cached
  const defaults: FlowchartDefaultLinkStyleStatement[] = []
  const lastByLink = new Map<number, FlowchartLinkStyleStatement>()
  walk(source.root, (node) => {
    if (node.type === "FlowchartDefaultLinkStyleStatement") {
      if (node.styles.length > 0) defaults.push(node)
    } else if (
      node.type === "FlowchartLinkStyleStatement" &&
      node.styles.length > 0
    ) {
      for (const index of node.indices)
        lastByLink.set(linkNumber(source, index), node)
    }
  })
  const lastDefault = defaults.at(-1) ?? null
  const found: LinkStyles = {
    lastDefault,
    defaultHasFill: lastDefault !== null && hasFillColon(source, lastDefault),
    lastByLink,
  }
  linkStylesBySource.set(source, found)
  return found
}

/** The number of the link that a number of a `linkStyle` names. */
function linkNumber(source: Source, index: Node): number {
  return Number(source.text.slice(index.range[0], index.range[1]))
}

/** Whether a style of the statement has `fill:` in its text. */
function hasFillColon(source: Source, statement: LinkStyleStatement): boolean {
  return statement.styles.some(
    (style) =>
      style !== null &&
      textWithoutDirectives(source, ...style.range).includes("fill:"),
  )
}

/**
 * Which part of its styles the statement gives to the style of the labels of
 * the links it sets (see `FillOfLabel`), or null where it gives none:
 *
 * - A later `linkStyle default` replaces a `linkStyle default`, and a later
 *   `linkStyle` replaces a `linkStyle` for each link it numbers; a statement
 *   replaced for all its links sets none.
 * - The styles of a `linkStyle default` stand before those of a numbered
 *   `linkStyle` in the styles of a link. In a swimlane diagram the label reads
 *   the first of them, so the numbered statement gives nothing where a
 *   `linkStyle default` sets styles; in a flowchart the label reads the first
 *   `fill:`, so it gives nothing where a style of the `linkStyle default` has
 *   one.
 */
export function findFillOfLabel(
  source: Source,
  statement: LinkStyleStatement,
): FillOfLabel | null {
  const { lastDefault, defaultHasFill, lastByLink } = linkStylesOf(source)
  const swimlane = source.root.diagramType === "swimlane"
  const own = swimlane ? "first-style" : "first-fill"
  if (statement.type === "FlowchartDefaultLinkStyleStatement") {
    return statement === lastDefault ? own : null
  }
  const replaced = !statement.indices.some(
    (index) => lastByLink.get(linkNumber(source, index)) === statement,
  )
  if (replaced) return null
  if (lastDefault !== null && (swimlane || defaultHasFill)) return null
  return own
}
