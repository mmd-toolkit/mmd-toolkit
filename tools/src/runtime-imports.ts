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

/** What one module reads at run time. */
export interface RuntimeReads {
  /**
   * The relative paths that it imports or exports from: the import and
   * export declarations, but not those of types only, which Node.js removes,
   * and the calls of `import()` with a string.
   */
  readonly relative: readonly string[]
  /**
   * The reads whose file is not found by following a relative path, each
   * described: an import or an export of a package or of a built-in module of
   * Node.js, a call of `import()`, a call of the global `require`, and
   * `import.meta`, through which a module makes a path of its own.
   */
  readonly untraceable: readonly string[]
}

/** The reads of the module `file`, read from its source. */
export function runtimeReadsOf(file: string): RuntimeReads {
  return runtimeReadsOfSource(file, readFileSync(file, "utf8"))
}

/** The reads of the module `file` whose source is `text`. */
export function runtimeReadsOfSource(file: string, text: string): RuntimeReads {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest)
  const relative: string[] = []
  const untraceable: string[] = []

  /** Takes the module that `specifier` names, as a relative path or not. */
  function take(specifier: ts.Node | undefined, form: string): void {
    if (specifier === undefined || !ts.isStringLiteral(specifier)) {
      untraceable.push(`${form} of a module that is not named by a string`)
    } else if (specifier.text.startsWith(".")) {
      relative.push(specifier.text)
    } else {
      untraceable.push(`${form} of "${specifier.text}"`)
    }
  }

  /** Looks for reads in `node` and everything in it. */
  function visit(node: ts.Node): void {
    if (ts.isImportDeclaration(node)) {
      if (node.importClause?.isTypeOnly !== true) {
        take(node.moduleSpecifier, "an import")
      }
    } else if (ts.isExportDeclaration(node)) {
      if (!node.isTypeOnly && node.moduleSpecifier !== undefined) {
        take(node.moduleSpecifier, "an export")
      }
    } else if (
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
      untraceable.push(`a call of import() at line ${lineOf(source, node)}`)
    } else if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "require"
    ) {
      untraceable.push(`a call of require() at line ${lineOf(source, node)}`)
    } else if (
      ts.isMetaProperty(node) &&
      node.keywordToken === ts.SyntaxKind.ImportKeyword
    ) {
      untraceable.push(`import.meta at line ${lineOf(source, node)}`)
    }
    ts.forEachChild(node, visit)
  }

  visit(source)
  return { relative, untraceable }
}

/** The line, from 1, where `node` starts. */
function lineOf(source: ts.SourceFile, node: ts.Node): number {
  return source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1
}

/** A file that a module reaches, with the reads of it that cannot be followed. */
export interface ReachedFile {
  /** The absolute path of the file. */
  readonly file: string
  /** What `runtimeReadsOf` cannot follow in it, and the relative paths that name no file. */
  readonly untraceable: readonly string[]
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
    const untraceable = [...reads.untraceable]
    for (const imported of reads.relative) {
      const target = path.resolve(path.dirname(file), imported)
      if (existsSync(target)) waiting.push(target)
      else untraceable.push(`"${imported}", which names no file`)
    }
    reached.set(file, { file, untraceable })
  }
  return [...reached.values()]
}
