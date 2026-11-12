# フォーマッターが印字する形を変えたとき（eslint-plugin）

以下の節の番号は、[SKILL.ja.md](../SKILL.ja.md) の節の番号である。

1. `pnpm --filter @mmd-toolkit/eslint-plugin run update:docs` を実行する。
   parser を build し、英日の例を書き換える。
2. `pnpm --filter @mmd-toolkit/eslint-plugin run test:update` を実行し、
   スナップショットの差分を読む。
   もう報告されなくなった反する例と、報告されるようになった従う例は、
   書いたまま残す（4 節の手順 4）か、例から外す。
   `<!-- prettier-ignore -->`
   を付けた例をフォーマッターが同じ形に印字するようになったら、
   もう残す理由はないので、印とその文を消す。
3. 書き換えた文書の本文から、古い形を探す。
   フォーマッターが変えた行を引いているコードスパンである。
   英日とも新しい形に書く。
4. フォーマッターが、
   前は変えていた書き方を書かれたまま残すようになった変更では、
   該当する例を fixture の `input.mmd` から作り直す（4 節の手順 4）。
   古い印字結果を整形し直しても、fixture のテキストには戻らないからである。
5. `pnpm run lint:docs` を実行する。
   続けて、ドキュメントサイトのテストを実行する。
   このテストは、build したプラグインで、すべての規則の文書の例を表示する。
   先に `pnpm --filter @mmd-toolkit/eslint-plugin run build` を実行し、
   そのあと `pnpm --filter @mmd-toolkit/docs run test` を実行する。
   `packages/docs/pages/linter` のページの例は手で書くので、
   それもフォーマッターが印字する形に直す。
