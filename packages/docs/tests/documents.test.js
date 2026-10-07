import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  unlinkSync,
  utimesSync,
  writeFileSync,
} from "node:fs"
import { EventEmitter } from "node:events"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"
import { createMarkdownRenderer, disposeMdItInstance } from "vitepress"
import {
  collectDiagrams,
  collectDocuments,
  configureDocumentMarkdown,
  documentAnchor,
  documentLink,
  documentSourcesPlugin,
  diagramItems,
  rewritePagePath,
  ruleItems,
  sourceForPage,
  syncDocuments,
  updateFormatterGuides,
} from "../.vitepress/documents.js"

const repositoryRoot = fileURLToPath(new URL("../../../", import.meta.url))
const documents = collectDocuments(repositoryRoot)
const temporaryDirectories = []

/** Creates a temporary source tree with an isolated generated directory. */
function temporaryRepository() {
  const root = mkdtempSync(path.join(tmpdir(), "mmd-docs-"))
  temporaryDirectories.push(root)
  return { root, output: path.join(root, "lib/pages") }
}

/** Writes one source or output file, creating its parent directory. */
function write(root, file, content) {
  const target = path.join(root, file)
  mkdirSync(path.dirname(target), { recursive: true })
  writeFileSync(target, content)
  return target
}

/** Copies imported sources and the diagram inventory for discovery tests. */
function referenceRepository() {
  const repository = temporaryRepository()
  for (const source of documents.keys()) {
    write(
      repository.root,
      source,
      readFileSync(path.join(repositoryRoot, source)),
    )
  }
  for (const { name } of collectDiagrams(repositoryRoot)) {
    for (const extension of [".md", ".ja.md"]) {
      const source = `packages/spec/docs/diagrams/${name}${extension}`
      const file = path.join(repositoryRoot, source)
      if (existsSync(file)) write(repository.root, source, readFileSync(file))
    }
  }
  return repository
}

afterEach(() => {
  vi.useRealTimers()
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true })
  }
})

describe("canonical documents", () => {
  it("imports references and keeps English/Japanese routes and sources paired", () => {
    expect(
      documents.get("packages/prettier-plugin-mmd/docs/flowchart.md"),
    ).toBe("formatter/formatting/flowchart.md")
    expect(documents.get("packages/spec/docs/known-divergences.ja.md")).toBe(
      "reference/divergences.ja.md",
    )
    expect(
      documents.get("packages/eslint-plugin/docs/rules/flowchart-no-undef.md"),
    ).toBe("linter/rules/flowchart-no-undef.md")
    expect(documents.get("packages/docs/pages/parser/index.md")).toBe(
      "parser/index.md",
    )
    expect(documents.has("packages/parser/docs/error-positions.md")).toBe(false)
    expect(documents.has("packages/parser/docs/error-positions.ja.md")).toBe(
      false,
    )
    expect(documents.has("packages/parser/docs/tokens.md")).toBe(false)
    expect(documents.has("packages/parser/docs/tokens.ja.md")).toBe(false)
    for (const source of documents.keys()) {
      expect(source.startsWith("packages/spec/docs/diagrams/")).toBe(false)
      expect(source.startsWith("packages/spec/docs/ast/")).toBe(false)
      expect(source.startsWith("packages/parser/docs/tokens/")).toBe(false)
      expect(source.startsWith("packages/parser/docs/positions/")).toBe(false)
      expect(source).not.toBe("packages/parser/docs/positions.md")
      expect(source).not.toBe("packages/parser/docs/positions.ja.md")
      expect(source.startsWith("packages/docs/pages/contributing/")).toBe(false)
      expect(source).not.toBe("packages/spec/docs/ast.md")
      expect(source).not.toBe("packages/spec/docs/ast.ja.md")
    }
    for (const [source, page] of documents) {
      expect(sourceForPage(documents, rewritePagePath(page))).toBe(source)
      if (!source.endsWith(".ja.md")) {
        expect(documents.get(`${source.slice(0, -3)}.ja.md`)).toBe(
          `${page.slice(0, -3)}.ja.md`,
        )
      }
    }
  })

  it("copies bytes unchanged and leaves identical output untouched", () => {
    const { root, output } = temporaryRepository()
    const source = "docs/source.ja.md"
    const content = "# 日本語\n\n`{{` and `}}`\ntrailing spaces  \n"
    write(root, source, content)
    const mapping = new Map([[source, "ja/reference.md"]])
    syncDocuments(root, mapping, output)
    const target = path.join(output, "ja/reference.md")
    expect(readFileSync(target)).toEqual(readFileSync(path.join(root, source)))
    utimesSync(target, 1000, 1000)
    syncDocuments(root, mapping, output)
    expect(statSync(target).mtimeMs).toBe(1_000_000)
    write(root, source, "# Updated\n")
    syncDocuments(root, mapping, output)
    expect(readFileSync(target, "utf8")).toBe("# Updated\n")
  })

  it.each([
    ["tokens.md", "Japanese version: [tokens.ja.md](./tokens.ja.md)", "\n"],
    ["tokens.md", "Japanese version:\n[tokens.ja.md](./tokens.ja.md)", "\n"],
    ["tokens.ja.md", "英語版: [tokens.md](./tokens.md)", "\n"],
    ["tokens.ja.md", "英語版:\n[tokens.md](./tokens.md)", "\n"],
    ["tokens.md", "Japanese version: [tokens.ja.md](./tokens.ja.md)", "\r\n"],
    ["tokens.ja.md", "英語版:\r\n[tokens.md](./tokens.md)", "\r\n"],
    ["tokens.md", "Read this in [日本語](./tokens.ja.md)", "\n"],
    ["tokens.ja.md", "Translation:\n[English](./tokens.md)", "\n"],
    ["tokens.md", "[日本語](./tokens.ja.md)", "\n"],
  ])(
    "omits the language notice when copying %s: %s",
    (name, notice, newline) => {
      const { root, output } = temporaryRepository()
      const mapping = new Map([
        ["packages/parser/docs/tokens.md", "parser/tokens.md"],
        ["packages/parser/docs/tokens.ja.md", "parser/tokens.ja.md"],
      ])
      for (const source of mapping.keys()) write(root, source, "# Tokens\n")
      const source = `packages/parser/docs/${name}`
      const body = [
        "Token definitions.",
        "",
        "[Japanese tokens](./tokens.ja.md)",
        "",
        "Japanese version: [tokens.ja.md](./tokens.ja.md)",
        "",
        "`Japanese version: [tokens.ja.md](./tokens.ja.md)`",
        "",
        "```text",
        "Japanese version: [tokens.ja.md](./tokens.ja.md)",
        "```",
        "",
        "trailing spaces  ",
        "",
      ].join(newline)
      const content = `# Tokens${newline}${newline}${notice}${newline}${newline}${body}`
      write(root, source, content)
      syncDocuments(root, mapping, output)
      const target = path.join(output, mapping.get(source))
      expect(readFileSync(target, "utf8")).toBe(
        `# Tokens${newline}${newline}${body}`,
      )
      expect(readFileSync(path.join(root, source), "utf8")).toBe(content)
      utimesSync(target, 1000, 1000)
      syncDocuments(root, mapping, output)
      expect(statSync(target).mtimeMs).toBe(1_000_000)
    },
  )

  it.each([
    [
      "packages/parser/docs/tokens.md",
      "Japanese version: [positions.ja.md](./positions.ja.md)",
    ],
    [
      "packages/parser/docs/tokens.md",
      "Japanese version: [tokens.ja.md](./tokens.ja.md) has more examples.",
    ],
    [
      "packages/parser/docs/tokens.md",
      "Related: [positions](./positions.md) and [Japanese tokens](./tokens.ja.md)",
    ],
    [
      "packages/docs/pages/parser/index.md",
      "Japanese version: [index.ja.md](./index.ja.md)",
    ],
  ])("preserves other notices when copying %s: %s", (source, notice) => {
    const { root, output } = temporaryRepository()
    const counterpart = `${source.slice(0, -3)}.ja.md`
    const mapping = new Map([
      [source, "page.md"],
      [counterpart, "page.ja.md"],
    ])
    const content = `# Tokens\n\n${notice}\n\nToken definitions.\n`
    write(root, source, content)
    write(root, counterpart, "# Tokens\n")
    syncDocuments(root, mapping, output)
    expect(readFileSync(path.join(output, "page.md"), "utf8")).toBe(content)
  })

  it("omits a language notice at the end of a document", () => {
    const { root, output } = temporaryRepository()
    const mapping = new Map([
      ["docs/tokens.md", "tokens.md"],
      ["docs/tokens.ja.md", "tokens.ja.md"],
    ])
    write(
      root,
      "docs/tokens.md",
      "# Tokens\n\nJapanese version: [tokens.ja.md](./tokens.ja.md)\n",
    )
    write(root, "docs/tokens.ja.md", "# Tokens\n")
    syncDocuments(root, mapping, output)
    expect(readFileSync(path.join(output, "tokens.md"), "utf8")).toBe(
      "# Tokens\n\n",
    )
  })

  it("removes stale generated pages without deleting sources or other assets", () => {
    const { root, output } = temporaryRepository()
    write(root, "docs/current.md", "# Current\n")
    write(root, "docs/removed.md", "# Removed\n")
    write(output, "old/page.md", "# Stale\n")
    write(output, "asset.svg", "<svg/>\n")
    syncDocuments(root, new Map([["docs/current.md", "current.md"]]), output)
    expect(() => readFileSync(path.join(output, "old/page.md"))).toThrow()
    expect(readFileSync(path.join(output, "asset.svg"), "utf8")).toBe(
      "<svg/>\n",
    )
    expect(readFileSync(path.join(root, "docs/removed.md"), "utf8")).toBe(
      "# Removed\n",
    )
  })

  it("fails before changing output when a required source is missing", () => {
    const { root, output } = temporaryRepository()
    write(root, "docs/current.md", "# New\n")
    write(output, "current.md", "# Old\n")
    write(output, "stale.md", "# Stale\n")
    expect(() =>
      syncDocuments(
        root,
        new Map([
          ["docs/current.md", "current.md"],
          ["docs/missing.md", "missing.md"],
        ]),
        output,
      ),
    ).toThrow()
    expect(readFileSync(path.join(output, "current.md"), "utf8")).toBe(
      "# Old\n",
    )
    expect(readFileSync(path.join(output, "stale.md"), "utf8")).toBe(
      "# Stale\n",
    )
  })
})

describe("rule sidebar", () => {
  it("groups imported rules in diagram order and uses available locale pages", () => {
    const diagrams = [
      { name: "flowchart", text: { root: "Flowchart", ja: "フローチャート" } },
      { name: "sequence", text: { root: "Sequence", ja: "シーケンス図" } },
      { name: "class", text: { root: "Class", ja: "クラス図" } },
      { name: "state", text: { root: "State", ja: "状態図" } },
    ]
    const pages = [
      "class-no-undef.md",
      "class-no-undef.ja.md",
      "sequence-no-ignored-text.md",
      "sequence-no-ignored-text.ja.md",
      "flowchart-no-undef.md",
      "flowchart-no-undef.ja.md",
      "flowchart-no-duplicate-title.md",
      "flowchart-no-untranslated.md",
      "flowchart-no-japanese-only.ja.md",
      "no-unclosed-directive.md",
      "no-unclosed-directive.ja.md",
      "index.md",
      "index.ja.md",
      "notes/flowchart-no-undef.md",
    ]
    const mapping = new Map(
      pages.map((page) => [
        `packages/eslint-plugin/docs/rules/${page}`,
        `linter/rules/${page}`,
      ]),
    )
    mapping.set("packages/docs/pages/linter/index.md", "linter/index.md")
    const english = ruleItems(diagrams, mapping, "root")
    expect(english.map(({ text }) => text)).toEqual([
      "Common rules",
      "Flowchart",
      "Sequence",
      "Class",
    ])
    expect(
      english.flatMap(({ items }) => items.map(({ link }) => link)),
    ).toEqual([
      "/linter/rules/no-unclosed-directive",
      "/linter/rules/flowchart-no-duplicate-title",
      "/linter/rules/flowchart-no-undef",
      "/linter/rules/flowchart-no-untranslated",
      "/linter/rules/sequence-no-ignored-text",
      "/linter/rules/class-no-undef",
    ])
    const japanese = ruleItems(diagrams, mapping, "ja")
    expect(japanese.map(({ text }) => text)).toEqual([
      "共通のルール",
      "フローチャート",
      "シーケンス図",
      "クラス図",
    ])
    expect(
      japanese.flatMap(({ items }) => items.map(({ link }) => link)),
    ).toEqual([
      "/ja/linter/rules/no-unclosed-directive",
      "/ja/linter/rules/flowchart-no-japanese-only",
      "/ja/linter/rules/flowchart-no-undef",
      "/ja/linter/rules/sequence-no-ignored-text",
      "/ja/linter/rules/class-no-undef",
    ])
    expect(japanese[1].items.map(({ text }) => text)).toEqual([
      "flowchart-no-japanese-only",
      "flowchart-no-undef",
    ])
  })

  it("refreshes rule navigation on additions and removals, while body edits keep hot updates", () => {
    vi.useFakeTimers()
    const { root, output } = referenceRepository()
    const diagrams = collectDiagrams(root)
    const mapping = collectDocuments(root, diagrams)
    const watcher = new EventEmitter()
    watcher.add = vi.fn()
    const restart = vi.fn()
    watcher.on("change", restart)
    const configPath = path.join(root, "packages/docs/.vitepress/config.js")
    const server = {
      watcher,
      httpServer: new EventEmitter(),
      config: { vitepress: { configPath }, logger: { error: vi.fn() } },
      ws: { send: vi.fn() },
    }
    documentSourcesPlugin(root, diagrams, mapping, output).configureServer(
      server,
    )
    const source = "packages/eslint-plugin/docs/rules/flowchart-new-rule"
    for (const extension of [".md", ".ja.md"]) {
      const file = write(root, source + extension, "# new-rule\n")
      watcher.emit("all", "add", file)
    }
    expect(restart).not.toHaveBeenCalled()
    vi.advanceTimersByTime(200)
    expect(restart).toHaveBeenCalledExactlyOnceWith(configPath)
    for (const locale of ["root", "ja"]) {
      expect(
        ruleItems(diagrams, mapping, locale).flatMap(({ items }) => items),
      ).toContainEqual({
        text: "flowchart-new-rule",
        link: `${locale === "ja" ? "/ja" : ""}/linter/rules/flowchart-new-rule`,
      })
    }
    restart.mockClear()
    const file = write(root, `${source}.md`, "# new-rule\n\nUpdated body.\n")
    watcher.emit("all", "change", file)
    vi.advanceTimersByTime(200)
    expect(restart).not.toHaveBeenCalled()
    expect(
      readFileSync(
        path.join(output, "linter/rules/flowchart-new-rule.md"),
        "utf8",
      ),
    ).toContain("Updated body.")
    for (const extension of [".md", ".ja.md"]) {
      const target = path.join(root, source + extension)
      unlinkSync(target)
      watcher.emit("all", "unlink", target)
      expect(
        existsSync(
          path.join(output, `linter/rules/flowchart-new-rule${extension}`),
        ),
      ).toBe(false)
    }
    vi.advanceTimersByTime(200)
    expect(restart).toHaveBeenCalledExactlyOnceWith(configPath)
    expect(server.config.logger.error).not.toHaveBeenCalled()
    expect(server.ws.send).not.toHaveBeenCalled()
    server.httpServer.emit("close")
  })
})

describe("additional diagram types", () => {
  it("updates canonical overview guides while preserving the surrounding text", () => {
    const { root, output } = referenceRepository()
    const source = "packages/docs/pages/formatter/formatting/index.md"
    const original = readFileSync(path.join(root, source), "utf8")
    write(root, "packages/spec/docs/diagrams/er.md", "# Entity relationship\n")
    write(root, "packages/spec/docs/diagrams/er.ja.md", "# ER図\n")
    write(root, "packages/prettier-plugin-mmd/docs/er.md", "# ER formatting\n")
    const diagrams = collectDiagrams(root)
    const mapping = collectDocuments(root, diagrams)
    updateFormatterGuides(root, diagrams, mapping)
    syncDocuments(root, mapping, output)
    const overview = path.join(output, "formatter/formatting/index.md")
    const japanese = path.join(output, "formatter/formatting/index.ja.md")
    expect(
      readFileSync(overview, "utf8")
        .split("\n")
        .filter((line) => line.startsWith("- [")),
    ).toEqual([
      "- [Flowchart](../../../../prettier-plugin-mmd/docs/flowchart.md)",
      "- [Sequence](../../../../prettier-plugin-mmd/docs/sequence.md)",
      "- [Class](../../../../prettier-plugin-mmd/docs/class.md)",
      "- [State](../../../../prettier-plugin-mmd/docs/state.md)",
      "- [Entity relationship](../../../../prettier-plugin-mmd/docs/er.md)",
    ])
    expect(readFileSync(japanese, "utf8")).not.toContain("docs/er.ja.md")
    const canonical = path.join(root, source)
    const updated = readFileSync(canonical, "utf8")
    expect(updated).toBe(readFileSync(overview, "utf8"))
    const start = "<!-- formatter-diagram-guides:start -->"
    const end = "<!-- formatter-diagram-guides:end -->"
    expect(updated.slice(0, updated.indexOf(start))).toBe(
      original.slice(0, original.indexOf(start)),
    )
    expect(updated.slice(updated.indexOf(end))).toBe(
      original.slice(original.indexOf(end)),
    )
    utimesSync(canonical, 1000, 1000)
    utimesSync(overview, 1000, 1000)
    updateFormatterGuides(root, diagrams, mapping)
    syncDocuments(root, mapping, output)
    expect(statSync(canonical).mtimeMs).toBe(1_000_000)
    expect(statSync(overview).mtimeMs).toBe(1_000_000)

    write(root, "packages/prettier-plugin-mmd/docs/er.ja.md", "# ER整形\n")
    write(root, "packages/spec/docs/diagrams/er.md", "# ER [relationships]\n")
    const renamed = collectDiagrams(root)
    const translated = collectDocuments(root, renamed)
    updateFormatterGuides(root, renamed, translated)
    syncDocuments(root, translated, output)
    expect(readFileSync(overview, "utf8")).toContain(
      "- [ER \\[relationships\\]](../../../../prettier-plugin-mmd/docs/er.md)",
    )
    expect(readFileSync(japanese, "utf8")).toContain(
      "- [ER図](../../../../prettier-plugin-mmd/docs/er.ja.md)",
    )
    expect(
      readFileSync(
        path.join(root, "packages/docs/pages/formatter/formatting/index.ja.md"),
        "utf8",
      ),
    ).toBe(readFileSync(japanese, "utf8"))
    unlinkSync(path.join(root, "packages/prettier-plugin-mmd/docs/er.ja.md"))
    const untranslated = collectDocuments(root, renamed)
    updateFormatterGuides(root, renamed, untranslated)
    syncDocuments(root, untranslated, output)
    expect(readFileSync(japanese, "utf8")).not.toContain("docs/er.ja.md")
    expect(readFileSync(overview, "utf8")).toContain("docs/er.md")
  })

  it("discovers new diagrams and includes only available documents in each language", () => {
    const { root } = referenceRepository()
    write(root, "packages/spec/docs/diagrams/er.md", "# Entity relationship\n")
    write(root, "packages/spec/docs/diagrams/er.ja.md", "# ER図\n")
    write(root, "packages/spec/docs/ast/er.md", "# ER AST\n")
    write(root, "packages/parser/docs/positions/er.ja.md", "# ER positions\n")
    write(root, "packages/prettier-plugin-mmd/docs/er.md", "# ER formatting\n")
    write(root, "packages/prettier-plugin-mmd/docs/orphan.md", "# Unrelated\n")
    const diagrams = collectDiagrams(root)
    const mapping = collectDocuments(root, diagrams)
    expect(diagrams.map(({ name }) => name)).toEqual([
      "flowchart",
      "sequence",
      "class",
      "state",
      "er",
    ])
    expect(diagrams.find(({ name }) => name === "er")).toEqual({
      name: "er",
      text: { root: "Entity relationship", ja: "ER図" },
    })
    expect(mapping.get("packages/prettier-plugin-mmd/docs/er.md")).toBe(
      "formatter/formatting/er.md",
    )
    expect(mapping.has("packages/prettier-plugin-mmd/docs/orphan.md")).toBe(
      false,
    )
    expect(
      mapping.has("packages/prettier-plugin-mmd/docs/development.md"),
    ).toBe(false)
    expect(mapping.has("packages/parser/docs/positions/er.ja.md")).toBe(false)
    expect(mapping.has("packages/spec/docs/diagrams/er.md")).toBe(false)
    expect(mapping.has("packages/spec/docs/ast/er.md")).toBe(false)
    expect(
      diagramItems(diagrams, mapping, "formatter/formatting", "root"),
    ).toContainEqual({
      text: "Entity relationship",
      link: "/formatter/formatting/er",
    })
    expect(
      diagramItems(diagrams, mapping, "formatter/formatting", "root").map(
        ({ link }) => link,
      ),
    ).toEqual([
      "/formatter/formatting/flowchart",
      "/formatter/formatting/sequence",
      "/formatter/formatting/class",
      "/formatter/formatting/state",
      "/formatter/formatting/er",
    ])
    expect(
      diagramItems(diagrams, mapping, "formatter/formatting", "ja").map(
        ({ link }) => link,
      ),
    ).toEqual([
      "/ja/formatter/formatting/flowchart",
      "/ja/formatter/formatting/sequence",
      "/ja/formatter/formatting/class",
      "/ja/formatter/formatting/state",
    ])
    expect(
      diagramItems(diagrams, mapping, "formatter/formatting", "ja").some(
        (item) => item.link.endsWith("/er"),
      ),
    ).toBe(false)
    write(root, "packages/prettier-plugin-mmd/docs/er.ja.md", "# ER整形\n")
    const translated = collectDocuments(root, diagrams)
    expect(
      diagramItems(diagrams, translated, "formatter/formatting", "ja"),
    ).toContainEqual({ text: "ER図", link: "/ja/formatter/formatting/er" })
  })

  it("keeps unlisted diagrams after Mermaid's documented types in name order", () => {
    const { root } = referenceRepository()
    for (const name of [
      "treeView",
      "architecture",
      "gitGraph",
      "quadrantChart",
      "pie",
      "aaa-new",
      "zzz-new",
    ]) {
      write(root, `packages/spec/docs/diagrams/${name}.md`, `# ${name}\n`)
    }
    expect(collectDiagrams(root).map(({ name }) => name)).toEqual([
      "flowchart",
      "sequence",
      "class",
      "state",
      "pie",
      "quadrantChart",
      "gitGraph",
      "architecture",
      "treeView",
      "aaa-new",
      "zzz-new",
    ])
  })

  it("removes a diagram from generated pages when its canonical type disappears", () => {
    const { root, output } = referenceRepository()
    const source = "packages/spec/docs/diagrams/er.md"
    write(root, source, "# ER\n")
    write(root, "packages/prettier-plugin-mmd/docs/er.md", "# ER formatting\n")
    const diagrams = collectDiagrams(root)
    const before = collectDocuments(root, diagrams)
    updateFormatterGuides(root, diagrams, before)
    syncDocuments(root, before, output)
    expect(existsSync(path.join(output, "formatter/formatting/er.md"))).toBe(
      true,
    )
    expect(
      readFileSync(path.join(output, "formatter/formatting/index.md"), "utf8"),
    ).toContain("docs/er.md")
    unlinkSync(path.join(root, source))
    const remaining = collectDiagrams(root)
    const mapping = collectDocuments(root, remaining)
    updateFormatterGuides(root, remaining, mapping)
    syncDocuments(root, mapping, output)
    expect(mapping.has("packages/prettier-plugin-mmd/docs/er.md")).toBe(false)
    expect(existsSync(path.join(output, "formatter/formatting/er.md"))).toBe(
      false,
    )
    expect(
      readFileSync(path.join(output, "formatter/formatting/index.md"), "utf8"),
    ).not.toContain("docs/er.md")
    expect(
      existsSync(path.join(root, "packages/prettier-plugin-mmd/docs/er.md")),
    ).toBe(true)
  })

  it("refreshes navigation on diagram or page additions, while body edits keep hot updates", () => {
    vi.useFakeTimers()
    const { root, output } = referenceRepository()
    const diagrams = collectDiagrams(root)
    const mapping = collectDocuments(root, diagrams)
    const watcher = new EventEmitter()
    watcher.add = vi.fn()
    const restart = vi.fn()
    watcher.on("change", restart)
    const configPath = path.join(root, "packages/docs/.vitepress/config.js")
    const server = {
      watcher,
      httpServer: new EventEmitter(),
      config: { vitepress: { configPath }, logger: { error: vi.fn() } },
      ws: { send: vi.fn() },
    }
    documentSourcesPlugin(root, diagrams, mapping, output).configureServer(
      server,
    )
    const source = "packages/spec/docs/diagrams/er.md"
    const file = write(root, source, "# ER\n")
    watcher.emit("all", "add", file)
    const translation = write(
      root,
      "packages/spec/docs/diagrams/er.ja.md",
      "# ER図\n",
    )
    watcher.emit("all", "add", translation)
    expect(restart).not.toHaveBeenCalled()
    vi.advanceTimersByTime(200)
    expect(restart).toHaveBeenCalledExactlyOnceWith(configPath)
    expect(mapping.has(source)).toBe(false)
    expect(diagrams.find(({ name }) => name === "er").text.ja).toBe("ER図")
    restart.mockClear()
    const formatter = write(
      root,
      "packages/prettier-plugin-mmd/docs/er.md",
      "# ER formatting\n",
    )
    watcher.emit("all", "add", formatter)
    vi.advanceTimersByTime(200)
    expect(restart).toHaveBeenCalledExactlyOnceWith(configPath)
    expect(server.config.logger.error).not.toHaveBeenCalled()
    expect(server.ws.send).not.toHaveBeenCalled()
    expect(
      readFileSync(path.join(output, "formatter/formatting/index.md"), "utf8"),
    ).toContain("- [ER](../../../../prettier-plugin-mmd/docs/er.md)")
    expect(
      readFileSync(
        path.join(root, "packages/docs/pages/formatter/formatting/index.md"),
        "utf8",
      ),
    ).toContain("- [ER](../../../../prettier-plugin-mmd/docs/er.md)")
    expect(
      readFileSync(
        path.join(output, "formatter/formatting/index.ja.md"),
        "utf8",
      ),
    ).not.toContain("docs/er.ja.md")
    restart.mockClear()
    write(
      root,
      "packages/prettier-plugin-mmd/docs/er.md",
      "# ER\n\nUpdated body.\n",
    )
    watcher.emit("all", "change", formatter)
    expect(restart).not.toHaveBeenCalled()
    expect(
      readFileSync(path.join(output, "formatter/formatting/er.md"), "utf8"),
    ).toContain("Updated body.")
    const translationPage = write(
      root,
      "packages/prettier-plugin-mmd/docs/er.ja.md",
      "# ER整形\n",
    )
    watcher.emit("all", "add", translationPage)
    expect(
      readFileSync(
        path.join(output, "formatter/formatting/index.ja.md"),
        "utf8",
      ),
    ).toContain("- [ER図](../../../../prettier-plugin-mmd/docs/er.ja.md)")
    write(root, source, "# Entity relationship\n")
    watcher.emit("all", "change", file)
    expect(
      readFileSync(path.join(output, "formatter/formatting/index.md"), "utf8"),
    ).toContain(
      "- [Entity relationship](../../../../prettier-plugin-mmd/docs/er.md)",
    )
    unlinkSync(translationPage)
    watcher.emit("all", "unlink", translationPage)
    expect(
      readFileSync(
        path.join(output, "formatter/formatting/index.ja.md"),
        "utf8",
      ),
    ).not.toContain("docs/er.ja.md")
    expect(server.config.logger.error).not.toHaveBeenCalled()
    server.httpServer.emit("close")
    vi.advanceTimersByTime(200)
    expect(restart).not.toHaveBeenCalled()
  })
})

describe("rendered document links and examples", () => {
  let markdown

  beforeAll(async () => {
    disposeMdItInstance()
    markdown = await createMarkdownRenderer(
      repositoryRoot,
      {
        anchor: { slugify: documentAnchor },
        languageAlias: { mmd: "mermaid" },
        config(md) {
          configureDocumentMarkdown(md, documents, repositoryRoot)
        },
      },
      "/mmd-toolkit/",
    )
  })

  it.each([".md", ".ja.md"])(
    "renders canonical overview guides as site links for %s",
    (extension) => {
      const { output } = temporaryRepository()
      syncDocuments(repositoryRoot, documents, output)
      const page = `formatter/formatting/index${extension}`
      const rendered = markdown.render(
        readFileSync(path.join(output, page), "utf8"),
        { relativePath: rewritePagePath(page) },
      )
      const locale = extension === ".ja.md" ? "/ja" : ""
      for (const name of ["flowchart", "sequence", "class", "state"]) {
        expect(rendered).toContain(
          `href="/mmd-toolkit${locale}/formatter/formatting/${name}.html"`,
        )
      }
    },
  )

  it.each([
    {
      source: "packages/docs/pages/reference/support.md",
      page: "reference/support.md",
      hrefs: [
        "/mmd-toolkit/parser/",
        "/mmd-toolkit/linter/rules/",
        "/mmd-toolkit/reference/",
      ],
    },
    {
      source: "packages/docs/pages/reference/support.ja.md",
      page: "ja/reference/support.md",
      hrefs: [
        "/mmd-toolkit/ja/parser/",
        "/mmd-toolkit/ja/linter/rules/",
        "/mmd-toolkit/ja/reference/",
      ],
    },
  ])(
    "resolves canonical file links in authored $source",
    ({ source, page, hrefs }) => {
      const rendered = markdown.render(
        readFileSync(path.join(repositoryRoot, source), "utf8"),
        { relativePath: page },
      )
      for (const href of hrefs) {
        expect(rendered).toContain(`href="${href}"`)
      }
    },
  )

  it("resolves imported cross-package links and Japanese routes with fragments", () => {
    const source = "packages/prettier-plugin-mmd/docs/flowchart.ja.md"
    expect(
      documentLink(
        "../../spec/docs/known-divergences.ja.md?view=details#差の一覧",
        source,
        documents,
        repositoryRoot,
      ),
    ).toBe(encodeURI("/ja/reference/divergences.md?view=details#差の一覧"))
    const rendered = markdown.render(
      "[Known divergences](../../spec/docs/known-divergences.ja.md#差の一覧)\n",
      { relativePath: "ja/formatter/formatting/flowchart.md" },
    )
    expect(decodeURI(rendered)).toContain(
      'href="/mmd-toolkit/ja/reference/divergences.html#差の一覧"',
    )
  })

  it("links detailed AST definitions to GitHub with their language and fragments", () => {
    const source = "packages/prettier-plugin-mmd/docs/flowchart.ja.md"
    expect(
      documentLink(
        "../../spec/docs/ast/flowchart.ja.md?view=nodes#flowchartdatablock",
        source,
        documents,
        repositoryRoot,
      ),
    ).toBe(
      "https://github.com/mmd-toolkit/mmd-toolkit/blob/main/packages/spec/docs/ast/flowchart.ja.md?view=nodes#flowchartdatablock",
    )
    const rendered = markdown.render(
      "[AST][ast]\n\n[ast]: ../../spec/docs/ast/flowchart.ja.md#flowchartdatablock\n",
      { relativePath: "ja/formatter/formatting/flowchart.md" },
    )
    expect(rendered).toContain(
      'href="https://github.com/mmd-toolkit/mmd-toolkit/blob/main/packages/spec/docs/ast/flowchart.ja.md#flowchartdatablock"',
    )
  })

  it("keeps external links and sends unimported files and directories to GitHub", () => {
    const source = "packages/prettier-plugin-mmd/docs/flowchart.md"
    expect(documentLink("#tokens", source, documents, repositoryRoot)).toBe(
      "#tokens",
    )
    expect(
      documentLink(
        "https://example.com/a.md",
        source,
        documents,
        repositoryRoot,
      ),
    ).toBe("https://example.com/a.md")
    expect(
      documentLink("../README.md", source, documents, repositoryRoot),
    ).toBe(
      "https://github.com/mmd-toolkit/mmd-toolkit/blob/main/packages/prettier-plugin-mmd/README.md",
    )
    expect(
      documentLink("../../tests/fixtures/", source, documents, repositoryRoot),
    ).toBe(
      "https://github.com/mmd-toolkit/mmd-toolkit/tree/main/packages/tests/fixtures/",
    )
  })

  it("links wrapped fixture citations and protects code examples and placeholders", () => {
    const rendered = markdown.render(
      [
        "[fixture:\nflowchart/gram-label-empty]",
        "",
        "`[fixture: flowchart/example]` and `[fixture: <category>/<id>]`",
        "",
        "```text",
        "[fixture: flowchart/example]",
        "```",
      ].join("\n"),
      { relativePath: "formatter/formatting/flowchart.md" },
    )
    expect(rendered).toContain(
      'href="https://github.com/mmd-toolkit/mmd-toolkit/tree/main/packages/tests/fixtures/flowchart/gram-label-empty"',
    )
    expect(rendered).not.toContain('fixtures/flowchart/example"')
    expect(rendered).not.toContain("fixtures/%3Ccategory%3E")
  })

  it("displays Mermaid delimiters literally instead of as Vue interpolations", () => {
    const rendered = markdown.render("`{{` … `}}`\n", {
      relativePath: "formatter/formatting/flowchart.md",
    })
    expect(rendered).toContain('<code v-pre="">{{</code>')
    expect(rendered).toContain('<code v-pre="">}}</code>')
  })

  it("preserves existing fragment links for punctuation and Japanese headings", () => {
    const rendered = markdown.render(
      [
        "## The pinned mermaid.js",
        "",
        "[Pinned](#the-pinned-mermaidjs)",
        "",
        "### 文字列、バッククォートの名前、ジェネリクスの型",
        "",
        "[Strings](#文字列バッククォートの名前ジェネリクスの型)",
      ].join("\n"),
      { relativePath: "formatter/formatting/class.ja.md" },
    )
    expect(rendered).toContain('id="the-pinned-mermaidjs"')
    expect(rendered).toContain('href="#the-pinned-mermaidjs"')
    expect(rendered).toContain(
      'id="文字列バッククォートの名前ジェネリクスの型"',
    )
    expect(decodeURI(rendered)).toContain(
      'href="#文字列バッククォートの名前ジェネリクスの型"',
    )
  })
})
