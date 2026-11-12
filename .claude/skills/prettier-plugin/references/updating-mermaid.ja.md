# mermaid.js の更新のとき（prettier-plugin）

以下の節の番号は、[SKILL.ja.md](../SKILL.ja.md) の節の番号である。

1. mermaid.js の pin の更新、fixture の再生成、差分の分類は、
   tests-mermaid-update の SKILL の手順で先に行う。
   その結果を入力にする。
2. 通常のテスト一式を回す。
3. 失敗を分類する:
   - コーパスや fixture の Db が、
     整形の前後で違う: mermaid.js の字句や文法が変わり、
     printer の規則の前提（仕様の節）が変わった。
     仕様を先に直し（spec の SKILL）、それから規則を直す。
   - 整形の前の入力の受理や Db が変わった: printer の問題ではない。
     fixture の出力を書き出し直し、差分を読む。
   - 例外や冪等でない出力: printer の欠け。
4. 規則を変えるときは 5 節のとおり文書に書き、fixture、規則の文書、
   `docs/compatibility.md`、README を合わせる。
5. 規則のコメントが指す仕様の節と mermaid.js のリンクが、
   新しい版でも合っているかを確かめる。
6. 対象にする版（`docs/compatibility.md` の「対象にする mermaid.js
   の版」の表）を計算し直し、
   「対象にする版の mermaid.js のために残す形」の表を 1 行ずつ見る。
   挙げた版が 1 つも対象に残っていない規則は外し、
   `docs/printed-form.md` の決まりが与える形で印字する。
   公開済みの出力が変わるので、変更票を付ける。
   残る行には、対象の版のうちその形が要る版の名前を書く。
   新しい版の描画で見つかった新しい種類は、同じ変更で行を足す。
