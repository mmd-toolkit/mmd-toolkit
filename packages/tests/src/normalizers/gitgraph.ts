import type { DbSummary } from "../types.ts"
import { numberOrText } from "../summary-number.ts"
import { toJsonObject } from "./json.ts"

/** The published commit fields consumed by drawing. */
interface Commit {
  readonly id: string
  readonly seq: number
  readonly type: number
  readonly tags: readonly string[]
  readonly parents: readonly string[]
  readonly branch: string
  readonly customType?: number
  readonly customId?: boolean
}

/** The shared object Db; publication is observed without changing its inputs. */
interface GitgraphDbLike {
  clear(): void
  commit(value: { id?: string }): void
  merge(value: { id?: string }): void
  cherryPick(value: unknown): void
  getCommits(): ReadonlyMap<string, Commit>
  getBranchesAsObjArray(): readonly { name: string }[]
  getHead(): Commit | null
  getDirection(): string
  getDiagramTitle(): string
  getAccTitle(): string
  getAccDescription(): string
}

/** Authorship cannot be inferred from an id's random-looking spelling. */
interface IdReading {
  readonly generated: Set<string>
  readonly authored: Set<string>
}

const readings = new WeakMap<object, IdReading>()

/**
 * Observes which published ids are generated. Resets alongside the object Db,
 * including between the public acceptance parse and the summary parse.
 *
 * Mermaid chooses an id after sanitization; this observer uses input.id before
 * it. This relies on the runner's sanitizer never emptying a nonempty id:
 * DOMPurify is disabled and the remaining HTML escaping preserves its text.
 * This promise was verified at strict, loose, antiscript and sandbox security
 * levels. The observer does not reproduce the sanitizer.
 */
export function patchGitgraphDb(value: object): void {
  const db = value as GitgraphDbLike
  const reading: IdReading = {
    generated: new Set(),
    authored: new Set(),
  }
  readings.set(db, reading)
  const clear = db.clear.bind(db)
  db.clear = function () {
    reading.generated.clear()
    reading.authored.clear()
    clear()
  }
  for (const method of ["commit", "merge"] as const) {
    const publish = db[method].bind(db)
    db[method] = function (input) {
      publish(input)
      const head = db.getHead()
      if (head === null) throw new Error("gitgraph publication has no HEAD")
      if (input.id) reading.authored.add(head.id)
      else reading.generated.add(head.id)
    }
  }
  const cherryPick = db.cherryPick.bind(db)
  db.cherryPick = function (input) {
    const before = db.getHead()
    cherryPick(input)
    const head = db.getHead()
    if (head !== null && head !== before) {
      reading.generated.add(head.id)
    }
  }
}

/**
 * Keeps commits in first-id insertion order and branches in renderer order.
 * Only generated commit ids and parent references are renamed. Tags are copied
 * as stored and are never searched for random-looking substrings.
 */
export function normalizeGitgraph(value: unknown): DbSummary {
  const db = value as GitgraphDbLike
  const reading = readings.get(db)
  if (reading === undefined) throw new Error("gitgraph Db was not observed")
  const renamed = new Map<string, string>()
  const occupied = new Set(reading.authored)
  let next = 1
  for (const id of reading.generated) {
    let name = `generated-commit-${next++}`
    while (occupied.has(name)) name = `generated-commit-${next++}`
    occupied.add(name)
    renamed.set(id, name)
  }

  /** Replaces an observed generated reference, keeping authored ids intact. */
  function rename(id: string): string {
    return renamed.get(id) ?? id
  }

  return {
    direction: db.getDirection(),
    title: db.getDiagramTitle(),
    accTitle: db.getAccTitle(),
    accDescr: db.getAccDescription(),
    commits: [...db.getCommits().values()].map((commit) =>
      toJsonObject({
        id: rename(commit.id),
        seq: numberOrText(commit.seq),
        type: commit.type,
        tags: [...commit.tags],
        parents: commit.parents.map(rename),
        branch: commit.branch,
        customType: commit.customType,
        customId: commit.customId,
      }),
    ),
    branches: db.getBranchesAsObjArray().map(({ name }) => ({ name })),
  }
}
