import type { Identifier, NodeBase, StringLiteral } from "../../ast.ts"
import type {
  GitgraphCherryPickStatement,
  GitgraphCommitStatement,
  GitgraphDiagram,
  GitgraphIdOption,
  GitgraphMergeStatement,
  GitgraphParentOption,
} from "../../ast/gitgraph.ts"
import { ParseError } from "../../errors.ts"
import { escapeGitgraphComparison } from "./comparison-values.ts"

/** Comparison values before diagram-scoped escaping, retained from the lexical units. */
export type GitgraphDecodedValues = ReadonlyMap<
  Identifier | StringLiteral,
  string
>

/** The two external settings that can change semantic acceptance; not public parser options. */
export interface GitgraphHistorySettings {
  readonly mainBranchName: string
  readonly escapeHtml: boolean
}

/** Written ids are strings; anonymous identities cannot be named by any source string. */
type CommitIdentity = string | symbol

/** State of the written history: the current complete definition of one identity. */
interface CommitDefinition {
  readonly identity: CommitIdentity
  readonly branch: string
  readonly kind: "ordinary" | "merge" | "cherry-pick"
  readonly parents: readonly CommitIdentity[]
}

/** State of the written history and Rejections, without changing source nodes. */
class GitgraphHistory {
  private readonly values: GitgraphDecodedValues

  private readonly settings: GitgraphHistorySettings

  private readonly branches = new Map<string, CommitIdentity | null>()

  private readonly definitions = new Map<CommitIdentity, CommitDefinition>()

  private currentBranch: string

  private head: CommitDefinition | null = null

  public constructor(
    values: GitgraphDecodedValues,
    settings: GitgraphHistorySettings,
  ) {
    this.values = values
    this.settings = settings
    this.currentBranch = settings.mainBranchName
    this.branches.set(this.currentBranch, null)
  }

  /** Each operation is tested against the pre-statement history, then publishes its state change. */
  public check(diagram: GitgraphDiagram): void {
    for (const statement of diagram.body) {
      switch (statement.type) {
        case "GitgraphCommitStatement":
          this.commit(statement)
          break
        case "GitgraphBranchStatement": {
          const name = this.comparison(statement.name)
          if (this.branches.has(name))
            this.reject(statement.name, "A branch name must not already exist")
          const tip = this.head?.identity ?? null
          this.branches.set(name, tip)
          this.currentBranch = name
          this.head = this.resolve(tip)
          break
        }
        case "GitgraphCheckoutStatement": {
          const name = this.comparison(statement.branch)
          if (!this.branches.has(name))
            this.reject(
              statement.branch,
              "Checkout or switch must name an existing branch",
            )
          this.currentBranch = name
          this.head = this.tip(name)
          break
        }
        case "GitgraphMergeStatement":
          this.merge(statement)
          break
        case "GitgraphCherryPickStatement":
          this.cherryPick(statement)
          break
        default:
          break
      }
    }
  }

  /** Ordinary commits may replace any existing authored identity, including their preceding HEAD. */
  private commit(statement: GitgraphCommitStatement): void {
    const id = this.finalId(statement)
    this.publish(
      id === null || id.value.length === 0 ? Symbol() : id.value,
      "ordinary",
      this.head === null ? [] : [this.head.identity],
    )
  }

  /** Merge checks both tips and the final custom id before advancing only the current branch. */
  private merge(statement: GitgraphMergeStatement): void {
    const name = this.comparison(statement.branch)
    const current = this.tip(this.currentBranch)
    const source = this.tip(name)
    if (current !== null && source !== null && current.branch === name)
      this.reject(
        statement.branch,
        "A merge source cannot be the branch that created the current tip",
      )
    if (name === this.currentBranch)
      this.reject(statement.branch, "A branch cannot merge itself")
    if (current === null)
      this.reject(
        statement,
        "A merge requires a commit at the current branch tip",
      )
    if (!this.branches.has(name))
      this.reject(
        statement.branch,
        "A merge must name an existing source branch",
      )
    if (source === null)
      this.reject(
        statement.branch,
        "A merge requires a commit at the source branch tip",
      )
    if (current === source)
      this.reject(
        statement.branch,
        "A merge requires different tip definitions",
      )
    const id = this.finalId(statement)
    if (id !== null && id.value.length > 0 && this.definitions.has(id.value))
      this.reject(id.option.value, "A merge id must not already name a commit")
    this.publish(
      id === null || id.value.length === 0 ? Symbol() : id.value,
      "merge",
      [this.head!.identity, source.identity],
    )
  }

  /** A parent is an immediate-parent assertion; cherry-pick always parents HEAD and source and creates an anonymous identity. */
  private cherryPick(statement: GitgraphCherryPickStatement): void {
    const id = this.finalId(statement)
    const source =
      id === null || id.value.length === 0
        ? null
        : (this.definitions.get(id.value) ?? null)
    if (source === null)
      this.reject(
        id?.option.value ?? statement,
        "A cherry-pick source id must name a commit",
      )
    let parent: GitgraphParentOption | null = null
    for (const option of statement.options)
      if (option.type === "GitgraphParentOption") parent = option
    const parentId = parent === null ? "" : this.comparison(parent.value)
    if (parentId.length > 0 && !source.parents.includes(parentId))
      this.reject(
        parent!.value,
        "A cherry-pick parent must be an immediate parent of the source",
      )
    if (source.kind === "merge" && parentId.length === 0)
      this.reject(
        id!.option.value,
        "A cherry-pick of a merge requires a nonempty parent",
      )
    if (source.branch === this.currentBranch)
      this.reject(
        id!.option.value,
        "A cherry-pick source must be created on another branch",
      )
    if (this.tip(this.currentBranch) === null)
      this.reject(
        statement,
        "A cherry-pick requires a commit at the current branch tip",
      )
    this.publish(Symbol(), "cherry-pick", [
      this.head!.identity,
      source.identity,
    ])
  }

  /** Only the final scalar id occurrence contributes to comparison and identity selection. */
  private finalId(
    statement:
      | GitgraphCommitStatement
      | GitgraphMergeStatement
      | GitgraphCherryPickStatement,
  ): { readonly option: GitgraphIdOption; readonly value: string } | null {
    let final: GitgraphIdOption | null = null
    for (const option of statement.options)
      if (option.type === "GitgraphIdOption") final = option
    return final === null
      ? null
      : { option: final, value: this.comparison(final.value) }
  }

  /** Comparisons retain decoded whitespace and case and apply only the specified diagram-scoped escaping. */
  private comparison(node: Identifier | StringLiteral): string {
    const value = this.values.get(node)
    if (value === undefined)
      throw new Error(
        "mmd-toolkit parser bug: missing gitgraph comparison value",
      )
    return this.settings.escapeHtml ? escapeGitgraphComparison(value) : value
  }

  /** Resolving an identity always reads its latest definition, including a replacement. */
  private resolve(identity: CommitIdentity | null): CommitDefinition | null {
    return identity === null ? null : (this.definitions.get(identity) ?? null)
  }

  /** Unknown branches and empty tips have no definition. */
  private tip(branch: string): CommitDefinition | null {
    return this.resolve(this.branches.get(branch) ?? null)
  }

  /** Publish a whole definition, set HEAD and advance only the current branch tip; never rewrite old identity references. */
  private publish(
    identity: CommitIdentity,
    kind: CommitDefinition["kind"],
    parents: readonly CommitIdentity[],
  ): void {
    const definition: CommitDefinition = {
      identity,
      branch: this.currentBranch,
      kind,
      parents,
    }
    this.definitions.set(identity, definition)
    this.head = definition
    this.branches.set(this.currentBranch, identity)
  }

  /** Semantic errors identify the authored component responsible for the rejected condition. */
  private reject(node: NodeBase, message: string): never {
    throw new ParseError(message, node.range, node.loc)
  }
}

/** Semantic acceptance conditions: validate source-ordered statements under the named defaults or external settings. */
export function checkGitgraphHistory(
  diagram: GitgraphDiagram,
  values: GitgraphDecodedValues,
  settings: GitgraphHistorySettings = {
    mainBranchName: "main",
    escapeHtml: true,
  },
): void {
  new GitgraphHistory(values, settings).check(diagram)
}
