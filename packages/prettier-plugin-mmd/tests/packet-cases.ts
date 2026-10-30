/** Fixed escaped packet cases distinguish physical EOL from Unicode content. */
import type { Options } from "prettier"

interface PacketCase {
  readonly name: string
  readonly input: string
  readonly output: string
  readonly options: Options
}

export const packetCases: readonly PacketCase[] = [
  {
    name: "packet/description-blocks/description-empty",
    input: "packet\naccDescr{ \t\n\u2028\u00a0}\n",
    output: "packet\n  accDescr{}\n",
    options: {},
  },
  {
    name: "packet/description-blocks/description-opener",
    input: "packet\naccDescr\n\n\u2028{ Open }\n",
    output: "packet\n  accDescr { Open }\n",
    options: {},
  },
  {
    name: "packet/comments/comments-ls-ps",
    input: 'packet\n%%! X\u20280:"swallowed"\u2029Y\n0:"Visible"\n',
    output: 'packet\n  %%! X\u20280:"swallowed"\u2029Y\n  0: "Visible"\n',
    options: {},
  },
  {
    name: "packet/semicolons/semicolons-ls-segment",
    input: 'packet\n0:"style:#x\u2028A;B"\n',
    output: 'packet\n  0: "style:#x\u2028A;B"\n',
    options: {},
  },
  {
    name: "packet/line-terminators-and-unicode/eol-cr",
    input: 'packet\r0:"CR"\r1:"Next"\r',
    output: 'packet\n  0: "CR"\n  1: "Next"\n',
    options: {},
  },
  {
    name: "packet/line-terminators-and-unicode/eol-crlf-label",
    input: 'packet\r\n0:"First\r\nSecond"\r\n',
    output: 'packet\n  0: "First\nSecond"\n',
    options: {},
  },
  {
    name: "packet/line-terminators-and-unicode/eol-crlf-hidden",
    input: 'packet\r\n0:"CR hidden"%%{!}%%\r\n\r\n1:"Next"\r\n',
    output: 'packet\n  0: "CR hidden"%%{!}%%\n\n  1: "Next"\n',
    options: {},
  },
  {
    name: "packet/line-terminators-and-unicode/eol-cr-yaml-block",
    input:
      '---\ntitle: Physical\n---\rpacket\raccDescr {\r First\r Second\r}\r0:"CR yaml"---\rx\r--- \r',
    output:
      '---\ntitle: Physical\n---\npacket\n  accDescr {\n First\n Second\n  }\n  0: "CR yaml"---\nx\n--- \n',
    options: {},
  },
  {
    name: "packet/line-terminators-and-unicode/eol-output-crlf",
    input: 'packet\n0:"Output CRLF"\n',
    output: 'packet\r\n  0: "Output CRLF"\r\n',
    options: {
      endOfLine: "crlf",
    },
  },
  {
    name: "packet/line-terminators-and-unicode/eol-output-cr",
    input: 'packet\n0:"Output CR"\n',
    output: 'packet\r  0: "Output CR"\r',
    options: {
      endOfLine: "cr",
    },
  },
  {
    name: "packet/line-terminators-and-unicode/unicode-values",
    input:
      'packet\n0:"A\u2028B\u2029C\u00a0D\ufeffE"\ntitle A\u2028B\naccTitle: A\u2029B\n',
    output:
      'packet\n  0: "A\u2028B\u2029C\u00a0D\ufeffE"\n  title A\u2028B\n  accTitle: A\u2029B\n',
    options: {},
  },
  {
    name: "packet/line-terminators-and-unicode/unicode-line-trim",
    input:
      "packet\ntitle \u2028\u00a0Topic\ufeff\naccTitle: \u2029Access\u3000\naccDescr: \u00a0Detail\u2028\n",
    output: "packet\n  title Topic\n  accTitle: Access\n  accDescr: Detail\n",
    options: {},
  },
  {
    name: "packet/line-terminators-and-unicode/bom-header",
    input: '\ufeffpacket\n0:"BOM"\n',
    output: '\ufeffpacket\n  0: "BOM"\n',
    options: {},
  },
  {
    name: "packet/specified-readings/div-bare-unicode",
    input: '%%\n\u2028packet\n0:"Bare"\n',
    output: '%%\npacket\n  0: "Bare"\n',
    options: {},
  },
  {
    name: "packet/line-terminators-and-unicode/unicode-hidden-content",
    input:
      'packet\n---\nA\u2028B\u2029C\n---\n0:"Unicode hidden"%%{!A\u2028B\u2029C}%% \n1:"Following"\n',
    output:
      'packet\n  ---\nA\u2028B\u2029C\n---\n  0: "Unicode hidden"%%{!A\u2028B\u2029C}%% \n  1: "Following"\n',
    options: {},
  },
  {
    name: "packet/line-terminators-and-unicode/unicode-common-interiors",
    input: "packet\naccDescr{\u00a0A\u2028B\u2029C\ufeff}\n",
    output: "packet\n  accDescr{ A\u2028B\u2029C }\n",
    options: {},
  },
  {
    name: "packet/line-terminators-and-unicode/eol-frontmatter",
    input:
      '---\r\ntitle:   Physical packet\r\n---\r\npacket\r\n0:"Frontmatter CRLF"\r\n',
    output:
      '---\ntitle: Physical packet\n---\npacket\n  0: "Frontmatter CRLF"\n',
    options: {},
  },
  {
    name: "packet/line-terminators-and-unicode/bom-frontmatter-opening",
    input: '\ufeff---\ntitle:   Host BOM\n---\npacket\n0:"Opening BOM"\n',
    output: '\ufeff---\ntitle: Host BOM\n---\npacket\n  0: "Opening BOM"\n',
    options: {},
  },
]
