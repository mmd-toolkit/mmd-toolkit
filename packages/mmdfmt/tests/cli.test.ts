import { chmodSync } from "node:fs"
import { PassThrough } from "node:stream"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import packageJson from "../package.json" with { type: "json" }
import { ignoreBrokenPipe } from "../src/broken-pipe.ts"
import { main } from "../src/main.ts"
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
  "Check whether the files are formatted, and print a summary and the files that are not",
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

describe("Usage: --write, --check, and --list-different", () => {
  beforeEach(() => {
    project.write({
      "a.mmd": diagram,
      "b.md": markdown,
      "c.mmd": formattedDiagram,
    })
  })

  it.each([
    [["--write"]],
    [["-w"]],
    [["--write", "--list-different"]],
    [["-wl"]],
  ])("%j rewrites the files that change, and lists them", async (args) => {
    expect(await project.run([...args, "*.mmd", "*.md"])).toEqual({
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

  it("reads false after --write as a pattern", async () => {
    expect(await project.run(["--write", "false", "a.mmd"])).toEqual({
      code: 2,
      stdout: listed("a.mmd"),
      stderr: noFileMatches("false"),
    })
    expect(project.read("a.mmd")).toBe(formattedDiagram)
  })

  it("--list-different changes nothing, lists the files that --write would change, and exits with 1", async () => {
    expect(await project.run(["--list-different", "*.mmd", "*.md"])).toEqual({
      code: 1,
      stdout: listed("a.mmd", "b.md"),
      stderr: "",
    })
    expect(project.read("a.mmd")).toBe(diagram)
    expect(project.read("b.md")).toBe(markdown)
  })

  it("--list-different exits with 0 when every file is formatted", async () => {
    expect(await project.run(["--list-different", "c.mmd"])).toEqual({
      code: 0,
      stdout: "",
      stderr: "",
    })
  })

  it.each([[["--list-different=false"]], [["-l"]]])(
    "%j lists the files that would change",
    async (args) => {
      expect(await project.run([...args, "a.mmd"])).toEqual({
        code: 1,
        stdout: listed("a.mmd"),
        stderr: "",
      })
      expect(project.read("a.mmd")).toBe(diagram)
    },
  )

  it.each([[["--check"]], [["-c"]], [["--check=false"]]])(
    "%j changes nothing, warns about a file, and summarizes",
    async (args) => {
      expect(await project.run([...args, "a.mmd", "c.mmd"])).toEqual({
        code: 1,
        stdout: "Checking formatting...\n",
        stderr:
          "[warn] a.mmd\n[warn] Code style issues found in the above file. Run mmdfmt with --write to fix.\n",
      })
      expect(project.read("a.mmd")).toBe(diagram)
    },
  )

  it("--check names the number of files with differences", async () => {
    expect(await project.run(["--check", "*.mmd", "*.md"])).toEqual({
      code: 1,
      stdout: "Checking formatting...\n",
      stderr:
        "[warn] a.mmd\n[warn] b.md\n[warn] Code style issues found in 2 files. Run mmdfmt with --write to fix.\n",
    })
    expect(project.read("b.md")).toBe(markdown)
  })

  it.each([[["--check"]], [["--write", "--check"]]])(
    "%j reports success when no file differs",
    async (args) => {
      expect(await project.run([...args, "c.mmd"])).toEqual({
        code: 0,
        stdout:
          "Checking formatting...\nAll diagrams in the matched files use Prettier code style!\n",
        stderr: "",
      })
    },
  )

  it.each([[["--write", "--check"]], [["-wc"]]])(
    "%j warns after writing a file and exits with 0",
    async (args) => {
      expect(await project.run([...args, "a.mmd"])).toEqual({
        code: 0,
        stdout: "Checking formatting...\n",
        stderr:
          "[warn] a.mmd\n[warn] Code style issues fixed in the above file.\n",
      })
      expect(project.read("a.mmd")).toBe(formattedDiagram)
    },
  )

  it.each([
    [["--write", "--no-write", "--list-different"]],
    [["--no-write", "--list-different"]],
  ])("%j reads --no-write as Prettier does: no --write", async (args) => {
    expect(await project.run([...args, "a.mmd"])).toEqual({
      code: 1,
      stdout: listed("a.mmd"),
      stderr: "",
    })
    expect(project.read("a.mmd")).toBe(diagram)
  })

  it.each([
    [["--check", "--no-check", "--write"]],
    [["--no-list-different", "--write"]],
  ])(
    "%j reads --no-check and --no-list-different as Prettier does",
    async (args) => {
      expect(await project.run([...args, "a.mmd"])).toEqual({
        code: 0,
        stdout: listed("a.mmd"),
        stderr: "",
      })
    },
  )

  it("colors the word warn where Node colors text for standard error", async () => {
    vi.stubEnv("FORCE_COLOR", "1")
    vi.stubEnv("NO_COLOR", undefined)
    try {
      const run = await project.run(["--check", "a.mmd"], "", new PassThrough())
      expect(run.stderr).toBe(
        "[\u001B[33mwarn\u001B[39m] a.mmd\n[\u001B[33mwarn\u001B[39m] Code style issues found in the above file. Run mmdfmt with --write to fix.\n",
      )
    } finally {
      vi.unstubAllEnvs()
    }
  })

  it("--write --check counts the files it changed", async () => {
    expect(await project.run(["--write", "--check", "a.mmd", "b.md"])).toEqual({
      code: 0,
      stdout: "Checking formatting...\n",
      stderr:
        "[warn] a.mmd\n[warn] b.md\n[warn] Code style issues fixed in 2 files.\n",
    })
    expect(project.read("b.md")).toBe(formattedMarkdown)
  })
})

describe("From an editor or another tool: --stdin-filepath", () => {
  it("keeps a byte order mark in standard input", async () => {
    expect(
      await project.run(["--stdin-filepath", "a.mmd"], `\uFEFF${diagram}`),
    ).toEqual({
      code: 0,
      stdout: `\uFEFF${formattedDiagram}`,
      stderr: "",
    })
  })

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

  it.each([[["--check"]], [["-c"]], [["--list-different"]], [["-l"]]])(
    "lists (stdin) with %j when the text would change, and exits with 1",
    async (options) => {
      expect(
        await project.run([...options, "--stdin-filepath", "a.mmd"], diagram),
      ).toEqual({ code: 1, stdout: "(stdin)\n", stderr: "" })
      expect(
        await project.run(
          [...options, "--stdin-filepath", "a.mmd"],
          formattedDiagram,
        ),
      ).toEqual({ code: 0, stdout: "", stderr: "" })
    },
  )

  it("gives a warning with --check its position in the text as it was read", async () => {
    const text = `\`\`\`mermaid\nflowchart LR\nA-->B\n\`\`\`\n\n\`\`\`mermaid\nflowchart LR\nA-->B)\n\`\`\`\n`
    expect(
      await project.run(["--check", "--stdin-filepath", "doc.md"], text),
    ).toEqual({
      code: 1,
      stdout: "(stdin)\n",
      stderr: "doc.md:8:6: warning: Unexpected character\n",
    })
  })

  it("exits with 2 with --check for a rejected diagram", async () => {
    expect(
      await project.run(
        ["--check", "--stdin-filepath", "a.mmd"],
        "flowchart LR\nA-->B)\n",
      ),
    ).toEqual({
      code: 2,
      stdout: "",
      stderr: "a.mmd:2:6: error: Unexpected character\n",
    })
  })

  it("writes back with --check the input of a path that the patterns would skip", async () => {
    expect(
      await project.run(
        ["--check", "--stdin-filepath", "node_modules/x/a.mmd"],
        diagram,
      ),
    ).toEqual({ code: 0, stdout: diagram, stderr: "" })
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
    [["--help", "--check", "--list-different"]],
    [["-h", "--list-different", "a.mmd"]],
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
    [["--version", "--list-different", "a.mmd"]],
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
    [["--check", "--list-different", "a.mmd"]],
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
    [
      ["a.mmd"],
      ["give --write, --check, or --list-different with the patterns"],
    ],
    [["--write"], ["no patterns of the files to format"]],
    [["--write", "--"], ["no patterns of the files to format"]],
    [
      ["--check", "--list-different", "a.mmd"],
      ["Optional argument '--check' conflicts with '--list-different'"],
    ],
    [
      ["--list-different", "--check", "a.mmd"],
      ["Optional argument '--check' conflicts with '--list-different'"],
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
      ["--no-write", "--stdin-filepath", "a.mmd"],
      ["Optional argument '--no-write' conflicts with '--stdin-filepath'"],
    ],
    [
      ["--no-check", "--list-different", "a.mmd"],
      ["Optional argument '--no-check' conflicts with '--list-different'"],
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
      ["--stdin-filepath=", "--list-different", "a.mmd"],
      ["--stdin-filepath needs a path"],
    ],
    [["--stdin-filepath="], ["--stdin-filepath needs a path"]],
    [["--stdin-filepath", ""], ["--stdin-filepath needs a path"]],
    [["--stdin-filepath=", "a.mmd"], ["--stdin-filepath needs a path"]],
    [["-x", "a.mmd"], ["Unknown option: -x"]],
    [
      ["--no-write", "a.mmd"],
      ["give --write, --check, or --list-different with the patterns"],
    ],
    [["-cl", "a.mmd"], ["Optional argument '-c' conflicts with '-l'"]],
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
    expect(await project.run(["--list-different", "docs/a.md"])).toEqual({
      code: 1,
      stdout: listed("docs/a.md"),
      stderr: "",
    })
  })

  it("takes arguments after -- as patterns", async () => {
    project.write({ "a.mmd": diagram })
    expect(await project.run(["--list-different", "--", "a.mmd"])).toEqual({
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
    expect(
      await project.run(["--list-different", "a.mmd", "--", "b.mmd"]),
    ).toEqual({
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
    expect(await project.run(["--list-different", "docs"])).toEqual({
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
    expect(await project.run(["--list-different", "**/*.md"])).toEqual({
      code: 1,
      stdout: listed(".github/b.md", "a.md", "docs/.c.md"),
      stderr: "",
    })
  })

  it.runIf(process.platform === "win32")(
    "reads a \\ of a glob as / on Windows",
    async () => {
      project.write({ "docs/a.md": markdown })
      expect(await project.run(["--list-different", "docs\\*.md"])).toEqual({
        code: 1,
        stdout: listed("docs/a.md"),
        stderr: "",
      })
    },
  )

  it("formats only the files of the four endings that a glob matches", async () => {
    project.write({ "a.mmd": diagram, "b.txt": diagram, "c.mmd.bak": diagram })
    expect(await project.run(["--list-different", "*"])).toEqual({
      code: 1,
      stdout: listed("a.mmd"),
      stderr: "",
    })
  })

  it("is an error for a directory without a file of the four endings", async () => {
    project.write({ "docs/a.txt": diagram })
    expect(await project.run(["--list-different", "docs"])).toEqual({
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
    expect(await project.run(["--list-different", "**/*.md"])).toEqual({
      code: 1,
      stdout: listed("a.md"),
      stderr: "",
    })
  })

  it("skips patterns in node_modules, leaving none to select files", async () => {
    project.write({ "node_modules/x/b.md": markdown })
    expect(
      await project.run([
        "--list-different",
        "node_modules/**/*.md",
        "node_modules",
      ]),
    ).toEqual({
      code: 2,
      stdout: "",
      stderr:
        "mmdfmt: error: no patterns of the files to format; a pattern in node_modules or a directory of version control is skipped\n",
    })
    expect(project.read("node_modules/x/b.md")).toBe(markdown)
  })

  it.each([
    [["--list-different", "node_modules/x", "docs"]],
    [["--list-different", "node_modules/x/a.md", "docs"]],
    [["--list-different", "node_modules/**/*.md", "docs"]],
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
    expect(await project.run(["--list-different", ".git/y", "docs"])).toEqual({
      code: 1,
      stdout: listed("docs/b.md"),
      stderr: "",
    })
    expect(project.read(".git/y/c.md")).toBe(markdown)
    expect(project.read("docs/b.md")).toBe(markdown)
  })

  it.each([
    [["--list-different", "node_modules/x"]],
    [["--list-different", "node_modules/x/a.md"]],
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
    expect(await project.run(["--list-different", "**/*.md"])).toEqual({
      code: 1,
      stdout: listed("a.md"),
      stderr: "",
    })
    expect(project.read("a.md")).toBe(markdown)
    expect(project.read("gen/b.md")).toBe(markdown)
    expect(project.read("draft.md")).toBe(markdown)
    expect(project.read("docs/draft.md")).toBe(markdown)
  })

  it.each([[["--list-different", "."]], [["--list-different", "notes.md"]]])(
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
    expect(await project.run(["--list-different", "docs/a.md"])).toEqual({
      code: 1,
      stdout: listed("docs/a.md"),
      stderr: "",
    })
  })

  it("is not an error for a glob that selects only ignored files", async () => {
    project.write({ ".gitignore": "gen/\n", "gen/b.md": markdown })
    expect(await project.run(["--list-different", "gen/*.md"])).toEqual({
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
    [["--list-different", ".", "!sub/**"], listed("a.mmd", "d.md")],
    [["--list-different", "!sub/**", "."], listed("a.mmd", "d.md")],
    [["--list-different", "**/*.mmd", "!sub/**"], listed("a.mmd")],
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
      await project.run(["--list-different", "a.mmd", "sub/b.mmd", "!a.mmd"]),
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
    [["--list-different", "sub", "!sub/**"], "sub"],
    [["--list-different", "sub/**/*.mmd", "!**/*.mmd"], "sub/**/*.mmd"],
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

  it.each([
    [["--list-different", "!sub/**"]],
    [["--list-different", "!a.mmd", "!b.mmd"]],
  ])("is an error with only excluding patterns: %j", async (args) => {
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
  })

  it("matches the excluding glob from the current directory", async () => {
    project.write({ "a.mmd": diagram, "sub/a.mmd": diagram })
    expect(await project.run(["--list-different", ".", "!a.mmd"])).toEqual({
      code: 1,
      stdout: listed("sub/a.mmd"),
      stderr: "",
    })
    expect(project.read("a.mmd")).toBe(diagram)
    expect(project.read("sub/a.mmd")).toBe(diagram)
  })

  it("selects an existing file whose name starts with !", async () => {
    project.write({ "!x.mmd": diagram })
    expect(await project.run(["--list-different", "!x.mmd"])).toEqual({
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

describe("Indentation", () => {
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

  it("uses no plugin and no other option of the configuration", async () => {
    const prose = `${"word ".repeat(30)}\n\n`
    project.write({
      ".prettierrc": JSON.stringify({
        plugins: ["prettier-plugin-that-is-not-installed"],
        endOfLine: "crlf",
        printWidth: 20,
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
  it.each([[["--check"]], [["--write", "--check"]]])(
    "%j summarizes a formatting error before differences",
    async (args) => {
      project.write({ "a.mmd": "flowchart LR\nA-->B)\n", "b.mmd": diagram })
      expect(await project.run([...args, "a.mmd", "b.mmd"])).toEqual({
        code: 2,
        stdout:
          "Checking formatting...\nError occurred when checking code style in the above file.\n",
        stderr: "a.mmd:2:6: error: Unexpected character\n[warn] b.mmd\n",
      })
      expect(project.read("b.mmd")).toBe(
        args.includes("--write") ? formattedDiagram : diagram,
      )
    },
  )

  it("--check counts the files with a formatting error", async () => {
    project.write({
      "a.mmd": "flowchart LR\nA-->B)\n",
      "b.mermaid": "flowchart LR\nA-->\n",
    })
    expect(await project.run(["--check", "a.mmd", "b.mermaid"])).toEqual({
      code: 2,
      stdout:
        "Checking formatting...\nError occurred when checking code style in 2 files.\n",
      stderr:
        "a.mmd:2:6: error: Unexpected character\nb.mermaid:3:1: error: Unexpected end of text\n",
    })
  })

  it("--check counts a thrown formatting error", async () => {
    project.write({ ".prettierrc": "{", "a.mmd": diagram })
    const run = await project.run(["--check", "a.mmd"])
    expect(run.code).toBe(2)
    expect(run.stdout).toBe(
      "Checking formatting...\nError occurred when checking code style in the above file.\n",
    )
    expect(run.stderr.startsWith("a.mmd: error: ")).toBe(true)
  })

  it("--check treats a rejected code block as a warning", async () => {
    project.write({ "a.md": "```mermaid\nflowchart LR\nA-->B)\n```\n" })
    expect(await project.run(["--check", "a.md"])).toEqual({
      code: 0,
      stdout:
        "Checking formatting...\nAll diagrams in the matched files use Prettier code style!\n",
      stderr: "a.md:3:6: warning: Unexpected character\n",
    })
  })

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
    expect(await project.run(["--list-different", "a.mmd"])).toEqual({
      code: 2,
      stdout: "",
      stderr: "a.mmd:4:11: error: Unexpected character\n",
    })
  })

  it("counts a column in UTF-16 code units", async () => {
    project.write({ "a.mmd": "flowchart LR\nA[\u{1F600}]-->B)\n" })
    expect(await project.run(["--list-different", "a.mmd"])).toEqual({
      code: 2,
      stdout: "",
      stderr: "a.mmd:2:10: error: Unexpected character\n",
    })
  })

  it("exits with 2, and not 1, with --list-different when a file would also change", async () => {
    project.write({ "a.mmd": "flowchart LR\nA-->B)\n", "b.mmd": diagram })
    expect(await project.run(["--list-different", "a.mmd", "b.mmd"])).toEqual({
      code: 2,
      stdout: listed("b.mmd"),
      stderr: "a.mmd:2:6: error: Unexpected character\n",
    })
  })

  it("does not fail a run for a rejected code block", async () => {
    project.write({ "a.md": "```mermaid\nflowchart LR\nA-->B)\n```\n" })
    expect(await project.run(["--list-different", "a.md"])).toEqual({
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

  it("--list-different gives the position of a warning in the file as it is", async () => {
    project.write({ "b.md": input })
    expect(await project.run(["--list-different", "b.md"])).toEqual({
      code: 1,
      stdout: listed("b.md"),
      stderr: "b.md:9:1: warning: Unexpected end of text\n",
    })
    expect(project.read("b.md")).toBe(input)
  })

  it("--check gives a warning's position in the file as it is", async () => {
    project.write({ "b.md": input })
    expect(await project.run(["--check", "b.md"])).toEqual({
      code: 1,
      stdout: "Checking formatting...\n",
      stderr:
        "b.md:9:1: warning: Unexpected end of text\n[warn] b.md\n[warn] Code style issues found in the above file. Run mmdfmt with --write to fix.\n",
    })
    expect(project.read("b.md")).toBe(input)
  })

  it.each([[["--write", "--check"]], [["--write", "--list-different"]]])(
    "%j gives a warning's position after formatting",
    async (args) => {
      project.write({ "b.md": input })
      expect(await project.run([...args, "b.md"])).toEqual(
        args.includes("--check")
          ? {
              code: 0,
              stdout: "Checking formatting...\n",
              stderr:
                "b.md:11:1: warning: Unexpected end of text\n[warn] b.md\n[warn] Code style issues fixed in the above file.\n",
            }
          : {
              code: 0,
              stdout: listed("b.md"),
              stderr: "b.md:11:1: warning: Unexpected end of text\n",
            },
      )
      expect(project.read("b.md")).toBe(formatted)
    },
  )

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
      expect(run.stdout).toBe(listed("a.mmd"))
      expect(
        ["EACCES", "EPERM"].some((code) =>
          run.stderr.startsWith(`a.mmd: error: ${code}`),
        ),
      ).toBe(true)
      expect(project.read("a.mmd")).toBe(diagram)
    },
  )

  it.skipIf(process.platform === "win32" || isRoot)(
    "does not count a read error as a formatting error in --check",
    async () => {
      project.write({ "a.mmd": diagram, "b.mmd": formattedDiagram })
      chmodSync(path.join(project.cwd, "a.mmd"), 0o000)
      const run = await project.run(["--check", "a.mmd", "b.mmd"])
      chmodSync(path.join(project.cwd, "a.mmd"), 0o644)
      expect(run.code).toBe(2)
      expect(run.stdout).toBe(
        "Checking formatting...\nAll diagrams in the matched files use Prettier code style!\n",
      )
      expect(run.stderr.startsWith("a.mmd: error: EACCES")).toBe(true)
    },
  )

  it
    .skipIf(isRoot)
    .each([[["--write", "--list-different"]], [["--write", "--check"]]])(
    "%j counts and reports a file whose write fails",
    async (args) => {
      project.write({ "a.mmd": diagram })
      chmodSync(path.join(project.cwd, "a.mmd"), 0o444)
      const run = await project.run([...args, "a.mmd"])
      chmodSync(path.join(project.cwd, "a.mmd"), 0o644)
      expect(run.code).toBe(2)
      expect(run.stdout).toBe(
        args.includes("--check") ? "Checking formatting...\n" : listed("a.mmd"),
      )
      expect(
        ["EACCES", "EPERM"].some((code) =>
          run.stderr.startsWith(`a.mmd: error: ${code}`),
        ),
      ).toBe(true)
      if (args.includes("--check")) {
        expect(
          run.stderr.endsWith(
            "[warn] a.mmd\n[warn] Code style issues fixed in the above file.\n",
          ),
        ).toBe(true)
      }
      expect(project.read("a.mmd")).toBe(diagram)
    },
  )
})

describe("--check summarizes even when patterns select nothing", () => {
  it.each([
    ["missing.mmd", noFileMatches("missing.mmd")],
    [
      "!a.mmd",
      "mmdfmt: error: no patterns of the files to format; a pattern that starts with ! only excludes files\n",
    ],
    [
      "node_modules",
      "mmdfmt: error: no patterns of the files to format; a pattern in node_modules or a directory of version control is skipped\n",
    ],
  ])(
    "starts before the pattern error for %s, then summarizes",
    async (pattern, error) => {
      const events: string[] = []
      const code = await main(["--check", pattern], {
        cwd: project.cwd,
        readStdin: () => Promise.resolve(""),
        stdout: (text) => events.push(`stdout: ${text}`),
        stderr: (text) => events.push(`stderr: ${text}`),
      })
      expect(code).toBe(2)
      expect(events).toEqual([
        "stdout: Checking formatting...\n",
        `stderr: ${error}`,
        "stdout: All diagrams in the matched files use Prettier code style!\n",
      ])
    },
  )

  it("does not count an excluded file as a formatting error", async () => {
    project.write({ "a.mmd": diagram })
    expect(await project.run(["--check", "a.mmd", "!a.mmd"])).toEqual({
      code: 2,
      stdout:
        "Checking formatting...\nAll diagrams in the matched files use Prettier code style!\n",
      stderr:
        'mmdfmt: error: a pattern that starts with ! excludes the file "a.mmd"\n',
    })
  })

  it("reports success for a glob whose selected files are ignored", async () => {
    project.write({ ".gitignore": "gen/\n", "gen/a.mmd": diagram })
    expect(await project.run(["--check", "gen/*.mmd"])).toEqual({
      code: 0,
      stdout:
        "Checking formatting...\nAll diagrams in the matched files use Prettier code style!\n",
      stderr: "",
    })
  })
})
