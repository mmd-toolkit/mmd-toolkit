# mmd/no-ignored-init-directive

英語版: [no-ignored-init-directive.md](./no-ignored-init-directive.md)

図を設定するつもりで書いたが、mermaid.js が無視するディレクティブを禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

<!-- end auto-generated rule notice -->

mermaid.js は、init ディレクティブ、
つまり名前が `init` か `initialize` で終わる（大文字と小文字を区別して比べる）
ディレクティブから設定を取る。
図を設定するつもりで書いたディレクティブのいくつかは、エラーなしに無視され、
図はその設定なしに描かれる。

## 規則の詳細

この規則は、次のどちらかのディレクティブを報告する。
すべての図種に当たる。

- `'` をすべて `"` として読んでも、
  引数が正しい JSON でない init ディレクティブ。
  `%%{init: {"theme": "dark",}}%%` のように、
  最後の項目の後にカンマがあるだけで当たる。
  そのとき mermaid.js は、テキストのすべての init ディレクティブを無視し、
  その前の正しいものも無視する。
- 名前が init の名前と大文字と小文字だけ違うディレクティブ
  （`Init`、`INIT` など）。

### 図種ごとの現れ方

図種に対応したときに、その図種で規則が見つけるものをここに足す。

- flowchart: 設定 `"flowchart": {"inheritDir": true}` は、
  subgraph に図の方向を与える。
  最後の項目の後にカンマがあるディレクティブや、
  名前が `INIT` のディレクティブに書くと、subgraph に方向が付かない。

例は flowchart である。

この規則に**反する**コードの例:

```mmd
%%{init: {"flowchart": {"inheritDir": true},}}%%
flowchart LR
  subgraph S
    A
  end
```

```mmd
%%{INIT: {"flowchart": {"inheritDir": true}}}%%
flowchart LR
  subgraph S
    A
  end
```

この規則に**従う**コードの例:

```mmd
%%{init: {"flowchart": {"inheritDir": true}}}%%
flowchart LR
  subgraph S
    A
  end
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [no-unclosed-directive](./no-unclosed-directive.ja.md)

## 実装のための覚え書き

この規則はまだ実装していない。
ここには、実装するときに要ることを書く。

### 木での現れ方

`Root.directives` のディレクティブで、次のどちらかのもの。

- `'` をすべて `"` として読んでも、
  引数が正しい JSON でない init ディレクティブ。
  木は引数を解析しない。
  ディレクティブの `value` は `%%{` と `}%%` の間のテキストで、名前を含む。
  規則は、仕様の common.md（Where a directive is）の規則で、
  そこから引数を取り出し、JSON として解析する。
- init ディレクティブでなく、`name` が、
  大文字と小文字を区別しなければ `init` か `initialize` で終わるもの。

この規則は、パーサーが書かれたまま持ち、
読まない埋め込みデータを読む（仕様の既知の差異の
[`embedded-data-opaque`](../../../spec/docs/known-divergences.ja.md#embedded-data-opaque)）。
図の字句解析のやり直しではないが、パーサーが行わない 2 つの手順、
つまりディレクティブから引数を取り出すことと、それを JSON として解析することを、
規則の側で繰り返す。
また、mermaid.js は、図を設定するディレクティブを独自の走査で見つけ、
それは、まれな場合に `Root.directives` と違う
（common.md の The configuration scan）。
`%%}%%` で始まる行にあるディレクティブは何も設定しないが、
`Root.directives` には入る。
規則は `Root.directives` に従う。

### fixture

規則が依拠する mermaid.js の読み方は、
`@mmd-toolkit/tests` の次の fixture に記録されている。

- `common/config-init-trailing-comma`
- `common/config-init-name-uppercase`
- `common/config-init-name-capitalized`
- `flowchart/config-inherit-dir-directive`
- `common/directive-bad-json`
- `common/config-bad-json-drops-other-inits`
- `common/directive-single-quotes`
- `common/config-closing-marker-line`
