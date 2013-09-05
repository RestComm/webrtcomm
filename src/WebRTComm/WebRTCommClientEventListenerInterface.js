/**
 * @class WebRTCommClientEventListenerInterface
 * @classdesc Abstract class describing  WebRTCommClient event listener interface 
 *            required to be implented by the webapp 
 * @constructor
 * @public
 */ 
 WebRTCommClientEventListenerInterface = function(){
};
 
/**
 * Open event
 * @public
 */ 
WebRTCommClientEventListenerInterface.prototype.onWebRTCommClientOpenedEvent= function() {
    throw "WebRTCommClientEventListenerInterface:onWebRTCommClientOpenedEvent(): not implemented;"; 
}

/**
 * Open error event 
 * @public
 * @param {String} error open error message
 */
WebRTCommClientEventListenerInterface.prototype.onWebRTCommClientOpenErrorEvent= function(error) {
    throw "WebRTCommClientEventListenerInterface:onWebRTCommClientOpenErrorEvent(): not implemented;"; 
}


/**
 * Close event 
 * @public
 */
WebRTCommClientEventListenerInterface.prototype.onWebRTCommClientClosedEvent= function() {
    throw "WebRTCommClientEventListenerInterface:onWebRTCommClientClosedEvent(): not implemented;"; 
}

/**
 * Message event
 * @public
 * @param {String} from  remote Peer phone number
 * @param {String} message received message
 */
WebRTCommClientEventListenerInterface.prototype.onWebRTCommClientMessageEvent= function(from, message) {
    throw "WebRTCommCallEventListenerInterface:onWebRTCommClientMessageEvent(): not implemented;";   
}

/**
 * Send message error event
 * @public
 * @param {String} error code
 */
WebRTCommClientEventListenerInterface.prototype.onWebRTCommClientSendMessageErrorEvent= function(error) {
    throw "WebRTCommCallEventListenerInterface:onWebRTCommClientMessageEvent(): not implemented;";   
}
