export class Channel
{
	/**
	 * ID of channel
	 */
	public id: string;

	/**
	 * Owner of channel
	 */
	public owner: string;

	/**
	 * Users that are in channel.
	 * Contains array of user (peer) IDs
	 */
	public users: string[];

	/**
	 * Encyrption key used in chat
	 */
	public encryptionKey: string;

	constructor( id: string = '', owner: string = '', users: string[] = [] )
	{
		this.id = id;
		this.owner = owner;
		this.users = users;
	}


	/**
	 * Creates channel from input data
	 * @param data	Any data
	 */
	fromChannel( data: any ): Channel
	{
		for ( let c in data )
			this[c] = data[c];

		return this;
	}
}
