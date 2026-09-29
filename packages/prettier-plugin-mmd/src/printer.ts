import type { AstPath, Doc, Options, ParserOptions, Printer } from "prettier"
import { visitorKeys } from "@mmd-toolkit/parser"
import { utils } from "prettier/doc"
import type { MermaidAst, MermaidDocument } from "./parser.ts"
import { formatFrontmatterYaml } from "./printers/frontmatter-yaml.ts"
import { printRoot } from "./printers/root.ts"

const { replaceEndOfLine } = utils

/**
 * Prints the whole text as written.
 *
 * It prints `originalText` rather than a node's range, so that nothing is
 * lost if a range does not cover leading or trailing trivia. Line breaks
 * become literal lines, which keep every byte including trailing whitespace.
 *
 * Only standalone files get here: an embedded document that would be printed
 * as written is declined while parsing (see `NotFormattedError`).
 */
function printVerbatim(options: ParserOptions<MermaidAst>): Doc {
  return replaceEndOfLine(options.originalText)
}

/**
 * Checks for the node `mermaidParser` returns, which Prettier keeps as the
 * root of the tree it prints.
 */
function isMermaidDocument(node: MermaidAst): node is MermaidDocument {
  return node.type === "FormattedDocument" || node.type === "VerbatimDocument"
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
    case "VerbatimDocument":
      return []
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
    !isMermaidDocument(document) ||
    document.type !== "FormattedDocument"
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
    if (!isMermaidDocument(document)) {
      throw new Error(
        `prettier-plugin-mmd: the top node is a ${JSON.stringify(document.type)} node, not a document`,
      )
    }
    if (document.type === "VerbatimDocument") return printVerbatim(options)
    if (path.node === document) return path.call(print, "root")
    // What stands before the diagram body is the same for every diagram
    // type; the body and the nodes below it go to the diagram printer.
    if (path.node.type === "Root") {
      return printRoot(
        path.node,
        // AstPath<MermaidAst> takes only field names that every node type of
        // the union has; the node here is the root, which has `body`.
        () => path.call(print, "body" as never),
        document.source,
      )
    }
    return document.printDiagram(path, options, print, document.source)
  },
}
