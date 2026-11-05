// This repository's Claude Code hook records PreToolUse inputs with `record`
// and checks Stop with `check`. In AGENTS.md, Principles, "Always build the
// proper form" asks whether a mechanism is needed before adding it and what
// its precedent is. At the end of a turn in which this session added a file or
// changed the scripts or dependencies of a `package.json`, the hook asks for a
// line starting with `Proper-form check:`.
//
// Known holes: files created by Codex or another process have no input in this
// session; editing an existing file can add a mechanism, such as a config entry;
// work can finish after Stop; a user interrupt runs no Stop, so those inputs are
// checked at the next Stop. Subagents' tool calls count with the same session id.
import { execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import os from "node:os"
import path from "node:path"

const PACKAGE_MANAGERS = new Set(["pnpm", "npm", "yarn"])
const PACKAGE_SUBCOMMANDS = new Set([
  "add",
  "remove",
  "rm",
  "install",
  "i",
  "up",
  "update",
  "uninstall",
])

/** Normalize separators before resolving or comparing paths. */
function normalize(filePath) {
  return filePath.replaceAll("\\", "/")
}

/** Run read-only git commands without optional index locks. */
function git(cwd, args) {
  return execFileSync("git", ["--no-optional-locks", ...args], {
    cwd,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  })
}

/** Return the paths of additions relative to the baseline commit. */
function newPaths(topLevel, head) {
  const added = git(topLevel, [
    "diff",
    "--name-status",
    "-z",
    "--diff-filter=A",
    head,
  ]).split("\0")
  const paths = new Set()
  for (let index = 0; index + 1 < added.length; index += 2) {
    paths.add(normalize(added[index + 1]))
  }
  for (const filePath of git(topLevel, [
    "ls-files",
    "--others",
    "--exclude-standard",
    "-z",
  ]).split("\0")) {
    if (filePath) paths.add(normalize(filePath))
  }
  return [...paths]
}

/** Hash only the package fields that describe scripts and dependencies. */
function packageHashes(topLevel) {
  const hashes = {}
  const paths = git(topLevel, [
    "ls-files",
    "--cached",
    "--others",
    "--exclude-standard",
    "-z",
    "--",
    "package.json",
    "*/package.json",
  ]).split("\0")
  for (const filePath of new Set(paths)) {
    if (!filePath) continue
    const absolute = path.join(topLevel, normalize(filePath))
    if (!existsSync(absolute)) continue
    const pkg = JSON.parse(readFileSync(absolute, "utf8"))
    const fields = {}
    for (const field of [
      "scripts",
      "dependencies",
      "devDependencies",
      "peerDependencies",
      "optionalDependencies",
    ]) {
      if (pkg[field] !== undefined) {
        fields[field] = Object.fromEntries(Object.entries(pkg[field]).sort())
      }
    }
    hashes[normalize(filePath)] = createHash("sha256")
      .update(JSON.stringify(fields))
      .digest("hex")
  }
  return hashes
}

/** Save one exclusive baseline and append this tool's attribution. */
function record(input, stateDir) {
  const cwd = normalize(input.cwd)
  const topLevel = normalize(
    git(cwd, ["-C", cwd, "rev-parse", "--show-toplevel"]).trim(),
  )
  mkdirSync(stateDir, { recursive: true })
  const baselinePath = path.join(
    stateDir,
    `baseline-${createHash("sha1").update(topLevel).digest("hex")}.json`,
  )
  if (!existsSync(baselinePath)) {
    const head = git(topLevel, ["rev-parse", "HEAD"]).trim()
    const baseline = {
      topLevel,
      head,
      newPaths: newPaths(topLevel, head),
      packages: packageHashes(topLevel),
    }
    try {
      writeFileSync(baselinePath, JSON.stringify(baseline), { flag: "wx" })
    } catch (error) {
      if (error.code !== "EEXIST") throw error
    }
  }
  const filePath = input.tool_input.file_path ?? input.tool_input.notebook_path
  appendFileSync(
    path.join(stateDir, "inputs.jsonl"),
    `${JSON.stringify({
      tool: input.tool_name,
      filePath: filePath
        ? normalize(path.resolve(cwd, normalize(filePath)))
        : "",
      command: input.tool_input.command ?? "",
    })}\n`,
  )
}

/** Check whether an input explicitly names this path. */
function names(input, topLevel, filePath) {
  const absolute = normalize(path.resolve(topLevel, filePath))
  if (["Write", "Edit", "NotebookEdit"].includes(input.tool)) {
    return input.filePath === absolute
  }
  if (["Bash", "PowerShell"].includes(input.tool)) {
    const command = normalize(input.command)
    return [filePath, absolute, path.posix.basename(filePath)].some((name) =>
      command.includes(name),
    )
  }
  return false
}

/** Recognize package-manager commands that can change package fields. */
function changesPackages(input) {
  if (!["Bash", "PowerShell"].includes(input.tool)) return false
  const words = input.command.split(/[\s&;|]+/u)
  for (let index = 0; index < words.length; index++) {
    if (!PACKAGE_MANAGERS.has(words[index])) continue
    let afterOption = false
    for (let next = index + 1; next < words.length; next++) {
      const word = words[next]
      if (PACKAGE_SUBCOMMANDS.has(word)) return true
      if (word === "run" || word === "exec") break
      if (word.startsWith("-")) {
        afterOption = true
        continue
      }
      if (afterOption) {
        afterOption = false
        continue
      }
      break
    }
  }
  return false
}

/** Exclude instances of the file kinds that repository policy requires. */
function excluded(topLevel, filePath) {
  const segments = filePath.split("/")
  return (
    segments
      .slice(0, -1)
      .some((part) => ["fixtures", "__snapshots__"].includes(part)) ||
    (segments.length === 2 &&
      segments[0] === ".changeset" &&
      filePath.endsWith(".md")) ||
    (filePath.endsWith(".ja.md") &&
      existsSync(path.join(topLevel, `${filePath.slice(0, -6)}.md`)))
  )
}

/** Read the proper-form bullet and its indented continuation at run time. */
function properFormBullet(topLevel) {
  const agentsPath = path.join(topLevel, "AGENTS.md")
  if (!existsSync(agentsPath)) return ""
  const lines = readFileSync(agentsPath, "utf8").split(/\r?\n/u)
  const start = lines.findIndex((line) =>
    line.startsWith("- Always build the proper form"),
  )
  if (start === -1) return ""
  let end = start + 1
  while (end < lines.length && lines[end].startsWith("  ")) end++
  return lines.slice(start, end).join("\n")
}

/** Ask once about additions attributable to this session, then clear on allow. */
function check(input, stateDir) {
  if (!input.last_assistant_message || !existsSync(stateDir)) {
    rmSync(stateDir, { recursive: true, force: true })
    return
  }
  const baselineFiles = readdirSync(stateDir).filter(
    (name) => name.startsWith("baseline-") && name.endsWith(".json"),
  )
  if (baselineFiles.length === 0) {
    rmSync(stateDir, { recursive: true, force: true })
    return
  }
  const inputs = readFileSync(path.join(stateDir, "inputs.jsonl"), "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line))
  const askedPath = path.join(stateDir, "asked.json")
  const asked = new Set(
    existsSync(askedPath) ? JSON.parse(readFileSync(askedPath, "utf8")) : [],
  )
  const candidates = new Map()
  const bullets = new Map()
  for (const baselineFile of baselineFiles) {
    const baseline = JSON.parse(
      readFileSync(path.join(stateDir, baselineFile), "utf8"),
    )
    const { topLevel } = baseline
    const bullet = properFormBullet(topLevel)
    if (!bullet) continue
    bullets.set(topLevel, bullet)
    const before = new Set(baseline.newPaths)
    const added = new Set(
      newPaths(topLevel, baseline.head).filter(
        (filePath) =>
          !before.has(filePath) &&
          inputs.some((entry) => names(entry, topLevel, filePath)),
      ),
    )
    const packages = packageHashes(topLevel)
    for (const filePath of new Set([
      ...Object.keys(baseline.packages),
      ...Object.keys(packages),
    ])) {
      if (
        packages[filePath] !== baseline.packages[filePath] &&
        inputs.some(
          (entry) => names(entry, topLevel, filePath) || changesPackages(entry),
        )
      ) {
        added.add(filePath)
      }
    }
    for (const filePath of added) {
      const absolute = normalize(path.resolve(topLevel, filePath))
      if (!excluded(topLevel, filePath) && !asked.has(absolute)) {
        candidates.set(absolute, filePath)
      }
    }
  }
  if (
    candidates.size === 0 ||
    /^ *Proper-form check:/mu.test(input.last_assistant_message)
  ) {
    rmSync(stateDir, { recursive: true, force: true })
    return
  }
  writeFileSync(askedPath, JSON.stringify([...asked, ...candidates.keys()]))
  const text = [
    "This session added files or changed package scripts or dependencies:",
    ...[...candidates.values()].slice(0, 20),
    ...(candidates.size > 20 ? [`Total: ${candidates.size} paths.`] : []),
    "The top-level AGENTS.md states:",
    ...bullets.values(),
    "The reply needs one line per added thing, starting at the beginning of a line, outside a list item:",
    "Proper-form check: <path> | maintains: <what it keeps> | needed because: <a checkable fact; an earlier decision of one's own is no reason> | precedent: <a path of the same kind in the repository, or none>",
    "The alternative when no mechanism was added is:",
    "Proper-form check: no mechanism added (<why, in a few words>)",
  ].join("\n")
  process.stdout.write(
    `${JSON.stringify({
      hookSpecificOutput: { hookEventName: "Stop", additionalContext: text },
    })}\n`,
  )
}

/** Read hook input from the stream and dispatch the selected subcommand. */
async function main() {
  let source = ""
  process.stdin.setEncoding("utf8")
  for await (const chunk of process.stdin) source += chunk
  const input = JSON.parse(source)
  const stateDir = path.join(
    os.tmpdir(),
    "mmd-toolkit-proper-form",
    input.session_id,
  )
  if (process.argv[2] === "record") record(input, stateDir)
  else if (process.argv[2] === "check") check(input, stateDir)
  else throw new Error("Expected record or check")
}

try {
  await main()
} catch (error) {
  process.stderr.write(`proper-form: ${error.message}\n`)
  process.exitCode = 1
}
