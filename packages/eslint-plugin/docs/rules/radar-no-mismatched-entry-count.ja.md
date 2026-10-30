# @mmd-toolkit/radar-no-mismatched-entry-count

英語版:
[radar-no-mismatched-entry-count.md](./radar-no-mismatched-entry-count.md)

軸の数と違う数の値を、軸の名前なしに持つ曲線を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`curve sales{1, 2, 3}` のように値だけで書いた曲線は、それを順に軸に与える。
曲線の値が図の軸より多いか少ないと、mermaid.js はエラーなしに受理し、
曲線をまったく描かず、凡例の項目だけが残る。

## 規則の詳細

この規則は、レーダーチャート（`radar-beta`）に当てる。
値が軸の名前を持たず、その数が図の軸の数と違う曲線を、
軸のない図の曲線も含めて報告する。
曲線の後の軸も、名前が繰り返される軸も、すべて数える。
いくつかの曲線を持つ文では、曲線を別々に調べる。

軸の名前を持つ曲線は報告しない。
どの軸も名指さない値は [radar-no-undef](./radar-no-undef.ja.md) が報告し、
軸の値を欠く曲線には mermaid.js がエラーを出す。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/radar-no-mismatched-entry-count: error
radar-beta
  axis A, B, C
  curve sales{1, 2}
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/radar-no-mismatched-entry-count: error
radar-beta
  axis A, B, C
  curve sales{1, 2, 3}
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [radar-no-undef](./radar-no-undef.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/radar-no-mismatched-entry-count.ts)
- [テストのソース](../../tests/rules/radar-no-mismatched-entry-count.test.ts)

<!-- end auto-generated rule resources -->
