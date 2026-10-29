# @mmd-toolkit/wardley-no-redefined-node

英語版: [wardley-no-redefined-node.md](./wardley-no-redefined-node.md)

別の値でもう一度宣言したノードを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

Wardley マップは id ごとに 1 つのノードを持つ。
もう一度宣言したノードは 2 つ目のノードを足さない。
mermaid.js はエラーなしに前の宣言の位置、戦略、慣性を置き換え、
前の値は失われる。

## 規則の詳細

この規則は、Wardley マップ（`wardley-beta`）に当てる。
同じ id の前の宣言でノードが持つ値と違う値を与える anchor、component、
pipeline の子の宣言を報告する。
mermaid.js はテキストの順によらず anchor、component、
pipeline の子の順に取るので、anchor と component が同じ id を持つと、
component が anchor より前に書いてあっても component を報告する。
`P` の pipeline の子 `X` は id `P_X` を持ち、
`P_X` という名前の component を置き換える。

位置は百分率として比べるので、`0.6` と `60.0` は同じ位置である。
ラベルのずれを省いた後の宣言は前のずれを保つので報告しないが、
前に与えた戦略や慣性を省いた宣言は報告する。
pipeline の親の進化の向きの位置は、mermaid.js が親を子の上に描くので比べない。

ノードの現在の値を繰り返す宣言は報告しない。
名前は [wardley-no-undef](./wardley-no-undef.ja.md) が比べるとおりに比べる。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/wardley-no-redefined-node: error
wardley-beta
  component API [0.6, 0.7] (build) inertia
  component API [0.3, 0.8]
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/wardley-no-redefined-node: error
wardley-beta
  component API [0.6, 0.7] (build) inertia
  component Database [0.3, 0.8]
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [wardley-no-undef](./wardley-no-undef.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/wardley-no-redefined-node.ts)
- [テストのソース](../../tests/rules/wardley-no-redefined-node.test.ts)

<!-- end auto-generated rule resources -->
