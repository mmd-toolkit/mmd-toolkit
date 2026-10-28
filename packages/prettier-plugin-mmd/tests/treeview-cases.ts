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
  {
    name: "treeview/branch-prefixes/box-redraw-comment-region-in-prefix",
    input: "treeView-beta\nroot\n│\u2028%% note\n   └── a\n",
    output: "treeView-beta\nroot\n│\u2028%% note\n   └── a\n",
    options: {},
  },
  {
    name: "treeview/multiline-values/box-redraw-quote-value-ls-keep",
    input: 'treeView-beta\n"a\n│\u2028b"\n├── x\n',
    output: 'treeView-beta\n"a\n│\u2028b"\n└── x\n',
    options: {},
  },
  {
    name: "treeview/multiline-values/box-redraw-quote-value-ps-keep",
    input: 'treeView-beta\n"a\n│\u2029b"\n├── x\n',
    output: 'treeView-beta\n"a\n│\u2029b"\n└── x\n',
    options: {},
  },
  {
    name: "treeview/tabs/box-redraw-use-tabs-fixed4",
    input: "treeView-beta\nroot\n├── a\n│   ├── b\n",
    output: "treeView-beta\nroot\n└── a\n    └── b\n",
    options: { useTabs: true, tabWidth: 8 },
  },
  {
    name: "treeview/tabs/box-redraw-tabwidth-zero-fixed4",
    input: "treeView-beta\nroot\n├── a\n│   ├── b\n",
    output: "treeView-beta\nroot\n└── a\n    └── b\n",
    options: { tabWidth: 0 },
  },
  {
    name: "treeview/tabs/box-redraw-tabwidth-zero-tabs-fixed4",
    input: "treeView-beta\nroot\n├── a\n│   ├── b\n",
    output: "treeView-beta\nroot\n└── a\n    └── b\n",
    options: { useTabs: true, tabWidth: 0 },
  },
  {
    name: "treeview/decorations/box-redraw-decoration-comment-region",
    input: "treeView-beta\nr\n├─ a\n│\u2028%% note\n┃\n└─ b\n",
    output: "treeView-beta\nr\n├─ a\n│\u2028%% note\n┃\n└─ b\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/box-redraw-join-description-ls",
    input: "treeView-beta\n├─ node\n└─ ## left\u2028right\n",
    output: "treeView-beta\n└── node ## left\u2028right\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/box-redraw-join-description-ps",
    input: "treeView-beta\n├─ node\n└─ ## left\u2029right\n",
    output: "treeView-beta\n└── node ## left\u2029right\n",
    options: {},
  },
  {
    name: "treeview/tabs/box-redraw-combined-zero-tabs",
    input: "treeView-beta\nzero\n├─ child\n│   ├─ grandchild\n",
    output: "treeView-beta\nzero\n└── child\n    └── grandchild\n",
    options: { useTabs: true, tabWidth: 0 },
  },
  {
    name: "treeview/decorations/box-redraw-annotation-blank-ls",
    input: 'treeView-beta\n"r─"\n│\n└─ ## a\u2028b\n"next"\n',
    output: 'treeView-beta\n"r─" ## a\u2028b\n\n"next"\n',
    options: {},
  },
  {
    name: "treeview/decorations/box-redraw-annotation-blank-ps",
    input: 'treeView-beta\n"r─"\n│\n└─ ## a\u2029b\n"next"\n',
    output: 'treeView-beta\n"r─" ## a\u2029b\n\n"next"\n',
    options: {},
  },
  {
    name: "treeview/annotation-lines/box-redraw-comment-region-prefix-ls",
    input: "treeView-beta\n├─ alpha\n│\u2028%% between\n└─ :::later\n",
    output: "treeView-beta\n├─ alpha\n│\u2028%% between\n└─ :::later\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/box-redraw-comment-region-prefix-ps",
    input: "treeView-beta\n├─ alpha\n│\u2029%% between\n└─ :::later\n",
    output: "treeView-beta\n├─ alpha\n│\u2029%% between\n└─ :::later\n",
    options: {},
  },
  {
    name: "treeview/branch-prefixes/box-redraw-comment-region-in-prefix-ps",
    input: "treeView-beta\nroot\n│\u2029%% note\n   └── a\n",
    output: "treeView-beta\nroot\n│\u2029%% note\n   └── a\n",
    options: {},
  },
  {
    name: "treeview/decorations/box-redraw-decoration-comment-region-ps",
    input: "treeView-beta\nr\n├─ a\n│\u2029%% note\n┃\n└─ b\n",
    output: "treeView-beta\nr\n├─ a\n│\u2029%% note\n┃\n└─ b\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-class-ls-four",
    input: "treeView-beta\nroot\n├── a\u2028%% c\n    :::c\n└── z\n",
    output: "treeView-beta\nroot\n├── a\u2028%% c\n    :::c\n└── z\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-class-ps-four",
    input: "treeView-beta\nroot\n├── a\u2029%% c\n    :::c\n└── z\n",
    output: "treeView-beta\nroot\n├── a\u2029%% c\n    :::c\n└── z\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-class-ls-one",
    input: "treeView-beta\nroot\n├── a\u2028%% c\n :::c\n└── z\n",
    output: "treeView-beta\nroot\n├── a\u2028%% c\n    :::c\n└── z\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-class-ps-one",
    input: "treeView-beta\nroot\n├── a\u2029%% c\n :::c\n└── z\n",
    output: "treeView-beta\nroot\n├── a\u2029%% c\n    :::c\n└── z\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-class-ls-tab",
    input: "treeView-beta\nroot\n├── a\u2028%% c\n\t:::c\n└── z\n",
    output: "treeView-beta\nroot\n├── a\u2028%% c\n    :::c\n└── z\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-class-ps-tab",
    input: "treeView-beta\nroot\n├── a\u2029%% c\n\t:::c\n└── z\n",
    output: "treeView-beta\nroot\n├── a\u2029%% c\n    :::c\n└── z\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-icon-ls-four",
    input: "treeView-beta\nroot\n├── a\u2028%% c\n    icon(fa:file)\n└── z\n",
    output: "treeView-beta\nroot\n├── a\u2028%% c\n    icon(fa:file)\n└── z\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-icon-ps-four",
    input: "treeView-beta\nroot\n├── a\u2029%% c\n    icon(fa:file)\n└── z\n",
    output: "treeView-beta\nroot\n├── a\u2029%% c\n    icon(fa:file)\n└── z\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-icon-ls-one",
    input: "treeView-beta\nroot\n├── a\u2028%% c\n icon(fa:file)\n└── z\n",
    output: "treeView-beta\nroot\n├── a\u2028%% c\n    icon(fa:file)\n└── z\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-icon-ps-one",
    input: "treeView-beta\nroot\n├── a\u2029%% c\n icon(fa:file)\n└── z\n",
    output: "treeView-beta\nroot\n├── a\u2029%% c\n    icon(fa:file)\n└── z\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-icon-ls-tab",
    input: "treeView-beta\nroot\n├── a\u2028%% c\n\ticon(fa:file)\n└── z\n",
    output: "treeView-beta\nroot\n├── a\u2028%% c\n    icon(fa:file)\n└── z\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-icon-ps-tab",
    input: "treeView-beta\nroot\n├── a\u2029%% c\n\ticon(fa:file)\n└── z\n",
    output: "treeView-beta\nroot\n├── a\u2029%% c\n    icon(fa:file)\n└── z\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-description-ls-four",
    input: "treeView-beta\nroot\n├── a\u2028%% c\n    ## detail\n└── z\n",
    output: "treeView-beta\nroot\n├── a\u2028%% c\n    ## detail\n└── z\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-description-ps-four",
    input: "treeView-beta\nroot\n├── a\u2029%% c\n    ## detail\n└── z\n",
    output: "treeView-beta\nroot\n├── a\u2029%% c\n    ## detail\n└── z\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-description-ls-one",
    input: "treeView-beta\nroot\n├── a\u2028%% c\n ## detail\n└── z\n",
    output: "treeView-beta\nroot\n├── a\u2028%% c\n    ## detail\n└── z\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-description-ps-one",
    input: "treeView-beta\nroot\n├── a\u2029%% c\n ## detail\n└── z\n",
    output: "treeView-beta\nroot\n├── a\u2029%% c\n    ## detail\n└── z\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-description-ls-tab",
    input: "treeView-beta\nroot\n├── a\u2028%% c\n\t## detail\n└── z\n",
    output: "treeView-beta\nroot\n├── a\u2028%% c\n    ## detail\n└── z\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-description-ps-tab",
    input: "treeView-beta\nroot\n├── a\u2029%% c\n\t## detail\n└── z\n",
    output: "treeView-beta\nroot\n├── a\u2029%% c\n    ## detail\n└── z\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-unbranched-root-class-ls",
    input: "treeView-beta\nroot\u2028%% c\n :::c\n└── z\n",
    output: "treeView-beta\nroot\u2028%% c\n :::c\n└── z\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-unbranched-root-icon-ps",
    input: "treeView-beta\nroot\u2029%% c\n\ticon(fa:file)\n└── z\n",
    output: "treeView-beta\nroot\u2029%% c\n icon(fa:file)\n└── z\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-unbranched-root-description-ls",
    input: "treeView-beta\nroot\u2028%% c\n    ## detail\n└── z\n",
    output: "treeView-beta\nroot\u2028%% c\n ## detail\n└── z\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-forest-class-ps",
    input: "treeView-beta\n├── a\u2029%% c\n :::c\n└── z\n",
    output: "treeView-beta\n├── a\u2029%% c\n    :::c\n└── z\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-forest-icon-ls",
    input: "treeView-beta\n├── a\u2028%% c\n\ticon(fa:file)\n└── z\n",
    output: "treeView-beta\n├── a\u2028%% c\n    icon(fa:file)\n└── z\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-forest-description-ps",
    input: "treeView-beta\n├── a\u2029%% c\n    ## detail\n└── z\n",
    output: "treeView-beta\n├── a\u2029%% c\n    ## detail\n└── z\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-quoted-class-ls",
    input: 'treeView-beta\nroot\n├── "a"\u2028%% c\n :::c\n└── z\n',
    output: 'treeView-beta\nroot\n├── "a"\u2028%% c\n :::c\n└── z\n',
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-quoted-icon-ps",
    input: 'treeView-beta\nroot\n├── "a"\u2029%% c\n\ticon(fa:file)\n└── z\n',
    output: 'treeView-beta\nroot\n├── "a"\u2029%% c\n\ticon(fa:file)\n└── z\n',
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-quoted-description-ls",
    input: 'treeView-beta\nroot\n├── "a"\u2028%% c\n    ## detail\n└── z\n',
    output: 'treeView-beta\nroot\n├── "a"\u2028%% c\n    ## detail\n└── z\n',
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-repeated-classes-ps",
    input: "treeView-beta\nroot\n├── a\u2029%% c\n :::first :::last\n└── z\n",
    output:
      "treeView-beta\nroot\n├── a\u2029%% c\n    :::first :::last\n└── z\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-directive-inline",
    input: "treeView-beta\nroot\n├── a\u2028%% c\n  %%{x}%% :::later\n└── z\n",
    output:
      "treeView-beta\nroot\n├── a\u2028%% c\n    %%{x}%% :::later\n└── z\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-protected-semicolon",
    input: "treeView-beta\nroot\n├── a\u2029%% c\n :::later;\n└── z\n",
    output: "treeView-beta\nroot\n├── a\u2029%% c\n :::later;\n└── z\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-unselected-semicolon",
    input: "treeView-beta\nroot\n├── a\u2028%% c\n :::later; x\n└── z\n",
    output: "treeView-beta\nroot\n├── a\u2028%% c\n :::later; x\n└── z\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-empty-block",
    input:
      "treeView-beta\naccDescr{}\nroot\n├── a\u2029%% c\n :::later\n└── z\n",
    output:
      "treeView-beta\naccDescr{}\nroot\n├── a\u2029%% c\n    :::later\n└── z\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-value-prefix-and-protected-row",
    input:
      'treeView-beta\nroot\n├── a\u2028%% c\n :::later;\n"one\n    └── two"\n',
    output:
      'treeView-beta\nroot\n├── a\u2028%% c\n :::later;\n"one\n    └── two"\n',
    options: {},
  },
  {
    name: "treeview/directives/review159-box-tail-joined-icon",
    input: "treeView-beta\nroot\n├── a\n└── icon(fa:x)\t%%{x}%%\n└── b\n",
    output: "treeView-beta\nroot\n├── a icon(fa:x) %%{x}%%\n└── b\n",
    options: {},
  },
  {
    name: "treeview/statements-one-per-line/review159-box-quoted-ls",
    input: 'treeView-beta\nroot\n├── "a"\u2028 "b"\n└── c\n',
    output: 'treeView-beta\nroot\n├── "a"\u2028 "b"\n└── c\n',
    options: {},
  },
  {
    name: "treeview/statements-one-per-line/review159-box-quoted-ps",
    input: 'treeView-beta\nroot\n├── "a"\u2029 "b"\n└── c\n',
    output: 'treeView-beta\nroot\n├── "a"\u2029 "b"\n└── c\n',
    options: {},
  },
  {
    name: "treeview/tabs/review159-box-multiple-value-tab-retained",
    input: 'treeView-beta\n"root" "child\tvalue"\n─\n',
    output: 'treeView-beta\n"root" "child\tvalue"\n─\n',
    options: {},
  },
  {
    name: "treeview/trailing-whitespace/review159-box-multiple-owned-tail-retained",
    input: 'treeView-beta\n"root" bare\u2028\n─\n',
    output: 'treeView-beta\n"root" bare\u2028\n─\n',
    options: {},
  },
  {
    name: "treeview/decorations/review159-sole-opener-selector-ls",
    input: "treeView-beta\naccDescr\n─\u2028\n{z}\n   title   T\nroot\n",
    output: "treeView-beta\naccDescr\n─\u2028\n{z}\ntitle T\nroot\n",
    options: {},
  },
  {
    name: "treeview/decorations/review159-sole-opener-selector-ps",
    input: "treeView-beta\naccDescr\n─\u2029\n{z}\n   title   T\nroot\n",
    output: "treeView-beta\naccDescr\n─\u2029\n{z}\ntitle T\nroot\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-line-rule-semicolon",
    input: "treeView-beta\nroot\n├── a\u2028%% c\n ## style:#x;\n└── z\n",
    output: "treeView-beta\nroot\n├── a\u2028%% c\n ## style:#x;\n└── z\n",
    options: {},
  },
  {
    name: "treeview/annotation-lines/review159-region-unprefixed-quoted-ls",
    input: 'treeView-beta\n"a"\u2028%% c\n :::c\n─\n',
    output: 'treeView-beta\n"a"\u2028%% c\n :::c\n─\n',
    options: {},
  },
  {
    name: "treeview/statements-one-per-line/review159-box-quoted-unprefixed-leading-ps",
    input: 'treeView-beta\n"a"\u2029 "b"\n─\n',
    output: 'treeView-beta\n"a"\u2029 "b"\n─\n',
    options: {},
  },
  {
    name: "treeview/statements-one-per-line/review159-split-directive-region-ls",
    input:
      'treeView-beta\nroot\n├── "a" %%{x}%%\u2028%% between\n "b"\n└── c\n',
    output:
      'treeView-beta\nroot\n├── "a"\n%%{x}%%\n└── \u2028%% between\n "b"\n    └── c\n',
    options: {},
  },
  {
    name: "treeview/statements-one-per-line/review159-split-directive-region-ps",
    input:
      'treeView-beta\nroot\n├── "a" %%{x}%%\u2029%% between\n "b"\n└── c\n',
    output:
      'treeView-beta\nroot\n├── "a"\n%%{x}%%\n└── \u2029%% between\n "b"\n    └── c\n',
    options: {},
  },
  {
    name: "treeview/statements-one-per-line/review159-split-directive-ls",
    input: 'treeView-beta\nroot\n├── "a"%%{x}%%\u2028 "b"\n└── c\n',
    output: 'treeView-beta\nroot\n├── "a"%%{x}%%\u2028 "b"\n└── c\n',
    options: {},
  },
  {
    name: "treeview/statements-one-per-line/review159-split-directive-ps",
    input: 'treeView-beta\nroot\n├── "a"%%{x}%%\u2029 "b"\n└── c\n',
    output: 'treeView-beta\nroot\n├── "a"%%{x}%%\u2029 "b"\n└── c\n',
    options: {},
  },
  {
    name: "treeview/statements-one-per-line/review159-split-directives-tab",
    input: 'treeView-beta\nroot\n├── "a" %%{x}%%\t%%{y}%% "b"\n└── c\n',
    output:
      'treeView-beta\nroot\n├── "a"\n%%{x}%%%%{y}%%\n│   └── "b"\n└── c\n',
    options: {},
  },
  {
    name: "treeview/statements-one-per-line/review159-split-directives-region-ls",
    input:
      'treeView-beta\nroot\n├── "a" %%{x}%%  %%{y}%%\u2028%% between\n "b"\n└── c\n',
    output:
      'treeView-beta\nroot\n├── "a"\n%%{x}%%%%{y}%%\n└── \u2028%% between\n "b"\n    └── c\n',
    options: {},
  },
  {
    name: "treeview/statements-one-per-line/review159-split-directives-region-ps",
    input:
      'treeView-beta\nroot\n├── "a" %%{x}%%  %%{y}%%\u2029%% between\n "b"\n└── c\n',
    output:
      'treeView-beta\nroot\n├── "a"\n%%{x}%%%%{y}%%\n└── \u2029%% between\n "b"\n    └── c\n',
    options: {},
  },
  {
    name: "treeview/statements-one-per-line/review159-split-directives-ls",
    input: 'treeView-beta\nroot\n├── "a" %%{x}%%  %%{y}%%\u2028 "b"\n└── c\n',
    output:
      'treeView-beta\nroot\n├── "a"\n%%{x}%%%%{y}%%\n└── \u2028 "b"\n    └── c\n',
    options: {},
  },
  {
    name: "treeview/statements-one-per-line/review159-split-directives-ps",
    input: 'treeView-beta\nroot\n├── "a" %%{x}%%  %%{y}%%\u2029 "b"\n└── c\n',
    output:
      'treeView-beta\nroot\n├── "a"\n%%{x}%%%%{y}%%\n└── \u2029 "b"\n    └── c\n',
    options: {},
  },
  {
    name: "treeview/comments/comment-ls-semicolon-before",
    input: 'treeView-beta\nRoot\n "A"%% c;\u2028 "B"\n Other\n',
    output: 'treeView-beta\n  Root\n    "A"%% c;\u2028 "B"\n    Other\n',
    options: {},
  },
  {
    name: "treeview/comments/comment-ps-semicolon-after",
    input: 'treeView-beta\nRoot\n "A"%% c\u2029 "B;y"\n Other\n',
    output: 'treeView-beta\n  Root\n    "A"%% c\u2029 "B;y"\n    Other\n',
    options: {},
  },
  {
    name: "treeview/comments/comment-ls-semicolon-both",
    input: 'treeView-beta\nRoot\n "A"%% c;\u2028 "B;y"\n Other\n',
    output: 'treeView-beta\n  Root\n    "A"%% c;\u2028 "B;y"\n    Other\n',
    options: {},
  },
]
