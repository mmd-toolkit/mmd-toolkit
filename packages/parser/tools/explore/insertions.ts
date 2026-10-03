/**
 * The inputs of the insertion tests (`<diagram>-insertions.test.ts`): texts
 * put at the places of the fixture inputs that `parse()` accepts, chosen by
 * the kinds of the places, so that every kind that the fixtures have is
 * tried with every text, and none by chance.
 *
 * The places and their kinds come from `findBoundaries` and
 * `findInnerPlaces` of `@mmd-toolkit/tests`. The kind of a boundary is the
 * element before it, where it stands in its line, the element after it, and
 * the statement of its line; the kind of a place inside a token is the
 * token, the place, and the statement. Only the places after the line of
 * the diagram header are taken: the places up to it are the same in every
 * diagram type and belong to the common tests.
 *
 * What is put where:
 *
 * - each of the boundary strings ({@link BOUNDARY_FAMILIES} and the
 *   separators of the diagram's grammar) at one place of each boundary kind;
 * - each of {@link INNER_FAMILIES} at one place of each inner kind;
 * - each of {@link LINE_END_SEQUENCES} and the diagram's own lines at one
 *   place of each boundary kind at the end of a line;
 * - {@link UNCLOSED_DIRECTIVE} at one place of each boundary kind where
 *   nothing but whitespace follows;
 * - one string, taking turns, at a second place of each kind, in another
 *   fixture where one has the kind: a kind can be coarser than what decides
 *   a reading.
 *
 * Each string of a family has a reading of its own that the others of the
 * family do not have; the reason is given with each.
 */
import type { Fixture, InnerPlace, TextBoundary } from "@mmd-toolkit/tests"
import {
  findBoundaries,
  findInnerPlaces,
  selectByKey,
} from "@mmd-toolkit/tests"
import type { MutationInput } from "@mmd-toolkit/tests/mutation"
import { outcomeOf } from "../../tests/helpers/known-divergences.ts"

/** A family of strings put at a place, by name. */
interface Family {
  readonly name: string
  readonly strings: readonly string[]
}

const DIRECTIVE = "%%{init: {}}%%"

/** A directive that is not closed: it runs to the end of the text. */
const UNCLOSED_DIRECTIVE = "%%{init: {}"

/** The line separator U+2028; U+2029 is read as it is everywhere. */
const LINE_SEPARATOR = "\u2028"

/** The strings put at a boundary in every diagram type. */
const BOUNDARY_FAMILIES: readonly Family[] = [
  {
    name: "whitespace",
    // A space is the base; a tab is read apart from a space where a single
    // space is looked for (a class member name), and two spaces where the
    // number of spaces is (the `:` of a state note).
    strings: [" ", "\t", "  "],
  },
  {
    name: "line separator",
    // Whitespace that ends no line, and starts a comment (common.md).
    strings: [LINE_SEPARATOR],
  },
  {
    name: "line break",
    // `\r` alone makes one line terminator with a `\n` after it, or ends a
    // line itself, by the source (common.md, Line terminators).
    strings: ["\n", "\r"],
  },
  {
    name: "semicolon",
    // A separator, or ignored by the line rule.
    strings: [";"],
  },
  {
    name: "comment",
    strings: [
      // A diagram comment after a unit, which can take the line break or
      // the character before it.
      "%% c",
      // A comment in sequence and state, a character elsewhere.
      "#c",
      // A comment in sequence, a character elsewhere.
      "% c",
      // A comment line.
      "\n%% c",
      // A comment line with nothing after `%%`.
      "\n%%",
      // A line that looks like a directive.
      "\n%%{ }%%",
      // A comment line after a line of whitespace, which its region takes.
      "\n  \n%% c",
    ],
  },
  {
    name: "empty line",
    strings: ["\n\n"],
  },
  {
    name: "directive",
    strings: [
      // Touching the units on both sides: inside a unit or between two.
      DIRECTIVE,
      // Whitespace before only, after only, and on both sides.
      ` ${DIRECTIVE}`,
      `${DIRECTIVE} `,
      ` ${DIRECTIVE} `,
      // Two in a row: the second starts where the first ends.
      `${DIRECTIVE}${DIRECTIVE}`,
    ],
  },
  {
    name: "broken directive",
    // Not closed, so read as a comment or as characters; with content,
    // without, and as a line of its own.
    strings: ["%%{}", "%%{", "\n%%{}\n"],
  },
  {
    name: "empty block",
    // The start of a statement, before a separator, or inside a statement.
    strings: ["accDescr {}"],
  },
  {
    name: "word character",
    // The rest of a word, or the start of a new one.
    strings: ["x"],
  },
]

/** The strings put inside a token, in every diagram type. */
const INNER_FAMILIES: readonly Family[] = [
  {
    name: "directive",
    // Allowed inside RawText, Identifier, and String, rejected inside any
    // other unit.
    strings: [DIRECTIVE],
  },
  {
    name: "semicolon",
    // Cuts the token, or ignored by the line rule.
    strings: [";"],
  },
  {
    name: "whitespace",
    // Makes two tokens, or is whitespace inside a value.
    strings: [" "],
  },
  {
    name: "comment start",
    // Starts a comment, or is characters of a value.
    strings: ["%%"],
  },
  {
    name: "entity",
    // A named entity, a numbered one, and one that starts with a word
    // character.
    strings: ["#amp;", "#35;", "#x;"],
  },
  {
    name: "line separator",
    // A character of a value, or a separator.
    strings: [LINE_SEPARATOR],
  },
]

/** A piece of a sequence put at the end of a line. */
type PieceName =
  | "separator"
  | "semicolon"
  | "space"
  | "lineBreak"
  | "commentLine"
  | "directive"
  | "brokenDirective"
  | "unclosedDirective"

/** The string of each piece. */
const PIECES: Readonly<Record<PieceName, string>> = {
  separator: LINE_SEPARATOR,
  semicolon: ";",
  space: " ",
  lineBreak: "\n",
  commentLine: "\n%% c",
  directive: DIRECTIVE,
  brokenDirective: "%%{}",
  unclosedDirective: UNCLOSED_DIRECTIVE,
}

/**
 * The sequences put at the end of a line: those of the failures that were
 * found in the gap between two statements, a U+2028 and a `;` in either
 * order, with a line break or a comment line after, and a directive with
 * whitespace or a line break around it.
 */
const LINE_END_SEQUENCES: readonly (readonly PieceName[])[] = [
  ["separator", "lineBreak"],
  ["separator", "semicolon"],
  ["semicolon", "separator"],
  ["directive", "semicolon"],
  ["separator", "commentLine"],
  ["separator", "semicolon", "commentLine"],
  ["separator", "semicolon", "semicolon"],
  ["semicolon", "separator", "commentLine"],
  ["separator", "directive", "semicolon"],
  ["space", "directive", "space"],
  ["lineBreak", "directive"],
  ["lineBreak", "brokenDirective", "lineBreak"],
  // A directive that is not closed stops before a U+2028.
  ["unclosedDirective", "separator"],
]

/** What the insertions of one diagram type add to those of every diagram. */
export interface DiagramInsertions {
  /**
   * The separators of the grammar, one for each rule that reads them: each
   * starts a context of its own, or ends one.
   */
  readonly separators: readonly string[]
  /**
   * The lines put at the end of a line, such as a line of an id that starts
   * with a keyword.
   */
  readonly lines: readonly string[]
}

/**
 * An id that starts with `keyword`: the keyword with a word character after
 * its first word, which the rule of the keyword does not take.
 */
export function idStartingWith(keyword: string): string {
  const space = keyword.indexOf(" ")
  return space === -1
    ? `${keyword}x`
    : `${keyword.slice(0, space)}x${keyword.slice(space)}`
}

/** A group of inputs that one test checks, with its name. */
export interface InsertionGroup {
  readonly name: string
  readonly inputs: readonly MutationInput[]
}

/** A fixture that `parse()` accepts, with the places of its text after the header line. */
interface FixturePlaces {
  readonly fixture: Fixture
  readonly boundaries: readonly TextBoundary[]
  readonly inner: readonly InnerPlace[]
}

/** A place of a fixture, of any kind. */
interface FixturePlace<Place> {
  readonly fixture: Fixture
  readonly place: Place
}

/** The key of the kind of a boundary. */
function boundaryKey(boundary: TextBoundary): string {
  return `${boundary.before} | ${boundary.position} | ${boundary.after} @ ${boundary.statement}`
}

/** The key of the kind of a place inside a token. */
function innerKey(place: InnerPlace): string {
  return `${place.token} | ${place.position} @ ${place.statement}`
}

/** The places after the header line of each fixture that `parse()` accepts. */
function placesOf(fixtures: readonly Fixture[]): FixturePlaces[] {
  const all: FixturePlaces[] = []
  for (const fixture of fixtures) {
    const outcome = outcomeOf(fixture.input, fixture.config)
    if (outcome.kind !== "tree") continue
    const { text, root } = outcome
    const lineFeed = text.indexOf("\n", root.body.range[0])
    const headerEnd = lineFeed === -1 ? text.length : lineFeed
    const source = {
      text,
      tokens: root.tokens,
      comments: root.comments,
      directives: root.directives,
    }
    all.push({
      fixture,
      boundaries: findBoundaries(source).filter(
        (boundary) => boundary.offset > headerEnd,
      ),
      inner: findInnerPlaces(source).filter(
        (place) => place.offset > headerEnd,
      ),
    })
  }
  return all
}

/** Up to two places of each kind, from different fixtures where two have it. */
function placesByKind<Place>(
  places: readonly FixturePlaces[],
  placesOfFixture: (fixture: FixturePlaces) => readonly Place[],
  keyOf: (place: Place) => string,
): Map<string, FixturePlace<Place>[]> {
  return selectByKey(
    places.map((fixturePlaces) =>
      placesOfFixture(fixturePlaces).map((place) => ({
        fixture: fixturePlaces.fixture,
        place,
      })),
    ),
    2,
    (fixturePlace: FixturePlace<Place>) => keyOf(fixturePlace.place),
  )
}

/** The input of `fixture` with `string` at `offset`, named by the kind `kind`. */
function insertedInput(
  kind: string,
  fixture: Fixture,
  offset: number,
  string: string,
): MutationInput {
  const text = fixture.input
  return {
    name: `${kind} (${fixture.name})`,
    text: `${text.slice(0, offset)}${string}${text.slice(offset)}`,
    ...(fixture.config === undefined ? {} : { config: fixture.config }),
  }
}

/**
 * The name of a string in a group's name: in quotes, with the characters
 * outside ASCII as escapes, so that a U+2028 can be seen.
 */
function shown(string: string): string {
  let escaped = ""
  for (const character of JSON.stringify(string)) {
    const codePoint = character.codePointAt(0) ?? 0
    escaped +=
      codePoint > 0x7e
        ? `\\u${codePoint.toString(16).padStart(4, "0")}`
        : character
  }
  return escaped
}

/**
 * The groups of the insertion inputs of `fixtures`, of one diagram type,
 * each text once (in the first group that makes it); a group whose texts
 * were all made before is left out.
 */
export function insertionGroupsOf(
  fixtures: readonly Fixture[],
  diagram: DiagramInsertions,
): InsertionGroup[] {
  const places = placesOf(fixtures)
  const boundaries = placesByKind(
    places,
    (fixture) => fixture.boundaries,
    boundaryKey,
  )
  const inner = placesByKind(places, (fixture) => fixture.inner, innerKey)
  const boundaryFamilies: readonly Family[] = [
    ...BOUNDARY_FAMILIES,
    { name: "grammar separator", strings: diagram.separators },
  ]
  const groups: InsertionGroup[] = []

  for (const family of boundaryFamilies) {
    for (const string of family.strings) {
      groups.push({
        name: `${family.name} / ${shown(string)}`,
        inputs: [...boundaries].map(([key, [first]]) =>
          insertedInput(key, first.fixture, first.place.offset, string),
        ),
      })
    }
  }
  for (const family of INNER_FAMILIES) {
    for (const string of family.strings) {
      groups.push({
        name: `inside a token / ${family.name} / ${shown(string)}`,
        inputs: [...inner].map(([key, [first]]) =>
          insertedInput(key, first.fixture, first.place.offset, string),
        ),
      })
    }
  }

  const atLineEnd = [...boundaries].filter(
    ([, [first]]) => first.place.position === "lineEnd",
  )
  for (const sequence of LINE_END_SEQUENCES) {
    const string = sequence.map((piece) => PIECES[piece]).join("")
    groups.push({
      name: `line end / ${sequence.join(", ")}`,
      inputs: atLineEnd.map(([key, [first]]) =>
        insertedInput(key, first.fixture, first.place.offset, string),
      ),
    })
  }
  for (const line of diagram.lines) {
    groups.push({
      name: `line end / ${shown(line)}`,
      inputs: atLineEnd.map(([key, [first]]) =>
        insertedInput(key, first.fixture, first.place.offset, line),
      ),
    })
  }
  groups.push({
    name: `text end / ${shown(UNCLOSED_DIRECTIVE)}`,
    inputs: [...boundaries]
      .filter(([, [first]]) => first.place.atEnd)
      .map(([key, [first]]) =>
        insertedInput(
          key,
          first.fixture,
          first.place.offset,
          UNCLOSED_DIRECTIVE,
        ),
      ),
  })

  const boundaryStrings = boundaryFamilies.flatMap((family) => family.strings)
  groups.push({
    name: "second place / a boundary string taking turns",
    inputs: [...boundaries]
      .filter(([, kindPlaces]) => kindPlaces.length === 2)
      .map(([key, [, second]], turn) =>
        insertedInput(
          key,
          second.fixture,
          second.place.offset,
          boundaryStrings[turn % boundaryStrings.length],
        ),
      ),
  })
  const innerStrings = INNER_FAMILIES.flatMap((family) => family.strings)
  groups.push({
    name: "second place / an inner string taking turns",
    inputs: [...inner]
      .filter(([, kindPlaces]) => kindPlaces.length === 2)
      .map(([key, [, second]], turn) =>
        insertedInput(
          key,
          second.fixture,
          second.place.offset,
          innerStrings[turn % innerStrings.length],
        ),
      ),
  })

  const texts = new Set<string>()
  return groups
    .map((group) => ({
      name: group.name,
      inputs: group.inputs.filter((input) => {
        if (texts.has(input.text)) return false
        texts.add(input.text)
        return true
      }),
    }))
    .filter((group) => group.inputs.length > 0)
}
