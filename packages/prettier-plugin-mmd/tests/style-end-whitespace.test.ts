/**
 * Formats a `style`, `classDef`, or `linkStyle` statement whose end is followed
 * by whitespace. Where mermaid.js keeps the character in the value of the last
 * style, so that the figure changes without it, the whitespace stays and the
 * line is printed as written: a no-break space, U+3000, a vertical tab, and a
 * byte order mark in a class diagram, a flowchart, the `classDef` of a treemap,
 * and the `classDef` and the `linkStyle` of an agentflow diagram, and a
 * vertical tab and a form feed in the `classDef` of an ER diagram. The whitespace also counts after a `;` that the line rule of
 * mermaid.js removes and after a directive, which it removes too. Elsewhere,
 * and for a space and a tab, it is left out (docs/compatibility.md, Whitespace
 * at the end of a style). The characters are written as escapes, and no fixture
 * holds them.
 */
import { describe, expect, it } from "vitest"
import { formatMermaid } from "./helpers.ts"
import { dbForFormattingComparison } from "./db-comparison.ts"
import { dbOfText, defaultEmbedded } from "./db-reading.ts"

/** The whitespace characters other than a space and a tab, with their names. */
const unusualWhitespace: readonly (readonly [string, string])[] = [
  ["a no-break space", "\u00a0"],
  ["U+3000", "\u3000"],
  ["a vertical tab", "\u000b"],
  ["a byte order mark", "\ufeff"],
]

/** A statement, as written with `@` at its end, and as printed when `@` stays. */
type Case = readonly [title: string, input: string, kept: string]

/** The statements that keep a no-break space, U+3000, a vertical tab, and a byte order mark. */
const keepsCharacters: readonly Case[] = [
  [
    "the style of a class diagram",
    "classDiagram\nclass A\nstyle A fill:red@\n",
    "classDiagram\n  class A\n  style A fill:red@\n",
  ],
  [
    "the classDef of a class diagram",
    "classDiagram\nclass A:::k\nclassDef k fill:red ,stroke:#333@\n",
    "classDiagram\n  class A:::k\n  classDef k fill:red ,stroke:#333@\n",
  ],
  [
    "the linkStyle of a flowchart",
    "flowchart LR\nA-->B\nlinkStyle 0 stroke:#f00@\n",
    "flowchart LR\n  A --> B\n  linkStyle 0 stroke:#f00@\n",
  ],
  [
    "the default linkStyle of a flowchart",
    "flowchart LR\nA-->B\nlinkStyle default stroke:#f00@\n",
    "flowchart LR\n  A --> B\n  linkStyle default stroke:#f00@\n",
  ],
  [
    "the classDef of an agentflow diagram",
    "agentflow-beta TB\nflow F\nA:::ka\nend\nclassDef ka fill:#f00@\n",
    "agentflow-beta TB\n  flow F\n    A:::ka\n  end\n  classDef ka fill:#f00@\n",
  ],
  [
    "the style of a flowchart",
    "flowchart LR\nA-->B\nstyle A fill:#f00@\n",
    "flowchart LR\n  A --> B\n  style A fill:#f00@\n",
  ],
  [
    "the classDef of a flowchart",
    "flowchart LR\nA-->B\nclassDef k fill:#f00@\n",
    "flowchart LR\n  A --> B\n  classDef k fill:#f00@\n",
  ],
  [
    "the linkStyle of an agentflow diagram",
    "agentflow-beta TB\nflow F\nA\nB\nA --> B\nend\nlinkStyle 0 stroke:#f00@\n",
    "agentflow-beta TB\n  flow F\n    A\n    B\n    A --> B\n  end\n  linkStyle 0 stroke:#f00@\n",
  ],
  [
    "the classDef of a treemap",
    'treemap\nclassDef kk fill:red@\n"A"\n',
    'treemap\n  classDef kk fill: red@\n  "A"\n',
  ],
  [
    "the classDef of a treemap, before the `;` that ends it",
    'treemap\nclassDef kk fill:#f00@;\n"A"\n',
    'treemap\n  classDef kk fill: #f00@\n  "A"\n',
  ],
]

/** The statements that keep the character after a `;` or a directive that comes first. */
const keepsCharactersAfterIgnoredText: readonly Case[] = [
  [
    "a `;` after the style of a class diagram",
    "classDiagram\nclass A\nstyle A fill:#f00;@\n",
    "classDiagram\n  class A\n  style A fill:#f00;@\n",
  ],
  [
    "a directive after the style of a class diagram",
    "classDiagram\nclass A\nstyle A fill:red %%{init: {}}%%@\n",
    "classDiagram\n  class A\n  style A fill:red %%{init: {}}%%@\n",
  ],
  [
    "a `;` after the style of a flowchart",
    "flowchart LR\nA-->B\nstyle A fill:#f00;@\n",
    "flowchart LR\n  A --> B\n  style A fill:#f00;@\n",
  ],
  [
    "a directive and a `;` after the style of a flowchart",
    "flowchart LR\nA-->B\nstyle A fill:#f00 %%{init: {}}%%;@\n",
    "flowchart LR\n  A --> B\n  style A fill:#f00 %%{init: {}}%%;@\n",
  ],
  [
    "a `;` and a directive after the classDef of an agentflow diagram",
    "agentflow-beta TB\nflow F\nA:::ka\nend\nclassDef ka fill:#f00; %%{init: {}}%%@\n",
    "agentflow-beta TB\n  flow F\n    A:::ka\n  end\n  classDef ka fill:#f00; %%{init: {}}%%@\n",
  ],
  [
    "a `;` and a directive after the classDef of a flowchart",
    "flowchart LR\nA-->B\nclassDef k fill:#f00; %%{init: {}}%%@\n",
    "flowchart LR\n  A --> B\n  classDef k fill:#f00; %%{init: {}}%%@\n",
  ],
  [
    "a directive after the linkStyle of a flowchart",
    "flowchart LR\nA-->B\nlinkStyle 0 stroke:#f00 %%{init: {}}%%@\n",
    "flowchart LR\n  A --> B\n  linkStyle 0 stroke:#f00 %%{init: {}}%%@\n",
  ],
  [
    "a `;` after the classDef of a treemap",
    'treemap\nclassDef kk fill:#f00;@\n"A"\n',
    'treemap\n  classDef kk fill:#f00;@\n  "A"\n',
  ],
]

/** The statements whose figure is the same without the character, with the line as printed. */
const dropsCharacters: readonly Case[] = [
  [
    "the style of a block diagram",
    "block-beta\nA B\nstyle A fill:#f00@\n",
    "block-beta\n  A B\n  style A fill: #f00\n",
  ],
  [
    "the classDef of a state diagram",
    "stateDiagram-v2\nA --> B\nclassDef k fill:red@\n",
    "stateDiagram-v2\n  A --> B\n  classDef k fill: red\n",
  ],
  [
    "the style of an agentflow diagram",
    "agentflow-beta TB\nflow F\nA\nend\nstyle A fill:#f00@\n",
    "agentflow-beta TB\n  flow F\n    A\n  end\n  style A fill: #f00\n",
  ],
]

describe("the whitespace at the end of a style", () => {
  it("keeps whitespace other than a space and a tab at the end of a style", async () => {
    for (const [name, character] of unusualWhitespace) {
      for (const [title, input, output] of keepsCharacters) {
        const formatted = await formatMermaid(input.replace("@", character))
        expect(formatted, `${name} at the end of ${title}`).toBe(
          output.replace("@", character),
        )
        expect(await formatMermaid(formatted), `${title} twice`).toBe(formatted)
      }
    }
  })

  it("keeps the whitespace after a `;` and after a directive that the line rule removes", async () => {
    for (const [name, character] of unusualWhitespace) {
      for (const [title, input, output] of keepsCharactersAfterIgnoredText) {
        const formatted = await formatMermaid(input.replace("@", character))
        expect(formatted, `${name} after ${title}`).toBe(
          output.replace("@", character),
        )
        expect(await formatMermaid(formatted), `${title} twice`).toBe(formatted)
      }
    }
  })

  it("keeps a vertical tab and a form feed at the end of the classDef of an ER diagram", async () => {
    for (const character of ["\u000b", "\u000c"]) {
      const formatted = await formatMermaid(
        `erDiagram\nA ||--o{ B : has\nclassDef k fill:#f00${character}\nclass A k\n`,
      )
      expect(formatted, JSON.stringify(character)).toContain(
        `\n  classDef k fill:#f00${character}\n`,
      )
      expect(await formatMermaid(formatted), JSON.stringify(character)).toBe(
        formatted,
      )
      const afterDirective = await formatMermaid(
        `erDiagram\nA ||--o{ B : has\nclassDef k fill:#f00 %%{init: {}}%%${character}\nclass A k\n`,
      )
      expect(afterDirective, JSON.stringify(character)).toContain(
        `\n  classDef k fill:#f00 %%{init: {}}%%${character}\n`,
      )
    }
  })

  it("leaves out whitespace at the end of a style that the figure does not need", async () => {
    for (const [name, character] of unusualWhitespace) {
      for (const [title, input, output] of dropsCharacters) {
        const formatted = await formatMermaid(input.replace("@", character))
        expect(formatted, `${name} at the end of ${title}`).toBe(
          output.replace("@", ""),
        )
      }
    }
    // A form feed is whitespace in CSS, so a class diagram needs no more of it
    // than a space or a tab.
    expect(
      await formatMermaid("classDiagram\nclass A\nstyle A fill:red\u000c\n"),
    ).toBe("classDiagram\n  class A\n  style A fill: red\n")
  })

  it("leaves out the spaces and tabs at the end of a style", async () => {
    for (const [title, input] of [
      ...keepsCharacters,
      ...keepsCharactersAfterIgnoredText,
      ...dropsCharacters,
    ]) {
      const formatted = await formatMermaid(input.replace("@", " \t "))
      expect(formatted, title).not.toContain(" \n")
      expect(formatted, title).not.toContain("\t\n")
      expect(await formatMermaid(formatted), `${title} twice`).toBe(formatted)
    }
  })
})

/** Fixed failures where a directive follows the end of a style. */
const directiveStyleEnds: readonly (readonly [string, string, string])[] = [
  [
    "r0007957|ends|agent-style|hex-upper|vt|semi-dir",
    "agentflow-beta TB\nflow F\nA --> B\nend\nstyle A fill:#F9F\u000b;%%{init: {}}%%\n",
    "agentflow-beta TB\n  flow F\n    A --> B\n  end\n  style A fill:#f9f ;%%{init: {}}%%\n",
  ],
  [
    "r0007962|ends|agent-style|hex-upper|vt|dir-nb",
    "agentflow-beta TB\nflow F\nA --> B\nend\nstyle A fill:#F9F\u000b%%{init: {}}%%\u00a0\n",
    "agentflow-beta TB\n  flow F\n    A --> B\n  end\n  style A fill: #f9f %%{init: {}}%%\n",
  ],
  [
    "block-before-directive-vt",
    "block-beta\nA B\nstyle A fill:#F9F\u000b;%%{init: {}}%%\n",
    "block-beta\n  A B\n  style A fill:#f9f ;%%{init: {}}%%\n",
  ],
  [
    "state-before-directive-nbsp",
    "stateDiagram-v2\nA --> B\nclassDef k fill:#F9F\u00a0%%{init: {}}%%\n",
    "stateDiagram-v2\n  A --> B\n  classDef k fill: #f9f %%{init: {}}%%\n",
  ],
  [
    "r0008005|ends|agent-style|hex-upper|bom|dir",
    "agentflow-beta TB\nflow F\nA --> B\nend\nstyle A fill:#F9F\ufeff%%{init: {}}%%\n",
    "agentflow-beta TB\n  flow F\n    A --> B\n  end\n  style A fill: #f9f %%{init: {}}%%\n",
  ],
  [
    "r0008020|ends|agent-style|hex-upper|ls|dir",
    "agentflow-beta TB\nflow F\nA --> B\nend\nstyle A fill:#F9F\u2028%%{init: {}}%%\n",
    "agentflow-beta TB\n  flow F\n    A --> B\n  end\n  style A fill: #f9f %%{init: {}}%%\n",
  ],
  [
    "r0008035|ends|agent-style|hex-upper|ps|dir",
    "agentflow-beta TB\nflow F\nA --> B\nend\nstyle A fill:#F9F\u2029%%{init: {}}%%\n",
    "agentflow-beta TB\n  flow F\n    A --> B\n  end\n  style A fill: #f9f %%{init: {}}%%\n",
  ],
  [
    "state classDef entity before a directive and an ignored semicolon with a form feed",
    "stateDiagram-v2\nA --> B\nclass A k\nclassDef k fill:#F9F;%%{init: {}}%%;\f\n",
    "stateDiagram-v2\n  A --> B\n  class A k\n  classDef k fill:#F9F;%%{init: {}}%%;\f\n",
  ],
  [
    "state classDef final entity before a directive and an ignored semicolon with a form feed",
    "stateDiagram-v2\nA --> B\nclass A k\nclassDef k fill:red,stroke:#ABC;%%{init: {}}%%;\f\n",
    "stateDiagram-v2\n  A --> B\n  class A k\n  classDef k fill:red,stroke:#ABC;%%{init: {}}%%;\f\n",
  ],
  [
    "state style entity before a directive and an ignored semicolon with a form feed",
    "stateDiagram-v2\nA --> B\nstyle A fill:red,stroke:#ABC;%%{init: {}}%%;\f\n",
    "stateDiagram-v2\n  A --> B\n  style A fill:red,stroke:#ABC;%%{init: {}}%%;\f\n",
  ],
]

describe("style ends before directives", () => {
  it.each(directiveStyleEnds)("%s", async (_name, input, output) => {
    const formatted = await formatMermaid(input)
    expect(formatted).toBe(output)
    expect(await formatMermaid(formatted)).toBe(formatted)
    const embedded = defaultEmbedded()
    const before = dbOfText(input, embedded)
    const after = dbOfText(formatted, embedded)
    expect(dbForFormattingComparison(before, after, input, formatted)).toEqual(
      before,
    )
  })

  it("does not restore a changed color before a kept non-CSS character", () => {
    const input = "flowchart LR\nA\nstyle A fill:#ABC,stroke:#F9F\u00a0 \n"
    const output =
      "flowchart LR\n  A\n  style A fill: #abc,stroke: #f9f\u00a0 \n"
    const embedded = defaultEmbedded()
    const before = dbOfText(input, embedded)
    const after = dbOfText(output, embedded)
    expect(dbForFormattingComparison(before, after, input, output)).not.toEqual(
      before,
    )
  })
})
