# @mmd-toolkit/eslint-plugin

英語版: [README.md](./README.md)

Mermaid の図のための [ESLint](https://eslint.org/) の言語プラグインです。
`.mmd` と `.mermaid` のファイルと、
Markdown の中の `mermaid` と `mmd` のコードブロックを検査します。

mermaid.js が拒否するテキストは、パースのエラーとして報告します。
規則は、mermaid.js が何も言わずに受け入れるものの、
書き手がおそらく意図したものとは違うものとして読む誤りを報告します。
たとえば、図に定義のない id への `style` 文です。
[`@mmd-toolkit/parser`](../parser) の木を ESLint に渡すので、
規則はテキストでなく木を読みます。

mermaid-js とは関係のない第三者のプロジェクトです。
ここでいう `mmd` は Mermaid の図の記法のことで、
MultiMarkdown や MikuMikuDance ではありません。

## 導入

このパッケージは、まだ npm に公開していません。
公開後は、ESLint 10 と一緒に入れます。
ES モジュールで、Node.js `^20.19.0 || ^22.13.0 || >=24` が必要です。

```sh
npm install --save-dev eslint @mmd-toolkit/eslint-plugin
```

## 使い方

`eslint.config.js` に `recommended` の設定を加えます。

```js
import mmd from "@mmd-toolkit/eslint-plugin"

export default [mmd.configs.recommended]
```

この設定は、プラグインを登録し、
`.mmd` と `.mermaid` のファイルに Mermaid の言語を当て、
推奨の規則をエラーとして有効にします。
そのうえで、ファイルに ESLint を実行します。

```sh
npx eslint "**/*.mmd"
```

規則を変えるには、その後ろに設定のオブジェクトを加えます。
あとのオブジェクトは、それが当たるファイルについて、前の設定を上書きします。

```js
import mmd from "@mmd-toolkit/eslint-plugin"

export default [
  mmd.configs.recommended,
  {
    files: ["**/*.mmd", "**/*.mermaid"],
    rules: {
      "@mmd-toolkit/flowchart-no-undef": "warn",
      "@mmd-toolkit/flowchart-no-unclosed-description-block": "error",
    },
  },
]
```

`recommended` の設定は、2 つ目の規則を有効にしません。

## 例

次の図の `style C fill:red` は、何にもスタイルを当てません。
mermaid.js はこの文を受け入れ、`C` という新しい頂点を足します。
`A` と `B` のスタイルは変わりません。

```mmd
flowchart LR
  A --> B
  style C fill:red
```

`recommended` の設定が有効にする `@mmd-toolkit/flowchart-no-undef` が、
これを報告します。

```text
diagram.mmd
  3:9  error  mermaid.js adds a new vertex with these styles for the undefined id `C`  @mmd-toolkit/flowchart-no-undef
```

## Markdown の中の Mermaid のコードブロック

[`@eslint/markdown`](https://github.com/eslint/markdown) のプロセッサーは、
コードブロックごとに、`0.mermaid` のような、
その言語で終わるファイル名を付けます。
`recommended` の設定は `mermaid` と `mmd` のブロックに当たり、
ESLint は Markdown のファイルの位置で報告します。

```js
import markdown from "@eslint/markdown"
import mmd from "@mmd-toolkit/eslint-plugin"

export default [...markdown.configs.processor, mmd.configs.recommended]
```

テキストに図を持たない `mermaid` のブロックは、
パースのエラーとして報告されます。
フェンスの間に 1 行もないブロックは、報告されません。

このプロセッサーでは、1 回の ESLint の実行で検査されるのはコードブロックで、
Markdown のテキスト自体ではありません。
両方を検査する方法は、
[Markdown の検査](../docs/pages/linter/markdown.ja.md)にあります。

## 設定のコメント

Mermaid のコメント（`%%` の行）は、
JavaScript のコメントと同じように ESLint を設定します。

```mmd
flowchart LR
  %% eslint-disable-next-line -- the reason
  A --> B
```

`%% eslint-disable`、`%% eslint-enable`、`%% eslint-disable-next-line`、
`%% eslint <規則>: <設定>` を読みます。
Mermaid のコメントは行全体を占めるので、
`%% eslint-disable-line` はそのコメント自身にだけ当たります。
[設定のコメント](../docs/pages/linter/comments.ja.md)を参照してください。

## 図種と規則

このプラグインは、mermaid.js 12.0.0 のすべての図種を読みます。
これは、このツール群が基準にしている版です。
[図種の対応](../docs/pages/reference/support.ja.md)を参照してください。
受け入れるテキストと拒否するテキストは、mermaid.js と同じです。
例外は[既知の相違](../spec/docs/known-divergences.ja.md)です。

規則は 2 つの種類に分かれます。
すべての規則は [docs/rules/index.ja.md](./docs/rules/index.ja.md) に挙げてあり、
規則ごとに文書があります。

- 1 つの図種の規則。
  id は `@mmd-toolkit/<図種>-<名前>` で、
  `@mmd-toolkit/flowchart-no-undef` などです。
  `info` と Ishikawa 以外のすべての図種に、この規則があります。
- すべての図種の規則。
  id は `@mmd-toolkit/<名前>` で、
  `@mmd-toolkit/no-unclosed-directive` などです。
  ディレクティブ（`%%{ }%%`）を検査します。
  `recommended` の設定は、そのすべてを有効にします。

一覧の ✅ は `recommended` の設定が有効にする規則、🔧 は自動修正がある規則、
💡 は
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
がある規則です。
規則の文書の冒頭の告知にも、同じ印が付きます。
`eslint --fix` は自動修正を適用します。
修正候補は適用しないので、エディターで確かめて適用します。

## 文書

- [Linter のガイド](../docs/pages/linter/index.ja.md): 設定と、検査する内容。
- [設定](../docs/pages/linter/configuration.ja.md): 規則の選び方と、組み合わせ。
- [docs/rules/index.ja.md](./docs/rules/index.ja.md): 規則。
- [docs/development.ja.md](./docs/development.ja.md): プラグインの作りとテスト。
