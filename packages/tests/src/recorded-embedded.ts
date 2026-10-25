import { isDeepStrictEqual } from "node:util"
import { recordConfiguration } from "./configuration.ts"
import type { MermaidConfig, RecordedEmbedded } from "./index.ts"
import type { EmbeddedValues } from "./mermaid.ts"
import type { JsonObject, JsonValue } from "./types.ts"

/**
 * What `embedded` records of an accepted input: its configuration as the
 * difference from `baseline` (the configuration of a text that changes
 * nothing, read with the fixture's own `config`), its title, and its data
 * block effects. `undefined` where the input gives none of the three.
 */
export function recordEmbedded(
  embedded: EmbeddedValues,
  baseline: MermaidConfig,
): RecordedEmbedded | undefined {
  const difference = configDifference(embedded.config, baseline)
  const config =
    difference === undefined ? undefined : recordConfiguration(difference)
  const recorded: RecordedEmbedded = {
    ...(config === undefined ? {} : { config }),
    ...(embedded.title === undefined ? {} : { title: embedded.title }),
    ...(embedded.dataBlockEffects.length === 0
      ? {}
      : { dataBlockEffects: embedded.dataBlockEffects }),
  }
  return Object.keys(recorded).length === 0 ? undefined : recorded
}

/**
 * The values of `config` that differ from `baseline`, as an object with the
 * path of each (an array is one value). `undefined` where there is none. A
 * key that `baseline` has and `config` lacks is not recorded: the
 * configuration of a text only adds to or changes the baseline.
 */
export function configDifference(
  config: JsonObject,
  baseline: JsonObject,
): JsonObject | undefined {
  const difference: Record<string, JsonValue> = {}
  for (const [key, value] of Object.entries(config)) {
    const base = baseline[key]
    if (isDeepStrictEqual(value, base)) continue
    if (isObject(value) && isObject(base)) {
      const inner = configDifference(value, base)
      if (inner !== undefined) difference[key] = inner
    } else {
      difference[key] = value
    }
  }
  return Object.keys(difference).length === 0 ? undefined : difference
}

/** Whether `value` is a JSON object (not an array). */
function isObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
