Chat Server and Client
======================

The code in this repository implements a rudimentary chat server and client in JavaScript, running in Node.JS and the browser.

<img src="Screenshot.png"></img>

Running
-------

	1. Make sure Node.JS is installed.
	2. From within the Source directory, open a command prompt and run the commands "npm install socket.io" and "npm install socket.io-client".
	3. Still within the Source directory, run the command "node Server.js" to run the chat server listening at the default url ("http://localhost:8089").
	4. In a web browser, open the Client.html.
	5. In the client, adjust the default connect command if necessary to use a unique username, and click the "Send" button to connect to the server.
	6. Type a message to send it to other users on the chat server.
