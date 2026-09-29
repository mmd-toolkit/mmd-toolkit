# mmd/sequence/no-link-without-separator

英語版: [no-link-without-separator.md](./no-link-without-separator.md)

ラベルと URL の間に `@` がない `link` の文を禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

<!-- end auto-generated rule notice -->

`link` の文は、参加者にリンクを与える。
そのテキストは、`link A: Dashboard @ https://x.example` のように、
ラベル、`@`、URL である。
`@` を書き忘れても、mermaid.js は文を受理し、
書いたものと違うラベルと URL のリンクを設定する。

## 規則の詳細

この規則は、テキストに `@` のない `link` の文を報告する。
`sequence` に当たる。

`@` がないと、ラベルはテキストから最後の 2 文字を除いたもの、
URL はテキスト全体になる。
`link A: Dashboard https://x.example` は、
ラベル `Dashboard https://x.examp` と、
URL `Dashboard https://x.example` を与える。

テキストのない `link` の文も報告する。
`link A:` は、ラベルも URL も空のリンクを参加者に与える。

この規則に**反する**コードの例:

```mmd
sequenceDiagram
  participant A
  link A: Dashboard https://x.example
```

この規則に**従う**コードの例:

```mmd
sequenceDiagram
  link A: Dash @ https://x.example
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [no-invalid-json](./no-invalid-json.ja.md)

## 実装のための覚え書き

この規則はまだ実装していない。
ここには、実装するときに要ることを書く。

### 木での現れ方

テキストが `@` を持たない `SequenceLinkStatement`。
つまり、`text` が null か、`text` の `value` が null か、
その `SequenceLiteral` の `value` が `@` を持たないもの。
値の中の `@` を探すことは値を読むことで、テキストの字句解析のやり直しではない。

### fixture

規則が依拠する mermaid.js の読み方は、
`@mmd-toolkit/tests` の次の fixture に記録されている。

- `sequence/db-link-without-at-url`
- `sequence/db-link-without-at`
- `sequence/db-link-label`
- `sequence/db-link-empty`
