<?php
function tableList(&$count)
{
	global $dbh;
	$rows = $dbh->query("SHOW TABLES")->fetchAll(PDO::FETCH_NUM);
 $rows = flatten($rows);
 $count = count($rows);

 $out = "<option value='-'>Select a table</option>";
 foreach($rows as $row) 
 {
	 $kount = $dbh->query("SELECT COUNT(*) FROM `{$row}`")->fetchColumn();
	 $out .= "<option value='$row'>$row ({$kount})</option>";
 }
 return $out;
}
