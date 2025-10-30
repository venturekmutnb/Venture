<?php
 $host = "localhost";
 $username ="root";
 $password ="";
 $dbname ="Venture";

 $conn = new mysqli($host,$username,$password,$dbname);

if($conn->connect_error){
    die("Connect failed: " . $conn->connect_error);
}
?>