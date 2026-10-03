import type { ClassNode } from "../ast/class.ts"

/**
 * ast/class.md, Nodes: the child fields of every class node type, as each
 * node's section states them, in the order in which a walk visits them.
 */
export const classVisitorKeys: Readonly<
  Record<ClassNode["type"], readonly string[]>
> = {
  ClassDiagram: ["body"],
  ClassDeclaration: ["name", "label", "cssClass", "annotation", "members"],
  ClassMemberStatement: ["class", "member"],
  ClassNameStatement: ["name"],
  ClassAnnotationStatement: ["annotation", "class"],
  ClassRelationStatement: [
    "from",
    "fromCardinality",
    "arrow",
    "toCardinality",
    "to",
    "label",
  ],
  ClassArrow: [],
  ClassNamespaceStatement: ["prefix", "name", "label", "body"],
  ClassNoteStatement: ["class", "text"],
  ClassCallbackStatement: ["class", "callback", "arguments", "tooltip"],
  ClassLinkStatement: ["class", "url", "tooltip"],
  ClassStyleStatement: ["id", "styles"],
  ClassCssClassStatement: ["idList", "cssClass"],
  ClassClassDefStatement: ["cssClasses", "styles"],
  ClassDirectionStatement: ["textBefore", "textAfter"],
  ClassAccTitleStatement: ["value"],
  ClassAccDescrStatement: ["value"],
  ClassAccDescrBlockStatement: ["value"],
  ClassIdentifier: [],
  ClassName: ["prefix", "name", "generic"],
  ClassMethod: ["textBefore", "name", "parameters", "returnType", "textAfter"],
  ClassAttribute: ["name"],
  ClassAnnotation: ["name"],
  ClassLiteral: [],
  ClassIgnoredText: [],
}
