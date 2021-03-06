
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

			var operationsNotRequiringTabletop =
			[
				"help", "start", "types"
			];

			if
			(
				this.tabletopInProgress == null
				&& operationsNotRequiringTabletop.indexOf(operationName) == -1
			)
			{
				messageToSendBody =
					"No game in progress!  Send '"
					+ this.commandPrefix + " types' to see options.";
			}
			else if (operationName == "add")
			{
				messageToSendBody = this.messageReceive_Command_Add(userSenderName, messageParts);
			}
			else if (operationName == "close")
			{
				messageToSendBody = this.messageReceive_Command_Close(userSenderName, messageParts);
			}
			else if (operationName == "deal")
			{
				messageToSendBody = this.messageReceive_Command_Deal(userSenderName, messageParts);
			}
			else if (operationName == "help")
			{
				this.messageReceive_Command_Help(userSenderName, messageParts);
			}
			else if (operationName == "join")
			{
				messageToSendBody = this.messageReceive_Command_Join(userSenderName, messageParts);
			}
			else if (operationName == "move")
			{
				messageToSendBody = this.messageReceive_Command_Move(userSenderName, messageParts);
			}
			else if (operationName == "quit")
			{
				this.tabletopInProgress = null;
				messageToSendBody = "Quitting game!";
			}
			else if (operationName == "remove")
			{
				messageToSendBody = this.messageReceive_Command_Remove(userSenderName, messageParts);
			}
			else if (operationName == "show")
			{
				messageToSendBody = this.messageReceive_Command_Show(userSenderName, messageParts);
			}
			else if (operationName == "shuffle")
			{
				messageToSendBody = this.messageReceive_Command_Shuffle(userSenderName, messageParts);
			}
			else if (operationName == "sort")
			{
				messageToSendBody = this.messageReceive_Command_Sort(userSenderName, messageParts);
			}
			else if (operationName == "start")
			{
				messageToSendBody = this.messageReceive_Command_Start(userSenderName, messageParts);
			}
			else if (operationName == "types")
			{
				messageToSendBody = this.messageReceive_Command_Types(userSenderName, messageParts);
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

	messageReceive_Command_Add(userSenderName, messageParts)
	{
		var messageToSendBody = null;

		if (messageParts.length < 4)
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

			var spaceExisting = this.tabletopInProgress.spaceByName(spaceToAddToName);

			if (spaceExisting == null)
			{
				messageToSendBody =
					"There's no space named " + spaceToAddToName + ".";
			}
			else
			{
				messageToSendBody =
					userSenderName + " adds '" + movableToAddName
					+ "' to space " + spaceToAddToName + ".";
				this.tabletopInProgress.movableWithNameAddToSpaceWithName
				(
					movableToAddName, spaceToAddToName
				);
			}
		}

		return messageToSendBody;
	}

	messageReceive_Command_Close(userSenderName, messageParts)
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

	messageReceive_Command_Deal(userSenderName, messageParts)
	{
		var messageBodyToSend = null;

		if (messageParts.length <= 5)
		{
			messageBodyToSend = "Not enough arguments.  Expecting 'tt deal <spaceFromName> <numberOfRounds> <spaceTo1Name> [ <spaceTo2Name>... <spaceToNName> ]'.";
		}
		else
		{
			var spaceName = messageParts[2];
			var numberOfRounds = parseInt(messageParts[3]);
			var space = this.tabletopInProgress.spaceByName(spaceName);
			if (spaceToShow == null)
			{
				messageBodyToSend =
					"No space found with name: " + spaceName + ".";
			}
			else
			{
				var spacesToNames = messageParts.slice(4);
				space.distributeToSpacesWithNames(this.tabletopInProgress, spacesToNames);
			}
		}

		this.messageBodySendToUsersWithNames(messageBodyToSend, [ userSenderName ]);
	}

	messageReceive_Command_Help(userSenderName, messageParts)
	{
		var linesToSend =
		[
			"",
			"Usage: " + this.commandPrefix + " <command> [ <argument0> ... ]",
			"Commands:",
			"=========",
			"add <movableName> - Adds a movable by name.",
			"close - Closes the game against additional players.",
			"deal <spaceName> <numberOfRounds> <spaceTo1Name> [...<spaceToNName> ] - Distributes movables in space to other spaces.",
			"help - Displays this message.",
			"join - Adds the user to the game in progress.",
			"move <movableName> <spaceName> - Moves a movable to a space.",
			"quit - Ends the game in progress.",
			"remove <movableName> <spaceName> - Removes a movable by name and space.",
			"show [<spaceName>] - Shows the tabletop, or the contents of a space.",
			"shuffle <spaceName> - Randomizes the order of movables in the space.",
			"sort <spaceName> - Sorts the movables in a space.",
			"start <gameTypeName> - Starts a game of the specified type.",
			"types - Lists the types of game available."
		];
		var newline = "\n";
		var linesToSendJoined = linesToSend.join(newline); 
		this.messageBodySendToUsersWithNames(linesToSendJoined, [ userSenderName ]);
	}

	messageReceive_Command_Join(userSenderName)
	{
		var messageToSendBody = null;

		if (this.tabletopInProgress.userWithNameHasJoined(userSenderName))
		{
			messageToSendBody = userSenderName + " has already joined the game!"
		}
		else
		{
			messageToSendBody = userSenderName + " joins the game.";
			this.tabletopInProgress.userJoinWithName(userSenderName);
		}

		return messageToSendBody;
	}

	messageReceive_Command_Move(userSenderName, messageParts)
	{
		var messageToSendBody = null;

		var movableToMoveName = messageParts[2];
		var spaceToMoveFromName = messageParts[3];
		var spaceToMoveToName = messageParts[4];

		if (messageParts.length < 5)
		{
			messageToSendBody =
				"Not enough arguments.  Usage: "
				+ this.commandPrefix
				+ " move <movableName> <spaceFromName> <spaceToName>";
		}
		else // if (messageParts.length >= 5)
		{
			// Works even the movable doesn't have a unique name.
			messageToSendBody =
				userSenderName + " moves " + movableToMoveName
				+ " from space " + spaceToMoveFromName
				+ " to space " + spaceToMoveToName + ".";
			var wasMoveSuccessful =
				this.tabletopInProgress.moveMovableWithNameFromSpaceWithNameToSpaceWithName
				(
					movableToMoveName, spaceToMoveFromName, spaceToMoveToName
				);
		}

		return messageToSendBody;
	}

	messageReceive_Command_Remove(userSenderName, messageParts)
	{
		var messageToSendBody = null;

		if (messageParts.length < 4)
		{
			messageToSendBody =
				"Not enough arguments.  Usage: "
				+ this.commandPrefix
				+ " remove <movableName> <spaceName>";
		}
		else
		{
			var movableToRemoveName = messageParts[2];
			var spaceToRemoveFromName = messageParts[3];

			var movableExisting =
				this.tabletopInProgress.movableByNameAndSpaceName
				(
					movableToRemoveName, spaceToRemoveFromName
				);

			if (movableExisting == null)
			{
				messageToSendBody =
					"There's no movable named " + movableToRemoveName
					+ " in space " + spaceToRemoveFromName + " to remove.";
			}
			else
			{
				messageToSendBody =
					userSenderName + " removes "
					+ movableToRemoveName
					+ " from space " + spaceToRemoveFromName + ".";
				var wasMoveSuccessful =
					this.tabletopInProgress.removeMovableWithNameFromSpaceWithName
					(
						movableToRemoveName, spaceToRemoveFromName
					);
			}
		}

		return messageToSendBody;
	}

	messageReceive_Command_Show(userSenderName, messageParts)
	{
		var messageBodyToSend = null;

		if (messageParts.length <= 2)
		{
			// No arguments, so show the whole tabletop.
			var tabletopAsString = this.tabletopInProgress.show();
			messageBodyToSend = tabletopAsString;
		}
		else if (messageParts.length == 3)
		{
			var spaceToShowName = messageParts[2];
			var spaceToShow = this.tabletopInProgress.spaceByName(spaceToShowName);
			if (spaceToShow == null)
			{
				messageBodyToSend =
					"No space found with name: " + spaceToShowName + ".";
			}
			else
			{
				messageBodyToSend = spaceToShow.describe(this.tabletopInProgress);
			}
		}
		else
		{
			var spaceName = messageParts[2];
			var space = this.tabletopInProgress.spaceByName(spaceName);
			if (space == null)
			{
				messageBodyToSend =
					"No space found with name: " + spaceName + ".";
			}
			else
			{
				var movableToShowName = messageParts[3];
				var movableToShow = this.tabletopInProgress.movableByNameAndSpaceName
				(
					movableToShowName, spaceName
				);
				if (movableToShow != null)
				{
					messageBodyToSend = movableToShow.describe(this.tabletopInProgress);
				}
				else
				{
					messageBodyToSend =
						"No movable found in space " + spaceName
						+ " with name: " + movableToShowName + ".";
				}
			}
		}

		this.messageBodySendToUsersWithNames(messageBodyToSend, [ userSenderName ]);
	}

	messageReceive_Command_Shuffle(userSenderName, messageParts)
	{
		var messageBodyToSend = null;

		if (messageParts.length <= 2)
		{
			messageBodyToSend = "Expecting a space name, like 'tt show <spaceName>'.";
		}
		else
		{
			var spaceName = messageParts[2];
			var space = this.tabletopInProgress.spaceByName(spaceName);
			if (spaceToShow == null)
			{
				messageBodyToSend =
					"No space found with name: " + spaceName + ".";
			}
			else
			{
				space.shuffle();
			}
		}

		this.messageBodySendToUsersWithNames(messageBodyToSend, [ userSenderName ]);
	}

	messageReceive_Command_Sort(userSenderName, messageParts)
	{
		var messageBodyToSend = null;

		if (messageParts.length <= 2)
		{
			messageBodyToSend = "Expecting a space name, like 'tt show <spaceName>'.";
		}
		else
		{
			var spaceName = messageParts[2];
			var space = this.tabletopInProgress.spaceByName(spaceName);
			if (spaceToShow == null)
			{
				messageBodyToSend =
					"No space found with name: " + spaceName + ".";
			}
			else
			{
				space.sort(this.tabletopInProgress);
			}
		}

		this.messageBodySendToUsersWithNames(messageBodyToSend, [ userSenderName ]);
	}

	messageReceive_Command_Start(userSenderName, messageParts)
	{
		var messageToSendBody = null;

		if (this.tabletopInProgress != null)
		{
			messageToSendBody =
				"Game already in progress."
				+ "  Send '" + this.commandPrefix + " quit' to quit.";
		}
		else
		{
			var tabletopTypeName = messageParts[2];
			if (tabletopTypeName == null)
			{
				messageToSendBody =
					"No game type specified!"
					+ "  Send '" + this.commandPrefix + " types' for options."
			}
			else if (tabletopTypeName == "cards")
			{
				var numberOfPlayersAsString = messageParts[2];
				if (numberOfPlayersAsString == null)
				{
					messageToSendBody =
						"No number of players specified!"
						+ "  Send '" + this.commandPrefix + " cards <numberOfPlayers>' instead."
				}
				else
				{
					var numberOfPlayers = parseInt(numberOfPlayers);
					if (numberOfPlayers == null)
					{
						messageToSendBody =
							"Invalid number of players specified!"
							+ "  Send '" + this.commandPrefix + " cards <numberOfPlayers>' instead."
					}
					else
					{
						var tabletopNew = Tabletop.cards(userSenderName, numberOfPlayers);
						this.tabletopInProgress = tabletopNew;
						messageToSendBody =
							userSenderName
							+ " has started a game of '"
							+ tabletopTypeName + "'."
							+ "  Send '" + this.commandPrefix + " join' to join.";
					}
				}
			}
			else if (tabletopTypeName == "chess")
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
					+ ".  Send '" + this.commandPrefix + " types' for options."
			}
		}

		return messageToSendBody;
	}

	messageReceive_Command_Types(userSenderName, messageParts)
	{
		var linesToSend =
		[
			"",
			"Games Available:",
			"================",
			"cards",
			"chess",
			"",
			"Send '" + this.commandPrefix + " start <gameTypeName>' to start a game.",
		];
		var newline = "\n";
		var linesToSendJoined = linesToSend.join(newline);
		this.messageBodySendToUsersWithNames(linesToSendJoined, [ userSenderName ]);
	}

}
