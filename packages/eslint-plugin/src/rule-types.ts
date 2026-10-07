import type { LanguageOptions, RuleVisitor } from "@eslint/core"
import type {
  CustomRuleDefinitionType,
  CustomRuleTypeDefinitions,
  CustomRuleVisitorWithExit,
} from "@eslint/plugin-kit"
import type { Node } from "@mmd-toolkit/parser"
import type { MermaidSourceCode, MermaidSyntaxElement } from "./source-code.ts"

/**
 * The handlers of a rule for Mermaid text. For each node type, ESLint calls
 * the handler of that type with the node and its parent (null for `Root`) on
 * entering the node, and the handler of `<type>:exit` on leaving it.
 */
export interface MermaidRuleVisitor
  extends
    RuleVisitor,
    CustomRuleVisitorWithExit<{
      [NodeType in Node as NodeType["type"]]?: (
        node: NodeType,
        parent: Node | null,
      ) => void
    }> {}

/**
 * The definition of a rule for Mermaid text. `Options` sets the types of the
 * rule's options (`RuleOptions`), its message ids (`MessageIds`), and its
 * documentation (`ExtRuleDocs`).
 */
export type MermaidRuleDefinition<
  Options extends Partial<CustomRuleTypeDefinitions> = Record<never, never>,
> = CustomRuleDefinitionType<
  {
    LangOptions: LanguageOptions
    Code: MermaidSourceCode
    Visitor: MermaidRuleVisitor
    Node: MermaidSyntaxElement
  },
  Options
>
