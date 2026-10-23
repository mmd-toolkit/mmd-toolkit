import { decodedString, commonValue } from "./statement-values.ts"
import type { EmbeddedValues } from "../mermaid.ts"
import type { DbSummary, JsonObject, MermaidConfig } from "../types.ts"
import { ConvertedText, readConvertedCharacters } from "./converted-text.ts"
import type {
  GitgraphDiagram,
  GitgraphOption,
  GitgraphReference,
} from "./gitgraph-tree.ts"
import { textReplacementOf } from "./text-replacement.ts"
import type { TreeRoot } from "./tree.ts"
import { descriptionOf } from "./values.ts"

/** The stored drawing fields; branch tips are intermediate publication state. */
interface Commit {
  readonly id: string
  readonly seq: number
  readonly type: number
  readonly tags: string[]
  readonly parents: string[]
  readonly branch: string
  readonly customType?: number
  readonly customId?: boolean
}

/** Final options after repeated scalar assignments and append-only tags. */
interface Options {
  id: string
  parent: string
  type?: number
  tags: string[]
}

/** docs/db-from-tree/gitgraph.md: publication order, replacement and renderer order. */
export function gitgraphDbOf(
  source: string,
  root: TreeRoot,
  diagram: GitgraphDiagram,
  embedded: EmbeddedValues,
): DbSummary {
  const text = new ConvertedText(readConvertedCharacters(source, root))
  const config = embedded.config.gitGraph
  const settings: MermaidConfig =
    typeof config === "object" && config !== null && !Array.isArray(config)
      ? (config as JsonObject)
      : {}
  const replace = textReplacementOf(settings)
  const replaceCommon = textReplacementOf(embedded.config)
  const main = String(settings.mainBranchName ?? "main")
  const branches = new Map<string, { head: string | null; order: number }>([
    [main, { head: null, order: Number(settings.mainBranchOrder ?? 0) }],
  ])
  const commits = new Map<string, Commit>()
  let branch = main
  let head: string | null = null
  let seq = 0
  let generated = 1
  let title = ""
  let accTitle = ""
  let accDescr = ""

  /** References and STRING options share escape decoding, without trimming. */
  function reference(node: GitgraphReference): string {
    return node.type === "StringLiteral"
      ? decodedString(text.of([node.range[0] + 1, node.range[1] - 1]))
      : text.of(node.range)
  }

  /** Only merge tags bypass the gitgraph-specific sanitizer. */
  function options(nodes: readonly GitgraphOption[], merge: boolean): Options {
    const result: Options = { id: "", parent: "", tags: [] }
    for (const option of nodes) {
      if (option.type === "GitgraphTypeOption") {
        result.type = ["NORMAL", "REVERSE", "HIGHLIGHT"].indexOf(option.value)
        continue
      }
      const value = reference(option.value)
      switch (option.type) {
        case "GitgraphIdOption":
          result.id = replace(value)
          break
        case "GitgraphParentOption":
          result.parent = replace(value)
          break
        case "GitgraphTagOption":
          result.tags.push(merge ? value : replace(value))
          break
        case "GitgraphMessageOption":
          break
        default:
          throw new Error(
            `gitgraph Db: unknown option ${JSON.stringify(option satisfies never)}`,
          )
      }
    }
    return result
  }

  // Reserve all published authored ids, including later and overwritten ids.
  const occupied = new Set<string>()
  for (const statement of diagram.body) {
    if (
      statement.type !== "GitgraphCommitStatement" &&
      statement.type !== "GitgraphMergeStatement"
    )
      continue
    const id = options(
      statement.options,
      statement.type === "GitgraphMergeStatement",
    ).id
    if (id !== "") occupied.add(id)
  }

  /** Each creation without an authored target id, including every cherry-pick, takes the next free name. */
  function generatedId(): string {
    let id = `generated-commit-${generated++}`
    while (occupied.has(id)) id = `generated-commit-${generated++}`
    occupied.add(id)
    return id
  }

  /** Map.set replaces at the first-id position; creation sequence never rewinds. */
  function publish(value: Omit<Commit, "seq" | "branch">): void {
    commits.set(value.id, { ...value, seq: seq++, branch })
    head = value.id
    const current = branches.get(branch)
    if (current === undefined)
      throw new Error("gitgraph tree: current branch is missing")
    current.head = head
  }

  for (const statement of diagram.body) {
    switch (statement.type) {
      case "GitgraphIgnoredText":
        break
      case "GitgraphTitleStatement":
        title = commonValue(
          statement.value === null ? "" : text.of(statement.value.range),
          false,
        )
        break
      case "GitgraphAccTitleStatement":
        accTitle = commonValue(
          statement.value === null ? "" : text.of(statement.value.range),
          false,
        )
        break
      case "GitgraphAccDescrStatement":
      case "GitgraphAccDescrBlockStatement":
        accDescr = commonValue(
          statement.value === null ? "" : text.of(statement.value.range),
          statement.type === "GitgraphAccDescrBlockStatement",
        )
        break
      case "GitgraphBranchStatement": {
        const name = replace(reference(statement.name))
        branches.set(name, {
          head,
          order:
            statement.order === null
              ? 0
              : Number(text.of(statement.order.value.range)),
        })
        branch = name
        break
      }
      case "GitgraphCheckoutStatement": {
        branch = replace(reference(statement.branch))
        head = branches.get(branch)?.head ?? null
        break
      }
      case "GitgraphCommitStatement": {
        const value = options(statement.options, false)
        publish({
          id: value.id || generatedId(),
          type: value.type ?? 0,
          tags: value.tags,
          parents: head === null ? [] : [head],
        })
        break
      }
      case "GitgraphMergeStatement": {
        const value = options(statement.options, true)
        const from = branches.get(replace(reference(statement.branch)))?.head
        if (head === null || from === undefined || from === null)
          throw new Error("gitgraph tree: accepted merge has no parent")
        publish({
          id: value.id || generatedId(),
          type: 3,
          tags: value.tags,
          parents: [head, from],
          ...(value.type === undefined ? {} : { customType: value.type }),
          customId: value.id !== "",
        })
        break
      }
      case "GitgraphCherryPickStatement": {
        const value = options(statement.options, false)
        const from = commits.get(value.id)
        if (head === null || from === undefined)
          throw new Error("gitgraph tree: accepted cherry-pick has no parent")
        const tags =
          value.tags.length > 0
            ? value.tags.filter((tag) => tag !== "")
            : [
                replace(
                  `cherry-pick:${value.id}${from.type === 3 ? `|parent:${value.parent}` : ""}`,
                ),
              ]
        publish({ id: generatedId(), type: 4, tags, parents: [head, from.id] })
        break
      }
      default:
        throw new Error(
          `gitgraph Db: unknown statement ${JSON.stringify(statement satisfies never)}`,
        )
    }
  }
  return {
    direction: diagram.direction ?? "LR",
    title: replaceCommon(title || embedded.title || ""),
    accTitle: replaceCommon(accTitle),
    accDescr: replaceCommon(descriptionOf(accDescr)),
    commits: [...commits.values()].map((value): JsonObject => ({ ...value })),
    branches: [...branches]
      .sort((a, b) => a[1].order - b[1].order)
      .map(([name]) => ({ name })),
  }
}
