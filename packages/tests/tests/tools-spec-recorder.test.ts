import { execFile } from "node:child_process"
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { promisify } from "node:util"
import mermaid from "mermaid"
import { afterAll, describe, expect, it } from "vitest"
import type { SpecFileRecording } from "../../../tools/src/spec-recorder.ts"
import { REQUIREMENT_DB_TABLES } from "../../../tools/src/spec-recorder.ts"

/**
 * The recorder runs in a process of its own (see the driver), since it finds
 * the line of a call by the stack trace of Node.js's own `import()`.
 */
const DRIVER = fileURLToPath(
  new URL("./tools-spec-recorder-driver.ts", import.meta.url),
)

/** What the driver prints. */
interface DriverResult {
  readonly recording?: SpecFileRecording
  readonly error?: string
  readonly globalsLeft: readonly string[]
}

/** Runs the recorder on `file` of `checkout` and returns what it did. */
async function runRecorder(
  checkout: Checkout,
  file: string,
): Promise<DriverResult> {
  const { stdout } = await promisify(execFile)(process.execPath, [
    DRIVER,
    file,
    checkout.mermaidSource,
    checkout.workDir,
  ])
  return JSON.parse(stdout) as DriverResult
}

/** Runs the recorder and returns its recording, or throws the error it threw. */
async function recordFile(
  checkout: Checkout,
  file: string,
): Promise<SpecFileRecording> {
  const { recording, error } = await runRecorder(checkout, file)
  if (error !== undefined) throw new Error(error)
  if (recording === undefined) throw new Error("the driver printed no result")
  return recording
}

/** The directory that stands for `packages/mermaid/src` of a checkout. */
const roots: string[] = []

afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true })
})

/** A throwaway directory that the tests of this file remove at the end. */
function makeRoot(): string {
  const root = mkdtempSync(path.join(tmpdir(), "mmd-spec-recorder-"))
  roots.push(root)
  return root
}

/**
 * Where a test file of the checkout is, and the directory the recorder works
 * in.
 */
interface Checkout {
  readonly mermaidSource: string
  readonly workDir: string
}

/** A checkout with an empty `workDir`. */
function makeCheckout(): Checkout {
  const root = makeRoot()
  const mermaidSource = path.join(root, "src")
  const workDir = path.join(root, "work")
  mkdirSync(mermaidSource)
  mkdirSync(workDir)
  return { mermaidSource, workDir }
}

/** Writes `source` as the file `relative` of the checkout and returns its path. */
function writeTestFile(
  checkout: Checkout,
  relative: string,
  source: string,
): string {
  const file = path.join(checkout.mermaidSource, relative)
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, source)
  return file
}

/** Records a test file of `relative` in the flowchart parser's directory. */
function recordSource(
  source: string,
  relative = "diagrams/flowchart/parser/example.spec.js",
): Promise<SpecFileRecording> {
  const checkout = makeCheckout()
  const file = writeTestFile(checkout, relative, source)
  return recordFile(checkout, file)
}

/** The texts of a recording, in the order they were passed. */
function textsOf(recording: SpecFileRecording): string[] {
  return recording.inputs.map((input) => input.text)
}

/** The import of the flowchart parser that most test files start with. */
const FLOW_PARSER_IMPORT = `import flowParser from "./flowParser.ts"\n`

describe("recordSpecFile: what is recorded", () => {
  it("records awaited treeView adapter calls without running its parser", async () => {
    const recording = await recordSource(
      [
        'import { it } from "vitest";',
        'import { parser } from "./parser.js";',
        'import db from "./db.js";',
        'it("adapter", async () => {',
        "db.clear();",
        'await parser.parse("treeView-beta\\nroot");',
        'await parser.parse("treeView-beta\\nroot/\\n child");',
        "});",
      ].join("\n"),
      "diagrams/treeView/example.spec.ts",
    )
    expect(recording.failures).toEqual([])
    expect(textsOf(recording)).toEqual([
      "treeView-beta\nroot",
      "treeView-beta\nroot/\n child",
    ])
    expect(recording.inputs.map((input) => input.line)).toEqual([6, 7])
  })

  it("records the treeView preprocessing boundary without rewriting text", async () => {
    const recording = await recordSource(
      [
        'import { it } from "vitest";',
        'import { isBoxDrawingFormat, preprocessBoxDrawing, remapErrorLines } from "./boxDrawingPreprocessor.js";',
        'it("preprocessing", () => {',
        'isBoxDrawingFormat(["plain"]);',
        'const result = preprocessBoxDrawing("treeView-beta\\n├── child");',
        'result.text.split("\\n");',
        "result.lineMap.get(1);",
        'remapErrorLines("line 2", new Map());',
        "});",
      ].join("\n"),
      "diagrams/treeView/example.spec.ts",
    )
    expect(recording.failures).toEqual([])
    expect(recording.inputs).toEqual([
      { text: "treeView-beta\n├── child", line: 5, test: "preprocessing" },
    ])
  })

  it("records treeView parser-package service calls", async () => {
    const recording = await recordSource(
      [
        'import { it } from "vitest";',
        'import { createTreeViewServices } from "../src/language/treeView/module.js";',
        "const parser = createTreeViewServices().TreeView.parser.LangiumParser;",
        'it("grammar", () => {',
        'parser.parse("treeView-beta");',
        'parser.parse("treeView-beta broken");',
        "});",
      ].join("\n"),
      "../../parser/tests/treeView.test.ts",
    )
    expect(recording.failures).toEqual([])
    expect(recording.inputs.map((input) => input.line)).toEqual([5, 6])
    expect(textsOf(recording)).toEqual([
      "treeView-beta",
      "treeView-beta broken",
    ])
  })

  it("records awaited eventmodeling adapter calls", async () => {
    const recording = await recordSource(
      [
        'import { it, expect } from "vitest";',
        'import { parser } from "./parser.js";',
        'import { db } from "./db.js";',
        'it("adapter", async () => {',
        "db.clear();",
        'await expect(parser.parse("eventmodeling")).resolves.not.toThrow();',
        'await parser.parse("eventmodeling tf 01 evt A");',
        "});",
      ].join("\n"),
      "diagrams/eventmodeling/example.spec.ts",
    )
    expect(recording.failures).toEqual([])
    expect(recording.inputs).toEqual([
      { text: "eventmodeling", line: 6, test: "adapter" },
      { text: "eventmodeling tf 01 evt A", line: 7, test: "adapter" },
    ])
  })

  it("records eventmodeling parser-package helpers without invoking validators", async () => {
    const recording = await recordSource(
      [
        'import { it } from "vitest";',
        'import { eventModelingParse as parse } from "./test-util.js";',
        'import { EventModelingValidator, registerValidationChecks } from "../src/language/eventmodeling/event-modeling-validator.js";',
        'it("grammar", () => {',
        "registerValidationChecks({});",
        "new EventModelingValidator().checkSourceFrameTypes({}, () => {});",
        'parse("eventmodeling tf 01 evt A");',
        'parse("eventmodeling broken");',
        "});",
      ].join("\n"),
      "../../parser/tests/eventmodeling.test.ts",
    )
    expect(recording.failures).toEqual([])
    expect(recording.inputs).toEqual([
      { text: "eventmodeling tf 01 evt A", line: 7, test: "grammar" },
      { text: "eventmodeling broken", line: 8, test: "grammar" },
    ])
  })

  it("records all four railroad adapters asynchronously", async () => {
    const recording = await recordSource(
      [
        'import { it, expect } from "vitest";',
        'import { parser as ir } from "./railroadParser.js";',
        'import { parser as ebnf } from "./ebnfParser.js";',
        'import { parser as abnf } from "./abnfParser.js";',
        'import { parser as peg } from "./pegParser.js";',
        'import { db } from "../railroadDb.js";',
        'it("dialects", async () => {',
        'await expect(ir.parse("railroad-beta")).resolves.not.toThrow();',
        'await ebnf.parse("railroad-ebnf-beta");',
        'await abnf.parse("railroad-abnf-beta");',
        'await peg.parse("railroad-peg-beta");',
        'expect(db.getRules()[0].definition.type).toBe("terminal");',
        "});",
      ].join("\n"),
      "diagrams/railroad/parser/example.spec.ts",
    )
    expect(recording.failures).toEqual([])
    expect(recording.inputs).toEqual([
      { text: "railroad-beta", line: 8, test: "dialects" },
      { text: "railroad-ebnf-beta", line: 9, test: "dialects" },
      { text: "railroad-abnf-beta", line: 10, test: "dialects" },
      { text: "railroad-peg-beta", line: 11, test: "dialects" },
    ])
  })

  it("records awaited Wardley diagram parser calls without reading builder state", async () => {
    const recording = await recordSource(
      [
        'import { it, beforeEach, expect } from "vitest";',
        'import { diagram } from "./wardleyDiagram.js";',
        "const { parser, db } = diagram;",
        "beforeEach(() => { parser.parser.yy = db; db.clear(); });",
        'it("Wardley", async () => {',
        'await parser.parse("wardley-beta");',
        "expect(db.getWardleyData().nodes).toHaveLength(0);",
        'await parser.parse("wardley-beta broken");',
        "});",
      ].join("\n"),
      "diagrams/wardley/wardleyParser.spec.ts",
    )
    expect(recording.failures).toEqual([])
    expect(recording.inputs).toEqual([
      { text: "wardley-beta", line: 6, test: "Wardley" },
      { text: "wardley-beta broken", line: 8, test: "Wardley" },
    ])
  })

  it("records railroad's direct service and public parser-package calls", async () => {
    const recording = await recordSource(
      [
        'import { it, expect } from "vitest";',
        'import { createRailroadServices } from "../src/language/railroad/module.js";',
        'import { parse } from "../src/parse.js";',
        "const parser = createRailroadServices().Railroad.parser.LangiumParser;",
        'it("service", async () => {',
        'const result = parser.parse("railroad-beta");',
        'expect(result.value.rules[0].definition.$type).toBe("RailroadTerminalExpr");',
        'await expect(parse("railroad", "railroad-beta broken")).rejects.toThrow();',
        "});",
      ].join("\n"),
      "../../parser/tests/railroad.test.ts",
    )
    expect(recording.failures).toEqual([])
    expect(recording.inputs).toEqual([
      { text: "railroad-beta", line: 6, test: "service" },
      { text: "railroad-beta broken", line: 8, test: "service" },
    ])
  })

  it("records railroad drawing inputs and restores its empty DOM stand-ins", async () => {
    const recording = await recordSource(
      [
        'import { it, beforeEach, expect } from "vitest";',
        'import { parser } from "./parser/railroadParser.js";',
        'import { renderer } from "./railroadRenderer.js";',
        "beforeEach(() => {",
        'document.body.innerHTML = "<svg/>";',
        'Object.defineProperty(SVGElement.prototype, "getBBox", {value: () => ({width: 1}), configurable: true});',
        "});",
        'it("draw", () => {',
        'void parser.parse("railroad-beta");',
        'renderer.draw("railroad-beta", "id", "version", {});',
        'const svg = document.getElementById("id");',
        'if (!svg) throw new Error("missing svg");',
        'const viewBox = svg.getAttribute("viewBox");',
        'if (!viewBox) throw new Error("missing viewBox");',
        'expect(viewBox.split(" ").map(Number)).toHaveLength(4);',
        'expect([...document.querySelectorAll("path")]).toEqual([]);',
        "});",
      ].join("\n"),
      "diagrams/railroad/railroadRenderer.spec.ts",
    )
    expect(recording.failures).toEqual([])
    expect(recording.inputs).toEqual([
      { text: "railroad-beta", line: 9, test: "draw" },
    ])
    expect(Object.hasOwn(globalThis, "SVGElement")).toBe(false)
    expect(Object.hasOwn(globalThis, "document")).toBe(false)
  })

  it("records treemap's directly constructed parser service", async () => {
    const checkout = makeCheckout()
    const file = writeTestFile(
      checkout,
      "../../parser/tests/treemap.test.ts",
      [
        'import { it, expect } from "vitest";',
        'import { createTreemapServices } from "../src/language/treemap/module.js";',
        'import { expectNoErrorsOrAlternatives } from "./test-util.js";',
        "const parser = createTreemapServices().Treemap.parser.LangiumParser;",
        "it('service', () => {",
        'const result = parser.parse("treemap");',
        "expectNoErrorsOrAlternatives(result);",
        'expect(result.value.$type).toBe("Treemap");',
        'parser.parse("treemap\\nclass myNode myClass;");',
        "});",
      ].join("\n"),
    )
    const recording = await recordFile(checkout, file)
    expect(recording.failures).toEqual([])
    expect(recording.inputs).toEqual([
      { text: "treemap", line: 6, test: "service" },
      { text: "treemap\nclass myNode myClass;", line: 9, test: "service" },
    ])
  })

  it("records radar adapter and both parser-package parse signatures", async () => {
    const root = makeRoot()
    const checkout = {
      mermaidSource: path.join(root, "packages/mermaid/src"),
      workDir: path.join(root, "work"),
    }
    mkdirSync(checkout.mermaidSource, { recursive: true })
    mkdirSync(checkout.workDir)
    const adapter = writeTestFile(
      checkout,
      "diagrams/radar/radar.spec.ts",
      [
        'import { it, expect } from "vitest";',
        'import { parser } from "./parser.js";',
        'import { db } from "./db.js";',
        'import { relativeRadius, closedRoundCurve } from "./renderer.js";',
        'it("adapter", async () => {',
        'await expect(parser.parse("radar-beta")).resolves.not.toThrow();',
        'await parser.parse("radar-beta:");',
        "expect(db.getAxes()).toEqual([]);",
        "expect(relativeRadius(1, 0, 2, 3)).toBe(1.5);",
        'expect(closedRoundCurve([], 0)).toBe("");',
        "});",
      ].join("\n"),
    )
    const adapted = await recordFile(checkout, adapter)
    expect(adapted.failures).toEqual([])
    expect(adapted.inputs).toEqual([
      { text: "radar-beta", line: 6, test: "adapter" },
      { text: "radar-beta:", line: 7, test: "adapter" },
    ])
    const grammar = writeTestFile(
      checkout,
      "../../parser/tests/radar.test.ts",
      [
        'import { it, expect } from "vitest";',
        'import { Radar } from "../src/language/index.js";',
        'import { radarParse as parse } from "./test-util.js";',
        'import { parse as parseAsync, MermaidParseError } from "../src/parse.js";',
        'it("grammar", async () => {',
        'const result = parse("radar-beta axis A");',
        "expect(result.value.$type).toBe(Radar.$type);",
        'await parseAsync("radar", "radar-beta curve c{1}");',
        "void MermaidParseError;",
        "});",
      ].join("\n"),
    )
    const parsed = await recordFile(checkout, grammar)
    expect(parsed.failures).toEqual([])
    expect(parsed.inputs).toEqual([
      { text: "radar-beta axis A", line: 6, test: "grammar" },
      { text: "radar-beta curve c{1}", line: 8, test: "grammar" },
    ])
  })

  it("records architecture adapters and parser-package specs with suite options", async () => {
    const root = makeRoot()
    const checkout = {
      mermaidSource: path.join(root, "packages/mermaid/src"),
      workDir: path.join(root, "work"),
    }
    mkdirSync(checkout.mermaidSource, { recursive: true })
    mkdirSync(checkout.workDir)
    const adapter = writeTestFile(
      checkout,
      "diagrams/architecture/architecture.spec.ts",
      [
        'import { describe, it, assert } from "vitest";',
        'import { parser } from "./architectureParser.js";',
        'describe("architecture", { timeout: 15000 }, () => {',
        'it("two", async () => {',
        "assert(parser.parser); parser.parser.yy = {};",
        'await parser.parse("architecture-beta");',
        'await parser.parse("architecture");',
        "});",
        "});",
      ].join("\n"),
    )
    const recorded = await recordFile(checkout, adapter)
    expect(recorded.failures).toEqual([])
    expect(recorded.inputs.map(({ text, line }) => ({ text, line }))).toEqual([
      { text: "architecture-beta", line: 6 },
      { text: "architecture", line: 7 },
    ])
    const grammar = writeTestFile(
      checkout,
      "../../parser/tests/architecture.test.ts",
      [
        'import { it } from "vitest";',
        'import { Architecture } from "../src/language/index.js";',
        'import { architectureParse as parse, expectNoErrorsOrAlternatives } from "./test-util.js";',
        'it("grammar", () => {',
        'const result = parse("architecture-beta service api");',
        "expectNoErrorsOrAlternatives(result);",
        "void Architecture.$type;",
        "});",
      ].join("\n"),
    )
    const parsed = await recordFile(checkout, grammar)
    expect(parsed.failures).toEqual([])
    expect(parsed.inputs).toEqual([
      { text: "architecture-beta service api", line: 5, test: "grammar" },
    ])
    expect(readdirSync(checkout.workDir)).toContain(
      encodeURIComponent("../../parser/tests/architecture.test.ts"),
    )
  })

  it("records all Langium parser-package helpers before AST assertions", async () => {
    const root = makeRoot()
    const checkout = {
      mermaidSource: path.join(root, "packages/mermaid/src"),
      workDir: path.join(root, "work"),
    }
    mkdirSync(checkout.mermaidSource, { recursive: true })
    mkdirSync(checkout.workDir)
    const file = writeTestFile(
      checkout,
      "../../parser/tests/example.test.ts",
      [
        'import { it, expect } from "vitest";',
        'import { Pie, Info, Packet } from "../src/language/index.js";',
        'import { pieParse, gitGraphParse, infoParse, packetParse, expectNoErrorsOrAlternatives } from "./test-util.js";',
        'it("grammar", () => {',
        'const pie = pieParse("pie showData");',
        "expectNoErrorsOrAlternatives(pie); expect(pie.value.$type).toBe(Pie.$type);",
        "const git = gitGraphParse('gitGraph\\ncommit id:\"1\"');",
        "expect(git.value.statements[0].id).toBe('1');",
        'const info = infoParse("info showInfo");',
        "expect(info.value.$type).toBe(Info.$type);",
        'const packet = packetParse("packet-beta");',
        "expect(packet.value.$type).toBe(Packet.$type);",
        "});",
      ].join("\n"),
    )
    const recorded = await recordFile(checkout, file)
    expect(recorded.failures).toEqual([])
    expect(recorded.inputs).toEqual([
      { text: "pie showData", line: 5, test: "grammar" },
      { text: 'gitGraph\ncommit id:"1"', line: 7, test: "grammar" },
      { text: "info showInfo", line: 9, test: "grammar" },
      { text: "packet-beta", line: 11, test: "grammar" },
    ])
  })

  it("records awaited packet parser calls without executing Langium", async () => {
    const recording = await recordSource(
      [
        'import { PacketDB } from "./db.js"',
        'import { parser } from "./parser.js"',
        'it("two", async () => {',
        "  if (parser.parser) parser.parser.yy = new PacketDB()",
        '  await parser.parse("packet")',
        "  await parser.parse('packet\\n0: \"A\"')",
        "})",
      ].join("\n"),
      "diagrams/packet/packet.spec.ts",
    )
    expect(recording.failures).toEqual([])
    expect(textsOf(recording)).toEqual(["packet", 'packet\n0: "A"'])
    expect(recording.inputs.map(({ line }) => line)).toEqual([5, 6])
  })

  it("records awaited info parser calls without executing Langium", async () => {
    const recording = await recordSource(
      [
        'import { parser } from "./infoParser.js"',
        'it("two", async () => {',
        '  await parser.parse("info")',
        '  await parser.parse("info showInfo")',
        "})",
      ].join("\n"),
      "diagrams/info/info.spec.ts",
    )
    expect(recording.failures).toEqual([])
    expect(textsOf(recording)).toEqual(["info", "info showInfo"])
    expect(recording.inputs.map(({ line }) => line)).toEqual([3, 4])
  })

  it("records awaited gitgraph parser calls without executing Langium", async () => {
    const recording = await recordSource(
      [
        'import { parser } from "./gitGraphParser.js"',
        'import { db } from "./gitGraphAst.js"',
        "beforeEach(() => db.clear())",
        'it("two", async () => {',
        '  await parser.parse("gitGraph\\ncommit\\n")',
        '  await parser.parse("gitGraph\\nbranch b\\n")',
        "})",
      ].join("\n"),
      "diagrams/git/gitGraph.spec.ts",
    )
    expect(recording.failures).toEqual([])
    expect(textsOf(recording)).toEqual([
      "gitGraph\ncommit\n",
      "gitGraph\nbranch b\n",
    ])
    expect(recording.inputs.map(({ line }) => line)).toEqual([5, 6])
  })

  it("records pie parser calls before drawing assertions and restores the drawing global", async () => {
    const checkout = makeCheckout()
    const file = writeTestFile(
      checkout,
      "diagrams/pie/pieRenderer.spec.ts",
      [
        'import { parser } from "./pieParser.js"',
        'import { db } from "./pieDb.js"',
        'import { draw } from "./pieRenderer.js"',
        'beforeEach(() => { document.body.innerHTML = "<svg></svg>"; db.clear() })',
        'it("slices", async () => {',
        '  const text = "pie\\n\\"A\\":1"',
        "  await parser.parse(text)",
        '  await draw(text, "id", "1", { db })',
        '  const slices = [...document.querySelectorAll(".pieCircle")]',
        '  expect(slices.map(el => el.__data__.data.label)).toEqual(["A"])',
        "})",
        "",
      ].join("\n"),
    )
    expect(await runRecorder(checkout, file)).toEqual({
      recording: {
        inputs: [{ text: 'pie\n"A":1', line: 7, test: "slices" }],
        tests: 1,
        failures: [],
      },
      globalsLeft: [],
    })
  })

  it("records agentflow parser, conformance runner and public render calls", async () => {
    const recording = await recordSource(
      [
        'import agentflow from "./agentflowParser.js"',
        'import { runFixture } from "../conformance/runner.js"',
        'import { mermaidAPI } from "../../../mermaidAPI.js"',
        'it("all entry points", async () => {',
        '  agentflow.parser.parse("agentflow-beta\\n")',
        '  agentflow.parse("agentflow-beta TB\\n")',
        '  runFixture("agentflow-beta LR\\n")',
        '  await mermaidAPI.render("id", "agentflow-beta RL\\n")',
        "})",
        "",
      ].join("\n"),
      "diagrams/agentflow/parser/example.spec.ts",
    )
    expect(recording.failures).toEqual([])
    expect(recording.inputs.map(({ text, line }) => [text, line])).toEqual([
      ["agentflow-beta\n", 5],
      ["agentflow-beta TB\n", 6],
      ["agentflow-beta LR\n", 7],
      ["agentflow-beta RL\n", 8],
    ])
  })

  it("records a text passed to the parser with the line of the call and the title path of the test", async () => {
    const recording = await recordSource(
      [
        FLOW_PARSER_IMPORT,
        `describe("outer", () => {`,
        `  describe("inner", () => {`,
        `    it("parses", () => {`,
        `      flowParser.parse("graph TD\\nA-->B")`,
        `    })`,
        `  })`,
        `})`,
        ``,
      ].join("\n"),
    )
    expect(recording).toEqual({
      inputs: [
        {
          text: "graph TD\nA-->B",
          line: 6,
          test: "outer > inner > parses",
        },
      ],
      tests: 1,
      failures: [],
    })
  })

  it("gives the title of a test outside any describe as the title of the test alone", async () => {
    const recording = await recordSource(
      `${FLOW_PARSER_IMPORT}it("alone", () => { flowParser.parse("a") })\n`,
    )
    expect(recording.inputs).toEqual([{ text: "a", line: 2, test: "alone" }])
  })

  it("records every call of one test, each with its own line, in the order of the calls", async () => {
    const recording = await recordSource(
      [
        FLOW_PARSER_IMPORT,
        `it("t", () => {`,
        `  flowParser.parse("first")`,
        `  flowParser.parse("second")`,
        `})`,
        ``,
      ].join("\n"),
    )
    expect(recording.inputs.map((input) => [input.text, input.line])).toEqual([
      ["first", 4],
      ["second", 5],
    ])
  })

  it("records each text a test builds in a loop or a template literal, all at the line of the call", async () => {
    const recording = await recordSource(
      [
        FLOW_PARSER_IMPORT,
        `it("t", () => {`,
        `  for (const arrow of ["-->", "---"]) {`,
        `    flowParser.parse(\`graph TD\\nA\${arrow}B\`)`,
        `  }`,
        `})`,
        ``,
      ].join("\n"),
    )
    expect(recording.inputs.map((input) => [input.text, input.line])).toEqual([
      ["graph TD\nA-->B", 5],
      ["graph TD\nA---B", 5],
    ])
  })

  it("records a text that is empty or that holds line breaks and comments as the test wrote it", async () => {
    const recording = await recordSource(
      `${FLOW_PARSER_IMPORT}it("t", () => {\n  flowParser.parse("")\n  flowParser.parse("a %% c\\r\\nb")\n})\n`,
    )
    expect(textsOf(recording)).toEqual(["", "a %% c\r\nb"])
  })

  it("records nothing for an argument that is not a string, and the parse call still gives the stub", async () => {
    const recording = await recordSource(
      [
        FLOW_PARSER_IMPORT,
        `it("t", () => {`,
        `  flowParser.parse(42)`,
        `  flowParser.parse(undefined)`,
        `  flowParser.parse({ text: "a" })`,
        `  flowParser.parse("b").anything.at.all()`,
        `})`,
        ``,
      ].join("\n"),
    )
    expect(textsOf(recording)).toEqual(["b"])
    expect(recording.failures).toEqual([])
  })

  it("keeps the text that cleanupComments is given, comments included", async () => {
    const recording = await recordSource(
      [
        FLOW_PARSER_IMPORT,
        `import { cleanupComments } from "../../../diagram-api/comments.js"`,
        `it("t", () => {`,
        `  flowParser.parse(cleanupComments("A %% c\\nB"))`,
        `})`,
        ``,
      ].join("\n"),
    )
    expect(textsOf(recording)).toEqual(["A %% c\nB"])
  })
})

describe("recordSpecFile: the functions that take a text", () => {
  it("records the text of flowParser.parse and of flowParser.parser.parse", async () => {
    const recording = await recordSource(
      `${FLOW_PARSER_IMPORT}it("t", () => {\n  flowParser.parse("one")\n  flowParser.parser.parse("two")\n})\n`,
    )
    expect(textsOf(recording)).toEqual(["one", "two"])
  })

  it("records the text of the parser of the class diagram's jison module", async () => {
    const recording = await recordSource(
      `import { parser } from "./classDiagram.jison"\nit("t", () => { parser.parse("classDiagram") })\n`,
      "diagrams/class/parser/class.spec.js",
    )
    expect(textsOf(recording)).toEqual(["classDiagram"])
  })

  it("records the text of both the default export and the parser of the state diagram's jison module", async () => {
    const recording = await recordSource(
      [
        `import stateDiagram, { parser } from "./stateDiagram.jison"`,
        `it("t", () => {`,
        `  stateDiagram.parse("one")`,
        `  stateDiagram.parser.parse("two")`,
        `  parser.parse("three")`,
        `})`,
        ``,
      ].join("\n"),
      "diagrams/state/parser/state.spec.js",
    )
    expect(textsOf(recording)).toEqual(["one", "two", "three"])
  })

  it("records the text of the parser of the requirement diagram's jison module, with the words that the spec takes from the stubbed Db's tables", async () => {
    const recording = await recordSource(
      [
        `import { RequirementDB } from "../requirementDb.js"`,
        `import reqDiagram from "./requirementDiagram.jison"`,
        `it("t", () => {`,
        `  const db = new RequirementDB()`,
        `  reqDiagram.parser.yy = db`,
        `  reqDiagram.parser.parse(\`risk: \${db.RiskLevel.HIGH_RISK}\`)`,
        `  reqDiagram.parser.parse(\`type: \${db.RequirementType.DESIGN_CONSTRAINT}\`)`,
        `  reqDiagram.parser.parse(\`verify: \${db.VerifyType.VERIFY_TEST}\`)`,
        `  reqDiagram.parser.parse(\`link: \${db.Relationships.CONTAINS}\`)`,
        `})`,
        ``,
      ].join("\n"),
      "diagrams/requirement/parser/requirementDiagram.spec.js",
    )
    expect(textsOf(recording)).toEqual([
      "risk: High",
      "type: Design Constraint",
      "verify: Test",
      "link: contains",
    ])
  })

  it("records the text of the parser of the mindmap diagram's jison module", async () => {
    const recording = await recordSource(
      [
        `import { parser as mindmap } from "./parser/mindmap.jison"`,
        `import { MindmapDB } from "./mindmapDb.js"`,
        `import { setLogLevel } from "../../diagram-api/diagramAPI.js"`,
        `it("t", () => {`,
        `  mindmap.yy = new MindmapDB()`,
        `  setLogLevel("trace")`,
        `  mindmap.parse("mindmap\\n  root")`,
        `  mindmap.yy.getMindmap().descr`,
        `})`,
        ``,
      ].join("\n"),
      "diagrams/mindmap/mindmap.spec.ts",
    )
    expect(textsOf(recording)).toEqual(["mindmap\n  root"])
  })

  it("records the text of the parser of the timeline diagram's jison module", async () => {
    const recording = await recordSource(
      [
        `import { setLogLevel } from "../../diagram-api/diagramAPI.js"`,
        `import * as commonDb from "../common/commonDb.js"`,
        `import { parser as timeline } from "./parser/timeline.jison"`,
        `import * as timelineDB from "./timelineDb.js"`,
        `it("t", () => {`,
        `  timeline.yy = timelineDB`,
        `  timelineDB.clear()`,
        `  setLogLevel("trace")`,
        `  timeline.parse("timeline\\n  title T")`,
        `  commonDb.getDiagramTitle()`,
        `  timelineDB.getSections()`,
        `})`,
        ``,
      ].join("\n"),
      "diagrams/timeline/timeline.spec.js",
    )
    expect(textsOf(recording)).toEqual(["timeline\n  title T"])
  })

  it("records the text of the parser of the sankey diagram's jison module, with the file the spec reads beside itself", async () => {
    const checkout = makeCheckout()
    writeTestFile(checkout, "diagrams/sankey/parser/energy.csv", "a,b,1\n")
    const file = writeTestFile(
      checkout,
      "diagrams/sankey/parser/sankey.spec.ts",
      [
        `import sankey from "./sankey.jison"`,
        `import db from "../sankeyDB.js"`,
        `import { prepareTextForParsing } from "../sankeyUtils.js"`,
        `import * as fs from "fs"`,
        `import * as path from "path"`,
        `it("t", () => {`,
        `  sankey.parser.yy = db`,
        `  sankey.parser.yy.clear()`,
        `  const data = fs.readFileSync(path.resolve(__dirname, "./energy.csv"), "utf8")`,
        `  sankey.parser.parse(prepareTextForParsing("sankey-beta\\n\\n " + data))`,
        `  sankey.parser.parse(prepareTextForParsing("sankey\\n  x,y,2  \\n"))`,
        `})`,
        ``,
      ].join("\n"),
    )
    const recording = await recordFile(checkout, file)
    // The text goes to the parser as the test wrote it: the stub of
    // `prepareTextForParsing` returns its argument.
    expect(textsOf(recording)).toEqual([
      "sankey-beta\n\n a,b,1\n",
      "sankey\n  x,y,2  \n",
    ])
  })

  it("records the text of the parser of the xychart diagram's jison module, whatever the test does with the mock Db", async () => {
    const recording = await recordSource(
      [
        `// @ts-ignore: jison has no types`,
        `import { parser } from "./xychart.jison"`,
        `import { vi } from "vitest"`,
        `const mockDB = { setDiagramTitle: vi.fn() }`,
        `it("t", () => {`,
        `  parser.yy = mockDB`,
        `  mockDB.setDiagramTitle.mockRestore()`,
        `  parser.parse("xychart\\n title T")`,
        `})`,
        ``,
      ].join("\n"),
      "diagrams/xychart/parser/xychart.jison.spec.ts",
    )
    expect(textsOf(recording)).toEqual(["xychart\n title T"])
  })

  it("records the text of the parser of the quadrant chart's jison module, whatever the test does with the mock Db", async () => {
    const recording = await recordSource(
      [
        `// @ts-ignore: jison has no types`,
        `import { parser } from "./quadrant.jison"`,
        `import { vi } from "vitest"`,
        `const mockDB = { setDiagramTitle: vi.fn() }`,
        `it("t", () => {`,
        `  parser.yy = mockDB`,
        `  mockDB.setDiagramTitle.mockRestore()`,
        `  parser.parse("quadrantChart\\n title T")`,
        `})`,
        ``,
      ].join("\n"),
      "diagrams/quadrant-chart/parser/quadrant.jison.spec.ts",
    )
    expect(textsOf(recording)).toEqual(["quadrantChart\n title T"])
  })

  it("records the text that the spec of the block diagram passes to the default export of its jison module, with the Db and the styles module stubbed", async () => {
    const recording = await recordSource(
      [
        `// @ts-ignore: jison has no types`,
        `import block from "./block.jison"`,
        `import db from "../blockDB.js"`,
        `import getStyles from "../styles.js"`,
        `it("t", () => {`,
        `  block.parser.yy = db`,
        `  block.parser.yy.clear()`,
        `  getStyles({})`,
        `  block.parse("block-beta\\n  A")`,
        `})`,
        ``,
      ].join("\n"),
      "diagrams/block/parser/block.spec.ts",
    )
    expect(textsOf(recording)).toEqual(["block-beta\n  A"])
  })

  it("records C4 default parser exports in parameterized suites with scoped hooks", async () => {
    const recording = await recordSource(
      [
        `import c4 from "./c4Diagram.jison"`,
        `import db from "../c4Db.js"`,
        `import { setConfig } from "../../../config.js"`,
        `setConfig({ securityLevel: "strict" })`,
        `describe.each(["Person", ["System", "S"]])("%s", (keyword, label = "P") => {`,
        `  beforeEach(() => { c4.parser.yy = db; c4.parser.yy.clear() })`,
        `  it("parses", () => c4.parser.parse('C4Context\\n' + keyword + '(a, "' + label + '")'))`,
        `  it("reads the parsed shape", () => { const [shape] = c4.parser.yy.getC4ShapeArray(); expect(shape.tags).toBe("tag") })`,
        `})`,
        ``,
      ].join("\n"),
      "diagrams/c4/parser/c4Diagram.spec.ts",
    )
    expect(textsOf(recording)).toEqual([
      'C4Context\nPerson(a, "P")',
      'C4Context\nSystem(a, "S")',
    ])
    expect(recording.inputs.map((input) => input.test)).toEqual([
      "Person > parses",
      "System > parses",
    ])
  })

  it("records the venn default parser and named Db export", async () => {
    const recording = await recordSource(
      [
        `import venn from "./venn.jison"`,
        `import { db } from "../vennDB.js"`,
        `beforeEach(() => { venn.parser.yy = db; venn.parser.yy.clear() })`,
        `it("t", () => { venn.parse("venn-beta\\nset A") })`,
        ``,
      ].join("\n"),
      "diagrams/venn/parser/venn.spec.ts",
    )
    expect(textsOf(recording)).toEqual(["venn-beta\nset A"])
  })

  it("records the ishikawa named parser with its constructed Db", async () => {
    const recording = await recordSource(
      [
        `import { parser as ishikawa } from "./parser/ishikawa.jison"`,
        `import { IshikawaDB } from "./ishikawaDb.js"`,
        `import { setLogLevel } from "../../diagram-api/diagramAPI.js"`,
        `beforeEach(() => { ishikawa.yy = new IshikawaDB(); ishikawa.yy.clear(); setLogLevel("trace") })`,
        `it("t", () => { ishikawa.parse("ishikawa-beta\\nR\\n A") })`,
        ``,
      ].join("\n"),
      "diagrams/ishikawa/ishikawa.spec.ts",
    )
    expect(textsOf(recording)).toEqual(["ishikawa-beta\nR\n A"])
    expect(recording.inputs[0]?.line).toBe(5)
  })

  it("records the kanban parser with its Db and diagram API stubbed", async () => {
    const recording = await recordSource(
      [
        `import { parser as kanban } from "./parser/kanban.jison"`,
        `import db from "./kanbanDb.js"`,
        `import { setLogLevel } from "../../diagram-api/diagramAPI.js"`,
        `beforeEach(() => { kanban.yy = db; kanban.yy.clear(); setLogLevel("trace") })`,
        `it("t", () => { kanban.parse("kanban\\n S\\n   A") })`,
        ``,
      ].join("\n"),
      "diagrams/kanban/kanban.spec.ts",
    )
    expect(textsOf(recording)).toEqual(["kanban\n S\n   A"])
  })

  it("records the text of mermaidAPI.parse, whether it is the default or the named export", async () => {
    const recording = await recordSource(
      [
        `import mermaidAPIDefault, { mermaidAPI } from "../mermaidAPI.js"`,
        `it("t", async () => {`,
        `  await mermaidAPI.parse("named")`,
        `  await mermaidAPIDefault.parse("default")`,
        `})`,
        ``,
      ].join("\n"),
      "diagrams/example.spec.js",
    )
    expect(textsOf(recording)).toEqual(["named", "default"])
  })

  it("records the text of Diagram.fromText", async () => {
    const recording = await recordSource(
      `import { Diagram } from "../Diagram.js"\nit("t", async () => { await Diagram.fromText("flowchart") })\n`,
      "diagrams/example.spec.js",
    )
    expect(textsOf(recording)).toEqual(["flowchart"])
  })

  it("records the text of mermaid.parse, and the second argument of mermaid.render", async () => {
    const recording = await recordSource(
      [
        `import mermaid from "../mermaid.js"`,
        `it("t", async () => {`,
        `  await mermaid.parse("parsed")`,
        `  await mermaid.render("an-id", "rendered")`,
        `})`,
        ``,
      ].join("\n"),
      "diagrams/example.spec.js",
    )
    expect(textsOf(recording)).toEqual(["parsed", "rendered"])
  })

  it("records nothing for the functions of the stubbed Db and configuration", async () => {
    const recording = await recordSource(
      [
        FLOW_PARSER_IMPORT,
        `import { FlowDB } from "../flowDb.js"`,
        `import { setConfig, getConfig } from "../../../config.js"`,
        `import { log } from "../../../logger.js"`,
        `it("t", () => {`,
        `  const db = new FlowDB()`,
        `  db.addVertex("A", "text")`,
        `  setConfig({ flowchart: { htmlLabels: true } })`,
        `  log.info(getConfig().securityLevel)`,
        `  flowParser.parser.yy = db`,
        `})`,
        ``,
      ].join("\n"),
    )
    expect(recording).toEqual({ inputs: [], tests: 1, failures: [] })
  })
})

describe("the stub of the requirement diagram's Db", () => {
  it("has the tables of words that the Db mermaid.js builds has", async () => {
    // The Db keeps the tables as properties of its own that the spec reads.
    const text = "requirementDiagram\n"
    // The first parse registers the diagram type; without it,
    // getDiagramFromText() throws UnknownDiagramError.
    await mermaid.parse(text)
    const diagram = await mermaid.mermaidAPI.getDiagramFromText(text)
    const db = diagram.db as unknown as Record<string, unknown>
    for (const [name, table] of Object.entries(REQUIREMENT_DB_TABLES)) {
      expect(db[name], name).toEqual(table)
    }
  })
})

describe("recordSpecFile: the runner of the tests", () => {
  it("runs every test once, the skipped, todo and only ones too, and counts them", async () => {
    const recording = await recordSource(
      [
        FLOW_PARSER_IMPORT,
        `describe("d", () => {`,
        `  it("plain", () => { flowParser.parse("plain") })`,
        `  it.skip("skipped", () => { flowParser.parse("skipped") })`,
        `  it.only("only", () => { flowParser.parse("only") })`,
        `  it.todo("todo", () => { flowParser.parse("todo") })`,
        `  test("test", () => { flowParser.parse("test") })`,
        `})`,
        `describe.skip("skipped suite", () => {`,
        `  it("inside", () => { flowParser.parse("inside skipped") })`,
        `})`,
        `describe.only("only suite", () => {`,
        `  it("inside", () => { flowParser.parse("inside only") })`,
        `})`,
        ``,
      ].join("\n"),
    )
    expect(textsOf(recording)).toEqual([
      "plain",
      "skipped",
      "only",
      "todo",
      "test",
      "inside skipped",
      "inside only",
    ])
    expect(recording.tests).toBe(7)
  })

  it("runs the tests in the order of the file, after the whole file is read", async () => {
    const recording = await recordSource(
      [
        FLOW_PARSER_IMPORT,
        `flowParser.parse("top level")`,
        `it("a", () => { flowParser.parse("a") })`,
        `describe("d", () => {`,
        `  it("b", () => { flowParser.parse("b") })`,
        `})`,
        `it("c", () => { flowParser.parse("c") })`,
        ``,
      ].join("\n"),
    )
    expect(recording.inputs.map((input) => [input.text, input.test])).toEqual([
      ["top level", ""],
      ["a", "a"],
      ["b", "d > b"],
      ["c", "c"],
    ])
  })

  it("names a text recorded while a describe block is read by the titles of the open blocks", async () => {
    const recording = await recordSource(
      [
        FLOW_PARSER_IMPORT,
        `describe("outer", () => {`,
        `  describe("inner", () => {`,
        `    flowParser.parse("in a block")`,
        `  })`,
        `})`,
        ``,
      ].join("\n"),
    )
    expect(recording.inputs).toEqual([
      { text: "in a block", line: 5, test: "outer > inner" },
    ])
    expect(recording.tests).toBe(0)
  })

  it("registers a test without a body and runs it as an empty one", async () => {
    const recording = await recordSource(`it("no body")\n`)
    expect(recording).toEqual({ inputs: [], tests: 1, failures: [] })
  })

  it("registers one test for each row of it.each, with %s, %d and %i filled from the row", async () => {
    const recording = await recordSource(
      [
        FLOW_PARSER_IMPORT,
        `it.each([["a", 1, 2], ["b", 2, 3]])("%s with %d and %i", (text, count) => {`,
        `  flowParser.parse(text + count)`,
        `})`,
        `it.each(["x", "y"])("scalar %s", (text) => {`,
        `  flowParser.parse(text)`,
        `})`,
        ``,
      ].join("\n"),
    )
    expect(recording.inputs.map((input) => [input.text, input.test])).toEqual([
      ["a1", "a with 1 and 2"],
      ["b2", "b with 2 and 3"],
      ["x", "scalar x"],
      ["y", "scalar y"],
    ])
    expect(recording.tests).toBe(4)
  })

  it("runs beforeEach before and afterEach after each test of the block that declares them, outermost first and innermost last", async () => {
    const recording = await recordSource(
      [
        FLOW_PARSER_IMPORT,
        `beforeEach(() => { flowParser.parse("root before") })`,
        `afterEach(() => { flowParser.parse("root after") })`,
        `describe("d", () => {`,
        `  beforeEach(() => { flowParser.parse("d before") })`,
        `  afterEach(() => { flowParser.parse("d after") })`,
        `  it("t", () => { flowParser.parse("body") })`,
        `})`,
        `it("outside", () => { flowParser.parse("outside body") })`,
        ``,
      ].join("\n"),
    )
    expect(recording.inputs.map((input) => [input.text, input.test])).toEqual([
      ["root before", "d > t"],
      ["d before", "d > t"],
      ["body", "d > t"],
      ["d after", "d > t"],
      ["root after", "d > t"],
      ["root before", "outside"],
      ["outside body", "outside"],
      ["root after", "outside"],
    ])
  })

  it("runs beforeAll when it is called and never runs afterAll", async () => {
    const recording = await recordSource(
      [
        FLOW_PARSER_IMPORT,
        `describe("d", () => {`,
        `  beforeAll(() => { flowParser.parse("before all") })`,
        `  afterAll(() => { flowParser.parse("after all") })`,
        `  it("t", () => { flowParser.parse("body") })`,
        `})`,
        ``,
      ].join("\n"),
    )
    expect(recording.inputs.map((input) => [input.text, input.test])).toEqual([
      ["before all", "d"],
      ["body", "d > t"],
    ])
  })

  it("waits for a test body that returns a promise", async () => {
    const recording = await recordSource(
      [
        FLOW_PARSER_IMPORT,
        `it("t", async () => {`,
        `  await new Promise((resolve) => setTimeout(resolve, 5))`,
        `  flowParser.parse("after the wait")`,
        `})`,
        ``,
      ].join("\n"),
    )
    expect(textsOf(recording)).toEqual(["after the wait"])
    expect(recording.failures).toEqual([])
  })

  it("takes vitest's functions from an import, or as globals when the file does not import them", async () => {
    const imported = await recordSource(
      `import { describe, it, expect } from "vitest"\n${FLOW_PARSER_IMPORT}describe("d", () => { it("t", () => { flowParser.parse("a"); expect(1).toBe(1) }) })\n`,
    )
    expect(imported.inputs).toEqual([{ text: "a", line: 3, test: "d > t" }])
    const globals = await recordSource(
      `${FLOW_PARSER_IMPORT}describe("d", () => { it("t", () => { flowParser.parse("a"); expect(1).toBe(1) }) })\n`,
    )
    expect(globals.inputs).toEqual([{ text: "a", line: 2, test: "d > t" }])
  })

  it("takes the helpers of vi and expect as stubs", async () => {
    const recording = await recordSource(
      [
        FLOW_PARSER_IMPORT,
        `it("t", () => {`,
        `  const spy = vi.fn().mockReturnValue(1)`,
        `  vi.spyOn(console, "log")`,
        `  expect(spy("x")).toEqual(expect.stringContaining("y"))`,
        `  flowParser.parse("a")`,
        `})`,
        ``,
      ].join("\n"),
    )
    expect(recording).toMatchObject({ failures: [], tests: 1 })
    expect(textsOf(recording)).toEqual(["a"])
  })
})

describe("recordSpecFile: expect(fn)", () => {
  it("calls the function it is given once, so that a parse call in it is recorded once", async () => {
    const recording = await recordSource(
      `${FLOW_PARSER_IMPORT}it("t", () => {\n  expect(() => flowParser.parse("a -->")).toThrow()\n})\n`,
    )
    expect(textsOf(recording)).toEqual(["a -->"])
    expect(recording.failures).toEqual([])
  })

  it("does not call a value that is not a function", async () => {
    const recording = await recordSource(
      `it("t", () => {\n  expect("text").toBe("text")\n  expect({ a: 1 }).toEqual({ a: 1 })\n})\n`,
    )
    expect(recording).toEqual({ inputs: [], tests: 1, failures: [] })
  })

  it("waits for a promise that the function returns and records its parse calls", async () => {
    const recording = await recordSource(
      [
        `import mermaid from "../mermaid.js"`,
        `it("t", async () => {`,
        `  await expect(mermaid.parse("a")).resolves.toBe(1)`,
        `  await expect(async () => {`,
        `    await new Promise((resolve) => setTimeout(resolve, 5))`,
        `    await mermaid.parse("b")`,
        `  }).rejects.toThrow()`,
        `})`,
        ``,
      ].join("\n"),
      "diagrams/example.spec.js",
    )
    expect(textsOf(recording)).toEqual(["a", "b"])
    expect(recording.failures).toEqual([])
  })

  it("returns the rejection of a promise handed to expect as a failure of that test", async () => {
    const recording = await recordSource(
      [
        FLOW_PARSER_IMPORT,
        `describe("d", () => {`,
        `  it("t", () => {`,
        `    expect(async () => {`,
        `      flowParser.parse("before the error")`,
        `      throw new Error("rejected inside")`,
        `    }).rejects.toThrow()`,
        `  })`,
        `})`,
        ``,
      ].join("\n"),
    )
    expect(recording.failures).toEqual([
      { test: "d > t", error: "rejected inside" },
    ])
    expect(textsOf(recording)).toEqual(["before the error"])
  })
})

describe("recordSpecFile: tests that end with an error", () => {
  it("returns a test body that throws as a failure with the title path and the message, keeps the texts recorded before it, and goes on with the next test", async () => {
    const recording = await recordSource(
      [
        FLOW_PARSER_IMPORT,
        `describe("d", () => {`,
        `  it("fails", () => {`,
        `    flowParser.parse("before")`,
        `    throw new Error("stopped here")`,
        `    flowParser.parse("after")`,
        `  })`,
        `  it("next", () => { flowParser.parse("next") })`,
        `})`,
        ``,
      ].join("\n"),
    )
    expect(recording.failures).toEqual([
      { test: "d > fails", error: "stopped here" },
    ])
    expect(textsOf(recording)).toEqual(["before", "next"])
    expect(recording.tests).toBe(2)
  })

  it("returns a rejected promise of an async test body, and a thrown value that is not an Error as its string", async () => {
    const recording = await recordSource(
      [
        `it("async", async () => { await Promise.reject(new Error("async failure")) })`,
        `it("string", () => { throw "a plain string" })`,
        ``,
      ].join("\n"),
    )
    expect(recording.failures).toEqual([
      { test: "async", error: "async failure" },
      { test: "string", error: "a plain string" },
    ])
  })

  it("returns a beforeEach that throws as a failure of the test and does not run the test body", async () => {
    const recording = await recordSource(
      [
        FLOW_PARSER_IMPORT,
        `describe("d", () => {`,
        `  beforeEach(() => { throw new Error("hook failed") })`,
        `  it("t", () => { flowParser.parse("body") })`,
        `})`,
        ``,
      ].join("\n"),
    )
    expect(recording.failures).toEqual([
      { test: "d > t", error: "hook failed" },
    ])
    expect(textsOf(recording)).toEqual([])
  })

  it("returns an afterEach that throws as a failure of the test, whose body has run", async () => {
    const recording = await recordSource(
      [
        FLOW_PARSER_IMPORT,
        `describe("d", () => {`,
        `  afterEach(() => { throw new Error("cleanup failed") })`,
        `  it("t", () => { flowParser.parse("body") })`,
        `})`,
        ``,
      ].join("\n"),
    )
    expect(recording.failures).toEqual([
      { test: "d > t", error: "cleanup failed" },
    ])
    expect(textsOf(recording)).toEqual(["body"])
  })

  it("returns a test that turns a stub into a string, since a stub must never end up in a recorded text", async () => {
    const recording = await recordSource(
      [
        FLOW_PARSER_IMPORT,
        `import { getConfig } from "../../../config.js"`,
        `it("template", () => { flowParser.parse(\`graph \${getConfig().flowchart}\`) })`,
        `it("String", () => { flowParser.parse(String(getConfig())) })`,
        `it("concatenation", () => { flowParser.parse("x".concat(getConfig())) })`,
        ``,
      ].join("\n"),
    )
    expect(recording.failures).toEqual([
      { test: "template", error: "a stub was used as a string" },
      { test: "String", error: "a stub was used as a string" },
      { test: "concatenation", error: "a stub was used as a string" },
    ])
    expect(textsOf(recording)).toEqual([])
  })
})

describe("recordSpecFile: what stops the run", () => {
  it("throws for a recorded text that contains NaN, which arithmetic on a stub gives, and names the lines", async () => {
    await expect(
      recordSource(
        [
          FLOW_PARSER_IMPORT,
          `import { getConfig } from "../../../config.js"`,
          `it("t", () => {`,
          `  flowParser.parse("fine")`,
          `  flowParser.parse("width " + getConfig().width)`,
          `  flowParser.parse("height " + getConfig().height * 2)`,
          `})`,
          ``,
        ].join("\n"),
      ),
    ).rejects.toThrow(
      "texts that contain NaN, which a stub may have produced, at lines 6, 7",
    )
  })

  it("throws for a text that contains NaN even where the test wrote it, since the recorder cannot tell the two apart", async () => {
    await expect(
      recordSource(
        `${FLOW_PARSER_IMPORT}it("t", () => { flowParser.parse("NaN") })\n`,
      ),
    ).rejects.toThrow("texts that contain NaN")
  })

  it("throws for a parse call whose line the recorder cannot find", async () => {
    await expect(
      recordSource(
        [
          FLOW_PARSER_IMPORT,
          `it("t", () => {`,
          `  queueMicrotask(flowParser.parse.bind(null, "a"))`,
          `})`,
          ``,
        ].join("\n"),
      ),
    ).rejects.toThrow("the line of 1 parse calls was not found")
  })

  it("throws for an import of a module the recorder has no stub for, and names the file and the path", async () => {
    const checkout = makeCheckout()
    const file = writeTestFile(
      checkout,
      "diagrams/flowchart/parser/other.spec.js",
      `import { helper } from "./helper.js"\nit("t", () => { helper() })\n`,
    )
    await expect(recordFile(checkout, file)).rejects.toThrow(
      `${file} imports ./helper.js, which has no stub`,
    )
  })

  it("throws for a package import that has no stub, and for an import of a module with a stub under another extension", async () => {
    await expect(
      recordSource(`import crypto from "node:crypto"\nit("t", () => {})\n`),
    ).rejects.toThrow("imports node:crypto, which has no stub")
    await expect(
      recordSource(
        `import flowParser from "./flowParser.js"\nit("t", () => {})\n`,
      ),
    ).rejects.toThrow("imports ./flowParser.js, which has no stub")
  })

  it("throws for a dynamic import with a literal path that has no stub", async () => {
    await expect(
      recordSource(`it("t", async () => { await import("./helper.js") })\n`),
    ).rejects.toThrow("imports ./helper.js, which has no stub")
  })

  it("throws what the top level of the test file throws, and leaves the globals as they were", async () => {
    const checkout = makeCheckout()
    const file = writeTestFile(
      checkout,
      "diagrams/flowchart/parser/example.spec.js",
      `throw new Error("top level failure")\n`,
    )
    expect(await runRecorder(checkout, file)).toEqual({
      error: "top level failure",
      globalsLeft: [],
    })
  })

  it("leaves the globals as they were after a recording too", async () => {
    const checkout = makeCheckout()
    const file = writeTestFile(
      checkout,
      "diagrams/flowchart/parser/example.spec.js",
      `${FLOW_PARSER_IMPORT}it("t", () => { flowParser.parse("a") })\n`,
    )
    const { recording, globalsLeft } = await runRecorder(checkout, file)
    expect(recording?.inputs).toHaveLength(1)
    expect(globalsLeft).toEqual([])
  })
})

describe("recordSpecFile: how the file is read", () => {
  it("finds a module by its path from the checkout, wherever the test file is", async () => {
    const recording = await recordSource(
      [
        `import flowParser from "../../flowchart/parser/flowParser.ts"`,
        `import { cleanupComments } from "../../../diagram-api/comments.js"`,
        `it("t", () => { flowParser.parse(cleanupComments("a")) })`,
        ``,
      ].join("\n"),
      "diagrams/other/deeper/example.spec.js",
    )
    expect(textsOf(recording)).toEqual(["a"])
  })

  it("loads a dynamic import with a literal path in a test through the stub", async () => {
    const recording = await recordSource(
      [
        `it("t", async () => {`,
        `  const { default: flowParser } = await import("./flowParser.ts")`,
        `  flowParser.parse("dynamic")`,
        `})`,
        ``,
      ].join("\n"),
    )
    expect(recording.inputs).toEqual([{ text: "dynamic", line: 3, test: "t" }])
  })

  it("leaves out a type-only import, which loads nothing", async () => {
    const recording = await recordSource(
      [
        `import type { FlowDB } from "./not-stubbed.js"`,
        `import flowParser from "./flowParser.ts"`,
        `it("t", () => { flowParser.parse("a") })`,
        ``,
      ].join("\n"),
      "diagrams/flowchart/parser/typed.spec.ts",
    )
    expect(recording.inputs).toEqual([{ text: "a", line: 3, test: "t" }])
  })

  it("reads a TypeScript test file, and keeps the line of each call", async () => {
    const recording = await recordSource(
      [
        `import flowParser from "./flowParser.ts"`,
        `const text: string = "typed"`,
        `it("t", () => {`,
        `  flowParser.parse(text as string)`,
        `})`,
        ``,
      ].join("\n"),
      "diagrams/flowchart/parser/typed.spec.ts",
    )
    expect(recording.inputs).toEqual([{ text: "typed", line: 4, test: "t" }])
  })

  it("keeps the line of a call after an import that spans several lines", async () => {
    const recording = await recordSource(
      [
        `import {`,
        `  describe,`,
        `  it,`,
        `} from "vitest"`,
        `import flowParser from "./flowParser.ts"`,
        `describe("d", () => {`,
        `  it("t", () => {`,
        `    flowParser.parse("a")`,
        `  })`,
        `})`,
        ``,
      ].join("\n"),
    )
    expect(recording.inputs).toEqual([{ text: "a", line: 8, test: "d > t" }])
  })

  it("gives each file its own stubs, so that recording two files in one work directory keeps their texts apart", async () => {
    const checkout = makeCheckout()
    const first = writeTestFile(
      checkout,
      "diagrams/flowchart/parser/first.spec.js",
      `${FLOW_PARSER_IMPORT}it("t", () => { flowParser.parse("from first") })\n`,
    )
    const second = writeTestFile(
      checkout,
      "diagrams/flowchart/parser/second.spec.js",
      `${FLOW_PARSER_IMPORT}it("t", () => { flowParser.parse("from second") })\n`,
    )
    const recordedFirst = await recordFile(checkout, first)
    const recordedSecond = await recordFile(checkout, second)
    expect(textsOf(recordedFirst)).toEqual(["from first"])
    expect(textsOf(recordedSecond)).toEqual(["from second"])
    expect(readdirSync(checkout.workDir).sort()).toEqual([
      encodeURIComponent("diagrams/flowchart/parser/first.spec.js"),
      encodeURIComponent("diagrams/flowchart/parser/second.spec.js"),
    ])
  })

  it("does not change the test file of the checkout, and writes the copy and the stubs into the work directory", async () => {
    const checkout = makeCheckout()
    const source = `${FLOW_PARSER_IMPORT}it("t", () => { flowParser.parse("a") })\n`
    const file = writeTestFile(
      checkout,
      "diagrams/flowchart/parser/example.spec.js",
      source,
    )
    await recordFile(checkout, file)
    expect(
      readdirSync(
        path.join(
          checkout.workDir,
          encodeURIComponent("diagrams/flowchart/parser/example.spec.js"),
        ),
        {
          recursive: true,
          encoding: "utf8",
        },
      ).sort(),
    ).toEqual([
      "diagrams__flowchart__parser__flowParser.ts.mjs",
      "example.spec.mjs",
    ])
    expect(existsSync(file)).toBe(true)
    expect(readdirSync(path.dirname(file)).sort()).toEqual(["example.spec.js"])
  })
})

it("records Chevrotain tokenization of complete diagrams", async () => {
  const source = `import { it } from "vitest"
import { usecaseLexer } from "./usecase.lexer.js"
import { usecaseParser } from "./usecase.parser.js"
it("grammar", () => {
  const lexed = usecaseLexer.tokenize("usecase-beta\\nA --> B")
  usecaseParser.input = lexed.tokens
  usecaseParser.start()
})
`
  const recording = await recordSource(
    source,
    "diagrams/usecase/parser/example.spec.ts",
  )
  expect(recording.failures).toEqual([])
  expect(recording.inputs).toEqual([
    { text: "usecase-beta\nA --> B", line: 5, test: "grammar" },
  ])
})

it("keeps later usecase calls after helpers that inspect a caught error", async () => {
  const source = `import { it, expect } from "vitest"
import { parser } from "./parser/usecase.chevrotain.js"
async function expectExactSemanticError(source) {
  let error
  try { await parser.parse(source) } catch (caught) { error = caught }
  expect(error.message).toBe("ignored")
}
async function expectGrammarErrorAt(source) {
  let error
  try { await parser.parse(source) } catch (caught) { error = caught }
  expect(error.message.endsWith("ignored")).toBe(true)
}
it("errors then success", async () => {
  await expectExactSemanticError("usecase-beta\\nnote for Missing text")
  await expectGrammarErrorAt("usecase-beta\\nA -->")
  await parser.parse("usecase-beta\\nA")
})
`
  const recording = await recordSource(
    source,
    "diagrams/usecase/example.spec.ts",
  )
  expect(recording.failures).toEqual([])
  expect(recording.inputs).toEqual([
    {
      text: "usecase-beta\nnote for Missing text",
      line: 5,
      test: "errors then success",
    },
    { text: "usecase-beta\nA -->", line: 10, test: "errors then success" },
    { text: "usecase-beta\nA", line: 16, test: "errors then success" },
  ])
})

it("keeps equal spec basenames in separate stub directories", async () => {
  const checkout = makeCheckout()
  const first = writeTestFile(
    checkout,
    "diagrams/usecase/example.spec.ts",
    `
import { it } from "vitest"
import { parser } from "./parser/usecase.chevrotain.js"
it("first", () => parser.parse("usecase-beta\\nFirst"))
`,
  )
  const second = writeTestFile(
    checkout,
    "diagrams/usecase/parser/example.spec.ts",
    `
import { it } from "vitest"
import { usecaseLexer } from "./usecase.lexer.js"
it("second", () => usecaseLexer.tokenize("usecase-beta\\nSecond"))
`,
  )
  expect(textsOf(await recordFile(checkout, first))).toEqual([
    "usecase-beta\nFirst",
  ])
  expect(textsOf(await recordFile(checkout, second))).toEqual([
    "usecase-beta\nSecond",
  ])
})

it("reads the usecase docs from the checkout while recording public render calls", async () => {
  const checkout = makeCheckout()
  const page = path.join(checkout.mermaidSource, "docs/syntax/usecase.md")
  mkdirSync(path.dirname(page), { recursive: true })
  writeFileSync(page, "usecase-beta\nFromDocs")
  const file = writeTestFile(
    checkout,
    "diagrams/usecase/docs.spec.ts",
    `
import { it } from "vitest"
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import mermaidAPI from "../../mermaidAPI.js"
it("docs", async () => {
  const page = resolve(process.cwd(), "packages/mermaid/src/docs/syntax/usecase.md")
  if (!existsSync(page)) throw new Error("missing docs")
  await mermaidAPI.render("docs", readFileSync(page, "utf8"))
})
`,
  )
  const recording = await recordFile(checkout, file)
  expect(recording.failures).toEqual([])
  expect(textsOf(recording)).toEqual(["usecase-beta\nFromDocs"])
})
