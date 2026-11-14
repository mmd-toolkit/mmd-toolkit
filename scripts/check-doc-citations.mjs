// Fails when a defining document cites a fixture that does not exist, or a
// citation is outside a citation paragraph or the final Fixtures table cell.
// Fixture existence is checked in the specification (packages/spec) and the
// documents of the parser and tests (packages/parser/docs, packages/tests/docs).
// Citation form is also checked in packages/prettier-plugin-mmd/docs, including
// its corpus fixture and test citations; its own tests check their existence.
// Code and placeholders are not citations. Citation paragraphs cannot start a
// document or immediately follow a heading. Links and their anchors are checked
// by `pnpm run lint:md`. Japanese versions behind their English are information,
// not errors: they cite other fixtures or have other heading levels.
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
    if (entry.isDirectory()) {
      for (const file of markdownFiles(full)) found.push(file)
    } else if (full.endsWith(".md")) found.push(full)
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

/**
 * Citation occurrences in source text, with offsets, excluding placeholders.
 * The formatter also cites named tests, whose names can contain spaces.
 */
function sourceCitations(text, formatter) {
  const pattern = formatter
    ? /\[(?:fixture|corpus\s+fixture):\s+([^\s\]]+)\]|\[test:\s+([^\]]+)\]/gu
    : /\[fixture:\s+([^\s\]]+)\]/gu
  return [...text.matchAll(pattern)].filter((match) =>
    match[1] === undefined
      ? !/<[^<>]+>/u.test(match[2])
      : !match[1].includes("<"),
  )
}

/**
 * Whether a paragraph or table cell consists only of citations and whitespace.
 */
function citationsOnly(text, formatter) {
  const citations = sourceCitations(text, formatter)
  if (citations.length === 0) return false
  let end = 0
  for (const citation of citations) {
    const between = text.slice(end, citation.index)
    if (between.trim() !== "" || (end > 0 && between.length === 0)) {
      return false
    }
    end = citation.index + citation[0].length
  }
  return text.slice(end).trim() === ""
}

/**
 * Form problems in a document, using Markdown source ranges so inline and
 * fenced code cannot be mistaken for citations.
 */
function citationFormProblems(file, text) {
  const parsed = markdown.languages.gfm.parse(
    { body: text },
    { languageOptions: { frontmatter: "yaml" } },
  )
  if (!parsed.ok) throw new Error(`${file}: cannot be read as Markdown`)
  const shown = path.relative(repositoryRoot, file)
  const formatter = shown.startsWith("packages/prettier-plugin-mmd/docs/")
  const fixtureHeader = file.endsWith(".ja.md") ? "fixture" : "Fixtures"
  const ignored = []
  const allowed = []
  const found = []

  /** The source text of a node, including original Markdown syntax. */
  function source(node) {
    return text.slice(node.position.start.offset, node.position.end.offset)
  }

  /** The content of a table cell, whose source range includes its pipes. */
  function cellSource(node) {
    if (node.children.length === 0) return ""
    return text.slice(
      node.children[0].position.start.offset,
      node.children.at(-1).position.end.offset,
    )
  }

  /** Record allowed and ignored ranges and misplaced citation paragraphs. */
  function visit(node, parent, index, forbidden) {
    const blocked =
      forbidden ||
      node.type === "blockquote" ||
      node.type === "footnoteDefinition" ||
      node.type === "html"
    if (node.type === "code" || node.type === "inlineCode") {
      ignored.push(node.position)
      return
    }
    if (
      node.type === "paragraph" &&
      !blocked &&
      citationsOnly(source(node), formatter)
    ) {
      allowed.push(node.position)
      const previous = parent.children
        .slice(0, index)
        .filter((sibling) => sibling.type !== "yaml")
        .at(-1)
      if (
        previous?.type === "heading" ||
        (parent.type === "root" && previous === undefined)
      ) {
        const place = previous ? "after a heading" : "at the document start"
        found.push(
          `citation form: ${shown}:${node.position.start.line}: citation paragraph ${place}`,
        )
      }
    }
    if (node.type === "table" && !blocked) {
      const header = node.children[0]
      const column = header.children.length - 1
      if (cellSource(header.children[column]).trim() === fixtureHeader) {
        for (const row of node.children.slice(1)) {
          const cell = row.children[column]
          if (cell && citationsOnly(cellSource(cell), formatter)) {
            allowed.push(cell.position)
          }
        }
      }
    }
    if (node.children) {
      for (
        let childIndex = 0;
        childIndex < node.children.length;
        childIndex++
      ) {
        visit(node.children[childIndex], node, childIndex, blocked)
      }
    }
  }

  visit(parsed.ast, undefined, 0, false)
  for (const citation of sourceCitations(text, formatter)) {
    const start = citation.index
    const end = start + citation[0].length
    if (
      ignored.some(
        (position) =>
          start >= position.start.offset && end <= position.end.offset,
      ) ||
      allowed.some(
        (position) =>
          start >= position.start.offset && end <= position.end.offset,
      )
    ) {
      continue
    }
    const line = text.slice(0, start).split("\n").length
    found.push(
      `citation form: ${shown}:${line}: citation outside a citation paragraph or final Fixtures cell`,
    )
  }
  return found
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
const formFiles = files.concat(
  markdownFiles(path.resolve("packages/prettier-plugin-mmd/docs")),
)
for (const file of formFiles) {
  for (const problem of citationFormProblems(
    file,
    readFileSync(file, "utf8"),
  )) {
    problems.push(problem)
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
