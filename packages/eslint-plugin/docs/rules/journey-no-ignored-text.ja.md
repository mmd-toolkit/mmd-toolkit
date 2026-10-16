# @mmd-toolkit/journey-no-ignored-text

英語版: [journey-no-ignored-text.md](./journey-no-ignored-text.md)

mermaid.js が読まない、タスクのデータの中のテキストを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`Make tea: 5: Me: Cat` のように 2 人の間にコロンを書くと、
その後の人は捨てられる。
mermaid.js はタスクのデータを 3 つ目のコロンの前までしか読まず、
残りをエラーなしに捨てる。
タスクのデータは、コロンで区切った score と人で、人はコンマで区切る。

## 規則の詳細

この規則は、タスクのデータの 3 つ目のコロンから後のテキストが、
コロンと空白のほかのものを持つときに、それを報告する。
対象の図種は `journey` である。

`Make tea: 5: Me: Cat` は人が `Me` だけのタスクで、
`A: 3: a,b: c, d` の人は `a` と `b` である。
`Make tea: 5: Me:` のように、後に何もない 3 つ目のコロンは何も捨てず、
規則は報告しない。
捨てられるテキストの中の指令は、その一部でない。
`A: 5: Me: a%%{init: {}}%%b` は `ab` を捨て、
後に指令だけを書いた `Make tea: 5: Me:` は何も捨てない。

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
