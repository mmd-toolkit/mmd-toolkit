# @mmd-toolkit/wardley-no-duplicate-annotations

英語版:
[wardley-no-duplicate-annotations.md](./wardley-no-duplicate-annotations.md)

注釈の枠に別の位置を与える、最初より後の `annotations` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

マップは、最初の `annotations` の位置に注釈の枠を 1 つ持つ。
mermaid.js はエラーなしに後の `annotations` を除くので、
それが与える位置は効果を持たない。

## 規則の詳細

この規則は、枠が示す文字を持つ注釈がマップにあるとき、最初と違う位置を与える、
最初より後の `annotations` を報告する。
対象の図種は `wardley` である。

`annotations [0.1, 0.2]` と `annotations [0.3, 0.4]` の後では、
枠は最初の位置にある。
後のそれぞれの `annotations` は、その前のものではなく最初のものと比べる。

最初の位置を与える `annotations` は報告せず、枠を描かない、
注釈の文字のないマップのものも報告しない。
位置は百分率として比べ、`0.1` と `10` は 1 つの位置である。
mermaid.js はマップの端を越える枠を内側に動かすので、
端の近くの 2 つの位置は 1 つの枠を与えることがあり、
この規則はそれを 2 つの位置として報告する。

`annotations` は枠の位置に 1 つ書く。

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

## 背景

[パーサー](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/wardley/wardleyParser.ts#L199-L204) は、
最初の `annotations` だけから枠の位置を取る。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/wardley-no-duplicate-annotations.ts)
- [テストのソース](../../tests/rules/wardley-no-duplicate-annotations.test.ts)

<!-- end auto-generated rule resources -->
