//----------------------------Table Dialog---------------------------

function discardTableData(){$('#diaMakeTable').removeData();}


function prepareTableDia()
{
	$('#btnAddField').on('click',doAddField);
	$('#btnDropField').on('click',doDropField);
	$('#btnMakeTable').on('click',doMakeTable);
	$('#btnShowSQL').on('click',doShowSQL);
	$('#btnCloseMakeTableDia').on('click',closeMakeTableDialog);
	$('.fupdn').on('click',reorderFields);
	$('#divTblRecreate').buttonset();
}

function setupTableDia()
{
	
	$('#selTableCollation').val('-');
	$('#inpTableName').val('');
	$('#tbdyTableFields').html('');
	_selRow = -1;
	fluidDialog();
	showError(msgs_.howToSelect,true);
}

function reorderFields(e)
{
	if (-1 === _selRow)
 {
	 showError(msgs_.noRowSelected)	;
		return;
	}
	
	var fields = $('#diaMakeTable').data('fields'),
	    newPos = _selRow + 1 - parseInt($(e.delegateTarget).attr('id').reverse());
					
	if ((0 > newPos) || (fields.count <= newPos)) return;
					
	fields.swap(_selRow,newPos);
	_selRow = newPos;
 refillTableFields();
}

function uniqueTableName(tname)
{
	var ct = currentTables();
	if (-1 < ct.indexOf(tname))
	{
		showError(msgs_.needUniqueTableName);
		return false;
	}
	return true;
}

function haveFields(fields)
{
	if (0 === fields.length)
	{
		showError(msgs_.noFields);
		return false;
	} else return true;
}

function createTableTail()
{
	var coll = $('#selTableCollation option:selected').val(),
	    ngn = $('#selTableEngine option:selected').val(),
					tail = ('-' == ngn)?') ':"\n) ENGINE='{eng}'".format({eng:ngn}),
					endBit =('-' == coll)?'':" COLLATE '{co}'".format({co:coll});
				
	return tail + endBit;
}

function _createTableSQL()
{
 var i,f,fields = $('#diaMakeTable').data('fields'),
	    tname = $('#inpTableName').val(),
					rcr = (1 === parseInt($('input[name=recreate]:checked').attr('id').reverse())),
					head = (rcr)?'DROP TABLE IF EXISTS `{nt}`; ':'';
		
 head += 'CREATE TABLE';		
 if (haveFields(fields) && nameCheck(tname,'table',1) && (rcr || uniqueTableName(tname)))
 {
	 var sql = "{hd} `{tn}` (\n".format({hd:head,tn:tname,nt:tname}),
		    tail = createTableTail();
		for(i=0;i < fields.length;i++)
		{
			f = fields[i];
			sql += fieldSQL(f,(0 === i));
		}	
		sql += createTableTail();
		sql = sql.replaceAll('  ',' ');
		sql = sql.replaceAll(' )',')');	
		return sql;
 } else return '';
}

function doShowSQL()
{
	var sql = _createTableSQL();
	if (0 < sql.length) _doEditSQL(sql);
}

function doMakeTable()
{
	var sql = _createTableSQL(),
	    db = $('#selDBs option:selected').val();
	if (0 === sql.length) return;
		   

	var data = JSON.stringify([db,sql]);
	$.post('php/maketable.php',data,afterMakeTable).error(function(){showError(msgs_.unMakeTable);});
}

function afterMakeTable(data)
{
	try
	{
		data = JSON.parse(data);
		switch(data.code)
		{
			case -7:showError(msgs_.dbsDown);break;
			case -6:showError(msgs_.noData);break;
			case -5:showError(msgs_.invPostData);break;
			case -4:showError(msgs_.noSuchDB);break;
			case -3:showError(msgs_.dbSelect);break;
			case -2:showPDOError(data.data);break;
			case -1:showError(msgs_.pdoX.format({xx:data.data}));break;
   case 0:showPDOEror(data.data);break;
   case 1:displayRunResult(data.data[0]);
			       fluidDialog();
			       break;									
		}
	} catch(err){showError(err);}
}
