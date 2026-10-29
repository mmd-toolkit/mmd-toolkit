# @mmd-toolkit/state-no-duplicate-description

英語版: [state-no-duplicate-description.md](./state-no-duplicate-description.md)

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

この規則は、状態図（`stateDiagram`、`stateDiagram-v2`）に当てる。
前の文が設定した説明を変える `accDescr` の文を報告する。
行の形とブロックの形をまとめて比べる。

テキストのない `accDescr:` も説明を設定するので数える。
その文は、空行、コメント行、ディレクティブを越えて、
テキストのある次の行を説明にし、そのような行がなければ説明を空にする。
空のブロックと閉じていないブロックは、この規則では数えない。
合成状態の中の `accDescr: x` も、
説明 `x` を持つ状態 `accDescr` を定義するので数えない。

現在の説明の繰り返しは報告しない。
両端と各改行の後の空白を除いて比べるので、ブロックの字下げと空行は数えず、LF、
CRLF、CR はどれも LF として比べる。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/state-no-duplicate-description: error
stateDiagram-v2
  accDescr: first
  accDescr: second
  A --> B
```

```mmd
%% eslint @mmd-toolkit/state-no-duplicate-description: error
stateDiagram-v2
  accDescr { first }
  accDescr: second
  A --> B
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/state-no-duplicate-description: error
stateDiagram-v2
  accTitle: first
  accDescr: second
  A --> B
```

```mmd
%% eslint @mmd-toolkit/state-no-duplicate-description: error
stateDiagram-v2
  accDescr: first
  accDescr {
    first
  }
  A --> B
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-duplicate-description](./flowchart-no-duplicate-description.ja.md)
- [state-no-duplicate-title](./state-no-duplicate-title.ja.md)
- [state-no-empty-description-block](./state-no-empty-description-block.ja.md)
- [state-no-unclosed-description-block](./state-no-unclosed-description-block.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/state-no-duplicate-description.ts)
- [テストのソース](../../tests/rules/state-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
