/** Fixed escaped inputs cover native Unicode and host line endings. */
import type { Options } from "prettier"

interface CynefinCase {
  readonly name: string
  readonly input: string
  readonly output: string
  readonly options: Options
}

export const cynefinCases: readonly CynefinCase[] = [
  {
    name: "cynefin/description-blocks/description-unicode-empty",
    input: "cynefin-beta\naccDescr{\u00a0\u2028\u2029\t}",
    output: "cynefin-beta\n  accDescr{}\n",
    options: {},
  },
  {
    name: "cynefin/comments/comment-unicode-join",
    input: 'cynefin-beta\ncomplex "A\u2028%% removed join\nB"',
    output: 'cynefin-beta\n  complex\n    "A\u2028%% removed join\nB"\n',
    options: {},
  },
  {
    name: "cynefin/comments/comment-ls-native-content",
    input:
      'cynefin-beta\ncomplex "BeforeLS" %% native\u2028still comment\n"AfterLS"',
    output:
      'cynefin-beta\n  complex\n    "BeforeLS" %% native\u2028still comment\n    "AfterLS"\n',
    options: {},
  },
  {
    name: "cynefin/semicolons/semi-ls-segment-owned",
    input: 'cynefin-beta\ncomplex "style:#ls;\u2028later;"',
    output: 'cynefin-beta\n  complex "style:#ls;\u2028later;"\n',
    options: {},
  },
  {
    name: "cynefin/semicolons/semi-ps-segment-owned",
    input: 'cynefin-beta\ncomplex "classDef:#ps;\u2029later;"',
    output: 'cynefin-beta\n  complex "classDef:#ps;\u2029later;"\n',
    options: {},
  },
  {
    name: "cynefin/line-terminators-and-unicode/eol-bare-cr",
    input: 'cynefin-beta\rcomplex "CRItem"\rclear-->chaotic\r',
    output: 'cynefin-beta\n  complex\n    "CRItem"\n  clear --> chaotic\n',
    options: {},
  },
  {
    name: "cynefin/line-terminators-and-unicode/eol-crlf-string",
    input: 'cynefin-beta\r\ncomplex "First\r\nSecond\rThird"\r\n',
    output: 'cynefin-beta\n  complex\n    "First\nSecond\nThird"\n',
    options: {},
  },
  {
    name: "cynefin/line-terminators-and-unicode/eol-output-crlf-hidden",
    input:
      'cynefin-beta\ncomplex-->clear%%{!CRLF\nhidden}%%\n\nchaotic "CRLFBody"',
    output:
      'cynefin-beta\r\n  complex --> clear%%{!CRLF\r\nhidden}%%\r\n\r\n  chaotic\r\n    "CRLFBody"\r\n',
    options: {
      endOfLine: "crlf",
    },
  },
  {
    name: "cynefin/line-terminators-and-unicode/eol-output-cr",
    input: 'cynefin-beta\nclear "OutputCR"',
    output: 'cynefin-beta\r  clear\r    "OutputCR"\r',
    options: {
      endOfLine: "cr",
    },
  },
  {
    name: "cynefin/line-terminators-and-unicode/unicode-string-owned",
    input: 'cynefin-beta\ncomplex "A\u2028B\u2029C\u00a0D\ufeffE"',
    output: 'cynefin-beta\n  complex\n    "A\u2028B\u2029C\u00a0D\ufeffE"\n',
    options: {},
  },
  {
    name: "cynefin/line-terminators-and-unicode/unicode-common-edge",
    input:
      "cynefin-beta\ntitle \u00a0A\u2028B\u3000\naccTitle:\ufeffC\u2029D\u00a0",
    output: "cynefin-beta\n  title A\u2028B\n  accTitle: C\u2029D\n",
    options: {},
  },
  {
    name: "cynefin/line-terminators-and-unicode/unicode-block-opener",
    input: "cynefin-beta\naccDescr\u00a0\u2028{UnicodeGap}",
    output: "cynefin-beta\n  accDescr {UnicodeGap}\n",
    options: {},
  },
  {
    name: "cynefin/line-terminators-and-unicode/bom-leading-host",
    input: '\ufeffcynefin-beta\nclear "BomBody"',
    output: '\ufeffcynefin-beta\n  clear\n    "BomBody"\n',
    options: {},
  },
  {
    name: "cynefin/specified-readings/divergence-opaque-yaml",
    input: '---\nconfig: [\n---\ncynefin-beta\nclear "OpaqueBody"',
    output: '---\nconfig: [\n---\ncynefin-beta\n  clear\n    "OpaqueBody"\n',
    options: {},
  },
  {
    name: "cynefin/specified-readings/divergence-c4-string",
    input: 'cynefin-beta\nclear "C4Container"',
    output: 'cynefin-beta\n  clear\n    "C4Container"\n',
    options: {},
  },
  {
    name: "cynefin/specified-readings/divergence-html-cross",
    input: '---\ntitle: <a\n---\ncynefin-beta\naccTitle: b="z">raw',
    output: '---\ntitle: <a\n---\ncynefin-beta\n  accTitle: b="z">raw\n',
    options: {},
  },
  {
    name: "cynefin/specified-readings/divergence-bare-unicode",
    input: '%%\n\u3000cynefin-beta\nclear "PassedUnicode"',
    output: '%%\ncynefin-beta\n  clear\n    "PassedUnicode"\n',
    options: {},
  },
  {
    name: "cynefin/hidden-boundaries/meeting-ls-in-form-directive",
    input: 'cynefin-beta complex "A" %%{!L\u2028R}%%\n',
    output: 'cynefin-beta complex "A" %%{!L\u2028R}%%\n',
    options: {},
  },
  {
    name: "cynefin/hidden-boundaries/meeting-ls-in-form-yaml",
    input: 'cynefin-beta complex "A" ---\nL\u2028R\n---\n\nclear "B"',
    output: 'cynefin-beta complex "A" ---\nL\u2028R\n---\n\n  clear\n    "B"\n',
    options: {},
  },
  {
    name: "cynefin/hidden-boundaries/meeting-ps-in-form-directive",
    input: 'cynefin-beta complex "A" %%{!L\u2029R}%%\n',
    output: 'cynefin-beta complex "A" %%{!L\u2029R}%%\n',
    options: {},
  },
  {
    name: "cynefin/hidden-boundaries/meeting-ps-in-form-yaml",
    input: 'cynefin-beta complex "A" ---\nL\u2029R\n---\n\nclear "B"',
    output: 'cynefin-beta complex "A" ---\nL\u2029R\n---\n\n  clear\n    "B"\n',
    options: {},
  },
]
