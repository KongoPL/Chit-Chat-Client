## Warning
A lot of technical speaking here. If you aren't programmer, you rather won't be able to understand some of topics below.

# Simple overview
There are two servers (in-depth there are three, but it isn't important).
Server A is socket server. It's very simple server, that works via websockets.
Server B is WebRTC server. This server allows us to create peer-to-peer connection.
Also there is ICE Server, that is `stun:stun.l.google.com:19302` and is used in all this WebRTC communication.

What matters for us is server A. His responsibilities are:
- Requesting channel
- Helping with connecting to good peers on channel (cause we don't know to who we should connect)
- Notifies us when channel owner changes
- Notifies us when someone leaves channe

# Complex oveview
At the beginning we are connecting to Server A (master). Master gives us our unique ID (Client ID / Peer ID). From now, it's our unique ID, that we are using within Peer server. Thats who we are - just letters and numbers like `aybAbjAxcZ901`.

To start chatting, we need to request channel first. We ask server to give us channel. In response, server gives us channel ID to which we should join to, connect to - after this point, all data is send peer-to-peer, without knowledge of server.
Before we move to chat communication, lets speak more about server.
Server can send two other communicates to user:
1. Owner of room changed (cause we aren't sure that any of peer doesn't force to send "I'm the owner now" message)
2. Someone disconnected from channel (cause not all browsers have good WebRTC implementation) (**shame on you Firefox**)

Okay, let's talk about chatting, about peer-to-peer communication. Let's suppouse that there are two peers on channel already:
1. Jane (the owner)
2. Mark

And now you are joining. What you received from server is who is owner and all peers of channel. Event stuff goes like that:
1. Connect with everyone (Jane, Mark)
2. Request encryption key from owner (Jane)
3. Set encryption key
4. Request profile of other peers (Jane, Mark)
5. Send your profile to them

From this moment, you officially joined to channel.
During session you can send messages to other peers and also request them to update your profile (cause you maybe changed avatar or something).
When you are disconnecting from channel, all peer connections are closed and server sends to other peers that you are leaving.

## Data encryption
So...how does it work? It's simple to say, little bit harder to implement. In short it's `[your binary data] * [encryption key]`. Yes, data you are sending is converted to binary and they are multiplied by binary encryption key. I'm using 128 bit key, cause 2048 bit could take little too much time (I would have to implement multi-threading, especially when sending profile).

### How does it work in-depth?
Javascript is able to get char code at certain position and that we can convert to binary, and make it backwards.
The problem is that I don't know how long this character was in binary (8 bit or 16? 24? Or maybe 32 bit?). What I decided to do is to add binary prefix of length:
* `00` - character is 8 bit
* `01` - character is 16 bit
* `10` - character is 24 bit
* `11` - character is 32 bit

So in that case character `A` - binary `1000001` is converted to `00 01000001`.
Another example let will be `Ł` - binary `1 01000001` is converted to `01 00000001 01000001`.

After this we have binary string of data that we want to send. Also this string is prefixed with bit `1` to make sure that zero's from the beginning won't be removed.

After this we have nice binary string made up from zero's and one's. This is multiplied by another binary string - our encryption key (please don't bother me how mathematically I did it).
Now we have long, encrypted binary string. From this point, data is converted to raw binary string to minimize amount of data sended and now it is sended to another user.

When user receives data all process works the same but in reverse - convert to binary string, divide, convert from internal binary to normal string, parse and pass.