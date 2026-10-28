import { RangeIndex } from "../range-index.ts"
import type { CheckedRoot, CheckedToken } from "./types.ts"

/** Token endpoints used by whitespace and note checks. */
class TokenIndex extends RangeIndex<CheckedToken> {
  private readonly tokensByStart = new Map<number, CheckedToken[]>()

  private readonly tokensByEnd = new Map<number, CheckedToken[]>()

  public constructor(tokens: readonly CheckedToken[]) {
    super(tokens)
    // Endpoint reads must also avoid searching the entire token list per value.
    for (const token of tokens) {
      const starts = this.tokensByStart.get(token.range[0]) ?? []
      starts.push(token)
      this.tokensByStart.set(token.range[0], starts)
      const ends = this.tokensByEnd.get(token.range[1]) ?? []
      ends.push(token)
      this.tokensByEnd.set(token.range[1], ends)
    }
  }

  /** Tokens starting at `offset`, in tree order. */
  public startingAt(offset: number): readonly CheckedToken[] {
    return this.tokensByStart.get(offset) ?? []
  }

  /** Tokens ending at `offset`, in tree order. */
  public endingAt(offset: number): readonly CheckedToken[] {
    return this.tokensByEnd.get(offset) ?? []
  }
}

const indexes = new WeakMap<CheckedRoot, TokenIndex>()

/** The source ranges of a tree's tokens. */
export function tokenIndexOf(root: CheckedRoot): TokenIndex {
  return indexes.get(root) ?? new TokenIndex(root.tokens)
}

/** Share one index during a check; a later check may read a modified tree. */
export function withTokenIndex<T>(root: CheckedRoot, check: () => T): T {
  // Scope the index to one check so callers need not keep trees immutable.
  const previous = indexes.get(root)
  indexes.set(root, new TokenIndex(root.tokens))
  try {
    return check()
  } finally {
    if (previous === undefined) indexes.delete(root)
    else indexes.set(root, previous)
  }
}
