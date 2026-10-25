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

/**
 * The child fields that the tree documents state for each node type, in the
 * order of the visit: the fields named in the sentence introduced by
 * `Child fields:`. A type with no such sentence is not in the result.
 */
export function readChildFields(): Map<string, string[]> {
  const result = new Map<string, string[]>()
  const files = [
    path.join(SPEC_DOCS, "ast.md"),
    ...TREE_DOCUMENT_DIAGRAMS.map((diagram) =>
      path.join(SPEC_DOCS, "ast", `${diagram}.md`),
    ),
  ]
  for (const file of files) {
    let names: string[] = []
    let paragraph = ""

    /** Reads the paragraph collected so far, if it states child fields. */
    function flush(): void {
      const prefix = "Child fields:"
      const at = paragraph.indexOf(prefix)
      if (at !== -1) {
        // The first sentence ends at a period, or at a colon after the list:
        // `Child fields: `a`, `b`, in source order: …`.
        const rest = paragraph.slice(at + prefix.length)
        const end = rest.search(/[.:]/u)
        const sentence = end < 0 ? rest : rest.slice(0, end)
        const quoted = [...sentence.matchAll(/`(\w+)`/gu)].map(
          (match) => match[1] ?? "",
        )
        // Child-field lists may also use unquoted field names.
        const fields =
          quoted.length > 0
            ? quoted
            : sentence
                .split(",")
                .map((field) => field.trim())
                .filter((field) => field !== "")
        for (const name of names) result.set(name, fields)
      }
      paragraph = ""
    }

    for (const line of readFileSync(file, "utf8").split("\n")) {
      if (line.startsWith("#")) {
        flush()
        names = typeNamesIn(line.replace(/^#+\s*/u, ""))
      } else if (line.trim() === "") {
        flush()
      } else {
        paragraph += paragraph === "" ? line : ` ${line}`
      }
    }
    flush()
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
