import type {
  ClassDbTexts,
  DbText,
  FlowchartDbTexts,
  SequenceDbTexts,
  StateDbTexts,
} from "@mmd-toolkit/parser"
import {
  classDbTexts,
  flowchartDbTexts,
  sequenceDbTexts,
  stateDbTexts,
} from "@mmd-toolkit/parser"
import { lineEndOf } from "./kept-lines.ts"
import type { Source } from "./source.ts"

// The texts that the Db of mermaid.js reads past the range of a value's node,
// which the parser reads from the text (diagrams/<diagram>.md, Building the
// summary from the tree). The printers keep them as written, and read where
// they lie from these functions, not from the text. Each is read once for
// each source.

const flowchartBySource = new WeakMap<Source, FlowchartDbTexts>()
const sequenceBySource = new WeakMap<Source, SequenceDbTexts>()
const classBySource = new WeakMap<Source, ClassDbTexts>()
const stateBySource = new WeakMap<Source, StateDbTexts>()

/** The flowchart texts of a source that the Db reads past a node. */
export function flowchartDbTextsOf(source: Source): FlowchartDbTexts {
  let texts = flowchartBySource.get(source)
  if (texts === undefined) {
    texts = flowchartDbTexts(source.root, source.text)
    flowchartBySource.set(source, texts)
  }
  return texts
}

/** The sequence texts of a source that the Db reads past a node. */
export function sequenceDbTextsOf(source: Source): SequenceDbTexts {
  let texts = sequenceBySource.get(source)
  if (texts === undefined) {
    texts = sequenceDbTexts(source.root, source.text)
    sequenceBySource.set(source, texts)
  }
  return texts
}

/** The class texts of a source that the Db reads past a node. */
export function classDbTextsOf(source: Source): ClassDbTexts {
  let texts = classBySource.get(source)
  if (texts === undefined) {
    texts = classDbTexts(source.root, source.text)
    classBySource.set(source, texts)
  }
  return texts
}

/** The state texts of a source that the Db reads past a node. */
export function stateDbTextsOf(source: Source): StateDbTexts {
  let texts = stateBySource.get(source)
  if (texts === undefined) {
    texts = stateDbTexts(source.root, source.text)
    stateBySource.set(source, texts)
  }
  return texts
}

/**
 * Where a Db text ends for a printer that prints the empty description blocks
 * in it as statements of their own: at the end of its range, or before the
 * first block that it leaves out after `from` (`DbText.leftOut`).
 */
export function endBeforeBlocks(text: DbText, from: number): number {
  const block = text.leftOut.find((range) => from <= range[0])
  return Math.min(text.range[1], block?.[0] ?? text.range[1])
}

/**
 * Where the printed text of a statement that ends at `statementEnd` ends,
 * when a Db text that starts at `textStart` ends at `textEnd`: the end of the
 * Db text, but not past the line that it starts on. After an unclosed
 * directive, the range of the text reaches the lines after it, which the
 * printer prints as lines of their own, not as part of the statement.
 */
export function printedEndOf(
  source: Source,
  statementEnd: number,
  textStart: number,
  textEnd: number,
): number {
  return Math.max(statementEnd, Math.min(textEnd, lineEndOf(source, textStart)))
}
