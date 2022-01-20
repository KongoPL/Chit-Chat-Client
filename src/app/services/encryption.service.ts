import { Injectable } from '@angular/core';
import BigBinaryNumber from 'src/app/classes/BigBinaryNumber.class';
import MathHelper from 'src/app/classes/MathHelper.class';

@Injectable( {
	providedIn: 'root'
} )
export class EncryptionService
{
	protected globalKey: string = '';

	constructor() { }

	/**
	 * Generates encryption key
	 * @param binaryLength	Binary length of key
	 * @param setAsGlobal	Set generated key as global or not?
	 */
	public generateKey( binaryLength: number, setAsGlobal: boolean = false ): string
	{
		let hexChars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f'],
			charsCount = Math.ceil( binaryLength / 4 ),
			key = '';

		for ( let i = 0; i < charsCount; i++ )
			key += hexChars[MathHelper.rand( 0, hexChars.length - 1 )];

		if ( setAsGlobal )
			this.setGlobalKey( key );

		return key;
	}

	/**
	 * Sets global key
	 * @param val	Key to be set
	 */
	public setGlobalKey( val: string )
	{
		this.globalKey = val;
	}

	/**
	 * Gets global key
	 */
	public getGlobalKey()
	{
		return this.globalKey;
	}

	/**
	 * Encodes data with key
	 * @param data	Data to encode
	 * @param key	Key with which data have to be encrypted. If not given, then global key
	 */
	public encode( data: any, key: string = '' ): string
	{
		if ( key == '' )
			key = this.globalKey;

		data = this.toInternalBinary( JSON.stringify( data ) );

		let binaryData = new BigBinaryNumber( data ),
			binaryKey = BigBinaryNumber.fromHex( key );

		return binaryData.multiply( binaryKey ).toString();
	}

	/**
	 * Decodes data with key
	 * @param data	Data to decode
	 * @param key	Key with which data have to be decrypted. If not given, then global key
	 */
	public decode( data: string, key: string = '' ): any
	{
		if ( key == '' )
			key = this.globalKey;

		let binaryData = BigBinaryNumber.fromString( data ),
			binaryKey = BigBinaryNumber.fromHex( key );

		data = binaryData.divide( binaryKey ).toBinaryString();

		try
		{
			return JSON.parse( this.fromInternalBinary( data ) );
		}
		catch ( e )
		{
			return;
		}
	}

	/**
	 * Converts text to internal binary.
	 * @param text	Input text
	 */
	private toInternalBinary( text: string ): string
	{
		let binaryChars = [];

		for ( let i = 0; i < text.length; i++ )
		{
			let binary = text.charCodeAt( i ).toString( 2 );
			let binaryLength = Math.ceil( binary.length / 8 ) * 8;
			let binaryLengthInBinary = ( ( binaryLength / 8 ) - 1 ).toString( 2 ).padStart( 2, '0' );

			binaryChars[i] = binaryLengthInBinary + binary.padStart( binaryLength, '0' );
		}

		return '1' + binaryChars.join( '' );
	}

	/**
	 * Converts text from internal binary
	 * @param text	Input text
	 */
	private fromInternalBinary( text: string ): string
	{
		let cursor = 0,
			returnText = '';

		text = text.slice( 1 );

		while ( cursor < text.length )
		{
			let charLength = parseInt( text.slice( cursor, cursor + 2 ), 2 ) * 8 + 8;
			let charCode = parseInt( text.slice( cursor + 2, cursor + 2 + charLength ), 2 );

			returnText += String.fromCharCode( charCode );

			cursor += 2 + charLength;
		}


		return returnText;
	}
}
