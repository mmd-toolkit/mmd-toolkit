/** Fixed escaped source cases; each answers a usecase rule sentence. */
import type { Options } from "prettier"

interface UsecaseCase {
  readonly name: string
  readonly id: string
  readonly input: string
  readonly output: string
  readonly options: Options
}

export const usecaseCases: readonly UsecaseCase[] = [
  {
    name: "usecase: terminal-comment-tab",
    id: "usecase/comments/terminal-comment-tab",
    input: "usecase-beta\nTask\n%% tail\t",
    output: "usecase-beta\n  Task\n  %% tail\t\n",
    options: {},
  },
  {
    name: "usecase: terminal-a11y-tab",
    id: "usecase/trailing-whitespace/terminal-a11y-tab",
    input: "usecase-beta\naccTitle:\t",
    output: "usecase-beta\n  accTitle:\n",
    options: {},
  },
  {
    name: "usecase: comment-region-join",
    id: "usecase/comments/comment-region-join",
    input: 'usecase-beta\nA("`first\u2028%% c\n last`")',
    output: 'usecase-beta\n  A("`first\u2028%% c\n last`")\n',
    options: {},
  },
  {
    name: "usecase: eol-cr",
    id: "usecase/line-terminators/eol-cr",
    input: "usecase-beta\rA\rA-->B\r",
    output: "usecase-beta\n  A\n  A --> B\n",
    options: {},
  },
  {
    name: "usecase: eol-crlf",
    id: "usecase/line-terminators/eol-crlf",
    input: 'usecase-beta\r\nA("`first\r\n second`")\r\n',
    output: 'usecase-beta\n  A("`first\n second`")\n',
    options: {},
  },
  {
    name: "usecase: eol-output-cr",
    id: "usecase/line-terminators/eol-output-cr",
    input: "usecase-beta\nA",
    output: "usecase-beta\r  A\r",
    options: { endOfLine: "cr" },
  },
  {
    name: "usecase: eol-output-crlf",
    id: "usecase/line-terminators/eol-output-crlf",
    input: "usecase-beta\nA",
    output: "usecase-beta\r\n  A\r\n",
    options: { endOfLine: "crlf" },
  },
  {
    name: "usecase: unicode-labels",
    id: "usecase/line-terminators/unicode-labels",
    input:
      "usecase-beta\nA('x\u2028y')\nB(\"`x\u2029y`\")\nC(bare\u2028text)\nC -- edge\u2029label --> D",
    output:
      "usecase-beta\n  A('x\u2028y')\n  B(\"`x\u2029y`\")\n  C(bare\u2028text)\n  C -- edge\u2029label --> D\n",
    options: {},
  },
  {
    name: "usecase: unicode-stereotype",
    id: "usecase/line-terminators/unicode-stereotype",
    input: "usecase-beta\nA <<x\u2028y\u2029z>>",
    output: "usecase-beta\n  A <<x\u2028y\u2029z>>\n",
    options: {},
  },
  {
    name: "usecase: unicode-native-metadata",
    id: "usecase/line-terminators/unicode-native-metadata",
    input: "usecase-beta\nactor A@{icon:'x\u2028y\u2029z'}",
    output: "usecase-beta\n  actor A@{ icon: 'x\u2028y\u2029z' }\n",
    options: {},
  },
  {
    name: "usecase: unicode-json-string",
    id: "usecase/line-terminators/unicode-json-string",
    input: 'usecase-beta\njson T@{"a":"x\u2028y\u2029z"}',
    output: 'usecase-beta\n  json T @{"a":"x\u2028y\u2029z"}\n',
    options: {},
  },
  {
    name: "usecase: unicode-a11y",
    id: "usecase/line-terminators/unicode-a11y",
    input: "usecase-beta\naccTitle: x\u2028y\naccDescr {x\u2029y}",
    output: "usecase-beta\n  accTitle: x\u2028y\n  accDescr {x\u2029y}\n",
    options: {},
  },
  {
    name: "usecase: unicode-comment",
    id: "usecase/line-terminators/unicode-comment",
    input: "usecase-beta\n%%{}%%\u2028hidden\u2029tail\nA",
    output: "usecase-beta\n  %%{}%%\u2028hidden\u2029tail\n  A\n",
    options: {},
  },
  {
    name: "usecase: unicode-comment-to-lf-kept",
    id: "usecase/line-terminators/unicode-comment-to-lf-kept",
    input: "usecase-beta\n%%{}%%\u2028B\nA",
    output: "usecase-beta\n  %%{}%%\u2028B\n  A\n",
    options: {},
  },
  {
    name: "usecase: unicode-metadata-separator-opaque",
    id: "usecase/line-terminators/unicode-metadata-separator-opaque",
    input: 'usecase-beta\njson T@{\u2029"a":1}',
    output: 'usecase-beta\n  json T @{\u2029"a":1}\n',
    options: {},
  },
  {
    name: "usecase: bom-leading",
    id: "usecase/line-terminators/bom-leading",
    input: "\ufeffusecase-beta\nA",
    output: "\ufeffusecase-beta\n  A\n",
    options: {},
  },
  {
    name: "usecase: label-unicode-padding",
    id: "usecase/labels/label-unicode-padding",
    input: "usecase-beta\nA(\u00a0Work\u00a0)\nB[\ufeffPanel\ufeff]",
    output: "usecase-beta\n  A(\u00a0Work\u00a0)\n  B[\ufeffPanel\ufeff]\n",
    options: {},
  },
  {
    name: "usecase: css-other-case-segment",
    id: "usecase/classes-and-styles/css-other-case-segment",
    input: "usecase-beta\nA(Style:#abc;x\u2028classDef: #def;y)",
    output: "usecase-beta\n  A(Style:#abc;x\u2028classDef: #def;y)\n",
    options: {},
  },
  {
    name: "usecase: unicode-note",
    id: "usecase/line-terminators/unicode-note",
    input: "usecase-beta\nA\nnote for A 'x\u2028y\u2029z'",
    output: "usecase-beta\n  A\n  note for A 'x\u2028y\u2029z'\n",
    options: {},
  },
  {
    name: "usecase: eol-cr-all-modes",
    id: "usecase/line-terminators/eol-cr-all-modes",
    input:
      "usecase-beta\ractor U@{\rtype:normal\rbusiness:false\r}\rsystemBoundary Box\rA(Work)\rend\rU-->A\rnote for A 'text'\rjson T@{\r \"a\": 1\r}\rclassDef hot fill: red\rclass A hot\rstyle A -- color : blue\raccTitle: title\raccDescr {\rfirst\r second\r}\rdirection TD\r",
    output:
      "usecase-beta\n  actor U@{\n    type: normal\n    business: false\n  }\n  systemBoundary Box\n    A(Work)\n  end\n  U --> A\n  note for A 'text'\n  json T @{\n \"a\": 1\n}\n  classDef hot fill: red\n  class A hot\n  style A -- color : blue\n  accTitle: title\n  accDescr {\nfirst\n second\n  }\n  direction TD\n",
    options: {},
  },
  {
    name: "usecase: unicode-css-string",
    id: "usecase/line-terminators/unicode-css-string",
    input: "usecase-beta\nA\nstyle A content:'x\u2028y\u2029z'",
    output: "usecase-beta\n  A\n  style A content:'x\u2028y\u2029z'\n",
    options: {},
  },
  {
    name: "usecase: unicode-joined-native-metadata",
    id: "usecase/line-terminators/unicode-joined-native-metadata",
    input: "usecase-beta\nactor Reader@{icon:'first\u2028%% removed\n last'}",
    output:
      "usecase-beta\n  actor Reader@{icon:'first\u2028%% removed\n last'}\n",
    options: {},
  },
  {
    name: "usecase: unicode-semicolon-segments",
    id: "usecase/line-terminators/unicode-semicolon-segments",
    input:
      "usecase-beta\nTask(Style:#abc;x\u2028classDef: #def;y)\nOther(one\u2029two)",
    output:
      "usecase-beta\n  Task(Style:#abc;x\u2028classDef: #def;y)\n  Other(one\u2029two)\n",
    options: {},
  },
  {
    name: "usecase: crlf-metadata-blank-lines",
    id: "usecase/line-terminators/crlf-metadata-blank-lines",
    input: "usecase-beta\r\nactor Reader@{\r\n\r\n\r\ntype:normal\r\n\r\n}\r\n",
    output: "usecase-beta\n  actor Reader@{\n\n\n    type: normal\n\n  }\n",
    options: {},
  },
  {
    name: "usecase: nbsp-css-string",
    id: "usecase/line-terminators/nbsp-css-string",
    input: "usecase-beta\nTask\nstyle Task content:'one\u00a0two'",
    output: "usecase-beta\n  Task\n  style Task content:'one\u00a0two'\n",
    options: {},
  },
  {
    name: "usecase: unicode-boundary-title",
    id: "usecase/line-terminators/unicode-boundary-title",
    input:
      "usecase-beta\nsystemBoundary Scope [\u00a0 Display\ufeff ]\nTask\nend",
    output:
      "usecase-beta\n  systemBoundary Scope [\u00a0 Display\ufeff ]\n    Task\n  end\n",
    options: {},
  },
  {
    name: "usecase: crlf-output-values",
    id: "usecase/line-terminators/crlf-output-values",
    input: 'usecase-beta\naccTitle: title  \nTask("`first\n line`")',
    output:
      'usecase-beta\r\n  accTitle: title\r\n  Task("`first\r\n line`")\r\n',
    options: { endOfLine: "crlf" },
  },
  {
    name: "usecase: a11y-unicode-exterior",
    id: "usecase/direction-and-accessibility/a11y-unicode-exterior",
    input:
      "usecase-beta\naccTitle:\u00a0 Readable\u00a0\naccDescr:\u2028 Details\u2029\nAfter",
    output:
      "usecase-beta\n  accTitle: Readable\n  accDescr: Details\n  After\n",
    options: {},
  },
  {
    name: "usecase: stereotype-unicode-exterior-padding",
    id: "usecase/stereotypes/unicode-exterior-padding",
    input:
      "usecase-beta\nactor User <<\u00a0\u2028  service\u00a0\u2028inside\u2029  text  \u2029\u00a0>>",
    output:
      "usecase-beta\n  actor User << service\u00a0\u2028inside\u2029  text >>\n",
    options: {},
  },
  {
    name: "usecase: stereotype-comment-region-padding-kept",
    id: "usecase/stereotypes/comment-region-padding-kept",
    input: "usecase-beta\nactor Joined <<  before\u2028%% c\n after  >>",
    output: "usecase-beta\n  actor Joined <<  before\u2028%% c\n after  >>\n",
    options: {},
  },
  {
    name: "usecase: stereotype-unicode-gap-sides",
    id: "usecase/stereotypes/unicode-gap-sides",
    input: "usecase-beta\nA <<\u2028\u00a0left>>\nB <<right\u2029\u00a0>>",
    output: "usecase-beta\n  A << left>>\n  B <<right >>\n",
    options: {},
  },
  {
    name: "usecase: stereotype-opener-tab",
    id: "usecase/stereotypes/opener-tab",
    input: "usecase-beta\nactor Tab\t\t<<kind>>",
    output: "usecase-beta\n  actor Tab <<kind>>\n",
    options: {},
  },
]
