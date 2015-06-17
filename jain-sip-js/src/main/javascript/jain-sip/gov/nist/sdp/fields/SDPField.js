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
 *  Implementation of the JAIN-SIP SDPField .
 *  @see  gov/nist/javax/sdp/fields/SDPField.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

function SDPField() {
    if(logger!=undefined) logger.debug("SDPField:SDPField()");
    this.classname="SDPField";
    this.fieldName=null;
}
 
SDPField.prototype = new SDPObject();
SDPField.prototype.constructor=SDPField; 

SDPField.prototype.SESSION_NAME_FIELD = "s=";
SDPField.prototype.INFORMATION_FIELD = "i=";
SDPField.prototype.EMAIL_FIELD = "e=";
SDPField.prototype.PHONE_FIELD = "p=";
SDPField.prototype.CONNECTION_FIELD = "c=";
SDPField.prototype.BANDWIDTH_FIELD = "b=";
SDPField.prototype.ORIGIN_FIELD = "o=";
SDPField.prototype.TIME_FIELD = "t=";
SDPField.prototype.KEY_FIELD = "k=";
SDPField.prototype.ATTRIBUTE_FIELD = "a=";
SDPField.prototype.VERSION_FIELD="v=";
SDPField.prototype.URI_FIELD = "u=";
SDPField.prototype.MEDIA_FIELD = "m=";
SDPField.prototype.REPEAT_FIELD = "r=";
SDPField.prototype.ZONE_FIELD = "z=";

SDPField.prototype.BASE64="base64";
SDPField.prototype.PROMPT="prompt";
SDPField.prototype.CLEAR = "clear";
SDPField.prototype.URI="URI";
SDPField.prototype.IPV4="IP4";
SDPField.prototype.IPV6="IP6";
SDPField.prototype.IN="IN";

SDPField.prototype.getFieldName =function() {
    if(logger!=undefined) logger.debug("SDPField:getFieldName()");
    return this.fieldName;
}

SDPField.prototype.setFieldName =function(fieldName) {
    if(logger!=undefined) logger.debug("SDPField:setFieldName():fieldName="+fieldName);
    this.fieldName=fieldName;
}

/** Returns the type character for the field.
 * @return the type character for the field.
 */
SDPField.prototype.getTypeChar =function() {
    if(logger!=undefined) logger.debug("SDPField:getTypeChar()");
    if (this.fieldName == null)
        return '';
    else
        return this.fieldName.charAt(0);
}