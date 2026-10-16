import { TILDE } from "../../code-points.ts"

/**
 * diagrams/class.md, Rejections outside the grammar: the id of the
 * written name `writtenName`, the text before its first `~` when it has a
 * `~` and its first `~` is not its first character, and the written name
 * otherwise.
 */
export function classIdOf(writtenName: string): string {
  const characters = [...writtenName]
  const first = characters.findIndex(
    (character) => character.codePointAt(0) === TILDE,
  )
  if (first <= 0) return writtenName
  return characters.slice(0, first).join("")
}
