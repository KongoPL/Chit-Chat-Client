/**
 * Class useed for parsing links within input text
 */
export default class Linkify
{
	/**
	 * Should link be opened in new tab or not?
	 */
	public openInNewTab: boolean = false;

	/**
	 * List of link attributes. Constists of arrays where first key is attribute name and second is value
	 */
	public linkAttributes: string[][] = [];

	/**
	 * Method used for parsing links. Can be overriden, if you want specify how links should be parsed.
	 * @return string Transformed link
	 */
	public parser: ( url: string ) => string = ( url: string ): string =>
	{
		return this.parseLink( url );
	}


	/**
	 * Constructor
	 * @param openInNewTab		Should link be opened in new tab or not?
	 * @param linkAttributes	List of link attributes
	 */
	constructor( openInNewTab: boolean = false, linkAttributes: string[][] = [] )
	{
		this.openInNewTab = openInNewTab;
		this.linkAttributes = linkAttributes;
	}

	/**
	 * Parses text by addings links to it
	 * @param text	Input text
	 */
	public parse( text: string ): string
	{
		let findLinkRegex = /[-a-zA-Z0-9@:%._\+~#=\/]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/m, // Found somewhere on internet.
			linkMatches,
			processedText = '';

		while ( linkMatches = text.match( findLinkRegex ) )
		{
			let link = linkMatches[0];

			processedText += text.slice( 0, linkMatches.index ) + this.parser( link );

			text = text.slice( (linkMatches.index ?? 0) + link.length );
		}

		processedText += text;

		return processedText;
	}


	/**
	 * Default method used for parsing links
	 * @param {string} link Input link
	 * @returns {string} Parsed link
	 */
	public parseLink( link: string ): string
	{
		return '<a href="' + link + '" ' + ( this.openInNewTab ? 'target="_blank"' : '' ) + this.getAttributesString() + '>' + link + '</a>';
	}


	private getAttributesString(): string
	{
		let attrsString = '';

		for ( let attr of this.linkAttributes )
			attrsString += ' ' + attr[0] + '="' + ( attr[1].replace( /\"/gm, "\\\"" ) ) + '"';

		return attrsString;
	}
}
