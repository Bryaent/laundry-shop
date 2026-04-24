<?php
if (isset($_POST['cm'])) {
    $cm = $_POST['cm'];
    $meter = $cm / 100;
    $kilo = $cm / 100000;

    echo "Centimeter: " . $cm . "<br>";
    echo "Meter: " . $meter . "<br>";
    echo "Kilometer: " . $kilo . "<br>";
} else {
    echo "No input received. Please go back to the form.";
}
?>