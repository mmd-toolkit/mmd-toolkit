import type { ClassName } from "@mmd-toolkit/parser"

/**
 * The id of a class name, as the Db of mermaid.js derives it from the tree
 * (the section Building the summary from the tree, Names, in
 * `packages/tests/docs/db-from-tree/class.md`): none of the fields of the
 * class name is the id, but its written name is. The written name is the text
 * of the name parts (the prefix included, the backquotes of a backquoted name
 * left out), followed by `~`, the generic type, and `~` when it has one. The
 * id is the written name before its first `~`, when it has a `~` and its first
 * `~` is not its first character, and otherwise the written name.
 *
 * The texts are those of the values of the tree. The conversion of entities
 * and the replacement of characters that the configuration makes on the id are
 * not repeated: two names that differ only in them compare as different.
 */
export function classIdOf(name: ClassName): string {
  return idOfWrittenName(writtenNameOf(name))
}

/**
 * The ids of the class names that the written name of `name` lists: mermaid.js
 * divides the written name of a class name of `click`, `link`, and `callback`
 * at every `,`, without removing whitespace, and looks up the id of each part.
 * A class name has a `,` only as a backquoted name.
 */
export function classIdsOfList(name: ClassName): string[] {
  return writtenNameOf(name).split(",").map(idOfWrittenName)
}

/** The id of the written name `writtenName`, as `classIdOf` describes. */
export function idOfWrittenName(writtenName: string): string {
  const first = writtenName.indexOf("~")
  return first <= 0 ? writtenName : writtenName.slice(0, first)
}

/**
 * The written name of `name`. A backquoted name that is not closed runs to the
 * end of the text, and the line feed after it ends the name text.
 */
function writtenNameOf(name: ClassName): string {
  const prefix = name.prefix === null ? "" : name.prefix.name
  const nameText =
    name.name.type === "ClassIdentifier"
      ? name.name.name
      : name.name.closed
        ? name.name.value
        : `${name.name.value}\n`
  const generic = name.generic === null ? "" : `~${name.generic.value}~`
  return `${prefix}${nameText}${generic}`
}
