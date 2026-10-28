import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

// The field tables of the tree documents of the specification: for each node
// type (and each record), its fields and the text of the Type column of each.

const HERE = path.dirname(fileURLToPath(import.meta.url))

/** `packages/spec/docs`. */
const SPEC_DOCS = path.join(HERE, "../../spec/docs")

/** `packages/parser/docs`. */
const PARSER_DOCS = path.join(HERE, "../../parser/docs")

/** The diagrams that have a tree document. */
export const TREE_DOCUMENT_DIAGRAMS = [
  "treeview",
  "eventmodeling",
  "cynefin",
  "wardley",
  "railroad",
  "treemap",
  "radar",
  "architecture",
  "gitgraph",
  "info",
  "packet",
  "pie",
  "usecase",
  "agentflow",
  "flowchart",
  "sequence",
  "class",
  "state",
  "er",
  "gantt",
  "journey",
  "requirement",
  "mindmap",
  "timeline",
  "sankey",
  "xychart",
  "quadrant",
  "block",
  "kanban",
  "c4",
  "venn",
  "ishikawa",
] as const

/** The fields that every node and every record has, which no table lists. */
const COMMON_FIELDS: ReadonlySet<string> = new Set(["type", "range", "loc"])

/** The Type column of the field tables, by type name and field name. */
export type FieldTables = Map<string, Map<string, string>>

/** The words of `heading` that are type names: a heading may name several, as `A, B, and C`. */
function typeNamesIn(heading: string): string[] {
  const names: string[] = []
  let word = ""
  for (const character of `${heading} `) {
    if (/^[A-Za-z]$/u.test(character) || (word === "C" && character === "4")) {
      word += character
    } else {
      if (word.length > 0) names.push(word)
      word = ""
    }
  }
  return names.filter((name) => /^[A-Z]/u.test(name) && /[a-z]/u.test(name))
}

/**
 * Adds to `tables` the rows of the field tables (header `Field`) under the
 * headings of the document `file`. `namesOf` gives the type names that a
 * heading's tables describe, or none.
 */
function readTables(
  tables: FieldTables,
  file: string,
  namesOf: (heading: string) => string[],
  column: number,
): void {
  let names: string[] = []
  let inFieldTable = false
  for (const line of readFileSync(file, "utf8").split("\n")) {
    if (line.startsWith("#")) {
      names = namesOf(line.replace(/^#+\s*/u, ""))
      inFieldTable = false
      continue
    }
    if (!line.startsWith("|")) {
      inFieldTable = false
      continue
    }
    const cells = line
      .trim()
      .slice(1, -1)
      .split("|")
      .map((cell) => cell.trim())
    if (cells[0] === "Field") {
      inFieldTable = true
      continue
    }
    const field = (cells[0] ?? "").replaceAll("`", "")
    if (!inFieldTable || /^-+$/u.test(field) || COMMON_FIELDS.has(field)) {
      continue
    }
    for (const name of names) {
      const fields = tables.get(name) ?? new Map<string, string>()
      if (field !== "(none)") fields.set(field, cells[column] ?? "")
      tables.set(name, fields)
    }
  }
}

/** The Type column of the field tables of the tree documents: ast.md, `ast/<diagram>.md`, and the tables of parser/docs/tokens.md. */
export function readFieldTables(): FieldTables {
  return readColumn(1)
}

/** The Meaning column of the same field tables, by type name and field name. */
export function readFieldMeanings(): FieldTables {
  return readColumn(2)
}

/** The column `column` of the field tables, by type name and field name. */
function readColumn(column: number): FieldTables {
  const tables: FieldTables = new Map()
  readTables(tables, path.join(SPEC_DOCS, "ast.md"), typeNamesIn, column)
  for (const diagram of TREE_DOCUMENT_DIAGRAMS) {
    readTables(
      tables,
      path.join(SPEC_DOCS, "ast", `${diagram}.md`),
      typeNamesIn,
      column,
    )
  }
  // tokens.md describes the token, the comment, the lists of the root, and the
  // frontmatter tokens, under headings that are not type names.
  const tokenDocumentNames: Readonly<Record<string, string>> = {
    Tokens: "Token",
    "The lists of the root": "Root",
    Comment: "Comment",
    "Frontmatter tokens": "Frontmatter",
  }
  readTables(
    tables,
    path.join(PARSER_DOCS, "tokens.md"),
    (heading) => {
      const name = tokenDocumentNames[heading]
      return name === undefined ? [] : [name]
    },
    column,
  )
  return tables
}

/** The sentence that states the child fields of a node type that has some: followed by the names in code spans, separated by `, `, and ended by a period. */
const CHILD_FIELDS_PREFIX = "Child fields: "

/** The sentence that states that a node type has no child fields. */
const NO_CHILD_FIELDS = "No child fields."

/** Whether the text at `at` in `paragraph` starts a sentence: it is the start of the paragraph, or follows a period or a `]` and a space. */
function startsSentence(paragraph: string, at: number): boolean {
  return (
    at === 0 ||
    (paragraph[at - 1] === " " &&
      (paragraph[at - 2] === "." || paragraph[at - 2] === "]"))
  )
}

/**
 * The child fields that the sentences of `paragraph` state, in order, one
 * list for each sentence `Child fields: …` or `No child fields.` (ast.md,
 * Nodes). The text of ast.md that shows the form inside a code span starts no
 * sentence. Throws when a sentence `Child fields: ` is not followed by code
 * spans separated by `, ` and ended by a period.
 */
function childFieldSentencesIn(paragraph: string, where: string): string[][] {
  const lists: string[][] = []
  for (let at = 0; at < paragraph.length; at += 1) {
    if (!startsSentence(paragraph, at)) continue
    if (paragraph.startsWith(NO_CHILD_FIELDS, at)) {
      lists.push([])
    } else if (paragraph.startsWith(CHILD_FIELDS_PREFIX, at)) {
      const fields: string[] = []
      let rest = paragraph.slice(at + CHILD_FIELDS_PREFIX.length)
      for (;;) {
        const close = rest.startsWith("`") ? rest.indexOf("`", 1) : -1
        if (close < 0) {
          throw new Error(`${where}: child fields are not code spans`)
        }
        fields.push(rest.slice(1, close))
        rest = rest.slice(close + 1)
        if (rest.startsWith(", ")) rest = rest.slice(", ".length)
        else if (rest.startsWith(".")) break
        else throw new Error(`${where}: child fields are not ended by a period`)
      }
      lists.push(fields)
    }
  }
  return lists
}

/**
 * The child fields that the tree documents state for each node type, in the
 * order of the visit: the section of the type states them in the sentence
 * `Child fields: …` or `No child fields.` (ast.md, Nodes). A section without
 * the sentence is not in the result; a section with two sentences throws, and
 * so does a type that the headings of two sections name.
 */
export function readChildFields(): Map<string, string[]> {
  const result = new Map<string, string[]>()
  /** The section (file and heading) that stated the child fields of each type. */
  const sections = new Map<string, string>()
  const files = [
    path.join(SPEC_DOCS, "ast.md"),
    ...TREE_DOCUMENT_DIAGRAMS.map((diagram) =>
      path.join(SPEC_DOCS, "ast", `${diagram}.md`),
    ),
  ]
  for (const file of files) {
    let heading = ""
    let paragraph = ""
    let lists: string[][] = []

    /** Collects the sentences of the paragraph read so far. */
    function endParagraph(): void {
      lists.push(...childFieldSentencesIn(paragraph, `${file}: ${heading}`))
      paragraph = ""
    }

    /** Takes the sentence of the section that the heading above began. */
    function endSection(): void {
      endParagraph()
      if (lists.length > 1) {
        throw new Error(`${file}: ${heading} states its child fields twice`)
      }
      const [fields] = lists
      if (fields !== undefined) {
        for (const name of typeNamesIn(heading)) {
          const section = `${file}: ${heading}`
          const earlier = sections.get(name)
          if (earlier !== undefined) {
            throw new Error(
              `${name} is named by two sections: ${earlier} and ${section}`,
            )
          }
          sections.set(name, section)
          result.set(name, fields)
        }
      }
      lists = []
    }

    for (const line of readFileSync(file, "utf8").split("\n")) {
      if (line.startsWith("#")) {
        endSection()
        heading = line.replace(/^#+\s*/u, "")
      } else if (line.trim() === "") {
        endParagraph()
      } else {
        paragraph += paragraph === "" ? line : ` ${line}`
      }
    }
    endSection()
  }
  return result
}

/** The text of each tree document of the diagrams: `ast/<diagram>.md`. */
export function readTreeDocuments(): string[] {
  return TREE_DOCUMENT_DIAGRAMS.map((diagram) =>
    readFileSync(path.join(SPEC_DOCS, "ast", `${diagram}.md`), "utf8"),
  )
}

/** The table row whose Kind cell is `kind`, whether the kind or components column comes first. */
export function readTokenKindRow(file: string, kind: string): string {
  const cell = `\`${kind}\``
  const row = readFileSync(file, "utf8")
    .split("\n")
    .find(
      (line) =>
        line.startsWith("|") &&
        line.split("|").some((part) => part.trim() === cell),
    )
  if (row === undefined) throw new Error(`no token kind ${kind} in ${file}`)
  return row
}

/** Resolve a field's named union from the diagram's own AST prose, without parsing Mermaid. */
export function readChildTypeNames(diagram: string, cell: string): string[] {
  const prose = readFileSync(
    path.join(SPEC_DOCS, "ast", `${diagram}.md`),
    "utf8",
  )
  const flat = prose
    .split("\n")
    .map((line) => line.trim())
    .join(" ")
  const aliases: Readonly<Record<string, string>> = {
    TreeviewBodyItem: "TreeviewBodyItem is ",
    TreeviewAnnotation: "TreeviewAnnotation is ",
    TreemapBodyItem: "TreemapBodyItem is ",
    "non-hierarchy statements": "The non-hierarchy statements are ",
  }
  let expanded = cell
  for (const [name, prefix] of Object.entries(aliases)) {
    if (!expanded.includes(name)) continue
    const start = flat.indexOf(prefix)
    if (start < 0) throw new Error(`no ${name} definition in ast/${diagram}.md`)
    const rest = flat.slice(start + prefix.length)
    expanded = expanded.replaceAll(name, rest.slice(0, rest.indexOf(".")))
  }
  return typeNamesIn(expanded)
}
