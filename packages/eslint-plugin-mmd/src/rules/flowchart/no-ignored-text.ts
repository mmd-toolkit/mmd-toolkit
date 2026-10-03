import type { SuggestedEdit } from "@eslint/core"
import type {
  Comment,
  FlowchartDirectionStatement,
  FlowchartIgnoredText,
  Range,
  Token,
} from "@mmd-toolkit/parser"
import { parse, traverseNodes } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../../rule-types.ts"
import { ruleDocsUrl } from "../../rule-docs-url.ts"
import type { MermaidSourceCode } from "../../source-code.ts"

/**
 * Where a text stands on a direction line: before `direction`, or after the
 * direction value.
 */
type Side = "before" | "after"

/** A text on a direction line that the rule reports, and where it stands. */
interface ReportedText {
  readonly text: FlowchartIgnoredText
  readonly side: Side
}

/**
 * The two ways to break a line at a `;`: `keep` is the range of the
 * whitespace after the `;`, which stays; `drop` is the range of the `;` and
 * the whitespace around it.
 */
interface Break {
  readonly keep: Range
  readonly drop: Range
}

/**
 * A way to split a direction line: each of `ranges` becomes a line break.
 * `keepsSeparators` tells whether a `;` stays at the end of each line that a
 * line break ends.
 */
interface Split {
  readonly ranges: readonly Range[]
  readonly keepsSeparators: boolean
}

/** Whether `character` is a `;` or whitespace. */
function isSeparatorOrSpace(character: string): boolean {
  return character === ";" || character.trim() === ""
}

/** Where the `;` and whitespace at the end of `value` start. */
function trailingSeparatorsStart(value: string): number {
  let index = value.length
  while (index > 0 && isSeparatorOrSpace(value[index - 1] ?? "")) index--
  return index
}

/** Where the `;` and whitespace at the start of `value` end. */
function leadingSeparatorsEnd(value: string): number {
  let index = 0
  while (index < value.length && isSeparatorOrSpace(value[index] ?? "")) {
    index++
  }
  return index
}

/**
 * Whether the rule reports `text`, which stands on the `side` of the
 * direction on its line. Text that is only `;` and whitespace drops nothing:
 * the `;` ends the statement before it, as after `end`. Text after the value
 * from a `%%` on is meant as a comment, which mermaid.js drops as the author
 * meant; so only what stands before that `%%` counts, and a `;` there ends a
 * statement, as before.
 */
function isReported(text: FlowchartIgnoredText, side: Side): boolean {
  const comment = side === "after" ? text.value.indexOf("%%") : -1
  const counted = comment === -1 ? text.value : text.value.slice(0, comment)
  return ![...counted].every(isSeparatorOrSpace)
}

/** The texts of the direction statement `node` that the rule reports. */
function reportedTexts(node: FlowchartDirectionStatement): ReportedText[] {
  const texts: ReportedText[] = []
  if (node.textBefore !== null && isReported(node.textBefore, "before")) {
    texts.push({ text: node.textBefore, side: "before" })
  }
  if (node.textAfter !== null && isReported(node.textAfter, "after")) {
    texts.push({ text: node.textAfter, side: "after" })
  }
  return texts
}

/**
 * Whether `token` is a `;` token: a separator of statements, or a `;` that the
 * line rule of `style` and `classDef` ignores (an `IgnoredSemicolon` token).
 * Both stand in the places of a separator and are no part of a text.
 */
function isSemicolonToken(token: Token | Comment): boolean {
  return (
    (token.type === "Punctuator" && token.value === ";") ||
    token.type === "IgnoredSemicolon"
  )
}

/**
 * The break of the line at the `;` between a reported text and the direction,
 * or null where no `;` stands between them. The gap between them runs from the
 * token on their left to the token on their right: the text and `direction`
 * for the text before `direction`, the direction value and the text for the
 * text after the value. It holds `;` tokens (also ignored ones) and
 * whitespace, and the `;` and whitespace that the text has at that edge
 * (`direction` and the value have none); `drop` is the whole gap, and `keep`
 * its part after its last `;`.
 */
function breakOf(
  sourceCode: MermaidSourceCode,
  { text, side }: ReportedText,
): Break | null {
  const notSemicolon = {
    filter: (token: Token | Comment) => !isSemicolonToken(token),
  }
  const [left, right] =
    side === "before"
      ? [
          sourceCode.getLastToken(text),
          sourceCode.getTokenAfter(text, notSemicolon),
        ]
      : [
          sourceCode.getTokenBefore(text, notSemicolon),
          sourceCode.getFirstToken(text),
        ]
  if (left === null || right === null) return null
  const gap: Range = [
    left.range[0] + trailingSeparatorsStart(left.value),
    right.range[0] + leadingSeparatorsEnd(right.value),
  ]
  const lastSeparator = sourceCode.text.slice(...gap).lastIndexOf(";")
  if (lastSeparator === -1) return null
  return { keep: [gap[0] + lastSeparator + 1, gap[1]], drop: gap }
}

/** The whitespace at the start of the line `line` (counted from 1). */
function indentationOf(sourceCode: MermaidSourceCode, line: number): string {
  const text = sourceCode.lines[line - 1] ?? ""
  return text.slice(0, text.length - text.trimStart().length)
}

/**
 * `source` with each of `ranges`, which are in order and do not overlap,
 * replaced with `lineBreak`; and, for each of them, where its line break
 * starts in the result.
 */
function applySplit(
  source: string,
  ranges: readonly Range[],
  lineBreak: string,
): { readonly text: string; readonly breaks: readonly number[] } {
  let text = ""
  let copied = 0
  const breaks: number[] = []
  for (const range of ranges) {
    text += source.slice(copied, range[0])
    breaks.push(text.length)
    text += lineBreak
    copied = range[1]
  }
  return { text: text + source.slice(copied), breaks }
}

/**
 * Whether the text that `split` gives the direction line `node` is read as
 * the split means: the parser accepts it, as the language reads a text; each
 * `;` that the split keeps, right before a line break, is a `;` token there, a
 * separator, and not part of the text of the statement before it; and no
 * direction statement in the place of the split line holds text that the rule
 * reports. The ranges of the split lie in `node`, so the end of that place
 * moves by as much as the text grows. The split is checked by parsing the
 * result, so the rule does not repeat the grammar of the statements.
 */
function splitIsRead(
  sourceCode: MermaidSourceCode,
  node: FlowchartDirectionStatement,
  split: Split,
  lineBreak: string,
): boolean {
  const { text, breaks } = applySplit(sourceCode.text, split.ranges, lineBreak)
  let root
  try {
    root = parse(text)
  } catch {
    return false
  }
  if (
    split.keepsSeparators &&
    !breaks.every((index) =>
      root.tokens.some(
        (token) => token.range[0] === index - 1 && isSemicolonToken(token),
      ),
    )
  ) {
    return false
  }
  const span: Range = [
    node.range[0],
    node.range[1] + text.length - sourceCode.text.length,
  ]
  let clean = true
  traverseNodes(root, {
    enterNode(statement) {
      if (statement.type !== "FlowchartDirectionStatement") return
      if (statement.range[1] <= span[0] || span[1] <= statement.range[0]) {
        return
      }
      if (reportedTexts(statement).length > 0) clean = false
    },
    leaveNode() {
      // Each statement is checked on entering it.
    },
  })
  return clean
}

/**
 * The suggestion for the direction line `node`, whose reported texts are
 * `reported`: when a `;` separates each of them from the direction, break the
 * line after that `;`, so that the texts become statements and the direction
 * a direction statement of its own. The `;` stays, as when the author breaks
 * the line after it; where it would then be part of the text of the statement
 * before it, as after `accTitle: t`, the `;` goes with the whitespace instead.
 * Each of the two is offered only when the parser reads the result so (see
 * `splitIsRead`), the first that is. Without a `;`, it is not clear that a
 * text was meant as statements; inside a label, a line break would change the
 * label. So there is no suggestion then, and none that drops the texts.
 */
function splitSuggestions(
  sourceCode: MermaidSourceCode,
  node: FlowchartDirectionStatement,
  reported: readonly ReportedText[],
): SuggestedEdit<"splitAtSeparator">[] {
  const breaks: Break[] = []
  for (const text of reported) {
    const each = breakOf(sourceCode, text)
    if (each === null) return []
    breaks.push(each)
  }
  const lineBreak = `\n${indentationOf(sourceCode, node.loc.start.line)}`
  const split = [
    { ranges: breaks.map((each) => each.keep), keepsSeparators: true },
    { ranges: breaks.map((each) => each.drop), keepsSeparators: false },
  ].find((candidate) => splitIsRead(sourceCode, node, candidate, lineBreak))
  if (split === undefined) return []
  return [
    {
      messageId: "splitAtSeparator",
      fix: (fixer) =>
        split.ranges.map((range) => fixer.replaceTextRange(range, lineBreak)),
    },
  ]
}

/**
 * The rule `flowchart/no-ignored-text`, described in
 * `docs/rules/flowchart/no-ignored-text.md`: text on a direction line before
 * `direction` or after the direction value, which the tree shows as the
 * `textBefore` and the `textAfter` of a `FlowchartDirectionStatement`. Text
 * that is only `;` and whitespace, and text after the value that starts with
 * `%%`, are not reported (see `isReported`).
 */
export const noIgnoredText: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "ignored" | "splitAtSeparator"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow text on a direction line that mermaid.js does not read.",
      recommended: true,
      url: ruleDocsUrl("flowchart/no-ignored-text"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      ignored:
        "mermaid.js reads this line as a `direction` statement and drops this text.",
      splitAtSeparator:
        "Split the line at the `;`: mermaid.js then reads the text as statements, and the direction as a direction statement.",
    },
  },
  create(context) {
    const { sourceCode } = context
    return {
      FlowchartDirectionStatement(node) {
        const reported = reportedTexts(node)
        if (reported.length === 0) return
        const suggest = splitSuggestions(sourceCode, node, reported)
        for (const { text } of reported) {
          context.report({ node: text, messageId: "ignored", suggest })
        }
      },
    }
  },
}
