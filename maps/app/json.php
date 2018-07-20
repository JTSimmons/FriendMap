<?php

 $DBhost = "localhost";
 $DBuser = "data";
 $DBpass = "pickle89";
 $DBname = "points";

 try{

  $DBcon = new PDO("mysql:host=$DBhost;dbname=$DBname",$DBuser,$DBpass);
  $DBcon->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

 }catch(PDOException $ex){

  die($ex->getMessage());
 }

 $type = $_GET['type'];
 $query = "SELECT * FROM pointdata WHERE point_type = $type";

 $stmt = $DBcon->prepare($query);
 $stmt->execute();

 $userData = array();

 while($row=$stmt->fetch(PDO::FETCH_ASSOC)){

  $userData['pointsJSON'][] = $row;
 }

 echo json_encode($userData);
?>
