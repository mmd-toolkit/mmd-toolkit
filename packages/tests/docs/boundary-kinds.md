# Kinds of places in a text

Japanese version: [boundary-kinds.ja.md](./boundary-kinds.ja.md)

This document explains the kinds that `@mmd-toolkit/tests` gives to the places
in a text where a generated or differential test puts something, and how to
choose places by kind.

## Why kinds

An implementation of the syntax fails at a place that has a kind: a directive
between a keyword and its name, a `;` at the end of a `title`, a character in
the middle of a long word. A test that puts a text at every place repeats the
same check on the same kind of place, and a test that puts it at every hundredth
place covers the kinds by chance. A test that takes a few places of each kind
covers every kind that the fixtures have, and a kind that no fixture has is a
kind to add.

## The two sets of places

A **boundary** is an offset where a token, a comment, or a directive starts or
ends. Its kind has four parts:

- `before` and `after` describe the element that ends or starts there, or `-`
  where there is none. A token is described by its type, and by its value
  (lower-cased, cut at 14 characters) when it is a `Keyword` or a `Punctuator`:
  `Keyword:subgraph`, `Punctuator:-->`, `Identifier`. A directive is
  `Directive:closed` or `Directive:open`. A `;` that the line rule ignores as a
  separator is a token of the type `IgnoredSemicolon`. A comment is `Comment:`
  and its mark (`%%`, `#`, `%`), or `Comment:fragment` for the text after a
  comment line that cut a diagram comment, which has no mark.
- `position` is where the offset stands in its line: `start` (the start of the
  text), `lineStart`, `lineEnd`, or `mid`.
- `statement` is the statement of the line: its first token, as the lower-cased
  value of a keyword (`box`) or the type of any other token, or `-` where the
  line has no token. It is a part of the kind at every position, so that, for
  example, what ends a `box`, a `title` or a `subgraph` is told apart from the
  same token elsewhere, and so is what stands in the middle of such a line.

A **place inside a token** is, in a token of two or more characters (a directive
excepted; a comment is not a token), after its first character, in its middle
(the character half the length from the start, rounded down), and before its
last character. Each offset is one place: a token of two characters has
`after first` only, one of three has `after first` and `before last`, and the
middle is a place of its own from four characters. A character is a code point,
so a place is never between the two halves of a surrogate pair. Its kind has
three parts: `token`, the description of the token as above; `position`, which
is `after first`, `middle` or `before last`; and `statement`, the statement of
the line of the place, as for a boundary.

## The functions

All three are exported by `@mmd-toolkit/tests`.

- `findBoundaries(source)` returns the boundaries of one text, each with its
  `offset`, the four parts of its kind (`before`, `position`, `statement`,
  `after`), and `atEnd` (whether only whitespace follows it).
- `findInnerPlaces(source)` returns the places inside the tokens, each with its
  `offset` and the three parts of its kind (`token`, `position`, `statement`).
- `selectByKey(lists, perKey, keyOf)` takes up to `perKey` places of each key
  from lists of places, one list for each text: the first place of a key in each
  list, in list order, and then the next ones until `perKey`. `keyOf` makes the
  key of a place. It returns a map from the key to the places.

The functions return the parts of a kind, and the caller joins the parts it
wants into the key, which decides how fine the kinds are: a key of all four
parts of a boundary is the finest. The formatter's tests, for example, name the
statement only at a line end.

`source` is the structure of a parsed text as plain values, so that this package
does not depend on a parser: `text`; `tokens` (`type`, `value`, `range`);
`comments` (`mark`, `range`); and `directives` (`closed`, `range`). The `Root`
of `@mmd-toolkit/parser` has them.

```js
import { findBoundaries, loadFixtures, selectByKey } from "@mmd-toolkit/tests"

/** The key that names the statement everywhere. */
function finestKey(boundary) {
  const { before, position, statement, after } = boundary
  return `${before} | ${position} | ${statement} | ${after}`
}

// `parse` is the parser under test.
async function boundariesByKey(parse) {
  const lists = []
  for (const fixture of await loadFixtures("flowchart")) {
    const { tokens, comments, directives } = parse(fixture.input)
    const source = { text: fixture.input, tokens, comments, directives }
    lists.push(
      findBoundaries(source).map((boundary) => ({ ...boundary, fixture })),
    )
  }
  return selectByKey(lists, 2, finestKey)
}
```

A text that the parser rejects has no tokens to read, so its list is empty or
left out.
