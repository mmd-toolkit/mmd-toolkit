# 文書を消す、移す（eslint-plugin）

以下の節の番号は、[SKILL.ja.md](../SKILL.ja.md) の節の番号である。

- 文書を移すときは、規則の名前が変わる（6 節）。
  当たる図種を書いた規則の詳細の文と相対リンクを直し、`update` を実行する。
  題と index の行は `update` が書く。
- 文書を消したら、ほかの文書から参照が残っていないことを `grep` で確かめる。
- 文書を消す、移すときに回すテストは、
  [tests-after-writing.ja.md](tests-after-writing.ja.md) にある。
