export const environment = {
	_itIsProdFile: true, // Just to recognize which "environment" definition should I use.

	production: true,

	socketServerAddr: 'https://chit-chat-server-dsg7.herokuapp.com',
	peerServer: {
		host: 'chit-chat-server-dsg7-peer.herokuapp.com',
		port: '80'
	},

	encryption: {
		keyLength: 128
	},

	// User configuration:
	user: {
		defaultAvatar: '/assets/default-avatar.png'
	}
};
