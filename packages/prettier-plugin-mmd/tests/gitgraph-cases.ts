/** Fixed escaped gitgraph cases keep Unicode and physical line endings distinct. */
import type { Options } from "prettier"

interface GitgraphCase {
  readonly name: string
  readonly input: string
  readonly output: string
  readonly options: Options
}

export const gitgraphCases: readonly GitgraphCase[] = [
  {
    name: "gitgraph/title-and-common-values/block-opener-join-fixed",
    input: "gitGraph\naccDescr\n\u00a0{ A }\n",
    output: "gitGraph\n  accDescr { A }\n",
    options: {},
  },
  {
    name: "gitgraph/hidden-directives/hidden-physical-multiline",
    input: "gitGraph\n%%{!\nA\u2028B\u2029C\n}%% \ncommit\n",
    output: "gitGraph\n  %%{!\nA\u2028B\u2029C\n}%% \n  commit\n",
    options: {},
  },
  {
    name: "gitgraph/line-terminators-and-unicode/eol-cr",
    input: 'gitGraph\rcommit id:"A"\r',
    output: 'gitGraph\n  commit id: "A"\n',
    options: {},
  },
  {
    name: "gitgraph/line-terminators-and-unicode/eol-crlf",
    input: 'gitGraph\r\ncommit id:"A"\r\n',
    output: 'gitGraph\n  commit id: "A"\n',
    options: {},
  },
  {
    name: "gitgraph/line-terminators-and-unicode/eol-string-crlf",
    input: 'gitGraph\r\ncommit id:"A\r\nB"\r\n',
    output: 'gitGraph\n  commit id: "A\nB"\n',
    options: {},
  },
  {
    name: "gitgraph/line-terminators-and-unicode/eol-block-cr",
    input: "gitGraph\raccDescr {A\r B}\r",
    output: "gitGraph\n  accDescr {A\n B}\n",
    options: {},
  },
  {
    name: "gitgraph/line-terminators-and-unicode/eol-hidden-crlf",
    input: 'gitGraph\r\ncommit id:---\r\nx: y\r\n---\r\n"A"\r\n',
    output: 'gitGraph\n  commit id:---\nx: y\n---\n"A"\n',
    options: {},
  },
  {
    name: "gitgraph/line-terminators-and-unicode/eol-output-crlf",
    input: 'gitGraph\ncommit id:"A\nB"\n',
    output: 'gitGraph\r\n  commit id: "A\r\nB"\r\n',
    options: {
      endOfLine: "crlf",
    },
  },
  {
    name: "gitgraph/line-terminators-and-unicode/eol-output-cr",
    input: 'gitGraph\ncommit id:"A"\n',
    output: 'gitGraph\r  commit id: "A"\r',
    options: {
      endOfLine: "cr",
    },
  },
  {
    name: "gitgraph/line-terminators-and-unicode/unicode-values",
    input:
      'gitGraph\ncommit id:"A\u2028B\u2029C\u00a0\ufeff"\naccTitle: A\u2028B\n',
    output:
      'gitGraph\n  commit id: "A\u2028B\u2029C\u00a0\ufeff"\n  accTitle: A\u2028B\n',
    options: {},
  },
  {
    name: "gitgraph/line-terminators-and-unicode/unicode-line-trim",
    input:
      "gitGraph\ntitle \ufeffA\u00a0\naccTitle:\u3000A\u2028\naccDescr:\u2029D\ufeff\n",
    output: "gitGraph\n  title A\n  accTitle: A\n  accDescr: D\n",
    options: {},
  },
  {
    name: "gitgraph/line-terminators-and-unicode/unicode-leading-bom",
    input: "\ufeffgitGraph\ncommit\n",
    output: "\ufeffgitGraph\n  commit\n",
    options: {},
  },
  {
    name: "gitgraph/line-terminators-and-unicode/unicode-to-lf-change",
    input: 'gitGraph\ncommit id:"A\u2028B"\n',
    output: 'gitGraph\n  commit id: "A\u2028B"\n',
    options: {},
  },
]
