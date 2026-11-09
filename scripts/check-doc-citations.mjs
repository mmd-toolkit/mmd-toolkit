// Fails when the documents that define the syntax and the tree cite a fixture
// that does not exist: the specification (packages/spec) and the documents of
// the parser and of the tests that it points to (packages/parser/docs,
// packages/tests/docs). It reports a fixture citation
// (`[fixture: <diagram>/<name>]`) whose fixture does not exist. Links and their
// anchors are checked in every document by `pnpm run lint:md`. A Japanese
// version that cites other fixtures than its English original, or whose
// headings have other levels, is listed as information: it is behind the
// English, which is not an error.
import { existsSync, readFileSync, readdirSync } from "node:fs"
import path from "node:path"
import markdown from "@eslint/markdown"

const documentRoots = [
  "packages/spec",
  "packages/parser/docs",
  "packages/tests/docs",
].map((root) => path.resolve(root))
const repositoryRoot = path.resolve(".")
const fixturesRoot = path.resolve("packages/tests/fixtures")

/**
 * The Markdown documents under `directory`.
 */
function markdownFiles(directory) {
  const found = []
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".work") continue
    const full = path.join(directory, entry.name)
    if (entry.isDirectory()) found.push(...markdownFiles(full))
    else if (full.endsWith(".md")) found.push(full)
  }
  return found
}

/**
 * The levels of the headings at the top level of a document, as
 * `@eslint/markdown` reads them, in order, as one string to compare.
 */
function headingLevels(file) {
  const parsed = markdown.languages.gfm.parse(
    { body: readFileSync(file, "utf8") },
    { languageOptions: { frontmatter: "yaml" } },
  )
  if (!parsed.ok) throw new Error(`${file}: cannot be read as Markdown`)
  return parsed.ast.children
    .filter((node) => node.type === "heading")
    .map((node) => "#".repeat(node.depth))
    .join(" ")
}

const problems = []
const citationsByFile = new Map()
const files = documentRoots.flatMap((root) => markdownFiles(root))
for (const file of files) {
  const text = readFileSync(file, "utf8")
  const shown = path.relative(repositoryRoot, file)
  // Prettier may break the line after "[fixture:", so the citation is read
  // across whitespace. A placeholder such as "[fixture: <category>/<name>]" is
  // not a citation.
  const citations = [...text.matchAll(/\[fixture:\s+([^\s\]]+)\]/gu)]
    .map((match) => match[1])
    .filter((citation) => !citation.includes("<"))
  citationsByFile.set(file, citations.toSorted())
  for (const citation of citations) {
    if (!existsSync(path.join(fixturesRoot, citation, "input.mmd"))) {
      problems.push(`missing fixture: ${shown} cites ${citation}`)
    }
  }
}
// Japanese versions behind their English (see the top of this file).
const behind = []
for (const file of files) {
  if (!file.endsWith(".ja.md")) continue
  const english = file.replace(/\.ja\.md$/u, ".md")
  if (!existsSync(english)) continue
  const shown = path.relative(repositoryRoot, english)
  if (
    citationsByFile.get(english).join("\n") !==
    citationsByFile.get(file).join("\n")
  ) {
    behind.push(`${shown}: its Japanese version cites other fixtures`)
  }
  if (headingLevels(english) !== headingLevels(file)) {
    behind.push(`${shown}: its Japanese version has another heading structure`)
  }
}

if (problems.length > 0) {
  process.stderr.write("The documents are inconsistent:\n")
  for (const problem of problems) process.stderr.write(`  ${problem}\n`)
  process.exitCode = 1
} else {
  let citationCount = 0
  for (const citations of citationsByFile.values()) {
    citationCount += citations.length
  }
  process.stdout.write(
    `check-doc-citations: ${files.length} documents, ${citationCount} fixture citations, no problems; ${behind.length} Japanese versions behind their English.\n`,
  )
  for (const line of behind) process.stdout.write(`  behind: ${line}\n`)
}
