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

`printWidth`は図の改行位置を決めません。
`railroad-beta`の複合呼び出しは、常に文法の入れ子を改行で示します。
引用符の内側は書かれたまま保ちます。
MarkdownやYAML frontmatterの整形では、
Prettierが`printWidth`を使う場合があります。

[prettier-options]: https://prettier.io/docs/options
[tab-width]: https://prettier.io/docs/options#tab-width
[tabs]: https://prettier.io/docs/options#tabs
[end-of-line]: https://prettier.io/docs/options#end-of-line
