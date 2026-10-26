import type {
  EventmodelingDataEntityStatement,
  EventmodelingDiagram,
  EventmodelingResetFrameStatement,
  EventmodelingTimeFrameStatement,
  Identifier,
} from "@mmd-toolkit/parser"

/** Written identifier identity retains case and the leading zeros of frame names. */
export function eventmodelingNameText(node: Identifier): string {
  return node.name
}

/** Declarations and explicit frame references, including declarations after their use. */
interface EventmodelingDeclarations {
  readonly frames: readonly (
    EventmodelingTimeFrameStatement | EventmodelingResetFrameStatement
  )[]
  readonly frameNames: ReadonlySet<string>
  readonly dataDeclarations: readonly EventmodelingDataEntityStatement[]
  readonly dataNames: ReadonlySet<string>
  readonly referencedData: ReadonlySet<string>
}

const cache = new WeakMap<EventmodelingDiagram, EventmodelingDeclarations>()

/** Only frames declare frame names or use data blocks; notes and GWT do neither. */
export function eventmodelingDeclarationsOf(
  diagram: EventmodelingDiagram,
): EventmodelingDeclarations {
  const cached = cache.get(diagram)
  if (cached !== undefined) return cached
  const frames: (
    EventmodelingTimeFrameStatement | EventmodelingResetFrameStatement
  )[] = []
  const frameNames = new Set<string>()
  const dataDeclarations: EventmodelingDataEntityStatement[] = []
  const dataNames = new Set<string>()
  const referencedData = new Set<string>()
  for (const node of diagram.body) {
    if (
      node.type === "EventmodelingTimeFrameStatement" ||
      node.type === "EventmodelingResetFrameStatement"
    ) {
      frames.push(node)
      frameNames.add(eventmodelingNameText(node.name))
      if (node.dataReference !== null) {
        referencedData.add(eventmodelingNameText(node.dataReference.name))
      }
    } else if (node.type === "EventmodelingDataEntityStatement") {
      dataDeclarations.push(node)
      dataNames.add(eventmodelingNameText(node.name))
    }
  }
  const declarations = {
    frames,
    frameNames,
    dataDeclarations,
    dataNames,
    referencedData,
  }
  cache.set(diagram, declarations)
  return declarations
}
