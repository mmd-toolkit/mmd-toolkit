# @mmd-toolkit/wardley-no-duplicate-evolution

英語版: [wardley-no-duplicate-evolution.md](./wardley-no-duplicate-evolution.md)

前に設定した段階を置き換える `evolution` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

マップは段階の 1 つの並びを持つ。
後の `evolution` は、前に設定した段階をエラーなしに置き換え、
前の段階は失われる。

## 規則の詳細

この規則は、前の `evolution` と違う段階、つまり違う名前か、
描かれる場合の違う境界を与える `evolution` を報告する。
対象の図種は `wardley` である。

`evolution Genesis -> Custom` と `evolution Early -> Late` の後では、
マップは `Early` と `Late` だけを示す。

マップがすでに持つ段階を与える `evolution` は報告しない。
名前は、mermaid.js が示すとおりに、両端の空白を除き、 2 つ目の名前を、
前後に空白を 1 つずつ置いた `/` で 1 つ目につないで比べる。
mermaid.js は、すべての段階が境界を持つときだけ境界を描き、
そうでなければ等しい段階を描くので、境界は描かれるとおりに比べ、
`A@0.5 -> B@1.0` と `A -> B` は段階の 1 つの並びを与える。
名前はそのほかは書いたとおりに比べる。
mermaid.js は、`#35;` のような文字参照と HTML の属性の引用符を、
名前を読む前にほかの文字に変えるので、それだけが違う 2 つの名前は、
mermaid.js には 1 つで、この規則には 2 つのことがある。

`evolution` は 1 つ書く。

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

## 背景

パーサーは最後の `evolution` を保ち、
[マップ](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/wardley/wardleyParser.ts#L76-L90)
は、 2 つ目の名前を、
前後に空白を 1 つずつ置いた `/` でつないだ名前と境界を取る。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/wardley-no-duplicate-evolution.ts)
- [テストのソース](../../tests/rules/wardley-no-duplicate-evolution.test.ts)

<!-- end auto-generated rule resources -->
