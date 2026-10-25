import yaml from "js-yaml"
import { ownProperties, toJsonObject } from "./normalizers/json.ts"
import type { JsonObject, JsonValue, MermaidConfig } from "./types.ts"

/** Copies Mermaid configuration without losing the type of a number. */
export function copyConfiguration(value: unknown): MermaidConfig {
  return toJsonObject(value, (number) => (number === 0 ? 0 : number))
}

/** Records configuration numbers that JSON cannot represent with a type tag. */
export function recordConfiguration(config: MermaidConfig): JsonObject {
  return toJsonObject(config, (number) =>
    Number.isFinite(number) ? number : { nonFinite: String(number) },
  )
}

/** Restores recorded configuration numbers before merging or building a Db. */
export function restoreConfiguration(config: JsonObject): MermaidConfig {
  return restoreValue(config) as MermaidConfig
}

/** Restores only a one-field non-finite number tag, recursively. */
function restoreValue(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map(restoreValue)
  if (typeof value !== "object" || value === null) return value
  if (Object.keys(value).length === 1 && Object.hasOwn(value, "nonFinite")) {
    switch ((value as JsonObject).nonFinite) {
      case "Infinity":
        return Infinity
      case "-Infinity":
        return -Infinity
      case "NaN":
        return Number.NaN
      default:
        break
    }
  }
  return ownProperties(
    Object.entries(value).map(([key, child]) => [key, restoreValue(child)]),
  )
}

/** Writes reference frontmatter while preserving non-finite numbers in YAML. */
export function configurationFrontmatter(
  config: MermaidConfig,
  title: string | undefined,
): string {
  return yaml.dump({ title, config }, { noRefs: true, lineWidth: -1 }).trimEnd()
}
