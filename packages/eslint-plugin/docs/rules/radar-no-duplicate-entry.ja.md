# @mmd-toolkit/radar-no-duplicate-entry

英語版: [radar-no-duplicate-entry.md](./radar-no-duplicate-entry.md)

曲線の前の値が持つ軸に、別の値を与える曲線の値を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

曲線は軸ごとに 1 つの値を持つ。
曲線が軸を別の値で 2 度名指すと、mermaid.js はエラーなしに最初の値を使い、
後の値は失われる。

## 規則の詳細

この規則は、レーダーチャート（`radar-beta`）に当てる。
宣言した軸に、
同じ曲線でその軸に与えた最初の値と違う値を与える曲線の値を報告する。
値はそれぞれ最初の値と比べ、曲線は別々に調べる。
最初の値を繰り返す値は報告しない。

値は数として比べるので、`1.0` と `01.00` は同じ値である。
宣言した軸を名指さない値は、
代わりに [radar-no-undef](./radar-no-undef.ja.md) が報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/radar-no-duplicate-entry: error
radar-beta
  axis A, B, C
  curve sales{A: 1, B: 2, C: 3, A: 9}
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/radar-no-duplicate-entry: error
radar-beta
  axis A, B, C
  curve sales{A: 9, B: 2, C: 3}
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [radar-no-undef](./radar-no-undef.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/radar-no-duplicate-entry.ts)
- [テストのソース](../../tests/rules/radar-no-duplicate-entry.test.ts)

<!-- end auto-generated rule resources -->
