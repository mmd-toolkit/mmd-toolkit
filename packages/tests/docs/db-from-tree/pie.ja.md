# 木から pie の Db を構築する

英語版: [pie.md](./pie.md)

`src/db-from-tree/pie.ts` が木から要約を構築する。
要約の欄は [pie の要約](../db-summaries.ja.md#pie) にある。
木は [ast/pie.md](../../../spec/docs/ast/pie.md) に従う。
受理条件は [diagrams/pie.md](../../../spec/docs/diagrams/pie.md) に従う。

## 木から要約を構築する

1. **変換後のテキスト。**
   共有の converted-text を使う。
   共通の directive、コメント領域、選択されたセミコロンを除く。
   CR・CRLF を LF にし、frontmatter より後の本文全体で属性の引用符を変換する。
   実体参照はマーカーにし、復号しない。
   木は書かれた値を保つ。
   hidden
   YAML・DIRECTIVE のノードは Db に何も加えない。 [fixture: pie/directive-label-middle]
   [fixture: pie/comment-label-line]
   [fixture: pie/style-label-trigger]
   [fixture: pie/label-crlf]
   [fixture: pie/html-all-texts]
   [fixture: pie/entity-all-texts]
   [fixture: pie/frontmatter-between-section-parts]

2. **ラベル。**
   変換後の StringLiteral の内部を読む。
   バックスラッシュに続く `b`、`f`、`n`、`r`、`t`、`v`、`0` は制御文字にする。
   それ以外の escape はバックスラッシュを除いた文字になる。
   Unicode・十六進の綴りを数値として復号しない。
   ラベルを trim・sanitize しない。
   引用符は両方を使える。
   空のラベル、
   prototype にある名前も通常の Map キーである。 [fixture: pie/label-escapes]
   [fixture: pie/label-unknown-escapes]
   [fixture: pie/label-escaped-quotes]
   [fixture: pie/label-whitespace]
   [fixture: pie/label-empty]
   [fixture: pie/db-prototype-labels]

3. **数値と区分。**
   数の綴りを共有の double として読む。
   変換後の値がゼロ未満なら、重複ラベルでも拒否する。
   負のゼロと負の underflow は通る。
   変換後のラベルごとに最初の値だけを、初出の順に保つ。
   `numberOrText` により負のゼロはゼロ、
   overflow は `"Infinity"` になる。 [fixture: pie/db-slice-order]
   [fixture: pie/db-three-definitions]
   [fixture: pie/review-db-converted-duplicate-single-double]
   [fixture: pie/db-duplicate-negative]
   [fixture: pie/db-duplicate-negative-zero]
   [fixture: pie/db-duplicate-first-negative-zero]
   [fixture: pie/review-number-negative-underflow-final]
   [fixture: pie/number-overflow]

4. **共通値の最終代入。**
   null・空白だけの値も含め、全共通文をソース順に読む。
   行の値は両端の共通の空白を除く。
   ASCII space・tab が 2 つ以上続く箇所は space 1 つにする。
   ブロックは物理行・LS・PS の各行で両端の空白を除く。
   同じ横の空白列と連続する LF をまとめる。
   引用符とバックスラッシュはテキストのままである。
   各フィールドの変換後の最終値が空でない場合だけ公開する。
   最後の本文 title が空なら frontmatter の title が残る。
   最後の accessibility の値が空なら、Db の初期値の空文字列が残る。
   前の代入は残らない。 [fixture: pie/title-spaces]
   [fixture: pie/review-common-single-tab-lines]
   [fixture: pie/review-common-quotes-backslashes]
   [fixture: pie/review-block-whitespace-only-lines]
   [fixture: pie/review-db-common-third-definitions]
   [fixture: pie/review-acctitle-whitespace-final]
   [fixture: pie/review-accdescr-whitespace-final]
   [fixture: pie/review-frontmatter-whitespace-body-final]

5. **公開と設定。**
   初期 title は共有の `embedded.title` から取る。
   これは Mermaid の変換後の frontmatter title である。
   accessibility の初期値は空文字列。
   title と accessibility にだけ次の置換を適用する。
   `textReplacementOf(embedded.config)` の置換である。
   description は共有の common Db と同じく、LF の後の空白も除く。
   `showData` は図から写す。
   描画設定から要約のフィールドを増やさない。 [fixture: pie/frontmatter-html]
   [fixture: pie/frontmatter-title]
   [fixture: pie/frontmatter-title-overridden]
   [fixture: pie/accdescr-block]
   [fixture: pie/config-security-other]
   [fixture: pie/config-other-root-false]
   [fixture: pie/showdata-section-inline]
   [fixture: pie/config-drawing-only]

## 記録された結果との比較

`specified.json` があれば使い、なければ `expected.json` を使う。
原子の中の directive と選択されたセミコロンの差異は拒否を記録する。
Db は比較しない。
Mermaid が拒否した不透明な埋め込みの内容も、比較する Db を持たない。
HTML と C4 の共有の読み方は pie にも適用する。
裸の percent の共有の読み方は、検出と同じく保持された形式を通る。
nonleading YAML と二度目の走査の directive は、そのまま残す。
裸行と一緒に通過した空白・改行だけを除く。
pie 固有の指定読みの分岐は加えない。 [fixture: pie/div-directive-number]
[fixture: pie/div-atomic-semicolon-number]
[fixture: pie/div-review-yaml-leading-invalid]
[fixture: pie/div-review-frontmatter-html-cross-label]
[fixture: pie/div-detect-c4-label]
[fixture: pie/div-preheader-bare-ls-blank]
[fixture: pie/div-preheader-retained-yaml-bare-ls]
[fixture: pie/div-preheader-retained-yaml-bare-bom]
[fixture: pie/div-preheader-retained-yaml-bare-ls-line]
[fixture: pie/div-preheader-retained-directive-bare-ls]
[fixture: pie/div-preheader-retained-directive-bare-bom]
[fixture: pie/div-preheader-retained-directive-bare-ls-line]
[fixture: pie/div-preheader-retained-yaml-bare-then-directive]
[fixture: pie/lex-preheader-retained-yaml-bare-ascii]
[fixture: pie/lex-preheader-retained-directive-bare-ascii]
[fixture: pie/lex-preheader-retained-yaml-bare-ascii-line]
[fixture: pie/lex-preheader-retained-directive-bare-ascii-line]
[fixture: pie/lex-preheader-retained-yaml-bare-then-directive-ascii]
