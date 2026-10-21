/**
 * The shape kinds of known opening and closing pairs, from the block Db
 * summary. Other openings or pairs give no shape kind.
 */
export const BLOCK_SHAPES: Readonly<
  Record<string, Readonly<Record<string, string>> | undefined>
> = {
  "[": { "]": "square" },
  "(": { ")": "round" },
  "((": { "))": "circle" },
  "(((": { ")))": "doublecircle" },
  "([": { "])": "stadium" },
  "[[": { "]]": "subroutine" },
  "[(": { ")]": "cylinder" },
  "{": { "}": "diamond" },
  "{{": { "}}": "hexagon" },
  ">": { "]": "rect_left_inv_arrow" },
  "[/": { "/]": "lean_right", "\\]": "trapezoid" },
  "[\\": { "\\]": "lean_left", "/]": "inv_trapezoid" },
}

/**
 * The directions the drawing reads, with an axis expanded into its two ends.
 * A direction with whitespace has no entry: the drawing does not read it.
 */
export const BLOCK_DIRECTIONS: Readonly<
  Record<string, readonly string[] | undefined>
> = {
  right: ["right"],
  left: ["left"],
  up: ["up"],
  down: ["down"],
  x: ["left", "right"],
  y: ["up", "down"],
}
