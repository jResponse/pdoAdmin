<?php
require 'utils.php';
if (null === $dbh) dieWith(-3);
$usr = (isset($_GET['usr']))?$_GET['usr']:null;
if (null == $usr) dieWith(-2);

if (isLegalname($usr,1,-1))
{
	$dbh->exec('USE `mysql`');
	
	$sql = "SELECT COUNT(*) FROM `db` WHERE Host = 'localhost' AND User = '{$usr}'";
	$count = $dbh->query($sql)->fetchColumn();
	if (0 == $count) dieWith(0);else
	{
 	$sql = "SELECT * FROM `db` WHERE Host = 'localhost' AND User = '{$usr}'";
	 $dpv = $dbh->query($sql)->fetch(PDO::FETCH_ASSOC); 
  $keys = array_keys($dpv);
  $dpv = flatten($dpv);		
	}
	
		dieWith(1,array($keys,$dpv));
		/*
		$count = $dbh->query("SELECT COUNT(*) FROM `user` WHERE User = '$usr'")->fetchColumn();
	if (0 == $count) dieWith(0);
	
	$upv = $dbh->query("SELECT * FROM `user` WHERE User = '$usr' AND Host = 'localhost'")->fetchAll(PDO::FETCH_ASSOC);
	$keys = array_keys($upv[0]);
	$upv = flatten($upv);
	*/
}
?>
