/**
 * Formats lines that end with a `;` after a comment, or with a `;` that the
 * line rule ignores, and whitespace after it or none. The line rule ignores
 * the last `;` of a line that matches the `style` rule, and a diagram
 * comment ends before such a `;` when no characters of the comment follow
 * it: with whitespace after it, the `;` lies inside the comment, and
 * without it, it is a token of its own. A second formatting must give the
 * first one's text back whichever it is (ast.md, Comment).
 */
import type { GeneratedInput } from "../generated.ts"

/** The lines of each diagram type that can hold a comment and a `;`. */
const linesByHeader: readonly (readonly [string, readonly string[]])[] = [
  [
    "sequenceDiagram",
    [
      "A->>B: x #style:#x",
      "A->>B: x # c",
      "A->>B: x %% style:#x",
      "loop style:#x",
      "participant A #style:#x",
      "Note over A: x #style:#x",
      "title: x #style:#x",
    ],
  ],
  [
    "stateDiagram-v2",
    ["A --> B # style:#x", "A --> B : x # style:#x", "A --> B %% style:#x"],
  ],
  [
    "classDiagram",
    ["A --> B : style:#x", "class A # style:#x", "A --> B %% style:#x"],
  ],
  [
    "flowchart LR",
    ["A-->B %% style:#x", "A[style:#x]", "A-->B # style:#x", "style A fill:#x"],
  ],
]

/** What can follow the text of the line. */
const endings: readonly string[] = [
  ";",
  "; ",
  ";\t",
  " ;",
  " ; ",
  ";;",
  ";; ",
  "; # c",
  ";%% c",
  "",
]

/** Every line with every ending, alone and followed by another statement. */
export function* makeInputs(): Generator<GeneratedInput> {
  for (const [header, lines] of linesByHeader) {
    for (const line of lines) {
      for (const ending of endings) {
        yield { text: `${header}\n${line}${ending}\n`, options: {} }
        yield { text: `${header}\n${line}${ending}\nA\n`, options: {} }
      }
    }
  }
}
