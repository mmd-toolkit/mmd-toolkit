import { describe, expect, it } from "vitest"
import { decodeState, encodeState } from "../src/share.ts"

/** Produces a fragment independently of the codec to test untrusted payloads. */
async function fragment(json: string): Promise<string> {
  const stream = new Blob([json])
    .stream()
    .pipeThrough(new CompressionStream("gzip"))
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer())
  return `#v1=${Buffer.from(bytes).toString("base64url")}`
}

describe("shared URL state", () => {
  it.each([
    "",
    "flowchart LR\r\n A-->B\r",
    "日本語 😀 \u2028 \u2029 \uFEFF",
    "\uD800 lone \uDC00",
    "not a diagram",
  ])("round trips %j exactly", async (source) => {
    const state = { source, tabWidth: 8, useTabs: true }
    expect(await decodeState(await encodeState(state))).toEqual(state)
  })
  it.each([
    "#v2=abc",
    "#v1=",
    "#v1=a",
    "#v1=abc=",
    "#v1=ab",
    "#v1=____",
    "#v1=ab+c",
  ])("rejects damaged or unknown fragments %s", async (hash) => {
    await expect(decodeState(hash)).rejects.toThrow()
  })
  it.each([
    null,
    {},
    { source: "a", tabWidth: 0, useTabs: false },
    { source: "a", tabWidth: 9, useTabs: false },
    { source: "a", tabWidth: 2.5, useTabs: false },
    { source: "a", tabWidth: "2", useTabs: false },
    { source: "a", tabWidth: 2, useTabs: "false" },
  ])("rejects invalid state %j", async (state) => {
    await expect(
      decodeState(await fragment(JSON.stringify(state))),
    ).rejects.toThrow()
  })
  it("round trips large compressible input", async () => {
    const state = {
      source: "a".repeat(1_048_576),
      tabWidth: 2,
      useTabs: false,
    }
    expect(await decodeState(await encodeState(state))).toEqual(state)
  })
  it("round trips long shared URLs", async () => {
    const state = {
      source: Array.from({ length: 50_000 }, (_, index) =>
        index.toString(36),
      ).join(" "),
      tabWidth: 2,
      useTabs: false,
    }
    const hash = await encodeState(state)
    expect(hash.length).toBeGreaterThan(65_536)
    expect(await decodeState(hash)).toEqual(state)
  })
  it("rejects corrupted gzip and malformed JSON", async () => {
    await expect(decodeState(await fragment("{broken"))).rejects.toThrow(
      "damaged",
    )
    const valid = await encodeState({
      source: "a",
      tabWidth: 2,
      useTabs: false,
    })
    await expect(decodeState(valid.slice(0, -5))).rejects.toThrow()
  })
})
