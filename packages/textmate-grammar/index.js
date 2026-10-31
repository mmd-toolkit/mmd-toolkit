// The Mermaid grammar of the playground and the documentation site, written
// from the specification of this repository (packages/spec/docs). The rules
// that every diagram type shares are in grammar/common.grammar.json, and the
// rules of each diagram type in grammar/diagrams/<type>.grammar.json, one file
// per document of packages/spec/docs/diagrams/. This module puts them together
// into one grammar for Shiki.
import common from "./grammar/common.grammar.json" with { type: "json" }
import agentflow from "./grammar/diagrams/agentflow.grammar.json" with { type: "json" }
import architecture from "./grammar/diagrams/architecture.grammar.json" with { type: "json" }
import block from "./grammar/diagrams/block.grammar.json" with { type: "json" }
import c4 from "./grammar/diagrams/c4.grammar.json" with { type: "json" }
import classDiagram from "./grammar/diagrams/class.grammar.json" with { type: "json" }
import cynefin from "./grammar/diagrams/cynefin.grammar.json" with { type: "json" }
import er from "./grammar/diagrams/er.grammar.json" with { type: "json" }
import eventmodeling from "./grammar/diagrams/eventmodeling.grammar.json" with { type: "json" }
import flowchart from "./grammar/diagrams/flowchart.grammar.json" with { type: "json" }
import gantt from "./grammar/diagrams/gantt.grammar.json" with { type: "json" }
import gitgraph from "./grammar/diagrams/gitgraph.grammar.json" with { type: "json" }
import info from "./grammar/diagrams/info.grammar.json" with { type: "json" }
import ishikawa from "./grammar/diagrams/ishikawa.grammar.json" with { type: "json" }
import journey from "./grammar/diagrams/journey.grammar.json" with { type: "json" }
import kanban from "./grammar/diagrams/kanban.grammar.json" with { type: "json" }
import mindmap from "./grammar/diagrams/mindmap.grammar.json" with { type: "json" }
import packet from "./grammar/diagrams/packet.grammar.json" with { type: "json" }
import pie from "./grammar/diagrams/pie.grammar.json" with { type: "json" }
import quadrant from "./grammar/diagrams/quadrant.grammar.json" with { type: "json" }
import radar from "./grammar/diagrams/radar.grammar.json" with { type: "json" }
import railroad from "./grammar/diagrams/railroad.grammar.json" with { type: "json" }
import requirement from "./grammar/diagrams/requirement.grammar.json" with { type: "json" }
import sankey from "./grammar/diagrams/sankey.grammar.json" with { type: "json" }
import sequence from "./grammar/diagrams/sequence.grammar.json" with { type: "json" }
import state from "./grammar/diagrams/state.grammar.json" with { type: "json" }
import timeline from "./grammar/diagrams/timeline.grammar.json" with { type: "json" }
import treemap from "./grammar/diagrams/treemap.grammar.json" with { type: "json" }
import treeview from "./grammar/diagrams/treeview.grammar.json" with { type: "json" }
import usecase from "./grammar/diagrams/usecase.grammar.json" with { type: "json" }
import venn from "./grammar/diagrams/venn.grammar.json" with { type: "json" }
import wardley from "./grammar/diagrams/wardley.grammar.json" with { type: "json" }
import xychart from "./grammar/diagrams/xychart.grammar.json" with { type: "json" }

/**
 * The diagram types, in the order of the entries of detection.md that select
 * them (flowchart for entries 3, 16 and 17). Each block begins at a header that
 * no other block reads, so the order decides nothing; it keeps the list easy
 * to check against detection.md. Each key is also the prefix required for
 * variables declared by that diagram file.
 */
const diagrams = {
  flowchart,
  mindmap,
  architecture,
  agentflow,
  c4,
  kanban,
  class: classDiagram,
  er,
  gantt,
  info,
  pie,
  requirement,
  sequence,
  timeline,
  gitgraph,
  state,
  journey,
  quadrant,
  sankey,
  packet,
  xychart,
  block,
  eventmodeling,
  treeview,
  radar,
  ishikawa,
  treemap,
  railroad,
  venn,
  wardley,
  cynefin,
  usecase,
}

const grammarParts = [common, ...Object.values(diagrams)]

/** The rule fields that hold a regular expression. */
const regexFields = new Set(["match", "begin", "end", "while"])

/** A variable reference, including the dashes in diagram-specific names. */
const variableReference = /\{\{([\w-]+)\}\}/gu

/** Merges variables, rejecting duplicate names and wrong diagram prefixes. */
function mergeVariables(commonVariables, diagramGrammars) {
  const variables = { ...commonVariables }
  for (const [type, grammar] of Object.entries(diagramGrammars)) {
    for (const [name, value] of Object.entries(grammar.variables ?? {})) {
      if (Object.hasOwn(variables, name)) {
        throw new Error(`the grammar declares the variable {{${name}}} twice`)
      }
      if (!name.startsWith(`${type}-`)) {
        throw new Error(`grammar variable {{${name}}} must start with ${type}-`)
      }
      variables[name] = value
    }
  }
  return variables
}

/** Resolves references between variables, rejecting unknown names and cycles. */
function resolveVariables(variables) {
  const resolved = Object.create(null)
  const resolving = new Set()

  /** Resolves one variable after the variables it references. */
  function resolve(name) {
    if (!Object.hasOwn(variables, name)) {
      throw new Error(`unknown grammar variable {{${name}}}`)
    }
    if (Object.hasOwn(resolved, name)) return resolved[name]
    if (resolving.has(name)) {
      throw new Error(`cycle in grammar variable {{${name}}}`)
    }
    resolving.add(name)
    resolved[name] = variables[name].replaceAll(
      variableReference,
      (_, reference) => resolve(reference),
    )
    resolving.delete(name)
    return resolved[name]
  }

  for (const name of Object.keys(variables)) resolve(name)
  return resolved
}

/**
 * Returns `value` with every `{{name}}` in its regular expressions replaced by
 * `variables[name]`, the convention of the variables of Sublime Text's
 * sublime-syntax files. The common and diagram grammar files declare them.
 * Unknown variable names throw an error.
 * Every emitted expression uses Oniguruma's ASCII-only case folding.
 */
function substitute(value, variables) {
  if (Array.isArray(value))
    return value.map((item) => substitute(item, variables))
  if (value === null || typeof value !== "object") return value
  const result = {}
  for (const [key, item] of Object.entries(value)) {
    if (regexFields.has(key) && typeof item === "string") {
      const expression = item.replaceAll(variableReference, (_, name) => {
        if (!Object.hasOwn(variables, name)) {
          throw new Error(`unknown grammar variable {{${name}}} in ${item}`)
        }
        return variables[name]
      })
      // common.md#notation: Case folding never maps non-ASCII to ASCII;
      // Oniguruma takes the I option only at the head of a pattern.
      result[key] = `(?I)${expression}`
    } else {
      result[key] = substitute(item, variables)
    }
  }
  return result
}

/**
 * Merges the repositories of the parts. A key that two parts define would
 * silently replace a rule, so it is an error.
 */
function mergeRepositories(parts) {
  const repository = {}
  for (const part of parts) {
    for (const [key, rule] of Object.entries(part.repository)) {
      if (Object.hasOwn(repository, key)) {
        throw new Error(
          `the grammar defines the repository rule "${key}" twice`,
        )
      }
      repository[key] = rule
    }
  }
  return repository
}

const mermaid = substitute(
  {
    name: "mermaid",
    displayName: "Mermaid",
    aliases: ["mmd"],
    scopeName: "source.mermaid",
    // The grammar that the frontmatter rule includes: `source.yaml`. A
    // highlighter loads it with this grammar; Shiki reports it missing
    // otherwise.
    embeddedLangs: ["yaml"],
    patterns: grammarParts.flatMap((part) => part.patterns),
    repository: mergeRepositories(grammarParts),
  },
  resolveVariables(mergeVariables(common.variables, diagrams)),
)

export default mermaid
