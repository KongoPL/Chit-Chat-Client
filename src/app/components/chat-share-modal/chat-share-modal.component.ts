import { Component, OnInit } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component( {
	selector: 'app-chat-share-modal',
	templateUrl: './chat-share-modal.component.html',
	styleUrls: ['./chat-share-modal.component.scss']
} )
export class ChatShareModalComponent implements OnInit
{
	constructor( private chatService: ChatService, private router: Router, private location: Location ) { }

	ngOnInit()
	{
	}


	public getChatLink()
	{
		return window.location.origin + this.router.url;
	}
}
