<?php
require 'utils.php';
require '_tablelist.php';

$db = (isset($_GET['db']))?$_GET['db']:null;
if (null == $db) dieWith(-3);
if (null === $dbh) dieWith(-2);

dbExistsCheck($db,-1);

$dbh->exec("USE {$db};");
$out = tableList($count);

$dbh->exec('USE `information_schema`');
$cset = $dbh->query("SELECT DEFAULT_CHARACTER_SET_NAME FROM `schemata` WHERE SCHEMA_NAME = '{$db}'")->fetchColumn();
dieWith($count,array('tables'=>$out,'cset'=>$cset));
?>
