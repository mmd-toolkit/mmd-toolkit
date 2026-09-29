import type { Doc } from "prettier"
import type { Frontmatter, Root } from "@mmd-toolkit/parser"
import { readGap } from "./gap.ts"
import type { Line } from "./lines.ts"
import {
  joinLines,
  printAsWritten,
  withLeading,
  withTrailing,
} from "./lines.ts"
import type { Source } from "./source.ts"

/**
 * Prints what every diagram type shares: the frontmatter and the comments
 * and directives before the diagram, then the diagram body, which its
 * diagram printer prints to the end of the text.
 *
 * `yamlDoc` is the frontmatter body formatted as YAML, or undefined to print
 * it as written; see `printFrontmatter`. The lines before the diagram start
 * at the first column; empty lines at the start of the text are dropped, and
 * runs of empty lines between the lines become one.
 */
export function printRoot(
  root: Root,
  printBody: () => Doc,
  source: Source,
  yamlDoc?: Doc,
): Doc {
  const lines: Line[] = []
  let offset = 0
  if (root.frontmatter !== null) {
    lines.push({
      doc: printFrontmatter(source, root.frontmatter, yamlDoc),
      blankBefore: false,
      endsWithWhitespace: false,
    })
    offset = root.frontmatter.range[1]
  }
  const gap = readGap(source, offset, root.body.range[0], "separator")
  if (gap.trailing !== null) {
    // Without frontmatter, nothing precedes the first line of the text, so
    // its comments and directives are a line of their own.
    const last = lines.pop()
    lines.push(
      last === undefined
        ? {
            doc: gap.trailing.doc,
            blankBefore: false,
            endsWithWhitespace: gap.trailing.endsWithWhitespace,
          }
        : {
            ...last,
            doc: withTrailing(last.doc, gap.trailing),
            endsWithWhitespace: gap.trailing.endsWithWhitespace,
          },
    )
  }
  for (const line of gap.lines) {
    lines.push({
      doc: line.run.doc,
      blankBefore: lines.length > 0 && line.blankBefore,
      endsWithWhitespace: line.run.endsWithWhitespace,
    })
  }
  lines.push({
    doc: withLeading(gap.leading, printBody()),
    blankBefore: lines.length > 0 && gap.blankAfter,
    endsWithWhitespace: false,
  })
  return joinLines(lines, "")
}

/**
 * Prints the frontmatter: its delimiter lines as written, with the indent
 * before them, since the closing line must repeat the opening line's indent
 * character for character (common.md, Frontmatter); and its body, formatted
 * as YAML (`yamlDoc`) or as written. The frontmatter starts the text, and
 * its range starts at the opening `---`, after the indent (ast.md,
 * Frontmatter), so the text is printed as written from its start.
 */
function printFrontmatter(
  source: Source,
  frontmatter: Frontmatter,
  yamlDoc: Doc | undefined,
): Doc {
  const end = frontmatter.range[1]
  const [valueStart, valueEnd] = frontmatter.valueRange
  return [
    printAsWritten(source, 0, valueStart),
    yamlDoc ?? printAsWritten(source, valueStart, valueEnd),
    printAsWritten(source, valueEnd, end),
  ]
}
