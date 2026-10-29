# @mmd-toolkit/journey-no-empty-person

英語版: [journey-no-empty-person.md](./journey-no-empty-person.md)

名前のないタスクの人を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

タスクの人は、2 つ目のコロンの後に、コンマで区切って書く。
末尾のコンマの後のように一覧に空の場所があると、
mermaid.js にとってそれは名前が空の人で、 mermaid.js はエラーなしに、
その人をジャーニーと凡例に加える。

## 規則の詳細

この規則は、空か空白だけの、タスクの人をそれぞれ報告する。
対象の図種は `journey` である。

`Make tea: 5: Me,` の人は `Me` と空の名前で、
`A: 3: a,,b` も `a` と `b` の間に空の名前を持つ。
`Make tea: 5:` のように後に何もない 2 つ目のコロンは、
名前が空の人を 1 人タスクに与える。
`Make tea: 5` のように 2 つ目のコロンがなければ、タスクに人はおらず、
規則は報告しない。
`A: 3: ` の後に空白を 1 つ書いたような、空白だけの人も空である。

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

## 背景

mermaid.js は、
[`updateActors`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/user-journey/journeyDb.js#L49-L58)、
[`addTask`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/user-journey/journeyDb.js#L61-L84)
で、人のそれぞれの端の空白を除き、すべてのタスクの人を、空の名前も含めて、
凡例が示すジャーニーの actor に集める。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/journey-no-empty-person.ts)
- [テストのソース](../../tests/rules/journey-no-empty-person.test.ts)

<!-- end auto-generated rule resources -->
