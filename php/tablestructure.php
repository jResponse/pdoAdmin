<?php
require 'utils.php';

if (null === $dbh) dieWith(-4);
$tbl = (isset($_GET['tbl']))?$_GET['tbl']:null;
$db = (isset($_GET['db']))?$_GET['db']:null;
if ((null == $tbl) || (null == $db)) dieWith(-3);
	
dbExistsCheck($db,-2);	
tableExistsCheck($db,$tbl,-1);

$rows = $dbh->query("DESCRIBE `{$tbl}`")->fetchAll(PDO::FETCH_ASSOC);

$dbh->exec('USE `information_schema`');
$fields = 'COLUMN_COMMENT,COLUMN_DEFAULT,COLLATION_NAME,CHARACTER_MAXIMUM_LENGTH';

foreach($rows as $ndx=>$row)
{
	$fld = $row['Field']; 
 $sql = "SELECT $fields FROM `columns` WHERE TABLE_SCHEMA = '{$db}' AND TABLE_NAME = '{$tbl}' AND COLUMN_NAME='$fld'";
 $wor = $dbh->query($sql)->fetch(PDO::FETCH_ASSOC);
	$coll = $wor['COLLATION_NAME'];
	$cmx = $wor['CHARACTER_MAXIMUM_LENGTH'];
	$dft = $wor['COLUMN_DEFAULT'];
	$coll = (null == $coll)?'':$coll;
	$cmx = (null != $cmx)?$cmx:'';
	$dft = (null != $dft)?$dft:'';
	
	$rows[$ndx]['Comment'] = $wor['COLUMN_COMMENT'];
	$rows[$ndx]['Collation'] = $coll;
	$rows[$ndx]['CMax'] = $cmx;
	$rows[$ndx]['Default'] = $dft;
}

dieWith(1,$rows);
?>
