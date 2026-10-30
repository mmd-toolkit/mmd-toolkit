# @mmd-toolkit/cynefin-no-redefined-domain

英語版: [cynefin-no-redefined-domain.md](./cynefin-no-redefined-domain.md)

前に持っていた項目を持たずに、もう一度書いた領域を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

もう一度書いた領域は、その項目を前に書いた項目に足さない。
mermaid.js はエラーなしにそれを後の項目で置き換え、
後のブロックが繰り返さない項目は失われる。

## 規則の詳細

この規則は、Cynefin 図（`cynefin-beta`）に当てる。
直前の同じ領域の文の項目を欠く領域の文を報告する。
項目なしにもう一度書いた領域も報告する。
直前の文のすべての項目を保つ文は、項目を足しても順を変えても報告しない。
2 度書いた項目は 2 つと数えるので、
`complex "A" "A"` の後の `complex "A"` は報告する。

項目のない文の後の文は報告しない。

項目は書いたとおりに比べる。
mermaid.js は、
項目を読む前に `#35;` のような文字参照と HTML の属性の引用符を変換する。
それらだけが違う項目は、mermaid.js には同じでも、この規則には違うことがある。
領域 `confusion` は最初の 3 つの項目と残りの数を描くが、
3 つ目より後の項目の変化も報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/cynefin-no-redefined-domain: error
cynefin-beta
  complex
    "Investigate"
  clear
    "Restart"
  complex
    "Experiment"
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/cynefin-no-redefined-domain: error
cynefin-beta
  complex
    "Investigate"
    "Experiment"
  clear
    "Restart"
```

## オプション

この規則にはオプションがない。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/cynefin-no-redefined-domain.ts)
- [テストのソース](../../tests/rules/cynefin-no-redefined-domain.test.ts)

<!-- end auto-generated rule resources -->
