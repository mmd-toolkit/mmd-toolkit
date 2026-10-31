# 開発に参加する

英語版: [CONTRIBUTING.md](./CONTRIBUTING.md)

このリポジトリのビルドとテストのしかたです。
変更の規則と、各パッケージの責務は [AGENTS.ja.md](./AGENTS.ja.md) にあります。

## 準備

リポジトリは pnpm のワークスペースです。
対応する Node.js の版は、
[package.json](./package.json) の `engines` にあります。

```sh
pnpm install
pnpm run build
```

## 検査

```sh
pnpm test
pnpm run lint
pnpm run format:check
```

- `pnpm test` は、全パッケージのテストを実行します。
- `pnpm run lint` は、ESLint、型検査、文書の検査、不可視文字の検査を実行します。
  文書は英語で書き、日本語版（`<名前>.ja.md`）を隣に置きます。
  AI の書く文書はいつも惜しみなく長く、同じことを飽きずに繰り返し、
  どうでもよい情報まで大切そうに書き添えてくれるので、メンテナーの母語でないと、
  その中から要る情報を拾うのに時間がかかりすぎます。
  そのため、AI エージェントで行う変更には日本語版を含めてください。
  このリポジトリのエージェント向けの指示に従って、エージェントが書きます。
  手で書く変更は省いてよく、後からエージェントが足します。
  存在しない日本語版へのリンクは置かないでください。
- `pnpm run format:check` は、Prettier で整形を検査します。
  `pnpm run format` は整形を適用します。
- `pnpm run update` は、ソースから生成するファイルを書きます。
  今は、`@mmd-toolkit/eslint-plugin` の規則の一覧と、
  その規則の文書の生成する部分です。
  それが最新でないと、`pnpm run lint` が失敗します。

## リリース

リリースは [Changesets](https://github.com/changesets/changesets) で行います。
`main` に push すると、Release のワークフローが、
版を上げて変更履歴を書く pull request を開きます。
その pull request は `pnpm run version:ci` で作られます。
`changeset version` の後に `pnpm run update` を実行するので、
その中の生成するファイルは最新です。
その pull request をマージすると、パッケージが公開されます。
仕様の `@mmd-toolkit/spec` は npm に公開しません。
リリースで、版と変更履歴の項目と、
git のタグ `@mmd-toolkit/spec@<版>` が付きます。

## 置き場所

| パス                           | 内容                                           |
| ------------------------------ | ---------------------------------------------- |
| `packages/spec`                | 仕様。                                         |
| `packages/tests`               | fixture と、実装を mermaid.js と比べる仕組み。 |
| `packages/parser`              | パーサー。                                     |
| `packages/prettier-plugin-mmd` | Prettier のプラグイン。                        |
| `packages/eslint-plugin`       | ESLint のプラグイン。                          |
| `tools`                        | fixture を保守するコマンドラインの道具。       |
| `scripts`                      | `pnpm run lint` が実行する検査。               |

各パッケージは、開発する人向けの文書を、自分の `docs/` の下に置きます。
