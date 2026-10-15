/**
 * Renders the parts of the rule documents that come from the rules of the
 * plugin: the list of the rules in `docs/rules/index.md` and `index.ja.md`,
 * and in each rule document its title and whether the `recommended`
 * configuration enables the rule. The rest of the documents is written by
 * hand. `update-docs.ts` writes the result, and `tests/docs.test.ts` checks
 * that the documents hold it.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { fileURLToPath } from "node:url"
import type { RuleDefinition } from "@eslint/core"
import { format, resolveConfig } from "prettier"
import { rules } from "../src/rules/index.ts"

/** The namespace of the plugin, which the rule ids start with. */
const NAMESPACE = "@mmd-toolkit"

/** The languages of the documents: English, and Japanese in `<name>.ja.md`. */
export type DocumentLanguage = "en" | "ja"

/** The directory of the rule documents. */
export const RULE_DOCS_DIR: string = fileURLToPath(
  new URL("../docs/rules/", import.meta.url),
)

/**
 * The directory of the notes for implementing the rules: a rule's notes are at
 * the same relative path as its document.
 */
export const RULE_NOTES_DIR: string = fileURLToPath(
  new URL("../docs/rule-notes/", import.meta.url),
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

/**
 * The markers around the generated section of a rule document that links to
 * the source and the test of an implemented rule.
 */
const RESOURCES_BEGIN = "<!-- begin auto-generated rule resources -->"
const RESOURCES_END = "<!-- end auto-generated rule resources -->"

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
    readonly suggestionsLegend: string
    readonly skeletonLegend: string
    readonly enabled: string
    readonly notEnabled: string
    readonly suggestions: string
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
    suggestionsLegend: `💡 Manually fixable by [editor suggestions](${SUGGESTIONS_URL}).`,
    skeletonLegend: "🚧 The rule is not implemented yet: it reports nothing.",
    enabled: "✅ The `recommended` configuration enables this rule.",
    notEnabled: "The `recommended` configuration does not enable this rule.",
    suggestions: `💡 This rule is manually fixable by [editor suggestions](${SUGGESTIONS_URL}).`,
    resources: "Resources",
    ruleSource: "Rule source",
    testsSource: "Tests source",
  },
  ja: {
    commonRules: "共通の規則",
    rule: "規則",
    description: "説明",
    legend: "✅ は、`recommended` の設定が有効にする規則。",
    suggestionsLegend: `💡 は、\n[エディターの修正候補](${SUGGESTIONS_URL})\nがある規則。`,
    skeletonLegend: "🚧 は、まだ実装していない規則。何も報告しない。",
    enabled: "✅ `recommended` の設定は、この規則を有効にする。",
    notEnabled: "`recommended` の設定は、この規則を有効にしない。",
    suggestions: `💡\n[エディターの修正候補](${SUGGESTIONS_URL})\nを選んで適用できる。`,
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
 * The first paragraph of a rule document, after its title and the line that
 * links to the other language: the one sentence that describes the rule.
 */
export function firstParagraph(document: string): string {
  const paragraph = paragraphsOf(document)[2]
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

/** Whether `rule` offers suggestions. */
function hasSuggestions(rule: RuleDefinition): boolean {
  return rule.meta?.hasSuggestions === true
}

/**
 * The diagrams that have rules, in the order that the list shows them: the
 * order of the diagram families in the sidebar of the documentation site
 * (`diagramOrder` in `packages/docs/.vitepress/documents.js`, which follows
 * the order of the documentation of mermaid.js). A diagram with rules is added
 * here at its place in that order.
 */
export const DIAGRAM_ORDER: readonly string[] = [
  "flowchart",
  "sequence",
  "class",
  "state",
  "er",
  "journey",
  "gantt",
  "requirement",
  "mindmap",
  "timeline",
  "sankey",
  "xychart",
]

/** The diagram of a rule name (`flowchart-no-ignored-text`), or null for a common rule. */
function diagramOf(name: string): string | null {
  return DIAGRAM_ORDER.find((diagram) => name.startsWith(`${diagram}-`)) ?? null
}

/** The rule names by group: the common rules, then each diagram in `DIAGRAM_ORDER`, each in the order of `rules`. */
function groupsOf(): Map<string | null, string[]> {
  const groups = new Map<string | null, string[]>([
    [null, []],
    ...DIAGRAM_ORDER.map((diagram): [string, string[]] => [diagram, []]),
  ])
  for (const name of Object.keys(rules)) {
    const group = groups.get(diagramOf(name))
    if (group === undefined) {
      throw new Error(`The diagram of ${name} is not in DIAGRAM_ORDER`)
    }
    group.push(name)
  }
  return new Map([...groups].filter(([, names]) => names.length > 0))
}

/** The rule, which `rules` holds for every name it lists. */
function ruleOf(name: string): RuleDefinition {
  const rule = rules[name]
  if (rule === undefined) throw new Error(`No rule ${name}`)
  return rule
}

/**
 * The generated list of the rules, between its markers, before formatting.
 * `skeletons` are the rules that are not implemented yet.
 */
function renderList(
  docsDir: string,
  language: DocumentLanguage,
  skeletons: ReadonlySet<string>,
): string {
  const words = WORDS[language]
  const lines = [
    LIST_BEGIN,
    "",
    words.legend,
    "",
    words.suggestionsLegend,
    "",
    words.skeletonLegend,
  ]
  for (const [diagram, names] of groupsOf()) {
    lines.push("", `## ${diagram ?? words.commonRules}`, "")
    lines.push(
      `| ${words.rule} | ${words.description} | ✅ | 💡 | 🚧 |`,
      "| --- | --- | --- | --- | --- |",
    )
    for (const name of names) {
      const rule = ruleOf(name)
      const link = `[${name}](./${name}${SUFFIX[language]})`
      const recommended = isRecommended(rule) ? "✅" : ""
      const suggestions = hasSuggestions(rule) ? "💡" : ""
      const skeleton = skeletons.has(name) ? "🚧" : ""
      lines.push(
        `| ${link} | ${descriptionOf(docsDir, name, rule, language)} | ${recommended} | ${suggestions} | ${skeleton} |`,
      )
    }
  }
  lines.push("", LIST_END)
  return lines.join("\n")
}

/** The generated notice of a rule document, between its markers: whether `recommended` enables the rule, and whether it offers suggestions. */
function renderNotice(name: string, language: DocumentLanguage): string {
  const words = WORDS[language]
  const rule = ruleOf(name)
  const lines = [
    NOTICE_BEGIN,
    "",
    isRecommended(rule) ? words.enabled : words.notEnabled,
    "",
  ]
  if (hasSuggestions(rule)) lines.push(words.suggestions, "")
  lines.push(NOTICE_END)
  return lines.join("\n")
}

/**
 * The generated section of an implemented rule's document, between its
 * markers: links to the source and the test of the rule, relative to the
 * document, which is `docs/rules/<name>.md`.
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
 * the notice, which follows the first paragraph; and, for an implemented
 * rule, the resources at the end. A document without the markers of the
 * notice gets them after its first paragraph, and the document of an
 * implemented rule without the markers of the resources gets them at its end;
 * the document of a skeleton has no resources.
 */
function renderRuleDocument(
  docsDir: string,
  name: string,
  language: DocumentLanguage,
  implemented: boolean,
): string {
  const path = ruleDocumentPath(docsDir, name, language)
  const document = readFileSync(path, "utf8")
  const titleEnd = document.indexOf("\n")
  const withTitle = `# ${NAMESPACE}/${name}${document.slice(titleEnd)}`
  const notice = renderNotice(name, language)
  let withNotice: string
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
  const resources = implemented ? renderResources(name, language) : ""
  if (withNotice.includes(RESOURCES_BEGIN)) {
    return replaceBetween(
      withNotice,
      RESOURCES_BEGIN,
      RESOURCES_END,
      resources,
      path,
    )
  }
  return implemented ? `${withNotice.trimEnd()}\n\n${resources}\n` : withNotice
}

/** `text` formatted as Prettier formats the Markdown file at `path`. */
async function formatMarkdown(text: string, path: string): Promise<string> {
  const options = await resolveConfig(path)
  return format(text, { ...options, filepath: path })
}

/**
 * Every document with generated parts, by its path, as it should be: the
 * index and every rule document under `docsDir`, in both languages. Whether a
 * rule is implemented comes from its facts (see `ImplementationFacts`), with
 * its notes under `notesDir` and its test under `testsDir`; render only when
 * `mismatches` finds nothing, so that every rule is implemented or a
 * skeleton.
 */
export async function renderDocuments(
  docsDir: string = RULE_DOCS_DIR,
  notesDir: string = RULE_NOTES_DIR,
  testsDir: string = RULE_TESTS_DIR,
): Promise<Map<string, string>> {
  const skeletons = new Set(
    Object.keys(rules).filter(
      (name) =>
        implementationOf(implementationFacts(name, notesDir, testsDir)) ===
        "skeleton",
    ),
  )
  const documents = new Map<string, string>()
  for (const language of ["en", "ja"] as const) {
    const path = indexPath(docsDir, language)
    const index = replaceBetween(
      readFileSync(path, "utf8"),
      LIST_BEGIN,
      LIST_END,
      renderList(docsDir, language, skeletons),
      path,
    )
    documents.set(path, await formatMarkdown(index, path))
    for (const name of Object.keys(rules)) {
      const rulePath = ruleDocumentPath(docsDir, name, language)
      documents.set(
        rulePath,
        await formatMarkdown(
          renderRuleDocument(docsDir, name, language, !skeletons.has(name)),
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
      documents.push(...documentsUnder(docsDir, `${directory}${entry}/`))
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
 * The three facts that change together when a rule is implemented: an
 * implemented rule has messages to report with, a test under the tests
 * directory, and no notes; a skeleton has no messages, no test, and notes in
 * both languages. No one of the facts decides alone: a rule whose facts
 * disagree is neither, and `mismatches` reports it.
 */
interface ImplementationFacts {
  /** Whether `meta.messages` is not empty. */
  readonly hasMessages: boolean
  /** Whether `<name>.test.ts` is in the tests directory. */
  readonly hasTest: boolean
  /** Whether the English notes are in the notes directory. */
  readonly hasEnglishNotes: boolean
  /** Whether the Japanese notes are in the notes directory. */
  readonly hasJapaneseNotes: boolean
}

/** The facts of the rule `name`, with its notes under `notesDir` and its test under `testsDir`. */
function implementationFacts(
  name: string,
  notesDir: string,
  testsDir: string,
): ImplementationFacts {
  return {
    hasMessages: Object.keys(ruleOf(name).meta?.messages ?? {}).length > 0,
    hasTest: existsSync(`${testsDir}${name}.test.ts`),
    hasEnglishNotes: existsSync(ruleDocumentPath(notesDir, name, "en")),
    hasJapaneseNotes: existsSync(ruleDocumentPath(notesDir, name, "ja")),
  }
}

/** Whether `facts` are those of an implemented rule, of a skeleton, or of neither. */
function implementationOf(
  facts: ImplementationFacts,
): "implemented" | "skeleton" | "neither" {
  const { hasMessages, hasTest, hasEnglishNotes, hasJapaneseNotes } = facts
  if (hasMessages && hasTest && !hasEnglishNotes && !hasJapaneseNotes) {
    return "implemented"
  }
  if (!hasMessages && !hasTest && hasEnglishNotes && hasJapaneseNotes) {
    return "skeleton"
  }
  return "neither"
}

/**
 * What does not match between the rules, their documents under `docsDir`,
 * their notes under `notesDir`, and their tests under `testsDir`: a rule
 * without a document in each language, a document or notes without a rule,
 * an English document whose first paragraph is not the rule's
 * `meta.docs.description`, a Japanese document whose Mermaid code blocks are
 * not those of the English one, an example without its rule-enabling comment,
 * and a rule that is neither implemented nor a skeleton (see `ImplementationFacts`).
 */
export function mismatches(
  docsDir: string = RULE_DOCS_DIR,
  notesDir: string = RULE_NOTES_DIR,
  testsDir: string = RULE_TESTS_DIR,
): string[] {
  const problems: string[] = []
  for (const name of Object.keys(rules)) {
    const facts = implementationFacts(name, notesDir, testsDir)
    if (implementationOf(facts) === "neither") {
      problems.push(
        `The rule ${name} is neither implemented nor a skeleton: meta.messages ${facts.hasMessages ? "is not empty" : "is empty"}, ${name}.test.ts ${facts.hasTest ? "exists" : "does not exist"}, the English notes ${facts.hasEnglishNotes ? "exist" : "do not exist"}, the Japanese notes ${facts.hasJapaneseNotes ? "exist" : "do not exist"}`,
      )
    }
    for (const language of ["en", "ja"] as const) {
      const path = ruleDocumentPath(docsDir, name, language)
      if (!existsSync(path)) {
        problems.push(`The rule ${name} has no ${path}`)
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
    if (name === "index") continue
    if (!(name in rules)) {
      problems.push(
        `${ruleDocumentPath(docsDir, name, language)} is the document of no rule`,
      )
    }
  }
  if (existsSync(notesDir)) {
    for (const { name, language } of documentsUnder(notesDir)) {
      if (!(name in rules)) {
        problems.push(
          `${ruleDocumentPath(notesDir, name, language)} is the notes document of no rule`,
        )
      }
    }
  }
  return problems
}
