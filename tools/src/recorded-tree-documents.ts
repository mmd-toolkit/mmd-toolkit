/**
 * The documents of the tree read as blocks: the paragraphs, the items of the
 * lists and the rows of the tables of the documents that state what a tree
 * holds, each with the key that ties the answers and the rows of the coverage
 * table to its text. `packages/tests/docs/recorded-trees.md` defines them.
 */
import { createHash } from "node:crypto"
import { existsSync, readFileSync, readdirSync } from "node:fs"
import path from "node:path"
import markdown from "@eslint/markdown"
import GithubSlugger from "github-slugger"

/** A node of the Markdown syntax tree, as far as these functions read it. */
interface MarkdownNode {
  readonly type: string
  readonly children?: readonly MarkdownNode[]
  readonly value?: string
  readonly url?: string
  readonly depth?: number
  readonly position?: {
    readonly start: { readonly line: number; readonly offset?: number }
    readonly end: { readonly line: number; readonly offset?: number }
  }
}

/** The documents of the tree that hold for every diagram type. */
export const SHARED_TREE_DOCUMENTS: readonly string[] = [
  "packages/spec/docs/ast.md",
  "packages/parser/docs/tokens.md",
  "packages/parser/docs/positions.md",
]

/** The directories of the documents of the tree of one diagram type, `<diagram>.md` each. */
const DIAGRAM_TREE_DOCUMENT_DIRECTORIES: readonly string[] = [
  "packages/spec/docs/ast",
  "packages/parser/docs/tokens",
  "packages/parser/docs/positions",
]

/** The documents whose sections a block of the documents of the tree links to. */
const LINKED_DOCUMENT_DIRECTORY = "packages/spec/docs"

/**
 * The name that the items give to the trees whose body is an `ErrorDiagram`:
 * they have no diagram type, and the shared documents hold for them.
 */
export const ERROR_DIAGRAM = "error"

/** Where the documents are read from: the working tree, or a commit. */
export interface DocumentReader {
  /** The text of `file`, relative to the root of the repository, or undefined when there is none. */
  read(file: string): string | undefined
  /** The names of the files directly in `directory`, relative to the root of the repository. */
  list(directory: string): string[]
}

/** Reads the documents of the working tree of the repository at `root`. */
export function workingTreeReader(root: string): DocumentReader {
  return {
    read(file) {
      const full = path.join(root, file)
      return existsSync(full) ? readFileSync(full, "utf8") : undefined
    },
    list(directory) {
      const full = path.join(root, directory)
      return existsSync(full) ? readdirSync(full) : []
    },
  }
}

/** A document of the tree, relative to the root of the repository. */
export interface TreeDocument {
  readonly path: string
  /** The diagram types whose trees it is about. */
  readonly diagrams: readonly string[]
}

/** The kind of block, which says where in a tree the block applies (its places). */
export type BlockCategory =
  | { readonly kind: "node"; readonly nodeType: string }
  | { readonly kind: "token"; readonly tokenKind: string }
  | { readonly kind: "other" }

/** A section that a block links to, read as the definition of its words. */
export interface LinkedSection {
  /** The document and the anchor, as `packages/spec/docs/<document>#<anchor>`. */
  readonly target: string
  /** The text of the section, or null when the anchor names no heading. */
  readonly text: string | null
}

/** A block of a document of the tree. */
export interface DocumentBlock {
  readonly document: string
  readonly line: number
  /** The text of the block as written, without the blocks inside it. */
  readonly text: string
  readonly category: BlockCategory
  readonly sections: readonly LinkedSection[]
  /** The fixtures that the block cites, as `<directory>/<name>`. */
  readonly cases: readonly string[]
  /** The key text of the block alone, without its sections (`keyTextOf`). */
  readonly ownKeyText: string
  /** `<document>:<the first 12 hexadecimal digits of the SHA-256 of the key text>`. */
  readonly key: string
}

/** The diagram types that have documents of the tree, by the names of those documents. */
export function diagramTypesOf(reader: DocumentReader): string[] {
  return englishMarkdownIn(reader, DIAGRAM_TREE_DOCUMENT_DIRECTORIES[0]).map(
    (name) => name.slice(0, -".md".length),
  )
}

/** The documents of the tree, with the diagram types each is about. */
export function treeDocuments(reader: DocumentReader): TreeDocument[] {
  const every = [...diagramTypesOf(reader), ERROR_DIAGRAM]
  const documents: TreeDocument[] = SHARED_TREE_DOCUMENTS.map((document) => ({
    path: document,
    diagrams: every,
  }))
  for (const directory of DIAGRAM_TREE_DOCUMENT_DIRECTORIES) {
    for (const name of englishMarkdownIn(reader, directory)) {
      documents.push({
        path: `${directory}/${name}`,
        diagrams: [name.slice(0, -".md".length)],
      })
    }
  }
  return documents
}

/** The names of the English Markdown documents directly in `directory`, sorted. */
function englishMarkdownIn(
  reader: DocumentReader,
  directory: string,
): string[] {
  return reader
    .list(directory)
    .filter((name) => name.endsWith(".md") && !name.endsWith(".ja.md"))
    .sort()
}

/** Reads a Markdown document as `@eslint/markdown` does for `pnpm run lint:md`. */
function parseMarkdown(text: string, document: string): MarkdownNode {
  const parsed = markdown.languages.gfm.parse(
    { body: text, path: document, physicalPath: document, bom: false },
    { languageOptions: { frontmatter: "yaml" } },
  )
  if (!parsed.ok) throw new Error(`${document}: cannot be read as Markdown`)
  return parsed.ast
}

/** The text of a node without its marks, as headings and table cells are read. */
function plainText(node: MarkdownNode): string {
  if (node.value !== undefined) return node.value
  return (node.children ?? []).map(plainText).join("")
}

/** `text` with every run of whitespace made one space, as Prettier may wrap it. */
export function normalizeSpace(text: string): string {
  return text
    .split(/\s+/u)
    .filter((part) => part !== "")
    .join(" ")
}

/** The fixture citations of a text whose whitespace is normalized, as `<directory>/<name>`. */
function citationsIn(normalized: string): string[] {
  return [...normalized.matchAll(/\[fixture: ([^\s\]]+)\]/gu)].map(
    (match) => match[1],
  )
}

/** A text without its fixture citations, with its whitespace normalized. */
export function withoutCitations(text: string): string {
  return normalizeSpace(
    normalizeSpace(text).replaceAll(/\[fixture: [^\]]*\]/gu, " "),
  )
}

/**
 * The key text of a block: the node type whose heading it is under, if any,
 * the text of the block, and the texts of the sections it links to, each with
 * its whitespace normalized and its fixture citations removed. The node type
 * says which nodes the condition is about: the same row of fields under two
 * node types states two conditions. A citation names a case of the condition
 * and does not change it, so adding one does not change the key.
 */
export function keyTextOf(
  nodeType: string | undefined,
  blockText: string,
  sections: readonly LinkedSection[],
): string {
  return [
    ...(nodeType === undefined ? [] : [`under ${nodeType}`]),
    withoutCitations(blockText),
    ...sections.map((section) =>
      section.text === null
        ? `${section.target} names no section`
        : withoutCitations(section.text),
    ),
  ].join("\n")
}

/** The first 12 hexadecimal digits of the SHA-256 of `text`. */
export function shortHash(text: string): string {
  return createHash("sha256").update(text).digest("hex").slice(0, 12)
}

/** A block of a Markdown document before it is read as a condition of the tree. */
interface RawBlock {
  readonly node: MarkdownNode
  /** The parts of the block that are its own: not the lists and tables in an item of a list. */
  readonly parts: readonly MarkdownNode[]
  /** The text of the own parts, as written. */
  readonly text: string
  /** The offset of the block in the document. */
  readonly offset: number
  /** The headings that the block is under, the outermost first. */
  readonly headings: readonly string[]
  /** The text of the first cell, for a row of a table whose first heading cell is `Kind`. */
  readonly kindCell: string | undefined
}

/**
 * The blocks of a Markdown document: every paragraph outside a list and a
 * table, every item of a list, and every row of the body of a table. The line
 * `Japanese version: …` is no block.
 */
function rawBlocksOf(text: string, document: string): RawBlock[] {
  const blocks: RawBlock[] = []
  const headings: { text: string; depth: number }[] = []

  /** Adds the block `node`, whose own parts are `parts`. */
  function add(
    node: MarkdownNode,
    parts: readonly MarkdownNode[],
    kindCell: string | undefined,
  ): void {
    blocks.push({
      node,
      parts,
      text: parts
        .map((part) =>
          text.slice(part.position?.start.offset, part.position?.end.offset),
        )
        .join("\n"),
      offset: node.position?.start.offset ?? 0,
      headings: headings.map((heading) => heading.text),
      kindCell,
    })
  }

  /** Reads the blocks in `node`. */
  function visit(node: MarkdownNode): void {
    switch (node.type) {
      case "heading": {
        while (headings.length > 0 && headings.at(-1)!.depth >= node.depth!) {
          headings.pop()
        }
        headings.push({ text: plainText(node), depth: node.depth! })
        return
      }
      case "paragraph": {
        if (!plainText(node).startsWith("Japanese version:")) {
          add(node, [node], undefined)
        }
        return
      }
      case "listItem": {
        add(
          node,
          node.children!.filter((child) => !isInnerBlock(child)),
          undefined,
        )
        node.children!.filter(isInnerBlock).forEach(visit)
        return
      }
      case "table": {
        const kinds = firstCellOf(node.children![0]) === "Kind"
        for (const row of node.children!.slice(1)) {
          add(row, [row], kinds ? firstCellOf(row) : undefined)
        }
        return
      }
      case "code":
      case "html":
      case "definition":
      case "yaml":
        return
      default:
        node.children?.forEach(visit)
    }
  }

  visit(parseMarkdown(text, document))
  return blocks
}

/** Whether `child` of an item of a list holds blocks of its own: a list or a table. */
function isInnerBlock(child: MarkdownNode): boolean {
  return child.type === "list" || child.type === "table"
}

/** The text of the first cell of a row of a table. */
function firstCellOf(row: MarkdownNode | undefined): string | undefined {
  const cell = row?.children?.[0]
  return cell === undefined ? undefined : plainText(cell)
}

/** What a block's category is decided from. */
export interface BlockVocabulary {
  /** The node types of the trees. */
  readonly nodeTypes: ReadonlySet<string>
  /** The token kinds of `packages/parser/docs/tokens.md`. */
  readonly tokenKinds: ReadonlySet<string>
}

/** The token kinds: the first column of the table of `tokens.md` whose first heading cell is `Kind`. */
export function tokenKindsOf(tokensDocument: string): Set<string> {
  const kinds = rawBlocksOf(tokensDocument, "tokens.md")
    .map((block) => block.kindCell)
    .filter((cell) => cell !== undefined)
  if (kinds.length === 0) {
    throw new Error("tokens.md has no table of the token kinds")
  }
  return new Set(kinds)
}

/** The sections of the linked documents of one version, read once each. */
export class LinkedSections {
  readonly #reader: DocumentReader

  readonly #byDocument = new Map<string, Map<string, Section>>()

  public constructor(reader: DocumentReader) {
    this.#reader = reader
  }

  /** The section of `document` at `anchor`, or undefined. */
  public section(document: string, anchor: string): Section | undefined {
    let sections = this.#byDocument.get(document)
    if (sections === undefined) {
      const text = this.#reader.read(document)
      sections = text === undefined ? new Map() : sectionsOf(text, document)
      this.#byDocument.set(document, sections)
    }
    return sections.get(anchor)
  }
}

/** A section of a linked document. */
export interface Section {
  readonly text: string
  /** The blocks of the section, its subsections included, as `ownKeyText` and the fixtures each cites. */
  readonly blocks: readonly {
    readonly ownKeyText: string
    readonly cases: readonly string[]
  }[]
}

/**
 * The sections of a document by the anchors of their headings: each from its
 * heading to the next heading of the same depth or a smaller one. The anchors
 * are made as `pnpm run lint:md` makes them to check a link (`github-slugger`).
 */
export function sectionsOf(
  text: string,
  document: string,
): Map<string, Section> {
  const headings = parseMarkdown(text, document).children!.filter(
    (node) => node.type === "heading",
  )
  const blocks = rawBlocksOf(text, document)
  const slugger = new GithubSlugger()
  const sections = new Map<string, Section>()
  headings.forEach((heading, index) => {
    const start = heading.position?.start.offset ?? 0
    const next = headings
      .slice(index + 1)
      .find((later) => later.depth! <= heading.depth!)
    const end = next?.position?.start.offset ?? text.length
    sections.set(slugger.slug(plainText(heading)), {
      text: text.slice(start, end),
      blocks: blocks
        .filter((block) => block.offset >= start && block.offset < end)
        .map((block) => ({
          ownKeyText: withoutCitations(block.text),
          cases: citationsIn(normalizeSpace(block.text)),
        })),
    })
  })
  return sections
}

/** The blocks of the document of the tree `document`, whose text is `text`. */
export function blocksOf(
  document: string,
  text: string,
  vocabulary: BlockVocabulary,
  sections: LinkedSections,
): DocumentBlock[] {
  const seen = new Map<string, number>()
  return rawBlocksOf(text, document).map((raw) => {
    const linked = linkedSectionsOf(document, raw.parts, sections)
    const nodeType = raw.headings.findLast((heading) =>
      vocabulary.nodeTypes.has(heading),
    )
    const hash = shortHash(keyTextOf(nodeType, raw.text, linked))
    const count = (seen.get(hash) ?? 0) + 1
    seen.set(hash, count)
    return {
      document,
      line: raw.node.position?.start.line ?? 0,
      text: raw.text,
      category:
        nodeType !== undefined
          ? { kind: "node", nodeType }
          : raw.kindCell !== undefined &&
              vocabulary.tokenKinds.has(raw.kindCell)
            ? { kind: "token", tokenKind: raw.kindCell }
            : { kind: "other" },
      sections: linked,
      cases: citationsIn(normalizeSpace(raw.text)),
      ownKeyText: keyTextOf(nodeType, raw.text, []),
      // Two blocks of one document with the same key text are told apart by
      // their order.
      key: `${document}:${hash}${count === 1 ? "" : `.${count}`}`,
    }
  })
}

/**
 * The sections that the links in `parts` point to: a heading of `common.md`
 * or of a document of `diagrams/`, each once, in the order of the links. A
 * link without an anchor names no section.
 */
function linkedSectionsOf(
  document: string,
  parts: readonly MarkdownNode[],
  sections: LinkedSections,
): LinkedSection[] {
  const targets: string[] = []

  /** Takes the targets of the links in `node`. */
  function visit(node: MarkdownNode): void {
    const hash = node.type === "link" ? (node.url?.indexOf("#") ?? -1) : -1
    if (hash > 0) {
      const linked = path.posix.normalize(
        path.posix.join(path.posix.dirname(document), node.url!.slice(0, hash)),
      )
      const target = `${linked}#${decodedAnchor(node.url!.slice(hash + 1))}`
      if (isLinkedDocument(linked) && !targets.includes(target)) {
        targets.push(target)
      }
    }
    node.children?.forEach(visit)
  }

  parts.forEach(visit)
  return targets.map((target) => {
    const [linked, anchor] = splitTarget(target)
    return { target, text: sections.section(linked, anchor)?.text ?? null }
  })
}

/** The document and the anchor of a target of a link. */
export function splitTarget(target: string): [string, string] {
  const hash = target.indexOf("#")
  return [target.slice(0, hash), target.slice(hash + 1)]
}

/** The anchor of a link as the heading's slug, which a link may write percent-encoded. */
function decodedAnchor(anchor: string): string {
  try {
    return decodeURIComponent(anchor)
  } catch {
    return anchor
  }
}

/** Whether `document` is `common.md` or a document of `diagrams/` of the specification. */
function isLinkedDocument(document: string): boolean {
  if (document === `${LINKED_DOCUMENT_DIRECTORY}/common.md`) return true
  const directory = `${LINKED_DOCUMENT_DIRECTORY}/diagrams/`
  if (!document.startsWith(directory)) return false
  const name = document.slice(directory.length)
  return !name.includes("/") && name.endsWith(".md") && !name.endsWith(".ja.md")
}
