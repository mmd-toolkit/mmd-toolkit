import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import type { CheckedRoot } from "../src/check-tree/types.ts"
import { dbFromTree } from "../src/db-from-tree/index.ts"
import type { DbTreeRoot } from "../src/db-from-tree/index.ts"
import {
  cssSupportsColor,
  embeddedValuesOf,
  fixtureAccepts,
  getFixturesRoot,
  loadFixtures,
} from "../src/index.ts"

describe("treeview recorded results", () => {
  for (const diagram of ["treeview", "common"] as const)
    it(`checks every result kind, tree condition and comparison Db in ${diagram}`, async () => {
      const problems: string[] = []
      let checked = 0
      let compared = 0
      const withoutComparison: string[] = []
      for (const fixture of await loadFixtures(diagram)) {
        const result = fixture.specified ?? fixture.expected
        const directory = path.join(getFixturesRoot(), diagram, fixture.name)
        const ast = path.join(directory, "ast.json")
        const error = path.join(directory, "parse-error.json")
        const tree = existsSync(ast)
          ? (JSON.parse(readFileSync(ast, "utf8")) as CheckedRoot)
          : undefined
        if (
          diagram === "common" &&
          !(
            fixture.expected.accepted &&
            fixture.expected.diagramType === "treeView"
          ) &&
          !(result.accepted && result.diagramType === "treeView") &&
          tree?.diagramType !== "treeView"
        )
          continue
        const name = `${diagram}/${fixture.name}`
        const accepts = fixtureAccepts(fixture)
        if (existsSync(ast) !== accepts || existsSync(error) === accepts) {
          problems.push(
            `${name}: result records disagree with fixtureAccepts; input ${JSON.stringify(fixture.input)}`,
          )
          continue
        }
        if (!accepts || tree === undefined) continue
        checked++
        for (const problem of checkTree(fixture.input, tree))
          problems.push(
            `${name}: ${problem.where}: ${problem.message}; input ${JSON.stringify(fixture.input)}`,
          )
        if (!result.accepted || result.db === null) {
          withoutComparison.push(name)
          continue
        }
        const embedded = embeddedValuesOf(fixture, result)
        if (embedded === undefined)
          throw new Error(`${name}: no embedded values`)
        compared++
        expect(
          dbFromTree(
            fixture.input,
            tree as unknown as DbTreeRoot,
            embedded,
            cssSupportsColor,
          ),
          `${name}; input ${JSON.stringify(fixture.input)}`,
        ).toEqual(result.db)
      }
      expect(problems).toEqual([])
      expect(checked).toBeGreaterThan(0)
      expect(compared).toBeGreaterThan(0)
      // Opaque fixtures keep their valid neighboring configuration/title,
      // so the current corpus gives every accepted tree a comparison Db.
      expect(withoutComparison).toEqual([])
    }, 60_000)
})
