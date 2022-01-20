/**
 * Allows to create simple math operations on big binary numbers.
 * Class does not support negative values and fractional part!
 */
export default class BigBinaryNumber
{
	/**
	 * Binaries of number. Should be array made up of 0's and 1's. First number has lowest value, last has greatest (110001 is [1,0,0,0,1,1])
	 */
	public binaries: number[];

	/**
	 * Is this value negative or not
	 */
	public isNegative: boolean;

	/**
	 * Constructor
	 * @param binaryNumber	value. Should be made up from 0's and 1's
	 */
	constructor( binaryNumber: string )
	{
		let bits: any[] = binaryNumber.split( '' ).reverse();

		bits.map( value => parseInt( value ) );

		this.binaries = bits;
		this.isNegative = false;

		this._normalize();
	}

	/**
	 * Creates binary number from hex string
	 * @param hex	Input string
	 */
	static fromHex( hex: string ): BigBinaryNumber
	{
		let hexChars: {[key: string]: string} = {
			0: '0000',
			1: '0001',
			2: '0010',
			3: '0011',
			4: '0100',
			5: '0101',
			6: '0110',
			7: '0111',
			8: '1000',
			9: '1001',
			a: '1010',
			b: '1011',
			c: '1100',
			d: '1101',
			e: '1110',
			f: '1111',
		};

		for ( let c in hexChars )
			hex = hex.replace( new RegExp( c, 'g' ), hexChars[c] );

		return new this( hex );
	}

	/**
	 * Creates binary number from binary string
	 * @param data	Input data
	 */
	static fromString( data: string ): BigBinaryNumber
	{
		let binary = '';

		for ( let i = 0; i < data.length; i++ )
		{
			let binaryValue = data.charCodeAt( i ).toString( 2 );

			binary += binaryValue.padStart( Math.ceil( binaryValue.length / 8 ) * 8, '0' );
		}

		return new this( binary );
	}

	/**
	 * Addition operation
	 * @param number	Number to add
	 * @return {self}
	 */
	add( number: BigBinaryNumber ): BigBinaryNumber
	{
		for ( let i = 0; i < number.binaries.length; i++ )
		{
			if ( typeof this.binaries[i] == 'undefined' )
				this.binaries[i] = 0;

			this.binaries[i] += number.binaries[i];
		}

		this._normalize();

		return this;
	}

	/**
	 * Substracts operation
	 * @param number			Number to add
	 * @param dismissIfNegative	Dismiss substraction if result will be negative (score will be 0 if not dismissed)
	 * @return {self|boolean} score or false if substract has been dismissed
	 */
	sub( number: BigBinaryNumber, dismissIfNegative: boolean = false ): BigBinaryNumber | false
	{
		if ( this.isGreaterEqual( number ) )
		{
			for ( let i = 0; i < number.binaries.length; i++ )
			{
				if ( typeof this.binaries[i] == 'undefined' )
					this.binaries[i] = 0;

				this.binaries[i] -= number.binaries[i];
			}

			this._normalize();
		}
		else
		{
			if ( dismissIfNegative )
				return false;
			else
			{
				this.binaries = [0]; // Does not support negative numbers
				this.isNegative = true;
			}
		}

		return this;
	}

	/**
	 * Multiplication operation
	 * @param number	Number by which we want to multiply
	 * @return {self}
	 */
	multiply( number: BigBinaryNumber ): BigBinaryNumber
	{
		let newBinary = [];
		let numberBinaries = JSON.parse( JSON.stringify( number.binaries ) ).reverse();

		for ( let i = numberBinaries.length - 1; i >= 0; i-- )
		{
			if ( numberBinaries[i] == 0 )
				continue; // Has no affect on number

			let shift = ( numberBinaries.length - 1 - i );

			for ( let j = 0; j < this.binaries.length; j++ )
			{
				let key = j + shift;

				if ( typeof newBinary[key] == 'undefined' )
					newBinary[key] = 0;

				newBinary[key] += this.binaries[j] * numberBinaries[i];
			}
		}

		for ( let i = 0; i < newBinary.length; i++ )
			if ( newBinary[i] == null )
				newBinary[i] = 0;

		this.binaries = newBinary;

		this._normalize();

		return this;
	}

	/**
	 * Division operation.
	 * Note that fractional part is not supported so 12 / 5 = 2, not 2.4
	 * 
	 * @param number	Number by which we want to divide
	 * @return {self}
	 */
	divide( number: BigBinaryNumber ): BigBinaryNumber
	{
		if ( this.isGreater( number ) )
		{
			let dividedBinary = [],
				pointer = this.binaries.length - number.binaries.length,
				operationalBinary = new BigBinaryNumber( '0' );

			while ( pointer >= 0 )
			{
				operationalBinary.setBinaries( this.binaries.slice( pointer, this.binaries.length ) );

				let bit = ( operationalBinary.sub( number, true ) === false ? 0 : 1 ),
					countOfZeros = 0,
					index = -1;

				for ( let i = 0; i < this.binaries.length - pointer; i++ )
				{
					if ( typeof operationalBinary.binaries[i] != 'undefined' )
						this.binaries[pointer + i] = operationalBinary.binaries[i];
					else
					{
						index = ( index == -1 ? pointer + i : index );
						countOfZeros++;
					}
				}

				if ( index != -1 )
					this.binaries.splice( index, countOfZeros );

				dividedBinary.unshift( bit );

				pointer--;
			}

			this.binaries = dividedBinary;
		}
		else
			// Fractional part is not supported yet
			this.binaries = [0];

		this._normalize();

		return this;
	}

	/**
	 * Tells whether number is greater than current value
	 * @param number	Number to check
	 */
	isGreater( number: BigBinaryNumber | number ): boolean
	{
		return this._isGreater( number, false );
	}

	/**
	 * Tells whether number is greater or eaqual, comapring to current value
	 * @param number	Number to check
	 */
	isGreaterEqual( number: BigBinaryNumber | number ): boolean
	{
		return this._isGreater( number, true );
	}

	/**
	 * Converts number to binary string
	 */
	toBinaryString(): string
	{
		let binaryCopy = JSON.parse( JSON.stringify( this.binaries ) );

		return binaryCopy.reverse().join( '' );
	}

	/**
	 * Converts number to string
	 */
	toString(): string
	{
		let binaryString = this.toBinaryString(),
			string = '';

		binaryString = binaryString.padStart( Math.ceil( binaryString.length / 8 ) * 8, '0' );

		for ( let i = 0; i < binaryString.length; i += 8 )
			string += String.fromCharCode( parseInt( binaryString.slice( i, 8 ), 2 ) );

		return string;
	}

	/**
	 * Set binary value of number
	 * @param binaries list of bits (key is power, value is bit) ([1,0] == 2^0 * 1 + 2^1 * 0)
	 */
	setBinaries( binaries: number[] ): void
	{
		this.binaries = binaries;
		this._normalize( true );
	}

	/**
	 * Normalizes value to be correct binary value (made of 0's and 1's)
	 * @param fastNormalize	Perform full normalization or just delete 0's from left side of binary string?
	 */
	private _normalize( fastNormalize: boolean = false )
	{
		if ( !fastNormalize )
		{
			for ( let i = 0; i < this.binaries.length; i++ )
			{
				let value = this.binaries[i];

				if ( 0 > value || value > 1 )
				{
					let nextDecimalIncrease = Math.floor( value / 2 );

					if ( typeof this.binaries[i + 1] == 'undefined' )
						this.binaries[i + 1] = 0;

					this.binaries[i + 1] += nextDecimalIncrease;
					this.binaries[i] -= nextDecimalIncrease * 2;
				}
			}
		}

		while ( this.binaries[this.binaries.length - 1] == 0 && this.binaries.length > 0 )
			this.binaries.pop();
	}

	/**
	 * Tells whether value is greater or not
	 * @param number			Input number
	 * @param equalReturnValue	What to return when values are equal
	 */
	private _isGreater( number: BigBinaryNumber | number, equalReturnValue: any )
	{
		let binaries;

		if ( typeof number == 'number' )
			binaries = number.toString( 2 ).split( '' ).reverse();
		else
			binaries = number.binaries;

		if ( this.binaries.length > binaries.length )
			return true;
		else if ( this.binaries.length < binaries.length )
			return false;
		else
		{
			for ( let i = this.binaries.length - 1; i >= 0; i-- )
			{
				if ( this.binaries[i] > binaries[i] )
					return true;
				else if ( this.binaries[i] < binaries[i] )
					return false;
			}

			return equalReturnValue; // They are equal
		}
	}
}
