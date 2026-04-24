<?php
$age = $_POST['age'];

if ($age >= 0 && $age <= 4) {
    $level = "Nursery";
} elseif ($age >= 5 && $age <= 12) {
    $level = "Elementary";
} elseif ($age >= 13 && $age <= 16) {
    $level = "High School";
} elseif ($age >= 17 && $age <= 21) {
    $level = "College";
} else {
    $level = "Professional";
}

echo "Education Level: <b>$level</b>";
?>