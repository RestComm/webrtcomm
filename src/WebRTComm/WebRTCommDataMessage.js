/**
 * @class WebRTCommDataMessage
 * @classdesc Implements WebRTComm message  
 * @constructor
 * @public
 * @param  {WebRTCommClient} webRTCommClient WebRTComm client owner 
 * @param  {WebRTCommCall} webRTCommCall WebRTComm call owner 
 * @author Jean Deruelle (jean.deruelle@telestax.com) 
 */ 
WebRTCommDataMessage = function(webRTCommClient, webRTCommCall)
{
    console.debug("WebRTCommDataMessage:WebRTCommDataMessage()");
    if((webRTCommClient instanceof WebRTCommClient) || (webRTCommCall instanceof WebRTCommCall))
    {
        this.id=undefined;
        this.webRTCommClient=webRTCommClient;
        this.webRTCommCall=webRTCommCall;
        this.content=undefined;
        this.from=undefined;
        this.to=undefined;
    }
    else 
    {
        throw "WebRTCommDataMessage:WebRTCommDataMessage(): bad arguments"      
    }
};


/**
 * Get message id
 * @public
 * @returns {String} id  
 */ 
WebRTCommDataMessage.prototype.getId= function() {
    return -1; // generate random id ?;  
};

/**
 * Get message sender identity
 * @public
 * @returns {String} from  
 */ 
WebRTCommDataMessage.prototype.getFrom= function() {
    return this.from;  
};

/**
 * Get message recever identity
 * @public
 * @returns {String} to  
 */ 
WebRTCommDataMessage.prototype.getTo= function() {
    return this.to;  
};

/**
 * Get message 
 * @public
 * @returns {String} message  
 */ 
WebRTCommDataMessage.prototype.getContent= function() {
    return this.content;  
};

/**
 * Get related WebRTCommCall  
 * @public
 * @returns {WebRTCommCall} WebRTCommCall 
 */ 
WebRTCommDataMessage.prototype.getLinkedWebRTCommCall= function() {
        return this.webRTCommCall;
};
