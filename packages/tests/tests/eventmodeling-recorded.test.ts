import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import type { TreeRoot } from "../src/db-from-tree/tree.ts"
import { dbFromTree } from "../src/db-from-tree/index.ts"
import type { DbTreeRoot } from "../src/db-from-tree/index.ts"
import {
  cssSupportsColor,
  embeddedValuesOf,
  fixtureAccepts,
  getFixturesRoot,
  loadFixtures,
} from "../src/index.ts"

describe("eventmodeling recorded results", () => {
  for (const diagram of ["eventmodeling", "common"] as const)
    it(`checks result kinds and comparison Dbs in ${diagram}`, async () => {
      let checked = 0
      const problems: string[] = []
      for (const fixture of await loadFixtures(diagram)) {
        const result = fixture.specified ?? fixture.expected
        if (
          diagram === "common" &&
          (!result.accepted || result.diagramType !== "eventmodeling")
        )
          continue
        const directory = path.join(getFixturesRoot(), diagram, fixture.name)
        const ast = path.join(directory, "ast.json")
        const error = path.join(directory, "parse-error.json")
        const accepts = fixtureAccepts(fixture)
        if (existsSync(ast) !== accepts || existsSync(error) === accepts) {
          problems.push(
            `${fixture.name}: result records disagree with fixtureAccepts; input ${JSON.stringify(fixture.input)}`,
          )
          continue
        }
        if (!accepts) continue
        const tree = JSON.parse(readFileSync(ast, "utf8")) as TreeRoot
        checked++
        if (!result.accepted || result.db === null) continue
        const embedded = embeddedValuesOf(fixture, result)
        if (embedded === undefined)
          throw new Error(`${fixture.name}: no embedded values`)
        expect(
          dbFromTree(
            fixture.input,
            tree as unknown as DbTreeRoot,
            embedded,
            cssSupportsColor,
          ),
          fixture.name,
        ).toEqual(result.db)
      }
      expect(problems).toEqual([])
      expect(checked).toBeGreaterThan(0)
    })
})
