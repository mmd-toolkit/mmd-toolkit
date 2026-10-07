import { describe, expect, expectTypeOf, it } from "vitest"
import {
  detectDiagramType,
  extractFrontmatterTitle,
  mermaidVersion,
  resolveEmbeddedData,
  runMermaid,
} from "../src/mermaid.ts"
import type { RunMermaidOptions } from "../src/mermaid.ts"
import type { RUN_MERMAID_OPTION_KEYS } from "../src/run-mermaid-options.ts"
import type { MermaidConfig } from "../src/types.ts"
import { errorName, isEnvironmentFailure } from "../src/rejections.ts"

/**
 * Returns the vertices of an accepted flowchart summary.
 */
function vertices(outcome: Awaited<ReturnType<typeof runMermaid>>): {
  id: string
  text?: string
  classes?: string[]
}[] {
  if (!outcome.accepted || !outcome.db)
    throw new Error("expected an accepted flowchart")
  return outcome.db.vertices as never
}

/**
 * Returns the subgraphs of an accepted flowchart summary.
 */
function subgraphs(
  outcome: Awaited<ReturnType<typeof runMermaid>>,
): { id: string; dir?: string }[] {
  if (!outcome.accepted || !outcome.db)
    throw new Error("expected an accepted flowchart")
  return outcome.db.subgraphs as never
}

describe("runMermaid", () => {
  it("uses the pinned mermaid", () => {
    expect(mermaidVersion).toBe("12.0.0")
  })

  it("reaches mermaid's own DOMPurify instance, so labels are kept unsanitized", async () => {
    // Without the patch, mermaid throws `DOMPurify.addHook is not a function`
    // on any label; with a working DOMPurify, `&` would become `&amp;` and the
    // onclick attribute would be dropped.
    const outcome = await runMermaid(
      'flowchart LR\n  A["a & <b onclick=x>b</b>"] --> B\n',
    )
    expect(outcome.accepted).toBe(true)
    expect(vertices(outcome)[0].text).toBe("a & <b onclick=x>b</b>")
  })

  it("records click link URLs as written, not as sanitize-url returns them", async () => {
    const outcome = await runMermaid(
      'flowchart LR\n  A --> B\n  click A "javascript:alert(1)"\n  click B " https://example.com "\n',
    )
    expect(
      (vertices(outcome) as { link?: string }[]).map((vertex) => vertex.link),
      // eslint-disable-next-line no-script-url -- the URL is data under test, never navigated to
    ).toEqual(["javascript:alert(1)", "https://example.com"])
  })

  it("does not carry configuration over from the previous call", async () => {
    const text = "flowchart LR\n  subgraph S\n    A\n  end\n"
    const inherited = await runMermaid(text, {
      config: { flowchart: { inheritDir: true } },
    })
    const plain = await runMermaid(text)
    expect(subgraphs(inherited)[0]?.dir).toBe("LR")
    expect(subgraphs(plain)[0]?.dir).toBeUndefined()
  })

  it("summarizes a click callback the same under any securityLevel", async () => {
    const text = "flowchart TD\n  A\n  click A callback\n"
    const loose = await runMermaid(text, { config: { securityLevel: "loose" } })
    const strict = await runMermaid(text)
    expect(loose).toEqual(strict)
    expect(vertices(strict)[0]?.classes).toEqual(["clickable"])
  })

  it("records the calls that bind a click callback, as the Db receives them, whatever the securityLevel", async () => {
    const text =
      "flowchart TD\n  A\n  click A,Z call cb( x , y )\n  click A other\n  click A call none()\n"
    const calls = [
      { id: "A", name: "cb", args: " x , y " },
      { id: "Z", name: "cb", args: " x , y " },
      { id: "A", name: "other", args: null },
      { id: "A", name: "none", args: null },
    ]
    const strict: RunMermaidOptions = {}
    const loose: RunMermaidOptions = { config: { securityLevel: "loose" } }
    for (const options of [strict, loose]) {
      const outcome = await runMermaid(text, options)
      expect(outcome).toMatchObject({ accepted: true })
      if (!outcome.accepted) throw new Error("expected accepted")
      // One entry for each call: a Db is made for each parse, and each
      // keeps its own calls.
      expect(outcome.db?.clickCalls).toEqual(calls)
    }
  })

  it("records the calls of a class click callback, also for a name that is no class", async () => {
    const outcome = await runMermaid(
      'classDiagram\n  class A\n  click A call cb( "a b" ,\tc )\n  click Z call other()\n',
    )
    expect(outcome).toMatchObject({ accepted: true })
    if (!outcome.accepted) throw new Error("expected accepted")
    expect(outcome.db?.clickCalls).toEqual([
      { id: "A", name: "cb", args: ' "a b" ,\tc ' },
      { id: "Z", name: "other", args: null },
    ])
  })

  it("has no field of click calls when the text binds none", async () => {
    const outcome = await runMermaid('flowchart TD\n  A\n  click A href "u"\n')
    expect(outcome).toMatchObject({ accepted: true })
    if (!outcome.accepted) throw new Error("expected accepted")
    expect(outcome.db).not.toHaveProperty("clickCalls")
  })

  it("is not affected by a directive that made the previous call fail", async () => {
    const failing =
      '%%{init: {"theme": "base", "themeVariables": {"primaryColor": "##00ff00"}}}%%\nflowchart LR\nA-->B\n'
    expect(await runMermaid(failing)).toMatchObject({ accepted: false })
    expect(await runMermaid("flowchart LR\nA-->B\n")).toMatchObject({
      accepted: true,
    })
  })

  it("serializes concurrent calls", async () => {
    const outcomes = await Promise.all(
      ["A", "B", "C"].map((id) =>
        runMermaid(`flowchart LR\n  ${id}1 --> ${id}2\n`),
      ),
    )
    expect(
      outcomes.map((outcome) => vertices(outcome).map((v) => v.id)),
    ).toEqual([
      ["A1", "A2"],
      ["B1", "B2"],
      ["C1", "C2"],
    ])
  })

  it("changes label text only under a securityLevel that is not one of mermaid's values", async () => {
    const text = 'flowchart TD\n  A["a & <b onclick=x>b</b> = c<br>d"]\n'
    const written = "a & <b onclick=x>b</b> = c<br>d"
    for (const securityLevel of ["strict", "loose", "antiscript", "sandbox"]) {
      const outcome = await runMermaid(text, { config: { securityLevel } })
      expect(vertices(outcome)[0]?.text, securityLevel).toBe(written)
    }
    const other = await runMermaid(text, { config: { securityLevel: "other" } })
    expect(vertices(other)[0]?.text).toBe(
      "a & &lt;b onclick&equals;x&gt;b&lt;/b&gt; &equals; c<br/>d",
    )
    const withoutHtmlLabels = await runMermaid(text, {
      config: { securityLevel: "other", flowchart: { htmlLabels: false } },
    })
    expect(vertices(withoutHtmlLabels)[0]?.text).toBe(written)
  })

  it("lets an error of the site configuration through, not as a rejection", async () => {
    await expect(
      runMermaid("flowchart LR\nA-->B\n", {
        config: {
          theme: "base",
          themeVariables: { primaryColor: "##00ff00" },
        },
      }),
    ).rejects.toThrow("Unsupported color format")
    // The failed call leaves nothing behind for the next one.
    expect(await runMermaid("flowchart LR\nA-->B\n")).toMatchObject({
      accepted: true,
    })
  })

  it("reports rejections with mermaid's error", async () => {
    const outcome = await runMermaid("not a diagram\n")
    expect(outcome).toMatchObject({
      accepted: false,
      error: { name: "UnknownDiagramError" },
    })
  })

  it("returns db null for a diagram type without a normalizer", async () => {
    expect(await runMermaid('pie\n  "a": 1\n')).toEqual({
      accepted: true,
      diagramType: "pie",
      db: null,
    })
  })
})

describe("rejection classification", () => {
  it("records every error mermaid throws for an input as a rejection", async () => {
    const cases: [string, string][] = [
      ["flowchart LR\n  A -->\n", "Error"],
      ["not a diagram\n", "UnknownDiagramError"],
      ["---\ntitle: [x\n---\nflowchart LR\n  A\n", "YAMLException"],
      ["pie\n  x\n", "MermaidParseError"],
      // An init directive that is not an object: preprocess assigns to it.
      ["%%{init: 5}%%\n%%{wrap}%%\nflowchart LR\n  A-->B\n", "TypeError"],
      // A document mentioning browser words is still judged by its error.
      ["flowchart LR\n  window -->\n", "Error"],
    ]
    for (const [text, name] of cases) {
      expect(await runMermaid(text)).toMatchObject({
        accepted: false,
        error: { name },
      })
    }
  })

  it("names subclasses of Error that keep the name Error by their class", () => {
    class MermaidParseError extends Error {}
    expect(errorName(new MermaidParseError("x"))).toBe("MermaidParseError")
    expect(errorName(new Error("x"))).toBe("Error")
    const yaml = new Error("x")
    yaml.name = "YAMLException"
    expect(errorName(yaml)).toBe("YAMLException")
  })

  it("stops on errors that show a browser feature is missing", () => {
    expect(
      isEnvironmentFailure(
        new TypeError("DOMPurify.addHook is not a function"),
      ),
    ).toBe(true)
    expect(
      isEnvironmentFailure(new ReferenceError("document is not defined")),
    ).toBe(true)
    expect(
      isEnvironmentFailure(new ReferenceError("Option is not defined")),
    ).toBe(true)
    // Any ReferenceError: only an undefined global throws it.
    expect(isEnvironmentFailure(new ReferenceError("foo is not defined"))).toBe(
      true,
    )
    expect(
      isEnvironmentFailure(
        new TypeError("Cannot create property 'wrap' on string '5'"),
      ),
    ).toBe(false)
    // Standard rejections quote the input, which may contain any word.
    expect(isEnvironmentFailure(new Error("Parse error near 'document'"))).toBe(
      false,
    )
  })
})

describe("extractFrontmatterTitle", () => {
  it("mirrors mermaid's frontmatter handling", () => {
    expect(extractFrontmatterTitle("---\ntitle: Hi\n---\nflowchart\n")).toBe(
      "Hi",
    )
    expect(
      extractFrontmatterTitle("  ---\n  title: Hi\n  ---\nflowchart\n"),
    ).toBe("Hi")
    expect(
      extractFrontmatterTitle("---\r\ntitle: Hi\r\n---\r\nflowchart\r\n"),
    ).toBe("Hi")
    expect(extractFrontmatterTitle("---\ntitle: 12\n---\nflowchart\n")).toBe(
      "12",
    )
    expect(
      extractFrontmatterTitle('---\ntitle: ""\n---\nflowchart\n'),
    ).toBeUndefined()
    expect(
      extractFrontmatterTitle("---\n- a\n---\nflowchart\n"),
    ).toBeUndefined()
    expect(extractFrontmatterTitle("flowchart\n")).toBeUndefined()
  })
})

describe("resolveEmbeddedData", () => {
  const body = "flowchart LR\n  subgraph S\n    A\n  end\n"

  /** Returns `flowchart.inheritDir` of resolved embedded values. */
  function inheritDir(
    embedded: Awaited<ReturnType<typeof resolveEmbeddedData>>,
  ): unknown {
    return (embedded?.config.flowchart as { inheritDir?: unknown } | undefined)
      ?.inheritDir
  }

  it("merges site configuration, frontmatter config and directives as mermaid does", async () => {
    const site = await resolveEmbeddedData(body, {
      config: { securityLevel: "loose" },
    })
    expect(site?.config.securityLevel).toBe("loose")
    const frontmatter = await resolveEmbeddedData(
      `---\ntitle: T\nconfig:\n  flowchart:\n    inheritDir: true\n---\n${body}`,
    )
    expect(inheritDir(frontmatter)).toBe(true)
    expect(frontmatter?.title).toBe("T")
    const directive = await resolveEmbeddedData(
      `%%{init: {"flowchart": {"inheritDir": true}}}%%\n${body}`,
    )
    expect(inheritDir(directive)).toBe(true)
  })

  it("does not carry values over from the previous call", async () => {
    const plain = await resolveEmbeddedData(body)
    expect(inheritDir(plain)).toBe(false)
    expect(plain?.config.securityLevel).toBe("strict")
    expect(plain?.title).toBeUndefined()
  })

  it("returns undefined when mermaid rejects the text", async () => {
    expect(await resolveEmbeddedData("flowchart LR\n  A -->\n")).toBeUndefined()
    expect(
      await resolveEmbeddedData("---\ntitle: [x\n---\nflowchart LR\n  A\n"),
    ).toBeUndefined()
  })
})

describe("data block effects", () => {
  /** Returns the data block effects mermaid records for `text`. */
  async function effects(text: string): Promise<unknown> {
    return (await resolveEmbeddedData(text))?.dataBlockEffects
  }

  it("records what each block changed, in the order mermaid applied them", async () => {
    expect(
      await effects(
        "flowchart LR\n  A[(x)]@{ label: y }\n  A@{ shape: rect }\n  B@{ }\n",
      ),
    ).toEqual([
      { id: "A", set: { labelType: "markdown", text: "y" } },
      { id: "A", set: { type: "rect" } },
      { id: "B", set: {} },
    ])
  })

  it("leaves out what the syntax around the block set", async () => {
    expect(
      await effects("flowchart LR\n  A@{ shape: rect }\n  A[(x)]\n"),
    ).toEqual([{ id: "A", set: { type: "rect" } }])
  })

  it("records blocks on edge and subgraph ids", async () => {
    expect(
      await effects(
        "flowchart LR\n  A e1@--> B\n  e1@{ animate: true }\n  subgraph S\n    C\n  end\n  S@{ view: collapsed }\n",
      ),
    ).toEqual([
      { id: "e1", set: { animate: true } },
      { id: "S", set: { metadata: { view: "collapsed" } } },
    ])
  })

  it("counts blocks written one right after another as one", async () => {
    expect(
      await effects(
        "flowchart LR\n  A@{\n    shape: rect\n  }@{\n    label: x\n  }\n",
      ),
    ).toEqual([
      { id: "A", set: { labelType: "markdown", text: "x", type: "rect" } },
    ])
  })

  it("is empty without blocks", async () => {
    expect(await effects("flowchart LR\n  A --> B\n")).toEqual([])
  })

  it("does not change the Db summary", async () => {
    const outcome = await runMermaid(
      "flowchart LR\n  A[(x)]@{ label: y }\n  A:::c\n",
    )
    expect(vertices(outcome)).toEqual([
      {
        id: "A",
        labelType: "markdown",
        styles: [],
        classes: ["c"],
        text: "y",
        type: "cylinder",
        props: {},
      },
    ])
  })
})

describe("flowchart summary", () => {
  it("drops the whitespace at the end of style values, and only there", async () => {
    const outcome = await runMermaid(
      "flowchart LR\n  A --> B\n  style A fill:#f00 , stroke:#333\t\n  classDef c fill:#f00\u3000\n  linkStyle 0 stroke:#f00 , fill:red \n  linkStyle default stroke:#f00\u00a0\n",
    )
    if (!outcome.accepted || !outcome.db) throw new Error("expected a Db")
    const {
      vertices: summarized,
      classDefs,
      edges,
      edgeDefaults,
    } = outcome.db as {
      vertices: { styles: string[] }[]
      classDefs: { styles: string[] }[]
      edges: { style: string[] }[]
      edgeDefaults: { style: string[] }
    }
    expect(summarized[0]?.styles).toEqual(["fill:#f00", " stroke:#333"])
    expect(classDefs[0]?.styles).toEqual(["fill:#f00"])
    // The leading space keeps " fill:red" from counting as a fill, so mermaid
    // adds `fill:none`.
    expect(edges[0]?.style).toEqual(["stroke:#f00", " fill:red", "fill:none"])
    expect(edgeDefaults.style).toEqual(["stroke:#f00"])
  })

  it("keeps class definitions without the derived textStyles", async () => {
    const outcome = await runMermaid(
      "flowchart LR\n  A\n  classDef c fill:#f00,color:#0f0\n",
    )
    if (!outcome.accepted || !outcome.db) throw new Error("expected a Db")
    expect(outcome.db.classDefs).toEqual([
      { id: "c", styles: ["fill:#f00", "color:#0f0"] },
    ])
  })
})

describe("sequence summary", () => {
  /** Returns the summary mermaid gives `text`, which must be accepted. */
  async function summary(text: string): Promise<Record<string, unknown>> {
    const outcome = await runMermaid(text)
    if (!outcome.accepted || !outcome.db) throw new Error("expected a Db")
    return outcome.db
  }

  it("keeps messages without their ids, and notes only as messages", async () => {
    const db = await summary(
      "sequenceDiagram\n  A->>B: hi\n  Note over A,B: n\n",
    )
    expect(Object.keys(db)).toEqual([
      "title",
      "accTitle",
      "accDescr",
      "actors",
      "boxes",
      "createdActors",
      "destroyedActors",
      "messages",
    ])
    expect(db.messages).toEqual([
      {
        from: "A",
        to: "B",
        message: "hi",
        wrap: false,
        type: 0,
        activate: false,
        centralConnection: 0,
      },
      { from: "A", to: "B", message: "n", wrap: false, type: 2, placement: 2 },
    ])
  })

  it("drops the fields the renderer fills in", async () => {
    const db = await summary("sequenceDiagram\n  participant A as Alice\n")
    expect(db.actors).toEqual([
      {
        name: "A",
        description: "Alice",
        wrap: false,
        links: {},
        properties: {},
        type: "participant",
      },
    ])
  })

  it("records created and destroyed actors with the number of messages before them", async () => {
    const db = await summary(
      "sequenceDiagram\n  A->>B: one\n  create participant C\n  A->>C: two\n  destroy C\n  C->>A: three\n",
    )
    expect(db.createdActors).toEqual([{ id: "C", messageIndex: 1 }])
    expect(db.destroyedActors).toEqual([{ id: "C", messageIndex: 2 }])
  })

  it("splits a box line into fill and name with the color stand-in", async () => {
    const db = await summary(
      "sequenceDiagram\n  box green Group 1\n    participant a\n  end\n  box Group 2\n    participant b\n  end\n",
    )
    expect(db.boxes).toEqual([
      { name: "Group 1", wrap: false, fill: "green", actorKeys: ["a"] },
      { name: "Group 2", wrap: false, fill: "transparent", actorKeys: ["b"] },
    ])
    expect((db.actors as { box?: number }[]).map((actor) => actor.box)).toEqual(
      [0, 1],
    )
  })

  it("reads details as on a page without the element", async () => {
    const db = await summary(
      "sequenceDiagram\n  participant A\n  details A: element-id\n",
    )
    expect(db.actors).toEqual([
      {
        name: "A",
        description: "A",
        wrap: false,
        links: {},
        properties: {},
        type: "participant",
      },
    ])
  })

  it("records a prototype that a __proto__ key set as a first __proto__ entry", async () => {
    const db = await summary(
      'sequenceDiagram\n  participant A\n  links A: {"__proto__": {"x": "https://x"}, "y": "https://y"}\n',
    )
    const [actor] = db.actors as { links: object }[]
    expect(Object.entries(actor?.links ?? {})).toEqual([
      ["__proto__", { x: "https://x" }],
      ["y", "https://y"],
    ])
  })
})

describe("sequence data block effects", () => {
  /** Returns the data block effects mermaid records for `text`. */
  async function effects(text: string): Promise<unknown> {
    return (await resolveEmbeddedData(text))?.dataBlockEffects
  }

  it("records what each participant's block changed", async () => {
    expect(
      await effects(
        'sequenceDiagram\n  participant A@{ "type": "boundary", "alias": "Al" }\n  actor B@{ "type": "database" } as Bob\n',
      ),
    ).toEqual([
      { id: "A", set: { description: "Al", type: "boundary" } },
      { id: "B", set: { type: "database" } },
    ])
  })

  it("records an empty change for a block that changes nothing", async () => {
    expect(
      await effects(
        'sequenceDiagram\n  participant A\n  participant A@{ "type": "queue" }\n',
      ),
    ).toEqual([{ id: "A", set: {} }])
  })

  it("does not change the Db summary", async () => {
    const outcome = await runMermaid(
      'sequenceDiagram\n  participant A@{ "type": "control" } as Ctl\n  A->>A: x\n',
    )
    if (!outcome.accepted || !outcome.db) throw new Error("expected a Db")
    expect(outcome.db.actors).toEqual([
      {
        name: "A",
        description: "Ctl",
        wrap: false,
        links: {},
        properties: {},
        type: "control",
      },
    ])
    expect(outcome.db.messages).toHaveLength(1)
  })
})

describe("class summary", () => {
  /** Returns the summary mermaid gives `text` with `config`. */
  async function summary(
    text: string,
    config: MermaidConfig = {},
  ): Promise<Record<string, unknown>> {
    const outcome = await runMermaid(text, { config })
    if (!outcome.accepted || !outcome.db) throw new Error("expected a Db")
    return outcome.db
  }

  it("drops DOM ids, the display text of members and note indexes", async () => {
    const db = await summary(
      'classDiagram\n  class A {\n    +int x$\n    +foo(a) bool*\n  }\n  note for A "hi"\n',
    )
    expect(db.classes).toEqual([
      {
        id: "A",
        type: "",
        label: "A",
        text: "A",
        shape: "classBox",
        cssClasses: "default",
        methods: [
          {
            memberType: "method",
            visibility: "+",
            classifier: "*",
            id: "foo",
            parameters: "a",
            returnType: "bool",
          },
        ],
        members: [
          {
            memberType: "attribute",
            visibility: "+",
            classifier: "$",
            id: "int x",
          },
        ],
        annotations: [],
        styles: [],
      },
    ])
    expect(db.notes).toEqual([{ id: "note0", class: "A", text: "hi" }])
  })

  it("lists the classes, notes and children of a namespace by id", async () => {
    const db = await summary(
      "classDiagram\n  namespace N.M {\n    class A\n  }\n",
    )
    expect(db.namespaces).toEqual([
      {
        id: "N",
        label: "N",
        classes: [],
        notes: [],
        children: ["N.M"],
        explicit: false,
      },
      {
        id: "N.M",
        label: "M",
        classes: ["A"],
        notes: [],
        children: [],
        parent: "N",
        explicit: true,
      },
    ])
  })

  it("drops the whitespace at the end of style values", async () => {
    const db = await summary(
      "classDiagram\n  class B\n  style B fill:#0f0 , stroke:#333 \n",
    )
    expect((db.classes as { styles: string[] }[])[0]?.styles).toEqual([
      "fill:#0f0",
      " stroke:#333",
    ])
  })

  it("records click links as written under every securityLevel", async () => {
    const text =
      'classDiagram\n  class A\n  class B\n  click A href "https://x" _self\n  click B href " "\n'
    for (const securityLevel of ["strict", "sandbox"]) {
      const db = await summary(text, { securityLevel })
      const [a, b] = db.classes as { link?: string; linkTarget?: string }[]
      expect([a?.link, a?.linkTarget], securityLevel).toEqual([
        "https://x",
        "_self",
      ])
      expect([b?.link, b?.linkTarget], securityLevel).toEqual([
        undefined,
        "_blank",
      ])
    }
  })
})

describe("state summary", () => {
  /** Returns the summary mermaid gives `text`. */
  async function summary(text: string): Promise<Record<string, unknown>> {
    const outcome = await runMermaid(text)
    if (!outcome.accepted || !outcome.db) throw new Error("expected a Db")
    return outcome.db
  }

  it("keeps states, notes and transitions without the fields for drawing", async () => {
    const db = await summary(
      "stateDiagram-v2\n  [*] --> A : go\n  A : one\n  A : two\n  note left of A : hi\n  note right of A : there\n",
    )
    expect(db.states).toEqual([
      {
        id: "root_start",
        shape: "stateStart",
        label: "root_start",
        classes: [],
        styles: [],
      },
      {
        id: "A",
        shape: "rectWithTitle",
        label: "one",
        description: ["two"],
        classes: [],
        styles: [],
      },
    ])
    expect(db.notes).toEqual([
      { state: "A", position: "left of", text: "hi" },
      { state: "A", position: "right of", text: "there" },
    ])
    expect(db.transitions).toEqual([
      { start: "root_start", end: "A", label: "go" },
    ])
  })

  it("gives a state the classes and styles of the top level only", async () => {
    const db = await summary(
      "stateDiagram-v2\n  classDef bad fill:red,color:blue\n  state C {\n    class D bad\n    D\n    E\n  }\n  class E bad\n  style E fill:#0f0\n",
    )
    const states = db.states as {
      id: string
      classes: string[]
      styles: string[]
      parentId?: string
    }[]
    expect(
      states.map(({ id, classes, styles, parentId }) => [
        id,
        classes,
        styles,
        parentId,
      ]),
    ).toEqual([
      ["C", [], [], undefined],
      ["D", [], [], "C"],
      ["E", ["bad"], ["fill:#0f0"], "C"],
    ])
    expect(db.classDefs).toEqual([
      { id: "bad", styles: ["fill:red", "color:blue"] },
    ])
  })

  it("names the region after the last divider in order, wherever its id appears", async () => {
    const text =
      "stateDiagram-v2\n  state C {\n    A\n    --\n    [*] --> B\n  }\n  state D {\n    E\n    --\n    F\n  }\n"
    const db = await summary(text)
    const states = db.states as { id: string; parentId?: string }[]
    expect(states.map(({ id, parentId }) => [id, parentId])).toEqual([
      ["C", undefined],
      ["divider-id-1", "C"],
      ["A", "divider-id-1"],
      ["generated-region-1", "C"],
      ["generated-region-1_start", "generated-region-1"],
      ["B", "generated-region-1"],
      ["D", undefined],
      ["divider-id-2", "D"],
      ["E", "divider-id-2"],
      ["generated-region-2", "D"],
      ["F", "generated-region-2"],
    ])
    expect(db.transitions).toEqual([
      { start: "generated-region-1_start", end: "B", label: "" },
    ])
    expect(await summary(text)).toEqual(db)
  })

  it("records the direction the renderer uses, the last of the top level", async () => {
    const db = await summary(
      "stateDiagram-v2\n  direction LR\n  state C {\n    direction BT\n    D\n  }\n  direction RL\n",
    )
    expect(db.direction).toBe("RL")
    expect((db.states as { dir?: string }[])[0]?.dir).toBe("BT")
  })

  it("records each click with its state, and its url and tooltip as written", async () => {
    const db = await summary(
      'stateDiagram-v2\n  A\n  click A "https://a" "tip"\n  click A href "https://b"\n',
    )
    expect(db.links).toEqual([
      { state: "A", url: '"https://a"', tooltip: '"tip"' },
      { state: "A", url: '"https://b"', tooltip: "" },
    ])
  })
})

describe("options", () => {
  it("lists the keys of RunMermaidOptions", () => {
    expectTypeOf<(typeof RUN_MERMAID_OPTION_KEYS)[number]>().toEqualTypeOf<
      keyof RunMermaidOptions
    >()
  })

  it("rejects a key it does not know, also one that a spread brought in", async () => {
    const renamed = { withoutDivergence: "comment-takes-character" }
    const text = "sequenceDiagram\n  A->>B: x\n"
    await expect(runMermaid(text, { config: {}, ...renamed })).rejects.toThrow(
      "unknown options withoutDivergence; the options are config, withoutDivergences",
    )
    await expect(
      detectDiagramType(text, { config: {}, ...renamed }),
    ).rejects.toThrow(TypeError)
    expect((await runMermaid(text)).accepted).toBe(true)
  })
})

describe("withoutDivergences", () => {
  const comment = "%%"

  it("reads a number before a comment as the specification does", async () => {
    const text = `sequenceDiagram\n  autonumber 5${comment} c\n  A->>B: x\n`
    const removed = await runMermaid(text, {
      withoutDivergences: ["comment-takes-character"],
    })
    if (!removed.accepted || !removed.db) throw new Error("expected a Db")
    expect((removed.db.messages as { message: unknown }[])[0]?.message).toEqual(
      { start: 5, step: 1, visible: true },
    )
  })

  it("leaves the default reading as mermaid.js has it", async () => {
    const text = `sequenceDiagram\n  autonumber 5${comment} c\n  A->>B: x\n`
    const asIs = await runMermaid(text)
    if (!asIs.accepted || !asIs.db) throw new Error("expected a Db")
    expect((asIs.db.messages as { message: unknown }[])[0]?.message).toEqual({
      visible: true,
    })
  })

  it("puts the lexer back after the call, also when calls overlap", async () => {
    const text = `sequenceDiagram\n  autonumber 10${comment} c\n  A->>B: x\n`
    const [removed, asIs] = await Promise.all([
      runMermaid(text, { withoutDivergences: ["comment-takes-character"] }),
      runMermaid(text),
    ])
    expect(removed.accepted).toBe(true)
    expect(asIs.accepted).toBe(false)
    expect((await runMermaid(text)).accepted).toBe(false)
  })

  it("changes nothing for another diagram type", async () => {
    const text = `flowchart LR\n  A --> B\n  A${comment} c\n`
    expect(
      await runMermaid(text, {
        withoutDivergences: ["comment-takes-character"],
      }),
    ).toEqual(await runMermaid(text))
  })

  /** Whether mermaid accepts `text` as is, and without the class divergence. */
  async function acceptedWithAndWithoutLineBreak(
    text: string,
  ): Promise<[boolean, boolean]> {
    const asIs = await runMermaid(text)
    const removed = await runMermaid(text, {
      withoutDivergences: ["comment-takes-line-break"],
    })
    return [asIs.accepted, removed.accepted]
  }

  it("ends a class comment after a unit at the end of its line", async () => {
    expect(
      await acceptedWithAndWithoutLineBreak(
        `classDiagram\n  A --> B ${comment} c\n  class C\n`,
      ),
    ).toEqual([false, true])
    expect(
      await acceptedWithAndWithoutLineBreak(
        `classDiagram\n  A ${comment} c\n  --> B\n`,
      ),
    ).toEqual([true, false])
  })

  it("lets a class comment alone on its line take its line break", async () => {
    expect(
      await acceptedWithAndWithoutLineBreak(
        `classDiagram\n  class A\n  ${comment}\n  class B\n`,
      ),
    ).toEqual([true, true])
  })

  /**
   * The classes and relations mermaid gives `text`, or `undefined` if it
   * rejects it.
   */
  async function classesAndRelations(
    text: string,
    options: RunMermaidOptions = {},
  ): Promise<{ classes: unknown; relations: unknown } | undefined> {
    const outcome = await runMermaid(text, options)
    if (!outcome.accepted || !outcome.db) return undefined
    return { classes: outcome.db.classes, relations: outcome.db.relations }
  }

  const nameStart: RunMermaidOptions = {
    withoutDivergences: ["name-start-reads-unit"],
  }

  it("reads a keyword at the start of a backquoted name as the name", async () => {
    const text = "classDiagram\n  class `note`\n"
    expect(await classesAndRelations(text)).toBeUndefined()
    const removed = await classesAndRelations(text, nameStart)
    expect((removed?.classes as { id: string }[]).map(({ id }) => id)).toEqual([
      "note",
    ])
  })

  it("reads a quote at the start of a backquoted name as part of the name", async () => {
    const text = 'classDiagram\n  A `"1"` --> B\n'
    const asIs = await classesAndRelations(text)
    const removed = await classesAndRelations(text, nameStart)
    expect((asIs?.classes as { id: string }[]).map(({ id }) => id)).toEqual([
      "A",
      "B",
    ])
    expect((removed?.classes as { id: string }[]).map(({ id }) => id)).toEqual([
      'A"1"',
      "B",
    ])
  })

  it("leaves names that start with a character of the name as they are", async () => {
    for (const text of [
      "classDiagram\n  class A~T~\n",
      "classDiagram\n  class `x`\n",
      "classDiagram\n  class A~~\n",
    ]) {
      expect(await classesAndRelations(text, nameStart), text).toEqual(
        await classesAndRelations(text),
      )
    }
  })

  it("removes several divergences of one lexer together", async () => {
    const text = "classDiagram\n  class `note`\n  A --> B %% c\n  class C\n"
    const both = await classesAndRelations(text, {
      withoutDivergences: ["comment-takes-line-break", "name-start-reads-unit"],
    })
    expect((both?.classes as { id: string }[]).map(({ id }) => id)).toEqual([
      "note",
      "A",
      "B",
      "C",
    ])
    for (const withoutDivergences of [
      [],
      ["comment-takes-line-break"],
      ["name-start-reads-unit"],
    ] as const) {
      expect(
        await classesAndRelations(text, { withoutDivergences }),
        JSON.stringify(withoutDivergences),
      ).toBeUndefined()
    }
  })

  it("counts each divergence once and ignores those of other diagram types", async () => {
    const text = "classDiagram\n  class `note`\n  A --> B %% c\n  class C\n"
    expect(
      await classesAndRelations(text, {
        withoutDivergences: [
          "name-start-reads-unit",
          "comment-takes-character",
          "comment-takes-line-break",
          "name-start-reads-unit",
        ],
      }),
    ).toEqual(
      await classesAndRelations(text, {
        withoutDivergences: [
          "comment-takes-line-break",
          "name-start-reads-unit",
        ],
      }),
    )
  })
})

describe("detectDiagramType", () => {
  it("names the diagram type of text mermaid rejects", async () => {
    expect(await detectDiagramType("flowchart LR\n  A -->\n")).toBe(
      "flowchart-v2",
    )
    expect(await detectDiagramType("swimlane-beta TD\n  A --> B\n")).toBe(
      "swimlane",
    )
    expect(await detectDiagramType("not a diagram\n")).toBeUndefined()
  })
})
