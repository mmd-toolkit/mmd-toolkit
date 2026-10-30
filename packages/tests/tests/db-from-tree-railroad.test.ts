/* eslint max-nested-callbacks: off -- These callbacks mirror the fixed authored expression trees. */
import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import { dbFromTree } from "../src/db-from-tree/index.ts"
import type { DbTreeRoot } from "../src/db-from-tree/index.ts"
import type { CheckedNode } from "../src/check-tree/types.ts"
import type { EmbeddedValues } from "../src/mermaid.ts"
import {
  cssSupportsColor,
  embeddedValuesOf,
  loadFixture,
} from "../src/index.ts"
import type { Kit } from "./check-tree-built.ts"
import {
  any,
  buildRailroad,
  call,
  common,
  count,
  exception,
  group,
  identifier,
  list,
  member,
  numeric,
  postfix,
  predicate,
  repeat,
  repeatRange,
  rule,
  special,
  string,
} from "./railroad-built.ts"
import type { RailroadDialect } from "./railroad-built.ts"

/** Read an explicitly built accepted tree through the shared public entry. */
function summary(
  source: string,
  dialect: RailroadDialect,
  make: (kit: Kit) => CheckedNode[],
  embedded: EmbeddedValues = {
    config: { securityLevel: "strict" },
    title: undefined,
    dataBlockEffects: [],
  },
) {
  const { tree } = buildRailroad(source, dialect, make)
  expect(checkTree(source, tree)).toEqual([])
  return dbFromTree(
    source,
    tree as unknown as DbTreeRoot,
    embedded,
    cssSupportsColor,
  )
}

describe("railroad Db from hand-built trees", () => {
  it("publishes empty defaults for the four ids without a diagram title", () => {
    expect(summary("railroad-beta", "railroad", () => [])).toEqual({
      accTitle: "",
      accDescr: "",
      rules: [],
    })
    expect(summary("railroad-ebnf-beta", "railroadEbnf", () => [])).toEqual({
      accTitle: "",
      accDescr: "",
      rules: [],
    })
    expect(summary("railroad-abnf-beta", "railroadAbnf", () => [])).toEqual({
      accTitle: "",
      accDescr: "",
      rules: [],
    })
    expect(summary("railroad-peg-beta", "railroadPeg", () => [])).toEqual({
      accTitle: "",
      accDescr: "",
      rules: [],
    })
  })
  it("folds singleton IR calls and retains nested lists, optional and both repetition forms", () => {
    const result = summary(
      'railroad-beta\nr = sequence(choice(terminal("")), sequence(nonterminal("r"),special("x")),optional(terminal("a")),zeroOrMore(terminal("b")),oneOrMore(terminal("c")));',
      "railroad",
      (kit) => [
        rule(kit, "r", () =>
          list(
            kit,
            "SequenceCall",
            [
              () =>
                member(kit, () =>
                  list(
                    kit,
                    "ChoiceCall",
                    [
                      () =>
                        member(kit, () =>
                          call(kit, "terminal", () => string(kit, '""')),
                        ),
                    ],
                    [],
                  ),
                ),
              () =>
                member(kit, () =>
                  list(
                    kit,
                    "SequenceCall",
                    [
                      () =>
                        member(kit, () =>
                          call(kit, "nonterminal", () => string(kit, '"r"')),
                        ),
                      () =>
                        member(kit, () =>
                          call(kit, "special", () => string(kit, '"x"')),
                        ),
                    ],
                    [","],
                  ),
                ),
              () =>
                member(kit, () =>
                  call(kit, "optional", () =>
                    call(kit, "terminal", () => string(kit, '"a"')),
                  ),
                ),
              () =>
                member(kit, () =>
                  call(kit, "zeroOrMore", () =>
                    call(kit, "terminal", () => string(kit, '"b"')),
                  ),
                ),
              () =>
                member(kit, () =>
                  call(kit, "oneOrMore", () =>
                    call(kit, "terminal", () => string(kit, '"c"')),
                  ),
                ),
            ],
            [",", ",", ",", ","],
          ),
        ),
      ],
    )
    expect(result.rules).toEqual([
      {
        name: "r",
        definition: {
          type: "sequence",
          elements: [
            { type: "terminal", value: "" },
            {
              type: "sequence",
              elements: [
                { type: "nonterminal", name: "r" },
                { type: "special", text: "x" },
              ],
            },
            { type: "optional", element: { type: "terminal", value: "a" } },
            {
              type: "repetition",
              min: 0,
              max: "Infinity",
              element: { type: "terminal", value: "b" },
            },
            {
              type: "repetition",
              min: 1,
              max: "Infinity",
              element: { type: "terminal", value: "c" },
            },
          ],
        },
      },
    ])
  })
  it("converts only n/r/t escapes in IR strings, including reference and special arguments", () => {
    expect(
      summary(
        'railroad-beta\nr = sequence(terminal("a\\b\\f\\n\\r\\t\\v\\0\\u0041\\q"),nonterminal(\'a\\\'b\'),special("a\\"b"));',
        "railroad",
        (kit) => [
          rule(kit, "r", () =>
            list(
              kit,
              "SequenceCall",
              [
                () =>
                  member(kit, () =>
                    call(kit, "terminal", () =>
                      string(kit, '"a\\b\\f\\n\\r\\t\\v\\0\\u0041\\q"'),
                    ),
                  ),
                () =>
                  member(kit, () =>
                    call(kit, "nonterminal", () => string(kit, "'a\\'b'")),
                  ),
                () =>
                  member(kit, () =>
                    call(kit, "special", () => string(kit, '"a\\"b"')),
                  ),
              ],
              [",", ","],
            ),
          ),
        ],
      ).rules,
    ).toEqual([
      {
        name: "r",
        definition: {
          type: "sequence",
          elements: [
            { type: "terminal", value: "abf\n\r\tv0u0041q" },
            { type: "nonterminal", name: "a'b" },
            { type: "special", text: 'a"b' },
          ],
        },
      },
    ])
  })
  it("folds EBNF groups, trims special text and applies exceptions and postfixes in written order", () => {
    const result = summary(
      'railroad-ebnf-beta\nr ::= (["a"])*+ - ?  x\n y  ??;',
      "railroadEbnf",
      (kit) => [
        rule(
          kit,
          "r",
          () =>
            postfix(
              kit,
              () =>
                exception(
                  kit,
                  () =>
                    postfix(
                      kit,
                      () =>
                        postfix(
                          kit,
                          () =>
                            group(kit, "(", () =>
                              group(kit, "[", () => string(kit, '"a"')),
                            ),
                          "*",
                        ),
                      "+",
                    ),
                  () => special(kit, "?  x\n y  ?"),
                ),
              "?",
            ),
          "::=",
        ),
      ],
    )
    expect(result.rules).toEqual([
      {
        name: "r",
        definition: {
          type: "optional",
          element: {
            type: "sequence",
            elements: [
              {
                type: "repetition",
                min: 1,
                max: "Infinity",
                element: {
                  type: "repetition",
                  min: 0,
                  max: "Infinity",
                  element: {
                    type: "optional",
                    element: { type: "terminal", value: "a" },
                  },
                },
              },
              { type: "terminal", value: "-" },
              { type: "special", text: "x\n y" },
            ],
          },
        },
      },
    ])
    expect(
      summary(
        "railroad-ebnf-beta\nr = {\"a\\n\\b\"} | 'b\\t\\q';",
        "railroadEbnf",
        (kit) => [
          rule(kit, "r", () =>
            list(
              kit,
              "ChoiceExpression",
              [
                () =>
                  member(kit, () =>
                    group(kit, "{", () => string(kit, '"a\\n\\b"')),
                  ),
                () => member(kit, () => string(kit, "'b\\t\\q'")),
              ],
              ["|"],
            ),
          ),
        ],
      ).rules,
    ).toEqual([
      {
        name: "r",
        definition: {
          type: "choice",
          alternatives: [
            {
              type: "repetition",
              min: 0,
              max: "Infinity",
              element: { type: "terminal", value: "a\nb" },
            },
            { type: "terminal", value: "b\tq" },
          ],
        },
      },
    ])
  })
  it("publishes ABNF spellings, omitted and padded bounds, exact counts and reversed bounds", () => {
    const result = summary(
      'railroad-abnf-beta\nr = *1"a" 00*01"b" *0"c" 1*1"d" 4*2"e" 3"f" *"g" %X41.42-43;',
      "railroadAbnf",
      (kit) => [
        rule(kit, "r", () =>
          list(
            kit,
            "SequenceExpression",
            [
              () =>
                member(kit, () =>
                  repeat(
                    kit,
                    () => repeatRange(kit, null, "1"),
                    () => string(kit, '"a"'),
                  ),
                ),
              () =>
                member(kit, () =>
                  repeat(
                    kit,
                    () => repeatRange(kit, "00", "01"),
                    () => string(kit, '"b"'),
                  ),
                ),
              () =>
                member(kit, () =>
                  repeat(
                    kit,
                    () => repeatRange(kit, null, "0"),
                    () => string(kit, '"c"'),
                  ),
                ),
              () =>
                member(kit, () =>
                  repeat(
                    kit,
                    () => repeatRange(kit, "1", "1"),
                    () => string(kit, '"d"'),
                  ),
                ),
              () =>
                member(kit, () =>
                  repeat(
                    kit,
                    () => repeatRange(kit, "4", "2"),
                    () => string(kit, '"e"'),
                  ),
                ),
              () =>
                member(kit, () =>
                  repeat(
                    kit,
                    () => count(kit, "3"),
                    () => string(kit, '"f"'),
                  ),
                ),
              () =>
                member(kit, () =>
                  repeat(
                    kit,
                    () => repeatRange(kit, null, null),
                    () => string(kit, '"g"'),
                  ),
                ),
              () => member(kit, () => numeric(kit, "%X41.42-43")),
            ],
            ["", "", "", "", "", "", ""],
          ),
        ),
      ],
    )
    expect(result.rules).toEqual([
      {
        name: "r",
        definition: {
          type: "sequence",
          elements: [
            { type: "optional", element: { type: "terminal", value: "a" } },
            { type: "optional", element: { type: "terminal", value: "b" } },
            {
              type: "repetition",
              min: 0,
              max: 0,
              element: { type: "terminal", value: "c" },
            },
            {
              type: "repetition",
              min: 1,
              max: 1,
              element: { type: "terminal", value: "d" },
            },
            {
              type: "repetition",
              min: 4,
              max: 2,
              element: { type: "terminal", value: "e" },
            },
            {
              type: "repetition",
              min: 3,
              max: 3,
              element: { type: "terminal", value: "f" },
            },
            {
              type: "repetition",
              min: 0,
              max: "Infinity",
              element: { type: "terminal", value: "g" },
            },
            { type: "terminal", value: "%X41.42-43" },
          ],
        },
      },
    ])
  })
  it("does not decode ABNF strings and folds ABNF groups while preserving optional groups", () => {
    expect(
      summary(
        'railroad-abnf-beta\nr = ("a\\n") / ["b\\\n"];',
        "railroadAbnf",
        (kit) => [
          rule(kit, "r", () =>
            list(
              kit,
              "ChoiceExpression",
              [
                () =>
                  member(kit, () =>
                    group(kit, "(", () => string(kit, '"a\\n"')),
                  ),
                () =>
                  member(kit, () =>
                    group(kit, "[", () => string(kit, '"b\\\n"')),
                  ),
              ],
              ["/"],
            ),
          ),
        ],
      ).rules,
    ).toEqual([
      {
        name: "r",
        definition: {
          type: "choice",
          alternatives: [
            { type: "terminal", value: "a\\n" },
            { type: "optional", element: { type: "terminal", value: "b\\\n" } },
          ],
        },
      },
    ])
  })
  it("uses numberOrText for non-finite ABNF bounds", async () => {
    const fixture = await loadFixture("railroad", "abnf-db-repeat-overflow")
    const raw = fixture.input.slice(
      fixture.input.indexOf("r = ") + 4,
      fixture.input.indexOf('"a"'),
    )
    expect(
      summary(fixture.input, "railroadAbnf", (kit) => [
        rule(kit, "r", () =>
          repeat(
            kit,
            () => count(kit, raw),
            () => string(kit, '"a"'),
          ),
        ),
      ]),
    ).toEqual(fixture.expected.accepted ? fixture.expected.db : null)
  })
  it("labels PEG predicates after folding and retains unescaped quotes and decoded LF", () => {
    expect(
      summary(
        'railroad-peg-beta\nr <- &("a") !(b) &(&a) &\'a"b\' !"\\n" !. !("x" "y") &"z"*;',
        "railroadPeg",
        (kit) => [
          rule(
            kit,
            "r",
            () =>
              list(
                kit,
                "SequenceExpression",
                [
                  () =>
                    member(kit, () =>
                      predicate(kit, "&", () =>
                        group(kit, "(", () => string(kit, '"a"')),
                      ),
                    ),
                  () =>
                    member(kit, () =>
                      predicate(kit, "!", () =>
                        group(kit, "(", () => identifier(kit, "b")),
                      ),
                    ),
                  () =>
                    member(kit, () =>
                      predicate(kit, "&", () =>
                        group(kit, "(", () =>
                          predicate(kit, "&", () => identifier(kit, "a")),
                        ),
                      ),
                    ),
                  () =>
                    member(kit, () =>
                      predicate(kit, "&", () => string(kit, "'a\"b'")),
                    ),
                  () =>
                    member(kit, () =>
                      predicate(kit, "!", () => string(kit, '"\\n"')),
                    ),
                  () => member(kit, () => predicate(kit, "!", () => any(kit))),
                  () =>
                    member(kit, () =>
                      predicate(kit, "!", () =>
                        group(kit, "(", () =>
                          list(
                            kit,
                            "SequenceExpression",
                            [
                              () => member(kit, () => string(kit, '"x"')),
                              () => member(kit, () => string(kit, '"y"')),
                            ],
                            [""],
                          ),
                        ),
                      ),
                    ),
                  () =>
                    member(kit, () =>
                      predicate(kit, "&", () =>
                        postfix(kit, () => string(kit, '"z"'), "*"),
                      ),
                    ),
                ],
                ["", "", "", "", "", "", ""],
              ),
            "<-",
          ),
        ],
      ).rules,
    ).toEqual([
      {
        name: "r",
        definition: {
          type: "sequence",
          elements: [
            { type: "special", text: '&"a"' },
            { type: "special", text: "!b" },
            { type: "special", text: "&&a" },
            { type: "special", text: '&"a"b"' },
            { type: "special", text: '!"\n"' },
            { type: "special", text: "!." },
            { type: "special", text: "!(...)" },
            { type: "special", text: "&(...)" },
          ],
        },
      },
    ])
  })
  it("keeps duplicate rules and unknown/prototype-shaped references in source order", () => {
    expect(
      summary(
        'railroad-peg-beta\nconstructor <- missing;constructor <- ("x")?;__proto__ <- "a\\r\\t\\q";',
        "railroadPeg",
        (kit) => [
          rule(kit, "constructor", () => identifier(kit, "missing"), "<-"),
          rule(
            kit,
            "constructor",
            () =>
              postfix(
                kit,
                () => group(kit, "(", () => string(kit, '"x"')),
                "?",
              ),
            "<-",
          ),
          rule(kit, "__proto__", () => string(kit, '"a\\r\\t\\q"'), "<-"),
        ],
      ).rules,
    ).toEqual([
      {
        name: "constructor",
        definition: { type: "nonterminal", name: "missing" },
      },
      {
        name: "constructor",
        definition: {
          type: "optional",
          element: { type: "terminal", value: "x" },
        },
      },
      { name: "__proto__", definition: { type: "terminal", value: "a\r\tq" } },
    ])
  })
  it("publishes the last accessibility assignment, including empty resets, and ignores all titles", () => {
    expect(
      summary(
        "railroad-beta\ntitle Body\naccTitle:  A   B  \naccDescr { D\n   E }",
        "railroad",
        (kit) => [
          common(kit, "Title", "Body"),
          common(kit, "AccTitle", "  A   B  "),
          common(kit, "AccDescrBlock", "D\n   E"),
        ],
        {
          config: { securityLevel: "strict" },
          title: "Front",
          dataBlockEffects: [],
        },
      ),
    ).toEqual({ accTitle: "A B", accDescr: "D\nE", rules: [] })
    expect(
      summary(
        "railroad-ebnf-beta\naccTitle: old\naccDescr: old\naccTitle:\naccDescr {}",
        "railroadEbnf",
        (kit) => [
          common(kit, "AccTitle", " old"),
          common(kit, "AccDescr", " old"),
          common(kit, "AccTitle", null),
          common(kit, "AccDescrBlock", null),
        ],
      ),
    ).toEqual({ accTitle: "", accDescr: "", rules: [] })
  })
  it("uses shared converted text and replaces accessibility and expression strings", () => {
    expect(
      summary(
        'railroad-beta\naccTitle: <i x="y">#65;</i>\nr = terminal("<b>=#65;</b>");',
        "railroad",
        (kit) => [
          common(kit, "AccTitle", ' <i x="y">#65;</i>'),
          rule(kit, "r", () =>
            call(kit, "terminal", () => string(kit, '"<b>=#65;</b>"')),
          ),
        ],
        {
          config: { securityLevel: "other", htmlLabels: true },
          title: undefined,
          dataBlockEffects: [],
        },
      ),
    ).toEqual({
      accTitle: "&lt;i x&equals;'y'&gt;ﬂ°°65¶ß&lt;/i&gt;",
      accDescr: "",
      rules: [
        {
          name: "r",
          definition: {
            type: "terminal",
            value: "&lt;b&gt;&equals;ﬂ°°65¶ß&lt;/b&gt;",
          },
        },
      ],
    })
  })

  const replacementCases: readonly {
    name: string
    dialect: RailroadDialect
    ruleName: string
    operator: "=" | "<-"
    definition: (kit: Kit) => CheckedNode
  }[] = [
    {
      name: "ir-config-security-level-other",
      dialect: "railroad",
      ruleName: "r_1",
      operator: "=",
      definition: (kit) =>
        list(
          kit,
          "SequenceCall",
          [
            () =>
              member(kit, () =>
                call(kit, "terminal", () => string(kit, '"x<br>y=z"')),
              ),
            () =>
              member(kit, () =>
                list(
                  kit,
                  "ChoiceCall",
                  [
                    () =>
                      member(kit, () =>
                        call(kit, "nonterminal", () =>
                          string(kit, '"<i>n</i>"'),
                        ),
                      ),
                    () =>
                      member(kit, () =>
                        call(kit, "optional", () =>
                          call(kit, "special", () => string(kit, '"s=1"')),
                        ),
                      ),
                  ],
                  [","],
                ),
              ),
            () =>
              member(kit, () =>
                call(kit, "zeroOrMore", () =>
                  call(kit, "terminal", () => string(kit, '"a<b>"')),
                ),
              ),
            () =>
              member(kit, () =>
                call(kit, "oneOrMore", () =>
                  call(kit, "terminal", () => string(kit, '"p=q"')),
                ),
              ),
          ],
          [",", ",", ","],
        ),
    },
    {
      name: "ebnf-config-security-level-other",
      dialect: "railroadEbnf",
      ruleName: "r_1",
      operator: "=",
      definition: (kit) =>
        list(
          kit,
          "ChoiceExpression",
          [
            () => member(kit, () => string(kit, '"a<b>"')),
            () =>
              member(kit, () =>
                list(
                  kit,
                  "SequenceExpression",
                  [
                    () =>
                      member(kit, () =>
                        group(kit, "[", () => identifier(kit, "name")),
                      ),
                    () =>
                      member(kit, () =>
                        group(kit, "{", () => special(kit, "? x=y ?")),
                      ),
                  ],
                  [""],
                ),
              ),
          ],
          ["|"],
        ),
    },
    {
      name: "abnf-config-security-level-other",
      dialect: "railroadAbnf",
      ruleName: "r-1",
      operator: "=",
      definition: (kit) =>
        list(
          kit,
          "ChoiceExpression",
          [
            () =>
              member(kit, () =>
                list(
                  kit,
                  "SequenceExpression",
                  [
                    () => member(kit, () => string(kit, '"a<b>="')),
                    () =>
                      member(kit, () =>
                        repeat(
                          kit,
                          () => repeatRange(kit, "2", "3"),
                          () => numeric(kit, "%x41"),
                        ),
                      ),
                  ],
                  [""],
                ),
              ),
            () =>
              member(kit, () => group(kit, "[", () => identifier(kit, "name"))),
          ],
          ["/"],
        ),
    },
    {
      name: "peg-config-security-level-other",
      dialect: "railroadPeg",
      ruleName: "r_1",
      operator: "<-",
      definition: (kit) =>
        list(
          kit,
          "SequenceExpression",
          [
            () =>
              member(kit, () =>
                predicate(kit, "&", () =>
                  group(kit, "(", () => string(kit, '"a=b"')),
                ),
              ),
            () =>
              member(kit, () =>
                predicate(kit, "!", () =>
                  group(kit, "(", () =>
                    predicate(kit, "&", () => string(kit, '"x<br>y=z"')),
                  ),
                ),
              ),
            () => member(kit, () => any(kit)),
            () =>
              member(kit, () =>
                postfix(
                  kit,
                  () =>
                    group(kit, "(", () =>
                      list(
                        kit,
                        "ChoiceExpression",
                        [
                          () => member(kit, () => string(kit, '"c<d>"')),
                          () => member(kit, () => identifier(kit, "name")),
                        ],
                        ["/"],
                      ),
                    ),
                  "?",
                ),
              ),
          ],
          ["", "", ""],
        ),
    },
  ]

  it.each(replacementCases)(
    "replaces the completed published expression: $name",
    async ({ name, dialect, ruleName, operator, definition }) => {
      const fixture = await loadFixture("railroad", name)
      expect(fixture.expected.accepted).toBe(true)
      if (!fixture.expected.accepted)
        throw new Error(`rejected fixture ${name}`)
      const embedded = embeddedValuesOf(fixture, fixture.expected)
      expect(embedded).toBeDefined()
      if (embedded === undefined) throw new Error(`missing embedded ${name}`)
      expect(
        summary(
          fixture.input,
          dialect,
          (kit) => [
            common(kit, "AccTitle", " a<b>=c"),
            common(kit, "AccDescr", " d<br>e=f"),
            rule(kit, ruleName, () => definition(kit), operator),
          ],
          embedded,
        ),
      ).toEqual(fixture.expected.db)
    },
  )
})
