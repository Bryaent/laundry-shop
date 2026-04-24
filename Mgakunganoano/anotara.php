<?php
$A = 10;
$B = 20;
$C = 30;

$X = 17;
$Y = 13;
$user = "USER";

$TOTAL = 100;
$KEY = 'SK12345';
$pass = 'password';

$qty = 5;
$price = 120;

function show($condition){
    echo ($condition ? "TRUE" : "FALSE") . "<br>";
}

($A < $B) ? print("A is less than B<br>") : print("A is greater than B<br>");

show(($A*4) <= ($B+4));
show(($B-$A) <= ($C/2));
show(($A*5) >= ($B*5));
show(!($A >= $B));
show(($B*2) >= !($C+4));

($A==$B) ? print("A is equal to B<br>") : print("A is not equal to B<br>");
($A!=$B) ? print("A is not equal to B<br>") : print("A is equal to B<br>");

show(!(($A <= $B) && ($A <= $B)));
show(($A <= $B) || ($A <= $B));
show(!($B <= $C));
show((($A <= $B) && ($A >= $B)) || ($A < $B));
show(!($A <= $B) && ($A >= $B) || ($A < $B));
show(!($A <= $B) && ($A >= $B) || ($A < $B));

show($qty > 3 && $price > 99);
show($X == 17 || $Y == 13);
show($X == 14 || $Y == 13);
show(!($X == 13));
show(($user == "USER") && ($pass == "password"));
show(($TOTAL > 100) || ($KEY == 'SK12345'));

?>