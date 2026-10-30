# @mmd-toolkit/journey-no-invalid-score

英語版: [journey-no-invalid-score.md](./journey-no-invalid-score.md)

1 から 5 の数でないタスクの score を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

タスクの score は、ジャーニーの 1 から 5 の目盛りに顔を置く。
`Make tea: 5 Me` のようにコロンがないと、
ほかのテキストがエラーなしに score に入ることがあり、
数でなければ顔の位置がなく、目盛りの外の数なら顔を外に置く。

## 規則の詳細

この規則は、ユーザージャーニー図（`journey`）に当てる。
1 から 5 の数（両端を含む）として mermaid.js が読まない、
タスクの score を報告する。
score は、最初のコロンの後から、2 つ目のコロンがあればその前までのテキストを、
端の空白を除いて JavaScript の `Number` で読んだものである。
タスクの名前の中のコロンは名前を終えるので、
`Lunch at 12:30: 4: Me` の score は `30` になり、報告する。

空か空白だけの score は 0 なので報告する。
ほかの数の形も値で調べ、`3.5` と `0x3` は報告せず、`1e2`、`-2`、
`Infinity` は報告する。
score の中に書いたコメントはその一部なので、`a: 5 %% c` は報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/journey-no-invalid-score: error
journey
  section Work
    Make tea: 5 Me
```

```mmd
%% eslint @mmd-toolkit/journey-no-invalid-score: error
journey
  section Work
    Make tea: 7: Me
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/journey-no-invalid-score: error
journey
  section Work
    Make tea: 5: Me
```

```mmd
%% eslint @mmd-toolkit/journey-no-invalid-score: error
journey
  section Work
    Make tea: 1: Me, Cat
```

## オプション

この規則にはオプションがない。

## 参考

- [ユーザージャーニー図の構文: score](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/userJourney.md#L24)
- [Issue #6262: ジャーニー図で顔が範囲の外に出る](https://github.com/mermaid-js/mermaid/issues/6262)
- [Issue #4248: ユーザージャーニーの目盛りの設定](https://github.com/mermaid-js/mermaid/issues/4248)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/journey-no-invalid-score.ts)
- [テストのソース](../../tests/rules/journey-no-invalid-score.test.ts)

<!-- end auto-generated rule resources -->
