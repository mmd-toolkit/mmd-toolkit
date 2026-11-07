import { chmodSync } from "node:fs"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import packageJson from "../package.json" with { type: "json" }
import { Project, listed } from "./helpers.ts"

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

describe("Usage: --stdin-filepath", () => {
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
    [["a.mmd"], "give --write or --check with the patterns"],
    [["--write"], "no patterns of the files to format"],
    [["--write", "--"], "no patterns of the files to format"],
    [
      ["--write", "--check", "a.mmd"],
      "Optional argument '--write' conflicts with '--check'",
    ],
    [
      ["--check", "--write", "a.mmd"],
      "Optional argument '--write' conflicts with '--check'",
    ],
    [
      ["--stdin-filepath", "a.mmd", "a.mmd"],
      "--stdin-filepath takes no patterns",
    ],
    [
      ["--stdin-filepath", "a.mmd", "--", "a.mmd"],
      "--stdin-filepath takes no patterns",
    ],
    [
      ["--stdin-filepath", "a.mmd", "--write"],
      "Optional argument '--write' conflicts with '--stdin-filepath'",
    ],
    [
      ["--write", "--stdin-filepath", "a.mmd"],
      "Optional argument '--write' conflicts with '--stdin-filepath'",
    ],
    [
      ["--stdin-filepath", "a.mmd", "--check"],
      "Optional argument '--check' conflicts with '--stdin-filepath'",
    ],
    [
      ["--stdin-filepath=", "--write", "a.mmd"],
      "Optional argument '--write' conflicts with '--stdin-filepath'",
    ],
    [
      ["--stdin-filepath", "", "--write", "a.mmd"],
      "Optional argument '--write' conflicts with '--stdin-filepath'",
    ],
    [
      ["--stdin-filepath=", "a.mmd"],
      "give --write or --check with the patterns",
    ],
    [["--stdin-filepath="], "no patterns of the files to format"],
    [["-x", "a.mmd"], "Unknown option: -x"],
    [["--no-write", "a.mmd"], "Unknown option: --no-write"],
    [["-wc", "a.mmd"], "Unknown option: -w\nmmdfmt: error: Unknown option: -c"],
    [["--fix", "a.mmd"], "Unknown option: --fix"],
    [["--help", "--fix"], "Unknown option: --fix"],
    [["--version", "--fix"], "Unknown option: --fix"],
    [
      ["--stdin-filepath"],
      "Optional argument '--stdin-filepath' should be 'string'",
    ],
    [["--stdinFilepath", "a.mmd"], "Unknown option: --stdinFilepath"],
  ])("%j", async (args, message) => {
    expect(await project.run(args)).toEqual({
      code: 2,
      stdout: "",
      stderr: `mmdfmt: error: ${message}\n`,
    })
    expect(project.read("a.mmd")).toBe(diagram)
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

describe("Patterns: skipped files", () => {
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

  it("is an error for a glob or a directory that has files only under them", async () => {
    project.write({ "node_modules/x/b.md": markdown })
    expect(
      await project.run(["--check", "node_modules/**/*.md", "node_modules"]),
    ).toEqual({
      code: 2,
      stdout: "",
      stderr:
        noFileMatches("node_modules/**/*.md") + noFileMatches("node_modules"),
    })
  })

  it("skips the files that the .gitignore and the .prettierignore of the current directory list", async () => {
    project.write({
      ".gitignore": "gen/\n",
      ".prettierignore": "draft.md\n",
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
  })

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

describe("Formatting options", () => {
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

describe("What is formatted: a .mmd or .mermaid file, as a whole", () => {
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

describe("When a diagram cannot be read: an error in a .mmd or .mermaid file", () => {
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

describe("Exit codes: a file that cannot be read or written", () => {
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
