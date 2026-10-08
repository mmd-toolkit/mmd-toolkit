<script setup lang="ts" vapor>
import { computed, ref, useTemplateRef, watch } from "vue"
import { childKeys, valueRange } from "../ast.ts"
import type { TreeSelection } from "../ast.ts"

const props = defineProps<{
  value: unknown
  label: string
  path: string
  depth: number
  kind: "node" | "record" | "value"
  selected: string | null
}>()
const emit = defineEmits<{
  select: [selection: TreeSelection]
  "reveal-selection": [row: HTMLDivElement]
}>()
const row = useTemplateRef<HTMLDivElement>("row")
const open = ref(
  props.depth === 0 || (props.depth === 1 && props.kind === "node"),
)
// Batch mounted rows only; Show more and source selection can reveal all entries.
const limit = ref(100)
const object = computed(
  () => typeof props.value === "object" && props.value !== null,
)
const keys = computed(() => childKeys(props.value, props.kind === "node"))
const entries = computed(() => {
  if (!object.value) return []
  return Object.entries(props.value as object)
})
const summary = computed(() => {
  if (Array.isArray(props.value)) return `Array(${props.value.length})`
  if (
    typeof props.value === "object" &&
    props.value !== null &&
    "type" in props.value
  )
    return String(props.value.type)
  if (object.value) return "Object"
  return JSON.stringify(props.value)
})
const range = computed(() => valueRange(props.value))
const visibleEntries = computed(() => entries.value.slice(0, limit.value))

/** Identifies children by the parent's declared fields, not by a type-name guess. */
function entryKind(key: string): "node" | "record" | "value" {
  if (keys.value.includes(key)) return "node"
  if (Array.isArray(props.value)) return props.kind
  if (
    props.path === "root" &&
    ["tokens", "comments", "directives", "frontmatter"].includes(key)
  )
    return "record"
  return "value"
}

/** Opens ancestors and extends the rendered batch to include a selected child. */
function revealSelection(): void {
  if (!props.selected?.startsWith(`${props.path}.`)) return
  open.value = true
  const key = props.selected.slice(props.path.length + 1).split(".")[0]
  const index = entries.value.findIndex(([entry]) => entry === key)
  if (index >= limit.value) limit.value = index + 1
}

watch(() => props.selected, revealSelection, { immediate: true })

// Ancestors must have rendered their expanded children before a row requests
// scrolling. Watching the ref also covers a newly mounted selected descendant.
watch(
  [row, () => props.selected],
  ([element, selected]) => {
    if (element && selected === props.path) emit("reveal-selection", element)
  },
  { flush: "post" },
)

/** Selects the row and toggles its children when it is expandable. */
function selectRow(): void {
  if (object.value) open.value = !open.value
  emit("select", { path: props.path, value: props.value, range: range.value })
}
</script>

<template>
  <div class="tree-item">
    <div
      ref="row"
      class="tree-row"
      :class="{ selected: selected === path }"
      :style="{ paddingLeft: `${depth * 16 + 12}px` }"
    >
      <button
        v-if="object"
        class="disclosure"
        :aria-expanded="open"
        :aria-label="`${open ? 'Collapse' : 'Expand'} ${label}`"
        @click="open = !open"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <polyline
            points="6 4 10 8 6 12"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <span v-else class="disclosure-spacer"></span>
      <button
        class="tree-value"
        :aria-pressed="selected === path"
        :aria-expanded="object ? open : undefined"
        @click="selectRow"
      >
        <span class="tree-key">{{ label }}</span>
        <span
          class="tree-summary"
          :class="{
            'node-name': kind === 'node',
            'record-name': kind === 'record',
          }"
          :title="summary"
          >{{ summary }}</span
        >
        <span v-if="range" class="tree-range"
          >{{ range[0] }}…{{ range[1] }}</span
        >
      </button>
    </div>
    <div v-if="object && open">
      <TreeItem
        v-for="[key, child] in visibleEntries"
        :key="key"
        :value="child"
        :label="key"
        :path="`${path}.${key}`"
        :depth="depth + 1"
        :kind="entryKind(key)"
        :selected="selected"
        @select="emit('select', $event)"
        @reveal-selection="emit('reveal-selection', $event)"
      />
      <button
        v-if="entries.length > limit"
        class="more-entries"
        :style="{ marginLeft: `${(depth + 1) * 16 + 12}px` }"
        @click="limit += 100"
      >
        Show {{ Math.min(100, entries.length - limit) }} more
      </button>
      <span
        v-if="entries.length === 0"
        class="empty-tree"
        :style="{ marginLeft: `${(depth + 1) * 16 + 12}px` }"
        >Empty</span
      >
    </div>
  </div>
</template>

<style scoped src="../controls.css"></style>

<style scoped>
.tree-row {
  display: flex;
  min-height: 28px;
  align-items: center;
  padding-right: 12px;
  font:
    12px "SFMono-Regular",
    Consolas,
    monospace;
}
.tree-row:hover {
  background: var(--subtle);
}
.tree-row.selected {
  background: var(--accent-soft);
}
.disclosure,
.disclosure-spacer {
  /* Reserve the same slot for branch icons and leaves to keep labels aligned. */
  flex: 0 0 20px;
  height: 20px;
}
.disclosure {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  padding: 0;
  color: var(--muted);
}
.disclosure svg {
  display: block;
  width: 12px;
  height: 12px;
}
.disclosure[aria-expanded="true"] svg {
  transform: rotate(90deg);
}
.tree-value {
  display: grid;
  /* Keep field names and ranges intact; only the value summary can truncate. */
  grid-template-columns: max-content minmax(0, 1fr) max-content;
  align-items: center;
  gap: 8px;
  background: transparent;
  padding: 4px 0;
  border: 0;
  border-radius: 0;
  min-width: 0;
  flex: 1;
  text-align: left;
  font: inherit;
}
.tree-value:hover:not(:disabled),
.disclosure:hover:not(:disabled) {
  background: transparent;
}
.tree-key {
  color: var(--muted);
  white-space: nowrap;
}
.tree-summary {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.node-name {
  color: var(--accent);
}
.record-name {
  color: var(--record);
}
.tree-range {
  color: var(--muted);
  font-size: 10px;
  white-space: nowrap;
}
.more-entries {
  font-size: 10px;
  margin: 6px 0;
}
.empty-tree {
  font-size: 10px;
  color: var(--muted);
}
</style>
