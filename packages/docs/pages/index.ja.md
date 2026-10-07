---
layout: home
title: mmd-toolkit
description: >-
  Mermaidの図のテキストを扱うフォーマッター、リンター、
  原文を失わないパーサー。
hero:
  name: mmd-toolkit
  text: Mermaidテキストのためのツール
  tagline: >-
    図を整形し、書き間違いを見つけ、
    原文を失わない構文木でツールを作る。
  actions:
    - theme: brand
      text: フォーマッター
      link: /ja/formatter/
    - theme: alt
      text: リンター
      link: /ja/linter/
    - theme: alt
      text: パーサー
      link: /ja/parser/
    - theme: alt
      text: オンラインで試す
      link: https://mmd-toolkit.github.io/mmd-toolkit/playground/
features:
  - title: フォーマッター
    details: >-
      prettier-plugin-mmdで.mmd・.mermaidファイルと、
      Markdown内のMermaidコードブロックを整形。
    link: /ja/formatter/
  - title: リンター
    details: >-
      ESLintの言語プラグイン@mmd-toolkit/eslint-pluginで、
      Mermaidが黙って受け入れる書き間違いを検出。
    link: /ja/linter/
  - title: パーサー
    details: >-
      @mmd-toolkit/parserでMermaidテキストをASTへ変換。
      トークン、コメント、ソース位置も取得。
    link: /ja/parser/
  - title: 対応状況
    details: >-
      パーサー、フォーマッター、リンターが対応する図の種類と、
      互換性の保証を確認。
    link: /ja/reference/support
---

<div class="home-overview">

## mmd-toolkitについて

mmd-toolkitはMermaidの図のテキストを扱う第三者プロジェクトで、
mermaid-jsとは無関係です。
`mmd`は、その図のテキストと拡張子`.mmd`を指します。

## オンラインで試す

インストール不要のPlaygroundで、ブラウザーからすぐに試せます。
Mermaidテキストを編集し、ASTとトークン、Prettierの整形結果を確認できます。
入力はURLで共有できます。

[Playgroundを開く](https://mmd-toolkit.github.io/mmd-toolkit/playground/)。

</div>
