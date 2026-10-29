# @mmd-toolkit/gantt-no-undef

英語版: [gantt-no-undef.md](./gantt-no-undef.md)

どのタスクの id でもない id を指す `click`、`after`、`until` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`click` はリンクにするタスクを、`after` はその後にタスクを始めるタスクを、
`until` はその開始でタスクを終えるタスクを、id で名指す。
id がどのタスクのものでもないとき、mermaid.js はエラーを出さない。
`click` はどのタスクもリンクにせず、
`after` と `until` はタスクの開始や終わりを今日の日付にする。
id を書き間違えると、タスクは今日に動く。

## 規則の詳細

この規則は、`click` の文の中、`after` の後、`until` の後にある id のうち、
チャートのどのタスクの id でもないものを報告する。
対象の図種は `gantt` である。

`Design :des1, 2024-01-06, 3d` の後、
`click des2 href "…"` はどのタスクもリンクにせず、
`Build :after des2, 5d` は今日の日付に始まり、
`Review :2024-01-01, until des2` は今日の日付に終わる。
一覧の id はそれぞれ調べる。
`click des1,des3 href "…"` は `des1` をリンクにし、`des3` を報告する。
`after des1 des2` は、`des2` が書かれていないかのように、
タスクを `des1` の後に始め、`des2` を報告する。

チャートの id は、そのタスクの id である。
タスクのデータは、タグの後に 1 つから 3 つの項目を持つ。
3 つのときは、`Design :des1, 2024-01-06, 3d` の `des1` のように、
最初の項目が id である。
1 つか 2 つのときは、mermaid.js がテキストの順に、 `task1`、
`task2` のような id をタスクに与える。
データが 4 つ以上の項目を持つタスクは、id を持たない。
`a : 2024-01-01, 1d` の後の `click task1 href "…"` は、そのタスクをリンクにし、
報告しない。

`after` はデータの開始、つまり 2 つの項目の最初か、3 つの項目の 2 つ目で読み、
`until` は終わり、つまり 1 つから 3 つの項目の最後で読む。
どちらも小文字で、後に空白が続くときである。
mermaid.js は、ASCII の英字、数字、`_`、`-`、
空白でない最初の文字の前までを id として読み、空白で分ける。
そのため `after a.1` はタスク `a` を名指し、その id のタスクがなければ、
`a.1` という id のタスクがあっても、規則は `a` を報告する。
`after a設計` も同じである。
2 つの id の間がタブなら、mermaid.js は最初のものだけを読む。
`after 設計` のように、空白の後にそうした文字がなければ、
mermaid.js は項目を日付として読み、読めずにチャートを描かない。
規則はこれを報告しない。
ほかの項目は参照でなく、規則は読まない。
`After a2` と `Until b1` は日付として読み、4 つ以上の項目のデータでは、
mermaid.js はどの項目も読まず、チャートを描けない。
id の中の指令は id の一部でない。
`after a%%{init: {}}%%1` はタスク `a1` を名指す。
id は、大文字小文字も含めて書いたとおりに比べる。
`a : Des1, 2024-01-01, 1d` の後の `after des1` は、どのタスクも名指さず、
報告する。

名指すタスクより後に書いたタスクも、チャートのタスクである。
タスク `t1` の前の `after t1` は、タスクを `t1` の後に始める。
名指すタスクより前に書いた `click` の文は、mermaid.js ではそれをリンクにしない。
そうした文はチャートの id を名指しており、正しく書かれているので、
規則は報告しない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/gantt-no-undef: error
gantt
  dateFormat YYYY-MM-DD
  Design :des1, 2024-01-06, 3d
  click des2 href "https://example.com"
```

```mmd
%% eslint @mmd-toolkit/gantt-no-undef: error
gantt
  dateFormat YYYY-MM-DD
  Design :des1, 2024-01-06, 3d
  Build :after des2, 5d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-undef: error
gantt
  dateFormat YYYY-MM-DD
  Design :des1, 2024-01-06, 3d
  Review :2024-01-01, until des2
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/gantt-no-undef: error
gantt
  dateFormat YYYY-MM-DD
  Design :des1, 2024-01-06, 3d
  Build :after des1, 5d
  click des1 href "https://example.com"
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-undef](./flowchart-no-undef.ja.md)
- [gantt-no-duplicate-id](./gantt-no-duplicate-id.ja.md)

## 背景

mermaid.js は、
[`getStartDate`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L304-L323)、
[`getEndDate`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L388-L407)
で、`after` と `until` を、チャートを描くときに、
式 `/^after\s+(?<ids>[\d\w- ]+)/` と、`/^until\s+(?<ids>[\d\w- ]+)/` で読み、
どの id もタスクの id でなければ、開始や終わりを今日の日付にする。
`click` は、
[`setLink`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L673-L688)
で、テキストを読む間に id を探すので、その後に書いたタスクはまだ見つからない。
`after` がいくつかのタスクを名指し、そのうちの 1 つが後に書かれているとき、
mermaid.js はそれを待たずにタスクを始めることがある。
[#4424](https://github.com/mermaid-js/mermaid/issues/4424) （"gantt: Depedencies
('after') not always taken into account"）は、
ラベル "Type: Bug / Error" と "Status: Triage" を持って開いている。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/gantt-no-undef.ts)
- [テストのソース](../../tests/rules/gantt-no-undef.test.ts)

<!-- end auto-generated rule resources -->
