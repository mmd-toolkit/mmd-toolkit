# フォーマッター

`prettier-plugin-mmd`は、
PrettierでMermaidの図のテキストを整形するプラグインです。
`.mmd`・`.mermaid`ファイルと、Markdown内のMermaidコードブロックに使えます。

[Playgroundでオンラインの整形を試せます](https://mmd-toolkit.github.io/mmd-toolkit/playground/)。
インストールは不要です。
**Formatted**タブには、入力を編集するたびに整形結果が表示されます。

## インストール

プロジェクトにPrettierとプラグインをインストールします。

```sh
npm install --save-dev prettier@3 prettier-plugin-mmd
```

## 最初の図を整形する

次の入力を`diagram.mmd`として保存します。

```mmd
flowchart LR
  A --> B; B --> C; C --> D
  subgraph S; E; F; end
```

[`--plugin`][plugin]でプラグインを指定し、
[`--write`](https://prettier.io/docs/cli#--write)でファイルを更新します。

```sh
npx prettier --plugin prettier-plugin-mmd --write diagram.mmd
```

文が1行ずつに分かれ、サブグラフの内部にインデントが付きます。

```mmd
flowchart LR
  A --> B
  B --> C
  C --> D
  subgraph S
    E
    F
  end
```

Markdown内のMermaidコードブロックも整形できます。

```sh
npx prettier --plugin prettier-plugin-mmd --write README.md
```

## 整形できる入力

- 拡張子が`.mmd`・`.mermaid`のファイル。
- 言語名が`mermaid`または`mmd`のMarkdownコードブロック。
  大文字と小文字を区別するため、`Mermaid`は対象になりません。

構文エラー時の動作、mermaid.jsとの既知の差異、整形の保証範囲は、
[互換性][formatter]で説明しています。

## 次に読むページ

- [設定](./configuration.ja.md): プラグインの登録、対象ファイル、CLI、
  エディターの設定。
- [オプション](./options.ja.md): インデントと改行コード。

[formatter]: ./compatibility.ja.md
[plugin]: https://prettier.io/docs/plugins#using-plugins
