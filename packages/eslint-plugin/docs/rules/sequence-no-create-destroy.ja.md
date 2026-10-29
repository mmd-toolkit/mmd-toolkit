# @mmd-toolkit/sequence-no-create-destroy

英語版: [sequence-no-create-destroy.md](./sequence-no-create-destroy.md)

`destroy` の前の `create` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`create` は `participant` や `actor` の前に書き、
メッセージのところで参加者を作る。
`destroy` の前に書くと、mermaid.js はエラーなしに受理して参加者を作るが、
破棄しない。
`create destroy A` は `create participant A` と同じことをする。

## 規則の詳細

この規則は、シーケンス図（`sequenceDiagram`）に当てる。
`create` が前にある `destroy` の文を報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/sequence-no-create-destroy: error
sequenceDiagram
  create destroy A
  B ->> A: x
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/sequence-no-create-destroy: error
sequenceDiagram
  create participant A
  B ->> A: x
```

## オプション

この規則にはオプションがない。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/sequence-no-create-destroy.ts)
- [テストのソース](../../tests/rules/sequence-no-create-destroy.test.ts)

<!-- end auto-generated rule resources -->
