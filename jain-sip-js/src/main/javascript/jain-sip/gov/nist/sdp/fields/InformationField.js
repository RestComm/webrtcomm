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
 *  Implementation of the JAIN-SIP InformationField .
 *  @see  gov/nist/javax/sdp/fields/InformationField.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

function InformationField() {
    if(logger!=undefined) logger.debug("InformationField:InformationField()");
    this.classname="InformationField";
    this.fieldName=this.INFORMATION_FIELD;
    this.information="";
}
 
InformationField.prototype = new SDPField();
InformationField.prototype.constructor=InformationField; 


InformationField.prototype.getInformation =function() {
    if(logger!=undefined) logger.debug("InformationField:getInformation()");
    return this.information;
}

InformationField.prototype.setInformation =function(info) {
    if(typeof(info) ==  'string')
    {
        if(logger!=undefined) logger.debug("InformationField:setInformation():info="+info);
        this.information = info;
    }
    else throw new SdpException("InformationField.setInformation() requires string type argument");    
}

/**
 *  Get the string encoded version of this object
 * @since v1.0
 */
InformationField.prototype.encode =function() {
    if(this.information == null) throw  new SdpException("InformationField.encode() requires information"); 
    return this.INFORMATION_FIELD + this.information + Separators.prototype.NEWLINE;
}


