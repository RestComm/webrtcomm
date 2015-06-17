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
 *  Implementation of the JAIN-SIP AttributeField .
 *  @see  gov/nist/javax/sdp/fields/AttributeField.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

/**
 * constructor
 */
function AttributeField() {
    if(logger!=undefined) logger.debug("AttributeField:AttributeField()");
    this.classname="AttributeField";
    this.fieldName=this.ATTRIBUTE_FIELD;
    this.attribute=null;
}
 
AttributeField.prototype = new SDPField();
AttributeField.prototype.constructor=AttributeField; 

/** Returns the name of this attribute
 * @throws SdpParseException if the name is not well formatted.
 * @return a String identity or null.
 */
AttributeField.prototype.getName =function() {
    if(logger!=undefined) logger.debug("AttributeField:getName()");
    if (this.attribute == null) return null;
    else  return this.attribute.getName();   
}

/** Sets the id of this attribute.
 * @param name  the string name/id of the attribute.
 * @throws SdpException if the name is null
 */
AttributeField.prototype.setName =function(name) {
    if(typeof(name)=='string')
    {
        if(logger!=undefined) logger.debug("AttributeField:setName(): name="+name);
        if (this.attribute == null) this.attribute = new NameValue();
        this.attribute.setSeparator(Separators.prototype.COLON);
        this.attribute.setName(name);
    }
    else throw new SdpException("AttributeField.setName() requires string object argument");  
} 
 
 
/** Determines if this attribute has an associated value.
 * @throws SdpParseException if the value is not well formatted.
 * @return true if the attribute has a value.
 */
AttributeField.prototype.hasValue =function() {
    if(logger!=undefined) logger.debug("AttributeField:hasValue()");
    if (this.attribute == null)
        return false;
    else {
        var value = this.attribute.getValueAsObject();
        if (value == null)
            return false;
        else
            return true;
    }
}

/** Returns the value of this attribute.
 * @throws SdpParseException if the value is not well formatted.
 * @return the value; null if the attribute has no associated value.
 */
AttributeField.prototype.getValue =function() {
    if(logger!=undefined) logger.debug("AttributeField:getValue()");
    if (this.attribute == null)
        return null;
    else {
        var value = this.attribute.getValueAsObject();
        if (value == null)
            return null;
        else if (value instanceof String)
            return value;
        else
            return value.toString();
    }
}

/** Sets the value of this attribute.
 * @param value the - attribute value
 * @throws SdpException if the value is null.
 */
AttributeField.prototype.setValue =function(value) {
    if(logger!=undefined) logger.debug("AttributeField:setValue(): value="+value);
    if (this.attribute == null)
        this.attribute = new NameValue();
    this.attribute.setValueAsObject(value);
}

/**
 *  Get the string encoded version of this object
 * @since v1.0
 */
AttributeField.prototype.encode =function() {
    if(logger!=undefined) logger.debug("AttributeField:encode()");
    if(this.attribute ==null) throw  new SdpException("AttributeField.encode() requires name/value");
    var encoded_string = this.ATTRIBUTE_FIELD;
    encoded_string += this.attribute.encode();
    encoded_string += Separators.prototype.NEWLINE;
    return encoded_string;
}

AttributeField.prototype.equals =function(that) {
    if(logger!=undefined) logger.debug("AttributeField:equals()");
    if ( ! (that instanceof AttributeField)) return false;
    var other = that;
    return (other.attribute.getName().toLowerCase()==this.attribute.getName().toLowerCase()) &&
    this.attribute.getValueAsObject().equals(other.attribute.getValueAsObject());
}

