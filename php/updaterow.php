<?php
require 'utils.php';

function bindBlob($stmt,$ndx,$blob)
{
	$stream = fopen('php://temp','r+');
 fwrite($stream,$blob);
 rewind($stream);
	$code = $stmt->bindParam(":{$ndx}",$stream,PDO::PARAM_LOB);	
	if (false === $code) dieWith(-3);
}

if (null === $dbh) dieWith(-7);
$data = file_get_contents('php://input');
if (false === $data) dieWith(-6);

$data = json_decode($data,true);
if ((null === $data) || !is_array($data) || (3 != count($data))) dieWith(-5);

$db = $data[0];
$cql = $data[1];
$blobs = $data[2];

dbExistsCheck($db,-4);


try
{
 $sql = "USE `{$db}`";
 $code = $dbh->exec($sql);
 if (false === $code) dieWith(-3);
 $stmt = $dbh->prepare($cql);
 if (false === $stmt) dieWith(-2,$dbh->errorInfo());
 
	
	foreach($blobs as $ndx=>$blob) bindBlob($stmt,$ndx,$blob);
		
	$code = $stmt->execute();
	$err = $dbh->errorInfo();
	$code = ('00000' == $err[0])?1:0;
	$data = array($code,$err);
	dieWith($code,$data);
}	catch(Exception $e)	{dieWith(-1,$e->getMessage());}
?>
