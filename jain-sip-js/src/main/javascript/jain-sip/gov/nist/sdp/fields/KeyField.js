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
 *  Implementation of the JAIN-SIP KeyField .
 *  @see  gov/nist/javax/sdp/fields/KeyField.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

function KeyField() {
    if(logger!=undefined) logger.debug("KeyField:KeyField()");
    this.classname="KeyField";
    this.fieldName=this.KEY_FIELD;
    this.method=null;
    this.key=null;
    
}
 
KeyField.prototype = new SDPField();
KeyField.prototype.constructor=KeyField; 

KeyField.prototype.getMethod =function() {
    if(logger!=undefined) logger.debug("KeyField:getMethod()");
    return this.method;
}

KeyField.prototype.getKey =function() {
    if(logger!=undefined) logger.debug("KeyField:getKey()");
    return this.key;
}

/**
 * Set the type member
 */
KeyField.prototype.setMethod =function(method) {
    if(typeof method == "string")
    {
        if(logger!=undefined) logger.debug("KeyField:setMethod():method="+method);
        this.method = method;
    } 
    else throw new SdpException("KeyField.setMethod() requires string object argument");
}
   
/**
 * Set the keyData member
 */
KeyField.prototype.setKey =function(key) {
     if(typeof key == "string")
    {
        if(logger!=undefined) logger.debug("KeyField:setKey():key="+key);
        this.key = key;
    } 
    else throw new SdpException("KeyField.setKey() requires string object argument");
}

/**
 *  Get the string encoded version of this object
 * @since v1.0
 */
KeyField.prototype.encode =function() {
    if(logger!=undefined) logger.debug("KeyField:encode()");
    if(this.method==null) throw  new SdpException("KeyField.encode() requires method");
    if(this.key==null) throw  new SdpException("KeyField.encode() requires key");
    var encodedString=this.KEY_FIELD;
    encodedString += this.method;
    encodedString += Separators.prototype.COLON;
    encodedString += this.key;
    encodedString += Separators.prototype.NEWLINE;
    return encodedString;
}


