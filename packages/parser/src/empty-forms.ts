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
  | "empty-backquotes"
  | "empty-href"
  | "empty-markdown-string"
  | "empty-icon"
  | "empty-class-line"

/**
 * known-divergences/tokenless-empty-forms.md: the empty forms of each
 * diagram type that has any. Flowchart has the first three; sequence,
 * whose grammar has no strings and no `call`, has the empty description
 * block only; class has the first five; state has the empty description
 * block only, since its empty strings are text that the tree holds; er has
 * the empty description block and empty backquotes, which inside an
 * attribute block only lie inside an attribute where the tree has no place
 * for them; gantt has the empty description block, the empty href, and the
 * empty call, of which only the empty description block is a statement
 * where a statement starts; requirement has the empty string and the empty
 * description block, which is a statement where a statement starts and an
 * item of a body on a line of the body; mindmap has the empty string, the
 * empty markdown string, the empty icon, and the empty class line, which
 * stand wherever they stand inside no statement; xychart has the empty
 * string, which is a text where its grammar takes one, and the empty
 * description block, which is a statement where a statement starts;
 * quadrant has the empty string, the empty markdown string, and the empty
 * description block, of which only the empty description block is a
 * statement, where a statement starts and after the last unit of one;
 * block has the same three, of which only the empty description block is
 * a statement, where a statement starts. Kanban has the same empty forms
 * as mindmap.
 */
export const EMPTY_FORM_KINDS: Readonly<
  Record<
    | "flowchart"
    | "sequence"
    | "class"
    | "state"
    | "er"
    | "gantt"
    | "requirement"
    | "mindmap"
    | "xychart"
    | "quadrant"
    | "block"
    | "kanban",
    readonly EmptyFormKind[]
  >
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
  er: ["empty-description-block", "empty-backquotes"],
  gantt: ["empty-description-block", "empty-href", "empty-call"],
  requirement: ["empty-string", "empty-description-block"],
  mindmap: [
    "empty-string",
    "empty-markdown-string",
    "empty-icon",
    "empty-class-line",
  ],
  xychart: ["empty-string", "empty-description-block"],
  quadrant: [
    "empty-string",
    "empty-markdown-string",
    "empty-description-block",
  ],
  block: ["empty-string", "empty-markdown-string", "empty-description-block"],
  kanban: [
    "empty-string",
    "empty-markdown-string",
    "empty-icon",
    "empty-class-line",
  ],
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
  "empty-backquotes":
    "Empty backquotes can only be written between two attributes",
  "empty-href": "An empty href cannot be written here",
  "empty-markdown-string": "An empty markdown string cannot be written here",
  "empty-icon": "An empty icon cannot be written here",
  "empty-class-line": "An empty class line cannot be written here",
}

/**
 * The empty forms of the kinds `kinds` among `units`, the units of a
 * diagram text, in source order, wherever they lie: each `empty-string`
 * unit (flowchart, requirement, mindmap, and kanban, Strings), and each `string`
 * unit whose text, what lies between its quotes, is empty (xychart,
 * quadrant, and block, Strings);
 * each empty call, a `call` unit followed directly by a `(` and a `)` unit,
 * with only whitespace between them (flowchart, Click and callbacks); and
 * each empty description block, an `accDescr` and a `{` unit followed
 * directly by a `}` unit, with no `description-block-text` unit (each
 * diagram's Accessibility values); and, in class, each `empty-backquoted`
 * unit and each empty generic type, a `~` unit followed directly by
 * another (class, Strings, backquoted names, and generic types); in er,
 * each `empty-backquotes` unit (er, The attribute block context); and, in
 * gantt, each empty href, an `href` unit followed directly by two `"`
 * units (gantt, The href context); and, in mindmap and kanban, each
 * `empty-markdown-string` unit and, in quadrant and block, each
 * `markdown-string` unit whose text is empty, each empty icon, an `::icon(` unit followed
 * directly by a `)` unit, and each empty class line, a `:::` unit that no
 * `class-text` unit follows (mindmap and kanban, Empty forms), where a `:::` of the
 * other diagram types, which no `class-text` unit ever follows, is no form
 * of the kinds they have. In flowchart, class, and gantt, a `(`
 * after a `call` is always one of the callback name context, which the
 * `call` enters. A diagram whose lexer reads none
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
    if (
      unit.name === "empty-string" ||
      (unit.name === "string" && unit.text === "")
    ) {
      forms.push(formOf("empty-string", [unit]))
      return
    }
    if (unit.name === "empty-backquoted") {
      forms.push(formOf("empty-backquoted-name", [unit]))
      return
    }
    if (unit.name === "empty-backquotes") {
      forms.push(formOf("empty-backquotes", [unit]))
      return
    }
    if (
      unit.name === "empty-markdown-string" ||
      (unit.name === "markdown-string" && unit.text === "")
    ) {
      forms.push(formOf("empty-markdown-string", [unit]))
      return
    }
    const second = units.at(index + 1)
    if (unit.name === ":::" && second?.name !== "class-text") {
      forms.push(formOf("empty-class-line", [unit]))
      return
    }
    if (unit.name === "::icon(" && second?.name === ")") {
      forms.push(formOf("empty-icon", [unit, second]))
      return
    }
    if (unit.name === "~" && second?.name === "~") {
      forms.push(formOf("empty-generic-type", [unit, second]))
      return
    }
    const third = units.at(index + 2)
    if (second === undefined || third === undefined) return
    if (unit.name === "href" && second.name === '"' && third.name === '"') {
      forms.push(formOf("empty-href", [unit, second, third]))
    }
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
