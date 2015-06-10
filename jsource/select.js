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

