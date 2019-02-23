/**
 * Math helper
 */
export default class MathHelper
{
	/**
	 * Generates random number within range
	 * @param min	Minimal value
	 * @param max	Maximal value
	 */
	static rand( min: number, max: number ): number
	{
		return Math.round( ( max - min ) * Math.random() + min );
	}
}
