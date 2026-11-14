# Chevrotain の図を読む（spec）

Chevrotain の図では、使用中の各 mode の token 配列を順に読み、custom matcher、
読み飛ばす単位、category、push/pop、
明示した `longer_alt` を含めて字句規則とする。
最長一致や、配列外の宣言順による優先順位は仮定しない。
parser の規則メソッド、gate、先読みを文法、
visitor/model の検証を受理条件とする。
複合 token の書かれた構成要素を区別して、
directive と無視するセミコロンの境界を定める。
mode ごとの空白とコメント、custom matcher の失敗、category と正確な単位の受理、
長い代替の対照例を調べる。
Jison の自動的な語境界は適用しない。
入力全体の消費と wrapper のエラー処理を調べる。
最初の字句エラーは構文エラーより先に報告され、
回復した CST が受理されるとは限らない。
