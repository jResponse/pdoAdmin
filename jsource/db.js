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

