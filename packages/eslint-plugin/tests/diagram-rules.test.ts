/**
 * Checks that the rules of a diagram type report nothing on the trees of the
 * other diagram types. ESLint calls the handler of a rule by the type of a
 * node, and the node types of a diagram type are not those of another, so a
 * rule whose handlers are all for node types of its own diagram type is never
 * called on the tree of another. A rule that started from `Root`, from `*`,
 * or from a node type that every diagram type shares would be called on any
 * tree: the rules of a diagram type must not. The check reads the selectors
 * that each rule registers, and the node types of a diagram type are those
 * that start with the name of its `...Diagram` node in the visitor keys of the
 * parser.
 */
import { Linter } from "eslint"
import { visitorKeys } from "@mmd-toolkit/parser"
import { describe, expect, it } from "vitest"
import plugin from "../src/index.ts"
import { rules } from "../src/rules/index.ts"
import { DIAGRAM_ORDER, diagramOf } from "../tools/rule-docs.ts"
import { LANGUAGE_CONFIG } from "./helpers.ts"

const NODE_TYPES = Object.keys(visitorKeys)

/** The name of the node type of the diagram body, `Diagram` left out, by the name of the diagram type: `GitGraph` for `gitgraph`. */
const NODE_PREFIXES = new Map(
  NODE_TYPES.filter((type) => type.endsWith("Diagram")).map((type) => {
    const prefix = type.slice(0, -"Diagram".length)
    return [prefix.toLowerCase(), prefix]
  }),
)

/** The start of a word of a node type name: a capital letter or a digit. */
const WORD_START = /^[\dA-Z]/u

/**
 * The node types of the diagram type `diagram`: the types whose name starts
 * with its prefix and goes on with a new word or ends, so that `Er` takes
 * `ErEntity` and not `ErrorDiagram`.
 */
function nodeTypesOf(diagram: string): Set<string> {
  const prefix = NODE_PREFIXES.get(diagram)
  if (prefix === undefined) throw new Error(`No diagram node of ${diagram}`)
  return new Set(
    NODE_TYPES.filter((type) => {
      const rest = type.slice(prefix.length)
      return type.startsWith(prefix) && (rest === "" || WORD_START.test(rest))
    }),
  )
}

/** The selectors that each rule registers, by the name of the rule. */
function registeredSelectors(): Map<string, string[]> {
  const registered = new Map<string, string[]>()
  const wrapped = Object.fromEntries(
    Object.entries(rules).map(([name, rule]) => [
      name,
      {
        ...rule,
        create(context: never) {
          const listeners = rule.create(context)
          registered.set(name, Object.keys(listeners))
          return listeners
        },
      },
    ]),
  )
  // ESLint creates the listeners of a rule when it lints a text with the rule.
  new Linter({ configType: "flat" }).verify(
    "flowchart LR\n  A\n",
    {
      ...LANGUAGE_CONFIG,
      plugins: { "@mmd-toolkit": { ...plugin, rules: wrapped } },
      rules: Object.fromEntries(
        Object.keys(rules).map((name) => [`@mmd-toolkit/${name}`, "error"]),
      ),
    },
    "input.mmd",
  )
  return registered
}

const registered = registeredSelectors()

describe("the rules of a diagram type", () => {
  it("are all created when ESLint lints a text", () => {
    // A check that sees no selector passes whatever the rules register.
    expect([...registered.keys()].sort()).toEqual(Object.keys(rules).sort())
  })

  it.each(DIAGRAM_ORDER)(
    "of the %s diagram listen only to nodes of that diagram type",
    (diagram) => {
      const names = Object.keys(rules).filter(
        (name) => diagramOf(name) === diagram,
      )
      expect(names.length).toBeGreaterThan(0)
      const nodeTypes = nodeTypesOf(diagram)
      for (const name of names) {
        const selectors = registered.get(name) ?? []
        expect(selectors.length, name).toBeGreaterThan(0)
        for (const selector of selectors) {
          const type = selector.endsWith(":exit")
            ? selector.slice(0, -":exit".length)
            : selector
          expect(nodeTypes.has(type), `${name}: ${selector}`).toBe(true)
        }
      }
    },
  )

  it("have node types that no other diagram type has", () => {
    // The diagram types without rules are compared too: `Error` is one.
    const owners = new Map<string, string[]>()
    for (const diagram of NODE_PREFIXES.keys()) {
      for (const type of nodeTypesOf(diagram)) {
        owners.set(type, [...(owners.get(type) ?? []), diagram])
      }
    }
    expect([...owners].filter(([, diagrams]) => diagrams.length > 1)).toEqual(
      [],
    )
  })
})
