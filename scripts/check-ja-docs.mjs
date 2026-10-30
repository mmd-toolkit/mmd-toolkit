// Reports the state of the Japanese versions of the Markdown documents.
// English is the source: a contributor writes the English document, and the
// maintainers produce the Japanese version next to it (`<name>.ja.md`)
// afterwards. The check fails only when a `.ja.md` has no English original.
// Documents without a Japanese version, and Japanese versions whose English
// original was committed after them, are listed as information for the
// maintainers and do not fail the check.
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

const commitTimes = lastCommitTimes()
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
  if ((commitTimes.get(file) ?? 0) > (commitTimes.get(japanese) ?? 0))
    outdated.push(file)
}

if (orphans.length > 0) {
  process.stderr.write("A Japanese document must have an English original:\n")
  for (const p of orphans) process.stderr.write(`  ${p}\n`)
  process.exitCode = 1
} else {
  process.stdout.write(
    `check-ja-docs: ${files.size} Markdown files; ${missing.length} without a Japanese version, ${outdated.length} whose English original is newer.\n`,
  )
  for (const file of missing) process.stdout.write(`  missing: ${file}\n`)
  for (const file of outdated) process.stdout.write(`  outdated: ${file}\n`)
}
