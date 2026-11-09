import type { Options } from "prettier"

/**
 * The Prettier options that the tool reads, and the only ones that it gives to
 * Prettier from a configuration (README, Configuration). The types are the
 * tool's own: an option that Prettier adds, or a value that Prettier adds to
 * one of these, reaches the tool only when it is written here.
 */
export interface ReadOptions {
  /**
   * The line width: whether a data block `@{ … }` on one line is printed on
   * several lines, whether the colons of the tasks of a Gantt section are lined
   * up, and where Prettier breaks the YAML of the frontmatter.
   */
  readonly printWidth?: number
  /** The width of one level of indentation, and of a tab. */
  readonly tabWidth?: number
  /** Whether a level of indentation is a tab. */
  readonly useTabs?: boolean
  /** `"off"` leaves the YAML of the frontmatter as written. */
  readonly embeddedLanguageFormatting?: "auto" | "off"
  /** The quotes of the strings in the YAML of the frontmatter. */
  readonly singleQuote?: boolean
  /** The spaces inside the braces of a flow mapping in the frontmatter. */
  readonly bracketSpacing?: boolean
  /** Whether Prettier wraps a long text in the YAML of the frontmatter. */
  readonly proseWrap?: "always" | "never" | "preserve"
  /** The comma after the last entry of a flow collection that breaks. */
  readonly trailingComma?: "all" | "es5" | "none"
}

/**
 * Every option of `ReadOptions`, as a record so that the type checker fails
 * where the interface has an option that this lacks, or this has one that the
 * interface lacks.
 */
const readOptionRecord = {
  printWidth: true,
  tabWidth: true,
  useTabs: true,
  embeddedLanguageFormatting: true,
  singleQuote: true,
  bracketSpacing: true,
  proseWrap: true,
  trailingComma: true,
} as const satisfies Record<keyof ReadOptions, true>

/** The names of the options in `ReadOptions`. */
export const readOptionNames: readonly (keyof ReadOptions)[] = Object.keys(
  readOptionRecord,
) as (keyof ReadOptions)[]

/**
 * The options that the tool reads of a configuration that Prettier resolved for
 * a file, in `config`; the others, such as the range, the pragmas, and the
 * options of other languages, are not read.
 */
export function readOptions(config: Options): ReadOptions {
  return Object.fromEntries(readOptionNames.map((name) => [name, config[name]]))
}
