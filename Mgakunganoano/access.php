<?php
$username = $_POST['username'];
$password = $_POST['password'];

if ($username == "bryant")
    {
        if ($password == "mahalkita")
    {
        echo "HELLO BRYANT! MAHAL NA MAHAL KITA.";

    }  
    else
        {
            echo "INCORRECT PASSWORD.";
        }      
    }
    else
        {

        
        echo "USERNAME NOT FOUND.";
        }
        ?>
    