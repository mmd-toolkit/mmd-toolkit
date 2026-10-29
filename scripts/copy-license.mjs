// Copies the root LICENSE into every publishable workspace package before
// `changeset publish`, so that each published tarball carries the license. npm
// includes a LICENSE file in the package directory whatever `files` lists; the
// copies are not committed (`packages/*/LICENSE` is in .gitignore).
import { copyFileSync, existsSync, readdirSync, readFileSync } from "node:fs"
import path from "node:path"

const root = process.cwd()
const license = path.join(root, "LICENSE")
const packagesDir = path.join(root, "packages")

for (const name of readdirSync(packagesDir)) {
  const manifestPath = path.join(packagesDir, name, "package.json")
  if (!existsSync(manifestPath)) continue
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"))
  if (manifest.private === true) continue
  copyFileSync(license, path.join(packagesDir, name, "LICENSE"))
  process.stdout.write(`copied LICENSE to packages/${name}\n`)
}
