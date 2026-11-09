# 整形オプション

プラグインは[Prettier標準のオプション][prettier-options]を使います。
独自のオプションはありません。
次のオプションを[Prettierの設定](./configuration.ja.md)に指定します。

## 図の整形に反映されるPrettierオプション

- [`tabWidth`][tab-width]: 図をスペースでインデントするときの幅。
- [`useTabs`][tabs]: 図のインデントにタブを使うかどうか。
- [`endOfLine`][end-of-line]: 整形結果の改行コード。
- [`printWidth`][print-width]:
  2つの判断に使う行の幅（[行の長さ](#行の長さ)を参照）。

Playgroundの整形結果の改行コードはLFです。

## インデント

Mindmapでは、`tabWidth`はルートのインデントに反映されますが、
ノード間のインデントの文字数差は元のまま保持します。
Kanbanでは各ノードのインデントの文字数を保持するため、
`tabWidth`では変わりません。
どちらも、整形するインデントに使う文字は`useTabs`で選びます。

## 行の長さ

`printWidth`は図の中で2つのことを決めます。

- flowchart、agentflow、kanbanで1行に書いたデータブロック`@{ … }`は、
  その行が`printWidth`より広く、条件を満たすときに、
  1行に1つの項目で複数行に印字します。
  たとえば、項目が1つのブロックは1行のままです。
  条件は[データブロック][data-blocks]を参照してください。
- Ganttのセクションのタスクの`:`は、行が`printWidth`より広くなり、
  しかも今より広くなるときを除いて、そろえます。

幅はPrettierが測る幅で、全角文字は2桁、タブは0桁と数えるので、タブのある行は、
測った幅より画面では広いことがあります。
リストや引用の中のMarkdownのコードブロックでは、
Prettierはデータブロックを行の前にあるものも含めて測りますが、
プラグインには行の幅をそのまま渡し、
プラグインはGanttのセクションの行だけを数えます。
`.editorconfig`の`max_line_length = off`はPrettierが無限の幅として読み、
ブロックを分けず、`:`は常にそろえます。

それ以外では、`printWidth`は図の改行位置を決めません。
`railroad-beta`の複合呼び出しは、常に文法の入れ子を改行で示します。
引用符の内側は書かれたまま保ちます。
MarkdownやYAML frontmatterの整形では、
Prettierが`printWidth`を使う場合があります。

[prettier-options]: https://prettier.io/docs/options
[tab-width]: https://prettier.io/docs/options#tab-width
[tabs]: https://prettier.io/docs/options#tabs
[end-of-line]: https://prettier.io/docs/options#end-of-line
[print-width]: https://prettier.io/docs/options#print-width
[data-blocks]: ../../../prettier-plugin-mmd/docs/flowchart.ja.md#データブロック
