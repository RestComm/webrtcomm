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
 *  Implementation of the JAIN-SIP VersionFieldParser .
 *  @see  gov/nist/javax/sdp/parser/VersionFieldParser.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

/**
 * constructor
 */
function VersionFieldParser() {
    this.classname="VersionFieldParser";
}

VersionFieldParser.prototype = new SDPParser();
VersionFieldParser.prototype.constructor=VersionFieldParser; 

VersionFieldParser.prototype.parse =function(versionFieldString) {
    if(typeof versionFieldString == 'string')
    {
        if(logger!=undefined) logger.debug("VersionFieldParser:parse(): versionFieldString="+versionFieldString);
        try {
            this.lexer = new LexerCore("charLexer", versionFieldString);
            this.lexer.match('v');
            this.lexer.SPorHT();
            this.lexer.match('=');
            this.lexer.SPorHT();

            var versionField = new VersionField();
            this.lexer.match(LexerCore.prototype.ID);
            var version = this.lexer.getNextToken();
            versionField.setVersion(parseInt(version.getTokenValue()));
            this.lexer.SPorHT();
            return versionField;
        } catch(exception) { 
            throw new SdpException("VersionFieldParser.parse(): parsing exception:"+this.lexer.getBuffer() + "at " + this.lexer.getPtr());
        }
    }
    else throw new SdpException("VersionFieldParser.parse() requires string object argument");
}
