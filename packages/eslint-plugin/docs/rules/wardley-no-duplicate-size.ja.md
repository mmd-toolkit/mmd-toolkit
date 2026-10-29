# @mmd-toolkit/wardley-no-duplicate-size

英語版: [wardley-no-duplicate-size.md](./wardley-no-duplicate-size.md)

前に設定した大きさを置き換える `size` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

マップは 1 つの大きさを持つ。
後の `size` は、前に設定した大きさをエラーなしに置き換え、前の大きさは失われる。

## 規則の詳細

この規則は、前の `size` と違う幅か高さを与える `size` を報告する。
対象の図種は `wardley` である。

`size [1100, 600]` と `size [800, 1000]` の後では、マップは幅 800、
高さ 1000 である。

マップがすでに持つ大きさを与える `size` は報告しない。
数は数として比べる。
フロントマターや指示子の設定の大きさは読まない。

`size` は 1 つ書く。

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

## 背景

パーサーは最後の `size` を保ち、
[マップ](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/wardley/wardleyParser.ts#L70-L73)
はその幅と高さを取る。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/wardley-no-duplicate-size.ts)
- [テストのソース](../../tests/rules/wardley-no-duplicate-size.test.ts)

<!-- end auto-generated rule resources -->
