# @mmd-toolkit/wardley-no-duplicate-size

英語版: [wardley-no-duplicate-size.md](./wardley-no-duplicate-size.md)

前に設定した大きさを置き換える `size` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

マップは 1 つの大きさを持つ。
後の `size` は、前に設定した大きさをエラーなしに置き換え、前の大きさは失われる。

## 規則の詳細

この規則は、Wardley マップ（`wardley-beta`）に当てる。
直前の `size` と違う幅か高さを与える `size` を報告する。
現在の大きさの繰り返しは報告しない。
数は数として比べる。

この規則は、フロントマターやディレクティブの設定の大きさを読まない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/wardley-no-duplicate-size: error
wardley-beta
  size [1100, 600]
  size [800, 1000]
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/wardley-no-duplicate-size: error
wardley-beta
  size [800, 1000]
```

## オプション

この規則にはオプションがない。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/wardley-no-duplicate-size.ts)
- [テストのソース](../../tests/rules/wardley-no-duplicate-size.test.ts)

<!-- end auto-generated rule resources -->
