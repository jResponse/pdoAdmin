<?php
require 'utils.php';
if (null === $dbh) dieWith(-4);
$usr = (isset($_GET['usr']))?$_GET['usr']:null;
if (null === $usr) dieWith(-3);
isLegalName($usr,1,-2);

$dbh->exec('USE `mysql`');
$count = $dbh->query("SELECT COUNT(*) FROM `user` WHERE User = '{$usr}' AND Host = 'localhost'")->fetchColumn();
if (0 == $count) dieWith(-1);

$code = $dbh->exec("DROP USER '{$usr}'@'localhost'");
if (false === $code) dieWith(0);
dieWith(1,userList($count));
?>
