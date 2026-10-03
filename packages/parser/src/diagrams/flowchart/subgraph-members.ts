import type { Range } from "../../ast.ts"
import type {
  FlowchartStatement,
  FlowchartSubgraphStatement,
  FlowchartVertexStatement,
} from "../../ast/flowchart.ts"
import { isWhitespace } from "../../character-classes.ts"

/**
 * diagrams/flowchart.md, Rejections outside the grammar, Subgraph members:
 * the member that a subgraph must not have before another member.
 */
export const HAS_OWN_PROPERTY = "hasOwnProperty"

/**
 * diagrams/flowchart.md, Rejections outside the grammar, Subgraph members: a member of a
 * subgraph that is not empty or all whitespace, as the rejection of
 * Subgraph members needs it. The rejection only asks whether a member is
 * `hasOwnProperty` and whether it is empty or all whitespace; the value as
 * written answers both as the converted form does, because converting
 * changes no letter and turns no character into whitespace or whitespace
 * into another character.
 */
export interface SubgraphMember {
  /** Whether the member is `hasOwnProperty`. */
  readonly isHasOwnProperty: boolean
  /** Where the member is written: the node or the statement that gives it. */
  readonly range: Range
}

/** Whether `character`, one code point, is whitespace. */
function isWhitespaceCharacter(character: string): boolean {
  const codePoint = character.codePointAt(0)
  return codePoint !== undefined && isWhitespace(codePoint)
}

/** Whether `text` is empty or all whitespace. */
export function isBlank(text: string): boolean {
  return [...text].every(isWhitespaceCharacter)
}

/** Whether `text` holds a whitespace character. */
export function holdsWhitespace(text: string): boolean {
  return [...text].some(isWhitespaceCharacter)
}

/** `text` without the whitespace at its two ends. */
export function trimmed(text: string): string {
  const characters = [...text]
  let start = 0
  let end = characters.length
  while (start < end && isWhitespaceCharacter(characters[start])) start += 1
  while (end > start && isWhitespaceCharacter(characters[end - 1])) end -= 1
  return characters.slice(start, end).join("")
}

/**
 * Rejections outside the grammar, Subgraph members: the members of
 * `statement`, the ids of its last group, then those of the group before
 * it, and so on back to the first group.
 */
function vertexStatementMembers(
  statement: FlowchartVertexStatement,
): SubgraphMember[] {
  const groups = [
    statement.first,
    ...statement.links.map((link) => link.target),
  ].reverse()
  return groups.flatMap((group) =>
    group.vertices.map((vertex) => ({
      isHasOwnProperty: vertex.id.name === HAS_OWN_PROPERTY,
      range: vertex.id.range,
    })),
  )
}

/**
 * Rejections outside the grammar, Subgraph members: the members of a
 * subgraph whose body is `body`, in the order of the body, other than those that are empty or all
 * whitespace: the members of its vertex statements, the Db id of each
 * nested subgraph, the value of each accessibility statement whose value is
 * not null, and `;` for each empty statement. `nestedMember` gives the
 * member of a nested subgraph, whose Db id the grammar decides when it
 * reads the subgraph, or null when that id is empty or all whitespace.
 */
export function subgraphMembersOf(
  body: readonly FlowchartStatement[],
  nestedMember: (
    statement: FlowchartSubgraphStatement,
  ) => SubgraphMember | null,
): SubgraphMember[] {
  const members: SubgraphMember[] = []
  for (const statement of body) {
    switch (statement.type) {
      case "FlowchartVertexStatement":
        members.push(...vertexStatementMembers(statement))
        break
      case "FlowchartSubgraphStatement": {
        const member = nestedMember(statement)
        if (member !== null) members.push(member)
        break
      }
      case "FlowchartAccTitleStatement":
      case "FlowchartAccDescrStatement":
      case "FlowchartAccDescrBlockStatement":
        if (statement.value !== null && !isBlank(statement.value.value)) {
          members.push({
            isHasOwnProperty: statement.value.value === HAS_OWN_PROPERTY,
            range: statement.value.range,
          })
        }
        break
      case "FlowchartEmptyStatement":
        members.push({ isHasOwnProperty: false, range: statement.range })
        break
      default:
        break
    }
  }
  return members
}

/**
 * Rejections outside the grammar, Subgraph members: the first member of
 * `members` that follows a member `hasOwnProperty`, which makes the
 * subgraph rejected; null when there is none.
 */
export function memberAfterHasOwnProperty(
  members: readonly SubgraphMember[],
): SubgraphMember | null {
  const first = members.findIndex((member) => member.isHasOwnProperty)
  if (first === -1) return null
  return members[first + 1] ?? null
}
