import type { DbSummary } from "../types.ts"
import { toJsonObject } from "./json.ts"

/** The syntax-dependent node fields used by architecture drawing. */
interface ArchitectureNode {
  readonly id: string
  readonly type: "service" | "junction"
  readonly in?: string
  readonly icon?: string
  readonly iconText?: string
  readonly title?: string
}

/** Published collections, before any drawing or layout has run. */
interface ArchitectureDbLike {
  getAccTitle(): string
  getAccDescription(): string
  getNodes(): readonly ArchitectureNode[]
  getGroups(): readonly {
    readonly id: string
    readonly icon?: string
    readonly title?: string
    readonly in?: string
  }[]
  getEdges(): readonly {
    readonly lhsId: string
    readonly lhsDir: string
    readonly lhsInto?: boolean
    readonly lhsGroup?: boolean
    readonly rhsId: string
    readonly rhsDir: string
    readonly rhsInto?: boolean
    readonly rhsGroup?: boolean
    readonly title?: string
  }[]
  getLayoutHints(): readonly {
    readonly direction: string
    readonly members: readonly string[]
  }[]
}

/** Keeps each element once, without asking the Db to derive layout data. */
export function normalizeArchitecture(value: unknown): DbSummary {
  const db = value as ArchitectureDbLike
  return {
    accTitle: db.getAccTitle(),
    accDescr: db.getAccDescription(),
    nodes: db
      .getNodes()
      .map(({ id, type, in: parent, icon, iconText, title }) =>
        toJsonObject({ id, type, in: parent, icon, iconText, title }),
      ),
    groups: db
      .getGroups()
      .map(({ id, icon, title, in: parent }) =>
        toJsonObject({ id, icon, title, in: parent }),
      ),
    edges: db.getEdges().map((edge) =>
      toJsonObject({
        lhsId: edge.lhsId,
        lhsDir: edge.lhsDir,
        lhsInto: edge.lhsInto,
        lhsGroup: edge.lhsGroup,
        rhsId: edge.rhsId,
        rhsDir: edge.rhsDir,
        rhsInto: edge.rhsInto,
        rhsGroup: edge.rhsGroup,
        title: edge.title,
      }),
    ),
    layoutHints: db.getLayoutHints().map(({ direction, members }) => ({
      direction,
      members: [...members],
    })),
  }
}
