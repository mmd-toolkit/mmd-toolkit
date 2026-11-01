import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { expect, test } from "@playwright/test"
import { createServer } from "vite"
import type { ViteDevServer } from "vite"
import config from "../../vite.config.ts"
import { edit } from "./helpers.ts"

let server: ViteDevServer, directory: string, url: string

test.beforeAll(async () => {
  // The test rewrites implementations to trigger HMR. Use isolated copies so
  // running it never changes the developer's parser or formatter checkout.
  directory = await mkdtemp(join(tmpdir(), "mmd-playground-hmr-"))
  const packages = fileURLToPath(new URL("../../../", import.meta.url))
  await cp(join(packages, "parser/src"), join(directory, "parser"), {
    recursive: true,
  })
  await cp(
    join(packages, "prettier-plugin-mmd/src"),
    join(directory, "formatter"),
    { recursive: true },
  )
  server = await createServer({
    ...config,
    configFile: false,
    root: fileURLToPath(new URL("../..", import.meta.url)),
    resolve: {
      alias: [
        {
          find: /^prettier$/u,
          replacement: fileURLToPath(
            new URL(
              "../../node_modules/prettier/standalone.mjs",
              import.meta.url,
            ),
          ),
        },
        {
          find: /^prettier\/doc$/u,
          replacement: fileURLToPath(
            new URL("../../node_modules/prettier/doc.mjs", import.meta.url),
          ),
        },
        {
          find: /^@mmd-toolkit\/parser$/u,
          replacement: join(directory, "parser/index.ts"),
        },
        {
          find: /^prettier-plugin-mmd$/u,
          replacement: join(directory, "formatter/index.ts"),
        },
      ],
    },
    optimizeDeps: {
      ...config.optimizeDeps,
      // The copied formatter loads lazily; prepare its runtime imports before HMR.
      include: ["prettier", "prettier/doc"],
    },
    server: {
      port: 0,
      host: "127.0.0.1",
      open: false,
      fs: { allow: [packages, directory] },
    },
  })
  await server.listen()
  const address = server.httpServer?.address()
  if (!address || typeof address === "string")
    throw new Error("No HMR test server address")
  url = `http://127.0.0.1:${address.port}/mmd-toolkit/playground/`
})

test.afterAll(async () => {
  await server?.close()
  if (directory) await rm(directory, { recursive: true, force: true })
})

test("updates parser and formatter implementations without reloading or losing edits", async ({
  page,
}) => {
  await page.goto(url)
  await edit(page, "flowchart LR\nKept-->Input\n")
  await expect(page.locator(".type-badge")).toHaveText("flowchart-v2")
  // A reload could restore input from the URL and look successful. This DOM-only
  // sentinel distinguishes an actual hot update from a restored page.
  await page.evaluate(() => {
    document.documentElement.dataset.hmrSentinel = "kept"
  })
  const parserFile = join(directory, "parser/parse.ts")
  const parserText = await readFile(parserFile, "utf8")
  await writeFile(
    parserFile,
    parserText.replace(
      "return parseFlowchartDiagram(input)",
      'return { ...parseFlowchartDiagram(input), diagramType: "flowchart-elk" }',
    ),
  )
  await expect(page.locator(".type-badge")).toHaveText("flowchart-elk")
  await expect(page.locator("html")).toHaveAttribute(
    "data-hmr-sentinel",
    "kept",
  )
  await expect(page.locator(".source-pane .view-lines")).toContainText("Kept")
  await page.getByRole("tab", { name: "Formatted", exact: true }).click()
  await expect(
    page.getByRole("textbox", { name: "Formatted Mermaid", exact: true }),
  ).toBeVisible()
  const formatterFile = join(directory, "formatter/index.ts")
  const formatterText = await readFile(formatterFile, "utf8")
  await writeFile(
    formatterFile,
    formatterText.replace(
      "const plugin: Plugin<MermaidAst> = { languages, parsers, printers }",
      'const plugin: Plugin<MermaidAst> = { languages, parsers, printers: { mermaid: { ...mermaidPrinter, print: () => "%% HMR formatter" } } }',
    ),
  )
  await expect(page.locator("#panel-formatted .view-lines")).toContainText(
    "%% HMR formatter",
  )
  await expect(page.locator("html")).toHaveAttribute(
    "data-hmr-sentinel",
    "kept",
  )
  await expect(page.locator(".source-pane .view-lines")).toContainText("Kept")
})
