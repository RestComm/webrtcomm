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
 *  Implementation of the JAIN-SIP PhoneField .
 *  @see  gov/nist/javax/sdp/fields/PhoneField.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

function PhoneField() {
    if(logger!=undefined) logger.debug("PhoneField:PhoneField()");
    this.classname="PhoneField";
    this.fieldName=this.VERSION_FIELD;
    this.name=null;
    this.phoneNumber=null; 
}
 
PhoneField.prototype = new SDPField();
PhoneField.prototype.constructor=PhoneField; 

OriginField.prototype.getName =function() {
    if(logger!=undefined) logger.debug("PhoneField:getName()");
    return this.name;
}

PhoneField.prototype.getPhoneNumber =function() {
    if(logger!=undefined) logger.debug("PhoneField:getPhoneNumber()");
    return this.phoneNumber;
}

/**
 * Set the name member
 *
 *@param name - the name to set.
 */
PhoneField.prototype.setName =function(name) {
    if(typeof name ==  'string')
    {
       if(logger!=undefined) logger.debug("PhoneField:setName(): name="+name);
       this.name = name;
    }
    else throw new SdpException("PhoneField.setName(): requires number type argument");  
}

/**
 * Set the phoneNumber member
 *@param phoneNumber - phone number to set.
 */
PhoneField.prototype.setPhoneNumber =function(phoneNumber) {
    if(typeof phoneNumber ==  'string')
    {
       if(logger!=undefined) logger.debug("PhoneField:setPhoneNumber(): phoneNumber="+phoneNumber);
       this.phoneNumber = phoneNumber;
    }
    else throw new SdpException("PhoneField.setPhoneNumber(): requires number type argument");  
}

/**
 *  Get the string encoded version of this object
 * @since v1.0
 * Here, we implement only the "name <phoneNumber>" form
 * and not the "phoneNumber (name)" form
 */
PhoneField.prototype.encode =function() {
    if(logger!=undefined) logger.debug("PhoneField:encode()");
    if(this.phoneNumber==null) throw  new SdpException("PhoneField.encode() requires phoneNumber");
    var encodedString=this.PHONE_FIELD;
    if(this.name!=null) encodedString += this.name;
    encodedString += Separators.prototype.LESS_THAN;
    encodedString += this.phoneNumber;
    encodedString += Separators.prototype.GREATER_THAN;
    encodedString += Separators.prototype.NEWLINE;
    return encodedString;
}

