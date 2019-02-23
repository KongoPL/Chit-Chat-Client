import { Component } from '@angular/core';
import { ServerService } from 'src/app/services/server.service';
import { ChatService } from 'src/app/services/chat.service';
import { PeerService } from 'src/app/services/peer.service';
import { MaterializeService } from 'src/app/services/materialize.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent
{
	constructor( private serverService: ServerService,
		private materializeService: MaterializeService,
		private peerService: PeerService,
		private chatService: ChatService,
		private userService: UserService )
	{
		this.serverService.onConnection( () =>
		{
			this.peerService.init( this.serverService.getId() );
		} );
	}


	isChatting(): boolean
	{
		return this.chatService.isChatting();
	}
}
