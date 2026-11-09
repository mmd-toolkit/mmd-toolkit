/**
 * Ties the options that the tool reads to the options that Prettier and
 * prettier-plugin-mmd have, so that an option added to either is placed on
 * purpose: read, or not (README, Configuration).
 */
import { getSupportInfo } from "prettier"
import plugin from "prettier-plugin-mmd"
import { describe, expect, it } from "vitest"
import { readOptionNames, readOptions } from "../src/options.ts"

/** The options that the tool sets itself, whatever the configuration says. */
const setByTool = ["endOfLine", "parser", "plugins"]

/** The options that the tool does not read, by the part of Prettier they belong to. */
const notRead = [
  // The range and the cursor: the tool formats whole diagrams.
  "cursorOffset",
  "rangeEnd",
  "rangeStart",
  // The pragmas: the tool decides which files it formats.
  "checkIgnorePragma",
  "insertPragma",
  "requirePragma",
  // The file: the tool gives Prettier the text, not a path.
  "filepath",
  // The options of other languages.
  "arrowParens",
  "bracketSameLine",
  "experimentalOperatorPosition",
  "experimentalTernaries",
  "htmlWhitespaceSensitivity",
  "jsxSingleQuote",
  "objectWrap",
  "quoteProps",
  "semi",
  "singleAttributePerLine",
  "vueIndentScriptAndStyle",
]

/** Orders names alphabetically. */
function byName(a: string, b: string): number {
  return a.localeCompare(b)
}

describe("The options that the tool reads", () => {
  it("are every option of Prettier and the plugin that is neither set by the tool nor left unread, on purpose", async () => {
    const { options } = await getSupportInfo({ plugins: [plugin] })
    const placed = [...readOptionNames, ...setByTool, ...notRead]
    expect(placed.toSorted(byName)).toEqual(
      options
        .flatMap(({ name }) => (name === undefined ? [] : [name]))
        .toSorted(byName),
    )
  })

  it("are the only options taken from a configuration", () => {
    expect(
      readOptions({
        printWidth: 40,
        tabWidth: 4,
        useTabs: true,
        embeddedLanguageFormatting: "off",
        singleQuote: true,
        bracketSpacing: false,
        proseWrap: "never",
        trailingComma: "none",
        parser: "babel",
        plugins: ["prettier-plugin-x"],
        endOfLine: "crlf",
        rangeStart: 1,
        rangeEnd: 2,
        cursorOffset: 3,
        requirePragma: true,
        semi: false,
      }),
    ).toStrictEqual({
      printWidth: 40,
      tabWidth: 4,
      useTabs: true,
      embeddedLanguageFormatting: "off",
      singleQuote: true,
      bracketSpacing: false,
      proseWrap: "never",
      trailingComma: "none",
    })
  })

  it("are the eight that the README names", () => {
    expect(readOptionNames.toSorted(byName)).toEqual([
      "bracketSpacing",
      "embeddedLanguageFormatting",
      "printWidth",
      "proseWrap",
      "singleQuote",
      "tabWidth",
      "trailingComma",
      "useTabs",
    ])
  })
})
