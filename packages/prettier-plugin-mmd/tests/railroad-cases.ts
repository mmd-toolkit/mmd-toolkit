/** Fixed escaped cases distinguish host line endings from native value text. */
import type { Options } from "prettier"

interface RailroadCase {
  readonly name: string
  readonly input: string
  readonly output: string
  readonly options: Options
}

export const railroadCases: readonly RailroadCase[] = [
  {
    name: "railroad/semicolons/ir-style-comment-before-ls",
    input: 'railroad-beta\n   r=terminal("left\u2028%% before\n     style" );',
    output:
      'railroad-beta\n  r=terminal("left\u2028%% before\n     style" );\n',
    options: {},
  },
  {
    name: "railroad/semicolons/ir-style-comment-after-ls",
    input: 'railroad-beta\n   r=terminal("style\u2028%% after\n     right" );',
    output:
      'railroad-beta\n  r=terminal("style\u2028%% after\n     right" );\n',
    options: {},
  },
  {
    name: "railroad/semicolons/ir-style-comment-both-ls",
    input:
      'railroad-beta\n   r=terminal("left\u2028%% before\n     style\u2028%% after\n       right" );',
    output:
      'railroad-beta\n  r=terminal("left\u2028%% before\n     style\u2028%% after\n       right" );\n',
    options: {},
  },
  {
    name: "railroad/semicolons/ir-classdef-comment-before-ps",
    input:
      'railroad-beta\n   r=terminal("left\u2029%% before\n     classDef" );',
    output:
      'railroad-beta\n  r=terminal("left\u2029%% before\n     classDef" );\n',
    options: {},
  },
  {
    name: "railroad/semicolons/ir-classdef-comment-after-ps",
    input:
      'railroad-beta\n   r=terminal("classDef\u2029%% after\n     right" );',
    output:
      'railroad-beta\n  r=terminal("classDef\u2029%% after\n     right" );\n',
    options: {},
  },
  {
    name: "railroad/semicolons/ir-classdef-comment-both-ps",
    input:
      'railroad-beta\n   r=terminal("left\u2029%% before\n     classDef\u2029%% after\n       right" );',
    output:
      'railroad-beta\n  r=terminal("left\u2029%% before\n     classDef\u2029%% after\n       right" );\n',
    options: {},
  },
  {
    name: "railroad/semicolons/ebnf-style-comment-before-ls",
    input: 'railroad-ebnf-beta\n   r=("left\u2028%% before\n     style" );',
    output: 'railroad-ebnf-beta\n  r=("left\u2028%% before\n     style" );\n',
    options: {},
  },
  {
    name: "railroad/semicolons/ebnf-style-comment-after-ls",
    input: 'railroad-ebnf-beta\n   r=("style\u2028%% after\n     right" );',
    output: 'railroad-ebnf-beta\n  r=("style\u2028%% after\n     right" );\n',
    options: {},
  },
  {
    name: "railroad/semicolons/ebnf-style-comment-both-ls",
    input:
      'railroad-ebnf-beta\n   r=("left\u2028%% before\n     style\u2028%% after\n       right" );',
    output:
      'railroad-ebnf-beta\n  r=("left\u2028%% before\n     style\u2028%% after\n       right" );\n',
    options: {},
  },
  {
    name: "railroad/semicolons/ebnf-classdef-comment-before-ps",
    input: 'railroad-ebnf-beta\n   r=("left\u2029%% before\n     classDef" );',
    output:
      'railroad-ebnf-beta\n  r=("left\u2029%% before\n     classDef" );\n',
    options: {},
  },
  {
    name: "railroad/semicolons/ebnf-classdef-comment-after-ps",
    input: 'railroad-ebnf-beta\n   r=("classDef\u2029%% after\n     right" );',
    output:
      'railroad-ebnf-beta\n  r=("classDef\u2029%% after\n     right" );\n',
    options: {},
  },
  {
    name: "railroad/semicolons/ebnf-classdef-comment-both-ps",
    input:
      'railroad-ebnf-beta\n   r=("left\u2029%% before\n     classDef\u2029%% after\n       right" );',
    output:
      'railroad-ebnf-beta\n  r=("left\u2029%% before\n     classDef\u2029%% after\n       right" );\n',
    options: {},
  },
  {
    name: "railroad/semicolons/abnf-style-comment-before-ls",
    input: 'railroad-abnf-beta\n   r=("left\u2028%% before\n     style" );',
    output: 'railroad-abnf-beta\n  r=("left\u2028%% before\n     style" );\n',
    options: {},
  },
  {
    name: "railroad/semicolons/abnf-style-comment-after-ls",
    input: 'railroad-abnf-beta\n   r=("style\u2028%% after\n     right" );',
    output: 'railroad-abnf-beta\n  r=("style\u2028%% after\n     right" );\n',
    options: {},
  },
  {
    name: "railroad/semicolons/abnf-style-comment-both-ls",
    input:
      'railroad-abnf-beta\n   r=("left\u2028%% before\n     style\u2028%% after\n       right" );',
    output:
      'railroad-abnf-beta\n  r=("left\u2028%% before\n     style\u2028%% after\n       right" );\n',
    options: {},
  },
  {
    name: "railroad/semicolons/abnf-classdef-comment-before-ps",
    input: 'railroad-abnf-beta\n   r=("left\u2029%% before\n     classDef" );',
    output:
      'railroad-abnf-beta\n  r=("left\u2029%% before\n     classDef" );\n',
    options: {},
  },
  {
    name: "railroad/semicolons/abnf-classdef-comment-after-ps",
    input: 'railroad-abnf-beta\n   r=("classDef\u2029%% after\n     right" );',
    output:
      'railroad-abnf-beta\n  r=("classDef\u2029%% after\n     right" );\n',
    options: {},
  },
  {
    name: "railroad/semicolons/abnf-classdef-comment-both-ps",
    input:
      'railroad-abnf-beta\n   r=("left\u2029%% before\n     classDef\u2029%% after\n       right" );',
    output:
      'railroad-abnf-beta\n  r=("left\u2029%% before\n     classDef\u2029%% after\n       right" );\n',
    options: {},
  },
  {
    name: "railroad/semicolons/peg-style-comment-before-ls",
    input: 'railroad-peg-beta\n   r<-("left\u2028%% before\n     style" );',
    output: 'railroad-peg-beta\n  r<-("left\u2028%% before\n     style" );\n',
    options: {},
  },
  {
    name: "railroad/semicolons/peg-style-comment-after-ls",
    input: 'railroad-peg-beta\n   r<-("style\u2028%% after\n     right" );',
    output: 'railroad-peg-beta\n  r<-("style\u2028%% after\n     right" );\n',
    options: {},
  },
  {
    name: "railroad/semicolons/peg-style-comment-both-ls",
    input:
      'railroad-peg-beta\n   r<-("left\u2028%% before\n     style\u2028%% after\n       right" );',
    output:
      'railroad-peg-beta\n  r<-("left\u2028%% before\n     style\u2028%% after\n       right" );\n',
    options: {},
  },
  {
    name: "railroad/semicolons/peg-classdef-comment-before-ps",
    input: 'railroad-peg-beta\n   r<-("left\u2029%% before\n     classDef" );',
    output:
      'railroad-peg-beta\n  r<-("left\u2029%% before\n     classDef" );\n',
    options: {},
  },
  {
    name: "railroad/semicolons/peg-classdef-comment-after-ps",
    input: 'railroad-peg-beta\n   r<-("classDef\u2029%% after\n     right" );',
    output:
      'railroad-peg-beta\n  r<-("classDef\u2029%% after\n     right" );\n',
    options: {},
  },
  {
    name: "railroad/semicolons/peg-classdef-comment-both-ps",
    input:
      'railroad-peg-beta\n   r<-("left\u2029%% before\n     classDef\u2029%% after\n       right" );',
    output:
      'railroad-peg-beta\n  r<-("left\u2029%% before\n     classDef\u2029%% after\n       right" );\n',
    options: {},
  },
  {
    name: "railroad/semicolons/ir-style-tab",
    input: 'railroad-beta\nstyle=terminal(":"\t)/*#*/;',
    output: 'railroad-beta\n  style=terminal(":"\t)/*#*/;\n',
    options: {},
  },
  {
    name: "railroad/line-terminators-and-unicode/ir-cr",
    input: 'railroad-beta\rr=terminal("cr\r\n continuation");\r',
    output: 'railroad-beta\n  r = terminal("cr\n continuation");\n',
    options: {},
  },
  {
    name: "railroad/line-terminators-and-unicode/ebnf-crlf",
    input: "railroad-ebnf-beta\r\nr=? cr\r\n continuation ?;\r\n",
    output: "railroad-ebnf-beta\n  r = ? cr\n continuation ?;\n",
    options: {},
  },
  {
    name: "railroad/line-terminators-and-unicode/abnf-crlf",
    input: 'railroad-abnf-beta\r\nr="cr\r continuation";\r\n',
    output: 'railroad-abnf-beta\n  r = "cr\n continuation";\n',
    options: {},
  },
  {
    name: "railroad/line-terminators-and-unicode/peg-cr",
    input: 'railroad-peg-beta\rr<-"cr\r\n continuation";\r',
    output: 'railroad-peg-beta\n  r <- "cr\n continuation";\n',
    options: {},
  },
  {
    name: "railroad/line-terminators-and-unicode/ir-content",
    input:
      'railroad-beta\nr=terminal("a\u2028b\u2029c\u00a0d\ufeff");%%tail\u2028owned',
    output:
      'railroad-beta\n  r = terminal("a\u2028b\u2029c\u00a0d\ufeff");%%tail\u2028owned\n',
    options: {},
  },
  {
    name: "railroad/line-terminators-and-unicode/ebnf-content",
    input: "railroad-ebnf-beta\nr=?a\u2028b\u2029c\u00a0d\ufeff?;",
    output: "railroad-ebnf-beta\n  r = ?a\u2028b\u2029c\u00a0d\ufeff?;\n",
    options: {},
  },
  {
    name: "railroad/line-terminators-and-unicode/abnf-content",
    input: 'railroad-abnf-beta\nr="a\u2028b\u2029c";\n;tail\u2028owned',
    output:
      'railroad-abnf-beta\n  r = "a\u2028b\u2029c";\n  ;tail\u2028owned\n',
    options: {},
  },
  {
    name: "railroad/line-terminators-and-unicode/peg-content",
    input: 'railroad-peg-beta\nr<-"a\u2028b\u2029c";#tail\u2029owned',
    output: 'railroad-peg-beta\n  r <- "a\u2028b\u2029c";#tail\u2029owned\n',
    options: {},
  },
  {
    name: "railroad/line-terminators-and-unicode/ir-output-crlf",
    input: 'railroad-beta\nr=terminal("output CRLF");',
    output: 'railroad-beta\r\n  r = terminal("output CRLF");\r\n',
    options: { endOfLine: "crlf" },
  },
  {
    name: "railroad/line-terminators-and-unicode/ebnf-output-cr",
    input: 'railroad-ebnf-beta\nr="output CR";',
    output: 'railroad-ebnf-beta\r  r = "output CR";\r',
    options: { endOfLine: "cr" },
  },
  {
    name: "railroad/line-terminators-and-unicode/abnf-output-crlf",
    input: 'railroad-abnf-beta\nr="output CRLF";',
    output: 'railroad-abnf-beta\r\n  r = "output CRLF";\r\n',
    options: { endOfLine: "crlf" },
  },
  {
    name: "railroad/line-terminators-and-unicode/peg-output-cr",
    input: 'railroad-peg-beta\nr<-"output CR";',
    output: 'railroad-peg-beta\r  r <- "output CR";\r',
    options: { endOfLine: "cr" },
  },
  {
    name: "railroad/line-terminators-and-unicode/ir-leading-bom",
    input: '\ufeffrailroad-beta\nr=terminal("bom");',
    output: '\ufeffrailroad-beta\n  r = terminal("bom");\n',
    options: {},
  },
  {
    name: "railroad/line-terminators-and-unicode/ebnf-leading-bom",
    input: '\ufeffrailroad-ebnf-beta\nr="bom";',
    output: '\ufeffrailroad-ebnf-beta\n  r = "bom";\n',
    options: {},
  },
  {
    name: "railroad/line-terminators-and-unicode/abnf-leading-bom",
    input: '\ufeffrailroad-abnf-beta\nr="bom";',
    output: '\ufeffrailroad-abnf-beta\n  r = "bom";\n',
    options: {},
  },
  {
    name: "railroad/line-terminators-and-unicode/peg-leading-bom",
    input: '\ufeffrailroad-peg-beta\nr<-"bom";',
    output: '\ufeffrailroad-peg-beta\n  r <- "bom";\n',
    options: {},
  },
  {
    name: "railroad/line-terminators-and-unicode/ir-common-edges",
    input:
      'railroad-beta\ntitle \u00a0Topic\u3000\naccTitle: \u2028Access\u2029\naccDescr\u2028{ \u00a0}\nr=terminal("unicode edges");',
    output:
      'railroad-beta\n  title Topic\n  accTitle: Access\n  accDescr {}\n  r = terminal("unicode edges");\n',
    options: {},
  },
  {
    name: "railroad/line-terminators-and-unicode/ebnf-common-edges",
    input:
      'railroad-ebnf-beta\ntitle \u00a0Topic\u3000\naccTitle: \u2028Access\u2029\naccDescr\u2028{ \u00a0}\nr="unicode edges";',
    output:
      'railroad-ebnf-beta\n  title Topic\n  accTitle: Access\n  accDescr {}\n  r = "unicode edges";\n',
    options: {},
  },
  {
    name: "railroad/line-terminators-and-unicode/abnf-common-edges",
    input:
      'railroad-abnf-beta\ntitle \u00a0Topic\u3000\naccTitle: \u2028Access\u2029\naccDescr\u2028{ \u00a0}\nr="unicode edges";',
    output:
      'railroad-abnf-beta\n  title Topic\n  accTitle: Access\n  accDescr {}\n  r = "unicode edges";\n',
    options: {},
  },
  {
    name: "railroad/line-terminators-and-unicode/peg-common-edges",
    input:
      'railroad-peg-beta\ntitle \u00a0Topic\u3000\naccTitle: \u2028Access\u2029\naccDescr\u2028{ \u00a0}\nr<-"unicode edges";',
    output:
      'railroad-peg-beta\n  title Topic\n  accTitle: Access\n  accDescr {}\n  r <- "unicode edges";\n',
    options: {},
  },
  {
    name: "railroad/specified-readings/ir-bare-trivia",
    input: '%%\n\u2028railroad-beta\nr=terminal("passed trivia");',
    output: '%%\nrailroad-beta\n  r = terminal("passed trivia");\n',
    options: {},
  },
  {
    name: "railroad/specified-readings/ebnf-bare-trivia",
    input: '%%\n\u2028railroad-ebnf-beta\nr="passed trivia";',
    output: '%%\nrailroad-ebnf-beta\n  r = "passed trivia";\n',
    options: {},
  },
  {
    name: "railroad/specified-readings/abnf-bare-trivia",
    input: '%%\n\u2028railroad-abnf-beta\nr="passed trivia";',
    output: '%%\nrailroad-abnf-beta\n  r = "passed trivia";\n',
    options: {},
  },
  {
    name: "railroad/specified-readings/peg-bare-trivia",
    input: '%%\n\u2028railroad-peg-beta\nr<-"passed trivia";',
    output: '%%\nrailroad-peg-beta\n  r <- "passed trivia";\n',
    options: {},
  },
]
