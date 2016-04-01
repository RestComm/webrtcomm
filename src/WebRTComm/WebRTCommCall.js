/**
 * @class WebRTCommCall
 * @classdesc Main class of the WebRTComm Framework providing high level communication management: 
 *            ringing, ringing back, accept, reject, cancel, bye 
 * @constructor
 * @public
 * @param  {WebRTCommClient} webRTCommClient client owner 
 * @author Laurent STRULLU (laurent.strullu@orange.com) 
 * @author Jean Deruelle (jean.deruelle@telestax.com) 
 */
WebRTCommCall = function(webRTCommClient) {
	if (webRTCommClient instanceof WebRTCommClient) {
		console.debug("WebRTCommCall:WebRTCommCall()");
		this.id = undefined;
		this.webRTCommClient = webRTCommClient;
		this.calleePhoneNumber = undefined;
		this.callerPhoneNumber = undefined;
		this.callerDisplayName = undefined;
		this.incomingCallFlag = false;
		this.configuration = undefined;
		this.connector = undefined;
		this.peerConnection = undefined;
		this.peerConnectionState = undefined;
		this.remoteBundledAudioVideoMediaStream = undefined;
		this.remoteAudioMediaStream = undefined;
		this.remoteVideoMediaStream = undefined;
		this.remoteSdpOffer = undefined;
		this.messageChannel = undefined;
		this.dtmfSender = undefined;
		// Set default listener to client listener
		this.eventListener = webRTCommClient.eventListener;
		this.statsAlreadyRequested = false;
		// webrtc media stats (i.e. coming from PeerConnection.getStats())
		this.stats = undefined;
	} else {
		throw "WebRTCommCall:WebRTCommCall(): bad arguments"
	}
};

/**
 * Audio Codec Name 
 * @private
 * @constant
 */
WebRTCommCall.prototype.codecNames = {
	0: "PCMU",
	8: "PCMA"
};

/**
 * Get opened/closed status 
 * @public
 * @returns {boolean} true if opened, false if closed
 */
WebRTCommCall.prototype.isOpened = function() {
	if (this.connector)
		return this.connector.isOpened();
	else
		return false;
};

/**
 * Get incoming call status 
 * @public
 * @returns {boolean} true if incoming, false if outgoing
 */
WebRTCommCall.prototype.isIncoming = function() {
	if (this.isOpened()) {
		return this.incomingCallFlag;
	} else {
		console.error("WebRTCommCall:isIncoming(): bad state, unauthorized action");
		throw "WebRTCommCall:isIncoming(): bad state, unauthorized action";
	}
};



/**
 * Get call ID
 * @public
 * @returns {String} id  
 */
WebRTCommCall.prototype.getId = function() {
	return this.id;
};

/**
 * Get caller phone number
 * @public
 * @returns {String} callerPhoneNumber or undefined
 */
WebRTCommCall.prototype.getCallerPhoneNumber = function() {
	return this.callerPhoneNumber;
};

/**
 * Get caller display Name
 * @public
 * @returns {String} callerDisplayName or undefined
 */
WebRTCommCall.prototype.getCallerDisplayName = function() {
	return this.callerDisplayName;
};

/**
 * Get client configuration
 * @public
 * @returns {object} configuration or undefined
 */
WebRTCommCall.prototype.getConfiguration = function() {
	return this.configuration;
};


/**
 * Get callee phone number
 * @public
 * @return  {String} calleePhoneNumber or undefined
 */
WebRTCommCall.prototype.getCalleePhoneNumber = function() {
	return this.calleePhoneNumber;
};

/**
 * get bundled audio & video remote media stream
 * @public
 * @return {MediaStream} remoteBundledAudioVideoMediaStream or undefined
 */
WebRTCommCall.prototype.getRemoteBundledAudioVideoMediaStream = function() {
	return this.remoteBundledAudioVideoMediaStream;
};

/**
 * get remote audio media stream
 * @public
 * @return {MediaStream} remoteAudioMediaStream or undefined
 */
WebRTCommCall.prototype.getRemoteAudioMediaStream = function() {
	return this.remoteAudioMediaStream;
};

/**
 * get remote audio media stream
 * @public
 * @return {MediaStream} remoteAudioMediaStream or undefined
 */
WebRTCommCall.prototype.getRemoteVideoMediaStream = function() {
	return this.remoteVideoMediaStream;
};


/**
 * set webRTCommCall listener
 * @param {objet} eventListener implementing WebRTCommCallEventListener interface
 */
WebRTCommCall.prototype.setEventListener = function(eventListener) {
	this.eventListener = eventListener;
};

/**
 * Open WebRTC communication,  asynchronous action, opened or error event are notified to the WebRTCommClient eventListener
 * @public 
 * @param {String} calleePhoneNumber callee phone number (bob@sip.net)
 * @param {object} configuration communication configuration JSON object
 * <p> Communication configuration sample: <br>
 * { <br>
 * <span style="margin-left: 30px">displayName:alice,<br></span>
 * <span style="margin-left: 30px">localMediaStream: [LocalMediaStream],<br></span>
 * <span style="margin-left: 30px">audioMediaFlag:true,<br></span>
 * <span style="margin-left: 30px">videoMediaFlag:false,<br></span>
 * <span style="margin-left: 30px">messageMediaFlag:false,<br></span>
 * <span style="margin-left: 30px">audioCodecsFilter:PCMA,PCMU,OPUS,<br></span>
 * <span style="margin-left: 30px">videoCodecsFilter:VP8,H264,<br></span>
 * <span style="margin-left: 30px">opusFmtpCodecsParameters:maxaveragebitrate=128000,<br></span>
 * }<br>
 * </p>
 * @throw {String} Exception "bad argument, check API documentation"
 * @throw {String} Exception "bad configuration, missing parameter"
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception internal error
 */
WebRTCommCall.prototype.open = function(calleePhoneNumber, configuration) {
	console.debug("WebRTCommCall:open():calleePhoneNumber=" + calleePhoneNumber);
	console.debug("WebRTCommCall:open():configuration=" + JSON.stringify(configuration));
	if (typeof(configuration) === 'object') {
		if (this.webRTCommClient.isOpened()) {
			if (this.checkConfiguration(configuration)) {
				if (this.isOpened() === false) {
					try {
						var that = this;
						this.callerPhoneNumber = this.webRTCommClient.configuration.sip.sipUserName;
						this.calleePhoneNumber = calleePhoneNumber;
						this.configuration = configuration;
						this.connector.open(configuration);

						// Setup RTCPeerConnection first
						this.createRTCPeerConnection();
						////////////
						//this.get_stats();
						if (configuration.audioMediaFlag || configuration.videoMediaFlag) {
							this.peerConnection.addStream(this.configuration.localMediaStream);
						}
						if (this.configuration.messageMediaFlag) {
							if (this.peerConnection.createDataChannel) {
								try {
									this.messageChannel = this.peerConnection.createDataChannel("mymessageChannel", {
										reliable: false
									});
									console.debug("WebRTCommCall:open(): this.messageChannel.label=" + this.messageChannel.label);
									console.debug("WebRTCommCall:open(): this.messageChannel.reliable=" + this.messageChannel.reliable);
									console.debug("WebRTCommCall:open(): this.messageChannel.binaryType=" + this.messageChannel.binaryType);
									this.messageChannel.onopen = function(event) {
										that.onRtcPeerConnectionMessageChannelOnOpenEvent(event);
									};
									this.messageChannel.onclose = function(event) {
										that.onRtcPeerConnectionMessageChannelOnClose(event);
									};
									this.messageChannel.onerror = function(event) {
										that.onRtcPeerConnectionMessageChannelOnErrorEvent(event);
									};
									this.messageChannel.onmessage = function(event) {
										that.onRtcPeerConnectionMessageChannelOnMessageEvent(event);
									};
								} catch (exception) {
									alert("WebRTCommCall:open():DataChannel not supported");
								}
							}
						}

						if (window.webkitRTCPeerConnection) {
							var sdpConstraints = {
								mandatory: {
									OfferToReceiveAudio: this.configuration.audioMediaFlag,
									OfferToReceiveVideo: this.configuration.videoMediaFlag
								},
								optional: []
							};

							console.debug("WebRTCommCall:open():sdpConstraints=" + JSON.stringify(sdpConstraints));
							this.peerConnection.createOffer(function(offer) {
								that.onRtcPeerConnectionCreateOfferSuccessEvent(offer);
							}, function(error) {
								that.onRtcPeerConnectionCreateOfferErrorEvent(error);
							}, sdpConstraints);
						} else if (window.mozRTCPeerConnection) {
							var sdpConstraints = {
								offerToReceiveAudio: this.configuration.audioMediaFlag,
								offerToReceiveVideo: this.configuration.videoMediaFlag,
								mozDontOfferDataChannel: !this.configuration.messageMediaFlag
							};

							console.debug("WebRTCommCall:open():sdpConstraints=" + JSON.stringify(sdpConstraints));
							this.peerConnection.createOffer(function(offer) {
								that.onRtcPeerConnectionCreateOfferSuccessEvent(offer);
							}, function(error) {
								that.onRtcPeerConnectionCreateOfferErrorEvent(error);
							}, sdpConstraints);
						}
						console.debug("WebRTCommCall:open():sdpConstraints=" + JSON.stringify(sdpConstraints));
					} catch (exception) {
						console.error("WebRTCommCall:open(): catched exception:" + exception);
						setTimeout(function() {
							try {
								that.eventListener.onWebRTCommCallOpenErrorEvent(that, exception);
							} catch (exception) {
								console.error("WebRTCommCall:open(): catched exception in listener:" + exception);
							}
						}, 1);
						// Close properly the communication
						try {

							this.close(false);
						} catch (e) {}
						throw exception;
					}
				} else {
					console.error("WebRTCommCall:open(): bad state, unauthorized action");
					throw "WebRTCommCall:open(): bad state, unauthorized action";
				}
			} else {
				console.error("WebRTCommCall:open(): bad configuration");
				throw "WebRTCommCall:open(): bad configuration";
			}
		} else {
			console.error("WebRTCommCall:open(): bad state, unauthorized action");
			throw "WebRTCommCall:open(): bad state, unauthorized action";
		}
	} else {
		console.error("WebRTCommCall:open(): bad argument, check API documentation");
		throw "WebRTCommCall:open(): bad argument, check API documentation"
	}
};


/**
 * Return PeerConnection stats
 * @public 
 * @throw {String} Exception "bad state, unauthorized action"
 */
/*
WebRTCommCall.prototype.get_stats = function() {
	var that = this;
	//setInterval(function() {
		if (that.peerConnection != null) {
			that.peerConnection.getStats(null, function(results) {
				var statsString = dumpStats(results);
				console.debug("WebRTCommCall:getStats(): " + statsString);
			}, function(err) {
				console.log(err);
			});
		}
		else {
			console.debug("WebRTCommCall:getStats(): peerConnection is null");
		}
	//}, 1000);
}
*/

/**
 * Close WebRTC communication, asynchronous action, closed event are notified to the WebRTCommClient eventListener
 * @public 
 * @throw {String} Exception "bad state, unauthorized action"
 */
WebRTCommCall.prototype.hangup = function() {
	console.debug("WebRTCommCall:hangup()");
	if (this.webRTCommClient.isOpened()) {
		try {
			// Close private Call Connector
			if (this.connector) {
				this.connector.close();
			}

			// Close RTCPeerConnection
			if (this.peerConnection && this.peerConnection.signalingState !== 'closed') {
				if (this.messageChannel)
					this.messageChannel.close();
				this.peerConnection.close();
				this.peerConnection = undefined;
				this.dtmfSender = undefined;
				// Notify asynchronously the closed event
				var that = this;
				setTimeout(function() {
					that.eventListener.onWebRTCommCallClosedEvent(that);
					// notify the webrtcomm listener of the stats
					/*
					if (this.eventListener.onWebRTCommCallStatsEvent) {
						that.eventListener.onWebRTCommCallStatsEvent(that, statsString);
					}
					*/
				}, 1);
			}
		} catch (exception) {
			console.error("WebRTCommCall:close(): catched exception:" + exception);
		}
	} else {
		console.error("WebRTCommCall:close(): bad state, unauthorized action");
		throw "WebRTCommCall:close(): bad state, unauthorized action";
	}
}

// Dumping a stats variable as a string.
// might be named toString?
/*
function dumpStats(results) {
	var statsString = '';
	Object.keys(results).forEach(function(key, index) {
		var res = results[key];
		statsString += 'Report ';
		statsString += index;
		statsString += ': time ' + res.timestamp;
		statsString += ', type ' + res.type + '<br>\n';
		Object.keys(res).forEach(function(k) {
			if (k !== 'timestamp' && k !== 'type') {
				statsString += k + ': ' + res[k] + '<br>\n';
			}
		});
		statsString += '<br>\n';
	});
	return statsString;
}
*/

/**
 * Take as input getStats() outcome and convert to specific metrics that we are mostly interested. Also in the process normalize mozilla & chrome format
 * @public 
 * @param {shouldGetStats} should we collect webrtc media stats? Boolean, default true
 * @throw {String} Exception "bad state, unauthorized action"
 * @returns {Array of objects} Each object corresponds to a
 * media-type/direction pair. So if we have audio & video call we would have an
 * array of 4 objects: 1. audio/inbound, audio/outbound, video/inbound,
 * video/outbound. Each object has the following keys:
 *
 * media-type: audio/video (ff only, until we figure it out for chrome)
 * direction: inbound/outbound
 * bitrate: bitrate in kbit/sec, like 250 kbit/sec (ff only)
 * packetsLost: lost packet count
 * bytesTransfered: bytes sent/received
 * packetsTransfered: packets sent/received
 * jitter: jitter for incoming packets
 * ssrc: synchronization source for this stream, like 501954246
 */
WebRTCommCall.prototype.normalizeStats = function(stats) {
	// array of objects
	var normalizedStats = [];
	// calculate video bitrate
	Object.keys(stats).forEach(function(result) {
		var report = stats[result];
		//var now = report.timestamp;

		// object to represent stats for a single media type (i.e. audio/video) and a single direction (i.e. inbound/outbound)
		normalizedStat = {};
		if (/boundrtp$/.test(report.type)) {  
			// firefox
			if (report.type === 'inboundrtp') {
				normalizedStat['direction'] = 'inbound';
				normalizedStat['bytes-transfered'] = report.bytesReceived;
				normalizedStat['packets-transfered'] = report.packetsReceived;
			}
			if (report.type === 'outboundrtp') {
				normalizedStat['direction'] = 'outbound';
				normalizedStat['bytes-transfered'] = report.bytesSent;
				normalizedStat['packets-transfered'] = report.packetsSent;
			}
			normalizedStat['media-type'] = report.mediaType;
			if (report.bitrateMean) {
				normalizedStat['bitrate'] = Math.floor(report.bitrateMean / 1024);
			}
			normalizedStat['packets-lost'] = report.packetsLost;
			normalizedStat['jitter'] = report.jitter;
			normalizedStat['ssrc'] = report.ssrc;

			normalizedStats.push(normalizedStat);
		}
		else if (report.type === 'ssrc') {
			// chrome
			if (/_recv$/.test(report.id)) {
				normalizedStat['direction'] = 'inbound';
				normalizedStat['bytes-transfered'] = report.bytesReceived;
				normalizedStat['packets-transfered'] = report.packetsReceived;
			}
			if (/_send$/.test(report.id)) {
				normalizedStat['direction'] = 'outbound';
				normalizedStat['bytes-transfered'] = report.bytesSent;
				normalizedStat['packets-transfered'] = report.packetsSent;
			}
			normalizedStat['codec-name'] = report.googCodecName;
			normalizedStat['packets-lost'] = report.packetsLost;
			normalizedStat['jitter'] = report.googJitterReceived;
			normalizedStat['ssrc'] = report.ssrc;
			// TODO: need to find a way to figure out the media-type for chrome

			normalizedStats.push(normalizedStat);
		}
	});

	return normalizedStats;
}

/**
 * Close WebRTC communication, asynchronous action, closed event are notified to the WebRTCommClient eventListener. Notice that the actual close happens in this.hangup(), reason for separating those is that we need to close after we have received the webrtc stats (that is if they have been requested), cause otherwise getStats() might fail, since PeerConnection might be freed first
 * @public 
 * @param {shouldGetStats} should we collect webrtc media stats? Boolean, default true
 * @throw {String} Exception "bad state, unauthorized action"
 */
WebRTCommCall.prototype.close = function(shouldGetStats) {
	// user requested to hangup the call, let's gather media stats before doing so if  user asked for it
	if (typeof shouldGetStats === 'undefined') {
		shouldGetStats = true;
	}

	if (shouldGetStats === true) {
		if (this.peerConnection != null && this.statsAlreadyRequested === false) {
			var that = this;
			this.statsAlreadyRequested = true;
			this.peerConnection.getStats(null, function(results) {
				console.debug("WebRTCommCall:close(), received media stats");
				// do actual hangup now that we got the stats
				that.hangup();

				//var statsString = dumpStats(results);
				// normalize the stats
				that.stats = that.normalizeStats(results);
			}, function(err) {
				console.log(err);
			});
		}
	} else {
		console.debug("WebRTCommCall:close(), with no media stats");
		this.hangup();
	}
};

/**
 * Accept incoming WebRTC communication
 * @public 
 * @param {object} configuration communication configuration JSON object
 * <p> Communication configuration sample: <br>
 * { <br>
 * <span style="margin-left: 30px">displayName:alice,<br></span>
 * <span style="margin-left: 30px">localMediaStream: [LocalMediaStream],<br></span>
 * <span style="margin-left: 30px">audioMediaFlag:true,<br></span>
 * <span style="margin-left: 30px">videoMediaFlag:false,<br></span>
 * <span style="margin-left: 30px">messageMediaFlag:false,<br></span>
 * <span style="margin-left: 30px">audioCodecsFilter:PCMA,PCMU,OPUS,<br></span>
 * <span style="margin-left: 30px">videoCodecsFilter:VP8,H264,<br></span>
 * }<br>
 * </p>
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception "internal error,check console logs"
 */
WebRTCommCall.prototype.accept = function(configuration) {
	console.debug("WebRTCommCall:accept():configuration=" + JSON.stringify(configuration));
	if (typeof(configuration) === 'object') {
		if (this.webRTCommClient.isOpened()) {
			if (this.checkConfiguration(configuration)) {
				this.configuration = configuration;
				if (this.isOpened() === false) {
					try {
						this.createRTCPeerConnection();
						if (configuration.audioMediaFlag || configuration.videoMediaFlag) {
							this.peerConnection.addStream(this.configuration.localMediaStream);
						}
						var sdpOffer = undefined;
						//if (window.webkitRTCPeerConnection) {
						sdpOffer = new RTCSessionDescription({
							type: 'offer',
							sdp: this.remoteSdpOffer
						});
						/*
						} else if (window.mozRTCPeerConnection) {
							sdpOffer = new mozRTCSessionDescription({
								type: 'offer',
								sdp: this.remoteSdpOffer
							});
						}
						*/
						var that = this;
						this.peerConnectionState = 'offer-received';
						this.peerConnection.setRemoteDescription(sdpOffer, function() {
							that.onRtcPeerConnectionSetRemoteDescriptionSuccessEvent();
						}, function(error) {
							that.onRtcPeerConnectionSetRemoteDescriptionErrorEvent(error);
						});
					} catch (exception) {
						console.error("WebRTCommCall:accept(): catched exception:" + exception);
						// Close properly the communication
						try {
							this.close(false);
						} catch (e) {}
						throw exception;
					}
				} else {
					console.error("WebRTCommCall:accept(): bad state, unauthorized action");
					throw "WebRTCommCall:accept(): bad state, unauthorized action";
				}
			} else {
				console.error("WebRTCommCall:accept(): bad configuration");
				throw "WebRTCommCall:accept(): bad configuration";
			}
		} else {
			console.error("WebRTCommCall:accept(): bad state, unauthorized action");
			throw "WebRTCommCall:accept(): bad state, unauthorized action";
		}
	} else {
		// Client closed
		console.error("WebRTCommCall:accept(): bad argument, check API documentation");
		throw "WebRTCommCall:accept(): bad argument, check API documentation"
	}
};

/**
 * Reject/refuse incoming WebRTC communication
 * @public 
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception "internal error,check console logs"
 */
WebRTCommCall.prototype.reject = function() {
	console.debug("WebRTCommCall:reject()");
	if (this.webRTCommClient.isOpened()) {
		try {
			this.connector.reject();

			// Notify asynchronously the closed event
			var that = this;
			setTimeout(function() {
				that.eventListener.onWebRTCommCallClosedEvent(that);
			}, 1);
		} catch (exception) {
			console.error("WebRTCommCall:reject(): catched exception:" + exception);
			// Close properly the communication
			try {
				this.close(false);
			} catch (e) {}
			throw exception;
		}
	} else {
		console.error("WebRTCommCall:reject(): bad state, unauthorized action");
		throw "WebRTCommCall:reject(): bad state, unauthorized action";
	}
};

/**
 * Ignore incoming WebRTC communication. This means that we silently close the communication without replying to the remote party
 * @public 
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception "internal error,check console logs"
 */
WebRTCommCall.prototype.ignore = function() {
	console.debug("WebRTCommCall:ignore()");
	if (this.webRTCommClient.isOpened()) {
		try {
			this.connector.ignore();

			// Notify asynchronously the closed event
			var that = this;
			setTimeout(function() {
				that.eventListener.onWebRTCommCallClosedEvent(that);
			}, 1);
		} catch (exception) {
			console.error("WebRTCommCall:ignore(): catched exception:" + exception);
			// Close properly the communication
			try {
				this.close(false);
			} catch (e) {}
			throw exception;
		}
	} else {
		console.error("WebRTCommCall:ignore(): bad state, unauthorized action");
		throw "WebRTCommCall:ignore(): bad state, unauthorized action";
	}
};

/**
 * Send DTMF Tone to WebRTC communication peer over the peerconnection
 * @public 
 * @param {String} dtmfEvent to send (1,2,3...)
 */
WebRTCommCall.prototype.sendDTMF = function(dtmfEvent) {
	var duration = 500;
	var gap = 50;
	if (this.dtmfSender) {
		console.debug('Sending Tones, duration, gap: ', dtmfEvent, duration, gap);
		this.dtmfSender.insertDTMF(dtmfEvent, duration, gap);
	} else {
		console.debug('DTMFSender not initialized so not Sending Tones, duration, gap: ', dtmfEvent, duration, gap);
	}
}


/**
 * Send Short message to WebRTC communication peer
 * Use WebRTC datachannel if open otherwise use transport (e.g SIP) implemented by the connector
 * @public 
 * @param {String} text message to send
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception "internal error,check console logs"
 * @returns {WebRTCommMessage} new created WebRTCommMessage object
 */
WebRTCommCall.prototype.sendMessage = function(text) {
	console.debug("WebRTCommCall:sendMessage()");
	if (this.webRTCommClient.isOpened()) {
		if (this.isOpened()) {
			var newWebRTCommMessage = new WebRTCommMessage(this.webRTCommClient, this);
			newWebRTCommMessage.text = text;
			if (this.isIncoming()) {
				newWebRTCommMessage.to = this.callerPhoneNumber;
			} else {
				newWebRTCommMessage.to = this.calleePhoneNumber;
			}

			try {
				newWebRTCommMessage.connector.send();
			} catch (exception) {
				console.error("WebRTCommCall:sendMessage(): catched exception:" + exception);
				throw "WebRTCommCall:sendMessage(): catched exception:" + exception;
			}
			return newWebRTCommMessage;
		} else {
			console.error("WebRTCommCall:sendMessage(): bad state, unauthorized action");
			throw "WebRTCommCall:sendMessage(): bad state, unauthorized action";
		}
	} else {
		console.error("WebRTCommCall:sendMessage(): bad state, unauthorized action");
		throw "WebRTCommCall:sendMessage(): bad state, unauthorized action";
	}
};

/**
 * Send Short message to WebRTC communication peer
 * Use WebRTC datachannel if open otherwise use transport (e.g SIP) implemented by the connector
 * @public 
 * @param {String} text message to send
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception "internal error,check console logs"
 * @returns {WebRTCommMessage} new created WebRTCommMessage object
 */
WebRTCommCall.prototype.sendDataMessage = function(text) {
	console.debug("WebRTCommCall:sendDataMessage()");
	if (this.webRTCommClient.isOpened()) {
		if (this.isOpened()) {
			var newWebRTCommDataMessage = new WebRTCommDataMessage(this.webRTCommClient, this);
			newWebRTCommDataMessage.content = text;
			if (this.isIncoming()) {
				newWebRTCommDataMessage.to = this.callerPhoneNumber;
			} else {
				newWebRTCommDataMessage.to = this.calleePhoneNumber;
			}

			if (this.messageChannel && this.messageChannel.readyState === "open") {
				try {
					this.messageChannel.send(newWebRTCommDataMessage.content);
					if (this.eventListener.onWebRTCommDataMessageSentEvent) {
						var that = this;
						setTimeout(function() {
							try {
								that.eventListener.onWebRTCommDataMessageSentEvent(newWebRTCommDataMessage);
							} catch (exception) {
								console.error("WebRTCommCall:sendDataMessage(): catched exception in event listener:" + exception);
							}
						}, 1);
					}
				} catch (exception) {
					console.error("WebRTCommCall:sendDataMessage(): catched exception:" + exception);
					throw "WebRTCommCall:sendDataMessage(): catched exception:" + exception;
				}
			}

			return newWebRTCommDataMessage;
		} else {
			console.error("WebRTCommCall:sendDataMessage(): bad state, unauthorized action");
			throw "WebRTCommCall:sendDataMessage(): bad state, unauthorized action";
		}
	} else {
		console.error("WebRTCommCall:sendDataMessage(): bad state, unauthorized action");
		throw "WebRTCommCall:sendDataMessage(): bad state, unauthorized action";
	}
};

/**
 * Mute local audio media stream
 * @public 
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception "not implemented by navigator"
 */
WebRTCommCall.prototype.muteLocalAudioMediaStream = function() {
	console.debug("WebRTCommCall:muteLocalAudioMediaStream()");
	if (this.configuration.localMediaStream && this.configuration.localMediaStream.signalingState === this.configuration.localMediaStream.LIVE) {
		var audioTracks = undefined;
		if (this.configuration.localMediaStream.audioTracks)
			audioTracks = this.configuration.localMediaStream.audioTracks;
		else if (this.configuration.localMediaStream.getAudioTracks)
			audioTracks = this.configuration.localMediaStream.getAudioTracks();
		if (audioTracks) {
			for (var i = 0; i < audioTracks.length; i++) {
				audioTracks[i].enabled = false;
			}
		} else {
			console.error("WebRTCommCall:muteLocalAudioMediaStream(): not implemented by navigator");
			throw "WebRTCommCall:muteLocalAudioMediaStream(): not implemented by navigator";
		}
	} else {
		console.error("WebRTCommCall:muteLocalAudioMediaStream(): bad state, unauthorized action");
		throw "WebRTCommCall:muteLocalAudioMediaStream(): bad state, unauthorized action";
	}
};

/**
 * Unmute local audio media stream
 * @public 
 */
WebRTCommCall.prototype.unmuteLocalAudioMediaStream = function() {
	console.debug("WebRTCommCall:unmuteLocalAudioMediaStream()");
	if (this.configuration.localMediaStream && this.configuration.localMediaStream.signalingState === this.configuration.localMediaStream.LIVE) {
		var audioTracks = undefined;
		if (this.configuration.localMediaStream.audioTracks)
			audioTracks = this.configuration.localMediaStream.audioTracks;
		else if (this.configuration.localMediaStream.getAudioTracks)
			audioTracks = this.configuration.localMediaStream.getAudioTracks();
		if (audioTracks) {
			for (var i = 0; i < audioTracks.length; i++) {
				audioTracks[i].enabled = true;
			}
		} else {
			console.error("WebRTCommCall:unmuteLocalAudioMediaStream(): not implemented by navigator");
			throw "WebRTCommCall:unmuteLocalAudioMediaStream(): not implemented by navigator";
		}
	} else {
		console.error("WebRTCommCall:unmuteLocalAudioMediaStream(): bad state, unauthorized action");
		throw "WebRTCommCall:unmuteLocalAudioMediaStream(): bad state, unauthorized action";
	}
};

/**
 * Mute remote audio media stream
 * @public 
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception "not implemented by navigator"
 */
WebRTCommCall.prototype.muteRemoteAudioMediaStream = function() {
	console.debug("WebRTCommCall:muteRemoteAudioMediaStream()");
	if (this.remoteBundledAudioVideoMediaStream && this.remoteBundledAudioVideoMediaStream.signalingState === this.remoteBundledAudioVideoMediaStream.LIVE) {
		var audioTracks = undefined;
		if (this.remoteBundledAudioVideoMediaStream.audioTracks)
			audioTracks = this.remoteBundledAudioVideoMediaStream.audioTracks;
		else if (this.remoteBundledAudioVideoMediaStream.getAudioTracks)
			audioTracks = this.remoteBundledAudioVideoMediaStream.getAudioTracks();
		if (audioTracks) {
			for (var i = 0; i < audioTracks.length; i++) {
				audioTracks[i].enabled = false;
			}
		} else {
			console.error("WebRTCommCall:muteRemoteAudioMediaStream(): not implemented by navigator");
			throw "WebRTCommCall:muteRemoteAudioMediaStream(): not implemented by navigator";
		}
	} else {
		console.error("WebRTCommCall:muteRemoteAudioMediaStream(): bad state, unauthorized action");
		throw "WebRTCommCall:muteRemoteAudioMediaStream(): bad state, unauthorized action";
	}
};

/**
 * Unmute remote audio media stream
 * @public 
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception "not implemented by navigator"
 */
WebRTCommCall.prototype.unmuteRemoteAudioMediaStream = function() {
	console.debug("WebRTCommCall:unmuteRemoteAudioMediaStream()");
	if (this.remoteBundledAudioVideoMediaStream && this.remoteBundledAudioVideoMediaStream.signalingState === this.remoteBundledAudioVideoMediaStream.LIVE) {
		var audioTracks = undefined;
		if (this.remoteBundledAudioVideoMediaStream.audioTracks)
			audioTracks = this.remoteBundledAudioVideoMediaStream.audioTracks;
		else if (this.remoteBundledAudioVideoMediaStream.getAudioTracks)
			audioTracks = this.remoteBundledAudioVideoMediaStream.getAudioTracks();
		if (audioTracks) {
			for (var i = 0; i < audioTracks.length; i++) {
				audioTracks[i].enabled = true;
			}
		} else {
			console.error("WebRTCommCall:unmuteRemoteAudioMediaStream(): not implemented by navigator");
			throw "WebRTCommCall:unmuteRemoteAudioMediaStream(): not implemented by navigator";
		}
	} else {
		console.error("WebRTCommCall:unmuteRemoteAudioMediaStream(): bad state, unauthorized action");
		throw "WebRTCommCall:unmuteRemoteAudioMediaStream(): bad state, unauthorized action";
	}
};

/**
 * Hide local video media stream
 * @public 
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception "not implemented by navigator"
 */
WebRTCommCall.prototype.hideLocalVideoMediaStream = function() {
	console.debug("WebRTCommCall:hideLocalVideoMediaStream()");
	if (this.configuration.localMediaStream && this.configuration.localMediaStream.signalingState === this.configuration.localMediaStream.LIVE) {
		var videoTracks = undefined;
		if (this.configuration.localMediaStream.videoTracks)
			videoTracks = this.configuration.localMediaStream.videoTracks;
		else if (this.configuration.localMediaStream.getVideoTracks)
			videoTracks = this.configuration.localMediaStream.getVideoTracks();
		if (videoTracks) {
			videoTracks.enabled = !videoTracks.enabled;
			for (var i = 0; i < videoTracks.length; i++) {
				videoTracks[i].enabled = false;
			}
		} else {
			console.error("WebRTCommCall:hideLocalVideoMediaStream(): not implemented by navigator");
			throw "WebRTCommCall:hideLocalVideoMediaStream(): not implemented by navigator";
		}
	} else {
		console.error("WebRTCommCall:hideLocalVideoMediaStream(): bad state, unauthorized action");
		throw "WebRTCommCall:hideLocalVideoMediaStream(): bad state, unauthorized action";
	}
};

/**
 * Show local video media stream
 * @public 
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception "not implemented by navigator"
 */
WebRTCommCall.prototype.showLocalVideoMediaStream = function() {
	console.debug("WebRTCommCall:showLocalVideoMediaStream()");
	if (this.configuration.localMediaStream && this.configuration.localMediaStream.signalingState === this.configuration.localMediaStream.LIVE) {
		var videoTracks = undefined;
		if (this.configuration.localMediaStream.videoTracks)
			videoTracks = this.configuration.localMediaStream.videoTracks;
		else if (this.configuration.localMediaStream.getVideoTracks)
			videoTracks = this.configuration.localMediaStream.getVideoTracks();
		if (videoTracks) {
			videoTracks.enabled = !videoTracks.enabled;
			for (var i = 0; i < videoTracks.length; i++) {
				videoTracks[i].enabled = true;
			}
		} else {
			console.error("WebRTCommCall:showLocalVideoMediaStream(): not implemented by navigator");
			throw "WebRTCommCall:showLocalVideoMediaStream(): not implemented by navigator";
		}
	} else {
		console.error("WebRTCommCall:showLocalVideoMediaStream(): bad state, unauthorized action");
		throw "WebRTCommCall:showLocalVideoMediaStream(): bad state, unauthorized action";
	}
};


/**
 * Hide remote video media stream
 * @public 
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception "not implemented by navigator"
 */
WebRTCommCall.prototype.hideRemoteVideoMediaStream = function() {
	console.debug("WebRTCommCall:hideRemoteVideoMediaStream()");
	if (this.remoteBundledAudioVideoMediaStream && this.remoteBundledAudioVideoMediaStream.signalingState === this.remoteBundledAudioVideoMediaStream.LIVE) {
		var videoTracks = undefined;
		if (this.remoteBundledAudioVideoMediaStream.videoTracks)
			videoTracks = this.remoteBundledAudioVideoMediaStream.videoTracks;
		else if (this.remoteBundledAudioVideoMediaStream.getVideoTracks)
			videoTracks = this.remoteBundledAudioVideoMediaStream.getVideoTracks();
		if (videoTracks) {
			videoTracks.enabled = !videoTracks.enabled;
			for (var i = 0; i < videoTracks.length; i++) {
				videoTracks[i].enabled = false;
			}
		} else {
			console.error("WebRTCommCall:hideRemoteVideoMediaStream(): not implemented by navigator");
			throw "WebRTCommCall:hideRemoteVideoMediaStream(): not implemented by navigator";
		}
	} else {
		console.error("WebRTCommCall:hideRemoteVideoMediaStream(): bad state, unauthorized action");
		throw "WebRTCommCall:hideRemoteVideoMediaStream(): bad state, unauthorized action";
	}
};

/**
 * Show remote video media stream
 * @public 
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception "not implemented by navigator"
 */
WebRTCommCall.prototype.showRemoteVideoMediaStream = function() {
	console.debug("WebRTCommCall:showRemoteVideoMediaStream()");
	if (this.remoteBundledAudioVideoMediaStream && this.remoteBundledAudioVideoMediaStream.signalingState === this.remoteBundledAudioVideoMediaStream.LIVE) {
		var videoTracks = undefined;
		if (this.remoteBundledAudioVideoMediaStream.videoTracks)
			videoTracks = this.remoteBundledAudioVideoMediaStream.videoTracks;
		else if (this.remoteBundledAudioVideoMediaStream.getVideoTracks)
			videoTracks = this.remoteBundledAudioVideoMediaStream.getVideoTracks();
		if (videoTracks) {
			videoTracks.enabled = !videoTracks.enabled;
			for (var i = 0; i < videoTracks.length; i++) {
				videoTracks[i].enabled = true;
			}
		} else {
			console.error("WebRTCommCall:showRemoteVideoMediaStream(): not implemented by navigator");
			throw "WebRTCommCall:showRemoteVideoMediaStream(): not implemented by navigator";
		}
	} else {
		console.error("WebRTCommCall:showRemoteVideoMediaStream(): bad state, unauthorized action");
		throw "WebRTCommCall:showRemoteVideoMediaStream(): bad state, unauthorized action";
	}
};


/**
 * Check configuration 
 * @private
 * @param {object}  configuration call configuration
 * @return true configuration ok false otherwise
 */
WebRTCommCall.prototype.checkConfiguration = function(configuration) {
	console.debug("WebRTCommCall:checkConfiguration()");

	var check = true;
	// displayName, audioCodecsFilter, videoCodecsFilter NOT mandatoty in configuration

	if (configuration.audioMediaFlag === undefined || (typeof(configuration.audioMediaFlag) !== 'boolean')) {
		check = false;
		console.error("WebRTCommCall:checkConfiguration(): missing audio media flag");
	}

	if (configuration.videoMediaFlag === undefined || (typeof(configuration.videoMediaFlag) !== 'boolean')) {
		check = false;
		console.error("WebRTCommCall:checkConfiguration(): missing video media flag");
	}

	if ((configuration.audioMediaFlag || configuration.videoMediaFlag) && configuration.localMediaStream === undefined) {
		check = false;
		console.error("WebRTCommCall:checkConfiguration(): missing localMediaStream");
	}

	if (configuration.messageMediaFlag === undefined || (typeof(configuration.messageMediaFlag) !== 'boolean')) {
		check = false;
		console.error("WebRTCommCall:checkConfiguration(): missing message media flag");
	}
	return check;
};

/**
 * Create RTCPeerConnection 
 * @private
 * @return true configuration ok false otherwise
 */
WebRTCommCall.prototype.createRTCPeerConnection = function() {
	console.debug("WebRTCommCall:createPeerConnection()");
	var rtcPeerConnectionConfiguration = {
		iceServers: []
	};

	this.peerConnectionState = 'new';
	var that = this;
	/* https://code.google.com/p/webrtcomm/issues/detail?id=14 */
	if (this.webRTCommClient.configuration.RTCPeerConnection.iceServers) {
		rtcPeerConnectionConfiguration = this.webRTCommClient.configuration.RTCPeerConnection.iceServers;
	} else {
		if (this.webRTCommClient.configuration.RTCPeerConnection.stunServer) {
			rtcPeerConnectionConfiguration.iceServers.push({
				url: "stun:" + this.webRTCommClient.configuration.RTCPeerConnection.stunServer
			});
		}
		if (this.webRTCommClient.configuration.RTCPeerConnection.turnServer && this.webRTCommClient.configuration.RTCPeerConnection.turnLogin && this.webRTCommClient.configuration.RTCPeerConnection.turnPassword) {
			rtcPeerConnectionConfiguration.iceServers.push({
				url: "turn:" + this.webRTCommClient.configuration.RTCPeerConnection.turnServer,
				username: this.webRTCommClient.configuration.RTCPeerConnection.turnLogin,
				credential: this.webRTCommClient.configuration.RTCPeerConnection.turnPassword
			});
		}
	}


	console.debug("WebRTCommCall:createPeerConnection():rtcPeerConnectionConfiguration=" + JSON.stringify(rtcPeerConnectionConfiguration));
	console.debug("WebRTCommCall:createPeerConnection():peerConnectionConstraints=" + JSON.stringify(peerConnectionConstraints));

	// TODO: check if these are still needed (i.e. now that we are using adapter.js)
	if (window.webkitRTCPeerConnection) {
		// Google implementation
		var iceTransports = "all";
		if (this.webRTCommClient.configuration.RTCPeerConnection.forceTurnMediaRelay) {
			iceTransports = "relay";
		}

		var peerConnectionConstraints = {
			mandatory: {
				IceTransports: iceTransports
			},
			optional: []
				//{
				// SCTP Channels available in Chrome 31
				//RtpDataChannels: true
				//}, {
				// DTLS Mandatory and available in Chrome 35
				//DtlsSrtpKeyAgreement: this.webRTCommClient.configuration.RTCPeerConnection.dtlsSrtpKeyAgreement
				//  }]
		};

		this.peerConnection = new RTCPeerConnection(rtcPeerConnectionConfiguration, peerConnectionConstraints);
	} else if (window.mozRTCPeerConnection) {
		// Mozilla implementation
		this.peerConnection = new RTCPeerConnection(rtcPeerConnectionConfiguration, peerConnectionConstraints);
	}

	this.peerConnection.onaddstream = function(event) {
		that.onRtcPeerConnectionOnAddStreamEvent(event);
	};

	this.peerConnection.onremovestream = function(event) {
		that.onRtcPeerConnectionOnRemoveStreamEvent(event);
	};

	this.peerConnection.onstatechange = function(event) {
		that.onRtcPeerConnectionStateChangeEvent(event);
	};

	if (window.webkitRTCPeerConnection) {
		// Google implementation only for the time being
		this.peerConnection.onsignalingstatechange = function(event) {
			console.warn("RTCPeerConnection API update");
			that.onRtcPeerConnectionStateChangeEvent(event);
		};
	}

	this.peerConnection.onicecandidate = function(rtcIceCandidateEvent) {
		that.onRtcPeerConnectionIceCandidateEvent(rtcIceCandidateEvent);
	};

	this.peerConnection.ongatheringchange = function(event) {
		that.onRtcPeerConnectionGatheringChangeEvent(event);
	};

	this.peerConnection.onicechange = function(event) {
		that.onRtcPeerConnectionIceChangeEvent(event);
	};

	if (window.webkitRTCPeerConnection) {
		// Google implementation only for the time being
		this.peerConnection.oniceconnectionstatechange = function(event) {
			that.onRtcPeerConnectionIceChangeEvent(event);
		};
	}

	this.peerConnection.onopen = function(event) {
		that.onRtcPeerConnectionOnOpenEvent(event);
	};

	if (window.webkitRTCPeerConnection) {
		// Google implementation only for the time being
		this.peerConnection.onidentityresult = function(event) {
			that.onRtcPeerConnectionIdentityResultEvent(event);
		};
	}

	/* Obsolete
	 this.peerConnection.onnegotiationneeded= function(event) {
	 that.onRtcPeerConnectionIceNegotiationNeededEvent(event);
	 }*/

	this.peerConnection.ondatachannel = function(event) {
		that.onRtcPeerConnectionOnMessageChannelEvent(event);
	};

	console.debug("WebRTCommCall:createPeerConnection(): this.peerConnection=" + JSON.stringify(this.peerConnection));
};

/**
 * Implementation of the PrivateCallConnector listener interface: process remote SDP offer event
 * @private 
 * @param {string} remoteSdpOffer Remote peer SDP offer
 */
WebRTCommCall.prototype.onPrivateCallConnectorRemoteSdpOfferEvent = function(remoteSdpOffer) {
	console.debug("WebRTCommCall:onPrivateCallConnectorSdpOfferEvent()");
	this.remoteSdpOffer = remoteSdpOffer;
};

/**
 * Implementation of the PrivateCallConnector listener interface: process remote SDP answer event
 * @private 
 * @param {string} remoteSdpAnswer
 * @throw exception internal error
 */
WebRTCommCall.prototype.onPrivateCallConnectorRemoteSdpAnswerEvent = function(remoteSdpAnswer) {
	console.debug("WebRTCommCall:onPrivateCallConnectorRemoteSdpAnswerEvent()");
	try {
		var sdpAnswer = undefined;
		//if (window.webkitRTCPeerConnection) {
		sdpAnswer = new RTCSessionDescription({
			type: 'answer',
			sdp: remoteSdpAnswer
		});
		/*
		} else if (window.mozRTCPeerConnection) {
			sdpAnswer = new mozRTCSessionDescription({
				type: 'answer',
				sdp: remoteSdpAnswer
			});
		}
		*/

		var that = this;
		this.peerConnectionState = 'answer-received';
		this.peerConnection.setRemoteDescription(sdpAnswer, function() {
			that.onRtcPeerConnectionSetRemoteDescriptionSuccessEvent();
		}, function(error) {
			that.onRtcPeerConnectionSetRemoteDescriptionErrorEvent(error);
		});
	} catch (exception) {
		console.error("WebRTCommCall:onPrivateCallConnectorRemoteSdpAnswerEvent(): catched exception:" + exception);
		throw exception;
	}
};

/**
 * Implementation of the PrivateCallConnector listener interface: process call opened event
 * @private 
 */
WebRTCommCall.prototype.onPrivateCallConnectorCallOpenedEvent = function() {
	console.debug("WebRTCommCall:onPrivateCallConnectorCallOpenedEvent()");
	// Notify event to the listener
	if (this.eventListener.onWebRTCommCallOpenEvent) {
		var that = this;
		setTimeout(function() {
			try {
				that.eventListener.onWebRTCommCallOpenEvent(that);
			} catch (exception) {
				console.error("WebRTCommCall:onPrivateCallConnectorCallOpenedEvent(): catched exception in listener:" + exception);
			}
		}, 1);
	}
};

/**
 * Implementation of the PrivateCallConnector listener interface: process call in progress event
 * @private 
 */
WebRTCommCall.prototype.onPrivateCallConnectorCallInProgressEvent = function() {
	console.debug("WebRTCommCall:onPrivateCallConnectorCallInProgressEvent()");
	// Notify event to the listener
	if (this.eventListener.onWebRTCommCallInProgressEvent) {
		var that = this;
		setTimeout(function() {
			try {
				that.eventListener.onWebRTCommCallInProgressEvent(that);
			} catch (exception) {
				console.error("WebRTCommCall:onPrivateCallConnectorCallInProgressEvent(): catched exception in listener:" + exception);
			}
		}, 1);
	}
};

/**
 * Implementation of the PrivateCallConnector listener interface: process call error event
 * @private 
 * @param {string} error call control error
 */
WebRTCommCall.prototype.onPrivateCallConnectorCallOpenErrorEvent = function(error) {
	console.debug("WebRTCommCall:onPrivateCallConnectorCallOpenErrorEvent():error=" + error);
	// Notify event to the listener
	if (this.eventListener.onWebRTCommCallOpenErrorEvent) {
		var that = this;
		setTimeout(function() {
			try {
				that.eventListener.onWebRTCommCallOpenErrorEvent(that, error);
			} catch (exception) {
				console.error("WebRTCommCall:onPrivateCallConnectorCallOpenErrorEvent(): catched exception in listener:" + exception);
			}
		}, 1);
	}
};

/**
 * Implementation of the PrivateCallConnector listener interface: process call ringing event
 * @private 
 * @param {string} callerPhoneNumber  caller contact identifier (e.g. bob@sip.net)
 * @param {string} callerDisplayName  caller contact identifier (e.g. bob@sip.net)
 */
WebRTCommCall.prototype.onPrivateCallConnectorCallRingingEvent = function(callerPhoneNumber, callerDisplayName) {
	console.debug("WebRTCommCall:onPrivateCallConnectorCallRingingEvent():callerPhoneNumber=" + callerPhoneNumber);
	console.debug("WebRTCommCall:onPrivateCallConnectorCallRingingEvent():callerDisplayName=" + callerDisplayName);
	// Notify the closed event to the listener
	this.callerPhoneNumber = callerPhoneNumber;
	this.callerDisplayName = callerDisplayName;
	if (this.eventListener.onWebRTCommCallRingingEvent) {
		var that = this;
		setTimeout(function() {
			try {
				that.eventListener.onWebRTCommCallRingingEvent(that);
			} catch (exception) {
				console.error("WebRTCommCall:onPrivateCallConnectorCallRingingEvent(): catched exception in listener:" + exception);
			}
		}, 1);
	}
};

/**
 * Implementation of the PrivateCallConnector listener interface: process call ringing back event
 * @private 
 */
WebRTCommCall.prototype.onPrivateCallConnectorCallRingingBackEvent = function() {
	console.debug("WebRTCommCall:onPrivateCallConnectorCallRingingBackEvent()");
	// Notify the closed event to the listener
	if (this.eventListener.onWebRTCommCallRingingBackEvent) {
		var that = this;
		setTimeout(function() {
			try {
				that.eventListener.onWebRTCommCallRingingBackEvent(that);
			} catch (exception) {
				console.error("WebRTCommCall:onPrivateCallConnectorCallRingingBackEvent(): catched exception in listener:" + exception);
			}
		}, 1);
	}
};


/**
 * Implementation of the PrivateCallConnector listener interface: process call closed event 
 * @private 
 */
WebRTCommCall.prototype.onPrivateCallConnectorCallClosedEvent = function() {
	console.debug("WebRTCommCall:onPrivateCallConnectorCallClosedEvent()");
	this.connector = undefined;
	// Force communication close 
	try {
		this.close(true);
	} catch (exception) {}
};


/**
 * Implementation of the PrivateCallConnector listener interface: process call hangup event  
 * @private 
 */
WebRTCommCall.prototype.onPrivateCallConnectorCallHangupEvent = function() {
	console.debug("WebRTCommCall:onPrivateCallConnectorCallHangupEvent()");
	// Notify the closed event to the listener
	if (this.eventListener.onWebRTCommCallHangupEvent) {
		var that = this;
		setTimeout(function() {
			try {
				that.eventListener.onWebRTCommCallHangupEvent(that);
			} catch (exception) {
				console.error("WebRTCommCall:onPrivateCallConnectorCallHangupEvent(): catched exception in listener:" + exception);
			}
		}, 1);
	}
};

/**
 * Implementation of the PrivateCallConnector listener interface: process incoming call cancel event  
 * @private 
 */
WebRTCommCall.prototype.onPrivateCallConnectorCallCanceledEvent = function() {
	console.debug("WebRTCommCall:onPrivateCallConnectorCallCanceledEvent()");
	// Notify the canceled event to the listener
	if (this.eventListener.onWebRTCommCallCanceledEvent) {
		var that = this;
		setTimeout(function() {
			try {
				that.eventListener.onWebRTCommCallCanceledEvent(that);
			} catch (exception) {
				console.error("WebRTCommCall:onPrivateCallConnectorCallCanceledEvent(): catched exception in listener:" + exception);
			}
		}, 1);
	}
};

/**
 * Implementation of the RTCPeerConnection listener interface: process RTCPeerConnection error event
 * @private 
 * @param {string} error internal error
 */
WebRTCommCall.prototype.onRtcPeerConnectionErrorEvent = function(error) {
	console.debug("WebRTCommCall:onRtcPeerConnectionErrorEvent(): error=" + error);
	// Critical issue, notify the error and close properly the call
	// Notify the error event to the listener
	if (this.eventListener.onWebRTCommCallOpenErrorEvent) {
		var that = this;
		setTimeout(function() {
			try {
				that.eventListener.onWebRTCommCallOpenErrorEvent(that, error);
			} catch (exception) {
				console.error("WebRTCommCall:onRtcPeerConnectionErrorEvent(): catched exception in listener:" + exception);
			}
		}, 1);
	}

	try {
		this.close(true);
	} catch (exception) {}
};


/**
 * Implementation of the RTCPeerConnection listener interface: handle RTCPeerConnection state machine
 * @private
 * @param {MediaStreamEvent} event  RTCPeerConnection Event
 */
WebRTCommCall.prototype.onRtcPeerConnectionOnAddStreamEvent = function(event) {
	try {
		console.debug("WebRTCommCall:onRtcPeerConnectionOnAddStreamEvent(): event=" + event);
		console.debug("WebRTCommCall:onRtcPeerConnectionOnAddStreamEvent(): event.type=" + event.type);
		if (this.peerConnection) {
			console.debug("WebRTCommCall:onRtcPeerConnectionOnAddStreamEvent(): this.peerConnection.signalingState=" + this.peerConnection.signalingState);
			console.debug("WebRTCommCall:onRtcPeerConnectionOnAddStreamEvent(): this.peerConnection.iceGatheringState=" + this.peerConnection.iceGatheringState);
			console.debug("WebRTCommCall:onRtcPeerConnectionOnAddStreamEvent(): this.peerConnection.iceConnectionState=" + this.peerConnection.iceConnectionState);
			console.debug("WebRTCommCall:onRtcPeerConnectionOnAddStreamEvent(): this.peerConnectionState=" + this.peerConnectionState);
			this.remoteBundledAudioVideoMediaStream = event.stream;
			// https://code.google.com/p/webrtcomm/issues/detail?id=22 Make sure to call WebRTCommCall on add stream event
			if (this.eventListener.onWebRTCommCallOpenedEvent) {
				var that = this;
				setTimeout(function() {
					try {
						console.debug("WebRTCommCall:calling onWebRTCommCallOpenedEvent(): event=" + event);
						that.eventListener.onWebRTCommCallOpenedEvent(that);
						console.debug("WebRTCommCall:onRtcPeerConnectionOnAddStreamEvent(): creating DTMF Sender");
						if (that.peerConnection.createDTMFSender) {
							if (that.configuration.localMediaStream !== null) {
								var localAudioTrack = that.configuration.localMediaStream.getAudioTracks()[0];
								that.dtmfSender = that.peerConnection.createDTMFSender(localAudioTrack);
								//that.dtmfSender.ontonechange = dtmfOnToneChange;
								console.debug('Created DTMFSender');
							} else {
								console.debug('No local stream to create DTMF Sender');
							}
						} else {
							console.warn('RTCPeerConnection method createDTMFSender() is not support by this browser.');
						}
					} catch (exception) {
						console.error("WebRTCommCall:onRtcPeerConnectionOnAddStreamEvent(): catched exception in listener:" + exception);
					}
				}, 1);
			}
		} else {
			console.warn("WebRTCommCall:onRtcPeerConnectionOnAddStreamEvent(): event ignored");
		}
	} catch (exception) {
		console.error("WebRTCommCall:onRtcPeerConnectionOnAddStreamEvent(): catched exception, exception:" + exception);
		this.onRtcPeerConnectionErrorEvent();
	}
};

/**
 * Implementation of the RTCPeerConnection listener interface: handle RTCPeerConnection state machine
 * @private
 * @param {MediaStreamEvent} event  RTCPeerConnection Event
 */
WebRTCommCall.prototype.onRtcPeerConnectionOnRemoveStreamEvent = function(event) {
	try {
		console.debug("WebRTCommCall:onRtcPeerConnectionOnRemoveStreamEvent(): event=" + event);
		if (this.peerConnection) {
			console.debug("WebRTCommCall:onRtcPeerConnectionOnRemoveStreamEvent(): this.peerConnection.signalingState=" + this.peerConnection.signalingState);
			console.debug("WebRTCommCall:onRtcPeerConnectionOnRemoveStreamEvent(): this.peerConnection.iceGatheringState=" + this.peerConnection.iceGatheringState);
			console.debug("WebRTCommCall:onRtcPeerConnectionOnRemoveStreamEvent(): this.peerConnection.iceConnectionState=" + this.peerConnection.iceConnectionState);
			console.debug("WebRTCommCall:onRtcPeerConnectionOnRemoveStreamEvent(): this.peerConnectionState=" + this.peerConnectionState);
			this.remoteBundledAudioVideoMediaStream = undefined;
		} else {
			console.warn("WebRTCommCall:onRtcPeerConnectionOnRemoveStreamEvent(): event ignored");
		}
	} catch (exception) {
		console.error("WebRTCommCall:onRtcPeerConnectionOnRemoveStreamEvent(): catched exception, exception:" + exception);
		this.onRtcPeerConnectionErrorEvent();
	}
};

/**
 * Implementation of the RTCPeerConnection listener interface: handle RTCPeerConnection state machine
 * @private
 * @param {RTCPeerConnectionIceEvent} rtcIceCandidateEvent  RTCPeerConnection Event
 */
WebRTCommCall.prototype.onRtcPeerConnectionIceCandidateEvent = function(rtcIceCandidateEvent) {
	try {
		console.debug("WebRTCommCall:onRtcPeerConnectionIceCandidateEvent(): rtcIceCandidateEvent=" + JSON.stringify(rtcIceCandidateEvent.candidate));
		if (this.peerConnection) {
			console.debug("WebRTCommCall:onRtcPeerConnectionIceCandidateEvent(): this.peerConnection.signalingState=" + this.peerConnection.signalingState);
			console.debug("WebRTCommCall:onRtcPeerConnectionIceCandidateEvent(): this.peerConnection.iceGatheringState=" + this.peerConnection.iceGatheringState);
			console.debug("WebRTCommCall:onRtcPeerConnectionIceCandidateEvent(): this.peerConnection.iceConnectionState=" + this.peerConnection.iceConnectionState);
			console.debug("WebRTCommCall:onRtcPeerConnectionIceCandidateEvent(): this.peerConnectionState=" + this.peerConnectionState);
			if (this.peerConnection.signalingState !== 'closed') {
				if (this.peerConnection.iceGatheringState === 'complete') {
					if (this.peerConnectionState === 'preparing-offer') {
						var sdpOfferString = this.peerConnection.localDescription.sdp;
						var parsedSdpOffer = this.setRtcPeerConnectionLocalDescription(this.peerConnection.localDescription);

						// Apply modified SDP Offer
						this.connector.invite(parsedSdpOffer);
						this.peerConnectionState = 'offer-sent';
					} else if (this.peerConnectionState === 'preparing-answer') {
						var sdpAnswerString = this.peerConnection.localDescription.sdp;
						var parsedSdpAnswer = this.setRtcPeerConnectionLocalDescription(this.peerConnection.localDescription);

						this.connector.accept(parsedSdpAnswer);
						this.peerConnectionState = 'established';
						// Notify opened event to listener
						if (this.eventListener.onWebRTCommCallOpenedEvent) {
							var that = this;
							setTimeout(function() {
								try {
									that.eventListener.onWebRTCommCallOpenedEvent(that);
								} catch (exception) {
									console.error("WebRTCommCall:onRtcPeerConnectionIceCandidateEvent(): catched exception in listener:" + exception);
								}
							}, 1);
						}
					} else if (this.peerConnectionState === 'established') {
						// Why this last ice candidate event?
					} else {
						console.error("WebRTCommCall:onRtcPeerConnectionIceCandidateEvent(): RTCPeerConnection bad state!" + this.peerConnectionState);
					}
				}
			} else {
				console.error("WebRTCommCall:onRtcPeerConnectionIceCandidateEvent(): RTCPeerConnection closed!");
			}
		} else {
			console.warn("WebRTCommCall:onRtcPeerConnectionIceCandidateEvent(): event ignored");
		}
	} catch (exception) {
		console.error("WebRTCommCall:onRtcPeerConnectionIceCandidateEvent(): catched exception, exception:" + exception);
		this.onRtcPeerConnectionErrorEvent(exception);
	}
};

/**
 * Implementation of the RTCPeerConnection listener interface: handle RTCPeerConnection state machine
 * @private
 * @param {RTCSessionDescription} sdpOffer  RTCPeerConnection SDP offer event
 */
WebRTCommCall.prototype.onRtcPeerConnectionCreateOfferSuccessEvent = function(sdpOffer) {
	try {
		console.debug("WebRTCommCall:onRtcPeerConnectionCreateOfferSuccessEvent(): sdpOffer=" + JSON.stringify(sdpOffer));
		if (this.peerConnection) {
			console.debug("WebRTCommCall:onRtcPeerConnectionCreateOfferSuccessEvent(): this.peerConnection.signalingState=" + this.peerConnection.signalingState);
			console.debug("WebRTCommCall:onRtcPeerConnectionCreateOfferSuccessEvent(): this.peerConnection.iceGatheringState=" + this.peerConnection.iceGatheringState);
			console.debug("WebRTCommCall:onRtcPeerConnectionCreateOfferSuccessEvent(): this.peerConnection.iceConnectionState=" + this.peerConnection.iceConnectionState);
			console.debug("WebRTCommCall:onRtcPeerConnectionCreateOfferSuccessEvent(): this.peerConnectionState=" + this.peerConnectionState);

			if (this.peerConnectionState === 'new') {
				// Preparing offer.
				var that = this;
				this.peerConnectionState = 'preparing-offer';
				if (window.webkitRTCPeerConnection) {
					this.setRtcPeerConnectionLocalDescription(sdpOffer);
				}

				this.peerConnection.setLocalDescription(sdpOffer, function() {
					that.onRtcPeerConnectionSetLocalDescriptionSuccessEvent();
				}, function(error) {
					that.onRtcPeerConnectionSetLocalDescriptionErrorEvent(error);
				});
			} else {
				console.error("WebRTCommCall:onRtcPeerConnectionCreateOfferSuccessEvent(): RTCPeerConnection bad state!");
			}
		} else {
			console.warn("WebRTCommCall:onRtcPeerConnectionCreateOfferSuccessEvent(): event ignored");
		}
	} catch (exception) {
		console.error("WebRTCommCall:onRtcPeerConnectionCreateOfferSuccessEvent(): catched exception, exception:" + exception);
		this.onRtcPeerConnectionErrorEvent();
	}
};

WebRTCommCall.prototype.setRtcPeerConnectionLocalDescription = function(sdpOffer) {
	var sdpOfferString = sdpOffer.sdp;
	var sdpParser = new SDPParser();
	var parsedSdpOffer = sdpParser.parse(sdpOfferString);

	// Check if offer is ok with the requested media constraints
	if (window.webkitRTCPeerConnection) {
		if (this.configuration.videoMediaFlag === false) {
			this.removeMediaDescription(parsedSdpOffer, "video");
		}

		if (this.configuration.audioMediaFlag === false) {
			this.removeMediaDescription(parsedSdpOffer, "audio");
		}
	}

	if (this.configuration.audioCodecsFilter || this.configuration.videoCodecsFilter || this.configuration.opusFmtpCodecsParameters) {
		try {
			// Apply audio/video codecs filter to RTCPeerConnection SDP offer to
			this.applyConfiguredCodecFilterOnSessionDescription(parsedSdpOffer);
		} catch (exception) {
			console.error("WebRTCommCall:onRtcPeerConnectionCreateOfferSuccessEvent(): configured codec filtering has failded, use inital RTCPeerConnection SDP offer");
		}
	}

	// Check if offer is ok with the requested RTCPeerConnection constraints
	if (this.webRTCommClient.configuration.RTCPeerConnection.forceTurnMediaRelay === true) {
		this.forceTurnMediaRelay(parsedSdpOffer);
	}
	// Allow patching of chrome ice-options for interconnect with Mobicents Media Server, commented for now but to be made configurable
	// this.patchChromeIce(parsedSdpOffer, "ice-options");
	console.debug("WebRTCommCall:onRtcPeerConnectionCreateOfferSuccessEvent(): parsedSdpOffer=" + parsedSdpOffer);

	// Apply modified SDP Offer
	sdpOffer.sdp = parsedSdpOffer;
	this.peerConnectionLocalDescription = sdpOffer;

	return parsedSdpOffer;
}

/**
 * Implementation of the RTCPeerConnection listener interface: handle RTCPeerConnection state machine
 * @private
 * @param {object} error  RTCPeerConnection SDP offer error event
 */
WebRTCommCall.prototype.onRtcPeerConnectionCreateOfferErrorEvent = function(error) {
	try {
		console.error("WebRTCommCall:onRtcPeerConnectionCreateOfferErrorEvent():error=" + JSON.stringify(error));
		if (this.peerConnection) {
			console.debug("WebRTCommCall:onRtcPeerConnectionCreateOfferErrorEvent(): this.peerConnection.signalingState=" + this.peerConnection.signalingState);
			console.debug("WebRTCommCall:onRtcPeerConnectionCreateOfferErrorEvent(): this.peerConnection.iceGatheringState=" + this.peerConnection.iceGatheringState);
			console.debug("WebRTCommCall:onRtcPeerConnectionCreateOfferErrorEvent(): this.peerConnection.iceConnectionState=" + this.peerConnection.iceConnectionState);
			console.debug("WebRTCommCall:onRtcPeerConnectionCreateOfferErrorEvent(): this.peerConnectionState=" + this.peerConnectionState);
			throw "WebRTCommCall:onRtcPeerConnectionCreateOfferErrorEvent():error=" + error;
		} else {
			console.warn("WebRTCommCall:onRtcPeerConnectionCreateOfferErrorEvent(): event ignored");
		}
	} catch (exception) {
		console.error("WebRTCommCall:onRtcPeerConnectionCreateOfferErrorEvent(): catched exception, exception:" + exception);
		this.onRtcPeerConnectionErrorEvent();
	}
};

/**
 * Implementation of the RTCPeerConnection listener interface: handle RTCPeerConnection state machine
 * @private
 */
WebRTCommCall.prototype.onRtcPeerConnectionSetLocalDescriptionSuccessEvent = function() {
	try {
		console.debug("WebRTCommCall:onRtcPeerConnectionSetLocalDescriptionSuccessEvent():" + JSON.stringify(this.peerConnection));
		if (this.peerConnection) {
			console.debug("WebRTCommCall:onRtcPeerConnectionSetLocalDescriptionSuccessEvent(): this.peerConnection.signalingState=" + this.peerConnection.signalingState);
			console.debug("WebRTCommCall:onRtcPeerConnectionSetLocalDescriptionSuccessEvent(): this.peerConnection.iceGatheringState=" + this.peerConnection.iceGatheringState);
			console.debug("WebRTCommCall:onRtcPeerConnectionSetLocalDescriptionSuccessEvent(): this.peerConnection.iceConnectionState=" + this.peerConnection.iceConnectionState);
			console.debug("WebRTCommCall:onRtcPeerConnectionSetLocalDescriptionSuccessEvent(): this.peerConnectionState=" + this.peerConnectionState);
		} else {
			console.warn("WebRTCommCall:onRtcPeerConnectionSetLocalDescriptionSuccessEvent(): event ignored");
		}
	} catch (exception) {
		console.error("WebRTCommCall:onRtcPeerConnectionSetLocalDescriptionSuccessEvent(): catched exception, exception:" + exception);
		this.onRtcPeerConnectionErrorEvent();
	}
};

/**
 * Implementation of the RTCPeerConnection listener interface: handle RTCPeerConnection state machine
 * @private
 * @param {object} error  RTCPeerConnection SDP offer error event
 */
WebRTCommCall.prototype.onRtcPeerConnectionSetLocalDescriptionErrorEvent = function(error) {
	try {
		console.error("WebRTCommCall:onRtcPeerConnectionSetLocalDescriptionErrorEvent():error=" + JSON.stringify(error));
		if (this.peerConnection) {
			console.debug("WebRTCommCall:onRtcPeerConnectionSetLocalDescriptionErrorEvent(): this.peerConnection.signalingState=" + this.peerConnection.signalingState);
			console.debug("WebRTCommCall:onRtcPeerConnectionSetLocalDescriptionErrorEvent(): this.peerConnection.iceGatheringState=" + this.peerConnection.iceGatheringState);
			console.debug("WebRTCommCall:onRtcPeerConnectionSetLocalDescriptionErrorEvent(): this.peerConnection.iceConnectionState=" + this.peerConnection.iceConnectionState);
			console.debug("WebRTCommCall:onRtcPeerConnectionSetLocalDescriptionErrorEvent(): this.peerConnectionState=" + this.peerConnectionState);
			throw "WebRTCommCall:onRtcPeerConnectionSetLocalDescriptionErrorEvent():error=" + error;
		} else {
			console.warn("WebRTCommCall:onRtcPeerConnectionSetLocalDescriptionErrorEvent(): event ignored");
		}
	} catch (exception) {
		console.error("WebRTCommCall:onRtcPeerConnectionSetLocalDescriptionErrorEvent(): catched exception, exception:" + exception);
		this.onRtcPeerConnectionErrorEvent();
	}
};

/**
 * Implementation of the RTCPeerConnection listener interface: handle RTCPeerConnection state machine
 * @private
 * @param {RTCSessionDescription} answer  RTCPeerConnection SDP answer event
 */
WebRTCommCall.prototype.onRtcPeerConnectionCreateAnswerSuccessEvent = function(sdpAnswser) {
	try {
		console.debug("WebRTCommCall:onRtcPeerConnectionCreateAnswerSuccessEvent():answer=" + JSON.stringify(sdpAnswser));
		if (this.peerConnection) {
			console.debug("WebRTCommCall:onRtcPeerConnectionCreateAnswerSuccessEvent(): this.peerConnection.signalingState=" + this.peerConnection.signalingState);
			console.debug("WebRTCommCall:onRtcPeerConnectionCreateAnswerSuccessEvent(): this.peerConnection.iceGatheringState=" + this.peerConnection.iceGatheringState);
			console.debug("WebRTCommCall:onRtcPeerConnectionCreateAnswerSuccessEvent(): this.peerConnection.iceConnectionState=" + this.peerConnection.iceConnectionState);
			console.debug("WebRTCommCall:onRtcPeerConnectionCreateAnswerSuccessEvent(): this.peerConnectionState=" + this.peerConnectionState);

			if (this.peerConnectionState === 'offer-received') {
				// Prepare answer.
				var that = this;
				this.peerConnectionState = 'preparing-answer';
				var sdpAnswerString = sdpAnswser.sdp;
				var sdpParser = new SDPParser();
				var parsedSdpAnswer = sdpParser.parse(sdpAnswerString);

				// Check if offer is ok with the requested media constraints
				// Can not remove/add SDP m lines

				if (this.configuration.audioCodecsFilter || this.configuration.videoCodecsFilter || this.configuration.opusFmtpCodecsParameters) {
					try {
						// Apply audio/video codecs filter to RTCPeerConnection SDP offer to
						this.applyConfiguredCodecFilterOnSessionDescription(parsedSdpAnswer);
					} catch (exception) {
						console.error("WebRTCommCall:onRtcPeerConnectionCreateAnswerSuccessEvent(): configured codec filtering has failded, use inital RTCPeerConnection SDP offer");
					}
				}
				// Allow patching of chrome ice-options for interconnect with Mobicents Media Server, commented for now but to be made configurable
				// this.patchChromeIce(parsedSdpOffer, "ice-options");

				sdpAnswser.sdp = parsedSdpAnswer;
				this.peerConnectionLocalDescription = parsedSdpAnswer;
				this.peerConnection.setLocalDescription(sdpAnswser, function() {
					that.onRtcPeerConnectionSetLocalDescriptionSuccessEvent();
				}, function(error) {
					that.onRtcPeerConnectionSetLocalDescriptionErrorEvent(error);
				});
			} else {
				console.error("WebRTCommCall:onRtcPeerConnectionCreateAnswerSuccessEvent(): RTCPeerConnection bad state!");
			}
		} else {
			console.warn("WebRTCommCall:onRtcPeerConnectionCreateAnswerSuccessEvent(): event ignored");
		}
	} catch (exception) {
		console.error("WebRTCommCall:onRtcPeerConnectionCreateAnswerSuccessEvent(): catched exception, exception:" + exception);
		this.onRtcPeerConnectionErrorEvent();
	}
};

/**
 * Implementation of the RTCPeerConnection listener interface: handle RTCPeerConnection state machine
 * @private
 * @param {String} error  SDP error
 */
WebRTCommCall.prototype.onRtcPeerConnectionCreateAnswerErrorEvent = function(error) {
	console.error("WebRTCommCall:onRtcPeerConnectionCreateAnswerErrorEvent():error=" + JSON.stringify(error));
	try {
		if (this.peerConnection) {
			console.debug("WebRTCommCall:onRtcPeerConnectionCreateAnswerErrorEvent(): this.peerConnection.signalingState=" + this.peerConnection.signalingState);
			console.debug("WebRTCommCall:onRtcPeerConnectionCreateAnswerErrorEvent(): this.peerConnection.iceGatheringState=" + this.peerConnection.iceGatheringState);
			console.debug("WebRTCommCall:onRtcPeerConnectionCreateAnswerErrorEvent(): this.peerConnection.iceConnectionState=" + this.peerConnection.iceConnectionState);
			console.debug("WebRTCommCall:onRtcPeerConnectionCreateAnswerErrorEvent(): this.peerConnectionState=" + this.peerConnectionState);
		} else {
			console.warn("WebRTCommCall:onRtcPeerConnectionCreateAnswerErrorEvent(): event ignored");
		}
	} catch (exception) {
		console.error("WebRTCommCall:onRtcPeerConnectionCreateAnswerErrorEvent(): catched exception, exception:" + exception);
		this.onRtcPeerConnectionErrorEvent();
	}
};

/**
 * RTCPeerConnection listener implementation
 * @private
 */
WebRTCommCall.prototype.onRtcPeerConnectionSetRemoteDescriptionSuccessEvent = function() {
	try {
		console.debug("WebRTCommCall:onRtcPeerConnectionSetRemoteDescriptionSuccessEvent()");
		if (this.peerConnection) {
			console.debug("WebRTCommCall:onRtcPeerConnectionSetRemoteDescriptionSuccessEvent(): this.peerConnection.signalingState=" + this.peerConnection.signalingState);
			console.debug("WebRTCommCall:onRtcPeerConnectionSetRemoteDescriptionSuccessEvent(): this.peerConnection.iceGatheringState=" + this.peerConnection.iceGatheringState);
			console.debug("WebRTCommCall:onRtcPeerConnectionSetRemoteDescriptionSuccessEvent(): this.peerConnection.iceConnectionState=" + this.peerConnection.iceConnectionState);
			console.debug("WebRTCommCall:onRtcPeerConnectionSetRemoteDescriptionSuccessEvent(): this.peerConnectionState=" + this.peerConnectionState);

			if (this.peerConnectionState === 'answer-received') {
				this.peerConnectionState = 'established';
				console.debug("WebRTCommCall:onRtcPeerConnectionSetRemoteDescriptionSuccessEvent(): this.peerConnectionState=" + this.peerConnectionState);
				// Notify closed event to listener
				if (this.eventListener.onWebRTCommCallOpenedEvent) {
					var that = this;
					setTimeout(function() {
						try {
							that.eventListener.onWebRTCommCallOpenedEvent(that);
						} catch (exception) {
							console.error("WebRTCommCall:onRtcPeerConnectionSetRemoteDescriptionSuccessEvent(): catched exception in listener:" + exception);
						}
					}, 1);
				}
			} else if (this.peerConnectionState === 'offer-received') {
				var that = this;
				if (window.webkitRTCPeerConnection) {
					var sdpConstraints = {
						mandatory: {
							OfferToReceiveAudio: this.configuration.audioMediaFlag,
							OfferToReceiveVideo: this.configuration.videoMediaFlag
						},
						optional: []
					};
					console.debug("WebRTCommCall:onRtcPeerConnectionSetRemoteDescriptionSuccessEvent():sdpConstraints=" + JSON.stringify(sdpConstraints));
					this.peerConnection.createAnswer(function(answer) {
						that.onRtcPeerConnectionCreateAnswerSuccessEvent(answer);
					}, function(error) {
						that.onRtcPeerConnectionCreateAnswerErrorEvent(error);
					}, sdpConstraints);
				} else if (window.mozRTCPeerConnection) {
					var sdpConstraints = {
						offerToReceiveAudio: this.configuration.audioMediaFlag,
						offerToReceiveVideo: this.configuration.videoMediaFlag,
						mozDontOfferDataChannel: !this.configuration.messageMediaFlag
					};
					console.debug("WebRTCommCall:onRtcPeerConnectionSetRemoteDescriptionSuccessEvent():sdpConstraints=" + JSON.stringify(sdpConstraints));
					this.peerConnection.createAnswer(function(answer) {
						that.onRtcPeerConnectionCreateAnswerSuccessEvent(answer);
					}, function(error) {
						that.onRtcPeerConnectionCreateAnswerErrorEvent(error);
					}, sdpConstraints);
				}
			} else {
				console.error("WebRTCommCall:onRtcPeerConnectionSetRemoteDescriptionSuccessEvent(): RTCPeerConnection bad state!");
			}
		} else {
			console.warn("WebRTCommCall:onRtcPeerConnectionSetRemoteDescriptionSuccessEvent(): event ignored");
		}
	} catch (exception) {
		console.error("WebRTCommCall:onRtcPeerConnectionSetRemoteDescriptionSuccessEvent(): catched exception, exception:" + exception);
		this.onRtcPeerConnectionErrorEvent();
	}
};

/**
 * RTCPeerConnection listener implementation
 * @private
 * @param {String} error  SDP error
 */
WebRTCommCall.prototype.onRtcPeerConnectionSetRemoteDescriptionErrorEvent = function(error) {
	try {
		console.error("WebRTCommCall:onRtcPeerConnectionSetRemoteDescriptionErrorEvent():error=" + JSON.stringify(error));
		if (this.peerConnection) {
			console.debug("WebRTCommCall:onRtcPeerConnectionSetRemoteDescriptionErrorEvent(): this.peerConnection.signalingState=" + this.peerConnection.signalingState);
			console.debug("WebRTCommCall:onRtcPeerConnectionSetRemoteDescriptionErrorEvent(): this.peerConnection.iceGatheringState=" + this.peerConnection.iceGatheringState);
			console.debug("WebRTCommCall:onRtcPeerConnectionSetRemoteDescriptionErrorEvent(): this.peerConnection.iceConnectionState=" + this.peerConnection.iceConnectionState);
			console.debug("WebRTCommCall:onRtcPeerConnectionSetRemoteDescriptionErrorEvent(): this.peerConnectionState=" + this.peerConnectionState);
			throw "WebRTCommCall:onRtcPeerConnectionSetRemoteDescriptionErrorEvent():error=" + error;
		} else {
			console.warn("WebRTCommCall:onRtcPeerConnectionSetRemoteDescriptionErrorEvent(): event ignored");
		}
	} catch (exception) {
		this.onRtcPeerConnectionErrorEvent(error);
	}
};

/**
 * RTCPeerConnection listener implementation
 * @private
 * @param {Event} event  RTCPeerConnection open event
 */
WebRTCommCall.prototype.onRtcPeerConnectionOnOpenEvent = function(event) {
	console.debug("WebRTCommCall:onRtcPeerConnectionOnOpenEvent(): event=" + event);
	if (this.peerConnection) {
		console.debug("WebRTCommCall:onRtcPeerConnectionOnOpenEvent(): this.peerConnection.signalingState=" + this.peerConnection.signalingState);
		console.debug("WebRTCommCall:onRtcPeerConnectionOnOpenEvent(): this.peerConnection.signalingState=" + this.peerConnection.signalingState);
		console.debug("WebRTCommCall:onRtcPeerConnectionOnOpenEvent(): this.peerConnection.iceGatheringState=" + this.peerConnection.iceGatheringState);
		console.debug("WebRTCommCall:onRtcPeerConnectionOnOpenEvent(): this.peerConnection.iceConnectionState=" + this.peerConnection.iceConnectionState);
		console.debug("WebRTCommCall:onRtcPeerConnectionOnOpenEvent(): this.peerConnectionState=" + this.peerConnectionState);
	} else {
		console.warn("WebRTCommCall:onRtcPeerConnectionOnOpenEvent(): event ignored");
	}
};

/**
 * RTCPeerConnection listener implementation
 * @private
 * @param {Event} event  RTCPeerConnection open event
 */
WebRTCommCall.prototype.onRtcPeerConnectionStateChangeEvent = function(event) {
	console.debug("WebRTCommCall:onRtcPeerConnectionStateChangeEvent(): event=" + event);
	if (this.peerConnection) {
		console.debug("WebRTCommCall:onRtcPeerConnectionStateChangeEvent(): this.peerConnection.signalingState=" + this.peerConnection.signalingState);
		console.debug("WebRTCommCall:onRtcPeerConnectionStateChangeEvent(): this.peerConnection.iceGatheringState=" + this.peerConnection.iceGatheringState);
		console.debug("WebRTCommCall:onRtcPeerConnectionStateChangeEvent(): this.peerConnection.iceConnectionState=" + this.peerConnection.iceConnectionState);
		console.debug("WebRTCommCall:onRtcPeerConnectionStateChangeEvent(): this.peerConnectionState=" + this.peerConnectionState);
		if (this.peerConnection && this.peerConnection.signalingState === 'closed')
			this.peerConnection = null;
	} else {
		console.warn("WebRTCommCall:onRtcPeerConnectionStateChangeEvent(): event ignored");
	}
};

/**
 * RTCPeerConnection listener implementation
 * @private
 * @param {Event} event  RTCPeerConnection ICE negociation Needed event
 */
WebRTCommCall.prototype.onRtcPeerConnectionIceNegotiationNeededEvent = function(event) {
	console.debug("WebRTCommCall:onRtcPeerConnectionIceNegotiationNeededEvent():event=" + event);
	if (this.peerConnection) {
		console.debug("WebRTCommCall:onRtcPeerConnectionIceNegotiationNeededEvent(): this.peerConnection.signalingState=" + this.peerConnection.signalingState);
		console.debug("WebRTCommCall:onRtcPeerConnectionIceNegotiationNeededEvent(): this.peerConnection.iceGatheringState=" + this.peerConnection.iceGatheringState);
		console.debug("WebRTCommCall:onRtcPeerConnectionIceNegotiationNeededEvent(): this.peerConnection.iceConnectionState=" + this.peerConnection.iceConnectionState);
		console.debug("WebRTCommCall:onRtcPeerConnectionIceNegotiationNeededEvent(): this.peerConnectionState=" + this.peerConnectionState);
	} else {
		console.warn("WebRTCommCall:onRtcPeerConnectionIceNegotiationNeededEvent(): event ignored");
	}
};

/**
 * RTCPeerConnection listener implementation
 * @private
 * @param {Event} event  RTCPeerConnection ICE change event
 */
WebRTCommCall.prototype.onRtcPeerConnectionGatheringChangeEvent = function(event) {
	console.debug("WebRTCommCall:onRtcPeerConnectionGatheringChangeEvent():event=" + event);
	if (this.peerConnection) {
		console.debug("WebRTCommCall:onRtcPeerConnectionGatheringChangeEvent(): this.peerConnection.signalingState=" + this.peerConnection.signalingState);
		console.debug("WebRTCommCall:onRtcPeerConnectionGatheringChangeEvent(): this.peerConnection.iceGatheringState=" + this.peerConnection.iceGatheringState);
		console.debug("WebRTCommCall:onRtcPeerConnectionGatheringChangeEvent(): this.peerConnection.iceConnectionState=" + this.peerConnection.iceConnectionState);
		console.debug("WebRTCommCall:onRtcPeerConnectionGatheringChangeEvent(): this.peerConnectionState=" + this.peerConnectionState);

		if (this.peerConnection.signalingState !== 'closed') {
			if (this.peerConnection.iceGatheringState === "complete") {
				if (this.peerConnectionState === 'preparing-offer') {
					var sdpOfferString = this.peerConnection.localDescription.sdp;
					var parsedSdpOffer = this.setRtcPeerConnectionLocalDescription(this.peerConnection.localDescription);

					// Apply modified SDP Offer
					this.connector.invite(parsedSdpOffer);
					this.peerConnectionState = 'offer-sent';
				} else if (this.peerConnectionState === 'preparing-answer') {
					var sdpAnswerString = this.peerConnection.localDescription.sdp;
					var parsedSdpAnswer = this.setRtcPeerConnectionLocalDescription(this.peerConnection.localDescription);

					this.connector.accept(parsedSdpAnswer);
					this.peerConnectionState = 'established';
					// Notify opened event to listener
					if (this.eventListener.onWebRTCommCallOpenedEvent) {
						var that = this;
						setTimeout(function() {
							try {
								that.eventListener.onWebRTCommCallOpenedEvent(that);
							} catch (exception) {
								console.error("WebRTCommCall:onRtcPeerConnectionGatheringChangeEvent(): catched exception in listener:" + exception);
							}
						}, 1);
					}
				} else if (this.peerConnectionState === 'established') {
					// Why this last ice candidate event?
				} else {
					console.error("WebRTCommCall:onRtcPeerConnectionGatheringChangeEvent(): RTCPeerConnection bad state!");
				}
			}
		} else {
			console.error("WebRTCommCall:onRtcPeerConnectionGatheringChangeEvent(): RTCPeerConnection closed!");
		}
	} else {
		console.warn("WebRTCommCall:onRtcPeerConnectionGatheringChangeEvent(): event ignored");
	}
};

/**
 * RTCPeerConnection listener implementation
 * @private
 * @param {Event} event  RTCPeerConnection open event
 */
WebRTCommCall.prototype.onRtcPeerConnectionIceChangeEvent = function(event) {
	console.debug("WebRTCommCall:onRtcPeerConnectionIceChangeEvent():event=" + event);
	if (this.peerConnection) {
		console.debug("WebRTCommCall:onRtcPeerConnectionIceChangeEvent(): this.peerConnection.signalingState=" + this.peerConnection.signalingState);
		console.debug("WebRTCommCall:onRtcPeerConnectionIceChangeEvent(): this.peerConnection.iceGatheringState=" + this.peerConnection.iceGatheringState);
		console.debug("WebRTCommCall:onRtcPeerConnectionIceChangeEvent(): this.peerConnection.iceConnectionState=" + this.peerConnection.iceConnectionState);
		console.debug("WebRTCommCall:onRtcPeerConnectionIceChangeEvent(): this.peerConnectionState=" + this.peerConnectionState);
		if (this.peerConnection.iceConnectionState == 'failed') {
			error = 'Media path is lost due to connectivity issues; call has been hung up';
			console.error("WebRTCommCall:onRtcPeerConnectionIceChangeEvent(): " + error);

			// Error, notify the error and close properly the call
			// Notify the error event to the listener
			if (this.eventListener.onWebRTCommCallErrorEvent) {
				var that = this;
				setTimeout(function() {
					try {
						that.eventListener.onWebRTCommCallErrorEvent(that, error);
					} catch (exception) {
						console.error("WebRTCommCall:onRtcPeerConnectionErrorEvent(): catched exception in listener:" + exception);
					}
				}, 1);
			}

			// close the call since media has failed
			try {
				this.close(true);
			} catch (exception) {
				console.error("WebRTCommCall:onRtcPeerConnectionErrorEvent(): catched exception in listener:" + exception);
			}
		}
	} else {
		console.warn("WebRTCommCall:onRtcPeerConnectionIceChangeEvent(): event ignored");
	}
};

/**
 * RTCPeerConnection listener implementation
 * @private
 * @param {Event} event  RTCPeerConnection identity event
 */
WebRTCommCall.prototype.onRtcPeerConnectionIdentityResultEvent = function(event) {
	console.debug("WebRTCommCall:onRtcPeerConnectionIdentityResultEvent():event=" + event);
	if (this.peerConnection) {
		console.debug("WebRTCommCall:onRtcPeerConnectionIdentityResultEvent(): this.peerConnection.signalingState=" + this.peerConnection.signalingState);
		console.debug("WebRTCommCall:onRtcPeerConnectionIdentityResultEvent(): this.peerConnection.iceGatheringState=" + this.peerConnection.iceGatheringState);
		console.debug("WebRTCommCall:onRtcPeerConnectionIdentityResultEvent(): this.peerConnection.iceConnectionState=" + this.peerConnection.iceConnectionState);
		console.debug("WebRTCommCall:onRtcPeerConnectionIdentityResultEvent(): this.peerConnectionState=" + this.peerConnectionState);
	} else {
		console.warn("WebRTCommCall:onRtcPeerConnectionIdentityResultEvent(): event ignored");
	}
};

/**
 * RTCPeerConnection listener implementation
 * @private
 * @param {Event} event  RTCPeerConnection data channel event
 */
WebRTCommCall.prototype.onRtcPeerConnectionOnMessageChannelEvent = function(event) {
	console.debug("WebRTCommCall:onRtcPeerConnectionOnMessageChannelEvent():event=" + JSON.stringify(event));
	if (this.peerConnection) {
		console.debug("WebRTCommCall:onRtcPeerConnectionOnMessageChannelEvent(): this.peerConnection.signalingState=" + this.peerConnection.signalingState);
		console.debug("WebRTCommCall:onRtcPeerConnectionOnMessageChannelEvent(): this.peerConnection.iceGatheringState=" + this.peerConnection.iceGatheringState);
		console.debug("WebRTCommCall:onRtcPeerConnectionOnMessageChannelEvent(): this.peerConnection.iceConnectionState=" + this.peerConnection.iceConnectionState);
		console.debug("WebRTCommCall:onRtcPeerConnectionOnMessageChannelEvent(): this.peerConnectionState=" + this.peerConnectionState);
		this.messageChannel = event.channel;
		console.debug("WebRTCommCall:onRtcPeerConnectionOnMessageChannelEvent(): this.messageChannel.label=" + this.messageChannel.label);
		console.debug("WebRTCommCall:onRtcPeerConnectionOnMessageChannelEvent(): this.messageChannel.reliable=" + this.messageChannel.reliable);
		console.debug("WebRTCommCall:onRtcPeerConnectionOnMessageChannelEvent(): this.messageChannel.binaryType=" + this.messageChannel.binaryType);
		var that = this;
		this.messageChannel.onopen = function(event) {
			that.onRtcPeerConnectionMessageChannelOnOpenEvent(event);
		};
		this.messageChannel.onclose = function(event) {
			that.onRtcPeerConnectionMessageChannelOnClose(event);
		};
		this.messageChannel.onerror = function(event) {
			that.onRtcPeerConnectionMessageChannelOnErrorEvent(event);
		};
		this.messageChannel.onmessage = function(event) {
			that.onRtcPeerConnectionMessageChannelOnMessageEvent(event);
		};
	} else {
		console.warn("WebRTCommCall:onRtcPeerConnectionOnMessageChannelEvent(): event ignored");
	}
};

WebRTCommCall.prototype.onRtcPeerConnectionMessageChannelOnOpenEvent = function(event) {
	console.debug("WebRTCommCall:onRtcPeerConnectionMessageChannelOnOpenEvent():event=" + event);
	if (this.peerConnection) {
		console.debug("WebRTCommCall:onRtcPeerConnectionMessageChannelOnOpenEvent(): this.peerConnection.signalingState=" + this.peerConnection.signalingState);
		console.debug("WebRTCommCall:onRtcPeerConnectionMessageChannelOnOpenEvent(): this.peerConnection.iceGatheringState=" + this.peerConnection.iceGatheringState);
		console.debug("WebRTCommCall:onRtcPeerConnectionMessageChannelOnOpenEvent(): this.peerConnection.iceConnectionState=" + this.peerConnection.iceConnectionState);
		console.debug("WebRTCommCall:onRtcPeerConnectionMessageChannelOnOpenEvent(): this.peerConnectionState=" + this.peerConnectionState);
		if (this.messageChannel) {
			console.debug("WebRTCommCall:onRtcPeerConnectionMessageChannelOnOpenEvent(): this.messageChannel.readyState=" + this.messageChannel.readyState);
			console.debug("WebRTCommCall:onRtcPeerConnectionMessageChannelOnOpenEvent(): this.messageChannel.binaryType=" + this.messageChannel.bufferedAmmount);
			if (this.eventListener.onWebRTCommDataMessageChannelOnOpenEvent) {
				var that = this;
				setTimeout(function() {
					try {
						that.eventListener.onWebRTCommDataMessageChannelOnOpenEvent();
					} catch (exception) {
						console.error("WebRTCommCall:onWebRTCommDataMessageChannelOnOpenEvent(): catched exception in event listener:" + exception);
					}
				}, 1);
			}
		}
	} else {
		console.warn("WebRTCommCall:onRtcPeerConnectionMessageChannelOnOpenEvent(): event ignored");
	}
};

WebRTCommCall.prototype.onRtcPeerConnectionMessageChannelOnClose = function(event) {
	console.debug("WebRTCommCall:onRtcPeerConnectionMessageChannelOnClose():event=" + event);
	if (this.peerConnection) {
		console.debug("WebRTCommCall:onRtcPeerConnectionMessageChannelOnClose(): this.peerConnection.signalingState=" + this.peerConnection.signalingState);
		console.debug("WebRTCommCall:onRtcPeerConnectionMessageChannelOnClose(): this.peerConnection.iceGatheringState=" + this.peerConnection.iceGatheringState);
		console.debug("WebRTCommCall:onRtcPeerConnectionMessageChannelOnClose(): this.peerConnection.iceConnectionState=" + this.peerConnection.iceConnectionState);
		console.debug("WebRTCommCall:onRtcPeerConnectionMessageChannelOnClose(): this.peerConnectionState=" + this.peerConnectionState);
		if (this.messageChannel) {
			console.debug("WebRTCommCall:onRtcPeerConnectionMessageChannelOnClose(): this.messageChannel.readyState=" + this.messageChannel.readyState);
			console.debug("WebRTCommCall:onRtcPeerConnectionMessageChannelOnClose(): this.messageChannel.binaryType=" + this.messageChannel.bufferedAmmount);
			if (this.eventListener.onWebRTCommDataMessageChannelOnCloseEvent) {
				var that = this;
				setTimeout(function() {
					try {
						that.eventListener.onWebRTCommDataMessageChannelOnCloseEvent();
					} catch (exception) {
						console.error("WebRTCommCall:onWebRTCommDataMessageChannelOnCloseEvent(): catched exception in event listener:" + exception);
					}
				}, 1);
			}
		}
	} else {
		console.warn("WebRTCommCall:onRtcPeerConnectionMessageChannelOnClose(): event ignored");
	}
};

WebRTCommCall.prototype.onRtcPeerConnectionMessageChannelOnErrorEvent = function(event) {
	console.debug("WebRTCommCall:onRtcPeerConnectionMessageChannelOnErrorEvent():event=" + event);
	if (this.peerConnection) {
		console.debug("WebRTCommCall:onRtcPeerConnectionMessageChannelOnErrorEvent(): this.peerConnection.signalingState=" + this.peerConnection.signalingState);
		console.debug("WebRTCommCall:onRtcPeerConnectionMessageChannelOnErrorEvent(): this.peerConnection.iceGatheringState=" + this.peerConnection.iceGatheringState);
		console.debug("WebRTCommCall:onRtcPeerConnectionMessageChannelOnErrorEvent(): this.peerConnection.iceConnectionState=" + this.peerConnection.iceConnectionState);
		console.debug("WebRTCommCall:onRtcPeerConnectionMessageChannelOnErrorEvent(): this.peerConnectionState=" + this.peerConnectionState);
		if (this.messageChannel) {
			console.debug("WebRTCommCall:onRtcPeerConnectionMessageChannelOnErrorEvent(): this.messageChannel.readyState=" + this.messageChannel.readyState);
			console.debug("WebRTCommCall:onRtcPeerConnectionMessageChannelOnErrorEvent(): this.messageChannel.binaryType=" + this.messageChannel.bufferedAmmount);
			if (this.eventListener.onWebRTCommDataMessageChannelOnErrorEvent) {
				var that = this;
				setTimeout(function() {
					try {
						that.eventListener.onWebRTCommDataMessageChannelOnErrorEvent();
					} catch (exception) {
						console.error("WebRTCommCall:onWebRTCommDataMessageChannelOnErrorEvent(): catched exception in event listener:" + exception);
					}
				}, 1);
			}
		}
	} else {
		console.warn("WebRTCommCall:onRtcPeerConnectionMessageChannelOnErrorEvent(): event ignored");
	}
};

WebRTCommCall.prototype.onRtcPeerConnectionMessageChannelOnMessageEvent = function(event) {
	console.debug("WebRTCommCall:onRtcPeerConnectionMessageChannelOnMessageEvent():event=" + event);
	if (this.peerConnection) {
		console.debug("WebRTCommCall:onRtcPeerConnectionMessageChannelOnMessageEvent(): this.peerConnection.signalingState=" + this.peerConnection.signalingState);
		console.debug("WebRTCommCall:onRtcPeerConnectionMessageChannelOnMessageEvent(): this.peerConnection.iceGatheringState=" + this.peerConnection.iceGatheringState);
		console.debug("WebRTCommCall:onRtcPeerConnectionMessageChannelOnMessageEvent(): this.peerConnection.iceConnectionState=" + this.peerConnection.iceConnectionState);
		console.debug("WebRTCommCall:onRtcPeerConnectionMessageChannelOnMessageEvent(): this.peerConnectionState=" + this.peerConnectionState);
		if (this.messageChannel) {
			console.debug("WebRTCommCall:onRtcPeerConnectionMessageChannelOnMessageEvent(): this.messageChannel.readyState=" + this.messageChannel.readyState);
			console.debug("WebRTCommCall:onRtcPeerConnectionMessageChannelOnMessageEvent(): this.messageChannel.binaryType=" + this.messageChannel.bufferedAmmount);
			if (this.eventListener.onWebRTCommDataMessageReceivedEvent) {
				// Build WebRTCommMessage
				var newWebRTCommDataMessage = new WebRTCommDataMessage(this.webRTCommClient, this);
				newWebRTCommDataMessage.content = event.data;
				var that = this;
				setTimeout(function() {
					try {
						that.eventListener.onWebRTCommDataMessageReceivedEvent(newWebRTCommDataMessage);
					} catch (exception) {
						console.error("WebRTCommCall:onRtcPeerConnectionMessageChannelOnMessageEvent(): catched exception in listener:" + exception);
					}
				}, 1);
			}
		}
	} else {
		console.warn("WebRTCommCall:onRtcPeerConnectionMessageChannelOnMessageEvent(): event ignored");
	}
};

/**
 * Modifiy SDP based on configured codec filter
 * @private
 * @param {SessionDescription} sessionDescription  JAIN (gov.nist.sdp) SDP offer object 
 */
WebRTCommCall.prototype.applyConfiguredCodecFilterOnSessionDescription = function(sessionDescription) {
	if (sessionDescription instanceof SessionDescription) {
		try {
			console.debug("WebRTCommCall:applyConfiguredCodecFilterOnSessionDescription(): sessionDescription=" + sessionDescription);
			// Deep copy the media descriptions
			var mediaDescriptions = sessionDescription.getMediaDescriptions(false);
			for (var i = 0; i < mediaDescriptions.length; i++) {
				var mediaDescription = mediaDescriptions[i];
				var mediaField = mediaDescription.getMedia();
				var mediaType = mediaField.getType();
				if (mediaType === "audio") {
					if (this.configuration.audioCodecsFilter) {
						var offeredAudioCodecs = this.getOfferedCodecsInMediaDescription(mediaDescription);
						// Filter offered codec first
						var splitAudioCodecsFilters = (this.configuration.audioCodecsFilter).split(",");
						this.applyCodecFiltersOnOfferedCodecs(offeredAudioCodecs, splitAudioCodecsFilters);
						// Apply modification on audio media description
						this.updateMediaDescription(mediaDescription, offeredAudioCodecs, splitAudioCodecsFilters);
					}

					// Add OPUS parameter if required
					if (this.configuration.opusFmtpCodecsParameters) {
						this.updateOpusMediaDescription(mediaDescription, this.configuration.opusFmtpCodecsParameters);
					}
				} else if (mediaType === "video" && this.configuration.videoCodecsFilter) {
					var offeredVideoCodecs = this.getOfferedCodecsInMediaDescription(mediaDescription);
					// Filter offered codec
					var splitVideoCodecFilter = (this.configuration.videoCodecsFilter).split(",");
					this.applyCodecFiltersOnOfferedCodecs(offeredVideoCodecs, splitVideoCodecFilter);
					// Apply modification on video media description
					this.updateMediaDescription(mediaDescription, offeredVideoCodecs, splitVideoCodecFilter);
				}
			}
		} catch (exception) {
			console.error("WebRTCommCall:applyConfiguredCodecFilterOnSessionDescription(): catched exception, exception:" + exception);
			throw exception;
		}
	} else {
		throw "WebRTCommCall:applyConfiguredCodecFilterOnSessionDescription(): bad arguments"
	}
};

/**
 * Get offered codecs in media description
 * @private
 * @param {MediaDescription} mediaDescription  JAIN (gov.nist.sdp) MediaDescription object 
 * @return offeredCodec JSON object { "0":"PCMU", "111":"OPUS", .....} 
 */
WebRTCommCall.prototype.getOfferedCodecsInMediaDescription = function(mediaDescription) {
	console.debug("WebRTCommCall:getOfferedCodecsInMediaDescription()");
	if (mediaDescription instanceof MediaDescription) {
		var mediaFormats = mediaDescription.getMedia().getFormats(false);
		var foundCodecs = {};

		// Set static payload type and codec name
		for (var j = 0; j < mediaFormats.length; j++) {
			var payloadType = mediaFormats[j];
			console.debug("WebRTCommCall:getOfferedCodecsInMediaDescription(): payloadType=" + payloadType);
			console.debug("WebRTCommCall:getOfferedCodecsInMediaDescription(): this.codecNames[payloadType]=" + this.codecNames[payloadType]);
			foundCodecs[payloadType] = this.codecNames[payloadType];
		}

		// Set dynamic payload type and codec name 
		var attributFields = mediaDescription.getAttributes();
		for (var k = 0; k < attributFields.length; k++) {
			var attributField = attributFields[k];
			if (attributField.getName() === "rtpmap") {
				try {
					var rtpmapValue = attributField.getValue();
					var splitRtpmapValue = rtpmapValue.split(" ");
					var payloadType = splitRtpmapValue[0];
					var codecInfo = splitRtpmapValue[1];
					var splittedCodecInfo = codecInfo.split("/");
					var codecName = splittedCodecInfo[0];
					foundCodecs[payloadType] = codecName.toUpperCase();
					console.debug("WebRTCommCall:getOfferedCodecsInMediaDescription(): payloadType=" + payloadType);
					console.debug("WebRTCommCall:getOfferedCodecsInMediaDescription(): codecName=" + codecName);
				} catch (exception) {
					console.error("WebRTCommCall:getOfferedCodecsInMediaDescription(): rtpmap/fmtp format not supported");
				}
			}
		}
		return foundCodecs;
	} else {
		throw "WebRTCommCall:getOfferedCodecsInMediaDescription(): bad arguments"
	}
};

/**
 * Get offered codec list
 * @private
 * @param {JSON object} foundCodecs  
 * @param {Array} codecFilters  
 */
WebRTCommCall.prototype.applyCodecFiltersOnOfferedCodecs = function(foundCodecs, codecFilters) {
	console.debug("WebRTCommCall:applyCodecFiltersOnOfferedCodecs()");
	if (typeof(foundCodecs) === 'object' && codecFilters instanceof Array) {
		for (var offeredMediaCodecPayloadType in foundCodecs) {
			var filteredFlag = false;
			for (var i = 0; i < codecFilters.length; i++) {
				if (foundCodecs[offeredMediaCodecPayloadType] === codecFilters[i]) {
					filteredFlag = true;
					break;
				}
			}
			if (filteredFlag === false) {
				delete(foundCodecs[offeredMediaCodecPayloadType]);
			}
		}
	} else {
		throw "WebRTCommCall:applyCodecFiltersOnOfferedCodecs(): bad arguments"
	}
};

/**
 * Update offered media description avec configured filters
 * @private
 * @param {MediaDescription} mediaDescription  JAIN (gov.nist.sdp) MediaDescription object 
 * @param {JSON object} filteredCodecs 
 * @param {Array} codecFilters  
 */
WebRTCommCall.prototype.updateMediaDescription = function(mediaDescription, filteredCodecs, codecFilters) {
	console.debug("WebRTCommCall:updateMediaDescription()");
	if (mediaDescription instanceof MediaDescription && typeof(filteredCodecs) === 'object' && codecFilters instanceof Array) {
		// Build new media field format lis
		var newFormatListArray = new Array();
		for (var i = 0; i < codecFilters.length; i++) {
			for (var offeredCodecPayloadType in filteredCodecs) {
				if (filteredCodecs[offeredCodecPayloadType] === codecFilters[i]) {
					newFormatListArray.push(offeredCodecPayloadType);
					break;
				}
			}
		}
		mediaDescription.getMedia().setFormats(newFormatListArray);
		// Remove obsolte rtpmap attributs 
		var newAttributeFieldArray = new Array();
		var attributFields = mediaDescription.getAttributes();
		for (var k = 0; k < attributFields.length; k++) {
			var attributField = attributFields[k];
			if (attributField.getName() === "rtpmap" || attributField.getName() === "fmtp") {
				try {
					var rtpmapValue = attributField.getValue();
					var splitedRtpmapValue = rtpmapValue.split(" ");
					var payloadType = splitedRtpmapValue[0];
					if (filteredCodecs[payloadType] !== undefined)
						newAttributeFieldArray.push(attributField);
				} catch (exception) {
					console.error("WebRTCommCall:updateMediaDescription(): rtpmap/fmtp format not supported");
				}
			} else
				newAttributeFieldArray.push(attributField);
		}
		mediaDescription.setAttributes(newAttributeFieldArray);
	} else {
		throw "WebRTCommCall:updateMediaDescription(): bad arguments"
	}
};

/**
 * Update offered OPUS media description avec required FMTP parameters
 * @private
 * @param {MediaDescription} mediaDescription  JAIN (gov.nist.sdp) MediaDescription object 
 * @param {string} opusMediaFmtpParameters FMTP OPUS parameters
 */
WebRTCommCall.prototype.updateOpusMediaDescription = function(mediaDescription, opusMediaFmtpParameters) {
	console.debug("WebRTCommCall:updateOpusMediaDescription()");
	if (mediaDescription instanceof MediaDescription && typeof(opusMediaFmtpParameters) === 'string') {
		// Find OPUS payload Type 
		var opusPayloadType = undefined;
		var attributFields = mediaDescription.getAttributes();
		for (var i = 0; i < attributFields.length; i++) {
			var attributField = attributFields[i];
			if (attributField.getName() === "rtpmap") {
				try {
					var rtpmapValue = attributField.getValue().toLowerCase();
					if (rtpmapValue.indexOf("opus") >= 0) {
						var splitedRtpmapValue = rtpmapValue.split(" ");
						opusPayloadType = splitedRtpmapValue[0];
						break;
					}
				} catch (exception) {
					console.error("WebRTCommCall:updateMediaDescription(): rtpmap/fmtp format not supported");
				}
			}
		}

		if (opusPayloadType) {
			console.debug("WebRTCommCall:updateOpusMediaDescription():opusPayloadType=" + opusPayloadType);
			// Update FMTP OPUS SDP parameter  
			for (var j = 0; j < attributFields.length; j++) {
				var attributField = attributFields[j];
				if (attributField.getName() === "fmtp") {
					try {
						var fmtpValue = attributField.getValue();
						var splitedFmtpValue = rtpmapValue.split(" ");
						var payloadType = splitedFmtpValue[0];
						if (opusPayloadType === payloadType) {
							attributField.setValue(fmtpValue + " " + opusMediaFmtpParameters);
							console.debug("WebRTCommCall:updateOpusMediaDescription():fmtp=" + attributField.getValue());
						}
					} catch (exception) {
						console.error("WebRTCommCall:updateMediaDescription(): rtpmap/fmtp format not supported");
					}
				}
			}
		}
	} else {
		throw "WebRTCommCall:updateMediaDescription(): bad arguments"
	}
};

/**
 * Modifiy SDP based on configured codec filter
 * @private
 * @param {SessionDescription} sessionDescription  JAIN (gov.nist.sdp) SDP offer object 
 * @param {String} mediaTypeToRemove  audi/video 
 */
WebRTCommCall.prototype.patchChromeIce = function(sessionDescription, attributeToCheck) {
	console.debug("WebRTCommCall:patchChromeIce()");
	if (sessionDescription instanceof SessionDescription) {
		try {
			var otherAttributes = sessionDescription.getAttributes(false);
			if (otherAttributes != null) {
				for (var i = 0; i < otherAttributes.length; i++) {
					var attributField = otherAttributes[i];
					if (attributField.getName() === attributeToCheck) {
						console.debug("WebRTCommCall:patchChromeIce(), found ice-options session attribute trying to patch");
						try {
							var rtpmapValue = attributField.getValue().toLowerCase();
							if (rtpmapValue.indexOf("google-ice") >= 0) {
								console.debug("WebRTCommCall:patchChromeIce(), found google-ice session attribute trying to patch");
								//attributField.setValue("trickle");
								attributFields.remove(i);
								break;
							}
						} catch (exception) {
							console.error("WebRTCommCall:updateMediaDescription(): rtpmap/fmtp format not supported");
						}
					}
				}
			}
			var mediaDescriptions = sessionDescription.getMediaDescriptions(false);
			for (var i = 0; i < mediaDescriptions.length; i++) {
				var attributFields = mediaDescriptions[i].getAttributes();
				for (var j = 0; j < attributFields.length; j++) {
					var attributField = attributFields[j];
					if (attributField.getName() === attributeToCheck) {
						console.debug("WebRTCommCall:patchChromeIce(), found ice-options media attribute trying to patch");
						try {
							var rtpmapValue = attributField.getValue().toLowerCase();
							if (rtpmapValue.indexOf("google-ice") >= 0) {
								console.debug("WebRTCommCall:patchChromeIce(), found google-ice mediajattribute trying to patch");
								//attributField.setValue("trickle");
								attributFields.remove(j);
								break;
							}
						} catch (exception) {
							console.error("WebRTCommCall:updateMediaDescription(): rtpmap/fmtp format not supported");
						}
					}
				}
			}
		} catch (exception) {
			console.error("WebRTCommCall:patchChromeIce(): catched exception, exception:" + exception);
			throw exception;
		}
	} else {
		throw "WebRTCommCall:patchChromeIce(): bad arguments"
	}
};

/**
 * Modifiy SDP based on configured codec filter
 * @private
 * @param {SessionDescription} sessionDescription  JAIN (gov.nist.sdp) SDP offer object 
 * @param {String} mediaTypeToRemove  audi/video 
 */
WebRTCommCall.prototype.removeMediaDescription = function(sessionDescription, mediaTypeToRemove) {
	console.debug("WebRTCommCall:removeMediaDescription()");
	if (sessionDescription instanceof SessionDescription) {
		try {
			var mediaDescriptions = sessionDescription.getMediaDescriptions(false);
			for (var i = 0; i < mediaDescriptions.length; i++) {
				var mediaDescription = mediaDescriptions[i];
				var mediaField = mediaDescription.getMedia();
				var mediaType = mediaField.getType();
				if (mediaType === mediaTypeToRemove) {
					mediaDescriptions.remove(i);
					break;
				}
			}

			if (window.mozRTCPeerConnection) {
				var attributes = sessionDescription.getAttributes(false);
				for (var i = 0; i < attributes.length; i++) {
					var attribute = attributes[i];
					var attributeValue = attribute.getValue();
					if ("BUNDLE sdparta_0 sdparta_1" === attributeValue) {
						if ("video" === mediaTypeToRemove) {
							attribute.setValue("BUNDLE sdparta_0");
							break;
						}
						if ("audio" === mediaTypeToRemove) {
							attribute.setValue("BUNDLE sdparta_1");
							break;
						}
					}
				}
			}
		} catch (exception) {
			console.error("WebRTCommCall:removeMediaDescription(): catched exception, exception:" + exception);
			throw exception;
		}
	} else {
		throw "WebRTCommCall:removeMediaDescription(): bad arguments"
	}
};

/**
 * Modifiy SDP, remove non "relay" ICE candidates
 * @private
 * @param {SessionDescription} sessionDescription  JAIN (gov.nist.sdp) SDP offer object 
 */
WebRTCommCall.prototype.forceTurnMediaRelay = function(sessionDescription) {
	console.debug("WebRTCommCall:forceTurnMediaRelay()");
	if (sessionDescription instanceof SessionDescription) {
		try {
			var mediaDescriptions = sessionDescription.getMediaDescriptions(false);
			for (var i = 0; i < mediaDescriptions.length; i++) {
				var mediaDescription = mediaDescriptions[i];
				var newAttributeFieldArray = new Array();
				var attributFields = mediaDescription.getAttributes();
				for (var k = 0; k < attributFields.length; k++) {
					var attributField = attributFields[k];
					if (attributField.getName() === "candidate") {
						var candidateValue = attributField.getValue();
						var isRelayCandidate = candidateValue.indexOf("typ relay") > 0;
						if (isRelayCandidate) {
							newAttributeFieldArray.push(attributField);
						}
					} else
						newAttributeFieldArray.push(attributField);
				}
				mediaDescription.setAttributes(newAttributeFieldArray);
			}
		} catch (exception) {
			console.error("WebRTCommCall:forceTurnMediaRelay(): catched exception, exception:" + exception);
			throw exception;
		}
	} else {
		throw "WebRTCommCall:forceTurnMediaRelay(): bad arguments"
	}
};
