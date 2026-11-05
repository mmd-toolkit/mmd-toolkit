import * as monaco from "monaco-editor-core"
import EditorWorker from "monaco-editor-core/esm/vs/editor/editor.worker.start.js?worker"
import mermaid from "@mmd-toolkit/textmate-grammar"
import { shikiToMonaco } from "@shikijs/monaco"
import { createHighlighterCore } from "shiki/core"
import { createOnigurumaEngine } from "shiki/engine/oniguruma"
import json from "shiki/langs/json.mjs"
import yaml from "shiki/langs/yaml.mjs"
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
    // Mermaid text is colored with the grammar of @mmd-toolkit/textmate-grammar,
    // written for every diagram type from the specification of this
    // repository, which embeds yaml (the frontmatter); json is the language of
    // the editors of the JSON view.
    const highlighter = await createHighlighterCore({
      themes: [light, dark],
      langs: [mermaid, yaml, json],
      engine: createOnigurumaEngine(import("shiki/wasm")),
    })
    monaco.languages.register({ id: "mermaid" })
    monaco.languages.register({ id: "json" })
    shikiToMonaco(highlighter, monaco)
  })()
  return ready
}

export { monaco }
