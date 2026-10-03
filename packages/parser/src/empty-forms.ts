import type { Range } from "./ast.ts"
import type { DiagramUnit } from "./diagram-units.ts"
import { significantRangeOf } from "./diagram-units.ts"
import { ParseError } from "./errors.ts"
import type { LineIndex } from "./positions.ts"

/**
 * known-divergences/tokenless-empty-forms.md: the forms that are written
 * but hold nothing, for which mermaid.js reads no token, and that have no
 * place in the tree (see {@link EMPTY_FORM_KINDS}).
 */
export type EmptyFormKind =
  | "empty-string"
  | "empty-call"
  | "empty-description-block"
  | "empty-backquoted-name"
  | "empty-generic-type"

/**
 * known-divergences/tokenless-empty-forms.md: the empty forms of each
 * diagram type that has any. Flowchart has the first three; sequence,
 * whose grammar has no strings and no `call`, has the empty description
 * block only; class has all five; state has the empty description block
 * only, since its empty strings are text that the tree holds.
 */
export const EMPTY_FORM_KINDS: Readonly<
  Record<"flowchart" | "sequence" | "class" | "state", readonly EmptyFormKind[]>
> = {
  flowchart: ["empty-string", "empty-call", "empty-description-block"],
  sequence: ["empty-description-block"],
  class: [
    "empty-string",
    "empty-call",
    "empty-description-block",
    "empty-backquoted-name",
    "empty-generic-type",
  ],
  state: ["empty-description-block"],
}

/** One empty form: its kind, its units, and its range, from its first character that is not whitespace to its last. */
export interface EmptyForm<Unit extends DiagramUnit<string>> {
  readonly kind: EmptyFormKind
  readonly units: readonly Unit[]
  readonly range: Range
}

/**
 * known-divergences/tokenless-empty-forms.md: the message of the error
 * for each kind of empty form, which says where it cannot be written.
 */
const EMPTY_FORM_MESSAGES: Readonly<Record<EmptyFormKind, string>> = {
  "empty-string": "An empty string cannot be written here",
  "empty-call": "An empty call cannot be written here",
  "empty-description-block":
    "An empty description block can only be written where a statement starts or ends",
  "empty-backquoted-name": "An empty backquoted name cannot be written here",
  "empty-generic-type": "An empty generic type can only end a class name",
}

/**
 * The empty forms of the kinds `kinds` among `units`, the units of a
 * diagram text, in source order, wherever they lie: each `empty-string`
 * unit (flowchart, Strings);
 * each empty call, a `call` unit followed directly by a `(` and a `)` unit,
 * with only whitespace between them (flowchart, Click and callbacks); and
 * each empty description block, an `accDescr` and a `{` unit followed
 * directly by a `}` unit, with no `description-block-text` unit (each
 * diagram's Accessibility values); and, in class, each `empty-backquoted`
 * unit and each empty generic type, a `~` unit followed directly by
 * another (class, Strings, backquoted names, and generic types). In
 * flowchart and class, a `(` after a `call` is always one of the callback
 * name context, which the `call` enters. A diagram whose lexer reads none
 * of these units has none of these forms.
 */
export function emptyFormsOf<Unit extends DiagramUnit<string>>(
  units: readonly Unit[],
  kinds: readonly EmptyFormKind[],
): EmptyForm<Unit>[] {
  return allEmptyFormsOf(units).filter((form) => kinds.includes(form.kind))
}

/** The empty forms of every kind among `units` (see {@link emptyFormsOf}). */
function allEmptyFormsOf<Unit extends DiagramUnit<string>>(
  units: readonly Unit[],
): EmptyForm<Unit>[] {
  const forms: EmptyForm<Unit>[] = []
  units.forEach((unit, index) => {
    if (unit.name === "empty-string") {
      forms.push(formOf("empty-string", [unit]))
      return
    }
    if (unit.name === "empty-backquoted") {
      forms.push(formOf("empty-backquoted-name", [unit]))
      return
    }
    const second = units.at(index + 1)
    if (unit.name === "~" && second?.name === "~") {
      forms.push(formOf("empty-generic-type", [unit, second]))
      return
    }
    const third = units.at(index + 2)
    if (second === undefined || third === undefined) return
    if (unit.name === "call" && second.name === "(" && third.name === ")") {
      forms.push(formOf("empty-call", [unit, second, third]))
    }
    if (unit.name === "accDescr" && second.name === "{" && third.name === "}") {
      forms.push(formOf("empty-description-block", [unit, second, third]))
    }
  })
  return forms
}

/**
 * ast.md, Nodes: the ranges of the empty description blocks among `units`,
 * the units of a diagram text, that lie in `range`, which the text of the
 * range leaves out. In a text that the grammar accepts, each of them is a
 * statement of its own before the separator of a statement; the range of a
 * leaf node holds none, and a range that a Db normalization reads up to the
 * separator of a statement can.
 */
export function emptyDescriptionBlocksIn(
  units: readonly DiagramUnit<string>[],
  range: Range,
): Range[] {
  return allEmptyFormsOf(units)
    .filter((form) => form.kind === "empty-description-block")
    .map((form) => form.range)
    .filter((block) => range[0] <= block[0] && block[1] <= range[1])
}

/**
 * known-divergences/tokenless-empty-forms.md: the error for the empty
 * form `form`, where no rule takes it, at the whole form.
 */
export function emptyFormError(
  form: EmptyForm<DiagramUnit<string>>,
  lines: LineIndex,
): ParseError {
  return new ParseError(
    EMPTY_FORM_MESSAGES[form.kind],
    form.range,
    lines.location(form.range),
  )
}

/** The empty form of kind `kind` that `units` make. */
function formOf<Unit extends DiagramUnit<string>>(
  kind: EmptyFormKind,
  units: readonly Unit[],
): EmptyForm<Unit> {
  return {
    kind,
    units,
    range: [
      significantRangeOf(units[0])[0],
      significantRangeOf(units[units.length - 1])[1],
    ],
  }
}
