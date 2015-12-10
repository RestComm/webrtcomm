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
 *  Implementation of the JAIN-SIP SDPParserFactory .
 *  @see  gov/nist/javax/sdp/ParserFactory.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

/**
 * constructor
 */
function SDPParserFactory() {
    if(logger!=undefined) logger.debug("SDPParserFactory:SDPParserFactory()");
    this.classname="SDPParserFactory";
}

SDPParserFactory.prototype.constructor=SDPParserFactory; 
SDPParserFactory.prototype.parserTable= new Array();
SDPParserFactory.prototype.parserTable['a']= AttributeFieldParser.prototype.constructor;
SDPParserFactory.prototype.parserTable['b']= BandwidthFieldParser.prototype.constructor;
SDPParserFactory.prototype.parserTable['c']= ConnectionFieldParser.prototype.constructor;
SDPParserFactory.prototype.parserTable['e']= EmailFieldParser.prototype.constructor;
SDPParserFactory.prototype.parserTable['i']= InformationFieldParser.prototype.constructor;
SDPParserFactory.prototype.parserTable['k']= KeyFieldParser.prototype.constructor;
SDPParserFactory.prototype.parserTable['m']= MediaFieldParser.prototype.constructor;
SDPParserFactory.prototype.parserTable['o']= OriginFieldParser.prototype.constructor;
SDPParserFactory.prototype.parserTable['p']= PhoneFieldParser.prototype.constructor;
SDPParserFactory.prototype.parserTable['v']= VersionFieldParser.prototype.constructor;
SDPParserFactory.prototype.parserTable['r']= RepeatFieldParser.prototype.constructor;
SDPParserFactory.prototype.parserTable['s']= SessionNameFieldParser.prototype.constructor;
SDPParserFactory.prototype.parserTable['t']= TimeFieldParser.prototype.constructor;
SDPParserFactory.prototype.parserTable['u']= SDPParserFactory.prototype.constructor;

SDPParserFactory.prototype.createParser =function(fieldString) {
    if(typeof fieldString == 'string')
    {
        if(logger!=undefined) logger.debug("SDPParserFactory:createParser(): fieldString="+fieldString);
        try {
            var i = fieldString.indexOf(Separators.prototype.EQUALS);
            if(i == -1) throw new SdpException("SDPParserFactory.createParser(): parsing exception");
            else var fieldName = fieldString.substring(0, i).trim(); 
            if(this.parserTable[fieldName[0]]!=null)
            {
                return new  this.parserTable[fieldName[0]];
            }
            else throw new SdpException("SDPParserFactory.createParse(): could not find parser for " + fieldName)
        } catch(exception) {   
            throw new SdpException("SDPParserFactory.createParse(): could not find parser for " + fieldName)
        }
    }
    else throw new SdpException("SDPParserFactory.createParser() requires string object argument");
}