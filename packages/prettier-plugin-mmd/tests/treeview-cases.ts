/** Escaped cases retain authored Unicode, control characters and endings. */
import type { Options } from "prettier"

interface TreeviewCase {
  readonly name: string
  readonly input: string
  readonly output: string
  readonly options: Options
}

export const treeviewCases: readonly TreeviewCase[] = [
  {
    name: "treeview/multiline-values/ls-value",
    input: 'treeView-beta\n"first\u2028last"\n',
    output: 'treeView-beta\n  "first\u2028last"\n',
    options: {},
  },
  {
    name: "treeview/multiline-values/ps-value",
    input: "treeView-beta\n'first\u2029last'\n",
    output: "treeView-beta\n  'first\u2029last'\n",
    options: {},
  },
  {
    name: "treeview/accessibility-lines/acc-unicode-edge",
    input:
      "treeView-beta\naccTitle:\u00a0Access\u3000\naccDescr:\u2028Detail\u2029\nR\n",
    output: "treeView-beta\n  accTitle: Access\n  accDescr: Detail\n  R\n",
    options: {},
  },
  {
    name: "treeview/description-blocks/block-unicode-empty",
    input: "treeView-beta\naccDescr{\u00a0\u2028\u2029}\nR\n",
    output: "treeView-beta\n  accDescr{}\n  R\n",
    options: {},
  },
  {
    name: "treeview/line-terminators-and-unicode/eol-cr-structure",
    input: "treeView-beta\rR\r C\r",
    output: "treeView-beta\n  R\n    C\n",
    options: {},
  },
  {
    name: "treeview/line-terminators-and-unicode/eol-crlf-quote",
    input: 'treeView-beta\r\n"A\r\n B"\r\n',
    output: 'treeView-beta\n  "A\n B"\n',
    options: {},
  },
  {
    name: "treeview/line-terminators-and-unicode/eol-output-crlf",
    input: "treeView-beta\nR\n C\n",
    output: "treeView-beta\r\n  R\r\n    C\r\n",
    options: { endOfLine: "crlf" },
  },
  {
    name: "treeview/line-terminators-and-unicode/unicode-not-indent",
    input: "treeView-beta\nR\n\u00a0C\n",
    output: "treeView-beta\n  R\n  \u00a0C\n",
    options: {},
  },
  {
    name: "treeview/line-terminators-and-unicode/eol-block-and-directive",
    input: "treeView-beta\r\naccDescr{A\r\n B}\r\nR%%{init: {\r\n}}%%\r\n",
    output: "treeView-beta\n  accDescr{A\n B}\n  R%%{init: {\n}}%%\n",
    options: {},
  },
  {
    name: "treeview/line-terminators-and-unicode/eol-output-cr",
    input: "treeView-beta\nR\n C\n",
    output: "treeView-beta\r  R\r    C\r",
    options: { endOfLine: "cr" },
  },
]
