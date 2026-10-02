import type { Range } from "./ast.ts"
import type { DiagramUnit } from "./diagram-units.ts"
import { significantRangeOf } from "./diagram-units.ts"
import { ParseError } from "./errors.ts"
import type { LineIndex } from "./positions.ts"

/**
 * known-divergences/tokenless-empty-forms.md: the forms that are written
 * but hold nothing, for which mermaid.js reads no token. Flowchart has the
 * first three; sequence, whose grammar has no strings and no `call`, has the
 * empty description block only; class has all five.
 */
export type EmptyFormKind =
  | "empty-string"
  | "empty-call"
  | "empty-description-block"
  | "empty-backquoted-name"
  | "empty-generic-type"

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
    "An empty description block can only be written where a statement starts",
  "empty-backquoted-name": "An empty backquoted name cannot be written here",
  "empty-generic-type": "An empty generic type can only end a class name",
}

/**
 * The empty forms among `units`, the units of a diagram text, in source
 * order, wherever they lie: each `empty-string` unit (flowchart, Strings);
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
