
class Client
{
	static Instance()
	{
		if (Client._instance == null)
		{
			Client._instance = new Client();
		}
		return Client._instance;
	}

	// methods

	connect(serviceURLToConnectTo, clientName)
	{
		var client = this;

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
				client.writeLine("Could not connect to server.  Will not retry.");
				client.disconnect();
			}
		);

		this.socketToServer.on
		(
			"disconnect", 
			() =>
			{
				client.disconnect();
				client.writeLine("Client disconnected by server.");
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
		this.writeLine("Error identifying user: " + errorText);
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
		this.writeLine(messageAsString);
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
		var client = this;

		var messageBodyOrCommandText = client.readLine();

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
					client.writeLine("No server URL specified!");
				}
				else if (userName == null)
				{
					client.writeLine("No username specified!");
				}
				else
				{
					client.connect(serviceUrl, userName);
				}
			}
			else if (commandOperation == "/disconnect")
			{
				client.disconnect();
				client.writeLine("Client disconnected from server.");
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
					client.writeLine("No user names specified!");
					client.writeLine("Usage: /to @user1 @user2 This is a private message.");
				}
				else
				{
					var messageBody = commandParts.slice(i).join(" ");

					var socket = client.socketToServer;
					if (socket == null || socket.isConnected() == false)
					{
						client.writeLine("Not connected.  Use the /connect command to connect.")
					}
					else
					{
						client.messageSendToUsersWithNames(messageBody, usersToSendToNames);
					}
				}
			}
			else
			{
				client.writeLine("Unrecognized command: " + commandOperation);
				var helpTextAsLines =
				[
					"Commands",
					"========",
					"/connect <serviceURL> <username>",
					"/disconnect",
					"/to @<username> [ @<username2> ... ] <private message text>",
				];
				helpTextAsLines.forEach(x => client.writeLine(x));
			}
		}
		else
		{
			var messageBody = messageBodyOrCommandText;
			var socket = client.socketToServer;
			if (socket == null || socket.isConnected() == false)
			{
				client.writeLine("Not connected.  Use the /connect command to connect.")
			}
			else
			{
				client.messageSend(messageBody);
			}
		}
	}

	readLine()
	{
		var d = document;
		var textareaInput = d.getElementById("textareaInput");
		var lineRead = textareaInput.value;
		textareaInput.value = "";
		return lineRead;
	}

	writeLine(lineToWrite)
	{
		var d = document;
		var textareaOutput = d.getElementById("textareaOutput");
		var newline = "\n";
		textareaOutput.value += newline + lineToWrite;
	}
}
