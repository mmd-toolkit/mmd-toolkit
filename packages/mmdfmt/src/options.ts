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
 * lacks is `undefined`, which Prettier takes as its default.
 */
export function readOptions(config: Options): ReadOptions {
  return {
    printWidth: config.printWidth,
    tabWidth: config.tabWidth,
    useTabs: config.useTabs,
    embeddedLanguageFormatting: config.embeddedLanguageFormatting,
    singleQuote: config.singleQuote,
    bracketSpacing: config.bracketSpacing,
    proseWrap: config.proseWrap,
    trailingComma: config.trailingComma,
  }
}
