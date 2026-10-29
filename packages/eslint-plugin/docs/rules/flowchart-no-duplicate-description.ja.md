# @mmd-toolkit/flowchart-no-duplicate-description

英語版:
[flowchart-no-duplicate-description.md](./flowchart-no-duplicate-description.md)

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

この規則は、フローチャート（`flowchart`、`graph`、`flowchart-elk`、
`swimlane-beta`）に当てる。
前の文が設定した説明を変える `accDescr` の文を報告する。
行の形とブロックの形をまとめて比べる。
subgraph の中の文も、図全体の説明を設定するので数える。

`accDescr:` の後にテキストがないと、空行、コメント行、ディレクティブを越えて、
テキストのある次の行を説明にし、そのような行がなければ説明を空にする。
空のブロックと閉じていないブロックは、この規則では数えない。

現在の説明の繰り返しは報告しないが、前の説明に戻す文は報告する。
`accDescr: a` と `accDescr: b` の後の 3 つ目の `accDescr: a` は報告する。
両端と各改行の後の空白を除いて比べるので、ブロックの字下げと空行は数えず、LF、
CRLF、CR はどれも LF として比べる。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-description: error
flowchart LR
  accDescr: first
  accDescr: second
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-description: error
flowchart LR
  accDescr { first }
  accDescr: second
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-description: error
flowchart LR
  subgraph S
    A
    accDescr: inner
  end
  accDescr: outer
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-description: error
flowchart LR
  A
  accDescr: first
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-description: error
flowchart LR
  A
  accDescr: first
  accDescr {
    first
  }
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-duplicate-title](./flowchart-no-duplicate-title.ja.md)
- [flowchart-no-empty-description-block](./flowchart-no-empty-description-block.ja.md)
- [flowchart-no-unclosed-description-block](./flowchart-no-unclosed-description-block.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/flowchart-no-duplicate-description.ts)
- [テストのソース](../../tests/rules/flowchart-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
