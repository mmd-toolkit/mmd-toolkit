/** Fixed escaped pie cases; physical and Unicode whitespace have distinct roles. */
import type { Options } from "prettier"

interface PieCase {
  readonly name: string
  readonly input: string
  readonly output: string
  readonly options: Options
}

export const pieCases: readonly PieCase[] = [
  {
    name: "pie/comments/comment-region-join",
    input: 'pie\n"a\u2028%% removed\n b":3',
    output: 'pie\n  "a\u2028%% removed\n b" : 3\n',
    options: {},
  },
  {
    name: "pie/line-terminators-and-unicode/eol-cr",
    input: 'pie\r"A\r B":2\raccDescr {\rfirst\r second\r}\r',
    output: 'pie\n  "A\n B" : 2\n  accDescr {\nfirst\n second\n  }\n',
    options: {},
  },
  {
    name: "pie/line-terminators-and-unicode/eol-crlf-hidden",
    input: 'pie\r\n"CRLF":%%{}%%\r\n2',
    output: 'pie\n  "CRLF" :%%{}%%\n2\n',
    options: {},
  },
  {
    name: "pie/line-terminators-and-unicode/eol-output-cr",
    input: 'pie\n"CR":2',
    output: 'pie\r  "CR" : 2\r',
    options: {
      endOfLine: "cr",
    },
  },
  {
    name: "pie/line-terminators-and-unicode/eol-output-crlf",
    input: 'pie\n"CRLF":2',
    output: 'pie\r\n  "CRLF" : 2\r\n',
    options: {
      endOfLine: "crlf",
    },
  },
  {
    name: "pie/line-terminators-and-unicode/unicode-values",
    input:
      'pie\n"x\u2028y\u2029z":2\ntitle x\u2028y\naccTitle: x\u2029y\naccDescr {x\u2028y}',
    output:
      'pie\n  "x\u2028y\u2029z" : 2\n  title x\u2028y\n  accTitle: x\u2029y\n  accDescr {x\u2028y}\n',
    options: {},
  },
  {
    name: "pie/line-terminators-and-unicode/unicode-comments",
    input: 'pie\n"Before":1%% c\u2028hidden\u2029tail\n"After":2',
    output: 'pie\n  "Before" : 1%% c\u2028hidden\u2029tail\n  "After" : 2\n',
    options: {},
  },
  {
    name: "pie/line-terminators-and-unicode/unicode-comment-split-kept",
    input: 'pie\n"Before":1%% c\u2028"Hidden":3\n"After":2',
    output: 'pie\n  "Before" : 1%% c\u2028"Hidden":3\n  "After" : 2\n',
    options: {},
  },
  {
    name: "pie/line-terminators-and-unicode/unicode-opener",
    input: 'pie\naccDescr\u2028\u2029{a}\n"Data":2',
    output: 'pie\n  accDescr {a}\n  "Data" : 2\n',
    options: {},
  },
  {
    name: "pie/line-terminators-and-unicode/unicode-block-empty",
    input: 'pie\naccDescr{\u00a0\u2028\u2029}\n"Data":2',
    output: 'pie\n  accDescr{}\n  "Data" : 2\n',
    options: {},
  },
  {
    name: "pie/line-terminators-and-unicode/unicode-line-trim",
    input: "pie\naccTitle: \u00a0Title\u2028\naccDescr:\ufeffDescription\u2029",
    output: "pie\n  accTitle: Title\n  accDescr: Description\n",
    options: {},
  },
  {
    name: "pie/line-terminators-and-unicode/bom-header",
    input: '\ufeffpie\n"BOM":2',
    output: '\ufeffpie\n  "BOM" : 2\n',
    options: {},
  },
  {
    name: "pie/labels/div-bare-unicode",
    input: '%%\n\u2028\npie\n"Leading":2',
    output: '%%\n\npie\n  "Leading" : 2\n',
    options: {},
  },
  {
    name: "pie/labels/div-retained-bare-unicode",
    input: '%% before\n---\nignored: x\n---\n%%\n\u2028pie\n"Leading":2',
    output: '%% before\n---\nignored: x\n---\n%%\n\u2028pie\n  "Leading" : 2\n',
    options: {},
  },
  {
    name: "pie/directives-and-semicolons/selected-ls-segments",
    input: 'pie\n"style:#a;b\u2028c;d":2\naccDescr {classDef:#e;f\u2029g;h}',
    output:
      'pie\n  "style:#a;b\u2028c;d":2\n  accDescr {classDef:#e;f\u2029g;h}\n',
    options: {},
  },
  {
    name: "pie/line-terminators-and-unicode/unicode-label-boundaries",
    input: 'pie\n"\u00a0\ufeff\u2028\u2029 label \u00a0":4',
    output: 'pie\n  "\u00a0\ufeff\u2028\u2029 label \u00a0" : 4\n',
    options: {},
  },
  {
    name: "pie/line-terminators-and-unicode/unicode-ignored-bodies",
    input:
      'pie\n---\nfirst\u2028second\u2029third\n---\n"Ignored unicode":%%{!x\u2028y\u2029z}%%\n5',
    output:
      'pie\n  ---\nfirst\u2028second\u2029third\n---\n  "Ignored unicode" :%%{!x\u2028y\u2029z}%%\n5\n',
    options: {},
  },
  {
    name: "pie/line-terminators-and-unicode/unicode-block-value-edges",
    input:
      'pie\naccDescr{\u00a0  first\u2028middle\u2029last  \ufeff}\n"Block edges":4',
    output:
      'pie\n  accDescr{ first\u2028middle\u2029last }\n  "Block edges" : 4\n',
    options: {},
  },
  {
    name: "pie/line-terminators-and-unicode/unicode-line-edges-and-internal",
    input:
      "pie\ntitle \u00a0A\tB\u2028\naccTitle:\ufeffC\tD\u2029\naccDescr: \u00a0E\tF\ufeff",
    output: "pie\n  title A\tB\n  accTitle: C\tD\n  accDescr: E\tF\n",
    options: {},
  },
  {
    name: "pie/line-terminators-and-unicode/eol-yaml-cr",
    input: 'pie\r"Yaml CR"---\rhidden: x\r---\r:4',
    output: 'pie\n  "Yaml CR"---\nhidden: x\n---\n: 4\n',
    options: {},
  },
  {
    name: "pie/line-terminators-and-unicode/eol-block-crlf",
    input: 'pie\r\naccDescr {\r\nfirst\r\n  second\r\n}\r\n"Block CRLF":8',
    output: 'pie\n  accDescr {\nfirst\n  second\n  }\n  "Block CRLF" : 8\n',
    options: {},
  },
  {
    name: "pie/line-terminators-and-unicode/unicode-preheader-comment",
    input: '%% unicode before\n\u2028pie\n"Leading unicode":3',
    output: '%% unicode before\npie\n  "Leading unicode" : 3\n',
    options: {},
  },
  {
    name: "pie/line-terminators-and-unicode/unicode-comment-region-common",
    input:
      "pie\naccTitle: a\u2028%% removed\n b\naccDescr {c\u2029%% removed\n d}",
    output:
      "pie\n  accTitle: a\u2028%% removed\n b\n  accDescr {c\u2029%% removed\n d}\n",
    options: {},
  },
  {
    name: "pie/line-terminators-and-unicode/div-unicode-preheader-nbsp-hidden",
    input:
      '%% skipped prefix\n---\nignored: x\n---\n%%\n\u00a0pie\n"Kept nbsp":3',
    output:
      '%% skipped prefix\n---\nignored: x\n---\n%%\n\u00a0pie\n  "Kept nbsp" : 3\n',
    options: {},
  },
  {
    name: "pie/line-terminators-and-unicode/title-leading-ls",
    input: "pie\ntitle \u2028x",
    output: "pie\n  title x\n",
    options: {},
  },
  {
    name: "pie/line-terminators-and-unicode/title-leading-ps",
    input: "pie\ntitle  \u2029x",
    output: "pie\n  title x\n",
    options: {},
  },
  {
    name: "pie/line-terminators-and-unicode/acctitle-leading-ls",
    input: "pie\naccTitle:\u2028x",
    output: "pie\n  accTitle: x\n",
    options: {},
  },
  {
    name: "pie/line-terminators-and-unicode/acctitle-leading-ps",
    input: "pie\naccTitle:  \u2029x",
    output: "pie\n  accTitle: x\n",
    options: {},
  },
  {
    name: "pie/line-terminators-and-unicode/accdescr-leading-ls",
    input: "pie\naccDescr:  \u2028x",
    output: "pie\n  accDescr: x\n",
    options: {},
  },
  {
    name: "pie/line-terminators-and-unicode/accdescr-leading-ps",
    input: "pie\naccDescr:\u2029x",
    output: "pie\n  accDescr: x\n",
    options: {},
  },
  {
    name: "pie/line-terminators-and-unicode/line-values-only-unicode",
    input:
      "pie\ntitle \u2028\u2029\naccTitle: \u2029\u2028\naccDescr:\u2028\u2029",
    output: "pie\n  title\n  accTitle:\n  accDescr:\n",
    options: {},
  },
]
