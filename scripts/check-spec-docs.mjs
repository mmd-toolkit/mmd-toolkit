// Fails when the specification's documents (packages/spec) are inconsistent:
// a relative link whose file or anchor does not exist, a fixture citation
// (`[fixture: <diagram>/<name>]`) whose fixture does not exist, an English
// document and its Japanese pair that cite different fixtures, or a pair whose
// headings have different levels.
import { existsSync, readFileSync, readdirSync } from "node:fs"
import path from "node:path"

const specRoot = path.resolve("packages/spec")
const fixturesRoot = path.resolve("packages/tests/fixtures")

/**
 * The Markdown documents under `directory`.
 */
function markdownFiles(directory) {
  const found = []
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === "node_modules") continue
    const full = path.join(directory, entry.name)
    if (entry.isDirectory()) found.push(...markdownFiles(full))
    else if (full.endsWith(".md")) found.push(full)
  }
  return found
}

/**
 * The heading lines of a document, without the lines of its code blocks.
 */
function headingLines(file) {
  const headings = []
  let inCodeBlock = false
  for (const line of readFileSync(file, "utf8").split("\n")) {
    if (line.startsWith("```")) inCodeBlock = !inCodeBlock
    if (!inCodeBlock && line.startsWith("#")) headings.push(line)
  }
  return headings
}

/**
 * The anchors GitHub gives the headings of a document: lower case, without
 * punctuation, whitespace as `-`, and `-1`, `-2` for a repeated heading.
 */
function anchorsOf(file) {
  const anchors = new Set()
  const timesSeen = new Map()
  for (const heading of headingLines(file)) {
    const text = heading.replace(/^#+\s+/u, "").replaceAll("`", "")
    let anchor = text
      .trim()
      .toLowerCase()
      .replace(/[^\s\p{L}\p{N}\-_]/gu, "")
      .replace(/\s/gu, "-")
    const seen = timesSeen.get(anchor)
    timesSeen.set(anchor, (seen ?? -1) + 1)
    if (seen !== undefined) anchor = `${anchor}-${seen + 1}`
    anchors.add(anchor)
  }
  return anchors
}

/**
 * The heading levels of a document, in order, as one string to compare.
 */
function headingLevels(file) {
  return headingLines(file)
    .map((heading) => heading.split(" ")[0])
    .join(" ")
}

const problems = []
const citationsByFile = new Map()
const files = markdownFiles(specRoot)
for (const file of files) {
  const text = readFileSync(file, "utf8")
  const shown = path.relative(specRoot, file)
  for (const match of text.matchAll(/\]\(([^\s)]+)\)/gu)) {
    const [linkedPath, anchor] = match[1].split("#")
    if (linkedPath.startsWith("http")) continue
    const target =
      linkedPath === "" ? file : path.resolve(path.dirname(file), linkedPath)
    if (!existsSync(target)) {
      problems.push(`missing file: ${shown} -> ${match[1]}`)
    } else if (
      anchor !== undefined &&
      target.endsWith(".md") &&
      !anchorsOf(target).has(decodeURIComponent(anchor))
    ) {
      problems.push(`missing anchor: ${shown} -> ${match[1]}`)
    }
  }
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
for (const file of files) {
  if (!file.endsWith(".ja.md")) continue
  const english = file.replace(/\.ja\.md$/u, ".md")
  if (!existsSync(english)) continue
  const shown = path.relative(specRoot, english)
  if (
    citationsByFile.get(english).join("\n") !==
    citationsByFile.get(file).join("\n")
  ) {
    problems.push(`different fixture citations: ${shown} and its pair`)
  }
  if (headingLevels(english) !== headingLevels(file)) {
    problems.push(`different heading structure: ${shown} and its pair`)
  }
}

if (problems.length > 0) {
  process.stderr.write("The specification's documents are inconsistent:\n")
  for (const problem of problems) process.stderr.write(`  ${problem}\n`)
  process.exitCode = 1
} else {
  let citationCount = 0
  for (const citations of citationsByFile.values()) {
    citationCount += citations.length
  }
  process.stdout.write(
    `check-spec-docs: ${files.length} documents, ${citationCount} fixture citations, no problems.\n`,
  )
}
