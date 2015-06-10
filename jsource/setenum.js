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
