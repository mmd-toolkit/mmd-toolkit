import { chmodSync } from "node:fs"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import packageJson from "../package.json" with { type: "json" }
import { ignoreBrokenPipe } from "../src/broken-pipe.ts"
import { Project, lines, listed } from "./helpers.ts"

let project: Project

beforeEach(() => {
  project = new Project()
})

afterEach(() => {
  project.remove()
})

const diagram = "flowchart LR\nA-->B\n"
const formattedDiagram = "flowchart LR\n  A --> B\n"
const markdown = "# T\n\n```mermaid\nflowchart LR\nA-->B\n```\n"
const formattedMarkdown = "# T\n\n```mermaid\nflowchart LR\n  A --> B\n```\n"
/** The width of the line of the node below, which stays on it at this width. */
const blockWidth = 38
/** A node with a data block on one line, which the plugin splits into lines where the line is wider than printWidth. */
const block = "flowchart LR\n  A@{ shape: rect, label: x, icon: y }\n"
const blockOnLines =
  "flowchart LR\n  A@{\n    shape: rect\n    label: x\n    icon: y\n  }\n"

/** The message for a pattern that selects no file to format. */
function noFileMatches(pattern: string): string {
  return `mmdfmt: error: no file ending in .md, .markdown, .mmd, or .mermaid matches ${JSON.stringify(pattern)}\n`
}

/**
 * The texts that the tool gives gunshi for the usage: the description of each
 * argument and each example (src/main.ts). The tests look for them rather than
 * compare the usage, whose layout gunshi decides.
 */
const usageTexts = [
  "Rewrite the files that change, and list them",
  "List the files that --write would change",
  "Format standard input as the file at this path, and write the result to standard output",
  "The files, directories, or globs of the files to format",
  'mmdfmt --write "**/*.{md,mmd,mermaid}"',
  'mmdfmt --check "**/*.{md,mmd,mermaid}"',
  "mmdfmt --stdin-filepath diagram.mmd < diagram.mmd",
]

/** Expects `text` to show the usage. */
function expectUsage(text: string): void {
  for (const usageText of usageTexts) {
    expect(text).toContain(usageText)
  }
  // The line of the option, which gunshi names in kebab case (`toKebab`); an
  // example names the option too, but without the `<` of its value.
  expect(text).toContain("--stdin-filepath <")
}

describe("Usage: --write and --check", () => {
  beforeEach(() => {
    project.write({
      "a.mmd": diagram,
      "b.md": markdown,
      "c.mmd": formattedDiagram,
    })
  })

  it("--write rewrites the files that change, and lists them", async () => {
    expect(await project.run(["--write", "*.mmd", "*.md"])).toEqual({
      code: 0,
      stdout: listed("a.mmd", "b.md"),
      stderr: "",
    })
    expect(project.read("a.mmd")).toBe(formattedDiagram)
    expect(project.read("b.md")).toBe(formattedMarkdown)
    expect(project.read("c.mmd")).toBe(formattedDiagram)
  })

  it("reads --write=false as --write", async () => {
    expect(await project.run(["--write=false", "a.mmd"])).toEqual({
      code: 0,
      stdout: listed("a.mmd"),
      stderr: "",
    })
    expect(project.read("a.mmd")).toBe(formattedDiagram)
  })

  it("--check changes nothing, lists the files that --write would change, and exits with 1", async () => {
    expect(await project.run(["--check", "*.mmd", "*.md"])).toEqual({
      code: 1,
      stdout: listed("a.mmd", "b.md"),
      stderr: "",
    })
    expect(project.read("a.mmd")).toBe(diagram)
    expect(project.read("b.md")).toBe(markdown)
  })

  it("--check exits with 0 when every file is formatted", async () => {
    expect(await project.run(["--check", "c.mmd"])).toEqual({
      code: 0,
      stdout: "",
      stderr: "",
    })
  })
})

describe("From an editor or another tool: --stdin-filepath", () => {
  it("formats standard input as Markdown or as a diagram, by the path", async () => {
    expect(await project.run(["--stdin-filepath", "doc.md"], markdown)).toEqual(
      { code: 0, stdout: formattedMarkdown, stderr: "" },
    )
    expect(
      await project.run(["--stdin-filepath", "doc.mermaid"], diagram),
    ).toEqual({ code: 0, stdout: formattedDiagram, stderr: "" })
  })

  it("takes the Prettier configuration that applies to the path", async () => {
    project.write({
      ".prettierrc": JSON.stringify({
        overrides: [{ files: "docs/**", options: { tabWidth: 4 } }],
      }),
    })
    expect(
      await project.run(["--stdin-filepath", "docs/a.mmd"], diagram),
    ).toEqual({ code: 0, stdout: "flowchart LR\n    A --> B\n", stderr: "" })
  })

  it("writes back the input of a path that the patterns would skip", async () => {
    project.write({ ".gitignore": "gen/\n" })
    expect(
      await project.run(["--stdin-filepath", "gen/doc.md"], markdown),
    ).toEqual({ code: 0, stdout: markdown, stderr: "" })
    expect(
      await project.run(["--stdin-filepath", "node_modules/x/a.mmd"], diagram),
    ).toEqual({ code: 0, stdout: diagram, stderr: "" })
  })

  it("does not read .prettierignore for standard input", async () => {
    project.write({ ".prettierignore": "*.md\n", "notes.md": markdown })
    expect(
      await project.run(["--stdin-filepath", "notes.md"], markdown),
    ).toEqual({ code: 0, stdout: formattedMarkdown, stderr: "" })
    expect(project.read("notes.md")).toBe(markdown)
  })

  it("writes back standard input whose path .gitignore lists", async () => {
    project.write({ ".gitignore": "draft.md\n", "draft.md": markdown })
    expect(
      await project.run(["--stdin-filepath", "draft.md"], markdown),
    ).toEqual({ code: 0, stdout: markdown, stderr: "" })
    expect(project.read("draft.md")).toBe(markdown)
  })

  it("reports a rejected code block as a warning, and writes the rest formatted", async () => {
    const text = `${markdown}\n\`\`\`mermaid\nflowchart LR\nA-->B)\n\`\`\`\n`
    expect(await project.run(["--stdin-filepath", "doc.md"], text)).toEqual({
      code: 0,
      stdout: `${formattedMarkdown}\n\`\`\`mermaid\nflowchart LR\nA-->B)\n\`\`\`\n`,
      stderr: "doc.md:10:6: warning: Unexpected character\n",
    })
  })

  it("writes nothing for a rejected diagram, and exits with 2", async () => {
    expect(
      await project.run(
        ["--stdin-filepath", "a.mmd"],
        "flowchart LR\nA-->B)\n",
      ),
    ).toEqual({
      code: 2,
      stdout: "",
      stderr: "a.mmd:2:6: error: Unexpected character\n",
    })
  })

  it("is an error with a path of another ending", async () => {
    expect(await project.run(["--stdin-filepath", "a.txt"], diagram)).toEqual({
      code: 2,
      stdout: "",
      stderr:
        'mmdfmt: error: the path of --stdin-filepath does not end in .md, .markdown, .mmd, or .mermaid: "a.txt"\n',
    })
  })
})

describe("Usage: --help and --version", () => {
  it.each([[["--help"]], [["-h"]]])("prints the usage for %j", async (args) => {
    const run = await project.run(args)
    expect(run.code).toBe(0)
    expect(run.stderr).toBe("")
    expectUsage(run.stdout)
    expect(run.stdout).toContain(packageJson.description)
    expect(run.stdout).toContain(`mmdfmt v${packageJson.version}`)
    // The usage ends as gunshi draws it, with no line ending added: the run
    // without arguments writes that usage alone.
    const usage = (await project.run([])).stderr
    expect(run.stdout.endsWith(usage)).toBe(true)
  })

  it.each([[["--version"]], [["-v"]]])(
    "prints the version for %j",
    async (args) => {
      expect(await project.run(args)).toEqual({
        code: 0,
        stdout: `${packageJson.version}\n`,
        stderr: "",
      })
    },
  )

  it.each([
    [["--help", "--write", "a.mmd"]],
    [["--help", "--write", "--check"]],
    [["-h", "--check", "a.mmd"]],
    [["--help", "--stdin-filepath"]],
    [["--help", "--stdin-filepath="]],
  ])("prints only the usage for %j", async (args) => {
    project.write({ "a.mmd": diagram })
    const run = await project.run(args)
    expect(run.code).toBe(0)
    expect(run.stderr).toBe("")
    expectUsage(run.stdout)
    expect(project.read("a.mmd")).toBe(diagram)
  })

  it.each([
    [["--version", "--check", "a.mmd"]],
    [["--help", "--version"]],
    [["--version", "--help"]],
    [["-hv"]],
    [["--version", "--stdin-filepath"]],
    [["--version", "--stdin-filepath="]],
  ])("prints only the version for %j", async (args) => {
    project.write({ "a.mmd": diagram })
    expect(await project.run(args)).toEqual({
      code: 0,
      stdout: `${packageJson.version}\n`,
      stderr: "",
    })
    expect(project.read("a.mmd")).toBe(diagram)
  })
})

describe("Usage: gunshi writes nothing itself", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  // gunshi writes with console.log unless the tool sets usageSilent: the
  // header on every run, the usage, the version, and its errors. The tool
  // writes them itself instead, so that none of them mixes with the result of
  // --stdin-filepath on standard output.
  it.each([
    [["--stdin-filepath", "a.mmd"]],
    [["--help"]],
    [["--version"]],
    [["--fix", "a.mmd"]],
    [["--write", "--check", "a.mmd"]],
    [[]],
  ])("calls no console.log for %j", async (args) => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined)
    await project.run(args, diagram)
    expect(log).not.toHaveBeenCalled()
  })
})

describe("Usage: no argument at all prints the usage and exits with 2", () => {
  it("prints only the usage to standard error", async () => {
    const run = await project.run([])
    expect(run.code).toBe(2)
    expect(run.stdout).toBe("")
    expectUsage(run.stderr)
    expect(run.stderr).not.toContain("mmdfmt: error")
  })
})

describe("Usage: anything else is an error with exit 2", () => {
  beforeEach(() => {
    project.write({ "a.mmd": diagram })
  })

  it.each([
    [["a.mmd"], ["give --write or --check with the patterns"]],
    [["--write"], ["no patterns of the files to format"]],
    [["--write", "--"], ["no patterns of the files to format"]],
    [
      ["--write", "--check", "a.mmd"],
      ["Optional argument '--write' conflicts with '--check'"],
    ],
    [
      ["--check", "--write", "a.mmd"],
      ["Optional argument '--write' conflicts with '--check'"],
    ],
    [
      ["--stdin-filepath", "a.mmd", "a.mmd"],
      ["--stdin-filepath takes no patterns"],
    ],
    [
      ["--stdin-filepath", "a.mmd", "--", "a.mmd"],
      ["--stdin-filepath takes no patterns"],
    ],
    [
      ["--stdin-filepath", "a.mmd", "--write"],
      ["Optional argument '--write' conflicts with '--stdin-filepath'"],
    ],
    [
      ["--write", "--stdin-filepath", "a.mmd"],
      ["Optional argument '--write' conflicts with '--stdin-filepath'"],
    ],
    [
      ["--stdin-filepath", "a.mmd", "--check"],
      ["Optional argument '--check' conflicts with '--stdin-filepath'"],
    ],
    [
      ["--stdin-filepath=", "--write", "a.mmd"],
      ["Optional argument '--write' conflicts with '--stdin-filepath'"],
    ],
    [
      ["--stdin-filepath", "", "--write", "a.mmd"],
      ["Optional argument '--write' conflicts with '--stdin-filepath'"],
    ],
    [
      ["--stdin-filepath=", "--check", "a.mmd"],
      ["Optional argument '--check' conflicts with '--stdin-filepath'"],
    ],
    [["--stdin-filepath="], ["--stdin-filepath needs a path"]],
    [["--stdin-filepath", ""], ["--stdin-filepath needs a path"]],
    [["--stdin-filepath=", "a.mmd"], ["--stdin-filepath needs a path"]],
    [["-x", "a.mmd"], ["Unknown option: -x"]],
    [["--no-write", "a.mmd"], ["Unknown option: --no-write"]],
    [
      ["-wc", "a.mmd"],
      ["Unknown option: -w", "Unknown option: -c"],
    ],
    [["--fix", "a.mmd"], ["Unknown option: --fix"]],
    [["--help", "--fix"], ["Unknown option: --fix"]],
    [["--version", "--fix"], ["Unknown option: --fix"]],
    [
      ["--stdin-filepath"],
      ["Optional argument '--stdin-filepath' should be 'string'"],
    ],
    [["--stdinFilepath", "a.mmd"], ["Unknown option: --stdinFilepath"]],
  ])("%j", async (args, messages) => {
    expect(await project.run(args)).toEqual({
      code: 2,
      stdout: "",
      stderr: messages.map((message) => `mmdfmt: error: ${message}\n`).join(""),
    })
    expect(project.read("a.mmd")).toBe(diagram)
  })
})

describe("Usage: a reader of standard output that goes away", () => {
  it("ignores EPIPE when the reader goes away", () => {
    const error = Object.assign(new Error("write EPIPE"), { code: "EPIPE" })
    expect(() => ignoreBrokenPipe(error)).not.toThrow()
  })

  it("throws an error with another code", () => {
    const error = Object.assign(new Error("permission denied"), {
      code: "EACCES",
    })
    expect(() => ignoreBrokenPipe(error)).toThrow(error)
  })
})

describe("Patterns", () => {
  it("selects a file by its path", async () => {
    project.write({ "docs/a.md": markdown, "b.mmd": diagram })
    expect(await project.run(["--check", "docs/a.md"])).toEqual({
      code: 1,
      stdout: listed("docs/a.md"),
      stderr: "",
    })
  })

  it("takes arguments after -- as patterns", async () => {
    project.write({ "a.mmd": diagram })
    expect(await project.run(["--check", "--", "a.mmd"])).toEqual({
      code: 1,
      stdout: listed("a.mmd"),
      stderr: "",
    })
    expect(project.read("a.mmd")).toBe(diagram)
  })

  it("formats a file whose name starts with - after --", async () => {
    project.write({ "-a.mmd": diagram })
    expect(await project.run(["--write", "--", "-a.mmd"])).toEqual({
      code: 0,
      stdout: listed("-a.mmd"),
      stderr: "",
    })
    expect(project.read("-a.mmd")).toBe(formattedDiagram)
  })

  it("takes patterns before and after --", async () => {
    project.write({ "a.mmd": diagram, "b.mmd": diagram })
    expect(await project.run(["--check", "a.mmd", "--", "b.mmd"])).toEqual({
      code: 1,
      stdout: listed("a.mmd", "b.mmd"),
      stderr: "",
    })
    expect(project.read("a.mmd")).toBe(diagram)
    expect(project.read("b.mmd")).toBe(diagram)
  })

  it("selects the files under a directory, of the four endings", async () => {
    project.write({
      "docs/a.md": markdown,
      "docs/b.markdown": markdown,
      "docs/sub/c.mmd": diagram,
      "docs/sub/d.mermaid": diagram,
      "docs/e.txt": diagram,
      "f.mmd": diagram,
    })
    expect(await project.run(["--check", "docs"])).toEqual({
      code: 1,
      stdout: listed(
        "docs/a.md",
        "docs/b.markdown",
        "docs/sub/c.mmd",
        "docs/sub/d.mermaid",
      ),
      stderr: "",
    })
  })

  it("selects the files that a glob matches, names that start with a dot included", async () => {
    project.write({
      "a.md": markdown,
      ".github/b.md": markdown,
      "docs/.c.md": markdown,
      "d.mmd": diagram,
    })
    expect(await project.run(["--check", "**/*.md"])).toEqual({
      code: 1,
      stdout: listed(".github/b.md", "a.md", "docs/.c.md"),
      stderr: "",
    })
  })

  it.runIf(process.platform === "win32")(
    "reads a \\ of a glob as / on Windows",
    async () => {
      project.write({ "docs/a.md": markdown })
      expect(await project.run(["--check", "docs\\*.md"])).toEqual({
        code: 1,
        stdout: listed("docs/a.md"),
        stderr: "",
      })
    },
  )

  it("formats only the files of the four endings that a glob matches", async () => {
    project.write({ "a.mmd": diagram, "b.txt": diagram, "c.mmd.bak": diagram })
    expect(await project.run(["--check", "*"])).toEqual({
      code: 1,
      stdout: listed("a.mmd"),
      stderr: "",
    })
  })

  it("is an error for a directory without a file of the four endings", async () => {
    project.write({ "docs/a.txt": diagram })
    expect(await project.run(["--check", "docs"])).toEqual({
      code: 2,
      stdout: "",
      stderr: noFileMatches("docs"),
    })
  })

  it("formats a file once, however many patterns select it", async () => {
    project.write({ "a.mmd": diagram })
    expect(await project.run(["--write", "a.mmd", "*.mmd", "."])).toEqual({
      code: 0,
      stdout: listed("a.mmd"),
      stderr: "",
    })
  })

  it("is an error for a pattern that selects no file of the four endings, and formats the rest", async () => {
    project.write({ "a.mmd": diagram, "notes.txt": diagram })
    expect(
      await project.run(["--write", "notes.txt", "missing/*.md", "a.mmd"]),
    ).toEqual({
      code: 2,
      stdout: listed("a.mmd"),
      stderr: noFileMatches("notes.txt") + noFileMatches("missing/*.md"),
    })
    expect(project.read("a.mmd")).toBe(formattedDiagram)
  })
})

describe("Excluding files: node_modules, version control, and .gitignore", () => {
  it("skips the files under node_modules and the directories of version control", async () => {
    project.write({
      "a.md": markdown,
      "node_modules/x/b.md": markdown,
      "docs/node_modules/c.md": markdown,
      ".git/d.md": markdown,
      ".hg/e.md": markdown,
      ".jj/f.md": markdown,
      ".sl/g.md": markdown,
      ".svn/h.md": markdown,
    })
    expect(await project.run(["--check", "**/*.md"])).toEqual({
      code: 1,
      stdout: listed("a.md"),
      stderr: "",
    })
  })

  it("skips patterns in node_modules, leaving none to select files", async () => {
    project.write({ "node_modules/x/b.md": markdown })
    expect(
      await project.run(["--check", "node_modules/**/*.md", "node_modules"]),
    ).toEqual({
      code: 2,
      stdout: "",
      stderr:
        "mmdfmt: error: no patterns of the files to format; a pattern in node_modules or a directory of version control is skipped\n",
    })
    expect(project.read("node_modules/x/b.md")).toBe(markdown)
  })

  it.each([
    [["--check", "node_modules/x", "docs"]],
    [["--check", "node_modules/x/a.md", "docs"]],
    [["--check", "node_modules/**/*.md", "docs"]],
  ])(
    "skips a pattern in node_modules and checks the other files: %j",
    async (args) => {
      project.write({
        "node_modules/x/a.md": markdown,
        "docs/b.md": markdown,
      })
      expect(await project.run(args)).toEqual({
        code: 1,
        stdout: listed("docs/b.md"),
        stderr: "",
      })
      expect(project.read("node_modules/x/a.md")).toBe(markdown)
      expect(project.read("docs/b.md")).toBe(markdown)
    },
  )

  it("skips a pattern in .git and checks the other files", async () => {
    project.write({ ".git/y/c.md": markdown, "docs/b.md": markdown })
    expect(await project.run(["--check", ".git/y", "docs"])).toEqual({
      code: 1,
      stdout: listed("docs/b.md"),
      stderr: "",
    })
    expect(project.read(".git/y/c.md")).toBe(markdown)
    expect(project.read("docs/b.md")).toBe(markdown)
  })

  it.each([
    [["--check", "node_modules/x"]],
    [["--check", "node_modules/x/a.md"]],
  ])("is an error when the only pattern is skipped: %j", async (args) => {
    project.write({ "node_modules/x/a.md": markdown })
    expect(await project.run(args)).toEqual({
      code: 2,
      stdout: "",
      stderr:
        "mmdfmt: error: no patterns of the files to format; a pattern in node_modules or a directory of version control is skipped\n",
    })
    expect(project.read("node_modules/x/a.md")).toBe(markdown)
  })

  it("skips a file in node_modules and rewrites the other files", async () => {
    project.write({
      "node_modules/x/a.md": markdown,
      "docs/b.md": markdown,
    })
    expect(
      await project.run(["--write", "node_modules/x/a.md", "docs"]),
    ).toEqual({ code: 0, stdout: listed("docs/b.md"), stderr: "" })
    expect(project.read("node_modules/x/a.md")).toBe(markdown)
    expect(project.read("docs/b.md")).toBe(formattedMarkdown)
  })

  it("skips the files that the .gitignore of the current directory lists", async () => {
    project.write({
      ".gitignore": "gen/\ndraft.md\n",
      "a.md": markdown,
      "gen/b.md": markdown,
      "draft.md": markdown,
      "docs/draft.md": markdown,
    })
    expect(await project.run(["--check", "**/*.md"])).toEqual({
      code: 1,
      stdout: listed("a.md"),
      stderr: "",
    })
    expect(project.read("a.md")).toBe(markdown)
    expect(project.read("gen/b.md")).toBe(markdown)
    expect(project.read("draft.md")).toBe(markdown)
    expect(project.read("docs/draft.md")).toBe(markdown)
  })

  it.each([[["--check", "."]], [["--check", "notes.md"]]])(
    "does not read .prettierignore for %j",
    async (args) => {
      project.write({ ".prettierignore": "*.md\n", "notes.md": markdown })
      expect(await project.run(args)).toEqual({
        code: 1,
        stdout: listed("notes.md"),
        stderr: "",
      })
      expect(project.read("notes.md")).toBe(markdown)
    },
  )

  it("does not read a .gitignore of another directory", async () => {
    project.write({ "docs/.gitignore": "a.md\n", "docs/a.md": markdown })
    expect(await project.run(["--check", "docs/a.md"])).toEqual({
      code: 1,
      stdout: listed("docs/a.md"),
      stderr: "",
    })
  })

  it("is not an error for a glob that selects only ignored files", async () => {
    project.write({ ".gitignore": "gen/\n", "gen/b.md": markdown })
    expect(await project.run(["--check", "gen/*.md"])).toEqual({
      code: 0,
      stdout: "",
      stderr: "",
    })
  })

  it("skips a file that a pattern names, without an error", async () => {
    project.write({
      ".gitignore": "gen/\n",
      "gen/b.md": markdown,
      "node_modules/x/c.md": markdown,
    })
    expect(
      await project.run(["--write", "gen/b.md", "node_modules/x/c.md"]),
    ).toEqual({ code: 0, stdout: "", stderr: "" })
    expect(project.read("gen/b.md")).toBe(markdown)
  })
})

describe("Excluding files: patterns that start with !", () => {
  it.each([
    [["--check", ".", "!sub/**"], listed("a.mmd", "d.md")],
    [["--check", "!sub/**", "."], listed("a.mmd", "d.md")],
    [["--check", "**/*.mmd", "!sub/**"], listed("a.mmd")],
  ])(
    "excludes matching files from directories and globs: %j",
    async (args, stdout) => {
      project.write({
        "a.mmd": diagram,
        "sub/b.mmd": diagram,
        "sub/deep/c.mmd": diagram,
        "d.md": markdown,
      })
      expect(await project.run(args)).toEqual({ code: 1, stdout, stderr: "" })
      expect(project.read("a.mmd")).toBe(diagram)
      expect(project.read("sub/b.mmd")).toBe(diagram)
      expect(project.read("sub/deep/c.mmd")).toBe(diagram)
      expect(project.read("d.md")).toBe(markdown)
    },
  )

  it("is an error for an excluded file path, and checks the other files", async () => {
    project.write({ "a.mmd": diagram, "sub/b.mmd": diagram })
    expect(
      await project.run(["--check", "a.mmd", "sub/b.mmd", "!a.mmd"]),
    ).toEqual({
      code: 2,
      stdout: listed("sub/b.mmd"),
      stderr:
        'mmdfmt: error: a pattern that starts with ! excludes the file "a.mmd"\n',
    })
    expect(project.read("a.mmd")).toBe(diagram)
    expect(project.read("sub/b.mmd")).toBe(diagram)
  })

  it("does not rewrite an excluded file path", async () => {
    project.write({ "a.mmd": diagram })
    expect(await project.run(["--write", "a.mmd", "!a.mmd"])).toEqual({
      code: 2,
      stdout: "",
      stderr:
        'mmdfmt: error: a pattern that starts with ! excludes the file "a.mmd"\n',
    })
    expect(project.read("a.mmd")).toBe(diagram)
  })

  it.each([
    [["--check", "sub", "!sub/**"], "sub"],
    [["--check", "sub/**/*.mmd", "!**/*.mmd"], "sub/**/*.mmd"],
  ])(
    "is an error when every selected file is excluded: %j",
    async (args, pattern) => {
      project.write({ "sub/b.mmd": diagram, "sub/deep/c.mmd": diagram })
      expect(await project.run(args)).toEqual({
        code: 2,
        stdout: "",
        stderr: noFileMatches(pattern),
      })
      expect(project.read("sub/b.mmd")).toBe(diagram)
      expect(project.read("sub/deep/c.mmd")).toBe(diagram)
    },
  )

  it.each([[["--check", "!sub/**"]], [["--check", "!a.mmd", "!b.mmd"]]])(
    "is an error with only excluding patterns: %j",
    async (args) => {
      project.write({
        "a.mmd": diagram,
        "b.mmd": diagram,
        "sub/b.mmd": diagram,
      })
      expect(await project.run(args)).toEqual({
        code: 2,
        stdout: "",
        stderr:
          "mmdfmt: error: no patterns of the files to format; a pattern that starts with ! only excludes files\n",
      })
      expect(project.read("a.mmd")).toBe(diagram)
      expect(project.read("b.mmd")).toBe(diagram)
      expect(project.read("sub/b.mmd")).toBe(diagram)
    },
  )

  it("matches the excluding glob from the current directory", async () => {
    project.write({ "a.mmd": diagram, "sub/a.mmd": diagram })
    expect(await project.run(["--check", ".", "!a.mmd"])).toEqual({
      code: 1,
      stdout: listed("sub/a.mmd"),
      stderr: "",
    })
    expect(project.read("a.mmd")).toBe(diagram)
    expect(project.read("sub/a.mmd")).toBe(diagram)
  })

  it("selects an existing file whose name starts with !", async () => {
    project.write({ "!x.mmd": diagram })
    expect(await project.run(["--check", "!x.mmd"])).toEqual({
      code: 1,
      stdout: listed("!x.mmd"),
      stderr: "",
    })
    expect(project.read("!x.mmd")).toBe(diagram)
  })

  it("takes no excluding pattern with --stdin-filepath", async () => {
    project.write({ "a.mmd": diagram })
    expect(
      await project.run(["--stdin-filepath", "a.mmd", "!x"], diagram),
    ).toEqual({
      code: 2,
      stdout: "",
      stderr: "mmdfmt: error: --stdin-filepath takes no patterns\n",
    })
    expect(project.read("a.mmd")).toBe(diagram)
  })
})

describe("Configuration", () => {
  it("indents by two spaces without a Prettier configuration", async () => {
    project.write({ "a.mmd": diagram })
    await project.run(["--write", "a.mmd"])
    expect(project.read("a.mmd")).toBe(formattedDiagram)
  })

  it("takes tabWidth from a Prettier configuration, in a file and in a code block", async () => {
    project.write({
      ".prettierrc": JSON.stringify({ tabWidth: 4 }),
      "a.mmd": diagram,
      "b.md": markdown,
    })
    await project.run(["--write", "a.mmd", "b.md"])
    expect(project.read("a.mmd")).toBe("flowchart LR\n    A --> B\n")
    expect(project.read("b.md")).toBe(
      "# T\n\n```mermaid\nflowchart LR\n    A --> B\n```\n",
    )
  })

  it("takes useTabs from a Prettier configuration", async () => {
    project.write({
      ".prettierrc": JSON.stringify({ useTabs: true }),
      "a.mmd": diagram,
    })
    await project.run(["--write", "a.mmd"])
    expect(project.read("a.mmd")).toBe("flowchart LR\n\tA --> B\n")
  })

  it("takes the indentation from .editorconfig", async () => {
    project.write({
      ".editorconfig": "root = true\n\n[*]\nindent_size = 4\n",
      "a.mmd": diagram,
    })
    await project.run(["--write", "a.mmd"])
    expect(project.read("a.mmd")).toBe("flowchart LR\n    A --> B\n")
  })

  it("takes for a code block the options of the Markdown file", async () => {
    project.write({
      ".prettierrc": JSON.stringify({
        overrides: [{ files: "*.md", options: { tabWidth: 4 } }],
      }),
      "a.mmd": diagram,
      "b.md": markdown,
    })
    await project.run(["--write", "a.mmd", "b.md"])
    expect(project.read("a.mmd")).toBe(formattedDiagram)
    expect(project.read("b.md")).toBe(
      "# T\n\n```mermaid\nflowchart LR\n    A --> B\n```\n",
    )
  })

  it("sets the plugins, the line endings, and the text of the Markdown itself", async () => {
    const prose = `${"word ".repeat(30)}\n\n`
    project.write({
      ".prettierrc": JSON.stringify({
        plugins: ["prettier-plugin-that-is-not-installed"],
        endOfLine: "crlf",
        proseWrap: "always",
      }),
      "a.mmd": diagram,
      "b.md": prose + markdown,
    })
    expect(await project.run(["--write", "a.mmd", "b.md"])).toEqual({
      code: 0,
      stdout: listed("a.mmd", "b.md"),
      stderr: "",
    })
    expect(project.read("a.mmd")).toBe(formattedDiagram)
    expect(project.read("b.md")).toBe(prose + formattedMarkdown)
  })

  it("takes printWidth from a Prettier configuration, in a file", async () => {
    project.write({
      ".prettierrc": JSON.stringify({
        overrides: [
          { files: "wide.mmd", options: { printWidth: blockWidth } },
          { files: "narrow.mmd", options: { printWidth: blockWidth - 1 } },
        ],
      }),
      "wide.mmd": block,
      "narrow.mmd": block,
    })
    await project.run(["--write", "wide.mmd", "narrow.mmd"])
    expect(project.read("wide.mmd")).toBe(block)
    expect(project.read("narrow.mmd")).toBe(blockOnLines)
  })

  it("takes printWidth from max_line_length of .editorconfig", async () => {
    project.write({
      ".editorconfig": `root = true\n\n[*]\nmax_line_length = ${blockWidth - 1}\n`,
      "a.mmd": block,
    })
    await project.run(["--write", "a.mmd"])
    expect(project.read("a.mmd")).toBe(blockOnLines)
  })

  it("reads max_line_length = off as no limit on the width", async () => {
    const longBlock = `flowchart LR\n  A@{ label: ${"x".repeat(300)}, shape: rect }\n`
    project.write({
      ".editorconfig": "root = true\n\n[*]\nmax_line_length = off\n",
      "a.mmd": longBlock,
    })
    await project.run(["--write", "a.mmd"])
    expect(project.read("a.mmd")).toBe(longBlock)
  })

  /** A diagram with the frontmatter that `text` holds, and the code block that holds the same. */
  function withFrontmatter(frontmatter: string): Record<string, string> {
    const text = `---\n${frontmatter}---\nflowchart LR\nA-->B\n`
    return { "a.mmd": text, "b.md": `# T\n\n\`\`\`mermaid\n${text}\`\`\`\n` }
  }

  /** What `withFrontmatter` gives back once formatted, with `frontmatter` in place of the frontmatter. */
  function formattedWithFrontmatter(frontmatter: string): {
    mmd: string
    md: string
  } {
    const text = `---\n${frontmatter}---\nflowchart LR\n  A --> B\n`
    return { mmd: text, md: `# T\n\n\`\`\`mermaid\n${text}\`\`\`\n` }
  }

  it("reads singleQuote: it reaches the frontmatter", async () => {
    project.write({
      ".prettierrc": JSON.stringify({ singleQuote: true }),
      ...withFrontmatter('title: "T"\n'),
    })
    await project.run(["--write", "a.mmd", "b.md"])
    const formatted = formattedWithFrontmatter("title: 'T'\n")
    expect(project.read("a.mmd")).toBe(formatted.mmd)
    expect(project.read("b.md")).toBe(formatted.md)
  })

  it("reads embeddedLanguageFormatting: off leaves the frontmatter as written", async () => {
    project.write({
      ".prettierrc": JSON.stringify({ embeddedLanguageFormatting: "off" }),
      ...withFrontmatter('title:   "T"\n'),
    })
    await project.run(["--write", "a.mmd", "b.md"])
    const formatted = formattedWithFrontmatter('title:   "T"\n')
    expect(project.read("a.mmd")).toBe(formatted.mmd)
    expect(project.read("b.md")).toBe(formatted.md)
  })

  it("reads bracketSpacing: it reaches the frontmatter", async () => {
    project.write({
      ".prettierrc": JSON.stringify({ bracketSpacing: false }),
      ...withFrontmatter("config:\n  themeVariables: { primaryColor: red }\n"),
    })
    await project.run(["--write", "a.mmd", "b.md"])
    const formatted = formattedWithFrontmatter(
      "config:\n  themeVariables: {primaryColor: red}\n",
    )
    expect(project.read("a.mmd")).toBe(formatted.mmd)
    expect(project.read("b.md")).toBe(formatted.md)
  })

  it("reads proseWrap: it reaches the frontmatter", async () => {
    project.write({
      ".prettierrc": JSON.stringify({ proseWrap: "never" }),
      ...withFrontmatter("title: one two three\n  four five six\n"),
    })
    await project.run(["--write", "a.mmd", "b.md"])
    const formatted = formattedWithFrontmatter(
      "title: one two three four five six\n",
    )
    expect(project.read("a.mmd")).toBe(formatted.mmd)
    expect(project.read("b.md")).toBe(formatted.md)
  })

  it("reads trailingComma: it reaches a flow collection of the frontmatter that breaks", async () => {
    const frontmatter =
      "config:\n  themeVariables: { primaryColor: red, lineColor: blue, textColor: green }\n"
    project.write({
      ".prettierrc": JSON.stringify({ printWidth: 40, trailingComma: "none" }),
      ...withFrontmatter(frontmatter),
    })
    await project.run(["--write", "a.mmd"])
    expect(project.read("a.mmd")).toBe(
      formattedWithFrontmatter(
        "config:\n  themeVariables:\n    {\n      primaryColor: red,\n      lineColor: blue,\n      textColor: green\n    }\n",
      ).mmd,
    )
  })

  it("formats a file whose lines end with \\r\\n whatever range the configuration sets", async () => {
    const crlfDiagram = "flowchart LR\r\nA-->B\r\n"
    project.write({
      ".prettierrc.json": JSON.stringify({ rangeEnd: 0 }),
      "a.mmd": crlfDiagram,
      "b.md": markdown,
    })
    await project.run(["--write", "a.mmd", "b.md"])
    expect(project.read("a.mmd")).toBe("flowchart LR\r\n  A --> B\r\n")
    expect(project.read("b.md")).toBe(formattedMarkdown)
  })

  it.each([
    {
      name: "a range that selects no text",
      option: { rangeStart: 4, rangeEnd: 4 },
    },
    { name: "cursorOffset", option: { cursorOffset: 5 } },
    { name: "requirePragma", option: { requirePragma: true } },
    { name: "insertPragma", option: { insertPragma: true } },
    { name: "checkIgnorePragma", option: { checkIgnorePragma: true } },
  ])("does not read $name from the configuration", async ({ option }) => {
    project.write({
      ".prettierrc.json": JSON.stringify(option),
      "a.mmd": diagram,
      "b.md": markdown,
    })
    await project.run(["--write", "a.mmd", "b.md"])
    expect(project.read("a.mmd")).toBe(formattedDiagram)
    expect(project.read("b.md")).toBe(formattedMarkdown)
  })

  it("does not read the options of other languages, even with a value Prettier would refuse", async () => {
    project.write({
      ".prettierrc.json": JSON.stringify({ semi: "yes", arrowParens: 3 }),
      "a.mmd": diagram,
    })
    expect(await project.run(["--write", "a.mmd"])).toEqual({
      code: 0,
      stdout: listed("a.mmd"),
      stderr: "",
    })
    expect(project.read("a.mmd")).toBe(formattedDiagram)
  })

  it("is an error for a value of a read option that Prettier refuses", async () => {
    project.write({
      ".prettierrc.json": JSON.stringify({ printWidth: "wide" }),
      "a.mmd": diagram,
    })
    const run = await project.run(["--write", "a.mmd"])
    expect(run.code).toBe(2)
    expect(run.stdout).toBe("")
    expect(run.stderr).toBe(
      'a.mmd: error: Invalid printWidth value. Expected an integer, but received "wide".\n',
    )
    expect(project.read("a.mmd")).toBe(diagram)
  })

  it("is an error when the configuration cannot be read", async () => {
    project.write({ ".prettierrc": "{", "a.mmd": diagram })
    const run = await project.run(["--write", "a.mmd"])
    expect(run.code).toBe(2)
    expect(run.stdout).toBe("")
    expect(run.stderr.startsWith("a.mmd: error: ")).toBe(true)
    expect(project.read("a.mmd")).toBe(diagram)
  })
})

describe("Code blocks in detail: a .mmd or .mermaid file, as a whole", () => {
  it("keeps the line endings of a file of \\r\\n", async () => {
    project.write({ "a.mmd": "flowchart LR\r\nA-->B\r\n" })
    await project.run(["--write", "a.mmd"])
    expect(project.read("a.mmd")).toBe("flowchart LR\r\n  A --> B\r\n")
  })

  it("ends every line as the first line of the file ends", async () => {
    project.write({ "a.mmd": "flowchart LR\nA-->B\r\nB-->C\r\n" })
    await project.run(["--write", "a.mmd"])
    expect(project.read("a.mmd")).toBe("flowchart LR\n  A --> B\n  B --> C\n")
  })

  it("ends the lines with \\n in a file of one line", async () => {
    project.write({ "a.mmd": "flowchart LR; A-->B" })
    await project.run(["--write", "a.mmd"])
    expect(project.read("a.mmd")).toBe(formattedDiagram)
  })

  it("keeps a byte order mark", async () => {
    project.write({ "a.mmd": `\uFEFF${diagram}` })
    await project.run(["--write", "a.mmd"])
    expect(project.read("a.mmd")).toBe(`\uFEFF${formattedDiagram}`)
  })

  it("formats a file of only blank lines as an empty file", async () => {
    project.write({ "a.mmd": "  \n\n" })
    expect(await project.run(["--write", "a.mmd"])).toEqual({
      code: 0,
      stdout: listed("a.mmd"),
      stderr: "",
    })
    expect(project.read("a.mmd")).toBe("")
  })
})

describe("Errors and exit codes: an error in a .mmd or .mermaid file", () => {
  it("reports the position, leaves the file, formats the others, and exits with 2", async () => {
    project.write({ "a.mmd": "flowchart LR\nA-->B)\n", "b.mmd": diagram })
    expect(await project.run(["--write", "a.mmd", "b.mmd"])).toEqual({
      code: 2,
      stdout: listed("b.mmd"),
      stderr: "a.mmd:2:6: error: Unexpected character\n",
    })
    expect(project.read("a.mmd")).toBe("flowchart LR\nA-->B)\n")
    expect(project.read("b.mmd")).toBe(formattedDiagram)
  })

  it("counts lines at \\r\\n, \\n, and \\r, and not at U+2028", async () => {
    project.write({
      "a.mmd": "flowchart LR\r\nA-->B\rB-->C\nA[a\u2028b]-->B)\n",
    })
    expect(await project.run(["--check", "a.mmd"])).toEqual({
      code: 2,
      stdout: "",
      stderr: "a.mmd:4:11: error: Unexpected character\n",
    })
  })

  it("counts a column in UTF-16 code units", async () => {
    project.write({ "a.mmd": "flowchart LR\nA[\u{1F600}]-->B)\n" })
    expect(await project.run(["--check", "a.mmd"])).toEqual({
      code: 2,
      stdout: "",
      stderr: "a.mmd:2:10: error: Unexpected character\n",
    })
  })

  it("exits with 2, and not 1, with --check when a file would also change", async () => {
    project.write({ "a.mmd": "flowchart LR\nA-->B)\n", "b.mmd": diagram })
    expect(await project.run(["--check", "a.mmd", "b.mmd"])).toEqual({
      code: 2,
      stdout: listed("b.mmd"),
      stderr: "a.mmd:2:6: error: Unexpected character\n",
    })
  })

  it("does not fail a run for a rejected code block", async () => {
    project.write({ "a.md": "```mermaid\nflowchart LR\nA-->B)\n```\n" })
    expect(await project.run(["--check", "a.md"])).toEqual({
      code: 0,
      stdout: "",
      stderr: "a.md:3:6: warning: Unexpected character\n",
    })
  })
})

describe("Errors and exit codes: a warning with its position in the file", () => {
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
  const formatted = lines(
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
  )

  it("--write gives the position of a warning in the file it wrote", async () => {
    project.write({ "b.md": input })
    expect(await project.run(["--write", "b.md"])).toEqual({
      code: 0,
      stdout: listed("b.md"),
      stderr: "b.md:11:1: warning: Unexpected end of text\n",
    })
    expect(project.read("b.md")).toBe(formatted)
  })

  it("--stdin-filepath gives the position of a warning in the text it writes", async () => {
    expect(await project.run(["--stdin-filepath", "b.md"], input)).toEqual({
      code: 0,
      stdout: formatted,
      stderr: "b.md:11:1: warning: Unexpected end of text\n",
    })
  })

  it("--check gives the position of a warning in the file as it is", async () => {
    project.write({ "b.md": input })
    expect(await project.run(["--check", "b.md"])).toEqual({
      code: 1,
      stdout: listed("b.md"),
      stderr: "b.md:9:1: warning: Unexpected end of text\n",
    })
    expect(project.read("b.md")).toBe(input)
  })

  /**
   * A file whose first line ends with `\r` and the others with `\n`, with a
   * diagram that gains a line before a rejected one.
   */
  const mixedInput =
    "# T\r> ```mermaid\n> flowchart LR\n> A-->B; B-->C\n\n> next\n\n```mermaid\nflowchart LR\nA-->B)\n```\n"
  /** The file above after formatting. */
  const mixedFormatted =
    "# T\r> ```mermaid\n> flowchart LR\r>   A --> B\r>   B --> C\n\n> next\n\n```mermaid\nflowchart LR\nA-->B)\n```\n"

  it("--write gives the position of a warning in the file it wrote, whose lines end in two ways", async () => {
    project.write({ "b.md": mixedInput })
    expect(await project.run(["--write", "b.md"])).toEqual({
      code: 0,
      stdout: listed("b.md"),
      stderr: "b.md:11:6: warning: Unexpected character\n",
    })
    expect(project.read("b.md")).toBe(mixedFormatted)
  })

  it("--stdin-filepath gives the position of a warning in the text it writes, whose lines end in two ways", async () => {
    expect(await project.run(["--stdin-filepath", "b.md"], mixedInput)).toEqual(
      {
        code: 0,
        stdout: mixedFormatted,
        stderr: "b.md:11:6: warning: Unexpected character\n",
      },
    )
  })
})

describe("Errors and exit codes: a file that cannot be read or written", () => {
  const isRoot = process.getuid?.() === 0

  it.skipIf(process.platform === "win32" || isRoot)(
    "is an error for a file that cannot be read",
    async () => {
      project.write({ "a.mmd": diagram, "b.mmd": diagram })
      chmodSync(path.join(project.cwd, "a.mmd"), 0o000)
      const run = await project.run(["--write", "a.mmd", "b.mmd"])
      chmodSync(path.join(project.cwd, "a.mmd"), 0o644)
      expect(run.code).toBe(2)
      expect(run.stdout).toBe(listed("b.mmd"))
      expect(run.stderr.startsWith("a.mmd: error: EACCES")).toBe(true)
    },
  )

  it.skipIf(isRoot)(
    "is an error for a file that cannot be written",
    async () => {
      project.write({ "a.mmd": diagram })
      chmodSync(path.join(project.cwd, "a.mmd"), 0o444)
      const run = await project.run(["--write", "a.mmd"])
      chmodSync(path.join(project.cwd, "a.mmd"), 0o644)
      expect(run.code).toBe(2)
      expect(run.stdout).toBe("")
      expect(
        ["EACCES", "EPERM"].some((code) =>
          run.stderr.startsWith(`a.mmd: error: ${code}`),
        ),
      ).toBe(true)
      expect(project.read("a.mmd")).toBe(diagram)
    },
  )
})
