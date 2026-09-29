import type {
  DirectiveType,
  FileProblem,
  LanguageOptions,
  RulesConfig,
  SourceLocation,
} from "@eslint/core"
import {
  ConfigCommentParser,
  Directive,
  TextSourceCodeBase,
  VisitNodeStep,
} from "@eslint/plugin-kit"
import { TokenStore } from "@ota-meshi/ast-token-store"
import type {
  Comment,
  Directive as MermaidDirective,
  Frontmatter,
  Node,
  Root,
  Token,
} from "@mmd-toolkit/parser"
import { traverseNodes } from "@mmd-toolkit/parser"

/** Everything in the tree that has a range and a location. */
export type MermaidSyntaxElement =
  Node | Token | Comment | MermaidDirective | Frontmatter

/**
 * The tokens and the comments, with the methods of the token store of
 * `@ota-meshi/ast-token-store` (`getFirstToken`, `getTokenBefore`,
 * `getCommentsInside`, `isSpaceBetween`, and the others).
 * Every character of the source that is not whitespace or a line terminator
 * lies in a token or a comment (ast.md), as ESLint expects.
 */
type MermaidTokenStore = TokenStore<MermaidSyntaxElement, Token, Comment>

/** The type parameters of `TextSourceCodeBase` for Mermaid text. */
interface MermaidSourceCodeTypes {
  LangOptions: LanguageOptions
  RootNode: Root
  SyntaxElementWithLoc: MermaidSyntaxElement
  ConfigNode: Comment
}

/**
 * The line terminators of ast.md, Positions: `\r\n`, a lone `\r`, and `\n`.
 * `TextSourceCodeBase` counts lines with this pattern, so that its lines and
 * the `loc` of the tree agree. Its default, `\r?\n`, does not end a line at a
 * lone `\r`.
 */
const LINE_TERMINATOR = /\r\n|[\n\r]/u

/** The label of an inline configuration comment, such as `%% eslint my-rule: off`. */
const INLINE_CONFIG_LABEL = "eslint"

/** The labels of the comments that disable and enable rules, with the type of each. */
const DISABLE_DIRECTIVE_TYPES: ReadonlyMap<string, DirectiveType> = new Map([
  ["eslint-disable", "disable"],
  ["eslint-enable", "enable"],
  ["eslint-disable-line", "disable-line"],
  ["eslint-disable-next-line", "disable-next-line"],
])

/** The steps of a walk over the tree, and the parent of each node. */
interface Walk {
  readonly steps: readonly VisitNodeStep[]
  readonly parents: ReadonlyMap<Node, Node | null>
}

/**
 * The source of one Mermaid file as ESLint sees it: the text, the tree of
 * `@mmd-toolkit/parser`, its comments, and the inline configuration found in
 * the comments. Comments are the `%%` lines of `Root.comments`.
 */
export class MermaidSourceCode extends TextSourceCodeBase<MermaidSourceCodeTypes> {
  /** Every comment, in source order (`Root.comments`). */
  public readonly comments: readonly Comment[]

  // The methods of the token store, as the store defines them. They read
  // `Root.tokens`, which hold the directives and the frontmatter too, and
  // `Root.comments`.
  public readonly getAllComments: MermaidTokenStore["getAllComments"]

  public readonly getFirstToken: MermaidTokenStore["getFirstToken"]

  public readonly getFirstTokens: MermaidTokenStore["getFirstTokens"]

  public readonly getLastToken: MermaidTokenStore["getLastToken"]

  public readonly getLastTokens: MermaidTokenStore["getLastTokens"]

  public readonly getTokenBefore: MermaidTokenStore["getTokenBefore"]

  public readonly getTokensBefore: MermaidTokenStore["getTokensBefore"]

  public readonly getTokenAfter: MermaidTokenStore["getTokenAfter"]

  public readonly getTokensAfter: MermaidTokenStore["getTokensAfter"]

  public readonly getFirstTokenBetween: MermaidTokenStore["getFirstTokenBetween"]

  public readonly getFirstTokensBetween: MermaidTokenStore["getFirstTokensBetween"]

  public readonly getLastTokenBetween: MermaidTokenStore["getLastTokenBetween"]

  public readonly getLastTokensBetween: MermaidTokenStore["getLastTokensBetween"]

  public readonly getTokens: MermaidTokenStore["getTokens"]

  public readonly getTokensBetween: MermaidTokenStore["getTokensBetween"]

  public readonly getCommentsInside: MermaidTokenStore["getCommentsInside"]

  public readonly getCommentsBefore: MermaidTokenStore["getCommentsBefore"]

  public readonly getCommentsAfter: MermaidTokenStore["getCommentsAfter"]

  public readonly commentsExistBetween: MermaidTokenStore["commentsExistBetween"]

  public readonly isSpaceBetween: MermaidTokenStore["isSpaceBetween"]

  readonly #commentParser = new ConfigCommentParser()

  #walk: Walk | null = null

  public constructor({ text, ast }: { text: string; ast: Root }) {
    super({ text, ast, lineEndingPattern: LINE_TERMINATOR })
    this.comments = ast.comments

    const tokenStore = new TokenStore<MermaidSyntaxElement, Token, Comment>({
      tokens: [...ast.tokens, ...ast.comments],
      isComment: (element): element is Comment => element.type === "Comment",
    })
    this.getAllComments = tokenStore.getAllComments.bind(tokenStore)
    this.getFirstToken = tokenStore.getFirstToken.bind(tokenStore)
    this.getFirstTokens = tokenStore.getFirstTokens.bind(tokenStore)
    this.getLastToken = tokenStore.getLastToken.bind(tokenStore)
    this.getLastTokens = tokenStore.getLastTokens.bind(tokenStore)
    this.getTokenBefore = tokenStore.getTokenBefore.bind(tokenStore)
    this.getTokensBefore = tokenStore.getTokensBefore.bind(tokenStore)
    this.getTokenAfter = tokenStore.getTokenAfter.bind(tokenStore)
    this.getTokensAfter = tokenStore.getTokensAfter.bind(tokenStore)
    this.getFirstTokenBetween = tokenStore.getFirstTokenBetween.bind(tokenStore)
    this.getFirstTokensBetween =
      tokenStore.getFirstTokensBetween.bind(tokenStore)
    this.getLastTokenBetween = tokenStore.getLastTokenBetween.bind(tokenStore)
    this.getLastTokensBetween = tokenStore.getLastTokensBetween.bind(tokenStore)
    this.getTokens = tokenStore.getTokens.bind(tokenStore)
    this.getTokensBetween = tokenStore.getTokensBetween.bind(tokenStore)
    this.getCommentsInside = tokenStore.getCommentsInside.bind(tokenStore)
    this.getCommentsBefore = tokenStore.getCommentsBefore.bind(tokenStore)
    this.getCommentsAfter = tokenStore.getCommentsAfter.bind(tokenStore)
    this.commentsExistBetween = tokenStore.commentsExistBetween.bind(tokenStore)
    this.isSpaceBetween = tokenStore.isSpaceBetween.bind(tokenStore)
  }

  /** The parent of `node`, or undefined for the root and for what is not a node. */
  public override getParent(
    node: MermaidSyntaxElement,
  ): MermaidSyntaxElement | undefined {
    return this.#getWalk().parents.get(node as Node) ?? undefined
  }

  /** The walk of `traverseNodes`: each node is entered, then its child nodes, then the node is left. */
  public override traverse(): Iterable<VisitNodeStep> {
    return this.#getWalk().steps
  }

  /** The comments that hold inline configuration or disable rules. */
  public getInlineConfigNodes(): Comment[] {
    return this.comments.filter((comment) => {
      const label = this.#commentParser.parseDirective(comment.value)?.label
      return (
        label !== undefined &&
        (label === INLINE_CONFIG_LABEL || DISABLE_DIRECTIVE_TYPES.has(label))
      )
    })
  }

  /** The comments that disable and enable rules, such as `%% eslint-disable-next-line my-rule`. */
  public getDisableDirectives(): {
    directives: Directive[]
    problems: FileProblem[]
  } {
    const directives: Directive[] = []
    for (const comment of this.getInlineConfigNodes()) {
      const parsed = this.#commentParser.parseDirective(comment.value)
      const type =
        parsed === undefined
          ? undefined
          : DISABLE_DIRECTIVE_TYPES.get(parsed.label)
      if (parsed === undefined || type === undefined) continue
      directives.push(
        new Directive({
          type,
          node: comment,
          value: parsed.value,
          justification: parsed.justification,
        }),
      )
    }
    return { directives, problems: [] }
  }

  /** The rule configurations of the comments such as `%% eslint my-rule: "off"`. */
  public applyInlineConfig(): {
    configs: { loc: SourceLocation; config: { rules: RulesConfig } }[]
    problems: FileProblem[]
  } {
    const configs: { loc: SourceLocation; config: { rules: RulesConfig } }[] =
      []
    const problems: FileProblem[] = []
    for (const comment of this.getInlineConfigNodes()) {
      const parsed = this.#commentParser.parseDirective(comment.value)
      if (parsed === undefined || parsed.label !== INLINE_CONFIG_LABEL) continue
      const result = this.#commentParser.parseJSONLikeConfig(parsed.value)
      if (result.ok) {
        configs.push({ loc: comment.loc, config: { rules: result.config } })
      } else {
        problems.push({
          ruleId: null,
          message: result.error.message,
          loc: comment.loc,
        })
      }
    }
    return { configs, problems }
  }

  /** Walks the tree once, on first use. */
  #getWalk(): Walk {
    if (this.#walk === null) {
      const steps: VisitNodeStep[] = []
      const parents = new Map<Node, Node | null>()
      traverseNodes(this.ast, {
        enterNode(node, parent) {
          parents.set(node, parent)
          steps.push(
            new VisitNodeStep({ target: node, phase: 1, args: [node, parent] }),
          )
        },
        leaveNode(node, parent) {
          steps.push(
            new VisitNodeStep({ target: node, phase: 2, args: [node, parent] }),
          )
        },
      })
      this.#walk = { steps, parents }
    }
    return this.#walk
  }
}
