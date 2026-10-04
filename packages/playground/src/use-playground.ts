import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from "vue"
import type { Ref, ShallowRef, ComputedRef } from "vue"
import type * as Formatter from "./formatter.ts"
import type { Range, Root } from "@mmd-toolkit/parser"
import { onParserUpdate, parseSource, visitNodes } from "./engine.ts"
import { examples } from "./examples.ts"
import { decodeState, encodeState } from "./share.ts"
import type { TreeSelection } from "./ast.ts"
import type { SharedState } from "./share.ts"

/** A direct parser failure, whose range belongs to the current source. */
interface Diagnostic {
  message: string
  range: Range
}

/** Reactive application state and the actions exposed to the root view. */
interface Playground {
  source: Ref<string>
  tabWidth: Ref<number>
  useTabs: Ref<boolean>
  tab: Ref<"ast" | "formatted">
  astView: Ref<string>
  root: ShallowRef<Root | null>
  selection: ShallowRef<TreeSelection | null>
  diagnostic: ShallowRef<Diagnostic | null>
  parseStatus: Ref<string>
  parseMessage: Ref<string>
  parseMilliseconds: Ref<number>
  nodeCount: ComputedRef<number>
  json: ComputedRef<string>
  selectedJson: ComputedRef<string>
  excerpt: ComputedRef<string>
  formatted: Ref<string>
  formatStatus: Ref<string>
  formatMessage: Ref<string>
  formatMilliseconds: Ref<number>
  canApply: ComputedRef<boolean>
  shareOpen: Ref<boolean>
  shareUrl: Ref<string>
  shareMessage: Ref<string>
  shareBusy: Ref<boolean>
  copied: Ref<boolean>
  restoring: Ref<boolean>
  editorFailure: Ref<string>
  dark: Ref<boolean>
  toggleTheme: () => void
  copyLink: () => Promise<void>
  share: () => Promise<void>
}

/** Coordinates source revisions, lazy formatting, sharing and the immutable AST. */
export function usePlayground(): Playground {
  const source = ref(examples[0].source)
  const tabWidth = ref(2)
  const useTabs = ref(false)
  const tab = ref<"ast" | "formatted">("ast")
  const astView = ref("tree")
  const root = shallowRef<Root | null>(null)
  const selection = shallowRef<TreeSelection | null>(null)
  const diagnostic = shallowRef<Diagnostic | null>(null)
  const parseStatus = ref("pending")
  const parseMessage = ref("")
  const parseMilliseconds = ref(0)
  const formatted = ref("")
  const formatStatus = ref("idle")
  const formatMessage = ref("")
  const formatMilliseconds = ref(0)
  const shareOpen = ref(false)
  const shareUrl = ref("")
  const shareMessage = ref("")
  const shareBusy = ref(false)
  const copied = ref(false)
  const restoring = ref(false)
  const editorFailure = ref("")
  const dark = ref(window.matchMedia("(prefers-color-scheme: dark)").matches)
  let themeChosen = false
  let revision = 0
  let formatRequest = 0
  let stateRevision = 0
  let navigation = 0
  let disposed = false
  let parseTimer: ReturnType<typeof setTimeout> | undefined,
    formatTimer: ReturnType<typeof setTimeout> | undefined,
    shareTimer: ReturnType<typeof setTimeout> | undefined,
    formatter: Promise<typeof Formatter> | undefined,
    stopFormatter: (() => void) | undefined

  const json = computed(() =>
    root.value ? JSON.stringify(root.value, null, 2) : "",
  )
  const selectedJson = computed(() =>
    selection.value ? JSON.stringify(selection.value.value, null, 2) : "",
  )
  const excerpt = computed(() =>
    selection.value?.range ? source.value.slice(...selection.value.range) : "",
  )
  const nodeCount = computed(() => {
    if (!root.value) return 0
    let count = 0
    visitNodes(root.value, {
      enterNode() {
        count++
      },
      leaveNode() {
        // The public traversal API requires both callbacks.
      },
    })
    return count
  })
  const canApply = computed(
    () => formatStatus.value === "ready" && formatted.value !== source.value,
  )

  /** Parses the exact source snapshot after invalidating every previous tree. */
  function parseNow(): void {
    const start = performance.now()
    try {
      root.value = parseSource(source.value)
      parseStatus.value = "ready"
      parseMessage.value = ""
    } catch (error) {
      parseStatus.value =
        error instanceof Error && error.name === "UnsupportedDiagramError"
          ? "unsupported"
          : "error"
      parseMessage.value =
        error instanceof Error ? error.message : "Unable to parse this input."
      if (
        error instanceof Error &&
        error.name === "ParseError" &&
        "range" in error
      ) {
        diagnostic.value = {
          message: error.message,
          range: error.range as Range,
        }
      }
    }
    parseMilliseconds.value = performance.now() - start
  }

  /** Lazily loads Prettier, then discards results superseded by edits or hot updates. */
  async function formatNow(): Promise<void> {
    const request = ++formatRequest
    const currentRevision = revision
    const text = source.value
    const options = { tabWidth: tabWidth.value, useTabs: useTabs.value }
    formatStatus.value = "pending"
    formatMessage.value = ""
    const start = performance.now()
    try {
      formatter ??= import("./formatter.ts").then((module) => {
        if (!disposed)
          stopFormatter = module.onFormatterUpdate(invalidateResults)
        return module
      })
      const module = await formatter
      const result = await module.formatSource(text, options)
      if (disposed || currentRevision !== revision || request !== formatRequest)
        return
      formatted.value = result
      formatStatus.value = "ready"
      formatMilliseconds.value = performance.now() - start
    } catch (error) {
      if (disposed || currentRevision !== revision || request !== formatRequest)
        return
      formatMessage.value =
        error instanceof Error ? error.message : "Unable to format this input."
      formatStatus.value = "error"
    }
  }

  /** Invalidates derived data immediately, then evaluates only the visible work. */
  function invalidateResults(): void {
    revision++
    formatRequest++
    root.value = null
    selection.value = null
    diagnostic.value = null
    parseStatus.value = "pending"
    parseMessage.value = ""
    formatted.value = ""
    formatStatus.value = "idle"
    formatMessage.value = ""
    clearTimeout(parseTimer)
    clearTimeout(formatTimer)
    parseTimer = setTimeout(parseNow, 150)
    if (tab.value === "formatted")
      formatTimer = setTimeout(() => {
        void formatNow()
      }, 150)
  }

  /** Captures only editable inputs; invalid syntax and empty text remain shareable. */
  function sharedState(): SharedState {
    return {
      source: source.value,
      tabWidth: tabWidth.value,
      useTabs: useTabs.value,
    }
  }

  /** Saves a current compressed fragment without adding browser history entries. */
  async function saveUrl(showLink: boolean): Promise<void> {
    const currentRevision = stateRevision
    const currentNavigation = navigation
    if (showLink) {
      shareOpen.value = true
      shareBusy.value = true
    }
    try {
      const hash = await encodeState(sharedState())
      if (
        disposed ||
        currentRevision !== stateRevision ||
        currentNavigation !== navigation
      )
        return
      const url = new URL(window.location.href)
      url.hash = hash
      window.history.replaceState(null, "", url)
      shareUrl.value = url.href
      shareMessage.value = ""
    } catch (error) {
      if (
        disposed ||
        currentRevision !== stateRevision ||
        currentNavigation !== navigation
      )
        return
      shareMessage.value =
        error instanceof Error
          ? error.message
          : "Unable to create a shared URL."
    } finally {
      if (currentRevision === stateRevision && currentNavigation === navigation)
        shareBusy.value = false
    }
  }

  /** Debounces URL persistence and cancels restoration superseded by user edits. */
  function inputChanged(): void {
    stateRevision++
    navigation++
    restoring.value = false
    shareUrl.value = ""
    shareBusy.value = false
    shareMessage.value = ""
    copied.value = false
    clearTimeout(shareTimer)
    shareTimer = setTimeout(() => {
      void saveUrl(false)
    }, 500)
    invalidateResults()
  }

  /** Handles hash navigation without returning a promise to the DOM listener. */
  function hashChanged(): void {
    void restoreHash()
  }

  /** Restores navigation atomically; malformed links never replace current text. */
  async function restoreHash(): Promise<void> {
    const request = ++navigation
    const currentRevision = stateRevision
    clearTimeout(shareTimer)
    shareBusy.value = false
    shareUrl.value = ""
    restoring.value = Boolean(window.location.hash)
    try {
      const state = window.location.hash
        ? await decodeState(window.location.hash)
        : { source: examples[0].source, tabWidth: 2, useTabs: false }
      if (
        disposed ||
        request !== navigation ||
        currentRevision !== stateRevision
      )
        return
      source.value = state.source
      tabWidth.value = state.tabWidth
      useTabs.value = state.useTabs
      shareUrl.value = window.location.href
      copied.value = false
      shareMessage.value = ""
    } catch (error) {
      if (
        disposed ||
        request !== navigation ||
        currentRevision !== stateRevision
      )
        return
      shareMessage.value =
        error instanceof Error
          ? error.message
          : "Unable to restore the shared input."
    } finally {
      if (request === navigation) restoring.value = false
    }
  }

  /** Performs clipboard access directly from a separate, explicit user gesture. */
  async function copyLink(): Promise<void> {
    const url = shareUrl.value
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      if (shareUrl.value === url) {
        copied.value = true
        shareMessage.value = ""
      }
    } catch {
      if (shareUrl.value === url)
        shareMessage.value =
          "Clipboard access was denied. Select the link and copy it manually."
    }
  }

  /** Overrides the system preference for this page without changing source or results. */
  function toggleTheme(): void {
    themeChosen = true
    dark.value = !dark.value
  }

  const preference = window.matchMedia("(prefers-color-scheme: dark)")

  /** Follows system changes until the user explicitly chooses a theme. */
  function systemTheme(event: MediaQueryListEvent): void {
    if (!themeChosen) dark.value = event.matches
  }

  watch(
    dark,
    (value) => document.documentElement.classList.toggle("dark", value),
    { immediate: true },
  )
  watch([source, tabWidth, useTabs], inputChanged, { flush: "sync" })
  watch(tab, (value) => {
    clearTimeout(formatTimer)
    if (value === "formatted" && formatStatus.value !== "ready")
      void formatNow()
  })
  const stopParser = onParserUpdate(invalidateResults)
  onMounted(() => {
    preference.addEventListener("change", systemTheme)
    window.addEventListener("hashchange", hashChanged)
    parseNow()
    if (window.location.hash) void restoreHash()
    else
      shareTimer = setTimeout(() => {
        void saveUrl(false)
      }, 500)
  })
  onBeforeUnmount(() => {
    disposed = true
    clearTimeout(parseTimer)
    clearTimeout(formatTimer)
    clearTimeout(shareTimer)
    stopParser()
    stopFormatter?.()
    preference.removeEventListener("change", systemTheme)
    window.removeEventListener("hashchange", hashChanged)
  })

  return {
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
    share: () => saveUrl(true),
  }
}
