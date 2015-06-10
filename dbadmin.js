/***************************************************
Copyright:jReply LLC, 2015. https://jresponse.net
Demo:http://jresponse.co/myadmin
Comments & suggestions:contact@jreply.com
Licensed MIT:http://choosealicense.com/licenses/mit/

Timepicker code by Trent Richardson [http://trentrichardson.com]
Bigint ode by 	http://silentmatt.com/biginteger/
****************************************************/

var _sql = null,crDefault_ = null,_timer = null,_hides = [],
    _rows = null,_page = 0,_selRow = -1,_selCount = 50,_reMsg = '',_reMsgFlags = 0;

function treatKP(e){if ((13 == e.which) && (null != crDefault_)) crDefault_();}

function discardCRDefault(){crDefault_ = null;}

$(document).ready(function()
{
	$(document).keyup(function(e){treatKP(e);});
	$('#selUsers').on('change',userSelected);
	$('#selDBs').on('change',dbSelected);
	$('#selTables').on('change',tableSelected);
	$('#imgUserNew').on('click',makeNewUser);
	$('#imgUserDrop').on('click',dropUser);
	$('#imgDBNew').on('click',makeNewDB);
	$('#imgDBDrop').on('click',dropDB);
 $('#imgTableNew').on('click',makeNewTable);
	$('#imgTableDrop').on('click',dropTable);
	$('#btnReload').on('click',doReload);
	$('#btnRunSQL').on('click',doEditSQL);
	$('#btnViewContents').on('click',doSelect);
	$('.dabtn').button();
	fetchLists();
	showVersion();
});

function displayTableStructure(fields)
{
	$('.divTables').css('display','none');
	$('#divTblStruc').css('display','block');
	var lmth = '',f,ak,kf = {k:false,v:null},
	    fsInf = {},xfp,pyt,  
	    tpl = '<tr><td>{fld}</td><td>{typ}</td><td>{oo}</td><td>{uu}</td><td>{nul}</td><td>{ky}</td><td>{dd}</td><td>{xtra}</td><td>{co}</td><td>{cm}</td><td>{cmt}</td></tr>'; 
	for(var i=0;i < fields.length;i++)
	{
		f = fields[i];
		analyzeType(f);
		lmth += tpl.format({fld:f.Field,typ:f.Type,oo:f.CType,uu:f.Unsigned,nul:f.Null,ky:f.Key,dd:f.Default,xtra:f.Extra,co:f.Collation,cm:f.CMax,cmt:f.Comment});
		ak = ('UNI' == f.Key) || ('PRI' == f.Key);
		if (ak) kf = {k:f.Field,v:null};
		pyt = f.Type.toLowerCase();
		switch(pyt)
		{
			case 'bit':xfp = 'b';break;
			case 'binary':
			case 'varbinary':xfp = 'x';break;
			default:xfp = '-';
		}
		fsInf[f.Field] = {typ:pyt,pfx:xfp,ctyp:f.CType,cmax:f.CMax,unsn:f.IsUnsn,isnull:f.IsNull,dft:f.Default,aky:ak};
	}
	$('#tbdyStruc').html(lmth);
	$('#divRowFields').data('fsinf',fsInf).data('kf',kf);
}


function displayUserData(data)
{
	$('.divTables').css('display','none');
	$('#divTblUsers').css('display','block');
	var lmth = '',keys = data[0],vals = data[1],
	     tpl = "<tr><td class='tfc'>{ky}</td><td>{vl}</td></tr>";
	for (var i =0;i < keys.length;i++)
	{
		lmth += tpl.format({ky:keys[i],vl:vals[i]});
	}	
	$('#tblUsers').html(lmth);
}

function fetchLists()
{
	$.get('php/getlists.php',afterFetchLists).fail(function(){showError(msgs_.unLists)});
}

function doReload(){window.location.reload();}


//-----------------------------------Utility functions & Prototype extensions-------------------------
Array.prototype.isArray = true;

Array.prototype.swap = function (x,y) 
{
 var b = this[x];
 this[x] = this[y];
 this[y] = b;
 return this;
}
	
Boolean.prototype.intval = function(places)
{
 places = ('undefined' == typeof(places))?0:places; 
 return (~~this) << places;
}

String.prototype.format = function (args)
{
 var newStr = this,key;
	for (key in args) {newStr = newStr.replace('{' + key + '}', args[key]);}
 return newStr;
}


String.prototype.reverse=function(){return this.split("").reverse().join("");};

String.prototype.isLegalName = function()
{
  var regExp = /^[A-Za-z][-A-Za-z0-9_]+$/;
  return (this.match(regExp));
}

String.prototype.replaceAll = function(str1, str2, ignore)
{return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);};


function escapedValue(v){return $('<div/>').text(v).html();}

function showType(){return parseInt($('input[name="ktype"]').filter(':checked').val());}

function showVersion(){$('#divInfo').show().html(_version);}

function showError(err,sound)
{
	if (null !== _timer) clearTimeout(_timer);
	$('#spnError').html(err);
	$('#divError').css('display','block').slideDown('slow');
	sound = (sound)?'#audDone':'#audError';
	var snd = $(sound).get(0);
 if (4 == snd.readyState)
 {
  snd.currentTime = 0;
  snd.play();
 }
 _timer = setTimeout(hideError,10000);
}

function hideError()
{
	_timer = null;
	$('#divError').slideUp('slow').css('display','none');
}

function noStringCheck(str,msg)
{if ((undefined == str) || (0 == str.length)) throw(msg);}

function nameCheck(nom,nfor,mln)
{
	if (!nom.isLegalName() || (mln > nom.length))
	{
		alert(msgs_.nameTpl.format({nf:nfor,ln:mln})); 
		return false;
	} else return true;
}

function pwdCheck(pwd)
{
 var re = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/,
     rslt = re.test(pwd);
	if (!rslt) alert(msgs_.pwdFmt);
	return rslt;
}

function hideAllDetails()
{
	$('.divTables').css('display','none');
	$('#tblUsers').html('');
	$('#tbdyStruc').html('');
}

function fluidDialog()
{
	var $visible = $(".ui-dialog:visible");
	$visible.each(function()
	{
		var $this = $(this);
		var dialog = $this.find(".ui-dialog-content").data("ui-dialog");
		if (dialog.options.fluid)
		{
   var wWidth = $(window).width();
   if (wWidth < dialog.options.maxWidth + 50)
   {this.css("max-width", "90%");} else 
   {$this.css("max-width", dialog.options.maxWidth);}
			
			if (dialog.options.hasOwnProperty('minWidth')) 
			$this.css("min-width", dialog.options.minWidth + 'px');
   
			if (dialog.options.hasOwnProperty('minHeight')) 
			$this.css("min-height", dialog.options.minHeight + 'px');
   
			if (dialog.options.hasOwnProperty('maxHeight')) 
			$this.css("max-height", dialog.options.maxHeight + 'px');

			dialog.option("position", dialog.options.position);
  }
 });
}

function clearDBData()
{
	$('#selTables').html("<option value='-'>{fdb}</option>".format({fdb:msgs_.firstSelectDB}));
	hideAllDetails();
}

function clearTableData()
{
	$('.divTables').css('display','none');
	$('#tbdyStruc').html('');
}

function analyzeType(f)
{
	var typ = f.Type,
	    i = typ.indexOf('('),
	    unsn = (-1 < typ.indexOf('unsigned'));
	f.CType = '';		
 f.AI = ('auto_increment' == f.Extra.toLowerCase());
	f.IsUnsn = unsn;

	if (unsn) 
	{
	  typ = typ.replace(' unsigned','');
		}		

		f.IsNull = ('YES' == f.Null);	
	if (i >= 0)
 {
		typ = typ.substr(0,i);
		unsn = unsn && ((-1 < typ.indexOf('int')) || ('float' == typ) ||  ('double' == typ));
		var rest = f.Type.substr(i + 1,999);
		i = rest.indexOf(')');
		rest = rest.substr(0,i);
		f.Collation = (0 == f.Collation.length)?'-':f.Collation;
		if (('set' == typ) || ('enum' == typ)) f.CType = rest;
		if ('bit' == typ) f.CMax = rest;
	}		
	f.Type = typ;
	f.CTS = (-1 < f.Extra.indexOf('_CURRENT'));
	f.Unsigned = (unsn)?'Y':'';
}

function fieldNameNotUnique(skip,fn)
{
	var fields = $('#diaMakeTable').data('fields');
	for(var i=0;i < fields.length;i++)
	{
		if (i == skip) continue;
		if (fields[i].Field  == fn)
		{
			showError(msgs_.fieldNameInUse.format({nf:fn}));
			return true;
		}	
	}
	return false;
}

function dataTypes(row)
{
	var v,out = [];
	for(prop in row)	out.push(typeThis(row[prop]));
	return out;
}

function dataTypesAssoc(row)
{
	var v,out = {};
	for(prop in row)	out[prop] = typeThis(row[prop]);
	return out;
}

function typeThis(v)
{
	if (v == parseInt(v)) return 'int';
	if (v == parseFloat(v)) return 'float';
	return 'string';
}

function currentTables()
{
	var opts = $('#selTables option'),out = '';
	for(var i=0;i < opts.length;i++) out += ',{tn}'.format({tn:$(opts[i]).val()});
	return (0 <out.length)?out.substr(1):out;
}

function quoteEscaped(txt){return txt.replaceAll("'","\'");}

function showPDOError(ei){showError(msgs_.dbErr.format({ansi:ei[0],txt:ei[2]}));}

function tableHeader(keys,typs)
{
	var key,out = '<tr>';
	for(var i=0;i < keys.length;i++)
	{
		key = keys[i];
		if (-1 < _hides.indexOf(key)) continue;
		key = key.replace('(*)','',key);
		out += "<th data-sort='{ds}'>{ky}</th>".format({ds:typs[i],ky:key});
	}
	return out + '</tr>';
}

function tableBody(rows)
{
	var out = '';
	for(var i=0;i < rows.length;i++)
	{
		row = rows[i];
		out += "<tr id='tbr{ii}'>".format({ii:i});
		for(prop in row) 
		{	
		 if (-1 < _hides.indexOf(prop)) continue;
			out += '<td>{rv}</td>'.format({rv:row[prop]});
		}	
		out += '</tr>';
	}
	return out;
}

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
//---------------------------Dialog Closers & Before Closers--------------------------
function closeMakeTableDialog(){$('#diaMakeTable').dialog('close');}

function closeFieldEditor(){$('#diaFieldEdit').dialog('close');}

function closeMakeUserDialog(){$('#diaMakeUser').dialog('close');}

function closeMakeDBDialog(){$('#diaMakeDB').dialog('close');}

function closeSQLEditor(){$('#diaSQL').dialog('close');}

function closeRowEditor(){$('#diaRowEdit').dialog('close');}
//-------------------------Users Dialog-----------------------
function userDiaOpen()
{
	$('#inpUserName').val('');
	$('#inpUserPwd').val('');
	$('#selDBForUser').val('-');
}


function doMakeUser()
{
	var usr = $('#inpUserName').val(),
	    pwd = $('#inpUserPwd').val(),
					dbn = $('#selDBForUser option:selected').val();
					
	if ('-' == dbn)
	{
		alert(msgs_.dbForUser);
		return;
	}
					
 if (nameCheck(usr,'user',3) && pwdCheck(pwd))
	{
		pwd = encodeURIComponent(pwd);
		var url = 'php/makeuser.php?usr={uu}&pwd={pp}&dbn={dd}'.format({uu:usr,pp:pwd,dd:dbn});	
		$.get(url,afterMakeUser).
	fail(function(){showError(msgs.unMakeUser.format({uu:usr}))});
	}
}


//------------------------------------DB Dialog-------------------------------
function doMakeDB()
{
 var dbn = $('#inpDBName').val(),
     usr = $('#inpDBUser').val(),
     pwd = $('#inpDBUserPwd').val(),
					coll = $('#selDBCollation option:selected').val(),
					cset = $('#selDBCharSets option:selected').val();
					
 if (nameCheck(dbn,'database',1) && nameCheck(usr,'user',3) && pwdCheck(pwd))
 {
		var url = 'php/makedb.php?dbn={ndb}&usr={rus}&pwd={dwp}&coll={lloc}&cset={cst}';
	url = url.format({ndb:dbn,rus:usr,lloc:coll,cst:cset,dwp:encodeURIComponent(pwd)});
	$.get(url,afterMakeDB).fail(function(){showError(msgs_.dbUnCreate)});
	}		
}

function dbDiaOpen()
{
	fluidDialog();
	$('.dbm').val('');
}


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

//--------------------------Fields & Field Details Dialog-----------------------
function doAddField()
{
	function fieldExists(fn)
	{
		for(var j=0;j < fields.length;j++) if (fn == fields[j].Field) return true;	
	 return false;
	}
	
	var fields = $('#diaMakeTable').data('fields'),i = 0,fld = 'Field0';
 while (fieldExists(fld)) fld = 'Field' + ++i;

	var flj = {AI:false,Comment:'',CMax:0,
	           Collation:'-',CType:'',CTS:false, 
	           Default:'',Extra:'',Field:fld,Null:'NO',IsNull:false,
	            Key:'',Type:'int', Unsigned:'',IsUnsn:false};

	fields.push(flj);
	_selRow = -1;
	refillTableFields();
}

function doDropField()
{
	if (-1 === _selRow)
	{
		showError(msgs_.noRowSelected);
		return;
	}
	
	if (confirm(msgs_.sure.format({xx:'this field'})))
	{
		fields = $('#diaMakeTable').data('fields');
  fields.splice(_selRow,1);
  _selRow = -1;
  refillTableFields();		
	}
}

function refillTableFields()
{
 var tp,fields = $('#diaMakeTable').data('fields'),lmth = '',field,
	    tpl = "<tr id='trmt{ii}'><td>{nn}</td><td>{tt}</td><td>{cc}</td></tr>",
					tpls = "<tr id='trmt{ii}' class='trselected'><td>{nn}</td><td>{tt}</td><td>{cc}</td></tr>";
	for(var i = 0;i < fields.length;i++)
	{
		field = fields[i];
		tp = (i === _selRow)?tpls:tpl;
		lmth += tp.format({ii:i,nn:field.Field,tt:field.Type,cc:field.Comment});
	}
	$('#tbdyTableFields').html(lmth);
	$('#tbdyTableFields tr').on('click',showFieldDetails);
}

function showFieldDetails(evt)
{
	 var tr = $($(evt.target).parent()[0]),
		    tid = parseInt(tr.attr('id').substr(4));
	 
	if (evt.ctrlKey || evt.shiftKey) 
	{	
 	$('#trmt' + _selRow).removeClass('trselected');
		_selRow = tid;
		tr.addClass('trselected');
		return;
	}	
	
	var btns = {Apply:function(){doApplyFieldEdit(tid)},Close:closeFieldEditor};
	$('#diaFieldEdit').dialog({title:msgs_.editField,
		                           create:setupFieldEdit,open:function(){resetFieldEdit(tid)},
																													minHeight:300,minWidth:700,
																													fluid:true,resizable:false,modal:true,
																													buttons:btns});
}

function setupFieldEdit()
{
	$('.divRadio').buttonset();
	$('#selFieldType').bind('change',fieldTypeChanged);
}

function resetFieldEdit(ndx)
{
	var f = $('#diaMakeTable').data('fields')[ndx];
	$('.divXX').css('display','none');
	$('#selFieldType').val(f.Type);
	$('#inpFieldName').val(f.Field);
	$('.divRadio input[type=radio]').prop('checked',false);
	
	$('#inpUns' + (f.IsUnsn).intval()).prop('checked',true);
	
	$('#inpAI' + f.AI.intval()).prop('checked',true);
	$('#inpCTS' + f.CTS.intval()).prop('checked',true);
	$('#inpNull' + (f.IsNull).intval())	.prop('checked',true);
	
	$('#inpDefault').val(f.Default);
	$('#txaMembers').html(f.CType);
	$('#txaComment').html(f.Comment);
	
	$('#inpMLSmall').val(f.CMax);
	$('#inpMLBig').val(f.CMax);
	$('#inpMLBit').val(f.CMax);
	
	$('#selFieldCollation').val(f.Collation);
	$('.divRadio').buttonset('refresh');
	fieldTypeChanged();
}

function fieldTypeChanged()
{
	var ndx,dx = $('#selFieldType option:selected').data('x');
	dx = (undefined === dx)?0:parseInt(dx);
	$('.divXX').css('display','none');
	
	for(var i=0;i < 9;i++)
	{
		ndx = 1 << i;
		if (dx & ndx) $('#divXX' + ndx).css('display','-webkit-flex');
	}
}

function invalidMembers(ctype)
{
 return ((0 == ctype.length) || 
	        (-1 === ctype.indexOf(',')) || 
									(-1 < ctype.indexOf(',,')) ||
									(',' == ctype[ctype.length - 1])
									);	
}

function doApplyFieldEdit(ndx)
{
	var fn = $('#inpFieldName').val();
	if (!nameCheck(fn,'field',1)) return;
	if (fieldNameNotUnique(ndx,fn)) return;
	
	var isAI = ('inpAI1' == $('input[name=autoinc]:checked').attr('id'));
	if (isAI) unAIAll();
	var f = $('#diaMakeTable').data('fields')[ndx];
	f.Field = fn;
	f.Type = $('#selFieldType option:selected').val();
	f.AI = isAI;
	f.CTS = ('inpCTS1' == $('input[name=cts]:checked').attr('id'));
	f.IsUnsn = ('inpUns1' == $('input[name=unsigned]:checked').attr('id'));
	f.IsNull = ('inpNull1' == $('input[name=isnull]:checked').attr('id'));
	f.Null = (f.IsNull)?'YES':'NO';
	
	var mlMap = {char:'inpMLSmall',varchar:'inpMLBig',bit:'inpMLBit',
             binary:'inpMLSmall',varbinary:'inpMLBig'},
					mlt = mlMap[f.Type];
					
	if (undefined !== mlt) f.CMax = parseInt($('#' + mlt).val());
	f.Default = $('#inpDefault').val();
	f.Comment = $('#txaComment').val();
	f.CType = $('#txaMembers').val();
	
	if ((('enum' == f.Type) || ('set' == f.Type)) && invalidMembers(f.CType))
	{
	 showError(msgs_.setEnumEmpty)	;
		return;
	}
	
	f.Collation = $('#selFieldCollation option:selected').val();
 refillTableFields();
	closeFieldEditor();	
}


//-----------------------------------SQL------------------------------
function doEditSQL()
{
	var db = $('#selDBs option:selected').val();
	if ('-' == db)
	{
		showError(msgs_.firstSelectDB);
		return;
	}
	_doEditSQL('');
}

function _doEditSQL(sql)
{
	var btns = {Run:doRunSQL,Close:closeSQLEditor,Clear:clearSQLEditor};
	$('#diaSQL').dialog({title:msgs_.editSQL,
	                      modal:true,resizable:true,fluid:true,
																							minWidth:600,maxWidth:700,minHeight:400,
																							create:setupSQLEditor,open:function(){resetSQLEditor(sql);},
																							beforeClose:discardCRDefault,
																							buttons:btns
															       });
}

function setupSQLEditor()
{
	var opts = 
	{mode:'text/x-mariadb',matchBrackets:true,theme:'midnight',autofocus:true,lineWrapping:true};
	_sql = CodeMirror.fromTextArea(document.getElementById('txaSQL'),opts);
}

function resetSQLEditor(sql)
{
	_sql.setValue(sql);
	fluidDialog();
}

function doRunSQL()
{
	var sql = _sql.getValue().trim(),
		   db = $('#selDBs option:selected').val();

	if (0 === sql.length)
	{
		showError(msgs_.noSQL);
		return;
	}
	
	var data = JSON.stringify([db,sql]);
	$('#preResult').text('').css('display','none');
	$.post('php/runsql.php',data,afterRunSQL).error(function(xh,ts,et){showError('{st}:{te}'.format({st:ts,te:et}))});
}

function clearSQLEditor()
{
	_sql.setValue('');
	$('#preResult').text('').css('display','none');
	fluidDialog();
}

function afterRunSQL(data)
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

function displayRunResult(data)
{
	function _showFormattedResults()
	{
		var opts = {
			            title:msgs_.results,
														 modal:true,resizable:true,fluid:true,
															height:600,width:700,
															create:setupResultsDialog,
															open:function(){showResults(data);},
															beforeClose:clearResultsTable
		            };
		$('#preResult').css('display','none');												
		$('#diaRunResult').dialog(opts);
	}
	
	var dt = typeof(data),
	    route = ('string' == dt).intval() + ('number' == dt).intval(1);
					
	switch(route)
 {
		case 0:_showFormattedResults();break;
		case 1:$('#preResult').text(data).css('display','block');break;
		case 2:switch(data)
		       {
										case 0:showError(msgs_.opFailed);break;
										case 1:showError(msgs_.opSucceded,true);break;
										default:showError(msgs_.opRet.format({nn:data}),true);
									}
	}		
}

function setupResultsDialog()
{
	$('#inpThisPg').on('change',changeResultsPage);
 $('.pgnav').on('click',navResultsPage)	;
}

function navResultsPage(e)
{
	var upd = parseInt($(e.delegateTarget).attr('id').reverse()) - 1;
	_changeResultsPage(_page + upd,true);
}

function changeResultsPage()
{
	var p = parseInt($('#inpThisPg').val());
	_changeResultsPage(p,false);
}

function _changeResultsPage(p,andSet)
{
	if ((0 < p) && (p <= Math.ceil(_rows.length/50)))
	{
		_page = p;
		if (andSet) $('#inpThisPg').val(p);
 	showCurrentPage();
	} else 
	{
		$('#inpThisPg').val(_page);
		showError(msgs_.noSuchPage);	
	}	
}

function showResults(data)
{
	if (data.isArray)
	{
		var count = data.length;
		if (0 == count)
		{
			$('#diaRunResult').dialog('close');
			showError(msgs_.resultEmpty);
			return;
		}	
  if (count > 20) showPagedResult(data,count);else showStraightResult(data);
	}	else 
	{	
	 $('#diaRunResult').dialog('close');
		alert('Returns an object?');
	}	
}

function showPagedResult(rows,count)
{
 	_page = 1;
	_rows = rows;

	$('#divPgNav').css('display','block');
	$('#inpThisPg').attr('max',Math.ceil(rows.length/50)).val(1);
	showCurrentPage();
}

function showCurrentPage()
{
	var first = (0 === _page)?0:50*(_page - 1),last = first + 50;
	_showStraightResult(_rows.slice(first,last));
}

function showStraightResult(data)
{
	$('#divPgNav').css('display','none');
	_showStraightResult(data);
}

function _showStraightResult(data)
{
	$('#thdResults').html(tableHeader(Object.keys(data[0]),dataTypes(data[0])));
	$('#tbdyResults').html(tableBody(data));
	$('#tblResults').stupidtable();
}

function clearResultsTable()
{
	_rows = null;
	$('#thdResults').html('');
	$('#tbdyResults').html('');
}
function unAIAll()
{
	var f,i,fields = $('#diaMakeTable').data('fields');
	for(i=0;i < fields.length;i++) fields[i].AI = false;
}

function CTypeString(f)
{
	var parts = quoteEscaped(f.CType);
 parts = parts.replaceAll(',',"','");					
	return "('{pp}')".format({pp:parts});
}

function fieldSQL(f,isFirst)
{
	var 
	fmt,
	typ = f.Type,
	isIFD = ((-1 < typ.indexOf('int')) || ('float' == typ) || ('double' == typ)),
	willBeAI = isIFD && f.AI,
	needsColl = ((-1 < typ.indexOf('char')) || (-1 < typ.indexOf('text')) || ('set' == typ) || ('enum' == typ)),
	needsDefault = ((-1 === typ.indexOf('text')) && (-1 === typ.indexOf('blob')) && !willBeAI),
	needsLength = ((-1 < typ.indexOf('char')) || (-1 < typ.indexOf('binary')) || ('bit' == typ)),
	needsMembers = (('enum' == typ) || ('set' == typ)),
	needsUnS = isIFD || ('decimal' == typ),
	ai = (willBeAI)?' AUTO_INCREMENT PRIMARY KEY':'',
	uns = (needsUnS && f.IsUnsn)?'unsigned':'',
	cmt = (0 < f.Comment.length)?"COMMENT '{cmt}'".format({cmt:quoteEscaped(f.Comment)}):'',
	nul = (f.IsNull && !willBeAI)?'NULL':'NOT NULL',
	col = (needsColl && ('-' != f.Collation))?"COLLATE '{co}'".format({co:f.Collation}):'',
	dft = (needsDefault && (0 < f.Default.length))?"DEFAULT '{df}'".format({df:quoteEscaped(f.Default)}):'',
	ctyp = (needsMembers && (0 < f.CType.length))?CTypeString(f):'';
	comma = (isFirst)?'':",\n";
	
	typ += (needsLength && (0 < f.CMax))?'({ml})'.format({ml:f.CMax}):'';
	
	fmt = {cma:comma,dlf:f.Field,pyt:typ,tfd:dft,snu:uns,lun:nul,loc:col,ia:ai,pytc:ctyp};
	return "{cma}`{dlf}` {pyt}{pytc} {tfd} {snu} {lun} {loc} {ia}".format(fmt);
}
function doSelect()
{
	if ('-' == $('#selTables option:selected').val())
	{
	 showError(msgs_.tableFirst);
  return;	
	}
	
	_doSelect(0,_selCount,showTableData);
}

/*
      url = 'php/tabledata.php?db={bd}&tbl={lbt}&off={ffo}&cnt={tnc}'.format({bd:db,lbt:tbl,ffo:off,tnc:count});
	console.log($('#divRowFields').data('fsinf'));					
 $.get(url,function(d){afterTableData(d,showFunc)}).error(function(){showError(msgs_.unTableData)});

	*/

function fsInfo()
{
	var out = {},
	    fields = $('#divRowFields').data('fsinf');
	for(prop in fields)
	{
		out[prop] = fields[prop].typ;
	}
	return out;
}

function _doSelect(ffo,cnt,showFunc)
{
 var d = $('#selDBs option:selected').val(),
	     t = $('#selTables option:selected').val(),
						f = fsInfo(),
						data = JSON.stringify({db:d,tbl:t,fsi:f,off:ffo,count:cnt});
	$.post('php/tabledata.php',data,function(d){afterTableData(d,showFunc)}).error(function(){showError(msgs_.unTableData)});
}

function afterTableData(data,showFunc)
{
	try
	{
		data = JSON.parse(data);
		switch(data.code)
		{
			case -6:showError(msgs_.dbsDown);break;
			case -5:showError(msgs_.badQueryURL);break;
			case -4:showError(msgs_.noSuchDB);break;
			case -3:showError(msgs_.noSuchTbl);break;
			case -2:showError(msgs_.badOffset);break;
			case -1:showError(msgs_.emptyTable);break;
			case 0:showPDOError(data.data);break;
			case 1:showFunc(data.data);break;
		}
	} catch(err){showError(err);}
}

function closeTableDataViewer(){$('#diaTableData').dialog('close');}

function showTableData(data)
{
	var btns = {Close:closeTableDataViewer},
	    opts = {
	            title:msgs_.tableData,
												 modal:true,resizable:true,fluid:true,
													minHeight:300,maxHeight:800,
													minwidth:600,maxWidth:900,
													width:600,height:700,
													create:setupTDDialog,
													open:function(){showTD(data);},
													beforeClose:clearTD,buttons:btns
            };
	$('#diaTableData').dialog(opts);
}

function setupTDDialog()
{
	$('#inpThisPage').on('change',changeTDPage);
 $('.pagenav').on('click',navTDPage);
	$('#btnTDDrop').on('click',doTDDrop);
	$('#btnTDHide').on('click',doTDHide);
}

function navTDPage(e)
{
	var upd = parseInt($(e.delegateTarget).attr('id').reverse()) - 1;
	_changeTDPage(_page + upd,true);
}

function changeTDPage()
{
	var p = parseInt($('#inpThisPage').val());
	_changeTDPage(p,false);
}

function _changeTDPage(p,andSet)
{
	var offtot = $('#divPageNav').data('offtot');
	if ((0 < p) && (p <= Math.ceil(offtot.total/_selCount)))
	{
		_page = p;
	 _doSelect((p - 1)*_selCount,_selCount,reShowTD);
	} else 
	{
		$('#inpThisPage').val(_page);
		showError(msgs_.noSuchPage);	
	}	
}

function configTDOffset(offtot)
{
	var maxPage = Math.ceil(offtot.total/_selCount),
	    currPage = 1 + Math.floor(offtot.off/_selCount); 
	$('#inpThisPage').attr('max',maxPage).val(currPage);
	_selRow = -1;
}

function reShowTD(data){innerShowTD(data,false);}

function showTD(data){innerShowTD(data,true);}

function innerShowTD(data,withHint)
{
	$('#divPageNav').data('offtot',data[1]);
	configTDOffset(data[1]);
	_showTD(data[0]);
	if (withHint) showError(msgs_.tdHint,true);
	fluidDialog();
}

function _showTD(rows)
{
	_rows = rows;
	_selRow = -1;
	$('#thdTDResults').html(tableHeader(Object.keys(rows[0]),dataTypes(rows[0])));
	$('#tbdyTDResults').html(tableBody(rows));
	$('#tblTDResults').stupidtable();
 $('#tbdyTDResults').children().on('click',editTableRow);
}

function clearTD()
{
	_rows = null;
	_selRow = -1;
	_hides = [];
	$('#thdTDResults').html('');
	$('#tbdyTDResults').html('');
	$('#divPageNav').removeData();
}

function editTableRow(e)
{
	var tr = $(e.currentTarget),
	    tid = parseInt(tr.attr('id').substr(3));
					
 	$('#tbr' + _selRow).removeClass('trselected');
		_selRow = tid;
		tr.addClass('trselected');

		if (e.ctrlKey || e.shiftKey)		return;
		showRowEditor();
}

function doTDDrop()
{
	
}


(function(c){c.fn.stupidtable=function(b){return this.each(function(){var a=c(this);b=b||{};b=c.extend({},c.fn.stupidtable.default_sort_fns,b);a.data("sortFns",b);a.on("click.stupidtable","thead th",function(){c(this).stupidsort()})})};c.fn.stupidsort=function(b){var a=c(this),g=0,f=c.fn.stupidtable.dir,e=a.closest("table"),k=a.data("sort")||null;if(null!==k){a.parents("tr").find("th").slice(0,c(this).index()).each(function(){var a=c(this).attr("colspan")||1;g+=parseInt(a,10)});var d;1==arguments.length?
d=b:(d=b||a.data("sort-default")||f.ASC,a.data("sort-dir")&&(d=a.data("sort-dir")===f.ASC?f.DESC:f.ASC));e.trigger("beforetablesort",{column:g,direction:d});e.css("display");setTimeout(function(){var b=[],l=e.data("sortFns")[k],h=e.children("tbody").children("tr");h.each(function(a,e){var d=c(e).children().eq(g),f=d.data("sort-value");"undefined"===typeof f&&(f=d.text(),d.data("sort-value",f));b.push([f,e])});b.sort(function(a,b){return l(a[0],b[0])});d!=f.ASC&&b.reverse();h=c.map(b,function(a){return a[1]});
e.children("tbody").append(h);e.find("th").data("sort-dir",null).removeClass("sorting-desc sorting-asc");a.data("sort-dir",d).addClass("sorting-"+d);e.trigger("aftertablesort",{column:g,direction:d});e.css("display")},10);return a}};c.fn.updateSortVal=function(b){var a=c(this);a.is("[data-sort-value]")&&a.attr("data-sort-value",b);a.data("sort-value",b);return a};c.fn.stupidtable.dir={ASC:"asc",DESC:"desc"};c.fn.stupidtable.default_sort_fns={"int":function(b,a){return parseInt(b,10)-parseInt(a,10)},
"float":function(b,a){return parseFloat(b)-parseFloat(a)},string:function(b,a){return b.localeCompare(a)},"string-ins":function(b,a){b=b.toLocaleLowerCase();a=a.toLocaleLowerCase();return b.localeCompare(a)}}})(jQuery);

function doTDHide()
{
	var btns = {CheckAll:{text:'Hide All',click:doHideAll},Apply:doHideApply,Close:doHideClose};
	$('#diaTDHide').dialog(
	{
		title:msgs_.hideFields,fluid:true,resizable:true,modal:true,
		height:400,width:500,maxHeight:600,maxWidth:500,minWidth:500,
  open:prepareHideDialog,beforeClose:clearOutHideDialog,
  buttons:btns		
	}
	)
}

function prepareHideDialog()
{
	var i,key,lmth = '',keys = Object.keys(_rows[0]).sort(),
	    tpl = "<div><input type='checkbox' id='inpHide{ii}'/><label for='inpHide{jj}'>{ky}</label></div>";
	for(i=0;i < keys.length;i++)
	{
		key = keys[i];
		lmth += tpl.format({ii:i,jj:i,ky:key});
	}	
	$('#divHideBoxes').html(lmth);
}

function clearOutHideDialog(){$('#divHideBoxes').html('');}

function doHideAll(){$('[id^=inpHide]').prop('checked',true);}

function doHideApply()
{
	_hides = [];
	var i,id,checks = $('[id^=inpHide]:checked');
	for(i=0;i < checks.length;i++)
	{
		id = $(checks[i]).attr('id');
		_hides.push($("label[for={di}]".format({di:id})).text());
	}
	doHideClose();
	_showTD(_rows);
}

function doHideClose(){$('#diaTDHide').dialog('close');}
function showRowEditor()
{
	var kf = $('#divRowFields').data('kf');
 if (false === kf.k)
	{
		showError(msgs_.cannotEdit);
		return;
	}
	
	kf.v = _rows[_selRow][kf.k];
	var btns = {View:{text:'View SQL',click:doViewSQL},Apply:doApplyRowEdit,Close:closeRowEditor}	;
	$('#diaRowEdit').dialog(
	{
		title:msgs_.rowEdit,
		modal:true,resizable:false,fluid:false,
		height:700,width:700,
		open:fillRowFields,
		beforeClose:cleanOutRowFields,
		buttons:btns
	});
}

function getClone(cid,fxn,rval,key,isN,pfx)
{
	var lbox = $('#' + cid).clone(true),
	    lspan = lbox.children(':first-child');
	lbox.removeAttr('id').data('filter',fxn).data('cs',fnv32(rval)).data('isn',isN).data('pfx',pfx);
	lspan.text(key);
	lspan.next().val(rval);
	return lbox;
}

function getCharClone(cid,fxn,rval,key,isN,pfx,mlen)
{
	var lbox = $('#' + cid).clone(true),
	    lspan = lbox.children(':first-child'),
					ldv = lspan.next(),
					linp = ldv.children(':first-child'),
					lldv = linp.next(),
					lcbx = lldv.children(':first-child'),
					llbl = lcbx.next(),
					chks = fnv32(rval),
					id = 'i' + chks;//uniqueify id on cbx/label combo
	lbox.removeAttr('id').data('filter',fxn).data('cs',chks).data('isn',isN).data('pfx',pfx);
	lcbx.attr('id',id).prop('disabled',!isN);
	llbl.attr('for',id);
	linp.attr('maxlength',mlen).val(rval);
	lspan.text(key);
	return lbox;
}

function getBinaryClone(cid,fxn,rval,key,isN,pfx,mlen)
{
	var lbox = $('#' + cid).clone(true),
	    lspan = lbox.children(':first-child'),
					ldv = lspan.next(),
					linp = ldv.children(':first-child'),
					lldv = linp.next(),
					lcbx = lldv.children(':first-child'),
					llbl = lcbx.next(),
					chks = fnv32(rval),
					id = 'i' + chks;//uniqueify id on cbx/label combo
	lbox.removeAttr('id').data('filter',fxn).data('cs',chks).data('isn',isN).data('pfx',pfx);
	lcbx.attr('id',id).prop('disabled',!isN);
	llbl.attr('for',id);
	linp.attr('maxlength',mlen << 1).val(rval);
	lspan.text(key);
	if (0 === (1 & _reMsgFlags)) 
	{	
	 _reMsg += msgs_.binFormat;
		_reMsgFlags += 1;
	}	
	return lbox;
}

function getSetEnumClone(cid,ffxn,cfxn,rval,key,isN,pfx,opts)
{
	var lbox = $('#' + cid).clone(true),
	    lspan = lbox.children(':first-child'),
					ldv = lspan.next(),
					linp = ldv.children(':first-child'),
					lldv = linp.next(),
					lcbx = lldv.children(':first-child'),
					llbl = lcbx.next(),
					chks = fnv32(rval),
					id = 'i' + chks;//uniqueify id on cbx/label combo
	lbox.removeAttr('id').data('filter',ffxn).data('cs',chks).data('isn',isN).data('pfx',pfx);
	lcbx.attr('id',id).prop('disabled',!isN);
	llbl.attr('for',id);
	linp.prop('readonly',true).on('click',cfxn).data('opts',opts).val(rval);
	lspan.text(key);

	if (0 === (4 & _reMsgFlags)) //stop the same hint appearing +1 times
	{	
	 _reMsg += msgs_.clickToEdit;
		_reMsgFlags += 4;
	}	

	return lbox;
}

function getBitfieldClone(cid,fxn,rval,key,isN,pfx,mlen)
{
	var lbox = $('#' + cid).clone(true),
	    lspan = lbox.children(':first-child'),
					ldv = lspan.next(),
					linp = ldv.children(':first-child'),
					lldv = linp.next(),
					lcbx = lldv.children(':first-child'),
					llbl = lcbx.next(),
					chks = fnv32(rval),
					id = 'i' + chks;//uniqueify id on cbx/label combo
	lbox.removeAttr('id').data('filter',fxn).data('cs',chks).data('isn',isN).data('pfx',pfx);
	lcbx.attr('id',id).prop('disabled',!isN);
	llbl.attr('for',id);
	linp.attr('maxlength',mlen).val(rval);
	lspan.text(key);
	
	if (0 === (2 & _reMsgFlags)) //stop the same hint appearing +1 times
	{	
	 _reMsg += msgs_.bitFormat;
		_reMsgFlags += 2;
	}	
	return lbox;
}

function getYearPickerClone(cid,fxn,rval,key,isN,pfx)
{
	var lbox = $('#' + cid).clone(true),
	    lspan = lbox.children(':first-child'),
					ldv = lspan.next(),
					linp = ldv.children(':first-child'),
					lldv = linp.next(),
					lcbx = lldv.children(':first-child'),
					llbl = lcbx.next(),
					chks = fnv32(rval),
					id = 'i' + chks;//uniqueify id on cbx/label combo
	lbox.removeAttr('id').data('filter',fxn).data('cs',chks).data('isn',isN).data('pfx',pfx);
	lcbx.attr('id',id).prop('disabled',!isN);
	llbl.attr('for',id);
	linp.attr('maxlength',4).attr('type','number').attr('min',1901).attr('max',2099).attr('step',1).val(rval);
	lspan.text(key);
	return lbox;
}

function getFilePickerClone(key,isN)
{
	var lbox = $('#cfFile').clone(true),
	    lspan = lbox.children(':first-child'),
					lzlay = lspan.next(),
					lfdiv = lzlay.children(':first-child'),
					lndiv = lfdiv.next(),
					idRoot = fnv32(key),
					lChoose = lfdiv.children(':first-child'),
					lFile = lChoose.next(),
					lcbx = lndiv.children(':first-child'),
					llbl = lcbx.next();
	
 lFile.attr('id','f' + idRoot).on('change',fileSelected);
	lcbx.attr('id','c' + idRoot).prop('disabled',!isN);
	llbl.attr('for','c' + idRoot);
	lspan.text(key);
	lbox.data('fid',idRoot).removeAttr('id').data('filter',blobFilter).data('isn',isN);
	lChoose.text(msgs_.chooseFile).attr('id','b' + idRoot);
 return lbox;
}

function getTextAreaClone(key,isN,typ)
{
	var lbox = $('#cfText').clone(true),
	    lspan = lbox.children(':first-child'),
					lnlay = lspan.next(),
					ltxt = lnlay.children(':first-child'),
					lndiv = ltxt.next(),
					lcbx = lndiv.children(':first-child'),
					llbl = lcbx.next(),
					chks = fnv32(''),
					mln = ('tinytext' == typ)?255:16384;
					id = 'i' + chks;//uniqueify id on cbx/label combo
	lbox.removeAttr('id').data('filter',textFilter).data('cs',chks).data('isn',isN);
	lcbx.attr('id',id).prop('disabled',!isN);
	llbl.attr('for',id);
	ltxt.attr('maxlength',mln);
	lspan.text(key);
	return lbox;
}

function fileSelected(e)
{
	var id = $(e.currentTarget).attr('id'),
	    files = e.currentTarget.files,
					btn = $('#b' + id.substr(1)),
					file,capt = msgs_.chooseFile;

	if (0 < files.length)
	{
		file = files[0];
		if (16384 < file.size) showError(msgs_.blogMaxSize);else
		{
		 capt = '{cf}[{cp}]'.format({cf:msgs_.chooseFile,cp:file.name});	
			var reader = new FileReader();
   reader.onload = function(){$('#' + id).data('blob',reader.result);}
			reader.readAsText(file);
		}
	}	
 btn.text(capt);
}

function dateTimeFNV(rval,typid)
{
 switch(typid)
	{
		case 0:return fnv32(jsDate(rval));break;
		case 1:return fnv32(jsDateTime(rval));break;
		case 2:return fnv32(rval);break;
	}	
}

function getDatePickerClone(cid,fxn,typid,rval,key,isN,pfx)
{
	var lbox = $('#' + cid).clone(true),
	    lspan = lbox.children(':first-child'),
					ldv = lspan.next(),
					linp = ldv.children(':first-child'),
					lldv = linp.next(),
					lcbx = lldv.children(':first-child'),
					llbl = lcbx.next(),
					chks = dateTimeFNV(rval,typid),
					id = 'i' + chks;//uniqueify id on cbx/label combo
	lbox.removeAttr('id').data('filter',fxn).data('cs',chks).data('isn',isN).data('pfx',pfx);
	lcbx.attr('id',id).prop('disabled',!isN);
	lbox.data('typid',typid).data('rval',rval);
	llbl.attr('for',id);
	lspan.text(key);
	
	if (0 === (4 & _reMsgFlags)) //stop the same hint appearing +1 times
	{	
	 _reMsg += msgs_.clickToEdit;
		_reMsgFlags += 4;
	}	
	return lbox;
}

function resolveClone(key,f,rval)
{
	var fxn,clone = null,
	     isN = f.isnull,pfx = f.pfx,
						typ = f.typ.toLowerCase(),
						typ = (0 <= typ.indexOf('blob'))?'blob':typ,
						typ = (0 <= typ.indexOf('text'))?'text':typ;
	switch(typ)
	{
		case 'tinyint':fxn = (f.unsn)?utiFilter:tiFilter;
		                clone = getClone('cfInput',fxn,rval,key,isN,pfx);
																		break;
		case 'smallint':fxn = (f.unsn)?usiFilter:siFilter;
		                clone = getClone('cfInput',fxn,rval,key,isN,pfx);
																		break;
		case 'mediumint':fxn = (f.unsn)?umiFilter:miFilter;
		                clone = getClone('cfInput',fxn,rval,key,isN,pfx);
																		break;
		case 'int':fxn = (f.unsn)?uiFilter:iFilter;
		                clone = getClone('cfInput',fxn,rval,key,isN,pfx);
																		break;
		case 'bigint':fxn = (f.unsn)?ubiFilter:biFilter;
		                clone = getClone('cfInput',fxn,rval,key,isN,pfx);
																		break;
		case 'float':fxn = (f.unsn)?ufloatFilter:floatFilter;
		                clone = getClone('cfInput',fxn,rval,key,isN,pfx);
																		break;
		case 'double':fxn = (f.unsn)?udoubleFilter:doubleFilter;
		                clone = getClone('cfInput',fxn,rval,key,isN,pfx);
																		break;
		case 'char':clone = getCharClone('cfChar',charFilter,rval,key,isN,pfx,f.cmax);break;
		case 'varchar':clone = getCharClone('cfChar',charFilter,rval,key,isN,pfx,f.cmax);break;
		case 'set':clone = getSetEnumClone('cfChar',charFilter,setShow,rval,key,isN,pfx,f.ctyp);break;
		case 'enum':clone = getSetEnumClone('cfChar',charFilter,enumShow,rval,key,isN,pfx,f.ctyp);break;
		case 'bit':clone = getBitfieldClone('cfChar',bitFilter,rval,key,isN,pfx,f.cmax);break;
		case 'binary':clone = getBinaryClone('cfChar',binaryFilter,rval,key,isN,pfx,f.cmax);break;
		case 'varbinary':clone = getBinaryClone('cfChar',binaryFilter,rval,key,isN,pfx,f.cmax);break;
		case 'date':clone = getDatePickerClone('cfChar',dateFilter,0,rval,key,isN,pfx,f.ctyp);break;
		case 'datetime':clone = getDatePickerClone('cfChar',dateTimeFilter,1,rval,key,isN,pfx,f.ctyp);break;
		case 'time':clone = getDatePickerClone('cfChar',timeFilter,2,rval,key,isN,pfx,f.ctyp);break;
		case 'timestamp':clone = getDatePickerClone('cfChar',timeStampFilter,3,rval,key,isN,pfx,f.ctyp);break;
		case 'year':clone = getYearPickerClone('cfChar',yearFilter,rval,key,isN,pfx);break;
		case 'blob':clone = getFilePickerClone(key,isN);break;
		case 'text':clone = getTextAreaClone(key,isN,f.typ);break;
	}
	return clone;
}

function fillRowFields()
{
	_reMsg = '';
	_reMsgFlags = 0;
	var i,key,fsi,clone,rval,
	    row = _rows[_selRow],
	    drf = $('#divRowFields'),
					fsis = drf.data('fsinf');
					
	for(key in row) 
	{
		clone = resolveClone(key,fsis[key],row[key]);
		if (null === clone) showError(msgs_.cloneMissing.format({pyt:fsis[key].typ}));
		else 
		{	
		 clone.appendTo(drf);
			var typid = clone.data('typid');
			if (undefined !== typid) configureCloneForDateTime(clone,typid);
		}	
	}	
	if (0 < _reMsg.length) showError(_reMsg,true);
}

function jsDate(rval)
{
	rval = rval.split('-');
 var h = rval[0];rval[0] = rval[2];rval[2] = h;
	return rval.join('/');
	return rval;
}

function jsDateTime(rval)
{
	var dt = rval.split(' '),
	    d = jsDate(dt[0]); 
	return '{dd} {tt}'.format({dd:d,tt:dt[1]});
}

function  configureCloneForDateTime(clone,typid)
{
	var linp = clone.children(':first-child').next().children(':first-child'),
	     rval = clone.data('rval');
	
	switch(parseInt(typid))
	{
		case 0:linp.datepicker();
		       rval = 
		       linp.datepicker('setDate',jsDate(rval));
									break;
		case 1:linp.datetimepicker({timeFormat:'HH:mm:ss',controlType:'select',oneLine:true});
          linp.datetimepicker('setDate',jsDateTime(rval));		
		        break;
		case 2:linp.timepicker({timeFormat:'HH:mm:ss',controlType:'select',oneLine:true});
		       linp.datetimepicker('setTime',rval); 
		       break;
		case 3:linp.datetimepicker({timeFormat:'HH:mm:ss',controlType:'select',oneLine:true});
          linp.datetimepicker('setDate',jsDateTime(rval));		
		        break;
	}
}

function cleanOutRowFields(){$('#divRowFields').html('');}

function SQLFragment(f,pfx,blobs,ndx)
{
	pfx = ('-' == pfx)?'':pfx;
	if (f.isBlob) 
	{
		ndx = 'b' + ndx;
  blobs[ndx] = f.fv;	
	 return ",{nn} = :{dd}".format({nn:f.n,dd:ndx});
	} else return ",{nn} = {pp}'{vv}'".format({nn:f.n,pp:pfx,vv:f.fv});
}

function fullSQL(sqf)
{
	var kf = $('#divRowFields').data('kf'),
	    tbl = $('#selTables option:selected').val(),
					sql;
	sql = "UPDATE `{lbt}` SET {fqs} WHERE {kk} = '{vv}';";
	return sql.format({lbt:tbl,fqs:sqf.substr(1),kk:kf.k,vv:kf.v})
}

function updateRowSQL(blobs)
{
		var i,drf,fxn,pfx,sql = '',
	    row = _rows[_selRow],
					changes = [],
					drfc = $('#divRowFields').children();
	try
	{	
	 for(i=0;i < drfc.length;i++)
	 {
		 drf = $(drfc[i]);
		 fxn = drf.data('filter');
			pfx = drf.data('pfx');
		 f = fxn(drf);
			if (!f.c) continue;
			sql += SQLFragment(f,pfx,blobs,i);
		}
	}	catch(err)	
	{
		showError(err);
		return '';
	}
	if (0 === sql.length) showError(msgs_.nothingHasChanged);
 return fullSQL(sql);
}

function doViewSQL()
{
	var blobs = {},sql = updateRowSQL(blobs);
	if (0 < sql.length)
	{
  $('#diaRowEdit').dialog('close');
		$('#diaTableData').dialog('close');
		_doEditSQL(sql);
	}
}

function doApplyRowEdit()
{
 var blobs = {},sql = updateRowSQL(blobs);
	if (0 < sql.length)
 {
		var data = [$('#selDBs option:selected').val(),sql,blobs];
		$.post('php/updaterow.php',JSON.stringify(data),afterRowEdit).error(function(){showError(msgs_.unRowEdit);});
	}
}

function afterRowEdit(data)
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
			       closeRowEditor();
										closeTableDataViewer();
			       break;									
		}
	} catch(err){showError(err);}
}

/*
	JavaScript BigInteger library version 0.9
	http://silentmatt.com/biginteger/

	Copyright (c) 2009 Matthew Crumley <email@matthewcrumley.com>
	Copyright (c) 2010,2011 by John Tobey <John.Tobey@gmail.com>
	Licensed under the MIT license.

	Support for arbitrary internal representation base was added by
	Vitaly Magerya.
*/

/*
	File: biginteger.js

	Exports:

		<BigInteger>
*/
(function(exports) {
"use strict";
/*
	Class: BigInteger
	An arbitrarily-large integer.

	<BigInteger> objects should be considered immutable. None of the "built-in"
	methods modify *this* or their arguments. All properties should be
	considered private.

	All the methods of <BigInteger> instances can be called "statically". The
	static versions are convenient if you don't already have a <BigInteger>
	object.

	As an example, these calls are equivalent.

	> BigInteger(4).multiply(5); // returns BigInteger(20);
	> BigInteger.multiply(4, 5); // returns BigInteger(20);

	> var a = 42;
	> var a = BigInteger.toJSValue("0b101010"); // Not completely useless...
*/

var CONSTRUCT = {}; // Unique token to call "private" version of constructor

/*
	Constructor: BigInteger()
	Convert a value to a <BigInteger>.

	Although <BigInteger()> is the constructor for <BigInteger> objects, it is
	best not to call it as a constructor. If *n* is a <BigInteger> object, it is
	simply returned as-is. Otherwise, <BigInteger()> is equivalent to <parse>
	without a radix argument.

	> var n0 = BigInteger();      // Same as <BigInteger.ZERO>
	> var n1 = BigInteger("123"); // Create a new <BigInteger> with value 123
	> var n2 = BigInteger(123);   // Create a new <BigInteger> with value 123
	> var n3 = BigInteger(n2);    // Return n2, unchanged

	The constructor form only takes an array and a sign. *n* must be an
	array of numbers in little-endian order, where each digit is between 0
	and BigInteger.base.  The second parameter sets the sign: -1 for
	negative, +1 for positive, or 0 for zero. The array is *not copied and
	may be modified*. If the array contains only zeros, the sign parameter
	is ignored and is forced to zero.

	> new BigInteger([5], -1): create a new BigInteger with value -5

	Parameters:

		n - Value to convert to a <BigInteger>.

	Returns:

		A <BigInteger> value.

	See Also:

		<parse>, <BigInteger>
*/
function BigInteger(n, s, token) {
	if (token !== CONSTRUCT) {
		if (n instanceof BigInteger) {
			return n;
		}
		else if (typeof n === "undefined") {
			return ZERO;
		}
		return BigInteger.parse(n);
	}

	n = n || [];  // Provide the nullary constructor for subclasses.
	while (n.length && !n[n.length - 1]) {
		--n.length;
	}
	this._d = n;
	this._s = n.length ? (s || 1) : 0;
}

BigInteger._construct = function(n, s) {
	return new BigInteger(n, s, CONSTRUCT);
};

// Base-10 speedup hacks in parse, toString, exp10 and log functions
// require base to be a power of 10. 10^7 is the largest such power
// that won't cause a precision loss when digits are multiplied.
var BigInteger_base = 10000000;
var BigInteger_base_log10 = 7;

BigInteger.base = BigInteger_base;
BigInteger.base_log10 = BigInteger_base_log10;

var ZERO = new BigInteger([], 0, CONSTRUCT);
// Constant: ZERO
// <BigInteger> 0.
BigInteger.ZERO = ZERO;

var ONE = new BigInteger([1], 1, CONSTRUCT);
// Constant: ONE
// <BigInteger> 1.
BigInteger.ONE = ONE;

var M_ONE = new BigInteger(ONE._d, -1, CONSTRUCT);
// Constant: M_ONE
// <BigInteger> -1.
BigInteger.M_ONE = M_ONE;

// Constant: _0
// Shortcut for <ZERO>.
BigInteger._0 = ZERO;

// Constant: _1
// Shortcut for <ONE>.
BigInteger._1 = ONE;

/*
	Constant: small
	Array of <BigIntegers> from 0 to 36.

	These are used internally for parsing, but useful when you need a "small"
	<BigInteger>.

	See Also:

		<ZERO>, <ONE>, <_0>, <_1>
*/
BigInteger.small = [
	ZERO,
	ONE,
	/* Assuming BigInteger_base > 36 */
	new BigInteger( [2], 1, CONSTRUCT),
	new BigInteger( [3], 1, CONSTRUCT),
	new BigInteger( [4], 1, CONSTRUCT),
	new BigInteger( [5], 1, CONSTRUCT),
	new BigInteger( [6], 1, CONSTRUCT),
	new BigInteger( [7], 1, CONSTRUCT),
	new BigInteger( [8], 1, CONSTRUCT),
	new BigInteger( [9], 1, CONSTRUCT),
	new BigInteger([10], 1, CONSTRUCT),
	new BigInteger([11], 1, CONSTRUCT),
	new BigInteger([12], 1, CONSTRUCT),
	new BigInteger([13], 1, CONSTRUCT),
	new BigInteger([14], 1, CONSTRUCT),
	new BigInteger([15], 1, CONSTRUCT),
	new BigInteger([16], 1, CONSTRUCT),
	new BigInteger([17], 1, CONSTRUCT),
	new BigInteger([18], 1, CONSTRUCT),
	new BigInteger([19], 1, CONSTRUCT),
	new BigInteger([20], 1, CONSTRUCT),
	new BigInteger([21], 1, CONSTRUCT),
	new BigInteger([22], 1, CONSTRUCT),
	new BigInteger([23], 1, CONSTRUCT),
	new BigInteger([24], 1, CONSTRUCT),
	new BigInteger([25], 1, CONSTRUCT),
	new BigInteger([26], 1, CONSTRUCT),
	new BigInteger([27], 1, CONSTRUCT),
	new BigInteger([28], 1, CONSTRUCT),
	new BigInteger([29], 1, CONSTRUCT),
	new BigInteger([30], 1, CONSTRUCT),
	new BigInteger([31], 1, CONSTRUCT),
	new BigInteger([32], 1, CONSTRUCT),
	new BigInteger([33], 1, CONSTRUCT),
	new BigInteger([34], 1, CONSTRUCT),
	new BigInteger([35], 1, CONSTRUCT),
	new BigInteger([36], 1, CONSTRUCT)
];

// Used for parsing/radix conversion
BigInteger.digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/*
	Method: toString
	Convert a <BigInteger> to a string.

	When *base* is greater than 10, letters are upper case.

	Parameters:

		base - Optional base to represent the number in (default is base 10).
		       Must be between 2 and 36 inclusive, or an Error will be thrown.

	Returns:

		The string representation of the <BigInteger>.
*/
BigInteger.prototype.toString = function(base) {
	base = +base || 10;
	if (base < 2 || base > 36) {
		throw new Error("illegal radix " + base + ".");
	}
	if (this._s === 0) {
		return "0";
	}
	if (base === 10) {
		var str = this._s < 0 ? "-" : "";
		str += this._d[this._d.length - 1].toString();
		for (var i = this._d.length - 2; i >= 0; i--) {
			var group = this._d[i].toString();
			while (group.length < BigInteger_base_log10) group = '0' + group;
			str += group;
		}
		return str;
	}
	else {
		var numerals = BigInteger.digits;
		base = BigInteger.small[base];
		var sign = this._s;

		var n = this.abs();
		var digits = [];
		var digit;

		while (n._s !== 0) {
			var divmod = n.divRem(base);
			n = divmod[0];
			digit = divmod[1];
			// TODO: This could be changed to unshift instead of reversing at the end.
			// Benchmark both to compare speeds.
			digits.push(numerals[digit.valueOf()]);
		}
		return (sign < 0 ? "-" : "") + digits.reverse().join("");
	}
};

// Verify strings for parsing
BigInteger.radixRegex = [
	/^$/,
	/^$/,
	/^[01]*$/,
	/^[012]*$/,
	/^[0-3]*$/,
	/^[0-4]*$/,
	/^[0-5]*$/,
	/^[0-6]*$/,
	/^[0-7]*$/,
	/^[0-8]*$/,
	/^[0-9]*$/,
	/^[0-9aA]*$/,
	/^[0-9abAB]*$/,
	/^[0-9abcABC]*$/,
	/^[0-9a-dA-D]*$/,
	/^[0-9a-eA-E]*$/,
	/^[0-9a-fA-F]*$/,
	/^[0-9a-gA-G]*$/,
	/^[0-9a-hA-H]*$/,
	/^[0-9a-iA-I]*$/,
	/^[0-9a-jA-J]*$/,
	/^[0-9a-kA-K]*$/,
	/^[0-9a-lA-L]*$/,
	/^[0-9a-mA-M]*$/,
	/^[0-9a-nA-N]*$/,
	/^[0-9a-oA-O]*$/,
	/^[0-9a-pA-P]*$/,
	/^[0-9a-qA-Q]*$/,
	/^[0-9a-rA-R]*$/,
	/^[0-9a-sA-S]*$/,
	/^[0-9a-tA-T]*$/,
	/^[0-9a-uA-U]*$/,
	/^[0-9a-vA-V]*$/,
	/^[0-9a-wA-W]*$/,
	/^[0-9a-xA-X]*$/,
	/^[0-9a-yA-Y]*$/,
	/^[0-9a-zA-Z]*$/
];

/*
	Function: parse
	Parse a string into a <BigInteger>.

	*base* is optional but, if provided, must be from 2 to 36 inclusive. If
	*base* is not provided, it will be guessed based on the leading characters
	of *s* as follows:

	- "0x" or "0X": *base* = 16
	- "0c" or "0C": *base* = 8
	- "0b" or "0B": *base* = 2
	- else: *base* = 10

	If no base is provided, or *base* is 10, the number can be in exponential
	form. For example, these are all valid:

	> BigInteger.parse("1e9");              // Same as "1000000000"
	> BigInteger.parse("1.234*10^3");       // Same as 1234
	> BigInteger.parse("56789 * 10 ** -2"); // Same as 567

	If any characters fall outside the range defined by the radix, an exception
	will be thrown.

	Parameters:

		s - The string to parse.
		base - Optional radix (default is to guess based on *s*).

	Returns:

		a <BigInteger> instance.
*/
BigInteger.parse = function(s, base) {
	// Expands a number in exponential form to decimal form.
	// expandExponential("-13.441*10^5") === "1344100";
	// expandExponential("1.12300e-1") === "0.112300";
	// expandExponential(1000000000000000000000000000000) === "1000000000000000000000000000000";
	function expandExponential(str) {
		str = str.replace(/\s*[*xX]\s*10\s*(\^|\*\*)\s*/, "e");

		return str.replace(/^([+\-])?(\d+)\.?(\d*)[eE]([+\-]?\d+)$/, function(x, s, n, f, c) {
			c = +c;
			var l = c < 0;
			var i = n.length + c;
			x = (l ? n : f).length;
			c = ((c = Math.abs(c)) >= x ? c - x + l : 0);
			var z = (new Array(c + 1)).join("0");
			var r = n + f;
			return (s || "") + (l ? r = z + r : r += z).substr(0, i += l ? z.length : 0) + (i < r.length ? "." + r.substr(i) : "");
		});
	}

	s = s.toString();
	if (typeof base === "undefined" || +base === 10) {
		s = expandExponential(s);
	}

	var prefixRE;
	if (typeof base === "undefined") {
		prefixRE = '0[xcb]';
	}
	else if (base == 16) {
		prefixRE = '0x';
	}
	else if (base == 8) {
		prefixRE = '0c';
	}
	else if (base == 2) {
		prefixRE = '0b';
	}
	else {
		prefixRE = '';
	}
	var parts = new RegExp('^([+\\-]?)(' + prefixRE + ')?([0-9a-z]*)(?:\\.\\d*)?$', 'i').exec(s);
	if (parts) {
		var sign = parts[1] || "+";
		var baseSection = parts[2] || "";
		var digits = parts[3] || "";

		if (typeof base === "undefined") {
			// Guess base
			if (baseSection === "0x" || baseSection === "0X") { // Hex
				base = 16;
			}
			else if (baseSection === "0c" || baseSection === "0C") { // Octal
				base = 8;
			}
			else if (baseSection === "0b" || baseSection === "0B") { // Binary
				base = 2;
			}
			else {
				base = 10;
			}
		}
		else if (base < 2 || base > 36) {
			throw new Error("Illegal radix " + base + ".");
		}

		base = +base;

		// Check for digits outside the range
		if (!(BigInteger.radixRegex[base].test(digits))) {
			throw new Error("Bad digit for radix " + base);
		}

		// Strip leading zeros, and convert to array
		digits = digits.replace(/^0+/, "").split("");
		if (digits.length === 0) {
			return ZERO;
		}

		// Get the sign (we know it's not zero)
		sign = (sign === "-") ? -1 : 1;

		// Optimize 10
		if (base == 10) {
			var d = [];
			while (digits.length >= BigInteger_base_log10) {
				d.push(parseInt(digits.splice(digits.length-BigInteger.base_log10, BigInteger.base_log10).join(''), 10));
			}
			d.push(parseInt(digits.join(''), 10));
			return new BigInteger(d, sign, CONSTRUCT);
		}

		// Do the conversion
		var d = ZERO;
		base = BigInteger.small[base];
		var small = BigInteger.small;
		for (var i = 0; i < digits.length; i++) {
			d = d.multiply(base).add(small[parseInt(digits[i], 36)]);
		}
		return new BigInteger(d._d, sign, CONSTRUCT);
	}
	else {
		throw new Error("Invalid BigInteger format: " + s);
	}
};

/*
	Function: add
	Add two <BigIntegers>.

	Parameters:

		n - The number to add to *this*. Will be converted to a <BigInteger>.

	Returns:

		The numbers added together.

	See Also:

		<subtract>, <multiply>, <quotient>, <next>
*/
BigInteger.prototype.add = function(n) {
	if (this._s === 0) {
		return BigInteger(n);
	}

	n = BigInteger(n);
	if (n._s === 0) {
		return this;
	}
	if (this._s !== n._s) {
		n = n.negate();
		return this.subtract(n);
	}

	var a = this._d;
	var b = n._d;
	var al = a.length;
	var bl = b.length;
	var sum = new Array(Math.max(al, bl) + 1);
	var size = Math.min(al, bl);
	var carry = 0;
	var digit;

	for (var i = 0; i < size; i++) {
		digit = a[i] + b[i] + carry;
		sum[i] = digit % BigInteger_base;
		carry = (digit / BigInteger_base) | 0;
	}
	if (bl > al) {
		a = b;
		al = bl;
	}
	for (i = size; carry && i < al; i++) {
		digit = a[i] + carry;
		sum[i] = digit % BigInteger_base;
		carry = (digit / BigInteger_base) | 0;
	}
	if (carry) {
		sum[i] = carry;
	}

	for ( ; i < al; i++) {
		sum[i] = a[i];
	}

	return new BigInteger(sum, this._s, CONSTRUCT);
};

/*
	Function: negate
	Get the additive inverse of a <BigInteger>.

	Returns:

		A <BigInteger> with the same magnatude, but with the opposite sign.

	See Also:

		<abs>
*/
BigInteger.prototype.negate = function() {
	return new BigInteger(this._d, (-this._s) | 0, CONSTRUCT);
};

/*
	Function: abs
	Get the absolute value of a <BigInteger>.

	Returns:

		A <BigInteger> with the same magnatude, but always positive (or zero).

	See Also:

		<negate>
*/
BigInteger.prototype.abs = function() {
	return (this._s < 0) ? this.negate() : this;
};

/*
	Function: subtract
	Subtract two <BigIntegers>.

	Parameters:

		n - The number to subtract from *this*. Will be converted to a <BigInteger>.

	Returns:

		The *n* subtracted from *this*.

	See Also:

		<add>, <multiply>, <quotient>, <prev>
*/
BigInteger.prototype.subtract = function(n) {
	if (this._s === 0) {
		return BigInteger(n).negate();
	}

	n = BigInteger(n);
	if (n._s === 0) {
		return this;
	}
	if (this._s !== n._s) {
		n = n.negate();
		return this.add(n);
	}

	var m = this;
	// negative - negative => -|a| - -|b| => -|a| + |b| => |b| - |a|
	if (this._s < 0) {
		m = new BigInteger(n._d, 1, CONSTRUCT);
		n = new BigInteger(this._d, 1, CONSTRUCT);
	}

	// Both are positive => a - b
	var sign = m.compareAbs(n);
	if (sign === 0) {
		return ZERO;
	}
	else if (sign < 0) {
		// swap m and n
		var t = n;
		n = m;
		m = t;
	}

	// a > b
	var a = m._d;
	var b = n._d;
	var al = a.length;
	var bl = b.length;
	var diff = new Array(al); // al >= bl since a > b
	var borrow = 0;
	var i;
	var digit;

	for (i = 0; i < bl; i++) {
		digit = a[i] - borrow - b[i];
		if (digit < 0) {
			digit += BigInteger_base;
			borrow = 1;
		}
		else {
			borrow = 0;
		}
		diff[i] = digit;
	}
	for (i = bl; i < al; i++) {
		digit = a[i] - borrow;
		if (digit < 0) {
			digit += BigInteger_base;
		}
		else {
			diff[i++] = digit;
			break;
		}
		diff[i] = digit;
	}
	for ( ; i < al; i++) {
		diff[i] = a[i];
	}

	return new BigInteger(diff, sign, CONSTRUCT);
};

(function() {
	function addOne(n, sign) {
		var a = n._d;
		var sum = a.slice();
		var carry = true;
		var i = 0;

		while (true) {
			var digit = (a[i] || 0) + 1;
			sum[i] = digit % BigInteger_base;
			if (digit <= BigInteger_base - 1) {
				break;
			}
			++i;
		}

		return new BigInteger(sum, sign, CONSTRUCT);
	}

	function subtractOne(n, sign) {
		var a = n._d;
		var sum = a.slice();
		var borrow = true;
		var i = 0;

		while (true) {
			var digit = (a[i] || 0) - 1;
			if (digit < 0) {
				sum[i] = digit + BigInteger_base;
			}
			else {
				sum[i] = digit;
				break;
			}
			++i;
		}

		return new BigInteger(sum, sign, CONSTRUCT);
	}

	/*
		Function: next
		Get the next <BigInteger> (add one).

		Returns:

			*this* + 1.

		See Also:

			<add>, <prev>
	*/
	BigInteger.prototype.next = function() {
		switch (this._s) {
		case 0:
			return ONE;
		case -1:
			return subtractOne(this, -1);
		// case 1:
		default:
			return addOne(this, 1);
		}
	};

	/*
		Function: prev
		Get the previous <BigInteger> (subtract one).

		Returns:

			*this* - 1.

		See Also:

			<next>, <subtract>
	*/
	BigInteger.prototype.prev = function() {
		switch (this._s) {
		case 0:
			return M_ONE;
		case -1:
			return addOne(this, -1);
		// case 1:
		default:
			return subtractOne(this, 1);
		}
	};
})();

/*
	Function: compareAbs
	Compare the absolute value of two <BigIntegers>.

	Calling <compareAbs> is faster than calling <abs> twice, then <compare>.

	Parameters:

		n - The number to compare to *this*. Will be converted to a <BigInteger>.

	Returns:

		-1, 0, or +1 if *|this|* is less than, equal to, or greater than *|n|*.

	See Also:

		<compare>, <abs>
*/
BigInteger.prototype.compareAbs = function(n) {
	if (this === n) {
		return 0;
	}

	if (!(n instanceof BigInteger)) {
		if (!isFinite(n)) {
			return(isNaN(n) ? n : -1);
		}
		n = BigInteger(n);
	}

	if (this._s === 0) {
		return (n._s !== 0) ? -1 : 0;
	}
	if (n._s === 0) {
		return 1;
	}

	var l = this._d.length;
	var nl = n._d.length;
	if (l < nl) {
		return -1;
	}
	else if (l > nl) {
		return 1;
	}

	var a = this._d;
	var b = n._d;
	for (var i = l-1; i >= 0; i--) {
		if (a[i] !== b[i]) {
			return a[i] < b[i] ? -1 : 1;
		}
	}

	return 0;
};

/*
	Function: compare
	Compare two <BigIntegers>.

	Parameters:

		n - The number to compare to *this*. Will be converted to a <BigInteger>.

	Returns:

		-1, 0, or +1 if *this* is less than, equal to, or greater than *n*.

	See Also:

		<compareAbs>, <isPositive>, <isNegative>, <isUnit>
*/
BigInteger.prototype.compare = function(n) {
	if (this === n) {
		return 0;
	}

	n = BigInteger(n);

	if (this._s === 0) {
		return -n._s;
	}

	if (this._s === n._s) { // both positive or both negative
		var cmp = this.compareAbs(n);
		return cmp * this._s;
	}
	else {
		return this._s;
	}
};

/*
	Function: isUnit
	Return true iff *this* is either 1 or -1.

	Returns:

		true if *this* compares equal to <BigInteger.ONE> or <BigInteger.M_ONE>.

	See Also:

		<isZero>, <isNegative>, <isPositive>, <compareAbs>, <compare>,
		<BigInteger.ONE>, <BigInteger.M_ONE>
*/
BigInteger.prototype.isUnit = function() {
	return this === ONE ||
		this === M_ONE ||
		(this._d.length === 1 && this._d[0] === 1);
};

/*
	Function: multiply
	Multiply two <BigIntegers>.

	Parameters:

		n - The number to multiply *this* by. Will be converted to a
		<BigInteger>.

	Returns:

		The numbers multiplied together.

	See Also:

		<add>, <subtract>, <quotient>, <square>
*/
BigInteger.prototype.multiply = function(n) {
	// TODO: Consider adding Karatsuba multiplication for large numbers
	if (this._s === 0) {
		return ZERO;
	}

	n = BigInteger(n);
	if (n._s === 0) {
		return ZERO;
	}
	if (this.isUnit()) {
		if (this._s < 0) {
			return n.negate();
		}
		return n;
	}
	if (n.isUnit()) {
		if (n._s < 0) {
			return this.negate();
		}
		return this;
	}
	if (this === n) {
		return this.square();
	}

	var r = (this._d.length >= n._d.length);
	var a = (r ? this : n)._d; // a will be longer than b
	var b = (r ? n : this)._d;
	var al = a.length;
	var bl = b.length;

	var pl = al + bl;
	var partial = new Array(pl);
	var i;
	for (i = 0; i < pl; i++) {
		partial[i] = 0;
	}

	for (i = 0; i < bl; i++) {
		var carry = 0;
		var bi = b[i];
		var jlimit = al + i;
		var digit;
		for (var j = i; j < jlimit; j++) {
			digit = partial[j] + bi * a[j - i] + carry;
			carry = (digit / BigInteger_base) | 0;
			partial[j] = (digit % BigInteger_base) | 0;
		}
		if (carry) {
			digit = partial[j] + carry;
			carry = (digit / BigInteger_base) | 0;
			partial[j] = digit % BigInteger_base;
		}
	}
	return new BigInteger(partial, this._s * n._s, CONSTRUCT);
};

// Multiply a BigInteger by a single-digit native number
// Assumes that this and n are >= 0
// This is not really intended to be used outside the library itself
BigInteger.prototype.multiplySingleDigit = function(n) {
	if (n === 0 || this._s === 0) {
		return ZERO;
	}
	if (n === 1) {
		return this;
	}

	var digit;
	if (this._d.length === 1) {
		digit = this._d[0] * n;
		if (digit >= BigInteger_base) {
			return new BigInteger([(digit % BigInteger_base)|0,
					(digit / BigInteger_base)|0], 1, CONSTRUCT);
		}
		return new BigInteger([digit], 1, CONSTRUCT);
	}

	if (n === 2) {
		return this.add(this);
	}
	if (this.isUnit()) {
		return new BigInteger([n], 1, CONSTRUCT);
	}

	var a = this._d;
	var al = a.length;

	var pl = al + 1;
	var partial = new Array(pl);
	for (var i = 0; i < pl; i++) {
		partial[i] = 0;
	}

	var carry = 0;
	for (var j = 0; j < al; j++) {
		digit = n * a[j] + carry;
		carry = (digit / BigInteger_base) | 0;
		partial[j] = (digit % BigInteger_base) | 0;
	}
	if (carry) {
		partial[j] = carry;
	}

	return new BigInteger(partial, 1, CONSTRUCT);
};

/*
	Function: square
	Multiply a <BigInteger> by itself.

	This is slightly faster than regular multiplication, since it removes the
	duplicated multiplcations.

	Returns:

		> this.multiply(this)

	See Also:
		<multiply>
*/
BigInteger.prototype.square = function() {
	// Normally, squaring a 10-digit number would take 100 multiplications.
	// Of these 10 are unique diagonals, of the remaining 90 (100-10), 45 are repeated.
	// This procedure saves (N*(N-1))/2 multiplications, (e.g., 45 of 100 multiplies).
	// Based on code by Gary Darby, Intellitech Systems Inc., www.DelphiForFun.org

	if (this._s === 0) {
		return ZERO;
	}
	if (this.isUnit()) {
		return ONE;
	}

	var digits = this._d;
	var length = digits.length;
	var imult1 = new Array(length + length + 1);
	var product, carry, k;
	var i;

	// Calculate diagonal
	for (i = 0; i < length; i++) {
		k = i * 2;
		product = digits[i] * digits[i];
		carry = (product / BigInteger_base) | 0;
		imult1[k] = product % BigInteger_base;
		imult1[k + 1] = carry;
	}

	// Calculate repeating part
	for (i = 0; i < length; i++) {
		carry = 0;
		k = i * 2 + 1;
		for (var j = i + 1; j < length; j++, k++) {
			product = digits[j] * digits[i] * 2 + imult1[k] + carry;
			carry = (product / BigInteger_base) | 0;
			imult1[k] = product % BigInteger_base;
		}
		k = length + i;
		var digit = carry + imult1[k];
		carry = (digit / BigInteger_base) | 0;
		imult1[k] = digit % BigInteger_base;
		imult1[k + 1] += carry;
	}

	return new BigInteger(imult1, 1, CONSTRUCT);
};

/*
	Function: quotient
	Divide two <BigIntegers> and truncate towards zero.

	<quotient> throws an exception if *n* is zero.

	Parameters:

		n - The number to divide *this* by. Will be converted to a <BigInteger>.

	Returns:

		The *this* / *n*, truncated to an integer.

	See Also:

		<add>, <subtract>, <multiply>, <divRem>, <remainder>
*/
BigInteger.prototype.quotient = function(n) {
	return this.divRem(n)[0];
};

/*
	Function: divide
	Deprecated synonym for <quotient>.
*/
BigInteger.prototype.divide = BigInteger.prototype.quotient;

/*
	Function: remainder
	Calculate the remainder of two <BigIntegers>.

	<remainder> throws an exception if *n* is zero.

	Parameters:

		n - The remainder after *this* is divided *this* by *n*. Will be
		    converted to a <BigInteger>.

	Returns:

		*this* % *n*.

	See Also:

		<divRem>, <quotient>
*/
BigInteger.prototype.remainder = function(n) {
	return this.divRem(n)[1];
};

/*
	Function: divRem
	Calculate the integer quotient and remainder of two <BigIntegers>.

	<divRem> throws an exception if *n* is zero.

	Parameters:

		n - The number to divide *this* by. Will be converted to a <BigInteger>.

	Returns:

		A two-element array containing the quotient and the remainder.

		> a.divRem(b)

		is exactly equivalent to

		> [a.quotient(b), a.remainder(b)]

		except it is faster, because they are calculated at the same time.

	See Also:

		<quotient>, <remainder>
*/
BigInteger.prototype.divRem = function(n) {
	n = BigInteger(n);
	if (n._s === 0) {
		throw new Error("Divide by zero");
	}
	if (this._s === 0) {
		return [ZERO, ZERO];
	}
	if (n._d.length === 1) {
		return this.divRemSmall(n._s * n._d[0]);
	}

	// Test for easy cases -- |n1| <= |n2|
	switch (this.compareAbs(n)) {
	case 0: // n1 == n2
		return [this._s === n._s ? ONE : M_ONE, ZERO];
	case -1: // |n1| < |n2|
		return [ZERO, this];
	}

	var sign = this._s * n._s;
	var a = n.abs();
	var b_digits = this._d;
	var b_index = b_digits.length;
	var digits = n._d.length;
	var quot = [];
	var guess;

	var part = new BigInteger([], 0, CONSTRUCT);
	part._s = 1;

	while (b_index) {
		part._d.unshift(b_digits[--b_index]);

		if (part.compareAbs(n) < 0) {
			quot.push(0);
			continue;
		}
		if (part._s === 0) {
			guess = 0;
		}
		else {
			var xlen = part._d.length, ylen = a._d.length;
			var highx = part._d[xlen-1]*BigInteger_base + part._d[xlen-2];
			var highy = a._d[ylen-1]*BigInteger_base + a._d[ylen-2];
			if (part._d.length > a._d.length) {
				// The length of part._d can either match a._d length,
				// or exceed it by one.
				highx = (highx+1)*BigInteger_base;
			}
			guess = Math.ceil(highx/highy);
		}
		do {
			var check = a.multiplySingleDigit(guess);
			if (check.compareAbs(part) <= 0) {
				break;
			}
			guess--;
		} while (guess);

		quot.push(guess);
		if (!guess) {
			continue;
		}
		var diff = part.subtract(check);
		part._d = diff._d.slice();
		if (part._d.length === 0) {
			part._s = 0;
		}
	}

	return [new BigInteger(quot.reverse(), sign, CONSTRUCT),
		   new BigInteger(part._d, this._s, CONSTRUCT)];
};

// Throws an exception if n is outside of (-BigInteger.base, -1] or
// [1, BigInteger.base).  It's not necessary to call this, since the
// other division functions will call it if they are able to.
BigInteger.prototype.divRemSmall = function(n) {
	var r;
	n = +n;
	if (n === 0) {
		throw new Error("Divide by zero");
	}

	var n_s = n < 0 ? -1 : 1;
	var sign = this._s * n_s;
	n = Math.abs(n);

	if (n < 1 || n >= BigInteger_base) {
		throw new Error("Argument out of range");
	}

	if (this._s === 0) {
		return [ZERO, ZERO];
	}

	if (n === 1 || n === -1) {
		return [(sign === 1) ? this.abs() : new BigInteger(this._d, sign, CONSTRUCT), ZERO];
	}

	// 2 <= n < BigInteger_base

	// divide a single digit by a single digit
	if (this._d.length === 1) {
		var q = new BigInteger([(this._d[0] / n) | 0], 1, CONSTRUCT);
		r = new BigInteger([(this._d[0] % n) | 0], 1, CONSTRUCT);
		if (sign < 0) {
			q = q.negate();
		}
		if (this._s < 0) {
			r = r.negate();
		}
		return [q, r];
	}

	var digits = this._d.slice();
	var quot = new Array(digits.length);
	var part = 0;
	var diff = 0;
	var i = 0;
	var guess;

	while (digits.length) {
		part = part * BigInteger_base + digits[digits.length - 1];
		if (part < n) {
			quot[i++] = 0;
			digits.pop();
			diff = BigInteger_base * diff + part;
			continue;
		}
		if (part === 0) {
			guess = 0;
		}
		else {
			guess = (part / n) | 0;
		}

		var check = n * guess;
		diff = part - check;
		quot[i++] = guess;
		if (!guess) {
			digits.pop();
			continue;
		}

		digits.pop();
		part = diff;
	}

	r = new BigInteger([diff], 1, CONSTRUCT);
	if (this._s < 0) {
		r = r.negate();
	}
	return [new BigInteger(quot.reverse(), sign, CONSTRUCT), r];
};

/*
	Function: isEven
	Return true iff *this* is divisible by two.

	Note that <BigInteger.ZERO> is even.

	Returns:

		true if *this* is even, false otherwise.

	See Also:

		<isOdd>
*/
BigInteger.prototype.isEven = function() {
	var digits = this._d;
	return this._s === 0 || digits.length === 0 || (digits[0] % 2) === 0;
};

/*
	Function: isOdd
	Return true iff *this* is not divisible by two.

	Returns:

		true if *this* is odd, false otherwise.

	See Also:

		<isEven>
*/
BigInteger.prototype.isOdd = function() {
	return !this.isEven();
};

/*
	Function: sign
	Get the sign of a <BigInteger>.

	Returns:

		* -1 if *this* < 0
		* 0 if *this* == 0
		* +1 if *this* > 0

	See Also:

		<isZero>, <isPositive>, <isNegative>, <compare>, <BigInteger.ZERO>
*/
BigInteger.prototype.sign = function() {
	return this._s;
};

/*
	Function: isPositive
	Return true iff *this* > 0.

	Returns:

		true if *this*.compare(<BigInteger.ZERO>) == 1.

	See Also:

		<sign>, <isZero>, <isNegative>, <isUnit>, <compare>, <BigInteger.ZERO>
*/
BigInteger.prototype.isPositive = function() {
	return this._s > 0;
};

/*
	Function: isNegative
	Return true iff *this* < 0.

	Returns:

		true if *this*.compare(<BigInteger.ZERO>) == -1.

	See Also:

		<sign>, <isPositive>, <isZero>, <isUnit>, <compare>, <BigInteger.ZERO>
*/
BigInteger.prototype.isNegative = function() {
	return this._s < 0;
};

/*
	Function: isZero
	Return true iff *this* == 0.

	Returns:

		true if *this*.compare(<BigInteger.ZERO>) == 0.

	See Also:

		<sign>, <isPositive>, <isNegative>, <isUnit>, <BigInteger.ZERO>
*/
BigInteger.prototype.isZero = function() {
	return this._s === 0;
};

/*
	Function: exp10
	Multiply a <BigInteger> by a power of 10.

	This is equivalent to, but faster than

	> if (n >= 0) {
	>     return this.multiply(BigInteger("1e" + n));
	> }
	> else { // n <= 0
	>     return this.quotient(BigInteger("1e" + -n));
	> }

	Parameters:

		n - The power of 10 to multiply *this* by. *n* is converted to a
		javascipt number and must be no greater than <BigInteger.MAX_EXP>
		(0x7FFFFFFF), or an exception will be thrown.

	Returns:

		*this* * (10 ** *n*), truncated to an integer if necessary.

	See Also:

		<pow>, <multiply>
*/
BigInteger.prototype.exp10 = function(n) {
	n = +n;
	if (n === 0) {
		return this;
	}
	if (Math.abs(n) > Number(MAX_EXP)) {
		throw new Error("exponent too large in BigInteger.exp10");
	}
	if (n > 0) {
		var k = new BigInteger(this._d.slice(), this._s, CONSTRUCT);

		for (; n >= BigInteger_base_log10; n -= BigInteger_base_log10) {
			k._d.unshift(0);
		}
		if (n == 0)
			return k;
		k._s = 1;
		k = k.multiplySingleDigit(Math.pow(10, n));
		return (this._s < 0 ? k.negate() : k);
	} else if (-n >= this._d.length*BigInteger_base_log10) {
		return ZERO;
	} else {
		var k = new BigInteger(this._d.slice(), this._s, CONSTRUCT);

		for (n = -n; n >= BigInteger_base_log10; n -= BigInteger_base_log10) {
			k._d.shift();
		}
		return (n == 0) ? k : k.divRemSmall(Math.pow(10, n))[0];
	}
};

/*
	Function: pow
	Raise a <BigInteger> to a power.

	In this implementation, 0**0 is 1.

	Parameters:

		n - The exponent to raise *this* by. *n* must be no greater than
		<BigInteger.MAX_EXP> (0x7FFFFFFF), or an exception will be thrown.

	Returns:

		*this* raised to the *nth* power.

	See Also:

		<modPow>
*/
BigInteger.prototype.pow = function(n) {
	if (this.isUnit()) {
		if (this._s > 0) {
			return this;
		}
		else {
			return BigInteger(n).isOdd() ? this : this.negate();
		}
	}

	n = BigInteger(n);
	if (n._s === 0) {
		return ONE;
	}
	else if (n._s < 0) {
		if (this._s === 0) {
			throw new Error("Divide by zero");
		}
		else {
			return ZERO;
		}
	}
	if (this._s === 0) {
		return ZERO;
	}
	if (n.isUnit()) {
		return this;
	}

	if (n.compareAbs(MAX_EXP) > 0) {
		throw new Error("exponent too large in BigInteger.pow");
	}
	var x = this;
	var aux = ONE;
	var two = BigInteger.small[2];

	while (n.isPositive()) {
		if (n.isOdd()) {
			aux = aux.multiply(x);
			if (n.isUnit()) {
				return aux;
			}
		}
		x = x.square();
		n = n.quotient(two);
	}

	return aux;
};

/*
	Function: modPow
	Raise a <BigInteger> to a power (mod m).

	Because it is reduced by a modulus, <modPow> is not limited by
	<BigInteger.MAX_EXP> like <pow>.

	Parameters:

		exponent - The exponent to raise *this* by. Must be positive.
		modulus - The modulus.

	Returns:

		*this* ^ *exponent* (mod *modulus*).

	See Also:

		<pow>, <mod>
*/
BigInteger.prototype.modPow = function(exponent, modulus) {
	var result = ONE;
	var base = this;

	while (exponent.isPositive()) {
		if (exponent.isOdd()) {
			result = result.multiply(base).remainder(modulus);
		}

		exponent = exponent.quotient(BigInteger.small[2]);
		if (exponent.isPositive()) {
			base = base.square().remainder(modulus);
		}
	}

	return result;
};

/*
	Function: log
	Get the natural logarithm of a <BigInteger> as a native JavaScript number.

	This is equivalent to

	> Math.log(this.toJSValue())

	but handles values outside of the native number range.

	Returns:

		log( *this* )

	See Also:

		<toJSValue>
*/
BigInteger.prototype.log = function() {
	switch (this._s) {
	case 0:	 return -Infinity;
	case -1: return NaN;
	default: // Fall through.
	}

	var l = this._d.length;

	if (l*BigInteger_base_log10 < 30) {
		return Math.log(this.valueOf());
	}

	var N = Math.ceil(30/BigInteger_base_log10);
	var firstNdigits = this._d.slice(l - N);
	return Math.log((new BigInteger(firstNdigits, 1, CONSTRUCT)).valueOf()) + (l - N) * Math.log(BigInteger_base);
};

/*
	Function: valueOf
	Convert a <BigInteger> to a native JavaScript integer.

	This is called automatically by JavaScipt to convert a <BigInteger> to a
	native value.

	Returns:

		> parseInt(this.toString(), 10)

	See Also:

		<toString>, <toJSValue>
*/
BigInteger.prototype.valueOf = function() {
	return parseInt(this.toString(), 10);
};

/*
	Function: toJSValue
	Convert a <BigInteger> to a native JavaScript integer.

	This is the same as valueOf, but more explicitly named.

	Returns:

		> parseInt(this.toString(), 10)

	See Also:

		<toString>, <valueOf>
*/
BigInteger.prototype.toJSValue = function() {
	return parseInt(this.toString(), 10);
};

var MAX_EXP = BigInteger(0x7FFFFFFF);
// Constant: MAX_EXP
// The largest exponent allowed in <pow> and <exp10> (0x7FFFFFFF or 2147483647).
BigInteger.MAX_EXP = MAX_EXP;

(function() {
	function makeUnary(fn) {
		return function(a) {
			return fn.call(BigInteger(a));
		};
	}

	function makeBinary(fn) {
		return function(a, b) {
			return fn.call(BigInteger(a), BigInteger(b));
		};
	}

	function makeTrinary(fn) {
		return function(a, b, c) {
			return fn.call(BigInteger(a), BigInteger(b), BigInteger(c));
		};
	}

	(function() {
		var i, fn;
		var unary = "toJSValue,isEven,isOdd,sign,isZero,isNegative,abs,isUnit,square,negate,isPositive,toString,next,prev,log".split(",");
		var binary = "compare,remainder,divRem,subtract,add,quotient,divide,multiply,pow,compareAbs".split(",");
		var trinary = ["modPow"];

		for (i = 0; i < unary.length; i++) {
			fn = unary[i];
			BigInteger[fn] = makeUnary(BigInteger.prototype[fn]);
		}

		for (i = 0; i < binary.length; i++) {
			fn = binary[i];
			BigInteger[fn] = makeBinary(BigInteger.prototype[fn]);
		}

		for (i = 0; i < trinary.length; i++) {
			fn = trinary[i];
			BigInteger[fn] = makeTrinary(BigInteger.prototype[fn]);
		}

		BigInteger.exp10 = function(x, n) {
			return BigInteger(x).exp10(n);
		};
	})();
})();

exports.BigInteger = BigInteger;
})(typeof exports !== 'undefined' ? exports : this);


function fnv32(data)
{
	if (null === data) data = '';
 var fnvPrime = 16777619,hash = 2166136261,ln = data.length,
	     cc,fo,so;
    
 for (var i=0;i < ln; i++) 
	{
  cc = data.charCodeAt(i);
  fo = (cc & 0xFF);
  hash = hash ^ fo;
  hash = (hash * fnvPrime) | 0;
  so = (cc >> 8);
  hash = hash ^ so;
  hash = (hash * fnvPrime) | 0;
 }
 return hash;
}

function sharedIntFilter(pdiv,pFx)
{
	var fld = pdiv.children(':first-child'),
	    ocs = pdiv.data('cs'),
					isn = pdiv.data('isn'),
	    fnom = fld.text(),
     fval = fld.next().val(),
					ncs = fnv32(fval),
					nulled = isn && (0 === fval.length),
     pval = pFx(fval),
					changed = (ocs != ncs);
 return 	{isBlob:false,n:fnom,fv:fval,pv:pval,c:changed,nnld:!nulled};
}

function sharedBigIntFilter(pdiv)
{
	var fld = pdiv.children(':first-child'),
	    ocs = pdiv.data('cs'),
					dft = pdiv.data('dft'),
					isn = pdiv.data('isn'),
	    fnom = fld.text(),
     fval = fld.next().val(),
					nulled = isn && (0 === fval.length),
					ncs = fnv32(fval),
					pval;
					
	try
 {
		pval = BigInteger.parse(fval);
	}	catch(err){pval = null;}
 return 	{isBlob:false,n:fnom,fv:fval,pv:pval,c:(ocs != ncs),nld:nulled};
}


function tiFilter(pdiv)
{
	var rv = sharedIntFilter(pdiv,parseInt);
	if ((rv.nnld && rv.c) && ((-128 > rv.pv) || (127 < rv.pv) || (rv.pv != rv.fv))) throw(msgs_.itiny.format({nf:rv.n}));
	return rv;
}

function utiFilter(pdiv)
{
	var rv = sharedIntFilter(pdiv,parseInt);
	if ((rv.nnld && rv.c) && ((0 > rv.pv) || (255 < rv.pv) || (rv.pv != rv.fv))) throw(msgs_.uitiny.format({nf:rv.n}));
	return rv;
}

function siFilter(pdiv)
{
	var rv = sharedIntFilter(pdiv,parseInt);
	if ((rv.nnld && rv.c) && ((-32768 > rv.pv) || (32767 < rv.pv) || (rv.pv != rv.fv))) throw(msgs_.ismall.format({nf:rv.n}));
	return rv
}

function usiFilter(pdiv)
{
	var rv = sharedIntFilter(pdiv,parseInt);
	if ((rv.nnld && rv.c) && ((0 > rv.pv) || (65535 < rv.pv) || (rv.pv != rv.fv))) throw(msgs_.uismall.format({nf:rv.n}));
	return rv;
}

function miFilter(pdiv)
{
 var rv = sharedIntFilter(pdiv,parseInt);
	if ((rv.nnld && rv.c) && ((-8388608 > rv.pv) || (8388607 < rv.pv) || (rv.pv != rv.fv))) throw(msgs_.imedium.format({nf:rv.n}));
	return rv;
}

function umiFilter(pdiv)
{
	var rv = sharedIntFilter(pdiv,parseInt);
	if ((rv.nnld && rv.c) && ((0 > rv.pv) || (16777215 < rv.pv) || (rv.pv != rv.fv))) throw(msgs_.uimedium.format({nf:rv.n}));
	return rv;
}

function iFilter(pdiv)
{
	var rv = sharedIntFilter(pdiv,parseInt);
	if ((rv.nnld && rv.c) && ((-2147483648 > rv.pv) || (2147483647 < rv.pv) || (rv.pv != rv.fv)))throw(msgs_.iint.format({nf:rv.n}));
	return rv;
}

function uiFilter(pdiv)
{
	var rv = sharedIntFilter(pdiv,parseInt);
	if ((rv.nnld && rv.c) && ((0 > rv.pv) || (4294967295 < rv.pv) || (rv.pv != rv.fv))) throw(msgs_.iint.format({nf:rv.n}));
	return rv;
}

function biFilter(pdiv)
{
	var rv = sharedBigIntFilter(pdiv),
	    mn = BigInteger.parse('-9223372036854775808'),
					mx = BigInteger.parse('9223372036854775807');
					
	if ((rv.nnld && rv.c) && (null === rv.pv))		throw(msgs_.ibig.format({nf:rv.n}));		
	
	var lbreach = (-1 === rv.pv.compare(mn)),
					rbreach = (1 === rv.pv.compare(mx));
					
	if ((rv.nnld && rv.c) && (lbreach || rbreach)) throw(msgs_.ibig.format({nf:rv.n}));
	return rv;
}

function ubiFilter(pdiv)
{
	var rv = sharedBigIntFilter(pdiv),
	    mn = BigInteger.parse('0'),
					mx = BigInteger.parse('18446744073709551615');
					
	if ((rv.nnld && rv.c) && (null === rv.pv))		throw(msgs_.ibig.format({nf:rv.n}));		
	
	var lbreach = (-1 === rv.pv.compare(mn)),
					rbreach = (1 === rv.pv.compare(mx));
					
	if ((rv.nnld && rv.c) && (lbreach || rbreach)) throw(msgs_.ibig.format({nf:rv.n}));
	return rv;
}

function sharedFloatFilter(pdiv,nmin,nmax)
{
	var fld = pdiv.children(':first-child'),
     ocs = pdiv.data('cs'),
					isn = pdiv.data('isn'),
	    fnom = fld.text(),
     fval = fld.next().val(),
					ncs = fnv32(fval),
					nulled = isn && (0 === fval.length),
     pval = parseFloat(fval),
					pva = Math.abs(pval),
					changed = (ocs != ncs),
					outOfRange = (nmin > pva) || (nmax < pva) || (pval != fval);
 return 	{isBlob:false,n:fnom,fv:fval,pv:pval,c:changed,nnld:!nulled,oor:outOfRange};
}

function floatFilter(pdiv)
{
 var rv = sharedFloatFilter(pdiv,1.175494351E-38,3.402823466E+38);
	if ((rv.nnld && rv.c) && rv.oor) throw(msgs_.nfloat.format({nf:rv.n}));
	return rv;
}

function ufloatFilter(pdiv)
{
 var rv = sharedFloatFilter(pdiv,1.175494351E-38,3.402823466E+38);
	if ((rv.nnld && rv.c) && ((0 > rv.pv) ||rv.oor)) throw(msgs_.nufloat.format({nf:rv.n}));
	return rv;	
}

function doubleFilter(pdiv)
{
 var rv = sharedFloatFilter(pdiv,2.2250738585072014E-308,1.7976931348623157E+308);
	if ((rv.nnld && rv.c) && rv.oor) throw(msgs_.ndouble.format({nf:rv.n}));
	return rv;
}

function udoubleFilter(pdiv)
{
 var rv = sharedFloatFilter(pdiv,2.2250738585072014E-308,1.7976931348623157E+308);
	if ((rv.nnld && rv.c) && ((0 > rv.pv) ||rv.oor)) throw(msgs_.nudouble.format({nf:rv.n}));
	return rv;	
}

function charFilter(pdiv)
{
	var fld = pdiv.children(':first-child'),
	    finp = fld.next().children(':first-child'), 
	    cbxCh = finp.next().children(':first-child').is(':checked'),
     ocs = pdiv.data('cs'),
					isn = pdiv.data('isn'),
	    fnom = fld.text(),
     fval = finp.val(),
					fvLen = fval.length,
					ncs = fnv32(fval),
					nulled = isn && cbxCh,
     changed = (ocs != ncs);
					
	return 	{isBlob:false,n:fnom,fv:fval,c:changed,nnld:!nulled};
}

function bitFilter(pdiv)
{
	var fld = pdiv.children(':first-child'),
	    finp = fld.next().children(':first-child'), 
	    cbxCh = finp.next().children(':first-child').is(':checked'),
     ocs = pdiv.data('cs'),
					isn = pdiv.data('isn'),
	    fnom = fld.text(),
     fval = finp.val(),
					fvLen = fval.length,
					ncs = fnv32(fval),
					nulled = isn && cbxCh,
     changed = (ocs != ncs);
					
	if (!nulled)				
	{
		var flag = (0 === fvLen) || (-1 === fval.search('^[0-1]+$'));
		if (flag) throw(msgs_.bitFormat);
	}
	return 	{isBlob:false,n:fnom,fv:fval,c:changed,nnld:!nulled};
}	

function binaryFilter(pdiv)
{
	var fld = pdiv.children(':first-child'),
	    finp = fld.next().children(':first-child'), 
	    cbxCh = finp.next().children(':first-child').is(':checked'),
     ocs = pdiv.data('cs'),
					isn = pdiv.data('isn'),
	    fnom = fld.text(),
     fval = finp.val(),
					fvLen = fval.length,
					ncs = fnv32(fval),
					nulled = isn && cbxCh,
     changed = (ocs != ncs);
					
	if (!nulled)				
	{
		var flag = (0 === fvLen) || (1 === 1 & fvLen) || (-1 === fval.search('^[0-9A-Fa-f]+$'));
		if (flag) throw(msgs_.binFormat);
	}
	return 	{isBlob:false,n:fnom,fv:fval,c:changed,nnld:!nulled};
}

function setEnumFilter(pdiv)
{
	var fld = pdiv.children(':first-child'),
	    finp = fld.next().children(':first-child'), 
	    cbxCh = finp.next().children(':first-child').is(':checked'),
     ocs = pdiv.data('cs'),
					isn = pdiv.data('isn'),
	    fnom = fld.text(),
     fval = finp.val(),
					fvLen = fval.length,
					ncs = fnv32(fval),
					nulled = isn && cbxCh,
     changed = (ocs != ncs);
					
	return 	{isBlob:false,n:fnom,fv:fval,c:changed,nnld:!nulled};//probably not required
}

function mariaDate(dt)
{
	dt = dt.split('/').reverse();
	var h = dt[1];
	dt[1] = dt[2];
	dt[2] = h;
	return dt.join('-');
}

function mariaDateTime(dt)
{
	dt = dt.split(' ');
	dt[0] = mariaDate(dt[0]);
	return '{dd} {tt}'.format({dd:dt[0],tt:dt[1]});
}

function dateFilter(pdiv)
{
	var fld = pdiv.children(':first-child'),
	    finp = fld.next().children(':first-child'), 
	    cbxCh = finp.next().children(':first-child').is(':checked'),
     ocs = pdiv.data('cs'),
					isn = pdiv.data('isn'),
	    fnom = fld.text(),
     fval = finp.val(),
					ncs = fnv32(fval),
					fval = mariaDate(fval),
	    fvLen = fval.length,
					nulled = isn && cbxCh,
     changed = (ocs != ncs);
	
	return 	{isBlob:false,n:fnom,fv:fval,c:changed,nnld:!nulled};
}

function dateTimeFilter(pdiv)
{
	var fld = pdiv.children(':first-child'),
	    finp = fld.next().children(':first-child'), 
	    cbxCh = finp.next().children(':first-child').is(':checked'),
     ocs = pdiv.data('cs'),
					isn = pdiv.data('isn'),
	    fnom = fld.text(),
     fval = finp.val();
					
					var ncs = fnv32(fval),
					fval = mariaDateTime(fval),
	    fvLen = fval.length,
					nulled = isn && cbxCh,
     changed = (ocs != ncs);
	
	return 	{isBlob:false,n:fnom,fv:fval,c:changed,nnld:!nulled};
}

function timeFilter(pdiv)
{
	var fld = pdiv.children(':first-child'),
	    finp = fld.next().children(':first-child'), 
	    cbxCh = finp.next().children(':first-child').is(':checked'),
     ocs = pdiv.data('cs'),
					isn = pdiv.data('isn'),
	    fnom = fld.text(),
     fval = finp.val(),
	    fvLen = fval.length,
					ncs = fnv32(fval),
					nulled = isn && cbxCh,
     changed = (ocs != ncs);
	
	return 	{isBlob:false,n:fnom,fv:fval,c:changed,nnld:!nulled};
}

function timeStampFilter(pdiv)
{
	var fld = pdiv.children(':first-child'),
	    finp = fld.next().children(':first-child'), 
	    cbxCh = finp.next().children(':first-child').is(':checked'),
     ocs = pdiv.data('cs'),
					isn = pdiv.data('isn'),
	    fnom = fld.text(),
     fval = finp.val();
					
					var ncs = fnv32(fval),
					fval = mariaDateTime(fval),
	    fvLen = fval.length,
					nulled = isn && cbxCh,
     changed = (ocs != ncs);
	
	return 	{isBlob:false,n:fnom,fv:fval,c:changed,nnld:!nulled};
}

function yearFilter(pdiv)
{
	var fld = pdiv.children(':first-child'),
	    finp = fld.next().children(':first-child'), 
	    cbxCh = finp.next().children(':first-child').is(':checked'),
     ocs = pdiv.data('cs'),
					isn = pdiv.data('isn'),
	    fnom = fld.text(),
     fval = finp.val(),
					pval = parseInt(fval),
					fvLen = fval.length,
					ncs = fnv32(fval),
					nulled = isn && cbxCh,
     changed = (ocs != ncs);
					
	if (!nulled)				
	{
		var flag = (0 === fvLen) || (pval != fval) || (1901 > pval) || (2099 < pval);
		if (flag) throw(msgs_.yearFormt);
	}
	return 	{isBlob:false,n:fnom,fv:fval,c:changed,nnld:!nulled};
}

function blobFilter(pdiv)
{
	var fld = pdiv.children(':first-child'),
	    fnom = fld.text(),
	    idr = pdiv.data('fid'),
					blob = $('#f' + idr).data('blob'),	    
					cbxCh = $('#c' + idr).is(':checked'),
					isn = pdiv.data('isn'),
					nulled = isn && cbxCh;
	return 	{isBlob:true,n:fnom,fv:blob,c:(undefined !== blob),nnld:!nulled};	    
}

function textFilter(pdiv)
{
	var fld = pdiv.children(':first-child'),
	    fnom = fld.text(),
	    ftxt = fld.next().children(':first-child'), 
	    cbxCh = ftxt.next().children(':first-child').is(':checked'),
					isn = pdiv.data('isn'),
					fval = ftxt.val(),
					nulled = isn && cbxCh;
					ftxt = ftxt.val();
	return 	{isBlob:true,n:fnom,fv:ftxt,c:(0 < ftxt.length),nnld:!nulled};	    
}

function setShow(e)
{
	e = $(e.target);
 var opt,opts = 	e.data('opts'),
	    values =  e.val(),
					checks = [],
	    out = "<div><input id='inpSelAll' type='checkbox' data-ndx='0'/><label for='inpSelAll' id='lblSelAll'>{cpt}</label></div>",
					tpl = "<div><input id='inpSCBX{ii}' type='checkbox' value='{vv}'/><label for='inpSCBX{jj}'>{oo}</label></div>";  
	
	out = out.format({cpt:msgs_.selAll});
	opts = opts.split(',');
	values = values.split(',');
	
	for(var i=0;i < opts.length;i++)	
	{
  opt = opts[i];		
		opt = opt.substr(1,opt.length - 2);
	 out += tpl.format({ii:i,jj:i,oo:opt,vv:opt});
		if (-1 < values.indexOf(opt)) checks.push(i);
	}	
	
	$('#divSEChoices').html(out);
	$('#inpSelAll').click(selUnSelAll);
	for(var i=0;i < checks.length;i++)
	{
  $('#inpSCBX{cc}'.format({cc:checks[i]})).prop('checked',true);
	}
	
	if ((0 < checks.length) && (values.length === checks.length))
	{
		$('#inpSelAll').data('ndx',1).prop('checked',true);
		$('#lblSelAll').text(msgs_.unSelAll);
	}
	
	var btns = {Apply:function(){doUseSet(e);},Close:function(){$('#diaSetEnum').dialog('close');}};
	
	$('#diaSetEnum').dialog(
	{
		title:msgs_.setSelect,
		modal:true,resizable:false,
		width:500,height:600,
		beforeClose:function(){$('divSEChoices').html('')},
		buttons:btns});
}

function selUnSelAll()
{
	var inps = $('#inpSelAll'),
	    ndx = 1 - parseInt(inps.data('ndx')),
					sel = inps.is(':checked');
					
	inps.data('ndx',ndx);				
	$('input[id^=inpSCBX]').prop('checked',sel);
}

function doUseSet(tgt)
{
 var i,out = '',
	    sopts = $('input[id^=inpSCBX]').filter(':checked');
	
	for(i=0;i < sopts.length;i++) out += ',{so}'.format({so:$(sopts[i]).val()});
	if (0 < out.length) out = out.substr(1);
	tgt.val(out);
	$('#diaSetEnum').dialog('close');
}

function enumShow(e)
{
	e = $(e.target);
 var opt,opts = 	e.data('opts'),
	    valu =  e.val(),
					chk = null,
	    out = "<div><input id='inpEmpty' type='radio' name='rabx' value=''/><label for='inpEmpty'>Empty</label></div>",
					tpl = "<div><input id='inpRABX{ii}' type='radio' value='{vv}' name='rabx'/><label for='inpRABX{jj}'>{oo}</label></div>";  
	
	opts = opts.split(',');
	
	for(var i=0;i < opts.length;i++)	
	{
  opt = opts[i];		
		opt = opt.substr(1,opt.length - 2);
	 out += tpl.format({ii:i,jj:i,oo:opt,vv:opt});
		if (valu == opt) chk = i;
	}	
	
	$('#divSEChoices').html(out);
	if (null !== chk) $('#inpRABX{cc}'.format({cc:chk})).prop('checked',true);
	
	var btns = {Apply:function(){doUseEnum(e);},Close:function(){$('#diaSetEnum').dialog('close');}};
	
	$('#diaSetEnum').dialog(
	{
		title:msgs_.enumSelect,
		modal:true,resizable:false,
		width:500,height:600,
		beforeClose:function(){$('divSEChoices').html('')},
		buttons:btns});
}

function doUseEnum(tgt)
{
	var rval = $('input[id^=inpRABX]').filter(':checked').val();
	tgt.val(rval);
	$('#diaSetEnum').dialog('close');
}

/*
 * jQuery Timepicker Addon
 * By: Trent Richardson [http://trentrichardson.com]
 *
 * Copyright 2013 Trent Richardson
 * You may use this project under MIT license.
 * http://trentrichardson.com/Impromptu/MIT-LICENSE.txt
 */

(function (factory) {
	if (typeof define === 'function' && define.amd) {
		define(['jquery', 'jquery.ui'], factory);
	} else {
		factory(jQuery);
	}
}(function ($) {

	/*
	* Lets not redefine timepicker, Prevent "Uncaught RangeError: Maximum call stack size exceeded"
	*/
	$.ui.timepicker = $.ui.timepicker || {};
	if ($.ui.timepicker.version) {
		return;
	}

	/*
	* Extend jQueryUI, get it started with our version number
	*/
	$.extend($.ui, {
		timepicker: {
			version: "@@version"
		}
	});

	/* 
	* Timepicker manager.
	* Use the singleton instance of this class, $.timepicker, to interact with the time picker.
	* Settings for (groups of) time pickers are maintained in an instance object,
	* allowing multiple different settings on the same page.
	*/
	var Timepicker = function () {
		this.regional = []; // Available regional settings, indexed by language code
		this.regional[''] = { // Default regional settings
			currentText: 'Now',
			closeText: 'Done',
			amNames: ['AM', 'A'],
			pmNames: ['PM', 'P'],
			timeFormat: 'HH:mm',
			timeSuffix: '',
			timeOnlyTitle: 'Choose Time',
			timeText: 'Time',
			hourText: 'Hour',
			minuteText: 'Minute',
			secondText: 'Second',
			millisecText: 'Millisecond',
			microsecText: 'Microsecond',
			timezoneText: 'Time Zone',
			isRTL: false
		};
		this._defaults = { // Global defaults for all the datetime picker instances
			showButtonPanel: true,
			timeOnly: false,
			timeOnlyShowDate: false,
			showHour: null,
			showMinute: null,
			showSecond: null,
			showMillisec: null,
			showMicrosec: null,
			showTimezone: null,
			showTime: true,
			stepHour: 1,
			stepMinute: 1,
			stepSecond: 1,
			stepMillisec: 1,
			stepMicrosec: 1,
			hour: 0,
			minute: 0,
			second: 0,
			millisec: 0,
			microsec: 0,
			timezone: null,
			hourMin: 0,
			minuteMin: 0,
			secondMin: 0,
			millisecMin: 0,
			microsecMin: 0,
			hourMax: 23,
			minuteMax: 59,
			secondMax: 59,
			millisecMax: 999,
			microsecMax: 999,
			minDateTime: null,
			maxDateTime: null,
			maxTime: null,
			minTime: null,
			onSelect: null,
			hourGrid: 0,
			minuteGrid: 0,
			secondGrid: 0,
			millisecGrid: 0,
			microsecGrid: 0,
			alwaysSetTime: true,
			separator: ' ',
			altFieldTimeOnly: true,
			altTimeFormat: null,
			altSeparator: null,
			altTimeSuffix: null,
			altRedirectFocus: true,
			pickerTimeFormat: null,
			pickerTimeSuffix: null,
			showTimepicker: true,
			timezoneList: null,
			addSliderAccess: false,
			sliderAccessArgs: null,
			controlType: 'slider',
			oneLine: false,
			defaultValue: null,
			parse: 'strict',
			afterInject: null
		};
		$.extend(this._defaults, this.regional['']);
	};

	$.extend(Timepicker.prototype, {
		$input: null,
		$altInput: null,
		$timeObj: null,
		inst: null,
		hour_slider: null,
		minute_slider: null,
		second_slider: null,
		millisec_slider: null,
		microsec_slider: null,
		timezone_select: null,
		maxTime: null,
		minTime: null,
		hour: 0,
		minute: 0,
		second: 0,
		millisec: 0,
		microsec: 0,
		timezone: null,
		hourMinOriginal: null,
		minuteMinOriginal: null,
		secondMinOriginal: null,
		millisecMinOriginal: null,
		microsecMinOriginal: null,
		hourMaxOriginal: null,
		minuteMaxOriginal: null,
		secondMaxOriginal: null,
		millisecMaxOriginal: null,
		microsecMaxOriginal: null,
		ampm: '',
		formattedDate: '',
		formattedTime: '',
		formattedDateTime: '',
		timezoneList: null,
		units: ['hour', 'minute', 'second', 'millisec', 'microsec'],
		support: {},
		control: null,

		/* 
		* Override the default settings for all instances of the time picker.
		* @param  {Object} settings  object - the new settings to use as defaults (anonymous object)
		* @return {Object} the manager object
		*/
		setDefaults: function (settings) {
			extendRemove(this._defaults, settings || {});
			return this;
		},

		/*
		* Create a new Timepicker instance
		*/
		_newInst: function ($input, opts) {
			var tp_inst = new Timepicker(),
				inlineSettings = {},
				fns = {},
				overrides, i;

			for (var attrName in this._defaults) {
				if (this._defaults.hasOwnProperty(attrName)) {
					var attrValue = $input.attr('time:' + attrName);
					if (attrValue) {
						try {
							inlineSettings[attrName] = eval(attrValue);
						} catch (err) {
							inlineSettings[attrName] = attrValue;
						}
					}
				}
			}

			overrides = {
				beforeShow: function (input, dp_inst) {
					if ($.isFunction(tp_inst._defaults.evnts.beforeShow)) {
						return tp_inst._defaults.evnts.beforeShow.call($input[0], input, dp_inst, tp_inst);
					}
				},
				onChangeMonthYear: function (year, month, dp_inst) {
					// Update the time as well : this prevents the time from disappearing from the $input field.
					// tp_inst._updateDateTime(dp_inst);
					if ($.isFunction(tp_inst._defaults.evnts.onChangeMonthYear)) {
						tp_inst._defaults.evnts.onChangeMonthYear.call($input[0], year, month, dp_inst, tp_inst);
					}
				},
				onClose: function (dateText, dp_inst) {
					if (tp_inst.timeDefined === true && $input.val() !== '') {
						tp_inst._updateDateTime(dp_inst);
					}
					if ($.isFunction(tp_inst._defaults.evnts.onClose)) {
						tp_inst._defaults.evnts.onClose.call($input[0], dateText, dp_inst, tp_inst);
					}
				}
			};
			for (i in overrides) {
				if (overrides.hasOwnProperty(i)) {
					fns[i] = opts[i] || this._defaults[i] || null;
				}
			}

			tp_inst._defaults = $.extend({}, this._defaults, inlineSettings, opts, overrides, {
				evnts: fns,
				timepicker: tp_inst // add timepicker as a property of datepicker: $.datepicker._get(dp_inst, 'timepicker');
			});
			tp_inst.amNames = $.map(tp_inst._defaults.amNames, function (val) {
				return val.toUpperCase();
			});
			tp_inst.pmNames = $.map(tp_inst._defaults.pmNames, function (val) {
				return val.toUpperCase();
			});

			// detect which units are supported
			tp_inst.support = detectSupport(
					tp_inst._defaults.timeFormat + 
					(tp_inst._defaults.pickerTimeFormat ? tp_inst._defaults.pickerTimeFormat : '') +
					(tp_inst._defaults.altTimeFormat ? tp_inst._defaults.altTimeFormat : ''));

			// controlType is string - key to our this._controls
			if (typeof(tp_inst._defaults.controlType) === 'string') {
				if (tp_inst._defaults.controlType === 'slider' && typeof($.ui.slider) === 'undefined') {
					tp_inst._defaults.controlType = 'select';
				}
				tp_inst.control = tp_inst._controls[tp_inst._defaults.controlType];
			}
			// controlType is an object and must implement create, options, value methods
			else {
				tp_inst.control = tp_inst._defaults.controlType;
			}

			// prep the timezone options
			var timezoneList = [-720, -660, -600, -570, -540, -480, -420, -360, -300, -270, -240, -210, -180, -120, -60,
					0, 60, 120, 180, 210, 240, 270, 300, 330, 345, 360, 390, 420, 480, 525, 540, 570, 600, 630, 660, 690, 720, 765, 780, 840];
			if (tp_inst._defaults.timezoneList !== null) {
				timezoneList = tp_inst._defaults.timezoneList;
			}
			var tzl = timezoneList.length, tzi = 0, tzv = null;
			if (tzl > 0 && typeof timezoneList[0] !== 'object') {
				for (; tzi < tzl; tzi++) {
					tzv = timezoneList[tzi];
					timezoneList[tzi] = { value: tzv, label: $.timepicker.timezoneOffsetString(tzv, tp_inst.support.iso8601) };
				}
			}
			tp_inst._defaults.timezoneList = timezoneList;

			// set the default units
			tp_inst.timezone = tp_inst._defaults.timezone !== null ? $.timepicker.timezoneOffsetNumber(tp_inst._defaults.timezone) :
							((new Date()).getTimezoneOffset() * -1);
			tp_inst.hour = tp_inst._defaults.hour < tp_inst._defaults.hourMin ? tp_inst._defaults.hourMin :
							tp_inst._defaults.hour > tp_inst._defaults.hourMax ? tp_inst._defaults.hourMax : tp_inst._defaults.hour;
			tp_inst.minute = tp_inst._defaults.minute < tp_inst._defaults.minuteMin ? tp_inst._defaults.minuteMin :
							tp_inst._defaults.minute > tp_inst._defaults.minuteMax ? tp_inst._defaults.minuteMax : tp_inst._defaults.minute;
			tp_inst.second = tp_inst._defaults.second < tp_inst._defaults.secondMin ? tp_inst._defaults.secondMin :
							tp_inst._defaults.second > tp_inst._defaults.secondMax ? tp_inst._defaults.secondMax : tp_inst._defaults.second;
			tp_inst.millisec = tp_inst._defaults.millisec < tp_inst._defaults.millisecMin ? tp_inst._defaults.millisecMin :
							tp_inst._defaults.millisec > tp_inst._defaults.millisecMax ? tp_inst._defaults.millisecMax : tp_inst._defaults.millisec;
			tp_inst.microsec = tp_inst._defaults.microsec < tp_inst._defaults.microsecMin ? tp_inst._defaults.microsecMin :
							tp_inst._defaults.microsec > tp_inst._defaults.microsecMax ? tp_inst._defaults.microsecMax : tp_inst._defaults.microsec;
			tp_inst.ampm = '';
			tp_inst.$input = $input;

			if (tp_inst._defaults.altField) {
				tp_inst.$altInput = $(tp_inst._defaults.altField);
				if (tp_inst._defaults.altRedirectFocus === true) {
					tp_inst.$altInput.css({
						cursor: 'pointer'
					}).focus(function () {
						$input.trigger("focus");
					});
				}
			}

			if (tp_inst._defaults.minDate === 0 || tp_inst._defaults.minDateTime === 0) {
				tp_inst._defaults.minDate = new Date();
			}
			if (tp_inst._defaults.maxDate === 0 || tp_inst._defaults.maxDateTime === 0) {
				tp_inst._defaults.maxDate = new Date();
			}

			// datepicker needs minDate/maxDate, timepicker needs minDateTime/maxDateTime..
			if (tp_inst._defaults.minDate !== undefined && tp_inst._defaults.minDate instanceof Date) {
				tp_inst._defaults.minDateTime = new Date(tp_inst._defaults.minDate.getTime());
			}
			if (tp_inst._defaults.minDateTime !== undefined && tp_inst._defaults.minDateTime instanceof Date) {
				tp_inst._defaults.minDate = new Date(tp_inst._defaults.minDateTime.getTime());
			}
			if (tp_inst._defaults.maxDate !== undefined && tp_inst._defaults.maxDate instanceof Date) {
				tp_inst._defaults.maxDateTime = new Date(tp_inst._defaults.maxDate.getTime());
			}
			if (tp_inst._defaults.maxDateTime !== undefined && tp_inst._defaults.maxDateTime instanceof Date) {
				tp_inst._defaults.maxDate = new Date(tp_inst._defaults.maxDateTime.getTime());
			}
			tp_inst.$input.bind('focus', function () {
				tp_inst._onFocus();
			});

			return tp_inst;
		},

		/*
		* add our sliders to the calendar
		*/
		_addTimePicker: function (dp_inst) {
			var currDT = $.trim((this.$altInput && this._defaults.altFieldTimeOnly) ? this.$input.val() + ' ' + this.$altInput.val() : this.$input.val());

			this.timeDefined = this._parseTime(currDT);
			this._limitMinMaxDateTime(dp_inst, false);
			this._injectTimePicker();
			this._afterInject();
		},

		/*
		* parse the time string from input value or _setTime
		*/
		_parseTime: function (timeString, withDate) {
			if (!this.inst) {
				this.inst = $.datepicker._getInst(this.$input[0]);
			}

			if (withDate || !this._defaults.timeOnly) {
				var dp_dateFormat = $.datepicker._get(this.inst, 'dateFormat');
				try {
					var parseRes = parseDateTimeInternal(dp_dateFormat, this._defaults.timeFormat, timeString, $.datepicker._getFormatConfig(this.inst), this._defaults);
					if (!parseRes.timeObj) {
						return false;
					}
					$.extend(this, parseRes.timeObj);
				} catch (err) {
					$.timepicker.log("Error parsing the date/time string: " + err +
									"\ndate/time string = " + timeString +
									"\ntimeFormat = " + this._defaults.timeFormat +
									"\ndateFormat = " + dp_dateFormat);
					return false;
				}
				return true;
			} else {
				var timeObj = $.datepicker.parseTime(this._defaults.timeFormat, timeString, this._defaults);
				if (!timeObj) {
					return false;
				}
				$.extend(this, timeObj);
				return true;
			}
		},

		/*
		* Handle callback option after injecting timepicker
		*/
		_afterInject: function() {
			var o = this.inst.settings;
			if ($.isFunction(o.afterInject)) {
				o.afterInject.call(this);
			}
		},

		/*
		* generate and inject html for timepicker into ui datepicker
		*/
		_injectTimePicker: function () {
			var $dp = this.inst.dpDiv,
				o = this.inst.settings,
				tp_inst = this,
				litem = '',
				uitem = '',
				show = null,
				max = {},
				gridSize = {},
				size = null,
				i = 0,
				l = 0;

			// Prevent displaying twice
			if ($dp.find("div.ui-timepicker-div").length === 0 && o.showTimepicker) {
				var noDisplay = ' ui_tpicker_unit_hide',
					html = '<div class="ui-timepicker-div' + (o.isRTL ? ' ui-timepicker-rtl' : '') + (o.oneLine && o.controlType === 'select' ? ' ui-timepicker-oneLine' : '') + '"><dl>' + '<dt class="ui_tpicker_time_label' + ((o.showTime) ? '' : noDisplay) + '">' + o.timeText + '</dt>' +
								'<dd class="ui_tpicker_time '+ ((o.showTime) ? '' : noDisplay) + '"></dd>';

				// Create the markup
				for (i = 0, l = this.units.length; i < l; i++) {
					litem = this.units[i];
					uitem = litem.substr(0, 1).toUpperCase() + litem.substr(1);
					show = o['show' + uitem] !== null ? o['show' + uitem] : this.support[litem];

					// Added by Peter Medeiros:
					// - Figure out what the hour/minute/second max should be based on the step values.
					// - Example: if stepMinute is 15, then minMax is 45.
					max[litem] = parseInt((o[litem + 'Max'] - ((o[litem + 'Max'] - o[litem + 'Min']) % o['step' + uitem])), 10);
					gridSize[litem] = 0;

					html += '<dt class="ui_tpicker_' + litem + '_label' + (show ? '' : noDisplay) + '">' + o[litem + 'Text'] + '</dt>' +
								'<dd class="ui_tpicker_' + litem + (show ? '' : noDisplay) + '"><div class="ui_tpicker_' + litem + '_slider' + (show ? '' : noDisplay) + '"></div>';

					if (show && o[litem + 'Grid'] > 0) {
						html += '<div style="padding-left: 1px"><table class="ui-tpicker-grid-label"><tr>';

						if (litem === 'hour') {
							for (var h = o[litem + 'Min']; h <= max[litem]; h += parseInt(o[litem + 'Grid'], 10)) {
								gridSize[litem]++;
								var tmph = $.datepicker.formatTime(this.support.ampm ? 'hht' : 'HH', {hour: h}, o);
								html += '<td data-for="' + litem + '">' + tmph + '</td>';
							}
						}
						else {
							for (var m = o[litem + 'Min']; m <= max[litem]; m += parseInt(o[litem + 'Grid'], 10)) {
								gridSize[litem]++;
								html += '<td data-for="' + litem + '">' + ((m < 10) ? '0' : '') + m + '</td>';
							}
						}

						html += '</tr></table></div>';
					}
					html += '</dd>';
				}
				
				// Timezone
				var showTz = o.showTimezone !== null ? o.showTimezone : this.support.timezone;
				html += '<dt class="ui_tpicker_timezone_label' + (showTz ? '' : noDisplay) + '">' + o.timezoneText + '</dt>';
				html += '<dd class="ui_tpicker_timezone' + (showTz ? '' : noDisplay) + '"></dd>';

				// Create the elements from string
				html += '</dl></div>';
				var $tp = $(html);

				// if we only want time picker...
				if (o.timeOnly === true) {
					$tp.prepend('<div class="ui-widget-header ui-helper-clearfix ui-corner-all">' + '<div class="ui-datepicker-title">' + o.timeOnlyTitle + '</div>' + '</div>');
					$dp.find('.ui-datepicker-header, .ui-datepicker-calendar').hide();
				}
				
				// add sliders, adjust grids, add events
				for (i = 0, l = tp_inst.units.length; i < l; i++) {
					litem = tp_inst.units[i];
					uitem = litem.substr(0, 1).toUpperCase() + litem.substr(1);
					show = o['show' + uitem] !== null ? o['show' + uitem] : this.support[litem];

					// add the slider
					tp_inst[litem + '_slider'] = tp_inst.control.create(tp_inst, $tp.find('.ui_tpicker_' + litem + '_slider'), litem, tp_inst[litem], o[litem + 'Min'], max[litem], o['step' + uitem]);

					// adjust the grid and add click event
					if (show && o[litem + 'Grid'] > 0) {
						size = 100 * gridSize[litem] * o[litem + 'Grid'] / (max[litem] - o[litem + 'Min']);
						$tp.find('.ui_tpicker_' + litem + ' table').css({
							width: size + "%",
							marginLeft: o.isRTL ? '0' : ((size / (-2 * gridSize[litem])) + "%"),
							marginRight: o.isRTL ? ((size / (-2 * gridSize[litem])) + "%") : '0',
							borderCollapse: 'collapse'
						}).find("td").click(function (e) {
								var $t = $(this),
									h = $t.html(),
									n = parseInt(h.replace(/[^0-9]/g), 10),
									ap = h.replace(/[^apm]/ig),
									f = $t.data('for'); // loses scope, so we use data-for

								if (f === 'hour') {
									if (ap.indexOf('p') !== -1 && n < 12) {
										n += 12;
									}
									else {
										if (ap.indexOf('a') !== -1 && n === 12) {
											n = 0;
										}
									}
								}
								
								tp_inst.control.value(tp_inst, tp_inst[f + '_slider'], litem, n);

								tp_inst._onTimeChange();
								tp_inst._onSelectHandler();
							}).css({
								cursor: 'pointer',
								width: (100 / gridSize[litem]) + '%',
								textAlign: 'center',
								overflow: 'hidden'
							});
					} // end if grid > 0
				} // end for loop

				// Add timezone options
				this.timezone_select = $tp.find('.ui_tpicker_timezone').append('<select></select>').find("select");
				$.fn.append.apply(this.timezone_select,
				$.map(o.timezoneList, function (val, idx) {
					return $("<option />").val(typeof val === "object" ? val.value : val).text(typeof val === "object" ? val.label : val);
				}));
				if (typeof(this.timezone) !== "undefined" && this.timezone !== null && this.timezone !== "") {
					var local_timezone = (new Date(this.inst.selectedYear, this.inst.selectedMonth, this.inst.selectedDay, 12)).getTimezoneOffset() * -1;
					if (local_timezone === this.timezone) {
						selectLocalTimezone(tp_inst);
					} else {
						this.timezone_select.val(this.timezone);
					}
				} else {
					if (typeof(this.hour) !== "undefined" && this.hour !== null && this.hour !== "") {
						this.timezone_select.val(o.timezone);
					} else {
						selectLocalTimezone(tp_inst);
					}
				}
				this.timezone_select.change(function () {
					tp_inst._onTimeChange();
					tp_inst._onSelectHandler();
					tp_inst._afterInject();
				});
				// End timezone options
				
				// inject timepicker into datepicker
				var $buttonPanel = $dp.find('.ui-datepicker-buttonpane');
				if ($buttonPanel.length) {
					$buttonPanel.before($tp);
				} else {
					$dp.append($tp);
				}

				this.$timeObj = $tp.find('.ui_tpicker_time');

				if (this.inst !== null) {
					var timeDefined = this.timeDefined;
					this._onTimeChange();
					this.timeDefined = timeDefined;
				}

				// slideAccess integration: http://trentrichardson.com/2011/11/11/jquery-ui-sliders-and-touch-accessibility/
				if (this._defaults.addSliderAccess) {
					var sliderAccessArgs = this._defaults.sliderAccessArgs,
						rtl = this._defaults.isRTL;
					sliderAccessArgs.isRTL = rtl;
						
					setTimeout(function () { // fix for inline mode
						if ($tp.find('.ui-slider-access').length === 0) {
							$tp.find('.ui-slider:visible').sliderAccess(sliderAccessArgs);

							// fix any grids since sliders are shorter
							var sliderAccessWidth = $tp.find('.ui-slider-access:eq(0)').outerWidth(true);
							if (sliderAccessWidth) {
								$tp.find('table:visible').each(function () {
									var $g = $(this),
										oldWidth = $g.outerWidth(),
										oldMarginLeft = $g.css(rtl ? 'marginRight' : 'marginLeft').toString().replace('%', ''),
										newWidth = oldWidth - sliderAccessWidth,
										newMarginLeft = ((oldMarginLeft * newWidth) / oldWidth) + '%',
										css = { width: newWidth, marginRight: 0, marginLeft: 0 };
									css[rtl ? 'marginRight' : 'marginLeft'] = newMarginLeft;
									$g.css(css);
								});
							}
						}
					}, 10);
				}
				// end slideAccess integration

				tp_inst._limitMinMaxDateTime(this.inst, true);
			}
		},

		/*
		* This function tries to limit the ability to go outside the
		* min/max date range
		*/
		_limitMinMaxDateTime: function (dp_inst, adjustSliders) {
			var o = this._defaults,
				dp_date = new Date(dp_inst.selectedYear, dp_inst.selectedMonth, dp_inst.selectedDay);

			if (!this._defaults.showTimepicker) {
				return;
			} // No time so nothing to check here

			if ($.datepicker._get(dp_inst, 'minDateTime') !== null && $.datepicker._get(dp_inst, 'minDateTime') !== undefined && dp_date) {
				var minDateTime = $.datepicker._get(dp_inst, 'minDateTime'),
					minDateTimeDate = new Date(minDateTime.getFullYear(), minDateTime.getMonth(), minDateTime.getDate(), 0, 0, 0, 0);

				if (this.hourMinOriginal === null || this.minuteMinOriginal === null || this.secondMinOriginal === null || this.millisecMinOriginal === null || this.microsecMinOriginal === null) {
					this.hourMinOriginal = o.hourMin;
					this.minuteMinOriginal = o.minuteMin;
					this.secondMinOriginal = o.secondMin;
					this.millisecMinOriginal = o.millisecMin;
					this.microsecMinOriginal = o.microsecMin;
				}

				if (dp_inst.settings.timeOnly || minDateTimeDate.getTime() === dp_date.getTime()) {
					this._defaults.hourMin = minDateTime.getHours();
					if (this.hour <= this._defaults.hourMin) {
						this.hour = this._defaults.hourMin;
						this._defaults.minuteMin = minDateTime.getMinutes();
						if (this.minute <= this._defaults.minuteMin) {
							this.minute = this._defaults.minuteMin;
							this._defaults.secondMin = minDateTime.getSeconds();
							if (this.second <= this._defaults.secondMin) {
								this.second = this._defaults.secondMin;
								this._defaults.millisecMin = minDateTime.getMilliseconds();
								if (this.millisec <= this._defaults.millisecMin) {
									this.millisec = this._defaults.millisecMin;
									this._defaults.microsecMin = minDateTime.getMicroseconds();
								} else {
									if (this.microsec < this._defaults.microsecMin) {
										this.microsec = this._defaults.microsecMin;
									}
									this._defaults.microsecMin = this.microsecMinOriginal;
								}
							} else {
								this._defaults.millisecMin = this.millisecMinOriginal;
								this._defaults.microsecMin = this.microsecMinOriginal;
							}
						} else {
							this._defaults.secondMin = this.secondMinOriginal;
							this._defaults.millisecMin = this.millisecMinOriginal;
							this._defaults.microsecMin = this.microsecMinOriginal;
						}
					} else {
						this._defaults.minuteMin = this.minuteMinOriginal;
						this._defaults.secondMin = this.secondMinOriginal;
						this._defaults.millisecMin = this.millisecMinOriginal;
						this._defaults.microsecMin = this.microsecMinOriginal;
					}
				} else {
					this._defaults.hourMin = this.hourMinOriginal;
					this._defaults.minuteMin = this.minuteMinOriginal;
					this._defaults.secondMin = this.secondMinOriginal;
					this._defaults.millisecMin = this.millisecMinOriginal;
					this._defaults.microsecMin = this.microsecMinOriginal;
				}
			}

			if ($.datepicker._get(dp_inst, 'maxDateTime') !== null && $.datepicker._get(dp_inst, 'maxDateTime') !== undefined && dp_date) {
				var maxDateTime = $.datepicker._get(dp_inst, 'maxDateTime'),
					maxDateTimeDate = new Date(maxDateTime.getFullYear(), maxDateTime.getMonth(), maxDateTime.getDate(), 0, 0, 0, 0);

				if (this.hourMaxOriginal === null || this.minuteMaxOriginal === null || this.secondMaxOriginal === null || this.millisecMaxOriginal === null) {
					this.hourMaxOriginal = o.hourMax;
					this.minuteMaxOriginal = o.minuteMax;
					this.secondMaxOriginal = o.secondMax;
					this.millisecMaxOriginal = o.millisecMax;
					this.microsecMaxOriginal = o.microsecMax;
				}

				if (dp_inst.settings.timeOnly || maxDateTimeDate.getTime() === dp_date.getTime()) {
					this._defaults.hourMax = maxDateTime.getHours();
					if (this.hour >= this._defaults.hourMax) {
						this.hour = this._defaults.hourMax;
						this._defaults.minuteMax = maxDateTime.getMinutes();
						if (this.minute >= this._defaults.minuteMax) {
							this.minute = this._defaults.minuteMax;
							this._defaults.secondMax = maxDateTime.getSeconds();
							if (this.second >= this._defaults.secondMax) {
								this.second = this._defaults.secondMax;
								this._defaults.millisecMax = maxDateTime.getMilliseconds();
								if (this.millisec >= this._defaults.millisecMax) {
									this.millisec = this._defaults.millisecMax;
									this._defaults.microsecMax = maxDateTime.getMicroseconds();
								} else {
									if (this.microsec > this._defaults.microsecMax) {
										this.microsec = this._defaults.microsecMax;
									}
									this._defaults.microsecMax = this.microsecMaxOriginal;
								}
							} else {
								this._defaults.millisecMax = this.millisecMaxOriginal;
								this._defaults.microsecMax = this.microsecMaxOriginal;
							}
						} else {
							this._defaults.secondMax = this.secondMaxOriginal;
							this._defaults.millisecMax = this.millisecMaxOriginal;
							this._defaults.microsecMax = this.microsecMaxOriginal;
						}
					} else {
						this._defaults.minuteMax = this.minuteMaxOriginal;
						this._defaults.secondMax = this.secondMaxOriginal;
						this._defaults.millisecMax = this.millisecMaxOriginal;
						this._defaults.microsecMax = this.microsecMaxOriginal;
					}
				} else {
					this._defaults.hourMax = this.hourMaxOriginal;
					this._defaults.minuteMax = this.minuteMaxOriginal;
					this._defaults.secondMax = this.secondMaxOriginal;
					this._defaults.millisecMax = this.millisecMaxOriginal;
					this._defaults.microsecMax = this.microsecMaxOriginal;
				}
			}

			if (dp_inst.settings.minTime!==null) {				
				var tempMinTime=new Date("01/01/1970 " + dp_inst.settings.minTime);				
				if (this.hour<tempMinTime.getHours()) {
					this.hour=this._defaults.hourMin=tempMinTime.getHours();
					this.minute=this._defaults.minuteMin=tempMinTime.getMinutes();							
				} else if (this.hour===tempMinTime.getHours() && this.minute<tempMinTime.getMinutes()) {
					this.minute=this._defaults.minuteMin=tempMinTime.getMinutes();
				} else {						
					if (this._defaults.hourMin<tempMinTime.getHours()) {
						this._defaults.hourMin=tempMinTime.getHours();
						this._defaults.minuteMin=tempMinTime.getMinutes();					
					} else if (this._defaults.hourMin===tempMinTime.getHours()===this.hour && this._defaults.minuteMin<tempMinTime.getMinutes()) {
						this._defaults.minuteMin=tempMinTime.getMinutes();						
					} else {
						this._defaults.minuteMin=0;
					}
				}				
			}
			
			if (dp_inst.settings.maxTime!==null) {				
				var tempMaxTime=new Date("01/01/1970 " + dp_inst.settings.maxTime);
				if (this.hour>tempMaxTime.getHours()) {
					this.hour=this._defaults.hourMax=tempMaxTime.getHours();						
					this.minute=this._defaults.minuteMax=tempMaxTime.getMinutes();
				} else if (this.hour===tempMaxTime.getHours() && this.minute>tempMaxTime.getMinutes()) {							
					this.minute=this._defaults.minuteMax=tempMaxTime.getMinutes();						
				} else {
					if (this._defaults.hourMax>tempMaxTime.getHours()) {
						this._defaults.hourMax=tempMaxTime.getHours();
						this._defaults.minuteMax=tempMaxTime.getMinutes();					
					} else if (this._defaults.hourMax===tempMaxTime.getHours()===this.hour && this._defaults.minuteMax>tempMaxTime.getMinutes()) {
						this._defaults.minuteMax=tempMaxTime.getMinutes();						
					} else {
						this._defaults.minuteMax=59;
					}
				}						
			}
			
			if (adjustSliders !== undefined && adjustSliders === true) {
				var hourMax = parseInt((this._defaults.hourMax - ((this._defaults.hourMax - this._defaults.hourMin) % this._defaults.stepHour)), 10),
					minMax = parseInt((this._defaults.minuteMax - ((this._defaults.minuteMax - this._defaults.minuteMin) % this._defaults.stepMinute)), 10),
					secMax = parseInt((this._defaults.secondMax - ((this._defaults.secondMax - this._defaults.secondMin) % this._defaults.stepSecond)), 10),
					millisecMax = parseInt((this._defaults.millisecMax - ((this._defaults.millisecMax - this._defaults.millisecMin) % this._defaults.stepMillisec)), 10),
					microsecMax = parseInt((this._defaults.microsecMax - ((this._defaults.microsecMax - this._defaults.microsecMin) % this._defaults.stepMicrosec)), 10);

				if (this.hour_slider) {
					this.control.options(this, this.hour_slider, 'hour', { min: this._defaults.hourMin, max: hourMax, step: this._defaults.stepHour });
					this.control.value(this, this.hour_slider, 'hour', this.hour - (this.hour % this._defaults.stepHour));
				}
				if (this.minute_slider) {
					this.control.options(this, this.minute_slider, 'minute', { min: this._defaults.minuteMin, max: minMax, step: this._defaults.stepMinute });
					this.control.value(this, this.minute_slider, 'minute', this.minute - (this.minute % this._defaults.stepMinute));
				}
				if (this.second_slider) {
					this.control.options(this, this.second_slider, 'second', { min: this._defaults.secondMin, max: secMax, step: this._defaults.stepSecond });
					this.control.value(this, this.second_slider, 'second', this.second - (this.second % this._defaults.stepSecond));
				}
				if (this.millisec_slider) {
					this.control.options(this, this.millisec_slider, 'millisec', { min: this._defaults.millisecMin, max: millisecMax, step: this._defaults.stepMillisec });
					this.control.value(this, this.millisec_slider, 'millisec', this.millisec - (this.millisec % this._defaults.stepMillisec));
				}
				if (this.microsec_slider) {
					this.control.options(this, this.microsec_slider, 'microsec', { min: this._defaults.microsecMin, max: microsecMax, step: this._defaults.stepMicrosec });
					this.control.value(this, this.microsec_slider, 'microsec', this.microsec - (this.microsec % this._defaults.stepMicrosec));
				}
			}

		},

		/*
		* when a slider moves, set the internal time...
		* on time change is also called when the time is updated in the text field
		*/
		_onTimeChange: function () {
			if (!this._defaults.showTimepicker) {
                                return;
			}
			var hour = (this.hour_slider) ? this.control.value(this, this.hour_slider, 'hour') : false,
				minute = (this.minute_slider) ? this.control.value(this, this.minute_slider, 'minute') : false,
				second = (this.second_slider) ? this.control.value(this, this.second_slider, 'second') : false,
				millisec = (this.millisec_slider) ? this.control.value(this, this.millisec_slider, 'millisec') : false,
				microsec = (this.microsec_slider) ? this.control.value(this, this.microsec_slider, 'microsec') : false,
				timezone = (this.timezone_select) ? this.timezone_select.val() : false,
				o = this._defaults,
				pickerTimeFormat = o.pickerTimeFormat || o.timeFormat,
				pickerTimeSuffix = o.pickerTimeSuffix || o.timeSuffix;

			if (typeof(hour) === 'object') {
				hour = false;
			}
			if (typeof(minute) === 'object') {
				minute = false;
			}
			if (typeof(second) === 'object') {
				second = false;
			}
			if (typeof(millisec) === 'object') {
				millisec = false;
			}
			if (typeof(microsec) === 'object') {
				microsec = false;
			}
			if (typeof(timezone) === 'object') {
				timezone = false;
			}

			if (hour !== false) {
				hour = parseInt(hour, 10);
			}
			if (minute !== false) {
				minute = parseInt(minute, 10);
			}
			if (second !== false) {
				second = parseInt(second, 10);
			}
			if (millisec !== false) {
				millisec = parseInt(millisec, 10);
			}
			if (microsec !== false) {
				microsec = parseInt(microsec, 10);
			}
			if (timezone !== false) {
				timezone = timezone.toString();
			}

			var ampm = o[hour < 12 ? 'amNames' : 'pmNames'][0];

			// If the update was done in the input field, the input field should not be updated.
			// If the update was done using the sliders, update the input field.
			var hasChanged = (
						hour !== parseInt(this.hour,10) || // sliders should all be numeric
						minute !== parseInt(this.minute,10) || 
						second !== parseInt(this.second,10) || 
						millisec !== parseInt(this.millisec,10) || 
						microsec !== parseInt(this.microsec,10) || 
						(this.ampm.length > 0 && (hour < 12) !== ($.inArray(this.ampm.toUpperCase(), this.amNames) !== -1)) || 
						(this.timezone !== null && timezone !== this.timezone.toString()) // could be numeric or "EST" format, so use toString()
					);

			if (hasChanged) {

				if (hour !== false) {
					this.hour = hour;
				}
				if (minute !== false) {
					this.minute = minute;
				}
				if (second !== false) {
					this.second = second;
				}
				if (millisec !== false) {
					this.millisec = millisec;
				}
				if (microsec !== false) {
					this.microsec = microsec;
				}
				if (timezone !== false) {
					this.timezone = timezone;
				}

				if (!this.inst) {
					this.inst = $.datepicker._getInst(this.$input[0]);
				}

				this._limitMinMaxDateTime(this.inst, true);
			}
			if (this.support.ampm) {
				this.ampm = ampm;
			}

			// Updates the time within the timepicker
			this.formattedTime = $.datepicker.formatTime(o.timeFormat, this, o);
			if (this.$timeObj) {
				if (pickerTimeFormat === o.timeFormat) {
					this.$timeObj.text(this.formattedTime + pickerTimeSuffix);
				}
				else {
					this.$timeObj.text($.datepicker.formatTime(pickerTimeFormat, this, o) + pickerTimeSuffix);
				}
			}

			this.timeDefined = true;
			if (hasChanged) {
				this._updateDateTime();
				//this.$input.focus(); // may automatically open the picker on setDate
			}
		},

		/*
		* call custom onSelect.
		* bind to sliders slidestop, and grid click.
		*/
		_onSelectHandler: function () {
			var onSelect = this._defaults.onSelect || this.inst.settings.onSelect;
			var inputEl = this.$input ? this.$input[0] : null;
			if (onSelect && inputEl) {
				onSelect.apply(inputEl, [this.formattedDateTime, this]);
			}
		},

		/*
		* update our input with the new date time..
		*/
		_updateDateTime: function (dp_inst) {
			dp_inst = this.inst || dp_inst;
			var dtTmp = (dp_inst.currentYear > 0? 
							new Date(dp_inst.currentYear, dp_inst.currentMonth, dp_inst.currentDay) : 
							new Date(dp_inst.selectedYear, dp_inst.selectedMonth, dp_inst.selectedDay)),
				dt = $.datepicker._daylightSavingAdjust(dtTmp),
				//dt = $.datepicker._daylightSavingAdjust(new Date(dp_inst.selectedYear, dp_inst.selectedMonth, dp_inst.selectedDay)),
				//dt = $.datepicker._daylightSavingAdjust(new Date(dp_inst.currentYear, dp_inst.currentMonth, dp_inst.currentDay)),
				dateFmt = $.datepicker._get(dp_inst, 'dateFormat'),
				formatCfg = $.datepicker._getFormatConfig(dp_inst),
				timeAvailable = dt !== null && this.timeDefined;
			this.formattedDate = $.datepicker.formatDate(dateFmt, (dt === null ? new Date() : dt), formatCfg);
			var formattedDateTime = this.formattedDate;
			
			// if a slider was changed but datepicker doesn't have a value yet, set it
			if (dp_inst.lastVal === "") {
                dp_inst.currentYear = dp_inst.selectedYear;
                dp_inst.currentMonth = dp_inst.selectedMonth;
                dp_inst.currentDay = dp_inst.selectedDay;
            }

			/*
			* remove following lines to force every changes in date picker to change the input value
			* Bug descriptions: when an input field has a default value, and click on the field to pop up the date picker. 
			* If the user manually empty the value in the input field, the date picker will never change selected value.
			*/
			//if (dp_inst.lastVal !== undefined && (dp_inst.lastVal.length > 0 && this.$input.val().length === 0)) {
			//	return;
			//}

			if (this._defaults.timeOnly === true && this._defaults.timeOnlyShowDate === false) {
				formattedDateTime = this.formattedTime;
			} else if ((this._defaults.timeOnly !== true && (this._defaults.alwaysSetTime || timeAvailable)) || (this._defaults.timeOnly === true && this._defaults.timeOnlyShowDate === true)) {
				formattedDateTime += this._defaults.separator + this.formattedTime + this._defaults.timeSuffix;
			}

			this.formattedDateTime = formattedDateTime;

			if (!this._defaults.showTimepicker) {
				this.$input.val(this.formattedDate);
			} else if (this.$altInput && this._defaults.timeOnly === false && this._defaults.altFieldTimeOnly === true) {
				this.$altInput.val(this.formattedTime);
				this.$input.val(this.formattedDate);
			} else if (this.$altInput) {
				this.$input.val(formattedDateTime);
				var altFormattedDateTime = '',
					altSeparator = this._defaults.altSeparator !== null ? this._defaults.altSeparator : this._defaults.separator,
					altTimeSuffix = this._defaults.altTimeSuffix !== null ? this._defaults.altTimeSuffix : this._defaults.timeSuffix;
				
				if (!this._defaults.timeOnly) {
					if (this._defaults.altFormat) {
						altFormattedDateTime = $.datepicker.formatDate(this._defaults.altFormat, (dt === null ? new Date() : dt), formatCfg);
					}
					else {
						altFormattedDateTime = this.formattedDate;
					}

					if (altFormattedDateTime) {
						altFormattedDateTime += altSeparator;
					}
				}

				if (this._defaults.altTimeFormat !== null) {
					altFormattedDateTime += $.datepicker.formatTime(this._defaults.altTimeFormat, this, this._defaults) + altTimeSuffix;
				}
				else {
					altFormattedDateTime += this.formattedTime + altTimeSuffix;
				}
				this.$altInput.val(altFormattedDateTime);
			} else {
				this.$input.val(formattedDateTime);
			}

			this.$input.trigger("change");
		},

		_onFocus: function () {
			if (!this.$input.val() && this._defaults.defaultValue) {
				this.$input.val(this._defaults.defaultValue);
				var inst = $.datepicker._getInst(this.$input.get(0)),
					tp_inst = $.datepicker._get(inst, 'timepicker');
				if (tp_inst) {
					if (tp_inst._defaults.timeOnly && (inst.input.val() !== inst.lastVal)) {
						try {
							$.datepicker._updateDatepicker(inst);
						} catch (err) {
							$.timepicker.log(err);
						}
					}
				}
			}
		},

		/*
		* Small abstraction to control types
		* We can add more, just be sure to follow the pattern: create, options, value
		*/
		_controls: {
			// slider methods
			slider: {
				create: function (tp_inst, obj, unit, val, min, max, step) {
					var rtl = tp_inst._defaults.isRTL; // if rtl go -60->0 instead of 0->60
					return obj.prop('slide', null).slider({
						orientation: "horizontal",
						value: rtl ? val * -1 : val,
						min: rtl ? max * -1 : min,
						max: rtl ? min * -1 : max,
						step: step,
						slide: function (event, ui) {
							tp_inst.control.value(tp_inst, $(this), unit, rtl ? ui.value * -1 : ui.value);
							tp_inst._onTimeChange();
						},
						stop: function (event, ui) {
							tp_inst._onSelectHandler();
						}
					});	
				},
				options: function (tp_inst, obj, unit, opts, val) {
					if (tp_inst._defaults.isRTL) {
						if (typeof(opts) === 'string') {
							if (opts === 'min' || opts === 'max') {
								if (val !== undefined) {
									return obj.slider(opts, val * -1);
								}
								return Math.abs(obj.slider(opts));
							}
							return obj.slider(opts);
						}
						var min = opts.min, 
							max = opts.max;
						opts.min = opts.max = null;
						if (min !== undefined) {
							opts.max = min * -1;
						}
						if (max !== undefined) {
							opts.min = max * -1;
						}
						return obj.slider(opts);
					}
					if (typeof(opts) === 'string' && val !== undefined) {
						return obj.slider(opts, val);
					}
					return obj.slider(opts);
				},
				value: function (tp_inst, obj, unit, val) {
					if (tp_inst._defaults.isRTL) {
						if (val !== undefined) {
							return obj.slider('value', val * -1);
						}
						return Math.abs(obj.slider('value'));
					}
					if (val !== undefined) {
						return obj.slider('value', val);
					}
					return obj.slider('value');
				}
			},
			// select methods
			select: {
				create: function (tp_inst, obj, unit, val, min, max, step) {
					var sel = '<select class="ui-timepicker-select ui-state-default ui-corner-all" data-unit="' + unit + '" data-min="' + min + '" data-max="' + max + '" data-step="' + step + '">',
						format = tp_inst._defaults.pickerTimeFormat || tp_inst._defaults.timeFormat;

					for (var i = min; i <= max; i += step) {
						sel += '<option value="' + i + '"' + (i === val ? ' selected' : '') + '>';
						if (unit === 'hour') {
							sel += $.datepicker.formatTime($.trim(format.replace(/[^ht ]/ig, '')), {hour: i}, tp_inst._defaults);
						}
						else if (unit === 'millisec' || unit === 'microsec' || i >= 10) { sel += i; }
						else {sel += '0' + i.toString(); }
						sel += '</option>';
					}
					sel += '</select>';

					obj.children('select').remove();

					$(sel).appendTo(obj).change(function (e) {
						tp_inst._onTimeChange();
						tp_inst._onSelectHandler();
						tp_inst._afterInject();
					});

					return obj;
				},
				options: function (tp_inst, obj, unit, opts, val) {
					var o = {},
						$t = obj.children('select');
					if (typeof(opts) === 'string') {
						if (val === undefined) {
							return $t.data(opts);
						}
						o[opts] = val;	
					}
					else { o = opts; }
					return tp_inst.control.create(tp_inst, obj, $t.data('unit'), $t.val(), o.min>=0 ? o.min : $t.data('min'), o.max || $t.data('max'), o.step || $t.data('step'));
				},
				value: function (tp_inst, obj, unit, val) {
					var $t = obj.children('select');
					if (val !== undefined) {
						return $t.val(val);
					}
					return $t.val();
				}
			}
		} // end _controls

	});

	$.fn.extend({
		/*
		* shorthand just to use timepicker.
		*/
		timepicker: function (o) {
			o = o || {};
			var tmp_args = Array.prototype.slice.call(arguments);

			if (typeof o === 'object') {
				tmp_args[0] = $.extend(o, {
					timeOnly: true
				});
			}

			return $(this).each(function () {
				$.fn.datetimepicker.apply($(this), tmp_args);
			});
		},

		/*
		* extend timepicker to datepicker
		*/
		datetimepicker: function (o) {
			o = o || {};
			var tmp_args = arguments;

			if (typeof(o) === 'string') {
				if (o === 'getDate'  || (o === 'option' && tmp_args.length === 2 && typeof (tmp_args[1]) === 'string')) {
					return $.fn.datepicker.apply($(this[0]), tmp_args);
				} else {
					return this.each(function () {
						var $t = $(this);
						$t.datepicker.apply($t, tmp_args);
					});
				}
			} else {
				return this.each(function () {
					var $t = $(this);
					$t.datepicker($.timepicker._newInst($t, o)._defaults);
				});
			}
		}
	});

	/*
	* Public Utility to parse date and time
	*/
	$.datepicker.parseDateTime = function (dateFormat, timeFormat, dateTimeString, dateSettings, timeSettings) {
		var parseRes = parseDateTimeInternal(dateFormat, timeFormat, dateTimeString, dateSettings, timeSettings);
		if (parseRes.timeObj) {
			var t = parseRes.timeObj;
			parseRes.date.setHours(t.hour, t.minute, t.second, t.millisec);
			parseRes.date.setMicroseconds(t.microsec);
		}

		return parseRes.date;
	};

	/*
	* Public utility to parse time
	*/
	$.datepicker.parseTime = function (timeFormat, timeString, options) {
		var o = extendRemove(extendRemove({}, $.timepicker._defaults), options || {}),
			iso8601 = (timeFormat.replace(/\'.*?\'/g, '').indexOf('Z') !== -1);

		// Strict parse requires the timeString to match the timeFormat exactly
		var strictParse = function (f, s, o) {

			// pattern for standard and localized AM/PM markers
			var getPatternAmpm = function (amNames, pmNames) {
				var markers = [];
				if (amNames) {
					$.merge(markers, amNames);
				}
				if (pmNames) {
					$.merge(markers, pmNames);
				}
				markers = $.map(markers, function (val) {
					return val.replace(/[.*+?|()\[\]{}\\]/g, '\\$&');
				});
				return '(' + markers.join('|') + ')?';
			};

			// figure out position of time elements.. cause js cant do named captures
			var getFormatPositions = function (timeFormat) {
				var finds = timeFormat.toLowerCase().match(/(h{1,2}|m{1,2}|s{1,2}|l{1}|c{1}|t{1,2}|z|'.*?')/g),
					orders = {
						h: -1,
						m: -1,
						s: -1,
						l: -1,
						c: -1,
						t: -1,
						z: -1
					};

				if (finds) {
					for (var i = 0; i < finds.length; i++) {
						if (orders[finds[i].toString().charAt(0)] === -1) {
							orders[finds[i].toString().charAt(0)] = i + 1;
						}
					}
				}
				return orders;
			};

			var regstr = '^' + f.toString()
					.replace(/([hH]{1,2}|mm?|ss?|[tT]{1,2}|[zZ]|[lc]|'.*?')/g, function (match) {
							var ml = match.length;
							switch (match.charAt(0).toLowerCase()) {
							case 'h':
								return ml === 1 ? '(\\d?\\d)' : '(\\d{' + ml + '})';
							case 'm':
								return ml === 1 ? '(\\d?\\d)' : '(\\d{' + ml + '})';
							case 's':
								return ml === 1 ? '(\\d?\\d)' : '(\\d{' + ml + '})';
							case 'l':
								return '(\\d?\\d?\\d)';
							case 'c':
								return '(\\d?\\d?\\d)';
							case 'z':
								return '(z|[-+]\\d\\d:?\\d\\d|\\S+)?';
							case 't':
								return getPatternAmpm(o.amNames, o.pmNames);
							default:    // literal escaped in quotes
								return '(' + match.replace(/\'/g, "").replace(/(\.|\$|\^|\\|\/|\(|\)|\[|\]|\?|\+|\*)/g, function (m) { return "\\" + m; }) + ')?';
							}
						})
					.replace(/\s/g, '\\s?') +
					o.timeSuffix + '$',
				order = getFormatPositions(f),
				ampm = '',
				treg;

			treg = s.match(new RegExp(regstr, 'i'));

			var resTime = {
				hour: 0,
				minute: 0,
				second: 0,
				millisec: 0,
				microsec: 0
			};

			if (treg) {
				if (order.t !== -1) {
					if (treg[order.t] === undefined || treg[order.t].length === 0) {
						ampm = '';
						resTime.ampm = '';
					} else {
						ampm = $.inArray(treg[order.t].toUpperCase(), $.map(o.amNames, function (x,i) { return x.toUpperCase(); })) !== -1 ? 'AM' : 'PM';
						resTime.ampm = o[ampm === 'AM' ? 'amNames' : 'pmNames'][0];
					}
				}

				if (order.h !== -1) {
					if (ampm === 'AM' && treg[order.h] === '12') {
						resTime.hour = 0; // 12am = 0 hour
					} else {
						if (ampm === 'PM' && treg[order.h] !== '12') {
							resTime.hour = parseInt(treg[order.h], 10) + 12; // 12pm = 12 hour, any other pm = hour + 12
						} else {
							resTime.hour = Number(treg[order.h]);
						}
					}
				}

				if (order.m !== -1) {
					resTime.minute = Number(treg[order.m]);
				}
				if (order.s !== -1) {
					resTime.second = Number(treg[order.s]);
				}
				if (order.l !== -1) {
					resTime.millisec = Number(treg[order.l]);
				}
				if (order.c !== -1) {
					resTime.microsec = Number(treg[order.c]);
				}
				if (order.z !== -1 && treg[order.z] !== undefined) {
					resTime.timezone = $.timepicker.timezoneOffsetNumber(treg[order.z]);
				}


				return resTime;
			}
			return false;
		};// end strictParse

		// First try JS Date, if that fails, use strictParse
		var looseParse = function (f, s, o) {
			try {
				var d = new Date('2012-01-01 ' + s);
				if (isNaN(d.getTime())) {
					d = new Date('2012-01-01T' + s);
					if (isNaN(d.getTime())) {
						d = new Date('01/01/2012 ' + s);
						if (isNaN(d.getTime())) {
							throw "Unable to parse time with native Date: " + s;
						}
					}
				}

				return {
					hour: d.getHours(),
					minute: d.getMinutes(),
					second: d.getSeconds(),
					millisec: d.getMilliseconds(),
					microsec: d.getMicroseconds(),
					timezone: d.getTimezoneOffset() * -1
				};
			}
			catch (err) {
				try {
					return strictParse(f, s, o);
				}
				catch (err2) {
					$.timepicker.log("Unable to parse \ntimeString: " + s + "\ntimeFormat: " + f);
				}				
			}
			return false;
		}; // end looseParse
		
		if (typeof o.parse === "function") {
			return o.parse(timeFormat, timeString, o);
		}
		if (o.parse === 'loose') {
			return looseParse(timeFormat, timeString, o);
		}
		return strictParse(timeFormat, timeString, o);
	};

	/**
	 * Public utility to format the time
	 * @param {string} format format of the time
	 * @param {Object} time Object not a Date for timezones
	 * @param {Object} [options] essentially the regional[].. amNames, pmNames, ampm
	 * @returns {string} the formatted time
	 */
	$.datepicker.formatTime = function (format, time, options) {
		options = options || {};
		options = $.extend({}, $.timepicker._defaults, options);
		time = $.extend({
			hour: 0,
			minute: 0,
			second: 0,
			millisec: 0,
			microsec: 0,
			timezone: null
		}, time);

		var tmptime = format,
			ampmName = options.amNames[0],
			hour = parseInt(time.hour, 10);

		if (hour > 11) {
			ampmName = options.pmNames[0];
		}

		tmptime = tmptime.replace(/(?:HH?|hh?|mm?|ss?|[tT]{1,2}|[zZ]|[lc]|'.*?')/g, function (match) {
			switch (match) {
			case 'HH':
				return ('0' + hour).slice(-2);
			case 'H':
				return hour;
			case 'hh':
				return ('0' + convert24to12(hour)).slice(-2);
			case 'h':
				return convert24to12(hour);
			case 'mm':
				return ('0' + time.minute).slice(-2);
			case 'm':
				return time.minute;
			case 'ss':
				return ('0' + time.second).slice(-2);
			case 's':
				return time.second;
			case 'l':
				return ('00' + time.millisec).slice(-3);
			case 'c':
				return ('00' + time.microsec).slice(-3);
			case 'z':
				return $.timepicker.timezoneOffsetString(time.timezone === null ? options.timezone : time.timezone, false);
			case 'Z':
				return $.timepicker.timezoneOffsetString(time.timezone === null ? options.timezone : time.timezone, true);
			case 'T':
				return ampmName.charAt(0).toUpperCase();
			case 'TT':
				return ampmName.toUpperCase();
			case 't':
				return ampmName.charAt(0).toLowerCase();
			case 'tt':
				return ampmName.toLowerCase();
			default:
				return match.replace(/'/g, "");
			}
		});

		return tmptime;
	};

	/*
	* the bad hack :/ override datepicker so it doesn't close on select
	// inspired: http://stackoverflow.com/questions/1252512/jquery-datepicker-prevent-closing-picker-when-clicking-a-date/1762378#1762378
	*/
	$.datepicker._base_selectDate = $.datepicker._selectDate;
	$.datepicker._selectDate = function (id, dateStr) {
		var inst = this._getInst($(id)[0]),
			tp_inst = this._get(inst, 'timepicker'),
			was_inline;

		if (tp_inst && inst.settings.showTimepicker) {
			tp_inst._limitMinMaxDateTime(inst, true);
			was_inline = inst.inline;
			inst.inline = inst.stay_open = true;
			//This way the onSelect handler called from calendarpicker get the full dateTime
			this._base_selectDate(id, dateStr);
			inst.inline = was_inline;
			inst.stay_open = false;
			this._notifyChange(inst);
			this._updateDatepicker(inst);
		} else {
			this._base_selectDate(id, dateStr);
		}
	};

	/*
	* second bad hack :/ override datepicker so it triggers an event when changing the input field
	* and does not redraw the datepicker on every selectDate event
	*/
	$.datepicker._base_updateDatepicker = $.datepicker._updateDatepicker;
	$.datepicker._updateDatepicker = function (inst) {

		// don't popup the datepicker if there is another instance already opened
		var input = inst.input[0];
		if ($.datepicker._curInst && $.datepicker._curInst !== inst && $.datepicker._datepickerShowing && $.datepicker._lastInput !== input) {
			return;
		}

		if (typeof(inst.stay_open) !== 'boolean' || inst.stay_open === false) {

			this._base_updateDatepicker(inst);

			// Reload the time control when changing something in the input text field.
			var tp_inst = this._get(inst, 'timepicker');
			if (tp_inst) {
				tp_inst._addTimePicker(inst);
			}
		}
	};

	/*
	* third bad hack :/ override datepicker so it allows spaces and colon in the input field
	*/
	$.datepicker._base_doKeyPress = $.datepicker._doKeyPress;
	$.datepicker._doKeyPress = function (event) {
		var inst = $.datepicker._getInst(event.target),
			tp_inst = $.datepicker._get(inst, 'timepicker');

		if (tp_inst) {
			if ($.datepicker._get(inst, 'constrainInput')) {
				var ampm = tp_inst.support.ampm,
					tz = tp_inst._defaults.showTimezone !== null ? tp_inst._defaults.showTimezone : tp_inst.support.timezone,
					dateChars = $.datepicker._possibleChars($.datepicker._get(inst, 'dateFormat')),
					datetimeChars = tp_inst._defaults.timeFormat.toString()
											.replace(/[hms]/g, '')
											.replace(/TT/g, ampm ? 'APM' : '')
											.replace(/Tt/g, ampm ? 'AaPpMm' : '')
											.replace(/tT/g, ampm ? 'AaPpMm' : '')
											.replace(/T/g, ampm ? 'AP' : '')
											.replace(/tt/g, ampm ? 'apm' : '')
											.replace(/t/g, ampm ? 'ap' : '') + 
											" " + tp_inst._defaults.separator + 
											tp_inst._defaults.timeSuffix + 
											(tz ? tp_inst._defaults.timezoneList.join('') : '') + 
											(tp_inst._defaults.amNames.join('')) + (tp_inst._defaults.pmNames.join('')) + 
											dateChars,
					chr = String.fromCharCode(event.charCode === undefined ? event.keyCode : event.charCode);
				return event.ctrlKey || (chr < ' ' || !dateChars || datetimeChars.indexOf(chr) > -1);
			}
		}

		return $.datepicker._base_doKeyPress(event);
	};

	/*
	* Fourth bad hack :/ override _updateAlternate function used in inline mode to init altField
	* Update any alternate field to synchronise with the main field.
	*/
	$.datepicker._base_updateAlternate = $.datepicker._updateAlternate;
	$.datepicker._updateAlternate = function (inst) {
		var tp_inst = this._get(inst, 'timepicker');
		if (tp_inst) {
			var altField = tp_inst._defaults.altField;
			if (altField) { // update alternate field too
				var altFormat = tp_inst._defaults.altFormat || tp_inst._defaults.dateFormat,
					date = this._getDate(inst),
					formatCfg = $.datepicker._getFormatConfig(inst),
					altFormattedDateTime = '', 
					altSeparator = tp_inst._defaults.altSeparator ? tp_inst._defaults.altSeparator : tp_inst._defaults.separator, 
					altTimeSuffix = tp_inst._defaults.altTimeSuffix ? tp_inst._defaults.altTimeSuffix : tp_inst._defaults.timeSuffix,
					altTimeFormat = tp_inst._defaults.altTimeFormat !== null ? tp_inst._defaults.altTimeFormat : tp_inst._defaults.timeFormat;
				
				altFormattedDateTime += $.datepicker.formatTime(altTimeFormat, tp_inst, tp_inst._defaults) + altTimeSuffix;
				if (!tp_inst._defaults.timeOnly && !tp_inst._defaults.altFieldTimeOnly && date !== null) {
					if (tp_inst._defaults.altFormat) {
						altFormattedDateTime = $.datepicker.formatDate(tp_inst._defaults.altFormat, date, formatCfg) + altSeparator + altFormattedDateTime;
					}
					else {
						altFormattedDateTime = tp_inst.formattedDate + altSeparator + altFormattedDateTime;
					}
				}
				$(altField).val( inst.input.val() ? altFormattedDateTime : "");
			}
		}
		else {
			$.datepicker._base_updateAlternate(inst);	
		}
	};

	/*
	* Override key up event to sync manual input changes.
	*/
	$.datepicker._base_doKeyUp = $.datepicker._doKeyUp;
	$.datepicker._doKeyUp = function (event) {
		var inst = $.datepicker._getInst(event.target),
			tp_inst = $.datepicker._get(inst, 'timepicker');

		if (tp_inst) {
			if (tp_inst._defaults.timeOnly && (inst.input.val() !== inst.lastVal)) {
				try {
					$.datepicker._updateDatepicker(inst);
				} catch (err) {
					$.timepicker.log(err);
				}
			}
		}

		return $.datepicker._base_doKeyUp(event);
	};

	/*
	* override "Today" button to also grab the time.
	*/
	$.datepicker._base_gotoToday = $.datepicker._gotoToday;
	$.datepicker._gotoToday = function (id) {
		var inst = this._getInst($(id)[0]),
			$dp = inst.dpDiv;
		var tp_inst = this._get(inst, 'timepicker');
		selectLocalTimezone(tp_inst);
		var now = new Date();
		this._setTime(inst, now);
		this._setDate(inst, now);
		this._base_gotoToday(id);
	};

	/*
	* Disable & enable the Time in the datetimepicker
	*/
	$.datepicker._disableTimepickerDatepicker = function (target) {
		var inst = this._getInst(target);
		if (!inst) {
			return;
		}

		var tp_inst = this._get(inst, 'timepicker');
		$(target).datepicker('getDate'); // Init selected[Year|Month|Day]
		if (tp_inst) {
			inst.settings.showTimepicker = false;
			tp_inst._defaults.showTimepicker = false;
			tp_inst._updateDateTime(inst);
		}
	};

	$.datepicker._enableTimepickerDatepicker = function (target) {
		var inst = this._getInst(target);
		if (!inst) {
			return;
		}

		var tp_inst = this._get(inst, 'timepicker');
		$(target).datepicker('getDate'); // Init selected[Year|Month|Day]
		if (tp_inst) {
			inst.settings.showTimepicker = true;
			tp_inst._defaults.showTimepicker = true;
			tp_inst._addTimePicker(inst); // Could be disabled on page load
			tp_inst._updateDateTime(inst);
		}
	};

	/*
	* Create our own set time function
	*/
	$.datepicker._setTime = function (inst, date) {
		var tp_inst = this._get(inst, 'timepicker');
		if (tp_inst) {
			var defaults = tp_inst._defaults;

			// calling _setTime with no date sets time to defaults
			tp_inst.hour = date ? date.getHours() : defaults.hour;
			tp_inst.minute = date ? date.getMinutes() : defaults.minute;
			tp_inst.second = date ? date.getSeconds() : defaults.second;
			tp_inst.millisec = date ? date.getMilliseconds() : defaults.millisec;
			tp_inst.microsec = date ? date.getMicroseconds() : defaults.microsec;

			//check if within min/max times.. 
			tp_inst._limitMinMaxDateTime(inst, true);

			tp_inst._onTimeChange();
			tp_inst._updateDateTime(inst);
		}
	};

	/*
	* Create new public method to set only time, callable as $().datepicker('setTime', date)
	*/
	$.datepicker._setTimeDatepicker = function (target, date, withDate) {
		var inst = this._getInst(target);
		if (!inst) {
			return;
		}

		var tp_inst = this._get(inst, 'timepicker');

		if (tp_inst) {
			this._setDateFromField(inst);
			var tp_date;
			if (date) {
				if (typeof date === "string") {
					tp_inst._parseTime(date, withDate);
					tp_date = new Date();
					tp_date.setHours(tp_inst.hour, tp_inst.minute, tp_inst.second, tp_inst.millisec);
					tp_date.setMicroseconds(tp_inst.microsec);
				} else {
					tp_date = new Date(date.getTime());
					tp_date.setMicroseconds(date.getMicroseconds());
				}
				if (tp_date.toString() === 'Invalid Date') {
					tp_date = undefined;
				}
				this._setTime(inst, tp_date);
			}
		}

	};

	/*
	* override setDate() to allow setting time too within Date object
	*/
	$.datepicker._base_setDateDatepicker = $.datepicker._setDateDatepicker;
	$.datepicker._setDateDatepicker = function (target, _date) {
		var inst = this._getInst(target);
		var date = _date;
		if (!inst) {
			return;
		}

		if (typeof(_date) === 'string') {
			date = new Date(_date);
			if (!date.getTime()) {
				this._base_setDateDatepicker.apply(this, arguments);
				date = $(target).datepicker('getDate');
			}
		}

		var tp_inst = this._get(inst, 'timepicker');
		var tp_date;
		if (date instanceof Date) {
			tp_date = new Date(date.getTime());
			tp_date.setMicroseconds(date.getMicroseconds());
		} else {
			tp_date = date;
		}
		
		// This is important if you are using the timezone option, javascript's Date 
		// object will only return the timezone offset for the current locale, so we 
		// adjust it accordingly.  If not using timezone option this won't matter..
		// If a timezone is different in tp, keep the timezone as is
		if (tp_inst && tp_date) {
			// look out for DST if tz wasn't specified
			if (!tp_inst.support.timezone && tp_inst._defaults.timezone === null) {
				tp_inst.timezone = tp_date.getTimezoneOffset() * -1;
			}
			date = $.timepicker.timezoneAdjust(date, tp_inst.timezone);
			tp_date = $.timepicker.timezoneAdjust(tp_date, tp_inst.timezone);
		}

		this._updateDatepicker(inst);
		this._base_setDateDatepicker.apply(this, arguments);
		this._setTimeDatepicker(target, tp_date, true);
	};

	/*
	* override getDate() to allow getting time too within Date object
	*/
	$.datepicker._base_getDateDatepicker = $.datepicker._getDateDatepicker;
	$.datepicker._getDateDatepicker = function (target, noDefault) {
		var inst = this._getInst(target);
		if (!inst) {
			return;
		}

		var tp_inst = this._get(inst, 'timepicker');

		if (tp_inst) {
			// if it hasn't yet been defined, grab from field
			if (inst.lastVal === undefined) {
				this._setDateFromField(inst, noDefault);
			}

			var date = this._getDate(inst);
			var currDT = $.trim((tp_inst.$altInput && tp_inst._defaults.altFieldTimeOnly) ? tp_inst.$input.val() + ' ' + tp_inst.$altInput.val() : tp_inst.$input.val());
			if (date && tp_inst._parseTime(currDT, !inst.settings.timeOnly)) {
				date.setHours(tp_inst.hour, tp_inst.minute, tp_inst.second, tp_inst.millisec);
				date.setMicroseconds(tp_inst.microsec);

				// This is important if you are using the timezone option, javascript's Date 
				// object will only return the timezone offset for the current locale, so we 
				// adjust it accordingly.  If not using timezone option this won't matter..
				if (tp_inst.timezone != null) {
					// look out for DST if tz wasn't specified
					if (!tp_inst.support.timezone && tp_inst._defaults.timezone === null) {
						tp_inst.timezone = date.getTimezoneOffset() * -1;
					}
					date = $.timepicker.timezoneAdjust(date, tp_inst.timezone);
				}
			}
			return date;
		}
		return this._base_getDateDatepicker(target, noDefault);
	};

	/*
	* override parseDate() because UI 1.8.14 throws an error about "Extra characters"
	* An option in datapicker to ignore extra format characters would be nicer.
	*/
	$.datepicker._base_parseDate = $.datepicker.parseDate;
	$.datepicker.parseDate = function (format, value, settings) {
		var date;
		try {
			date = this._base_parseDate(format, value, settings);
		} catch (err) {
			// Hack!  The error message ends with a colon, a space, and
			// the "extra" characters.  We rely on that instead of
			// attempting to perfectly reproduce the parsing algorithm.
			if (err.indexOf(":") >= 0) {
				date = this._base_parseDate(format, value.substring(0, value.length - (err.length - err.indexOf(':') - 2)), settings);
				$.timepicker.log("Error parsing the date string: " + err + "\ndate string = " + value + "\ndate format = " + format);
			} else {
				throw err;
			}
		}
		return date;
	};

	/*
	* override formatDate to set date with time to the input
	*/
	$.datepicker._base_formatDate = $.datepicker._formatDate;
	$.datepicker._formatDate = function (inst, day, month, year) {
		var tp_inst = this._get(inst, 'timepicker');
		if (tp_inst) {
			tp_inst._updateDateTime(inst);
			return tp_inst.$input.val();
		}
		return this._base_formatDate(inst);
	};

	/*
	* override options setter to add time to maxDate(Time) and minDate(Time). MaxDate
	*/
	$.datepicker._base_optionDatepicker = $.datepicker._optionDatepicker;
	$.datepicker._optionDatepicker = function (target, name, value) {
		var inst = this._getInst(target),
			name_clone;
		if (!inst) {
			return null;
		}

		var tp_inst = this._get(inst, 'timepicker');
		if (tp_inst) {
			var min = null,
				max = null,
				onselect = null,
				overrides = tp_inst._defaults.evnts,
				fns = {},
				prop,
				ret,
				oldVal,
				$target;
			if (typeof name === 'string') { // if min/max was set with the string
				if (name === 'minDate' || name === 'minDateTime') {
					min = value;
				} else if (name === 'maxDate' || name === 'maxDateTime') {
					max = value;
				} else if (name === 'onSelect') {
					onselect = value;
				} else if (overrides.hasOwnProperty(name)) {
					if (typeof (value) === 'undefined') {
						return overrides[name];
					}
					fns[name] = value;
					name_clone = {}; //empty results in exiting function after overrides updated
				}
			} else if (typeof name === 'object') { //if min/max was set with the JSON
				if (name.minDate) {
					min = name.minDate;
				} else if (name.minDateTime) {
					min = name.minDateTime;
				} else if (name.maxDate) {
					max = name.maxDate;
				} else if (name.maxDateTime) {
					max = name.maxDateTime;
				}
				for (prop in overrides) {
					if (overrides.hasOwnProperty(prop) && name[prop]) {
						fns[prop] = name[prop];
					}
				}
			}
			for (prop in fns) {
				if (fns.hasOwnProperty(prop)) {
					overrides[prop] = fns[prop];
					if (!name_clone) { name_clone = $.extend({}, name); }
					delete name_clone[prop];
				}
			}
			if (name_clone && isEmptyObject(name_clone)) { return; }
			if (min) { //if min was set
				if (min === 0) {
					min = new Date();
				} else {
					min = new Date(min);
				}
				tp_inst._defaults.minDate = min;
				tp_inst._defaults.minDateTime = min;
			} else if (max) { //if max was set
				if (max === 0) {
					max = new Date();
				} else {
					max = new Date(max);
				}
				tp_inst._defaults.maxDate = max;
				tp_inst._defaults.maxDateTime = max;
			} else if (onselect) {
				tp_inst._defaults.onSelect = onselect;
			}

			// Datepicker will override our date when we call _base_optionDatepicker when 
			// calling minDate/maxDate, so we will first grab the value, call 
			// _base_optionDatepicker, then set our value back.
			if(min || max){
				$target = $(target);
				oldVal = $target.datetimepicker('getDate');
				ret = this._base_optionDatepicker.call($.datepicker, target, name_clone || name, value);
				$target.datetimepicker('setDate', oldVal);
				return ret;
			}
		}
		if (value === undefined) {
			return this._base_optionDatepicker.call($.datepicker, target, name);
		}
		return this._base_optionDatepicker.call($.datepicker, target, name_clone || name, value);
	};
	
	/*
	* jQuery isEmptyObject does not check hasOwnProperty - if someone has added to the object prototype,
	* it will return false for all objects
	*/
	var isEmptyObject = function (obj) {
		var prop;
		for (prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				return false;
			}
		}
		return true;
	};

	/*
	* jQuery extend now ignores nulls!
	*/
	var extendRemove = function (target, props) {
		$.extend(target, props);
		for (var name in props) {
			if (props[name] === null || props[name] === undefined) {
				target[name] = props[name];
			}
		}
		return target;
	};

	/*
	* Determine by the time format which units are supported
	* Returns an object of booleans for each unit
	*/
	var detectSupport = function (timeFormat) {
		var tf = timeFormat.replace(/'.*?'/g, '').toLowerCase(), // removes literals
			isIn = function (f, t) { // does the format contain the token?
					return f.indexOf(t) !== -1 ? true : false;
				};
		return {
				hour: isIn(tf, 'h'),
				minute: isIn(tf, 'm'),
				second: isIn(tf, 's'),
				millisec: isIn(tf, 'l'),
				microsec: isIn(tf, 'c'),
				timezone: isIn(tf, 'z'),
				ampm: isIn(tf, 't') && isIn(timeFormat, 'h'),
				iso8601: isIn(timeFormat, 'Z')
			};
	};

	/*
	* Converts 24 hour format into 12 hour
	* Returns 12 hour without leading 0
	*/
	var convert24to12 = function (hour) {
		hour %= 12;

		if (hour === 0) {
			hour = 12;
		}

		return String(hour);
	};

	var computeEffectiveSetting = function (settings, property) {
		return settings && settings[property] ? settings[property] : $.timepicker._defaults[property];
	};

	/*
	* Splits datetime string into date and time substrings.
	* Throws exception when date can't be parsed
	* Returns {dateString: dateString, timeString: timeString}
	*/
	var splitDateTime = function (dateTimeString, timeSettings) {
		// The idea is to get the number separator occurrences in datetime and the time format requested (since time has
		// fewer unknowns, mostly numbers and am/pm). We will use the time pattern to split.
		var separator = computeEffectiveSetting(timeSettings, 'separator'),
			format = computeEffectiveSetting(timeSettings, 'timeFormat'),
			timeParts = format.split(separator), // how many occurrences of separator may be in our format?
			timePartsLen = timeParts.length,
			allParts = dateTimeString.split(separator),
			allPartsLen = allParts.length;

		if (allPartsLen > 1) {
			return {
				dateString: allParts.splice(0, allPartsLen - timePartsLen).join(separator),
				timeString: allParts.splice(0, timePartsLen).join(separator)
			};
		}

		return {
			dateString: dateTimeString,
			timeString: ''
		};
	};

	/*
	* Internal function to parse datetime interval
	* Returns: {date: Date, timeObj: Object}, where
	*   date - parsed date without time (type Date)
	*   timeObj = {hour: , minute: , second: , millisec: , microsec: } - parsed time. Optional
	*/
	var parseDateTimeInternal = function (dateFormat, timeFormat, dateTimeString, dateSettings, timeSettings) {
		var date,
			parts,
			parsedTime;

		parts = splitDateTime(dateTimeString, timeSettings);
		date = $.datepicker._base_parseDate(dateFormat, parts.dateString, dateSettings);

		if (parts.timeString === '') {
			return {
				date: date
			};
		}

		parsedTime = $.datepicker.parseTime(timeFormat, parts.timeString, timeSettings);

		if (!parsedTime) {
			throw 'Wrong time format';
		}

		return {
			date: date,
			timeObj: parsedTime
		};
	};

	/*
	* Internal function to set timezone_select to the local timezone
	*/
	var selectLocalTimezone = function (tp_inst, date) {
		if (tp_inst && tp_inst.timezone_select) {
			var now = date || new Date();
			tp_inst.timezone_select.val(-now.getTimezoneOffset());
		}
	};

	/*
	* Create a Singleton Instance
	*/
	$.timepicker = new Timepicker();

	/**
	 * Get the timezone offset as string from a date object (eg '+0530' for UTC+5.5)
	 * @param {number} tzMinutes if not a number, less than -720 (-1200), or greater than 840 (+1400) this value is returned
	 * @param {boolean} iso8601 if true formats in accordance to iso8601 "+12:45"
	 * @return {string}
	 */
	$.timepicker.timezoneOffsetString = function (tzMinutes, iso8601) {
		if (isNaN(tzMinutes) || tzMinutes > 840 || tzMinutes < -720) {
			return tzMinutes;
		}

		var off = tzMinutes,
			minutes = off % 60,
			hours = (off - minutes) / 60,
			iso = iso8601 ? ':' : '',
			tz = (off >= 0 ? '+' : '-') + ('0' + Math.abs(hours)).slice(-2) + iso + ('0' + Math.abs(minutes)).slice(-2);
		
		if (tz === '+00:00') {
			return 'Z';
		}
		return tz;
	};

	/**
	 * Get the number in minutes that represents a timezone string
	 * @param  {string} tzString formatted like "+0500", "-1245", "Z"
	 * @return {number} the offset minutes or the original string if it doesn't match expectations
	 */
	$.timepicker.timezoneOffsetNumber = function (tzString) {
		var normalized = tzString.toString().replace(':', ''); // excuse any iso8601, end up with "+1245"

		if (normalized.toUpperCase() === 'Z') { // if iso8601 with Z, its 0 minute offset
			return 0;
		}

		if (!/^(\-|\+)\d{4}$/.test(normalized)) { // possibly a user defined tz, so just give it back
			return tzString;
		}

		return ((normalized.substr(0, 1) === '-' ? -1 : 1) * // plus or minus
					((parseInt(normalized.substr(1, 2), 10) * 60) + // hours (converted to minutes)
					parseInt(normalized.substr(3, 2), 10))); // minutes
	};

	/**
	 * No way to set timezone in js Date, so we must adjust the minutes to compensate. (think setDate, getDate)
	 * @param  {Date} date
	 * @param  {string} toTimezone formatted like "+0500", "-1245"
	 * @return {Date}
	 */
	$.timepicker.timezoneAdjust = function (date, toTimezone) {
		var toTz = $.timepicker.timezoneOffsetNumber(toTimezone);
		if (!isNaN(toTz)) {
			date.setMinutes(date.getMinutes() + -date.getTimezoneOffset() - toTz);
		}
		return date;
	};

	/**
	 * Calls `timepicker()` on the `startTime` and `endTime` elements, and configures them to
	 * enforce date range limits.
	 * n.b. The input value must be correctly formatted (reformatting is not supported)
	 * @param  {Element} startTime
	 * @param  {Element} endTime
	 * @param  {Object} options Options for the timepicker() call
	 * @return {jQuery}
	 */
	$.timepicker.timeRange = function (startTime, endTime, options) {
		return $.timepicker.handleRange('timepicker', startTime, endTime, options);
	};

	/**
	 * Calls `datetimepicker` on the `startTime` and `endTime` elements, and configures them to
	 * enforce date range limits.
	 * @param  {Element} startTime
	 * @param  {Element} endTime
	 * @param  {Object} options Options for the `timepicker()` call. Also supports `reformat`,
	 *   a boolean value that can be used to reformat the input values to the `dateFormat`.
	 * @param  {string} method Can be used to specify the type of picker to be added
	 * @return {jQuery}
	 */
	$.timepicker.datetimeRange = function (startTime, endTime, options) {
		$.timepicker.handleRange('datetimepicker', startTime, endTime, options);
	};

	/**
	 * Calls `datepicker` on the `startTime` and `endTime` elements, and configures them to
	 * enforce date range limits.
	 * @param  {Element} startTime
	 * @param  {Element} endTime
	 * @param  {Object} options Options for the `timepicker()` call. Also supports `reformat`,
	 *   a boolean value that can be used to reformat the input values to the `dateFormat`.
	 * @return {jQuery}
	 */
	$.timepicker.dateRange = function (startTime, endTime, options) {
		$.timepicker.handleRange('datepicker', startTime, endTime, options);
	};

	/**
	 * Calls `method` on the `startTime` and `endTime` elements, and configures them to
	 * enforce date range limits.
	 * @param  {string} method Can be used to specify the type of picker to be added
	 * @param  {Element} startTime
	 * @param  {Element} endTime
	 * @param  {Object} options Options for the `timepicker()` call. Also supports `reformat`,
	 *   a boolean value that can be used to reformat the input values to the `dateFormat`.
	 * @return {jQuery}
	 */
	$.timepicker.handleRange = function (method, startTime, endTime, options) {
		options = $.extend({}, {
			minInterval: 0, // min allowed interval in milliseconds
			maxInterval: 0, // max allowed interval in milliseconds
			start: {},      // options for start picker
			end: {}         // options for end picker
		}, options);

		// for the mean time this fixes an issue with calling getDate with timepicker()
		var timeOnly = false;
		if(method === 'timepicker'){
			timeOnly = true;
			method = 'datetimepicker';
		}

		function checkDates(changed, other) {
			var startdt = startTime[method]('getDate'),
				enddt = endTime[method]('getDate'),
				changeddt = changed[method]('getDate');

			if (startdt !== null) {
				var minDate = new Date(startdt.getTime()),
					maxDate = new Date(startdt.getTime());

				minDate.setMilliseconds(minDate.getMilliseconds() + options.minInterval);
				maxDate.setMilliseconds(maxDate.getMilliseconds() + options.maxInterval);

				if (options.minInterval > 0 && minDate > enddt) { // minInterval check
					endTime[method]('setDate', minDate);
				}
				else if (options.maxInterval > 0 && maxDate < enddt) { // max interval check
					endTime[method]('setDate', maxDate);
				}
				else if (startdt > enddt) {
					other[method]('setDate', changeddt);
				}
			}
		}

		function selected(changed, other, option) {
			if (!changed.val()) {
				return;
			}
			var date = changed[method].call(changed, 'getDate');
			if (date !== null && options.minInterval > 0) {
				if (option === 'minDate') {
					date.setMilliseconds(date.getMilliseconds() + options.minInterval);
				}
				if (option === 'maxDate') {
					date.setMilliseconds(date.getMilliseconds() - options.minInterval);
				}
			}
			
			if (date.getTime) {
				other[method].call(other, 'option', option, date);
			}
		}

		$.fn[method].call(startTime, $.extend({
			timeOnly: timeOnly,
			onClose: function (dateText, inst) {
				checkDates($(this), endTime);
			},
			onSelect: function (selectedDateTime) {
				selected($(this), endTime, 'minDate');
			}
		}, options, options.start));
		$.fn[method].call(endTime, $.extend({
			timeOnly: timeOnly,
			onClose: function (dateText, inst) {
				checkDates($(this), startTime);
			},
			onSelect: function (selectedDateTime) {
				selected($(this), startTime, 'maxDate');
			}
		}, options, options.end));

		checkDates(startTime, endTime);
		
		selected(startTime, endTime, 'minDate');
		selected(endTime, startTime, 'maxDate');

		return $([startTime.get(0), endTime.get(0)]);
	};

	/**
	 * Log error or data to the console during error or debugging
	 * @param  {Object} err pass any type object to log to the console during error or debugging
	 * @return {void}
	 */
	$.timepicker.log = function () {
		if (window.console) {
			window.console.log.apply(window.console, Array.prototype.slice.call(arguments));
		}
	};

	/*
	 * Add util object to allow access to private methods for testability.
	 */
	$.timepicker._util = {
		_extendRemove: extendRemove,
		_isEmptyObject: isEmptyObject,
		_convert24to12: convert24to12,
		_detectSupport: detectSupport,
		_selectLocalTimezone: selectLocalTimezone,
		_computeEffectiveSetting: computeEffectiveSetting,
		_splitDateTime: splitDateTime,
		_parseDateTimeInternal: parseDateTimeInternal
	};

	/*
	* Microsecond support
	*/
	if (!Date.prototype.getMicroseconds) {
		Date.prototype.microseconds = 0;
		Date.prototype.getMicroseconds = function () { return this.microseconds; };
		Date.prototype.setMicroseconds = function (m) {
			this.setMilliseconds(this.getMilliseconds() + Math.floor(m / 1000));
			this.microseconds = m % 1000;
			return this;
		};
	}

	/*
	* Keep up with the version
	*/
	$.timepicker.version = "@@version";

}));

var msgs_ = 
{
	badOffset:'Invalid table row offset',
	badName:'The {nn} name may only contain [a-zA-Z0-9] and -',
	badQueryURL:'Incomplete query URL',
	binFormat:'Enter hexadecimal values for binary & varbinary types. The string length should be EVEN. ',
	bitFormat:'Bitfield values should be a binary (0s & 1s) string. ',
	blobMaxSize:'Blob data greater than 16Kb cannot be handled by the GUI',
	
	cannotEdit:'This table cannot be edited - it does not have a primary or unique key',
	chooseFile:'Choose file',
	clickToEdit:'Click entry to edit sets, enums,dates & datetimes ',
	cloneMissing:'No clonable control found for field type {pyt}',
	
	dbsDown:'Could not access database server',
	dbErr:'Database error {ansi}:{txt}',
	dbExists:'A database bearing that name already exists',
	dbFirst:'But first select a database!',
	dbSelect:'Unable to select the database',
	
	
	dbForUser:'Select a database for this user',
	dbUnk:'Unknown database',
	dbUnCreate:'Unable to create database',
	
	editField:'Edit Field Details',
	editSQL:'Edit SQL',
	emptyTable:'The table is empty',
	
	fieldNameInUse:'The name `{nf}` is being used by another field',
	firstSelectDB:'First select a database!',

	howToSelect:'To select a row without opening its editor hold the CTRL or SHIFT keys when you click',
	
	invUser:'Invalid user name',
	invPostData:'Invalid POST data',
	makeTable:'Make Table',
	
	nameTpl:'The {nf} name must be alphanumeric with {ln} or more characters. The 1st character must be alphabetic.',
	needUniqueTableName:'That table name is already in use',
	newDB:'New Database',
	newUser:'New User',

	noData:'No request data sent to server!',
	noDropDB:'The database `{bd}` cannot be dropped',
	noDropDBTable:'Tables from `{bd}` cannot be dropped',
	noFields:'But first define some fields!',
	noNewTablesHere:'You may not create new tables in `{bd}`',
 noRowSelected:'But you have not selected anything!',
	noSuchDB:'No such database on the server',
	noSuchCharSet:'No such character set',
	noSuchCollation:'No such collation',
	noSuchPage:'Page number out of range',
	noSuchTbl:'No such table in this database',
	noSuchUser:'No such user',
	noSQL:'But first enter some SQL to run!',
 noTables:'No tables in this database!',
	nothingHasChanged:'Nothing has changed!',
	
	opFailed:'Operation failed. Please try again.',
	opSucceded:'Operation succeeded',
	opRet:'Operation returned integer code {nn}',

	pdoX:'PDO exception - {xx}',
	pwdFmt:'The password must have 6 or more characters with at least one number, one lowercase letter & one uppercase letter',
	results:'Result',
	resultEmpty:'No result was returned',
	rowEdit:'Table Row Editor',
	
	setEnumEmpty:'A valid member assignment is required',
	sure:'Are you sure that you want to drop `{xx}`',
	
	tableData:'Table Contents',
	tableFirst:'But first select a table!',
	tdHint:'Click rows to edit. Hold the CTRL or SHIFT keys whilst clicking to select a row without opening the editor',

	unDropDB:'Unable to drop `{bd}`',
	unDropTable:'Unable to drop `{lbt}`',
	unDropUser:'Unable to drop `{uu}`',
	unMakeTable:'Unable to create the table',
	unLists:'Unable to fetch DB & User Lists',
	unRowEdit:'Unable to update row',
	unTableData:'Unable to fetch table data',
	unTableList:'Unable to fetch table list',
	unTblStruc:'Unable to fetch table structure',
	unUserData:'Unable to fetch user data',
	
	userAdded:'User added',
	userFirst:'But first select a user!',
	userNoDrop:'The user `{uu}` cannot be dropped',
	
	yearFormat:'Year values must be in the range [1901-2099]',
	
	itiny:'tinyint `{nf}` is invalid',
	uitiny:'Unsigned tinyint `{nf}` is invalid',
	ismall:'smallint `{nf}` is invalid',
	uismall:'unsigned smallint `{nf}` is invalid',
	imedium:'mediumint `{nf}` is invalid',
	uimedium:'unsigned mediumint `{nf}` is invalid',
	iint:'int `{nf}` is invalid',
	uiint:'unsigned int `{nf}` is invalid',
	ibig:'bigint `{nf}` is invalid',
	uibig:'unsigned bigint `{nf}` is invalid',
	
	nfloat:'float `{nf}` is invalid',
 nufloat:'unsigned float `{nf}` is invalid',
 ndouble:'double `{nf}` is invalid',
 nudouble:'unsigned double `{nf}` is invalid',
 
 selAll:'Select all',
 unSelAll:'Unseslect all',
 setSelect:'Select Set Members',
 enumSelect:'Select enumerated value', 
}
