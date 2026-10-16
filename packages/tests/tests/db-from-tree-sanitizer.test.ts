import { describe, expect, it } from "vitest"
import { textReplacementOf } from "../src/db-from-tree/text-replacement.ts"
import type { MermaidConfig } from "../src/index.ts"

// The replacement of characters (docs/db-from-tree.md, The replacement of
// characters), on its own: when a configuration makes it, and what it writes.
// Every case here has a fixture of the corpus with the same configuration or
// the same text, which tests/db-from-tree.test.ts compares through the
// builders; the cases are named so that a failure says which sentence it is.

/** The text that the cases below replace. */
const MARKUP = "a<b>=c<br>d"

/** The same text after the replacement. */
const MARKUP_REPLACED = "a&lt;b&gt;&equals;c<br/>d"

describe("textReplacementOf: when the text is replaced", () => {
  const KEPT_SECURITY_LEVELS = ["strict", "loose", "antiscript", "sandbox"]
  for (const level of KEPT_SECURITY_LEVELS) {
    it(`keeps the text under the securityLevel ${level}`, () => {
      expect(textReplacementOf({ securityLevel: level })(MARKUP)).toBe(MARKUP)
    })
  }

  const REPLACING_SECURITY_LEVELS: readonly [string, number | string][] = [
    ["other", "other"],
    ["the capitalized Loose", "Loose"],
    ["the empty text", ""],
    ["the number 1", 1],
  ]
  for (const [name, level] of REPLACING_SECURITY_LEVELS) {
    it(`replaces the text under the securityLevel ${name}`, () => {
      expect(textReplacementOf({ securityLevel: level })(MARKUP)).toBe(
        MARKUP_REPLACED,
      )
    })
  }

  const HTML_LABELS_CASES: readonly [string, MermaidConfig, boolean][] = [
    ["no htmlLabels", {}, true],
    ["root htmlLabels false", { htmlLabels: false }, false],
    ["root htmlLabels true", { htmlLabels: true }, true],
    ["root htmlLabels the text false", { htmlLabels: "false" }, false],
    ["root htmlLabels the number 0", { htmlLabels: 0 }, false],
    ["root htmlLabels the text 0", { htmlLabels: "0" }, false],
    ["root htmlLabels the text null", { htmlLabels: "null" }, false],
    ["root htmlLabels the text ' FALSE '", { htmlLabels: " FALSE " }, false],
    ["root htmlLabels the text no", { htmlLabels: "no" }, true],
    ["root htmlLabels the empty text", { htmlLabels: "" }, true],
    ["root htmlLabels the text true", { htmlLabels: "true" }, true],
    ["flowchart.htmlLabels false", { flowchart: { htmlLabels: false } }, false],
    [
      "flowchart.htmlLabels the number 0",
      { flowchart: { htmlLabels: 0 } },
      false,
    ],
    [
      "flowchart.htmlLabels the text false",
      { flowchart: { htmlLabels: "false" } },
      false,
    ],
    [
      "root htmlLabels null, flowchart.htmlLabels false",
      { htmlLabels: null, flowchart: { htmlLabels: false } },
      false,
    ],
    [
      "root htmlLabels true, flowchart.htmlLabels false",
      { htmlLabels: true, flowchart: { htmlLabels: false } },
      true,
    ],
    [
      "root htmlLabels false, flowchart.htmlLabels true",
      { htmlLabels: false, flowchart: { htmlLabels: true } },
      false,
    ],
    ["flowchart.htmlLabels null", { flowchart: { htmlLabels: null } }, true],
  ]
  for (const [name, config, enabled] of HTML_LABELS_CASES) {
    it(`${enabled ? "replaces" : "keeps"} the text with ${name}`, () => {
      const replacement = textReplacementOf({
        securityLevel: "other",
        ...config,
      })
      expect(replacement(MARKUP)).toBe(enabled ? MARKUP_REPLACED : MARKUP)
    })
  }
})

describe("textReplacementOf: what is written", () => {
  const replacement = textReplacementOf({ securityLevel: "other" })

  const CASES: readonly [string, string, string][] = [
    ["`<br>`", "a<br>b", "a<br/>b"],
    ["`<br/>`", "a<br/>b", "a<br/>b"],
    ["`<br />`", "a<br />b", "a<br/>b"],
    ["`</br>`", "a</br>b", "a<br/>b"],
    ["`<BR>`", "a<BR>b", "a<br/>b"],
    ["`<bR/>`", "a<bR/>b", "a<br/>b"],
    ["`</Br >`", "a</Br >b", "a<br/>b"],
    ["whitespace before the `/`", "a<br  />b", "a<br/>b"],
    ["a line feed before the `/`", "a<br\n/>b", "a<br/>b"],
    ["`#br#` as written", "a#br#b", "a<br/>b"],
    ["whitespace after the `<`", "a< br>b", "a&lt; br&gt;b"],
    ["whitespace between the `/` and the `>`", "a<br / >b", "a&lt;br / &gt;b"],
    ["whitespace inside `br`", "a<b r>b", "a&lt;b r&gt;b"],
    ["`<br` without a `>`", "a<br b", "a&lt;br b"],
    ["`<` alone", "<", "&lt;"],
    ["`>` alone", ">", "&gt;"],
    ["`=` alone", "=", "&equals;"],
    ["the empty text", "", ""],
    ["`#br#br#`", "a#br#br#b", "a<br/>br#b"],
    ["a tag then `<br#br#`", "<br><br#br#", "<br/>&lt;br<br/>"],
    ["a text that is replaced already", MARKUP_REPLACED, MARKUP_REPLACED],
  ]
  for (const [name, text, replaced] of CASES) {
    it(`writes ${name}`, () => {
      expect(replacement(text)).toBe(replaced)
    })
  }
})
