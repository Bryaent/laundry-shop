<!DOCTYPE html>
<html lang="en">
<head>

</head>
<body>
    <?php 
$name1="TERESITA CARDO";
$name2= "Teresita cardo";
$name3= "teresita cardo";
$char="@";
echo"$name3.<br>";
echo"$name1.<br>";
echo ucfirst ($name3)."<br>";
echo ucwords ($name3)."<br>";
echo strrev ($name3)."<br>";
echo ucwords ($name3)."<br>";
echo strlen ($name3)."<br>";
echo str_word_count ($name3)."<br>";
echo strpos ($name3,"cardo")."<br>";
echo str_replace ($name2,"Teresita","Tita Cardo")."<br>";
echo str_repeat ($char,5)."<br>";
?>
</body>
</html>