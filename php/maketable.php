<?php
require 'utils.php';

function goMakeTable($dbh,$cmd)
{
	try
	{
		$code = $dbh->exec($cmd);
		if (false === $code) dieWith(-2,$dbh->errorInfo());
	
	 $err = $dbh->errorInfo();
		$code = ('00000' == $err[0])?1:0;
	 $data = array($code,$err);
	 dieWith($code,$data);
	}
	catch(Exception $e)	{dieWith(-1,$e->getMessage());}
}

if (null === $dbh) dieWith(-7);
$data = file_get_contents('php://input');
if (false === $data) dieWith(-6);

$data = json_decode($data);
if ((null === $data) || !is_array($data) || (2 != count($data))) dieWith(-5);

$db = $data[0];
$cql = $data[1];

dbExistsCheck($db,-4);

$sql = "USE `{$db}`";
$code = $dbh->exec($sql);
if (false === $code) dieWith(-3);
goMakeTable($dbh,$cql)
?>
