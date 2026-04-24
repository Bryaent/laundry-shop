<!DOCTYPE html>
<html>
    <head>
        <title>HTML Format</title>
    </head>
    <body>
        <form action="handle_form.php" method="post">
        <p><b>Name:</b><input type="text" name="name" size="20"/></p>
         <p><b>Email Address:</b><input type="text" name="email" size="40"/></p>
          <p><b>Gender:</b><input type="radio" name="gender" value="M"/>Male
          <input type="radio" name="gender" value="F" />Female</p>
          <p><b>Comments:</b>
          <textarea name="comments" rows="3" cols="50"></textarea></p>

          <input type="submit" name="submit" value="Submit Information">
          </form>

        
        

    </body>
</html>