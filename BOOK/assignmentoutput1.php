<?php

$firstname = $_POST['firstname'];
$middlename = $_POST['middlename'];
$lastname = $_POST['lastname'];
$course = $_POST['course'];
$gender = $_POST['gender'];
$phone = $_POST['phone'];
$address = $_POST['address'];

echo "My name is <b>$firstname $middlename $lastname</b>. ";
echo "My course is <b>$course</b>. <br>";
echo "I am a <b>$gender</b> student and my mobile number is <b>+63$phone</b>. <br>";
echo "I am living at <b>$address</b>.";

?>