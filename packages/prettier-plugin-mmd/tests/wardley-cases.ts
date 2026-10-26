/** Fixed escaped inputs distinguish host line endings and native value text. */
import type { Options } from "prettier"

interface WardleyCase {
  readonly name: string
  readonly input: string
  readonly output: string
  readonly options: Options
}

export const wardleyCases: readonly WardleyCase[] = [
  {
    name: "wardley/semicolons/style-comment-ls-connected",
    input: 'wardley-beta\nnote "style\u2028%% removed\n:#x;"[0.3,0.6]',
    output: 'wardley-beta\n  note "style\u2028%% removed\n:#x;"[0.3,0.6]\n',
    options: {},
  },
  {
    name: "wardley/semicolons/classdef-comment-ps-connected",
    input: 'wardley-beta\nnote "classDef\u2029%% removed\n:#x;"[0.3,0.6]',
    output: 'wardley-beta\n  note "classDef\u2029%% removed\n:#x;"[0.3,0.6]\n',
    options: {},
  },
  {
    name: "wardley/line-terminators-and-unicode/cr-structure",
    input: "wardley-beta\rcomponent Cr[0.3,0.6]\r",
    output: "wardley-beta\n  component Cr [0.3, 0.6]\n",
    options: {},
  },
  {
    name: "wardley/line-terminators-and-unicode/crlf-string",
    input: 'wardley-beta\r\nnote "first\r\nnext"[0.3,0.6]\r\n',
    output: 'wardley-beta\n  note "first\nnext" [0.3, 0.6]\n',
    options: {},
  },
  {
    name: "wardley/line-terminators-and-unicode/output-crlf",
    input: "wardley-beta\ncomponent OutCrLf[0.3,0.6]",
    output: "wardley-beta\r\n  component OutCrLf [0.3, 0.6]\r\n",
    options: {
      endOfLine: "crlf",
    },
  },
  {
    name: "wardley/line-terminators-and-unicode/output-cr",
    input: "wardley-beta\ncomponent OutCr[0.3,0.6]",
    output: "wardley-beta\r  component OutCr [0.3, 0.6]\r",
    options: {
      endOfLine: "cr",
    },
  },
  {
    name: "wardley/line-terminators-and-unicode/unicode-values",
    input:
      'wardley-beta\nnote "A\u2028B\u2029C\u00a0D\ufeffE"[0.3,0.6]\nAlpha->Beta; L\u2028M\u2029N',
    output:
      'wardley-beta\n  note "A\u2028B\u2029C\u00a0D\ufeffE" [0.3, 0.6]\n  Alpha -> Beta; L\u2028M\u2029N\n',
    options: {},
  },
  {
    name: "wardley/line-terminators-and-unicode/unicode-common-trim",
    input:
      "wardley-beta\ntitle \u00a0Topic\ufeff\naccTitle: \u2028Access\u2029",
    output: "wardley-beta\n  title Topic\n  accTitle: Access\n",
    options: {},
  },

  {
    name: "wardley/semicolons/style-comment-both-connected",
    input:
      'wardley-beta\nnote "before\u2028%% before\nstyle\u2028%% after\n:#x;"[0.3,0.6]',
    output:
      'wardley-beta\n  note "before\u2028%% before\nstyle\u2028%% after\n:#x;"[0.3,0.6]\n',
    options: {},
  },
  {
    name: "wardley/semicolons/style-comment-before-connected",
    input: 'wardley-beta\nnote "head\u2028%% before\nstyle:#x;"[0.3,0.6]',
    output: 'wardley-beta\n  note "head\u2028%% before\nstyle:#x;"[0.3,0.6]\n',
    options: {},
  },
  {
    name: "wardley/semicolons/classdef-comment-before-connected",
    input: 'wardley-beta\nnote "head\u2029%% before\nclassDef:#x;"[0.3,0.6]',
    output:
      'wardley-beta\n  note "head\u2029%% before\nclassDef:#x;"[0.3,0.6]\n',
    options: {},
  },
  {
    name: "wardley/semicolons/classdef-comment-both-connected",
    input:
      'wardley-beta\nnote "prefix\u2029%% before\nclassDef\u2029%% after\n:#q;"[0.4,0.7]',
    output:
      'wardley-beta\n  note "prefix\u2029%% before\nclassDef\u2029%% after\n:#q;"[0.4,0.7]\n',
    options: {},
  },
  {
    name: "wardley/accessibility/unicode-empty-description",
    input: "wardley-beta\naccDescr\u2028{\u00a0\u2029}\nsize[7,9]",
    output: "wardley-beta\n  accDescr {}\n  size [7, 9]\n",
    options: {},
  },
  {
    name: "wardley/comments/native-separators",
    input: "wardley-beta\n%% tail\u2028ordinary\u2029text\nsize[7,9]",
    output: "wardley-beta\n  %% tail\u2028ordinary\u2029text\n  size [7, 9]\n",
    options: {},
  },
  {
    name: "wardley/line-terminators-and-unicode/hidden-crlf",
    input: "wardley-beta\r\nsize[7,9]%%{!first\r\n last}%% \r\n",
    output: "wardley-beta\n  size [7, 9]%%{!first\n last}%% \n",
    options: {},
  },
  {
    name: "wardley/line-terminators-and-unicode/leading-bom",
    input: "\ufeffwardley-beta\nsize[7,9]",
    output: "\ufeffwardley-beta\n  size [7, 9]\n",
    options: {},
  },
  {
    name: "wardley/flows/unicode-flow",
    input: "wardley-beta\nFlowSource+'L\u2028M\u2029N'>FlowTarget",
    output: "wardley-beta\n  FlowSource +'L\u2028M\u2029N'> FlowTarget\n",
    options: {},
  },
  {
    name: "wardley/specified-readings/passed-unicode",
    input: "%%\n\u2028wardley-beta\nsize[7,9]",
    output: "%%\nwardley-beta\n  size [7, 9]\n",
    options: {},
  },
  {
    name: "wardley/hidden-boundaries/meeting-ls-in-form-directive",
    input:
      "wardley-beta pipeline Parent { %%{!L\u2028R}%%\n\ncomponent Child[0.5]\n}\ncomponent Parent[0.3,0.6]\n",
    output:
      "wardley-beta pipeline Parent { %%{!L\u2028R}%%\n\n    component Child [0.5]\n  }\n  component Parent [0.3, 0.6]\n",
    options: {},
  },
  {
    name: "wardley/hidden-boundaries/meeting-ls-in-form-yaml",
    input:
      "wardley-beta pipeline Parent { ---\nL\u2028R\n---\n\ncomponent Child[0.5]\n}\ncomponent Parent[0.3,0.6]\n",
    output:
      "wardley-beta pipeline Parent { ---\nL\u2028R\n---\n\n    component Child [0.5]\n  }\n  component Parent [0.3, 0.6]\n",
    options: {},
  },
  {
    name: "wardley/hidden-boundaries/meeting-ps-in-form-directive",
    input:
      "wardley-beta pipeline Parent { %%{!L\u2029R}%%\n\ncomponent Child[0.5]\n}\ncomponent Parent[0.3,0.6]\n",
    output:
      "wardley-beta pipeline Parent { %%{!L\u2029R}%%\n\n    component Child [0.5]\n  }\n  component Parent [0.3, 0.6]\n",
    options: {},
  },
  {
    name: "wardley/hidden-boundaries/meeting-ps-in-form-yaml",
    input:
      "wardley-beta pipeline Parent { ---\nL\u2029R\n---\n\ncomponent Child[0.5]\n}\ncomponent Parent[0.3,0.6]\n",
    output:
      "wardley-beta pipeline Parent { ---\nL\u2029R\n---\n\n    component Child [0.5]\n  }\n  component Parent [0.3, 0.6]\n",
    options: {},
  },
]
