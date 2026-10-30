import type { CheckedNode } from "../src/check-tree/types.ts"
import type { Kit } from "./check-tree-built.ts"
import { hull } from "./statement-tree-built.ts"

/** A branch reference whose complete spelling is supplied, without a lexer. */
export function reference(kit: Kit, raw: string): CheckedNode {
  const quoted = raw.startsWith('"') || raw.startsWith("'")
  const token = kit.token(quoted ? "String" : "Identifier", raw)
  return kit.node(
    quoted ? "StringLiteral" : "Identifier",
    token.range,
    quoted ? { raw, value: raw.slice(1, -1), closed: true } : { name: raw },
  )
}

/** Named hidden lists are explicit occurrences in each hand-built tree. */
export interface Gaps {
  readonly before?: () => CheckedNode[]
  readonly beforeValue?: () => CheckedNode[]
  readonly after?: () => CheckedNode[]
}

/** One authored option, including its exact introducer choice and value. */
export function option(
  kit: Kit,
  kind: "Id" | "Message" | "Tag" | "Type" | "Parent" | "Order",
  raw: string,
  gaps: Gaps = {},
  bare = false,
): CheckedNode {
  const textBefore = gaps.before?.() ?? []
  const pieces: { range: readonly [number, number] }[] = [...textBefore]
  if (!bare) {
    pieces.push(
      kit.token("Keyword", kind === "Message" ? "msg" : kind.toLowerCase()),
    )
    pieces.push(kit.token("Punctuator", ":"))
  }
  const textBeforeValue = gaps.beforeValue?.() ?? []
  pieces.push(...textBeforeValue)
  let value: CheckedNode | string
  if (kind === "Type") {
    pieces.push(kit.token("Keyword", raw))
    value = raw
  } else if (kind === "Order") {
    value = kit.node("NumericLiteral", kit.token("Numeric", raw).range, {
      raw,
      value: Number(raw),
    })
    pieces.push(value)
  } else {
    value = reference(kit, raw)
    pieces.push(value)
  }
  return kit.node(`Gitgraph${kind}Option`, hull(pieces), {
    textBefore,
    ...(kind === "Message" ? { keyword: bare ? null : "msg" } : {}),
    textBeforeValue,
    value,
  })
}

/** Commit or cherry-pick with explicit source-order option occurrences. */
export function commit(
  kit: Kit,
  make: () => CheckedNode[] = () => [],
  after: () => CheckedNode[] = () => [],
  cherryPick = false,
): CheckedNode {
  const keyword = kit.token("Keyword", cherryPick ? "cherry-pick" : "commit")
  const options = make()
  const textAfter = after()
  return kit.node(
    cherryPick ? "GitgraphCherryPickStatement" : "GitgraphCommitStatement",
    hull([keyword, ...options, ...textAfter]),
    { options, textAfter },
  )
}

/** Branch creation, with its optional authored order. */
export function branch(
  kit: Kit,
  raw: string,
  order: (() => CheckedNode) | null = null,
  gaps: Gaps = {},
): CheckedNode {
  const keyword = kit.token("Keyword", "branch")
  const textBeforeName = gaps.before?.() ?? []
  const name = reference(kit, raw)
  const orderNode = order?.() ?? null
  const textAfter = gaps.after?.() ?? []
  return kit.node(
    "GitgraphBranchStatement",
    hull([
      keyword,
      name,
      ...(orderNode === null ? [] : [orderNode]),
      ...textAfter,
    ]),
    { textBeforeName, name, order: orderNode, textAfter },
  )
}

/** An authored checkout/switch or merge reference, with named gaps. */
export function checkout(
  kit: Kit,
  raw: string,
  keyword: "checkout" | "switch" = "checkout",
  gaps: Gaps = {},
): CheckedNode {
  const word = kit.token("Keyword", keyword)
  const textBeforeBranch = gaps.before?.() ?? []
  const name = reference(kit, raw)
  const textAfter = gaps.after?.() ?? []
  return kit.node(
    "GitgraphCheckoutStatement",
    hull([word, name, ...textAfter]),
    { keyword, textBeforeBranch, branch: name, textAfter },
  )
}

/** A merge with its source branch and source-order options. */
export function merge(
  kit: Kit,
  raw: string,
  make: () => CheckedNode[] = () => [],
  gaps: Gaps = {},
): CheckedNode {
  const keyword = kit.token("Keyword", "merge")
  const textBeforeBranch = gaps.before?.() ?? []
  const name = reference(kit, raw)
  const options = make()
  const textAfter = gaps.after?.() ?? []
  return kit.node(
    "GitgraphMergeStatement",
    hull([keyword, name, ...options, ...textAfter]),
    { textBeforeBranch, branch: name, options, textAfter },
  )
}
