# ESLintの設定

`@mmd-toolkit/eslint-plugin`は、ESLint 10のフラット設定に対応しています。
以下の例では、Markdown内のMermaidコードブロックを設定します。
インストールは[はじめに](./index.ja.md)を参照してください。

## 推奨ルールと個別の上書き

プロジェクトのルートに`eslint.config.mjs`を作成します。

```js
import markdown from "@eslint/markdown"
import mmdToolkit from "@mmd-toolkit/eslint-plugin"

export default [
  ...markdown.configs.processor,
  mmdToolkit.configs.recommended,
  {
    files: ["**/*.mmd", "**/*.mermaid"],
    rules: {
      "@mmd-toolkit/flowchart-no-undef": "warn",
      "@mmd-toolkit/flowchart-no-unclosed-description-block": "error",
    },
  },
]
```

`mmdToolkit.configs.recommended`は、プラグインとMermaid言語を登録し、
`.mmd`・`.mermaid`ファイルを対象に、推奨ルールをエラーとして有効にします。
Markdownのprocessorは、
`mmd`・`mermaid`コードブロックを対応する拡張子のファイルとして取り出します。

最後の設定オブジェクトは、Mermaidの図のルール設定を上書きします。
この例では、`@mmd-toolkit/flowchart-no-undef`を警告に変更し、
推奨設定に含まれない`@mmd-toolkit/flowchart-no-unclosed-description-block`を有効にします。
ルールを無効にするには`"off"`を指定します。
後にある、対象ファイルに一致した設定オブジェクトが、
前のルール設定を上書きします。

Markdownでは、この設定はコードブロックをチェックします。
Markdown本文もチェックする場合の制限は、
[Markdownのlint](./markdown.ja.md)で説明しています。

## 推奨設定を使わずにルールを選ぶ

指定したルールだけを有効にするには、プラグインと言語を明示的に登録します。

```js
import markdown from "@eslint/markdown"
import mmdToolkit from "@mmd-toolkit/eslint-plugin"

export default [
  ...markdown.configs.processor,
  {
    files: ["**/*.mmd", "**/*.mermaid"],
    plugins: { "@mmd-toolkit": mmdToolkit },
    language: "@mmd-toolkit/mermaid",
    rules: {
      "@mmd-toolkit/flowchart-no-undef": "error",
    },
  },
]
```

`plugins: { "@mmd-toolkit": mmdToolkit }`は、
ルールの`@mmd-toolkit/`という接頭辞を指定し、言語を登録します。
`language: "@mmd-toolkit/mermaid"`は、
対象ファイルをMermaidとして解析する指定です。
ルールを有効にしていなくても、構文はチェックします。
Mermaid言語に、プラグイン独自の`languageOptions`はありません。

ルールIDには、次の2つの形式があります。

- 共通ルールは`@mmd-toolkit/<name>`。
  例: `@mmd-toolkit/no-unclosed-directive`。
- 図種ごとのルールは`@mmd-toolkit/<diagram>-<name>`。
  例: `@mmd-toolkit/flowchart-no-undef`。

[ルール一覧](../../../eslint-plugin/docs/rules/index.ja.md)では、
推奨設定で有効になるルールに✅、
エディターの修正候補があるルールに💡を付けています。
修正候補は、エディターで変更案を選んで適用します。
`eslint --fix`での自動修正ではありません。

## 他言語の設定と組み合わせる

他言語のルールは、その言語のファイルに対象を絞ります。
例えば、
次の設定オブジェクトでJavaScriptファイルと`js`コードブロックをチェックできます。

```js
const javascriptRules = {
  files: ["**/*.{js,mjs,cjs}"],
  rules: {
    "no-console": "error",
  },
}
```

エクスポートする設定配列に`javascriptRules`を追加します。
この`files`は、Markdownから取り出したJavaScriptコードブロックにも一致し、
Mermaidの図にはJavaScriptのルールを適用しません。
他のプリセットを組み合わせる場合も、対象ファイルの指定を確認してください。

## 図の単独ファイル

上の設定は、単独の`.mmd`・`.mermaid`ファイルもチェックします。

```sh
npx eslint diagram.mmd
```

単独ファイルだけをlintするなら、`@eslint/markdown`とprocessorは不要です。
`export default [mmdToolkit.configs.recommended]`だけで設定できます。

図の中で設定する場合は、[設定コメント](./comments.ja.md)を使います。
