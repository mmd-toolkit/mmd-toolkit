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
import { isDeepStrictEqual } from "node:util"
import { describe, expect, it } from "vitest"
import { parse, traverseNodes } from "@mmd-toolkit/parser"
import type { Range } from "@mmd-toolkit/parser"
import type { DbSummary, JsonValue } from "@mmd-toolkit/tests"
import { loadFixtures } from "@mmd-toolkit/tests"
import { runMermaid } from "@mmd-toolkit/tests/mermaid"
import type { MermaidRuleDefinition } from "../src/index.ts"
import { rules } from "../src/rules/index.ts"
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
 * the text of the input. A claim says all that the message says that the Db can
 * show; what it cannot show is named with `notShownByDb`.
 */
export type SuggestionClaim =
  /** The diagram is read as before: the Db is the same. */
  | { readonly kind: "keepsDb" }
  /**
   * Of two statements that set a field, the one that mermaid.js uses is the
   * one that remains: the field is the same. The members of a subgraph may
   * differ, since the value of the removed statement was one of them.
   */
  | { readonly kind: "keepsField"; readonly field: string }
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
  /** The vertex `id` is gone and the other vertices are the same. */
  | { readonly kind: "removesVertex"; readonly id: string }
  /**
   * One line of only `%%` less in the text of the Db, which holds at least one
   * before; where the line made mermaid.js reject the input, mermaid.js accepts
   * the output.
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
  | NotShownByDb

/**
 * The claim is about something that the Db does not show; mermaid.js accepts
 * the output. `what` names it.
 */
export interface NotShownByDb {
  readonly kind: "notShownByDb"
  readonly what: string
}

/** What a claim is checked on, for one suggestion of one report. */
export interface ClaimFacts {
  /** The text that the suggestion was applied to. */
  readonly input: string
  /** The Db of the input; null where mermaid.js rejects it. */
  readonly before: DbSummary | null
  /** The Db of the text that the suggestion gives. */
  readonly after: DbSummary
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

/** The Db that mermaid.js gives for `text`; the test fails when it rejects. */
export async function dbOf(text: string): Promise<DbSummary> {
  const outcome = await runMermaid(text)
  if (!outcome.accepted || outcome.db === null) {
    throw new Error(
      `mermaid.js gives no Db for ${JSON.stringify(text)}: ${
        outcome.accepted ? "no normalizer" : outcome.error.message
      }`,
    )
  }
  return outcome.db
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
  const outcome = await runMermaid(text)
  return outcome.accepted ? outcome.db : null
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

/** The number of lines of only `%%` in the text of `db`. */
function bareMarkerLines(db: DbSummary): number {
  return textLines(db).filter((line) => line.trim() === "%%").length
}

/**
 * The index in `text` of the position `line` and `column` of a report, which
 * ESLint counts from 1, with the line terminators of the language.
 */
function indexOfPosition(text: string, line: number, column: number): number {
  const lineStarts = [
    0,
    ...[...text.matchAll(/\r\n|[\n\r\u2028\u2029]/gu)].map(
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
  const { input, after, reports, report } = facts
  if (claim.kind === "notShownByDb") return
  if (facts.before === null) {
    // The line of the data made mermaid.js reject the input.
    expect(claim.kind).toBe("removesBareMarkerLine")
    return
  }
  const { before } = facts
  switch (claim.kind) {
    case "keepsDb":
      expect(after).toEqual(before)
      break
    case "keepsField":
      expect(after[claim.field]).toEqual(before[claim.field])
      expect(withoutFieldAndMembers(after, claim.field)).toEqual(
        withoutFieldAndMembers(before, claim.field),
      )
      break
    case "usesLastRemaining": {
      expect(withoutFieldAndMembers(after, claim.field)).toEqual(
        withoutFieldAndMembers(before, claim.field),
      )
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
    case "removesVertex":
      expect(vertexIds(before)).toContain(claim.id)
      expect(vertexIds(after)).toEqual(
        vertexIds(before).filter((id) => id !== claim.id),
      )
      break
    case "removesBareMarkerLine":
      expect(bareMarkerLines(before)).toBeGreaterThan(0)
      expect(bareMarkerLines(after)).toBe(bareMarkerLines(before) - 1)
      break
    case "setsDescription": {
      // The report marks `accDescr {`: the keyword up to the `{`.
      const keyword = indexOfPosition(input, report.line, report.column)
      const brace = indexOfPosition(
        input,
        report.endLine ?? report.line,
        report.endColumn ?? report.column,
      )
      expect(before.accDescr).toBe("")
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
  options: Required<
    Pick<TestRuleOptions, "revealed" | "claims" | "notShownByDb">
  >,
): Promise<void> {
  const { revealed, claims, notShownByDb } = options
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
      const what = notShownByDb[testCase.name]
      const claim: SuggestionClaim | undefined =
        what === undefined
          ? claims[suggestion.messageId ?? ""]
          : { kind: "notShownByDb", what }
      expect(
        claim,
        `a claim for the suggestion ${suggestion.messageId}`,
      ).toBeDefined()
      if (claim !== undefined) {
        await expectClaim(claim, {
          input: text,
          before:
            claim.kind === "notShownByDb"
              ? null
              : await inputDbOf(testCase, text),
          after: await dbOf(output),
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

/** The options of `testRule`. */
export interface TestRuleOptions {
  readonly revealed?: RevealedReports
  /** For each suggestion of the rule, by message id, what it claims. */
  readonly claims?: Readonly<Record<string, SuggestionClaim>>
  /**
   * The invalid cases, by name, whose suggestions claim something that the Db
   * does not show, with what that is. It takes the place of the claim of the
   * message id there.
   */
  readonly notShownByDb?: Readonly<Record<string, string>>
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
  const {
    revealed = { kind: "none" },
    claims = {},
    notShownByDb = {},
  } = options
  const cases = ruleCases(name)
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
        await checkSuggestions(linter, ruleId, testCase, {
          revealed,
          claims,
          notShownByDb,
        })
      },
      // The first text that mermaid.js reads starts it, which takes seconds.
      60_000,
    )
    it("name with notShownByDb only invalid cases that offer a suggestion", () => {
      for (const caseName of Object.keys(notShownByDb)) {
        const testCase = cases.invalid.find(
          (candidate) => candidate.name === caseName,
        )
        expect(testCase, `the invalid case ${caseName}`).toBeDefined()
        const offered = linter
          .verify(
            withoutByteOrderMark(testCase?.code ?? ""),
            IMPLEMENTED_RULES_CONFIG,
            testCase?.filename,
          )
          .some(
            (message) =>
              message.ruleId === ruleId &&
              (message.suggestions ?? []).length > 0,
          )
        expect(offered, `${caseName} offers a suggestion`).toBe(true)
      }
    })
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
