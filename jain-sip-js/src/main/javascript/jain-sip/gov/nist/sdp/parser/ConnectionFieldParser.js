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
 *  Implementation of the JAIN-SIP ConnectionFieldParser .
 *  @see  gov/nist/javax/sdp/parser/ConnectionFieldParser.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

/**
 * constructor
 */
function ConnectionFieldParser() {
      this.classname="ConnectionFieldParser";
}

ConnectionFieldParser.prototype = new SDPParser();
ConnectionFieldParser.prototype.constructor=ConnectionFieldParser; 

ConnectionFieldParser.prototype.parse =function(connectionFieldString) {
    if(typeof connectionFieldString == 'string')
    {
        if(logger!=undefined) logger.debug("ConnectionFieldParser:parse(): connectionFieldString="+connectionFieldString);
        this.lexer = new LexerCore("charLexer", connectionFieldString);
        try {
            this.lexer.match('c');
            this.lexer.SPorHT();
            this.lexer.match('=');
            this.lexer.SPorHT();
            var connectionField = new ConnectionField();
            this.lexer.match(LexerCore.prototype.ID);
            this.lexer.SPorHT();
            var token = this.lexer.getNextToken();
            connectionField.setNetworkType(token.getTokenValue());
            this.lexer.match(LexerCore.prototype.ID);
            this.lexer.SPorHT();
            token = this.lexer.getNextToken();
            connectionField.setAddressType(token.getTokenValue());
            this.lexer.SPorHT();
            var rest = this.lexer.getRest();
            var connectionAddress = this.parseConnectionAddress(rest.trim());
            connectionField.setAddress(connectionAddress);
            return connectionField;
        } catch(exception) { 
            throw new SdpException("ConnectionFieldParser.parse(): parsing exception:"+this.lexer.getBuffer(), this.lexer.getPtr());
        }
    }
    else throw new SdpException("ConnectionFieldParser.parse() requires string object argument");
}


ConnectionFieldParser.prototype.parseConnectionAddress =function(connectionAddressString) {
        if(logger!=undefined) logger.debug("ConnectionFieldParser:parse(): connectionAddressString="+connectionAddressString);
        var  connectionAddress = new ConnectionAddress();
        var begin = connectionAddressString.indexOf("/");
        if (begin != -1) {
            connectionAddress.setAddress(new Host(connectionAddressString.substring(0, begin)));
            var middle = connectionAddressString.indexOf("/", begin + 1);
            if (middle != -1) {
                var ttl = connectionAddressString.substring(begin + 1, middle);
                connectionAddress.setTtl(parseInt(ttl.trim()));
                var addressNumber = connectionAddressString.substring(middle + 1);
                connectionAddress.setPort(parseInt(addressNumber.trim()));
            } else {
                var ttl = connectionAddressString.substring(begin + 1);
                connectionAddress.setTtl(Integer.parseInt(ttl.trim()));
            }
        } else
            connectionAddress.setHost(new Host(connectionAddressString));
        return connectionAddress;
}
