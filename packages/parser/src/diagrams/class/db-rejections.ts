import type { Range } from "../../ast.ts"
import type {
  ClassName,
  ClassNamespaceStatement,
  ClassStatement,
} from "../../ast/class.ts"
import { ParseError } from "../../errors.ts"
import type { LineIndex } from "../../positions.ts"
import { classIdOf } from "./names.ts"

/** Statements being walked, and the next one to apply. */
interface StatementWalk {
  readonly statements: readonly (
    ClassStatement | ClassNamespaceStatement["body"][number]
  )[]
  next: number
}

/**
 * diagrams/class.md, Rejections outside the grammar: the inputs that the
 * grammar accepts and mermaid.js rejects while it builds the Db. The
 * statements are walked in source order, the items of a namespace where
 * the namespace stands, and the walk keeps the ids of the classes added so
 * far. The first statement that makes the input rejected throws a
 * `ParseError` there. A
 * method line that cannot be divided, the other rejection of the section,
 * is made by the lexer, which divides the member lines.
 */
export class ClassDbRejections {
  private readonly lines: LineIndex

  /** Names: the written name of each class name. */
  private readonly writtenNames: ReadonlyMap<ClassName, string>

  /** The ids of the classes added so far. */
  private readonly classes = new Set<string>()

  public constructor(
    lines: LineIndex,
    writtenNames: ReadonlyMap<ClassName, string>,
  ) {
    this.lines = lines
    this.writtenNames = writtenNames
  }

  /**
   * Walks `statements`, the body of the diagram, in source order; throws
   * `ParseError` at the first rejection. Namespaces nest without a limit, so
   * `walks` holds the bodies being walked, the innermost last: a call for
   * each of them would exhaust the call stack.
   */
  public check(statements: readonly ClassStatement[]): void {
    const walks: StatementWalk[] = [{ statements, next: 0 }]
    for (let walk = walks.at(-1); walk !== undefined; walk = walks.at(-1)) {
      if (walk.next === walk.statements.length) {
        walks.pop()
      } else {
        walk.next += 1
        this.apply(walk.statements[walk.next - 1], walks)
      }
    }
  }

  /**
   * Rejections outside the grammar: which classes one statement adds, in the
   * order of the Db, and the check of an annotation statement. The body of a
   * namespace goes on `walks`, where it is walked before the statement after
   * this one.
   */
  private apply(
    statement: ClassStatement | ClassNamespaceStatement["body"][number],
    walks: StatementWalk[],
  ): void {
    switch (statement.type) {
      case "ClassDeclaration":
        this.add(statement.name)
        return
      case "ClassMemberStatement":
        this.add(statement.class)
        return
      case "ClassRelationStatement":
        // Relations: a lollipop at one end alone adds an interface in place
        // of the class at that end, and only the class at the other end.
        if (
          statement.arrow.startMarker === "lollipop" &&
          statement.arrow.endMarker === "none"
        ) {
          this.add(statement.to)
        } else if (
          statement.arrow.endMarker === "lollipop" &&
          statement.arrow.startMarker === "none"
        ) {
          this.add(statement.from)
        } else {
          this.add(statement.from)
          this.add(statement.to)
        }
        return
      case "ClassAnnotationStatement":
        if (!this.classes.has(this.idOf(statement.class))) {
          throw this.error(
            "An annotation statement needs a class that exists",
            statement.class.range,
          )
        }
        return
      case "ClassNamespaceStatement":
        walks.push({ statements: statement.body, next: 0 })
        return
      case "ClassNameStatement":
      case "ClassNoteStatement":
      case "ClassCallbackStatement":
      case "ClassLinkStatement":
      case "ClassStyleStatement":
      case "ClassCssClassStatement":
      case "ClassClassDefStatement":
      case "ClassDirectionStatement":
      case "ClassAccTitleStatement":
      case "ClassAccDescrStatement":
      case "ClassAccDescrBlockStatement":
        return
      default:
        throw new Error(
          `mmd-toolkit parser bug: unknown statement ${JSON.stringify(statement satisfies never)}`,
        )
    }
  }

  /** Adding a class: adds the class of the class name `name` where it is not there yet. */
  private add(name: ClassName): void {
    this.classes.add(this.idOf(name))
  }

  /** Names: the id of the written name of `name`. */
  private idOf(name: ClassName): string {
    const writtenName = this.writtenNames.get(name)
    if (writtenName === undefined) {
      throw new Error(
        `mmd-toolkit parser bug: the class name at ${name.range[0]} has no written name`,
      )
    }
    return classIdOf(writtenName)
  }

  /** The `ParseError` of a rejection at `range`. */
  private error(message: string, range: Range): ParseError {
    return new ParseError(message, range, this.lines.location(range))
  }
}
