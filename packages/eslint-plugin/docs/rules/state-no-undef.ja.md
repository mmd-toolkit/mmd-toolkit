# @mmd-toolkit/state-no-undef

英語版: [state-no-undef.md](./state-no-undef.md)

どの状態も名指さない `style`、`class`、`click`、`note` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`style`、`class`、`click`、ノートは状態を指す。
未知の名前でもエラーは出ず、スタイルとクラスは何も変えず、
クリックはどの状態もリンクにせず、ノートはほかの文が書かない新しい状態を作る。

## 規則の詳細

この規則は、状態図（`stateDiagram`、`stateDiagram-v2`）に当てる。
`style`、`class`、`click`、`note` の文の未知の状態名を、
一覧の名前ごとに報告する。
単独で書いた状態、遷移、状態の本体、別名、fork、join、choice が定義する状態を、
合成状態も含め、図のどこにあっても定義済みと数える。

ほかの文が定義しない状態を指すノートは、最初のものだけを報告する。
mermaid.js がその状態を作り、後のノートはそれを指すからである。
その状態は、`style`、`class`、`click` にとっても、
どこにあっても定義済みと数える。

指す状態より前の文は報告せず、その状態に効く。
合成状態の中の `style` と `class` は効果を持たないが、この規則は、
その名前が定義されているかだけを調べる。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/state-no-undef: error
stateDiagram-v2
  A --> B
  style Z fill:#f00
```

```mmd
%% eslint @mmd-toolkit/state-no-undef: error
stateDiagram-v2
  A --> B
  note left of Z : x
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/state-no-undef: error
stateDiagram-v2
  A --> B
  style A fill:#f00
  note left of B : x
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-undef](./flowchart-no-undef.ja.md)
- [class-no-undef](./class-no-undef.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/state-no-undef.ts)
- [テストのソース](../../tests/rules/state-no-undef.test.ts)

<!-- end auto-generated rule resources -->
