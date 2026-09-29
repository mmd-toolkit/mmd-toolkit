import { describe, expect, it } from "vitest"
import { ParseError, UnsupportedDiagramError, parse } from "../../src/index.ts"
import { checkTree } from "../helpers/check-tree.ts"
import { commonSeeds, generateCommonInputs } from "./common-inputs.ts"

describe("common pipeline on generated inputs", () => {
  it.each(commonSeeds)(
    "seed %i: every tree satisfies the invariants of ast.md, and every failure is a known error",
    (seed) => {
      for (const input of generateCommonInputs(seed, 2000)) {
        let root
        try {
          root = parse(input)
        } catch (error) {
          const known =
            error instanceof ParseError ||
            error instanceof UnsupportedDiagramError
          expect(
            known,
            `unexpected ${String(error)} for ${JSON.stringify(input)}`,
          ).toBe(true)
          continue
        }
        checkTree(input, root)
      }
    },
    // As the other tests that run many generated inputs.
    120_000,
  )
})
