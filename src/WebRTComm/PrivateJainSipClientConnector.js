/**
 * @class PrivateJainSipClientConnector
 * @classdesc Private framework class handling  SIP client/user agent control 
 * @constructor 
 * @private
 * @param {WebRTCommClient} webRTCommClient "connected" WebRTCommClient object 
 * @throw {String} Exception "bad argument"
 * @author Laurent STRULLU (laurent.strullu@orange.com) 
 */
PrivateJainSipClientConnector = function(webRTCommClient) {
	console.debug("PrivateJainSipClientConnector:PrivateJainSipClientConnector()");
	if (webRTCommClient instanceof WebRTCommClient) {
		this.webRTCommClient = webRTCommClient;
		this.reset();
	} else {
		throw "PrivateJainSipClientConnector:PrivateJainSipClientConnector(): bad arguments"
	}
};

// Private webRtc class variable
PrivateJainSipClientConnector.prototype.SIP_ALLOW_HEADER = "Allow: INVITE,ACK,CANCEL,BYE,OPTIONS,MESSAGE";

//  State of SIP REGISTER state machine
PrivateJainSipClientConnector.prototype.SIP_UNREGISTERED_STATE = "SIP_UNREGISTERED_STATE";
PrivateJainSipClientConnector.prototype.SIP_REGISTERING_STATE = "SIP_REGISTERING_STATE";
PrivateJainSipClientConnector.prototype.SIP_REGISTER_REFRESHING_STATE = "SIP_REGISTER_REFRESHING_STATE";
PrivateJainSipClientConnector.prototype.SIP_REGISTERING_401_STATE = "SIP_REGISTERING_401_STATE";
PrivateJainSipClientConnector.prototype.SIP_REGISTERED_STATE = "SIP_REGISTERED_STATE";
PrivateJainSipClientConnector.prototype.SIP_UNREGISTERING_401_STATE = "SIP_UNREGISTERING_401_STATE";
PrivateJainSipClientConnector.prototype.SIP_UNREGISTERING_STATE = "SIP_UNREGISTERING_STATE";
PrivateJainSipClientConnector.prototype.SIP_SESSION_EXPIRATION_TIMER = 3600;
PrivateJainSipClientConnector.prototype.SIP_REGISTER_REFRESH_TIMER = 3550;

/**
 * Get SIP client/user agent opened/closed status 
 * @public
 * @returns {boolean} true if opened, false if closed
 */
PrivateJainSipClientConnector.prototype.isOpened = function() {
	return this.openedFlag;
};


/**
 * Open SIP client/user agent, asynchronous action, opened or error event is notified to WebRtcClientComm
 * @public 
 * @param {object} configuration   SIP client/user agent configuration <br>
 * <p> Client configuration sample: <br>
 * { <br>
 * <span style="margin-left: 60px">sipUriContactParameters:undefined,<br></span>
 * <span style="margin-left: 30px">sipUserAgent:"WebRtcCommTestWebApp/0.0.1",<br></span>
 * <span style="margin-left: 30px">sipUserAgentCapabilities:"+g.oma.sip-im",<br></span>
 * <span style="margin-left: 30px">sipOutboundProxy:"ws://localhost:5082",<br></span>
 * <span style="margin-left: 30px">sipDomain:"sip.net",<br></span>
 * <span style="margin-left: 30px">sipUserName:"alice",<br></span>
 * <span style="margin-left: 30px">sipLogin:"alice@sip.net,<br></span>
 * <span style="margin-left: 30px">sipPassword:"1234567890",<br></span>
 * <span style="margin-left: 30px">sipRegisterMode:true,<br></span>
 * }<br>
 *  </p>
 * @throw {String} Exception "bad argument"
 * @throw {String} Exception "bad configuration, missing parameter"
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception [internal error]
 */
PrivateJainSipClientConnector.prototype.open = function(configuration) {
	console.debug("PrivateJainSipClientConnector:open()");
	try {
		if (typeof(configuration) === 'object') {
			if (this.openedFlag === false) {
				if (this.checkConfiguration(configuration) === true) {
					this.configuration = configuration;

					// Create JAIN SIP main objects
					this.jainSipFactory = new SipFactory();
					this.jainSipStack = this.jainSipFactory.createSipStack(this.configuration.sipUserAgent);
					this.jainSipListeningPoint = this.jainSipStack.createListeningPoint(this.configuration.sipOutboundProxy);
					this.jainSipProvider = this.jainSipStack.createSipProvider(this.jainSipListeningPoint);
					this.jainSipProvider.addSipListener(this);
					this.jainSipHeaderFactory = this.jainSipFactory.createHeaderFactory();
					this.jainSipAddressFactory = this.jainSipFactory.createAddressFactory();
					this.jainSipMessageFactory = this.jainSipFactory.createMessageFactory();
					this.jainSipContactHeader = this.jainSipListeningPoint.createContactHeader(this.configuration.sipUserName);
					if (this.configuration.sipUserAgentCapabilities) {
						this.jainSipContactHeader.setParameter(this.configuration.sipUserAgentCapabilities, null);
					}
					if (this.configuration.sipUriContactParameters) {
						try {
							var sipUri = this.jainSipContactHeader.getAddress().getURI();
							var parameters = this.configuration.sipUriContactParameters.split(";");
							for (var i = 0; i < parameters.length; i++) {
								var nameValue = parameters[i].split("=");
								sipUri.uriParms.set_nv(new NameValue(nameValue[0], nameValue[1]));
							}
						} catch (exception) {
							console.error("PrivateJainSipClientConnector:open(): catched exception:" + exception);
						}
					}

					this.jainSipMessageFactory.setDefaultUserAgentHeader(this.jainSipHeaderFactory.createUserAgentHeader(this.jainSipStack.getUserAgent()));
					this.jainSipStack.start();
				} else {
					console.error("PrivateJainSipClientConnector:open(): bad configuration");
					throw "PrivateJainSipClientConnector:open(): bad configuration";
				}
			} else {
				console.error("PrivateJainSipClientConnector:open(): bad state, unauthorized action");
				throw "PrivateJainSipClientConnector:open(): bad state, unauthorized action";
			}
		} else {
			console.error("PrivateJainSipClientConnector:open(): bad argument, check API documentation");
			throw "PrivateJainSipClientConnector:open(): bad argument, check API documentation"
		}
	} catch (exception) {
		this.reset();
		console.error("PrivateJainSipClientConnector:open(): catched exception:" + exception);
		throw exception;
	}
};

/**
 * Close SIP client/User Agent, asynchronous action,closed event is notified to WebRtcClientComm
 * Open SIP Call/communication are closed
 * @public 
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception [internal error]
 */
PrivateJainSipClientConnector.prototype.close = function() {
	console.debug("PrivateJainSipClientConnector:close()");
	try {
		if (this.openedFlag === true) {
			//Force close of open SIP communication
			for (var sipSessionId in this.sessionConnectors) {

				var sessionConnector = this.sessionConnectors[sipSessionId];
				if (sessionConnector instanceof PrivateJainSipCallConnector) {
					if (sessionConnector.isOpened()) {
						sessionConnector.close();
					}
				}
			}
			if (this.configuration.sipRegisterMode === true) {
				if (this.sipRegisterState === this.SIP_REGISTERED_STATE) {
					this.sipUnregisterPendingFlag = false;
					this.sipRegisterState = this.SIP_UNREGISTERING_STATE;
					if (this.sipRegisterRefreshTimer) {
						// Cancel SIP REGISTER refresh timer
						clearTimeout(this.sipRegisterRefreshTimer);
					}
					this.sendNewSipRegisterRequest(0);
				} else {
					// Refresh SIP REGISTER ongoing, wait the end and excute SIP unregistration
					this.sipUnregisterPendingFlag = true;
				}
			} else {
				this.reset();
				this.webRTCommClient.onPrivateClientConnectorClosedEvent();
			}
		} else {
			console.error("PrivateJainSipClientConnector:close(): bad state, unauthorized action");
			throw "PrivateJainSipClientConnector:close(): bad state, unauthorized action";
		}
	} catch (exception) {
		console.error("PrivateJainSipClientConnector:close(): catched exception:" + exception);
		throw exception;
	}
};


/**
 * Create new CallConnector object
 * @public 
 * @param {WebRTCommCall|WebRTCommMessage} webRTCommSession connected "object"
 * @param {string} sipSessionId SIP CALL ID
 * @throw {String} Exception "bad argument, check API documentation"
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception [internal error]
 */
PrivateJainSipClientConnector.prototype.createPrivateSessionConnector = function(webRTCommSession, sipSessionId) {
	console.debug("PrivateJainSipClientConnector:createPrivateSessionConnector()");
	try {
		if (this.openedFlag === true) {
			if (webRTCommSession instanceof WebRTCommCall) {
				var sessionConnector = new PrivateJainSipCallConnector(this, webRTCommSession, sipSessionId);
				console.debug("PrivateJainSipClientConnector:createPrivateSessionConnector():sessionConnector.sipCallId=" + sessionConnector.sipCallId);
				this.sessionConnectors[sessionConnector.sipCallId] = sessionConnector;
				return sessionConnector;

			} else if (webRTCommSession instanceof WebRTCommMessage) {
				var sessionConnector = new PrivateJainSipMessageConnector(this, webRTCommSession, sipSessionId);
				console.debug("PrivateJainSipClientConnector:createPrivateSessionConnector():sessionConnector.sipCallId=" + sessionConnector.sipCallId);
				this.sessionConnectors[sessionConnector.sipCallId] = sessionConnector;
				return sessionConnector;
			} else {
				console.error("PrivateJainSipClientConnector:createPrivateSessionConnector(): bad argument, check API documentation");
				throw "PrivateJainSipClientConnector:createPrivateSessionConnector(): bad argument, check API documentation"
			}
		}
		console.error("PrivateJainSipClientConnector:createPrivateSessionConnector(): bad state, unauthorized action");
		throw "PrivateJainSipClientConnector:createPrivateSessionConnector(): bad state, unauthorized action";
	} catch (exception) {
		console.error("PrivateJainSipClientConnector:createPrivateSessionConnector(): catched exception:" + exception);
		throw exception;
	}
};


/**
 * Remove a PrivateJainSipClientConnector object  in the call table
 * @private
 * @param {string} sipSessionId SIP CALL ID 
 */
PrivateJainSipClientConnector.prototype.removeSessionConnector = function(sipSessionId) {
	console.debug("PrivateJainSipClientConnector:removeSessionConnector(): sipSessionId=" + sipSessionId);
	delete this.sessionConnectors[sipSessionId];
};

/**
 * Check if JainSipClient is busy. We 're deemed busy if there a call in any state
 * @public
 * @return true if client is busy, false otherwise
 */
PrivateJainSipClientConnector.prototype.clientIsBusy = function() {
	var isBusy = false;
	for (var sipCallId in this.sessionConnectors) {
		var sessionConnector = this.sessionConnectors[sipCallId];
		if (sessionConnector instanceof PrivateJainSipCallConnector) {
			// if sessionConnection of type PrivateJainSipCallConnector exists in any state we are deemed busy
			isBusy = true;
			break;
		}
	}
	console.debug("PrivateJainSipClientConnector:clientIsBusy(): " + isBusy);
	return isBusy;
};

/**
 * Reset client context
 * @private
 */
PrivateJainSipClientConnector.prototype.reset = function() {
	console.debug("PrivateJainSipClientConnector:reset()");
	this.openedFlag = false;
	this.configuration = undefined;
	this.resetSipRegisterContext();
	this.sessionConnectors = {};
};

/**
 * Reset SIP register context
 * @private
 */
PrivateJainSipClientConnector.prototype.resetSipRegisterContext = function() {
	console.debug("PrivateJainSipClientConnector:resetSipRegisterContext()");
	if (this.sipRegisterRefreshTimer !== undefined)
		clearTimeout(this.sipRegisterRefreshTimer);
	this.sipRegisterState = this.SIP_UNREGISTERED_STATE;
	this.sipRegisterRefreshTimer = undefined;
	this.sipRegisterAuthenticatedFlag = false;
	this.jainSipRegisterRequest = undefined;
	this.jainSipRegisterTransaction = undefined;
	this.jainSipRegisterDialog = undefined;
	this.sipUnregisterPendingFlag = false;
};

/**
 * Check configuration 
 * @private
 * @param {object} configuration SIP user agent configuration
 * * <p> Client configuration sample: <br>
 * { <br>
 * <span style="margin-left: 30px">sipUserAgent:"WebRtcCommTestWebApp/0.0.1",<br></span>
 * <span style="margin-left: 30px">sipUserAgentCapabilities:"+g.oma.sip-im",<br></span>
 * <span style="margin-left: 30px">sipOutboundProxy:"ws://localhost:5082",<br></span>
 * <span style="margin-left: 30px">sipDomain:"sip.net",<br></span>
 * <span style="margin-left: 30px">sipUserName:"alice",<br></span>
 * <span style="margin-left: 30px">sipLogin:"alice@sip.net,<br></span>
 * <span style="margin-left: 30px">sipPassword:"1234567890",<br></span>
 * <span style="margin-left: 30px">sipUserAgentCapabilities,<br></span>
 * <span style="margin-left: 30px">sipRegisterMode:true,<br></span>
 * }<br>
 *  </p>
 * @return true configuration ok false otherwise
 */
PrivateJainSipClientConnector.prototype.checkConfiguration = function(configuration) {
	console.debug("PrivateJainSipClientConnector:checkConfiguration()");
	try {
		var check = true;
		// sipLogin, sipPassword, sipUserAgentCapabilities not mandatory
		if (configuration.sipUserAgent === undefined || configuration.sipUserAgent.length === 0) {
			check = false;
			console.error("PrivateJainSipClientConnector:checkConfiguration(): missing configuration parameter sipUserAgent");
		}

		// stunServer, sipLogin, sipPassword, sipApplicationprofile not mandatory
		if (configuration.sipOutboundProxy === undefined || configuration.sipOutboundProxy.length === 0) {
			check = false;
			console.error("PrivateJainSipClientConnector:checkConfiguration(): missing configuration parameter sipOutboundProxy");
		}

		if (configuration.sipDomain === undefined || configuration.sipDomain.length === 0) {
			check = false;
			console.error("PrivateJainSipClientConnector:checkConfiguration(): missing configuration parameter sipDomain");
		}

		if (configuration.sipUserName === undefined || configuration.sipUserName.length === 0) {
			check = false;
			console.error("PrivateJainSipClientConnector:checkConfiguration(): missing configuration parameter sipUserName");
		}

		if (configuration.sipRegisterMode === undefined || configuration.sipRegisterMode.length === 0) {
			check = false;
			console.error("PrivateJainSipClientConnector:checkConfiguration(): missing configuration parameter sipRegisterMode");
		}

		if (configuration.sipLogin !== undefined && configuration.sipLogin === "") {
			configuration.sipLogin = undefined;
		}

		if (configuration.sipPassword !== undefined && configuration.sipPassword === "") {
			configuration.sipPassword = undefined;
		}

		if (configuration.sipUserAgentCapabilities !== undefined && configuration.sipUserAgentCapabilities === "") {
			configuration.sipUserAgentCapabilities = undefined;
		}

		console.debug("PrivateJainSipClientConnector:checkConfiguration(): configuration.sipUserAgent:" + configuration.sipUserAgent);
		console.debug("PrivateJainSipClientConnector:checkConfiguration(): configuration.sipUserAgentCapabilities:" + configuration.sipUserAgentCapabilities);
		console.debug("PrivateJainSipClientConnector:checkConfiguration(): configuration.sipOutboundProxy:" + configuration.sipOutboundProxy);
		console.debug("PrivateJainSipClientConnector:checkConfiguration(): configuration.sipDomain:" + configuration.sipDomain);
		console.debug("PrivateJainSipClientConnector:checkConfiguration(): configuration.sipUserName:" + configuration.sipUserName);
		console.debug("PrivateJainSipClientConnector:checkConfiguration(): configuration.sipLogin:" + configuration.sipLogin);
		console.debug("PrivateJainSipClientConnector:checkConfiguration(): configuration.sipRegisterMode:" + configuration.sipRegisterMode);
		return check;
	} catch (exception) {
		console.error("PrivateJainSipClientConnector:checkConfiguration(): catched exception:" + exception);
		return false;
	}
};

/**
 * Implementation of JAIN SIP stack event listener interface: process WebSocket connection event
 * @public 
 */
PrivateJainSipClientConnector.prototype.processConnected = function() {
	console.debug("PrivateJainSipClientConnector:processConnected()");
	try {
		// Start SIP REGISTER process
		if (this.openedFlag === false) {
			if (this.configuration.sipRegisterMode === true) {
				this.resetSipRegisterContext();
				// Send SIP REGISTER request
				this.sendNewSipRegisterRequest(this.SIP_SESSION_EXPIRATION_TIMER);
				this.sipRegisterState = this.SIP_REGISTERING_STATE;
				return;
			} else {
				this.openedFlag = true;
				this.webRTCommClient.onPrivateClientConnectorOpenedEvent();
				return;
			}
		} else {
			console.error("PrivateJainSipClientConnector:processConnected(): this.openedFlag==true !");
		}

		// Open failed
		this.reset();
		this.webRTCommClient.onPrivateClientConnectorOpenErrorEvent();
	} catch (exception) {
		this.reset();
		this.webRTCommClient.onPrivateClientConnectorOpenErrorEvent();
		console.error("PrivateJainSipClientConnector:processConnected(): catched exception:" + exception);
	}
};


/**
 * Send SIP REGISTER request 
 * @param {int} expiration
 * @private
 */
PrivateJainSipClientConnector.prototype.sendNewSipRegisterRequest = function(expiration) {
	console.debug("PrivateJainSipClientConnector:sendNewSipRegisterRequest()");
	var fromSipUriString = this.configuration.sipUserName + "@" + this.configuration.sipDomain;
	var jainSipCseqHeader = this.jainSipHeaderFactory.createCSeqHeader(1, "REGISTER");
	var jainSipCallIdHeader = this.jainSipHeaderFactory.createCallIdHeader(new String(new Date().getTime()));
	var jainSipExpiresHeader = this.jainSipHeaderFactory.createExpiresHeader(expiration);
	var jainSipMaxForwardHeader = this.jainSipHeaderFactory.createMaxForwardsHeader(70);
	var jainSipRequestUri = this.jainSipAddressFactory.createSipURI_user_host(null, this.configuration.sipDomain);
	var jainSipAllowListHeader = this.jainSipHeaderFactory.createHeaders(PrivateJainSipClientConnector.prototype.SIP_ALLOW_HEADER);
	var jainSipFromUri = this.jainSipAddressFactory.createSipURI_user_host(null, fromSipUriString);
	var jainSipFromAddress = this.jainSipAddressFactory.createAddress_name_uri(null, jainSipFromUri);
	var random = new Date();
	var tag = random.getTime();
	var jainSipFromHeader = this.jainSipHeaderFactory.createFromHeader(jainSipFromAddress, tag);
	var jainSipToHeader = this.jainSipHeaderFactory.createToHeader(jainSipFromAddress, null);
	var jainSipViaHeader = this.jainSipListeningPoint.getViaHeader();
	this.jainSipRegisterRequest = this.jainSipMessageFactory.createRequest(jainSipRequestUri, "REGISTER", jainSipCallIdHeader, jainSipCseqHeader, jainSipFromHeader, jainSipToHeader, jainSipViaHeader, jainSipMaxForwardHeader);
	this.jainSipMessageFactory.addHeader(this.jainSipRegisterRequest, jainSipExpiresHeader);
	this.jainSipMessageFactory.addHeader(this.jainSipRegisterRequest, jainSipAllowListHeader);
	this.jainSipMessageFactory.addHeader(this.jainSipRegisterRequest, this.jainSipContactHeader);

	this.jainSipRegisterTransaction = this.jainSipProvider.getNewClientTransaction(this.jainSipRegisterRequest);
	this.jainSipRegisterDialog = this.jainSipRegisterTransaction.getDialog();
	this.jainSipRegisterRequest.setTransaction(this.jainSipRegisterTransaction);
	this.jainSipRegisterTransaction.sendRequest();
};

/**
 * Send Authentitated SIP REGISTER request 
 * @param {AuthorizationHeader} jainSipAuthorizationHeader
 * @private
 */
PrivateJainSipClientConnector.prototype.sendAuthenticatedSipRegisterRequest = function(jainSipAuthorizationHeader) {
	console.debug("PrivateJainSipClientConnector:sendAuthenticatedSipRegisterRequest()");
	this.jainSipRegisterRequest.removeHeader("Authorization");
	var newJainSipRegisterRequest = new SIPRequest();
	newJainSipRegisterRequest.setMethod(this.jainSipRegisterRequest.getMethod());
	newJainSipRegisterRequest.setRequestURI(this.jainSipRegisterRequest.getRequestURI());
	var headerList = this.jainSipRegisterRequest.getHeaders();
	for (var i = 0; i < headerList.length; i++) {
		newJainSipRegisterRequest.addHeader(headerList[i]);
	}

	var num = new Number(this.jainSipRegisterRequest.getCSeq().getSeqNumber());
	newJainSipRegisterRequest.getCSeq().setSeqNumber(num + 1);
	newJainSipRegisterRequest.setCallId(this.jainSipRegisterRequest.getCallId());
	newJainSipRegisterRequest.setVia(this.jainSipListeningPoint.getViaHeader());
	newJainSipRegisterRequest.setFrom(this.jainSipRegisterRequest.getFrom());
	newJainSipRegisterRequest.setTo(this.jainSipRegisterRequest.getTo());
	newJainSipRegisterRequest.setMaxForwards(this.jainSipRegisterRequest.getMaxForwards());

	this.jainSipRegisterRequest = newJainSipRegisterRequest;
	this.jainSipMessageFactory.addHeader(this.jainSipRegisterRequest, jainSipAuthorizationHeader);
	this.jainSipRegisterTransaction = this.jainSipProvider.getNewClientTransaction(this.jainSipRegisterRequest);
	this.jainSipRegisterRequest.setTransaction(this.jainSipRegisterTransaction);
	this.jainSipRegisterTransaction.sendRequest();
};

/**
 * Implementation of JAIN SIP stack event listener interface: process WebSocket disconnection/close event
 * @public
 */
PrivateJainSipClientConnector.prototype.processDisconnected = function() {
	console.debug("PrivateJainSipClientConnector:processDisconnected(): SIP connectivity has been lost");
	try {
		this.reset();
		this.webRTCommClient.onPrivateClientConnectorClosedEvent();
	} catch (exception) {
		console.error("PrivateJainSipClientConnector:processDisconnected(): catched exception:" + exception);
	}
};

/**
 * Implementation of JAIN SIP stack event listener interface: process WebSocket connection error event
 * @public 
 * @param {string} error WebSocket connection error
 */
PrivateJainSipClientConnector.prototype.processConnectionError = function(error) {
	console.warn("PrivateJainSipClientConnector:processConnectionError(): SIP connection has failed, error:" + error);
	try {
		this.reset();
		this.webRTCommClient.onPrivateClientConnectorOpenErrorEvent();
	} catch (exception) {
		console.error("PrivateJainSipClientConnector:processConnectionError(): catched exception:" + exception);
	}
};

/**
 * Implementation of JAIN SIP stack event listener interface: process SIP request event
 * @public 
 * @param {RequestEvent} requestEvent JAIN SIP request event
 */
PrivateJainSipClientConnector.prototype.processRequest = function(requestEvent) {
	console.debug("PrivateJainSipClientConnector:processRequest()");
	try {
		var jainSipRequest = requestEvent.getRequest();
		console.debug("PrivateJainSipClientConnector:processRequest():jainSipRequest.getCallId().getCallId()=" + jainSipRequest.getCallId().getCallId());
		var jainSipRequestMethod = jainSipRequest.getMethod();
		if (jainSipRequestMethod === "OPTIONS") {
			this.processSipOptionRequest(requestEvent);
		} else {
			// Find related PrivateJainSipCallConnector (subsequent request)
			var sipSessionId = jainSipRequest.getCallId().getCallId();
			var sessionConnector = this.sessionConnectors[sipSessionId];
			if (sessionConnector) {
				sessionConnector.onJainSipClientConnectorSipRequestEvent(requestEvent);
			} else {
				if (jainSipRequestMethod === "INVITE") {
					// Incoming SIP INVITE
					if (this.clientIsBusy()) {
						// Client is already busy; decline new call with 480 Temporarily Unavailable
						var jainSipResponse480 = jainSipRequest.createResponse(480, "Temporarily Unavailable");
						jainSipResponse480.addHeader(this.jainSipContactHeader);
						requestEvent.getServerTransaction().sendResponse(jainSipResponse480);
						this.removeSessionConnector(sipSessionId);
						return;
					}

					var newWebRTCommCall = new WebRTCommCall(this.webRTCommClient);
					newWebRTCommCall.incomingCallFlag = true;
					newWebRTCommCall.connector = this.createPrivateSessionConnector(newWebRTCommCall, sipSessionId);
					newWebRTCommCall.id = newWebRTCommCall.connector.getId();
					newWebRTCommCall.connector.sipCallState = PrivateJainSipCallConnector.prototype.SIP_INVITED_INITIAL_STATE;
					newWebRTCommCall.connector.onJainSipClientConnectorSipRequestEvent(requestEvent);
				} else if (jainSipRequestMethod === "MESSAGE") {
					// Incoming SIP MESSAGE
					// Find WebRTCommCall linked with the message (if exist)
					var targetedWebRTCommCall = undefined;
					var from = requestEvent.getRequest().getHeader("From").getAddress().getURI().getUser();
					for (var sipCallId in this.sessionConnectors) {
						var sessionConnector = this.sessionConnectors[sipCallId];
						if (sessionConnector instanceof PrivateJainSipCallConnector) {
							if (sessionConnector.isOpened()) {
								if (sessionConnector.webRTCommCall.isIncoming() && sessionConnector.webRTCommCall.callerPhoneNumber === from) {
									targetedWebRTCommCall = sessionConnector.webRTCommCall;
									break;
								} else if (sessionConnector.webRTCommCall.calleePhoneNumber === from) {
									targetedWebRTCommCall = sessionConnector.webRTCommCall;
									break;
								}
							}
						}
					}

					// Build WebRTCommMessage
					var newWebRTCommMessage = new WebRTCommMessage(this.webRTCommClient, targetedWebRTCommCall);
					newWebRTCommMessage.connector.onJainSipClientConnectorSipRequestEvent(requestEvent);
				} else {
					console.warn("PrivateJainSipClientConnector:processRequest(): SIP request ignored");
					//@todo Should send SIP response 404 NOT FOUND or 501 NOT_IMPLEMENTED 				 
				}

			}
		}
	} catch (exception) {
		console.error("PrivateJainSipClientConnector:processRequest(): catched exception:" + exception);
	}
};


/**
 * Implementation of JAIN SIP stack event listener interface: process SIP response event
 * @public 
 * @param {ResponseEvent} responseEvent JAIN SIP response event
 */
PrivateJainSipClientConnector.prototype.processResponse = function(responseEvent) {
	console.debug("PrivateJainSipClientConnector:processResponse()");
	try {
		var jainSipResponse = responseEvent.getResponse();
		if (jainSipResponse.getCSeq().getMethod() === "REGISTER") {
			this.processSipRegisterResponse(responseEvent);
		} else {
			// Find related PrivateJainSipCallConnector
			var sipSessionId = jainSipResponse.getCallId().getCallId();
			var sessionConnector = this.sessionConnectors[sipSessionId];
			if (sessionConnector) {
				sessionConnector.onJainSipClientConnectorSipResponseEvent(responseEvent);
			} else {
				console.warn("PrivateJainSipClientConnector:processResponse(): PrivateJainSipCallConnector not found, SIP response ignored");
			}
		}
	} catch (exception) {
		console.error("PrivateJainSipClientConnector:processResponse(): catched exception:" + exception);
	}
};

/**
 * Implementation of JAIN SIP stack event listener interface: process SIP transaction terminated event
 * @public 
 */
PrivateJainSipClientConnector.prototype.processTransactionTerminated = function() {
	console.debug("PrivateJainSipClientConnector:processTransactionTerminated()");
};

/**
 * Implementation of JAIN SIP stack event listener interface: process SIP dialog terminated event
 * @public 
 */
PrivateJainSipClientConnector.prototype.processDialogTerminated = function() {
	console.debug("PrivateJainSipClientConnector:processDialogTerminated()");
};

/**
 * Implementation of JAIN SIP stack event listener interface: process I/O websocket  error event
 * @public 
 * @param {ExceptionEvent} exceptionEvent JAIN SIP exception event 
 */
PrivateJainSipClientConnector.prototype.processIOException = function(exceptionEvent) {
	console.error("PrivateJainSipClientConnector:processIOException(): exceptionEvent=" + exceptionEvent.message);
};

/**
 * Implementation of JAIN SIP stack event listener interface: process SIP Dialog Timeout event
 * @public 
 * @param {TimeoutEvent} timeoutEvent JAIN SIP timeout event
 */
PrivateJainSipClientConnector.prototype.processTimeout = function(timeoutEvent) {
	console.debug("PrivateJainSipClientConnector:processTimeout():timeoutEvent=" + timeoutEvent);
	try {
		var sipClientTransaction = timeoutEvent.getClientTransaction();
		// Find related PrivateJainSipCallConnector
		var sipCallId = sipClientTransaction.getDialog().getCallId().getCallId();
		var sessionConnector = this.sessionConnectors[sipCallId];
		if (sessionConnector) {
			sessionConnector.onJainSipClientConnectorSipTimeoutEvent(timeoutEvent);
		} else if (this.jainSipRegisterRequest.getCallId().getCallId() === sipCallId) {
			console.error("PrivateJainSipClientConnector:processTimeout(): SIP registration timed out, no response from SIP server, Call-Id: " + sipCallId + ". Retrying... ");

			// Let's retry register, notice that previous REGISTER timed out after 32 seconds, so we 're here after this interval and we shouldn't be stressing the server
			this.sendNewSipRegisterRequest(this.SIP_SESSION_EXPIRATION_TIMER);
			this.webRTCommClient.onPrivateClientConnectorOpenWarningEvent("Register Request Timeout");
		} else {
			console.warn("PrivateJainSipClientConnector:processTimeout(): no dialog found, SIP timeout ignored");
		}
	} catch (exception) {
		console.error("PrivateJainSipClientConnector:processTimeout(): catched exception:" + exception);
	}
};

/**
 * SIP REGISTER refresh timeout
 * @private 
 */
PrivateJainSipClientConnector.prototype.onSipRegisterTimeout = function() {
	console.debug("PrivateJainSipClientConnector:onSipRegisterTimeout()");
	try {
		if (this.sipRegisterState === this.SIP_REGISTERED_STATE) {
			this.sipRegisterRefreshTimer = undefined;
			this.sipRegisterState = this.SIP_REGISTER_REFRESHING_STATE;
			// Send SIP REGISTER request
			this.sendNewSipRegisterRequest(this.SIP_SESSION_EXPIRATION_TIMER);
		} else {
			console.warn("PrivateJainSipClientConnector:onSipRegisterTimeout(): SIP REGISTER refresh stopped");
		}
	} catch (exception) {
		console.error("PrivateJainSipClientConnector:onSipRegisterTimeout(): catched exception:" + exception);
	}
};


/**
 * SIP REGISTER state machine
 * @private 
 * @param {ResponseEvent} responseEvent JAIN SIP response to process
 */
PrivateJainSipClientConnector.prototype.processSipRegisterResponse = function(responseEvent) {
	console.debug("PrivateJainSipClientConnector:processSipRegisterResponse(): this.sipRegisterState=" + this.sipRegisterState);

	var jainSipResponse = responseEvent.getResponse();
	var statusCode = parseInt(jainSipResponse.getStatusCode());
	if (this.sipRegisterState === this.SIP_UNREGISTERED_STATE) {
		console.error("PrivateJainSipClientConnector:processSipRegisterResponse(): bad state, SIP response ignored");
	} else if ((this.sipRegisterState === this.SIP_REGISTERING_STATE) || (this.sipRegisterState === this.SIP_REGISTER_REFRESHING_STATE)) {
		if (statusCode < 200) {
			console.debug("PrivateJainSipClientConnector:processSipRegisterResponse(): 1XX response ignored");
		} else if (statusCode === 401 || statusCode === 407) {
			if (this.configuration.sipPassword !== undefined && this.configuration.sipLogin !== undefined) {
				this.sipRegisterState = this.SIP_REGISTERING_401_STATE;
				var jainSipAuthorizationHeader = this.jainSipHeaderFactory.createAuthorizationHeader(jainSipResponse, this.jainSipRegisterRequest, this.configuration.sipPassword, this.configuration.sipLogin);
				// Send authenticated SIP REGISTER request
				this.sendAuthenticatedSipRegisterRequest(jainSipAuthorizationHeader);
			} else {
				// Authentification required but not SIP credentials in SIP profile
				console.error("PrivateJainSipClientConnector:processSipRegisterResponse(): SIP registration failed:" + jainSipResponse.getStatusCode() + "  " + jainSipResponse.getStatusLine());
				this.reset();
				this.webRTCommClient.onPrivateClientConnectorOpenErrorEvent();
			}
		} else if (statusCode === 200) {
			this.sipRegisterState = this.SIP_REGISTERED_STATE;
			if (this.openedFlag === false) {
				this.openedFlag = true;
				this.webRTCommClient.onPrivateClientConnectorOpenedEvent();
			}

			if (this.sipUnregisterPendingFlag === true) {
				this.sipUnregisterPendingFlag = false;
				this.sipRegisterState = this.SIP_UNREGISTERING_STATE;
				if (this.sipRegisterRefreshTimer) {
					// Cancel SIP REGISTER refresh timer
					clearTimeout(this.sipRegisterRefreshTimer);
				}
				this.sendNewSipRegisterRequest(0);
			} else {
				// Start SIP REGISTER refresh timeout
				var that = this;
				if (this.sipRegisterRefreshTimer)
					clearTimeout(this.sipRegisterRefreshTimer);
				this.sipRegisterRefreshTimer = setTimeout(function() {
					that.onSipRegisterTimeout();
				}, this.SIP_REGISTER_REFRESH_TIMER * 1000);
			}
		} else {
			console.error("PrivateJainSipClientConnector:processSipRegisterResponse(): SIP registration failed:" + jainSipResponse.getStatusCode() + "  " + jainSipResponse.getStatusLine());
			this.reset();
			this.webRTCommClient.onPrivateClientConnectorOpenErrorEvent();
		}
	} else if (this.sipRegisterState === this.SIP_REGISTERING_401_STATE) {
		if (statusCode < 200) {
			//  No temporary response for SIP REGISTER request 
		} else if (statusCode === 200) {
			this.sipRegisterState = this.SIP_REGISTERED_STATE;
			if (this.openedFlag === false) {
				console.debug("PrivateJainSipClientConnector:processSipRegisterResponse(): this.openedFlag=true");
				this.openedFlag = true;
				this.webRTCommClient.onPrivateClientConnectorOpenedEvent();
			}

			if (this.sipUnregisterPendingFlag === true) {
				this.sipUnregisterPendingFlag = false;
				this.sipRegisterState = this.SIP_UNREGISTERING_STATE;
				if (this.sipRegisterRefreshTimer) {
					// Cancel SIP REGISTER refresh timer
					clearTimeout(this.sipRegisterRefreshTimer);
				}
				this.sendNewSipRegisterRequest(0);
			} else {
				// Start SIP REGISTER refresh timeout
				var that = this;
				if (this.sipRegisterRefreshTimer)
					clearTimeout(this.sipRegisterRefreshTimer);
				this.sipRegisterRefreshTimer = setTimeout(function() {
					that.onSipRegisterTimeout();
				}, this.SIP_REGISTER_REFRESH_TIMER * 1000);
			}
		} else {
			console.error("PrivateJainSipClientConnector:processSipRegisterResponse(): SIP registration failed:" + jainSipResponse.getStatusCode() + "  " + jainSipResponse.getStatusLine());
			this.reset();
			this.webRTCommClient.onPrivateClientConnectorOpenErrorEvent();
		}
	} else if (this.sipRegisterState === this.SIP_REGISTERED_STATE) {
		console.error("PrivateJainSipClientConnector:processSipRegisterResponse(): bad state, SIP response ignored");
	} else if (this.sipRegisterState === this.SIP_UNREGISTERING_STATE) {
		if (statusCode < 200) {
			//  Not temporary response for SIP REGISTER request  
		} else if (statusCode === 401 || statusCode === 407) {
			this.sipRegisterState = this.SIP_UNREGISTERING_401_STATE;
			jainSipAuthorizationHeader = this.jainSipHeaderFactory.createAuthorizationHeader(jainSipResponse, this.jainSipRegisterRequest, this.configuration.sipPassword, this.configuration.sipLogin);
			this.sendAuthenticatedSipRegisterRequest(jainSipAuthorizationHeader);
		} else if (statusCode === 200) {
			this.reset();
			this.webRTCommClient.onPrivateClientConnectorClosedEvent();
		} else {
			console.error("PrivateJainSipClientConnector:processSipRegisterResponse(): SIP unregistration failed:" + jainSipResponse.getStatusCode() + "  " + jainSipResponse.getStatusLine());
			this.reset();
			this.webRTCommClient.onPrivateClientConnectorClosedEvent();
		}
	} else if (this.sipRegisterState === this.SIP_UNREGISTERING_401_STATE) {
		if (statusCode < 200) {
			//  Not temporary response for SIP REGISTER request 
		} else if (statusCode === 200) {
			this.reset();
			this.webRTCommClient.onPrivateClientConnectorClosedEvent();
		} else {
			console.error("PrivateJainSipClientConnector:processSipRegisterResponse(): SIP unregistration failed:" + jainSipResponse.getStatusCode() + "  " + jainSipResponse.getStatusLine());
			this.reset();
			this.webRTCommClient.onPrivateClientConnectorClosedEvent();
		}
	} else if (this.sipRegisterState === this.SIP_UNREGISTERED_STATE) {
		console.error("PrivateJainSipClientConnector:processSipRegisterResponse(): bad state, SIP response ignored");
	} else {
		console.error("PrivateJainSipClientConnector:processSipRegisterResponse(): bad state, SIP response ignored");
	}
};



/**
 * Handle SIP OPTIONS RESPONSE (default behaviour: send 200 OK response)                  
 * @param {RequestEvent} requestEvent JAIN SIP request event to process
 * @private 
 */
PrivateJainSipClientConnector.prototype.processSipOptionRequest = function(requestEvent) {
	console.debug("PrivateJainSipClientConnector:processSipOptionRequest()");
	// Build SIP OPTIONS 200 OK response   
	var jainSipRequest = requestEvent.getRequest();
	var jainSip200OKResponse = jainSipRequest.createResponse(200, "OK");
	jainSip200OKResponse.addHeader(this.jainSipContactHeader);
	jainSip200OKResponse.removeHeader("P-Asserted-Identity");
	jainSip200OKResponse.removeHeader("P-Charging-Vector");
	jainSip200OKResponse.removeHeader("P-Charging-Function-Addresses");
	jainSip200OKResponse.removeHeader("P-Called-Party-ID");
	requestEvent.getServerTransaction().sendResponse(jainSip200OKResponse);
};
