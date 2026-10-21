import type { Doc } from "prettier"
import { builders } from "prettier/doc"
import { endsWithSpaceOrTab, readGap } from "./gap.ts"
import { isInsideStyleRuleStretch } from "./kept-lines.ts"
import type { Line } from "./lines.ts"
import {
  lineBreakBetween,
  printAsWritten,
  withLeading,
  withTrailing,
} from "./lines.ts"
import type { Source } from "./source.ts"

const { indent } = builders

/**
 * A piece of a statement that is printed as written: a token, a node whose
 * text is a value (such as an id or a label), or a stretch of the source
 * that must keep its exact text (such as a list of styles).
 */
export interface Atom {
  readonly start: number
  readonly end: number
}

/**
 * How the whitespace before an atom is printed when the source has no line
 * break and no comment or directive there: one space, or none. Without a
 * rule, one space where the source has whitespace, none where it has none.
 */
export type GapRule = "space" | "none"

/**
 * How a line break in a gap that holds nothing but whitespace is printed:
 * kept, or joined into the line, as whitespace on one line is (see
 * `printAtoms`).
 */
export type LineBreakRule = "kept" | "joined"

/** The atoms of a statement in source order, and the rules for their gaps. */
export interface AtomLayout {
  readonly atoms: readonly Atom[]
  /** Rules by the start of the atom after the gap. */
  readonly rules: ReadonlyMap<number, GapRule>
  /**
   * The starts of the atoms whose line, when the source breaks the line
   * before them, starts at the indentation of the statement rather than one
   * level deeper, such as the `}` that closes an `accDescr` block.
   */
  readonly outdented: ReadonlySet<number>
  /**
   * How the line breaks between atoms are printed. A layout whose line
   * breaks are joined has none in a gap that holds a comment or a
   * directive: such a statement is laid out as one atom, kept as written.
   */
  readonly lineBreaks: LineBreakRule
  /**
   * The starts of the atoms whose gap before them is joined into the line
   * although the layout keeps its line breaks, as for the text that starts on
   * the line after the `:` of an event in a timeline, where the line break is
   * the one whitespace character that the lexer reads after the colon. Such a
   * gap holds no comment and no directive, as for a layout that joins its line
   * breaks. It also normalizes a Unicode separator in such a gap, as the
   * consumed separator of a title. Without it, no gap is joined.
   */
  readonly joinedBefore?: ReadonlySet<number>
}

/** Where the lines of a statement start. */
export interface StatementIndentation {
  /** The indentation of the statement's first line. */
  readonly statement: string
  /** The indentation of its later lines, one level deeper. */
  readonly continuation: string
}

/** A printed statement, and whether its last line ends with whitespace to keep. */
export interface PrintedAtoms {
  readonly doc: Doc
  readonly endsWithWhitespace: boolean
}

/**
 * Prints atoms with the gaps between them.
 *
 * Within a line, a run of whitespace becomes one space, or what the gap's
 * rule says. Comments and directives in a gap are printed as written, with
 * the spacing of the source around them. Where the source breaks the line
 * inside the statement, the line stays broken, and every later line of the
 * statement starts one level deeper, except the lines of the layout's
 * outdented atoms; runs of empty lines become one. When the layout joins
 * line breaks, or joins the one before an atom (`joinedBefore`), such a line
 * break is printed as whitespace on one line is.
 */
export function printAtoms(
  source: Source,
  layout: AtomLayout,
  indentation: StatementIndentation,
): PrintedAtoms {
  const lines: StatementLine[] = []
  let current: Doc[] = []
  let currentBlank = false
  let currentEndsWithWhitespace = false
  let currentOutdented = false
  let previous: Atom | undefined

  /** Ends the current line and starts a new one. */
  function breakCurrentLine(blankBefore: boolean, outdented: boolean): void {
    lines.push({
      doc: current,
      blankBefore: currentBlank,
      endsWithWhitespace: currentEndsWithWhitespace,
      outdented: currentOutdented,
    })
    current = []
    currentBlank = blankBefore
    currentEndsWithWhitespace = false
    currentOutdented = outdented
  }

  for (const atom of layout.atoms) {
    const text = source.text.slice(atom.start, atom.end)
    if (previous !== undefined) {
      const gap = readGap(source, previous.end, atom.start, true)
      if (
        gap.breaksLine &&
        (layout.lineBreaks === "joined" ||
          layout.joinedBefore?.has(atom.start) === true)
      ) {
        if (
          gap.trailing !== null ||
          gap.lines.length > 0 ||
          gap.leading !== null
        ) {
          throw new Error(
            `prettier-plugin-mmd: a line break to join at offset ${previous.end} has a comment or a directive`,
          )
        }
        current.push(spaceFor(layout.rules.get(atom.start), previous, atom))
      } else if (gap.breaksLine) {
        if (gap.trailing !== null) {
          current = [withTrailing(current, gap.trailing)]
          currentEndsWithWhitespace = gap.trailing.endsWithWhitespace
        }
        for (const line of gap.lines) {
          breakCurrentLine(line.blankBefore, false)
          current = [line.run.doc]
          currentEndsWithWhitespace = line.run.endsWithWhitespace
        }
        breakCurrentLine(gap.blankAfter, layout.outdented.has(atom.start))
        if (gap.leading !== null) current = [withLeading(gap.leading, "")]
      } else if (gap.trailing !== null || gap.leading !== null) {
        // Items keep the whitespace written on each side of them; the rule
        // of the gap does not apply (docs/flowchart.md, Directives and
        // Semicolons).
        current = [withTrailing(current, gap.trailing)]
        if (gap.leading !== null) {
          const spaced =
            gap.trailing === null
              ? gap.leading.spaceBefore
              : gap.trailing.spaceAfter
          current = [current, spaced ? " " : "", withLeading(gap.leading, "")]
        }
      } else {
        const written = source.text.slice(previous.end, atom.start)
        // A U+2028 or U+2029 is not whitespace to every rule of mermaid.js,
        // which reads `class A`, U+2028, and ` direction LR` as one name,
        // and the same with a space as a statement and a direction: the gap
        // stays as written. A gap between a `:` and a `#` of a line that the
        // line rule may read keeps whether it holds whitespace, which decides
        // whether the rule ignores a `;` (see `isInsideStyleRuleStretch`): one
        // space where it holds some, none where the tokens touch.
        const inStyleRuleStretch = isInsideStyleRuleStretch(
          source,
          previous.end,
          atom.start,
        )
        current.push(
          (written.includes("\u2028") || written.includes("\u2029")) &&
            layout.joinedBefore?.has(atom.start) !== true
            ? written
            : inStyleRuleStretch
              ? written === ""
                ? ""
                : " "
              : spaceFor(layout.rules.get(atom.start), previous, atom),
        )
      }
    }
    current.push(printAsWritten(source, atom.start, atom.end))
    currentEndsWithWhitespace = endsWithSpaceOrTab(text)
    previous = atom
  }
  breakCurrentLine(false, false)
  return {
    doc: lines.map((line, index) => {
      if (index === 0) return line.doc
      const previousLine = lines[index - 1]
      if (line.outdented) {
        return [
          lineBreakBetween(previousLine, line, indentation.statement),
          line.doc,
        ]
      }
      return indent([
        lineBreakBetween(previousLine, line, indentation.continuation),
        line.doc,
      ])
    }),
    endsWithWhitespace: lines[lines.length - 1].endsWithWhitespace,
  }
}

/** A line of a statement, and whether it starts at the statement's indentation. */
interface StatementLine extends Line {
  readonly outdented: boolean
}

/** The space printed between two atoms on one line with nothing between them. */
function spaceFor(rule: GapRule | undefined, previous: Atom, next: Atom): Doc {
  if (rule === "space") return " "
  if (rule === "none") return ""
  return next.start > previous.end ? " " : ""
}
