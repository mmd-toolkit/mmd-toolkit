import type { UsecaseNode } from "../ast/usecase.ts"

/** ast/usecase.md: child fields in their specified order. */
export const usecaseVisitorKeys: Readonly<
  Record<UsecaseNode["type"], readonly string[]>
> = {
  UsecaseDiagram: ["body"],
  UsecaseActorStatement: ["actors"],
  UsecaseActor: ["id", "label", "metadata", "stereotype", "classes"],
  UsecaseEntityStatement: ["entity"],
  UsecaseEntity: ["id", "label", "metadata", "stereotype", "classes"],
  UsecaseSystemBoundaryStatement: [
    "id",
    "title",
    "metadata",
    "classes",
    "body",
  ],
  UsecaseRelationshipStatement: [
    "source",
    "id",
    "opening",
    "label",
    "arrow",
    "target",
  ],
  UsecaseOpeningArrow: [],
  UsecaseArrow: [],
  UsecaseLabel: [],
  UsecaseLiteral: [],
  UsecaseMetadata: ["properties"],
  UsecaseMetadataProperty: ["key", "value"],
  UsecaseMetadataAssignmentStatement: ["target", "metadata"],
  UsecaseNoteStatement: ["target", "label"],
  UsecaseJsonStatement: ["id", "data", "classes"],
  UsecaseJsonDataBlock: [],
  UsecaseDirectionStatement: [],
  UsecaseClassDefStatement: ["classes", "styles"],
  UsecaseClassStatement: ["targets", "classes"],
  UsecaseStyleStatement: ["target", "styles"],
  UsecaseStyleDeclaration: ["name", "value"],
  UsecaseIdentifier: [],
  UsecaseAccTitleStatement: ["value"],
  UsecaseAccDescrStatement: ["value"],
  UsecaseAccDescrBlockStatement: ["value"],
}
