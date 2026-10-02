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
