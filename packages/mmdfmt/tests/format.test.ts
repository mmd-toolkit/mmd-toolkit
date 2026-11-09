import { existsSync } from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"
import * as prettier from "prettier"
import plugin from "prettier-plugin-mmd"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import type { FormatOptions, ReadOptions } from "../src/index.ts"
import { clearConfigCache, format, resolveConfig } from "../src/index.ts"
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

  it("throws a SyntaxError with no loc.end for an error whose range runs on to the start of a later line", async () => {
    const text = 'C4Context\nRel\n(a, b, "Uses")\n'
    const expected = await thrownBy(
      prettier.format(text, { parser: "mermaid", plugins: [plugin] }),
    )
    expect(expected).toMatchObject({
      class: SyntaxError,
      loc: { start: { line: 2, column: 4 } },
    })
    expect(expected).not.toHaveProperty("loc.end")
    expect(
      await thrownBy(
        format(text, { filepath: path.join(project.cwd, "a.mmd") }),
      ),
    ).toEqual(expected)
  })

  it("throws a SyntaxError with loc.end for an empty range at the start of a line", async () => {
    const text = "flowchart TD\nA-->\n"
    const expected = await thrownBy(
      prettier.format(text, { parser: "mermaid", plugins: [plugin] }),
    )
    expect(expected).toMatchObject({
      class: SyntaxError,
      loc: { start: { line: 3, column: 1 }, end: { line: 3, column: 1 } },
    })
    expect(
      await thrownBy(
        format(text, { filepath: path.join(project.cwd, "a.mmd") }),
      ),
    ).toEqual(expected)
  })

  it.each([
    ["an accepted .mmd diagram", "a.mmd", diagram],
    ["a .mmd diagram that mermaid.js rejects", "a.mmd", "flowchart TD\nA-->\n"],
    ["Markdown with an accepted diagram", "a.md", markdown],
    [
      "Markdown with only a diagram that mermaid.js rejects",
      "a.md",
      "# T\n\n```mermaid\nflowchart TD\nA-->\n```\n",
    ],
    [
      "Markdown with a diagram after a prettier-ignore-start with no end",
      "a.md",
      "<!-- prettier-ignore-start -->\n\n```mermaid\nflowchart TD\nA-->B\n```\n",
    ],
  ])(
    "rejects a value that Prettier refuses for %s with Prettier's error",
    async (_case, file, text) => {
      const expected = await thrownBy(
        prettier.format("", {
          parser: "mermaid",
          plugins: [plugin],
          // @ts-expect-error -- Prettier refuses a string for `printWidth`.
          printWidth: "wide",
        }),
      )
      expect(expected).toMatchObject({
        message:
          'Invalid printWidth value. Expected an integer, but received "wide".',
      })
      expect(
        await thrownBy(
          format(text, {
            filepath: path.join(project.cwd, file),
            // @ts-expect-error -- Prettier refuses a string for `printWidth`.
            printWidth: "wide",
          }),
        ),
      ).toEqual(expected)
    },
  )

  it.each([
    ["no code block", "# T\n\ntext\n"],
    ["only a code block of another language", "```js\nlet a\n```\n"],
    [
      "a mermaid block after <!-- prettier-ignore -->",
      "<!-- prettier-ignore -->\n```mermaid\nflowchart TD\nA-->B\n```\n",
    ],
    [
      "a mermaid block between prettier-ignore-start and prettier-ignore-end",
      "<!-- prettier-ignore-start -->\n\n```mermaid\nflowchart TD\nA-->B\n```\n\n<!-- prettier-ignore-end -->\n",
    ],
    [
      "a mermaid block on the line of a footnote label",
      "Text[^1].\n\n[^1]: ```mermaid\n    flowchart TD\n    A-->B\n    ```\n",
    ],
    [
      "a mermaid block with a tab read partly as the diagram",
      "-  ```mermaid\n\tflowchart TD\n   ```\n",
    ],
  ])(
    "returns Markdown with %s as it is, whatever the options",
    async (_case, text) => {
      expect(
        await format(text, {
          filepath: path.join(project.cwd, "a.md"),
          // @ts-expect-error -- Prettier refuses a string for `printWidth`.
          printWidth: "wide",
        }),
      ).toBe(text)
    },
  )

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
    // The types that the package exports name what the README passes.
    const config: ReadOptions | null = await resolveConfig(filepath)
    const options: FormatOptions = { ...config, filepath }
    expect(await format(diagram, options)).toEqual(
      "flowchart LR\n    A --> B\n",
    )
  })

  it("takes no option but the eight and filepath, and ignores others in JavaScript", async () => {
    const filepath = path.join(project.cwd, "a.mmd")
    expect(
      // @ts-expect-error -- `parser` is not an option of `format`.
      await format(diagram, { filepath, parser: "babel" }),
    ).toEqual("flowchart LR\n  A --> B\n")
    expect(
      // @ts-expect-error -- `plugins` is not an option of `format`.
      await format(diagram, { filepath, plugins: [] }),
    ).toEqual("flowchart LR\n  A --> B\n")
    expect(
      // @ts-expect-error -- `endOfLine` is not an option of `format`.
      await format(diagram, { filepath, endOfLine: "crlf" }),
    ).toEqual("flowchart LR\n  A --> B\n")
    expect(
      // @ts-expect-error -- `rangeStart` is not an option of `format`.
      await format(diagram, { filepath, rangeStart: 1 }),
    ).toEqual("flowchart LR\n  A --> B\n")
    expect(
      // @ts-expect-error -- `rangeEnd` is not an option of `format`.
      await format(diagram, { filepath, rangeEnd: 1 }),
    ).toEqual("flowchart LR\n  A --> B\n")
    expect(
      // @ts-expect-error -- `semi` is not an option of `format`.
      await format(diagram, { filepath, semi: false }),
    ).toEqual("flowchart LR\n  A --> B\n")
  })
})

describe("From a script: resolveConfig", () => {
  it("reads the indentation and the line width from .editorconfig by default", async () => {
    project.write({
      ".editorconfig":
        "[*]\nindent_style = space\nindent_size = 4\nmax_line_length = 100\n",
    })
    expect(await resolveConfig(path.join(project.cwd, "a.mmd"))).toStrictEqual({
      printWidth: 100,
      tabWidth: 4,
      useTabs: false,
    })
  })

  it("returns only the options of the eight that the configuration sets", async () => {
    project.write({
      ".prettierrc.json": JSON.stringify({
        tabWidth: 3,
        singleQuote: true,
        semi: false,
        parser: "babel",
        plugins: [],
        endOfLine: "crlf",
        rangeStart: 0,
        rangeEnd: 1,
      }),
    })
    expect(await resolveConfig(path.join(project.cwd, "a.mmd"))).toStrictEqual({
      tabWidth: 3,
      singleQuote: true,
    })
  })

  it("keeps a default that the caller spreads before the configuration", async () => {
    project.write({ ".prettierrc.json": '{ "singleQuote": true }' })
    const filepath = path.join(project.cwd, "a.mmd")
    const options = {
      tabWidth: 4,
      ...(await resolveConfig(filepath)),
      filepath,
    }
    expect(options).toStrictEqual({ tabWidth: 4, singleQuote: true, filepath })
    expect(await format(diagram, options)).toEqual(
      "flowchart LR\n    A --> B\n",
    )
  })

  it("formats the whole diagram when the configuration sets rangeStart and rangeEnd", async () => {
    project.write({
      ".prettierrc.json": '{ "rangeStart": 0, "rangeEnd": 1 }',
    })
    expect(await project.run(["--stdin-filepath", "a.mmd"], diagram)).toEqual({
      code: 0,
      stdout: "flowchart LR\n  A --> B\n",
      stderr: "",
    })
  })

  it("applies the override for a .mmd path", async () => {
    project.write({
      ".prettierrc.json":
        '{ "overrides": [{ "files": "*.mmd", "options": { "tabWidth": 4 } }, { "files": "*.md", "options": { "tabWidth": 6 } }] }',
    })
    expect(await resolveConfig(path.join(project.cwd, "a.mmd"))).toStrictEqual({
      tabWidth: 4,
    })
  })

  it("applies the override for a .md path", async () => {
    project.write({
      ".prettierrc.json":
        '{ "overrides": [{ "files": "*.mmd", "options": { "tabWidth": 4 } }, { "files": "*.md", "options": { "tabWidth": 6 } }] }',
    })
    expect(await resolveConfig(path.join(project.cwd, "a.md"))).toStrictEqual({
      tabWidth: 6,
    })
  })

  it("returns null when no configuration applies", async () => {
    expect(await resolveConfig(path.join(project.cwd, "a.mmd"))).toStrictEqual(
      null,
    )
  })

  it("takes no options, and reads .editorconfig as the command does", async () => {
    project.write({
      ".editorconfig":
        "[*]\nindent_style = space\nindent_size = 4\nmax_line_length = 100\n",
    })
    const filepath = path.join(project.cwd, "a.mmd")
    // @ts-expect-error -- resolveConfig takes no options.
    const config = await resolveConfig(filepath, { editorconfig: false })
    expect(config).toStrictEqual({
      printWidth: 100,
      tabWidth: 4,
      useTabs: false,
    })
    expect(await resolveConfig(filepath)).toStrictEqual(config)
  })

  it("resolves a file URL the same way as its path", async () => {
    project.write({ ".prettierrc.json": '{ "tabWidth": 3, "semi": false }' })
    const filepath = path.join(project.cwd, "a.mmd")
    const config = await resolveConfig(filepath)
    expect(config).toStrictEqual({
      tabWidth: 3,
    })
    expect(await resolveConfig(pathToFileURL(filepath))).toStrictEqual(config)
  })

  it("formats a Markdown list diagram as the command does with the resolved configuration", async () => {
    project.write({
      ".editorconfig": "[*]\nindent_size = 4\nmax_line_length = 37\n",
      ".prettierrc.json":
        '{ "overrides": [{ "files": "*.md", "options": { "useTabs": true } }] }',
    })
    const source = lines(
      "- item",
      "",
      "  ```mermaid",
      "  flowchart LR",
      "    A@{ shape: rect, label: x, icon: y }",
      "  ```",
    )
    const filepath = path.join(project.cwd, "a.md")
    expect(await resolveConfig(filepath)).toStrictEqual({
      printWidth: 37,
      tabWidth: 4,
      useTabs: true,
    })
    const result = await project.run(["--stdin-filepath", "a.md"], source)
    expect(result).toEqual({
      code: 0,
      stdout: lines(
        "- item",
        "",
        "  ```mermaid",
        "  flowchart LR",
        "  \tA@{ shape: rect, label: x, icon: y }",
        "  ```",
      ),
      stderr: "",
    })
    expect(
      await format(source, { ...(await resolveConfig(filepath)), filepath }),
    ).toEqual(result.stdout)
  })

  it("formats a .mmd diagram as the command does with the resolved configuration", async () => {
    project.write({
      ".editorconfig": "[*]\nindent_size = 4\nmax_line_length = 37\n",
      ".prettierrc.json":
        '{ "overrides": [{ "files": "*.md", "options": { "useTabs": true } }] }',
    })
    const source = "flowchart LR\n  A@{ shape: rect, label: x, icon: y }\n"
    const filepath = path.join(project.cwd, "a.mmd")
    expect(await resolveConfig(filepath)).toStrictEqual({
      printWidth: 37,
      tabWidth: 4,
    })
    const result = await project.run(["--stdin-filepath", "a.mmd"], source)
    expect(result).toEqual({
      code: 0,
      stdout:
        "flowchart LR\n    A@{\n        shape: rect\n        label: x\n        icon: y\n    }\n",
      stderr: "",
    })
    expect(
      await format(source, { ...(await resolveConfig(filepath)), filepath }),
    ).toEqual(result.stdout)
  })

  it("applies singleQuote to frontmatter as the command does with the resolved configuration", async () => {
    project.write({ ".prettierrc.json": '{ "singleQuote": true }' })
    const source = '---\ntitle: "T"\n---\nflowchart LR\nA-->B\n'
    const filepath = path.join(project.cwd, "a.mmd")
    const result = await project.run(["--stdin-filepath", "a.mmd"], source)
    expect(result).toEqual({
      code: 0,
      stdout: "---\ntitle: 'T'\n---\nflowchart LR\n  A --> B\n",
      stderr: "",
    })
    expect(
      await format(source, { ...(await resolveConfig(filepath)), filepath }),
    ).toEqual(result.stdout)
  })

  it("leaves frontmatter as written as the command does with embeddedLanguageFormatting off", async () => {
    project.write({
      ".prettierrc.json": '{ "embeddedLanguageFormatting": "off" }',
    })
    const source = '---\ntitle:   "T"\n---\nflowchart LR\nA-->B\n'
    const filepath = path.join(project.cwd, "a.mmd")
    const result = await project.run(["--stdin-filepath", "a.mmd"], source)
    expect(result).toEqual({
      code: 0,
      stdout: '---\ntitle:   "T"\n---\nflowchart LR\n  A --> B\n',
      stderr: "",
    })
    expect(
      await format(source, { ...(await resolveConfig(filepath)), filepath }),
    ).toEqual(result.stdout)
  })
})

describe("From a script: clearConfigCache", () => {
  it("reads a changed configuration after clearing the cache", async () => {
    // Prettier's cache is shared by every test in the process, so clear it
    // first to avoid depending on what other tests have read.
    await clearConfigCache()
    const filepath = path.join(project.cwd, "a.mmd")
    project.write({ ".prettierrc.json": '{ "tabWidth": 3 }' })
    expect(await resolveConfig(filepath)).toStrictEqual({
      tabWidth: 3,
    })

    project.write({ ".prettierrc.json": '{ "tabWidth": 5 }' })
    expect(await resolveConfig(filepath)).toStrictEqual({
      tabWidth: 3,
    })

    expect(await clearConfigCache()).toEqual(undefined)
    expect(await resolveConfig(filepath)).toStrictEqual({
      tabWidth: 5,
    })
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
    expect(
      await format(wideDiagram, {
        ...(await resolveConfig(filepath)),
        filepath,
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
