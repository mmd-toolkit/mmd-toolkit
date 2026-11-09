/** The formatting options stored with shared source text. */
export interface FormatOptions {
  printWidth: number
  tabWidth: number
  useTabs: boolean
}

/**
 * The formatting options of a new input and of a link made before the print
 * width was kept: Prettier's defaults.
 */
export const defaultFormatOptions: Readonly<FormatOptions> = {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
}

/**
 * Whether a value is a print width that the formatter and a link accept: an
 * integer of at least 0, as Prettier's definition of the option says.
 */
export function isPrintWidth(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
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
  // Unpadded base64 still requires zero unused bits in the final digit.
  if ((buffer & ((1 << bits) - 1)) !== 0)
    throw new Error("Invalid shared URL encoding.")
  return new Uint8Array(bytes)
}

/**
 * Validates the complete payload before it can replace editor state. The
 * option ranges match the UI controls; source is accepted as arbitrary text,
 * including empty input and syntax the parser rejects. Older links without a
 * print width use the default.
 */
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
    throw new Error("Invalid shared input or formatting options.")
  const printWidth =
    "printWidth" in value ? value.printWidth : defaultFormatOptions.printWidth
  if (!isPrintWidth(printWidth)) throw new Error("Invalid shared print width.")
  return {
    source: value.source,
    printWidth,
    tabWidth: value.tabWidth,
    useTabs: value.useTabs,
  }
}

/**
 * Returns a #v1= fragment containing gzip-compressed UTF-8 JSON in base64url.
 * JSON escapes lone UTF-16 surrogates before TextEncoder can replace them, so
 * decoding preserves the original JavaScript string exactly.
 */
export async function encodeState(state: SharedState): Promise<string> {
  validateState(state)
  const bytes = new TextEncoder().encode(JSON.stringify(state))
  const stream = new Blob([bytes])
    .stream()
    .pipeThrough(new CompressionStream("gzip"))
  const compressed = new Uint8Array(await new Response(stream).arrayBuffer())
  return `#v1=${encodeBytes(compressed)}`
}

/**
 * Restores source and options from a #v1= fragment without changing UI state.
 * Rejects unknown versions, malformed encoding and invalid payloads; callers
 * must wait for complete validation before applying any of the returned fields.
 */
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
