/**
 * How the tree documents of the specification describe a field, as the check
 * of a tree reads it. The Type column of the field tables of ast.md, of
 * `ast/<diagram>.md`, and of parser/docs/tokens.md has these forms:
 *
 * - a value: `string`, `boolean`, `integer`, `string or null`, or `one of …`
 *   (a string from a list; `or null` after it when the field may be null);
 * - a node: `X`, `X or null`, `X or Y`, `X, Y, or null`;
 * - a list of nodes: `list of X`, `list of (X or null)`, `list of X, or null`,
 *   `list of (X or Y), or null`.
 */
export type FieldShape =
  /** A value of a type. */
  | "value"
  /** One node (or record). */
  | "node"
  /** One node, or null. */
  | "nodeOrNull"
  /** A list of nodes. */
  | "nodeList"
  /** A list of nodes, each of which may be null. */
  | "nodeListWithNull"
  /** A list of nodes, or null. */
  | "nodeListOrNull"

/** The type of a value field. */
export type ValueType =
  "string" | "stringOrNull" | "boolean" | "number" | "range"

/** A field of a node type, as its table describes it. */
export interface FieldSpec {
  readonly shape: FieldShape
  /** For a value: its type. */
  readonly valueType?: ValueType
  /**
   * For a record: the record's name. A record is placed in the source as a
   * node is, but its `type` is not its name (a token's is its kind), and it
   * is no child node.
   */
  readonly record?: RecordName
}

/** The records of the tree that are no nodes (ast.md, Root and Tokens). */
export type RecordName = "Token" | "Comment" | "Directive" | "Frontmatter"

/** Whether `name` is the name of a record. */
function isRecordName(name: string): name is RecordName {
  return (
    name === "Token" ||
    name === "Comment" ||
    name === "Directive" ||
    name === "Frontmatter"
  )
}

/** Whether `word` is the name of a node type: a capital letter, and a lower case letter after it. */
function isTypeName(word: string): boolean {
  return (
    /^[A-Z]/u.test(word) && /[a-z]/u.test(word) && /^[A-Za-z]+$/u.test(word)
  )
}

/** The words of `text`: runs of letters. */
function wordsOf(text: string): string[] {
  const words: string[] = []
  let word = ""
  for (const character of `${text} `) {
    if (/^[A-Za-z]$/u.test(character)) {
      word += character
    } else {
      if (word.length > 0) words.push(word)
      word = ""
    }
  }
  return words
}

/** The record that `cell` names, if it names exactly one record and no node type. */
function recordOf(cell: string): { record?: RecordName } {
  const names = wordsOf(cell).filter(isTypeName)
  const [only] = names
  return names.length === 1 && only !== undefined && isRecordName(only)
    ? { record: only }
    : {}
}

/**
 * The description of a field from the text of the Type column of its table:
 * markdown links are taken as their text, and backticks are dropped.
 */
export function fieldSpecOf(typeCell: string): FieldSpec {
  const cell = typeCell
    .replace(/\[([^\]]*)\]\([^)]*\)/gu, "$1")
    .replaceAll("`", "")
    .trim()
  if (cell === "string") return { shape: "value", valueType: "string" }
  if (cell === "boolean") return { shape: "value", valueType: "boolean" }
  if (
    cell === "integer" ||
    cell === "number" ||
    cell === "nonnegative integer"
  ) {
    return { shape: "value", valueType: "number" }
  }
  if (cell === "offset pair") return { shape: "value", valueType: "range" }
  // ast.md, Root: the id of the diagram type, one of a list of strings.
  if (cell === "DiagramType") return { shape: "value", valueType: "string" }
  if (cell === "string or null") {
    return { shape: "value", valueType: "stringOrNull" }
  }
  if (cell.startsWith("one of")) {
    const orNull = cell.endsWith("or null")
    return {
      shape: "value",
      valueType: orNull ? "stringOrNull" : "string",
    }
  }
  // ast/c4.md: the C4Argument alias includes null in its flat list.
  if (cell === "list of C4Argument") return { shape: "nodeListWithNull" }
  if (cell.startsWith("list of ")) {
    const rest = cell.slice("list of ".length)
    if (rest.startsWith("(")) {
      // `list of (X or null)` has entries that may be null,
      // `list of (X or Y), or null` is a list that may be null, and
      // `list of (X or Y)` and `list of (X, Y, or Z)` are lists of nodes of
      // several types.
      const entries = rest.slice(0, rest.indexOf(")"))
      const shape = rest.endsWith(", or null")
        ? "nodeListOrNull"
        : wordsOf(entries).includes("null")
          ? "nodeListWithNull"
          : "nodeList"
      return { shape, ...recordOf(cell) }
    }
    return {
      shape: rest.endsWith(", or null") ? "nodeListOrNull" : "nodeList",
      ...recordOf(cell),
    }
  }
  const names = wordsOf(cell).filter(isTypeName)
  if (names.length === 0) {
    throw new Error(`the type ${JSON.stringify(typeCell)} names no node type`)
  }
  return {
    shape: cell.endsWith("null") ? "nodeOrNull" : "node",
    ...recordOf(cell),
  }
}
