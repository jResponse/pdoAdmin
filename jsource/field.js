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

