/**
 * The inputs of the tests of the language (`language.test.ts`,
 * `token-store.test.ts`, `diagram-rules.test.ts`): fixtures of the conformance
 * corpus, each chosen for one case that the language, or a rule of a diagram
 * type, treats on its own. A case is a way that an input differs in what the
 * language does with it: the diagram that the parser reads, how it rejects
 * the text, the line terminators that the positions count, the parts of the
 * text that are not nodes. `holds` says, of the text of the fixture, that it is
 * a case of its kind; the tests check it, so that a fixture of the corpus that
 * is changed to another input is noticed.
 */
import type { DiagramType, Fixture } from "@mmd-toolkit/tests"
import { parse } from "@mmd-toolkit/parser"
import type { Root } from "@mmd-toolkit/parser"
import { loadCorpus } from "./helpers.ts"

/** The tree of `text`, or null where the parser rejects it. */
function treeOf(text: string): Root | null {
  try {
    return parse(text)
  } catch {
    return null
  }
}

/** Whether `text` is accepted and its tree has a token, comment, or directive that `predicate` accepts. */
function acceptedWith(
  text: string,
  predicate: (root: Root) => boolean,
): boolean {
  const root = treeOf(text)
  return root !== null && predicate(root)
}

/** An input of the tests of the language, and the case it is for. */
export interface LanguageInput {
  /** The case that the input is for, in words. */
  readonly case: string
  readonly diagram: DiagramType
  /** The name of the fixture in the directory of its diagram type. */
  readonly name: string
  /** Whether the text of the fixture is a case of its kind. */
  readonly holds: (text: string) => boolean
}

/** The inputs: the diagram that is read, the rejected text, the line terminators, the parts that are not nodes. */
export const LANGUAGE_INPUTS: readonly LanguageInput[] = [
  {
    case: "a flowchart",
    diagram: "common",
    name: "detect-minimal-flowchart-v2",
    holds: (text) =>
      acceptedWith(text, (root) => root.body.type === "FlowchartDiagram"),
  },
  {
    case: "a sequence diagram",
    diagram: "common",
    name: "detect-minimal-sequence",
    holds: (text) =>
      acceptedWith(text, (root) => root.body.type === "SequenceDiagram"),
  },
  {
    case: "a class diagram",
    diagram: "class",
    name: "gram-name-alone",
    holds: (text) =>
      acceptedWith(text, (root) => root.body.type === "ClassDiagram"),
  },
  {
    case: "a state diagram",
    diagram: "common",
    name: "detect-minimal-state-diagram",
    holds: (text) =>
      acceptedWith(text, (root) => root.body.type === "StateDiagram"),
  },
  {
    case: "a git graph",
    diagram: "common",
    name: "detect-minimal-git-graph",
    holds: (text) =>
      acceptedWith(text, (root) => root.body.type === "GitgraphDiagram"),
  },
  {
    case: "a packet diagram",
    diagram: "common",
    name: "detect-minimal-packet",
    holds: (text) =>
      acceptedWith(text, (root) => root.body.type === "PacketDiagram"),
  },
  {
    case: "an architecture diagram",
    diagram: "common",
    name: "detect-minimal-architecture",
    holds: (text) =>
      acceptedWith(text, (root) => root.body.type === "ArchitectureDiagram"),
  },
  {
    case: "the error pseudo-diagram, accepted, with a comment after it",
    diagram: "common",
    name: "error-trailing-comment-line",
    holds: (text) =>
      acceptedWith(text, (root) => root.body.type === "ErrorDiagram"),
  },
  {
    case: "a text that the parser rejects, at its first line",
    diagram: "flowchart",
    name: "header-semicolon-no-direction",
    holds: (text) => treeOf(text) === null,
  },
  {
    case: "a text that the parser rejects, at a later line",
    diagram: "class",
    name: "header-only",
    holds: (text) => treeOf(text) === null && text.includes("\n"),
  },
  {
    case: "a diagram type that the parser does not support",
    diagram: "common",
    name: "detect-minimal-wardley",
    holds: (text) => treeOf(text) === null && text.startsWith("wardley-beta"),
  },
  {
    case: "no text at all",
    diagram: "common",
    name: "empty",
    holds: (text) => text === "",
  },
  {
    case: "line terminators `\\r\\n`",
    diagram: "common",
    name: "crlf",
    holds: (text) =>
      acceptedWith(text, () => true) &&
      text.includes("\r\n") &&
      !/(?<!\r)\n/u.test(text),
  },
  {
    case: "line terminators `\\r` alone",
    diagram: "common",
    name: "cr-only",
    holds: (text) =>
      acceptedWith(text, () => true) &&
      /\r(?!\n)/u.test(text) &&
      !text.includes("\n"),
  },
  {
    case: "a U+2028 in an accepted text, which the positions do not count as a line terminator",
    diagram: "class",
    name: "bare-marker-directive-lines-7da2cf8d",
    holds: (text) => acceptedWith(text, () => true) && text.includes("\u2028"),
  },
  {
    case: "a U+2029 in an accepted text",
    diagram: "common",
    name: "comment-after-u2029",
    holds: (text) => acceptedWith(text, () => true) && text.includes("\u2029"),
  },
  {
    case: "a byte order mark, with frontmatter",
    diagram: "common",
    name: "frontmatter-bom",
    holds: (text) =>
      text.startsWith("\uFEFF") &&
      acceptedWith(text.slice(1), (root) => root.frontmatter !== null),
  },
  {
    case: "no line terminator at the end",
    diagram: "flowchart",
    name: "header-only-no-line-break",
    holds: (text) => acceptedWith(text, () => !/[\n\r]$/u.test(text)),
  },
  {
    case: "frontmatter",
    diagram: "common",
    name: "frontmatter-empty-body",
    holds: (text) => acceptedWith(text, (root) => root.frontmatter !== null),
  },
  {
    case: "a directive that is closed",
    diagram: "common",
    name: "error-directive-adjacent",
    holds: (text) =>
      acceptedWith(text, (root) =>
        root.directives.some((directive) => directive.closed),
      ),
  },
  {
    case: "a directive that is not closed",
    diagram: "common",
    name: "comment-directive-unclosed-line-feed-at-end",
    holds: (text) =>
      acceptedWith(text, (root) =>
        root.directives.some((directive) => !directive.closed),
      ),
  },
  {
    case: "a comment that starts with `%%`",
    diagram: "common",
    name: "error-trailing-comment-line",
    holds: (text) =>
      acceptedWith(text, (root) =>
        root.comments.some((comment) => comment.mark === "%%"),
      ),
  },
  {
    case: "a comment that starts with `#`",
    diagram: "state",
    name: "lex-hash-comment-after-statement",
    holds: (text) =>
      acceptedWith(text, (root) =>
        root.comments.some((comment) => comment.mark === "#"),
      ),
  },
  {
    case: "a comment that starts with a single `%`",
    diagram: "sequence",
    name: "lex-single-percent-comment-line",
    holds: (text) =>
      acceptedWith(text, (root) =>
        root.comments.some((comment) => comment.mark === "%"),
      ),
  },
  {
    case: "a fragment of a diagram comment that a comment region cuts",
    diagram: "state",
    name: "lex-hash-comment-across-comment-line",
    holds: (text) =>
      acceptedWith(text, (root) =>
        root.comments.some((comment) => comment.mark === null),
      ),
  },
  {
    case: "a token that spans lines",
    diagram: "flowchart",
    name: "lex-string-multiline",
    holds: (text) =>
      acceptedWith(text, (root) =>
        root.tokens.some(
          (token) => token.loc.start.line !== token.loc.end.line,
        ),
      ),
  },
  {
    case: "a comment that spans lines",
    diagram: "common",
    name: "comment-directive-word-argument-takes-next-lines",
    holds: (text) =>
      acceptedWith(text, (root) =>
        root.comments.some(
          (comment) => comment.loc.start.line !== comment.loc.end.line,
        ),
      ),
  },
  {
    case: "an ignored `;` that the line rule of `style` drops",
    diagram: "common",
    name: "entity-style-label-semicolon-ignored",
    holds: (text) =>
      acceptedWith(text, (root) =>
        root.tokens.some((token) => token.type === "IgnoredSemicolon"),
      ),
  },
  {
    case: "a string that a `;` or a comment region cuts into fragments",
    diagram: "flowchart",
    name: "lex-semicolon-between-string-delimiters",
    holds: (text) =>
      acceptedWith(text, (root) =>
        root.tokens.some((token) => token.type === "StringFragment"),
      ),
  },
]

/** An input of the tests of the language, with its fixture. */
export interface LoadedLanguageInput extends LanguageInput {
  readonly fixture: Fixture
}

/** The inputs of the tests of the language, with their fixtures; throws for a fixture that the corpus lacks. */
export async function loadLanguageInputs(): Promise<LoadedLanguageInput[]> {
  const corpus = new Map(
    (await loadCorpus()).map((fixture) => [
      `${fixture.diagram}/${fixture.name}`,
      fixture,
    ]),
  )
  return LANGUAGE_INPUTS.map((input) => {
    const fixture = corpus.get(`${input.diagram}/${input.name}`)
    if (fixture === undefined) {
      throw new Error(`No fixture ${input.diagram}/${input.name}`)
    }
    return { ...input, fixture }
  })
}
