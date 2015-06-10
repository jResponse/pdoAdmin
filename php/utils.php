<?php
 function dieWith($code,$data = false)	
	{
		header('Content-type:text/plain');
		die(json_encode(array('code'=>$code,'data'=>$data)));	
	}
	
	function flatten($array)
{
 $return = array();
 array_walk_recursive($array,function($a) use (&$return) {$return[] = $a;});
 return $return;
}

function dbHandle()
{
 try
	{
  $dbh = new PDO("mysql:host=localhost;port=8971;dbname=mysql;charset=utf8",
		               "root",'Your DB Password',
																	array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION));
 }
	catch(PDOExcetion $e)
 {
 die(json_encode(array('delt'=>0,'dual'=>0,'code'=>-4000)));
 return null;
 }
 $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	return $dbh;
}
	
function dbExistsCheck($db,$code)
{
	global $dbh;
	$rows = $dbh->query('SHOW DATABASES')->fetchAll(PDO::FETCH_NUM);
 $rows = flatten($rows);
 if (!in_array($db,$rows)) dieWith($code);
	return true;
}

function goodPwd($pwd,$mln,$code)
{
	if (($mln > strlen($pwd)) || (0 == preg_match('/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/',$pwd))) dieWith($code);
	return true;
}


function tableExistsCheck($db,$tbl,$code)
{
	global $dbh;
	$dbh->exec("USE {$db};");
 $rows = $dbh->query("SHOW TABLES")->fetchAll(PDO::FETCH_NUM);
 $rows = flatten($rows);
 if (!in_array($tbl,$rows)) dieWith($code);
}

function isLegalName($nom,$mln,$code)
{
	if (($mln > strlen($nom)) || (0 == preg_match('/^[A-Za-z][A-Za-z0-9-]+$/',$nom))) dieWith($code);
	return true;
}

function dbList(&$count,$dbn = '-')
{
	global $dbh;
	$rows = $dbh->query('SHOW DATABASES')->fetchAll(PDO::FETCH_ASSOC);
	$count = count($rows);
 $data = "<option value='-' xx!sel>Select a database</option>";
	$selected = ' selected';
 foreach($rows as $row)
 {
	 $db = $row['Database'];
		if ($db == $dbn)
		{
			$data .= "<option value='{$db}'{$selected}>{$db}</option>";
			$selected = '';
		}	else $data .= "<option value='{$db}'>{$db}</option>";
 }
	$selected = (0 == strlen($selected))?'':' selected';
	return str_replace(' xx!sel',$selected,$data);
}

function userList(&$count,$usr = '-')
{
	global $dbh;
	$dbh->exec('USE `mysql`');
 $users = $dbh->query("SELECT User FROM `db` WHERE host = 'localhost'")->fetchAll(PDO::FETCH_NUM);
	$users = flatten($users);
 $count = count($users);
	
	$out = "<option value='-' xx!sel>Select a user</option>";
	$selected = ' selected';
	foreach($users as $user) 
	{
		if ($usr == $user)
		{
			$out .= "<option value='{$user}'{$selected}>{$user}</option>";
			$selected = '';
		} else $out .= "<option value='{$user}'>{$user}</option>";
	}	
	return str_replace(' xx!sel',$selected,$out);
}

function allCollations()
{
 global $dbh;
	$dbh->exec('USE `mysql`');
 $colls = $dbh->query('SHOW COLLATION')->fetchAll(PDO::FETCH_ASSOC);
 $out = "<option value='-' selected>Select</option>";	
	foreach($colls as $coll)
	{
		$cname = $coll['Collation'];
		$out .= "<option value='{$cname}'>{$cname}</option>";
	}	
	return $out;
}

function allCharSets()
{
 global $dbh;
	$dbh->exec('USE `mysql`');
 $csets = $dbh->query('SHOW CHARACTER SET')->fetchAll(PDO::FETCH_ASSOC);
 $out = "<option value='-' selected>Default</option>";	
	foreach($csets as $cset)
	{
		$cname = $cset['Charset'];
		$out .= "<option value='{$cname}'>{$cname}</option>";
	}	
	return $out;
}

function charsetExistsCheck(&$cst,$dcst,$code)
{
	global $dbh;
	if ('-' == $cst)
	{
		$cst = $dcst;
		return true;
	}
	
	$rv = false;
	$dbh->exec('USE `mysql`');
 $csets = $dbh->query('SHOW CHARACTER SET')->fetchAll(PDO::FETCH_ASSOC);
 foreach($csets as $cset)
	{
		$flag = ($cst == $cset['Charset']);
		$rv = $rv || $flag;
		if ($flag) break;
	}
	if ($rv) return true;
	dieWith($code);
}

function collationExistsCheck($rcoll,&$dcst,$code)
{
	global $dbh;
	if ('-' == $rcoll) 
	{	
	 $dcst = '-';
		return true;
	}	
	$dbh->exec('USE `mysql`');
	$rv = false;
	$colls = $dbh->query('SHOW COLLATION')->fetchAll(PDO::FETCH_ASSOC);
	foreach($colls as $coll) 
	{
		$flag = ($rcoll == $coll['Collation']);
		$rv = $rv || $flag;
		if ($flag)
		{
			$dcst = $coll['Charset'];
			break;
		}
	}
	if ($rv) return true;
	dieWith($code);
}

$dbh = dbHandle();
