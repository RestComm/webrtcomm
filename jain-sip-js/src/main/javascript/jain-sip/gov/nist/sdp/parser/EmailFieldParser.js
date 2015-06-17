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
 *  Implementation of the JAIN-SIP EmailFieldParser .
 *  @see  gov/nist/javax/sdp/parser/EmailFieldParser.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

/**
 * constructor
 */
function EmailFieldParser() {
    this.classname="EmailFieldParser";
}

EmailFieldParser.prototype = new SDPParser();
EmailFieldParser.prototype.constructor=EmailFieldParser; 

EmailFieldParser.prototype.parse =function(emailFieldString) {
    if(typeof emailFieldString == 'string')
    {
        if(logger!=undefined) logger.debug("EmailFieldParser:parse(): emailFieldString="+emailFieldString);
        try {
            this.lexer = new LexerCore("charLexer", emailFieldString);
            this.lexer.match('e');
            this.lexer.SPorHT();
            this.lexer.match('=');
            this.lexer.SPorHT();

            var emailField = new EmailField();
            var rest = this.lexer.getRest();
            var displayName = this.parseDisplayName(rest.trim());
            if(displayName!=null) emailField.setDisplayName(displayName);
            emailField.setEmail(this.parseEmail(rest));
            return emailField;
        } catch(exception) { 
            throw new SdpException("EmailFieldParser.parse(): parsing exception:"+this.lexer.getBuffer(), this.lexer.getPtr());
        }
    }
    else throw new SdpException("EmailFieldParser.parse() requires string object argument");
}

EmailFieldParser.prototype.parseDisplayName =function(displayNameString) {
    var begin = displayNameString.indexOf("(");
    if(begin != -1) {
        var  end = displayNameString.indexOf(")");
        // e=mjh@isi.edu (Mark Handley)
        return displayNameString.substring(begin + 1, end);
    } else {
        // The alternative RFC822 name quoting convention
        // is also allowed for
        // email addresses. ex: e=Mark Handley <mjh@isi.edu>
        var ind = displayNameString.indexOf("<");
        if (ind != -1) {
            return displayNameString.substring(0, ind);
        } else {
        // There is no display name !!!
        }
    }
    return null;
}


EmailFieldParser.prototype.parseEmail =function(emailString) {
    var begin = emailString.indexOf("(");
    if (begin != -1) {
        // e=mjh@isi.edu (Mark Handley)
        return  emailString.substring(0, begin);
    } else {
        // The alternative RFC822 name quoting convention is
        // also allowed for
        // email addresses. ex: e=Mark Handley <mjh@isi.edu>
        var ind = emailString.indexOf("<");
        if (ind != -1) {
            var end = emailString.indexOf(">");
            return emailString.substring(ind + 1, end);
        } else {
            var i = emailString.indexOf("\n");
            if (i != -1) {
                return emailString.substring(0, i);
            } else {
               // Pb: the email is not well formatted
            }
        }
    }
    return null;
}

