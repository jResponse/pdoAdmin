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
