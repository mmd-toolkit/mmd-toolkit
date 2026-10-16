import type { AstPath } from "prettier"
import type { MermaidAst } from "../parser.ts"

/**
 * Narrows a path to the node type it stands at. `AstPath<MermaidAst>` takes
 * the names of fields that some node types of the union have, and then types
 * the child as the union of what those fields hold: `root` is a field of the
 * document and of a mind map, so the child at `root` would be typed as a mind
 * map node or null too, and `body` is a field of many node types. A path
 * typed by its node type has the fields, and the children, of that node type.
 */
export function isPathOfType<Type extends MermaidAst["type"]>(
  path: AstPath<MermaidAst>,
  type: Type,
): path is AstPath<Extract<MermaidAst, { readonly type: Type }>> {
  return path.node.type === type
}

/**
 * The path narrowed to the node type that a printer knows it stands at, for
 * a printer that is given its node and its path (see `isPathOfType`). It
 * fails when the path stands at another node type. It also types the path
 * that the callback of `AstPath.map` gets for a list field declared
 * `readonly`: Prettier's `ArrayElement` knows only mutable arrays, so that
 * path is typed by no node, and the callback narrows it to the node type of
 * the items.
 */
export function narrowPath<Type extends MermaidAst["type"]>(
  path: AstPath<MermaidAst>,
  type: Type,
): AstPath<Extract<MermaidAst, { readonly type: Type }>> {
  if (!isPathOfType(path, type)) {
    throw new Error(
      `prettier-plugin-mmd: expected a ${type} node, found a ${path.node.type} node`,
    )
  }
  return path
}
