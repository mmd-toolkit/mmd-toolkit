import { describe, expect, it } from "vitest"
import { bracketedArgumentEnd } from "../src/utils/directive-arguments.ts"

describe("bracketed argument ends", () => {
  it.each([
    ["a closed object", "init: {} next", 6, 8],
    ["a closed array", "[1, 2] next", 0, 6],
    ["nested brackets", '{"x":[{}]} next', 0, 10],
    ["brackets in double quotes", '{"x":"[}]"} next', 0, 11],
    ["brackets in single quotes", "{'x':'[}]'} next", 0, 11],
    ["an apostrophe in double quotes", `{"x":"it's }"} next`, 0, 12],
    ["a double quote in single quotes", `{'x':'a" }'} next`, 0, 10],
    [
      "a single quote closed with a double quote",
      `{'theme": "dark"} next`,
      0,
      17,
    ],
    ["an escaped double quote", String.raw`{"x":"\"}"} next`, 0, 11],
    ["an escaped single quote", String.raw`{'x':'\'}'} next`, 0, 11],
    ["an unclosed object", "{bad next", 0, 9],
    ["an unclosed array", "[bad next", 0, 9],
    ["an unclosed string", '{"x":"} next', 0, 12],
    ["an unclosed escape", '{"x":"\\', 0, 7],
    ["invalid JSON followed by text", "{bad} next", 0, 5],
  ] as const)("finds the end of %s", (_, value, start, expected) => {
    expect(bracketedArgumentEnd(value, start)).toBe(expected)
  })
})
