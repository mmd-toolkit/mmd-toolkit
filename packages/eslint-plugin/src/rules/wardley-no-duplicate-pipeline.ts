import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { wardleyDeclarationsOf } from "../utils/wardley-declarations.ts"

/** Compare the children by ID and multiplicity, independently of their written order or positions. */
export const wardleyNoDuplicatePipeline: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a pipeline that replaces the children of an earlier pipeline of the same parent.",
      recommended: true,
      url: ruleDocsUrl("wardley-no-duplicate-pipeline"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the pipeline children of `{{name}}`, set on line {{line}}, with these children.",
    },
  },
  create(context) {
    return {
      WardleyDiagram(diagram) {
        const previousByParent = new Map<
          string,
          { members: readonly string[]; line: number }
        >()
        for (const pipeline of wardleyDeclarationsOf(diagram).pipelines) {
          const previous = previousByParent.get(pipeline.parent)
          if (
            previous !== undefined &&
            (previous.members.length !== pipeline.members.length ||
              previous.members.some((id, at) => id !== pipeline.members[at]))
          ) {
            context.report({
              node: pipeline.node,
              messageId: "duplicate",
              data: { name: pipeline.parent, line: String(previous.line) },
            })
          }
          previousByParent.set(pipeline.parent, {
            members: pipeline.members,
            line: pipeline.node.loc.start.line,
          })
        }
      },
    }
  },
}
