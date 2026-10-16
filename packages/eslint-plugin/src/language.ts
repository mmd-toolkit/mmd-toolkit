import type {
  File,
  FileError,
  Language,
  LanguageOptions,
  OkParseResult,
  ParseResult,
} from "@eslint/core"
import type { Node, Root } from "@mmd-toolkit/parser"
import {
  parse,
  ParseError,
  UnsupportedDiagramError,
  visitorKeys,
} from "@mmd-toolkit/parser"
import { MermaidSourceCode } from "./source-code.ts"

/** The type parameters of the Mermaid language. */
export interface MermaidLanguageTypes {
  LangOptions: LanguageOptions
  Code: MermaidSourceCode
  RootNode: Root
  Node: Node
}

/** The text of a file. ESLint passes text, because the language reads files as text. */
function textOf(file: File): string {
  if (typeof file.body !== "string") {
    throw new TypeError("The Mermaid language reads files as text")
  }
  return file.body
}

/**
 * A rejected input as ESLint reports it. ESLint shows the line and the column
 * of a parse error as they are: it does not apply `columnStart` to them, so
 * the column, counted from 0 in the tree, is counted from 1 here.
 */
function fileErrorOf(error: ParseError): FileError {
  return {
    message: error.message,
    line: error.loc.start.line,
    column: error.loc.start.column + 1,
    endLine: error.loc.end.line,
    endColumn: error.loc.end.column + 1,
  }
}

/**
 * The Mermaid language for ESLint. It parses a file with
 * `@mmd-toolkit/parser` and gives ESLint the tree, its comments, and its
 * visitor keys. Lines are counted from 1 and columns from 0, as in the tree
 * (ast.md, Positions).
 */
export const mermaidLanguage: Language<MermaidLanguageTypes> = {
  fileType: "text",
  lineStart: 1,
  columnStart: 0,
  nodeTypeKey: "type",
  visitorKeys: Object.fromEntries(
    Object.entries(visitorKeys).map(([type, keys]) => [type, [...keys]]),
  ),
  defaultLanguageOptions: {},

  /** Accepts any `languageOptions`. */
  validateLanguageOptions(): void {
    // The language has no options. What other tools put into
    // `languageOptions` (the options of JavaScript, for example) is ignored,
    // as the other languages of ESLint ignore what they do not know.
  },

  parse(file: File): ParseResult<Root> {
    try {
      return { ok: true, ast: parse(textOf(file)) }
    } catch (error) {
      if (error instanceof ParseError) {
        return { ok: false, errors: [fileErrorOf(error)] }
      }
      if (error instanceof UnsupportedDiagramError) {
        // The error has no position: it is reported at the start of the file.
        return {
          ok: false,
          errors: [{ message: error.message, line: 1, column: 1 }],
        }
      }
      throw error
    }
  },

  createSourceCode(file: File, result: OkParseResult<Root>): MermaidSourceCode {
    return new MermaidSourceCode({ text: textOf(file), ast: result.ast })
  },
}
