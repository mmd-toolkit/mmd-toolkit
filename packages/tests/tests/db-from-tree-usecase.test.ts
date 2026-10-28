import { describe, expect, it } from "vitest"
import { dbFromTree } from "../src/db-from-tree/index.ts"
import type { DbTreeRoot } from "../src/db-from-tree/index.ts"
import { embeddedValuesOf, loadFixture } from "../src/index.ts"
import { cssSupportsColor } from "../src/normalizers/browser-stand-ins.ts"
import type { Built } from "./check-tree-built.ts"
import {
  actor,
  built,
  entity,
  hull,
  id,
  json,
  label,
  relationship,
  style,
  update,
  accessibility,
} from "./usecase-built.ts"

/** These hand-built trees use the corpus inputs verbatim; no parser or expected Db builds them. */
const CASES: readonly [name: string, make: () => Built][] = [
  [
    "gram-class-suffix-duplicate",
    () =>
      built("usecase-beta\nA:::one,one,two\n", (kit) => [
        entity(kit, "A", { classes: ["one", "one", "two"] }),
      ]),
  ],
  ["header-lf", () => built("usecase-beta\n", () => [])],
  [
    "db-three-definitions",
    () =>
      built(
        "usecase-beta\nactor A:::one\nactor A:::two\nactor A:::three\nB:::one\nB:::two\nB:::three\nA --> B\n",
        (kit) => [
          actor(kit, "A", { classes: ["one"] }),
          actor(kit, "A", { classes: ["two"] }),
          actor(kit, "A", { classes: ["three"] }),
          entity(kit, "B", { classes: ["one"] }),
          entity(kit, "B", { classes: ["two"] }),
          entity(kit, "B", { classes: ["three"] }),
          relationship(kit, "A", "B"),
        ],
      ),
  ],
  [
    "db-json-source-map-order",
    () =>
      built(
        'usecase-beta\nA --> Second\njson First@{"2":2,"1":1}\njson Second@{"b":true,"a":null}\n',
        (kit) => [
          relationship(kit, "A", "Second"),
          json(kit, "First", '"2":2,"1":1'),
          json(kit, "Second", '"b":true,"a":null'),
        ],
      ),
  ],
  [
    "gram-actor-icon-clear",
    () =>
      built('usecase-beta\nactor A@{icon:"fa:user"}\nA@{icon:""}\n', (kit) => [
        actor(kit, "A", { metadata: [["icon", '"fa:user"']] }),
        update(kit, "A", [["icon", '""']]),
      ]),
  ],
  [
    "gram-native-final-invalid-then-valid",
    () =>
      built(
        'usecase-beta\nactor A@{type:hollow,icon:"fa:user"}\nA@{type:normal}\n',
        (kit) => [
          actor(kit, "A", {
            metadata: [
              ["type", "hollow"],
              ["icon", '"fa:user"', ","],
            ],
          }),
          update(kit, "A", [["type", "normal"]]),
        ],
      ),
  ],
  [
    "db-metadata-forward",
    () =>
      built("usecase-beta\nA@{ business:true }\nA\n", (kit) => [
        update(kit, "A", [["business", "true"]]),
        entity(kit, "A"),
      ]),
  ],
  [
    "db-style-append",
    () =>
      built(
        "usecase-beta\nA\nstyle A color:red\nstyle A color:blue\nstyle A border:1px solid green\n",
        (kit) => [
          entity(kit, "A"),
          style(kit, "A", "color", "red"),
          style(kit, "A", "color", "blue"),
          style(kit, "A", "border", "1px solid green"),
        ],
      ),
  ],
  [
    "db-note-order",
    () =>
      built(
        'usecase-beta\nA\nnote for A first\nnote for A "`second`"\nnote for A third\n',
        (kit) => {
          const first = entity(kit, "A")

          /** A note with its explicitly supplied label kind. */
          function note(raw: string, kind: "text" | "markdown") {
            const keyword = kit.token("Keyword", "note")
            kit.token("Keyword", "for")
            const target = id(kit, "A")
            const content = label(kit, raw, kind)
            return kit.node("UsecaseNoteStatement", hull(keyword, content), {
              target,
              label: content,
            })
          }

          return [
            first,
            note("first", "text"),
            note('"`second`"', "markdown"),
            note("third", "text"),
          ]
        },
      ),
  ],
  [
    "db-accessibility",
    () =>
      built(
        "usecase-beta\naccTitle:  First title  \naccTitle: Final title\naccDescr: First description\naccDescr {\n  Second line\n    Indented line\n}\n",
        (kit) => [
          accessibility(kit, "title", "  First title  "),
          accessibility(kit, "title", " Final title"),
          accessibility(kit, "description", " First description"),
          accessibility(kit, "block", "\n  Second line\n    Indented line\n"),
        ],
      ),
  ],
]

/** A typed view of a hand-made JSON tree. */
function dbOf(
  test: Built,
  embedded: NonNullable<ReturnType<typeof embeddedValuesOf>>,
) {
  return dbFromTree(
    test.source,
    test.tree as unknown as DbTreeRoot,
    embedded,
    cssSupportsColor,
  )
}

describe("usecase Db from written occurrences", () => {
  for (const [name, make] of CASES)
    it(`matches ${name}`, async () => {
      const fixture = await loadFixture("usecase", name)
      if (!fixture.expected.accepted)
        throw new Error(`rejected fixture ${name}`)
      const test = make()
      const embedded = embeddedValuesOf(fixture)
      if (embedded === undefined) throw new Error("missing embedded values")
      expect(test.source).toBe(fixture.input)
      expect(dbOf(test, embedded)).toEqual(fixture.expected.db)
    })

  it("requires an effect for each authored JSON block and checks source-order ids", () => {
    const test = CASES.find(
      ([name]) => name === "db-json-source-map-order",
    )![1]()
    const empty = { config: {}, title: undefined, dataBlockEffects: [] }
    expect(() => dbOf(test, empty)).toThrow("different counts")
    expect(() =>
      dbOf(test, {
        config: {},
        title: undefined,
        dataBlockEffects: [
          { id: "Second", set: { value: {}, propertyOrder: {} } },
          { id: "First", set: { value: {}, propertyOrder: {} } },
        ],
      }),
    ).toThrow("mismatched JSON effect")
    expect(() =>
      dbOf(test, {
        config: {},
        title: undefined,
        dataBlockEffects: [
          { id: "First", set: { value: {} } },
          { id: "Second", set: { value: {}, propertyOrder: {} } },
        ],
      }),
    ).toThrow("mismatched JSON effect")
  })

  it("uses supplied JSON effects without reading an opaque malformed interior", () => {
    const test = built("usecase-beta\njson J@{unquoted:bad}\n", (kit) => [
      json(kit, "J", "unquoted:bad"),
    ])
    expect(
      dbOf(test, {
        config: {},
        title: undefined,
        dataBlockEffects: [
          {
            id: "J",
            set: {
              value: { supplied: true },
              propertyOrder: { "": ["supplied"] },
            },
          },
        ],
      }).jsonNodes,
    ).toEqual([
      {
        id: "J",
        value: { supplied: true },
        propertyOrder: { "": ["supplied"] },
        classes: [],
        styles: [],
      },
    ])
  })

  it("derives quoted semantic ids per UTF-16 unit and trims stereotypes", () => {
    const test = built('usecase-beta\nactor "a 😀!" <<  role  >>\n', (kit) => [
      actor(kit, null, {
        label: ['"a 😀!"', "string"],
        stereotype: "  role  ",
      }),
    ])
    expect(
      dbOf(test, { config: {}, title: undefined, dataBlockEffects: [] }).actors,
    ).toMatchObject([{ id: "a____", label: "a 😀!", stereotype: "role" }])
  })
})
