import { describe, expect, it } from "vitest"
import { printWidthAfter } from "../src/diagram.ts"
import type { ReadOptions } from "../src/options.ts"

/** A configuration with only a line width and a tab width set. */
function options(
  printWidth: number | undefined,
  tabWidth: number | undefined = undefined,
): ReadOptions {
  return { printWidth, tabWidth }
}

describe("Code blocks in detail: the line width left after the prefix of a line", () => {
  it("leaves the line width as it is where nothing stands before the lines", async () => {
    expect(await printWidthAfter("", options(40))).toBe(40)
    expect(await printWidthAfter("", options(undefined))).toBeUndefined()
  })

  it("gives the line width as it is where Prettier refuses the line width or the tab width", async () => {
    const refusedWidth = { printWidth: "wide" } as unknown as ReadOptions
    expect(await printWidthAfter("  ", refusedWidth)).toBe("wide")
    const fractionalWidth = options(79.5)
    expect(await printWidthAfter("  ", fractionalWidth)).toBe(79.5)
    const refusedTab = {
      printWidth: 40,
      tabWidth: "x",
    } as unknown as ReadOptions
    expect(await printWidthAfter("\t", refusedTab)).toBe(40)
  })

  it("takes the width of the prefix off", async () => {
    expect(await printWidthAfter("  ", options(40))).toBe(38)
    expect(await printWidthAfter("> ", options(40))).toBe(38)
  })

  it("takes it off Prettier's default of 80 where the configuration sets no width", async () => {
    expect(await printWidthAfter("    ", options(undefined))).toBe(76)
  })

  it("counts a tab as reaching the next multiple of tabWidth, which is 2 where the configuration sets none", async () => {
    expect(await printWidthAfter("\t", options(40, 4))).toBe(36)
    expect(await printWidthAfter("\t", options(40))).toBe(38)
    expect(await printWidthAfter("\t\t", options(40, 4))).toBe(32)
  })

  it("counts the characters before a tab as part of the column the tab starts from", async () => {
    expect(await printWidthAfter(">\t", options(40, 4))).toBe(36)
    expect(await printWidthAfter("   \t", options(40, 4))).toBe(36)
    expect(await printWidthAfter("    \t", options(40, 4))).toBe(32)
    expect(await printWidthAfter("> \t", options(40, 3))).toBe(37)
    expect(await printWidthAfter(">\t", options(40, 2))).toBe(38)
    expect(await printWidthAfter(">\t", options(40, 8))).toBe(32)
  })

  it("counts a tab as no column where tabWidth is 0", async () => {
    expect(await printWidthAfter("\t", options(40, 0))).toBe(40)
    expect(await printWidthAfter(">\t", options(40, 0))).toBe(39)
    expect(await printWidthAfter("  \t- \t", options(40, 0))).toBe(36)
  })

  it("leaves at least 1", async () => {
    expect(await printWidthAfter("          ", options(5))).toBe(1)
  })

  it("leaves an infinite width infinite", async () => {
    expect(await printWidthAfter("  ", options(Infinity))).toBe(Infinity)
  })
})
