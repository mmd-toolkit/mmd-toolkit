# フォーマッターの互換性

`prettier-plugin-mmd`は、以下の差異と例外を除き、
mermaid.jsが図から読み取る内容を保ちます。
整形は冪等です。整形結果を再び整形しても、同じテキストになります。

基準とするmermaid.jsのバージョンとパーサーの既知の差異は、
[プロジェクトの互換性](../reference/index.ja.md)で説明しています。
整形が成功しても、Mermaidで描画できるとは限りません。

## 構文エラーとmermaid.jsとの違い

単独の`.mmd`・`.mermaid`ファイルでは、構文エラーを位置とともに報告し、
PrettierのCLIはそのファイルを変更しません。
Markdown内では文書の整形を続け、そのコードブロックは、
Prettierの通常のMarkdown整形に任されます。

パーサーの既知の差異により、mermaid.jsが受理する入力を、
構文エラーとして報告する場合と、拒否する入力を整形する場合があります。
後者では、整形結果をmermaid.jsが受理することも、拒否したままのこともあります。
対象の入力は、[既知の差異][divergences]で説明しています。

プラグインが未対応の図種に出会った場合、単独のファイルでは、
改行コードの変換を除き、書かれたまま残します。
Markdownでは、そのコードブロックをPrettierに任せます。

## 埋め込みデータ

ディレクティブの引数と`@{ ... }`のデータブロックは、書かれたまま残します。
YAMLフロントマターは、安全に読み取って整形できる場合に、
PrettierのYAMLフォーマッターで整形し、それ以外は書かれたまま残します。
正確な条件は、[フロントマターの互換性][frontmatter]を参照してください。

埋め込みデータがMermaidで有効かどうかは、検証しません。
壊れたデータ、未知の設定キーやノード形状などが、整形結果に残る場合があります。
辺の数の上限など、Mermaidのサイト設定に依存する検証も対象外です。

## 行末の空白

フローチャートでは、`style`・`classDef`・`linkStyle`の文の末尾の空白を、
取り除くとmermaid.jsが文を拒否する場合を除き、取り除きます。
これは、mermaid.jsが保存するスタイルのテキストを変えます。
詳しくは、[スタイルの末尾の空白][styles]を参照してください。

Prettierは、Markdownのすべてのコードブロックで、
最後の行の末尾の空白を取り除きます。
このプラグインが整形するブロックも同じです。
その空白が図の一部である場合、図の意味が変わったり、無効になったりします。
たとえば、最後の行の`%%`コメントの本文が空白1個だけの場合は、
その空白が失われ、コメントではなくノードとして読まれることがあります。

プラグインが整形できずPrettierに任せたブロックでは、
すべての行の末尾の空白をPrettierが取り除きます。
制約の詳細は、[Markdownのコードブロック][markdown]を参照してください。

## バイト順マークを含むフロントマター

フロントマターの前にバイト順マーク（BOM）がある場合は、
プラグインとmermaid.jsの受理・拒否が異なることがあります。

- 2つの`---`の区切りの前にそれぞれBOMがある場合、
  mermaid.jsは受理しますが、プラグインは構文エラーを報告します。
- 開く区切りの前にだけBOMがある場合、mermaid.jsは拒否しますが、
  プラグインは整形します。

詳しくは、[バイト順マークの互換性][bom]を参照してください。
すべての差異と、入力の読み方を保つための規則は、
リポジトリの[互換性の詳細][details]に記録しています。

[divergences]: ../../../spec/docs/known-divergences.ja.md
[frontmatter]: ../../../prettier-plugin-mmd/docs/compatibility.ja.md#フロントマター
[styles]: ../../../prettier-plugin-mmd/docs/compatibility.ja.md#スタイルの末尾の空白
[markdown]: ../../../prettier-plugin-mmd/docs/compatibility.ja.md#markdown-のコードブロック
[bom]: ../../../prettier-plugin-mmd/docs/compatibility.ja.md#バイト順マーク
[details]: ../../../prettier-plugin-mmd/docs/compatibility.ja.md
