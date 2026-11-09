import type { Options } from "prettier"

/**
 * The Prettier options that the tool reads, and the only ones that it gives to
 * Prettier from a configuration (README, Configuration). An option that
 * Prettier adds is not read until it is written here. The types are the tool's
 * own: where the types of Prettier gain a value for one of these options, as
 * they may in a later version, the type checker fails in `readOptions` until
 * the type here is widened on purpose.
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
 * The names of the options in `ReadOptions`. `tests/options.test.ts` ties this
 * list to the options that `readOptions` takes.
 */
export const readOptionNames: readonly (keyof ReadOptions)[] = [
  "printWidth",
  "tabWidth",
  "useTabs",
  "embeddedLanguageFormatting",
  "singleQuote",
  "bracketSpacing",
  "proseWrap",
  "trailingComma",
]

/**
 * The options that the tool reads of a configuration that Prettier resolved for
 * a file, in `config`; the others, such as the range, the pragmas, and the
 * options of other languages, are not read. An option that the configuration
 * lacks is not in the result, as in what Prettier resolves, so that a caller
 * can spread the result over its own defaults.
 */
export function readOptions(config: Options): ReadOptions {
  // Each option is named, so that the type checker compares it with the type
  // here; the ones that the configuration lacks are then left out.
  const named: ReadOptions = {
    printWidth: config.printWidth,
    tabWidth: config.tabWidth,
    useTabs: config.useTabs,
    embeddedLanguageFormatting: config.embeddedLanguageFormatting,
    singleQuote: config.singleQuote,
    bracketSpacing: config.bracketSpacing,
    proseWrap: config.proseWrap,
    trailingComma: config.trailingComma,
  }
  return Object.fromEntries(
    Object.entries(named).filter(([, value]) => value !== undefined),
  )
}
