# Jison の図を読む（spec）

1. 文法の定義（`*.jison`）の字句の規則を、上から順に読む。
   決めることは次のとおり。
   - 排他状態（`%x`）と、状態を書かない規則（初期状態だけで当たる）、
     `<*>` の規則。
     `<*>` の規則はすべての状態で当たるが、ファイルでそれより前にある、
     その状態の規則が先に当たる。
     flowchart の例: 文字列の規則 `<*>["]` は、
     click の状態と dir の状態でも当たる。
   - トークンを返さない規則。
     flowchart の例: `"click"[\s]+` は状態に入るだけで、
     語 `click` は文法に見えない（既知の差異 `click-reserved-word`）。
     `""`、空の括弧の付いた `call`、`accDescr {}` の規則も、
     トークンを返さない（`tokenless-empty-forms`）。
   - 空の文字列に一致しうる規則（`[^\s\n]*` など）。
     テキストの終わりで空のトークンを返し、入力を拒否させる。
   - `[\s]+` のように改行を含む空白の規則。
     mermaid.js が末尾に足す改行まで取る（common.md の End of text）。
2. 文法の規則と、各規則の動作（Db の関数の呼び出し）を読む。
3. Db のクラスを読む。
   素のオブジェクトをキーの集合として使う箇所（`hasOwnProperty`、`__proto__`）、
   `Object.assign` とスプレッドの違い、正規表現による書き換え、
   例外を投げる箇所（文法の外の拒否）を探す。
   テキストではなくブラウザに依る値（`window.CSS` や `document`）も探す。
   sequence の例: box の色。
   そのような値は、サイトの設定と同じく外から与えられる。
   `@mmd-toolkit/tests` の `docs/db-from-tree/<図種>.md` がそう書き、
   それは tests-tree-checks のスキルの手順で書く。
4. 前処理の順序（common.md の Reading a source）と、
   検出（detection.md）を確かめる。
