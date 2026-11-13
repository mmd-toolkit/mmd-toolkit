# prettier-plugin-mmd

英語版: [README.md](./README.md)

[Mermaid](https://mermaid.js.org/) の図を整形する
[Prettier](https://prettier.io/) プラグインです。
`.mmd` と `.mermaid` のファイルと、
Markdown の中の `mermaid` のコードブロックを整形します。

[mermaid-js](https://mermaid.js.org/) とは関係のない第三者のプロジェクトです。
ここでいう `mmd` は Mermaid の図の記法のことで、
MultiMarkdown や MikuMikuDance ではありません。

文書:
[フォーマッター](https://mmd-toolkit.github.io/mmd-toolkit/ja/formatter/)。

## Playground

ブラウザーで、このプラグインによる整形結果を確認できます。
**Formatted**タブは編集に合わせて更新され、**Print width**で行幅を、
**Indent**と**Use tabs**で字下げを設定できます。
**Apply to source**で、入力を整形結果に置き換えられます。

[Playground](https://mmd-toolkit.github.io/mmd-toolkit/playground/)
を開いて使えます。

操作方法は[Playgroundの使い方](../playground/README.ja.md)を参照してください。

## 導入

Prettier 3 と一緒に入れます。
Node.js `^20.19.0 || ^22.13.0 || >=24` が必要です。

```sh
npm install --save-dev prettier prettier-plugin-mmd
```

そのうえで、Prettier の設定に加えます。
Prettier 3 はプラグインを自分では見つけないので、この指定が必要です。

```json
{
  "plugins": ["prettier-plugin-mmd"]
}
```

あとは、
いつもどおり Prettier で Mermaid のファイルと Markdown のファイルを整形します。
たとえば:

```sh
npx prettier --write "**/*.{mmd,mermaid,md}"
```

## 例

入力
([ファイル](./tests/fixtures/flowchart/statements-one-per-line/separated-by-semicolons-input.mmd)):

```mmd
flowchart LR
  A --> B; B --> C; C --> D
  subgraph S; E; F; end
```

出力
([ファイル](./tests/fixtures/flowchart/statements-one-per-line/separated-by-semicolons-output.mmd)):

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

## 整形するもの

- 名前が `.mmd` か `.mermaid` で終わるファイル。
- Markdown の、情報文字列の最初の語が `mermaid` か `mmd` のコードブロック。
  大文字と小文字を区別するので、`Mermaid` は整形しません。
  `mermaidx` も整形しません。
- mermaid.js のすべての図種。
- これらの図の YAML のフロントマター。
  Prettier の YAML 整形で整形します。

図種ごとの整形の規則は、それぞれの文書にあります。
[flowchart](./docs/flowchart.ja.md)、[agentflow](./docs/agentflow.ja.md)、
[sequence](./docs/sequence.ja.md)、[class](./docs/class.ja.md)、
[state](./docs/state.ja.md)、[ER](./docs/er.ja.md)、
[Gantt](./docs/gantt.ja.md)、[journey](./docs/journey.ja.md)、
[requirement](./docs/requirement.ja.md)、[mindmap](./docs/mindmap.ja.md)、
[timeline](./docs/timeline.ja.md)、[sankey](./docs/sankey.ja.md)、
[xychart](./docs/xychart.ja.md)、[quadrant](./docs/quadrant.ja.md)、
[kanban](./docs/kanban.ja.md)、[C4](./docs/c4.ja.md)、
[Venn](./docs/venn.ja.md)、[Ishikawa](./docs/ishikawa.ja.md)、
[usecase](./docs/usecase.ja.md)、[pie](./docs/pie.ja.md)、
[info](./docs/info.ja.md)、[gitGraph](./docs/gitgraph.ja.md)、
[architecture](./docs/architecture.ja.md)、[treemap](./docs/treemap.ja.md)、
[treeview](./docs/treeview.ja.md)、[radar](./docs/radar.ja.md)、
[Wardley](./docs/wardley.ja.md)、[railroad](./docs/railroad.ja.md)、
[cynefin](./docs/cynefin.ja.md)、[eventmodeling](./docs/eventmodeling.ja.md)、
[packet](./docs/packet.ja.md)、[block](./docs/block.ja.md)。

## オプション

- `useTabs` と `tabWidth` で字下げを決めます。
  既定は空白 2 つです。
- `endOfLine` で改行コードを決めます。
- `printWidth` は 2 つのことを決めます。
  flowchart、agentflow、kanban で 1 行に書いたデータブロック `@{ … }` は、
  その行が `printWidth` より広く、条件を満たすときに、複数行で印字します。
  たとえば、項目が 1 つのブロックは 1 行のままです。
  条件は、
  [データブロック](./docs/flowchart.ja.md#データブロック)を参照してください。
  Gantt のセクションのタスクの `:` は、行が `printWidth` より広くなり、
  しかも今より広くなるときを除いて、そろえます。
  詳しくは、
  [タスクのデータ](./docs/gantt.ja.md#タスクのデータ)を参照してください。
  幅は Prettier が測る幅で、全角文字は 2 桁、タブは 0 桁と数えます。
  Gantt のセクションは、Markdown のリストや引用が行の前に置くものを数えず、
  行だけの幅で数えます。
  それ以外では、`printWidth` は図の改行位置を決めません。
  `railroad-beta` の呼び出しは文法の構造に従います。
  詳細は[長い行](./docs/railroad.ja.md#長い行)を参照してください。
  Markdown と YAML frontmatter には、Prettier が使う場合があります。

## 整形しない場合

- mermaid.js が拒否するテキストは変えません。
  ファイルでは、Prettier が構文エラーを報告し、ファイルはそのまま残ります。
  Markdown では、コードブロックを Prettier に任せ、
  Prettier は整形しないコードとして印字します。
- mermaid.js が受理する入力の一部も、構文エラーとして報告します。
  たとえば、`sub%%{init: {}}%%graph S` のように、
  キーワードの中にディレクティブがある場合です。
  また、`subgraph Handle click events` のように、
  click 文を始めない `click` がある場合です。
  flowchart では、`click` は予約語です。
  `A-->|x""|B` のように、トークンの間に空の文字列がある場合もそうです。
  一覧は [docs/compatibility.ja.md](./docs/compatibility.ja.md) にあります。
- `error` という語と、
  その周りのコメント・ディレクティブ・改行だけでできたテキストは変えません。
  mermaid.js はこれを `error` 擬似図として読みます。
  ただし、改行コードは `endOfLine` に従います。
  Markdown では、Prettier に任せます。

## 保証と制限

- 次に記す空白の変更を除き、mermaid.js の読み取りを保ちます。
- 基準は、仕様に記録した版の mermaid.js で、現在は 12.3.0 です。
  整形した図は別の版でも描かれるので、フォーマッターは、印字するものを、
  図種ごとに多くて 5 つの版の mermaid.js で確かめています。
  書き方（キーワードの大文字小文字など）を変えるとき、
  その図種で対象にする版のうち、書かれた形を読む版が、変えた後の形を読まないか、
  違う図として描く場合は、書かれたまま残します。
  図種ごとに対象にする版は
  [対象にする mermaid.js の版](./docs/compatibility.ja.md#対象にする-mermaidjs-の版)
  に挙げています。
  書かれたまま残す形は、
  [対象にする版の mermaid.js のために残す形](./docs/compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
  に 1 つずつ挙げています。
- 整形した図をもう一度整形しても、何も変わりません。
- `style`、`classDef`、`linkStyle` の行の末尾の空白とタブを取り除きます。
  ただし、取り除くと mermaid.js が別の図を描く所では残します。
  図種の文書が名前を挙げている文がそれで、
  最後のスタイルの末尾にあるバックスラッシュの後の空白やタブと、
  `linkStyle default stroke: ` の空の値のような、空白だけのスタイルです。
  mermaid.js は、それらを最後のスタイルの末尾に残します。
  ノーブレークスペースなど、ほかの種類の空白は、
  図が変わる所（class 図や flowchart など）では残します。
- `eventmodeling` のデータとノートのブロックの中の行は、
  [Data blocks](./docs/eventmodeling.ja.md#data-blocks)
  の規則が許す場合に揃えます。
  mermaid.js が持つテキストの空白が変わることがありますが、描画は変わりません。
- `end note` で閉じる state ノートの単一の段落は、
  [ノート](./docs/state.ja.md#ノート)の規則が許す場合に揃えます。
  行内の強調やコードの表記を含む行も対象です。
  変わるのは行頭の空白だけで、描画は変わりません。
  余白が表示に影響するほかの本文は、後続の余白を原文のまま保ちます。
- ディレクティブ、`@{ ... }` のデータブロック、
  フロントマターの中身は検査しません。
  その中身のために mermaid.js が拒否する図も整形します。
  ディレクティブは書かれたまま残します。
  `@{ ... }` のデータブロックも中身を残し、1 行のブロックは、
  両端の内側に空白を 1 つずつ置いて印字します。
  複数行のブロックだけ、条件を満たすときに全行を同じ数の空白で動かします。
  条件は[データブロック](./docs/flowchart.ja.md#データブロック)にあります。
  フロントマターは Prettier が YAML として読めるときだけ整形します。
  usecase のメタデータのプロパティは図の構文なので、読み取って検査します。
- mermaid.js が許すより多くの辺を持つ flowchart は、mermaid.js は拒否しますが、
  ここでは整形します。
  許す数は、サイト設定の `maxEdges` で、既定で 500 本です。
  プラグインはサイト設定を知らないからです。
- フロントマターの前のバイト順マークを、mermaid.js と同じようには扱いません。
  mermaid.js が受理する図を構文エラーとして報告することと、
  拒否する図を整形することがあります。
- Markdown では、
  Prettier がすべてのコードブロックの最後の行の末尾の空白を取り除きます。
  `style A fill:#f00, ` のように mermaid.js がその空白を読む箇所では、
  図が変わります。

理由と詳細は [docs/compatibility.ja.md](./docs/compatibility.ja.md) にあります。

## 文書

- [フォーマッターの案内](https://mmd-toolkit.github.io/mmd-toolkit/ja/formatter/):
  導入、
  [設定](https://mmd-toolkit.github.io/mmd-toolkit/ja/formatter/configuration.html)、
  [オプション](https://mmd-toolkit.github.io/mmd-toolkit/ja/formatter/options.html)。
- [フォーマッターの互換性](https://mmd-toolkit.github.io/mmd-toolkit/ja/formatter/compatibility.html):
  構文エラーの扱い、mermaid.js との違い、保証の範囲。
- [docs/compatibility.ja.md](./docs/compatibility.ja.md): プラグインが
  mermaid.js と違うすべての箇所と、その理由。
- [docs/development.ja.md](./docs/development.ja.md): テストと fixture。
  プラグインを開発する人向けです。
