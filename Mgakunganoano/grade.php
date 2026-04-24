<?php

$grade = $_POST['grade'];

if ($grade >= 90){
    echo "YOU GOT AN A!";

}elseif($grade >= 80){
    echo "YOU GOT AN B!";

}elseif ($grade >= 70){
 echo "YOU GOT AN C!";
}else {
    echo "ANO BAYAN NAG AARAL KAPABA NG MABUTI
    SABIHIN MO NGA SAAKIN YUNG REASON KUNG BAKIT AYAN LANG HINDI KABA NAAWA SA PAMILYA MO";

}
?>