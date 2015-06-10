/***************************************************
Copyright:jReply LLC, 2015. https://jresponse.net
Demo:http://jresponse.co/myadmin
Comments & suggestions:contact@jreply.com
Licensed MIT:http://choosealicense.com/licenses/mit/
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

