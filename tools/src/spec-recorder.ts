/**
 * Records the diagram texts mermaid's test files feed to mermaid, by running
 * each file against stubs instead of mermaid.
 *
 * The tests build many inputs in loops and template literals, so reading
 * string literals out of the files would miss most of them. Instead each file
 * is copied into a working directory with only the paths of its imports
 * (declarations and `import("...")` calls) changed, to stub modules written
 * next to it, and the copy is imported, so
 * every line stays where it is in the original. Then every test body is run
 * once:
 *
 * - `describe`, `it` and the hooks are a minimal runner that runs every test,
 *   skipped ones too;
 * - the functions that take a diagram text record it, with the line of the
 *   call in the test file and the test's title path: a diagram's parser
 *   (`parse`), `mermaidAPI.parse`, `Diagram.fromText`, and `mermaid.parse`
 *   and `mermaid.render`;
 * - `cleanupComments` returns its argument, so the text recorded is the text
 *   the test wrote, comments included;
 * - everything else (the Db, the configuration, `expect`, `vi`, the logger)
 *   is a stub that accepts any use but one: turning it into a string throws,
 *   so that a stub can never end up inside a recorded text. Arithmetic on it
 *   gives NaN, and a recorded text that contains `NaN` stops the run, since a
 *   stub may have produced it.
 *   `expect(fn)` calls `fn` once, since tests pass a parse call to
 *   `expect(() => ...).toThrow()`. Parser stubs normally return without throwing.
 *   The usecase parser stub makes one exception: after recording a call from
 *   `expectExactSemanticError` or `expectGrammarErrorAt`, it throws an
 *   assertion-only error. Those upstream helpers catch it and inspect its
 *   message before continuing to later parse calls; returning normally would
 *   stop the helper early. This supplies no acceptance or error-message truth:
 *   the recorded inputs are checked separately against the pinned mermaid.
 *
 * A test body or hook that throws, or a promise it hands to `expect` that
 * rejects, may have stopped before some of its parse calls, so each such
 * failure is returned with the test's title. An import without a stub fails
 * the run.
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"
import ts from "typescript"

/** A test that ended with an error, so that some of its inputs may be missing. */
export interface RecordedFailure {
  /** Title path of the test, `describe > it`. */
  readonly test: string
  /** The error's message. */
  readonly error: string
}

/** What one test file passed to the parsers. */
export interface SpecFileRecording {
  readonly inputs: readonly RecordedInput[]
  /** The number of tests run. */
  readonly tests: number
  readonly failures: readonly RecordedFailure[]
}

export interface RecordedInput {
  /** The diagram text. */
  readonly text: string
  /** 1-based line of the parse call in the test file. */
  readonly line: number
  /** Title path of the test, `describe > it`. */
  readonly test: string
}

/** Where the stub modules find their exports at run time. */
const STUBS_GLOBAL = "__mmdSpecStubs"

/**
 * The modules the test files import, by path relative to
 * `packages/mermaid/src` (or the package name), with the names they export.
 * The test files of every diagram type share this list; a module that one
 * test file imports and others do not costs nothing.
 */
const STUBBED_MODULES: Readonly<Record<string, readonly string[]>> = {
  "diagrams/usecase/parser/usecase.chevrotain.js": ["parser"],
  "diagrams/usecase/parser/usecase.lexer.js": ["usecaseLexer"],
  "diagrams/usecase/parser/usecase.parser.js": ["usecaseParser"],
  "diagrams/usecase/usecaseDb.js": ["db"],
  "diagrams/usecase/usecaseTypes.js": ["ARROW_TYPE"],
  "diagrams/usecase/styles.js": ["default"],
  "diagrams/common/common.js": ["sanitizeText"],
  "node:fs": ["existsSync", "readFileSync"],
  "node:path": ["resolve"],
  "diagrams/agentflow/parser/agentflowParser.js": ["default"],
  "diagrams/agentflow/agentflowDb.js": ["AgentFlowDB"],
  "diagrams/agentflow/diagnostics.js": [
    "AgentflowWarning",
    "PARSER_EMITTED_DIAGNOSTICS",
    "RESERVED_DIAGNOSTICS",
  ],
  "diagrams/agentflow/transformData.js": ["transformData"],
  "diagrams/agentflow/colorSlots.js": ["KIND_COUNT"],
  "diagrams/agentflow/conformance/runner.js": ["matchExpected", "runFixture"],
  vitest: [
    "describe",
    "it",
    "test",
    "beforeEach",
    "afterEach",
    "beforeAll",
    "afterAll",
    "expect",
    "vi",
  ],
  "diagrams/flowchart/parser/flowParser.ts": ["default"],
  "diagrams/flowchart/flowDb.js": ["FlowDB"],
  "diagrams/sequence/sequenceDb.js": ["SequenceDB"],
  "diagrams/class/parser/classDiagram.jison": ["parser"],
  "diagrams/class/classDb.js": ["ClassDB"],
  "diagrams/state/parser/stateDiagram.jison": ["default", "parser"],
  "diagrams/state/stateDb.js": ["StateDB"],
  "diagrams/state/stateCommon.js": ["DEFAULT_DIAGRAM_DIRECTION"],
  "diagrams/er/parser/erDiagram.jison": ["default"],
  "diagrams/er/erDb.js": ["ErDB"],
  "diagrams/gantt/parser/gantt.jison": ["parser"],
  "diagrams/gantt/ganttDb.js": ["default"],
  "diagrams/user-journey/parser/journey.jison": ["parser"],
  "diagrams/user-journey/journeyDb.js": ["default"],
  "diagrams/requirement/parser/requirementDiagram.jison": ["default"],
  "diagrams/requirement/requirementDb.js": ["RequirementDB"],
  "diagrams/mindmap/parser/mindmap.jison": ["parser"],
  "diagrams/mindmap/mindmapDb.js": ["MindmapDB"],
  "diagrams/timeline/parser/timeline.jison": ["parser"],
  "diagrams/timeline/timelineDb.js": [
    "clear",
    "getDirection",
    "getSections",
    "getTasks",
  ],
  "diagrams/common/commonDb.js": [
    "getDiagramTitle",
    "getAccTitle",
    "getAccDescription",
  ],
  "diagrams/xychart/parser/xychart.jison": ["parser"],
  "diagrams/quadrant-chart/parser/quadrant.jison": ["parser"],
  "diagrams/venn/parser/venn.jison": ["default"],
  "diagrams/venn/vennDB.js": ["db"],
  "diagrams/ishikawa/parser/ishikawa.jison": ["parser"],
  "diagrams/ishikawa/ishikawaDb.js": ["IshikawaDB"],
  "diagrams/kanban/parser/kanban.jison": ["parser"],
  "diagrams/kanban/kanbanDb.js": ["default"],
  "diagrams/c4/parser/c4Diagram.jison": ["default"],
  "diagrams/c4/c4Db.js": ["default"],
  "diagrams/block/parser/block.jison": ["default"],
  "diagrams/block/blockDB.js": ["default"],
  "diagrams/block/styles.js": ["default"],
  "diagrams/sankey/parser/sankey.jison": ["default"],
  "diagrams/sankey/sankeyDB.js": ["default"],
  "diagrams/sankey/sankeyUtils.js": ["prepareTextForParsing"],
  // The spec reads the file `energy.csv` next to it.
  fs: ["readFileSync"],
  path: ["resolve"],
  "config.js": [
    "setConfig",
    "getConfig",
    "reset",
    "saveConfigFromInitialize",
    "setSiteConfig",
    "setDiagramConfigScope",
  ],
  "diagram-api/comments.js": ["cleanupComments"],
  "tests/util.js": ["jsdomIt"],
  "diagram-api/detectType.js": ["detectors"],
  "logger.js": ["log", "setLogLevel"],
  "mermaidAPI.js": ["mermaidAPI", "default"],
  "mermaid.js": ["default"],
  "Diagram.js": ["Diagram"],
  "diagram-api/diagramAPI.js": [
    "setSiteConfig",
    "setConfig",
    "setLogLevel",
    "getDiagram",
  ],
  "diagram-api/diagram-orchestration.js": ["addDiagrams"],
}

/**
 * A value that accepts any use: every property, call and construction gives
 * the stub again. `then` is absent so that awaiting it does not hang.
 */
const anything: unknown = new Proxy(
  function stub(): unknown {
    return undefined
  },
  {
    get(_target, property) {
      if (property === "then") return undefined
      if (property === Symbol.toPrimitive) {
        // Arithmetic on a stub gives NaN, so that a test computing a layout
        // from the stubbed configuration does not fail. Only a conversion to
        // a string throws; `+` with a string gives "NaN" in it, and a
        // recorded text that holds NaN is reported (see `record`).
        return (hint: string) => {
          if (hint === "string") {
            throw new TypeError("a stub was used as a string")
          }
          return Number.NaN
        }
      }
      return anything
    },
    apply: () => anything,
    construct: () => anything as object,
  },
)

/**
 * An object whose given functions record, and whose every other property is
 * the stub.
 */
function withRecorders(functions: Record<string, unknown>): unknown {
  return new Proxy(functions, {
    get: (target, property) =>
      typeof property === "string" && Object.hasOwn(target, property)
        ? target[property]
        : anything,
  })
}

interface Suite {
  readonly title: string
  readonly beforeEach: (() => unknown)[]
  readonly afterEach: (() => unknown)[]
}

interface RegisteredTest {
  readonly titles: readonly string[]
  readonly suites: readonly Suite[]
  readonly body: (...args: unknown[]) => unknown
  readonly args: readonly unknown[]
}

/**
 * The tables of words that the Db of the requirement diagram holds as its own
 * properties (`requirementDb.ts`). The requirement spec builds its inputs from
 * them (`requirementDb.RiskLevel.HIGH_RISK` for `High`), so the stub of the Db
 * gives them and the stub for every other member. A test compares them with
 * the tables of the Db that mermaid.js builds.
 */
export const REQUIREMENT_DB_TABLES: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  RequirementType: {
    REQUIREMENT: "Requirement",
    FUNCTIONAL_REQUIREMENT: "Functional Requirement",
    INTERFACE_REQUIREMENT: "Interface Requirement",
    PERFORMANCE_REQUIREMENT: "Performance Requirement",
    PHYSICAL_REQUIREMENT: "Physical Requirement",
    DESIGN_CONSTRAINT: "Design Constraint",
  },
  RiskLevel: { LOW_RISK: "Low", MED_RISK: "Medium", HIGH_RISK: "High" },
  VerifyType: {
    VERIFY_ANALYSIS: "Analysis",
    VERIFY_DEMONSTRATION: "Demonstration",
    VERIFY_INSPECTION: "Inspection",
    VERIFY_TEST: "Test",
  },
  Relationships: {
    CONTAINS: "contains",
    COPIES: "copies",
    DERIVES: "derives",
    SATISFIES: "satisfies",
    VERIFIES: "verifies",
    REFINES: "refines",
    TRACES: "traces",
  },
}

/**
 * Runs one test file of the mermaid checkout whose `packages/mermaid/src` is
 * `mermaidSource`, and returns the texts it passed to the parsers and the
 * tests that ended with an error. The copy
 * and the stub modules are written to a new directory in `workDir`.
 */
export async function recordSpecFile(
  file: string,
  mermaidSource: string,
  workDir: string,
): Promise<SpecFileRecording> {
  // Each file gets its own stub modules, since Node evaluates a module once
  // per URL and the stubs record into this call. Stack traces name the real
  // path of the copy.
  const fileDir = path.join(
    realpathSync(workDir),
    path.relative(mermaidSource, file),
  )
  mkdirSync(fileDir, { recursive: true })
  const copy = writeCopyWithStubs(file, mermaidSource, fileDir)
  const copyUrl = pathToFileURL(copy).href

  const recorded: RecordedInput[] = []
  /** Parse calls whose line was not found; a test body would swallow the error. */
  let unlocated = 0
  const failures: RecordedFailure[] = []
  /** Promises the running test handed to `expect`. */
  let pending: Promise<unknown>[] = []
  /** The open `describe` blocks, below a root that holds top-level hooks. */
  const suites: Suite[] = [{ title: "", beforeEach: [], afterEach: [] }]
  const tests: RegisteredTest[] = []
  /** The title path of the running test; `undefined` while registering. */
  let currentTest: readonly string[] | undefined

  /**
   * The titles of the open `describe` blocks.
   */
  function suiteTitles(): string[] {
    return suites.slice(1).map((suite) => suite.title)
  }

  /**
   * Records a text passed to a parser, with the line of the call, and returns
   * the stub as the parse result.
   */
  function record(text: unknown): unknown {
    if (typeof text !== "string") return anything
    const frame = new Error("stack").stack
      ?.split("\n")
      .find((line) => line.includes(copyUrl))
    const line = Number(frame?.slice(frame.indexOf(copyUrl)).split(":").at(-2))
    if (!Number.isInteger(line)) {
      unlocated++
      return anything
    }
    recorded.push({
      text,
      line,
      test: (currentTest ?? suiteTitles()).join(" > "),
    })
    return anything
  }

  /**
   * `describe(title, body)`: registers the tests `body` declares.
   */
  function describe(title: string, body: () => unknown): void {
    suites.push({ title, beforeEach: [], afterEach: [] })
    body()
    suites.pop()
  }

  describe.skip = describe
  describe.only = describe
  describe.each = (rows: readonly unknown[]) => {
    return (title: string, body: (...args: unknown[]) => unknown): void => {
      for (const row of rows) {
        const args = Array.isArray(row) ? row : [row]
        describe(formatTitle(title, args), () => body(...args))
      }
    }
  }

  /**
   * `it(title, body)`: registers one test.
   */
  function it(
    title: string,
    body: (...args: unknown[]) => unknown = () => undefined,
  ): void {
    tests.push({
      titles: [...suiteTitles(), title],
      suites: [...suites],
      body,
      args: [],
    })
  }

  /**
   * `it.each(rows)(title, body)`: registers one test per row.
   */
  function each(rows: readonly unknown[]) {
    return (title: string, body: (...args: unknown[]) => unknown): void => {
      for (const row of rows) {
        const args = Array.isArray(row) ? row : [row]
        tests.push({
          titles: [...suiteTitles(), formatTitle(title, args)],
          suites: [...suites],
          body,
          args,
        })
      }
    }
  }

  it.skip = it
  it.only = it
  it.todo = it
  it.each = each

  /**
   * `expect(value)`: calls `value` once if it is a function, and accepts any
   * assertion.
   */
  function expect(value: unknown): unknown {
    if (typeof value === "function") {
      const result: unknown = (value as () => unknown)()
      if (result instanceof Promise) pending.push(result)
    }
    return anything
  }

  const vitest = {
    describe,
    it,
    test: it,
    beforeEach: (hook: () => unknown) => suites.at(-1)?.beforeEach.push(hook),
    afterEach: (hook: () => unknown) => suites.at(-1)?.afterEach.push(hook),
    beforeAll: (hook: () => unknown) => hook(),
    afterAll: () => undefined,
    // Tests also use helpers such as `expect.stringContaining()`.
    expect: new Proxy(expect, { get: () => anything }),
    vi: anything,
  }
  const mermaidAPI = withRecorders({
    parse: (text: unknown) => Promise.resolve(record(text)),
    render: (_id: unknown, text: unknown) => Promise.resolve(record(text)),
  })
  const requirementDb = withRecorders({ ...REQUIREMENT_DB_TABLES })
  // These maps must be iterable for publishedModel(), but missing lookups
  // still accept assertions on their properties like the other Db stubs.
  const usecaseElements = new Map<string, unknown>()
  usecaseElements.get = () => anything
  const usecaseDb = withRecorders({
    getActors: () => usecaseElements,
    getUseCases: () => usecaseElements,
    getSystemBoundaries: () => usecaseElements,
    getNotes: () => new Map(),
    getJsonNodes: () => new Map(),
    getClassDefs: () => new Map(),
    getRelationships: () => [],
    getDirection: () => "LR",
    getAST: () => ({
      nodes: {},
      edges: [],
      groups: {},
      statements: [],
      source: "",
    }),
    getData: () => ({ nodes: [], edges: [] }),
  })
  const stubs: Record<string, Record<string, unknown>> = {
    "diagrams/usecase/parser/usecase.chevrotain.js": {
      parser: {
        parse: (text: unknown) => {
          record(text)
          // These two upstream helpers catch the error and read its message
          // before continuing to more parse calls. Supply an assertion-only
          // error; do not decide acceptance or copy the parser's semantics.
          const stack = new Error("stack").stack ?? ""
          if (
            stack.includes("at expectExactSemanticError (") ||
            stack.includes("at expectGrammarErrorAt (")
          ) {
            throw new Error("recorded parser rejection")
          }
          return anything
        },
      },
    },
    "diagrams/usecase/parser/usecase.lexer.js": {
      usecaseLexer: withRecorders({ tokenize: record }),
    },
    "diagrams/usecase/parser/usecase.parser.js": { usecaseParser: anything },
    "diagrams/usecase/usecaseDb.js": { db: usecaseDb },
    "diagrams/usecase/usecaseTypes.js": { ARROW_TYPE: anything },
    "diagrams/usecase/styles.js": { default: anything },
    "diagrams/common/common.js": { sanitizeText: (text: unknown) => text },
    vitest,
    "diagrams/agentflow/parser/agentflowParser.js": {
      default: { parser: { parse: record, yy: anything }, parse: record },
    },
    "diagrams/agentflow/agentflowDb.js": { AgentFlowDB: anything },
    "diagrams/agentflow/diagnostics.js": {
      AgentflowWarning: new Proxy({}, { get: (_target, key) => key }),
      PARSER_EMITTED_DIAGNOSTICS: new Set([
        "SHAPE_UNSUPPORTED",
        "SHAPE_REMOVED",
        "CONTAINMENT_VIOLATION",
      ]),
      RESERVED_DIAGNOSTICS: new Set(),
    },
    "diagrams/agentflow/transformData.js": { transformData: anything },
    "diagrams/agentflow/colorSlots.js": { KIND_COUNT: 7 },
    "diagrams/agentflow/conformance/runner.js": {
      matchExpected: anything,
      runFixture: record,
    },
    "diagrams/flowchart/parser/flowParser.ts": {
      default: { parser: { parse: record, yy: anything }, parse: record },
    },
    "diagrams/flowchart/flowDb.js": { FlowDB: anything },
    "diagrams/sequence/sequenceDb.js": { SequenceDB: anything },
    "diagrams/class/parser/classDiagram.jison": {
      parser: { parse: record, yy: anything },
    },
    "diagrams/class/classDb.js": { ClassDB: anything },
    "diagrams/state/parser/stateDiagram.jison": {
      default: { parser: { parse: record, yy: anything }, parse: record },
      parser: { parse: record, yy: anything },
    },
    "diagrams/state/stateDb.js": { StateDB: anything },
    "diagrams/state/stateCommon.js": { DEFAULT_DIAGRAM_DIRECTION: anything },
    "diagrams/er/parser/erDiagram.jison": {
      default: { parser: { parse: record, yy: anything }, parse: record },
    },
    "diagrams/er/erDb.js": { ErDB: anything },
    "diagrams/gantt/parser/gantt.jison": {
      parser: { parse: record, yy: anything },
    },
    "diagrams/gantt/ganttDb.js": { default: anything },
    "diagrams/user-journey/parser/journey.jison": {
      parser: { parse: record, yy: anything },
    },
    "diagrams/user-journey/journeyDb.js": { default: anything },
    "diagrams/requirement/parser/requirementDiagram.jison": {
      default: { parser: { parse: record, yy: anything }, parse: record },
    },
    "diagrams/mindmap/parser/mindmap.jison": {
      parser: { parse: record, yy: anything },
    },
    "diagrams/mindmap/mindmapDb.js": { MindmapDB: anything },
    "diagrams/timeline/parser/timeline.jison": {
      parser: { parse: record, yy: anything },
    },
    "diagrams/timeline/timelineDb.js": {
      clear: anything,
      getDirection: anything,
      getSections: anything,
      getTasks: anything,
    },
    "diagrams/common/commonDb.js": {
      getDiagramTitle: anything,
      getAccTitle: anything,
      getAccDescription: anything,
    },
    "diagrams/xychart/parser/xychart.jison": {
      parser: { parse: record, yy: anything },
    },
    "diagrams/quadrant-chart/parser/quadrant.jison": {
      parser: { parse: record, yy: anything },
    },
    "diagrams/venn/parser/venn.jison": {
      default: { parser: { parse: record, yy: anything }, parse: record },
    },
    "diagrams/venn/vennDB.js": { db: anything },
    "diagrams/ishikawa/parser/ishikawa.jison": {
      parser: { parse: record, yy: anything },
    },
    "diagrams/ishikawa/ishikawaDb.js": { IshikawaDB: anything },
    "diagrams/kanban/parser/kanban.jison": {
      parser: { parse: record, yy: anything },
    },
    "diagrams/kanban/kanbanDb.js": { default: anything },
    "diagrams/c4/parser/c4Diagram.jison": {
      default: { parser: { parse: record, yy: anything } },
    },
    "diagrams/c4/c4Db.js": {
      default: withRecorders({ getC4ShapeArray: () => [anything] }),
    },
    "diagrams/block/parser/block.jison": {
      default: { parser: { parse: record, yy: anything }, parse: record },
    },
    "diagrams/block/blockDB.js": { default: anything },
    "diagrams/block/styles.js": { default: anything },
    "diagrams/sankey/parser/sankey.jison": {
      default: { parser: { parse: record, yy: anything } },
    },
    "diagrams/sankey/sankeyDB.js": { default: anything },
    "diagrams/sankey/sankeyUtils.js": {
      prepareTextForParsing: (text: unknown) => text,
    },
    fs: { readFileSync: (name: string) => readFileSync(name, "utf8") },
    path: { resolve: (...parts: string[]) => path.resolve(...parts) },
    "node:fs": { existsSync, readFileSync },
    "node:path": {
      // The docs spec resolves its page from process.cwd(), which belongs
      // to this repository while collecting; read the checkout's page.
      resolve: (...parts: string[]) =>
        parts.at(-1) === "packages/mermaid/src/docs/syntax/usecase.md" ||
        parts.at(-1) === "src/docs/syntax/usecase.md"
          ? path.join(mermaidSource, "docs/syntax/usecase.md")
          : path.resolve(...parts),
    },
    "diagrams/requirement/requirementDb.js": {
      RequirementDB: new Proxy(anything as object, {
        construct: () => requirementDb as object,
      }),
    },
    "config.js": Object.fromEntries(
      (STUBBED_MODULES["config.js"] ?? []).map((name) => [name, anything]),
    ),
    "diagram-api/comments.js": { cleanupComments: (text: unknown) => text },
    "tests/util.js": { jsdomIt: it },
    "diagram-api/detectType.js": { detectors: {} },
    "logger.js": { log: anything, setLogLevel: anything },
    "mermaidAPI.js": { mermaidAPI, default: mermaidAPI },
    "mermaid.js": {
      default: withRecorders({
        parse: (text: unknown) => Promise.resolve(record(text)),
        render: (_id: unknown, text: unknown) => Promise.resolve(record(text)),
      }),
    },
    "Diagram.js": {
      Diagram: withRecorders({
        fromText: (text: unknown) => Promise.resolve(record(text)),
      }),
    },
    "diagram-api/diagramAPI.js": {
      setSiteConfig: anything,
      setConfig: anything,
      setLogLevel: anything,
      getDiagram: anything,
    },
    "diagram-api/diagram-orchestration.js": { addDiagrams: () => undefined },
  }

  // Most test files use vitest's functions as globals, without importing them.
  const saved = Object.fromEntries(
    [...Object.keys(vitest), STUBS_GLOBAL, "__dirname"].map((name) => [
      name,
      Object.getOwnPropertyDescriptor(globalThis, name),
    ]),
  )
  // A spec file that reads a file next to it takes the directory from this
  // global, as it does under vitest.
  Object.assign(globalThis, vitest, {
    [STUBS_GLOBAL]: stubs,
    __dirname: path.dirname(file),
  })
  try {
    await import(copyUrl)
    for (const test of tests) {
      currentTest = test.titles
      const handedToExpect: Promise<unknown>[] = []
      pending = handedToExpect
      const steps = [
        ...test.suites.flatMap((suite) => suite.beforeEach),
        () => test.body(...test.args),
        ...test.suites.toReversed().flatMap((suite) => suite.afterEach),
        () => Promise.all(handedToExpect),
      ]
      for (const step of steps) {
        try {
          await step()
        } catch (error) {
          failures.push({
            test: test.titles.join(" > "),
            error: error instanceof Error ? error.message : String(error),
          })
          break
        }
      }
    }
  } finally {
    for (const [name, descriptor] of Object.entries(saved)) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor)
      else Reflect.deleteProperty(globalThis, name)
    }
  }
  if (unlocated) {
    throw new Error(
      `${file}: the line of ${unlocated} parse calls was not found`,
    )
  }
  const withNaN = recorded.filter((input) => input.text.includes("NaN"))
  if (withNaN.length) {
    throw new Error(
      `${file}: texts that contain NaN, which a stub may have produced, at lines ${withNaN.map((input) => input.line).join(", ")}`,
    )
  }
  return { inputs: recorded, tests: tests.length, failures }
}

/**
 * Writes a copy of the test file whose import paths point at stub modules,
 * written next to it, and returns its path. Only the text between the quotes
 * of each import path changes, so every line keeps its number.
 */
function writeCopyWithStubs(
  file: string,
  mermaidSource: string,
  workDir: string,
): string {
  const source = readFileSync(file, "utf8")
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest)
  let copy = ""
  let copied = 0
  for (const specifier of moduleSpecifiers(sourceFile)) {
    const key = specifier.text.startsWith(".")
      ? path
          .relative(
            mermaidSource,
            path.resolve(path.dirname(file), specifier.text),
          )
          .split(path.sep)
          .join("/")
      : specifier.text
    const exports = STUBBED_MODULES[key]
    if (!exports) {
      throw new Error(`${file} imports ${specifier.text}, which has no stub`)
    }
    const stubFile = path.join(workDir, `${key.replaceAll("/", "__")}.mjs`)
    writeFileSync(stubFile, stubModuleSource(key, exports))
    // Replace what is between the quotes.
    copy += source.slice(copied, specifier.getStart(sourceFile) + 1)
    copy += pathToFileURL(stubFile).href
    copied = specifier.getEnd() - 1
  }
  copy += source.slice(copied)
  const extension = file.endsWith(".ts") ? ".mts" : ".mjs"
  const copyPath = path.join(
    workDir,
    `${path.basename(file).replace(/\.[jt]s$/u, "")}${extension}`,
  )
  writeFileSync(copyPath, copy)
  return copyPath
}

/**
 * The module paths a test file loads, in the order they appear: those of its
 * import declarations, and those of `import("...")` calls with a literal path
 * (some tests load a module inside a test). A type-only import is left out:
 * Node removes it with the other types, so it loads nothing.
 */
function moduleSpecifiers(sourceFile: ts.SourceFile): ts.StringLiteral[] {
  const specifiers: ts.StringLiteral[] = []

  /**
   * Collects the specifiers in `node` and its descendants.
   */
  function visit(node: ts.Node): void {
    if (ts.isImportDeclaration(node)) {
      if (
        !node.importClause?.isTypeOnly &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        specifiers.push(node.moduleSpecifier)
      }
      return
    }
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword
    ) {
      const [argument] = node.arguments
      if (argument && ts.isStringLiteral(argument)) specifiers.push(argument)
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return specifiers
}

/**
 * The source of a stub module: it re-exports the stub registered under `key`.
 */
function stubModuleSource(key: string, exports: readonly string[]): string {
  const module = `globalThis[${JSON.stringify(STUBS_GLOBAL)}][${JSON.stringify(key)}]`
  return exports
    .map((name) =>
      name === "default"
        ? `export default ${module}.default;\n`
        : `export const ${name} = ${module}.${name};\n`,
    )
    .join("")
}

/**
 * Formats a test title the way `it.each` does for the placeholders the test
 * files use (`%s`, `%d`, `%i`).
 */
function formatTitle(title: string, args: readonly unknown[]): string {
  let index = 0
  return title.replaceAll(/%[dis]/gu, () => String(args[index++]))
}
