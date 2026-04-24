<?php
$num1 = $_POST['num1'];
$num2 = $_POST['num2'];
$num3 = $_POST['num3'];

$highest = $num1;

if ($num2 > $highest) {
    $highest = $num2;
}

if ($num3 > $highest) {
    $highest = $num3;
}

echo "The highest value is <b>$highest</b>";
?>