import { existsSync } from "node:fs"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { format } from "../src/index.ts"
import { Project, lines } from "./helpers.ts"

let project: Project

beforeEach(() => {
  project = new Project()
})

afterEach(() => {
  project.remove()
})

const diagram = "flowchart LR\nA-->B\n"
const markdown = "# T\n\n```mermaid\nflowchart LR\nA-->B\n```\n"

describe("From a script: formatting text", () => {
  it("formats Markdown at a path that does not exist without creating a file", async () => {
    const filepath = path.join(project.cwd, "docs/notes.md")
    expect(await format(markdown, { filepath })).toEqual({
      text: "# T\n\n```mermaid\nflowchart LR\n  A --> B\n```\n",
      diagnostics: [],
    })
    expect(existsSync(filepath)).toEqual(false)
  })

  it("formats a diagram", async () => {
    expect(
      await format(diagram, { filepath: path.join(project.cwd, "a.mmd") }),
    ).toEqual({
      text: "flowchart LR\n  A --> B\n",
      diagnostics: [],
    })
  })

  it("returns a rejected diagram unchanged with an error", async () => {
    expect(
      await format("flowchart LR\nA-->B)\n", {
        filepath: path.join(project.cwd, "a.mmd"),
      }),
    ).toEqual({
      text: "flowchart LR\nA-->B)\n",
      diagnostics: [
        {
          severity: "error",
          message: "Unexpected character",
          position: { line: 2, column: 6 },
        },
      ],
    })
  })

  it("gives a warning its position in the returned text after earlier diagrams gain lines", async () => {
    const input = lines(
      "> ```mermaid",
      "> flowchart LR",
      "> A-->B; B-->C; C-->D",
      "> ```",
      "",
      "> ```mermaid",
      "> flowchart LR",
      "> A-->",
      "> ```",
      "",
      "> ```mermaid",
      "> flowchart LR",
      "> A-->B; B-->C",
      "> ```",
    )
    expect(
      await format(input, { filepath: path.join(project.cwd, "b.md") }),
    ).toEqual({
      text: lines(
        "> ```mermaid",
        "> flowchart LR",
        ">   A --> B",
        ">   B --> C",
        ">   C --> D",
        "> ```",
        "",
        "> ```mermaid",
        "> flowchart LR",
        "> A-->",
        "> ```",
        "",
        "> ```mermaid",
        "> flowchart LR",
        ">   A --> B",
        ">   B --> C",
        "> ```",
      ),
      diagnostics: [
        {
          severity: "warning",
          message: "Unexpected end of text",
          position: { line: 11, column: 1 },
        },
      ],
    })
  })

  it("uses the given text and leaves an existing file unchanged", async () => {
    project.write({ "a.md": "other content\n" })
    expect(
      await format(markdown, { filepath: path.join(project.cwd, "a.md") }),
    ).toEqual({
      text: "# T\n\n```mermaid\nflowchart LR\n  A --> B\n```\n",
      diagnostics: [],
    })
    expect(project.read("a.md")).toEqual("other content\n")
  })
})

describe("From a script: the configuration of the path's directory", () => {
  it("uses four spaces from .editorconfig", async () => {
    project.write({
      ".editorconfig":
        "root = true\n\n[*]\nindent_style = space\nindent_size = 4\n",
    })
    expect(
      await format(diagram, { filepath: path.join(project.cwd, "a.mmd") }),
    ).toEqual({
      text: "flowchart LR\n    A --> B\n",
      diagnostics: [],
    })
  })

  it("uses three spaces from a Prettier configuration", async () => {
    project.write({ ".prettierrc.json": '{ "tabWidth": 3 }' })
    expect(
      await format(diagram, { filepath: path.join(project.cwd, "a.mmd") }),
    ).toEqual({
      text: "flowchart LR\n   A --> B\n",
      diagnostics: [],
    })
  })

  it("resolves a relative path against the current directory", async () => {
    project.write({
      ".editorconfig":
        "root = true\n\n[*]\nindent_style = space\nindent_size = 4\n",
    })
    const filepath = path.relative(
      process.cwd(),
      path.join(project.cwd, "a.mmd"),
    )
    expect(await format(diagram, { filepath })).toEqual({
      text: "flowchart LR\n    A --> B\n",
      diagnostics: [],
    })
  })
})

describe("From a script: selecting paths", () => {
  it("rejects a path with another ending", async () => {
    await expect(format(diagram, { filepath: "a.txt" })).rejects.toEqual(
      new Error(
        'the path does not end in .md, .markdown, .mmd, or .mermaid: "a.txt"',
      ),
    )
  })

  it("formats a path under node_modules", async () => {
    expect(
      await format(diagram, {
        filepath: path.join(project.cwd, "node_modules/pkg/a.mmd"),
      }),
    ).toEqual({
      text: "flowchart LR\n  A --> B\n",
      diagnostics: [],
    })
  })

  it("formats a path listed in .gitignore", async () => {
    project.write({ ".gitignore": "ignored.mmd\n" })
    expect(
      await format(diagram, {
        filepath: path.join(project.cwd, "ignored.mmd"),
      }),
    ).toEqual({
      text: "flowchart LR\n  A --> B\n",
      diagnostics: [],
    })
  })
})
