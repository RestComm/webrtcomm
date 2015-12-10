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
 *  Implementation of the JAIN-SIP SessionNameField .
 *  @see  gov/nist/javax/sdp/fields/SessionNameField.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

function SessionNameField() {
    if(logger!=undefined) logger.debug("SessionNameField:SessionNameField()");
    this.classname="SessionNameField";
    this.fieldName=this.SESSION_NAME_FIELD;
    this.sessionName=null;
}
 
SessionNameField.prototype = new SDPField();
SessionNameField.prototype.constructor=SessionNameField; 


SessionNameField.prototype.getSessionName =function() {
    if(logger!=undefined) logger.debug("SessionNameField:getSessionName()");
    return this.sessionName;
}
    
/**
 * Set the sessionName member
 */
SessionNameField.prototype.setSessionName =function(sessionName) {
    if( typeof(sessionName)=='string')
    {
        if(logger!=undefined) logger.debug("SessionNameField:setSessionName():sessionName="+sessionName);
        this.sessionName = sessionName;
    }
    else throw new SdpException("SessionNameField.setSessionName() requires string object argument");
}

/**
 *  Get the string encoded version of this object
 * @since v1.0
 */
SessionNameField.prototype.encode =function() {
    if(logger!=undefined) logger.debug("SessionNameField:encode()");
    return this.SESSION_NAME_FIELD + this.sessionName + Separators.prototype.NEWLINE;
}