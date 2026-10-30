# @mmd-toolkit/journey-no-empty-person

英語版: [journey-no-empty-person.md](./journey-no-empty-person.md)

名前のないタスクの人を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

タスクの人は、2 つ目のコロンの後に、コンマで区切って書く。
末尾のコンマの後のように一覧に空の場所があると、
mermaid.js にとってそれは名前が空の人で、 mermaid.js はエラーなしに、
その人をジャーニーと凡例に加える。

## 規則の詳細

この規則は、ユーザージャーニー図（`journey`）に当てる。
タスクの 2 つ目のコロンの後の、コンマで区切る人の一覧で、
空か空白だけの名前をそれぞれ報告する。
後に何もない 2 つ目のコロンは、空の名前を 1 つ与えるので報告する。
2 つ目のコロンのないタスクは、人を持たないので報告しない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/journey-no-empty-person: error
journey
  section Work
    Make tea: 5: Me,
```

```mmd
%% eslint @mmd-toolkit/journey-no-empty-person: error
journey
  section Work
    Make tea: 5:
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/journey-no-empty-person: error
journey
  section Work
    Make tea: 5: Me
```

```mmd
%% eslint @mmd-toolkit/journey-no-empty-person: error
journey
  section Work
    Make tea: 5
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [journey-no-ignored-text](./journey-no-ignored-text.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/journey-no-empty-person.ts)
- [テストのソース](../../tests/rules/journey-no-empty-person.test.ts)

<!-- end auto-generated rule resources -->
