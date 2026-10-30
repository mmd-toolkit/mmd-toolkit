import { expect, test } from "@playwright/test"
import { encodeState } from "../../src/share.ts"
import { defaultSource, exampleGroups } from "../../src/examples.ts"
import { edit, savedSource, shortcut } from "./helpers.ts"

test.beforeEach(async ({ page }) => {
  await page.goto("./", { waitUntil: "domcontentloaded" })
  await expect(page.locator(".source-pane .monaco-editor")).toBeVisible()
  await expect(
    page.getByRole("textbox", {
      name: "Mermaid source",
      exact: true,
      includeHidden: true,
    }),
  ).toBeAttached()
  await expect(page.locator(".type-badge")).toHaveText("flowchart-v2")
})

test("edits, selects AST ranges, preserves source when formatting and undoes Apply", async ({
  page,
}) => {
  const input = "flowchart LR\nA-->B\n"
  await edit(page, input)
  await expect(page.locator(".type-badge")).toHaveText("flowchart-v2")
  await expect.poll(() => savedSource(page)).toBe(input)
  await page.getByRole("button", { name: "Expand body", exact: true }).click()
  await page
    .locator(".tree-value")
    .filter({ hasText: /Flowchart.*Statement/u })
    .first()
    .click()
  await expect(page.locator(".source-selection").first()).toBeVisible()
  await page.getByRole("tab", { name: "Formatted", exact: true }).click()
  await expect(
    page.getByRole("textbox", {
      name: "Formatted Mermaid",
      exact: true,
      includeHidden: true,
    }),
  ).toBeAttached()
  await expect.poll(() => savedSource(page)).toBe(input)
  await page.getByRole("button", { name: "Apply to source" }).click()
  await expect.poll(() => savedSource(page)).toBe("flowchart LR\n  A --> B\n")
  await page
    .getByRole("textbox", {
      name: "Mermaid source",
      exact: true,
      includeHidden: true,
    })
    .focus()
  await shortcut(page, "Z")
  await expect.poll(() => savedSource(page)).toBe(input)
})

test("formats automatically, follows indentation, and retains state on theme changes", async ({
  page,
}) => {
  await page.getByRole("tab", { name: "Formatted", exact: true }).click()
  await edit(page, "flowchart LR\nA-->B\n")
  await page.getByLabel("Indent", { exact: true }).selectOption("4")
  await expect(
    page.getByRole("textbox", {
      name: "Formatted Mermaid",
      exact: true,
      includeHidden: true,
    }),
  ).toBeAttached()
  await page.getByRole("button", { name: "Apply to source" }).click()
  await expect.poll(() => savedSource(page)).toBe("flowchart LR\n    A --> B\n")
  const url = page.url()
  await page.getByRole("button", { name: "Dark theme" }).click()
  await expect(page.locator("html")).toHaveClass("dark")
  await expect(
    page.getByRole("textbox", {
      name: "Formatted Mermaid",
      exact: true,
      includeHidden: true,
    }),
  ).toBeAttached()
  expect(page.url()).toBe(url)
})

test("distinguishes rejected input, including empty EOF errors", async ({
  page,
}) => {
  await edit(page, "flowchart LR\n A-->")
  await expect(
    page.getByRole("heading", { name: "Unable to parse", exact: true }),
  ).toBeVisible()
  await page.getByRole("tab", { name: "Formatted", exact: true }).click()
  await expect(
    page.getByRole("heading", { name: "Unable to format", exact: true }),
  ).toBeVisible()
  await page.getByRole("tab", { name: "AST", exact: true }).click()
  await edit(page, "")
  await expect(
    page.getByText("No diagram type detected", { exact: true }),
  ).toBeVisible()
  await expect.poll(() => savedSource(page)).toBe("")
  await page.reload()
  await expect(
    page.getByText("No diagram type detected", { exact: true }),
  ).toBeVisible()
})

test("restores Unicode and options, handles hash navigation and a damaged link", async ({
  page,
}) => {
  const state = {
    source: 'flowchart LR\n A["日本語 😀"]-->B\n',
    tabWidth: 3,
    useTabs: true,
  }
  await page.goto(`./${await encodeState(state)}`)
  await expect(page.locator(".type-badge")).toHaveText("flowchart-v2")
  await expect.poll(() => savedSource(page)).toBe(state.source)
  await page.getByRole("tab", { name: "Formatted", exact: true }).click()
  await expect(page.getByLabel("Indent", { exact: true })).toHaveValue("3")
  await expect(page.getByLabel("Use tabs")).toBeChecked()
  await page.evaluate(() => {
    window.location.hash = "#v9=bad"
  })
  await expect(
    page.getByText("Unknown shared URL version.", { exact: true }),
  ).toBeVisible()
  expect(await page.locator(".source-pane .view-lines").innerText()).toContain(
    "日本語",
  )
  const hash = await encodeState({
    source: "sequenceDiagram\n A->>B: Hi\n",
    tabWidth: 2,
    useTabs: false,
  })
  await page.evaluate((fragment) => {
    window.location.hash = fragment
  }, hash)
  await page.getByRole("tab", { name: "AST", exact: true }).click()
  await expect(page.locator(".type-badge")).toHaveText("sequence")
})

test("shares and reloads large input with a long URL", async ({ page }) => {
  const comment = Array.from({ length: 50_000 }, (_, index) =>
    index.toString(36),
  ).join(" ")
  const source = `flowchart LR\n%% ${comment}${"a".repeat(1_048_576)}\nA-->B\n`
  const hash = await encodeState({ source, tabWidth: 2, useTabs: false })
  expect(hash.length).toBeGreaterThan(65_536)
  await page.goto(`./${hash}`)
  const characterCount = `${source.length.toLocaleString("en-US")} UTF-16 units`
  await expect(page.locator(".source-pane .pane-footer")).toContainText(
    characterCount,
  )
  await expect(page.locator(".type-badge")).toHaveText("flowchart-v2")
  await page.getByRole("button", { name: "Share", exact: true }).click()
  await expect(
    page.getByLabel("Share this input", { exact: true }),
  ).toHaveValue(page.url())
  expect(await savedSource(page)).toBe(source)
  await page.reload()
  await expect(page.locator(".source-pane .pane-footer")).toContainText(
    characterCount,
  )
  await expect(page.locator(".type-badge")).toHaveText("flowchart-v2")
})

test("shows all records and JSON safely and formats YAML frontmatter", async ({
  page,
}) => {
  await edit(
    page,
    '---\ntitle:    "Hello"\n---\n%% <script>alert(1)</script>\nflowchart LR\n A-->B\n',
  )
  await expect(page.locator(".type-badge")).toHaveText("flowchart-v2")
  await page.getByLabel("AST view").selectOption("comments")
  await page.getByRole("button", { name: "Expand 0", exact: true }).click()
  await expect(
    page
      .locator(".tree-summary")
      .filter({ hasText: "<script>alert(1)</script>" }),
  ).toBeAttached()
  await page.getByLabel("AST view").selectOption("tokens")
  await expect(page.locator(".tree-scroll")).toContainText("Keyword")
  await page.getByLabel("AST view").selectOption("frontmatter")
  await expect(page.locator(".tree-scroll")).toContainText("Frontmatter")
  await page.getByLabel("AST view").selectOption("json")
  await expect(
    page.getByRole("textbox", {
      name: "AST JSON",
      exact: true,
      includeHidden: true,
    }),
  ).toBeAttached()
  await page.getByRole("tab", { name: "Formatted", exact: true }).click()
  await expect(
    page.getByRole("textbox", {
      name: "Formatted Mermaid",
      exact: true,
      includeHidden: true,
    }),
  ).toBeAttached()
  await page.getByRole("button", { name: "Apply to source" }).click()
  await expect.poll(() => savedSource(page)).toContain('title: "Hello"\n')
})

test("shares with a separate copy gesture and keyboard tabs work", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Share", exact: true }).click()
  await expect(
    page.getByLabel("Share this input", { exact: true }),
  ).toHaveValue(/#v1=/u)
  await page.getByRole("button", { name: "Copy Link", exact: true }).click()
  await expect(
    page
      .getByRole("button", { name: "Copied", exact: true })
      .or(
        page.getByText(
          "Clipboard access was denied. Select the link and copy it manually.",
          { exact: true },
        ),
      ),
  ).toBeAttached()
  await page.getByRole("tab", { name: "AST", exact: true }).focus()
  await page.keyboard.press("ArrowRight")
  await expect(
    page.getByRole("tab", { name: "Formatted", exact: true }),
  ).toBeFocused()
  await expect(
    page.getByRole("tab", { name: "Formatted", exact: true }),
  ).toHaveAttribute("aria-selected", "true")
})

test("loads examples from a cascading menu with keyboard navigation and Undo", async ({
  page,
}) => {
  const trigger = page.getByRole("button", { name: "Examples", exact: true })
  const menu = page.getByRole("menu", { name: "Examples", exact: true })
  const sequence = exampleGroups.find((group) => group.name === "Sequence")!
  const flowchart = exampleGroups.find((group) => group.name === "Flowchart")!
  const lastGroup = exampleGroups.at(-1)!

  /** Finds a diagram family without matching an item in its child menu. */
  function groupItem(name: string) {
    return menu.getByRole("menuitem", { name, exact: true })
  }

  /** Finds the separate child menu for one diagram family. */
  function childMenu(name: string) {
    return page.getByRole("menu", { name: `${name} examples`, exact: true })
  }

  await expect(menu).toBeHidden()
  await trigger.click()
  await expect(trigger).toHaveAttribute("aria-expanded", "true")
  await groupItem("Sequence").click()
  const sequenceMenu = childMenu("Sequence")
  await expect(menu).toBeVisible()
  await expect(sequenceMenu).toBeVisible()
  await expect(groupItem("Sequence")).toHaveAttribute("aria-expanded", "true")
  const sequenceItem = sequenceMenu.getByRole("menuitem", {
    name: sequence.examples[0].name,
    exact: true,
  })
  await expect(sequenceItem).toBeFocused()
  await sequenceItem.click()
  await expect(menu).toBeHidden()
  await expect(sequenceMenu).toBeHidden()
  await expect(trigger).toBeFocused()
  await expect.poll(() => savedSource(page)).toBe(sequence.examples[0].source)
  await expect(page.locator(".type-badge")).toHaveText("sequence")
  await page
    .getByRole("textbox", {
      name: "Mermaid source",
      exact: true,
      includeHidden: true,
    })
    .focus()
  await shortcut(page, "Z")
  await expect.poll(() => savedSource(page)).toBe(defaultSource)

  await trigger.click()
  await trigger.click()
  await expect(menu).toBeHidden()
  await trigger.click()
  await page.getByRole("heading", { name: "Source", exact: true }).click()
  await expect(menu).toBeHidden()

  await trigger.press("ArrowUp")
  await expect(groupItem(lastGroup.name)).toBeFocused()
  await page.keyboard.press("ArrowDown")
  await expect(groupItem("Flowchart")).toBeFocused()
  await page.keyboard.press("ArrowUp")
  await expect(groupItem(lastGroup.name)).toBeFocused()
  await page.keyboard.press("Home")
  await expect(groupItem("Flowchart")).toBeFocused()
  await page.keyboard.press("End")
  await expect(groupItem(lastGroup.name)).toBeFocused()
  await page.keyboard.press("ArrowRight")
  const lastMenu = childMenu(lastGroup.name)
  await expect(menu).toBeVisible()
  await expect(lastMenu).toBeVisible()
  await expect(lastMenu.getByRole("menuitem").first()).toBeFocused()
  await page.keyboard.press("ArrowLeft")
  await expect(lastMenu).toBeHidden()
  await expect(groupItem(lastGroup.name)).toBeFocused()
  await expect(groupItem(lastGroup.name)).toHaveAttribute(
    "aria-expanded",
    "false",
  )
  await page.keyboard.press("ArrowRight")
  await page.keyboard.press("Escape")
  await expect(lastMenu).toBeHidden()
  await expect(menu).toBeVisible()
  await expect(groupItem(lastGroup.name)).toBeFocused()
  await page.keyboard.press("Escape")
  await expect(menu).toBeHidden()
  await expect(trigger).toBeFocused()

  await trigger.press("ArrowDown")
  await expect(groupItem("Flowchart")).toBeFocused()
  await groupItem("Flowchart").hover()
  const flowchartMenu = childMenu("Flowchart")
  await expect(flowchartMenu).toBeVisible()
  await expect(groupItem("Flowchart")).toBeFocused()
  await page.keyboard.press("ArrowDown")
  await expect(flowchartMenu).toBeHidden()
  await expect(groupItem(exampleGroups[1].name)).toBeFocused()
  await page.keyboard.press("Home")
  await page.keyboard.press("Enter")
  await expect(flowchartMenu.getByRole("menuitem").first()).toBeFocused()
  await page.keyboard.press("End")
  await expect(flowchartMenu.getByRole("menuitem").last()).toBeFocused()
  await page.keyboard.press("ArrowDown")
  await expect(flowchartMenu.getByRole("menuitem").first()).toBeFocused()
  await page.keyboard.press("ArrowUp")
  await expect(flowchartMenu.getByRole("menuitem").last()).toBeFocused()
  await page.keyboard.press("Home")
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("Enter")
  await expect(menu).toBeHidden()
  await expect.poll(() => savedSource(page)).toBe(flowchart.examples[1].source)
  await trigger.press("Space")
  await expect(menu).toBeVisible()
  await page.keyboard.press("Tab")
  await expect(menu).toBeHidden()
  await expect(
    page.getByRole("button", { name: "Share", exact: true }),
  ).toBeFocused()
  await trigger.press("Enter")
  await page.keyboard.press("ArrowRight")
  await expect(flowchartMenu.getByRole("menuitem").first()).toBeFocused()
  await page.keyboard.press("Tab")
  await expect(menu).toBeHidden()
  await expect(flowchartMenu).toBeHidden()
  await expect(
    page.getByRole("button", { name: "Share", exact: true }),
  ).toBeFocused()
  await trigger.press("Enter")
  await page.keyboard.press("Shift+Tab")
  await expect(menu).toBeHidden()
  await expect(trigger).not.toBeFocused()
})

test("opens official examples beside their diagram families without scrolling the page", async ({
  page,
}) => {
  const trigger = page.getByRole("button", { name: "Examples", exact: true })
  await trigger.click()
  const menu = page.getByRole("menu", { name: "Examples", exact: true })
  await expect(menu.getByRole("menuitem")).toHaveText(
    exampleGroups.map((group) => `${group.name} ›`),
  )
  await expect(
    menu.getByRole("menuitem", { name: "Playground", exact: true }),
  ).toHaveCount(0)
  const flowchartGroup = menu.getByRole("menuitem", {
    name: "Flowchart",
    exact: true,
  })
  await expect(flowchartGroup).toHaveAttribute("aria-haspopup", "menu")
  await flowchartGroup.hover()
  const flowchartMenu = page.getByRole("menu", {
    name: "Flowchart examples",
    exact: true,
  })
  const flowcharts = exampleGroups.find((group) => group.name === "Flowchart")!
  await expect(menu).toBeVisible()
  await expect(flowchartMenu).toBeVisible()
  await expect(flowchartMenu.getByRole("menuitem")).toHaveText(
    flowcharts.examples.map((example) => example.name),
  )
  const pipeline = flowchartMenu.getByRole("menuitem", {
    name: "CI/CD Pipeline with Subgraphs",
    exact: true,
  })
  const pipelineBounds = await pipeline.boundingBox()
  expect(pipelineBounds).not.toBeNull()
  await page.mouse.move(
    pipelineBounds!.x + pipelineBounds!.width / 2,
    pipelineBounds!.y + pipelineBounds!.height / 2,
    { steps: 12 },
  )
  await expect(menu).toBeVisible()
  await expect(flowchartMenu).toBeVisible()
  await pipeline.click()
  await expect
    .poll(() => savedSource(page))
    .toBe(
      flowcharts.examples.find(
        (example) => example.name === "CI/CD Pipeline with Subgraphs",
      )!.source,
    )
  await expect(page.locator(".type-badge")).toHaveText("flowchart-v2")

  await trigger.click()
  await page.keyboard.press("End")
  const lastGroup = exampleGroups.at(-1)!
  const lastItem = menu.getByRole("menuitem", {
    name: lastGroup.name,
    exact: true,
  })
  await expect(lastItem).toBeFocused()
  await expect(lastItem).toBeInViewport()
  await lastItem.hover()
  const lastMenu = page.getByRole("menu", {
    name: `${lastGroup.name} examples`,
    exact: true,
  })
  await expect(menu).toBeVisible()
  await expect(lastMenu).toBeVisible()
  await expect
    .poll(() =>
      lastMenu.evaluate((element) => {
        const bounds = element.getBoundingClientRect()
        return (
          bounds.top >= 0 &&
          bounds.left >= 0 &&
          bounds.right <= innerWidth &&
          bounds.bottom <= innerHeight
        )
      }),
    )
    .toBe(true)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollHeight <= innerHeight,
    ),
  ).toBe(true)
  await menu.getByRole("menuitem", { name: "Pie", exact: true }).hover()
  const pieMenu = page.getByRole("menu", { name: "Pie examples", exact: true })
  await expect(lastMenu).toBeHidden()
  await expect(menu).toBeVisible()
  await expect(pieMenu).toBeVisible()
  await pieMenu
    .getByRole("menuitem", { name: "Basic Pie Chart", exact: true })
    .click()
  await expect(page.locator(".type-badge")).toHaveText("pie")
  const pieSource = exampleGroups.find((group) => group.name === "Pie")!
    .examples[0].source
  await expect.poll(() => savedSource(page)).toBe(pieSource)
  const sharedUrl = page.url()
  await page.reload()
  await expect(page.locator(".type-badge")).toHaveText("pie")
  await expect.poll(() => savedSource(page)).toBe(pieSource)
  expect(page.url()).toBe(sharedUrl)
})

test("loads only local browser assets at the Pages path", async ({ page }) => {
  const failures: string[] = []
  const errors: string[] = []
  page.on("requestfailed", (request) => failures.push(request.url()))
  page.on("pageerror", (error) => errors.push(error.message))
  const requests: string[] = []
  page.on("request", (request) => requests.push(request.url()))
  await page.reload()
  await page.getByRole("tab", { name: "Formatted", exact: true }).click()
  await expect(
    page.getByRole("textbox", {
      name: "Formatted Mermaid",
      exact: true,
      includeHidden: true,
    }),
  ).toBeAttached()
  expect(failures).toEqual([])
  expect(errors).toEqual([])
  expect(requests.some((url) => url.includes("editor.worker.start"))).toBe(true)
  expect(requests.some((url) => url.includes("wasm-"))).toBe(true)
  expect(
    requests.every((url) =>
      url.startsWith("http://localhost:4175/mmd-toolkit/playground/"),
    ),
  ).toBe(true)
})

test("Apply and Undo preserve the previous CRLF source", async ({ page }) => {
  const source = "flowchart LR\r\nA-->B\r\n"
  await page.goto(
    `./${await encodeState({ source, tabWidth: 2, useTabs: false })}`,
  )
  await expect(
    page.getByRole("textbox", {
      name: "Mermaid source",
      exact: true,
      includeHidden: true,
    }),
  ).toBeAttached()
  await expect(page.locator(".source-pane .pane-footer")).toContainText(
    "21 UTF-16 units",
  )
  await expect.poll(() => savedSource(page)).toBe(source)
  await page.getByRole("tab", { name: "Formatted", exact: true }).click()
  await expect(
    page.getByRole("textbox", {
      name: "Formatted Mermaid",
      exact: true,
      includeHidden: true,
    }),
  ).toBeAttached()
  await page.getByRole("button", { name: "Apply to source" }).click()
  await expect.poll(() => savedSource(page)).toBe("flowchart LR\n  A --> B\n")
  await page
    .getByRole("textbox", {
      name: "Mermaid source",
      exact: true,
      includeHidden: true,
    })
    .focus()
  await shortcut(page, "Z")
  await expect.poll(() => savedSource(page)).toBe(source)
})

test("discards formatting superseded while the formatter is loading", async ({
  page,
}) => {
  let release: (() => void) | undefined, requested: (() => void) | undefined
  const blocked = new Promise<void>((resolve) => {
    release = resolve
  })
  const started = new Promise<void>((resolve) => {
    requested = resolve
  })
  await page.route("**/assets/formatter-*.js", async (route) => {
    requested?.()
    await blocked
    await route.continue()
  })
  await edit(page, "flowchart LR\nOld-->Result\n")
  await page.getByRole("tab", { name: "Formatted", exact: true }).click()
  await started
  await edit(page, "flowchart LR\nNew-->Result\n")
  await page.getByLabel("Indent", { exact: true }).selectOption("4")
  release?.()
  await expect(page.locator("#panel-formatted .view-lines")).toContainText(
    "New",
  )
  await expect(page.locator("#panel-formatted .view-lines")).not.toContainText(
    "Old",
  )
  await page.getByRole("button", { name: "Apply to source" }).click()
  await expect
    .poll(() => savedSource(page))
    .toBe("flowchart LR\n    New --> Result\n")
})

test("keeps the cursor selection synchronized after reparsing", async ({
  page,
}) => {
  await edit(page, "flowchart LR\nA-->B\n")
  await expect(page.locator(".type-badge")).toHaveText("flowchart-v2")
  await page.keyboard.press("ArrowLeft")
  await page.keyboard.press("ArrowLeft")
  await expect(page.locator(".source-excerpt")).toHaveText("B")
  await page.keyboard.press("C")
  await expect(page.locator(".source-excerpt")).toHaveText("CB")
})

test("scrolls to source selections after expanding and reparsing without moving focus", async ({
  page,
}) => {
  const source = [
    "flowchart LR",
    ...Array.from({ length: 120 }, (_, index) => `A${index}-->B${index}`),
    "",
  ].join("\n")
  await page.goto(
    `./${await encodeState({ source, tabWidth: 2, useTabs: false })}`,
  )
  await expect(page.locator(".source-pane .view-lines")).toContainText("A0")
  const editor = page.getByRole("textbox", {
    name: "Mermaid source",
    exact: true,
    includeHidden: true,
  })
  await editor.focus()
  const mac = await page.evaluate(() =>
    navigator.userAgent.includes("Macintosh"),
  )
  await page.keyboard.press(mac ? "Meta+ArrowDown" : "Control+End")
  await page.keyboard.press("ArrowLeft")
  await page.keyboard.press("ArrowLeft")
  await expect(page.locator(".source-excerpt")).toHaveText("B119")

  /** Checks the actual visible row after all ancestors have been expanded. */
  async function selectedRowIsVisible(): Promise<boolean> {
    return page.locator(".tree-scroll").evaluate((container) => {
      const row = container.querySelector(".tree-row.selected")
      if (!row) return false
      const viewport = container.getBoundingClientRect()
      const bounds = row.getBoundingClientRect()
      const top = viewport.top + container.clientTop
      const bottom = top + container.clientHeight
      return bounds.top >= top - 0.5 && bounds.bottom <= bottom + 0.5
    })
  }

  await expect.poll(selectedRowIsVisible).toBe(true)
  await expect(editor).toBeFocused()
  const lowerPosition = await page
    .locator(".tree-scroll")
    .evaluate((container) => container.scrollTop)
  expect(lowerPosition).toBeGreaterThan(0)
  expect(await page.evaluate(() => window.scrollY)).toBe(0)

  await page.keyboard.press("C")
  await expect(page.locator(".source-excerpt")).toHaveText("B11C9")
  await expect.poll(selectedRowIsVisible).toBe(true)
  await expect(editor).toBeFocused()
  await page.keyboard.press(mac ? "Meta+ArrowUp" : "Control+Home")
  await page.keyboard.press("ArrowDown")
  await expect(page.locator(".source-excerpt")).toHaveText("A0")
  await expect.poll(selectedRowIsVisible).toBe(true)
  const upperPosition = await page
    .locator(".tree-scroll")
    .evaluate((container) => container.scrollTop)
  expect(upperPosition).toBeLessThan(lowerPosition)
  await page.keyboard.press("ArrowRight")
  await expect(page.locator(".source-excerpt")).toHaveText("A0")
  expect(
    await page
      .locator(".tree-scroll")
      .evaluate((container) => container.scrollTop),
  ).toBe(upperPosition)
  await expect(editor).toBeFocused()
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
})

test("follows source selections in every record view and on view changes", async ({
  page,
}) => {
  const source = [
    "---",
    'title: "😀"',
    "---",
    "%% before",
    '%%{init: {"theme":"dark"}}%%',
    "flowchart LR",
    ...Array.from({ length: 120 }, (_, index) => `A${index}-->B${index}`),
    "",
  ].join("\n")
  await page.goto(
    `./${await encodeState({ source, tabWidth: 2, useTabs: false })}`,
  )
  const editor = page.getByRole("textbox", {
    name: "Mermaid source",
    exact: true,
    includeHidden: true,
  })
  await expect(editor).toBeAttached()
  await editor.focus()
  const mac = await page.evaluate(() =>
    navigator.userAgent.includes("Macintosh"),
  )
  await page.keyboard.press(mac ? "Meta+ArrowDown" : "Control+End")
  await page.keyboard.press("ArrowLeft")
  await page.keyboard.press("ArrowLeft")
  await expect(page.locator(".source-excerpt")).toHaveText("B119")

  const view = page.getByLabel("AST view")
  const row = page.locator(".tree-row.selected")
  await view.selectOption("tokens")
  await expect(page.locator(".details-header span")).toHaveText(
    /root\.tokens\.\d+/u,
  )
  await expect(row.locator(".tree-summary")).toHaveText("Identifier")
  await expect(row).toBeInViewport({ ratio: 1 })
  expect(
    await page.locator(".tree-scroll").evaluate((element) => element.scrollTop),
  ).toBeGreaterThan(0)

  await editor.focus()
  await page.keyboard.press("C")
  await expect(page.locator(".source-excerpt")).toHaveText("B11C9")
  await expect(row.locator(".tree-summary")).toHaveText("Identifier")
  await expect(row).toBeInViewport({ ratio: 1 })
  await expect(editor).toBeFocused()

  await page.keyboard.press(mac ? "Meta+ArrowUp" : "Control+Home")
  await page.keyboard.press("ArrowDown")
  await view.selectOption("frontmatter")
  await expect(page.locator(".details-header span")).toHaveText(
    "root.frontmatter",
  )
  await expect(row.locator(".tree-summary")).toHaveText("Frontmatter")
  await expect(page.locator(".source-excerpt")).toHaveText(
    '---\ntitle: "😀"\n---',
  )
  await expect(row).toBeInViewport({ ratio: 1 })

  await view.selectOption("comments")
  await expect(row).toHaveCount(0)
  await editor.focus()
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("ArrowDown")
  await expect(page.locator(".details-header span")).toHaveText(
    "root.comments.0",
  )
  await expect(page.locator(".source-excerpt")).toHaveText("%% before")
  await expect(row.locator(".tree-summary")).toHaveText("Comment")
  await expect(row).toBeInViewport({ ratio: 1 })
  await expect(editor).toBeFocused()

  await view.selectOption("directives")
  await expect(row).toHaveCount(0)
  await editor.focus()
  await page.keyboard.press("ArrowDown")
  await expect(page.locator(".details-header span")).toHaveText(
    "root.directives.0",
  )
  await expect(page.locator(".source-excerpt")).toHaveText(
    '%%{init: {"theme":"dark"}}%%',
  )
  await expect(row.locator(".tree-summary")).toHaveText("Directive")
  await expect(row).toBeInViewport({ ratio: 1 })
  await expect(editor).toBeFocused()

  await view.selectOption("tokens")
  await expect(row.locator(".tree-summary")).toHaveText("Directive")
  await expect(row).toBeInViewport({ ratio: 1 })
  await view.selectOption("tree")
  await expect(page.locator(".details-header span")).toHaveText("root")
  await expect(row.locator(".tree-summary")).toHaveText("Root")
  await expect(row).toBeInViewport({ ratio: 1 })
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
})

test("toggles row values with mouse and keyboard while preserving selection and icon behavior", async ({
  page,
}) => {
  await edit(page, "flowchart LR\nA-->B\n")
  await page.keyboard.press("ArrowLeft")
  await page.keyboard.press("ArrowLeft")
  await expect(page.locator(".source-excerpt")).toHaveText("B")
  const row = page
    .locator(".tree-row")
    .filter({ hasText: "FlowchartVertexStatement" })
    .first()
  const value = row.locator(".tree-value")
  const icon = row.locator(".disclosure")
  await expect(value).toHaveAttribute("aria-expanded", "true")

  await value.locator(".tree-summary").click()
  await expect(value).toHaveAttribute("aria-expanded", "false")
  await expect(icon).toHaveAttribute("aria-expanded", "false")
  await expect(value).toHaveAttribute("aria-pressed", "true")
  await expect(page.locator(".details-header span")).toHaveText(
    "root.body.body.0",
  )
  await expect(page.locator(".source-excerpt")).toHaveText("A-->B")
  await expect(page.locator(".source-selection").first()).toBeVisible()
  await expect(
    page.locator(".tree-value").filter({ hasText: "FlowchartVertexGroup" }),
  ).toHaveCount(0)

  await value.click()
  await expect(value).toHaveAttribute("aria-expanded", "true")
  await expect(icon).toHaveAttribute("aria-expanded", "true")
  await expect(
    page
      .locator(".tree-value")
      .filter({ hasText: "FlowchartVertexGroup" })
      .first(),
  ).toBeVisible()
  await value.press("Enter")
  await expect(value).toHaveAttribute("aria-expanded", "false")
  await value.press("Space")
  await expect(value).toHaveAttribute("aria-expanded", "true")

  await icon.click()
  await expect(value).toHaveAttribute("aria-expanded", "false")
  await expect(value).toHaveAttribute("aria-pressed", "true")
  await icon.click()
  await expect(value).toHaveAttribute("aria-expanded", "true")

  const scalar = page.locator(".tree-value").filter({ hasText: '"Root"' })
  await scalar.click()
  expect(await scalar.getAttribute("aria-expanded")).toBeNull()
  await expect(scalar).toHaveAttribute("aria-pressed", "true")
  await expect(
    page.getByRole("button", { name: "Collapse Root", exact: true }),
  ).toBeVisible()

  await page.getByLabel("AST view").selectOption("tokens")
  const token = page.locator(".tree-row.selected .tree-value")
  await expect(token.locator(".tree-summary")).toHaveText("Identifier")
  await expect(token).toHaveAttribute("aria-expanded", "false")
  await token.click()
  await expect(token).toHaveAttribute("aria-expanded", "true")
  await expect(page.locator(".source-excerpt")).toHaveText("B")
  await token.click()
  await expect(token).toHaveAttribute("aria-expanded", "false")
  await expect(token).toHaveAttribute("aria-pressed", "true")
})

test("centers disclosure arrows in both expanded and collapsed rows", async ({
  page,
}) => {
  await page.setViewportSize({ width: 347, height: 718 })
  const root = page.getByRole("button", { name: "Collapse Root", exact: true })

  /** Measures the painted path, not just the icon's surrounding box. */
  async function arrowPosition(): Promise<{
    horizontalOffset: number
    verticalOffset: number
  }> {
    return page
      .locator(".disclosure")
      .first()
      .evaluate((button) => {
        const icon = button.querySelector("polyline")?.getBoundingClientRect()
        if (!icon) throw new Error("No disclosure arrow")
        const box = button.getBoundingClientRect()
        const row = button.parentElement?.getBoundingClientRect()
        if (!row) throw new Error("No disclosure row")
        return {
          horizontalOffset:
            icon.left + icon.width / 2 - (box.left + box.width / 2),
          verticalOffset:
            icon.top + icon.height / 2 - (row.top + row.height / 2),
        }
      })
  }

  const expanded = await arrowPosition()
  expect(Math.abs(expanded.horizontalOffset)).toBeLessThan(0.5)
  expect(Math.abs(expanded.verticalOffset)).toBeLessThan(0.5)
  await root.click()
  await expect(
    page.getByRole("button", { name: "Expand Root", exact: true }),
  ).toBeVisible()
  const collapsed = await arrowPosition()
  expect(Math.abs(collapsed.horizontalOffset)).toBeLessThan(0.5)
  expect(Math.abs(collapsed.verticalOffset)).toBeLessThan(0.5)
  await page.getByRole("button", { name: "Expand Root", exact: true }).click()
  await expect(root).toBeVisible()
  expect(await arrowPosition()).toEqual(expanded)
})

test("keeps the workspace and tree details inside the viewport", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Expand body", exact: true }).click()
  await page
    .getByRole("button", { name: "Expand 0", exact: true })
    .first()
    .click()
  const statement = page
    .locator(".tree-value")
    .filter({ hasText: "FlowchartVertexStatement" })
    .first()
  await statement.click()
  await expect(page.locator(".selection-details")).toBeVisible()
  await page.getByRole("button", { name: "Share", exact: true }).click()
  await expect(
    page.getByLabel("Share this input", { exact: true }),
  ).toHaveValue(/#v1=/u)
  await page.getByRole("button", { name: "Examples", exact: true }).click()
  await expect(
    page.getByRole("menu", { name: "Examples", exact: true }),
  ).toBeVisible()

  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1280, height: 720 },
    { width: 1024, height: 600 },
    { width: 820, height: 720 },
    { width: 501, height: 740 },
    { width: 390, height: 740 },
    { width: 320, height: 640 },
  ]) {
    await page.setViewportSize(viewport)
    await expect
      .poll(() =>
        page.evaluate(() => {
          const documentFits =
            document.documentElement.scrollWidth <= innerWidth &&
            document.documentElement.scrollHeight <= innerHeight
          const elements = document.querySelectorAll(
            ".app-header,.header-actions,.github-link,#examples,.examples-menu,.share-button,.snb-shine-and-bright-switch,.pane,.pane-footer,.tree-scroll,.selection-details,.details-header,.details-body,.share-panel",
          )
          const regionsFit = [...elements].every((element) => {
            const box = element.getBoundingClientRect()
            return (
              box.width > 0 &&
              box.height > 0 &&
              box.left >= 0 &&
              box.top >= 0 &&
              box.right <= innerWidth &&
              box.bottom <= innerHeight
            )
          })
          const details = document.querySelector(".details-body")
          return {
            documentFits,
            regionsFit,
            detailsScroll: Boolean(
              details && details.scrollHeight > details.clientHeight,
            ),
          }
        }),
      )
      .toEqual({ documentFits: true, regionsFit: true, detailsScroll: true })
    const text = statement.locator(".tree-summary")
    await expect(text).toHaveText("FlowchartVertexStatement")
    await expect(text).toHaveAttribute("title", "FlowchartVertexStatement")
  }
  await page.getByRole("button", { name: "Examples", exact: true }).click()
  await page.getByRole("tab", { name: "Formatted", exact: true }).click()
  await expect(page.locator("#panel-formatted .monaco-editor")).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Apply to source" }),
  ).toBeVisible()
})
