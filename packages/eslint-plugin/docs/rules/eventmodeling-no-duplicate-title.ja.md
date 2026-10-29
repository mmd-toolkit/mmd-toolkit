# @mmd-toolkit/eventmodeling-no-duplicate-title

英語版:
[eventmodeling-no-duplicate-title.md](./eventmodeling-no-duplicate-title.md)

前に設定したアクセシブルなタイトルを置き換える `accTitle` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

イベントモデリング図は、`accTitle` が設定するアクセシブルなタイトルを 1 つ持つ。
後の `accTitle` は、前に設定したタイトルをエラーなしに置き換え、
前のタイトルは失われる。

## 規則の詳細

この規則は、イベントモデリング図（`eventmodeling`）に当てる。
直前の `accTitle` の文字が空でないとき、
それと違う文字を持つ `accTitle` を報告する。
mermaid.js は、`accTitle:` を含む文全体をアクセシブルなタイトルとして保つので、
文字がないか空白だけの `accTitle:` もタイトルを設定する。
`accTitle: First` の後ではそれを報告するが、文字のない `accTitle:` の後の文は、
文字が失われないので報告しない。

mermaid.js はイベントモデリング図のタイトルを描かないので、
繰り返した `title` 文は報告しない。

文字は、両端の空白を除き、
2 つ以上の空白やタブの連なりを 1 つの空白として比べる。
直前の `accTitle` と同じ文字を繰り返す文は報告しない。
前のタイトルに戻す文は報告する。
`accTitle: a` と `accTitle: b` の後の 3 つ目の `accTitle: a` は報告する。
文字はそのほかは書いたとおりに比べる。
mermaid.js は、
タイトルを読む前に `#35;` のような文字参照と HTML の属性の引用符を変換するので、
それらだけが違う文字は、mermaid.js には同じでも、この規則には違うことがある。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-duplicate-title: error
eventmodeling accTitle: First
  tf 01 evt Bought accTitle: Second
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-duplicate-title: error
eventmodeling accTitle: Second
  tf 01 evt Bought
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [eventmodeling-no-duplicate-description](./eventmodeling-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/eventmodeling-no-duplicate-title.ts)
- [テストのソース](../../tests/rules/eventmodeling-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
