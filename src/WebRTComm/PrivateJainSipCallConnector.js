/*
 * TeleStax, Open Source Cloud Communications  Copyright 2012. 
 * and individual contributors
 * by the @authors tag. See the copyright.txt in the distribution for a
 * full listing of individual contributors.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */

/** 
 * The JavaScript Framework WebRTComm allow Web Application developers to easily 
 * integrate multimedia communication service (e.g. VoIP) in their web site, thanks 
 * to the W3C WebRTC API. The WebRTComm Framework provides a high level communication 
 * API on top of the opensource JAIN SIP JavaScript Stack (implementing transport of SIP over WebSocket). 
 * By using a convergent HTTP/SIP Application Server (e.g. Mobicents MSS) or directly access a 
 * SIP server (e.g. Asterisk), the web developer can rapidly and easily link his web site to a 
 * telephony infrastructure.<br> 
 * 
 * A simple test web application of the WebRTComm Framework can be found 
 * <a href="https://code.google.com/p/webrtcomm/source/browse/?repo=test%2FWebRTCommTestWebApp">here</a>
 * 
 * @module WebRTComm 
 * @author Laurent STRULLU (laurent.strullu@orange.com) 
 */

/**
 * @class PrivateJainSipCallConnector
 * @private
 * @classdesc Private framework class handling  SIP client/user call control: ringing, ringing back, accept, reject, cancel, bye 
 * @constructor
 * @param {PrivateJainSipClientConnector} clientConnector clientConnector owner object
 * @param {WebRTCommCall} webRTCommCall WebRTCommCall "connected" object
 * @param {string} sipCallId   SIP Call ID
 * @throw {String} Exception "bad argument"
 * @author Laurent STRULLU (laurent.strullu@orange.com) 
 */
PrivateJainSipCallConnector = function(clientConnector, webRTCommCall, sipCallId) {
	console.debug("PrivateJainSipCallConnector:PrivateJainSipCallConnector()");
	if (clientConnector instanceof PrivateJainSipClientConnector && webRTCommCall instanceof WebRTCommCall) {
		if (typeof(sipCallId) === 'string') {
			this.sipCallId = sipCallId;
		} else {
			this.sipCallId = new String(new Date().getTime());
		}
		this.clientConnector = clientConnector;
		this.webRTCommCall = webRTCommCall;
		this.webRTCommCall.id = this.sipCallId;
		this.configuration = undefined;
		this.resetSipContext();
	} else {
		throw "PrivateJainSipCallConnector:PrivateJainSipCallConnector(): bad arguments"
	}
};

/**
 * SIP Call Control state machine constant
 * @private
 * @constant
 */
PrivateJainSipCallConnector.prototype.SIP_INVITING_INITIAL_STATE = "INVITING_INITIAL_STATE";
PrivateJainSipCallConnector.prototype.SIP_INVITING_STATE = "INVITING_STATE";
PrivateJainSipCallConnector.prototype.SIP_INVITING_407_STATE = "INVITING_407_STATE";
PrivateJainSipCallConnector.prototype.SIP_INVITING_ACCEPTED_STATE = "INVITING_ACCEPTED_STATE";
PrivateJainSipCallConnector.prototype.SIP_INVITING_LOCAL_HANGINGUP_STATE = "INVITING_LOCAL_HANGINGUP_STATE";
PrivateJainSipCallConnector.prototype.SIP_INVITING_LOCAL_HANGINGUP_407_STATE = "INVITING_LOCAL_HANGINGUP_407_STATE";
PrivateJainSipCallConnector.prototype.SIP_INVITING_CANCELLING_STATE = "INVITING_CANCELLING_STATE";
PrivateJainSipCallConnector.prototype.SIP_INVITING_ERROR_STATE = "INVITING_ERROR_STATE";
PrivateJainSipCallConnector.prototype.SIP_INVITING_HANGUP_STATE = "INVITING_HANGUP_STATE";
PrivateJainSipCallConnector.prototype.SIP_INVITING_CANCELLED_STATE = "SIP_INVITING_CANCELLED_STATE";
PrivateJainSipCallConnector.prototype.SIP_INVITED_INITIAL_STATE = "INVITED_INITIAL_STATE";
PrivateJainSipCallConnector.prototype.SIP_INVITED_ACCEPTED_STATE = "INVITED_ACCEPTED_STATE";
PrivateJainSipCallConnector.prototype.SIP_INVITED_LOCAL_HANGINGUP_STATE = "INVITED_LOCAL_HANGINGUP_STATE";
PrivateJainSipCallConnector.prototype.SIP_INVITED_LOCAL_HANGINGUP_407_STATE = "INVITED_LOCAL_HANGINGUP_407_STATE";
PrivateJainSipCallConnector.prototype.SIP_INVITED_HANGUP_STATE = "INVITED_HANGUP_STATE";
PrivateJainSipCallConnector.prototype.SIP_INVITED_ERROR_STATE = "INVITED_ERROR_STATE";
PrivateJainSipCallConnector.prototype.SIP_INVITED_CANCELLED_STATE = "INVITING_HANGUP_STATE";

/**
 * Get SIP communication opened/closed status 
 * @public
 * @returns {boolean} true if opened, false if closed
 */
PrivateJainSipCallConnector.prototype.isOpened = function() {
	return ((this.sipCallState === this.SIP_INVITING_ACCEPTED_STATE) || (this.sipCallState === this.SIP_INVITED_ACCEPTED_STATE));
};

/**
 * Get SIP call ID
 * @public
 * @returns {string} SIP Call ID  
 */
PrivateJainSipCallConnector.prototype.getId = function() {
	return this.sipCallId;
};

/**
 * Open JAIN SIP call/communication, asynchronous action,  opened or error event is notified to WebRtcClientCall eventListener
 * @public 
 * @param {object} configuration  WebRTC communication configuration 
 * <p> Communication configuration sample: <br>
 * { <br>
 * <span style="margin-left: 30px">displayName:alice,<br></span>
 * <span style="margin-left: 30px">localMediaStream: [LocalMediaStream],<br></span>
 * <span style="margin-left: 30px">audioMediaFlag:true,<br></span>
 * <span style="margin-left: 30px">videoMediaFlag:false,<br></span>
 * <span style="margin-left: 30px">dataMediaFlag:false,<br></span>
 * <span style="margin-left: 30px">audioCodecsFilter:PCMA,PCMU,OPUS,<br></span>
 * <span style="margin-left: 30px">videoCodecsFilter:VP8,H264,<br></span>
 * }<br>
 * </p>
 * @public  
 * @throw {String} Exception "bad configuration, missing parameter"
 * @throw {String} Exception "bad state, unauthorized action"
 */
PrivateJainSipCallConnector.prototype.open = function(configuration) {
	console.debug("PrivateJainSipCallConnector:open()");
	if (this.sipCallState === undefined) {
		if (typeof(configuration) === 'object') {
			// Calling
			if (this.checkConfiguration(configuration) === true) {
				this.sipCallState = this.SIP_INVITING_INITIAL_STATE;
				this.configuration = configuration;
			} else {
				console.error("PrivateJainSipCallConnector:open(): bad configuration");
				throw "PrivateJainSipCallConnector:open(): bad configuration";
			}
		} else {
			// Called
			this.sipCallState = this.SIP_INVITED_INITIAL_STATE;
		}
	} else {
		console.error("PrivateJainSipCallConnector:open(): bad state, unauthorized action");
		throw "PrivateJainSipCallConnector:open(): bad state, unauthorized action";
	}
};

/**
 * Close JAIN SIP communication, asynchronous action, closed event are notified to the WebRTCommClient eventListener
 * @public 
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception "internal error,check console logs"
 */
PrivateJainSipCallConnector.prototype.close = function() {
	console.debug("PrivateJainSipCallConnector:close(): this.sipCallState=" + this.sipCallState);
	if (this.sipCallState !== undefined) {
		try {
			if (this.sipCallState === this.SIP_INITIAL_INVITING_STATE) {
				// SIP INVITE has not been sent yet.
				this.resetSipContext();
				this.clientConnector.removeSessionConnector(this.sipCallId);
				// Notify closed event
				this.webRTCommCall.onPrivateCallConnectorCallClosedEvent();
			} else if (this.sipCallState === this.SIP_INVITING_STATE || this.sipCallState === this.SIP_INVITING_407_STATE) {
				// SIP INIVTE has been sent, need to cancel it
				this.jainSipInvitingCancelRequest = this.jainSipInvitingTransaction.createCancel();
				this.jainSipInvitingCancelRequest.addHeader(this.clientConnector.jainSipContactHeader);
				this.jainSipInvitingCancelTransaction = this.clientConnector.jainSipProvider.getNewClientTransaction(this.jainSipInvitingCancelRequest);
				this.jainSipInvitingCancelTransaction.sendRequest();
				this.sipCallState = this.SIP_INVITING_CANCELLING_STATE;
			} else if (this.sipCallState === this.SIP_INVITING_ACCEPTED_STATE) {
				// Sent SIP BYE
				var jainSipByeRequest = this.jainSipInvitingDialog.createRequest("BYE");
				jainSipByeRequest.removeHeader("Contact");
				jainSipByeRequest.removeHeader("User-Agent");
				jainSipByeRequest.addHeader(this.clientConnector.jainSipContactHeader);
				var clientTransaction = this.clientConnector.jainSipProvider.getNewClientTransaction(jainSipByeRequest);
				this.jainSipInvitingDialog.sendRequest(clientTransaction);
				this.sipCallState = this.SIP_INVITING_LOCAL_HANGINGUP_STATE;
				// Notify closed event
				this.webRTCommCall.onPrivateCallConnectorCallClosedEvent();
			} else if (this.sipCallState === this.SIP_INVITED_INITIAL_STATE) {
				// Rejected  480 Temporarily Unavailable
				var jainSipResponse480 = this.jainSipInvitedRequest.createResponse(480, "Temporarily Unavailable");
				jainSipResponse480.addHeader(this.clientConnector.jainSipContactHeader);
				this.jainSipInvitedTransaction.sendResponse(jainSipResponse480);
				this.resetSipContext();
				this.clientConnector.removeSessionConnector(this.sipCallId);
			} else if (this.sipCallState === this.SIP_INVITED_ACCEPTED_STATE) {
				// Sent SIP BYE
				var jainSipByeRequest = this.jainSipInvitedDialog.createRequest("BYE");
				jainSipByeRequest.removeHeader("Contact");
				jainSipByeRequest.removeHeader("User-Agent");
				jainSipByeRequest.addHeader(this.clientConnector.jainSipContactHeader);
				var clientTransaction = this.clientConnector.jainSipProvider.getNewClientTransaction(jainSipByeRequest);
				this.jainSipInvitedDialog.sendRequest(clientTransaction);
				this.sipCallState = this.SIP_INVITED_LOCAL_HANGINGUP_STATE;
			} else {
				this.resetSipContext();
				this.clientConnector.removeSessionConnector(this.sipCallId);
				// Notify closed event
				this.webRTCommCall.onPrivateCallConnectorCallClosedEvent();
			}
		} catch (exception) {
			console.error("PrivateJainSipCallConnector:close(): catched exception:" + exception);
			this.resetSipContext();
			this.clientConnector.removeSessionConnector(this.sipCallId);
			// Notify closed event
			this.webRTCommCall.onPrivateCallConnectorCallClosedEvent();
		}
	}
};

/**
 * Process reject of the SIP incoming communication
 * @public 
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception "internal error,check console logs"
 */
PrivateJainSipCallConnector.prototype.reject = function() {
	console.debug("PrivateJainSipCallConnector:reject()");
	if (this.sipCallState === this.SIP_INVITED_INITIAL_STATE) {
		try {
			// Rejected  Temporarily Unavailable
			var jainSipResponse486 = this.jainSipInvitedRequest.createResponse(486, "Busy here");
			jainSipResponse486.addHeader(this.clientConnector.jainSipContactHeader);
			this.jainSipInvitedTransaction.sendResponse(jainSipResponse486);
		} catch (exception) {
			console.error("PrivateJainSipCallConnector:reject(): catched exception:" + exception);
		}
		this.close();
	} else {
		console.error("PrivateJainSipCallConnector:reject(): bad state, unauthorized action");
		throw "PrivateJainSipCallConnector:reject(): bad state, unauthorized action";
	}
};

/**
 * Ignore the incoming SIP communication. This means clearing all local resources without notifying the remote party
 * @public 
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception "internal error,check console logs"
 */
PrivateJainSipCallConnector.prototype.ignore = function() {
	console.debug("PrivateJainSipCallConnector:ignore()");
	if (this.sipCallState === this.SIP_INVITED_INITIAL_STATE) {
		try {
			// SIP INVITE has not been sent yet.
			this.resetSipContext();
			this.clientConnector.removeSessionConnector(this.sipCallId);
			// Notify closed event
			this.webRTCommCall.onPrivateCallConnectorCallClosedEvent();
		} catch (exception) {
			console.error("PrivateJainSipCallConnector:ignore(): catched exception:" + exception);
		}
		this.close();
	} else {
		console.error("PrivateJainSipCallConnector:ignore(): bad state, unauthorized action");
		throw "PrivateJainSipCallConnector:ignore(): bad state, unauthorized action";
	}
};

/**
 * Check configuration 
 * @param {object} configuration SIP call configuration JSON object
 * @private
 * @return true configuration ok false otherwise
 */
PrivateJainSipCallConnector.prototype.checkConfiguration = function(configuration) {
	console.debug("PrivateJainSipCallConnector:checkConfiguration()");
	var check = true;
	return check;
};

/**
 * Reset SIP context 
 * @private
 */
PrivateJainSipCallConnector.prototype.resetSipContext = function() {
	console.debug("PrivateJainSipCallConnector:resetSipContext()");
	this.sipCallState = undefined;
	this.sdpOffer = undefined;
	this.jainSipInvitingSentRequest = undefined;
	this.jainSipInvitingDialog = undefined;
	this.jainSipInvitingTransaction = undefined;
	this.jainSipInvitedReceivedRequest = undefined;
	this.jainSipInvitedDialog = undefined;
	this.jainSipInvitedTransaction = undefined;
};

/**
 * Process invitation of outgoing SIP communication 
 * @public 
 * @param {String} sdpOffer SDP offer received from RTCPeerConenction
 */
PrivateJainSipCallConnector.prototype.invite = function(sdpOffer) {
	console.debug("PrivateJainSipCallConnector:invite()");
	this.sdpOffer = sdpOffer;
	this.sendSipInviteRequest(sdpOffer);
	this.sipCallState = this.SIP_INVITING_STATE;
};


/**
 * Process acceptation of incoming SIP communication
 * @public 
 * @param {string} sdpAnswer SDP answer received from RTCPeerConnection
 */
PrivateJainSipCallConnector.prototype.accept = function(sdpAnswer) {
	console.debug("PrivateJainSipCallConnector:accept()");
	// Send 200 OK
	var jainSip200OKResponse = this.jainSipInvitedRequest.createResponse(200, "OK");
	jainSip200OKResponse.addHeader(this.clientConnector.jainSipContactHeader);
	jainSip200OKResponse.setMessageContent("application", "sdp", sdpAnswer);
	this.jainSipInvitedTransaction.sendResponse(jainSip200OKResponse);
	this.sipCallState = this.SIP_INVITED_ACCEPTED_STATE;
};


/**
 * Send DTMF digit over SIP INFO
 * @public 
 * @param {String} dtmfDigit DTMF digit to send
 */
PrivateJainSipCallConnector.prototype.sendSipDtmf = function(dtmfDigit) {
	console.debug("PrivateJainSipCallConnector:sendSipDtmf()");

	var dialog = null;
	if (this.sipCallState === this.SIP_INVITED_ACCEPTED_STATE) {
		dialog = this.jainSipInvitedDialog;
	}
	if (this.sipCallState === this.SIP_INVITING_ACCEPTED_STATE) {
		dialog = this.jainSipInvitingDialog;
	}
	if (dialog) {
		try {
			var request = dialog.createRequest("INFO");
			request.setContent("Signal=" + dtmfDigit + "\r\nDuration=100\r\n",
					this.clientConnector.jainSipHeaderFactory.createContentTypeHeader("application", "dtmf-relay"));
			var clientTransaction = this.clientConnector.jainSipProvider.getNewClientTransaction(request);
			dialog.sendRequest(clientTransaction);
		} catch (exception) {
			console.error("PrivateJainSipCallConnector:sendSipDtmf(): catched exception exception:" + exception);
		} 
	}
	else {
		console.error("PrivateJainSipCallConnector:sendSipDtmf(): couldn't retrieve SIP dialog");
	}
};


/**
 * PrivateJainSipClientConnector interface implementation: handle SIP Request event
 * @public 
 * @param {RequestEvent} requestEvent 
 */
PrivateJainSipCallConnector.prototype.onJainSipClientConnectorSipRequestEvent = function(requestEvent) {
	console.debug("PrivateJainSipCallConnector:onJainSipClientConnectorSipRequestEvent()");
	if (this.jainSipInvitingDialog !== undefined)
		this.processInvitingSipRequestEvent(requestEvent);
	else if (this.jainSipInvitedDialog !== undefined)
		this.processInvitedSipRequestEvent(requestEvent);
	else {
		this.processInvitedSipRequestEvent(requestEvent);
	}
};

/**
 * PrivateJainSipClientConnector interface implementation: handle SIP response event
 * @public 
 * @param {ResponseEvent} responseEvent 
 */
PrivateJainSipCallConnector.prototype.onJainSipClientConnectorSipResponseEvent = function(responseEvent) {
	console.debug("PrivateJainSipCallConnector:onJainSipClientConnectorSipResponseEvent()");
	if (this.jainSipInvitingDialog !== undefined)
		this.processInvitingSipResponseEvent(responseEvent);
	else if (this.jainSipInvitedDialog !== undefined)
		this.processInvitedSipResponseEvent(responseEvent);
	else {
		console.warn("PrivateJainSipCallConnector:onJainSipClientConnectorSipResponseEvent(): response ignored");
	}
};

/**
 * PrivateJainSipClientConnector interface implementation: handle SIP timeout event
 * @public 
 * @param {TimeoutEvent} timeoutEvent
 */
PrivateJainSipCallConnector.prototype.onJainSipClientConnectorSipTimeoutEvent = function(timeoutEvent) {
	console.debug("PrivateJainSipCallConnector:onJainSipClientConnectorSipTimeoutEvent()");
	// For the time being force close of the call 
	this.close();
};


/**
 * Handle SIP request event for inviting call
 * @private 
 * @param {RequestEvent} requestEvent 
 */
PrivateJainSipCallConnector.prototype.processInvitingSipRequestEvent = function(requestEvent) {
	console.debug("PrivateJainSipCallConnector:processInvitingSipRequestEvent(): this.sipCallState=" + this.sipCallState);
	var jainSipRequest = requestEvent.getRequest();
	var requestMethod = jainSipRequest.getMethod();
	if (this.sipCallState === this.SIP_INVITING_INITIAL_STATE) {
		console.error("PrivateJainSipCallConnector:processInvitingSipRequestEvent(): bad state, SIP request ignored");
	} else if (this.sipCallState === this.SIP_INVITING_STATE) {
		console.error("PrivateJainSipCallConnector:processInvitingSipRequestEvent(): bad state, SIP request ignored");
	} else if (this.sipCallState === this.SIP_INVITING_407_STATE) {
		console.error("PrivateJainSipCallConnector:processInvitingSipRequestEvent(): bad state, SIP request ignored");
	} else if (this.sipCallState === this.SIP_INVITING_ERROR_STATE) {
		console.error("PrivateJainSipCallConnector:processInvitingSipRequestEvent(): bad state, SIP request ignored");
	} else if (this.sipCallState === this.SIP_INVITING_ACCEPTED_STATE) {
		if (requestMethod === "BYE") {
			try {
				// Sent 200 OK BYE
				var jainSip200OKResponse = jainSipRequest.createResponse(200, "OK");
				jainSip200OKResponse.addHeader(this.clientConnector.jainSipContactHeader);
				requestEvent.getServerTransaction().sendResponse(jainSip200OKResponse);
				// Update SIP call state
				this.sipCallState = this.SIP_INVITING_HANGUP_STATE;
			} catch (exception) {
				console.error("PrivateJainSipCallConnector:processInvitingSipRequestEvent(): catched exception exception:" + exception);
			}

			// Notify the hangup event
			this.webRTCommCall.onPrivateCallConnectorCallHangupEvent();

			// Close the call
			this.close();
		} else {
			console.error("PrivateJainSipCallConnector:processInvitingSipRequestEvent(): bad state, SIP request ignored");
		}
	} else {
		console.error("PrivateJainSipCallConnector:processInvitingSipRequestEvent(): bad state, SIP request ignored");
	}
};

/**
 * Send SIP INVITE request
 * @private 
 */
PrivateJainSipCallConnector.prototype.sendSipInviteRequest = function() {
	console.debug("PrivateJainSipCallConnector:sendSipInviteRequest()");
	// Send INVITE 
	var calleeSipUri = this.webRTCommCall.getCalleePhoneNumber();
	if (calleeSipUri.indexOf("@") === -1) {
		//No domain, add caller one 
		calleeSipUri += "@" + this.clientConnector.configuration.sipDomain;
	}
	var fromSipUriString = this.clientConnector.configuration.sipUserName + "@" + this.clientConnector.configuration.sipDomain;
	var jainSipCseqHeader = this.clientConnector.jainSipHeaderFactory.createCSeqHeader(1, "INVITE");
	var jainSipCallIdHeader = this.clientConnector.jainSipHeaderFactory.createCallIdHeader(this.sipCallId);
	var jainSipMaxForwardHeader = this.clientConnector.jainSipHeaderFactory.createMaxForwardsHeader(70);
	var jainSipRequestUri = this.clientConnector.jainSipAddressFactory.createSipURI_user_host(null, calleeSipUri);
	var jainSipAllowListHeader = this.clientConnector.jainSipHeaderFactory.createHeaders("Allow: INVITE,ACK,CANCEL,BYE");
	var jainSipFromUri = this.clientConnector.jainSipAddressFactory.createSipURI_user_host(null, fromSipUriString);
	var jainSipFromAdress = this.clientConnector.jainSipAddressFactory.createAddress_name_uri(this.configuration.displayName, jainSipFromUri);
	// Setup display name
	if (this.configuration.displayName) {
		jainSipFromAdress.setDisplayName(this.configuration.displayName);
	} else if (this.clientConnector.configuration.sipDisplayName) {
		jainSipFromAdress.setDisplayName(this.clientConnector.configuration.sipDisplayName);
	}
	var tagFrom = new Date().getTime();
	var jainSipFromHeader = this.clientConnector.jainSipHeaderFactory.createFromHeader(jainSipFromAdress, tagFrom);
	var jainSiptoUri = this.clientConnector.jainSipAddressFactory.createSipURI_user_host(null, calleeSipUri);
	var jainSipToAddress = this.clientConnector.jainSipAddressFactory.createAddress_name_uri(null, jainSiptoUri);
	var jainSipToHeader = this.clientConnector.jainSipHeaderFactory.createToHeader(jainSipToAddress, null);
	var jainSipViaHeader = this.clientConnector.jainSipListeningPoint.getViaHeader();
	var jainSipContentTypeHeader = this.clientConnector.jainSipHeaderFactory.createContentTypeHeader("application", "sdp");
	this.jainSipInvitingRequest = this.clientConnector.jainSipMessageFactory.createRequest(jainSipRequestUri, "INVITE",
		jainSipCallIdHeader,
		jainSipCseqHeader,
		jainSipFromHeader,
		jainSipToHeader,
		jainSipViaHeader,
		jainSipMaxForwardHeader,
		jainSipContentTypeHeader,
		this.sdpOffer);

	this.clientConnector.jainSipMessageFactory.addHeader(this.jainSipInvitingRequest, jainSipAllowListHeader);
	this.clientConnector.jainSipMessageFactory.addHeader(this.jainSipInvitingRequest, this.clientConnector.jainSipContactHeader);
	this.jainSipInvitingTransaction = this.clientConnector.jainSipProvider.getNewClientTransaction(this.jainSipInvitingRequest);
	this.jainSipInvitingRequest.setTransaction(this.jainSipInvitingTransaction);
	this.jainSipInvitingDialog = this.jainSipInvitingTransaction.getDialog();
	this.jainSipInvitingTransaction.sendRequest();
};

/**
 * Send SIP INVITE request
 * @private 
 * @param {AuthorizationHeader} jainSipAuthorizationHeader Authorization Header
 */
PrivateJainSipCallConnector.prototype.sendAuthenticatedSipInviteRequest = function(jainSipAuthorizationHeader) {
	console.debug("PrivateJainSipCallConnector:sendAuthenticatedSipInviteRequest()");
	this.jainSipInvitingRequest.removeHeader("Authorization");
	var newJainSipInvitingRequest = new SIPRequest();
	newJainSipInvitingRequest.setMethod(this.jainSipInvitingRequest.getMethod());
	newJainSipInvitingRequest.setRequestURI(this.jainSipInvitingRequest.getRequestURI());
	var headerList = this.jainSipInvitingRequest.getHeaders();
	for (var i = 0; i < headerList.length; i++) {
		newJainSipInvitingRequest.addHeader(headerList[i]);
	}

	var num = new Number(this.jainSipInvitingRequest.getCSeq().getSeqNumber());
	newJainSipInvitingRequest.getCSeq().setSeqNumber(num + 1);
	newJainSipInvitingRequest.setCallId(this.jainSipInvitingRequest.getCallId());
	newJainSipInvitingRequest.setVia(this.clientConnector.jainSipListeningPoint.getViaHeader());
	newJainSipInvitingRequest.setFrom(this.jainSipInvitingRequest.getFrom());
	newJainSipInvitingRequest.setTo(this.jainSipInvitingRequest.getTo());
	newJainSipInvitingRequest.setMaxForwards(this.jainSipInvitingRequest.getMaxForwards());

	if (this.jainSipInvitingRequest.getContent() !== null) {
		var content = this.jainSipInvitingRequest.getContent();
		var contentType = this.jainSipInvitingRequest.getContentTypeHeader();
		newJainSipInvitingRequest.setContent(content, contentType);
	}
	this.jainSipInvitingRequest = newJainSipInvitingRequest;
	this.clientConnector.jainSipMessageFactory.addHeader(this.jainSipInvitingRequest, jainSipAuthorizationHeader);
	this.jainSipInvitingTransaction = this.clientConnector.jainSipProvider.getNewClientTransaction(this.jainSipInvitingRequest);
	this.jainSipInvitingRequest.setTransaction(this.jainSipInvitingransaction);
	this.jainSipInvitingTransaction.sendRequest();
};

/**
 * Handle SIP response event for inviting call
 * @private 
 * @param {ResponseEvent} responseEvent 
 */
PrivateJainSipCallConnector.prototype.processInvitingSipResponseEvent = function(responseEvent) {
	console.debug("PrivateJainSipCallConnector:processInvitingSipResponseEvent(): this.sipCallState=" + this.sipCallState);
	var jainSipResponse = responseEvent.getResponse();
	var statusCode = parseInt(jainSipResponse.getStatusCode());
	if (this.sipCallState === this.SIP_INVITING_STATE) {
		if (statusCode < 200) {
			if (statusCode === 180) {
				// Notify the ringing back event
				this.webRTCommCall.onPrivateCallConnectorCallRingingBackEvent();
			} else if (statusCode === 183) {
				// Notify asynchronously the in progress event
				this.webRTCommCall.onPrivateCallConnectorCallInProgressEvent();
			}
			console.debug("PrivateJainSipCallConnector:processInvitingSipResponseEvent(): 1XX response ignored");
		} else if (statusCode === 407) {
			// Send Authenticated SIP INVITE
			var jainSipAuthorizationHeader = this.clientConnector.jainSipHeaderFactory.createAuthorizationHeader(jainSipResponse, this.jainSipInvitingRequest, this.clientConnector.configuration.sipPassword, this.clientConnector.configuration.sipLogin);
			this.sendAuthenticatedSipInviteRequest(jainSipAuthorizationHeader);
			// Update SIP call state            
			this.sipCallState = this.SIP_INVITING_407_STATE;
		} else if (statusCode === 200) {
			this.jainSipInvitingDialog = responseEvent.getOriginalTransaction().getDialog();
			try {
				// Send SIP 200 OK ACK
				this.jainSipInvitingDialog.setRemoteTarget(jainSipResponse.getHeader("Contact"));
				var jainSipMessageACK = this.jainSipInvitingTransaction.createAck();
				jainSipMessageACK.addHeader(this.clientConnector.jainSipContactHeader);
				this.jainSipInvitingDialog.sendAck(jainSipMessageACK);
				// Update SIP call state    
				this.sipCallState = this.SIP_INVITING_ACCEPTED_STATE;
			} catch (exception) {
				console.error("PrivateJainSipCallConnector:processInvitingSipRequestEvent(): catched exception, exception:" + exception);
			}

			try {
				var sdpAnswerString = jainSipResponse.getContent();
				this.webRTCommCall.onPrivateCallConnectorRemoteSdpAnswerEvent(sdpAnswerString);
			} catch (exception) {
				console.error("PrivateJainSipCallConnector:processInvitingSipRequestEvent(): catched exception, exception:" + exception);

				// Notify the error event
				this.webRTCommCall.onPrivateCallConnectorCallOpenErrorEvent(exception);

				// Close the call
				this.close();
			}
		} else {
			console.error("PrivateJainSipCallConnector:processInvitingSipRequestEvent(): SIP INVITE failed:" + jainSipResponse.getStatusCode() + "  " + jainSipResponse.getStatusLine().toString());
			// Update SIP call state    
			this.sipCallState = this.SIP_INVITING_ERROR_STATE;
			// Notify asynchronously the error event
			this.webRTCommCall.onPrivateCallConnectorCallOpenErrorEvent(jainSipResponse.getStatusLine().getReasonPhrase());

			this.close();
		}
	} else if (this.sipCallState === this.SIP_INVITING_CANCELLING_STATE) {
		// Update SIP call state    
		this.sipCallState = this.SIP_INVITING_CANCELLED_STATE;
		this.close();
	} else if (this.sipCallState === this.SIP_INVITING_407_STATE) {
		if (statusCode < 200) {
			console.debug("PrivateJainSipCallConnector:processInvitingSipResponseEvent(): 1XX response ignored");
		} else if (statusCode === 200) {
			this.jainSipInvitingDialog = responseEvent.getOriginalTransaction().getDialog();

			try {
				// Send SIP 200 OK ACK
				this.jainSipInvitingDialog.setRemoteTarget(jainSipResponse.getHeader("Contact"));
				var jainSipMessageACK = this.jainSipInvitingTransaction.createAck();
				jainSipMessageACK.addHeader(this.clientConnector.jainSipContactHeader);
				this.jainSipInvitingDialog.sendAck(jainSipMessageACK);
				// Update SIP call state
				this.sipCallState = this.SIP_INVITING_ACCEPTED_STATE;
			} catch (exception) {
				console.error("PrivateJainSipCallConnector:processInvitingSipRequestEvent(): catched exception, exception:" + exception);
			}


			try {
				var sdpAnswerString = jainSipResponse.getContent();
				this.webRTCommCall.onPrivateCallConnectorRemoteSdpAnswerEvent(sdpAnswerString);
			} catch (exception) {
				console.error("PrivateJainSipCallConnector:processInvitingSipRequestEvent(): catched exception, exception:" + exception);

				// Notify the error event
				this.webRTCommCall.onPrivateCallConnectorCallOpenErrorEvent(exception);

				// Close the call
				this.close();
			}
		} else {
			// Update SIP call state
			this.sipCallState = this.SIP_INVITING_ERROR_STATE;

			// Notify the error event
			this.webRTCommCall.onPrivateCallConnectorCallOpenErrorEvent(jainSipResponse.getStatusLine().getReasonPhrase());

			// Close the call
			this.close();
		}
	} else if (this.sipCallState === this.SIP_INVITING_ERROR_STATE) {
		console.error("PrivateJainSipCallConnector:processInvitingSipResponseEvent(): bad state, SIP response ignored");
	} else if (this.sipCallState === this.SIP_INVITING_ACCEPTED_STATE) {
		console.debug("PrivateJainSipCallConnector:processInvitingSipResponseEvent(): Got reponse status: " + jainSipResponse.getStatusCode());
	} else if (this.sipCallState === this.SIP_INVITING_LOCAL_HANGINGUP_STATE) {
		if (statusCode === 407) {
			try {
				// Send Authenticated BYE request
				var jainSipByeRequest = this.jainSipInvitingDialog.createRequest("BYE");
				var clientTransaction = this.clientConnector.jainSipProvider.getNewClientTransaction(jainSipByeRequest);
				var jainSipAuthorizationHeader = this.clientConnector.jainSipHeaderFactory.createAuthorizationHeader(jainSipResponse, jainSipByeRequest, this.clientConnector.configuration.sipPassword, this.clientConnector.configuration.sipLogin);
				this.clientConnector.jainSipMessageFactory.addHeader(jainSipByeRequest, jainSipAuthorizationHeader);
				this.jainSipInvitingDialog.sendRequest(clientTransaction);
				// Update SIP call state
				this.sipCallState = this.SIP_INVITING_HANGINGUP_407_STATE;
			} catch (exception) {
				console.error("PrivateJainSipCallConnector:processInvitingSipRequestEvent(): catched exception, exception:" + exception);
				this.close();
			}
		} else {
			// Force close
			this.close();
		}
	} else if (this.sipCallState === this.SIP_INVITING_LOCAL_HANGINGUP_407_STATE) {
		// Force close
		this.close();
	} else {
		console.error("PrivateJainSipCallConnector:processInvitingSipResponseEvent(): bad state, SIP response ignored");
	}
};

/**
 * Handle SIP request event for invited call
 * @private 
 * @param {RequestEvent} requestEvent request event
 */
PrivateJainSipCallConnector.prototype.processInvitedSipRequestEvent = function(requestEvent) {
	console.debug("PrivateJainSipCallConnector:processInvitedSipRequestEvent(): this.sipCallState=" + this.sipCallState);
	var jainSipRequest = requestEvent.getRequest();
	var requestMethod = jainSipRequest.getMethod();
	var headerFrom = jainSipRequest.getHeader("From");
	if (this.sipCallState === this.SIP_INVITED_INITIAL_STATE) {
		if (requestMethod === "INVITE") {
			try {
				// Store SIP context
				this.jainSipInvitedRequest = jainSipRequest;
				this.jainSipInvitedTransaction = requestEvent.getServerTransaction();
				this.jainSipInvitedDialog = requestEvent.getServerTransaction().getDialog();

				// Ringing
				var jainSip180ORingingResponse = jainSipRequest.createResponse(180, "Ringing");
				jainSip180ORingingResponse.addHeader(this.clientConnector.jainSipContactHeader);
				requestEvent.getServerTransaction().sendResponse(jainSip180ORingingResponse);
			} catch (exception) {
				console.error("PrivateJainSipCallConnector:processInvitedSipRequestEvent(): catched exception, exception:" + exception);
			}

			//  Notify remote SDP offer to WebRTCommCall
			this.webRTCommCall.onPrivateCallConnectorRemoteSdpOfferEvent(this.jainSipInvitedRequest.getContent());
			
			// See if there are any custom SIP headers and expose them. Custom headers are headers starting with 'X-'
			var customHeaders = {};
			var headerList = jainSipRequest.getHeaders();
			for (var i = 0; i < headerList.length; i++) {
				var header = headerList[i];
				if (header.getName().match(/^X-/)) {
					customHeaders[header.getName()] = header.getValue();
				}
			}

			// Notify incoming communication
			var callerPhoneNumber = headerFrom.getAddress().getURI().getUser();
			var callerDisplayName = headerFrom.getAddress().getDisplayName();
			this.webRTCommCall.onPrivateCallConnectorCallRingingEvent(callerPhoneNumber, callerDisplayName, customHeaders);
		} else if (requestMethod === "CANCEL") {
			try {
				// Send 200OK CANCEL
				var jainSip200OKResponse = jainSipRequest.createResponse(200, "OK");
				jainSip200OKResponse.addHeader(this.clientConnector.jainSipContactHeader);
				requestEvent.getServerTransaction().sendResponse(jainSip200OKResponse);

				// Send 487 (Request Cancelled) for the INVITE
				var jainSipResponse487 = this.jainSipInvitedRequest.createResponse(487, "(Request Cancelled)");
				this.jainSipInvitedTransaction.sendMessage(jainSipResponse487);

				// Update SIP call state
				this.sipCallState = this.SIP_INVITED_CANCELLED_STATE;
				this.webRTCommCall.onPrivateCallConnectorCallCanceledEvent();
			} catch (exception) {
				console.error("PrivateJainSipCallConnector:processInvitedSipRequestEvent(): catched exception, exception:" + exception);
			}

			// Notify asynchronously the hangup event
			this.webRTCommCall.onPrivateCallConnectorCallHangupEvent();

			// Close the call
			this.close();
		} else {
			console.error("PrivateJainSipCallConnector:processInvitedSipRequestEvent(): bad state, SIP request ignored");
		}
	} else if (this.sipCallState === this.SIP_INVITED_ACCEPTED_STATE) {
		if (requestMethod === "BYE") {
			try {
				// Send 200OK
				var jainSip200OKResponse = jainSipRequest.createResponse(200, "OK");
				jainSip200OKResponse.addHeader(this.clientConnector.jainSipContactHeader);
				requestEvent.getServerTransaction().sendResponse(jainSip200OKResponse);

				// Update SIP call state
				this.sipCallState = this.SIP_INVITED_HANGUP_STATE;
			} catch (exception) {
				console.error("PrivateJainSipCallConnector:processInvitedSipRequestEvent(): catched exception exception:" + exception);
			}

			// Notify asynchronously the hangup event
			this.webRTCommCall.onPrivateCallConnectorCallHangupEvent();

			// Close the call
			this.close();
		} else if (requestMethod === "ACK") {
			// It's important to update the stored dialog with the one in the request as it might have been updated inside the JAIN SIP stack
			this.jainSipInvitedDialog = requestEvent.getServerTransaction().getDialog();
		} else {
			console.error("PrivateJainSipCallConnector:processInvitedSipRequestEvent(): bad state, SIP request ignored");
		}
	} else if (this.sipCallState === this.SIP_INVITED_LOCAL_HANGINGUP_STATE) {
		console.error("PrivateJainSipCallConnector:processInvitedSipRequestEvent(): bad state, SIP request ignored");
	} else if (this.sipCallState === this.SIP_INVITED_LOCAL_HANGINGUP_407_STATE) {
		console.error("PrivateJainSipCallConnector:processInvitedSipRequestEvent(): bad state, SIP request ignored");
	}
};

/**
 * Handle SIP response event for invited call
 * @private 
 * @param {ResponseEvent} responseEvent response event
 */
PrivateJainSipCallConnector.prototype.processInvitedSipResponseEvent = function(responseEvent) {
	console.debug("PrivateJainSipCallConnector:processInvitedSipResponseEvent(): this.invitingState=" + this.invitingState);
	var jainSipResponse = responseEvent.getResponse();
	var statusCode = parseInt(jainSipResponse.getStatusCode());
	if (this.sipCallState === this.SIP_INVITED_STATE) {
		console.error("PrivateJainSipCallConnector:processInvitedSipResponseEvent(): bad state, SIP response ignored");
	} else if (this.sipCallState === this.SIP_INVITED_ACCEPTED_STATE) {
		console.debug("PrivateJainSipCallConnector:processInvitedSipResponseEvent(): Got reponse status: " + jainSipResponse.getStatusCode());
	} else if (this.sipCallState === this.SIP_INVITED_LOCAL_HANGINGUP_STATE) {
		if (statusCode === 407) {
			try {
				// Send Authenticated BYE request
				var jainSipByeRequest = this.jainSipInvitedDialog.createRequest("BYE");
				var clientTransaction = this.jainSipProvider.getNewClientTransaction(jainSipByeRequest);
				var jainSipAuthorizationHeader = this.jainSipHeaderFactory.createAuthorizationHeader(jainSipResponse, jainSipByeRequest, this.configuration.sipPassword, this.configuration.sipLogin);
				this.jainSipMessageFactory.addHeader(jainSipByeRequest, jainSipAuthorizationHeader);
				jainSipByeRequest.addHeader(this.clientConnector.jainSipContactHeader);
				this.jainSipInvitedDialog.sendRequest(clientTransaction);

				// Update SIP call state
				this.sipCallState = this.SIP_INVITED_HANGINGUP_407_STATE;
			} catch (exception) {
				console.error("PrivateJainSipCallConnector:processInvitedSipResponseEvent(): catched exception, exception:" + exception);
				this.close();
			}
		} else {
			this.close();
		}
	} else if (this.sipCallState === this.SIP_INVITED_LOCAL_HANGINGUP_407_STATE) {
		// Force close
		this.close();
	} else {
		console.error("PrivateJainSipCallConnector:processInvitedSipResponseEvent(): bad state, SIP request ignored");
	}
};
