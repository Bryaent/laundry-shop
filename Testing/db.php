<?php

$conn = new mysqli("localhost","root","","schooldb");

if($conn->connect_error){
die("Connection Failed");
}

?>