import { fileURLToPath } from "node:url"
import { defineConfig } from "vitepress"
import { eslintCodeTransformer } from "./eslint.js"
import { languages } from "./highlighting.js"
import {
  collectDiagrams,
  collectDocuments,
  configureDocumentMarkdown,
  documentAnchor,
  documentSourcesPlugin,
  rewritePagePath,
  ruleItems,
  sourceForPage,
  syncDocuments,
} from "./documents.js"

const repositoryRoot = fileURLToPath(new URL("../../../", import.meta.url))
const sourceDirectory = fileURLToPath(new URL("../lib/pages", import.meta.url))
const diagrams = collectDiagrams(repositoryRoot)
const documents = collectDocuments(repositoryRoot)
// Populate srcDir before VitePress discovers routes. Development changes are
// handled by documentSourcesPlugin using the same mapping and output directory.
syncDocuments(repositoryRoot, documents, sourceDirectory)

/** Links each page to its canonical document rather than its generated copy. */
function sourceLink(page) {
  return `https://github.com/mmd-toolkit/mmd-toolkit/blob/main/${page.frontmatter.sourcePath}`
}

export default defineConfig({
  title: "mmd-toolkit",
  base: "/mmd-toolkit/",
  srcDir: "lib/pages",
  outDir: "lib/site",
  cacheDir: "node_modules/.vitepress",
  rewrites: rewritePagePath,
  markdown: {
    anchor: { slugify: documentAnchor },
    languages,
    codeTransformers: [eslintCodeTransformer],
    config(md) {
      configureDocumentMarkdown(md, documents, repositoryRoot)
    },
  },
  transformPageData(page) {
    page.frontmatter.sourcePath = sourceForPage(documents, page.relativePath)
  },
  head: [
    [
      "link",
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/mmd-toolkit/mmd-toolkit.svg",
      },
    ],
  ],
  locales: {
    root: {
      label: "English",
      lang: "en",
      description:
        "Parse, format, and lint Mermaid diagram text with mmd-toolkit.",
      themeConfig: {
        editLink: { text: "View source", pattern: sourceLink },
        nav: [
          {
            text: "Formatter",
            link: "/formatter/",
          },
          {
            text: "Linter",
            link: "/linter/",
          },
          {
            text: "Parser",
            link: "/parser/",
          },
          {
            text: "Compatibility",
            link: "/reference/",
          },
          {
            text: "Playground",
            link: "https://mmd-toolkit.github.io/mmd-toolkit/playground/",
          },
        ],
        sidebar: {
          "/formatter/": [
            {
              text: "Formatter",
              items: [
                {
                  text: "Getting started",
                  link: "/formatter/",
                },
                {
                  text: "Configuration",
                  link: "/formatter/configuration",
                },
                {
                  text: "Options",
                  link: "/formatter/options",
                },
                {
                  text: "Compatibility",
                  link: "/formatter/compatibility",
                },
              ],
            },
          ],
          "/linter/": [
            {
              text: "Linter",
              items: [
                {
                  text: "Getting started",
                  link: "/linter/",
                },
                {
                  text: "Configuration",
                  link: "/linter/configuration",
                },
                {
                  text: "Markdown",
                  link: "/linter/markdown",
                },
                {
                  text: "Configuration comments",
                  link: "/linter/comments",
                },
              ],
            },
            {
              text: "Rule reference",
              items: [
                {
                  text: "All rules",
                  link: "/linter/rules/",
                },
                ...ruleItems(diagrams, documents, "root"),
              ],
            },
          ],
          "/parser/": [
            {
              text: "Parser",
              items: [
                {
                  text: "Getting started",
                  link: "/parser/",
                },
                {
                  text: "API",
                  link: "/parser/api",
                },
                {
                  text: "Traversal",
                  link: "/parser/traversal",
                },
              ],
            },
            {
              text: "Related reference",
              items: [
                {
                  text: "AST definition (GitHub)",
                  link: "https://github.com/mmd-toolkit/mmd-toolkit/blob/main/packages/spec/docs/ast.md",
                },
                {
                  text: "Token definitions (GitHub)",
                  link: "https://github.com/mmd-toolkit/mmd-toolkit/blob/main/packages/parser/docs/tokens.md",
                },
                {
                  text: "Source positions (GitHub)",
                  link: "https://github.com/mmd-toolkit/mmd-toolkit/blob/main/packages/parser/docs/positions.md",
                },
                {
                  text: "Known divergences (GitHub)",
                  link: "https://github.com/mmd-toolkit/mmd-toolkit/blob/main/packages/spec/docs/known-divergences.md",
                },
              ],
            },
          ],
          "/reference/": [
            {
              text: "Compatibility",
              items: [
                {
                  text: "Overview",
                  link: "/reference/",
                },
                {
                  text: "Diagram support",
                  link: "/reference/support",
                },
                {
                  text: "Known divergences (GitHub)",
                  link: "https://github.com/mmd-toolkit/mmd-toolkit/blob/main/packages/spec/docs/known-divergences.md",
                },
              ],
            },
          ],
        },
        outline: {
          label: "On this page",
        },
        footer: {
          message: "Third-party tools for Mermaid diagram text.",
        },
      },
    },
    ja: {
      label: "日本語",
      lang: "ja",
      description:
        "Mermaidの図のテキストを解析・整形・lintするmmd-toolkitのドキュメント。",
      themeConfig: {
        editLink: { text: "原文を見る", pattern: sourceLink },
        nav: [
          {
            text: "フォーマッター",
            link: "/ja/formatter/",
          },
          {
            text: "リンター",
            link: "/ja/linter/",
          },
          {
            text: "パーサー",
            link: "/ja/parser/",
          },
          {
            text: "互換性",
            link: "/ja/reference/",
          },
          {
            text: "Playground",
            link: "https://mmd-toolkit.github.io/mmd-toolkit/playground/",
          },
        ],
        sidebar: {
          "/ja/formatter/": [
            {
              text: "フォーマッター",
              items: [
                {
                  text: "はじめに",
                  link: "/ja/formatter/",
                },
                {
                  text: "設定",
                  link: "/ja/formatter/configuration",
                },
                {
                  text: "オプション",
                  link: "/ja/formatter/options",
                },
                {
                  text: "互換性",
                  link: "/ja/formatter/compatibility",
                },
              ],
            },
          ],
          "/ja/linter/": [
            {
              text: "リンター",
              items: [
                {
                  text: "はじめに",
                  link: "/ja/linter/",
                },
                {
                  text: "設定",
                  link: "/ja/linter/configuration",
                },
                {
                  text: "Markdown",
                  link: "/ja/linter/markdown",
                },
                {
                  text: "設定コメント",
                  link: "/ja/linter/comments",
                },
              ],
            },
            {
              text: "ルールリファレンス",
              items: [
                {
                  text: "ルール一覧",
                  link: "/ja/linter/rules/",
                },
                ...ruleItems(diagrams, documents, "ja"),
              ],
            },
          ],
          "/ja/parser/": [
            {
              text: "パーサー",
              items: [
                {
                  text: "はじめに",
                  link: "/ja/parser/",
                },
                {
                  text: "API",
                  link: "/ja/parser/api",
                },
                {
                  text: "走査",
                  link: "/ja/parser/traversal",
                },
              ],
            },
            {
              text: "関連リファレンス",
              items: [
                {
                  text: "AST定義（GitHub）",
                  link: "https://github.com/mmd-toolkit/mmd-toolkit/blob/main/packages/spec/docs/ast.ja.md",
                },
                {
                  text: "トークン定義（GitHub）",
                  link: "https://github.com/mmd-toolkit/mmd-toolkit/blob/main/packages/parser/docs/tokens.ja.md",
                },
                {
                  text: "位置情報（GitHub）",
                  link: "https://github.com/mmd-toolkit/mmd-toolkit/blob/main/packages/parser/docs/positions.ja.md",
                },
                {
                  text: "既知の差異（GitHub）",
                  link: "https://github.com/mmd-toolkit/mmd-toolkit/blob/main/packages/spec/docs/known-divergences.ja.md",
                },
              ],
            },
          ],
          "/ja/reference/": [
            {
              text: "互換性",
              items: [
                {
                  text: "概要",
                  link: "/ja/reference/",
                },
                {
                  text: "図の対応状況",
                  link: "/ja/reference/support",
                },
                {
                  text: "既知の差異（GitHub）",
                  link: "https://github.com/mmd-toolkit/mmd-toolkit/blob/main/packages/spec/docs/known-divergences.ja.md",
                },
              ],
            },
          ],
        },
        outline: {
          label: "このページの構成",
        },
        docFooter: {
          prev: "前のページ",
          next: "次のページ",
        },
        sidebarMenuLabel: "ページ一覧",
        returnToTopLabel: "ページの先頭へ",
        darkModeSwitchLabel: "テーマ",
        darkModeSwitchTitle: "ダークテーマに切り替える",
        lightModeSwitchTitle: "ライトテーマに切り替える",
        langMenuLabel: "言語を変更",
        footer: {
          message: "Mermaidの図のテキストを扱う第三者プロジェクト。",
        },
      },
    },
  },
  themeConfig: {
    /** Switches to the paired page without carrying an untranslated heading id. */
    i18nRouting(data, route, targetLocale) {
      const currentLocale = data.localeIndex.value
      const prefix = currentLocale === "root" ? "" : `${currentLocale}/`
      const page = route.data.relativePath.slice(prefix.length)
      let pagePath = `${page.slice(0, -3)}.html`
      if (page === "index.md") pagePath = ""
      else if (page.endsWith("/index.md")) pagePath = page.slice(0, -8)
      const localeRoot = targetLocale === "root" ? "/" : `/${targetLocale}/`
      return `${localeRoot}${pagePath}${route.query}`
    },
    logo: {
      src: "/mmd-toolkit.svg",
      alt: "mmd-toolkit",
    },
    search: {
      provider: "local",
      options: {
        locales: {
          ja: {
            translations: {
              button: {
                buttonText: "検索",
                buttonAriaLabel: "検索",
              },
              modal: {
                displayDetails: "詳細を表示",
                resetButtonTitle: "検索をクリア",
                backButtonTitle: "閉じる",
                noResultsText: "検索結果が見つかりません",
                footer: {
                  selectText: "選択",
                  selectKeyAriaLabel: "Enter",
                  navigateText: "移動",
                  navigateUpKeyAriaLabel: "上矢印",
                  navigateDownKeyAriaLabel: "下矢印",
                  closeText: "閉じる",
                  closeKeyAriaLabel: "Escape",
                },
              },
            },
          },
        },
      },
    },
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/mmd-toolkit/mmd-toolkit",
      },
    ],
  },
  vite: {
    // VitePress refreshes rewritten routes through Vite's unbundled hot updates.
    experimental: { bundledDev: false },
    plugins: [
      documentSourcesPlugin(
        repositoryRoot,
        diagrams,
        documents,
        sourceDirectory,
      ),
    ],
    // Both sites publish the same brand assets from one canonical directory.
    publicDir: fileURLToPath(
      new URL("../../playground/public", import.meta.url),
    ),
  },
})
