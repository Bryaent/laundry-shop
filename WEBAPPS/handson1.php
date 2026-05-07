<!DOCTYPE html>
<html>
<head>
    <title>Handson1</title>
</head>
<body>

<form action="handson2.php" method="POST">

<fieldset>
<legend>Basic Information</legend>

<ol>
<li>
Name
<input type="text" name="name" placeholder="First Name, Last Name" required>
</li>

<li>
Email
<input type="email" name="emailadd" placeholder="example@gmail.com" required>
</li>

<li>
Phone
<input type="tel" name="pnumber" placeholder="+639123456789" required>
</li>
</ol>

</fieldset>

<fieldset>
<legend>Home Address</legend>

<ol>
<li>
Address
<textarea name="address" maxlength="100"></textarea>
</li>

<li>
Postal Code
<input type="text" name="postcode">
</li>

<li>
Country
<input type="text" name="country">
</li>
</ol>

</fieldset>

<fieldset>
<legend>Type of Payment</legend>

<ol>
<li>
<input type="radio" name="payment" value="Credit"> Credit<br>
<input type="radio" name="payment" value="Cash"> Cash<br>
<input type="radio" name="payment" value="GCash"> GCash<br>
</li>

<li>
Account Number
<input type="tel" name="accnumber">
</li>

<li>
Account Name
<input type="text" name="accname">
</li>

<li>
Account
<input type="text" name="emailacc">
</li>

</ol>

</fieldset>

<br>
<button type="submit">Submit</button>

</form>

</body>
</html>