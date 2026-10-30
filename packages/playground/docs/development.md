# Playground development

Japanese version: [development.ja.md](./development.ja.md)

Contributor notes for the browser application. See the [README](../README.md)
for how to use it and the repository's
[contributing guide](../../../CONTRIBUTING.md) for workspace setup. The package
is private and independent of npm releases.

## Local development

Run from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm --filter @mmd-toolkit/playground dev
```

Vite opens the browser automatically. Its default address is
`http://localhost:5173/mmd-toolkit/playground/`; if that port is occupied, Vite
chooses another. No host override is required. Node.js requirements are recorded
in [package.json](../package.json).

The parser and formatter resolve to their workspace source entry points in both
development and production builds. Editing either implementation triggers hot
updates that reparse and, when Formatted is visible, reformat the current input.
The source editor and its undo history stay mounted. Rebuilding library packages
or running a second watch process is unnecessary.

## Browser implementation

The application uses Vue 3.6 RC with Vapor components, Monaco Editor, Shiki and
the [shine-and-bright](https://github.com/ota-meshi/shine-and-bright) theme
switch. The lockfile records dependency versions, including Vue's RC, and CI
installs with `--frozen-lockfile`. Every Vue SFC uses
`<script setup lang="ts" vapor>`; the root mounts with `createVaporApp`.

Parsing follows edits after 150 ms. AST traversal uses the parser's public
`visitorKeys`; tokens, comments, directives and frontmatter are auxiliary
records. Source ranges are half-open UTF-16 offsets, converted through Monaco's
model rather than parser line numbers. Arrays initially render 100 entries and
can reveal more, including the path to a source selection.

Prettier standalone and the Mermaid and YAML plugins load on demand when
Formatted is selected. Formatting follows source and indentation changes; stale
results are discarded. Apply is one undoable edit and uses LF line endings.

The system preference sets the initial theme; an explicit choice lasts for the
current page. Reduced motion preferences disable the theme switch animation.

## URL state

Source, `tabWidth` and `useTabs` are saved in a versioned `#v1=` fragment after
500 ms without an edit. `history.replaceState` updates the URL without adding a
history entry. Share exposes the current link, and Copy Link performs clipboard
access from a separate user gesture.

JSON is UTF-8 encoded, gzip compressed with the browser's Compression Streams
API, then encoded as unpadded base64url. JSON preserves lone UTF-16 surrogates.
The fragment stays in the browser; no sharing backend or local storage is used.
Appearance, tree selection and derived results are excluded. Shared input is
parsed and formatted with the deployed application's current implementations.
Monaco may normalize line endings on input; sharing and parsing use its current
model text.

Source, decoded JSON and URL fragments have no application size limits and are
never truncated. Malformed or unknown-version fragments leave current input
intact. Asynchronous restoration and formatting results are discarded if a newer
edit or navigation supersedes them.

## Checks

```sh
pnpm --filter @mmd-toolkit/playground typecheck
pnpm --filter @mmd-toolkit/playground test
pnpm --filter @mmd-toolkit/playground build
pnpm --filter @mmd-toolkit/playground exec playwright install chromium firefox webkit
pnpm --filter @mmd-toolkit/playground test:e2e
```

Unit tests cover the URL codec, large shared inputs and AST range selection.
Playwright exercises the production build under the Pages subpath in Chromium,
Firefox and WebKit. A separate HMR test edits isolated copies of parser and
formatter sources; it never changes the working library files.

## GitHub Pages

The public URL is
[Playground](https://mmd-toolkit.github.io/mmd-toolkit/playground/). Vite's base
is `/mmd-toolkit/playground/`, including local editor workers, Shiki WASM and
lazy formatter assets. Build output is `lib/`.

```sh
pnpm --filter @mmd-toolkit/playground build
pnpm --filter @mmd-toolkit/playground preview
```

Preview opens the production build in the browser automatically.

[pages.yml](../../../.github/workflows_bk/pages.yml) is kept in the backup
directory during development. When enabled under `.github/workflows/`, it
validates pull requests and builds on main and manual runs. Documentation and
Playground build jobs run independently. Main runs combine the documentation at
the artifact root and this application's `lib/` in `playground/`, then deploy
through the `github-pages` environment. Set the repository's Pages source to
**GitHub Actions** before deployment. The workflow does not change repository
settings. Only main deploys; deployment jobs are serialized and an active
deployment is not cancelled.
