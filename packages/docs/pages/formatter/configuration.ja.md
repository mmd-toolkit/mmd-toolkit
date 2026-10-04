# Prettierの設定

## プロジェクトの設定

[Prettierとプラグインをインストール](./index.ja.md#インストール)したら、
プロジェクトの設定に`prettier-plugin-mmd`を登録します。
たとえば、`.prettierrc.json`を作成します。

```json
{
  "plugins": ["prettier-plugin-mmd"]
}
```

すでに設定がある場合は、既存の[`plugins`配列][plugins]に追加します。
この設定で、CLIとエディターの両方からプラグインを読み込めます。

Prettierは[設定ファイル][configuration]を、
入力ファイルのディレクトリーから親ディレクトリーへ向かって探します。

## 対象ファイルと実行方法

プロジェクト全体の図のファイルとMarkdown文書を整形するには、
プロジェクトのディレクトリーで次のコマンドを実行します。

```sh
npx prettier --write "**/*.{mmd,mermaid,md}"
```

[`--write`][write]は、対象ファイルを更新します。
パターンを引用符で囲み、シェルではなくPrettierに展開させます。

ファイルを変更せずに整形を確認するには、[`--check`][check]を使います。

```sh
npx prettier --check "**/*.{mmd,mermaid,md}"
```

整形が必要な場合は終了コード`1`を返すため、CIでも使えます。
整形と確認からファイルを除外するには、[`.prettierignore`][ignore]を使います。

## 標準入力

標準入力を使う場合は、[`--stdin-filepath`][stdin-filepath]で、
ファイルのパスを渡します。
Prettierはこのパスを使って、パーサーの選択と設定ファイルの検索を行います。

```sh
npx prettier --stdin-filepath diagram.mmd < diagram.mmd
```

整形結果は標準出力へ出力されます。
`--stdin-filepath`で指定したファイルへの書き込みは行いません。
Markdown文書の場合は、Markdownのパスを渡します。

```sh
npx prettier --stdin-filepath README.md < README.md
```

ファイルのパスがない場合は、[`--parser`][parser]で、
プラグインのパーサーを明示的に選びます。
前述の設定を読み込めるよう、プロジェクトのディレクトリーで実行します。

```sh
npx prettier --parser mermaid < diagram.mmd
```

## エディターで使う

VS Codeでは、公式の[Prettier拡張機能][vscode]をインストールします。
プロジェクトの依存パッケージをインストールし、
前述の設定でプラグインを登録したうえで、
`.mmd`・`.mermaid`・Markdownファイルを開きます。
**Format Document With...**から**Prettier**を選んで整形します。

拡張機能は、プロジェクトのPrettierと設定を使います。
プラグインの利用には、信頼されたワークスペースが必要です。
既定のフォーマッターや保存時の整形の設定は、
[拡張機能のガイド][vscode-usage]を参照してください。

## 関連ページ

- [オプション](./options.ja.md): インデントと改行コード。
- [互換性][compatibility]: 整形の保証と例外、Markdown内のエラーの扱い。

[plugins]: https://prettier.io/docs/plugins#using-plugins
[configuration]: https://prettier.io/docs/configuration
[write]: https://prettier.io/docs/cli#--write
[check]: https://prettier.io/docs/cli#--check
[ignore]: https://prettier.io/docs/ignore
[stdin-filepath]: https://prettier.io/docs/cli#--stdin-filepath
[parser]: https://prettier.io/docs/options#parser
[vscode]: https://github.com/prettier/prettier-vscode
[vscode-usage]: https://github.com/prettier/prettier-vscode#usage
[compatibility]: ../../../prettier-plugin-mmd/docs/compatibility.ja.md
