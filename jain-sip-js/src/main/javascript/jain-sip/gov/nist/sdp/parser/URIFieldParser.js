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
 *  Implementation of the JAIN-SIP URIFieldParser .
 *  @see  gov/nist/javax/sdp/parser/URIFieldParser.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

/**
 * constructor
 */
function URIFieldParser() {
    this.classname="URIFieldParser";
}

URIFieldParser.prototype = new SDPParser();
URIFieldParser.prototype.constructor=URIFieldParser; 

URIFieldParser.prototype.parse =function(uriFieldString) {
    if(typeof uriFieldString == 'string')
    {
        if(logger!=undefined) logger.debug("URIFieldParser:parse(): uriFieldString="+uriFieldString);
        try {
            this.lexer = new LexerCore("charLexer", uriFieldString);
            this.lexer.match('u');
            this.lexer.SPorHT();
            this.lexer.match('=');
            this.lexer.SPorHT();
            var uriField = new URIField();
            uriField.setURI(this.lexer.getRest().trim());
            return uriField;
        } catch(exception) { 
            throw new SdpException("URIFieldParser.parse(): parsing exception:"+this.lexer.getBuffer() + "at " + this.lexer.getPtr());
        }
    }
    else throw new SdpException("URIFieldParser.parse() requires string object argument");
}
