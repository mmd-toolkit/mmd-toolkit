import { describe, expect, it } from "vitest"
import { dbFromTree } from "../src/db-from-tree/index.ts"
import type { DbTreeRoot } from "../src/db-from-tree/index.ts"
import { cssSupportsColor } from "../src/index.ts"
import { buildInfo, common } from "./statement-tree-built.ts"

describe("info Db from hand-built trees", () => {
  it("publishes no values from the flag, common forms or embedded data", () => {
    const { source, tree } = buildInfo(
      "info showInfo\ntitle T\naccTitle: A\naccDescr: D\naccDescr { B }\ntitle\n",
      (kit) => [
        common(kit, "Info", "Title", "T"),
        common(kit, "Info", "AccTitle", " A"),
        common(kit, "Info", "AccDescr", " D"),
        common(kit, "Info", "AccDescrBlock", "B"),
        common(kit, "Info", "Title", null),
      ],
      true,
    )
    expect(
      dbFromTree(
        source,
        tree as unknown as DbTreeRoot,
        {
          config: { securityLevel: "other" },
          title: "Front",
          dataBlockEffects: [],
        },
        cssSupportsColor,
      ),
    ).toEqual({})
  })
  it("publishes an empty summary from the header alone", () => {
    const { source, tree } = buildInfo("info", () => [])
    expect(
      dbFromTree(
        source,
        tree as unknown as DbTreeRoot,
        { config: {}, title: undefined, dataBlockEffects: [] },
        cssSupportsColor,
      ),
    ).toEqual({})
  })
})
