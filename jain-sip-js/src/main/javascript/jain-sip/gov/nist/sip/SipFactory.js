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
 *  Implementation of the JAIN-SIP SipFactory .
 *  @see  gov/nist/javax/sip/SipFactory.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */
function SipFactory() {
    if(logger!=undefined) logger.debug("SipFactory:SipFactory()");
    this.classname="SipFactory"; 
}

SipFactory.prototype.createSipStack =function(sipUserAgentName){
    if(logger!=undefined) logger.debug("SipFactory:createSipStack()");
    try {
       return new SipStackImpl(sipUserAgentName);
    } catch (exception) {
        console.error("SipFactory:createAddressFactory(): failed to create SipStackImpl");
        throw "SipFactory:createAddressFactory(): failed to create SipStackImpl";
    }
}

SipFactory.prototype.createAddressFactory =function(){
    if(logger!=undefined) logger.debug("SipFactory:createAddressFactory()");
    try {
        return new AddressFactoryImpl();
    } catch (exception) {
        console.error("SipFactory:createAddressFactory(): failed to create AddressFactory");
        throw "SipFactory:createAddressFactory(): failed to create AddressFactory";
    }
}

SipFactory.prototype.createHeaderFactory =function(){
    if(logger!=undefined) logger.debug("SipFactory:createHeaderFactory()");
    try {
        return new HeaderFactoryImpl();
    } catch (exception) {
        console.error("SipFactory:createHeaderFactory(): failed to create HeaderFactory");
        throw "SipFactory:createHeaderFactory(): failed to create HeaderFactory";
    }
}
SipFactory.prototype.createMessageFactory =function(){
    if(logger!=undefined) logger.debug("SipFactory:createMessageFactory():");
    try {
        return new MessageFactoryImpl();
    } catch (exception) {
        console.error("SipFactory:createMessageFactory(): failed to create MessageFactory");
        throw "SipFactory:createMessageFactory():failed to create MessageFactory";
    }
}