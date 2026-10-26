/* eslint max-nested-callbacks: off -- These callbacks mirror the fixed authored expression trees. */
import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import {
  RAILROAD_CHILD_TYPES,
  RAILROAD_FIELD_WORDS,
} from "../src/check-tree/railroad.ts"
import type {
  CheckedNode,
  CheckedRoot,
  Placed,
} from "../src/check-tree/types.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import { nodeWith, tokenWith } from "./check-tree-built.ts"
import type { Built } from "./check-tree-built.ts"
import { copyOf, setField } from "./check-tree-recorded.ts"
import {
  commentOf,
  directiveOf,
  locationOf,
  tokenOf,
} from "./check-tree-trees.ts"
import { readChildFields } from "./spec-field-tables.ts"
import {
  any,
  buildRailroad,
  call,
  common,
  count,
  exception,
  group,
  identifier,
  ignored,
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

/** Explicit hidden occurrences at every IR call, member and rule boundary. */
function irGaps(): Built {
  return buildRailroad(
    'railroad-beta\n%%{!body}%%\naccDescr {}\nr ---\nx\n---\n= %%{!definition}%% sequence %%{!open}%% ( %%{!first}%% terminal %%{!topen}%% ( %%{!value}%% "a" %%{!tclose}%% ) %%{!after}%% , %%{!before}%% optional %%{!uopen}%% ( %%{!element}%% nonterminal("b") %%{!uclose}%% ) %%{!last}%% ) %%{!end}%% ;\n%%{!tail}%%',
    "railroad",
    (kit) => {
      /** The exact retained occurrence assigned to this named gap. */
      function h(raw: string) {
        return () => [ignored(kit, raw)]
      }

      return [
        ignored(kit, "%%{!body}%%"),
        common(kit, "AccDescrBlock", null),
        rule(
          kit,
          "r",
          () =>
            list(
              kit,
              "SequenceCall",
              [
                () =>
                  member(
                    kit,
                    () =>
                      call(kit, "terminal", () => string(kit, '"a"'), {
                        textBeforeOpen: h("%%{!topen}%%"),
                        textBeforeValue: h("%%{!value}%%"),
                        textBeforeClose: h("%%{!tclose}%%"),
                      }),
                    {
                      textBefore: h("%%{!first}%%"),
                      textAfter: h("%%{!after}%%"),
                    },
                  ),
                () =>
                  member(
                    kit,
                    () =>
                      call(
                        kit,
                        "optional",
                        () =>
                          call(kit, "nonterminal", () => string(kit, '"b"')),
                        {
                          textBeforeOpen: h("%%{!uopen}%%"),
                          textBeforeElement: h("%%{!element}%%"),
                          textBeforeClose: h("%%{!uclose}%%"),
                        },
                      ),
                    {
                      textBefore: h("%%{!before}%%"),
                      textAfter: h("%%{!last}%%"),
                    },
                  ),
              ],
              [","],
              { textBeforeOpen: h("%%{!open}%%") },
            ),
          "=",
          {
            textBeforeOperator: () => [
              ignored(kit, "---\nx\n---", "yaml-block"),
            ],
            textBeforeDefinition: h("%%{!definition}%%"),
            textBeforeTerminator: h("%%{!end}%%"),
          },
        ),
        ignored(kit, "%%{!tail}%%"),
      ]
    },
  )
}

/** Natural adjacency gives its whole native gap to the following member. */
function ebnfGaps(): Built {
  return buildRailroad(
    'railroad-ebnf-beta\nr %%{!op}%% ::= %%{!def}%% [ %%{!bracket}%% ( %%{!group}%% "a" %%{!left}%% , %%{!right}%% "b" %%{!gclose}%% ) %%{!bclose}%% ] %%{!minus}%% - %%{!rhs}%% x %%{!plus}%% + %%{!altleft}%% | %%{!altright}%% { %%{!brace}%% ? special ? %%{!braceclose}%% } %%{!adjacent}%% "d"? %%{!end}%% ;',
    "railroadEbnf",
    (kit) => {
      /** The exact retained occurrence assigned to this named gap. */
      function h(raw: string) {
        return () => [ignored(kit, raw)]
      }

      return [
        rule(
          kit,
          "r",
          () =>
            list(
              kit,
              "ChoiceExpression",
              [
                () =>
                  member(
                    kit,
                    () =>
                      postfix(
                        kit,
                        () =>
                          exception(
                            kit,
                            () =>
                              group(
                                kit,
                                "[",
                                () =>
                                  group(
                                    kit,
                                    "(",
                                    () =>
                                      list(
                                        kit,
                                        "SequenceExpression",
                                        [
                                          () =>
                                            member(
                                              kit,
                                              () => string(kit, '"a"'),
                                              { textAfter: h("%%{!left}%%") },
                                            ),
                                          () =>
                                            member(
                                              kit,
                                              () => string(kit, '"b"'),
                                              { textBefore: h("%%{!right}%%") },
                                            ),
                                        ],
                                        [","],
                                      ),
                                    {
                                      textBeforeElement: h("%%{!group}%%"),
                                      textBeforeClose: h("%%{!gclose}%%"),
                                    },
                                  ),
                                {
                                  textBeforeElement: h("%%{!bracket}%%"),
                                  textBeforeClose: h("%%{!bclose}%%"),
                                },
                              ),
                            () => identifier(kit, "x"),
                            {
                              textBeforeOperator: h("%%{!minus}%%"),
                              textBeforeRight: h("%%{!rhs}%%"),
                            },
                          ),
                        "+",
                        h("%%{!plus}%%"),
                      ),
                    { textAfter: h("%%{!altleft}%%") },
                  ),
                () =>
                  member(
                    kit,
                    () =>
                      list(
                        kit,
                        "SequenceExpression",
                        [
                          () =>
                            member(kit, () =>
                              group(
                                kit,
                                "{",
                                () => special(kit, "? special ?"),
                                {
                                  textBeforeElement: h("%%{!brace}%%"),
                                  textBeforeClose: h("%%{!braceclose}%%"),
                                },
                              ),
                            ),
                          () =>
                            member(
                              kit,
                              () => postfix(kit, () => string(kit, '"d"'), "?"),
                              { textBefore: h("%%{!adjacent}%%") },
                            ),
                        ],
                        [""],
                      ),
                    { textBefore: h("%%{!altright}%%") },
                  ),
              ],
              ["|"],
            ),
          "::=",
          {
            textBeforeOperator: h("%%{!op}%%"),
            textBeforeDefinition: h("%%{!def}%%"),
            textBeforeTerminator: h("%%{!end}%%"),
          },
        ),
      ]
    },
  )
}

/** ABNF range components stay adjacent while the completed repeat owns its next gap. */
function abnfGaps(): Built {
  return buildRailroad(
    'railroad-abnf-beta\nr = 002*004 %%{!repeat}%% ( %%{!open}%% "a" %%{!left}%% / %%{!right}%% %X41 %%{!close}%% ) %%{!adjacent}%% [ %%{!optional}%% x %%{!oclose}%% ];',
    "railroadAbnf",
    (kit) => {
      /** The exact retained occurrence assigned to this named gap. */
      function h(raw: string) {
        return () => [ignored(kit, raw)]
      }

      return [
        rule(kit, "r", () =>
          list(
            kit,
            "SequenceExpression",
            [
              () =>
                member(kit, () =>
                  repeat(
                    kit,
                    () => repeatRange(kit, "002", "004"),
                    () =>
                      group(
                        kit,
                        "(",
                        () =>
                          list(
                            kit,
                            "ChoiceExpression",
                            [
                              () =>
                                member(kit, () => string(kit, '"a"'), {
                                  textAfter: h("%%{!left}%%"),
                                }),
                              () =>
                                member(kit, () => numeric(kit, "%X41"), {
                                  textBefore: h("%%{!right}%%"),
                                }),
                            ],
                            ["/"],
                          ),
                        {
                          textBeforeElement: h("%%{!open}%%"),
                          textBeforeClose: h("%%{!close}%%"),
                        },
                      ),
                    h("%%{!repeat}%%"),
                  ),
                ),
              () =>
                member(
                  kit,
                  () =>
                    group(kit, "[", () => identifier(kit, "x"), {
                      textBeforeElement: h("%%{!optional}%%"),
                      textBeforeClose: h("%%{!oclose}%%"),
                    }),
                  { textBefore: h("%%{!adjacent}%%") },
                ),
            ],
            [""],
          ),
        ),
      ]
    },
  )
}

/** PEG predicate owns the suffix and both explicit singleton groups stay present. */
function pegGaps(): Built {
  return buildRailroad(
    'railroad-peg-beta\nr <- & %%{!prefix}%% ( %%{!group}%% "a" %%{!left}%% / %%{!right}%% . %%{!close}%% ) %%{!postfix}%% + %%{!adjacent}%% ! %%{!second}%% x (("d"));',
    "railroadPeg",
    (kit) => {
      /** The exact retained occurrence assigned to this named gap. */
      function h(raw: string) {
        return () => [ignored(kit, raw)]
      }

      return [
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
                    predicate(
                      kit,
                      "&",
                      () =>
                        postfix(
                          kit,
                          () =>
                            group(
                              kit,
                              "(",
                              () =>
                                list(
                                  kit,
                                  "ChoiceExpression",
                                  [
                                    () =>
                                      member(kit, () => string(kit, '"a"'), {
                                        textAfter: h("%%{!left}%%"),
                                      }),
                                    () =>
                                      member(kit, () => any(kit), {
                                        textBefore: h("%%{!right}%%"),
                                      }),
                                  ],
                                  ["/"],
                                ),
                              {
                                textBeforeElement: h("%%{!group}%%"),
                                textBeforeClose: h("%%{!close}%%"),
                              },
                            ),
                          "+",
                          h("%%{!postfix}%%"),
                        ),
                      h("%%{!prefix}%%"),
                    ),
                  ),
                () =>
                  member(
                    kit,
                    () =>
                      predicate(
                        kit,
                        "!",
                        () => identifier(kit, "x"),
                        h("%%{!second}%%"),
                      ),
                    { textBefore: h("%%{!adjacent}%%") },
                  ),
                () =>
                  member(kit, () =>
                    group(kit, "(", () =>
                      group(kit, "(", () => string(kit, '"d"')),
                    ),
                  ),
              ],
              ["", ""],
            ),
          "<-",
        ),
      ]
    },
  )
}

/** Add retained prefixes and bare lines at their explicitly supplied source occurrences. */
function prefix(
  source: string,
  forms: readonly {
    raw: string
    kind: "yaml-block" | "directive"
    pieces?: readonly string[]
  }[],
  bare: readonly string[],
  cuts: readonly string[] = [],
): Built {
  const built = buildRailroad(source, "railroad", () => [])
  const tokens = []
  const nodes = []
  const directives = cuts.map((text) => directiveOf(source, text))
  tokens.push(...cuts.map((text) => tokenOf(source, "Directive", text)))
  let from = 0
  for (const form of forms) {
    const raw = tokenOf(source, "RawText", { text: form.raw, from })
    if (form.pieces === undefined) tokens.push(raw)
    else {
      const inner = directiveOf(source, {
        text: "%%{wrap}%%",
        from: raw.range[0] + 3,
      })
      directives.push(inner)
      tokens.push(
        tokenOf(source, "RawText", {
          text: form.pieces[0] ?? "",
          from: raw.range[0],
        }),
        tokenOf(source, "Directive", {
          text: "%%{wrap}%%",
          from: inner.range[0],
        }),
        tokenOf(source, "RawText", {
          text: form.pieces[1] ?? "",
          from: inner.range[1],
        }),
      )
    }
    nodes.push({
      type: "RailroadIgnoredText",
      kind: form.kind,
      value: form.pieces?.join("") ?? form.raw,
      range: raw.range,
      loc: raw.loc,
    })
    from = raw.range[1]
  }
  setField(built.tree.body, "textBeforeHeader", nodes)
  setField(built.tree.body, "range", [
    nodes[0]?.range[0] ?? built.tree.body.range[0],
    built.tree.body.range[1],
  ])
  setField(built.tree.body, "loc", locationOf(source, built.tree.body.range))
  setField(
    built.tree,
    "tokens",
    [...tokens, ...built.tree.tokens].sort((a, b) => a.range[0] - b.range[0]),
  )
  setField(built.tree, "directives", directives)
  let commentFrom = 0
  setField(
    built.tree,
    "comments",
    bare.map((raw) => {
      const bareFrom =
        raw === "%%"
          ? commentFrom === 0 && source.startsWith("%%\n")
            ? 0
            : source.indexOf("\n%%\n", commentFrom) + 1
          : commentFrom
      const result = commentOf(source, "%%", { text: raw, from: bareFrom })
      commentFrom = result.range[1]
      return result
    }),
  )
  return built
}

const VALID: readonly { name: string; built: () => Built }[] = [
  { name: "IR call and rule gaps", built: irGaps },
  { name: "EBNF groups, exceptions and member gaps", built: ebnfGaps },
  { name: "ABNF complete repeat and member gaps", built: abnfGaps },
  { name: "PEG predicates, suffixes and groups", built: pegGaps },
  {
    name: "empty IR header",
    built: () => buildRailroad("railroad-beta", "railroad", () => []),
  },
  {
    name: "empty EBNF header",
    built: () => buildRailroad("railroad-ebnf-beta", "railroadEbnf", () => []),
  },
  {
    name: "empty ABNF header",
    built: () => buildRailroad("railroad-abnf-beta", "railroadAbnf", () => []),
  },
  {
    name: "empty PEG header",
    built: () => buildRailroad("railroad-peg-beta", "railroadPeg", () => []),
  },
  {
    name: "all IR constructors and metadata forms",
    built: () =>
      buildRailroad(
        'railroad-beta\ntitle T\naccTitle: A\naccDescr: D\naccDescr { B }\nr = choice(special(""),oneOrMore(zeroOrMore(terminal("a"))));',
        "railroad",
        (kit) => [
          common(kit, "Title", "T"),
          common(kit, "AccTitle", " A"),
          common(kit, "AccDescr", " D"),
          common(kit, "AccDescrBlock", "B"),
          rule(kit, "r", () =>
            list(
              kit,
              "ChoiceCall",
              [
                () =>
                  member(kit, () =>
                    call(kit, "special", () => string(kit, '""')),
                  ),
                () =>
                  member(kit, () =>
                    call(kit, "oneOrMore", () =>
                      call(kit, "zeroOrMore", () =>
                        call(kit, "terminal", () => string(kit, '"a"')),
                      ),
                    ),
                  ),
              ],
              [","],
            ),
          ),
        ],
      ),
  },
  {
    name: "a singleton IR list remains a call",
    built: () =>
      buildRailroad(
        'railroad-beta\nr=sequence(terminal("a"));',
        "railroad",
        (kit) => [
          rule(kit, "r", () =>
            list(
              kit,
              "SequenceCall",
              [
                () =>
                  member(kit, () =>
                    call(kit, "terminal", () => string(kit, '"a"')),
                  ),
              ],
              [],
            ),
          ),
        ],
      ),
  },
  {
    name: "duplicate and unresolved names are not semantic checker gates",
    built: () =>
      buildRailroad(
        "railroad-peg-beta\nr <- missing;r <- r;",
        "railroadPeg",
        (kit) => [
          rule(kit, "r", () => identifier(kit, "missing"), "<-"),
          rule(kit, "r", () => identifier(kit, "r"), "<-"),
        ],
      ),
  },
  {
    name: "ABNF exact, omitted, optional and reversed count bounds",
    built: () =>
      buildRailroad(
        'railroad-abnf-beta\nr=1"a" *1"b" *0"c" 4*2"d";',
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
                      () => count(kit, "1"),
                      () => string(kit, '"a"'),
                    ),
                  ),
                () =>
                  member(kit, () =>
                    repeat(
                      kit,
                      () => repeatRange(kit, null, "1"),
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
                      () => repeatRange(kit, "4", "2"),
                      () => string(kit, '"d"'),
                    ),
                  ),
              ],
              ["", "", ""],
            ),
          ),
        ],
      ),
  },
  {
    name: "ordinary native C and percent comments",
    built: () =>
      buildRailroad(
        'railroad-beta\n/* first\n second */\nr=terminal("a"); %%\n',
        "railroad",
        (kit) => {
          kit.comment("/*", "/* first\n second */")
          const r = rule(kit, "r", () =>
            call(kit, "terminal", () => string(kit, '"a"')),
          )
          kit.comment("%%", "%%")
          return [r]
        },
      ),
  },
  {
    name: "ISO comment wins over EBNF group opener",
    built: () =>
      buildRailroad(
        'railroad-ebnf-beta\n(* x *)\nr="a";',
        "railroadEbnf",
        (kit) => {
          kit.comment("(*", "(* x *)")
          return [rule(kit, "r", () => string(kit, '"a"'))]
        },
      ),
  },
  {
    name: "ABNF comment consumes semicolon and hash on its own line",
    built: () =>
      buildRailroad(
        'railroad-abnf-beta\n; # x\nr="a";',
        "railroadAbnf",
        (kit) => {
          kit.comment(";", "; # x")
          return [rule(kit, "r", () => string(kit, '"a"'))]
        },
      ),
  },
  {
    name: "PEG hash comment keeps LS content",
    built: () =>
      buildRailroad(
        'railroad-peg-beta\n# a\u2028b\nr <- "a";',
        "railroadPeg",
        (kit) => {
          kit.comment("#", "# a\u2028b")
          return [rule(kit, "r", () => string(kit, '"a"'), "<-")]
        },
      ),
  },
  {
    name: "metadata with whitespace, null values and an adjacent closed block",
    built: () =>
      buildRailroad(
        "railroad-beta\ntitle  \naccTitle: \naccDescr:\naccDescr {}accDescr { X }",
        "railroad",
        (kit) => [
          common(kit, "Title", " "),
          common(kit, "AccTitle", " "),
          common(kit, "AccDescr", null),
          common(kit, "AccDescrBlock", null),
          common(kit, "AccDescrBlock", "X"),
        ],
      ),
  },
  {
    name: "hidden-looking text inside a string",
    built: () =>
      buildRailroad(
        'railroad-peg-beta\nr <- "%%{!}%%\n# x";',
        "railroadPeg",
        (kit) => [rule(kit, "r", () => string(kit, '"%%{!}%%\n# x"'), "<-")],
      ),
  },
  {
    name: "hidden-looking text inside a special sequence",
    built: () =>
      buildRailroad(
        "railroad-ebnf-beta\nr=? %%{!}%% ?;",
        "railroadEbnf",
        (kit) => [rule(kit, "r", () => special(kit, "? %%{!}%% ?"))],
      ),
  },
  {
    name: "hidden-looking text inside a description block",
    built: () =>
      buildRailroad(
        "railroad-beta\naccDescr { /* x */ }",
        "railroad",
        (kit) => [common(kit, "AccDescrBlock", "/* x */")],
      ),
  },
  {
    name: "hidden YAML consumes the sole LF before a rule",
    built: () =>
      buildRailroad(
        'railroad-peg-beta\n---\nx\n---\nr <- "a";',
        "railroadPeg",
        (kit) => [
          ignored(kit, "---\nx\n---", "yaml-block"),
          rule(kit, "r", () => string(kit, '"a"'), "<-"),
        ],
      ),
  },
  {
    name: "hidden YAML with spare LF and CRLF source",
    built: () =>
      buildRailroad(
        'railroad-peg-beta\r\n---\r\nx\r\n---\r\n\r\nr <- "a";',
        "railroadPeg",
        (kit) => [
          ignored(kit, "---\r\nx\r\n---", "yaml-block"),
          rule(kit, "r", () => string(kit, '"a"'), "<-"),
        ],
      ),
  },
  {
    name: "hidden closer plus space needs no surviving LF",
    built: () =>
      buildRailroad(
        'railroad-peg-beta\n%%{!}%% r <- "a";',
        "railroadPeg",
        (kit) => [
          ignored(kit, "%%{!}%%"),
          rule(kit, "r", () => string(kit, '"a"'), "<-"),
        ],
      ),
  },
  {
    name: "body hidden forms at EOF",
    built: () =>
      buildRailroad("railroad-beta\n%%{!}%%", "railroad", (kit) => [
        ignored(kit, "%%{!}%%"),
      ]),
  },
  {
    name: "YAML body-present alternative passes an adjacent empty closer",
    built: () =>
      buildRailroad(
        'railroad-beta\n---\n---\nr=terminal("hidden");\n---',
        "railroad",
        (kit) => [
          ignored(kit, '---\n---\nr=terminal("hidden");\n---', "yaml-block"),
        ],
      ),
  },
  {
    name: "adjacent YAML empty fallback at EOF",
    built: () =>
      buildRailroad("railroad-beta\n---\n---", "railroad", (kit) => [
        ignored(kit, "---\n---", "yaml-block"),
      ]),
  },
  {
    name: "directive passes an unqualified closer",
    built: () =>
      buildRailroad("railroad-beta\n%%{!}%%x\n}%%", "railroad", (kit) => [
        ignored(kit, "%%{!}%%x\n}%%"),
      ]),
  },
  {
    name: "two qualifying directive matches remain separate",
    built: () =>
      buildRailroad("railroad-beta\n%%{!a}%% %%{!b}%%", "railroad", (kit) => [
        ignored(kit, "%%{!a}%%"),
        ignored(kit, "%%{!b}%%"),
      ]),
  },
  {
    name: "retained YAML without a passed bare line",
    built: () =>
      prefix(
        "%%{init:{}}%%\n---\nx\n---\nrailroad-beta",
        [{ raw: "---\nx\n---", kind: "yaml-block" }],
        [],
        ["%%{init:{}}%%"],
      ),
  },
  {
    name: "retained YAML before a passed bare line and Unicode trivia",
    built: () =>
      prefix(
        "%%{init:{}}%%\n---\nx\n---\n%%\n\u2028\u00a0railroad-beta",
        [{ raw: "---\nx\n---", kind: "yaml-block" }],
        ["%%"],
        ["%%{init:{}}%%"],
      ),
  },
  {
    name: "genuine second-scan retained directive without passed bare lines",
    built: () =>
      prefix(
        "%%{%%{wrap}%%wrap}%%\nrailroad-beta",
        [
          {
            raw: "%%{%%{wrap}%%wrap}%%",
            kind: "directive",
            pieces: ["%%{", "wrap}%%"],
          },
        ],
        [],
      ),
  },
  {
    name: "passed bare line before a retained second-scan directive",
    built: () =>
      prefix(
        "%%\n\u2028%%{%%{wrap}%%wrap}%%\nrailroad-beta",
        [
          {
            raw: "%%{%%{wrap}%%wrap}%%",
            kind: "directive",
            pieces: ["%%{", "wrap}%%"],
          },
        ],
        ["%%"],
      ),
  },
  {
    name: "passed trivia between retained second-scan directives",
    built: () =>
      prefix(
        "%%{%%{wrap}%%wrap}%%\n%%\n\u2029%%{%%{wrap}%%wrap}%%\nrailroad-beta",
        [
          {
            raw: "%%{%%{wrap}%%wrap}%%",
            kind: "directive",
            pieces: ["%%{", "wrap}%%"],
          },
          {
            raw: "%%{%%{wrap}%%wrap}%%",
            kind: "directive",
            pieces: ["%%{", "wrap}%%"],
          },
        ],
        ["%%"],
      ),
  },
]

/** The accepted control named by its question. */
function valid(name: string): Built {
  const control = VALID.find((test) => test.name === name)
  if (control === undefined) throw new Error(`no accepted control ${name}`)
  return control.built()
}

/** Both endpoints and loc change together, leaving the intended lexical invariant to fail. */
function rangeOf(
  source: string,
  node: Placed,
  range: readonly [number, number],
): void {
  setField(node, "range", range)
  setField(node, "loc", locationOf(source, range))
}

/** A damaged copy of an explicit accepted control must fail its named tree condition. */
function rejectsMutation(
  name: string,
  build: () => Built,
  mutate: (tree: CheckedRoot, source: string) => void,
  message: string,
): void {
  it(name, () => {
    const { tree, source } = build()
    expect(checkTree(source, tree)).toEqual([])
    const edited = copyOf(tree)
    mutate(edited, source)
    const problems = checkTree(source, edited)
    expect(
      problems.some((p) => p.message.includes(message)),
      JSON.stringify(problems),
    ).toBe(true)
  })
}

describe("railroad tree conditions", () => {
  for (const test of VALID)
    it(test.name, () => {
      const { tree, source } = test.built()
      expect(checkTree(source, tree)).toEqual([])
    })
  it("copies all thirty node definitions and declared child order", () => {
    const fields = readChildFields()
    for (const [type, children] of Object.entries(RAILROAD_CHILD_TYPES))
      expect(Object.keys(children)).toEqual(fields.get(type))
    expect(RAILROAD_FIELD_WORDS.RailroadIgnoredText?.kind).toEqual([
      "yaml-block",
      "directive",
    ])
    const types = new Set(
      VALID.flatMap((test) =>
        nodesOf(test.built().tree).map((node) => node.type),
      ).filter((type) => type.startsWith("Railroad")),
    )
    expect(types.size).toBe(30)
  })
  rejectsMutation(
    "rejects a lost rule gap",
    irGaps,
    (tree) =>
      setField(nodeWith(tree, "RailroadRule"), "textBeforeOperator", []),
    "the gap is not ASCII whitespace",
  )
  rejectsMutation(
    "rejects a duplicated gap form",
    irGaps,
    (tree) => {
      const ruleNode = nodeWith(tree, "RailroadRule")
      const forms = ruleNode.textBeforeOperator as CheckedNode[]
      setField(ruleNode, "textBeforeOperator", [...forms, ...forms])
    },
    "the gap is not ASCII whitespace",
  )
  rejectsMutation(
    "rejects a member's native form moved to body",
    ebnfGaps,
    (tree) => {
      const candidate = nodesOf(tree).find(
        (n) =>
          n.type === "RailroadExpressionMember" &&
          (n.textAfter as CheckedNode[]).length > 0,
      )
      if (!candidate) throw new Error("no member gap")
      const hidden = (candidate.textAfter as CheckedNode[])[0]
      setField(candidate, "textAfter", [])
      setField(tree.body, "body", [
        ...(tree.body.body as CheckedNode[]),
        hidden,
      ])
    },
    "specified source order",
  )
  rejectsMutation(
    "rejects a changed assignment",
    irGaps,
    (tree) => setField(tokenWith(tree, "="), "value", "<-"),
    "the authored component must be =",
  )
  rejectsMutation(
    "rejects a changed postfix field",
    ebnfGaps,
    (tree) =>
      setField(nodeWith(tree, "RailroadPostfixExpression"), "operator", "*"),
    "the written postfix operator",
  )
  rejectsMutation(
    "rejects a changed predicate field",
    pegGaps,
    (tree) =>
      setField(nodeWith(tree, "RailroadPredicateExpression"), "operator", "!"),
    "the written predicate operator",
  )
  rejectsMutation(
    "rejects a collapsed authored group",
    pegGaps,
    (tree) => {
      const p = nodeWith(tree, "RailroadPostfixExpression")
      const g = p.element as CheckedNode
      setField(p, "element", g.element)
    },
    "authored component",
  )
  rejectsMutation(
    "rejects a missing visible rule terminator",
    irGaps,
    (tree) => setField(tokenWith(tree, ";"), "type", "RawText"),
    "kind of a token",
  )
  rejectsMutation(
    "rejects an implicit sequence wrapper with one member",
    ebnfGaps,
    (tree) => {
      const seq = nodeWith(tree, "RailroadSequenceExpression")
      setField(seq, "elements", (seq.elements as CheckedNode[]).slice(0, 1))
    },
    "two or more authored members",
  )
  rejectsMutation(
    "rejects native text hidden in the preceding member of an adjacency",
    pegGaps,
    (tree) => {
      const members = nodeWith(tree, "RailroadSequenceExpression")
        .elements as CheckedNode[]
      const first = members[0]
      const second = members[1]
      if (!first || !second) throw new Error("missing members")
      setField(first, "textAfter", second.textBefore)
      setField(second, "textBefore", [])
    },
    "preceding textAfter empty",
  )
  it("keeps ordinary body Unicode gaps strict", () => {
    const control = buildRailroad(
      'railroad-peg-beta\nr <- "a";',
      "railroadPeg",
      (kit) => [rule(kit, "r", () => string(kit, '"a"'), "<-")],
    )
    expect(checkTree(control.source, control.tree)).toEqual([])
    const invalid = buildRailroad(
      'railroad-peg-beta\n\u00a0r <- "a";',
      "railroadPeg",
      (kit) => [rule(kit, "r", () => string(kit, '"a"'), "<-")],
    )
    expect(
      checkTree(invalid.source, invalid.tree).some((problem) =>
        problem.message.includes("the gap is not ASCII whitespace"),
      ),
    ).toBe(true)
  })
  rejectsMutation(
    "rejects a hidden match that includes its consumed LF",
    () => valid("hidden YAML consumes the sole LF before a rule"),
    (tree, source) => {
      const hidden = nodeWith(tree, "RailroadIgnoredText")
      const token = tokenWith(tree, "---\nx\n---")
      const end = hidden.range[1] + 1
      rangeOf(source, hidden, [hidden.range[0], end])
      rangeOf(source, token, [token.range[0], end])
      setField(hidden, "value", source.slice(...hidden.range))
      setField(token, "value", source.slice(...token.range))
    },
    "one complete hidden YAML or DIRECTIVE",
  )
  rejectsMutation(
    "rejects an adjacent empty YAML close despite a later body match",
    () =>
      valid("YAML body-present alternative passes an adjacent empty closer"),
    (tree, source) => {
      const hidden = nodeWith(tree, "RailroadIgnoredText")
      const token = tree.tokens.find((t) => t.type === "RawText")
      if (!token) throw new Error("no raw token")
      const end = hidden.range[0] + 7
      rangeOf(source, hidden, [hidden.range[0], end])
      rangeOf(source, token, [token.range[0], end])
      setField(hidden, "value", "---\n---")
      setField(token, "value", "---\n---")
    },
    "one complete hidden YAML or DIRECTIVE",
  )
  rejectsMutation(
    "rejects a later qualifying directive closer",
    () => valid("two qualifying directive matches remain separate"),
    (tree, source) => {
      const forms = tree.body.body as CheckedNode[]
      const first = forms[0]
      const last = forms[1]
      if (!first || !last) throw new Error("no forms")
      rangeOf(source, first, [first.range[0], last.range[1]])
      setField(first, "value", source.slice(...first.range))
      setField(tree.body, "body", [first])
    },
    "one complete hidden YAML or DIRECTIVE",
  )
  rejectsMutation(
    "rejects a native directive disguised as Comment",
    () => valid("body hidden forms at EOF"),
    (tree, source) => {
      const hidden = nodeWith(tree, "RailroadIgnoredText")
      setField(tree.body, "body", [])
      setField(
        tree,
        "tokens",
        tree.tokens.filter((t) => t.type !== "RawText"),
      )
      setField(tree, "comments", [
        commentOf(source, "%%", {
          text: source.slice(...hidden.range),
          from: hidden.range[0],
        }),
      ])
    },
    "earlier terminal wins",
  )
  rejectsMutation(
    "rejects a Comment starting in an enclosing description",
    () => valid("hidden-looking text inside a description block"),
    (tree, source) =>
      setField(tree, "comments", [
        commentOf(source, "/*", {
          text: "/* x */",
          from: source.indexOf("{") + 1,
        }),
      ]),
    "earlier enclosing value",
  )
  rejectsMutation(
    "rejects another dialect's node",
    () =>
      buildRailroad('railroad-beta\nr=terminal("a");', "railroad", (kit) => [
        rule(kit, "r", () => call(kit, "terminal", () => string(kit, '"a"'))),
      ]),
    (tree) => setField(tree, "diagramType", "railroadPeg"),
    "does not belong to this dialect",
  )
})

// These fixed component cases distinguish common cuts from native gaps.
describe("railroad authored component boundaries", () => {
  it("permits common directives between ABNF repeat components and within numeric text", () => {
    const built = buildRailroad(
      "railroad-abnf-beta\nr=2%%{wrap}%%*%%{wrap}%%3 %x4%%{wrap}%%1;",
      "railroadAbnf",
      (kit) => [
        rule(kit, "r", () =>
          repeat(
            kit,
            () => {
              const minimum = count(kit, "2")
              kit.directive("%%{wrap}%%")
              kit.token("Punctuator", "*")
              kit.directive("%%{wrap}%%")
              const maximum = count(kit, "3")
              return kit.node(
                "RailroadRepeatRange",
                [minimum.range[0], maximum.range[1]],
                { minimum, maximum },
              )
            },
            () => {
              const first = kit.token("RawText", "%x4")
              kit.directive("%%{wrap}%%")
              const last = kit.token("RawText", "1")
              return kit.node(
                "RailroadNumericValue",
                [first.range[0], last.range[1]],
                { value: "%x41" },
              )
            },
          ),
        ),
      ],
    )
    expect(checkTree(built.source, built.tree)).toEqual([])
  })
  it("rejects native whitespace between repeat components", () => {
    const control = buildRailroad(
      'railroad-abnf-beta\nr=2*3"a";',
      "railroadAbnf",
      (kit) => [
        rule(kit, "r", () =>
          repeat(
            kit,
            () => repeatRange(kit, "2", "3"),
            () => string(kit, '"a"'),
          ),
        ),
      ],
    )
    expect(checkTree(control.source, control.tree)).toEqual([])
    const invalid = buildRailroad(
      'railroad-abnf-beta\nr=2 *3"a";',
      "railroadAbnf",
      (kit) => [
        rule(kit, "r", () =>
          repeat(
            kit,
            () => repeatRange(kit, "2", "3"),
            () => string(kit, '"a"'),
          ),
        ),
      ],
    )
    expect(
      checkTree(invalid.source, invalid.tree).some((problem) =>
        problem.message.includes("cannot split repeat components"),
      ),
    ).toBe(true)
  })
  it("permits a native Comment after a complete repeat but not between its components", () => {
    const control = buildRailroad(
      'railroad-abnf-beta\nr=2*3; native\n"a";',
      "railroadAbnf",
      (kit) => [
        rule(kit, "r", () =>
          repeat(
            kit,
            () => repeatRange(kit, "2", "3"),
            () => {
              kit.comment(";", "; native")
              return string(kit, '"a"')
            },
          ),
        ),
      ],
    )
    expect(checkTree(control.source, control.tree)).toEqual([])
    const beforeStar = buildRailroad(
      'railroad-abnf-beta\nr=2; native\n*3"a";',
      "railroadAbnf",
      (kit) => [
        rule(kit, "r", () =>
          repeat(
            kit,
            () => {
              const minimum = count(kit, "2")
              kit.comment(";", "; native")
              kit.token("Punctuator", "*")
              const maximum = count(kit, "3")
              return kit.node(
                "RailroadRepeatRange",
                [minimum.range[0], maximum.range[1]],
                { minimum, maximum },
              )
            },
            () => string(kit, '"a"'),
          ),
        ),
      ],
    )
    const afterStar = buildRailroad(
      'railroad-abnf-beta\nr=2*; native\n3"a";',
      "railroadAbnf",
      (kit) => [
        rule(kit, "r", () =>
          repeat(
            kit,
            () => {
              const minimum = count(kit, "2")
              kit.token("Punctuator", "*")
              kit.comment(";", "; native")
              const maximum = count(kit, "3")
              return kit.node(
                "RailroadRepeatRange",
                [minimum.range[0], maximum.range[1]],
                { minimum, maximum },
              )
            },
            () => string(kit, '"a"'),
          ),
        ),
      ],
    )
    for (const broken of [beforeStar, afterStar])
      expect(
        checkTree(broken.source, broken.tree).some((problem) =>
          problem.message.includes("cannot split repeat components"),
        ),
      ).toBe(true)
  })
  it("keeps cuts inside a string as StringFragment tokens", () => {
    const built = buildRailroad(
      'railroad-beta\nr=terminal("a%%{wrap}%%b");',
      "railroad",
      (kit) => [
        rule(kit, "r", () =>
          call(kit, "terminal", () => {
            const first = kit.token("StringFragment", '"a')
            kit.directive("%%{wrap}%%")
            const last = kit.token("StringFragment", 'b"')
            return kit.node("StringLiteral", [first.range[0], last.range[1]], {
              raw: '"a%%{wrap}%%b"',
              value: "ab",
              closed: true,
            })
          }),
        ),
      ],
    )
    expect(checkTree(built.source, built.tree)).toEqual([])
    const broken = copyOf(built.tree)
    const fragment = broken.tokens.find((t) => t.type === "StringFragment")
    if (!fragment) throw new Error("missing string fragment")
    setField(fragment, "type", "String")
    expect(
      checkTree(built.source, broken).some((p) =>
        p.message.includes("StringFragment"),
      ),
    ).toBe(true)
  })
  it("permits a common directive between an accessibility keyword and colon", () => {
    const built = buildRailroad(
      "railroad-beta\naccTitle%%{wrap}%%: A",
      "railroad",
      (kit) => {
        const word = kit.token("Keyword", "accTitle")
        kit.directive("%%{wrap}%%")
        kit.token("Punctuator", ":")
        const value = kit.node(
          "RailroadLiteral",
          kit.token("RawText", " A").range,
          { value: " A" },
        )
        return [
          kit.node(
            "RailroadAccTitleStatement",
            [word.range[0], value.range[1]],
            { value },
          ),
        ]
      },
    )
    expect(checkTree(built.source, built.tree)).toEqual([])
  })
  it("rejects a constructor atom split by a common directive", () => {
    const control = buildRailroad(
      'railroad-beta\nr=terminal("a");',
      "railroad",
      (kit) => [
        rule(kit, "r", () => call(kit, "terminal", () => string(kit, '"a"'))),
      ],
    )
    expect(checkTree(control.source, control.tree)).toEqual([])
    const invalid = buildRailroad(
      'railroad-beta\nr=te%%{wrap}%%rminal("a");',
      "railroad",
      (kit) => [
        rule(kit, "r", () => {
          const first = kit.token("Keyword", "te")
          kit.directive("%%{wrap}%%")
          kit.token("Keyword", "rminal")
          kit.token("Punctuator", "(")
          const value = string(kit, '"a"')
          const close = kit.token("Punctuator", ")")
          return kit.node(
            "RailroadTerminalCall",
            [first.range[0], close.range[1]],
            {
              textBeforeOpen: [],
              textBeforeValue: [],
              value,
              textBeforeClose: [],
            },
          )
        }),
      ],
    )
    expect(
      checkTree(invalid.source, invalid.tree).some((p) =>
        p.message.includes("a Keyword token is cut"),
      ),
    ).toBe(true)
  })
  it("keeps native boundaries strict after a retained prefix without a passed bare line", () => {
    const control = valid(
      "genuine second-scan retained directive without passed bare lines",
    )
    expect(checkTree(control.source, control.tree)).toEqual([])
    const invalid = prefix(
      "%%{%%{wrap}%%wrap}%%\n\u2028railroad-beta",
      [
        {
          raw: "%%{%%{wrap}%%wrap}%%",
          kind: "directive",
          pieces: ["%%{", "wrap}%%"],
        },
      ],
      [],
    )
    expect(
      checkTree(invalid.source, invalid.tree).some((p) =>
        p.message.includes("the gap is not ASCII whitespace"),
      ),
    ).toBe(true)
  })
  it("preserves passed Unicode trivia between retained YAML and a second-scan directive", () => {
    const built = prefix(
      "%%{init:{}}%%\n---\nx\n---\n%%\n\u2028%%{%%{wrap}%%wrap}%%\nrailroad-beta",
      [
        { raw: "---\nx\n---", kind: "yaml-block" },
        {
          raw: "%%{%%{wrap}%%wrap}%%",
          kind: "directive",
          pieces: ["%%{", "wrap}%%"],
        },
      ],
      ["%%"],
      ["%%{init:{}}%%"],
    )
    expect(checkTree(built.source, built.tree)).toEqual([])
  })
  it("rejects a later native block-comment closer", () => {
    const built = buildRailroad(
      'railroad-ebnf-beta\n(* a *) (* b *)\nr="a";',
      "railroadEbnf",
      (kit) => {
        kit.comment("(*", "(* a *)")
        kit.comment("(*", "(* b *)")
        return [rule(kit, "r", () => string(kit, '"a"'))]
      },
    )
    expect(checkTree(built.source, built.tree)).toEqual([])
    const broken = copyOf(built.tree)
    const first = broken.comments[0]
    const last = broken.comments[1]
    if (!first || !last) throw new Error("missing comments")
    rangeOf(built.source, first, [first.range[0], last.range[1]])
    setField(
      first,
      "value",
      built.source.slice(first.range[0] + 2, first.range[1]),
    )
    setField(broken, "comments", [first])
    expect(
      checkTree(built.source, broken).some((p) =>
        p.message.includes("first lexical closer"),
      ),
    ).toBe(true)
  })
})

describe("railroad retained openers and comment continuations", () => {
  it("excludes leading padding from a retained prefix range", () => {
    const built = prefix(
      "  ---\nx\n---\nrailroad-beta",
      [{ raw: "---\nx\n---", kind: "yaml-block" }],
      [],
    )
    expect(checkTree(built.source, built.tree)).toEqual([])
    const edited = copyOf(built.tree)
    const hidden = nodeWith(edited, "RailroadIgnoredText")
    const token = edited.tokens[0]
    if (!token) throw new Error("missing retained token")
    rangeOf(built.source, hidden, [0, hidden.range[1]])
    rangeOf(built.source, token, [0, token.range[1]])
    setField(hidden, "value", built.source.slice(...hidden.range))
    setField(token, "value", built.source.slice(...token.range))
    expect(
      checkTree(built.source, edited).some((p) =>
        p.message.includes("without preceding padding"),
      ),
    ).toBe(true)
  })
  it("keeps a native block Comment across a common comment region", () => {
    const built = buildRailroad(
      "railroad-beta\n/* a\u2028%% note\n b */",
      "railroad",
      (kit) => {
        kit.comment("/*", "/* a")
        kit.comment("%%", "%% note")
        kit.comment(null, "b */")
        return []
      },
    )
    expect(checkTree(built.source, built.tree)).toEqual([])
  })
  it("does not let an unmarked Comment fragment replace a rule after a common region", () => {
    const control = buildRailroad(
      'railroad-beta\n%% note\nr=terminal("a");',
      "railroad",
      (kit) => {
        kit.comment("%%", "%% note")
        return [
          rule(kit, "r", () => call(kit, "terminal", () => string(kit, '"a"'))),
        ]
      },
    )
    expect(checkTree(control.source, control.tree)).toEqual([])
    const invalid = buildRailroad(
      'railroad-beta\n%% note\nr=terminal("a");',
      "railroad",
      (kit) => {
        kit.comment("%%", "%% note")
        kit.comment(null, 'r=terminal("a");')
        return []
      },
    )
    expect(
      checkTree(invalid.source, invalid.tree).some((p) =>
        p.message.includes("must belong to an earlier native Comment"),
      ),
    ).toBe(true)
  })
})
