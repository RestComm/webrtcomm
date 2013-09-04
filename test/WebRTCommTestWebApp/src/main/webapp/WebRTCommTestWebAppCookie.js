/**
 * @class WebRTCommTestWebAppCookie
 * @public
 * @author Didier NEGRE didier.negre22@orange.com
 */ 
WebRTCommTestWebAppCookie= function()
{
	this.listElementId=[];
}

/**
 * Add an elementId into the listElementId 
 * @param elementId is a string representing an id from an input
 */
WebRTCommTestWebAppCookie.prototype.addElementIdInCookie=function(elementId) 
{
	this.listElementId.push(elementId);
}

/**
 * Delete an elementId into the listElementId 
 * @param elementId is a string representing an id from an input
 */
WebRTCommTestWebAppCookie.prototype.deleteElementIdInCookie=function(elementId) 
{
	var length = this.listElementId.length;
	this.deleteCookie(elementId);
	var listTmp=[];
	for(var i = 0; i< length;i++){
		if (elementId!==this.listElementId[i]){
			listTmp.push(this.listElementId[i]);
		}
	}
	this.listElementId=listTmp;
}

/**
 * Check if there is a cookie corresponding to an elementId
 * @param elementId is a string representing an id from an input
 * @return boolean
 */
WebRTCommTestWebAppCookie.prototype.existInACurrentCookie=function(elementId) 
{
	if(this.getCookie(elementId)==null){
		return false;
	}else{
		return true;
	}
	
}

/**
 * Take all values from the document (where attributes defined in the input list) to write in the cookie.
 * @public
 */
WebRTCommTestWebAppCookie.prototype.fromDocumentToCookie=function()
{
	var length = this.listElementId.length;
	var element = undefined;
	for (var i = 0; i < length; i++) {
		element = this.listElementId[i];
		this.setCookie(element,this.handlerInput(element,null));
	}
	
}

/**
 * Take all values from the cookie (where attributes defined in the output list) to write in the document.
 * @public 
 */
WebRTCommTestWebAppCookie.prototype.fromCookieToDocument=function()
{
	var length = this.listElementId.length;
	var element = undefined;
	for (var i = 0; i < length; i++) {
		element = this.listElementId[i];
		if(this.existInACurrentCookie(element)){
			this.handlerInput(element,this.getCookie(element));
		}
	}
	
}

/**
 * Delete all cookies.
 * @public 
 */
WebRTCommTestWebAppCookie.prototype.deleteAllCookies=function()
{
	var length = this.listElementId.length;
	var element = undefined;
	for (var i = 0; i < length; i++) {
		element = this.listElementId[i];
		if(this.existInACurrentCookie(element)){
			this.deleteCookie(element);
		}
	}
	
}

/**
 * Add a cookie which contains the couple {key,value}. This cookie expires after 1 day.
 * @param key
 * @param value
 * @private 
 */
WebRTCommTestWebAppCookie.prototype.setCookie=function(key, value) 
{
    var today = new Date(), expires = new Date();
	expires.setTime(today.getTime() + (24*60*60*1000)); // One day
	document.cookie = key + "=" + encodeURIComponent(value) + ";expires=" + expires.toGMTString();

}

/**
 * Give the value associated to the given key 
 * @param cookieName is a string representing a key
 * @return value of the key, or null when key is not found
 * @private
 */
WebRTCommTestWebAppCookie.prototype.getCookie=function(key)
{
	var oRegex = new RegExp("(?:; )?" + key + "=([^;]*);?");
	
	if (oRegex.test(document.cookie)) {
		return decodeURIComponent(RegExp["$1"]);
	} else {
		return null;
	}
	
}

/**
 * Delete the cookie associated to the given key
 * @param key
 * @private 
 */
WebRTCommTestWebAppCookie.prototype.deleteCookie=function(key) 
{
    var today = new Date(), expires = new Date();
	expires.setTime(42); // timeStamp : 1970 and 42 ms, already passed
	document.cookie = key + "=deleted" + ";expires=" + expires.toGMTString();

}

/**
 * Handle an input. Behaviour, depends of the input type of element given : 
 * - checkbox : if value is not null, set checked attribute to value. Return the checked attribute.
 * - default : ---------------------, set value attribute to value. -------------------------------
 * @param element 
 * @param value, if not null, set a attribute to this value.
 * @return string
 * @private 
 */
WebRTCommTestWebAppCookie.prototype.handlerInput=function(element, value)
{
	var type = document.getElementById(element).type;
	switch (type){
	case "checkbox":
		if (value!=null){
			if (value=="true") document.getElementById(element).checked=true;
			else document.getElementById(element).checked=false;
		}
		return document.getElementById(element).checked;
		break;
	default:
		if (value!= null) document.getElementById(element).value=value;	
		return document.getElementById(element).value;
		break;
	}
	return null;
}
