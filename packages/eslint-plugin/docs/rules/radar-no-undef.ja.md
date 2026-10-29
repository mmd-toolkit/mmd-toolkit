# @mmd-toolkit/radar-no-undef

英語版: [radar-no-undef.md](./radar-no-undef.md)

どの軸も名指さない曲線の値を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`A: 1` のように軸とともに書いた曲線の値は、その軸の値を与える。
どの `axis` 文もその名前を宣言しないと、mermaid.js はエラーなしにその値を捨て、
値は失われる。

## 規則の詳細

この規則は、レーダーチャート（`radar-beta`）に当てる。
図のどの `axis` 文も宣言しない軸の名前を持つ曲線の値を報告する。
名前は大文字小文字を区別して比べ、軸は id で名指すので、
`North: 1` は `axis A["North"]` を名指さない。
曲線の後に宣言した軸も数える。

宣言した軸の値を欠く曲線は、mermaid.js がエラーを出すので報告しない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/radar-no-undef: error
radar-beta
  axis A, B, C
  curve sales{A: 1, B: 2, C: 3, D: 9}
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/radar-no-undef: error
radar-beta
  axis A, B, C
  curve sales{C: 3, A: 1, B: 2}
```

## オプション

この規則にはオプションがない。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/radar-no-undef.ts)
- [テストのソース](../../tests/rules/radar-no-undef.test.ts)

<!-- end auto-generated rule resources -->
