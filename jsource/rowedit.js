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
