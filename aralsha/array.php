<?php  
// create array
$myArr = array("Volvo", 15, ["apples", "bananas"]);
echo "$myArr[0]<br>";
echo "$myArr[1]<br>";
echo $myArr[2][0] . "<br>";
echo $myArr[2][1] . "<br>";
echo count($myArr) . "<br>";

$cars = array("Volvo", "BMW", "Toyota"); 
$cars[1] = "Ford";
echo ($cars[0]) . "<br>";

foreach ($cars as $x) {
  echo "$x <br>";
}
foreach ($myArr as $y) {
    if (is_array($y)) {
        foreach ($y as $item) {
            echo $item . "<br>";
        }
    } else {
        echo $y . "<br>";
    }
}

$car = array("brand"=>"Ford", "model"=>"Mustang", "year"=>1964);
echo $car["brand"];
?>
