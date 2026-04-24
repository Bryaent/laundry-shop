<?php
$x = 4;

switch($x){
 case 1:
 case 2: echo "x is less than 3"; break;
 case 3: echo "x is equal to 3"; break;
 case 4:

 case 5:  echo "x is less than 6"; break;
 case 6: echo "x is equal to 6"; break;
 case 7: 

 case 8: echo "x is less than 9"; break;
 case 9: echo "x is equal to 9"; break;

 default: echo "x is beyound 1 to 9";}
    

 $y = "Malaysia";
 switch($y){
    case "Philippines": echo "You Liked Philippines"; break;
    case "Singapore": echo "You Liked Singapore"; break;
    case "Japan": echo "You Liked Japan"; break;
    default: echo "You Like other country";}

    $day = "Saturday";
    if($day == "Friday"){
        echo "Have a nice weekend!";
    }elseif($day == "Sunday"){
        echo "Have a nice Sunday!";
    }else{
        echo "Have a nice day!";
    }
?>