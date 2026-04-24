<?php

$age = $_POST['age'];

if ($age >= 18 )
    {
        echo "YOUR AGE IS". $age. "</br>";
        echo "YOU ARE AN ADULT";
    }
    else{
        echo "YOUR AGE IS". $age. "</br>";
        echo "YOU ARE NOT AN ADULT";
    }
?>