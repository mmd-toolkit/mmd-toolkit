/**
 * Decides what an error thrown by `mermaid.parse()` means.
 *
 * Every error is taken as mermaid rejecting the input, except one that
 * matches an environment signature: a sign that mermaid reached for a browser
 * feature Node lacks. Such a failure says nothing about the input and must
 * never be recorded in a fixture.
 *
 * mermaid does reject some inputs with plain JavaScript errors (for example a
 * `TypeError` when an init directive is not an object). Fixtures rejected with
 * an error outside {@link STANDARD_REJECTIONS} are listed by the generator, so
 * that each can be checked by hand to be caused by the input.
 */

/**
 * Names of the errors mermaid throws on purpose when it rejects an input:
 *
 * - `Error`: syntax errors and errors Db classes throw (an unknown
 *   shape, too many edges, ...);
 * - `MermaidParseError`: lexer or parser errors reported by the public parse gate;
 * - `UnknownDiagramError`: no detector matched;
 * - `YAMLException`: invalid YAML in frontmatter or `@{ ... }` data.
 */
export const STANDARD_REJECTIONS: readonly string[] = [
  "Error",
  "MermaidParseError",
  "UnknownDiagramError",
  "YAMLException",
]

/**
 * Error messages that show mermaid needed something only a browser has.
 * (Every `ReferenceError` counts as such regardless of its message.)
 * Checked only for errors outside {@link STANDARD_REJECTIONS}: the messages of
 * those quote the input, which may contain any of these words.
 * Add an entry when a new environment failure is found.
 */
export const ENVIRONMENT_SIGNATURES: readonly RegExp[] = [
  // DOMPurify without a DOM has no sanitize/addHook/...
  /\bDOMPurify\b/u,
  // Browser globals and DOM APIs.
  /\b(?:document|window|navigator|Option|Image|Element|HTMLElement|SVGElement|SVGGraphicsElement|DOMParser|XMLSerializer|getComputedStyle|getBBox|getComputedTextLength|createElementNS|requestAnimationFrame|matchMedia)\b/u,
]

/**
 * Returns the name recorded for an error: `Error.name`, except that an error
 * named plainly `Error` reports its class when it is a subclass (mermaid's
 * `MermaidParseError` keeps the name `Error`).
 *
 * Class names are used only there because bundling may rename classes (the
 * YAML error class is `YAMLException2` in mermaid@12.0.0), while `name` is set
 * explicitly and stays stable.
 */
export function errorName(error: Error): string {
  if (error.name !== "Error") return error.name
  const className = (error.constructor as { name?: unknown } | undefined)?.name
  return typeof className === "string" && className ? className : "Error"
}

/**
 * Returns whether an error thrown by `mermaid.parse()` signals a missing
 * browser feature rather than a rejection.
 */
export function isEnvironmentFailure(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  // Only a reference to an undefined global throws this, which no input
  // causes; in Node, that global is one a browser has.
  if (error instanceof ReferenceError) return true
  if (STANDARD_REJECTIONS.includes(errorName(error))) return false
  return ENVIRONMENT_SIGNATURES.some((signature) =>
    signature.test(error.message),
  )
}
