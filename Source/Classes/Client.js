
class Client
{
	constructor(inputStream, outputStream, messageReceive)
	{
		this.inputStream = inputStream;
		this.outputStream = outputStream;
		this._messageReceive = messageReceive;

		this.sessionEstablishCallback = null;
	}

	static Instance()
	{
		if (Client._instance == null)
		{
			var inputOutputStream =
				new InputOutputStreamUI();
			Client._instance = new Client
			(
				inputOutputStream, // inputStream
				inputOutputStream // outputStream
			);
		}
		return Client._instance;
	}

	// methods

	connect(serviceURLToConnectTo, clientName, sessionEstablishCallback)
	{
		this.sessionEstablishCallback = sessionEstablishCallback;

		var client = this;
		var outputStream = this.outputStream;

		this.serviceURL = serviceURLToConnectTo;
		this.clientName = clientName;

		if (this.socketToServer != null)
		{
			this.disconnect();
		}

		var connectionOptions =
		{
			"transports" : ["websocket"] // Prevents CORS errors.
		};

		this.socketToServer = Socket.connect
		(
			this.serviceURL, connectionOptions
		);

		this.socketToServer.on
		(
			"connected", 
			this.handleEvent_ServerConnected.bind(this)
		);

		this.socketToServer.on
		(
			"connect_error", 
			() =>
			{
				outputStream.writeLine("Could not connect to server.  Will not retry.");
				client.disconnect();
			}
		);

		this.socketToServer.on
		(
			"disconnect", 
			() =>
			{
				client.disconnect();
				outputStream.writeLine("Client disconnected by server.");
			}
		);

		this.socketToServer.on
		(
			"identificationError", 
			this.handleEvent_UserIdentificationError.bind(this)
		);
	}

	disconnect()
	{
		this.socketToServer.disconnect();
		this.socketToServer = null;
		this.session = null;
	}

	// events

	handleEvent_ServerConnected(clientID)
	{
		this.clientID = clientID;

		this.socketToServer.emit("authenticate", this.clientName);

		this.socketToServer.on
		(
			"sessionEstablished", 
			this.sessionEstablish.bind(this)
		);
	}

	handleEvent_UserIdentificationError(errorText)
	{
		this.outputStream.writeLine
		(
			"Error identifying user: " + errorText
		);
	}

	sessionEstablish()
	{
		this.session = new Session();

		this.socketToServer.on
		(
			"messageReceived", 
			this.messageReceiveSerialized.bind(this)
		);

		if (this.sessionEstablishCallback != null)
		{
			this.sessionEstablishCallback.call(this);
		}
	}

	messageReceive(messageReceived)
	{
		if (this._messageReceive == null)
		{
			var messageAsString = messageReceived.toString();
			this.outputStream.writeLine(messageAsString);
		}
		else
		{
			this._messageReceive(messageReceived);
		}
		this.session.timeLastUpdated = messageReceived.timePosted;
	}

	messageReceiveSerialized(messageReceivedSerialized)
	{
		var messageReceived =
			Message.deserialize(messageReceivedSerialized);
		this.messageReceive(messageReceived);
	}

	messageBodySend(messageBody)
	{
		this.socketToServer.emit
		(
			"newMessagePosted", [ messageBody, null ]
		);
	}

	messageBodySendToUsersWithNames(messageBody, usersAddressedNames)
	{
		messageBody = "[to " +  usersAddressedNames.join(", ") + "] " + messageBody;
		this.socketToServer.emit
		(
			"newMessagePosted", [ messageBody, usersAddressedNames ]
		);
	}

	processMessageBodyOrCommandText()
	{
		var messageBodyOrCommandText =
			this.inputStream.readLine();

		if (messageBodyOrCommandText.length == 0)
		{
			// Do nothing.
		}
		else if (messageBodyOrCommandText.startsWith("/"))
		{
			this.processMessageBodyOrCommandText_Command(messageBodyOrCommandText);
		}
		else
		{
			var messageBody = messageBodyOrCommandText;
			var socket = this.socketToServer;
			if (socket == null || socket.isConnected() == false)
			{
				this.outputStream.writeLine("Not connected.  Use the /connect command to connect.")
			}
			else
			{
				this.messageBodySend(messageBody);
			}
		}
	}

	processMessageBodyOrCommandText_Command(commandText)
	{
		var commandParts = commandText.split(" ");
		var commandOperation = commandParts[0];

		if (commandOperation == "/clear")
		{
			this.outputStream.clear();
		}
		else if (commandOperation == "/connect")
		{
			var serviceUrl = commandParts[1];
			var userName = commandParts[2];

			if (serviceUrl == null)
			{
				this.outputStream.writeLine("No server URL specified!");
			}
			else if (userName == null)
			{
				this.outputStream.writeLine("No username specified!");
			}
			else
			{
				this.connect(serviceUrl, userName);
			}
		}
		else if (commandOperation == "/disconnect")
		{
			this.disconnect();
			this.outputStream.writeLine("Client disconnected from server.");
		}
		else if (commandOperation == "/to")
		{
			this.processMessageBodyOrCommandText_Command_To(commandParts);
		}
		else
		{
			this.outputStream.writeLine("Unrecognized command: " + commandOperation);
			var helpTextAsLines =
			[
				"Commands",
				"========",
				"/clear",
				"/connect <serviceURL> <username>",
				"/disconnect",
				"/to @<username> [ @<username2> ... ] <private message text>",
			];
			helpTextAsLines.forEach(x => ioStream.writeLine(x));
		}
	}

	processMessageBodyOrCommandText_Command_To(commandParts)
	{
		var usersToSendToNames = [];
		var i;
		for (i = 1; i < commandParts.length; i++)
		{
			var commandPart = commandParts[i];
			if (commandPart.startsWith("@"))
			{
				var userName = commandPart.substr(1);
				usersToSendToNames.push(userName);
			}
			else
			{
				break;
			}
		}

		if (usersToSendToNames.length == 0)
		{
			this.outputStream.writeLine("No user names specified!");
			this.outputStream.writeLine("Usage: /to @user1 @user2 This is a private message.");
		}
		else
		{
			var messageBody = commandParts.slice(i).join(" ");

			var socket = this.socketToServer;
			if (socket == null || socket.isConnected() == false)
			{
				this.outputStream.writeLine
				(
					"Not connected.  Use the /connect command to connect."
				)
			}
			else
			{
				this.messageBodySendToUsersWithNames(messageBody, usersToSendToNames);
			}
		}
	}
}
