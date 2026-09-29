/**
 * Parse-result snapshots: what `parse()` gives for each fixture of
 * `@mmd-toolkit/tests`, kept in the fixture's own directory next to its
 * input, `packages/tests/fixtures/<diagram>/<fixture name>/`:
 *
 * - for an input that it accepts, the tree, as
 *   `JSON.stringify(root, null, 2)`, locations included, in `ast.json`;
 * - for an input that it rejects, the `message`, `range`, and `loc` of the
 *   `ParseError`, in `parse-error.json` (`index` is the start of `range`).
 *
 * A fixture whose diagram type the parser does not support yet has neither.
 * A change of any tree or error shows as a change of its file; `vitest -u`
 * writes the files anew. Only this test writes these two files; the other
 * files of a fixture belong to `@mmd-toolkit/tests`.
 */
import { existsSync, readdirSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import type { DiagramType } from "@mmd-toolkit/tests"
import { getFixturesRoot, loadFixtures } from "@mmd-toolkit/tests"
import type { Location, Range, Root } from "../src/index.ts"
import { ParseError, UnsupportedDiagramError, parse } from "../src/index.ts"
import {
  AST_FILE,
  ERROR_FILE,
  fixturesWithBothResultFiles,
} from "./helpers/parse-result-files.ts"

/** The fixture directories whose parse results are kept. */
const diagrams: readonly DiagramType[] = ["common", "flowchart", "sequence"]

/** What `parse()` gives for an input, as it is kept. */
type ParseResult =
  | { readonly kind: "tree"; readonly root: Root }
  | { readonly kind: "error"; readonly error: ParseErrorRecord }
  | { readonly kind: "unsupported" }

/** The record of a `ParseError` in `parse-error.json`. */
interface ParseErrorRecord {
  readonly message: string
  readonly range: Range
  readonly loc: Location
}

/** What `parse()` gives for `input`. */
function resultOf(input: string): ParseResult {
  try {
    return { kind: "tree", root: parse(input) }
  } catch (error) {
    if (error instanceof ParseError) {
      const { message, range, loc } = error
      return { kind: "error", error: { message, range, loc } }
    }
    if (error instanceof UnsupportedDiagramError) return { kind: "unsupported" }
    throw error
  }
}

/** The file that keeps `result`, and its content; null for an unsupported diagram type. */
function snapshotOf(
  result: ParseResult,
): { readonly file: string; readonly content: string } | null {
  switch (result.kind) {
    case "tree":
      return {
        file: AST_FILE,
        content: `${JSON.stringify(result.root, null, 2)}\n`,
      }
    case "error":
      return {
        file: ERROR_FILE,
        content: `${JSON.stringify(result.error, null, 2)}\n`,
      }
    case "unsupported":
      return null
    default:
      throw new Error(
        `unknown parse result ${JSON.stringify(result satisfies never)}`,
      )
  }
}

for (const diagram of diagrams) {
  describe(`parse-result snapshots of the ${diagram} fixtures`, async () => {
    const fixtures = await loadFixtures(diagram)
    const directory = path.join(getFixturesRoot(), diagram)
    const expectedFiles = new Map<string, string>()

    for (const fixture of fixtures) {
      const snapshot = snapshotOf(resultOf(fixture.input))
      if (snapshot === null) continue
      expectedFiles.set(fixture.name, snapshot.file)
      it(fixture.name, async () => {
        await expect(snapshot.content).toMatchFileSnapshot(
          path.join(directory, fixture.name, snapshot.file),
        )
      })
    }

    it("no fixture has both `ast.json` and `parse-error.json`", () => {
      expect(fixturesWithBothResultFiles(directory)).toEqual([])
    })

    it("has no `ast.json` or `parse-error.json` left behind: each fixture has the one file of its result, and a directory without an input has none", () => {
      const leftBehind = readdirSync(directory, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .flatMap((entry) =>
          [AST_FILE, ERROR_FILE]
            .filter((file) =>
              existsSync(path.join(directory, entry.name, file)),
            )
            .filter((file) => expectedFiles.get(entry.name) !== file)
            .map((file) => `${entry.name}/${file}`),
        )
      expect(leftBehind).toEqual([])
    })
  })
}
