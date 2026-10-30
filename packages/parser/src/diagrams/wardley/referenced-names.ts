/** One prefix of the comparison names queried by acceptance checks. */
interface NamePrefix {
  readonly next: Map<string, NamePrefix>
  /** The full queried name, when this prefix is a complete name. */
  name: string | undefined
}

/** Full queried names whose prefix is the pipeline parent's name followed by `_`. */
export interface ChildReferences {
  readonly nameOf: (childName: string) => string | undefined
}

/** Follow a comparison name from a prefix, without constructing its full spelling again. */
function prefixAt(
  prefix: NamePrefix | undefined,
  text: string,
): NamePrefix | undefined {
  let current = prefix
  for (const character of text) {
    current = current?.next.get(character)
    if (current === undefined) return undefined
  }
  return current
}

/**
 * Only pipeline-parent and evolve names are queried after registration.
 * Index their prefixes once: constructing and comparing a long parent-based
 * ID for every child can multiply the parent's length by the child count.
 */
export class ReferencedNames {
  private readonly root: NamePrefix = { next: new Map(), name: undefined }

  public constructor(names: readonly string[]) {
    for (const name of names) {
      let prefix = this.root
      for (const character of name) {
        let next = prefix.next.get(character)
        if (next === undefined) {
          next = { next: new Map(), name: undefined }
          prefix.next.set(character, next)
        }
        prefix = next
      }
      prefix.name = name
    }
  }

  /** Resolve the parent's prefix once, then look up each written child suffix. */
  public childrenOf(parentName: string): ChildReferences {
    const prefix = prefixAt(this.root, parentName)?.next.get("_")
    return { nameOf: (childName) => prefixAt(prefix, childName)?.name }
  }
}
