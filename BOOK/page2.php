<!DOCTYPE html>
<html>
<head>
    <title>Registration Details</title>
</head>
<body>

<h2>REGISTRATION DETAILS</h2>

<?php
// Separate name fields
$lastname = $_POST['lastname'];
$firstname = $_POST['firstname'];
$mi = $_POST['mi'];

// Combine full name in desired format: Surname, First Name M.I.
$fullname = $lastname . ", " . $firstname;
if(!empty($mi)){
    $fullname .= " " . $mi . ".";
}

// Other fields
$address = $_POST['address'];
$contact = $_POST['contact'];
$dob = $_POST['dob'];
$gender = $_POST['gender'];
$office_address = $_POST['office_address'];
$office_phone = $_POST['office_phone'];
$position = $_POST['position'];
$status = $_POST['status'];
$salary = $_POST['salary'];
$coborrower = $_POST['coborrower'];
?>

<table border="1" cellpadding="10">

<tr>
    <td>Full Name</td>
    <td><?php echo htmlspecialchars($fullname); ?></td>
</tr>
<tr>
    <td>Address</td>
    <td><?php echo htmlspecialchars($address); ?></td>
</tr>
<tr>
    <td>Contact Number</td>
    <td><?php echo htmlspecialchars($contact); ?></td>
</tr>
<tr>
    <td>Date of Birth</td>
    <td><?php echo htmlspecialchars($dob); ?></td>
</tr>
<tr>
    <td>Gender</td>
    <td><?php echo htmlspecialchars($gender); ?></td>
</tr>
<tr>
    <td>Office Address</td>
    <td><?php echo htmlspecialchars($office_address); ?></td>
</tr>
<tr>
    <td>Office Phone</td>
    <td><?php echo htmlspecialchars($office_phone); ?></td>
</tr>
<tr>
    <td>Position</td>
    <td><?php echo htmlspecialchars($position); ?></td>
</tr>
<tr>
    <td>Employment Status</td>
    <td><?php echo htmlspecialchars($status); ?></td>
</tr>
<tr>
    <td>Monthly Salary</td>
    <td><?php echo htmlspecialchars($salary); ?></td>
</tr>
<tr>
    <td>Co-Borrower</td>
    <td><?php echo htmlspecialchars($coborrower); ?></td>
</tr>

</table>
<!-- Back to Form Button -->
<form action="regisform.html">
    <button type="submit">Back to Form</button>
</form>
</body>
</html>