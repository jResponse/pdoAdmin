<?php
require 'utils.php';

function starPart($fields)
{
	$out = '';
	foreach($fields as $field=>$typ)
	{
		$typ = (false !== strpos($typ,'blob'))?'blob':$typ;
		$typ = (false !== strpos($typ,'text'))?'text':$typ;
		
		switch($typ)
		{
			case 'bit':$out .= ",BIN(`{$field}` + 0) as `{$field}`";break;
			case 'binary':
			case 'varbinary':$out .= ",HEX(`{$field}`) as `{$field}`";break;
			case 'blob':$out .= ",OCTET_LENGTH({$field}) as `{$field}`";break;
			case 'text':$out .= ",SUBSTRING(`{$field}`,1,255) as `{$field}`";break;
			default:$out .= ",`{$field}`";
		}
	}
	return (0 === strlen($out))?'*':substr($out,1);
}

if (null === $dbh) dieWith(-6);
$data = file_get_contents('php://input');
if (false === $data) dieWith(-5);

$data = json_decode($data,true);
if (null === $data) dieWith(-4);

$db = (isset($data['db']))?$data['db']:null;
$tbl = (isset($data['tbl']))?$data['tbl']:null;
$off = (isset($data['off']))?$data['off']:0;
$cnt = (isset($data['cnt']))?$data['cnt']:'50';
$fsi = (isset($data['fsi']))?$data['fsi']:[];

$off = intval($off);
$cnt = intval($cnt);
$cnt = (0 == $cnt)?50:$cnt;

if ((null === $db) || (null == $tbl)) dieWith(-5);
dbExistsCheck($db,-4);
tableExistsCheck($db,$tbl,-3);

$count = $dbh->query("SELECT COUNT(*) FROM `{$tbl}`")->fetchColumn();
$count = intval($count);
if ($off > $count) dieWith(-2);
if (0 == $count	) dieWith(-1);

$starPart = starPart($fsi);
$sql = "SELECT {$starPart} FROM `{$tbl}` LIMIT {$cnt} OFFSET {$off}";
$rows = $dbh->query($sql)->fetchAll(PDO::FETCH_ASSOC);
//trigger_error(json_encode($rows));
$err = $dbh->errorInfo();
$code = ('00000' == $err[0])?1:0;

if (0 === $code) dieWith($code,$err);

$data = array($rows,array('off'=>$off,'total'=>$count));
dieWith($code,$data);
?>
