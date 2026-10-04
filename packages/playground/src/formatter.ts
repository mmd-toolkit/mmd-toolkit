import { format } from "prettier/standalone"
import yaml from "prettier/plugins/yaml"
import mmd from "prettier-plugin-mmd"
import type { FormatOptions } from "./share.ts"

let plugin = mmd
const listeners = new Set<() => void>()

/** Formats in the browser, loading both the workspace plugin and YAML. */
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

/** Subscribes to formatter updates after this lazy module has been loaded. */
export function onFormatterUpdate(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

if (import.meta.hot) {
  import.meta.hot.accept("prettier-plugin-mmd", (updated) => {
    if (!updated) return
    plugin = updated.default
    for (const listener of listeners) listener()
  })
}
