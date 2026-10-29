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
    name: "halfwidth neighbors are joined with a space",
    code: "English words stay separate",
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
    name: "short citation rows are joined with a space",
    code: "[fixture: first-example] [fixture: second-example]",
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
    name: "an overlong link occupies its own line",
    code: "[長いリンクの文字列](https://example.com/docs/a-path-that-is-long-enough-to-pass-the-limit-by-itself)\nは、次の説明に続く。",
  },
  {
    name: "a short code span is separated from its particle to fit",
    code: "`a-code-span-that-is-wider-than-seventy-columns-and-cannot-be-broken-xxxx`\nを使う。",
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
    name: "a space between two wide characters is not a break",
    code: "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよら り。",
    output: null,
    errors: [{ messageId: "cannotFit" }],
  },
  {
    name: "put the overlong link alone before the remaining prose",
    code: "[長いリンクの文字列](https://example.com/docs/a-path-that-is-long-enough-to-pass-the-limit-by-itself) は、次の説明に続く。",
    output:
      "[長いリンクの文字列](https://example.com/docs/a-path-that-is-long-enough-to-pass-the-limit-by-itself)\nは、次の説明に続く。",
    errors: [{ messageId: "normalize" }],
  },
  {
    name: "isolate an overlong link between two prose lines",
    code: "最初の説明は、[長いリンクの文字列](https://example.com/docs/a-path-that-is-long-enough-to-pass-the-limit-by-itself) に、次の説明に続く。",
    output:
      "最初の説明は、\n[長いリンクの文字列](https://example.com/docs/a-path-that-is-long-enough-to-pass-the-limit-by-itself)\nに、次の説明に続く。",
    errors: [{ messageId: "normalize" }],
  },
  {
    name: "isolate the overlong link at the list content column",
    code: "- [長いリンクの文字列](https://example.com/docs/a-path-that-is-long-enough-to-pass-the-limit-by-itself) は、次の説明に続く。",
    output:
      "- [長いリンクの文字列](https://example.com/docs/a-path-that-is-long-enough-to-pass-the-limit-by-itself)\n  は、次の説明に続く。",
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
    name: "join halfwidth breaks before splitting sentences",
    code: "English words\nstay separate。次。",
    output: "English words stay separate。\n次。",
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
    name: "one space cannot split the remaining overlong prose word",
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
const boundaryCases = {
  valid: [
    {
      name: "a mixed-width space keeps the operator inside prose",
      code: "最初は RailroadExceptionExpression 全体を operator + で包む\nRailroadPostfixExpression。",
    },
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
  ],
}
new RuleTester(config).run(
  "ja-line-breaks/protected-and-container-boundaries",
  jaLineBreaks,
  boundaryCases,
)

const reviewCases = {
  valid: [
    {
      name: "ASCII parentheses contain a period",
      code: "設定 (例。値) を読む。",
    },
    {
      name: "only matched openers affect later sentences",
      code: "閉じのない（説明です。\n次の文です。",
    },
    {
      name: "inseparable punctuation stays with an overlong code word",
      code: "（`a-single-protected-name-that-is-longer-than-eighty-columns-and-has-no-break-opportunity-inside-it`）。",
    },
    {
      name: "adjacent references stay adjacent",
      code: "最初の文。 [fixture: case/u2028][fixture: b]\n次の文。",
    },
  ],
  invalid: [
    {
      name: "prefer the last comma over a later space within 80",
      code: "この規則は、あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほ `ab` を報告する。",
      output:
        "この規則は、\nあいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほ `ab` を報告する。",
      errors: [{ messageId: "normalize" }],
    },
    {
      name: "use a mixed-width space when no comma fits",
      code: "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよら `ab`。",
      output:
        "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよら\n`ab`。",
      errors: [{ messageId: "normalize" }],
    },
    {
      name: "use a halfwidth space when no comma fits",
      code: "first English phrase with ordinary words and a deliberately long explanation second English phrase",
      output:
        "first English phrase with ordinary words and a deliberately long explanation\nsecond English phrase",
      errors: [{ messageId: "normalize" }],
    },
    {
      name: "isolate an overlong word at the beginning",
      code: "`a-single-protected-name-that-is-longer-than-eighty-columns-and-has-no-break-opportunity-inside-it` を説明する。",
      output:
        "`a-single-protected-name-that-is-longer-than-eighty-columns-and-has-no-break-opportunity-inside-it`\nを説明する。",
      errors: [{ messageId: "normalize" }],
    },
    {
      name: "isolate an overlong word in the middle",
      code: "前に説明を置く `a-single-protected-name-that-is-longer-than-eighty-columns-and-has-no-break-opportunity-inside-it` 後の説明を置く。",
      output:
        "前に説明を置く\n`a-single-protected-name-that-is-longer-than-eighty-columns-and-has-no-break-opportunity-inside-it`\n後の説明を置く。",
      errors: [{ messageId: "normalize" }],
    },
    {
      name: "isolate an overlong final word with its period",
      code: "最後の説明は `a-single-protected-name-that-is-longer-than-eighty-columns-and-has-no-break-opportunity-inside-it`。",
      output:
        "最後の説明は\n`a-single-protected-name-that-is-longer-than-eighty-columns-and-has-no-break-opportunity-inside-it`。",
      errors: [{ messageId: "normalize" }],
    },
    {
      name: "isolate an overlong word inside a list",
      code: "- `a-single-protected-name-that-is-longer-than-eighty-columns-and-has-no-break-opportunity-inside-it` を説明する。",
      output:
        "- `a-single-protected-name-that-is-longer-than-eighty-columns-and-has-no-break-opportunity-inside-it`\n  を説明する。",
      errors: [{ messageId: "normalize" }],
    },
    {
      name: "keep the comma inseparable from an overlong word",
      code: "`a-single-protected-name-that-is-longer-than-eighty-columns-and-has-no-break-opportunity-inside-it`、続く説明。",
      output:
        "`a-single-protected-name-that-is-longer-than-eighty-columns-and-has-no-break-opportunity-inside-it`、\n続く説明。",
      errors: [{ messageId: "normalize" }],
    },
    {
      name: "a four-column code span does not exempt an 84-column line",
      code: "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよら`ab`。",
      output: null,
      errors: [{ messageId: "cannotFit" }],
    },
    {
      name: "an eight-column code span does not exempt a 90-column sentence",
      code: "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらり`abcdef`。",
      output: null,
      errors: [{ messageId: "cannotFit" }],
    },
    {
      name: "a space lets the sentence with an eight-column span fit",
      code: "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらり `abcdef`。",
      output:
        "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらり\n`abcdef`。",
      errors: [{ messageId: "normalize" }],
    },
    {
      name: "reflow an already short-line sentence at its mixed-width space",
      code: "あいうえおかきくけこさしすせそたちつてと\nなにぬねのはひふへほまみむめもやゆよら `ab`。",
      output:
        "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよら\n`ab`。",
      errors: [{ messageId: "normalize" }],
    },
    {
      name: "attach a citation without a separator in one fix",
      code: "最初の文。[fixture: a/b] 次の文。",
      output: "最初の文。 [fixture: a/b]\n次の文。",
      errors: [{ messageId: "normalize" }],
    },
    {
      name: "keep adjacent references without inserting a space between them",
      code: "最初の文。[fixture: case/u2028][fixture: b] 次の文。",
      output: "最初の文。 [fixture: case/u2028][fixture: b]\n次の文。",
      errors: [{ messageId: "normalize" }],
    },
    {
      name: "join the break between two inline code spans",
      code: "これは `foo`\n`bar` を使う。",
      output: "これは `foo` `bar` を使う。",
      errors: [{ messageId: "normalize" }],
    },
    {
      name: "an unmatched fullwidth opener does not hide sentence ends",
      code: "閉じのない（説明です。次の文です。",
      output: "閉じのない（説明です。\n次の文です。",
      errors: [{ messageId: "normalize" }],
    },
    {
      name: "join a soft break after a period inside ASCII parentheses",
      code: "設定 (例。\n値) を読む。",
      output: "設定 (例。値) を読む。",
      errors: [{ messageId: "normalize" }],
    },
    {
      name: "keep a final hard break while splitting an earlier sentence",
      code: "最初。次  \n",
      output: "最初。\n次  \n",
      errors: [{ messageId: "normalize" }],
    },
    {
      name: "an overlong span does not exempt adjacent ordinary prose",
      code: "前に`a-single-protected-name-that-is-longer-than-eighty-columns-and-has-no-break-opportunity-inside-it`後に。",
      output: null,
      errors: [{ messageId: "cannotFit" }],
    },
  ],
}
new RuleTester(config).run(
  "ja-line-breaks/review-jlb2",
  jaLineBreaks,
  reviewCases,
)

const citationCases = {
  valid: [
    {
      name: "a backslash hard break after a sentence stays with it",
      code: "短い文です。\\\n次の文。",
    },
    {
      name: "a backslash hard break after the last reference stays with it",
      code: "短い文です。 [fixture: a]\\\n次の文。",
    },
    {
      name: "a hard break after the last reference closes the sentence",
      code: "最初の文は、短いです。 [fixture: a] [fixture: b]  \n次の文。",
    },
    {
      name: "a period after the last reference stays with it",
      code: "最初の文は、短いです。 [fixture: a] [fixture: b].\n次の文。",
    },
    {
      name: "a short body and its references share one line",
      code: "説明です。 [fixture: a] [fixture: b]",
    },
    {
      name: "a reference continues after the intact body",
      code: "後から宣言した軸も対象で、radar 設定は受理を変えません。 [fixture: a]\n[fixture: b]",
    },
    {
      name: "an emphasized overlong link is exempt with its closing period",
      code: "**[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.ja.md)。**\n後の文。",
    },
    {
      name: "single emphasis belongs to the overlong protected word",
      code: "*`a-single-protected-name-that-is-longer-than-eighty-columns-and-has-no-break-opportunity-inside-it`。*",
    },
    {
      name: "underscore emphasis belongs to the overlong protected word",
      code: "_`a-single-protected-name-that-is-longer-than-eighty-columns-and-has-no-break-opportunity-inside-it`。_",
    },
    {
      name: "strikethrough belongs to the overlong protected word",
      code: "~~`a-single-protected-name-that-is-longer-than-eighty-columns-and-has-no-break-opportunity-inside-it`。~~",
    },
  ],
  invalid: [
    {
      name: "a backslash hard break does not start a new sentence",
      code: "短い文は、\n長めです。\\\n次の文。",
      output: "短い文は、長めです。\\\n次の文。",
      errors: [{ messageId: "normalize" }],
    },
    {
      name: "a hard break after the last reference does not split the body",
      code: "最初の文は、\n短いです。 [fixture: a] [fixture: b]  \n次の文。",
      output: "最初の文は、短いです。 [fixture: a] [fixture: b]  \n次の文。",
      errors: [{ messageId: "normalize" }],
    },
    {
      name: "a period after the last reference does not split the body",
      code: "最初の文は、\n短いです。 [fixture: a] [fixture: b].\n次の文。",
      output: "最初の文は、短いです。 [fixture: a] [fixture: b].\n次の文。",
      errors: [{ messageId: "normalize" }],
    },
    {
      name: "one reference moves without wrapping the fitting body",
      code: "後から宣言した軸も対象で、radar 設定は受理を変えません。 [fixture: radar/axes-declared-after-configuration]",
      output:
        "後から宣言した軸も対象で、radar 設定は受理を変えません。\n[fixture: radar/axes-declared-after-configuration]",
      errors: [{ messageId: "normalize" }],
    },
    {
      name: "only the second reference moves from the fitting body",
      code: "後から宣言した軸も対象で、radar 設定は受理を変えません。 [fixture: a] [fixture: b]",
      output:
        "後から宣言した軸も対象で、radar 設定は受理を変えません。 [fixture: a]\n[fixture: b]",
      errors: [{ messageId: "normalize" }],
    },
    {
      name: "reference continuations retain the list prefix width",
      code: "- 後から宣言した軸も対象で、radar 設定は受理を変えません。 [fixture: a] [fixture: b]",
      output:
        "- 後から宣言した軸も対象で、radar 設定は受理を変えません。 [fixture: a]\n  [fixture: b]",
      errors: [{ messageId: "normalize" }],
    },
    {
      name: "a reference fits on the final line of a wrapped body",
      code: "この文では、最初の説明を読み、次の説明も読み、最後の説明まで読んでから全体の判断を行います。 [fixture: a]",
      output:
        "この文では、最初の説明を読み、次の説明も読み、\n最後の説明まで読んでから全体の判断を行います。 [fixture: a]",
      errors: [{ messageId: "normalize" }],
    },
    {
      name: "a reference continues after the final line of a wrapped body",
      code: "この文では、最初の説明を読み、次の説明も読み、最後の説明まで読んでから全体の判断を行います。 [fixture: a-long-reference-identifier-for-the-continuation-line]",
      output:
        "この文では、最初の説明を読み、次の説明も読み、\n最後の説明まで読んでから全体の判断を行います。\n[fixture: a-long-reference-identifier-for-the-continuation-line]",
      errors: [{ messageId: "normalize" }],
    },
    {
      name: "an overlong reference occupies an exempt continuation line",
      code: "説明です。 [fixture: a-single-protected-name-that-is-longer-than-eighty-columns-and-has-no-break-opportunity-inside-it] 次の文。",
      output:
        "説明です。\n[fixture: a-single-protected-name-that-is-longer-than-eighty-columns-and-has-no-break-opportunity-inside-it]\n次の文。",
      errors: [{ messageId: "normalize" }],
    },
    {
      name: "a directly attached reference gets exactly one separating space",
      code: "説明です。[fixture: a]   [fixture: b] 次の文。",
      output: "説明です。 [fixture: a] [fixture: b]\n次の文。",
      errors: [{ messageId: "normalize" }],
    },
    {
      name: "adjacent references stay adjacent on a continuation",
      code: "後から宣言した軸も対象で、radar 設定は受理を変えません。[fixture: a][fixture: b] 次の文。",
      output:
        "後から宣言した軸も対象で、radar 設定は受理を変えません。\n[fixture: a][fixture: b]\n次の文。",
      errors: [{ messageId: "normalize" }],
    },
    {
      name: "a strong overlong link keeps its period and closes before the next sentence",
      code: "**[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.ja.md)。** 後の文。",
      output:
        "**[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.ja.md)。**\n後の文。",
      errors: [{ messageId: "normalize" }],
    },
    {
      name: "normalization message describes space wrapping and reference continuations",
      code: "最初。次。",
      output: "最初。\n次。",
      errors: [
        {
          message:
            "Use one sentence per line and wrap long sentences after 、 or at a space within 80 columns, with following references on the last line or continuation lines.",
        },
      ],
    },
    {
      name: "unwrappable message describes both break candidates and the author's remedy",
      code: "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよら`ab`。",
      output: null,
      errors: [
        {
          message:
            "This sentence is 84 columns wide and cannot be broken after 、 or at a space within 80 columns: split it or add a 、.",
        },
      ],
    },
  ],
}
new RuleTester(config).run(
  "ja-line-breaks/review-jlb3",
  jaLineBreaks,
  citationCases,
)

it("fixes another sentence while preserving and reporting an unwrappable one", () => {
  const configured = [{ ...config, rules: { "local/ja-line-breaks": "error" } }]
  const messages = linter.verify(
    "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよら`ab`。\n別の文。次の文。",
    configured,
  )
  expect(messages.map((message) => message.messageId)).toEqual([
    "cannotFit",
    "normalize",
  ])
  expect(messages[1].fix.text).toBe(
    "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよら`ab`。\n別の文。\n次の文。",
  )
  expect(
    linter
      .verify(messages[1].fix.text, configured)
      .map((message) => message.messageId),
  ).toEqual(["cannotFit"])
})

it("one fix reaches the normal form for a citation without a separator", () => {
  const configured = [{ ...config, rules: { "local/ja-line-breaks": "error" } }]
  const messages = linter.verify("説明です。[fixture: a]", configured)
  expect(messages).toHaveLength(1)
  expect(messages[0].fix.text).toBe("説明です。 [fixture: a]")
  expect(linter.verify(messages[0].fix.text, configured)).toEqual([])
})

for (const example of [
  ...invalid,
  ...boundaryCases.invalid,
  ...reviewCases.invalid,
  ...citationCases.invalid,
]) {
  if (example.output === null) continue
  it(`normal form is idempotent: ${example.name}`, () => {
    const messages = linter.verify(example.output, [
      { ...config, rules: { "local/ja-line-breaks": "error" } },
    ])
    expect(messages).toEqual([])
  })
}
