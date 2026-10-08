<script setup lang="ts" vapor>
import { onMounted, onBeforeUnmount, watch, useTemplateRef } from "vue"
import type { Range } from "@mmd-toolkit/parser"
import { initializeEditors, monaco } from "../editor.ts"

const props = defineProps<{
  value: string
  label: string
  readonly?: boolean
  language?: string
  dark: boolean
  tabWidth: number
  useTabs: boolean
  selectedRange?: Range | null
  revealSelection?: boolean
  diagnostic?: { message: string; range: Range } | null
}>()
const emit = defineEmits<{
  change: [value: string]
  cursor: [offset: number]
  ready: []
  failure: [message: string]
}>()
const container = useTemplateRef<HTMLDivElement>("container")
let editor: monaco.editor.IStandaloneCodeEditor | undefined,
  model: monaco.editor.ITextModel | undefined,
  decorations: monaco.editor.IEditorDecorationsCollection | undefined
let disposed = false
const subscriptions: monaco.IDisposable[] = []

/**
 * Converts shared UTF-16 offsets through Monaco's own line model. Parser line
 * and column values follow its line-terminator rules, which need not match the
 * editor's treatment of every separator; offsets keep highlights aligned.
 */
function editorRange(range: Range): monaco.Range | undefined {
  if (!model) return undefined
  const start = model.getPositionAt(range[0])
  const end = model.getPositionAt(range[1])
  return new monaco.Range(
    start.lineNumber,
    start.column,
    end.lineNumber,
    end.column,
  )
}

/** Updates the current source selection without moving the editing cursor. */
function decorate(): void {
  const range = props.selectedRange
    ? editorRange(props.selectedRange)
    : undefined
  decorations?.set(
    range
      ? [
          {
            range,
            options: {
              inlineClassName: "source-selection",
              className: "source-selection",
            },
          },
        ]
      : [],
  )
  if (range && props.revealSelection)
    editor?.revealRangeInCenterIfOutsideViewport(range)
}

/** Shows only direct parser diagnostics for this exact current source. */
function diagnose(): void {
  if (!model) return
  const range = props.diagnostic
    ? editorRange(props.diagnostic.range)
    : undefined
  monaco.editor.setModelMarkers(
    model,
    "mmd-toolkit",
    range && props.diagnostic
      ? [
          {
            ...range,
            severity: monaco.MarkerSeverity.Error,
            message: props.diagnostic.message,
          },
        ]
      : [],
  )
}

/**
 * Replaces source as one undoable edit, including its line-ending choice.
 * normalizeEol applies the formatter's LF output; other replacements retain
 * CRLF when present. Using edits rather than setValue preserves source history.
 */
function replace(value: string, normalizeEol = false): void {
  if (!editor || !model) return
  editor.pushUndoStop()
  model.pushEOL(
    !normalizeEol && value.includes("\r\n")
      ? monaco.editor.EndOfLineSequence.CRLF
      : monaco.editor.EndOfLineSequence.LF,
  )
  editor.executeEdits("playground", [
    { range: model.getFullModelRange(), text: value, forceMoveMarkers: true },
  ])
  editor.pushUndoStop()
  emit("change", model.getValue())
}

defineExpose({ replace })

onMounted(async () => {
  try {
    await initializeEditors()
    // A result tab may have unmounted while the shared tokenizer was loading.
    if (disposed || !container.value) return
    model = monaco.editor.createModel(props.value, props.language ?? "mermaid")
    editor = monaco.editor.create(container.value, {
      model,
      ariaLabel: props.label,
      readOnly: props.readonly ?? false,
      theme: props.dark ? "github-dark" : "github-light",
      automaticLayout: true,
      minimap: { enabled: false },
      fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
      fontSize: 13,
      lineHeight: 22,
      padding: { top: 20, bottom: 20 },
      scrollBeyondLastLine: false,
      renderLineHighlight: props.readonly ? "none" : "line",
      tabSize: props.tabWidth,
      insertSpaces: !props.useTabs,
      detectIndentation: false,
      wordWrap: "on",
      folding: false,
      glyphMargin: false,
      lineNumbersMinChars: 3,
      fixedOverflowWidgets: true,
    })
    decorations = editor.createDecorationsCollection()
    subscriptions.push(
      model.onDidChangeContent(() => emit("change", model?.getValue() ?? "")),
    )
    subscriptions.push(
      editor.onDidChangeCursorPosition((event) => {
        if (model) emit("cursor", model.getOffsetAt(event.position))
      }),
    )
    // Monaco normalizes line endings on creation. Parsing and sharing must use
    // the actual editable buffer so their offsets agree with the editor model.
    if (!props.readonly) emit("change", model.getValue())
    decorate()
    diagnose()
    emit("ready")
  } catch (error) {
    emit(
      "failure",
      error instanceof Error ? error.message : "Unable to load the editor.",
    )
  }
})
watch(
  () => props.value,
  (value) => {
    if (!model || model.getValue() === value) return
    if (props.readonly) model.setValue(value)
    else replace(value)
  },
)
watch(
  () => props.dark,
  (value) => monaco.editor.setTheme(value ? "github-dark" : "github-light"),
)
watch(
  () => [props.tabWidth, props.useTabs],
  () =>
    model?.updateOptions({
      tabSize: props.tabWidth,
      insertSpaces: !props.useTabs,
    }),
)
watch(() => [props.selectedRange, props.revealSelection], decorate)
watch(() => props.diagnostic, diagnose)
onBeforeUnmount(() => {
  disposed = true
  for (const subscription of subscriptions) subscription.dispose()
  decorations?.clear()
  editor?.dispose()
  model?.dispose()
})
</script>

<template>
  <div ref="container" class="code-editor"></div>
</template>

<style scoped>
.code-editor {
  flex: 1;
  min-height: 0;
  width: 100%;
}
/* Monaco creates decoration elements outside Vue's template, so they do not
   carry the scope attribute. Keep the deep selector inside this editor. */
:where(.code-editor) :deep(.source-selection) {
  background: #8899ee33;
}
</style>
