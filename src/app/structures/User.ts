export class User
{
	/**
	 * User name
	 */
	public name?: string;

	/**
	 * User avatar
	 */
	public avatar?: string;

	/**
	 * Loads data from array
	 * @param data	Input data
	 */
	fromArray( data: any ): User
	{
		for ( let key in data )
			// @ts-ignore
			this[key] = data[key];

		return this;
	}

	/**
	 * Converts object to array
	 */
	toArray(): { name?: string, avatar?: string }
	{
		return {
			name: this.name,
			avatar: this.avatar
		};
	}
}
