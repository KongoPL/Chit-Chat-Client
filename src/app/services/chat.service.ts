import { Injectable, EventEmitter } from '@angular/core';
import { ServerService } from 'src/app/services/server.service';
import { Channel } from 'src/app/structures/Channel';
import { PeerService } from 'src/app/services/peer.service';
import { Message } from 'src/app/structures/Message';
import { SystemMessage } from 'src/app/structures/SystemMessage';
import { EncryptionService } from 'src/app/services/encryption.service';
import { User } from 'src/app/structures/User';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ChatService
{
	/**
	 * Event called when chat is ready (established connection, has encryption key etc. etc.)
	 */
	public onChatReady = new EventEmitter<void>();

	/**
	 * Event called when message has been received
	 */
	public onMessage = new EventEmitter<Message>();

	/**
	 * Event called when room state changes (someone joins, someone leaves)
	 */
	public onRoomStateChange = new EventEmitter<string[]>();

	/**
	 * Event called when we received someone's profile
	 */
	public onReceiveProfile = new EventEmitter<{ userId: string, profile: User }>();

	/**
	 * Channel object to which we are currently connected to.
	 * If NULL or undefined, then we aren't connected to any channel
	 */
	private channel?: Channel | null;

	/**
	 * List of users profiles that we have.
	 * Key is user ID, value is profile (User)
	 */
	private profiles: any = {};

	constructor( private serverService: ServerService,
		private peerService: PeerService,
		private encryptionService: EncryptionService,
		private userService: UserService )
	{
		// Service listeners:
		this.onReceiveProfile.subscribe( this._onReceiveProfile.bind( this ) );
		this.onChatReady.subscribe( this._onChatReady.bind( this ) );

		// User profile listeners:
		this.userService.onProfileSave.subscribe( this._onProfileSave.bind( this ) );
		
		// Server listeners:
		this.serverService.onOwnerChange.subscribe( this._onOwnerChange.bind( this ) );

		// Peer listeners:
		// @ts-ignore
		this.peerService.on( 'message', this._onMessage.bind( this ) );
		// @ts-ignore
		this.peerService.on( 'getEncryptionKey', this._onGetEncryptionKey.bind( this ) );
		// @ts-ignore
		this.peerService.on( 'setEncryptionKey', this._onSetEncryptionKey.bind( this ) );
		// @ts-ignore
		this.peerService.on( 'requestProfile', this._onRequestProfile.bind( this ) );
		// @ts-ignore
		this.peerService.on( 'setProfile', this._onSetProfile.bind( this ) );

		this.peerService.onDisconnect.subscribe( this._onDisconnect.bind( this ) );
		this.peerService.onConnect.subscribe( this._onConnection.bind( this ) );
	}

	/**
	 * Joins channel
	 * @param channelId	Channel ID to join.
	 */
	join( channelId: string, callback?: ( success: boolean ) => void )
	{
		this.serverService.joinChannel( channelId, ( channel?: Channel | null, success?: boolean ) =>
		{
			if ( channel && success )
			{
				// Set current channel:
				this.setChannel( channel );

				// Connect to all peers:
				for ( let c in channel.users )
					this.peerService.connect( channel.users[c] );

				// Claim that room state changed (new people joined)
				this.onRoomStateChange.emit( channel.users );

				const userId = this.serverService.getId();
				
				if(!userId)
					return;

				// Also send our profile to ourselves, to be displayed:
				this.onReceiveProfile.emit( {
					userId: userId,
					profile: this.userService.getProfile()
				} );

				// Request encryption key, to encrypt data:
				this.requestEncryptionKey();

				if ( typeof callback == 'function' )
					callback( true );
			}
			else if ( typeof callback == 'function' )
				callback( false );
		} );
	}

	/**
	 * Leaves current channel
	 */
	leave()
	{
		if ( this.channel instanceof Channel )
		{
			this.serverService.leaveChannel( this.channel.id );
			this.peerService.disconnectAll();

			this.channel = null;
		}
	}

	/**
	 * Sends message to all chat members
	 * @param message	Message to send
	 */
	sendMessage( message: string )
	{
		this.peerService.broadcast( 'message', message );
	}

	/**
	 * Requests profile
	 * @param peerId	If given, then asks certain peer
	 */
	requestProfile( peerId?: string )
	{
		if(!this.channel)
			return;

		let peersToCheck = ( typeof peerId == 'string' ? [peerId] : this.channel.users );
		let isConnectedToEveryone = this.channel.users.every( ( id: string ) => { return this.peerService.isConnectedTo( id ); } );

		if ( isConnectedToEveryone )
		{
			if ( typeof peerId == 'string' )
				this.peerService.send( peerId, 'requestProfile' );
			else
				this.peerService.broadcast( 'requestProfile' );
		}
		else
			setTimeout( () => { this.requestProfile(); }, 50 );
	}

	/**
	 * Sends profile
	 * @param peerId	If given, then sends profile to certain user
	 */
	sendProfile( peerId?: string )
	{
		if(!this.channel)
			return;

		let peersToCheck = ( typeof peerId == 'string' ? [peerId] : this.channel.users );
		let isConnectedToPeers = this.channel.users.every( ( id: string ) => { return this.peerService.isConnectedTo( id ); } );

		if ( isConnectedToPeers )
		{
			if ( typeof peerId == 'string' )
				this.peerService.send( peerId, 'setProfile', this.userService.getProfile() );
			else
				this.peerService.broadcast( 'setProfile', this.userService.getProfile() );
		}
		else
			setTimeout( () => { this.sendProfile(); }, 50 );
	}

	/**
	 * Tells whether we are owner of chat or not
	 */
	isOwner(): boolean
	{
		return ( !!this.channel && this.channel.owner == this.peerService.getId() );
	}

	/**
	 * Tells whether we are chatting or not
	 */
	isChatting(): boolean
	{
		return ( this.channel instanceof Channel );
	}

	/**
	 * Gets profile of certain user.
	 * @param peerId
	 * @returns {User|null}	User object if has profile, NULL otherwise
	 */
	private getProfile( peerId: string ): User | null
	{
		return ( typeof this.profiles[peerId] == 'undefined' ? null : this.profiles[peerId] );
	}

	/**
	 * Sets channel in which we are chatting
	 * @param channel
	 */
	private setChannel( channel: Channel )
	{
		this.channel = channel;
	}

	/**
	 * Requests encryption key or generates if we are owner of channel
	 */
	private requestEncryptionKey()
	{
		if(!this.channel)
			return;

		// If we are owner of the channel, then generate it.
		if ( this.isOwner() )
		{
			let key = this.encryptionService.generateKey( environment.encryption.keyLength, true );

			this._onSetEncryptionKey( this.channel.owner, key );
		}
		else
		{
			if ( this.peerService.isConnectedTo( this.channel.owner ) )
				this.peerService.sendUnencoded( this.channel.owner, 'getEncryptionKey' );
			else
			{
				let subscribtion = this.peerService.onConnect.subscribe( ( peerId ) =>
				{
					if ( this.channel && peerId == this.channel.owner )
					{
						this.requestEncryptionKey();

						subscribtion.unsubscribe();
					}
				} );
			}
		}
	}


	/**
	 * Method called when user profile has been received
	 * @param data	Event data
	 */
	private _onReceiveProfile( data: { userId: string, profile: User } )
	{
		this.profiles[data.userId] = data.profile;
	}

	/**
	 * Method called when our profile has been saved
	 */
	private _onProfileSave()
	{
		if ( this.channel instanceof Channel )
			this.sendProfile();
	}


	/**
	 * Method called when room owner changed
	 * @param owner	New owner (User ID)
	 */
	private _onOwnerChange( owner: string )
	{
		if ( this.channel )
			this.channel.owner = owner;
	}


	/**
	 * Method called on receiving message
	 * @param author	User ID
	 * @param message	Message
	 */
	private _onMessage( author: string, message: string )
	{
		let profile: User | null;

		if ( profile = this.getProfile( author ) )
		{
			let messageObject = new Message( author, profile.name, profile.avatar, message );

			this.onMessage.emit( messageObject );
		}
	}

	/**
	 * Method called when someone requested encryption key from us
	 * @param peerId	User ID
	 */
	private _onGetEncryptionKey( peerId: string )
	{
		if(!this.channel)
			return;

		this.peerService.sendUnencoded( peerId, 'setEncryptionKey', this.channel.encryptionKey );
	}

	/**
	 * Method called when we have been requested to set encryption key
	 * @param author	User ID
	 * @param key		Encryption key
	 */
	private _onSetEncryptionKey( author: string, key: string )
	{
		// Allow to set only if comes from channel owner:
		if ( this.channel && author == this.channel.owner )
		{
			this.channel.encryptionKey = key;
			this.encryptionService.setGlobalKey( key );

			this.onChatReady.emit();
		}
	}

	/**
	 * Method called when someone requested profile from us
	 * @param peerId	User ID
	 */
	private _onRequestProfile( peerId: string )
	{
		this.sendProfile( peerId );
	}

	/**
	 * Method called when someone requested to set his profile
	 * @param peerId	User ID
	 * @param profile	User profile
	 */
	private _onSetProfile( peerId: string, profile: any )
	{
		this.onReceiveProfile.emit( {
			userId: peerId,
			profile: new User().fromArray( profile )
		} )
	}

	/**
	 * Method called when someone disconnects from chat
	 * @param peerId	User ID
	 */
	private _onDisconnect( peerId: string )
	{
		if(!this.channel)
			return;

		this.channel.users = this.channel.users.filter( id => ( id != peerId ) );

		this.onRoomStateChange.emit( this.channel.users );
	}

	/**
	 * Method called when someone joined to chat
	 * @param peerId	User ID
	 */
	private _onConnection( peerId: string )
	{
		if(!this.channel)
			return;

		if ( !this.channel.users.includes( peerId ) )
			this.channel.users.push( peerId );

		this.onRoomStateChange.emit( this.channel.users );
	}

	/**
	 * Method called when chat is ready
	 */
	private _onChatReady()
	{
		this.requestProfile();
		this.sendProfile();
	}
}
