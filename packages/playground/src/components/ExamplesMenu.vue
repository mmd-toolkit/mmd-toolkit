<script setup lang="ts" vapor>
import { nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef } from "vue"
import { examples } from "../examples.ts"

const emit = defineEmits<{ select: [source: string] }>()
const open = ref(false)
const container = useTemplateRef<HTMLDivElement>("container")
const trigger = useTemplateRef<HTMLButtonElement>("trigger")
const itemRefs: (HTMLButtonElement | null)[] = []

/** Opens the actions and focuses the first or last example. */
async function openMenu(index: number): Promise<void> {
  open.value = true
  await nextTick()
  if (open.value) itemRefs[index]?.focus()
}

/** Closes the menu, restoring focus when the user finishes a menu action. */
function closeMenu(restoreFocus = false): void {
  open.value = false
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
  void openMenu(event.key === "ArrowUp" ? examples.length - 1 : 0)
}

/** Moves focus between actions and lets Tab continue from the trigger. */
function menuKey(event: KeyboardEvent): void {
  if (event.key === "Escape" || event.key === "Tab") {
    if (event.key === "Escape") event.preventDefault()
    closeMenu(true)
    return
  }
  const index = itemRefs.findIndex((item) => item === document.activeElement)
  let nextIndex: number
  if (event.key === "ArrowDown") nextIndex = (index + 1) % itemRefs.length
  else if (event.key === "ArrowUp")
    nextIndex = (index - 1 + itemRefs.length) % itemRefs.length
  else if (event.key === "Home") nextIndex = 0
  else if (event.key === "End") nextIndex = itemRefs.length - 1
  else return
  event.preventDefault()
  itemRefs[nextIndex]?.focus()
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
onBeforeUnmount(() =>
  document.removeEventListener("pointerdown", outsidePointer),
)
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
      @keydown="menuKey"
    >
      <button
        v-for="(example, index) in examples"
        :key="example.name"
        :ref="
          (element) => {
            itemRefs[index] = element as HTMLButtonElement | null
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
