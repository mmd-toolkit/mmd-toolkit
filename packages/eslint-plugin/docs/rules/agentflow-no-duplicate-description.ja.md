# @mmd-toolkit/agentflow-no-duplicate-description

英語版:
[agentflow-no-duplicate-description.md](./agentflow-no-duplicate-description.md)

前に設定した説明を置き換える `accDescr` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

`agentflow-beta` の図は、`accDescr` が設定するアクセシブルな説明を 1 つ持つ。
後の `accDescr` は、エラーなしにそれを置き換え、前の説明は失われる。

## 規則の詳細

この規則は、agentflow 図（`agentflow-beta`）に当てる。
前の文が設定した説明を変える `accDescr` の文を報告する。
行の形とブロックの形をまとめて比べる。
flow や `global` のブロックの中の文も、図全体の説明を設定するので数える。

`accDescr:` の後にテキストがないと、空行とディレクティブを越えて、
テキストのある次の行を説明にし、そのような行がなければ説明を空にする。
ブロックの中も含め、コメント行も説明のテキストとして数える。
空のブロックと閉じていないブロックは、この規則では数えない。

現在の説明の繰り返しは報告しない。
両端と各改行の後の空白を除いて比べるので、ブロックの字下げと空行は数えず、LF、
CRLF、CR はどれも LF として比べる。
そのほかは書いたとおりに比べるので、文字参照や HTML の属性の引用符の違いは、
mermaid.js が同じ説明として読んでも報告することがある。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/agentflow-no-duplicate-description: error
agentflow-beta TB
  accDescr: first
  accDescr: second
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-duplicate-description: error
agentflow-beta TB
  accDescr: short
  accDescr {
    A longer
    description
  }
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/agentflow-no-duplicate-description: error
agentflow-beta TB
  accDescr {
    A longer
    description
  }
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [agentflow-no-duplicate-title](./agentflow-no-duplicate-title.ja.md)
- [agentflow-no-empty-description-block](./agentflow-no-empty-description-block.ja.md)
- [agentflow-no-unclosed-description-block](./agentflow-no-unclosed-description-block.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/agentflow-no-duplicate-description.ts)
- [テストのソース](../../tests/rules/agentflow-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
