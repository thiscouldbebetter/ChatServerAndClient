
class Channel
{
	constructor()
	{
		this.usersConnectedNames = [];
	}

	connectionsForUsersWithNames(server, userNames)
	{
		var returnValues = [];
		var serverConnections = server.connections;
		for (var i = 0; i < userNames.length; i++)
		{
			var userName = userNames[i];
			var connection = serverConnections.filter(x => x.user.name == userName)[0];
			returnValues.push(connection);
		}
		return returnValues;
	}

	messagePostThenDistribute(server, messageToPost)
	{
		console.log(messageToPost.toString());

		var usersAddressedNames = messageToPost.usersAddressedNames;

		var userNamesToSendTo = null;
		if (usersAddressedNames == null)
		{
			userNamesToSendTo = this.usersConnectedNames;
		}
		else
		{
			userNamesToSendTo = usersAddressedNames;
			userNamesToSendTo.push(messageToPost.userSenderName);
		}

		var connectionsToSendTo =
			this.connectionsForUsersWithNames(server, userNamesToSendTo);

		var areAnyAddresseesNonexistent = connectionsToSendTo.some(x => x == null);
		if (areAnyAddresseesNonexistent)
		{
			var userSenderName = messageToPost.userSenderName;
			var connectionForSender =
				connectionsToSendTo.filter(x => x != null && x.user.name == userSenderName)[0];
			var usersNonexistentNames =
				connectionsToSendTo.map
				(
					(x, i) => (x == null ? userNamesToSendTo[i] : null)
				).filter
				(
					x => x != null
				);
			var messageNoSuchUserBody =
				"[to " + userSenderName + "] No such user(s): " + usersNonexistentNames.join(", ") + ".";
			var messageNoSuchUser = new Message(
				new Date(), "[server]", null, messageNoSuchUserBody
			);
			connectionForSender.messageSendToClient(messageNoSuchUser);
		}

		var connectionsActual = connectionsToSendTo.filter(x => x != null);

		if (connectionsToSendTo.length == 1 || connectionsActual.length > 1) 
		{
			// Only distribute if there's an addressee other than the sender,
			// or if the sender is the only one in the channel.

			for (var i = 0; i < connectionsActual.length; i++)
			{
				var connection = connectionsActual[i];
				connection.messageSendToClient(messageToPost);
			}
		}
	}

	userJoin(user)
	{
		this.usersConnectedNames.push(user.name);
	}

	userRemove(user)
	{
		var indexToRemoveAt = this.usersConnectedNames.indexOf(user.name);
		if (indexToRemoveAt != null)
		{
			this.usersConnectedNames.splice(indexToRemoveAt, 1);
		}
	}
}