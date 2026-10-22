import type { Frontmatter } from "@mmd-toolkit/parser"
import type { Doc, Options, ParserOptions } from "prettier"
import { printer } from "prettier/doc"
import type { MermaidAst } from "../parser.ts"
import { significantIndentationWidth } from "./lines.ts"
import { isWhitespace } from "./source.ts"

const { printDocToString } = printer

/**
 * Formats the body of the frontmatter with Prettier's YAML formatter, or
 * returns undefined to keep it as written (docs/flowchart.md, Frontmatter
 * YAML). The parser does not
 * read YAML (common.md, `embedded-data-opaque`), so the body is handed to
 * Prettier as written. When Prettier cannot read it as YAML, `textToDoc`
 * throws, and Prettier prints the root without this embed, with the body as
 * written.
 *
 * The body is also kept as written:
 *
 * - when the delimiter lines are indented. The delimiters are kept as
 *   written, and a body at the first column between indented delimiters
 *   would look broken.
 * - when the body, written or formatted, holds the start of an HTML tag
 *   (see `holdsHtmlTagStart`).
 * - when a line of the formatted body is a delimiter line, which would end
 *   the frontmatter early (see `holdsDelimiterLine`).
 */
export async function formatFrontmatterYaml(
  frontmatter: Frontmatter,
  textToDoc: (text: string, options: Options) => Promise<Doc>,
  options: ParserOptions<MermaidAst>,
): Promise<Doc | undefined> {
  if (
    hasIndentedDelimiters(frontmatter) ||
    holdsHtmlTagStart(frontmatter.value)
  ) {
    return undefined
  }
  const tabWidth = significantIndentationWidth(options.tabWidth)
  const yamlDoc = await textToDoc(frontmatter.value, {
    parser: "yaml",
    tabWidth,
  })
  // The parser reads line feeds: Prettier converts line endings of the
  // input to them before parsing, and of the output after printing.
  const withLineFeeds: ParserOptions<MermaidAst> = {
    ...options,
    tabWidth,
    endOfLine: "lf",
  }
  const formatted = printDocToString(yamlDoc, withLineFeeds).formatted
  if (holdsHtmlTagStart(formatted) || holdsDelimiterLine(formatted)) {
    return undefined
  }
  return yamlDoc
}

/**
 * Whether the opening delimiter line is indented. The frontmatter starts the
 * text, and its range starts at the opening `---`, after the indentation
 * (ast.md, Frontmatter); Prettier removes a byte order mark before the
 * parser reads the text.
 */
function hasIndentedDelimiters(frontmatter: Frontmatter): boolean {
  return frontmatter.range[0] > 0
}

/**
 * Whether a text holds a `<` followed by a word character, which may start
 * an HTML tag (common.md, HTML attribute quotes). Whether a `>` follows is
 * not checked: the `>` may lie in the diagram text after the frontmatter.
 *
 * mermaid.js rewrites `="..."` inside HTML tags over the whole source,
 * frontmatter included, before it reads the YAML (common.md, Known
 * divergences). Changing the quotes of a scalar inside such a tag changes
 * what that rewrite does: `title: "<a b=\"c\">"` is accepted, and Prettier's
 * `title: '<a b="c">'` becomes `title: '<a b='c'>'`, which is not YAML.
 * Without a tag start in either form, the rewrite changes neither. The
 * formatted form is checked as well as the written one because it comes
 * from the YAML printer of the Prettier version installed.
 */
function holdsHtmlTagStart(text: string): boolean {
  let index = text.indexOf("<")
  while (index !== -1) {
    if (isWordCharacter(text.charAt(index + 1))) return true
    index = text.indexOf("<", index + 1)
  }
  return false
}

/** Whether a character is a word character (common.md, Notation). */
function isWordCharacter(character: string): boolean {
  return (
    ("A" <= character && character <= "Z") ||
    ("a" <= character && character <= "z") ||
    ("0" <= character && character <= "9") ||
    character === "_"
  )
}

/**
 * Whether a line of a formatted body is a delimiter line (common.md,
 * Frontmatter): `---` and optional line whitespace, after the indent of the
 * opening line, which is empty here, since a frontmatter with indented
 * delimiter lines is kept as written. Prettier prints such lines: it prints
 * `--- !!map` after a `%YAML` directive as `---` and `!!map` on two lines,
 * and the first of them would close the frontmatter.
 */
function holdsDelimiterLine(yaml: string): boolean {
  return yaml
    .split("\n")
    .some(
      (line) =>
        line.startsWith("---") &&
        [...line.slice("---".length)].every(isWhitespace),
    )
}
