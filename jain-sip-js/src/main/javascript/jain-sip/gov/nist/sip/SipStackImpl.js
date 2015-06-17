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
 *  Implementation of the JAIN-SIP SipStackImpl .
 *  @see  gov/nist/javax/sip/SipStackImpl.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */
function SipStackImpl(sipUserAgent) {
    if(logger!=undefined) logger.debug("SipStackImpl:SipStackImpl()");
    this.classname="SipStackImpl"; 
    this.stackName=null;
    this.serverTransactionTable=new Array();
    this.clientTransactionTable=new Array();
    this.earlyDialogTable=new Array();
    this.isBackToBackUserAgent = false;
    this.eventScanner=new EventScanner(this);
    this.listeningPoints=new Array();
    this.sipProviders=new Array();
    this.sipListener=null;
    this.setNon2XXAckPassedToListener(false);
    this.isAutomaticDialogSupportEnabled = true;
    this.isAutomaticDialogErrorHandlingEnabled = true;
    this.messageChannel=null;
    this.userAgentName=sipUserAgent;
    this.lastTransaction=null;
    this.reEntrantListener=true;
   
    this.setHostAddress(Utils.prototype.randomString(12)+".invalid");           
    this.sipMessageFactory = new NistSipMessageFactoryImpl(this);      
    this.defaultRouter = new DefaultRouter(this, this.stackAddress);
}

SipStackImpl.prototype = new SIPTransactionStack();
SipStackImpl.prototype.constructor=SipStackImpl;
SipStackImpl.prototype.MAX_DATAGRAM_SIZE=8 * 1024;

SipStackImpl.prototype.isAutomaticDialogSupportEnabledFunction =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:isAutomaticDialogSupportEnabledFunction()");
    return this.isAutomaticDialogSupportEnabled;
}

SipStackImpl.prototype.isAutomaticDialogErrorHandlingEnabledFunction =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:isAutomaticDialogErrorHandlingEnabledFunction()");
    return this.isAutomaticDialogErrorHandlingEnabled;
}

SipStackImpl.prototype.getEventScanner =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:getEventScanner()");
    return this.eventScanner;
}

SipStackImpl.prototype.getSipListener =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:getSipListener()");
    return this.sipListener;
}

SipStackImpl.prototype.createSipProvider =function(listeningPoint){
    if(logger!=undefined) logger.debug("SipStackImpl:createSipProvider():listeningPoint="+listeningPoint);
    if (listeningPoint == null) {
        console.error("SipProviderImpl:createSipProvider(): null listeningPoint argument");
        throw "SipProviderImpl:createSipProvider(): null listeningPoint argument";
    }
    
    if (listeningPoint.sipProvider != null) {
        console.error("SipProviderImpl:createSipProvider(): provider already attached!");
        throw "SipProviderImpl:createSipProvider(): provider already attached!";
    }
    
    var sipProvider = new SipProviderImpl(this);
    sipProvider.setListeningPoint(listeningPoint);
    listeningPoint.setSipProvider(sipProvider);
    this.sipProviders.push(sipProvider);
    return sipProvider;
}

SipStackImpl.prototype.createListeningPoint =function(wsUrl){
    if(logger!=undefined) logger.debug("SipStackImpl:createListeningPoint(): wsUrl="+wsUrl);
    if (!this.isAlive()) {
        this.toExit = false;
        this.reInitialize();
    }
    
    var transport;
    if(wsUrl.toLowerCase().indexOf("ws://")==0) transport="WS";
    else if(wsUrl.toLowerCase().indexOf("wss://")==0) transport="WSS";
    else 
    {
      throw "WSMessageChannel:createWebSocket(): bad Websocket Url";
      console.warn("WSMessageChannel:createWebSocket(): bad Websocket Url");
    }
    
    var key = ListeningPointImpl.prototype.makeKey(this.stackAddress, transport);
    for(var i=0;i<this.listeningPoints.length;i++)
    {
        if(this.listeningPoints[i]==key)
        {
            return this.listeningPoints[i][1];
        }
    }
   
    var messageProcessor = new WSMessageProcessor(this, wsUrl);
    this.addMessageProcessor(messageProcessor);
    var listeningPoint=new ListeningPointImpl(this, messageProcessor);
    messageProcessor.setListeningPoint(listeningPoint);
    var array=new Array();
    array[0]=key;
    array[1]=listeningPoint;
    this.listeningPoints.push(array);
    this.messageChannel=messageProcessor.getMessageChannel();
    return listeningPoint;
}

SipStackImpl.prototype.reInitialize =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:reInitialize()");
    this.reInit();
    this.eventScanner = new EventScanner(this);
    this.listeningPoints = new Array();
    this.sipProviders = new Array();
    this.sipListener = null;
}

SipStackImpl.prototype.getUserAgent =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:getUserAgent()");
    return this.userAgentName;
}

SipStackImpl.prototype.deleteListeningPoint =function(listeningPoint){
    if(logger!=undefined) logger.debug("SipStackImpl:deleteListeningPoint():listeningPoint="+listeningPoint);
    if (listeningPoint == null) {
        console.error("SipProviderImpl:deleteListeningPoint(): null listeningPoint arg");
        throw "SipProviderImpl:deleteListeningPoint(): null listeningPoint arg";
    }
    this.removeMessageProcessor(listeningPoint.messageProcessor);
    var key = listeningPoint.getKey();
    for(var i=0;i<this.listeningPoints.length;i++)
    {
        if(this.listeningPoints[i][0]==key)
        {
            this.listeningPoints.splice(i,1);
            break;
        }
    }
}

SipStackImpl.prototype.deleteSipProvider =function(sipProvider){
    if(logger!=undefined) logger.debug("SipStackImpl:deleteSipProvider():sipProvider:"+sipProvider);
    if (sipProvider == null) {
        console.error("SipProviderImpl:deleteSipProvider(): null provider arg");
        throw "SipProviderImpl:deleteSipProvider(): null provider arg";
    }
    if (sipProvider.getSipListener() != null) {
        console.error("SipProviderImpl:deleteSipProvider(): sipProvider still has an associated SipListener!");
        throw "SipProviderImpl:deleteSipProvider(): sipProvider still has an associated SipListener!";
    }
    sipProvider.removeListeningPoints();
    sipProvider.stop();
    for(var i=0;i<this.sipProviders.length;i++)
    {
        if(this.sipProviders[i]==sipProvider)
        {
             this.sipProviders.splice(i,1);
             break;
        }
    }
    if (this.sipProviders.length==0) {
        this.stopStack();
    }
}

SipStackImpl.prototype.getListeningPoints =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:getListeningPoints()");
    return this.listeningPoints;
}

SipStackImpl.prototype.getSipProviders =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:getSipProviders()");
    return this.sipProviders;
}

SipStackImpl.prototype.getStackName =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:getStackName()");
    return this.stackName;
}

SipStackImpl.prototype.finalize =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:finalize()");
    this.stopStack();
}

SipStackImpl.prototype.stop =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:stop()");
    this.stopStack();
    this.sipProviders = new Array();
    this.listeningPoints = new Array();
    if (this.eventScanner != null) {
        this.eventScanner.forceStop();
    }
    this.eventScanner = null;
}

SipStackImpl.prototype.start =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:start()");
    if (this.eventScanner == null) {
        this.eventScanner = new EventScanner(this);
    }
}

SipStackImpl.prototype.getSipListener =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:getSipListener()");
    return this.sipListener;
}

SipStackImpl.prototype.setEnabledCipherSuites =function(newCipherSuites){
    if(logger!=undefined) logger.debug("SipStackImpl:setEnabledCipherSuites():newCipherSuites="+newCipherSuites);
    this.cipherSuites = newCipherSuites;
}

SipStackImpl.prototype.getEnabledCipherSuites =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:getEnabledCipherSuites()");
    return this.cipherSuites;
}

SipStackImpl.prototype.setEnabledProtocols =function(newProtocols){
    if(logger!=undefined) logger.debug("SipStackImpl:setEnabledProtocols():newProtocols="+newProtocols);
    this.enabledProtocols = newProtocols;
}

SipStackImpl.prototype.getEnabledProtocols =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:getEnabledProtocols()");
    return this.enabledProtocols;
}

SipStackImpl.prototype.setIsBackToBackUserAgent =function(flag){
    if(logger!=undefined) logger.debug("SipStackImpl:setIsBackToBackUserAgent():flag="+flag);
    this.isBackToBackUserAgent = flag;
}

SipStackImpl.prototype.isBackToBackUserAgent =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:isBackToBackUserAgent()");
    return this.isBackToBackUserAgent;
}

SipStackImpl.prototype.isAutomaticDialogErrorHandlingEnabled =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:isAutomaticDialogErrorHandlingEnabled()");
    return this.isAutomaticDialogErrorHandlingEnabled;
}

SipStackImpl.prototype.getChannel =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:getChannel()");
    return this.messageChannel;
}

SipStackImpl.prototype.newSIPServerRequest =function(requestReceived,requestMessageChannel){
    if(logger!=undefined) logger.debug("SipStackImpl:newSIPServerRequest(): requestReceived="+ requestReceived);
    if(logger!=undefined) logger.debug("SipStackImpl:newSIPServerRequest(): requestMessageChannel="+requestMessageChannel);
    var nextTransaction=null;
    var currentTransaction=null;
    var key = requestReceived.getTransactionId();
    requestReceived.setMessageChannel(requestMessageChannel); 
    var l=null;
    for(var i=0;i<this.serverTransactionTable.length;i++)
    {
        if(this.serverTransactionTable[i][0]==key)
        {
            l=i;
        }
    }
    if(l!=null)
    {
        currentTransaction=this.serverTransactionTable[l][1]; 
    }
    if (currentTransaction == null|| !currentTransaction.isMessagePartOfTransaction(requestReceived)) {
        currentTransaction = null;
        var length=this.BRANCH_MAGIC_COOKIE_LOWER_CASE.length;
        var chaine=key.toLowerCase().substr(0, length-1);
        if (chaine!=this.BRANCH_MAGIC_COOKIE_LOWER_CASE) {
            for(i=0;(i<this.serverTransactionTable.length) && (currentTransaction == null);i++)
            {
                nextTransaction=this.serverTransactionTable[i][1];
                if (nextTransaction.isMessagePartOfTransaction(requestReceived)) {
                    currentTransaction = nextTransaction;
                }
            }
        }
        if (currentTransaction == null) {
            currentTransaction = this.findPendingTransaction(requestReceived);
            if (currentTransaction != null) {
                requestReceived.setTransaction(currentTransaction);
                if (currentTransaction != null) {
                    return currentTransaction;
                } else {
                    return null;
                }

            }
            currentTransaction = this.createServerTransaction(requestMessageChannel);
            currentTransaction.setOriginalRequest(requestReceived);
            requestReceived.setTransaction(currentTransaction);
            if(requestReceived.getMethod()!="ACK")
            {
               currentTransaction=requestMessageChannel.messageProcessor.listeningPoint.sipProvider.getNewServerTransaction(requestReceived);
            }
        }
    }
    if (currentTransaction != null) {
        currentTransaction.setRequestInterface(this.sipMessageFactory.newSIPServerRequest(
            requestReceived, currentTransaction));
    }
    if(requestReceived.getMethod()=="ACK")
    {
        currentTransaction=this.lastTransaction;
    }
    else
    {
        this.lastTransaction=currentTransaction;
    }
    return currentTransaction;
}


SipStackImpl.prototype.newSIPServerResponse =function(responseReceived,responseMessageChannel){
    if(logger!=undefined) logger.debug("SipStackImpl:newSIPServerResponse(): responseReceived="+responseReceived);
    if(logger!=undefined) logger.debug("SipStackImpl:newSIPServerResponse(): responseMessageChannel="+responseMessageChannel);
    var nextTransaction=null;
    var currentTransaction=null;
    var key = responseReceived.getTransactionId();
    var l=null;
    for(var i=0;i<this.clientTransactionTable.length;i++)
    {
        if(this.clientTransactionTable[i][0]==key)
        {
            l=i;
        }
    }
    if(l!=null)
    {
        currentTransaction=this.clientTransactionTable[l][1];
    }
    var length=this.BRANCH_MAGIC_COOKIE_LOWER_CASE.length;
    var chaine=key.toLowerCase().substr(0, length-1);
    if (currentTransaction == null
        || (!currentTransaction.isMessagePartOfTransaction(responseReceived) 
            && chaine!=this.BRANCH_MAGIC_COOKIE_LOWER_CASE)) {
        for(i=0;(i<this.clientTransactionTable.length) && (currentTransaction == null);i++)
        {
            nextTransaction=this.clientTransactionTable[i][1];
            if (nextTransaction.isMessagePartOfTransaction(responseReceived)) {
                currentTransaction = nextTransaction;
            }
        }
        if (currentTransaction == null) {
            return this.sipMessageFactory.newSIPServerResponse(responseReceived,
                responseMessageChannel);
        }
    }
    var sri = this.sipMessageFactory.newSIPServerResponse(responseReceived, currentTransaction);
    if (sri != null) {
        currentTransaction.setResponseInterface(sri);
    }
    else {
        return null;
    }
    return currentTransaction;
}

SipStackImpl.prototype.createServerTransaction =function(encapsulatedMessageChannel){
    if(logger!=undefined) logger.debug("SipStackImpl:createServerTransaction():encapsulatedMessageChannel="+encapsulatedMessageChannel);
    return new SIPServerTransaction(this, encapsulatedMessageChannel);
}

SipStackImpl.prototype.removeTransaction =function(sipTransaction){
    if(logger!=undefined) logger.debug("SipStackImpl:removeTransaction():sipTransaction="+sipTransaction);
    if (sipTransaction instanceof SIPServerTransaction) {
        var key = sipTransaction.getTransactionId();
        var removed=null;
        var l=null;
        for(var i=0;i<this.serverTransactionTable.length;i++)
        {
            if(key==this.serverTransactionTable[i])
            {
                l=i
                removed=this.serverTransactionTable[i][1];
            }
        }
        this.serverTransactionTable.splice(l,1);
        var method = sipTransaction.getMethod();
        this.removePendingTransaction(sipTransaction);
        this.removeTransactionPendingAck(sipTransaction);
        if (method.toUpperCase()=="INVITE") {
            this.removeFromMergeTable(sipTransaction);
        }
        var sipProvider = sipTransaction.getSipProvider();
        if (removed != null && sipTransaction.testAndSetTransactionTerminatedEvent()) {
            var event = new TransactionTerminatedEvent(sipProvider,sipTransaction);
            sipProvider.handleEvent(event, sipTransaction);
        }
    } 
    else {
        key = sipTransaction.getTransactionId();
        var l=null;
        for(var i=0;i<this.clientTransactionTable.length;i++)
        {
            if(this.clientTransactionTable[i][0]==key)
            {
                l=i;
            }
        }
        if(l!=null)
        {
            removed = this.clientTransactionTable[l][1];
            this.clientTransactionTable.splice(l,1);
        }
        if (removed != null && sipTransaction.testAndSetTransactionTerminatedEvent()) {
            sipProvider = sipTransaction.getSipProvider();
            event = new TransactionTerminatedEvent(sipProvider,sipTransaction);
            sipProvider.handleEvent(event, sipTransaction);
        }
    }
}