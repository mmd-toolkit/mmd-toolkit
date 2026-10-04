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
              parseStatus === "pending"
                ? "…"
                : parseStatus === "unsupported"
                  ? "◌"
                  : "!"
            }}</span>
            <h3>
              {{
                parseStatus === "pending"
                  ? "Reading your source"
                  : parseStatus === "unsupported"
                    ? "Not supported yet"
                    : "Unable to parse"
              }}
            </h3>
            <pre v-if="parseMessage">{{ parseMessage }}</pre>
            <p v-if="parseStatus === 'unsupported'">
              Flowchart, sequence, class and state diagrams are supported.
            </p>
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
