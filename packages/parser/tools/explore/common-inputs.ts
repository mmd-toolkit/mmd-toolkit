/**
 * Deterministic generator of inputs that exercise the diagram-independent
 * pipeline: frontmatter, directives, comments, line terminators, and the
 * header of every diagram type of mermaid.js 12.0.0.
 *
 * Used by `common-invariants.test.ts` (tree invariants) and by
 * `common-mermaid.test.ts` (comparison with mermaid.js through the tests
 * package's differential framework, `generatedInputs` and `compareAll`).
 */

const headers = [
  "flowchart LR",
  "graph TD",
  "graph",
  "flowchart-elk TD",
  "swimlane-beta LR",
  "sequenceDiagram",
  "classDiagram",
  "stateDiagram-v2",
  "erDiagram",
  "gantt",
  "pie",
  "journey",
  "gitGraph",
  "mindmap",
  "timeline",
  "info",
  "quadrantChart",
  "requirementDiagram",
  "C4Context",
  "sankey-beta",
  "xychart-beta",
  "block-beta",
  "packet-beta",
  "kanban",
  "architecture-beta",
  "radar-beta",
  "treemap",
  "venn-beta",
  "ishikawa",
  "wardley-beta",
  "cynefin-beta",
  "usecase-beta",
  "treeView-beta",
  "eventmodeling",
  "railroad-beta",
  "agentflow-beta",
  "error",
  "ERROR",
  "---",
  "graphic",
  "flowchartx",
  "unknownDiagram",
  "",
  "  ",
  "C4Container",
  "ishi\u212Aawa",
  "i\u017Fhikawa",
  "ishikawa\u017F",
  "RAILROAD-BETA",
  "\uD83D\uDE00",
]

const bodies = [
  "",
  "\n  A --> B",
  "\n  A[C4Container] --> B",
  "\n  x",
  "\n%%\n",
  "\n  A-->B %% trailing",
  "\u2028%% c",
  "\u2029%% c",
  "\n  A[\uD83D\uDE00] --> B",
  '\n  A[<a href="u">t</a>] --> B',
  '\n  A[<b]\n%% >\n  B[c="d">e]',
  "\n\uD83D",
  "\n\uDE00 %% x",
]

const frontmatters = [
  "",
  "---\ntitle: T\n---\n",
  "---\ntitle: [x\n---\n",
  "---\n---\n",
  "---\n\n---\n",
  "  ---\n  a: 1\n  ---\n",
  "---\na: 1\n---",
  "---\ndisplayMode: compact\nconfig: 5\n---\n",
  "---\nconfig:\n  theme: dark\n---\n\n\n",
  "----\na: 1\n----\n",
  "---\r\ntitle: x\r\n---\r\n",
  "---\rtitle: x\r---\r",
  "---\ntitle: \uD83D\uDE00\n---\n",
  "---\ntitle: <a\n---\n",
  "\n---\r\n%% c\n\n---\n",
  "---\r\n\r\n---\r\n",
  "\u2028---\na: 1\n\u2028---\n",
  "---\u2029\na: 1\n---\n",
]

const prefixes = [
  "",
  "%% comment\n",
  "  %% indented\n",
  '%%{init: {"theme":"dark"}}%%\n',
  "%%{init: {bad}}%%\n",
  "%%{init}%%\n",
  "%%{wrap}%%\n",
  "%%{init: {}}\n",
  "\n\n",
  "\uFEFF",
  "%%\n",
  "%%{ }%%\n",
  "%%{init: 'x'}%%\n",
  "%%{init: {}}%%%% note\n",
  "%% a %%{init: {}}%% b\n",
  "\r\n",
  "\t \n",
  "%%{init: {}}%%%%{init: {}}%%\n",
  "%%{init: 5}%%\n",
  "%%{init: true}%%\n",
  '%%{init: "x"}%%\n',
  "%%{init: [1]}%%\n",
  "%%{init: 0}%%\n",
  "%%{wrapper}%%\n",
  "%%{nowrap}%%\n",
  "%%{wrap: {bad}}%%\n",
  "%%{wrap: {}}%%\n",
  "%%{initialize: 'y'}%%\n",
  "%%{INIT: 'x'}%%\n",
  "%%{init:\n{}\n}%%\n",
  "%%{init: {'theme': 'dark'}}%%\n",
  "x %%{init: {}}%% y\n",
  '%% <a href="x">\n',
  "%% <a\n",
  '%%{init: {"x": "<a"}}%%\n',
  "%%\r",
  "  %%{init: {}}%%   %% after\n",
  "%%%{a}%%%\n",
  "%%{\n",
  "wrap\n",
  '%%{init: {"config": {}}}%%\n',
  "\u00A0\n",
  "\u2028",
  "%%x\r\n",
  "%% c\r\n\r\n",
  "\u2028  %% c\n",
  "\u2029",
  "%% \uD83D\uDE00\n",
  "%%{init: {'theme':'dark'}\u2028}%%\n",
  "%%{init: {'theme':'dark'}\u2029}%%\n",
  "\uD83D",
  "\uDE00\n",
  "%%{init: '\uD83D\uDE00'}%%\n",
]

const suffixes = [
  "\n%%{init: 'z'}%%",
  "\n%%{wrap}%%",
  "%%{init",
  "",
  "\n",
  "\n%% end",
  "\n%% end\n",
  "   \n\n",
  "\r\n",
  "\n%%{init: {}}%%",
  "\n---\n",
  "\u2029%% end",
  "\uD83D\uDE00",
  "\n%% \uDE00",
]

/** Boundary cases found in review, always included. */
const fixed = [
  "%%%{init: {}}%%% c\nerror",
  "%%{init: {}}%%%% c\nerror",
  "\uFEFF---\ntitle: x\n\uFEFF---\nerror",
  "\uFEFF---\ntitle: x\n---\nerror",
  "\n---\ntitle: T\n---\nflowchart LR\nA-->B\n",
  "%%{init: {'theme':\r'dark'}}%%\nerror",
  "error\nA-->B %%{init:\n{}}%% %% c",
  "%%{init: dark foo}%%\nerror",
  "error %% x\n",
  "error %% x",
  "error\u2028%% c",
  "error %% c",
  "%%{init: {'theme':'dark'}\u2028}%%\nerror",
  "ishi\u212Aawa",
  "ishikawa\u017F",
  "error\n\uD83D\uDE00 %% x\n",
  "\n---\r\n%% c\n\n---\nerror\n",
  "error\u2028  %% c",
  "x\u2028 style A:#f;",
  "-%%{x}%%--\n%% c\n---\nerror\n",
  "%%%{a}%%%\nerror\n",
  // HTML tags on a comment line, in the frontmatter, and in a directive
  // argument.
  '%% <a b="c">\nerror',
  '---\ntitle: <a\n---\n%% b="c">\nerror\n',
  // The same tag before a text with no diagram type: both reject.
  '---\ntitle: <a\n---\nhello b="c">\n',
  'error\n%%{init: {"x": "<a b=\\"c\\">"}}%%\n',
  // A directive inside a word: detection reads the text without it.
  "err%%{init: {}}%%or",
  "error %%%%{wrap}%%{x}%%",
  // A directive inside a unit that may not have one: a keyword, a string,
  // an arrow.
  "flow%%{init: {}}%%chart LR\nA-->B",
  'flowchart LR\nA["a %%{init: {}}%% b"]',
  "flowchart LR\nA--%%{init: {}}%%>B",
]

/**
 * A small seeded pseudo-random generator (mulberry32) returning numbers in
 * [0, 1). A plain linear congruential generator taken modulo a small number
 * repeats patterns in its low bits, which left some combinations of parts
 * out entirely.
 */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000
  }
}

/**
 * Returns `count` random inputs (duplicates removed) plus the fixed cases.
 * The same seed always gives the same inputs.
 */
export function generateCommonInputs(seed: number, count: number): string[] {
  const random = mulberry32(seed)

  /** Returns a pseudo-random element of `items`. */
  function pick<T>(items: readonly T[]): T {
    return items[Math.floor(random() * items.length)]
  }

  const inputs = new Set(fixed)
  for (let i = 0; i < count; i++) {
    inputs.add(
      pick(frontmatters) +
        pick(prefixes) +
        pick(prefixes) +
        pick(headers) +
        pick(bodies) +
        pick(suffixes),
    )
  }
  return [...inputs]
}

/** Seeds used in CI and in the recorded comparison with mermaid.js. */
export const commonSeeds: readonly number[] = [1, 2, 3]
