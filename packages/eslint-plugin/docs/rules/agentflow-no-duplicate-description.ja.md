# @mmd-toolkit/agentflow-no-duplicate-description

英語版:
[agentflow-no-duplicate-description.md](./agentflow-no-duplicate-description.md)

前に設定した説明を置き換える `accDescr` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

agentflow は、`accDescr` が設定するアクセシブルな説明を 1 つ持つ。
後の `accDescr` は、前に設定した説明をエラーなしに置き換え、
前の説明は失われる。

## 規則の詳細

この規則は、最初のものより後の説明を設定する文のうち、
その前の説明と違う説明を設定するものを、それぞれ報告する。
対象の図種は `agentflow` である。

`accDescr:` は説明を設定する。
文字がなくても説明を設定する。
空の行と指示子を越えて、文字のある次の行を説明として取り、
そのような行が続かなければ、説明を空にする。
説明を持つ閉じたブロックも説明を設定する。
行の形とブロックの形は混ぜてよく、どちらが先でも、最後に書いた説明が使われる。
flow や `global` のブロックの中の文も図全体の説明を設定し、数える。
mermaid.js は、flow の中のそのような文の値を、
id として flow のメンバーにも加える。

説明の中ではコメント行も文字である。
ブロック `accDescr {`、`%% TODO`、`}` は説明 `%% TODO` を設定し、
`accDescr: d` の後では報告する。
mermaid.js は、図のほかの場所ではコメントであるそのような行を、
ブロックの中では保つ。

何も持たないブロックと、説明を空にする閉じないブロックは数えない。
[agentflow-no-empty-description-block](./agentflow-no-empty-description-block.ja.md)
と
[agentflow-no-unclosed-description-block](./agentflow-no-unclosed-description-block.ja.md)
がそれらを報告する。

図がすでに持つ説明を設定する文は、どちらの形でも報告しない。
`accDescr: d` の後のブロック `accDescr { d }` は何も失わない。
説明は mermaid.js が保つとおりに、
両端の空白と各改行の後の空白を除いて比べるので、
ブロックの行の字下げとその中の空の行は数えない。
改行（LF、CRLF、CR）はどれも LF として読む。
`accDescr: a` と `accDescr: b` の後の 3 つ目の `accDescr: a` は、
`b` を置き換えるので報告する。
説明はそのほかは書いたとおりに比べる。
mermaid.js は、`#35;` のような文字参照と HTML の属性の引用符を、
説明を読む前にほかの文字に変えるので、
それだけが違う 2 つの説明は、
mermaid.js には 1 つで、この規則には 2 つのことがある。

説明は 1 つにし、複数行の説明は 1 つのブロックに書く。

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

## 背景

[`accDescr` 文](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/parser/agentflow.jison#L427-L428)
は、前に設定した説明を置き換える共通の `setAccDescription` を呼ぶ。
[ブロック](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/parser/agentflow.jison#L61-L63)
の字句解析にはコメントの規則がなく、agentflow はコメントを保ったまま文字を読む。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/agentflow-no-duplicate-description.ts)
- [テストのソース](../../tests/rules/agentflow-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
