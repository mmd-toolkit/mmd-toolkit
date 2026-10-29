import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import {
  eventmodelingDeclarationsOf,
  eventmodelingNameText,
} from "../utils/eventmodeling-declarations.ts"

/** Forward declarations count for both frame kinds; notes and GWT are not checked. */
export const eventmodelingNoUndef: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "undef"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a source or a data reference that names nothing.",
      recommended: true,
      url: ruleDocsUrl("eventmodeling-no-undef"),
    },
    schema: [],
    messages: {
      undef:
        "mermaid.js finds no {{kind}} named `{{name}}` for this reference.",
    },
  },
  create(context) {
    return {
      EventmodelingDiagram(diagram) {
        const declarations = eventmodelingDeclarationsOf(diagram)
        for (const frame of declarations.frames) {
          for (const source of frame.sourceFrames) {
            const name = eventmodelingNameText(source.frame)
            if (!declarations.frameNames.has(name)) {
              context.report({
                node: source.frame,
                messageId: "undef",
                data: { name, kind: "frame" },
              })
            }
          }
          if (frame.dataReference !== null) {
            const name = eventmodelingNameText(frame.dataReference.name)
            if (!declarations.dataNames.has(name)) {
              context.report({
                node: frame.dataReference.name,
                messageId: "undef",
                data: { name, kind: "data block" },
              })
            }
          }
        }
      },
    }
  },
}
