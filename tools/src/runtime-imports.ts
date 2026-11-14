/**
 * What a module of this repository reads at run time, read from its source
 * with the TypeScript parser, and the set of files that a module reaches
 * through its relative imports.
 *
 * `packages/tests` uses it to check that the files whose code is in the key
 * of the stored mermaid.js results are those that `mermaid.ts` reaches, and
 * `tools/recorded-trees.ts` to know which files decide the result of
 * `checkTree`, so that a change to one of them checks every recorded tree.
 */
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import ts from "typescript"

/**
 * The global names through which a module can read what no file of the
 * repository holds: a built-in module (`process.getBuiltinModule`), the
 * environment (`process.env`), a module named at run time (`require`), and
 * code made at run time (`eval`, `Function`); `globalThis` and `global` reach
 * all of them.
 */
const GLOBAL_READS: ReadonlySet<string> = new Set([
  "process",
  "globalThis",
  "global",
  "require",
  "eval",
  "Function",
])

/** What one module reads at run time. */
export interface RuntimeReads {
  /**
   * The relative paths that it imports or exports from: the import and
   * export declarations, but not those of types only, which Node.js removes,
   * and the calls of `import()` with a string.
   */
  readonly relative: readonly string[]
  /** The modules that its import and export declarations name by a path that is not relative: packages and built-in modules. */
  readonly modules: readonly string[]
  /**
   * The other reads whose file cannot be known from the source, each
   * described: a call of `import()`, `import.meta`, through which a module
   * makes a path of its own, and a reference to a global name of
   * `GLOBAL_READS`.
   */
  readonly dynamic: readonly string[]
}

/** The reads of the module `file`, read from its source. */
export function runtimeReadsOf(file: string): RuntimeReads {
  return runtimeReadsOfSource(file, readFileSync(file, "utf8"))
}

/** Whether the identifier `node` is a name of a member or of a declaration, and not a reference to a global. */
function isNameOfMember(node: ts.Identifier): boolean {
  const parent = node.parent
  return (
    (ts.isPropertyAccessExpression(parent) && parent.name === node) ||
    (ts.isQualifiedName(parent) && parent.right === node) ||
    ((ts.isPropertyAssignment(parent) ||
      ts.isPropertyDeclaration(parent) ||
      ts.isPropertySignature(parent) ||
      ts.isMethodDeclaration(parent) ||
      ts.isMethodSignature(parent) ||
      ts.isGetAccessorDeclaration(parent) ||
      ts.isSetAccessorDeclaration(parent) ||
      ts.isEnumMember(parent)) &&
      parent.name === node)
  )
}

/** The reads of the module `file` whose source is `text`. */
export function runtimeReadsOfSource(file: string, text: string): RuntimeReads {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true)
  const relative: string[] = []
  const modules: string[] = []
  const dynamic: string[] = []

  /** Takes the module that the declaration `node` names. */
  function take(specifier: ts.Node | undefined, node: ts.Node): void {
    if (specifier === undefined || !ts.isStringLiteral(specifier)) {
      dynamic.push(
        `a module that is not named by a string at line ${lineOf(source, node)}`,
      )
    } else if (specifier.text.startsWith(".")) {
      relative.push(specifier.text)
    } else {
      modules.push(specifier.text)
    }
  }

  /** Looks for reads in `node` and everything in it. */
  function visit(node: ts.Node): void {
    if (ts.isImportDeclaration(node)) {
      if (node.importClause?.isTypeOnly !== true) {
        take(node.moduleSpecifier, node)
      }
      // The names that it binds are declarations, not references.
      return
    }
    if (ts.isExportDeclaration(node)) {
      if (!node.isTypeOnly && node.moduleSpecifier !== undefined) {
        take(node.moduleSpecifier, node)
      }
      return
    }
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword
    ) {
      const [specifier] = node.arguments
      if (
        specifier !== undefined &&
        ts.isStringLiteral(specifier) &&
        specifier.text.startsWith(".")
      ) {
        relative.push(specifier.text)
      }
      dynamic.push(`a call of import() at line ${lineOf(source, node)}`)
    } else if (
      ts.isMetaProperty(node) &&
      node.keywordToken === ts.SyntaxKind.ImportKeyword
    ) {
      dynamic.push(`import.meta at line ${lineOf(source, node)}`)
    } else if (
      ts.isIdentifier(node) &&
      GLOBAL_READS.has(node.text) &&
      !isNameOfMember(node)
    ) {
      dynamic.push(`the global ${node.text} at line ${lineOf(source, node)}`)
    }
    ts.forEachChild(node, visit)
  }

  visit(source)
  return { relative, modules, dynamic }
}

/** The line, from 1, where `node` starts. */
function lineOf(source: ts.SourceFile, node: ts.Node): number {
  return source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1
}

/** A file that a module reaches, with the reads of it that cannot be followed. */
export interface ReachedFile {
  /** The absolute path of the file. */
  readonly file: string
  /** The modules that it imports by a path that is not relative. */
  readonly modules: readonly string[]
  /** Its other reads that cannot be followed, and the relative paths that name no file. */
  readonly dynamic: readonly string[]
}

/**
 * The files that `entry` reaches by its relative imports at run time,
 * `entry` itself first, each once, with what cannot be followed in each.
 */
export function runtimeClosureOf(entry: string): ReachedFile[] {
  const reached = new Map<string, ReachedFile>()
  const waiting = [path.resolve(entry)]
  for (let file = waiting.pop(); file !== undefined; file = waiting.pop()) {
    if (reached.has(file)) continue
    const reads = runtimeReadsOf(file)
    const dynamic = [...reads.dynamic]
    for (const imported of reads.relative) {
      const target = path.resolve(path.dirname(file), imported)
      if (existsSync(target)) waiting.push(target)
      else dynamic.push(`"${imported}", which names no file`)
    }
    reached.set(file, { file, modules: reads.modules, dynamic })
  }
  return [...reached.values()]
}
