import type { Parser, Plugin, Printer, SupportLanguage } from "prettier"
import type { MermaidAst } from "./parser.ts"
import { mermaidParser } from "./parser.ts"
import { mermaidPrinter } from "./printer.ts"

export type {
  FormattedDocument,
  MermaidAst,
  MermaidDocument,
  VerbatimDocument,
} from "./parser.ts"

export const languages: SupportLanguage[] = [
  {
    name: "Mermaid",
    parsers: ["mermaid"],
    extensions: [".mmd", ".mermaid"],
    // Matched against the info string of fenced code blocks in Markdown.
    // Prettier compares case-sensitively, so "```Mermaid" is not matched.
    aliases: ["mermaid", "mmd"],
    vscodeLanguageIds: ["mermaid"],
  },
]

export const parsers: Record<string, Parser<MermaidAst>> = {
  mermaid: mermaidParser,
}

export const printers: Record<string, Printer<MermaidAst>> = {
  mermaid: mermaidPrinter,
}

const plugin: Plugin<MermaidAst> = { languages, parsers, printers }

export default plugin
