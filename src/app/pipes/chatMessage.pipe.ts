import { Pipe, PipeTransform } from '@angular/core';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import MarkDownParser from 'src/app/classes/Markdown.class';
import Linkify from 'src/app/classes/Linkify.class';
import { htmlEncode } from 'js-htmlencode';

/**
 * Formats string as it was chat message
 */
@Pipe( {
	name: 'chatMessage'
} )
export class ChatMessagePipe implements PipeTransform
{
	private markdown: MarkDownParser;
	private linkify: Linkify

	constructor( private domSanitizer: DomSanitizer )
	{
		this.markdown = new MarkDownParser();

		let codeStyle = [
			'margin: 5px 0px',
			'padding: 3px',
			'display: inline-block',
			'background: #101010',
			'color: #ff3030',
			'overflow-x: auto'
		];

		this.markdown.tags.code.htmlAttrs.push( ['style', codeStyle.join( ';' )] );
		this.markdown.tags.fencedCodeBlock.htmlAttrs.push( ['style', codeStyle.join( ';' ) + ';display: block;'] );

		this.linkify = new Linkify( true, [['class', 'link']] );

		// Unable to insert youtube iframes. Reason: Angular.
		//this.linkify.parser = ( url: string ): string =>
		//{
		//	// If url points to youtube video, create iframe:
		//	let matches = url.match( /youtube\.com\/watch\?.*?v=(.*?)(&|$)/ );

		//	if ( !matches )
		//		matches = url.match( /youtu\.be\/(.*?)$/ );

		//	if ( matches )
		//	{
		//		let videoId = matches[1];

		//		return this.linkify.parseLink( url ) +
		//			'<div class="video">' +
		//			'<iframe width="280" height = "165" src="https://www.youtube.com/embed/' + videoId + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen ></iframe>' +
		//			'</div>';
		//	}

		//	return this.linkify.parseLink( url );
		//};
	}


	transform( value: string ): SafeHtml
	{
		value = htmlEncode( value );
		value = this.markdown.parse( value );
		value = this.linkify.parse( value );

		return this.domSanitizer.bypassSecurityTrustHtml( value );
	}
}
