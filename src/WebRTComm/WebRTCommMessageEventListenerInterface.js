/**
 * @class WebRTCommMessageEventListenerInterface
 * @classdesc Abstract class describing  WebRTCommMessage event listener interface 
 *            required to be implented by the webapp 
 * @constructor
 * @public
 */ 
 WebRTCommMessageEventListenerInterface = function(){
};
 

/**
 * Received message event
 * @public
 * @param {WebRTCommMessage} message object
 */
WebRTCommMessageEventListenerInterface.prototype.onWebRTCommMessageReceivedEvent = function(message) {
    throw "WebRTCommCallEventListenerInterface:onWebRTCommMessageReceivedEvent(): not implemented;";
};

/**
 * Received message event
 * @public
 * @param {WebRTCommMessage} message object
 */
WebRTCommMessageEventListenerInterface.prototype.onWebRTCommMessageSentEvent = function(message) {
    throw "WebRTCommCallEventListenerInterface:onWebRTCommMessageSentEvent(): not implemented;";
};

/**
 * Send message error event
 * @public
 * @param {WebRTCommMessage} message object
 * @param {String} error code
 */
WebRTCommMessageEventListenerInterface.prototype.onWebRTCommMessageSendErrorEvent = function(message, error) {
    throw "WebRTCommCallEventListenerInterface:onWebRTCommMessageSendErrorEvent(): not implemented;";
};