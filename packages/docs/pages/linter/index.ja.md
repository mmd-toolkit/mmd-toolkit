# リンター

`eslint-plugin-mmd`は、ESLintでMermaidの図の構文エラーと書き間違いを
検出するプラグインです。

## インストールと設定

プロジェクトにESLint 10とプラグイン、`@eslint/markdown`をインストールします。

```sh
npm install --save-dev eslint@10 eslint-plugin-mmd @eslint/markdown
```

プロジェクトのルートに、
[ESLintの設定ファイル][eslint-config]を`eslint.config.mjs`として作成します。

```js
import markdown from "@eslint/markdown"
import mmd from "eslint-plugin-mmd"

export default [...markdown.configs.processor, mmd.configs.recommended]
```

`@eslint/markdown`は、ESLintでチェックするコードブロックを
Markdownから取り出します。
`mmd.configs.recommended`は、プラグインを登録し、
`.mmd`・`.mermaid`ファイルにMermaidの言語を指定します。
プラグインの推奨ルールも、エラーとして有効にします。
Markdownのprocessorが取り出した`mmd`・`mermaid`コードブロックも
対象になります。

この設定はコードブロックだけをチェックし、Markdown本文は対象外です。
1回のESLint実行で両方をチェックできない制限は、
[Markdownのlint](./markdown.ja.md)で説明します。

## 最初の図をlintする

次の図を、`diagram.md`の`mermaid`コードブロック内に保存します。
`%% eslint`コメントで、この図の
[`mmd/flowchart/no-undef`][no-undef]を明示的に有効にしています。

```mmd
%% eslint mmd/flowchart/no-undef: error
flowchart LR
  A --> B
  style C fill:red
```

ESLintを実行します。

```sh
npx eslint diagram.md
```

`mmd/flowchart/no-undef`が、`style C fill:red`の`C`を報告します。
Mermaidはこの入力を受理し、`C`という新しい頂点を追加します。
`A`や`B`にスタイルを適用することにはなりません。

`A`にスタイルを適用するには、`style`文のIDを変更します。

```mmd
%% eslint mmd/flowchart/no-undef: error
flowchart LR
  A --> B
  style A fill:red
```

この入力では、上の設定による報告はありません。

## チェックする内容

プラグインは、ルールを実行する前に構文をチェックします。
図を解析できない場合、ESLintはパースのエラーを報告します。
ルールは、受理できた入力に対して特定の書き間違いをチェックします。
ルールによる報告には、上の例のようにルールIDが付きます。

構文のチェックには、ほかのツールと同じパーサーを使います。
対応する構文は、[図の対応状況](../reference/support.ja.md)で確認できます。
各ルールがどの図のどんな書き間違いをチェックするかは、
ルールごとの文書で説明しています。

一部のルールは、[エディターで適用できる修正候補][suggestions]を提供します。
変更内容を確認し、適用する候補をエディターで選びます。
この修正候補は、`eslint --fix`では自動適用されません。

## 次に読むページ

- [設定](./configuration.ja.md): ルールの選択、エラー・警告の指定、
  ほかのESLint設定との併用。
- [Markdown](./markdown.ja.md): Markdown内のMermaidコードブロックのlint。
- [設定コメント](./comments.ja.md): `%%`コメントによる図の中でのルール設定。
- [ルール一覧](../../../eslint-plugin-mmd/docs/rules/index.ja.md):
  各ルールの説明、対象、診断例。

[eslint-config]: https://eslint.org/docs/latest/use/configure/configuration-files
[no-undef]: ../../../eslint-plugin-mmd/docs/rules/flowchart/no-undef.ja.md
[suggestions]: https://eslint.org/docs/latest/use/core-concepts#rule-suggestions
