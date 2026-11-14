# 図種に対応したとき（eslint-plugin）

以下の節の番号は、[SKILL.ja.md](../SKILL.ja.md) の節の番号である。

1. 規則の名前を、`packages/spec/docs/ast/<図種>.md` の名前 `<図種>-` で始める。
   index の図種の表は、その規則ができると `update` が生成する（6 節）。
   図種を `tools/rule-docs.ts` の `DIAGRAM_ORDER` に足す。
   場所は、
   サイトがサイドバーに使う `packages/docs/.vitepress/documents.js` の
   `diagramOrder` での位置である。
   2 つの順序が違うと `tests/rule-docs.test.ts` が失敗し、
   `DIAGRAM_ORDER` にない図種の規則があると `update` が失敗する。
2. 共通の規則ごとに、新しい図種の普通の書き方の例を mermaid.js に掛ける。
   それを動かすスクリプトと、例を確かめて fixture を足す手順は、
   [4 節](checking-before-and-after-writing.ja.md)にある。
   その変更で実行するテストは、
   [tests-after-writing.ja.md](tests-after-writing.ja.md) にある。
   ほかの図種と同じに振る舞い、その規則がその図種について言うことがあるなら、
   規則の詳細の図種の箇条に 1 項目（そこで起きること）を足し、
   その fixture を規則のテストに足す。
   振る舞いが違う、または木の共通の部分の 1 つの定義で扱えなくなったなら、
   その規則は共通の規則の条件（rule-ideas の SKILL
   の[基準](../../rule-ideas/SKILL.ja.md#方針と基準)）を満たさない。
   図種の規則に移すのは規則についての判断なので、
   先に mermaid.js の結果を根拠に rule-ideas の SKILL で決め、
   それから文書を移す（8 節）。
3. その図種の規則の文書は、[SKILL.ja.md](../SKILL.ja.md) の手順で書く。
