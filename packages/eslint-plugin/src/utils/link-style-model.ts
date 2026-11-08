import { appendItems } from "./collections.ts"
import { isStrokeDeclaration } from "./spaced-stroke.ts"

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
  private readonly linkIds: string[] = []

  private readonly classesOfLink: string[][] = []

  private readonly stylesOfLink: (readonly Style[])[] = []

  private readonly stylesOfClass = new Map<string, Style[]>()

  private defaultStyles: readonly Style[] = []

  /** The links that a statement writes, in the order of their numbers. */
  public addLinks(ids: readonly string[]): void {
    for (const id of ids) {
      this.linkIds.push(id)
      this.classesOfLink.push([])
      this.stylesOfLink.push([])
    }
  }

  /** `class` and `:::`: the class goes to each link of these ids that exists now. */
  public giveClass(ids: readonly string[], className: string): void {
    this.linkIds.forEach((linkId, number) => {
      if (ids.includes(linkId)) this.classesOfLink[number].push(className)
    })
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
      if (number >= 0 && number < this.linkIds.length) {
        this.stylesOfLink[number] = styles
      }
    }
  }

  /** `linkStyle default`: the styles replace those of the earlier one. */
  public setDefaultStyles(styles: readonly Style[]): void {
    this.defaultStyles = styles
  }

  /**
   * The styles that have a style named `stroke` after them in the styles of
   * some link. Taking the colour of the arrowhead from the first `stroke:` of
   * those styles and the colour of the line from the last, such a style would
   * give the arrowhead a colour other than the one of the line.
   */
  public stylesBeforeLaterStroke(): Set<Style> {
    const before = new Set<Style>()
    this.linkIds.forEach((_, number) => {
      const styles = [
        ...this.classesOfLink[number].flatMap(
          (className) => this.stylesOfClass.get(className) ?? [],
        ),
        ...this.defaultStyles,
        ...this.stylesOfLink[number],
      ]
      let laterStroke = false
      for (const style of styles.reverse()) {
        if (laterStroke) before.add(style)
        if (isStrokeDeclaration(style)) laterStroke = true
      }
    })
    return before
  }
}
