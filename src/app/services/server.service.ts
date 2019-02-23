declare function io( url?: string, options?: any ): SocketIO.Socket;
//declare var io: any;

import { Injectable, EventEmitter } from '@angular/core';
import * as SocketIO from 'socket.io';
import { Channel } from 'src/app/structures/Channel';
import { Subscriber } from 'rxjs/internal/Subscriber';
import { environment } from 'src/environments/environment';
import { PeerService } from 'src/app/services/peer.service';

@Injectable({
  providedIn: 'root'
})
export class ServerService
{
	/**
	 * Event called when after requesting channel, we received him.
	 * Data is channel ID
	 */
	public onRequestChannel = new EventEmitter<string>();

	/**
	 * Event called when we joined to channel
	 * Data is Channel or null if unable to join
	 */
	public onJoinChannel = new EventEmitter<Channel>();

	/**
	 * Event called when we leaved channel
	 * Data is whether we leaved successfully or not
	 */
	public onLeaveChannel = new EventEmitter<boolean>();

	/**
	 * Event called when channel owner has been changed
	 * String is new owner ID (Peer ID)
	 */
	public onOwnerChange = new EventEmitter<string>(); 

	/**
	 * Holds socket connection with server
	 */
	private socket: SocketIO.Socket;

	private clientId: string;


	constructor( private peerService: PeerService )
	{
		this.socket = io( environment.socketServerAddr );

		this.socket.on( 'connected', this._onConnected.bind( this ) );
		this.socket.on( 'requestChannel', this._onRequestChannel.bind( this ) );
		this.socket.on( 'joinChannel', this._onJoinChannel.bind( this ) );
		this.socket.on( 'leaveChannel', this._onLeaveChannel.bind( this ) );
		this.socket.on( 'changeOwner', this._onChangeOwner.bind(this) );
		this.socket.on( 'userDisconnected', this._onUserDisconnected.bind(this) );
	}

	/**
	 * Event that will execute when we connect to the server (or when we already did this)
	 * @param callback	Callback to be called
	 */
	onConnection( callback: () => void )
	{
		if ( typeof this.clientId != 'undefined' )
			callback();
		else
			setTimeout( () => { this.onConnection( callback ); }, 50 );
	}

	/**
	 * Requests channel
	 */
	requestChannel( onChannel?: ( channelId: string ) => void )
	{
		this.socket.emit( 'requestChannel' );

		if ( typeof onChannel == 'function' )
		{
			let subscribtion = this.onRequestChannel.subscribe( ( channelId: string ) =>
			{
				onChannel( channelId );

				subscribtion.unsubscribe();
			} );
		}
	}

	/**
	 * Joins to channel
	 * @param channelId	ID of channel that we want to join
	 * @param onJoin	Callback called when we joined to channel
	 */
	joinChannel( channelId: string | Channel, onJoin: ( channel: Channel, success?: boolean ) => void )
	{
		if ( channelId instanceof Channel )
			channelId = channelId.id;

		this.socket.emit( 'joinChannel', channelId );

		let subscribtion = this.onJoinChannel.subscribe( ( channel: Channel ) =>
		{
			if ( channel && channel.id == channelId )
			{
				onJoin( channel, true );

				subscribtion.unsubscribe();
			}
			else if ( channel === null )
			{
				onJoin( null, false );

				subscribtion.unsubscribe();
			}
		} );
	}

	/**
	 * Leaves channel
	 * @param channelId	Channel ID
	 * @param onLeave	Callback called when we leaved channel
	 */
	leaveChannel( channelId: string, onLeave?: ( success: boolean ) => void )
	{
		this.socket.emit( 'leaveChannel', channelId );

		if ( typeof onLeave == 'function' )
		{
			let subscribtion = this.onLeaveChannel.subscribe( ( success: boolean ) =>
			{
				onLeave( success );

				subscribtion.unsubscribe();
			} );
		}
	}

	/**
	 * Returns client ID
	 */
	getId(): string
	{
		return this.clientId;
	}

	/**
	 * Method called when we connected with server
	 * @param clientId	Our ID
	 */
	private _onConnected( clientId: string )
	{
		this.clientId = clientId;
	}

	/**
	 * Method called when we requested channel
	 * @param channelId	Channel ID which we requested
	 */
	private _onRequestChannel( channelId: string )
	{
		this.onRequestChannel.emit( channelId );
	}

	/**
	 * Method called when we joined to the channel
	 * @param channel	Channel or NULL
	 */
	private _onJoinChannel( channel: Channel )
	{
		if ( channel )
			channel = ( new Channel() ).fromChannel( channel );

		this.onJoinChannel.emit( channel );
	}

	/**
	 * Method called when we leaved channel
	 * @param leaved	Whether we leaved channel successfully or not
	 */
	private _onLeaveChannel( leaved: boolean )
	{
		this.onLeaveChannel.emit( leaved );
	}

	/**
	 * Method called when channel's owner has been changed
	 * @param newOwner	New owner ID
	 */
	private _onChangeOwner( newOwner: string )
	{
		this.onOwnerChange.emit( newOwner );
	}

	/**
	 * Method called when user disconnects from channel that we are in
	 * @param userId	User ID that leaved channel
	 */
	private _onUserDisconnected( userId: string )
	{
		this.peerService.disconnect( userId );
	}
}
