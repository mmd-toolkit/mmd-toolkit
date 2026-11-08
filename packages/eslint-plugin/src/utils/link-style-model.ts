import { appendItems } from "./collections.ts"
import { declarationName } from "./spaced-stroke.ts"

/** A link, with the classes it was given and its own styles. */
interface Link<Style> {
  readonly id: string
  readonly classes: string[]
  styles: readonly Style[]
}

/** Whether the style is named `stroke`, whatever its case and the whitespace around the name. */
function isStrokeDeclaration(style: { readonly value: string }): boolean {
  return declarationName(style.value)?.name.toLowerCase() === "stroke"
}

/**
 * The styles that reach each link of a graph diagram, as mermaid.js assembles
 * them for the path of a link. The model is filled in source order, the way
 * mermaid.js reads the statements: a `class` statement or a `:::` gives its
 * class only to the links that exist at that point, a `linkStyle` replaces the
 * styles that the same link or `default` had, and a `classDef` adds its styles
 * to the class. The styles of a link are then those of its classes, in the order
 * they were given, then those of `linkStyle default`, then its own. It is a
 * class because it keeps that state between the calls of the handlers of a rule,
 * which read the statements one by one, and a function of the statements would
 * need the whole tree of the diagram to read them again.
 */
export class LinkStyleModel<Style extends { readonly value: string }> {
  private readonly links: Link<Style>[] = []

  private readonly stylesOfClass = new Map<string, Style[]>()

  private defaultStyles: readonly Style[] = []

  /** The links that a statement writes, in the order of their numbers. */
  public addLinks(ids: readonly string[]): void {
    for (const id of ids) this.links.push({ id, classes: [], styles: [] })
  }

  /** `class` and `:::`: the class goes to each link of these ids that exists now. */
  public giveClass(ids: readonly string[], className: string): void {
    for (const link of this.links) {
      if (ids.includes(link.id)) link.classes.push(className)
    }
  }

  /** `classDef`: the styles are added to each class; a repeated `classDef` adds more. */
  public defineClasses(
    classNames: readonly string[],
    styles: readonly Style[],
  ): void {
    for (const className of classNames) {
      const known = this.stylesOfClass.get(className)
      if (known === undefined) this.stylesOfClass.set(className, [...styles])
      else appendItems(known, styles)
    }
  }

  /** `linkStyle` with numbers: the styles replace those of each link that exists now. */
  public setLinkStyles(
    numbers: readonly number[],
    styles: readonly Style[],
  ): void {
    for (const number of numbers) {
      const link = this.links[number]
      if (link !== undefined) link.styles = styles
    }
  }

  /** `linkStyle default`: the styles replace those of the earlier one. */
  public setDefaultStyles(styles: readonly Style[]): void {
    this.defaultStyles = styles
  }

  /**
   * The styles that have a style named `stroke` after them in the styles of
   * some link. Such a style is not safe to rewrite: the arrowhead takes its
   * colour from the first `stroke:` of the styles of a link and the line from
   * the last, so a later one leaves the arrowhead with the colour of an earlier
   * style and the line with that of the later one.
   */
  public stylesBeforeLaterStroke(): Set<Style> {
    const before = new Set<Style>()
    for (const link of this.links) {
      const styles = [
        ...link.classes.flatMap(
          (className) => this.stylesOfClass.get(className) ?? [],
        ),
        ...this.defaultStyles,
        ...link.styles,
      ]
      let laterStroke = false
      for (const style of styles.reverse()) {
        if (laterStroke) before.add(style)
        if (isStrokeDeclaration(style)) laterStroke = true
      }
    }
    return before
  }
}
