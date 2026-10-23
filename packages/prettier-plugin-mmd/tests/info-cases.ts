/** Fixed escaped info cases distinguish Unicode from physical line endings. */
import type { Options } from "prettier"

interface InfoCase {
  readonly name: string
  readonly input: string
  readonly output: string
  readonly options: Options
}

export const infoCases: readonly InfoCase[] = [
  {
    name: "info/title/title-unicode-edges",
    input: "info\ntitle \u2028\u00a0Topic\u3000\n",
    output: "info\n  title Topic\n",
    options: {},
  },
  {
    name: "info/accessibility-lines/a11y-unicode-edges",
    input:
      "info\naccTitle:\u2028Access\u00a0word\u2029\naccDescr:\u00a0Details\u3000\n",
    output: "info\n  accTitle: Access\u00a0word\n  accDescr: Details\n",
    options: {},
  },
  {
    name: "info/description-blocks/block-opener-multiline",
    input: "info\naccDescr\n\n\u2028\u00a0{ D }\n",
    output: "info\n  accDescr { D }\n",
    options: {},
  },
  {
    name: "info/description-blocks/block-empty",
    input: "info\naccDescr {}\naccDescr { \t\u2029\n }\n",
    output: "info\n  accDescr {}\n  accDescr {}\n",
    options: {},
  },
  {
    name: "info/authored-values/literal-html-entity",
    input:
      'info\ntitle <b class="x">Topic</b> &amp; #35;\naccTitle: A\t\tB\u2028C\n',
    output:
      'info\n  title <b class="x">Topic</b> &amp; #35;\n  accTitle: A\t\tB\u2028C\n',
    options: {},
  },
  {
    name: "info/hidden-directives/hidden-multiline-later-closer",
    input: "info\n%%{}%%x\n!\u2028?\u2029\n}%%\nshowInfo\n",
    output: "info\n  %%{}%%x\n!\u2028?\u2029\n}%%\nshowInfo\n",
    options: {},
  },
  {
    name: "info/comments/comments-bare-triple",
    input: "info\n%%\n%%% note\u2028more\u2029end\ntitle Topic\n",
    output: "info\n  %%\n  %%% note\u2028more\u2029end\n  title Topic\n",
    options: {},
  },
  {
    name: "info/comments/comments-common-region-join",
    input: "info\ntitle A\u2028%% note\nB\n",
    output: "info\n  title A\u2028%% note\nB\n",
    options: {},
  },
  {
    name: "info/semicolons/semicolon-unicode-segments",
    input:
      "info\naccDescr: style x:#f00\u2028;\naccDescr { classDef x:#f00\u2029; }\n",
    output:
      "info\n  accDescr: style x:#f00\u2028;\n  accDescr { classDef x:#f00\u2029; }\n",
    options: {},
  },
  {
    name: "info/line-terminators-and-unicode/eol-cr-body",
    input: "info\rshowInfo\rtitle Topic\r",
    output: "info showInfo\n  title Topic\n",
    options: {},
  },
  {
    name: "info/line-terminators-and-unicode/eol-crlf-block",
    input: "info\r\naccDescr {D\r\n E}\r\n",
    output: "info\n  accDescr {D\n E}\n",
    options: {},
  },
  {
    name: "info/line-terminators-and-unicode/eol-cr-hidden",
    input: "info\raccDescr {D}%%{}%% \rtitle Topic\r",
    output: "info\n  accDescr {D}%%{}%% \n  title Topic\n",
    options: {},
  },
  {
    name: "info/line-terminators-and-unicode/eol-crlf-yaml",
    input:
      "info\r\naccDescr {D}---\r\nx: ignored\r\n---\r\n\r\ntitle Topic\r\n",
    output: "info\n  accDescr {D}---\nx: ignored\n---\n\n  title Topic\n",
    options: {},
  },
  {
    name: "info/line-terminators-and-unicode/eol-output-crlf",
    input: "info\ntitle Topic\n",
    output: "info\r\n  title Topic\r\n",
    options: { endOfLine: "crlf" },
  },
  {
    name: "info/line-terminators-and-unicode/eol-output-cr",
    input: "info\naccDescr {D}\n",
    output: "info\r  accDescr {D}\r",
    options: { endOfLine: "cr" },
  },
  {
    name: "info/line-terminators-and-unicode/eol-frontmatter",
    input: "---\r\ntitle: Topic\r\n---\r\ninfo\r\n",
    output: "---\ntitle: Topic\n---\ninfo\n",
    options: {},
  },
  {
    name: "info/line-terminators-and-unicode/unicode-values-comments-hidden",
    input:
      "info\ntitle A\u2028B\u00a0C\naccDescr {D\u2029E\ufeffF}\n%% note\u2028more\u2029end\n%%{!\u2028!\u2029!}%%\n",
    output:
      "info\n  title A\u2028B\u00a0C\n  accDescr {D\u2029E\ufeffF}\n  %% note\u2028more\u2029end\n  %%{!\u2028!\u2029!}%%\n",
    options: {},
  },
  {
    name: "info/line-terminators-and-unicode/bom-header",
    input: "\ufeffinfo \t",
    output: "\ufeffinfo\n",
    options: {},
  },
  {
    name: "info/line-terminators-and-unicode/bom-frontmatter-opening",
    input: "\ufeff---\ntitle: Hidden\n---\ninfo\n",
    output: "\ufeff---\ntitle: Hidden\n---\ninfo\n",
    options: {},
  },
  {
    name: "info/line-terminators-and-unicode/unicode-all-common-edges",
    input:
      "info\ntitle \t\u000b\f\u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeffTopic\t\u000b\f\u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff\n",
    output: "info\n  title Topic\n",
    options: {},
  },
]
