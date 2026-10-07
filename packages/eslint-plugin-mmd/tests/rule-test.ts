/**
 * Runs the tests of a rule: eslint-snapshot-rule-tester on the cases of
 * `ruleCases`, and, for a rule that offers suggestions, checks on each
 * suggestion of each invalid case. The tester's snapshot shows each suggestion
 * and the text that it gives; the checks add that the parser accepts that
 * text, that the rule reports less there than before, and that no other rule
 * of the plugin reports more, except a rule that the test names as one whose
 * reports a suggestion may reveal: a mistake that the text already holds,
 * which the rewrite makes visible. The text that a suggestion produces is a
 * text of the implementation, not of the corpus, so each suggestion is checked
 * against what it claims by reading its output with mermaid.js (see
 * `SuggestionClaim`).
 */
import type { Linter, Rule } from "eslint"
import { Linter as LinterClass } from "eslint"
import { SnapshotRuleTester } from "eslint-snapshot-rule-tester"
import { readFileSync } from "node:fs"
import { isDeepStrictEqual } from "node:util"
import { describe, expect, it } from "vitest"
import { parse, traverseNodes } from "@mmd-toolkit/parser"
import type { Range } from "@mmd-toolkit/parser"
import type { DbSummary, Fixture, JsonValue } from "@mmd-toolkit/tests"
import { loadFixtures } from "@mmd-toolkit/tests"
import { runMermaid } from "@mmd-toolkit/tests/mermaid"
import type { MermaidRuleDefinition } from "../src/index.ts"
import { rules } from "../src/rules/index.ts"
import { RULE_DOCS_DIR, ruleDocumentPath } from "../tools/rule-docs.ts"
import {
  isDiagramType,
  LANGUAGE_CONFIG,
  withoutByteOrderMark,
} from "./helpers.ts"
import type { RuleCase } from "./rule-cases.ts"
import { ruleCases } from "./rule-cases.ts"

/**
 * The configuration that enables every implemented rule of the plugin: the
 * rules that have messages to report with.
 */
const IMPLEMENTED_RULES_CONFIG: Linter.Config = {
  ...LANGUAGE_CONFIG,
  rules: Object.fromEntries(
    Object.entries(rules)
      .filter(([, rule]) => Object.keys(rule.meta?.messages ?? {}).length > 0)
      .map(([name]) => [`mmd/${name}`, "error"]),
  ),
}

/**
 * The rules whose reports the suggestions of a rule may reveal: mistakes that
 * the text already holds, which the rewrite makes visible. Any other rule that
 * reports more after a suggestion fails the test. A suggestion that only
 * removes text reveals nothing.
 */
export type RevealedReports =
  | { readonly kind: "none" }
  | {
      readonly kind: "rules"
      /** The rules, by name, each with the mistake that its reports show. */
      readonly rules: Readonly<Record<string, string>>
    }
  | {
      readonly kind: "anyRule"
      /** Why the reports of any rule may be revealed. */
      readonly because: string
    }

/**
 * What a suggestion claims about the diagram, in the words of its message,
 * checked on the Db that mermaid.js gives for the text before and after, and on
 * the text of the input. A claim says all that the message says.
 */
export type SuggestionClaim =
  /** The diagram is read as before: the Db is the same. */
  | { readonly kind: "keepsDb" }
  /**
   * Of two statements that set a field, the one that mermaid.js uses is the
   * one that remains: the field is the same. The members of a subgraph may
   * differ, since the value of the removed statement was one of them.
   */
  | {
      readonly kind: "keepsField"
      readonly field: "accTitle" | "accDescr"
    }
  /**
   * The other statement is removed, and the field has the value that the last
   * statement that remains gives when it stands alone (the statements that set
   * the field, in the order of the source). Nothing else differs, but the
   * members of a subgraph, since the value of the removed statement was one of
   * them.
   */
  | {
      readonly kind: "usesLastRemaining"
      readonly field: "accTitle" | "accDescr"
    }
  /**
   * The line makes no vertex `id` any more: the vertex is gone unless another
   * vertex statement of the output makes it, and the other vertices are the
   * same.
   */
  | { readonly kind: "removesVertexOfLine"; readonly id: string }
  /**
   * The value that holds the line of only `%%` is the one value of the Db that
   * changes, and it holds that line no more: one line of only `%%` less, the
   * others remain. Where the lines made mermaid.js reject the input (in a data
   * block), the data block of the output holds one such line less, and
   * mermaid.js accepts the output unless another such line remains in it or
   * it holds no data.
   */
  | { readonly kind: "removesBareMarkerLine" }
  /**
   * The description of an unclosed `accDescr {` block was empty and is now the
   * rest of the line of the `{` (the lines after it are statements), or all the
   * text after the `{`.
   */
  | {
      readonly kind: "setsDescription"
      readonly from: "restOfLine" | "restOfText"
    }
  /**
   * The text that the rule reports is read as statements: the Db holds what it
   * held, and what the reported text gives when it stands alone, and nothing
   * else.
   */
  | { readonly kind: "readsDroppedTextAsStatements" }

/** What a claim is checked on, for one suggestion of one report. */
export interface ClaimFacts {
  /** The text that the suggestion was applied to. */
  readonly input: string
  /** The Db of the input; null where mermaid.js rejects it. */
  readonly before: DbSummary | null
  /** The text that the suggestion gives. */
  readonly output: string
  /** The Db of that text; null where mermaid.js rejects it. */
  readonly after: DbSummary | null
  /** The reports of the rule on the input. */
  readonly reports: readonly Linter.LintMessage[]
  /** The report that carries the suggestion. */
  readonly report: Linter.LintMessage
}

/** `text` with the edit of a suggestion applied. */
function applyFix(text: string, fix: Rule.Fix): string {
  return text.slice(0, fix.range[0]) + fix.text + text.slice(fix.range[1])
}

/** The number of reports of each rule in `messages`, by rule id. */
function reportCounts(
  messages: readonly Linter.LintMessage[],
): Map<string, number> {
  const counts = new Map<string, number>()
  for (const message of messages) {
    if (message.ruleId === null) continue
    counts.set(message.ruleId, (counts.get(message.ruleId) ?? 0) + 1)
  }
  return counts
}

/** The Db that mermaid.js gives for `text`, null where it rejects it. */
export async function readDb(text: string): Promise<DbSummary | null> {
  const outcome = await runMermaid(text)
  if (outcome.accepted && outcome.db === null) {
    throw new Error(`mermaid.js gives no Db for ${JSON.stringify(text)}`)
  }
  return outcome.accepted ? outcome.db : null
}

/** The Db that mermaid.js gives for `text`; the test fails when it rejects. */
export async function dbOf(text: string): Promise<DbSummary> {
  const db = await readDb(text)
  if (db === null) {
    throw new Error(`mermaid.js rejects ${JSON.stringify(text)}`)
  }
  return db
}

/**
 * The Db of the input `text` of a case, null where mermaid.js rejects it. For
 * a copy of a corpus input, it is the Db that the corpus records in
 * `expected.json`, once the copy is the corpus input and the corpus reads it
 * without a configuration, as the output of a suggestion is read; for any other
 * input, it is the Db that mermaid.js gives.
 */
async function inputDbOf(
  testCase: RuleCase,
  text: string,
): Promise<DbSummary | null> {
  const [, diagram, ...nameParts] = testCase.name.split("/")
  if (diagram !== undefined && isDiagramType(diagram) && nameParts.length > 0) {
    const fixture = (await loadFixtures(diagram)).find(
      (candidate) => candidate.name === nameParts.join("/"),
    )
    expect(fixture, `the corpus fixture of ${testCase.name}`).toBeDefined()
    if (fixture !== undefined) {
      expect(
        withoutByteOrderMark(fixture.input),
        `${testCase.name} is a copy of the corpus input`,
      ).toBe(text)
      expect(
        fixture.config,
        `the corpus reads ${testCase.name} with a configuration`,
      ).toBeUndefined()
      return fixture.expected.accepted ? fixture.expected.db : null
    }
  }
  return readDb(text)
}

/** `subgraph`, when it is the entry of a subgraph, without its members. */
function withoutMembers(subgraph: JsonValue): JsonValue {
  return typeof subgraph === "object" &&
    subgraph !== null &&
    !Array.isArray(subgraph)
    ? Object.fromEntries(
        Object.entries(subgraph).filter(([name]) => name !== "nodes"),
      )
    : subgraph
}

/** `db` without the field `field` and without the members of the subgraphs. */
function withoutFieldAndMembers(db: DbSummary, field: string): DbSummary {
  return Object.fromEntries(
    Object.entries(db)
      .filter(([key]) => key !== field)
      .map(([key, value]) => [
        key,
        key === "subgraphs" && Array.isArray(value)
          ? value.map(withoutMembers)
          : value,
      ]),
  )
}

/** The ids of the vertices of `db`. */
function vertexIds(db: DbSummary): string[] {
  const { vertices } = db
  if (!Array.isArray(vertices)) return []
  return vertices.flatMap((vertex) =>
    typeof vertex === "object" &&
    vertex !== null &&
    !Array.isArray(vertex) &&
    typeof vertex.id === "string"
      ? [vertex.id]
      : [],
  )
}

/**
 * The text of the Db in `value`, at any depth, as strings: the lines of the
 * strings are split at `\n` and at `<br/>`, how mermaid.js keeps the line
 * breaks of a markdown label.
 */
function textLines(value: unknown): string[] {
  if (typeof value === "string") return value.split(/\n|<br\/>/u)
  if (Array.isArray(value)) return value.flatMap(textLines)
  if (typeof value === "object" && value !== null) {
    return Object.values(value).flatMap(textLines)
  }
  return []
}

/** The number of lines of only `%%` in the text `value`. */
function bareLinesIn(value: string): number {
  return textLines(value).filter((line) => line.trim() === "%%").length
}

/**
 * The leaves of `db` (strings, numbers, booleans, null) by their place in it,
 * without the members of the subgraphs, which repeat the strings of other
 * statements.
 */
function leavesByPlace(
  value: unknown,
  place = "",
  leaves = new Map<string, unknown>(),
): Map<string, unknown> {
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      leavesByPlace(item, `${place}[${index}]`, leaves),
    )
  } else if (typeof value === "object" && value !== null) {
    for (const [key, item] of Object.entries(value)) {
      if (key !== "nodes") leavesByPlace(item, `${place}.${key}`, leaves)
    }
  } else {
    leaves.set(place, value)
  }
  return leaves
}

/**
 * The leaves of the Db that differ between `before` and `after`, as their
 * place and the two values; a leaf that one of them lacks is `undefined`.
 */
function changedLeaves(
  before: DbSummary,
  after: DbSummary,
): { place: string; was: unknown; now: unknown }[] {
  const was = leavesByPlace(before)
  const now = leavesByPlace(after)
  return [...new Set([...was.keys(), ...now.keys()])]
    .filter((place) => was.get(place) !== now.get(place))
    .map((place) => ({ place, was: was.get(place), now: now.get(place) }))
}

/** The data block of `text` that holds `index`, with its text, or null. */
function dataBlockAt(
  text: string,
  index: number,
): { range: Range; data: string } | null {
  let found: { range: Range; data: string } | null = null
  traverseNodes(parse(text), {
    enterNode(node) {
      if (
        node.type === "FlowchartDataBlock" &&
        node.range[0] <= index &&
        index < node.range[1]
      ) {
        const block = text.slice(...node.range)
        found = {
          range: node.range,
          data: block.slice(block.indexOf("{") + 1, block.lastIndexOf("}")),
        }
      }
    },
    leaveNode() {
      // Each node is checked on entering it.
    },
  })
  return found
}

/**
 * The index in `text` of the position `line` and `column` of a report, which
 * ESLint counts from 1, with the line terminators of the language (U+2028 and
 * U+2029 do not end a line).
 */
function indexOfPosition(text: string, line: number, column: number): number {
  const lineStarts = [
    0,
    ...[...text.matchAll(/\r\n|[\n\r]/gu)].map(
      (match) => match.index + match[0].length,
    ),
  ]
  return (lineStarts[line - 1] ?? 0) + column - 1
}

/**
 * The ranges of the statements of `input` that set `field`, in the order of the
 * source: every `accTitle` statement; every `accDescr:` statement and every
 * `accDescr {` block that is not closed (it sets the empty description) or
 * holds a description. A closed block without a description changes nothing.
 */
function settingStatements(
  input: string,
  field: "accTitle" | "accDescr",
): Range[] {
  const ranges: Range[] = []
  traverseNodes(parse(input), {
    enterNode(node) {
      if (
        (field === "accTitle" && node.type === "FlowchartAccTitleStatement") ||
        (field === "accDescr" &&
          (node.type === "FlowchartAccDescrStatement" ||
            (node.type === "FlowchartAccDescrBlockStatement" &&
              (!node.closed || node.value !== null))))
      ) {
        ranges.push(node.range)
      }
    },
    leaveNode() {
      // Each statement is listed on entering it.
    },
  })
  return ranges
}

/**
 * The values of the statements of `text` that set `field`, as
 * `settingStatements` lists them: the text that a statement gives, which
 * mermaid.js also adds to the members of the subgraph that holds the
 * statement. A statement without a value (an empty block) has none.
 */
function settingValues(text: string, field: "accTitle" | "accDescr"): string[] {
  const values: string[] = []
  traverseNodes(parse(text), {
    enterNode(node) {
      const sets =
        (field === "accTitle" && node.type === "FlowchartAccTitleStatement") ||
        (field === "accDescr" &&
          (node.type === "FlowchartAccDescrStatement" ||
            node.type === "FlowchartAccDescrBlockStatement"))
      if (sets && node.value !== null) values.push(node.value.value)
    },
    leaveNode() {
      // Each statement is listed on entering it.
    },
  })
  return values
}

/** The ids of the members of each subgraph of `db`, in the order of `db`. */
function membersOfSubgraphs(db: DbSummary): string[][] {
  const { subgraphs } = db
  if (!Array.isArray(subgraphs)) return []
  return subgraphs.map((subgraph) => {
    if (
      typeof subgraph !== "object" ||
      subgraph === null ||
      Array.isArray(subgraph) ||
      !Array.isArray(subgraph.nodes)
    ) {
      return []
    }
    return subgraph.nodes.flatMap((id: JsonValue) =>
      typeof id === "string" ? [id] : [],
    )
  })
}

/**
 * Checks the members of the subgraphs after a suggestion removed statements
 * that set `field`. mermaid.js adds the value of such a statement to the members
 * of the subgraph that holds it, so the members after are the members before
 * without the values of the statements that went; a value stays a member where
 * another statement of the subgraph makes the same id a member. No other member
 * is added or lost.
 */
function expectMembersAfterRemoval(
  facts: Pick<ClaimFacts, "input" | "output">,
  before: DbSummary,
  after: DbSummary,
  field: "accTitle" | "accDescr",
): void {
  const remaining = settingValues(facts.output, field)
  const removed = settingValues(facts.input, field)
  for (const value of remaining) {
    const index = removed.indexOf(value)
    if (index !== -1) removed.splice(index, 1)
  }
  const membersBefore = membersOfSubgraphs(before)
  const membersAfter = membersOfSubgraphs(after)
  expect(membersAfter.length).toBe(membersBefore.length)
  for (const [index, ids] of membersAfter.entries()) {
    const earlier = membersBefore[index] ?? []
    expect(
      ids.filter((id) => !earlier.includes(id)),
      "members that the suggestion adds",
    ).toEqual([])
    expect(
      earlier.filter((id) => !ids.includes(id) && !removed.includes(id)),
      "members that the suggestion loses, besides the values that it removed",
    ).toEqual([])
  }
}

/** Whether `character` is a `;` or whitespace. */
function isSeparatorOrSpace(character: string | undefined): boolean {
  return character === ";" || character?.trim() === ""
}

/** `text` without the `;` and the whitespace at its two ends. */
function withoutEdgeSeparators(text: string): string {
  let start = 0
  let end = text.length
  while (start < end && isSeparatorOrSpace(text[start])) start++
  while (end > start && isSeparatorOrSpace(text[end - 1])) end--
  return text.slice(start, end)
}

/**
 * The entries of the collection `value` of a Db by their ids, each as a string
 * without the members of a subgraph. A statement that writes an entry again
 * replaces the entry of its id.
 */
function entriesById(value: JsonValue | undefined): Map<string, JsonValue> {
  const entries = new Map<string, JsonValue>()
  if (!Array.isArray(value)) return entries
  for (const entry of value) {
    const id =
      typeof entry === "object" &&
      entry !== null &&
      !Array.isArray(entry) &&
      typeof entry.id === "string"
        ? entry.id
        : JSON.stringify(entry)
    entries.set(id, withoutMembers(entry))
  }
  return entries
}

/** The members of each subgraph of `db`, by id. */
function membersOf(db: DbSummary): Map<string, unknown[]> {
  const members = new Map<string, unknown[]>()
  if (!Array.isArray(db.subgraphs)) return members
  for (const subgraph of db.subgraphs) {
    if (
      typeof subgraph === "object" &&
      subgraph !== null &&
      !Array.isArray(subgraph) &&
      typeof subgraph.id === "string" &&
      Array.isArray(subgraph.nodes)
    ) {
      members.set(subgraph.id, subgraph.nodes)
    }
  }
  return members
}

/**
 * Checks that the Db `after` holds what `before` held and what the text that a
 * rule reported (`dropped`) gives when it stands alone (`alone`), and nothing
 * else. Of each collection, an entry that only the text gives is as it gives
 * it; one that only `before` held is as it was, unless `dropped` names its id
 * (a `class` or a `click` of a vertex); one that both give is not what it was.
 * Of any other field, the value is one of them; where the text leaves it as
 * the `header` of a figure has it, the field keeps its value. Subgraphs keep
 * their members; the text may add some.
 */
function expectReadAsStatements(
  before: DbSummary,
  after: DbSummary,
  alone: DbSummary,
  header: DbSummary,
  dropped: string,
): void {
  for (const [key, now] of Object.entries(after)) {
    const was = before[key]
    const read = alone[key]
    if (Array.isArray(now)) {
      const [wasEntries, readEntries] = [entriesById(was), entriesById(read)]
      const entries = entriesById(now)
      expect([...entries.keys()].sort(), key).toEqual(
        [...new Set([...wasEntries.keys(), ...readEntries.keys()])].sort(),
      )
      for (const [id, entry] of entries) {
        const [wasEntry, readEntry] = [wasEntries.get(id), readEntries.get(id)]
        const where = `${key} ${id}`
        if (readEntry === undefined) {
          // Only a statement of the text that names the entry changes it.
          if (!isDeepStrictEqual(entry, wasEntry)) {
            expect(dropped, where).toContain(id)
          }
        } else if (wasEntry === undefined) {
          expect(entry, where).toEqual(readEntry)
        } else if (!isDeepStrictEqual(readEntry, wasEntry)) {
          // The text writes the entry again, or adds to it (a `class` or a
          // `click` of a vertex): it is not what it was.
          expect(entry, where).not.toEqual(wasEntry)
        }
      }
    } else if (JSON.stringify(read) === JSON.stringify(header[key])) {
      // The text gives nothing for the field: the header of the figure that
      // read it alone gave this value.
      expect(now, key).toEqual(was)
    } else {
      expect([was, read], key).toContainEqual(now)
    }
  }
  const members = membersOf(after)
  for (const [id, nodes] of membersOf(before)) {
    expect(members.get(id), `the members of the subgraph ${id}`).toEqual(
      expect.arrayContaining(nodes),
    )
  }
}

/**
 * Checks that the Db `after` of the output of a suggestion is as `claim` says
 * of the input, whose Db is `facts.before`.
 */
export async function expectClaim(
  claim: SuggestionClaim,
  facts: ClaimFacts,
): Promise<void> {
  const { input, output, reports, report } = facts
  if (facts.before === null) {
    // A line of the data made mermaid.js reject the input.
    expect(claim.kind).toBe("removesBareMarkerLine")
    const index = indexOfPosition(input, report.line, report.column)
    const block = dataBlockAt(input, index)
    expect(block, "the data block of the line").not.toBeNull()
    if (block === null) return
    // The data block of the output holds one line of only `%%` less.
    const remaining = dataBlockAt(output, block.range[0])
    expect(bareLinesIn(remaining?.data ?? "")).toBe(bareLinesIn(block.data) - 1)
    if (facts.after === null) {
      // Rejected still: another such line remains in the data, or no data
      // does (an empty data block is no data block that mermaid.js reads).
      const rest = (remaining?.data ?? "")
        .split(/\r\n|[\n\r]/u)
        .filter((line) => line.trim() !== "" && line.trim() !== "%%")
      expect(bareLinesIn(remaining?.data ?? "") > 0 || rest.length === 0).toBe(
        true,
      )
    }
    return
  }
  const { before } = facts
  const after = facts.after
  if (after === null) {
    throw new Error(`mermaid.js rejects ${JSON.stringify(output)}`)
  }
  switch (claim.kind) {
    case "keepsDb":
      expect(after).toEqual(before)
      break
    case "keepsField":
      expect(after[claim.field]).toEqual(before[claim.field])
      expect(withoutFieldAndMembers(after, claim.field)).toEqual(
        withoutFieldAndMembers(before, claim.field),
      )
      expectMembersAfterRemoval(facts, before, after, claim.field)
      break
    case "usesLastRemaining": {
      expect(withoutFieldAndMembers(after, claim.field)).toEqual(
        withoutFieldAndMembers(before, claim.field),
      )
      expectMembersAfterRemoval(facts, before, after, claim.field)
      const removed = indexOfPosition(input, report.line, report.column)
      const remaining = settingStatements(input, claim.field).filter(
        (range) => range[0] !== removed,
      )
      const last = remaining.at(-1)
      expect(last, "a statement that remains").toBeDefined()
      if (last !== undefined) {
        const alone = await dbOf(
          `flowchart LR\n${input.slice(last[0], last[1])}\n`,
        )
        expect(after[claim.field]).toEqual(alone[claim.field])
      }
      break
    }
    case "removesVertexOfLine": {
      let remains = false
      traverseNodes(parse(output), {
        enterNode(node) {
          if (node.type === "FlowchartVertex" && node.id.name === claim.id) {
            remains = true
          }
        },
        leaveNode() {
          // Each vertex is checked on entering it.
        },
      })
      expect(vertexIds(before)).toContain(claim.id)
      // The vertex that another statement makes again comes after the others.
      expect(vertexIds(after).filter((id) => id !== claim.id)).toEqual(
        vertexIds(before).filter((id) => id !== claim.id),
      )
      expect(vertexIds(after).includes(claim.id)).toBe(remains)
      break
    }
    case "removesBareMarkerLine": {
      // One value changes, and it holds one line of only `%%` less.
      const changed = changedLeaves(before, after)
      expect(changed.map((leaf) => leaf.place)).toHaveLength(1)
      const [leaf] = changed
      expect(typeof leaf?.was).toBe("string")
      expect(typeof leaf?.now).toBe("string")
      expect(bareLinesIn(String(leaf?.was))).toBe(
        bareLinesIn(String(leaf?.now)) + 1,
      )
      break
    }
    case "setsDescription": {
      // The report marks `accDescr {`: the keyword up to the `{`.
      const keyword = indexOfPosition(input, report.line, report.column)
      const brace = indexOfPosition(
        input,
        report.endLine ?? report.line,
        report.endColumn ?? report.column,
      )
      if (report.messageId === "closedByOtherBrace") {
        // A later `}` closes the block: the description is the lines up to
        // it, more than the rest of the line.
        expect(before.accDescr).toContain("\n")
      } else {
        expect(before.accDescr).toBe("")
      }
      if (claim.from === "restOfLine") {
        // `accDescr:` is how mermaid.js is told to take the rest of the line.
        expect(after).toEqual(
          await dbOf(
            `${input.slice(0, keyword)}accDescr:${input.slice(brace)}`,
          ),
        )
      } else {
        // All the text after the `{`, compared without whitespace, which
        // mermaid.js trims in places, and without the directives, which it
        // takes out before reading: nothing is left out, and the `}` is no
        // part of the description.
        const directives = parse(input).directives.map(
          (directive) => directive.range,
        )
        const text = [...input.slice(brace)]
          .filter(
            (_character, index) =>
              !directives.some(
                ([start, end]) => start <= brace + index && brace + index < end,
              ),
          )
          .filter((character) => character.trim() !== "")
          .join("")
        expect(
          [...String(after.accDescr)]
            .filter((character) => character.trim() !== "")
            .join(""),
        ).toBe(text)
        expect(after).toEqual({ ...before, accDescr: after.accDescr })
      }
      break
    }
    case "readsDroppedTextAsStatements": {
      // The `;` and the whitespace at the edges of the reported text
      // separate it from the direction; they are no part of the statements.
      const dropped = reports.map((each) =>
        withoutEdgeSeparators(
          input.slice(
            indexOfPosition(input, each.line, each.column),
            indexOfPosition(
              input,
              each.endLine ?? each.line,
              each.endColumn ?? each.column,
            ),
          ),
        ),
      )
      expectReadAsStatements(
        before,
        after,
        await dbOf(`flowchart LR\n${dropped.join("\n")}\n`),
        await dbOf("flowchart LR\n"),
        dropped.join("\n"),
      )
      break
    }
    default: {
      const unknownClaim: never = claim
      throw new Error(`unknown claim ${JSON.stringify(unknownClaim)}`)
    }
  }
}

/** Whether the suggestions may reveal the reports of the rule `otherId`. */
function mayReveal(revealed: RevealedReports, otherId: string): boolean {
  if (revealed.kind === "none") return false
  if (revealed.kind === "anyRule") return true
  return Object.keys(revealed.rules).some((name) => `mmd/${name}` === otherId)
}

/**
 * Checks each suggestion of the rule `ruleId` on an invalid case, applied to
 * its text: the parser accepts the result, the rule reports less on it, and
 * no other implemented rule reports more, except those in `revealed`.
 */
async function checkSuggestions(
  linter: LinterClass,
  ruleId: string,
  testCase: RuleCase,
  options: Required<Pick<TestRuleOptions, "revealed" | "claims">>,
): Promise<void> {
  const { revealed, claims } = options
  const text = withoutByteOrderMark(testCase.code)
  const messages = linter.verify(
    text,
    IMPLEMENTED_RULES_CONFIG,
    testCase.filename,
  )
  const before = reportCounts(messages)
  const reports = messages.filter((message) => message.ruleId === ruleId)
  for (const report of reports) {
    for (const suggestion of report.suggestions ?? []) {
      const output = applyFix(text, suggestion.fix)
      expect(() => parse(output)).not.toThrow()
      const after = reportCounts(
        linter.verify(output, IMPLEMENTED_RULES_CONFIG, testCase.filename),
      )
      expect(after.get(ruleId) ?? 0).toBeLessThan(before.get(ruleId) ?? 0)
      const claim: SuggestionClaim | undefined =
        claims[suggestion.messageId ?? ""]
      expect(
        claim,
        `a claim for the suggestion ${suggestion.messageId}`,
      ).toBeDefined()
      if (claim !== undefined) {
        await expectClaim(claim, {
          input: text,
          before: await inputDbOf(testCase, text),
          output,
          after: await readDb(output),
          reports,
          report,
        })
      }
      for (const [otherId, count] of after) {
        if (otherId === ruleId || mayReveal(revealed, otherId)) continue
        expect({ ruleId: otherId, count }).toEqual({
          ruleId: otherId,
          count: Math.min(count, before.get(otherId) ?? 0),
        })
      }
    }
  }
}

/**
 * One case that a sentence of the document of a rule distinguishes, with the
 * inputs of the rule that stand for it.
 */
export interface SentenceCase {
  /** The case, in words. */
  readonly case: string
  /** Whether the rule reports on the inputs of this case. */
  readonly reports: boolean
  /**
   * For a case that reports: whether the rule offers a suggestion on these
   * inputs. A case of a sentence about suggestions says it; any other case
   * leaves it out.
   */
  readonly suggests?: boolean
  /**
   * The ids of the messages of the suggestions that the rule offers on these
   * inputs, over all the reports, without repeats, in the order of the rule's
   * messages; `[]` for none. A case says this where the kinds of suggestion
   * matter; otherwise `suggests` is enough.
   */
  readonly offers?: readonly string[]
  /** A text that the message of every report on these inputs contains. */
  readonly messageHas?: string
  /** A text that the message of no report on these inputs contains. */
  readonly messageLacks?: string
  /** The names of the inputs (the `name` of a case of `ruleCases`). */
  readonly inputs: readonly string[]
  /**
   * Inputs that hold a character that a fixture file may not hold (a line
   * separator, say), written here with escapes. A fixture's snapshot would
   * show the character, so these are not in the snapshot, and the test runs
   * the report and the suggestion checks on them.
   */
  readonly written?: readonly WrittenInput[]
  /**
   * Corpus fixtures (`<diagram>/<name>`) that hold such a character and are
   * inputs of this case: the test reads the input of the fixture and runs the
   * same checks as on `written`.
   */
  readonly corpus?: readonly string[]
  /**
   * Corpus fixtures (`<diagram>/<name>`) that record what mermaid.js does for
   * this case: they are cited, not run through the rule; the test requires
   * them to exist.
   */
  readonly recorded?: readonly string[]
  /**
   * For an input of this case, the corpus fixture (`<diagram>/<name>`) whose
   * input is what a suggestion of the rule gives, byte for byte: the recorded
   * result of the suggestion.
   */
  readonly results?: Readonly<Record<string, string>>
}

/** An input written in the test, with a name that tells what it is for. */
export interface WrittenInput {
  readonly name: string
  readonly code: string
}

/**
 * A sentence of the English document of a rule that defines a behavior (a
 * condition to report, a condition not to report, a claim of the message or of
 * the suggestion), with the cases that it distinguishes. The test reads the
 * cases and the inputs of each case from here.
 */
export interface SentenceCases {
  /** A passage of the sentence, as the document writes it. */
  readonly sentence: string
  readonly cases: readonly SentenceCase[]
}

/** The options of `testRule`. */
export interface TestRuleOptions {
  readonly revealed?: RevealedReports
  /** For each suggestion of the rule, by message id, what it claims. */
  readonly claims?: Readonly<Record<string, SuggestionClaim>>
  /** The sentences of the document, each with its cases and their inputs. */
  readonly sentences?: readonly SentenceCases[]
}

/** The corpus fixture `<diagram>/<name>`; the test fails when there is none. */
async function corpusFixture(fixtureName: string): Promise<Fixture> {
  const [diagram = "", ...nameParts] = fixtureName.split("/")
  const fixture = isDiagramType(diagram)
    ? (await loadFixtures(diagram)).find(
        (candidate) => candidate.name === nameParts.join("/"),
      )
    : undefined
  if (fixture === undefined) {
    throw new Error(`no corpus fixture ${fixtureName}`)
  }
  return fixture
}

/** The text of `text` with each run of whitespace replaced by one space. */
function collapsedWhitespace(text: string): string {
  return text.split(/\s+/u).join(" ")
}

/** Checks the suggestions of `reports` against the claims of `sentenceCase`. */
function checkOffers(
  sentenceCase: SentenceCase,
  input: string,
  reports: readonly Linter.LintMessage[],
): void {
  if (sentenceCase.offers === undefined) return
  const offered = new Set(
    reports.flatMap((report) =>
      (report.suggestions ?? []).map((suggestion) => suggestion.messageId),
    ),
  )

  /** Orders the ids of messages. */
  function byName(left: unknown, right: unknown): number {
    return String(left).localeCompare(String(right))
  }

  expect([...offered].sort(byName), `${sentenceCase.case}: ${input}`).toEqual(
    [...sentenceCase.offers].sort(byName),
  )
}

/** Checks the messages of `reports` against the claims of `sentenceCase`. */
function checkMessages(
  sentenceCase: SentenceCase,
  input: string,
  reports: readonly Linter.LintMessage[],
): void {
  for (const report of reports) {
    const where = `${sentenceCase.case}: ${input}`
    if (sentenceCase.messageHas !== undefined) {
      expect(report.message, where).toContain(sentenceCase.messageHas)
    }
    if (sentenceCase.messageLacks !== undefined) {
      expect(report.message, where).not.toContain(sentenceCase.messageLacks)
    }
  }
}

/**
 * Checks that each passage of `sentences` is in the English document of the
 * rule, and that, for each case, the inputs exist, are of the kind that the
 * case says (the rule reports on them or not), and, where the case says so,
 * get a suggestion or not.
 */
function testSentences(
  name: string,
  rule: MermaidRuleDefinition,
  cases: { valid: RuleCase[]; invalid: RuleCase[] },
  sentences: readonly SentenceCases[],
  options: Required<Pick<TestRuleOptions, "revealed" | "claims">>,
): void {
  if (sentences.length === 0) return
  const document = collapsedWhitespace(
    readFileSync(ruleDocumentPath(RULE_DOCS_DIR, name, "en"), "utf8"),
  )
  const ruleId = `mmd/${name}`
  const linter = new LinterClass({ configType: "flat" })

  /** The reports of the rule on the input of `testCase`. */
  function reportsOn(testCase: RuleCase): Linter.LintMessage[] {
    return linter
      .verify(
        withoutByteOrderMark(testCase.code),
        IMPLEMENTED_RULES_CONFIG,
        testCase.filename,
      )
      .filter((message) => message.ruleId === ruleId)
  }

  /** Whether the rule offers a suggestion on the input of `testCase`. */
  function suggestsOn(testCase: RuleCase): boolean {
    return reportsOn(testCase).some(
      (message) => (message.suggestions ?? []).length > 0,
    )
  }

  describe(`${name} sentences`, () => {
    it.each(sentences.map((each) => [each.sentence, each] as const))(
      "%s",
      async (_sentence, each) => {
        expect(document).toContain(collapsedWhitespace(each.sentence))
        expect(each.cases.length).toBeGreaterThan(0)
        for (const sentenceCase of each.cases) {
          expect(
            sentenceCase.inputs.length +
              (sentenceCase.written?.length ?? 0) +
              (sentenceCase.corpus?.length ?? 0),
          ).toBeGreaterThan(0)
          const written = [...(sentenceCase.written ?? [])]
          for (const fixtureName of sentenceCase.corpus ?? []) {
            written.push({
              name: fixtureName,
              code: (await corpusFixture(fixtureName)).input,
            })
          }
          for (const each of written) {
            const testCase: RuleCase = {
              name: each.name,
              filename: `written/${each.name.replaceAll("/", "-")}.mmd`,
              code: each.code,
            }
            const reports = reportsOn(testCase)
            expect(
              reports.length > 0,
              `${sentenceCase.case}: ${each.name}`,
            ).toBe(sentenceCase.reports)
            checkMessages(sentenceCase, each.name, reports)
            checkOffers(sentenceCase, each.name, reports)
            if (sentenceCase.suggests !== undefined) {
              expect(
                suggestsOn(testCase),
                `${sentenceCase.case}: ${each.name}`,
              ).toBe(sentenceCase.suggests)
            }
            if (rule.meta?.hasSuggestions === true) {
              await checkSuggestions(linter, ruleId, testCase, options)
            }
          }
          for (const fixtureName of sentenceCase.recorded ?? []) {
            await corpusFixture(fixtureName)
          }
          const pool = sentenceCase.reports ? cases.invalid : cases.valid
          for (const input of sentenceCase.inputs) {
            const testCase = pool.find((candidate) => candidate.name === input)
            expect(
              testCase,
              `${sentenceCase.case}: ${input} is no ${
                sentenceCase.reports ? "invalid" : "valid"
              } input of the rule`,
            ).toBeDefined()
            if (testCase === undefined) continue
            checkMessages(sentenceCase, input, reportsOn(testCase))
            checkOffers(sentenceCase, input, reportsOn(testCase))
            if (sentenceCase.suggests !== undefined) {
              expect(
                suggestsOn(testCase),
                `${sentenceCase.case}: ${input}`,
              ).toBe(sentenceCase.suggests)
            }
          }
          for (const [input, fixtureName] of Object.entries(
            sentenceCase.results ?? {},
          )) {
            const testCase = pool.find((candidate) => candidate.name === input)
            expect(testCase, `${sentenceCase.case}: ${input}`).toBeDefined()
            if (testCase === undefined) continue
            const text = withoutByteOrderMark(testCase.code)
            const outputs = reportsOn(testCase).flatMap((report) =>
              (report.suggestions ?? []).map((suggestion) =>
                applyFix(text, suggestion.fix),
              ),
            )
            expect(
              outputs,
              `${sentenceCase.case}: ${input} gives ${fixtureName}`,
            ).toContain((await corpusFixture(fixtureName)).input)
          }
        }
      },
      60_000,
    )
  })
}

/**
 * Tests the rule `name` (such as `flowchart/no-ignored-text`) on the examples
 * of its document and on the inputs of its fixture directory (see
 * `ruleCases`).
 */
export function testRule(
  name: string,
  rule: MermaidRuleDefinition,
  options: TestRuleOptions = {},
): void {
  const { revealed = { kind: "none" }, claims = {}, sentences = [] } = options
  const cases = ruleCases(name)
  testSentences(name, rule, cases, sentences, { revealed, claims })
  // The tester takes the rule types of JavaScript; ESLint runs a rule of any
  // language the same way.
  new SnapshotRuleTester(LANGUAGE_CONFIG).run(
    name,
    rule as unknown as Rule.RuleModule,
    cases,
  )
  if (rule.meta?.hasSuggestions !== true) return
  const ruleId = `mmd/${name}`
  const linter = new LinterClass({ configType: "flat" })
  describe(`${name} suggestions`, () => {
    it("are checked with the rule of the plugin", () => {
      expect(rules[name]).toBe(rule)
      if (revealed.kind === "rules") {
        for (const revealedName of Object.keys(revealed.rules)) {
          expect(rules).toHaveProperty([revealedName])
        }
      }
    })
    it.each(cases.invalid.map((testCase) => [testCase.name, testCase]))(
      "%s",
      async (_name, testCase) => {
        await checkSuggestions(linter, ruleId, testCase, { revealed, claims })
      },
      // The first text that mermaid.js reads starts it, which takes seconds.
      60_000,
    )
    it("are offered on some invalid case", () => {
      const offered = cases.invalid.some((testCase) =>
        linter
          .verify(
            withoutByteOrderMark(testCase.code),
            IMPLEMENTED_RULES_CONFIG,
            testCase.filename,
          )
          .some(
            (message) =>
              message.ruleId === ruleId &&
              (message.suggestions ?? []).length > 0,
          ),
      )
      expect(offered).toBe(true)
    })
  })
}
