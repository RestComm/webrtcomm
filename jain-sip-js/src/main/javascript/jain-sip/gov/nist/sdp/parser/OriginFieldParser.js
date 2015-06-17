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
 *  Implementation of the JAIN-SIP OriginFieldParser .
 *  @see  gov/nist/javax/sdp/parser/OriginFieldParser.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

/**
 * constructor
 */
function OriginFieldParser() {
    this.classname="OriginFieldParser";
}

OriginFieldParser.prototype = new SDPParser();
OriginFieldParser.prototype.constructor=OriginFieldParser; 

OriginFieldParser.prototype.parse =function(originFieldString) {
    if(typeof originFieldString == 'string')
    {
        if(logger!=undefined) logger.debug("OriginFieldParser:parse(): originFieldString="+originFieldString);
        try {
            this.lexer = new LexerCore("charLexer", originFieldString);
            var originField = new OriginField();
            this.lexer.match('o');
            this.lexer.SPorHT();
            this.lexer.match('=');
            this.lexer.SPorHT();
            var userName = this.lexer.getNextToken(' ');
            originField.setUserName(userName);
            this.lexer.SPorHT();
            this.lexer.match(LexerCore.prototype.ID);
            //lexer.ttokenSafe();
            var  sessionId = this.lexer.getNextToken();
            // guard against very long session IDs
            var sessId = sessionId.getTokenValue();
            if (sessId.length > 18) sessId = sessId.substring(sessId.length - 18);
            originField.setSessionId(sessId);
            this.lexer.SPorHT();
            this.lexer.match(LexerCore.prototype.ID);
            var sessionVersion = this.lexer.getNextToken();
            // guard against very long session Verion
            var  sessVer = sessionVersion.getTokenValue();
            if (sessVer.length > 18) sessVer = sessVer.substring(sessVer.length - 18);
            originField.setSessionVersion(sessVer);
            this.lexer.SPorHT();
            this.lexer.match(LexerCore.prototype.ID);
            var networkType = this.lexer.getNextToken();
            originField.setNetworkType(networkType.getTokenValue());
            this.lexer.SPorHT();
            this.lexer.match(LexerCore.prototype.ID);
            var  addressType = this.lexer.getNextToken();
            originField.setAddressType(addressType.getTokenValue());
            this.lexer.SPorHT();
            var  hostString = this.lexer.getRest();
            var hostNameParser = new HostNameParser(hostString);
            var host = hostNameParser.host();
            originField.setHost(host);
            return originField;
        } catch(exception) { 
            throw new SdpException("OriginFieldParser.parse(): parsing exception:"+this.lexer.getBuffer() + "at " + this.lexer.getPtr());
        }
    }
    else throw new SdpException("OriginFieldParser.parse() requires string object argument");
}
