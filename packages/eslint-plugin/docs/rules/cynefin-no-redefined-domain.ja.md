# @mmd-toolkit/cynefin-no-redefined-domain

英語版:
[cynefin-no-redefined-domain.md](./cynefin-no-redefined-domain.md)

前に持っていた項目を持たずに、もう一度書いた領域を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

もう一度書いた領域は、その項目を前に書いた項目に足さない。
mermaid.js はエラーなしにそれを後の項目で置き換え、
後のブロックが繰り返さない項目は失われる。

## 規則の詳細

この規則は、前の同じ領域の文の項目を欠く領域の文を報告する。
対象の図種は `cynefin` である。

`complex "Investigate"` と `complex "Experiment"` の後では、
領域 `complex` は `Experiment` だけを持ち、`Investigate` は描かれない。
項目なしにもう一度書いた領域は、すべての項目を取り除く。
それぞれの文は、項目のない文も含めて、
その直前の同じ領域の文と比べる。

前の文のすべての項目を保つ文は、項目を足しても、
別の順に書いても報告しない。
2 度書いた項目は 2 つと数える。
`complex "A" "A"` の後の文 `complex "A"` は、その 1 つを取り除くので報告する。
項目のない文の後の文は何も失わず、報告しない。
項目の中のすべての改行（LF、CRLF、CR）は LF として読む。
項目はそのほかは書いたとおりに比べる。
mermaid.js は、`\n` のようなエスケープを解き、
`#35;` のような文字参照と HTML の属性の引用符を、
項目を読む前にほかの文字に変えるので、
それだけが違う 2 つの項目は、
mermaid.js には 1 つで、この規則には 2 つのことがある。
領域 `confusion` は最初の 3 つの項目と残りの数を描くので、
3 つ目より後の項目の変化は、Db にしか現れなくても報告する。

領域はそれぞれ 1 度、すべての項目とともに書く。

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

## 背景

[Db](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/cynefin/cynefinDb.ts#L34-L48)
は、領域の項目をその名前の下に、前にそこに保った項目の上から保つ。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/cynefin-no-redefined-domain.ts)
- [テストのソース](../../tests/rules/cynefin-no-redefined-domain.test.ts)

<!-- end auto-generated rule resources -->
