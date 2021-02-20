
class Client
{
	constructor(inputOutputStream)
	{
		this.inputOutputStream = inputOutputStream;
	}

	static Instance()
	{
		if (Client._instance == null)
		{
			Client._instance = new Client
			(
				new InputOutputStreamUI()
			);
		}
		return Client._instance;
	}

	// methods

	connect(serviceURLToConnectTo, clientName)
	{
		var client = this;
		var ioStream = this.inputOutputStream;

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
				ioStream.writeLine("Could not connect to server.  Will not retry.");
				client.disconnect();
			}
		);

		this.socketToServer.on
		(
			"disconnect", 
			() =>
			{
				client.disconnect();
				ioStream.writeLine("Client disconnected by server.");
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
			this.handleEvent_SessionEstablished.bind(this)
		);
	}

	handleEvent_UserIdentificationError(errorText)
	{
		this.inputOutputStream.writeLine
		(
			"Error identifying user: " + errorText
		);
	}

	handleEvent_SessionEstablished()
	{
		this.session = new Session();

		this.socketToServer.on
		(
			"messageReceived", 
			this.handleEvent_MessageReceived.bind(this)
		);
	}

	handleEvent_MessageReceived(messageReceivedSerialized)
	{
		var messageReceived =
			Message.deserialize(messageReceivedSerialized);
		var messageAsString = messageReceived.toString();
		this.inputOutputStream.writeLine(messageAsString);
		this.session.timeLastUpdated = messageReceived.timePosted;
	}

	messageSend(messageBody)
	{
		this.socketToServer.emit
		(
			"newMessagePosted", [ messageBody, null ]
		);
	}

	messageSendToUsersWithNames(messageBody, usersAddressedNames)
	{
		messageBody = "[to " +  usersAddressedNames.join(", ") + "] " + messageBody;
		this.socketToServer.emit
		(
			"newMessagePosted", [ messageBody, usersAddressedNames ]
		);
	}

	processMessageBodyOrCommandText()
	{
		var ioStream = this.inputOutputStream;

		var messageBodyOrCommandText = ioStream.readLine();

		if (messageBodyOrCommandText.length == 0)
		{
			// Do nothing.
		}
		else if (messageBodyOrCommandText.startsWith("/"))
		{
			var commandText = messageBodyOrCommandText;
			var commandParts = commandText.split(" ");
			var commandOperation = commandParts[0];

			if (commandOperation == "/connect")
			{
				var serviceUrl = commandParts[1];
				var userName = commandParts[2];

				if (serviceUrl == null)
				{
					ioStream.writeLine("No server URL specified!");
				}
				else if (userName == null)
				{
					ioStream.writeLine("No username specified!");
				}
				else
				{
					this.connect(serviceUrl, userName);
				}
			}
			else if (commandOperation == "/disconnect")
			{
				this.disconnect();
				ioStream.writeLine("Client disconnected from server.");
			}
			else if (commandOperation == "/to")
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
					ioStream.writeLine("No user names specified!");
					ioStream.writeLine("Usage: /to @user1 @user2 This is a private message.");
				}
				else
				{
					var messageBody = commandParts.slice(i).join(" ");

					var socket = client.socketToServer;
					if (socket == null || socket.isConnected() == false)
					{
						ioStream.writeLine("Not connected.  Use the /connect command to connect.")
					}
					else
					{
						this.messageSendToUsersWithNames(messageBody, usersToSendToNames);
					}
				}
			}
			else
			{
				ioStream.writeLine("Unrecognized command: " + commandOperation);
				var helpTextAsLines =
				[
					"Commands",
					"========",
					"/connect <serviceURL> <username>",
					"/disconnect",
					"/to @<username> [ @<username2> ... ] <private message text>",
				];
				helpTextAsLines.forEach(x => ioStream.writeLine(x));
			}
		}
		else
		{
			var messageBody = messageBodyOrCommandText;
			var socket = this.socketToServer;
			if (socket == null || socket.isConnected() == false)
			{
				ioStream.writeLine("Not connected.  Use the /connect command to connect.")
			}
			else
			{
				this.messageSend(messageBody);
			}
		}
	}
}
