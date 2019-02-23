import { Message } from "src/app/structures/Message";

/**
 * System message object.
 */
export class SystemMessage extends Message
{
	constructor( message?: string )
	{
		super( '...', 'Chit Chat System' );

		this.message = message;
	}
}
