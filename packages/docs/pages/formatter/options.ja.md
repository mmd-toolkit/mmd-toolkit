# 整形オプション

プラグインは[Prettier標準のオプション][prettier-options]を使います。
独自のオプションはありません。
次のオプションを[Prettierの設定](./configuration.ja.md)に指定します。

## 図の整形に反映されるPrettierオプション

- [`tabWidth`][tab-width]: 図をスペースでインデントするときの幅。
- [`useTabs`][tabs]: 図のインデントにタブを使うかどうか。
- [`endOfLine`][end-of-line]: 整形結果の改行コード。

Playgroundの整形結果の改行コードはLFです。

## インデント

Mindmapでは、`tabWidth`はルートのインデントに反映されますが、
ノード間のインデントの文字数差は元のまま保持します。
Kanbanでは各ノードのインデントの文字数を保持するため、
`tabWidth`では変わりません。
どちらも、整形するインデントに使う文字は`useTabs`で選びます。

## 行の長さ

`printWidth`は、`railroad-beta`の複合呼び出しを、
入れ子がわかるように折り返します。
引用符で囲まれた値は、そのコンストラクターとまとめます。
引用符の内側は書かれたまま保ちます。
隠れた形式と保護された行は従来の配置を保ちます。
ほかの図の行は折り返しません。
MarkdownやYAML frontmatterの整形では、
Prettierが`printWidth`を使う場合があります。

[prettier-options]: https://prettier.io/docs/options
[tab-width]: https://prettier.io/docs/options#tab-width
[tabs]: https://prettier.io/docs/options#tabs
[end-of-line]: https://prettier.io/docs/options#end-of-line
