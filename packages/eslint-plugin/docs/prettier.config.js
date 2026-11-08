// The Prettier configuration of the documents of this package: the root
// configuration, and the plugin for Mermaid, so that Prettier prints the `mmd`
// code blocks of a rule document as the formatter prints them. Prettier reads
// only the nearest configuration file, which is why the root one is spread in.
// The plugin is read from its source, not from the built package: Node strips
// the types of a `.ts` file (the `engines` of the root `package.json` are the
// versions that do so by default), so that a run that starts prints with the
// formatter of the working tree; an editor keeps the modules it loaded, so it
// needs a reload after a change. The plugin imports `@mmd-toolkit/parser` by
// name, which is the built package: build it first (`pnpm run build:parser` at
// the root).
import root from "../../../prettier.config.js"
import mermaidPlugin from "../../prettier-plugin-mmd/src/index.ts"

export default { ...root, plugins: [...(root.plugins ?? []), mermaidPlugin] }
