# @mmd-toolkit/wardley-no-duplicate-annotations

英語版:
[wardley-no-duplicate-annotations.md](./wardley-no-duplicate-annotations.md)

注釈の枠に別の位置を与える、最初より後の `annotations` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

マップは、最初の `annotations` の位置に注釈の枠を 1 つ持つ。
mermaid.js はエラーなしに後の `annotations` を除くので、
それが与える位置は効果を持たない。

## 規則の詳細

この規則は、Wardley マップ（`wardley-beta`）に当てる。
枠に示す文字を持つ注釈がマップにあるとき、
最初と違う位置を与える後の `annotations` を報告する。
後の文はそれぞれ最初の文と比べる。
最初と同じ位置を与える `annotations` と、
注釈の文字のないマップの `annotations` は報告しない。

位置は百分率として比べるので、`0.1` と `10` は同じ位置である。
mermaid.js はマップの端を越える枠を内側に動かすので、
端の近くの 2 つの位置は同じ枠を与えても、違うものとして報告することがある。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/wardley-no-duplicate-annotations: error
wardley-beta
  annotations [0.1, 0.2]
  annotations [0.3, 0.4]
  annotation 1, [0.6, 0.7] "Review"
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/wardley-no-duplicate-annotations: error
wardley-beta
  annotations [0.1, 0.2]
  annotation 1, [0.6, 0.7] "Review"
```

## オプション

この規則にはオプションがない。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/wardley-no-duplicate-annotations.ts)
- [テストのソース](../../tests/rules/wardley-no-duplicate-annotations.test.ts)

<!-- end auto-generated rule resources -->
