/**
 * The citations of fixtures in the documents, read in one place:
 * `[fixture: <diagram>/<name>]`, and `[corpus fixture: <diagram>/<name>]` in
 * the documents of the formatter, whose `[fixture: …]` names fixtures of its
 * own. Prettier may break a citation across lines, so whitespace inside one is
 * any run of whitespace. A placeholder such as `[fixture: <diagram>/<name>]`
 * is no citation, as `scripts/check-doc-citations.mjs` reads it.
 */

/** The form of a citation: the words before its colon. */
export type CitationForm = "fixture" | "corpus fixture"

/** A citation of a fixture in a text. */
export interface Citation {
  /** The fixture, as `<diagram>/<name>`. */
  readonly fixture: string
  /** The offset of the citation in the text. */
  readonly offset: number
}

/** The pattern of a citation of `form`, whose group is the fixture. */
function patternOf(form: CitationForm): RegExp {
  return new RegExp(
    `\\[${form.split(" ").join("\\s+")}:\\s+([^\\s\\]]+)\\s*\\]`,
    "gu",
  )
}

/** The citations of `form` in `text`, in order. */
export function citationsIn(
  text: string,
  form: CitationForm = "fixture",
): Citation[] {
  return [...text.matchAll(patternOf(form))]
    .filter((match) => !match[1].includes("<"))
    .map((match) => ({ fixture: match[1], offset: match.index }))
}

/** `text` with every run of whitespace made one space, as Prettier may wrap it. */
export function normalizeSpace(text: string): string {
  return text
    .split(/\s+/u)
    .filter((part) => part !== "")
    .join(" ")
}

/**
 * `text` without its citations of fixtures, with its whitespace normalized:
 * the whitespace first, since a citation may be broken across lines, and
 * again after the citations are taken out.
 */
export function withoutCitations(text: string): string {
  return normalizeSpace(
    normalizeSpace(text).replaceAll(patternOf("fixture"), " "),
  )
}
