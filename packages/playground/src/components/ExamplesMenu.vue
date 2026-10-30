<script setup lang="ts" vapor>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useTemplateRef,
} from "vue"
import { exampleGroups } from "../examples.ts"

const emit = defineEmits<{ select: [source: string] }>()
const open = ref(false)
const groupIndex = ref<number | null>(null)
const group = computed(() =>
  groupIndex.value === null ? null : exampleGroups[groupIndex.value],
)
const container = useTemplateRef<HTMLDivElement>("container")
const trigger = useTemplateRef<HTMLButtonElement>("trigger")
const groupRefs: (HTMLButtonElement | null)[] = []
const sampleRefs: (HTMLButtonElement | null)[] = []
let hoverTimer: ReturnType<typeof setTimeout> | undefined

/** Cancels a sibling switch when the pointer reaches the submenu or leaves the list. */
function cancelHover(): void {
  clearTimeout(hoverTimer)
}

/** Gives diagonal pointer movement time to reach the existing submenu. */
function hoverGroup(index: number): void {
  cancelHover()
  if (groupIndex.value === null || groupIndex.value === index) {
    chooseGroup(index)
    return
  }
  hoverTimer = setTimeout(() => chooseGroup(index), 150)
}

/** Focuses a sample after its submenu has mounted. */
async function focusSample(index: number): Promise<void> {
  await nextTick()
  if (open.value && group.value) sampleRefs[index]?.focus()
}

/** Opens the diagram list and focuses its first or last family. */
async function openMenu(index: number): Promise<void> {
  groupIndex.value = null
  open.value = true
  await nextTick()
  if (open.value) groupRefs[index]?.focus()
}

/** Hover keeps focus in the parent; click and Right enter the submenu. */
function chooseGroup(index: number, enter = false): void {
  cancelHover()
  groupIndex.value = index
  if (enter) void focusSample(0)
  else groupRefs[index]?.focus({ preventScroll: true })
}

/** Closes only the submenu and returns focus to its parent diagram. */
function backToGroups(): void {
  cancelHover()
  const index = groupIndex.value ?? 0
  groupIndex.value = null
  groupRefs[index]?.focus()
}

/** Closes the menu, restoring focus when the user finishes a menu action. */
function closeMenu(restoreFocus = false): void {
  cancelHover()
  open.value = false
  groupIndex.value = null
  if (restoreFocus) trigger.value?.focus()
}

/** Toggles the menu from the trigger's native click and keyboard activation. */
function toggleMenu(): void {
  if (open.value) closeMenu()
  else void openMenu(0)
}

/** Opens either end of the menu with the arrow keys. */
function triggerKey(event: KeyboardEvent): void {
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return
  event.preventDefault()
  void openMenu(event.key === "ArrowUp" ? exampleGroups.length - 1 : 0)
}

/**
 * The element before (-1) or after (1) `element` in document order among the
 * links, buttons, form controls, and elements with a `tabindex` that are
 * enabled, rendered, and have no negative `tabindex`. This is the tab sequence
 * of this app's header, not the browser's general one: scrollable regions,
 * `inert` subtrees, and positive `tabindex` values are not considered, and the
 * header has none. Null when `element` is not in the list or has no neighbour
 * in that direction.
 */
function tabbableBeside(
  element: HTMLElement | null,
  direction: -1 | 1,
): HTMLElement | null {
  if (!element) return null
  const tabbable = Array.from(
    document.querySelectorAll<HTMLElement>(
      "a[href], button, input, select, textarea, [tabindex]",
    ),
  ).filter(
    (candidate) =>
      candidate.tabIndex >= 0 &&
      !candidate.matches(":disabled") &&
      candidate.getClientRects().length > 0,
  )
  const index = tabbable.indexOf(element)
  return index < 0 ? null : (tabbable[index + direction] ?? null)
}

/**
 * Tab and Shift+Tab leave the menu to the control beside the trigger, as if the
 * trigger had the focus. The focus is moved here rather than by the native Tab
 * action: the menu leaves the DOM when it closes, and browsers differ in where
 * a native Tab continues from when the element that had the focus is gone.
 */
function leaveMenu(event: KeyboardEvent): void {
  event.preventDefault()
  const target = tabbableBeside(trigger.value, event.shiftKey ? -1 : 1)
  closeMenu()
  ;(target ?? trigger.value)?.focus()
}

/** Moves between diagram families and opens their sample submenus. */
function groupKey(event: KeyboardEvent): void {
  cancelHover()
  if (event.key === "Tab") {
    leaveMenu(event)
    return
  }
  if (event.key === "Escape") {
    event.preventDefault()
    closeMenu(true)
    return
  }
  const index = groupRefs.findIndex((item) => item === document.activeElement)
  if (event.key === "ArrowRight" && index >= 0) {
    event.preventDefault()
    chooseGroup(index, true)
    return
  }
  let nextIndex: number
  if (event.key === "ArrowDown") nextIndex = (index + 1) % exampleGroups.length
  else if (event.key === "ArrowUp")
    nextIndex = (index - 1 + exampleGroups.length) % exampleGroups.length
  else if (event.key === "Home") nextIndex = 0
  else if (event.key === "End") nextIndex = exampleGroups.length - 1
  else return
  event.preventDefault()
  groupIndex.value = null
  groupRefs[nextIndex]?.focus()
}

/** Navigates samples; Left and Escape return to the still-visible parent menu. */
function sampleKey(event: KeyboardEvent): void {
  cancelHover()
  if (event.key === "ArrowLeft" || event.key === "Escape") {
    event.preventDefault()
    backToGroups()
    return
  }
  if (event.key === "Tab") {
    leaveMenu(event)
    return
  }
  const count = group.value?.examples.length ?? 0
  if (!count) return
  const index = sampleRefs.findIndex((item) => item === document.activeElement)
  let nextIndex: number
  if (event.key === "ArrowDown") nextIndex = (index + 1) % count
  else if (event.key === "ArrowUp") nextIndex = (index - 1 + count) % count
  else if (event.key === "Home") nextIndex = 0
  else if (event.key === "End") nextIndex = count - 1
  else return
  event.preventDefault()
  sampleRefs[nextIndex]?.focus()
}

/** Loads the selected source and returns focus to the trigger. */
function chooseExample(source: string): void {
  emit("select", source)
  closeMenu(true)
}

/** Dismisses on outside pointers without stealing the destination's focus. */
function outsidePointer(event: PointerEvent): void {
  if (
    open.value &&
    event.target instanceof Node &&
    !container.value?.contains(event.target)
  )
    closeMenu()
}

/** Dismisses when focus moves to a known element outside the trigger and menu. */
function focusOut(event: FocusEvent): void {
  if (
    event.relatedTarget instanceof Node &&
    !container.value?.contains(event.relatedTarget)
  )
    closeMenu()
}

onMounted(() => document.addEventListener("pointerdown", outsidePointer))
onBeforeUnmount(() => {
  cancelHover()
  document.removeEventListener("pointerdown", outsidePointer)
})
</script>

<template>
  <div ref="container" class="examples" @focusout="focusOut">
    <button
      id="examples"
      ref="trigger"
      class="examples-button"
      aria-haspopup="menu"
      :aria-expanded="open"
      aria-controls="examples-menu"
      @click="toggleMenu"
      @keydown="triggerKey"
    >
      Examples
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
        <path
          d="m4 6 4 4 4-4"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
    <div
      v-if="open"
      id="examples-menu"
      class="examples-menu"
      role="menu"
      aria-labelledby="examples"
      @keydown="groupKey"
      @mouseleave="cancelHover"
    >
      <button
        v-for="(family, index) in exampleGroups"
        :id="`example-group-${index}`"
        :key="family.name"
        :ref="
          (element) => {
            groupRefs[index] = element as HTMLButtonElement | null
          }
        "
        class="example-action example-group"
        role="menuitem"
        aria-haspopup="menu"
        :aria-expanded="groupIndex === index"
        :aria-controls="groupIndex === index ? 'examples-submenu' : undefined"
        :style="`anchor-name: --example-family-${index}`"
        tabindex="-1"
        @mouseenter="hoverGroup(index)"
        @click="chooseGroup(index, true)"
      >
        {{ family.name }}
        <span aria-hidden="true">›</span>
      </button>
    </div>
    <div
      v-if="open && group"
      id="examples-submenu"
      class="examples-menu examples-submenu"
      role="menu"
      aria-labelledby="examples-heading"
      :style="`position-anchor: --example-family-${groupIndex}`"
      @keydown="sampleKey"
      @mouseenter="cancelHover"
    >
      <div id="examples-heading" class="examples-heading">
        {{ group.name }} examples
      </div>
      <button
        v-for="(example, index) in group.examples"
        :key="example.name"
        :ref="
          (element) => {
            sampleRefs[index] = element as HTMLButtonElement | null
          }
        "
        class="example-action"
        role="menuitem"
        tabindex="-1"
        @click="chooseExample(example.source)"
      >
        {{ example.name }}
      </button>
    </div>
  </div>
</template>

<style scoped src="../controls.css"></style>

<style scoped>
.examples {
  position: relative;
  flex-shrink: 0;
  anchor-scope: all;
}
.examples-button {
  anchor-name: --examples-trigger;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: transparent;
  border-color: transparent;
  font-weight: 600;
}
.examples-button svg {
  width: 12px;
  height: 12px;
  color: var(--muted);
}
.examples-button[aria-expanded="true"] {
  background: var(--accent-soft);
  color: var(--accent);
}
.examples-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 10;
  width: 216px;
  max-width: calc(100vw - 24px);
  max-height: calc(100dvh - 80px);
  overflow-y: auto;
  padding: 5px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  box-shadow:
    0 12px 32px #00000018,
    0 2px 6px #00000008;
}
.example-action {
  display: block;
  width: 100%;
  padding: 10px 12px;
  border: 0;
  background: transparent;
  text-align: left;
}
.example-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.example-group span,
.examples-heading {
  color: var(--muted);
}
.examples-heading {
  padding: 9px 12px 5px;
  font-size: 11px;
  font-weight: 600;
}
.example-group[aria-expanded="true"] {
  color: var(--accent);
  background: var(--accent-soft);
}
.examples-submenu {
  width: 300px;
  right: 220px;
}
/* The panels remain siblings so the parent's scroll viewport cannot clip the
   submenu. Anchors track the hovered row, including after scrolling it. */
@supports (position-area: right span-bottom) {
  .examples-menu {
    position: fixed;
    position-anchor: --examples-trigger;
    inset: auto;
    position-area: bottom span-left;
    margin-block-start: 8px;
    position-try-fallbacks: flip-inline;
  }
  .examples-submenu {
    inset: auto;
    position-area: right span-bottom;
    margin-block-start: 0;
    margin-inline: 4px;
    max-height: calc(100dvh - 24px);
    position-try-fallbacks:
      flip-inline,
      flip-block,
      flip-inline flip-block;
    position-visibility: anchors-visible;
  }
}
.example-action:hover:not(:disabled),
.example-action:focus-visible {
  outline: none;
  color: var(--accent);
  background: var(--accent-soft);
}
@media (max-width: 500px) {
  .examples-button {
    gap: 4px;
    padding-inline: 4px;
  }
  .examples-submenu {
    width: 280px;
  }
}
</style>
