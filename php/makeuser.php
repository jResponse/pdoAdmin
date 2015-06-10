<?php
require 'utils.php';
if (null === $dbh) dieWith(-5);

$usr = (isset($_GET['usr']))?$_GET['usr']:null;
$pwd = (isset($_GET['pwd']))?$_GET['pwd']:null;
$dbn = (isset($_GET['dbn']))?$_GET['dbn']:null;

if ((null == $usr) || (null == $pwd) || (null == $dbn)) dieWith(-4);

if (isLegalName($usr,3,-3) && dbExistsCheck($dbn,-2) && goodPwd($pwd,6,-1))
{
 	$code = $dbh->exec("CREATE USER '{$usr}'@'localhost' IDENTIFIED BY '{$pwd}';");
	if (false === $code) dieWith(0,$dbh->errorInfo());
	$code = $dbh->exec("GRANT ALL ON `{$dbn}`.* TO '{$usr}'@'localhost';");
	if (false === $code) dieWith(0,$dbh->errorInfo());
	
	dieWith(1,userList($count,''));
}
?>
