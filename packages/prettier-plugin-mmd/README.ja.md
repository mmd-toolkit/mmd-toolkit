# prettier-plugin-mmd

英語版: [README.md](./README.md)

Mermaid の図を整形する [Prettier](https://prettier.io/) プラグインです。
`.mmd` と `.mermaid` のファイルと、
Markdown の中の `mermaid` のコードブロックを整形します。

mermaid-js とは関係のない第三者のプロジェクトです。
ここでいう `mmd` は Mermaid の図の記法のことで、
MultiMarkdown や MikuMikuDance ではありません。

## Playground

ブラウザーで、このプラグインによる整形結果を確認できます。
**Formatted**タブは編集に合わせて更新され、
**Indent**と**Use tabs**で字下げを設定できます。
**Apply to source**で、入力を整形結果に置き換えられます。

公開予定URL:
[Playground](https://mmd-toolkit.github.io/mmd-toolkit/playground/)。

操作方法は[Playgroundの使い方](../playground/README.ja.md)を参照してください。

## 導入

このパッケージは、まだ npm に公開していません。
公開後は、Prettier 3 と一緒に入れます。
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
([statements-one-per-line/separated-by-semicolons-input.mmd](./tests/fixtures/flowchart/statements-one-per-line/separated-by-semicolons-input.mmd)):

```mmd
flowchart LR
  A --> B; B --> C; C --> D
  subgraph S; E; F; end
```

出力
([statements-one-per-line/separated-by-semicolons-output.mmd](./tests/fixtures/flowchart/statements-one-per-line/separated-by-semicolons-output.mmd)):

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
- flowchart。
  `flowchart`、`graph`、`flowchart-elk`、`swimlane-beta` で始まる図です。
  整形の規則は、
  例とともに [docs/flowchart.ja.md](./docs/flowchart.ja.md) にあります。
- sequence 図。
  `sequenceDiagram` で始まる図です。
  整形の規則は、
  例とともに [docs/sequence.ja.md](./docs/sequence.ja.md) にあります。
- class 図。
  `classDiagram` か `classDiagram-v2` で始まる図です。
  整形の規則は、
  例とともに [docs/class.ja.md](./docs/class.ja.md) にあります。
- state 図。
  `stateDiagram` か `stateDiagram-v2` で始まる図です。
  整形の規則は、
  例とともに [docs/state.ja.md](./docs/state.ja.md) にあります。
- ER 図。
  `erDiagram` で始まる図です。
  整形の規則は、
  例とともに [docs/er.ja.md](./docs/er.ja.md) にあります。
- Gantt 図。
  `gantt` で始まる図です。
  整形の規則は、
  例とともに [docs/gantt.ja.md](./docs/gantt.ja.md) にあります。
- journey 図。
  `journey` で始まる図です。
  整形の規則は、
  例とともに [docs/journey.ja.md](./docs/journey.ja.md) にあります。
- requirement 図。
  `requirementDiagram` で始まる図です。
  整形の規則は、
  例とともに [docs/requirement.ja.md](./docs/requirement.ja.md) にあります。
- これらの図の YAML のフロントマター。
  Prettier の YAML 整形で整形します。

ほかの図種は、まだ整形しません（下を参照）。

## オプション

- `useTabs` と `tabWidth` で字下げを決めます。
  既定は空白 2 つです。
- `endOfLine` で改行コードを決めます。
- `printWidth` は効きません。
  行を折り返すことはありません。

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
- flowchart、sequence、class、state、ER、Gantt、journey、
  requirement 以外の図種は変えません。
  ただし、改行コードは `endOfLine` に従います。
  Markdown では、Prettier に任せます。

## 保証と制限

- 整形で図は変わりません。
  mermaid.js は、整形の前と後で同じ図を読みます。
- 例外が 1 つあります。
  `style`、`classDef`、`linkStyle` の行の末尾の空白を取り除きます。
  mermaid.js は、その空白を最後のスタイルの末尾に残します。
- 整形した図をもう一度整形しても、何も変わりません。
- ディレクティブ、`@{ ... }` のデータブロック、
  フロントマターの中身は検査しません。
  その中身のために mermaid.js が拒否する図も整形します。
  ディレクティブとデータブロックは書かれたまま残し、
  フロントマターは Prettier が YAML として読めるときだけ整形します。
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

- [docs/flowchart.ja.md](./docs/flowchart.ja.md): flowchart の整形の規則。
- [docs/sequence.ja.md](./docs/sequence.ja.md): sequence 図の整形の規則。
- [docs/class.ja.md](./docs/class.ja.md): class 図の整形の規則。
- [docs/state.ja.md](./docs/state.ja.md): state 図の整形の規則。
- [docs/er.ja.md](./docs/er.ja.md): ER 図の整形の規則。
- [docs/gantt.ja.md](./docs/gantt.ja.md): Gantt 図の整形の規則。
- [docs/journey.ja.md](./docs/journey.ja.md): journey 図の整形の規則。
- [docs/requirement.ja.md](./docs/requirement.ja.md):
  requirement 図の整形の規則。
- [docs/compatibility.ja.md](./docs/compatibility.ja.md):
  mermaid.js と違う箇所と、その理由。
- [docs/development.ja.md](./docs/development.ja.md): テストと fixture。
  プラグインを開発する人向けです。
