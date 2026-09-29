/** A JSON value. */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue }

/** A JSON object. */
export type JsonObject = { readonly [key: string]: JsonValue }

/**
 * mermaid site configuration, as passed to `mermaid.initialize()`.
 */
export type MermaidConfig = JsonObject

/**
 * Error mermaid.js threw when rejecting an input.
 */
export interface MermaidError {
  /** `Error.name`, e.g. `Error` or `UnknownDiagramError`. */
  readonly name: string
  /** `Error.message`. For humans; parsers are not expected to reproduce it. */
  readonly message: string
}

/**
 * Normalized summary of a diagram Db: only what the syntax determines, as
 * plain JSON. The shape depends on the diagram type; see the "Db normalization"
 * section of `docs/diagrams/<diagram>.md` in `@mmd-toolkit/spec` and the
 * normalizer in `src/normalizers/`.
 */
export type DbSummary = JsonObject

/**
 * What one `@{ ... }` data block did to a diagram Db.
 */
export interface DataBlockEffect {
  /** The id written right before the block. */
  readonly id: string
  /**
   * The summary fields of the element the block applied to that the block
   * changed, with their new values; empty when it changed nothing.
   */
  readonly set: JsonObject
}
