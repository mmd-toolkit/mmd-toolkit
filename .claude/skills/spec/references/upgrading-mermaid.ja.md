# mermaid.js を更新するとき（spec）

以下の節の番号は、[SKILL.ja.md](../SKILL.ja.md) の節の番号である。

入力: mermaid.js の pin が上がり、
`fixtures:check` の差分が分類されている（tests-mermaid-update の SKILL）。

1. index.md の pin した版と commit を直す（記録は 1 か所）。
2. すべての permalink を新しい commit に直す。
   古い commit の URL を文書から抜き出し、各リンクについて、
   新しい版の同じファイルで関数を探し、行の範囲を合わせる。
   関数が動いた、消えた、名前が変わったものは、その主張を読み直す。
   直した後、`pnpm run lint:docs` を通す。
   ほかの commit を指すままの mermaid.js へのリンクがあれば、
   この検査が知らせる。
3. 差分のある fixture ごとに、それを引く主張を読み直し、
   mermaid.js の新しい読み方に合わせる。
4. Known divergences の各識別子が、まだ成り立つかを確かめる。
5. detection.md の検出器の順序と一覧を、新しい版と照らす。
6. 7 節のとおり結果を示す。
