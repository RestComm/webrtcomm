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
 *  Implementation of the JAIN-SIP BandwidthFieldParser .
 *  @see  gov/nist/javax/sdp/parser/BandwidthFieldParser.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

/**
 * constructor
 */
function BandwidthFieldParser() {
      this.classname="BandwidthFieldParser";
}

BandwidthFieldParser.prototype = new SDPParser();
BandwidthFieldParser.prototype.constructor=BandwidthFieldParser; 

BandwidthFieldParser.prototype.parse =function(bandwidthFieldString) {
    if(typeof bandwidthFieldString == 'string')
    {
        if(logger!=undefined) logger.debug("BandwidthFieldParser:parse(): bandwidthFieldString="+bandwidthFieldString);
        this.lexer = new LexerCore("charLexer", bandwidthFieldString);
        try {
            this.lexer.match('b');
            this.lexer.SPorHT();
            this.lexer.match('=');
            this.lexer.SPorHT();
            var bandwidthField = new BandwidthField();
            var nameValue = this.parseNameValue(':');
            bandwidthField.setBandwidth(parseInt(nameValue.getValueAsObject()));
            bandwidthField.setType(nameValue.getName());
            this.lexer.SPorHT();
            return bandwidthField;
        } catch(exception) { 
            throw new SdpException("BandwidthFieldParser.parse(): parsing exception:"+this.lexer.getBuffer(), this.lexer.getPtr());
        }
    }
    else throw new SdpException("BandwidthFieldParser.parse() requires string object argument");
}

