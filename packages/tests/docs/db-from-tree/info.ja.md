# 木から info の Db を組み立てる

英語版: [info.md](./info.md)

`src/db-from-tree/info.ts` は、
[ast/info.md](../../../spec/docs/ast/info.md) から、
[info の空の概要](../db-summaries.md#info) を組み立てる。
受理した木には常に `{}` を返す。
showInfo、共通の 4 形式、hidden text は Db の欄に寄与しない。
書かれた出現は木に保ち、version・effective
title は合成しない。 [fixture: info/header-lf]
[fixture: info/header-inline-flag] [fixture:
info/common-all] [fixture: info/common-flag-all]
[fixture: info/hidden-yaml-body]

frontmatter・directive は共有の埋め込み値を与えるが、 info
adapter はそのどれも Db に公開しない。 [fixture: info/frontmatter-title]
[fixture: info/frontmatter-config] [fixture:
info/directive-config]

## 記録した結果との比較

`specified.json` があればそれを使い、
なければ `expected.json` と `{}` を比較する。
既存の C4・bare-percent の指定の読みを使う。
保持した YAML・二度目の directive の前置きと、
その間に通された trivia も確かめる。
atomic なキーワードの切断は既存の印で拒否する。
Mermaid が拒否した先頭の opaque YAML には比較用 Db がなく、
作り足さない。 [fixture: info/div-c4-hidden-yaml]
[fixture: info/div-c4-retained-directive]
[fixture: info/div-detect-retained-yaml-bare-ls] [fixture:
info/div-detect-retained-directive-bare-bom] [fixture:
info/div-detect-yaml-bare-directive] [fixture:
info/div-directive-header-middle] [fixture: info/div-selected-showinfo]
[fixture: info/div-frontmatter-invalid-yaml] [fixture:
info/div-frontmatter-html-invalid-yaml]
