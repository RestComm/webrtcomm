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
 *  Implementation of the JAIN-SIP EmailField .
 *  @see  gov/nist/javax/sdp/fields/EmailField.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

function EmailField() {
    if(logger!=undefined) logger.debug("EmailField:EmailField()");
    this.classname="EmailField";
    this.fieldName=this.EMAIL_FIELD;
    this.displayName=null;
    this.email=null;
}
 
EmailField.prototype = new SDPField();
EmailField.prototype.constructor=EmailField; 

EmailField.prototype.getEmail =function() {
    if(logger!=undefined) logger.debug("EmailField:getEmail()");
    return this.email;
}

EmailField.prototype.getDisplayName =function() {
    if(logger!=undefined) logger.debug("EmailField:getDisplayName()");
    return this.displayName;
}

/**
 * Set the displayName member
 */
EmailField.prototype.setDisplayName =function(displayName) {
    if( typeof(displayName)=='string')
    {
        if(logger!=undefined) logger.debug("EmailField:setDisplayName():displayName="+displayName);
        this.displayName = displayName;
    }
    else throw new SdpException("EmailField.setDisplayName() requires string object argument");
}

/**
 * Set the email member
 */
EmailField.prototype.setEmail =function(email) {
    if(typeof(email)=='string')
    {
        if(logger!=undefined) logger.debug("EmailField:setEmail():email="+email);
        this.email = email;
    }
    else throw new SdpException("EmailField.setEmail() requires string object argument");
}

/**
 *  Get the string encoded version of this object
 * @since v1.0
 */
EmailField.prototype.encode =function() {
    if(logger!=undefined) logger.debug("EmailField:encode()");
    if(this.email==null) throw  new SdpException("PhoneField.encode() requires email");
    var encodedString=this.EMAIL_FIELD;
    if (this.displayName != null) encodedString = this.displayName + Separators.prototype.LESS_THAN;
    else  encodedString = "";
    encodedString += this.email;
    if (this.displayName != null) encodedString += Separators.prototype.GREATER_THAN; 
    encodedString += Separators.prototype.NEWLINE;
    return encodedString 
}

