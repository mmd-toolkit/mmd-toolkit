import type { AstPath, Doc, Options, ParserOptions, Printer } from "prettier"
import { visitorKeys } from "@mmd-toolkit/parser"
import type { FormattedDocument, MermaidAst } from "./parser.ts"
import { formatFrontmatterYaml } from "./printers/frontmatter-yaml.ts"
import { isPathOfType } from "./printers/paths.ts"
import { printRoot } from "./printers/root.ts"

/**
 * Checks for the node `mermaidParser` returns, which Prettier keeps as the
 * root of the tree it prints.
 */
function isFormattedDocument(node: MermaidAst): node is FormattedDocument {
  return node.type === "FormattedDocument"
}

/**
 * Returns the fields of a node that hold child nodes. Prettier walks the tree
 * with them, for example to find the node at the cursor; without them it
 * would also walk plain objects such as `loc`.
 *
 * The parser's `visitorKeys` give the fields of its nodes. The documents that
 * wrap the parser's tree add theirs: a formatted document has the parser's
 * `Root` as its child.
 */
function getVisitorKeys(node: MermaidAst): string[] {
  switch (node.type) {
    case "FormattedDocument":
      return ["root"]
    default:
      return [...visitorKeys[node.type]]
  }
}

/**
 * Prints a root that has frontmatter, with its body formatted as YAML where
 * that is safe (see `formatFrontmatterYaml`).
 */
function embed(
  path: AstPath<MermaidAst>,
  options: Options,
): EmbedPrinter | null {
  const node = path.node
  const document = path.root
  if (
    node.type !== "Root" ||
    node.frontmatter === null ||
    !isFormattedDocument(document) ||
    document.textRules?.printsAsWritten
  ) {
    return null
  }
  const { frontmatter } = node
  return async (textToDoc, print) =>
    printRoot(
      node,
      () => print("body"),
      document.source,
      await formatFrontmatterYaml(
        frontmatter,
        textToDoc,
        // Prettier passes `embed` the resolved options, as it passes
        // `print`; its types name them `Options`, with optional widths.
        options as ParserOptions<MermaidAst>,
      ),
      document.textRules?.plan?.(
        document.source,
        options as ParserOptions<MermaidAst>,
      ),
      document.textRules?.keepsPrefix?.(document.source),
    )
}

/** What `embed` returns: a function that prints a node with other languages. */
type EmbedPrinter = (
  textToDoc: (text: string, options: Options) => Promise<Doc>,
  print: (selector?: string) => Doc,
) => Promise<Doc>

export const mermaidPrinter: Printer<MermaidAst> = {
  getVisitorKeys,
  embed,
  print(
    path: AstPath<MermaidAst>,
    options: ParserOptions<MermaidAst>,
    print: (path: AstPath<MermaidAst>) => Doc,
  ): Doc {
    const document = path.root
    if (!isFormattedDocument(document)) {
      throw new Error(
        `prettier-plugin-mmd: the top node is a ${JSON.stringify(document.type)} node, not a document`,
      )
    }
    if (isPathOfType(path, "FormattedDocument")) {
      return path.call(print, "root")
    }
    // What stands before the diagram body is the same for every diagram
    // type; the body and the nodes below it go to the diagram printer.
    if (isPathOfType(path, "Root")) {
      return printRoot(
        path.node,
        () => path.call(print, "body"),
        document.source,
        undefined,
        document.textRules?.plan?.(document.source, options),
        document.textRules?.printsAsWritten === true ||
          document.textRules?.keepsPrefix?.(document.source),
      )
    }
    return document.printDiagram(path, options, print, document.source)
  },
}
