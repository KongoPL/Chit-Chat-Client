import { Component, OnInit } from '@angular/core';
import { ServerService } from 'src/app/services/server.service';
import { Channel } from 'src/app/structures/Channel';
import { Router } from '@angular/router';
import { ChatService } from 'src/app/services/chat.service';

@Component( {
	selector: 'app-main-index',
	templateUrl: './main-index.component.html',
	styleUrls: ['./main-index.component.scss']
} )
export class MainIndexComponent implements OnInit
{

	constructor( private serverService: ServerService,
		private chatService: ChatService,
		private router: Router ) { }

	ngOnInit()
	{
	}

	startChat()
	{
		this.serverService.requestChannel( ( channelId: string ) =>
		{
			this.router.navigate( ['/chat', channelId] );
		} );
	}
}
