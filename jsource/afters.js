//---------------------------------After server interaction------------------------------
function afterDropUser(data)
{
	try
	{
		data = JSON.parse(data);
		switch(parseInt(data.code))
		{
			case -4:showError(msgs_.dbsDown);break; 
			case -3:showError(msgs_.badQueryURL);break; 
			case -2:showError(msgs_.invUser);break;
			case -1:showError(msgs_.noSuchUser);break;
			case 0:showError(msgs_.opFailed);break;
			case 1:$('#selUsers').html(data.data);
			       $('#tblUsers').html(''); 
			       $('#divTblUsers').css('display','none'); 
										break;
		}
	} catch(err){showError(err);}	
}


function afterDropDB(data)
{
	try
	{
		data = JSON.parse(data);
		switch(parseInt(data.code))
		{
			case -4:showError(msgs_.dbsDown);break; 
			case -3:showError(msgs_.badQueryURL);break; 
			case -2:showError(msgs_.dbUnk);break;
			case -1:showError(msgs_.noDropDB.format({bd:data.data}));break;
			case 0:showError(msgs_.opFailed);break;
			case 1:$('#selDBs').html(data.data);
 		       $('#selDBForUser').html(data.data); 
			       clearDBData(); 
										break;
		}
	} catch(err){showError(err);}	
}

function afterMakeUser(data)
{
	try
	{
		data = JSON.parse(data);
		switch(parseInt(data.code))
		{
			case -5:showError(msgs_.dbsDown);break;
			case -4:showError(msgs_.badQueryURL);break; 
			case -3:showError(msgs_.badName.format({nn:'user'}));break; 
			case -2:showError(msgs_.noSuchDB);break;
			case -1:showError(msgs_.pwdFmt);break;
			case 0:showError(msgs_.opFailed);break;
			case 1:$('#selUsers').html(data.data);
			       closeMakeUserDialog();
          showError(msgs_.userAdded,true); 										
			       break;
		}
	} catch(err){showError(err);}	
}

function afterMakeDB(data)
{
	try
	{
		data = JSON.parse(data);
		switch(parseInt(data.code))
		{
			case -8:showError(msgs_.dbsDown);break; 
			case -7:showError(msgs_.badQueryURL);break; 
			case -6:showError(msgs_.noSuchCharSet);break;
			case -5:showError(msgs_.noSuchCollation);break;
			case -4:showError(msgs_.dbExists);break;
			case -3:showError(msgs_.badName.format({nn:'database'}));break;
			case -2:showError(msgs_.badName.format({nn:'user'}));break;
			case -1:showError(msgs_.pwdFmt);break;
			case 0:showError(msgs_.opFailed);break;
			case 1:$('#selDBs').html(data.data[0]);
			       $('#selDBForUser').html(data.data[0]);
										$('#selUsers').html(data.data[1]);
										hideAllDetails();
										dbSelected();
										closeMakeDBDialog();
			       break;
		}
	} catch(err){showError(err);}	
}

function afterFetchTableStructure(data)
{
	try
	{
		data = JSON.parse(data);
		switch(parseInt(data.code))
		{
			case -4:showError(msgs_.dbsDown);break; 
			case -3:showError(msgs_.badQueryURL);break; 
			case -2:showError(msgs_.noSuchDB);break;
			case -1:showError(msgs_.noSuchTable);break;
			case 1:displayTableStructure(data.data);break;
		}
	} catch(err){showError(err);}	
}

function afterFetchUserData(data)
{
 try
	{
		data = JSON.parse(data);
		switch(parseInt(data.code))
		{
			case -3:showError(msgs_.dbsDown);break; 
			case -2:showError(msgs_.badQueryURL);break; 
			case -1:showError(msgs_.badName.format({nn:'user'}));break;
			case 0:showError(msgs_.noSuchUser);break;
			case 1:displayUserData(data.data);break;
		}
	} catch(err){showError(err);}	
}

function afterFetchTables(data)
{
	try
	{
		data = JSON.parse(data);
		switch(parseInt(data.code))
		{
			case -3:showError(msgs_.badQueryURL);break; 
			case -2:showError(msgs_.dbsDown);break; 
			case -1:showError(msgs_.noSuchDB);break;
			case 0:$('#selTables').html("<option value='-'>{tt}</option>".format({tt:msgs_.noTables}));
			       showError(msgs_.noTables + ' Default charset ' + data.data.cset,true);
										break;
			default:showError(data.code + ' tables found. Default charset ' + data.data.cset,true);
			         $('#selTables').html(data.data.tables);
		}
	} catch(err){showError(err);}	
}

function afterFetchLists(data)
{
	try
	{
		data = JSON.parse(data);
		switch(parseInt(data.code))
		{
			case -1:showError(msgs_.dbsDown);break;
			default:$('#selUsers').html(data.data.users);
			         $('#selDBs').html(data.data.dbs);
												$('#selDBForUser').html(data.data.dbs);
												$('#selTableCollation').html(data.data.collations);
												$('#selFieldCollation').html(data.data.collations);
												$('#selDBCollation').html(data.data.collations);
												$('#selDBCharSets').html(data.data.charsets);
		}
	} catch(err){showError(err);}
}

function afterDropTable(data)
{
	try
	{
		data = JSON.parse(data);
		switch(parseInt(data.code))
		{
			case -6:showError(msgs_.dbsDown);break; 
			case -5:showError(msgs_.badQueryURL);break; 
			case -4:showError(msgs_.noSuchDB);break;
			case -3:showError(msgs_.noSuchTbl);break;
			case -2:showError(msgs_.noDropDBTable.format({bd:data.data}));break;
			case -1:showPDOError(data.data);break;
			case 0:showPDOError(data.data[1]);break;
			case 1:$('#selTables').html(data.data[0]);
			       clearTableData();
										break;
 	}
	} catch(err){showError(err);}	
}
