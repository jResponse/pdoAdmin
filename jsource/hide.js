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
