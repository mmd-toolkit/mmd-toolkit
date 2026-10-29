# @mmd-toolkit/journey-no-ignored-text

英語版: [journey-no-ignored-text.md](./journey-no-ignored-text.md)

mermaid.js が捨てる、タスクのデータの中のテキストを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

`Make tea: 5: Me: Cat` のように 2 人の間にコロンを書くと、
その後の人は捨てられる。
mermaid.js はタスクのデータを 3 つ目のコロンの前までしか使わず、
残りをエラーなしに捨てる。
タスクのデータは、コロンで区切った score と人で、人はコンマで区切る。

## 規則の詳細

この規則は、ユーザージャーニー図（`journey`）に当てる。
タスクの 3 つ目のコロン以降のデータが、コロンと空白以外を含むときに報告する。
後に何もない 3 つ目のコロンは、何も捨てないので報告しない。
ディレクティブは捨てるテキストと数えないので、
3 つ目のコロンの後がディレクティブだけでも報告しない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/journey-no-ignored-text: error
journey
  section Work
    Make tea: 5: Me: Cat
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/journey-no-ignored-text: error
journey
  section Work
    Make tea: 5: Me, Cat
```

```mmd
%% eslint @mmd-toolkit/journey-no-ignored-text: error
journey
  section Work
    Make tea: 5: Me:
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-ignored-text](./flowchart-no-ignored-text.ja.md)
- [journey-no-invalid-score](./journey-no-invalid-score.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/journey-no-ignored-text.ts)
- [テストのソース](../../tests/rules/journey-no-ignored-text.test.ts)

<!-- end auto-generated rule resources -->
