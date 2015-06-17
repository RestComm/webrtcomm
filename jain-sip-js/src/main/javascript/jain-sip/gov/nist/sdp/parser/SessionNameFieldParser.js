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
 *  Implementation of the JAIN-SIP SessionNameFieldParser .
 *  @see  gov/nist/javax/sdp/parser/SessionNameFieldParser.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

/**
 * constructor
 */
function SessionNameFieldParser() {
    this.classname="SessionNameFieldParser";
}

SessionNameFieldParser.prototype = new SDPParser();
SessionNameFieldParser.prototype.constructor=SessionNameFieldParser; 

SessionNameFieldParser.prototype.parse =function(sessionNameFieldString) {
    if(typeof sessionNameFieldString == 'string')
    {
        if(logger!=undefined) logger.debug("SessionNameFieldParser:parse(): sessionNameFieldString="+sessionNameFieldString);
        try {
            this.lexer = new LexerCore("charLexer", sessionNameFieldString);
            this.lexer.match('s');
            this.lexer.SPorHT();
            this.lexer.match('=');
            this.lexer.SPorHT();
            var sessionNameField = new SessionNameField();
            var rest = this.lexer.getRest();
            // Some endpoints may send us a blank session name ("s=") -- [rborba]
            sessionNameField.setSessionName(rest == null ? "" : rest.trim());
            return sessionNameField;
        } catch(exception) { 
            throw new SdpException("SessionNameFieldParser.parse(): parsing exception:"+this.lexer.getBuffer() + "at " + this.lexer.getPtr());
        }
    }
    else throw new SdpException("SessionNameFieldParser.parse() requires string object argument");
}
