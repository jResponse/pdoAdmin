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
