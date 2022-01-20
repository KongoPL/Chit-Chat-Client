/**
 * Markdown parser.
 * Simple, not all things of normal markdown parser are created, but it gets job done
 */
export default class MarkDownParser
{
	/**
	 * Nesting limit (to prevent recursion)
	 */
	public nestingLimit: number = 100;

	/**
	 * Should add line breaks on end of lines?
	 */
	public breaks: boolean = true;

	/**
	 * Tags configuration. Key is tag name, value is config
	 */
	public tags: { bold: MarkdownTag, italic: MarkdownTag, horizontalRule: MarkdownTag, fencedCodeBlock: MarkdownTag, code: MarkdownTag, strikethrough: MarkdownTag } = {
		bold: new MarkdownTag( '**', 'b' ),
		italic: new MarkdownTag( '_', 'i' ),
		horizontalRule: new MarkdownTag( { tag: '---', htmlTag: 'hr', multiLine: false, standalone: true } ),
		fencedCodeBlock: new MarkdownTag( { tag: '```', htmlTag: 'pre', allowTagsWithin: false } ),
		code: new MarkdownTag( { tag: '`', htmlTag: 'pre', multiLine: false, allowTagsWithin: false } ),
		strikethrough: new MarkdownTag( ['--', '~~'], 's' )
	};

	/**
	 * Parses text
	 * @param text	Input text
	 */
	public parse( text: string ): string
	{
		// Prepare:
		text = this.toSingleLine( text );

		// Parsing:
		text = this.parseTextInternal( text, this.createFindTagsRegex() );

		// Cleanup:
		text = this.horizontalRuleCleanup( text );
		text = this.fencedCodeBlockCleanupBeforeBreaks( text );

		if ( this.breaks )
			text = text.replace( /\\n/gm, "<br>\\n" );

		text = this.fencedCodeBlockCleanupAfterBreaks( text );

		// Restoring to state before parse:
		text = this.fromSingleLine( text );

		return text;
	}

	/**
	 * Parses text internally
	 * @param text					Input text
	 * @param findMarkdownTagRegex	Regex for finding markdown tag (cause it's little expensive to get it each time via method)
	 * @param nestingLevel			Current nesting level (to prevent recursion loop)
	 */
	private parseTextInternal( text: string, findMarkdownTagRegex: RegExp, nestingLevel: number = 0 ): string
	{
		let matches = text.match( findMarkdownTagRegex ); // Matches if text contains any of regex tags (no matter whether closed or not)

		if ( !matches || nestingLevel >= this.nestingLimit )
			return text; // No markdown tags within or shouldn't be parsed

		let textBefore = matches[1], // All whats before regex tag
			parsingCode = matches[2], // All whats after regex tag, including tag
			markdownTag = matches[3]; // Markdown tag found

		let markdownTagRegex = this.escapeTextForRegex( markdownTag ),
			markdownTagConfig = this.getMarkdownTag( markdownTag ),
			markdownHtmlTags = this.getHtmlTagsForMarkdownTag( markdownTag );

		if(markdownTagConfig && markdownHtmlTags) {
			// If is standalone tag, then it doesn't need to be closed:
			if ( markdownTagConfig.standalone )
			{
				return textBefore +
					markdownHtmlTags[0] +
					markdownHtmlTags[1] +
					this.parseTextInternal( parsingCode.slice( markdownTag.length ), findMarkdownTagRegex, nestingLevel );
			}
			else
			{
				//Find closing tag:
				let closingTagFindRegex = new RegExp( markdownTagRegex + '(.*?)' + markdownTagRegex + '(.*?$)' );
				let textToParseMatch = parsingCode.match( closingTagFindRegex );

				if ( textToParseMatch ) // Has closing tag
				{
					let textBetweenMarkdownTags = textToParseMatch[1];

					// If text between tags has multiple lines and tag is not multiline, then don't parse
					if ( markdownTagConfig.multiLine == false && !textBetweenMarkdownTags.match( /\\n/ )
						|| markdownTagConfig.multiLine == true )
					{
						// Parse tags within text beetween markdown tags, if it's allowed:
						if ( markdownTagConfig.allowTagsWithin )
							textBetweenMarkdownTags = this.parseTextInternal( textBetweenMarkdownTags, findMarkdownTagRegex, nestingLevel + 1 );

						return textBefore +				// Text before markdown tag
							markdownHtmlTags[0] +		// Replaced opening markdown tag
							textBetweenMarkdownTags +	// Text between markdown tags
							markdownHtmlTags[1] +		// Replaced closing markdown tag
							this.parseTextInternal(		// Text after markdown tags to be parsed
								textToParseMatch[2], 
								findMarkdownTagRegex, 
								nestingLevel 
							);
					}
				}
			}
		}

		// Tag found, but shouldn't be parsed (no closing tag, multiline or anything else)
		return textBefore +
			markdownTag +
			this.parseTextInternal( parsingCode.slice( markdownTag.length ), findMarkdownTagRegex, nestingLevel );
	}

	/**
	 * Escapes text to be used within regex
	 * @param text	Input text
	 */
	private escapeTextForRegex( text: string ): string
	{
		let chars = text.split( '' ),
			escaped = '';

		for ( let i = 0; i < chars.length; i++ )
		{
			let char = chars[i];

			if ( /[a-zA-Z0-9]/.test( char ) )
				escaped += char;
			else
				escaped += '\\' + char;
		}

		return escaped;
	}

	/**
	 * Gets HTML tags of certain markdown tag
	 * @param markdownTag	Markdown tag
	 * @returns {string[]|null}	Array where 0 is opening tag and 1 is closing tag or null, if unable to find.
	 */
	private getHtmlTagsForMarkdownTag( markdownTag: string ): string[] | null
	{
		for ( let key in this.tags )
		{
			// @ts-ignore
			let tag: MarkdownTag = this.tags[key];

			if ( tag.tag == markdownTag
				|| Array.isArray( tag.tag ) && tag.tag.some( ( v ) => v == markdownTag ) )
				return tag.getHtmlTags();
		}

		return null;
	}

	/**
	 * Gets markdown tag by certain markdown tag
	 * @param markdownTag	Markdown tag (**, -- or something else)
	 * @return {MarkdownTag|null} MarkdownTag or null if unable to find
	 */
	private getMarkdownTag( markdownTag: string ): MarkdownTag | null
	{
		for ( let key in this.tags )
		{
			// @ts-ignore
			let tag = this.tags[key];

			if ( tag.tag == markdownTag
				|| Array.isArray( tag.tag ) && tag.tag.some( ( v: string ) => v == markdownTag ) )
				return tag;
		}

		return null;
	}

	/**
	 * Creates regex for finding markdown tags
	 */
	private createFindTagsRegex(): RegExp
	{
		let tags = this.getTagsToParse(),
			allTags = [];

		for ( let tagConfig of tags )
			if ( Array.isArray( tagConfig.tag ) )
				allTags.push( ...tagConfig.tag );
			else
				allTags.push( tagConfig.tag );

		for ( let key in allTags )
			allTags[key] = this.escapeTextForRegex( allTags[key] );

		return new RegExp( "^(.*?)((" + allTags.join( '|' ) + ").*?)$" );
	}

	/**
	 * Gets list of tags to be parsed
	 */
	private getTagsToParse(): MarkdownTag[]
	{
		let tags: MarkdownTag[] = [];

		for ( let key in this.tags )
		{
			// @ts-ignore
			let tagConfig = this.tags[key];

			if ( tagConfig.enabled )
				tags.push( tagConfig );
		}

		return tags;
	}



	/**
	 * Converts text to single line
	 * @param text	Input text
	 */
	private toSingleLine( text: string ): string
	{
		text = text.replace( /\\n/gm, "\\\/n" );
		text = text.replace( /\n/gm, "\\n" );

		return text;
	}

	/**
	 * Converts text from single line
	 * @param text Input text
	 */
	private fromSingleLine( text: string ): string
	{
		text = text.replace( /\\n/gm, "\n" );
		text = text.replace( /\\\/n/gm, "\\n" );

		return text;
	}


	/**
	 * Executes cleanup related with horizontal rule
	 * @param text	Input text
	 */
	private horizontalRuleCleanup( text: string ): string
	{
		//Also, horizontal rule can be inserted few times at once (whole line made of "-" char). Prevent this be replacing multiple on single
		let tagsCode = this.tags.horizontalRule.getHtmlTags().join( '' );
		let tagsCodeEscaped = this.escapeTextForRegex( tagsCode );

		let multipleTagsReplace = new RegExp( '(' + tagsCodeEscaped + '){1,}', 'g' ),
			additionalHorizontalRuleCharsRemove = new RegExp( '(' + tagsCodeEscaped + ')(-{1,})(\\\\n|[\\s]+|$)', 'g' ),
			newLineAfterHorizontalLineRemove = new RegExp( '(' + tagsCodeEscaped + ')\\\\n', 'g' );

		text = text.replace( multipleTagsReplace, tagsCode );
		text = text.replace( additionalHorizontalRuleCharsRemove, '$1$3' );
		text = text.replace( newLineAfterHorizontalLineRemove, '$1' );

		return text;
	}

	/**
	 * Executes cleanup related with code block before adding breaks to text
	 * @param text Input text
	 */
	private fencedCodeBlockCleanupBeforeBreaks( text: string ): string
	{
		// Also remove new line char after fenced code block
		let codeBlockTags = this.tags.fencedCodeBlock.getHtmlTags().map( ( v ) => this.escapeTextForRegex( v ) );
		let newLineFencedCodeBlockRemove = new RegExp( '(' + codeBlockTags[0] + '.*?' + codeBlockTags[1] + ')\\\\n', 'g' );

		text = text.replace( newLineFencedCodeBlockRemove, '$1' );

		return text;
	}

	/**
	 * Executes cleanup related with code block after adding breaks to text
	 * @param text Input text
	 */
	private fencedCodeBlockCleanupAfterBreaks( text: string ): string
	{
		if ( this.breaks )
		{
			// Code is placed within "pre" tags, so we have to remove all line breaks within this.
			let tags = [
				this.tags.code.htmlTag,
				this.tags.fencedCodeBlock.htmlTag
			];

			for ( let tag of tags )
			{
				let regex = new RegExp( '(<' + tag + '.*?>.*?<\/' + tag + '>)', 'g' );
				let matches = text.match( regex );

				if ( matches )
				{
					for ( let match of matches )
						text = text.replace( match, match.replace( /\<br\>/g, '' ) );
				}
			}
		}

		return text;
	}
}

export class MarkdownTag implements TMarkdownTagConfig
{
	public tag: string | string[] = '';

	/**
	 * HTML tag related with markdown tag.
	 * Examples: b, i, u, hr, a
	 */
	public htmlTag: string = '';

	/**
	 * HTML Attributes added to tag. Consists of arrays where 0 is attribute name and 1 is value
	 */
	public htmlAttrs: string[][] = [];

	/**
	 * Does tag can be with multiple lines (starts at one, end at the other)
	 */
	public multiLine: boolean = true;

	/**
	 * Does tag is standalone (doesn't need closing tag)
	 */
	public standalone: boolean = false;

	/**
	 * Does tag allow have other tags within?
	 */
	public allowTagsWithin: boolean = true;

	/**
	 * Does tag is enabled? If false, then wouldn't be parsed
	 */
	public enabled: boolean = true;

	/**
	 * Constructor
	 * @param tag		Markdown tag or configuration
	 * @param htmlTag	HTML tag related with markdown tag if first param isn't configuration
	 */
	constructor( tag: string | string[] | TMarkdownTagConfig, htmlTag?: string )
	{
		if ( typeof tag == 'object' && !Array.isArray(tag) )
			this.loadConfig( tag );
		else
			this.loadConfig( {
				tag: tag,
				htmlTag: htmlTag
			} );
	}

	/**
	 * Loads config of tag
	 * @param config	Input config
	 */
	loadConfig( config: TMarkdownTagConfig )
	{
		for ( let key in config )
			// @ts-ignore
			this[key] = config[key];
	}


	/**
	 * Gets HTML tags of markdown tag. 0 is opening tag, 1 is closing tag
	 */
	getHtmlTags(): string[]
	{
		let attrsString = '';

		for ( let attr of this.htmlAttrs )
			attrsString += ' ' + attr[0] + '="' + ( attr[1].replace( /\"/gm, "\\\"" ) ) + '"';

		return [
			'<' + this.htmlTag + attrsString + '>',
			'</' + this.htmlTag + '>',
		];
	}
}

type TMarkdownTagConfig = {
	enabled?: boolean,
	tag?: string | string[],
	htmlTag?: string,
	htmlAttrs?: Array<Array<string>>,
	multiLine?: boolean,
	standalone?: boolean,
	allowTagsWithin?: boolean
};