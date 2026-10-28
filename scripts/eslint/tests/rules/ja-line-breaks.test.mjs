import markdown from "@eslint/markdown"
import { Linter, RuleTester } from "eslint"
import { describe, it, expect } from "vitest"
import { jaLineBreaks } from "../../rules/ja-line-breaks.mjs"

RuleTester.describe = describe
RuleTester.it = it
const config = {
  plugins: {
    "eslint-markdown": markdown,
    local: { rules: { "ja-line-breaks": jaLineBreaks } },
  },
  language: "eslint-markdown/gfm",
  languageOptions: { frontmatter: "yaml" },
}
const valid = [
  { name: "wide neighbors already joined", code: "これは日本語の文です。" },
  {
    name: "mixed neighbors already spaced",
    code: "説明を変える `accDescr` 文です。",
  },
  { name: "hard break is a boundary", code: "先の文  \n次の文。" },
  {
    name: "halfwidth neighbors retain a break",
    code: "English words\nstay separate",
  },
  {
    name: "period inside fullwidth brackets",
    code: "説明（内側。まだ内側）です。",
  },
  { name: "period before closing strong", code: "**最初の文。**\n次の文。" },
  { name: "period before opening strong", code: "最初の文。\n**次の文。**" },
  {
    name: "citation belongs to the preceding sentence",
    code: "説明です。 [fixture: a] [test: b]\n次の文です。",
  },
  {
    name: "comma wrapping already in place",
    code: "この規則は、\n括弧の間に何も持たないか空白だけを持つ `accDescr` のブロックを報告する。",
  },
  {
    name: "citations retain a halfwidth break",
    code: "[fixture: first-example]\n[fixture: second-example]",
  },
  {
    name: "wide-adjacent spaces stay inside a line",
    code: "parser の説明です。",
  },
  {
    name: "single protected range may exceed 80",
    code: "`a-single-protected-name-that-is-longer-than-eighty-columns-and-has-no-break-opportunity-inside-it`",
  },
  {
    name: "a line too wide only because of a link stays",
    code: "[長いリンクの文字列](https://example.com/docs/a-path-that-is-long-enough-to-pass-the-limit-by-itself) は、\n次の説明に続く。",
  },
  {
    name: "a code span with its particle stays when the rest fits",
    code: "`a-code-span-that-is-wider-than-seventy-columns-and-cannot-be-broken-xxxx` を使う。",
  },
  { name: "inline code period", code: "`内側。内側、内側` の説明です。" },
  {
    name: "link period",
    code: "[内側。内側、内側](https://example.com)の説明です。",
  },
  { name: "citation period", code: "説明です。 [fixture: 内側。内側、内側]" },
  { name: "line start punctuation", code: "説明です。）。" },
  {
    name: "list continuation",
    code: "- この規則は、\n  括弧の間に何も持たないか空白だけを持つ `accDescr` のブロックを報告する。",
  },
  {
    name: "blockquote continuation",
    code: "> この規則は、\n> 括弧の間に何も持たないか空白だけを持つ `accDescr` のブロックを報告する。",
  },
  {
    name: "non-prose is excluded",
    code: "---\ntitle: 最初。次。\n---\n\n# 最初。次。\n\n| 最初。次。 |\n| --- |\n| 最初。次。 |\n\n```text\n最初。次。\n```\n\n<div>最初。次。</div>\n\n[ref]: https://example.com",
  },
]
const invalid = [
  {
    name: "wrap after the comma that follows a line kept for its link",
    code: "[長いリンクの文字列](https://example.com/docs/a-path-that-is-long-enough-to-pass-the-limit-by-itself) は、次の説明に続く。",
    output:
      "[長いリンクの文字列](https://example.com/docs/a-path-that-is-long-enough-to-pass-the-limit-by-itself) は、\n次の説明に続く。",
    errors: [{ messageId: "normalize" }],
  },
  {
    name: "a kept line follows a wrapped line and precedes another",
    code: "最初の説明は、[長いリンクの文字列](https://example.com/docs/a-path-that-is-long-enough-to-pass-the-limit-by-itself) に、次の説明に続く。",
    output:
      "最初の説明は、\n[長いリンクの文字列](https://example.com/docs/a-path-that-is-long-enough-to-pass-the-limit-by-itself) に、\n次の説明に続く。",
    errors: [{ messageId: "normalize" }],
  },
  {
    name: "keep a line too wide for its link inside a list item",
    code: "- [長いリンクの文字列](https://example.com/docs/a-path-that-is-long-enough-to-pass-the-limit-by-itself) は、次の説明に続く。",
    output:
      "- [長いリンクの文字列](https://example.com/docs/a-path-that-is-long-enough-to-pass-the-limit-by-itself) は、\n  次の説明に続く。",
    errors: [{ messageId: "normalize" }],
  },
  {
    name: "report a line whose prose alone exceeds the limit beside a span",
    code: "`a-span-of-forty-columns-xxxxxxxxxxxxxxxx` の後に読点のない長い日本語の説明がそのまま続いていて八十桁を超えてしまう文であるとする。",
    output: null,
    errors: [{ messageId: "cannotFit" }],
  },
  {
    name: "greedy wrapping keeps literal operators in prose",
    code: "EBNF の波括弧は下限 0、上限 Infinity の repetition、後置の ?、*、+ は optional または下限 0/1、上限 Infinity の repetition となり、書かれた入れ子の順を保つ。",
    output:
      "EBNF の波括弧は下限 0、上限 Infinity の repetition、\n後置の ?、*、+ は optional または下限 0/1、上限 Infinity の repetition となり、\n書かれた入れ子の順を保つ。",
    errors: [{ messageId: "normalize" }],
  },
  {
    name: "consume a whole ASCII space run without trailing spaces",
    code: "first English phrase with ordinary words and a deliberately long explanation  second English phrase",
    output:
      "first English phrase with ordinary words and a deliberately long explanation\nsecond English phrase",
    errors: [{ messageId: "normalize" }],
  },
  {
    name: "wrap list prose at its content column",
    code: "- この規則は、括弧の間に何も持たないか空白だけを持つ `accDescr` のブロックを\n  報告する。",
    output:
      "- この規則は、\n  括弧の間に何も持たないか空白だけを持つ `accDescr` のブロックを報告する。",
    errors: [{ messageId: "normalize" }],
  },
  {
    name: "wrap blockquote prose with the same prefix",
    code: "> この規則は、括弧の間に何も持たないか空白だけを持つ `accDescr` のブロックを\n> 報告する。",
    output:
      "> この規則は、\n> 括弧の間に何も持たないか空白だけを持つ `accDescr` のブロックを報告する。",
    errors: [{ messageId: "normalize" }],
  },
  {
    name: "two paragraph fixes never overlap",
    code: "最初。次。\n\n別の文。後の文。",
    output: "最初。\n次。\n\n別の文。\n後の文。",
    errors: [{ messageId: "normalize" }, { messageId: "normalize" }],
  },
  {
    name: "join wide neighbors",
    code: "これは日本語の\n文です。",
    output: "これは日本語の文です。",
    errors: [{ messageId: "normalize" }],
  },
  {
    name: "join mixed neighbors and their indentation",
    code: "説明を変える \n  `accDescr` 文です。",
    output: "説明を変える `accDescr` 文です。",
    errors: [{ messageId: "normalize" }],
  },
  {
    name: "preserve a hard break while normalizing both sides",
    code: "最初。次  \n後。最後。",
    output: "最初。\n次  \n後。\n最後。",
    errors: [{ messageId: "normalize" }],
  },
  {
    name: "retain halfwidth breaks while splitting sentences",
    code: "English words\nstay separate。次。",
    output: "English words\nstay separate。\n次。",
    errors: [{ messageId: "normalize" }],
  },
  {
    name: "do not split the nested period",
    code: "説明（内側。まだ内側）です。次。",
    output: "説明（内側。まだ内側）です。\n次。",
    errors: [{ messageId: "normalize" }],
  },
  {
    name: "include closing strong in the sentence",
    code: "**最初の文。** 次の文。",
    output: "**最初の文。**\n次の文。",
    errors: [{ messageId: "normalize" }],
  },
  {
    name: "leave opening strong with the next sentence",
    code: "最初の文。**次の文。**",
    output: "最初の文。\n**次の文。**",
    errors: [{ messageId: "normalize" }],
  },
  {
    name: "attach all following citations",
    code: "説明です。 [fixture: a] [test: b]次の文です。",
    output: "説明です。 [fixture: a] [test: b]\n次の文です。",
    errors: [{ messageId: "normalize" }],
  },
  {
    name: "use the last comma within 80, including a short first line",
    code: "この規則は、括弧の間に何も持たないか空白だけを持つ `accDescr` のブロックを\n報告する。",
    output:
      "この規則は、\n括弧の間に何も持たないか空白だけを持つ `accDescr` のブロックを報告する。",
    errors: [{ messageId: "normalize" }],
  },
  {
    name: "greedily choose a later comma",
    code: "この文では、最初の説明を読み、次の説明も読み、最後の説明まで読んでから全体の判断を行います。",
    output:
      "この文では、最初の説明を読み、次の説明も読み、\n最後の説明まで読んでから全体の判断を行います。",
    errors: [{ messageId: "normalize" }],
  },
  {
    name: "wrap at the halfwidth space between citations",
    code: "[fixture: first-example-with-a-long-identifier] [fixture: second-example-with-a-long-identifier]",
    output:
      "[fixture: first-example-with-a-long-identifier]\n[fixture: second-example-with-a-long-identifier]",
    errors: [{ messageId: "normalize" }],
  },
  {
    name: "a wide-adjacent space is not a candidate",
    code: "parser の説明には空白がありますがこの文には読点がないので長い説明をそのまま残して書き手に文を分けてもらいます。",
    output: null,
    errors: [{ messageId: "cannotFit" }],
  },
  {
    name: "leave the whole unwrappable sentence unchanged",
    code: "この文は、読点の後に続くとても長い説明の中に折るための候補を持っていないので元の文の\n内部にあった改行をそのまま残して報告します。",
    output: null,
    errors: [{ messageId: "cannotFit" }],
  },
  {
    name: "exempt a long protected range but fix another paragraph",
    code: "`a-single-protected-name-that-is-longer-than-eighty-columns-and-has-no-break-opportunity-inside-it`\n\n最初。次。",
    output:
      "`a-single-protected-name-that-is-longer-than-eighty-columns-and-has-no-break-opportunity-inside-it`\n\n最初。\n次。",
    errors: [{ messageId: "normalize" }],
  },
  {
    name: "keep inline code intact",
    code: "`内側。内側、内側` の説明です。次。",
    output: "`内側。内側、内側` の説明です。\n次。",
    errors: [{ messageId: "normalize" }],
  },
  {
    name: "keep links intact",
    code: "[内側。内側、内側](https://example.com)の説明です。次。",
    output: "[内側。内側、内側](https://example.com)の説明です。\n次。",
    errors: [{ messageId: "normalize" }],
  },
  {
    name: "keep bracketed citations intact",
    code: "説明です。 [fixture: 内側。内側、内側]次。",
    output: "説明です。 [fixture: 内側。内側、内側]\n次。",
    errors: [{ messageId: "normalize" }],
  },
  {
    name: "never put closing punctuation at line start",
    code: "説明です。）。次。",
    output: "説明です。）。\n次。",
    errors: [{ messageId: "normalize" }],
  },
  {
    name: "retain list content columns",
    code: "- 最初の文。次の文。",
    output: "- 最初の文。\n  次の文。",
    errors: [{ messageId: "normalize" }],
  },
  {
    name: "retain blockquote prefixes",
    code: "> 最初の文。次の文。",
    output: "> 最初の文。\n> 次の文。",
    errors: [{ messageId: "normalize" }],
  },
  {
    name: "only change the prose paragraph",
    code: "---\ntitle: 最初。次。\n---\n\n# 最初。次。\n\n| 最初。次。 |\n| --- |\n| 最初。次。 |\n\n```text\n最初。次。\n```\n\n最初。次。",
    output:
      "---\ntitle: 最初。次。\n---\n\n# 最初。次。\n\n| 最初。次。 |\n| --- |\n| 最初。次。 |\n\n```text\n最初。次。\n```\n\n最初。\n次。",
    errors: [{ messageId: "normalize" }],
  },
]
new RuleTester(config).run("ja-line-breaks", jaLineBreaks, { valid, invalid })

const linter = new Linter()
new RuleTester(config).run(
  "ja-line-breaks/protected-and-container-boundaries",
  jaLineBreaks,
  {
    valid: [
      {
        name: "matching nested citation brackets",
        code: "説明です。 [fixture: outer[inner。]、残り]",
      },
      {
        name: "multiline inline code is protected",
        code: "`英語\n日本語。` の説明。",
      },
      {
        name: "image content is protected",
        code: "説明![内側。内側](image.png)です。",
      },
      {
        name: "inline HTML is protected",
        code: '説明<span title="内側。内側">文字</span>です。',
      },
      {
        name: "single emphasis closes with the sentence",
        code: "*最初。*\n次。",
      },
      {
        name: "underscore emphasis closes with the sentence",
        code: "_最初。_\n次。",
      },
      {
        name: "nested list paragraph columns",
        code: "- 外側。\n  - 内側。\n\n    最初。\n    次。",
      },
      {
        name: "a comma never begins a line",
        code: "説明の続き、後の説明です。",
      },
    ],
    invalid: [
      {
        name: "retain nested citation content",
        code: "説明です。 [fixture: outer[inner。]、残り]次。",
        output: "説明です。 [fixture: outer[inner。]、残り]\n次。",
        errors: [{ messageId: "normalize" }],
      },
      {
        name: "retain a protected soft break",
        code: "`英語\n日本語。` の説明。次。",
        output: "`英語\n日本語。` の説明。\n次。",
        errors: [{ messageId: "normalize" }],
      },
      {
        name: "retain image content",
        code: "説明![内側。内側](image.png)です。次。",
        output: "説明![内側。内側](image.png)です。\n次。",
        errors: [{ messageId: "normalize" }],
      },
      {
        name: "retain inline HTML",
        code: '説明<span title="内側。内側">文字</span>です。次。',
        output: '説明<span title="内側。内側">文字</span>です。\n次。',
        errors: [{ messageId: "normalize" }],
      },
      {
        name: "include closing single emphasis",
        code: "*最初。* 次。",
        output: "*最初。*\n次。",
        errors: [{ messageId: "normalize" }],
      },
      {
        name: "include closing underscore emphasis",
        code: "_最初。_ 次。",
        output: "_最初。_\n次。",
        errors: [{ messageId: "normalize" }],
      },
      {
        name: "normalize a nested list continuation paragraph",
        code: "- 外側。\n  - 内側。\n\n    最初。次。",
        output: "- 外側。\n  - 内側。\n\n    最初。\n    次。",
        errors: [{ messageId: "normalize" }],
      },
      {
        name: "join before a comma instead of starting with it",
        code: "説明の続き\n、後の説明です。",
        output: "説明の続き、後の説明です。",
        errors: [{ messageId: "normalize" }],
      },
      {
        name: "do not turn an operator into a list marker",
        code: "最初は RailroadExceptionExpression 全体を operator + で包む\nRailroadPostfixExpression。",
        output: null,
        errors: [{ messageId: "cannotFit" }],
      },
    ],
  },
)

it("ESLint reaches the same normal form for a citation without a separator", () => {
  const configured = [{ ...config, rules: { "local/ja-line-breaks": "error" } }]
  const first = linter.verifyAndFix("説明です。[fixture: a]", configured)
  expect(first.output).toBe("説明です。 [fixture: a]")
  expect(first.messages).toEqual([])
  const second = linter.verifyAndFix(first.output, configured)
  expect(second.fixed).toBe(false)
  expect(second.output).toBe(first.output)
})

for (const example of invalid) {
  if (example.output === null) continue
  it(`normal form is idempotent: ${example.name}`, () => {
    const messages = linter.verify(example.output, [
      { ...config, rules: { "local/ja-line-breaks": "error" } },
    ])
    expect(messages).toEqual([])
  })
}
