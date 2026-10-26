/** The rule on its document examples and fixtures, with escaped whitespace. */
import { RuleTester } from "eslint"
import { cynefinNoDuplicateTitle } from "../../src/rules/cynefin-no-duplicate-title.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("cynefin-no-duplicate-title", cynefinNoDuplicateTitle)

new RuleTester(LANGUAGE_CONFIG).run(
  "cynefin-no-duplicate-title",
  cynefinNoDuplicateTitle,
  {
    valid: [
      {
        name: "valid/cynefin/title-same-normalized",
        filename: "title-same-normalized.mmd",
        code: `cynefin-beta
title  Incident  response 
title Incident response
accTitle:  Same\t\ttext 
accTitle: Same text`,
      },
    ],
    invalid: [
      {
        name: "invalid/cynefin/title-whitespace-last",
        filename: "title-whitespace-last.mmd",
        code: `cynefin-beta
title First
title   
accTitle: First
accTitle: \t 
complex "Investigate"`,
        errors: [
          {
            messageId: "duplicate",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 9,
            data: { kind: "title", statement: "title", line: "2" },
          },
          {
            messageId: "duplicate",
            line: 5,
            column: 1,
            endLine: 5,
            endColumn: 13,
            data: {
              kind: "accessible title",
              statement: "accTitle",
              line: "4",
            },
          },
        ],
      },
      {
        name: "invalid/cynefin/title-single-tabs-distinct",
        filename: "title-single-tabs-distinct.mmd",
        code: `cynefin-beta
title A\tB
title A B
accTitle: A\tB
accTitle: A B`,
        errors: [
          {
            messageId: "duplicate",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 10,
            data: { kind: "title", statement: "title", line: "2" },
          },
          {
            messageId: "duplicate",
            line: 5,
            column: 1,
            endLine: 5,
            endColumn: 14,
            data: {
              kind: "accessible title",
              statement: "accTitle",
              line: "4",
            },
          },
        ],
      },
      {
        name: "invalid/cynefin/title-line-separators-are-content",
        filename: "title-line-separators-are-content.mmd",
        code: `cynefin-beta
title A\u2028 B
title A\u2028B
accTitle: A\u2029 B
accTitle: A\u2029B`,
        errors: [
          {
            messageId: "duplicate",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 10,
            data: { kind: "title", statement: "title", line: "2" },
          },
          {
            messageId: "duplicate",
            line: 5,
            column: 1,
            endLine: 5,
            endColumn: 14,
            data: {
              kind: "accessible title",
              statement: "accTitle",
              line: "4",
            },
          },
        ],
      },
      {
        name: "invalid/cynefin/title-lone-cr",
        filename: "title-lone-cr.mmd",
        code: `cynefin-beta\rtitle First\rtitle Second\r`,
        errors: [
          {
            messageId: "duplicate",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 13,
            data: { kind: "title", statement: "title", line: "2" },
          },
        ],
      },
    ],
  },
)
