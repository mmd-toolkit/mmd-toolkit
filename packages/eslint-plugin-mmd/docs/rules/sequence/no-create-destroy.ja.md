# mmd/sequence/no-create-destroy

英語版: [no-create-destroy.md](./no-create-destroy.md)

`destroy` の前の `create` を禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

<!-- end auto-generated rule notice -->

`create` は、`participant` か `actor` の前に書き、
メッセージのところで参加者を作る。
`destroy` の前に書くと、mermaid.js はそれを受理して参加者を作り、
参加者は破棄されない。
`create destroy A` は、`create participant A` と同じことをする。

## 規則の詳細

この規則は、前に `create` がある `destroy` の文を報告する。
`sequence` に当たる。

`create destroy A` の後に `B ->> A: x` があると、
`create participant A` と同じく、メッセージのところで `A` を作り、
破棄したものとしては何も記録しない。

この規則に**反する**コードの例:

```mmd
%% eslint mmd/sequence/no-create-destroy: error
sequenceDiagram
  create destroy A
  B ->> A: x
```

この規則に**従う**コードの例:

```mmd
%% eslint mmd/sequence/no-create-destroy: error
sequenceDiagram
  create participant A
  B ->> A: x
```

## オプション

この規則にはオプションがない。
