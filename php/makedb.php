<?php
require 'utils.php';

function dbAlreadyExistsCheck($db,$code)
{
	global $dbh;
	$rows = $dbh->query('SHOW DATABASES')->fetchAll(PDO::FETCH_NUM);
 $rows = flatten($rows);
 if (in_array($db,$rows)) dieWith($code);
	return true;
}


if (null === $dbh) dieWith(-8);

$dbn = (isset($_GET['dbn']))?$_GET['dbn']:null;
$usr = (isset($_GET['usr']))?$_GET['usr']:null;
$pwd = (isset($_GET['pwd']))?$_GET['pwd']:null;
$coll = (isset($_GET['coll']))?$_GET['coll']:null;
$cset = (isset($_GET['cset']))?$_GET['cset']:null;

if ((null == $dbn) || (null == $usr) || (null == $pwd) || (null == $coll) || (null == $cset)) dieWith(-7);


collationExistsCheck($coll,$dcst,-6);
charsetExistsCheck($cset,$dcst,-5);
dbAlreadyExistsCheck($dbn,-4);


if (isLegalName($dbn,1,-3) && isLegalName($usr,3,-2) && goodPwd($pwd,6,-1))
{
 $cset = ('-' == $cset)?'':" CHARACTER SET {$cset}";
 $coll = ('-' == $coll)?'':" COLLATE {$coll}";

	$code = $dbh->exec("CREATE DATABASE `{$dbn}`{$cset}{$coll}");
	if (1 != $code) dieWith(0,$dbh->errorInfo());
	$code = $dbh->exec("CREATE USER '{$usr}'@'localhost' IDENTIFIED BY '{$pwd}';");
	if (false === $code) dieWith(0,$dbh->errorInfo());
	$code = $dbh->exec("GRANT ALL ON `{$dbn}`.* TO '{$usr}'@'localhost';");
	if (false === $code) dieWith(0,$dbh->errorInfo());
	
	$data[] = dbList($count,$dbn);
	$data[] = userList($count,'');
	dieWith(1,$data);
}

