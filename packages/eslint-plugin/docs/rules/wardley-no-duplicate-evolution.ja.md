# @mmd-toolkit/wardley-no-duplicate-evolution

英語版: [wardley-no-duplicate-evolution.md](./wardley-no-duplicate-evolution.md)

前に設定した段階を置き換える `evolution` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

マップは段階の 1 つの並びを持つ。
後の `evolution` は、前に設定した段階をエラーなしに置き換え、
前の段階は失われる。

## 規則の詳細

この規則は、Wardley マップ（`wardley-beta`）に当てる。
直前の `evolution` が設定した段階の名前か描かれる境界を変える `evolution`
を報告する。
現在の段階を繰り返す文は報告しない。
名前は、mermaid.js が示すとおりに、両端の空白を除き、2 つ目の名前を、
前後に空白を 1 つずつ置いた `/` で最初の名前につないで比べる。

境界は描かれるとおりに比べる。
mermaid.js はすべての段階が境界を持つときだけそれを使い、
そうでなければ等しい幅の段階を描くので、
`A@0.5 -> B@1.0` と `A -> B` は同じである。
名前はそのほかは書いたとおりに比べる。
mermaid.js は、
名前を読む前に `#35;` のような文字参照と HTML の属性の引用符を変換するので、
それらだけが違う名前は、mermaid.js には同じでも、この規則には違うことがある。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/wardley-no-duplicate-evolution: error
wardley-beta
  evolution Genesis -> Custom
  evolution Early -> Late
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/wardley-no-duplicate-evolution: error
wardley-beta
  evolution Early -> Late
```

## オプション

この規則にはオプションがない。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/wardley-no-duplicate-evolution.ts)
- [テストのソース](../../tests/rules/wardley-no-duplicate-evolution.test.ts)

<!-- end auto-generated rule resources -->
