// Fails when a source or documentation file contains an invisible or
// easily confused character that must be written as an escape instead: C0 and
// C1 control characters other than tab, line feed and carriage return, U+00A0,
// U+00AD, U+1680, U+2000..U+200F, U+2028, U+2029, U+202F, U+205F, U+3000 and
// U+FEFF (the set named in packages/spec/docs/index.md). The fixtures of the
// conformance corpus under packages/tests/fixtures/ intentionally contain such
// characters and are skipped, as are generated and third-party directories and
// the git worktrees under .claude/worktrees/. The fixtures and snapshots of the
// other packages are checked: a test that needs such a character writes it as
// an escape.
import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"

const root = process.cwd()
const skipDirs = new Set([
  "node_modules",
  ".git",
  "lib",
  "coverage",
  "worktrees",
])
const corpusFixtures = path.join(root, "packages", "tests", "fixtures")
const extensions = new Set([
  ".ts",
  ".mts",
  ".cts",
  ".js",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".yml",
  ".yaml",
  ".toml",
  ".mmd",
  ".eslintsnap",
  ".snap",
])

/**
 * Collects the files to check under `dir`, skipping exempt directories.
 */
function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) {
      if (!skipDirs.has(name) && full !== corpusFixtures) walk(full, out)
    } else if (extensions.has(path.extname(name))) {
      out.push(full)
    }
  }
  return out
}

/**
 * Whether `codePoint` must not appear literally in source or documentation.
 */
function isForbidden(codePoint) {
  if (codePoint === 0x09 || codePoint === 0x0a || codePoint === 0x0d)
    return false
  if (codePoint < 0x20 || (codePoint >= 0x7f && codePoint <= 0x9f)) return true
  return (
    codePoint === 0xa0 ||
    codePoint === 0xad ||
    codePoint === 0x1680 ||
    (codePoint >= 0x2000 && codePoint <= 0x200f) ||
    codePoint === 0x2028 ||
    codePoint === 0x2029 ||
    codePoint === 0x202f ||
    codePoint === 0x205f ||
    codePoint === 0x3000 ||
    codePoint === 0xfeff
  )
}

const problems = []
for (const file of walk(root, [])) {
  const text = readFileSync(file, "utf8")
  let line = 1
  for (const char of text) {
    const codePoint = char.codePointAt(0)
    if (codePoint === 0x0a) line += 1
    if (isForbidden(codePoint)) {
      problems.push(
        `${path.relative(root, file)}:${line}: U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`,
      )
    }
  }
}

if (problems.length > 0) {
  process.stderr.write("Invisible characters must be written as escapes:\n")
  for (const p of problems) process.stderr.write(`  ${p}\n`)
  process.exitCode = 1
} else {
  process.stdout.write(
    "check-invisible-chars: no literal invisible characters.\n",
  )
}
