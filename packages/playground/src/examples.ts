import { diagramData } from "@mermaid-js/examples"

/** One source-loading action in the examples menu. */
export interface Example {
  name: string
  source: string
}

/** A diagram family and all of its selectable examples. */
export interface ExampleGroup {
  name: string
  examples: Example[]
}

// Match the Live Editor's primary diagram buttons, then sort the other families.
const mainDiagrams = [
  "Flowchart",
  "Class",
  "Sequence",
  "Entity Relationship",
  "State",
  "Mindmap",
]

/**
 * Use the Live Editor's official data so every example within a family is
 * available. The upstream MIT notice is distributed in
 * public/licenses/mermaid-examples.txt.
 */
export const exampleGroups: ExampleGroup[] = diagramData
  .map((diagram) => ({
    name: diagram.name
      .replace(" Diagram", "")
      .replace(" Chart", "")
      .replace(" Graph", ""),
    examples: [...diagram.examples]
      .sort(
        (left, right) =>
          Number(Boolean(right.isDefault)) - Number(Boolean(left.isDefault)),
      )
      .map((example) => ({
        name: example.title,
        source: example.code.endsWith("\n")
          ? example.code
          : `${example.code}\n`,
      })),
  }))
  .sort((left, right) => {
    const leftIndex = mainDiagrams.indexOf(left.name)
    const rightIndex = mainDiagrams.indexOf(right.name)
    const leftOrder = leftIndex < 0 ? mainDiagrams.length : leftIndex
    const rightOrder = rightIndex < 0 ? mainDiagrams.length : rightIndex
    return leftOrder - rightOrder || left.name.localeCompare(right.name, "en")
  })

/** Start with the official default Flowchart sample when no source is shared. */
export const defaultSource: string = exampleGroups[0].examples[0].source
