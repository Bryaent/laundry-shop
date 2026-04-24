<?php

$name = $_POST['name'];
$Address = $_POST['Address'];
$country = $_POST['country'];
$phone = $_POST['phone'];
$amount = $_POST['amount'];

$modepayment = $_POST['modepayment'];
$accountname = $_POST['accountname'];
$accountnumber = $_POST['accountnumber'];

echo "My name is <b>" . $name . "</b><br>";
echo "I am living at " . $Address . "<br>". $country. "<br>";
echo "My mobile number is " . $phone . "<br>";
echo "<br>";
echo "The Total Amount that I need to pay is <b>" . $amount . "</b><br>";
echo "<br>";
echo "<b>Mode of payment: </b>" . $modepayment . "<br>";
echo "<b>Account name: </b>" . $accountname . "<br>";
echo "<b>Account number:</b> " . $accountnumber . "<br>";



?>