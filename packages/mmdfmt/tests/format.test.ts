import { existsSync } from "node:fs"
import path from "node:path"
import * as prettier from "prettier"
import { resolveConfig } from "prettier"
import plugin from "prettier-plugin-mmd"
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

/**
 * What a promise rejects with: the class and the message of the error, and its
 * own fields, such as the `loc` and the `codeFrame` of Prettier's errors.
 */
async function thrownBy(promise: Promise<unknown>): Promise<object> {
  try {
    await promise
  } catch (error) {
    if (!(error instanceof Error)) throw error
    return { ...error, class: error.constructor, message: error.message }
  }
  throw new Error("the promise was not rejected")
}

describe("From a script: formatting text", () => {
  it("formats Markdown at a path that does not exist without creating a file", async () => {
    const filepath = path.join(project.cwd, "docs/notes.md")
    expect(await format(markdown, { filepath })).toEqual(
      "# T\n\n```mermaid\nflowchart LR\n  A --> B\n```\n",
    )
    expect(existsSync(filepath)).toEqual(false)
  })

  it("formats a diagram", async () => {
    expect(
      await format(diagram, { filepath: path.join(project.cwd, "a.mmd") }),
    ).toEqual("flowchart LR\n  A --> B\n")
  })

  it("throws the SyntaxError that Prettier throws for a rejected diagram", async () => {
    const text = "flowchart LR\nA-->B)\n"
    const expected = await thrownBy(
      prettier.format(text, { parser: "mermaid", plugins: [plugin] }),
    )
    expect(expected).toMatchObject({
      class: SyntaxError,
      loc: { start: { line: 2, column: 6 }, end: { line: 2, column: 7 } },
    })
    expect(
      await thrownBy(
        format(text, { filepath: path.join(project.cwd, "a.mmd") }),
      ),
    ).toEqual(expected)
  })

  it("leaves a rejected diagram as written after formatting an earlier one", async () => {
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
    ).toEqual(
      lines(
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
    )
  })

  it("leaves a block as written when a tab is read partly as indentation", async () => {
    const text = lines("> ```mermaid", "> flowchart LR", ">\tA-->B", "> ```")
    expect(
      await format(text, { filepath: path.join(project.cwd, "a.md") }),
    ).toEqual(text)
  })

  it("uses the given text and leaves an existing file unchanged", async () => {
    project.write({ "a.md": "other content\n" })
    expect(
      await format(markdown, { filepath: path.join(project.cwd, "a.md") }),
    ).toEqual("# T\n\n```mermaid\nflowchart LR\n  A --> B\n```\n")
    expect(project.read("a.md")).toEqual("other content\n")
  })

  it("keeps a byte order mark and CRLF line endings", async () => {
    expect(
      await format("\uFEFFflowchart LR\r\nA-->B\r\n", {
        filepath: path.join(project.cwd, "a.mmd"),
      }),
    ).toEqual("\uFEFFflowchart LR\r\n  A --> B\r\n")
  })
})

describe("From a script: indentation and configuration", () => {
  it("uses four spaces with tabWidth: 4", async () => {
    expect(
      await format(diagram, {
        filepath: path.join(project.cwd, "a.mmd"),
        tabWidth: 4,
      }),
    ).toEqual("flowchart LR\n    A --> B\n")
  })

  it("uses a tab with useTabs: true", async () => {
    expect(
      await format(diagram, {
        filepath: path.join(project.cwd, "a.mmd"),
        useTabs: true,
      }),
    ).toEqual("flowchart LR\n\tA --> B\n")
  })

  it("reads neither .editorconfig nor a Prettier configuration", async () => {
    project.write({
      ".editorconfig":
        "root = true\n\n[*]\nindent_style = space\nindent_size = 4\n",
      ".prettierrc.json": '{ "tabWidth": 3 }',
    })
    expect(
      await format(diagram, { filepath: path.join(project.cwd, "a.mmd") }),
    ).toEqual("flowchart LR\n  A --> B\n")
  })

  it("uses configuration resolved by the caller as in the README", async () => {
    project.write({
      ".editorconfig":
        "root = true\n\n[*]\nindent_style = space\nindent_size = 4\n",
    })
    const filepath = path.join(project.cwd, "a.mmd")
    const config = await resolveConfig(filepath, { editorconfig: true })
    expect(
      await format(diagram, {
        filepath,
        tabWidth: config?.tabWidth,
        useTabs: config?.useTabs,
        printWidth: config?.printWidth,
      }),
    ).toEqual("flowchart LR\n    A --> B\n")
  })

  it("takes no other option of Prettier, and keeps the line endings of the text", async () => {
    const filepath = path.join(project.cwd, "a.mmd")
    expect(
      // @ts-expect-error -- `semi` is not an option of `format`.
      await format(diagram, { filepath, semi: false }),
    ).toEqual("flowchart LR\n  A --> B\n")
    expect(
      // @ts-expect-error -- `endOfLine` is not an option of `format`.
      await format(diagram, { filepath, endOfLine: "crlf" }),
    ).toEqual("flowchart LR\n  A --> B\n")
  })
})

describe("From a script: the line width", () => {
  const wideDiagram = "flowchart LR\n  A@{ shape: rect, label: x, icon: y }\n"
  const listDiagram = lines(
    "- item",
    "",
    "  ```mermaid",
    "  flowchart LR",
    "    A@{ shape: rect, label: x, icon: y }",
    "  ```",
  )

  it("keeps a data block on one line at printWidth: 38", async () => {
    const result = await format(wideDiagram, {
      filepath: path.join(project.cwd, "a.mmd"),
      printWidth: 38,
    })
    expect(result).toEqual(
      await prettier.format(wideDiagram, {
        parser: "mermaid",
        plugins: [plugin],
        printWidth: 38,
      }),
    )
    expect(result).toEqual(
      "flowchart LR\n  A@{ shape: rect, label: x, icon: y }\n",
    )
  })

  it("splits a data block at printWidth: 37", async () => {
    const result = await format(wideDiagram, {
      filepath: path.join(project.cwd, "a.mmd"),
      printWidth: 37,
    })
    expect(result).toEqual(
      await prettier.format(wideDiagram, {
        parser: "mermaid",
        plugins: [plugin],
        printWidth: 37,
      }),
    )
    expect(result).toEqual(
      "flowchart LR\n  A@{\n    shape: rect\n    label: x\n    icon: y\n  }\n",
    )
  })

  it("keeps a data block in a list item on one line at printWidth: 40", async () => {
    const result = await format(listDiagram, {
      filepath: path.join(project.cwd, "a.md"),
      printWidth: 40,
    })
    expect(result).toEqual(
      await prettier.format(listDiagram, {
        parser: "markdown",
        plugins: [plugin],
        printWidth: 40,
      }),
    )
    expect(result).toEqual(
      lines(
        "- item",
        "",
        "  ```mermaid",
        "  flowchart LR",
        "    A@{ shape: rect, label: x, icon: y }",
        "  ```",
      ),
    )
  })

  it("splits a data block in a list item at printWidth: 39", async () => {
    const result = await format(listDiagram, {
      filepath: path.join(project.cwd, "a.md"),
      printWidth: 39,
    })
    expect(result).toEqual(
      await prettier.format(listDiagram, {
        parser: "markdown",
        plugins: [plugin],
        printWidth: 39,
      }),
    )
    expect(result).toEqual(
      lines(
        "- item",
        "",
        "  ```mermaid",
        "  flowchart LR",
        "    A@{",
        "      shape: rect",
        "      label: x",
        "      icon: y",
        "    }",
        "  ```",
      ),
    )
  })

  it("uses the line width resolved from .editorconfig as in the README", async () => {
    project.write({
      ".editorconfig": "root = true\n\n[*.mmd]\nmax_line_length = 37\n",
    })
    const filepath = path.join(project.cwd, "a.mmd")
    const config = await resolveConfig(filepath, { editorconfig: true })
    expect(config?.printWidth).toEqual(37)
    expect(
      await format(wideDiagram, {
        filepath,
        tabWidth: config?.tabWidth,
        useTabs: config?.useTabs,
        printWidth: config?.printWidth,
      }),
    ).toEqual(
      "flowchart LR\n  A@{\n    shape: rect\n    label: x\n    icon: y\n  }\n",
    )
  })

  it("keeps a data block on one line at printWidth: Infinity", async () => {
    expect(
      await format(wideDiagram, {
        filepath: path.join(project.cwd, "a.mmd"),
        printWidth: Infinity,
      }),
    ).toEqual("flowchart LR\n  A@{ shape: rect, label: x, icon: y }\n")
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
    ).toEqual("flowchart LR\n  A --> B\n")
  })

  it("formats a path under a directory of version control", async () => {
    expect(
      await format(diagram, {
        filepath: path.join(project.cwd, ".git/a.mmd"),
      }),
    ).toEqual("flowchart LR\n  A --> B\n")
  })

  it("formats a path listed in .gitignore", async () => {
    project.write({ ".gitignore": "ignored.mmd\n" })
    expect(
      await format(diagram, {
        filepath: path.join(project.cwd, "ignored.mmd"),
      }),
    ).toEqual("flowchart LR\n  A --> B\n")
  })
})
