# 材料の探し方（rule-ideas）

- 仕様: `packages/spec/docs/common.md` と
  `packages/spec/docs/diagrams/<図種>.md`。
  規則の帰結として書かれた、受理されるが意外な読み方を拾う。
- fixture: `packages/tests/fixtures/<図種>/` の `input.mmd`、`expected.json`、
  `ast.json`。
  とくに名前が `lex-`、`gram-`、`db-` で始まるもの。
- フォーマッターの制限: `packages/prettier-plugin-mmd/docs/<図種>.md` と
  `docs/compatibility.md`。
  空白 1 つや `;` 1 つで意味が変わる箇所が並んでいる。
- 既存の規則: `packages/eslint-plugin/docs/rules/`。
  同じものを出さない。
- 自分で探す: 書き手の側の誤り（閉じ忘れ、打ち間違い、id の使い回し、
  壊れた設定の JSON、コメントアウトの残り）から始めて、mermaid を動かす。
  仕様の珍しい例から始めると、意図して分かりにくい入力ばかりになりやすい。
  普通の書き方を mermaid が誤って読む例（subgraph の名前の語 `end`
  が改行を取り込む）は、規則でなく mermaid の不具合の候補として示す。
