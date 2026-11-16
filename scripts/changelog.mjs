// The changelog functions of Changesets for this repository: the entries of
// `@changesets/changelog-github`, except the line of a package that takes new
// versions of the packages it depends on. That module lists in that line a link
// to the commit of every changeset that bumped a dependency, so a release of
// `mmdfmt` that only took a new `prettier-plugin-mmd` showed over a hundred
// commit links, most of them the same. The changes are described in the release
// notes of the dependency, so the line links each new version to its release.
import github from "@changesets/changelog-github"

const changelogFunctions = {
  getReleaseLine: github.getReleaseLine,
  getDependencyReleaseLine: async (changesets, dependenciesUpdated, options) => {
    if (dependenciesUpdated.length === 0) return ""
    return [
      "- Updated dependencies:",
      ...dependenciesUpdated.map(({ name, newVersion }) => {
        const tag = encodeURIComponent(`${name}@${newVersion}`)
        const release = `https://github.com/${options.repo}/releases/tag/${tag}`
        return `  - [${name}@${newVersion}](${release})`
      }),
    ].join("\n")
  },
}

export default changelogFunctions
