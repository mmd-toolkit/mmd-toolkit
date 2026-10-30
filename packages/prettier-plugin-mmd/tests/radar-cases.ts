/** Fixed escaped cases distinguish physical endings from value characters. */
import type { Options } from "prettier"

interface RadarCase {
  readonly name: string
  readonly input: string
  readonly output: string
  readonly options: Options
}

export const radarCases: readonly RadarCase[] = [
  {
    name: "radar/comments/native-comment-ls-ps",
    input: "radar-beta\n%% one\u2028axis Hidden\u2029end\naxis North\n",
    output: "radar-beta\n  %% one\u2028axis Hidden\u2029end\n  axis North\n",
    options: {},
  },
  {
    name: "radar/semicolons/semicolon-ls-segment",
    input: "radar-beta\ntitle style:#red;\u2028plain;\n",
    output: "radar-beta\n  title style:#red;\u2028plain;\n",
    options: {},
  },
  {
    name: "radar/line-terminators-and-unicode/cr-structural",
    input: "radar-beta\raxis North\rcurve trial{4}\r",
    output: "radar-beta\n  axis North\n  curve trial{4}\n",
    options: {},
  },
  {
    name: "radar/line-terminators-and-unicode/crlf-values",
    input:
      'radar-beta\r\naxis North["one\r\ntwo"]\r\naccDescr {one\r\ntwo}\r\n',
    output: 'radar-beta\n  axis North["one\ntwo"]\n  accDescr {one\ntwo}\n',
    options: {},
  },
  {
    name: "radar/line-terminators-and-unicode/crlf-hidden",
    input: "radar-beta\r\naxis %%{!gap}%%\r\nNorth\r\n",
    output: "radar-beta\n  axis %%{!gap}%%\nNorth\n",
    options: {},
  },
  {
    name: "radar/line-terminators-and-unicode/unicode-values",
    input:
      'radar-beta\naxis North["N\u2028S\u2029E\u00a0W\ufeff"]\naccTitle: A\u2028B\n',
    output:
      'radar-beta\n  axis North["N\u2028S\u2029E\u00a0W\ufeff"]\n  accTitle: A\u2028B\n',
    options: {},
  },
  {
    name: "radar/line-terminators-and-unicode/unicode-line-edges",
    input:
      "radar-beta\ntitle \u00a0Topic\u3000\naccTitle: \u2028Access\u2029\n",
    output: "radar-beta\n  title Topic\n  accTitle: Access\n",
    options: {},
  },
  {
    name: "radar/line-terminators-and-unicode/unicode-block-opener",
    input: "radar-beta\naccDescr\u2028{Detail}\n",
    output: "radar-beta\n  accDescr {Detail}\n",
    options: {},
  },
  {
    name: "radar/specified-readings/specified-bare-unicode",
    input: "%%\n\u2028radar-beta\naxis North\n",
    output: "%%\nradar-beta\n  axis North\n",
    options: {},
  },
  {
    name: "radar/line-terminators-and-unicode/frontmatter-cr",
    input: "---\rtitle: Radar topic\r---\rradar-beta\raxis North\r",
    output: "---\ntitle: Radar topic\n---\nradar-beta\n  axis North\n",
    options: {},
  },
  {
    name: "radar/line-terminators-and-unicode/leading-bom-header",
    input: "\ufeffradar-beta\naxis North\n",
    output: "\ufeffradar-beta\n  axis North\n",
    options: {},
  },
  {
    name: "radar/line-terminators-and-unicode/output-crlf",
    input: "radar-beta\naxis OutputCRLF\n",
    output: "radar-beta\r\n  axis OutputCRLF\r\n",
    options: {
      endOfLine: "crlf",
    },
  },
  {
    name: "radar/line-terminators-and-unicode/output-cr",
    input: "radar-beta\ncurve OutputCR{1}\n",
    output: "radar-beta\r  curve OutputCR{1}\r",
    options: {
      endOfLine: "cr",
    },
  },
  {
    name: "radar/description-blocks/unicode-empty",
    input: "radar-beta\naccDescr{ \t\n\u2028\u00a0}\n",
    output: "radar-beta\n  accDescr{}\n",
    options: {},
  },
  {
    name: "radar/line-terminators-and-unicode/hidden-content",
    input:
      "radar-beta\n---\nA\u2028B\u2029C\n---\naxis UnicodeHidden%%{!A\u2028B\u2029C}%% \n",
    output:
      "radar-beta\n  ---\nA\u2028B\u2029C\n---\n  axis UnicodeHidden%%{!A\u2028B\u2029C}%% \n",
    options: {},
  },
  {
    name: "radar/line-terminators-and-unicode/description-content",
    input: "radar-beta\naccDescr{\u00a0A\u2028B\u2029C\ufeff}\n",
    output: "radar-beta\n  accDescr{ A\u2028B\u2029C }\n",
    options: {},
  },
]
