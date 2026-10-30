import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs"
import path from "node:path"

const documentDirectories = [
  ["packages/eslint-plugin/docs/rules", "linter/rules"],
]

/**
 * Diagram families in the order of Mermaid 12.2.0's sidebarSyntax(). Existing
 * families use their specification filenames; other entries use diagram ids.
 * The sidebar omits agentflow, info and railroad; they follow it in name
 * order.
 * https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/.vitepress/config.ts#L160-L207
 */
export const diagramOrder = [
  "flowchart",
  "swimlane",
  "sequence",
  "class",
  "state",
  "er",
  "journey",
  "gantt",
  "pie",
  "quadrant",
  "requirement",
  "usecase",
  "gitgraph",
  "c4",
  "mindmap",
  "timeline",
  "zenuml",
  "sankey",
  "xychart",
  "block",
  "packet",
  "kanban",
  "architecture",
  "radar",
  "eventmodeling",
  "treemap",
  "venn",
  "ishikawa",
  "wardley",
  "cynefin",
  "treeview",
  "agentflow",
  "info",
  "railroad",
]

const sourceDirectories = [
  "packages/docs/pages",
  "packages/spec/docs/diagrams",
  "packages/eslint-plugin/docs/rules",
]

/** Lists the Markdown files under a directory, using relative POSIX paths. */
function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      return markdownFiles(path.join(directory, entry.name)).map(
        (file) => `${entry.name}/${file}`,
      )
    }
    return entry.name.endsWith(".md") ? [entry.name] : []
  })
}

/**
 * Uses English specification filenames as the diagram inventory, with localized
 * headings for the rule sidebar's diagram groups. Mermaid's documented
 * presentation order also applies when new diagram families are added.
 */
export function collectDiagrams(repositoryRoot) {
  const directory = "packages/spec/docs/diagrams"
  return readdirSync(path.join(repositoryRoot, directory), {
    withFileTypes: true,
  })
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.endsWith(".md") &&
        !entry.name.endsWith(".ja.md"),
    )
    .map((entry) => {
      const name = entry.name.slice(0, -3)
      const text = { root: name, ja: name }
      for (const [locale, extension] of [
        ["root", ".md"],
        ["ja", ".ja.md"],
      ]) {
        const source = path.join(repositoryRoot, directory, name + extension)
        if (!existsSync(source)) continue
        const heading = readFileSync(source, "utf8")
          .split("\n")
          .find((line) => line.startsWith("# "))
        if (heading) text[locale] = heading.slice(2).trim()
      }
      return { name, text }
    })
    .sort((left, right) => {
      const leftIndex = diagramOrder.indexOf(left.name)
      const rightIndex = diagramOrder.indexOf(right.name)
      // A new type still appears automatically before its position is defined.
      const leftOrder = leftIndex < 0 ? diagramOrder.length : leftIndex
      const rightOrder = rightIndex < 0 ? diagramOrder.length : rightIndex
      return leftOrder - rightOrder || left.name.localeCompare(right.name, "en")
    })
}

/**
 * Maps repository-relative POSIX source paths to physical paths within the
 * generated source directory. Japanese pages keep .ja.md here; URL locale
 * rewriting happens separately. Duplicate destinations are rejected.
 */
export function collectDocuments(repositoryRoot) {
  const documents = new Map()
  const destinations = new Set()

  /** Registers a single canonical source for a generated page. */
  function add(source, page) {
    if (destinations.has(page)) {
      throw new Error(`More than one document maps to ${page}`)
    }
    documents.set(source, page)
    destinations.add(page)
  }

  for (const page of markdownFiles(
    path.join(repositoryRoot, "packages/docs/pages"),
  )) {
    add(`packages/docs/pages/${page}`, page)
  }
  for (const [source, page] of documentDirectories) {
    for (const file of markdownFiles(path.join(repositoryRoot, source))) {
      add(`${source}/${file}`, `${page}/${file}`)
    }
  }
  return documents
}

/**
 * Groups imported rule pages by diagram family, with common rules first.
 * A rule's filename is its id: a diagram-specific rule's id starts with the
 * diagram's name and a hyphen, and a common rule's id does not. Only pages in
 * the selected language are linked, and families follow the diagram order.
 */
export function ruleItems(diagrams, documents, locale) {
  const extension = locale === "ja" ? ".ja.md" : ".md"
  const prefix = locale === "ja" ? "/ja" : ""
  const commonText = locale === "ja" ? "共通のルール" : "Common rules"
  const section = "linter/rules/"
  const common = "."
  const groups = new Map()
  for (const page of documents.values()) {
    if (
      !page.startsWith(section) ||
      !page.endsWith(extension) ||
      (locale !== "ja" && page.endsWith(".ja.md"))
    )
      continue
    const name = page.slice(section.length, -extension.length)
    if (name === "index" || name.includes("/")) continue
    const family =
      diagrams.find((diagram) => name.startsWith(`${diagram.name}-`))?.name ??
      common
    if (!groups.has(family)) groups.set(family, [])
    groups.get(family).push({ text: name, link: `${prefix}/${section}${name}` })
  }
  const families = [common, ...diagrams.map(({ name }) => name)]
  return families
    .filter((name) => groups.has(name))
    .map((name) => ({
      text:
        name === common
          ? commonText
          : diagrams.find((diagram) => diagram.name === name).text[locale],
      items: groups
        .get(name)
        .sort((left, right) => left.text.localeCompare(right.text, "en")),
    }))
}

/** Publishes a Japanese pair under /ja/ while preserving paired source names. */
export function rewritePagePath(page) {
  return page.endsWith(".ja.md") ? `ja/${page.slice(0, -6)}.md` : page
}

/** Keeps existing heading fragments, including Japanese text and dotted names. */
export function documentAnchor(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N} \-_]/gu, "")
    .replaceAll(" ", "-")
}

/**
 * Finds a canonical source from either the generated .ja.md filename or its
 * rewritten ja/*.md route. Markdown hooks and page metadata may see different
 * stages of VitePress's path rewriting, but must resolve the same source.
 */
export function sourceForPage(documents, page) {
  for (const [source, destination] of documents) {
    if (destination === page || rewritePagePath(destination) === page)
      return source
  }
  return undefined
}

/**
 * Removes a language notice only from an imported document's site copy. The
 * repository layout is a title followed by a paragraph ending in a single
 * relative link to its imported translation; labels and link captions may vary.
 * Later paragraphs and the canonical source bytes are left unchanged.
 */
function removeLanguageNotice(content, source, documents) {
  if (source.startsWith("packages/docs/pages/")) return content
  const japanese = source.endsWith(".ja.md")
  const counterpart = japanese
    ? `${source.slice(0, -6)}.md`
    : `${source.slice(0, -3)}.ja.md`
  if (!documents.has(counterpart)) return content
  const text = content.toString("utf8")
  if (!text.startsWith("# ")) return content
  const lineEnd = text.indexOf("\n")
  const newline = text[lineEnd - 1] === "\r" ? "\r\n" : "\n"
  const separator = newline + newline
  const headingEnd = text.indexOf(separator)
  if (headingEnd < 0) return content
  const start = headingEnd + separator.length
  const end = text.indexOf(separator, start)
  const notice = text.slice(start, end < 0 ? text.length : end).trim()
  const name = path.basename(counterpart)
  const linkStart = notice.indexOf("[")
  const linkTarget = notice.indexOf("](", linkStart)
  if (
    linkStart < 0 ||
    linkTarget < 0 ||
    notice.slice(linkTarget + 2) !== `./${name})`
  ) {
    return content
  }
  const rest = end < 0 ? text.length : end + separator.length
  return Buffer.from(text.slice(0, start) + text.slice(rest))
}

/**
 * Synchronizes copies into an exclusively generated sourceDirectory: every
 * unmapped Markdown file there is stale and removed. Canonical sources and
 * non-Markdown assets are retained; unchanged copies are not rewritten.
 */
export function syncDocuments(repositoryRoot, documents, sourceDirectory) {
  // Read every source before changing the generated tree, so missing required
  // documents fail before any page is copied or removed.
  const contents = [...documents].map(([source, page]) => [
    page,
    removeLanguageNotice(
      readFileSync(path.join(repositoryRoot, source)),
      source,
      documents,
    ),
  ])
  const destinations = new Set(documents.values())
  mkdirSync(sourceDirectory, { recursive: true })
  for (const [page, content] of contents) {
    const target = path.join(sourceDirectory, page)
    // Avoid unnecessary generated-page watch events during a source rescan.
    if (existsSync(target) && readFileSync(target).equals(content)) continue
    mkdirSync(path.dirname(target), { recursive: true })
    writeFileSync(target, content)
  }
  for (const page of markdownFiles(sourceDirectory)) {
    if (!destinations.has(page)) {
      rmSync(path.join(sourceDirectory, page), { force: true })
    }
  }
}

/**
 * Resolves links relative to the canonical source, preserving query and hash.
 * Imported targets become site Markdown paths for VitePress to rewrite; other
 * existing repository files/directories become GitHub links. External URLs and
 * same-page fragments are unchanged; a missing local target fails rendering.
 */
export function documentLink(href, source, documents, repositoryRoot) {
  if (href.startsWith("#")) return href
  // The dummy origin is only a base for URL path resolution, never a request.
  const resolved = new URL(href, `https://docs.invalid/${source}`)
  if (resolved.origin !== "https://docs.invalid") return href
  const target = decodeURIComponent(resolved.pathname.slice(1))
  const page = documents.get(target)
  if (page) return `/${rewritePagePath(page)}${resolved.search}${resolved.hash}`
  const directory = statSync(path.join(repositoryRoot, target)).isDirectory()
  return (
    `https://github.com/mmd-toolkit/mmd-toolkit/${directory ? "tree" : "blob"}/main/` +
    `${resolved.pathname.slice(1)}${resolved.search}${resolved.hash}`
  )
}

/**
 * Adjusts parsed link tokens and fixture citations, keeping fenced and inline
 * examples literal. Authored and imported pages both link to canonical files;
 * source lookup resolves them independently of the generated directory or locale.
 */
export function configureDocumentMarkdown(md, documents, repositoryRoot) {
  md.core.ruler.after("inline", "toolkit-document-links", (state) => {
    const source = sourceForPage(documents, state.env.relativePath)
    if (!source) return
    const imported = !source.startsWith("packages/docs/pages/")
    for (const token of state.tokens) {
      for (const child of token.children ?? []) {
        // Mermaid delimiters such as `{{` are literal syntax, not Vue expressions.
        if (imported && child.type === "code_inline") {
          child.attrSet("v-pre", "")
        }
        if (child.type !== "link_open") continue
        const href = child.attrGet("href")
        if (href !== null) {
          child.attrSet(
            "href",
            documentLink(href, source, documents, repositoryRoot),
          )
        }
      }
    }
  })
  md.inline.ruler.before(
    "link",
    "toolkit-fixture-reference",
    (state, silent) => {
      // Do not create nested links when a citation is already inside link text.
      if (
        state.linkLevel > 0 ||
        !state.src.startsWith("[fixture:", state.pos)
      ) {
        return false
      }
      const match = /^\[fixture:\s+([^\s\]]+)\]/u.exec(
        state.src.slice(state.pos),
      )
      if (!match || match[1].includes("<")) return false
      if (!silent) {
        const link = state.push("link_open", "a", 1)
        link.attrSet(
          "href",
          `https://github.com/mmd-toolkit/mmd-toolkit/tree/main/packages/tests/fixtures/${match[1]}`,
        )
        state.push("text", "", 0).content = match[0]
        state.push("link_close", "a", -1)
      }
      state.pos += match[0].length
      return true
    },
  )
}

/**
 * Watches canonical sources and synchronizes their generated copies. Body edits
 * use VitePress's normal page hot updates. Changes to the diagram inventory or
 * titles, and rule page additions or removals, reload the configuration so the
 * computed rule sidebars are rebuilt as well.
 */
export function documentSourcesPlugin(
  repositoryRoot,
  diagrams,
  documents,
  sourceDirectory,
) {
  return {
    name: "mmd-toolkit-document-sources",
    configureServer(server) {
      let navigationReload
      server.httpServer?.once("close", () => clearTimeout(navigationReload))
      server.watcher.add(
        sourceDirectories.map((directory) =>
          path.join(repositoryRoot, directory),
        ),
      )
      server.watcher.on("all", (event, file) => {
        if (
          !["add", "change", "unlink"].includes(event) ||
          !file.endsWith(".md")
        )
          return
        const relative = path
          .relative(repositoryRoot, file)
          .split(path.sep)
          .join("/")
        // Ignore generated copies, whose own updates must not trigger a rescan.
        if (
          !sourceDirectories.some((directory) =>
            relative.startsWith(`${directory}/`),
          )
        )
          return
        try {
          const updatedDiagrams = collectDiagrams(repositoryRoot)
          const updated = collectDocuments(repositoryRoot)
          const navigationChanged =
            JSON.stringify(diagrams) !== JSON.stringify(updatedDiagrams) ||
            (event !== "change" &&
              relative.startsWith("packages/eslint-plugin/docs/rules/"))
          syncDocuments(repositoryRoot, updated, sourceDirectory)
          // Markdown hooks retain this map. Update shared objects in place, also
          // preserving the diagram inventory used to compare subsequent events.
          documents.clear()
          for (const [source, page] of updated) documents.set(source, page)
          diagrams.splice(0, diagrams.length, ...updatedDiagrams)
          if (navigationChanged) {
            // Group paired documents into one config reload, owned by VitePress.
            clearTimeout(navigationReload)
            navigationReload = setTimeout(() => {
              server.watcher.emit("change", server.config.vitepress.configPath)
            }, 200)
          }
        } catch (error) {
          server.config.logger.error(error.stack)
          server.ws.send({
            type: "error",
            err: { message: error.message, stack: error.stack },
          })
        }
      })
    },
  }
}
