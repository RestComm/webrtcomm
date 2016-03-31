/**
 * @class PrivateJainSipMessageConnector
 * @private
 * @classdesc Private framework class handling  SIP client/user message control 
 * @constructor
 * @param {PrivateJainSipClientConnector} clientConnector clientConnector owner object
 * @param {WebRTCommMessage} webRTCommMessage WebRTCommMessage "connected" object
 * @param {string} sipCallId   SIP Call ID
 * @throw {String} Exception "bad argument"
 * @author Laurent STRULLU (laurent.strullu@orange.com) 
 * @author Jean Deruelle (jean.deruelle@ŧelestax.com)
 */
PrivateJainSipMessageConnector = function(clientConnector, webRTCommMessage, sipCallId) {
	console.debug("PrivateJainSipMessageConnector:PrivateJainSipMessageConnector()");
	if (clientConnector instanceof PrivateJainSipClientConnector && webRTCommMessage instanceof WebRTCommMessage) {
		if (typeof(sipCallId) === 'string') {
			this.sipCallId = sipCallId;
		} else {
			this.sipCallId = new String(new Date().getTime());
		}
		this.clientConnector = clientConnector;
		this.webRTCommMessage = webRTCommMessage;
		this.sipMessageState = undefined;
	} else {
		throw "PrivateJainSipMessageConnector:PrivateJainSipMessageConnector(): bad arguments"
	}
};

/**
 * SIP Message Control state machine constant
 * @private
 * @constant
 */
PrivateJainSipMessageConnector.prototype.SIP_MESSAGE_SENDING_STATE = "SIP_MESSAGE_SENDING_STATE";
PrivateJainSipMessageConnector.prototype.SIP_MESSAGE_407_STATE = "SIP_MESSAGE_407_STATE";
PrivateJainSipMessageConnector.prototype.SIP_MESSAGE_SENT_STATE = "SIP_MESSAGE_SENT_STATE";
PrivateJainSipMessageConnector.prototype.SIP_MESSAGE_SEND_FAILED_STATE = "SIP_MESSAGE_SEND_FAILED_STATE";
PrivateJainSipMessageConnector.prototype.SIP_MESSAGE_RECEIVED_STATE = "SIP_MESSAGE_RECEIVED_STATE";


/**
 * Get message id
 * @public
 * @returns {String} sipCallId  
 */
PrivateJainSipMessageConnector.prototype.getId = function() {
	return this.sipCallId;
};

/**
 * Send Authenticated SIP MESSAGE request
 * @param {Request} jainSipMessageRequest 
 * @param {AuthorizationHeader} jainSipAuthorizationHeader
 * @private
 */
PrivateJainSipMessageConnector.prototype.sendAuthenticatedSipMessageRequest = function(jainSipMessageRequest, jainSipAuthorizationHeader) {
	console.debug("PrivateJainSipMessageConnector:sendAuthenticatedSipMessageRequest()");
	jainSipMessageRequest.removeHeader("Authorization");
	var newJainSipMessageRequest = new SIPRequest();
	newJainSipMessageRequest.setMethod(jainSipMessageRequest.getMethod());
	newJainSipMessageRequest.setRequestURI(jainSipMessageRequest.getRequestURI());
	var headerList = jainSipMessageRequest.getHeaders();
	for (var i = 0; i < headerList.length; i++) {
		newJainSipMessageRequest.addHeader(headerList[i]);
	}

	var num = new Number(jainSipMessageRequest.getCSeq().getSeqNumber());
	newJainSipMessageRequest.getCSeq().setSeqNumber(num + 1);
	newJainSipMessageRequest.setCallId(jainSipMessageRequest.getCallId());
	newJainSipMessageRequest.setVia(this.clientConnector.jainSipListeningPoint.getViaHeader());
	newJainSipMessageRequest.setFrom(jainSipMessageRequest.getFrom());
	newJainSipMessageRequest.setTo(jainSipMessageRequest.getTo());
	newJainSipMessageRequest.setMaxForwards(jainSipMessageRequest.getMaxForwards());
	if (jainSipMessageRequest.getContent() !== null) {
		var content = jainSipMessageRequest.getContent();
		var contentType = jainSipMessageRequest.getContentTypeHeader();
		newJainSipMessageRequest.setContent(content, contentType);
	}

	this.clientConnector.jainSipMessageFactory.addHeader(newJainSipMessageRequest, jainSipAuthorizationHeader);
	jainSipMessageTransaction = this.clientConnector.jainSipProvider.getNewClientTransaction(newJainSipMessageRequest);
	newJainSipMessageRequest.setTransaction(jainSipMessageTransaction);
	jainSipMessageTransaction.sendRequest();
};

/**
 * PrivateJainSipClientConnector interface implementation: handle SIP Request event
 * @public 
 * @param {RequestEvent} requestEvent 
 */
PrivateJainSipMessageConnector.prototype.onJainSipClientConnectorSipRequestEvent = function(requestEvent) {
	console.debug("PrivateJainSipMessageConnector:onJainSipClientConnectorSipRequestEvent() requestEvent : " + requestEvent);

	this.sipMessageState = this.SIP_MESSAGE_RECEIVED_STATE;

	// Send SIP 200 OK response   
	var jainSipRequest = requestEvent.getRequest();
	var jainSip200OKResponse = jainSipRequest.createResponse(200, "OK");
	jainSip200OKResponse.addHeader(this.clientConnector.jainSipContactHeader);
	jainSip200OKResponse.removeHeader("P-Asserted-Identity");
	jainSip200OKResponse.removeHeader("P-Charging-Vector");
	jainSip200OKResponse.removeHeader("P-Charging-Function-Addresses");
	jainSip200OKResponse.removeHeader("P-Called-Party-ID");
	jainSip200OKResponse.removeContent();
	requestEvent.getServerTransaction().sendResponse(jainSip200OKResponse);

	this.webRTCommMessage.from = requestEvent.getRequest().getHeader("From").getAddress().getURI().getUser();
	this.webRTCommMessage.text = requestEvent.getRequest().getContent();

	if (this.webRTCommMessage.webRTCommCall) {
		if (this.webRTCommMessage.webRTCommCall.eventListener.onWebRTCommMessageReceivedEvent) {
			var that = this;
			setTimeout(function() {
				try {
					that.webRTCommMessage.webRTCommCall.eventListener.onWebRTCommMessageReceivedEvent(that.webRTCommMessage);
				} catch (exception) {
					console.error("PrivateJainSipClientConnector:onJainSipClientConnectorSipRequestEvent(): catched exception in event listener:" + exception);
				}
			}, 1);
		}
	} else {
		// No linked call to the event message, forward the message to the client   
		if (this.webRTCommMessage.webRTCommClient.eventListener.onWebRTCommMessageReceivedEvent) {
			var that = this;
			setTimeout(function() {
				try {
					that.webRTCommMessage.webRTCommClient.eventListener.onWebRTCommMessageReceivedEvent(that.webRTCommMessage);
				} catch (exception) {
					console.error("PrivateJainSipClientConnector:onJainSipClientConnectorSipRequestEvent(): catched exception in event listener:" + exception);
				}
			}, 1);
		}
	}

	this.close();
};

/**
 * PrivateJainSipClientConnector interface implementation: handle SIP response event
 * @public 
 * @param {ResponseEvent} responseEvent 
 */
PrivateJainSipMessageConnector.prototype.onJainSipClientConnectorSipResponseEvent = function(responseEvent) {
	console.debug("PrivateJainSipMessageConnector:onJainSipClientConnectorSipResponseEvent() responseEvent : " + responseEvent.getResponse().getStatusLine().getReasonPhrase());
	var jainSipResponse = responseEvent.getResponse();
	var statusCode = parseInt(jainSipResponse.getStatusCode());

	if (this.sipMessageState === this.SIP_MESSAGE_SENDING_STATE || this.sipMessageState === this.SIP_MESSAGE_407_STATE) {
		if (statusCode >= 100 && statusCode < 300) {
			this.sipMessageState = this.SIP_MESSAGE_SENT_STATE;
			if (this.webRTCommMessage.webRTCommCall) {
				if (this.webRTCommMessage.webRTCommCall.eventListener.onWebRTCommMessageSentEvent) {
					var that = this;
					setTimeout(function() {
						try {
							that.webRTCommMessage.webRTCommCall.eventListener.onWebRTCommMessageSentEvent(that.webRTCommMessage);
						} catch (exception) {
							console.error("PrivateJainSipClientConnector:onJainSipClientConnectorSipResponseEvent(): catched exception in event listener:" + exception);
						}
					}, 1);
				}
			} else {
				// No linked call to the event message, forward the message to the client   
				if (this.webRTCommMessage.webRTCommClient.eventListener.onWebRTCommMessageSentEvent) {
					var that = this;
					setTimeout(function() {
						try {
							that.webRTCommMessage.webRTCommClient.eventListener.onWebRTCommMessageSentEvent(that.webRTCommMessage);
						} catch (exception) {
							console.error("PrivateJainSipClientConnector:onJainSipClientConnectorSipResponseEvent(): catched exception in event listener:" + exception);
						}
					}, 1);
				}
			}
		} else {
			if (statusCode === 407) {
				this.sipMessageState = this.SIP_MESSAGE_407_STATE;

				// Send Authenticated SIP INVITE
				var jainSipOriginalMessageRequest = responseEvent.getOriginalTransaction().getOriginalRequest();
				var jainSipAuthorizationHeader = this.clientConnector.jainSipHeaderFactory.createAuthorizationHeader(jainSipResponse, jainSipOriginalMessageRequest, this.clientConnector.configuration.sipPassword, this.clientConnector.configuration.sipLogin);
				this.sendAuthenticatedSipMessageRequest(jainSipOriginalMessageRequest, jainSipAuthorizationHeader);
				return;
			} else {
				this.sipMessageState = this.SIP_MESSAGE_SEND_FAILED_STATE;
			}

			if (this.webRTCommMessage.webRTCommCall) {
				if (this.webRTCommMessage.webRTCommCall.eventListener.onWebRTCommMessageSendErrorEvent) {
					var that = this;
					setTimeout(function() {
						try {
							that.webRTCommMessage.webRTCommCall.eventListener.onWebRTCommMessageSendErrorEvent(that.webRTCommMessage, jainSipResponse.getStatusLine().getReasonPhrase());
						} catch (exception) {
							console.error("PrivateJainSipClientConnector:onJainSipClientConnectorSipResponseEvent(): catched exception in event listener:" + exception);
						}
					}, 1);
				}
			} else {
				if (this.webRTCommMessage.webRTCommClient.eventListener.onWebRTCommMessageSendErrorEvent)
				// No linked call to the event message, forward the message to the client                  
				{
					var that = this;
					setTimeout(function() {
						try {
							that.webRTCommMessage.webRTCommClient.eventListener.onWebRTCommMessageSendErrorEvent(that.webRTCommMessage, jainSipResponse.getStatusLine().getReasonPhrase());
						} catch (exception) {
							console.error("PrivateJainSipClientConnector:onJainSipClientConnectorSipResponseEvent(): catched exception in event listener:" + exception);
						}
					}, 1);
				}
			}
		}
	} else {
		console.error("PrivateJainSipMessageConnector:onJainSipClientConnectorSipResponseEvent() : bad state : " + this.sipMessageState);
	}
	this.close();
};

/**
 * PrivateJainSipClientConnector interface implementation: handle SIP timeout event
 * @public 
 * @param {TimeoutEvent} timeoutEvent
 */
PrivateJainSipMessageConnector.prototype.onJainSipClientConnectorSipTimeoutEvent = function(timeoutEvent) {
	console.debug("PrivateJainSipMessageConnector:onJainSipClientConnectorSipTimeoutEvent()");

	if (this.sipMessageState === this.SIP_MESSAGE_SENDING_STATE) {
		this.sipMessageState = this.SIP_MESSAGE_SEND_FAILED_STATE;
		if (this.webRTCommMessage.webRTCommCall) {
			if (this.webRTCommMessage.webRTCommCall.eventListener.onWebRTCommMessageSendErrorEvent) {
				var that = this;
				setTimeout(function() {
					try {
						that.webRTCommMessage.webRTCommCall.eventListener.onWebRTCommMessageSendErrorEvent(that.webRTCommMessage, "SIP Timeout");
					} catch (exception) {
						console.error("PrivateJainSipClientConnector:onJainSipClientConnectorSipTimeoutEvent(): catched exception in event listener:" + exception);
					}
				}, 1);
			}
		} else {
			// No linked call to the event message, forward the message to the client   
			if (this.webRTCommMessage.webRTCommClient.eventListener.onWebRTCommMessageSendErrorEvent) {
				var that = this;
				setTimeout(function() {
					try {
						that.webRTCommClient.eventListener.onWebRTCommMessageSendErrorEvent(that.webRTCommMessage, "SIP Timeout");
					} catch (exception) {
						console.error("PrivateJainSipClientConnector:onJainSipClientConnectorSipTimeoutEvent(): catched exception in event listener:" + exception);
					}
				}, 1);
			}
		}
	} else {
		console.error("PrivateJainSipMessageConnector:onJainSipClientConnectorSipTimeoutEvent() : bad state : " + this.sipMessageState);
	}

	this.close();
};

/**
 * Asynchronous action : close message connector in each case.
 * @public 
 */
PrivateJainSipMessageConnector.prototype.close = function() {
	console.debug("PrivateJainSipMessageConnector:close(): this.sipCallState=" + this.sipMessageState);
	this.clientConnector.removeSessionConnector(this.sipCallId);
};


/**
 * Send SIP MESSAGE request
 * @public 
 */
PrivateJainSipMessageConnector.prototype.send = function() {
	console.debug("PrivateJainSipMessageConnector:send()");
	if (this.sipMessageState === undefined) {
		var toSipUri = this.webRTCommMessage.to;
		if (toSipUri.indexOf("@") === -1) {
			//No domain, add caller one 
			toSipUri += "@" + this.clientConnector.configuration.sipDomain;
		}
		var fromSipUriString = this.clientConnector.configuration.sipUserName + "@" + this.clientConnector.configuration.sipDomain;
		var jainSipCseqHeader = this.clientConnector.jainSipHeaderFactory.createCSeqHeader(1, "MESSAGE");
		var jainSipCallIdHeader = this.clientConnector.jainSipHeaderFactory.createCallIdHeader(this.sipCallId);
		var jainSipMaxForwardHeader = this.clientConnector.jainSipHeaderFactory.createMaxForwardsHeader(70);
		var jainSipRequestUri = this.clientConnector.jainSipAddressFactory.createSipURI_user_host(null, toSipUri);
		var jainSipAllowListHeader = this.clientConnector.jainSipHeaderFactory.createHeaders("Allow: INVITE,ACK,CANCEL,BYE,MESSAGE");
		var jainSipFromUri = this.clientConnector.jainSipAddressFactory.createSipURI_user_host(null, fromSipUriString);
		var jainSipFromAdress = this.clientConnector.jainSipAddressFactory.createAddress_name_uri(this.clientConnector.configuration.displayName, jainSipFromUri);

		// Setup display name
		if (this.clientConnector.configuration.displayName) {
			jainSipFromAdress.setDisplayName(this.clientConnector.configuration.displayName);
		} else if (this.clientConnector.configuration.sipDisplayName) {
			jainSipFromAdress.setDisplayName(this.clientConnector.configuration.sipDisplayName);
		}
		var tagFrom = new Date().getTime();
		var jainSipFromHeader = this.clientConnector.jainSipHeaderFactory.createFromHeader(jainSipFromAdress, tagFrom);
		var jainSiptoUri = this.clientConnector.jainSipAddressFactory.createSipURI_user_host(null, toSipUri);
		var jainSipToAddress = this.clientConnector.jainSipAddressFactory.createAddress_name_uri(null, jainSiptoUri);
		var jainSipToHeader = this.clientConnector.jainSipHeaderFactory.createToHeader(jainSipToAddress, null);
		var jainSipViaHeader = this.clientConnector.jainSipListeningPoint.getViaHeader();
		var jainSipContentTypeHeader = this.clientConnector.jainSipHeaderFactory.createContentTypeHeader("text", "plain");

		this.jainSipMessageRequest = this.clientConnector.jainSipMessageFactory.createRequest(
			jainSipRequestUri,
			"MESSAGE",
			jainSipCallIdHeader,
			jainSipCseqHeader,
			jainSipFromHeader,
			jainSipToHeader,
			jainSipViaHeader,
			jainSipMaxForwardHeader,
			jainSipContentTypeHeader,
			this.webRTCommMessage.text);

		this.clientConnector.jainSipMessageFactory.addHeader(this.jainSipMessageRequest, jainSipAllowListHeader);
		this.clientConnector.jainSipMessageFactory.addHeader(this.jainSipMessageRequest, this.clientConnector.jainSipContactHeader);
		var jainSipTransaction = this.clientConnector.jainSipProvider.getNewClientTransaction(this.jainSipMessageRequest);
		this.jainSipMessageRequest.setTransaction(jainSipTransaction);
		jainSipTransaction.sendRequest();
		this.sipMessageState = this.SIP_MESSAGE_SENDING_STATE;
	} else {
		console.error("PrivateJainSipMessageConnector:send(): bad state, unauthorized action");
		throw "PrivateJainSipMessageConnector:send(): bad state, unauthorized action";
	}
};