
class AgentTabletop
{
	constructor(name, serviceUrlToConnectTo, outputStream)
	{
		this.name = name;

		var inputStream = new InputOutputStreamNull();
		this.outputStream = outputStream || inputStream;

		this.client = new Client
		(
			inputStream, outputStream, this.messageReceive.bind(this)
		);

		var agent = this;

		this.commandPrefix = "tt";

		this.client.connect
		(
			serviceUrlToConnectTo,
			this.name,
			() =>
			{
				agent.messageBodySend
				(
					"Send '" + this.commandPrefix + " start <gameTypeName>' to start a tabletop game."
				);
			}
		);

		this.tabletopInProgress = null;
	}

	messageBodySend(messageBodyToSend)
	{
		this.outputStream.writeLine("Sending: " + messageBodyToSend);
		this.client.messageBodySend(messageBodyToSend);
	}

	messageBodySendToUsersWithNames(messageBodyToSend, usersAddressedNames)
	{
		this.outputStream.writeLine("Sending privately: " + messageBodyToSend);
		this.client.messageBodySendToUsersWithNames(messageBodyToSend, usersAddressedNames);
	}

	messageReceive(messageReceived)
	{
		var userSenderName = messageReceived.userSenderName;
		var messageReceivedBody = messageReceived.body;
		var messageParts = messageReceivedBody.split(" ");
		var messagePart0 = messageParts[0];

		if (messagePart0 == this.commandPrefix)
		{
			this.outputStream.writeLine(messageReceived.toString());

			var operationName = messageParts[1];

			var messageToSendBody = null;

			if (operationName == "add")
			{
				if (this.tabletopInProgress == null)
				{
					messageToSendBody = "No game in progress!";
				}
				else if (messageParts.length < 4)
				{
					messageToSendBody =
						"Not enough arguments.  Usage: "
						+ this.commandPrefix
						+ " add <movableName> <spaceName>";
				}
				else
				{
					var movableToAddName = messageParts[2];
					var spaceToAddToName = messageParts[3];

					var movableExisting = this.tabletopInProgress.movableByName(movableToAddName);
					var spaceExisting = this.tabletopInProgress.spaceByName(spaceToAddToName);

					if (movableExisting != null)
					{
						messageToSendBody =
							"There's already a movable named " + movableToAddName + ".";
					}
					else if (spaceExisting == null)
					{
						messageToSendBody =
							"There's no space named " + spaceToAddToName + ".";
					}
					else
					{
						messageToSendBody =
							userSenderName + " adds a " + movableToAddName
							+ " to space " + spaceToAddToName + ".";
						this.tabletopInProgress.movableWithNameAddToSpaceWithName
						(
							movableToAddName, spaceToAddToName
						);
					}
				}
			}
			else if (operationName == "close")
			{
				if (this.tabletopInProgress == null)
				{
					messageToSendBody = "No game in progress to close!";
				}
				else
				{
					if (this.tabletopInProgress.isClosed())
					{
						messageToSendBody = "Game is already closed to new users!"
					}
					else
					{
						messageToSendBody = "Closing game against new users."
						this.tabletopInProgress.closeToNewUsers();
					}
				}
			}
			else if (operationName == "help")
			{
				var linesToSend =
				[
					"Usage: " + this.commandPrefix + " <command> [ <argument0> ... ]",
					"Commands:",
					"=========",
					"add <movableName> - Adds a movable by name.",
					"close - Closes the game against additional players.",
					"help - Displays this message.",
					"join - Adds the user to the game in progress.",
					"move <movableName> <spaceName> - Moves a movable to a space.",
					"quit - Ends the game in progress.",
					"remove <movableName> - Removes a movable by name.",
					"start <gameTypeName> - Starts a game of the specified type."
				]
				linesToSend.forEach(x => this.messageBodySendToUsersWithNames(x, [ userSenderName ]));
			}
			else if (operationName == "join")
			{
				if (this.tabletopInProgress == null)
				{
					messageToSendBody = "No game in progress to join!";
				}
				else
				{
					if (this.tabletopInProgress.userWithNameHasJoined(userSenderName))
					{
						messageToSendBody = userSenderName + " has already joined the game!"
					}
					else
					{
						messageToSendBody = userSenderName + " joins the game.";
						this.tabletopInProgress.userJoinWithName(userSenderName);
					}
				}
			}
			else if (operationName == "move")
			{
				if (this.tabletopInProgress == null)
				{
					messageToSendBody = "No game in progress!";
				}
				else if (messageParts.length < 4)
				{
					messageToSendBody =
						"Not enough arguments.  Usage: "
						+ this.commandPrefix
						+ " move <movableName> <spaceName>";
				}
				else
				{
					var movableToMoveName = messageParts[2];
					var spaceToMoveToName = messageParts[3];
					messageToSendBody =
						userSenderName + " moves " + movableToMoveName
						+ " to space " + spaceToMoveToName + ".";
					var wasMoveSuccessful =
						this.tabletopInProgress.moveMovableWithNameToSpaceWithName
						(
							movableToMoveName, spaceToMoveToName
						);
				}
			}
			else if (operationName == "quit")
			{
				if (this.tabletopInProgress == null)
				{
					messageToSendBody = "No game in progress to quit!";
				}
				else
				{
					this.tabletopInProgress = null;
					messageToSendBody = "Quitting game!";
				}
			}
			else if (operationName == "remove")
			{
				if (this.tabletopInProgress == null)
				{
					messageToSendBody = "No game in progress!";
				}
				else if (messageParts.length < 3)
				{
					messageToSendBody =
						"Not enough arguments.  Usage: "
						+ this.commandPrefix
						+ " remove <movableName>";
				}
				else
				{
					var movableToRemoveName = messageParts[2];

					var movableExisting =
						this.tabletopInProgress.movableByName(movableToRemoveName);

					if (movableExisting == null)
					{
						messageToSendBody =
							"There's no movable named '" + movableToRemoveName + "' to remove.";
					}
					else
					{
						messageToSendBody =
							userSenderName + " removes '" + movableToRemoveName + "'.";
						var wasMoveSuccessful =
							this.tabletopInProgress.removeMovableWithName
							(
								movableToRemoveName
							);
					}
				}
			}
			else if (operationName == "show")
			{
				if (this.tabletopInProgress == null)
				{
					messageToSendBody = "No game in progress to show!";
				}
				else
				{
					messageToSendBody = this.tabletopInProgress.show();
				}
			}
			else if (operationName == "start")
			{
				if (this.tabletopInProgress == null)
				{
					var tabletopTypeName = messageParts[2];
					if (tabletopTypeName == null)
					{
						messageToSendBody =
							"No game type specified!"
							+ "  Try '" + this.commandPrefix + " start Chess', for instance."
					}
					else
					{
						if (tabletopTypeName == "Chess")
						{
							var tabletopNew = Tabletop.chess(userSenderName);
							this.tabletopInProgress = tabletopNew;
							messageToSendBody =
								userSenderName
								+ " has started a game of '"
								+ tabletopTypeName + "'."
								+ "  Send '" + this.commandPrefix + " join' to join.";
						}
						else
						{
							messageToSendBody =
								"Unrecognized game type: "
								+ tabletopTypeName
								+ ".  Try '" + this.commandPrefix + " start Chess', for instance."
						}
					}
				}
				else
				{
					messageToSendBody =
						"Game already in progress."
						+ "  Send '" + this.commandPrefix + " quit' to quit.";
				}
			}
			else
			{
				messageToSendBody = 
					"Unrecognized " + this.comandPrefix + " command: "
					+ operationName
					+ ".  Send '" + this.commandPrefix + " help' for help.";
			}

			if (messageToSendBody != null)
			{
				this.messageBodySend(messageToSendBody);
			}
		}
		else if
		(
			messageReceived.usersAddressedNames != null
			&& messageReceived.userSenderName != this.name
		)
		{
			if (this.tabletopInProgress == null)
			{
				this.client.messageBodySend("No game in progress!");
			}
			else
			{
				// todo
			}
		}
	}
}
