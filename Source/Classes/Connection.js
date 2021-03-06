
class Connection
{
	constructor(server, clientId, socket)
	{
		this.clientId = clientId;
		this.socket = socket;

		this.socket.on
		(
			"authenticate", 
			this.handleEvent_UserIdentifyingSelf.bind(this, server)
		);
	}

	handleEvent_UserIdentifyingSelf(server, userName)
	{
		var connectionForClientId = server.connections.filter(
			x => x.clientId == this.clientId
		)[0];
		var socketToClient = connectionForClientId.socket;

		var isUserAlreadyLoggedOn = server.connections.filter(
			x => (x.user != null && x.user.name == userName)
		).length > 0;
		if (isUserAlreadyLoggedOn)
		{
			var errorMessage =
				"A user is already logged in with the name: " + userName + ".";
			socketToClient.emit(
				"identificationError", errorMessage
			);
		}
		else
		{
			this.user = new User(userName);

			socketToClient.emit("sessionEstablished");

			socketToClient.on
			(
				"newMessagePosted",
				this.messagePostedToServer.bind(this, server)
			);

			socketToClient.on
			(
				"disconnect",
				this.clientDisconnectedFromServer.bind(this, server)
			);

			var notificationMessageBody = this.user.name + " joined the server.";
			var notificationMessage = new Message(
				new Date(), "[server]", null, notificationMessageBody
			);

			var channel = server.channel;
			channel.userJoin(this.user);
			channel.messagePostThenDistribute(server, notificationMessage);
		}
	}

	clientDisconnectedFromServer(server)
	{
		var notificationMessageBody = this.user.name + " left the server.";
		var notificationMessage = new Message(
			new Date(), "[server]", null, notificationMessageBody
		);
		server.channel.messagePostThenDistribute(server, notificationMessage);
		server.connectionDisconnect(this);
	}

	messagePostedToServer(server, messageBodyThenUsersAddressedToNames)
	{
		var messageBody = messageBodyThenUsersAddressedToNames[0];
		var usersAddressedToNames = messageBodyThenUsersAddressedToNames[1];
		var now = new Date();
		var message = new Message(now, this.user.name, usersAddressedToNames, messageBody);
		var messageAsString = message.toString();
		var channel = server.channel;
		channel.messagePostThenDistribute(server, message, usersAddressedToNames);
	}

	messageSendToClient(messageToSend)
	{
		var messageSerialized = messageToSend.serialize();
		this.socket.emit("messageReceived", messageSerialized);
	}
}
