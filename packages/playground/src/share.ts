/** The indentation options stored with shared source text. */
export interface FormatOptions {
  tabWidth: number
  useTabs: boolean
}

/** Version 1 of the URL state; derived results and appearance are excluded. */
export interface SharedState extends FormatOptions {
  source: string
}

const alphabet =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"

/** Encodes bytes as unpadded base64url without argument-size limits. */
function encodeBytes(bytes: Uint8Array): string {
  let result = ""
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i]
    const b = bytes[i + 1]
    const c = bytes[i + 2]
    result += alphabet[a >> 2]
    result += alphabet[((a & 3) << 4) | ((b ?? 0) >> 4)]
    if (b !== undefined) result += alphabet[((b & 15) << 2) | ((c ?? 0) >> 6)]
    if (c !== undefined) result += alphabet[c & 63]
  }
  return result
}

/** Decodes canonical base64url, rejecting malformed and noncanonical input. */
function decodeBytes(value: string): Uint8Array<ArrayBuffer> {
  if (!value || value.length % 4 === 1)
    throw new Error("Invalid shared URL encoding.")
  const bytes: number[] = []
  let buffer = 0
  let bits = 0
  for (const char of value) {
    const digit = alphabet.indexOf(char)
    if (digit < 0) throw new Error("Invalid shared URL encoding.")
    buffer = (buffer << 6) | digit
    bits += 6
    if (bits >= 8) {
      bits -= 8
      bytes.push((buffer >> bits) & 255)
    }
  }
  if ((buffer & ((1 << bits) - 1)) !== 0)
    throw new Error("Invalid shared URL encoding.")
  return new Uint8Array(bytes)
}

/** Validates every field before replacing any current editor state. */
function validateState(value: unknown): SharedState {
  if (
    typeof value !== "object" ||
    value === null ||
    !("source" in value) ||
    typeof value.source !== "string" ||
    !("tabWidth" in value) ||
    !Number.isInteger(value.tabWidth) ||
    typeof value.tabWidth !== "number" ||
    value.tabWidth < 1 ||
    value.tabWidth > 8 ||
    !("useTabs" in value) ||
    typeof value.useTabs !== "boolean"
  )
    throw new Error("Invalid shared input or indentation options.")
  return {
    source: value.source,
    tabWidth: value.tabWidth,
    useTabs: value.useTabs,
  }
}

/** Packs JSON first so even lone UTF-16 surrogates survive sharing exactly. */
export async function encodeState(state: SharedState): Promise<string> {
  validateState(state)
  const bytes = new TextEncoder().encode(JSON.stringify(state))
  const stream = new Blob([bytes])
    .stream()
    .pipeThrough(new CompressionStream("gzip"))
  const compressed = new Uint8Array(await new Response(stream).arrayBuffer())
  return `#v1=${encodeBytes(compressed)}`
}

/** Unpacks a versioned fragment and validates the restored source and options. */
export async function decodeState(hash: string): Promise<SharedState> {
  if (!hash.startsWith("#v1=")) throw new Error("Unknown shared URL version.")
  const compressed = decodeBytes(hash.slice(4))
  try {
    const stream = new Blob([compressed])
      .stream()
      .pipeThrough(new DecompressionStream("gzip"))
    const bytes = await new Response(stream).arrayBuffer()
    return validateState(
      JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)),
    )
  } catch {
    throw new Error("Unable to read the shared input. The URL may be damaged.")
  }
}
