
function fnv32(data)
{
	if (null === data) data = '';
 var fnvPrime = 16777619,hash = 2166136261,ln = data.length,
	     cc,fo,so;
    
 for (var i=0;i < ln; i++) 
	{
  cc = data.charCodeAt(i);
  fo = (cc & 0xFF);
  hash = hash ^ fo;
  hash = (hash * fnvPrime) | 0;
  so = (cc >> 8);
  hash = hash ^ so;
  hash = (hash * fnvPrime) | 0;
 }
 return hash;
}

function sharedIntFilter(pdiv,pFx)
{
	var fld = pdiv.children(':first-child'),
	    ocs = pdiv.data('cs'),
					isn = pdiv.data('isn'),
	    fnom = fld.text(),
     fval = fld.next().val(),
					ncs = fnv32(fval),
					nulled = isn && (0 === fval.length),
     pval = pFx(fval),
					changed = (ocs != ncs);
 return 	{isBlob:false,n:fnom,fv:fval,pv:pval,c:changed,nnld:!nulled};
}

function sharedBigIntFilter(pdiv)
{
	var fld = pdiv.children(':first-child'),
	    ocs = pdiv.data('cs'),
					dft = pdiv.data('dft'),
					isn = pdiv.data('isn'),
	    fnom = fld.text(),
     fval = fld.next().val(),
					nulled = isn && (0 === fval.length),
					ncs = fnv32(fval),
					pval;
					
	try
 {
		pval = BigInteger.parse(fval);
	}	catch(err){pval = null;}
 return 	{isBlob:false,n:fnom,fv:fval,pv:pval,c:(ocs != ncs),nld:nulled};
}


function tiFilter(pdiv)
{
	var rv = sharedIntFilter(pdiv,parseInt);
	if ((rv.nnld && rv.c) && ((-128 > rv.pv) || (127 < rv.pv) || (rv.pv != rv.fv))) throw(msgs_.itiny.format({nf:rv.n}));
	return rv;
}

function utiFilter(pdiv)
{
	var rv = sharedIntFilter(pdiv,parseInt);
	if ((rv.nnld && rv.c) && ((0 > rv.pv) || (255 < rv.pv) || (rv.pv != rv.fv))) throw(msgs_.uitiny.format({nf:rv.n}));
	return rv;
}

function siFilter(pdiv)
{
	var rv = sharedIntFilter(pdiv,parseInt);
	if ((rv.nnld && rv.c) && ((-32768 > rv.pv) || (32767 < rv.pv) || (rv.pv != rv.fv))) throw(msgs_.ismall.format({nf:rv.n}));
	return rv
}

function usiFilter(pdiv)
{
	var rv = sharedIntFilter(pdiv,parseInt);
	if ((rv.nnld && rv.c) && ((0 > rv.pv) || (65535 < rv.pv) || (rv.pv != rv.fv))) throw(msgs_.uismall.format({nf:rv.n}));
	return rv;
}

function miFilter(pdiv)
{
 var rv = sharedIntFilter(pdiv,parseInt);
	if ((rv.nnld && rv.c) && ((-8388608 > rv.pv) || (8388607 < rv.pv) || (rv.pv != rv.fv))) throw(msgs_.imedium.format({nf:rv.n}));
	return rv;
}

function umiFilter(pdiv)
{
	var rv = sharedIntFilter(pdiv,parseInt);
	if ((rv.nnld && rv.c) && ((0 > rv.pv) || (16777215 < rv.pv) || (rv.pv != rv.fv))) throw(msgs_.uimedium.format({nf:rv.n}));
	return rv;
}

function iFilter(pdiv)
{
	var rv = sharedIntFilter(pdiv,parseInt);
	if ((rv.nnld && rv.c) && ((-2147483648 > rv.pv) || (2147483647 < rv.pv) || (rv.pv != rv.fv)))throw(msgs_.iint.format({nf:rv.n}));
	return rv;
}

function uiFilter(pdiv)
{
	var rv = sharedIntFilter(pdiv,parseInt);
	if ((rv.nnld && rv.c) && ((0 > rv.pv) || (4294967295 < rv.pv) || (rv.pv != rv.fv))) throw(msgs_.iint.format({nf:rv.n}));
	return rv;
}

function biFilter(pdiv)
{
	var rv = sharedBigIntFilter(pdiv),
	    mn = BigInteger.parse('-9223372036854775808'),
					mx = BigInteger.parse('9223372036854775807');
					
	if ((rv.nnld && rv.c) && (null === rv.pv))		throw(msgs_.ibig.format({nf:rv.n}));		
	
	var lbreach = (-1 === rv.pv.compare(mn)),
					rbreach = (1 === rv.pv.compare(mx));
					
	if ((rv.nnld && rv.c) && (lbreach || rbreach)) throw(msgs_.ibig.format({nf:rv.n}));
	return rv;
}

function ubiFilter(pdiv)
{
	var rv = sharedBigIntFilter(pdiv),
	    mn = BigInteger.parse('0'),
					mx = BigInteger.parse('18446744073709551615');
					
	if ((rv.nnld && rv.c) && (null === rv.pv))		throw(msgs_.ibig.format({nf:rv.n}));		
	
	var lbreach = (-1 === rv.pv.compare(mn)),
					rbreach = (1 === rv.pv.compare(mx));
					
	if ((rv.nnld && rv.c) && (lbreach || rbreach)) throw(msgs_.ibig.format({nf:rv.n}));
	return rv;
}

function sharedFloatFilter(pdiv,nmin,nmax)
{
	var fld = pdiv.children(':first-child'),
     ocs = pdiv.data('cs'),
					isn = pdiv.data('isn'),
	    fnom = fld.text(),
     fval = fld.next().val(),
					ncs = fnv32(fval),
					nulled = isn && (0 === fval.length),
     pval = parseFloat(fval),
					pva = Math.abs(pval),
					changed = (ocs != ncs),
					outOfRange = (nmin > pva) || (nmax < pva) || (pval != fval);
 return 	{isBlob:false,n:fnom,fv:fval,pv:pval,c:changed,nnld:!nulled,oor:outOfRange};
}

function floatFilter(pdiv)
{
 var rv = sharedFloatFilter(pdiv,1.175494351E-38,3.402823466E+38);
	if ((rv.nnld && rv.c) && rv.oor) throw(msgs_.nfloat.format({nf:rv.n}));
	return rv;
}

function ufloatFilter(pdiv)
{
 var rv = sharedFloatFilter(pdiv,1.175494351E-38,3.402823466E+38);
	if ((rv.nnld && rv.c) && ((0 > rv.pv) ||rv.oor)) throw(msgs_.nufloat.format({nf:rv.n}));
	return rv;	
}

function doubleFilter(pdiv)
{
 var rv = sharedFloatFilter(pdiv,2.2250738585072014E-308,1.7976931348623157E+308);
	if ((rv.nnld && rv.c) && rv.oor) throw(msgs_.ndouble.format({nf:rv.n}));
	return rv;
}

function udoubleFilter(pdiv)
{
 var rv = sharedFloatFilter(pdiv,2.2250738585072014E-308,1.7976931348623157E+308);
	if ((rv.nnld && rv.c) && ((0 > rv.pv) ||rv.oor)) throw(msgs_.nudouble.format({nf:rv.n}));
	return rv;	
}

function charFilter(pdiv)
{
	var fld = pdiv.children(':first-child'),
	    finp = fld.next().children(':first-child'), 
	    cbxCh = finp.next().children(':first-child').is(':checked'),
     ocs = pdiv.data('cs'),
					isn = pdiv.data('isn'),
	    fnom = fld.text(),
     fval = finp.val(),
					fvLen = fval.length,
					ncs = fnv32(fval),
					nulled = isn && cbxCh,
     changed = (ocs != ncs);
					
	return 	{isBlob:false,n:fnom,fv:fval,c:changed,nnld:!nulled};
}

function bitFilter(pdiv)
{
	var fld = pdiv.children(':first-child'),
	    finp = fld.next().children(':first-child'), 
	    cbxCh = finp.next().children(':first-child').is(':checked'),
     ocs = pdiv.data('cs'),
					isn = pdiv.data('isn'),
	    fnom = fld.text(),
     fval = finp.val(),
					fvLen = fval.length,
					ncs = fnv32(fval),
					nulled = isn && cbxCh,
     changed = (ocs != ncs);
					
	if (!nulled)				
	{
		var flag = (0 === fvLen) || (-1 === fval.search('^[0-1]+$'));
		if (flag) throw(msgs_.bitFormat);
	}
	return 	{isBlob:false,n:fnom,fv:fval,c:changed,nnld:!nulled};
}	

function binaryFilter(pdiv)
{
	var fld = pdiv.children(':first-child'),
	    finp = fld.next().children(':first-child'), 
	    cbxCh = finp.next().children(':first-child').is(':checked'),
     ocs = pdiv.data('cs'),
					isn = pdiv.data('isn'),
	    fnom = fld.text(),
     fval = finp.val(),
					fvLen = fval.length,
					ncs = fnv32(fval),
					nulled = isn && cbxCh,
     changed = (ocs != ncs);
					
	if (!nulled)				
	{
		var flag = (0 === fvLen) || (1 === 1 & fvLen) || (-1 === fval.search('^[0-9A-Fa-f]+$'));
		if (flag) throw(msgs_.binFormat);
	}
	return 	{isBlob:false,n:fnom,fv:fval,c:changed,nnld:!nulled};
}

function setEnumFilter(pdiv)
{
	var fld = pdiv.children(':first-child'),
	    finp = fld.next().children(':first-child'), 
	    cbxCh = finp.next().children(':first-child').is(':checked'),
     ocs = pdiv.data('cs'),
					isn = pdiv.data('isn'),
	    fnom = fld.text(),
     fval = finp.val(),
					fvLen = fval.length,
					ncs = fnv32(fval),
					nulled = isn && cbxCh,
     changed = (ocs != ncs);
					
	return 	{isBlob:false,n:fnom,fv:fval,c:changed,nnld:!nulled};//probably not required
}

function mariaDate(dt)
{
	dt = dt.split('/').reverse();
	var h = dt[1];
	dt[1] = dt[2];
	dt[2] = h;
	return dt.join('-');
}

function mariaDateTime(dt)
{
	dt = dt.split(' ');
	dt[0] = mariaDate(dt[0]);
	return '{dd} {tt}'.format({dd:dt[0],tt:dt[1]});
}

function dateFilter(pdiv)
{
	var fld = pdiv.children(':first-child'),
	    finp = fld.next().children(':first-child'), 
	    cbxCh = finp.next().children(':first-child').is(':checked'),
     ocs = pdiv.data('cs'),
					isn = pdiv.data('isn'),
	    fnom = fld.text(),
     fval = finp.val(),
					ncs = fnv32(fval),
					fval = mariaDate(fval),
	    fvLen = fval.length,
					nulled = isn && cbxCh,
     changed = (ocs != ncs);
	
	return 	{isBlob:false,n:fnom,fv:fval,c:changed,nnld:!nulled};
}

function dateTimeFilter(pdiv)
{
	var fld = pdiv.children(':first-child'),
	    finp = fld.next().children(':first-child'), 
	    cbxCh = finp.next().children(':first-child').is(':checked'),
     ocs = pdiv.data('cs'),
					isn = pdiv.data('isn'),
	    fnom = fld.text(),
     fval = finp.val();
					
					var ncs = fnv32(fval),
					fval = mariaDateTime(fval),
	    fvLen = fval.length,
					nulled = isn && cbxCh,
     changed = (ocs != ncs);
	
	return 	{isBlob:false,n:fnom,fv:fval,c:changed,nnld:!nulled};
}

function timeFilter(pdiv)
{
	var fld = pdiv.children(':first-child'),
	    finp = fld.next().children(':first-child'), 
	    cbxCh = finp.next().children(':first-child').is(':checked'),
     ocs = pdiv.data('cs'),
					isn = pdiv.data('isn'),
	    fnom = fld.text(),
     fval = finp.val(),
	    fvLen = fval.length,
					ncs = fnv32(fval),
					nulled = isn && cbxCh,
     changed = (ocs != ncs);
	
	return 	{isBlob:false,n:fnom,fv:fval,c:changed,nnld:!nulled};
}

function timeStampFilter(pdiv)
{
	var fld = pdiv.children(':first-child'),
	    finp = fld.next().children(':first-child'), 
	    cbxCh = finp.next().children(':first-child').is(':checked'),
     ocs = pdiv.data('cs'),
					isn = pdiv.data('isn'),
	    fnom = fld.text(),
     fval = finp.val();
					
					var ncs = fnv32(fval),
					fval = mariaDateTime(fval),
	    fvLen = fval.length,
					nulled = isn && cbxCh,
     changed = (ocs != ncs);
	
	return 	{isBlob:false,n:fnom,fv:fval,c:changed,nnld:!nulled};
}

function yearFilter(pdiv)
{
	var fld = pdiv.children(':first-child'),
	    finp = fld.next().children(':first-child'), 
	    cbxCh = finp.next().children(':first-child').is(':checked'),
     ocs = pdiv.data('cs'),
					isn = pdiv.data('isn'),
	    fnom = fld.text(),
     fval = finp.val(),
					pval = parseInt(fval),
					fvLen = fval.length,
					ncs = fnv32(fval),
					nulled = isn && cbxCh,
     changed = (ocs != ncs);
					
	if (!nulled)				
	{
		var flag = (0 === fvLen) || (pval != fval) || (1901 > pval) || (2099 < pval);
		if (flag) throw(msgs_.yearFormt);
	}
	return 	{isBlob:false,n:fnom,fv:fval,c:changed,nnld:!nulled};
}

function blobFilter(pdiv)
{
	var fld = pdiv.children(':first-child'),
	    fnom = fld.text(),
	    idr = pdiv.data('fid'),
					blob = $('#f' + idr).data('blob'),	    
					cbxCh = $('#c' + idr).is(':checked'),
					isn = pdiv.data('isn'),
					nulled = isn && cbxCh;
	return 	{isBlob:true,n:fnom,fv:blob,c:(undefined !== blob),nnld:!nulled};	    
}

function textFilter(pdiv)
{
	var fld = pdiv.children(':first-child'),
	    fnom = fld.text(),
	    ftxt = fld.next().children(':first-child'), 
	    cbxCh = ftxt.next().children(':first-child').is(':checked'),
					isn = pdiv.data('isn'),
					fval = ftxt.val(),
					nulled = isn && cbxCh;
					ftxt = ftxt.val();
	return 	{isBlob:true,n:fnom,fv:ftxt,c:(0 < ftxt.length),nnld:!nulled};	    
}
