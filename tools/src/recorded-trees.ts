/**
 * The check of the recorded trees that a change adds or rewrites:
 * `checkTree` on each of them (on every recorded tree when a file that
 * decides its result changes), the conditions of the documents of the tree
 * that `checkTree` is not shown to check and that a person reads instead
 * (the items), and the answers to them. `tools/recorded-trees.ts` prints the
 * report; `packages/tests/docs/recorded-trees.md` defines what it holds.
 */
import { execFileSync } from "node:child_process"
import { existsSync, readFileSync, readdirSync } from "node:fs"
import path from "node:path"
import {
  STRUCTURE_NODE_TYPES,
  VALUE_NODE_TYPES,
} from "../../packages/tests/src/check-tree/node-types.ts"
import type {
  CheckedNode,
  CheckedRoot,
} from "../../packages/tests/src/check-tree/types.ts"
import { nodesOf } from "../../packages/tests/src/check-tree/walk.ts"
import { getFixturesRoot } from "../../packages/tests/src/index.ts"
import type { FixtureSource } from "../../packages/tests/src/index.ts"
import { coverageOf, isRead, readCoverageTable } from "./coverage-table.ts"
import type {
  Coverage,
  CoverageJudgment,
  CoverageTable,
  StaleRow,
} from "./coverage-table.ts"
import { citationsIn, withoutCitations } from "./fixture-citations.ts"
import type { CitationForm } from "./fixture-citations.ts"
import {
  ERROR_DIAGRAM,
  LinkedSections,
  blocksOf,
  diagramTypesOf,
  splitTarget,
  tokenKindsOf,
  treeDocuments,
  workingTreeReader,
} from "./recorded-tree-documents.ts"
import type {
  BlockVocabulary,
  DocumentBlock,
  DocumentReader,
  Section,
} from "./recorded-tree-documents.ts"
import { checkRecordedTree } from "./recorded-trees-run.ts"
import type { RecordedTreeResult } from "./recorded-trees-run.ts"
import { runtimeClosureOf } from "./runtime-imports.ts"
import type { ReachedFile } from "./runtime-imports.ts"

/** The root of this repository, which holds these tools. */
const REPOSITORY = path.join(import.meta.dirname, "..", "..")
/** The fixtures of the corpus, relative to the root of the repository, as `@mmd-toolkit/tests` places them. */
const FIXTURES = path
  .relative(REPOSITORY, getFixturesRoot())
  .split(path.sep)
  .join("/")
/** The answer files, relative to the root of the repository. */
export const ANSWERS = "packages/tests/recorded-trees/answers"
/** The module that runs the check on one tree; what it reaches decides the result. */
const RUNNER = path.join(import.meta.dirname, "recorded-trees-run.ts")
/** The directories of the documents of the tree and of the sections they link to. */
const DOCUMENT_DIRECTORIES: readonly string[] = [
  "packages/spec/docs",
  "packages/parser/docs",
]
/** The test files that the cases of the coverage table are in. */
const COVERAGE_TESTS = "packages/tests/tests"
/** The documents searched for the sentences that cite a fixture, and the form of their citation. */
const CITING_DOCUMENTS: readonly {
  readonly directory: string
  readonly form: CitationForm
}[] = [
  { directory: "packages/spec/docs", form: "fixture" },
  { directory: "packages/parser/docs", form: "fixture" },
  { directory: "packages/tests/docs", form: "fixture" },
  { directory: "packages/prettier-plugin-mmd/docs", form: "corpus fixture" },
]

/** A failure of the use of the command or of git, before anything is checked. */
export class RecordedTreesUsageError extends Error {}

/** Runs git in `root` and returns what it prints. */
function git(root: string, args: readonly string[], input?: string): string {
  try {
    return execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      input,
      maxBuffer: 1 << 30,
      stdio: ["pipe", "pipe", "pipe"],
    })
  } catch (error) {
    const stderr = (error as { stderr?: string }).stderr?.trim() ?? ""
    throw new RecordedTreesUsageError(
      `git ${args.join(" ")} failed${stderr === "" ? "" : `: ${stderr}`}`,
    )
  }
}

/** The lines that git prints, without the empty ones. */
function lines(output: string): string[] {
  return output.split("\n").filter((line) => line !== "")
}

/** Reads the documents of the commit `commit`. */
export function commitReader(root: string, commit: string): DocumentReader {
  const texts = new Map<string, string | undefined>()
  return {
    read(file) {
      if (!texts.has(file)) {
        let text: string | undefined
        try {
          text = execFileSync("git", ["show", `${commit}:${file}`], {
            cwd: root,
            encoding: "utf8",
            maxBuffer: 1 << 30,
            stdio: ["ignore", "pipe", "ignore"],
          })
        } catch {
          text = undefined
        }
        texts.set(file, text)
      }
      return texts.get(file)
    },
    list(directory) {
      return lines(
        git(root, ["ls-tree", "--name-only", commit, `${directory}/`]),
      ).map((file) => file.slice(directory.length + 1))
    },
  }
}

// ---------------------------------------------------------------------------
// The changed trees

/** The fixture `<directory>/<name>` of a path under the fixtures, if it is the file of one. */
function fixtureOf(
  file: string,
): { fixture: string; name: string } | undefined {
  if (!file.startsWith(`${FIXTURES}/`)) return undefined
  const parts = file.slice(FIXTURES.length + 1).split("/")
  if (parts.length !== 3) return undefined
  return { fixture: `${parts[0]}/${parts[1]}`, name: parts[2] }
}

/** What a change does to the records of the fixtures. */
export interface ChangedRecords {
  /** The fixtures whose `input.mmd` or `ast.json` changed and that have an `ast.json` now. */
  readonly trees: readonly string[]
  /** The fixtures whose `ast.json` the change removed. */
  readonly removedTrees: readonly string[]
  /** The fixtures whose `parse-error.json` changed. */
  readonly rejections: readonly string[]
}

/** The records that the paths `changed` change, in the working tree at `root`. */
export function changedRecordsOf(
  root: string,
  changed: readonly string[],
): ChangedRecords {
  const trees = new Set<string>()
  const removedTrees = new Set<string>()
  const rejections = new Set<string>()
  for (const file of changed) {
    const record = fixtureOf(file)
    if (record === undefined) continue
    const tree = path.join(root, FIXTURES, record.fixture, "ast.json")
    if (record.name === "input.mmd" || record.name === "ast.json") {
      if (existsSync(tree)) trees.add(record.fixture)
      else if (record.name === "ast.json") removedTrees.add(record.fixture)
    } else if (record.name === "parse-error.json") {
      rejections.add(record.fixture)
    }
  }
  return {
    trees: [...trees].sort(),
    removedTrees: [...removedTrees].sort(),
    rejections: [...rejections].sort(),
  }
}

/** Every fixture that has an `ast.json`, for a change that checks them all. */
function everyTreeIn(root: string): string[] {
  const fixtures: string[] = []
  const top = path.join(root, FIXTURES)
  for (const directory of readdirSync(top, { withFileTypes: true })) {
    if (!directory.isDirectory()) continue
    for (const name of readdirSync(path.join(top, directory.name))) {
      if (existsSync(path.join(top, directory.name, name, "ast.json"))) {
        fixtures.push(`${directory.name}/${name}`)
      }
    }
  }
  return fixtures.sort()
}

/** Why every recorded tree is checked, or nothing when only the changed ones are. */
export interface EveryTreeReason {
  /** The files that decide the result of the check and that the change changes. */
  readonly changedFiles: readonly string[]
  /** The files that decide the result and whose reads cannot be followed, with each read. */
  readonly untraceable: readonly {
    readonly file: string
    readonly read: string
  }[]
}

/**
 * Whether the change checks every recorded tree: when it changes the runner
 * or a file that the runner reaches (the files of the rules), or when one of
 * them reads something that cannot be followed to a file. The paths of
 * `changed` are relative to the root of this repository.
 */
export function everyTreeReasonOf(
  changed: readonly string[],
): EveryTreeReason | undefined {
  return everyTreeReasonFrom(
    runtimeClosureOf(RUNNER),
    RUNNER,
    REPOSITORY,
    changed,
  )
}

/**
 * Whether the change checks every recorded tree, from `closure`, the files
 * that the runner `runner` reaches, under the root `root`. The runner reads
 * the files of the trees, so it may import built-in modules of Node.js; any
 * other read that cannot be followed, in it or in a file it reaches, makes the
 * files that decide the result unknown.
 */
export function everyTreeReasonFrom(
  closure: readonly ReachedFile[],
  runner: string,
  root: string,
  changed: readonly string[],
): EveryTreeReason | undefined {
  /** The path of `file` relative to the root, with slashes. */
  function relativeOf(file: string): string {
    return path.relative(root, file).split(path.sep).join("/")
  }

  const changedFiles = closure
    .map((reached) => relativeOf(reached.file))
    .filter((file) => changed.includes(file))
  const untraceable = closure.flatMap((reached) =>
    [
      ...reached.modules
        .filter(
          (module) => reached.file !== runner || !module.startsWith("node:"),
        )
        .map((module) => `an import of "${module}"`),
      ...reached.dynamic,
    ].map((read) => ({ file: relativeOf(reached.file), read })),
  )
  return changedFiles.length === 0 && untraceable.length === 0
    ? undefined
    : { changedFiles, untraceable }
}

// ---------------------------------------------------------------------------
// The trees

/** A recorded tree that the change checks. */
export interface CheckedTree {
  readonly fixture: string
  readonly result: RecordedTreeResult
}

/** A changed tree, read for its items. */
export interface ChangedTree {
  readonly fixture: string
  /** The kind of the fixture's source, or undefined when it cannot be read. */
  readonly sourceKind: FixtureSource["kind"] | undefined
  /** The tree, or undefined when it cannot be read or breaks the specification. */
  readonly root: CheckedRoot | undefined
  /** The diagram type of its items, or undefined when it has none. */
  readonly diagram: string | undefined
  /** The key of its content: the git blob ids of its `input.mmd` and `ast.json`; undefined when one of them is missing. */
  readonly contentKey: string | undefined
}

/** A changed tree whose content has a key: its `input.mmd` and its `ast.json` are there. */
export type KeyedTree = ChangedTree & { readonly contentKey: string }

/** Whether `tree` has a content key. */
function hasContentKey(tree: ChangedTree): tree is KeyedTree {
  return tree.contentKey !== undefined
}

/** The diagram type whose items hold for a tree whose body has `bodyType`. */
function diagramOfBody(
  bodyType: string,
  diagrams: readonly string[],
): string | undefined {
  if (bodyType === "ErrorDiagram") return ERROR_DIAGRAM
  return diagrams.find(
    (diagram) =>
      `${diagram[0].toUpperCase()}${diagram.slice(1)}Diagram` === bodyType,
  )
}

/** The content keys of those of the fixtures `fixtures` that have both an `input.mmd` and an `ast.json`, by fixture. */
function contentKeysOf(
  root: string,
  candidates: readonly string[],
): Map<string, string> {
  const fixtures = candidates.filter((fixture) =>
    ["input.mmd", "ast.json"].every((name) =>
      existsSync(path.join(root, FIXTURES, fixture, name)),
    ),
  )
  const files = fixtures.flatMap((fixture) => [
    `${FIXTURES}/${fixture}/input.mmd`,
    `${FIXTURES}/${fixture}/ast.json`,
  ])
  const blobs =
    files.length === 0
      ? []
      : lines(
          git(root, ["hash-object", "--stdin-paths"], `${files.join("\n")}\n`),
        )
  return new Map(
    fixtures.map((fixture, index) => [
      fixture,
      `${blobs[index * 2]}:${blobs[index * 2 + 1]}`,
    ]),
  )
}

/** Reads the tree of `fixture` if it can be read. */
function readTree(root: string, fixture: string): CheckedRoot | undefined {
  try {
    return JSON.parse(
      readFileSync(path.join(root, FIXTURES, fixture, "ast.json"), "utf8"),
    ) as CheckedRoot
  } catch {
    return undefined
  }
}

/** Reads the kind of the fixture's source if it can be read. */
function sourceKindOf(
  root: string,
  fixture: string,
): FixtureSource["kind"] | undefined {
  try {
    const expected = JSON.parse(
      readFileSync(path.join(root, FIXTURES, fixture, "expected.json"), "utf8"),
    ) as { readonly source?: { readonly kind?: unknown } } | null
    const kind = expected?.source?.kind
    return kind === "mermaid" || kind === "authored" ? kind : undefined
  } catch {
    return undefined
  }
}

// ---------------------------------------------------------------------------
// The coverage table

/** The key of the item of `block` for `diagram`. */
export function itemKeyOf(block: DocumentBlock, diagram: string): string {
  return `${block.key}@${diagram}`
}

/** The diagram types that the documents of a version know, with `error`: the names a row may give. */
function allDiagramsOf(blocks: DocumentBlocks): string[] {
  return [...blocks.diagrams, ERROR_DIAGRAM]
}

/** The blocks with the diagram types whose items a coverage table does not judge. */
function unjudgedOf(blocks: DocumentBlocks, coverage: Coverage): HeldBlock[] {
  return blocks.list
    .map(({ block, diagrams }) => ({
      block,
      diagrams: diagrams.filter(
        (diagram) => !coverage.judgments.has(itemKeyOf(block, diagram)),
      ),
    }))
    .filter((held) => held.diagrams.length > 0)
}

// ---------------------------------------------------------------------------
// The answers

/** The trees that an answer covers, by their content keys. */
interface AnsweredTree {
  readonly key: string
  /** The fixture, for a person who reads the file; not compared. */
  readonly fixture?: string
}

/** An answer file: the answers of one change. */
export interface AnswerFile {
  /** The answers to the items: one for each item, covering the trees named. */
  readonly items: readonly {
    readonly item: string
    readonly trees: readonly AnsweredTree[]
    readonly answer: string
  }[]
  /** The answers of the reading of each changed tree against the sentences that cite it. */
  readonly trees: readonly (AnsweredTree & { readonly answer: string })[]
}

/** The answers of a version, as the pairs that they cover. */
export interface Answers {
  /** `<item key> <content key>` for each item and tree that an answer covers. */
  readonly items: ReadonlySet<string>
  /** The content keys that an answer of the reading by citing sentences covers. */
  readonly trees: ReadonlySet<string>
  /** The answer files that cannot be read, with why. */
  readonly unreadable: readonly {
    readonly file: string
    readonly reason: string
  }[]
}

/** Reads the answer files `files`, each with its text or undefined when it cannot be read. */
export function answersOf(
  files: readonly {
    readonly file: string
    readonly text: string | undefined
  }[],
): Answers {
  const items = new Set<string>()
  const trees = new Set<string>()
  const unreadable: { file: string; reason: string }[] = []
  for (const { file, text } of files) {
    const reason = answerFileProblem(text)
    if (reason !== undefined) {
      unreadable.push({ file, reason })
      continue
    }
    const answers = JSON.parse(text!) as AnswerFile
    // An answer whose text is empty, as the template gives it, answers nothing.
    for (const answer of answers.items) {
      if (answer.answer.trim() === "") continue
      for (const tree of answer.trees) items.add(`${answer.item} ${tree.key}`)
    }
    for (const answer of answers.trees) {
      if (answer.answer.trim() !== "") trees.add(answer.key)
    }
  }
  return { items, trees, unreadable }
}

/** Whether `entry` of JSON is an object. */
function isRecord(entry: unknown): entry is Record<string, unknown> {
  return typeof entry === "object" && entry !== null && !Array.isArray(entry)
}

/** Whether `entry` of an answer file names a tree: `{ key, fixture? }`. */
function isTree(entry: unknown): boolean {
  return (
    isRecord(entry) &&
    typeof entry.key === "string" &&
    (entry.fixture === undefined || typeof entry.fixture === "string")
  )
}

/** Why `text` is not an answer file, or undefined when it is one. */
function answerFileProblem(text: string | undefined): string | undefined {
  if (text === undefined) return "it cannot be read"
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    return "it is not JSON"
  }
  if (!isRecord(value)) return "it is not a JSON object"
  if (!Array.isArray(value.items) || !Array.isArray(value.trees)) {
    return "it has no list `items` and list `trees`"
  }
  const badItem = value.items.findIndex(
    (entry) =>
      !isRecord(entry) ||
      typeof entry.item !== "string" ||
      typeof entry.answer !== "string" ||
      !Array.isArray(entry.trees) ||
      !entry.trees.every(isTree),
  )
  if (badItem !== -1) {
    return `items[${badItem}] is not { item, trees: [{ key, fixture? }], answer }`
  }
  const badTree = value.trees.findIndex(
    (entry) =>
      !isRecord(entry) || !isTree(entry) || typeof entry.answer !== "string",
  )
  if (badTree !== -1) {
    return `trees[${badTree}] is not { key, fixture?, answer }`
  }
  return undefined
}

// ---------------------------------------------------------------------------
// The items

/** A place of an item in a tree. */
export interface Place {
  /** `<fixture> <node type>@<start>-<end>`, `<fixture> <token kind>@<start>-<end> in <node type>`, or `<fixture> *` for the whole tree. */
  readonly key: string
  /** The text of the input at the place, for a node or a token. */
  readonly text: string | undefined
}

/** A tree read once for the places of its items. */
export interface PlacedTree {
  readonly fixture: string
  readonly input: string
  readonly nodes: readonly CheckedNode[]
  readonly root: CheckedRoot
}

/** Reads the tree of `fixture` for its places. */
function placedTreeOf(
  root: string,
  fixture: string,
  tree: CheckedRoot,
): PlacedTree {
  return {
    fixture,
    input: readFileSync(
      path.join(root, FIXTURES, fixture, "input.mmd"),
      "utf8",
    ),
    nodes: nodesOf(tree),
    root: tree,
  }
}

/** The places of the item of `block` in `tree`. */
export function placesOf(block: DocumentBlock, tree: PlacedTree): Place[] {
  const category = block.category
  if (category.kind === "node") {
    return tree.nodes
      .filter((node) => node.type === category.nodeType)
      .map((node) => ({
        key: `${tree.fixture} ${node.type}@${node.range[0]}-${node.range[1]}`,
        text: tree.input.slice(node.range[0], node.range[1]),
      }))
  }
  if (category.kind === "token") {
    return tree.root.tokens
      .filter((token) => token.type === category.tokenKind)
      .map((token) => ({
        key: `${tree.fixture} ${token.type}@${token.range[0]}-${token.range[1]} in ${innermostNodeOf(tree.nodes, token.range)?.type ?? "Root"}`,
        text: tree.input.slice(token.range[0], token.range[1]),
      }))
  }
  return [{ key: `${tree.fixture} *`, text: undefined }]
}

/**
 * The innermost node of `nodes` whose range holds `range`: the smallest, and
 * of nodes with the same range the deepest, which `nodesOf` lists after its
 * parent.
 */
function innermostNodeOf(
  nodes: readonly CheckedNode[],
  range: readonly [number, number],
): CheckedNode | undefined {
  let innermost: CheckedNode | undefined
  for (const node of nodes) {
    if (node.range[0] > range[0] || node.range[1] < range[1]) continue
    if (
      innermost === undefined ||
      node.range[1] - node.range[0] <= innermost.range[1] - innermost.range[0]
    ) {
      innermost = node
    }
  }
  return innermost
}

/** A block of the documents of the tree, with the diagram types it holds for. */
export interface HeldBlock {
  readonly block: DocumentBlock
  readonly diagrams: readonly string[]
}

/** The blocks of the documents of the tree of one version. */
export interface DocumentBlocks {
  readonly diagrams: readonly string[]
  /** The blocks in the order of the documents. */
  readonly list: readonly HeldBlock[]
  readonly byKey: ReadonlyMap<string, HeldBlock>
  readonly sections: LinkedSections
}

/** Reads the blocks of the documents of the tree through `reader`. */
export function documentBlocksOf(reader: DocumentReader): DocumentBlocks {
  const tokens = reader.read("packages/parser/docs/tokens.md")
  const vocabulary: BlockVocabulary = {
    nodeTypes: new Set([...VALUE_NODE_TYPES, ...STRUCTURE_NODE_TYPES]),
    tokenKinds: tokens === undefined ? new Set() : tokenKindsOf(tokens),
  }
  const sections = new LinkedSections(reader)
  const list: HeldBlock[] = []
  for (const document of treeDocuments(reader)) {
    const text = reader.read(document.path)
    if (text === undefined) continue
    for (const block of blocksOf(document.path, text, vocabulary, sections)) {
      list.push({ block, diagrams: document.diagrams })
    }
  }
  return {
    diagrams: diagramTypesOf(reader),
    list,
    byKey: new Map(list.map((held) => [held.block.key, held])),
    sections,
  }
}

/** An item whose key changed since the base, with why and the fixtures to read. */
export interface ChangedItem {
  readonly block: DocumentBlock
  readonly diagram: string
  /** Whether the text of the block itself changed (or the block was added). */
  readonly ownTextChanged: boolean
  /** The linked sections whose text changed. */
  readonly changedSections: readonly string[]
  /** The fixtures that the changed sentences cite and that are of the diagram type of the item. */
  readonly fixtures: readonly string[]
}

/** The blocks of `these` whose text no block of `those` has. */
function blocksOnlyIn(
  these: Section["blocks"],
  those: Section["blocks"],
): Section["blocks"] {
  return these.filter(
    (one) => !those.some((other) => other.ownKeyText === one.ownKeyText),
  )
}

/**
 * The items whose key changed since the base, and the fixtures that the
 * changed sentences cite: those of the block, when its own text changed; and
 * in each linked section that changed, those of the blocks that only one of
 * the two versions has, as that version writes them. When only a section
 * changed, the fixtures of the block itself show no case of the change.
 */
export function changedItemsOf(
  now: DocumentBlocks,
  base: DocumentBlocks,
  diagramOfFixture: (fixture: string) => string | undefined,
): ChangedItem[] {
  const baseItems = new Set(
    base.list.flatMap(({ block, diagrams }) =>
      diagrams.map((diagram) => itemKeyOf(block, diagram)),
    ),
  )
  const baseOwnTexts = new Set(
    base.list.map(({ block }) => `${block.document}\n${block.ownKeyText}`),
  )
  const changed: ChangedItem[] = []
  for (const { block, diagrams } of now.list) {
    const ownTextChanged = !baseOwnTexts.has(
      `${block.document}\n${block.ownKeyText}`,
    )
    const changedSections = block.sections
      .map((section) => section.target)
      .filter((target) => {
        const [document, anchor] = splitTarget(target)
        const before = base.sections.section(document, anchor)
        const after = now.sections.section(document, anchor)
        return (
          before === undefined ||
          after === undefined ||
          withoutCitations(before.text) !== withoutCitations(after.text)
        )
      })
    const sectionFixtures = changedSections.flatMap((target) => {
      const [document, anchor] = splitTarget(target)
      const after = now.sections.section(document, anchor)?.blocks ?? []
      const before = base.sections.section(document, anchor)?.blocks ?? []
      return [
        ...blocksOnlyIn(after, before),
        ...blocksOnlyIn(before, after),
      ].flatMap((one) => one.cases)
    })
    for (const diagram of diagrams) {
      if (baseItems.has(itemKeyOf(block, diagram))) continue
      const fixtures = [
        ...new Set([
          ...(ownTextChanged ? block.cases : []),
          ...sectionFixtures,
        ]),
      ].filter((fixture) => diagramOfFixture(fixture) === diagram)
      changed.push({
        block,
        diagram,
        ownTextChanged,
        changedSections,
        fixtures,
      })
    }
  }
  return changed
}

/** The Markdown documents under `directory`, recursively, English ones only. */
function englishDocumentsUnder(root: string, directory: string): string[] {
  const full = path.join(root, directory)
  if (!existsSync(full)) return []
  return readdirSync(full, { withFileTypes: true })
    .flatMap((entry) => {
      const file = `${directory}/${entry.name}`
      if (entry.isDirectory()) {
        return entry.name === "node_modules"
          ? []
          : englishDocumentsUnder(root, file)
      }
      return entry.name.endsWith(".md") && !entry.name.endsWith(".ja.md")
        ? [file]
        : []
    })
    .sort()
}

/**
 * The sentences that cite each fixture, `<document>:<line>` by fixture: the
 * citations `[fixture: …]` of the documents of the specification, the parser
 * and the tests, and `[corpus fixture: …]` of those of the formatter, whose
 * `[fixture: …]` names fixtures of its own. Prettier may break a citation
 * across lines.
 */
export function citationsOf(root: string): Map<string, string[]> {
  const citations = new Map<string, string[]>()
  for (const { directory, form } of CITING_DOCUMENTS) {
    for (const file of englishDocumentsUnder(root, directory)) {
      const text = readFileSync(path.join(root, file), "utf8")
      // The citations come in order, so the lines are counted on from the last.
      let line = 1
      let counted = 0
      for (const { fixture, offset } of citationsIn(text, form)) {
        for (let index = counted; index < offset; index++) {
          if (text[index] === "\n") line++
        }
        counted = offset
        const list = citations.get(fixture) ?? []
        list.push(`${file}:${line}`)
        citations.set(fixture, list)
      }
    }
  }
  return citations
}

// ---------------------------------------------------------------------------
// The report

/** A changed tree for one item, with its places. */
export interface ItemTree {
  readonly tree: KeyedTree
  readonly places: readonly Place[]
}

/** An item that the change asks to read. */
export interface ReadItem {
  readonly key: string
  readonly block: DocumentBlock
  readonly diagram: string
  /** The judgment of the coverage table: "not shown", or undefined when it is not judged yet. */
  readonly judgment: CoverageJudgment | undefined
  /** The changed trees of its diagram type that no answer of the base covers, with the places in each. */
  readonly trees: readonly ItemTree[]
  /** Those of `trees` that an answer of this change covers. */
  readonly answeredHere: readonly KeyedTree[]
}

/** A fixture that a changed item asks to read. */
export interface ChangedItemFixture {
  readonly fixture: string
  /** The content key, when the fixture has a tree. */
  readonly contentKey: string | undefined
  /** Whether the working tree has the fixture. */
  readonly exists: boolean
  /** The places of the item in its tree, when the places are asked for. */
  readonly places: readonly Place[] | undefined
}

/** What the check of a change found. */
export interface RecordedTreesReport {
  readonly base: string
  readonly everyTree: EveryTreeReason | undefined
  readonly records: ChangedRecords
  readonly checked: readonly CheckedTree[]
  readonly changedTrees: readonly ChangedTree[]
  readonly readItems: readonly ReadItem[]
  /** The items whose every changed tree an answer of the base covers. */
  readonly answeredItems: readonly string[]
  /** The sentences that cite each fixture. */
  readonly citations: ReadonlyMap<string, readonly string[]>
  /** The changed trees whose fixture the base does not have. */
  readonly newFixtures: ReadonlySet<string>
  /** The changed trees that no answer of the reading by citing sentences covers. */
  readonly unansweredTrees: readonly KeyedTree[]
  readonly unreadableAnswers: Answers["unreadable"]
  /** The files of the coverage table of the working tree that cannot be read, with why. */
  readonly unreadableTable: CoverageTable["unreadable"]
  /** The stale rows, each with whether the base has it as a stale row too. */
  readonly staleRows: readonly (StaleRow & { readonly atBase: boolean })[]
  /** The blocks of every document with the diagram types that the coverage table does not judge and the base judged or did not have. */
  readonly unjudged: readonly HeldBlock[]
  /** The blocks with the diagram types that neither the table of now nor that of the base judges. */
  readonly unjudgedAtBase: readonly HeldBlock[]
  readonly changedItems: readonly (ChangedItem & {
    readonly trees: readonly ChangedItemFixture[]
  })[]
}

/** Reads the answer files of a version. */
function answersIn(reader: DocumentReader): Answers {
  return answersOf(
    reader
      .list(ANSWERS)
      .filter((name) => name.endsWith(".json"))
      .sort()
      .map((name) => ({
        file: `${ANSWERS}/${name}`,
        text: reader.read(`${ANSWERS}/${name}`),
      })),
  )
}

/** The merge base of `ref` and HEAD, and the paths that the working tree at `root` changes since then. */
export function changeSince(
  root: string,
  ref: string,
): { base: string; changed: string[] } {
  const base = git(root, ["merge-base", ref, "HEAD"]).trim()
  return {
    base,
    changed: [
      ...lines(git(root, ["diff", "--no-renames", "--name-only", base, "--"])),
      ...lines(git(root, ["ls-files", "--others", "--exclude-standard"])),
    ],
  }
}

/**
 * Checks the recorded trees that the paths `changed` of the working tree at
 * `root` change since the commit `base`; with `places`, the report holds
 * every place of the fixtures of the changed items as well.
 */
export function checkRecordedTrees(
  root: string,
  base: string,
  changed: readonly string[],
  options: { readonly places: boolean },
): RecordedTreesReport {
  const records = changedRecordsOf(root, changed)
  const everyTree = everyTreeReasonOf(changed)
  const checked = (
    everyTree === undefined ? records.trees : everyTreeIn(root)
  ).map((fixture) => ({
    fixture,
    result: checkRecordedTree({
      input: path.join(root, FIXTURES, fixture, "input.mmd"),
      tree: path.join(root, FIXTURES, fixture, "ast.json"),
    }),
  }))
  const resultOf = new Map(checked.map((tree) => [tree.fixture, tree.result]))

  const working = workingTreeReader(root)
  const atBase = commitReader(root, base)
  const now = documentBlocksOf(working)
  // A key can change only when a document of the specification or of the
  // parser changes; reading the base costs as much as reading now.
  const documentsChanged = changed.some((file) =>
    DOCUMENT_DIRECTORIES.some((directory) => file.startsWith(`${directory}/`)),
  )
  const before = documentsChanged ? documentBlocksOf(atBase) : now

  // The items of a tree that breaks the specification are not read: its
  // problems fail the check already.
  const contentKeys = contentKeysOf(root, records.trees)
  const placed = new Map<string, PlacedTree>()
  const changedTrees: ChangedTree[] = records.trees.map((fixture) => {
    const result = resultOf.get(fixture)
    const tree =
      result?.kind === "checked" && result.problems.length === 0
        ? readTree(root, fixture)
        : undefined
    if (tree !== undefined)
      placed.set(fixture, placedTreeOf(root, fixture, tree))
    return {
      fixture,
      sourceKind: sourceKindOf(root, fixture),
      root: tree,
      diagram:
        tree === undefined
          ? undefined
          : diagramOfBody(tree.body.type, now.diagrams),
      contentKey: contentKeys.get(fixture),
    }
  })

  const table = readCoverageTable(working, new Set(allDiagramsOf(now)))
  const baseTable = readCoverageTable(atBase, new Set(allDiagramsOf(before)))
  const coverage = coverageOf(
    table.rows,
    now.byKey,
    (file) => working.read(`${COVERAGE_TESTS}/${file}`),
    working,
    { reader: atBase, rows: baseTable.rows },
  )
  // A stale row or an item that is not judged is the change's own only when
  // the base does not have it so. Read the base separately: a not-in-diagram
  // row can rely on a document outside the directories of the tree documents.
  const baseCoverage = coverageOf(
    baseTable.rows,
    before.byKey,
    (file) => atBase.read(`${COVERAGE_TESTS}/${file}`),
    atBase,
  )
  const baseStale = new Set(
    baseCoverage.staleRows.map((stale) => JSON.stringify(stale.row)),
  )
  const baseUnjudged = new Set(
    unjudgedOf(before, baseCoverage).flatMap(({ block, diagrams }) =>
      diagrams.map((diagram) => itemKeyOf(block, diagram)),
    ),
  )
  const unjudged = unjudgedOf(now, coverage)

  /**
   * The blocks of `unjudged` with those of their diagram types whose item the
   * base does not judge either, for `notJudgedAtBase`, or else whose item the
   * base judged or did not have.
   */
  function unjudgedWhere(notJudgedAtBase: boolean): HeldBlock[] {
    return unjudged
      .map(({ block, diagrams }) => ({
        block,
        diagrams: diagrams.filter(
          (diagram) =>
            baseUnjudged.has(itemKeyOf(block, diagram)) === notJudgedAtBase,
        ),
      }))
      .filter((held) => held.diagrams.length > 0)
  }

  const baseAnswers = answersIn(atBase)
  const workingAnswers = answersIn(working)

  const readItems: ReadItem[] = []
  const answeredItems: string[] = []
  for (const { block, diagrams } of now.list) {
    for (const diagram of diagrams) {
      const key = itemKeyOf(block, diagram)
      const judgment = coverage.judgments.get(key)
      if (!isRead(judgment)) continue
      const trees = changedTrees
        .filter(hasContentKey)
        .filter((tree) => tree.diagram === diagram)
      if (trees.length === 0) continue
      const notAtBase = trees.filter(
        (tree) => !baseAnswers.items.has(`${key} ${tree.contentKey}`),
      )
      if (notAtBase.length === 0) {
        answeredItems.push(key)
        continue
      }
      readItems.push({
        key,
        block,
        diagram,
        judgment,
        trees: notAtBase.map((tree) => ({
          tree,
          places: placesOf(block, placed.get(tree.fixture)!),
        })),
        answeredHere: notAtBase.filter((tree) =>
          workingAnswers.items.has(`${key} ${tree.contentKey}`),
        ),
      })
    }
  }

  const baseFixtures = new Set(
    lines(git(root, ["ls-tree", "-r", "--name-only", base, `${FIXTURES}/`]))
      .map((file) => fixtureOf(file)?.fixture)
      .filter((fixture) => fixture !== undefined),
  )

  /** The diagram type of `fixture`: of its tree, or else of its directory. */
  function diagramOfFixture(fixture: string): string | undefined {
    const tree = readTree(root, fixture)
    if (typeof tree?.body?.type === "string") {
      return diagramOfBody(tree.body.type, now.diagrams)
    }
    const directory = fixture.split("/")[0]
    return now.diagrams.includes(directory) ? directory : undefined
  }

  const changedItems = changedItemsOf(now, before, diagramOfFixture)
  const itemFixtures = [
    ...new Set(changedItems.flatMap((item) => item.fixtures)),
  ]
  const withTrees = itemFixtures.filter((fixture) =>
    existsSync(path.join(root, FIXTURES, fixture, "ast.json")),
  )
  const itemContentKeys = contentKeysOf(root, withTrees)
  const itemTrees = new Map<string, PlacedTree>()
  if (options.places) {
    for (const fixture of withTrees) {
      const tree = readTree(root, fixture)
      if (tree !== undefined)
        itemTrees.set(fixture, placedTreeOf(root, fixture, tree))
    }
  }

  return {
    base,
    everyTree,
    records,
    checked,
    changedTrees,
    readItems,
    answeredItems,
    citations: citationsOf(root),
    newFixtures: new Set(
      records.trees.filter((fixture) => !baseFixtures.has(fixture)),
    ),
    // A tree without a content key cannot be read, which fails the check
    // already.
    unansweredTrees: changedTrees
      .filter(hasContentKey)
      .filter(
        (tree) =>
          !baseAnswers.trees.has(tree.contentKey) &&
          !workingAnswers.trees.has(tree.contentKey),
      ),
    unreadableAnswers: workingAnswers.unreadable,
    unreadableTable: table.unreadable,
    staleRows: coverage.staleRows.map((stale) => ({
      ...stale,
      atBase: baseStale.has(JSON.stringify(stale.row)),
    })),
    unjudged: unjudgedWhere(false),
    unjudgedAtBase: unjudgedWhere(true),
    changedItems: changedItems.map((item) => ({
      ...item,
      trees: item.fixtures.map((fixture) => {
        const tree = itemTrees.get(fixture)
        return {
          fixture,
          contentKey: itemContentKeys.get(fixture),
          exists: existsSync(path.join(root, FIXTURES, fixture)),
          places: tree === undefined ? undefined : placesOf(item.block, tree),
        }
      }),
    })),
  }
}
