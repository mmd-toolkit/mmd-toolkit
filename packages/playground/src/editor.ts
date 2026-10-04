import * as monaco from "monaco-editor-core"
import EditorWorker from "monaco-editor-core/esm/vs/editor/editor.worker.start.js?worker"
import { shikiToMonaco } from "@shikijs/monaco"
import { createHighlighterCore } from "shiki/core"
import { createOnigurumaEngine } from "shiki/engine/oniguruma"
import mermaid from "shiki/langs/mermaid.mjs"
import json from "shiki/langs/json.mjs"
import light from "shiki/themes/github-light.mjs"
import dark from "shiki/themes/github-dark.mjs"

let ready: Promise<void> | undefined

/**
 * Shares one asynchronous worker/tokenizer setup across every editor mount.
 * Callers await it before creating Monaco models; concurrent mounts reuse the
 * same promise and do not register the languages or themes repeatedly.
 */
export function initializeEditors(): Promise<void> {
  ready ??= (async () => {
    globalThis.MonacoEnvironment = { getWorker: () => new EditorWorker() }
    // Import only the languages and themes used here, with locally bundled WASM.
    const highlighter = await createHighlighterCore({
      themes: [light, dark],
      langs: [mermaid, json],
      engine: createOnigurumaEngine(import("shiki/wasm")),
    })
    monaco.languages.register({ id: "mermaid" })
    monaco.languages.register({ id: "json" })
    shikiToMonaco(highlighter, monaco)
  })()
  return ready
}

export { monaco }
