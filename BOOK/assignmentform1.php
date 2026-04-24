<!DOCTYPE html>
<html>
<head>
<title>My First HTML Form</title>
</head>
<body>
<h2>My First HTML Form</h2>
<form method="POST" action="assignmentoutput1.php">
Firstname:
<input type="text" name="firstname"><br><br>
Middlename:
<input type="text" name="middlename"><br><br>
Lastname:
<input type="text" name="lastname"><br><br>
Course:
<select name="course">
<option>Computer Science</option>
<option>Information Technology</option>
<option>Others</option>
</select>
<br><br>
Gender:
<input type="radio" name="gender" value="Male"> Male
<input type="radio" name="gender" value="Female"> Female
<input type="radio" name="gender" value="Other"> Other
<br><br>
Phone:
+63 <input type="text" name="phone">
<br><br>
Address:
<br>
<textarea name="address" rows="4" cols="40"></textarea>
<br><br>
<input type="submit" value="Submit">
<input type="reset" value="Reset">
</form>
</body>
</html>