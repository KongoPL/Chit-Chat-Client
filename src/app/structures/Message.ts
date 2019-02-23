export class Message
{
	/**
	 * ID of user that created message
	 */
	public userId: string;

	/**
	 * User name
	 */
	public author: string;

	/**
	 * User avatar
	 */
	public avatar: string;

	/**
	 * Message
	 */
	public message: string;

	constructor( userId?: string, author?: string, avatar?: string, message?: string )
	{
		this.userId = userId;
		this.author = author;
		this.avatar = avatar;
		this.message = message;
	}

	/**
	 * Tells whether this message has avatar or not.
	 */
	hasAvatar()
	{
		return ( typeof this.avatar != 'undefined' && this.avatar != '' );
	}
}
