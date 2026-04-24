<?php
//handle_form.php
$name =$_POST['name'];
$comments =$_POST['comments'];
$email= $_POST['email'];

echo"Thank you, <b> $name </b> for the following comments:
    <br><tt>$comments</tt><p> We will reply to you at <i> $email</i></>";
    ?>
