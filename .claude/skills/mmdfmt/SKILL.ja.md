---
name: mmdfmt
description: >-
  Maintain mmdfmt, the command-line tool that formats the Mermaid diagrams of
  .mmd and .mermaid files and of the code blocks of Markdown with Prettier and
  prettier-plugin-mmd: its source, its tests, its README, and its page on the
  documentation site. Use when the tool changes, and when a change of the
  plugin reaches the tool.
---

# コマンドラインのフォーマッターを保守する（mmdfmt）

どのパッケージにも当たることは、
AGENTS.md とスキル [conventions](../conventions/SKILL.ja.md) にある。
先に読む。
図をどう印字するかはプラグインで決め、
それはスキル [prettier-plugin](../prettier-plugin/SKILL.ja.md) で行う。

## 方針と基準

`packages/mmdfmt`:

- `.mmd` と `.mermaid` のファイルと、
  Markdown の `mermaid` と `mmd` のコードブロックの図を、
  Prettier とプラグインで整形し、Markdown のファイルのほかの部分は変えない。
- 図をどう印字するかはプラグインだけで決める。
  ツールが決めるのは、どのテキストを整形するかと、報告と終了の仕方である。
- 何をするかは README が定め、そのうち振る舞いを定める文には、
  文が区別する場合ごとにテストがある（2 節）。

## 1. ツールのしくみ

- ツールは、図ごとにそのテキストを Prettier とプラグインで整形し、
  Markdown のコードブロックを Prettier の Markdown
  のパーサー（`prettier/plugins/markdown`）で見つけ、
  その中身の行だけを置き換える（`src/markdown.ts`）。
  構文エラーのメッセージとオフセットは、
  その `cause` に保持されたパーサーのエラーから読む（`src/diagram.ts`）。
- 整形する情報文字列（`src/markdown.ts` の `diagramLanguages`）は、
  プラグインの言語の `aliases` である。
- バイト順マーク、CRLF、`endOfLine`、
  Markdown の埋め込みブロックを Prettier がどう扱うか: スキル prettier-plugin の
  [9 節](../prettier-plugin/SKILL.ja.md#9-避ける誤り) の項目 Prettier。

## 2. テスト

- テスト（`tests/*.test.ts`）は入力をテストのコードに書き、改行コード、
  バイト順マーク、U+2028 をエスケープで書く。
  実行で使うファイルはリポジトリの外の一時ディレクトリに書き、
  リポジトリの設定が当たらないようにする。
  `tests/plugin-blocks.test.ts` は、ツールが整形するブロックを、
  Prettier がプラグインで整形するブロックと比べる。
- 走らせるテスト: ツールを変えたら `pnpm vitest run --project mmdfmt`。
- `tests/package.test.ts` は build を読む。
  CI のテストのジョブと同じく、
  先に `pnpm --filter mmdfmt run build` を実行する。
- ワークスペースの lint かテストが、
  このパッケージの外のファイルで失敗したときは、
  スキル prettier-plugin の [6 節](../prettier-plugin/SKILL.ja.md#6-テスト)
  の末尾のとおりに扱う。

## 3. 文書

- サイトのツールのページ（`packages/docs/pages/formatter/mmdfmt.md` とその
  `.ja.md`）は、題と自分の段落を少し持つほかは、README の文の大部分を持つ。
  ページが持つ部分の README を変えたら、同じ変更でページも変える。
  2 つを照らす検査はない。

## 4. 作業ツリー

このスキルの手順が書くのは、`packages/mmdfmt`、サイトのそのページ、
このスキルである。
作業ツリーは、
スキル conventions の
[作業ツリーの扱い](../conventions/SKILL.ja.md#作業ツリーの扱い) のとおりに扱う。
ほかのパッケージが必要とする変更は、
スキル prettier-plugin の
[1 節](../prettier-plugin/SKILL.ja.md#1-最初に読むもの)
の最後の段落のとおりに行う。

## 5. prettier-plugin と共有する規則

スキル [prettier-plugin](../prettier-plugin/SKILL.ja.md) は、
次のものをこのツールのためにも持つ。
パッケージは `packages/mmdfmt` とする。

- プラグインのどの変更がツールの変更になるかと、
  その後に走らせるテスト: [12 節](../prettier-plugin/SKILL.ja.md#12-mmdfmt)。
- 報告前の確認と報告: [8 節](../prettier-plugin/SKILL.ja.md#8-確かめ方と出力)。
