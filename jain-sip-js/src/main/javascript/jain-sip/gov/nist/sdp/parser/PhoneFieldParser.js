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
 *  Implementation of the JAIN-SIP PhoneFieldParser .
 *  @see  gov/nist/javax/sdp/parser/PhoneFieldParser.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

/**
 * constructor
 */
function PhoneFieldParser() {
    this.classname="PhoneFieldParser";
}

PhoneFieldParser.prototype = new SDPParser();
PhoneFieldParser.prototype.constructor=PhoneFieldParser; 

PhoneFieldParser.prototype.parse =function(emailFieldString) {
    if(typeof emailFieldString == 'string')
    {
        if(logger!=undefined) logger.debug("PhoneFieldParser:parse(): emailFieldString="+emailFieldString);
        try {
            this.lexer = new LexerCore("charLexer", emailFieldString);
            this.lexer.match('p');
            this.lexer.SPorHT();
            this.lexer.match('=');
            this.lexer.SPorHT();
            var  phoneField = new PhoneField();
            var rest = this.lexer.getRest();
            var displayName = this.parseDisplayName(rest.trim())
            if(displayName!=null) phoneField.setName(displayName);
            phoneField.setPhoneNumber(this.parsePhoneNumber(rest));
            return phoneField;
        } catch(exception) { 
            throw new SdpException("PhoneFieldParser.parse(): parsing exception:"+this.lexer.getBuffer() + "at " + this.lexer.getPtr());
        }
    }
    else throw new SdpException("PhoneFieldParser.parse() requires string object argument");
}


PhoneFieldParser.prototype.parseDisplayName =function(displayNamedString) {
    var begin = displayNamedString.indexOf("(");
    if (begin != -1) {
        var  end = displayNamedString.indexOf(")");
        // p=+44-171-380-7777 (Mark Handley)
        return displayNamedString.substring(begin + 1, end);
    } else {
        // The alternative RFC822 name quoting convention is
        // also allowed for
        // email addresses. ex: p=Mark Handley <+44-171-380-7777>
        var ind = displayNamedString.indexOf("<");
        if (ind != -1) {
            return displayNamedString.substring(0, ind);
        } else {
            // There is no display name !!!
            return null
        }
    }
}

PhoneFieldParser.prototype.parsePhoneNumber =function(phoneNumberString) {
    var begin = phoneNumberString.indexOf("(");
    if (begin != -1) {
        // p=+44-171-380-7777 (Mark Handley)
        return phoneNumberString.substring(0, begin).trim();
    } else {
        // The alternative RFC822 name quoting convention is also allowed for
        // email addresses. ex: p=Mark Handley <+44-171-380-7777>
        var ind = phoneNumberString.indexOf("<");
        if (ind != -1) {
            var end = phoneNumberString.indexOf(">");
            return phoneNumberString.substring(ind + 1, end);
        } else {
            // p=+44-171-380-7777
            return phoneNumberString.trim();
        }
    }
}
