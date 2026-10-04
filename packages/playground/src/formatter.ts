import { format } from "prettier/standalone"
import yaml from "prettier/plugins/yaml"
import mmd from "prettier-plugin-mmd"
import type { FormatOptions } from "./share.ts"

let plugin = mmd
const listeners = new Set<() => void>()

/**
 * Formats with browser Prettier and the current workspace plugin. Standalone
 * Prettier needs plugins supplied explicitly; YAML handles embedded frontmatter.
 * Output always uses LF, which the editor also applies as an undoable EOL change.
 */
export function formatSource(
  source: string,
  options: FormatOptions,
): Promise<string> {
  return format(source, {
    parser: "mermaid",
    plugins: [plugin, yaml],
    tabWidth: options.tabWidth,
    useTabs: options.useTabs,
    endOfLine: "lf",
  })
}

/** Subscribes to plugin hot updates and returns a callback to unsubscribe. */
export function onFormatterUpdate(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

if (import.meta.hot) {
  // Accept here so a plugin edit refreshes the preview without remounting Vue.
  import.meta.hot.accept("prettier-plugin-mmd", (updated) => {
    if (!updated) return
    plugin = updated.default
    for (const listener of listeners) listener()
  })
}
