/**
 * @class WebRTCommDataMessageEventListenerInterface
 * @classdesc Abstract class describing  WebRTCommDataMessage event listener interface 
 *            required to be implented by the webapp 
 * @constructor
 * @public
 */ 
 WebRTCommDataMessageEventListenerInterface = function(){
};
 
/**
 * Received message event
 * @public
 * @param {WebRTCommMessage} message object
 */
WebRTCommMessageEventListenerInterface.prototype.onWebRTCommDataMessageReceivedEvent = function(message) {
    throw "WebRTCommMessageEventListenerInterface:onWebRTCommDataMessageReceivedEvent(): not implemented;";
};

/**
 * Received message event
 * @public
 * @param {WebRTCommMessage} message object
 */
WebRTCommMessageEventListenerInterface.prototype.onWebRTCommDataMessageSentEvent = function(message) {
    throw "WebRTCommMessageEventListenerInterface:onWebRTCommDataMessageSentEvent(): not implemented;";
};

/**
 * Send message error event
 * @public
 * @param {WebRTCommMessage} message object
 * @param {String} error code
 */
WebRTCommMessageEventListenerInterface.prototype.onWebRTCommDataMessageSendErrorEvent = function(message, error) {
    throw "WebRTCommMessageEventListenerInterface:onWebRTCommDataMessageSendErrorEvent(): not implemented;";
};
