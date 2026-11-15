---
name: ast-json-validity
description: >-
  AI エージェントが記録された ast.json を仕様とノードごと、トークンごとに
  照合するチェックリストと手順。packages/parser の test:record、test:update
  の後、変更された木のレビュー、fixture 入力の変更、木・トークン・位置の
  文書やそれらがリンクする節の変更で使う。
---

# 記録された木の確認

英語版: [SKILL.md](./SKILL.md)

この手順は AI エージェント専用で、人には求めない。
先に [conventions](../conventions/SKILL.ja.md) を読む。
レビュアーは [review](../review/SKILL.ja.md) の 2 節「入力」と 5
節「指摘と報告」にも従う。

## 1. 入力を読み、期待する木を書き出す

リポジトリのルートから、変更された入力と木を列挙する。

```sh
git diff --name-only <base> -- 'packages/tests/fixtures/**/ast.json' 'packages/tests/fixtures/**/input.mmd'
```

未コミットの作業には `HEAD` を使う。
PR 全体には、
main との merge base（`$(git merge-base origin/main HEAD)`）を使う。
後から main に入ったコミットが混ざらないようにするためである。
`git status` の未追跡の fixture も加える。
入力と木のどちらが変わったかによらず、
現在 `ast.json` がある fixture を一度ずつ確認する。
拒否の記録 `parse-error.json` はこの手順の対象外とする。

各 fixture で、`ast.json` を開く前に次を行う。

1. `input.mmd` 全体を読む。
   不可視文字が関わる場合はバイトも確認し、空白、行終端、
   テキストの末尾を区別する。
2. `common/` の fixture でも入力から図種を決める。
   `packages/spec/docs/diagrams/<diagram>.ja.md`、`common.ja.md`、
   `known-divergences.ja.md` とそのリンク先の該当する定義を読む。
3. `packages/spec/docs/ast.ja.md` と `ast/<diagram>.ja.md`、
   `packages/parser/docs/tokens.ja.md` と `tokens/<diagram>.ja.md`、
   `packages/parser/docs/positions.ja.md` と `positions/<diagram>.ja.md`
   を読む。
   該当ブロックがリンクする節も読む。
4. 期待するノード、トークン、レコードを書き出す。
   型、種別、親子の欄、順序、値、範囲、`loc` を、null、空のリスト、コメント、
   ディレクティブ、フロントマターも含めて記す。
   それぞれが覆う入力と、それを決める文書の文を示す。
   記録に期待を誘導される前に、入力から UTF-16 コード単位で境界を求める。

文書で決まらない問いは[不一致を解消する](#4-不一致を解消する)に従う。

## 2. チェックリストと照合する

`ast.json` を開き、書き出した期待する木と、
[チェックリスト](references/checklist.ja.md)の項目ごとに照合する。
全項目を、入力全体と、その項目に関わる全ノード、トークン、レコードに適用する。
入力から、欠けている構文も確認する。
記録された型や種別で照合範囲を限定しない。
欄の表だけでなく、図種の文書の該当ブロックとリンク先の節も読む。
範囲がテキストをまたぐだけでは、そのテキストを保存したことにならない。

## 3. fixture を引く文を読む

fixture を引く文を探す。

```sh
git grep --untracked -n "<folder>/<fixture>]" -- packages/spec/docs packages/parser/docs packages/tests/docs packages/prettier-plugin-mmd/docs
```

`<folder>` は、`packages/tests/fixtures/` の下の fixture のフォルダの名前で、
入力から決めた図種ではない。
`common/` の fixture は `common/<fixture>` で引かれる。
`--untracked` は、まだ git に加えていない文書も探す。
`[fixture: <folder>/<fixture>]` と `[corpus fixture: <folder>/<fixture>]` は、
`fixture:` の後で折り返されていても見つかる。
フォーマッターの文書でこのコーパスを引くのは `corpus fixture` だけである。

引用は引用だけの段落か、表の `fixture` 欄に置かれる。
引用段落の直前から、前の引用段落、または段落やリスト項目の先頭まで読む。
表の直後の引用段落は表全体、コードブロックの直後ならその例、
`fixture` 欄ならその行を引く。
その文を含む段落、リスト項目、表の全体を読む。

各文について fixture が示す場合を特定し、関わるノード、トークン、コメント、
位置を、その文と木・トークン・位置の文書に照らして確認する。
木のどこにも関わらない文なら、そう記す。
引く文がなければそう記すが、チェックリスト全体は適用する。
変更で加えた手書きの fixture に仕様からの引用がなければ報告する。
収集した fixture に引用は不要だが、引かれていれば同じように確認する。
区別には `expected.json` の `source.kind` を読む。
`mermaid` なら収集した入力である。

## 4. 不一致を解消する

不一致を決める文を読み、原因を判断する。

- パーサーの誤りなら直し、
  [parser 4.7 節「記録したパースの結果」](../parser/SKILL.ja.md#47-記録したパースの結果)
  の手順 4 で再記録し、この手順で新しい記録を確認する。
- 仕様の不足や誤りなら、
  [parser 4.2 節「仕様を読み、欠落を先に扱う」](../parser/SKILL.ja.md#42-仕様を読み欠落を先に扱う)
  の手順 2 で報告する。

`ast.json` は手で直さない。
[parser 4.6 節「テスト」](../parser/SKILL.ja.md#46-テスト)の通り、
fixture テストが記録する。
文書で決まらない問いは、未決定の木を記録として残さず、
parser 4.7 節の手順 1 に従って報告する。

## 5. 木とトークンと位置の文書が変わったとき

これらの文書と、そのブロックがリンクする節の基準からの差分を読む。

```sh
git diff <base> -- <the documents>
```

本文が変わった各ブロックについて、引かれた受理の fixture を新しい文と照合する。
リンク先の節で変わったブロックも含める。
リンク先は、そこを引く木・トークン・位置のブロックとともに読む。
記録を開く前に期待を書き、2〜4 節に従う。
存在しない fixture や木がない fixture は、
確認しなかった記録が報告で分かるよう記す。

新設、または書き直したブロックに引用する fixture がなければ、
conventions に従って各場合の fixture を用意する。
リンク先の節で変わったブロックにも適用するが、
削除したブロックや本文が変わらないブロックには適用しない。

## 6. 独立してレビューする

変更のコミットにある著者の修正を読む前に、
同じ `ast.json` と変更した文書ブロックを 1〜5 節で確認する。
独立した照合を書き、その後で著者の修正と比較する。
[review 5 節「指摘と報告」](../review/SKILL.ja.md#5-指摘と報告)に従い、
どの木や文書が誤っているかの根拠とともに相違を報告する。
レビュアーは作業ツリーを編集しない。
