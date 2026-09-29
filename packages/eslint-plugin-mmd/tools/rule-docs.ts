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
const NAMESPACE = "mmd"

/** The languages of the documents: English, and Japanese in `<name>.ja.md`. */
export type DocumentLanguage = "en" | "ja"

/** The directory of the rule documents. */
export const RULE_DOCS_DIR: string = fileURLToPath(
  new URL("../docs/rules/", import.meta.url),
)

/** The suffix of a document in each language. */
const SUFFIX: Record<DocumentLanguage, string> = { en: ".md", ja: ".ja.md" }

/** The markers around the generated list of the rules in the index. */
const LIST_BEGIN = "<!-- begin auto-generated rules list -->"
const LIST_END = "<!-- end auto-generated rules list -->"

/** The markers around the generated notice of a rule document. */
const NOTICE_BEGIN = "<!-- begin auto-generated rule notice -->"
const NOTICE_END = "<!-- end auto-generated rule notice -->"

/** The words of the generated parts, in each language. */
const WORDS: Record<
  DocumentLanguage,
  {
    readonly commonRules: string
    readonly rule: string
    readonly description: string
    readonly legend: string
    readonly enabled: string
    readonly notEnabled: string
  }
> = {
  en: {
    commonRules: "Common rules",
    rule: "Rule",
    description: "Description",
    legend: "✅ The `recommended` configuration enables the rule.",
    enabled: "✅ The `recommended` configuration enables this rule.",
    notEnabled: "The `recommended` configuration does not enable this rule.",
  },
  ja: {
    commonRules: "共通の規則",
    rule: "規則",
    description: "説明",
    legend: "✅ は、`recommended` の設定が有効にする規則。",
    enabled: "✅ `recommended` の設定は、この規則を有効にする。",
    notEnabled: "`recommended` の設定は、この規則を有効にしない。",
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

/** The diagram of a rule name (`flowchart/no-ignored-text`), or null for a common rule. */
function diagramOf(name: string): string | null {
  const slash = name.indexOf("/")
  return slash === -1 ? null : name.slice(0, slash)
}

/** The rule names by group: the common rules, then each diagram, in the order of `rules`. */
function groupsOf(): Map<string | null, string[]> {
  const groups = new Map<string | null, string[]>([[null, []]])
  for (const name of Object.keys(rules)) {
    const diagram = diagramOf(name)
    const group = groups.get(diagram) ?? []
    group.push(name)
    groups.set(diagram, group)
  }
  return groups
}

/** The rule, which `rules` holds for every name it lists. */
function ruleOf(name: string): RuleDefinition {
  const rule = rules[name]
  if (rule === undefined) throw new Error(`No rule ${name}`)
  return rule
}

/** The generated list of the rules, between its markers, before formatting. */
function renderList(docsDir: string, language: DocumentLanguage): string {
  const words = WORDS[language]
  const lines = [LIST_BEGIN, "", words.legend]
  for (const [diagram, names] of groupsOf()) {
    lines.push("", `## ${diagram ?? words.commonRules}`, "")
    lines.push(
      `| ${words.rule} | ${words.description} | ✅ |`,
      "| --- | --- | --- |",
    )
    for (const name of names) {
      const rule = ruleOf(name)
      const shortName = name.slice(name.indexOf("/") + 1)
      const link = `[${shortName}](./${name}${SUFFIX[language]})`
      const mark = isRecommended(rule) ? "✅" : ""
      lines.push(
        `| ${link} | ${descriptionOf(docsDir, name, rule, language)} | ${mark} |`,
      )
    }
  }
  lines.push("", LIST_END)
  return lines.join("\n")
}

/** The generated notice of a rule document, between its markers. */
function renderNotice(name: string, language: DocumentLanguage): string {
  const words = WORDS[language]
  const notice = isRecommended(ruleOf(name)) ? words.enabled : words.notEnabled
  return [NOTICE_BEGIN, "", notice, "", NOTICE_END].join("\n")
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
 * A rule document with its generated parts: the title, which is the rule id,
 * and the notice, which follows the first paragraph. A document without the
 * markers of the notice gets them after its first paragraph.
 */
function renderRuleDocument(
  docsDir: string,
  name: string,
  language: DocumentLanguage,
): string {
  const path = ruleDocumentPath(docsDir, name, language)
  const document = readFileSync(path, "utf8")
  const titleEnd = document.indexOf("\n")
  const withTitle = `# ${NAMESPACE}/${name}${document.slice(titleEnd)}`
  const notice = renderNotice(name, language)
  if (withTitle.includes(NOTICE_BEGIN)) {
    return replaceBetween(withTitle, NOTICE_BEGIN, NOTICE_END, notice, path)
  }
  const paragraph = firstParagraph(withTitle)
  const paragraphEnd = withTitle.indexOf(paragraph) + paragraph.length
  return `${withTitle.slice(0, paragraphEnd)}\n\n${notice}${withTitle.slice(paragraphEnd)}`
}

/** `text` formatted as Prettier formats the Markdown file at `path`. */
async function formatMarkdown(text: string, path: string): Promise<string> {
  const options = await resolveConfig(path)
  return format(text, { ...options, filepath: path })
}

/**
 * Every document with generated parts, by its path, as it should be: the
 * index and every rule document under `docsDir`, in both languages.
 */
export async function renderDocuments(
  docsDir: string = RULE_DOCS_DIR,
): Promise<Map<string, string>> {
  const documents = new Map<string, string>()
  for (const language of ["en", "ja"] as const) {
    const path = indexPath(docsDir, language)
    const index = replaceBetween(
      readFileSync(path, "utf8"),
      LIST_BEGIN,
      LIST_END,
      renderList(docsDir, language),
      path,
    )
    documents.set(path, await formatMarkdown(index, path))
    for (const name of Object.keys(rules)) {
      const rulePath = ruleDocumentPath(docsDir, name, language)
      documents.set(
        rulePath,
        await formatMarkdown(
          renderRuleDocument(docsDir, name, language),
          rulePath,
        ),
      )
    }
  }
  return documents
}

/** The rule documents under `docsDir`, by the rule name and language they are for. */
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
    if (name === "index") continue
    documents.push({ name, language })
  }
  return documents
}

/**
 * What does not match between the rules and their documents under `docsDir`:
 * a rule without a document in each language, a document without a rule, and
 * an English document whose first paragraph is not the rule's
 * `meta.docs.description`.
 */
export function mismatches(docsDir: string = RULE_DOCS_DIR): string[] {
  const problems: string[] = []
  for (const name of Object.keys(rules)) {
    for (const language of ["en", "ja"] as const) {
      const path = ruleDocumentPath(docsDir, name, language)
      if (!existsSync(path)) problems.push(`The rule ${name} has no ${path}`)
    }
    const englishPath = ruleDocumentPath(docsDir, name, "en")
    if (!existsSync(englishPath)) continue
    const description = ruleOf(name).meta?.docs?.description
    const paragraph = oneLine(firstParagraph(readFileSync(englishPath, "utf8")))
    if (paragraph !== description) {
      problems.push(
        `The first paragraph of ${englishPath} is not the meta.docs.description of the rule ${name}`,
      )
    }
  }
  for (const { name, language } of documentsUnder(docsDir)) {
    if (!(name in rules)) {
      problems.push(
        `${ruleDocumentPath(docsDir, name, language)} is the document of no rule`,
      )
    }
  }
  return problems
}
