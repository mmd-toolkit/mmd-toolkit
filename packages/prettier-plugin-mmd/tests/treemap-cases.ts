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
    name: "treemap/title/bare-title-directive-space-and-line-separator",
    input: 'treemap\ntitle \u2028%%{init: {}}%%\n"A":1\n',
    output: 'treemap\ntitle %%{init: {}}%%\n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/title/bare-title-directive-space-and-paragraph-separator",
    input: 'treemap\ntitle \u2029%%{init: {}}%%\n"A":1\n',
    output: 'treemap\ntitle %%{init: {}}%%\n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/title/bare-title-directive-spaces-and-line-separator",
    input: 'treemap\ntitle  \u2028%%{init: {}}%%\n"A":1\n',
    output: 'treemap\ntitle %%{init: {}}%%\n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/title/bare-title-comment-after-line-separator-kept",
    input: 'treemap\ntitle  \u2028%% c\n"A":1\n',
    output: 'treemap\ntitle  \u2028%% c\n"A":1\n',
    options: {},
  },
  {
    name: "treemap/title/bare-title-line-separator-directive-comment-touch",
    input: 'treemap\ntitle \u2028 %%{x}%%  %% c  \n\n"A":1\n',
    output: 'treemap\ntitle\n%%{x}%%%% c  \n\n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/title/bare-title-paragraph-separator-tabs-directive-comment-touch",
    input: 'treemap\ntitle\t\u2029\t%%{x}%%\t%% c\n\n"A":1\n',
    output: 'treemap\ntitle\n%%{x}%%%% c\n\n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/title/bare-title-line-separator-directive-comment-touch-before-directive-line",
    input: 'treemap\ntitle \u2028 %%{x}%% %% c\n%%{y}%%\n"A":1\n',
    output: 'treemap\ntitle\n%%{x}%%%% c\n%%{y}%%\n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/title/title-text-line-separator-directive-comment-touch",
    input: 'treemap\ntitle T \u2028 %%{x}%%  %% c\n\n"A":1\n',
    output: 'treemap\ntitle T\n%%{x}%%%% c\n\n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/title/title-directive-text-line-separator-directive-comment-touch",
    input: 'treemap\ntitle %%{w}%% T \u2028 %%{x}%%  %% c\n\n"A":1\n',
    output: 'treemap\ntitle %%{w}%%T\n%%{x}%%%% c\n\n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/title/acctitle-text-line-separator-directive-comment-touch",
    input: 'treemap\naccTitle: T \u2028 %%{x}%%  %% c\n\n"A":1\n',
    output: 'treemap\naccTitle: T\n%%{x}%%%% c\n\n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/title/acctitle-bare-line-separator-directive-comment-touch",
    input: 'treemap\naccTitle: \u2028 %%{x}%%  %% c\n\n"A":1\n',
    output: 'treemap\naccTitle:\n%%{x}%%%% c\n\n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/title/bare-title-line-separator-directive-comment-before-row-kept",
    input: 'treemap\ntitle \u2028 %%{x}%%  %% c  \n"A":1\n',
    output: 'treemap\ntitle \u2028 %%{x}%%  %% c  \n"A":1\n',
    options: {},
  },
  {
    name: "treemap/title/bare-title-line-separator-directive-comment-at-end-one-space",
    input: "treemap\ntitle \u2028 %%{x}%%  %% c\n",
    output: "treemap\ntitle\n%%{x}%% %% c\n",
    options: {},
  },
  {
    name: "treemap/title/bare-title-line-separator-directive-comment-before-comment-line-kept",
    input: 'treemap\ntitle \u2028 %%{x}%%  %% c\n%% d\n"A":1\n',
    output: 'treemap\ntitle \u2028 %%{x}%%  %% c\n%% d\n"A":1\n',
    options: {},
  },
  {
    name: "treemap/title/bare-title-line-separator-directive-only-kept",
    input: 'treemap\ntitle \u2028 %%{x}%%  \n\n"A":1\n',
    output: 'treemap\ntitle \u2028 %%{x}%%  \n\n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/title/bare-title-directive-before-line-separator-comment-kept",
    input: 'treemap\ntitle %%{x}%% \u2028 %% c\n\n"A":1\n',
    output: 'treemap\ntitle %%{x}%% \u2028 %% c\n\n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/title/acctitle-directive-text-line-separator-directive-comment-kept",
    input: 'treemap\naccTitle: %%{w}%% T \u2028%%{x}%% %% c\n\n"A":1\n',
    output: 'treemap\naccTitle: %%{w}%% T \u2028%%{x}%% %% c\n\n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/title/bare-title-line-separator-directive-comment-before-empty-line-and-comment-line-kept",
    input: 'treemap\ntitle \u2028 %%{x}%%  %% c\n\n%% d\n"A":1\n',
    output: 'treemap\ntitle \u2028 %%{x}%%  %% c\n\n%% d\n"A":1\n',
    options: {},
  },
  {
    name: "treemap/title/bare-title-line-separator-directive-comment-before-whitespace-line-kept",
    input: 'treemap\ntitle \u2028 %%{x}%%  %% c\n  \n"A":1\n',
    output: 'treemap\ntitle \u2028 %%{x}%%  %% c\n  \n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/title/bare-title-line-separator-directive-comment-before-directive-comment-line-kept",
    input: 'treemap\ntitle \u2028 %%{x}%%  %% c\n%%{y}%% %% d\n"A":1\n',
    output: 'treemap\ntitle \u2028 %%{x}%%  %% c\n%%{y}%% %% d\n"A":1\n',
    options: {},
  },
  {
    name: "treemap/title/bare-title-line-separator-directive-comment-before-comment-line-at-end-one-space",
    input: "treemap\ntitle \u2028 %%{x}%%  %% c\n%% d\n",
    output: "treemap\ntitle\n%%{x}%% %% c\n%% d\n",
    options: {},
  },
  {
    name: "treemap/title/bare-title-line-separator-directive-comment-before-directive-line-at-end-one-space",
    input: "treemap\ntitle \u2028 %%{x}%%  %% c\n%%{y}%%\n",
    output: "treemap\ntitle\n%%{x}%% %% c\n%%{y}%%\n",
    options: {},
  },
  {
    name: "treemap/title/bare-title-directive-before-line-separator-directive-comment-before-empty-line-one-space",
    input: 'treemap\ntitle %%{w}%% \u2028 %%{x}%%  %% c\n\n"A":1\n',
    output: 'treemap\ntitle %%{w}%% \u2028 %%{x}%% %% c\n\n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/title/acctitle-directive-text-line-separator-directive-comment-before-empty-line-one-space",
    input: 'treemap\naccTitle: %%{w}%% T \u2028 %%{x}%%  %% c\n\n"A":1\n',
    output: 'treemap\naccTitle: %%{w}%% T \u2028 %%{x}%% %% c\n\n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/title/bare-title-directive-before-line-separator-directive-comment-before-row-kept",
    input: 'treemap\ntitle %%{w}%% \u2028 %%{x}%%  %% c\n"A":1\n',
    output: 'treemap\ntitle %%{w}%% \u2028 %%{x}%%  %% c\n"A":1\n',
    options: {},
  },
  {
    name: "treemap/title/acctitle-directive-text-line-separator-directive-comment-before-row-kept",
    input: 'treemap\naccTitle: %%{w}%% T \u2028 %%{x}%%  %% c\n"A":1\n',
    output: 'treemap\naccTitle: %%{w}%% T \u2028 %%{x}%%  %% c\n"A":1\n',
    options: {},
  },
  {
    name: "treemap/title/title-text-line-separator-directive-comment-touch-before-directive-line",
    input: 'treemap\ntitle T \u2028 %%{x}%%  %% c\n%%{y}%%\n"A":1\n',
    output: 'treemap\ntitle T\n%%{x}%%%% c\n%%{y}%%\n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/title/acctitle-text-line-separator-directive-comment-touch-before-directive-line",
    input: 'treemap\naccTitle: T \u2028 %%{x}%%  %% c\n%%{y}%%\n"A":1\n',
    output: 'treemap\naccTitle: T\n%%{x}%%%% c\n%%{y}%%\n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/title/bare-title-paragraph-separator-directive-comment-touch-before-directive-line",
    input: 'treemap\ntitle \u2029 %%{x}%%  %% c\n%%{y}%%\n"A":1\n',
    output: 'treemap\ntitle\n%%{x}%%%% c\n%%{y}%%\n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/title/bare-title-line-separator-directive-comment-touch-before-touching-directives-line",
    input: 'treemap\ntitle \u2028 %%{x}%%  %% c\n%%{y}%%%%{z}%%\n"A":1\n',
    output: 'treemap\ntitle\n%%{x}%%%% c\n%%{y}%%%%{z}%%\n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/title/title-text-line-separator-directive-comment-touch-before-empty-line-and-directive-line-with-trailing-blanks",
    input: 'treemap\ntitle T \u2028 %%{x}%%  %% c\n\n%%{y}%% \n"A":1\n',
    output: 'treemap\ntitle T\n%%{x}%%%% c\n\n%%{y}%%\n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/title/title-text-line-separator-directive-comment-touch-before-empty-line-and-indented-directive-line",
    input: 'treemap\ntitle T \u2028 %%{x}%%  %% c\n\n  %%{y}%%\n"A":1\n',
    output: 'treemap\ntitle T\n%%{x}%%%% c\n\n%%{y}%%\n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/title/title-text-line-separator-directive-comment-touch-before-empty-line-and-directive-line-with-two-directives",
    input: 'treemap\ntitle T \u2028 %%{x}%%  %% c\n\n%%{y}%% %%{z}%%\n"A":1\n',
    output: 'treemap\ntitle T\n%%{x}%%%% c\n\n%%{y}%%%%{z}%%\n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/title/acctitle-text-paragraph-separator-directive-comment-touch-before-empty-line-and-directive-line-with-trailing-blanks",
    input: 'treemap\naccTitle: T \u2029 %%{x}%%  %% c\n\n%%{y}%% \n"A":1\n',
    output: 'treemap\naccTitle: T\n%%{x}%%%% c\n\n%%{y}%%\n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/title/title-text-line-separator-directive-comment-before-directive-line-with-trailing-blanks-kept",
    input: 'treemap\ntitle T \u2028 %%{x}%%  %% c\n%%{y}%% \n"A":1\n',
    output: 'treemap\ntitle T \u2028 %%{x}%%  %% c\n%%{y}%% \n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/title/title-text-line-separator-directive-comment-before-directive-line-with-semicolon-kept",
    input: 'treemap\ntitle T \u2028 %%{x}%%  %% c\n%%{y}%%;\n"A":1\n',
    output: 'treemap\ntitle T \u2028 %%{x}%%  %% c\n%%{y}%%;\n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/title/title-text-line-separator-directive-comment-before-indented-directive-line-kept",
    input: 'treemap\ntitle T \u2028 %%{x}%%  %% c\n  %%{y}%%\n"A":1\n',
    output: 'treemap\ntitle T \u2028 %%{x}%%  %% c\n  %%{y}%%\n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/title/title-text-line-separator-directive-comment-before-directive-line-with-two-directives-kept",
    input: 'treemap\ntitle T \u2028 %%{x}%%  %% c\n%%{y}%% %%{z}%%\n"A":1\n',
    output:
      'treemap\ntitle T \u2028 %%{x}%%  %% c\n%%{y}%% %%{z}%%\n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/title/acctitle-text-paragraph-separator-directive-comment-before-directive-line-with-trailing-blanks-kept",
    input: 'treemap\naccTitle: T \u2029 %%{x}%%  %% c\n%%{y}%% \n"A":1\n',
    output: 'treemap\naccTitle: T \u2029 %%{x}%%  %% c\n%%{y}%% \n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/title/title-text-line-separator-directive-comment-before-directive-line-at-end-one-space",
    input: "treemap\ntitle T \u2028 %%{x}%%  %% c\n%%{y}%%\n",
    output: "treemap\ntitle T\n%%{x}%% %% c\n%%{y}%%\n",
    options: {},
  },
  {
    name: "treemap/title/acctitle-text-line-separator-directive-comment-before-directive-line-at-end-one-space",
    input: "treemap\naccTitle: T \u2028 %%{x}%%  %% c\n%%{y}%%\n",
    output: "treemap\naccTitle: T\n%%{x}%% %% c\n%%{y}%%\n",
    options: {},
  },
  {
    name: "treemap/title/bare-title-paragraph-separator-directive-comment-before-directive-line-at-end-one-space",
    input: "treemap\ntitle \u2029 %%{x}%%  %% c\n%%{y}%%\n",
    output: "treemap\ntitle\n%%{x}%% %% c\n%%{y}%%\n",
    options: {},
  },
  {
    name: "treemap/title/title-text-line-separator-directive-comment-before-directive-line-with-trailing-blanks-at-end-kept",
    input: "treemap\ntitle T \u2028 %%{x}%%  %% c\n%%{y}%% \n",
    output: "treemap\ntitle T \u2028 %%{x}%%  %% c\n%%{y}%% \n",
    options: {},
  },
  {
    name: "treemap/title/title-text-line-separator-directive-comment-before-directive-line-with-semicolon-at-end-kept",
    input: "treemap\ntitle T \u2028 %%{x}%%  %% c\n%%{y}%%;\n",
    output: "treemap\ntitle T \u2028 %%{x}%%  %% c\n%%{y}%%;\n",
    options: {},
  },
  {
    name: "treemap/title/acctitle-text-paragraph-separator-directive-comment-before-directive-line-with-semicolon-at-end-kept",
    input: "treemap\naccTitle: T \u2029 %%{x}%%  %% c\n%%{y}%%;\n",
    output: "treemap\naccTitle: T \u2029 %%{x}%%  %% c\n%%{y}%%;\n",
    options: {},
  },
  {
    name: "treemap/title/title-text-line-separator-directive-comment-before-indented-directive-line-at-end-kept",
    input: "treemap\ntitle T \u2028 %%{x}%%  %% c\n  %%{y}%%\n",
    output: "treemap\ntitle T \u2028 %%{x}%%  %% c\n  %%{y}%%\n",
    options: {},
  },
  {
    name: "treemap/title/title-text-line-separator-directive-comment-before-directive-line-with-two-directives-at-end-kept",
    input: "treemap\ntitle T \u2028 %%{x}%%  %% c\n%%{y}%% %%{z}%%\n",
    output: "treemap\ntitle T \u2028 %%{x}%%  %% c\n%%{y}%% %%{z}%%\n",
    options: {},
  },
  {
    name: "treemap/title/title-text-directive-before-line-separator-directive-comment-before-empty-line-one-space",
    input: 'treemap\ntitle T %%{w}%% \u2028 %%{x}%%  %% c\n\n"A":1\n',
    output: 'treemap\ntitle T %%{w}%% \u2028 %%{x}%% %% c\n\n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/title/title-text-directive-before-paragraph-separator-directive-comment-before-empty-line-one-space",
    input: 'treemap\ntitle T %%{w}%% \u2029 %%{x}%%  %% c\n\n"A":1\n',
    output: 'treemap\ntitle T %%{w}%% \u2029 %%{x}%% %% c\n\n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/comments/standalone-ls",
    input:
      'treemap\n"SeparatorRoot"\n%% note\u2028still comment\n "SeparatorChild":2\n',
    output:
      'treemap\n  "SeparatorRoot"\n    %% note\u2028still comment\n    "SeparatorChild": 2\n',
    options: {},
  },
  {
    name: "treemap/comments/standalone-ps",
    input:
      'treemap\n"ParagraphRoot"\n%% note\u2029still comment\n "ParagraphChild":2\n',
    output:
      'treemap\n  "ParagraphRoot"\n    %% note\u2029still comment\n    "ParagraphChild": 2\n',
    options: {},
  },
  {
    name: "treemap/line-terminators-and-unicode/cr-structure",
    input: 'treemap\r"CR root"\r "CR child":3\r',
    output: 'treemap\n  "CR root"\n    "CR child": 3\n',
    options: {},
  },
  {
    name: "treemap/line-terminators-and-unicode/crlf-values",
    input: 'treemap\r\n"CRLF\r\n name":3\r\naccDescr {one\r\ntwo}\r\n',
    output: 'treemap\n  "CRLF\n name": 3\naccDescr {one\n  two}\n',
    options: {},
  },
  {
    name: "treemap/line-terminators-and-unicode/unicode-values",
    input:
      'treemap\n"N\u2028S\u2029E\u00a0W\ufeff":3\naccTitle: A\u2028B\nclassDef zz x:1\u2028y:2\u2029;\n',
    output:
      'treemap\n  "N\u2028S\u2029E\u00a0W\ufeff": 3\naccTitle: A\u2028B\n  classDef zz x:1\u2028y:2\u2029\n',
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
    output: "treemap\n  classDef zz color: navy\n",
    options: {},
  },
  {
    name: "treemap/accessibility-lines/unicode-edges",
    input:
      "treemap\ntitle \u00a0Topic\u3000\naccTitle: \u2028Access\u2029\naccDescr: \ufeffDetail\u00a0",
    output: "treemap\ntitle Topic\naccTitle: Access\naccDescr: Detail\n",
    options: {},
  },
  {
    name: "treemap/description-blocks/unicode-empty",
    input: 'treemap\naccDescr{ \t\n\u2028\u00a0}\n"EmptyUnicode":3',
    output: 'treemap\naccDescr {}\n  "EmptyUnicode": 3\n',
    options: {},
  },
  {
    name: "treemap/description-blocks/unicode-opener",
    input: "treemap\naccDescr\u2028{Unicode detail}",
    output: "treemap\naccDescr: Unicode detail\n",
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
    name: "treemap/semicolons/class-terminator-unicode-space-before-kept",
    input:
      'treemap\nclassDef aa fill:red\u00a0;\nclassDef bb fill:blue\u2028;\nclassDef cc fill:blue\ufeff;\n"Leaf":1\n',
    output:
      'treemap\n  classDef aa fill: red\u00a0\n  classDef bb fill:blue\u2028\n  classDef cc fill: blue\ufeff\n  "Leaf": 1\n',
    options: {},
  },
  {
    name: "treemap/semicolons/class-terminator-after-separator-and-comment-kept",
    input: 'treemap\n"a":1\nclassDef cc fill: red \u2028\n%% c\n ;\n',
    output: 'treemap\n  "a": 1\n  classDef cc fill: red \u2028\n%% c\n ;\n',
    options: {},
  },
  {
    name: "treemap/semicolons/protected-later-atom",
    input: 'treemap\n"Protected"\n:3\n:::zz\nclassDef zz color:#red;;',
    output: 'treemap\n  "Protected": 3:::zz\n  classDef zz color:#red;;\n',
    options: {},
  },
  {
    name: "treemap/comments/comment-ls-semicolon-before",
    input: 'treemap\n"Root"\n "A":1%% c;\u2028 "B":2\n',
    output: 'treemap\n  "Root"\n    "A": 1%% c;\u2028 "B":2\n',
    options: {},
  },
  {
    name: "treemap/comments/comment-ps-semicolon-after",
    input: 'treemap\n"Root"\n "A":1%% c\u2029 "B;y":2\n',
    output: 'treemap\n  "Root"\n    "A": 1%% c\u2029 "B;y":2\n',
    options: {},
  },
  {
    name: "treemap/comments/comment-ls-semicolon-both",
    input: 'treemap\n"Root"\n "A":1%% c;\u2028 "B;y":2\n',
    output: 'treemap\n  "Root"\n    "A": 1%% c;\u2028 "B;y":2\n',
    options: {},
  },
  {
    name: "treemap/title/title-text-line-separator-unclosed-directive-joins-rest",
    input: 'treemap\ntitle T \u2028 %%{x\n\n"A":1\n',
    output: 'treemap\ntitle T %%{x\n\n"A":1\n',
    options: {},
  },
  {
    name: "treemap/title/title-text-line-separator-directive-comment-before-two-comment-lines-kept",
    input: 'treemap\ntitle T \u2028 %%{x}%%  %% c\n%% d\n%% e\n"A":1\n',
    output: 'treemap\ntitle T \u2028 %%{x}%%  %% c\n%% d\n%% e\n"A":1\n',
    options: {},
  },
  {
    name: "treemap/title/title-text-line-separator-directive-comment-at-end-without-line-feed-one-space",
    input: "treemap\ntitle T \u2028 %%{x}%%  %% c",
    output: "treemap\ntitle T\n%%{x}%% %% c\n",
    options: {},
  },
  {
    name: "treemap/title/title-text-ignored-semicolon-line-separator-directive-comment-kept",
    input: 'treemap\ntitle style:#x; \u2028 %%{x}%%  %% c\n\n"A":1\n',
    output: 'treemap\ntitle style:#x; \u2028 %%{x}%%  %% c\n\n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/title/title-text-two-ignored-semicolons-line-separator-directive-comment-kept",
    input: 'treemap\ntitle style classDef:#x;; \u2028 %%{x}%%  %% c\n\n"A":1\n',
    output:
      'treemap\ntitle style classDef:#x;; \u2028 %%{x}%%  %% c\n\n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/style-gaps/class-definition-line-separator-directive-comment-class-on-next-line",
    input:
      "treemap\nclassDef zz \u2028 %%{x}%%  %% c  \n\n classDef yy color:red\n",
    output:
      "treemap\n  classDef zz\n    %%{x}%% %% c  \n\n    classDef yy color:red\n",
    options: {},
  },
  {
    name: "treemap/style-gaps/class-definition-line-separator-directive-comment-row-as-style",
    input: 'treemap\nclassDef zz \u2028 %%{x}%%  %% c  \n\n"A": 1\n',
    output: 'treemap\n  classDef zz\n    %%{x}%% %% c  \n\n    "A": 1\n',
    options: {},
  },
  {
    name: "treemap/style-gaps/class-definition-after-row-line-separator-directive-comment-row-as-style",
    input: 'treemap\n"A": 1\nclassDef zz \u2028 %%{x}%%  %% c  \n\n  "B": 2\n',
    output:
      'treemap\n  "A": 1\n  classDef zz\n    %%{x}%% %% c  \n\n    "B": 2\n',
    options: {},
  },
  {
    name: "treemap/style-gaps/class-definition-line-separator-comment-class-on-next-line",
    input: "treemap\nclassDef zz \u2028 %% c  \n\n classDef yy color:red\n",
    output: "treemap\n  classDef zz\n    %% c  \n\n    classDef yy color:red\n",
    options: {},
  },
  {
    name: "treemap/style-gaps/class-definition-line-separator-directive-comment-class-follows-at-once",
    input:
      "treemap\nclassDef zz \u2028 %%{x}%%  %% c  \n classDef yy color:red\n",
    output:
      "treemap\n  classDef zz\n    %%{x}%% %% c  \n    classDef yy color:red\n",
    options: {},
  },
  {
    name: "treemap/style-gaps/class-definition-line-separator-directive-comment-class-at-first-column",
    input:
      "treemap\nclassDef zz \u2028 %%{x}%%  %% c  \n\nclassDef yy color:red\n",
    output:
      "treemap\n  classDef zz\n    %%{x}%% %% c  \n\n    classDef yy color:red\n",
    options: {},
  },
  {
    name: "treemap/style-gaps/class-definition-line-feed-directive-comment-class-on-next-line",
    input: "treemap\nclassDef zz\n %%{x}%%  %% c  \n\n classDef yy color:red\n",
    output:
      "treemap\n  classDef zz\n    %%{x}%% %% c  \n\n    classDef yy color:red\n",
    options: {},
  },
  {
    name: "treemap/style-gaps/class-definition-paragraph-separator-directive-comment-class-on-next-line",
    input:
      "treemap\nclassDef zz \u2029 %%{x}%%  %% c  \n\n classDef yy color:red\n",
    output:
      "treemap\n  classDef zz\n    %%{x}%% %% c  \n\n    classDef yy color:red\n",
    options: {},
  },
  {
    name: "treemap/style-gaps/class-definition-paragraph-separator-directive-comment-row-as-style",
    input: 'treemap\nclassDef zz \u2029 %%{x}%%  %% c  \n\n"A": 1\n',
    output: 'treemap\n  classDef zz\n    %%{x}%% %% c  \n\n    "A": 1\n',
    options: {},
  },
  {
    name: "treemap/style-gaps/class-definition-paragraph-separator-after-row-directive-comment-row-as-style",
    input: 'treemap\n"A": 1\nclassDef zz \u2029 %%{x}%%  %% c  \n\n  "B": 2\n',
    output:
      'treemap\n  "A": 1\n  classDef zz\n    %%{x}%% %% c  \n\n    "B": 2\n',
    options: {},
  },
  {
    name: "treemap/style-gaps/class-definition-paragraph-separator-comment-class-on-next-line",
    input: "treemap\nclassDef zz \u2029 %% c  \n\n classDef yy color:red\n",
    output: "treemap\n  classDef zz\n    %% c  \n\n    classDef yy color:red\n",
    options: {},
  },
  {
    name: "treemap/style-gaps/class-definition-paragraph-separator-directive-comment-class-follows-at-once",
    input:
      "treemap\nclassDef zz \u2029 %%{x}%%  %% c  \n classDef yy color:red\n",
    output:
      "treemap\n  classDef zz\n    %%{x}%% %% c  \n    classDef yy color:red\n",
    options: {},
  },
  {
    name: "treemap/style-gaps/class-definition-paragraph-separator-directive-comment-class-at-first-column",
    input:
      "treemap\nclassDef zz \u2029 %%{x}%%  %% c  \n\nclassDef yy color:red\n",
    output:
      "treemap\n  classDef zz\n    %%{x}%% %% c  \n\n    classDef yy color:red\n",
    options: {},
  },
  {
    name: "treemap/style-gaps/class-definition-line-separator-comment-then-unclosed-directive",
    input: 'treemap\nclassDef zz \u2028 %%{x: y\n%% c\n\n"A": 1\n',
    output: 'treemap\n  classDef zz\n    %%{x: y\n%% c\n\n    "A": 1\n',
    options: {},
  },
  {
    name: "treemap/style-gaps/class-definition-line-separator-two-comment-lines",
    input: 'treemap\nclassDef zz \u2028 %% c\n%% d\n\n"A": 1\n',
    output: 'treemap\n  classDef zz\n    %% c\n    %% d\n\n    "A": 1\n',
    options: {},
  },
  {
    name: "treemap/style-gaps/class-definition-line-separator-comment-then-whitespace-line",
    input: 'treemap\nclassDef zz \u2028 %% c\n \t\n"A": 1\n',
    output: 'treemap\n  classDef zz\n    %% c\n\n    "A": 1\n',
    options: {},
  },
  {
    name: "treemap/style-gaps/class-definition-ignored-semicolon-line-separator-comment",
    input: 'treemap\nclassDef zz style:#x;\u2028 %% c\n\n"A": 1\n',
    output: 'treemap\n  classDef zz style:#x;\u2028%% c\n\n  "A": 1\n',
    options: {},
  },
  {
    name: "treemap/style-gaps/class-definition-line-separator-comment-at-end-of-text",
    input: "treemap\nclassDef zz \u2028 %% c",
    output: "treemap\n  classDef zz \u2028 %% c\n",
    options: {},
  },
]
