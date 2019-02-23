declare var Peer;
declare class DataConnection
{
	peer: string;
	open: boolean;

	on( eventName: string, callback: ( data: any ) => void );
	close();
};

import { Injectable, EventEmitter } from '@angular/core';
import { EncryptionService } from 'src/app/services/encryption.service';
import { environment } from 'src/environments/environment';

@Injectable( {
	providedIn: 'root'
} )
export class PeerService
{
	public onDisconnect = new EventEmitter<string>();
	public onConnect = new EventEmitter<string>();

	private peer: any; // Peer
	private peerId: string;
	private isConnected: boolean = false;

	private connectedPeers: DataConnection[];
	private listeners: any = {};

	constructor( private encryptionService: EncryptionService )
	{
		this.connectedPeers = [];
	}

	/**
	 * Initializes peer service.
	 * @param clientId	Id of my client
	 */
	public init( clientId: string )
	{
		this.peerId = clientId;

		this.peer = new Peer( this.peerId, {
			host: environment.peerServer.host,
			port: environment.peerServer.port,
			//debug: 3
		} );

		this.peer.on( 'open', () =>
		{
			this.isConnected = true;
		} );

		this.peer.on( 'connection', ( connection ) => // Called when someone connects to us
		{
			this.setupPeerConnection( connection );
		} );
	}

	/**
	 * Connects to other peer.
	 * When connected "onConnect" event will be triggered with this Peer ID
	 * 
	 * @param otherPeerId	Peer ID
	 */
	public connect( otherPeerId: string )
	{
		if ( this.getId() == otherPeerId )
			return;

		if ( this.isInitialized() )
			this.setupPeerConnection( this.peer.connect( otherPeerId ) );
		else
			setTimeout( () =>
			{
				this.connect( otherPeerId );
			}, 50 );
	}

	/**
	 * Disconnects with certain peer
	 * @param peerId	Peer ID
	 */
	public disconnect( peerId: string )
	{
		if ( this.connectedPeers[peerId] )
		{
			this.connectedPeers[peerId].close();

			return true;
		}


		return false;
	}

	/**
	 * Disconnects from all connected peers
	 */
	public disconnectAll()
	{
		for ( let c in this.connectedPeers )
		{
			this.connectedPeers[c].close();
		}
	}

	/**
	 * Sends data to certain peer
	 * @param peerId		Peer ID
	 * @param eventName		Event name
	 * @param data			Data passed to event
	 */
	public send( peerId: string, eventName: string, ...data: any[] ): boolean
	{
		//console.log( 'out', eventName, data );

		return this._send( peerId, this.createDataObject( eventName, data ) );
	}

	/**
	 * Sends unencoded data to certain peer
	 * @param peerId		Peer ID
	 * @param eventName		Event name
	 * @param data			Data passed to event
	 */
	public sendUnencoded( peerId: string, eventName: string, ...data: any[] )
	{
		//console.log( 'out', eventName, data );

		this._send( peerId, this.createDataObject( eventName, data ), false );
	}

	/**
	 * Broadcasts data to all peers
	 * @param eventName		Event name
	 * @param data			Data passed to event
	 */
	public broadcast( eventName: string, ...data: any[] )
	{
		//console.log( 'out', eventName, data );

		this._broadcast( this.createDataObject( eventName, data ) );
	}

	/**
	 * Broadcasts unencoded data to all peers
	 * @param eventName		Event name
	 * @param data			Data passed to event
	 */
	public broadcastUnencoded( eventName: string, ...data: any[] )
	{
		//console.log( 'out', eventName, data );

		this._broadcast( this.createDataObject( eventName, data ), false );
	}

	/**
	 * Add listener on certain event
	 * @param eventName	Event name to which listen to
	 * @param callback	Callback to call, when event has been triggered
	 */
	public on( eventName: string, callback: ( peerId?: string, ...data: any[] ) => void )
	{
		if ( typeof this.listeners[eventName] != 'object' )
			this.listeners[eventName] = [];

		this.listeners[eventName].push( {
			callback: callback
		} );
	}

	/**
	 * Tells whether we are connected to certain peer or not
	 * @param peerId	Peer ID
	 */
	public isConnectedTo( peerId: string ): boolean
	{
		return ( typeof this.connectedPeers[peerId] != 'undefined' && this.connectedPeers[peerId].open || this.peerId == peerId );
	}

	/**
	 * Returns our Peer ID
	 */
	public getId()
	{
		return this.peerId;
	}

	/**
	 * Setups peer connection, when someone connects to us or we connect to someone
	 * @param connection	Connection data
	 */
	private setupPeerConnection( connection: DataConnection )
	{
		this.connectedPeers[connection.peer] = connection;

		connection.on( 'open', () =>
		{
			this.onConnect.emit( connection.peer );
		} );

		connection.on( 'close', () =>
		{
			this.onDisconnect.emit( connection.peer );

			delete this.connectedPeers[connection.peer];
		} );

		connection.on( 'data', ( request: any ) =>
		{
			let isEncoded = ( typeof request == 'string' );

			if ( isEncoded )
				request = this.encryptionService.decode( request );

			//console.log( 'inc', request );

			if ( typeof request == 'object' )
			{
				let eventName = request.eventName,
					data = request.data;

				data.unshift( connection.peer );

				this._triggerListeners( eventName, data );
			}
			else
				console.error( "Unable to decode data!" );
		} );
	}

	/**
	 * Creates data object that is sended to another peer
	 * @param eventName	Event name
	 * @param data		Data passed to event
	 */
	private createDataObject( eventName: string, data: any )
	{
		return {
			eventName: eventName,
			data: data
		};
	}

	/**
	 * Internal sending data to certain peer
	 * @param peerId	Peer ID to which we are sending data
	 * @param data		Data that we send to peer
	 * @param encode	Encode data or not?
	 */
	private _send( peerId: string, data: any, encode: boolean = true ): boolean
	{
		if ( this.isConnectedTo( peerId ) )
		{
			if ( encode )
				data = this.encryptionService.encode( data );

			this.connectedPeers[peerId].send( data );

			return true;
		}
		else
			return false;
	}

	/**
	 * Internal sending data to all peers
	 * @param data		Data that we send to peer
	 * @param encode	Encode data or not?
	 */
	private _broadcast( data: any, encode: boolean = true )
	{
		// By encoding data once and saying to not encode it, we save lot of time

		if ( encode )
			data = this.encryptionService.encode( data );

		for ( let peerId in this.connectedPeers )
			this._send( peerId, data, false );
	}

	/**
	 * Triggers listeners of certain event
	 * @param eventName	Event to be triggered
	 * @param data		Data passed to callbacks
	 */
	private _triggerListeners( eventName: string, data: any )
	{
		if ( typeof this.listeners[eventName] != 'undefined' )
		{
			for ( let c in this.listeners[eventName] )
				this.listeners[eventName][c].callback( data.shift(), ...data );
		}
	}

	/**
	 * Tells whether service is initialized or not
	 */
	private isInitialized(): boolean
	{
		return ( this.peerId != 'undefined' && this.isConnected );
	}
}
