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

/*
 *  Implementation of the JAIN-SIP WSMsgParser .
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 *   
 */
function WSMsgParser(messageChannel) {
    this.classname="WSMsgParser";
    this.messageChannel=messageChannel;
}

WSMsgParser.prototype.RPORT="rport";
WSMsgParser.prototype.RECEIVED="received";

WSMsgParser.prototype.parsermessage =function(sipMessage){
    if(logger!=undefined) logger.debug("WSMsgParser:parsermessage()");
    var smp = new StringMsgParser();
    var parsedSipMessage = smp.parseSIPMessage(sipMessage);
    var cl =  parsedSipMessage.getContentLength();
    var contentLength = 0;
    if (cl != null) {
        contentLength = cl.getContentLength();
    }
    else {
        contentLength = 0;
    }
    if (contentLength == 0) {
        parsedSipMessage.removeContent();
    } 
    console.info("SIP message received: "+parsedSipMessage.encode());
    this.processMessage(parsedSipMessage);
}

WSMsgParser.prototype.processMessage =function(parsedSipMessage){
    if(logger!=undefined) logger.debug("WSMsgParser:processMessage():parsedSipMessage="+parsedSipMessage);
    if (parsedSipMessage.getFrom() == null
        ||  parsedSipMessage.getTo() == null || parsedSipMessage.getCallId() == null
        || parsedSipMessage.getCSeq() == null || parsedSipMessage.getViaHeaders() == null) {
        return;
    }
    if (parsedSipMessage instanceof SIPRequest) {
        var sipRequest =  parsedSipMessage;
        var sipServerRequest = this.messageChannel.messageProcessor.sipStack.newSIPServerRequest(sipRequest, this.messageChannel);
        if (sipServerRequest != null) 
        {
            sipServerRequest.processRequest(sipRequest,this.messageChannel);
        }
    } 
    else {
        var sipResponse = parsedSipMessage;
        try {
            sipResponse.checkHeaders();
        } catch (ex) {
            console.error("WSMsgParser:processMessage(): catched exception:"+ex);
            return;
        }
        var sipServerResponse = this.messageChannel.messageProcessor.sipStack.newSIPServerResponse(sipResponse, this.messageChannel);
        if (sipServerResponse != null) {
            if (sipServerResponse instanceof SIPClientTransaction
                && !sipServerResponse.checkFromTag(sipResponse)) 
                {
                return;
            }
            sipServerResponse.processResponse(sipResponse, this.messageChannel);
        } 
    }
}
