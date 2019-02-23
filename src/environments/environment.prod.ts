export const environment = {
	_itIsProdFile: true, // Just to recognize which "environment" definition should I use.

	production: true,

	socketServerAddr: 'http://localhost:4321',
	peerServer: {
		host: 'localhost',
		port: '4322'
	},

	encryption: {
		keyLength: 128
	},

	// User configuration:
	user: {
		defaultAvatar: '/assets/default-avatar.png'
	}
};
