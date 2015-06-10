<?php
require 'utils.php';
if (null === $dbh) dieWith(-4);

$db = (isset($_GET['db']))?$_GET['db']:null;
if (null == $db) dieWith(-3);
dbExistsCheck($db,-2);

if (('mysql' == $db) || ('performance_schema' == $db) || ('information_schema' == $db)) dieWith(-1,$db);

$code = $dbh->exec("DROP DATABASE `$db`");
if (false === $code) dieWith(0);
dieWith(1,dbList($count));
?>
