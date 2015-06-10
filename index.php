<?php
require 'php/utils.php';
if (null === $dbh) $ver = 'Database access failed';else
{
	$ver = $dbh->query("SHOW VARIABLES LIKE 'version'")->fetch(PDO::FETCH_ASSOC);
	$ver = $ver['Value'];
}
?>

<!doctype HTML>
<html>
<!--
Copyright:jReply LLC, 2015. https://jresponse.net
Demo:http://jresponse.co/readmin
Comments & suggestions:contact@jreply.com
Licensed MIT:http://choosealicense.com/licenses/mit/
-->
<head>
<title>PDO Admin</title>
<link rel="shortcut icon" href='https://jresponse.r.worldssl.net/ide/nimages/dbicon.png'/>
<link rel="stylesheet" href="https://jresponse.r.worldssl.net/styles/darkness.css" />
<link rel='stylesheet' href='https://jresponse.r.worldssl.net/myadmin/midnight.css' />
<link rel='stylesheet' href='https://jresponse.r.worldssl.net/myadmin/codemirror.css' />
<link rel='stylesheet' href='dbadmin.css'/>
<script src='https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js'></script>
<script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.3/jquery-ui.min.js"></script>
<script src='https://jresponse.r.worldssl.net/myadmin/codemirror.js'></script>
<script src='https://jresponse.r.worldssl.net/myadmin/sql.js'></script>
<script>
var _version = <?php echo "'$ver';"; ?>
</script>
<script src='dbadmin.js'></script>
<!-- use dbadmin.php for debugging Javascript source in the jsource folder-->
</head>
<body>
<audio id='audError' style='display:none;' src='https://jresponse.r.worldssl.net/myadmin/error.mp3'></audio>
<audio id='audDone' style='display:none;' src='https://jresponse.r.worldssl.net/myadmin/done.mp3'></audio>
<div id='divError'>
<div id='spnError'></div>
</div>
<h1>Database Administrator</h1>
<div class='xlay'>
<span>Users</span>
<select id='selUsers'></select>
<div class='divBt'>
<img id='imgUserNew' src='https://jresponse.r.worldssl.net/ide/nimages/add_entry.png' title='New User'/>
<img id='imgUserDrop' src='https://jresponse.r.worldssl.net/ide/nimages/binit.png' title='Drop User'/>
</div>
</div>
<div class='xlay'>
<span>Databases</span>
<select id='selDBs'></select>
<div class='divBt'>
<img id='imgDBNew' src='https://jresponse.r.worldssl.net/ide/nimages/add_entry.png' title='New database'/>
<img id='imgDBDrop' src='https://jresponse.r.worldssl.net/ide/nimages/binit.png' title='Drop database'/>
</div>
</div>
<div class='xlay'>
<span>Tables</span>
<select id='selTables'>
<option value='-'>First select a database!</option>
</select>
<div class='divBt'>
<img id='imgTableNew' src='https://jresponse.r.worldssl.net/ide/nimages/add_entry.png' title='New table'/>
<img id='imgTableDrop' src='https://jresponse.r.worldssl.net/ide/nimages/binit.png' title='Drop table'/>
</div>
</div>
<div id='divTblStruc' class='divTables'>
<table id='tblStruc'>
<thead>
<tr><th>Field</th><th>Type</th><th>Options</th><th>Unsigned</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th><th>Collation</th><th>Length</th><th>Comment</th></tr>
</thead>
<tbody id='tbdyStruc'>
</tbody>
</table>
</div>
<div id='divTblUsers' class='divTables'>
<table id='tblUsers'>
</table>
</div>
<div class='divTools'>
<button id='btnReload' class='dabtn'>Reload</button>
<button id='btnRunSQL' class='dabtn'>Edit SQL</button>
<button id='btnViewContents' class='dabtn'>View Contents</button>
</div>
<div id='divInfo'></div>
<div id='diaMakeDB' class='divDia'>
<div class='lay'>
<span>Collation</span>
<select id='selDBCollation'></select>
</div>
<div class='lay'>
<span>Character Set</span>
<select id='selDBCharSets'></select>
</div>
<div class='lay'>
<span>Name</span>
<input class='dbm' id='inpDBName' maxlength='24' placeholder='Database name'/>
</div>
<div class='lay'>
<span>User</span>
<input class='dbm' id='inpDBUser' maxlength='24' placeholder='User name'/>
</div>
<div class='lay'>
<span>Password</span>
<input class='dbm' id='inpDBUserPwd' maxlength='24' placeholder='Password for database user'/>
</div>
</div>
<div id='diaMakeUser' class='divDia'>
<div class='lay'>
<span>Name</span>
<input id='inpUserName' maxlength='24'/>
</div>
<div class='lay'>
<span>Password</span>
<input id='inpUserPwd' maxlength='24'/>
</div>
<div class='lay'>
<span>Database</span>
<select id='selDBForUser'></select>
</div>
</div>
<div id='diaMakeTable' class='divDia'>
<div class='lay'>
<span>Table Name</span>
<input id='inpTableName' maxlength='24'/>
</div>
<div class='lay'>
<span>Engine</span>
<select id='selTableEngine'>
<option value='InnoDB' selected>InnoDB</option>
<option value='Aria'>Aria</option>
<option value='MyISAM'>MyISAM</option>
<option value='CSV'>CSV</option>
<option value='MEMORY'>MEMORY</option>
</select>
</div>
<div class='lay'>
<span>Collation</span>
<select id='selTableCollation'>
</select>
</div>
<div class='lay'>
<span>Recreate Table</span>
<div id='divTblRecreate'>
<input id='inpRecreate0' name='recreate' type='radio' checked/><label for='inpRecreate0'>No</label>
<input id='inpRecreate1' name='recreate' type='radio'/><label for='inpRecreate1'>Yes</label>
</div>
</div>
<div id='divTableFields'>
<table>
<thead>
<tr><th>Field</th><th>Type</th><th>Comment</th></tr>
</thead>
<tbody id='tbdyTableFields'>

</tbody>
</table>
</div>
<div class='divBtns'>
<div>
<button class='dabtn' id='btnAddField' title='Add field'>+</button>
<button class='dabtn' id='btnDropField' title = 'Drop field'>-</button>
<span class='spPad'>&nbsp;</span>
<button class='dabtn fupdn' id='btnFieldUD0' title='Move field up'>&darr;</button>
<button class='dabtn fupdn' id='btnFieldUD2' title='Move field down'>&uarr;</button>
</div>
<div>
<button id='btnShowSQL' class='dabtn'>Show SQL</button>
<button id='btnMakeTable' class='dabtn'>Make</button>
<button id='btnCloseMakeTableDia' class='dabtn'>Close</button>
</div>
</div>
</div>
<div id='diaFieldEdit' class='divDia'>
<div class='lay'>
<span>Name</span>
<input id='inpFieldName' maxlength='24'/>
</div>
<div class='lay'>
<span>Type</span>
<select id='selFieldType'>
<optgroup label='Numbers'>
<option value='tinyint' data-x='7'>tinyint</option>
<option value='smallint' data-x='7'>smallint</option>
<option value='mediumint' data-x='7'>mediumint</option>
<option value='int' data-x='7'>int</option>
<option value='bigint' data-x='7'>bigint</option>
<option value='decimal' data-x='3'>decimal</option>
<option value='float' data-x='7'>float</option>
<option value='double' data-x='7'>double</option>
</optgroup>
<optgroup label='Date & Time'>
<option value='date' data-x='1'>date</option>
<option value='datetime' data-x='9'>datetime</option>
<option value='timestamp' data-x='9'>timestamp</option>
<option value='time' data-x='1'>time</option>
<option value='year' data-x='1'>year</option>
</optgroup>
<optgroup label='Strings'>
<option value='char' data-x='81'>char</option>
<option value='varchar' data-x='97'>varchar</option>
e<option value='tinytext' data-x='64'>tinytext</option>
<option value='text' data-x='64'>text</option>
<option value='mediumtext' data-x='64'>mediumtext</option>
<option value='longtext' data-x='64'>longtext</option>
</optgroup>
<optgroup label='Lists'>
<option value='enum' data-x='193'>enum</option>
<option value='set' data-x='193'>set</option>
</optgroup>
<optgroup label='Binary'>
<option value='bit' data-x='257'>bit</option>
<option value='binary' data-x='17'>binary</option>
<option value='varbinary' data-x='33'>varbinary</option>
<option value='tinyblob' data-x='0'>tinyblob</option>
<option value='blob' data-x='0'>blob</option>
<option value='mediumblob' data-x='0'>mediumblob</option>
<option value='longblob' data-x='0'>longblob</option>
</optgroup>
<!--
0:no extra fields
1:unsigned (information_schema:columns:columntype)
2:auto increment (information_schema:columns:extra)
4:CURRENT_TIMESTAMP (info_schema:columns:extra)
8:length [0-255](info_schema:columns;character_max_length)
16:length [0-65535]
32:collation (info_schema:columns:collation_name)
64:enumeration/set info (info_scheme:columns:column_type)
128:bit (length:64)
-->
</select>
</div>
<div class='lay divXX' id='divXX2'>
<span>Unsigned</span>
<div id='divUnsigned' class='divRadio'>
<input id='inpUns0' name='unsigned' type='radio' checked/><label for='inpUns0'>No</label>
<input id='inpUns1' name='unsigned' type='radio'/><label for='inpUns1'>Yes</label>
</div>
</div>
<div class='lay divXX' id='divXX4'>
<span>Auto Increment</span>
<div id='divAI' class='divRadio'>
<input id='inpAI0' name='autoinc' type='radio' checked/><label for='inpAI0'>No</label>
<input id='inpAI1' name='autoinc' type='radio'/><label for='inpAI1'>Yes</label>
</div>
</div>
<div class='lay divXX' id='divXX8'>
<span>Auto-update Timestamp</span>
<div id='divCTS' class='divRadio'>
<input id='inpCTS0' name='cts' type='radio' checked/><label for='inpCTS0'>No</label>
<input id='inpCTS1' name='cts' type='radio'/><label for='inpCTS1'>Yes</label>
</div>
</div>
<div class='lay divXX' id='divXX16'>
<span>Max Length</span>
<input id='inpMLSmall' type='number' min='1' max='255' step='1' placeholder='[1-255]'/>
</div>
<div class='lay divXX' id='divXX32'>
<span>Max Length</span>
<input id='inpMLBig' type='number' min='1' max='655355' step='1' placeholder='[1-65535]'/>
</div>
<div class='lay divXX' id='divXX64'>
<span>Collation</span>
<select id='selFieldCollation'>

</select>
</div>
<div class='lay divXX' id='divXX128'>
<span>Members</span>
<textarea id='txaMembers' rows='4' columns='80' maxlength='1024' placeholder='Enter comma separated list - no quotes!'></textarea>
</div>
<div class='lay divXX' id='divXX256'>
<span>Max Length</span>
<input id='inpMLBit' type='number' min='1' max='64' step='1' placeholder='[1-64]'/>
</div>
<div class='lay'>
<span>Allow Null</span>
<div id='divAllowNull' class='divRadio'>
<input id='inpNull0' name='isnull' type='radio' checked/><label for='inpNull0'>No</label>
<input id='inpNull1' name='isnull' type='radio'/><label for='inpNull1'>Yes</label>
</div>
</div>
<div class='lay divXX' id='divXX1'>
<span>Default Value</span>
<input id='inpDefault' maxlength='255'/>
</div>
<div class='lay'>
<span>Comment</span>
<textarea id='txaComment' rows='4' columns='80' maxlength='255'></textarea>
</div>
</div>
<div id='diaSQL' class='divDia'>
<textarea id='txaSQL'></textarea>
<pre id='preResult'>
</pre>
</div>
<div id='diaRunResult' class='divDia'>
<div class='divResults'>
<table id='tblResults'>
<thead id='thdResults'></thead>
<tbody id='tbdyResults'></tbody>
</table>
</div>
<div id='divPgNav'>
<span>Show Page</span><input id='inpThisPg' min='1' max='1' step='1' type='number'/>
<button id='btnPgNav0' class='dabtn pgnav'>Previous</button>
<button id='btnPgNav2' class='dabtn pgnav'>Next</button>
</div>
</div>
<div id='diaTableData' class='divDia'>
<div class='divResults'>
<table id='tblTDResults'>
<thead id='thdTDResults'></thead>
<tbody id='tbdyTDResults'></tbody>
</table>
</div>
<div id='divPageNav'>
<div>
<span>Show Page </span><input id='inpThisPage' min='1' max='1' step='1' type='number'/>
</div>
<button id='btnPageNav0' class='dabtn pagenav'>Previous</button>
<button id='btnPageNav2' class='dabtn pagenav'>Next</button>
<button id='btnTDDrop' class='dabtn'>Drop</button>
<button id='btnTDHide' class='dabtn'>Hide Fields</button>
</div>
</div>
<div id='diaTDHide' class='divDia'>
<div id='divHideBoxes'>

</div>
</div>
<div id='diaRowEdit' class='divDia'>
<div id='divREInfo'>
		</div>
<div id='divRowFields'>

</div>
</div>
<div id='diaSetEnum' class='divDia'>
<div id='divSEChoices'>

</div>
</div>
<div id='divBank' class='divDia'>
<div class='lay' id='cfInput'>
<span></span>
<input/>
</div>
<div class='lay' id='cfChar'>
<span></span>
<div class='nlay'>
<input/>
<div>
<input id='inpCBX' type='checkbox'/><label for='inpCBX'>Null</label>
</div>
</div>
</div>
<div class='lay' id='cfFile'>
<span></span>
<div class='zlay'>
<div>
 <button class='choose'>Test</button>
 <input type='file'/>
</div>
<div>
<input id='inpCBX' type='checkbox'/><label for='inpCBX'>Null</label>
</div>
</div>
</div>
<div class='lay' id='cfText'>
<span></span>
<div class='nlay'>
<textarea rows='6'></textarea>
<div>
<input id='inpCBX' type='checkbox'/><label for='inpCBX'>Null</label>
</div>
</div>
</div>
</div>
</body>
</html>
