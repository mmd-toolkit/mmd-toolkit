// These tests read the build: run `pnpm --filter mmdfmt run build` first, as
// CI's test job runs the build before the tests.
import { execFile } from "node:child_process"
import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { promisify } from "node:util"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { Project } from "./helpers.ts"

const packageDirectory = fileURLToPath(new URL("../", import.meta.url))

let project: Project

beforeEach(() => {
  project = new Project()
})

afterEach(() => {
  project.remove()
})

describe("From a script: the package entry", () => {
  it("exports clearConfigCache, format, and resolveConfig when Node imports the package by its name", async () => {
    // Node resolves `mmdfmt` through the package's own `exports`, from code
    // that runs in the package's directory. The path of the text is in a
    // project outside the repository, so that no configuration of the
    // repository applies.
    const code = `
      import * as mmdfmt from "mmdfmt"
      const result = await mmdfmt.format(
        "# Notes\\n\\n\`\`\`mermaid\\nflowchart LR\\nA-->B\\n\`\`\`\\n",
        { filepath: process.argv[1] },
      )
      const config = await mmdfmt.resolveConfig(process.argv[1])
      console.log(JSON.stringify({ exports: Object.keys(mmdfmt), result, config }))
    `
    const { stdout } = await promisify(execFile)(
      process.execPath,
      ["--input-type=module", "-e", code, path.join(project.cwd, "notes.md")],
      { cwd: packageDirectory },
    )
    expect(JSON.parse(stdout)).toEqual({
      exports: ["clearConfigCache", "format", "resolveConfig"],
      result: "# Notes\n\n```mermaid\nflowchart LR\n  A --> B\n```\n",
      config: null,
    })
  })

  it("names built files as the entry and its declarations", async () => {
    const packageJson = JSON.parse(
      await readFile(path.join(packageDirectory, "package.json"), "utf8"),
    )
    const entry = packageJson.exports["."]
    expect(existsSync(path.join(packageDirectory, entry.default))).toEqual(true)
    expect(existsSync(path.join(packageDirectory, entry.types))).toEqual(true)
  })
})
