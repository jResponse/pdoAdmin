<?php
require 'utils.php';

if (null === $dbh) dieWith(-1);

$data = dbList($count);
dieWith($count,$data);
?>
