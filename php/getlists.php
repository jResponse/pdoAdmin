<?php
require 'utils.php';
if (null === $dbh) dieWith(-1);

$data['users'] = userList($uCount);
$data['dbs'] = dbList($dbCount);
$data['collations'] = allCollations();
$data['charsets'] = allCharSets();
$data['counts'] = array($uCount,$dbCount);
dieWith(1,$data);
?>
