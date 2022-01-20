import { Injectable, EventEmitter } from '@angular/core';
import { User } from 'src/app/structures/User';
import MathHelper from 'src/app/classes/MathHelper.class';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService
{
	public onProfileSave = new EventEmitter<void>();

	private data = new User;

	get name() { return this.data.name; }
	set name( val ) { this.data.name = val; this.saveProfile(); }

	get avatar() { return this.data.avatar; }
	set avatar( val ) { this.data.avatar = val; this.saveProfile(); }


	constructor()
	{
		this.loadProfile();
	}

	/**
	 * Sets settings
	 * @param settings	Settings to be set
	 */
	setSettings( settings: any )
	{
		for ( let c in settings )
			// @ts-ignore
			this.data[c] = settings[c];

		this.saveProfile();
	}

	/**
	 * Saves profile
	 */
	saveProfile()
	{
		window.localStorage.setItem( 'user-profile', JSON.stringify( this.data.toArray() ) );

		this.onProfileSave.emit();
	}

	/**
	 * Loads profile
	 */
	loadProfile()
	{
		let profile = window.localStorage.getItem( 'user-profile' ),
			profileData;

		if ( profile )
			profileData = JSON.parse( profile );
		else
			profileData = this.generateProfile();

		this.data.fromArray( profileData );

		if ( !profile )
			this.saveProfile();
	}

	/**
	 * Generates profile
	 */
	generateProfile()
	{
		let user = new User;

		user.name = this._getRandomName();
		user.avatar = environment.user.defaultAvatar;

		return user.toArray();
	}

	/**
	 * Returns profile
	 */
	getProfile()
	{
		return this.data;
	}

	/**
	 * Changes avatar
	 * @param avatarBase	Avatar image in Base64
	 * @param onChange		Callback called when avatar has been changed
	 */
	changeAvatar( avatarBase: string, onChange?: ( avatar: string ) => void )
	{
		let image = new Image();

		image.src = avatarBase;
		image.onload = () =>
		{
			let canvas = document.createElement( 'canvas' );

			canvas.width = 45;
			canvas.height = 45;

			canvas.getContext( '2d' )?.drawImage( image, 0, 0, canvas.width, canvas.height );

			let newAvatar = canvas.toDataURL();

			this.avatar = canvas.toDataURL();

			if ( typeof onChange == 'function' )
				onChange( this.avatar );
		}
	}
	
	/**
	 * Generates random user name
	 */
	private _getRandomName(): string
	{
		let names = [
			"Oliver",
			"Jake",
			"Noah",
			"James",
			"Jack",
			"Connor",
			"Liam",
			"John",
			"Harry",
			"Callum",

			"Amelia",
			"Margaret",
			"Emma",
			"Mary",
			"Olivia",
			"Samantha",
			"Patricia",
			"Isla",
			"Bethany",
			"Sophia",
		];

		let name = names[MathHelper.rand( 0, names.length - 1 )],
			number = MathHelper.rand( 0, 9999 ).toString().padStart( 4, '0' );

		return name + number;
	}
}
