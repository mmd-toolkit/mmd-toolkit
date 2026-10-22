# @mmd-toolkit/agentflow-no-empty-description-block

英語版:
[agentflow-no-empty-description-block.md](./agentflow-no-empty-description-block.md)

説明を持たない `accDescr` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

mermaid.js は、何もない閉じた `accDescr { }` のブロックをエラーなしに受理し、
そのブロックは説明を設定しない。

## 規則の詳細

この規則は、何も持たないか空白だけを持つ閉じた `accDescr` のブロックを報告する。
対象の図種は `agentflow` である。
ブロックの中の指示子は文字ではない。
指示子だけを持つブロックも報告し、mermaid.js はその設定を当てる。

説明はブロックの前のままである。
`accDescr: x` の後のブロック `accDescr { }` は説明 `x` を残し、
前に説明がなければ説明は空のままである。
行として書いた空の説明は違う。
文字のある行が後にない `accDescr:` は、説明を空の文字にする。

空のブロックは、`A accDescr {}` のように同じ行の文の最後の部分の後や、
`agentflow-beta TB accDescr {}` のようにヘッダーの後にもあり得る。
`flow F accDescr {}` のように flow や connector の名前の中や、
`click` 文の URL やツールチップの前にもあり得る。
そこでも説明を設定せず、この規則は同じように報告する。

コメント行を持つブロックは空ではない。
mermaid.js はその行をブロックの文字として保つので、
`accDescr {`、`%% TODO`、`}` は説明 `%% TODO` を設定する。

説明を書くか、ブロックを取り除く。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/agentflow-no-empty-description-block: error
agentflow-beta TB
  A
  accDescr {
  }
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-empty-description-block: error
agentflow-beta TB
  flow F accDescr {}
    A
  end
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/agentflow-no-empty-description-block: error
agentflow-beta TB
  A
  accDescr {
    The steps of the review
  }
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [agentflow-no-duplicate-description](./agentflow-no-duplicate-description.ja.md)
- [agentflow-no-unclosed-description-block](./agentflow-no-unclosed-description-block.ja.md)

## 背景

[ブロックの字句解析](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/parser/agentflow.jison#L61-L63)
は空のブロックに文字を与えないので、どの文も説明を設定しない。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/agentflow-no-empty-description-block.ts)
- [テストのソース](../../tests/rules/agentflow-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
