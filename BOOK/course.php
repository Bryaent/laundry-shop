<?php
$course = $_POST['course'];
switch ($course)
{
    case "BSCS":
        echo "BS Computer Science";
        break;

        case "BSBA":
        echo "BS Business Administration";
        break;

        case "BSIT":
        echo "BS Information Technology";
        break;

        case "BSN":
        echo "BS Nursing";
        break;

        default:
        echo "Wrong Choice";
        break;
}
?>