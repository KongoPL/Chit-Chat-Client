# Chit Chat
Chit Chat is server-less chat with solutions that has been created to give you maximum of privacy. By server-less I mean that almost no data are transmitted through server - no messages, no profiles data etc. Also, it has encryption that makes it all even more safer!

[Click here to read how this works "in-depth"](/docs/HowItWorks.md)

[Click here to check server side of project](https://github.com/KongoPL/Chit-Chat-Server)

# Stack:
- [Angular ♥](https://angular.io/) (v 6.0.8)
- [Socket.IO](https://socket.io/)
- [Peer.JS](https://peerjs.com/)
- [Materialize CSS](https://materializecss.com/)
- All that written in [TypeScript](https://www.typescriptlang.org/)

# Installation
1. Download [NodeJS](https://nodejs.org/en/), [Angular](https://angular.io/cli) and [Typescript](https://www.typescriptlang.org/#download-links)
2. Download server and client
3. Go to client folder and open cmd in that catalog
4. `npm install`
5. Do the same with server
6. Go to "bin" folder in server
7. run `compile.bat`
8. run `run-server.bat` (make sure that ports 4321 and 4322 are free)
9. go to client directory
10. run `ng build` in cmd (you can also run `ng serve` and preview website at 127.0.0.1:4200)
11. If you builded application, you will find it at `./dist/chit-chat` there is builded application, ready to use. Just upload it to web server and give it a try.

# Goals of project
1. Transmit as few data to server as possible and create chat
2. Encrypt data on your own

## Additional things I learned/did
1. Big binary number calculator
2. Own way to transfer data as raw binary, transmit it and decode (in JS it's little bit tricky to do it)
3. Markdown formatting

## Contact
* Email: **contact@happy-lynx.com**

# Screenshots
![Main page](/screenshots/screenshot-1.jpg?raw=true "Main page")
![Chat window](/screenshots/screenshot-2.jpg?raw=true "Chat window")
![Sharing chat window](/screenshots/screenshot-3.jpg?raw=true "Sharing chat window")
![Chatting cheat sheet](/screenshots/screenshot-4.jpg?raw=true "Chatting cheat sheet")
![Profile management](/screenshots/screenshot-5.jpg?raw=true "Profile management")
