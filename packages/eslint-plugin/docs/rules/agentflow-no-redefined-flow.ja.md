# @mmd-toolkit/agentflow-no-redefined-flow

英語版: [agentflow-no-redefined-flow.md](./agentflow-no-redefined-flow.md)

その id に前に書いたタイトルを置き換える flow の宣言を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

同じ flow の id の宣言は、mermaid.js では 1 つの flow である。
そのメンバーは合わされ、後のタイトルはエラーなしに前のものを置き換える。

## 規則の詳細

この規則は、agentflow 図（`agentflow-beta`）に当てる。
同じ id の前の宣言が設定した、flow の現在のタイトルと違うタイトルを報告する。
タイトルがない宣言、空白だけのタイトルの宣言、
現在と同じタイトルの宣言は報告せず、メンバーを足すために flow を再宣言できる。

名前のない flow は書いたタイトルを持たず、前のタイトルを置き換えない。
名前のない 2 つの flow は別の flow である。

`F@{ label: Review }` のようなデータブロックが設定するタイトルは、
宣言の間にあっても比べない。

タイトルは両端の空白を除き、そのほかは書いたとおりに比べるので、
文字参照や HTML の属性の引用符の違いは、
mermaid.js が同じタイトルとして読んでも報告することがある。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-flow: error
agentflow-beta TB
  flow F[First]
    A
  end
  flow F[Second]
    B
  end
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-flow: error
agentflow-beta TB
  flow F[First]
    A
  end
  flow F
    B
  end
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [agentflow-no-duplicate-direction](./agentflow-no-duplicate-direction.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/agentflow-no-redefined-flow.ts)
- [テストのソース](../../tests/rules/agentflow-no-redefined-flow.test.ts)

<!-- end auto-generated rule resources -->
