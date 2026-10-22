import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import type { CheckedNode } from "../src/check-tree/types.ts"
import {
  USECASE_CHILD_TYPES,
  USECASE_FIELD_WORDS,
} from "../src/check-tree/usecase.ts"
import { itFailsEach, nodeWith, retype } from "./check-tree-built.ts"
import type { Built, BrokenCase, Kit } from "./check-tree-built.ts"
import { locationOf } from "./check-tree-trees.ts"
import { setField } from "./check-tree-recorded.ts"
import {
  readChildFields,
  readFieldTables,
  readFieldMeanings,
} from "./spec-field-tables.ts"
import {
  accessibility,
  actor,
  arrow,
  built,
  css,
  element,
  entity,
  hull,
  id,
  json,
  label,
  metadata,
  relationship,
  style,
  update,
} from "./usecase-built.ts"

/** A written split relationship, including deliberately impossible lexical splits. */
function splitRelationship(
  kit: Kit,
  openingValue: "--" | "<--",
  content: string,
  closingValue: "--" | "-->",
): CheckedNode {
  const source = element(kit, "A")
  const opening = arrow(
    kit,
    openingValue,
    { startMarker: openingValue === "<--" ? "arrow" : "none" },
    true,
  )
  const text = label(kit, content)
  const closing = arrow(kit, closingValue, {
    endMarker: closingValue === "--" ? "none" : "arrow",
  })
  const target = element(kit, "B")
  return kit.node("UsecaseRelationshipStatement", hull(source, target), {
    source,
    id: null,
    kind: "association",
    opening,
    label: text,
    arrow: closing,
    target,
  })
}

/** One authored class definition with a raw CSS value rather than JSON children. */
function classDefinition(kit: Kit, value: string): CheckedNode {
  const keyword = kit.token("Keyword", "classDef")
  const name = id(kit, "hot")
  const declaration = css(kit, "color", value)
  return kit.node("UsecaseClassDefStatement", hull(keyword, declaration), {
    classes: [name],
    styles: [declaration],
  })
}

/** One fixed actor's metadata with an authored comma and comment choice. */
function actorWithMetadataTail(
  kit: Kit,
  fields: {
    readonly name?: string
    readonly comma?: boolean
    readonly comment?: boolean
  } = {},
): CheckedNode {
  const keyword = kit.token("Keyword", "actor")
  const identifier = id(kit, fields.name ?? "U")
  const open = kit.token("Punctuator", "@{")
  const key = id(kit, "type")
  kit.token("Punctuator", ":")
  const value = id(kit, "hollow")
  const property = kit.node("UsecaseMetadataProperty", hull(key, value), {
    key,
    value,
  })
  if (fields.comma !== false) kit.token("Punctuator", ",")
  if (fields.comment === true) kit.comment("%%", "%% c")
  const close = kit.token("Punctuator", "}")
  const data = kit.node("UsecaseMetadata", hull(open, close), {
    properties: [property],
  })
  const declaration = kit.node("UsecaseActor", hull(identifier, close), {
    id: identifier,
    label: null,
    metadata: data,
    stereotype: null,
    classes: [],
  })
  return kit.node("UsecaseActorStatement", hull(keyword, close), {
    actors: [declaration],
  })
}

/** The declared edge e lets its metadata tail be checked independently of resolution. */
function identifiedRelationship(kit: Kit): CheckedNode {
  const source = element(kit, "A")
  const edgeId = id(kit, "e")
  kit.token("Punctuator", "@")
  const mark = arrow(kit, "-->")
  const target = element(kit, "B")
  return kit.node("UsecaseRelationshipStatement", hull(source, target), {
    source,
    id: edgeId,
    kind: "association",
    opening: null,
    label: null,
    arrow: mark,
    target,
  })
}

/** Fixed complete source trees; each grammar choice is authored explicitly. */
const VALID: Readonly<Record<string, () => Built>> = {
  empty: () => built("usecase-beta\n", () => []),
  actor: () =>
    built(
      'usecase-beta\nactor A("a")@{type:hollow,business:true} << role >>:::hot,cold\n',
      (kit) => [
        actor(kit, "A", {
          shape: "ellipse",
          label: ['"a"', "string"],
          metadata: [
            ["type", "hollow"],
            ["business", "true", ","],
          ],
          stereotype: " role ",
          classes: ["hot", "cold"],
        }),
      ],
    ),
  entity: () =>
    built("usecase-beta\nA[caption] <<core>>:::hot\n", (kit) => [
      entity(kit, "A", {
        shape: "rectangle",
        label: ["caption", "text"],
        stereotype: "core",
        classes: ["hot"],
      }),
    ]),
  quoted: () =>
    built('usecase-beta\n"`A\nB`"\n', (kit) => [
      entity(kit, null, { label: ['"`A\nB`"', "markdown"] }),
    ]),
  single: () =>
    built("usecase-beta\nactor A@{'icon':'fa:user'}\n", (kit) => [
      actor(kit, "A", { metadata: [["'icon'", "'fa:user'"]] }),
    ]),
  boundary: () =>
    built(
      "usecase-beta\nsystemBoundary S[Title]@{type:package}:::group\nactor A\nB\nend\n",
      (kit) => {
        const keyword = kit.token("Keyword", "systemBoundary")
        const name = id(kit, "S")
        kit.token("Punctuator", "[")
        const title = label(kit, "Title")
        kit.token("Punctuator", "]")
        const data = metadata(kit, [["type", "package"]])
        kit.token("Punctuator", ":::")
        const group = id(kit, "group")
        const a = actor(kit, "A")
        const b = entity(kit, "B")
        const end = kit.token("Keyword", "end")
        return [
          kit.node("UsecaseSystemBoundaryStatement", hull(keyword, end), {
            id: name,
            title,
            metadata: data,
            classes: [group],
            body: [a, b],
          }),
        ]
      },
    ),
  relationship: () =>
    built("usecase-beta\nA --> B\n", (kit) => [relationship(kit, "A", "B")]),
  "opening separated from circle-prefix label": () =>
    built("usecase-beta\nA -- order --> B\n", (kit) => [
      splitRelationship(kit, "--", "order", "-->"),
    ]),
  "backward opening separated from dash label": () =>
    built("usecase-beta\nA <-- -lpha -- B\n", (kit) => [
      splitRelationship(kit, "<--", "-lpha", "--"),
    ]),
  "CSS without JSON prefix": () =>
    built("usecase-beta\nA\nstyle A color:zeta J@ {}\n", (kit) => [
      entity(kit, "A"),
      style(kit, "A", "color", "zeta J@ {}"),
    ]),
  "classDef without JSON prefix": () =>
    built("usecase-beta\nclassDef hot color:zeta J@ {}\n", (kit) => [
      classDefinition(kit, "zeta J@ {}"),
    ]),
  "CSS with ordinary braces and quoted text": () =>
    built('usecase-beta\nA\nstyle A color:zeta J@ {"a":1}\n', (kit) => [
      entity(kit, "A"),
      style(kit, "A", "color", 'zeta J@ {"a":1}'),
    ]),
  "JSON-looking text inside a CSS string": () =>
    built('usecase-beta\nA\nstyle A color:"json J@ {}"\n', (kit) => [
      entity(kit, "A"),
      style(kit, "A", "color", '"json J@ {}"'),
    ]),
  "JSON-looking suffix inside a CSS identifier": () =>
    built("usecase-beta\nA\nstyle A color:my-json J@ {}\n", (kit) => [
      entity(kit, "A"),
      style(kit, "A", "color", "my-json J@ {}"),
    ]),
  "JSON keyword with an Identifier longer alternative": () =>
    built("usecase-beta\nA\nstyle A color:jsonName J@ {}\n", (kit) => [
      entity(kit, "A"),
      style(kit, "A", "color", "jsonName J@ {}"),
    ]),
  split: () =>
    built('usecase-beta\nA edge@<-- "`label`" ---- B\n', (kit) => {
      const source = element(kit, "A")
      const edge = id(kit, "edge")
      kit.token("Punctuator", "@")
      const opening = arrow(kit, "<--", { startMarker: "arrow" }, true)
      const text = label(kit, '"`label`"', "markdown")
      const closing = arrow(kit, "----", { endMarker: "none", length: 4 })
      const target = element(kit, "B")
      return [
        kit.node("UsecaseRelationshipStatement", hull(source, target), {
          source,
          id: edge,
          kind: "association",
          opening,
          label: text,
          arrow: closing,
          target,
        }),
      ]
    }),
  semantic: () =>
    built("usecase-beta\nA ..> : InClUdE B\n", (kit) => {
      const source = element(kit, "A")
      const mark = arrow(kit, "..>", { line: "dotted" })
      kit.token("Punctuator", ":")
      kit.token("Keyword", "InClUdE")
      const target = element(kit, "B")
      return [
        kit.node("UsecaseRelationshipStatement", hull(source, target), {
          source,
          id: null,
          kind: "include",
          opening: null,
          label: null,
          arrow: mark,
          target,
        }),
      ]
    }),
  json: () =>
    built('usecase-beta\njson actor@ { "a":{"b":"}\\"{"} }\n', (kit) => [
      json(kit, "actor", ' "a":{"b":"}\\"{"} '),
    ]),
  opaque: () =>
    built("usecase-beta\njson J@{unquoted:[1,]}\n", (kit) => [
      json(kit, "J", "unquoted:[1,]"),
    ]),
  metadata: () =>
    built("usecase-beta\nA@{\nbusiness:true\n}\nA\n", (kit) => [
      update(kit, "A", [["business", "true"]]),
      entity(kit, "A"),
    ]),
  "metadata trailing comma without a line break": () =>
    built("usecase-beta\nactor U@{type:hollow,}\n", (kit) => [
      actorWithMetadataTail(kit),
    ]),
  "metadata trailing comma before one line break": () =>
    built("usecase-beta\nactor A@{type:hollow,\n}\n", (kit) => [
      actorWithMetadataTail(kit, { name: "A" }),
    ]),
  "metadata trailing comma before one padded line break": () =>
    built("usecase-beta\nactor U@{type:hollow, \t\n \t}\n", (kit) => [
      actorWithMetadataTail(kit),
    ]),
  "metadata trailing comma before one CRLF": () =>
    built("usecase-beta\r\nactor U@{type:hollow,\r\n}\r\n", (kit) => [
      actorWithMetadataTail(kit),
    ]),
  "metadata trailing comma with one line break after comment removal": () =>
    built("usecase-beta\nactor U@{type:hollow,\n%% c\n}\n", (kit) => [
      actorWithMetadataTail(kit, { comment: true }),
    ]),
  "metadata without a trailing comma before two line breaks": () =>
    built("usecase-beta\nactor U@{type:hollow\n\n}\n", (kit) => [
      actor(kit, "U", { metadata: [["type", "hollow"]] }),
    ]),
  "metadata without a trailing comma before two CRLF pairs": () =>
    built("usecase-beta\r\nactor U@{type:hollow\r\n\r\n}\r\n", (kit) => [
      actor(kit, "U", { metadata: [["type", "hollow"]] }),
    ]),
  "metadata ending with two line breaks and a whitespace-only line": () =>
    built("usecase-beta\nactor U@{type:hollow\n  \n}\n", (kit) => [
      actor(kit, "U", { metadata: [["type", "hollow"]] }),
    ]),
  "metadata ending with two line breaks and a tab-only line": () =>
    built("usecase-beta\nactor U@{type:hollow\n\t\n}\n", (kit) => [
      actor(kit, "U", { metadata: [["type", "hollow"]] }),
    ]),
  "two line breaks counted only after the last metadata property": () =>
    built("usecase-beta\nactor U@{type:hollow,business:true\n\n}\n", (kit) => [
      actor(kit, "U", {
        metadata: [
          ["type", "hollow"],
          ["business", "true", ","],
        ],
      }),
    ]),
  "edge metadata ending with two line breaks": () =>
    built("usecase-beta\nA e@--> B\ne@{animate:true\n\n}\n", (kit) => [
      identifiedRelationship(kit),
      update(kit, "e", [["animate", "true"]]),
    ]),
  "metadata ending with two line breaks after comment removal": () =>
    built("usecase-beta\nactor U@{type:hollow\n%% c\n\n}\n", (kit) => [
      actorWithMetadataTail(kit, { comma: false, comment: true }),
    ]),
  style: () =>
    built('usecase-beta\nA\nstyle A -- color: "a,b" \\, 2px\n', (kit) => [
      entity(kit, "A"),
      style(kit, "A", "-- color", ' "a,b" \\, 2px'),
    ]),
  direction: () =>
    built("usecase-beta\ndirection TD\n", (kit) => {
      const keyword = kit.token("Keyword", "direction")
      const value = kit.token("Keyword", "TD")
      return [
        kit.node("UsecaseDirectionStatement", hull(keyword, value), {
          direction: "TD",
        }),
      ]
    }),
  accessibility: () =>
    built(
      "usecase-beta\naccTitle:  title  \naccDescr: \naccDescr{\n  full  \n}\naccDescr{}\n",
      (kit) => [
        accessibility(kit, "title", "  title  "),
        accessibility(kit, "description", " "),
        accessibility(kit, "block", "\n  full  \n"),
        accessibility(kit, "block", ""),
      ],
    ),
  classes: () =>
    built(
      "usecase-beta\nA\nclass A hot,cold\nclassDef hot fill:red\n",
      (kit) => {
        const a = entity(kit, "A")
        const keyword = kit.token("Keyword", "class")
        const target = id(kit, "A")
        const first = id(kit, "hot")
        kit.token("Punctuator", ",")
        const second = id(kit, "cold")
        const assignment = kit.node(
          "UsecaseClassStatement",
          hull(keyword, second),
          { targets: [target], classes: [first, second] },
        )
        const def = kit.token("Keyword", "classDef")
        const name = id(kit, "hot")
        const property = kit.node(
          "UsecaseIdentifier",
          kit.token("Identifier", "fill").range,
          { name: "fill" },
        )
        kit.token("Punctuator", ":")
        const value = kit.node(
          "UsecaseLiteral",
          kit.token("RawText", "red").range,
          { value: "red" },
        )
        const declaration = kit.node(
          "UsecaseStyleDeclaration",
          hull(property, value),
          { name: property, value },
        )
        return [
          a,
          assignment,
          kit.node("UsecaseClassDefStatement", hull(def, declaration), {
            classes: [name],
            styles: [declaration],
          }),
        ]
      },
    ),
}

const BROKEN: readonly BrokenCase[] = [
  {
    name: "an uncut RawText item split into adjacent tokens",
    built: VALID.style,
    mutate: (tree, source) => {
      const token = tree.tokens.find(
        (candidate) => candidate.type === "RawText",
      )
      if (token === undefined) throw new Error("missing CSS value")
      const firstRange = [token.range[0], token.range[0] + 1] as const
      const secondRange = [firstRange[1], token.range[1]] as const
      const first = {
        ...token,
        range: firstRange,
        value: source.slice(...firstRange),
        loc: locationOf(source, firstRange),
      }
      const second = {
        ...token,
        range: secondRange,
        value: source.slice(...secondRange),
        loc: locationOf(source, secondRange),
      }
      setField(
        tree,
        "tokens",
        tree.tokens.flatMap((candidate) =>
          candidate === token ? [first, second] : [candidate],
        ),
      )
    },
    expected: "a RawText item can fragment only at a source cut",
  },
  {
    name: "a CSS dash prefix and word merged into one Identifier",
    built: VALID.style,
    mutate: (tree, source) => {
      const property = nodeWith(tree, "UsecaseIdentifier")
      const tokens = tree.tokens.filter(
        (token) =>
          property.range[0] <= token.range[0] &&
          token.range[1] <= property.range[1],
      )
      const merged = {
        type: "Identifier",
        range: property.range,
        loc: property.loc,
        value: source.slice(...property.range),
      }
      setField(
        tree,
        "tokens",
        tree.tokens.flatMap((token) =>
          token === tokens[0]
            ? [merged]
            : tokens.includes(token)
              ? []
              : [token],
        ),
      )
    },
    expected: "the CSS name word must be one lexical atom in its position",
  },

  {
    name: "wrong actor shape punctuation kind",
    built: VALID.actor,
    mutate: retype("(", "Keyword"),
    expected: "the kind of a token that the node writes itself",
  },
  {
    name: "wrong shape scalar",
    built: VALID.entity,
    mutate: (tree) =>
      setField(nodeWith(tree, "UsecaseEntity"), "shape", "ellipse"),
    expected: "the shape from the written delimiters",
  },
  {
    name: "missing id and label",
    built: VALID.actor,
    mutate: (tree) => {
      const node = nodeWith(tree, "UsecaseActor")
      setField(node, "id", null)
      setField(node, "label", null)
    },
    expected: "an element requires an id or a quoted-only name",
  },
  {
    name: "wrong association kind",
    built: VALID.relationship,
    mutate: (tree) =>
      setField(
        nodeWith(tree, "UsecaseRelationshipStatement"),
        "kind",
        "include",
      ),
    expected: "the relationship kind from its operator",
  },
  {
    name: "wrong marker",
    built: VALID.split,
    mutate: (tree) =>
      setField(nodeWith(tree, "UsecaseOpeningArrow"), "startMarker", "cross"),
    expected: "the startMarker of the arrow",
  },
  {
    name: "wrong uncapped length",
    built: VALID.split,
    mutate: (tree) => setField(nodeWith(tree, "UsecaseArrow"), "length", 1),
    expected: "the length of the arrow",
  },
  {
    name: "missing split label",
    built: VALID.split,
    mutate: (tree) =>
      setField(nodeWith(tree, "UsecaseRelationshipStatement"), "label", null),
    expected: "opening and label must be present together",
  },
  {
    name: "unclosed single-quoted metadata string",
    built: VALID.single,
    mutate: (tree) =>
      setField(nodeWith(tree, "StringLiteral"), "closed", false),
    expected: "the native string must be one closed plain-string unit",
  },
  {
    name: "wrong markdown kind",
    built: VALID.quoted,
    mutate: (tree) =>
      setField(nodeWith(tree, "UsecaseLabel"), "kind", "string"),
    expected: "the label kind from its written delimiter",
  },
  {
    name: "wrong JSON interior",
    built: VALID.json,
    mutate: (tree) =>
      setField(nodeWith(tree, "UsecaseJsonDataBlock"), "value", "wrong"),
    expected: "value is not its written text",
  },
  {
    name: "nonopaque JSON token",
    built: VALID.json,
    mutate: (tree) => {
      const token = tree.tokens.find((t) => t.type === "RawText")
      if (token === undefined) throw new Error("missing interior")
      setField(token, "type", "Identifier")
    },
    expected: "opaque RawText interior",
  },
  {
    name: "wrong native property key type",
    built: VALID.metadata,
    mutate: (tree) =>
      setField(
        nodeWith(tree, "UsecaseMetadataProperty"),
        "key",
        structuredClone(nodeWith(tree, "UsecaseMetadata")),
      ),
    expected: "the field key holds a UsecaseMetadata",
  },
  {
    name: "empty actor list",
    built: VALID.actor,
    mutate: (tree) =>
      setField(nodeWith(tree, "UsecaseActorStatement"), "actors", []),
    expected: "the list actors is empty",
  },
  {
    name: "missing boundary body",
    built: VALID.boundary,
    mutate: (tree) =>
      setField(nodeWith(tree, "UsecaseSystemBoundaryStatement"), "body", []),
    expected: "the tokens that the node writes itself and its child nodes",
  },
  {
    name: "wrong direction",
    built: VALID.direction,
    mutate: (tree) =>
      setField(nodeWith(tree, "UsecaseDirectionStatement"), "direction", "LR"),
    expected: "the tokens that the node writes itself and its child nodes",
  },
  {
    name: "CSS property wrong name value",
    built: VALID.style,
    mutate: (tree) =>
      setField(nodeWith(tree, "UsecaseIdentifier"), "name", "wrong"),
    expected: "name is not its written text",
  },
  {
    name: "empty classes",
    built: VALID.classes,
    mutate: (tree) =>
      setField(nodeWith(tree, "UsecaseClassStatement"), "classes", []),
    expected: "the list classes is empty",
  },
]

describe("usecase tree checks", () => {
  for (const [name, make] of Object.entries(VALID))
    it(`accepts the hand-built ${name} tree`, () => {
      const test = make()
      expect(checkTree(test.source, test.tree)).toEqual([])
    })
  itFailsEach(BROKEN)

  it("copies all child field types and visit order from the AST tables", () => {
    const fields = readFieldTables()
    const order = readChildFields()
    for (const [type, children] of Object.entries(USECASE_CHILD_TYPES)) {
      expect(Object.keys(children)).toEqual(order.get(type))
      for (const [field, types] of Object.entries(children)) {
        const text = fields.get(type)?.get(field) ?? ""
        if (text.includes("UsecaseStatement"))
          expect(types).toEqual(USECASE_CHILD_TYPES.UsecaseDiagram.body)
        else if (text === "list of boundary declarations")
          expect(types).toEqual([
            "UsecaseActorStatement",
            "UsecaseEntityStatement",
          ])
        else
          expect(types).toEqual(
            text.match(/\b(?:Usecase\w+|Identifier|StringLiteral)\b/gu),
          )
      }
    }
    const meanings = readFieldMeanings()
    for (const [type, valueFields] of Object.entries(USECASE_FIELD_WORDS))
      for (const [field, words] of Object.entries(valueFields))
        for (const word of words)
          expect(meanings.get(type)?.get(field)).toContain(word)
  })

  const rejected: readonly [string, () => Built, string][] = [
    [
      "three line breaks after the last metadata property without a comma",
      () =>
        built("usecase-beta\nactor U@{type:hollow\n\n\n}\n", (kit) => [
          actor(kit, "U", { metadata: [["type", "hollow"]] }),
        ]),
      "the trailing comma and line breaks must total at most two",
    ],
    [
      "four line breaks after the last metadata property without a comma",
      () =>
        built("usecase-beta\nactor U@{type:hollow\n\n\n\n}\n", (kit) => [
          actor(kit, "U", { metadata: [["type", "hollow"]] }),
        ]),
      "the trailing comma and line breaks must total at most two",
    ],
    [
      "three CRLF pairs after the last metadata property without a comma",
      () =>
        built(
          "usecase-beta\r\nactor U@{type:hollow\r\n\r\n\r\n}\r\n",
          (kit) => [actor(kit, "U", { metadata: [["type", "hollow"]] })],
        ),
      "the trailing comma and line breaks must total at most two",
    ],
    [
      "three line breaks including whitespace-only lines after a property",
      () =>
        built("usecase-beta\nactor U@{type:hollow\n  \n  \n}\n", (kit) => [
          actor(kit, "U", { metadata: [["type", "hollow"]] }),
        ]),
      "the trailing comma and line breaks must total at most two",
    ],
    [
      "three line breaks including tab-only lines after a property",
      () =>
        built("usecase-beta\nactor U@{type:hollow\n\t\n\t\n}\n", (kit) => [
          actor(kit, "U", { metadata: [["type", "hollow"]] }),
        ]),
      "the trailing comma and line breaks must total at most two",
    ],
    [
      "three line breaks after the second metadata property",
      () =>
        built(
          "usecase-beta\nactor U@{type:hollow,business:true\n\n\n}\n",
          (kit) => [
            actor(kit, "U", {
              metadata: [
                ["type", "hollow"],
                ["business", "true", ","],
              ],
            }),
          ],
        ),
      "the trailing comma and line breaks must total at most two",
    ],
    [
      "edge metadata ending with three line breaks",
      () =>
        built("usecase-beta\nA e@--> B\ne@{animate:true\n\n\n}\n", (kit) => [
          identifiedRelationship(kit),
          update(kit, "e", [["animate", "true"]]),
        ]),
      "the trailing comma and line breaks must total at most two",
    ],
    [
      "three metadata tail line breaks after comment removal without a comma",
      () =>
        built("usecase-beta\nactor U@{type:hollow\n%% c\n\n\n}\n", (kit) => [
          actorWithMetadataTail(kit, { comma: false, comment: true }),
        ]),
      "the trailing comma and line breaks must total at most two",
    ],
    [
      "two line breaks after a metadata trailing comma",
      () =>
        built("usecase-beta\nactor U@{type:hollow,\n\n}\n", (kit) => [
          actorWithMetadataTail(kit),
        ]),
      "the trailing comma and line breaks must total at most two",
    ],
    [
      "three line breaks after a metadata trailing comma",
      () =>
        built("usecase-beta\nactor U@{type:hollow,\n\n\n}\n", (kit) => [
          actorWithMetadataTail(kit),
        ]),
      "the trailing comma and line breaks must total at most two",
    ],
    [
      "two padded line breaks after a metadata trailing comma",
      () =>
        built("usecase-beta\nactor U@{type:hollow, \t\n \t\n\t }\n", (kit) => [
          actorWithMetadataTail(kit),
        ]),
      "the trailing comma and line breaks must total at most two",
    ],
    [
      "two CRLF pairs after a metadata trailing comma",
      () =>
        built("usecase-beta\r\nactor U@{type:hollow,\r\n\r\n}\r\n", (kit) => [
          actorWithMetadataTail(kit),
        ]),
      "the trailing comma and line breaks must total at most two",
    ],
    [
      "three CRLF pairs after a metadata trailing comma",
      () =>
        built(
          "usecase-beta\r\nactor U@{type:hollow,\r\n\r\n\r\n}\r\n",
          (kit) => [actorWithMetadataTail(kit)],
        ),
      "the trailing comma and line breaks must total at most two",
    ],
    [
      "a metadata trailing comma with two line breaks after comment removal",
      () =>
        built("usecase-beta\nactor U@{type:hollow,\n%% c\n\n}\n", (kit) => [
          actorWithMetadataTail(kit, { comment: true }),
        ]),
      "the trailing comma and line breaks must total at most two",
    ],
    [
      "a JSON prefix after a Word component inside a CSS value",
      () =>
        built("usecase-beta\nA\nstyle A color:red json J@ {}\n", (kit) => [
          entity(kit, "A"),
          style(kit, "A", "color", "red json J@ {}"),
        ]),
      "the CSS value has no complete style-component production",
    ],
    [
      "a JSON prefix immediately after a hash-color component",
      () =>
        built("usecase-beta\nA\nstyle A color:#abcdefjson J@ {}\n", (kit) => [
          entity(kit, "A"),
          style(kit, "A", "color", "#abcdefjson J@ {}"),
        ]),
      "the CSS value has no complete style-component production",
    ],
    [
      "a circle token split between an opening and its label",
      () =>
        built("usecase-beta\nA --order --> B\n", (kit) => [
          splitRelationship(kit, "--", "order", "-->"),
        ]),
      "the arrow has no complete lexical operator",
    ],
    [
      "a cross token split between an opening and its label",
      () =>
        built("usecase-beta\nA --xray --> B\n", (kit) => [
          splitRelationship(kit, "--", "xray", "-->"),
        ]),
      "the arrow has no complete lexical operator",
    ],
    [
      "a maximal markerless token split into an opening and label dash",
      () =>
        built("usecase-beta\nA ---lpha --> B\n", (kit) => [
          splitRelationship(kit, "--", "-lpha", "-->"),
        ]),
      "the arrow has no complete lexical operator",
    ],
    [
      "a maximal backward token split into an opening and label dash",
      () =>
        built("usecase-beta\nA <---lpha -- B\n", (kit) => [
          splitRelationship(kit, "<--", "-lpha", "--"),
        ]),
      "the arrow has no complete lexical operator",
    ],
    [
      "a JSON prefix read as an empty-object CSS value",
      () =>
        built("usecase-beta\nA\nstyle A color:json J@ {}\n", (kit) => [
          entity(kit, "A"),
          style(kit, "A", "color", "json J@ {}"),
        ]),
      "the CSS value has no complete style-component production",
    ],
    [
      "a JSON prefix read as a classDef CSS value",
      () =>
        built("usecase-beta\nclassDef hot color:json J@ {}\n", (kit) => [
          classDefinition(kit, "json J@ {}"),
        ]),
      "the CSS value has no complete style-component production",
    ],
    [
      "a JSON prefix read as a nonempty-object CSS value",
      () =>
        built('usecase-beta\nA\nstyle A color:json J@ {"a":1}\n', (kit) => [
          entity(kit, "A"),
          style(kit, "A", "color", 'json J@ {"a":1}'),
        ]),
      "the CSS value has no complete style-component production",
    ],
    [
      "keyword-longer-alt before CSS identifier",
      () =>
        built("usecase-beta\nA\nstyle A actorName-color:red\n", (kit) => [
          entity(kit, "A"),
          style(kit, "A", "actorName-color", "red"),
        ]),
      "lexical name production",
    ],
    [
      "cross-kind symbol collision",
      () =>
        built("usecase-beta\nactor A\nA\n", (kit) => [
          actor(kit, "A"),
          entity(kit, "A"),
        ]),
      "duplicate or conflicting symbol",
    ],
    [
      "a generated declaration repeated",
      () =>
        built('usecase-beta\n"same"\n"same"\n', (kit) => [
          entity(kit, null, { label: ['"same"', "string"] }),
          entity(kit, null, { label: ['"same"', "string"] }),
        ]),
      "duplicate or conflicting symbol",
    ],
    [
      "a reference-only class suffix",
      () =>
        built("usecase-beta\nA:::hot --> B\n", (kit) => {
          const source = element(kit, "A", false, { classes: ["hot"] })
          const mark = arrow(kit, "-->")
          const target = element(kit, "B")
          return [
            kit.node("UsecaseRelationshipStatement", hull(source, target), {
              source,
              target,
              id: null,
              kind: "association",
              opening: null,
              label: null,
              arrow: mark,
            }),
          ]
        }),
      "class suffix on a reference-only endpoint",
    ],
    [
      "a generalization across element kinds",
      () =>
        built("usecase-beta\nactor A\nA --|> B\n", (kit) => {
          const declaration = actor(kit, "A")
          const source = element(kit, "A")
          const mark = arrow(kit, "--|>", { endMarker: "triangle" })
          const target = element(kit, "B")
          return [
            declaration,
            kit.node("UsecaseRelationshipStatement", hull(source, target), {
              source,
              target,
              id: null,
              kind: "generalization",
              opening: null,
              label: null,
              arrow: mark,
            }),
          ]
        }),
      "generalization requires two actors or two usecases",
    ],
    [
      "native JSON properties",
      () =>
        built("usecase-beta\njson J@{}\nJ@{business:true}\n", (kit) => [
          json(kit, "J", ""),
          update(kit, "J", [["business", "true"]]),
        ]),
      "unknown json metadata key",
    ],
    [
      "an unresolved style target",
      () =>
        built("usecase-beta\nstyle A color:red\n", (kit) => [
          style(kit, "A", "color", "red"),
        ]),
      "unresolved target",
    ],

    [
      "keyword-shaped ordinary id",
      () => built("usecase-beta\nactor end\n", (kit) => [actor(kit, "end")]),
      "lexical Identifier",
    ],
    [
      "hyphenated ordinary id",
      () => built("usecase-beta\nactor a-b\n", (kit) => [actor(kit, "a-b")]),
      "lexical Identifier",
    ],
    [
      "decimal native value",
      () =>
        built("usecase-beta\nactor A@{icon:1.5}\n", (kit) => [
          actor(kit, "A", { metadata: [["icon", "1.5"]] }),
        ]),
      "lexical Identifier",
    ],
    [
      "unknown native property",
      () =>
        built("usecase-beta\nactor A@{unknown:true}\n", (kit) => [
          actor(kit, "A", { metadata: [["unknown", "true"]] }),
        ]),
      "unknown actor metadata key",
    ],
    [
      "quoted native boolean",
      () =>
        built('usecase-beta\nactor A@{business:"true"}\n', (kit) => [
          actor(kit, "A", { metadata: [["business", '"true"']] }),
        ]),
      "wrong scalar type",
    ],
    [
      "conflicting inline duplicate",
      () =>
        built("usecase-beta\nactor A@{type:hollow,type:normal}\n", (kit) => [
          actor(kit, "A", {
            metadata: [
              ["type", "hollow"],
              ["type", "normal", ","],
            ],
          }),
        ]),
      "conflicting declaration metadata",
    ],
    [
      "incompatible actor geometry",
      () =>
        built('usecase-beta\nactor A@{type:hollow,icon:"fa:user"}\n', (kit) => [
          actor(kit, "A", {
            metadata: [
              ["type", "hollow"],
              ["icon", '"fa:user"', ","],
            ],
          }),
        ]),
      "nonempty icon conflicts",
    ],
    [
      "incompatible usecase geometry",
      () =>
        built("usecase-beta\nA[a]@{business:true}\n", (kit) => [
          entity(kit, "A", {
            shape: "rectangle",
            label: ["a", "text"],
            metadata: [["business", "true"]],
          }),
        ]),
      "rectangle cannot be a business",
    ],
    [
      "unresolved update",
      () => built("usecase-beta\nA@{}\n", (kit) => [update(kit, "A", [])]),
      "unresolved target",
    ],
    [
      "CSS keyword prefix",
      () =>
        built("usecase-beta\nA\nstyle A actor-name:red\n", (kit) => [
          entity(kit, "A"),
          style(kit, "A", "actor-name", "red"),
        ]),
      "lexical name production",
    ],
    [
      "CSS Unicode value",
      () =>
        built("usecase-beta\nA\nstyle A color:red\u00a0\n", (kit) => [
          entity(kit, "A"),
          style(kit, "A", "color", "red\u00a0"),
        ]),
      "style-component production",
    ],
    [
      "bare label merged strings",
      () =>
        built('usecase-beta\nA[bare "quoted"]\n', (kit) => [
          entity(kit, "A", {
            shape: "rectangle",
            label: ['bare "quoted"', "text"],
          }),
        ]),
      "complete lexical unit",
    ],
    [
      "single quote does not protect JSON braces",
      () =>
        built("usecase-beta\njson J@{'a':'}'}\n", (kit) => [
          json(kit, "J", "'a':'}'"),
        ]),
      "first balancing close",
    ],
    [
      "newline inside native string",
      () =>
        built("usecase-beta\nactor A@{icon:'a\nb'}\n", (kit) => [
          actor(kit, "A", { metadata: [["icon", "'a\nb'"]] }),
        ]),
      "closed plain-string unit",
    ],
    [
      "same-line statements",
      () =>
        built("usecase-beta\nA B\n", (kit) => [
          entity(kit, "A"),
          entity(kit, "B"),
        ]),
      "physical newline",
    ],
  ]
  for (const [name, make, message] of rejected)
    it(`rejects ${name}`, () => {
      const test = make()
      expect(
        checkTree(test.source, test.tree).some((p) =>
          p.message.includes(message),
        ),
      ).toBe(true)
    })
})
