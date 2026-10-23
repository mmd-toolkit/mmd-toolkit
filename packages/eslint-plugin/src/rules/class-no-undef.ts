import type {
  ClassCallbackStatement,
  ClassCssClassStatement,
  ClassLinkStatement,
  ClassName,
  ClassNoteStatement,
  ClassStyleStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import {
  classIdOf,
  classIdsOfList,
  idOfWrittenName,
} from "../utils/class-names.ts"

/** A statement that names a class by a class name: `click`, `link`, `callback`. */
type NamingStatement = ClassCallbackStatement | ClassLinkStatement

/**
 * The rule `class-no-undef`, described in `docs/rules/class-no-undef.md`: a
 * `style`, `cssClass`, `click`, `link`, `callback`, or `note for` statement that
 * names a class that is the id of no class of the diagram. The classes are
 * those that a class statement, a member statement, or a relation adds,
 * wherever they stand in the diagram: a name that a later statement adds is
 * defined too, because the rule compares the names with the whole diagram. The
 * name on the `()` side of a relation whose only end is `()` names an
 * interface and adds no class. The name of a `click`, `link`, or `callback`
 * statement lists classes, divided at `,` as the `cssClass` list is (`note for`
 * names one). The ids are compared as `classIdOf` gives them.
 */
export const classNoUndef: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "ignored" | "noteWithoutClass"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a statement that refers to a class that the diagram does not define.",
      recommended: true,
      url: ruleDocsUrl("class-no-undef"),
    },
    schema: [],
    messages: {
      ignored:
        "mermaid.js does nothing with `{{id}}` in this `{{keyword}}` statement: no class of the diagram has this id.",
      noteWithoutClass:
        "mermaid.js keeps this note and draws it without a line to a class: no class of the diagram has the id `{{id}}`.",
    },
  },
  create(context) {
    const { sourceCode } = context
    /** The ids of the classes that the diagram adds, wherever they stand. */
    const definedIds = new Set<string>()
    const styles: ClassStyleStatement[] = []
    const cssClasses: ClassCssClassStatement[] = []
    const namings: NamingStatement[] = []
    const notes: ClassNoteStatement[] = []

    /** Reports the name `name` of `node` that is the id of no class. */
    function reportName(
      node:
        | ClassName
        | ClassCssClassStatement["idList"]
        | ClassStyleStatement["id"],
      id: string,
      statement:
        | ClassNoteStatement
        | NamingStatement
        | ClassCssClassStatement
        | ClassStyleStatement,
    ): void {
      const note = statement.type === "ClassNoteStatement"
      context.report({
        node,
        messageId: note ? "noteWithoutClass" : "ignored",
        data: {
          id,
          keyword: sourceCode.getFirstToken(statement)?.value ?? "",
        },
      })
    }

    return {
      ClassDeclaration(node) {
        definedIds.add(classIdOf(node.name))
      },
      ClassMemberStatement(node) {
        definedIds.add(classIdOf(node.class))
      },
      ClassRelationStatement(node) {
        const { startMarker, endMarker } = node.arrow
        // A lollipop at one end alone makes the name at that end an interface.
        const fromIsInterface =
          startMarker === "lollipop" && endMarker === "none"
        const toIsInterface = endMarker === "lollipop" && startMarker === "none"
        if (!fromIsInterface) definedIds.add(classIdOf(node.from))
        if (!toIsInterface) definedIds.add(classIdOf(node.to))
      },
      ClassStyleStatement: (node) => styles.push(node),
      ClassCssClassStatement: (node) => cssClasses.push(node),
      ClassLinkStatement: (node) => namings.push(node),
      ClassCallbackStatement: (node) => namings.push(node),
      ClassNoteStatement: (node) => notes.push(node),
      "ClassDiagram:exit"() {
        for (const style of styles) {
          const id = idOfWrittenName(style.id.name)
          if (!definedIds.has(id)) reportName(style.id, id, style)
        }
        for (const cssClass of cssClasses) {
          for (const name of cssClass.idList.value.split(",")) {
            const id = idOfWrittenName(name)
            if (!definedIds.has(id)) reportName(cssClass.idList, id, cssClass)
          }
        }
        for (const naming of namings) {
          for (const id of classIdsOfList(naming.class)) {
            if (!definedIds.has(id)) reportName(naming.class, id, naming)
          }
        }
        for (const note of notes) {
          if (note.class === null) continue
          const id = classIdOf(note.class)
          if (!definedIds.has(id)) reportName(note.class, id, note)
        }
      },
    }
  },
}
