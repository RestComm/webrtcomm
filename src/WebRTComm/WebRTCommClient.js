/**
 * @class WebRTCommClient
 * @classdesc Main class of the WebRTComm Framework providing high level communication service: call and be call
 * @constructor
 * @public
 * @param  {object} eventListener event listener object implementing WebRTCommClient and WebRTCommCall listener interface
 */
WebRTCommClient = function(eventListener) {
	if (typeof eventListener === 'object') {
		this.id = "WebRTCommClient" + Math.floor(Math.random() * 2147483648);
		console.debug("WebRTCommClient:WebRTCommClient():this.id=" + this.id);
		this.eventListener = eventListener;
		this.configuration = undefined;
		this.connector = undefined;
		this.closePendingFlag = false;
	} else {
		throw "WebRTCommClient:WebRTCommClient(): bad arguments"
	}
};

/**
 * SIP call control protocol mode 
 * @public
 * @constant
 */
WebRTCommClient.prototype.SIP = "SIP";


/**
 * Get opened/closed status 
 * @public
 * @returns {boolean} true if opened, false if closed
 */
WebRTCommClient.prototype.isOpened = function() {
	if (this.connector)
		return this.connector.isOpened();
	else
		return false;
};

/**
 * Get client configuration
 * @public
 * @returns {object} configuration
 */
WebRTCommClient.prototype.getConfiguration = function() {
	return this.configuration;
};

/**
 * Open the WebRTC communication client, asynchronous action, opened or error event are notified to the eventListener
 * @public 
 * @param {object} configuration  WebRTC communication client configuration <br>
 * <p> Client configuration sample: <br>
 * { <br>
 * <span style="margin-left: 30px">communicationMode:WebRTCommClient.prototype.SIP,<br></span>
 * <span style="margin-left: 30px">sip: {,<br></span>
 * <span style="margin-left: 60px">sipUriContactParameters:undefined,<br></span>
 * <span style="margin-left: 60px">sipUserAgent:"WebRTCommTestWebApp/0.0.1",<br></span>
 * <span style="margin-left: 60px">sipUserAgentCapabilities=undefined,<br></span>
 * <span style="margin-left: 60px">sipOutboundProxy:"ws://localhost:5082",<br></span>
 * <span style="margin-left: 60px">sipDomain:"sip.net",<br></span>
 * <span style="margin-left: 60px">sipUserName:"alice",<br></span>
 * <span style="margin-left: 60px">sipLogin:"alice@sip.net,<br></span>
 * <span style="margin-left: 60px">sipPassword:"1234567890",<br></span>
 * <span style="margin-left: 60px">sipRegisterMode:true,<br></span>
 * <span style="margin-left: 30px">}<br></span>
 * <span style="margin-left: 30px">RTCPeerConnection: {,<br></span>
 * <span style="margin-left: 60px"stunServer:undefined,<br></span>
 * <span style="margin-left: 30px">}<br></span>
 * }<br>
 *  </p>
 * @throw {String} Exception "bad argument, check API documentation"
 * @throw {String} Exception "bad configuration, missing parameter"
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception [internal error]
 */
WebRTCommClient.prototype.open = function(configuration) {
	if (typeof(configuration) === 'object') {
		if (this.isOpened() === false) {
			if (this.checkConfiguration(configuration) === true) {
				this.configuration = configuration;
				if (configuration.communicationMode === WebRTCommClient.prototype.SIP) {
					this.connector = new PrivateJainSipClientConnector(this);
					this.connector.open(this.configuration.sip);
				}
			} else {
				console.error("WebRTCommClient:open(): bad configuration");
				throw "WebRTCommClient:open(): bad configuration";
			}
		} else {
			console.error("WebRTCommClient:open(): bad state, unauthorized action");
			throw "WebRTCommClient:open(): bad state, unauthorized action";
		}
	} else {
		console.error("WebRTCommClient:open(): bad argument, check API documentation");
		throw "WebRTCommClient:open(): bad argument, check API documentation"
	}
};

/**
 * Close the WebRTC communication client, asynchronous action, closed event is notified to the eventListener
 * @public 
 * @throw {String} Exception "bad argument, check API documentation"
 * @throw {String} Exception "bad configuration, missing parameter"
 * @throw {String} Exception "bad state, unauthorized action"
 */
WebRTCommClient.prototype.close = function() {
	console.debug("WebRTCommClient:close()");
	if (this.isOpened()) {
		try {
			this.closePendingFlag = true;
			this.connector.close();
		} catch (exception) {
			console.error("WebRTCommClient:close(): catched exception:" + exception);
			// Force notification of closed event to listener
			this.closePendingFlag = false;
			this.connector = undefined;
			if (this.eventListener.onWebRTCommClientClosedEvent !== undefined) {
				var that = this;
				setTimeout(function() {
					try {
						that.eventListener.onWebRTCommClientClosedEvent(that);
					} catch (exception) {
						console.error("WebRTCommClient:onWebRTCommClientClosed(): catched exception in event listener:" + exception);
					}
				}, 1);
			}
		}
	}
};



/**
 * Send a short text message using transport (e.g SIP)  implemented by the connector
 * @public 
 * @param {String} to destination identifier (Tel URI, SIP URI: sip:bob@sip.net)
 * @param {String} text Message to send <br>
 * @throw {String} Exception "bad argument, check API documentation"
 * @throw {String} Exception "bad configuration, missing parameter"
 * @throw {String} Exception "bad state, unauthorized action"
 * @returns {WebRTCommMessage} new created WebRTCommMessage object
 */
WebRTCommClient.prototype.sendMessage = function(to, text) {
	try {
		console.debug("WebRTCommClient:sendMessage(): to=" + to);
		console.debug("WebRTCommClient:sendMessage(): text=" + text);
		if (this.isOpened()) {
			var newWebRTCommMessage = new WebRTCommMessage(this, undefined);
			newWebRTCommMessage.to = to;
			newWebRTCommMessage.text = text;
			newWebRTCommMessage.connector.send();
			return newWebRTCommMessage;
		} else {
			console.error("WebRTCommClient:sendMessage(): bad state, unauthorized action");
			throw "WebRTCommClient:sendMessage(): bad state, unauthorized action";
		}
	} catch (exception) {
		console.error("WebRTCommClient:sendMessage(): catched exception:" + exception);
		throw "WebRTCommClient:sendMessage(): catched exception:" + exception;
	}
};

/**
 * Request a WebRTC communication, asynchronous action, call events are notified to the eventListener 
 * @public 
 * @param {string} calleePhoneNumber Callee contact identifier (Tel URI, SIP URI: sip:bob@sip.net)
 * @param {object} callConfiguration Communication configuration <br>
 * <p> Communication configuration sample: <br>
 * { <br>
 * <span style="margin-left: 30px">displayName:alice,<br></span>
 * <span style="margin-left: 30px">localMediaStream: [LocalMediaStream],<br></span>
 * <span style="margin-left: 30px">audioMediaFlag:true,<br></span>
 * <span style="margin-left: 30px">videoMediaFlag:false,<br></span>
 * <span style="margin-left: 30px">dataMediaFlag:false,<br></span>
 * <span style="margin-left: 30px">audioCodecsFilter:PCMA,PCMU,OPUS,<br></span>
 * <span style="margin-left: 30px">videoCodecsFilter:VP8,H264,<br></span>
 * <span style="margin-left: 30px">opusFmtpCodecsParameters:maxaveragebitrate=128000,<br></span>
 * }<br>
 * </p>
 * @returns {WebRTCommCall} new created WebRTCommCall object
 * @throw {String} Exception "bad argument, check API documentation"
 * @throw {String} Exception "bad configuration, missing parameter"
 * @throw {String} Exception "bad state, unauthorized action"
 */
WebRTCommClient.prototype.call = function(calleePhoneNumber, callConfiguration) {
	console.debug("WebRTCommClient:call():calleePhoneNumber=" + calleePhoneNumber);
	console.debug("WebRTCommClient:call():callConfiguration=" + JSON.stringify(callConfiguration));
	try {
		if (typeof(calleePhoneNumber) === 'string' && typeof(callConfiguration) === 'object') {
			if (this.isOpened()) {
				var newWebRTCommCall = new WebRTCommCall(this);
				newWebRTCommCall.connector = this.connector.createPrivateSessionConnector(newWebRTCommCall);
				newWebRTCommCall.open(calleePhoneNumber, callConfiguration);
				return newWebRTCommCall;
			} else {
				console.error("WebRTCommClient:call(): bad state, unauthorized action");
				throw "WebRTCommClient:call(): bad state, unauthorized action";
			}
		} else {
			console.error("WebRTCommClient:call(): bad argument, check API documentation");
			throw "WebRTCommClient:call(): bad argument, check API documentation"
		}
	} catch (exception) {
		console.error("WebRTCommClient:call(): catched exception:" + exception);
		throw exception;
	}
};


/**
 * Check validity of the client configuration 
 * @private
 * @param {object} configuration client configuration
 *  * <p> Client configuration sample: <br>
 * { <br>
 * <span style="margin-left: 30px">communicationMode:WebRTCommClient.prototype.SIP,<br></span>
 * <span style="margin-left: 30px">sip: {,<br></span>
 * <span style="margin-left: 60px">sipUriContactParameters:undefined,<br></span>
 * <span style="margin-left: 60px">sipUserAgent:"WebRTCommTestWebApp/0.0.1",<br></span>
 * <span style="margin-left: 60px">sipUserAgentCapabilities=undefined,<br></span>
 * <span style="margin-left: 60px">sipOutboundProxy:"ws://localhost:5082",<br></span>
 * <span style="margin-left: 60px">sipDomain:"sip.net",<br></span>
 * <span style="margin-left: 60px">sipUserName:"alice",<br></span>
 * <span style="margin-left: 60px">sipLogin:"alice@sip.net,<br></span>
 * <span style="margin-left: 60px">sipPassword:"1234567890",<br></span>
 * <span style="margin-left: 60px">sipRegisterMode:true,<br></span>
 * <span style="margin-left: 30px">}<br></span>
 * <span style="margin-left: 30px">RTCPeerConnection: {,<br></span>
 * <span style="margin-left: 60px"stunServer:undefined,<br></span>
 * <span style="margin-left: 30px">}<br></span>
 * }<br>
 *  </p>
 * @returns {boolean} true valid false unvalid
 */
WebRTCommClient.prototype.checkConfiguration = function(configuration) {
	// don't want the password part of the configuration logged, so let's make a deep copy of 'configuration' and then delete the password key/value
	var passwordSafeConfiguration = JSON.parse(JSON.stringify(configuration));
	if (configuration.sip.sipPassword != null) {
		delete passwordSafeConfiguration.sip.sipPassword;
	}

	console.debug("WebRTCommClient:checkConfiguration(): configuration=" + JSON.stringify(passwordSafeConfiguration));
	var check = true;
	if (configuration.communicationMode !== undefined) {
		if (configuration.communicationMode === WebRTCommClient.prototype.SIP) {} else {
			check = false;
			console.error("WebRTCommClient:checkConfiguration(): unsupported communicationMode");
		}
	} else {
		check = false;
		console.error("WebRTCommClient:checkConfiguration(): missing configuration parameter communicationMode");
	}
	return check;
};

/**
 * Implements PrivateClientConnector opened event listener interface
 * @private
 */
WebRTCommClient.prototype.onPrivateClientConnectorOpenedEvent = function() {
	console.debug("WebRTCommClient:onPrivateClientConnectorOpenedEvent()");
	if (this.eventListener.onWebRTCommClientOpenedEvent !== undefined) {
		var that = this;
		setTimeout(function() {
			try {
				that.eventListener.onWebRTCommClientOpenedEvent();
			} catch (exception) {
				console.error("WebRTCommClient:onPrivateClientConnectorOpenedEvent(): catched exception in event listener:" + exception);
			}
		}, 1);
	}
};

/**
 * Implements PrivateClientConnector error event listener interface
 * @private
 * @param {string} error Error message
 */
WebRTCommClient.prototype.onPrivateClientConnectorOpenErrorEvent = function(error) {
	console.debug("WebRTCommClient:onPrivateClientConnectorOpenErrorEvent():error:" + error);
	// Force closing of the client
	try {
		this.close();
	} catch (exception) {}

	if (this.eventListener.onWebRTCommClientOpenErrorEvent !== undefined) {
		var that = this;
		setTimeout(function() {
			try {
				that.eventListener.onWebRTCommClientOpenErrorEvent(error);
			} catch (exception) {
				console.error("WebRTCommClient:onPrivateClientConnectorOpenErrorEvent(): catched exception in event listener:" + exception);
			}
		}, 1);
	}
};

/**
 * Implements PrivateClientConnector closed event listener interface
 * @callback PrivatePrivateClientConnector interface
 * @private
 */

WebRTCommClient.prototype.onPrivateClientConnectorClosedEvent = function() {
	console.debug("WebRTCommClient:onPrivateClientConnectorClosedEvent()");
	var wasOpenedFlag = this.isOpened() || this.closePendingFlag;

	// Close properly the client
	try {
		if (this.closePendingFlag === false)
			this.close();
		else
			this.connector = undefined;
	} catch (exception) {}

	if (wasOpenedFlag && (this.eventListener.onWebRTCommClientClosedEvent !== undefined)) {
		var that = this;
		setTimeout(function() {
			try {
				that.eventListener.onWebRTCommClientClosedEvent();
			} catch (exception) {
				console.error("WebRTCommClient:onPrivateClientConnectorClosedEvent(): catched exception in event listener:" + exception);
			}
		}, 1);
	} else if (!wasOpenedFlag && (this.eventListener.onWebRTCommClientOpenErrorEvent !== undefined)) {
		var that = this;
		setTimeout(function() {
			try {
				that.eventListener.onWebRTCommClientOpenErrorEvent("Connection to WebRTCommServer has failed");
			} catch (exception) {
				console.error("WebRTCommClient:onWebRTCommClientOpenErrorEvent(): catched exception in event listener:" + exception);
			}
		}, 1);
	}
};

// Notice that in order to gain some speed (since this will be invoked A LOT), we use a hardcoded number of digits
// This add padding for a padding size that is equal or less than 2x inputNumber string length. For bigger padding sizes
// it will just return original inputNumber
function padNumberWithZeroes(inputNumber, paddingSize) {
	// nothing to do if padding size is smaller or equal than string length, lets bail right away
	if (paddingSize <= inputNumber.toString().length) {
		return inputNumber;
	}
	var s = "000000000" + inputNumber;

	// With this method we can pad only if requested paddingSize if at most 2x number length. If more than that 
	// let's return original number to be safe
	if (paddingSize > 2 * (inputNumber.toString().length)) {
		return inputNumber;
	}

	return s.substr(s.length - paddingSize);
}

// Retrieve a timestamp string in the form: YYYY-MM-DD HH-MM-SS.MMMM
function getTimestamp()
{
	var currentDate = new Date(); 
	var timestamp = currentDate.getFullYear() + "-" +
		padNumberWithZeroes(currentDate.getDate(), 2) + "-" +
		padNumberWithZeroes((currentDate.getMonth() + 1), 2)  + " " +
		padNumberWithZeroes(currentDate.getHours(), 2) + ":" +
		padNumberWithZeroes(currentDate.getMinutes(), 2) + ":" + 
		padNumberWithZeroes(currentDate.getSeconds(), 2) + "." +
		padNumberWithZeroes(currentDate.getMilliseconds(), 3);
	return timestamp;
}

// Common logging function called by all the others with appropriate logging function
function commonLog(logger, args, includeStackTrace)
{
	var e = new Error('dummy-exception');
	var stack = e.stack; 
	var isFirefox = typeof InstallTrigger !== 'undefined';

	if (!isFirefox) {
		// specially for chrome there's a header in the stack that we need to remove
		stack = stack.replace(/^.*?dummy-exception.*?\n/gm, '');
	}

	if (includeStackTrace !== undefined && includeStackTrace == true) {
		if (isFirefox) {
			// stack trace has been requested, let's add tabs in the beginning for beautification (just for Firefox since for Chrome its already beautified)
			stack = stack.replace(/^/gm, "\t");
		}
	}
	else {
		stack = stack.split('\n');
	}

	// what this does is prepend element given as second argument, in array given as first argument
	Array.prototype.unshift.call(args, getTimestamp());

	if (includeStackTrace !== undefined && includeStackTrace == true) {
		// similarly, this appends the seconds argument, hence the stack trace, to the args array
		Array.prototype.push.call(args, "\n\nStack trace: \n" + stack);
	}
	else {
		var checkedStack;
		// normally stack should have at least 3 elements: current function, startup setup function below, and actual calling point, 
		// but let's add a check just in case
		if (stack.length >= 3) {
			checkedStack = stack[2];
			checkedStack = checkedStack.replace(/^\s*at\s*/, '')
		}
		else {
			checkedStack = stack;
		}
		Array.prototype.push.call(args, "\n\t[" + checkedStack + "]");
	}

	// do the actual logging
	logger.apply(this, args);
}

// Let's override the console logging methods, to be able to add timestamps always
(function() {
	if (window.console && console.debug) {
		var oldConsoleDebug = console.debug;
		console.debug = function() {
			commonLog(oldConsoleDebug, arguments);
		}
	}  
	if (window.console && console.log) {
		var oldConsoleLog = console.log;
		console.log = function() {
			commonLog(oldConsoleLog, arguments);
		}
	}  
	if (window.console && console.info) {
		var oldConsoleInfo = console.info;
		console.info = function() {
			commonLog(oldConsoleInfo, arguments);
		}
	}  
	if (window.console && console.warn) {
		var oldConsoleWarn = console.warn;
		console.warn = function() {
			commonLog(oldConsoleWarn, arguments);
		}
	}  
	if (window.console && console.error) {
		var oldConsoleError = console.error;
		console.error = function() {
			commonLog(oldConsoleError, arguments, true);
		}
	}  
})();

