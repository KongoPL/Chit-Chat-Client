export const environment = {
	_itIsProdFile: true, // Just to recognize which "environment" definition should I use.

	production: true,

	socketServerAddr: 'https://chit-chat-server-dsg7.herokuapp.com',
	peerServer: {
		host: '0.peerjs.com',
		port: '443',
		secure: true,
	},

	encryption: {
		keyLength: 128
	},

	// User configuration:
	user: {
		defaultAvatar: '/chit-chat-demo/assets/default-avatar.png'
	}
};
