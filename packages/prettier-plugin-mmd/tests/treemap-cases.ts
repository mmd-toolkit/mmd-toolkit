/** Escaped inputs distinguish structural endings from authored value text. */
import type { Options } from "prettier"

interface TreemapCase {
  readonly name: string
  readonly input: string
  readonly output: string
  readonly options: Options
}

export const treemapCases: readonly TreemapCase[] = [
  {
    name: "treemap/line-terminators-and-unicode/cr-structure",
    input: 'treemap\r"CR root"\r "CR child":3\r',
    output: 'treemap\n  "CR root"\n    "CR child": 3\n',
    options: {},
  },
  {
    name: "treemap/line-terminators-and-unicode/crlf-values",
    input: 'treemap\r\n"CRLF\r\n name":3\r\naccDescr {one\r\ntwo}\r\n',
    output: 'treemap\n  "CRLF\n name": 3\n  accDescr {one\ntwo}\n',
    options: {},
  },
  {
    name: "treemap/line-terminators-and-unicode/unicode-values",
    input:
      'treemap\n"N\u2028S\u2029E\u00a0W\ufeff":3\naccTitle: A\u2028B\nclassDef zz x:1\u2028y:2\u2029;\n',
    output:
      'treemap\n  "N\u2028S\u2029E\u00a0W\ufeff": 3\n  accTitle: A\u2028B\n  classDef zz x:1\u2028y:2\u2029;\n',
    options: {},
  },
  {
    name: "treemap/comments/native-ls-ps",
    input:
      'treemap\n"CommentUnicode"%%!\u2028still\u2029comment\n "ChildUnicode":3',
    output:
      'treemap\n  "CommentUnicode"%%!\u2028still\u2029comment\n    "ChildUnicode": 3\n',
    options: {},
  },
  {
    name: "treemap/class-definitions/unicode-gap",
    input: "treemap\nclassDef\u00a0zz color:navy",
    output: "treemap\n  classDef zz color:navy\n",
    options: {},
  },
  {
    name: "treemap/accessibility-lines/unicode-edges",
    input:
      "treemap\ntitle \u00a0Topic\u3000\naccTitle: \u2028Access\u2029\naccDescr: \ufeffDetail\u00a0",
    output: "treemap\n  title Topic\n  accTitle: Access\n  accDescr: Detail\n",
    options: {},
  },
  {
    name: "treemap/description-blocks/unicode-empty",
    input: 'treemap\naccDescr{ \t\n\u2028\u00a0}\n"EmptyUnicode":3',
    output: 'treemap\n  accDescr{}\n  "EmptyUnicode": 3\n',
    options: {},
  },
  {
    name: "treemap/description-blocks/unicode-opener",
    input: "treemap\naccDescr\u2028{Unicode detail}",
    output: "treemap\n  accDescr {Unicode detail}\n",
    options: {},
  },
  {
    name: "treemap/line-terminators-and-unicode/frontmatter-cr",
    input: '---\rtitle: Treemap CR\r---\rtreemap\r"YamlCR":3',
    output: '---\ntitle: Treemap CR\n---\ntreemap\n  "YamlCR": 3\n',
    options: {},
  },
  {
    name: "treemap/line-terminators-and-unicode/leading-bom",
    input: '\ufefftreemap\n"BOM leaf":3',
    output: '\ufefftreemap\n  "BOM leaf": 3\n',
    options: {},
  },
  {
    name: "treemap/line-terminators-and-unicode/output-crlf",
    input: 'treemap\n"Output CRLF":3',
    output: 'treemap\r\n  "Output CRLF": 3\r\n',
    options: { endOfLine: "crlf" },
  },
  {
    name: "treemap/line-terminators-and-unicode/output-cr",
    input: 'treemap\n"Output CR":3',
    output: 'treemap\r  "Output CR": 3\r',
    options: { endOfLine: "cr" },
  },
  {
    name: "treemap/specified-readings/bare-unicode",
    input: '%%\n\u2028treemap\n"BareUnicode":3',
    output: '%%\ntreemap\n  "BareUnicode": 3\n',
    options: {},
  },
  {
    name: "treemap/semicolons/protected-later-atom",
    input: 'treemap\n"Protected"\n:3\n:::zz\nclassDef zz color:#red;',
    output: 'treemap\n  "Protected": 3:::zz\n  classDef zz color:#red;\n',
    options: {},
  },
  {
    name: "treemap/comments/comment-ls-semicolon-before",
    input: 'treemap\n"Root"\n "A":1%% c;\u2028 "B":2\n',
    output: 'treemap\n  "Root"\n    "A":1%% c;\u2028 "B":2\n',
    options: {},
  },
  {
    name: "treemap/comments/comment-ps-semicolon-after",
    input: 'treemap\n"Root"\n "A":1%% c\u2029 "B;y":2\n',
    output: 'treemap\n  "Root"\n    "A":1%% c\u2029 "B;y":2\n',
    options: {},
  },
  {
    name: "treemap/comments/comment-ls-semicolon-both",
    input: 'treemap\n"Root"\n "A":1%% c;\u2028 "B;y":2\n',
    output: 'treemap\n  "Root"\n    "A":1%% c;\u2028 "B;y":2\n',
    options: {},
  },
]
