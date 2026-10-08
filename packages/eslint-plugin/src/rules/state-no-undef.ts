import type {
  Identifier,
  StateClassStatement,
  StateClickStatement,
  StateNoteStatement,
  StateReference,
  StateStyleStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The rule `state-no-undef`, described in `docs/rules/state-no-undef.md`: a
 * `style`, `class`, `click`, or `note` statement that names a state that is the
 * id of no state of the diagram. The states are those that a state written
 * alone, a transition, a composite state with a body, an alias, or a
 * pseudostate defines, at any depth of the diagram and wherever they stand: a
 * name that a later statement defines is defined too, because the rule compares
 * the names with the whole diagram. The name of a state is the name of its
 * `Identifier`, which is its id in the Db; the id of an alias and of a
 * pseudostate is the value of its text. Inside a composite state, `style` and
 * `class` change nothing, whatever they name; the rule checks the name only.
 * The state that a note makes is a state for `style`, `class`, and `click`,
 * wherever they stand, so only the note is reported; notes do not define a state
 * for each other.
 */
export const stateNoUndef: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "ignored" | "noteState"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a `style`, `class`, `click`, or `note` statement that names no state.",
      recommended: true,
      url: ruleDocsUrl("state-no-undef"),
    },
    schema: [],
    messages: {
      ignored:
        "mermaid.js does nothing with `{{id}}` in this `{{keyword}}` statement: no state of the diagram has this id.",
      noteState:
        "mermaid.js makes a new state `{{id}}` for this note: no other state of the diagram has this id.",
    },
  },
  create(context) {
    const { sourceCode } = context
    /** The ids of the states that the diagram defines, wherever they stand. */
    const definedIds = new Set<string>()
    /** The ids of the states that the notes make. */
    const noteIds = new Set<string>()
    const styles: StateStyleStatement[] = []
    const classes: StateClassStatement[] = []
    const clicks: StateClickStatement[] = []
    const notes: StateNoteStatement[] = []

    /** Defines the id of the state `reference`, unless it is `[*]`. */
    function define(reference: StateReference): void {
      if (reference.state.type === "Identifier") {
        definedIds.add(reference.state.name)
      }
    }

    /** Reports the name `identifier` when it is the id of no state. */
    function check(
      identifier: Identifier,
      statement:
        | StateStyleStatement
        | StateClassStatement
        | StateClickStatement
        | StateNoteStatement,
    ): void {
      const note = statement.type === "StateNoteStatement"
      if (definedIds.has(identifier.name)) return
      if (!note && noteIds.has(identifier.name)) return
      context.report({
        node: identifier,
        messageId: note ? "noteState" : "ignored",
        data: {
          id: identifier.name,
          keyword: sourceCode.getFirstToken(statement)?.value ?? "",
        },
      })
    }

    return {
      StateDefinitionStatement(node) {
        define(node.reference)
      },
      StateTransitionStatement(node) {
        define(node.from)
        define(node.to)
      },
      StateCompositeStatement(node) {
        if (node.body !== null && node.id !== null) definedIds.add(node.id.name)
      },
      StateAliasDefinitionStatement(node) {
        if (node.id !== null) definedIds.add(node.id.value)
      },
      StatePseudostateDefinitionStatement(node) {
        if (node.id !== null) definedIds.add(node.id.value)
      },
      StateStyleStatement: (node) => styles.push(node),
      StateClassStatement: (node) => classes.push(node),
      StateClickStatement: (node) => clicks.push(node),
      StateNoteStatement(node) {
        notes.push(node)
        if (node.state !== null) noteIds.add(node.state.name)
      },
      "StateDiagram:exit"() {
        for (const style of styles) {
          for (const identifier of style.states) {
            if (identifier !== null) check(identifier, style)
          }
        }
        for (const statement of classes) {
          for (const identifier of statement.states)
            check(identifier, statement)
        }
        for (const click of clicks) {
          if (click.reference.state.type === "Identifier") {
            check(click.reference.state, click)
          }
        }
        for (const note of notes) {
          if (note.state !== null) check(note.state, note)
        }
      },
    }
  },
}
