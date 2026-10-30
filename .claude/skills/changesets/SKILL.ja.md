---
name: changesets
description: 公開するパッケージへの変更に要る changeset を、同じ変更で足す。
  `packages/parser`、`packages/prettier-plugin-mmd`、`packages/eslint-plugin`
  をパッケージの利用者に見える形で変えるとき、
  およびプルリクエストを開く前・更新する前に使う。
---

# Changesets

`@mmd-toolkit/parser`、`prettier-plugin-mmd`、`@mmd-toolkit/eslint-plugin` は、
Changesets で `main` から公開する（CONTRIBUTING.md の Releases）。
そのどれかの利用者に見える変更は、同じプルリクエストに changeset を含める。
無いと、その変更は次の版の changelog と版の更新から漏れる。

## changeset が要るとき

- 公開するパッケージの振る舞いが変わるとき。
  parser が受理するものや木に置くもの、フォーマッターが印字するもの、
  lint の規則が報告するものや修正するもの、メッセージ、規則の追加や削除、
  オプション、export する型や関数。
- 要らないもの。
  テスト、fixture、private のパッケージ（`spec`、`tests`）、
  リポジトリの文書やスキル、道具、CI だけの変更。

プルリクエストの前に `pnpm exec changeset status --since=origin/main`
を実行する。
ブランチで変えた公開パッケージに changeset が無ければ失敗し、
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

- front matter には、変更が触れる公開パッケージをすべて、
  それぞれの版の上げ方とともに書く。
  `patch` は、パッケージがすでに謳っていたとおりに動くようにする修正。
  `minor` は、利用者が気づく振る舞い、規則・報告・修正・export の追加。
  `major` は、1.0 以降に公開 API を壊す変更。
- 文は、利用者にとって何が変わり、なぜ要るかを書く。
  実装や review の経緯は書かない。
  関わる規則、オプション、図種はコードスパンで名指す。
- 1 つのプルリクエストに関係のない変更が複数あれば、changeset も 1 つずつ。
