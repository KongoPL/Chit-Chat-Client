import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { MaterializeService } from 'src/app/services/materialize.service';
import { environment } from 'src/environments/environment';

@Component( {
	selector: 'app-user-profile-manage',
	templateUrl: './user-profile-manage.component.html',
	styleUrls: ['./user-profile-manage.component.scss']
} )
export class UserProfileManageComponent implements OnInit
{
	private name: string;
	private avatar: string;

	@ViewChild( 'avatarInput' ) avatarInput;


	constructor(
		private userService: UserService,
		private materializeService: MaterializeService
	) { }

	ngOnInit()
	{
		this.loadSettings();
	}


	loadSettings()
	{
		this.name = this.userService.name;
		this.avatar = this.userService.avatar;
	}


	saveSettings()
	{
		this.userService.setSettings( {
			name: this.name,
			avatar: this.avatar
		} );
	}


	changeAvatar()
	{
		let files = this.avatarInput.nativeElement.files;

		if ( files.length == 1 )
		{
			let file = files[0];

			if ( file.type.startsWith( 'image/' ) )
			{
				// Seems to be image
				const reader = new FileReader();
				reader.onload = ( e: any ) =>
				{
					this.userService.changeAvatar( e.target.result, ( avatar: string ) =>
					{
						this.avatar = avatar;
					} );
				};

				reader.readAsDataURL( file );
			}
			else
				this.materializeService.alertModal( 'An error occured', 'Please select image file!' );
		}
	}


	triggerAvatarInput()
	{
		this.avatarInput.nativeElement.click();
	}
}
