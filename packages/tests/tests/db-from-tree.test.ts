import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { isDeepStrictEqual } from "node:util"
import { describe, expect, it } from "vitest"
import type { DbTreeRoot } from "../src/db-from-tree/index.ts"
import { dbFromTree } from "../src/db-from-tree/index.ts"
import type { DiagramType, Fixture } from "../src/index.ts"
import {
  embeddedValuesOf,
  getFixturesRoot,
  loadFixtures,
} from "../src/index.ts"
import { cssSupportsColor } from "../src/normalizers/browser-stand-ins.ts"

// Reading every fixture and building every Db takes a few seconds alone and
// grows with the fixtures.
const BUILDS_EVERY_DB = 60_000

const DIAGRAMS: readonly DiagramType[] = [
  "common",
  "flowchart",
  "sequence",
  "class",
  "state",
  "er",
  "gantt",
  "journey",
  "requirement",
  "mindmap",
  "timeline",
  "sankey",
  "xychart",
  "quadrant",
  "block",
  "kanban",
]

/** The file in which a parser records the tree of a fixture it accepts. */
const AST_FILE = "ast.json"

/** The file in which a parser records the error of a fixture it rejects. */
const PARSE_ERROR_FILE = "parse-error.json"

/** The path of `file` in the directory of `fixture`. */
function fileOf(fixture: Fixture, file: string): string {
  return path.join(getFixturesRoot(), fixture.diagram, fixture.name, file)
}

/**
 * The diagram types of mermaid.js whose parser has not recorded trees yet, in
 * the steps between the normalizer of a new diagram type and the recording of
 * its trees (the skill `tests`, adding a diagram type): the fixtures of
 * `common/` that are detected as one have a summary and no tree, since the
 * reference implementation does not read the diagram type
 * (`UnsupportedDiagramError`). A type leaves the list when the parser records
 * its trees, and the list is empty between two diagram types.
 */
const DIAGRAM_TYPES_WITHOUT_RECORDED_TREES: readonly string[] = []

describe("dbFromTree", () => {
  for (const diagram of DIAGRAMS) {
    it(
      `builds the recorded Db from the recorded tree of each ${diagram} fixture`,
      async () => {
        const differing: string[] = []
        const withoutParse: string[] = []
        const unsupportedWithTree: string[] = []
        let compared = 0
        for (const fixture of await loadFixtures(diagram)) {
          const result = fixture.specified ?? fixture.expected
          if (!result.accepted || result.db === null) continue
          const name = `${fixture.diagram}/${fixture.name}`
          if (
            result.diagramType !== undefined &&
            DIAGRAM_TYPES_WITHOUT_RECORDED_TREES.includes(result.diagramType)
          ) {
            // Compared once the builder exists; a tree recorded earlier means
            // that the list is out of date.
            if (existsSync(fileOf(fixture, AST_FILE))) {
              unsupportedWithTree.push(name)
            }
            continue
          }
          if (!existsSync(fileOf(fixture, AST_FILE))) {
            // The parser rejects the input on purpose (a known divergence of
            // the specification) and records the error; anything else is a
            // fixture that no parser has recorded.
            if (!existsSync(fileOf(fixture, PARSE_ERROR_FILE))) {
              withoutParse.push(name)
            }
            continue
          }
          const tree = JSON.parse(
            readFileSync(fileOf(fixture, AST_FILE), "utf8"),
          ) as DbTreeRoot
          const embedded = embeddedValuesOf(fixture, result)
          if (embedded === undefined) {
            throw new Error(
              `${name}: an accepted result has no embedded values`,
            )
          }
          compared++
          try {
            const db = dbFromTree(
              fixture.input,
              tree,
              embedded,
              cssSupportsColor,
            )
            if (!isDeepStrictEqual(JSON.parse(JSON.stringify(db)), result.db)) {
              differing.push(name)
            }
          } catch (error) {
            differing.push(`${name}: ${(error as Error).message}`)
          }
        }
        expect(unsupportedWithTree).toEqual([])
        expect(withoutParse).toEqual([])
        expect(differing).toEqual([])
        if (diagram !== "common") expect(compared).toBeGreaterThan(0)
      },
      BUILDS_EVERY_DB,
    )
  }
})
