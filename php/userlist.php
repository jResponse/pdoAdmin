<?php
require 'utils.php';
if (null === $dbh) dieWith(-1);

$users = userList($count);
trigger_error(json_encode($users));
dieWith($count,$users);
?>
