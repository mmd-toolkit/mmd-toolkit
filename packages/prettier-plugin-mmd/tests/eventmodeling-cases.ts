/** Fixed escaped cases cover Unicode whitespace and host line conversion. */
import type { Options } from "prettier"

interface EventmodelingCase {
  readonly name: string
  readonly input: string
  readonly output: string
  readonly options: Options
}

export const eventmodelingCases: readonly EventmodelingCase[] = [
  {
    name: "eventmodeling/qualified-names/qualified-padded",
    input: "eventmodeling tf 01 evt Shop \t. \ufeffBought",
    options: {},
    output: "eventmodeling\n  tf 01 evt Shop.Bought\n",
  },
  {
    name: "eventmodeling/gwt-clauses-and-items/gwt-blanks-and-separators",
    input:
      "eventmodeling gwt 01 given evt Alpha\n\n\ncmd Beta\u2028then\u2029ui Screen",
    options: {},
    output:
      "eventmodeling\n  gwt 01\n    given\n      evt Alpha\n\n      cmd Beta\n    then\n      ui Screen\n",
  },
  {
    name: "eventmodeling/accessibility-lines/line-value-ls-ps-preserved",
    input: "eventmodeling accTitle: a\u2028b\u2029c",
    options: {},
    output: "eventmodeling accTitle: a\u2028b\u2029c\n",
  },
  {
    name: "eventmodeling/comments/native-line-comment-ls-stays-content",
    input:
      "eventmodeling tf 01 evt Alpha // x\u2028tf 02 evt Hidden\nrf 03 cmd Beta",
    options: {},
    output:
      "eventmodeling\n  tf 01 evt Alpha // x\u2028tf 02 evt Hidden\n  rf 03 cmd Beta\n",
  },
  {
    name: "eventmodeling/line-terminators-and-unicode/cr-block-and-description-to-lf",
    input:
      "eventmodeling accDescr {a\rb}\rtf 01 evt Alpha [[D]]\rdata D {\rx\r}\r",
    options: {},
    output:
      "eventmodeling accDescr {a\nb}\n  tf 01 evt Alpha [[D]]\n  data D {\nx\n}\n",
  },
  {
    name: "eventmodeling/line-terminators-and-unicode/crlf-block-and-common-to-lf",
    input:
      "eventmodeling accTitle: A\r\ntf 01 evt Alpha [[D]]\r\ndata D {\r\nx\r\n}\r\n",
    options: {},
    output:
      "eventmodeling accTitle: A\n  tf 01 evt Alpha [[D]]\n  data D {\nx\n}\n",
  },
  {
    name: "eventmodeling/line-terminators-and-unicode/configured-crlf-output",
    input: "eventmodeling\ntf 01 evt Alpha {x}\n",
    options: {
      endOfLine: "crlf",
    },
    output: "eventmodeling\r\n  tf 01 evt Alpha {x}\r\n",
  },
  {
    name: "eventmodeling/line-terminators-and-unicode/configured-cr-output-hidden",
    input: "eventmodeling\n%%{{x}}%%\ntf 01 evt Alpha",
    options: {
      endOfLine: "cr",
    },
    output: "eventmodeling\r  %%{{x}}%%\r  tf 01 evt Alpha\r",
  },
  {
    name: "eventmodeling/line-terminators-and-unicode/ls-ps-native-whitespace-safe-ordinary-components",
    input: "eventmodeling\u2028tf\u202901\u00a0evt\ufeffAlpha",
    options: {},
    output: "eventmodeling\n  tf 01 evt Alpha\n",
  },
  {
    name: "eventmodeling/line-terminators-and-unicode/ls-ps-description-value-kept",
    input: "eventmodeling accDescr {a\u2028b\u2029c}",
    options: {},
    output: "eventmodeling accDescr {a\u2028b\u2029c}\n",
  },
  {
    name: "eventmodeling/line-terminators-and-unicode/block-ls-boundary-stays-outside-value",
    input:
      "eventmodeling tf 01 evt Alpha [[D]] data D {\nx\n}\u2028tf 02 evt Beta",
    options: {},
    output:
      "eventmodeling\n  tf 01 evt Alpha [[D]]\n  data D {\nx\n}\u2028  tf 02 evt Beta\n",
  },
  {
    name: "eventmodeling/line-terminators-and-unicode/common-unicode-edges-kept",
    input: "eventmodeling accTitle: A\u00a0\ufeff\u3000",
    options: {},
    output: "eventmodeling accTitle: A\u00a0\ufeff\u3000\n",
  },
  {
    name: "eventmodeling/comments/comment-region-ls-join-unchanged",
    input:
      "eventmodeling tf 01 evt Alpha\u2028%% common region\n rf 02 cmd Beta",
    options: {},
    output:
      "eventmodeling\n  tf 01 evt Alpha\u2028%% common region\n rf 02 cmd Beta\n",
  },
  {
    name: "eventmodeling/comments/ps-native-line-comment-remains-owned",
    input:
      "eventmodeling tf 01 evt Alpha // x\u2029rf 02 cmd Hidden\ntf 03 evt End",
    options: {},
    output:
      "eventmodeling\n  tf 01 evt Alpha // x\u2029rf 02 cmd Hidden\n  tf 03 evt End\n",
  },
  {
    name: "eventmodeling/frame-components/required-title-unicode-gap",
    input: "eventmodeling tf 061evt\u00a0title",
    options: {},
    output: "eventmodeling\n  tf 061 evt\u00a0title\n",
  },
  {
    name: "eventmodeling/line-terminators-and-unicode/leading-bom-host",
    input: "\ufeffeventmodeling tf 091evt Bom",
    options: {},
    output: "\ufeffeventmodeling\n  tf 091 evt Bom\n",
  },
]
