<!DOCTYPE html>
<html lang="en">
<head>
    
</head>
<body>
    <fieldset>
        <legend>BASIC INFORMATION</legend>
    <ol>
    <li>Name<input type="text" name="name" size = "20" placeholder="Name"></li>
     <li>Email<input type="text" name="email" size = "40" placeholder="Email"></li>
      <li>Phone<input type="tel" name="phone" size = "11" placeholder="Phone"></li>
      </ol>
</fieldset>

<fieldset>
    <legend>HOME ADDRESS</legend>
    <ol>
   <li>Address<textarea name="Address" rows="4" cols="50"></textarea></li>
    <li>Phone Code<input type="text" name = "post code" size = "10" placeholder="Post Code"></li>
    <li>Country<input type="text" name = "country" size = "20" placeholder="Country"></li>
</ol>
</fieldset>
 
<fieldset>
    
    <legend>TYPE OF PAYMENT</legend>
    <ol>
<li><fieldset>
    <legend>Payment</legend>

    <ol>
    <li><input type="radio" name="payment" value="credit">Credit Card</li>
    <li><input type="radio" name="payment" value="cash">Cash</li>
    <li><input type="radio" name="payment" value="gcash">GCash</li>
    </ol>
</fieldset>

      <li>Account Number<input type="text" name = "account number" size = "30" placeholder="Account Number"></li>
      <li>Account Name<input type="text" name = "account name" size = "15" placeholder="Account Name"></li>
      <li>Amount<input type="text " name = "amount" size = "10" placeholder="Amount"></li>
</ol>
</fieldset>
<input type="submit" value="Submit">
</body>
</html>