<?php
$fname = $_POST['fname'];
$mname = $_POST['mname'];
$lname = $_POST['lname'];
$address = $_POST['adress'];
$cnumber = $_POST['cnumber'];
$dob = $_POST['dob'];
$gender = $_POST['gender'];
$oaddress = $_POST['oaddress'];
$pnumber = $_POST['pnumber'];
$position = $_POST['position'];
$status = $_POST['status'];
$salary = $_POST['salary'];
$borrower = $_POST['borrower'];
?>

    <!DOCTYPE html>
    <html>
    <head>
        <title>Registration Output</title>
        <style>
            table, th, td {
                border: 1px solid black; /* black border on table, headers, and cells */
            }
        </style>
    </head>
    <body>
    <h2 style="text-align: center; "> BRYANT GWAPO COOPERATIVE INCORPORATED </h2> 
    <h3 style="text-align: center; "> Blk 35 Lot 13 EP HOUSING PINAGSAMA., Taguig City </h2>
    <hr>
    <h1 style="text-align: center; ">REGISTRATION FORM</h1>
    
        <table style="border:1px solid black; width: 80%; margin: 0 auto; border-collapse: collapse;">
            <tr><th>Field</th><th>Value</th></tr>
            <tr><td>Complete Name</td><td><?php echo "$fname, $mname $lname"; ?></td></tr>
            <tr><td>Address</td><td><?php echo $address; ?></td></tr>
            <tr><td>Contact Number</td><td><?php echo $cnumber; ?></td></tr>
            <tr><td>Date of Birth</td><td><?php echo $dob; ?></td></tr>
            <tr><td>Gender</td><td><?php echo $gender; ?></td></tr>
            <tr><td>Office Address</td><td><?php echo $oaddress; ?></td></tr>
            <tr><td>Office Phone</td><td><?php echo $pnumber; ?></td></tr>
            <tr><td>Position</td><td><?php echo $position; ?></td></tr>
            <tr><td>Employment Status</td><td><?php echo $status; ?></td></tr>
            <tr><td>Monthly Salary</td><td><?php echo $salary; ?></td></tr>
            <tr><td>Co-Borrower</td><td><?php echo $borrower; ?></td></tr>
        </table>

        <br><br><br><br><br>

        <div style="text-align: center;">
            <a href="99.php">Back to form</a>
        </div>

    </body>
    </html>