import type { StateNode } from "../ast/state.ts"

/**
 * ast/state.md: the child fields of each state node type, as each node's
 * section states them, in the order in which a walk visits them.
 */
export const stateVisitorKeys: Readonly<
  Record<StateNode["type"], readonly string[]>
> = {
  StateDiagram: ["body"],
  StateDefinitionStatement: ["reference", "description"],
  StateTransitionStatement: ["from", "to", "label"],
  StateReference: ["state", "cssClass"],
  StateTerminal: [],
  StateCompositeStatement: ["textBeforeId", "id", "textBeforeBody", "body"],
  StateAliasDefinitionStatement: [
    "textBeforeDescription",
    "description",
    "textAfterDescription",
    "id",
    "secondDescription",
    "textAfter",
    "textBeforeBody",
    "body",
  ],
  StatePseudostateDefinitionStatement: ["id"],
  StateDividerStatement: [],
  StateNoteStatement: ["textBeforeState", "state", "textBeforeText", "text"],
  StateFloatingNoteStatement: ["text", "id"],
  StateClickStatement: ["reference", "url", "tooltip"],
  StateClassDefStatement: ["cssClass", "styles"],
  StateClassStatement: ["states", "cssClass"],
  StateStyleStatement: ["states", "styles"],
  StateDirectionStatement: ["textBefore", "textAfter"],
  StateAccTitleStatement: ["value"],
  StateAccDescrStatement: ["value"],
  StateAccDescrBlockStatement: ["value"],
  StateScaleStatement: ["width"],
  StateHideEmptyDescriptionStatement: [],
  StateIgnoredStatement: [],
  StateLiteral: [],
  StateIgnoredText: [],
}
