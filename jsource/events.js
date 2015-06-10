//------------------------------------Event Handlers-----------------------------------------
function userSelected()
{
	var usr = $('#selUsers option:selected').val();
	if ('-' == usr)
	{
		$('#tblUsers').html('');
		$('.divTables').css('display','none');
		return;
	}	
	$.get('php/userdata.php?usr=' + usr,afterFetchUserData).fail(function(){showError(msgs_.unUserData)});
}

function dbSelected()
{
	var db = $('#selDBs option:selected').val();
 if ('-' == db) clearDBData();else
	{
		var url = 'php/tablelist.php?db=' + db;
		$.get(url,afterFetchTables).fail(function(){showError(msgs_.unTableList)});
	} 
}

function tableSelected()
{
	var db = $('#selDBs option:selected').val(),
     tbl = $('#selTables option:selected').val();
	if ('-' == db) clearDBData();else
	{
	 if ('-' == tbl) clearTableData();else
	 {
		 var url = 'php/tablestructure.php?tbl=' + tbl + '&db=' + db;
		 $.get(url,afterFetchTableStructure).fail(function(){showError(msgs_.unTblStruc)});
	 }
	}	
}

function makeNewUser()
{
	var btns = {Make:doMakeUser,Cancel:closeMakeUserDialog};
	$('#diaMakeUser').dialog({title:msgs_.newUser,
	                           fluid:true,modal:true,resizable:false,
																												minWidth:500,minHeight:325,
	                          open:userDiaOpen,buttons:btns});
}

function makeNewDB()
{
	var btns = {Make:doMakeDB,Cancel:closeMakeDBDialog};
 $('#diaMakeDB').dialog({title:msgs_.newDB,
	                         fluid:true,modal:true,resizable:false,
																										minWidth:500,minHeight:325,
	                          open:dbDiaOpen,buttons:btns})	
}

function dropUser()
{
	var usr = $('#selUsers option:selected').val();
	if ('-' == usr)
	{
		showError(msgs_.userFirst);
		return;
	}	
	
	if (('root' == usr) || ('debian-sys-maint' == usr))
	{
		showError(msgs_.userNoDrop.format({uu:usr}));
		return;
	}	

 if (confirm(msgs_.sure.format({xx:usr})))
	{	
		$.get('php/dropuser.php?usr=' + usr,afterDropUser).fail(function(){showError(msgs_.unDropUser.format({uu:usr}))});
	}	
}

function dropDB()
{
	var db = $('#selDBs option:selected').val();
	if ('-' == db)
	{
		showError(msgs_.dbFirst);
		return;
	}
	
	if ((db == 'information_schema') || (db == 'mysql') || (db == 'performance_schema'))
	{
		var msg = msgs_.noDropDB;
		showError(msg.format({bd:db}));
		return;
	}
 
	if (confirm(msgs_.sure.format({xx:db})))
	{	
	 var msg = msgs_.unDropDB;
		$.get('php/dropdb.php?db=' + db,afterDropDB).fail(function(){showError(msg.format({bd:db}))});
	}	
}

function makeNewTable()
{
	var db = $('#selDBs option:selected').val();
	if ('-' == db)
	{
		showError(msgs_.firstSelectDB);
		return;
	}
	
	if (('mysql' == db) || ('information_schema' == db) || ('performance_schema' == db))
	{
	 showError(msgs_.noNewTablesHere.format({bd:db}));
  return;		
	}
	
	$('#diaMakeTable').dialog({title:msgs_.makeTable,
	                           fluid:true,modal:true,resizable:false,
																												minWidth:725,minHeight:325,
																												create:prepareTableDia,beforeClose:discardTableData,
																												open:setupTableDia}).data('fields',[]);
}

function dropTable()
{
	var db = $('#selDBs option:selected').val(),
	    tbl = $('#selTables option:selected').val();

	if (('mysql' == db) || ('information_schema' == db) || ('performance_schema' == db))
	{
	 showError(msgs_.noDropDBTable.format({bd:db}));
  return;		
	}
	
 if ('-' == tbl)
 {
		showError(msgs_.tableFirst);
		return;
	}		
	
	if (confirm(msgs_.sure.format({xx:tbl})))
	{
 	var url = 'php/droptable.php?db={bd}&tbl={lbt}'.format({bd:db,lbt:tbl});
	 $.get(url,afterDropTable).error(function(){showError(msgs_.unDropTable.format({lbt:tbl}));});
	}	
}
