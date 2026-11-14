# 書いた後のテスト（eslint-plugin）

以下の節の番号は、[SKILL.ja.md](../SKILL.ja.md) の節の番号である。
5 節の項目 6:

文書だけの変更では、この検査を動かし、
テストは回さない（SKILL `conventions`
の「[テストの実行](../../conventions/SKILL.ja.md#テストの実行)」）。
例外は、テストが読むものを変えたときである。
つまり、例（3 節の 2 行の後のコードブロック）か規則のファイルである。
そのときは、
`tests/rule-cases.test.ts` と規則のテスト `tests/rules/<名前>.test.ts` を回し、
最初の段落と生成する部分のために `pnpm run check:docs` を動かす。
例が変わるとスナップショットも変わる。
`pnpm --filter @mmd-toolkit/eslint-plugin run test:update` で更新し、
差分を読む。
どの変更にどのテストが対応するかは、
SKILL `eslint-plugin-rules` の
[4 節](../../eslint-plugin-rules/SKILL.ja.md#4-テストと-fixture)にある。
