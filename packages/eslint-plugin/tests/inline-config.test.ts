/**
 * Shows, as snapshots of eslint-snapshot-rule-tester, how comments configure
 * ESLint in Mermaid text: `%% eslint-disable…` and `%% eslint-enable`, and
 * `%% eslint <rule>: <config>`. The inputs are under
 * `tests/fixtures/inline-config/`. The tester names the rule under test
 * `rule-to-test/<name>`, so the comments that name a rule use that id.
 *
 * ESLint reports a configuration comment that it cannot read as a fatal
 * problem, which the tester does not allow, so that input is checked with the
 * Linter directly.
 */
import { readFile } from "node:fs/promises"
import type { Rule } from "eslint"
import { Linter } from "eslint"
import { SnapshotRuleTester } from "eslint-snapshot-rule-tester"
import { describe, expect, it } from "vitest"
import type { MermaidRuleDefinition } from "../src/index.ts"
import { LANGUAGE_CONFIG, observe } from "./helpers.ts"

/** The test case of an input of `tests/fixtures/inline-config/`. */
async function inlineConfigCase(
  name: string,
): Promise<{ name: string; filename: string; code: string }> {
  const code = await readFile(
    new URL(`fixtures/inline-config/${name}.mmd`, import.meta.url),
    "utf8",
  )
  return { name, filename: `${name}.mmd`, code }
}

/** Reports every identifier, with its name as the message. */
const identifiers: MermaidRuleDefinition = {
  meta: { type: "problem", messages: { identifier: "{{name}}" } },
  create(context) {
    return {
      Identifier(node) {
        context.report({
          loc: node.loc,
          messageId: "identifier",
          data: { name: node.name },
        })
      },
    }
  },
}

const tester = new SnapshotRuleTester(LANGUAGE_CONFIG)

// The tester takes the rule types of JavaScript; ESLint runs a rule of any
// language the same way.
tester.run("identifiers", identifiers as unknown as Rule.RuleModule, {
  // Every report is disabled.
  valid: [
    await inlineConfigCase("disable-one-rule"),
    await inlineConfigCase("rule-off"),
  ],
  invalid: [
    await inlineConfigCase("disable-next-line"),
    await inlineConfigCase("disable-then-enable"),
    // The directive applies to the comment line after it, which has no report.
    await inlineConfigCase("disable-next-line-unused"),
  ],
})

describe("a configuration comment that ESLint cannot read", () => {
  it("is reported at the comment, and the rule still runs", async () => {
    const { filename, code } = await inlineConfigCase("rule-config-broken")
    const messages = new Linter({ configType: "flat" }).verify(
      code,
      [
        LANGUAGE_CONFIG,
        {
          files: ["**/*.mmd"],
          plugins: { "rule-to-test": { rules: { identifiers } } },
          rules: { "rule-to-test/identifiers": "error" },
        },
      ],
      filename,
    )
    expect(messages).toEqual([
      expect.objectContaining({
        ruleId: null,
        fatal: true,
        line: 1,
        column: 1,
        message: expect.stringContaining("Failed to parse JSON"),
      }),
      expect.objectContaining({
        ruleId: "rule-to-test/identifiers",
        line: 3,
        column: 3,
        message: "A",
      }),
    ])
  })
})

describe("a fragment of a diagram comment", () => {
  // In a state diagram, U+2029 ends the comment `%% x` and starts a comment
  // line `%% end`, after which the comment goes on: the rest is a comment
  // without a mark, the continuation of the comment before it.
  const fragmentText =
    "stateDiagram-v2\nA %% x\u2029%% end\neslint-disable-next-line\nB\n"

  it("is not read as a configuration comment", () => {
    const sourceCode = observe(fragmentText).sourceCode
    expect(sourceCode).not.toBeNull()
    const fragment = sourceCode?.comments.find(
      (comment) => comment.mark === null,
    )
    expect(fragment?.value).toBe("eslint-disable-next-line")
    expect(sourceCode?.getInlineConfigNodes()).toEqual([])
    expect(sourceCode?.getDisableDirectives().directives).toEqual([])
  })

  it("is read when it has a mark", () => {
    const sourceCode = observe(
      "stateDiagram-v2\n%% eslint-disable-next-line\nA\n",
    ).sourceCode
    expect(sourceCode?.getInlineConfigNodes()).toHaveLength(1)
  })
})

// The control disables inline configuration without changing the fixed input.
describe("block comments configure the language", () => {
  it.each([
    {
      name: "railroad-c-disable",
      code: `railroad-beta
/* eslint-disable mmd/identifiers */
word = terminal("a");
`,
    },
    {
      name: "railroad-c-off",
      code: `railroad-beta
/* eslint mmd/identifiers: off */
word = terminal("a");
`,
    },
    {
      name: "railroad-iso-disable",
      code: `railroad-ebnf-beta
(* eslint-disable mmd/identifiers *)
word = "a";
`,
    },
    {
      name: "railroad-iso-off",
      code: `railroad-ebnf-beta
(* eslint mmd/identifiers: off *)
word = "a";
`,
    },
    {
      name: "eventmodeling-c-disable",
      code: `eventmodeling
/* eslint-disable mmd/identifiers */
entity Shop.Bought
`,
    },
    {
      name: "eventmodeling-c-off",
      code: `eventmodeling
/* eslint mmd/identifiers: off */
entity Shop.Bought
`,
    },
  ])("$name", ({ code }) => {
    const config: Linter.Config[] = [
      LANGUAGE_CONFIG,
      {
        files: ["**/*.mmd"],
        plugins: { mmd: { rules: { identifiers } } },
        rules: { "mmd/identifiers": "error" },
      },
    ]
    const linter = new Linter({ configType: "flat" })
    const control = linter.verify(
      code,
      [...config, { linterOptions: { noInlineConfig: true } }],
      "block-comment.mmd",
    )
    expect(
      control.some((message) => message.ruleId === "mmd/identifiers"),
    ).toBe(true)
    expect(linter.verify(code, config, "block-comment.mmd")).toEqual([])
  })
})
