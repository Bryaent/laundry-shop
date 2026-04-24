<!DOCTYPE html>
<html lang="en">
<head>
    <title>My Page</title>
    <style>
        .form-row {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
        }
        .form-row label {
            width: 150px; 
            text-align: left;   
            margin-right: 10px; 
        }
        #MI{
            width: 50px;
        }
    </style>
</head>
<body>    
<form method="post" action="awtput.php">
    <h2 style="text-align: center; "> BRYANT GWAPO COOPERATIVE INCORPORATED </h2> 
    <h3 style="text-align: center; "> Blk 35 Lot 13 EP HOUSING PINAGSAMA., Taguig City </h2>
    <hr>
    <h1>REGISTRATION FORM</h1>
    <div class="form-row">
        <label>Complete Name:</label>
        <input type="text" name="fname" placeholder="Last">, 
        <input type="text" name="mname" placeholder="First">, 
        <input type="text" name="lname" placeholder="M.I" id="MI">
    </div>
    <div class="form-row">
        <label>Address:</label>
        <input type="text" name="adress">
    </div>
    <div class="form-row">
        <label>Contact Number:</label>
        <input type="number" name="cnumber">
    </div>
    <div class="form-row">
        <label>Date of Birth:</label>
        <input type="date" name="dob">
    </div>
    <div class="form-row">
        <label>Gender:</label>
        Male <input type="radio" name="gender" value="Male">
        Female <input type="radio" name="gender" value="Female">
    </div>
    <div class="form-row">
        <label>Office Address:</label>
        <input type="text" name="oaddress">
        <label style="width: 120px; margin-left:10px;">Phone Number:</label>
        <input type="number" name="pnumber">
    </div>
    <div class="form-row">
        <label>Position:</label>
        <input type="text" name="position">
        <label style="width: 120px; margin-left:10px;">Employment Status:</label>
        <select name="status">
            <option value="Permanent">Permanent</option>
            <option value="Casual">Casual</option>
        </select>
    </div>
    <div class="form-row">
        <label>Monthly Salary:</label>
        <select name="salary">
            <option value="Below Php 10,000.00">Below Php 10,000.00</option>
            <option value="Php 10,000.00 - Php 20,000.00">Php 10,000.00 - Php 20,000.00</option>
            <option value="Above Php 20,000.00">Above Php 20,000.00</option>
        </select>
    </div>
    <div class="form-row">
        <label>Co-Borrower:</label>
        <input type="text" name="borrower">
    </div>
    <br><br><br>
    <button type="submit">Submit Registration</button> <button type="reset">Clear Form</button>
</form>
</body>
</html>