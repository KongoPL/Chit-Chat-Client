import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';
import { ActivatedRoute  } from '@angular/router';
import { Message } from 'src/app/structures/Message';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/structures/User';
import { PeerService } from 'src/app/services/peer.service';
// import { Event, Scroll } from '@angular/router/src/events';
import { MaterializeService } from 'src/app/services/materialize.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { SystemMessage } from 'src/app/structures/SystemMessage';


@Component( {
	selector: 'app-chat-main',
	templateUrl: './chat-main.component.html',
	styleUrls: ['./chat-main.component.scss']
} )
export class ChatMainComponent implements OnInit, OnDestroy, AfterViewInit
{
	/**
	 * Message typed by user
	 */
	public typedMessage: string = '';

	/**
	 * List of messages, sended by all users
	 */
	private messages: Message[] = [];

	/**
	 * Is chat window scrolled to bottom (used in automatic scrolling to bottom)
	 */
	private isChatWindowScrolledToBottom: boolean = true;

	/**
	 * List of users that are on chat
	 */
	private users: string[] = [];

	/**
	 * List of profiles.
	 * Key is user ID, value is User profile
	 */
	private profiles: {[key: string]: User} = {};

	/**
	 * Contains organized messages, used to display
	 */
	public organizedMessages = new Array<Array<Message>>();

	/**
	 * Users that we should display as online, on chat
	 */
	public usersOnlineToDisplay: any = [];

	/**
	 * List of users that are incoming to chat, but we haven't all data about them yet
	 */
	private _incomingUsers: string[] = [];

	/**
	 * Subscribtion of message
	 */
	private __onMessageSubscribtion: any;

	/**
	 * Subscribtion of changing room state
	 */
	private __onRoomStateChangeSubscribtion: any;

	/**
	 * Subscribtion of receiving profile
	 */
	private __onReceiveProfileSubscribtion: any;

	/**
	 * Just environment variable reference
	 */
	public environment: any;

	@ViewChild( 'messageTextarea' ) messageTextarea!: ElementRef<HTMLElement>;
	@ViewChild( 'messagesWindow' ) messagesWindow!: ElementRef<HTMLElement>;


	constructor( private chatService: ChatService,
		private userService: UserService,
		private peerService: PeerService,
		private materializeService: MaterializeService,
		private route: ActivatedRoute,
		private router: Router
	) { }

	ngOnInit()
	{
		this.environment = environment;

		let subscribtion = this.route.params.subscribe( ( params ) =>
		{
			this.appendMessage( new SystemMessage( 'Joining to channel...' ) );

			this.chatService.join( params['id'], ( success: boolean ) =>
			{
				if ( !success )
				{
					this.router.navigate( ['main/index'] );
					this.materializeService.alertModal( 'An error occured', 'Channel does not exists!' );
				}
			} );
		} );

		this.chatService.onChatReady.subscribe( () =>
		{
			this.appendMessage( new SystemMessage( 'Joined successfully!' ) );
		} );
	}

	ngAfterViewInit()
	{
		this.bindStartupEvents();
	}

	ngOnDestroy()
	{
		this.chatService.leave();
		this.unbindStartupEvents();
	}


	sendMessage()
	{
		let messageText = this.typedMessage.slice( 0, this.typedMessage.length - 1 ).trim();

		if ( messageText.length > 0 )
		{
			this.chatService.sendMessage( messageText );
			this.appendMessage( new Message( this.peerService.getId(), this.userService.name, this.userService.avatar, messageText ) );
				
			// Scroll chat to bottom, cause he sended message
			this.scrollChatWindowToBottom();
		}

		this.typedMessage = '';
	}


	appendMessage( message: Message )
	{
		this.messages.push( message );

		this.organizeMessages();

		// Scroll chat to bottom if has scroll at bottom:
		if ( this.isChatWindowScrolledToBottom )
		{
			this.scrollChatWindowToBottom();
		}
	}


	private organizeMessages()
	{
		this.organizedMessages = [];

		let lastId : string | undefined = '',
			lastName : string | undefined = '',
			key = -1;

		for ( let c in this.messages )
		{
			let message = this.messages[c];

			if ( message.userId != lastId || message.author != lastName )
			{
				lastId = message.userId;
				lastName = message.author;
				key++;

				this.organizedMessages[key] = [];
			}

			this.organizedMessages[key].push( message );
		}
	}

	private organizeProfilesToDisplay()
	{
		this.usersOnlineToDisplay = [];

		for ( let peerId in this.profiles )
		{
			this.usersOnlineToDisplay.push( {
				isMyProfile: peerId == this.peerService.getId(),
				profile: this.profiles[peerId]
			} );
		}
	}


	private getProfile( userId: string ): User | null
	{
		return ( typeof this.profiles[userId] == 'undefined' ? null : this.profiles[userId] );
	}


	private bindStartupEvents()
	{
		// Textarea auto-resizing:
		this.messageTextarea.nativeElement.addEventListener( 'keyup', ( event: KeyboardEvent ) =>
		{
			if ( event.keyCode == 13 && !event.shiftKey )
				this.sendMessage();

			let textarea = this.messageTextarea.nativeElement;
			let currentHeight = parseFloat( textarea.style.height ),
				allowedHeight = parseFloat( textarea.style.maxHeight );

			if ( currentHeight > allowedHeight )
				textarea.style.overflowY = 'scroll';
			else
				textarea.style.overflowY = 'hidden';
		} );


		// checkin whether chat is scrolled at bottom or not:
		const messagesWindowEl = this.messagesWindow.nativeElement;
		let lastScrollPosition = messagesWindowEl.scrollTop;

		messagesWindowEl.addEventListener( 'scroll', ( e: any ) =>
		{
			let scrollDelta = ( messagesWindowEl.scrollTop - lastScrollPosition );

			if ( messagesWindowEl.scrollTop > 0 )
			{
				if ( scrollDelta < 0 )
					this.isChatWindowScrolledToBottom = false; // Scrolls to top
				else if ( messagesWindowEl.scrollHeight - Math.abs(messagesWindowEl.scrollTop) === messagesWindowEl.clientHeight ) // reached bottom
					this.isChatWindowScrolledToBottom = true;
			}

			lastScrollPosition = messagesWindowEl.scrollTop;
		} );


		setInterval( () =>
		{
			if ( this.isChatWindowScrolledToBottom )
				this.scrollChatWindowToBottom();
		}, 100 );


		// Message receiving:
		this.__onMessageSubscribtion = this.chatService.onMessage.subscribe( ( message: Message ) =>
		{
			this.appendMessage( message );
		} );


		// Room state change:
		this.__onRoomStateChangeSubscribtion = this.chatService.onRoomStateChange.subscribe( ( users: string[] ) =>
		{
			// Write info about incoming/leaving users only we know actual list of them:
			if ( this.users.length > 0 )
			{
				// Print all users that left:
				let usersLeft = this.users.filter( ( v ) => ( users.indexOf( v ) == -1 ) );

				if ( usersLeft.length > 0 )
				{
					for ( let userId of usersLeft )
					{
						let profile = this.getProfile( userId );

						if ( profile )
							this.appendMessage( new SystemMessage( profile.name + ' left...' ) );
					}
				}

				// Users that joined, will be printed later, when we receive their profile.
				let usersJoined = users.filter( ( v ) => ( this.users.indexOf( v ) == -1 ) );

				this._incomingUsers.push( ...usersJoined );
			}

			this.users = [...users]; // To lose reference

			// Also, throw unused profiles:
			let profiles: {[key: string]: User} = {};

			for ( let user of users )
				if ( this.profiles[user] )
					profiles[user] = this.profiles[user];

			this.profiles = profiles;

			this.organizeProfilesToDisplay();
		} );


		this.__onReceiveProfileSubscribtion = this.chatService.onReceiveProfile.subscribe( ( data: { userId: string, profile: User } ) =>
		{
			this.profiles[data.userId] = data.profile;

			if ( this._incomingUsers.indexOf( data.userId ) >= 0 )
			{
				let profile = this.getProfile( data.userId );

				this.appendMessage( new SystemMessage( profile!.name + ' joined...' ) );

				this._incomingUsers = this._incomingUsers.filter( ( v ) => ( v !== data.userId ) );
			}

			this.organizeProfilesToDisplay();
		} );
	}


	private unbindStartupEvents()
	{
		if ( typeof this.__onMessageSubscribtion != 'undefined' )
		{
			this.__onMessageSubscribtion.unsubscribe();
			this.__onRoomStateChangeSubscribtion.unsubscribe();
			this.__onReceiveProfileSubscribtion.unsubscribe();
		}
	}


	private scrollChatWindowToBottom()
	{
		setTimeout( () =>
		{
			this.messagesWindow.nativeElement.scrollTop = this.messagesWindow.nativeElement.scrollHeight;
		}, 0 );
	}

	
	public setDefaultAvatar($event: ErrorEvent)
	{
		($event.target as HTMLImageElement).src = environment.user.defaultAvatar;
	}
}
