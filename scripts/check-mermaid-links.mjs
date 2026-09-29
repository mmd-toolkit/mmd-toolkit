// Fails when a Markdown document links to the source of mermaid.js at
// anything other than the pinned commit, which is recorded once, in
// packages/spec/docs/index.md.
import { readFileSync } from "node:fs"
import path from "node:path"
import { markdownFiles } from "./markdown-files.mjs"

const root = process.cwd()
const repository = "https://github.com/mermaid-js/mermaid/"
const kinds = ["blob/", "tree/"]
const commitRecord = path.join("packages", "spec", "docs", "index.md")
const COMMIT_LENGTH = 40

/**
 * The refs (the path segment after `blob/` or `tree/`) of the links into the
 * mermaid.js repository in `text`.
 */
function mermaidRefsOf(text) {
  const refs = []
  for (const kind of kinds) {
    const prefix = repository + kind
    let from = text.indexOf(prefix)
    while (from !== -1) {
      const start = from + prefix.length
      let end = start
      while (end < text.length && !"/)# \n".includes(text[end])) end++
      refs.push(text.slice(start, end))
      from = text.indexOf(prefix, end)
    }
  }
  return refs
}

/**
 * Whether a ref is a full commit hash.
 */
function isCommit(ref) {
  if (ref.length !== COMMIT_LENGTH) return false
  for (const character of ref) {
    if (!"0123456789abcdef".includes(character)) return false
  }
  return true
}

const pinned = mermaidRefsOf(
  readFileSync(path.join(root, commitRecord), "utf8"),
).find(isCommit)
const problems = []
if (pinned === undefined) {
  problems.push(`${commitRecord}: no link into a commit of mermaid.js`)
} else {
  for (const file of markdownFiles(root)) {
    const text = readFileSync(path.join(root, file), "utf8")
    for (const ref of mermaidRefsOf(text)) {
      // A placeholder such as `<commit>` describes the form of a link.
      if (ref.startsWith("<")) continue
      if (ref !== pinned) {
        problems.push(`${file}: a link to mermaid.js at ${ref}, not ${pinned}`)
      }
    }
  }
}

if (problems.length > 0) {
  process.stderr.write(
    "Links to the source of mermaid.js must point into the pinned commit:\n",
  )
  for (const problem of problems) process.stderr.write(`  ${problem}\n`)
  process.exitCode = 1
} else {
  process.stdout.write(
    `check-mermaid-links: every link to mermaid.js points into ${pinned}.\n`,
  )
}
