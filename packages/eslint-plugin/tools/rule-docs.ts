/**
 * Renders the parts of the rule documents that come from the rules of the
 * plugin: the list of the rules in `docs/rules/index.md` and `index.ja.md`,
 * and in each rule document its title, version, and whether the `recommended`
 * configuration enables the rule. The examples are written by hand and
 * printed as the formatter prints them (`formatMarkdown`). The rest of the
 * documents is written by hand. `update-docs.ts` writes the result, and
 * `update-docs.ts --check` checks that the documents hold it.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { fileURLToPath } from "node:url"
import type { RuleDefinition } from "@eslint/core"
import { format, resolveConfig } from "prettier"
import { rules } from "../src/rules/index.ts"
import { appendItems } from "../src/utils/collections.ts"

/** The namespace of the plugin, which the rule ids start with. */
const NAMESPACE = "@mmd-toolkit"

/** The languages of the documents: English, and Japanese in `<name>.ja.md`. */
export type DocumentLanguage = "en" | "ja"

/** The directory of the rule documents. */
export const RULE_DOCS_DIR: string = fileURLToPath(
  new URL("../docs/rules/", import.meta.url),
)

/**
 * The Prettier configuration of the rule documents: the root configuration and
 * the plugin for Mermaid. It is the one place that says the examples are
 * printed as the formatter prints them.
 */
export const DOCS_PRETTIER_CONFIG: string = fileURLToPath(
  new URL("../docs/prettier.config.js", import.meta.url),
)

/** The directory of the tests of the rules: `<name>.test.ts` tests the rule `name`. */
export const RULE_TESTS_DIR: string = fileURLToPath(
  new URL("../tests/rules/", import.meta.url),
)

/** The suffix of a document in each language. */
const SUFFIX: Record<DocumentLanguage, string> = { en: ".md", ja: ".ja.md" }

/** The markers around the generated list of the rules in the index. */
const LIST_BEGIN = "<!-- begin auto-generated rules list -->"
const LIST_END = "<!-- end auto-generated rules list -->"

/** The markers around the generated notice of a rule document. */
const NOTICE_BEGIN = "<!-- begin auto-generated rule notice -->"
const NOTICE_END = "<!-- end auto-generated rule notice -->"

/** The markers around the generated version section of a rule document. */
const VERSION_BEGIN = "<!-- begin auto-generated rule version -->"
const VERSION_END = "<!-- end auto-generated rule version -->"

/**
 * The markers around the generated section of a rule document that links to
 * the source and the test of a rule.
 */
const RESOURCES_BEGIN = "<!-- begin auto-generated rule resources -->"
const RESOURCES_END = "<!-- end auto-generated rule resources -->"

/**
 * The page of ESLint on the `--fix` option, which the generated parts link to as
 * the notices of eslint-doc-generator do.
 */
const FIX_URL =
  "https://eslint.org/docs/latest/use/command-line-interface#--fix"

/**
 * The page of ESLint on suggestions, which the generated parts link to as the
 * notices of eslint-doc-generator do.
 */
const SUGGESTIONS_URL =
  "https://eslint.org/docs/latest/use/core-concepts#rule-suggestions"

/** The words of the generated parts, in each language. */
const WORDS: Record<
  DocumentLanguage,
  {
    readonly commonRules: string
    readonly rule: string
    readonly description: string
    readonly legend: string
    readonly fixLegend: string
    readonly suggestionsLegend: string
    readonly enabled: string
    readonly notEnabled: string
    readonly fix: string
    readonly suggestions: string
    readonly version: string
    readonly introduced: (version: string) => string
    readonly unreleased: string
    readonly resources: string
    readonly ruleSource: string
    readonly testsSource: string
  }
> = {
  en: {
    commonRules: "Common rules",
    rule: "Rule",
    description: "Description",
    legend: "✅ The `recommended` configuration enables the rule.",
    fixLegend: `🔧 Automatically fixable by the [\`--fix\` CLI option](${FIX_URL}).`,
    suggestionsLegend: `💡 Manually fixable by [editor suggestions](${SUGGESTIONS_URL}).`,
    enabled: "✅ The `recommended` configuration enables this rule.",
    notEnabled: "The `recommended` configuration does not enable this rule.",
    fix: `🔧 This rule is automatically fixable by the [\`--fix\` CLI option](${FIX_URL}).`,
    suggestions: `💡 This rule is manually fixable by [editor suggestions](${SUGGESTIONS_URL}).`,
    version: "Version",
    introduced: (version) =>
      `This rule was introduced in \`@mmd-toolkit/eslint-plugin\` ${version}.`,
    unreleased: "This rule has not been released yet.",
    resources: "Resources",
    ruleSource: "Rule source",
    testsSource: "Tests source",
  },
  ja: {
    commonRules: "共通の規則",
    rule: "規則",
    description: "説明",
    legend: "✅ は、`recommended` の設定が有効にする規則。",
    fixLegend: `🔧 は、\n[\`--fix\` オプション](${FIX_URL})\nで自動修正できる規則。`,
    suggestionsLegend: `💡 は、\n[エディターの修正候補](${SUGGESTIONS_URL})\nがある規則。`,
    enabled: "✅ `recommended` の設定は、この規則を有効にする。",
    notEnabled: "`recommended` の設定は、この規則を有効にしない。",
    fix: `🔧\n[\`--fix\` オプション](${FIX_URL})\nで自動修正できる。`,
    suggestions: `💡\n[エディターの修正候補](${SUGGESTIONS_URL})\nを選んで適用できる。`,
    version: "バージョン",
    introduced: (version) =>
      `この規則は、\`@mmd-toolkit/eslint-plugin\` ${version} で追加された。`,
    unreleased: "この規則は、まだリリースされていない。",
    resources: "リソース",
    ruleSource: "規則のソース",
    testsSource: "テストのソース",
  },
}

/** The path of the document of the rule `name` in `language`, under `docsDir`. */
export function ruleDocumentPath(
  docsDir: string,
  name: string,
  language: DocumentLanguage,
): string {
  return `${docsDir}${name}${SUFFIX[language]}`
}

/** The path of the index in `language`, under `docsDir`. */
function indexPath(docsDir: string, language: DocumentLanguage): string {
  return `${docsDir}index${SUFFIX[language]}`
}

/** The paragraphs of a Markdown text, without the blank lines between them. */
function paragraphsOf(text: string): string[] {
  return text
    .split("\n\n")
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph !== "")
}

/**
 * The documents of the same directory that `document` links to, as the file
 * names the links give (`./name.md` and `./name.ja.md`), without any heading.
 */
function siblingLinks(document: string): string[] {
  const targets: string[] = []
  for (const part of document.split("](./").slice(1)) {
    const end = part.indexOf(")")
    const target = part.slice(0, end).split("#")[0] ?? ""
    if (target.endsWith(".md")) targets.push(target)
  }
  return targets
}

/** The words that open the line that links to the other language. */
const LANGUAGE_LINE_STARTS = ["Japanese version:", "英語版:"]

/** The initial YAML frontmatter, including its delimiters, or an empty text. */
function frontmatterOf(document: string): string {
  if (!document.startsWith("---\n")) return ""
  const end = document.indexOf("\n---\n", 3)
  if (end === -1) throw new Error("A rule document has unclosed frontmatter")
  return document.slice(0, end + "\n---\n".length)
}

/** The first released version, persisted as an unquoted `since: vX.Y.Z`. */
function versionOf(document: string): string | undefined {
  const since = frontmatterOf(document)
    .split("\n")
    .find((line) => line.startsWith("since:"))
  if (since === undefined) return undefined
  const version = since.slice("since:".length).trim()
  if (!/^v\d+\.\d+\.\d+(?:-[\d\-.A-Za-z]+)?$/u.test(version)) {
    throw new Error(`Invalid rule version: ${since}`)
  }
  return version
}

/**
 * The first paragraph of a rule document, after its title and the line that
 * links to the other language, which an English document has only when its
 * Japanese version exists: the one sentence that describes the rule.
 */
export function firstParagraph(document: string): string {
  const paragraphs = paragraphsOf(
    document.slice(frontmatterOf(document).length),
  )
  const hasLanguageLine = LANGUAGE_LINE_STARTS.some((start) =>
    paragraphs[1]?.startsWith(start),
  )
  const paragraph = paragraphs[hasLanguageLine ? 2 : 1]
  if (paragraph === undefined) {
    throw new Error("A rule document has no first paragraph")
  }
  return paragraph
}

/** The line that opens a code block of Mermaid text: its fence and info string. */
const MMD_FENCE_OPEN = "```mmd"

/** The line that closes a code block. */
const FENCE_CLOSE = "```"

/**
 * The code blocks of Mermaid text in a Markdown document, in order: the lines
 * between a line `MMD_FENCE_OPEN` and the next line `FENCE_CLOSE`, each block
 * as one text whose lines end with a line feed. The documents are formatted
 * by Prettier, so a fence is a line of its own at the start of the line.
 */
export function mmdCodeBlocks(document: string): string[] {
  const blocks: string[] = []
  let block: string[] | null = null
  for (const line of document.split("\n")) {
    if (block === null) {
      if (line === MMD_FENCE_OPEN) block = []
    } else if (line === FENCE_CLOSE) {
      blocks.push(block.map((blockLine) => `${blockLine}\n`).join(""))
      block = null
    } else {
      block.push(line)
    }
  }
  return blocks
}

/** Whether `character` is an ASCII character. */
function isAscii(character: string): boolean {
  return character !== "" && character.charCodeAt(0) < 0x80
}

/**
 * The text of a paragraph as one line, whatever its line breaks. Prettier
 * breaks English prose at spaces, so a line break there stands for a space.
 * Japanese prose is broken after `、` and has no spaces, so a line break there
 * stands for nothing, except between two ASCII characters, where it stands
 * for the space between two words.
 */
export function oneLine(paragraph: string): string {
  const lines = paragraph.split("\n").map((line) => line.trim())
  let text = lines[0] ?? ""
  for (const line of lines.slice(1)) {
    const joinsWords = isAscii(text.slice(-1)) && isAscii(line.slice(0, 1))
    text += joinsWords ? ` ${line}` : line
  }
  return text
}

/** Whether the rule `name` has a document in `language` under `docsDir`. */
function hasDocument(
  docsDir: string,
  name: string,
  language: DocumentLanguage,
): boolean {
  return existsSync(ruleDocumentPath(docsDir, name, language))
}

/** The description of a rule in `language`. */
function descriptionOf(
  docsDir: string,
  name: string,
  rule: RuleDefinition,
  language: DocumentLanguage,
): string {
  if (language === "en") {
    const description = rule.meta?.docs?.description
    if (description === undefined) {
      throw new Error(`The rule ${name} has no meta.docs.description`)
    }
    return description
  }
  // The Japanese description is the first paragraph of the Japanese document,
  // written by hand; the rule holds the English one only.
  const path = ruleDocumentPath(docsDir, name, language)
  return oneLine(firstParagraph(readFileSync(path, "utf8")))
}

/** Whether the `recommended` configuration enables the rule. */
export function isRecommended(rule: RuleDefinition): boolean {
  return rule.meta?.docs?.recommended === true
}

/** Whether `rule` has a fix, which `eslint --fix` applies. */
function hasFix(rule: RuleDefinition): boolean {
  return rule.meta?.fixable !== undefined
}

/** Whether `rule` offers suggestions. */
function hasSuggestions(rule: RuleDefinition): boolean {
  return rule.meta?.hasSuggestions === true
}

/**
 * The diagrams that have rules, in the order that the list shows them: the
 * order of the diagram families in the sidebar of the documentation site
 * (`diagramOrder` in `packages/docs/.vitepress/documents.js`, which follows
 * the order of the documentation of mermaid.js). A diagram with rules is added
 * here at its place in that order. The names are the prefixes of the rule
 * names, and the names in `diagramOrder` of the site.
 */
export const DIAGRAM_ORDER: readonly string[] = [
  "flowchart",
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
  "wardley",
  "cynefin",
  "treeview",
  "agentflow",
  "railroad",
]

/** The diagram of a rule name (`flowchart-no-ignored-text`), or null for a common rule. */
export function diagramOf(name: string): string | null {
  return DIAGRAM_ORDER.find((diagram) => name.startsWith(`${diagram}-`)) ?? null
}

/** The rule names `names` by group: the common rules, then each diagram in `DIAGRAM_ORDER`, each in the given order. */
function groupsOf(names: readonly string[]): Map<string | null, string[]> {
  const groups = new Map<string | null, string[]>([
    [null, []],
    ...DIAGRAM_ORDER.map((diagram): [string, string[]] => [diagram, []]),
  ])
  for (const name of names) {
    const group = groups.get(diagramOf(name))
    if (group === undefined) {
      throw new Error(`The diagram of ${name} is not in DIAGRAM_ORDER`)
    }
    group.push(name)
  }
  return new Map([...groups].filter(([, group]) => group.length > 0))
}

/** The rule, which `rules` holds for every name it lists. */
function ruleOf(name: string): RuleDefinition {
  const rule = rules[name]
  if (rule === undefined) throw new Error(`No rule ${name}`)
  return rule
}

/** The generated list of the rules `names`, between its markers, before formatting. */
function renderList(
  docsDir: string,
  language: DocumentLanguage,
  names: readonly string[],
): string {
  const words = WORDS[language]
  const lines = [
    LIST_BEGIN,
    "",
    words.legend,
    "",
    words.fixLegend,
    "",
    words.suggestionsLegend,
  ]
  for (const [diagram, group] of groupsOf(names)) {
    lines.push("", `## ${diagram ?? words.commonRules}`, "")
    lines.push(
      `| ${words.rule} | ${words.description} | ✅ | 🔧 | 💡 |`,
      "| --- | --- | --- | --- | --- |",
    )
    for (const name of group) {
      const rule = ruleOf(name)
      // A rule without a Japanese document appears in the Japanese list with
      // its English document and its English description.
      const rowLanguage = hasDocument(docsDir, name, language) ? language : "en"
      const link = `[${name}](./${name}${SUFFIX[rowLanguage]})`
      const recommended = isRecommended(rule) ? "✅" : ""
      const fix = hasFix(rule) ? "🔧" : ""
      const suggestions = hasSuggestions(rule) ? "💡" : ""
      lines.push(
        `| ${link} | ${descriptionOf(docsDir, name, rule, rowLanguage)} | ${recommended} | ${fix} | ${suggestions} |`,
      )
    }
  }
  lines.push("", LIST_END)
  return lines.join("\n")
}

/** The generated notice of a rule document, between its markers: whether `recommended` enables the rule, whether it has a fix, and whether it offers suggestions. */
function renderNotice(name: string, language: DocumentLanguage): string {
  const words = WORDS[language]
  const rule = ruleOf(name)
  const lines = [
    NOTICE_BEGIN,
    "",
    isRecommended(rule) ? words.enabled : words.notEnabled,
    "",
  ]
  if (hasFix(rule)) lines.push(words.fix, "")
  if (hasSuggestions(rule)) lines.push(words.suggestions, "")
  lines.push(NOTICE_END)
  return lines.join("\n")
}

/**
 * The generated section of a rule document, between its markers: links to the
 * source and the test of the rule, relative to the document, which is
 * `docs/rules/<name>.md`.
 */
function renderResources(name: string, language: DocumentLanguage): string {
  const words = WORDS[language]
  const toPackage = "../../"
  return [
    RESOURCES_BEGIN,
    "",
    `## ${words.resources}`,
    "",
    `- [${words.ruleSource}](${toPackage}src/rules/${name}.ts)`,
    `- [${words.testsSource}](${toPackage}tests/rules/${name}.test.ts)`,
    "",
    RESOURCES_END,
  ].join("\n")
}

/** `text` with the part between `begin` and `end` (markers included) replaced. */
function replaceBetween(
  text: string,
  begin: string,
  end: string,
  replacement: string,
  path: string,
): string {
  const start = text.indexOf(begin)
  const finish = text.indexOf(end)
  if (start === -1 || finish === -1 || finish < start) {
    throw new Error(`${path} has no "${begin}" and "${end}"`)
  }
  return text.slice(0, start) + replacement + text.slice(finish + end.length)
}

/**
 * A rule document with its generated parts: the title, which is the rule id;
 * the notice, which follows the first paragraph; the version; and the resources
 * at the end. The version is also saved in the frontmatter.
 * A document without the markers of the notice gets them after its first
 * paragraph, and one without the markers of the resources gets them at its end.
 */
function renderRuleDocument(
  docsDir: string,
  name: string,
  language: DocumentLanguage,
  version: string | undefined,
): string {
  const path = ruleDocumentPath(docsDir, name, language)
  const document = readFileSync(path, "utf8")
  const frontmatter = frontmatterOf(document)
  const metadata = frontmatter
    .trimEnd()
    .split("\n")
    .slice(1, -1)
    .filter((line) => !line.startsWith("since:"))
  if (version !== undefined) metadata.push(`since: ${version}`)
  const prefix =
    metadata.length > 0 ? `---\n${metadata.join("\n")}\n---\n\n` : ""
  const body = document.slice(frontmatter.length).trimStart()
  const titleEnd = body.indexOf("\n")
  const withTitle = `${prefix}# ${NAMESPACE}/${name}${body.slice(titleEnd)}`
  const notice = renderNotice(name, language)
  let withNotice: string, withVersion: string
  if (withTitle.includes(NOTICE_BEGIN)) {
    withNotice = replaceBetween(
      withTitle,
      NOTICE_BEGIN,
      NOTICE_END,
      notice,
      path,
    )
  } else {
    const paragraph = firstParagraph(withTitle)
    const paragraphEnd = withTitle.indexOf(paragraph) + paragraph.length
    withNotice = `${withTitle.slice(0, paragraphEnd)}\n\n${notice}${withTitle.slice(paragraphEnd)}`
  }
  const words = WORDS[language]
  const versionSection = [
    VERSION_BEGIN,
    "",
    `## ${words.version}`,
    "",
    version === undefined ? words.unreleased : words.introduced(version),
    "",
    VERSION_END,
  ].join("\n")
  if (withNotice.includes(VERSION_BEGIN)) {
    withVersion = replaceBetween(
      withNotice,
      VERSION_BEGIN,
      VERSION_END,
      versionSection,
      path,
    )
  } else {
    const resourcesStart = withNotice.indexOf(RESOURCES_BEGIN)
    const insertAt = resourcesStart === -1 ? withNotice.length : resourcesStart
    withVersion = `${withNotice.slice(0, insertAt).trimEnd()}\n\n${versionSection}\n\n${withNotice.slice(insertAt)}`
  }
  const resources = renderResources(name, language)
  if (withVersion.includes(RESOURCES_BEGIN)) {
    return replaceBetween(
      withVersion,
      RESOURCES_BEGIN,
      RESOURCES_END,
      resources,
      path,
    )
  }
  return `${withVersion.trimEnd()}\n\n${resources}\n`
}

/**
 * `text` formatted as Prettier formats the Markdown file at `path`, with the
 * configuration of the rule documents (`DOCS_PRETTIER_CONFIG`), which has the
 * plugin for Mermaid: an example is what the formatter prints, unless a
 * `<!-- prettier-ignore -->` comment before its block keeps it as written. The
 * file is named, not looked for from `path`: the tests format documents in
 * temporary directories, where Prettier finds no configuration.
 */
async function formatMarkdown(text: string, path: string): Promise<string> {
  try {
    // The Prettier CLI and editors read `.editorconfig`; its API does not
    // unless asked, so a setting there would make them disagree with this.
    const options = await resolveConfig(path, {
      config: DOCS_PRETTIER_CONFIG,
      editorconfig: true,
    })
    return await format(text, { ...options, filepath: path })
  } catch (error) {
    // Prettier names the document it was formatting, not the cause, which is
    // often the built parser that the source of the formatter imports.
    throw new Error(
      `Prettier could not format ${path} with ${DOCS_PRETTIER_CONFIG}. If the cause is a module missing under packages/parser/lib, run \`pnpm run build:parser\` at the root of the repository.`,
      { cause: error },
    )
  }
}

/**
 * Every document with generated parts, by its path, as it should be: the
 * index and the document of every rule in `names` (all the rules by default)
 * under `docsDir`, in each language in which it exists. The English documents
 * are the originals; a Japanese document is rendered when it exists. Render
 * only when `mismatches` finds nothing. The English frontmatter owns the first
 * released version; an absent version is stamped only when `releaseVersion`
 * is supplied (with its `v` prefix), after Changesets has updated the package.
 */
export async function renderDocuments(
  docsDir: string = RULE_DOCS_DIR,
  names: readonly string[] = Object.keys(rules),
  releaseVersion?: string,
): Promise<Map<string, string>> {
  const documents = new Map<string, string>()
  const versions = new Map<string, string | undefined>()
  for (const name of names) {
    const english = readFileSync(ruleDocumentPath(docsDir, name, "en"), "utf8")
    versions.set(name, versionOf(english) ?? releaseVersion)
  }
  for (const language of ["en", "ja"] as const) {
    const path = indexPath(docsDir, language)
    if (!existsSync(path)) continue
    const index = replaceBetween(
      readFileSync(path, "utf8"),
      LIST_BEGIN,
      LIST_END,
      renderList(docsDir, language, names),
      path,
    )
    documents.set(path, await formatMarkdown(index, path))
    for (const name of names) {
      if (!hasDocument(docsDir, name, language)) continue
      const rulePath = ruleDocumentPath(docsDir, name, language)
      documents.set(
        rulePath,
        await formatMarkdown(
          renderRuleDocument(docsDir, name, language, versions.get(name)),
          rulePath,
        ),
      )
    }
  }
  return documents
}

/**
 * The Markdown documents under `docsDir`, by the rule name and language they
 * are for: the path without the suffix of its language.
 */
function documentsUnder(
  docsDir: string,
  directory = "",
): { name: string; language: DocumentLanguage }[] {
  const documents: { name: string; language: DocumentLanguage }[] = []
  for (const entry of readdirSync(`${docsDir}${directory}`)) {
    if (statSync(`${docsDir}${directory}${entry}`).isDirectory()) {
      appendItems(documents, documentsUnder(docsDir, `${directory}${entry}/`))
      continue
    }
    const language: DocumentLanguage | null = entry.endsWith(SUFFIX.ja)
      ? "ja"
      : entry.endsWith(SUFFIX.en)
        ? "en"
        : null
    if (language === null) continue
    const name = `${directory}${entry.slice(0, -SUFFIX[language].length)}`
    documents.push({ name, language })
  }
  return documents
}

/**
 * What does not match between the rules and their documents under `docsDir`
 * and their tests under `testsDir`: a rule without a test, which the generated
 * link to it would miss, a rule without an English document (the original), a
 * document without a rule, an English document whose first paragraph is not
 * the rule's `meta.docs.description`, a link from a document to another
 * document of the same directory that does not exist (an English document that
 * links to a Japanese version that does not exist, a Japanese document that
 * links to the Japanese version of a rule that has none), a Japanese document
 * whose Mermaid code blocks are not those of the English one, and an example
 * without its rule-enabling comment. A rule may lack its Japanese document.
 */
export function mismatches(
  docsDir: string = RULE_DOCS_DIR,
  testsDir: string = RULE_TESTS_DIR,
): string[] {
  const problems: string[] = []
  for (const name of Object.keys(rules)) {
    const testPath = `${testsDir}${name}.test.ts`
    if (!existsSync(testPath)) {
      problems.push(`The rule ${name} has no ${testPath}`)
    }
    for (const language of ["en", "ja"] as const) {
      const path = ruleDocumentPath(docsDir, name, language)
      if (!existsSync(path)) {
        if (language === "en") problems.push(`The rule ${name} has no ${path}`)
        continue
      }
      // Both correct and incorrect examples opt in to the site's diagnostics.
      // Put the comment first so unclosed example text cannot swallow it.
      const directive = `%% eslint ${NAMESPACE}/${name}: error\n`
      for (const [index, block] of mmdCodeBlocks(
        readFileSync(path, "utf8"),
      ).entries()) {
        if (!block.startsWith(directive)) {
          problems.push(
            `The mmd code block ${index + 1} of ${path} must start with ${directive.trimEnd()}`,
          )
        }
      }
    }
    const englishPath = ruleDocumentPath(docsDir, name, "en")
    if (!existsSync(englishPath)) continue
    const english = readFileSync(englishPath, "utf8")
    const description = ruleOf(name).meta?.docs?.description
    if (oneLine(firstParagraph(english)) !== description) {
      problems.push(
        `The first paragraph of ${englishPath} is not the meta.docs.description of the rule ${name}`,
      )
    }
    const japanesePath = ruleDocumentPath(docsDir, name, "ja")
    if (!existsSync(japanesePath)) continue
    const englishBlocks = mmdCodeBlocks(english)
    const japaneseBlocks = mmdCodeBlocks(readFileSync(japanesePath, "utf8"))
    if (
      englishBlocks.length !== japaneseBlocks.length ||
      englishBlocks.some((block, index) => block !== japaneseBlocks[index])
    ) {
      problems.push(
        `The mmd code blocks of ${japanesePath} are not those of ${englishPath}, in the same order`,
      )
    }
  }
  for (const { name, language } of documentsUnder(docsDir)) {
    const path = ruleDocumentPath(docsDir, name, language)
    // The list in the index is generated: a stale link there is what `update`
    // rewrites, so it is not a mismatch that stops `update`.
    if (name === "index") continue
    for (const target of siblingLinks(readFileSync(path, "utf8"))) {
      if (!existsSync(`${docsDir}${target}`)) {
        problems.push(
          `${path} links to ${docsDir}${target}, which does not exist`,
        )
      }
    }
    if (!(name in rules)) {
      problems.push(`${path} is the document of no rule`)
    }
  }
  return problems
}
