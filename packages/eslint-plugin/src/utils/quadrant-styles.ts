import type { QuadrantLiteral } from "@mmd-toolkit/parser"

/** A style of a point or of a class: its name and the value that mermaid.js keeps. */
export interface QuadrantStyle {
  readonly name: string
  readonly value: string | number
}

/**
 * The style that the text `style` sets, as mermaid.js reads it: the name before
 * the first colon and the value between the first and the second colon, each
 * without the whitespace at its ends. The value of a `radius` is an integer
 * (`parseInt`); every other value is the text as written.
 */
export function styleOf(style: QuadrantLiteral): QuadrantStyle {
  const [name, text] = style.value.split(":").map((part) => part.trim())
  return { name, value: name === "radius" ? Number.parseInt(text, 10) : text }
}
