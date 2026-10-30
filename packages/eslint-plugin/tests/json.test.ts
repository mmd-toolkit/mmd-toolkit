import { describe, expect, it } from "vitest"
import type { JsonReading, ParsedJson } from "../src/utils/json.ts"
import {
  sameJsonValue,
  mermaidReadsJson,
  parseJson,
  parseInitJson,
} from "../src/utils/json.ts"

/** Fail before accessing fields that a fatal reading cannot supply. */
function expectParsed(reading: JsonReading): ParsedJson {
  if (reading.invalid) throw new Error("Expected a JSON value")
  return reading
}

describe("quote readings", () => {
  it("accepts mixed delimiters only in directive arguments", () => {
    expect(parseInitJson("'a\"", 10)).toMatchObject({
      invalid: false,
      value: { kind: "String", value: "a" },
      problems: [],
    })
    expect(parseJson("'a\"", 10)).toEqual({
      invalid: true,
      range: [10, 11],
    })
  })

  it("reports a written apostrophe only in directive arguments", () => {
    expect(parseInitJson(`"O'Brien"`, 10)).toMatchObject({
      invalid: false,
      value: { kind: "String", value: "O'Brien" },
      problems: [{ kind: "apostropheInDoubleQuotedString", range: [12, 13] }],
    })
    expect(parseJson(`"O'Brien"`, 10)).toMatchObject({
      invalid: false,
      value: { kind: "String", value: "O'Brien" },
      problems: [],
    })
  })

  it("converts escaped apostrophes only in directive arguments", () => {
    const text = String.raw`"\'"`
    expect(parseInitJson(text, 10)).toEqual({
      invalid: false,
      value: {
        kind: "String",
        range: [10, 14],
        text,
        value: '"',
      },
      problems: [{ kind: "escapedApostrophe", range: [11, 13] }],
    })
    expect(parseJson(text, 10)).toEqual({
      invalid: true,
      range: [11, 13],
    })
  })

  it("reports an invalid escape before the rest of a scalar", () => {
    const text = String.raw`"\x}a\"b'" next`
    expect(parseInitJson(text, 10)).toEqual({ invalid: true, range: [11, 13] })
    expect(parseJson(text, 10)).toEqual({ invalid: true, range: [11, 13] })
  })

  it("reports an unexpected character before mixed quoted text", () => {
    const text = `{bad:'}" } next`
    expect(parseInitJson(text, 10)).toEqual({ invalid: true, range: [11, 12] })
    expect(parseJson(text, 10)).toEqual({ invalid: true, range: [11, 12] })
  })
})

describe("parseJson", () => {
  it("rejects a single-quoted value at its opening apostrophe", () => {
    expect(parseJson("'a'", 10)).toEqual({
      invalid: true,
      range: [10, 11],
    })
  })

  it("requires double quotes around an object key", () => {
    const parsed = parseJson("{'a':1}", 10)
    expect(parsed).toEqual({ invalid: true, range: [11, 12] })
  })

  it("preserves an apostrophe inside a double-quoted string", () => {
    const parsed = expectParsed(parseJson(`{"a": "it's"}`, 10))
    expect(parsed.problems).toEqual([])
    expect(parsed.value).toMatchObject({
      kind: "Object",
      members: [{ value: { kind: "String", value: "it's" } }],
    })
  })

  it("rejects non-JSON whitespace before the value", () => {
    expect(parseJson("\u00a0{}", 10)).toEqual({
      invalid: true,
      range: [10, 11],
    })
  })

  it("rejects non-JSON whitespace after the value", () => {
    const parsed = parseJson("{}\u00a0", 10)
    expect(parsed).toEqual({ invalid: true, range: [12, 13] })
  })

  it("skips each JSON whitespace character at both edges", () => {
    const parsed = expectParsed(parseJson(" \t\n\r{} \t\n\r", 10))
    expect(parsed.problems).toEqual([])
    expect(parsed.value).toMatchObject({ kind: "Object", range: [14, 16] })
  })

  it("reports a trailing comma at its absolute offset", () => {
    const parsed = expectParsed(parseJson('{"a":1,}', 10))
    expect(parsed.problems).toEqual([
      { kind: "trailingComma", range: [16, 17] },
    ])
  })
})

describe("parseInitJson", () => {
  it.each([
    {
      text: `{'theme": "dark"}`,
      members: [{ key: { value: "theme" }, value: { value: "dark" } }],
    },
    {
      text: `{"fontFamily": "Arial'}`,
      members: [{ key: { value: "fontFamily" }, value: { value: "Arial" } }],
    },
    {
      text: `{'theme': "dark'}`,
      members: [{ key: { value: "theme" }, value: { value: "dark" } }],
    },
    {
      text: `{"fontFamily": "b' , "theme": "dark"}`,
      members: [
        { key: { value: "fontFamily" }, value: { value: "b" } },
        { key: { value: "theme" }, value: { value: "dark" } },
      ],
    },
    {
      text: `{'a": 1, "a': 2}`,
      members: [
        { key: { value: "a" }, value: { value: 1 } },
        { key: { value: "a" }, value: { value: 2 } },
      ],
    },
  ])(
    "prefers Mermaid's valid mixed-quote reading of $text",
    ({ text, members }) => {
      const parsed = expectParsed(parseInitJson(text, 10))
      expect(parsed.value).toMatchObject({ kind: "Object", members })
      expect(parsed.problems).toEqual([])
      expect(mermaidReadsJson(parsed)).toBe(true)
    },
  )

  it("returns only Mermaid's fatal error when both readings fail", () => {
    const parsed = parseInitJson(`{"a":"O'B","b":}`, 10)
    expect(parsed).toEqual({ invalid: true, range: [18, 19] })
  })

  it("ends an unterminated string's report at the trimmed limit", () => {
    expect(parseInitJson('"abc \u2028', 10)).toEqual({
      invalid: true,
      range: [10, 14],
    })
  })

  it("converts a single-quoted value's delimiters", () => {
    const parsed = expectParsed(parseInitJson("'a'", 10))
    expect(parsed.problems).toEqual([])
    expect(parsed.value).toMatchObject({ kind: "String", value: "a" })
  })

  it("reports an apostrophe inside a double-quoted object value", () => {
    const parsed = expectParsed(parseInitJson(`{"a": "it's"}`, 10))
    expect(parsed.problems).toEqual([
      { kind: "apostropheInDoubleQuotedString", range: [19, 20] },
    ])
    expect(parsed.value).toMatchObject({
      kind: "Object",
      members: [{ value: { kind: "String", value: "it's" } }],
    })
  })

  it("reports plain and escaped apostrophes together in the written reading", () => {
    const parsed = expectParsed(
      parseInitJson(String.raw`{"fontFamily": "O'Brien", "theme": "x\'y"}`, 10),
    )
    expect(parsed.problems).toEqual([
      { kind: "apostropheInDoubleQuotedString", range: [27, 28] },
      { kind: "escapedApostrophe", range: [47, 49] },
    ])
    expect(parsed.value).toMatchObject({
      kind: "Object",
      members: [
        { value: { kind: "String", value: "O'Brien" } },
        { value: { kind: "String", value: "x'y" } },
      ],
    })
  })

  it("keeps object members and separators at absolute offsets", () => {
    expect(parseInitJson('{"x":1,"x":2}', 10)).toEqual({
      invalid: false,
      value: {
        kind: "Object",
        range: [10, 23],
        members: [
          {
            range: [11, 16],
            key: {
              kind: "String",
              range: [11, 14],
              text: '"x"',
              value: "x",
            },
            value: { kind: "Number", range: [15, 16], value: 1 },
            comma: [16, 17],
          },
          {
            range: [17, 22],
            key: {
              kind: "String",
              range: [17, 20],
              text: '"x"',
              value: "x",
            },
            value: { kind: "Number", range: [21, 22], value: 2 },
            comma: undefined,
          },
        ],
      },
      problems: [],
    })
  })

  it("keeps array elements and all literal kinds", () => {
    expect(parseInitJson("[true,false,null]", 10)).toEqual({
      invalid: false,
      value: {
        kind: "Array",
        range: [10, 27],
        elements: [
          { kind: "Literal", range: [11, 15], value: true },
          { kind: "Literal", range: [16, 21], value: false },
          { kind: "Literal", range: [22, 26], value: null },
        ],
      },
      problems: [],
    })
  })

  it("reads the JSON number grammar", () => {
    expect(parseInitJson("-12.5E+2", 10)).toEqual({
      invalid: false,
      value: {
        kind: "Number",
        range: [10, 18],
        value: -1250,
      },
      problems: [],
    })
  })

  it("reads successive numbers at their offsets across both readings", () => {
    const text = "[0,-1,2.5,3e-2,4E+2,true,false,null]"
    const parsed = expectParsed(parseJson(text, 10))
    expect(parsed.problems).toEqual([])
    expect(parsed.value).toMatchObject({
      kind: "Array",
      elements: [
        { kind: "Number", value: 0 },
        { kind: "Number", value: -1 },
        { kind: "Number", value: 2.5 },
        { kind: "Number", value: 0.03 },
        { kind: "Number", value: 400 },
        { kind: "Literal", value: true },
        { kind: "Literal", value: false },
        { kind: "Literal", value: null },
      ],
    })
    expect(parseInitJson(text, 10)).toEqual(parsed)
  })

  it("decodes every JSON escape in a double-quoted string", () => {
    expect(parseInitJson(String.raw`"\"\\\/\b\f\n\r\t\u0041"`, 10)).toEqual({
      invalid: false,
      value: {
        kind: "String",
        range: [10, 34],
        text: String.raw`"\"\\\/\b\f\n\r\t\u0041"`,
        value: '"\\/\b\f\n\r\tA',
      },
      problems: [],
    })
  })

  it("decodes every JSON escape and the converted apostrophe in a single-quoted string", () => {
    expect(parseInitJson(String.raw`'\"\\\/\b\f\n\r\t\u0041\''`, 10)).toEqual({
      invalid: false,
      value: {
        kind: "String",
        range: [10, 36],
        text: String.raw`'\"\\\/\b\f\n\r\t\u0041\''`,
        value: '"\\/\b\f\n\r\tA"',
      },
      problems: [{ kind: "escapedApostrophe", range: [33, 35] }],
    })
  })

  it("decodes escaped apostrophes in double quotes as double quotes", () => {
    expect(parseInitJson(String.raw`"it\'s"`, 10)).toEqual({
      invalid: false,
      value: {
        kind: "String",
        range: [10, 17],
        text: String.raw`"it\'s"`,
        value: 'it"s',
      },
      problems: [{ kind: "escapedApostrophe", range: [13, 15] }],
    })
  })

  it("keeps scanning a broken written string to find each apostrophe", () => {
    expect(parseInitJson("\"a'b'c\"", 10)).toEqual({
      invalid: false,
      value: {
        kind: "String",
        range: [10, 17],
        text: "\"a'b'c\"",
        value: "a'b'c",
      },
      problems: [
        { kind: "apostropheInDoubleQuotedString", range: [12, 13] },
        { kind: "apostropheInDoubleQuotedString", range: [14, 15] },
      ],
    })
  })

  it("keeps scanning a broken single-quoted string", () => {
    expect(parseInitJson("'say \"hi\"'", 10)).toEqual({
      invalid: false,
      value: {
        kind: "String",
        range: [10, 20],
        text: "'say \"hi\"'",
        value: 'say "hi"',
      },
      problems: [
        { kind: "quoteInSingleQuotedString", range: [15, 16] },
        { kind: "quoteInSingleQuotedString", range: [18, 19] },
      ],
    })
  })

  it("preserves a Unicode-escaped apostrophe", () => {
    expect(parseInitJson(String.raw`"O\u0027Brien"`, 10)).toEqual({
      invalid: false,
      value: {
        kind: "String",
        range: [10, 24],
        text: String.raw`"O\u0027Brien"`,
        value: "O'Brien",
      },
      problems: [],
    })
  })

  it("trims Unicode whitespace only at the argument's edges", () => {
    expect(parseInitJson("\u00a0 {}\u2028", 10)).toEqual({
      invalid: false,
      value: {
        kind: "Object",
        range: [12, 14],
        members: [],
      },
      problems: [],
    })
  })

  it("reports an unclosed object at its opening bracket", () => {
    expect(parseInitJson('{"x":1', 10)).toEqual({
      invalid: true,
      range: [10, 11],
    })
  })

  it("reports extra text after a closed value", () => {
    expect(parseInitJson("{} next ", 10)).toEqual({
      invalid: true,
      range: [13, 17],
    })
  })

  it.each([
    {
      name: "missing value",
      text: '{"x":} next',
      range: [15, 16],
    },
    {
      name: "missing colon",
      text: '{"x" 1} next',
      range: [15, 16],
    },
  ])("reports the error range after a $name", ({ text, range }) => {
    expect(parseInitJson(text, 10)).toEqual({ invalid: true, range })
  })

  it.each([
    {
      name: "unexpected character in an object",
      text: "{bad} next",
      range: [11, 12],
    },
    {
      name: "missing comma in an object",
      text: '{"x":1 "y":2} next',
      range: [17, 18],
    },
    {
      name: "invalid escape in an object",
      text: String.raw`{"x":"\x"} next`,
      range: [16, 18],
    },
    {
      name: "control character in an object",
      text: '{"x":"a\u0001b"} next',
      range: [17, 18],
    },
    {
      name: "unexpected character in an array",
      text: "[bad] next",
      range: [11, 12],
    },
    {
      name: "missing value in an array",
      text: "[,] next",
      range: [11, 12],
    },
    {
      name: "missing colon in an object inside an array",
      text: '[{"x" 1}] next',
      range: [16, 17],
    },
    {
      name: "missing comma in an array",
      text: "[1 2] next",
      range: [13, 14],
    },
    {
      name: "invalid escape in an array",
      text: String.raw`["\x"] next`,
      range: [12, 14],
    },
    {
      name: "control character in an array",
      text: '["a\u0001b"] next',
      range: [13, 14],
    },
    {
      name: "quoted brackets and a nested structure after an error",
      text: '{bad: "}", [1, {2}]} next',
      range: [11, 12],
    },
    {
      name: "single quotes and escaped quotes after an error",
      text: String.raw`{bad: '\'}', "\"}", [1]} next`,
      range: [11, 12],
    },
    {
      name: "an object without a closing bracket",
      text: "{bad next",
      range: [11, 12],
    },
    {
      name: "an array without a closing bracket",
      text: "[bad next",
      range: [11, 12],
    },
  ])("reports the error range after $name", ({ text, range }) => {
    expect(parseInitJson(text, 10)).toEqual({ invalid: true, range })
  })

  it("reports an error in a nested object", () => {
    expect(parseInitJson('{"x":{bad},"y":2} next', 10)).toEqual({
      invalid: true,
      range: [16, 17],
    })
  })

  it.each([
    {
      name: "invalid escape",
      text: String.raw`"\x}a\"b'" next`,
      range: [11, 13],
    },
    {
      name: "control character",
      text: "'a\u0001}b\\'c\"' next",
      range: [12, 13],
    },
    {
      name: "invalid Unicode escape containing the closing quote",
      text: String.raw`"\u" next`,
      range: [11, 17],
    },
    {
      name: "invalid escape without a closing quote",
      text: String.raw`"\xabc`,
      range: [11, 13],
    },
  ])("reports the error range after $name in a scalar", ({ text, range }) => {
    expect(parseInitJson(text, 10)).toEqual({ invalid: true, range })
  })

  it("hides fixable problems when both readings fail", () => {
    const parsed = parseInitJson('{"x":[1,],bad:"a\'b"}', 10)
    expect(parsed).toEqual({ invalid: true, range: [20, 21] })
  })

  it("keeps the trailing comma on its member", () => {
    expect(parseInitJson('{"x":1,}', 10)).toEqual({
      invalid: false,
      value: {
        kind: "Object",
        range: [10, 18],
        members: [
          {
            range: [11, 16],
            key: {
              kind: "String",
              range: [11, 14],
              text: '"x"',
              value: "x",
            },
            value: { kind: "Number", range: [15, 16], value: 1 },
            comma: [16, 17],
          },
        ],
      },
      problems: [{ kind: "trailingComma", range: [16, 17] }],
    })
  })

  it.each([
    {
      name: "trailing object comma",
      text: '{"x":1,}',
      invalid: false,
      problems: [{ kind: "trailingComma", range: [16, 17] }],
      reads: false,
    },
    {
      name: "trailing array comma",
      text: "[1, ]",
      invalid: false,
      problems: [{ kind: "trailingComma", range: [12, 13] }],
      reads: false,
    },
    {
      name: "apostrophe",
      text: '"O\'Brien"',
      invalid: false,
      problems: [{ kind: "apostropheInDoubleQuotedString", range: [12, 13] }],
      reads: false,
    },
    {
      name: "escaped apostrophe",
      text: String.raw`'it\'s'`,
      invalid: false,
      problems: [{ kind: "escapedApostrophe", range: [13, 15] }],
      reads: true,
    },
    {
      name: "bare double quote",
      text: "'a\"b'",
      invalid: false,
      problems: [{ kind: "quoteInSingleQuotedString", range: [12, 13] }],
      reads: false,
    },
    {
      name: "unterminated string",
      text: '"abc',
      invalid: true,
      range: [10, 14],
      reads: false,
    },
    {
      name: "invalid escape",
      text: String.raw`"\x"`,
      invalid: true,
      range: [11, 13],
      reads: false,
    },
    {
      name: "short Unicode escape",
      text: String.raw`"\u12`,
      invalid: true,
      range: [11, 15],
      reads: false,
    },
    {
      name: "non-hexadecimal escape",
      text: String.raw`"\u12xy"`,
      invalid: true,
      range: [11, 17],
      reads: false,
    },
    {
      name: "raw control character",
      text: '"a\u0001b"',
      invalid: true,
      range: [12, 13],
      reads: false,
    },
    {
      name: "raw line break",
      text: `"a
b"`,
      invalid: true,
      range: [12, 13],
      reads: false,
    },
    {
      name: "unquoted key",
      text: "{x:1}",
      invalid: true,
      range: [11, 12],
      reads: false,
    },
    {
      name: "plus sign",
      text: "+1",
      invalid: true,
      range: [10, 11],
      reads: false,
    },
    {
      name: "leading dot",
      text: ".5",
      invalid: true,
      range: [10, 11],
      reads: false,
    },
    {
      name: "leading zero",
      text: "01",
      invalid: true,
      range: [11, 12],
      reads: false,
    },
    {
      name: "negative leading zero",
      text: "-01",
      invalid: true,
      range: [12, 13],
      reads: false,
    },
    {
      name: "minus before a non-number",
      text: "-x",
      invalid: true,
      range: [10, 11],
      reads: false,
    },
    {
      name: "minus without digits",
      text: "-",
      invalid: true,
      range: [10, 11],
      reads: false,
    },
    {
      name: "NaN",
      text: "NaN",
      invalid: true,
      range: [10, 11],
      reads: false,
    },
    {
      name: "non-JSON whitespace",
      text: "[1,\u00a02]",
      invalid: true,
      range: [13, 14],
      reads: false,
    },
    {
      name: "invalid character after value",
      text: "[1 @]",
      invalid: true,
      range: [13, 14],
      reads: false,
    },
    {
      name: "empty argument",
      text: "",
      invalid: true,
      range: [10, 10],
      reads: false,
    },
    {
      name: "whitespace-only argument",
      text: " ",
      invalid: true,
      range: [11, 11],
      reads: false,
    },
    {
      name: "missing fraction digits",
      text: "1.",
      invalid: true,
      range: [11, 12],
      reads: false,
    },
    {
      name: "missing exponent digits",
      text: "1e+",
      invalid: true,
      range: [11, 13],
      reads: false,
    },
    {
      name: "missing fraction digits in an array",
      text: "[1.]",
      invalid: true,
      range: [12, 13],
      reads: false,
    },
    {
      name: "missing exponent digits in an array",
      text: "[1e+]",
      invalid: true,
      range: [12, 13],
      reads: false,
    },
    {
      name: "missing member value",
      text: '{"x":}',
      invalid: true,
      range: [15, 16],
      reads: false,
    },
    {
      name: "missing element",
      text: "[,]",
      invalid: true,
      range: [11, 12],
      reads: false,
    },
    {
      name: "missing value after comma",
      text: "[1,,2]",
      invalid: true,
      range: [13, 14],
      reads: false,
    },
    {
      name: "missing value at end",
      text: "[",
      invalid: true,
      range: [11, 11],
      reads: false,
    },
    {
      name: "missing colon",
      text: '{"x" 1}',
      invalid: true,
      range: [15, 16],
      reads: false,
    },
    {
      name: "missing object comma",
      text: '{"x":1 "y":2}',
      invalid: true,
      range: [17, 18],
      reads: false,
    },
    {
      name: "missing array comma",
      text: "[1 2]",
      invalid: true,
      range: [13, 14],
      reads: false,
    },
    {
      name: "unclosed object",
      text: "{",
      invalid: true,
      range: [10, 11],
      reads: false,
    },
    {
      name: "unclosed array",
      text: "[1",
      invalid: true,
      range: [10, 11],
      reads: false,
    },
    {
      name: "extra text",
      text: "{} x",
      invalid: true,
      range: [13, 14],
      reads: false,
    },
    {
      name: "valid object",
      text: "{}",
      invalid: false,
      problems: [],
      reads: true,
    },
    {
      name: "valid single quotes",
      text: "{'x':'y'}",
      invalid: false,
      problems: [],
      reads: true,
    },
  ])("reports $name and whether mermaid.js reads it", (testCase) => {
    const parsed = parseInitJson(testCase.text, 10)
    if (testCase.invalid)
      expect(parsed).toMatchObject({ invalid: true, range: testCase.range })
    else expect(expectParsed(parsed).problems).toEqual(testCase.problems)
    expect(mermaidReadsJson(parsed)).toEqual(testCase.reads)
  })
})

describe("sameJsonValue", () => {
  it.each([
    {
      a: '{"z":{"b":0,"b":2,"a":1},"a":[{"y":false,"x":null}]}',
      b: '{"a":[{"x":null,"y":false}],"z":{"a":1,"b":2}}',
      same: true,
    },
    { a: "1", b: "1.0", same: true },
    { a: "1", b: "1e0", same: true },
    { a: "-0", b: "0", same: true },
    { a: "1e400", b: "2e400", same: true },
    { a: "1e400", b: "-1e400", same: false },
    { a: "1", b: "2", same: false },
    { a: "true", b: "false", same: false },
    { a: "null", b: '"null"', same: false },
    { a: "[1,2]", b: "[2,1]", same: false },
    { a: "[1]", b: "[1,2]", same: false },
    { a: "[]", b: "[]", same: true },
    { a: "{}", b: "{}", same: true },
    { a: '{"a":1}', b: '{"b":1}', same: false },
    { a: '{"a":1}', b: '{"a":1,"b":2}', same: false },
    { a: '{"x":{"a":1}}', b: '{"x":{"a":2}}', same: false },
    { a: '{"x":1,"x":2}', b: '{"x":1}', same: false },
    {
      a: String.raw`{'\u0078':'it\'s'}`,
      b: String.raw`{"x":"it\"s"}`,
      same: true,
    },
    { a: String.raw`"a\nb"`, b: String.raw`"a\u000ab"`, same: true },
    { a: '"a"', b: '"b"', same: false },
  ])("compares $a with $b", ({ a, b, same }) => {
    const left = parseInitJson(a, 10)
    const right = parseInitJson(b, 10)
    expect(mermaidReadsJson(left)).toBe(true)
    expect(mermaidReadsJson(right)).toBe(true)
    if (left.invalid || right.invalid) throw new Error("Expected JSON values")
    expect(sameJsonValue(left.value, right.value)).toBe(same)
    expect(sameJsonValue(right.value, left.value)).toBe(same)
  })
})
