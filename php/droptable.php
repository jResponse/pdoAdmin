<?php
require 'utils.php';
require '_tablelist.php';

if (null === $dbh) dieWith(-6);
$db = (isset($_GET['db']))?$_GET['db']:null;
$tbl = (isset($_GET['tbl']))?$_GET['tbl']:null;

if ((null == $db) || (null == $tbl)) dieWith(-5);

dbExistsCheck($db,-4);
tableExistsCheck($db,$tbl,-3);

if (('mysql' == db) || ('information_schema' == db) || ('performance_schema' == db)) dieWith(-2,$db);

$dbh->exec("USE `{$db}`");
$sql = "DROP TABLE `{$tbl}`";
$code = $dbh->exec($sql);

if (false === $code)
{
	$err = $dbh->errorInfo();
	dieWith(-1,$err);
}

$err = $dbh->errorInfo();
$code = ('00000' == $err[0])?1:0;
$tables = tableList($count);
$data = array($tables,$err);
dieWith($code,$data);
?>
