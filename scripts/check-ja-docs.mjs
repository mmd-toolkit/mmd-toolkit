// Reports the state of the Japanese versions of the Markdown documents.
// English is the source. The Japanese version next to a document
// (`<name>.ja.md`) is written by the AI agents that follow the agent
// instructions of this repository, so a change written by hand may lack it
// until an agent adds it. The check fails only when a `.ja.md` has no English
// original.
// Documents without a Japanese version, and Japanese versions whose English
// original was committed after them, are listed as information and do not fail
// the check. Only committed history is read: a change in the working tree is
// not seen, a commit that touches only the Japanese version counts as bringing
// it up to date, and a shallow clone has no history to compare.
// Which documents are covered: scripts/markdown-files.mjs.
import { execFileSync } from "node:child_process"
import { markdownFiles } from "./markdown-files.mjs"

const root = process.cwd()
const files = new Set(markdownFiles(root))

/**
 * The time of the last commit that touched each file, from one pass over the
 * history (most recent commit first, so the first time seen is the last touch).
 */
function lastCommitTimes() {
  const log = execFileSync("git", ["log", "--format=%ct", "--name-only"], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 256,
  })
  const times = new Map()
  let time = 0
  for (const line of log.split("\n")) {
    if (line === "") continue
    if (/^\d+$/u.test(line)) {
      time = Number(line)
      continue
    }
    if (!times.has(line)) times.set(line, time)
  }
  return times
}

const shallow =
  execFileSync("git", ["rev-parse", "--is-shallow-repository"], {
    cwd: root,
    encoding: "utf8",
  }).trim() === "true"
const commitTimes = shallow ? new Map() : lastCommitTimes()
const orphans = []
const missing = []
const outdated = []
for (const file of files) {
  if (file.endsWith(".ja.md")) {
    const english = file.replace(/\.ja\.md$/u, ".md")
    if (!files.has(english))
      orphans.push(`${file}: no English original ${english}`)
    continue
  }
  const japanese = file.replace(/\.md$/u, ".ja.md")
  if (!files.has(japanese)) {
    missing.push(file)
    continue
  }
  if (
    !shallow &&
    (commitTimes.get(file) ?? 0) > (commitTimes.get(japanese) ?? 0)
  )
    outdated.push(file)
}

if (orphans.length > 0) {
  process.stderr.write("A Japanese document must have an English original:\n")
  for (const p of orphans) process.stderr.write(`  ${p}\n`)
  process.exitCode = 1
} else {
  const age = shallow
    ? "age not compared (shallow clone)"
    : `${outdated.length} whose English original is newer`
  process.stdout.write(
    `check-ja-docs: ${files.size} Markdown files; ${missing.length} without a Japanese version, ${age}.\n`,
  )
  for (const file of missing) process.stdout.write(`  missing: ${file}\n`)
  for (const file of outdated) process.stdout.write(`  outdated: ${file}\n`)
}
