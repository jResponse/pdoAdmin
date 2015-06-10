<?php
function echoIt($file)
{
 echo file_get_contents("jsource/{$file}");
	echo "\n";
}

header('Content-type:text/javascript');

echoIt('core.js');
echoIt('utils.js');
echoIt('events.js');
echoIt('afters.js');
echoIt('closers.js');
echoIt('users.js');
echoIt('db.js');
echoIt('table.js');
echoIt('field.js');
echoIt('sql.js');
echoIt('builder.js');
echoIt('select.js');
echoIt('stupidtable.js');
echoIt('hide.js');
echoIt('rowedit.js');
echoIt('bigint.js');
echoIt('filters.js');
echoIt('setenum.js');
echoIt('timepicker.js');
echoIt('msgs_en.js');
?>
