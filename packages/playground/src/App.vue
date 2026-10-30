<script setup lang="ts" vapor>
import { computed, nextTick, ref, useTemplateRef, watch } from "vue"
import CodeEditor from "./components/CodeEditor.vue"
import ExamplesMenu from "./components/ExamplesMenu.vue"
import TreeItem from "./components/TreeItem.vue"
import { selectionAtOffset } from "./ast.ts"
import type { TreeSelection } from "./ast.ts"
import { usePlayground } from "./use-playground.ts"

const brandIcon = `${import.meta.env.BASE_URL}mmd-toolkit.svg`
const {
  source,
  tabWidth,
  useTabs,
  tab,
  astView,
  root,
  selection,
  diagnostic,
  parseStatus,
  parseMessage,
  parseMilliseconds,
  nodeCount,
  json,
  selectedJson,
  excerpt,
  formatted,
  formatStatus,
  formatMessage,
  formatMilliseconds,
  canApply,
  shareOpen,
  shareUrl,
  shareMessage,
  shareBusy,
  copied,
  restoring,
  editorFailure,
  dark,
  toggleTheme,
  copyLink,
  share,
} = usePlayground()
const sourceEditor = useTemplateRef<{
  replace(value: string, normalizeEol?: boolean): void
}>("sourceEditor")
const treeScroll = useTemplateRef<HTMLDivElement>("treeScroll")
const astTab = useTemplateRef<HTMLButtonElement>("astTab")
const formattedTab = useTemplateRef<HTMLButtonElement>("formattedTab")
const cursorOffset = ref<number | null>(null)
const revealSelection = ref(false)
const recordView = computed(() => {
  if (!root.value) return null
  return Reflect.get(root.value, astView.value)
})
const characterCount = computed(() =>
  source.value.length.toLocaleString("en-US"),
)

/** Synchronizes the current view with the source cursor without changing the AST. */
function synchronizeSelection(): void {
  revealSelection.value = false
  selection.value =
    root.value && cursorOffset.value !== null
      ? selectionAtOffset(root.value, cursorOffset.value, astView.value)
      : null
}

/** Tracks the source cursor, including clicks at its existing position. */
function selectOffset(offset: number): void {
  cursorOffset.value = offset
  synchronizeSelection()
}

watch([root, astView], synchronizeSelection)

/** Reveals the selected row after expansion, scrolling only the tree viewport. */
async function revealTreeSelection(row: HTMLDivElement): Promise<void> {
  await nextTick()
  const container = treeScroll.value
  // Reparsing or switching views may have replaced the row during the render.
  if (!container || !container.contains(row)) return
  const viewport = container.getBoundingClientRect()
  const top = viewport.top + container.clientTop
  const bottom = top + container.clientHeight
  const bounds = row.getBoundingClientRect()
  // scrollIntoView could move ancestor viewports; adjust only the tree and only
  // enough to make the entire row visible, preserving editor focus.
  if (bounds.top < top) container.scrollTop += bounds.top - top
  else if (bounds.bottom > bottom) container.scrollTop += bounds.bottom - bottom
}

/** Reveals a tree selection; selections from the editing cursor never scroll it away. */
function selectTree(value: TreeSelection): void {
  revealSelection.value = true
  selection.value = value
}

/** Applies the current result as one undoable replacement, including LF line ends. */
function applyFormatted(): void {
  if (canApply.value) sourceEditor.value?.replace(formatted.value, true)
}

/** Implements the two-tab keyboard pattern with focus following selection. */
function tabKey(event: KeyboardEvent): void {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return
  event.preventDefault()
  tab.value =
    event.key === "Home"
      ? "ast"
      : event.key === "End"
        ? "formatted"
        : tab.value === "ast"
          ? "formatted"
          : "ast"
  const button = tab.value === "ast" ? astTab.value : formattedTab.value
  button?.focus()
}
</script>

<template>
  <div class="playground">
    <header class="app-header">
      <a
        class="brand"
        href="../"
        aria-label="mmd-toolkit documentation"
        title="mmd-toolkit documentation"
      >
        <img
          class="brand-mark"
          :src="brandIcon"
          alt=""
          width="28"
          height="28"
        />
        <div>
          <h1>mmd-toolkit</h1>
          <span class="brand-caption">PLAYGROUND</span>
        </div>
      </a>
      <div class="header-actions">
        <a
          class="github-link"
          href="https://github.com/mmd-toolkit/mmd-toolkit"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View repository on GitHub"
          title="View repository on GitHub"
        >
          <!-- GitHub mark from Primer Octicons (MIT); see public/licenses/octicons.txt. -->
          <svg
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M6.766 11.328c-2.063-.25-3.516-1.734-3.516-3.656 0-.781.281-1.625.75-2.188-.203-.515-.172-1.609.063-2.062.625-.078 1.468.25 1.968.703.594-.187 1.219-.281 1.985-.281.765 0 1.39.094 1.953.265.484-.437 1.344-.765 1.969-.687.218.422.25 1.515.046 2.047.5.593.766 1.39.766 2.203 0 1.922-1.453 3.375-3.547 3.64.531.344.89 1.094.89 1.954v1.625c0 .468.391.734.86.547C13.781 14.359 16 11.53 16 8.03 16 3.61 12.406 0 7.984 0 3.563 0 0 3.61 0 8.031a7.88 7.88 0 0 0 5.172 7.422c.422.156.828-.125.828-.547v-1.25c-.219.094-.5.156-.75.156-1.031 0-1.64-.562-2.078-1.609-.172-.422-.36-.672-.719-.719-.187-.015-.25-.093-.25-.187 0-.188.313-.328.625-.328.453 0 .844.281 1.25.86.313.452.64.655 1.031.655s.641-.14 1-.5c.266-.265.47-.5.657-.656"
            />
          </svg>
          <span class="github-label">GitHub</span>
        </a>
        <ExamplesMenu @select="source = $event" />
        <button class="share-button" @click="share">
          Share <span aria-hidden="true">↗</span>
        </button>
        <span class="toolbar-divider"></span>
        <button
          class="snb-shine-and-bright-switch"
          aria-label="Dark theme"
          :aria-pressed="dark"
          @click="toggleTheme"
        >
          <span class="snb-shine-and-bright" aria-hidden="true"></span>
        </button>
      </div>
    </header>
    <div v-if="shareOpen" class="share-panel">
      <label for="shared-url">Share this input</label
      ><input
        id="shared-url"
        :value="shareUrl"
        readonly
        :placeholder="shareBusy ? 'Creating link…' : 'Link updates as you type'"
        @focus="($event.target as HTMLInputElement).select()"
      /><button :disabled="!shareUrl || shareBusy" @click="copyLink">
        {{ copied ? "Copied" : "Copy Link" }}</button
      ><button
        class="icon-button"
        aria-label="Close share panel"
        @click="shareOpen = false"
      >
        ×
      </button>
    </div>
    <p v-if="shareMessage" class="notice" role="status">{{ shareMessage }}</p>
    <p v-if="restoring" class="notice" role="status">Restoring shared input…</p>
    <p v-if="editorFailure" class="notice error" role="alert">
      Unable to load the editor: {{ editorFailure }}
    </p>
    <main class="workspace">
      <section class="pane source-pane" aria-labelledby="source-heading">
        <div class="pane-header">
          <div>
            <h2 id="source-heading">Source</h2>
            <span class="file-badge">diagram.mmd</span>
          </div>
        </div>
        <CodeEditor
          ref="sourceEditor"
          :value="source"
          label="Mermaid source"
          :dark="dark"
          :tab-width="tabWidth"
          :use-tabs="useTabs"
          :selected-range="selection?.range"
          :reveal-selection="revealSelection"
          :diagnostic="diagnostic"
          @change="source = $event"
          @cursor="selectOffset"
          @failure="editorFailure = $event"
        />
        <div class="pane-footer">
          <span>{{ characterCount }} UTF-16 units</span><span>Mermaid</span>
        </div>
      </section>
      <section class="pane result-pane" aria-label="Results">
        <div class="pane-header result-header">
          <div role="tablist" aria-label="Result view" @keydown="tabKey">
            <button
              id="tab-ast"
              ref="astTab"
              role="tab"
              :aria-selected="tab === 'ast'"
              aria-controls="panel-ast"
              :tabindex="tab === 'ast' ? 0 : -1"
              @click="tab = 'ast'"
            >
              AST</button
            ><button
              id="tab-formatted"
              ref="formattedTab"
              role="tab"
              :aria-selected="tab === 'formatted'"
              aria-controls="panel-formatted"
              :tabindex="tab === 'formatted' ? 0 : -1"
              @click="tab = 'formatted'"
            >
              Formatted
            </button>
          </div>
        </div>
        <div
          v-if="tab === 'ast'"
          id="panel-ast"
          class="result-content"
          role="tabpanel"
          aria-labelledby="tab-ast"
        >
          <div class="sub-toolbar">
            <label class="sr-only" for="ast-view">AST view</label
            ><select id="ast-view" v-model="astView">
              <option value="tree">Tree</option>
              <option value="json">JSON</option>
              <option value="tokens">Tokens</option>
              <option value="comments">Comments</option>
              <option value="directives">Directives</option>
              <option value="frontmatter">Frontmatter</option></select
            ><span v-if="root" class="type-badge">{{ root.diagramType }}</span>
          </div>
          <div
            v-if="parseStatus !== 'ready'"
            class="empty-state"
            :class="{ error: parseStatus === 'error' }"
            role="status"
          >
            <span class="empty-symbol" aria-hidden="true">{{
              parseStatus === "pending" ? "…" : "!"
            }}</span>
            <h3>
              {{
                parseStatus === "pending"
                  ? "Reading your source"
                  : "Unable to parse"
              }}
            </h3>
            <pre v-if="parseMessage">{{ parseMessage }}</pre>
          </div>
          <template v-else>
            <CodeEditor
              v-if="astView === 'json'"
              :value="json"
              label="AST JSON"
              readonly
              language="json"
              :dark="dark"
              :tab-width="2"
              :use-tabs="false"
              @failure="editorFailure = $event"
            />
            <div v-else ref="treeScroll" class="tree-scroll">
              <TreeItem
                :key="astView"
                :value="astView === 'tree' ? root : recordView"
                :label="astView === 'tree' ? 'Root' : astView"
                :path="astView === 'tree' ? 'root' : `root.${astView}`"
                :depth="0"
                :kind="astView === 'tree' ? 'node' : 'record'"
                :selected="selection?.path ?? null"
                @select="selectTree"
                @reveal-selection="revealTreeSelection"
              />
            </div>
            <div
              v-if="selection && astView !== 'json'"
              class="selection-details"
            >
              <div class="details-header">
                <span>{{ selection.path }}</span
                ><button
                  class="icon-button"
                  aria-label="Clear selection"
                  @click="selection = null"
                >
                  ×
                </button>
              </div>
              <div class="details-body">
                <pre v-if="selection.range" class="source-excerpt">{{
                  excerpt || "(empty range)"
                }}</pre>
                <pre>{{ selectedJson }}</pre>
              </div>
            </div>
          </template>
          <div class="pane-footer" role="status">
            <span>{{
              root
                ? `${nodeCount} nodes · ${root.tokens.length} tokens`
                : parseStatus === "pending"
                  ? "Parsing…"
                  : "No AST available"
            }}</span
            ><span v-if="root">{{ parseMilliseconds.toFixed(1) }} ms</span>
          </div>
        </div>
        <div
          v-else
          id="panel-formatted"
          class="result-content"
          role="tabpanel"
          aria-labelledby="tab-formatted"
        >
          <div class="sub-toolbar format-toolbar">
            <label for="tab-width">Indent</label
            ><select id="tab-width" v-model.number="tabWidth">
              <option v-for="width in 8" :key="width" :value="width">
                {{ width }}
              </option></select
            ><label class="checkbox-label"
              ><input v-model="useTabs" type="checkbox" />Use tabs</label
            ><button
              class="apply-button"
              :disabled="!canApply"
              title="Replace source (undoable)"
              @click="applyFormatted"
            >
              Apply to source
            </button>
          </div>
          <CodeEditor
            v-if="formatStatus === 'ready'"
            :value="formatted"
            label="Formatted Mermaid"
            readonly
            :dark="dark"
            :tab-width="tabWidth"
            :use-tabs="useTabs"
            @failure="editorFailure = $event"
          />
          <div
            v-else
            class="empty-state"
            :class="{ error: formatStatus === 'error' }"
            role="status"
          >
            <span class="empty-symbol" aria-hidden="true">{{
              formatStatus === "error" ? "!" : "…"
            }}</span>
            <h3>
              {{
                formatStatus === "error"
                  ? "Unable to format"
                  : "Formatting your source"
              }}
            </h3>
            <pre v-if="formatMessage">{{ formatMessage }}</pre>
          </div>
          <div class="pane-footer" role="status">
            <span>{{
              formatStatus === "ready"
                ? formatted === source
                  ? "Output matches the input"
                  : "Preview · source unchanged"
                : formatStatus === "error"
                  ? "No formatted output"
                  : "Formatting…"
            }}</span
            ><span v-if="formatStatus === 'ready'"
              >{{ formatMilliseconds.toFixed(1) }} ms · LF</span
            >
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped src="./controls.css"></style>

<style scoped>
a {
  color: inherit;
  text-decoration: none;
}
a:hover {
  color: var(--accent);
}
pre {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 12px;
  line-height: 1.7;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  margin: 0;
}
.playground {
  max-width: 1800px;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: auto;
  padding: 0 24px 16px;
}
.app-header {
  flex: 0 0 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
}
.brand {
  display: flex;
  gap: 12px;
  align-items: center;
}
.brand-mark {
  display: block;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
}
.brand h1 {
  font-size: 15px;
  font-weight: 650;
  letter-spacing: -0.4px;
  margin: 0;
}
.brand-caption {
  display: block;
  font-size: 9px;
  letter-spacing: 2px;
  color: var(--muted);
  margin-top: 3px;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.github-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 8px;
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
}
.github-link svg {
  width: 18px;
  height: 18px;
}
.share-button {
  color: var(--accent);
  font-weight: 600;
}
.share-button span {
  margin-left: 10px;
}
.toolbar-divider {
  height: 20px;
  width: 1px;
  background: var(--border);
  margin: 0 7px;
}
.snb-shine-and-bright-switch {
  --snb-switch-border-color: var(--border);
  --snb-shine-color: #b2beff;
  --snb-animation-duration: 180ms;
  flex-shrink: 0;
}
/* Zero minimums let panes shrink within the viewport. Editors, trees and details
   own their scrolling instead of expanding the page to fit their content. */
.workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 14px;
  flex: 1;
  min-height: 0;
}
.pane {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: 9px;
  overflow: hidden;
  box-shadow: 0 4px 14px #00000003;
}
.pane-header {
  flex: 0 0 43px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  border-bottom: 1px solid var(--border);
}
.pane-header > div {
  display: flex;
  align-items: center;
  gap: 10px;
}
h2 {
  font-size: 12px;
  font-weight: 650;
  margin: 0;
}
.file-badge {
  color: var(--muted);
  font:
    10px "SFMono-Regular",
    Consolas,
    monospace;
  background: var(--subtle);
  border-radius: 4px;
  padding: 4px 7px;
}
.pane-footer {
  display: flex;
  justify-content: space-between;
  flex: 0 0 auto;
  padding: 7px 14px;
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-size: 10px;
  min-height: 28px;
}
.result-header [role="tablist"] {
  height: 100%;
  gap: 21px;
}
[role="tab"] {
  height: 100%;
  border: 0;
  border-radius: 0;
  padding: 0 1px;
  color: var(--muted);
  position: relative;
  font-weight: 600;
}
[role="tab"][aria-selected="true"] {
  color: var(--text);
}
[role="tab"][aria-selected="true"]::after {
  position: absolute;
  content: "";
  height: 2px;
  background: var(--accent);
  bottom: -1px;
  left: 0;
  right: 0;
}
.result-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.sub-toolbar {
  flex: 0 0 auto;
  min-height: 38px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 12px;
  border-bottom: 1px solid var(--border);
  background: var(--subtle);
  font-size: 11px;
}
.sub-toolbar select {
  font-size: 11px;
  padding: 4px 7px;
}
.type-badge {
  margin-left: auto;
  font:
    10px "SFMono-Regular",
    Consolas,
    monospace;
  color: var(--accent);
}
.tree-scroll {
  overflow: auto;
  flex: 1;
  min-height: 0;
  padding: 8px 0;
}
.selection-details {
  flex: 0 1 38%;
  max-height: 38%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-top: 1px solid var(--border);
  background: var(--subtle);
}
.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 0 0 32px;
  gap: 8px;
  padding: 0 14px;
  color: var(--accent);
  font:
    11px "SFMono-Regular",
    Consolas,
    monospace;
}
.details-header span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.details-header button {
  flex-shrink: 0;
}
.details-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 0 14px 14px;
}
.details-body pre {
  font-size: 11px;
}
.source-excerpt {
  background: var(--accent-soft);
  border-radius: 4px;
  padding: 7px 9px;
  margin-bottom: 9px;
}
.empty-state {
  flex: 1;
  min-height: 0;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: auto;
  color: var(--muted);
}
.empty-state h3 {
  font-size: 14px;
  font-weight: 550;
  color: var(--text);
  margin: 14px 0;
}
.empty-state p {
  font-size: 12px;
  line-height: 1.7;
}
.empty-state pre {
  font-size: 11px;
  text-align: left;
  max-width: 100%;
}
.empty-symbol {
  height: 32px;
  width: 32px;
  display: grid;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: 9px;
  font:
    20px Georgia,
    serif;
}
.error {
  color: var(--error);
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--muted);
  white-space: nowrap;
}
.checkbox-label input {
  accent-color: var(--accent);
}
.apply-button {
  margin-left: auto;
  font-size: 10px;
  color: var(--accent);
  padding: 5px 8px;
}
.share-panel {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  flex: 0 0 auto;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 7px;
}
.share-panel label {
  font-size: 11px;
  white-space: nowrap;
}
.share-panel input {
  min-width: 0;
  color: var(--muted);
  background: var(--subtle);
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 11px;
}
.icon-button {
  background: transparent;
  border: 0;
  padding: 4px 7px;
  color: var(--muted);
}
.notice {
  flex: 0 0 auto;
  margin: 0;
  font-size: 12px;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
@media (max-width: 900px) {
  .playground {
    padding: 0 16px 12px;
  }
  .workspace {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(0, 2fr) minmax(0, 3fr);
  }
  .github-label {
    display: none;
  }
}
@media (max-width: 600px) {
  .share-panel {
    grid-template-columns: minmax(0, 1fr) auto auto;
  }
  .share-panel label {
    grid-column: 1 / 3;
  }
  .share-panel input {
    grid-column: 1 / 3;
    grid-row: 2;
  }
  .share-panel > .icon-button {
    grid-column: 3;
    grid-row: 1;
  }
}
@media (max-width: 500px) {
  .playground {
    padding: 0 12px 12px;
    gap: 8px;
  }
  .app-header {
    flex-basis: 56px;
  }
  .brand-mark,
  .toolbar-divider {
    display: none;
  }
  .header-actions {
    gap: 4px;
  }
  .github-link {
    padding-inline: 3px;
  }
  .share-button {
    padding-inline: 8px;
  }
  .share-button span {
    display: none;
  }
  .file-badge {
    display: none;
  }
  .format-toolbar {
    gap: 5px;
    padding: 7px 10px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .snb-shine-and-bright-switch {
    --snb-animation-duration: 0ms;
  }
}
</style>
