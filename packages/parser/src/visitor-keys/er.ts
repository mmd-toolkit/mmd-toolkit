import type { ErNode } from "../ast/er.ts"

/**
 * ast/er.md: the child fields of each ER node type, as each node's section
 * states them, in the order in which a walk visits them.
 */
export const erVisitorKeys: Readonly<
  Record<ErNode["type"], readonly string[]>
> = {
  ErDiagram: ["body"],
  ErEntityStatement: ["name", "alias", "cssClasses", "attributes"],
  ErAttribute: ["dataType", "name", "keys", "comment"],
  ErRelationshipStatement: ["left", "relationship", "right", "role"],
  ErEntityReference: ["name", "cssClasses"],
  ErRelationship: [],
  ErSubgraphStatement: ["id", "title", "body"],
  ErDirectionStatement: ["textBefore", "textAfter"],
  ErClassDefStatement: ["cssClasses", "styles"],
  ErClassStatement: ["entities", "cssClasses"],
  ErStyleStatement: ["entities", "styles"],
  ErAccTitleStatement: ["value"],
  ErAccDescrStatement: ["value"],
  ErAccDescrBlockStatement: ["value"],
  ErIdentifier: [],
  ErLiteral: [],
  ErIgnoredText: [],
}
