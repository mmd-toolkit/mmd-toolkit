// Writes the released version into the notes that say where a decision of an
// earlier release was overturned. A change that overturns such a decision adds
// the line `Overturned in the next release: ...` to the entry of that release
// in the CHANGELOG.md of the package (see the changesets skill). Which version
// the next release is, is known only when Changesets has bumped the versions,
// so `version:ci` runs this after `changeset version` and replaces the phrase
// `Overturned in the next release` with `Overturned in` and the new version of
// the package.
//
// Only a package whose version `changeset version` has changed is stamped: a
// note in a package that is not released this time waits for its release.
import { execFileSync } from "node:child_process"
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

const pending = "Overturned in the next release"

const root = process.cwd()
const packagesDir = path.join(root, "packages")

for (const name of readdirSync(packagesDir)) {
  const manifestPath = path.join(packagesDir, name, "package.json")
  const changelogPath = path.join(packagesDir, name, "CHANGELOG.md")
  if (!existsSync(manifestPath) || !existsSync(changelogPath)) continue
  const changelog = readFileSync(changelogPath, "utf8")
  if (!changelog.includes(pending)) continue
  const version = JSON.parse(readFileSync(manifestPath, "utf8")).version
  if (version === committedVersion(name)) {
    process.stdout.write(
      `packages/${name}: not released this time, notes left pending\n`,
    )
    continue
  }
  writeFileSync(
    changelogPath,
    changelog.replaceAll(pending, `Overturned in ${version}`),
  )
  process.stdout.write(`packages/${name}: notes stamped with ${version}\n`)
}

/** The version of a package in the commit that is checked out. */
function committedVersion(name) {
  const manifest = execFileSync(
    "git",
    ["show", `HEAD:packages/${name}/package.json`],
    { cwd: root, encoding: "utf8" },
  )
  return JSON.parse(manifest).version
}
