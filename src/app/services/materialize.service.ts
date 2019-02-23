import { Injectable } from '@angular/core';

declare var M: any; // Materialize

@Injectable( {
	providedIn: 'root'
} )
export class MaterializeService
{
	constructor()
	{
		let waitingTimeout = null;

		var observer = new MutationObserver( ( mutationsList, observer ) =>
		{
			if ( waitingTimeout !== null )
				clearTimeout( waitingTimeout );

			waitingTimeout = setTimeout( () => {
				this.initializeMaterialize();

				waitingTimeout = null;
			}, 150 );
		} );

		// Start observing the target node for configured mutations
		observer.observe( document.body, {
			attributes: true,
			childList: true,
			subtree: true
		} );
	}

	/**
	 * Gets Sidenav plugin
	 * @param element	HTML element which should be Sidenav
	 */
	public getSidenav( element: HTMLElement ): any
	{
		return this.getPlugin( 'Sidenav', element );
	}

	/**
	 * Gets Modal plugin
	 * @param element	HTML element which should be Modal
	 */
	public getModal( element: HTMLElement ): any
	{
		return this.getPlugin( 'Modal', element );
	}

	/**
	 * Gets Select plugin
	 * @param element	HTML element which should be Select
	 */
	public getSelect( element: HTMLElement ): any
	{
		return this.getPlugin( 'FormSelect', element );
	}

	/**
	 * Creates alert modal
	 * @param header	Header of modal
	 * @param content	Content of modal. Can be HTML.
	 */
	public alertModal( header: string, content: string )
	{
		let modalElement = document.createElement( 'div' );

		modalElement.className = 'modal';
		modalElement.innerHTML =
			'<div class="modal-content">' +
				'<h4>' + header + '</h4>' +
				'<p>'+content+'</p>'+
			'</div>' +
			'<div class="modal-footer">' +
				'<a class="modal-close btn waves-effect">Close</a>'+
			'</div>';

		document.body.appendChild( modalElement );

		this.initializeMaterialize();
		this.openModal( modalElement );
	}

	/**
	 * Opens modal
	 * @param element	Element which we want to open. Have to be modal.
	 */
	public openModal( element: HTMLElement )
	{
		var modal = this.getModal( element );

		if ( modal !== null )
			modal.open();
	}

	/**
	 * Closes modal
	 * @param element	Element which we want to close. Have to be modal.
	 */
	public closeModal( element: HTMLElement )
	{
		var modal = this.getModal( element );

		if ( modal !== null )
			modal.close();
	}

	/**
	 * Updates inputs behaviour.
	 * Sometimes input have value, but label isn't in right place, so this method fixes that.
	 * @param asyncWait	Wait with fixing this to the end of execution loop or do it right now?
	 */
	public updateInputs( asyncWait: boolean = true )
	{
		if ( asyncWait )
		{
			// Sometimes when you pass object to form, it's not yet in this form, so better wait to the end of execution loop with this...
			setTimeout( () =>
			{
				M.updateTextFields();
			}, 0 );
		}
		else
			M.updateTextFields();
	}

	/**
	 * Updates selects behaviour.
	 * Sometimes select doesn't work, so this method fixes that.
	 * @param select	HTML element to be fixed. Should be select
	 */
	public updateSelect( select: HTMLElement )
	{
		setTimeout( () =>
		{
			M.FormSelect.init( select );
		}, 0 );
	}

	/**
	 * Creates toast message
	 * @param config	Input config of toast
	 */
	public toast( config: { html: string, displayLength?: number, inDuration?: number, outDuration?: number, classes?: string, completeCallback?: () => void, activationPercent?: number } )
	{
		M.toast( config );
	}

	/**
	 * Initializes materialize on DOM elements
	 */
	protected initializeMaterialize()
	{
		let root = document.body;
		let registry = {
			Autocomplete: root.querySelectorAll( '.autocomplete:not(.no-autoinit)' ),
			Carousel: root.querySelectorAll( '.carousel:not(.no-autoinit)' ),
			Chips: root.querySelectorAll( '.chips:not(.no-autoinit)' ),
			Collapsible: root.querySelectorAll( '.collapsible:not(.no-autoinit)' ),
			Datepicker: root.querySelectorAll( '.datepicker:not(.no-autoinit)' ),
			Dropdown: root.querySelectorAll( '.dropdown-trigger:not(.no-autoinit):not(.select-dropdown)' ),
			Materialbox: root.querySelectorAll( '.materialboxed:not(.no-autoinit)' ),
			Modal: root.querySelectorAll( '.modal:not(.no-autoinit)' ),
			Parallax: root.querySelectorAll( '.parallax:not(.no-autoinit)' ),
			Pushpin: root.querySelectorAll( '.pushpin:not(.no-autoinit)' ),
			ScrollSpy: root.querySelectorAll( '.scrollspy:not(.no-autoinit)' ),
			FormSelect: root.querySelectorAll( 'select:not(.no-autoinit)' ),
			Sidenav: root.querySelectorAll( '.sidenav:not(.no-autoinit)' ),
			Tabs: root.querySelectorAll( '.tabs:not(.no-autoinit)' ),
			TapTarget: root.querySelectorAll( '.tap-target:not(.no-autoinit)' ),
			Timepicker: root.querySelectorAll( '.timepicker:not(.no-autoinit)' ),
			Tooltip: root.querySelectorAll( '.tooltipped:not(.no-autoinit)' ),
			FloatingActionButton: root.querySelectorAll( '.fixed-action-btn:not(.no-autoinit)' )
		};

		for ( var pluginName in registry )
		{
			var plugin = M[pluginName];

			plugin.init( registry[pluginName] );

			registry[pluginName].forEach( function ( obj )
			{
				obj.className += ' no-autoinit';
			} );
		}
	}

	/**
	 * Gets certain Materialize plugin
	 * @param pluginName	Plugin which we want to get
	 * @param element		Element from which we want to get plugin
	 */
	private getPlugin( pluginName: string, element: any ): any
	{
		var keyName = 'M_' + pluginName;

		if ( typeof element[keyName] !== 'undefined' )
		{
			return element[keyName];
		}
		else
		{
			return null;
		}
	}
}
