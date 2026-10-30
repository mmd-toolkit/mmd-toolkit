# @mmd-toolkit/sequence-no-duplicate-description

英語版:
[sequence-no-duplicate-description.md](./sequence-no-duplicate-description.md)

説明をもう一度設定する `accDescr` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

図の説明は 1 つである。
別の `accDescr` の文が説明を設定すると、
mermaid.js はエラーなしに前の説明を置き換え、前のものは失われる。

## 規則の詳細

この規則は、シーケンス図（`sequenceDiagram`）に当てる。
前の文が設定した説明を変える `accDescr` の文を報告する。
行の形とブロックの形をまとめて比べる。
`loop` などのブロックの中の文も、図全体の説明を設定するので数える。

テキストのない `accDescr:` も説明を設定するので数える。
その文は、空行、コメント行、ディレクティブを越えて、
テキストのある次の行を説明にし、そのような行がなければ説明を空にする。
空のブロックと閉じていないブロックは、この規則では数えない。

現在の説明の繰り返しは報告しない。
両端と各改行の後の空白を除いて比べるので、ブロックの字下げと空行は数えず、LF、
CRLF、CR はどれも LF として比べる。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/sequence-no-duplicate-description: error
sequenceDiagram
  A ->> B: x
  accDescr: first
  accDescr: second
```

```mmd
%% eslint @mmd-toolkit/sequence-no-duplicate-description: error
sequenceDiagram
  A ->> B: x
  accDescr { first }
  accDescr: second
```

```mmd
%% eslint @mmd-toolkit/sequence-no-duplicate-description: error
sequenceDiagram
  loop every minute
    A ->> B: x
    accDescr: inner
  end
  accDescr: outer
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/sequence-no-duplicate-description: error
sequenceDiagram
  A ->> B: x
  accDescr: first
```

```mmd
%% eslint @mmd-toolkit/sequence-no-duplicate-description: error
sequenceDiagram
  accDescr: first
  accDescr {
    first
  }
  A ->> B: x
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-duplicate-description](./flowchart-no-duplicate-description.ja.md)
- [sequence-no-duplicate-title](./sequence-no-duplicate-title.ja.md)
- [sequence-no-empty-description-block](./sequence-no-empty-description-block.ja.md)
- [sequence-no-unclosed-description-block](./sequence-no-unclosed-description-block.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/sequence-no-duplicate-description.ts)
- [テストのソース](../../tests/rules/sequence-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
