---
name: changesets
description: リリースするパッケージへの変更に要る changeset を、同じ変更で足す。
  `packages/parser`、`packages/prettier-plugin-mmd`、`packages/eslint-plugin`
  をパッケージの利用者に見える形で変えるとき、`packages/spec` を変えるとき、
  およびプルリクエストを開く前・更新する前に使う。
---

# Changesets

`@mmd-toolkit/parser`、`prettier-plugin-mmd`、`@mmd-toolkit/eslint-plugin` は、
Changesets で `main` から公開する（CONTRIBUTING.md の Releases）。
仕様の `@mmd-toolkit/spec` は npm に公開しないが、同じ仕組みでリリースする。
リリースで、版と変更履歴の項目と、git のタグ `@mmd-toolkit/spec@<版>` が付く。
実装が、従っている仕様の版を名指し、
そこから何が変わったかを読めるようにするためである。
この 4 つへの変更は、同じプルリクエストに changeset を含める。
無いと、その変更は次の版の changelog と版の更新から漏れる。

## changeset が要るとき

- 公開するパッケージの振る舞いが変わるとき。
  parser が受理するものや木に置くもの、フォーマッターが印字するもの、
  lint の規則が報告するものや修正するもの、メッセージ、規則の追加や削除、
  オプション、export する型や関数。
- `packages/spec` を変えるときは、常に要る。
- 要らないもの。
  テスト、fixture、リポジトリの文書やスキル、道具、CI だけの変更。
  版を持たない private のパッケージだけの変更も要らない。
  `tests`、`docs`、`playground` がそれで、
  `.changeset/config.json` の `ignore` に並べてある。

プルリクエストの前に `pnpm exec changeset status --since=origin/main`
を実行する。
ブランチで変えたパッケージに changeset が無ければ失敗し、
あれば版の上げ方を一覧にする。
読むのはステージ済みか commit 済みの changeset で、未追跡のファイルは見ない。

## 書き方

`.changeset/<短い kebab-case の名前>.md` を 1 つ置く。

```md
---
"@mmd-toolkit/eslint-plugin": minor
---

changelog に載せる 1〜2 文を、パッケージの利用者の言葉で。
```

- front matter には、変更が触れるパッケージをすべて、
  それぞれの版の上げ方とともに書く。
  公開するパッケージの上げ方は次のとおり。
  `patch` は、パッケージがすでに謳っていたとおりに動くようにする修正。
  `minor` は、利用者が気づく振る舞い、規則・報告・修正・export の追加。
  `major` は、1.0 以降に公開 API を壊す変更。
  仕様の上げ方は、版が 1.0 より前のあいだ、次のとおり。
  `minor` は、実装が従わなければならない変更。
  受理するもの、読み方、木、図種の判定、図種の追加や削除がこれに当たる。
  `patch` は、それ以外の変更（言い回し、例、リンク、fixture の引用）。
- 文は、利用者にとって何が変わり、なぜ要るかを書く。
  実装や review の経緯は書かない。
  関わる規則、オプション、図種はコードスパンで名指す。
  仕様では、利用者は実装である。
  変わった図種と節を名指す。
- 1 つのプルリクエストに関係のない変更が複数あれば、changeset も 1 つずつ。
