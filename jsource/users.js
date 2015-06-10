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

