// The Markdown documents of the repository that the document checks cover.
// Files under node_modules/, lib/, .changeset/, .git/, .work/, fixtures/,
// .claude/worktrees/, tmp/report-candidate/ (candidate reports to mermaid.js,
// kept apart from the documents) and generated browser test reports are exempt.
import { readdirSync, statSync } from "node:fs"
import path from "node:path"

const skipDirs = new Set([
  "node_modules",
  "lib",
  ".changeset",
  ".git",
  ".work",
  "fixtures",
  "test-results",
  "playwright-report",
])
const skipPaths = new Set([
  path.join(".claude", "worktrees"),
  path.join("tmp", "report-candidate"),
])

/**
 * Collects the Markdown files under `dir`, as paths relative to `root`,
 * skipping the exempt directories.
 */
function walk(root, dir, out) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) {
      if (!skipDirs.has(name) && !skipPaths.has(path.relative(root, full)))
        walk(root, full, out)
    } else if (name.endsWith(".md")) {
      out.push(path.relative(root, full))
    }
  }
  return out
}

/**
 * The Markdown documents under `root`, as paths relative to it.
 */
export function markdownFiles(root) {
  return walk(root, root, [])
}
