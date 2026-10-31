import { execFileSync, spawn, spawnSync } from "node:child_process"
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { afterEach, expect, it } from "vitest"

const script = fileURLToPath(new URL("./proper-form.mjs", import.meta.url))
const agents = readFileSync(new URL("../../AGENTS.md", import.meta.url), "utf8")
const bullet = agents
  .slice(
    agents.indexOf("- Always build the proper form"),
    agents.indexOf("\n- The conventions for code and documents"),
  )
  .trimEnd()
const temporaryDirs = []

afterEach(() => {
  for (const directory of temporaryDirs) {
    rmSync(directory, { recursive: true, force: true })
  }
  temporaryDirs.length = 0
})

/** Write one fixed input, creating its parent directory when needed. */
function write(repo, filePath, contents = "new file\n") {
  const absolute = path.join(repo, filePath)
  mkdirSync(path.dirname(absolute), { recursive: true })
  writeFileSync(absolute, contents)
}

/** Run git only inside a test's temporary repository. */
function git(repo, args) {
  return execFileSync("git", ["--no-optional-locks", ...args], {
    cwd: repo,
    encoding: "utf8",
    env: {
      GIT_CONFIG_NOSYSTEM: "1",
      GIT_CONFIG_GLOBAL: path.join(repo, "absent-global-config"),
    },
  })
}

/** Commit a fixed test file without using the user's identity or git hooks. */
function commit(repo, filePath) {
  git(repo, ["add", "--", filePath])
  git(repo, [
    "-c",
    "user.name=Hook test",
    "-c",
    "user.email=hook-test@example.invalid",
    "commit",
    "--quiet",
    "-m",
    "Fixed test input",
  ])
}

/** Build an isolated repository, hook temp directory and unique session. */
function setup() {
  const temporary = realpathSync(
    mkdtempSync(path.join(os.tmpdir(), "proper-form-test-")),
  )
  temporaryDirs.push(temporary)
  const repo = path.join(temporary, "repo")
  const tmpdir = path.join(temporary, "tmp")
  mkdirSync(repo)
  mkdirSync(tmpdir)
  git(repo, ["init", "--quiet"])
  write(repo, "AGENTS.md", agents)
  write(repo, "existing.txt", "existing file\n")
  commit(repo, "existing.txt")
  const session = path.basename(temporary)
  return {
    repo,
    tmpdir,
    session,
    stateDir: path.join(tmpdir, "mmd-toolkit-proper-form", session),
  }
}

/** Build hook inputs as JSON so Prettier cannot unquote snake-case keys. */
function inputFor(fixture, extra = "{}") {
  return JSON.stringify({
    ...JSON.parse(
      `{"session_id":${JSON.stringify(fixture.session)},"cwd":${JSON.stringify(fixture.repo)}}`,
    ),
    ...JSON.parse(extra),
  })
}

/** Build a file tool's JSON input with its documented path field. */
function fileInput(filePath) {
  return `{"file_path":${JSON.stringify(filePath)}}`
}

/** Run a hook child with an isolated os.tmpdir(), capturing both outputs. */
function run(fixture, command, extra = "{}") {
  return spawnSync(process.execPath, [script, command], {
    cwd: fixture.repo,
    encoding: "utf8",
    env: { TMPDIR: fixture.tmpdir, TMP: fixture.tmpdir, TEMP: fixture.tmpdir },
    input: inputFor(fixture, extra),
  })
}

/** Record a tool input before its corresponding test edit. */
function record(fixture, tool, toolInput) {
  const result = run(
    fixture,
    "record",
    `{"tool_name":${JSON.stringify(tool)},"tool_input":${toolInput}}`,
  )
  expect(result.status, result.stderr).toBe(0)
  expect(result.stdout).toBe("")
  expect(result.stderr).toBe("")
}

/** Check a turn's reply, using an ordinary final reply by default. */
function check(fixture, reply = "Done.") {
  return run(
    fixture,
    "check",
    `{"last_assistant_message":${JSON.stringify(reply)}}`,
  )
}

/** Assert that an allowed Stop prints nothing and removes its session state. */
function allowed(fixture, result) {
  expect(result.status, result.stderr).toBe(0)
  expect(result.stdout).toBe("")
  expect(result.stderr).toBe("")
  expect(existsSync(fixture.stateDir)).toBe(false)
}

/** Assert the documented non-error Stop output and return its context. */
function asked(result) {
  expect(result.status, result.stderr).toBe(0)
  expect(result.stderr).toBe("")
  const output = JSON.parse(result.stdout)
  expect(Object.keys(output)).toEqual(["hookSpecificOutput"])
  expect(output.hookSpecificOutput.hookEventName).toBe("Stop")
  return output.hookSpecificOutput.additionalContext
}

/** Set up the common turn that creates a tool file. */
function addedTool() {
  const fixture = setup()
  record(fixture, "Write", fileInput("tools/new.mjs"))
  write(fixture.repo, "tools/new.mjs")
  return fixture
}

it("allows a turn without file tools or Bash and leaves no state", () => {
  const fixture = setup()
  allowed(fixture, check(fixture))
})

it("asks about a file created by Write and includes the AGENTS.md bullet", () => {
  const fixture = addedTool()
  const context = asked(check(fixture))
  expect(context).toContain("\ntools/new.mjs\n")
  expect(context).toContain(bullet)
  expect(context).toContain(
    "Proper-form check: <path> | maintains: <what it keeps> | needed because: <a checkable fact; an earlier decision of one's own is no reason> | precedent: <a path of the same kind in the repository, or none>",
  )
})

it("allows the proper-form reply and deletes the state", () => {
  const fixture = addedTool()
  allowed(
    fixture,
    check(fixture, "Done.\n  Proper-form check: no mechanism added (x)"),
  )
})

it("asks once, then allows a second check without the line", () => {
  const fixture = addedTool()
  const context = asked(check(fixture))
  expect(context).toContain("\ntools/new.mjs\n")
  expect(
    JSON.parse(readFileSync(path.join(fixture.stateDir, "asked.json"), "utf8")),
  ).toEqual([path.join(fixture.repo, "tools/new.mjs").replaceAll("\\", "/")])
  allowed(fixture, check(fixture))
})

it("excludes fixtures, snapshots, changesets and paired Japanese documents", () => {
  const fixture = setup()
  const paths = [
    "tests/fixtures/a.mmd",
    "tests/__snapshots__/a.snap",
    ".changeset/a.md",
    "docs/a.ja.md",
    "docs/a.md",
  ]
  for (const filePath of paths) {
    record(fixture, "Write", fileInput(filePath))
    write(fixture.repo, filePath)
  }
  const context = asked(check(fixture))
  expect(context).toContain("\ndocs/a.md\n")
  for (const filePath of paths.slice(0, -1)) {
    expect(context).not.toContain(`\n${filePath}\n`)
  }
})

it("allows an edit of an existing tracked file", () => {
  const fixture = setup()
  record(fixture, "Edit", fileInput("existing.txt"))
  write(fixture.repo, "existing.txt", "edited\n")
  allowed(fixture, check(fixture))
})

it("attributes a Bash creation and ignores a file no input names", () => {
  const fixture = setup()
  record(fixture, "Bash", '{"command":"cat > notes/x.txt"}')
  write(fixture.repo, "notes/x.txt")
  write(fixture.repo, "unrelated.txt")
  const context = asked(check(fixture))
  expect(context).toContain("\nnotes/x.txt\n")
  expect(context).not.toContain("unrelated.txt")
})

it("asks about an addition committed within the turn", () => {
  const fixture = addedTool()
  commit(fixture.repo, "tools/new.mjs")
  const context = asked(check(fixture))
  expect(context).toContain("\ntools/new.mjs\n")
})

it("checks attributed package fields and package-manager commands only", () => {
  const scripts = setup()
  write(scripts.repo, "package.json", '{"scripts":{"test":"old"}}')
  commit(scripts.repo, "package.json")
  record(scripts, "Edit", fileInput("package.json"))
  write(scripts.repo, "package.json", '{"scripts":{"test":"new"}}')
  expect(asked(check(scripts))).toContain("\npackage.json\n")

  const unmentioned = setup()
  write(unmentioned.repo, "package.json", '{"scripts":{"test":"old"}}')
  commit(unmentioned.repo, "package.json")
  record(unmentioned, "Bash", '{"command":"echo hello"}')
  write(unmentioned.repo, "package.json", '{"scripts":{"test":"new"}}')
  allowed(unmentioned, check(unmentioned))

  const dependencies = setup()
  write(dependencies.repo, "package.json", '{"devDependencies":{}}')
  commit(dependencies.repo, "package.json")
  record(dependencies, "Bash", '{"command":"pnpm add x"}')
  write(dependencies.repo, "package.json", '{"devDependencies":{"x":"1"}}')
  expect(asked(check(dependencies))).toContain("\npackage.json\n")

  const description = setup()
  write(description.repo, "package.json", '{"description":"old"}')
  commit(description.repo, "package.json")
  record(description, "Edit", fileInput("package.json"))
  write(description.repo, "package.json", '{"description":"new"}')
  allowed(description, check(description))
})

it("asks about dependencies changed by a filtered package-manager command", () => {
  const fixture = setup()
  write(fixture.repo, "package.json", '{"dependencies":{}}')
  commit(fixture.repo, "package.json")
  record(fixture, "Bash", '{"command":"pnpm --filter pkg add dep"}')
  write(fixture.repo, "package.json", '{"dependencies":{"dep":"1"}}')
  expect(asked(check(fixture))).toContain("\npackage.json\n")
})

it("asks about dependencies changed by a package-manager command with a valueless option", () => {
  const fixture = setup()
  write(fixture.repo, "package.json", '{"dependencies":{}}')
  commit(fixture.repo, "package.json")
  record(fixture, "Bash", '{"command":"pnpm -w add dep"}')
  write(fixture.repo, "package.json", '{"dependencies":{"dep":"1"}}')
  expect(asked(check(fixture))).toContain("\npackage.json\n")
})

it("accepts a scoped package name containing a hyphen as an option value", () => {
  const fixture = setup()
  write(fixture.repo, "package.json", '{"dependencies":{}}')
  commit(fixture.repo, "package.json")
  record(
    fixture,
    "Bash",
    '{"command":"pnpm --filter @mmd-toolkit/parser add dep"}',
  )
  write(fixture.repo, "package.json", '{"dependencies":{"dep":"1"}}')
  expect(asked(check(fixture))).toContain("\npackage.json\n")
})

it("does not attribute script changes to running a script named update", () => {
  const fixture = setup()
  write(fixture.repo, "package.json", '{"scripts":{"update":"old"}}')
  commit(fixture.repo, "package.json")
  record(fixture, "Bash", '{"command":"pnpm run update"}')
  write(fixture.repo, "package.json", '{"scripts":{"update":"new"}}')
  allowed(fixture, check(fixture))
})

it("does not attribute script changes to exec after a valueless option", () => {
  const fixture = setup()
  write(fixture.repo, "package.json", '{"scripts":{"update":"old"}}')
  commit(fixture.repo, "package.json")
  record(fixture, "Bash", '{"command":"pnpm -w exec update"}')
  write(fixture.repo, "package.json", '{"scripts":{"update":"new"}}')
  allowed(fixture, check(fixture))
})

it("ignores an untracked file present before the first record", () => {
  const fixture = setup()
  write(fixture.repo, "tools/new.mjs")
  record(fixture, "Write", fileInput("tools/new.mjs"))
  write(fixture.repo, "tools/new.mjs", "changed\n")
  allowed(fixture, check(fixture))
})

it("allows a missing last_assistant_message and clears existing state", () => {
  const fixture = addedTool()
  allowed(fixture, run(fixture, "check"))
})

it("normalizes backslashes in the input's file_path", () => {
  const fixture = setup()
  record(
    fixture,
    "Write",
    fileInput(path.join(fixture.repo, "tools/new.mjs").replaceAll("/", "\\")),
  )
  write(fixture.repo, "tools/new.mjs")
  expect(asked(check(fixture))).toContain("\ntools/new.mjs\n")
})

it("concurrent records preserve one baseline and both input lines", async () => {
  const fixture = setup()

  /** Start a record process without waiting for another process to finish. */
  function start(filePath) {
    return new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [script, "record"], {
        cwd: fixture.repo,
        env: {
          TMPDIR: fixture.tmpdir,
          TMP: fixture.tmpdir,
          TEMP: fixture.tmpdir,
        },
      })
      let stdout = ""
      let stderr = ""
      child.stdout.setEncoding("utf8")
      child.stderr.setEncoding("utf8")
      child.stdout.on("data", (chunk) => {
        stdout += chunk
      })
      child.stderr.on("data", (chunk) => {
        stderr += chunk
      })
      child.on("error", reject)
      child.on("close", (code) => {
        resolve({ code, stdout, stderr })
      })
      child.stdin.end(
        inputFor(
          fixture,
          `{"tool_name":"Write","tool_input":${fileInput(filePath)}}`,
        ),
      )
    })
  }

  const results = await Promise.all([start("one.mjs"), start("two.mjs")])
  expect(results).toEqual([
    { code: 0, stdout: "", stderr: "" },
    { code: 0, stdout: "", stderr: "" },
  ])
  const baselines = readdirSync(fixture.stateDir).filter((name) =>
    name.startsWith("baseline-"),
  )
  expect(baselines).toHaveLength(1)
  expect(
    JSON.parse(readFileSync(path.join(fixture.stateDir, baselines[0]), "utf8")),
  ).toMatchObject({ topLevel: fixture.repo.replaceAll("\\", "/") })
  const inputs = readFileSync(
    path.join(fixture.stateDir, "inputs.jsonl"),
    "utf8",
  )
    .trimEnd()
    .split("\n")
    .map((line) => JSON.parse(line))
  expect(inputs.map((input) => path.basename(input.filePath)).sort()).toEqual([
    "one.mjs",
    "two.mjs",
  ])
})

it("invalid stdin JSON exits 1 without stdout", () => {
  const fixture = setup()
  const result = spawnSync(process.execPath, [script, "record"], {
    cwd: fixture.repo,
    encoding: "utf8",
    env: { TMPDIR: fixture.tmpdir, TMP: fixture.tmpdir, TEMP: fixture.tmpdir },
    input: "{invalid",
  })
  expect(result.status).toBe(1)
  expect(result.stdout).toBe("")
  expect(result.stderr).toContain("proper-form:")
  expect(existsSync(fixture.stateDir)).toBe(false)
})

it("extracts the real bullet and documents Proper-form check in both languages", () => {
  const fixture = addedTool()
  expect(bullet).toContain("- Always build the proper form")
  expect(bullet).toContain("When the proper form is unclear")
  expect(bullet).toContain("Proper-form check:")
  const context = asked(check(fixture))
  expect(context).toContain(bullet)
  expect(context).not.toContain("- The conventions for code and documents")
  const japanese = readFileSync(
    new URL("../../AGENTS.ja.md", import.meta.url),
    "utf8",
  )
  expect(japanese).toContain("Proper-form check:")
})

it("allows when the top-level AGENTS.md has no proper-form bullet", () => {
  const fixture = addedTool()
  write(fixture.repo, "AGENTS.md", "# Instructions\n")
  allowed(fixture, check(fixture))
})

it("resolves a NotebookEdit path against a nested input.cwd", () => {
  const fixture = setup()
  mkdirSync(path.join(fixture.repo, "notes"))
  const result = run(
    fixture,
    "record",
    `{"cwd":${JSON.stringify(path.join(fixture.repo, "notes"))},"tool_name":"NotebookEdit","tool_input":{"notebook_path":"new.ipynb"}}`,
  )
  expect(result.status, result.stderr).toBe(0)
  expect(result.stdout).toBe("")
  write(fixture.repo, "notes/new.ipynb")
  expect(asked(check(fixture))).toContain("\nnotes/new.ipynb\n")
})

it("tracks dependency fields in nested untracked package.json files", () => {
  const fixture = setup()
  write(fixture.repo, "packages/a/package.json", '{"dependencies":{}}')
  write(fixture.repo, "packages/b/package.json", '{"peerDependencies":{}}')
  write(fixture.repo, "packages/c/package.json", '{"optionalDependencies":{}}')
  record(fixture, "PowerShell", '{"command":"npm install x"}')
  write(fixture.repo, "packages/a/package.json", '{"dependencies":{"x":"1"}}')
  write(
    fixture.repo,
    "packages/b/package.json",
    '{"peerDependencies":{"x":"1"}}',
  )
  write(
    fixture.repo,
    "packages/c/package.json",
    '{"optionalDependencies":{"x":"1"}}',
  )
  const context = asked(check(fixture))
  expect(context).toContain("\npackages/a/package.json\n")
  expect(context).toContain("\npackages/b/package.json\n")
  expect(context).toContain("\npackages/c/package.json\n")
})

it("distinguishes pre-existing staged additions from this turn's staged addition", () => {
  const fixture = setup()
  write(fixture.repo, "before.mjs")
  git(fixture.repo, ["add", "--", "before.mjs"])
  record(fixture, "Bash", '{"command":"touch before.mjs after.mjs"}')
  write(fixture.repo, "after.mjs")
  git(fixture.repo, ["add", "--", "after.mjs"])
  const context = asked(check(fixture))
  expect(context).toContain("\nafter.mjs\n")
  expect(context).not.toContain("\nbefore.mjs\n")
})

it("lists at most 20 candidates, states the total and remembers all candidates", () => {
  const fixture = setup()
  const paths = [
    "notes/a.txt",
    "notes/b.txt",
    "notes/c.txt",
    "notes/d.txt",
    "notes/e.txt",
    "notes/f.txt",
    "notes/g.txt",
    "notes/h.txt",
    "notes/i.txt",
    "notes/j.txt",
    "notes/k.txt",
    "notes/l.txt",
    "notes/m.txt",
    "notes/n.txt",
    "notes/o.txt",
    "notes/p.txt",
    "notes/q.txt",
    "notes/r.txt",
    "notes/s.txt",
    "notes/t.txt",
    "notes/u.txt",
  ]
  record(
    fixture,
    "Bash",
    JSON.stringify({ command: `touch ${paths.join(" ")}` }),
  )
  for (const filePath of paths) write(fixture.repo, filePath)
  const context = asked(check(fixture))
  for (const filePath of paths.slice(0, 20)) {
    expect(context).toContain(`\n${filePath}\n`)
  }
  expect(context).not.toContain("notes/u.txt")
  expect(context).toContain("Total: 21 paths.")
  const remembered = JSON.parse(
    readFileSync(path.join(fixture.stateDir, "asked.json"), "utf8"),
  )
  expect(remembered).toHaveLength(21)
  allowed(fixture, check(fixture))
})

it("does not accept inline or list-item acknowledgements, even with stop_hook_active", () => {
  const fixture = addedTool()
  const context = asked(
    run(
      fixture,
      "check",
      '{"last_assistant_message":"Summary: Proper-form check: x\\n- Proper-form check: x","stop_hook_active":true}',
    ),
  )
  expect(context).toContain("\ntools/new.mjs\n")
})

it("asks only about new paths added after an earlier Stop request", () => {
  const fixture = addedTool()
  asked(check(fixture))
  record(fixture, "PowerShell", '{"command":"Set-Content next.mjs content"}')
  write(fixture.repo, "tools/next.mjs")
  const context = asked(check(fixture))
  expect(context).toContain("\ntools/next.mjs\n")
  expect(context).not.toContain("\ntools/new.mjs\n")
  allowed(fixture, check(fixture))
})
